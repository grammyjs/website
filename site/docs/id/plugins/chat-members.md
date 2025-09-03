---
prev: false
next: false
---

# Plugin Chat Members (`chat-members`)

Telegram tidak menyediakan metode di Bot API untuk mendapatkan informasi anggota chat, sehingga kita perlu mengambilnya secara manual.
Plugin ini mempermudah penggunaan objek `ChatMember`, dengan memberikan cara yang mudah untuk memantau perubahan melalui filter khusus, serta menyimpan dan memperbarui objek.

## Pengenalan

Bekerja dengan objek `ChatMember` dari Telegram Bot API terkadang menyulitkan. Ada beberapa status berbeda yang sering digunakan secara bergatian di sebagian besar aplikasi. Selain itu, status restricted bersifat ambigu karena dapat mewakili baik anggota grup atau pengguna terbatas yang tidak masuk ke dalam grup.

Plugin ini menyederhanakan pengelolaan anggota obrolan dengan menyediakan filter *strongly-typed* untuk pembaruan anggota obrolan.

## Penggunaan

### Fiter Anggota Obrolan

Kamu bisa mendengarkan dua jenis pembaruan terkait anggota obrolan dengan menggunakan bot Telegram: `chat_member` dan `my_chat_member`. 
Keduanya menentukan status lama dan status baru dari pengguna.

- `my_chat_member` pembaruan selalu diterima oleh bot kamu untuk memberi tahu tentang status bot yang diperbaharui di obrolan mana pun, serta ketika pengguna memblokir bot.
- `chat_member` pembaruan hanya diterima jika kamu secara eksplisit menyertakannya dalam daftar pembaharuan yang diizinkan. Pembaruan ini memberi tahu tentang setiap perubahan status penggunaan dalam obrolan dimana bot menjadi **admin**.

Dibandingkan melakukan filter secara manual status lama dan status baru, chat member fiter melakukannya secara otomatis untuk kamu, sehingga kamu dapat bertindak pada transisi apa pun yang kamu butuhkan.
Di dalam *handler*, tipe `old_chat_member` dan `new_chat_member` otomatis dipersempit sesuai dengan kondisinya.

::: code-group

```ts [Typescript]
import { API_CONSTANTS, Bot } from "grammy";
import { chatMemberFilter, myChatMemberFilter } from "@grammyjs/chat-members";

const bot = new Bot("");
const groups = bot.chatType(["group", "supergroup"]);

// TANPA plugin ini, untuk bereaksi ketika user masuk ke grup, kamu harus
// melakukan filter status secara manual, hasilnya membuat kode mudah error dan sulit dibaca.
groups.on("chat_member").filter(
  (ctx) => {
    const { old_chat_member: oldMember, new_chat_member: newMember } =
      ctx.chatMember;
    return (
      (["kicked", "left"].includes(oldMember.status) ||
        (oldMember.status === "restricted" && !oldMember.is_member)) &&
      (["administrator", "creator", "member"].includes(newMember.status) ||
        (newMember.status === "restricted" && newMember.is_member))
    );
  },
  (ctx) => {
    const user = ctx.chatMember.new_chat_member.user;
    await ctx.reply(`Selamat datang ${user.first_name} di grup!`);
  },
);

// DENGAN plugin ini, kode yang digunakan lebih mudah dan memiliki risiko rendah mengalami error.
// Kode dibawah mendengarkan event yang sama tapi jauh lebih sederhana.
groups.filter(chatMemberFilter("out", "in"), async (ctx) => {
  const user = ctx.chatMember.new_chat_member.user;
  await ctx.reply(`Selamat datang ${user.first_name} di grup!`);
});

// Mendengarkan perubahan dimana bot ditambahkan ke grup sebagai pengguna biasa.
groups.filter(myChatMemberFilter("out", "regular"), async (ctx) => {
  await ctx.reply("Halo, terima kasih sudah menambahkan saya ke grup!");
});

// Mendengarkan perubahan dimana bot ditambahkan ke grup sebagai admin.
groups.filter(myChatMemberFilter("out", "admin"), async (ctx) => {
  await ctx.reply("Halo, terima kasih sudah menambahkan saya ke grup sebagai admin!");
});

// Mendengarkan perubahan dimana bot dipromosikan sebagai admin.
groups.filter(myChatMemberFilter("regular", "admin"), async (ctx) => {
  await ctx.reply("Saya di promosikan sebagai admin!");
});

// Mendegarkan perubahan dimana bot dicopot menjadi pengguna biasa.
groups.filter(myChatMemberFilter("admin", "regular"), async (ctx) => {
  await ctx.reply("Saya tidak lagi menjadi admin");
});

bot.start({
  // Pastikan untuk menambahkan tipe update "chat_member" agar handler diatas dapat berjalan.
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

```js [JavaScript]
import { API_CONSTANTS, Bot } from "grammy";
import { chatMemberFilter, myChatMemberFilter } from "@grammyjs/chat-members";

