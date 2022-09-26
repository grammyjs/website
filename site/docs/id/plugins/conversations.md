# Percakapan (`conversations`)

Membuat interaksi percakapan dengan mudah.

## Pengenalan

Sebagian besar chat mengandung lebih dari satu pesan. (ya iyalah :roll_eyes:)

Contohnya, bot kamu sedang mengajukan sebuah pertanyaan lalu menunggu jawaban dari seorang user.
Kegiatan tanya jawab tersebut bisa jadi dilakukan beberapa kali sehingga terjadi sebuah **percakapan**.

Seperti yang sudah kita pelajari di materi sebelumnya, [middleware](../guide/middleware.md) hanya bisa memproses satu [context object](../guide/context.md) untuk setiap handler.
Artinya, setiap pesan yang masuk selalu diproses secara terpisah.
Oleh sebab itu, melakukan sesuatu seperti "Periksa 3 pesan sebelumnya" atau semacamnya sulit dilakukan.

**Plugin ini hadir untuk menyelesaikan permasalahan tersebut.**
Ia mampu membuat dan merangkai sebuah percakapan dengan cara yang sangat fleksibel.

Sebagian besar framework bot di luar sana mengharuskan kamu membuat object konfigurasi berskala besar dengan berbagai macam langkah, tahapan, mantra sihir, kayang dan hal-hal lain yang kamu miliki.
Ini akan menghasilkan banyak sekali kode boilerplate yang membuatnya semakin sulit untuk dimengerti.
**Plugin ini tidak bekerja dengan cara seperti itu.**

Sebaliknya, dengan plugin ini, kamu hanya perlu membuat sebuah function JavaScript biasa yang menentukan bagaimana suatu percakapan akan berlangsung.
Segera setelah bot dan user memulai percakapan, function tersebut akan dieksekusi statement demi statement.

