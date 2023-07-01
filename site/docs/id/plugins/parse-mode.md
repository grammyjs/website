# Mode Urai (`parse-mode`)

Plugin ini menyediakan sebuah transformer untuk menyetel pengaturan bawaan `parse_mode` dan sebuah middleware untuk menghidrasi `Context` dengan varian method `reply` yang lebih familiar, contohnya: `replyWithHTML`, `replyWithMarkdown`, dsb.

## Penggunaan (Melakukan Pemformatan dengan Mudah)

::::code-group
:::code-group-item TypeScript

```ts
import { Bot, Context } from "grammy";
import { bold, fmt, hydrateReply, italic, link } from "@grammyjs/parse-mode";

import type { ParseModeFlavor } from "@grammyjs/parse-mode";

const bot = new Bot<ParseModeFlavor<Context>>("");

// Instal plugin-nya.
bot.use(hydrateReply);

bot.command("demo", async (ctx) => {
  await ctx.replyFmt(fmt`${bold("bold!")}
${bold(italic("bitalic!"))}
${bold(fmt`bold ${link("blink", "example.com")} bold`)}`);

  // fmt juga bisa dipanggil seperti function lainnya.
  await ctx.replyFmt(
    fmt(
      ["", " dan ", " dan ", ""],
      fmt`${bold("bold")}`,
      fmt`${bold(italic("bitalic"))}`,
      fmt`${italic("italic")}`,
    ),
  );
});

bot.start();
```

:::
:::code-group-item JavaScript

```js
const { Bot, Context } = require("grammy");
const { bold, fmt, hydrateReply, italic, link } = require(
  "@grammyjs/parse-mode",
);

const bot = new Bot("");

// Instal plugin-nya.
bot.use(hydrateReply);

bot.command("demo", async (ctx) => {
  await ctx.replyFmt(fmt`${bold("bold!")}
${bold(italic("bitalic!"))}
${bold(fmt`bold ${link("blink", "example.com")} bold`)}`);

  // fmt juga bisa dipanggil seperti function lainnya.
  await ctx.replyFmt(
    fmt(
      ["", " dan ", " dan ", ""],
      fmt`${bold("bold")}`,
      fmt`${bold(italic("bitalic"))}`,
      fmt`${italic("italic")}`,
    ),
  );
});

bot.start();
```

:::
:::code-group-item Deno

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

// Instal plugin-nya.
bot.use(hydrateReply);

bot.command("demo", async (ctx) => {
  await ctx.replyFmt(fmt`${bold("bold!")}
${bold(italic("bitalic!"))}
${bold(fmt`bold ${link("blink", "example.com")} bold`)}`);

  // fmt juga bisa dipanggil seperti function lainnya.
  await ctx.replyFmt(
    fmt(
      ["", " dan ", " dan ", ""],
      fmt`${bold("bold")}`,
      fmt`${bold(italic("bitalic"))}`,
      fmt`${italic("italic")}`,
    ),
  );
});

bot.start();
```

:::
::::

## Penggunaan (Parse Mode dan Method Reply Bawaan)

::::code-group
:::code-group-item TypeScript

```ts
import { Bot, Context } from "grammy";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";

import type { ParseModeFlavor } from "@grammyjs/parse-mode";

const bot = new Bot<ParseModeFlavor<Context>>("");

// Instal plugin-nya
bot.use(hydrateReply);

// Atur parse_mode bawaan untuk ctx.reply
bot.api.config.use(parseMode("MarkdownV2"));

bot.command("demo", async (ctx) => {
  await ctx.reply("*Teks* ini _diformat_ menggunakan `format bawaan`");
  await ctx.replyWithHTML(
    "<b>Teks</b> ini <i>diformat</i> menggunakan <code>withHTML</code>",
  );
  await ctx.replyWithMarkdown(
    "*Teks* ini _diformat_ menggunakan `withMarkdown`",
  );
  await ctx.replyWithMarkdownV1(
    "*Teks* ini _diformat_ menggunakan `withMarkdownV1`",
  );
  await ctx.replyWithMarkdownV2(
    "*Teks* ini _diformat_ menggunakan `withMarkdownV2`",
  );
});

bot.start();
```

:::
:::code-group-item JavaScript

```js
const { Bot, Context } = require("grammy");
const { hydrateReply, parseMode } = require("@grammyjs/parse-mode");

const bot = new Bot("");

// Install plugin-nya.
bot.use(hydrateReply);

// Atur parse_mode bawaan untuk ctx.reply
bot.api.config.use(parseMode("MarkdownV2"));

bot.command("demo", async (ctx) => {
  await ctx.reply("*Teks* ini _diformat_ menggunakan `format bawaan`");
  await ctx.replyWithHTML(
    "<b>Teks</b> ini <i>diformat</i> menggunakan <code>withHTML</code>",
  );
  await ctx.replyWithMarkdown(
    "*Teks* ini _diformat_ menggunakan `withMarkdown`",
  );
  await ctx.replyWithMarkdownV1(
    "*Teks* ini _diformat_ menggunakan `withMarkdownV1`",
  );
  await ctx.replyWithMarkdownV2(
    "*Teks* ini _diformat_ menggunakan `withMarkdownV2`",
  );
});

bot.start();
```

:::
:::code-group-item Deno

```ts
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  hydrateReply,
  parseMode,
} from "https://deno.land/x/grammy_parse_mode/mod.ts";

import type { ParseModeFlavor } from "https://deno.land/x/grammy_parse_mode/mod.ts";

const bot = new Bot<ParseModeFlavor<Context>>("");

// Install plugin-nya.
bot.use(hydrateReply);

// Atur parse_mode bawaan untuk ctx.reply
bot.api.config.use(parseMode("MarkdownV2"));

bot.command("demo", async (ctx) => {
  await ctx.reply("*Teks* ini _diformat_ menggunakan `format bawaan`");
  await ctx.replyWithHTML(
    "<b>Teks</b> ini <i>diformat</i> menggunakan <code>withHTML</code>",
  );
  await ctx.replyWithMarkdown(
    "*Teks* ini _diformat_ menggunakan `withMarkdown`",
  );
  await ctx.replyWithMarkdownV1(
    "*Teks* ini _diformat_ menggunakan `withMarkdownV1`",
  );
  await ctx.replyWithMarkdownV2(
    "*Teks* ini _diformat_ menggunakan `withMarkdownV2`",
  );
});

bot.start();
```

:::
::::

## Ringkasan Plugin

- Nama: `parse-mode`
- Sumber: <https://github.com/grammyjs/parse-mode>
- Referensi: <https://deno.land/x/grammy_parse_mode/mod.ts>
