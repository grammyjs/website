---
prev: ./scaling.md
next: ./flood.md
---

# Peningkatan III: Reliabilitas

Sebelum memulai, pastikan kamu sudah memasang [error handler](../guide/errors.md) yang sesuai dengan bot-mu.
Semua error yang kemungkinan besar bisa terjadi (pemanggilan API yang gagal, koneksi yang tidak tersambung, query database yang gagal dilakukan, middleware yang tidak berjalan dengan baik, dsb) harus bisa ditangkap dan ditangani dengan baik.

Kamu juga sebaiknya menggunakan `await` di setiap promise.
Jika masih bersikeras untuk tidak menggunakan `await`, setidaknya pasang `catch` sebagai gantinya.
Pakai _linting rule_ supaya kamu tidak lupa menggunakannya.

## Graceful shutdown

Ada satu hal yang harus diperhatikan khusus untuk bot-bot yang menggunakan long polling.
Sebelum mematikan bot atau instance yang sedang berjalan, kamu sebaiknya menangkap event `SIGTERM` dan `SIGINT` terlebih dahulu, kemudian panggil `bot.stop` (built-in di long polling) atau hentikan bot menggunakan [handle](/ref/runner/RunnerHandle.md#stop) (grammY runner)

### Long Polling Sederhana

<CodeGroup>

<CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";

const bot = new Bot("<token>");

// Hentikan bot ketika proses Node.js akan dimatikan
process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

await bot.start();
```

</CodeGroupItem>

<CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");

const bot = new Bot("<token>");

// Hentikan bot ketika proses Node.js akan dimatikan
process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

await bot.start();
```

</CodeGroupItem>

<CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot("<token>");

// Hentikan bot ketika proses Deno akan dimatikan
Deno.addSignalListener("SIGINT", () => bot.stop());
Deno.addSignalListener("SIGTERM", () => bot.stop());

await bot.start();
```

</CodeGroupItem>
</CodeGroup>

### Menggunakan grammY Runner

<CodeGroup>

<CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";
import { run } from "@grammyjs/runner";

const bot = new Bot("<token>");

const runner = run(bot);

// Hentikan bot ketika proses Node.js akan dimatikan
const stopRunner = () => runner.isRunning() && runner.stop();
process.once("SIGINT", stopRunner);
process.once("SIGTERM", stopRunner);
```

</CodeGroupItem>

<CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");
const { run } = require("@grammyjs/runner");

const bot = new Bot("<token>");

const runner = run(bot);

// Hentikan bot ketika proses Node.js akan dimatikan
const stopRunner = () => runner.isRunning() && runner.stop();
process.once("SIGINT", stopRunner);
process.once("SIGTERM", stopRunner);
```

</CodeGroupItem>
<CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { run } from "https://deno.land/x/grammy_runner/mod.ts";

const bot = new Bot("<token>");

const runner = run(bot);

// Hentikan bot ketika proses Deno akan dimatikan
const stopRunner = () => runner.isRunning() && runner.stop();
Deno.addSignalListener("SIGINT", stopRunner);
Deno.addSignalListener("SIGTERM", stopRunner);
```

</CodeGroupItem>
</CodeGroup>

Itulah tips-tips untuk menjaga reliabilitas bot kamu. Jika diterapkan dengan benar, seharusnya tidak akan terjadi crash lagi di bot kamu.

## Menjamin Reliabilitas

Bagaimana jika suatu saat bot kamu sedang menangani transaksi pembayaran, lalu kamu dihadapkan [skenario `kill-9`](https://stackoverflow.com/questions/43724467/what-is-the-difference-between-kill-and-kill-9) karena CPU tiba-tiba terbakar atau terjadi pemadaman listrik secara tiba-tiba.
Masalah akan menjadi sedikit rumit ketika dihadapkan dengan kondisi yang mengharuskan proses bot dihentikan secara paksa di saat itu juga.

Akibatnya, bot tidak bisa menjamin eksekusi middleware kamu dijalankan tepat satu kali. Simak [diskusi di GitHub ini](https://github.com/tdlib/telegram-bot-api/issues/126) untuk mengetahui **kenapa** bot kamu mengirim pesan duplikat (atau bahkan tidak mengirim pesan sama kali) di suatu kondisi tertentu.
Di materi ini kita akan memahami **bagaimana** grammY bertindak di kondisi yang tidak biasa tersebut, serta bagaimana kita bisa mengatasinya dengan baik.

> Apakah kamu cuma tertarik untuk membuat bot Telegram? Silahkan [lewati sisa halaman ini.](./flood.md)

### Webhook

Kalau kamu menjalankan bot menggunakan webhook, server API Bot akan terus mengirim ulang update ke bot kamu ketika ia tidak menerima respon `OK`.
Itulah kenapa bot kamu akan mengirim pesan duplikat ketika ia dijalankan kembali dari proses penghentian yang tidak wajar.
Kalau kamu ingin mencegah hal tersebut terjadi, kamu harus membuat pencegah duplikasimu sendiri berdasarkan `update_id` karena grammY belum menyediakan fitur tersebut.
Tetapi, jika kamu merasa seseorang akan terbantu dengan pencegah duplikasi buatanmu, silahkan kirim pull request ke repositori kami.

### Long Polling

Long polling lebih menarik lagi.
Polling bawaan pada dasarnya memproses kembali _batch_ update terbaru yang sebelumnya gagal diproses.

> Perlu diingat bahwa jika kamu menghentikan bot menggunakan `bot.stop`, [offset dari update](https://core.telegram.org/bots/api#getupdates) tersebut akan disinkronkan dengan server Telegram dengan cara memanggil `getUpdates` beserta offset yang benar, namun data update-nya tidak diproses kembali.

Dengan kata lain, kamu tidak akan kehilangan update sama sekali, tetapi besar kemungkinan bot kamu akan memproses 100 update yang sudah diproses sebelumnya.
Karena pemanggilan `sendMessage` dilakukan sama persis, maka user akan menerima pesan duplikat dari bot kamu.
Tetapi, dengan cara demikian _setidaknya satu_ pemrosesan bisa terjamin.

### grammY Runner

Kalau kamu menggunakan [grammY runner](../plugins/runner.md) di mode _concurrent_, pemanggilan `getUpdates` berikutnya berpotensi dilakukan sebelum middleware kamu selesai memproses update pertama dari _batch_ tersebut.
Itulah kenapa, [update offset](https://core.telegram.org/bots/api#getupdates)-nya terkonfirmasi sebelum waktunya.
Ini adalah efek dari penggunaan concurrency secara maksimal, dan sayangnya, kita tidak bisa menghindarinya tanpa mengurangi responsifitas dan jumlah output-nya.
Dampaknya, jika bot kamu dihentikan di momen yang tidak tepat, 100 update yang sebelumnya sudah diminta tetapi belum diproses, tidak bisa diminta lagi karena Telegram telah menandainya sebagai sudah diproses.
Sehingga, data-data update tadi akan hilang selamanya.

Untuk menghindari hal tersebut terjadi, kamu harus menggunakan _source_ dan _sink_ dari package grammy runner untuk membuat jalur update-mu sendiri yang meneruskan semua update ke antrian pesan atau queue terlebih dahulu.

1. Buat sebuah [sink](/ref/runner/UpdateSink.md)
   sebagai jalur untuk meneruskan update ke queue, lalu mulai satu runner yang bertugas menyuplai pesan-pesan tersebut ke queue.
2. Kemudian, buat sebuah [source](/ref/runner/UpdateSource.md) untuk mengambil pesan dari queue.

Dengan begitu, kamu menjalankan dua instance grammY runner yang berbeda.
Konsep tadi adalah sebuah ide berdasarkan pengetahuan yang kami punya, tetapi ide tersebut belum pernah diterapkan.
Silahkan [hubungi grup Telegram kami](https://t.me/grammyjs) kalau kamu mempunyai beberapa pertanyaan atau bahkan kamu berhasil melakukannya dan ingin membagikannya ke kami.

Di sisi lain, kalau bot kamu sedang mengalami beban tinggi yang mengakibatkan polling update menjadi terlambat karena [pembatasan beban yang dilakukan secara otomatis](../plugins/runner.md#sink), maka kemungkinan besar beberapa update akan di-fetch lagi, yang mengakibatkan pemrosesan pesan duplikat.
Oleh karena itu, efek yang dihasilkan dari penggunaan concurency secara penuh adalah tidak ada yang bisa menjamin pemrosesan dilakukan baik _setidaknya sekali_ ataupun _paling banyak sekali_.