(Sejujurnya, itu bukan cara kerja sebenarnya dari plugin ini.
Tetapi akan jauh lebih mudah dibayangkan dengan cara seperti itu!
Kenyataanya, function tersebut akan dieksekusi dengan cara yang sedikit berbeda.
Kita akan membahasnya [nanti](#menunggu-update).)

## Contoh Sederhana

Sebelum kita membahas lebih dalam bagaimana cara membuat percakapan, silahkan lihat bentuknya terlebih dahulu di contoh singkat JavaScript berikut:

```js
async function greeting(conversation, ctx) {
  await ctx.reply("Halo! Siapa nama kamu?");
  const { message } = await conversation.wait();
  await ctx.reply(`Selamat datang di chat, ${message.text}!`);
}
```

Di percapakan tersebut, pertama-tama bot akan menyapa user lalu menanyakan nama mereka.
Kemudian ia akan menunggu user tersebut mengirimkan namanya.
Terakhir, bot akan menyambut user dengan menyebut nama mereka.

Mudah, bukan?
Sekarang mari kita lihat cara pembuatannya!

## Conversation Builder Function

Pertama-tama, mari import beberapa hal.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const {
  conversations,
  createConversation,
} = require("@grammyjs/conversations");
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations/mod.ts";
```

</CodeGroupItem>
</CodeGroup>

Sekarang, kita bisa mendefinisikan interface conversation.

Elemen utama sebuah conversation adalah sebuah function yang memiliki dua argument.
Kita bisa menyebutnya sebagai _conversation builder function_.

```js
async function greeting(conversation, ctx) {
  // TODO: buat percakapannya
}
```

Mari kita lihat apa sebenarnya kedua parameter tersebut.

**Parameter kedua** tidak terlalu menarik, ia hanyalah sebuah context object biasa.
Seperti biasanya, ia dinamai dengan `ctx` dan menggunakan [custom context type](../guide/context.md#memodifikasi-object-context) buatanmu (misalnya `MyContext`).
Plugin conversations meng-export sebuah [context flavor](../guide/context.md#additive-context-flavor) bernama `ConversationFlavor`.

**Parameter pertama** adalah elemen utama dari plugin ini.
Ia bisanya dinamakan dengan `conversation` dan memiliki type `Conversation` ([referensi API](https://doc.deno.land/https://deno.land/x/grammy_conversations/mod.ts/~/Conversation)).
Ia berfungsi untuk mengontrol suatu percakapan, seperti menunggu input dari user, dsb.
Type `Conversation` mengharapkan [custom context type](../guide/context.md#memodifikasi-object-context) kamu sebagai sebuah type parameter, sehingga kamu akan sering menggunakan `Conversation<MyContext>`.

Di TypeScript, conversation builder function-mu akan terlihat seperti ini:

```ts
type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

async function greeting(conversation: MyConversation, ctx: MyContext) {
  // TODO: buat percakapannya
}
```

Sekarang, kamu bisa menentukan alur dari percakapannya di dalam conversation builder function.
Sebelum membahas fitur-fitur dari plugin ini, mari kita lihat satu contoh lain yang lebih kompleks dibandingkan dengan [contoh sederhana](#contoh-sederhana) di atas.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function movie(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Berapa banyak film favorit yang kamu punya?");
  const count = await conversation.form.number();
  const movies: string[] = [];
  for (let i = 0; i < count; i++) {
    await ctx.reply(`Beritahu aku film yang ke-${i + 1}!`);
    const titleCtx = await conversation.waitFor(":text");
    movies.push(titleCtx.msg.text);
  }
  await ctx.reply("Ini daftar film favorit kamu!");
  movies.sort();
  await ctx.reply(movies.map((m, i) => `${i + 1}. ${m}`).join("\n"));
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function movie(conversation, ctx) {
  await ctx.reply("Berapa banyak film favorit yang kamu punya?");
  const count = await conversation.form.number();
  const movies = [];
  for (let i = 0; i < count; i++) {
    await ctx.reply(`Beritahu aku film yang ke-${i + 1}!`);
    const titleCtx = await conversation.waitFor(":text");
    movies.push(titleCtx.msg.text);
  }
  await ctx.reply("Ini daftar film favorit kamu!");
  movies.sort();
  await ctx.reply(movies.map((m, i) => `${i + 1}. ${m}`).join("\n"));
}
```

</CodeGroupItem>
</CodeGroup>

Bisakah kamu tebak bagaimana hasilnya?

## Menginstal dan Memasuki Sebuah Percakapan

Untuk menggunakan plugin conversations, kamu **diharuskan** memasang [plugin session](./session.md).
Selain itu, plugin conversations itu sendiri harus diinstal terlebih dahulu sebelum kamu menambahkan masing-masing percakapan ke bot.

```ts
// Instal plugin session.
bot.use(session({
  initial() {
    // untuk saat ini kembalikan object kosong
    return {};
  },
}));

// Instal plugin conversation.
bot.use(conversations());
```

Selanjutnya, kamu bisa menginstal conversation builder function sebagai middleware di object bot kamu dengan cara membungkusnya di dalam `createConversation`.

```ts
bot.use(createConversation(greeting));
```

Sekarang, karena conversation sudah ditambahkan ke bot, maka kamu bisa memasuki conversation tersebut dari handler manapun.
Pastikan untuk menggunakan `await` untuk semua method di `ctx.conversation` agar kode kamu bisa berjalan dengan baik.

```ts
bot.command("start", async (ctx) => {
  await ctx.conversation.enter("greeting");
});
```

Segera setelah user mengirim `/start` ke bot, conversation untuk handler tersebut akan dijalankan.
Context object terkait akan diteruskan ke conversation builder function sebagai argumen kedua.
Contohnya, jika kamu membuat conversation dengan `await ctx.reply(ctx.message.text)`, ia akan memiliki update yang di dalamnya terdapat `/start`.

::: tip Mengubah Conversation Identifier

Secara bawaan, kamu diharuskan mengisi nama function ke `ctx.conversation.enter()`.
Jika kamu memilih untuk menggunakan identifier yang berbeda, kamu bisa melakukannya dengan cara seperti ini:

```ts
bot.use(createConversation(greeting, "nama-baru"));
```

Sehingga, kamu bisa memasuki conversation dengan cara seperti ini:

```ts
bot.command("start", (ctx) => ctx.conversation.enter("nama-baru"));
```

:::

Hasil akhir kode kamu kurang lebih terlihat seperti ini:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context, session } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

const bot = new Bot<MyContext>("");

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

/** Tentukan percakapannya */
async function greeting(conversation: MyConversation, ctx: MyContext) {
  // TODO: buat percakapannya
}

bot.use(createConversation(greeting));

bot.command("start", async (ctx) => {
  // Masuk ke function "greeting" yang sudah kamu
  // deklarasikan di atas (baris ke-18)
  await ctx.conversation.enter("greeting");
});

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { Bot, Context, session } = require("grammy");
const {
  conversations,
  createConversation,
} = require("@grammyjs/conversations");

const bot = new Bot("");

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

/** Tentukan percakapannya */
async function greeting(conversation, ctx) {
  // TODO: buat percakapannya
}

bot.use(createConversation(greeting));

bot.command("start", async (ctx) => {
  // Masuk ke function "greeting" yang sudah kamu
  // deklarasikan di atas (baris ke-13)
  await ctx.conversation.enter("greeting");
});

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot, Context, session } from "https://deno.land/x/grammy/mod.ts";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations/mod.ts";

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

const bot = new Bot<MyContext>("");

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

/** Tentukan percakapannya */
async function greeting(conversation: MyConversation, ctx: MyContext) {
  // TODO: buat percakapannya
}

bot.use(createConversation(greeting));

