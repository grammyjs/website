# Plugin Chat Members (`chat-members`)

Secara otomatis menyimpan informasi pengguna pada percakapan dan mengambilnya dengan mudah.

## Pengenalan

Dalam berbagai situasi, suatu bot perlu memiliki informasi tentang semua pengguna yang pernah melakukan percakapan dengannya.
Akan tetapi, saat ini, API Telegram tidak memiliki metode yang memungkinkan kita untuk mendapatkan informasi tersebut.

Plugin ini hadir untuk membantu: secara otomatis membaca event `chat_member` dan menyimpan setiap objek `ChatMember`.

## Penggunaan

### Menyimpan Percakapan Member

Kamu bisa mengunakan [storage adapter](https://grammy.dev/id/plugins/session.html#known-storage-adapters) grammY yang valid atau
instance dari kelas apapun yang mengimplementasikan interface [`StorageAdapter`](https://deno.land/x/grammy/mod.ts?s=StorageAdapter).

Perhatikan bahwa, sesuai dengan dokumentasi resmi Telegram, bot kamu perlu diberikan update `chat_member` pada array `allowed_updates`, seperti yang ditampilkan pada contoh dibawah.
Ini berarti kamu juga bisa menentukan event lain sesuai yang ingin kamu dapatkan.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context, MemorySessionStorage } from "grammy";
import type { ChatMember } from "grammy/types";
import { chatMembers, ChatMembersFlavor } from "@grammyjs/chat-members";

type MyContext = Context & ChatMembersFlavor;

const adapter = new MemorySessionStorage<ChatMember>();

const bot = new Bot<MyContext>("<token bot kamu>");

bot.use(chatMembers(adapter));

bot.start({
  // Pastikan untuk memberikan tipe update yang spesifik
  allowed_updates: ["chat_member", "message"],
});
```

</CodeGroupItem>

<CodeGroupItem title="JavaScript" active>

```js
import { Bot, Context, MemorySessionStorage } from "grammy";
import { chatMembers, ChatMembersFlavor } from "@grammyjs/chat-members";

const adapter = new MemorySessionStorage();

const bot = new Bot("<token bot kamu>");

bot.use(chatMembers(adapter));

bot.start({
  // Pastikan untuk memberikan tipe update yang spesifik
  allowed_updates: ["chat_member", "message"],
});
```

</CodeGroupItem>

<CodeGroupItem title="Deno" active>

```ts
import {
  Bot,
  Context,
  MemorySessionStorage,
} from "https://deno.land/x/grammy/mod.ts";
import type { ChatMember } from "https://deno.land/x/grammy/types.ts";
import {
  chatMembers,
  ChatMembersFlavor,
} from "https://deno.land/x/grammy_chat_members/mod.ts";

type MyContext = Context & ChatMembersFlavor;

const adapter = new MemorySessionStorage<ChatMember>();

const bot = new Bot<MyContext>("<token bot kamu>");

bot.use(chatMembers(adapter));

bot.start({
  // Pastikan untuk memberikan tipe update yang spesifik
  allowed_updates: ["chat_member", "message"],
});
```

</CodeGroupItem>

</CodeGroup>

### Membaca Pesan Member

Plugin ini juga menambahkan fungsi `ctx.chatMembers.getChatMember` yang akan memeriksa simpanan informasi tentang member chat sebelum melakukan permintaan pada Telegram.
Apabila anggota tersebut ada didalam penyimpanan, maka nanti akan dikembalikan keanggotaannya.
Sebaliknya, jika tidak ada maka nanti `ctx.api.getChatMember` akan dipanggil dan hasilnya akan disimpan dalam penyimpanan, sehingga membuat panggilan berikutnya menjadi lebih cepat dan mengurangi panggilan berulang ke Telegram untuk pengguna tersebut dan obrolannya di masa mendatang.

Berikut ini contohnya:

```ts
bot.on("message", async (ctx) => {
  const chatMember = await ctx.chatMembers.getChatMember();

  return ctx.reply(
    `Halo, ${chatMember.user.first_name}! Saya lihat kamu adalah ${chatMember.status} pada obrolan ini!`,
  );
});
```

Fungsi ini menerima parameter opsional :

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

Perlu diperhatikan, apabila kamu tidak memberikan indetifier chat dan properti `chat` didalam context (misalnya, pada update inline query), maka nantinya akan menghasilkan error.
Sama halnya yang terjadi apabila tidak adanya `ctx.from` pada context.

## Aggressive Storage

Opsi konfigurasi `enableAggressiveStorage` akan menginstal middleware untuk menyimpan cache chat member tanpa bergantung pada event `chat_member`.
Setiap adanya update, middleware akan memeriksa apakah `ctx.chat` dan `ctx.from` ada.
Jika ada, maka ia nanti akan memanggil `ctx.chatMembers.getChatMember` untuk menambahkan informasi anggota pada penyimpanan, jika informasi tersebut tidak ada.

Harap perhatikan bahwa ini berarti penyimpanan akan dipanggil **setiap adanya update**, yang dimana mungkin sangat banyak, tergantung dari berapa banyak update yang diterima oleh bot.
Plugin ini bisa memberikan dampak yang drastis pada performa bot kamu.
Gunakan ini apabila kamu memang _benar-benar_ tahu apa yang kamu lakukan dan kamu setuju dengan resikonya.

## Ringkasan Plugin

- Nama: `chat-members`
- Sumber: <https://github.com/grammyjs/chat-members>
- Referensi: <https://deno.land/x/grammy_chat_members/mod.ts>
