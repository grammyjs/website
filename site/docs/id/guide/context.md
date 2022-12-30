---
prev: ./basics.md
next: ./api.md
---

# Context

Object `Context` ([Referensi API grammY](https://deno.land/x/grammy/mod.ts?s=Context)) merupakan komponen penting di grammY.

Setiap kali kamu menambahkan listener ke object bot, listener ini akan menerima sebuah object context.

```ts
// Ini adalah listener atau penyimak. Tugasnya menyimak pesan masuk.
bot.on("message", (ctx) => {
  // `ctx` adalah object `Context`.
});
```

Kamu bisa menggunakan object context untuk:

- [Mengakses informasi tentang pesan tersebut](#informasi-yang-tersedia),
- [Merespon pesan yang diterima](#aksi-yang-tersedia).

Harap diketahui bahwa object context biasanya disebut `ctx`.

## Informasi yang Tersedia

Ketika pengguna mengirim pesan ke bot, kamu dapat mengakses pesan itu melalui `ctx.message`.
Sebagai contoh, untuk mendapatkan pesan teks, kamu dapat melakukan ini:

```ts
bot.on("message", (ctx) => {
  // `txt` akan memiliki type `string` ketika memproses pesan berjenis teks.
  // Atau bisa juga menjadi type `undefined` jika pesan tidak memiliki teks sama sekali,
  // Misalnya foto, stiker, dan jenis pesan lainnya.
  const txt = ctx.message.text;
});
```

Kamu juga dapat mengakses property lain dari object message, misal `ctx.message.chat` untuk memperoleh informasi dari suatu chat asal pesan tersebut dikirim.
Lihat bagian `Message` di [Referensi API Bot Telegram](https://core.telegram.org/bots/api#message) untuk mengetahui data apa saja yang tersedia.
Cara lainnya, kamu dapat dengan mudah menggunakan auto-complete di code editor untuk menelusuri pilihan-pilihan yang tersedia.

Kalau kamu memasang listener untuk jenis pesan lainnya, `ctx` juga akan memberi informasi sesuai dengan jenis pesan tersebut.
Contoh:

```ts
bot.on("edited_message", (ctx) => {
  // Mendapatkan isi pesan baru yang diedit.
  const teksPesan = ctx.editedMessage.text;
});
```

Bahkan, kamu bisa mengakses raw object dari sebuah `Update` yang dikirimkan Telegram ke bot-mu ([Referensi Bot API Telegram](https://core.telegram.org/bots/api#update)).
Object update ini (`ctx.update`) berisi data induk yang menjadi rujukan `ctx.message` dan sejenisnya.

Object context selalu berisi informasi tentang bot-mu, yang dapat diakses melalui `ctx.me`.

### Shortcut

Ada sejumlah shortcut yang tersedia untuk object context.

| Shortcut              | Deskripsi                                                                             |
| --------------------- | ------------------------------------------------------------------------------------- |
| `ctx.msg`             | Mendapatkan object message, termasuk yang sudah diedit                                |
| `ctx.chat`            | Mendapatkan object chat                                                               |
| `ctx.senderChat`      | Mendapatkan object chat pengirim dari `ctx.msg` (untuk pesan grup/channel anonim)     |
| `ctx.from`            | Mendapatkan informasi penulis pesan, callback query, dan lainnya                      |
| `ctx.inlineMessageId` | Mendapatkan id pesan inline dari callback query atau hasil inline yang dipilih        |
| `ctx.entities`        | Mendapatkan entity pesan beserta teksnya, dapat disaring berdasarkan jenis entity-nya |

Dengan kata lain, kamu juga bisa melakukan ini:

```ts
bot.on("message", (ctx) => {
  // Ambil isi pesan teks.
  const teks = ctx.msg.text;
});

bot.on("edited_message", (ctx) => {
  // Ambil isi pesan teks yang diedit.
  const teks = ctx.msg.text;
});

bot.on("message:entities", (ctx) => {
  // Ambil semua jenis entity.
  const entity = ctx.entities();

  // Ambil entity teks pertama.
  entities[0].text;

  // Ambil entity email.
  const email = ctx.entities("email");

  // Ambil entity telepon dan email.
  const teleponDanEmail = ctx.entities(["email", "phone"]);
});
```

Bahkan, jika mau, kamu bisa mengabaikan `ctx.message`, `ctx.channelPost`, `ctx.editedMessage` dan seterusnya, cukup gunakan `ctx.msg` saja.

## Pemeriksaan Melalui Has Checks

Context object memiliki beberapa method yang bisa kamu gunakan untuk memeriksa data yang ada di dalamnya.
Contohnya, kamu bisa memanggil `ctx.hasCommand("start")` untuk memeriksa apakah context object tersebut terdapat sebuah command `/start`.
Itulah kenapa method ini dinamakan _has checks_.

::: tip Kapan Waktu yang Tepat untuk Menggunakan Has Checks?

Method ini menggunakan logika yang sama yang digunakan oleh `bot.command("start")`.
Kami menyarankan kamu untuk selalu menggunakan [filter queries](./filter-queries.md) dan method-method lain yang serupa.
has checks sebaiknya digunakan di [plugin conversations](../plugins/conversations.md).

:::

has checks secara tepat mengerucutkan type context terkait.
Artinya, ia melakukan pengecekan apakah suatu context berisi data callback query.
Jika ditemukan, TypeScript akan diberitahu bahwa context tersebut memiliki field `ctx.callbackQuery.data` di dalamnya.

```ts
if (ctx.hasCallbackQuery(/query-data-\d+/)) {
  // `ctx.callbackQuery.data` ditemukan
  const data: string = ctx.callbackQuery.data;
}
```

Hal yang sama juga berlaku untuk has checks lainnya.
Lihat [referensi API context object](https://deno.land/x/grammy/mod.ts?s=Context#method_has_0) untuk mengetahui semua has checks yang tersedia.
Selain itu, lihat juga [referensi API](https://deno.land/x/grammy/mod.ts?s=Context#Static_Properties) untuk static property `Context.has` yang bisa kamu gunakan untuk membuat predicate function memeriksa beberapa context object secara efisien.

## Aksi yang Tersedia

Jika ingin menanggapi pesan pengguna, kamu bisa menuliskan ini:

```ts
bot.on("message", async (ctx) => {
  // Mendapatkan id chat.
  const idChat = ctx.msg.chat.id;
  // Teks yang akan dikirim.
  const teks = "Pesanmu sudah kuterima!";
  // Kirim balasan.
  await bot.api.sendMessage(idChat, teks);
});
```

Kalau diperhatikan, kamu bisa mencermati ada dua hal yang tidak optimal dari kode tersebut:

1. Kita harus memiliki akses ke object `bot`.
   Berarti, untuk merespon pesan, kita harus meneruskan object `bot` ke seluruh bagian kode.
   Cukup merepotkan ketika kita memiliki lebih dari satu file source code dan memasang listener yang tersebar di berbagai tempat.
2. Kita perlu mengambil id chat dari context tersebut, lalu meneruskannya kembali ke `sendMessage`.
   Hal ini tentu merepotkan juga, karena kemungkinan besar kamu selalu ingin merespon ke pengguna yang sama yang telah mengirim pesan itu.
   Bayangkan betapa seringnya kamu mengetik hal yang sama berulang-ulang!

Mengenai poin 1, object context sudah menyediakan akses ke object API yang sama dengan yang kamu temukan di `bot.api`, yang disebut `ctx.api`.
Kamu sekarang bisa menulis `ctx.api.sendMessage` sebagai gantinya dan tidak perlu lagi meneruskannya ke objek `bot`.
Mudah, bukan?

Tetapi, kehebatan sesungguhnya adalah dalam mengatasi poin 2.
Object context memungkinkan kamu mengirim balasan sesederhana ini:

```ts
bot.on("message", async (ctx) => {
  await ctx.reply("Pesanmu sudah kuterima!");
});

// Atau bahkan lebih singkat lagi:
bot.on("message", (ctx) => ctx.reply("Ok. Diterima, Bos!"));
```

Mantap! :tada:

Di balik layar, context _sudah tahu id chat pesan tersebut_, yaitu `ctx.msg.chat.id`. Jadi, ia hanya perlu menyediakan method `reply` untuk mengirim pesan kembali ke chat yang sama.
Untuk melakukannya, `reply` memanggil kembali `sendMessage` dengan id chat yang sudah terisi sebelumnya. Sehingga, kamu tidak perlu menuliskan id chat lagi.

Efeknya, semua method pada object context sekarang bisa menggunakan opsi-opsi dari object type `Other`, seperti yang sudah dijelaskan [sebelumnya](./basics.md#mengirim-pesan).
Opsi ini dapat digunakan untuk memasukkan konfigurasi lebih lanjut ke setiap pemanggilan API.

::::: tip Fitur Reply Telegram
Meskipun method ini disebut `ctx.reply` di grammY (dan juga di kebanyakan framework lainnya), ia tidak menggunakan [fitur reply dari Telegram](https://telegram.org/blog/replies-mentions-hashtags#replies) dimana pesan sebelumnya terhubung satu sama lain. Lihat [materi sebelumnya](./basics.md#mengirim-pesan-dengan-reply) mengenai fitur reply.

Kalau kamu membaca [Referensi API Bot Telegram](https://core.telegram.org/bots/api#sendmessage), di situ terdapat sejumlah opsi, seperti `parse_mode`, `disable_web_page_preview`, dan `reply_to_message_id`.
Nah, yang opsi terakhir ini bisa digunakan untuk membuat pesan menjadi sebuah reply:

```ts
await ctx.reply("^ Aku me-reply pesan ini!", {
  reply_to_message_id: ctx.msg.message_id,
});
```

Opsi object yang sama dapat juga digunakan di `bot.api.sendMessage` dan `ctx.api.sendMessage`.
Gunakan auto-complete untuk melihat opsi yang tersedia langsung di code editor.
:::::

Umumnya, setiap method di `ctx.api` memiliki shortcut dengan nilai yang sudah terisi sebelumnya, seperti `ctx.replyWithPhoto` untuk membalas menggunakan foto, atau `ctx.exportChatInviteLink` untuk mendapatkan link undangan chat yang bersangkutan.
Jika ingin tahu pintasan apa saja yang tersedia, auto-complete beserta [Referensi API grammY](https://deno.land/x/grammy/mod.ts?s=Context) adalah kawan baikmu.

Harap dicatat bahwa mungkin adakalanya kamu tidak ingin merespon ke chat yang sama.
Untuk itu, kamu bisa kembali menggunakan method `ctx.api`, lalu menentukan sendiri opsi-opsinya.
Sebagai contoh, jika kamu menerima pesan dari Ani lalu hendak meresponnya dengan mengirim pesan ke Budi, maka kamu tidak dapat menggunakan `ctx.reply` karena method ini akan selalu mengirim pesan ke Ani.
Sebagai gantinya, gunakan `ctx.api.sendMessage` lalu tentukan id chat milik Budi.

## Bagaimana Object Context Dibuat

Setiap kali bot menerima pesan baru dari Telegram, pesan tersebut dibungkus dalam sebuah object update.
Bahkan, object update tidak hanya berisi pesan baru, tetapi juga hal-hal lain, seperti pengeditan pesan, jawaban polling, dan [banyak lagi](https://core.telegram.org/bots/api#update).

Untuk setiap update yang masuk, akan dibuatkan persis satu object context baru. Sehingga, context untuk update yang berbeda adalah object yang tidak saling berkaitan. Mereka hanya mereferensikan informasi bot yang sama melalui `ctx.me`.

Object context yang sama untuk satu update akan didistribusikan ke semua [middleware](./middleware.md) bot.

## Memodifikasi Object Context

> Jika kamu masih asing dengan object context, tak perlu risau memikirkan sisa dari halaman ini. Langsung di-skip saja.

Kamu dapat memasang property punyamu sendiri ke sebuah object context.

### Melalui Middleware (Direkomendasikan)

Modifikasi bisa dilakukan dengan mudah melalui [middleware](./middleware.md).

::: tip Middleware? Tupperware jenis apa, tuh?
Materi ini memerlukan pemahaman yang baik mengenai middleware. Jika kamu belum membaca [materi middleware](./middleware.md), berikut ringkasan singkatnya.

Perlu kamu ketahui bahwa beberapa handler mampu memproses object context yang sama. Ada juga sebuah handler khusus yang berfungsi untuk memodifikasi `ctx` sebelum handler-handler lain dijalankan. Hasil modifikasi tersebut akan digunakan oleh handler-handler berikutnya.
:::

Konsepnya adalah middleware harus dipasang sebelum listener.
Dengan begitu, kamu bisa menambahkan property yang diinginkan ke berbagai handler.
Misalnya, jika kamu menambahkan `ctx.namaCustomProperty = valueProperty` ke dalam handler tersebut, maka property `ctx.namaCustomProperty` juga akan tersedia untuk handler-handler yang lain.

Sebagai contoh, katakanlah kamu hendak menambahkan property `ctx.config` di object context.
Nantinya, beberapa konfigurasi akan kita simpan di property tersebut agar bisa diakses oleh semua handler.
Bot akan memakai konfigurasi tersebut untuk membedakan apakah pesan dikirim oleh user biasa atau developer bot itu sendiri.

Tepat sesudah membuat bot, lakukan hal ini:

```ts
const BOT_DEVELOPER = 123456; // Id chat developer si pembuat bot

bot.use(async (ctx, next) => {
  // Modifikasi object context dengan mengatur config-nya.
  ctx.config = {
    botDeveloper: BOT_DEVELOPER,
    isDeveloper: ctx.from?.id === BOT_DEVELOPER,
  };

  // Jalankan handler-handler selanjutnya.
  await next();
});
```

Setelah itu, kamu bisa menggunakan `ctx.config` di handler lain.

```ts
bot.command("start", async (ctx) => {
  // Gunakan context hasil modifikasi di sini!
  if (ctx.config.isDeveloper) await ctx.reply("Selamat datang, Tuanku!");
  else await ctx.reply("Halo, aku adalah bot!");
});
```

Sayangnya, TypeScript tidak mengetahui kalau `ctx.config` telah dimodifikasi meski kamu sudah memasukkan property dengan benar.
Akibatnya, meskipun kode akan bekerja di runtime, tetapi ia tidak bisa di-compile.
Untuk mengatasinya kamu perlu menentukan type context beserta property-nya.

```ts
interface BotConfig {
  botDeveloper: number;
  isDeveloper: boolean;
}

type MyContext = Context & {
  config: BotConfig;
};
```

Type baru `MyContext` sekarang secara akurat mendeskripsikan object context bot kamu.

> Pastikan type yang dibuat sesuai dengan property-property yang kamu gunakan!

Kamu bisa menggunakan type baru dengan memasangnya ke constructor `Bot`.

```ts
const bot = new Bot<MyContext>("<token_bot_kamu>");
```

Hasil akhirnya menjadi seperti ini:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
const BOT_DEVELOPER = 123456; // Id chat developer

// Tentukan type context hasil modifikasi.
interface BotConfig {
  botDeveloper: number;
  isDeveloper: boolean;
}
type MyContext = Context & {
  config: BotConfig;
};

const bot = new Bot<MyContext>("<token_bot_kamu>");

// Atur property yang diinginkan di object context.
bot.use(async (ctx, next) => {
  ctx.config = {
    botDeveloper: BOT_DEVELOPER,
    isDeveloper: ctx.from?.id === BOT_DEVELOPER,
  };
  await next();
});

// Gunakan object context modifikasi ke handler terkait.
bot.command("start", async (ctx) => {
  if (ctx.config.isDeveloper) await ctx.reply("Selamat datang, Tuanku!");
  else await ctx.reply("Halo, aku adalah bot!");
});
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const BOT_DEVELOPER = 123456; // Id chat developer

const bot = new Bot("<token_bot_kamu>");

// Atur property yang diinginkan di object context.
bot.use(async (ctx, next) => {
  ctx.config = {
    botDeveloper: BOT_DEVELOPER,
    isDeveloper: ctx.from?.id === BOT_DEVELOPER,
  };
  await next();
});

// Gunakan object context modifikasi ke handler terkait.
bot.command("start", async (ctx) => {
  if (ctx.config.isDeveloper) await ctx.reply("Selamat datang, Tuanku!");
  else await ctx.reply("Halo, aku adalah bot!");
});
```

</CodeGroupItem>
</CodeGroup>

Type context modifikasi juga bisa diteruskan ke komponen lain yang menangani middleware, contohnya [composer](https://deno.land/x/grammy/mod.ts?s=Composer).

```ts
const composer = new Composer<MyContext>();
```

Beberapa plugin juga mengharuskan kamu menentukan type context modifikasi, contohnya plugin [router](../plugins/router.md) dan plugin [menu](../plugins/menu.md). Type semacam ini dinamakan dengan _context flavor_, seperti yang dijelaskan [di bawah sini](#context-flavor).

### Melalui Inheritance

Cara lain untuk memodifikasi property object context adalah dengan membuat subclass dari class `Context`.

```ts
class MyContext extends Context {
  // ...
}
```

Meski bisa dilakukan, kami lebih merekomendasikan untuk memodifikasi object context [melalui middleware](#melalui-middleware-direkomendasikan), karena ia lebih fleksibel dan bekerja lebih baik ketika dipasang plugin.

Sekarang, kita akan lihat bagaimana caranya.

Ketika membuat bot, kamu bisa meneruskan constructor context hasil modifikasi yang nantinya akan digunakan untuk membuat object context.

Ingat!
Class kamu harus meng-extend `Context`.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context } from "grammy";
import type { Update, UserFromGetMe } from "@grammyjs/types";

// Definisikan class context khusus.
class MyContext extends Context {
  // Tentukan property yang diinginkan.
  public readonly customProp: number;

  constructor(update: Update, api: Api, me: UserFromGetMe) {
    super(update, api, me);
    this.customProp = me.username.length * 42;
  }
}

// Masukkan constructor class context modifikasi sebagai sebuah opsi.
const bot = new Bot("<token>", {
  ContextConstructor: MyContext,
});

bot.on("message", (ctx) => {
  // `ctx` sekarang mempunyai type `MyContext`!
  const prop = ctx.customProp;
});

bot.start();
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript" active>

```ts
const { Bot, Context } = require("grammy");

// Definisikan class context khusus.
class MyContext extends Context {
  // Tentukan property yang diinginkan.
  public readonly customProp;

  constructor(update, api, me) {
    super(update, api, me);
    this.customProp = me.username.length * 42;
  }
}

// Masukkan constructor class context modifikasi sebagai sebuah opsi.
const bot = new Bot("<token>", {
  ContextConstructor: MyContext,
});

bot.on("message", (ctx) => {
  // `ctx` sekarang mempunyai type `MyContext`!
  const prop = ctx.customProp;
});

bot.start();
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import type { Update, UserFromGetMe } from "https://esm.sh/@grammyjs/types";

// Definisikan class context khusus.
class MyContext extends Context {
  // Tentukan property yang diinginkan.
  public readonly customProp: number;

  constructor(update: Update, api: Api, me: UserFromGetMe) {
    super(update, api, me);
    this.customProp = me.username.length * 42;
  }
}

// Masukkan constructor class context modifikasi sebagai sebuah opsi.
const bot = new Bot("<token>", {
  ContextConstructor: MyContext,
});

bot.on("message", (ctx) => {
  // `ctx` sekarang mempunyai type `MyContext`!
  const prop = ctx.customProp;
});

bot.start();
```

</CodeGroupItem>
</CodeGroup>

Perhatikan bagaimana type context hasil modifikasi sudah ditentukan secara otomatis ketika kamu menggunakan subclass.
Sehingga, kamu tidak perlu lagi menulis `Bot<MyContext>` karena constructor subclass sudah ditentukan di dalam opsi object `new Bot()`.

Akan tetapi, dengan menggunakan metode ini membuatnya sangat sulit—bahkan mungkin mustahil—untuk menginstal plugin, karena plugin-plugin tersebut sering kali mengharuskan kamu untuk menggunakan context flavor.

## Context Flavor

Context flavor adalah suatu cara untuk memberitahu TypeScript mengenai adanya property baru di dalam object context-mu.
Property-property ini dapat disertakan di dalam plugin atau module lain yang kemudian diinstal di bot kamu.

Context flavor juga mampu mengubah type property yang sudah ada menggunakan prosedur otomatis yang sudah ditentukan oleh plugin tersebut.

### Additive Context Flavor

Context flavor terdiri atas dua jenis.
Jenis yang paling sederhana disebut dengan _additive context flavor_. Kapanpun kita berbicara mengenai context flavor, yang kita maksud adalah jenis ini.
Mari kita lihat bagaimana cara kerjanya.

Sebagai contoh, ketika kamu memiliki [data session](../plugins/session.md), maka kamu harus menambahkan `ctx.session` ke dalam type context tersebut.
Jika tidak dilakukan

1. Kamu tidak bisa memasang plugin sessions bawaan; dan
2. Kamu tidak memiliki akses ke `ctx.session` di listener kamu.

> Meski kami menggunakan session sebagai contoh, namun ini juga berlaku untuk berbagai hal lainnya.
> Bahkan, sebagian besar plugin menggunakan sebuah context flavor agar kamu bisa menggunakannya dengan baik.

Type context hanyalah sebuah type kecil yang mendefinisikan property-property apa saja yang harus ditambahkan ke dalam type context.
Mari kita lihat contoh flavor berikut.

```ts
interface SessionFlavor<S> {
  session: S;
}
```

Type `SessionFlavor` ([referensi API](https://deno.land/x/grammy/mod.ts?s=SessionFlavor)) di atas cukup sederhana: ia hanya mendefinisikan property `session`.
Ia mengambil type parameter yang akan mendefinisikan struktur asli dari sebuah data session.

Lantas, manfaatnya apa?
Berikut bagaimana kamu bisa memberi flavor ke context dengan data session:

```ts
import { Context, SessionFlavor } from "grammy";

// Deklarasikan `ctx.session` menjadi type `string`.
type MyContext = Context & SessionFlavor<string>;
```

Sekarang kamu dapat menggunakan plugin session serta memiliki akses ke `ctx.session`:

```ts
bot.on("message", (ctx) => {
  // Sekarang `str` memiliki type `string`.
  const str = ctx.session;
});
```

### Transformative Context Flavor

Jenis context flavor yang kedua lebih hebat lagi.
Ketimbang dipasang menggunakan operator `&`, ia cuma perlu dipasang seperti ini:

```ts
import { Context } from "grammy";
import { FlavorA } from "plugin-ku";

type ContextKu = FlavorA<Context>;
```

Selebihnya sama saja.

Setiap plugin—yang resmi—sudah tercantum di dalam dokumentasinya apakah harus menggunakan context flavor jenis _additive_ atau _transformative_.

### Mengombinasikan Context Flavor yang Berbeda

Jika kamu punya beberapa [additive context flavor](#additive-context-flavor) yang berbeda, tinggal dipasang seperti ini:

```ts
type ContextKu = Context & FlavorA & FlavorB & FlavorC;
```

Urutan context flavor tidak berpengaruh, kamu bisa mengurutkannya sesuai keinginan.

Beberapa [transformative context flavor](#transformative-context-flavor) juga bisa dikombinasikan:

```ts
type ContextKu = FlavorX<FlavorY<FlavorZ<Context>>>;
```

Di sini, urutan context flavor akan berpengaruh. `FlavorZ` mengubah `Context` terlebih dahulu, lalu dilanjutkan oleh `FlavorY`, dan hasilnya akan diubah kembali oleh `FlavorX`.

Bahkan kamu bisa mencampur flavor additive dan flavor transformative sekaligus:

```ts
type ContextKu = FlavorX<
  FlavorY<
    FlavorZ<
      Context & FlavorA & FlavorB & FlavorC
    >
  >
>;
```

Pastikan untuk selalu mengikuti pola ini ketika menginstal beberapa plugin.
Kombinasi context flavor yang salah akan mengakibatkan berbagai macam type error.
