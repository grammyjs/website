---
prev: ../guide/
next: ./getting-started.md
---

# Pengenalan

Bot Telegram adalah sebuah akun khusus yang dijalankan secara otomatis oleh sebuah program.
Siapa saja bisa membuat bot Telegram, asalkan ia menguasai _coding_ meskipun cuma sedikit.

> Kalau sudah tahu cara membuat bot, lompat ke materi [Memulai](./getting-started.md)!

Sedangkan grammY adalah sebuah _library_ untuk mempermudah pembuatan sebuah bot.

## Cara Menulis Sebuah Bot

Sebelum mulai membuat bot, kamu harus paham apa yang dapat dan tidak dapat dilakukan oleh bot Telegram.
Lihat materi [Pengantar untuk Developer](https://core.telegram.org/bots) yang dibuat oleh tim Telegram.

Untuk membuat bot Telegram, kamu harus membuat kode di dalam sebuah file teks, yang biasa disebut dengan _source code_.
Source code menjelaskan _apa yang harus dikerjakan oleh bot_, misalnya "Ketika pengguna mengirim pesan ini, tanggapi dengan pesan itu", dan sebagainya.

Kalau sudah jadi, kita tinggal menjalankan source code tersebut.
Bot akan berjalan hingga kamu menyuruhnya berhenti.

Beres!
Sekarang bot sudah selesai dibuat…

## Cara Membuat Bot Tetap Berjalan

…kecuali, kalau kamu benar-benar serius dengan proyek bot kamu.
Meski bot sekarang sudah bisa berjalan, namun saat kamu menghentikan bot-nya (atau mematikan komputer), bot menjadi tidak responsif, sehingga pesan yang masuk tidak akan diproses.

> Lewati bagian ini jika kamu cuma ingin bermain-main dengan bot, langsung lompat ke [Persiapan untuk Memulai](#persiapan-untuk-memulai).

Sederhananya, jika ingin bot tetap aktif sepanjang waktu, kamu harus terus menjalankan komputer selama 24 jam setiap hari.
Karena kemungkinan besar kamu tidak ingin melakukannya dengan komputer kesayanganmu, kamu harus mengunggah source code bot ke sebuah _penyedia hosting_—dengan kata lain, menggunakan komputer milik orang lain, yang juga dikenal sebagai _server_—dan biarkan orang tersebut yang menjalankannya untukmu.

Ada banyak penyedia layanan di luar sana yang mengizinkan kamu untuk menjalankan bot Telegram secara gratis.
Dokumentasi ini juga sudah menyediakan daftar beberapa penyedia hosting yang kami tahu bekerja dengan baik dengan grammY (lihat bab Sumber Daya).
Namun, pada akhirnya, keputusan ada pada diri kamu untuk memilih penyedia layanan yang sesuai.
Perlu diingat bahwa disaat kamu menjalankan kode di tempat lain, berarti siapa pun yang menguasai "tempat" tersebut memiliki akses ke semua pesan dan data penggunamu. Jadi, kamu harus bijak dalam memilih penyedia hosting yang dapat dipercaya.

Berikut ini adalah diagram (yang disederhanakan) bagaimana alur yang terjadi ketika pengguna—sebut saja namanya Budi—mengakses bot kamu:

```asciiart:no-line-numbers
________        mengirim         ____________                     ____________
| Budi | —>  pesan Telegram  —> |  Telegram  | —> HTTP request —> | bot kamu |
————————       ke bot kamu       ————————————                     ————————————

 ponsel                         server Telegram                   komputer kamu,
                                                          lebih baik lagi: sebuah server

|____________________________________________|                    |___________|
                    |                                                   |
           tanggung jawab Telegram                              tanggung jawab kamu
```

Demikian pula sebaliknya, bot kamu juga dapat mengirim HTTP request ke server Telegram untuk mengirim pesan balasan ke Budi.
Kalau belum pernah mendengar tentang HTTP, untuk sementara, kamu bisa menganggapnya sebagai sebuah paket data yang dikirim melalui internet.

## Apa yang grammY Berikan untuk Kamu

Bot berinteraksi dengan Telegram melalui HTTP request.
Setiap kali bot mengirim atau menerima pesan, HTTP request akan keluar-masuk antara server Telegram dan server/komputer kamu.

grammY melakukan semua komunikasi ini untuk kamu, sehingga cukup dengan mengetik `sendMessage` di source code, pesan akan langsung terkirim.
Selain itu, ada berbagai hal lain yang dilakukan grammY untuk mempermudah pembuatan bot.
Kamu akan mengetahuinya nanti seiring membaca dokumentasi-dokumentasi ini.

## Persiapan untuk Memulai

> Lewati sisa halaman ini jika sudah tahu cara mengembangkan aplikasi Deno atau Node.js.
> Lompat ke [materi selanjutnya](./getting-started.md).

Ada satu hal yang menarik di dalam dunia pemrograman—hal-hal penting yang dianggap sepele dalam menulis kode sangat jarang dibahas, karena sebagian besar developer sering kali berpikir bahwa hal itu sudah sangat jelas. Sehingga, mereka merasa sudah tak perlu menjelaskannya lagi karena mengira semua orang juga sudah pasti paham.

Pada bagian selanjutnya, kamu akan membuat kode program dalam bahasa pemrograman [TypeScript](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html).
Dokumentasi grammY tidak akan mengajarimu bagaimana cara membuat suatu program dari dasar.
Jadi, kami mengharapkan kamu untuk belajar sendiri.
Paling tidak, dengan membuat bot Telegram menggunakan grammY adalah awal yang baik untuk mulai belajar pemrograman! :rocket:

::: tip Belajar Menulis Kode
Kamu bisa mulai belajar TypeScript melalui [tutorial resmi](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html) yang ditulis oleh tim TypeScript, lalu kembali ke sini jika sudah selesai.
Jangan habiskan lebih dari 30 menit untuk melakukan hal-hal lain di internet—lihat koleksi foto kucing misalnya :cat:. Langsung kembali ke sini, selesaikan materi ini, kemudian kita bisa [memulai](./getting-started.md).

Jika menemukan syntax yang tidak kamu ketahui, atau mendapatkan pesan error yang tidak dimengerti, langsung saja cari di internet. Penjelasan serta solusinya sudah pasti tersedia di sana, misal di StackOverflow.
:::

::: danger Tidak Usah Belajar Menulis Kode
Luangkan waktumu sebentar untuk menonton [video 34 detik ini](https://youtu.be/8RtGlWmXGhA).
:::

Dengan memilih grammY, kamu telah menggunakan sebuah bahasa pemrograman, yaitu TypeScript.
Tapi, apa yang selanjutnya dilakukan setelah membuat kode TypeScript, bagaimana cara menjalankan kode tersebut?
Untuk itu, kamu perlu memasang beberapa software yang dapat _mengeksekusi_ kode tersebut.
Jenis software ini disebut dengan _runtime environment_.
Ia akan membaca file source code kamu kemudian mengerjakan apa pun yang diprogramkan di dalamnya.

Terdapat dua runtime environment yang bisa kita pilih: [Deno](https://deno.land) dan [Node.js](https://nodejs.org).
Jika kamu menjumpai orang-orang menyebut Node.js dengan sebutan _Node_ saja, mereka terlalu malas untuk menambahkan imbuhan ".js", meskipun maksudnya sama saja.

> Mulai dari sini, kami akan membantu kamu memilih diantara kedua platform tersebut.
> Kalau sudah tahu mana yang ingin digunakan, silahkan lompat ke [persiapan untuk Node.js](#persiapan-untuk-node-js) atau [persiapan untuk Deno](#persiapan-untuk-deno).

Node.js adalah teknologi yang lebih stabil dan sudah lama dikembangkan.
Oleh karena itu, tidak heran jika Node.js mampu mengerjakan hal-hal yang rumit, misalnya menghubungkan database yang tidak umum digunakan ataupun melakukan sesuatu yang berkaitan dengan _low-level system_.
Sebaliknya, Deno masih relatif baru, jadi terkadang masih belum mendukung untuk keperluan tingkat lanjut semacam itu.
Saat ini, kebanyakan server masih menggunakan Node.js.

Di sisi lain, Deno secara signifikan lebih mudah dipelajari dan digunakan.
Kalau kamu belum memiliki banyak pengalaman di dunia pemrograman, **memulai dengan Deno merupakan pilihan yang tepat**.

Malahan, jika sebelumnya pernah menulis kode menggunakan Node.js, kamu patut mempertimbangkan untuk mencoba Deno.
Banyak hal rumit yang ada di Node.js sudah tidak perlu dipikirkan lagi di Deno.
Berikut kelebihan Deno dibandingkan dengan Node.js:

- Proses penginstalan sangat mudah.
- Tidak perlu mengatur konfigurasi apapun.
- Menggunakan kapasitas penyimpanan yang jauh lebih sedikit.
- Memiliki _development tool_ bawaan yang lebih unggul serta integrasi code editor yang lebih baik.
- Sistem keamanan yang jauh lebih aman.
- Dan kelebihan-kelebihan lain yang tidak bisa diuraikan di sini.

Menulis kode dengan Deno juga jauh lebih menyenangkan.
Setidaknya, itulah pendapat kami.

Namun, jika kamu memiliki alasan yang kuat untuk tetap menggunakan Node.js, misalnya karena sudah menguasainya dengan baik, maka itu tidak masalah!
Kami memastikan bahwa grammY berfungsi sama baiknya di kedua platform tanpa mengorbankan satu sama lain.
Silakan pilih mana yang menurut kamu paling sesuai.

### Persiapan untuk Deno

Sebelum mulai membuat bot, mari terlebih dahulu menyiapkan lingkungan kerja pengembangan software yang sesuai.
Diantaranya adalah menginstal beberapa tool yang dibutuhkan.

#### Menyiapkan Perangkat untuk Pengembangan

Pertama-tama, [instal Deno](https://deno.land/manual/getting_started/installation#download-and-install) di perangkat kamu.

Siapkan juga text editor yang sesuai untuk coding.
Salah satu yang sesuai untuk Deno adalah Visual Studio Code, atau biasa disebut dengan VS Code.
Silahkan [diinstal](https://code.visualstudio.com/) juga.

Selanjutnya, kamu perlu menghubungkan Deno dan VS Code.
Caranya sangat mudah: VS Code punya extension yang bisa melakukan semua hal tersebut secara otomatis.
Kamu bisa menginstalnya seperti yang telah [dijelaskan di sini](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno).

Perangkat kamu sekarang siap digunakan untuk mengembangkan bot! :tada:

#### Mengembangkan Bot

Buat sebuah direktori baru di suatu tempat.
Direktori ini nantinya akan berisi proyek bot kamu.
Setelah itu, buka direktori tersebut di VS Code.

```sh
mkdir ./my-bot
cd ./my-bot
code .
```

> Jika kamu menggunakan macOS dan command `code` tidak tersedia, cukup buka VS Code, tekan `Ctrl+Shift+P`, ketik "shell command", kemudian tekan Enter.

Di VS Code, ubah direktori kosong tersebut menjadi sebuah proyek Deno.
Tekan `Ctrl+Shift+P`, ketik "deno init", kemudian tekan Enter.
Jika berhasil, versi Deno yang terinstal di perangkat kamu akan ditampikan di bagian bawah kanan code editor.

Lingkungan kerja untuk pengembangan Deno kamu sudah siap.
Sekarang kamu bisa mulai menulis bot kamu.
Penjelasannya ada di halaman berikutnya.

Terakhir, setelah membuat bot, misalnya ditaruh di sebuah file bernama `bot.ts`, kamu bisa menjalankannya dengan mengetik `deno run --allow-net bot.ts` di terminal kamu---Yup, kamu akan sering berinteraksi dengan terminal ketika menulis sebuah program, jadi mulai sekarang biasakan dirimu.
Kamu bisa menghentikan bot dengan menekan `Ctrl+C`.

Sudah siap?
[Mari kita mulai!](./getting-started.md#memulai-dengan-deno) :robot:

### Persiapan untuk Node.js

Berbeda dengan Deno, TypeScript di Node.js tidak bisa dijalankan secara langsung.
File TypeScript perlu di-compile terlebih dahulu supaya menghasilkan file JavaScript (misalnya dari file `bot.ts`, setelah di-compile akan menjadi `bot.js`).
Nah, file JavaScript inilah yang akan dijalankan oleh Node.js.

Baris perintah untuk melakukan proses compile tersebut, akan dibahas pada materi selanjutnya ketika kamu sudah selesai membuat bot.
Yang penting, kamu sekarang sudah tahu kalau TypeScript di Node.js perlu di-compile terlebih dahulu agar bisa digunakan.

Untuk menjalankan file `bot.js`, kamu harus meng-install [Node.js](https://nodejs.org/en/).

Berikut tahap-tahap yang perlu dilakukan di Node.js:

1. Buat source file `bot.ts` menggunakan TypeScript, misalnya dengan menggunakan [VSCode](https://code.visualstudio.com/) (atau kode editor lainnya).
2. Compile kode dengan menjalankan perintah di terminal. Langkah ini akan menghasilkan file bernama `bot.js`.
3. Jalankan `bot.js` menggunakan Node.js, sekali lagi dari terminal.

Setiap kali melakukan perubahan kode di `bot.ts`, kamu perlu memulai ulang proses Node.js.
Tekan `Ctrl+C` di terminal untuk menghentikan proses tersebut, yang nantinya juga akan menghentikan bot kamu.
Kemudian, ulangi langkah 2 dan 3.

Sudah siap?
[Mari kita mulai!](./getting-started.md#memulai-dengan-node-js) :robot:
