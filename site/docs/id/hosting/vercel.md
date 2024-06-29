---
prev: false
next: false
---

# Hosting: Vercel Serverless Functions

Di tutorial kali ini, kami akan memandu kamu untuk men-deploy bot di [Vercel](https://vercel.com/) dengan menggunakan [Vercel Serverless Functions](https://vercel.com/docs/functions), tentunya dengan asumsi kamu sudah memiliki sebuah akun [Vercel](https://vercel.com).

## Struktur Proyek

Untuk menggunakan **Vercel Serverless Functions**, kamu cuma perlu memindahkan kode ke direktori `api/` seperti contoh di bawah.
Silahkan baca [dokumentasi Vercel](https://vercel.com/docs/functions/quickstart) untuk info lebih lanjut.

```asciiart:no-line-numbers
.
├── node_modules/
├── build/
├── api/
│   └── bot.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

Jika kamu menggunakan TypeScript, kamu mungkin juga tertarik untuk menginstal `@vercel/node` sebagai dev dependency (tidak wajib diinstal untuk mengikuti tutorial ini).

## Mengatur Vercel

Langkah selanjutnya adalah membuat sebuah file `versel.json` di tingkat teratas (top level) struktur proyek kamu.
Sehingga, untuk contoh struktur kita tadi, isi file-nya kurang lebih terlihat seperti ini:

```json
{
  "functions": {
    "api/bot.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

> Jika kamu menggunakan paket Vercel yang versi gratis, konfigurasi `memory` dan `maxDuration` kamu sebaiknya mengikuti contoh di atas agar batas limit tidak terlampaui.

Jika kamu tertarik untuk mempelajari file konfigurasi `vercel.json` ini, silahkan baca [dokumentasi berikut](https://vercel.com/docs/projects/project-configuration).

## Mengatur TypeScript

Di file `tsconfig.json` kita perlu menentukan direktori output-nya sebagai `build/` serta direktori root-nya sebagai `api/`.
Ini perlu dilakukan karena kita sebelumnya telah mencantumkan direktori tersebut di opsi deploy Vercel.

```json{5,8}
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "commonjs",
    "rootDir": "./api",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "outDir": "./build",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

## File Utama

Baik menggunakan TypeScript maupun JavaScript, kita wajib mempunyai sebuah source file atau file utama agar bot bisa dijalankan.
Secara garis besar, isinya kurang lebih seperti ini:

```ts
import { Bot, webhookCallback } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN belum diisi");

const bot = new Bot(token);

export default webhookCallback(bot, "std/http");
```

::: tip [Vercel Edge Functions](https://vercel.com/docs/functions) memiliki dukungan terbatas terhadap grammY
Meski kamu masih bisa menggunakan paket inti grammY dan sejumlah plugin lainnya, beberapa plugin tertentu mungkin tidak akan kompatibel karena [Edge Runtime](https://edge-runtime.vercel.app) Vercel belum mendukung dependensi Node.js secara keseluruhan.

Saat ini, kami tidak memiliki daftar lengkap plugin yang kompatibel, sehingga kamu perlu mencobanya sendiri.

Tambahkan baris ini pada kode di atas jika kamu ingin beralih ke Edge Functions:

```ts
export const config = {
  runtime: "edge",
};
```

:::

## Kunjungi Website Vercel

Dengan asumsi bahwa kamu sudah memiliki sebuah akun Vercel dan akun GitHub yang saling terhubung, buat sebuah proyek baru lalu pilih repository bot GitHub kamu.
Atur beberapa pengaturan di _Build & Development Settings_:

- Output directory: `build`
- Install command: `npm install`

Jangan lupa untuk menambahkan _secrets_ di pengaturan, misalnya token bot kamu sebagai environment variable.
Jika sudah, klik deploy!

## Mengatur Webhook

Langkah yang terakhir adalah menghubungkan aplikasi Vercel kamu ke Telegram.
Ubah URL berikut dengan informasi yang sesuai kemudian jalankan URL-nya di browser kamu:

```text
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=<HOST_URL>
```

Isian `HOST_URL` mungkin sedikit rumit karena kamu perlu memasukkan **domain aplikasi Vercel beserta rute ke kode bot kamu**, misalnya `https://nama-aplikasi-mu.vercel.app/api/bot`.
Dimana `bot` adalah file `bot.ts` atau `bot.js` kamu.

Jika semuanya berjalan lancar, kamu akan melihat respon berikut di jendela browser kamu.

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

Selamat!
Bot kamu sekarang siap untuk digunakan.
