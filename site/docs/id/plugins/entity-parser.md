---
prev: false
next: false
---

# Entity Parser (`entity-parser`)

Mengubah [Telegram entities](https://core.telegram.org/bots/api#messageentity) menjadi semantic HTML.

## Kapan Plugin Ini Diperlukan?

Kemungkinan besar kamu TIDAK AKAN PERNAH membutuhkannya sama sekali!

Meski plugin ini mampu menghasilkan HTML, namun, pada umumnya, mengirim teks beserta entity-nya kembali ke Telegram jauh lebih baik.

Pengonversian ke HTML hanya dibutuhkan untuk kondisi khusus ketika kamu perlu menggunakan teks pemformatan Telegram **di luar** ekosistem Telegram itu sendiri, misalnya menampilkan pesan Telegram di suatu website.

Silahkan lihat bagian [_Contoh-Contoh Kasus yang Sebaiknya Tidak Menggunakan Plugin Ini_](#contoh-contoh-kasus-yang-sebaiknya-tidak-menggunakan-plugin-ini) untuk menemukan solusi yang lebih baik ketika kamu memiliki permasalahan yang serupa.

Jika kamu masih ragu apakah plugin ini sesuai, jangan ragun untuk bertanya di [grup Telegram]((https://t.me/grammyjs)) kami.
Dalam kebanyakan kasus, sebagian besar orang sebenarnya tidak terlalu memerlukan plugin untuk menyelesaikan permasalahan mereka!

## Penginstalan

Jalankan perintah berikut di terminal.
Sesuaikan dengan runtime atau package manager yang kamu gunakan:

::: code-group

```sh:no-line-numbers [Deno]
deno add jsr:@qz/telegram-entities-parser
```

```sh:no-line-numbers [Bun]
bunx jsr add @qz/telegram-entities-parser
```

```sh:no-line-numbers [pnpm]
pnpm dlx jsr add @qz/telegram-entities-parser
```

```sh:no-line-numbers [Yarn]
yarn dlx jsr add @qz/telegram-entities-parser
```

```sh:no-line-numbers [npm]
npx jsr add @qz/telegram-entities-parser
```

:::

## Penggunaan Sederhana

Menggunakan plugin ini cukup simpel.
Berikut contohnya:

```ts
import { EntitiesParser } from "@qz/telegram-entities-parser";
import type { Message } from "@qz/telegram-entities-parser/types";

// Agar tidak mempengaruhi performa, buat instansiasi di luar function terkait.
const entitiesParser = new EntitiesParser();
const parse = (message: Message) => entitiesParser.parse({ message });

bot.on(":text", (ctx) => {
  const html = parse(ctx.msg); // Konversi teks menjadi string HTML
});

bot.on(":photo", (ctx) => {
  const html = parse(ctx.msg); // Konversi caption menjadi string HTML
});
```

## Penggunaan Tingkat Lanjut

### Menyesuaikan Keluaran Tag HTML

Plugin ini mengonversi entity menjadi semantic HTML sesuai dengan standar dan praktik terbaik sebisa mungkin.
Namun, keluaran yang dihasilkan mungkin tidak sesuai dengan harapan kamu.

Untuk mengatasinya, kamu bisa menggunakan `renderer`-mu sendiri untuk menyesuaikan element HTML yang membungkus teks terkait sesuai dengan aturan yang telah diterapkan.
Kamu bisa memodifikasi aturan tertentu dengan cara meng-extend [`RendererHtml`](https://github.com/quadratz/telegram-entities-parser/blob/main/src/renderers/renderer_html.ts) bawaan ataupun menimpa semua aturan dengan cara mengimplementasikan [`Renderer`](https://github.com/quadratz/telegram-entities-parser/blob/main/src/renderers/renderer.ts).

Untuk meng-extend `renderer` yang sudah ada, lakukan hal berikut:

```ts
import { EntitiesParser, RendererHtml } from "@qz/telegram-entities-parser";
import type {
  CommonEntity,
  RendererOutput,
} from "@qz/telegram-entities-parser/types";

// Gunakan aturan yang diterapkan oleh `RendererHtml`,
// tetapi khusus untuk entity bold, gunakan aturan berikut:
class MyRenderer extends RendererHtml {
  override bold(
    options: { text: string; entity: CommonEntity },
  ): RendererOutput {
    return {
      prefix: '<strong class="tg-bold">',
      suffix: "</strong>",
    };
  }
}

const entitiesParser = new EntitiesParser({ renderer: new MyRenderer() });
```

Parameter `options` menerima sebuah object berupa `text` dan `entity`.

- `text`: Porsi teks yang direferensikan oleh entity terkait.
- `entity`: Paramater ini memiliki beragam interface sesuai dengan tipe entity-nya, entah itu `CommonEntity`, `CustomEmojiEntity`, `PreEntity`, `TextLinkEntity`, ataupun `TextMentionEntity`.
  Contohnya, tipe `bold` memiliki entity dengan interface `CommonEntity`, sementara tipe `text_link` interface-nya berupa `TextLinkEntity` karena mengandung property tambahan seperti `url`.

Berikut daftar lengkap interface beserta keluaran untuk masing-masing tipe entity:

| Tipe Entity             | Interface           | Keluaran                                                                                                                                                                             |
| ----------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `blockquote`            | `CommonEntity`      | `<blockquote class="tg-blockquote"> ... </blockquote>`                                                                                                                               |
| `bold`                  | `CommonEntity`      | `<b class="tg-bold"> ... </b>`                                                                                                                                                       |
| `bot_command`           | `CommonEntity`      | `<span class="tg-bot-command"> ... </span>`                                                                                                                                          |
| `cashtag`               | `CommonEntity`      | `<span class="tg-cashtag"> ... </span>`                                                                                                                                              |
| `code`                  | `CommonEntity`      | `<code class="tg-code"> ... </code>`                                                                                                                                                 |
| `custom_emoji`          | `CustomEmojiEntity` | `<span class="tg-custom-emoji" data-custom-emoji-id="${options.entity.custom_emoji_id}"> ... </span>`                                                                                |
| `email`                 | `CommonEntity`      | `<a class="tg-email" href="mailto:${options.text}"> ... </a>`                                                                                                                        |
| `expandable_blockquote` | `CommonEntity`      | `<blockquote class="tg-expandable-blockquote"> ... </blockquote>`                                                                                                                    |
| `hashtag`               | `CommonEntity`      | `<span class="tg-hashtag"> ... </span>`                                                                                                                                              |
| `italic`                | `CommonEntity`      | `<i class="tg-italic"> ... </i>`                                                                                                                                                     |
| `mention`               | `CommonEntity`      | `<a class="tg-mention" href="https://t.me/${username}"> ... </a>`                                                                                                                    |
| `phone_number`          | `CommonEntity`      | `<a class="tg-phone-number" href="tel:${options.text}"> ... </a>`                                                                                                                    |
| `pre`                   | `PreEntity`         | `<pre class="tg-pre-code"><code class="language-${options.entity.language}"> ... </code></pre>` atau `<pre class="tg-pre"> ... </pre>`                                               |
| `spoiler`               | `CommonEntity`      | `<span class="tg-spoiler"> ... </span>`                                                                                                                                              |
| `strikethrough`         | `CommonEntity`      | `<del class="tg-strikethrough"> ... </del>`                                                                                                                                          |
| `text_link`             | `TextLinkEntity`    | `<a class="tg-text-link" href="${options.entity.url}"> ... </a>`                                                                                                                     |
| `text_mention`          | `TextMentionEntity` | `<a class="tg-text-mention" href="https://t.me/${options.entity.user.username}"> ... </a>` atau `<a class="tg-text-mention" href="tg://user?id=${options.entity.user.id}"> ... </a>` |
| `underline`             | `CommonEntity`      | `<span class="tg-bot-command"> ... </span>`                                                                                                                                          |
| `url`                   | `CommonEntity`      | `<a class="tg-url" href="${options.text}"> ... </a>`                                                                                                                                 |

Jika kamu ragu interface mana yang benar, silahkan lihat pengimplentasian [Renderer](https://github.com/quadratz/telegram-entities-parser/blob/main/src/renderers/renderer.ts) dan [RendererHtml](https://github.com/quadratz/telegram-entities-parser/blob/main/src/renderers/renderer_html.ts).

### Menyesuaikan Pembersih Teks (Text Sanitizer)

Secara bawaan, keluaran teks dibersihkan agar HTML bisa di-render dengan baik dan menghindari kerentanan XSS.

| Masukan | Keluaran |
| ------- | -------- |
| `&`     | `&amp;`  |
| `<`     | `&lt;`   |
| `>`     | `&gt;`   |
| `"`     | `&quot;` |
| `'`     | `&#x27;` |

Sebagai contoh, hasil keluaran `<b>Tebal</b> & <i>Miring</i>` akan dibersihkan menjadi `<b>Tebal</b> &amp; <i>Miring</i>`.

Kamu bisa mengubah perilaku tersebut dengan cara menentukan `textSanitizer` ketika menginisiasi [`EntitiesParser`](https://github.com/quadratz/telegram-entities-parser/blob/main/src/mod.ts):

- Jika `textSanitizer` tidak ditentukan, ia secara bawaan akan menggunakan [`sanitizerHtml`](https://github.com/quadratz/telegram-entities-parser/blob/main/src/utils/sanitizer_html.ts) sebagai pembersihnya.
- Jika nilai `false` diberikan, pembersihan tidak akan dilakukan, sehingga keluaran teks yang dihasilkan apa adanya.
  Langkah ini tidak disarankan karena dapat menyebabkan kesalahan pe-render-an dan membuat aplikasimu rentan terhadap serangan XSS.
  Pastikan penanganan dilakukan dengan baik jika kamu memilih opsi ini.
- Jika sebuah function diberikan, function tersebut akan digunakan sebagai pembersih bawaannya.

```ts
const myTextSanitizer: TextSanitizer = (options: TextSanitizerOption): string =>
  // Ganti karakter-karakter yang berbahaya
  options.text.replaceAll(/[&<>"']/, (match) => {
    switch (match) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#x27;";
      default:
        return match;
    }
  });

// Terapkan pembersihnya (sanitizer).
const entitiesParser = new EntitiesParser({ textSanitizer: myTextSanitizer });
```

## Contoh-Contoh Kasus yang Sebaiknya Tidak Menggunakan Plugin Ini

Jika menghadapi permasalahan serupa dengan berikut, kamu kemungkinan besar bisa menyelesaikannya tanpa menggunakan plugin ini.

### Menyalin dan Meneruskan Pesan yang Sama

Gunakan [`forwardMessage`](https://core.telegram.org/bots/api#forwardmessage) untuk meneruskan pesan apapun.

Kamu juga bisa menggunakan API [`copyMessage`](https://core.telegram.org/bots/api#copymessage) untuk melakukan aksi yang serupa tanpa menyertakan link ke pesan aslinya.
[`copyMessage`](https://core.telegram.org/bots/api#copymessage) memiliki perilaku layaknya menyalin lalu mengirim ulang pesan tersebut ke Telegram, sehingga wujudnya berupa pesan biasa alih-alih pesan terusan.

```ts
bot.on(":text", async (ctx) => {
  // Id chat tujuan.
  const chatId = -946659600;
  // Teruskan pesan berikut tanpa menyertakan link ke pesan aslinya.
  await ctx.copyMessage(chatId);
  // Teruskan pesan berikut dengan menyertakan link ke pesan aslinya.
  await ctx.forwardMessage(chatId);
});
```

### Membalas Pesan Menggunakan Format Teks yang Telah Dimodifikasi

Kamu juga bisa dengan mudah membalas pesan yang datang menggunakan HTML, Markdown, atau entity.

```ts
bot.on(":text", async (ctx) => {
  // Balas dengan HTML
  await ctx.reply("<b>tebal</b> <i>miring</i>", { parse_mode: "HTML" });
  // Balas dengan Telegram Markdown V2
  await ctx.reply("*tebal* _miring_", { parse_mode: "MarkdownV2" });
  // Balas dengan entity
  await ctx.reply("tebal miring", {
    entities: [
      { offset: 0, length: 5, type: "bold" },
      { offset: 6, length: 6, type: "italic" },
    ],
  });
});
```

::: tip Gunakan parse-mode untuk Pengalaman Pemformatan yang Lebih Baik

Gunakan plugin resmi [`parse-mode`](./parse-mode) untuk memformat pesan dengan cara yang lebih elegan.
:::

## Ringkasan Plugin

- Nama: `entity-parser`
- [Package](https://jsr.io/@qz/telegram-entities-parser)
- [Sumber](https://github.com/quadratz/telegram-entities-parser)
