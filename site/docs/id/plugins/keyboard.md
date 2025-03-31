---
prev: false
next: false
---

# Keyboard Custom dan Inline (bawaan)

Bot kamu bisa menyediakan beberapa tombol untuk user, baik berupa [tombol di bawah pesan](#keyboard-inline) ataupun [mengganti keyboard user](#keyboard-custom) sepenuhnya dengan tombol.
Keduanya secara berurutan bernama _keyboard inline_ dan _keyboard custom_.
Kalau kamu merasa penamaannya sedikit membingungkan, memang betul adanya.
Salahkan Telegram karena menggunakan kedua istilah aneh tersebut. :upside_down_face:

Mari kita perjelas sedikit istilah-istilah berikut agar tidak salah paham:

| Istilah                                 | Keterangan                                                                                                                                                                       |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [**Keyboard Inline**](#keyboard-inline) | Kumpulan tombol yang ditampilkan di bawah sebuah pesan di dalam chat.                                                                                                            |
| [**Keyboard Custom**](#keyboard-custom) | Kumpulan tombol yang ditampilkan untuk menggantikan keyboard sistem user.                                                                                                        |
| **Tombol Keyboard Inline**              | Sebuah tombol di keyboard inline. Ketika tombol ditekan, ia akan mengirimkan sebuah callback query yang tidak terlihat oleh user. Terkadang cuma disebut dengan _tombol inline_. |
| **Tombol Keyboard Custom**              | Sebuah tombol di keyboard. Ketika tombol ditekan, ia akan mengirimkan sebuah pesan yang berisi teks tertentu, terkadang cuma disebut dengan _tombol keyboard_.                   |
| **`InlineKeyboard`**                    | Sebuah class di grammY untuk membuat keyboard inline.                                                                                                                            |
| **`Keyboard`**                          | Sebuah class di grammY untuk membuat keyboard custom.                                                                                                                            |

> Perlu diketahui bahwa keyboard custom dan keyboard inline juga bisa memiliki fungsi lain, seperti meminta lokasi user, membuka sebuah website, dan lain-lain.
> Kami sengaja tidak menjelaskannya untuk mempersingkat materi.

Sayangnya, kita tidak bisa menambahkan keyboard custom dan keyboard inline secara bersamaan di satu pesan yang sama.
Kedua-duanya harus dibuat secara terpisah.
Bahkan, reply markup yang sudah terkirim tidak bisa diubah kembali dengan cara mengubah pesan.
Contohnya, kita tidak bisa mengirim keyboard custom sebagai pesan pertama lalu mengubah pesan tersebut untuk menggantinya menjadi keyboard inline.

## Keyboard Inline

> Silahkan kunjungi bagian keyboard inline di materi [Fitur-fitur Bot Telegram](https://core.telegram.org/bots/features#inline-keyboards) yang ditulis oleh tim Telegram.

grammY menyediakan class bernama `InlineKeyboard` yang bisa kamu gunakan untuk membuat keyboard inline dengan mudah.

> Semua tombol yang menggunakan `switchInline`, `switchInlineCurrent`, atau `switchInlineChosen` akan memulai sebuah inline query.
> Lihat materi tentang [Inline Query](./inline-query) untuk mengetahui cara kerjanya.

### Membuat Keyboard Inline

Sebuah keyboard inline bisa dibentuk dengan cara membuat sebuah instance class `InlineKeyboard`, kemudian tambahkan tombol yang diinginkan menggunakan `.text()` dan method lainnya.

Berikut contohnya:

![Contoh tangkapan layar dari sebuah keyboard inline](/images/inline-keyboard-example.png)

```ts
const inlineKeyboard = new InlineKeyboard()
  .text("« 1", "awal")
  .text("‹ 3", "sebelumnya")
  .text("· 4 ·", "saat ini")
  .text("5 ›", "selanjutnya")
  .text("31 »", "akhir");
```

Sebuah baris tombol baru bisa ditambahkan dengan cara memanggil `.row()`.
Kamu juga bisa menggunakan berbagai method yang lain, misalnya `.url()` yang berfungsi agar perangkat pengguna mampu membuka sebuah link tertentu atau hal-hal keren lainnya.
Silahkan lihat [daftar semua method](/ref/core/inlinekeyboard#methods) yang tersedia di class `InlineKeyboard`.

Jika kamu sudah memiliki sebuah array string yang hendak diubah menjadi sebuah keyboard inline, kamu bisa menggunakan gaya penulisan yang kedua.
Class `InlineKeyboard` memiliki beberapa method static, salah satunya `InlineKeyboard.text` yang berfungsi untuk membuat beberapa object tombol.
Setelah itu, kamu bisa membuat sebuah instance keyboard inline dari array object tombol tadi menggunakan `InlineKeyboard.from`.

Dengan begitu, kamu bisa membuat keyboard inline di atas dengan gaya penulisan fungsional.

```ts
const labelDataPairs = [
  ["« 1", "awal"],
  ["‹ 3", "sebelumnya"],
  ["· 4 ·", "saat ini"],
  ["5 ›", "selanjutnya"],
  ["31 »", "akhir"],
];
const buttonRow = labelDataPairs
  .map(([label, data]) => InlineKeyboard.text(label, data));
const keyboard = InlineKeyboard.from([buttonRow]);
```

### Mengirim Keyboard Inline

Kamu bisa mengirim sebuah pesan beserta keyboard inline secara langsung, entah itu mengirim menggunakan `bot.api.sendMessage`, `ctx.api.sendMessage`, ataupun `ctx.reply`:

```ts
// Kirim pesan beserta keyboard inline-nya.
await ctx.reply(text, {
  reply_markup: inlineKeyboard,
});
```

Umumnya, semua method yang mengirim pesan selain pesan teks mendukung opsi-opsi yang serupa, seperti yang sudah dijelaskan di [Referensi API Bot Telegram](https://core.telegram.org/bots/api).
Contohnya, kamu bisa mengubah tampilan keyboard dengan cara memanggil `editMessageReplyMarkup`, kemudian memasukkan instance `InlineKeyboard` baru sebagai `reply_markup`-nya.
Gunakan inline keyboard kosong untuk menghapus semua tombol yang berada di bawah pesan tersebut.

### Merespon Ketika Tombol Keyboard Inline Ditekan

::: tip Plugin Menu
Kamu bisa saja mengakses raw update yang dikirimkan oleh Telegram dengan plugin keyboard.
Tetapi, cara manual seperti itu akan sangat merepotkan.
Kalau kamu menginginkan fitur inline keyboard yang lebih canggih lagi, silahkan kunjungi [menu plugin](./menu).
Dengan plugin tersebut kamu bisa membuat menu interaktif dengan mudah.
:::

Setiap tombol `text` memiliki data callback berupa string.
Kalau kamu tidak menyertakan data callback-nya, grammY akan menggunakan teks yang ada di tombol sebagai datanya.

Ketika user menekan tombol `text`, bot kamu akan menerima sebuah update berisi data callback tombol yang ditekan.
Kamu bisa memperoleh data callback melalui `bot.callbackQuery()`.

```ts
// Buat sebuah keyboard.
const inlineKeyboard = new InlineKeyboard().text("Jawaban", "payload-jawaban");

// Kirim sebuah pesan beserta keyboard-nya.
bot.command("start", async (ctx) => {
  await ctx.reply("Buah apa yang bisa menampung banyak barang?", {
    reply_markup: inlineKeyboard,
  });
});

// Tunggu tombol yang membawa data callback berisi "payload-jawaban" ditekan.
bot.callbackQuery("payload-jawaban", async (ctx) => {
  await ctx.answerCallbackQuery({
    text: "Leci Meja! 🙃",
  });
});
```

::: tip Merespon Semua Callback Query
`bot.callbackQuery()` berfungsi untuk menyimak event ketika tombol tertentu ditekan.
Untuk menyimak event dari semua tombol, kamu bisa menggunakan `bot.on("callback_query:data")`.

```ts
bot.callbackQuery("payload-jawaban" /* , ... */);

bot.on("callback_query:data", async (ctx) => {
  console.log(
    "Event tombol dengan payload yang tidak diketahui",
    ctx.callbackQuery.data,
  );
  await ctx.answerCallbackQuery(); // hapus animasi loading
});
```

Kamu sebaiknya menambahkan `bot.on("callback_query:data")` di akhir untuk merespon callback query yang tidak ditangani oleh listener kamu.
Jika tidak dilakukan, beberapa aplikasi telegram akan menampilkan animasi loading selama satu menit ketika user menekan tombol yang tidak direspon oleh bot kamu.
:::

## Keyboard Custom

Pertama-tama, keyboard custom terkadang hanya disebut sebagai keyboard, ada juga yang menyebutnya keyboard reply, dan bahkan dokumentasi Telegram sendiri tidak konsisten dalam penyebutannya :facepalm:.
Gampangnya, ketika tidak disertai dengan konteks yang jelas serta tidak ada penyebutan keyboard inline di dalamnya, maka kemungkinan besar yang dimaksud adalah keyboard custom.
Keyboard custom dapat mengganti keyboard sistem dengan beraneka tombol yang sudah kamu tentukan.

> Kunjungi bagian keyboard custom di dokumentasi [Fitur-fitur Bot Telegram](https://core.telegram.org/bots/features#keyboards) yang ditulis oleh tim Telegram.

grammY menyediakan class bernama `Keyboard` yang bisa kamu gunakan untuk membuat keyboard custom dengan mudah dan simpel.

Ketika user menekan sebuah tombol `teks`, bot kamu akan menerima pesan berupa teks biasa.
Kamu bisa menyimak pesan teks menggunakan `bot.on("message:text")` ataupun `bot.hears()`.

### Membuat Keyboard Custom

Kamu bisa membuat sebuah keyboard custom dengan cara membuat sebuah instance class `Keyboard` baru, kemudian tambahkan tombol-tombolnya melalui `.text()` dan lainnya.
Panggil `.row()` untuk membuat sebuah baris tombol baru

Berikut salah satu contohnya:

![Contoh tangkapan layar keyboard custom](/images/keyboard-example.png)

```ts
const keyboard = new Keyboard()
  .text("Yes, they certainly are").row()
  .text("I'm not quite sure").row()
  .text("No. 😈")
  .resized();
```

Kamu juga bisa menggunakan tombol canggih lainnya untuk meminta nomor telepon pengguna, lokasi, atau hal-hal keren lainnya.
Silahkan lihat [daftar semua method](/ref/core/keyboard#methods) yang tersedia di class `Keyboard`.

Jika kamu sudah memiliki sebuah array string yang hendak dijadikan sebuah keyboard, kamu bisa menggunakan gaya penulisan kedua.
Class `Keyboard` memiliki beberapa method static, salah satunya `Keyboard.text` untuk membuat object tombol.
Dari situ, kamu bisa membuat sebuah instance keyboard dari array object tombol menggunakan `Keyboard.from`.

Dengan begitu, kamu bisa membuat keyboard di atas dengan gaya penulisan fungsional.

```ts
const labels = [
  "Yes, they certainly are",
  "I'm not quite sure",
  "No. 😈",
];
const buttonRows = labels
  .map((label) => [Keyboard.text(label)]);
const keyboard = Keyboard.from(buttonRows).resized();
```

### Mengirim Keyboard Custom

Kamu bisa mengirim pesan beserta keyboard custom baik menggunakan `bot.api.sendMessage`, `ctx.api.sendMessage`, maupun `ctx.reply`.

```ts
// Kirim pesan beserta keyboard-nya.
await ctx.reply(text, {
  reply_markup: keyboard,
});
```

Umumnya, semua method yang mengirim pesan selain pesan teks mendukung opsi-opsi yang serupa, seperti yang sudah dijelaskan di [Referensi API Bot Telegram](https://core.telegram.org/bots/api).

Kamu juga bisa memberi beberapa property ke keyboard kamu dengan cara memanggil method khusus.
Alih-alih menambahkan tombol baru, method-method tersebut mengubah perilaku dari sebuah keyboard.
Di atas tadi, kita sudah melihat contoh `resized`---berikut beberapa hal yang bisa kamu lakukan:

#### Keyboard Persisten

Secara bawaan, user bisa menggunakan sebuah tombol icon yang berfungsi untuk menampilkan dan menyembunyikan keyboard custom yang disetel oleh bot kamu.

Kamu bisa memanggil `persistent` agar keyboard custom tetap ditampilkan ketika keyboard sistem disembunyikan.
Dengan begitu, keyboard akan selalu ditampilkan ke user, baik itu keyboard custom ataupun keyboard sistem.

```ts
new Keyboard()
  .text("Lewati")
  .persistent();
```

#### Mengatur Ukuran Keyboard Custom

Kamu bisa memanggil `resized` untuk mengubah ukuran keyboard custom-mu sesuai dengan jumlah tombol yang disediakan.
Dengan begitu, ukuran keyboard akan semakin ringkas.
(Biasanya, ukuran keyboard menyesuaikan dengan ukuran standar keyboard aplikasi.)

```ts
new Keyboard()
  .text("Ya").row()
  .text("Tidak")
  .resized();
```

Pemanggilan `resized` di awal, tengah, ataupun terakhir, tidak akan mempengaruhi hasilnya.

#### Keyboard Custom Sekali Pakai

Kamu bisa memanggil `oneTime` untuk menyembunyikan keyboard custom setelah tombol pertama ditekan.

```ts
new Keyboard()
  .text("ya").row()
  .text("Tidak")
  .oneTime();
```

Pemanggilan `oneTime` di awal, tengah, ataupun terakhir, tidak akan mempengaruhi hasilnya.

#### Placeholder untuk Bidang Input

Kamu bisa memanggil `placeholder` untuk menampilkan placeholder di bidang input selama keyboard custom ditampilkan.

```ts
new Keyboard()
  .text("Ya").row()
  .text("Tidak")
  .placeholder("Pilih salah satu!");
```

Pemanggilan `placeholder` di awal, tengah, ataupun terakhir, tidak akan mempengaruhi hasilnya.

#### Mengirim Keyboard Custom Secara Selektif

Kamu bisa memanggil `selected` untuk menampilkan custom keyboard hanya untuk user yang username-nya disebut di isi pesan teks bot dan untuk pengirim pesan yang [di-reply](../guide/basics#mengirim-pesan-dengan-reply) oleh bot kamu.

```ts
new Keyboard()
  .text("Ya").row()
  .text("Tidak")
  .selected();
```

Pemanggilan `selected` di awal, tengah, ataupun terakhir, tidak akan mempengaruhi hasilnya.

### Merespon Ketika Tombol Keyboard Custom Ditekan

Seperti yang sudah disebutkan di awal, semua keyboard custom mengirim pesan teks biasa.
Bot kamu tidak bisa membedakan antara pesan teks yang berasal dari ketikan user dengan pesan teks yang berasal dari tombol yang ditekan.

Terlebih lagi, tombol akan selalu mengirim isi pesan yang sama dengan tampilan teks yang ditulis di tombol tersebut.
Kamu tidak bisa membuat tombol yang menampilkan tulisan "A" tetapi mengirim pesan "B".
Namun, kamu bisa dengan bebas melakukannya di [keyboard inline](#keyboard-inline).

Untuk mengetahui ketika tombol tertentu ditekan, kamu bisa menggunakan `bot.hears` dengan teks yang sama yang ditulis di tombol tersebut.
Kalau ingin mengetahui ketika tombol manapun ditekan, kamu bisa menggunakan `bot.on("message:text")` kemudian lihat isi `ctx.msg.text` untuk mencari tahu tombol mana yang ditekan ataupun teks apa yang dikirim oleh user.

### Menghapus Keyboard Custom

Jika kamu tidak menyertakan opsi `one_time_keyboard` seperti yang dijelaskan [di atas](#keyboard-custom-sekali-pakai), keyboard custom akan terus ditampilkan untuk user tersebut (tetapi mereka bisa menyembunyikannya dengan cara manual).

Kamu bisa menghilangkan keyboard custom dengan cara mengirim pesan baru di chat tersebut, persis seperti yang kamu lakukan ketika mengirim keyboard baru.
Sertakan `{ remove_keyboard: true }` sebagai `reply_markup`-nya seperti contoh berikut:

```ts
await ctx.reply(text, {
  reply_markup: { remove_keyboard: true },
});
```

Setelah `remove_keyboard`, kamu juga bisa menambahkan `selective: true` agar keyboard custom dihapus untuk user tersebut saja.
Cara ini sama seperti yang kita lakukan saat [mengirim keyboard custom secara selektif](#mengirim-keyboard-custom-secara-selektif).

## Ringkasan Plugin

Plugin ini tersedia secara built-in di dalam package inti grammy.
Kamu tidak perlu memasang package tambahan untuk menggunakannya.
Cukup import yang kamu butuhkan langsung dari grammY.

Selain itu, baik referensi API maupun dokumentasinya telah dijadikan satu dengan package inti.
