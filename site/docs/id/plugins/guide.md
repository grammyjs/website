---
prev: ./
---

# Panduan Hitchhiker Menuju Plugin grammY

Jika kamu berkeinginan membuat dan mempublikasikan plugin-mu sendiri, ataupun cuma penasaran bagaimana cara kerja plugin di grammY, maka kamu berada di tempat yang tepat!

> Perlu diketahui bahwa kami sudah membuat ringkasan mengenai apa itu [plugin grammY](./) beserta fungsingya.
> Di materi kali ini kita akan membahas lebih dalam bagaimana mereka bekerja di balik layar.

## Jenis-Jenis Plugin di grammY

Terdapat dua jenis plugin utama di grammY:

- Plugin Middleware: Plugin yang bertugas mengembalikan sebuah [function middleware](../guide/middleware.md) yang akan dimanfaatkan oleh bot grammY.
- Plugin Transformer: Plugin yang bertugas mengembalikan sebuah [function transformer](../advanced/transformers.md) yang akan dimanfaatkan oleh bot grammY.

Terkadang kamu akan menemui plugin yang menggunakan kedua jenis tersebut sekaligus. Bahkan ada juga package lain yang sama sekali bukan function middleware maupun transformer, tetapi kami tetap menyebutnya sebagai plugin karena mereka memperluas fungsionalitas grammY dengan cara-cara mereka sendiri.

## Aturan untuk Berkontribusi

Kamu bisa mempublikasikan plugin-mu ke dalam salah satu kategori berikut:

- Mempublikasikan sebagai sebuah plugin **resmi**.
- Mempublikasikan sebagai sebuah plugin **pihak ketiga**.

