# Kumpulan Middleware yang Berguna

Capek menulis middleware yang sama berulang kali?
Yup, begitu juga dengan kami.
Oleh karena itu, kali ini kami memutuskan untuk mengumpulkan berbagai middleware ke dalam sebuah package terpisah.

## Instalasi

`yarn add grammy-middlewares`

## Penggunaan

Semua middleware [accessor](https://www.codepolitan.com/sedikit-lebih-dalam-dengan-accessor-dan-mutator-58a192fa846f3/) dapat memproduksi sesuatu, meskipun tidak semua middleware diharuskan seperti itu.
Kita bisa menganggapnya sebagai _factory_.
Kami memutuskan untuk membuat API menjadi seragam.

Beberapa factory bisa menggunakan parameter wajib ataupun opsional.

```typescript
import {
  ignoreOld,
  onlyAdmin,
  onlyPublic,
  onlySuperAdmin,
  sequentialize,
} from "grammy-middlewares";

// ...

bot.use(
  ignoreOld(),
  onlyAdmin((ctx) => ctx.reply("Hanya admin yang bisa melakukan ini")),
  onlyPublic((ctx) => ctx.reply("Kamu hanya bisa menggunakan chat publik")),
  onlySuperAdmin(env.SUPER_ADMIN_ID),
  sequentialize(),
);
```

## Middleware

### `ignoreOld`

Abaikan update yang telah usang.
Ini berguna ketika bot mengalami down untuk beberapa saat.
Kamu juga bisa menentukan waktu timeout-nya dalam satuan detik (bawaanya selama 5 menit).

### `onlyAdmin`

Periksa apakah user tersebut adalah seorang admin.
Kamu bisa menentukan `errorHandler` yang nantinya akan dipanggil bersama dengan context-nya jika user tersebut bukan seorang admin.

### `onlyPublic`

Periksa apakah ia sebuah grup atau channel.
Kamu bisa menentukan `errorHandler` yang nantinya akan dipanggil bersama dengan context-nya jika ia bukan sebuah grup ataupun channel.

### `onlySuperAdmin`

Periksa apakah user tersebut adalah seorang super admin.
Kamu perlu menyediakan id super admin-nya

### `sequentialize`

Middleware [sequentialize](../advanced/scaling.md#concurrency-itu-sulit) sederhana yang menggunakan chat id sebagai identifier-nya sequential.

## Ringkasan Plugin

- Nama: `grammy-middlewares`
- Sumber: <https://github.com/backmeupplz/grammy-middlewares>
- Referensi: <https://github.com/backmeupplz/grammy-middlewares>
