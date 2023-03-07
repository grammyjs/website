---
prev: ./getting-started.md
next: ./context.md
---

# Mengirim dan Menerima Pesan

Begitu kamu menjalankan bot dengan `bot.start()`, grammY akan menyuplai listener dengan pesan-pesan yang telah dikirim oleh user ke bot kamu.
grammY juga menyediakan cara yang mudah untuk membalas pesan-pesan tersebut.

## Menerima Pesan

Cara termudah untuk menyimak pesan adalah melalui

```ts
bot.on("message", (ctx) => {
  const message = ctx.message; // object pesan
});
```

Selain itu, opsi-opsi lainnya juga tersedia:

```ts
// Menangani perintah, misal /start.
bot.command("start", (ctx) => { ... });

// Mencocokkan teks pesan dengan sebuah string atau regular expression (regex).
bot.hears(/echo *(.+)?/, (ctx) => { ... });
```

Kamu bisa menggunakan fitur auto-complete di code editor untuk melihat semua pilihan yang tersedia, ataupun melihat secara manual [daftar method](https://deno.land/x/grammy/mod.ts?s=Composer) dari sebuah class `Composer`.

> [Baca lebih lanjut](./filter-queries.md) tentang pemfilteran untuk jenis pesan tertentu menggunakan `bot.on()`.

## Mengirim Pesan

Semua method yang dapat digunakan oleh bot (**[daftar penting](https://core.telegram.org/bots/api#available-methods)**) tersedia di object `bot.api`.

```ts
// Mengirim sebuah pesan ke pengguna 12345.
await bot.api.sendMessage(12345, "Halo!");
// Selain itu, kamu juga bisa menambahkan beberapa opsi dalam bentuk object.
await bot.api.sendMessage(12345, "Halo!", {/* opsi lainnya */});
// Memeriksa object message dari pesan yang telah terkrim.
const message = await bot.api.sendMessage(12345, "Halo!");
console.log(message.message_id);

// Memperoleh informasi mengenai bot itu sendiri.
const me = await bot.api.getMe();

// Dan lain-lain
```

Setiap method memiliki opsi tambahan untuk object type `Other`, yang memungkinkan kamu untuk menetapkan opsi tambahan ketika memanggil API.
Opsi-opsi dari object ini sama persis dengan opsi yang ada di daftar method di link atas tadi.
Kamu juga dapat menggunakan fitur auto-complete di code editor untuk melihat semua opsi yang tersedia, ataupun melihat secara manual [daftar method](https://deno.land/x/grammy/mod.ts?s=Api) dari sebuah class `Api`.

Selain itu, coba lihat [materi selanjutnya](./context.md) untuk mempelajari bagaimana object context dari suatu listener bisa membuat pengiriman pesan menjadi sangat mudah dilakukan!

## Mengirim Pesan dengan Reply

> Catatan penerjemah: Kami membedakan kata "balas" dan "reply" agar tidak rancu. _Balas_ berarti membalas chat seperti pada umumnya. Sedangkan _reply_ merujuk ke [membalas pesan secara spesifik](https://telegram.org/blog/replies-mentions-hashtags#replies).

Kamu dapat menggunakan fitur `reply-to` milik Telegram dengan menentukan id pesan yang akan di-reply menggunakan `reply_to_message_id`.

```ts
bot.hears("ping", async (ctx) => {
  // `reply` adalah alias dari `sendMessage` (lihat materi selanjutnya).
  await ctx.reply("pong", {
    // `reply_to_message_id` akan menentukan untuk me-reply pesan yang mana.
    reply_to_message_id: ctx.msg.message_id,
  });
});
```

> Perhatikan bahwa dengan mengirim pesan melalui `ctx.reply` **BUKAN** berarti kamu secara otomatis me-reply pesan begitu saja.
> Sebaliknya, kamu harus mengisi `reply_to_message_id` untuk menentukan pesan mana yang mau di-reply.
> Function `ctx.reply` cuma alias dari `ctx.api.sendMessage`, lihat [materi berikutnya](./context.md#aksi-yang-tersedia).

## Mengirim Pesan dengan Format Tertentu

> Lihat [bagian opsi pemformatan](https://core.telegram.org/bots/api#formatting-options) di Referensi API Bot Telegram yang ditulis oleh tim Telegram.

Kamu dapat mengirim pesan dengan teks **bold**, _italic_, format URL, dan banyak lagi.
Ada dua cara untuk melakukannya: Markdown dan HTML. Referensinya bisa dilihat [di sini](https://core.telegram.org/bots/api#formatting-options)

### Markdown

> Lihat juga <https://core.telegram.org/bots/api#markdownv2-style>

Kirim pesan dengan markdown di dalamnya, lalu cantumkan `parse_mode: "MarkdownV2"`.

```ts
await bot.api.sendMessage(
  12345,
  "*Halo\\!* _Selamat datang_ di [grammY](https://grammy.dev)\\.",
  { parse_mode: "MarkdownV2" },
);
```

### HTML

> Lihat juga <https://core.telegram.org/bots/api#html-style>

Kirim pesan dengan element HTML di dalamnya, lalu cantumkan `parse_mode: "HTML"`.

```ts
await bot.api.sendMessage(
  12345,
  '<b>Halo!</b> <i>Selamat datang</i> di <a href="https://grammy.dev">grammY</a>.',
  { parse_mode: "HTML" },
);
```

## Mengirim File

Pemrosesan file dijelaskan secara lengkap di [materi lain](./files.md#mengirim-file).

## Reply Paksa (Force Reply)

> Force reply berguna jika bot kamu berjalan dalam [mode privasi](https://core.telegram.org/bots/features#privacy-mode) di chat grup.

Saat mengirim pesan, kamu dapat membuat aplikasi Telegram pengguna secara otomatis me-reply pesan tersebut.
Artinya, pengguna akan "dipaksa" me-reply pesan bot tadi (kecuali mereka menghapus reply tersebut secara manual).
Keuntungannya, bot masih bisa menerima pesan dari pengguna di dalam chat grup meskipun sedang berjalan dalam [mode privasi](https://core.telegram.org/bots/features#privacy-mode).

Kamu dapat menggunakan force reply seperti ini:

```ts
bot.command("start", async (ctx) => {
  await ctx.reply(
    "Halo! Aku hanya bisa membaca pesan yang secara khusus ditujukan untuk aku!",
    {
      // Buat aplikasi Telegram pengguna menunjukkan tampilan reply secara otomatis.
      reply_markup: { force_reply: true },
    },
  );
});
```
