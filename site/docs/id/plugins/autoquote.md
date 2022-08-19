# Selalu Reply Pesan

> Catatan terjemahan: Kami membedakan istilah `balas` dengan `reply` agar tidak rancu.
> Balas berarti membalas chat seperti pada umumnya.
> Sedangkan reply merujuk ke [membalas pesan secara spesifik](https://telegram.org/blog/replies-mentions-hashtags#replies) sehingga menghasilkan utas pesan.

Terkadang kita perlu untuk selalu me-reply pesan, khususnya untuk bot yang digunakan bersama di suatu grup.
Kita bisa melakukannya dengan cara menambahkan parameter `reply_to_message_id` ke berbagai method pengirim pesan: `sendText`, `reply`, `sendPhoto`, `replyWithPhoto` dan lain-lain.
Namun, jika kamu melakukannya untuk setiap pesan yang masuk, cepat atau lambat kode kamu akan menjadi berantakan dan membosankan karena mengulang hal yang sama.

Plugin ini memasang parameter `reply_to_message_id` ke `ctx.msg.message_id` untuk semua method`reply*` dan `send*` agar setiap pesan yang dikehendaki langsung di-reply secara otomatis.

## Penggunaan

### Untuk Pesan Tertentu

Jika ingin me-reply pesan tertentu saja (misalnya hanya me-reply pesan command `demo`), maka kamu bisa melakukannya dengan cara seperti ini:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";
import { addReplyParam } from "@roziscoding/grammy-autoquote";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("Command demo!"); // Ini akan me-reply pesan user
});

bot.start();
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");
const { addReplyParam } = require("@roziscoding/grammy-autoquote");

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("Command demo!"); // Ini akan me-reply pesan user
});

bot.start();
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { addReplyParam } from "https://deno.land/x/grammy_autoquote/mod.ts";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("Command demo!"); // Ini akan me-reply pesan user
});

bot.start();
```

</CodeGroupItem>
</CodeGroup>

### Untuk Semua Pesan

Jika ingin me-reply semua pesan yang masuk, kamu bisa melakukannya dengan cara seperti ini:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";
import { autoQuote } from "@roziscoding/grammy-autoquote";

const bot = new Bot("");

bot.use(autoQuote);

bot.command("demo", async (ctx) => {
  await ctx.reply("Command demo!"); // Ini akan me-reply pesan user
});

bot.command("halo", async (ctx) => {
  await ctx.reply("Halo juga! :)"); // Ini juga akan me-reply pesan user
});

bot.start();
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");
const { autoQuote } = require("@roziscoding/grammy-autoquote");

const bot = new Bot("");

bot.use(autoQuote);

bot.command("demo", async (ctx) => {
  await ctx.reply("Command demo!"); // Ini akan me-reply pesan user
});

bot.command("halo", async (ctx) => {
  await ctx.reply("Halo juga! :)"); // Ini juga akan me-reply pesan user
});

bot.start();
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { autoQuote } from "https://deno.land/x/grammy_autoquote/mod.ts";

const bot = new Bot("");

bot.use(autoQuote);

bot.command("demo", async (ctx) => {
  await ctx.reply("Command demo!"); // Ini akan me-reply pesan user
});

bot.command("halo", async (ctx) => {
  await ctx.reply("Halo juga! :)"); // Ini juga akan me-reply pesan user
});

bot.start();
```

</CodeGroupItem>
</CodeGroup>

## Ringkasan Plugin

- Nama: Autoquote
- Sumber: <https://github.com/roziscoding/grammy-autoquote>
- Referensi: <https://doc.deno.land/https://deno.land/x/grammy_autoquote/mod.ts>
