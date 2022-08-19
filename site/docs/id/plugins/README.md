---
next: ./guide.md
---

# Apa Itu Plugin?

Kami ingin grammY menjadi ringkas dan minimal, tetapi bisa diperluas.
Kenapa?
Karena tidak semua orang akan menggunakan semua fiturnya!
Plugin didesain sebagai fitur atau fungsionalitas ekstra yang ditambahkan ke dalam sebuah software.

## Plugin di grammY

Beberapa plugin sudah disediakan secara **bawaan** di dalam library inti grammY, karena kami merasa banyak bot yang akan membutuhkan fitur-fitur tersebut.
Dengan begitu, user baru akan lebih mudah menggunakannya karena tidak perlu menginstal package tambahan terlebih dahulu.

Sebagian besar plugin dipublikasikan bersama dengan package inti grammY, yang kami sebut sebagai plugin **resmi**.
Plugin-plugin ini bisa diinstal dari `@grammyjs/*` melalui npm, dan mereka semua dipublikasikan oleh organisasi [@grammyjs](https://github.com/grammyjs) di GitHub.
Selain itu, kami juga selalu memastikan semua plugin berjalan dengan baik di setiap rilisan grammY.
Khusus untuk plugin resmi, nama package-nya selalu disertakan di judul dokumentasi masing-masing plugin. Contohnya, plugin [grammy runner](./runner.md) (`runner`) bisa diinstal melalui `npm install @grammyjs/runner`.
(Kalau kamu menggunakan Deno, kamu bisa meng-import plugin dari <https://deno.land/x/>, yaitu file `mod.ts` di modul `grammy_runner`.)

## Jenis-Jenis Plugin di grammY

Semua yang berkilau adalah emas, benar?
Emas yang berbeda tentunya!
grammY memiliki dua jenis plugin: _plugin middleware_ dan _plugin transformer_.
Singkatnya, plugin di grammY mengembalikan sebuah function entah berupa middleware ataupun transformer.
Mari kita bahas perbedaanya.

### Jenis I: Plugin Middleware

[Middleware](../guide/middleware.md) adalah sebuah function yang menangani data yang masuk apapun bentuknya.
Sehingga, plugin middleware adalah plugin yang diberikan ke bot dalam bentuk — _yup, tebakanmu benar_ — middleware.
Artinya, kamu bisa menggunakannya melalui `bot.use`.

### Jenis II: Plugin Transformer

[Function transformer](../advanced/transformers.md) adalah kebalikan dari middleware!
Ia adalah sebuah function yang menangani data yang keluar.
Dengan begitu, plugin transformer adalah plugin yang diberikan ke bot dalam bentuk — _wow! tebakanmu benar lagi!_ — function transformer.
Artinya, kamu bisa menggunakannya melalui `bot.api.config.use`.

## Buat Plugin-mu Sendiri

Kalau kamu berniat membuat sebuah plugin dan ingin membagikannya ke pengguna lain (atau bahkan mempublikasikannya di website resmi grammY), berikut [panduan yang bisa kamu ikuti](./guide.md).

## Ide untuk Plugin-Plugin Berikutnya

Kami mengumpulkan berbagai ide dan saran untuk plugin-plugin baru di [GitHub issue berikut](https://github.com/grammyjs/grammY/issues/110).
