---
prev: false
next: false
---

# Menu Interaktif (`menu`)

Membuat menu interaktif dengan mudah.

## Pengenalan

Keyboard inline merupakan sebuah array berisi kumpulan tombol yang berada di bawah pesan.
grammY memiliki [sebuah plugin yang tersedia secara built-in](./keyboard#keyboard-inline) untuk membuat keyboard inline sederhana.

Plugin menu mengembangkannya lebih jauh agar kamu bisa membuat menu yang bervariasi di dalam sebuah chat, seperti tombol interaktif, halaman dengan navigasi di dalamnya, dan sebagainya.

Berikut contoh-contohnya:

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { Menu } from "@grammyjs/menu";

// Buat sebuah bot.
const bot = new Bot("");

// Buat menu sederhana.
const menu = new Menu("menu-minuman")
  .text("🍵", (ctx) => ctx.reply("Waktunya ngeteh!")).row()
  .text("☕", (ctx) => ctx.reply("Jelas lebih enak~"));

// Buat jadi interaktif.
bot.use(menu);

bot.command("start", async (ctx) => {
  // Kirim menu.
  await ctx.reply("Pilih teh atau kopi?", { reply_markup: menu });
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { Menu } = require("@grammyjs/menu");

// Buat sebuah bot.
const bot = new Bot("");

// Buat menu sederhana.
const menu = new Menu("menu-minuman")
  .text("🍵", (ctx) => ctx.reply("Waktunya ngeteh!")).row()
  .text("☕", (ctx) => ctx.reply("Jelas lebih enak~"));

// Buat jadi interaktif.
bot.use(menu);

bot.command("start", async (ctx) => {
  // Kirim menu.
  await ctx.reply("Pilih teh atau kopi?", { reply_markup: menu });
});

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { Menu } from "https://deno.land/x/grammy_menu/mod.ts";

// Buat sebuah bot.
const bot = new Bot("");

// Buat menu sederhana.
const menu = new Menu("menu-minuman")
  .text("🍵", (ctx) => ctx.reply("Waktunya ngeteh!")).row()
  .text("☕", (ctx) => ctx.reply("Jelas lebih enak~"));

// Buat jadi interaktif.
bot.use(menu);

bot.command("start", async (ctx) => {
  // Kirim menu.
  await ctx.reply("Pilih teh atau kopi?", { reply_markup: menu });
});

bot.start();
```

:::

> Pastikan semua menu dipasang sebelum middleware, khususnya sebelum middleware yang menggunakan data callback query.
> Selain itu, jika kamu menggunakan pengaturan khusus untuk `allowed_updates`, jangan lupa untuk menyertakan update `callback_query`-nya.

Jika kamu menggunakan [custom context type](../guide/context#memodifikasi-object-context), kamu juga bisa memasangnya ke `Menu`.

```ts
const menu = new Menu<MyContext>("id-menu");
```

## Menambahkan Tombol

Plugin menu mengatur tata letak keyboard kamu persis seperti yang [plugin keyboard inline](./keyboard#membuat-keyboard-inline) lakukan.
Di plugin menu, class `InlineKeyboard` akan digantikan oleh class `Menu`.

Berikut contoh menu yang memiliki empat tombol dengan tata letak baris 1-2-1.

```ts
const menu = new Menu("pergerakan")
  .text("^", (ctx) => ctx.reply("Maju!")).row()
  .text("<", (ctx) => ctx.reply("Kiri!"))
  .text(">", (ctx) => ctx.reply("Kanan!")).row()
  .text("v", (ctx) => ctx.reply("Mundur!"));
```

Gunakan `text` untuk menambahkan tombol teks baru.
Lalu, tambahkan sebuah label dan sebuah function handler di dalamnya.

Gunakan `row` untuk menutup baris dan menambahkan tombol di baris berikutnya.

Ada banyak tipe-tipe tombol lainnya yang tersedia, misalnya tombol untuk membuka URL.
Lihat bagian `MenuRange` di [referensi API plugin ini](/ref/menu/menurange), serta [referensi API Bot Telegram](https://core.telegram.org/bots/api#inlinekeyboardbutton) untuk `InlineKeyboardButton`.

## Mengirim Menu

Kamu harus memasang sebuah menu terlebih dahulu agar membuatnya menjadi interaktif.

```ts
bot.use(menu);
```

Setelah itu, kamu bisa memasang menu tersebut sebagai `reply_markup` ketika mengirim sebuah pesan.

```ts
bot.command("menu", async (ctx) => {
  await ctx.reply("Berikut menu kamu:", { reply_markup: menu });
});
```

## Label Dinamis

Selain memasang label tombol secara manual, kamu juga bisa memasang sebuah function `(ctx: Context) => string` untuk menghasilkan sebuah label yang dinamis.
Function ini bisa berupa `async` atau tidak sama sekali.

```ts
// Buat sebuah tombol menggunakan nama user
// yang berfungsi untuk menyapa mereka ketika tombol ditekan.
const menu = new Menu("sapa-aku")
  .text(
    (ctx) => `Sapa ${ctx.from?.first_name ?? "aku"}!`, // label dinamis
    (ctx) => ctx.reply(`Halo ${ctx.from.first_name}!`), // handler
  );
```

Sebuah string yang dihasilkan oleh function tersebut dinamakan dengan _string dinamis_.
String dinamis cocok digunakan untuk hal-hal seperti tombol sakelar.

```ts
// Tandai id user yang mengaktifkan notifikasi.
const notifikasi = new Set<number>();

function sakelarNotifikasi(id: number) {
  if (!notifikasi.delete(id)) notifikasi.add(id);
}

const menu = new Menu("sakelar-notifikasi")
  .text(
    (ctx) => ctx.from && notifikasi.has(ctx.from.id) ? "🔔" : "🔕",
    (ctx) => {
      sakelarNotifikasi(ctx.from.id);
      ctx.menu.update(); // Perbarui menunya!
    },
  );
```

Ingat! Kamu harus memperbarui menunya jika ingin tombol menu tersebut berubah.
Panggil `ctx.menu.update()` agar menu kamu di-render ulang.

::: tip Menyimpan Data
Contoh di atas menunjukkan cara menggunakan menu plugin.
Sebenarnya menyimpan pengaturan user di sebuah object `Set` bukanlah ide yang bagus, karena data akan hilang ketika bot atau server kamu berhenti bekerja.

Sebaiknya gunakan sebuah database atau [plugin session](./session) untuk menyimpan data.
:::

## Memperbarui atau Menutup Menu

Ketika sebuah handler tombol dipanggil, beberapa function akan tersedia di `ctx.menu`.

Contohnya, Jika ingin menumu di-render ulang, kamu bisa memanggil `ctx.menu.update()`.
Ia hanya akan bekerja di dalam handler yang terpasang di menu kamu.
Ia tidak akan bekerja ketika dipanggil dari middleware bot lain, sehingga tidak ada cara untuk mengetahui menu _mana_ yang mau diperbarui.

```ts
const menu = new Menu("waktu", { onMenuOutdated: false })
  .text(
    () => new Date().toLocaleString(), // label tombolnya adalah waktu saat ini
    (ctx) => ctx.menu.update(), // perbarui waktu ketika tombol ditekan
  );
```

> Tujuan dari penggunaan `onMenuOutdated` dijelaskan [di bawah sini](#menu-kedaluwarsa-beserta-fingerprint-nya).
> Kamu bisa mengabaikannya untuk sementara waktu.

Kamu juga bisa memperbarui menu secara implisit dengan cara mengubah pesan yang bersangkutan.

```ts
const menu = new Menu("waktu")
  .text(
    "Jam berapa sekarang?",
    (ctx) =>
      ctx.editMessageText("Sekarang pukul " + new Date().toLocaleString()),
  );
```

Menu tersebut akan mendeteksi bahwa kamu hendak mengubah isi pesan teksnya, sehingga ia akan menggunakan kesempatan tersebut untuk memperbarui tombol-tombolnya juga.
Hasilnya, kamu bisa menghindari pemanggilan berulang `ctx.menu.update()`.

Memanggil `ctx.menu.update()` tidak akan memperbarui menu di saat itu juga.
Melainkan, ia akan membuat sebuah tanda dan mengingat untuk memperbaruinya di suatu momen tertentu selama memproses middleware kamu.
Perilaku ini dinamakan _lazy updating_.
Sehingga, nanti ketika kamu mau mengubah pesannya lagi, plugin tersebut cukup menggunakan pemanggilan API yang sama untuk memperbarui tombolnya.
Dengan begitu bot bisa bekerja secara efisien dengan cara memperbarui pesan beserta keyboard-nya di waktu yang bersamaan.

Normalnya, jika kamu memanggil `ctx.menu.update()` tetapi tidak melakukan perubahan pesan, plugin menu akan memperbarui keyboard tersebut sebelum middleware kamu selesai memprosesnya.

Kamu bisa memaksa menu untuk melakukan pembaruan di saat itu juga menggunakan `await ctx.menu.update({ immediate: true })`.
Perlu dicatat bahwa `ctx.menu.update()` akan mengembalikan sebuah promise, jadi kamu harus menggunakan `await`!
Menggunakan penanda `immediate` juga berlaku untuk semua operasi-operasi lain yang bisa kamu panggil di `ctx.menu`.
Gunakan penanda tersebut jika memang dibutuhkan.

Jika kamu ingin menutup sebuah menu, misal menghapus semua tombol, kamu bisa memanggil `ctx.menu.close()`.
Sama dengan sebelumnya, ia akan diproses secara _lazy_ juga.

## Navigasi di Sepanjang Menu

Kamu bisa dengan mudah membuat menu dengan beberapa halaman serta navigasinya.
Setiap halaman memiliki instance `Menu`-nya sendiri.
Tombol `submenu` adalah sebuah tombol yang berfungsi untuk bernavigasi ke halaman lain.
Navigasi ke halaman sebelumnya bisa dilakukan dengan tombol `back`.

```ts
const main = new Menu("menu-utama")
  .text("Sapa", (ctx) => ctx.reply("Halo!")).row()
  .submenu("Credit", "menu-credit");

const settings = new Menu("menu-credit")
  .text("Tampilkan Credit", (ctx) => ctx.reply("Didukung oleh grammY"))
  .back("Kembali");
```

Kedua tombol tersebut berperan sebagai handler middleware, jadi kamu bisa merespon event navigasinya juga.

Selain menggunakan tombol `submenu` dan `back` untuk menavigasi di sepanjang halaman, kamu juga bisa melakukannya secara manual menggunakan `ctx.menu.nav()`.
Function ini memeriksa string identifier menu, lalu melakukan navigasi secara _lazy_.
Ini juga berlaku untuk navigasi mundur menggunakan `ctx.menu.back()`.

Selanjutnya, kamu perlu menyambungkan masing-masing menu dengan cara mendaftarkannya satu sama lain.
Dengan mendaftarkan menu satu ke lainnya kita telah menyatakan hierarki mereka.
Menu yang dijadikan rujukan adalah induknya, dan sebaliknya, menu yang didaftarkan adalah anaknya.
Dari contoh di bawah, selama tidak ada induk lain yang telah ditentukan secara eksplisit, maka `main` adalah induk dari `settings`.
Menu induk digunakan ketika melakukan navigasi mundur.

```ts
// Mendaftarkan menu pengaturan ke menu main.
main.register(settings);
// Opsional, tentukan induk yang berbeda
main.register(settings, "kembali-dari-menu-pengaturan");
```

Kamu bisa mendaftarkan dan merangkai menu sebanyak yang kamu mau.
Gunakan identifier menu untuk berpindah ke halaman lain dengan mudah.

**Kamu hanya perlu membuat satu menu untuk satu rangkaian menu interaktif**.
Contohnya, cukup sertakan menu `main` ke `bot.use`.

```ts
// Kalau kamu punya ini:
main.register(pengaturan);

// Lakukan ini:
bot.use(main);

// Jangan lakukan ini:
bot.use(main);
bot.use(pengaturan);
```

**Kamu bisa membuat beberapa menu tersendiri lalu membuatnya menjadi interaktif.**
Contohnya, jika kamu membuat dua menu yang tidak saling berkaitan dan kamu tidak perlu bernavigasi di antara dua menu tersebut, kamu harus memasang keduanya secara terpisah.

```ts
// Jika kamu memiliki menu-menu tersendiri seperti ini:
const menuA = new Menu("menu-a");
const menuB = new Menu("menu-b");

// Kamu bisa melakukan ini:
bot.use(menuA);
bot.use(menuB);
```

## Payload

Kamu bisa menyimpan payload teks singkat di semua navigasi dan tombol teks.
Ketika handler tersebut dipanggil, payload teks akan tersedia di `ctx.match`.
Ini berguna untuk menyimpan data kecil di dalam sebuah menu.

Berikut contoh menu yang mengingat waktu saat ini di dalam payload-nya.
Contoh penggunaan lainnya misal untuk menyimpan index dari menu paginasi.

```ts
function generatePayload() {
  return Date.now().toString();
}
const menu = new Menu("simpan-waktu-saat-ini-di-payload")
  .text(
    { text: "BATALKAN!", payload: generatePayload },
    async (ctx) => {
      // Beri pengguna waktu selama 5 detik untuk membatalkan operasi tersebut.
      const text = Date.now() - Number(ctx.match) < 5000
        ? "Operasi berhasil dibatalkan."
        : "Terlambat. Video kucingmu terlanjur viral di internet.";
      await ctx.reply(text);
    },
  );
bot.use(menu);
bot.command("publikasi", async (ctx) => {
  await ctx.reply(
    "Video akan dikirim. Kamu punya waktu selama 5 detik untuk membatalkannya.",
    {
      reply_markup: menu,
    },
  );
});
```

::: tip Batasan
Payload tidak bisa digunakan untuk menyimpan data dalam jumlah besar.
Satu-satunya yang bisa kamu simpan adalah string pendek berukuran kurang dari 50 byte, misalnya sebuah index ataupun sebuah identifier.
Jika kamu ingin menyimpan data user seperti identifier file, URL, dan lain-lain, kamu bisa menggunakan [sessions](./session).

Selain itu, perhatikan bahwa payload selalu dihasilkan berdasarkan objek context saat ini.
Artinya, _posisi asal_ sebelum kamu bernavigasi ke menu akan mempengaruhi hasilnya.
Misalnya, ketika suatu menu sudah [kedaluwarsa](#menu-kedaluwarsa-beserta-fingerprint-nya), ia akan di-render ulang _berdasarkan tombol menu kedaluwarsa tersebut_.
:::

Payload juga bekerja dengan baik untuk [rentang dinamis](#rentang-dinamis).

## Rentang Dinamis

Sejauh ini, kita hanya melihat bagaimana mengubah teks di tombol secara dinamis.
Kamu juga bisa mengatur struktur menu untuk menambah dan menghapus tombol secara dinamis.

::: danger Mengubah Menu Ketika Memproses Pesan
Kamu tidak bisa membuat atau mengubah menu ketika pemrosesan pesan sedang berlangung.
Semua menu harus dibuat dan didaftarkan sebelum bot dimulai.
Artinya, kamu tidak bisa melakukan `new Menu("id")` di handler bot kamu.
Kamu juga tidak bisa memanggil `menu.text` atau semacamnya di handler bot kamu.

Menambah menu baru ketika bot sedang berjalan akan mengakibatkan memory leak.
Bot kamu akan melambat seiring waktu, dan kemudian crash.

Sebagai gantinya, kamu bisa memanfaatkan rentang dinamis yang telah dijelaskan di bagian ini.
Ia mampu mengubah struktur instance menu yang tersedia secara langsung.
:::

Kamu bisa membuat beberapa bagian tombol menu secara otomatis (atau bahkan semua tombol jika kamu mau).
Kita bisa menyebut tombol-tombol tersebut sebagai _rentang dinamis_.
Dengan kata lain, daripada menentukan tombol menu secara langsung, kamu bisa membuat sebuah function yang akan menciptakan tombol-tombol tersebut ketika menu di-render.
Cara yang paling gampang untuk membuat rentang dinamis adalah dengan menggunakan class `MenuRange` yang disediakan plugin ini.
`MenuRange` menyediakan function yang sama seperti menu, bedanya ia tidak memiliki sebuah identifier serta tidak bisa didaftarkan.

```ts
const menu = new Menu("dynamic");
menu
  .url("Tentang", "https://grammy.dev/plugins/menu").row()
  .dynamic(() => {
    // Buat sebagian menu secara dinamis!
    const range = new MenuRange();
    for (let i = 0; i < 3; i++) {
      range
        .text(i.toString(), (ctx) => ctx.reply(`Kamu memilih ${i}`))
        .row();
    }
    return range;
  })
  .text("Batal", (ctx) => ctx.deleteMessage());
```

> Catatan terjemahan: Setiap kali kami menyebut function range builder atau function factory, maka kami merujuk ke sebuah function yang menciptakan tombol-tombol rentang dinamis untuk menu tersebut.

Function range builder yang kamu tambahkan ke `dynamic` mungkin saja berupa `async`, sehingga kamu bisa membaca data dari sebuah API atau database sebelum mengembalikan range menu baru.
**Di kebanyakan kasus, membuat rentang dinamis berdasarkan data [session](./session) adalah cara yang lebih direkomendasikan.**

Function range builder mengambil sebuah object context sebagai argument pertamanya (object context tidak dicantumkan di contoh di atas).
Pilihan lainnya, kamu bisa memperoleh instance `MenuRange` baru di argument kedua setelah `ctx`.
Kamu bisa memodifikasinya alih-alih mengembalikan instance-mu sendiri.
Berikut cara menggunakan kedua parameter function range builder.

```ts
menu.dynamic((ctx, range) => {
  for (const text of ctx.session.items) {
    range // Tidak memerlukan `new MenuRange()` atau sebuah `return`
      .text(text, (ctx) => ctx.reply(text))
      .row();
  }
});
```

Function factory kamu harus bekerja dengan cara yang sudah ditentukan, jika tidak menu kamu akan menghasilkan perilaku aneh atau bahkan melempar error.
Karena menu selalu [di-render dua kali](#bagaimana-cara-kerjanya) (sekali ketika menu dikirim, dan sekali ketika tombol ditekan), maka kamu harus memastikan:

1. **Function range builder kamu tidak memiliki side-effect.**
   Tidak mengirim pesan.
   Tidak mengubah data session.
   Tidak mengubah variable di luar function.
   Baca [mengenai side-effect di Wikipedia](https://en.wikipedia.org/wiki/Side_effect_(computer_science)).

2. **Function kamu stabil**, ia tidak bergantung kepada hal yang tidak tentu seperti menggunakan waktu saat ini sebagai acuan, atau data-data lain yang berubah secara cepat.
   Ia juga harus menciptakan tombol yang sama, baik ketika menu di-render untuk yang pertama kalinya maupun juga yang kedua kalinya.
   Jika tidak, plugin menu tidak bisa mencocokkan handler yang benar ketika tombol ditekan.
   Ia malah akan mengira menu kamu sudah [kedaluwarsa](#menu-kedaluwarsa-beserta-fingerprint-nya) karena kedua tombol terlihat berbeda, sehingga handler tersebut tidak akan dipanggil.

## Menjawab Callback Query Secara Manual

Plugin menu akan memanggil `answerCallbackQuery` secara otomatis untuk masing-masing tombolnya.
Kamu bisa menyetel `autoAnswer: false` jika ingin menonaktifkannya.

```ts
const menu = new Menu("id", { autoAnswer: false });
```

Sekarang kamu bisa memanggil `answerCallbackQuery` secara manual untuk membuat pesan khusus yang akan ditampilkan ke user.

## Menu Kedaluwarsa Beserta Fingerprint-nya

Anggaplah kamu memiliki sebuah menu yang berfungsi untuk mengaktifkan dan menonaktifkan notifikasi, seperti contoh [di atas](#label-dinamis).
Sekarang, jika seorang user mengirim `/settings` dua kali, mereka akan mendapatkan menu dua kali juga.
Sayangnya, mengubah pengaturan notifikasi di salah satu pesan tidak akan memperbarui pesan yang lain!

Dari situ, jelas kita tidak bisa memantau semua pesan `settings` di sebuah chat, lalu memperbarui menu-menu sebelumnya di seluruh riwayat chat.
Hal ini akan mengakibatkan banyak sekali pemanggilan API yang akan membuat Telegram menerapkan rate-limit ke bot kamu.
Kamu juga akan membutuhkan banyak tempat penyimpanan untuk mengingat semua identifier pesan di seluruh chat.
Ini sama sekali tidak praktis.

Solusinya adalah sebelum melakukan tindakan, kita akan mengecek apakah menu tersebut sudah kedaluwarsa atau tidak.
Dengan cara seperti itu, kita akan memperbarui menu lama hanya ketika user mulai menekan tombol-tombolnya.
Menu plugin menangani hal tersebut secara otomatis, jadi kamu tidak perlu mengkhawatirkannya.

Kamu bisa mengatur tindakan apa yang akan dilakukan ketika menu kedaluwarsa terdeteksi.
Secara bawaan, pesan "Menu was outdated, try again!" akan ditampilkan ke user, kemudian menu tersebut akan diperbarui.
Kamu bisa menentukan tindakan lainnya di konfigurasi `onMenuOutdated`.

```ts
// Pesan khusus akan ditampilkan.
const menu0 = new Menu("id", {
  onMenuOutdated: "Sudah diperbarui, silahkan dicoba.",
});
// Function handler khusus
const menu1 = new Menu("id", {
  onMenuOutdated: async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply("Berikut menu barunya", { reply_markup: menu1 });
  },
});
// Menonaktifkan pengecekan menu yang kedaluwarsa
// (dapat mengakibatkan pemrosesan handler tombol yang tidak sesuai).
const menu2 = new Menu("id", { onMenuOutdated: false });
```

Kami memiliki sebuah algoritma untuk mengecek apakah menu tersebut sudah kedaluwarsa atau tidak.
Kami akan menentukannya sebagai kedaluwarsa jika:

- Bentuk menu telah berubah (jumlah baris, atau jumlah tombol di baris manapun).
- Posisi baris/kolom tombol yang ditekan berada di luar batas.
- Label di tombol yang ditekan berubah.
- Tombol yang ditekan tidak memiliki sebuah handler.

Menu kamu bisa saja terjadi perubahan, sementara hal-hal yang disebutkan di atas masih tetap sama.
Menu kamu juga bisa saja tidak terjadi perubahan secara fundamental (misal perilaku handler tidak berubah), meskipun algoritma di atas mengindikasikan bahwa menu sudah kedaluwarsa.
Kedua skenario tersebut kemungkinan besar tidak akan terjadi di sebagian besar bot, tetapi jika kamu mengalaminya, maka kamu perlu menggunakan function fingerprint

```ts
function ident(ctx: Context): string {
  // Mengembalikan sebuah string yang akan berubah
  // jika menu kamu benar-benar terjadi perubahan.
  // Sehingga ia akan dianggap sebagai kedaluwarsa.
  return ctx.session.myStateIdentifier;
}
const menu = new Menu("id", { fingerprint: (ctx) => ident(ctx) });
```

String fingerprint tersebut akan menggantikan algoritma di atas.
Dengan demikian, kamu bisa memastikan bahwa menu yang sudah kedaluwarsa akan selalu terdeteksi.

## Bagaimana Cara Kerjanya

Plugin menu bekerja tanpa menyimpan data sama sekali.
Ini penting untuk bot-bot besar yang menangani berjuta-juta user.
Menyimpan sebuah state dari semua menu akan mengonsumsi terlalu banyak memory.

Ketika kamu membuat sebuah object menu lalu menyambungkannya melalui pemanggilan `register`, maka sebenarnya tidak ada menu yang dibuat.
Sebaliknya, plugin menu akan mengingat struktur menu baru berdasarkan operasi yang kamu lakukan.
Kapanpun sebuah menu dikirim, ia akan merespon operasi tersebut dengan me-render menu kamu.
Ini termasuk menaruh semua rentang dinamis serta label dinamis.
Saat menu sudah dikirim, array tombol yang sudah di-render akan dilupakan kembali.

Ketika menu sudah terkirim, tiap-tiap tombol akan berisi callback query yang menyimpan:

- Identifier menu.
- Posisi baris/kolom tombol.
- Payload tambahan.
- Sebuah penanda fingerprint yang menyimpan informasi apakah suatu fingerprint telah digunakan di menu atau tidak.
- Sebuah hash 4-byte yang meng-encode fingerprint, layout menu, dan label tombol.

Dengan begitu, kita bisa mengidentifikasi secara tepat tombol dari menu mana yang sedang ditekan.
Sebuah menu hanya akan memroses penekanan tombol jika:

- Identifier menu sesuai.
- Tersedia baris/kolom.
- Penanda fingerprint disertakan.

Ketika user menekan tombol menu, kita harus menemukan handler yang telah ditambahkan ke tombol tersebut saat menu di-render sebelumnya.
Dengan cara seperti itu, kita cukup me-render ulang menu sebelumnya.
Tetapi, untuk kali ini, kita tidak membutuhkan layout-nya secara utuh---yang kita butuhkan adalah struktur secara keseluruhan, serta tombol spesifik tersebut.
Sehingga, plugin menu akan melakukan pe-render-an tipis-tipis supaya lebih efisien.
Dengan kata lain, menu tersebut akan di-render sebagian saja.

Ketika tombol yang ditekan sudah diketahui kembali (dan kita sudah memastikan menu tidak [kedaluwarsa](#menu-kedaluwarsa-beserta-fingerprint-nya)), kita akan memanggil handler tersebut.

Secara internal, plugin menu sepenuhnya memanfaatkan [Function Transformer API](../advanced/transformers), contohnya untuk me-render secara cepat menu yang keluar saat itu juga.

Ketika kamu mendaftarkan menu di hierarki navigasi yang luas, pada kenyataannya mereka tidak akan menyimpan referensi tersebut secara eksplisit.
Di balik layar, menu-menu yang berasal dari satu struktur ditambahkan ke tempat penampungan besar yang sama, lalu penampungan tersebut digunakan secara bersama-sama oleh semua instance terkait.
Setiap menu bertanggung jawab untuk menu-menu lain di index tersebut, dan mereka dapat menangani dan me-render satu sama lain (Biasanya, hanya menu utama yang diteruskan ke `bot.use` dan dari situ ia kan menerima update.
Jika kasusnya seperti itu, instance tersebut akan menangani penampungan secara keseluruhan).
Hasilnya, kamu bisa menavigasi di antara menu tanpa batas, semua bisa dilakukan selama penanganan update terjadi dalam [kompleksitas waktu `O(1)`](https://en.wikipedia.org/wiki/Time_complexity#Constant_time) karena tidak perlu mencari ke seluruh hierarki untuk menemukan menu yang tepat untuk menangani tombol apapun yang ditekan.

## Ringkasan Plugin

- Nama: `menu`
- [Sumber](https://github.com/grammyjs/menu)
- [Referensi](/ref/menu/)
