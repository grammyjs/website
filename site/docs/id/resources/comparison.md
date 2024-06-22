---
next: false
---

# Bagaimana jika grammY Dibandingkan dengan Framework Bot Lainnya?

grammY dibuat dari nol untuk memperoleh performa yang optimal serta mudah untuk dikelola.
Selain itu, kami juga menggunakan beberapa konsep yang umum digunakan di beberapa framework bot---dan framework web---lain.

> Harap diperhatikan bahwa perbandingan berikut mungkin bersifat bias, meskipun kami sudah berupaya sebaik mungkin untuk memberikan deskripsi secara objektif.
> Kami selalu berupaya untuk menjaga artikel ini agar selalu up-to-date.
> Jika kamu menemukan informasi di halaman ini telah usang, silahkan edit menggunakan link yang tersedia di bawah halaman.

## Perbandingan dengan Framework JavaScript Lainnya

::: tip Pilih Bahasa Pemrograman Terlebih Dahulu
Karena kamu sedang membaca dokumentasi framework yang menggunakan ekosistem JavaScript, kemungkinan besar kamu mencari sesuatu yang dapat berjalan di Node.js atau Deno.
Tetapi, jika tebakan kami salah, silahkan [gulir ke bawah](#perbandingan-dengan-framework-bahasa-pemrograman-lainnya) untuk melihat perbandingan bahasa pemrograman yang cocok untuk mengembangkan sebuah bot.
Di dalamnya, kami juga membahas framework dengan bahasa pemrograman lain (khususnya Python).
:::

Ada dua proyek utama yang menjadi inspirasi grammY, yaitu [Telegraf](https://github.com/telegraf/telegraf) dan [NTBA](https://github.com/yagop/node-telegram-bot-api).
Untuk saat ini, kita hanya akan fokus pada kedua framework tersebut.
Meski begitu, kami (atau bahkan kamu?) mungkin suatu saat akan menambah daftar perbandingan lainnya.

### Telegraf

Telegraf merupakan asal mula terbentuknya grammY.
Berikut kisah bagaimana framework ini bisa memiliki hubungan secara historis dengan grammY.

Ketika grammY dibuat, Telegraf adalah library yang luar biasa, dan grammY mungkin tidak akan ada tanpanya.
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
Type safety menyediakan fitur-fitur lanjutan yang secara fundamental mengubah cara pandang kita dalam mengembangkan sebuah bot, contohnya [transformer API](../advanced/transformers).

Meski Telegraf 3 digunakan oleh sekian banyak bot aktif, library tersebut belum saja diperbarui.
Selain itu, ekosistem pluginnya juga telah berpindah ke Telegraf 4 (selain yang tidak dimigrasikan ke grammY).

Perbandingan ini hanya membandingkan grammY dengan Telegraf 4.

Berikut beberapa alasan mengapa kamu lebih baik menggunakan grammY alih-alih Telegraf:

- grammY selalu mendukung versi terbaru API Bot.
  Sebaliknya, Telegraf seringkali tertinggal beberapa versi.
- grammY memiliki [sebuah dokumentasi](../).
  Telegraf tidak memilikinya---dokumentasinya diganti dengan sebuah referensi API yang kurang penjelasannya, beberapa panduan yang ada tidaklah lengkap dan sulit ditemukan;
- grammY menggunakan TypeScript, type yang tersedia _berfungsi dengan baik_ dan akan menyesuaikan diri dengan coding-an kamu.
  Di Telegraf kamu akan sering menulis kode dengan cara tertentu, yang jika tidak dilakukan, ia tidak akan bisa di-compile (meskipun tidak ada yang salah di kode kamu).
- grammY menambahkan beberapa petunjuk atau keterangan dari [referensi API Bot resmi](https://core.telegram.org/bots/api) yang akan membantu kamu ketika menulis kode.
  Telegraf sama sekali tidak menyediakan penjelasan di kode kamu.
- Banyak hal lain seperti performa yang lebih baik, ekosistem plugin yang luas, dokumentasi yang telah diterjemahkan ke miliaran orang, integrasi dengan database dan framework web yang lebih baik, kompatibilitas runtime yang lebih baik, tersedianya [ekstensi VS Code](https://marketplace.visualstudio.com/items?itemName=grammyjs.grammyjs) dan beberapa hal lainnya yang nanti akan kamu temukan seiring berjalannya waktu.

Berikut beberapa alasan mengapa kamu lebih baik menggunakan Telegraf alih-alih grammY.

- Kamu telah mempunyai bot besar yang telah ditulis menggunakan Telegraf dan tidak ingin mengerjakannya lagi.
  Dalam kasus tersebut, migrasi ke grammY akan memakan waktu yang lebih lama daripada hasil yang diperoleh, selancar apapun migrasinya.
- Kamu paham betul seluk beluk Telegraf dan tidak ingin untuk mengubah keahlianmu.
  grammY memperkenalkan beberapa konsep baru yang mungkin asing bagi kamu yang hanya menggunakan Telegraf, dan menggunakan grammY berarti kamu akan dihadapkan pada hal-hal baru.
- Ada sedikit perbedaan ketika menggunakan sintaks pada Telegraf dan grammY untuk mencapai hasil yang sama, dan kamu mungkin lebih menyukai gaya tersebut dibanding gaya lainnya.
  Misalnya, untuk menyimak pesan teks, Telegraf menggunakan `bot.on(message("text"))`, sedangkan grammY menggunakan `bot.on("message:text")`.

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

Saat ini tidak ada library TypeScript yang layak untuk membuat bot.
Semuanya kecuali grammY, Telegraf dan NTBA sebagian besar tidak terawat dan usang.

Apakah kamu telah membuat library menakjubkan yang kami tidak tahu library tersebut ada?
Silahkan ubah halaman ini dan tambahkan perbandingannya---atau kamu juga bisa menyampaikan pendapatmu di [chat grup grammY](https://t.me/grammyjs)!

## Perbandingan dengan Framework Bahasa Pemrograman Lainnya

Ada berbagai alasan untuk memilih menggunakan bahasa pemrograman selain TypeScript.
Yang terpenting adalah kamu nyaman bekerja dengan tool dan bahasa pemrograman yang kamu pilih.
Jika kamu sudah yakin untuk tetap menggunakan bahasa pemrograman lain, maka kamu bisa berhenti membaca mulai dari sini.

Hmm... karena kamu masih melanjutkan membaca bagian ini, kamu mungkin tertarik untuk mengetahui alasan kenapa grammY ditulis menggunakan TypeScript, dan kenapa kamu sebaiknya memilih bahasa pemrograman ini untuk digunakan di bot kamu juga.

Kali ini kita akan membahas kelebihan apa yang TypeScript tawarkan dibandingkan dengan bahasa pemrograman lainnya ketika ia digunakan untuk mengembangkan sebuah bot Telegram.
Perbandingan ini hanya terbatas pada Python, Go dan Rust saja.
Silahkan tambahkan penjelasan lainnya jika kamu ingin membandingkan TypeScript dengan bahasa lain.

Poin-poin berikut sebagian merupakan pendapat pribadi alih-alih pendapat objektif.
Karena beberapa orang memiliki selera yang berbeda, maka informasi-informasi ini jangan diterima secara mentah-mentah.

### Framework yang ditulis menggunakan Python

Kontras yang jelas terlihat ketika membandingkan TypeScript dengan Python.
Gunakan TypeScript dan kamu akan menikmatinya:

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
   Sekarang, V8 dan kompetitornya menjadikan JavaScript sebuah bahasa script tercepat di dunia.
   Jika kamu menginginkan bot bekerja secepat mungkin sambil menikmati bahasa pemrograman yang dinamis, grammY adalah pilihan yang tepat.

Seperti biasa, suatu bahasa pemrograman memiliki kelebihan di bidang tertentu dan kelemahan di bidang lainnya.
Tidak ada pengecualian disini.

Sebagai contoh untuk kondisi ekosistem saat ini, hal-hal yang berkaitan dengan machine learning sebaiknya tidak dilakukan dengan JavaScript.
Namun, ketika berurusan dengan web server, TypeScript cenderung menjadi pilihan yang lebih baik.

### Framework yang Ditulis Menggunakan Go

Jika kamu mahir menggunakan TypeScript dan Go, maka akan ada alasan yang kuat untuk menentukan bahasa yang akan digunakan dengan mempertimbangkan kecepatan pengembangan dan eksekusi.

Pilih grammY jika kamu tidak terlalu yakin bot seperti apa yang akan kamu buat.
TypeScript memungkinkanmu mengulangi basis kode dengan kecepatan luar biasa.
Ia bagus untuk membuat prototipe dengan cepat, mencoba hal-hal baru, mengenal lebih tentang bot dan menyelesaikan kode dengan cepat. Sebagai aturan praktis, memproses ~100.000.000 pembaruan setiap hari dapat dilakukan dengan mudah menggunakan TypeScript, lebih dari itu akan memerlukan kerja tambahan, seperti menggunakan satu plugin grammY lagi.

Pilih library yang ditulis dalam Go jika kamu sudah tahu dan sudah jelas apa yang ingin kamu buat (tidak berharap membutuhkan banyak bantuan) dan tahu kalau bot kamu akan memproses banyak hal.
Sebagai bahasa yang di-compile secara native, Go lebih unggul dari TypeScript beberapa kali lipat dalam kecepatan pemrosesan CPU.
Keunggulan tersebut menjadi lebih relevan ketika kecepatan penguraian JSON menjadi hal yang krusial dan prioritas
Go bisa menjadi pilihan yang lebih baik dalam kasus ini.

### Framework yang Ditulis Menggunakan Rust

[Sama dengan Go](#framework-yang-ditulis-menggunakan-go), tetapi Rust lebih unggul.
Kamu akan memerlukan lebih banyak waktu menulis menggunakan Rust, namun bot kamu juga akan lebih cepat tentunya.

Meski menggunakan Rust itu menyenangkan, namun membangun bot menggunakan Rust terlalu berlebihan.
Jika kamu ingin menggunakannya, maka gunakanlah, tetapi jika kamu menyukai Rust hanya karena bahasanya, mungkin Rust bukanlah alat yang tepat untuk pekerjaan tersebut.

## Saya Tidak Setuju dengan Perbandingan Ini

Jika kamu merasa ada yang salah dengan informasi yang disajikan di halaman ini, jangan khawatir!
Tolong beritahu kami di [chat group Telegram](https://t.me/grammyjs)!
Kami dengan senang hati akan mendengar dan mempertimbangkan pendapat kamu.
Kamu juga bisa mengubah halaman ini di GitHub, atau membuat sebuah issue untuk menunjukkan letak kesalahannya ataupun untuk memberi saran kepada kami.
Kami selalu berupaya untuk memberikan perbandingan yang adil serta objektif.
