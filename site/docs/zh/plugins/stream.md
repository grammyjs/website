---
prev: false
next: false
---

# 流式消息草稿（`stream`）

这个插件可以让你将长文本消息以流式方式发送到 Telegram。
任何能够输出字符串片段的 [迭代器](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols) 都可以直接流式发送到任意私聊中。

例如，你可以在 LLM 生成回复时让输出能够 [逐步显示](#llm-集成)。

## 快速开始

这个插件会在 [上下文对象](../guide/context) 上安装这三个方法：

- [`ctx.replyWithStream`](/ref/stream/streamcontextextension#replywithstream): 流式传输普通消息
- [`ctx.replyWithMarkdownStream`](/ref/stream/streamcontextextension#replywithmarkdownstream): 流式传输 Markdown（**推荐**）
- [`ctx.replyWithHtmlStream`](/ref/stream/streamcontextextension#replywithhtmlstream): 流式传输 HTML

流式传输普通消息（第一个选项）用于发送常规文本消息。
其他两种方法使用 Telegram 的 [富媒体消息 (rich message)](https://core.telegram.org/bots/api#rich-messages)，在大多数情况下我们推荐这种方法。

> 流式发送消息会非常频繁地发起大量 API 调用。
> 强烈建议将 [auto-retry 插件](./auto-retry) 与 stream 插件搭配使用。

::: code-group

```ts [TypeScript]
import { Bot, type Context } from "grammy";
import { autoRetry } from "@grammyjs/auto-retry";
import { stream, type StreamFlavor } from "@grammyjs/stream";

type MyContext = StreamFlavor<Context>;
const bot = new Bot<MyContext>("");

bot.api.config.use(autoRetry()); // 强烈推荐！
bot.use(stream());

async function* slowText() {
  // 模拟缓慢生成文本
  yield "这是一";
  await new Promise((r) => setTimeout(r, 2000));
  yield "些生成很";
  await new Promise((r) => setTimeout(r, 2000));
  yield "慢的文本";
}

// Telegram 仅支持在私聊中流式发送。
bot.chatType("private")
  .command("stream", async (ctx) => {
    // 流式发送消息！
    await ctx.replyWithStream(slowText());
  });

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { autoRetry } = require("@grammyjs/auto-retry");
const { stream } = require("@grammyjs/stream");

const bot = new Bot("");

bot.api.config.use(autoRetry()); // 强烈推荐！
bot.use(stream());

async function* slowText() {
  // 模拟缓慢生成文本
  yield "这是一";
  await new Promise((r) => setTimeout(r, 2000));
  yield "些生成很";
  await new Promise((r) => setTimeout(r, 2000));
  yield "慢的文本";
}

// Telegram 仅支持在私聊中流式发送。
bot.chatType("private")
  .command("stream", async (ctx) => {
    // 流式发送消息！
    await ctx.replyWithStream(slowText());
  });

bot.start();
```

```ts [Deno]
import { Bot, type Context } from "npm:grammy";
import { autoRetry } from "npm:@grammyjs/auto_retry";
import { stream, type StreamFlavor } from "npm:@grammyjs/stream";

type MyContext = StreamFlavor<Context>;
const bot = new Bot<MyContext>("");

bot.api.config.use(autoRetry()); // 强烈推荐！
bot.use(stream());

async function* slowText() {
  // 模拟缓慢生成文本
  yield "这是一";
  await new Promise((r) => setTimeout(r, 2000));
  yield "些生成很";
  await new Promise((r) => setTimeout(r, 2000));
  yield "慢的文本";
}

// Telegram 仅支持在私聊中流式发送。
bot.chatType("private")
  .command("stream", async (ctx) => {
    // 流式发送消息！
    await ctx.replyWithStream(slowText());
  });

bot.start();
```

:::

就这么简单！

## LLM 集成

大多数 [LLM](https://zh.wikipedia.org/wiki/%E5%A4%A7%E5%9E%8B%E8%AF%AD%E8%A8%80%E6%A8%A1%E5%9E%8B) 集成都支持在生成输出时进行流式传输。
你可以使用这个插件，让 LLM 的输出在任意私聊中逐步显示出来。

例如，如果你使用 [AI SDK](https://ai-sdk.dev)，你的代码会像这样：

::: code-group

```ts [Node.js]
import { streamText } from "ai";
import { google } from "@ai-sdk/google";

bot.chatType("private")
  .command("credits", async (ctx) => {
    // 向 LLM 发送提示词：
    const { textStream } = streamText({
      model: google("gemini-2.5-flash"),
      prompt: "GrammY 机器人有多酷？",
    });

    // 使用 grammY 自动流式发送回复：
    await ctx.replyWithMarkdownStream(textStream);
  });
```

```ts [Deno]
import { streamText } from "npm:ai";
import { google } from "npm:@ai-sdk/google";

bot.chatType("private")
  .command("credits", async (ctx) => {
    // 向 LLM 发送提示词：
    const { textStream } = streamText({
      model: google("gemini-2.5-flash"),
      prompt: "GrammY 机器人有多酷？",
    });

    // 使用 grammY 自动流式发送回复：
    await ctx.replyWithMarkdownStream(textStream);
  });
```

:::

记得把 `gemini-2.5-flash` 替换为当前最新最热的模型。

## 插件概述

- 名字：`stream`
- [源码](https://github.com/grammyjs/stream)
- [参考](/ref/stream/)
