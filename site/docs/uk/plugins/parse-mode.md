---
prev: false
next: false
---

# Режим форматування (`parse-mode`)

Цей плагін надає перетворювач для встановлення стандартного `parse_mode`, а також проміжний обробник для гідратації `Context` звичними варіантами методу `reply`, а саме: `replyWithHTML`, `replyWithMarkdown` тощо.

## Використання (покращення досвіду форматування)

:::code-group

```ts [TypeScript]
import { Bot, Context } from "grammy";
import { bold, fmt, hydrateReply, italic, link } from "@grammyjs/parse-mode";

import type { ParseModeFlavor } from "@grammyjs/parse-mode";

const bot = new Bot<ParseModeFlavor<Context>>("");

// Встановлюємо плагін.
bot.use(hydrateReply);

bot.command("demo", async (ctx) => {
  await ctx.replyFmt(fmt`${bold("жирний!")}
${bold(italic("жирний курсив!"))}
${bold(fmt`жирний ${link("жирне посилання", "example.com")} жирний`)}`);

  // `fmt` також можна викликати як будь-яку іншу функцію.
  await ctx.replyFmt(
    fmt(
      ["", " і ", " і ", ""],
      fmt`${bold("жирний")}`,
      fmt`${bold(italic("жирний курсив"))}`,
      fmt`${italic("курсив")}`,
    ),
  );
});

bot.start();
```

```js [JavaScript]
const { Bot, Context } = require("grammy");
const { bold, fmt, hydrateReply, italic, link } = require(
  "@grammyjs/parse-mode",
);

const bot = new Bot("");

// Встановлюємо плагін.
bot.use(hydrateReply);

bot.command("demo", async (ctx) => {
  await ctx.replyFmt(fmt`${bold("жирний!")}
${bold(italic("жирний курсив!"))}
${bold(fmt`жирний ${link("жирне посилання", "example.com")} жирний`)}`);

  // `fmt` також можна викликати як будь-яку іншу функцію.
  await ctx.replyFmt(
    fmt(
      ["", " і ", " і ", ""],
      fmt`${bold("жирний")}`,
      fmt`${bold(italic("жирний курсив"))}`,
      fmt`${italic("курсив")}`,
    ),
  );
});

bot.start();
```

```ts [Deno]
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

// Встановлюємо плагін.
bot.use(hydrateReply);

bot.command("demo", async (ctx) => {
  await ctx.replyFmt(fmt`${bold("жирний!")}
${bold(italic("жирний курсив!"))}
${bold(fmt`жирний ${link("жирне посилання", "example.com")} жирний`)}`);

  // `fmt` також можна викликати як будь-яку іншу функцію.
  await ctx.replyFmt(
    fmt(
      ["", " і ", " і ", ""],
      fmt`${bold("жирний")}`,
      fmt`${bold(italic("жирний курсив"))}`,
      fmt`${italic("курсив")}`,
    ),
  );
});

bot.start();
```

:::

## Використання (типовий режим форматування та методи відповіді)

:::code-group

```ts [TypeScript]
import { Bot, Context } from "grammy";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";

import type { ParseModeFlavor } from "@grammyjs/parse-mode";

const bot = new Bot<ParseModeFlavor<Context>>("");

// Встановлюємо плагін.
bot.use(hydrateReply);

// Встановлюємо типовий режим форматування для `ctx.reply`
bot.api.config.use(parseMode("MarkdownV2"));

bot.command("demo", async (ctx) => {
  await ctx.reply("*Це* `форматування` _за_ замовчуванням");
  await ctx.replyWithHTML(
    "<b>Це</b> <code>форматування</code> методу <i>withHTML</i> ",
  );
  await ctx.replyWithMarkdown("*Це* `форматування` методу _withMarkdown_");
  await ctx.replyWithMarkdownV1("*Це* `форматування` методу _withMarkdownV1_");
  await ctx.replyWithMarkdownV2("*Це* `форматування` методу _withMarkdownV2_");
});

bot.start();
```

```js [JavaScript]
const { Bot, Context } = require("grammy");
const { hydrateReply, parseMode } = require("@grammyjs/parse-mode");

const bot = new Bot("");

// Встановлюємо плагін.
bot.use(hydrateReply);

// Встановлюємо типовий режим форматування для `ctx.reply`
bot.api.config.use(parseMode("MarkdownV2"));

bot.command("demo", async (ctx) => {
  await ctx.reply("*Це* `форматування` _за_ замовчуванням");
  await ctx.replyWithHTML(
    "<b>Це</b> <code>форматування</code> методу <i>withHTML</i> ",
  );
  await ctx.replyWithMarkdown("*Це* `форматування` методу _withMarkdown_");
  await ctx.replyWithMarkdownV1("*Це* `форматування` методу _withMarkdownV1_");
  await ctx.replyWithMarkdownV2("*Це* `форматування` методу _withMarkdownV2_");
});

bot.start();
```

```ts [Deno]
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  hydrateReply,
  parseMode,
} from "https://deno.land/x/grammy_parse_mode/mod.ts";

import type { ParseModeFlavor } from "https://deno.land/x/grammy_parse_mode/mod.ts";

const bot = new Bot<ParseModeFlavor<Context>>("");

// Встановлюємо плагін.
bot.use(hydrateReply);

// Встановлюємо типовий режим форматування для `ctx.reply`
bot.api.config.use(parseMode("MarkdownV2"));

bot.command("demo", async (ctx) => {
  await ctx.reply("*Це* `форматування` _за_ замовчуванням");
  await ctx.replyWithHTML(
    "<b>Це</b> <code>форматування</code> методу <i>withHTML</i> ",
  );
  await ctx.replyWithMarkdown("*Це* `форматування` методу _withMarkdown_");
  await ctx.replyWithMarkdownV1("*Це* `форматування` методу _withMarkdownV1_");
  await ctx.replyWithMarkdownV2("*Це* `форматування` методу _withMarkdownV2_");
});

bot.start();
```

:::

## Загальні відомості про плагін

- Назва: `parse-mode`
- Джерело: <https://github.com/grammyjs/parse-mode>
- Довідка: <https://deno.land/x/grammy_parse_mode/mod.ts>
