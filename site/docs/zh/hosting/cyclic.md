---
prev: false
next: false
---

# 托管: Cyclic

本指南告诉你如何在 [Cyclic](https://cyclic.sh) 上托管 grammY bot。

## 先决条件

你需要一个 [Github](https://github.com) 账号和一个 [Cyclic](https://cyclic.sh) 账号。
首先，初始化你的项目并安装一些依赖：

```sh
# 初始化项目
mkdir grammy-bot
cd grammy-bot
npm init -y

# 安装主要依赖
npm install grammy express dotenv

# 安装开发依赖
npm install -D typescript ts-node nodemon @types/express @types/node

# 初始化 Typescript 配置
npx tsc --init
```

我们将把 Typescript 文件储存在 `src/` 目录下，编译好的文件在 `dist/` 目录下。
在创建了这两个文件夹后，切换目录到 `src/`，并创建一个名为 `bot.ts` 的文件。

```asciiart:no-line-numbers
.
├── node_modules/
├── dist/
├── src/
│   └── bot.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

然后，打开 `tsconfig.json`，用以下配置替换里面的内容：

```json
{
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true
  }
}
```

之后我们需要添加 `start`，`build` 和 `dev` 脚本到 `package.json` 中。
我们的 `package.json` 应该类似于这样：

```json{6-10}
{
  "name": "grammy-bot",
  "version": "1.0.0",
  "description": "",
  "main": "dist/bot.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/bot.js",
    "dev": "nodemon src/bot.ts"
  },
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "grammy": "^1.17.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.4.9",
    "typescript": "^5.1.6",
    "nodemon": "^3.0.1",
    "ts-node": "^10.9.1"
  },
  "keywords": []
}
```

### Webhooks

打开 `src/bot.ts` 并输入以下内容：

```ts{15}
import express from "express";
import { Bot, webhookCallback } from "grammy";
import "dotenv/config";

const bot = new Bot(process.env.BOT_TOKEN || "");

bot.command("start", (ctx) => ctx.reply("Hello World!"))

if (process.env.NODE_ENV === "DEVELOPMENT") {
  bot.start();
} else {
  const port = process.env.PORT || 3000;
  const app = express();
  app.use(express.json());
  app.use(`/${bot.token}`, webhookCallback(bot, "express"));
  app.listen(port, () => console.log(`listening on port ${port}`));
}
```

我们建议你将 webhook 处理程序放在秘密路径上，而不是 `/`。
如上面突出显示的行所示，我们使用 `/<bot-token>` 而不是 `/`。

### 本地开发

在你的项目的根目录下创建一个包含以下内容的 `.env` 的文件：

```
BOT_TOKEN=<bot-token>
NODE_ENV=DEVELOPMENT
```

之后，运行你的 `dev` 脚本：

```sh
npm run dev
```

Nodemon 将监视你的 `bot.ts` 文件，并在每次代码更改时重新启动你的 bot。

## 部署

1. 在 Github 上创建一个仓库，可以是私有的也可以是公开的。
2. 推送你的代码。

> 建议你有一个的稳定分支，以及在单独的分支中进行测试，这样就不会在生产环境中出现意外的行为。

3. 访问你的 [Cyclic dashboard](https://app.cyclic.sh)。
4. 点击 “Link Your Own” 并选择你的仓库。
5. 跳转到 Advanced > Variables，并添加你的 `BOT_TOKEN`。
6. 点击 “Connect Cyclic” 部署你的 bot。

### 设置 Webhook URL

如果你使用的是 webhook，则在首次部署后，你应该将 bot 的 webhook 设置配置为指向你的应用程序。
为此，请发送请求至

```text
https://api.telegram.org/bot<token>/setWebhook?url=<url>/<token>
```

将 `<token>` 替换为你的 bot token，将 `<url>` 替换为应用程序的完整 URL 以及 webhook 处理程序的路径。

恭喜！
你的 bot 现在应该已启动并运行。
