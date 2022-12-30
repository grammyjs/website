# Parse Mode Plugin (`parse-mode`)

This plugin provides a transformer for setting default `parse_mode`, and a middleware for hydrating `Context` with familiar `reply` variant methods - i.e. `replyWithHTML`, `replyWithMarkdown`, etc.

## Usage (Improving Formatting Experience)

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context } from "grammy";
import { bold, fmt, hydrateReply, italic, link } from "@grammyjs/parse-mode";

import type { ParseModeFlavor } from "@grammyjs/parse-mode";

const bot = new Bot<ParseModeFlavor<Context>>("");

// Install the plugin.
bot.use(hydrateReply);

bot.command("demo", async (ctx) => {
  await ctx.replyFmt(fmt`${bold("bold!")}
${bold(italic("bitalic!"))}
${bold(fmt`bold ${link("blink", "example.com")} bold`)}`);

  // fmt can also be called like any other function.
  await ctx.replyFmt(
    fmt(
      ["", " and ", " and ", ""],
      fmt`${bold("bold")}`,
      fmt`${bold(italic("bitalic"))}`,
      fmt`${italic("italic")}`,
    ),
  );
});

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { Bot, Context } = require("grammy");
const { bold, fmt, hydrateReply, italic, link } = require("@grammyjs/parse-mode");

const bot = new Bot("");

// Install the plugin.
bot.use(hydrateReply);

bot.command("demo", async (ctx) => {
  await ctx.replyFmt(fmt`${bold("bold!")}
${bold(italic("bitalic!"))}
${bold(fmt`bold ${link("blink", "example.com")} bold`)}`);

  // fmt can also be called like any other function.
  await ctx.replyFmt(
    fmt(
      ["", " and ", " and ", ""],
      fmt`${bold("bold")}`,
      fmt`${bold(italic("bitalic"))}`,
      fmt`${italic("italic")}`,
    ),
  );
});

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  bold,
  fmt,
  hydrateReply,
  italic,
  link,
} from "https://deno.land/x/grammy_parse_mode/mod.ts";

import type { ParseModeFlavor } from "https://deno.land/x/grammy_parse_mode/mod.ts";

const bot = new Bot<ParseModeFlavor<Context>>("");

// Install the plugin.
bot.use(hydrateReply);

bot.command("demo", async (ctx) => {
  await ctx.replyFmt(fmt`${bold("bold!")}
${bold(italic("bitalic!"))}
${bold(fmt`bold ${link("blink", "example.com")} bold`)}`);

  // fmt can also be called like any other function.
  await ctx.replyFmt(
    fmt(
      ["", " and ", " and ", ""],
      fmt`${bold("bold")}`,
      fmt`${bold(italic("bitalic"))}`,
      fmt`${italic("italic")}`,
    ),
  );
});

bot.start();
```

</CodeGroupItem>
</CodeGroup>

## Usage (Default Parse Mode and Reply Methods)

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Composer, Context } from "grammy";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";

import type { ParseModeFlavor } from "@grammyjs/parse-mode";

const bot = new Bot<ParseModeFlavor<Context>>("");

// Install the plugin.
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
const { Bot, Composer, Context } = require("grammy");
const { hydrateReply, parseMode } = require("@grammyjs/parse-mode");

const bot = new Bot("");

// Install the plugin.
bot.use(hydrateReply);

// Set the default parse mode for ctx.reply.
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
import { Bot, Composer, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  hydrateReply,
  parseMode,
} from "https://deno.land/x/grammy_parse_mode/mod.ts";

import type { ParseModeFlavor } from "https://deno.land/x/grammy_parse_mode/mod.ts";

const bot = new Bot<ParseModeFlavor<Context>>("");

// Install the plugin.
bot.use(hydrateReply);

// Set the default parse mode for ctx.reply.
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
- Reference: <https://deno.land/x/grammy_parse_mode/mod.ts>
