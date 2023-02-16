---
home: true
heroImage: /images/Y.png
actions:
  - text: Первые шаги
    link: /guide/getting-started.html
    type: primary
  - text: Введение
    link: /guide/introduction.html
    type: secondary
features:
  - title: Простой
    details: grammY позволяет создавать Телеграм-ботов так просто, что ты уже знаешь как.
  - title: Гибкий
    details: grammY открытый и может научиться всему, что тебе нужно, через плагины.
  - title: Масштабируемый
    details: grammY позаботится обо всём, когда твой бот станет популярным, а трафик взлетит.
footer: Все права защищены © 2021-2023
permalink: /ru/
---

<h6 align="right">… {{ [
  'подумай почемY',
  'новая эра ботов',
  'работает быстрее, чем ты',
  'на шаг впереди',
  'делает всё, кроме обедов',
][Math.floor(Math.random() * 5)] }}.</h6>

## Начинаем

Ботов пишут на [TypeScript](https://www.typescriptlang.org) (или JavaScript) и запускают на различных платформах, включая [Node.js](https://nodejs.org).

Запусти `npm install grammy` и скопируй этот код:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";

const bot = new Bot(""); // <-- сюда вставь токен бота (https://t.me/BotFather)

// Отвечаем "Привееет!" на любое сообщение.
bot.on("message", (ctx) => ctx.reply("Привееет!"));

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");

const bot = new Bot(""); // <-- сюда вставь токен бота (https://t.me/BotFather)

// Отвечаем "Привееет!" на любое сообщение.
bot.on("message", (ctx) => ctx.reply("Привееет!"));

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot(""); // <-- сюда вставь токен бота (https://t.me/BotFather)

// Отвечаем "Привееет!" на любое сообщение.
bot.on("message", (ctx) => ctx.reply("Привееет!"));

bot.start();
```

</CodeGroupItem>
</CodeGroup>

Работает! :tada:

---

grammY поддерживает Telegram Bot API 6.5, который был [выпущен](https://core.telegram.org/bots/api#february-02-2023) 2 февраля, 2023.
(Из интересного: пользователи и запросы в чаты)
