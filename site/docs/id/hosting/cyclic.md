---
prev: false
next: false
---

# Hosting: Cyclic

Panduan ini berisi langkah-langkah untuk menjalankan bot grammY di [Cyclic](https://cyclic.sh).

## Prasyarat

Sebelum memulai, kamu diharuskan memiliki sebuah akun [GitHub](https://github.com) dan [Cyclic](https://cyclic.sh).
Pertama-tama, inisialisasi proyeknya lalu instal beberapa dependensi berikut:

```sh
# Inisialisasi proyek.
mkdir grammy-bot
cd grammy-bot
npm init -y

# Instal dependensi utama.
npm install grammy express dotenv

# Instal dependensi pengembangan.
npm install -D typescript ts-node nodemon @types/express @types/node

# Inisialisasi pengaturan TypeScript.
npx tsc --init
```

Kita akan menyimpan file TypeScript di dalam `src/` dan file hasil kompilasinya di `dist/`.
Setelah membuat kedua folder, cd ke `src/` lalu buat sebuah file bernama `bot.ts`.
Sekarang, struktur direktori root kita seharusnya mirip seperti ini:

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

Selanjutnya, buka `tsconfig.json` lalu ganti isinya dengan konfigurasi berikut:

```json
{
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true
  }
}
```

Kemudian, kita akan menambahkan script `start`, `build`, serta `dev` ke `package.json`.
Isi `package.json` kita kurang lebih menjadi seperti ini:

```json{6-10}
{
  "name": "grammy-bot",
  "version": "1.0.0",
  "description": "",
  "main": "dist/bot.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/bot.js",
    "dev": "nodemon src/bot.ts"
  },
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "grammy": "^1.17.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.4.9",
    "typescript": "^5.1.6",
    "nodemon": "^3.0.1",
    "ts-node": "^10.9.1"
  },
  "keywords": []
}
```

### Webhooks

Buka `src/bot.ts` lalu isi dengan kode berikut:

```ts{15}
import express from "express";
import { Bot, webhookCallback } from "grammy";
import "dotenv/config";

const bot = new Bot(process.env.BOT_TOKEN || "");

bot.command("start", (ctx) => ctx.reply("Halo Dunia!"))

if (process.env.NODE_ENV === "DEVELOPMENT") {
  bot.start();
} else {
  const port = process.env.PORT || 3000;
  const app = express();
  app.use(express.json());
  app.use(`/${bot.token}`, webhookCallback(bot, "express"));
  app.listen(port, () => console.log(`Menyimak di port ${port}`));
}
```

Untuk alasan keamanan, penanganan webhook sebaiknya diletakkan di path tersembunyi alih-alih di `/`.
Seperti yang terlihat pada baris yang disorot di atas, kita menggunakan path `/<bot-token>` alih-alih di `/`.

### Pengembangan Lokal

Buat sebuah file `.env` di root proyek lalu isi dengan konten berikut:

```
BOT_TOKEN=<bot-token>
NODE_ENV=DEVELOPMENT
```

Setelah itu, jalankan script `dev`-nya:

```sh
npm run dev
```

Nodemon akan memantau file `bot.ts` dan memulai ulang bot ketika terjadi perubahan kode.

## Men-deploy

1. Buat sebuah repositori di GitHub, bisa berupa privat ataupun publik.
2. Push kodenya.

> Disarankan memiliki branch utama untuk produksi dan branch terpisah untuk melakukan pengetesan agar tidak terjadi hal-hal yang tidak diinginkan di tahap produksi.

3. Kunjungi [dashboard Cyclic](https://app.cyclic.sh).
4. Klik "Link Your Own" lalu pilih repositorinya.
5. Pergi ke Advanced > Variables, kemudian tambahkan `BOT_TOKEN`-nya.
6. Deploy bot dengan "Connect Cyclic".

### Mengatur URL Webhook

Jika kamu menggunakan webhooks, tepat setelah melakukan deployment, kamu perlu mengarahkan webhook bot ke app yang barusan kamu deploy.
Untuk melakukannya, kirim request ke

```text
https://api.telegram.org/bot<token>/setWebhook?url=<url>/<token>
```

Ganti `<token>` dengan token bot serta `<url>` dengan URL app kamu lengkap beserta path penanganan webhook-nya.

Selamat!
Bot kamu sekarang siap untuk digunakan.
