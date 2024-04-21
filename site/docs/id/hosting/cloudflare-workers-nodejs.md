---
prev: false
next: false
---

# Hosting: Cloudflare Workers (Node.js)

[Cloudflare Workers](https://workers.cloudflare.com) adalah sebuah platform pengkomputasian serverless publik yang menawarkan kemudahan serta kenyamanan untuk menjalankan JavaScript di [edge](https://en.wikipedia.org/wiki/Edge_computing).
Dengan kemampuannya untuk menangani lalu lintas HTTP serta ditenagai oleh [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), mengembangkan bot Telegram menjadi sangat mudah.
Tidak berhenti di situ, kamu bahkan bisa mengembangkan [Web Apps](https://core.telegram.org/bots/webapps) di edge tersebut, semua tanpa biaya dengan kuota tertentu.

Panduan ini akan menuntun kamu untuk meng-hosting bot Telegram di Cloudflare Workers.

::: tip Mencari yang Versi Deno?
Tutorial ini berisi langkah-langkah untuk men-deploy bot Telegram ke Cloudflare Workers menggunakan Node.js.
Jika kamu sedang mencari versi yang Deno, silahkan beralih ke [tutorial berikut](./cloudflare-workers).
:::

## Persiapan

1. sebuah [Akun Cloudflare](https://dash.cloudflare.com/login) beserta subdomain worker yang telah [dikonfigurasi](https://dash.cloudflare.com/?account=workers).
2. sebuah environment [NodeJS](https://nodejs.org/) beserta `npm` yang telah terinstal.

## Menyiapkan Proyek

Pertama-tama, buat sebuah proyek baru:

```sh
npm create cloudflare@latest
```

Kemudian, kamu akan diminta untuk memasukkan nama worker-nya:

```ansi{6}
using create-cloudflare version 2.17.1

╭ Create an application with Cloudflare Step 1 of 3
│
╰ In which directory do you want to create your application? also used as application name  // [!code focus]
  ./grammybot  // [!code focus]
```

Pilih nama proyek sesuai dengan yang kamu mau, di contoh kali ini kita menamainya dengan `grammybot`, selain akan menjadi nama worker, ia juga akan menjadi bagian dari _URL request_-nya.

::: tip
Jika berubah pikiran, kamu bisa mengubah nama worker-nya di `wrangler.toml`.
:::

Selanjutnya, kamu akan diminta memilih tipe worker-nya, di sini kita memilih `"Hello World" Worker`:

```ansi{8}
using create-cloudflare version 2.17.1

╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./grammybot
│
╰ What type of application do you want to create?  // [!code focus]
  ● "Hello World" Worker  // [!code focus]
  ○ "Hello World" Worker (Python)  // [!code focus]
  ○ "Hello World" Durable Object  // [!code focus]
  ○ Website or web app  // [!code focus]
  ○ Example router & proxy Worker  // [!code focus]
  ○ Scheduled Worker (Cron Trigger)  // [!code focus]
  ○ Queue consumer & producer Worker  // [!code focus]
  ○ API starter (OpenAPI compliant)  // [!code focus]
  ○ Worker built from a template hosted in a git repository  // [!code focus]
```

Kemudian, kamu akan diberi pilihan apakah ingin menggunakan TypeScript, jika ingin menggunakan JavaScript, pilih `No`.
Kali ini kita memilih `Yes`:

```ansi{11}
using create-cloudflare version 2.17.1

╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./grammybot
│
├ What type of application do you want to create?
│ type "Hello World" Worker
│
╰ Do you want to use TypeScript?  // [!code focus]
  Yes / No  // [!code focus]
```

Proyek kamu akan siap dalam beberapa menit.
Setelah itu, kamu akan diberi pilihan untuk menggunakan git sebagai version control-nya, pilih `Yes` jika kamu ingin menginisialisasi repo secara otomatis, pilih `No` untuk menginisialisasi secara mandiri.

Di sini kita memilih `Yes`:

```ansi{36}
using create-cloudflare version 2.17.1

╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./grammybot
│
├ What type of application do you want to create?
│ type "Hello World" Worker
│
├ Do you want to use TypeScript?
│ yes typescript
│
├ Copying template files
│ files copied to project directory
│
├ Updating name in `package.json`
│ updated `package.json`
│
├ Installing dependencies
│ installed via `npm install`
│
╰ Application created

╭ Configuring your application for Cloudflare Step 2 of 3
│
├ Installing @cloudflare/workers-types
│ installed via npm
│
├ Adding latest types to `tsconfig.json`
│ added @cloudflare/workers-types/2023-07-01
│
├ Retrieving current workerd compatibility date
│ compatibility date 2024-04-05
│
╰ Do you want to use git for version control?  // [!code focus]
  Yes / No  // [!code focus]
```

Terakhir, kamu akan ditanya apakah ingin men-deploy worker tersebut, karena kita belum membuat bot Telegram-nya, maka kita akan memilih `No`:

```ansi{49}
using create-cloudflare version 2.17.1

╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./grammybot
│
├ What type of application do you want to create?
│ type "Hello World" Worker
│
├ Do you want to use TypeScript?
│ yes typescript
│
├ Copying template files
│ files copied to project directory
│
├ Updating name in `package.json`
│ updated `package.json`
│
├ Installing dependencies
│ installed via `npm install`
│
╰ Application created

╭ Configuring your application for Cloudflare Step 2 of 3
│
├ Installing @cloudflare/workers-types
│ installed via npm
│
├ Adding latest types to `tsconfig.json`
│ added @cloudflare/workers-types/2023-07-01
│
├ Retrieving current workerd compatibility date
│ compatibility date 2024-04-05
│
├ Do you want to use git for version control?
│ yes git
│
├ Initializing git repo
│ initialized git
│
├ Committing new files
│ git commit
│
╰ Application configured

╭ Deploy with Cloudflare Step 3 of 3
│
╰ Do you want to deploy your application?  // [!code focus]
  Yes / No  // [!code focus]
```

## Menginstal Dependensi

`cd` ke `grammybot` (sesuaikan dengan nama worker kamu), instal `grammy` dan package lain yang dibutuhkan:

```sh
npm install grammy
```

## Membuat Bot

Ubah `src/index.js` atau `src/index.ts` dengan kode berikut:

```ts{11,28-29,38,40-42,44}
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Bot, Context, webhookCallback } from "grammy";

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
  //
  // Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
  // MY_QUEUE: Queue;
  BOT_INFO: string;
  BOT_TOKEN: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const bot = new Bot(env.BOT_TOKEN, { botInfo: JSON.parse(env.BOT_INFO) });

    bot.command("start", async (ctx: Context) => {
      await ctx.reply("Hello World!");
    });

    return webhookCallback(bot, "cloudflare-mod")(request);
  },
};
```

Pada kode di atas, kita meng-import `Bot`, `Context` dan `webhookCallback` dari `grammy`.

Di dalam interface `Env`, kita telah menambahkan sebuah variable `BOT_INFO`, ia merupakan sebuah variable environment yang menyimpan informasi bot kamu, kamu bisa mendapatkan informasi tersebut dengan memanggil API Bot Telegram menggunakan method `getMe`.
Buka link berikut di web browser kamu:

```ansi:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/getMe
```

Ubah `<BOT_TOKEN>` dengan token bot kamu.
Jika berhasil, kamu akan melihat sebuah respon JSON yang serupa dengan ini:

```json{3-12}
{
    "ok": true,
    "result": {
        "id": 1234567890,
        "is_bot": true,
        "first_name": "mybot",
        "username": "MyBot",
        "can_join_groups": true,
        "can_read_all_group_messages": false,
        "supports_inline_queries": true,
        "can_connect_to_business": false
    }
}
```

Sekarang, buka `wrangler.toml` yang berada di root proyek kamu, lalu tambahkan sebuah variable environment `BOT_INFO` ke bagian `[vars]` dengan nilai yang kamu dapatkan dari object `result` di atas seperti ini:

```toml
[vars]
BOT_INFO = """{
    "id": 1234567890,
    "is_bot": true,
    "first_name": "mybot",
    "username": "MyBot",
    "can_join_groups": true,
    "can_read_all_group_messages": false,
    "supports_inline_queries": true,
    "can_connect_to_business": false
}"""
```

Ubah info bot dengan apa yang kamu dapatkan dari web browser tadi.
Perhatikan tiga tanda kutip `"""` di awal dan akhir.

Selain `BOT_INFO`, kita juga akan menambahkan sebuah variable `BOT_TOKEN`, ia merupakan sebuah environment variable yang berisi token untuk digunakan membuat bot kamu.

Kita baru saja membuat variable `BOT_TOKEN`, tetapi variable tersebut belum kita terapkan.
Environment variable pada umumnya disimpan di `wrangler.toml`, langkah tersebut tidaklah aman, karena dalam kasus kita token bot perlu untuk dirahasiakan.
Cloudflare Workers menyediakan metode yang aman untuk menyimpan informasi sensitif seperti API key dan token autentikasi di dalam sebuah environment variable bernama [secrets](https://developers.cloudflare.com/workers/configuration/secrets/#secrets)!

::: tip
Isi secret yang telah kamu buat tidak akan terlihat baik di Wrangler ataupun dashboard Cloudflare.
:::

Kamu bisa menambahkan sebuah secret ke proyek kamu menggunakan perintah berikut:

```sh
npx wrangler secret put BOT_TOKEN
```

Ikuti instruksinya lalu masukkan token bot kamu, token tersebut nantinya akan diunggah dan dienkripsi.

::: tip
Kamu bebas untuk menggunakan nama environment variable lain, jangan lupa untuk menyesuaikan nama variable tersebut ke langkah-langkah selanjutnya.
:::

Kita telah membuat sebuah bot menggunakan `BOT_TOKEN` di dalam function `fetch()` yang akan membalas "Hello, world!" ketika menerima perintah `/start`.

## Men-deploy Bot

Sekarang, kamu bisa men-deploy bot tersebut menggunakan perintah berikut:

```sh
npm run deploy
```

## Mengatur Webhook

Kita perlu memberi tahu Telegram ke mana update perlu dikirim.
Buka browser kamu lalu kunjungi URL ini:

```ansi:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<MY_BOT>.<MY_SUBDOMAIN>.workers.dev/
```

Ganti `<BOT_TOKEN>` dengan token bot, `<MY_BOT>` dengan nama worker, dan `<MY_SUBDOMAIN>` dengan subdomain worker yang telah dikonfigurasi di dashboard Cloudflare.

Jika konfigurasinya tepat, kamu akan menerima respon JSON seperti ini:

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

## Mengetes Bot

Buka aplikasi Telegram lalu `/start` bot kamu.
Jika ia merespon, berarti kamu telah berhasil!

## Men-debug Bot

Untuk melakukan pengujian dan debugging, kamu bisa menjalankan sebuah server pengembangan baik lokal ataupun remote sebelum men-deploy bot ke tahap produksi.

Di mode pengembangan, bot tidak memiliki akses ke environment variable secret.
Oleh karena itu, [berdasarkan panduan Cloudflare](https://developers.cloudflare.com/workers/configuration/secrets/#secrets-in-development), kamu bisa membuat sebuah file `.dev.vars` di root proyek untuk mendefinisikan sercet-nya:

```env
BOT_TOKEN=<token_bot>  # <- ganti dengan token bot kamu.
```

Jangan lupa untuk menambahkan `BOT_INFO` juga.
Klik [di sini](https://developers.cloudflare.com/workers/configuration/environment-variables/) dan [di sini](https://developers.cloudflare.com/workers/configuration/secrets/) untuk informasi lebih lanjut mengenai environment variable dan secret.

Jika kamu telah mengubah nama environment variable di langkah sebelumnya, ganti `BOT_INFO` dan `BOT_TOKEN` dengan nama yang sesuai.

::: tip
Kamu bisa menggunakan token bot yang berbeda untuk pengembangan agar bot utama yang berada di produksi tidak terpengaruh.
:::

Sekarang, kamu bisa menjalankan perintah berikut untuk memulai sebuah server pengembangan:

```sh
npm run dev
```

Ketika server pengembangan sudah dijalankan, kamu bisa mengetes bot dengan mengirimkan sampel update menggunakan alat seperti `curl`, [Insomnia](https://insomnia.rest), atau [Postman](https://postman.com).
Informasi mengenai sampel update bisa kamu dapatkan [dari sini](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates), sedangkan untuk informasi mengenai struktur update-nya bisa dilihat [di sini](https://core.telegram.org/bots/api#update).

Jika kamu tidak ingin menyusun update secara mandiri, atau hendak melakukan pengetesan menggunakan update yang asli, kamu bisa memperolehnya menggunakan method `getUpdates` dari API Bot Telegram.
Sebelum itu, kita perlu menghapus webhook-nya terlebih dahulu.
Buka web browser, lalu kunjungi link berikut:

```ansi:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/deleteWebhook
```

Seusai mengganti `<BOT_TOKEN>` dengan token bot, kamu akan memperoleh sebuah respon JSON yang serupa dengan ini:

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was deleted"
}
```

Buka aplikasi Telegram kamu, lalu kirim sesuatu ke bot, misalnya `/start`.

Kemudian, kunjungi link berikut di web browser untuk mendapatkan update-nya:

```ansi:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
```

Sekali lagi, ganti `<BOT_TOKEN>` dengan token bot, jika berhasil, kamu akan mendapatkan sebuah respon JSON yang serupa dengan ini:

```json{4-29}
{
    "ok": true,
    "result": [
        {
            "update_id": 123456789,
            "message": {
                "message_id": 123,
                "from": {
                    "id": 987654321,
                    "is_bot": false,
                    "first_name": "",
                    "language_code": "en"
                },
                "chat": {
                    "id": 987654321,
                    "first_name": "",
                    "type": "private"
                },
                "date": 1712803046,
                "text": "/start",
                "entities": [
                    {
                        "offset": 0,
                        "length": 6,
                        "type": "bot_command"
                    }
                ]
            }
        }
    ]
}
```

`result` berisi sebuah array yang memuat berbagai object update (pada contoh di atas ia hanya memiliki satu object update), salin salah satu object, lalu tes bot dengan mengirim object tersebut ke server pengembangan menggunakan alat yang telah disebutkan di atas tadi.

Jika kamu berkeinginan untuk mengabaikan update yang telah usang (misalnya, sebelum men-deploy ke tahap produksi, kamu ingin mengabaikan semua update yang dilakukan selama proses pengembangan), kamu bisa menambahkan sebuah parameter `offset` ke method `getUpdates` seperti ini:

```ansi:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/getUpdates?offset=<update_id>
```

Ganti `<BOT_TOKEN>` dengan token bot dan `<update_id>` dengan `update_id` dari update terakhir yang kamu terima (yang angkanya paling besar), dengan begitu, kamu akan menerima update baru yang dikirim setelah update tersebut saja, dan update dari sebelum-sebelumnya tidak akan bisa diperoleh lagi.
Sekarang, kamu bisa mengetes bot dengan object update asli di lingkungan kerja pengembangan lokal!

Kamu juga bisa mengekspos server pengembangan lokal ke publik menggunakan layanan reverse proxy seperti [Ngrok](https://ngrok.com/) lalu mengatur webhook ke URL yang kamu dapatkan dari mereka, atau kamu juga bisa membuat reverse proxy-mu sendiri jika kamu memiliki sebuah alamat IP publik, nama domain, dan sertifikat SSL, tetapi itu semua tidak akan dibahas di panduan ini.
Untuk informasi lebih lanjut mengenai penyiapan reverse proxy, lihat dokumentasi software yang kamu gunakan.

::: warning
Menggunakan reverse proxy pihak ketika dapat menyebabkan beberapa informasi tersebar ke publik!
:::

::: tip
Jangan lupa untuk [mengembalikan pengaturan webhook](#mengatur-webhook)-nya ketika hendak men-deploy bot ke produksi.
:::
