# Internasionalisasi dengan Fluent (`fluent`)

[Fluent](https://projectfluent.org/) adalah sebuah sistem penerjemah bahasa yang dibuat oleh Mozilla Foundation dengan tujuan supaya hasil terjemahan terdengar lebih natural.
Ia memiliki sebuah syntax yang canggih dan elegan, sehingga memungkinkan siapa pun dapat menerjemah secara efisien serta bisa dipahami dengan baik.
Plugin ini memanfaatkan sistem penerjemah tersebut untuk membuat bot grammY menjadi fasih serta menghasilkan terjemahan berkualitas tinggi.

<!-- ::: tip Fluent vs i18n
Jangan bingung membedakan plugin ini dengan plugin [i18n](./i18n.md).

Plugin [i18n](./i18n.md) merupakan versi upgrade dari plugin ini.
Ia dapat digunakan baik di Deno maupun Node.js.
::: -->

## Inisialisasi Fluent

Pertama-tama, inisialisasi instance Fluent.

```typescript
import { Fluent } from "@moebius/fluent";

const fluent = new Fluent();
```

Kemudian, kamu perlu menambahkan setidaknya satu terjemahan ke instance Fluent.

```typescript
await fluent.addTranslation({
  // Tentukan satu atau lebih locale yang didukung oleh terjemahanmu:
  locales: "id",

  // Kamu bisa menentukan isi terjemahannya secara langsung:
  source: "{ISI FILE TERJEMAHAN KAMU}",

  // Atau file-file terjemahannya:
  filePath: [
    `${__dirname}/feature-1/translation.id.ftl`,
    `${__dirname}/feature-2/translation.id.ftl`,
  ],

  // Semua elemen Fluent bisa dikonfigurasi dengan mudah
  bundleOptions: {
    // Gunakan opsi ini untuk menghindari karakter huruf
    // yang tidak terlihat di sekitar objek placeable.
    useIsolating: false,
  },
});
```

## Menulis Pesan Terjemahan

Syntax Fluent sangat mudah untuk dipelajari.
Kamu bisa memulainya dengan meniru [contoh resmi berikut](https://projectfluent.org/#examples) atau dengan mempelajari [panduan lengkap syntax](https://projectfluent.org/fluent/guide/).

Untuk saat ini, mari kita mulai dengan contoh berikut:

```ftl
-bot-name = Bot Krupuk

welcome =
  Selamat datang, {$name}, di {-bot-name}!
  Kamu { NUMBER($krupukCount) ->
    [0] tidak punya krupuk sama sekali
    [1] cuma punya {$krupukCount} krupuk
    *[other] punya {$krupukCount} krupuk
  }.
```

Contoh di atas menggunakan tiga fitur utama Fluent, yaitu: **terms**, **variable substitution** (placeable), dan **pluralization**.

`welcome` adalah **message ID**-nya.
Ia digunakan untuk merujuk pesan terkait ketika di-render.

Statement `-bot-name = Bot Krupuk` menghasilkan sebuah **term** dengan nama `bot-name` yang memiliki value `Bot Krupuk`.
Construct `{-bot-name}` merujuk ke term yang telah ditentukan sebelumnya dan akan digantikan dengan value dari term tersebut ketika di-render.

Statement `{$name}` akan digantikan dengan value dari variable `name` yang perlu kamu tentukan sendiri di function terjemahannya.

Statement terakhir (_baris 5 sampai 9_) menghasilkan sebuah **selector** (sangat mirip dengan statement switch) yang akan menerima hasil dari function `NUMBER` khusus yang menggunakan variable `krupukCount` lalu memilih salah satu dari tiga pilihan pesan yang akan di-render berdasarkan value yang sesuai.
Function `NUMBER` akan mengembalikan sebuah [kategori plural CLDR](https://www.unicode.org/cldr/cldr-aux/charts/30/supplemental/language_plural_rules.html) berdasarkan value yang disediakan dan locale yang digunakan.
Dengan demikian, pluralisasi dapat diterapkan dengan baik.

> Catatan dari penerjemah: Di bahasa Indonesia, kata plural atau jamak tidak terlalu mempengaruhi struktur kalimat.
> Contoh: satu apel, dua apel, orang pertama, orang kedua, orang ketiga.
> Tetapi, di bahasa Inggris misalnya, kata jamak dan tunggal akan berpengaruh.
> Perhatikan perbedaan imbuhan "s" di akhir kata benda jamak dan imbuhan "-st, -nd, -rd" di contoh berikut.
> Contoh: one apple, two apple**s**, 1**st** person, 2**nd** person, 3**rd** person.

## Konfigurasi grammY

Sekarang, mari kita lihat bagaimana pesan di atas bisa di-render oleh sebuah bot.
Pertama-tama, kita perlu mengonfigurasi grammY untuk menggunakan plugin ini.

Kamu juga perlu mengonfigurasi bot kamu untuk menggunakan Fluent context flavor.
Jika kamu masih merasa asing dengan konsep tersebut, sebaiknya kamu pahami terlebih dahulu materi [Context Flavors](../guide/context.md#context-flavor).

```typescript
import { Context } from "grammy";
import { FluentContextFlavor } from "@grammyjs/fluent";

// Tambahkan context type aplikasimu
// dengan flavor interface yang telah disediakan.
export type MyAppContext =
  & Context
  & FluentContextFlavor;
```

Buat instance bot dengan cara berikut agar bisa menggunakan context type yang sudah ditambahkan tadi:

```typescript
const bot = new Bot<MyAppContext>();
```

Langkah terakhir adalah menambahkan plugin Fluent itu sendiri ke grammY:

```typescript
bot.use(useFluent({
  fluent,
}));
```

Pastikan untuk menambahkan [instance Fluent yang sudah dibuat sebelumnya](#inisialisasi-fluent).

## Me-render Pesan yang Sudah Diterjemahkan

Mantap, sekarang kita punya segalanya untuk me-render pesan kita!
Mari kita buat percobaan dengan menentukan sebuah command di bot kita:

```typescript
bot.command("i18n_test", async (ctx) => {
  // Panggil "translate" atau "t" helper untuk me-render pesan
  // dengan cara memasukkan ID-nya serta paramater tambahan lainnya:
  await ctx.reply(ctx.t("welcome", {
    name: ctx.from.first_name,
    krupukCount: 1,
  }));
});
```

Sekarang, kamu bisa memulai bot-mu dan menggunakan command `/i18n_test`.
Seharusnya, hasil render akan menampilkan pesan berikut:

```text:no-line-numbers
Selamat datang, Budi, di Bot Krupuk!
Kamu cuma punya 1 krupuk.
```

Tentu saja, kamu akan melihat nama kamu sendiri alih-alih "Budi".
Coba ubah value dari variable `krupukCount` untuk melihat bagaimana pesan yang telah di-render akan berubah!

Perlu diketahui, kamu bisa menggunakan function translation di berbagai tempat selama terdapat `Context` di tempat tersebut.
Library-nya akan secara otomatis menentukan locale terbaik untuk setiap user berdasarkan preferensi personal mereka (bahasa yang dipakai di pengaturan aplikasi Telegram).
Kamu cuma perlu membuat beberapa file terjemahan lain serta memastikan semua terjemahan tersinkronisasi dengan baik.

## Tahap Selanjutnya

- Baca [dokumentasi Fluent](https://projectfluent.org/) hingga tuntas, khususnya [panduan syntax](https://projectfluent.org/fluent/guide/).
- [Beralih dari plugin `i18n`.](https://github.com/grammyjs/fluent#i18n-plugin-replacement)
- Pahami dengan baik [`@moebius/fluent`](https://github.com/the-moebius/fluent#readme).

## Ringkasan Plugin

- Nama: `fluent`
- Sumber: <https://github.com/grammyjs/fluent>
