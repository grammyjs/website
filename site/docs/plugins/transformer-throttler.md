# Flood control (`transformer-throttler`)

This plugin enqueues outgoing API requests instance via [Bottleneck](https://github.com/SGrondin/bottleneck) in order to prevent your bot from hitting [rate limits](https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this) as described in [this advanced section](/advanced/flood.md) of the documentation.

::: warning Undocumented api limits exists
Telegram implements unspecified and undocumented rate limits for some api calls.
These undocumented limits are **not accounted for** by the throttler.
Consider using the [auto-retry plugin](./auto-retry.md) together with this plugin, if you are experiencing floodwait errors for certain api calls.
:::

## Usage

Here is an example of how to use this plugin with the default options.
Note that the default options are aligned with the actual rate limits enforced by Telegram, so they should be good to go.

<CodeGroup>
  <CodeGroupItem title="TS" active>

```ts
import { Bot } from "grammy";
import { apiThrottler } from "@grammyjs/transformer-throttler";

const botToken = process.env.BOT_TOKEN;
if (!botToken) {
  throw Error("BOT_TOKEN is required");
}
const bot = new Bot(botToken);

const throttler = apiThrottler();
bot.api.config.use(throttler);

bot.command("/example", (ctx) => ctx.reply("I am throttled"));
bot.start();
```

 </CodeGroupItem>
 <CodeGroupItem title="JS">

```js
const { Bot } = require("grammy");
const { apiThrottler } = require("@grammyjs/transformer-throttler");

const botToken = process.env.BOT_TOKEN;
if (!botToken) {
  throw Error("BOT_TOKEN is required");
}
const bot = new Bot(botToken);

const throttler = apiThrottler();
bot.api.config.use(throttler);

bot.command("/example", (ctx) => ctx.reply("I am throttled"));
bot.start();
```

 </CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { apiThrottler } from "https://deno.land/x/grammy_transformer_throttler/mod.ts";

const botToken = Deno.env.get("BOT_TOKEN");
if (!botToken) {
  throw Error("BOT_TOKEN is required");
}
const bot = new Bot(botToken);

const throttler = apiThrottler();
bot.api.config.use(throttler);

bot.command("/example", (ctx) => ctx.reply("I am throttled"));
bot.start();
```

 </CodeGroupItem>
</CodeGroup>

## Configuration

The throttler accepts a single optional argument of the following form:

```ts
type ThrottlerOptions = {
  global?: Bottleneck.ConstructorOptions; // For throttling all api calls
  group?: Bottleneck.ConstructorOptions;  // For throttling outgoing group messages
  out?: Bottleneck.ConstructorOptions;    // For throttling outgoing private messages
};
```

The full list of object properties available for `Bottleneck.ConstructorOptions` can be found at [Bottleneck](https://github.com/SGrondin/bottleneck#constructor).

If no argument is passed, the throttler created will use the default configuration settings which should be appropriate for most use cases.
The default configuration are as follows:

```ts
// Outgoing Global Throttler
const globalConfig = {
  reservoir: 30,                  // Number of new jobs that throttler will accept at start
  reservoirRefreshAmount: 30,     // Number of jobs that throttler will accept after refresh
  reservoirRefreshInterval: 1000, // Interval in milliseconds where reservoir will refresh
};

// Outgoing Group Throttler
const groupConfig = {
  maxConcurrent: 1,                // Only 1 job at a time
  minTime: 1000,                   // Wait this many milliseconds to be ready, after a job
  reservoir: 20,                   // Number of new jobs that throttler will accept at start
  reservoirRefreshAmount: 20,      // Number of jobs that throttler will accept after refresh
  reservoirRefreshInterval: 60000, // Interval in milliseconds where reservoir will refresh
};

// Outgoing Private Throttler
const outConfig = {
  maxConcurrent: 1, // Only 1 job at a time
  minTime: 1000,    // Wait this many milliseconds to be ready, after a job
};
```

## Plugin summary

- Name: `transformer-throttler`
- Source: <https://github.com/grammyjs/transformer-throttler>
- Reference: <https://doc.deno.land/https/deno.land/x/grammy_transformer_throttler/mod.ts>
