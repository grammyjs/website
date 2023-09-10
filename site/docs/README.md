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
      text: Introduction
      link: ./guide/introduction

features:
  - icon: <img class="VPImage" src="/icons/beach-animation.webp" alt="beach animation" width="32" height="32">
    title: Easy-to-use
    details: grammY makes creating Telegram bots so simple you already know how to do it.
  - icon: <img class="VPImage" src="/icons/palette-animation.webp" alt="palette animation" width="32" height="32">
    title: Flexible
    details: grammY is open and can be extended by plugins to make it fit exactly your needs.
  - icon: <img class="VPImage" src="/icons/rocket-animation.webp" alt="rocket animation" width="32" height="32">
    title: Scalable
    details: grammY has you covered when your bot gets popular and the traffic increases.
---

<HomeContent>

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

© 2021-2023 &middot; grammY supports Telegram Bot API 6.8 which was [released](https://core.telegram.org/bots/api#august-18-2023) on August 18, 2023.
(Last highlight: Stories)

</div>
</footer>
<ClientOnly>
  <LanguagePopup />
</ClientOnly>
</HomeContent>
