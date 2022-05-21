---
home: true
heroImage: /Y.png
actions:
  - text: Mulai
    link: /id/guide/getting-started.html
    type: primary
  - text: Pendahuluan
    link: /id/guide/introduction.html
    type: secondary
features:
  - title: Mudah Digunakan
    details: grammY menjadikan pembuatan bot Telegram begitu sederhana sehingga Anda langsung tahu cara membuatnya.
  - title: Fleksibel
    details: grammY bersifat terbuka dan dapat ditambahkan dengan plugin untuk membuatnya sesuai dengan kebutuhan Anda.
  - title: Dapat Diskalakan
    details: grammY siap membantu ketika bot Anda menjadi populer dan semakin banyak trafiknya.
footer: Hak Cipta © 2021-2022
permalink: /id/
---

<h6 align="right">… {{ [
  'tak perlu lagi mengeluh "whY!?"',
  'era baru pengembangan bot',
  'bekerja lebih cepat daripada Anda',
  'selangkah lebih maju',
  'bisa melakukan apa saja kecuali mencuci piring',
  'buatnya so easY, hati jadi happY',
  'ratusan juta telah terlayani',
][Math.floor(Math.random() * 7)] }}.</h6>

## Mulai Cepat

Bot ditulis menggunakan [TypeScript](https://www.typescriptlang.org) (atau JavaScript) dan berjalan di berbagai platform, termasuk [Node.js](https://nodejs.org).

`npm install grammy` lalu tempel kode berikut:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";

const bot = new Bot(""); // <-- taruh token bot Anda di sini (https://t.me/BotFather)

// Balas pesan apapun dengan "Halo, apa kabar!".
bot.on("message", (ctx) => ctx.reply("Halo, apa kabar!"));

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");

const bot = new Bot(""); // <-- taruh token bot Anda di sini (https://t.me/BotFather)

// Balas pesan apapun dengan "Halo, apa kabar!".
bot.on("message", (ctx) => ctx.reply("Halo, apa kabar!"));

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot(""); // <-- taruh token bot Anda di sini (https://t.me/BotFather)

// Balas pesan apapun dengan "Halo, apa kabar!".
bot.on("message", (ctx) => ctx.reply("Halo, apa kabar!"));

bot.start();
```

</CodeGroupItem>
</CodeGroup>

Berhasil! :tada:

---

grammY mendukung API Bot Telegram versi 6.0 yang [dirilis](https://core.telegram.org/bots/api#april-16-2022) pada 16 April 2022.
(Fitur yang disorot: Web Apps)
