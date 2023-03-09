# 解析模式（`parse-mode`）

这个插件提供了一个设置默认的 `parse_mode` 的 transformer，以及一个中间件，用于将 `Context` 中的 `reply` 方法转换成常用的 `replyWithHTML`，`replyWithMarkdown`，等等方法。

## 使用方法 (改善格式化体验)

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context } from "grammy";
import { bold, fmt, hydrateReply, italic, link } from "@grammyjs/parse-mode";

import type { ParseModeFlavor } from "@grammyjs/parse-mode";

const bot = new Bot<ParseModeFlavor<Context>>("");

// 安装插件
bot.use(hydrateReply);

bot.command("demo", async (ctx) => {
  await ctx.replyFmt(fmt`${bold("bold!")}
${bold(italic("bitalic!"))}
${bold(fmt`bold ${link("blink", "example.com")} bold`)}`);

  // fmt 也可以像任何其他函数一样被调用
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
const { bold, fmt, hydrateReply, italic, link } = require(
  "@grammyjs/parse-mode",
);

const bot = new Bot(""); // <-- put your bot token between the ""

// 安装插件
bot.use(hydrateReply);

bot.command("demo", async (ctx) => {
  await ctx.replyFmt(fmt`${bold("bold!")}
${bold(italic("bitalic!"))}
${bold(fmt`bold ${link("blink", "example.com")} bold`)}`);

  // fmt 也可以像任何其他函数一样被调用
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

// 安装插件
bot.use(hydrateReply);

bot.command("demo", async (ctx) => {
  await ctx.replyFmt(fmt`${bold("bold!")}
${bold(italic("bitalic!"))}
${bold(fmt`bold ${link("blink", "example.com")} bold`)}`);

  // fmt 也可以像任何其他函数一样被调用
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

## 使用方法 (默认解析模式和回复方法)

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context } from "grammy";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";

import type { ParseModeFlavor } from "@grammyjs/parse-mode";

const bot = new Bot<ParseModeFlavor<Context>>("");

// 安装插件
bot.use(hydrateReply);

// 设置 ctx.reply 的默认解析模式
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
const { Bot, Context } = require("grammy");
const { hydrateReply, parseMode } = require("@grammyjs/parse-mode");

const bot = new Bot(""); // <-- put your bot token between the ""

// 安装插件
bot.use(hydrateReply);

// 设置 ctx.reply 的默认解析模式
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
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  hydrateReply,
  parseMode,
} from "https://deno.land/x/grammy_parse_mode/mod.ts";

import type { ParseModeFlavor } from "https://deno.land/x/grammy_parse_mode/mod.ts";

const bot = new Bot<ParseModeFlavor<Context>>("");

// 安装插件
bot.use(hydrateReply);

// 设置 ctx.reply 的默认解析模式
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

## 插件概述

- 名字：`parse-mode`
- 源码：<https://github.com/grammyjs/parse-mode>
- 参考：<https://deno.land/x/grammy_parse_mode/mod.ts>
