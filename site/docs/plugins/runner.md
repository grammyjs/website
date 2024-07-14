---
prev: false
next: false
---

# Concurrency With grammY runner (`runner`)

This package can be used if you run your bot [using long polling](../guide/deployment-types), and you want messages to be processed concurrently.

> Make sure to understand [Scaling Up II](../advanced/scaling#long-polling) before you use grammY runner.

## Why We Need a Bot Runner

If you are hosting your bot using long polling and you want to make it scale up, there is no way around processing updates concurrently as sequential update processing is way too slow.
As a result, bots face a number of challenges.

- Are there race conditions?
- Can we still `await` the middleware stack? We must have this for error handling!
- What if middleware never resolves for some reason, does this block the bot?
- Can we process some selected updates in sequence?
- Can we constrain the server load?
- Can we process updates on multiple cores?

As you can see, we need a solution that can solve all of the above problems to achieve proper long polling for a bot.
This is a problem that is very distinct from composing middleware or sending messages to Telegram.
Consequently, it is not solved by the grammY core package.
Instead, you can use [grammY runner](https://github.com/grammyjs/runner).
It has its own [API Reference](/ref/runner/), too.

## Usage

Here is a simple example.

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { run } from "@grammyjs/runner";

// Create a bot.
const bot = new Bot("");

// Add the usual middleware, yada yada
bot.on("message", (ctx) => ctx.reply("Got your message."));

// Run it concurrently!
run(bot);
```

```js [JavaScript]
const { Bot } = require("grammy");
const { run } = require("@grammyjs/runner");

// Create a bot.
const bot = new Bot("");

// Add the usual middleware, yada yada
bot.on("message", (ctx) => ctx.reply("Got your message."));

// Run it concurrently!
run(bot);
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { run } from "https://deno.land/x/grammy_runner/mod.ts";

// Create a bot.
const bot = new Bot("");

// Add the usual middleware, yada yada
bot.on("message", (ctx) => ctx.reply("Got your message."));

// Run it concurrently!
run(bot);
```

:::

## Sequential Processing Where Necessary

Most likely, you want to be guaranteed that messages from the same chat are processed in order.
This is useful when installing [session middleware](./session), but it also makes sure that your bot does not confuse the order of messages in the same chat.

grammY runner exports the `sequentialize` middleware that takes care of this.
You can check out this [section](../advanced/scaling#concurrency-is-hard) to learn how to use it.

We are now going to look at more advanced usage of the plugin.

The supplied constraint function can be used not only to specify chat identifier, or user identifier.
Instead, you can return _a list of constraint identifier strings_ that determine for every update individually what other computations it must wait for before processing can begin.

As an example, you could return both the chat identifier, and the user identifier of the message author.

```ts
bot.use(sequentialize((ctx) => {
  const chat = ctx.chat?.id.toString();
  const user = ctx.from?.id.toString();
  return [chat, user].filter((con) => con !== undefined);
}));
```

This would make sure that messages in the same chat are ordered correctly.
In addition, if Alice sends message in a group, and then sends a message to your bot in the private chat, then these two messages are ordered correctly.

In a sense, you can therefore specify a graph of dependencies between updates.
grammY runner will resolve all necessary constraints on the fly and block those updates as long as necessary to ensure correct message ordering.

The implementation of this is very efficient.
It needs constant memory (unless you specify infinite concurrency), and it needs (amortized) constant processing time per update.

## Graceful Shutdown

In order for the bot to complete its work correctly, you [should signal it](../advanced/reliability#using-grammy-runner) to stop when the process is about to be destroyed.

Note that you can wait for the runner to terminate by `await`ing the `task` in the [`RunnerHandle`](/ref/runner/runnerhandle) returned from `run`.

```ts
const handle = run(bot);

handle.task().then(() => {
  console.log("Bot done processing!");
});
```

## Advanced Options

grammY runner consists of three things: a source, a sink, and a runner.
The source pulls in updates, the sink consumes updates, and the runner configures and connects the two.

> An in-depth description on how the runner works internally can be found [down here](#how-it-works-behind-the-scenes).

Each of these three parts can be configured through various options.
This can reduce the network traffic, let you specify allowed updates, and more.

Each part of the runner accepts its configuration through a dedicated options object.

```ts
run(bot, {
  source: {},
  runner: {},
  sink: {},
});
```

You should check out the `RunOptions` in the [API reference](/ref/runner/runoptions) to see which options are available.

For example, you will there find out that `allowed_updates` can be enabled using the following code snippet.

```ts
run(bot, { runner: { fetch: { allowed_updates: [] } } });
```

## Multithreading

> There is no point to multithreading if your bot does not process at least 50 million updates per day (>500 per second).
> [Skip this section](#how-it-works-behind-the-scenes) if your bot handles less traffic than that.

JavaScript is single-threaded.
This is amazing because [concurrency is hard](../advanced/scaling#concurrency-is-hard), meaning that if there is only a single thread, a lot of headache is naturally removed.

However, if your bot has an extremely high load (we are talking about 1000 updates per second and up), then doing everything on a single core might not be enough anymore.
Basically, a single core will start struggling with the JSON processing of all the messages your bot has to handle.

### Bot Workers for Update Handling

There is a simple way out: bot workers!
grammY runner lets you create several workers which can process your updates in parallel on actually different cores (using different event loops and with separate memory).

On Node.js, grammY runner uses [Worker Threads](https://nodejs.org/api/worker_threads.html).
On Deno, grammY runner uses [Web Workers](https://docs.deno.com/runtime/manual/runtime/workers).

Conceptually, grammY runner provides you with a class called `BotWorker` which can handle updates.
It is equivalent to the regular class `Bot` (in fact, it even `extends Bot`).
The main difference between `BotWorker` and `Bot` is that `BotWorker` cannot fetch updates.
Instead, it has to receive them from a regular `Bot` that controls its workers.

```asciiart:no-line-numbers
1. fetch updates                                 Bot
                                              __// \\__
                                           __/  /   \  \__
2. send updates to workers              __/    /     \    \__
                                     __/      /       \      \__
                                    /        /         \        \
3. process updates          BotWorker   BotWorker   BotWorker   BotWorker
```

grammY runner provides you with middleware that can send updates to bot workers.
The bot workers can then receive this update and handle it.
This way, the central bot only has to concern itself with pulling in and distributing updates among the bot workers it orchestrates.
The actual update handling (filtering messages, sending replies, etc.) is performed by the bot workers.

Let's now see how this can be used.

### Using Bot Workers

> Examples of this can be found in the [grammY runner repository](https://github.com/grammyjs/runner/tree/main/examples).

We will start out by creating the central bot instance that fetches updates and distributes them among workers.
Let's start by creating a file called `bot.ts` with the following content.

::: code-group

```ts [TypeScript]
// bot.ts
import { Bot } from "grammy";
import { distribute, run } from "@grammyjs/runner";

// Create the bot.
const bot = new Bot(""); // <-- put your bot token between the ""

// Optionally, sequentialize updates here.
// bot.use(sequentialize(...))

// Distribute the updates among bot workers.
bot.use(distribute(__dirname + "/worker"));

// Run the bot concurrently with multi-threading.
run(bot);
```

```js [JavaScript]
// bot.js
const { Bot } = require("grammy");
const { distribute, run } = require("@grammyjs/runner");

// Create the bot.
const bot = new Bot(""); // <-- put your bot token between the ""

// Optionally, sequentialize updates here.
// bot.use(sequentialize(...))

// Distribute the updates among bot workers.
bot.use(distribute(__dirname + "/worker"));

// Run the bot concurrently with multi-threading.
run(bot);
```

```ts [Deno]
// bot.ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { distribute, run } from "https://deno.land/x/grammy_runner/mod.ts";

// Create the bot.
const bot = new Bot(""); // <-- put your bot token between the ""

// Optionally, sequentialize updates here.
// bot.use(sequentialize(...))

// Distribute the updates among bot workers.
bot.use(distribute(new URL("./worker.ts", import.meta.url)));

// Run the bot concurrently with multi-threading.
run(bot);
```

:::

Next to `bot.ts`, we create a second file called `worker.ts` (as specified on line 12 in the code above).
This will contain the actual bot logic.

::: code-group

```ts [TypeScript]
// worker.ts
import { BotWorker } from "@grammyjs/runner";

// Create a new bot worker.
const bot = new BotWorker(""); // <-- pass your bot token here again

// Add message handling logic.
bot.on("message", (ctx) => ctx.reply("yay!"));
```

```js [JavaScript]
// worker.js
const { BotWorker } = require("@grammyjs/runner");

// Create a new bot worker.
const bot = new BotWorker(""); // <-- pass your bot token here again

// Add message handling logic.
bot.on("message", (ctx) => ctx.reply("yay!"));
```

```ts [Deno]
// worker.ts
import { BotWorker } from "https://deno.land/x/grammy_runner/mod.ts";

// Create a new bot worker.
const bot = new BotWorker(""); // <-- pass your bot token here again

// Add message handling logic.
bot.on("message", (ctx) => ctx.reply("yay!"));
```

:::

> Note that each worker is able to send messages back to Telegram.
> This is why you must give your bot token to each worker, too.

You do not have to start the bot workers, or export anything from the file.
It is enough to create an instance of `BotWorker`.
It will listen for updates automatically.

It is important to understand that **only the raw updates** are sent to bot workers.
In other words, the [context objects](../guide/context) are created twice for each update: once in `bot.ts` so it can be distributed to a bot worker, and once in `worker.ts` so it can actually be handled.
What's more: the properties that are installed on the context object in `bot.ts` are not sent to the bot workers.
This means that all plugins must be installed in the bot workers.

::: tip Distribute Only Some Updates
As a performance optimization, you can drop updates that you do not want to handle.
That way, your bot does not have to send the update to a worker, only for it to be ignored there.

::: code-group

```ts [Node.js]
// Our bot only handles messages, edits, and callback queries,
// so we can ignore all other updates and not distribute them.
bot.on(
  ["message", "edited_message", "callback_query"],
  distribute(__dirname + "/worker"),
);
```

```ts [Deno]
// Our bot only handles messages, edits, and callback queries,
// so we can ignore all other updates and not distribute them.
bot.on(
  ["message", "edited_message", "callback_query"],
  distribute(new URL("./worker.ts", import.meta.url)),
);
```

:::

By default, `distribute` creates 4 bot workers.
You can easily adjust this number.

```ts
// Distribute updates among 8 bot workers.
bot.use(distribute(workerFile, { count: 8 }));
```

Note that your application should never spawn more threads than there are physical cores on your CPU.
This will not improve performance, but rather degrade it.

## How It Works Behind the Scenes

Of course, while using grammY runner looks very simple, a lot is going on under the hood.

Every runner consists of three different parts.

1. The **source** pulls in updates from Telegram.
2. The **sink** supplies the bot instance with updates.
3. The **runner** component connects source and sink, and allows you to start and stop your bot.

```asciiart:no-line-numbers
api.telegram.org <—> source <—> runner <—> sink <—> bot
```

### Source

grammY runner ships with one default source that can operate on any `UpdateSupplier` ([API reference](/ref/runner/updatesupplier)).
Such an update supplier is straightforward to create from a bot instance.
If you want make one yourself, be sure to check out `createUpdateFetcher` ([API reference](/ref/runner/createupdatefetcher)).

The source is an async iterator of update batches, but it can be active or inactive, and you can `close` it in order to disconnect from the Telegram servers.

### Sink

grammY runner ships with three possible sink implementations, a sequential one (same behavior as `bot.start()`), a batched one (mainly useful for backwards compatibility with other frameworks), and a fully concurrent one (used by `run`).
All of them operate on `UpdateConsumer` objects ([API reference](/ref/runner/updateconsumer)) which are straightforward to create from a bot instance.
If you want make one yourself, be sure to check out `handleUpdate` on the `Bot` instance of grammY ([API reference](/ref/core/bot#handleupdate)).

The sink contains a queue ([API reference](/ref/runner/decayingdeque)) of individual updates that are currently being processed.
Adding new updates to the queue will immediately make the update consumer handle them, and return a promise that resolves as soon as there is capacity in the queue again.
The resolved integral number determines the free space.
Setting a concurrency limit for the grammY runner is therefore respected through the underlying queue instance.

The queue also throws out updates that take too long processing, and you can specify a `timeoutHandler` when creating the respective sink.
Of course, you should also provide an error handler when creating a sink.

If you're using `run(bot)`, the error handler from `bot.catch` will be used.

### Runner

The runner is a plain loop that pulls in updates from the source and supplies them to the sink.
Once the sink has space again, the runner will fetch the next batch of updates from the source.

When you create a runner with `createRunner` ([API reference](/ref/runner/createrunner)), you obtain a handle that you can use to control the runner.
For instance, it allows you start and stop it, or obtain a promise that resolves if the runner stops.
(This handle is also returned by `run`.)
Check out the [API reference](/ref/runner/runnerhandle) of the `RunnerHandle`.

### The `run` Function

The `run` function does a few things to help you use the above structure with ease.

1. It creates an update supplier from your bot.
2. It creates a [source](#source) from the update supplier.
3. It creates an update consumer from your bot.
4. It creates a [sink](#sink) from the update consumer.
5. It creates a [runner](#runner) from the source and the sink.
6. It starts the runner.

The handle of the created runner is returned, which lets you control the runner.

## Plugin Summary

- Name: `runner`
- [Source](https://github.com/grammyjs/runner)
- [Reference](/ref/runner/)