Kalau kamu memilih untuk mempublikasikan plugin-mu sebagai plugin pihak-ketiga, maka kami bisa menyediakan kamu tempat khusus di website ini.
Tetapi, akan lebih baik jika kamu mempublikasikan plugin-mu menggunakan nama [organisasi grammyjs](https://github.com/grammyjs) di GitHub, dengan kata lain membuatnya sebagai plugin resmi.
Dengan begitu, kamu akan memperoleh hak akses untuk melakukan publikasi di GitHub dan npm.
Selain itu, kamu juga harus bertanggung jawab dalam merawat kode yang telah dibuat.

Sebelum membahas beberapa contohnya, ada beberapa aturan yang harus diperhatikan jika kamu berkeinginan agar plugin-mu terdaftar di website ini.

1. Memiliki sebuah file README di GitHub (dan npm) yang berisi instruksi **singkat dan jelas** mengenai cara penggunaannya.
2. Jelaskan apa saja manfaat dari plugin-mu serta cara penggunaannya dengan cara menambahkan sebuah halaman baru di [dokumentasi](https://github.com/grammyjs/website).
   (kami bisa membantu menambahkan halaman baru tersebut kalau kamu mengalami kesulitan).
3. Pilih lisensi terbuka seperti MIT atau ISC.

Yang terakhir, kamu perlu tahu bahwa meskipun grammY mendukung baik Node.js maupun [Deno](https://deno.land/), namun kami lebih mengutamakan proyek Deno. Oleh karena itu, kami menyarankan kamu untuk membuat plugin untuk Deno terlebih dahulu (dengan cara yang keren tentunya!).
Ada sebuah tool keren bernama [deno2node](https://github.com/wojpawlik/deno2node) yang mampu mengubah kodemu dari Deno ke Node.js, sehingga kita bisa men-support kedua platform sama baiknya.
Dukungan untuk Deno adalah syarat yang wajib untuk plugin official, sedangkan plugin pihak-ketiga tidak diwajibkan.
Terlepas dari itu semua, kami sangat menyarankan kamu untuk mencoba Deno.
Setelah mencobanya, kami yakin kamu tidak ingin berpaling darinya.

## Contoh Desain Plugin Middleware

Kali ini kita akan mendesain sebuah plugin yang hanya merespon kepada user tertentu saja.
Anggaplah, kita hanya merespon pesan user yang memiliki kata tertentu di nama depannya.
Sehingga bot akan mengabaikan user yang menggunakan nama lain.

Berikut contohnya:

```ts
// plugin.ts

// Meng-import type dari grammY (kita meng-export-nya kembali di `deps.deno.ts`).
import type { Context, Middleware, NextFunction } from "./deps.deno.ts";

// Plugin-mu harus memiliki sebuah function utama
// yang menciptakan sebuah middleware.
export function onlyAccept<C extends Context>(str: string): Middleware<C> {
  // Buat lalu kembalikan middleware-nya.
  return async (ctx, next) => {
    // Ambil nama depan user.
    const name = ctx.from?.first_name;
    // Cocokkan dengan update.
    if (name === undefined || name.includes(str)) {
      // Lanjutkan proses ke middleware hilir.
      await next();
    } else {
      // Bilang kepada user kalau kamu tidak menyukai mereka.
      await ctx.reply(
        `Aku tidak mau ngobrol denganmu! Kamu tidak peduli dengan ${str}!`,
      );
    }
  };
}
```

Kemudian, kode di atas bisa kita terapkan ke bot:

```ts
// Ingat! kode plugin kita tadi berada di sebuah file bernama `plugin.ts`.
import { onlyAccept } from "./plugin.ts";
import { Bot } from "./deps.deno.ts";

const bot = new Bot(""); // <-- taruh token bot-mu diantara ""

bot.use(onlyAccept("grammY"));

bot.on(
  "message",
  (ctx) => ctx.reply("Selamat! Kamu berhasil lolos dari plugin middleware."),
);

bot.start();
```

Tada!
Kamu berhasil membuat sebuah plugin-mu sendiri, benar?
Eits, tidak secepat itu _ferguso_!
Kita masih perlu mengemasnya ke dalam sebuah package.
Sebelum kita kemas, mari kita lihat plugin transformer terlebih dahulu.

## Contoh Desain Plugin Transformer

Bayangkan kita membuat sebuah plugin yang bisa mengirim [chat action](https://core.telegram.org/bots/api#sendchataction) secara otomatis ketika bot mengirim sebuah dokumen.
Artinya, ketika bot mengirim sebuah file, user akan melihat status "_mengirim berkas..._" di chat.
Cukup keren, bukan?

```ts
// plugin.ts
import type { Transformer } from "./deps.deno.ts";

// Function plugin utama
export function autoChatAction(): Transformer {
  // Buat lalu kembalikan sebuah function transformer.
  return async (prev, method, payload, signal) => {
    // Simpan handle set interval supaya kita bisa membersihkannya nanti.
    let handle: ReturnType<typeof setTimeout> | undefined;
    if (method === "sendDocument" && "chat_id" in payload) {
      // Kita tahu kalau sebuah dokumen sedang dikirim.
      const actionPayload = {
        chat_id: payload.chat_id,
        action: "upload_document",
      };
      // Kirim chat action terus-menerus selama file sedang dikirim.
      handle ??= setInterval(() => {
        prev("sendChatAction", actionPayload).catch(console.error);
      }, 5000);
    }

    try {
      // Jalankan method aslinya dari bot.
      return await prev(method, payload, signal);
    } finally {
      // Bersihkan interval supaya bot berhenti mengirim chat action ke user.
      clearInterval(handle);
    }
  };
}
```

Kemudian, kode di atas bisa kita terapkan ke bot:

```ts
import { Bot, InputFile } from "./deps.deno.ts";
// Kode plugin berada di sebuah file bernama `plugin.ts`
import { autoChatAction } from "./plugin.ts";

// Buat sebuah instance bot.
const bot = new Bot(""); // <-- taruh token bot-mu diantara ""

// Gunakan plugin-nya
bot.api.config.use(autoChatAction());

bot.hears("kirimkan aku sebuah dokumen kucing", async (ctx) => {
  // Jika user mengirim command ini, kita akan
  // mengirimkannya sebuah file pdf (untuk tujuan demonstrasi)
  await ctx.replyWithDocument(new InputFile("/tmp/dokumen-meong.pdf"));
});

// Mulai bot-nya
bot.start();
```

Mulai sekarang, setiap kali kita mengirim sebuah dokumen, chat action `upload_document` akan dikirimkan ke user tersebut.
Perlu dicatat bahwa ini hanya untuk tujuan demonstrasi.
Telegram merekomendasikan untuk menggunakan chat action hanya di saat "bot membutuhkan waktu yang **cukup lama** untuk menyelesaikan responnya".
Oleh karena itu, kamu tidak perlu mengirim status jika file-nya berukuran kecil, sehingga kita bisa menghemat sumber daya bot agar lebih optimal.

## Mengekstraksi Menjadi Sebuah Plugin

Apapun jenis plugin yang kamu buat, kamu harus mengemasnya menjadi sebuah package tunggal.
Ini adalah tugas yang cukup mudah.
Tidak ada aturan khusus mengenai cara melakukannya, jadi kamu bisa melakukannya sesuai keinginan dengan npm.
Tetapi, kami memiliki rekomendasi format yang bisa kamu pakai agar semuanya tertata rapi.
Kamu bisa mengunduh kodenya dari [repositori format plugin kami di GitHub](https://github.com/grammyjs/plugin-template)

Struktur folder awal yang kami sarankan:

```asciiart:no-line-numbers
plugin-template/
├─ src/
│  ├─ deps.deno.ts
│  ├─ deps.node.ts
│  └─ index.ts
├─ package.json
├─ tsconfig.json
└─ README.md
```

**`deps.deno.ts` dan `deps.node.ts`**: File untuk para developer yang ingin menulis plugin untuk Deno, kemudian mengubahnya ke Node.js.
Seperti yang sudah disebutkan sebelumnya, kita menggunakan tool `deno2node` untuk mengubah kode Deno kita menjadi Node.js.
`deno2node` memiliki fitur yang menyediakan file runtime-khusus untuk kode tersebut.
File-file tersebut harus berdampingan satu sama lain mengikuti struktur penamaan `*.deno.ts` dan `*.node.ts` seperti yang [dijelaskan di dokumentasi berikut](https://github.com/wojpawlik/deno2node#runtime-specific-code).
Itulah kenapa terdapat dua buah file: `deps.deno.ts` dan `deps.node.ts`.
Jika terdapat dependency Node.js yang lain, masukkan mereka ke dalam `deps.node.ts`, kalau tidak ada, biarkan kosong.

> **Catatan**: Kamu bisa menggunakan tool lain seperti [deno dnt](https://github.com/denoland/dnt) untuk mengubah codebase deno-mu atau untuk menggunakan struktur folder lainnya.
> Tool yang kamu pakai sama sekali tidak berpengaruh, yang terpenting adalah bagaimana kamu bisa menulis kode Deno dengan mudah dan nyaman.

**`tsconfig.json`**: Ini adalah file konfigurasi untuk compiler TypeScript yang digunakan oleh `deno2node` untuk mengonversi kodemu.
Konfigurasi bawaannya adalah seperti yang disediakan di repositori yang kami sarankan di atas.
Ia sudah sesuai dengan konfigurasi TypeScript yang digunakan oleh Deno, oleh karena itu kami menyarankan untuk tidak mengubah konfigurasinya.

**`package.json`**: File package.json untuk versi npm plugin-mu.
**Pastikan untuk mengubahnya sesuai dengan proyek yang digunakan**.

**`README.md`**: Instruksi bagaimana cara menggunakan plugin tersebut.
**Pastikan untuk mengubahnya sesuai dengan proyek yang digunakan**.

**`index.ts`**: File yang berisi alur logika plugin, misal kode utama plugin kamu.

## Boilerplate Sudah Disediakan

Kalau kamu ingin membuat plugin untuk grammY tetapi tidak tahu harus mulai dari mana, kami sangat menyarankan untuk menggunakan kode template di [repositori kami](https://github.com/grammyjs/plugin-template).
Kamu bisa meng-clone kodenya dan mulai meng-coding berdasarkan materi yang sudah dijelaskan di artikel ini.
Repositori tersebut juga berisi file-file tambahan seperti `.editorconfig`, `LICENSE`, `.gitignore`, dll, tetapi kamu bisa menghapusnya jika tidak diperlukan.

## Aku Tidak Suka Deno

Yah, sayang sekali!
Kamu juga bisa membuat plugin hanya untuk Node.js dan mempublikasikannya sebagai plugin pihak-ketiga di website ini.
Dengan kondisi tersebut, kamu bisa menggunakan struktur folder sesukamu (asalkan ditata seperti project-project npm yang lain).
Cukup instal grammY menggunakan npm melalui `npm install grammy`, lalu mulai meng-coding!

## Bagaimana Cara Mengajukannya?

Kalau kamu sudah membuat plugin-nya, kamu cuma perlu mengirim pull request di GitHub (berdasarkan [Aturan untuk Berkontribusi](#aturan-untuk-berkontribusi)), atau hubungi kami di [chat komunitas](https://t.me/grammyjs) untuk bantuan dan informasi lebih lanjut.