const bot = new Bot("");
const groups = bot.chatType(["group", "supergroup"]);

// TANPA plugin ini, untuk bereaksi ketika user masuk ke grup, kamu harus
// melakukan filter status secara manual, hasilnya membuat kode mudah error dan sulit dibaca.
groups.on("chat_member").filter(
  (ctx) => {
    const { old_chat_member: oldMember, new_chat_member: newMember } =
      ctx.chatMember;
    return (
      (["kicked", "left"].includes(oldMember.status) ||
        (oldMember.status === "restricted" && !oldMember.is_member)) &&
      (["administrator", "creator", "member"].includes(newMember.status) ||
        (newMember.status === "restricted" && newMember.is_member))
    );
  },
  (ctx) => {
    const user = ctx.chatMember.new_chat_member.user;
    await ctx.reply(`Selamat datang ${user.first_name} di grup!`);
  },
);

// DENGAN plugin ini, kode yang digunakan lebih mudah dan memiliki risiko rendah mengalami error.
// Kode dibawah mendengarkan event yang sama tapi jauh lebih sederhana.
groups.filter(chatMemberFilter("out", "in"), async (ctx) => {
  const user = ctx.chatMember.new_chat_member.user;
  await ctx.reply(`Selamat datang ${user.first_name} di grup!`);
});

// Mendengarkan perubahan dimana bot ditambahkan ke grup sebagai pengguna biasa.
groups.filter(myChatMemberFilter("out", "regular"), async (ctx) => {
  await ctx.reply("Halo, terima kasih sudah menambahkan saya ke grup!");
});

// Mendengarkan perubahan dimana bot ditambahkan ke grup sebagai admin.
groups.filter(myChatMemberFilter("out", "admin"), async (ctx) => {
  await ctx.reply("Halo, terima kasih sudah menambahkan saya ke grup sebagai admin!");
});

// Mendengarkan perubahan dimana bot dipromosikan sebagai admin.
groups.filter(myChatMemberFilter("regular", "admin"), async (ctx) => {
  await ctx.reply("Saya di promosikan sebagai admin!");
});

// Mendegarkan perubahan dimana bot dicopot menjadi pengguna biasa.
groups.filter(myChatMemberFilter("admin", "regular"), async (ctx) => {
  await ctx.reply("Saya tidak lagi menjadi admin");
});

