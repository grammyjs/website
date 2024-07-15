---
layout: home
titleTemplate: false

hero:
  name: grammY
  text: Framework Bot Telegram.
  taglines: 
    - tak perlu lagi mengeluh "whY!?".
    - era baru pengembangan bot.
    - bekerja lebih cepat dibanding kamu.
    - selangkah lebih maju.
    - bisa melakukan apa saja, kecuali mencuci piring.
    - buatnya so easY, hati jadi happY.
    - miliaran telah terlayani.
    - dokumentasi yang lengkap dan berkualitas.
    - honeY, grammY, sweetY.
    - bikin bot tak pernah sebahagia ini.
    - ditenagai oleh obsesi.
  image:
    src: /images/Y.svg
    alt: logo grammY
  actions:
    - theme: brand
      text: Mulai
      link: ./guide/getting-started
    - theme: alt
      text: Dokumentasi
      link: ./guide/

features:
  - icon: <lazy-tgs-player class="VPImage" src="/icons/beach-animation.tgs"><img src="/icons/beach.svg" alt="beach animation"></lazy-tgs-player>
    title: Mudah Digunakan
    details: grammY menjadikan pembuatan bot Telegram begitu simpel sehingga kamu pun langsung tahu cara membuatnya.
  - icon: <lazy-tgs-player class="VPImage" src="/icons/palette-animation.tgs"><img src="/icons/palette.svg" alt="palette animation"></lazy-tgs-player>
    title: Fleksibel
    details: grammY bersifat terbuka dan bisa ditambahkan dengan plugin yang kamu inginkan.
  - icon: <lazy-tgs-player class="VPImage" src="/icons/rocket-animation.tgs"><img src="/icons/rocket.svg" alt="rocket animation"></lazy-tgs-player>
    title: Dapat Diskalakan
    details: grammY selalu siap membantu ketika bot menjadi semakin populer dan ramai digunakan.
---

<!-- markdownlint-disable no-inline-html -->

## Mulai Cepat

Bot ditulis menggunakan [TypeScript](https://www.typescriptlang.org) (atau JavaScript) dan dapat berjalan di berbagai platform, termasuk [Node.js](https://nodejs.org).

`npm install grammy` lalu tempel kode berikut:

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";

const bot = new Bot(""); // <-- taruh token bot-mu di antara "" (https://t.me/BotFather)

// Balas pesan apapun dengan "Halo, apa kabar!".
bot.on("message", (ctx) => ctx.reply("Halo, apa kabar!"));

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");

const bot = new Bot(""); // <-- taruh token bot-mu di antara "" (https://t.me/BotFather)

// Balas pesan apapun dengan "Halo, apa kabar!".
bot.on("message", (ctx) => ctx.reply("Halo, apa kabar!"));

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot(""); // <-- taruh token bot-mu di antara "" (https://t.me/BotFather)

// Balas pesan apapun dengan "Halo, apa kabar!".
bot.on("message", (ctx) => ctx.reply("Halo, apa kabar!"));

bot.start();
```

:::

Berhasil! :tada:

<footer id="home-footer">

---

<ClientOnly>
  <ThankYou :s="[
    'Terima kasih, ',
    '{name}',
    ', telah menjadi kontributor grammY.',
    ', telah menciptakan grammY.'
  ]" />
</ClientOnly>

<div style="font-size: 0.75rem; display: flex; justify-content: center;">

© 2021-2024 &middot; grammY mendukung API Bot Telegram versi 7.7 yang [dirilis](https://core.telegram.org/bots/api#july-7-2024) pada tanggal 7 Juli 2024.
(Fitur yang disorot: Pesan layanan pengembalian dana)

</div>
</footer>
