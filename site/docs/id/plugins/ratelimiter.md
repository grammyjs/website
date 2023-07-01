# Penghambat Laju User (`ratelimiter`)

ratelimiter adalah sebuah middleware yang dibuat dari framework bot grammY ataupun [Telegraf](https://github.com/telegraf/telegraf) yang berfungsi untuk mengatur rate-limit pengguna bot.
Simpelnya, plugin ini dapat membantu kamu dalam mencegah serangan spam ke bot.
Supaya lebih paham, coba lihat ilustrasi berikut:

![Peran ratelimiter dalam menangkis spam](/images/ratelimiter-role.png)

## Bagaimana Cara Kerjanya?

Dalam keadaan normal, setiap request akan langsung diproses dan dijawab oleh bot kamu.
Artinya, user bisa dengan mudah melakukan spam ke bot kamu.
Mereka bisa saja mengirim banyak sekali request setiap detiknya, lalu bot kamu akan memproses semua request tersebut.
Lantas, bagaimana cara kita menghentikannya?
Solusinya adalah dengan menggunakan ratelimiter!

::: warning Batasi User, Bukan Server Telegram!
Perlu diketahui, package ini **TIDAK** membatasi request yang datang dari server Telegram.
Sebaliknya, ia memantau `from.id` dari setiap request yang diterima lalu mengabaikannya begitu saja.
Dengan begitu, server kamu tidak terbebani oleh pemrosesan pesan yang tidak perlu.
:::

## Opsi Pengaturan

Plugin ini menyediakan 5 opsi yang bisa diatur:

- `timeFrame`: Rentang waktu pemantauan request (bawaanya `1000` ms).
- `limit`: Jumlah request yang diperbolehkan untuk setiap `timeFrame` (bawaannya `1`).
- `storageClient`: Jenis penyimpanan yang dipakai untuk menyimpan hasil pemantauan user beserta request-nya.
  Nilai bawaanya adalah `MEMORY_STORE` yang mana ia akan memakai in-memory [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).
  Kamu juga bisa menggantinya dengan Redis, serta penyimpanan-penyimpanan lain yang telah dijelaskan di bagian [Tentang storageClient](#tentang-storageclient).
- `onLimitExceeded`: Sebuah function yang menentukan aksi apa yang akan dilakukan ketika user melampaui batas (bawaanya mengabaikan request tersebut).
- `keyGenerator`: Sebuah function yang mengembalikan key unik yang dibuat untuk setiap user (bawaanya menggunakan `from.id`).
  Key ini digunakan untuk mengidentifikasi user, oleh karenanya ia harus unik, spesifik untuk satu user, dan dalam format string.

### Tentang `storageClient`

`MEMORY_STORE` atau in-memory tracking cocok digunakan di sebagian besar bot.
Namun, kalau kamu menggunakan cluster untuk bot kamu, maka kamu tidak bisa menggunakan penyimpanan in-memory secara efektif.
Itulah kenapa kami juga menyediakan opsi Redis.
Kamu bisa menerapkan Redis dengan [ioredis](https://github.com/redis/ioredis) atau [redis](https://deno.land/x/redis) jika kamu menggunakan Deno.
Semua driver Redis yang menggunakan method `incr` dan `pexpire` seharusnya juga dapat bekerja sama baiknya.
ratelimiter tidak berorientasi pada driver.

> Catatan: Kamu harus memiliki redis-server **2.6.0** ke atas untuk menggunakan penyimpanan Redis bersama dengan ratelimiter.
> Versi Redis yang di bawah itu tidak didukung.

## Cara Penggunaan

Ada dua cara dalam menggunakan ratelimiter:

- Menggunakan pengaturan bawaan ([Konfigurasi Bawaan](#konfigurasi-bawaan)),
- Menentukan object khusus yang berisi konfigurasimu ([Konfigurasi Manual](#konfigurasi-manual)).

### Konfigurasi Bawaan

Berikut cara termudah dalam menggunakan ratelimiter dengan menerapkan perilaku bawaan:

::::code-group
:::code-group-item TypeScript

```ts
import { limit } from "@grammyjs/ratelimiter";

// Batasi menjadi 1 pesan per detik untuk setiap user.
bot.use(limit());
```

:::
:::code-group-item JavaScript

```js
const { limit } = require("@grammyjs/ratelimiter");

// Batasi menjadi 1 pesan per detik untuk setiap user.
bot.use(limit());
```

:::
:::code-group-item Deno

```ts
import { limit } from "https://deno.land/x/grammy_ratelimiter/mod.ts";

// Batasi menjadi 1 pesan per detik untuk setiap user.
bot.use(limit());
```

:::
::::

### Konfigurasi Manual

Seperti yang sudah disebutkan di awal, kamu bisa menentukan object `Options` ke method `limit()` untuk mengatur perilaku limiter.

::::code-group
:::code-group-item TypeScript

```ts
import Redis from "ioredis";
import { limit } from "@grammyjs/ratelimiter";

const redis = new Redis(...);

bot.use(
  limit({
    // Hanya 3 pesan yang akan diproses dalam rentang waktu 2 detik.
    timeFrame: 2000,
    limit: 3,

    // "MEMORY_STORE" adalah nilai bawaanya.
    // Kamu tidak perlu mengatur storageClient jika tidak ingin menggunakan Redis.
    storageClient: redis,

    // Berikut akan dijalankan ketika limit terlampaui.
    onLimitExceeded: async (ctx) => {
      await ctx.reply("Tolong jangan kirim request berlebihan!");
    },

    // Key ini harus berupa angka dalam format string, misal "123456".
    keyGenerator: (ctx) => {
      return ctx.from?.id.toString();
    },
  })
);
```

:::
:::code-group-item JavaScript

```js
const Redis = require("ioredis");
const { limit } = require("@grammyjs/ratelimiter");

const redis = new Redis(...);

bot.use(
  limit({
    // Hanya 3 pesan yang akan diproses dalam rentang waktu 2 detik.
    timeFrame: 2000,
    limit: 3,

    // "MEMORY_STORE" adalah nilai bawaanya.
    // Kamu tidak perlu mengatur storageClient jika tidak ingin menggunakan Redis.
    storageClient: redis,

    // Berikut akan dijalankan ketika limit terlampaui.
    onLimitExceeded: async (ctx) => {
      await ctx.reply("Tolong jangan kirim request berlebihan!");
    },

    // Key ini harus berupa angka dalam format string, misal "123456".
    keyGenerator: (ctx) => {
      return ctx.from?.id.toString();
    },
  })
);
```

:::
:::code-group-item Deno

```ts
import { connect } from "https://deno.land/x/redis/mod.ts";
import { limit } from "https://deno.land/x/grammy_ratelimiter/mod.ts";

const redis = await connect(...);

bot.use(
  limit({
    // Hanya 3 pesan yang akan diproses dalam rentang waktu 2 detik.
    timeFrame: 2000,
    limit: 3,

    // "MEMORY_STORE" adalah nilai bawaanya.
    // Kamu tidak perlu mengatur storageClient jika tidak ingin menggunakan Redis.
    storageClient: redis,

    // Berikut akan dijalankan ketika limit terlampaui.
    onLimitExceeded: async (ctx) => {
      await ctx.reply("Tolong jangan kirim request berlebihan!");
    },

    // Key ini harus berupa angka dalam format string, misal "123456".
    keyGenerator: (ctx) => {
      return ctx.from?.id.toString();
    },
  })
);
```

:::
::::

Seperti yang kamu lihat dari contoh di atas, setiap user hanya diperbolehkan mengirim 3 request setiap 2 detik.
Jika user tersebut mengirim request melebihi batas yang telah kita tentukan, bot akan membalas dengan, _"Tolong jangan kirim request berlebihan"_.
Request tersebut kemudian akan diabaikan begitu saja karena kita tidak memanggil [next()](../guide/middleware.md#middleware-stack) di middleware.

> Catatan: Untuk menghindari flooding ke server Telegram, `onLimitExceeded` hanya akan dieksekusi sekali untuk setiap `timeFrame`.

Contoh penggunaan lainnya adalah dengan membatasi request yang datang dari sebuah chat, alih-alih dari user tertentu:

::::code-group
:::code-group-item TypeScript

```ts
import { limit } from "@grammyjs/ratelimiter";

bot.use(
  limit({
    keyGenerator: (ctx) => {
      if (ctx.hasChatType(["group", "supergroup"])) {
        // Key ini harus berupa angka dalam format string, misal "123456".
        return ctx.chat.id.toString();
      }
    },
  }),
);
```

:::
:::code-group-item JavaScript

```js
const { limit } = require("@grammyjs/ratelimiter");

bot.use(
  limit({
    keyGenerator: (ctx) => {
      if (ctx.hasChatType(["group", "supergroup"])) {
        // Key ini harus berupa angka dalam format string, misal "123456".
        return ctx.chat.id.toString();
      }
    },
  }),
);
```

:::
:::code-group-item Deno

```ts
import { limit } from "https://deno.land/x/grammy_ratelimiter/mod.ts";

bot.use(
  limit({
    keyGenerator: (ctx) => {
      if (ctx.hasChatType(["group", "supergroup"])) {
        // Key ini harus berupa angka dalam format string, misal "123456".
        return ctx.chat.id.toString();
      }
    },
  }),
);
```

:::
::::

Dari contoh di atas, kita menggunakan `chat.id` sebagai key unik untuk melakukan rate-limit.

## Ringkasan Plugin

- Nama: `ratelimiter`
- Sumber: <https://github.com/grammyjs/ratelimiter>
- Referensi: <https://deno.land/x/grammy_ratelimiter/mod.ts>
