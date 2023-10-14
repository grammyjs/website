# Game

## Pengenalan

Game Telegram adalah fitur yang sangat menarik dan juga menyenangkan untuk dimainkan.
Apa yang bisa kamu lakukan dengannya?
Jawabannya adalah segalanya. Semua game HTML5 yang kamu buat bisa dimainkan di Telegram menggunakan fitur ini. Yup, artinya kamu harus terlebih dahulu mengembangkan game berbasis web yang bisa diakses oleh publik di internet sebelum diintegrasikan ke bot Telegram-mu.

## Menyetel Game untuk Bot Melalui @BotFather

Kita mengasumsikan bahwa kamu sudah menyetel bot beserta game-nya di [@BotFather](https://t.me/BotFather).
Jika belum, lihat [artikel](https://core.telegram.org/bots/games) berikut yang dibuat oleh tim Telegram.

> Catatan: Kita mempelajari dari sisi pengembangan bot-nya saja.
> Mengenai pengembangan game-nya terserah kepada developer.
> Yang kita butuhkan di sini adalah sebuah link yang merujuk ke game HTML5 yang bisa diakses melalui internet.

## Mengirim Game Melalui Bot

Di grammY, kita bisa mengirim game melalui method `replyWithGame`.
Ia akan mengambil nama game yang sudah dibuat di BotFather sebagai sebuah argument.
Cara lainnya, kita juga bisa menggunakan method `api.sendGame` (Semua method [API Bot](https://core.telegram.org/bots/api) resmi tersedia di grammY).
Keuntungan menggunakan method `api.sendGame` adalah kamu bisa menentukan `chat.id` pengguna yang akan dikirim.

1. Mengirim game melalui `replyWithGame`

   ```ts
   // Kita akan menggunakan command start untuk memanggil method reply game.
   bot.command("start", async (ctx) => {
     // Masukkan nama game yang sudah dibuat di BotFather, misal "cendol_hunter".
     await ctx.replyWithGame("cendol_hunter");
   });
   ```

2. Mengirim game melalui `api.sendGame`

   ```ts
   // Kirim ke user spesifik
   bot.command("start", async (ctx) => {
     // Kamu bisa mendapatkan id chat user menggunakan `ctx.from.id`.
     // Ia akan menyediakan id chat user yang memulai command start tersebut.
     const chatId = ctx.from.id;
     await ctx.api.sendGame(chatid, "gathotkaca_reborn");
   });
   ```

> [Ingat!](./basics#mengirim-pesan) Saat mengirim pesan, kamu bisa menentukan opsi lebih lanjut menggunakan opsi-opsi yang disediakan oleh object type `Other`.

Kamu juga bisa mengatur [inline keyboard](../plugins/keyboard#keyboard-inline) untuk menampilkan tombol khusus di pesan game tersebut.
Secara bawaan, ia akan dikirim dengan sebuah tombol bernama `Play my_game`, dimana _my_game_ adalah nama dari game kamu.

```ts
// Buat sebuah inline keyboard baru.
// Kamu bisa menulis teks apapun untuk ditampilkan di tombol.
// Tetapi, pastikan tombol pertama selalu tombol play!

const keyboard = new InlineKeyboard().game("Main game_pertamaku");

// Perhatikan bahwa kita barusan menggunakan game(),
// tidak seperti inline keyboard pada umumnya yang menggunakan url() atau text()

// Melalui method `replyWithGame`
await ctx.replyWithGame("game_pertamaku", { reply_markup: keyboard });

// Melalui method `api.sendGame`
await ctx.api.sendGame(chatId, "game_pertamaku", { reply_markup: keyboard });
```

## Menyimak Callback dari Tombol Game Kita

Untuk melakukan aksi ketika tombol ditekan, misal mengarahkan pengguna ke game kita atau aksi-aksi lainnya, kita harus menyimak event `callback_query:game_short_name`. Query ini akan memberi tahu kita kalau tombol telah ditekan oleh pengguna.
Berikut yang harus kita lakukan:

```ts
// Masukkan url game yang sudah di-hosting di web di sini.
bot.on("callback_query:game_short_name", async (ctx) => {
  await ctx.answerCallbackQuery({ url: "url_game_kamu" });
});
```

---

### Hasil Akhir Kode Kita Akan Terlihat seperti Ini

```ts
bot.on("callback_query:game_short_name", async (ctx) => {
  await ctx.answerCallbackQuery({ url: "url_game_kamu" });
});

bot.command("start", async (ctx) => {
  await ctx.replyWithGame("game_pertamaku", {
    reply_markup: keyboard,
    // kamu bisa menggunakan method api di sini, sesuai dengan kebutuhanmu.
  });
});
```

> Jangan lupa untuk memasang [error handler](./errors) ke bot kamu sebelum diluncurkan ke publik.

Di masa mendatang, kami mungkin akan melanjutkan artikel ini di materi tingkat lanjut dan FAQ, meski begitu kami rasa materi ini sudah cukup untuk dapat menjalankan game di Telegram.
Selamat bersenang-senang! :space_invader:
