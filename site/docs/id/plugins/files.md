# Menangani File dengan Mudah di grammY (`files`)

Plugin ini memudahkan kamu untuk mengunduh file dari server Telegram dan memperoleh URL-nya agar kamu dapat mengunduh file tersebut secara mandiri.

## Mengunduh File

Plugin ini memerlukan token bot kamu untuk melakukan autentikasi ketika mengunduh sebuah file.
Jika berhasil, method `download` akan tersedia di hasil pemanggilan `getFile`.
Contohnya,

::::code-group
:::code-group-item TypeScript

```ts
import { Bot, Context } from "grammy";
import { FileFlavor, hydrateFiles } from "@grammyjs/files";

// Transformative Context flavor
type MyContext = FileFlavor<Context>;

// Buat sebuah bot.
const bot = new Bot<MyContext>("");

// Gunakan plugin ini.
bot.api.config.use(hydrateFiles(bot.token));

// Unduh video and GIF ke lokasi sementara.
bot.on([":video", ":animation"], async (ctx) => {
  // Siapkan file yang akan diunduh.
  const file = await ctx.getFile();
  // Unduh file ke lokasi sementara.
  const path = await file.download();
  // Cetak path file-nya.
  console.log("File disimpan di ", path);
});
```

:::
:::code-group-item JavaScript

```js
import { Bot } from "grammy";
import { hydrateFiles } from "@grammyjs/files";

// Buat sebuah bot.
const bot = new Bot("");

// Gunakan plugin ini.
bot.api.config.use(hydrateFiles(bot.token));

// Unduh video and GIF ke lokasi sementara.
bot.on([":video", ":animation"], async (ctx) => {
  // Siapkan file yang akan diunduh.
  const file = await ctx.getFile();
  // Unduh file ke lokasi sementara.
  const path = await file.download();
  // Cetak path file-nya.
  console.log("File disimpan di ", path);
});
```

:::
:::code-group-item Deno

```ts
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  FileFlavor,
  hydrateFiles,
} from "https://deno.land/x/grammy_files/mod.ts";

// Transformative Context flavor
type MyContext = FileFlavor<Context>;

// Buat sebuah bot.
const bot = new Bot<MyContext>("");

// Gunakan plugin ini.
bot.api.config.use(hydrateFiles(bot.token));

// Unduh video and GIF ke lokasi sementara.
bot.on([":video", ":animation"], async (ctx) => {
  // Siapkan file yang akan diunduh.
  const file = await ctx.getFile();
  // Unduh file ke lokasi sementara.
  const path = await file.download();
  // Cetak path file-nya.
  console.log("File disimpan di ", path);
});
```

:::
::::

Kamu bisa memasukkan sebuah string berisi path file ke `download` jika kamu tidak ingin membuat file sementara.
Cukup lakukan `await file.download("/path/ke/file")`.

Jika kamu ingin mendapatkan URL file-nya saja agar kamu bisa mengunduhnya secara mandiri, gunakan `file.getUrl`.
Ia akan mengembalikan sebuah link HTTPS menuju file kamu yang valid selama satu jam.

## Server API Bot Lokal

Jika kamu menggunakan [server API bot lokal](https://core.telegram.org/bots/api#using-a-local-bot-api-server), pemanggilan `getFile` akan mengunduh file tersebut ke disk kamu.

Hasilnya, kamu bisa memanggil `file.getUrl()` untuk mengakses path file tersebut.
Perlu dicatat, `await file.download()` mulai sekarang akan menyalin file yang tersedia secara lokal tersebut ke lokasi sementara (atau ke path yang diberikan jika telah ditentukan).

## Dukungan Pemanggilan `bot.api`

Secara bawaan, hasil dari `await bot.api.getFile()` juga akan dilengkapi dengan method `download` dan `getUrl`.
Namun, method-method ini tidak akan tampak di type tersebut.
Jika kamu membutuhkannya, kamu juga bisa menginstal sebuah [API flavor](../advanced/transformers.md#menggunakan-api-flavor) `FileApiFlavor` di object bot tersebut.

::::code-group
:::code-group-item Node.js

```ts
import { Api, Bot, Context } from "grammy";
import { FileApiFlavor, FileFlavor, hydrateFiles } from "@grammyjs/files";

type MyContext = FileFlavor<Context>;
type MyApi = FileApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");
// ...
```

:::
:::code-group-item Deno

```ts
import { Api, Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  FileApiFlavor,
  FileFlavor,
  hydrateFiles,
} from "https://deno.land/x/grammy_files/mod.ts";

type MyContext = FileFlavor<Context>;
type MyApi = FileApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");
// ...
```

:::
::::

## Ringkasan Plugin

- Nama: `files`
- Sumber: <https://github.com/grammyjs/files>
- Referensi: <https://deno.land/x/grammy_files/mod.ts>
