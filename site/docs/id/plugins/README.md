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
Khusus untuk plugin resmi, nama package-nya selalu disertakan di judul dokumentasi masing-masing plugin. Contohnya, plugin [grammy runner](./runner) (`runner`) bisa diinstal melalui `npm install @grammyjs/runner` (Kalau kamu menggunakan Deno, kamu bisa meng-import plugin dari <https://deno.land/x/>, yaitu file `mod.ts` di module `grammy_runner`).

Kami juga menyediakan beberapa plugin **pihak ketiga**.
Siapapun bisa mempublikasikan plugin jenis ini.
Tetapi, kami tidak bisa menjamin plugin tersebut akan selalu diperbarui, terdokumentasi secara lengkap, ataupun kompatibel dengan plugin-plugin lain.
Kamu juga bisa membuat plugin pihak ketigamu terdaftar di website ini agar orang-orang bisa menemukannya dengan mudah.

## Gambaran Umum

Kami menyediakan daftar setiap plugin yang tersedia beserta deskripsi singkat di dalamnya.
Memasang plugin-plugin ini cukup mudah dan menyenangkan, dan kami ingin kalian semua tahu plugin apa saja yang telah tersedia.

> Klik nama package berikut untuk mempelajari lebih lanjut mengenai plugin tersebut.

| Plugin                     | Package                                            | Deskripsi                                                                            |
| -------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Session                    | _[bawaan](./session)_                              | Menyimpan data user di database kamu                                                 |
| Keyboard Custom dan Inline | _[bawaan](./keyboard)_                             | Membuat keyboard custom dan inline dengan mudah                                      |
| Pengulang Request API      | [`auto-retry`](./auto-retry)                       | Menangani rate limit secara otomatis                                                 |
| Percakapan                 | [`conversations`](./conversations)                 | Membuat antarmuka percakapan dan dialog                                              |
| Emoji                      | [`emoji`](./emoji)                                 | Menggunakan emoji di kode dengan mudah                                               |
| File                       | [`files`](./files)                                 | Menangani file dengan mudah                                                          |
| Hidrasi                    | [`hydrate`](./hydrate)                             | Memanggil method untuk object yang dikembalikan dari pemanggilan API                 |
| Internationalization       | [`i18n`](./i18n) atau [`fluent`](./fluent)         | Membuat bot kamu bisa berbicara dengan berbagai bahasa                               |
| Menu Interaktif            | [`menu`](./menu)                                   | Mendesain tombol menu secara dinamis dengan navigasi yang fleksibel                  |
| Parse Mode                 | [`parse-mode`](./parse-mode)                       | Memformat pesan dengan mudah                                                         |
| Rate Limit User            | [`ratelimiter`](./ratelimiter)                     | Otomatis membatasi user yang melakukan spam ke bot kamu                              |
| Router                     | [`router`](./router)                               | Mengarahkan pesan ke beberapa bagian di kode kamu                                    |
| Runner                     | [`runner`](./runner)                               | Menggunakan long polling secara bersamaan dalam skala besar                          |
| Stateless Question         | [`stateless-question`](./stateless-question)       | Membuat dialog tanpa menggunakan penyimpanan data                                    |
| Kontrol Flood              | [`transformer-throttler`](./transformer-throttler) | Membuat antrian pemanggilan API secara otomatis untuk mencegah terjadinya flood wait |

Kami juga punya plugin pihak ketiga!
Kamu bisa menemukannya di menu navigasi _Plugin_ > _Pihak Ketiga_.
Jangan lupa untuk mengeceknya juga!

## Jenis-Jenis Plugin di grammY

Semua yang berkilau adalah emas, benar?
Emas yang berbeda tentunya!
grammY memiliki dua jenis plugin: _plugin middleware_ dan _plugin transformer_.
Singkatnya, plugin di grammY mengembalikan sebuah function entah berupa middleware ataupun transformer.
Mari kita bahas perbedaanya.

### Jenis I: Plugin Middleware

[Middleware](../guide/middleware) adalah sebuah function yang menangani data yang masuk apapun bentuknya.
Sehingga, plugin middleware adalah plugin yang diberikan ke bot dalam bentuk---yup, tebakanmu benar---middleware.
Artinya, kamu bisa menggunakannya melalui `bot.use`.

### Jenis II: Plugin Transformer

[Function transformer](../advanced/transformers) adalah kebalikan dari middleware!
Ia adalah sebuah function yang menangani data yang keluar.
Dengan begitu, plugin transformer adalah plugin yang diberikan ke bot dalam bentuk---wow! tebakanmu benar lagi!---function transformer.
Artinya, kamu bisa menggunakannya melalui `bot.api.config.use`.

## Buat Plugin-mu Sendiri

Kalau kamu berniat membuat sebuah plugin dan ingin membagikannya ke pengguna lain (atau bahkan mempublikasikannya di website resmi grammY), berikut [panduan yang bisa kamu ikuti](./guide).

## Ide untuk Plugin-Plugin Berikutnya

Kami mengumpulkan berbagai ide dan saran untuk plugin-plugin baru di [GitHub issue berikut](https://github.com/grammyjs/grammY/issues/110).
