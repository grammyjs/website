---
prev: ./introduction.md
next: ./basics.md
---

# Memulai

Buat bot pertamamu dalam hitungan menit. (Gulir [ke bawah](#memulai-dengan-deno) untuk panduan Deno).

## Memulai dengan Node.js

> Kami mengasumsikan bahwa kamu sudah memasang [Node.js](https://nodejs.org), dan seharusnya `npm` juga sudah disertakan di paket pemasangan.
> Kalau tidak tahu apa yang kami maksud barusan, lihat [Pendahulan](./introduction.md)!

Buat projek TypeScript baru lalu pasang package `grammy`.
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

Sekarang, saatnya membuka Telegram untuk membuat akun bot, dan mendapatkan token otentikasi untuk bot tersebut.
Chat [@BotFather](https://t.me/BotFather) untuk mendapatkan tokennya.
Token otentikasi kurang lebih mirip seperti ini `123456:aBcDeF_gHiJiJkLmNoP-q`.

Sudah dapat tokennya? Sekarang kamu dapat menulis kode bot di berkas `bot.ts`.
Kamu bisa menyalin contoh bot berikut ke dalam berkas, lalu masukkan token ke konstruktor `Bot`:

<CodeGroup>
 <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";

// Buat sebuah instansiasi kelas `Bot` lalu masukkan token otentikasi ke dalamnya.
const bot = new Bot(""); // <-- taruh token di antara tanda petik ("").

// Kamu sekarang dapat membuat penyimak (listener) untuk objek `bot`.
// grammY akan memanggil penyimak ini ketika pengguna mengirim pesan ke bot.

// Tangani perintah (command) /start.
bot.command("start", (ctx) => ctx.reply("Selamat datang! Bot siap digunakan."));
// Tangani pesan lainnya.
bot.on("message", (ctx) => ctx.reply("Dapat pesan baru!"));

// Sekarang setelah menentukan bagaimana pesan ditangani, kamu dapat menjalankan bot-nya.
// Bot akan melakukan koneksi ke server Telegram dan menunggu pesan masuk.

// Mulai bot-nya.
bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");

// Buat sebuah instansiasi kelas `Bot` lalu masukkan token otentikasi ke dalamnya.
const bot = new Bot(""); // <-- taruh token di antara tanda petik ("").

// Kamu sekarang dapat membuat penyimak (listener) untuk objek `bot`.
// grammY akan memanggil penyimak ini ketika pengguna mengirim pesan ke bot.

// Tangani perintah (command) /start.
bot.command("start", (ctx) => ctx.reply("Selamat datang! Bot siap digunakan."));
// Tangani pesan lainnya.
bot.on("message", (ctx) => ctx.reply("Dapat pesan baru!"));

// Sekarang setelah menentukan bagaimana pesan ditangani, kamu dapat menjalankan bot-nya.
// Bot akan melakukan koneksi ke server Telegram dan menunggu pesan masuk.

// Mulai bot-nya.
bot.start();
```

</CodeGroupItem>
</CodeGroup>

Lakukan _compile_ atau kompilasi kode dengan menjalankan

```bash
npx tsc
```

di terminal.
Berkas JavaScript `bot.js` akan dihasilkan dari proses kompilasi tadi.

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
export DEBUG='grammy*'
```

di terminal sebelum mengeksekusi `node bot.js`.
Ini mempermudah kamu untuk men-debug bot.
:::

## Memulai dengan Deno

> Kami mengasumsikan bahwa kamu sudah memasang [Deno](https://deno.land).

Buat direktori baru di suatu tempat lalu buat berkas teks kosong baru di dalamnya, misalnya kita namakan `bot.ts`.

Sekarang, saatnya membuka Telegram untuk membuat akun bot, dan mendapatkan token otentikasi untuk bot tersebut.
Chat [@BotFather](https://t.me/BotFather) untuk mendapatkannya.
Token otentikasi kurang lebih mirip seperti ini `123456:aBcDeF_gHiJiJkLmNoP-q`.

Sudah dapat tokennya? Sekarang kamu dapat menulis kode bot di berkas `bot.ts`.
Kamu bisa menyalin contoh bot berikut ke dalam berkas, lalu memasukkan token ke konstruktor `Bot`:

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

// Buat sebuah instansiasi kelas `Bot` lalu masukkan token otentikasi ke dalamnya.
const bot = new Bot(""); // <-- taruh token di antara tanda petik ("").

// Kamu sekarang dapat membuat penyimak (listener) untuk objek `bot`.
// grammY akan memanggil penyimak ini ketika pengguna mengirim pesan ke bot.

// Tangani perintah (command) /start.
bot.command("start", (ctx) => ctx.reply("Selamat datang! Bot siap digunakan."));
// Tangani pesan lainnya.
bot.on("message", (ctx) => ctx.reply("Dapat pesan baru!"));

// Sekarang setelah menentukan bagaimana pesan ditangani, kamu dapat menjalankan bot-nya.
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
export DEBUG='grammy*'
```

di terminal sebelum menjalankan bot.
Ini mempermudah kamu untuk men-debug bot.

Alih-alih menjalankan bot dengan cara tadi, kamu perlu menjalankan bot menggunakan

```bash
deno run --allow-net --allow-env bot.ts
```

sehingga grammY dapat mendeteksi bahwa `DEBUG` telah diatur.
:::
