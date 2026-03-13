---
prev: false
next: false
---

# Streaming Message Drafts (`stream`)

This plugin lets you stream long text messages to Telegram.
Any [iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) of string snippets can be streamed right into any private chat.

For example, you can make LLM output [appear gradually](#llm-integration) while generating the response.

## Quickstart

The plugin installs [`ctx.replyWithStream`](/ref/stream/streamcontextextension#replywithstream) on the [context object](../guide/context).

> Streaming messages performs many API calls very rapidly.
> It is strongly recommended to use the [auto-retry plugin](./auto-retry) alongside the stream plugin.

::: code-group

```ts [TypeScript]
const { Bot } = require("grammy");
const { autoRetry } = require("@grammyjs/auto-retry");
const { stream } = require("@grammyjs/stream");

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
import { autoRetry } from "@grammyjs/auto-retry";
import { stream } from "@grammyjs/stream";

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
import { Bot, type Context } from "https://deno.land/x/grammy/mod.ts";
import { autoRetry } from "https://deno.land/x/grammy_auto_retry/mod.ts";
import {
  stream,
  type StreamFlavor,
} from "https://deno.land/x/grammy_stream/mod.ts";

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
    await ctx.replyWithStream(textStream);
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
    await ctx.replyWithStream(textStream);
  });
```

:::

Make sure to replace `gemini-2.5-flash` by whatever the latest model is.

## Streaming Formatted Messages

This is _much_ harder than you think.

1. LLMs generate _probabilistic_ Markdown.
   It is often correct, but sometimes not.
   It follows no specific standard.
   In particular, **they do not always generate Telegram-compatible Markdown**.
   This means that trying to send/stream it to Telegram will fail.
2. LLMs generate _partial_ Markdown entities.
   Even if the output is perfectly aligned with Telegram's [MarkdownV2](https://core.telegram.org/bots/api#markdownv2-style) specification, **individual output chunks might be broken**.
   If you open a section of italic text but only close it in the next chunk, the streaming will crash and no message will be sent.
3. LLMs sometimes generate formatting that is not supported by Telegram (even if you instruct them not to).
   For example, most LLMs _love_ **tables, bullet points, and enumerations**.
   Telegram clients cannot render these things.

> Telegram also accepts [HTML](https://core.telegram.org/bots/api#html-style) formatting.
> This has the exact same problems as Markdown.
> Also, HTML output consumes a lot more tokens, which is needlessly expensive.

So ... what now?

Unfortunately, there is no good solution.
However, here are some ideas:

- Tell your LLM to output text without formatting
- Hope that your LLM does not make mistakes in generating Markdown, and simply retry with plain text if it fails
- Use HTML formatting and hope that this improves things a bit
- Write a custom [transformer](../advanced/transformers) function which retries failing requests automatically
- Use a streaming markdown parser and build your own [`MessageEntity`](https://core.telegram.org/bots/api#messageentity) arrays for formatting each [`MessageDraftPiece`](/ref/stream/messagedraftpiece)
- Stream Markdown in plain text and then use a regular markdown parser to apply the formatting only after the stream is complete and all messages are sent
- Come up with a genius solution that nobody else has thought of before, and tell us about it in the [group chat](https://t.me/grammyjs)

## Plugin Summary

- Name: `stream`
- [Source](https://github.com/grammyjs/stream)
- [Reference](/ref/stream/)
