---
prev:
  link: ./flood
next:
  link: ./proxy
---

# Transformer API Bot

Middleware adalah sebuah function yang menangani sebuah object context, misalnya data yang masuk.

grammY juga menyediakan kebalikannya.
_Function transformer_ adalah sebuah function yang menangani data yang keluar, contohnya:

- Pemanggilan method API Bot, serta
- Object payload yang cocok dengan suatu method tertentu.

Alih-alih memasukkan `next` sebagai argument terakhir untuk memanggil middleware hilir (downstream), kamu akan menerima `prev` sebagai argument pertama untuk memanfaatkan function transformer hulu (upstream).
Kalau dilihat dari _type signature_-nya `Transformer` ([referensi API grammY](https://deno.land/x/grammy/mod.ts?s=Transformer)), kita bisa melihat bagaimana ia diimplentasikan.
Perlu diketahui bahwa `Payload<M, R>` merujuk ke object payload yang akan dicocokkan dengan method yang diberikan, serta `ApiResponse<ApiCallResult<M, R>>` adalah type pengembalian dari method yang dipanggil.

Function transformer yang terakhir dipanggil adalah pemanggilan bawaan yang melakukan beberapa hal seperti _JSON serialization_ untuk field tertentu dan terkadang juga memanggil `fetch`.

Function transformer tidak memiliki sebuah class yang setara dengan `Composer`.
Tetapi, jika kamu membutuhkannya, kamu bisa membuatnya sendiri.
Kami siap menerima pull request-mu! :wink:

## Memasang Function Transformer

Function Transformer bisa dipasang di `bot.api`.
Berikut contoh function transformer yang tidak melakukan apapun:

```ts
// Meneruskan ke function transformer
bot.api.config.use((prev, method, payload, signal) =>
  prev(method, payload, signal)
);

// Perbandingan jika diteruskan ke middleware
bot.use((ctx, next) => next());
```

Berikut contoh function transformer yang mencegah semua pemanggilan API:

```ts
// Mengembalikan undefined alih-alih type object yang bersangkutan.
bot.api.config.use((prev, method, payload) => undefined as any);
```

Kamu juga bisa memasang function transformer di object API milik object context.
Function transformer hanya akan digunakan sementara untuk request API yang dilakukan di object context tersebut, sehingga pemanggilan `bot.api` tidak terpengaruh.
Pemanggilan melalui object context dari middleware yang berjalan secara bersamaan (concurrent) juga tidak terpengaruh.
Segera setelah middleware yang bersangkutan selesai, function transformer tersebut langsung dibuang.

```ts
bot.on("message", async (ctx) => {
  // Pasang di semua object context yang memproses pesan.
  ctx.api.config.use((prev, method, payload, signal) =>
    prev(method, payload, signal)
  );
});
```

> Parameter `signal` harus selalu diteruskan ke `prev`.
> Ia diperlukan untuk membatalkan request serta menjaga agar `bot.stop` bekerja dengan baik.

Function transformer yang dipasang di `bot.api` juga akan terpasang di setiap object `ctx.api`.
Sehingga, pemanggilan `ctx.api` akan ditransformasikan oleh kedua transformer baik di `ctx.api` maupun di `bot.api`.

## Penggunaan Function Transformer

Function transformer sama fleksibelnya dengan middleware, serta penerapannya pun juga beragam.

Sebagai contoh, [plugin menu grammY](../plugins/menu) menggunakan sebuah function transformer untuk mengubah output instance menu menjadi payload yang sesuai.
Kamu juga bisa bisa menggunakannya untuk:

- Mengimplementasikan [pengaturan flood](../plugins/transformer-throttler),
- _Mock_ request API selama pengetesan,
- Mengatur [perilaku retry](../plugins/auto-retry),
- Dan lain-lain.

Namun, perlu diperhatikan bahwa mengulang kembali (retry) pemanggilan API bisa memiliki efek samping yang aneh, contohnya disaat kamu memanggil `sendDocument` dan meneruskan instance stream ke `InputFile`, maka stream akan dibaca saat pertama kali request dicoba.
Jika kamu memanggil `prev` lagi, stream tersebut mungkin sudah (sebagian) terpakai, sehingga file menjadi rusak.
Oleh karena itu, cara yang lebih baik adalah dengan meneruskan path file ke `InputFile`, sehingga grammY bisa membuat ulang stream jika diperlukan.

## Menggunakan API Flavor

grammY memiliki fitur [context flavor](../guide/context#context-flavor) yang bisa digunakan untuk mengatur type context.
Flavor juga bisa digunakan di method API, baik yang secara langsung ada di object context seperti `ctx.reply` maupun semua method di `ctx.api` dan `ctx.api.raw`.
Tetapi, kamu tidak bisa mengatur type `bot.api` dan `bot.api.raw` melalui context flavor.

Itulah kenapa grammY mendukung _API flavor_.
Ia dapat menyelesaikan permasalahan berikut:

```ts
import { Api, Bot, Context } from "grammy";
import { SomeApiFlavor, SomeContextFlavor, somePlugin } from "myPlugin";

// Buat Context flavor.
type MyContext = Context & SomeContextFlavor;
// Buat API flavor.
type MyApi = Api & SomeApiFlavor;

// Gunakan kedua flavor.
const bot = new Bot<MyContext, MyApi>("");

// Gunakan sebuah plugin.
bot.api.config.use(somePlugin());

// Sekarang panggil `bot.api` dengan type yang sudah disesuaikan dari API flavor.
bot.api.somePluginMethod();

// Gunakan juga type yang sudah disesuaikan dari context flavor.
bot.on("message", (ctx) => ctx.api.somePluginMethod());
```

API flavor berjalan sama persis seperti context flavor. Baik jenis _additive_ maupun _transformative_ juga tersedia, dan berbagai macam API flavor juga bisa dikombinasikan sama halnya dengan yang kamu lakukan dengan context flavor.
Kalau kamu belum paham bagaimana cara menggunakannya, baca kembali [materi tentang context flavor](../guide/context#context-flavor).
