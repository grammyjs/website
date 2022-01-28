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
    details: grammY ochiq va sizning ehtiyojlaringizga mos kelishi uchun pluginlar orqali kengaytirilishi mumkin.
  - title: Kengayuvchan
    details: grammY botingiz ommaviylashib, traffik ko'payganda sizni qoniqtira oladi.
footer: Copyright © 2021-2022
permalink: /uz/
---

<h6 align="right">… {{ [
  'bot rivojlanishining yangi davri',
  'sizdanda tezroq ishlaydi',
  'bir qadam oldinda',
  'idish yuvishdan boshqa',
  'limon siqqandek oson',
  'yuzlab millionlar foydalangan',
][Math.floor(Math.random() * 6)] }}.</h6>

## Boshlash

Botlar [TypeScript](https://www.typescriptlang.org) (yoki JavaScript) da yozilgan va turli platformalarda, jumladan [Node.js](https://nodejs.org)da ishlaydi.

`npm install grammy` va quyidagi kodni joylashtiring:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";

const bot = new Bot(""); // <-- bu yerga bot tokenini joylashtiring (https://t.me/BotFather)

// Har qanday xabarga "Salom!" deya javob qiladi.
bot.on("message", (ctx) => ctx.reply("Salom!"));

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```ts
const { Bot } = require("grammy");

const bot = new Bot(""); // <-- bu yerga bot tokenini joylashtiring (https://t.me/BotFather)

// Har qanday xabarga "Salom!" deya javob qiladi.
bot.on("message", (ctx) => ctx.reply("Salom!"));

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot(""); // <-- bu yerga bot tokenini joylashtiring (https://t.me/BotFather)

// Har qanday xabarga "Salom!" deya javob qiladi.
bot.on("message", (ctx) => ctx.reply("Salom!"));

bot.start();
```

</CodeGroupItem>
</CodeGroup>

Ishladi! :tada:

---

grammY 2021-yil 30-dekabrda [chiqarilgan](https://core.telegram.org/bots/api#december-30-2021) Telegram Bot API 5.6’ni qo‘llab-quvvatlaydi.
(So'nggi yoritish: Spoyler va yaxshilangan himoyalangan kontentni qo'llash)
