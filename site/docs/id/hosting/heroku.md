# Hosting: Heroku

> Kami mengasumsikan bahwa kamu sudah memiliki pengetahuan dasar dalam membuat sebuah bot menggunakan grammY.
> Jika belum, silahkan baca [panduan](../guide) yang telah kami buat dengan sepenuh hati! :heart:

Tutorial ini akan mengajari kamu cara men-deploy bot Telegram ke [Heroku](https://heroku.com/), baik menggunakan [webhooks](../guide/deployment-types.md#bagaimana-cara-kerja-webhook) maupun [long polling](../guide/deployment-types.md#bagaimana-cara-kerja-long-polling).
Kami juga mengasumsikan kalau kamu sudah mempunyai akun Heroku.

## Persiapan

Pertama-tama, instal beberapa dependency.

```sh
# Buat sebuah direktori proyek.
mkdir grammy-bot
cd grammy-bot
npm init --y

# Instal dependency utama.
npm install grammy express

# Instal dependency untuk development.
npm install -D typescript @types/express @types/node

# Buat konfigurasi TypeScript-nya.
npx tsc --init
```

Kita akan menyimpan file TypeScript di dalam sebuah folder `src`, sedangkan file hasil compile kita taruh di folder `dist`.
Buat kedua folder tersebut di direktori root proyek.
Selanjutnya, buat sebuah file baru bernama `bot.ts` di dalam folder `src`.
Struktur folder kita kurang lebih mirip seperti ini:

```asciiart:no-line-numbers
.
├── node_modules/
├── dist/
├── src/
│   └── bot.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

Setelah itu, buka file `tsconfig.json` lalu ubah konfigurasinya menjadi seperti ini:

```json{4}
{
  "compilerOptions": {
    "target": "ESNEXT",
    "module": "esnext", // ubah dari commonjs menjadi esnext
    "lib": ["ES2021"],
    "outDir": "./dist/",
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

Karena opsi `module` di atas telah kita ubah `commonjs` menjadi `esnext`, maka kita harus menambahkan `"type": "module"` ke file `package.json`.
File `package.json` kita kurang lebih tampak seperti ini:

```json{6}
{
  "name": "grammy-bot",
  "version": "0.0.1",
  "description": "",
  "main": "dist/app.js",
  "type": "module",  // tambah property "type": "module"
  "scripts": {
    "dev-build": "tsc"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "grammy": "^1.2.0",
    "express": "^4.17.1"
  },
  "devDependencies": {
    "typescript": "^4.3.5",
    "@types/express": "^4.17.13",
    "@types/node": "^16.3.1"
  },
  "keywords": []
}
```

Seperti yang sudah dijelaskan di awal, kita memiliki dua opsi untuk menerima data dari Telegram: webhook dan long polling.
Kamu bisa mempelajari kelebihan dan kekurangan dari kedua jenis deployment tersebut di [materi ini](../guide/deployment-types.md)!

## Webhooks

> Jika kamu lebih memilih untuk menggunakan long polling, langsung saja lompat ke bagian [long polling](#long-polling). :rocket:

Singkatnya, tidak seperti long polling, webhook tidak perlu berjalan terus-menerus untuk mengecek pesan masuk dari Telegram.
Dengan begitu, beban kerja server dan penggunaan kuota [dyno hours](https://devcenter.heroku.com/articles/eco-dyno-hours) bisa dikurangi, terutama jika kamu menggunakan paket Eco. :grin:

Oke, lanjut!
Masih ingat kita punya `bot.ts` di awal tadi?
Kita tidak akan asal menaruh semua kode di file tersebut.
Sebaliknya, kita akan membuat sebuah file baru bernama `app.ts` sebagai entry point utama kita.
Artinya, setiap kali Telegram (atau orang lain) mengunjungi website kita, `express` akan menentukan server mana yang bertanggung jawab untuk menangani request tersebut.
Ini berguna ketika kamu men-deploy baik website maupun bot di domain yang sama.
Selain itu, kode kita akan terlihat lebih rapi dengan membaginya menjadi beberapa bagian ke beberapa file. :sparkles:

### Express Beserta Middleware-nya

Sekarang, buat `app.ts` di dalam folder `src`, lalu masukkan kode berikut ke dalamnya:

```ts
import express from "express";
import { webhookCallback } from "grammy";
import { bot } from "./bot";

const domain = String(process.env.DOMAIN);
const secretPath = String(process.env.BOT_TOKEN);
const app = express();

app.use(express.json());
app.use(`/${secretPath}`, webhookCallback(bot, "express"));

app.listen(Number(process.env.PORT), async () => {
  // Pastikan menggunakan `https` bukan `http`!
  await bot.api.setWebhook(`https://${domain}/${secretPath}`);
});
```

Mari kita lihat kode yang telah kita buat di atas:

- `process.env`: Ingat, JANGAN menyimpan informasi-informasi rahasia di kode kamu!
  Untuk membuat [environment variable](https://www.freecodecamp.org/news/using-environment-variables-the-right-way/) di Heroku, lihat [panduan berikut](https://devcenter.heroku.com/articles/config-vars).
- `secretPath`: Ini bisa berupa `TOKEN_BOT` atau teks acak lainnya.
  Kita dianjurkan untuk menyembunyikan alamat URL bot, seperti yang sudah [dijelaskan oleh Telegram](https://core.telegram.org/bots/api#setwebhook).

::: tip ⚡ Optimisasi (opsional)
`bot.api.setWebhook` di baris kode ke-14 di atas, akan selalu dijalankan setiap kali Heroku memulai server kamu.
Untuk bot yang memiliki traffic rendah, ia akan dijalankan untuk setiap request.
Kita tidak perlu baris kode ini dijalankan setiap kali ada request masuk.
Oleh karena itu, kita bisa menghapusnya dan hanya menjalankan `GET` sekali secara manual.
Buka link ini di web browser setelah men-deploy bot:

```asciiart:no-line-numbers
https://api.telegram.org/bot<token_bot>/setWebhook?url=<url_webhook>
```

Perlu diperhatikan bahwa beberapa browser mengharuskan kamu secara manual [meng-encode](https://en.wikipedia.org/wiki/Percent-encoding#Reserved_characters) `url_webhook` sebelum ditambahkan ke URL.
Contohnya, jika kamu memiliki token bot `abcd:1234` dan URL `https://grammybot.herokuapp.com/secret_path`, link tersebut seharusnya akan tampak seperti ini:

```asciiart:no-line-numbers
https://api.telegram.org/botabcd:1234/setWebhook?url=https%3A%2F%2Fgrammybot.herokuapp.com%2Fsecret_path
```

:::

::: tip ⚡ Optimisasi (opsional)
Gunakan [Webhook Reply](../guide/deployment-types.md#webhook-reply) agar lebih efisien.
:::

### Membuat `bot.ts`

Langkah berikutnya, buat `bot.ts` lalu tulis kode berikut:

```ts
import { Bot } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN belum diisi");

export const bot = new Bot(token);

bot.command("start", (ctx) => ctx.reply("Haloooo!"));
bot.on("message", (ctx) => ctx.reply("Dapat pesan baru!"));
```

Mantap!
Kita telah berhasil menyelesaikan coding-an utamanya.
Sebelum kita melangkah ke tahap deployment, kita bisa melakukan optimisasi kecil lainnya.
Seperti biasa, langkah ini adalah opsional.

::: tip ⚡ Optimisasi (opsional)
Setiap kali server dimulai, grammY akan mengambil sejumlah [informasi mengenai bot terkait](https://core.telegram.org/bots/api#getme) dari Telegram agar `ctx.me` tersedia di [object context](../guide/context.md).
Kita bisa mengisi [informasi bot](https://deno.land/x/grammy/mod.ts?s=BotConfig#prop_botInfo) tersebut secara manual untuk menghindari pemanggilan `getMe` secara berlebihan.

1. Buka link `https://api.telegram.org/bot<bot_token>/getMe` di web browser favoritmu.
   Kami merekomendasikan untuk menggunakan browser [Firefox](https://www.mozilla.org/en-US/firefox/) karena ia mampu menampilkan format `json` dengan baik.
2. Ubah kode di baris ke-4 di atas dengan value yang telah kita dapat dari `getMe` tadi:

```ts
const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN belum diisi");

export const bot = new Bot(token, {
  botInfo: {
    id: 111111111,
    is_bot: true,
    first_name: "xxxxxxxxx",
    username: "xxxxxxbot",
    can_join_groups: true,
    can_read_all_group_messages: false,
    supports_inline_queries: false,
  },
});
```

:::

Keren!
Sekarang waktunya mempersiapkan environment deployment kita!
Mari menuju [bagian Deployment](#deployment), saudara-saudara sekalian! :muscle:

## Long Polling

::: warning Script Kamu Akan Dijalankan secara Terus-menerus ketika Menggunakan Long Polling
Pastikan kamu memiliki [dyno hours](https://devcenter.heroku.com/articles/eco-dyno-hours) yang cukup, kecuali jika kamu tahu cara mengatasinya.
:::

> Lebih memilih webhook?
> Lompat ke [bagian webhooks](#webhooks) di atas. :rocket:

Menggunakan long polling di server bukanlah ide yang buruk.
Terkadang, deployment jenis ini cocok untuk bot pengoleksi data, dimana ia tidak memerlukan respon yang cepat serta membutuhkan waktu yang lama untuk memproses banyak data.
Jika ingin melakukannya setiap satu jam sekali, kamu bisa melakukannya dengan sangat mudah.
Hal-hal semacam itu yang tidak bisa kamu kontrol di webhooks.
Jika bot kamu dibanjiri banyak pesan, kamu akan melihat banyak sekali request webhooks, sedangkan di long polling kamu bisa membatasinya dengan mudah.

### Membuat `bot.ts`

Mari kita buka file `bot.ts` yang telah kita buat di awal tadi.
Pastikan ia memiliki baris-baris kode berikut:

```ts
import { Bot } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN belum diisi");

const bot = new Bot(token);

bot.command(
  "start",
  (ctx) => ctx.reply("Aku berjalan di Heroku menggunakan long polling!"),
);

bot.start();
```

Selesai!
Kita siap untuk men-deploy-nya.
Cukup simpel, bukan? :smiley:
Jika kamu pikir ini terlalu mudah, coba lihat [daftar Deployment](../advanced/deployment.md#long-polling) yang telah kami buat! :rocket:

## Deployment

Eitss… _Bot Roket_ kita masih belum siap untuk diluncurkan.
Selesaikan tahapan-tahapan ini dulu!

### Compile File-nya

Jalankan kode ini di terminal untuk meng-compile file TypeScript menjadi JavaScript:

```sh
npx tsc
```

Jika berhasil dijalankan dan tidak ada pesan error yang muncul, file-file yang telah di-compile akan tersedia di folder `dist` dengan ekstension `.js` di akhir namanya.

### Siapkan File `Procfile`

`Heroku` memiliki beberapa [jenis dynos](https://devcenter.heroku.com/articles/dyno-types).
Dua diantaranya adalah:

- **Web dynos**:
  <br> _Web dynos_ adalah sebuah dyno untuk memproses "web" yang menerima traffic HTTP dari berbagai router.
  Dyno tipe ini memiliki waktu timeout selama 30 detik untuk menjalankan kode.
  Selain itu, ia akan tidur jika tidak ada request yang dikerjakan dalam rentang waktu 30 menit.
  Jenis dyno seperti ini cocok digunakan untuk _webhooks_.

- **Worker dynos**:
  <br> _Worker dynos_ digunakan untuk memproses kode di belakang layar.
  Ia TIDAK memiliki waktu timeout dan TIDAK akan tidur jika tidak ada request web yang dikerjakan.
  Sehingga, ia cocok digunakan untuk _long polling_.

Buat file dengan nama `Procfile` tanpa extension file di direktori root proyek kita.
Contohnya, `Procfile.txt` dan `procfile` bukan nama yang valid.
Lalu, tulis satu baris kode berikut:

```
<jenis dyno>: <perintah untuk menjalankan file entry kita>
```

Untuk contoh kali ini, kita akan menulisnya seperti berikut:

::::code-group
:::code-group-item Webhook

```
web: node dist/app.js
```

:::
:::code-group-item Long Polling

```
worker: node dist/bot.js
```

:::
::::

### Atur Git

Kita akan men-deploy bot menggunakan [Git dan Heroku CLI](https://devcenter.heroku.com/articles/git).
Berikut link cara penginstalannya:

- [Instruksi menginstal Git](https://git-scm.com/download/)
- [Instruksi menginstal Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli#install-the-heroku-cli)

Kami mengasumsikan kamu telah menginstal kedua software tersebut, dan kamu juga sudah membuka terminal yang mengarah ke direktori root proyek kita.
Sekarang, buat repositori git lokal dengan menjalankan kode ini di terminal:

```sh
git init
```

Selanjutnya, kita perlu mencegah beberapa file tidak ikut terunggah ke server produksi kita, dalam hal ini `Heroku`.
Buat sebuah file bernama `.gitignore` di direktori root proyek kita.
Kemudian, tambahkan daftar berikut:

```
node_modules/
src/
tsconfig.json
```

Hasil akhir struktur folder kita akan tampak seperti ini:

::::code-group
:::code-group-item Webhook

```asciiart:no-line-numbers
.
├── .git/
├── node_modules/
├── dist/
│   ├── bot.js
│   └── app.js
├── src/
│   ├── bot.ts
│   └── app.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── Procfile
└── .gitignore
```

:::
:::code-group-item Long Polling

```asciiart:no-line-numbers
.
├── .git/
├── node_modules/
├── dist/
│   └── bot.js
├── src/
│   └── bot.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── Procfile
└── .gitignore
```

:::
::::

Commit file-file tersebut ke repositori git kita:

```sh
git add .
git commit -m "Commit pertamaku"
```

### Atur Remote Heroku

Jika kamu sudah membuat [Heroku app](https://dashboard.heroku.com/apps/), masukkan nama `app` tersebut ke `<myApp>` di bawah, kemudian jalankan kodenya.
Kalau belum punya, jalankan `New app`.

::::code-group
:::code-group-item New app

```sh
heroku create
git remote -v
```

:::
:::code-group-item Existing app

```sh
heroku git:remote -a <myApp>
```

:::
::::

### Men-deploy Kode

Terakhir, tekan _tombol merah_ berikut dan meluncur! :rocket:

```sh
git push heroku main
```

Jika kode di atas tidak bekerja, kemungkinan besar branch git kita bukanlah `main`, tetapi `master`.
Kalau begitu, tekan _tombol biru_ berikut:

```sh
git push heroku master
```
