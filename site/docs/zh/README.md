---
layout: home
titleTemplate: false

hero:
  name: grammY
  text: Telegram Bot 框架。
  taglines: 
    - 想到了什么？
    - bot 开发的新时代。
    - 运行更快。
    - 愉快地创建 bot。
    - 及时更新。
    - 除了洗碗，我都能做。
    - 像做柠檬汁一样简单。
    - 已处理数十亿请求。
    - 由执念驱动。
  image:
    src: /images/Y.svg
    alt: grammY 徽标
  actions:
    - theme: brand
      text: 立刻开始
      link: ./guide/getting-started
    - theme: alt
      text: 介绍
      link: ./guide/introduction

features:
  - icon: <img class="VPImage" src="/icons/beach-animation.webp" alt="beach animation" width="32" height="32">
    title: 易用
    details: grammY 使创建 Telegram Bot 变得如此简单！
  - icon: <img class="VPImage" src="/icons/palette-animation.webp" alt="palette animation" width="32" height="32">
    title: 灵活
    details: grammY 是开放的，通过插件让它完全适合你的需要。
  - icon: <img class="VPImage" src="/icons/rocket-animation.webp" alt="rocket animation" width="32" height="32">
    title: 可扩展
    details: grammY 在你的 bot 拥有较多流量时提供可靠的帮助.
---

<HomeContent>

## 快速开始

bot 是用 [TypeScript](https://www.typescriptlang.org)（或JavaScript）编写的，并在各种平台上运行，包括 [Node.js](https://nodejs.org) 。

`npm install grammy` 并粘贴以下代码：

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";

const bot = new Bot(""); // <-- 把你的 bot token 放在 "" 之间 (https://t.me/BotFather)

// 用"你好！"来回复任意信息
bot.on("message", (ctx) => ctx.reply("你好！"));

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");

const bot = new Bot(""); // <-- 把你的 bot token 放在 "" 之间 (https://t.me/BotFather)

// 用"你好！"来回复任意信息
bot.on("message", (ctx) => ctx.reply("你好！"));

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot(""); // <-- 把你的 bot token 放在 "" 之间 (https://t.me/BotFather)

// 用"你好！"来回复任意信息
bot.on("message", (ctx) => ctx.reply("你好！"));

bot.start();
```

:::

运行成功！ :tada:

<footer id="home-footer">

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

© 2021-2023 &middot; grammY 支持 Telegram Bot API 6.8，该 API 于 2023 年 8 月 18 日 [发布](https://core.telegram.org/bots/api#august-18-2023)。
(新增: story)

</div>
</footer>
</HomeContent>
