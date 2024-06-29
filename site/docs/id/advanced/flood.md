# Peningkatan IV: Pembatasan Flood

Telegram memiliki limit atau batas maksimal terhadap jumlah pesan yang dikirim suatu bot setiap detiknya.
Artinya, setiap permintaan API yang dilakukan bisa saja menghasilkan error dengan status kode 429 (Too Many Requests (Terlalu Banyak Permintaan)) beserta header `retry_after` seperti yang telah dijelaskan [di sini](https://core.telegram.org/bots/api#responseparameters).
Error ini bisa terjadi kapanpun.

Hanya ada satu cara yang tepat untuk mengatasi permasalahan tersebut:

1. Tunggu hingga waktu yang telah ditentukan.
2. Coba kirimkan lagi permintaannya.

Untungnya, terdapat sebuah [plugin](../plugins/auto-retry) untuk melakukan hal tersebut.

Cara kerja plugin ini [sangat sederhana](https://github.com/grammyjs/auto-retry/blob/main/src/mod.ts).
Ia hanya tidur (menunggu) dan mengulang kembali (kirim ulang permintaan).
Sayangnya, cara kerja yang seperti itu memiliki dampak yang cukup signifikan: **semua permintaan menjadi lambat**.
Artinya, ketika kamu menjalankan bot di sebuah webhooks, [secara teknis kamu memerlukan sebuah antrian atau queque](../guide/deployment-types#mengakhiri-request-webhook-tepat-waktu), atau cara lainnya dengan mengonfigurasi [plugin auto-retry](../plugins/auto-retry) sedemikian rupa sehingga ia tidak memakan banyak waktu---tetapi dampaknya bot kamu bisa melewatkan beberapa permintaan.

## Berapa Lama Sebenarnya Durasi Pembatasannya

Tidak tentu.

Terima saja kenyataan itu.

Kita bisa mengukur seberapa banyak permintaan yang bisa dilakukan, tetapi angka tepatnya tidak diketahui (Jika seseorang mengaku tahu jumlah tepat batasannya, berarti ia belum mendapatkan informasi ini).
Batasan ini bersifat dinamis yang bisa kamu temukan sendiri dengan melakukan uji coba ke Bot API.
Dari pengujian tersebut, kamu akan mengetahui rentang batasnya selalu berubah-ubah berdasarkan jenis permintaan, jumlah pengguna, dan berbagai faktor lain yang tidak kita ketahui dengan pasti.

Berikut beberapa asumsi keliru mengenai batas kelajuan (rate limit):

- Saya baru saja membuat bot, sehingga tidak mungkin menerima error _flood wait_.
- Bot saya tidak akan menerima error _flood wait_ karena lalu lintas pengirimannya tidak terlalu padat.
- Fitur di bot saya tidak begitu sering dipakai, sehingga error _flood wait_ tidak akan terjadi.
- Bot saya memiliki jarak waktu pemanggilan API yang cukup, sehingga error _flood wait_ tidak akan terjadi.
- Pemanggilan method tertentu tidak akan memicu error _flood wait_.
- Pemanggilan `getMe` tidak mungkin mendapatkan error _flood wait_.
- Pemanggilan `getUpdates` tidak mungkin mendapatkan error _flood wait_.

Semua asumsi di atas adalah keliru.

Mari kita jabarkan apa saja yang telah kita _ketahui_.

## Asumsi yang Benar Mengenai Batas Kelajuan (Rate Limit)

Berdasarkan [FAQ Bot](https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this), kita tahu beberapa batasan yang tidak boleh dilanggar, selamanya.

1. _"Ketika mengirim pesan di suatu chat tertentu, hindari mengirim lebih dari satu pesan per detik. Kami mungkin mengizinkan lonjakan singkat yang melewati batas tersebut, tetapi seiring berjalannya waktu kamu akan menerima error 429."_

   Aturan ini sudah cukup jelas. Plugin auto-retry mampu menanganinya.

2. _"Jika kamu mengirim notifikasi masal ke beberapa pengguna, API tidak akan mengizinkan lebih dari 30 pesan per detik. Pertimbangkan untuk menyebarkan notifikasi dalam rentang waktu yang cukup lama: 8---12 jam untuk mendapatkan hasil yang terbaik."_

   **Ini hanya berlaku untuk notifikasi masal**, misal disaat kamu mengirim pesan secara terus-menerus ke banyak pengguna.
   Kalau hanya merespon pesan dari pengguna, maka tidak masalah untuk mengirim 1000 pesan atau lebih dalam satu detik.

   Ketika FAQ Bot berkata _"pertimbangkan untuk menyebarkan notifikasi dalam rentang waktu yang cukup lama"_, bukan berarti kamu diharuskan menerapkan penundaan buatan.
   Sebaliknya, yang dimaksud adalah proses mengirim notifikasi masal memerlukan waktu berjam-jam.
   Kamu tidak bisa mengirim pesan ke semua pengguna dalam sekali waktu.

3. _"Harap diperhatikan juga bahwa bot tidak diperbolehkan mengirim pesan lebih dari 20 pesan per menit ke grup yang sama."_

   Aturannya cukup jelas.
   Yang ini sama sekali tidak ada hubungannya dengan notifikasi masal ataupun banyaknya pesan yang dikirim di dalam grup.
   Sekali lagi, plugin auto-retry akan menanganinya dengan baik.

Ada beberapa batasan lain yang tidak tertulis di dokumentasi resmi API Bot.
Contohnya, [sudah diketahui](https://t.me/tdlibchat/146123) bahwa bot hanya dapat mengedit maksimal 20 pesan dalam satu menit per obrolan grup.
Namun, batasan ini tidaklah selamanya benar, karena ia bisa saja berubah di masa mendatang.
Lagi pula, informasi ini tidak memberikan dampak apapun ke cara kamu memprogram bot.

Misalnya, memperlambat bot kamu berdasarkan angka di atas tetaplah ide yang buruk:

## Pelambatan (Throttling)

Sebagian besar orang berpikir kalau mengalami _rate limit_ adalah hal yang buruk.
Mereka lebih memilih untuk mengetahui jumlah spesifik dari batasan tersebut agar mereka bisa menerapkan pelambatan ke masing-masing bot.

Pemikiran semacam itu tidaklah tepat.
Rate limit adalah sebuah alat yang berguna untuk mengontrol pembanjiran (flood), yang jika ditangani dengan tepat, ia tidak akan berdampak negatif ke bot kamu.
Dengan kata lain, terkena _rate limit_ tidak akan mengakibatkan pemblokiran (ban).
Tetapi mengabaikan _rate limit_ lah yang menyebabkan pemblokiran terjadi.

Terlebih [menurut Telegram](https://t.me/tdlibchat/47285) mengetahui jumlah pasti batasan tersebut adalah "tidak berguna dan berbahaya".

Dikatakan _tidak berguna_ karena meski tahu jumlah pastinya, kamu tetap saja perlu menangani error _flood wait_.
Misalnya ketika server API Bot mengembalikan kode 429 karena server dipadamkan untuk melakukan mulai ulang selama pemeliharaan.

Dikatakan _berbahaya_ karena jika kamu menerapkan penundaan permintaan buatan untuk menghindari terkena pembatasan, performa bot kamu akan menurun jauh.
Itulah kenapa kamu sebaiknya selalu mengirim permintaan secepat mungkin dengan tetap mematuhi semua error _flood wait_ (menggunakan plugin auto-retry).

Jika melambatkan permintaan adalah ide yang buruk, lantas bagaimana caranya melakukan
penyebaran pesan (broadcasting)?

## Cara Menyebarkan Pesan

Penyebaran (broadcast) bisa dilakukan dengan mengikuti pendekatan sederhana berikut:

1. Kirim satu pesan ke satu pengguna.
2. Jika menerima error 429, tunggu lalu coba lagi.
3. Kembali ke point 1.

Jangan tambahkan penundaan buatan karena dapat membuat penyebaran berjalan lambat.

Jangan mengabaikan error 429 karena dapat mengakibatkan pemblokiran.

Jangan kirim banyak pesan secara bersamaan.
Kamu bisa mengirim beberapa pesan secara bersamaan (mungkin 3 atau semacamnya) tetapi penerapannya cukup sulit.

Langkah kedua pada daftar di atas telah dilakukan secara otomatis oleh plugin auto-retry, sehingga kodenya akan terlihat seperti ini:

```ts
bot.api.config.use(autoRetry());

for (const [chatId, text] of broadcast) {
  await bot.api.sendMessage(chatId, text);
}
```

Yang menarik dari kode tersebut adalah `broadcast` apa yang akan disebarkan.
Kamu perlu menyimpan semua chat di suatu database, dan mengambilnya secara perlahan.

Untuk sementara, kamu perlu menerapkan logika tersebut secara mandiri.
Di masa yang akan datang, kami berencana untuk membuat plugin penyebar.
Kami akan dengan senang hati menerima kontribusi kalian!
Mari bergabung bersama kami [di sini](https://t.me/grammyjs).
