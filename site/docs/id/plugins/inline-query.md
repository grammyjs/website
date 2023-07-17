---
prev: false
next: false
---

# Inline Query (bawaan)

User bisa mencari, memilih, dan mengirim konten dari hasil yang disarankan oleh bot menggunakan inline query, meski bot tersebut tidak berada di dalam grup mereka.
Caranya, user cukup menulis `@username_bot` di awal pesan, lalu memilih dari hasil yang diberikan.

> Kunjungi bagian inline mode di [Fitur-fitur Bot Telegram](https://core.telegram.org/bots/features#inline-requests) yang ditulis oleh tim Telegram.
> Referensi lebih lanjut ada di [detail deskripsi](https://core.telegram.org/bots/inline) inline bot, [postingan blog Telegram](https://telegram.org/blog/inline-bots), serta bagian inline mode di [Referensi API Bot Telegram](https://core.telegram.org/bots/api#inline-mode).
> Semua materi tadi patut dibaca sebelum mengimplementasikan inline query ke bot kamu, mengingat inline query sedikit lebih rumit.
> Jika kamu tidak ingin membaca materi-materi di atas, maka di halaman ini kamu akan dipandu untuk setiap langkahnya.

## Mengaktifkan Inline Mode

Inline mode tidak aktif secara bawaan.
Jadi, kamu harus mengaktifkannya secara manual dengan cara menghubungi [@BotFather](https://t.me/BotFather).

Sudah diatur?
Sekarang, ketika kamu mengetik nama bot di kolom teks, aplikasi Telegram seharusnya menampilkan "..." beserta animasi memuatnya.
Coba mulai ketik teks apapun.
Selanjutnya, mari kita tangani query tersebut.

## Menangani Inline Query

Ketika pengguna memicu inline query, misalnya dengan mengetik "@nama_bot_kamu ..." di kolom input pesan, bot kamu akan menerima update tersebut.
grammY memiliki method khusus untuk menangani inline query, yaitu `bot.inlineQuery()`.
Method ini didokumentasikan di [referensi API grammY](https://deno.land/x/grammy/mod.ts?s=Composer#method_inlineQuery_0) di bagian class `Composer`.
Method ini juga bisa menyimak inline query spesifik yang sesuai dengan suatu string atau regular expression.
Jika kamu ingin menangani inline query secara keseluruhan, gunakan `bot.on("inline_query")`.

```ts
// Menyimak regular expressions (regex) atau string tertentu.
bot.inlineQuery(/(framework|library) bot terbaik/, async (ctx) => {
  const match = ctx.match; // object match regex
  const query = ctx.inlineQuery.query; // string query 
};

// Menyimak semua inline query.
bot.on("inline_query", async (ctx) => {
  const query = ctx.inlineQuery.query; // string query
});
```

Sekarang kita tahu bagaimana cara menyimak update inline query, yang kemudian kita respon dengan sebuah daftar hasil.

## Membuat Hasil Inline Query

Membuat daftar hasil untuk inline query adalah pekerjaan yang melelahkan karena kamu perlu membuat [object bertingkat yang rumit](https://core.telegram.org/bots/api#inlinequeryresult) dengan berbagai macam property.
Untungnya, karena kamu sedang menggunakan grammY, maka sudah pasti tersedia pembantu untuk mempermudah pekerjaan tersebut.

Setiap hasil memerlukan tiga hal:

1. Sebuah string identifikasi yang unik.
2. Sebuah _object hasil_ yang mendeskripsikan bagaimana hasil inline query akan ditampilkan.
   Ia bisa memuat berbagai hal seperti judul, link, atau gambar.
3. Sebuah _object konten pesan_ yang mendeskripsikan isi atau konten pesannya, yang akan dikirim oleh user jika mereka memilih hasil tersebut.
   Di beberapa kasus, konten pesan bisa ditentukan secara implisit dari object hasilnya.
   Contohnya, jika kamu ingin suatu hasil ditampilkan sebagai GIF, maka Telegram akan tahu konten pesannya adalah GIF yang sama tersebut---kecuali jika object konten pesan sudah ditentukan sebelumnya.

grammY mengekspor sebuah _builder_ atau pembangun hasil query inline bernama `InlineQueryResultBuilder`.
Berikut contoh penggunaanya.

::: code-group

```ts [TypeScript]
import { InlineKeyboard, InlineQueryResultBuilder } from "grammy";

// Membuat sebuah hasil foto.
InlineQueryResultBuilder.photo("id-0", "https://grammy.dev/images/Y.jpeg");

// Membuat sebuah hasil yang menampilkan sebuah foto, tetapi dikirim dalam bentuk sebuah pesan teks.
InlineQueryResultBuilder.photo("id-1", "https://grammy.dev/images/Y.jpeg")
  .text("Alih-alih foto, teks ini yang akan dikirim.");

// Buat sebuah hasil teks.
InlineQueryResultBuilder.article("id-2", "Inline Query")
  .text(
    "Dokumentasi inline query yang menakjubkan: grammy.dev/id/plugins/inline-query",
  );

// Meneruskan opsi lanjutan ke hasil.
const keyboard = new InlineKeyboard()
  .text("Horas!", "Panggil aku kembali");
InlineQueryResultBuilder.article("id-3", "Pilih aku", {
  reply_markup: keyboard,
})
  .text("Tekan tombolku");

// Meneruskan opsi lanjutan ke konten pesan.
InlineQueryResultBuilder.article("id-4", "Inline Query")
  .text("Dokumentasi yang **mencenangkan**: grammy.dev", {
    parse_mode: "MarkdownV2",
  });
```

```js [JavaScript]
const { InlineKeyboard, InlineQueryResultBuilder } = require("grammy");

// Membuat sebuah hasil foto.
InlineQueryResultBuilder.photo("id-0", "https://grammy.dev/images/Y.jpeg");

// Membuat sebuah hasil yang menampilkan sebuah foto, tetapi dikirim dalam bentuk sebuah pesan teks.
InlineQueryResultBuilder.photo("id-1", "https://grammy.dev/images/Y.jpeg")
  .text("Alih-alih foto, teks ini yang akan dikirim.");

// Buat sebuah hasil teks.
InlineQueryResultBuilder.article("id-2", "Inline Query")
  .text(
    "Dokumentasi inline query yang menakjubkan: grammy.dev/id/plugins/inline-query",
  );

// Meneruskan opsi lanjutan ke hasil.
const keyboard = new InlineKeyboard()
  .text("Horas!", "Panggil aku kembali");
InlineQueryResultBuilder.article("id-3", "Pilih aku", {
  reply_markup: keyboard,
})
  .text("Tekan tombolku");

// Meneruskan opsi lanjutan ke konten pesan.
InlineQueryResultBuilder.article("id-4", "Inline Query")
  .text("Dokumentasi yang **mencenangkan**: grammy.dev", {
    parse_mode: "MarkdownV2",
  });
```

```ts [Deno]
import {
  InlineKeyboard,
  InlineQueryResultBuilder,
} from "https://deno.land/x/grammy/mod.ts";

// Membuat sebuah hasil foto.
InlineQueryResultBuilder.photo("id-0", "https://grammy.dev/images/Y.jpeg");

// Membuat sebuah hasil yang menampilkan sebuah foto, tetapi dikirim dalam bentuk sebuah pesan teks.
InlineQueryResultBuilder.photo("id-1", "https://grammy.dev/images/Y.jpeg")
  .text("Alih-alih foto, teks ini yang akan dikirim.");

// Buat sebuah hasil teks.
InlineQueryResultBuilder.article("id-2", "Inline Query")
  .text(
    "Dokumentasi inline query yang menakjubkan: grammy.dev/id/plugins/inline-query",
  );

// Meneruskan opsi lanjutan ke hasil.
const keyboard = new InlineKeyboard()
  .text("Horas!", "Panggil aku kembali");
InlineQueryResultBuilder.article("id-3", "Pilih aku", {
  reply_markup: keyboard,
})
  .text("Tekan tombolku");

// Meneruskan opsi lanjutan ke konten pesan.
InlineQueryResultBuilder.article("id-4", "Inline Query")
  .text("Dokumentasi yang **mencenangkan**: grammy.dev", {
    parse_mode: "MarkdownV2",
  });
```

:::

Perlu diperhatikan, jika kamu ingin mengirim berkas menggunakan pengidentifikasi berkas yang sudah ada, kamu perlu menggunakan method `*Cached`.

```ts
// Hasil dari sebuah berkas audio yang dikirm menggunakan pengidentifikasi berkas.
const audioFileId = "AgADBAADZRAxGyhM3FKSE4qKa-RODckQHxsoABDHe0BDC1GzpGACAAEC";
InlineQueryResultBuilder.audioCached("id-0", audioFileId);
```

> Baca lebih lanjut mengenai pengidentifikasi berkas [di sini](../guide/files#bagaimana-file-bekerja-di-bot-telegram).

Kamu sebaiknya membaca [referensi API](https://deno.land/x/grammy/mod.ts?s=InlineQueryResultBuilder) `InlineQueryResultBuilder` dan mungkin juga [spesifikasi](https://core.telegram.org/bots/api#inlinequeryresult) `InlineQueryResult` untuk melihat opsi-opsi yang tersedia.

## Merespon Inline Query

Setelah membuat sebuah array hasil inline query menggunakan pembangun [di atas](#membuat-hasil-inline-query), kamu bisa memanggil `answerInlineQuery` untuk mengirim hasil tersebut ke user.

```ts
// Mempromosikan produknya sendiri di dokumentasi proyek tanpa rasa malu adalah salah satu cara promosi terbaik.
bot.inlineQuery(/(framework|library) bot terbaik/, async (ctx) => {
  // Buat sebuah hasil tunggal inline query.
  const result = InlineQueryResultBuilder
    .article("id:grammy-website", "grammY", {
      reply_markup: new InlineKeyboard()
        .url("website grammY", "https://grammy.dev/id/"),
    })
    .text(
      `<b>grammY</b> adalah cara terbaik untuk membuat bot Telegram.
Mereka bahkan punya website dengan terjemahan yang keren! 👇`,
      { parse_mode: "HTML" },
    );

  // Respon inline query-nya.
  await ctx.answerInlineQuery(
    [result], // respon dengan daftar hasil di atas
    { cache_time: 30 * 24 * 3600 }, // 30 hari dalam satuan detik
  );
});

// Kembalikan daftar kosong untuk query lainnya.
bot.on("inline_query", (ctx) => ctx.answerInlineQuery([]));
```

[Ingat!](../guide/basics#mengirim-pesan)
Kamu bisa menentukan opsi lanjutan ketika memanggil method API menggunakan object opsi type `Other`.
Contohnya, dengan `answerInlineQuery`, kamu bisa membuat paginasi untuk inline query menggunakan sebuah offset, seperti yang bisa dilihat [di sini](https://core.telegram.org/bots/api#answerinlinequery).

::: tip Mencampur Teks dan Media
Meski diperbolehkan untuk mengirim sebuah daftar hasil yang mengandung kedua element media dan teks, namun sebagian besar aplikasi Telegram tidak mampu menampilkan hasilnya dengan baik.
Demi kenyamanan pengguna, lebih baik tidak dilakukan.
:::

## Tombol di Atas Hasil Inline Query

Aplikasi Telegram mampu [menampilkan sebuah tombol](https://core.telegram.org/bots/api#inlinequeryresultsbutton) di atas daftar hasil.
Tombol ini mampu mengarahkan user untuk melakukan obrolan pribadi dengan bot kamu.

```ts
const button = {
  text: "Buka obrolan pribadi",
  start_parameter: "login",
};
await ctx.answerInlineQuery(results, { button });
```

Ketika user menekan tombol tersebut, sebuah pesan perintah `/start` akan dikirim ke bot kamu.
Parameter start-nya tersedia melalui [penautan mendalam](../guide/commands#dukungan-deep-linking).
Artinya, dari potongan kode di atas, `ctx.match` akan mendapatkan nilai `"login"` di penanganan perintah kamu.

Jika setelahnya kamu mengirim sebuah [inline keyboard](./keyboard#membuat-keyboard-inline) menggunakan sebuah tombol `switchInline`, user akan dibawa kembali ke chat dimana mereka menekan tombol hasil inline query di awal.

```ts
bot
  .command("start")
  .filter((ctx) => ctx.match === "login", async (ctx) => {
    // User datang dari hasil inline query.
    await ctx.reply("Obrolan pribadi terbuka, sekarang kamu bisa kembali!", {
      reply_markup: new InlineKeyboard()
        .switchInline("Kembali"),
    });
  });
```

Dengan cara seperti itu, kamu bisa melakukan banyak hal, misalnya prosedur login di obrolan pribadi dengan user sebelum mengirimkan hasil inline query.
Percakapannya bisa dilakukan beberapa kali sebelum kamu mengirim mereka kembali.
Sebagai contoh, kamu bisa [memasuki sebuah percakapan singkat](./conversations#menginstal-dan-memasuki-sebuah-percakapan) menggunakan plugin percakapan.

## Mendapatkan Umpan Balik dari Hasil yang Dipilih

Hasil inline query dikirim dengan konsep kirim-dan-lupakan.
Dengan kata lain, setelah bot mengirim daftar hasil inline query ke Telegram, ia tidak akan tahu hasil yang mana yang dipilih oleh user (atau jika mereka sama sekali tidak memilihnya).

Jika kamu tertarik, kamu bisa mengaktifkan umpan balik inline di [@BotFather](https://t.me/BotFather).
Kamu bisa menentukan berapa banyak umpan balik yang ingin diterima dengan cara memilih rentang opsi dari 0% (umpan balik dinonaktifkan) hingga 100% (terima semua umpan balik).

Umpan balik inline dikirim melalui update `chosen_inline_result`.
Kamu bisa menyimak pengidentifikasi hasil tertentu melalui string atau regular expression(regex).
Selain itu, kamu juga bisa menyimak update dengan cara yang biasanya menggunakan penyaring query (filter queries).

```ts
// Menyimak pengidentifikasi hasil tertentu.
bot.chosenInlineResult(/id-[0-9]+/, async (ctx) => {
  const match = ctx.match; // object match regex
  const query = ctx.chosenInlineResult.query; // query inline yang sudah terpakai
});

// Menyimak semua hasil inline.
bot.on("chosen_inline_result", async (ctx) => {
  const query = ctx.chosenInlineResult.query; // query inline yang sudah terpakai
});
```

Beberapa bot menerapkan 100% umpan balik lalu menggunakannya sebagai sebuah trik khusus.
Melalui `answerInlineQuery`, mereka mengirim pesan tiruan tanpa menyertakan konten aslinya .
Segera setelah menerima sebuah update `chosen_inline_result`, mereka mengubah pesan tersebut dan baru menyisipkan konten pesan aslinya.

Bot semacam ini tidak akan bekerja untuk admin anonim ataupun ketika mengirim pesan berjadwal, karena di sana tidak ada umpan balik inline yang bisa diterima.
Namun, jika ini bukanlah suatu masalah besar untukmu, trik ini bisa kamu gunakan untuk menghindari pembuatan konten pesan yang berlebihan karena tidak pernah dikirim.
Ini bisa menghemat sumber daya bot kamu.

## Ringkasan Pesan

Plugin ini tersedia secara bawaan di inti grammY.
Kamu tidak perlu menginstal apapun untuk menggunakannya.
Cukup impor semuanya dari grammY itu sendiri.

Selain itu, baik dokumentasi maupun referensi API plugin ini dijadikan satu dengan paket inti.
