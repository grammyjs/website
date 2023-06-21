---
prev: false
next: false
---

# Hosting: Supabase Edge Functions

Halaman ini berisi panduan mengenai langkah-langkah meng-hosting bot grammY di [Supabase](https://supabase.com/).

Kamu diharuskan memiliki sebuah akun [GitHub](https://github.com) untuk menggunakan [Supabase Edge Functions](https://supabase.com/docs/guides/functions/quickstart).
Supabase Edge Functions berbasiskan [Deno Deploy](https://deno.com/deploy), sehingga seperti [panduan Deno Deploy](./deno-deploy) yang telah kami buat sebelumnya, panduan ini ditujukan untuk pengguna Deno grammY saja.

Supabase Edge Functions cocok untuk sebagian besar bot yang memiliki fungsi sederhana, dan perlu kamu ketahui bahwa tidak semua fitur di Deno tersedia untuk aplikasi-aplikasi yang berjalan di Supabase Edge Functions.
Contohnya, Supabase Edge Functions tidak menyediakan fitur file system.
Ia serupa dengan platform serverless lainnya, namun hanya ditujukan untuk aplikasi Deno.

Hasil dari tutorial ini bisa dilihat di [repositori bot kami](https://github.com/grammyjs/examples/tree/main/supabase-edge-functions).

## Pemasangan

Untuk men-deploy bot ke Supabase Edge Functions, kamu harus membuat sebuah akun Supabase, menginstal CLI mereka, dan membuat sebuah proyek Supabase.
Cara pemasangannya bisa dilihat di [dokumentasi yang mereka sediakan](https://supabase.com/docs/guides/functions/quickstart#prerequisites).

Buat sebuah Supabase Function dengan cara menjalankan perintah berikut:

```sh
supabase functions new telegram-bot
```

Setelah berhasil membuat sebuah proyek Supabase Function, sekarang kamu bisa menulis bot-nya.

## Siapkan Kodenya

> Perlu diingat bahwa kamu harus [menjalankan bot menggunakan webhooks](../guide/deployment-types#bagaimana-cara-menggunakan-webhook).
> Oleh karena itu, gunakan `webhookCallback` alih-alih `bot.start()` di kode kamu.

Kamu bisa menggunakan contoh bot singkat ini sebagai entry point-nya.

```ts
import { serve } from "https://deno.land/std/http/server.ts";
import { Bot, webhookCallback } from "https://deno.land/x/grammy/mod.ts";

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN belum diisi");

const bot = new Bot(token);

bot.command(
  "start",
  (ctx) => ctx.reply("Selamat datang! Bot sedang berjalan."),
);
bot.command("ping", (ctx) => ctx.reply(`Pong! ${new Date()}`));

const handleUpdate = webhookCallback(bot, "std/http");

serve(async (req) => {
  try {
    const url = new URL(req.url);
    if (url.searchParams.get("secret") !== bot.token) {
      return new Response("not allowed", { status: 405 });
    }
    return await handleUpdate(req);
  } catch (err) {
    console.error(err);
  }
});
```

## Melakukan Deploy

Kamu sekarang bisa men-deploy bot ke Supabase.
Perlu dicatat bahwa kamu diharuskan menonaktifkan otorisasi JWT karena Telegram menggunakan metode lain untuk memastikan request tersebut benar-benar berasal dari Telegram.
Kamu bisa men-deploy function-nya dengan perintah ini:

```sh
supabase functions deploy --no-verify-jwt telegram-bot
```

Selanjutnya, berikan token bot ke Supabase agar kode kamu bisa mengaksesnya sebagai sebuah environment variable.

```sh
# Ganti 123:aBcDeF-gh dengan token bot-mu yang asli.
supabase secrets set BOT_TOKEN=123:aBcDeF-gh
```

Supabase Function kamu sekarang sudah berjalan.
Sisanya, kita perlu memberi tahu Telegram ke mana ia harus mengirim update-update-nya.
Kamu bisa melakukannya dengan memanggil `setWebhook`.
Contohnya, buka sebuah tab baru di browser lalu kunjungi URL berikut:

```txt
https://api.telegram.org/bot<TOKEN_BOT>/setWebhook?url=https://<NAMA_PROYEK>.functions.supabase.co/telegram-bot?secret=<TOKEN_BOT>
```

Ganti `<TOKEN_BOT>` dengan token bot kamu yang asli.
Jangan lupa untuk mengganti `<TOKEN_BOT>` yang kedua dengan token bot-mu juga.
Ganti `<NAMA_PROYEK>` dengan nama proyek Supabase kamu.

Jika berhasil, kamu akan melihat string JSON berikut di jendela browser:

```json
{ "ok": true, "result": true, "description": "Webhook was set" }
```

Selesai!
Bot kamu sekarang sudah berjalan.
Kirim sebuah pesan lalu bot akan membalas pesan tersebut!
