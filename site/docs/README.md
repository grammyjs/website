---
layout: home
titleTemplate: false

hero:
  name: grammY
  text: The Telegram Bot Framework.
  taglines: 
    - think of the whY.
    - a new era of bot development.
    - runs faster than you.
    - have fun making bots.
    - one update ahead.
    - can do anything except dishes.
    - easy peasy lemon squeezY.
    - billions and billions served.
    - powered by obsession.
  image:
    src: /images/Y.svg
    alt: grammY logo
  actions:
    - theme: brand
      text: Get Started
      link: ./guide/getting-started
    - theme: alt
      text: Documentation
      link: ./guide/

features:
  - icon: <lazy-tgs-player class="VPImage" src="/icons/beach-animation.tgs"><img src="/icons/beach.svg" alt="beach animation"></lazy-tgs-player>
    title: Easy-to-use
    details: grammY makes creating Telegram bots so simple you already know how to do it.
  - icon: <lazy-tgs-player class="VPImage" src="/icons/palette-animation.tgs"><img src="/icons/palette.svg" alt="palette animation"></lazy-tgs-player>
    title: Flexible
    details: grammY is open and can be extended by plugins to make it fit exactly your needs.
  - icon: <lazy-tgs-player class="VPImage" src="/icons/rocket-animation.tgs"><img src="/icons/rocket.svg" alt="rocket animation"></lazy-tgs-player>
    title: Scalable
    details: grammY has you covered when your bot gets popular and the traffic increases.
---

<!-- markdownlint-disable no-inline-html -->

## Quickstart

Bots are written in [TypeScript](https://www.typescriptlang.org) (or JavaScript) and run on various platforms, including [Node.js](https://nodejs.org).

`npm install grammy` and paste the following code:

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";

const bot = new Bot(""); // <-- put your bot token between the "" (https://t.me/BotFather)

// Reply to any message with "Hi there!".
bot.on("message", (ctx) => ctx.reply("Hi there!"));

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");

const bot = new Bot(""); // <-- put your bot token between the "" (https://t.me/BotFather)

// Reply to any message with "Hi there!".
bot.on("message", (ctx) => ctx.reply("Hi there!"));

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot(""); // <-- put your bot token between the "" (https://t.me/BotFather)

// Reply to any message with "Hi there!".
bot.on("message", (ctx) => ctx.reply("Hi there!"));

bot.start();
```

:::

Works! :tada:

<footer id="home-footer">

---

<ClientOnly>
  <ThankYou :s="[
    'Thank you, ',
    '{name}',
    ', for being a contributor to grammY.',
    ', for creating grammY.'
  ]" />
</ClientOnly>

<div style="font-size: 0.75rem; display: flex; justify-content: center;">

© 2021-2024 &middot; grammY supports Telegram Bot API 7.7 which was [released](https://core.telegram.org/bots/api#july-7-2024) on July 7, 2024.
(Last highlight: Payment refunded services messages)

</div>
</footer>
<ClientOnly>
  <LanguagePopup />
</ClientOnly>
