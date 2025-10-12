---
prev: false
next: false
---

# Hosting: Deno Deploy

Halaman ini berisi panduan mengenai langkah-langkah meng-hosting bot di [Deno Deploy](https://deno.com/deploy).

Perlu diperhatikan bahwa panduan ini hanya berlaku untuk pengguna Deno.
Kamu diharuskan memiliki akun [GitHub](https://github.com) untuk membuat akun [Deno Deploy](https://deno.com/deploy).

Deno Deploy cocok dipakai untuk bot yang sederhana.
Namun, tidak semua fitur Deno tersedia di Deno Deploy.
Diantaranya adalah [terbatasnya](https://docs.deno.com/deploy/classic/api/runtime-fs/) API file system Deno yang didukung.
Deno Deploy serupa dengan platform serverless lainnya, bedanya ia diperuntukkan untuk aplikasi Deno saja.

Hasil dari tutorial disini dapat dilihat di [repositori bot kami](https://github.com/grammyjs/examples/tree/main/setups/deno-deploy).

## Menyiapkan Kode

> Ingat! Kamu perlu [menjalankan bot dengan webhooks](../guide/deployment-types#bagaimana-cara-menggunakan-webhook), jadi kamu harus menggunakan `webhookCallback` alih-alih memanggil `bot.start()` di kodemu.

1. Pastikan kamu meng-export object bot di dalam sebuah file agar nantinya bisa di-import ketika ingin menjalankannya.
2. Buat sebuah file dengan nama `main.ts` atau `main.js`, ataupun nama lainnya sesuai dengan keinginanmu (tetapi kamu harus mengingatnya karena nanti file tersebut akan digunakan sebagai file deploy utama). File tersebut berisikan:

```ts
import { webhookCallback } from "https://deno.land/x/grammy/mod.ts";
// Kamu mungkin perlu mengubah ini agar dapat melakukan import pada object bot-mu.
import bot from "./bot.ts";

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

Kami menganjurkan kamu untuk menaruh handler di direktori rahasia alih-alih menempatkanya di root (`/`).
Di contoh kali ini, kita menggunakan token bot (`/<token bot>`) sebagai direktori rahasianya.

## Men-deploy Bot

### Metode 1: Menggunakan GitHub

> Metode ini sangat direkomendasikan karena mudah untuk digunakan.
> Kelebihannya adalah Deno Deploy akan selalu memantau perubahan di repositori tempat kamu menaruh kode bot.
> Ketika terjadi perubahan, kode tersebut akan di-deploy secara otomatis ke versi yang lebih baru.

1. Buat sebuah repositori di GitHub, bisa dalam bentuk private ataupun publik.
2. Taruh kodemu di dalam repositori tersebut.

   > Direkomendasikan untuk mempunyai satu branch stabil dan branch lain untuk pengetesan supaya branch utama kamu terhindar dari hal-hal yang tidak diinginkan.

3. Kunjungi [dashboard Deno Deploy](https://dash.deno.com/account/overview).
4. Pilih "New Project".
5. Pasang aplikasi GitHub di akun atau organisasimu, kemudian pilih repositori kode bot kamu berada.
6. Pilih branch yang akan di-deploy.
7. Pilih file `main.ts` sebagai entrypoint, lalu deploy proyek dengan mengklik "Deploy Project".

### Metode 2: Menggunakan `deployctl`

> Metode ini diperuntukkan untuk penggunaan tingkat lanjut atau jika kamu tidak ingin mengunggah kode proyek ke GitHub.
> Melalui cara ini, kamu bisa men-deploy proyek menggunakan command line atau GitHub Actions.

1. Instal [`deployctl`](https://github.com/denoland/deployctl).
2. Buat sebuah token akses di bagian "Access Tokens", [pengaturan akun](https://dash.deno.com/account).
3. Pergi ke direktori proyek, lalu jalankan perintah berikut:

   ```sh:no-line-numbers
   deployctl deploy --project=<project> --entrypoint=./main.ts --prod --token=<token>
   ```

   ::: tip Mengatur environment variable
   Setelah di-deploy, kamu bisa mengatur environment variable di bagian pengaturan proyek.

   Selain melalui pengaturan proyek, kamu juga bisa mengaturnya melalui command line:

   1. Taruh semua environment variable di file dotenv, lalu akses dengan menambahkan argumen `--env-file=<file>`.
   2. Kamu juga bisa menambahkan environment variable satu per satu menggunakan argumen `--env=<key=value>`.

   :::
4. Untuk mengatur GitHub Actions, lihat panduan [berikut](https://github.com/denoland/deployctl/blob/main/action/README.md).

Lihat [dokumentasi deployctl](https://docs.deno.com/deploy/classic/deployctl/) untuk informasi lebih lanjut.

### Catatan

Setelah mendapati bot-mu dapat berjalan, kamu harus melakukan konfigurasi pada pengaturan webhook untuk menggunakan URL bot-mu yang baru.

```sh:no-line-numbers
curl https://api.telegram.org/bot<token>/setWebhook?url=<url>
```

Ganti `<token>` dengan token bot-mu, dan `<url>` dengan URL lengkap bot kamu.
