---
home: true
heroImage: /Y.png
actions:
  - text: 立刻开始
    link: /zh/guide/getting-started.md
    type: primary
  - text: 介绍
    link: /zh/guide/introduction.md
    type: secondary
features:
  - title: 易用
    details: grammY 使创建 Telegram Bot 变得如此简单！
  - title: 灵活
    details: grammY 是开放的，通过插件让它完全适合你的需要。
  - title: 可扩展
    details: grammY 在你 bot 拥有较多流量时提供可靠的帮助.
footer: Copyright © 2022
permalink: /zh/
---

<h6 align="right">… {{ [
  '想到了什么？',
  'bot 开发的新时代',
  '运行更快',
  '及时更新',
  '除了洗碗，我都能做',
  '像做柠檬汁一样简单',
  '数以亿计的服务',
][Math.floor(Math.random() * 7)] }}.</h6>

## 快速开始

bot 是用 [TypeScript](https://www.typescriptlang.org)（或JavaScript）编写的，并在各种平台上运行，包括 [Node.js](https://nodejs.org) 。

`npm install grammy` 并粘贴以下代码：

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";

const bot = new Bot(""); // <-- 把你的 bot token 放在这里 (https://t.me/BotFather)

// 用“你好！”来回复任意信息
bot.on("message", (ctx) => ctx.reply("你好！"));

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```ts
const { Bot } = require("grammy");

const bot = new Bot(""); // <-- 把你的 bot token 放在这里 (https://t.me/BotFather)

// 用“你好！”来回复任意信息
bot.on("message", (ctx) => ctx.reply("你好！"));

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot(""); // <-- 把你的 bot token 放在这里 (https://t.me/BotFather)

// 用“你好！”来回复任意信息
bot.on("message", (ctx) => ctx.reply("你好！"));

bot.start();
```

</CodeGroupItem>
</CodeGroup>

运行成功！ :tada:

---

grammY 支持 Telegram Bot API 5.6，该 API 于 2021 年 12 月 30 日 [发布](https://core.telegram.org/bots/api#december-30-2021)。
(新增: 扰流器和改进受保护内容的支持)
