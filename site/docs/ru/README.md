---
layout: home
titleTemplate: false

hero:
  name: grammY
  text: Фреймворк для создания Telegram ботов.
  taglines:
    - подумайте, почемУ.
    - новая эра разработки ботов.
    - быстрее вас.
    - получайте удовольствие от создания ботов.
    - на одно обновление впереди.
    - может приготовить всё, кроме блюд.
    - как два пальца об асфальт.
    - обслужил миллиарды и миллиарды.
    - жив благодаря одержимости
  image:
    src: /images/Y.svg
    alt: логотип grammY
  actions:
    - theme: brand
      text: Начать
      link: ./guide/getting-started
    - theme: alt
      text: Документация
      link: ./guide/

features:
  - icon: <lazy-tgs-player class="VPImage" src="/icons/beach-animation.tgs"><img src="/icons/beach.svg" alt="анимация пляжа"></lazy-tgs-player>
    title: Простой в использовании
    details: grammY делает создание ботов Telegram настолько простым, что вы уже знаете, как это сделать.
  - icon: <lazy-tgs-player class="VPImage" src="/icons/palette-animation.tgs"><img src="/icons/palette.svg" alt="анимация палитры"></lazy-tgs-player>
    title: Гибкий
    details: grammY открыт и может быть расширен с помощью плагинов, чтобы точно соответствовать вашим потребностям.
  - icon: <lazy-tgs-player class="VPImage" src="/icons/rocket-animation.tgs"><img src="/icons/rocket.svg" alt="анимация ракеты"></lazy-tgs-player>
    title: Масштабируемый
    details: grammY поможет вам, когда ваш бот станет популярным и трафик возрастет.
---

<!-- markdownlint-disable no-inline-html -->

## Быстрый старт

Боты, написанные на [TypeScript](https://www.typescriptlang.org) или JavaScript, работающие на разныех платформах, включая [Node.js](https://nodejs.org).

`npm install grammy` и вставьте следующий код:

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";

const bot = new Bot(""); // <-- Поместите сюда токен своего бота "" (https://t.me/BotFather)

// Ответит "Привет!" на любое сообщение.
bot.on("message", (ctx) => ctx.reply("Привет!"));

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");

const bot = new Bot(""); // <-- Поместите сюда токен своего бота "" (https://t.me/BotFather)

// Ответит "Привет!" на любое сообщение.
bot.on("message", (ctx) => ctx.reply("Привет!"));

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot(""); // <-- Помістіть токен свого бота між "" (https://t.me/BotFather)

// Ответит "Привет!" на любое сообщение.
bot.on("message", (ctx) => ctx.reply("Привет!"));

bot.start();
```

:::

Работает! :tada:

<footer id="home-footer">

---

<ClientOnly>
  <ThankYou :s="[
    'Благодарим, ',
    '{name}',
    ', за вклад в grammY.',
    ', за создание grammY.']" />
</ClientOnly>

<div style="font-size: 0.75rem; display: flex; justify-content: center;">

© 2021-2024 &middot; grammY поддерживает Telegram Bot API 7.7, который был [выпущен](https://core.telegram.org/bots/api#july-7-2024) 7-го Июля 2024 года
(Последнее изменение: Системные сообщения о возвращённых платежах)

</div>
</footer>