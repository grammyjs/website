---
prev: ./structuring.md
next: ./reliability.md
---

# Peningkatan II: Beban Kerja Tinggi

Langkah-langkah untuk mengatasi bot yang bekerja dengan beban yang tinggi tergantung dari jenis deployment yang dipakai: [long polling atau webhook](../guide/deployment-types.md).
Terlepas dari kedua jenis yang dipilih, kamu sebaiknya membaca beberapa jebakan [di bawah](#concurrency-itu-sulit) agar tidak menyesal di kemudian hari.

## Long Polling

Bot pada umumnya tidak perlu memproses banyak pesan per menit selama terjadi lonjakan beban.
Dengan kata lain, skalabilitas bukanlah suatu masalah yang perlu diperhatikan.
Namun, supaya bisa terukur dengan baik, grammY memproses update secara berurutan.
Berikut operasi-operasi yang dilakukan:

1. Ambil 100 update melalui `getUpdates` ([Referensi API Bot Telegram](https://core.telegram.org/bots/api#getupdates))
2. Untuk setiap update, `await` atau tunggu _middleware stack_ selesai memprosesnya

Karena update diproses berurutan, bot kamu menjadi tidak efisien kalau pesan yang diproses hanya sekitar satu pesan per detik, apalagi saat terjadi lonjakan beban.
Contohnya, pesan Budi harus menunggu hingga pesan Ani selesai diproses.

Masalah ini bisa teratasi dengan cara memproses kedua pesan secara bersamaan, sehingga Budi tidak perlu menunggu pesan Ani selesai diproses.
Supaya memperoleh efisiensi yang maksimal, kita juga akan mengambil pesan baru selagi pesan Budi dan Ani masih diproses.
Idealnya, kita juga akan membatasi jumlah _concurrency_ supaya tidak membebani server secara berlebihan.

Pemrosesan _concurrent_ tidak tersedia secara bawaan di pemasangan grammY.
Sebagai gantinya, kamu bisa **menggunakan package [grammY runner](../plugins/runner.md)**.
Package ini mendukung semua pemrosesan yang telah disebutkan di atas, bahkan penggunaanya pun juga simpel.

```ts
// Sebelumnya
bot.start();

// Setelah menggunakan grammY runner, yang mana meng-export `run`.
run(bot);
```

Batas concurrency bawaan sebanyak 500.
Kalau kamu ingin mempelajari lebih jauh mengenai plugin ini, lihat [halaman berikut](../plugins/runner.md).

Concurrency memanglah sulit, oleh karena itu baca [materi di bawah](#concurrency-itu-sulit) untuk mengetahui apa yang harus diperhatikan ketika menggunakan grammY runner.

## Webhook

Kalau kamu menjalankan bot menggunakan webhook, ia akan secara otomatis memproses update secara bersamaan (tidak perlu memasang plugin).
Supaya bot bisa bekerja dengan baik saat terjadi lonjakan beban, kamu harus benar-benar paham [dalam menggunakan webhook](../guide/deployment-types.md#bagaimana-cara-menggunakan-webhook).
Kamu juga perlu tahu beberapa konsekuensi yang ditimbulkan ketika menggunakan concurrency, lihat [materi di bawah](#concurrency-itu-sulit).

[Perlu diingat](../guide/deployment-types.md#mengakhiri-request-webhook-tepat-waktu) juga bahwa Telegram akan mengirim update dari chat yang sama secara berurutan, sedangkan update dari chat yang berbeda akan dikirim secara bersamaan.

## Concurrency Itu Sulit

Beberapa masalah akan timbul jika bot kamu memproses semua update secara bersamaan.
Contohnya, saat dua pesan dari chat yang sama diterima oleh pemanggilan `getUpdates` yang sama pula, maka kedua pesan ini akan diproses secara bersamaan.
Sehingga, kita tidak dapat memastikan urutan pesan tersebut sudah teracak atau tidak.

Titik utama dimana kedua pesan dapat bertabrakan adalah disaat kamu menggunakan [session](../plugins/session.md), yang mana terjadinya [write-after-read hazard](https://en.wikipedia.org/wiki/Hazard_(computer_architecture)#Write_after_read_(WAR)) sangat mungkin terjadi.
Bayangkan kejadian berikut:

1. Ani mengirim pesan A.
2. Bot mulai memproses A.
3. Bot membaca data session milik Ani dari database.
4. Ani mengirim pesan B.
5. Bot mulai memproses B.
6. Bot membaca data session milik Ani dari database.
7. Bot selesai memproses A, lalu menulis session baru ke database.
8. Bot selesai memproses B, lalu menulis session baru ke database, yang mana menulis ulang perubahan yang dilakukan saat memproses A.
   Data A hilang karena _WAR hazard!_

> Catatan: Kamu bisa menggunakan _database transaction_ untuk session kamu. Tetapi, dengan cara tersebut, ia hanya mampu mendeteksi terjadinya hazard, bukan mencegahnya dari awal.
> Oleh karena itu, lebih baik kamu menggunakan _lock_ agar concurrency terhenti sepenuhnya, sehingga potensi terjadinya hazard juga bisa diminimalisir.

Kebanyakan sistem session di web framework lain mengabaikan _race condition_ ini, karena hal seperti itu jarang terjadi di web.
Berbeda dengan bot telegram, kondisi seperti itu akan sering terjadi karena request dengan session key yang sama akan diproses secara bersamaan.
Oleh karena itu, kita mesti memastikan update yang menggunakan data session yang sama harus diproses secara berurutan untuk menghindari bahaya race condition.

_grammY runner_ sudah dilengkapi dengan middleware `sequentialize()` yang fungsinya memastikan update yang berpotensi bertabrakan diproses secara berurutan.
Kamu bisa mengaturnya di function yang sama yang kamu gunakan untuk menentukan session key.
Dengan begitu, race condition bisa dihindarkan dengan cara memperlambat update tersebut agar tidak bertabrakan satu sama lain.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context, session } from "grammy";
import { run, sequentialize } from "@grammyjs/runner";

// Buat sebuah bot.
const bot = new Bot("");

// Buat id unik untuk object `Context`.
function getSessionKey(ctx: Context) {
  return ctx.chat?.id.toString();
}

// Urutkan terlebih dahulu sebelum mengakses session data!
bot.use(sequentialize(getSessionKey));
bot.use(session({ getSessionKey }));

// Pasang middleware seperti biasa,
// sekarang session sudah aman.
bot.on("message", (ctx) => ctx.reply("Pesan diterima."));

// Tetap dijalankan secara bersamaan!
run(bot);
```

</CodeGroupItem>

<CodeGroupItem title="JavaScript">

```ts
const { Bot, Context, session } = require("grammy");
const { run, sequentialize } = require("@grammyjs/runner");

// Buat sebuah bot.
const bot = new Bot("");

// Buat id unik untuk object `Context`.
function getSessionKey(ctx) {
  return ctx.chat?.id.toString();
}

// Urutkan terlebih dahulu sebelum mengakses session data!
bot.use(sequentialize(getSessionKey));
bot.use(session({ getSessionKey }));

// Pasang middleware seperti biasa,
// sekarang session sudah aman.
bot.on("message", (ctx) => ctx.reply("Pesan diterima."));

// Tetap dijalankan secara bersamaan!
run(bot);
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot, Context, session } from "https://deno.land/x/grammy/mod.ts";
import { run, sequentialize } from "https://deno.land/x/grammy_runner/mod.ts";

// Buat sebuah bot.
const bot = new Bot("");

// Buat id unik untuk object `Context`.
function getSessionKey(ctx: Context) {
  return ctx.chat?.id.toString();
}

// Urutkan terlebih dahulu sebelum mengakses session data!
bot.use(sequentialize(getSessionKey));
bot.use(session({ getSessionKey }));

// Pasang middleware seperti biasa,
// sekarang session sudah aman.
bot.on("message", (ctx) => ctx.reply("Pesan diterima."));

// Tetap dijalankan secara bersamaan!
run(bot);
```

</CodeGroupItem>
</CodeGroup>

Silahkan bergabung ke [chat Telegram grammY](https://t.me/grammyjs) untuk mendiskusikan cara menggunakan grammY runner di bot kamu.
Kami selalu menantikan cerita dari orang-orang yang pernah mengelola bot-bot besar agar kami bisa meningkatkan grammY berdasarkan pengalaman mereka menggunakan package ini.
