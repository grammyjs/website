---
prev: ./middleware.md
next: ./inline-queries.md
---

# Menangani Error

Setiap error yang disebabkan oleh middleware akan ditangkap oleh grammY.
Kami menyarankan kamu untuk memasang _error handler_ khusus untuk menangani error yang terjadi.

Materi ini akan mengajarimu [cara menangkap error](#menangkap-error) yang dilempar.

Setelah itu, kita akan membahas tiga jenis error yang biasa ditemukan di bot:

| Nama                                | Keterangan                                                                                                                 |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [`BotError`](#object-boterror)       | Object error yang membungkus error apapun yang dilempar di middleware (contohnya, dua error di bawah).                     |
| [`GrammyError`](#object-grammyerror) | Dilempar ketika server API Bot mengembalikan `ok: false`, yang mengindikasikan bahwa permintaan API gagal dan tidak valid. |
| [`HttpError`](#object-httperror)     | Dilempar jika server API Bot tidak bisa dijangkau.                                                                         |

Mekanisme penanganan error tingkat lanjut bisa kamu temukan lebih banyak [di bawah sini](#error-boundary).

## Menangkap Error

Cara menangkap error bisa berbeda-beda tergantung dari jenis pemasangan botmu. Diantaranya:

### Long Polling

Kalau kamu menjalankan bot melalui `bot.start()` atau menggunakan [grammY runner](../plugins/runner.md), maka kamu bisa **memasang error handler melalui `bot.catch`**.

grammY memiliki error handler bawaan yang dapat menghentikan bot jika dijalankan melalui `bot.start()`, setelah itu ia akan melempar kembali error tersebut.
Langkah-langkah yang selanjutnya dilakukan setelah menerima error tersebut tergantung dari platform yang kamu gunakan.
Itulah kenapa **kamu sebaiknya memasang sebuah error handler melalui `bot.catch`** supaya bisa menangani sendiri error tersebut.

Contoh:

```ts
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error saat menangani update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error di request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Tidak bisa menghubungi Telegram:", e);
  } else {
    console.error("Error yang tidak diketahui:", e);
  }
});
```

### Webhooks

Kalau kamu menjalankan bot melalui webhooks, grammY akan meneruskan error ke framework web yang sedang kamu gunakan, misal `express`.
Selanjutnya, kamu harus menangani error sesuai dengan panduan dari framework tersebut.

## Object `BotError`

Object `BotError` mengemas error yang dilempar bersama dengan [object context](./context.md) terkait yang menjadi penyebab dari error tersebut.

grammY akan menangkap error yang terjadi saat memproses sebuah update.
Object context seringkali bermanfaat untuk bisa menemukan penyebab dari suatu error.

grammY sama sekali tidak mengotak-atik error yang dilempar, tetapi ia membungkusnya ke dalam sebuah instance `BotError`.
Mengingat tadi kamu memberi nama object-nya `err`, maka kamu bisa mengakses error aslinya melalui `err.error`.
Kamu bisa mengakses object context terkait melalui `err.ctx`.

Lihat class `BotError` di [Referensi API grammY](https://deno.land/x/grammy/mod.ts?s=BotError).

## Object `GrammyError`

Kalau sebuah method API seperti `sendMessage` mengalami kegagalan, grammY akan melempar sebuah error `GrammyError`.
Perlu dicatat bahwa instance `GrammyError` juga akan dibungkus di object `BotError` jika mereka dilempar dari dalam middleware.

Sebuah `GrammyError` yang dilempar mengindikasikan bahwa permintaan API terkait terjadi kegagalan.
Error ini menyediakan akses ke kode error yang dikembalikan oleh backend Telegram, termasuk juga deskripsi dari error tersebut.

Lihat class `GrammyError` di [Referensi API grammY](https://deno.land/x/grammy/mod.ts?s=GrammyError).

## Object `HttpError`

Sebuah `HttpError` dilempar jika terjadi kegagalan saat melakukan _network request_.
Artinya, grammY tidak bisa menghubungi server API Bot.
Object error ini berisi informasi mengenai alasan permintaan tersebut tidak dapat dilakukan, yang tersedia di property `error`.

Kamu akan jarang melihat error semacam ini, kecuali koneksi internet kamu memang tidak stabil, atau server API Bot tidak tersedia untuk sementara waktu.

> Perlu dicatat bahwa jika server API Bot bisa dihubungi, tetapi mengembalikan `ok: false` untuk pemanggilan method tertentu, justru [`GrammyError`](./errors.md#object-grammyerror) yang akan dilempar.

Lihat class `HttpError` di [Referensi API grammY](https://deno.land/x/grammy/mod.ts?s=HttpError).

## Error Boundary

> Ini adalah topik tingkat lanjut yang sering kali berguna untuk bot-bot besar.
> Kalau kamu masih baru mengenal grammY, sisa dari halaman ini boleh diabaikan.

Kalau kamu membagi code base menjadi beberapa bagian, _error boundary_ memungkinkan kamu memasang error handler yang berbeda untuk tiap bagian middleware.
Ini bisa dilakukan dengan cara memagari error di bagian middleware.
Dengan kata lain, kalau sebuah error dilempar dari bagian khusus middleware yang terproteksi, maka ia tidak bisa lepas keluar dari bagian sistem midleware tersebut.
Sebagai gantinya, error handler khusus dipanggil, dan bagian middleware lain di sekelilingnya akan menganggap proses berjalan baik-baik saja tanpa error.
Ini adalah fitur dari sistem middleware grammY.
Error boundary bisa bekerja baik di webhooks maupun long polling.

Selain itu, kamu bisa memilih untuk membiarkan eksekusi middleware _melanjutkan_ prosesnya secara normal setelah error sudah ditangani, dilanjutkan tepat diluar dari cakupan error boundary.
Dalam hal ini, middleware yang dipagari tidak hanya bertindak seolah-olah proses berjalan dengan baik, melainkan juga meneruskan control flow ke middleware selanjutnya yang dipasang setelah error boundary.
Bisa dibilang, middleware yang berada di dalam error boundary terlihat seolah-olah memanggil `next`.

```ts
const bot = new Bot("");

bot.use(/* A */);
bot.use(/* B */);

const composer = new Composer();
composer.use(/* X */);
composer.use(/* Y */);
composer.use(/* Z */);
bot.errorBoundary(boundaryHandler /* , Q */).use(composer);

bot.use(/* C */);
bot.use(/* D */);

bot.catch(errorHandler);

function boundaryHandler(err: BotError, next: NextFunction) {
  console.error("Error di Q, X, Y, atau Z!", err);
  /*
   * Kamu bisa memanggil `next` kalau ingin lanjut menjalankan
   * middleware di C saat terjadi error:
   */

  // await next()
}

function errorHandler(err: BotError) {
  console.error("Error di A, B, C, atau D!", err);
}
```

Dari contoh di atas, `boundaryHandler` akan dipanggil untuk:

1. Semua middleware yang diteruskan ke `bot.errorBoundary` setelah `boundaryHandler`, yaitu `Q`.
2. Semua midleware yang dipasang pada instance composer berikutnya, yaitu `X`, `Y`, dan `Z`.

> Mengenai poin 2, kamu bisa melompat ke [materi lanjutan middleware](../advanced/middleware.md) untuk mempelajari bagaimana cara kerja perangkaian atau chaining di grammY.

Kamu juga bisa menerapkan error boundary ke sebuah composer tanpa memanggil `bot.errorBoundary`:

```ts
const composer = new Composer();

const protected = composer.errorBoundary(boundaryHandler);
protected.use(/* B */);

bot.use(composer);
bot.use(/* C */);

bot.catch(errorHandler);

function boundaryHandler(err: BotError, next: NextFunction) {
  console.error("Error di B!", err);
}

function errorHandler(err: BotError) {
  console.error("Error di C!", err);
}
```

`boundaryHandler` di atas akan dipanggil untuk middleware yang terkait dengan `protected`.

Kalau kamu ingin dengan sengaja membuat error melewati batas error boundary—maksudnya meneruskannya keluar—kamu bisa melempar ulang sebuah error di dalam error handler.
Kemudian, error tersebut akan diteruskan ke error boundary berikutnya yang ada di sekitarnya.

Dengan kata lain, kamu bisa menganggap error handler yang dipasang melalui `bot.catch` sebagai lapisan terluar error boundary.
