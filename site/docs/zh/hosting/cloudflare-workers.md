---
prev: false
next: false
---

# 托管: Cloudflare Workers

[Cloudflare Workers](https://workers.cloudflare.com/) 是一个公共 serverless 计算平台，为在 [边缘](https://en.wikipedia.org/wiki/Edge_computing) 运行 JavaScript 提供了一种方便简单的解决方案。
能够处理 HTTP 流量并基于 [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)，构建 Telegram bot 变得轻而易举。
此外，你甚至可以在边缘开发 [Web Apps](https://core.telegram.org/bots/webapps)，所有这些都在一定额度内免费。

本指南将带你完成在 Cloudflare Workers 上托管 Telegram bot 的过程。

## 先决条件

请确保你有一个 [Cloudflare 帐户](https://dash.cloudflare.com/login)，并 [已配置](https://dash.cloudflare.com/?account=workers) 你的 workers 子域名.

## 设置

首先，创建一个新项目：

```sh
npx wrangler generate my-bot
```

你可以将 `my-bot` 更改为你想要的任何内容。
这将是你的 bot 的名字和项目目录。

运行上述命令后，按照你看到的说明初始化项目。
在那里，你可以选择 JavaScript 或 TypeScript。

当项目初始化时，`cd` 进入 `my-bot` 或你初始化的项目的目录。
根据你初始化项目的方式，你应该看到类似于以下的文件结构：

```asciiart:no-line-numbers
.
├── node_modules
├── package.json
├── package-lock.json
├── src
│   ├── index.js
│   └── index.test.js
└── wrangler.toml
```

接下来，安装 `grammy` 和你可能需要的其他软件包：

```sh
npm install grammy
```

## 创建你的 bot

编辑 `src/index.js` 或 `src/index.ts`，在里面写下这段代码：

```ts
// 请注意，我们是从 `grammy/web` 而不是 `grammy` 导入。
import { Bot, webhookCallback } from "grammy/web";

// 你可以将 `BOT_TOKEN` 替换为你的 bot token，但最好将其存储在环境变量中。
// 更多有关信息，请参阅 https://developers.cloudflare.com/workers/platform/environment-variables/#secrets-on-deployed-workers.
// 你还应该将 `BOT_INFO` 替换为从 `bot.api.getMe()` 获得的 bot 信息。
const bot = new Bot(BOT_TOKEN, { botInfo: BOT_INFO });

bot.command("start", async (ctx) => {
  await ctx.reply("Hello, world!");
});

addEventListener("fetch", webhookCallback(bot, "cloudflare"));
```

上面示例的 bot 收到 `/start` 时，它将回复“Hello, world!”。

## 部署你的 bot

在部署之前，我们需要编辑 `wrangler.toml`：

```toml
account_id = 'your account_id' # 从 Cloudflare Dashboard 获取它。
name = 'my-bot' # 你的 bot 的名字, 将出现在 webhook URL 中, 例如: https://my-bot.my-subdomain.workers.dev
main = "src/index.js"  # Worker 的入口文件
compatibility_date = "2023-01-16"
```

然后，你可以使用以下命令进行部署：

```sh
npm run deploy
```

## 设置你的 Webhook

我们需要告诉 Telegram 将 update 发送到哪里。
打开浏览器并访问这个 URL：

```txt
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<MY_BOT>.<MY_SUBDOMAIN>.workers.dev/
```

将 `<BOT_TOKEN>`、`<MY_BOT>` 和 `<MY_SUBDOMAIN>` 替换为你的值。
如果设置成功，你将看到如下 JSON 响应：

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

## 测试你的 bot

打开你的 Telegram 应用程序，然后启动你的 bot。
如果它响应，则表示你可以开始了！

## 调试你的 bot

出于测试和调试目的，你可以在将 bot 部署到生产环境之前运行本地或远程开发服务器。
只需运行以下命令：

```sh
npm run start
```

开发服务器启动后，你可以使用 `curl`、[Insomnia](https://insomnia.rest) 或 [Postman](https://postman.com) 等工具向其发送示例 update 来测试你的 bot.
请参阅 [此处](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates) 获取 update 示例和 [此处](https://core.telegram.org/bots/api#update) 获取有关 update 结构的更多信息。
