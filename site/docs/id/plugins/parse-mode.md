---
prev: false
next: false
---

# Plugin Parse Mode (`parse-mode`)

Telegram menyediakan [styled messages](https://core.telegram.org/bots/api#messageentity).
*Library* ini menambahkan utilitas formatting yang lebih simpel buat grammY.
Fitur ini memungkinkan kamu untuk menyusun pesan dengan format lengkap dengan API deklaratif yang *type-safe*.

Dalam Telegram Bot API, teks yang diformat ditandai dengan menggunakan _entity_ --- semacam marker khusus untuk nunjukin bagian mana teks yang diberikan format tertentu.
Setiap *entity* memiliki tipe (contoh: bold, italic, dll), *offset* (mulai dari indeks keberapa), dan length (jumlah karakter yang terpengaruh).

Bekerja langsung dengan entity bisa merepotkan karena kita perlu melacak *offset* dan *length* secara manual.
Plugin Parse Mode menyelesaikan permasalahan ini dengan menyediakan API deklaratif yang sederhana untuk memformat teks.

## Dua Pendekatan: `fmt` dan `FormattedString`

Pustaka ini menawarkan dua pendekatan utama untuk performatan teks:

1. **Fungsi *Tagged Template* `fmt`**: 
   Sebuah [template literal tag](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates) yang memungkinkan kamu menulis teks terformat dengan cara yang alami menggunakan ekspresi template.
   Secara internal, fungsi ini mengelola *offset* dan *length* untuk kamu.

2. **Kelas `FormattedString`**:
   Pendekatan berbasis kelas yang memungkinkan kamu membuat teks terformat melalui *method chaining*.
   Ini sangat berguna untuk membuat secara terprogram menyusun pesan terformat yang kompleks.

Kedua pendekatan menghasilkan objek `FormattedString` yang terpadu, yang dapat digunakan untuk memanipulasi teks terformat.

## Penggunaan (dengan `fmt`)

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { b, fmt, u } from "@grammyjs/parse-mode";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Menggunakan nilai kembalian dari fmt
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
  // Menggunakan nilai kembalian dari fmt
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
  // Menggunakan nilai kembalian dari fmt
  const combined = fmt`${b}bolded${b} ${ctx.msg.text} ${u}underlined${u}`;
  await ctx.reply(combined.text, { entities: combined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    { caption: combined.caption, caption_entities: combined.caption_entities },
  );
});

bot.start();
```

:::

## Penggunaan (dengan `FormattedString`)

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { FormattedString } from "@grammyjs/parse-mode";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Static method
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

  // Atau dengan constructor
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
  // Static method
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

  // Atau dengan constructor
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
const { Bot } = require("grammy");
const { FormattedString } = require("@grammyjs/parse-mode");

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Static method
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

  // Atau dengan constructor
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

## Konsep Inti

### `FormattedString` sebagai *Unified Return Type*

Kelas `FormattedString` adalah komponen inti dari *parse-mode* plugin, yang menyediakan antarmuka terpadu untuk bekerja dengan teks terformat.
Nilai kembalian dari `fmt`, `new FormattedString`, maupun `FormattedString.<staticMethod>` semuanya berupa instance `FormattedString`.
Ini berarti penggunaan gaya berbeda dapat digabungkan.

Contohnya kamu bisa menggunakan `fmt`, lalu menambahkan *method chain* dari `FormattedString`, dan akhirnya meneruskan kembali ke *template tag* `fmt`.

```ts
bot.on("msg:text", async ctx => {
  // Hasil dari fmt`${${u}Memory updated!${u}}` adalah FormattedString
  // pemanggilan method `.plain("\n") juga mengembalikan FormattedString
  const header = fmt`${${u}Memory updated!${u}}`.plain("\n");
  const body = FormattedString.plain("I will remember this!");
  const footer = "\n - by grammy AI";

  // Ini juga valid - kamu bisa memberikan FormattedString dan string ke `fmt`
  const response = fmt`${header}${body}${footer}`;
  await ctx.reply(response.text, { entities: response.entities });
});
```

### Nilai yang diterima oleh `fmt`

Fungsi *tagged template* `fmt` menerima berbagai macam nilai untuk membangun `FormattedString` kamu, termasuk:

- `TextWithEntities` (diimplementasikan oleh `FormattedString` dan pesan teks Telegram biasa)
- `CaptionWithEntities` (diimplementasikan oleh `FormattedString` dan pesan media Telegram dengan caption)
- EntityTag (seperti fungsi `b()` dan `a(url)`)
- Fungsi tanpa argumen *(nullary functions)* yang mengembalikan EntityTag (misalnya `b` dan `i`)
- Tipe apapun yang mengimplementasikan `toString()` (akan diperlakukan sebagai teks biasa)

### TextWithEntities

*Interface* `TextWithEntities` merepresentasikan teks dengan *entity* performatan opsional.

```ts
interface TextWithEntities {
  text: string;
  entities?: MessageEntity[];
}
```
Perhatikan bahwa bentuk tipe ini menyiratkan bahwa pesan teks biasa dari Telegram juga mengimplementasikan `TextWithEntities` secara implisit.
Ini berarti bahwa sebenarnya memungkinkan untuk melakukan hal berikut:

```ts
bot.on("msg:text", async (ctx) => {
  const response = fmt`${ctx.msg}`.plain("\n---\n").bold("Ini respon saya");
  await ctx.reply(response.text, { entities: response.entities });
});
```

### CaptionWithEntities

Interface `CaptionWithEntities` merepresentasikan sebuah caption dengan entitas performatan opsional.

```ts
interface CaptionWithEntities {
  caption: string;
  caption_entities?: MessageEntity[];
}
```

Demikian perhatikan bahwa bentuk tipe ini menyiratkan bahwa pesan media biasa dengan caption dari Telegram juga secara implisit mengimplementasikan `CaptionWithEntities`.
Ini berarti bahwa sebenarnya juga memungkinkan untuk melakukan hal berikut:

```ts
bot.on("msg:caption", async (ctx) => {
  const response = fmt`${ctx.msg}`.plain("\n---\n").bold("Ini respon saya");
  await ctx.reply(response.text, { entities: response.entities });
});
```

## Ringkasan Plugin

- Nama: `parse-mode`
- [Sumber](https://github.com/grammyjs/parse-mode)
- [Referensi](/ref/parse-mode/)
