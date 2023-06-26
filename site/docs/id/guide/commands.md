---
prev: ./filter-queries.md
next: ./middleware.md
---

# Command

Command atau perintah adalah entity khusus di dalam pesan Telegram yang berfungsi sebagai instruksi untuk sebuah bot.

## Penggunaan

> Lihat bagian commands di dokumentasi [Fitur-fitur Bot Telegram](https://core.telegram.org/bots/features#commands) yang ditulis oleh tim Telegram.

grammY menyediakan listener khusus untuk menangani command (misal `/start` dan `/help`) yang bisa kamu pasang secara langsung melalui `bot.command()`.

```ts
// Merespon command /start.
bot.command("start" /* , ... */);
// Merespon command /help.
bot.command("help" /* , ... */);
// Merespon command /a, /b, /c, dan /d.
bot.command(["a", "b", "c", "d"] /* , ... */);
```

Perlu dicatat bahwa hanya command yang ditulis persis di awal pesan yang akan direspon. Ketika seorang user mengirim pesan `"Jangan kirim command /start ke bot!"`, maka listener tidak akan meresponnya meskipun terdapat command `/start` di isi pesan tersebut, karena letak command `/start` tidak berada di awal pesan.

Telegram mendukung pengiriman command yang secara khusus ditujukan ke bot tertentu, contohnya command yang diakhiri dengan `@username_bot_kamu`.
grammY juga akan merespon pesan tersebut secara otomatis, sehingga pesan yang berisi `/start` ataupun `/start@username_bot_kamu` akan sama-sama dianggap sebagai command, yang kemudian akan ditangkap oleh listener `bot.command("start")`.
Kamu juga bisa memilih untuk hanya merespon command yang secara khusus ditujukan ke bot kamu dengan menulis `bot.command("start@username_bot_kamu")`.

::: tip Menyarankan Command ke User
Kamu bisa memanggil

```ts
await bot.api.setMyCommands([
  { command: "start", description: "Mulai bot ini" },
  { command: "help", description: "Tampilkan bantuan" },
  { command: "settings", description: "Buka pengaturan" },
]);
```

untuk membuat aplikasi Telegram user menampilkan daftar command yang disarankan di kolom input teks.

Kamu juga bisa mengaturnya secara manual dengan chat ke _Bapak bot_ [@BotFather](https://t.me/BotFather).
:::

## Argument

Seorang user bisa mengirim command beserta **argument**-nya.
Kamu bisa memperoleh string argument tersebut melalui `ctx.match`.

```ts
bot.command("add", async (ctx) => {
  // `item` akan menjadi "ayam geprek"
  // kalau pengguna mengirim pesan "/add ayam geprek".
  const item = ctx.match;
});
```

Perlu dicatat bahwa seluruh isi teks pesan selalu bisa diakses melalui `ctx.msg.text`.

## Dukungan Deep Linking

> Lihat bagian deep linking di dokumentasi [Fitur-fitur Bot Telegram](https://core.telegram.org/bots/features#deep-linking) yang ditulis oleh tim Telegram.

Ketika pengguna mengunjungi `https://t.me/username_bot_kamu?start=migoreng`, aplikasi Telegram mereka akan menampilkan sebuah tombol MULAI yang---kalau dipencet---akan mengirim pesan beserta string dari parameter URL-nya. Dari contoh tadi, isi pesannya akan menjadi `"/start migoreng"`. Nah,`"migoreng"` ini adalah muatannya atau disebut dengan `payload`.
Aplikasi Telegram akan menyembunyikan isi payload tersebut dari pengguna, yang mereka lihat cuma `"/start"`. Tetapi, bot kamu tetap akan menerima pesannya secara utuh.
grammY kemudian mengambil payload tersebut, lalu meneruskannya ke `ctx.match`.
Berdasarkan link dari contoh di atas, `ctx.match` akan berisi string `"migoreng"`.

Deep linking akan bermanfaat ketika kamu ingin membuat sistem referral, ataupun melacak dari mana pengguna menemukan bot-mu.
Contohnya, bot kamu bisa memposting di channel dengan menyertakan sebuah tombol [inline keyboard](../plugins/keyboard.md#keyboard-inline) di bawah postingan tersebut.
Tombol ini berisi URL yang mirip dengan contoh di atas, misal `https://t.me/username_bot_kamu?start=dari-postingan-channel-drama-ojol-nomor-123`.
Ketika user memencet tombol tersebut, aplikasi Telegram mereka akan membuka chat pribadi dengan bot kamu, sambil menampilkan tombol MULAI seperti yang sudah dijelaskan di atas.
Dengan cara tersebut, bot-mu bisa mengidentifikasi dari mana pengguna tersebut berasal melalui tombol khusus di bawah postingan channel tadi.

Tentu saja, selain di Telegram, kamu juga bisa menyematkan link tersebut di berbagai tempat: website, email, akun media sosial, kode QR, dll.

Silahkan lihat [materi dokumentasi Telegram](https://core.telegram.org/api/links#bot-links) berikut untuk melihat daftar lengkap format link yang bisa digunakan.
Salah satunya diantaranya adalah kita bisa menggunakan format link tertentu untuk meminta user menambahkan bot ke dalam grup atau channel, dan bisa juga sekaligus meminta izin akses administrator yang diperlukan untuk bot kamu.
