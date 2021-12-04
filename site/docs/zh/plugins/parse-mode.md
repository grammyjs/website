# 解析模式（`parse-mode`）

这个插件提供了一个设置默认的 `parse_mode` 的 transformer，以及一个中间件，用于将 `Context` 中的 `reply` 方法转换成常用的 `replyWithHTML`，`replyWithMarkdown`，等等方法。

## 使用方法

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Composer } from "grammy";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";

import type { ParseModeContext } from "@grammyjs/parse-mode";

const bot = new Bot<ParseModeContext>("");

// 安装常用的 reply 方法到 ctx 中
bot.use(hydrateReply);

// 为 ctx.reply 设置默认解析模式
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

// 使用插件。
bot.use(hydrateReply);

// 为 `ctx.reply` 设置默认 `parse_mode`。
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

// 使用插件。
bot.use(hydrateReply);

// 为 `ctx.reply` 设置默认 `parse_mode`。
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
- 参考：<https://doc.deno.land/https://deno.land/x/grammy_parse_mode/mod.ts>
