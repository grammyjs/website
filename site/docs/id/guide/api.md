---
prev:
  link: ./context
next:
  link: ./filter-queries
---

# API Bot

## Informasi Umum

Bot Telegram berkomunikasi dengan server Telegram melalui HTTP request.
API Bot Telegram adalah salah satu bentuk spesifikasi dari interface tersebut. Isinya berupa [daftar panjang](https://core.telegram.org/bots/api) dari berbagai method dan data type, yang biasa disebut dengan referensi atau _reference_.
API ini mendefinisikan aksi apa saja yang bisa dilakukan oleh bot Telegram.
Kamu dapat menemukannya tertaut di tab Sumber Daya di atas halaman.

Pemasangannya bisa dianalogikan seperti ini:

```asciiart:no-line-numbers
( ( ( Telegram ) API MTProto ) API HTTP Bot ) <-- bot melakukan koneksi ke sini
```

Jadi, ketika bot mengirim pesan, pesan tersebut akan dikirim sebagai HTTP request ke _server API Bot_ (entah itu server milik tim Telegram, atau [server milikmu sendiri](https://core.telegram.org/bots/api#using-a-local-bot-api-server)).
Server ini akan menerjemahkan request tadi menjadi protokol utama Telegram yang disebut MTProto, lalu meneruskannya ke backend Telegram yang bertugas mengirim pesan ke pengguna yang dituju.

Analogi yang sama juga berlaku ketika pengguna mengirim pesan ke bot, hanya saja alurnya dibalik.

::: tip Mengatasi Limitasi Ukuran File
Backend Telegram memungkinkan bot untuk [mengirim file](./files) berukuran hingga 2000 MB.
Namun, server API Bot—yang bertanggung jawab untuk menerjemahkan request ke HTTP—membatasi ukuran file hanya sebesar 50 MB untuk unduhan dan 20 MB untuk unggahan.

Untuk menyiasati batasan tersebut, kamu bisa [meng-hosting server API Bot sendiri](https://core.telegram.org/bots/api#using-a-local-bot-api-server) supaya bot kamu bisa mengirim file dengan ukuran hingga 2000 MB.

> Catatan: Jika menangani file-file berukuran besar menggunakan [long polling](./deployment-types), kamu sebaiknya menggunakan [grammY runner](../plugins/runner).

:::

## Memanggil API Bot

Setiap method API Bot juga identik dengan method milik grammY.
Contohnya, `sendMessage` baik di [Referensi API Bot Telegram](https://core.telegram.org/bots/api#sendmessage) maupun di [Referensi Api grammY](https://deno.land/x/grammy/mod.ts?s=Api#method_sendMessage_0) keduanya sama-sama identik.

### Memanggil Method

Kamu dapat memanggil method API melalui `bot.api`, atau [dengan cara yang sama](./context#aksi-yang-tersedia) melalui `ctx.api`:

```ts
async function kirimHaloKe12345() {
  // Kirim pesan ke 12345.
  await bot.api.sendMessage(12345, "Halo!");

  // Kirim pesan kemudian simpan hasil responnya.
  // Respon tersebut berisi informasi mengenai pesan yang terkirim.
  const sentMessage = await bot.api.sendMessage(12345, "Halo lagi!");
  console.log(sentMessage.message_id);
}
```

Meskipun `bot.api` mencakup seluruh API Bot, ia terkadang mengubah sedikit _signatures function_-nya agar lebih mudah digunakan.
Sejatinya, semua method API Bot mengharapkan sebuah object JSON dengan sejumlah property tertentu.
Namun, coba perhatikan bagaimana `sendMessage` dalam contoh di atas hanya menerima dua argument: id chat dan sebuah string.
grammY paham bahwa kedua nilai ini adalah property `chat_id` dan `text`, dari situ ia akan menyusun object JSON yang sesuai untukmu.

Seperti yang telah disebutkan [sebelumnya](./basics#mengirim-pesan), kamu bisa menentukan opsi lain di argument ketiga type `Other`:

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

### Type Definition untuk API

grammY dilengkapi dengan berbagai macam type API Bot.
Repositori [`@grammyjs/types`](https://github.com/grammyjs/types) ini berisi type definition yang digunakan oleh grammY.
Type definition tersebut juga sudah di-export supaya bisa digunakan di kode kamu.

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

Namun, Node.js---secara resmi---baru mendukung fitur import dari sub-path mulai dari versi Node.js 16.
Sehingga, kamu perlu mengubah `moduleResolution` menjadi `node16` atau `nodenext`.
Atur `tsconfig.json` dengan benar lalu tambahkan baris yang disorot berikut:

```json
{
  "compilerOptions": {
    // ...
    "moduleResolution": "node16"
    // ...
  }
}
```

Terkadang ia juga bisa bekerja meski kita tidak mengatur konfigurasi Typescript-nya terlebih dahulu.

::: warning Keliru Menyetel Auto-complete

Jika kamu tidak mengubah file `tsconfig.json` seperti yang telah dijelaskan di atas, kemungkinan besar auto-complete code editor kamu akan menyarankan untuk meng-import types dari `grammy/out/client` atau semacamnya.
**Semua path yang dimulai dengan `grammy/out` adalah file internal. Jangan digunakan!**
File tersebut bisa berubah sewaktu-waktu.
Oleh karena itu, kami sangat menyarankan kamu untuk meng-import dari `grammy/types`.

:::

### Membuat Panggilan Raw API

Ada kalanya kamu ingin menggunakan _function signature_ yang asli, tetapi masih ingin mengandalkan kenyamanan yang API grammY tawarkan, misal melakukan serialize JSON saat diperlukan.
grammY bisa melakukannya melalui property `bot.api.raw` (atau `ctx.api.raw`).

Kamu dapat memanggil _raw method_ seperti ini:

```ts
async function sendHelloTo12345() {
  await bot.api.raw.sendMessage({
    chat_id: 12345,
    text: "<i>Halo!</i>",
    parse_mode: "HTML",
  });
}
```

Pada dasarnya, semua parameter _function signature_ disatukan satu dengan berbagai opsi object lainnya ketika kamu menggunakan _raw API_.
