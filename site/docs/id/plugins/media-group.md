# Kelompok Media (bawaan)

Plugin pengelompokan media atau media group berfungsi untuk mengirim kumpulan media melalui object `InputMedia`.
Object `InputMedia` juga digunakan ketika mengubah pesan media, sehingga secara tidak langsung plugin ini juga membantu kamu mengubah suatu media.

Perlu diingat, object `InputMedia` telah dijelaskan [di sini](https://core.telegram.org/bots/api#inputmedia).

## Membuat Sebuah Object `InputMedia`

Kamu bisa menggunakan plugin dengan cara seperti ini:

::::code-group
:::code-group-item TypeScript

```ts
import { InputMediaBuilder } from "grammy";

const photo = InputMediaBuilder.photo(new InputFile("/tmp/foto.mp4"));
const video = InputMediaBuilder.video(new InputFile("/tmp/video.mp4"));
// dst
```

:::
:::code-group-item JavaScript

```js
const { InputMediaBuilder } = require("grammy");

const photo = InputMediaBuilder.photo(new InputFile("/tmp/foto.mp4"));
const video = InputMediaBuilder.video(new InputFile("/tmp/video.mp4"));
// dst
```

:::
:::code-group-item Deno

```ts
import { InputMediaBuilder } from "https://deno.land/x/grammy/mod.ts";

const photo = InputMediaBuilder.photo(new InputFile("/tmp/foto.mp4"));
const video = InputMediaBuilder.video(new InputFile("/tmp/video.mp4"));
// dst
```

:::
::::

Lihat semua method `InputMediaBuilder` yang tersedia di [referensi API](https://deno.land/x/grammy/mod.ts?s=InputMediaBuilder).

Kamu juga bisa meneruskan URL publik secara langsung yang nantinya akan diunduh oleh Telegram.

```ts
const photo = InputMediaBuilder.photo("https://grammy.dev/images/Y.png");
```

Opsi lanjutan bisa disertakan di akhir dalam bentuk sebuah object opsi.

```ts
const photo = InputMediaBuilder.photo("https://grammy.dev/images/Y.png", {
  caption: "grammY sangat mengagumkan",
  // dst
});
```

## Mengirim Kumpulan Media

Kamu bisa mengirim kumpulan media seperti berikut:

```ts
await ctx.replyWithMediaGroup([photo0, photo1, photo2, video]);
```

Selain itu, kamu bisa meneruskan sebuah array object `InputMedia` ke `ctx.api.sendMediaGroup` atau `bot.api.sendMediaGroup`.

## Mengubah Pesan Media

Karena object `InputMedia` juga digunakan untuk mengubah pesan media, plugin ini juga bisa digunakan untuk hal yang serupa:

```ts
const newMedia = InputMediaBuilder.photo("https://grammy.dev/images/Y.png");
await ctx.editMessageMedia(newMedia);
```

Seperti biasa, ia juga bekerja di `ctx.api.editMessageMedia` dan `bot.api.editMessageMedia`.

## Ringkasan Plugin

Plugin ini sudah tersedia secara bawaan.
Sehingga, kamu tidak perlu menginstal apapun untuk menggunakannya.
Cukup import semuanya dari grammY.

Selain itu, baik dokumentasi maupun referensi API plugin ini, telah dijadikan satu dengan package inti.
