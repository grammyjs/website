---
prev: ./introduction.md
next: ./basics.md
---

# Memulai

Buat bot pertamamu dalam hitungan menit.
(Gulir [ke bawah](#memulai-dengan-deno) untuk panduan Deno.)

## Memulai dengan Node.js

> Kami mengasumsikan bahwa kamu sudah menginstal [Node.js](https://nodejs.org), dan seharusnya `npm` juga sudah disertakan di paket pemasangannya.
> Kalau tidak paham dengan apa yang kami maksud barusan, lihat [Pengenalan](./introduction.md)!

Buat proyek TypeScript baru lalu instal package `grammy`.
Lakukan dengan cara mengetikan kode berikut di terminal:

<CodeGroup>
 <CodeGroupItem title="NPM" active>

```bash
# Buat direktori baru lalu masuk ke dalamnya.
mkdir my-bot
cd my-bot

# Siapkan TypeScript (lewati jika menggunakan JavaScript).
npm install -D typescript
npx tsc --init

# Pasang grammY.
npm install grammy
```

</CodeGroupItem>
 <CodeGroupItem title="Yarn">

```bash
# Buat direktori baru lalu masuk ke dalamnya.
mkdir my-bot
cd my-bot

# Siapkan TypeScript (lewati jika menggunakan JavaScript).
yarn add typescript -D
npx tsc --init

# Pasang grammY.
yarn add grammy
```

</CodeGroupItem>
  <CodeGroupItem title="pnpm">

```bash
# Buat direktori baru lalu masuk ke dalamnya.
mkdir my-bot
cd my-bot

# Siapkan TypeScript (lewati jika menggunakan JavaScript).
pnpm add -D typescript
npx tsc --init

# Pasang grammY.
pnpm add grammy
```

</CodeGroupItem>
</CodeGroup>

Kemudian, buat file teks kosong baru dengan nama `bot.ts`.
Struktur folder kurang lebih terlihat seperti ini:

```asciiart:no-line-numbers
.
├── bot.ts
├── node_modules/
├── package.json
├── package-lock.json
└── tsconfig.json
```

Sekarang, buka aplikasi Telegram kamu untuk membuat sebuah akun bot beserta token otentikasinya.
Chat [@BotFather](https://t.me/BotFather) untuk melakukannya.
Token otentikasi kurang lebih mirip seperti ini `123456:aBcDeF_gHiJiJkLmNoP-q`.

Sudah dapat tokennya? Sekarang kamu bisa menulis kode bot di file `bot.ts`.
Kamu bisa menyalin contoh bot berikut ke dalam file. Jangan lupa untuk memasukkan token ke constructor `Bot`.

<CodeGroup>
 <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";

// Buat sebuah instance class `Bot` lalu masukkan token otentikasi ke dalamnya.
const bot = new Bot(""); // <-- Taruh token di antara tanda petik ("").

// Sekarang, kamu bisa menambahkan listener ke object `bot`.
// grammY akan memanggil listener ini ketika pengguna mengirim pesan ke bot.

// Tangani perintah /start.
bot.command("start", (ctx) => ctx.reply("Selamat datang! Bot siap digunakan."));
// Tangani pesan lainnya.
bot.on("message", (ctx) => ctx.reply("Dapat pesan baru!"));

// Setelah menentukan bagaimana pesan ditangani, kamu dapat menjalankan bot-mu.
// Bot akan melakukan koneksi ke server Telegram dan menunggu pesan masuk.

// Mulai bot-nya.
bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");

// Buat sebuah instance class `Bot` lalu masukkan token otentikasi ke dalamnya.
const bot = new Bot(""); // <-- Taruh token di antara tanda petik ("").

// Sekarang, kamu bisa menambahkan listener ke object `bot`.
// grammY akan memanggil listener ini ketika pengguna mengirim pesan ke bot.

// Tangani perintah /start.
bot.command("start", (ctx) => ctx.reply("Selamat datang! Bot siap digunakan."));
// Tangani pesan lainnya.
bot.on("message", (ctx) => ctx.reply("Dapat pesan baru!"));

// Setelah menentukan bagaimana pesan ditangani, kamu dapat menjalankan bot-mu.
// Bot akan melakukan koneksi ke server Telegram dan menunggu pesan masuk.

// Mulai bot-nya.
bot.start();
```

</CodeGroupItem>
</CodeGroup>

Compile kode dengan menjalankan

```bash
npx tsc
```

di terminal.
File JavaScript `bot.js` akan dihasilkan dari proses compile tadi.

Sekarang kamu dapat menjalankan bot dengan mengeksekusi

```bash
node bot.js
```

di terminal.
Selesai! :tada:

Buka Telegram untuk melihat bot kamu merespon pesan!

::: tip Mengaktifkan Pencatatan Log (logging)
Kamu bisa mengaktifkan pencatatan log sederhana dengan menjalankan

```bash
export DEBUG="grammy*"
```

di terminal sebelum mengeksekusi `node bot.js`.
Ini mempermudah kamu untuk men-debug bot.
:::

## Memulai dengan Deno

> Kami mengasumsikan bahwa kamu sudah menginstal [Deno](https://deno.land).

Buat direktori baru di suatu tempat lalu buat file teks kosong baru di dalamnya, misalnya kita namakan `bot.ts`.

Sekarang, buka aplikasi Telegram kamu untuk membuat sebuah akun bot beserta token otentikasinya.
Chat [@BotFather](https://t.me/BotFather) untuk melakukannya.
Token otentikasi kurang lebih mirip seperti ini `123456:aBcDeF_gHiJiJkLmNoP-q`.

Sudah dapat tokennya? Sekarang kamu bisa menulis kode bot di file `bot.ts`.
Kamu bisa menyalin contoh bot berikut ke dalam file. Jangan lupa untuk memasukkan token ke constructor `Bot`.

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

// Buat sebuah instance class `Bot` lalu masukkan token otentikasi ke dalamnya.
const bot = new Bot(""); // <-- taruh token di antara tanda petik ("").

// Sekarang, kamu bisa menambahkan listener ke object `bot`.
// grammY akan memanggil listener ini ketika pengguna mengirim pesan ke bot.

// Tangani perintah /start.
bot.command("start", (ctx) => ctx.reply("Selamat datang! Bot siap digunakan."));
// Tangani pesan lainnya.
bot.on("message", (ctx) => ctx.reply("Dapat pesan baru!"));

// Setelah menentukan bagaimana pesan ditangani, kamu bisa menjalankan bot-mu.
// Bot akan melakukan koneksi ke server Telegram dan menunggu pesan masuk.

// Mulai bot-nya.
bot.start();
```

Sekarang, kamu dapat menjalankan bot dengan mengeksekusi

```bash
deno run --allow-net bot.ts
```

di terminal.
Selesai! :tada:

Buka Telegram untuk melihat bot kamu merespon pesan!

::: tip Mengaktifkan Pencatatan Log (logging)
Kamu bisa mengaktifkan pencatatan log sederhana dengan menjalankan

```bash
export DEBUG="grammy*"
```

di terminal sebelum menjalankan bot.
Ini mempermudah kamu untuk men-debug bot.

Alih-alih menjalankan bot dengan cara tadi, kamu perlu menjalankan bot menggunakan

```bash
deno run --allow-net --allow-env bot.ts
```

sehingga grammY dapat mendeteksi bahwa `DEBUG` telah diatur.
:::
