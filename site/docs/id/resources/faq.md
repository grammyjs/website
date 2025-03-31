---
prev:
  text: Tentang grammY
  link: ./about
---

# FAQ

Berikut adalah kumpulan pertanyaan yang sering ditanyakan kepada kami.
Khusus untuk pertanyaan mengenai [permasalahan umum](#kenapa-saya-mengalami-error-ini) dan [seputar Deno](#pertanyaan-seputar-deno), kami mengelompokkannya menjadi dua bagian tersendiri.

Jika FAQ ini tidak menjawab pertanyaanmu, sebaiknya kamu juga membaca [FAQ Bot](https://core.telegram.org/bots/faq) yang ditulis oleh tim Telegram.

## Di Mana Saya Bisa Menemukan Dokumentasi Mengenai Method?

Di referensi API.
Kamu mungkin tertarik untuk memahami [hal-hal berikut](../guide/) terlebih dahulu.

## Ada Parameter yang Tidak Tersedia di Method Tertentu!

Tentu saja tidak.

1. Pastikan kamu sudah menginstal grammY versi terbaru.
2. Cek [di sini](https://core.telegram.org/bots/api) apakah parameter tersebut termasuk opsional.
   Jika iya, berarti grammY menaruh parameter tersebut di suatu options object bernama `other`.
   Kamu cuma perlu menulis `{ nama_parameter: value }` di options tersebut.
   Seperti biasa, TypeScript akan membantu kamu melengkapi nama parameter-nya secara otomatis.
3. Cek ulang method signature untuk [aksi-aksi](../guide/context#aksi-yang-tersedia) yang ada di `ctx` [di sini](/ref/core/context#methods), serta method API-nya (`ctx.api`, `bot.api`) [di sini](/ref/core/api#methods).

## Bagaimana Cara Mengakses Riwayat Chat?

Tidak bisa.

Telegram tidak menyimpan pesan untuk bot.

Namun, kamu bisa mengatasinya dengan cara menunggu pesan atau postingan baru tiba lalu menyimpannya ke database.
Dengan begitu, kamu bisa memuat riwayat chat dari database-mu sendiri.

Cara yang sama juga digunakan oleh [plugin percakapan (conversations)](../plugins/conversations) untuk menyimpan riwayat pesan terkait.

## Bagaimana Cara Menangani Album?

Tidak bisa ... setidaknya tidak seperti yang kamu bayangkan.

Album --- _yang mana merupakan bagian dari kelompok media (media group)_ --- sebenarnya berasal dari tampilan UI aplikasi Telegram.
Di sisi lain, bot menangani kelompok media sebagai runtutan pesan, alih-alih sebagai satu-kesatuan.
Cara yang paling praktis untuk mengatasinya adalah mengabaikan keberadaan kelompok media tersebut.
Artinya, kita menulis bot dengan menganggap setiap pesan sebagai individu, bukan kelompok.
Dengan begitu, album akan bekerja dengan sendirinya.
Contohnya, kamu bisa meminta user untuk [menekan sebuah tombol](../plugins/keyboard#keyboard-inline) atau mengirim `/done` ketika semua berkas sudah diunggah ke bot kamu.

_Tetapi, jika aplikasi Telegram bisa melakukannya, bukankah seharusnya bot aku bisa melakukannya juga?_

Bisa iya, bisa tidak.
Secara teknis, kamu bisa memanfaatkan `media_group_id` untuk menentukan apakah pesan tersebut berasal dari album yang sama.
Namun,

- tidak ada cara untuk mengetahui jumlah pesan dalam sebuah album,
- tidak ada cara untuk mengetahui apakah pesan yang diterima merupakan pesan terakhir dari sebuah album, dan yang terakhir
- pesan lainnya seperti pesan teks, pesan layanan, dll bisa saja terselip di antara pesan-pesan album.

Jadi, ya, secara teori, memang kamu bisa mengetahui pesan yang mana yang saling berkaitan, namun hanya sebatas pesan-pesan yang kamu terima pada saat itu saja.
Kamu tidak akan pernah bisa tahu apakah akan ada pesan tambahan yang ditambahkan ke album tersebut di kemudian waktu.
Jika kamu pernah menerima sebuah album di aplikasi Telegram di kondisi internet yang _sangat_ buruk, kamu bisa menyaksikan bagaimana aplikasi secara berkala mengelompokkan ulang album tersebut seiring pesan baru diterima.

## Kenapa Saya Mengalami Error Ini?

### 400 Bad Request: Cannot parse entities

Error ini terjadi karena kamu sedang mengirim sebuah pesan menggunakan format tertentu, misal kamu menggunakan `parse_mode` ketika mengirim pesan.
Tetapi, format tersebut ada yang keliru, sehingga Telegram tidak bisa menguraikannya.
Sebaiknya kamu membaca kembali dokumentasi Telegram di [bagian pemformatan](https://core.telegram.org/bots/api#formatting-options).
`Byte offsite` yang ditampilan di pesan error akan memberi tahu kamu dimana letak kesalahannya.

::: tip Menggunakan Entities Alih-Alih Formatting
Kamu bisa menyusun entities dengan mengirim pesan terkait menggunakan opsi `entities`.
Teks pesanmu kemudian akan berisi string biasa, sehingga tidak perlu lagi menyaring karakter teks yang aneh.
Meski kita jadi perlu menambahkan beberapa baris kode lagi, cara ini jauh lebih handal dan merupakan solusi yang cukup aman untuk permasalahan ini.
Selain itu, kamu juga bisa menggunakan [plugin parse-mode](../plugins/parse-mode) untuk mengerjakannya dengan lebih mudah dan simpel.
:::

### 401 Unauthorized

Token bot kamu salah.
Mungkin kamu berpikir ini hanyalah masalah sepele.
Oh, boy!
Kamu salah besar.
Segera hubungi [@BotFather](https://t.me/BotFather) untuk melihat token bot kamu.

### 403 Forbidden: bot was blocked by the user

Kamu mungkin menemui error ini ketika mengirim sebuah pesan ke seorang user.

Ketika seorang user memblokir bot kamu, kamu tidak bisa mengirim pesan ataupun berinteraksi dengan mereka (kecuali jika bot dan user tersebut berada di grup yang sama).
Telegram sengaja melakukannya untuk melindungi para user.
Kamu tidak bisa melakukan apa-apa dengan pemblokiran tersebut.

Setidaknya, kamu bisa melakukan tindakan-tindakan berikut:

- Merespon error tersebut, misalnya dengan menghapus data user dari database.
- Mengabaikan error-nya.
- Menyimak update `my_chat_member` melalui `bot.on("my_chat_member")` untuk mendapatkan notifikasi ketika user memblokir bot kamu dengan cara membandingkan field `status` _new chat member_ yang lama dengan yang baru.

### 404 Not found

Jika kamu menemui error ini ketika mengaktifkan bot, berarti ada yang salah dengan token bot kamu.
Chat dengan [@BotFather](https://t.me/BotFather) untuk melihat tokennya.

Jika bot sebelumnya berjalan dengan baik-baik saja, kemudian secara tiba-tiba mendapatkan error 404, berarti ada yang salah dengan coding-an bot kamu.
Kamu bisa bertanya kepada kami [di grup](https://t.me/grammyjs) (atau [chat grup Rusia](https://t.me/grammyjs_ru)).

### 409 Conflict: terminated by other getUpdates request

Kamu secara tidak sengaja menjalankan bot sebanyak dua kali saat menggunakan long polling.
Kamu hanya diizinkan menjalankan satu instance bot.

Jika kamu merasa sudah menjalankan bot sebanyak sekali saja, kamu perlu mengganti token bot-nya.
Ketika token diganti, instance yang lain akan terhenti dengan sendirinya.
Chat dengan [@BotFather](https://t.me/BotFather) untuk mengganti token bot.

### 429: Too Many Requests: retry after X

Selamat!
Kamu telah mendapatkan salah satu error yang paling sulit untuk diperbaiki.

Ada dua kemungkinan yang terjadi:

**Pertama:** Bot kamu tidak memiliki banyak user.
Jika kasusnya seperti itu, berarti kamu sedang melakukan spam dengan cara mengirim request ke server Telegram secara berlebihan.
Solusinya, jangan lakukan itu.
Kamu harus mencari cara untuk mengurangi jumlah pemanggilan API tersebut seminimal mungkin.

**Kedua:** Bot kamu sangat populer dan memiliki banyak sekali user (ratusan ribu).
Kamu sudah berupaya untuk melakukan pemanggilan API seminimal mungkin, tetapi _tetap saja_ kamu menemui error ini (error flood wait).

Ada beberapa cara yang bisa kamu lakukan:

1. Baca [materi ini](../advanced/flood) supaya paham dengan situasi yang dialami.
2. Gunakan [plugin `auto-retry`](../plugins/auto-retry).
3. Minta bantuan kami [di grup](https://t.me/grammyjs).
   Kami memiliki beberapa orang yang berpengalaman di sana.
4. Meminta Telegram untuk meningkatkan batasan tersebut.
   Cara ini kemungkinan besar tidak akan berhasil jika kamu tidak melakukan langkah 1–3 terlebih dahulu.

### Cannot find type definition file for 'node-fetch'

Error ini dihasilkan karena beberapa type declaration tidak ditemukan.

Cara yang direkomendasikan untuk memperbaikinya adalah dengan mengubah `skipLibCheck` menjadi `true` di opsi compile TypeScript kamu.

Jka kamu merasa perlu untuk tetap menggunakan opsi ini di mode `false`, kamu bisa menginstal type definition yang hilang dengan cara menjalankan `npm i -D @types/node-fetch@2`.

## Pertanyaan Seputar Deno

### Kenapa kami mendukung Deno?

Berikut beberapa alasan kenapa kami lebih menyukai Deno dibandingkan dengan Node.js:

- Pembuatannya lebih simpel dan cepat.
- Peralatan yang disediakan lebih baik.
- Secara bawaan mampu menjalankan TypeScript.
- Tidak perlu mengurus `package.json` dan `node_modules`.
- Ia memiliki sebuah library standar yang sudah di-review.

> Deno diciptakan oleh Ryan Dahl---orang yang sama yang menciptakan Node.js.
> Dia mengutarakan 10 penyesalannya mengenai Node.js di [video ini](https://youtu.be/M3BM9TB-8yA).

grammY sendiri lebih memprioritaskan Deno, dari situ ia disusun ulang agar dapat mendukung Node.js sama baiknya.
