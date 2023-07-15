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
  image:
    src: /images/Y.webp
    alt: logo grammY
  actions:
    - theme: brand
      text: Mulai
      link: ./guide/getting-started
    - theme: alt
      text: Pengenalan
      link: ./guide/introduction

features:
  - icon: <img class="VPImage" src="/icons/beach-animation.webp" alt="beach animation" width="32" height="32">
    title: Mudah Digunakan
    details: grammY menjadikan pembuatan bot Telegram begitu simpel sehingga kamu pun langsung tahu cara membuatnya.
  - icon: <img class="VPImage" src="/icons/palette-animation.webp" alt="palette animation" width="32" height="32">
    title: Fleksibel
    details: grammY bersifat terbuka dan bisa ditambahkan dengan plugin yang kamu inginkan.
  - icon: <img class="VPImage" src="/icons/rocket-animation.webp" alt="rocket animation" width="32" height="32">
    title: Dapat Diskalakan
    details: grammY selalu siap membantu ketika bot menjadi semakin populer dan ramai digunakan.
---

<HomeContent>

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

© 2021-2023 &middot; grammY mendukung API Bot Telegram versi 6.7 yang [dirilis](https://core.telegram.org/bots/api#april-21-2023) pada tanggal 21 April 2023.
(Fitur yang disorot: nama bot lebih dari satu, emoji khusus, dan inline queries yang lebih baik)

</div>
</footer>
</HomeContent>
