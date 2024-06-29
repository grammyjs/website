---
prev: false
next: false
---

# Hosting: Zeabur (Node.js)

[Zeabur](https://zeabur.com) merupakan sebuah platform yang menawarkan layanan untuk men-deploy aplikasi full-stack kamu dengan mudah.
Ia mendukung berbagai macam bahasa pemrograman dan framework, termasuk diantaranya adalah Node.js dan grammY.

Tutorial ini akan memandu kamu untuk men-deploy bot grammY Node.js ke [Zeabur](https://zeabur.com).

::: tip Mencari yang versi Deno-nya?
Tutorial ini ditujukan khusus untuk men-deploy bot Telegram yang dibuat menggunakan Node.js ke Zeabur.
Jika kamu mencari yang versi Deno-nya, silahkan beralih ke [tutorial berikut](./zeabur-deno).
:::

## Prasyarat

Sebelum memulai, kamu perlu terlebih dahulu membuat akun [GitHub](https://github.com) dan [Zeabur](https://zeabur.com).

### Cara 1: Membuat Proyek Baru dari Awal

Buat permulaan proyeknya, lalu instal dependensi yang dibutuhkan:

```sh
# Buat permulaan proyek.
mkdir grammy-bot
cd grammy-bot
npm init -y

# Instal dependensi utama.
npm install grammy

# Instal dependensi pengembangan.
npm install -D typescript ts-node @types/node

# Buat permulaan TypeScript.
npx tsc --init
```

Kemudian, `cd` ke `src/`, lalu buat sebuah file bernama `bot.ts`.
File tersebut merupakan tempat untuk menulis kode bot kamu.

Isi file dengan kode berikut:

```ts
import { Bot } from "grammy";

const token = process.env.TOKEN_BOT_TELEGRAM;
if (!token) throw new Error("TOKEN_BOT_TELEGRAM belum disetel");

const bot = new Bot(token);

bot.on("message:text", async (ctx) => {
  console.log("Pesan: ", ctx.message.text);

  const response = "Halo, saya adalah sebuah bot!";

  await ctx.reply(response);
});

bot.start();
```

> Catatan: Ambil token bot kamu di [@BotFather](https://t.me/BotFather), lalu buat sebuah environment variable di Zeabur bernama `TOKEN_BOT_TELEGRAM` yang memuat token bot tersebut.
>
> Panduan untuk menyetel environment variable di Zeabur bisa dilihat di [tutorial berikut](https://zeabur.com/docs/deploy/variables).

Sekarang, direktori root proyek kamu seharusnya memiliki struktur seperti ini:

```asciiart:no-line-numbers
.
├── node_modules/
├── src/
│   └── bot.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

Jika sudah sesuai, tambahkan script `start` ke `package.json`.
Sekarang, struktur `package.json` kamu semestinya serupa dengan ini:

```json
{
  "name": "bot-telegram-grammy",
  "version": "1.0.0",
  "description": "Bot Telegram menggunakan TypeScript dan grammY",
  "scripts": {
    "start": "ts-node src/bot.ts" // [!code focus]
  },
  "author": "MichaelYuhe",
  "license": "MIT",
  "dependencies": {
    "grammy": "^1.21.1"
  },
  "devDependencies": {
    "@types/node": "^20.14.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.5"
  }
}
```

Sekarang kamu sudah bisa menjalankan bot secara lokal menggunakan perintah berikut:

```sh
npm run start
```

### Cara 2: Menggunakan Templat yang Disediakan oleh Zeabur

Zeabur memiliki sebuah templat untuk bot Telegram grammY yang bisa kamu gunakan sebagai acuan.
Kamu bisa menemukannya di [repositori berikut](https://github.com/zeabur/telegram-bot-starter).

Sekarang, kamu bisa mulai menulis kode bot menggunakan templat tersebut.

## Men-deploy

### Cara 1: Men-deploy dari GitHub melalui Dashboard Zeabur

1. Buat sebuah repositori privat ataupun publik di GitHub, kemudian push kode kamu ke repository tersebut.
2. Beralih ke [dashboard Zeabur](https://dash.zeabur.com).
3. Klik tombol `New Project`, lalu klik tombol `Deploy New Service`, pilih `GitHub` sebagai sumbernya, kemudian pilih repositori yang telah kamu buat tadi.
4. Beralih ke tab `Variables` untuk menambahkan environment variable yang diperlukan, misalnya `TOKEN_BOT_TELEGRAM`.
5. Jika sudah, bot akan ter-deploy secara otomatis.

### Cara 2: Men-deploy Menggunakan CLI Zeabur

`cd` ke direktori proyek kamu, lalu jalankan perintah berikut:

```sh
npx @zeabur/cli deploy
```

Ikuti instruksi yang ditampilkan untuk memilih lokasi deploy.
Jika sudah, bot akan ter-deploy secara otomatis.
