# Parse Mode Plugin (`parse-mode`)

This plugin provides a transformer for setting default `parse_mode`, and a middleware for hydrating `Context` with familiar `reply` variant methods - i.e. `replyWithHTML`, `replyWithMarkdown`, etc.

## Usage

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Composer } from "grammy";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";

import type { ParseModeContext } from "@grammyjs/parse-mode";

const bot = new Bot<ParseModeContext>("");

// Install familiar reply variants to ctx
bot.use(hydrateReply);

// Sets default parse_mode for ctx.reply
bot.api.config.use(parseMode("MarkdownV2"));

bot.command("demo", async (ctx) => {
  await ctx.reply("*This* is _the_ default `formatting`");
  await ctx.replyWithHTML(
    "<b>This</b> is <i>withHTML</i> <code>formatting</code>",
  );
  await ctx.replyWithMarkdown("*This* is _withMarkdown_ `formatting`");
  await ctx.replyWithMarkdownV1("*This* is _withMarkdownV1_ `formatting`");
  await ctx.replyWithMarkdownV2("*This* is _withMarkdownV2_ `formatting`");
});

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { Bot, Composer } = require("grammy");
const { hydrateReply, parseMode } = require("@grammyjs/parse-mode");

const bot = new Bot("");

// Use the plugin.
bot.use(hydrateReply);

// Set the default `parse_mode` of `ctx.reply`.
bot.api.config.use(parseMode("MarkdownV2"));

bot.command("demo", async (ctx) => {
  await ctx.reply("*This* is _the_ default `formatting`");
  await ctx.replyWithHTML(
    "<b>This</b> is <i>withHTML</i> <code>formatting</code>",
  );
  await ctx.replyWithMarkdown("*This* is _withMarkdown_ `formatting`");
  await ctx.replyWithMarkdownV1("*This* is _withMarkdownV1_ `formatting`");
  await ctx.replyWithMarkdownV2("*This* is _withMarkdownV2_ `formatting`");
});

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot, Composer } from "https://deno.land/x/grammy/mod.ts";
import {
  hydrateReply,
  parseMode,
} from "https://deno.land/x/grammy_parse_mode/mod.ts";

import type { ParseModeContext } from "https://deno.land/x/grammy_parse_mode/mod.ts";

const bot = new Bot<ParseModeContext>("");

// Use the plugin.
bot.use(hydrateReply);

// Set the default `parse_mode` of `ctx.reply`.
bot.api.config.use(parseMode("MarkdownV2"));

bot.command("demo", async (ctx) => {
  await ctx.reply("*This* is _the_ default `formatting`");
  await ctx.replyWithHTML(
    "<b>This</b> is <i>withHTML</i> <code>formatting</code>",
  );
  await ctx.replyWithMarkdown("*This* is _withMarkdown_ `formatting`");
  await ctx.replyWithMarkdownV1("*This* is _withMarkdownV1_ `formatting`");
  await ctx.replyWithMarkdownV2("*This* is _withMarkdownV2_ `formatting`");
});

bot.start();
```

</CodeGroupItem>
</CodeGroup>

## Plugin Summary

- Name: `parse-mode`
- Source: <https://github.com/grammyjs/parse-mode>
- Reference: <https://doc.deno.land/https/deno.land/x/grammy_parse_mode/mod.ts>
