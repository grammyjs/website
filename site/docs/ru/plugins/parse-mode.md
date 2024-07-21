---
prev: false
next: false
---

# Плагин Parse Mode (`parse-mode`)

Этот плагин предоставляет трансформатор для установки `parse_mode` по умолчанию,
а также middleware для взаимодействия `Context` с привычными методами `reply`,
`replyWithHTML`, `replyWithMarkdown` и т.д.

## Использование (Улучшение опыта форматирования)

::: code-group

```ts [TypeScript]
import { Bot, Context } from "grammy";
import { bold, fmt, hydrateReply, italic, link } from "@grammyjs/parse-mode";

import type { ParseModeFlavor } from "@grammyjs/parse-mode";

const bot = new Bot<ParseModeFlavor<Context>>("");

// Установка плагина
bot.use(hydrateReply);

bot.command("demo", async (ctx) => {
  await ctx.replyFmt(fmt`${bold("полужирный!")}
${bold(italic("полужирно-курсивный!"))}
${
    bold(fmt`полужирный ${link("полужирная ссылка", "example.com")} полужирный`)
  }`);

  // fmt также может быть вызвана как любая другая функция.
  await ctx.replyFmt(
    fmt(
      ["", " и ", " и ", ""],
      fmt`${bold("полужирный")}`,
      fmt`${bold(italic("полужирно-курсивный"))}`,
      fmt`${italic("курсивный")}`,
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

// Установка плагина
bot.use(hydrateReply);

bot.command("demo", async (ctx) => {
  await ctx.replyFmt(fmt`${bold("полужирный!")}
${bold(italic("жирно-курсивный!"))}
${
    bold(
      fmt`полужирный ${link("полу-жирная ссылка", "example.com")} полужирный`,
    )
  }`);

  // fmt также может быть вызвана как любая другая функция.
  await ctx.replyFmt(
    fmt(
      ["", " и ", " и ", ""],
      fmt`${bold("полужирный")}`,
      fmt`${bold(italic("полужирно-курсивный"))}`,
      fmt`${italic("курсивный")}`,
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

// Установка плагина
bot.use(hydrateReply);

bot.command("demo", async (ctx) => {
  await ctx.replyFmt(fmt`${bold("полужирный!")}
${bold(italic("жирно-курсивный!"))}
${
    bold(
      fmt`полужирный ${link("полу-жирная ссылка", "example.com")} полужирный`,
    )
  }`);

  // fmt также может быть вызвана как любая другая функция.
  await ctx.replyFmt(
    fmt(
      ["", " и ", " и ", ""],
      fmt`${bold("полужирный")}`,
      fmt`${bold(italic("полужирно-курсивный"))}`,
      fmt`${italic("курсивный")}`,
    ),
  );
});

bot.start();
```

:::

## Использование (parse mode и методы ответа по умолчанию)

::: code-group

```ts [TypeScript]
import { Bot, Context } from "grammy";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";

import type { ParseModeFlavor } from "@grammyjs/parse-mode";

const bot = new Bot<ParseModeFlavor<Context>>("");

// Установка плагина
bot.use(hydrateReply);

// Установите parse_mod по умолчанию для ctx.reply.
bot.api.config.use(parseMode("MarkdownV2"));

bot.command("demo", async (ctx) => {
  await ctx.reply("*Это* `форматирование` _по_ умолчанию");
  await ctx.replyWithHTML(
    "<b>Это</b> <code>форматирование</code> с помощью <i>HTML</i>",
  );
  await ctx.replyWithMarkdown("*Это* `форматирование` с помощью _Markdown_");
  await ctx.replyWithMarkdownV1(
    "*Это* `форматирование` с помощью _MarkdownV1_",
  );
  await ctx.replyWithMarkdownV2(
    "*Это* `форматирование` с помощью _MarkdownV2_",
  );
});

bot.start();
```

```js [JavaScript]
const { Bot, Context } = require("grammy");
const { hydrateReply, parseMode } = require("@grammyjs/parse-mode");

const bot = new Bot("");

// Установка плагина
bot.use(hydrateReply);

// Установите parse_mod по умолчанию для ctx.reply.
bot.api.config.use(parseMode("MarkdownV2"));

bot.command("demo", async (ctx) => {
  await ctx.reply("*Это* `форматирование` _по_ умолчанию");
  await ctx.replyWithHTML(
    "<b>Это</b> <code>форматирование</code> с помощью <i>HTML</i>",
  );
  await ctx.replyWithMarkdown("*Это* `форматирование` с помощью _Markdown_");
  await ctx.replyWithMarkdownV1(
    "*Это* `форматирование` с помощью _MarkdownV1_",
  );
  await ctx.replyWithMarkdownV2(
    "*Это* `форматирование` с помощью _MarkdownV2_",
  );
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

// Установка плагина
bot.use(hydrateReply);

// Установите parse_mod по умолчанию для ctx.reply.
bot.api.config.use(parseMode("MarkdownV2"));

bot.command("demo", async (ctx) => {
  await ctx.reply("*Это* `форматирование` _по_ умолчанию");
  await ctx.replyWithHTML(
    "<b>Это</b> <code>форматирование</code> с помощью <i>HTML</i>",
  );
  await ctx.replyWithMarkdown("*Это* `форматирование` с помощью _Markdown_");
  await ctx.replyWithMarkdownV1(
    "*Это* `форматирование` с помощью _MarkdownV1_",
  );
  await ctx.replyWithMarkdownV2(
    "*Это* `форматирование` с помощью _MarkdownV2_",
  );
});

bot.start();
```

:::

## Краткая информация о плагине

- Название: `parse-mode`
- [Исходник](https://github.com/grammyjs/parse-mode)
- [Ссылка](/ref/parse-mode/)
