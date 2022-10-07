# Pengulang Request API (`auto-retry`)

> Pertimbangkan untuk menggunakan [plugin throttler](./transformer-throttler.md) alih-alih menggunakan plugin ini.

Plugin ini adalah sebuah [API transformer function](../advanced/transformers.md).
Artinya, ia dapat mencegat dan memodifikasi HTTP request yang keluar secara langsung.
Lebih tepatnya, plugin ini akan secara otomatis mendeteksi jika suatu API request gagal dilakukan dengan membawa value `retry_after`, misal dikarenakan rate limit.
Ia akan menangkap error tersebut, lalu menunggu beberapa saat, kemudian mengirim request tersebut kembali.

::: warning Gunakan Server API Bot dengan Bijak
Telegram dengan baik hati menyediakan informasi berapa lama bot kamu harus menunggu sebelum request selanjutnya boleh dikirim.
Saat terkena flood limit, plugin `auto-retry` akan menjaga performa bot kamu dengan cara mengirim kembali request yang gagal dikirim.
Namun, **auto-retry sebaiknya tidak dipakai** untuk menghindari rate limit yang terjadi pada operasi sehari-hari.
Jika kamu terus-menerus melanggar batas rate limit, Telegram akan mengambil tindakan berupa pembatasan bot atau bahkan memblokir bot kamu sepenuhnya.
:::

Kamu bisa menginstal plugin ini di object `bot.api`:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { autoRetry } from "@grammyjs/auto-retry";

// Pasang plugin-nya
bot.api.config.use(autoRetry());
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { autoRetry } = require("@grammyjs/auto-retry");

// Pasang plugin-nya
bot.api.config.use(autoRetry());
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { autoRetry } from "https://esm.sh/@grammyjs/auto-retry";

// Pasang plugin-nya
bot.api.config.use(autoRetry());
```

</CodeGroupItem>
</CodeGroup>

Sekarang, anggaplah kamu sedang memanggil `sendMessage`, lalu terkena rate limit, maka ia akan tampak seperti sebuah request yang diproses dengan sangat lama.
Di balik layar, beberapa HTTP request sedang dilakukan dengan jeda waktu yang sesuai---berdasarkan durasi flood limit---di antara kedua request.
Oleh sebab itu, durasi pemrosesan terasa lama karena adanya jeda waktu tersebut.

Kamu bisa menentukan sebuah opsi `maxRetryAttempts` untuk menentukan jumlah maksimal pengulangan yang boleh dilakukan (bawaanya: 3) atau opsi `maxDelaySeconds` untuk menentukan batas maksimal durasi tunggu (bawaanya: 1 jam).

Segera setelah jumlah maksimal pengulangan terlampaui, request-request berikutnya yang mengalami error tidak akan diulang kembali.
Object error tersebut akan tetap diteruskan yang kemudian menghasilkan sebuah [`GrammyError`](../guide/errors.md#object-grammyerror).

Hal yang sama juga berlaku ketika request gagal dijalankan dengan `retry_after` lebih besar dari nilai `maxDelaySeconds` yang telah ditentukan.
Request tersebut akan digagalkan saat itu juga.

```ts
autoRetry({
  maxRetryAttempts: 1, // Hanya mengulangi sekali
  maxDelaySeconds: 5, // Langsung gagalkan jika kita harus menunggu lebih dari 5 detik
});
```

Kamu bisa menggunakan `retryOnInternalServerErrors` untuk menyertakan error-error server internal Telegram lainnya (kode status >= 500).
Error tersebut akan langsung diulang kembali dengan tetap mematuhi opsi `maxRetryAttempts` yang telah ditentukan.

## Ringkasan Plugin

- Nama: `auto-retry`
- Sumber: <https://github.com/grammyjs/auto-retry>
- Referensi: <https://doc.deno.land/https://raw.githubusercontent.com/grammyjs/auto-retry/main/src/index.ts>
