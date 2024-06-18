---
prev: false
next: false
---

<!-- markdownlint-disable no-duplicate-heading -->

# Hosting: VPS

Virtual Private Server, atau biasa dikenal dengan VPS, adalah sebuah perangkat virtual yang berjalan di cloud, di mana kamu sebagai developer memiliki kendali penuh atas perangkat tersebut.

## Rental Server

> Untuk mengikuti panduan ini, kamu perlu menyewa sebuah server.
> Langkah-langkahnya akan dijelaskan di bagian ini.
> Jika kamu sudah memiliki sebuah VPS, silahkan lanjut ke [bagian selanjutnya](#memulai-bot).

Di panduan ini, kita akan memanfaatkan layanan dari [Hostinger](https://hostinger.com).

> Kamu bebas memilih provider yang kamu mau.
> Karena semua provider menyediakan layanan yang serupa, seharusnya kamu tidak akan menemui masalah selama mengikuti panduan ini.
> Di bagian ini pula kamu bisa mempelajari cara kerja rental server.
> Oleh karena itu, kamu bisa menggunakan panduan ini untuk menyewa server, meski baru pertama kalinya!

::: tip Setara Server
Jika kamu tidak bisa atau tidak ingin menyewa sebuah server tetapi masih ingin mencoba menjalankan bot di sebuah VPS, kamu masih bisa mengikuti tutorial ini dengan menggunakan sebuah virtual machine (VM).
Caranya, gunakan sebuah aplikasi semacam [VirtualBox](https://virtualbox.org).
Kemudian, buat sebuah virtual machine dengan distribusi Linux yang diinginkan untuk menyimulasikan sebuah server Linux.
:::

Kunjungi [halaman Hosting VPS](https://hostinger.com/vps-hosting).
Kita akan memilih paket "KVM 1".
Sumber daya yang disediakan oleh "KVM 1" cukup sesuai untuk bot dengan jumlah pengguna yang masif, apalagi hanya untuk mengetes bot.

Klik tombol "Add to cart".
Kamu nanti akan diarahkan ke halaman checkout dan akun Hostinger-mu akan dibuat secara otomatis.

::: warning Ubah Jangka Waktu Sewa!
Jangka waktu penyewaan umumnya berkisar antara 1-2 tahun (taktik pemasaran) yang biayanya sangat mahal.
Jika dirasa terlalu lama, kamu bisa menyewanya untuk sebulan saja dengan harga yang jauh lebih murah.

Terlebih lagi, Hostinger menyediakan jaminan uang kembali dalam 30 hari.
:::

Setelah melakukan pembayaran, kamu bisa mulai mengatur server-nya:

1. **Lokasi**.
   Server utama API Bot berlokasi di kota Amsterdam, Belanda.
   Oleh karena itu, kami menyarankan untuk [memilih lokasi](../guide/api#memilih-lokasi-data-center) yang paling dekat dengan kota tersebut.
   Tetapi, kalau kamu menggunakan [server API Bot sendiri](../guide/api#menjalankan-server-api-bot-lokal), pilih lokasi terdekat dengan server tersebut.
2. **Jenis server**.
   Pilih "Clean OS".
3. **Sistem operasi**.
   Kita akan menggunakan Ubuntu 22.04.
   Jika memilih sistem yang berbeda, kamu perlu berhati-hati, karena ada kemungkinan langkah-langkahnya akan berbeda pula.
4. **Nama server**.
   Pilih sesukamu.
5. **Kata sandi root**.
   Buat sebuah kata sandi yang kuat lalu simpan di tempat yang aman!
6. **Kunci SSH**.
   Lewati langkah ini.
   Kita akan menyetel kunci SSH [nanti](#kunci-ssh).

Setelah server dibuat, kamu bisa menyambungkannya menggunakan SSH:

> SSH (_Secure Shell_) adalah sebuah protokol jaringan yang bisa digunakan untuk mengontrol sebuah komputer dari jarak jauh.

```sh
ssh root@<alamat-ip>
```

Ganti `<alamat-ip>` dengan alamat IP server kamu, yang bisa ditemukan di halaman pengaturan server (server management).

::: tip Mengatur SSH
Memilah alamat IP yang diperlukan untuk menyambung ke suatu server akan sangat merepotkan.
Untuk menghilangkan repetisi tersebut, kamu bisa mengatur SSH dengan membuat sebuah file `~/.ssh/config`(<https://linuxhandbook.com/ssh-config-file>) di komputer kamu yang memuat semua data yang diperlukan agar bisa tersambung ke server terkait berdasarkan nilai identifikasi yang telah ditentukan.
Karena topik tersebut di luar cakupan dari pembahasan artikel ini, maka kamu perlu menyetelnya secara mandiri.
:::

::: tip Pisahkan User untuk Setiap Aplikasi
Di panduan ini, semua aksi yang diterapkan ke server akan dilakukan sebagai user root.
Tindakan tersebut sengaja dilakukan untuk mempersingkat panduan ini.
Tetapi, pada kenyataanya, user root seharusnya hanya bertanggung jawab atas service umum (web server, database, dsb.), sedangkan untuk aplikasi dilakukan oleh user non-root.
Dengan model pendekatan tersebut, keamanan data bisa terjamin dan peretasan ke seluruh sistem juga bisa dicegah.
Di sisi lain, pendekatan semacam itu menimbulkan beberapa ketidaknyamanan.
Kami tidak akan membahasnya secara terperinci agar artikel ini tidak semakin rumit.
:::

## Memulai Bot

Kita sekarang memiliki sebuah server yang dapat digunakan untuk menjalankan bot sepanjang waktu.

Untuk menyingkat waktu, kita akan melewatkan langkah pengiriman kode ke server secara otomatis setiap kali kode kamu selesai di-push, yang mana telah dijelaskan [di bawah ini](#ci-cd).

Untuk sementara, kamu bisa menyalin file lokal ke server secara manual menggunakan perintah berikut.
Perlu dicatat bahwa karena flag `-r` menyalin secara rekursif, maka kamu hanya perlu menentukan direktori root proyek kamu:

```sh
scp -r <path-ke-root-proyek-lokal> root@<alamat-ip>:<path-ke-direktori-tujuan>
```

Ganti `<path-ke-root-proyek-lokal>` dengan path direktori proyek yang ada di disk lokal kamu, `<alamat-ip>` dengan alamat IP server kamu, dan `<path-ke-direktori-tujuan>` dengan path direktori server, tempat di mana source code bot kamu seharusnya disimpan.

Seperti yang telah dijelaskan di atas, kamu sekarang seharusnya sudah bisa membuka terminal VPS dari jarak jauh dengan memulai sebuah sesi SSH.

```sh
ssh root@<alamat-ip>
```

Coba perhatikan bagaimana tampilan command prompt-mu telah berubah.
Itu artinya kamu telah tersambung ke perangkat tersebut secara jarak jauh.
Mulai sekarang, setiap perintah yang diketik akan dijalankan di VPS kamu.
Coba jalankan `ls` untuk memastikan apakah semua file source code kamu berhasil disalin.

Mulai dari sini, kami akan berasumsi bahwa kamu berhasil tersambung ke VPS.
Artinya, semua perintah berikut harus dijalankan di dalam sebuah sesi SSH.

:::tip Jangan lupa untuk menginstal runtime!
Agar bot bisa berjalan, kamu perlu menginstal baik Node.js ataupun Deno di server, tergantung runtime mana yang akan digunakan oleh bot.
Karena di luar topik pembahasan, kamu perlu melakukannya secara mandiri.
Kamu mungkin sudah pernah melakukannya saat [mulai membuat bot](../guide/getting-started), seharusnya kamu sudah paham dengan langkah-langkahnya. :wink:
:::

Salah satu dari dua cara di bawah ini: [systemd](#systemd) atau [PM2](#pm2), dapat kamu gunakan agar bot bisa berjalan secara optimal.

### systemd

systemd merupakan pengelola service yang terinstal secara bawaan di mayoritas distribusi Linux, khususnya yang berbasis Debian seperti Ubuntu.

#### Menyiapkan Perintah Mulai

1. Peroleh path absolut runtime:

   ::: code-group

   ```sh [Deno]
   which deno
   ```

   ```sh [Node.js]
   which node
   ```

   :::

2. Peroleh path absolut direktori bot.

3. Perintah permulaan kamu semestinya serupa dengan ini:

   ```sh
   <path_runtime> <opsi> <path_relatif_file_utama>

   # Path direktori bot: /home/user/bot1/

   # Contoh untuk Deno:
   # /home/user/.deno/bin/deno --allow-all run mod.ts

   # Contoh untuk Node.js:
   # /home/user/.nvm/versions/node/v16.9.1/bin/node index.js
   ```

#### Membuat Service

1. Pergi ke direktori service:

   ```sh
   cd /etc/systemd/system
   ```

2. Buka file service baru kamu menggunakan editor:

   ```sh
   nano <nama-aplikasi>.service
   ```

   > Ganti `<nama-aplikasi>` dengan nama apapun.
   > `<nama-aplikasi>` nantinya akan menjadi nama service kamu.

3. Isi dengan konten berikut:

   ```text
   [Unit]
   After=network.target

   [Service]
   WorkingDirectory=<path-direktori-bot>
   ExecStart=<perintah-mulai>
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   ```

   Ganti `<path-direktori-bot>` dengan path absolut direktori bot kamu dan `<perintah-mulai>` dengan perintah yang kamu terima [di atas tadi](#menyiapkan-perintah-mulai).

   Berikut uraian singkat konfigurasi service di atas:

   - `After=network.target` --- mengindikasikan bahwa aplikasi harus dijalankan hanya setelah modul internet telah dimuat.
   - `WorkingDirectory=<path-direktori-bot>` --- menyetel path pemrosesan ke direktori yang saat ini dikerjakan.
     Dengan begitu, kamu jadi bisa menggunakan file aset relatif dari path tersebut, contohnya file `.env`, yang mana berisi semua _environment variable_ yang dibutuhkan.
   - `ExecStart=<perintah-mulai>` --- menyetel perintah permulaan (startup command).
   - `Restart=on-failure` --- mengindikasikan bahwa aplikasi harus dimulai ulang ketika terjadi kesalahan atau crash.
   - `WantedBy=multi-user.target` --- menentukan pada tahap sistem (system state) apa service mesti dijalankan.
     `multi-user.target` --- salah satu tahap sistem yang umum digunakan di sebuah server.

   > Untuk informasi lebih lanjut mengenai file unit, silahkan baca [dokumentasi ini](https://access.redhat.com/documentation/te-in/red_hat_enterprise_linux/9/html/using_systemd_unit_files_to_customize_and_optimize_your_system/assembly_working-with-systemd-unit-files_working-with-systemd).

4. Muat ulang systemd setiap kali kamu mengedit service terkait.

   ```sh
   systemctl daemon-reload
   ```

#### Mengelola Service

```sh
# Ganti `<nama-service>` dengan nama file service yang telah kamu buat.

# Untuk memulai service
systemctl start <nama-service>

# Untuk melihat log service
journalctl -u <nama-service>

# Untuk memulai ulang service
systemctl restart <nama-service>

# Untuk menghentikan service
systemctl stop <nama-service>

# Untuk mengaktifkan service agar ia dimulai ketika server boot
systemctl enable <nama-service>

# Untuk menonaktifkan service agar ia tidak dimulai ketika server boot
systemctl disable <nama-service>
```

Setelah memulai service tersebut, bot kamu seharusnya sudah bisa berjalan!

### PM2

[PM2](https://pm2.keymetrics.io) adalah pengelola proses daemon untuk Node.js yang akan membantu kamu untuk menjaga aplikasi tetap online sepanjang waktu.

PM2 didesain secara khusus untuk mengelola aplikasi yang ditulis untuk Node.js.
Meski begitu, ia juga bisa digunakan untuk mengelola aplikasi yang ditulis untuk bahasa atau runtime lain.

#### Menginstal

::: code-group

```sh [NPM]
npm install -g pm2
```

```sh [Yarn]
yarn global add pm2
```

```sh [pnpm]
pnpm add -g pm2
```

:::

#### Membuat Aplikasi

PM2 menawarkan dua cara untuk membuat sebuah aplikasi:

1. Menggunakan command line interface (CLI).
2. Menggunakan [file konfigurasi](https://pm2.keymetrics.io/docs/usage/application-declaration).

Cara pertama lebih mudah digunakan untuk yang baru pertama kali mengenal PM2.
Namun, selama proses produksi atau deployment, kamu harus menggunakan cara kedua, yang akan kita terapkan di panduan ini.

Buat sebuah file `ecosystem.config.js` di direktori server tempat di mana hasil build bot kamu disimpan, lalu isi dengan konten berikut:

```js
module.exports = {
  apps: [{
    name: "<nama-aplikasi>",
    script: "<perintah-mulai>",
  }],
};
```

Ubah `<nama-aplikasi>` dengan nama apapun dan `<perintah-mulai>` dengan perintah untuk memulai bot-nya.

#### Mengelola Aplikasi

Di bawah ini perintah yang bisa kamu gunakan untuk mengontrol aplikasi terkait.

```sh
# Jika file `ecosystem.config.js` berada di direktori saat ini,
# kamu tidak perlu menulis apapun untuk memulai aplikasinya.
# Jika aplikasi sedang berjalan, perintah ini akan memuat ulang aplikasinya.
pm2 start

# Semua perintah berikut mengharuskan kamu untuk menyertakan nama aplikasi
# atau file `ecosystem.config.js`-nya.
# Untuk menerapkan aksi ke semua aplikasi, sertakan `all`.

# Untuk memulai ulang aplikasi
pm2 restart <nama-aplikasi>

# Untuk memuat ulang aplikasi
pm2 reload <nama-aplikasi>

# Untuk menghentikan aplikasi
pm2 stop <nama-aplikasi>

# Untuk menghapus aplikasi
pm2 delete <nama-aplikasi>
```

#### Menyimpan Operasi Aplikasi

Ketika server dimulai ulang, bot kamu akan berhenti bekerja.
Agar bot bisa berjalan lagi setelah server dimulai ulang, kamu perlu mengatur PM2.

Di terminal server, jalankan perintah berikut:

```sh
pm2 startup
```

Kamu akan disajikan sebuah perintah yang harus kamu eksekusi untuk membuat PM2 memulai secara otomatis setelah server dimulai ulang.

Jika perintah yang tertera sudah dijalankan, jalankan satu perintah lagi:

```sh
pm2 save
```

Perintah tersebut akan menyimpan daftar aplikasi saat ini agar mereka bisa dijalankan setelah server dimulai ulang.

Jika kamu baru saja membuat sebuah aplikasi baru dan ingin menyimpannya juga, cukup jalankan `pm2 save` lagi.

## Menjalankan Bot dengan Webhook

Untuk menjalankan bot dengan webhook, kamu memerlukan sebuah web framework dan **TIDAK** memanggil `bot.start()`.

Berikut sampel kode untuk menjalankan bot menggunakan webhook yang bisa kamu tambahkan ke file utama bot:

::: code-group

```ts [Node.js]
import { webhookCallback } from "grammy";
import { fastify } from "fastify";

const server = fastify();

server.post(`/${bot.token}`, webhookCallback(bot, "fastify"));

server.listen();
```

```ts [Deno]
import { webhookCallback } from "https://deno.land/x/grammy/mod.ts";

const handleUpdate = webhookCallback(bot, "std/http");

Deno.serve(async (req) => {
  if (req.method === "POST") {
    const url = new URL(req.url);
    if (url.pathname.slice(1) === bot.token) {
      try {
        return await handleUpdate(req);
      } catch (err) {
        console.error(err);
      }
    }
  }
  return new Response();
});
```

:::

### Rental Domain

Untuk menyambungkan bot yang berjalan dengan webhook ke dunia luar, kamu perlu membeli sebuah domain.
Kami sekali lagi akan menggunakan Hostinger sebagai contoh, meski begitu terdapat banyak sekali provider di luar sana yang menawarkan layanan yang serupa.

Pergi ke [halaman pencarian nama domain](https://www.hostinger.com/domain-name-search).
Di kolom isian teks, masukkan nama domain yang diinginkan dengan format `<nama>.<zona>`.
Contohnya, `example.com`.

Jika nama domain-nya tersedia, klik tombol "Add" yang ada di sebelahnya.
Kamu kemudian akan otomatis diarahkan ke halaman checkout, yang mana kamu akan dibuatkan akun Hostinger baru jika sebelumnya belum terdaftar.
Terakhir, bayar domain-nya.

#### Mengarahkan Domain ke VPS

Sebelum domain bisa digunakan bersama VPS kamu, kamu perlu mengarahkan domain tersebut ke server kamu terlebih dahulu.
Caranya, di [Kontrol Panel Hostinger](https://hpanel.hostinger.com), klik tombol "Manage" yang berada di sebelah domain kamu.
Kemudian, pergi ke halaman pengelola record DNS dengan cara mengklik tombol "DNS / Name Servers" di menu yang berada di sebelah kiri.

> Cari tahu IP address VPS-mu terlebih dahulu.

Di daftar record DNS, cari record dengan tipe `A` yang memiliki nama `@`.
Ubah record tersebut dengan mengubah alamat IP di kolom "Points to" ke IP address VPS kamu, lalu atur TTL-nya menjadi 3600.

Selanjutnya, cari dan hapus record dengan tipe `CNAME` yang memiliki nama `www`.
Sebagai gantinya, buat sebuah record tipe `A` baru dengan nama `www`, lalu arahkan ke IP address VPS-mu, kemudian atur TTL-nya menjadi 3600.

> Jika kamu mengalami kendala, coba gunakan metode lain yang telah dijabarkan di [pengetahuan dasar berikut](https://support.hostinger.com/en/articles/1583227-how-to-point-a-domain-to-your-vps).

### Menyiapkan Web Server

Agar website dapat bekerja, dan bot bisa mulai menerima update dari Telegram, kamu perlu menyiapkan sebuah web server.
Di kesempatan kali ini, kita akan menggunakan [Caddy](https://caddyserver.com).

Caddy sebuah sebuah web server berbasis sumber terbuka (open source) yang memiliki fitur HTTPS secara otomatis.

::: tip Web Server
Kita menggunakan Caddy karena ia mampu mengatur sertifikat SSL secara otomatis, salah satu kelebihan yang tidak dimiliki oleh web server lain pada umumnya seperti Nginx atau Apache.
Fitur tersebut tentunya akan mempermudah artikel ini.
Meski demikian, kamu bebas memilih web server yang kamu mau.
:::

#### Penginstalan

Lima perintah berikut akan secara otomatis mendownload serta memulai Caddy sebagai service systemd dengan nama `caddy`.

```sh
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install caddy
```

> Lihat [panduan penginstalan Caddy](https://caddyserver.com/docs/install) untuk opsi penginstalan lainnya.

Cek status Caddy:

```sh
systemctl status caddy
```

::: details Sidik Gangguan
Beberapa penyedia hosting menawarkan VPS yang didalamnya sudah terinstal web server, misalnya [Apache](https://httpd.apache.org).
Satu perangkat tidak bisa menjalankan lebih dari satu web server di waktu bersamaan.
Agar Caddy dapat bekerja dengan baik, kamu perlu menghentikan dan menonaktifkan web server lainnya:

```sh
systemctl stop <nama-service>
systemctl disable <nama-service>
```

Ganti `nama-service` dengan nama service web server yang menghalangi Caddy.

:::

Sekarang, jika kamu membuka alamat IP server kamu di browser, kamu akan melihat halaman yang berisi petunjuk untuk menyetel Caddy.

#### Penyetelan

Agar Caddy bisa memproses request yang datang ke domain, kita perlu mengganti konfigurasi Caddy-nya.

Jalankan perintah berikut untuk membuka file konfigurasi Caddy:

```sh
nano /etc/caddy/Caddyfile
```

Kemudian, kamu akan melihat konfigurasi bawaan berikut:

```text
# The Caddyfile is an easy way to configure your Caddy web server.
#
# Unless the file starts with a global options block, the first
# uncommented line is always the address of your site.
#
# To use your own domain name (with automatic HTTPS), first make
# sure your domain's A/AAAA DNS records are properly pointed to
# this machine's public IP, then replace ":80" below with your
# domain name.

:80 {
  # Set this path to your site's directory.
  root * /usr/share/caddy

  # Enable the static file server.
  file_server

  # Another common task is to set up a reverse proxy:
  # reverse_proxy localhost:8080

  # Or serve a PHP site through php-fpm:
  # php_fastcgi localhost:9000
}

# Refer to the Caddy docs for more information:
# https://caddyserver.com/docs/caddyfile
```

Agar bot bisa bekerja dengan baik, atur konfigurasinya menjadi seperti ini:

```text
<domain> {
  reverse_proxy /<token> localhost:<port>
}
```

Ganti `<domain>` dengan domain kamu, `<token>` dengan token bot kamu, dan `<port>` dengan port yang akan digunakan oleh bot kamu.

Muat ulang Caddy setiap kali kamu mengubah file pengaturan situs menggunakan perintah berikut:

```sh
systemctl reload caddy
```

Sekarang semua request yang mengarah ke alamat `https://<domain>/<token>` akan diarahkan ke alamat `http://localhost:<port>/<token>`, tempat di mana webhook bot berjalan.

#### Menyambungkan Webhook ke Telegram

Yang perlu kamu lakukan adalah memberi tahu Telegram ke mana update semestinya dikirim.
Caranya, buka browser, lalu kunjungi halaman yang berada di link berikut:

```text
https://api.telegram.org/bot<token>/setWebhook?url=https://<domain>/<token>
```

Ganti `<token>` dengan token bot kamu dan `<domain>` dengan domain kamu.

## CI/CD

[CI/CD](https://about.gitlab.com/topics/ci-cd) merupakan salah satu bagian yang krusial dalam proses pengembangan software modern.
Panduan ini mencangkup hampir keseluruhan [pipeline CI/CD](https://about.gitlab.com/topics/ci-cd/cicd-pipeline).

Kali ini, kita akan fokus menulis script untuk GitHub dan GitLab.
Jika diperlukan, kamu bisa dengan mudah memodifikasi contoh di bawah sesuai dengan layanan CI/CD yang kamu gunakan, misalnya Jenkins, Buddy, dsb.

### Kunci SSH

Untuk mengirim file ke server, kamu perlu menyiapkan autentikasi nir-kata-sandi (passwordless authentication), yang diimplementasikan menggunakan kunci SSH.

Jalankan perintah berikut di komputer pribadimu.

Arahkan ke direktori kunci SSH:

```sh
cd ~/.ssh
```

Buat sepasang kunci baru:

::: code-group

```sh [GitHub]
ssh-keygen -t rsa -m PEM
```

```sh [GitLab]
ssh-keygen -t ed25519
```

:::

Perintah berikut akan menghasilkan satu kunci publik dan satu kunci privat berdasarkan tipe dan format yang telah ditentukan di atas, baik untuk Github maupun Gitlab.
Kamu juga bisa mengubah nama kuncinya sesuai dengan keinginan.

Selanjutnya, kirim kunci **publik** tersebut ke server:

```sh
ssh-copy-id -i <nama-kunci>.pub root@<alamat-ip>
```

Ganti `<nama-kunci>` dengan nama kunci yang telah dihasilkan sebelumnya dan `<alamat-ip>` dengan alamat IP server kamu.

Perlu dicatat bahwa kunci **publik** boleh ditaruh di banyak server, sedangkan kunci **privat** sebaiknya disimpan hanya untuk diri sendiri dan GitHub ataupun Gitlab.

Kamu sekarang bisa tersambung ke server tanpa memasukkan password.

### Contoh Alur Kerja

#### Node.js (GitHub)

Gunakan

```yml
name: Main

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v3
        with:
          node-version: "latest"
      - run: npm ci
      - name: Build
        run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: source
          path: |
            dist/*.js
            package.json
            package-lock.json
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v3
        with:
          name: source
          path: dist/
      - name: Deploy
        uses: easingthemes/ssh-deploy@v4
        env:
          SOURCE: "dist package.json package-lock.json"
          ARGS: "--delete -az"
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: "<direktori-tujuan>"
          SCRIPT_AFTER: |
            cd <direktori-tujuan>
            npm i --omit=dev
            <perintah-mulai>
```

Ganti `<direktori-tujuan>` dengan nama direktori hasil build bot yang disimpan di server, dan `<perintah-mulai>` dengan perintah untuk memulai bot kamu, misalnya berupa pemanggilan `pm2` atau `systemctl`.

Script di atas secara berurutan melakukan dua tugas (task): `build` dan `deploy`.
Setelah `build` dieksekusi, hasil (artifact) dari task ini, yaitu direktori `dist` yang berisi hasil build bot, akan diteruskan ke task `deploy`.

File akan dikirim ke server menggunakan `rsync`, yang diimplementasikan oleh `easingthemes/ssh-deploy`.
Setelah file selesai dikirim, perintah yang telah dijabarkan di environment variable `SCRIPT_AFTER` akan dieksekusi.
Dalam kasus kita, setelah file selesai dikirim, ia akan menuju ke direktori bot, tempat di mana kita menginstal semua dependency selain yang berada di `devDependencies`, yang selanjutnya disambung dengan memulai ulang bot-nya.

Perlu dicatat bahwa kamu perlu menambahkan tiga [secret environment variable](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

1. `SSH_PRIVATE_KEY` --- tempat di mana kunci SSH yang telah kamu buat di [langkah sebelumnya](#kunci-ssh) seharusnya disimpan.
2. `REMOTE_HOST` --- simpan alamat IP server kamu di sini.
3. `REMOTE_USER` --- simpan nama user yang bertanggung jawab menjalankan bot di sini.

#### Node.js (GitLab)

Gunakan

```yml
image: node:latest

stages:
  - build
  - deploy

Build:
  stage: build
  before_script: npm ci
  script: npm run build
  artifacts:
    paths:
      - dist/

Deploy:
  stage: deploy
  before_script:
    - "command -v ssh-agent >/dev/null || ( apt-get update -y && apt-get install openssh-client -y )"
    - "command -v rsync >/dev/null || ( apt-get update -y && apt-get install rsync -y )"
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - ssh-keyscan "$REMOTE_HOST" >> ~/.ssh/known_hosts
    - chmod 644 ~/.ssh/known_hosts
  script:
    - rsync --delete -az dist package.json package-lock.json $REMOTE_USER@$REMOTE_HOST:<direktori-tujuan>
    - ssh $REMOTE_USER@$REMOTE_HOST "cd <direktori-tujuan> && npm i --omit=dev && <perintah-mulai>"
```

Ganti `<direktori-tujuan>` dengan nama direktori hasil build bot yang disimpan di server, dan `<perintah-mulai>` dengan perintah untuk memulai bot kamu, misalnya berupa pemanggilan `pm2` atau `systemctl`.

Script di atas secara berurutan melakukan dua tugas (task): `build` dan `deploy`.
Setelah `build` dieksekusi, hasil (artifact) dari task ini, yaitu direktori `dist` yang berisi hasil build bot, akan diteruskan ke task `deploy`.

File akan dikirim ke server menggunakan `rsync`, yang mana kita perlu menginstalnya terlebih dahulu sebelum script utama dieksekusi.
Setelah file selesai dikirim, kita akan menyambung ke server menggunakan SSH untuk menginstal semua dependency selain yang berada di `devDependencies`, yang selanjutnya disambung dengan memulai ulang aplikasinya.

Perlu dicatat bahwa kamu perlu menambahkan tiga [environment variable](https://docs.gitlab.com/ee/ci/variables):

1. `SSH_PRIVATE_KEY` --- tempat di mana kunci SSH yang telah kamu buat di [langkah sebelumnya](#kunci-ssh) seharusnya disimpan.
2. `REMOTE_HOST` --- simpan alamat IP server kamu di sini.
3. `REMOTE_USER` --- simpan nama user yang bertanggung jawab menjalankan bot di sini.

#### Deno (GitHub)

Gunakan

```yml
name: Main

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - name: Deploy
        uses: easingthemes/ssh-deploy@v4
        env:
          SOURCE: "src deno.jsonc deno.lock"
          ARGS: "--delete -az"
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: "<direktori-tujuan>"
          SCRIPT_AFTER: |
            cd <direktori-tujuan>
            <perintah-mulai>
```

Ganti `<direktori-tujuan>` dengan nama direktori hasil build bot yang disimpan di server, dan `<perintah-mulai>` dengan perintah untuk memulai bot kamu, misalnya berupa pemanggilan `pm2` atau `systemctl`.

Script di atas akan mengirim file ke server menggunakan `rsync`, yang diimplementasikan oleh `easingthemes/ssh-deploy`.
Setelah file selesai dikirim, perintah yang telah dijabarkan di environment variable `SCRIPT_AFTER` akan dieksekusi.
Dalam kasus kita, setelah file selesai dikirim, ia akan menuju ke direktori bot, lalu memulai ulang bot-nya.

Perlu dicatat bahwa kamu perlu menambahkan tiga [secret environment variable](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

1. `SSH_PRIVATE_KEY` --- tempat di mana kunci SSH yang telah kamu buat di [langkah sebelumnya](#kunci-ssh) seharusnya disimpan.
2. `REMOTE_HOST` --- simpan alamat IP server kamu di sini.
3. `REMOTE_USER` --- simpan nama user yang bertanggung jawab menjalankan bot di sini.

#### Deno (GitLab)

Gunakan

```yml
image: denoland/deno:latest

stages:
  - deploy

Deploy:
  stage: deploy
  before_script:
    - "command -v ssh-agent >/dev/null || ( apt-get update -y && apt-get install openssh-client -y )"
    - "command -v rsync >/dev/null || ( apt-get update -y && apt-get install rsync -y )"
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - ssh-keyscan "$REMOTE_HOST" >> ~/.ssh/known_hosts
    - chmod 644 ~/.ssh/known_hosts
  script:
    - rsync --delete -az src deno.jsonc deno.lock $REMOTE_USER@$REMOTE_HOST:<direktori-tujuan>
    - ssh $REMOTE_USER@$REMOTE_HOST "cd <direktori-tujuan> && npm i --omit=dev && <perintah-mulai>"
```

Ganti `<direktori-tujuan>` dengan nama direktori hasil build bot yang disimpan di server, dan `<perintah-mulai>` dengan perintah untuk memulai bot kamu, misalnya berupa pemanggilan `pm2` atau `systemctl`.

File akan dikirim ke server menggunakan `rsync`, yang mana kita perlu menginstalnya terlebih dahulu.
Setelah file selesai disalin, kita akan menyambung ke server menggunakan SSH untuk memulai ulang bot-nya.

Perlu dicatat bahwa kamu perlu menambahkan tiga [environment variable](https://docs.gitlab.com/ee/ci/variables):

1. `SSH_PRIVATE_KEY` --- tempat di mana kunci SSH yang telah kamu buat di [langkah sebelumnya](#kunci-ssh) seharusnya disimpan.
2. `REMOTE_HOST` --- simpan alamat IP server kamu di sini.
3. `REMOTE_USER` --- simpan nama user yang bertanggung jawab menjalankan bot di sini.

Sekarang, seharusnya kamu bisa melihat bagaimana setiap kode yang di-push ke branch `main` akan secara otomatis di-deploy ke VPS kamu.
Proses development jadi sat-set-sat-set :rocket:
