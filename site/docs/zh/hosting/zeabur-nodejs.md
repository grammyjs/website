---
prev: false
next: false
---

# 托管: Zeabur (Node.js)

[Zeabur](https://zeabur.com) 是一个可让你轻松部署全栈应用程序的平台。
它支持各种编程语言和框架，包括 Deno 和 grammY。

本教程将指导你如何使用 Node.js 将 grammY bot 部署到 [Zeabur](https://zeabur.com)。

::: tip 正在寻找 Deno 版本？
本教程介绍如何使用 Node.js 将 Telegram bot 部署到 Zeabur。
如果你正在寻找 Deno 版本，请查看 [这篇教程](./zeabur-deno)。
:::

## 先决条件

要想继续操作，你需要拥有 [GitHub](https://github.com) 和 [Zeabur](https://zeabur.com) 帐户。

### 方法 1：从头开始创建一个新项目

初始化你的项目并安装一些必要的依赖项：

```sh
# 初始化项目
mkdir grammy-bot
cd grammy-bot
npm init -y

# 安装主要依赖项
npm install grammy

# 安装开发依赖项
npm install -D typescript ts-node @types/node

# 初始化 TypeScript
npx tsc --init
```

然后，`cd` 到 `src/`，并创建一个名为 `bot.ts` 的文件。
你将在其中编写 bot 的代码。

现在，你可以开始在 `src/bot.ts` 中编写 bot 的代码了。

```ts
import { Bot } from "grammy";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("未设置TELEGRAM_BOT_TOKEN");

const bot = new Bot(token);

bot.on("message:text", async (ctx) => {
  console.log("Message: ", ctx.message.text);

  const response = "你好，我是机器人！";

  await ctx.reply(response);
});

bot.start();
```

> 注意：在 Telegram 上使用 [@BotFather](https://t.me/BotFather) 获取你的 bot token，并在 Zeabur 中将其设置为环境变量 `TELEGRAM_BOT_TOKEN`。
>
> 你可以在 [这个教程](https://zeabur.com/docs/deploy/variables) 中查看如何在 Zeabur 中设置环境变量。

现在你的项目的根目录应该如下所示：

```asciiart:no-line-numbers
.
├── node_modules/
├── src/
│   └── bot.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

然后我们必须将 `start` 脚本添加到 `package.json` 中。
我们的 `package.json` 现在应该与此类似：

```json
{
  "name": "telegram-bot-starter",
  "version": "1.0.0",
  "description": "Telegram Bot Starter with TypeScript and grammY",
  "scripts": {
    "start": "ts-node src/bot.ts" // [!code focus]
  },
  "author": "MichaelYuhe",
  "license": "MIT",
  "dependencies": {
    "grammy": "^1.21.1"
  },
  "devDependencies": {
    "@types/node": "^20.14.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.5"
  }
}
```

现在，你可以通过运行以下命令在本地运行你的 bot：

```sh
npm run start
```

### 方法 2：使用 Zeabur 的模板

Zeabur 已经提供了一个模板供你使用。
你可以在 [这里](https://github.com/zeabur/deno-telegram-bot-starter) 找到它。

你只需使用模板并开始编写 bot 的代码即可。

## 部署

### 方法 1：在 Zeabur Dashboard 中从 GitHub 进行部署

1. 在 GitHub 上创建一个仓库，它可以是公共的或私有的，并将你的代码推送到其中。
2. 跳转到 [Zeabur dashboard](https://dash.zeabur.com)。
3. 点击 `New Project` 按钮，然后点击 `Deploy New Service` 按钮，选择 `GitHub` 作为源并选择你的仓库。
4. 跳转到 `Variables` 选项卡添加环境变量，例如 `TELEGRAM_BOT_TOKEN`。
5. 你的服务将自动部署。

### 方法 2：使用 Zeabur CLI 进行部署

`cd` 进入你的项目目录并运行以下命令：

```sh
npx @zeabur/cli deploy
```

按照说明选择要部署的区域，你的 bot 将自动部署。
