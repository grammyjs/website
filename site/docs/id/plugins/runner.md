# Concurrency Menggunakan grammY runner (`runner`)

<TagGroup><Tag type="official" text="RESMI"/></TagGroup>

Plugin ini dapat digunakan untuk memproses berbagai pesan secara bersamaan ketika bot dijalankan [menggunakan long polling](../guide/deployment-types.md).

> Sebelum menggunakan grammY runner, pastikan kamu paham betul materi [Peningkatan II](../advanced/scaling.md#long-polling).

## Kenapa Kita Perlu Runner

Di saat kamu meng-hosting bot menggunakan long polling lalu kamu ingin melakukan scale up dengan cara mengubah pemrosesan update dari yang sebelumnya berurutan menjadi bersamaan, maka ada beberapa tantangan yang akan dihadapi oleh bot kamu:

- Apakah nantinya akan terjadi race condition?
- Masih bisakah kita menggunakan `await` untuk middleware stack? Kita memerlukannya untuk menangani error!
- Bagaimana jika middleware tidak dapat menyelesaikan tugasnya, apakah ia akan menghalangi tugas bot yang lain?
- Masih bisakah kita mengendalikan beban server?

Seperti yang kamu lihat, kita perlu sebuah solusi untuk menyelesaikan permasalahan di atas agar long polling pada bot dapat berjalan dengan baik.
Masalah ini sangat berbeda dibandingkan dengan menyusun sebuah middleware ataupun mengirim pesan ke Telegram.
Karena alasan tersebut, package inti grammY tidak dapat menyelesaikannya.
Sebagai gantinya, kamu bisa menggunakan [grammY runner](https://github.com/grammyjs/runner).
Ia juga memiliki [Referensi API](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts)-nya sendiri.

## Cara Penggunaan

Berikut contoh sederhananya:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";
import { run } from "@grammyjs/runner";

// Buat sebuah bot.
const bot = new Bot("<token>");

// Tambahkan middleware seperti biasanya.
bot.on("message", (ctx) => ctx.reply("Pesan diterima!"));

// Jalankan secara bersamaan!
run(bot);
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```ts
const { Bot } = require("grammy");
const { run } = require("@grammyjs/runner");

// Buat sebuah bot.
const bot = new Bot("<token>");

// Tambahkan middleware seperti biasanya.
bot.on("message", (ctx) => ctx.reply("Pesan diterima!"));

// Jalankan secara bersamaan!
run(bot);
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { run } from "https://deno.land/x/grammy_runner/mod.ts";

// Buat sebuah bot.
const bot = new Bot("<token>");

// Tambahkan middleware seperti biasanya.
bot.on("message", (ctx) => ctx.reply("Pesan diterima!"));

// Jalankan secara bersamaan!
run(bot);
```

</CodeGroupItem>
</CodeGroup>

Tentu saja, meskipun terlihat sangat sederhana, sebenarnya banyak pemrosesan yang terjadi di balik layar.

## Apa yang Sebenarnya Terjadi di Balik Layar

Setiap runner terdiri atas tiga bagian yang berbeda:

1. **Source** mengambil update dari Telegram.
2. **Sink** menyuplai update ke bot instance.
3. Komponen **runner** menghubungkan source dan sink, serta memungkinkan kamu untuk memulai dan menghentikan bot.

```asciiart:no-line-numbers
api.telegram.org <—> source <—> runner <—> sink <—> bot
```

### Source

grammY runner dilengkapi dengan satu source bawaan yang bisa beroperasi di berbagai `UpdateSupplier` ([API reference](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/UpdateSupplier)). Update supplier semacam itu sangat mudah dibuat dari bot instance.
Jika kamu ingin membuatnya, pastikan untuk mempelajari `createUpdateFetcher` ([referensi API](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/createUpdateFetcher)).

Source adalah sebuah async iterator untuk kumpulan update yang bisa diaktifkan ataupun dinonaktifkan.
Selain itu, kamu bisa melakukan `close` untuk memutuskan sambungan dari server Telegram.

### Sink

grammY runner dilengkapi dengan tiga kemungkinan implementasi sink, yaitu berurutan (sama seperti `bot.start()`), perkelompok atau batch (berguna untuk kompatibilitas dengan framework lain), dan bersamaan (yang digunakan oleh `run`).
Semuanya beroperasi di object `UpdateConsumer` ([Referensi API](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/UpdateConsumer)) yang bisa dibuat dengan mudah dari sebuah bot instance.
Jika kamu ingin membuatnya, pastikan untuk mempelajari `handleUpdate` di `Bot` instance grammY ([API reference](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/Bot#handleUpdate)).

Sink berisi sebuah queue ([referensi API](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/DecayingDeque)) untuk tiap-tiap update yang sedang diproses.
Update baru yang ditambahkan ke queue akan langsung ditangani oleh update consumer, lalu ia akan mengembalikan sebuah promise yang akan terselesaikan segera setelah kapasitas queque tersedia lagi.
Angka integral yang terselesaikan menentukan ruang kosong tersebut.
Pengaturan batas concurrency untuk grammY runner akan dipatuhi melalui queue instance yang bersangkutan.

Queue juga membuang update yang membutuhkan waktu pemrosesan yang terlalu lama, untuk itu kamu bisa menentukan sebuah `timeoutHandler` ketika membuat sink yang bersangkutan.
Tentu saja, kamu sebaiknya juga menyediakan sebuah error handler ketika membuat sebuah sink.

Kalau kamu menggunakan `run(bot)`, maka error handler dari `bot.catch` akan digunakan.

### Runner

Runner adalah sebuah loop biasa yang mengambil update dari source lalu menyuplainya ke sink.
Ketika ruang kosong sink tersedia lagi, runner akan mengambil batch update selanjutnya dari source.

Ketika kamu membuat sebuah runner menggunakan `createRunner` ([referensi API](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/createRunner)), kamu akan memperoleh sebuah handle yang bisa digunakan untuk mengontrol runner tersebut.
Misalnya, kamu bisa memulai dan menghentikan runner, atau memperoleh sebuah promise yang akan terselesaikan jika runner dihentikan.
Selain itu, handle ini juga dikembalikan oleh `run`, lihat [Referensi API](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/RunnerHandle) `RunnerHandle`.

## Pemrosesan Secara Berurutan jika Diperlukan

Kemungkinan besar, kamu ingin memastikan pesan yang berasal dari chat yang sama diproses secara berurutan agar urutan pesan tidak berubah ketika [session middleware](./session.md) dipasang.

grammY runner meng-export `sequentialize` middleware yang akan menyelesaikan masalah tersebut.
Kamu bisa membaca [materi ini](../advanced/scaling.md#concurrency-itu-sulit) untuk mempelajari cara penggunaannya.

Sekarang kita akan mempelajari lebih dalam penggunaan plugin ini.

Constraint function yang disuplai tidak hanya bisa digunakan untuk menentukan chat identifier ataupun user identifier.
Sebaliknya, kamu bisa mengembalikan _daftar string dari constraint identifier_ yang akan menentukan perhitungan lain apa yang harus ditunggu sebelum pemrosesan dapat dimulai untuk setiap update-nya.

Contohnya, kamu bisa mengembalikan chat identifier dan user identifier penulis pesan.

```ts
bot.use(sequentialize((ctx) => {
  const chat = ctx.chat?.id.toString();
  const user = ctx.from?.id.toString();
  return [chat, user].filter((con) => con !== undefined);
}));
```

Ini akan memastikan pesan yang berasal dari chat yang sama akan diproses dengan urutan yang tepat.
Misalnya, jika Budi mengirim pesan di dalam sebuah grup, lalu mengirim sebuah pesan ke bot kamu di chat pribadi, maka kedua pesan tersebut akan diurutkan dengan benar.

Dengan demikian, kamu bisa menentukan grafik dependensi dari masing-masing update.
grammY runner akan menyelesaikan semua constraint yang dibutuhkan dan menahan update-update tersebut selama itu diperlukan untuk memastikan urutan pesan tepat.

Implementasi ini sangat efisien.
Ia membutuhkan memory yang konstan (kecuali kamu menggunakan concurrency tidak terbatas) dan memerlukan waktu pemrosesan yang konstant (amortized) untuk setiap update.

## Graceful Shutdown

Agar bot menyelesaikan tugasnya dengan benar, kamu [harus memberi sinyal berhenti](../advanced/reliability.md#menggunakan-grammy-runner) ke bot ketika proses hendak dimatikan.

## Ringkasan Plugin

- Nama: `runner`
- Sumber: <https://github.com/grammyjs/runner>
- Referensi: <https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts>
