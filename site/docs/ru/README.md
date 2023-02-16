# TODO translate to Russian

---
home: true
heroImage: /Y.png
actions:
  - text: Get Started
    link: /guide/getting-started.html
    type: primary
  - text: Introduction
    link: /guide/introduction.html
    type: secondary
features:
  - title: Easy to Use
    details: grammY makes creating Telegram bots so simple you already know how to do it.
  - title: Flexible
    details: grammY is open and can be extended by plugins to make it fit exactly your needs.
  - title: Scalable
    details: grammY has you covered when your bot gets popular and the traffic increases.
footer: Copyright © 2021-2023
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

## Quickstart

Bots are written in [TypeScript](https://www.typescriptlang.org) (or JavaScript) and run on various platforms, including [Node.js](https://nodejs.org).

`npm install grammy` and paste the following code:

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

```js
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

Works! :tada:

---

grammY supports the Telegram Bot API 6.5 which was [released](https://core.telegram.org/bots/api#february-02-2023) on February 2, 2023.
(Last highlight: User and Chat Requests)
