---
prev: false
next: false
---

# Streaming Message Drafts (`stream`)

This plugin lets you stream long text messages to Telegram.
Any [iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) of string snippets can be streamed right into any private chat.

For example, you can make LLM output [appear gradually](#llm-integration) while generating the response.

## Quickstart

The plugin installs three methods on the [context object](../guide/context):

- [`ctx.replyWithStream`](/ref/stream/streamcontextextension#replywithstream): plain message streaming
- [`ctx.replyWithMarkdownStream`](/ref/stream/streamcontextextension#replywithmarkdownstream): markdown streaming (**recommended**)
- [`ctx.replyWithHtmlStream`](/ref/stream/streamcontextextension#replywithhtmlstream): HTML streaming

Plain text streaming (first option) sends regular text messages.
The other two methods use Telegram's [rich messages](https://core.telegram.org/bots/api#rich-messages) and are recommended for most cases.

> Streaming messages performs many API calls very rapidly.
> It is strongly recommended to use the [auto-retry plugin](./auto-retry) alongside the stream plugin.

::: code-group

```ts [TypeScript]
import { Bot, type Context } from "grammy";
import { autoRetry } from "@grammyjs/auto-retry";
import { stream, type StreamFlavor } from "@grammyjs/stream";

type MyContext = StreamFlavor<Context>;
const bot = new Bot<MyContext>("");

bot.api.config.use(autoRetry()); // strongly recommended!
bot.use(stream());

async function* slowText() {
  // emulate slow text generation
  yield "This is som";
  await new Promise((r) => setTimeout(r, 2000));
  yield "e slowly gen";
  await new Promise((r) => setTimeout(r, 2000));
  yield "erated text";
}

// Telegram only supports streaming in private chats.
bot.chatType("private")
  .command("stream", async (ctx) => {
    // Stream the message!
    await ctx.replyWithStream(slowText());
  });

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { autoRetry } = require("@grammyjs/auto-retry");
const { stream } = require("@grammyjs/stream");

const bot = new Bot("");

bot.api.config.use(autoRetry()); // strongly recommended!
bot.use(stream());

async function* slowText() {
  // emulate slow text generation
  yield "This is som";
  await new Promise((r) => setTimeout(r, 2000));
  yield "e slowly gen";
  await new Promise((r) => setTimeout(r, 2000));
  yield "erated text";
}

// Telegram only supports streaming in private chats.
bot.chatType("private")
  .command("stream", async (ctx) => {
    // Stream the message!
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

bot.api.config.use(autoRetry()); // strongly recommended!
bot.use(stream());

async function* slowText() {
  // emulate slow text generation
  yield "This is som";
  await new Promise((r) => setTimeout(r, 2000));
  yield "e slowly gen";
  await new Promise((r) => setTimeout(r, 2000));
  yield "erated text";
}

// Telegram only supports streaming in private chats.
bot.chatType("private")
  .command("stream", async (ctx) => {
    // Stream the message!
    await ctx.replyWithStream(slowText());
  });

bot.start();
```

:::

That's it!

## LLM Integration

Most [LLM](https://en.wikipedia.org/wiki/Large_language_model) integrations let you stream the output while it is being generated.
You can use this plugin to make the LLM output appear gradually in any private chat.

For example, if you use the [AI SDK](https://ai-sdk.dev), your setup could look like this:

::: code-group

```ts [Node.js]
import { streamText } from "ai";
import { google } from "@ai-sdk/google";

bot.chatType("private")
  .command("credits", async (ctx) => {
    // Send prompt to LLM:
    const { textStream } = streamText({
      model: google("gemini-2.5-flash"),
      prompt: "How cool are grammY bots?",
    });

    // Automatically stream response with grammY:
    await ctx.replyWithMarkdownStream(textStream);
  });
```

```ts [Deno]
import { streamText } from "npm:ai";
import { google } from "npm:@ai-sdk/google";

bot.chatType("private")
  .command("credits", async (ctx) => {
    // Send prompt to LLM:
    const { textStream } = streamText({
      model: google("gemini-2.5-flash"),
      prompt: "How cool are grammY bots?",
    });

    // Automatically stream response with grammY:
    await ctx.replyWithMarkdownStream(textStream);
  });
```

:::

Make sure to replace `gemini-2.5-flash` by whatever the latest model is.

## Plugin Summary

- Name: `stream`
- [Source](https://github.com/grammyjs/stream)
- [Reference](/ref/stream/)
