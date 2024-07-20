---
next: false
---

# Long Polling vs. Webhook

Bot menerima pesan dari server Telegram dengan dua metode: _long polling_ dan _webhook_.
grammY mendukung keduanya dan secara bawaan menggunakan metode long polling.

Pertama, kami akan menjelaskan apa itu long polling dan webhook, kemudian menerangkan kelebihan dan kekurangan dari masing-masing metode tersebut.
Materi ini juga mencakup cara-cara penerapannya menggunakan grammY.

## Pengenalan

Kamu bisa membayangkan seluruh pembahasan webhook versus long polling sebagai pertanyaan _tipe deployment_ apa yang harus dipilih.
Dengan kata lain, terdapat dua cara yang berbeda dalam meng-hosting bot (menjalankannya di suatu server).
Mereka juga memiliki metode pengiriman pesan yang berbeda.

Pilihan ini akan sangat berpengaruh jika kamu berencana memilih tempat hosting yang sesuai untuk bot kamu.
Sebagai contoh, beberapa penyedia layanan hosting hanya mendukung salah satu dari dua metode deployment ini.

Bot kamu bisa _mengambil_ update secara mandiri (long polling) ataupun menunggu server Telegram _mengirimkan_ update ke bot kamu (webhook).

> Kalau kamu sudah tahu cara kerja dari kedua metode tersebut, gulir ke bawah untuk melihat bagaimana cara menggunakan [long polling](#bagaimana-cara-menggunakan-long-polling) atau [webhook](#bagaimana-cara-menggunakan-webhook) dengan grammY.

## Bagaimana Cara Kerja Long Polling?

_Bayangkan kamu ingin membeli segelas es cendol di warung Pak Jenggot langgananmu.
Kamu berjalan ke warung beliau lalu memesan es cendol durian.
Sayangnya, es cendol durian lagi habis.
Kamu balik pulang dengan tangan kosong sambil mata berkaca-kaca._

_Besok harinya, kamu masih ingin merasakan nikmatnya es cendol durian.
Kamu pergi ke warung Pak Jenggot dengan harap-harap cemas.
Kabar baik!
Es cendol durian sudah tersedia, bahkan stoknya melimpah ruah.
Kamu menikmati setiap seruputan dengan senyuman lebar di wajah.
Segar sekali!_

**Polling** artinya grammY secara proaktif mengirim request ke Telegram, meminta update baru (anggaplah pesan).
Kalau tidak ada pesan yang tersedia, Telegram akan mengembalikan daftar kosong, yang menandakan bahwa tidak ada pesan baru untuk bot kamu semenjak terakhir kali kamu mengirim request.

Lalu grammY mengirim sebuah request lagi ke Telegram, dan ternyata pesan-pesan baru telah tersedia. Telegram lantas mengembalikan pesan-pesan tersebut dalam bentuk sebuah array yang berisi maksimal 100 object update.

```asciiart:no-line-numbers
______________                                              _____________
|            |                                              |           |
|            |    <---       Apa ada pesan baru?     ---    |           |
|            |     ---         maaf, tidak ada       --->   |           |
|            |                                              |           |
|            |    <---       Apa ada pesan baru?     ---    |           |
|  Telegram  |     ---         maaf, tidak ada       --->   |    Bot    |
|            |                                              |           |
|            |    <---      Apa ada pesan baru?      ---    |           |
|            |     ---   Oh! iya ada, ini pesannya   --->   |           |
|            |                                              |           |
|____________|                                              |___________|
```

Terlihat jelas bahwa cara ini memiliki beberapa kekurangan.
Bot kamu hanya akan menerima pesan baru jika ia memintanya, misal setiap beberapa detik, dsb.
Supaya bot kamu bisa merespon dengan cepat, kamu cuma perlu mengirim request sebanyak-banyaknya dan tak perlu menunggu balasan satu demi satu.
Contohnya, kita bisa saja meminta pesan baru setiap 1 milidetik! Tidak ada salahnya bukan…

Daripada mengirim spam ke server Telegram, kita akan menggunakan _long polling_ alih-alih (short) polling biasa.

**Long polling** berarti grammY secara proaktif mengirim sebuah request ke Telegram untuk meminta update baru.
Kalau tidak ada pesan baru, Telegram akan menjaga koneksi tetap tersambung hingga pesan baru tiba, yang kemudian akan merespon request dengan pesan-pesan baru tersebut.

_Kembali ke es cendol Pak Jenggot!
Kali ini kamu minta es cendol alpukat.
Pak Jenggot tersenyum lalu tiba-tiba diam mematung.
Bahkan, kamu tidak mendapatkan respon sama sekali.
Jadi, kamu pun menunggu sambil tersenyum kembali ke Pak Jenggot.
Masih menunggu…
Dan menunggu…_

_Beberapa menit sebelum matahari terbit, sebuah mobil pickup tiba dengan membawa beberapa wadah besar menuju gudang pendingin di belakang warung.
Di wadah-wadah itu terdapat label besar bertuliskan **ES CENDOL ALPUKAT**._

_Pak Jenggot tiba-tiba mulai bergerak lagi.
Beliau menyahut "Ok, siap! Kami punya stok es cendol alpukat banyak di gudang!
Satu porsi extra ditambah krim susu, dibungkus seperti biasanya?"_

_Seolah-olah tidak terjadi apa-apa, kamu membawa es cendol sambil berjalan pulang meninggalkan
warung es cendol paling aneh sedunia._

```asciiart:no-line-numbers
______________                                            _____________
|            |                                            |           |
|            |   <---     Apa ada pesan baru?      ---    |           |
|            |   .                                        |           |
|            |   .                                        |           |
|            |   .       *Dua-duanya menunggu*            |           |
|  Telegram  |   .                                        |    Bot    |
|            |   .                                        |           |
|            |   .                                        |           |
|            |    ---  Oh! iya ada, ini pesannya   --->   |           |
|            |                                            |           |
|____________|                                            |___________|
```

> Perlu dicatat bahwa pada kenyataannya, tidak ada koneksi yang akan tetap terbuka selama berjam-jam.
> Request long polling mempunyai waktu timeout bawaan selama 30 detik untuk menghindari terjadinya berbagai [masalah teknis](https://datatracker.ietf.org/doc/html/rfc6202#section-5.5).
> Kalau tidak ada pesan baru yang dikembalikan selama periode waktu tersebut, maka request akan dibatalkan dan dikirimkan kembali---tetapi konsep dasarnya masih tetap sama.

Dengan menggunakan long polling, kamu akan menerima pesan baru yang sama cepatnya, sehingga tidak perlu lagi mengirim spam ke server Telegram.
Metode inilah yang akan dipakai grammY ketika kamu menjalankan `bot.start()`.
Mantap!

## Bagaimana Cara Kerja Webhook?

_Setelah kejadian menyeramkan yang kamu alami (seminggu tanpa es cendol!), kamu pun memutuskan untuk tidak membeli es cendol dari orang lain, selamanya.
Daripada kamu keluar rumah setiap kali ingin membeli es cendol, bukankah lebih baik kalau es cendolnya dikirim ke rumahmu?_

Menggunakan **webhook** berarti kamu akan memberikan sebuah URL (yang bisa diakses oleh publik) ke Telegram.
Kapanpun ada pesan baru tersedia untuk bot-mu, Telegram (bukan kamu!) akan mengambil inisiatif untuk mengirim request beserta object update-nya ke server-mu.
Keren, kan?

_Kamu memutuskan untuk mengunjungi warung es cendol untuk yang terakhir kalinya.
Kamu memberi tahu Pak Jenggot alamat rumahmu.
Setelah itu, beliau berjanji untuk langsung mengantarkan es cendolnya setiap kali ada stok baru tersedia, sendiri (karena beliau bilang es cendolnya keburu cair kalau diantar dengan jasa ekspedisi).
Pak Jenggot benar-benar penjual yang ramah dan baik hati._

```asciiart:no-line-numbers
______________                                                _____________
|            |                                                |           |
|            |                                                |           |
|            |                                                |           |
|            |            *Kedua-duanya menunggu*             |           |
|            |                                                |           |
|  Telegram  |                                                |    Bot    |
|            |                                                |           |
|            |                                                |           |
|            |    ---     Permisi, ada pesan baru    --->     |           |
|            |   <---      Oh, iya. Terima kasih!    ---      |           |
|____________|                                                |___________|
```

## Perbandingan

**Keuntungan utama long polling dibandingkan dengan webhook adalah lebih simpel.**
Kamu tidak perlu menyediakan sebuah domain atau URL publik, serta mengotak-atik sertifikat SSL kalau kamu menjalankan bot di sebuah VPS.
Cukup gunakan `bot.start()` dan semuanya akan berjalan dengan baik, tidak perlu pengaturan lebih lanjut.
Bot juga tidak terbebani karena kamu memiliki kontrol atas jumlah pesan yang ingin diproses.

Tempat-tempat yang cocok untuk menggunakan long polling:

- Di komputermu sendiri ketika mengembangkan bot.
- Di kebanyakan server.
- Di tempat hosting yang menjalankan bot kamu selama 24 jam sehari.

**Keuntungan utama webhook dibandingkan dengan long polling adalah lebih hemat.**
Kamu bisa menghemat banyak sekali request dan tidak perlu lagi menjaga koneksi tetap tersambung sepanjang waktu.
Kamu bisa menggunakan layanan hosting yang secara otomatis menurunkan performa ketika tidak ada request yang masuk, yang berarti lebih hemat biaya.
Kalau mau, kamu bahkan bisa [membuat panggilan API ketika membalas request dari Telegram](#webhook-reply), walaupun ia juga memiliki beberapa kekurangan yang harus diperhitungkan juga.
Lihat konfigurasi opsinya [di sini](/ref/core/apiclientoptions#canusewebhookreply).

Tempat-tempat yang cocok untuk menggunakan webhook:

- Di server yang menggunakan sertifikat SSL.
- Di tempat hosting yang memasang tarif berdasarkan beban yang dipakai.
- Di platform serverless, misal cloud function atau edge network yang terprogram.

## Aku Masih Belum Tahu Mana yang Sebaiknya Dipilih

Jika kamu tidak punya alasan yang bagus untuk menggunakan webhook, pilih saja long polling.
Long polling tidak memiliki kekurangan yang mencolok, dan---berdasarkan pengalaman kami---kamu tidak perlu membuang-buang waktu melakukan perawatan atau maintenance.
Webhook bisa menjadi sedikit "nakal" dari waktu ke waktu (lihat [di bawah](#mengakhiri-request-webhook-tepat-waktu)).

Apapun pilihannya, disaat kamu mengalami masalah yang cukup serius, seharusnya tidak terlalu sulit untuk beralih dari satu metode deployment ke metode deployment yang lain.
Di grammY, kamu cukup menulis beberapa baris kode.
Selain itu, kamu tidak perlu mengubah pengaturan [middleware](./middleware).

## Bagaimana Cara Menggunakan Long Polling

Panggil

```ts
bot.start();
```

untuk menjalankan bot kamu menggunakan bentuk paling simpel dari long polling.
Ia akan memproses update secara berurutan.
Sangat mudah untuk men-debug bot kamu menggunakan metode ini.
Semua perilaku bisa dengan mudah diprediksi karena update dikerjakan secara berurutan bukan bersamaan.

Jika kamu ingin grammY untuk memproses pesan secara bersamaan, atau kamu khawatir dengan output yang dihasilkan, silahkan lihat materi yang membahas tentang [grammY runner](../plugins/runner).

## Bagaimana Cara Menggunakan Webhook

Kalau kamu ingin menggunakan webhook, kamu harus mengintegrasikan bot kamu ke dalam web server.
Oleh karena itu, kami berharap kamu mampu menjalankan sebuah web server sederhana menggunakan framework pilihanmu.

Setiap bot di grammY bisa dikonversi menjadi middleware untuk beberapa web framework, termasuk `express`, `koa`/`oak`, dsb.
Kamu bisa membuat sebuah middleware untuk framework yang diinginkan dengan cara meng-import function `webhookCallback` ([Referensi API](/ref/core/webhookcallback)).

::: code-group

```ts [TypeScript]
import express from "express";

const app = express(); // atau framework apapun yang kamu gunakan
app.use(express.json()); // mengurai (parsing) body dari request JSON

// "express" akan otomatis dipakai jika tidak ada argument yang diberikan.
app.use(webhookCallback(bot, "express"));
```

```js [JavaScript]
const express = require("express");

const app = express(); // atau framework apapun yang kamu gunakan
app.use(express.json()); // mengurai (parsing) body dari request JSON

// "express" akan otomatis dipakai jika tidak ada argument yang diberikan.
app.use(webhookCallback(bot, "express"));
```

```ts [Deno]
import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application(); // atau framework apapun yang kamu gunakan

// Pastikan untuk mencantumkan nama framework-nya.
app.use(webhookCallback(bot, "oak"));
```

:::

> Kamu tidak perlu memanggil `bot.start()` ketika menggunakan webhooks.

Jika kamu berniat menjalankan bot di sebuah VPS menggunakan webhook, pastikan untuk membaca [panduan keren Marvin mengenai hal-hal tentang webhook](https://core.telegram.org/bots/webhooks) yang ditulis oleh tim Telegram.

### Web Framework Adapter

Untuk mendukung berbagai macam web framework, grammY menerapkan konsep **multi-adapter**.
Adapter bertugas untuk meneruskan input dan output dari suatu web framework ke grammY, dan sebaliknya.
Nah, jenis framework adapter yang digunakan untuk berkomunikasi dengan web framework tersebut ditentukan oleh parameter kedua yang kamu isi di `webhookCallback` ([Referensi API](/ref/core/webhookcallback)).

Karena menggunakan pendekatan dengan cara tersebut, biasanya kita membutuhkan sebuah adapter yang berbeda untuk setiap framework.
Tetapi, berhubung beberapa framework memiliki interface yang mirip, kita bisa menggunakan adapter yang sama untuk beberapa framework sekaligus.
Di bawah ini adalah tabel berisi berbagai macam adapter yang tersedia beserta jenis framework, API, dan runtime yang diketahui berfungsi dengan baik di grammY.

| Adapter            | Framework/API/Runtime                                                          |
| ------------------ | ------------------------------------------------------------------------------ |
| `aws-lambda`       | AWS Lambda Functions                                                           |
| `aws-lambda-async` | AWS Lambda Functions dengan `async`/`await`                                    |
| `azure`            | Azure Functions                                                                |
| `bun`              | `Bun.serve`                                                                    |
| `cloudflare`       | Cloudflare Workers                                                             |
| `cloudflare-mod`   | Cloudflare Module Workers                                                      |
| `express`          | Express, Google Cloud Functions                                                |
| `fastify`          | Fastify                                                                        |
| `hono`             | Hono                                                                           |
| `http`, `https`    | Node.js `http`/`https` modules, Vercel                                         |
| `koa`              | Koa                                                                            |
| `next-js`          | Next.js                                                                        |
| `nhttp`            | NHttp                                                                          |
| `oak`              | Oak                                                                            |
| `serveHttp`        | `Deno.serveHttp`                                                               |
| `std/http`         | `Deno.serve`, `std/http`, `Deno.upgradeHttp`, `Fresh`, `Ultra`, `Rutt`, `Sift` |
| `sveltekit`        | SvelteKit                                                                      |
| `worktop`          | Worktop                                                                        |

### Webhook Reply

Ketika menerima sebuah request webhook, bot kamu bisa memanggil satu method sebagai responnya.
Keuntungannya, bot kamu bisa menghemat satu request HTTP per update.
Tetapi, terdapat beberapa kekurangan dibaliknya:

1. Kamu tidak bisa mengatasi error yang mungkin terjadi ketika melakukan panggilan API tersebut.
   Termasuk diantaranya adalah error rate limit. Jadi, tidak ada jaminan kalau request-mu berjalan dengan baik.
2. Yang paling penting, kamu tidak memiliki akses ke object responnya.
   Misal, ketika memanggil `sendMessage` kamu tidak akan menerima balasan berupa isi pesan yang telah kamu kirim.
3. Bahkan, kamu tidak bisa membatalkan request-nya.
   `AbortSignal` akan diabaikan.
4. Perlu diperhatikan juga bahwa beberapa type di grammY tidak mencerminkan hasil dari callback webhook yang telah dilakukan!
   Sebagai contoh, mereka akan selalu mengindikasikan bahwa kamu telah menerima object respon, sehingga ini menjadi tanggung jawab kamu untuk memastikan semua berjalan baik ketika melakukan optimasi kecil ini.

Kalau kamu ingin memanfaatkan webhook reply, kamu bisa menambahkan opsi `canUseWebhookReply`di opsi `client` dari `BotConfig` kamu ([referensi API](/ref/core/botconfig)).
Masukkan sebuah function yang menentukan apakah method tersebut memanfaatkan webhook reply atau tidak.

```ts
const bot = new Bot("", {
  client: {
    // Kita hanya akan menggunakan webhook reply
    // jika method tersebut adalah "sendChatAction".
    canUseWebhookReply: (method) => method === "sendChatAction",
  },
});
```

Berikut cara kerja webhook reply di balik layar:

```asciiart:no-line-numbers
______________                                                       _____________
|            |                                                       |           |
|            |                                                       |           |
|            |                                                       |           |
|            |               *Kedua-duanya menunggu*                 |           |
|            |                                                       |           |
|  Telegram  |                                                       |    Bot    |
|            |                                                       |           |
|            |                                                       |           |
|            |  ---          Permisi, ada pesan baru            ---> |           |
|            | <--- Baik, sekalian kirim sendChatAction ini, ya ---  |           |
|____________|                                                       |___________|
```

### Mengakhiri Request Webhook Tepat Waktu

> Kamu bisa mengabaikan sisa dari halaman ini jika middleware kamu cukup cepat, misal dalam beberapa detik saja.
> Bagian ini ditujukan khusus untuk kamu yang ingin melakukan operasi-operasi yang membutuhkan waktu cukup lama, contohnya pengiriman file.

Saat Telegram mengirim sebuah update dari sebuah chat ke bot kamu, ia akan menunggu kamu mengakhiri request tersebut sebelum mengirim update berikutnya dari chat yang sama.
Dengan kata lain, Telegram akan mengirim update dari chat yang sama secara **berurutan**, sebaliknya update dari chat yang berbeda akan dikirim secara **bersamaan**.
Sumber informasi tersebut berasal dari [sini](https://github.com/tdlib/telegram-bot-api/issues/75#issuecomment-755436496).

Telegram selalu memastikan kalau bot kamu menerima semua update yang dikirimkan.
Berarti, jika sebuah update gagal dikirim, ia akan menunda pengiriman update-update selanjutnya hingga update yang pertama tadi berhasil diterima oleh bot kamu.

#### Kenapa Tidak Mengakhiri Request Webhook Itu Berbahaya

Telegram mempunyai timeout atau batas waktu untuk setiap update yang dikirim ke alamat webhook kamu.
Kalau kamu telat mengakhiri webhook, Telegram akan mengirim kembali update tersebut karena ia mengasumsikan update-nya gagal dikirim.
Akibatnya, bot kamu secara tidak sengaja memproses update yang sama berulang kali, termasuk mengirim pesan ke pengguna.

```asciiart:no-line-numbers
______________                                                       _____________
|            |                                                       |           |
|            | ---          Permisi, ada pesan baru          --->    |           |
|            |                                                  .    |           |
|            |            *bot langsung memprosesnya*           .    |           |
|            |                                                  .    |           |
|  Telegram  | ---           PERMISI! pesan baru!            --->    |    Bot    |
|            |                                                  ..   |           |
|            |     *bot memproses untuk yang kedua kalinya*     ..   |           |
|            |                                                  ..   |           |
|            | ---           HALOOO?! ADA ORANG?!            --->    |           |
|            |                                                  ...  |           |
|            |     *bot memproses untuk yang ketiga kalinya*    ...  |           |
|____________|                                                  ...  |___________|
```

Itulah kenapa grammY memiliki timeout-nya sendiri. `webhookCallback` memiliki timeout yang lebih pendek, sebesar 10 detik untuk setting-an bawaan.
Kalau middleware kamu selesai sebelum batas waktu tersebut, function `webhookCallback` akan merespon webhook secara otomatis.
Semua berjalan lancar.
Tetapi, kalau middleware kamu melewati batas timeout milik grammY, `webhookCallback` akan melempar sebuah error.
Artinya, kamu perlu menangani error tersebut di web framework-mu.
Kalau kamu tidak memiliki error handler untuk menanganinya, Telegram akan mengirim kembali update yang sama.
Setidaknya kali ini kamu memiliki log error yang bisa memberi tahu dimana letak kesalahannya.

Saat Telegram mengirim update yang sama untuk kedua kalinya, kemungkinan besar bot kamu akan melewati batas timeout lagi dan Telegram akan tetap mengirim update tersebut.
Bot kamu tidak hanya akan menerima update yang sama dua kali, bahkan berkali-kali hingga Telegram memutuskan untuk berhenti mengirimkannya.
Kamu akan mulai menyadari bahwa bot-mu mengirim spam ke para user karena ia memproses update yang sama berulang kali, yang kemungkinan besar isi pesannya juga sama.

#### Kenapa Mengakhiri Request Webhook Lebih Awal Juga Berbahaya

Daripada melempar sebuah error saat terjadi timeout, kamu bisa saja mengonfigurasi `webhookCallback` untuk mengakhiri request webhook tersebut lebih awal, meskipun middleware kamu masih memproses pesan.
Kamu bisa melakukannya dengan memasukkan `"return"` sebagai argument ketiga ke `webhookCallback`, alih-alih value bawaan `"throw"`.
Meskipun bisa dilakukan, solusi seperti ini biasanya menyebabkan banyak masalah.

Ingat! Ketika kamu merespon webhook, Telegram akan mengirim update berikutnya untuk chat yang sama.
Namun, karena update yang lama masih dikerjakan, maka dua update yang seharusnya diproses berurutan sekarang diproses bersamaan.
Ini akan menyebabkan _race condition_.
Contohnya, kerusakan di plugin session menjadi tidak terhindarkan karena _[WAR](https://en.wikipedia.org/wiki/Hazard_(computer_architecture)#Write_after_read_(WAR)) hazard_.
**Kondisi ini akan menyebabkan bot kehilangan data!**
Plugin lainnya dan bahkan middleware-mu sendiri juga mungkin akan ikut rusak.
Sejauh mana hal ini bisa dilakukan tergantung dari bot kamu.

#### Bagaimana Cara Mengatasinya

Jawaban dari pertanyaan ini lebih mudah diucapkan daripada dilakukan:
**itu tugas kamu untuk memastikan semua middleware selesai sebelum batas timeout.**
Jangan gunakan middleware yang berjalan lama.
Ya, kami paham kalau kamu mungkin _ingin_ melakukan pekerjaan yang membutuhkan waktu lama.
Tetap saja.
Jangan lakukan hal tersebut.
Tidak di dalam middleware kamu.

Lebih baik gunakan antrian atau queue (ada banyak sistem queue yang tersedia di luar sana, dari yang paling simpel hingga paling rumit).
Daripada melakukan semua pekerjaan di dalam webhook yang memiliki timeout terbatas, lebih baik kamu menambahkan tugas baru ke antrian queue yang diproses terpisah, dan biarkan middleware kamu menyelesaikan tugasnya sendiri.
Queue tersebut bisa menggunakan waktu sebanyak yang ia mau.
Ketika sudah selesai, ia bisa mengirim pesan kembali ke chat.
Ini cukup mudah dilakukan kalau kamu hanya menggunakan queue sederhana di memory.
Tetapi, akan cukup menantang jika kamu menggunakan _fault-tolerant external queuing system_, yang mana dapat mempertahankan keadaan dari semua tugas, lalu kamu bisa melanjutkan antrian tugas tersebut meskipun server-mu tiba-tiba padam.

```asciiart:no-line-numbers
______________                                          _____________
|            |                                          |           |
|            |   ---     permisi, pesan baru     --->   |           |
|            |  <---      ok, terima kasih       ---.   |           |
|            |                                      .   |           |
|            |                                      .   |           |
|  Telegram  |       *bot memulai antrian queue*    .   |    Bot    |
|            |                                      .   |           |
|            |                                      .   |           |
|            |  <--- kirim pesan beserta hasilnya ---   |           |
|            |   ---     baik, sudah dikirim      --->  |           |
|____________|                                          |___________|
```

#### Kenapa `"return"` Biasanya Lebih Buruk Daripada `"throw"`

Kamu mungkin penasaran kenapa perilaku bawaan `webhookCallback` adalah melempar sebuah error, alih-alih mengakhiri request tersebut dengan baik.
Pilihan desain ini dipilih karena pertimbangan berikut.

Race condition sangatlah sulit untuk direproduksi karena sangat jarang terjadi.
Untuk mengatasi permasalahan tersebut, dari awal _pastikan jangan sampai terjadi timeout_.
Tetapi, Jika suatu saat itu terjadi, kamu pasti ingin tahu apa yang sebenarnya terjadi, dengan begitu kamu bisa menyelidiki dan memperbaiki sumber masalahnya.
Karena alasan tersebutlah, alih-alih return, kamu pasti mengharapkan sebuah error muncul di log kamu.
Sebaliknya, dengan menyetel timeout handler ke `"return"`, mengabaikan timeout dan berpura-pura seolah-olah tidak terjadi apa-apa, adalah kebalikan dari perilaku yang kita inginkan dan tidak ada artinya.

Kalau kamu tetap melakukannya, kamu seakan-akan menggunakan antrian update di pengiriman webhook milik Telegram sebagai antrian queue milikmu.
Ini ide yang buruk karena alasan-alasan yang telah dijabarkan di atas.
Hanya karena grammY _bisa_ menghilangkan error yang menyebabkan kamu kehilangan datamu, bukan berarti kamu _harus_ menggunakannya.
Konfigurasi ini sebaiknya tidak dipakai kalau kasusnya hanya karena middleware kamu membutuhkan waktu yang lama untuk menyelesaikan tugasnya.
Luangkan waktu untuk memperbaiki isu tersebut, dengan begitu dirimu di masa depan tidak akan menyesalinya.
