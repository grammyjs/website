---
prev: false
next: false
---

# 流式消息草稿（`stream`）

这个插件可以让你将长文本消息以流式方式发送到 Telegram。
任何能够输出字符串片段的 [迭代器](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols) 都可以直接流式发送到任意私聊中。

例如，你可以在 LLM 生成回复时让输出能够 [逐步显示](#llm-集成)。

## 快速开始

这个插件会在 [上下文对象](../guide/context) 上安装 [`ctx.replyWithStream`](/ref/stream/streamcontextextension#replywithstream)。

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
import { Bot, type Context } from "https://deno.land/x/grammy/mod.ts";
import { autoRetry } from "https://deno.land/x/grammy_auto_retry/mod.ts";
import {
  stream,
  type StreamFlavor,
} from "https://deno.land/x/grammy_stream/mod.ts";

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
    await ctx.replyWithStream(textStream);
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
    await ctx.replyWithStream(textStream);
  });
```

:::

记得把 `gemini-2.5-flash` 替换为当前最新最热的模型。

## 流式发送格式化消息

这件事比你想象中要 _难得多_。

1. LLM 生成出来的 Markdown 是否正确是存在 _概率_ 的。
   它通常是对的，但有时会出错。
   它并不遵循某个明确的标准。
   特别是，**它们生成出来的 Markdown 不一定和 Telegram 兼容**。
   这意味着你尝试发送消息到 Telegram 时有可能失败，无论是直接发送还是流式发送。
2. LLM 会生成 _不完整_ 的 Markdown 实体。
   即便输出内容完全符合 Telegram 的 [MarkdownV2](https://core.telegram.org/bots/api#markdownv2-style) 规范，**单个输出分片 (chunk) 也仍然可能是损坏的**。
   如果你在一个分片中开启斜体，而在下一个分片才闭合它，流式发送就会崩溃，而且整条消息都发不出去。
3. LLM 有时会生成 Telegram 不支持的格式内容，即便你已经明确要求它不要这么做。
   例如，大多数 LLM 都 _很爱用_ **表格、项目符号和枚举列表**。
   Telegram 客户端无法渲染这些内容。

> Telegram 也接受 [HTML](https://core.telegram.org/bots/api#html-style) 格式。
> 但它同样会遇到和 Markdown 一样的问题。
> 此外，HTML 输出会消耗更多 token，这会带来不必要的开销。

那…怎么办呢？

遗憾的是，并没有什么理想方案。
不过，下面有一些思路：

- 让 LLM 输出不带格式的纯文本
- 祈祷 LLM 在生成 Markdown 时不要出错，如果失败了就直接退回纯文本重试
- 使用 HTML 格式，并祈祷这样多少能好一些
- 编写一个自定义的 [转换器函数](../advanced/transformers)，自动重试失败的请求
- 使用流式 Markdown 解析器，并为每个 [`MessageDraftPiece`](/ref/stream/messagedraftpiece) 构建一个自己的 [`MessageEntity`](https://core.telegram.org/bots/api#messageentity) 数组
- 先把 Markdown 当作纯文本流式发送，等流结束并且所有消息都发送完成后，再用常规 Markdown 解析器补上格式
- 想到一个天才般的新办法，然后在 [群聊](https://t.me/grammyjs) 里和我们分享

## 插件概述

- 名字：`stream`
- [源码](https://github.com/grammyjs/stream)
- [参考](/ref/stream/)
