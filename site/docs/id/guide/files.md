# Menangani File

Bot Telegram tidak hanya bisa menerima dan mengirim pesan teks, tetapi juga jenis pesan lainnya, seperti foto dan video.
Materi kali ini akan membahas bagaimana cara menangani file yang dilampirkan ke pesan.

## Bagaimana File Bekerja di Bot Telegram

> Bagian ini menjelaskan bagaimana bot-bot Telegram menangani file.
> Kalau kamu ingin tahu cara menangani file di grammY, gulir ke bawah menuju [mengunduh](#menerima-file) dan [mengunggah](#mengirim-file) file.

File disimpan terpisah dari pesan.
Setiap file di server Telegram diidentifikasi dengan sebuah `file_id`, isinya adalah sebuah string karakter yang sangat panjang.
Contohnya, kurang lebih seperti ini `AgADBAADZRAxGyhM3FKSE4qKa-RODckQHxsoABDHe0BDC1GzpGACAAEC`.

### Identifier untuk Menerima File

> Bot hanya menerima identifier file.
> Apabila bot ingin memperoleh konten file-nya, maka ia harus melakukan request secara eksplisit.

Setiap kali bot **menerima** sebuah file yang disertakan di sebuah pesan, ia sebenarnya hanya menerima `file_id`, bukan data file aslinya.
Kalau bot kamu ingin mengunduh file tersebut, maka ia perlu memanggil method `getFile` ([Referensi API Bot Telegram](https://core.telegram.org/bots/api#getfile)).
Method inilah yang bertugas membuat URL khusus sementara supaya kamu bisa mengunduh file tadi.
<<<<<<< HEAD
Setelah 60 menit terlewati, URL tersebut tidak bisa digunakan. Jika itu terjadi, kamu cukup memanggil ulang `getFile`.
=======
Setelah 60 menit terlewati, URL tersebut akan kedaluwarsa. Jika itu terjadi, kamu cukup memanggil ulang `getFile`.
>>>>>>> main

Untuk menerima file, lihat bagian [menerima file](#menerima-file).

### Identifier untuk Mengirim File

> Identifier file juga bisa diperoleh dengan cara mengirim file.

Ketika suatu bot **mengirim** pesan yang mengandung sebuah file, bot tersebut akan menerima informasi mengenai pesan yang terkirim tersebut, termasuk informasi `file_id` dari file yang terkirim.
Artinya, semua file yang bot lihat, baik file yang dikirim maupun yang diterima, `file_id`-nya akan tersedia untuk bot tersebut.
Apabila kamu ingin memproses file tersebut, kamu perlu menyimpan `file_id`-nya.

> Identifier file sangatlah efisien.
> Oleh karena itu, gunakan sebisa mungkin.

Ketika sebuah bot mengirim sebuah pesan, ia bisa **menentukan `file_id` yang sebelumnya pernah dilihat oleh bot**.
Dengan begitu, ia dapat mengirim file yang teridentifikasi tanpa harus mengunggah data file tersebut.
<<<<<<< HEAD
[Gulir ke bawah](#mengirim-file) untuk belajar cara mengunggah file-mu sendiri.
=======

>>>>>>> main
Kamu bisa menggunakan kembali `file_id` yang sama berulang kali. Artinya, kamu bisa menggunakan `file_id` untuk mengirim file yang sama ke lima chat berbeda.
Meski begitu, kamu tetap harus menggunakan method yang sesuai, contohnya `file_id` yang mengidentifikasikan sebuah foto tidak dapat digunakan ketika memanggil [`sendVideo`](https://core.telegram.org/bots/api#sendvideo).

Untuk mengirim file, lihat bagian [mengirim file](#mengirim-file).

### Identifier akan Mengejutkanmu

> Identifier file **hanya dapat bekerja untuk bot kamu sendiri**.
> Apabila ada bot lain yang menggunakan identifier file-mu, mungkin akan berhasil, atau mungkin malah akan mengalami crash, atau bisa saja secara acak membunuh anak kucing yang tak berdosa.
> :cat: → :skull:

Setiap bot memiliki `file_id`-nya sendiri untuk mengakses file. Kamu tidak bisa menggunakan `file_id` dari bot lain untuk mengakses file yang sama di bot kamu.
Masing-masing bot menggunakan pengidentifikasi yang berbeda untuk satu file yang sama.
Sehingga, kamu tidak bisa asal menebak `file_id` lalu mengakses file seseorang begitu saja karena Telegram telah menentukan `file_id` mana yang valid untuk bot kamu.

::: warning Menggunakan `file_id` dari Sumber Luar
Perlu dicatat bahwa dalam beberapa kasus, `file_id` dari bot lain sesekali bisa bekerja dengan baik di bot kamu karena secara teknis itu memang memungkinkan.
**Tetapi**, menggunakan `file_id` dari sumber luar seperti itu bisa berbahaya karena ia dapat tidak bekerja sewaktu-waktu tanpa peringatan.
Oleh karena itu, selalu gunakan `file_id` yang memang diperuntukkan khusus untuk bot kamu.
:::

> Satu file bisa jadi memiliki beberapa identifier.

Di sisi lain, bot bisa saja secara kebetulan mendapat `file_id` yang berbeda untuk satu file yang sama.
Karenanya, kamu tidak bisa mengandalkan `file_id` untuk membandingkan apakah dua file identik atau tidak.
Kalau bot kamu---atau beberapa bot---perlu mengidentifikasi file yang sama dari waktu ke waktu, kamu harus menggunakan value dari `file_unique_id` yang bot terima bersamaan dengan `file_id`.

`file_unique_id` tidak bisa digunakan untuk mengunduh file, namun value-nya akan selalu sama untuk setiap file yang diberikan, bahkan untuk setiap bot.

## Menerima File

Kamu bisa menangani sebuah file seperti pesan-pesan lainnya.
Contohnya, kalau kamu ingin mendengarkan pesan suara, kamu bisa melakukan ini:

```ts
bot.on("message:voice", async (ctx) => {
  const suara = ctx.msg.voice;

  const durasi = voice.duration; // dalam satuan detik
  await ctx.reply(`Pesan suara kamu berdurasi ${durasi} detik.`);

  const fileId = voice.file_id;
  await ctx.reply("Pengidentifikasi file pesan suaramu adalah: " + fileId);

  const file = await ctx.getFile(); // valid selama 1 jam
  const path = file.file_path; // path file di server API Bot
  await ctx.reply("Unduh lagi file kamu: " + path);
});
```

::: tip Meneruskan file_id Lain ke getFile
Di object context, `getFile` adalah [sebuah shortcut](./context#shortcut) yang mengambil informasi file dari pesan tersebut saja.
Kalau ingin mendapatkan file lain selagi menangani pesan, gunakan `ctx.api.getFile(file_id)`.
:::

> Lihat [shortcut `:media` dan `:file`](./filter-queries#shortcut) di filter query untuk menerima berbagai macam file.

Setelah kamu memanggil `getFile`, kamu bisa menggunakan `file_path` untuk mengunduh file menggunakan URL ini `https://api.telegram.org/file/bot<token>/<file_path>`, di mana `<token>` adalah token bot kamu.

Jika kamu [menjalankan server API Bot-mu sendiri](./api#menjalankan-server-api-bot-lokal), `file_path` akan berubah menjadi path file absolut yang mengarah ke sebuah file yang berada di disk lokal kamu.
Sehingga, kamu tidak perlu mengunduh file apapun, karena server API Bot lah yang akan mengunduh file terkait ketika kamu memanggil `getFile`.

::: tip Plugin Files
grammY tidak menyertakan pengunduh file secara bawaan, sebagai gantinya kamu bisa menggunakan [plugin files resmi](../plugins/files) yang telah kami sediakan.
Dengan plugin tersebut, kamu bisa mengunduh file melalui `await file.download()` dan memperoleh URL unduhannya menggunakan `file.getUrl()`.
:::

## Mengirim File

Bot Telegram punya [tiga cara](https://core.telegram.org/bots/api#sending-files) untuk mengirim file:

1. Melalui `file_id`, contohnya mengirim file menggunakan pengidentifikasi yang sudah diketahui bot.
2. Melalui URL, contohnya meneruskan URL file yang tersedia untuk publik, yang akan diunduh oleh Telegram lalu mengirimkannya.
3. Mengunggah file-mu sendiri.

Terlepas dari ketiga cara tersebut, mereka menggunakan nama method yang sama.
Sedangkan, parameter dari function-nya akan berbeda-beda tergantung dari cara yang kamu pilih.
Misal, untuk mengirim foto, kamu bisa menggunakan `ctx.replyWithPhoto`, atau `sendPhoto` kalau menggunakan `ctx.api` atau `bot.api`.

Kamu bisa mengirim jenis file lain dengan mengganti nama method dan jenis datanya.
Untuk mengirim video, kamu bisa menggunakan `ctx.replyWithVideo`.
Sama halnya dengan dokumen: `ctx.replyWithDocument`.
Kurang lebih seperti itu.

Mari kita kupas lebih dalam ketiga cara pengiriman file tadi.

### Melalui `file_id` atau URL

Dua method yang pertama cukup simpel: kamu hanya perlu mengisi value sebagai sebuah `string`, selesai!

```ts
// Kirim melalui file_id.
await ctx.replyWithPhoto(idFilenya);

// Kirim melalui URL.
await ctx.replyWithPhoto("https://grammy.dev/images/grammY.png");

// Alternatifnya, kamu bisa menggunakan
// bot.api.sendPhoto() atau ctx.api.sendPhoto().
```

### Mengunggah File-mu Sendiri

grammY memiliki dukungan yang baik terhadap pengunggahan file secara mandiri.
Kamu bisa melakukannya dengan meng-import dan menggunakan class `InputFile` ([Referensi API grammY](/ref/core/inputfile)).

```ts
// Kirim sebuah file melalui path lokal
await ctx.replyWithPhoto(new InputFile("/tmp/kocheng-oren-uwu.jpg"));

// Alternatifnya, gunakan bot.api.sendPhoto() atau ctx.api.sendPhoto()
```

Constructor `InputFile` tidak hanya menerima path file, tetapi juga stream, object `Buffer`, perulangan async, ataupun sebuah function yang mengembalikan salah satu dari item-item tersebut, dan bahkan tergantung dari platform yang kamu gunakan, bisa lebih banyak lagi.
Yang perlu diingat adalah: **buat sebuah instance `InputFile` lalu teruskan ke method yang bertugas mengirim file**.
Instance `InputFile` bisa diteruskan ke semua method yang menerima pengiriman file melalui unggahan.

Berikut beberapa contoh bagaimana kamu bisa membuat `InputFile`.

#### Mengunggah File dari Disk

Kalau kamu sudah punya file yang tersimpan di komputermu, kamu bisa menyuruh grammY untuk mengunggah file tersebut.

::: code-group

```ts [Node.js]
import { createReadStream } from "fs";

// Kirim file lokal
new InputFile("/path/ke/file");

// Kirim dari pembacaan stream.
new InputFile(createReadStream("/path/ke/file"));
```

```ts [Deno]
// Kirim file lokal
new InputFile("/path/ke/file");

// Kirim instance `Deno.FsFile`.
new InputFile(await Deno.open("/path/ke/file"));
```

:::

#### Mengunggah Raw Binary Data

Kamu juga bisa mengirim object `Buffer`, maupun sebuah perulangan yang menghasilkan object `Buffer`.
Di Deno, kamu bisa mengirim object `Blob` juga.

::: code-group

```ts [Node.js]
// Kirim sebuah buffer atau array byte.
const buffer = Uint8Array.from([65, 66, 67]);
new InputFile(buffer); // "ABC"
// Kirim sebuah perulangan.
new InputFile(function* () {
  // "ABCABCABCABC"
  for (let i = 0; i < 4; i++) yield buffer;
});
```

```ts [Deno]
// Kirim sebuah blob.
const blob = new Blob("ABC", { type: "text/plain" });
new InputFile(blob);
// Kirim sebuah buffer atau array byte.
const buffer = Uint8Array.from([65, 66, 67]);
new InputFile(buffer); // "ABC"
// Kirim sebuah perulangan.
new InputFile(function* () {
  // "ABCABCABCABC"
  for (let i = 0; i < 4; i++) yield buffer;
});
```

:::

#### Mengunduh dan Mengunggah File Kembali

Kamu bahkan bisa menyuruh grammY untuk mengunduh file dari internet.
File hasil unduhan tidak akan disimpan di disk kamu.
Sebaliknya, grammY cuma melewatkan data tersebut dan menyimpan sepotong kecil data ke memori.
Sangat efisien, bukan.

> Perlu dicatat bahwa Telegram mendukung pengunduhan file dengan berbagai cara.
> Jika memungkinkan, sebaiknya kamu [mengirim file menggunakan URL](#melalui-file-id-atau-url), daripada menggunakan `InputFile` untuk mengalirkan data file melalui server kamu.

```ts
// Unduh file lalu alirkan data ke Telegram.
new InputFile(new URL("https://grammy.dev/images/grammY.png"));
new InputFile({ url: "https://grammy.dev/images/grammY.png" }); // sama saja
```

### Menambahkan Caption

Ketika mengirim file, kamu bisa menentukan opsi lebih lanjut di pilihan object type `Other`, persis seperti yang sudah dijelaskan [sebelumnya](./basics#mengirim-pesan).
Kode berikut akan mengirimkan caption.

```ts
// Kirim sebuah foto dari file lokal ke user 12345 dengan caption "Ngopi dulu, bro!".
await bot.api.sendPhoto(12345, new InputFile("/path/ke/foto.jpg"), {
  caption: "Ngopi dulu, bro!",
});
```

Seperti pada method API lainnya, kamu bisa mengirim file menggunakan `ctx` (cara termudah), `ctx.api`, atau `bot.api`.

## Batas Ukuran File

Sebenarnya, grammY sanggup mengirim file berapapun ukurannya. Namun, Telegram membatasi ukuran file yang diperbolehkan seperti yang didokumentasikan [di sini](https://core.telegram.org/bots/api#sending-files).
Sehingga, bot kamu tidak bisa mengunduh file lebih besar dari 20 MB ataupun menunggah file di atas 50 MB.
Kombinasi tertentu bahkan memiliki batas yang lebih kecil lagi, contohnya foto yang dikirim melalui URL (5 MB).

Seperti yang telah [dijelaskan sebelumnya](./api), dengan usaha yang lebih, bot kamu sebenarnya mampu memproses file berukuran besar.
Selain meng-hosting bot kamu, kamu juga diharuskan untuk [meng-hosting server API Bot-mu sendiri](./api#menjalankan-server-api-bot-lokal) jika kamu berencana untuk mendukung pengunggahan file hingga 2000 MB (ukuran file maksimal di Telegram) dan pengunduhan file dengan berbagai macam ukuran ([4000 MB dengan Telegram Premium](https://t.me/premium/5)).

Meng-hosting server API Bot tidak ada hubungannya dengan grammY.
Meski begitu, grammY mendukung method-method yang dibutuhkan untuk mengatur bot kamu agar dapat menggunakan server API Bot milikmu sendiri.
