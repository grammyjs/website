# Filter Query dan `bot.on()`

_Filter query_ merupakan argument pertama dari `bot.on()` yang berbentuk string.

## Pengenalan

Sebagian besar framework bot---atau bahkan semuanya?---hanya menyediakan pemfilteran update yang sederhana, misalnya cuma disediakan `on("message")` dan sejenisnya.
Pemfilteran untuk jenis pesan lainnya diserahkan kepada developer bot masing-masing untuk ditangani sendiri, yang mana sering kali mengarah ke penggunaan statemen `if` yang tidak ada habisnya di dalam kode mereka.

Sebaliknya, **grammY dilengkapi dengan bahasa query-nya sendiri** yang dapat digunakan untuk **memfilter pesan yang kamu inginkan**.

grammY memiliki lebih dari 1150 filter berbeda yang siap dipakai, dan tidak menutup kemungkinan lebih banyak lagi filter yang akan ditambahkan seiring berjalannya waktu.
Setiap filter yang valid dapat dilengkapi menggunakan auto-complete di code editor.
Dengan demikian, kamu cukup mengetik `bot.on("")`, lalu buka auto-complete, kemudian telusuri semua query yang tersedia dengan cara mengetik sesuatu.

![Pencarian Filter Query](/images/filter-query-search.png)

_Type inference_ `bot.on()` akan memahami filter query yang sedang kamu pilih. Dari situ, ia akan mengerucutkan beberapa type context yang ada.

```ts
bot.on("message", async (ctx) => {
  // Bisa jadi undefined kalau pesan yang diterima tidak ada teksnya.
  const text: string | undefined = ctx.msg.text;
});
bot.on("message:text", async (ctx) => {
  // Text selalu tersedia karena handler ini dipanggil
  // ketika pesan yang diterima hanya berupa teks.
  const text: string = ctx.msg.text;
});
```

