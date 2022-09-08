# Shiki Twoslash test

## Twoslash without expansion

```ts twoslash
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { addReplyParam } from "https://deno.land/x/grammy_autoquote/mod.ts";

const bot: Bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("Demo command!"); // this is going to quote the user's message
});

bot.start();
```

## Expansion without twoslash

```ts expand
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { addReplyParam } from "https://deno.land/x/grammy_autoquote/mod.ts";

const bot: Bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("Demo command!"); // this is going to quote the user's message
});

bot.start();
```

## Twoslash and expansion

```ts twoslash expand
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { addReplyParam } from "https://deno.land/x/grammy_autoquote/mod.ts";

const bot: Bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("Demo command!"); // this is going to quote the user's message
});

bot.start();
```

## Twoslash and expension using ---cut---

This:

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot: Bot = new Bot("");
// ---cut---
async function sendHelloTo12345() {
  await bot.api.sendMessage(12345, "<i>Hello!</i>", {
    parse_mode: "HTML",
  });
}
```

Becomes this:

```ts twoslash expand
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot: Bot = new Bot("");
// ---cut---
async function sendHelloTo12345() {
  await bot.api.sendMessage(12345, "<i>Hello!</i>", {
    parse_mode: "HTML",
  });
}
```
