---
prev: false
---

# Hosting: Deno Deploy

Halaman ini berisi panduan mengenai langkah-langkah meng-hosting bot di [Deno Deploy](https://deno.com/deploy).

Perlu diperhatikan bahwa panduan ini hanya berlaku untuk pengguna Deno.
Kamu diharuskan memiliki akun [GitHub](https://github.com) untuk membuat akun [Deno Deploy](https://deno.com/deploy).

Deno Deploy cocok dipakai untuk bot yang sederhana.
Namun, tidak semua fitur Deno tersedia di Deno Deploy.
Diantaranya adalah [terbatasnya](https://deno.com/deploy/docs/runtime-fs) API file system Deno yang didukung.
Deno Deploy serupa dengan platform serverless lainnya, bedanya ia diperuntukkan untuk aplikasi Deno saja.

Hasil dari tutorial disini dapat dilihat di [repositori bot kami](https://github.com/grammyjs/examples/tree/main/deno-deploy).

## Menyiapkan Kode

> Ingat! Kamu perlu [menjalankan bot dengan webhooks](../guide/deployment-types#bagaimana-cara-menggunakan-webhook), jadi kamu harus menggunakan `webhookCallback` alih-alih memanggil `bot.start()` di kodemu.

1. Pastikan kamu meng-export object bot di dalam sebuah file agar nantinya bisa di-import ketika ingin menjalankannya.
2. Buat sebuah file dengan nama `mod.ts` atau `mod.js`, ataupun nama lainnya sesuai dengan keinginanmu (tetapi kamu harus mengingatnya karena nanti file tersebut akan digunakan sebagai file deploy utama). File tersebut berisikan:

```ts
import { serve } from "https://deno.land/std/http/server.ts";
import { webhookCallback } from "https://deno.land/x/grammy/mod.ts";
// Kamu mungkin perlu mengubah ini agar dapat melakukan import pada object bot-mu.
import bot from "./bot.ts";

const handleUpdate = webhookCallback(bot, "std/http");

serve(async (req) => {
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

3. Kunjungi [dashboard Deno Deploy](https://dash.deno.com/projects).
4. Pilih "New Project", lalu pergi ke bagian "Deploy from GitHub repository".
5. Pasang aplikasi GitHub di akun atau organisasimu, kemudian pilih repositori kode bot kamu berada.
6. Pilih branch dan file `mod.ts` yang akan di-deploy.

### Metode 2: Menggunakan `deployctl`

> Metode ini diperuntukkan kepada pengguna tingkat lanjut yang nantinya proyek akan di-deploy melalui command line atau GitHub Actions.

1. Kunjungi [dashboard Deno Deploy](https://dash.deno.com/projects).
2. Pilih "New Project", kemudian pilih "Empty Project".
3. Pasang [`deployctl`](https://github.com/denoland/deployctl).
4. Buat [token akses](https://dash.deno.com/user/access-tokens) baru.
5. Jalankan dengan perintah:

```sh
deployctl deploy --project <project> ./mod.ts --prod --token <token>
```

6. Untuk menyiapkan GitHub Actions, dapat merujuk ke [sini](https://github.com/denoland/deployctl/blob/main/action/README).

### Metode 3: Menggunakan URL

> Kamu memerlukan URL publik yang mengarah ke file `mod.ts`-mu untuk menggunakan metode ini.

1. Buat proyek baru di Deno Deploy.
2. Pilih "Deploy URL"
3. Masukkan URL publik file `mod.ts`-mu, lalu pilih "Deploy".

### Catatan

Setelah mendapati bot-mu dapat berjalan, kamu harus melakukan konfigurasi pada pengaturan webhook untuk menggunakan URL bot-mu yang baru.

```text
https://api.telegram.org/bot<token>/setWebhook?url=<url>
```

Ganti `<token>` dengan token bot-mu, dan `<url>` dengan URL lengkap bot kamu.
