---
prev: false
next: false
---

# Selalu Reply Pesan

> Catatan terjemahan: Kami membedakan istilah `balas` dengan `reply` agar tidak rancu.
> Balas berarti membalas chat seperti pada umumnya.
> Sedangkan reply merujuk ke [membalas pesan secara spesifik](https://telegram.org/blog/replies-mentions-hashtags#replies) sehingga menghasilkan utas pesan.

Terkadang kita perlu untuk selalu me-reply pesan, khususnya untuk bot yang digunakan bersama di suatu grup.
Kita bisa melakukannya dengan cara menambahkan parameter `reply_parameters` ke berbagai method pengirim pesan: `sendText`, `reply`, `sendPhoto`, `replyWithPhoto` dan lain-lain.
Namun, jika kamu melakukannya untuk setiap pesan yang masuk, cepat atau lambat kode kamu akan menjadi berantakan dan membosankan karena mengulang hal yang sama.

Plugin ini menyetel property `reply_parameters` ke semua method `reply*` dan `send*` agar setiap pesan dan chat yang dikehendaki di-reply secara otomatis.

Untuk memaksa bot tetap mengirim pesan meski pesan yang di-reply tidak tersedia, kamu bisa menyertakan sebuah object dengan property `allowSendingWithoutReply` ke paramater `options` di function `addReplyParam` ataupun `autoQuote`.

## Penggunaan

### Untuk Pesan Tertentu

Jika ingin me-reply pesan tertentu saja (misalnya hanya me-reply pesan command `demo`), maka kamu bisa melakukannya dengan cara seperti ini:

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { addReplyParam } from "@roziscoding/grammy-autoquote";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("Command demo!"); // Ini akan me-reply pesan user
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { addReplyParam } = require("@roziscoding/grammy-autoquote");

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("Command demo!"); // Ini akan me-reply pesan user
});

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { addReplyParam } from "https://deno.land/x/grammy_autoquote/mod.ts";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("Command demo!"); // Ini akan me-reply pesan user
});

bot.start();
```

:::

### Untuk Setiap Pesan

Jika ingin me-reply setiap pesan yang masuk, kamu bisa melakukannya dengan cara seperti ini:

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { autoQuote } from "@roziscoding/grammy-autoquote";

const bot = new Bot("");

bot.use(autoQuote());

bot.command("demo", async (ctx) => {
  await ctx.reply("Command demo!"); // Ini akan me-reply pesan user
});

bot.command("halo", async (ctx) => {
  await ctx.reply("Halo juga! :)"); // Ini juga akan me-reply pesan user
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { autoQuote } = require("@roziscoding/grammy-autoquote");

const bot = new Bot("");

bot.use(autoQuote());

bot.command("demo", async (ctx) => {
  await ctx.reply("Command demo!"); // Ini akan me-reply pesan user
});

bot.command("halo", async (ctx) => {
  await ctx.reply("Halo juga! :)"); // Ini juga akan me-reply pesan user
});

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { autoQuote } from "https://deno.land/x/grammy_autoquote/mod.ts";

const bot = new Bot("");

bot.use(autoQuote());

bot.command("demo", async (ctx) => {
  await ctx.reply("Command demo!"); // Ini akan me-reply pesan user
});

bot.command("halo", async (ctx) => {
  await ctx.reply("Halo juga! :)"); // Ini juga akan me-reply pesan user
});

bot.start();
```

:::

## Ringkasan Plugin

- Nama: Autoquote
- Sumber: <https://github.com/roziscoding/grammy-autoquote>
- Referensi API: <https://deno.land/x/grammy_autoquote/mod.ts>