Filter query grammY tersedia di level [_runtime_](#performa) dan [_type_](#type-safety).

## Contoh Query

Berikut ini beberapa contoh query:

### Query Biasa

Filter sederhana untuk update dan sub-filter:

```ts
bot.on("message"); // dipanggil untuk jenis pesan apapun
bot.on("message:text"); // hanya menerima pesan teks
bot.on("message:photo"); // hanya menerima pesan foto
```

### Filter untuk Entity

Sub-filter yang masuk satu tingkat lebih dalam:

```ts
bot.on("message:entities:url"); // untuk pesan yang mengandung url
bot.on("message:entities:code"); // untuk pesan yang berisi cuplikan kode
bot.on("edited_message:entities"); // untuk pesan diedit yang mengandung entity apapun bentuknya
```

### Mengosongkan Value

Kamu dapat mengosongkan value tertentu di filter query.
grammY kemudian akan mencari value yang sesuai dengan query kamu.

```ts
bot.on(":text"); // Seluruh pesan dan postingan channel yang mengandung teks
bot.on("message::url"); // Pesan yang mengandung URL baik di teks maupun di caption (foto, dan sebagainya)
bot.on("::email"); // Seluruh pesan dan postingan channel yang mengandung email di teks maupun di caption-nya
```

Mengosongkan value _pertama_ akan mencocokkan pesan serta postingan channel.
[Perlu diingat](./context#aksi-yang-tersedia) bahwa `ctx.msg` memberi kamu akses ke pesan dan postingan channel manapun yang cocok dengan query yang diberikan.

Mengosongkan value _kedua_ akan mencocokkan entity, baik di pesan maupun di caption.
Kamu bisa menghilangkan bagian pertama dan kedua secara bersamaan.

### Shortcut

_Query engine_ grammY memiliki shortcut yang dapat mengelompokkan query-query yang saling berkaitan.

#### `msg`

Shortcut `msg`---bukan msg micin, loh ya :grimacing:---mengelompokkan pesan dan postingan channel.
Dengan menggunakan `msg`sama halnya dengan menyimak aktivitas `message` dan `channel_post`.

```ts
bot.on("msg"); // Pesan atau postingan channel apapun bentuknya
bot.on("msg:text"); // Sama dengan menggunakan `:text`
```

#### `edit`

Shortcut `edit` mengelompokkan pesan serta postingan channel yang diedit.
Dengan kata lain, menggunakan `edit` serupa dengan menyimak event `"edited_message"` dan `"edited_channel_post"`.

```ts
bot.on("edit"); // Semua pesan dan postingan yang diedit
bot.on("edit:text"); // Pesan teks yang diedit
bot.on("edit::url"); // Pesan atau caption yang diedit dan mengandung URL di teksnya
bot.on("edit:location"); // Lokasi terkini (live location) yang diperbarui
```

#### `:media`

Shortcut `:media` mengelompokkan pesan foto dan video.
Dengan kata lain, menggunakan `:media` serupa dengan menyimak event `":photo"` dan `":video"`.

```ts
bot.on("message:media"); // pesan foto atau video
bot.on("edited_channel_post:media"); // postingan channel yang diedit dan berupa media
bot.on(":media"); // pesan atau postingan channel berupa media
```

#### `:file`

Shortcut `:file` mengelompokkan semua pesan yang mengandung file.
Dengan kata lain, menggunakan `:file` serupa dengan menyimak event `":photo"`, `":animation"`, `":audio"`, `":document"`, `":video"`, `":video_note"`, `":voice"`, dan `":sticker"`.
Dengan begitu, kamu bisa yakin kalau `await ctx.getFile()` pasti mengembalikan sebuah object file.

```ts
bot.on(":file"); // Pesan atau postingan channel yang mengandung file
bot.on("edit:file"); // Pesan atau postingan channel yang sudah diedit dan mengandung file
```

### Syntactic Sugar

> Catatan penerjemah: syntactic sugar merupakan sebuah sintaks yang dibuat sedemikian rupa supaya lebih mudah dibaca dan digunakan oleh programmer.

Terdapat dua potongan query khusus yang bisa membuat proses pemfilteran menjadi semakin mudah.
Kamu bisa mendeteksi bot di query dengan menggunakan potongan query `:is_bot`.
Sedangkan _syntactic sugar_ `:me` dapat digunakan untuk merujuk ke bot kamu di query, yang mana akan membandingkan id user bot kamu.

```ts
// Pesan service mengenai sebuah bot yang bergabung ke chat
bot.on("message:new_chat_members:is_bot");
// Pesan service mengenai bot kamu telah dikeluarkan dari chat
bot.on("message:left_chat_member:me");
```

Perhatikan bahwa meskipun syntactic sugar ini bisa digunakan untuk bekerja dengan pesan service, ia sebaiknya tidak digunakan untuk mendeteksi apakah seseorang benar-benar bergabung atau meninggalkan chat.
Pesan service pada dasarnya adalah pesan untuk menginformasikan pengguna di dalam chat tersebut. Adakalanya dalam beberapa kasus, pesan itu tidak akan selalu terlihat.
Misalnya, di grup besar atau supergroup tidak akan ada pesan service mengenai pengguna yang telah bergabung atau meninggalkan chat.
Akibatnya, bot kamu bisa jadi tidak akan mendeteksinya.
Oleh karena itu, kamu harus menyimak [update chat member](#update-member-chat).

## Mengombinasikan Beberapa Query

Kamu bisa mengombinasikan filter query menggunakan operator AND maupun OR.

### Mengombinasikan Menggunakan OR

Kalau ingin memasang beberapa bagian middleware dibalik penggabungan OR dari dua buah query, kamu bisa memasang keduanya ke `bot.on()` di dalam sebuah array.

```ts
// Dijalankan jika pembaruan berupa pesan OR pesan yang diedit
bot.on(["message", "edited_message"] /* , ... */);
// Dijalankan jika berupa hashtag OR email OR terdapat entity mention di dalam teks atau caption tersebut
bot.on(["::hashtag", "::email", "::mention"] /* , ... */);
```

Middleware tersebut akan dijalankan ketika **salah satu** dari query yang disediakan terdapat kecocokan.
Urutan kueri tidak menjadi masalah.

### Mengombinasikan Menggunakan AND

Kalau ingin memasang beberapa bagian middleware dibalik penggabungan AND dari dua buah query, kamu bisa merangkai keduanya ke `bot.on()`.

```ts
// Mencocokkan URL yang di-forward
bot.on("::url").on(":forward_origin" /* , ... */);
// Mencocokkan foto yang mengandung hashtag di caption-nya
bot.on(":photo").on("::hashtag" /* , ... */);
```

Middleware tersebut akan dijalankan ketika **seluruh** query yang disediakan terdapat kecocokan.
Urutan kueri tidak menjadi masalah.

### Menyusun Query yang Kompleks

Secara teknis kamu bisa mengombinasikan filter query ke rangkaian yang lebih kompleks selama mereka termasuk [CNF](https://en.wikipedia.org/wiki/Conjunctive_normal_form), meski sepertinya ini tidak terlalu bermanfaat juga.

```ts
bot
  // Mencocokkan semua potingan channel atau pesan terusan ...
  .on(["channel_post", ":forward_origin"])
  // ... yang berupa teks ...
  .on(":text")
  // ... dan berisi sekurang-kurangnya satu url, hashtag, atau cashtag.
  .on(["::url", "::hashtag", "::cashtag"] /* , ... */);
```

_Type inference_ `ctx` akan memindai seluruh rangkaian tersebut dan memeriksa setiap elemen dari ketiga panggilan `.on`.
Contohnya, dari potongan kode di atas, _type inference_ dapat mendeteksi kalau `ctx.msg.text` adalah property yang dibutuhkan.

## Tips Berguna

Berikut ini fitur-fitur filter query yang kurang begitu terkenal tetapi bisa sangat membantu.
Beberapa diantaranya merupakan fitur tingkat lanjut, silahkan baca [materi berikutnya](./commands).

### Update Member Chat

Kamu bisa menggunakan filter query berikut untuk menerima status update mengenai bot-mu.

```ts
bot.on("my_chat_member"); // diblokir, blokir dibuka, bergabung, atau keluar
```

Filter di atas akan terpicu di chat pribadi, baik saat bot diblokir maupun saat blokirnya dibuka.
Jika di grup, ia akan terpicu saat bot ditambahkan atau dikeluarkan.
Kamu bisa memeriksa `ctx.myChatMember` untuk mencari tahu apa yang sebenarnya terjadi.

Hati-hati!
Filter ini tidak sama dengan

```ts
bot.on("chat_member");
```

yang digunakan untuk mendeteksi perubahan status member chat lainnya, misalnya ketika seseorang bergabung, dipromosikan, dan sebagainya.

> Ingat! Update `chat_member` perlu diaktifkan secara eksplisit dengan cara menentukan `allowed_updates` saat memulai bot kamu.

### Mengombinasikan Query dengan Method Lain

Kamu bisa mengombinasikan beberapa filter query dengan method-method lain di class `Composer` ([API Reference](/ref/core/composer)), misalnya `command` atau `filter`.
Dengan begitu, kamu bisa membuat pola penanganan pesan menjadi lebih fleksibel.

```ts
bot.on(":forward_origin").command("help"); // Command /help yang di-forward

// Tangani command yang berasal dari private chat saja.
const pm = bot.chatType("private");
pm.command("start");
pm.command("help");
```

### Memfilter Berdasarkan Jenis Pengirim Pesan

Terdapat lima jenis penulis pesan di Telegram, yaitu

1. Penulis postingan channel;
2. Forward otomatis dari channel ke grup diskusi terkait;
3. Akun pengguna biasa, termasuk bot (misal, pesan yang "normal");
4. Admin yang mengirim atas nama grup ([admin anonim](https://telegram.org/blog/filters-anonymous-admins-comments#anonymous-group-admins));
5. Pengguna yang mengirim pesan sebagai salah satu dari channel mereka.

Kamu dapat mengombinasikan filter query dengan mekanisme penanganan update lainnya untuk mengetahui jenis penulis pesan tersebut.

```ts
// Postingan channel yang dikirim oleh `ctx.senderChat`
bot.on("channel_post");

// Forward otomatis dari channel `ctx.senderChat`:
bot.on("message:is_automatic_forward");
// Pesan biasa yang dikirim oleh `ctx.from`
bot.on("message").filter((ctx) => ctx.senderChat === undefined);
// Admin anonim di `ctx.chat`
bot.on("message").filter((ctx) => ctx.senderChat?.id === ctx.chat.id);
// Pengguna yang mengirim pesan atas nama channel mereka `ctx.senderChat`
bot.on("message").filter((ctx) =>
  ctx.senderChat !== undefined && ctx.senderChat.id !== ctx.chat.id
);
```

### Memfilter Berdasarkan Property User

Kamu perlu melakukan request tambahan jika ingin memfilter berdasarkan kriteria user, misalnya `await ctx.getAuthor()` untuk memperoleh informasi penulis pesan tersebut.
Filter query tidak akan secara otomatis melakukan request API lanjutan.
Meski demikian, pemfilteran semacam itu masih cukup mudah dilakukan:

```ts
bot.on("message").filter(
  async (ctx) => {
    const user = await ctx.getAuthor();
    return user.status === "creator" || user.status === "administrator";
  },
  (ctx) => {
    // Menangani pesan dari creator dan para admin.
  },
);
```

### Memanfaatkan Kembali Logika Filter Query

Secara internal, `bot.on` bergantung kepada sebuah function bernama `matchFilter`.
Function ini menerima sebuah filter query lalu meng-compile-nya menjadi _predicate function_.
_Predicate_ tersebut lalu diteruskan ke `bot.filter` untuk memfilter update.

Kamu bisa mengimpor `matchFilter` secara langsung jika ingin menggunakannya di logika pemrogramanmu.
Misalnya, kamu jadi bisa mengabaikan update yang cocok dengan query tertentu:

```ts
// Abaikan semua pesan atau postingan channel yang berupa teks.
bot.drop(matchFilter(":text"));
```

Dengan analogi yang sama, kamu bisa menggunakan type filter query yang digunakan di internal grammY:

### Memanfaatkan Kembali Type Filter Query

Secara internal, `matchFilter` menggunakan [type predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) TypeScript untuk mengerucutkan type `ctx`.
Ia mengambil sebuah type `C extends Context` dan `Q extends FilterQuery` yang kemudian menghasilkan `ctx is Filter<C, Q>`.
Dengan kata lain, type `Filter` adalah hasil yang kamu terima untuk `ctx` di middleware.

Kamu bisa meng-import `Filter` secara langsung jika ingin menggunakannya di logika pemrogramanmu.
Sebagai contoh, kamu bisa mendefinisikan sebuah function handler untuk menangani object context tertentu yang sudah difilter oleh filter query:

```ts
function handler(ctx: Filter<Context, ":text">) {
  // Tangani object context yang sudah dikerucutkan
}

bot.on(":text", handler);
```

> Lihat referensi API untuk [`matchFilter`](/ref/core/matchfilter), [`Filter`](/ref/core/filter), dan [`FilterQuery`](/ref/core/filterquery).

## Bahasa Query

> Bagian ini ditujukan untuk kamu yang ingin memahami filter query grammY secara lebih dalam. Informasi berikut tidak berisi pengetahuan yang diperlukan untuk membuat sebuah bot.

### Struktur Query

Setiap query terdiri atas maksimal tiga komponen.
Kami memisahkan antara query L1, L2, dan L3, seperti `"message"`, `"message:entities"`, dan `"message:entities:url"`, secara berurutan tergantung dari seberapa banyak komponen yang dimiliki query.

Komponen-komponen query dipisahkan oleh titik dua (`:`).
Dari bagian awal hingga titik dua pertama atau string terakhir query tersebut, kami menyebutnya dengan _komponen L1_ query.
Dari titik dua pertama hingga titik dua kedua atau string terakhir query tersebut, kami menyebutnya dengan _komponen L2_ query.
Dari titik dua kedua hingga string terakhir query tersebut, kami menyebutnya dengan _komponen L3_ query.

Contoh:

| Filter Query                 | Komponen L1 | Komponen L2  | Komponen L3 |
| ---------------------------- | ----------- | ------------ | ----------- |
| `"message"`                  | `"message"` | `undefined`  | `undefined` |
| `"message:entities"`         | `"message"` | `"entities"` | `undefined` |
| `"message:entities:mention"` | `"message"` | `"entities"` | `"mention"` |

### Validasi Query

Meski type system bisa menangkap semua filter query yang tidak valid di compile time, namun grammY tetap memeriksa semua filter query di runtime selama proses penyusunan.
Setiap filter query akan dicocokkan dengan struktur validasi untuk diperiksa apakah query tersebut memang valid.
Dengan begitu, ia akan langsung gagal saat itu juga---alih-alih gagal di runtime---ketika hasilnya tidak valid, karena pernah terjadi sebelumnya, ketika bug di TypeScript menyebabkan masalah serius terhadap _type inference system_ lanjutan yang menjadi penyokong filter query.
Jika suatu saat bug tersebut muncul, kita bisa mencegah masalah serupa terjadi lagi.
Selain itu, kamu juga akan diberikan pesan error yang lebih bermanfaat.

### Performa

**grammY mampu memeriksa setiap filter query dalam waktu konstan (amortized) per update**, tidak terikat oleh struktur query ataupun update yang masuk.

Validasi filter query hanya dilakukan sekali, ketika bot diinisialisasi dan `bot.on()` dipanggil.

Ketika dimulai, grammY menurunkan _function predicate_ dari filter query dengan cara memecahnya menjadi beberapa komponen query.
Setiap komponen akan dipetakan ke sebuah function untuk diperiksa apakah properti objek tersebut cocok dengan filter terkait, atau bahkan dua kali pemeriksaan jika terdapat komponen yang dihilangkan sehingga dua nilai perlu diperiksa (misalnya, shortcut `:text` akan dijabarkan menjadi `["message:text", "channel_post:text"]` sehingga perlu dilakukan dua kali pemeriksaan).
Function-function ini kemudian disatukan untuk membentuk sebuah predicate yang akan memeriksa sebanyak mungkin value yang relevan untuk query, tanpa melakukan proses perulangan terhadap key object `Update`.

Sistem ini menggunakan lebih sedikit operasi dibandingkan dengan beberapa library lainnya, dimana dibutuhkan beberapa pengecekan array ketika melakukan routing update.
Ini membuat sistem filter query grammY selain lebih unggul juga jauh lebih cepat.

### Type Safety

Sebagaimana yang disebutkan di atas, filter query secara otomatis menyeleksi properti tertentu di objek context.
Penyeleksian satu atau lebih filter query tersebut berasal dari [type predicate TypeScript](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates).
Umumnya, kamu bisa mempercayai hasil penyeleksian tersebut benar-benar terseleksi dengan baik.
Contohnya, jika suatu property tersedia, kamu dapat menggunakan type tersebut dengan aman.
Namun, jika suatu property tidak tersedia, berarti ada proses tertentu yang mengakibatkan type property tersebut tidak terseleksi.
Kami tidak menyarankan untuk mengakalinya dengan melakukan type casting menggunakan operator `!`.

> Meski terlihat jelas, dalam kasus tertentu, mungkin kamu tidak menemukan penyebab suatu property tidak terseleksi dengan benar.
> Jangan ragu untuk bertanya di [obrolan grup](https://t.me/grammyjs) jika kamu masih belum menemukan penyebabnya.

Mengelola berbagai macam type berikut bukanlah perkara mudah.
Banyak sekali pengetahuan tentang API Bot yang masuk pada bagian grammY ini.
Apabila kamu ingin memahami lebih dalam bagaimana type ini dibuat, berikut pembahasan lengkapnya yang bisa kamu [tonton di YouTube](https://youtu.be/ZvT_xexjnMk).
