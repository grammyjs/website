---
prev: false
next: false
---

# Streaming Message Drafts (`stream`)

Plugin ini memungkinkan Anda untuk mengirim pesan teks panjang ke Telegram.
Setiap [iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) potongan teks dapat langsung dialirkan ke obrolan pribadi mana pun.

Misalnya, Anda dapat membuat output LLM [muncul secara bertahap](#llm-integration) saat menghasilkan respons.

## Panduan Cepat

Plugin ini menginstal [`ctx.replyWithStream`](/ref/stream/streamcontextextension#replywithstream) pada objek konteks [context object](../guide/context).

> Streaming pesan melakukan banyak panggilan API dengan sangat cepat.
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
    await ctx.replyWithStream(textStream);
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
    await ctx.replyWithStream(textStream);
  });
```

:::

Pastikan untuk mengganti `gemini-2.5-flash` dengan model apapun yang tersedia.

## Streaming Formatted Messages

Ini jauh _lebih_ sulit daripada yang kamu bayangkan.

1. LLMs menghasilkan Markdown _probabilistik_.
   Seringkali benar, tetapi kadang-kadang tidak.
   Tidak mengikuti standar tertentu.
   Khususnya, **mereka tidak selalu menghasilkan Markdown yang kompatibel dengan Telegram**.
   Ini berarti mencoba mengirim ke Telegram akan gagal.
2. LLMs menghasilkan entitas Markdown yang _parsial_.
   Meskipun outputnya sepenuhnya sesuai dengan spesifikasi [MarkdownV2](https://core.telegram.org/bots/api#markdownv2-style) Telegram, **potongan outputnya mungkin rusak**.
   Jika Anda membuka bagian teks miring tetapi hanya menutupnya di potongan berikutnya, streaming akan crash dan pesan tidak akan terkirim.
3. LLMs terkadang menghasilkan format yang tidak didukung oleh Telegram (meskipun Anda telah menginstruksikan mereka untuk tidak melakukannya).
   Misalnya, sebagian besar LLMs sangat menyukai **tabel, poin-poin, dan daftar bernomor**.
   Klien Telegram tidak dapat menampilkannya.

> Telegram juga mendukung format [HTML](https://core.telegram.org/bots/api#html-style).
> Ini memiliki masalah yang sama persis dengan Markdown.
> Selain itu, output HTML mengonsumsi jauh lebih banyak token, yang tidak diperlukan dan mahal.

Jadi... apa sekarang?

Sayangnya, tidak ada solusi yang baik.
Namun, berikut beberapa ide:

- Minta LLM Anda untuk menghasilkan teks tanpa format.
- Semoga LLM Anda tidak membuat kesalahan saat menghasilkan Markdown, dan jika gagal, coba ulang dengan teks biasa.
- Gunakan format HTML dan semoga ini dapat memperbaiki situasi sedikit.
- Tulis fungsi [transformer](../advanced/transformers) kustom yang secara otomatis mencoba ulang permintaan yang gagal.
- Gunakan parser Markdown streaming dan buat array [`MessageEntity`](https://core.telegram.org/bots/api#messageentity) Anda sendiri untuk memformat setiap [`MessageDraftPiece`](/ref/stream/messagedraftpiece)
- Stream Markdown dalam teks biasa, lalu gunakan parser Markdown biasa untuk menerapkan pemformatan hanya setelah stream selesai dan semua pesan dikirim.
- Temukan solusi brilian yang belum pernah dipikirkan orang lain sebelumnya, dan ceritakan kepada kami di [group chat](https://t.me/grammyjs)

## Plugin Summary

- Nama: `stream`
- [Sumber](https://github.com/grammyjs/stream)
- [Referensi](/ref/stream/)
