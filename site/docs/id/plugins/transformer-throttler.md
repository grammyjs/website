# Kontrol Flood (`transformer-throttler`)

Plugin ini menjaga bot kamu agar terhindar dari [rate limit](https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this)---lihat [materi tingkat lanjut berikut](../advanced/flood.md)---dengan cara membuat daftar antrian API request yang keluar menggunakan [Bottleneck](https://github.com/SGrondin/bottleneck).

::: warning Aturan Pembatasan API yang Tidak Didokumentasikan
Telegram juga memiliki beberapa aturan rate limit yang tidak didokumentasikan.
Sayangnya, aturan-aturan tersebut **tidak diperhitungkan** oleh throttler.
Oleh karena itu, kalau kamu mengalami error floodwait untuk beberapa pemanggilan API, misalnya `api.sendContact`, maka kami menyarankan untuk memasang [plugin auto-retry](./auto-retry.md) dan plugin ini secara beriringan.
:::

## Penggunaan

Perlu diketahui, pengaturan opsi bawaan plugin ini menggunakan aturan rate limit asli yang diterapkan oleh Telegram.
Semestinya, pengaturan bawaan tersebut sudah cukup sesuai untuk sebagian besar bot.
Berikut contoh penggunaan plugin ini dengan menggunakan opsi bawaan:

::::code-group
:::code-group-item TypeScript

```ts
import { Bot } from "grammy";
import { run } from "@grammyjs/runner";
import { apiThrottler } from "@grammyjs/transformer-throttler";

const bot = new Bot("");

const throttler = apiThrottler();
bot.api.config.use(throttler);

bot.command("example", (ctx) => ctx.reply("Aku di-throttler."));

// Kalau kamu menggunakan throttler, kemungkinan besar kamu juga ingin
// menggunakan runner untuk menangani update secara bersamaan.
run(bot);
```

:::
:::code-group-item JavaScript

```js
const { Bot } = require("grammy");
const { run } = require("@grammyjs/runner");
const { apiThrottler } = require("@grammyjs/transformer-throttler");

const bot = new Bot("");

const throttler = apiThrottler();
bot.api.config.use(throttler);

bot.command("example", (ctx) => ctx.reply("Aku di-throttler."));

// Kalau kamu menggunakan throttler, kemungkinan besar kamu juga ingin
// menggunakan runner untuk menangani update secara bersamaan.
run(bot);
```

:::
:::code-group-item Deno

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { run } from "https://deno.land/x/grammy_runner/mod.ts";
import { apiThrottler } from "https://deno.land/x/grammy_transformer_throttler/mod.ts";

const bot = new Bot("");

const throttler = apiThrottler();
bot.api.config.use(throttler);

bot.command("example", (ctx) => ctx.reply("Aku di-throttler."));

// Kalau kamu menggunakan throttler, kemungkinan besar kamu juga ingin
// menggunakan runner untuk menangani update secara bersamaan.
run(bot);
```

:::
::::

## Konfigurasi

Throttler ini menerima sebuah argument opsional dalam bentuk berikut:

```ts
type ThrottlerOptions = {
  global?: Bottleneck.ConstructorOptions; // Untuk men-throttler semua pemanggilan api
  group?: Bottleneck.ConstructorOptions; // Untuk men-throttler pesan grup yang keluar
  out?: Bottleneck.ConstructorOptions; // Untuk men-throttler pesan pribadi yang keluar
};
```

Daftar lengkap object property apa saja yang tersedia untuk `Bottleneck.ConstructorOptions` bisa ditemukan di [Bottleneck](https://github.com/SGrondin/bottleneck#constructor).

Jika tidak ada argument yang disertakan, throttler akan menggunakan konfigurasi bawaan.
Berikut konfigurasi bawaannya:

```ts
// Throttler Keluaran Secara Keseluruhan
const globalConfig = {
  reservoir: 30, // jumlah tugas baru yang throttler terima di awal
  reservoirRefreshAmount: 30, // jumlah tugas yang throttler terima setelah diperbarui
  reservoirRefreshInterval: 1000, // rentang waktu pembaruan reservoir dalam milidetik
};

// Throttler Keluaran Grup
const groupConfig = {
  maxConcurrent: 1, // hanya 1 tugas dalam satu waktu
  minTime: 1000, // tunggu sekian milidetik untuk satu tugas
  reservoir: 20, // jumlah tugas baru yang throttler terima di awal
  reservoirRefreshAmount: 20, // jumlah tugas yang throttler terima setelah diperbarui
  reservoirRefreshInterval: 60000, // rentang waktu pembaruan reservoir dalam milidetik
};

// Throttler Keluaran Pribadi
const outConfig = {
  maxConcurrent: 1, // hanya 1 tugas dalam satu waktu
  minTime: 1000, // tunggu sekian milidetik untuk satu tugas
};
```

## Ringkasan Plugin

- Nama: `transformer-throttler`
- Sumber: <https://github.com/grammyjs/transformer-throttler>
- Referensi: <https://deno.land/x/grammy_transformer_throttler/mod.ts>
