---
prev: false
next: false
---

# Percakapan (`conversations`)

Buat struktur percakapan dengan mudah.

## Mulai Cepat

Percakapan memiliki kemampuan untuk menunggu balasan pesan.
Oleh karena itu, plugin ini cocok digunakan untuk bot yang memiliki aksi berantai.

> Percakapan membawa fitur yang unik karena ia memperkenalkan konsep baru yang tidak akan kamu temukan di belahan dunia manapun.
> Sebelum mempelajari apa yang plugin ini bisa lakukan, sebaiknya kamu memahami terlebih dahulu cara kerjanya agar seluruh kemampuan yang ditawarkan bisa dimanfaatkan secara maksimal.

Berikut mulai cepat yang bisa kamu gunakan sebagai permulaan sebelum melangkah ke bagian menariknya:

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

Ketika kamu memasuki percakapan `hello` di atas, ia akan mengirim sebuah pesan `Halo! Siapa nama kamu?`, lalu menunggu balasan pesan teks dari user, kemudian mengirim pesan `Selamat datang di chat, (nama user)!`, dan percakapan pun berakhir.

Sekarang, mari kita lanjut ke bagian menariknya.

## Cara Kerja Percakapan

Pertama-tama, mari kita lihat contoh penanganan pesan berikut:

```ts
bot.on("message", async (ctx) => {
  // tangani satu pesan
});
```

Di penangan pesan biasa, kamu hanya bisa memiliki satu object context.

Sekarang, bandingkan dengan percakapan:

```ts
async function hello(conversation: Conversation, ctx0: Context) {
  const ctx1 = await conversation.wait();
  const ctx2 = await conversation.wait();
  // menangani tiga pesan
}
```

Di percakapan, kamu bisa memiliki tiga object context!

Layaknya penangan biasa, plugin percakapan hanya menerima satu object context yang berasal dari [sistem middleware](../guide/middleware).
Jika benar demikian, mengapa ia bisa menyediakan tiga object context?

Rahasianya adalah **function pembentuk percakapan tidak dieksekusi selayaknya function pada umumnya** (meski sebenarnya kita bisa saja memprogramnya seperti itu).

### Percakapan Hanyalah Mesin Pengulang

Function pembentuk percakapan tidak dieksekusi selayaknya function pada umumnya.

Ketika memasuki sebuah percakapan, ia hanya dieksekusi hingga pemanggilan `wait()` pertama.
Function tersebut kemudian akan diinterupsi dan tidak akan dieksekusi lebih lanjut.
Plugin akan mengingat `wait()` tersebut dan menyimpan informasi yang menyertainya.

Ketika update selanjutnya tiba, percakapan akan dieksekusi lagi dari awal.
Namun, kali ini, pemanggilan API sebelumnya tidak akan dilakukan, yang mana membuat kode kamu berjalan sangat cepat dan tidak memiliki dampak apapun.
Aksi tersebut dinamakan _replay_ atau ulang.
Setelah tiba di pemanggilan terakhir `wait()` sebelumnya, pengeksekusian function dilanjutkan secara normal.

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

1. Ketika memasuki sebuah percakapan, function akan dieksekusi hingga `A`.
2. Ketika update selanjutnya tiba, function akan diulang hingga `A`, lalu dieksekusi secara normal dari `A` hingga `B`.
3. Ketika update terakhir tiba, function akan diulang hingga `B`, lalu dieksekusi secara normal sampai akhir.

Dari ilustrasi di atas, kita tahu bahwa setiap baris kode yang kamu tulis akan dieksekusi beberapa kali---sekali secara normal, dan beberapa kali selama pengulangan.
Oleh karena itu, kamu perlu memastikan kode yang ditulis memiliki perilaku yang sama, baik ketika dieksekusi pertama kali, maupun ketika dieksekusi berkali-kali saat diulang.

Jika kamu melakukan pemanggilan API melalui `ctx.api` (termasuk `ctx.reply`), plugin ini akan menanganinya secara otomatis.
Sebaliknya, yang perlu mendapat perhatikan khusus adalah komunikasi database kamu.

Berikut yang perlu kamu perhatikan:

### Aturan Utama ketika Menggunakan Percapakan

Karena kita telah paham bagaimana percakapan dieksekusi, maka kita bisa menerapkan satu aturan untuk kode yang berada di dalam function pembentuk percakapan.
Kamu wajib mematuhinya agar kode dapat berjalan dengan baik.

::: warning ATURAN UTAMA

