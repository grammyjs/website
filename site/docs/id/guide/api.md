# API Bot

## Informasi Umum

Bot Telegram berkomunikasi dengan server Telegram melalui request HTTP.
API Bot Telegram adalah salah satu bentuk spesifikasi dari interface tersebut, contohnya sebuah [daftar panjang](https://core.telegram.org/bots/api) berbagai method dan tipe data (data type), yang biasa disebut dengan referensi atau _reference_.
API ini mendefinisikan aksi apa saja yang bisa dilakukan oleh bot Telegram.
Kamu dapat menemukannya di tab Sumber Daya (navigasi atas halaman ini) bagian Telegram.

Alurnya bisa dianalogikan seperti ini:

```asciiart:no-line-numbers
bot telegram grammY-mu <———HTTP———> API Bot <———MTProto———> Telegram
```

Singkatnya, ketika bot mengirim pesan, pesan tersebut akan dikirim sebagai request HTTP ke _server API Bot_.
Server tersebut di-hosting di `api.telegram.org`.
Server akan menerjemahkan request tadi menjadi protokol utama Telegram yang disebut MTProto, lalu meneruskannya ke backend Telegram yang bertugas mengirim pesan ke pengguna yang dituju.

Analogi yang sama juga berlaku ketika pengguna mengirim pesan ke bot, hanya saja alurnya dibalik.

Ketika hendak menjalankan bot, kamu perlu menentukan metode update yang akan digunakan ketika dikirim melalui koneksi HTTP.
Metode update tersebut bisa berupa [long polling ataupun webhooks](./deployment-types).

Kamu juga bisa meng-hosting server API Bot-mu sendiri.
Selain bisa mengurangi latensi, pengiriman file berukuran besar juga dimungkinkan dengan server tersebut.

## Memanggil API Bot

API Bot menentukan apa saja yang bisa dan tidak bisa dilakukan oleh suatu bot.
Setiap method API Bot juga identik dengan method milik grammY, dan kami selalu memastikan library ini selalui tersinkron dengan fitur-fitur utama serta terbaru untuk bot.
Contohnya, `sendMessage` baik di [Referensi API Bot Telegram](https://core.telegram.org/bots/api#sendmessage) maupun di [Referensi Api grammY](/ref/core/api#sendmessage) keduanya identik.

### Memanggil Method

Kamu dapat memanggil method API melalui `bot.api`, atau [dengan cara yang sama](./context#aksi-yang-tersedia) melalui `ctx.api`:

::: code-group

```ts [TypeScript]
import { Api, Bot } from "grammy";

const bot = new Bot("");

async function kirimHaloKe12345() {
  // Kirim pesan ke 12345.
  await bot.api.sendMessage(12345, "Halo!");

  // Kirim pesan kemudian simpan hasil responnya, yang berisi informasi mengenai pesan yang terkirim.
  const sentMessage = await bot.api.sendMessage(12345, "Halo lagi!");
  console.log(sentMessage.message_id);

  // Kirim pesan tanpa object `bot`.
  const api = new Api(""); // <-- taruh token bot diantara ""
  await api.sendMessage(12345, "Yo!");
}
```

```js [JavaScript]
const { Api, Bot } = require("grammy");

const bot = new Bot("");

async function kirimHaloKe12345() {
  // Kirim pesan ke 12345.
  await bot.api.sendMessage(12345, "Halo!");

  // Kirim pesan kemudian simpan hasil responnya, yang berisi informasi mengenai pesan yang terkirim.
  const sentMessage = await bot.api.sendMessage(12345, "Halo lagi!");
  console.log(sentMessage.message_id);

  // Kirim pesan tanpa object `bot`.
  const api = new Api(""); // <-- taruh token bot diantara ""
  await api.sendMessage(12345, "Yo!");
}
```

```ts [Deno]
import { Api, Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot("");

async function kirimHaloKe12345() {
  // Kirim pesan ke 12345.
  await bot.api.sendMessage(12345, "Halo!");

  // Kirim pesan kemudian simpan hasil responnya, yang berisi informasi mengenai pesan yang terkirim.
  const sentMessage = await bot.api.sendMessage(12345, "Halo lagi!");
  console.log(sentMessage.message_id);

  // Kirim pesan tanpa object `bot`.
  const api = new Api(""); // <-- taruh token bot diantara ""
  await api.sendMessage(12345, "Yo!");
}
```

:::

> Perlu diperhatikan, `bot.api` sebenarnya hanyalah sebuah instance `Api` yang telah disusun sedemikian rupa untuk kenyamanan kamu.
> Selain itu, jika kamu memiliki akses ke suatu object `context` (misalnya kamu sedang di dalam penangan pesan atau message handler), dianjurkan untuk memanggil `ctx.api` atau salah satu [aksi yang tersedia](./context#aksi-yang-tersedia).

Meski instance `Api` telah mencakup keseluruhan API Bot, ia terkadang mengubah sedikit _signatures function_-nya agar lebih mudah digunakan.
Sejatinya, semua method API Bot mengharapkan sebuah object JSON dengan sejumlah property tertentu.
Namun, coba perhatikan bagaimana `sendMessage` pada contoh kode di atas hanya menerima dua argument: id chat dan sebuah string.
grammY paham bahwa kedua nilai ini adalah property `chat_id` dan `text`, dari situ ia akan menyusun object JSON yang sesuai untukmu.

Seperti yang telah dijelaskan [sebelumnya](./basics#mengirim-pesan), kamu bisa menentukan opsi lain di argument ketiga type `Other`:

```ts
async function kirimHaloKe12345() {
  await bot.api.sendMessage(12345, "<i>Halo!</i>", {
    parse_mode: "HTML", // <-- opsi tambahan type `Other`
  });
}
```

Disamping itu, grammY juga menyederhanakan hal-hal teknis lainnya agar kamu bisa dengan mudah menggunakan API ini.
Sebagai contoh, beberapa property di method tertentu diharuskan melalui proses `JSON.stringify` terlebih dahulu sebelum dikirim.
Proses ini seringkali terlupakan, sulit untuk di-debug, dan dapat merusak _type interface_.
Tetapi, grammY memudahkan kamu untuk menentukan berbagai object secara konsisten di seluruh API, serta memastikan property-property tersebut sudah di-serialized di balik layar sebelum dikirim.

### Type Definition untuk API Bot

grammY memiliki cakupan type API Bot yang cukup lengkap.
Ia secara internal menggunakan type definition yang terdapat di repositori [`@grammyjs/types`](https://github.com/grammyjs/types).
Selain itu, type definition tersebut juga sudah di-export langsung dari package inti `grammy` supaya bisa digunakan di kode kamu.

#### Type Definition di Deno

Di Deno, kamu tinggal import type definition dari `types.ts`, yang mana berdampingan dengan file `mod.ts`:

```ts
import { type Chat } from "https://deno.land/x/grammy/types.ts";
```

#### Type Definition di Node.js

Di Node.js, prosesnya lebih rumit.
Kamu perlu meng-import type dari `grammy/types`.
Contohnya, untuk mengakses type `Chat`, lakukan hal berikut:

```ts
import { type Chat } from "grammy/types";
```

Namun, Node.js --- _secara resmi_ --- baru mendukung fitur import dari sub-path mulai dari versi Node.js 16.
Sehingga, kamu perlu mengubah `moduleResolution` menjadi `node16` atau `nodenext`.
Atur `tsconfig.json` dengan benar lalu tambahkan baris yang disorot berikut:

```json{4}
{
  "compilerOptions": {
    // ...
    "moduleResolution": "node16"
    // ...
  }
}
```

Terkadang ia juga bisa bekerja tanpa ada masalah meski kita tidak mengatur konfigurasi Typescript-nya terlebih dahulu.

::: warning Auto-complete Tidak Akurat di Node.js
Jika kamu tidak mengubah file `tsconfig.json` seperti yang telah dijelaskan di atas, kemungkinan besar auto-complete code editor kamu akan menyarankan untuk meng-import types dari `grammy/out/client` atau semacamnya.
**Semua path yang dimulai dengan `grammy/out` adalah file internal. Jangan digunakan!**
Karena file tersebut bisa berubah sewaktu-waktu, kami sangat menyarankan untuk meng-import dari `grammy/types`.
:::

### Membuat Panggilan Raw API

Ada kalanya kamu ingin menggunakan _function signature_ yang asli, tetapi masih ingin mengandalkan kenyamanan yang API grammY tawarkan, misalnya melakukan serialize JSON saat diperlukan.
grammY bisa melakukannya melalui property `bot.api.raw` (atau `ctx.api.raw`).

Kamu dapat memanggil method raw seperti ini:

```ts
async function sendHelloTo12345() {
  await bot.api.raw.sendMessage({
    chat_id: 12345,
    text: "<i>Halo!</i>",
    parse_mode: "HTML",
  });
}
```

Pada dasarnya, semua parameter _function signature_ dijadikan satu dengan berbagai opsi object lainnya ketika kamu menggunakan API murni (raw API).

## Memilih Lokasi Data Center

> [Lewati](./filter-queries) sisa halaman ini jika kamu baru saja memulai.

Jika kamu berniat mengurangi latensi jaringan bot, maka penting untuk menentukan lokasi hosting bot kamu.

Lokasi server API Bot `api.telegram.org` berada di Amsterdam, Belanda.
Oleh karena itu, lokasi terbaik untuk menjalankan bot kamu adalah kota Amsterdam.

::: tip Perbandingan Hosting
kamu mungkin tertarik dengan [perbandingan penyedia hosting](../hosting/comparison#tabel-perbandingan) yang telah kami buat.
:::

Meski demikian, dengan usaha yang lebih, kamu bisa menjalankan bot di lokasi lain yang lebih strategis.

[Perlu diingat](#informasi-umum) bahwa server API Bot tidak benar-benar berisi bot kamu.
Server ini hanya meneruskan request, menerjemahkan HTTP serta MTProto, dan sebagainya.
Server API Bot memang berada di Amsterdam, tetapi server Telegram didistribusikan di tiga lokasi berbeda:

- Amsterdam, Belanda
- Miami, Florida, Amerika Serikat
- Singapura

Itulah kenapa, ketika server API Bot mengirim permintaan ke server Telegram, server tersebut mungkin harus mengirimkan data di belahan dunia lain.
Apakah hal tersebut terjadi atau tidak, tergantung dari lokasi data center bot itu sendiri.
Lokasi data center bot berada di lokasi yang sama dengan data center user yang membuat bot tersebut.
Lokasi data center user sendiri ditentukan oleh banyak faktor, salah satunya adalah lokasi user --- _misalnya jika kamu membuat akun telegram di negara Indonesia, maka Telegram akan memilih data center terdekat, yakni Singapura_.

Berdasarkan informasi di atas, berikut yang dapat kamu lakukan untuk mengurangi latensi lebih jauh lagi.

1. Chat [@where_is_my_dc_bot](https://t.me/where_is_my_dc_bot) lalu kirim sebuah file yang telah diunggah dari akunmu sendiri.
   Ia akan memberi tahu lokasi data center akun kamu.
   Data center bot kamu juga akan diketahui dari proses ini karena berada di lokasi yang sama.
2. Jika data center kamu berada di Amsterdam --- _untuk user Indonesia, kemungkinan besar data center-nya berada di Singapura_ --- tidak ada yang perlu kamu lakukan.
   Jika tidak, teruslah membaca.
3. Beli [VPS](../hosting/comparison#vps) di lokasi data center kamu.
4. [Jalankan server API Bot lokal](#menjalankan-server-api-bot-lokal) di VPS tersebut.
5. Hosting bot kamu di lokasi yang sama dengan data center kamu.

Dengan begitu, setiap request akan menempuh jarak sependek mungkin antara Telegram dan bot kamu.

## Menjalankan Server API Bot Lokal

Ada dua keuntungan utama menjalankan server API Bot kamu sendiri.

1. Bot kamu dapat mengirim dan menerima file berukuran besar.
2. Waktu tunda jaringan (networking delay) dapat dikurangi (lihat [di atas](#memilih-lokasi-data-center)).

> Keuntungan kecil lainnya tercantum [di sini](https://core.telegram.org/bots/api#using-a-local-bot-api-server).

Kamu diharuskan menjalankan server API Bot di sebuah VPS.
Kalau dijalankan di tempat lain, besar kemungkinan pesan-pesan akan hilang atau bahkan crash.

Kamu juga perlu mengkompilasi server API Bot dari dasar.
Akan sangat membantu jika kamu berpengalaman dalam mengkompilasi proyek-proyek besar C++, tetapi jika tidak, kamu cukup mengikuti instruksi build yang tersedia dan berharap instruksi tersebut dapat berjalan dengan baik.

**Cara termudah untuk menjalankan server API Bot adalah dengan mengikuti [pembuat instruksi build (build instructions generator)](https://tdlib.github.io/telegram-bot-api/build.html?os=Linux) yang disediakan oleh Telegram.**

> Opsi lainnya dapat ditemukan di [repositori server API Bot](https://github.com/tdlib/telegram-bot-api#installation).

Jika server berhasil dibuat, ia akan menghasilkan sebuah program eksekusi yang dapat kamu jalankan.

Sudah mendapatkan file eksekusinya?
Sekarang kamu bisa memindahkan bot ke server API Bot lokal!

### Keluar dari Server API Bot Telegram

Pertama-tama, kamu perlu keluar dari server API Bot Telegram.
Salin URL ini lalu tempelkan ke dalam browser (jangan lupa untuk mengganti `<token>` dengan token bot kamu):

```text
https://api.telegram.org/bot<token>/logOut
```

Jika berhasil, ia akan menghasilkan `{"ok":true, "result":true}`.

### Mengonfigurasi grammY untuk Menggunakan Server API Bot Lokal

Selanjutnya, kamu bisa memberi tahu grammY untuk menggunakan server API Bot lokal kamu, alih-alih `api.telegram.org`.
Katakanlah bot kamu berjalan di `localhost`, port 8081.
Maka, konfigurasi yang digunakan adalah sebagai berikut.

```ts
const bot = new Bot("", { // <-- gunakan token yang sama seperti sebelumnya
  client: { apiRoot: "http://localhost:8081" },
});
```

Kamu bisa memulai bot-mu kembali.
Mulai sekarang, ia akan menggunakan server API Bot lokal.

> Jika terjadi error dan kamu tidak tahu cara memperbaikinya, meski sudah mencari di Google sepanjang hari, jangan sungkan untuk bergabung ke [chat komunitas grammY](https://t.me/grammyjs) dan meminta bantuan!
> Kami mungkin tidak lebih tahu penyebab error yang kamu alami, tetapi kami akan menjawab pertanyaan-pertanyaan kamu sebisa mungkin.

Jangan lupa untuk menyesuaikan kode kamu untuk bekerja dengan path file lokal, alih-alih sebuah URL yang mengarah ke berkas kamu.
Sebagai contoh, memanggil `getFile` akan memberikan kamu sebuah `file_path` yang mengarah ke disk lokal kamu, alih-alih sebuah file yang harus diunduh terlebih dahulu dari Telegram.
Demikian pula, [plugin files](../plugins/files) memiliki metode yang disebut `getUrl` yang tidak lagi mengembalikan URL, tetapi path file absolut sebagai gantinya.

Jika kamu ingin mengubah konfigurasinya lagi karena hendak memindahkan bot ke server yang berbeda, pastikan untuk membaca [bagian ini](https://github.com/tdlib/telegram-bot-api#moving-a-bot-to-a-local-server) di README repositori server API Bot.
