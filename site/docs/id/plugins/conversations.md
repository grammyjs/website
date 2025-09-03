---
prev: false
next: false
---

# Percakapan (`conversations`)

Jika kamu mencari cara untuk membuat obrolan yang saling berkesinambungan, _plugin_ ini merupakan pilihan yang tepat.

Sebagai contoh, kamu ingin bot menanyakan tiga pertanyaan ke _user_:

1. menu apa yang ingin dipesan,
2. berapa jumlahnya, dan
3. di mana alamat pengirimannya.

Berikut kira-kira percakapan yang dapat dibuat:

```ascii:no-line-numbers
Bot        : "Halo, User_42069! Mau pesan apa hari ini?"
User_42069 : "Nasi goreng"
Bot        : "Baik. Berapa item yang ingin dipesan?"
User_42069 : "3"
Bot        : "Oke. Mau dikirim ke mana pesanannya?"
User_42069 : "Perumahan Komodo Blok A-1, Manggarai Barat"
Bot        : "Pesanan akan segera dikirim ke alamat tujuan!"
```

Seperti yang kita lihat, bot akan menunggu jawaban dari _user_ untuk setiap pertanyaan yang diajukan.
Kemampuan itulah yang ditawarkan oleh _plugin_ ini.

## Mulai Cepat

_Plugin_ percakapan membawa konsep baru yang tidak akan kamu temukan di belahan dunia mana pun.
Sebelum melangkah ke sana, silahkan bermain-main dengan contoh mulai cepat berikut:

:::code-group

```ts [TypeScript]
import { Bot, type Context } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";

const bot = new Bot<ConversationFlavor<Context>>(""); // <-- taruh token bot di antara "" (https://t.me/BotFather)
bot.use(conversations());

/** Buat percakapannya */
async function hello(conversation: Conversation, ctx: Context) {
  await ctx.reply("Halo! Siapa nama kamu?");
  const { message } = await conversation.waitFor("message:text");
  await ctx.reply(`Selamat datang di chat, ${message.text}!`);
}
bot.use(createConversation(hello));

bot.command("enter", async (ctx) => {
  // Masuk ke function "hello" yang telah kita buat di atas.
  await ctx.conversation.enter("hello");
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { conversations, createConversation } = require(
  "@grammyjs/conversations",
);

const bot = new Bot(""); // <-- taruh token bot di antara "" (https://t.me/BotFather)
bot.use(conversations());

/** Buat percakapannya */
async function hello(conversation, ctx) {
  await ctx.reply("Halo! Siapa nama kamu?");
  const { message } = await conversation.waitFor("message:text");
  await ctx.reply(`Selamat datang di chat, ${message.text}!`);
}
bot.use(createConversation(hello));

bot.command("enter", async (ctx) => {
  // Masuk ke function "hello" yang telah kita buat di atas.
  await ctx.conversation.enter("hello");
});

bot.start();
```

```ts [Deno]
import { Bot, type Context } from "https://deno.land/x/grammy/mod.ts";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations/mod.ts";

const bot = new Bot<ConversationFlavor<Context>>(""); // <-- taruh token bot di antara "" (https://t.me/BotFather)
bot.use(conversations());

/** Buat percakapannya */
async function hello(conversation: Conversation, ctx: Context) {
  await ctx.reply("Halo! Siapa nama kamu?");
  const { message } = await conversation.waitFor("message:text");
  await ctx.reply(`Selamat datang di chat, ${message.text}!`);
}
bot.use(createConversation(hello));

bot.command("enter", async (ctx) => {
  // Masuk ke function "hello" yang telah kita buat di atas.
  await ctx.conversation.enter("hello");
});

bot.start();
```

:::

Ketika percakapan `hello` dijalankan, berikut yang akan terjadi secara berurutan:

1. Bot mengirim pesan `Halo! Siapa nama kamu?`.
2. Bot menunggu balasan pesan teks dari _user_.
3. Bot mengirim pesan `Selamat datang di chat, (nama user)!`.
4. Percakapan berakhir.

Sekarang, mari kita lanjut ke bagian menariknya.

## Cara Kerja Plugin Percakapan

Berikut bagaimana suatu pesan ditangani menggunakan cara tradisional:

```ts
bot.on("message", async (ctx) => {
  // tangani satu pesan
});
```

Di penangan pesan biasa, kamu hanya bisa memiliki satu _context object_.

Coba bandingkan dengan percakapan:

```ts
async function hello(conversation: Conversation, ctx0: Context) {
  const ctx1 = await conversation.wait();
  const ctx2 = await conversation.wait();
  // menangani tiga pesan
}
```

Di percakapan, kamu bisa memiliki tiga _context object_!

Layaknya penangan biasa, plugin percakapan hanya menerima satu _context object_ yang berasal dari [sistem _middleware_](../guide/middleware).
Tiba-tiba, sekarang jadi tersedia tiga _context object_.
Kok bisa?

Rahasianya adalah **_function_ percakapan tidak dieksekusi selayaknya _function_ pada umumnya** (meski sebenarnya kita bisa saja memprogramnya seperti itu).

### Plugin Percakapan Ibarat Mesin Pengulang

_Function_ percakapan tidak dieksekusi selayaknya _function_ pada umumnya.

Ketika memasuki sebuah percakapan, ia hanya dieksekusi hingga pemanggilan `wait()` pertama.
_Function_ tersebut kemudian akan diinterupsi dan tidak akan dieksekusi lebih lanjut.
_Plugin_ akan mengingat bahwa `wait()` telah tercapai dan menyimpan semua informasi terkait.

Kemudian, ketika _update_ selanjutnya tiba, percakapan akan dieksekusi lagi dari awal.
Bedanya, kali ini, tidak ada pemanggilan API yang dilakukan, yang mana membuat kode kamu berjalan sangat cepat dan tidak memiliki dampak apapun.
Aksi tersebut dinamakan _replay_ atau ulang.
Setelah tiba di pemanggilan `wait()` yang telah tercapai di pemrosesan sebelumnya, pengeksekusian function dilanjutkan secara normal.

::: code-group

```ts [Masuk]
async function hello( //                      |
  conversation: Conversation, //              |
  ctx0: Context, //                           |
) { //                                        |
  await ctx0.reply("Halo!"); //               |
  const ctx1 = await conversation.wait(); //  A
  await ctx1.reply("Halo lagi!"); //
  const ctx2 = await conversation.wait(); //
  await ctx2.reply("Selamat tinggal!"); //
} //
```

```ts [Ulang]
async function hello( //                      .
  conversation: Conversation, //              .
  ctx0: Context, //                           .
) { //                                        .
  await ctx0.reply("Halo!"); //               .
  const ctx1 = await conversation.wait(); //  A
  await ctx1.reply("Halo lagi!"); //          |
  const ctx2 = await conversation.wait(); //  B
  await ctx2.reply("Selamat tinggal!"); //
} //
```

```ts [Ulang 2]
async function hello( //                      .
  conversation: Conversation, //              .
  ctx0: Context, //                           .
) { //                                        .
  await ctx0.reply("Halo!"); //               .
  const ctx1 = await conversation.wait(); //  A
  await ctx1.reply("Halo lagi!"); //          .
  const ctx2 = await conversation.wait(); //  B
  await ctx2.reply("Selamat tinggal!"); //    |
} //                                          —
```

:::

1. Ketika memasuki sebuah percakapan, _function_ akan dieksekusi hingga `A`.
2. Ketika _update_ selanjutnya tiba, _function_ akan diulang hingga `A`, lalu dieksekusi secara normal dari `A` hingga `B`.
3. Ketika _update_ terakhir tiba, _function_ akan diulang hingga `B`, lalu dieksekusi secara normal sampai akhir.

Dari ilustrasi di atas, kita tahu bahwa setiap baris kode yang ditulis akan dieksekusi beberapa kali---_sekali secara normal, dan beberapa kali selama pengulangan_.
Oleh karena itu, baik ketika dieksekusi pertama kali, maupun ketika dieksekusi berkali-kali, kode yang ditulis harus dipastikan memiliki perilaku yang sama.

Jika kamu melakukan pemanggilan API melalui `ctx.api`---_termasuk `ctx.reply`_, plugin akan menanganinya secara otomatis.
Sebaliknya, yang perlu mendapat perhatikan khusus adalah komunikasi _database_ kamu.

Berikut yang perlu diperhatikan:

### Pedoman Penggunaan

