---
prev: false
next: false
---

# Concurrency Menggunakan grammY runner (`runner`)

Plugin ini dapat digunakan untuk memproses berbagai pesan secara bersamaan ketika bot dijalankan [menggunakan long polling](../guide/deployment-types).

> Sebelum menggunakan grammY runner, pastikan kamu paham betul materi [Peningkatan II](../advanced/scaling#long-polling).

## Kenapa Kita Perlu Runner

Di saat kamu meng-hosting bot menggunakan long polling lalu kamu ingin melakukan scale up dengan cara mengubah pemrosesan update dari yang sebelumnya berurutan menjadi bersamaan, maka ada beberapa tantangan yang akan dihadapi oleh bot kamu:

- Apakah nantinya akan terjadi race condition?
- Masih bisakah kita menggunakan `await` untuk middleware stack? Kita memerlukannya untuk menangani error!
- Bagaimana jika middleware tidak dapat menyelesaikan tugasnya, apakah ia akan menghalangi tugas bot yang lain?
- Bisakah kita memproses beberapa update tertentu secara berurutan?
- Mampukah kita mengendalikan beban server?
- Bisakah kita memproses update di beberapa core (CPU) yang berbeda?

Seperti yang kamu lihat, kita perlu sebuah solusi untuk menyelesaikan permasalahan di atas agar long polling pada bot dapat berjalan dengan baik.
Masalah ini sangat berbeda dibandingkan dengan menyusun sebuah middleware ataupun mengirim pesan ke Telegram.
Karena alasan tersebut, package inti grammY tidak dapat menyelesaikannya.
Sebagai gantinya, kamu bisa menggunakan [grammY runner](https://github.com/grammyjs/runner).
Ia juga memiliki [Referensi API](/ref/runner/-nya sendiri).

## Cara Penggunaan

Berikut contoh sederhananya:

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { run } from "@grammyjs/runner";

// Buat sebuah bot.
const bot = new Bot("");

// Tambahkan middleware seperti biasanya.
bot.on("message", (ctx) => ctx.reply("Pesan diterima!"));

// Jalankan secara bersamaan!
run(bot);
```

```js [JavaScript]
const { Bot } = require("grammy");
const { run } = require("@grammyjs/runner");

// Buat sebuah bot.
const bot = new Bot("");

// Tambahkan middleware seperti biasanya.
bot.on("message", (ctx) => ctx.reply("Pesan diterima!"));

// Jalankan secara bersamaan!
run(bot);
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { run } from "https://deno.land/x/grammy_runner/mod.ts";

// Buat sebuah bot.
const bot = new Bot("");

// Tambahkan middleware seperti biasanya.
bot.on("message", (ctx) => ctx.reply("Pesan diterima!"));

// Jalankan secara bersamaan!
run(bot);
```

:::

## Pemrosesan Secara Berurutan ketika Diperlukan

Kemungkinan besar, kamu ingin memastikan pesan yang berasal dari chat yang sama diproses secara berurutan agar urutan pesannya tidak berubah ketika [session middleware](./session) dipasang.

grammY runner bisa mengatasinya dengan cara meng-export middleware `sequentialize`.
Kamu bisa mempelajari cara penggunaannya di [materi berikut](../advanced/scaling#concurrency-itu-sulit).

Sekarang kita akan mempelajari lebih dalam penggunaan plugin ini.

Function constraint tidak hanya digunakan untuk menentukan identifikasi chat atau user, tetapi juga mengembalikan _daftar string identifikasi constraint_ yang akan menentukan komputasi apa yang harus ditunggu sebelum pemrosesan dapat dimulai untuk setiap update-nya.

Contohnya, kamu bisa mengembalikan identifikasi chat serta penulis pesan tersebut dengan cara berikut:

```ts
bot.use(
  sequentialize((ctx) => {
    const chat = ctx.chat?.id.toString();
    const user = ctx.from?.id.toString();
    return [chat, user].filter((con) => con !== undefined);
  }),
);
```

Ini akan memastikan pesan yang berasal dari chat yang sama akan diproses dengan urutan yang tepat.
Misalnya, jika Budi mengirim pesan di dalam sebuah grup, lalu mengirim sebuah pesan ke bot kamu di chat pribadi, maka kedua pesan tersebut akan diurutkan dengan benar.

Dengan demikian, kamu bisa menentukan keterkaitan antar-update.
grammY runner akan menangani semua constraint yang dibutuhkan serta menahan update jika memang diperlukan untuk memastikan urutan pesannya sesuai.

Implementasi ini sangatlah efisien.
Ia menggunakan memory secara konstan---selama kamu menentukan batas concurrency---dan memerlukan waktu pemrosesan yang---secara rata-rata---konstan pula untuk setiap update-nya.

## Graceful Shutdown

Agar bot menyelesaikan tugasnya dengan benar, kamu [harus memberi sinyal berhenti](../advanced/reliability#menggunakan-grammy-runner) ke bot ketika proses hendak dimatikan.

Kamu juga bisa menunggu runner berhenti dengan cara menunggu promise `task`---menggunakan `await`---di [`RunnerHandle`](/ref/runner/runnerhandle) yang dikembalikan dari `run`.

```ts
const handle = run(bot);

handle.task().then(() => {
  console.log("Bot selesai memproses!");
});
```

## Opsi Tingkat Lanjut

grammY runner terdiri atas tiga bagian: source, sink, dan runner.
Source untuk mengumpulkan update, sink untuk memproses update, sedangkan runner untuk mengatur dan menghubungkan kedua bagian tersebut.

> Pembahasan lebih mendalam mengenai cara kerja dari sebuah runner ada di [bagian bawah](#apa-yang-sebenarnya-terjadi-di-balik-layar).

Tiap-tiap bagian bisa diatur dengan berbagai cara.
Misalnya mengurangi beban jaringan, menentukan jenis update yang boleh diterima, dsb.

Untuk runner, setiap bagiannya bisa diatur melalui opsi yang telah disediakan dalam bentuk object.

```ts
run(bot, {
  source: {},
  runner: {},
  sink: {},
});
```

Silahkan lihat `RunOptions` di [referensi API](/ref/runner/runoptions) untuk melihat opsi apa saja yang tersedia.

Contohnya, berdasarkan dokumentasi tersebut, `allowed_updates` bisa diaktifkan menggunakan potongan kode berikut:

```ts
run(bot, { runner: { fetch: { allowed_updates: [] } } });
```

## Multithreading

> Multithreading tidak akan terlalu bermanfaat apabila bot kamu tidak menangani lebih dari 50 juta update per hari (>500 per detik).
> [Lewati bagian ini](#apa-yang-sebenarnya-terjadi-di-balik-layar) jika traffic bot jauh di bawah jumlah tersebut.

JavaScript adalah single-threaded.
Ini menakjubkan karena pada dasarnya [concurrency itu sulit](../advanced/scaling#concurrency-itu-sulit).
Karena dengan menggunakan satu core saja, secara tidak langsung berbagai permasalahan bisa dihindari.

Namun, jika bot kamu memiliki beban kerja yang sangat tinggi (katakanlah 1000 update lebih per detik), memproses semuanya menggunakan satu core tidaklah cukup.
Dengan kata lain, core yang cuma satu tersebut akan mengalami kesulitan untuk memproses semua pesan JSON yang diterima oleh bot kamu.

### Bot Workers untuk Menangani Update

Solusinya adalah bot workers!
grammY runner bisa membuat beberapa workers untuk memproses update secara bersamaan (paralel) di core yang berbeda---menggunakan event loop yang berbeda serta memory yang terpisah.

grammY runner menggunakan [Worker Threads](https://nodejs.org/api/worker_threads.html) di Node.js.
Sedangkan di Deno, ia menggunakan [Web Workers](https://docs.deno.com/runtime/manual/runtime/workers).

Secara konsep, grammY runner menyediakan sebuah class bernama `BotWorker` yang berfungsi untuk menangani update.
Ia serupa dengan class `Bot` biasa, malahan ia meng-`extends` class `Bot` itu sendiri.
Perbedaan utamanya adalah `BotWorker` tidak bisa mengambil update.
Sebaliknya, ia mengambil update dari `Bot` biasa yang mengontrol worker tersebut.

```asciiart:no-line-numbers
1. ambil update                                  Bot
                                              __// \\__
                                           __/  /   \  \__
2. kirim update ke workers              __/    /     \    \__
                                     __/      /       \      \__
                                    /        /         \        \
3. proses update            BotWorker   BotWorker   BotWorker   BotWorker
```

grammY runner menyediakan sebuah middleware untuk mengirim update ke bot workers.
Bot workers nantinya akan menerima dan menangani update tersebut.
Dengan begitu, bot utama cuma perlu mengambil dan mendistribusikan update ke semua bot worker yang ditanganinya.
Penanganan update yang sesungguhnya (mem-filter pesan, membalas pesan, dll) dilakukan oleh bot worker tersebut.

Mari kita lihat bagaimana cara menggunakannya.

### Menggunakan Bot Workers

> Contoh berikut tersedia di [repository grammY runner](https://github.com/grammyjs/runner/tree/main/examples).

Mari kita mulai dengan membuat sebuah instance bot utama untuk mengambil dan mendistribusikan update ke para workers.
Buat sebuah file bernama `bot.ts` yang berisi kode berikut:

::: code-group

```ts [TypeScript]
// bot.ts
import { Bot } from "grammy";
import { distribute, run } from "@grammyjs/runner";

// Buat bot-nya.
const bot = new Bot(""); // <-- taruh token bot kamu di antara tanda petik ("")

// Opsional, tangani update secara berurutan.
// bot.use(sequentialize(...))

// Distribusikan update ke bot workers.
bot.use(distribute(__dirname + "/worker"));

// Jalankan bot secara bersamaan (concurrent) menggunakan multi-threading.
run(bot);
```

```js [JavaScript]
// bot.js
const { Bot } = require("grammy");
const { distribute, run } = require("@grammyjs/runner");

// Buat bot-nya.
const bot = new Bot(""); // <-- taruh token bot kamu di antara tanda petik ("")

// Opsional, tangani update secara berurutan.
// bot.use(sequentialize(...))

// Distribusikan update ke bot workers.
bot.use(distribute(__dirname + "/worker"));

// Jalankan bot secara bersamaan (concurrent) menggunakan multi-threading.
run(bot);
```

```ts [Deno]
// bot.ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { distribute, run } from "https://deno.land/x/grammy_runner/mod.ts";

// Buat bot-nya.
const bot = new Bot(""); // <-- taruh token bot kamu di antara tanda petik ("")

// Opsional, tangani update secara berurutan.
// bot.use(sequentialize(...))

// Distribusikan update ke bot workers.
bot.use(distribute(__dirname + "/worker"));

// Jalankan bot secara bersamaan (concurrent) menggunakan multi-threading.
run(bot);
```

:::

Di direktori yang sama dengan `bot.ts`, buat file kedua dengan nama `worker.ts` (seperti yang tertera di baris ke-12 pada kode di atas).
Isinya adalah kode pemrosesan bot yang sesungguhnya.

::: code-group

```ts [TypeScript]
// worker.ts
import { BotWorker } from "@grammyjs/runner";

// Buat sebuah bot worker baru.
const bot = new BotWorker(""); // <-- Masukkan lagi token bot kamu di sini

// Tambahkan logika penanganan pesan.
bot.on("message", (ctx) => ctx.reply("Hore!"));
```

```js [JavaScript]
// worker.js
const { BotWorker } = require("@grammyjs/runner");

// Buat sebuah bot worker baru.
const bot = new BotWorker(""); // <-- Masukkan lagi token bot kamu di sini

// Tambahkan logika penanganan pesan.
bot.on("message", (ctx) => ctx.reply("Hore!"));
```

```ts [Deno]
// worker.ts
import { BotWorker } from "https://deno.land/x/grammy_runner/mod.ts";

// Buat sebuah bot worker baru.
const bot = new BotWorker(""); // <-- Masukkan lagi token bot kamu di sini

// Tambahkan logika penanganan pesan.
bot.on("message", (ctx) => ctx.reply("Hore!"));
```

:::

> Perlu dicatat bahwa setiap worker mampu mengirim pesan kembali ke Telegram.
> Oleh karena itu, kamu diharuskan memasukkan token bot ke setiap worker.

Kamu tidak perlu memulai bot worker-nya, atau meng-export sesuatu dari file tersebut.
Cukup buat sebuah instance `BotWorker`, kemudian ia akan menyimak update secara otomatis.

Penting untuk diketahui bahwa **hanya raw update**---update "mentah" atau asli dari Telegram yang sama sekali belum diproses---yang dikirim ke bot workers.
Dengan kata lain, [context object](../guide/context) dibuat dua kali untuk setiap update: sekali di `bot.ts` agar bisa didistribusikan ke bot worker terkait, dan sekali di `worker.ts` untuk diproses.
Selain itu, property yang berada di context object di `bot.ts` tidak akan dikirim ke bot worker.
Artinya, semua plugin harus dipasang di bot workers terkait.

::: tip Distribusikan Update Tertentu Saja
Untuk mengoptimalkan performa, kamu bisa mengabaikan update yang tidak ingin kamu tangani.
Dengan begitu, bot kamu tidak perlu mengirim update tersebut ke worker, yang pada akhirnya akan diabaikan juga.

::: code-group

```ts [Node.js]
// Bot kita hanya menangani pesan, edit, dan callback query.
// Oleh karena itu, kita bisa mengabaikan dan tidak mendistribusikan update yang lain.
bot.on(
  ["message", "edited_message", "callback_query"],
  distribute(__dirname + "/worker"),
);
```

```ts [Deno]
// Bot kita hanya menangani pesan, edit, dan callback query.
// Oleh karena itu, kita bisa mengabaikan dan tidak mendistribusikan update yang lain.
bot.on(
  ["message", "edited_message", "callback_query"],
  distribute(new URL("./worker.ts", import.meta.url)),
);
```

:::

Secara bawaan, `distribute` membuat 4 bot workers.
Kamu bisa mengatur jumlah tersebut dengan mudah.

```ts
// Distribusikan update ke 8 bot workers.
bot.use(distribute(workerFile, { count: 8 }));
```

Perlu diperhatikan bahwa aplikasi kamu seharusnya tidak membuat thread lebih dari jumlah core yang tersedia di CPU kamu.
Alih-alih meningkatkan, tindakan tersebut malah akan memperburuk performa bot.

## Apa yang Sebenarnya Terjadi di Balik Layar

Tentu saja, meski grammY runner terlihat sangat sederhana, sebenarnya banyak hal yang terjadi di balik layar.

Setiap runner terdiri atas tiga bagian yang berbeda:

1. **Source** mengambil update dari Telegram.
2. **Sink** menyuplai update ke bot instance.
3. Komponen **runner** menghubungkan source dan sink, serta memungkinkan kamu untuk memulai dan menghentikan bot.

```asciiart:no-line-numbers
api.telegram.org <—> source <—> runner <—> sink <—> bot
```

### Source

grammY runner dilengkapi dengan satu source bawaan yang bisa beroperasi di berbagai `UpdateSupplier` ([API reference](/ref/runner/updatesupplier)). Update supplier semacam itu sangat mudah dibuat dari bot instance.
Jika kamu ingin membuatnya, pastikan untuk mempelajari `createUpdateFetcher` ([referensi API](/ref/runner/createupdatefetcher)).

Source adalah sebuah async iterator untuk kumpulan update yang bisa diaktifkan ataupun dinonaktifkan.
Selain itu, kamu bisa melakukan `close` untuk memutuskan sambungan dari server Telegram.

### Sink

grammY runner dilengkapi dengan tiga kemungkinan implementasi sink, yaitu berurutan (sama seperti `bot.start()`), perkelompok atau batch (berguna untuk kompatibilitas dengan framework lain), dan bersamaan (yang digunakan oleh `run`).
Semuanya beroperasi di object `UpdateConsumer` ([Referensi API](/ref/runner/updateconsumer)) yang bisa dibuat dengan mudah dari sebuah bot instance.
Jika kamu ingin membuatnya, pastikan untuk mempelajari `handleUpdate` di `Bot` instance grammY ([API reference](/ref/core/bot#handleupdate)).

Sink berisi sebuah queue ([referensi API](/ref/runner/decayingdeque)) untuk tiap-tiap update yang sedang diproses.
Update baru yang ditambahkan ke queue akan langsung ditangani oleh update consumer, lalu ia akan mengembalikan sebuah promise yang akan terselesaikan segera setelah kapasitas queque tersedia lagi.
Angka integral yang terselesaikan menentukan ruang kosong tersebut.
Pengaturan batas concurrency untuk grammY runner akan dipatuhi melalui queue instance yang bersangkutan.

Queue juga membuang update yang membutuhkan waktu pemrosesan yang terlalu lama, untuk itu kamu bisa menentukan sebuah `timeoutHandler` ketika membuat sink yang bersangkutan.
Tentu saja, kamu sebaiknya juga menyediakan sebuah error handler ketika membuat sebuah sink.

Kalau kamu menggunakan `run(bot)`, maka error handler dari `bot.catch` akan digunakan.

### Runner

Runner adalah sebuah loop biasa yang mengambil update dari source lalu menyuplainya ke sink.
Ketika ruang kosong sink tersedia lagi, runner akan mengambil batch update selanjutnya dari source.

Ketika kamu membuat sebuah runner menggunakan `createRunner` ([referensi API](/ref/runner/createrunner)), kamu akan memperoleh sebuah handle yang bisa digunakan untuk mengontrol runner tersebut.
Misalnya, kamu bisa memulai dan menghentikan runner, atau memperoleh sebuah promise yang akan terselesaikan jika runner dihentikan.
Selain itu, handle ini juga dikembalikan oleh `run`, lihat [Referensi API](/ref/runner/runnerhandle) `RunnerHandle`.

### Function `run`

Ada beberapa hal yang dilakukan function `run` untuk membantu kamu menggunakan struktur di atas dengan mudah, diantaranya adalah:

1. Membuat sebuah penyuplai update dari bot kamu.
2. Membuat sebuah [source](#source) dari penyuplai update.
3. Membuat sebuah penerima update untuk bot kamu.
4. Membuat sebuah [sink](#sink) dari penerima update.
5. Membuat sebuah [runner](#runner) dari source dan sink.
6. Memulai runner.

Kemudian, ia akan mengembalikan (return) handle dari runner tersebut, yang mana bisa kamu gunakan untuk mengontrol runner-nya.

## Ringkasan Plugin

- Nama: `runner`
- [Sumber](https://github.com/grammyjs/runner)
- [Referensi](/ref/runner/)
