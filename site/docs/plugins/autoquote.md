---
prev: false
next: false
---

# Always Replying to Messages

It is sometimes necessary to always send messages as replies, especially for bots that are meant to be used in groups.
We usually do this by adding `reply_parameters` to the methods that send the message: `sendText`, `reply`, `sendPhoto`, `replyWithPhoto` and etc.
However, if you're doing this for every single message, it can get messy and boring.

This plugin sets the deprecated `reply_to_message_id` parameter to `ctx.msg.message_id` for all `reply*` and `send*` methods that support it to make every message a reply to the message that triggered it.

> The `reply_to_message_id` parameter is still supported by the Bot API for backwards compatibility.
> New code should use `reply_parameters` instead.

## Usage

### In Specific Routes

If you want all messages sent within a specific context (like a specific command), you can specifically apply the plugin to them:

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { addReplyParam } from "@roziscoding/grammy-autoquote";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("Demo command!"); // this is going to quote the user's message
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { addReplyParam } = require("@roziscoding/grammy-autoquote");

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("Demo command!"); // this is going to quote the user's message
});

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { addReplyParam } from "https://deno.land/x/grammy_autoquote/mod.ts";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("Demo command!"); // this is going to quote the user's message
});

bot.start();
```

:::

### In for All Routes

If you want every sent message to reply the messages that triggered them, you can apply the plugin this way:

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { autoQuote } from "@roziscoding/grammy-autoquote";

const bot = new Bot("");

bot.use(autoQuote);

bot.command("demo", async (ctx) => {
  await ctx.reply("Demo command!"); // this is going to quote the user's message
});

bot.command("hello", async (ctx) => {
  await ctx.reply("Hi there :)"); // this quotes the user's message, too
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { autoQuote } = require("@roziscoding/grammy-autoquote");

const bot = new Bot("");

bot.use(autoQuote);

bot.command("demo", async (ctx) => {
  await ctx.reply("Demo command!"); // this is going to quote the user's message
});

bot.command("hello", async (ctx) => {
  await ctx.reply("Hi there :)"); // this quotes the user's message, too
});

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { autoQuote } from "https://deno.land/x/grammy_autoquote/mod.ts";

const bot = new Bot("");

bot.use(autoQuote);

bot.command("demo", async (ctx) => {
  await ctx.reply("Demo command!"); // this is going to quote the user's message
});

bot.command("hello", async (ctx) => {
  await ctx.reply("Hi there :)"); // this quotes the user's message, too
});

bot.start();
```

:::

## Plugin Summary

- Name: Autoquote
- Source: <https://github.com/roziscoding/grammy-autoquote>
- API Reference: <https://deno.land/x/grammy_autoquote/mod.ts>