bot.command("start", async (ctx) => {
  // Masuk ke function "greeting" yang sudah kamu
  // deklarasikan di atas (baris ke-18)
  await ctx.conversation.enter("greeting");
});

bot.start();
```

</CodeGroupItem>
</CodeGroup>

### Pemasangan Menggunakan Custom Session Data

Perlu diketahui bahwa jika kamu menggunakan TypeScript dan ingin menyimpan session data sekaligus menggunakan conversation, kamu perlu menyediakan informasi type tambahan ke compiler.
Misalkan kamu memiliki sebuah interface yang mendeskripsikan session data kamu seperti berikut:

```ts
interface SessionData {
  /** custom session property */
  foo: string;
}
```

Maka custom context type kamu akan menjadi seperti ini:

```ts
type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor;
```

Yang perlu diperhatikan adalah kamu perlu menyediakan session data secara eksplisit ketika memasang plugin session dengan penyimpanan eksternal.
Semua storage adapter menyediakan cara untuk kamu meneruskan `SessionData` tersebut sebagai sebuah type parameter.
Contohnya, berikut yang harus kamu lakukan ketika menggunakan [`freeStorage`](./session.md#storage-gratis) milik grammY.

```ts
// Pasang plugin session-nya.
bot.use(session({
  // Tambahkan session type ke adapter.
  storage: freeStorage<SessionData>(bot.token),
  initial: () => ({ foo: "" }),
}));
```

Kamu juga bisa melakukan hal yang sama ke storage adapter lainnya, misal `new FileAdapter<SessionData>()` dan sebagainya.

## Meninggalkan Sebuah Percakapan

Percakapan akan terus berjalan hingga conversation builder function selesai melakukan tugasnya.
Karena itu, kamu bisa meninggalkan sebuah percakapan cukup dengan menggunakan `return`.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function hiAndBye(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Halo! Dan selamat tinggal!");
  // Tinggalkan percakapan:
  return;
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function hiAndBye(conversation, ctx) {
  await ctx.reply("Halo! Dan selamat tinggal!");
  // Tinggalkan percakapan:
  return;
}
```

</CodeGroupItem>
</CodeGroup>

(Iya.. iya.. Kami tahu menambahkan sebuah `return` di akhir function memang tidak terlalu bermanfaat, tetapi setidaknya kamu paham maksud yang kami sampaikan. :slightly_smiling_face:)

Kamu juga bisa meninggalkan percakapan dengan melempar sebuah error.
Jangan lupa untuk [menginstal sebuah error handler](../guide/errors.md) di bot kamu.

Jika ingin menghentikan secara paksa sebuah percakapan yang sedang menunggu input dari user, kamu bisa menggunakan `await ctx.conversation.exit()`.
Biasanya menggunakan `return` di function adalah cara yang lebih baik, tetapi ada kalanya di beberapa kondisi menggunakan `await ctx.conversation.exit()` jauh lebih nyaman.
Selalu ingat untuk memanggil `await`.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts{6,21}
async function movie(conversation: MyConversation, ctx: MyContext) {
  // TODO: buat percakapannya
}

// Instal plugin conversations.
bot.use(conversations());

// Keluar dari semua percakapan ketika command `cancel` dikirim
bot.command("cancel", async (ctx) => {
  await ctx.reply("Keluar.");
  await ctx.conversation.exit();
});

// Keluar dari percakapan `movie` ketika tombol `cancel`
// di inline keyboard ditekan
bot.callbackQuery("cancel", async (ctx) => {
  await ctx.answerCallbackQuery("Keluar dari percakapan");
  await ctx.conversation.exit("movie");
});

bot.use(createConversation(movie));
bot.command("movie", (ctx) => ctx.conversation.enter("movie"));
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js{6,21}
async function movie(conversation, ctx) {
  // TODO: buat percakapannya
}

// Instal plugin conversations.
bot.use(conversations());

// Keluar dari semua percakapan ketika command `cancel` dikirim
bot.command("cancel", async (ctx) => {
  await ctx.reply("Keluar.");
  await ctx.conversation.exit();
});

// Keluar dari percakapan `movie` ketika tombol `cancel` 
// di inline keyboard ditekan
bot.callbackQuery("cancel", async (ctx) => {
  await ctx.answerCallbackQuery("Keluar dari percakapan");
  await ctx.conversation.exit("movie");
});

bot.use(createConversation(movie));
bot.command("movie", (ctx) => ctx.conversation.enter("movie"));
```

</CodeGroupItem>
</CodeGroup>

Perlu dicatat bahwa urutan pemasangan akan berpengaruh.
Kamu harus menginstal plugin conversations (lihat baris ke-6) sebelum memanggil `await ctx.conversation.exit()`.
Selain itu, handler-handler yang menangani cancel juga harus diinstal sebelum conversation aslinya (lihat baris ke-21) ditambahkan.

## Menunggu Update

Kamu bisa menyuruh `conversation` untuk menunggu update selanjutnya dari chat terkait.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function waitForMe(conversation: MyConversation, ctx: MyContext) {
  // Tunggu update selanjutnya:
  const newContext = await conversation.wait();
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function waitForMe(conversation, ctx) {
  // Tunggu update selanjutnya:
  const newContext = await conversation.wait();
}
```