bot.start({
  // Pastikan untuk menambahkan tipe update "chat_member" agar handler diatas dapat berjalan.
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

```ts [Deno]
import { API_CONSTANTS, Bot } from "https://deno.land/x/grammy/mod.ts";
import {
  chatMemberFilter,
  myChatMemberFilter,
} from "https://deno.land/x/grammy_chat_members/mod.ts";

const bot = new Bot("");
const groups = bot.chatType(["group", "supergroup"]);

// TANPA plugin ini, untuk bereaksi ketika user masuk ke grup, kamu harus
// melakukan filter status secara manual, hasilnya membuat kode mudah error dan sulit dibaca.
groups.on("chat_member").filter(
  (ctx) => {
    const { old_chat_member: oldMember, new_chat_member: newMember } =
      ctx.chatMember;
    return (
      (["kicked", "left"].includes(oldMember.status) ||
        (oldMember.status === "restricted" && !oldMember.is_member)) &&
      (["administrator", "creator", "member"].includes(newMember.status) ||
        (newMember.status === "restricted" && newMember.is_member))
    );
  },
  (ctx) => {
    const user = ctx.chatMember.new_chat_member.user;
    await ctx.reply(`Selamat datang ${user.first_name} di grup!`);
  },
);

// DENGAN plugin ini, kode yang digunakan lebih mudah dan memiliki risiko rendah mengalami error.
// Kode dibawah mendengarkan event yang sama tapi jauh lebih sederhana.
groups.filter(chatMemberFilter("out", "in"), async (ctx) => {
  const user = ctx.chatMember.new_chat_member.user;
  await ctx.reply(`Selamat datang ${user.first_name} di grup!`);
});

// Mendengarkan perubahan dimana bot ditambahkan ke grup sebagai pengguna biasa.
groups.filter(myChatMemberFilter("out", "regular"), async (ctx) => {
  await ctx.reply("Halo, terima kasih sudah menambahkan saya ke grup!");
});

// Mendengarkan perubahan dimana bot ditambahkan ke grup sebagai admin.
groups.filter(myChatMemberFilter("out", "admin"), async (ctx) => {
  await ctx.reply("Halo, terima kasih sudah menambahkan saya ke grup sebagai admin!");
});

// Mendengarkan perubahan dimana bot dipromosikan sebagai admin.
groups.filter(myChatMemberFilter("regular", "admin"), async (ctx) => {
  await ctx.reply("Saya di promosikan sebagai admin!");
});

// Mendegarkan perubahan dimana bot dicopot menjadi pengguna biasa.
groups.filter(myChatMemberFilter("admin", "regular"), async (ctx) => {
  await ctx.reply("Saya tidak lagi menjadi admin");
});

bot.start({
  // Pastikan untuk menambahkan tipe update "chat_member" agar handler diatas dapat berjalan.
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

:::

Filter mencakup status reguler (*owner*, *administrator*, *member*, *restricted*, *left*, *kicked*) dan beberapa status tambahan untuk kenyamanan:

- `restricted_in`: anggota obrolan dengan status terbatas
- `restricted_out`: bukan anggota obrolan, memiliki batasan
- `in`: anggota obrolan (administrator, pembuat, anggota, restricted_in)
- `out`: bukan anggota obrolan (keluar, ditendang, restricted_out)
- `free`: anggota obrolan tanpa batasan (administrator, pembuat, anggota)
- `admin`: admin obrolan (administrator, pembuat)
- `regular`: anggota obrolan non-admin (anggota, restricted_in)

Sebagai ringkasan, berikut adalah diagram yang menunjukkan setiap query dan padanannya:

![Diagram menunjukkan status yang sesuai dengan setiap query.](/images/chat-members-statuses.svg)

Kamu bisa membuat pengelompokkan kustom dari tipe anggota obrolan dengan memberikan array alih-alih sebuah string.

```typescript
groups.filter(
  chatMemberFilter(["restricted", "kicked"], ["free", "left"]),
  async (ctx) => {
    const from = ctx.from;
    const { status: oldStatus, user } = ctx.chatMember.old_chat_member;
    const lifted = oldStatus === "kicked" ? "ban" : "restrictions";
    await ctx.reply(
      `${from.first_name} lifted ${lifted} from ${user.first_name}`,
    );
  },
);
```

#### Contoh Penggunaan
Cara terbaik untuk menggunakan filter adalah dengan memilih sekumpulan status yang relevan, misalnya `out`, `regular`, dan `admin`, lalu membuat tabel transisi antarstatus tersebut:

| ↱         | `out`       | `regular`            | `admin`             |
| --------- | ----------- | -------------------- | ------------------- |
| `out`     | ban-changed | join                 | join-and-promoted   |
| `regular` | exit        | restrictions-changed | promoted            |
| `admin`   | exit        | demoted              | permissions-changed |

Tetapkan *listener* pada semua transisi yang relevan dengan *use-case* kamu.

Gabungkan filter ini dengan `bot.chatType` untuk hanya mendengarkan transisi pada jenis obrolan tertentu.
Tambahkan sebuah *middleware* untuk mendengarkan semua pembaruan sebagai cara menjalankan operasi umum (seperti memperbarui database) sebelum kontrol dialihkan ke *handler* tertentu.

```typescript
const groups = bot.chatType(["group", "supergroup"]);

groups.on("chat_member", async (ctx, next) => {
  // dijalankan pada semua update bertipe chat_member
  const {
    old_chat_member: { status: oldStatus },
    new_chat_member: { user, status },
    from,
    chat,
  } = ctx.chatMember;
  console.log(
    `Di grup ${chat.id} pengguna ${from.id} mengubah status ${user.id}:`,
    `${oldStatus} -> ${status}`,
  );

  // update data database di sini

  await next();
});

// handler spesifik

groups.filter(chatMemberFilter("out", "in"), async (ctx, next) => {
  const { new_chat_member: { user } } = ctx.chatMember;
  await ctx.reply(`Welcome ${user.first_name}!`);
});
```

### Utilitas Pengecekan Status

Fungsi utilitas `chatMemberIs` berguna ketika kamu inign menggunakan logika *filtering* di dalam sebuah *handler*.
Fungsi ini menerima input berupa salah satu status reguler maupun kustom (atau array status), dan akan mempersempit tipe variabel yang diteruskan.

```ts
bot.callbackQuery("foo", async (ctx) => {
  const chatMember = await ctx.getChatMember(ctx.from.id);

  if (!chatMemberIs(chatMember, "free")) {
    chatMember.status; // "restricted" | "left" | "kicked"
    await ctx.answerCallbackQuery({
      show_alert: true,
      text: "Kamu tidak memiliki izin untuk melakukan ini!",
    });
    return;
  }

  chatMember.status; // "creator" | "administrator" | "member"
  await ctx.answerCallbackQuery("bar");
});
```

### Hydrating Objek Anggota Obrolan
Kamu dapat meningkatkan pengalaman pengembangan dengan menggunakan *hydration* API *transformer*. Transformer ini akan diterapkan pada pemanggilan `getchatMember` dan `getChatAdministrators`, menambahkan metode `is` yang lebih praktis pada objek `ChatMember` yang dikembalikan.

```ts
type MyContext = HydrateChatMemberFlavor<Context>;
type MyApi = HydrateChatMemberApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");

bot.api.config.use(hydrateChatMember());

bot.command("ban", async (ctx) => {
  const author = await ctx.getAuthor();

  if (!author.is("admin")) {
    author.status; // "member" | "restricted" | "left" | "kicked"
    await ctx.reply("Kamu tidak memiliki izin untuk melakukan ini");
    return;
  }

  author.status; // "creator" | "administrator"
  // ...
});
```

### Menyimpan Anggota Chat

Kamu bisa menggunakan [storage adapter](./session#storage-adapter-yang-tersedia) grammY yang valid atau
instance dari kelas apapun yang mengimplementasikan interface [`StorageAdapter`](/ref/core/storageadapter).

Perlu diketahui, berdasarkan [dokumentasi resmi Telegram](https://core.telegram.org/bots/api#getupdates), bot kamu perlu mencantumkan update `chat_member` di array `allowed_updates`, seperti yang ditampilkan pada contoh di bawah.
Artinya, kamu juga perlu mencantumkan event lain yang diperlukan.

::: code-group

```ts [TypeScript]
import { API_CONSTANTS, Bot, type Context, MemorySessionStorage } from "grammy";
import { type ChatMember } from "grammy/types";
import { chatMembers, type ChatMembersFlavor } from "@grammyjs/chat-members";

type MyContext = Context & ChatMembersFlavor;

const adapter = new MemorySessionStorage<ChatMember>();

const bot = new Bot<MyContext>("");

bot.use(chatMembers(adapter));

bot.start({
  // Pastikan untuk mencantumkan tipe update yang sesuai.
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

```js [JavaScript]
import { API_CONSTANTS, Bot, MemorySessionStorage } from "grammy";
import { chatMembers } from "@grammyjs/chat-members";

const adapter = new MemorySessionStorage();

const bot = new Bot("");

bot.use(chatMembers(adapter));

bot.start({
  // Pastikan untuk mencantumkan tipe update yang sesuai.
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

```ts [Deno]
import {
  API_CONSTANTS,
  Bot,
  type Context,
  MemorySessionStorage,
} from "https://deno.land/x/grammy/mod.ts";
import { type ChatMember } from "https://deno.land/x/grammy/types.ts";
import {
  chatMembers,
  type ChatMembersFlavor,
} from "https://deno.land/x/grammy_chat_members/mod.ts";

type MyContext = Context & ChatMembersFlavor;

const adapter = new MemorySessionStorage<ChatMember>();

const bot = new Bot<MyContext>("");

bot.use(chatMembers(adapter));

bot.start({
  // Pastikan untuk mencantumkan tipe update yang sesuai
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

:::

### Membaca Anggota Chat

Plugin ini juga menambahkan function `ctx.chatMembers.getChatMember` untuk memeriksa informasi anggota chat yang tersimpan, sebelum melakukan query ke Telegram.
Apabila anggota itu ada di dalam penyimpanan, maka function akan mengembalikan informasi anggota tersebut.
Sebaliknya, jika tidak tersedia, maka `ctx.api.getChatMember` akan dipanggil dan hasilnya akan disimpan ke dalam penyimpanan, sehingga pemanggilan berikutnya menjadi lebih cepat serta mengurangi pemanggilan berulang ke Telegram untuk user dan chat tersebut di masa mendatang.

Berikut contohnya:

```ts
bot.on("message", async (ctx) => {
  const chatMember = await ctx.chatMembers.getChatMember();

  return ctx.reply(
    `Halo, ${chatMember.user.first_name}! Saya lihat kamu adalah ${chatMember.status} pada obrolan ini!`,
  );
});
```

Function ini menerima parameter opsional berikut:

- `chatId`:
  - Default: `ctx.chat.id`
  - Identifier chat
- `userId`:
  - Default: `ctx.from.id`
  - Identifier pengguna

Kamu bisa membuatnya menjadi seperti ini:

```ts
bot.on("message", async (ctx) => {
  const chatMember = await ctx.chatMembers.getChatMember(
    ctx.chat.id,
    ctx.from.id,
  );
  return ctx.reply(
    `Halo, ${chatMember.user.first_name}! Saya lihat kamu adalah ${chatMember.status} pada obrolan ini!`,
  );
});
```

Function akan menghasilkan error apabila kamu tidak mencantumkan identifier chat atau property `chat` tidak tersedia di dalam context tersebut (misalnya, pada update inline query).
Hal yang sama juga berlaku apabila context tidak memiliki `ctx.from`.

## Aggressive Storage

Opsi konfigurasi `enableAggressiveStorage` akan menginstal middleware untuk menyimpan cache anggota chat tanpa bergantung pada event `chat_member`.
Setiap adanya update, middleware akan memeriksa apakah `ctx.chat` dan `ctx.from` tersedia.
Jika keduanya tersedia, ia kemudian memanggil `ctx.chatMembers.getChatMember` untuk menambahkan informasi anggota ke penyimpanan, jika informasi tersebut belum tersimpan.

Harap perhatikan bahwa ini berarti penyimpanan akan dipanggil **setiap adanya update**, yang mana jumlahnya mungkin sangat banyak, tergantung dari berapa banyak update yang diterima oleh bot.
Plugin ini bisa mempengaruhi performa bot kamu secara signifikan.
Hanya gunakan ini apabila kamu _benar-benar_ paham dengan perilaku, resiko, dan konsekuensinya.

## Ringkasan Plugin

- Nama: `chat-members`
- [Sumber](https://github.com/grammyjs/chat-members)
- [Referensi](/ref/chat-members/)
