---
prev: false
next: false
---

# Daftar Perbandingan Penyedia Hosting

Ada banyak penyedia hosting yang mengizinkan kamu menjalankan bot di server mereka.
Namun, sering kali kita mengalami kesulitan untuk memperkirakan seberapa mahal dan seberapa bagus performa server yang mereka sediakan.
Itulah kenapa komunitas grammY mengumpulkan review dari beberapa pengguna yang menggunakan penyedia hosting tersebut.

## Apa itu Penyedia Hosting?

Agar bot bisa berjalan selama 24 jam sehari, kamu memerlukan sebuah komputer yang dapat berjalan selama itu juga.
Seperti yang telah [dijelaskan di pengenalan](../guide/introduction#cara-membuat-bot-tetap-berjalan), kamu pasti tidak ingin melakukannya di laptop ataupun pc rumah kamu.
Jadi, kamu perlu menyewa komputer dari suatu perusahaan untuk menjalankan bot di cloud.

Dengan kata lain, kamu menjalankan bot di komputer milik orang lain.

## Tabel Perbandingan

> Silahkan tekan tombol edit di bawah halaman untuk menambahkan penyedia hosting lain atau mengedit daftar yang sudah ada!

Kami menyediakan dua tabel perbandingan: satu untuk [hosting serverless dan PaaS](#serverless-dan-paas) serta satu lagi untuk [VPS](#vps).

### Serverless dan PaaS

Serverless artinya kamu tidak mengontrol perangkat yang menjalankan bot kamu.
Sebaliknya, penyedia hosting-lah yang akan menghidupkan dan mematikan perangkat-perangkat yang dibutuhkan untuk menjalankan kode kamu.
Karena alasan tersebut, akses yang diberikan ke kamu cuma sebatas untuk mengunggah kode yang akan dijalankan.

Selain itu, kamu diharuskan menggunakan [webhooks](../guide/deployment-types) ketika menggunakan serverless.
Kebanyakan penyedia hosting di bawah ini akan mengalami kendala ketika kamu menjalankan bot menggunakan polling (`bot.start()` atau [grammY runner](../plugins/runner)).

Di sisi lain, PaaS (Platform as a Service) menyediakan layanan yang serupa, namun lebih bisa dikontrol.
Misalnya, kamu bisa mengatur jumlah perangkat yang bekerja untuk menjalankan bot kamu.
Menggunakan [polling](../guide/deployment-types) juga bisa di PaaS jika penyedia layanan tersebut memperbolehkan untuk membiarkan salah satu instance berjalan sepanjang waktu.

Serverless dan PaaS memiliki kekurangan yang sama, yaitu tidak memiliki penyimpanan bawaan secara permanen, misalnya sistem file lokal.
Oleh karena itu, biasanya diperlukan database yang terpisah untuk menyimpan data secara permanen.

| Nama                   | Harga (min) | Biaya                                                                                                         | Batasan                                                                                                              | Node.js                                                                                  | Deno                                           | Web                                               | Catatan                                                                                                                                                                   |
| ---------------------- | ----------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deta                   | Gratis      | Belum ada paket yang berbayar                                                                                 | Tidak ada batasan                                                                                                    | ✅                                                                                       | ✅                                             | ✅                                                | Deno bisa dijalankan menggunakan [aplikasi khusus](https://deta.space/docs/en/build/quick-starts/custom) ([contoh](https://github.com/deta/starters/tree/main/deno-app)). |
| Deno Deploy            | Gratis      | Berlangganan $20/bln untuk 5jt req dan 100 GB; $2/1jt req, $0.5/GB koneksi                                    | [1jt req/bln, 100 GB/bln, maksimal 10 ms CPU-time](https://deno.com/deploy/pricing)                                  | ❌                                                                                       | ✅                                             | ❌                                                |                                                                                                                                                                           |
| Fly                    | Gratis      | Berlangganan $1.94/bln untuk shared-cpu-1x dan 256 MB RAM, $0.02/GB koneksi                                   | [3 shared-cpu-1x 256mb VMs, 160GB/mo, kapasitas penyimpanan 3GB](https://fly.io/docs/about/pricing/)                 | ✅                                                                                       | ✅                                             | ❓                                                |                                                                                                                                                                           |
| DigitalOcean Functions | Gratis      | $1.85/100rb GB-s                                                                                              | [90rb GB-s/bln](https://docs.digitalocean.com/products/functions/details/pricing/)                                   | ✅                                                                                       | ❌                                             | ❓                                                |                                                                                                                                                                           |
| Cloudflare Workers     | Gratis      | $5/10jt req                                                                                                   | [100rb req/hari, maksimal 10 ms CPU-time](https://workers.cloudflare.com/)                                           | ❌                                                                                       | [✅](https://denoflare.dev/)                   | ✅                                                |                                                                                                                                                                           |
| Vercel                 | Gratis      | Berlangganan $20/bln                                                                                          | [Pemanggilan tak terbatas, 100 GB-h, maksimal 10 s](https://vercel.com/pricing)                                      | [✅](https://vercel.com/docs/functions/runtimes/node-js)                                 | [✅](https://github.com/vercel-community/deno) | [✅](https://vercel.com/docs/frameworks)          | Tidak ditujukan untuk penggunaan selain website?                                                                                                                          |
| Scaleway Functions     | Gratis      | €0.15/1jt req, €1.2/100rb GB-s                                                                                | [1jt request, 400rb GB-s/bln](https://www.scaleway.com/en/pricing/?tags=serverless-functions-serverlessfunctions)    | ❓                                                                                       | ❓                                             | ❓                                                |                                                                                                                                                                           |
| Scaleway Containers    | Gratis      | €0.10/100rb GB-s, €1.0/100rb vCPU-s                                                                           | [400rb GB-s, 200rb vCPU-s/bln](https://www.scaleway.com/en/pricing/?tags=serverless-containers-serverlesscontainers) | ❓                                                                                       | ❓                                             | ❓                                                |                                                                                                                                                                           |
| Vercel Edge Functions  | Gratis      | Berlangganan $20/bln untuk 500rb                                                                              | [100rb req/hari](https://vercel.com/pricing)                                                                         | [✅](https://vercel.com/docs/functions/runtimes/edge-runtime#compatible-node.js-modules) | ❓                                             | [✅](https://vercel.com/templates/edge-functions) |                                                                                                                                                                           |
| serverless.com         | Gratis      |                                                                                                               |                                                                                                                      | ❓                                                                                       | ❓                                             | ❓                                                |                                                                                                                                                                           |
| Heroku                 | $5          | $5 untuk 1,000 [dyno hours](https://devcenter.heroku.com/articles/usage-and-billing#dyno-usage-and-costs)/bln | [512MB RAM, tidur selama 30 menit jika tidak ada aktivitas](https://www.heroku.com/pricing)                          | ✅                                                                                       | ✅                                             | ❓                                                | Deno bisa dijalankan menggunakan [buildpack pihak ketiga](https://github.com/chibat/heroku-buildpack-deno)                                                                |
| DigitalOcean Apps      | $5          |                                                                                                               |                                                                                                                      | ❓                                                                                       | ❓                                             | ❓                                                | Belum pernah dites                                                                                                                                                        |
| Fastly Compute@Edge    |             |                                                                                                               |                                                                                                                      | ❓                                                                                       | ❓                                             | ❓                                                |                                                                                                                                                                           |
| Zeabur                 | $5          | Berlangganan $5/bln                                                                                           | 2GB RAM, pemanggilan tak terbatas                                                                                    | ✅                                                                                       | ✅                                             | ✅                                                |                                                                                                                                                                           |

### VPS

_Virtual private server_ atau VPS adalah sebuah perangkat virtual yang bisa kamu kontrol sepenuhnya.
Pada umumnya, kamu bisa mengakses VPS melalui [SSH](https://en.wikipedia.org/wiki/Secure_Shell).
Di sana, kamu bisa menginstal berbagai macam software, melakukan pembaruan sistem, dan sebagainya.

Kamu bisa menjalankan bot baik menggunakan long polling ataupun webhooks di sebuah VPS.

Lihat tutorial pemasangan bot ke sebuah VPS [berikut](./vps).

| Nama          | Harga (min) | Ping ke API Bot                           | Pilihan Termurah                   |
| ------------- | ----------- | ----------------------------------------- | ---------------------------------- |
| Hostinger     | $14         |                                           | 1 vCPU, 4 GB RAM, 50 GB SSD, 1 TB  |
| Contabo       |             | 15 ms :de: Nuremberg                      |                                    |
| DigitalOcean  | $5          | 1-15 ms :netherlands: AMS, 19 ms :de: FRA | 1 vCPU, 1 GB RAM, 25 GB SSD, 1 TB  |
| Hetzner Cloud | €4.15       | ~42 ms :de:                               | 1 vCPU, 2 GB RAM, 20 GB SSD, 20 TB |
| IONOS VPS     | €1 atau $2  | 15 ms :de: Baden-Baden                    | 1 vCPU, 0.5 GB RAM, 8 GB SSD       |
| Scaleway      | €~7         |                                           | 2 core, 2 GB RAM, 20 GB SSD        |
| MVPS          | €4          | 6-9 ms :de: Jerman                        | 1 core, 2 GB RAM, 25 GB SSD, 2 TB  |

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
