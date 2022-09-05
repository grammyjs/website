# Bagaimana jika grammY Dibandingkan dengan Framework Bot Lainnya?

grammY dibuat dari nol untuk memperoleh performa yang optimal serta mudah untuk dikelola.
Selain itu, kami juga menggunakan beberapa konsep yang umum digunakan di beberapa framework bot---dan framework web---lain.
Artinya, beberapa pengguna yang sudah pernah menggunakan framework lain mungkin akan merasa familiar ketika menggunakan grammY.

> Harap diperhatikan bahwa perbandingan berikut mungkin bersifat bias, meskipun kami sudah berupaya sebaik mungkin untuk memberikan deskripsi secara objektif.
> Kami selalu berupaya untuk menjaga artikel ini agar selalu up-to-date.
> Jika kamu menemukan informasi di halaman ini telah usang, silahkan edit menggunakan link yang tersedia di bawah halaman.

## Perbandingan dengan Framework JavaScript Lainnya

::: tip Pilih Bahasa Pemrograman Terlebih Dahulu
Karena kamu sedang membaca dokumentasi framework yang menggunakan ekosistem JavaScript, kemungkinan besar kamu mencari sesuatu yang dapat berjalan di Node.js (atau Deno).
Tetapi, jika tebakan kami salah, silahkan [gulir ke bawah](#perbandingan-dengan-framework-bahasa-pemrograman-lainnya) untuk melihat perbandingan bahasa pemrograman yang cocok untuk mengembangkan sebuah bot.
Di dalamnya, kami juga membahas framework dengan bahasa pemrograman lain (khususnya Python).
:::

Ada dua proyek utama yang menjadi inspirasi grammY, yaitu [Telegraf](https://github.com/telegraf/telegraf) dan [NTBA](https://github.com/yagop/node-telegram-bot-api).
Untuk saat ini, kita hanya akan fokus pada kedua framework tersebut.
Meski begitu, kami (atau bahkan kamu?) mungkin suatu saat akan menambah daftar perbandingan lainnya.

### Telegraf

Telegraf merupakan asal mula terbentuknya grammY.
Berikut kisah bagaimana framework ini bisa memiliki hubungan secara historis dengan grammY.

#### Sejarah Singkat

Telegraf adalah library yang menakjubkan, dan grammY tidak akan lahir tanpanya.
Dulunya, Telegraf ditulis menggunakan JavaScript (di v3).
Sayangnya, rare type annotation ditambahkan secara manual serta tidak dikelola dengan baik, sehingga ia menjadi tidak lengkap, terjadi banyak kesalahan, dan tidak up-to-date.
Strong type annotation adalah komponen yang krusial bagi sebuah library untuk men-support tool yang mereka gunakan, selain itu ia mampu berjalan dengan lebih cepat di code base kamu.
Kebanyakan orang lebih memilih untuk memiliki type safety ketika mengembangkan sebuah bot yang kompleks, dan itu adalah salah satu bahan pertimbangan yang cukup berpengaruh untuk sebagian orang.

Telegraf v4 mencoba mengatasi permasalah tersebut dengan cara melakukan migrasi seluruh code base ke TypeScript.
Sayangnya, banyak type yang dihasilkan begitu kompleks sehingga mereka sulit untuk dipelajari.
Selain itu, migrasi yang dilakukan memunculkan banyak permasalahan yang tidak terduga ([contoh](https://github.com/telegraf/telegraf/issues/1076)) di code base mereka, yang membuatnya semakin sulit untuk digunakan.

Hasilnya, meskipun versi 4.0 mencoba untuk melakukan _peningkatan_ terhadap support tool dan menyelesaikan beberapa permasalahan lainnya, nyatanya Telegraf secara keseluruhan menjadi _sulit untuk digunakan_ dibandingkan dengan pendahulunya.
Wajar jika banyak user yang menggunakan Telegraf 3 tidak ingin melakukan upgrade.
Selain itu, ia juga membuat user baru kesulitan untuk memulai.

**grammY mencoba mengambil langkah dengan membuat sebuah framework bot yang mendukung type-safe, tetapi bisa digunakan dengan mudah**.
Dengan begitu, kita bisa terhindar dari diskusi panas mengenai permasalahan typing internal yang aneh tadi.
Ia juga harus bisa menghasilkan sebuah proyek yang rapi, konsisten, serta compile code yang menyediakan user sebuah type yang sempurna (=support code editor yang lebih baik).
Type safety menyediakan fitur-fitur lanjutan yang secara fundamental mengubah cara pandang kita dalam mengembangkan sebuah bot, contohnya [transformer API](../advanced//transformers.md).

Sekarang, Telegraf 3 sudah usang.
Di luar sana terdapat beberapa fork yang mencoba untuk mengelola code base lama tersebut agar selalu up-to-date dengan API Bot Telegram yang terus berkembang, tetapi kompatibilitasnya masih perlu dipertanyakan.
Terlebih lagi, ekosistem plugin Telegraf telah dipindahkan ke Telegraf 4.
Banyak developer plugin tidak mau mengelola plugin untuk fork Telegraf dari pihak ketiga yang menggunakan versi usang.

Dikarenakan pengembangan Telegraf terhenti diantara versi 3 dan 4, maka kita akan membandingkan grammY dengan kedua versi tersebut secara terpisah.

#### Dibandingkan dengan v3

Karena memiliki sejarah yang serupa, grammY dan Telegraf memiliki banyak kesamaan.
Mereka berdua menggunakan sebuah [sistem middleware](../guide/middleware.md) sebagai dasarnya.
Syntax-syntax dasar yang digunakan juga tidak terlalu berbeda:

```ts
// Dapat bekerja dengan baik di grammY maupun di Telegraf.
bot.on("message", (ctx) => ctx.reply("Halo!"));
```

Semua kode yang ditulis di Telegraf akan bekerja sama baiknya di grammY dengan beberapa perubahan kecil.
(Perlu dicatat bahwa ini tidak berlaku untuk sebaliknya karena banyak fitur di grammY tidak tersedia untuk user Telegraf.)

Kelebihan utama grammY dibandingkan dengan Telegraf 3.x adalah **secara substansial, grammY memiliki dukungan tool yang lebih baik**.
Telegraf 3 ditulis menggunakan JavaScript.
Oleh karena itu, type yang disertakan tidak lengkap dan memiliki banyak kesalahan.
Selain itu, type API Bot yang digunakan telah usang sejak beberapa tahun yang lalu.
Akibatnya, dukungan auto-complete atau spell-checking untuk kode bot tidak dapat diandalkan, sehingga kamu perlu menjalankan bot terlebih dahulu untuk mengetahui apakah kode bekerja dengan baik atau tidak.

Sebaliknya, grammY sepenuhnya ditulis menggunakan TypeScript.
Kelebihannya, code editor (misalnya VSCode) dapat menganalisa kode kamu untuk memberikan saran ketika kamu mengetik sesuatu.
Terlebih lagi, ia mampu menampilkan secara lengkap inline API Bot Telegram—dokumentasi dari website akan ditampilkan secara langsung ketika meng-hover nama atau elemen kode menggunakan kursor mouse.

Kelebihan utama lainnya adalah sekarang kamu bisa **menulis bot menggunakan TypeScript**.
Sebelumnya, ini adalah pekerjaan yang tidak mudah dilakukan karena type annotation milik Telegraf tidak dapat meng-compile kode, meski tidak ada error di dalamnya.
Akibatnya, beberapa user diharuskan menonaktifkan pengecekan kode ketika menggunakan Telegraf.
Padahal, type-safe adalah salah satu fitur unggulan untuk semua jenis code base.

grammY dan Telegraf memiliki perbedaan code base.
Karena sudah menggunakan kode terbaru, grammY sekarang mampu memodifikasi sistem middleware untuk beberapa penggunaan menarik lainnya, seperti [filter query](../guide/filter-queries.md), [error boundary](../guide/errors.md#error-boundary), [transformer API](../advanced/transformers.md), dan lain sebagainya.
Ini juga membuka kemungkinan untuk mengembangkan plugin-plugin bermanfaat yang sebelumnya tidak mungkin dilakukan di Telegraf.

Kelebihan utama Telegraf dibandingkan grammY adalah **ia lebih populer**.
Meskipun komunitas Telegraf terbagi menjadi dua versi (v3 dan v4), tetapi jumlah bot Telegram yang menggunakan Telegraf jauh lebih banyak dibandingkan dengan grammY.
Artinya, kamu akan lebih sering menemukan artikel Telegraf di internet dan tutorial khusus yang dibuat oleh coder lain, yang bisa kamu jadikan sebagai referensi tambahan jika dokumentasi resmi tidak mencukupi.

#### Dibandingkan dengan v4

Kelebihan utama grammY dibandingkan Telegraf 4.x adalah **ia lebih mudah digunakan**,
contohnya

- grammY memiliki [sebuah dokumentasi](../).
  Telegraf tidak memilikinya (dokumentasinya diganti dengan sebuah penjelasan referensi API yang tidak lengkap);
- Type di grammY _berfungsi dengan baik_ dan mereka akan menyesuaikan diri dengan coding-an kamu.
  Di Telegraf kamu akan sering menulis kode dengan cara tertentu, yang jika tidak dilakukan, ia tidak akan bisa di-compile (meskipun tidak ada yang salah di kodenya); dan
- grammY menambahkan beberapa petunjuk atau keterangan dari [referensi API Bot resmi](https://core.telegram.org/bots/api) yang akan membantu kamu ketika menulis kode.
  Telegraf sama sekali tidak menyediakan penjelasan di kode kamu.

#### Ringkasan

##### Kelebihan grammY

- Mudah digunakan dibandingkan dengan Telegraf 3 dan 4.
- Dukungan TypeScript yang memadai.
- Memiliki sebuah dokumentasi dan referensi API.
- Long polling jauh lebih cepat (dengan menggunakan grammY runner).
- Komunitas dan ekosistem yang solid.
- Lebih banyak plugin yang tersedia.
- Integrasi database dan web framework yang lebih baik.
- Pengembangan lebih aktif.
- Pesan error yang lebih berguna.
- Kemungkinan kecil mengalami race condition.
- Dirancang untuk melindungimu dari membuat kesalahan ketika menulis kode.
- Berjalan di Node.js, tetapi juga bisa berjalan di Deno dan browser.

##### Kelebihan Telegraf

- Lebih tua, berarti lebih berpengalaman.
- Lebih banyak contoh bot yang tersedia, baik di repository mereka maupun di tempat lain.

### NTBA

Package `node-telegram-bot-api` adalah proyek besar kedua yang berperan besar dalam pengembangan grammY.
Kelebihan utamanya dibandingkan dengan framework lain adalah ia benar-benar simpel.
Arsitekturnya bisa dideskripsikan hanya dengan satu kalimat, sementara grammY membutuhkan sebuah [panduan](../guide/) di dokumentasinya untuk melakukan hal yang sama.
Kami meyakini bahwa semua penjelasan di website grammY dapat membantu banyak orang untuk memulai dengan mudah, tetapi cukup menarik jika kita memiliki sebuah library yang tidak membutuhkan penjelasan sama sekali.

Kekurangannya, framework semacam ini tidak dapat digunakan untuk jangka waktu yang lama.
Ide untuk mengumpulkan semua kode di dalam satu file besar dan menggunakan sebuah object primitive `EventEmitter` untuk memproses stream suatu object yang kompleks (misalnya request web) adalah ide yang buruk di dunia bot Telegram.
Selain itu, ini juga mempersulit pengimplementasian beberapa ide berguna lainnya.

Bot selalu dimulai dari yang kecil, tetapi framework yang baik harus mampu menyediakan jalan untuk membuatnya tumbuh menjadi bot yang besar.
Sayangnya, NTBA benar-benar gagal di bidang tersebut.
Code base apapun yang menggunakan NTBA dan memiliki lebih dari 50 baris kode di dalamnya akan berakhir berantakan seperti mi goreng yang diaduk.
Kamu pasti tidak menginginkan itu terjadi---selain mi goreng itu sendiri tentunya.

### Framework Lainnya

Apakah kamu merasa framework favoritmu di beberapa aspek tertentu lebih baik dibandingkan dengan grammY?
Silahkan ubah halaman ini dan tambahkan perbandingannya—atau kamu juga bisa menyampaikan pendapatmu di [chat grup grammY](https://t.me/grammyjs)!

## Perbandingan dengan Framework Bahasa Pemrograman Lainnya

Ada berbagai alasan untuk memilih menggunakan bahasa pemrograman selain TypeScript.
Yang terpenting adalah kamu nyaman bekerja dengan tool dan bahasa pemrograman yang kamu pilih.
Jika kamu sudah yakin untuk tetap menggunakan bahasa pemrograman lain, maka kamu bisa berhenti membaca mulai dari sini.

Hmm... karena kamu masih melanjutkan membaca bagian ini, kamu mungkin tertarik untuk mengetahui alasan kenapa grammY ditulis menggunakan TypeScript, dan kenapa kamu sebaiknya memilih bahasa pemrograman ini untuk digunakan di bot kamu juga.

Kali ini kita akan membahas kelebihan apa yang TypeScript tawarkan dibandingkan dengan bahasa pemrograman lainnya ketika ia digunakan untuk mengembangkan sebuah bot Telegram.
Bahasa pemrograman lain yang sering digunakan untuk mengembangkan chat bot Telegram adalah Python, jadi untuk saat ini kita hanya akan membandingkan dengan Python.
Poin-poin berikut mungkin adalah pendapat pribadi alih-alih pendapat objektif.
Karena beberapa orang memiliki selera yang berbeda, maka informasi-informasi ini jangan diterima secara mentah-mentah.

1. **Tool editor yang lebih baik.**
   Type annotation milik grammY sangat istimewa.
   Meskipun Python sudah memperkenalkan type di versi 3.5, sayangnya ia masih belum banyak digunakan di ekosistemnya seperti JavaScript/TypeScript.
   Meski demikian, mereka tidak bisa dibandingkan dengan apa yang kamu peroleh di grammY dan di beberapa library penunjangnya.
   Contohnya type dengan fitur auto-complete di setiap tahap pengembangan, serta tooltip dengan link dan penjelasan yang berguna.

2. **Code base bisa diperluas dengan mudah.**
   Sebuah sistem type juga memiliki kelebihan lainnya, yaitu code base bot kamu jadi bisa diperluas.
   Langkah tersebut akan sulit dilakukan jika bahasa pemrograman yang digunakan tidak memiliki type-safety yang baik.

3. **Beban kerja bisa teratasi dengan baik.**
   Ketika suatu saat bot kamu menjadi semakin populer, ia akan lebih mudah untuk di-upgrade jika bot tersebut ditulis menggunakan JS dibandingkan dengan menggunakan Python.

4. **Bot merespon dengan lebih responsif.**
   V8 engine menjadikan JavaScript sebuah bahasa script tercepat di seluruh alam semesta.
   Jika kamu menginginkan bot bekerja secepat mungkin sambil menikmati bahasa pemrograman yang dinamis, grammY adalah pilihan yang tepat.

5. **Dukungan `async`/`await`.**
   Mengendalikan sebuah concurrency adalah hal yang populer di dalam dunia pemrograman.
   Tidak heran, selama bertahun-tahun pemrograman asynchronous mengalami kenaikan tren.
   PTB—framework bot terbesar untuk Python—[mengumumkan sedang melakukan migrasi](https://t.me/pythontelegrambotchannel/94) ke pemrograman asynchronous pada bulan Januari 2021, yang diharapkan akan rampung dalam waktu "2 tahun" ke depan.
   grammY sudah melakukannya dari awal.
   (Framework Python lain yang tidak terlalu populer mungkin sudah melakukan migrasi terlebih dahulu.
   Abaikan poin ini jika kamu menggunakan framework Python yang sudah mendukung `async`/`await`.)

## Saya Tidak Setuju dengan Perbandingan Ini

Jika kamu merasa ada yang salah dengan informasi yang disajikan di halaman ini, jangan khawatir!
Tolong beritahu kami di [chat group Telegram](https://t.me/grammyjs)!
Kami dengan senang hati akan mendengar dan mempertimbangkan pendapat kamu.
Kamu juga bisa mengubah halaman ini di GitHub, atau membuat sebuah issue untuk menunjukkan letak kesalahannya ataupun untuk memberi saran kepada kami.
Kami selalu berupaya untuk memberikan perbandingan yang adil serta objektif.
