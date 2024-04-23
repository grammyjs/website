# Middleware

Middleware adalah sebuah sebutan untuk function-function listener yang dipasang di `bot.on()`, `bot.command`, serta _sibling-sibling_ lain yang serupa.
Memanggilnya dengan sebutan "listener" hanyalah sebuah penyederhanaan saja, meskipun tidak sepenuhnya salah juga karena mereka memang menyimak---atau _listening_---sebuah update.

> Materi ini berisi penjelasan apa itu middleware, serta menggunakan grammY sebagai contoh ilustrasi bagaimana suatu middleware dapat digunakan.
> Kalau kamu mencari dokumentasi khusus mengenai keistimewaan middleware buatan grammY, silahkan baca materi [Membangkitkan Middleware](../advanced/middleware) di bab Tingkat Lanjut.

## Middleware Stack

Anggaplah kamu menulis bot seperti ini:

```ts{8}
const bot = new Bot("");

bot.use(session());

bot.command("start", (ctx) => ctx.reply("Mulai!"));
bot.command("help", (ctx) => ctx.reply("Teks bantuan"));

bot.on(":text", (ctx) => ctx.reply("Teks!")); // (*)
bot.on(":photo", (ctx) => ctx.reply("Foto!"));

bot.start();
```

Ketika sebuah update yang berisi pesan teks biasa tiba, tindakan-tindakan berikut akan dilakukan:

1. Kamu mengirim `"Halo botku sayang!"` ke bot.
2. Middleware session menerima update tersebut, kemudian melakukan tugasnya.
3. Update akan dicocokkan dengan command `/start`, yang mana tidak cocok.
4. Update akan dicocokkan dengan command `/help`, yang mana tidak cocok.
5. Update akan dicocokkan dengan pesan atau postingan channel yang mengandung teks, yang mana terdapat kecocokkan.
6. Middleware di `(*)` akan dipanggil, kemudian bot akan membalas dengan `"Teks!"`.

Update **tidak** dicocokkan dengan konten foto karena middleware di `(*)` sudah menangani update tersebut.

Kok bisa itu terjadi?
Mari cari tahu!

Klik [di sini](/ref/core/middleware) untuk melihat type `Middleware` di referensi grammY:

```ts
// Menghilangkan beberapa type parameter supaya ringkas.
type Middleware = MiddlewareFn | MiddlewareObj;
```

Aha!
Middleware bisa berupa sebuah function ataupun object.
Sejauh ini, kita cuma menggunakan function (`(ctx) => { ... }`). Mari kita abaikan object middleware untuk saat ini, dan menyelam lebih dalam menuju type `MiddlewareFn` ([referensi](/ref/core/middlewarefn)):

```ts
// Menghilangkan type parameter lagi.
type MiddlewareFn = (ctx: Context, next: NextFunction) => MaybePromise<unknown>;
// Dengan
type NextFunction = () => Promise<void>;
```

Ternyata, middleware mengambil dua buah parameter!
Kita cuma memakai satu sejauh ini, yaitu object context `ctx`.
Kita [sudah tahu](./context) apa itu `ctx`. Tetapi, kita juga melihat sebuah function dengan nama `next`.
Supaya bisa mengerti apa itu `next`, kita harus melihat secara keseluruhan middleware yang kamu pasang pada object bot-mu.

Kamu bisa membayangkan semua function middleware yang terpasang sebagai lapisan-lapisan yang ditumpuk di atas satu sama lain.
Midleware pertama---`session` berdasarkan contoh kita tadi---adalah lapisan teratas, sehingga ia akan menerima setiap update terlebih dahulu.
Kemudian, ia akan memutuskan apakah update tersebut akan diproses atau diteruskan ke lapisan berikutnya (handler command `/start`).
Function `next` dapat digunakan untuk memanggil middleware berikutnya, yang sering kali disebut _downstream middleware_ atau middleware hilir.
Artinya, kalau kamu tidak memanggil `next` di middleware, maka lapisan middleware di bawahnya tidak akan dipanggil.

Tumpukan-tumpukan function tadi disebut _middleware stack_.

```asciiart:no-line-numbers
(ctx, next) => ...    |
(ctx, next) => ...    |————— middleware hulu dari X (upstream)
(ctx, next) => ...    |
(ctx, next) => ...        <— middleware X. Memanggil `next` untuk meneruskan update
(ctx, next) => ...    |
(ctx, next) => ...    |————— middleware hilir dari X (downstream)
(ctx, next) => ...    |
```

