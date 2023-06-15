---
prev: ./introduction.md
next: ./basics.md
---

# 入门

在几分钟内创建你的第一个 bot。（[向下滚动](#通过-deno-开始) 查看 Deno 指南）。

## 通过 Node.js 开始

> 本指南假定你已经安装了 [Node.js](https://nodejs.org)，并且 `npm` 应该是自带的。
> 如果你不知道这些东西是什么，请查看我们的 [简介](./introduction.md)！

创建一个新的 TypeScript 项目并安装 `grammy` 包。
通过打开终端并键入以下内容来完成。

<CodeGroup>
 <CodeGroupItem title="NPM" active>

```sh
# 创建并进入一个新的目录。
mkdir my-bot
cd my-bot

# 设置 TypeScript（如果你使用 JavaScript 则跳过）。
npm install -D typescript
npx tsc --init

# 安装 grammY。
npm install grammy
```

</CodeGroupItem>
 <CodeGroupItem title="Yarn">

```sh
# 创建并进入一个新的目录。
mkdir my-bot
cd my-bot

# 设置 TypeScript（如果你使用 JavaScript 就跳过）。
yarn add typescript -D
npx tsc --init

# 安装 grammY。
yarn add grammy
```

</CodeGroupItem>
<CodeGroupItem title="pnpm">

```sh
# 创建并进入一个新的目录。
mkdir my-bot
cd my-bot

# 设置 TypeScript（如果你使用 JavaScript 就跳过）。
pnpm add -D typescript
npx tsc --init

# 安装 grammY。
pnpm add grammy
```

</CodeGroupItem>
</CodeGroup>

创建一个新的空文本文件，例如称为 `bot.ts`。
你的文件夹结构现在应该看起来像这样。

```asciiart:no-line-numbers
.
├── bot.ts
├── node_modules/
├── package.json
├── package-lock.json
└── tsconfig.json
```

现在，是时候打开 Telegram 创建一个 bot 账户，并为其获得一个 bot token。
与 [@BotFather](https://t.me/BotFather) 对话来完成这件事。
Bot token 看起来将类似于 `123456:aBcDeF_gHiJkLmNoP-q`。
这是用来认证你的 bot 的。

拿到 token 了吧？你现在可以在 `bot.ts` 文件中编写你的 bot 代码。
你可以把下面这个 bot 的例子复制到该文件中，并把你的 token 传给 `Bot` 构造函数。

<CodeGroup>
 <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";

const bot = new Bot(""); // <-- 把你的 bot token 放在 "" 之间

// 你现在可以在你的 bot 对象 `bot` 上注册监听器。
// 当用户向你的 bot 发送消息时，grammY 将调用已注册的监听器。

// 处理 /start 命令。
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
// 处理其他的消息。
bot.on("message", (ctx) => ctx.reply("Got another message!"));

// 现在，你已经确定了将如何处理信息，可以开始运行你的 bot。
// 这将连接到 Telegram 服务器并等待消息。

// 启动 bot。
bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");

// 创建一个 `Bot` 类的实例，并将你的 bot token 传给它。
const bot = new Bot(""); // <-- 把你的 bot token 放在 "" 之间

// 你现在可以在你的 bot 对象 `bot` 上注册监听器。
// 当用户向你的 bot 发送消息时， grammY 将调用已注册的监听器。

// 处理 /start 命令。
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
// 处理其他的消息。
bot.on("message", (ctx) => ctx.reply("Got another message!"));

// 现在，你已经确定了将如何处理信息，可以开始运行你的 bot。
// 这将连接到 Telegram 服务器并等待消息。

// 启动 bot。
bot.start();
```

</CodeGroupItem>
</CodeGroup>

通过运行以下程序编译代码

```sh
npx tsc
```

在你的终端中。
这将生成 JavaScript 文件 `bot.js`。

现在你可以通过执行以下命令在终端来运行这个 bot：

```sh
node bot.js
```

完成！:tada:

到 Telegram 去看你的 bot 对信息的回应吧!

::: tip 启用日志记录功能
你可以通过运行以下程序来启用基本日志记录

```sh
export DEBUG="grammy*"
```

在你执行 `node bot.js` 之前，先在你的终端机上使用 `node bot.js`。
这使你更容易调试你的 bot。
:::

## 通过 Deno 开始

> 本指南假定你已经安装了 [Deno](https://deno.com/runtime) 。

在某个地方创建一个新的目录，并在其中创建一个新的空文本文件，例如，称为 `bot.ts`。

```sh
mkdir ./my-bot
cd ./my-bot
touch bot.ts
```

现在，是时候打开 Telegram 创建一个 bot 账户，并为其获得一个 bot token。
与 [@BotFather](https://t.me/BotFather) 对话来完成这件事。
Bot token 看起来将类似于 `123456:aBcDeF_gHiJkLmNoP-q`。
这是用来认证你的 bot 的。

拿到 token 了吧？你现在可以在 `bot.ts` 文件中编写你的 bot 代码。
你可以把下面这个 bot 的例子复制到该文件中，并把你的 token 传给 `Bot` 构造函数。

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

// 创建一个 `Bot` 类的实例，并将你的 bot token 传给它。
const bot = new Bot(""); // <-- 把你的 bot token 放在 "" 之间

// 你现在可以在你的 bot 对象 `bot` 上注册监听器。
// 当用户向你的 bot 发送消息时， grammY 将调用已注册的监听器。

// 对 /start 命令作出反应
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
// 处理其他的消息
bot.on("message", (ctx) => ctx.reply("Got another message!"));

// 现在，你已经确定了将如何处理信息，可以开始运行你的 bot。
// 这将连接到 Telegram 服务器并等待消息。

// 启动你的 bot
bot.start();
```

现在你可以通过执行以下命令，在你的终端中运行该 bot：

```sh
deno run --allow-net bot.ts
```

完成！:tada:

到 Telegram 去看你的 bot 对信息的回应吧!

::: tip 启用日志记录功能
在运行你的 bot 之前，你可以在终端中运行以下命令来开启基本日志记录：

```sh
export DEBUG="grammy*"
```

这样可以更容易地调试你的 bot。

你现在需要用以下方法来运行 bot

```sh
deno run --allow-net --allow-env bot.ts
```

现在 grammY 可以检测到 `DEBUG` 是否被设置。
:::
