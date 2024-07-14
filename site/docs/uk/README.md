---
layout: home
titleTemplate: false

hero:
  name: grammY
  text: Фреймворк для створення Telegram ботів.
  taglines: 
    - подумайте, чомУ.
    - нова ера розробки ботів.
    - швидший за вас.
    - отримуйте задоволення від створення ботів.
    - попереду ще одне оновлення.
    - може зробити все, окрім вечері.
    - легко, як з обійстя виховати козУ.
    - обслуговано мільярди і мільярди.
    - живлений одержимістю.
  image:
    src: /images/Y.svg
    alt: логотип grammY
  actions:
    - theme: brand
      text: Розпочати
      link: ./guide/getting-started
    - theme: alt
      text: Документація
      link: ./guide/

features:
  - icon: <lazy-tgs-player class="VPImage" src="/icons/beach-animation.tgs"><img src="/icons/beach.svg" alt="анімація пляжу"></lazy-tgs-player>
    title: Простий у використанні
    details: grammY робить створення ботів Telegram настільки простим, що ви вже знаєте, як це зробити.
  - icon: <lazy-tgs-player class="VPImage" src="/icons/palette-animation.tgs"><img src="/icons/palette.svg" alt="анімація палітри"></lazy-tgs-player>
    title: Гнучкий
    details: grammY відкритий і може бути розширений за допомогою плагінів, щоб точно відповідати вашим потребам.
  - icon: <lazy-tgs-player class="VPImage" src="/icons/rocket-animation.tgs"><img src="/icons/rocket.svg" alt="анімація ракети"></lazy-tgs-player>
    title: Масштабований
    details: grammY допоможе вам, коли ваш бот стане популярним і трафік зросте.
---

<!-- markdownlint-disable no-inline-html -->

## Швидкий старт

Боти, написані на [TypeScript](https://www.typescriptlang.org) або JavaScript, працюють на різних платформах, зокрема [Node.js](https://nodejs.org).

`npm install grammy` і вставте наступний код:

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";

const bot = new Bot(""); // <-- Помістіть токен свого бота між "" (https://t.me/BotFather)

// Відповідаємо "Привіт!" на будь-яке повідомлення.
bot.on("message", (ctx) => ctx.reply("Привіт!"));

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");

const bot = new Bot(""); // <-- Помістіть токен свого бота між "" (https://t.me/BotFather)

// Відповідаємо "Привіт!" на будь-яке повідомлення.
bot.on("message", (ctx) => ctx.reply("Привіт!"));

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot(""); // <-- Помістіть токен свого бота між "" (https://t.me/BotFather)

// Відповідаємо "Привіт!" на будь-яке повідомлення.
bot.on("message", (ctx) => ctx.reply("Привіт!"));

bot.start();
```

:::

Працює! :tada:

<footer id="home-footer">

---

<ClientOnly>
  <ThankYou :s="[
    'Дякуємо, ',
    '{name}',
    ', за внесок у grammY.',
    ', за створення grammY.']" />
</ClientOnly>

<div style="font-size: 0.75rem; display: flex; justify-content: center;">

© 2021-2024 &middot; grammY підтримує Telegram Bot API 7.7, який був [випущений](https://core.telegram.org/bots/api#july-7-2024) 7-го липня 2024 року.
Остання зміна: сервісні повідомлення про повернення платежів.

</div>
</footer>