Dari contoh sebelumnya, kita sekarang tahu mengapa `bot.on(":photo")` tidak ikut diperiksa.
Itu karena middleware di `bot.on(":text", (ctx) => { ... })` sudah menangani update-nya, sehingga tidak perlu memanggil `next`.
Bahkan, `next` sama sekali tidak dinyatakan di parameter-nya.
Ia mengabaikan `next` begitu saja, sehingga update tidak diteruskan.

Mari kita coba sesuatu yang lain dengan pengetahuan baru kita!

```ts
const bot = new Bot("");

bot.on(":text", (ctx) => ctx.reply("Teks!"));
bot.command("start", (ctx) => ctx.reply("Command!"));

bot.start();
```

Kalau kamu menjalankan bot di atas, lalu mengirim pesan `/start`, kamu tidak akan pernah mendapatkan respon `Command!`.
Mari kita telusuri apa yang terjadi:

1. Kamu mengirim `"/start"` ke bot.
2. Middleware `":text"` menerima update tersebut lalu mencocokkan dengan teks, yang mana terdapat kecocokkan karena command adalah sebuah pesan teks juga.
   Update diambil alih oleh middleware pertama dan bot kamu merespon dengan "Teks!".

Pesan tersebut bahkan tidak diperiksa apakah mengandung perintah `/start` atau tidak.
Urutan pemasangan middleware akan sangat berpengaruh karena ia juga mempengaruhi urutan lapisan di middleware stack.
Kamu bisa memperbaiki permasalahan di atas dengan membalik urutan pada baris kode 3 dan 4.
Kalau kamu memanggil `next` di baris 3, dua respon akan dikirim.

**Function `bot.use()` menerima semua update yang akan diteruskan ke middleware terkait.**
Itulah kenapa `session()` dipasang ke `bot.use()` karena kita ingin plugin tersebut beroperasi di semua update, tidak peduli apapun isinya.

Middleware stack merupakan properti yang benar-benar berguna untuk framework web manapun, dan model yang seperti ini sangat populer digunakan di berbagai tempat---tidak hanya untuk bot Telegram.

Sekarang, mari kita coba membuat sendiri potongan kecil middleware untuk mengilustrasikan dengan lebih baik bagaimana cara kerjanya.

## Membuat Middleware Sendiri

Kami akan mengilustrasikan konsep dari middleware dengan membuat function middleware sederhana yang dapat mengukur waktu respon bot, yaitu berapa lama waktu yang dibutuhkan sebuah bot untuk memproses pesan.

Berikut adalah _function signature_ untuk middleware kita.
Kamu bisa membandingkannya dengan type middleware di atas, dan memastikan bahwa kita benar-benar sudah membuat sebuah middleware di sini.

::: code-group

```ts [TypeScript]
/** Ukur waktu respon bot, kemudian catat di `console` */
async function waktuRespon(
  ctx: Context,
  next: NextFunction, // Alias dari: () => Promise<void>
): Promise<void> {
  // TODO: Tulis implementasinya disini
}
```

```js [JavaScript]
/** Ukur waktu respon bot, kemudian catat di `console` */
async function waktuRespon(ctx, next) {
  // TODO: Tulis implementasinya disini
}
```

:::

Lalu, kita bisa memasangnya ke instance `bot` dengan `bot.use()`:

```ts
bot.use(waktuRespon);
```

Sekarang, mari kita tulis implementasinya.
Berikut yang akan kita lakukan:

1. Ketika update datang, simpan `Date.now()` di dalam sebuah variabel.
2. Kita panggil middleware hilir, lalu biarkan semua proses penanganan pesan terjadi.
   Ini termasuk pencocokan perintah, membalas pesan, dan semua tindakan lain yang perlu dilakukan oleh bot.
3. Ketika semua proses sudah selesai dilakukan, kita ambil `Date.now()` sekali lagi, lalu membandingkannya dengan nilai yang lama, kemudian `console.log` selisih waktunya.

Penting untuk memasang middleware `waktuRespon` di urutan _pertama_ (di middleware stack paling atas) agar semua operasi yang dilakukan tercatat dalam pengukuran.

::: code-group

```ts [TypeScript]
/** Ukur waktu respon bot, kemudian catat di `console` */
async function waktuRespon(
  ctx: Context,
  next: NextFunction, // Alias dari: () => Promise<void>
): Promise<void> {
  // Ambil waktu awal
  const awal = Date.now(); // Milidetik
  // Panggil middleware hilir
  await next(); // Pastikan untuk `await`!
  // Ambil waktu akhir
  const akhir = Date.now(); // Milidetik
  // Catat selisihnya
  console.log(`Waktu respon: ${akhir - awal} milidetik`);
}

bot.use(waktuRespon);
```

