---
home: true
heroImage: /images/Y.png
actions:
  - text: Mulai
    link: /id/guide/getting-started.html
    type: primary
  - text: Pengenalan
    link: /id/guide/introduction.html
    type: secondary
features:
  - title: Mudah Digunakan
    details: grammY menjadikan pembuatan bot Telegram begitu simpel sehingga kamu pun langsung tahu cara membuatnya.
  - title: Fleksibel
    details: grammY bersifat terbuka dan bisa ditambahkan dengan plugin yang kamu inginkan.
  - title: Dapat Diskalakan
    details: grammY selalu siap membantu ketika bot menjadi semakin populer dan semakin banyak trafiknya.
permalink: /id/
---

<h6 align="right">… {{ [
  'tak perlu lagi mengeluh "whY!?"',
  'era baru pengembangan bot',
  'bekerja lebih cepat dibanding kamu',
  'selangkah lebih maju',
  'bisa melakukan apa saja, kecuali mencuci piring',
  'buatnya so easY, hati jadi happY',
  'ratusan juta telah terlayani',
  'dokumentasi yang lengkap dan berkualitas',
  'honeY, grammY, sweetY',
][Math.floor(Math.random() * 9)] }}.</h6>

## Mulai Cepat

Bot ditulis menggunakan [TypeScript](https://www.typescriptlang.org) (atau JavaScript) dan dapat berjalan di berbagai platform, termasuk [Node.js](https://nodejs.org).

`npm install grammy` lalu tempel kode berikut:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";

const bot = new Bot(""); // <-- taruh token bot-mu di sini (https://t.me/BotFather)

// Balas pesan apapun dengan "Halo, apa kabar!".
bot.on("message", (ctx) => ctx.reply("Halo, apa kabar!"));

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");

const bot = new Bot(""); // <-- taruh token bot-mu di sini (https://t.me/BotFather)

// Balas pesan apapun dengan "Halo, apa kabar!".
bot.on("message", (ctx) => ctx.reply("Halo, apa kabar!"));

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot(""); // <-- taruh token bot-mu di sini (https://t.me/BotFather)

// Balas pesan apapun dengan "Halo, apa kabar!".
bot.on("message", (ctx) => ctx.reply("Halo, apa kabar!"));

bot.start();
```

</CodeGroupItem>
</CodeGroup>

Berhasil! :tada:

---

<ClientOnly>
  <ThankYou />
<ClientOnly />

<div style="font-size: 0.75rem;">

© 2021-2023 &middot; grammY mendukung API Bot Telegram versi 6.6 yang [dirilis](https://core.telegram.org/bots/api#march-9-2023) pada tanggal 9 Maret 2023.
(Fitur yang disorot: Terjemahan untuk Deskripsi Bot)

</div>
