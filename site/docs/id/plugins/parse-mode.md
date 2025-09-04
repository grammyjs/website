---
prev: false
next: false
---

# Plugin Parse Mode (`parse-mode`)

Dukungan Telegram [gaya pesan](https://core.telegram.org/bots/api#messageentity).

Pustaka ini menghadirkan utilitas pemformatan yang disederhanakan ke grammY.
Ini memungkinkan Anda untuk membuat pesan yang diformat dengan kaya menggunakan API deklaratif dan aman untuk type.

Dalam Bot API Telegram, teks yang diformat diwakili menggunakan _entities_ ---penanda khusus yang menentukan bagian teks mana yang harus diformat dengan cara tertentu.
Setiap entitas memiliki _type_ (misalnya `bold`, `italic`, dll), _offset_ (di mana entitas tersebut dimulai dalam teks), dan _length_ (berapa banyak karakter yang terpengaruh).

Bekerja secara langsung dengan entitas ini bisa jadi tidak praktis karena Anda perlu melacak offset dan panjangnya secara manual.
Plugin Parse Mode memecahkan masalah ini dengan menyediakan API deklaratif yang sederhana untuk memformat teks.

## Dua Pendeketan `fmt` dan `FormattedString`

Pustaka ini menawarkan dua pendekatan utama untuk pemformatan teks:

1. **`fmt` Tagged Template Function**:
   Sebuah [template literal tag](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates) yang memungkinkan Anda untuk menulis teks yang diformat dengan cara alami menggunakan ekspresi template.
   Secara internal mengelola offset dan panjang entitas untuk Anda.
2. **`FormattedString` Class**:
   Pendekatan berbasis kelas yang memungkinkan Anda membangun teks yang diformat melalui rangkaian metode.
   Hal ini sangat berguna untuk membuat pesan berformat yang kompleks secara terprogram.

Kedua pendekatan tersebut menghasilkan objek `FormattedString` terpadu yang dapat digunakan untuk memanipulasi teks yang diformat.

## Penggunaan (memakai `fmt`)
::: code-group
```ts [TypeScript]
import { Bot } from "grammy";
import { b, fmt, u } from "@grammyjs/parse-mode";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Memakai return values dari fmt
  const combined = fmt`${b}bolded${b} ${ctx.msg.text} ${u}underlined${u}`;
  await ctx.reply(combined.text, { entities: combined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    { caption: combined.caption, caption_entities: combined.caption_entities },
  );
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { fmt, b, u } = require("@grammyjs/parse-mode");

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Memakai return values dari fmt
  const combined = fmt`${b}bolded${b} ${ctx.msg.text} ${u}underlined${u}`;
  await ctx.reply(combined.text, { entities: combined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    { caption: combined.caption, caption_entities: combined.caption_entities },
  );
});

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { b, fmt, u } from "https://deno.land/x/grammy_parse_mode/mod.ts";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Memakai return values dari fmt
  const combined = fmt`${b}bolded${b} ${ctx.msg.text} ${u}underlined${u}`;
  await ctx.reply(combined.text, { entities: combined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    { caption: combined.caption, caption_entities: combined.caption_entities },
  );
});
```

:::

## Penggunaan (memakai `FormattedString`)
::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { FormattedString } from "@grammyjs/parse-mode";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Metode statis
  const staticCombined = FormattedString.b("bolded").plain(` ${ctx.msg.text} `)
    .u("underlined");
  await ctx.reply(staticCombined.text, { entities: staticCombined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: staticCombined.caption,
      caption_entities: staticCombined.caption_entities,
    },
  );

  // Atau konstruktor
  const constructorCombined = (new FormattedString("")).b("bolded").plain(
    ` ${ctx.msg.text} `,
  ).u("underlined");
  await ctx.reply(constructorCombined.text, {
    entities: constructorCombined.entities,
  });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: constructorCombined.caption,
      caption_entities: constructorCombined.caption_entities,
    },
  );
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { FormattedString } = require("@grammyjs/parse-mode");

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Metode statis
  const staticCombined = FormattedString.b("bolded").plain(` ${ctx.msg.text} `)
    .u("underlined");
  await ctx.reply(staticCombined.text, { entities: staticCombined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: staticCombined.caption,
      caption_entities: staticCombined.caption_entities,
    },
  );

  // Atau konstruktor
  const constructorCombined = (new FormattedString("")).b("bolded").plain(
    ` ${ctx.msg.text} `,
  ).u("underlined");
  await ctx.reply(constructorCombined.text, {
    entities: constructorCombined.entities,
  });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: constructorCombined.caption,
      caption_entities: constructorCombined.caption_entities,
    },
  );
});

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { FormattedString } from "https://deno.land/x/grammy_parse_mode/mod.ts";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Metode statis
  const staticCombined = FormattedString.b("bolded").plain(` ${ctx.msg.text} `)
    .u("underlined");
  await ctx.reply(staticCombined.text, { entities: staticCombined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: staticCombined.caption,
      caption_entities: staticCombined.caption_entities,
    },
  );

  // Atau konstruktor
  const constructorCombined = (new FormattedString("")).b("bolded").plain(
    ` ${ctx.msg.text} `,
  ).u("underlined");
  await ctx.reply(constructorCombined.text, {
    entities: constructorCombined.entities,
  });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: constructorCombined.caption,
      caption_entities: constructorCombined.caption_entities,
    },
  );
});