```js [JavaScript]
/** Ukur waktu respon bot, kemudian catat di `console` */
async function waktuRespon(ctx, next) {
  // Ambil waktu awal
  const awal = Date.now(); // Milidetik
  // Panggil middleware hilir
  await next(); // Pastikan untuk `await`!
  // Ambil waktu akhir
  const akhir = Date.now(); // Milidetik
  // Catat selisihnya
  console.log(`Waktu respon: ${akhir - awal} milidetik`);
}

bot.use(waktuRespon);
```

:::

Sempurna! :heavy_check_mark:

Silahkan gunakan middleware ini pada object bot kamu, pasang lebih banyak listener, dan bermain-main dengan contoh tadi supaya dapat memahami sepenuhnya apa itu middleware.

::: danger BAHAYA: Selalu Pastikan untuk Menunggu Next!
Kalau kamu memanggil `next()` tanpa `await`, beberapa hal tidak akan berjalan dengan baik:

- :x: Susunan middleware-mu akan dieksekusi dengan urutan yang salah.
- :x: Data kamu bisa saja hilang.
- :x: Beberapa pesan tidak akan terkirim.
- :x: Bot kamu akan crash secara acak yang sulit untuk direproduksi kembali.
- :x: Saat terjadi error, _error handler_ tidak akan dipanggil.
  Akibatnya, kamu akan melihat sebuah `UnhandledPromiseRejectionWarning` yang membuat bot menjadi crash.
- :x: Mekanisme backpressure [grammY runner](../plugins/runner)---yang berfungsi untuk melindungi server dari beban yang terlalu tinggi, misalnya saat terjadi lonjakan beban---menjadi tidak berfungsi.
- :skull: Terkadang, juga dapat membunuh kucing imut yang tidak berdosa. :crying_cat_face:

:::

Aturannya adalah kamu harus menggunakan `await`, khususnya untuk `next()`.
Tetapi, ini juga berlaku untuk expression lain pada umumnya yang mengembalikan sebuah `Promise`.
Termasuk `bot.api.sendMessage`, `ctx.reply`, dan pemanggilan koneksi lainnya.
Kalau proyek yang sedang kamu kerjakan memang serius, sebaiknya gunakan _linting tool_ yang akan mengingatkan disaat kamu lupa menggunakan `await` di dalam sebuah `Promise`.

::: tip Aktifkan no-floating-promises
Pertimbangkan untuk menggunakan [ESLint](https://eslint.org/) dan menerapkan aturan [no-floating-promises](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-floating-promises.mdx).
Ini akan memastikan kamu supaya tidak lupa menggunakan `await` (dengan cara mengomel ke kamu).
:::

## Property Middleware grammY

Di grammY, middleware mengembalikan sebuah `Promise` yang nantinya akan di-`await`. Tetapi, ia juga bisa di-_synchronous_.

Berbanding terbalik dengan sistem middleware lainnya,---contohnya di `express`---kamu tidak bisa meneruskan _error value_ ke `next`.
`next` tidak mengambil argument apapun.
Kalau ingin menghasilkan error, kamu cukup `throw` error.
Perbedaan lainnya, tidak peduli berapapun argument yang diambil oleh middleware kamu, `() => {}` akan diberlakukan layaknya sebuah `(ctx) => {}` atau `(ctx, next) => {}`.

Terdapat dua macam type middleware: function dan object.
Object middleware simpelnya adalah sebuah pembungkus dari suatu function middleware.
Kebanyakan cuma digunakan di internal, tetapi terkadang juga bisa membantu library pihak ketiga, atau digunakan untuk kasus tingkat lanjut, contohnya [Composer](/ref/core/composer):

```ts
const bot = new Bot("");

bot.use(/*...*/);
bot.use(/*...*/);

const composer = new Composer();
composer.use(/*...*/);
composer.use(/*...*/);
composer.use(/*...*/);
bot.use(composer); // composer adalah sebuah object middleware!

bot.use(/*...*/);
bot.use(/*...*/);
// ...
```

Kalau ingin mempelajari lebih lanjut bagaimana grammY mengimplementasikan middleware, silahkan baca materi [Membangkitkan Middleware](../advanced/middleware) di bab Tingkat Lanjut.
