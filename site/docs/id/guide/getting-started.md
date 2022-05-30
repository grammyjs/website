---
prev: ./introduction.md
next: ./basics.md
---

# Memulai

Buat bot pertamamu dalam hitungan menit. Gulir [ke bawah](#memulai-dengan-deno) untuk panduan Deno.

## Memulai dengan Node.js

> Kami mengasumsikan bahwa kamu sudah meng-install [Node.js](https://nodejs.org), dan seharusnya `npm` juga sudah disertakan di paket pemasangan.
> Kalau tidak paham apa yang kami maksud barusan, lihat [Pengenalan](./introduction.md)!

Buat proyek TypeScript baru lalu install package `grammy`.
Lakukan ini dengan cara membuka terminal, kemudian ketik:

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

Buat file teks kosong baru, misalnya kita namakan `bot.ts`.
Struktur folder sekarang akan terlihat seperti ini:

```asciiart:no-line-numbers
.
├── bot.ts
├── node_modules/
├── package.json
├── package-lock.json
└── tsconfig.json
```

Sekarang, saatnya membuka Telegram untuk membuat akun bot, dan mendapatkan token otentikasi untuk bot kamu.
Chat [@BotFather](https://t.me/BotFather) untuk mendapatkan tokennya.
Token otentikasi kurang lebih mirip seperti ini `123456:aBcDeF_gHiJiJkLmNoP-q`.

Sudah dapat tokennya? Sekarang kamu bisa menulis kode bot di berkas `bot.ts`.
Kamu bisa menyalin contoh bot berikut ke dalam file. Jangan lupa untuk memasukkan token ke constructor `Bot`.

<CodeGroup>
 <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";

// Buat sebuah instansiasi class `Bot` lalu masukkan token otentikasi ke dalamnya.
const bot = new Bot(""); // <-- Taruh token di antara tanda petik ("").

// Kamu sekarang dapat membuat listener untuk object `bot`.
// grammY akan memanggil listener ini ketika pengguna mengirim pesan ke bot.

// Tangani perintah (command) /start.
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

// Buat sebuah instansiasi class `Bot` lalu masukkan token otentikasi ke dalamnya.
const bot = new Bot(""); // <-- Taruh token di antara tanda petik ("").

// Kamu sekarang dapat membuat listener untuk object `bot`.
// grammY akan memanggil listener ini ketika pengguna mengirim pesan ke bot.

// Tangani perintah (command) /start.
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
File JavaScript `bot.js` akan dihasilkan dari proses kompilasi tadi.

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

> Kami mengasumsikan bahwa kamu sudah meng-install [Deno](https://deno.land).

Buat direktori baru di suatu tempat lalu buat file teks kosong baru di dalamnya, misalnya kita namakan `bot.ts`.

Sekarang, saatnya membuka Telegram untuk membuat akun bot, dan mendapatkan token otentikasi untuk bot kamu.
Chat [@BotFather](https://t.me/BotFather) untuk mendapatkan tokennya.
Token otentikasi kurang lebih mirip seperti ini `123456:aBcDeF_gHiJiJkLmNoP-q`.

Sudah dapat tokennya? Sekarang kamu bisa menulis kode bot di berkas `bot.ts`.
Kamu bisa menyalin contoh bot berikut ke dalam file. Jangan lupa untuk memasukkan token ke constructor `Bot`.

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

// Buat sebuah instansiasi class `Bot` lalu masukkan token otentikasi ke dalamnya.
const bot = new Bot(""); // <-- taruh token di antara tanda petik ("").

// Kamu sekarang dapat membuat listener untuk object `bot`.
// grammY akan memanggil listener ini ketika pengguna mengirim pesan ke bot.

// Tangani perintah (command) /start.
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
