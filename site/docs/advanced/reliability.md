---
prev: ./scaling.md
next: ./flood.md
---

# Scaling Up III: Reliability

If you made sure you have proper [error handling](../guide/errors.md) for your bot, you are basically good to go.
All errors that should be expected to happen (failing API calls, failing network requests, failing database queries, failing middleware, etc) are all caught.

You should make sure to always `await` all promises, or at least call `catch` on them if you ever don't want to `await` stuff.
Use a linting rule to make sure you cannot forget this.

## Graceful Shutdown

For bots that are using long polling, there is one more thing to consider.
As you are going to stop your instance during operation at some point again, you should consider catching `SIGTERM` and `SIGINT` events, and call `bot.stop` (built-in long polling) or stop your bot via its [handle](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/RunnerHandle#stop) (grammY runner):

### Simple Long Polling

<CodeGroup>

<CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";

const bot = new Bot("<token>");

// Stopping the bot when Node process
// is about to be terminated
process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

await bot.start();
```

</CodeGroupItem>

<CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");

const bot = new Bot("<token>");

// Stopping the bot when Node process
// is about to be terminated
process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

await bot.start();
```

</CodeGroupItem>

<CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot("<token>");

// Stopping the bot when Node process
// is about to be terminated
Deno.addSignalListener("SIGINT", () => bot.stop());
Deno.addSignalListener("SIGTERM", () => bot.stop());

await bot.start();
```

</CodeGroupItem>
</CodeGroup>

### Using grammY runner

<CodeGroup>

<CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";
import { run } from "@grammyjs/runner";

const bot = new Bot("<token>");

const runner = run(bot);

// Stopping the bot when Node process
// is about to be terminated
const stopRunner = () => runner.isRunning() && runner.stop();
process.once("SIGINT", stopRunner);
process.once("SIGTERM", stopRunner);
```

</CodeGroupItem>

<CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");
const { run } = require("@grammyjs/runner");

const bot = new Bot("<token>");

const runner = run(bot);

// Stopping the bot when Node process
// is about to be terminated
const stopRunner = () => runner.isRunning() && runner.stop();
process.once("SIGINT", stopRunner);
process.once("SIGTERM", stopRunner);
```

</CodeGroupItem>
<CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { run } from "https://deno.land/x/grammy_runner/mod.ts";

const bot = new Bot("<token>");

const runner = run(bot);

// Stopping the bot when Node process
// is about to be terminated
const stopRunner = () => runner.isRunning() && runner.stop();
Deno.addSignalListener("SIGINT", stopRunner);
Deno.addSignalListener("SIGTERM", stopRunner);
```

</CodeGroupItem>
</CodeGroup>

That's basically all there is to reliability, your instance should:registered: never:tm: crash now.

## Reliability Guarantees

What if your bot is processing financial transactions and you must consider a `kill -9` scenario where the CPU physically breaks or there is a power outage in the data center?
If for some reason someone or something actually hard-kills the process, it gets a bit more complicated.

In essence, bots cannot guarantee an _exactly once_ execution of your middleware.
Read [this discussion on GitHub](https://github.com/tdlib/telegram-bot-api/issues/126) in order to learn more about **why** your bot could send duplicate messages (or none at all) in extremely rare cases.
The remainder of this section is elaborating on **how** grammY behaves under these unusual circumstances, and how to handle these situations.

> Do you just care about coding a Telegram bot? [Skip the rest of this page.](./flood.md)

If you are running your bot on webhooks, the Bot API server will retry delivering updates to your bot if it does not respond with OK in time.
That pretty much defines the behavior of the system comprehensively—if you need to prevent processing duplicate updates, you should build your own de-duplication based on `update_id`.
grammY does not do this for you, but feel free to PR if you think someone else could profit from this.

Long polling is more interesting.
The built-in polling basically re-runs the most recent update batch that was fetched but could not complete.
(Note that if you properly stop your bot with `bot.stop`, the update offset will be synced with the Telegram servers by calling `getUpdates` with the correct offset but without processing the update data).
In other words, you will never loose any updates, however, it may happen that you re-process up to 100 updates that you have seen before.
As calls to `sendMessage` are not idempotent, users may receive duplicate messages from your bot.
However, _at least once_ processing is guaranteed.

If you are using the [grammY runner](../plugins/runner.md) in concurrent mode, the next `getUpdates` call is potentially performed before your middleware processes the first update of the current batch.
Thus, the update offset is [confirmed](https://core.telegram.org/bots/api#getupdates) prematurely.
This is the cost of heavy concurrency, and unfortunately, it cannot be avoided without reducing both throughput and responsiveness.
As a result, if your instance is killed in the right (wrong) moment, it could happen that up to 100 updates cannot be fetched again because Telegram regards them as confirmed.
This leads to data loss.
If it is crucial to prevent this, you should use the sources and sinks of the grammY runner package to compose your own update pipeline that passes all updates through a message queue first.
You'd basically have to create a [sink](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/UpdateSink) that pushes to the queue, and start one runner that only supplies your message queue.
You'd then have to create a [source](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/UpdateSource) that pulls from the message queue again.
You will effectively run two different instances of the grammY runner.
This vague draft described above has only been sketched but not implemented, according to our knowledge.
Please [take contact with the Telegram group](https://t.me/grammyjs) if you have any question or if you attempt this and can share your progress.

On the other hand, if your bot is under heavy load and the update polling is slowed down due to [the automatic load constraints](../plugins/runner.md#sink), chances are increasing that some updates will be fetched again, which leads to duplicate messages again.
Thus, the price of full concurrency is that neither _at least once_ nor _at most once_ processing can be guaranteed.
