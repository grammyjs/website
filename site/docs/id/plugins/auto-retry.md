---
prev: false
next: false
---

# Pengulang Request API (`auto-retry`)

Plugin auto-retry menyediakan sumber daya yang diperlukan untuk menangani
[pembatasan flood (flood limits)](../advanced/flood), yaitu sebuah kesalahan
dengan kode 429. Ia bisa diterapkan ke semua bot selama pengoperasian normal,
terutama saat [proses penyiaran](../advanced/flood#cara-menyebarkan-pesan)
berlangsung.

Plugin ini merupakan sebuah
[API transformer function](../advanced/transformers). Artinya, ia dapat mencegat
dan memodifikasi HTTP request yang keluar secara dinamis. Lebih tepatnya, plugin
ini akan secara otomatis mendeteksi jika suatu API request gagal dilakukan
dengan membawa value `retry_after`, misal dikarenakan rate limit. Ia akan
menangkap error tersebut, lalu menunggu beberapa saat, kemudian mengirim request
tersebut kembali.

Selain menangani pembatasan flood, plugin ini juga akan mencoba mengirim kembali
request yang gagal terkirim karena kesalahan server internal, misalnya kesalahan
dengan kode 500 atau lebih. Kesalahan jaringan --- _yang melempar
[sebuah error `HttpError`](../guide/errors#object-httperror)_ --- juga akan
memicu plugin untuk melakukan pengulangan. Mencoba mengulang kembali request
merupakan satu-satunya strategi yang masuk akal untuk menangani kedua jenis
kesalahan tersebut. Karena keduanya tidak menyediakan nilai `retry_after`,
plugin akan menambah durasi tunggu secara eksponensial yang dimulai dari tiga
detik hingga maksimal satu jam.

## Penginstalan

Kamu bisa menginstal plugin ini di object `bot.api`:

::: code-group

```ts [TypeScript]
import { autoRetry } from "@grammyjs/auto-retry";

// Pasang plugin-nya
bot.api.config.use(autoRetry());
```

```js [JavaScript]
const { autoRetry } = require("@grammyjs/auto-retry");

// Pasang plugin-nya
bot.api.config.use(autoRetry());
```

```ts [Deno]
import { autoRetry } from "https://deno.land/x/grammy_auto_retry/mod.ts";

// Pasang plugin-nya
bot.api.config.use(autoRetry());
```

:::

Sekarang, anggaplah kamu sedang memanggil `sendMessage`, lalu terkena rate
limit, maka ia akan tampak seperti sebuah request yang diproses dengan sangat
lama. Di balik layar, beberapa HTTP request sedang dilakukan dengan jeda waktu
yang sesuai---berdasarkan durasi flood limit---di antara kedua request. Oleh
sebab itu, durasi pemrosesan terasa lama karena adanya jeda waktu tersebut.

## Konfigurasi

Kamu bisa meneruskan sebuah object opsi yang menentukan jumlah maksimal
pengulangan (`maxRetryAttempts`) ataupun ambang batas atas waktu tunggu
(`maxDelaySeconds`).

### Membatasi Pengulangan

Segera setelah jumlah maksimal pengulangan terlampaui, request-request
berikutnya yang mengalami error tidak akan diulang kembali. Object error
tersebut akan tetap diteruskan yang kemudian menghasilkan sebuah
[`GrammyError`](../guide/errors#object-grammyerror).

Hal yang sama juga berlaku ketika request gagal dijalankan dengan `retry_after`
lebih besar dari nilai `maxDelaySeconds` yang telah ditentukan. Request tersebut
akan digagalkan saat itu juga.

```ts
autoRetry({
  maxRetryAttempts: 1, // hanya mengulangi sekali
  maxDelaySeconds: 5, // langsung gagalkan jika kita harus menunggu lebih dari 5 detik
});
```

### Melempar Kembali Kesalahan Server Internal

Kamu bisa memanfaatkan `rethrowInternalServerErrors` untuk tidak menangani
kesalahan server internal seperti yang telah dijelaskan
[sebelumnya](#pengulang-request-api-auto-retry). Object error dari Telegram akan
langsung diteruskan, yang kemudian akan menggagalkan request terkait dengan
sebuah error [`GrammyError`](../guide/errors#object-grammyerror).

```ts
autoRetry({
  rethrowInternalServerErrors: true, // jangan tangani kesalahan server internal
});
```

### Melempar Kembali Kesalahan Jaringan

Kamu bisa memanfaatkan `rethrowHttpErrors` untuk tidak menangani kesalahan
jaringan seperti yang telah dijelaskan
[sebelumnya](#pengulang-request-api-auto-retry). Jika diaktifkan, instance error
[`HttpError`](../guide/errors#object-httperror) yang dilempar akan langsung
diteruskan, yang kemudian akan menggagalkan request terkait.

```ts
autoRetry({
  rethrowHttpErrors: true, // jangan tangani kesalahan jaringan
});
```

## Ringkasan Plugin

- Nama: `auto-retry`
- [Sumber](https://github.com/grammyjs/auto-retry)
- [Referensi](/ref/auto-retry/)
