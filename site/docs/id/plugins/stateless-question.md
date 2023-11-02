---
prev: false
next: false
---

# Stateless Question (`stateless-question`)

> Membuat stateless question di mode privasi

Apakah kamu ingin mengirim pertanyaan menggunakan bahasa yang sedang digunakan user tanpa perlu mematikan [mode privasi Telegram](https://core.telegram.org/bots/features#privacy-mode) serta tidak menyimpan statusnya saat ini?

Plugin ini bisa mengatasi masalah tersebut dengan mudah.

Konsep dasarnya adalah dengan mengirim sebuah pertanyaan menggunakan [teks spesial](https://en.wikipedia.org/wiki/Zero-width_non-joiner) di akhir kalimat.
Teks spesial ini tidak terlihat oleh user, namun dapat dibaca oleh bot.
Ketika user membalas pesan tersebut, maka pesan akan diperiksa apakah mengandung teks spesial di akhir kalimatnya.
Jika ada, balasan pesan tersebut adalah jawaban dari pertanyaan yang kita berikan.
Dengan demikian, kamu bisa memasukkan string berapapun jumlahnya ke pertanyaan yang sama ketika melakukan terjemahan.
Kamu hanya perlu memastikan nilai `uniqueIdentifier`-nya benar-benar unik.

## Penggunaan

```ts
import { StatelessQuestion } from "@grammyjs/stateless-question";

const bot = new Bot("");

const unicornQuestion = new StatelessQuestion("unicorns", async (ctx) => {
  console.log("User mengira unicorn sedang melakukan:", ctx.message);
});

// Jangan lupa gunakan middleware.
bot.use(unicornQuestion.middleware());

bot.command("rainbows", async (ctx) => {
  let text;
  if (ctx.session.language === "id") {
    text = "Apa yang unicorn sedang lakukan?";
  } else {
    text = "What are unicorns doing?";
  }

  return unicornQuestion.replyWithMarkdown(ctx, text);
});

// Atau kirim pertanyaanmu secara manual
// (pastikan untuk menggunakan parse_mode dan force_reply!).
bot.command("unicorn", async (ctx) => {
  await ctx.replyWithMarkdown(
    "What are unicorns doing?" + unicornQuestion.messageSuffixMarkdown(),
    { parse_mode: "Markdown", reply_markup: { force_reply: true } },
  );
});
bot.command("unicorn", async (ctx) => {
  await ctx.replyWithHTML(
    "What are unicorns doing?" + unicornQuestion.messageSuffixHTML(),
    { parse_mode: "HTML", reply_markup: { force_reply: true } },
  );
});
```

Lihat [README repo plugin](https://github.com/grammyjs/stateless-question) untuk informasi lebih lanjut.

## Ringkasan Plugin

- Nama: `stateless-question`
- Sumber: <https://github.com/grammyjs/stateless-question>
