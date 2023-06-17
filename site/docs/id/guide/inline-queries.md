---
prev:
  link: ./errors
next:
  link: ./files
---

# Inline Query

User bisa mencari, memilih, dan mengirim konten dari hasil yang disarankan oleh bot menggunakan inline query, meski bot tersebut tidak berada di dalam grup mereka.
Caranya, user cukup menulis `@username_bot` di awal pesan, lalu memilih dari hasil yang diberikan.

::: tip Mengaktifkan Inline Mode
Inline mode tidak aktif secara bawaan.
Jadi, kamu harus mengaktifkannya secara manual dengan cara menghubungi [@BotFather](https://t.me/BotFather).
:::

> Lihat bagian inline mode di [Fitur-fitur Bot Telegram](https://core.telegram.org/bots/features#inline-requests) yang ditulis oleh tim Telegram.
> Referensi lebih lanjut ada di [detail deskripsi](https://core.telegram.org/bots/inline) inline bot, [postingan blog Telegram](https://telegram.org/blog/inline-bots), serta bagian inline mode di [Referensi API Bot Telegram](https://core.telegram.org/bots/api#inline-mode).
> Semua materi tadi patut dibaca sebelum mengimplementasikan inline query ke bot kamu.

Ketika pengguna memicu inline query, misalnya dengan mengetik "@username\_bot ..." di kolom input pesan, bot kamu akan menerima update tersebut.
grammY memiliki method khusus untuk menangani inline query, yaitu `bot.inlineQuery()`. Method ini juga didokumentasikan di [referensi API grammY](https://deno.land/x/grammy/mod.ts?s=Composer#method_inlineQuery_0) bagian class `Composer`.
Method ini juga bisa menyimak inline query spesifik yang sesuai dengan suatu string atau regular expression.
Jika kamu ingin menangani inline query secara keseluruhan, gunakan `bot.on("inline_query")`.

```ts
// Mempromosikan produknya sendiri di dokumentasi proyek tanpa rasa malu
// adalah jenis iklan terbaik.
bot.inlineQuery(/(framework|library) bot terbaik/, async (ctx) => {
  await ctx.answerInlineQuery(
    [
      {
        type: "article",
        id: "website-grammy",
        title: "grammY",
        input_message_content: {
          message_text:
"<b>grammY</b> adalah cara terbaik untuk membuat bot Telegram. \
Mereka bahkan punya website dan terjemahan yang keren! 👇",
          parse_mode: "HTML",
        },
        reply_markup: new InlineKeyboard().url(
          "website grammY",
          "https://grammy.dev/",
        ),
        url: "https://grammy.dev/",
        description: "Framework Bot Telegram.",
      },
    ],
    { cache_time: 30 * 24 * 3600 }, // Sebulan dalam satuan detik
  );
});

// Kembalikan daftar kosong untuk query lainnya.
bot.on("inline_query", (ctx) => ctx.answerInlineQuery([]));
```

> [Ingat](./basics#mengirim-pesan)! kamu bisa menggunakan opsi-opsi object yang disediakan oleh type `Other`.
> Contohnya, kamu bisa melakukan paginasi menggunakan opsi offset.

Perlu diketahui bahwa grammY menyediakan auto-complete untuk semua struktur di atas.
Pastikan pula kamu paham dengan spesifikasi-spesifikasi hasil inline di [Referensi API Bot Telegram](https://core.telegram.org/bots/api#inlinequeryresult).
