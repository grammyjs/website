# Hosting: VPS

Virtual Private Server, atau biasa dikenal dengan VPS, adalah sebuah perangkat virtual yang berjalan di cloud, dimana pemiliknya memiliki kendali penuh atas perangkat tersebut.

Di panduan kali ini, kamu akan mempelajari bagaimana menjalankan bot di sebuah VPS, menjaga bot agar tetap online 24/7, serta memulai bot secara otomatis ketika VPS kamu mengalami crash.

## systemd

systemd adalah sebuah service manager yang sudah terinstal secara bawaan di berbagai distribusi Linux, khususnya yang berbasis Debian.

### Menyiapkan Command Start

1. Memperoleh path lengkap runtime:

```sh
# Jika menggunakan Deno
which deno

# Jika menggunakan Node.js
which node
```

2. Kamu harus tahu path lengkap file entry-nya juga.

3. Command start kamu kurang lebih terlihat seperti ini:

```sh
<path_lengkap_runtime> <opsi> <path_lengkap_file_entry>

# Contoh untuk Deno:
# /home/user/.deno/bin/deno --allow-all /home/user/bot1/mod.ts

# Contoh untuk Node.js:
# /home/user/.nvm/versions/node/v16.9.1/bin/node /home/user/bot1/index.js
```

### Membuat Service

1. Arahkan pointer ke direktori service-nya:

```sh
cd /etc/systemd/system
```

2. Buka file service baru kamu di sebuah text editor:

```sh
nano bot1.service
```

3. Isi dengan konten berikut:

```txt
[Service]
ExecStart=<start_command>
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

> Ganti `<start_command>` dengan command yang telah kamu buat di atas tadi.
>
> Perlu diperhatikan, jika Deno terinstal untuk user selain root, kamu juga perlu menambahkan `User=<nama_user>` di bagian service.
> Untuk informasi lebih lanjut mengenai unit file ini, silahkan kunjungi [halaman berikut](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/configuring_basic_system_settings/assembly_working-with-systemd-unit-files_configuring-basic-system-settings).

3. Mulai ulang systemd setiap kali service mengalami perubahan:

```sh
systemctl daemon-reload
```

### Mengelola Service

#### Start

```sh
systemctl start <service_name>
```

> Ganti `<service_name>` dengan nama file service-nya.
> Contoh: `systemctl start bot1`

#### Jalankan Setiap Kali Melakukan Boot

```sh
systemctl enable <service_name>
```

#### Cek Log

```sh
systemctl status <service_name>
```

#### Restart

```sh
systemctl restart <service_name>
```

#### Stop

```sh
systemctl stop <service_name>
```

#### Jangan Dijalankan ketika Boot Dilakukan

```sh
systemctl disable <service_name>
```

## PM2 (Khusus Node.js)

PM2 adalah sebuah daemon process manager untuk Node.js yang berfungsi untuk menjaga aplikasi kamu online 24/7.

### Pemasangan

```sh
npm install pm2@latest -g

# Jika menggunakan Yarn
yarn global add pm2
```

### Mengatur Aplikasi

#### Start

```sh
pm2 start --name <app_name> <entry_point>
```

> `<app_name>` diisi dengan nama id dari aplikasimu, misalnya: `bot1`.
> `<entry_point>` diisi dengan path index file kamu (file yang menjalankan bot kamu).

#### Restart

Dengan melakukan restart, aplikasimu akan dihentikan, lalu dimulai ulang kembali.

```sh
pm2 restart <app_name>
```

#### Reload

Dengan melakukan reload, kamu akan mengganti proses aplikasi yang sedang berjalan dengan yang baru.
Aksi ini tidak menghasilkan waktu downtime sedikitpun (0 detik waktu downtime).
Langkah ini direkomendasikan untuk aplikasi stateless.

```sh
pm2 reload <app_name>
```

#### Stop

```sh
# Satu aplikasi
pm2 stop <app_name>

# Semua aplikasi
pm2 stop all
```

#### Delete

Dengan melakukan delete, kamu akan menghentikan aplikasi lalu menghapus semua log beserta metric-nya.

```sh
pm2 del <app_name>
```

### Informasi Lanjutan

Untuk informasi lebih lanjut, silahkan lihat <https://pm2.keymetrics.io/docs/usage/quick-start>.
