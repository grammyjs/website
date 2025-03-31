---
prev: false
next: false
---

# Hosting: Firebase Functions

Panduan ini akan membimbing kamu untuk men-deploy bot di [Firebase Functions](https://firebase.google.com/docs/functions).

## Persyaratan

Untuk mengikuti panduan ini, kamu perlu memiliki sebuah akun Google.
Kalau belum punya, kamu bisa membuatnya [di sini](https://accounts.google.com/signup).

## Persiapan

Pada bagian ini, kami akan memandu kamu melalui proses persiapan yang diperlukan.
Jika kamu memerlukan penjelasan yang lebih detail untuk setiap langkah-langkahnya, silahkan lihat [dokumentasi resmi Firebase](https://firebase.google.com/docs/functions/get-started).

### Membuat Proyek Firebase

1. Buka [Firebase console](https://console.firebase.google.com/) lalu klik **Add Project** untuk menambahkan project baru.
2. Setujui syarat dan ketentuan Firebase yang berlaku.
3. Klik **Continue** untuk melanjutkan.
4. Tentukan apakah kamu ingin menggunakan _analytic_ atau tidak.
5. Klik **Create Project** untuk membuat project baru.

### Menyiapkan Pengaturan

Untuk membuat sebuah function serta men-deploy-nya ke runtime Firebase Functions, kamu perlu menginstal Node.js dan Firebase CLI terlebih dahulu.

> Perlu diketahui bahwa Firebase Functions hanya mendukung Node.js versi 14, 16, dan 18.
> Untuk informasi lebih lanjut mengenai versi Node.js yang didukung, lihat [dokumentasi berikut](https://firebase.google.com/docs/functions/manage-functions#set_nodejs_version).

Sesudah Node.js dan npm terpasang, instal Firebase CLI secara global:

```sh
npm install -g firebase-tools
```

### Menyiapkan Proyek

1. Jalankan `firebase login` untuk mengautentikasi Firebase CLI dengan akun kamu melalui browser.
2. `cd` ke direktori proyek kamu.
3. Jalankan `firebase init functions`, lalu ketik `y` ketika diberi pertanyaan apakah kamu ingin membuat codebase baru.
4. Pilih `use existing project`, lalu pilih proyek yang telah kamu buat pada langkah 1.
5. CLI akan memberikan dua opsi dukungan bahasa pemrograman:
   - JavaScript
   - TypeScript
6. Opsional, pilih opsi ESLint.
7. CLI kemudian akan bertanya apakah kamu ingin menginstal dependency melalui npm.
   Tolak jika kamu menggunakan package manager lain, misalnya `yarn` atau `pnpm`.
   Konsekuensinya, kamu harus `cd` ke direktori `functions` lalu instal dependency secara manual.
8. Buka file `./functions/package.json` lalu cari key: `"engines": {"node": "16"}`.
   Versi `node` harus sesuai dengan versi Node.js yang terinstal.
   Jika tidak sesuai, proyekmu kemungkinan besar tidak akan bisa berjalan.

## Menyiapkan Kode

Kamu bisa menggunakan contoh bot singkat ini sebagai permulaan:

```ts
import * as functions from "firebase-functions";
import { Bot, webhookCallback } from "grammy";

const bot = new Bot(""); // <-- taruh token bot-mu di antara ""

bot.command(
  "start",
  (ctx) => ctx.reply("Selamat datang! Bot berhasil dijalankan."),
);
bot.command("ping", (ctx) => ctx.reply(`Pong! ${new Date()}`));

// Selama mengembangkan bot, kamu bisa men-trigger function kamu melalui https://localhost/<firebase-namaproyek>/us-central1/helloWorld
export const helloWorld = functions.https.onRequest(webhookCallback(bot));
```

## Pengembangan Lokal

Selama proses pengembangan, kamu bisa menggunakan emulator firebase untuk menjalankan kode secara lokal.
Cara ini jauh lebih cepat dibandingkan dengan men-deploy setiap perubahan ke Firebase.
Untuk menginstal emulator, jalankan perintah berikut:

```sh
firebase init emulators
```

Emulator functions seharusnya sudah terpilih.
Kalau belum, arahkan dengan menggunakan tombol panah, lalu tekan `space` untuk memilih.
Jika diberi pertanyaan mengenai port mana yang akan digunakan untuk setiap emulator, cukup tekan `enter`.

Untuk memulai emulator dan menjalankan kodenya, gunakan:

```sh
npm run serve
```

::: tip
Konfigurasi bawaan script npm tidak menjalankan compiler TypeScript dalam mode watch.
Oleh karena itu, jika menggunakan TypeScript, kamu juga perlu menjalankan:

```sh
npm run build:watch
```

:::

Setelah emulator dijalankan, semestinya kamu akan menemukan sebuah baris output di console yang kurang lebih terlihat seperti ini:

```sh
+  functions[us-central1-helloWorld]: http function initialized (http://127.0.0.1:5001/<firebase-namaproyek>/us-central1/helloWorld).
```

Itu adalah URL lokal untuk cloud function kamu.
Sayangnya, function tersebut hanya akan tersedia untuk localhost di komputer kamu saja.
Untuk menguji bot secara nyata, kamu perlu mengekspos function ke internet agar API Telegram bisa mengirim update ke bot-mu.
Ada beberapa penyedia layanan yang bisa kamu gunakan untuk melakukan hal tersebut, misalnya [localtunnel](https://localtunnel.me) atau [ngrok](https://ngrok.com).
Dalam kesempatan kali ini, kita akan menggunakan localtunnel.

Pertama-tama, instal localtunnel:

```sh
npm i -g localtunnel
```

Kemudian, forward port `5001`:

```sh
lt --port 5001
```

localtunnel kemudian akan memberimu sebuah URL unik mirip seperti ini: `https://modern-heads-sink-80-132-166-120.loca.lt`.

Terakhir, beri tahu Telegram alamat pengiriman update-nya.
Kamu bisa melakukannya dengan cara memanggil `setWebhook`.
Buka tab baru di browser, lalu kunjungi URL berikut:

```text
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=<WEBHOOK_URL>/<firebase-namaproyek>/us-central1/helloWorld
```

Ganti `<BOT_TOKEN>` dengan token bot kamu, dan `<WEBHOOK_URL>` dengan URL yang kamu dapatkan dari localtunnel.

Jika semuanya berjalan dengan baik, Telegram akan membalas dengan:

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

Bot kamu sekarang siap digunakan untuk proses pengembangan.

## Men-deploy

Untuk men-deploy function, cukup jalankan:

```sh
firebase deploy
```

Firecase CLI akan memberimu URL function-nya ketika proses deployment selesai dijalankan.
URL-nya kurang lebih terlihat seperti ini: `https://<REGION>.<MY_PROJECT>.cloudfunctions.net/helloWorld`.
Untuk penjelasan lebih lanjut, kamu bisa melihat langkah ke-8 di [panduan memulai berikut](https://firebase.google.com/docs/functions/get-started#deploy-functions-to-a-production-environment).

Setelah di-deploy, kamu perlu memberi tahu Telegram untuk mengirim update ke bot kamu dengan cara memanggil method `setWebhook`.
Buka sebuah tab browser baru, lalu kunjungi URL berikut:

```text
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<REGION>.<MY_PROJECT>.cloudfunctions.net/helloWorld
```

Ganti `<BOT_TOKEN>` dengan token bot-mu, `<REGION>` dengan nama region function kamu di-deploy, dan `<MY_PROJECT>` dengan nama proyek Firebase-mu.
Firebase CLI semestinya sudah menyediakan URL lengkap cloud function kamu, sehingga kamu cuma perlu menyalinnya lalu tempel tepat setelah paramater `?url=` di method `setWebhook`.

Jika semuanya berjalan lancar, kamu akan menerima respon berikut dari Telegram:

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

Selesai.
Bot kamu siap digunakan.
Buka Telegram dan lihat ia merespon pesan!
