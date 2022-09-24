# Plugin Parse Mode (`parse-mode`)

<TagGroup><Tag type="official" text="RESMI"/></TagGroup>

Plugin ini menyediakan sebuah transformer untuk mengatur setting-an bawaan `parse_mode` dan sebuah middleware untuk menghidrasi `Context` dengan varian method `reply` yang lebih familiar, contohnya: `replyWithHTML`, `replyWithMarkdown`, dll.

## Penggunaan

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";

import type { ParseModeContext } from "@grammyjs/parse-mode";

const bot = new Bot<ParseModeContext>("");

// Gunakan plugin-nya
bot.use(hydrateReply);

// Atur setting-an bawaan parse_mode untuk ctx.reply
bot.api.config.use(parseMode("MarkdownV2"));

bot.command("demo", async (ctx) => {
  await ctx.reply(
    "*Reply* ini menggunakan _MarkdownV2_ sebagai `format` bawaannya",
  );
  await ctx.replyWithHTML(
    "<b>Reply</b> ini menggunakan <code>format</code> <i>withHTML</i>",
  );
  await ctx.replyWithMarkdown(
    "*Reply* ini menggunakan `format` _withMarkdown_",
  );
  await ctx.replyWithMarkdownV1(
    "*Reply* ini menggunakan `format` _withMarkdownV1_",
  );
  await ctx.replyWithMarkdownV2(
    "*Reply* ini menggunakan `format` _withMarkdownV2_",
  );
});

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");
const { hydrateReply, parseMode } = require("@grammyjs/parse-mode");

const bot = new Bot("");

// Gunakan plugin-nya
bot.use(hydrateReply);

// Atur setting-an bawaan parse_mode untuk ctx.reply
bot.api.config.use(parseMode("MarkdownV2"));

bot.command("demo", async (ctx) => {
  await ctx.reply(
    "*Reply* ini menggunakan _MarkdownV2_ sebagai `format` bawaannya",
  );
  await ctx.replyWithHTML(
    "<b>Reply</b> ini menggunakan <code>format</code> <i>withHTML</i>",
  );
  await ctx.replyWithMarkdown(
    "*Reply* ini menggunakan `format` _withMarkdown_",
  );
  await ctx.replyWithMarkdownV1(
    "*Reply* ini menggunakan `format` _withMarkdownV1_",
  );
  await ctx.replyWithMarkdownV2(
    "*Reply* ini menggunakan `format` _withMarkdownV2_",
  );
});

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import {
  hydrateReply,
  parseMode,
} from "https://deno.land/x/grammy_parse_mode/mod.ts";

import type { ParseModeContext } from "https://deno.land/x/grammy_parse_mode/mod.ts";

const bot = new Bot<ParseModeContext>("");

// Gunakan plugin-nya
bot.use(hydrateReply);

// Atur setting-an bawaan parse_mode untuk ctx.reply
bot.api.config.use(parseMode("MarkdownV2"));

bot.command("demo", async (ctx) => {
  await ctx.reply(
    "*Reply* ini menggunakan _MarkdownV2_ sebagai `format` bawaannya",
  );
  await ctx.replyWithHTML(
    "<b>Reply</b> ini menggunakan <code>format</code> <i>withHTML</i>",
  );
  await ctx.replyWithMarkdown(
    "*Reply* ini menggunakan `format` _withMarkdown_",
  );
  await ctx.replyWithMarkdownV1(
    "*Reply* ini menggunakan `format` _withMarkdownV1_",
  );
  await ctx.replyWithMarkdownV2(
    "*Reply* ini menggunakan `format` _withMarkdownV2_",
  );
});

bot.start();
```

</CodeGroupItem>
</CodeGroup>

## Ringkasan Plugin

- Nama: `parse-mode`
- Sumber: <https://github.com/grammyjs/parse-mode>
- Referensi: <https://doc.deno.land/https://deno.land/x/grammy_parse_mode/mod.ts>
