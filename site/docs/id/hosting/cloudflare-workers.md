# Hosting: Cloudflare Workers (Deno)

[Cloudflare Workers](https://workers.cloudflare.com) adalah sebuah platform pengkomputasian serverless publik yang menawarkan solusi simpel dan nyaman untuk menjalankan beban kerja yang tidak terlalu berat di [edge](https://en.wikipedia.org/wiki/Edge_computing).

Panduan ini akan menuntun kamu melakukan hosting bot Telegram di Cloudflare Workers.

## Persiapan

Untuk mengikuti panduan ini, pastikan kamu sudah memiliki sebuah [akun Cloudflare](https://dash.cloudflare.com/login) beserta subdomain workers yang sudah [dikonfigurasi](https://dash.cloudflare.com/?account=workers).

## Menyiapkan Proyek

Pastikan kamu sudah menginstal [Deno](https://deno.land) dan [Denoflare](https://denoflare.dev).

Buat sebuah direktori baru, lalu buat sebuah file bernama `.denoflare` di dalamnya.
Isi file dengan konten berikut:

> Catatan: Key "$schema" pada kode JSON berikut berisi versi tertaut di URL-nya ("v0.5.12").
> Ketika dokumentasi ini dibuat, itu merupakan versi yang paling terbaru.
> Kamu perlu memperbaruinya ke [versi yang terbaru](https://github.com/skymethod/denoflare/releases).

```json{2,9,17-18}
{
  "$schema": "https://raw.githubusercontent.com/skymethod/denoflare/v0.5.12/common/config.schema.json",
  "scripts": {
    "my-bot": {
      "path": "bot.ts",
      "localPort": 3030,
      "bindings": {
        "BOT_TOKEN": {
          "value": "TOKEN_BOT_KAMU"
        }
      },
      "workersDev": true
    }
  },
  "profiles": {
    "account1": {
      "accountId": "ID_AKUN_KAMU",
      "apiToken": "TOKEN_API_KAMU"
    }
  }
}
```

Pastikan untuk mengganti `ID_AKUN_KAMU`, `TOKEN_API_KAMU`, dan `TOKEN_BOT_KAMU` dengan nilai yang sesuai.
Ketika membuat token API, kamu bisa memilih pra atur `Edit Cloudflare Workers` dari perizinan yang telah diatur.

## Membuat Bot

Buat sebuah file baru bernama `bot.ts` lalu isi dengan kode berikut:

```ts
import { Bot, webhookCallback } from "https://deno.land/x/grammy/mod.ts";
import { UserFromGetMe } from "https://deno.land/x/grammy/types.ts";

interface Environment {
  BOT_TOKEN: string;
}

let botInfo: UserFromGetMe | undefined = undefined;

export default {
  async fetch(request: Request, env: Environment) {
    try {
      const bot = new Bot(env.BOT_TOKEN, { botInfo });

      if (botInfo === undefined) {
        await bot.init();
        botInfo = bot.botInfo;
      }

      bot.command(
        "start",
        (ctx) => ctx.reply("Selamat datang! Bot berjalan dengan baik."),
      );
      bot.on("message", (ctx) => ctx.reply("Dapat pesan baru!"));

      const cb = webhookCallback(bot, "cloudflare-mod");

      return await cb(request);
    } catch (e) {
      return new Response(e.message);
    }
  },
};
```

## Men-deploy Bot

Caranya mudah sekali.
Cukup jalankan perintah berikut:

```sh
denoflare push my-bot
```

Hasil keluaran atau output dari perintah di atas berisi host tempat worker-nya dijalankan.
Cari baris yang mengandung string serupa dengan `<BOT_KU>.<SUBDOMAIN_KU>.workers.dev`.
String tersebut adalah alamat atau host dimana bot kamu menunggu untuk dipanggil.

## Mengatur Webhook

Kita perlu memberi tahu Telegram ke mana update seharusnya dikirim.
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
denoflare serve my-bot
```

Ketika server pengembangan dimulai, kamu bisa menguji bot kamu dengan cara mengirimkan sampel update ke bot tersebut menggunakan alat seperti `curl`, [Insomnia](https://insomnia.rest), atau [Postman](https://postman.com).
Lihat [di sini](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates) untuk contoh update dan [di sini](https://core.telegram.org/bots/api#update) untuk informasi mengenai struktur update tersebut.
