# Hosting: Cloudflare Workers

[Cloudflare Workers](https://workers.cloudflare.com/) adalah sebuah platform pengkomputasian serverless publik yang menawarkan solusi simpel dan nyaman untuk menjalankan JavaScript di [edge](https://en.wikipedia.org/wiki/Edge_computing).
Dengan kemampuannya untuk menangani lalu lintas HTPP serta ditenagai oleh [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), mengembangkan bot Telegram menjadi sangat mudah.
Tidak berhenti di situ, kamu bahkan bisa mengembangkan [Web Apps](https://core.telegram.org/bots/webapps) di edge, semua tanpa biaya dengan kuota tertentu.

Panduan ini akan menuntun kamu melakukan hosting bot Telegram di Cloudflare Workers.

## Persiapan

Untuk mengikuti panduan ini, pastikan kamu sudah memiliki sebuah [akun Cloudflare](https://dash.cloudflare.com/login) beserta subdomain workers yang sudah [dikonfigurasi](https://dash.cloudflare.com/?account=workers).

## Menyiapkan Proyek

Pertama-tama, buat sebuah proyek baru:

```sh
npx wrangler generate bot-ku-sayang
```

Kamu bisa mengubah `bot-ku-sayang` dengan nama lainnya.
Nama tersebut akan menjadi nama untuk bot kamu serta direktori proyeknya.

Setelah menjalankan perintah di atas, ikuti instruksi yang tampilkan untuk membuat proyek tersebut.
Dari situ, kamu juga bisa memilih untuk menggunakan JavaScript atau TypeScript.

Ketika proyek sudah dibuat, `cd` ke dalam `bot-ku-sayang` atau direktori manapun yang telah kamu buat di proyek tadi.
Tergantung dari bagaimana kamu membuatnya, struktur file proyek setidaknya mirip seperti ini:

```asciiart:no-line-numbers
.
├── node_modules
├── package.json
├── package-lock.json
├── src
│   ├── index.js
│   └── index.test.js
└── wrangler.toml
```

Selanjutnya, install `grammy` dan package lain yang kamu butuhkan:

```sh
npm install grammy
```

## Membuat Bot

Tulis kode berikut ke dalam `src/index.js` atau `src/index.ts`:

```ts
// Perhatikan bahwa kita meng-import dari 'grammy/web', bukan 'grammy'.
import { Bot, webhookCallback } from "grammy/web";

// Baris kode berikut mengasumsikan bahwa kamu sudah mengonfigurasi secret BOT_TOKEN dan BOT_INFO.
// Lihat https://developers.cloudflare.com/workers/platform/environment-variables/#secrets-on-deployed-workers.
// BOT_INFO diperoleh dari bot.api.getMe().
const bot = new Bot(BOT_TOKEN, { botInfo: BOT_INFO });

bot.command("start", async (ctx) => {
  await ctx.reply("Halo, dunia!");
});

addEventListener("fetch", webhookCallback(bot, "cloudflare"));
```

Bot pada contoh di atas akan membalas "Halo, dunia!" ketika menerima command `/start`.

## Men-deploy Bot

Sebelum di-deploy, kita perlu mengubah `wrangler.toml`:

```toml
account_id = 'id_akun kamu' # Ambil dari Cloudflare dashboard.
name = 'bot-ku-sayang' # Nama bot kamu, yang akan muncul di URL webhook, misalnya: https://bot-ku-sayang.subdomain-ku.workers.dev
main = "src/index.js"  # File utama untuk worker.
compatibility_date = "2023-01-16"
```

Selanjutnya, kamu bisa deploy bot menggunakan perintah berikut:

```sh
npm run deploy
```

## Mengatur Webhook

Kita perlu memberi tahu Telegram lokasi atau alamat pengiriman update.
Buka browser kamu lalu kunjungi URL ini:

```text
https://api.telegram.org/bot<TOKEN_BOT>/setWebhook?url=https://<BOT_KU>.<SUBDOMAIN_KU>.workers.dev/
```

Ganti `<TOKEN_BOT>`, `<BOT_KU>`, dan `<SUBDOMAIN_KU>` dengan nilai yang sesuai.
Jika konfigurasinya tepat, kamu akan menerima respon JSON seperti ini:

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

## Uji Coba Bot

Buka aplikasi Telegram lalu `/start` bot kamu.
Jika ia merespon, berarti kamu telah berhasil!

## Men-debug Bot

Untuk melakukan pengujian dan debugging, kamu bisa menjalankan sebuah server pengembangan lokal maupun remote sebelum men-deploy bot kamu ke tahap produksi.
Cukup jalankan perintah berikut:

```sh
npm run start
```

Ketika server pengembangan dimulai, kamu bisa menguji bot kamu dengan cara mengirimkan sampel update ke bot tersebut menggunakan alat seperti `curl`, [Insomnia](https://insomnia.rest), atau [Postman](https://postman.com).
Lihat [di sini](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates) untuk contoh update dan [di sini](https://core.telegram.org/bots/api#update) untuk informasi mengenai struktur update tersebut.