**Kode yang memiliki perilaku berbeda untuk setiap pengulangan, wajib dibungkus dengan [`conversation.external`](/ref/conversations/conversation#external).**

:::

Berikut cara penerapannya:

```ts
// SALAH
const response = await aksesDatabase();
// BENAR
const response = await conversation.external(() => aksesDatabase());
```

Dengan membungkus bagian kode menggunakan [`conversation.external`](/ref/conversations/conversation#external), kamu telah memberi tahu plugin bahwa bagian kode tersebut harus diabaikan selama proses pengulangan.
Nilai kembalian kode yang dibungkus akan disimpan oleh plugin dan digunakan kembali untuk pengulangan selanjutnya.
Dari contoh di atas, akses ke database tidak akan dilakukan berkali-kali selama proses pengulangan berlangsung.

GUNAKAN `conversation.external` ketika kamu ...

- membaca atau menulis file, database/session, jaringan, atau nilai global (global state),
- memanggil `Math.random()` atau `Date.now()`,
- melakukan pemanggilan API di `bot.api` atau instansiasi `Api` lain yang dilakukan secara terpisah.

JANGAN GUNAKAN `conversation.external` ketika kamu ...

- memanggil `ctx.reply` atau [aksi context](../guide/context#aksi-yang-tersedia),
- memanggil `ctx.api.sendMessage` atau method [Bot API](https://core.telegram.org/bots/api) lainnya melalui `ctx.api`.

Selain itu, plugin percakapan menyediakan beberapa method pembantu untuk `conversation.external`.
Ia tidak hanya mempermudah penggunaan `Math.random()` dan `Date.now()`, tetapi juga mempermudah debugging dengan cara menyembunyikan log selama proses pengulangan.

```ts
// await conversation.external(() => Math.random());
const rnd = await conversation.random();
// await conversation.external(() => Date.now());
const now = await conversation.now();
// await conversation.external(() => console.log("abc"));
await conversation.log("abc");
```

Kok bisa `conversation.wait` dan `conversation.external` memulihkan nilai aslinya ketika pengulangan berlangsung?
Pasti plugin juga mengingat nilai tersebut, bukan?

Tepat sekali!

### Percakapan Menyimpan Nilai Terkait

Percakapan menyimpan dua macam tipe data di database.
Secara bawaan, ia menggunakan database ringan berbasis `Map` yang disimpan di memory.
Selain itu, kamu juga bisa menggunakan [database permanen](#todo) dengan mudah.

Berikut beberapa hal yang perlu kamu ketahui:

1. Plugin conversation menyimpan semua update.
2. Plugin conversation menyimpan semua nilai kembalian (return value) `conversation.external` serta semua hasil pemanggilan API.

Segelintir update di dalam percakapan memang tidak akan menyebabkan masalah yang serius (perlu diingat, setiap pemanggilan `getUpdates` menggunakan [long polling](../guide/deployment-types) bisa mencapai 100 update).

Namun, jika percakapan tersebut tidak pernah selesai, lambat laun data-data tersebut akan terus menumpuk yang mengakibatkan penurunan performa bot secara signifikan.
Oleh karena itu, **hindari pengulangan yang tidak berujung**.

### Object Context Khusus untuk Percakapan

Ketika sebuah percakapan dijalankan, ia menggunakan update permanen untuk menciptakan object context dari awal.
**Object context yang dihasilkan berbeda dengan object context yang digunakan oleh middleware di sekitarnya**
Jika kamu menggunakan TypeScript, artinya, kamu sekarang mempunyai dua [varian](../guide/context#context-flavor) object context:

- **Object context luar** merupakan object context yang digunakan oleh middlewarre.
  Melalui object context ini kamu bisa mengakses `ctx.conversation.enter`.
  Untuk TypeScript, kamu setidaknya perlu menginstal `ConversationFlavor`.
  Object context luar juga bisa memiliki property tambahan yang telah ditentukan oleh plugin yang diinstal melalui `bot.use`.
- **Object context dalam** (biasa disebut sebagai **object context percakapan** atau _conversational context objects_) merupakan object context yang diciptakan oleh plugin percakapan.
  Ia tidak memiliki akses ke `ctx.conversation.enter`, dan secara bawaan, ia juga tidak memiliki akses ke plugin manapun.
  Jika kamu ingin memiliki property tersuai di dalam object context, [gulir ke bawah](#todo).

Kedua type context luar dan dalam wajib dipasang ke percakapan.
Pengaturan TypeScript kamu seharusnya kurang lebih seperti ini:

::: code-group

```ts [Node.js]
import { Bot, type Context } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
} from "@grammyjs/conversations";

// Object context luar (mencakup semua plugin middleware)
type MyContext = ConversationFlavor<Context>;
// Object context dalam (mencakup semua plugin percakapan)
type MyConversationContext = Context;

// Gunakan type context luar untuk bot.
const bot = new Bot<MyContext>("");

// Gunakan kedua type luar dan dalam untuk percakapan.
type MyConversation = Conversation<MyContext, MyConversationContext>;

// Buat percakapannya
async function example(
  conversation: MyConversation,
  ctx0: MyConversationContext,
) {
  // Semua object context di dalam percakapan memiliki type `MyConversationContext`.
  const ctx1 = await conversation.wait();

  // Object context luar dapat diakses melalui `conversation.external`
  // dan telah dikerucutkan menjadi type `MyContext`.
  const session = await conversation.external((ctx) => ctx.session);
}
```

```ts [Deno]
import { Bot, type Context } from "https://deno.land/x/grammy/mod.ts";
import {
  type Conversation,
  type ConversationFlavor,
} from "https://deno.land/x/grammy_conversations/mod.ts";

// Object context luar (mencakup semua plugin middleware)
type MyContext = ConversationFlavor<Context>;
// Object context dalam (mencakup semua plugin percakapan)
type MyConversationContext = Context;

// Gunakan type context luar untuk bot.
const bot = new Bot<MyContext>("");

// Gunakan kedua type luar dan dalam untuk percakapan.
type MyConversation = Conversation<MyContext, MyConversationContext>;

// Buat percakapannya
async function example(
  conversation: MyConversation,
  ctx0: MyConversationContext,
) {
  // Semua object context di dalam percakapan memiliki type `MyConversationContext`.
  const ctx1 = await conversation.wait();

  // Object context luar dapat diakses melalui `conversation.external`
  // dan telah dikerucutkan menjadi type `MyContext`.
  const session = await conversation.external((ctx) => ctx.session);
}
```

:::

> Meski dari contoh di atas tidak ada plugin yang terinstal di percakapan, namun ketika kamu [menginstalnya](#todo), definisi `MyConversationContext` tidak akan lagi berupa type `Context` dasar.

Sekarang, kita mengetahui bahwa masing-masing percakapan bisa memiliki variasi type context yang berbeda-beda sesuai dengan keinginan kamu.

Selamat!
Jika kamu bisa memahami semua materi di atas dengan baik, bagian tersulit dari panduan ini telah berhasil kamu lewati.
Selanjunya, kita akan membahas fitur-fitur yang ditawarkan oleh plugin ini.

## Memasuki Percakapan

Kamu bisa masuk ke dalam suatu percakapan melalui penangan biasa.

Secara bawaan, sebuah percakapan memiliki nama yang sama dengan [nama function-nya](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name).
Kamu bisa mengubah nama tersebut ketika menginstalnya ke bot.

Percakapan juga bisa menerima beberapa argument.
Tetapi ingat, argument tersebut akan disimpan dalam bentuk string JSON.
Artinya, kamu perlu memastikan ia dapat diproses oleh `JSON.stringify`.

Selain itu, kamu juga bisa masuk ke suatu percakapan melalui percakapan lain dengan cara memanggil function JavaScript.
Dengan memanggil function terkait, ia akan mendapatkan akses ke nilai kembalian function tersebut.
Namun, akses yang sama tidak bisa didapatkan jika kamu memasuki sebuah percakapan dari dalam middleware.

:::code-group

```ts [TypeScript]
/**
 * Nilai kembalian function JavaScript berikut
 * hanya bisa diakses ketika sebuah percakapan
 * dipanggil melalui percakapan lainnya.
 */
async function jokeBapakBapak(conversation: Conversation, ctx: Context) {
  await ctx.reply("Kota apa yang warganya bapak-bapak semua?");
  return "Purwo-daddy"; // xixixi...
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
  const jawaban = await jokeBapakBapak(conversation, ctx);
  if (answer === jawaban) {
    await ctx.reply(jawaban);
    await ctx.reply(config.text);
  }
}
/**
 * Ubah nama function `jokeBapakBapak` menjadi `tebak-receh`.
 */
bot.use(createConversation(jokeBapakBapak, "tebak-receh"));
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
   * Untuk menyerderhanakan contoh kode, kita menginput kedua argument
   * secara statis (`Purwo-daddy` dan `{ text: "Xixixi..." }`).
   *
   * Untuk kasus tebak-tebakan ini mungkin akan jauh lebih menarik jika
   * argument tersebut dibuat dinamis, misalnya argument pertama
   * ("Purwo-daddy") dapat diganti dengan jawaban user.
   *
   * Selamat bereksperimen! :)
   */
  await ctx.conversation.enter("percakapan", "Purwo-daddy", {
    text: "Xixixi...",
  });
});
```

```js [JavaScript]
/**
 * Nilai kembalian function JavaScript berikut
 * hanya bisa diakses ketika sebuah percakapan
 * dipanggil melalui percakapan lainnya.
 */
async function jokeBapakBapak(conversation, ctx) {
  await ctx.reply("Kota apa yang warganya bapak-bapak semua?");
  return "Purwo-daddy"; // xixixi...
}
/**
 * Function berikut menerima dua argument: `answer` dan `config`.
 * Semua argument wajib berupa tipe yang bisa diubah ke JSON.
 */
async function percakapan(conversation, ctx, answer, config) {
  const jawaban = await jokeBapakBapak(conversation, ctx);
  if (answer === jawaban) {
    await ctx.reply(jawaban);
    await ctx.reply(config.text);
  }
}
/**
 * Ubah nama function `jokeBapakBapak` menjadi `tebak-receh`.
 */
bot.use(createConversation(jokeBapakBapak, "tebak-receh"));
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
   * Untuk menyerderhanakan contoh kode, kita menginput kedua argument
   * secara statis (`Purwo-daddy` dan `{ text: "Xixixi..." }`).
   *
   * Untuk kasus tebak-tebakan ini mungkin akan jauh lebih menarik jika
   * argument tersebut dibuat dinamis, misalnya argument pertama
   * ("Purwo-daddy") dapat diganti dengan jawaban user.
   *
   * Selamat bereksperimen! :)
   */
  await ctx.conversation.enter("percakapan", "Purwo-daddy", {
    text: "Xixixi...",
  });
});
```

:::

::: warning Type Safety untuk Argument

Pastikan parameter percakapan kamu menggunakan type yang sesuai, serta argument yang diteruskan ke pemanggilan `enter` cocok dengan type tersebut.
Plugin tidak dapat melakukan pengecekan type di luar `conversation` dan `ctx`.

:::

Perlu diperhatikan bahwa [urutan middleware akan berpengaruh](../guide/middleware).
Kamu hanya bisa memasuki suatu percakapan jika ia diinstal sebelum penangan yang melakukan pemanggilan `enter`.

## Menunggu Update

Tujuan pemanggilan `wait` yang paling dasar adalah menunggu update selanjutnya tiba.

```ts
const ctx = await conversation.wait();
```

Nilai yang dkembalikan adalah sebuah object context.
Semua pemanggilan `wait` memiliki konsep dasar ini.

### Pemilahan untuk Pemanggilan `wait`

Jika kamu ingin menunggu jenis update tertentu, kamu bisa menerapkan pemilahan ke pemanggilan `wait`.

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

Pemanggilan `wait` terpilah memastikan update yang diterima sesuai dengan filter yang diterapkan.
Jika bot menerima sebuah update yang tidak sesuai, update tersebut akan diabaikan begitu saja.
Untuk mengatasinya, kamu bisa menginstal sebuah function callback agar function tersebut dipanggil ketika update yang diterima tidak sesuai.

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
    otherwise: (ctx) => ctx.reply("Mohon kirimkan saya sebuah foto"),
  })
  .andForHears("Indonesia", {
    otherwise: (ctx) =>
      ctx.reply('Keterangan foto  selain "Indonesia" tidak diperbolehkan'),
  });
```

Jika kamu menerapkan `otherwise` ke salah satu pemanggilan `wait` saja, maka ia akan dipanggil hanya untuk filter tersebut.

### Memeriksa Object Context

[Mengurai](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) object context merupakan hal yang cukup umum untuk dilakukan.
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
Selain itu, percakapan juga bisa dihentikan dengan melempar sebuah error.

Jika cara di atas masih belum cukup, kamu bisa secara manual mengakhiri percakapan menggunakan `halt`:

```ts
async function convo(conversation: Conversation, ctx: Context) {
  // Semua percabangan berikut mencoba keluar dari percakapan:
  if (ctx.message?.text === "return") {
    return;
  } else if (ctx.message?.text === "error") {
    throw new Error("boom");
  } else {
    await conversation.halt(); // tidak akan pernah mengembalikan nilai (return)
  }
}
```

Kamu juga bisa keluar dari suatu percakapan dari dalam middleware:

```ts
bot.use(conversations());
bot.command("clean", async (ctx) => {
  await ctx.conversation.exit("convo");
});
```

Cara di atas bisa dilakukan bahkan _sebelum_ percakapan yang ditarget diinstal ke sistem middleware.
Dengan kata lain, hanya dengan menginstal plugin percakapan itu sendiri, kamu bisa melakukan hal di atas.

## Percakapan Hanyalah Sebuah JavaScript

Setelah [efek samping teratasi](#aturan-utama-ketika-menggunakan-percapakan), percakapan hanyalah sebuah function JavaScript biasa.
Meski cara pengeksekusiannya terlihat aneh, namun biasanya ketika mengembangkan sebuah bot, kita akan dengan mudah melupakannya.
Semua syntax JavaScript biasa dapat diproses dengan baik.

Semua hal yang dibahas di bagian berikut cukup lazim jika kamu terbiasa menggunakan percakapan.
Namun, jika masih awam, beberapa hal berikut akan terdengar baru.

### Variable, Percabangan, dan Perulangan

Kamu bisa menggunakan variable biasa untuk menyimpan status suatu update.
Percabangan menggunakan `if` atau `switch` juga bisa dilakukan.
Sama halnya dengan perulangan `for` dan `while`.

```ts
await ctx.reply("Kirim nomor-nomor favorit kamu, pisahkan dengan koma!");
const { message } = await conversation.waitFor("message:text");
const numbers = message.text.split(",");
let jumlah = 0;
for (const str of numbers) {
  const n = parseInt(str.trim(), 10);
  if (!isNaN(n)) {
    jumlah += n;
  }
}
await ctx.reply("Jumlah nomor-nomor tersebut adalah: " + jumlah);
```

Ia hanyalah sebuah JavaScript, bukan?

### Function dan Rekursif

Kamu bisa membagi sebuah percakapan menjadi beberapa function.
Mereka bisa memanggil satu sama lain atau bahkan melakukan rekursif (memanggil dirinya sendiri).
Plugin percakapanpun sebenarnya tidak tahu kalau kamu menggunakan function.

Berikut kode yang sama seperti di atas, tetapi di-refactor menjadi beberapa function:

:::code-group

```ts [TypeScript]
/** Percakapan untuk menghitung jumlah semua angka */
async function sumConvo(conversation: Conversation, ctx: Context) {
  await ctx.reply("Kirim nomor-nomor favorit kamu, pisahkan dengan koma!");
  const { message } = await conversation.waitFor("message:text");
  const numbers = message.text.split(",");
  await ctx.reply("Jumlah nomor-nomor tersebut adalah: " + sumStrings(numbers));
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
  await ctx.reply("Kirim nomor-nomor favorit kamu, pisahkan dengan koma!");
  const { message } = await conversation.waitFor("message:text");
  const numbers = message.text.split(",");
  await ctx.reply("Jumlah nomor-nomor tersebut adalah: " + sumStrings(numbers));
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

JavaScript memiliki function orde tinggi (higher-order function), class, serta cara-cara lain untuk mengubah kode kamu menjadi beberapa module.
Umumnya, mereka semua bisa diubah menjadi percakapan.

Sekali lagi, berikut kode yang sama persis seperti di atas, namun di-refactor menjadi sebuah module:

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

  /** Minta user untuk mengirim nomor-nomor favoritnya */
  async function askForNumbers(ctx: Context) {
    await ctx.reply("Kirim nomor-nomor favorit kamu, pisahkan dengan koma!");
  }

  /** Tunggu user mengirim nomor-nomornya, lalu balas dengan jumlah semua nomor tersebut */
  async function sumUserNumbers() {
    const ctx = await conversation.waitFor(":text");
    const jumlah = sumStrings(ctx.msg.text);
    await ctx.reply("Jumlah nomor-nomor tersebut adalah: " + jumlah);
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

  /** Minta user untuk mengirim nomor-nomor favoritnya */
  async function askForNumbers(ctx: Context) {
    await ctx.reply("Kirim nomor-nomor favorit kamu, pisahkan dengan koma!");
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

Meski terlihat berlebihan untuk tugas sesederhana menjumlahkan nomor, namun kamu bisa menangkap konsep yang kami maksud.

Yup, kamu benar, ia hanyalah sebuah JavaScript.

## Mempertahankan Percakapan

Secara bawaan, semua data yang disimpan oleh plugin percakapan disimpan di memory.
Artinya, ketika memori tersebut dimatikan, semua proses akan keluar dari percakapan, sehingga mau tidak mau harus dimulai ulang.

Jika ingin mempertahankan data-data tersebut ketika server dimulai ulang, kamu harus mengintegrasikan plugin percakapan ke sebuah database.
Kami telah membuat [berbagai jenis storage adapter](https://github.com/grammyjs/storages/tree/main/packages#grammy-storages) untuk mempermudah pengintegrasian tersebut.
Mereka semua menggunakan adapter yang sama yang digunakan oleh [plugin session](./session#storage-adapter-yang-tersedia)

Katakanlah kamu ingin menyimpan data ke sebuah file bernama `data-percakapan` ke dalam direktori di sebuah diska.
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

Kamu bisa menggunakan semua jenis storage adapter asalkan ia dapat menyimpan data berupa [`VersionedState`](/ref/conversations/versionedstate) dari [`ConversationData`](/ref/conversations/conversationdata).
Kedua jenis type tersebut bisa di-import dari plugin percakapan.
Dengan kata lain, jika kamu ingin menempatkan storage tersebut ke sebuah variable, kamu bisa melakukannya menggunakan type berikut:

```ts
const storage = new FileAdapter<VersionedState<ConversationData>>({
  dirName: "data-percakapan",
});
```

Secara umum, type yang sama juga bisa digunakan ke storage adapter lainnya.

### Membuat Versi Data

Jika kamu menyimpan status percapakan di suatu database, lalu di kemudian hari kode sumber (source code) kamu berubah, maka akan terjadi ketidakcocokan antara data yang tersimpan dengan function pembentuk percakapan yang baru.
Data tersebut akan korup sehingga [pengulangan](#percakapan-hanyalah-mesin-pengulang) tidak dapat dijalankan.

Peristiwa tersebut bisa dicegah dengan cara menyematkan versi kode kamu.
Kemudian, setiap kali percakapan diubah, kamu bisa meningkatkan atau menambah versi tersebut.
Dengan begitu, ketika plugin percakapan mendeteksi versi ternyata tidak sama, ia akan memigrasi semua data tersebut secara otomatis.

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

Plugin percakapan dilengkapi dengan proteksi untuk menangani sebagian besar skenario yang menyebabkan data terkorupsi.
Jika terdeteksi, sebuah error akan dilempar melalui percakapan terkait, yang menyebabkan percakapan tersebut berhenti atau crash.
Dengan asumsi kamu tidak menangkap dan mengindahkan error tersebut (try-catch), percakapan akan menghapus data yang tidak sesuai tersebut dan memulai ulang dengan benar.

Ingat, proteksi ini tidak mencakup semua skenario.
Oleh karena itu, di kesempatan selanjutnya, kamu harus memastikan nomor versi diperbarui dengan benar.

:::

### Data yang Tidak Bisa Di-serialize

> Catatan terjemahan:
> Penerjemah tidak menemukan terjemahan yang tepat untuk `serialize`.
> Oleh karena itu, kami menggunakan istilah tersebut apa adanya.
> Istilah`serialize` sendiri adalah proses mengubah struktur data menjadi format yang bisa disimpan.
> Dalam hal ini, data akan diubah menjadi format JSON.

Perlu diingat kembali bahwa semua data yang dikembalikan dari [`conversation.external`](/ref/conversations/conversation#external) akan [disimpan](#percakapan-menyimpan-nilai-terkait).
Artinya, semua data tersebut harus berupa tipe yang bisa di-serialize.

```ts
const largeNumber = await conversation.external({
  // Memanggil sebuah API yang mengembalikan sebuah BigInt (tidak bisa diubah menjadi JSON).
  task: () => 1000n ** 1000n,
  // Konversi bigint menjadi string sebelum disimpan.
  beforeStore: (n) => String(n),
  // Kembalikan string menjadi bigint sebelum digunakan.
  afterLoad: (str) => BigInt(str),
});
```

Jika ingin melempar error dari `task`, kamu bisa menambah function serialize tambahan untuk object error.
Coba lihat [`ExternalOp`](/ref/conversations/externalop) di referensi API.

### Acuan penyimpan

Secara bawaan, data percakapan disimpan menggunakan setiap chat sebagai acuan penyimpanannya (storage key).
Perilaku tersebut sama persis dengan [perilaku plugin session](./session#session-key)

Karenanya, sebuah percakapan tidak bisa menangani update dari berbagai chat.
Jika tidak menginginkan perilaku tersebut, kamu bisa [menentukan function acuan penyimpananmu sendiri](/ref/conversations/conversationoptions#storage).
Untuk session, tidak direkomendasikan untuk menggunakan opsi tersebut di serverless karena berpotensi menyebabkan tumpang tindih (race condition).

Selain itu, sama seperti session, kamu bisa menyimpan data percakapan menggunakan awalan tertentu melalui opsi `prefix`.
Ia akan berguna jika kamu hendak menggunakan storage adapter yang sama untuk data session dan data percakapan.
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

Jika user dengan ID `424242` memasuki sebuah percakapan, acuan penyimpanannya (storage key) sekarang menjadi `convo-424242`.

Silahkan lihat referensi API [`ConversationStorage`](/ref/conversations/conversationstorage) untuk memahami lebih detail dalam menyimpan data menggunakan plugin percakapan.

Check out the API reference for [`ConversationStorage`](/ref/conversations/conversationstorage) to see more details about storing data with the conversations plugin.
Detail yang dijelaskan di antaranya termasuk bagaimana cara menyimpan data menggunakan `type: "context"` sehingga function acuan data tidak lagi diperlukan.

## Menggunakan Plugin di Dalam Percakapan

[Masih ingat](#object-context-khusus-untuk-percakapan) object context yang yang digunakan oleh percakapan berbeda dengan object context yang digunakan oleh middleware?
Artinya, meski suatu plugin telah diinstal ke bot, namun ia tidak akan terinstal untuk percakapan.

Untungnya, semua plugin grammY [kecuali session](#todo) kompatibel dengan percakapan.
Berikut contoh cara menginstal [plugin hidrasi](./hydrate) ke percakapan:

::: code-group

```ts [TypeScript]
// Instal plugin percakapan untuk bagian luar saja.
type MyContext = ConversationFlavor<Context>;
// Instal plugin hidrasi untuk bagian dalam saja.
type MyConversationContext = HydrateFlavor<Context>;

bot.use(conversations());

// Sertakan object context luar dan dalam.
type MyConversation = Conversation<MyContext, MyConversationContext>;
// Plugin hidrasi terinstal untuk `ctx` ini.
async function convo(conversation: MyConversation, ctx: MyConversationContext) {
  // Plugin hidrasi juga akan terinstal untuk `other`.
  const other = await conversation.wait();
}
bot.use(createConversation(convo, { plugins: [hydrate()] }));

bot.command("enter", async (ctx) => {
  // Plugin hidrasi TIDAK terinstal untuk `ctx` yang ini.
  await ctx.conversation.enter("convo");
});
```

```js [JavaScript]
bot.use(conversations());

// Plugin hidrasi terinstal untuk `ctx` ini.
async function convo(conversation, ctx) {
  // Plugin hidrasi juga akan terinstal untuk `other`.
  const other = await conversation.wait();
}
bot.use(createConversation(convo, { plugins: [hydrate()] }));

bot.command("enter", async (ctx) => {
  // Plugin hidrasi TIDAK terinstal untuk `ctx` yang ini.
  await ctx.conversation.enter("convo");
});
```

:::

Di [middleware](../guide/middleware) biasa, plugin akan menjalankan kode menggunakan object context yang tersedia pada waktu tersebut.
Kemudian, ia akan memanggil `next` untuk menunggu middleware yang ada di hilir selesai.
Terakhir, ia akan menjalankan kode yang tersisa.

Tetapi, percakapan bukanlah sebuah middleware.
Plugin juga tidak bisa berinteraksi dengan percakapan selayaknya middleware.
[Object context yang dibuat oleh percakapan](#object-context-khusus-untuk-percakapan) akan diteruskan ke plugin untuk diproses secara normal.
Dalam sudut pandang plugin, satu-satunya plugin yang tersedia hanyalah dirinya, dan penangan di hilir dianggap tidak ada.
Setelah semua plugin selesai, object context tersebut akan tersedia kembali untuk percakapan.

Sehingga, semua tugas pembersihan yang dilakukan oleh plugin dilakukan sebelum function pembentuk percakapan dijalankan.
Semua plugin kecuali session dapat bekerja dengan baik dengan alur kerja tersebut.
Jika kamu hendak menggunakan session, [gulir ke bawah](#todo).

### Plugin Bawaan

Jika kamu memiliki banyak percakapan yang membutuhkan plugin yang sama, kamu bisa menerapkan plugin bawaan.
Mulai sekarang, kamu tidak perlu lagi meneruskan `hydrate` ke `createConversation`:

::: code-group

```ts [TypeScript]
// TypeScript memerlukan dua jenis type context.
// Jadi, pastikan untuk menginstalnya.
bot.use(conversations<MyContext, MyConversationContext>({
  plugins: [hydrate()],
}));
// Hidrasi (hydrate) akan terinstal di percakapan berikut.
bot.use(createConversation(convo));
```

```js [JavaScript]
bot.use(conversations({
  plugins: [hydrate()],
}));
// Hidrasi (hydrate) akan terinstal di percakapan berikut.
bot.use(createConversation(convo));
```

:::

Pastikan untuk menginstal varian context (context flavour) plugin bawaan ke dalam type context percakapan.

### Menggunakan Plugin Transformer di Dalam Percakapan

Jika sebuah plugin diinstal melalui `bot.api.config.use`, kamu tidak bisa meneruskannya ke array `plugins` secara langsung.
Oleh sebab itu, kamu harus menginstalnya ke instance `Api` setiap object context.
Langkah tersebut dapat dilakukan dengan mudah dari dalam plugin middleware biasa:

```ts
bot.use(createConversation(convo, {
  plugins: [async (ctx, next) => {
    ctx.api.config.use(transformer);
    await next();
  }],
}));
```

Ganti `transformer` dengan plugin yang ingin diinstal.
Kamu bisa menginstal beberapa transformer di pemanggilan `ctx.api.config.use` yang sama.

### Mengakses Session di Dalam Percakapan

[Plugin session](./session) tidak bisa diinstal ke dalam percakapan layaknya plugin lain karena ia memiliki [perilaku yang berbeda](#menggunakan-plugin-di-dalam-percakapan).
Kamu tidak bisa menggunakannya di array `plugins` karena alur kerjanya akan menjadi seperti ini:

1. Membaca data,
2. Memanggil `next` (yang mana langsung selesai),
3. Menulis kembali data yang sama,
4. Menyerahkan context ke percakapan lain.

Perhatikan bagaimana session di atas disimpan (poin 3) bahkan sebelum kamu mengubahnya (poin 2).
Akibatnya, semua perubahan yang terjadi di data session akan hilang.

Solusinya, kamu bisa menggunakan `conversation.external` untuk [mengakses object context luar](#object-context-khusus-untuk-percakapan).


Instead, you can use `conversation.external` to get [access to the outside context object](#conversational-context-objects).

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

Di sisi lain, karena plugin session mengakses database, ia dapat menimbulkan efek samping ke pemrosesan yang lain.
Oleh karena itu, masuk akal jika [aturan utama](#aturan-utama-ketika-menggunakan-percapakan) harus diterapkan karena untuk mengakses session perlu dilakukan di dalam `conversation.external`.

## Menu Percakapan

Kamu bisa membuat sebuah menu menggunakan [plugin menu](./menu) di luar percakapan, lalu menambahkannya ke array `plugins` [layaknya plugin lain](#menggunakan-plugin-di-dalam-percakapan).

Namun, itu artinya, menu tidak memiliki akses ke penangan percakapan `conversation` untuk penangan tombolnya.
Akibatnya, kamu tidak bisa menunggu update dari dalam menu.

Idealnya, Ketika suatu tombol ditekan, ia mampu untuk menunggu pesan dan bernavigasi di antara menu ketika user membalasnya.
Proses tersebut dapat diperoleh dengan menggunakan `conversation.menu()`.
Dengan begitu, kamu bisa membuat _menu percakapan_.

```ts
let email = "";

const menuEmail = conversation.menu()
  .text("Baca email", (ctx) => ctx.reply(email || "kosong"))
  .text(() => email ? "Ganti email" : "Tentukan email-nya", async (ctx) => {
    await ctx.reply("Apa email kamu?");
    const response = await conversation.waitFor(":text");
    email = response.msg.text;
    await ctx.reply(`Email kamu adalah ${email}!`);
    ctx.menu.update();
  })
  .row()
  .url("Tentang", "https://grammy.dev");

const menuLain = conversation.menu()
  .submenu("Ke menu email", emailMenu, async (ctx) => {
    await ctx.reply("Menuju ke menu…");
  });

await ctx.reply("Berikut menu yang tersedia", {
  reply_markup: otherMenu,
});
```

`conversation.menu()` mengembalikan sebuah menu yang bisa dibentuk dengan menambahkan beberapa tombol, persis seperti plugin menu.
Bahkan, jika kamu membaca [`ConversationMenuRange`](/ref/conversations/conversationmenurange) di referensi API, ia sangat mirip dengan [`MenuRange`](/ref/menu/menurange) dari plugin menu.

Menu percakapan akan tetap aktif selama percakapannya juga aktif.
Oleh karena itu, kamu harus memanggil `ctx.menu.close()` sebelum keluar dari percakapan.

Jika kamu ingin mencegah keluarnya percakapan, kamu bisa dengan mudah menggunakan potongan kode berikut di akhir percakapan tersebut.
Akan tetapi, [perlu diingat juga](#percakapan-menyimpan-nilai-terkait) bahwa membiarkan percakapan aktif selamanya akan menimbulkan dampak yang buruk.

```ts
// Tunggu selamanya.
await conversation.waitUntil(() => false, {
  otherwise: (ctx) => ctx.reply("Mohon gunakan menu di atas!"),
});
```

Yang perlu diketahui juga adalah menu percakapan tidak akan menggangu atau intervensi menu lain yang berada di luar.
Dengan kata lain, menu yang berada di dalam percakapan tidak akan menangani update yang ditujukan untuk menu yang berada di luar, dan begitu pula sebaliknya.

### Interoperabilitas Plugin Menu

Ketika mendefinisikan sebuah menu di luar percakapan untuk digunakan di dalam percakapan, kamu 
bisa menggunakan menu percakapan untuk mengambil alih proses terkait selama percakapan tersebut aktif.
Ketika percakapan selesai, menu luar tadi akan mengambil alih kembali prosesnya.

Pastikan kedua menu diberi string identifikasi yang sama:

```ts
// Di luar percakapan (plugin menu):
const menu = new Menu("menu-saya");
// Di dalam percakapan (plugin percakapan):
const menu = conversation.menu("menu-saya");
```

Agar bisa bekerja dengan baik, kamu harus memastikan kedua menu memiliki struktur yang sama persis ketika proses diambil alih dari dalam ke luar percakapan ataupun sebaliknya.
Jika strukturnya tidak sama, saat tombol ditekan, menu tersebut akan [dianggap telah kedaluwarsa](./menu#menu-kedaluwarsa-beserta-fingerprint-nya), sehingga penangan tombol terkait tidak akan dipanggil.

Struktur ditentukan berdasarkan dua hal berikut:

- Bentuk menu itu sendiri (jumlah baris atau jumlah tombol di setiap baris),
- Label tombol terkait.

Sebelum memasuki suatu percakapan, umumnya disarankan untuk terlebih dahulu mengubah menu menjadi bentuk yang diperlukan untuk pemrosesan di dalam percakapan tersebut.
Dengan begitu, menu dapat teridentifikasi oleh percakapan, sehingga membuatnya dapat segera diaktifkan.

Jika suatu percakapan menyisakan menu tertentu (karena tidak ditutup), menu yang berada di luar dapat kembali mengambil alih.
Sekali lagi, struktur menunya harus sama.

Contoh interoperabilitas ini bisa kamu temukan di [repositori contoh-contoh bot](https://github.com/grammyjs/examples?tab=readme-ov-file#menus-with-conversation-menu-with-conversation).

## Formulir Percakapan

Percakapan sering kali digunakan untuk membuat formulir dalam bentuk tampilan chat.

Semua pemanggilan tunggu atau `wait` mengembalikan object context.
Akan tetapi, ketika menunggu sebuah pesan teks, mungkin kamu hanya ingin mengetahui teks pesannya saja alih-alih isi object context-nya secara keseluruhan.

Kamu bisa menggunakan formulir percakapan untuk melakukan validasi update dengan data yang telah diekstrak dari object context.
Berikut contoh yang mempresentasikan isian formulir:

```ts
await ctx.reply("Silahkan kirim foto yang ingin dikecilkan!");
const foto = await conversation.form.photo();
await ctx.reply("Berapa ukuran lebar foto yang diinginkan?");
const lebar = await conversation.form.int();
await ctx.reply("Berapa ukuran tinggi foto yang diinginkan?");
const tinggi = await conversation.form.int();
await ctx.reply(`Mengecilkan foto menjadi ${width}x${height} ...`);
const hasil = await kecilkanFoto(photo, width, height);
await ctx.replyWithPhoto(hasil);
```

Silahkan kunjungi referensi API [`ConversationForm`](/ref/conversations/conversationform#methods) untuk melihat macam-macam isian lain yang tersedia.

Semua isian formulir menerima function `otherwise` yang akan dijalankan ketika update yang diperoleh tidak cocok.
Selain itu, ia juga menerima function `action` yang akan dijalankan ketika isian formulir telah diisi dengan benar.

```ts
// Tunggu huruf vokal.
const op = await conversation.form.select(["A", "I", "U", "E", "O"], {
  action: (ctx) => ctx.deleteMessage(),
  otherwise: (ctx) => ctx.reply("Hanya menerima A, I, U, E, atau O!"),
});
```

Formulir percakapan bahkan menyediakan cara untuk membuat isian formulir tersuai menggunakan [`conversation.form.build`](/ref/conversations/conversationform#build).

## Batas Waktu Tunggu

Kamu bisa menentukan batas waktu untuk setiap update yang ditunggu.

```ts
// Tunggu selama satu jam sebelum keluar dari percakapan.
const satuJamDalamSatuanMilidetik = 60 * 60 * 1000;
await conversation.wait({ maxMilliseconds: satuJamDalamSatuanMilidetik });
```

[`conversation.now()`](#aturan-utama-ketika-menggunakan-percapakan) akan dipanggil untuk setiap pemanggilan `wait` yang tercapai.

Ketika update selanjutnya tiba, `conversation.now()` akan dipanggil lagi.
Jika update diterima melebihi kurun waktu `maxMilliseconds`, percakapan akan dihentikan, dan update tersebut akan dikembalikan ke sistem middleware.
Middleware hilir kemudian akan dipanggil.

Proses di atas akan membuat percakapan seolah-olah tidak lagi aktif ketika update tersebut tiba.

Yang perlu dicatat adalah kode tidak akan dijalankan tepat setelah waktu yang telah ditentukan terlampaui.
Akan tetapi, ia dijalankan hanya ketika update selanjutnya tiba.

Kamu bisa menentukan nilai batas waktu bawaan untuk semua pemanggilan `wait` di dalam percakapan.

```ts
// Selalu tunggu selama satu jam.
const oneHourInMilliseconds = 60 * 60 * 1000;
bot.use(createConversation(convo, {
  maxMillisecondsToWait: oneHourInMilliseconds,
}));
```

Menetapkan nilai ke pemanggilan `wait` secara langsung akan menimpa nilai bawaan.

## Event Masuk dan Keluar

Jika ingin function tertentu dipanggil setiap kali bot memasuki suatu percakapan, kamu bisa menambahkan function callback ke opsi `onEnter`.
Sama halnya untuk event masuk, kamu juga bisa menerapkannya untuk event keluar di opsi `onExit`.

```ts
bot.use(conversations({
  onEnter(id, ctx) {
    // Memasuki percakapan `id`.
  },
  onExit(id, ctx) {
    // Keluar dari percakapan `id`.
  },
}));
```

Masing-masing callback menerima dua jenis nilai.
Nilai pertama (`id`) adalah string identifikasi untuk percakapan di mana event masuk atau keluar tersebut terjadi.
Nilai kedua (`ctx`) merupakan object context untuk middleware yang ada di sekitarnya.

Yang perlu dicatat adalah callback hanya akan dipanggil ketika event masuk atau keluar dilakukan melalui `ctx.conversation`.
Callback `onExit` juga akan dipanggil ketika percakapan mematikan dirinya sendiri menggunakan `conversation.halt` ataupun saat [batas waktu tunggu](#batas-waktu-tunggu) sudah terlampaui.

## Pemanggilan `wait` Secara Bersamaan

Kita bisa menggunakan [_floating promises_](https://github.com/jellydn/floating-promise-demo/tree/main#what-is-floating-promises) untuk menunggu beberapa _promise_ secara bersamaan---_pada contoh kali ini, kita menggunakan `Promise.all`_.
Ketika update-baru diterima, hanya pemanggilan `wait` pertama yang memiliki kecocokan yang akan terselesaikan.
Misalnya, berdasarkan contoh di bawah, jika user lebih dulu mengirim pesan teks, yang akan terselesaikan terlebih dahulu adalah `conversation.waitFor(":text")`, sementara `conversation.waitFor(":photo")` akan tetap menunggu sampai ada foto yang dikirim.

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

Dari contoh di atas, tidak masalah apakah user mengirimkan foto atau teks terlebih dahulu.
Kedua promise akan terselesaikan sesuai urutan pengiriman dua pesan yang ditunggu oleh kode tersebut.
[`Promise.all`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) juga bekerja secara normal, ia akan selesai jika **semua** promise yang diberikan terselesaikan.

Cara yang sama juga bisa digunakan untuk hal-hal lain.
Sebagai contoh, berikut cara menginstal penyimak keluar global (_global exit listener_) di dalam suatu percakapan:

```ts
conversation.waitForCommand("exit") // tidak menggunakan `await`!
  .then(() => conversation.halt());
```

Begitu [percakapan berakhir](#keluar-dari-percakapan), semua pemanggilan `wait` yang masih tertunda akan dibuang.
Sebagai contoh, percakapan berikut akan selesai begitu saja:

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

Secara internal, ketika beberapa pemanggilan `wait` dicapai dalam waktu yang bersamaan, plugin percakapan akan melacak dan menyimpan daftar pemanggilan `wait` tersebut.
Segera setelah update selanjutnya tiba, ia akan mengulang function pembentuk percakapan tersebut sekali lagi untuk setiap pemanggilan `wait` yang ditemui hingga salah satu diantaranya menerima update tersebut.
Jika di antara pemanggilan `wait` yang tertunda tersebut tidak ada satu pun yang menerima update, maka update tersebut akan dibuang.

## Checkpoints and Going Back in Time

The conversations plugin [tracks](#conversations-are-replay-engines) the execution of your conversations builder function.

This allows you to create a checkpoint along the way.
A checkpoint contains information about how far the function has run so far.
It can be used to later jump back to this point.

Naturally, any actions performed in the meantime will not be undone.
In particular, rewinding to a checkpoint will not magically unsend any messages.

```ts
const checkpoint = conversation.checkpoint();

// Later:
if (ctx.hasCommand("reset")) {
  await conversation.rewind(checkpoint); // never returns
}
```

Checkpoints can be very useful to "go back."
However, like JavaScript's `break` and `continue` with [labels](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label), jumping around can make the code less readable.
**Make sure not to overuse this feature.**

Internally, rewinding a conversation aborts execution like a wait call does, and then replays the function only until the point where the checkpoint was created.
Rewinding a conversation does not literally execute functions in reverse, even though it feels like that.

## Parallel Conversations

Conversations in unrelated chats are fully independent and can always run in parallel.

However, by default, each chat can only have a single active conversation at all times.
If you try to enter a conversation while a conversation is already active, the `enter` call will throw an error.

You can change this behavior by marking a conversation as parallel.

```ts
bot.use(createConversation(convo, { parallel: true }));
```

This changes two things.

Firstly, you can now enter this conversation even when the same or a different conversation is already active.
For example, if you have the conversations `captcha` and `settings`, you can have `captcha` active five times and `settings` active twelve times---all in the same chat.

Secondly, when a conversation does not accept an update, the update is no longer dropped by default.
Instead, control is handed back to the middleware system.

All installed conversations will get a chance to handle an incoming update until one of them accepts it.
However, only a single conversation will be able to actually handle the update.

When multiple different conversations are active at the same time, the middleware order will determine which conversation gets to handle the update first.
When a single conversation is active multiple times, the oldest conversation (the one that was entered first) gets to handle the update first.

This is best illustrated by an example.

::: code-group

```ts [TypeScript]
async function captcha(conversation: Conversation, ctx: Context) {
  const user = ctx.from!.id;
  await ctx.reply("Welcome to the chat! What is the best bot framework?");
  const answer = await conversation.waitFor(":text").andFrom(user);
  if (answer.msg.text === "grammY") {
    await ctx.reply("Correct! Your future is bright!");
  } else {
    await ctx.banAuthor();
  }
}

async function settings(conversation: Conversation, ctx: Context) {
  const user = ctx.from!.id;
  const main = conversation.checkpoint();
  const options = ["Chat Settings", "About", "Privacy"];
  await ctx.reply("Welcome to the settings!", {
    reply_markup: Keyboard.from(options
      .map((btn) => [Keyboard.text(btn)])),
  });
  const option = await conversation.waitFor(":text")
    .andFrom(user)
    .and((ctx) => options.includes(ctx.msg.text), {
      otherwise: (ctx) => ctx.reply("Please use the buttons!"),
    });
  await openSettingsMenu(option, main);
}

bot.use(createConversation(captcha));
bot.use(createConversation(settings));
```

```js [JavaScript]
async function captcha(conversation, ctx) {
  const user = ctx.from.id;
  await ctx.reply("Welcome to the chat! What is the best bot framework?");
  const answer = await conversation.waitFor(":text").andFrom(user);
  if (answer.msg.text === "grammY") {
    await ctx.reply("Correct! Your future is bright!");
  } else {
    await ctx.banAuthor();
  }
}

async function settings(conversation, ctx) {
  const user = ctx.from.id;
  const main = conversation.checkpoint();
  const options = ["Chat Settings", "About", "Privacy"];
  await ctx.reply("Welcome to the settings!", {
    reply_markup: Keyboard.from(options
      .map((btn) => [Keyboard.text(btn)])),
  });
  const option = await conversation.waitFor(":text")
    .andFrom(user)
    .and((ctx) => options.includes(ctx.msg.text), {
      otherwise: (ctx) => ctx.reply("Please use the buttons!"),
    });
  await openSettingsMenu(option, main);
}

bot.use(createConversation(captcha));
bot.use(createConversation(settings));
```

:::

The above code works in group chats.
It provides two conversations.
The conversation `captcha` is used to make sure that only good developers join the chat (shameless grammY plug lol).
The conversation `settings` is used to implement a settings menu in the group chat.

Note that all wait calls filter for a user identifier, among other things.

Let's assume that the following has already happened.

1. You called `ctx.conversation.enter("captcha")` to enter the conversation `captcha` while handling an update from a user with identifier `ctx.from.id === 42`.
2. You called `ctx.conversation.enter("settings")` to enter the conversation `settings` while handling an update from a user with identifier `ctx.from.id === 3`.
3. You called `ctx.conversation.enter("captcha")` to enter the conversation `captcha` while handling an update from a user with identifier `ctx.from.id === 43`.

This means that three conversations are active in this group chat now---`captcha` is active twice and `settings` is active once.

> Note that `ctx.conversation` provides [various ways](/ref/conversations/conversationcontrols#exit) to exit specific conversations even with parallel conversations enabled.

Next, the following things happen in order.

1. User `3` sends a message containing the text `"About"`.
2. An update with a text message arrives.
3. The first instance of the conversation `captcha` is replayed.
4. The `waitFor(":text")` text call accepts the update, but the added filter `andFrom(42)` rejects the update.
5. The second instance of the conversation `captcha` is replayed.
6. The `waitFor(":text")` text call accepts the update, but the added filter `andFrom(43)` rejects the update.
7. All instances of `captcha` rejected the update, so control is handed back to the middleware system.
8. The instance of the conversation `settings` is replayed.
9. The wait call resolves and `option` will contain a context object for the text message update.
10. The function `openSettingsMenu` is called.
    It can send an about text to the user and rewind the conversation back to `main`, restarting the menu.

Note that even though two conversations were waiting for the the users `42` and `43` to complete their captcha, the bot correctly replied to user `3` who had started the settings menu.
Filtered wait calls can determine which updates are relevant for the current conversation.
Disregarded updates fall through and can be picked up by other conversations.

The above example uses a group chat to illustrate how conversations can handle multiple users in parallel in the same chat.
In reality, parallel conversations work in all chats.
This lets you wait for different things in a chat with a single user.

You can combine parallel conversations with [wait timeouts](#wait-timeouts) to keep the number of active conversations low.

## Inspecting Active Conversations

Inside your middleware, you can inspect which conversation is active.

```ts
bot.command("stats", (ctx) => {
  const convo = ctx.conversation.active("convo");
  console.log(convo); // 0 or 1
  const isActive = convo > 0;
  console.log(isActive); // false or true
});
```

When you pass a conversation identifier to `ctx.conversation.active`, it will return `1` if this conversation is active, and `0` otherwise.

If you enable [parallel conversations](#parallel-conversations) for the conversation, it will return the number of times that this conversation is currently active.

Call `ctx.conversation.active()` without arguments to receive an object that contains the identifiers of all active conversations as keys.
The respective values describe how many instances of each conversation are active.

If the conversation `captcha` is active twice and the conversation `settings` is active once, `ctx.conversation.active()` will work as follows.

```ts
bot.command("stats", (ctx) => {
  const stats = ctx.conversation.active();
  console.log(stats); // { captcha: 2, settings: 1 }
});
```

## Migrating From 1.x to 2.x

Conversations 2.0 is a complete rewrite from scratch.

Even though the basic concepts of the API surface remained the same, the two implementations are fundamentally different in how they operate under the hood.
In a nutshell, migrating from 1.x to 2.x results in very little adjustments to your code, but it requires you to drop all stored data.
Thus, all conversations will be restarted.

### Data Migration From 1.x to 2.x

There is no way to keep the current state of conversations when upgrading from 1.x to 2.x.

You should just drop the respective data from your sessions.
Consider using [session migrations](./session#migrations) for this.

Persisting conversations data with version 2.x can be done as described [here](#persisting-conversations).

### Type Changes Between 1.x and 2.x

With 1.x, the context type inside a conversation was the same context type used in the surrounding middleware.

With 2.x, you must now always declare two context types---[an outside context type and an inside context type](#conversational-context-objects).
These types can never be the same, and if they are, you have a bug in your code.
This is because the outside context type must always have [`ConversationFlavor`](/ref/conversations/conversationflavor) installed, while the inside context type must never have it installed.

In addition, you can now install an [independent set of plugins](#using-plugins-inside-conversations) for each conversation.

### Session Access Changes Between 1.x and 2.x

You can no longer use `conversation.session`.
Instead, you must use `conversation.external` for this.

```ts
// Read session data.
const session = await conversation.session; // [!code --]
const session = await conversation.external((ctx) => ctx.session); // [!code ++]

// Write session data.
conversation.session = newSession; // [!code --]
await conversation.external((ctx) => { // [!code ++]
  ctx.session = newSession; // [!code ++]
}); // [!code ++]
```

> Accessing `ctx.session` was possible with 1.x, but it was always incorrect.
> `ctx.session` is no longer available with 2.x.

### Plugin Compatibility Changes Between 1.x and 2.x

Conversations 1.x were barely compatible with any plugins.
Some compatibility could be achieved by using `conversation.run`.

This option was removed for 2.x.
Instead, you can now pass plugins to the `plugins` array as described [here](#using-plugins-inside-conversations).
Sessions need [special treatment](#session-access-changes-between-1-x-and-2-x).
Menus have improved compatibility since the introduction of [conversational menus](#conversational-menus).

### Parallel Conversation Changes Between 1.x and 2.x

Parallel conversations work the same way with 1.x and 2.x.

However, this feature was a common source of confusion when used accidentally.
With 2.x, you need to opt-in to the feature by specifying `{ parallel: true }` as described [here](#parallel-conversations).

The only breaking change to this feature is that updates no longer get passed back to the middleware system by default.
Instead, this is only done when the conversation is marked as parallel.

Note that all wait methods and form fields provide an option `next` to override the default behavior.
This option was renamed from `drop` in 1.x, and the semantics of the flag were flipped accordingly.

### Form Changes Between 1.x and 2.x

Forms were really broken with 1.x.
For example, `conversation.form.text()` returned text messages even for `edited_message` updates of old messages.
Many of these oddities were corrected for 2.x.

Fixing bugs technically does not count as a breaking change, but it is still a substatial change in behavior.

## Plugin Summary

- Name: `conversations`
- [Source](https://github.com/grammyjs/conversations)
- [Reference](/ref/conversations/)
