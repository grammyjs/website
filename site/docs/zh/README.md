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
      text: 文档
      link: ./guide/

features:
  - icon: <lazy-tgs-player class="VPImage" src="/icons/beach-animation.tgs"><img src="/icons/beach.svg" alt="beach animation"></lazy-tgs-player>
    title: 易用
    details: grammY 使创建 Telegram Bot 变得如此简单！
  - icon: <lazy-tgs-player class="VPImage" src="/icons/palette-animation.tgs"><img src="/icons/palette.svg" alt="palette animation"></lazy-tgs-player>
    title: 灵活
    details: grammY 是开放的，通过插件让它完全适合你的需要。
  - icon: <lazy-tgs-player class="VPImage" src="/icons/rocket-animation.tgs"><img src="/icons/rocket.svg" alt="rocket animation"></lazy-tgs-player>
    title: 可扩展
    details: grammY 在你的 bot 拥有较多流量时提供可靠的帮助.
---

<!-- markdownlint-disable no-inline-html -->

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

© 2021-2024 &middot; grammY 支持 Telegram Bot API 7.7，该 API 于 2024 年 7 月 7 日 [发布](https://core.telegram.org/bots/api#july-7-2024)。
(最新亮点: 退款服务消息)

</div>
</footer>
