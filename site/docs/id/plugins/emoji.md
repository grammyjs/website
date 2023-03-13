# Plugin Emoji (`emoji`)

Dengan plugin ini, kamu bisa menambahkan emoji secara otomatis di pesan balasanmu tanpa perlu bolak-balik copy-paste emoji dari web ke kode kamu.

## Kenapa Aku Perlu Plugin Ini?

Kenapa tidak? Orang-orang sering menggunakan emoji di kode mereka untuk mengilustrasikan pesan yang ingin disampaikan ataupun menata sesuatu supaya terlihat lebih baik.
Sayangnya, kamu akan kehilangan fokus setiap kali kamu membutuhkan sebuah emoji baru.

1. Pertama, kamu berhenti menulis kode untuk mencari emoji tersebut.
2. Kemudian, kamu membuka chat Telegram lalu menghabiskan waktu kurang lebih 6 detik (atau bahkan lebih) untuk mencari emoji yang kamu inginkan.
3. Terakhir, kamu menyalin emoji tersebut ke dalam kode, lalu melanjutkan menulis kode dan semoga kamu tidak lupa sudah sampai mana kamu tadi menulis kode (baca: kehilangan fokus).

Dengan plugin ini, kamu tidak akan kehilangan fokus karena berulang kali berhenti menulis kode hanya untuk menyalin emoji.
Di samping itu, ada juga yang mengalami lag di sistem mereka ketika berpindah aplikasi atau bahkan code editor mereka tidak dapat menampilkan emoji, sehingga mereka hanya melihat sebuah kotak putih seperti pesan menyedihkan ini, `I'm so happy □`.

Plugin ini bertujuan untuk mengatasi permasalahan tersebut dengan cara membantu kamu mengurai emoji di semua sistem dan menyediakan cara yang mudah untuk mencari emoji menggunakan fitur auto-complete.
Sekarang, langkah-langkah di atas bisa dikurangi menjadi satu langkah berikut:

1. Tulis emoji yang kamu inginkan langsung di kode kamu. Semudah itu.

### Apakah Ini Ilmu Sulap?

Bukan sulap, bukan juga sihir.
Teknik ini dinamakan template string.
Kamu bisa membacanya lebih lanjut [di sini](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).

## Penginstalan dan Contoh Penggunaannya

Kamu bisa menginstal plugin ini di bot kamu dengan cara seperti ini:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context } from "grammy";
import { EmojiFlavor, emojiParser } from "@grammyjs/emoji";

// Ini dinamakan Context Flavor
// Kamu bisa membacanya di sini:
// https://grammy.dev/id/guide/context.html#transformative-context-flavor
type MyContext = EmojiFlavor<Context>;

const bot = new Bot<MyContext>(""); // <-- taruh token bot-mu diantara "" 

bot.use(emojiParser());
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");
const { emojiParser } = require("@grammyjs/emoji");

const bot = new Bot(""); // <-- taruh token bot-mu diantara ""

bot.use(emojiParser());
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  EmojiFlavor,
  emojiParser,
} from "https://deno.land/x/grammy_emoji/mod.ts";

// Ini dinamakan Context Flavor
// Kamu bisa membacanya di sini:
// https://grammy.dev/id/guide/context.html#transformative-context-flavor
type MyContext = EmojiFlavor<Context>;

const bot = new Bot<MyContext>(""); // <-- taruh token bot-mu diantara ""

bot.use(emojiParser());
```

</CodeGroupItem>
</CodeGroup>

Sekarang, kamu bisa mencari emoji berdasarkan namanya:

```js
bot.command("start", async (ctx) => {
  const parsedString = ctx.emoji`Halo! ${"smiling_face_with_sunglasses"}`; // => Halo! 😎
  await ctx.reply(parsedString);
});
```

Cara lainnya, kamu bisa membalas secara langsung menggunakan method `replyWithEmoji`:

```js
bot.command("ping", async (ctx) => {
  await ctx.replyWithEmoji`Pong ${"ping_pong"}`; // => Pong 🏓
});
```

::: warning Perlu Diperhatikan
`ctx.emoji` dan `ctx.replyWithEmoji` **SELALU** menggunakan template string.
Jika kamu belum familiar dengan syntax tersebut, pahami terlebih dahulu [materi ini](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).
:::

## Ringkasan Plugin

- Nama: `emoji`
- Sumber: <https://github.com/grammyjs/emoji>
- Referensi: <https://deno.land/x/grammy_emoji/mod.ts>
