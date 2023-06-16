---
home: true
heroImage: /images/Y.png
actions:
  - text: 立刻开始
    link: /zh/guide/getting-started.html
    type: primary
  - text: 介绍
    link: /zh/guide/introduction.html
    type: secondary
features:
  - title: 易用
    details: grammY 使创建 Telegram Bot 变得如此简单！
  - title: 灵活
    details: grammY 是开放的，通过插件让它完全适合你的需要。
  - title: 可扩展
    details: grammY 在你 bot 拥有较多流量时提供可靠的帮助.
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

::::code-group
:::code-group-item TypeScript

```ts
import { Bot } from "grammy";

const bot = new Bot(""); // <-- 把你的 bot token 放在 "" 之间 (https://t.me/BotFather)

// 用"你好！"来回复任意信息
bot.on("message", (ctx) => ctx.reply("你好！"));

bot.start();
```

:::
:::code-group-item JavaScript

```js
const { Bot } = require("grammy");

const bot = new Bot(""); // <-- 把你的 bot token 放在 "" 之间 (https://t.me/BotFather)

// 用"你好！"来回复任意信息
bot.on("message", (ctx) => ctx.reply("你好！"));

bot.start();
```

:::
:::code-group-item Deno

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot(""); // <-- 把你的 bot token 放在 "" 之间 (https://t.me/BotFather)

// 用"你好！"来回复任意信息
bot.on("message", (ctx) => ctx.reply("你好！"));

bot.start();
```

:::
::::

运行成功！ :tada:

---

<ClientOnly>
  <ThankYou :s="[
    '感谢 ',
    '{name}',
    ' 成为 grammY 的贡献者。',
    ' 创建了 grammY。'
  ]" />
</ClientOnly>

<div style="font-size: 0.75rem; display: flex; justify-content: center;">

© 2021-2023 &middot; grammY 支持 Telegram Bot API 6.7，该 API 于 2023 年 4 月 21 日 [发布](https://core.telegram.org/bots/api#april-21-2023)。
(新增: 多个机器人名称、自定义 emoji 和更好的 inline query)

</div>
