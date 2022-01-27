---
home: true
heroImage: /Y.png
actions:
  - text: Boshlash
    link: /guide/getting-started.md
    type: primary
  - text: Kirish
    link: /guide/introduction.md
    type: secondary
features:
  - title: Foydalanish oson
    details: grammY da Telegram bot qurish naqadar oson
  - title: Moslashuvchan
    details: grammY ochiq va sizning ehtiyojlaringizga mos kelishi uchun plaginlar orqali kengaytirilishi mumkin.
  - title: Kengayuvchan
    details: grammY botingiz ommaviylashib, traffik ko'payganda sizni qoniqtira oladi.
footer: Copyright © 2021-2022
permalink: /
---

<h6 align="right">… {{ [
  'think of the whY',
  'a new era of bot development',
  'runs faster than you',
  'one update ahead',
  'can do anything except dishes',
  'easy peasy lemon squeezY',
  'hundreds of millions served',
][Math.floor(Math.random() * 7)] }}.</h6>

## Boshlash

Botlar [TypeScript](https://www.typescriptlang.org) (yoki JavaScript) da yozilgan va turli platformalarda, jumladan [Node.js](https://nodejs.org) da ishlaydi.

`npm install grammy` va quyidagi kodni joylashtiring:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";

const bot = new Bot(""); // <-- put your bot token here (https://t.me/BotFather)

// Reply to any message with "Hi there!".
bot.on("message", (ctx) => ctx.reply("Hi there!"));

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```ts
const { Bot } = require("grammy");

const bot = new Bot(""); // <-- put your bot token here (https://t.me/BotFather)

// Reply to any message with "Hi there!".
bot.on("message", (ctx) => ctx.reply("Hi there!"));

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot(""); // <-- put your bot token here (https://t.me/BotFather)

// Reply to any message with "Hi there!".
bot.on("message", (ctx) => ctx.reply("Hi there!"));

bot.start();
```

</CodeGroupItem>
</CodeGroup>

Ishladi! :tada:

---

grammY 2021-yil 30-dekabrda [chiqarilgan](https://core.telegram.org/bots/api#december-30-2021) Telegram Bot API 5.6’ni qo‘llab-quvvatlaydi.
(So'ngi ta'kidlash: Spoyler va yaxshilangan himoyalangan kontentni qo'llab-quvvatlash)