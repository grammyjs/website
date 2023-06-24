---
prev: false
next: false
---

# Session dan Penyimpanan Data (Built-In)

Meski kamu bisa saja menulis sendiri kode untuk melakukan koneksi ke sebuah data storage favoritmu, namun grammY sudah menyediakan sebuah skema penyimpanan praktis yang disebut dengan _session_.

> Langsung [lompat ke bawah](#cara-menggunakan-session) jika sudah tahu cara kerja session.

## Mengapa Kita Perlu Memikirkan Tempat Penyimpanan?

Berbeda dengan akun user Telegram biasa, bot memiliki [penyimpanan cloud yang terbatas](https://core.telegram.org/bots#how-are-bots-different-from-users) di Telegram cloud.
Akibatnya, ada beberapa hal yang tidak bisa kamu lakukan di bot:

1. Kamu tidak bisa mengakses pesan lama yang pernah diterima oleh bot-mu.
2. Kamu tidak bisa mengakses pesan lama yang pernah dikirim oleh bot-mu.
3. Kamu tidak bisa memperoleh daftar semua chat yang terhubung ke bot kamu.
4. Dan hal-hal lainnya, seperti tidak disediakannya media overview, dll.

Dengan kata lain, **bot hanya bisa mengakses informasi update yang datang pada saat itu saja** (misal sebuah pesan), contohnya informasi yang tersedia di object context `ctx`.

Oleh karena itu, jika kamu _ingin mengakses_ data lama, kamu perlu menyimpannya segera setelah data itu diterima.
Kamu harus memiliki sebuah data storage, misalnya di file, database, atau in-memory.

Tentu saja, grammY sudah mengantisipasinya agar kamu tidak perlu repot-repot menyiapkannya sendiri.
Kamu bisa menggunakan penyimpanan session grammY yang bisa langsung dipakai dan gratis untuk selamanya.

> Secara umum, ada banyak provider di luar sana yang menawarkan layanan data storage, dan grammY sudah terintegrasi dengan mereka tanpa ada kendala.
> Jika kamu hendak menjalankan database-mu sendiri, bisa dipastikan grammY juga mampu terintegrasi sama baiknya.
> [Gulir ke bawah](#storage-adapter-yang-tersedia) untuk melihat daftar integrasi yang tersedia.

## Apa Itu Session?

Suatu hal yang lumrah untuk sebuah bot menyimpan beberapa data dari masing-masing chat.
Contohnya, anggaplah kita ingin membuat sebuah bot yang menghitung berapa banyak pesan yang mengandung emoji :cat: di teksnya.
Bot kemudian dimasukkan ke dalam sebuah grup, dan dari sana kita bisa tahu seberapa besar kamu beserta teman-temanmu menyukai kucing.

Ketika bot kucing kita menerima sebuah pesan, ia harus mengingat sudah berapa kali ia melihat sebuah :cat: di chat tersebut sebelumnya.
Perhitungan kucingmu tentu saja tidak boleh berubah ketika temanmu menambahkan bot kucing ke grup lain, oleh karena itu yang kita butuhkan adalah menyimpan _satu perhitungan per chat_ agar perhitungan masing-masing chat tidak saling tumpang tindih.

Session mampu menyimpan data _per chat_ dengan cara yang lebih elegan.
Kamu akan menggunakan chat identifier (chat id) sebagai key di database kamu, dan hasil perhitungan sebagai value-nya.
Dari contoh di atas, kita bisa menggunakan chat identifier sebagai _session key_-nya (kamu bisa mempelajari lebih lanjut tentang session key di [bawah sini](#session-key)).
Alhasil, bot kamu akan menyimpan sebuah map chat identifier ke beberapa data session khusus, contohnya seperti ini:

```json
{
  "271828": { "hitungKucing": 18 },
  "314159": { "hitungKucing": 265 }
}
```

> Ketika kami menyebut database, kami benar-benar merujuk ke sebuah penyimpanan data, apapun bentuknya.
> Termasuk file, penyimpanan cloud, atau lainnya.

OK, keren.
Tapi, bagaimana sebenarnya cara kerja session di atas?

Kita bisa memasang middleware yang bertugas menyediakan data session dari suatu chat ke `ctx.session` untuk setiap update.
Plugin yang terpasang akan melakukan sesuatu baik sebelum maupun sesudah pemanggilan handler kita:

1. **Sebelum middleware dijalankan.**
   Plugin session mengambil dan memuat session data untuk chat terkait dari database.
   Ia menyimpan data tersebut di object context `ctx.session`.
2. **Ketika middleware dijalankan.**
   Kita bisa _membaca_ `ctx.session` untuk memeriksa value mana yang tersedia di database.
   Dari contoh di atas, jika sebuah pesan dikirim ke sebuah chat dengan identifier`314159`, ia akan menjadi `ctx.session = { hitungKucing: 265 }` ketika middleware dijalankan.
   Kita juga bisa _memodifikasi_ `ctx.session` sesuka hati, sehingga kita bisa menambah, mengubah serta menghapus field sesuai yang kita inginkan.
3. **Setelah middleware dijalankan.**
   Middleware session memastikan bahwa data berhasil ditulis kembali ke database.
   Setiap kali middleware berhasil diproses, value `ctx.session` akan disimpan kembali di database.

Sekarang, kita tidak perlu lagi memikirkan cara berkomunikasi dengan data storage.
Cukup dengan memodifikasi data di `ctx.session`, lalu plugin akan mengurus sisanya.

## Kapan Kita Perlu Session?

> [Lewati](#cara-menggunakan-session) jika kamu sudah yakin akan menggunakan session.

Kamu mungkin sekarang berpikir, "Sip! sekarang aku tidak perlu capek-capek mengatur database lagi."
Yup, kamu benar, session merupakan solusi yang ideal—untuk tipe data tertentu saja.

Berdasarkan pengalaman kami, ada beberapa situasi dimana session benar-benar berjaya.
Di sisi lain, ada situasi-situasi tertentu dimana sebuah database tradisional mungkin lebih cocok dipakai.

Berikut tabel perbandingan yang mungkin bisa membantu kamu memutuskan perlu tidaknya menggunakan session:

|                   | Sessions                                           | Database                                                                           |
| ----------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| _Akses_           | penyimpanan tunggal terisolasi **per chat**        | akses data yang sama dari **berbagai chat**                                        |
| _Berbagi_         | data **hanya digunakan oleh bot**                  | data **digunakan oleh sistem lain** (misal oleh sebuah web server yang terkoneksi) |
| _Format_          | semua object JavaScript: string, angka, array, dll | semua macam bentuk data (binary, file, struktur, dll)                              |
| _Ukuran per chat_ | sebaiknya kurang dari ~3 MB per chat               | bebas, berapa pun ukurannya                                                        |
| _Fitur eksklusif_ | Dibutuhkan oleh beberapa plugin grammY.            | Mendukung transaksi database.                                                      |

Perlu diketahui bahwa dengan memilih salah satu session/database bukan berarti beberapa hal _tidak bisa bekerja_ di session/database lain.
Contohnya, kamu tentu saja bisa menyimpan data binary dalam jumlah besar di session-mu.
Tetapi, bot kamu tidak akan mampu bekerja secara maksimal.
Oleh karena itu, kami menyarankan untuk menggunakan session sewajarnya saja.

## Cara Menggunakan Session

Kamu bisa menambahkan fitur session ke grammY menggunakan middleware session built-in.

### Contoh Penggunaan

Berikut contoh bot yang menghitung jumlah pesan yang mengandung sebuah emoji kucing :cat::

::: code-group

```ts [TypeScript]
import { Bot, Context, session, SessionFlavor } from "grammy";

// Tentukan bentuk session kita.
interface SessionData {
  hitungKucing: number;
}

// Tambahkan flavor yang berisi session ke type context.
type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>("");

// Pasang middleware session, kemudian tentukan nilai awal session.
function initial(): SessionData {
  return { hitungKucing: 0 };
}
bot.use(session({ initial }));

bot.command("meong", async (ctx) => {
  const count = ctx.session.hitungKucing;
  await ctx.reply(`Tingkat UwU kamu berada di level ${count}!`);
});

bot.hears(/.*🐱.*/, (ctx) => ctx.session.hitungKucing++);

bot.start();
```

```js [JavaScript]
const { Bot, session } = require("grammy");

const bot = new Bot("");

// Pasang middleware session, kemudian tentukan nilai awal session.
function initial() {
  return { hitungKucing: 0 };
}
bot.use(session({ initial }));

bot.command("meong", async (ctx) => {
  const count = ctx.session.hitungKucing;
  await ctx.reply(`Tingkat UwU kamu berada di level ${count}!`);
});

bot.hears(/.*🐱.*/, (ctx) => ctx.session.hitungKucing++);

bot.start();
```

```ts [Deno]
import {
  Bot,
  Context,
  session,
  SessionFlavor,
} from "https://deno.land/x/grammy/mod.ts";

// Tentukan bentuk session kita.
interface SessionData {
  hitungKucing: number;
}

// Tambahkan flavor yang berisi session ke type context.
type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>("");

// Pasang middleware session, kemudian tentukan nilai awal session.
function initial(): SessionData {
  return { hitungKucing: 0 };
}
bot.use(session({ initial }));

bot.command("meong", async (ctx) => {
  const count = ctx.session.hitungKucing;
  await ctx.reply(`Tingkat UwU kamu berada di level ${count}!`);
});

bot.hears(/.*🐱.*/, (ctx) => ctx.session.hitungKucing++);

bot.start();
```

:::

Perhatikan bahwa kita perlu [mengatur type context](../guide/context#memodifikasi-object-context) agar session tersedia di dalamnya.
Flavor context untuk session kita sebut dengan `SessionFlavor`.

### Data Awal Session

Ketika user melakukan kontak ke bot untuk yang pertama kalinya, data session masih belum tersedia untuk user tersebut.
Itulah kenapa kita perlu menentukan opsi `initial` sebagai nilai awal untuk middleware session.
Buat sebuah function yang menghasilkan object baru yang didalamnya terdapat data awal untuk chat baru.

```ts
// Buat sebuah object baru yang akan digunakan sebagai data awal session.
function createInitialSessionData() {
  return {
    hitungKucing: 0,
    // Masukkan data lainnya di sini.
  };
}
bot.use(session({ initial: createInitialSessionData }));
```

Sama tetapi lebih singkat:

```ts
bot.use(session({ initial: () => ({ hitungKucing: 0 }) }));
```

::: warning Berbagi Object
Pastikan untuk selalu membuat _object baru_.
**JANGAN** lakukan ini:

```ts
// SALAH, STOP, FATAL, BERBAHAYA, JANGAN DITIRU
const dataAwal = { hitungKucing: 0 }; // NGGAK!
bot.use(session({ initial: () => dataAwal })); // YA AMPUN!
```

Kalau kamu melakukannya, beberapa chat akan berbagi object session yang sama di memory.
Akibatnya, mengubah data session di satu chat akan mempengaruhi data session di chat lain.
:::

Kamu juga bisa mengabaikan opsi `initial`, meskipun kami menyarankan untuk tidak melakukannya.
Kalau kamu tidak menentukan opsi tersebut, pembacaan `ctx.session` akan mengakibatkan sebuah error untuk user baru.

### Session Key

> Bagian ini membahas fitur lanjutan yang untuk sebagian besar orang bisa diabaikan.
> Kamu bisa melanjutkan ke bagian [Menyimpan Data](#menyimpan-data).

Kamu bisa menentukan session key mana yang akan digunakan dengan cara memasukkan sebuah function bernama `getSessionKey` ke [opsi session](https://deno.land/x/grammy/mod.ts?s=SessionOptions#prop_getSessionKey).
Dengan begitu, kamu bisa mengubah perilaku plugin session sepenuhnya.
Secara bawaan, data disimpan per chat.
Tetapi, dengan menggunakan `getSessionKey` kamu bisa menyimpan data entah itu per user, kombinasi per user dan chat, ataupun cara lainnya.
Berikut ketiga contohnya:

::: code-group

```ts [TypeScript]
// Simpan data per chat (bawaan)
function getSessionKey(ctx: Context): string | undefined {
  // Biarkan semua user di chat grup yang sama berbagi session yang sama juga,
  // tetapi berikan session tersendiri untuk tiap user di chat pribadi
  return ctx.chat?.id.toString();
}

// Simpan data per user.
function getSessionKey(ctx: Context): string | undefined {
  // Beri setiap user penyimpanan session tersendiri
  // (menggunakan session yang sama, baik di grup maupun di chat pribadi mereka)
  return ctx.from?.id.toString();
}

// Simpan data kombinasi per user dan chat
function getSessionKey(ctx: Context): string | undefined {
  // Beri setiap user penyimpanan session tersendiri untuk masing-masing chat
  // (session tersendiri untuk setiap grup dan chat pribadi mereka)
  return ctx.from === undefined || ctx.chat === undefined
    ? undefined
    : `${ctx.from.id}/${ctx.chat.id}`;
}

bot.use(session({ getSessionKey }));
```

```js [JavaScript]
// Simpan data per chat (bawaan)
function getSessionKey(ctx) {
  // Biarkan semua user di chat grup yang sama berbagi session yang sama juga,
  // tetapi berikan session tersendiri untuk tiap user di chat pribadi
  return ctx.chat?.id.toString();
}

// Simpan data per user.
function getSessionKey(ctx) {
  // Beri setiap user penyimpanan session tersendiri
  // (menggunakan session yang sama, baik di grup maupun di chat pribadi mereka)
  return ctx.from?.id.toString();
}

// Simpan data kombinasi per user dan chat
function getSessionKey(ctx) {
  // Beri setiap user penyimpanan session tersendiri untuk masing-masing chat
  // (session tersendiri untuk setiap grup dan chat pribadi mereka)
  return ctx.from === undefined || ctx.chat === undefined
    ? undefined
    : `${ctx.from.id}/${ctx.chat.id}`;
}

bot.use(session({ getSessionKey }));
```

:::

Setiap kali `getSessionKey` mengembalikan `undefined`, `ctx.session` akan menghasilkan `undefined` juga.
Contohnya, session key resolver bawaan tidak akan bekerja untuk update `poll`/`poll_answer` ataupun `inline_query`, karena mereka bukan bagian dari sebuah chat (`ctx.chat` menghasilkan `undefined`).

::: warning Session Key dan Webhook
Ketika kamu menjalankan bot di webhook, sebaiknya kamu tidak menggunakan opsi `getSessionKey`.
Telegram mengirim webhook secara berurutan untuk setiap chat, oleh karena itu session key resolver bawaan adalah satu-satunya cara yang bisa menjamin untuk terhindar dari kehilangan data.

Jika kamu terpaksa harus menggunakan opsi tersebut (yang mana masih bisa dilakukan), kamu harus paham betul dengan tindakan yang kamu lakukan. Pastikan memahami konsekuensi menggunakan konfigurasi ini dengan membaca [materi berikut](../guide/deployment-types), khususnya [yang ini](./runner#pemrosesan-secara-berurutan-ketika-diperlukan).
:::

### Migrasi Chat

Jika kamu menggunakan session untuk grup, kamu perlu tahu bahwa dalam kondisi tertentu (misalnya [di sini](https://github.com/telegramdesktop/tdesktop/issues/5593)), Telegram akan melakukan migrasi dari grup biasa menjadi supergroup.

Meski migrasi hanya terjadi sekali untuk setiap grup, namun proses tersebut dapat menyebabkan masalah tersendiri.
Sebab secara teknis, chat yang telah dimigrasi merupakan jenis chat yang berbeda, yang memiliki identifier yang berbeda pula. Sehingga, session yang digunakan pun juga berbeda.

Hingga detik ini, kami masih belum menemukan solusi yang tepat untuk menyelesaikan permasalahan tersebut, sebab pesan dari kedua chat akan diidentifikasikan secara berbeda. Kondisi ini dapat menimbulkan data race.
Meski begitu, terdapat beberapa cara untuk mengatasi masalah ini:

- Mengabaikan masalah tersebut.
  Data untuk session bot terkait akan direset ketika sebuah grup dimigrasi.
  Sederhana, dapat diandalkan, serta memanfaatkan pengaturan default, namun dapat menimbulkan efek yang tidak diinginkan.
  Misalnya, jika migrasi terjadi ketika user sedang berada di dalam suatu percakapan yang menggunakan [plugin conversations](./conversations), percakapan tersebut juga akan ikut direset.

- Hanya menyimpanan data sementara---atau data dengan waktu yang terbatas (timeout)---di session, dan menggunakan database untuk menyimpan hal-hal penting untuk keperluan migrasi.
  Dengan begitu kamu dapat memanfaatkan transaksi dan logika khusus untuk menangani akses data chat lama dan baru secara bersamaan.
  Ini adalah cara yang paling tepat dan lebih bisa diandalkan, namun membutuhkan usaha dan performa lebih.

- Secara teori, kita bisa mencocokkan kedua chat tersebut.
  Namun, **tidak ada jaminan cara ini bisa diandalkan**.
  API Bot Telegram akan mengirim sebuah update migrasi untuk masing-masing chat ketika migrasi terjadi (lihat property `migrate_to_chat_id` atau `migrate_from_chat_id` di [dokumentasi API Telegram](https://core.telegram.org/bots/api#message)).
  Masalahnya, tidak ada jaminan kalau update tersebut dikirim sebelum pesan baru muncul di supergroup.
  Bot kamu bisa saja menerima pesan dari supergroup terlebih dahulu tanpa mengetahui kalau migrasi telah dilakukan.
  Akibatnya, ia tidak bisa mencocokkan kedua chat, yang menimbulkan masalah seperti yang telah kita bahas di atas.

- Solusi lainnya adalah memanfaatkan [filter](../guide/filter-queries) untuk membatasi bot supaya bisa digunakan di supergroup saja, atau bisa juga membatasi fitur yang terkait dengan session hanya untuk supergroup.
  Namun, kenyamanan user bisa terganggu dengan cara ini.

- Membiarkan user untuk membuat keputusan secara eksplisit, "Chat ini telah dimigrasi, apakah Anda ingin melakukan migrasi data bot-nya juga?".
  Dengan menerapkan penundaan tersebut, cara ini jauh lebih bisa diandalkan dan transparan daripada melakukan migrasi secara otomatis, namun memperburuk pengalaman pengguna (UX).

Pada akhirnya, keputusan ada pada developer untuk mengatasi permasalahan tersebut.
Karena fungsionalitas setiap bot berbeda, solusi yang dipilih bisa saja lebih baik dari lainnya.
Apabila data session hanya berumur pendek (misal menerapkan timeout sementara), proses migrasi kemungkinan besar tidak akan menjadi masalah.
Ketika proses migrasi terjadi, user hanya mengalami gangguan kecil (jika waktunya bersamaan) dan mereka cukup menjalankan ulang fitur tersebut.

Mengabaikan permasalahan ini tentu merupakan cara yang paling mudah, namun perilaku ini penting untuk diketahui.
Jika sebelumnya belum tahu, bisa jadi kamu akan kebingungan dan memakan waktu yang cukup lama untuk men-debug kode.

### Menyimpan Data

Semua data session dari contoh-contoh di atas disimpan di dalam RAM kamu, sehingga ketika bot kamu berhenti bekerja, semua data tersebut akan hilang.
Ini adalah perilaku yang diharapkan ketika kamu mengembangkan sebuah bot ataupun melakukan berbagai pengetesan secara otomatis (database tidak diperlukan).
Sebaliknya, **perilaku ini kemungkinan besar tidak kita harapkan di tahap produksi**.
Pada tahap produksi, kamu kemungkinan besar ingin menyimpan data secara permanen, contohnya di sebuah file, database, ataupun tempat penyimpanan lainnya.

Kamu harus menggunakan opsi `storage` di middleware session supaya bisa terhubung ke database kamu.
Kamu bisa menggunakan storage adapter yang disediakan oleh grammY (lihat [di bawah](#storage-adapter-yang-tersedia)), jika tidak ada yang cocok, kamu hanya perlu menulis kurang lebih lima baris kode untuk mengimplementasikannya sendiri.

## Storage Adapter yang Tersedia

Secara bawaan, session akan disimpan [di dalam memory kamu](#ram-bawaan) oleh storage adapter built-in.
Kamu juga bisa menggunakan session permanen yang grammy [sediakan secara gratis](#storage-gratis), ataupun melakukan koneksi ke [storage eksternal](#storage-eksternal).

Berikut cara memasang salah satu storage adapter yang tersedia di bawah:

```ts
const storageAdapter = ... // tergantung dari jenis pemasangan

bot.use(session({
  initial: ...
  storage: storageAdapter,
}));
```

### RAM (bawaan)

Secara bawaan semua data disimpan di dalam RAM.
Artinya, semua session akan terhapus di saat bot dihentikan.

Kamu bisa menggunakan class `MemorySessionStorage` ([Referensi API](https://deno.land/x/grammy/mod.ts?s=MemorySessionStorage)) dari package inti grammY jika kamu ingin mengatur penyimpanan data di RAM.

```ts
bot.use(session({
  initial: ...
  storage: new MemorySessionStorage() // serta value bawaannya
}));
```

### Storage Gratis

> Storage gratis diperuntukkan untuk proyek kecil.
> Pengaplikasian skala-produksi harus menggunakan database mereka sendiri.
> Daftar pilihan integrasi storage eksternal yang didukung tersedia [di bawah sini](#storage-eksternal).

Keuntungan menggunakan grammY adalah kamu bisa mengakses penyimpanan cloud secara gratis.
Ia tidak membutuhkan pengaturan sama sekali—semua autentikasi dilakukan menggunakan token bot-mu.
Lihat [repositori berikut](https://github.com/grammyjs/storages/tree/main/packages/free)!

Cara pemasangannya sangat mudah:

::: code-group

```ts [TypeScript]
import { freeStorage } from "@grammyjs/storage-free";

bot.use(session({
  initial: ...
  storage: freeStorage<SessionData>(bot.token),
}));
```

```js [JavaScript]
const { freeStorage } = require("@grammyjs/storage-free");

bot.use(session({
  initial: ...
  storage: freeStorage(bot.token),
}));
```

```ts [Deno]
import { freeStorage } from "https://deno.land/x/grammy_storages/free/src/mod.ts";

bot.use(session({
  initial: ...
  storage: freeStorage<SessionData>(bot.token),
}));
```

:::

Selesai!
Bot kamu sekarang sudah menggunakan data storage permanen.

Berikut contoh utuh yang bisa kamu coba:

::: code-group

```ts [TypeScript]
import { Bot, Context, session, SessionFlavor } from "grammy";
import { freeStorage } from "@grammyjs/storage-free";

// Tentukan struktur session-nya.
interface SessionData {
  hitung: number;
}
type MyContext = Context & SessionFlavor<SessionData>;

// Buat bot lalu masukkan middleware session.
const bot = new Bot<MyContext>("");

bot.use(session({
  initial: () => ({ hitung: 0 }),
  storage: freeStorage<SessionData>(bot.token),
}));

// Gunakan data session permanen di handler update.
bot.on("message", async (ctx) => {
  ctx.session.hitung++;
  await ctx.reply(`Jumlah pesan: ${ctx.session.hitung}`);
});

bot.catch((err) => console.error(err));
bot.start();
```

```js [JavaScript]
const { Bot, session } = require("grammy");
const { freeStorage } = require("@grammyjs/storage-free");

// Buat bot lalu masukkan middleware session.
const bot = new Bot("");

bot.use(session({
  initial: () => ({ hitung: 0 }),
  storage: freeStorage(bot.token),
}));

// Gunakan data session permanen di handler update.
bot.on("message", async (ctx) => {
  ctx.session.hitung++;
  await ctx.reply(`Jumlah pesan: ${ctx.session.hitung}`);
});

bot.catch((err) => console.error(err));
bot.start();
```

```ts [Deno]
import {
  Bot,
  Context,
  session,
  SessionFlavor,
} from "https://deno.land/x/grammy/mod.ts";
import { freeStorage } from "https://deno.land/x/grammy_storages/free/src/mod.ts";

// Tentukan struktur session-nya.
interface SessionData {
  hitung: number;
}
type MyContext = Context & SessionFlavor<SessionData>;

// Buat bot lalu masukkan middleware session.
const bot = new Bot<MyContext>("");

bot.use(session({
  initial: () => ({ hitung: 0 }),
  storage: freeStorage<SessionData>(bot.token),
}));

// Gunakan data session permanen di handler update.
bot.on("message", async (ctx) => {
  ctx.session.hitung++;
  await ctx.reply(`Jumlah Pesan: ${ctx.session.hitung}`);
});

bot.catch((err) => console.error(err));
bot.start();
```

:::

### Storage Eksternal

Kami memiliki daftar storage adapter resmi yang bisa kamu gunakan untuk menyimpan data session di berbagai tempat.
Beberapa di antaranya mengharuskan kamu untuk mendaftar di sebuah penyedia layanan hosting, ataupun meng-hosting storage-mu sendiri.

Kunjungi repository [berikut](https://github.com/grammyjs/storages/tree/main/packages#grammy-storages) untuk melihat adapter apa saja yang didukung serta mempelajari cara penggunaannya.

::: tip Storage pilihanmu belum didukung? Tidak masalah!
Membuat storage adapter sendiri sangat mudah dilakukan.
Opsi `storage` bekerja dengan berbagai object yang menganut [interface berikut](https://deno.land/x/grammy/mod.ts?s=StorageAdapter), sehingga kamu bisa melakukan koneksi ke storage-mu hanya dengan beberapa baris kode.

> Kalau kamu ingin mempublikasikan storage adapter buatanmu, silahkan ubah halaman ini dan sertakan juga link-nya agar orang-orang bisa menggunakannya.

:::

Semua storage adapter bisa diinstal dengan cara yang sama.
Pertama, kamu harus mencari tahu nama package adapter pilihanmu.
Sebagai contoh, storage adapter Supabase memiliki nama package `supabase`.

**Di Node.js**, kamu bisa menginstal adapter melalui `npm i @grammyjs/storage-<nama_adapter>`.
Misal, storage adapter Supabase bisa diinstal dengan cara `npm i @grammyjs/storage-supabase`.

**Di Deno**, semua storage adapter dipublikasikan di module Deno yang sama.
Kamu bisa meng-import adapter yang kamu butuhkan melalui `https://deno.land/x/grammy_storages/<nama_adapter>/src/mod.ts`.
Misal, storage adapter Supabase bisa di-import melalui `https://deno.land/x/grammy_storages/supabase/src/mod.ts`.

Lihat bagian pemasangan di repositori masing-masing untuk mengetahui cara menghubungkan adapter terkait ke storage pilihanmu.

Kamu juga bisa [scroll ke bawah](#peningkatan-storage) untuk mempelajari bagaimana plugin session bisa meningkatkan storage adapter.

## Multi Sessions

Plugin session mampu menyimpan beberapa fragmen data session di beberapa tempat.
Cara kerjanya mirip ketika kamu menginstal beberapa instance plugin session, bedanya untuk setiap instance-nya dipasang pengaturan yang berbeda.

Setiap fragmen data akan diberi nama sesuai dengan tempat di mana data tersebut disimpan.
Dengan begitu, kamu bisa mengakses `ctx.session.foo` dan `ctx.session.bar`.
Kedua nilai tersebut akan dimuat dari data storage yang berbeda-beda, lalu ditulis kembali ke data storage lainnya.
Selain itu, kamu juga bisa menggunakan storage yang sama menggunakan konfigurasi yang berbeda.

Penggunaan [session key](#session-key) yang berbeda untuk setiap fragmen data juga bisa dilakukan.
Sehingga, kamu bisa menyimpan beberapa data untuk setiap chat dan beberapa data lain untuk setiap user.

> Kalau kamu menggunakan [grammY runner](./runner), jangan lupa untuk mengatur `sequentialize` secara tepat dengan cara mengembalikan **semua** session key sebagai constraint dari function terkait.

Kamu bisa menggunakan fitur ini dengan cara menambahkan `type: "multi"` ke konfigurasi session.
Setelah itu, kamu perlu mengatur konfigurasi untuk setiap fragmen.

```ts
bot.use(session({
  type: "multi",
  foo: {
    // value bawaan juga tersedia
    storage: new MemorySessionStorage(),
    initial: () => undefined,
    getSessionKey: (ctx) => ctx.chat?.id.toString(),
  },
  bar: {
    initial: () => ({ prop: 0 }),
    storage: freeStorage(bot.token),
  },
  baz: {},
}));
```

Perlu diingat bahwa kamu harus menambahkan sebuah konfigurasi untuk setiap entry yang ingin kamu gunakan.
Kalau ingin menggunakan konfigurasi bawaanya, kamu bisa menambahkan sebuah object kosong (seperti yang kita lakukan pada `baz` di contoh atas).

Data session kamu nantinya tetap berisi sebuah object dengan beberapa property.
Itulah kenapa context flavor kamu tidak akan berubah.
Contoh di atas bisa menggunakan interface berikut ketika mengubah context object:

```ts
interface SessionData {
  foo?: string;
  bar: { prop: number };
  baz: { width?: number; height?: number };
}
```

Dengan begitu, kamu masih bisa menggunakan `SessionFlavor<SessionData>` di context object-mu.

## Lazy Sessions

> Bagian ini membahas optimisasi performa yang untuk sebagian besar orang bisa diabaikan.
> Silahkan lewati bagian ini jika dirasa tidak perlu.

Lazy sessions adalah salah satu bentuk implementasi dari sebuah session yang berfungsi untuk mengurangi beban database bot kamu secara signifikan dengan cara mengurangi operasi baca dan tulis yang tidak diperlukan.

Anggaplah bot kamu berada di dalam sebuah chat grup dimana ia hanya merespon command, selain itu tidak akan direspon.
Tanpa session, berikut yang akan terjadi:

1. Update yang berisi pesan baru dikirimkan ke bot kamu.
2. Tidak ada handler yang dipanggil, sehingga tidak ada aksi yang perlu dilakukan.
3. Middleware selesai dijalankan begitu saja.

Segera setelah kamu memasang session bawaan (strict), yang mana menyediakan data session di object context, berikut yang akan terjadi:

1. Update yang berisi pesan baru dikirimkan ke bot kamu
2. Data session dimuat dari penyimpanan session (misal database)
3. Tidak ada handler yang dipanggil, sehingga tidak ada aksi yang perlu dilakukan
4. Data session yang sama ditulis kembali ke penyimpanan session
5. Middleware selesai dijalankan, dan telah melakukan operasi baca serta tulis ke data storage

Perilaku tersebut tentu akan menghasilkan banyak operasi baca dan tulis yang tidak diperlukan.
Lazy Session dapat mengabaikan langkah 2 dan 4 jika memang tidak ada handler yang membutuhkan data session.
Dengan begitu, tidak ada data yang perlu dibaca maupun ditulis kembali ke data storage.

Ini bisa dilakukan dengan cara memotong akses `ctx.session`.
Jika tidak ada handler yang dipanggil, `ctx.session` tidak akan diakses.
Lazy session menggunakannya sebagai indikator untuk mencegah agar komunikasi ke database tidak dilakukan .

Dalam praktiknya, alih-alih memiliki data session di `ctx.session`, kamu sekarang akan memiliki _sebuah data session dalam bentuk promise_ yang tersedia di `ctx.session`.

```ts
// session bawaan (strict sessions)
bot.command("settings", async (ctx) => {
  // `session` adalah data session-nya
  const session = ctx.session;
});

// Lazy session
bot.command("settings", async (ctx) => {
  // `promise` adalah sebuah promise dari data session-nya, sedangkan
  const promise = ctx.session;
  // `session` adalah data session-nya
  const session = await ctx.session;
});
```

Jika kamu tidak mengakses `ctx.session` sama sekali, tidak ada operasi yang dijalankan.
Sebaliknya, di saat kamu mengakses property `session` di object context, maka operasi baca akan dijalankan.
Ketika kamu tidak melakukan operasi baca sama sekali (atau menambahkan sebuah value baru langsung ke `ctx.session`), maka kita tidak butuh melakukan operasi tulis, karena tidak ada data yang perlu diubah.
Oleh karena itu, kita bisa mengabaikan operasi tulis juga.
Hasilnya, kita bisa menghemat operasi baca dan tulis.
Selain itu, kamu bisa menggunakan session hampir sama seperti sebelumnya, bedanya kamu cuma perlu menambahkan beberapa keyword `async` dan `await` di kodemu.

Jadi, apa yang harus diperhatikan saat menggunakan lazy session alih-alih session bawaan (strict)?
Ada tiga hal yang harus kamu perhatikan:

1. Gunakan flavor `LazySessionFlavor` alih-alih `SessionFlavor` ke context-mu.
   Kedua flavor tersebut bekerja dengan cara yang sama.
   Bedanya untuk varian lazy, `ctx.session` dibungkus oleh sebuah promise.
2. Gunakan `lazySession` alih-alih `session` ketika menambahkan middleware session-mu.
3. Selalu tambahkan sebuah inline `await ctx.session` alih-alih `ctx.session` di semua tempat middleware kamu, baik untuk operasi baca maupun tulis.
   Jangan khawatir, kamu bisa `await` promise data session-mu sebanyak yang kamu mau.
   Karena kamu akan selalu merujuk ke value yang sama, maka operasi baca cukup dilakukan sekali untuk satu update, meskipun kamu memanggil `await` berkali-kali.

Perlu diketahui bahwa di lazy session, kamu bisa menambahkan baik object biasa maupun object dalam bentuk promise ke `ctx.session`.
Kalau kamu menambahkan `ctx.session` sebagai sebuah promise, maka ia akan di-`await` sebelum data ditulis kembali ke data storage.
Dengan begitu, kode berikut dapat dilakukan:

```ts
bot.command("reset", async (ctx) => {
  // Lebih singkat dibandingkan menggunakan `await ctx.session`:
  ctx.session = ctx.session.then((stats) => {
    stats.counter = 0;
  });
});
```

Meski beberapa orang berpendapat bahwa lebih disarankan untuk menggunakan `await` secara eksplisit ketika menambahkan sebuah promise ke `ctx.session`, namun intinya adalah kamu tetap _bisa_ melakukannya jika kamu lebih menyukai menulis kode dengan gaya penulisan tersebut.

::: tip Plugin-Plugin yang Membutuhkan Session
Developer plugin yang memanfaatkan `ctx.session` harus selalu memperbolehkan user untuk menambahkan `SessionFlavor | LazySessionFlavor` dan juga mendukung kedua mode.
Selalu await `ctx.session` di kode plugin: di saat sebuah object non-promise ditambahkan, object tersebut akan dievaluasi ke dirinya sendiri, jadi kamu hanya perlu menulis kode untuk lazy session dan secara otomatis ia juga akan mendukung strict session.
:::

## Peningkatan Storage

Plugin session dapat meningkatkan kemampuan storage adapter dengan cara menambahkan beberapa fitur: [timeout](#timeout) dan [migrasi](#migrasi).

Kedua fitur tersebut bisa diinstal dengan menggunakan function `enhanceStorage`.

```ts
// Gunakan storage adapter yang sudah ditingkatkan.
bot.use(session({
  storage: enhanceStorage({
    storage: freeStorage(bot.token), // jangan lupa diatur,
    // tulis konfigurasinya di sini
  }),
}));
```

Kamu juga bisa menggunakan kedua fitur secara bersamaan.

### Timeout

Fitur timeout mampu menambahkan rentang waktu kedaluwarsa ke data session.
Jika dalam kurun waktu tersebut session tidak mengalami perubahan, data untuk chat terkait akan dihapus.

Kamu bisa menggunakan session timeout melalui opsi `millisecondsToLive`.

```ts
const enhanced = enhanceStorage({
  storage,
  millisecondsToLive: 30 * 60 * 1000, // 30 menit
});
```

Perlu dicatat bahwa proses penghapusan data hanya akan dilakukan saat data session terkait dibaca di sesi berikutnya.

### Migrasi

Migrasi akan berguna di saat kamu sedang mengembangkan bot tetapi masih terdapat data session di dalamnya.
Fitur ini bisa digunakan jika kamu ingin mengubah data session tanpa merusak data-data yang sudah ada.

Ini bisa dilakukan dengan cara memberi nomor versi ke data terkait, lalu menulis function migrasi sederhana.
Function migrasi tersebut yang akan menentukan bagaimana session data di-upgrade dari satu versi ke versi yang lain.

Kita akan mengilustrasikannya dengan sebuah contoh.
Anggaplah kamu menyimpan informasi daftar hewan peliharaan dari suatu user.
Sejauh ini, kamu hanya menyimpan nama hewan peliharaanya saja dalam bentuk string array di `ctx.session.petNames`.

```ts
interface SessionData {
  petNames: string[];
}
```

Sekarang, kamu berencana untuk menyimpan umurnya juga.

Untuk melakukannya, kamu bisa melakukan ini:

```ts
interface SessionData {
  petNames: string[];
  petBirthdays?: number[];
}
```

Cara seperti ini memang tidak akan merusak data yang sudah ada.
Namun, ini bukan cara yang baik, karena nama dan tanggal lahirnya akan disimpan di tempat yang berbeda.
Semestinya data session kamu terlihat seperti ini:

```ts
interface Pet {
  name: string;
  birthday?: number;
}

interface SessionData {
  pets: Pet[];
}
```

Function migrasi bisa kamu gunakan untuk mengubah string array yang lama menjadi array object pet yang baru.

::: code-group

```ts [TypeScript]
function addBirthdayToPets(old: { petNames: string[] }): SessionData {
  return {
    pets: old.petNames.map((name) => ({ name })),
  };
}

const enhanced = enhanceStorage({
  storage,
  migrations: {
    1: addBirthdayToPets,
  },
});
```

```js [JavaScript]
function addBirthdayToPets(old) {
  return {
    pets: old.petNames.map((name) => ({ name })),
  };
}

const enhanced = enhanceStorage({
  storage,
  migrations: {
    1: addBirthdayToPets,
  },
});
```

:::

Setiap kali data session dibaca, fitur peningkatan storage akan mengecek apakah data session tersebut sudah berada di versi `1`.
Jika versinya di bawah itu (atau bahkan tidak ditemukan karena kamu sebelumnya tidak menggunakan fitur ini), maka function migrasi akan dijalankan.
Proses ini akan meningkatkan versi datanya menjadi `1`.
Oleh karena itu, kamu bisa dengan yakin mengasumsikan bahwa data session tersebut memiliki struktur yang paling baru, dan peningkatan storage terkait akan mengurus sisanya serta memigrasi data tersebut jika memang diperlukan.

Kamu bisa menambah beberapa function migrasi lain seiring dengan berkembangnya bot kamu:

```ts
const enhanced = enhanceStorage({
  storage,
  migrations: {
    1: addBirthdayToPets,
    2: addIsFavoriteFlagToPets,
    3: addUserSettings,
    10: extendUserSettings,
    10.1: fixUserSettings,
    11: compressData,
  },
});
```

Kamu bisa memilih berbagai macam penomoran sebagai versinya, selama ia berupa JavaScript number.
Tidak peduli seberapa besar data session sebuah chat telah berubah, segera setelah ia dibaca, ia akan dimigrasikan ke versi yang telah ditentukan hingga ia menggunakan struktur yang terbaru.

## Ringkasan Plugin

Plugin ini tersedia secara built-in di dalam package inti grammy.
Kamu tidak perlu memasang package tambahan untuk menggunakannya.
Cukup import yang kamu butuhkan langsung dari grammY.

Selain itu, baik referensi API maupun dokumentasinya telah dijadikan satu dengan package inti.
