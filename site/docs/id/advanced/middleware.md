---
prev:
  link: ./
next:
  link: ./structuring
---

# Membangkitkan Middleware

Di [bab sebelumnya](../guide/middleware), kami telah menjelaskan middleware sebagai lapisan-lapisan function yang saling bertumpukan.
Meski tidak sepenuhnya salah, namun menyebutnya sebagai "tumpukan" atau _stack_ hanyalah penyederhanaan supaya mudah dipahami.

## Middleware di grammY

Umumnya, kamu akan menemui pola seperti ini.

```ts
const bot = new Bot("");

bot.use(/* ... */);
bot.use(/* ... */);

bot.on(/* ... */);
bot.on(/* ... */);
bot.on(/* ... */);

bot.start();
```

Memang mirip seperti tumpukan, tetapi di balik layar mereka sebenarnya lebih mirip seperti cabang pohon.
Komponen utama pembentuk pohon ini adalah class `Composer` ([referensi](https://deno.land/x/grammy/mod.ts?s=Composer)).

Pertama-tama, setiap instance `Bot` adalah instance dari `Composer`.
Ia hanyalah sebuah subclass. Oleh karena itu `class Bot extends Composer`.

Kamu juga harus tahu bahwa setiap method `Composer` di dalamnya memanggil `use`.
Sebagai contoh, `filter` memanggil `use` dengan beberapa percabangan middleware, sementara `on` memanggil `filter` lagi dengan beberapa _predicate function_ yang terdapat kecocokan antara update dan [filter query](../guide/filter-queries) yang diberikan.
Untuk saat ini, kita cukupkan pembahasan mengenai `use` dan lanjut ke pembahasan berikutnya.

Kita akan mengupas sedikit mengenai apa yang dilakukan `Composer` terhadap pemanggilan `use`, dan apa bedanya dengan sistem middleware lain di luar sana.
Perbedaannya mungkin tidak begitu mencolok, tetapi tunggu hingga kita membahas mengenai manfaat luar biasa yang dihasilkannya.

## Memperbanyak `Composer`

Kamu bisa memasang lebih banyak middleware di instance `Composer`, bahkan setelah memasang `Composer` itu sendiri di tempat lain.

```ts
const bot = new Bot(""); // subclass dari `Composer`

const composer = new Composer();
bot.use(composer);

// Berikut akan dijalankan:
composer.use(/* A */);
composer.use(/* B */);
composer.use(/* C */);
```

`A`, `B`, dan `C` akan dijalankan.
Yang dimaksud di sini adalah setelah kamu menambahkan sebuah instance `Composer`, kamu masih bisa memanggil `use` pada instance tersebut dan semua middleware-nya akan tetap dijalankan.
(Ini bukan sesuatu yang istimewa, tetapi sudah menjadi sebuah pembeda utama dari framework populer sejenis yang mengabaikan pemanggilan berikutnya).

Kamu mungkin bertanya-tanya dimana struktur pohonnya.
Mari kita lihat potongan kode berikut:

```ts
const composer = new Composer();

composer.use(/* A */);
composer.use(/* B */).use(/* C */);
composer.use(/* D */).use(/* E */).use(/* F */).use(/* G */);
composer.use(/* H */).use(/* I */);
composer.use(/* J */).use(/* K */).use(/* L */);
```

Sudah terlihat?

Yup, semua middleware tersebut akan dijalankan secara berurutan dari `A` ke `L`.

Library lain akan menjalankan kode dengan cara `composer.use(/* A */).use(/* B */).use(/* C */).use(/* D */)...` dan seterusnya.
Sebaliknya, grammY menggunakan struktur pohon: satu simpul akar (`composer`) memiliki lima cabang (`A`, `B`, `D`, `H`, `J`), sementara cabang dari `B` memiliki satu anak cabang, yaitu `C`, dan seterusnya.
Pohon ini kemudian akan dilalui oleh setiap update sesuai urutan kedalamannya, yang sama efektifnya dengan melewati `A` ke `L` secara berurutan, mirip yang kita kenal di sistem lain.

Proses ini memungkinkan untuk membuat instance baru dari `Composer` setiap kali kamu memanggil `use`, yang kemudian akan di-extend (seperti yang sudah diterangkan di atas).

## Menggabungkan Pemanggilan `use`

Kalau kita hanya menggunakan satu `use`, itu tidak akan terlalu bag-_use_ — _maaf, garing_ :grimacing:.
Akan semakin menarik ketika kita menambahkan sesuatu ke dalamnya, misal `filter`.

Lihat kode berikut:

```ts
const composer = new Composer();

composer.filter(/* 1 */, /* A */).use(/* B */)

composer.filter(/* 2 */).use(/* C */, /* D */)
```

Di baris 3, kita menambahkan `A` di belakang _predicate function_ `1`.
`A` akan dievaluasi untuk update hanya jika kondisi `1` terpenuhi.
Meski begitu, `filter` mengembalikan instance `Composer` yang telah kita tambahkan dengan pemanggilan `use` di baris 3, sehingga `B` masih terproteksi oleh `1`, meskipun ia dipasang di pemanggilan `use` yang berbeda.

Baris 5 sama halnya dengan baris 3, `C` dan `D` hanya akan dijalankan jika kondisi `2` terpenuhi.

Masih ingat bagaimana pemanggilan `bot.on()` bisa dirangkai untuk menggabungkan beberapa _filter query_ menggunakan AND?
Sekarang, bayangkan ini:

```ts
const composer = new Composer();

composer.filter(/* 1 */).filter(/* 2 */).use(/* A */);
```

`2` hanya akan dievaluasi jika `1` terpenuhi, dan `A` hanya akan dijalankan jika `2` (serta `1`) terpenuhi.

Coba kunjungi kembali materi mengenai [pengombinasian filter query](../guide/filter-queries#mengombinasikan-beberapa-query) dengan pengetahuan dan kekuatan barumu.

Khusus `fork` sedikit berbeda karena ia memulai dua komputasi secara bersamaan, misal disisipkan ke _event loop_.
Alih-alih mengembalikan instance `Composer` yang dibuat oleh pemanggilan `use`, ia mengembalikan sebuah `Composer` yang merefleksikan komputasi percabangan.
Dengan begitu akan memungkinkan untuk membuat pola seperti `bot.fork().on(":text").use(/* A */)`.
`A` sekarang akan dieksekusi di percabangan komputasi paralel.
