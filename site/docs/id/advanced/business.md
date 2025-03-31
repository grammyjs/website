# Telegram Business

Telegram Business memungkinkan obrolan pribadi kamu ke sesama user (manusia)
dikelola oleh sebuah bot. Diantaranya adalah menerima dan mengirim pesan atas
nama kamu. Fitur ini cukup berguna jika kamu menjalankan bisnis di telegram yang
pelanggannya adalah para user tadi.

> Jika kamu merasa asing dengan Telegram Business, coba lihat
> [dokumentasi resmi](https://core.telegram.org/bots#manage-your-business)
> Telegram sebelum melanjutkan ke materi selanjutnya.

Secara bawaan, grammY memiliki dukungan penuh terhadap fitur Telegram Business
ini.

## Menangani Pesan Business

Bot mampu menangani obrolan pribadi kedua user melalui Telegram Business, yaitu
sebuah akun yang telah berlangganan layanan bisnisnya Telegram. Penanganan
obrolan pribadi melibatkan sebuah object bernama _business connection_ yang
memiliki struktur seperti [ini](/ref/types/businessconnection).

### Menerima Pesan Business

Sesudah menyiapkan business connection, bot akan **menerima pesan** dari _kedua
belah pihak chat yang bersangkutan_.

```ts
bot.on("business_message", async (ctx) => {
  // Tangkap object pesannya.
  const message = ctx.businessMessage;
  // Shortcut juga tersedia.
  const msg = ctx.msg;
});
```

Di titik ini, masih belum jelas dari pihak mana pesan tersebut dikirim. Mungkin
pesan tersebut berasal dari pelanggan kamu, tapi bisa juga pesan tersebut
berasal dari dirimu sendiri (bukan bot kamu)!

Oleh karena itu, kita memerlukan suatu cara untuk membedakan kedua belah pihak.
Kita bisa memulainya dengan memeriksa object business connection terkait.
Business connection tersebut akan memberi tahu kita siapa pemilik akun business
yang dimaksud, misalnya melalui user identifier kamu (atau salah satu karyawan
kamu).

```ts
bot.on("business_message", async (ctx) => {
  // Peroleh informasi business connection-nya.
  const conn = await ctx.getBusinessConnection();
  const employee = conn.user;
  // Periksa siapa yang mengirim pesan ini.
  if (ctx.from.id === employee.id) {
    // Kamu yang mengirim pesan ini.
  } else {
    // Pelanggan kamu yang mengirim pesan ini.
  }
});
```

Kamu juga bisa menghindari pemanggilan `getBusinessConnection` untuk setiap
update dengan cara [berikut](#bekerja-dengan-business-connection).

### Mengirim Pesan

Bot kamu juga bisa **mengirim pesan** ke suatu chat _meski bukan anggota dari
chat yang bersangkutan_. Kamu bisa melakukannya dengan menggunakan `ctx.reply`
dan seluruh variannya. grammY akan mengecek apakah
[shortcut context](../guide/context#shortcut) `ctx.businessConnectionId`
tersedia agar bisa digunakan untuk mengirim pesan ke obrolan business yang kita
kelola.

```ts
bot.on("business_message").filter(
  async (ctx) => {
    const conn = await ctx.getBusinessConnection();
    return ctx.from.id !== conn.user.id;
  },
  async (ctx) => {
    // Balas semua pertanyaan pelanggan secara otomatis.
    if (ctx.msg.text.endsWith("?")) {
      await ctx.reply("Harap tunggu.");
    }
  },
);
```

Kode di atas akan menghasilkan balasan yang seolah-olah kamu sendiri yang telah
membalasnya. Pelangganmu tidak akan tahu apakah pesan tersebut dikirim secara
manual atau melalui bot kamu. (Kamu masih bisa melihat sebuah indikator kecil
untuk membedakannya). (Meski begitu, kemungkinan besar kamu masih kalah cepat
dengan bot kamu dalam hal membalas pesan. Maaf).

## Ulik Lebih Dalam

Ada beberapa hal yang perlu diperhatikan ketika mengintegrasikan bot ke Telegram
Business. Mari kita bahas beberapa diantaranya.

### Mengedit atau Menghapus Pesan Business

Ketika kamu atau pelangganmu mengedit atau menghapus pesan di obrolan kamu, bot
akan menerima notifikasi mengenai perubahan tersebut. Lebih tepatnya, ia akan
menerima update baik berupa `edited_business_message` ataupun
`deleted_business_messages`. Seperti update pada umumnya, ia bisa ditangani
menggunakan `bot.on` dan beragam [filter query](../guide/filter-queries)
lainnya.

Meski demikian, bot kamu **TIDAK** bisa mengedit atau menghapus pesan di chat
tersebut. Bot juga **TIDAK** bisa meneruskan pesan dari chat tersebut ataupun
menyalinnya ke tempat lain. Semua operasi tersebut diserahkan ke manusia.

### Bekerja dengan Business Connection

Ketika bot terhubung ke sebuah akun business, ia akan menerima sebuah update
`business_connection`. Update tersebut juga akan diterima oleh bot ketika
koneksinya tidak lagi tersambung atau telah terjadi perubahan sedemikian rupa
terhadap koneksi tersebut.

Contohnya, sebuah bot bisa jadi tidak dapat mengirim pesan ke chat yang
dimaksud. Kamu bisa menanganinya dengan menggunakan potongan query `:can_reply`.

```ts
bot.on("business_connection:can_reply", async (ctx) => {
  // Pengiriman pesan bisa dilakukan melalui koneksi ini.
});
```

Kamu bisa meningkatkan efisiensi dengan cara menyimpan object business
connection ke suatu database. Dengan begitu, kamu bisa menghindari pemanggilan
`ctx.getBusinessConnection()` di setiap update hanya untuk
[mengetahui siapa pengirim pesannya](#menerima-pesan-business).

Selain itu, update `business_connection` juga memuat sebuah `user_chat_id`.
Identifier chat tersebut bisa digunakan untuk memulai sebuah percakapan dengan
user yang telah tersambung ke bot.

```ts
bot.on("business_connection:is_enabled", async (ctx) => {
  const id = ctx.businessConnection.user_chat_id;
  await ctx.api.sendMessage(id, "Terima kasih telah tersambung dengan kami!");
});
```

Ia tetap bisa bekerja meski user tersebut belum memulai bot kamu.

### Mengelola Masing-Masing Obrolan

Jika kamu menghubungkan bot dengan tujuan untuk mengelola akun kamu, aplikasi
Telegram akan menawarkan kamu sebuah tombol untuk mengatur bot tersebut di
masing-masing obrolan. Tombol tersebut mengirim perintah `/start` ke bot
terkait.

Perintah start tersebut memiliki muatan
[deep linking](../guide/commands#dukungan-deep-linking) khusus yang telah
ditentukan oleh Telegram. Ia memiliki format berupa `bizChatXXXXX` di mana
`XXXXX` adalah chat identifier dari obrolan yang dimaksud.

```ts
bot.command("start", async (ctx) => {
  const payload = ctx.match;
  if (payload.startsWith("bizChat")) {
    const id = payload.slice(7); // sisihkan `bizChat`
    await ctx.reply(`Mari kelola obrolan #${id}!`);
  }
});
```

Aksi ini akan menyediakan dan mengaktifkan context yang diperlukan ke bot kamu
untuk mengelola obrolan business secara langsung melalui percakapan ke
masing-masing pelanggan.
