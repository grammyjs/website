---
prev:
  link: ./structuring
next:
  link: ./reliability
---

# Scaling Up II: High Load

Making your bot able to handle high load depends on whether you run your bot [via long polling or via webhooks](../guide/deployment-types).
Either way, you should read up on some pitfalls [below](#concurrency-is-hard).

## Long Polling

Most bots never need to process more than a handful of messages per minute (during "peak load").
In other words, scalability is not a concern for them.
In order to be predictable, grammY is processing updates sequentially.
This is the order of operations:

1. Fetch up to 100 updates via `getUpdates` ([Telegram Bot API Reference](https://core.telegram.org/bots/api#getupdates))
2. For every update, `await` the middleware stack for it

However, if your bot processes one message per second (or something like that) during load peaks, this can begin to impact the responsiveness negatively.
For instance, the message of Bob has to wait until the message of Alice is done processing.

This can be solved by not waiting for Alice's message to be done processing, i.e. processing both messages concurrently.
In order to achieve maximum responsiveness, we'd also like to pull in new messages while the messages of Bob and Alice are still processing.
Ideally, we would also like to limit the concurrency to some fixed number to constrain the maximum server load.

Concurrent processing is not shipped with the grammY core package.
Instead, **the [grammY runner](../plugins/runner) package can be used** to run your bot.
It supports all of the above out of the box, and it is extremely simple to use.

```ts
// Previously
bot.start();

// With grammY runner, which exports `run`.
run(bot);
```

The default concurrency limit is 500.
If you want to dig deeper into the package, check out this [page](../plugins/runner).

Concurrency is hard, so check out the [subsection below](#concurrency-is-hard) to find out what you should keep in mind when using grammY runner.

## Webhooks

If you run your bot on webhooks, it will automatically process updates concurrently as soon as they are received.
Naturally, in order for this to work well under high load, you should make yourself familiar with [using webhooks](../guide/deployment-types#how-to-use-webhooks).
This means that you still have to be aware of some consequences of concurrency, confer the [subsection below](#concurrency-is-hard).

Also, [remember that](../guide/deployment-types#ending-webhook-requests-in-time) Telegram will deliver updates from the same chat in sequence, but updates from different chats concurrently.

## Concurrency Is Hard

If your bot processes all updates concurrently, this can cause a number of problems that need special attention.
For example, if two messages from the same chat end up being received by the same `getUpdates` call, they would be processed concurrently.
The order of messages inside the same chat can no longer be guaranteed.

The main point where this can clash is when you use [sessions](../plugins/session), which may run into a write-after-read hazard.
Imagine this sequence of events:

1. Alice sends message A
2. Bot begins processing A
3. Bot reads session data for Alice from database
4. Alice sends message B
5. Bot begins processing B
6. Bot reads session data for Alice from database
7. Bot is done processing A, and writes new session to database
8. Bot is done processing B, and writes new session to database, hence overwriting the changes performed during processing A.
   Data loss due to WAR hazard!

> Note: You could try to use database transactions for your sessions, but then you can only detect the hazard and not prevent it.
> Trying to use a lock instead would effectively eliminate all concurrency.
> It is much easier to avoid the hazard in the first place.

Most other session systems of web frameworks simply accept the risk of race conditions, as they do not happen too frequently on the web.
However, we do not want this because Telegram bots are much more likely to experience clashes of parallel requests for the same session key.
Hence, we have to make sure that updates that access the same session data are processed in sequence in order to avoid this dangerous race condition.

grammY runner ships with `sequentialize()` middleware which makes sure that updates that clash are processed in sequence.
You can configure it with the very same function that you use to determine the session key.
It will then avoid the above race condition by slowing down those (and only those) updates that would cause a collision.

:::code-group

```ts [TypeScript]
import { Bot, Context, session } from "grammy";
import { run, sequentialize } from "@grammyjs/runner";

// Create a bot.
const bot = new Bot("");

// Build a unique identifier for the `Context` object.
function getSessionKey(ctx: Context) {
  return ctx.chat?.id.toString();
}

// Sequentialize before accessing session data!
bot.use(sequentialize(getSessionKey));
bot.use(session({ getSessionKey }));

// Add the usual middleware, now with safe session support.
bot.on("message", (ctx) => ctx.reply("Got your message."));

// Still run it concurrently!
run(bot);
```

```js [JavaScript]
const { Bot, Context, session } = require("grammy");
const { run, sequentialize } = require("@grammyjs/runner");

// Create a bot.
const bot = new Bot("");

// Build a unique identifier for the `Context` object.
function getSessionKey(ctx) {
  return ctx.chat?.id.toString();
}

// Sequentialize before accessing session data!
bot.use(sequentialize(getSessionKey));
bot.use(session({ getSessionKey }));

// Add the usual middleware, now with safe session support.
bot.on("message", (ctx) => ctx.reply("Got your message."));

// Still run it concurrently!
run(bot);
```

```ts [Deno]
import { Bot, Context, session } from "https://deno.land/x/grammy/mod.ts";
import { run, sequentialize } from "https://deno.land/x/grammy_runner/mod.ts";

// Create a bot.
const bot = new Bot("");

// Build a unique identifier for the `Context` object.
function getSessionKey(ctx: Context) {
  return ctx.chat?.id.toString();
}

// Sequentialize before accessing session data!
bot.use(sequentialize(getSessionKey));
bot.use(session({ getSessionKey }));

// Add the usual middleware, now with safe session support.
bot.on("message", (ctx) => ctx.reply("Got your message."));

// Still run it concurrently!
run(bot);
```

:::

Feel free to join the [Telegram chat](https://t.me/grammyjs) to discuss how to use grammY runner with your bot.
We are always happy to hear from people who maintain large bots so we can improve grammY based on their experience with the package.