</CodeGroupItem>
</CodeGroup>

Sebuah update baru dapat terjadi karena adanya suatu event, diantaranya adalah pesan telah dikirim, tombol telah ditekan, pesan telah diubah, dan aksi-aksi lain yang dilakukan oleh user.
Lihat daftar lengkapnya di [dokumentasi Telegram](https://core.telegram.org/bots/api#update).

Biasanya, di luar plugin conversations, setiap update akan diproses oleh [sistem middleware](../guide/middleware.md) bot.
Oleh karena itu, bot kamu akan memproses update tersebut melalui context object yang telah diteruskan ke beberapa handler kamu.

Sebaliknya, di plugin conversations, kamu akan memperoleh context object yang baru dari pemanggilan `wait`.
Sehingga, kamu bisa menangani masing-masing update dengan cara yang berbeda-beda berdasarkan object tersebut.
Contohnya, kamu bisa mengecek pesan teks dengan cara seperti ini:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function waitForText(conversation: MyConversation, ctx: MyContext) {
  // Tunggu update selanjutnya:
  ctx = await conversation.wait();
  // Periksa apakah update mengandung teks:
  if (ctx.message?.text) {
    // ...
  }
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function waitForText(conversation, ctx) {
  // Tunggu update selanjutnya:
  ctx = await conversation.wait();
  // Periksa apakah update mengandung teks:
  if (ctx.message?.text) {
    // ...
  }
}
```

</CodeGroupItem>
</CodeGroup>

Selain itu, ada banyak method selain `wait` yang bisa kamu gunakan untuk menunggu update tertentu saja.
Salah satunya adalah `waitFor` yang memanfaatkan sebuah [filter query](../guide/filter-queries.md) untuk menunggu update yang cocok dengan query yang diberikan.
Ini adalah kombinasi yang sempurna bila digunakan bersama [object destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment):
<CodeGroup>
<CodeGroupItem title="TypeScript" active>

```ts
async function waitForText(conversation: MyConversation, ctx: MyContext) {
  // Tunggu update pesan teks selanjutnya:
  const { msg: { text } } = await conversation.waitFor("message:text");
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function waitForText(conversation, ctx) {
  // Tunggu update pesan teks selanjutnya:
  const { msg: { text } } = await conversation.waitFor("message:text");
}
```

</CodeGroupItem>
</CodeGroup>

Lihat [referensi API](https://doc.deno.land/https://deno.land/x/grammy_conversations/mod.ts/~/ConversationHandle#wait) untuk melihat semua method yang serupa dengan `wait`.

## Tiga Aturan Utama Conversations

Terdapat tiga aturan yang berlaku untuk semua kode yang ditulis di dalam sebuah conversation builder function.
Kamu harus menaatinya supaya kodemu bisa berjalan dengan baik.

Gulir [ke bawah](#bagaimana-cara-kerjanya) jika kamu penasaran _kenapa_ aturan tersebut diterapkan dan proses apa yang sebenarnya dilakukan ketika kita memanggil `wait`.

### Aturan I: Semua Side-effect Harus Dibungkus

Kode yang bergantung kepada sistem eksternal, seperti database, API, file atau sumber-sumber lain yang eksekusinya berubah-ubah, harus dibungkus di dalam pemanggilan `conversation.external()`.

```ts
// SALAH
const response = await externalApi();
// BENAR
const response = await conversation.external(() => externalApi());
```

Ini termasuk pembacaan data maupun melakukan [side-effect](https://softwareengineering.stackexchange.com/questions/40297/what-is-a-side-effect) (misalnya menulis ke sebuah database).

::: tip Serupa dengan React

Jika kamu familiar dengan React, kamu mungkin paham sebuah konsep yang serupa dengan `useEffect`.

:::

### Aturan II: Semua Perilaku Acak Harus Dibungkus

Kode yang bergatung pada hal-hal acak atau nilai global yang dapat berubah, harus dibungkus semua aksesnya ke dalam pemanggilan `conversation.external()`, atau bisa juga menggunakan function convenience `conversation.random()`.

```ts
// SALAH
if (Math.random() < 0.5) { /* ... */ }
// BENAR
if (conversation.random() < 0.5) { /* ... */ }
```

### Aturan III: Gunakan Convenience Functions

Plugin `conversation` memiliki banyak sekali function untuk memudahkan pekerjaan kamu.
Kode kamu memang akan baik-baik saja meski tidak menggunakannya, namun ia akan menjadi lambat atau memiliki perilaku yang sulit diprediksi.
Meski begitu, user kamu kemungkinan besar tidak akan menyadari perbedaanya.

```ts
// `sleep` menggunakan `conversation` akan meningkatkan performa secara signifikan
await conversation.sleep(3000); // 3 detik

// Hasil pencatatan debug menggunakan `conversation` jauh lebih mudah dibaca
conversation.log("Hello, world");
```

Perlu diketahui bahwa kamu juga bisa melakukan hal-hal di atas melalui `conversation.external()`, tetapi akan jauh lebih mudah untuk menggunakan convenience functions ([referensi API](https://doc.deno.land/https://deno.land/x/grammy_conversations/mod.ts/~/ConversationHandle#Methods)).

## Variable, Percabangan, dan Perulangan

Sekarang kita akan memahami beberapa konsep yang sudah dipelajari di dunia pemrograman serta menerapkannya untuk menciptakan sebuah conversation yang bersih dan mudah dibaca.

Bayangkan semua kode di bawah ditulis di dalam sebuah conversation builder function.

Kamu bisa mendeklarasikan variable dan melakukan apapun kepadanya:

```ts
await ctx.reply(
  "Kirim angka-angka favoritmu, pisahkan tiap angka dengan koma!",
);
const { message } = await conversation.wait();
const sum = message.text
  .split(",")
  .map((n) => parseInt(n.trim(), 10))
  .reduce((x, y) => x + y);
await ctx.reply("Jumlah dari angka-angka tersebut adalah: " + sum);
```

Percabangan juga bisa dilakukan:

```ts
await ctx.reply("Kirim sebuah foto!");
const { message } = await conversation.wait();
if (!message?.photo) {
  await ctx.reply("Itu bukan foto! Aksi dibatalkan.");
  return;
}
```

Serta perulangan:

```ts
do {
  await ctx.reply("Kirim sebuah foto!");
  ctx = await conversation.wait();

  if (ctx.message?.text === "/cancel") {
    await ctx.reply("Aksi dibatalkan!");
    return;
  }
} while (!ctx.message?.photo);
```

## Function dan Recursion

Kamu juga bisa membagi kode ke beberapa function lalu menggunakannya kembali.
Berikut contoh captcha sederhana yang bisa dipakai berulang kali:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function captcha(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply(
"Buktikan kalau kamu manusia! \
    Apa jawaban untuk kehidupan, alam semesta, dan semuanya?",
  );
  const { message } = await conversation.wait();
  return message?.text === "42";
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function captcha(conversation, ctx) {
  await ctx.reply(
"Buktikan kalau kamu manusia! \
    Apa jawaban untuk kehidupan, alam semesta, dan semuanya?",
  );
  const { message } = await conversation.wait();
  return message?.text === "42";
}
```

</CodeGroupItem>
</CodeGroup>

Ia akan mengembalikan nilai `true` jika user menjawab dengan benar atau `false` jika salah.
Kamu sekarang bisa menggunakannya di conversation builder function seperti ini:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function enterGroup(conversation: MyConversation, ctx: MyContext) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("Selamat datang!");
  else await ctx.banChatMember();
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function enterGroup(conversation, ctx) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("Selamat datang!");
  else await ctx.banChatMember();
}
```

</CodeGroupItem>
</CodeGroup>

Perhatikan bagaimana function captcha di atas bisa digunakan kembali di berbagai tempat di kode kamu.

> Contoh sederhana di atas hanya digunakan untuk memberi gambaran cara kerja dari suatu function.
> Pada kenyataanya, kode tersebut tidak akan bekerja dengan baik karena ia asal menerima update baru tanpa memverifikasi apakah pesan berasal dari user yang sama atau tidak.
> Jika kamu ingin membuat sebuah captcha sungguhan, kamu bisa menggunakan [percakapan paralel](#percakapan-paralel).

Kamu juga bisa membagi kode menjadi beberapa function, recursion, mutual recursion, generator, dan sebagainya.
(Kamu cuma perlu memastikan function-function tersebut mengikuti [ketiga aturan ini](#tiga-aturan-utama-conversations).)

Error handling semestinya juga bisa digunakan di function kamu.
Statement `try`/`catch` biasa juga dapat bekerja dengan baik di berbagai function.
Lagi pula, conversations hanyalah sebuah JavaScript, jadi seharusnya tidak ada masalah.

Kalau function conversation utama melempar sebuah error, maka error tersebut akan diteruskan ke [mekanisme penanganan error](../guide//errors.md) kamu.

## Module dan Class

Normalnya, kamu bisa memindahkan function ke berbagai module.
Dengan cara seperti itu, beberapa function bisa dibuat dan di-`export` di dalam satu file saja, kemudian digunakan kembali di file lain dengan cara di-`import`.

Kamu juga bisa membuat beberapa class:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
class Auth {
  public token?: string;

  constructor(private conversation: MyConversation) {}

  authenticate(ctx: MyContext) {
    const link = getAuthLink(); // ambil link autentikasi dari sistem kamu
    await ctx.reply(
"Buka link ini untuk mendapatkan sebuah token \
      lalu kirim tokennya ke aku: " + link,
    );
    ctx = await this.conversation.wait();
    this.token = ctx.message?.text;
  }

  isAuthenticated(): this is Auth & { token: string } {
    return this.token !== undefined;
  }
}

async function askForToken(conversation: MyConversation, ctx: MyContext) {
  const auth = new Auth(conversation);
  await auth.authenticate(ctx);
  if (auth.isAuthenticated()) {
    const token = auth.token;
    // lakukan sesuatu dengan tokennya
  }
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
class Auth {
  constructor(conversation) {
    this.#conversation = conversation;
  }

  authenticate(ctx) {
    const link = getAuthLink(); // ambil link autentikasi dari sistem kamu
    await ctx.reply(
"Buka link ini untuk mendapatkan sebuah token \
      lalu kirim tokennya ke aku: " + link,
    );
    ctx = await this.#conversation.wait();
    this.token = ctx.message?.text;
  }

  isAuthenticated() {
    return this.token !== undefined;
  }
}

async function askForToken(conversation, ctx) {
  const auth = new Auth(conversation);
  await auth.authenticate(ctx);
  if (auth.isAuthenticated()) {
    const token = auth.token;
    // lakukan sesuatu dengan tokennya
  }
}
```

</CodeGroupItem>
</CodeGroup>

Kami tidak merekomendasikan kamu untuk melakukan cara di atas.
Kode di atas hanyalah sebuah contoh untuk menunjukkan bagaimana kamu bisa memanfaatkan fleksibilitas JavaScript untuk membuat struktur kode kamu.

## Form

> Catatan terjemahan: `form` disini artinya bentuk atau jenis (misal angka, teks, dll) bukan form untuk isian.

Seperti yang sudah dijelaskan [sebelumnya](#menunggu-update), conversation handle memiliki beberapa function utilitas, misalnya `await conversation.waitFor('message:text')` yang hanya mengembalikan update berupa pesan teks.

Jika method-method tadi belum cukup, plugin conversations menyediakan beberapa function pembantu untuk membuat berbagai form menggunakan `conversation.form`.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function waitForMe(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Berapa umur kamu?");
  const age: number = await conversation.form.number();
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function waitForMe(conversation, ctx) {
  await ctx.reply("Berapa umur kamu?");
  const age = await conversation.form.number();
}
```

</CodeGroupItem>
</CodeGroup>

Seperti biasa, lihat [referensi API](https://doc.deno.land/https://deno.land/x/grammy_conversations/mod.ts/~/ConversationForm) untuk mengetahui method apa saja yang tersedia.

## Percakapan Paralel

Normalnya, plugin conversations bisa melakukan berbagai percakapan dari chat yang berbeda secara paralel.

Namun, jika bot kamu berada di sebuah chat grup, kemungkinan besar kamu ingin bot melakukan beberapa percakapan dengan user yang berbeda _di dalam chat yang sama_.
Misalnya, kamu memiliki sebuah bot dengan fitur captcha yang aktif untuk setiap member yang baru bergabung ke grup.
Jika dua member bergabung secara bersamaan, bot seharusnya mampu melakukan dua percakapan dengan mereka secara terpisah.

Itulah kenapa plugin conversation menyediakan cara agar kamu bisa membuat beberapa percakapan untuk setiap chat di waktu yang bersamaan.
Contohnya, kita bisa memiliki lima percakapan yang berbeda dengan lima user baru dan di waktu yang sama melakukan percakapan dengan seorang admin mengenai pengaturan chat yang baru.

### Bagaimana Cara Kerjanya?

Setiap update yang masuk akan diproses oleh salah satu dari beberapa percakapan yang aktif.
Mirip dengan handle di middleware, percakapan-percakapan tadi akan dipanggil secara berurutan berdasarkan siapa yang lebih dulu dipasang.
Jika sebuah percakapan dijalankan beberapa kali, ia akan dipanggil berdasarkan urutan kronologis.

Nah, setiap percakapan yang dipanggil tadi akan memutuskan apakah memproses update tersebut atau memanggil `await conversation.skip()`.
Jika memilih pilihan pertama, update tersebut akan dipakai selama conversation terkait memprosesnya.
Sebaliknya, jika pilihan kedua dipilih, update tersebut akan ditolak dan diteruskan ke percakapan berikutnya.
Jika tidak ada percakapan yang memproses update tersebut, control flow akan meneruskannya kembali ke sistem middleware yang kemudian akan ditangani oleh handler berikutnya.

Sehingga, kamu bisa memulai sebuah percakapan baru dari middleware biasa.

### Cara Penggunaan

Dalam praktiknya, kamu tidak perlu memanggil `await conversation.skip()` sama sekali.
Sebaliknya, kamu cukup menggunakan `await conversation.waitFrom(userId)` untuk mengurus semuanya.
Ini memungkinkan kamu untuk mengobrol ke satu user saja di dalam sebuah chat grup.

Sebagai contoh, mari kita implementasikan kembali contoh captcha di atas, tetapi kali ini kita gunakan di percakapan paralel.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts{7}
async function captcha(conversation: MyConversation, ctx: MyContext) {
  if (ctx.from === undefined) return false;
  await ctx.reply(
    "Buktikan kalau kamu manusia! \
    Apa jawaban untuk kehidupan, alam semesta, dan semuanya?",
  );
  const { message } = await conversation.waitFrom(ctx.from);
  return message?.text === "42";
}

async function enterGroup(conversation: MyConversation, ctx: MyContext) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("Selamat datang!");
  else await ctx.banChatMember();
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js{7}
async function captcha(conversation, ctx) {
  if (ctx.from === undefined) return false;
  await ctx.reply(
    "Buktikan kalau kamu manusia! \
    Apa jawaban untuk kehidupan, alam semesta, dan semuanya?",
  );
  const { message } = await conversation.waitFrom(ctx.from);
  return message?.text === "42";
}

async function enterGroup(conversation, ctx) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("Selamat datang!");
  else await ctx.banChatMember();
}
```

</CodeGroupItem>
</CodeGroup>

Perhatikan bagaimana kita menunggu pesan yang berasal dari user tertentu saja.

Sekarang kita bisa membuat handler sederhana yang akan membuat percakapan baru ketika member baru bergabung.

```ts
bot.on("chat_member")
  .filter((ctx) => ctx.chatMember.old_chat_member.status === "left")
  .filter((ctx) => ctx.chatMember.new_chat_member.status === "member")
  .use((ctx) => ctx.conversation.enter("enterGroup"));
```

### Memeriksa Percakapan yang Sedang Aktif

Kamu bisa melihat jumlah percakapan yang sedang aktif beserta identifier-nya.

```ts
const stats = ctx.conversation.active;
console.log(stats); // { "enterGroup": 1 }
```

Ia akan ditampilkan dalam bentuk sebuah object yang berisi key berupa identifier dan jumlah percakapan yang sedang berlangsung untuk setiap identifier.

## Bagaimana Cara Kerjanya?

> Masih ingat dengan [tiga aturan](#tiga-aturan-utama-conversations) yang harus ditaati untuk kode yang berjalan di dalam conversation builder function?
> Sekarang kita akan mencari tahu _mengapa_ aturan tersebut diterapkan.

Sebelum membahas detail-detailnya, kita akan melihat terlebih dahulu konsep kerja dari plugin ini.

### Bagaimana Cara Kerja Pemanggilan `wait`?

Mari kita ubah perspektif dan bertanya dari sudut pandang developer plugin ini.
Bagaimana sebaiknya kita mengimplementasikan sebuah pemanggilan `wait` di dalam sebuah plugin?

Pendekatan sederhana untuk mengimplementasikan sebuah pemanggilan `wait` di plugin conversations adalah dengan membuat sebuah promise lalu menunggu hingga context object berikutnya tiba.
Setelah itu, kita resolve promise-nya kemudian conversation bisa dilanjutkan kembali.

Sayangnya, pendekatan seperti itu adalah sebuah ide yang buruk karena alasan-alasan berikut:

**Data Loss.**
Bagaimana jika tiba-tiba server kamu crash ketika menunggu sebuah context object?
Sudah pasti kamu akan kehilangan semua informasi state dari conversation yang sedang berlangsung.
Singkatnya, bot "lupa" sudah sampai mana alur percakapannya terjadi, sehingga user harus memulainya dari awal.
Ini adalah desain yang buruk dan merepotkan.

**Blocking.**
Jika pemanggilan `wait` menghalangi sampai update berikutnya tiba, berarti pemrosesan middleware tidak akan bisa diselesaikan hingga percakapan selesai seluruhnya.

- Untuk built-in polling, artinya update berikutnya tidak akan diproses sama sekali hingga update tersebut diselesaikan.
  Ini mengakibatkan bot kamu terhalangi selamanya.
- Untuk [grammY runner](./runner.md), bot tidak akan terhalangi.
  Tetapi, ketika memproses ribuan percakapan dari berbagai user secara paralel, ia akan mengonsumsi banyak sekali memory.
  Jika banyak user yang berhenti merespon, bot akan terjebak diantara banyak sekali percakapan.
- Webhooks juga mempunyai [masalahnya sendiri](../guide/deployment-types.md#mengakhiri-request-webhook-tepat-waktu) karena middleware yang terus berjalan tanpa henti.

**State.**
Di infrastruktur serverless seperti cloud functions, kita tidak bisa memastikan instance yang sama memproses dua update dari user yang sama berturut-turut.
Sehingga, jika kita membuat stateful conversation, bisa dipastikan ia tidak akan berjalan dengan baik karena middleware lain tiba-tiba dieksekusi sementara pemanggilan `wait` masih belum terselesaikan.
Ini akan menimbulkan banyak kekacauan dan bug secara acak.

Dan masalah-masalah lainnya.

Oleh karena itu, plugin conversations melakukannya dengan cara yang berbeda.
Benar-benar berbeda.
Seperti yang telah dijabarkan di awal, **Ia tidak akan membuat bot kamu menunggu _begitu saja_**, meski kita bisa saja memprogram conversations seolah-olah itu terjadi.

Plugin conversations akan memantau proses eksekusi function kamu.
Ketika pemanggilan wait dilakukan, ia akan men-serialize state dari eksekusi tersebut ke dalam session, yang selanjutnya akan disimpan dengan aman di sebuah database.
Ketika update selanjutnya tiba, ia akan memeriksa data session terlebih dahulu.
Jika ternyata ia sedang ditengah-tengah sebuah percakapan, state dari ekseskusi tersebut akan di-deserialize, lalu conversation builder function akan mengulanginya kembali di titik di mana pemanggilan `wait` sebelumnya dilakukan.
Kemudian ia akan melanjutkan kembali eksekusi function kamu seperti biasanya---hingga pemanggilan `wait` selanjutnya dilakukan dan eksekusinya harus ditunda lagi.

Apa saja yang termasuk state eksekusi?
State eksekusi terdiri atas tiga hal:

1. Update yang masuk.
2. Pemanggilan keluar API.
3. Event dan pengaruh eksternal, seperti hal-hal acak ataupun pemanggilan ke beberapa API eksternal atau database.

Apa maksudnya _mengulang kembali_ di penjelasan di atas?
Mengulang kembali artinya memanggil function dari awal secara teratur, tetapi ketika ia memanggil `wait` atau melakukan pemanggilan API, kita tidak melakukan aksi tersebut sama sekali.
Sebaliknya, kita mengecek atau mencatat log posisi dari eksekusi sebelumnya serta nilai yang dikembalikan pada saat itu.
Kemudian, kita menginjeksi nilai-nilai tersebut ke conversation builder function sehingga proses eksekusi terjadi begitu cepat---hingga log kita benar-benar habis.
Saat itu terjadi, kita kembali menggunakan mode eksekusi normal, yang mana kita berhenti menginjeksi nilai-nilai tadi dan beralih melakukan pemanggilan API yang sebenarnya.

Itulah kenapa plugin ini perlu memantau semua update yang masuk serta pemanggilan API Bot yang keluar (lihat poin 1 dan 2 di atas).
Namun, ia tidak bisa mengontrol event yang terjadi dari luar, side-effect, atau hal acak.
Sebagai contoh, kamu bisa melakukan ini:

```ts
if (Math.random() < 0.5) {
  // Lakukan sesuatu
} else {
  // Lakukan sesuatu yang lain
}
```

Dalam hal ini, ketika function dipanggil, ia akan berperilaku acak setiap waktu, sehingga dengan mengulang kembali function tersebut akan membuat semuanya berantakan.
Itulah kenapa adanya poin ketiga di atas, dan diharuskan mengikuti [tiga aturan utama](#tiga-aturan-utama-conversations).

### Bagaimana Cara Memotong Eksekusi dari Suatu Function

Secara konsep, keyword `async` dan `await` memberi kita kontrol di thread mana akan dilakukan [preempted](https://en.wikipedia.org/wiki/Preemption_(computing)).
Sehingga, jika seseorang memanggil `await conversation.wait()`, yang mana adalah sebuah function dari library kita, kita diberi kuasa untuk me-preempt eksekusi tersebut.

Secara konkret, rahasia utama yang membolehkan kita memotong eksekusi dari suatu function adalah sebuah `Promise` yang tidak pernah di-resolve.

```ts
await new Promise<never>(() => {}); // BOOM
```

Jika kamu melakukan `await` ke promise tersebut di file JavaScript manapun, runtime kamu akan mati di saat itu juga.
(Silahkan salin kode di atas ke dalam sebuah file lalu coba jalankan.)

Karena kita jelas tidak ingin mematikan runtime JS, maka kita perlu menangkapnya sekali lagi.
Lantas, bagaimana cara kamu melakukannya?
(Jangan ragu untuk memeriksa source code plugin ini jika masih belum tahu jawabannya)

## Ringkasan Plugin

- Nama: `conversations`
- Sumber: <https://github.com/grammyjs/conversations>
- Referensi: <https://doc.deno.land/https://deno.land/x/grammy_conversations/mod.ts>