bot.start();
```

:::

## Core Concepts

### `FormattedString` adalah unified return type

Kelas `FormattedString` adalah komponen inti dari plugin `parse-mode`, yang menyediakan antarmuka terpadu untuk bekerja dengan teks yang diformat.
Nilai balik dari `fmt`, `new FormattedString` dan `FormattedString.<staticMethod>` mengembalikan sebuah instansi dari `FormattedString`.
Ini berarti bahwa gaya penggunaan yang berbeda dapat digabungkan.

Sebagai contoh, Anda dapat menggunakan `fmt`, diikuti dengan metode instance yang dapat dirantai dari `FormattedString`, dan kemudian meneruskan hasilnya ke dalam template yang diberi tag `fmt` yang lain.

```ts
bot.on("msg:text", async ctx => {
  // Hasil dari fmt`${${u}Memori diperbarui!${u}}` adalah sebuah FormattedString
  // yang pemanggilan metode instansinya dari `.plain(“\n”) juga mengembalikan sebuah FormattedString
  const header = fmt`${${u}Memori diperbarui!${u}}`.plain("\n");
  const body = FormattedString.plain("Aku akan mengingat ini!");
  const footer = "\n - oleh grammy AI";

  // Ini juga legal - Anda dapat memberikan FormattedString dan string ke `fmt`
  const response = fmt`${header}${body}${footer}`;
  await ctx.reply(response.text, { entities: response.entities });
});
```

### Hal yang diterima `fmt`
Template yang diberi tag `fmt` menerima berbagai macam nilai untuk membuat `FormattedString` Anda, termasuk:

- `TextWithEntities` (diimplementasikan oleh `FormattedString` dan pesan teks Telegram biasa)
- `CaptionWithEntities` (diimplementasikan oleh `FormattedString` dan pesan media Telegram biasa dengan keterangan)
- EntityTag (seperti fungsi `b()` dan `a(url)` Anda)
- Fungsi nullary yang mengembalikan EntityTag (seperti `b` dan `i`)
- Semua type yang mengimplementasikan `toString()` (akan diperlakukan sebagai nilai teks biasa)

### TextWithEntities
Antarmuka `TextWithEntities` merepresentasikan teks dengan entitas pemformatan opsional.

```ts
interface TextWithEntities {
  text: string;
  entities?: MessageEntity[];
}
```

Perhatikan bahwa bentuk type ini menyiratkan bahwa pesan teks biasa dari Telegram juga mengimplementasikan `TextWithEntities` secara implisit.
Ini berarti bahwa hal ini sebenarnya memungkinkan untuk melakukan hal berikut:

```ts
bot.on("msg:text", async (ctx) => {
  const response = fmt`${ctx.msg}`.plain("\n---\n").bold("Ini responnya.");
  await ctx.reply(response.text, { entities: response.entities });
});
```

### CaptionWithEntities
Antarmuka `CaptionWithEntities` merepresentasikan keterangan dengan entitas pemformatan opsional.

```ts
interface CaptionWithEntities {
  caption: string;
  caption_entities?: MessageEntity[];
}
```

Selain itu, perhatikan bahwa bentuk jenis ini menyiratkan bahwa pesan media biasa dengan keterangan dari Telegram juga menerapkan `CaptionWithEntities` secara implisit.
Ini berarti bahwa hal ini juga memungkinkan untuk melakukan hal berikut:

```ts
bot.on("msg:caption", async (ctx) => {
  const response = fmt`${ctx.msg}`.plain("\n---\n").bold("Ini responnya.");
  await ctx.reply(response.text, { entities: response.entities });
});
```

## Ringkasan Plugin

- Nama: `parse-mode`
