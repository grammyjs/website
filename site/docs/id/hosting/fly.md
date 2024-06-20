---
prev: false
next: false
---

# Hosting: Fly

Halaman ini berisi panduan mengenai cara-cara meng-hosting bot di [Fly](https://fly.io), baik menggunakan Deno maupun Node.js.

## Menyiapkan Kode

Kamu bisa menjalankan bot menggunakan [webhooks ataupun long polling](../guide/deployment-types).

### Webhooks

> Ingat! Jangan panggil `bot.start()` di kode kamu ketika menggunakan webhooks.

1. Pastikan kamu meng-export object `Bot` di dalam sebuah file agar nantinya bisa di-import ketika ingin menjalankannya.
2. Buat sebuah file dengan nama `app.ts` atau `app.js`, ataupun nama lainnya sesuai dengan keinginanmu (tetapi kamu harus mengingatnya karena nanti file tersebut akan digunakan sebagai file deploy utama). File tersebut berisikan:

::: code-group

```ts{11} [Deno]
import { webhookCallback } from "https://deno.land/x/grammy/mod.ts";
// Kamu mungkin perlu mengubah ini agar object bot-mu bisa di-import.
import { bot } from "./bot.ts";

const port = 8000;
const handleUpdate = webhookCallback(bot, "std/http");

Deno.serve({ port }, async (req) => {
  const url = new URL(req.url);
  if (req.method === "POST" && url.pathname.slice(1) === bot.token) {
    try {
      return await handleUpdate(req);
    } catch (err) {
      console.error(err);
    }
  }
  return new Response();
});
```

```ts{10} [Node.js]
import express from "express";
import { webhookCallback } from "grammy";
// Kamu mungkin perlu mengubah ini agar object bot-mu bisa di-import.
import { bot } from "./bot";

const port = 8000;
const app = express();

app.use(express.json());
app.use(`/${bot.token}`, webhookCallback(bot, "express"));
app.use((_req, res) => res.status(200).send());

app.listen(port, () => console.log(`listening on port ${port}`));
```

:::

Kami menganjurkan kamu untuk menaruh handler di direktori rahasia alih-alih menempatkanya di root (`/`).
Di contoh kali ini, kita menggunakan token bot (`/<token bot>`) sebagai direktori rahasianya (perhatikan baris kode yang disorot).

### Long Polling

Buat sebuah file dengan nama `app.ts` atau `app.js`, ataupun nama lainnya sesuai dengan keinginanmu (tetapi kamu harus mengingatnya karena nanti file tersebut akan digunakan sebagai file deploy utama).
File tersebut berisikan:

::: code-group

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN belum diisi");

const bot = new Bot(token);

bot.command(
  "start",
  (ctx) => ctx.reply("Aku berjalan di Fly menggunakan long polling!"),
);

Deno.addSignalListener("SIGINT", () => bot.stop());
Deno.addSignalListener("SIGTERM", () => bot.stop());

bot.start();
```

```ts [Node.js]
import { Bot } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN belum diisi");

const bot = new Bot(token);

bot.command(
  "start",
  (ctx) => ctx.reply("Aku berjalan di Fly menggunakan long polling!"),
);

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

bot.start();
```

:::

Perhatikan baris kode yang disorot di atas, kita telah mengambil informasi sensitif (token bot kamu) dari environment variables.
Kamu bisa menyimpan informasi tersebut dengan menjalankan perintah berikut:

```sh
flyctl secrets set BOT_TOKEN="AAAA:12345"
```

Dengan cara yang sama, kamu bisa menyimpan informasi sensitif lainnya.
Kunjungi <https://fly.io/docs/reference/secrets/> untuk informasi lebih lanjut mengenai _secrets_ di Fly.

## Men-deploy Bot

### Metode 1: Menggunakan `flyctl`

Metode ini adalah cara yang termudah.

1. Instal [flyctl](https://fly.io/docs/hands-on/install-flyctl) lalu [login](https://fly.io/docs/hands-on/sign-up-sign-in/).
2. Jalankan `flyctl launch` untuk membuat sebuah file `Dockerfile` dan `fly.toml` yang nantinya untuk digunakan saat deployment.
   Tetapi, **JANGAN** di-deploy terlebih dahulu.

   ::: code-group

   ```sh [Deno]
   flyctl launch
   ```

   ```log{10} [Log]
   Creating app in /my/telegram/bot
   Scanning source code
   Detected a Deno app
   ? App Name (leave blank to use an auto-generated name): grammy
   Automatically selected personal organization: CatDestroyer
   ? Select region: ams (Amsterdam, Netherlands)
   Created app grammy in organization personal
   Wrote config file fly.toml
   ? Would you like to set up a Postgresql database now? No
   ? Would you like to deploy now? No
   Your app is ready. Deploy with `flyctl deploy`
   ```

   :::

   ::: code-group

   ```sh [Node.js]
   flyctl launch
   ```

   ```log{12} [Log]
   Creating app in /my/telegram/bot
   Scanning source code
   Detected a NodeJS app
   Using the following build configuration:
         Builder: heroku/buildpacks:20
   ? App Name (leave blank to use an auto-generated name): grammy
   Automatically selected personal organization: CatDestroyer
   ? Select region: ams (Amsterdam, Netherlands)
   Created app grammy in organization personal
   Wrote config file fly.toml
   ? Would you like to set up a Postgresql database now? No
   ? Would you like to deploy now? No
   Your app is ready. Deploy with `flyctl deploy`
   ```

   :::

3. **Deno**: Ubah versi Deno dan hapus `CMD` di dalam file `Dockerfile`.
   Pada contoh di bawah, kami mengubah `DENO_VERSION` menjadi `1.25.2`.

   **Node.js**: Untuk mengubah versi Node.js, kamu perlu menambahkan property `node` ke dalam property `engine` yang berada di dalam file `package.json`.
   Pada contoh di bawah, kami mengubah versi Node.js menjadi `16.14.0`.

   ::: code-group

   ```dockerfile{2,26} [Deno]
   # Dockerfile
   ARG DENO_VERSION=1.25.2
   ARG BIN_IMAGE=denoland/deno:bin-${DENO_VERSION}
   FROM ${BIN_IMAGE} AS bin

   FROM frolvlad/alpine-glibc:alpine-3.13

   RUN apk --no-cache add ca-certificates

   RUN addgroup --gid 1000 deno \
   && adduser --uid 1000 --disabled-password deno --ingroup deno \
   && mkdir /deno-dir/ \
   && chown deno:deno /deno-dir/

   ENV DENO_DIR /deno-dir/
   ENV DENO_INSTALL_ROOT /usr/local

   ARG DENO_VERSION
   ENV DENO_VERSION=${DENO_VERSION}
   COPY --from=bin /deno /bin/deno

   WORKDIR /deno-dir
   COPY . .

   ENTRYPOINT ["/bin/deno"]
   # CMD tidak digunakan
   ```

   ```json [Node.js]{19}
   // package.json
   {
     "name": "grammy",
     "version": "1.0.0",
     "description": "grammy",
     "main": "app.js",
     "author": "itsmeMario",
     "license": "MIT",
     "dependencies": {
       "express": "^4.18.1",
       "grammy": "^1.11.0"
     },
     "devDependencies": {
       "@types/express": "^4.17.14",
       "@types/node": "^18.7.18",
       "typescript": "^4.8.3"
     },
     "engines": {
       "node": "16.14.0"
     }
   }
   ```

   :::

4. Ubah `app` di dalam file `fly.toml`.
   Path `./app.ts` (atau `./app.js` untuk Node.js) pada contoh di bawah mengacu pada direktori file utamanya.
   Kamu mungkin perlu mengaturnya agar sesuai dengan direktori proyek kamu.
   Kalau kamu menggunakan webhooks, pastikan port-nya sama dengan [konfigurasi](#webhooks) yang kamu miliki, dalam hal ini port-nya adalah `8000`.

   ::: code-group

   ```toml [Deno (Webhooks)]{7,11,12}
   # fly.toml
   app = "grammy"
   kill_signal = "SIGINT"
   kill_timeout = 5

   [processes]
   app = "run --allow-net ./app.ts"

   [[services]]
   http_checks = []
   internal_port = 8000
   processes = ["app"]
   protocol = "tcp"
   script_checks = []
   [services.concurrency]
      hard_limit = 25
      soft_limit = 20
      type = "connections"

   [[services.ports]]
      force_https = true
      handlers = ["http"]
      port = 80

   [[services.ports]]
      handlers = ["tls", "http"]
      port = 443

   [[services.tcp_checks]]
      grace_period = "1s"
      interval = "15s"
      restart_limit = 0
      timeout = "2s"
   ```

   ```toml [Deno (Long Polling)]{7}
   # fly.toml
   app = "grammy"
   kill_signal = "SIGINT"
   kill_timeout = 5

   [processes]
   app = "run --allow-net ./app.ts"

   # Hapus semua bagian [[services]] karena kita tidak perlu menyimak HTTP
   ```

   ```toml [Node.js (Webhooks)]{7,11,18,19}
   # fly.toml
   app = "grammy"
   kill_signal = "SIGINT"
   kill_timeout = 5

   [processes]
   app = "node ./build/app.js"

   # Atur environment variable NODE_ENV agar tidak muncul peringatan atau warning
   [build.args]
   NODE_ENV = "production"

   [build]
   builder = "heroku/buildpacks:20"

   [[services]]
   http_checks = []
   internal_port = 8000
   processes = ["app"]
   protocol = "tcp"
   script_checks = []
   [services.concurrency]
      hard_limit = 25
      soft_limit = 20
      type = "connections"

   [[services.ports]]
      force_https = true
      handlers = ["http"]
      port = 80

   [[services.ports]]
      handlers = ["tls", "http"]
      port = 443

   [[services.tcp_checks]]
      grace_period = "1s"
      interval = "15s"
      restart_limit = 0
      timeout = "2s"
   ```

   ```toml [Node.js (Long polling)]{7,11,22,23}
   # fly.toml
   app = "grammy"
   kill_signal = "SIGINT"
   kill_timeout = 5

   [processes]
   app = "node ./build/app.js"

   # Atur environment variable NODE_ENV agar tidak muncul peringatan atau warning
   [build.args]
   NODE_ENV = "production"

   [build]
   builder = "heroku/buildpacks:20"

   # Hapus semua bagian [[services]] karena kita tidak perlu menyimak HTTP
   ```

   :::

5. Jalankan `flyctl deploy` untuk men-deploy kode kamu.

### Metode 2: Dengan GitHub Actions

Kelebihan dari metode ini adalah Fly akan selalu memantau perubahan di repositori tempat kamu menaruh kode bot.
Ketika terjadi perubahan, kode tersebut akan di-deploy secara otomatis ke versi yang lebih baru.
Untuk instruksi detailnya, silahkan kunjungi <https://fly.io/docs/app-guides/continuous-deployment-with-github-actions>.

1. Instal [flyctl](https://fly.io/docs/hands-on/install-flyctl) lalu [login](https://fly.io/docs/hands-on/sign-up-sign-in/).
2. Dapatkan token API Fly dengan cara menjalankan perintah `flyctl auth token`.
3. Buat sebuah repositori di GitHub, bisa berupa privat ataupun publik.
4. Pergi ke Settings, pilih Secrets dan buat sebuah secret bernama `FLY_API_TOKEN` yang berisi nilai atau value token dari langkah ke-2.
5. Buat `.github/workflows/main.yml`, kemudian isi dengan kode berikut:

   ```yml
   name: Fly Deploy
   on: [push]
   env:
   FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
   jobs:
   deploy:
         name: Deploy app
         runs-on: ubuntu-latest
         steps:
         - uses: actions/checkout@v2
         - uses: superfly/flyctl-actions/setup-flyctl@master
         - run: flyctl deploy --remote-only
   ```

6. Ikuti langkah 2 hingga 4 dari [Metode 1](#metode-1-menggunakan-flyctl) di atas.
   Jangan lupa untuk melewati langkah terakhir (step 5) karena kita tidak ingin men-deploy kode secara langsung.
7. Commit perubahan kamu, lalu push ke GitHub.
8. Di sinilah keajaibannya mulai terjadi---push tadi akan memicu sebuah deploy dan mulai sekarang kapanpun kamu melakukan push, kode tersebut akan secara otomatis di deploy ulang.

### Mengatur URL Webhook

Setelah mendapati bot-mu dapat berjalan, kamu harus melakukan konfigurasi pada pengaturan webhook untuk menggunakan URL bot-mu yang baru.
Untuk melakukannya, kirim sebuah request ke

```text
https://api.telegram.org/bot<token>/setWebhook?url=<url>
```

Ganti `<token>` dengan token bot-mu, dan `<url>` dengan URL lengkap bot kamu.

### Optimisasi Dockerfile

Ketika `Dockerfile` kamu dijalankan, ia akan menyalin semua file ke Docker image.
Untuk aplikasi Node.js, beberapa direktori seperti `node_modules` akan dibikin ulang sehingga direktori tersebut tidak perlu disalin.
Untuk melakukannya, buat sebuah file `.dockerignore` lalu tambahkan `node_modules` ke dalamnya.
Kamu juga bisa menggunakan `.dockerignore` untuk mencegah file-file yang tidak diperlukan ikut tersalin saat di runtime.

## Referensi

- <https://fly.io/docs/js/frameworks/deno/>
- <https://fly.io/docs/js/>
