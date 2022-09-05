# Daftar Perbandingan Penyedia Hosting

Ada banyak penyedia hosting yang mengizinkan kamu menjalankan bot di server mereka.
Namun, sering kali kita mengalami kesulitan untuk memperkirakan seberapa mahal dan seberapa bagus performa server yang mereka sediakan.
Itulah kenapa komunitas grammY mengumpulkan review dari beberapa pengguna yang menggunakan penyedia hosting tersebut.

## Apa itu Penyedia Hosting?

Agar bot bisa berjalan selama 24 jam sehari, kamu memerlukan sebuah komputer yang dapat berjalan selama itu juga.
Seperti yang telah [dijelaskan di pengenalan](../guide/introduction.md#cara-membuat-bot-tetap-berjalan), kamu pasti tidak ingin melakukannya di laptop ataupun pc rumah kamu.
Jadi, kamu perlu menyewa komputer dari suatu perusahaan untuk menjalankan bot di cloud.

Dengan kata lain, kamu menjalankan bot di komputer milik orang lain.

## Tabel Perbandingan

> Silahkan tekan tombol edit di bawah halaman untuk menambahkan penyedia hosting lain atau mengedit daftar yang sudah ada!

Kami menyediakan dua tabel perbandingan: satu untuk hosting [serverless](#serverless) dan satu untuk [VPS](#vps).

### Serverless

Serverless artinya kamu tidak bisa mengontrol perangkat yang menjalankan bot kamu.
Sebaliknya, penyedia hosting hanya mengizinkan kamu mengunggah kode, kemudian mereka akan memindahkan kode tersebut ke beberapa perangkat secara bergantian agar bot kamu bisa terus berjalan.

Kekurangannya, karena perangkat selalu digilir, bot kamu tidak memiliki tempat penyimpanan permanen, misalnya tempat penyimpanan sistem file lokal.
Akibatnya, kamu diharuskan memiliki sebuah database terpisah jika ingin menyimpan data secara permanen.
Oleh karena itu, kami menyarankan kamu untuk menggunakan jenis hosting yang berbeda jika mengembangkan sebuah bot yang kompleks, contohnya sebuah [VPS](./vps.md).

Selain itu, kamu juga diharuskan menggunakan [webhooks](../guide/deployment-types.md) ketika menggunakan serverless.

| Nama                   | Harga (min) | Biaya                                                                      | Batasan                                                                                    | Node.js | Deno                        | Web | Catatan                                          |
| ---------------------- | ----------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------- | --------------------------- | --- | ------------------------------------------------ |
| Deta                   | Gratis      | Belum ada paket yang berbayar                                              | Tidak ada batasan                                                                          | ✅       | ❓                           | ❓   |                                                  |
| Deno Deploy            | Gratis      | Berlangganan $10/bln untuk 5jt req dan 100 GB; $2/1jt req, $0.3/GB koneksi | [100rb req/hari, 100 GB/bln, maksimal 10 ms CPU-time](https://deno.com/deploy/pricing)     | ❌       | ✅                           | ❌   |                                                  |
| DigitalOcean Functions | Gratis      | $1.85/100rb GB-s                                                           | [90rb GB-s/bln](https://docs.digitalocean.com/products/functions/details/pricing/)         | ✅       | ❌                           | ❓   |                                                  |
| Cloudflare Workers     | Gratis      | $5/10jt req                                                                | [100rb req/hari, maksimal 10 ms CPU-time](https://workers.cloudflare.com/)                 | ❌       | [✅](https://denoflare.dev/) | ✅   |                                                  |
| Heroku                 | Gratis      | Skema biayanya rumit                                                       | [550-1000 h/bln](https://www.heroku.com/pricing)                                           | ✅       | ❓                           | ❓   |                                                  |
| Vercel                 | Gratis      | Berlangganan $20/bln                                                       | [Pemanggilan tak terbatas, 100 GB-h, maksimal 10 s](https://vercel.com/pricing)            | ❓       | ❓                           | ❓   | Tidak ditujukan untuk penggunaan selain website? |
| Scaleway Functions     | Gratis      | €0.15/1jt req, €1.2/100rb GB-s                                             | [1jt request, 400rb GB-s/bln](https://www.scaleway.com/en/pricing/#serverless-functions)   | ❓       | ❓                           | ❓   |                                                  |
| Scaleway Containers    | Gratis      | €0.10/100rb GB-s, €1.0/100rb vCPU-s                                        | [400rb GB-s, 200rb vCPU-s/bln](https://www.scaleway.com/en/pricing/#serverless-containers) | ❓       | ❓                           | ❓   |                                                  |
| Vercel Edge Functions  | Gratis      | Berlangganan $20/bln untuk 500rb                                           | [100rb req/hari](https://vercel.com/pricing)                                               | ❓       | ❓                           | ❓   |                                                  |
| serverless.com         | Gratis      |                                                                            |                                                                                            | ❓       | ❓                           | ❓   |                                                  |
| DigitalOcean Apps      | $5          |                                                                            |                                                                                            | ❓       | ❓                           | ❓   | Belum pernah dites                               |
| Fastly Compute@Edge    |             |                                                                            |                                                                                            | ❓       | ❓                           | ❓   |                                                  |

### VPS

_Virtual private server_ atau VPS adalah sebuah perangkat virtual yang bisa kamu kontrol sepenuhnya.
Pada umumnya, kamu bisa mengakses VPS melalui [SSH](https://en.wikipedia.org/wiki/Secure_Shell).
Di sana, kamu bisa menginstal berbagai macam software, melakukan pembaruan sistem, dan sebagainya.

Kamu bisa menjalankan bot baik menggunakan long polling ataupun webhooks di sebuah VPS.

Lihat tutorial pemasangan bot ke sebuah VPS [berikut](./vps.md).

| Nama          | Harga (min) | Ping ke API Bot                           | Pilihan Termurah                   |
| ------------- | ----------- | ----------------------------------------- | ---------------------------------- |
| Contabo       |             | 15 ms :de: Nuremberg                      |                                    |
| DigitalOcean  | $5          | 1-15 ms :netherlands: AMS, 19 ms :de: FRA | 1 vCPU, 1 GB RAM, 25 GB SSD, 1 TB  |
| Hetzner Cloud | €4.15       | ~42 ms :de:                               | 1 vCPU, 2 GB RAM, 20 GB SSD, 20 TB |
| IONOS VPS     | €1 atau $2  | 15 ms :de: Baden-Baden                    | 1 vCPU, 0.5 GB RAM, 8 GB SSD       |
| Scaleway      | €~7         |                                           | 2 core, 2 GB RAM, 20 GB SSD        |

## Penjelasan Satuan

### Satuan Dasar

| Simbol | Nama Satuan | Keterangan                                                                                       |
| ------ | ----------- | ------------------------------------------------------------------------------------------------ |
| rb     | ribu        | 1.000 dalam jumlah.                                                                              |
| jt     | juta        | 1.000.000 dalam jumlah.                                                                          |
| €      | Euro        | Mata uang EUR.                                                                                   |
| $      | US-Dollar   | Mata uang USD.                                                                                   |
| req    | request     | Jumlah HTTP request.                                                                             |
| vCPU   | virtual CPU | Tenaga komputasi untuk satu CPU virtual, salah satu komponen dari CPU aslinya.                   |
| ms     | milidetik   | 0,001 detik.                                                                                     |
| s      | detik       | Satu detik (satuan [SI](https://id.wikipedia.org/wiki/Sistem_Satuan_Internasional) untuk waktu). |
| min    | menit       | Satu menit, 60 detik.                                                                            |
| h      | jam         | Satu jam, 60 menit.                                                                              |
| hari   | hari        | Satu hari, 24 jam.                                                                               |
| bln    | bulan       | Satu bulan, kurang lebih 30 hari.                                                                |
| GB     | gigabyte    | Penyimpanan 1.000.000.000 bytes.                                                                 |

### Contoh Kombinasi Satuan

| Satuan       | Besaran                  | Nama Satuan                      | Keterangan                                                               |
| ------------ | ------------------------ | -------------------------------- | ------------------------------------------------------------------------ |
| $/bln        | biaya                    | US-Dollar per bulan              | Biaya bulanan.                                                           |
| €/jt req     | biaya                    | Euro per juta request            | Biaya untuk memproses satu juta request.                                 |
| req/min      | keluaran                 | request per menit                | Jumlah request yang diproses dalam satu menit.                           |
| GB/s         | keluaran                 | gigabyte per detik               | Jumlah gigabyte yang ditransfer dalam satu detik.                        |
| GB-s         | penggunaan memory        | gigabyte detik                   | Penggunaan satu gigabyte selama satu detik.                              |
| GB-h         | penggunaan memory        | gigabyte jam                     | Penggunaan satu gigabyte selama satu jam.                                |
| h/mo         | pecahan waktu            | jam per bulan                    | Jumlah jam dalam satu bulan.                                             |
| rb vCPU-s/mo | pecahan waktu pemrosesan | ribu CPU virtual detik per bulan | Jumlah pemrosesan dengan satu CPU virtual dalam satu detik setiap bulan. |
