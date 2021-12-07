---
home: true
heroImage: /Y.png
actions:
  - text: Get Started
    link: /guide/getting-started.md
    type: primary
  - text: Introduction
    link: /guide/introduction.md
    type: secondary
features:
  - title: Easy to Use
    details: grammY makes creating Telegram bots so simple you already know how to do it.
  - title: Flexible
    details: grammY is open and can be extended by plugins to make it fit exactly your needs.
  - title: Scalable
    details: grammY has you covered when your bot gets popular and the traffic increases.
footer: Copyright © 2021
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

Works! :tada:

---

grammY supports the Telegram Bot API 5.5 which was [released](https://core.telegram.org/bots/api#december-7-2021) on December 7, 2021.
(Last highlight: Responses to Join Requests)
