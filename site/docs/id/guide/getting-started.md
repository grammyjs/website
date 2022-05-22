---
prev: ./introduction.md
next: ./basics.md
---

# Memulai

Buat bot pertama Anda dalam hitungan menit. (Gulir [ke bawah](#memulai-dengan-deno) untuk panduan Deno).

## Memulai dengan Node.js

> Kami mengasumsikan bahwa Anda sudah menginstal [Node.js](https://nodejs.org), dan seharusnya `npm` juga sudah disertakan di paket penginstalan.
> Jika Anda tidak tahu apa yang kami maksud barusan, lihat [Pengenalan](./introduction.md)!

Buat project TypeScript baru lalu instal package `grammy`.
Lakukan ini dengan cara membuka terminal, kemudian ketik:

<CodeGroup>
 <CodeGroupItem title="NPM" active>

```bash
# Buat direktori baru lalu masuk ke dalamnya.
mkdir my-bot
cd my-bot

# Siapkan TypeScript (lewati jika Anda menggunakan JavaScript).
npm install -D typescript
npx tsc --init

# Instal grammY.
npm install grammy
```

</CodeGroupItem>
 <CodeGroupItem title="Yarn">

```bash
# Buat direktori baru lalu masuk ke dalamnya.
mkdir my-bot
cd my-bot

# Siapkan TypeScript (lewati jika Anda menggunakan JavaScript).
yarn add typescript -D
npx tsc --init

# Install grammY.
yarn add grammy
```

</CodeGroupItem>
  <CodeGroupItem title="pnpm">

```bash
# Buat direktori baru lalu masuk ke dalamnya.
mkdir my-bot
cd my-bot

# Siapkan TypeScript (lewati jika Anda menggunakan JavaScript).
pnpm add -D typescript
npx tsc --init

# Install grammY.
pnpm add grammy
```

</CodeGroupItem>
</CodeGroup>

Buat file teks kosong baru, misalnya kita namakan `bot.ts`.
Struktur folder Anda sekarang akan terlihat seperti ini:

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

Sudah dapat tokennya? Sekarang Anda dapat membuat kode bot di file `bot.ts`.
Anda dapat menyalin contoh bot berikut ke dalam file tersebut, lalu masukkan token ke konstruktor `Bot`:

<CodeGroup>
 <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";

// Buat sebuah instansiasi kelas `Bot` lalu tulis token otentikasi ke dalamnya.
const bot = new Bot(""); // <-- taruh token di antara tanda petik ("").

// Anda sekarang dapat membuat listener untuk objek `bot`.
// grammY akan memanggil listener ini ketika pengguna mengirim pesan ke bot.

// Tangani perintah (command) /start.
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
// Tangani pesan lainnya.
bot.on("message", (ctx) => ctx.reply("Got another message!"));

// Sekarang setelah Anda menentukan bagaimana pesan ditangani, Anda dapat menjalankan bot Anda.
// Bot akan melakukan koneksi ke server Telegram dan menunggu pesan masuk.

// Mulai bot-nya.
bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");

// Buat sebuah instansiasi kelas `Bot` lalu tulis token otentikasi ke dalamnya.
const bot = new Bot(""); // <-- taruh token di antara tanda petik ("").

// Anda sekarang dapat membuat listener untuk objek `bot`.
// grammY akan memanggil listener ini ketika pengguna mengirim pesan ke bot.

// Tangani perintah (command) /start.
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
// Tangani pesan lainnya.
bot.on("message", (ctx) => ctx.reply("Got another message!"));

// Sekarang setelah Anda menentukan bagaimana pesan ditangani, Anda dapat menjalankan bot Anda.
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
File JavaScript `bot.js` akan dihasilkan dari proses compile tadi.

Sekarang Anda dapat menjalankan bot dengan mengeksekusi

```bash
node bot.js
```

di terminal.
Selesai! :tada:

Buka Telegram untuk melihat bot Anda merespon pesan!

::: tip Mengaktifkan Pencatatan (logging)
Anda bisa mengaktifkan logging sederhana dengan menjalankan

```bash
export DEBUG='grammy*'
```

di terminal sebelum mengeksekusi `node bot.js`.
Ini mempermudah Anda untuk men-debug bot.
:::

## Memulai dengan Deno

> Kami mengasumsikan bahwa Anda sudah menginstal [Deno](https://deno.land).

Buat direktori baru di suatu tempat lalu buat file teks kosong baru di dalamnya, misalnya kita namakan `bot.ts`.

Sekarang, saatnya membuka Telegram untuk membuat akun bot, dan mendapatkan token otentikasi untuk bot tersebut.
Chat [@BotFather](https://t.me/BotFather) untuk mendapatkannya.
Token otentikasi kurang lebih mirip seperti ini `123456:aBcDeF_gHiJiJkLmNoP-q`.

Sudah dapat tokennya? Sekarang Anda dapat membuat kode bot di file `bot.ts`.
Anda bisa menyalin contoh bot berikut ke dalam file tersebut, lalu memasukkan token ke konstruktor `Bot`:

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

// Buat sebuah instansiasi kelas `Bot` lalu tulis token otentikasi ke dalamnya.
const bot = new Bot(""); // <-- taruh token di antara tanda petik ("").

// Anda sekarang dapat membuat listener untuk objek `bot`.
// grammY akan memanggil listener ini ketika pengguna mengirim pesan ke bot.

// Tangani perintah (command) /start.
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
// Tangani pesan lainnya.
bot.on("message", (ctx) => ctx.reply("Got another message!"));

// Sekarang setelah Anda menentukan bagaimana pesan ditangani, Anda dapat menjalankan bot Anda.
// Bot akan melakukan koneksi ke server Telegram dan menunggu pesan masuk.

// Mulai bot-nya.
bot.start();
```

Sekarang Anda dapat menjalankan bot dengan mengeksekusi

```bash
deno run --allow-net bot.ts
```

di terminal.
Selesai! :tada:

Buka Telegram untuk melihat bot Anda merespon pesan!

::: tip Mengaktifkan Pencatatan (logging)
Anda bisa mengaktifkan logging sederhana dengan menjalankan

```bash
export DEBUG='grammy*'
```

di terminal sebelum menjalankan bot.
Ini mempermudah Anda untuk men-debug bot.

Mulai sekarang, Anda perlu menjalankan bot menggunakan

```bash
deno run --allow-net --allow-env bot.ts
```

sehingga grammY dapat mendeteksi bahwa `DEBUG` telah diatur.
:::
