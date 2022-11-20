# Concurrency With grammY runner (`runner`)

This package can be used if you run your bot [using long polling](../guide/deployment-types.md), and you want messages to be processed concurrently.

> Make sure to understand [Scaling Up II](../advanced/scaling.md#long-polling) before you use grammY runner.

## Why We Need a Bot Runner

If you are hosting your bot using long polling and you want to make it scale up, there is no way around processing updates concurrently as sequential update processing is way too slow.
As a result, bots face a number of challenges.

- Are there race conditions?
- Can we still `await` the middleware stack? We must have this for error handling!
- What if middleware never resolves for some reason, does this block the bot?
- Can we constrain the server load?

As you can see, we need a solution that can solve all of the above problems to achieve proper long polling for a bot.
This is a problem that is very distinct from composing middleware or sending messages to Telegram.
Consequently, it is not solved by the grammY core package.
Instead, you can use [grammY runner](https://github.com/grammyjs/runner).
It has its own [API Reference](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts), too.

## Usage

Here is a simple example.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";
import { run } from "@grammyjs/runner";

// Create a bot.
const bot = new Bot("<token>");

// Add the usual middleware, yada yada
bot.on("message", (ctx) => ctx.reply("Got your message."));

// Run it concurrently!
run(bot);
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```ts
const { Bot } = require("grammy");
const { run } = require("@grammyjs/runner");

// Create a bot.
const bot = new Bot("<token>");

// Add the usual middleware, yada yada
bot.on("message", (ctx) => ctx.reply("Got your message."));

// Run it concurrently!
run(bot);
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { run } from "https://deno.land/x/grammy_runner/mod.ts";

// Create a bot.
const bot = new Bot("<token>");

// Add the usual middleware, yada yada
bot.on("message", (ctx) => ctx.reply("Got your message."));

// Run it concurrently!
run(bot);
```

</CodeGroupItem>
</CodeGroup>

Of course, while this looks very simple, a lot is going on under the hood.

## How It Works Behind the Scenes

Every runner consists of three different parts.

1. The **source** pulls in updates from Telegram.
2. The **sink** supplies the bot instance with updates.
3. The **runner** component connects source and sink, and allows you to start and stop your bot.

```asciiart:no-line-numbers
api.telegram.org <—> source <—> runner <—> sink <—> bot
```

### Source

grammY runner ships with one default source that can operate on any `UpdateSupplier` ([API reference](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/UpdateSupplier)).
Such an update supplier is straightforward to create from a bot instance.
If you want make one yourself, be sure to check out `createUpdateFetcher` ([API reference](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/createUpdateFetcher)).

The source is an async iterator of update batches, but it can be active or inactive, and you can `close` it in order to disconnect from the Telegram servers.

### Sink

grammY runner ships with three possible sink implementations, a sequential one (same behavior as `bot.start()`), a batched one (mainly useful for backwards compatibility with other frameworks), and a fully concurrent one (used by `run`).
All of them operate on `UpdateConsumer` objects ([API reference](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/UpdateConsumer)) which are straightforward to create from a bot instance.
If you want make one yourself, be sure to check out `handleUpdate` on the `Bot` instance of grammY ([API reference](/ref/core/Bot.md#handleUpdate)).

The sink contains a queue ([API reference](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/DecayingDeque)) of individual updates that are currently being processed.
Adding new updates to the queue will immediately make the update consumer handle them, and return a promise that resolves as soon as there is capacity in the queue again.
The resolved integral number determines the free space.
Setting a concurrency limit for the grammY runner is therefore respected through the underlying queue instance.

The queue also throws out updates that take too long processing, and you can specify a `timeoutHandler` when creating the respective sink.
Of course, you should also provide an error handler when creating a sink.

If you're using `run(bot)`, the error handler from `bot.catch` will be used.

### Runner

The runner is a plain loop that pulls in updates from the source and supplies them to the sink.
Once the sink has space again, the runner will fetch the next batch of updates from the source.

When you create a runner with `createRunner` ([API reference](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/createRunner)), you obtain a handle that you can use to control the runner.
For instance, it allows you start and stop it, or obtain a promise that resolves if the runner stops.
(This handle is also returned by `run`.)
Check out the [API reference](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/RunnerHandle) of the `RunnerHandle`.

## Sequential Processing Where Necessary

Most likely, you want to be guaranteed that messages from the same chat are processed in order.
This is useful when installing [session middleware](./session.md), but it also makes sure that your bot does not confuse the order of messages in the same chat.

grammY runner exports the `sequentialize` middleware that takes care of this.
You can check out [this section](../advanced/scaling.md#concurrency-is-hard) to learn how to use it.

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

## Graceful shutdown

In order for the bot to complete it's work correctly you [should signal](../advanced/reliability.md#using-grammy-runner) it to stop when the process is about to be destroyed.

## Plugin Summary

- Name: `runner`
- Source: <https://github.com/grammyjs/runner>
- Reference: <https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts>
