---
home: true
heroImage: /images/Y.png
actions:
  - text: Розпочати
    link: /uk/guide/getting-started.html
    type: primary
  - text: Вступ
    link: /uk/guide/introduction.html
    type: secondary
features:
  - title: Простий у використанні
    details: grammY робить створення ботів Telegram настільки простим, що ви вже знаєте, як це зробити.
  - title: Гнучкий
    details: grammY відкритий і може бути розширений за допомогою плагінів, щоб точно відповідати вашим потребам.
  - title: Масштабований
    details: grammY допоможе вам, коли ваш бот стане популярним і трафік зросте.
footer: Copyright © 2021-2023
permalink: /uk/
---

<h6 align="right">… {{ [
  'подумай, чомУ',
  'нова ера розробки ботів',
  'бігає швидше за тебе',
  'попереду ще одне оновлення',
  'може зробити все, окрім вечері',
  'легко, як з обійстя виховати козУ',
  'обслуговано сотні мільйонів',
][Math.floor(Math.random() * 7)] }}.</h6>

## Швидкий старт

Боти, написані на [TypeScript](https://www.typescriptlang.org) або JavaScript, працюють на різних платформах, зокрема [Node.js](https://nodejs.org).

`npm install grammy` і вставте наступний код:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";

const bot = new Bot(""); // <-- Помістіть токен свого бота (https://t.me/BotFather)

// Відповідайте "Привіт!" на будь-яке повідомлення.
bot.on("message", (ctx) => ctx.reply("Привіт!"));

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");

const bot = new Bot(""); // <-- Помістіть токен свого бота (https://t.me/BotFather)

// Відповідайте "Привіт!" на будь-яке повідомлення.
bot.on("message", (ctx) => ctx.reply("Привіт!"));

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot(""); // <-- Помістіть токен свого бота (https://t.me/BotFather)

// Відповідайте "Привіт!" на будь-яке повідомлення.
bot.on("message", (ctx) => ctx.reply("Привіт!"));

bot.start();
```

</CodeGroupItem>
</CodeGroup>

Працює! :tada:

---

grammY підтримує Telegram Bot API 6.5, який був [випущений](https://core.telegram.org/bots/api#february-3-2023) 3-го лютого 2023 року.
(Остання зміна: запити для користувачів і чатів)
