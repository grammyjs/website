# Menggunakan Console Log untuk Men-debug

Jika kamu sudah terbiasa dengan JavaScript/TypeScript, kemungkinan besar kamu sering menggunakan [`console.log`](https://developer.mozilla.org/en-US/docs/Web/API/Console/log) atau [`console.time`](https://developer.mozilla.org/en-US/docs/Web/API/Console/time) untuk men-debug suatu program.
Ketika bekerja dengan sebuah bot atau middleware, kamu mungkin juga perlu untuk melakukan hal yang serupa: Apa yang sebenarnya terjadi, dan berapa lama waktu yang dibutuhkan?

Plugin ini bertujuan untuk men-debug satu permasalahan khusus.
Saat berada di mode produksi, kamu mungkin ingin melakukan hal yang sebaliknya, yaitu mendapatkan gambaran permasalahan secara umum, bukan satu permasalahan saja.
Contohnya: Ketika men-debug `/start` yang tidak berjalan dengan baik, kamu akan melakukan pengecekan di update Telegram tersebut saja.
Sedangkan saat di mode produksi, kamu ingin mengecek semua pesan `/start` yang terjadi.
Library ini dimaksudkan untuk mengecek satu update tertentu saja.

## Men-debug Implementasianmu

```ts
import { generateUpdateMiddleware } from "telegraf-middleware-console-time";

if (process.env.NODE_ENV !== "production") {
  bot.use(generateUpdateMiddleware());
}

// Implementasimu
bot.command("start" /* , ... */);
```

Hasilnya akan mirip seperti ini:

```plaintext
2020-03-31T14:32:36.974Z 490af message text Edgar 6 /start: 926.247ms
2020-03-31T14:32:57.750Z 490ag message text Edgar 6 /start: 914.764ms
2020-03-31T14:33:01.188Z 490ah message text Edgar 5 /stop: 302.666ms
2020-03-31T14:46:11.385Z 490ai message text Edgar 6 /start: 892.452ms
```

`490af` adalah `update_id`-nya.

Angka sebelum command adalah jumlah panjang dari konten tersebut.
Ini berguna untuk menghitung panjang maksimal untuk hal-hal seperti data callback.

Kontennya sendiri dibuat singkat untuk menghindari spam di log.

## Men-debug Middleware-mu

Ketika membuat middleware-mu sendiri atau menduga middleware lain berjalan lambat, kamu bisa menggunakan middleware-midleware tersebut untuk melakukan pencatatan waktu.

```ts
import {
  generateAfterMiddleware,
  generateBeforeMiddleware,
} from "telegraf-middleware-console-time";

const bot = new Bot(""); // <-- put your bot token between the ""

// Gunakan BeforeMiddleware sebelum memuat middleware yang akan dites.
bot.use(generateBeforeMiddleware("foo"));

// Middleware yang akan dites
bot.use(); /* ... */

// Gunakan AfterMiddleware setelah middleware yang dites berhasil dimuat (dengan label yang sama).
bot.use(generateAfterMiddleware("foo"));

// Middleware atau implementasi lainnya (Mereka akan tercatat sebagai waktu "inner" ketika digunakan).
bot.use(); /* ... */
bot.on("message" /* ... */);
```

Hasilnya kurang lebih seperti ini:

```plaintext
490ai foo before: 304.185ms
490ai foo inner: 83.122ms
490ai foo after: 501.028ms
490ai foo total: 891.849ms
```

Hal ini mengindikasikan bahwa middleware yang dites tersebut berjalan selama 800 milidetik, yang mana tidak bekerja dengan baik seperti seharusnya.

## Ringkasan Plugin

- Sumber: <https://github.com/EdJoPaTo/telegraf-middleware-console-time>
