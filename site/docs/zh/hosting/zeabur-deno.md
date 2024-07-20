---
prev: false
next: false
---

# 托管: Zeabur (Deno)

[Zeabur](https://zeabur.com) 是一个可让你轻松部署全栈应用程序的平台。
它支持各种编程语言和框架，包括 Deno 和 grammY。

本教程将指导你如何使用 Deno 将 grammY bot 部署到 [Zeabur](https://zeabur.com)。

::: tip 正在寻找 Node.js 版本？
本教程介绍如何使用 Deno 将 Telegram bot 部署到 Zeabur。
如果你正在寻找 Node.js 版本，请查看 [这篇教程](./zeabur-nodejs)。
:::

## 先决条件

要想继续操作，你需要拥有 [GitHub](https://github.com) 和 [Zeabur](https://zeabur.com) 帐户。

### 方法 1：从头开始创建一个新项目

> 确保你的本地计算机上安装了 Deno。

初始化你的项目并安装一些必要的依赖项：

```sh
# 初始化项目
mkdir grammy-bot
cd grammy-bot

# 创建 main.ts 文件
touch main.ts

# 创建 deno.json 文件以生成锁定文件
touch deno.json
```

然后使用以下代码修改 `main.ts` 文件：

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
if (!token) throw new Error("未设置TELEGRAM_BOT_TOKEN");

const bot = new Bot(token);

bot.command("start", (ctx) => ctx.reply("来自 Deno 和 grammY 的问候！"));

bot.on("message", (ctx) => ctx.reply("有什么需要帮忙的吗？"));

bot.start();
```

> 注意：在 Telegram 上使用 [@BotFather](https://t.me/BotFather) 获取你的 bot token，并在 Zeabur 中将其设置为环境变量 `TELEGRAM_BOT_TOKEN`。
>
> 你可以在 [这个教程](https://zeabur.com/docs/deploy/variables) 中查看如何在 Zeabur 中设置环境变量。

然后运行以下命令来启动你的 bot：

```sh
deno run --allow-net main.ts
```

Deno 将自动下载依赖项、生成锁定文件并启动你的 bot。

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
