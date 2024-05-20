# Reaksi

Bot mampu memproses reaksi pesan.
Reaksi sendiri terdiri atas dua macam: reaksi emoji dan reaksi emoji tersuai (custom emoji).

## Mereaksi Suatu Pesan

Bot bisa menambahkan satu reaksi emoji ke suatu pesan.

Bot juga bisa bereaksi dengan emoji tersuai meski ia tidak memiliki [Telegram Premium](https://telegram.org/faq_premium?setln=id).
Ketika seorang pengguna premium menambahkan sebuah reaksi emoji tersuai ke suatu pesan, bot bisa menambahkan reaksi yang sama ke pesan tersebut.
Selain itu, jika administrator chat secara explisit mengizinkan penggunaan emoji tersuai, emoji-emoji tersebut bisa digunakan oleh bot di chat tersebut juga.

Berikut cara mereaksi suatu pesan:

```ts
// `ctx.react` untuk mereaksi pesan saat ini.
bot.command("start", (ctx) => ctx.react("😍"));
bot.on("message", (ctx) => ctx.react("👍"));

// `ctx.api.setMessageReaction` untuk mereaksi pesan tertentu.
bot.on("message", async (ctx) => {
  await ctx.api.setMessageReaction(chat_id, message_id, "🎉");
});

// Penggunaan `bot.api.setMessageReaction` tanpa handler.
await bot.api.setMessageReaction(chat_id, message_id, "💯");
```

Seperti biasa, TypeScript akan menyediakan auto-complete daftar emoji yang bisa digunakan.
Daftar reaksi emoji yang tersedia ada di [halaman berikut](https://core.telegram.org/bots/api#reactiontypeemoji).

::: tip Plugin Emoji
Membuat program yang melibatkan emoji seringkali merepotkan.
Tidak semua sistem mampu menampilkan source code kamu dengan benar.
Selain itu, menyalin emoji dari tempat lain berulang kali tentu melelahkan.

Serahkan semua masalahmu ke [plugin emoji](../plugins/emoji#data-praktis-untuk-reaksi)!
:::

Sekarang kita tahu bagaimana cara merekasi suatu pesan, selanjutnya mari kita lihat bagaimana cara menangani reaksi dari user.

## Menerima Update Reaksi

Terdapat beberapa cara untuk menangani update berupa reaksi.
Di chat pribadi dan grup, bot akan menerima sebuah update `message_reaction` jika seorang user mengubah reaksi suatu pesan.
Di channel (atau postingan channel yang diteruskan ke grup secara otomatis), bot akan menerima sebuah update `message_reaction_count` yang berisi jumlah total reaksinya saja, tanpa menampilkan siapa yang mereaksi.

Untuk menerima update kedua jenis reaksi tersebut, kamu perlu mengaktifkannya terlebih dahulu.
Berikut contoh cara mengaktifkannya dengan menggunakan [long polling](./deployment-types#long-polling-vs-webhook) bawaan.

```ts
bot.start({
  allowed_updates: ["message", "message_reaction", "message_reaction_count"],
});
```

::: tip Mengaktifkan Semua Jenis Update
Untuk menerima semua jenis update, import `API_CONSTANTS` dari grammY lalu cantumkan di bagian `allowed_updates`.

```ts
allowed_updates: API_CONSTANTS.ALL_UPDATE_TYPES;
```

Jangan lupa untuk membaca [Referensi API](/ref/core/apiconstants#all-update-types)-nya.
:::

Di [grammY runner](../plugins/runner#opsi-tingkat-lanjut) dan `setWebhook`, `allowed_updates` juga bisa diatur dengan cara yang sama.

Sekarang bot sudah bisa menerima update reaksi.
Selanjutnya, mari kita lihat cara menangani update tersebut!

### Menangani Reaksi Baru

Menangani reaksi yang baru saja ditambahkan sangatlah mudah.
Dalam hal ini, grammY menyediakan dukungan khusus melalui `bot.reaction`.

```ts
bot.reaction("🎉", (ctx) => ctx.reply("Horeee!!!"));
bot.reaction(["👍", "👎"], (ctx) => ctx.reply("Terima kasih atas jempolnya"));
```

Handler di atas akan terpicu ketika user menambahkan sebuah reaksi emoji baru ke suatu pesan.

Secara umum, bot bisa menyimak reaksi emoji tersuai dari user premium dengan cara berikut:

```ts
bot.reaction(
  { type: "custom_emoji", custom_emoji_id: "string-identifikasi" },
  async (ctx) => {/* ... */},
);
```

Untuk menggunakan kode di atas, kamu perlu mengetahui id emoji tersuainya terlebih dahulu.

### Menangani Perubahan Reaksi yang Tidak Terduga

Meski tidak terlihat di UI aplikasi Telegram resmi, user sebenarnya mampu mengubah beberapa reaksi sekaligus.
Itulah kenapa update reaksi menyediakan dua daftar: reaksi sebelumnya dan reaksi yang baru.
Dengan begitu, bot bisa menangani perubahan tak terduga di daftar reaksi.

```ts
bot.on("message_reaction", async (ctx) => {
  const reaction = ctx.messageReaction;
  // Di sini, kita hanya memperoleh id pesan, bukan isi pesannya.
  const message = reaction.message_id;
  // Perubahan akan terlihat dengan membandingkan kedua daftar berikut.
  const old = reaction.old_reaction; // reaksi sebelumnya
  const now = reaction.new_reaction; // reaksi saat ini
});
```

grammY mampu mengerucutkan update untuk jenis reaksi tertentu dengan [filter query](./filter-queries) khusus.

```ts
// Update reaksi saat ini yang mengandung minimal satu emoji.
bot.on("message_reaction:new_reaction:emoji", (ctx) => {/* ... */});
// Updates reaksi sebelumnya yang mengandung minimal satu emoji tersuai.
bot.on("message_reaction:old_reaction:custom_emoji", (ctx) => {/* ... */});
```

Meski semua informasi yang dibutuhkan untuk menangani update reaksi tersedia di kedua array [object `ReactionType`](https://core.telegram.org/bots/api#reactiontype), mereka masih sedikit merepotkan untuk dikerjakan.
Itulah kenapa grammY menyediakan beberapa fungsionalitas yang lebih praktis dari update tersebut.

### Menyimak Perubahan Reaksi

Untuk melihat perubahan reaksi, grammY menyediakan sebuah [shortcut context](./context#shortcut) bernama `ctx.reactions`.

Berikut ini cara menggunakan `ctx.reactions` untuk mendeteksi suatu user yang menghapus dukungan/upvote tetapi memaafkannya jika ia menggantinya dengan reaksi "tangan OK".

```ts
bot.on("message_reaction", async (ctx) => {
  const { emoji, emojiAdded, emojiRemoved } = ctx.reactions();
  if (emojiRemoved.includes("👍")) {
    // User tidak jadi upvote. Ini tidak bisa dimaafkan!
    if (emoji.includes("👌")) {
      // Masih bisa ditoleransi, tidak perlu dihukum.
      await ctx.reply("Dimaafkan.");
    } else {
      // Berani-beraninya kamu!
      await ctx.banAuthor();
    }
  }
});
```

Terdapat empat array yang dikembalikan oleh `ctx.reaction`: emoji yang ditambahkan, emoji yang dihapus, emoji yang sama (tidak berubah), dan sebuah daftar yang berisi hasil perubahannya.
Khusus emoji tersuai, terdapat empat array tambahan yang membawa informasi serupa:

```ts
const {
  /** Emoji yang saat ini ada di reaksi */
  emoji,
  /** Emoji yang baru ditambahkan */
  emojiAdded,
  /** Emoji yang tidak mengalami perubahan */
  emojiKept,
  /** Emoji yang dihapus dari reaksi */
  emojiRemoved,
  /** Emoji tersuai yang saat ini ada di reaksi */
  customEmoji,
  /** Emoji tersuai yang baru ditambahkan */
  customEmojiAdded,
  /** Emoji tersuai yang tidak mengalami perubahan */
  customEmojiKept,
  /** Emoji tersuai yang dihapus dari reaksi */
  customEmojiRemoved,
} = ctx.reactions();
```

Kita sudah membahas secara lengkap bagaimana menangani update di chat pribadi dan grup.
Sekarang, mari kita lihat untuk yang channel.

### Menangani Update Perhitungan Reaksi

Di chat pribadi, grup, dan supergroup, user yang mereaksi suatu pesan bisa kita dapatkan dengan mudah.
Sayangnya, untuk postingan channel, kita disediakan daftar reaksi anonimnya saja.
Oleh karena itu, mustahil untuk mengetahui siapa saja yang mereaksi postingan tersebut.
Hal yang sama juga berlaku untuk postingan channel yang diteruskan secara otomatis ke grup diskusi yang tersambung dengan channel tersebut.

Untuk kedua kasus di atas, bot akan menerima sebuah update `message_reaction_count`.

Kamu bisa menggunakannya dengan cara seperti ini:

```ts
bot.on("message_reaction_count", async (ctx) => {
  const counts = ctx.messageReactionCount;
  // Di sini, kita hanya memperoleh id pesan, bukan isi pesannya.
  const message = counts.message_id;
  // Berikut daftar reaksi beserta jumlahnya.
  const { reactions } = counts;
});
```

Spesifikasi update perhitungan reaksi pesan bisa dilihat di [dokumentasi berikut](https://core.telegram.org/bots/api#messagereactioncountupdated).
