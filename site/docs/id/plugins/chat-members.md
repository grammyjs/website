---
next: false
---

# Plugin Chat Members (`chat-members`)

Mengambil serta menyimpan informasi user dari suatu chat secara mudah dan otomatis.
Plugin ini bekerja dengan cara memantau anggota grup dan channel, lalu menyimpannya ke dalam sebuah daftar.

## Pengenalan

Sering kali, suatu bot perlu memiliki informasi semua pengguna dari suatu chat tertentu.
Sayangnya, hingga saat ini, Telegram belum memiliki method API yang memungkinkan kita untuk mendapatkan informasi tersebut.

Plugin ini hadir untuk membantu!
Ia mampu memantau event `chat_member` serta menyimpan semua object `ChatMember` secara otomatis.

## Penggunaan

### Menyimpan Anggota Chat

Kamu bisa menggunakan [storage adapter](./session#storage-adapter-yang-tersedia) grammY yang valid atau
instance dari kelas apapun yang mengimplementasikan interface [`StorageAdapter`](https://deno.land/x/grammy/mod.ts?s=StorageAdapter).

Perlu diketahui, berdasarkan [dokumentasi resmi Telegram](https://core.telegram.org/bots/api#getupdates), bot kamu perlu mencantumkan update `chat_member` di array `allowed_updates`, seperti yang ditampilkan pada contoh di bawah.
Artinya, kamu juga perlu mencantumkan event lain yang diperlukan.

::: code-group

```ts [TypeScript]
import { Bot, type Context, MemorySessionStorage } from "grammy";
import { type ChatMember } from "grammy/types";
import { chatMembers, type ChatMembersFlavor } from "@grammyjs/chat-members";

type MyContext = Context & ChatMembersFlavor;

const adapter = new MemorySessionStorage<ChatMember>();

const bot = new Bot<MyContext>("");

bot.use(chatMembers(adapter));

bot.start({
  // Pastikan untuk mencantumkan tipe update yang sesuai
  allowed_updates: ["chat_member", "message"],
});
```

```js [JavaScript]
import { Bot, MemorySessionStorage } from "grammy";
import { chatMembers } from "@grammyjs/chat-members";

const adapter = new MemorySessionStorage();

const bot = new Bot("");

bot.use(chatMembers(adapter));

bot.start({
  // Pastikan untuk mencantumkan tipe update yang sesuai
  allowed_updates: ["chat_member", "message"],
});
```

```ts [Deno]
import {
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
  allowed_updates: ["chat_member", "message"],
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
- Sumber: <https://github.com/grammyjs/chat-members>
- Referensi: <https://deno.land/x/grammy_chat_members/mod.ts>
