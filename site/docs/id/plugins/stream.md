---
prev: false
next: false
---

# Streaming Message Drafts (`stream`)

Plugin ini memungkinkan Anda untuk mengirim pesan teks panjang ke Telegram.
Setiap [iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) potongan teks dapat langsung dialirkan ke obrolan pribadi mana pun.

Misalnya, Anda dapat membuat output LLM [muncul secara bertahap](#integrasi-llm) saat menghasilkan respons.

## Panduan Cepat

Plugin ini menambahkan tiga metode pada [objek konteks](../guide/context).

- [`ctx.replyWithStream`](/ref/stream/streamcontextextension#replywithstream): penyiaran pesan biasa
- [`ctx.replyWithMarkdownStream`](/ref/stream/streamcontextextension#replywithmarkdownstream): penyiaran markdown (**direkomendasikan**)
- [`ctx.replyWithHtmlStream`](/ref/stream/streamcontextextension#replywithhtmlstream): penyiaran HTML

Penyiaran pesan biasa (opsi pertama) mengirimkan pesan teks biasa.
Dua metode lainnya menggunakan [pesan yang diperkaya](https://core.telegram.org/bots/api#rich-messages) dari Telegram dan disarankan untuk sebagian besar kasus.

> Penyiaran pesan melakukan banyak panggilan API dengan sangat cepat.
> Disarankan untuk menggunakan plugin [auto-retry](./auto-retry) bersama dengan plugin stream.

::: code-group

```ts [TypeScript]
import { Bot, type Context } from "grammy";
import { autoRetry } from "@grammyjs/auto-retry";
import { stream, type StreamFlavor } from "@grammyjs/stream";

type MyContext = StreamFlavor<Context>;
const bot = new Bot<MyContext>("");

bot.api.config.use(autoRetry()); // sangat direkomendasikan!
bot.use(stream());

async function* slowText() {
  // membuat teks secara lambat
  yield "Ini adalah te";
  await new Promise((r) => setTimeout(r, 2000));
  yield "ks yang dihasil";
  await new Promise((r) => setTimeout(r, 2000));
  yield "kan secara lambat";
}

// Telegram hanya mendukung streaming di obrolan pribadi.
bot.chatType("private")
  .command("stream", async (ctx) => {
    // Stream pesannya!
    await ctx.replyWithStream(slowText());
  });

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { autoRetry } = require("@grammyjs/auto-retry");
const { stream } = require("@grammyjs/stream");

const bot = new Bot("");

bot.api.config.use(autoRetry()); // sangat direkomendasikan!
bot.use(stream());

async function* slowText() {
  // membuat teks secara lambat
  yield "Ini adalah te";
  await new Promise((r) => setTimeout(r, 2000));
  yield "ks yang dihasil";
  await new Promise((r) => setTimeout(r, 2000));
  yield "kan secara lambat";
}

// Telegram hanya mendukung streaming di obrolan pribadi.
bot.chatType("private")
  .command("stream", async (ctx) => {
    // Stream pesannya!
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

bot.api.config.use(autoRetry()); // sangat direkomendasikan!
bot.use(stream());

async function* slowText() {
  // membuat teks secara lambat
  yield "Ini adalah te";
  await new Promise((r) => setTimeout(r, 2000));
  yield "ks yang dihasil";
  await new Promise((r) => setTimeout(r, 2000));
  yield "kan secara lambat";
}

// Telegram hanya mendukung streaming di obrolan pribadi.
bot.chatType("private")
  .command("stream", async (ctx) => {
    // Stream pesannya!
    await ctx.replyWithStream(slowText());
  });

bot.start();
```

:::

Itulah dia!

## Integrasi LLM

Sebagian besar integrasi [LLM](https://en.wikipedia.org/wiki/Large_language_model) memungkinkan Anda untuk menampilkan output secara langsung saat sedang diproses.
Anda dapat menggunakan plugin ini untuk menampilkan output LLM secara bertahap di obrolan pribadi mana pun.

Misalnya, jika Anda menggunakan [AI SDK](https://ai-sdk.dev), konfigurasi Anda dapat terlihat seperti ini:

::: code-group

```ts [Node.js]
import { streamText } from "ai";
import { google } from "@ai-sdk/google";

bot.chatType("private")
  .command("credits", async (ctx) => {
    // Kirim perintah ke LLM:
    const { textStream } = streamText({
      model: google("gemini-2.5-flash"),
      prompt: "Sebarapa keren bot grammY?",
    });

    // Otomatis mengalirkan respons dengan grammY:
    await ctx.replyWithMarkdownStream(textStream);
  });
```

```ts [Deno]
import { streamText } from "npm:ai";
import { google } from "npm:@ai-sdk/google";

bot.chatType("private")
  .command("credits", async (ctx) => {
    // Kirim perintah ke LLM:
    const { textStream } = streamText({
      model: google("gemini-2.5-flash"),
      prompt: "Sebarapa keren bot grammY?",
    });

    // Otomatis mengalirkan respons dengan grammY:
    await ctx.replyWithMarkdownStream(textStream);
  });
```

:::

Pastikan untuk mengganti `gemini-2.5-flash` dengan model apapun yang tersedia.

## Ringkasan Plugin

- Nama: `stream`
- [Sumber](https://github.com/grammyjs/stream)
- [Referensi](/ref/stream/)
