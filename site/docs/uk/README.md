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
    - попереду ще одне оновлення.
    - може зробити все, окрім вечері.
    - легко, як з обійстя виховати козУ.
    - обслуговано мільярди і мільярди.
    - що живиться від одержимості.
  image:
    src: /images/Y.webp
    alt: логотип grammY
  actions:
    - theme: brand
      text: Розпочати
      link: ./guide/getting-started
    - theme: alt
      text: Вступ
      link: ./guide/introduction

features:
  - icon: <img class="VPImage" src="/icons/beach-animation.webp" alt="beach animation" width="32" height="32">
    title: Простий у використанні
    details: grammY робить створення ботів Telegram настільки простим, що ви вже знаєте, як це зробити.
  - icon: <img class="VPImage" src="/icons/palette-animation.webp" alt="palette animation" width="32" height="32">
    title: Гнучкий
    details: grammY відкритий і може бути розширений за допомогою плагінів, щоб точно відповідати вашим потребам.
  - icon: <img class="VPImage" src="/icons/rocket-animation.webp" alt="rocket animation" width="32" height="32">
    title: Масштабований
    details: grammY допоможе вам, коли ваш бот стане популярним і трафік зросте.
---

<HomeContent>

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

© 2021-2023 &middot; grammY підтримує Telegram Bot API 6.7, який був [випущений](https://core.telegram.org/bots/api#april-21-2023) 21-го квітня 2023 року.
Остання зміна: декілька псевдонімів ботів, користувацькі емодзі та кращі inline-запити.

</div>
</footer>
</HomeContent>
