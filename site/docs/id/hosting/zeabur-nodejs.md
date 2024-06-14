---
prev: false
next: false
---

# Hosting: Zeabur (Node.js)

[Zeabur](https://zeabur.com) merupakan sebuah platform yang menawarkan layanan untuk men-deploy aplikasi full-stack kamu dengan mudah.
Ia mendukung berbagai macam bahasa pemrograman dan framework, termasuk diantaranya adalah Node.js dan grammY.

Tutorial ini akan memandu kamu untuk men-deploy bot grammY Node.js ke [Zeabur](https://zeabur.com).

::: tip Mencari yang versi Deno-nya?
Tutorial ini ditujukan khusus untuk mendeploy bot Telegram yang dibuat menggunakan Node.js ke Zeabur.
Jika kamu mencari yang versi Deno-nya, silahkan beralih ke [tutorial berikut](./zeabur-nodejs).
:::

## Prasyarat

Sebelum memulai, kamu perlu terlebih dahulu membuat akun [GitHub](https://github.com) dan [Zeabur](https://zeabur.com).

### Cara 1: Membuat Proyek Baru Dari Awal

Buat permulaan proyeknya, lalu instal dependensi yang dibutuhkan:

```sh
# Buat permulaan proyek.
mkdir grammy-bot
cd grammy-bot
pnpm init -y

# Install dependensi utama.
pnpm install grammy

# Install dependensi pengembangan.
pnpm install -D typescript

# Buat permulaan TypeScript.
npx tsc --init
```

Kemudian, `cd` ke `src/`, lalu buat sebuah file bernama `bot.ts`.
File tersebut merupakan tempat untuk menulis kode bot kamu.

Isi file dengan kode berikut:

```ts
import { Bot } from "grammy";

const bot = new Bot(
  process.env.TELEGRAM_BOT_TOKEN || "token_bot_telegram_kamu",
);

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
├── pnpm-lock.yaml
```

Jika sudah sesuai, tambahkan script `start` ke `package.json`.
Sekarang, struktur `package.json` kamu semestinya serupa dengan ini:

```json
{
  "name": "telegram-bot-starter",
  "version": "1.0.0",
  "description": "Telegram Bot Starter with TypeScript and grammY",
  "scripts": {
    "start": "ts-node src/bot.ts"
  },
  "author": "MichaelYuhe",
  "license": "MIT",
  "dependencies": {
    "grammy": "^1.21.1"
  },
  "devDependencies": {
    "typescript": "^5.4.5"
  }
}
```

Untuk saat ini, kamu sudah bisa menjalankan bot secara lokal menggunakan perintah berikut:

```sh
pnpm start
```

> Catatan: Kamu perlu menginstal `ts-node` secara global agar bisa menjalankan bot secara lokal.
>
> Kamu bisa menginstalnya dengan menjalankan perintah `pnpm install -g ts-node`.

### Cara 2: Menggunakan Templat yang Disediakan oleh Zeabur

Zeabut memiliki sebuah templat untuk bot Telegram grammY yang bisa kamu gunakan sebagai acuan.
Kamu bisa menemukannya di [repositori berikut](https://github.com/zeabur/telegram-bot-starter).

Gunakan templat tersebut, lalu mulai menulis kode untuk bot kamu.

## Men-deploy

### Cara 1: Men-deploy dari GitHub Melalui Dashboard Zeabur

1. Buat sebuah repositori privat ataupun publik di GitHub, kemudian push kode kamu ke repository tersebut.
2. Beralih ke [dashboard Zeabur](https://dash.zeabur.com).
3. Klik tombol `New Project`, lalu klik tombol `Deploy New Service`, pilih `GitHub` sebagai sumbernya, kemudian pilih repositori yang telah kamu buat tadi.
4. Beralih ke tab `Variables` untuk menambahkan environment variable yang diperlukan, misalnya `TOKEN_BOT_TELEGRAM`.
5. Jika sudah, bot akan di-deploy secara otomatis.

### Cara 2: Men-deploy Menggunakan CLI Zeabur

`cd` ke direktori proyek kamu, lalu jalankan perintah berikut:

```sh
npx @zeabur/cli deploy
```

Ikuti instruksi yang ditampilkan untuk memilih lokasi deploy.
Jika sudah, bot akan di-deploy secara otomatis
