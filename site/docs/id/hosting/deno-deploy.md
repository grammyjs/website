---
prev: false
next: false
---

# Hosting: Deno Deploy

Panduan ini menjelaskan cara menjalankan bot grammY di [Deno Deploy](https://docs.deno.com/deploy/).

::: warning Deno Deploy akan dihentikan
Deno Deploy Classic telah dihentikan pada Juli 2026, dan layanan Deno Deploy saat ini akan [dihentikan pada April 2027](https://deno.com/blog/cloudflare).
Untuk bot baru atau untuk memindahkan bot yang sudah ada, kamu bisa [menjalankan bot Deno di VPS](./vps).
:::

Hasil dari tutorial disini dapat dilihat di [repositori bot kami](https://github.com/grammyjs/examples/tree/main/setups/deno-deploy).

## Menyiapkan Kode

> Ingat! Kamu perlu [menjalankan bot dengan webhooks](../guide/deployment-types#bagaimana-cara-menggunakan-webhook), jadi kamu harus menggunakan `webhookCallback` alih-alih memanggil `bot.start()` di kodemu.

1. Pastikan kamu meng-export object bot di dalam sebuah file agar nantinya bisa di-import ketika ingin menjalankannya.
2. Buat sebuah file dengan nama `main.ts` atau `main.js`, ataupun nama lainnya sesuai dengan keinginanmu (tetapi kamu harus mengingatnya karena nanti file tersebut akan digunakan sebagai file deploy utama). File tersebut berisikan:

```ts
import { webhookCallback } from "npm:grammy";
// Kamu mungkin perlu mengubah ini agar dapat melakukan import pada object bot-mu.
import bot from "./bot.ts";

const handleUpdate = webhookCallback(bot, "std/http");

Deno.serve(async (req) => {
  if (req.method === "POST") {
    const url = new URL(req.url);
    if (url.pathname.slice(1) === bot.token) {
      try {
        return await handleUpdate(req);
      } catch (err) {
        console.error(err);
      }
    }
  }
  return new Response();
});
```

Kami menganjurkan kamu untuk menaruh handler di direktori rahasia alih-alih menempatkanya di root (`/`).
Di contoh kali ini, kita menggunakan token bot (`/<token bot>`) sebagai direktori rahasianya.

## Men-deploy Bot

### Metode 1: Menggunakan GitHub

Ikuti [panduan memulai Deno Deploy](https://docs.deno.com/deploy/getting_started/) untuk membuat aplikasi dan menghubungkan repositori GitHub kamu.
Atur aplikasi sebagai aplikasi dinamis, gunakan `main.ts` atau nama file yang kamu pilih sebelumnya sebagai entrypoint, lalu atur variabel lingkungan yang dibutuhkan bot.

### Metode 2: Menggunakan `deno deploy`

Ikuti [dokumentasi `deno deploy`](https://docs.deno.com/runtime/reference/cli/deploy/) untuk membuat dan men-deploy aplikasi dinamis dari proyek lokal kamu.
Gunakan `main.ts` atau nama file yang kamu pilih sebelumnya sebagai entrypoint.

### Catatan

Setelah mendapati bot-mu dapat berjalan, kamu harus melakukan konfigurasi pada pengaturan webhook untuk menggunakan URL bot-mu yang baru.

```sh:no-line-numbers
curl https://api.telegram.org/bot<token>/setWebhook?url=<url>
```

Ganti `<token>` dengan token bot-mu, dan `<url>` dengan URL lengkap bot kamu.
