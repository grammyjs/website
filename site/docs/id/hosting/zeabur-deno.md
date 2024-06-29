---
prev: false
next: false
---

# Hosting: Zeabur (Deno)

[Zeabur](https://zeabur.com) merupakan sebuah platform yang menawarkan layanan untuk men-deploy aplikasi full-stack kamu dengan mudah.
Ia mendukung berbagai macam bahasa pemrograman dan framework, termasuk diantaranya adalah Deno dan grammY.

Tutorial ini akan memandu kamu untuk men-deploy bot grammY Deno ke [Zeabur](https://zeabur.com).

::: tip Mencari yang Versi Node.js-nya?
Tutorial ini ditujukan khusus untuk men-deploy bot Telegram yang dibuat menggunakan Deno ke Zeabur.
Jika kamu mencari yang versi Node.js-nya, silahkan beralih ke [tutorial berikut](./zeabur-nodejs).
:::

## Prasyarat

Sebelum memulai, kamu perlu terlebih dahulu membuat akun [GitHub](https://github.com) dan [Zeabur](https://zeabur.com).

### Cara 1: Membuat Proyek Baru dari Awal

> Pastikan Deno sudah terinstal di perangkat kamu.

Buat permulaan proyeknya, lalu instal dependensi yang dibutuhkan:

```sh
# Buat permulaan proyek.
mkdir grammy-bot
cd grammy-bot

# Buat file main.ts.
touch main.ts

# Buat file deno.json untuk membuat lock-file-nya.
touch deno.json
```

Kemudian, isi file `main.ts` dengan kode berikut:

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const token = Deno.env.get("TOKEN_BOT_TELEGRAM");
if (!token) throw new Error("TOKEN_BOT_TELEGRAM belum disetel");

const bot = new Bot(token);

bot.command("start", (ctx) => ctx.reply("Salam hangat dari Deno & grammY!"));

bot.on("message", (ctx) => ctx.reply("Ada yang bisa saya bantu?"));

bot.start();
```

> Catatan: Ambil token bot kamu di [@BotFather](https://t.me/BotFather), lalu buat sebuah environment variable di Zeabur bernama `TOKEN_BOT_TELEGRAM` yang memuat token bot tersebut.
>
> Panduan untuk menyetel environment variable di Zeabur bisa dilihat di [tutorial berikut](https://zeabur.com/docs/deploy/variables).

Jika sudah, jalankan perintah berikut untuk memulai bot kamu:

```sh
deno run --allow-net main.ts
```

Perintah di atas akan membuat Deno secara otomatis mengunduh dependensi yang telah ditentukan sebelumnya, membuat lock-file, serta menjalankan bot kamu.

### Cara 2: Menggunakan Templat yang Disediakan oleh Zeabur

Zeabur memiliki sebuah templat yang bisa kamu gunakan sebagai acuan untuk membuat bot Telegram Deno.
Kamu bisa menemukannya di [repositori berikut](https://github.com/zeabur/deno-telegram-bot-starter).

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