Setelah memahami [cara kerja _plugin_ percakapan](#cara-kerja-plugin-percakapan), kita akan menentukan satu aturan utama untuk kode yang berada di dalam _function_ percakapan.
Aturan ini wajib dipatuhi agar kode dapat berjalan dengan baik.

::: warning ATURAN UTAMA

**Setiap kode yang memiliki perilaku berbeda di setiap pengulangan wajib dibungkus dengan [`conversation.external`](/ref/conversations/conversation#external).**

:::

Cara penerapannya seperti ini:

```ts
// SALAH
const response = await aksesDatabase();
// BENAR
const response = await conversation.external(() => aksesDatabase());
```

Dengan membungkus sebagian kode menggunakan [`conversation.external`](/ref/conversations/conversation#external), kamu telah memberi tahu plugin bahwa kode tersebut harus diabaikan selama proses pengulangan.
Nilai kembalian kode tersebut akan disimpan oleh _plugin_, lalu digunakan kembali di pengulangan selanjutnya.
Hasilnya, berdasarkan contoh di atas, akses ke _database_ hanya akan dilakukan sekali selama proses pengulangan berlangsung.

GUNAKAN `conversation.external` untuk ...

- membaca atau menulis _file_, _database_/_session_, jaringan, atau status global (_global state_),
- memanggil `Math.random()` atau `Date.now()`,
- melakukan pemanggilan API menggunakan `bot.api` atau _instance_ `Api` independen lainnya.

JANGAN GUNAKAN `conversation.external` untuk ...

- memanggil `ctx.reply` atau [_context action_](../guide/context#aksi-yang-tersedia) lainnya,
- memanggil `ctx.api.sendMessage` atau _method_ [API Bot](https://core.telegram.org/bots/api) lain menggunakan `ctx.api`.

Selain itu, _plugin_ percakapan juga menyediakan beberapa _method_ pembantu untuk `conversation.external`.
Ia tidak hanya mempermudah penggunaan `Math.random()` dan `Date.now()`, tetapi juga mempermudah _debugging_ dengan cara menyembunyikan log selama proses pengulangan.

```ts
// await conversation.external(() => Math.random());
const rnd = await conversation.random();
// await conversation.external(() => Date.now());
const now = await conversation.now();
// await conversation.external(() => console.log("abc"));
await conversation.log("abc");
```

Pertanyaannya, kok bisa `conversation.wait` dan `conversation.external` memulihkan nilai kembalian tersebut ketika proses pengulangan berlangsung?
Pasti ia sebelumnya telah mengingat dan menyimpan nilai tersebut, bukan?

Tepat sekali!

### Percakapan Menyimpan Nilai Terkait

Percakapan menyimpan dua jenis data di _database_.
Secara bawaan, ia menggunakan _database_ ringan berbasis `Map` yang disimpan di _memory_.
Tetapi, kamu bisa dengan mudah menggunakan [_database_ permanen](#menyimpan-percakapan) jika mengehendakinya.

Berikut beberapa hal yang perlu kamu ketahui:

1. _Plugin_ percakapan menyimpan semua _update_.
2. _Plugin_ percakapan menyimpan semua nilai kembalian `conversation.external` dan hasil pemanggilan API yang dilakukan.

Segelintir update di dalam percakapan memang tidak akan menyebabkan masalah yang serius---_perlu diingat, satu pemanggilan `getUpdates` menggunakan [long polling](../guide/deployment-types) bisa mencapai 100 update_.

Namun, jika kamu tidak pernah [keluar dari suatu percakapan](#keluar-dari-percakapan), lambat laun data-data tersebut akan terus menumpuk yang mengakibatkan penurunan performa bot secara signifikan.
Oleh karena itu, **hindari pengulangan yang tidak berujung (_infinite loops_)**.

### Context Object Percakapan

Ketika suatu percakapan dieksekusi, ia menggunakan [_update_ tersimpan](#percakapan-menyimpan-nilai-terkait) untuk membuat _context object_ dari dasar.
**_Context object_ tersebut berbeda dengan _context object_ yang digunakan di [_middleware_](../guide/middleware)**.
Jika menggunakan TypeScript, kamu akan memiliki dua [varian](../guide/context#context-flavor) _context object_:

- **_Context object_ luar** merupakan _context object_ yang digunakan di _middleware_.
  Ia menyediakan akses ke `ctx.conversation.enter`.
  Untuk TypeScript, kamu perlu menyertakan `ConversationFlavor`.
  _Context object_ luar juga bisa memiliki _property_ tambahan untuk setiap _plugin_ yang diinstal melalui `bot.use`.
- **_Context object_ dalam**---_atau biasa disebut sebagai **context object percakapan**_---merupakan _context object_ yang dihasilkan oleh _plugin_ percakapan.
  Ia tidak menyediakan akses ke `ctx.conversation.enter`, dan secara bawaan, ia juga tidak menyediakan akses ke _plugin_ mana pun.
  Jika kamu ingin _context object_ dalam memiliki _property_ tersuai, silahkan [gulir ke bawah](#menggunakan-plugin-di-dalam-percakapan).

Selain itu, kedua _context type_ luar dan dalam juga perlu disertakan ke percakapan.
Kode TypeScript kamu seharusnya kurang lebih seperti ini:

::: code-group

```ts [Node.js]
import { Bot, type Context } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
} from "@grammyjs/conversations";

// Context object luar (mencakup semua plugin middleware)
type MyContext = ConversationFlavor<Context>;
// Context object dalam (mencakup semua plugin percakapan)
type MyConversationContext = Context;

// Gunakan context type luar untuk bot.
const bot = new Bot<MyContext>("");

// Gunakan kedua type luar dan dalam untuk percakapan.
type MyConversation = Conversation<MyContext, MyConversationContext>;

// Buat percakapannya.
async function example(
  conversation: MyConversation,
  ctx0: MyConversationContext,
) {
  // Semua context object di dalam percakapan
  // memiliki type `MyConversationContext`.
  const ctx1 = await conversation.wait();

  // Context object luar dapat diakses
  // melalui `conversation.external` dan
  // telah dikerucutkan menjadi type `MyContext`.
  const session = await conversation.external((ctx) => ctx.session);
}
```

```ts [Deno]
import { Bot, type Context } from "https://deno.land/x/grammy/mod.ts";
import {
  type Conversation,
  type ConversationFlavor,
} from "https://deno.land/x/grammy_conversations/mod.ts";

// Context object luar (mencakup semua plugin middleware)
type MyContext = ConversationFlavor<Context>;
// Context object dalam (mencakup semua plugin percakapan)
type MyConversationContext = Context;

// Gunakan context type luar untuk bot.
const bot = new Bot<MyContext>("");

// Gunakan kedua type luar dan dalam untuk percakapan.
type MyConversation = Conversation<MyContext, MyConversationContext>;

// Buat percakapannya.
async function example(
  conversation: MyConversation,
  ctx0: MyConversationContext,
) {
  // Semua context object di dalam percakapan
  // memiliki type `MyConversationContext`.
  const ctx1 = await conversation.wait();

  // Context object luar dapat diakses
  // melalui `conversation.external` dan
  // telah dikerucutkan menjadi type `MyContext`.
  const session = await conversation.external((ctx) => ctx.session);
}
```

:::

> Kode di atas tidak mencontohkan adanya _plugin_ yang terinstal di percakapan.
> Namun, ketika kamu [menginstalnya](#menggunakan-plugin-di-dalam-percakapan), `MyConversationContext` tidak akan lagi berupa _type_ `Context` dasar.

Dengan demikian, setiap percakapan bisa memiliki variasi _context type_ yang berbeda-beda sesuai dengan keinginan.

Selamat!
Jika kamu dapat memahami semua materi di atas dengan lancar, bagian tersulit dari panduan ini telah berhasil kamu lewati.
Selanjunya, kita akan membahas fitur-fitur yang ditawarkan oleh _plugin_ ini.

## Memasuki Percakapan

Kamu bisa memasuki suatu percakapan melalui penangan biasa.

Secara bawaan, nama suatu percakapan akan identik dengan [nama _function_](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name)-nya.
Kamu bisa mengganti nama tersebut ketika menginstalnya ke bot.

Percakapan juga bisa menerima beberapa _argument_.
Tetapi ingat, _argument_ tersebut akan disimpan dalam bentuk _string_ JSON.
Artinya, kamu perlu memastikan ia dapat diproses oleh [`JSON.stringify`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify).

Selain itu, kamu juga bisa memasuki sebuah percakapan dari percakapan lain dengan cara memanggil _function_ JavaScript biasa.
_Function_ tersebut nantinya dapat mengakses nilai kembalian percakapan yang dipanggil tersebut.
Akan tetapi, akses yang sama tidak bisa didapatkan jika kamu memasuki percakapan dari dalam _middleware_.

:::code-group

```ts [TypeScript]
/**
 * Nilai kembalian function JavaScript berikut
 * hanya bisa diakses ketika percakapan ini
 * dipanggil dari percakapan lainnya.
 */
async function jokesBapakBapak(conversation: Conversation, ctx: Context) {
  await ctx.reply("Kota apa yang warganya bapak-bapak semua?");
  return "Purwo-daddy";
}
/**
 * Function berikut menerima dua argument: `answer` dan `config`.
 * Semua argument wajib berupa tipe yang bisa diubah ke JSON.
 */
async function percakapan(
  conversation: Conversation,
  ctx: Context,
  answer: string,
  config: { text: string },
) {
  const jawaban = await jokesBapakBapak(conversation, ctx);
  if (answer === jawaban) {
    await ctx.reply(jawaban);
    await ctx.reply(config.text);
  }
}
/**
 * Ubah nama function `jokesBapakBapak` menjadi `tebak-receh`.
 */
bot.use(createConversation(jokesBapakBapak, "tebak-receh"));
bot.use(createConversation(percakapan));

/**
 * Command berikut hanya akan memberi tebakan
 * tanpa memberi tahu jawabannya.
 */
bot.command("tebak", async (ctx) => {
  await ctx.conversation.enter("tebak-receh");
});
/**
 * Command berikut akan memberi tebakan
 * sekaligus memberi tahu jawabannya.
 */
bot.command("tebak_jawab", async (ctx) => {
  /**
   * Untuk menyerderhanakan contoh kode,
   * kita menginput kedua argument secara statis,
   * yaitu `Purwo-daddy` dan `{ text: "Xixixi..." }`.
   *
   * Untuk kasus tebak-tebakan ini
   * mungkin akan jauh lebih menarik
   * jika argument tersebut dibuat dinamis.
   * Misalnya, argument pertama ("Purwo-daddy")
   * dapat diganti dengan jawaban user.
   *
   * Selamat bereksperimen!
   */
  await ctx.conversation.enter("percakapan", "Purwo-daddy", {
    text: "Xixixi...",
  });
});
```

```js [JavaScript]
/**
 * Nilai kembalian function JavaScript berikut
 * hanya bisa diakses ketika percakapan ini
 * dipanggil dari percakapan lainnya.
 */
async function jokesBapakBapak(conversation, ctx) {
  await ctx.reply("Kota apa yang warganya bapak-bapak semua?");
  return "Purwo-daddy";
}
/**
 * Function berikut menerima dua argument: `answer` dan `config`.
 * Semua argument wajib berupa tipe yang bisa diubah ke JSON.
 */
async function percakapan(conversation, ctx, answer, config) {
  const jawaban = await jokesBapakBapak(conversation, ctx);
  if (answer === jawaban) {
    await ctx.reply(jawaban);
    await ctx.reply(config.text);
  }
}
/**
 * Ubah nama function `jokesBapakBapak` menjadi `tebak-receh`.
 */
bot.use(createConversation(jokesBapakBapak, "tebak-receh"));
bot.use(createConversation(percakapan));

/**
 * Command berikut hanya akan memberi tebakan
 * tanpa memberi tahu jawabannya.
 */
bot.command("tebak", async (ctx) => {
  await ctx.conversation.enter("tebak-receh");
});
/**
 * Command berikut akan memberi tebakan
 * sekaligus memberi tahu jawabannya.
 */
bot.command("tebak_jawab", async (ctx) => {
  /**
   * Untuk menyerderhanakan contoh kode,
   * kita menginput kedua argument secara statis,
   * yaitu `Purwo-daddy` dan `{ text: "Xixixi..." }`.
   *
   * Untuk kasus tebak-tebakan ini
   * mungkin akan jauh lebih menarik
   * jika argument tersebut dibuat dinamis.
   * Misalnya, argument pertama ("Purwo-daddy")
   * dapat diganti dengan jawaban user.
   *
   * Selamat bereksperimen!
   */
  await ctx.conversation.enter("percakapan", "Purwo-daddy", {
    text: "Xixixi...",
  });
});
```

:::

::: warning Type Safety untuk Argument

Pastikan _parameter_ percakapan kamu menggunakan _type_ yang sesuai, dan _argument_ yang diteruskan ke pemanggilan `enter` cocok dengan _type_ tersebut.
_Plugin_ percakapan tidak dapat melakukan pengecekan _type_ di luar `conversation` dan `ctx`.

:::

Perlu diperhatikan bahwa [urutan _middleware_ akan berpengaruh](../guide/middleware).
Suatu percakapan hanya bisa dimasuki jika ia diinstal sebelum penangan melakukan pemanggilan `enter`.

## Menunggu Update

Tujuan pemanggilan `wait` yang paling dasar adalah menunggu _update_ selanjutnya tiba.

```ts
const ctx = await conversation.wait();
```

Ia mengembalikan sebuah _context object_.
Semua pemanggilan `wait` memiliki konsep dasar ini.

### Memilah Pemanggilan `wait`

Jika kamu ingin menunggu jenis _update_ tertentu, kamu bisa menerapkan pemilahan ke pemanggilan `wait`.

```ts
// Pilah layaknya filter query di `bot.on`
const message = await conversation.waitFor("message");
// Pilah pesan teks layaknya `bot.hears`.
const hears = await conversation.waitForHears(/regex/);
// Pilah command layaknya `bot.command`.
const start = await conversation.waitForCommand("start");
// Dan sebagainya...
```

Silahkan lihat referensi API berikut untuk mengetahui [semua metode yang tersedia untuk memilah pemanggilan `wait`](/ref/conversations/conversation#wait).

Pemanggilan `wait` terpilah memastikan _update_ yang diterima sesuai dengan filter yang diterapkan.
Jika bot menerima sebuah _update_ yang tidak sesuai, update tersebut akan diabaikan begitu saja.
Untuk mengatasinya, kamu bisa menginstal sebuah _callback function_ agar _function_ tersebut dipanggil ketika _update_ yang diterima tidak sesuai.

```ts
const message = await conversation.waitFor(":photo", {
  otherwise: (ctx) =>
    ctx.reply("Maaf, saya hanya bisa menerima pesan berupa foto."),
});
```

Semua pemanggilan `wait` terpilah bisa saling dirangkai untuk memilah beberapa hal sekaligus.

```ts
// Pilah foto yang mengandung keterangan "Indonesia"
let photoWithCaption = await conversation.waitFor(":photo")
  .andForHears("Indonesia");
// Tangani setiap pemilahan menggunakan function `otherwise`
// yang berbeda:
photoWithCaption = await conversation
  .waitFor(":photo", {
    otherwise: (ctx) => ctx.reply("Mohon kirimkan saya sebuah foto!"),
  })
  .andForHears("Indonesia", {
    otherwise: (ctx) =>
      ctx.reply('Keterangan foto selain "Indonesia" tidak diperbolehkan.'),
  });
```

Jika kamu menerapkan `otherwise` ke salah satu pemanggilan `wait` saja, ia hanya akan dipanggil untuk filter tersebut.

### Memeriksa Context Object

[Mengurai](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring) _context object_ merupakan hal yang cukup umum untuk dilakukan.
Dengan melakukan penguraian, kamu bisa melakukan pengecekan secara mendalam untuk setiap data yang diterima.

```ts
const { message } = await conversation.waitFor("message");
if (message.photo) {
  // Tangani pesan foto
}
```

Sebagai tambahan, percakapan juga merupakan tempat yang ideal untuk melakukan pengecekan menggunakan [has-checks](../guide/context#pemeriksaan-melalui-has-checks).

## Keluar dari Percakapan

Cara paling mudah untuk keluar dari suatu percakapan adalah dengan melakukan `return`.
Selain itu, percakapan juga bisa dihentikan dengan melempar sebuah _error_.

Jika cara di atas masih belum cukup, kamu bisa secara paksa menghentikan suatu percakapan menggunakan `halt`:

```ts
async function convo(conversation: Conversation, ctx: Context) {
  // Semua percabangan berikut mencoba keluar dari percakapan:
  if (ctx.message?.text === "return") {
    return;
  } else if (ctx.message?.text === "error") {
    throw new Error("ERROR!");
  } else {
    await conversation.halt(); // tidak akan pernah mengembalikan nilai (return)
  }
}
```

Kamu juga bisa keluar dari suatu percakapan dari dalam _middleware_:

```ts
bot.use(conversations());
bot.command("keluar", async (ctx) => {
  await ctx.conversation.exit("convo");
});
```

Cara-cara di atas bisa dilakukan bahkan **sebelum** percakapan yang ditarget diinstal ke sistem _middleware_.
Dengan kata lain, hanya dengan menginstal _plugin_ percakapan itu sendiri, kamu bisa melakukan hal-hal di atas.

## Percakapan Hanyalah Sebuah JavaScript

Setelah [efek samping](#pedoman-penggunaan) teratasi, percakapan hanyalah sebuah _function_ JavaScript biasa.
Meski alur kerjanya terlihat aneh, biasanya ketika mengembangkan sebuah bot, kita akan dengan mudah mengabaikannya.
Semua _syntax_ JavaScript biasa dapat ia proses dengan baik.

Semua hal yang dibahas di bagian selanjutnya cukup lazim jika kamu terbiasa menggunakan percakapan.
Namun, jika masih awam, beberapa hal berikut akan terdengar asing.

### Variable, Percabangan, dan Perulangan

Kamu bisa menggunakan _variable_ biasa untuk menyimpan suatu nilai/status di antara setiap _update_.
Percabangan menggunakan `if` atau `switch` juga bisa dilakukan.
Hal yang sama juga berlaku untuk perulangan `for` dan `while`.

```ts
await ctx.reply(
  "Kirim semua nomor favoritmu! Pisah setiap nomor dengan tanda koma!",
);
const { message } = await conversation.waitFor("message:text");
const numbers = message.text.split(",");
let jumlah = 0;
for (const str of numbers) {
  const n = parseInt(str.trim(), 10);
  if (!isNaN(n)) {
    jumlah += n;
  }
}
await ctx.reply("Jumlah nomor-nomor tersebut adalah " + jumlah);
```

Lihat?
Ia hanyalah sebuah JavaScript, bukan?

### Function dan Rekursif

Kamu bisa membagi suatu percakapan menjadi beberapa _function_.
Mereka dapat memanggil satu sama lain atau bahkan melakukan rekursif (memanggil dirinya sendiri).
Malahan, _plugin_ percakapan tidak tahu kalau kamu telah menggunakan sebuah _function_.

Berikut kode yang sama seperti di atas, tetapi di-_refactor_ menjadi beberapa _function_:

:::code-group

```ts [TypeScript]
/** Percakapan untuk menghitung jumlah semua angka */
async function sumConvo(conversation: Conversation, ctx: Context) {
  await ctx.reply(
    "Kirim semua nomor favoritmu! Pisah setiap nomor dengan tanda koma!",
  );
  const { message } = await conversation.waitFor("message:text");
  const numbers = message.text.split(",");
  await ctx.reply("Jumlah nomor-nomor tersebut adalah " + sumStrings(numbers));
}

/** Konversi semua string menjadi angka, lalu hitung jumlahnya */
function sumStrings(numbers: string[]): number {
  let jumlah = 0;
  for (const str of numbers) {
    const n = parseInt(str.trim(), 10);
    if (!isNaN(n)) {
      jumlah += n;
    }
  }
  return jumlah;
}
```

```js [JavaScript]
/** Percakapan untuk menghitung jumlah semua angka */
async function sumConvo(conversation, ctx) {
  await ctx.reply(
    "Kirim semua nomor favoritmu! Pisah setiap nomor dengan tanda koma!",
  );
  const { message } = await conversation.waitFor("message:text");
  const numbers = message.text.split(",");
  await ctx.reply("Jumlah nomor-nomor tersebut adalah " + sumStrings(numbers));
}

/** Konversi semua string menjadi angka, lalu hitung jumlahnya */
function sumStrings(numbers) {
  let jumlah = 0;
  for (const str of numbers) {
    const n = parseInt(str.trim(), 10);
    if (!isNaN(n)) {
      jumlah += n;
    }
  }
  return jumlah;
}
```

:::

Sekali lagi, ia hanyalah sebuah JavaScript.

### Module dan Class

JavaScript memiliki _higher-order function_, _class_, serta metode-metode lain untuk mengubah struktur kode menjadi beberapa _module_.
Umumnya, mereka semua bisa diubah menjadi percakapan.

Sekali lagi, berikut kode yang sama seperti di atas, tetapi di-_refactor_ menjadi sebuah _module_ sederhana:

::: code-group

```ts [TypeScript]
/**
 * Module untuk menjumlahkan semua angka yang diberikan
 * oleh user.
 *
 * Penangan percakapan harus disematkan agar module
 * dapat dijalankan.
 */
function sumModule(conversation: Conversation) {
  /** Konversi semua string menjadi angka, lalu hitung jumlahnya */
  function sumStrings(numbers) {
    let jumlah = 0;
    for (const str of numbers) {
      const n = parseInt(str.trim(), 10);
      if (!isNaN(n)) {
        jumlah += n;
      }
    }
    return jumlah;
  }

  /** Minta user untuk mengirim semua nomor favoritnya */
  async function askForNumbers(ctx: Context) {
    await ctx.reply(
      "Kirim semua nomor favoritmu! Pisah setiap nomor dengan tanda koma!",
    );
  }

  /** Tunggu user mengirim nomor-nomornya, lalu balas dengan jumlah semua nomor tersebut */
  async function sumUserNumbers() {
    const ctx = await conversation.waitFor(":text");
    const jumlah = sumStrings(ctx.msg.text);
    await ctx.reply("Jumlah nomor-nomor tersebut adalah " + jumlah);
  }

  return { askForNumbers, sumUserNumbers };
}

/** Percakapan untuk menjumlahkan semua nomor */
async function sumConvo(conversation: Conversation, ctx: Context) {
  const mod = sumModule(conversation);
  await mod.askForNumbers(ctx);
  await mod.sumUserNumbers();
}
```

```js [JavaScript]
/**
 * Module untuk menjumlahkan semua angka yang diberikan
 * oleh user.
 *
 * Penangan percakapan harus disematkan agar module
 * dapat dijalankan.
 */
function sumModule(conversation: Conversation) {
  /** Konversi semua string menjadi angka, lalu hitung jumlahnya */
  function sumStrings(numbers) {
    let jumlah = 0;
    for (const str of numbers) {
      const n = parseInt(str.trim(), 10);
      if (!isNaN(n)) {
        jumlah += n;
      }
    }
    return jumlah;
  }

  /** Minta user untuk mengirim semua nomor favoritnya */
  async function askForNumbers(ctx: Context) {
    await ctx.reply("Kirim semua nomor favoritmu! Pisah setiap nomor dengan tanda koma!");
  }

  /** Tunggu user mengirim nomor-nomornya, lalu balas dengan jumlah semua nomor tersebut */
  async function sumUserNumbers() {
    const ctx = await conversation.waitFor(":text");
    const sum = sumStrings(ctx.msg.text);
    await ctx.reply("Jumlah nomor-nomor tersebut adalah: " + sum);
  }

  return { askForNumbers, sumUserNumbers };
}

/** Percakapan untuk menjumlahkan semua nomor */
async function sumConvo(conversation: Conversation, ctx: Context) {
  const mod = sumModule(conversation);
  await mod.askForNumbers(ctx);
  await mod.sumUserNumbers();
}
```

:::

Meski terlihat berlebihan untuk tugas sesederhana menjumlahkan nomor, namun kamu bisa menangkap secara garis besar konsep yang kami maksud.

Yup, kamu benar, ia hanyalah sebuah JavaScript.

## Menyimpan Percakapan

Secara bawaan, semua data yang disimpan oleh _plugin_ percakapan disimpan di dalam _memory_.
Artinya, ketika _memory_ tersebut dimatikan, semua proses akan keluar dari percakapan, sehingga mau tidak mau harus dimulai ulang.

Jika ingin menyimpan data-data tersebut ketika _server_ dimulai ulang, kamu harus mengintegrasikan _plugin_ percakapan ke sebuah _database_.
Kami telah membuat [berbagai jenis _storage adapter_](https://github.com/grammyjs/storages/tree/main/packages#grammy-storages) untuk mempermudah pengintegrasian tersebut.
Mereka semua menggunakan _adapter_ yang sama yang digunakan oleh [_plugin session_](./session#storage-adapter-yang-tersedia).

Katakanlah kamu hendak menyimpan data terkait ke sebuah _file_ bernama `data-percakapan` ke dalam direktori di sebuah diska.
Berarti, kamu memerlukan [`FileAdapter`](https://github.com/grammyjs/storages/tree/main/packages/file#installation).

::: code-group

```ts [Node.js]
import { FileAdapter } from "@grammyjs/storage-file";

bot.use(conversations({
  storage: new FileAdapter({ dirName: "data-percakapan" }),
}));
```

```ts [Deno]
import { FileAdapter } from "https://deno.land/x/grammy_storages/file/src/mod.ts";

bot.use(conversations({
  storage: new FileAdapter({ dirName: "data-percakapan" }),
}));
```

:::

Selesai!

Semua jenis _storage adapter_ bisa digunakan asalkan ia mampu menyimpan data berupa [`VersionedState`](/ref/conversations/versionedstate) dari [`ConversationData`](/ref/conversations/conversationdata).
Kedua _type_ tersebut dapat di-_import_ dari _plugin_ percakapan secara langsung.
Dengan kata lain, jika kamu ingin menempatkan _storage_ tersebut ke sebuah _variable_, kamu bisa melakukannya menggunakan _type_ berikut:

```ts
const storage = new FileAdapter<VersionedState<ConversationData>>({
  dirName: "data-percakapan",
});
```

Secara umum, _type_ yang sama juga bisa diterapkan ke _storage adapter_ lainnya.

### Membuat Versi Data

Jika status percapakan disimpan di sebuah _database_, lalu di kemudian hari kamu mengubah kode sumber bot, dapat dipastikan akan terjadi ketidakcocokan antara data yang tersimpan dengan _function_ percakapan yang baru.
Akibatnya, data tersebut menjadi korup sehingga [pengulangan](#plugin-percakapan-ibarat-mesin-pengulang) tidak dapat berjalan sebagaimana mestinya.

Kamu bisa mengatasi permasalahan tersebut dengan cara menyematkan versi kode.
Setiap kali percakapan diubah, versi kode tersebut akan ditambahkan.
Dengan begitu, ketika _plugin_ percakapan mendeteksi ketidakcocokan versi, ia secara otomatis akan memigrasi semua data terkait.

```ts
bot.use(conversations({
  storage: {
    type: "key",
    version: 42, // bisa berupa angka atau string
    adapter: storageAdapter,
  },
}));
```

Jika versi tidak ditentukan, secara bawaan ia akan bernilai `0`.

::: tip Lupa Mengganti Versinya? Jangan Khawatir!

_Plugin_ percakapan dilengkapi dengan proteksi untuk menangani skenario-skenario penyebab data terkorupsi.
Jika terdeteksi, sebuah _error_ akan dilempar dari dalam percakapan terkait, sehingga percakapan tersebut mengalami _crash_.

Selama _error_ tersebut tidak ditangkap dan diredam, percakapan dengan sendirinya akan menghapus data yang tidak sesuai dan memulai ulang dengan benar.

Ingat, proteksi ini tidak mencakup semua skenario.
Oleh karena itu, di kesempatan selanjutnya, kamu harus memastikan nomor versi diperbarui dengan benar.

:::

### Data yang Tidak Dapat Di-serialize

::: info Catatan Terjemahan

Kami tidak menemukan terjemahan yang tepat untuk _serialize_.
Oleh karena itu, istilah tersebut ditulis seperti apa adanya.

Istilah _serialize_ sendiri adalah proses mengubah struktur suatu data menjadi format yang dapat disimpan.
Dalam konteks ini, data akan diubah menjadi format JSON.

:::

Seperti yang telah kita ketahui, semua data yang dikembalikan dari [`conversation.external`](/ref/conversations/conversation#external) akan [disimpan](#percakapan-menyimpan-nilai-terkait).
Oleh karena itu, data-data tersebut harus berupa tipe yang bisa di-_serialize_.

```ts
const largeNumber = await conversation.external({
  // Memanggil sebuah API yang mengembalikan sebuah BigInt (tidak bisa diubah menjadi JSON).
  task: () => 1000n ** 1000n,
  // Sebelum disimpan, konversi bigint menjadi string.
  beforeStore: (n) => String(n),
  // Sebelum digunakan, kembalikan string menjadi bigint.
  afterLoad: (str) => BigInt(str),
});
```

Jika ingin melempar sebuah _error_ dari `task`, kamu bisa menyematkan _function serialize_ tambahan untuk _object error_.
Coba lihat [`ExternalOp`](/ref/conversations/externalop) di referensi API.

### Kunci Penyimpanan

::: info Catatan Terjemahan

Istilah _kunci_ yang digunakan di sini bukan dalam artian mengunci data menggunakan kata sandi atau semacamnya, melainkan merujuk ke terjemahan _key_ untuk _storage keys_, sebuah tanda identifikasi untuk setiap data di suatu penyimpanan.

:::

Secara bawaan, data percakapan disimpan menggunakan setiap _chat_ sebagai kunci penyimpanannya.
Perilaku tersebut identik dengan [cara kerja _plugin session_](./session#session-key).

Karenanya, suatu percakapan tidak dapat menangani _update_ dari berbagai _chat_.
Jika tidak menghendaki perilaku tersebut, kamu bisa [membuat _function_ kunci penyimpananmu sendiri](/ref/conversations/conversationoptions#storage).
Untuk _session_, kami tidak merekomendasikan untuk menggunakan opsi tersebut di _serverless_ karena berpotensi menyebabkan tumpang tindih (_race conditions_).

Selain itu, sama seperti _session_, kamu bisa menyimpan data percakapan menggunakan awalan tertentu menggunakan opsi `prefix`.
Ia akan berguna jika kamu hendak menggunakan _storage adapter_ yang sama untuk data _session_ dan data percakapan.
Dengan menggunakan awalan, data tidak akan saling berbenturan karena nama yang identik.

Berikut caranya:

```ts
bot.use(conversations({
  storage: {
    type: "key",
    adapter: storageAdapter,
    getStorageKey: (ctx) => ctx.from?.id.toString(),
    prefix: "convo-",
  },
}));
```

Jika _user_ dengan ID `424242` memasuki sebuah percakapan, kunci penyimpanannya akan menjadi `convo-424242`.

Silahkan lihat referensi API [`ConversationStorage`](/ref/conversations/conversationstorage) untuk memahami lebih detail mengenai penyimpanan data menggunakan _plugin_ percakapan.
Detail yang dijelaskan di antaranya termasuk cara menyimpan data menggunakan `type: "context"` sehingga _function_ kunci penyimpanan tidak lagi diperlukan.

## Menggunakan Plugin di Dalam Percakapan

[Sebelumnya](#context-object-percakapan), kita telah membahas mengenai _context object_ yang digunakan oleh percakapan berbeda dengan _context object_ yang digunakan oleh _middleware_.
Artinya, meski suatu _plugin_ telah diinstal ke bot, namun ia tidak akan terinstal untuk percakapan.

Untungnya, semua _plugin_ grammY [selain _session_](#mengakses-session-di-dalam-percakapan) kompatibel dengan percakapan.
Berikut contoh cara menginstal [_plugin_ hidrasi](./hydrate) ke percakapan:

::: code-group

```ts [TypeScript]
// Instal plugin percakapan untuk lingkup luar saja.
type MyContext = ConversationFlavor<Context>;
// Instal plugin hidrasi untuk lingkup dalam saja.
type MyConversationContext = HydrateFlavor<Context>;

bot.use(conversations());

// Sertakan context object luar dan dalam.
type MyConversation = Conversation<MyContext, MyConversationContext>;
async function convo(conversation: MyConversation, ctx: MyConversationContext) {
  // Plugin hidrasi terinstal untuk paramater `ctx` di dalam sini.
  const other = await conversation.wait();
  // Plugin hidrasi juga terinstal untuk variable `other` di dalam sini.
}
bot.use(createConversation(convo, { plugins: [hydrate()] }));

bot.command("enter", async (ctx) => {
  // Plugin hidrasi TIDAK terinstal untuk `ctx` di dalam sini.
  await ctx.conversation.enter("convo");
});
```

```js [JavaScript]
bot.use(conversations());

async function convo(conversation, ctx) {
  // Plugin hidrasi terinstal untuk paramater `ctx` di dalam sini.
  const other = await conversation.wait();
  // Plugin hidrasi juga terinstal untuk variable `other` di dalam sini.
}
bot.use(createConversation(convo, { plugins: [hydrate()] }));

bot.command("enter", async (ctx) => {
  // Plugin hidrasi TIDAK terinstal untuk `ctx` di dalam sini.
  await ctx.conversation.enter("convo");
});
```

:::

Di [_middleware_](../guide/middleware) biasa, _plugin_ akan menggunakan _context object_ yang tersedia untuk menjalankan kode terkait.
Kemudian, ia akan memanggil `next` untuk menunggu _middleware_ yang ada di hilir selesai, lalu dilanjut dengan menjalankan kode yang tersisa.

Tetapi, hal tersebut tidak berlaku untuk percakapan karena ia bukanlah sebuah _middleware_.
Artinya, _plugin_ juga tidak dapat berinteraksi dengan percakapan selayaknya _middleware_.

[_Context object_ yang dihasilkan oleh percakapan](#context-object-percakapan) akan diteruskan ke _plugin_ untuk diproses secara normal.
Dari sudut pandang _plugin_, satu-satunya _plugin_ yang tersedia hanyalah dirinya, dan penangan di hilir dianggap tidak ada.
Setelah semua _plugin_ terselesaikan, _context object_ tersebut akan tersedia kembali untuk percakapan.

Dampaknya, semua tugas pembersihan yang dilakukan oleh _plugin_ dilakukan sebelum _function_ percakapan dijalankan.
Semua _plugin_ selain _session_ dapat bekerja dengan baik dengan alur kerja di atas.
Jika kamu hendak menggunakan _session_, silahkan [gulir ke bawah](#mengakses-session-di-dalam-percakapan).

### Plugin Bawaan

Jika kamu memiliki banyak percakapan yang menggunakan _plugin_ yang sama, kamu bisa menerapkan _plugin_ bawaan.
Dengan begitu, kamu tidak perlu lagi memasang `hydrate` ke `createConversation`:

::: code-group

```ts [TypeScript]
// TypeScript memerlukan dua jenis context type.
// Oleh karena itu, pastikan untuk menginstalnya.
bot.use(conversations<MyContext, MyConversationContext>({
  plugins: [hydrate()],
}));
// Hidrasi akan terinstal untuk percakapan berikut.
bot.use(createConversation(convo));
```

```js [JavaScript]
bot.use(conversations({
  plugins: [hydrate()],
}));
// Hidrasi akan terinstal untuk percakapan berikut.
bot.use(createConversation(convo));
```

:::

Pastikan varian _context_ semua _plugin_ bawaan terinstal ke semua _context type_ percakapan.

### Menggunakan Plugin Transformer di Dalam Percakapan

Jika kamu hendak menginstal suatu _plugin_ ke `bot.api.config.use`, ia tidak akan bisa dipasang ke _array_ `plugins` secara langsung.
Alih-alih, kamu harus memasangnya ke _instance_ `Api` untuk setiap _context object_.
Langkah tersebut dapat dilakukan dengan mudah dari dalam _plugin middleware_ biasa:

```ts
bot.use(createConversation(convo, {
  plugins: [async (ctx, next) => {
    ctx.api.config.use(transformer);
    await next();
  }],
}));
```

Ganti `transformer` dengan _plugin_ yang ingin diinstal.
Kamu bisa menginstal beberapa [_transformer_](../advanced/transformers) di pemanggilan `ctx.api.config.use` yang sama.

### Mengakses Session di Dalam Percakapan

[_Plugin session_](./session) tidak bisa diinstal ke dalam percakapan layaknya _plugin_ lain karena ia memiliki [perilaku yang berbeda](#menggunakan-plugin-di-dalam-percakapan).
Kamu tidak bisa memasangnya ke _array_ `plugins` karena alur kerjanya akan menjadi seperti ini:

1. Membaca data,
2. Memanggil `next` (yang mana langsung selesai),
3. Menulis kembali data yang sama,
4. Menyerahkan _context_ ke percakapan lain.

Perhatikan bagaimana _session_ di atas disimpan (nomor 3) bahkan sebelum kamu mengubahnya (nomor 2).
Akibatnya, semua perubahan yang terjadi di data session akan hilang.

Untuk mengatasinya, kamu bisa menggunakan `conversation.external` untuk [mengakses _context object_ luar](#context-object-percakapan).

```ts
// Baca data session yang ada di dalam percakapan.
const session = await conversation.external((ctx) => ctx.session);

// Ubah data session-nya.
session.count += 1;

// Simpan data session.
await conversation.external((ctx) => {
  ctx.session = session;
});
```

Di sisi lain, karena _plugin session_ mengakses _database_, ia dapat menimbulkan efek samping yang tidak diinginkan.
Oleh karena itu, berdasarkan [aturan utama](#pedoman-penggunaan), kita wajib membungkus _session_ dengan `conversation.external` ketika hendak mengaksesnya.

## Menu Percakapan

Kamu bisa membuat sebuah menu menggunakan [_plugin_ menu](./menu) di luar percakapan serta memasangnya ke _array_ `plugins` [seperti _plugin_ pada umumnya](#menggunakan-plugin-di-dalam-percakapan).

Akan tetapi, kamu tidak dapat menunggu _update_ dari dalam menu karena penangan tombol menu tidak memiliki akses ke percakapan terkait.

Idealnya, ketika suatu tombol ditekan, ia mampu untuk menunggu _update_ dan bernavigasi di antara menu ketika _user_ menekan tombol terkait.
Aksi tersebut dapat dicapai dengan cara membuat _menu percakapan_ menggunakan `conversation.menu()`.

```ts
let surel = "";

const menuSurel = conversation.menu()
  .text("Lihat alamat surel", (ctx) => ctx.reply(surel || "kosong"))
  .text(
    () => surel ? "Ganti alamat surel" : "Tambah alamat surel",
    async (ctx) => {
      await ctx.reply("Apa alamat surel Anda?");
      const response = await conversation.waitFor(":text");
      surel = response.msg.text;
      await ctx.reply(`Alamat surel Anda adalah ${surel}!`);
      ctx.menu.update();
    },
  )
  .row()
  .url("Tentang", "https://grammy.dev");

const daftarMenu = conversation.menu()
  .submenu("Ke menu surel", menuSurel, async (ctx) => {
    await ctx.reply("Menuju ke menu…");
  });

await ctx.reply("Berikut menu yang tersedia:", {
  reply_markup: daftarMenu,
});
```

`conversation.menu()` menghasilkan sebuah menu yang terdiri atas beberapa tombol, persis seperti yang dilakukan oleh _plugin_ menu.
Bahkan, jika kamu membaca [`ConversationMenuRange`](/ref/conversations/conversationmenurange) di referensi API, ia sangat mirip dengan [`MenuRange`](/ref/menu/menurange) dari _plugin_ menu.

Menu percakapan akan tetap aktif selama percakapan terkait juga aktif.
Oleh karena itu, kami menyarankan untuk memanggil `ctx.menu.close()` sebelum keluar dari percakapan.

Jika kamu tidak ingin keluar dari percakapan terkait, kamu bisa dengan mudah meletakkan potongan kode berikut di akhir _function_ percakapan.
Akan tetapi, [perlu diingat kembali](#percakapan-menyimpan-nilai-terkait) bahwa membiarkan percakapan tetap aktif selamanya dapat menimbulkan dampak yang buruk.

```ts
// Tunggu selamanya.
await conversation.waitUntil(() => false, {
  otherwise: (ctx) => ctx.reply("Mohon gunakan menu di atas!"),
});
```

Perlu diketahui juga bahwa menu percakapan tidak akan mengintervensi menu lain yang berada di luar.
Dengan kata lain, menu yang berada di dalam percakapan tidak akan menangani _update_ yang ditujukan untuk menu yang berada di luar, dan begitu pula sebaliknya.

### Interoperabilitas Plugin Menu

Sebuah [menu](../plugins/menu) yang didefinisikan di luar percakapan (menu luar) dapat digunakan di dalam percakapan.
Caranya adalah dengan mendefinisikan sebuah menu percakapan di dalam _function_ percakapan terkait.
Selama percakapan tersebut aktif, menu percakapan akan mengambil alih menu luar.
Kendali akan diambil kembali oleh menu luar ketika percakapan tersebut selesai.

Pastikan kedua menu diberi _string_ identifikasi yang sama:

```ts
// Di luar percakapan (plugin menu):
const menu = new Menu("menu-saya");
// Di dalam percakapan (plugin percakapan):
const menu = conversation.menu("menu-saya");
```

Agar dapat bekerja dengan baik, kamu harus memastikan kedua menu memiliki struktur yang identik.
Jika strukturnya tidak sama, saat tombol ditekan, menu tersebut akan [dianggap telah kedaluwarsa](./menu#menu-kedaluwarsa-beserta-fingerprint-nya), sehingga penangan tombol terkait tidak akan dipanggil.

Struktur menu ditentukan berdasarkan dua hal

- Bentuk menu (jumlah baris ataupun jumlah tombol di setiap baris); dan
- Label tombol.

Umumnya, praktik terbaik yang disarankan adalah secepatnya mengubah struktur menu percakapan setelah memasuki percakapan.
Dengan begitu, menu dapat teridentifikasi oleh percakapan, sehingga membuatnya dapat segera diaktifkan.

Jika suatu menu masih menyisakan suatu percakapan (karena tidak ditutup), menu luar dapat mengambil alih kembali kendali.
Sekali lagi, asalkan struktur menunya identik.

Contoh penerapan interoperabilitas ini dapat kamu temukan di [repositori kumpulan contoh bot](https://github.com/grammyjs/examples?tab=readme-ov-file#menus-with-conversation-menu-with-conversation).

## Formulir Percakapan

Percakapan sering kali digunakan untuk membuat formulir dalam bentuk tampilan chat.

Semua pemanggilan `wait` mengembalikan _context object_.
Akan tetapi, ketika menunggu sebuah pesan teks, mungkin kamu hanya ingin mengetahui teks pesannya saja, alih-alih isi _context object_-nya.

Kamu bisa menggunakan formulir percakapan untuk melakukan validasi _update_ dengan data yang telah diekstrak dari _context object_.
Berikut contoh isian formulir dalam bentuk chat:

```ts
await ctx.reply("Silahkan kirim foto yang ingin dikecilkan!");
const foto = await conversation.form.photo();
await ctx.reply("Berapa ukuran lebar foto yang diinginkan?");
const lebar = await conversation.form.int();
await ctx.reply("Berapa ukuran tinggi foto yang diinginkan?");
const tinggi = await conversation.form.int();
await ctx.reply(`Mengubah ukuran foto menjadi ${lebar}x${tinggi} ...`);
const hasil = await ubahUkuranFoto(foto, lebar, tinggi);
await ctx.replyWithPhoto(hasil);
```

Silahkan kunjungi referensi API [`ConversationForm`](/ref/conversations/conversationform#methods) untuk melihat macam-macam isian lain yang tersedia.

Semua isian formulir menerima _function_ `otherwise` yang akan dijalankan ketika _update_ yang diperoleh tidak cocok.
Selain itu, ia juga menerima _function_ `action` yang akan dijalankan ketika isian formulir telah diisi dengan benar.

```ts
// Tunggu huruf vokal.
const op = await conversation.form.select(["A", "I", "U", "E", "O"], {
  action: (ctx) => ctx.deleteMessage(),
  otherwise: (ctx) => ctx.reply("Hanya menerima A, I, U, E, atau O!"),
});
```

Formulir percakapan bahkan menyediakan cara untuk membuat isian formulir tersuai menggunakan [`conversation.form.build`](/ref/conversations/conversationform#build).

## Batas Waktu Tunggu

Kamu bisa menentukan batas waktu untuk setiap _update_ yang ditunggu.

```ts
// Tunggu selama satu jam sebelum keluar dari percakapan.
const satuJamDalamSatuanMilidetik = 60 * 60 * 1000;
await conversation.wait({ maxMilliseconds: satuJamDalamSatuanMilidetik });
```

[`conversation.now()`](#pedoman-penggunaan) akan dipanggil ketika pemanggilan `wait` telah tercapai.

`conversation.now()` akan dipanggil lagi saat _update_ selanjutnya tiba.
Jika _update_ yang diterima melebihi kurun waktu `maxMilliseconds`, percakapan akan dihentikan, dan _update_ tersebut akan dikembalikan ke sistem _middleware_.
_Middleware_ hilir kemudian akan dipanggil.

Proses di atas akan membuat percakapan seolah-olah tidak aktif.

Yang perlu diperhatikan adalah kode tidak akan dijalankan tepat setelah waktu yang telah ditentukan terlampaui.
Melainkan, ia hanya akan dijalankan tepat saat _update_ selanjutnya tiba.

Kamu bisa menentukan nilai batas waktu bawaan untuk semua pemanggilan `wait` di dalam percakapan.

```ts
// Selalu tunggu selama satu jam.
const satuJamDalamSatuanMilidetik = 60 * 60 * 1000;
bot.use(createConversation(convo, {
  maxMillisecondsToWait: satuJamDalamSatuanMilidetik,
}));
```

Nilai bawaan dapat ditimpa dengan cara menetapkan nilai yang diinginkan ke pemanggilan `wait` secara langsung.

## Aktivitas Masuk dan Keluar

Jika kamu ingin _function_ tertentu dipanggil ketika bot memasuki suatu percakapan, kamu bisa menambahkan _callback function_ ke opsi `onEnter`.
Demikian pula untuk aktivitas keluar, kamu juga bisa menerapkan hal yang sama ke opsi `onExit`.

```ts
bot.use(conversations({
  onEnter(id, ctx) {
    // Masuk ke percakapan `id`.
  },
  onExit(id, ctx) {
    // Keluar dari percakapan `id`.
  },
}));
```

Masing-masing _callback_ menerima dua jenis nilai.
Nilai pertama (`id`) adalah string identifikasi untuk percakapan yang sedang mengalami aktivitas masuk atau keluar.
Nilai kedua (`ctx`) adalah _context object_ dari _middleware_ yang ada di sekitar percakapan tersebut.

Perlu dicatat, _callback_ hanya akan dipanggil ketika aktivitas masuk atau keluar dilakukan melalui `ctx.conversation`.
Selain itu, _callback_ `onExit` akan dipanggil ketika percakapan menghentikan dirinya sendiri menggunakan `conversation.halt` maupun saat [batas waktu tunggu](#batas-waktu-tunggu) telah tercapai.

## Pemanggilan `wait` Secara Bersamaan

Kita bisa menggunakan [_floating promises_](https://github.com/jellydn/floating-promise-demo/tree/main#what-is-floating-promises) untuk menunggu beberapa _promise_ secara bersamaan---_pada contoh kali ini, kita menggunakan `Promise.all`_.
Ketika _update_-baru diterima, hanya pemanggilan `wait` pertama yang memiliki kecocokan yang akan terselesaikan.

Misalnya, berdasarkan contoh di bawah, jika _user_ mengirim pesan teks, yang akan terselesaikan terlebih dahulu adalah `conversation.waitFor(":text")`, sementara `conversation.waitFor(":photo")` akan tetap menunggu sampai ada foto yang dikirim.

```ts
await ctx.reply("Kirimkan saya sebuah foto beserta keterangannya!");
const [textContext, photoContext] = await Promise.all([
  conversation.waitFor(":text"),
  conversation.waitFor(":photo"),
]);
await ctx.replyWithPhoto(photoContext.msg.photo.at(-1).file_id, {
  caption: textContext.msg.text,
});
```

Dari contoh di atas, tidak menjadi masalah ketika _user_ mengirimkan foto atau teks terlebih dahulu.
Kedua _promise_ akan terselesaikan sesuai dengan urutan pengiriman dua pesan yang ditunggu oleh kode tersebut.
[`Promise.all`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) juga bekerja sebagaimana mestinya, ia akan selesai saat **semua** _promise_ yang diberikan terselesaikan.

Cara yang sama juga bisa digunakan untuk hal-hal lainnya.
Berikut contoh cara menginstal penyimak perintah keluar secara global di dalam suatu percakapan:

```ts
conversation.waitForCommand("keluar") // tidak menggunakan `await`!
  .then(() => conversation.halt());
```

Begitu [percakapan berakhir](#keluar-dari-percakapan), semua pemanggilan `wait` yang tertunda akan dibatalkan.
Sebagai contoh, begitu percakapan berikut dimasuki, ia akan selesai begitu saja tanpa menunggu _update_ selanjutnya tiba.

::: code-group

```ts [TypeScript]
async function convo(conversation: Conversation, ctx: Context) {
  const _promise = conversation.wait() // tidak menggunakan `await`!
    .then(() => ctx.reply("Pesan ini tidak akan pernah dikirim!"));

  // Percakapan selesai begitu saja.
}
```

```js [JavaScript]
async function convo(conversation, ctx) {
  const _promise = conversation.wait() // tidak menggunakan `await`!
    .then(() => ctx.reply("Pesan ini tidak akan pernah dikirim!"));

  // Percakapan selesai begitu saja.
}
```

:::

Secara internal, ketika beberapa pemanggilan `wait` dicapai dalam waktu yang bersamaan, _plugin_ percakapan akan memantau semua pemanggilan `wait` tersebut.
Begitu _update_ selanjutnya tiba, ia akan mengulang _function_ percakapan sekali untuk setiap pemanggilan `wait` yang ditemui hingga salah satu diantaranya menerima _update_ tersebut.
Jika di antara pemanggilan `wait` tertunda tersebut tidak ada satu pun yang menerima _update_, maka _update_ tersebut akan dibuang.

## Kembali ke Titik Cek

Seperti yang telah kita ketahui, _plugin_ percakapan [memantau](#plugin-percakapan-ibarat-mesin-pengulang) eksekusi _function_ percakapan.

Dengan begitu, kita dapat membuat titik cek di sepanjang proses tersebut.
Titik cek berisi informasi mengenai seberapa jauh _function_ percakapan terkait telah dijalankan.
Nantinya, informasi tersebut akan digunakan untuk kembali ke titik cek yang telah ditentukan.

Operasi Input/Output (IO) apapun yang sudah telanjur dilakukan tentunya tidak dapat dianulir.
Artinya, memutar balik ke titik cek tidak akan menganulir pesan yang sudah telanjur terkirim.

```ts
const checkpoint = conversation.checkpoint();

if (ctx.hasCommand("reset")) {
  await conversation.rewind(checkpoint);
}
```

Titik cek akan sangat berguna untuk "mengulang kembali".
Namun, layaknya [`label`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label) di JavaScript `break` dan `continue`, melompat di antara kode seperti itu dapat membuat kode tersebut sulit dibaca.
Oleh karena itu, **gunakan fitur ini seperlunya saja**.

Layaknya pemanggilan `wait`, memutar balik percakapan akan membatalkan proses eksekusi terkait, kemudian ia akan [mengulang](#plugin-percakapan-ibarat-mesin-pengulang) _function_ hingga ke titik di mana titik cek tersebut dibuat.
Memutar balik percakapan tidak secara harfiah mengeksekusi _function_ secara terbalik, meski seakan-akan ia terlihat seperti itu.

## Percakapan Paralel

Percakapan yang berlangsung di _chat_ yang berbeda diproses secara terpisah dan selalu dijalankan secara paralel.

Sebaliknya, secara bawaan, setiap _chat_ hanya boleh memiliki satu percakapan aktif.
Jika kamu mencoba memasuki sebuah percakapan disaat percakapan lain sedang aktif, pemanggilan `enter` yang dilakukan akan melempar sebuah galat.

Kamu bisa mengubah perilaku tersebut dengan cara menandai suatu percakapan sebagai paralel.

```ts
bot.use(createConversation(convo, { parallel: true }));
```

Aksi di atas akan mengubah dua hal.

Pertama, kamu sekarang bisa memasuki percakapan tersebut meski terdapat percakapan lain yang masih aktif.
Misalkan kamu memiliki percakapan `captcha` dan `settings`, kamu bisa memiliki lima percakapan `captcha` dan dua belas percakapan `settings` aktif di _chat_ yang sama.

Kedua, ketika percakapan terkait tidak menerima _update_, _update_ tersebut tidak akan dibuang.
Alih-alih, kendali akan diserahkan kembali ke sistem _middleware_ terkait,

Semua percakapan yang terinstal memiliki kesempatan untuk menangani _update_ yang tiba hingga salah satu dari mereka menerimanya.
Akan tetapi, hanya satu percakapan saja yang bisa menangani _update_ tersebut.

Ketika beberapa percakapan yang berbeda aktif secara bersamaan, urutan _middleware_ akan menentukan percakapan mana yang akan menangani _update_ tersebut terlebih dahulu.
Sedangkan, ketika satu percakapan aktif beberapa kali, percakapan yang paling awal (yang dimasuki terlebih dahulu) akan menangani _update_ tersebut terlebih dahulu.

Berikut ilustrasi contohnya:

::: code-group

```ts [TypeScript]
async function captcha(conversation: Conversation, ctx: Context) {
  const user = ctx.from!.id;
  await ctx.reply("Selamat datang di grup! Apa framework bot di dunia?");
  const answer = await conversation.waitFor(":text").andFrom(user);
  if (answer.msg.text === "grammY") {
    await ctx.reply("Tepat sekali!");
  } else {
    await ctx.banAuthor();
  }
}

async function settings(conversation: Conversation, ctx: Context) {
  const user = ctx.from!.id;
  const main = conversation.checkpoint();
  const options = ["Pengaturan Chat", "Tentang", "Privasi"];
  await ctx.reply("Selamat datang di pengaturan!", {
    reply_markup: Keyboard.from(options
      .map((btn) => [Keyboard.text(btn)])),
  });
  const option = await conversation.waitFor(":text")
    .andFrom(user)
    .and((ctx) => options.includes(ctx.msg.text), {
      otherwise: (ctx) =>
        ctx.reply("Mohon gunakan tombol yang telah disediakan!"),
    });
  await openSettingsMenu(option, main);
}

bot.use(createConversation(captcha));
bot.use(createConversation(settings));
```

```js [JavaScript]
async function captcha(conversation, ctx) {
  const user = ctx.from.id;
  await ctx.reply("Selamat datang di grup! Apa framework bot di dunia?");
  const answer = await conversation.waitFor(":text").andFrom(user);
  if (answer.msg.text === "grammY") {
    await ctx.reply("Tepat sekali!");
  } else {
    await ctx.banAuthor();
  }
}

async function settings(conversation, ctx) {
  const user = ctx.from.id;
  const main = conversation.checkpoint();
  const options = ["Pengaturan Chat", "Tentang", "Privasi"];
  await ctx.reply("Selamat datang di pengaturan!", {
    reply_markup: Keyboard.from(options
      .map((btn) => [Keyboard.text(btn)])),
  });
  const option = await conversation.waitFor(":text")
    .andFrom(user)
    .and((ctx) => options.includes(ctx.msg.text), {
      otherwise: (ctx) =>
        ctx.reply("Mohon gunakan tombol yang telah disediakan!"),
    });
  await openSettingsMenu(option, main);
}

bot.use(createConversation(captcha));
bot.use(createConversation(settings));
```

:::

Kode di atas ditujukan untuk _chat_ grup.
Ia menyediakan dua buah percakapan: `captcha` dan `settings`.
Percakapan `captcha` digunakan untuk memastikan hanya _developer_ terbaik yang join _chat_ tersebut---_promosi grammY tanpa malu, hahaha_.
Percakapan `settings` digunakan untuk mengimplementasikan menu pengaturan di _chat_ grup.

Perlu diperhatikan, semua pemanggilan `wait` akan melakukan pemilahan berdasarkan _user id_.

Mari kita asumsikan beberapa hal berikut telah dilakukan:

1. Kamu memanggil `ctx.conversation.enter("captcha")` untuk memasuki percakapan `captcha` saat menangani `update` dari _user_ dengan _id_ `ctx.from.id === 42`.
2. Kamu memanggil `ctx.conversation.enter("settings")` untuk memasuki percakapan `settings` saat menangani `update` dari _user_ dengan _id_ `ctx.from.id === 3`.
3. Kamu memanggil `ctx.conversation.enter("captcha")` untuk memasuki percakapan `captcha` saat menangani `update` dari _user_ dengan _id_ `ctx.from.id === 43`.

Artinya, tiga percakapan di atas telah aktif di _chat_ grup tersebut---_`captcha` aktif dua kali dan `settings` aktif sekali_.

> Perlu diketahui, `ctx.conversation` menyediakan [berbagai cara](/ref/conversations/conversationcontrols#exit) untuk keluar dari percakapan, bahkan ketika percakapan paralel diaktifkan.

Selanjutnya, hal-hal berikut akan terjadi secara berurutan:

1. _User_ dengan _id_ `3` mengirim sebuah pesan yang mengandung teks `Tentang`.
2. Sebuah update berupa pesan teks tiba.
3. _Instance_ percakapan `captcha` pertama [diulang](#plugin-percakapan-ibarat-mesin-pengulang).
4. Pemanggilan `waitFor(":text")` menerima _update_ tersebut.
   Tetapi, karena adanya _filter_ `andFrom(42)`, maka _update_ tersebut akan ditolak.
5. _Instance_ percakapan `captcha` kedua [diulang](#plugin-percakapan-ibarat-mesin-pengulang).
6. Pemanggilan `waitFor(":text")` menerima _update_ tersebut.
   Tetapi, karena adanya _filter_ `andFrom(43)`, maka _update_ tersebut akan ditolak.
7. Semua _instance_ `captcha` menolak _update_ tersebut, maka kendali diserahkan kembali ke sistem _middleware_.
8. _Instance_ percakapan `settings` [diulang](#plugin-percakapan-ibarat-mesin-pengulang).
9. Pemanggilan `wait` telah terselesaikan dan `option` akan berisi _context object_ yang mengandung _update_ pesan teks tersebut.
10. _Function_ `openSettingsMenu` dipanggil.
    Ia kemudian akan mengirim teks `Tentang` ke user dan memutar balik percakapan kembali ke `main`, yang menyebabkan menu tersebut dimulai ulang.

Coba perhatikan, meski dua percakapan di atas menunggu _user_ `42` dan `43` untuk menyelesaikan captcha-nya, bot dengan benar membalas user `3` yang telah memulai menu `pengaturan`.
Artinya, pemanggilan `wait` terpilah mampu menentukan _update_ mana yang relevan untuk percakapan yang sedang berlangsung.
_Update_ yang tertolak akan diambil oleh percakapan lainnya.

Meski contoh di atas menggunakan _chat_ grup untuk mengilustrasikan kemampuan percakapan dalam menangani beberapa _user_ secara paralel, namun sebenarnya percakapan paralel dapat digunakan untuk semua jenis _chat_.
Dengan kata lain, ia juga bisa digunakan untuk menunggu hal-hal lain di sebuah _chat_ yang hanya memiliki satu _user_ saja.

Selain itu, percakapan paralel juga dapat dikombinasikan dengan [batas waktu tunggu](#batas-waktu-tunggu) untuk meminimalkan jumlah percakapan aktif.

## Memeriksa Percakapan Aktif

Kamu bisa memeriksa percakapan mana yang sedang aktif dari dalam _middleware_ dengan cara berikut:

```ts
bot.command("stats", (ctx) => {
  const convo = ctx.conversation.active("convo");
  console.log(convo); // 0 atau 1
  const isActive = convo > 0;
  console.log(isActive); // false atau true
});
```

Ketika id percakapan disematkan ke `ctx.conversation.active`, ia akan mengembalikan nilai `1` jika percakapan tersebut sedang aktif, untuk sebaliknya ia akan mengembalikan nilai `0`.

Jika [percakapan paralel](#percakapan-paralel) diaktifkan, ia akan mengembalikan jumlah percakapan terkait yang sedang aktif.

Memanggil `ctx.conversation.active()` tanpa disertai _argument_ akan mengembalikan sebuah _object_ berisi daftar percakapan yang sedang aktif.
Id percakapan digunakan sebagai _key_, sedangkan untuk _value_-nya berisi jumlah percakapan aktif untuk id tersebut.

Misalnya, jika percakapan `captcha` aktif dua kali dan percakapan `settings` aktif sekali, maka `ctx.conversation.active()` akan menghasilkan nilai berikut:

```ts
bot.command("stats", (ctx) => {
  const stats = ctx.conversation.active();
  console.log(stats); // { captcha: 2, settings: 1 }
});
```

## Migrasi dari Versi 1.x ke 2.x

Percakapan 2.0 ditulis ulang sepenuhnya dari awal.

Meski konsep-konsep dasar API-nya masih tetap sama, namun, di balik layar, implementasi kedua versi tersebut benar-benar berbeda.

Singkatnya, penyesuaikan kode untuk proses migrasi dari versi 1.x ke 2.x sangatlah minim, hanya saja kamu perlu menghapus semua data yang tersimpan agar semua percakapan dapat dimulai ulang dari awal.

### Migrasi Data dari Versi 1.x ke 2.x

Sayangnya, ketika melakukan pemutakhiran dari versi 1.x ke 2.x, tidak ada cara untuk mempertahankan status percakapan yang sedang berlangsung.

Oleh karena itu, data-data tersebut harus dihapus terlebih dahulu dari _session_.
Kami menyarankan untuk mengikuti panduan [migrasi _session_](./session#migrasi).

Mempertahankan data percakapan menggunakan versi 2.x dapat dilakukan dengan cara [berikut](#menyimpan-percakapan).

### Perubahan Type dari Versi 1.x ke 2.x

Di versi 1.x, _context type_ di dalam percakapan identik dengan _context type_ yang digunakan di _middleware_.

Di versi 2.x, kamu harus mendeklarasikan dua _context type_, yaitu [_context type_ luar dan _context type_ dalam](#context-object-percakapan).
Kedua _type_ tersebut seharusnya tidak pernah sama.
Jika ternyata mereka tetap sama, maka ada yang salah dengan kode kamu.
Alasannya adalah karena _context type_ luar harus terinstal [`ConversationFlavor`](/ref/conversations/conversationflavor), sedangkan _context type_ dalam seharusnya tidak terinstal varian _type_ tersebut.

Selain itu, sekarang kamu bisa menginstal [beberapa _plugin_ secara terpisah](#menggunakan-plugin-di-dalam-percakapan) untuk setiap percakapan.

### Perubahan Cara Mengakses Session dari Versi 1.x ke 2.x

`conversation.session` tidak bisa lagi digunakan.
Sebagai gantinya, gunakan `conversation.external`.

```ts
// Membaca data session.
const session = await conversation.session; // [!code --]
const session = await conversation.external((ctx) => ctx.session); // [!code ++]

// Menulis data session.
conversation.session = newSession; // [!code --]
await conversation.external((ctx) => { // [!code ++]
  ctx.session = newSession; // [!code ++]
}); // [!code ++]
```

> `ctx.session` bisa diakses di versi 1.x, akan tetapi cara tersebut tidaklah benar.
> Oleh karena itu, `ctx.session` tidak lagi tersedia di versi 2.x.

### Perubahan Kompatibilitas Plugin dari Versi 1.x ke 2.x

Percakapan 1.x kurang kompatibel dengan _plugin_ manapun.
Beberapa diantaranya dapat teratasi dengan menggunakan `conversation.run`.

Opsi tersebut telah dihilangkan di versi 2.x.
Sebagai gantinya, kamu bisa menambahkan beberapa _plugin_ dengan cara menyematkannya ke _array_ `plugins`, seperti yang telah dijelaskan [di sini](#menggunakan-plugin-di-dalam-percakapan).

Untuk _session_, ia membutuhkan [penanganan khusus](#perubahan-cara-mengakses-session-dari-versi-1-x-ke-2-x).
Sedangkan untuk menu, ia telah mengalami peningkatan kompatibilitas semenjak hadirnya [menu percakapan](#menu-percakapan).

### Perubahan Percakapan Paralel dari Versi 1.x ke 2.x

Percakapan paralel tidak jauh berbeda di antara kedua versi.

Namun, di masa lalu, fitur ini menimbulkan berbagai permasalahan ketika digunakan secara tidak sengaja.
Di versi 2.x, kamu perlu secara eksplisit menyematkan `{ parallel: true }` jika ingin menggunakan fitur ini, seperti yang telah di jelaskan di [bagian ini](#percakapan-paralel).

Satu-satunya perubahan yang signifikan adalah _update_ tidak lagi diteruskan ke sistem _middleware_ secara bawaan.
Proses tersebut hanya akan dilakukan ketika suatu percakapan ditandai sebagai paralel.

Perlu dicatat, semua method `wait` dan kolom isian formulir menyediakan sebuah opsi `next` untuk menimpa perilaku bawaan.
Opsi tersebut merupakan hasil perubahan nama opsi `drop` di versi 1.x, sehingga makna kedua opsi juga bertolak belakang.

### Perubahan Formulir dari Versi 1.x ke 2.x

Fitur formulir di versi 1.x benar-benar berantakan.
Contohnya, `conversation.form.text()` mengembalikan isi pesan teks bahkan untuk pesan `edited_message` yang telah usang.
Kejanggalan-kejanggalan tersebut telah diperbaiki di versi 2.x.

Memperbaiki kekutu atau _bug_ secara teknis tidak dihitung sebagai perubahan yang signifikan.
Meski demikian, ia termasuk perubahan perilaku yang cukup mencolok.

## Ringkasan Plugin

- Nama: `conversations`
- [Sumber](https://github.com/grammyjs/conversations)
- [Referensi](/ref/conversations/)
