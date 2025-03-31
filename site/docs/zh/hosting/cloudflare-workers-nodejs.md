---
prev: false
next: false
---

# 托管: Cloudflare Workers (Node.js)

[Cloudflare Workers](https://workers.cloudflare.com/) 是一个公共 serverless
计算平台，为在 [边缘](https://en.wikipedia.org/wiki/Edge_computing) 运行
JavaScript 提供了一种方便简单的解决方案。 能够处理 HTTP 流量并基于
[Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)，构建
Telegram bot 变得轻而易举。 此外，你甚至可以在边缘开发
[Web Apps](https://core.telegram.org/bots/webapps)，所有这些都在一定额度内免费。

本指南将带你完成在 Cloudflare Workers 上托管 Telegram bot 的过程。

::: tip 正在寻找 Deno 版本？ 本教程介绍如何使用 Node.js 将 Telegram bot 部署到
Cloudflare Workers。 如果你正在寻找 Deno 版本，请查看
[这个教程](./cloudflare-workers)。 :::

## 先决条件

1. 一个 [Cloudflare 帐户](https://dash.cloudflare.com/login)，并
   [已配置](https://dash.cloudflare.com/?account=workers) 你的 workers 子域名。
2. 一个安装了 `npm` 的 [Node.js](https://nodejs.org/) 环境。

## 设置

首先，创建一个新项目：

```sh
npm create cloudflare@latest
```

然后你会被要求输入你的 worker 的名称：

```ansi{6}
using create-cloudflare version 2.17.1

╭ Create an application with Cloudflare Step 1 of 3
│
╰ In which directory do you want to create your application? also used as application name  // [!code focus]
  ./grammybot  // [!code focus]
```

在这里，我们创建了一个名为 `grammybot` 的项目，你可以选择自己的名称，这将是你的
worker 的名称以及请求 URL 的一部分。

::: tip 你可以稍后在 `wrangler.toml` 中更改你的 worker 的名称。 :::

接下来，你会被要求选择你的 worker 类型，这里我们选择 `"Hello World" Worker`：

```ansi{8}
using create-cloudflare version 2.17.1

╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./grammybot
│
╰ What type of application do you want to create?  // [!code focus]
  ● "Hello World" Worker  // [!code focus]
  ○ "Hello World" Worker (Python)  // [!code focus]
  ○ "Hello World" Durable Object  // [!code focus]
  ○ Website or web app  // [!code focus]
  ○ Example router & proxy Worker  // [!code focus]
  ○ Scheduled Worker (Cron Trigger)  // [!code focus]
  ○ Queue consumer & producer Worker  // [!code focus]
  ○ API starter (OpenAPI compliant)  // [!code focus]
  ○ Worker built from a template hosted in a git repository  // [!code focus]
```

接下来，你会被要求选择是否要使用 TypeScript，如果要使用 JavaScript，请选择
`No`。 这里我们选择 `Yes`：

```ansi{11}
using create-cloudflare version 2.17.1

╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./grammybot
│
├ What type of application do you want to create?
│ type "Hello World" Worker
│
╰ Do you want to use TypeScript?  // [!code focus]
  Yes / No  // [!code focus]
```

你的项目将在几分钟内建立。 之后，你会被问到是否要使用 git
进行版本控制，如果你希望仓库自动被初始化，请选择
`Yes`，如果你想稍后自行初始化，请选择 `No`。

这里，我们选择 `Yes`:

```ansi{36}
using create-cloudflare version 2.17.1

╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./grammybot
│
├ What type of application do you want to create?
│ type "Hello World" Worker
│
├ Do you want to use TypeScript?
│ yes typescript
│
├ Copying template files
│ files copied to project directory
│
├ Updating name in `package.json`
│ updated `package.json`
│
├ Installing dependencies
│ installed via `npm install`
│
╰ Application created

╭ Configuring your application for Cloudflare Step 2 of 3
│
├ Installing @cloudflare/workers-types
│ installed via npm
│
├ Adding latest types to `tsconfig.json`
│ added @cloudflare/workers-types/2023-07-01
│
├ Retrieving current workerd compatibility date
│ compatibility date 2024-04-05
│
╰ Do you want to use git for version control?  // [!code focus]
  Yes / No  // [!code focus]
```

最后，你会被问到是否要部署你的 worker，请选择
`No`，因为我们将在有了一个可以运行的 Telegram bot 时部署它：

```ansi{49}
using create-cloudflare version 2.17.1

╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./grammybot
│
├ What type of application do you want to create?
│ type "Hello World" Worker
│
├ Do you want to use TypeScript?
│ yes typescript
│
├ Copying template files
│ files copied to project directory
│
├ Updating name in `package.json`
│ updated `package.json`
│
├ Installing dependencies
│ installed via `npm install`
│
╰ Application created

╭ Configuring your application for Cloudflare Step 2 of 3
│
├ Installing @cloudflare/workers-types
│ installed via npm
│
├ Adding latest types to `tsconfig.json`
│ added @cloudflare/workers-types/2023-07-01
│
├ Retrieving current workerd compatibility date
│ compatibility date 2024-04-05
│
├ Do you want to use git for version control?
│ yes git
│
├ Initializing git repo
│ initialized git
│
├ Committing new files
│ git commit
│
╰ Application configured

╭ Deploy with Cloudflare Step 3 of 3
│
╰ Do you want to deploy your application?  // [!code focus]
  Yes / No  // [!code focus]
```

## 安装依赖

`cd` 进入 `grammybot`（将其替换为你在上面设置的 worker 的名称），安装 `grammy`
以及你可能需要的其他软件包：

```sh
npm install grammy
```

## 创建你的 bot

编辑 `src/index.js` 或 `src/index.ts`，在里面写下这段代码：

```ts{11,28-29,38,40-42,44}
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Bot, Context, webhookCallback } from "grammy";

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
  //
  // Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
  // MY_QUEUE: Queue;
  BOT_INFO: string;
  BOT_TOKEN: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const bot = new Bot(env.BOT_TOKEN, { botInfo: JSON.parse(env.BOT_INFO) });

    bot.command("start", async (ctx: Context) => {
      await ctx.reply("Hello, world!");
    });

    return webhookCallback(bot, "cloudflare-mod")(request);
  },
};
```

这里, 我们首先从 `grammy` 导入 `Bot`，`Context` 和 `webhookCallback`。

在接口 `Env` 中，我们添加一个变量 `BOT_INFO`，这是一个存储你的 bot
信息的环境变量，你可以通过调用 Telegram Bot API 的 `getMe` 方法来获取你的 bot
信息。 在网页浏览器中打开以下链接：

```ansi:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/getMe
```

将 `<BOT_TOKEN>` 替换为你的 bot token。 如果成功，你将看到类似于以下内容的 JSON
响应：

```json{3-12}
{
    "ok": true,
    "result": {
        "id": 1234567890,
        "is_bot": true,
        "first_name": "mybot",
        "username": "MyBot",
        "can_join_groups": true,
        "can_read_all_group_messages": false,
        "supports_inline_queries": true,
        "can_connect_to_business": false
    }
}
```

现在，在项目根目录中打开 `wrangler.toml`，并在 `[vars]` 部分下添加一个环境变量
`BOT_INFO`，其中包含上面获得的 `result` 对象的值，如下所示：

```toml
[vars]
BOT_INFO = """{
    "id": 1234567890,
    "is_bot": true,
    "first_name": "mybot",
    "username": "MyBot",
    "can_join_groups": true,
    "can_read_all_group_messages": false,
    "supports_inline_queries": true,
    "can_connect_to_business": false
}"""
```

将 bot 信息替换为你从网页浏览器获取的信息。 注意开头和结尾的三个双引号 `"""`。

除了 `BOT_INFO` 之外，我们还添加了一个变量 `BOT_TOKEN`，这是一个储存 bot token
的环境变量，用来创建你的 bot。

你可能会注意到，我们只是定义了变量 `BOT_TOKEN`，但尚未给它赋值。
通常你需要将环境变量存储在 `wrangler.toml`
中，但是，在我们的情况下这并不安全，因为 bot token 应该保密。 Cloudflare Workers
为我们提供了一种安全的方法来在环境变量中存储 API
密钥和身份验证令牌等敏感信息：[secrets](https://developers.cloudflare.com/workers/configuration/secrets/#secrets-on-deployed-workers)！

::: tip 定义 secret 的值后，它们在 Wrangler 或 Cloudflare dashboard 中不可见。
:::

你可以使用以下命令向项目添加 secret：

```sh
npx wrangler secret put BOT_TOKEN
```

根据指示输入你的 bot token，你的 bot token 就会被上传并加密。

::: tip
你可以将环境变量更改为你想要的任何名称，但请记住，在后面步骤中也要执行相同的操作。
:::

在函数 `fetch()` 中，我们使用 `BOT_TOKEN` 创建一个 bot，当它收到 `/start`
时会回复 “Hello, world!”。

## 部署你的 bot

现在，你可以使用以下命令部署 bot：

```sh
npm run deploy
```

## 设置你的 Webhook

我们需要告诉 Telegram 将 update 发送到哪里。 打开浏览器并访问这个 URL：

```ansi:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<MY_BOT>.<MY_SUBDOMAIN>.workers.dev/
```

将 `<BOT_TOKEN>` 替换为你的 bot token，将 `<MY_BOT>` 替换为你的 worker
的名称，将 `<MY_SUBDOMAIN>` 替换为你在 Cloudflare dashboard 上配置的 worker
子域名。

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
如果它响应，则表示你一切都搞定了！

## 调试你的 bot

出于测试和调试目的，你可以在将 bot 部署到生产环境之前运行本地或远程开发服务器。

在开发环境中，你的 bot 无法访问你的 secret 环境变量。
因此，[根据 Cloudflare](https://developers.cloudflare.com/workers/configuration/secrets/#local-development-with-secrets)，你可以在项目的根目录中创建一个
`.dev.vars` 文件来定义 secret：

```env
BOT_TOKEN=<your_bot_token>  # <- 将此处替换成你的 bot token。
```

别忘了为开发环境添加 `BOT_INFO`。 点击
[此处](https://developers.cloudflare.com/workers/configuration/environment-variables/)
和 [此处](https://developers.cloudflare.com/workers/configuration/secrets/)
了解更多有关环境变量和 secret 的详细信息。

如果你在上一步中更改了环境变量名称，请将 `BOT_INFO` 和 `BOT_TOKEN`
替换为你的变量名称。

::: tip 你可以使用另一个 bot 的 token 来开发，以确保不会影响生产环境。 :::

现在，你可以运行以下命令来启动开发服务器：

```sh
npm run dev
```

开发服务器启动后，你可以使用 `curl`、[Insomnia](https://insomnia.rest) 或
[Postman](https://postman.com) 等工具向其发送示例 update 来测试你的 bot。 请参阅
[此处](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates)
获取 update 示例和 [此处](https://core.telegram.org/bots/api#update) 获取有关
update 结构的更多信息。

如果你不想构造 update，或者想要测试真实的 update，则可以使用 `getUpdates` 方法从
Telegram Bot API 获取 update。 为此，你需要先删除 webhook。
打开你的网页浏览器并访问此链接：

```ansi:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/deleteWebhook
```

将 `<BOT_TOKEN>` 替换为你的 bot token，你会看到一个类似这样的 JSON 响应：

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was deleted"
}
```

然后，打开你的 Telegram 客户端并发送点东西给你的 bot，比如，发送 `/start`。

现在，在网页浏览器中访问此链接以获取 update：

```ansi:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
```

再一次，将 `<BOT_TOKEN>` 替换为你的 bot
token，如果成功，你将看到一个类似于这样的 JSON 响应：

```json{4-29}
{
    "ok": true,
    "result": [
        {
            "update_id": 123456789,
            "message": {
                "message_id": 123,
                "from": {
                    "id": 987654321,
                    "is_bot": false,
                    "first_name": "",
                    "language_code": "en"
                },
                "chat": {
                    "id": 987654321,
                    "first_name": "",
                    "type": "private"
                },
                "date": 1712803046,
                "text": "/start",
                "entities": [
                    {
                        "offset": 0,
                        "length": 6,
                        "type": "bot_command"
                    }
                ]
            }
        }
    ]
}
```

`result` 是一个 update 对象的数组（上面仅包含一个 update
对象），你应该只复制一个对象并通过使用前面提到的工具将此对象 post
到开发服务器来测试你的 bot。

如果你想忽略过时的 update（例如，在部署到生产环境之前忽略开发期间的所有
update），你可以向 `getUpdates` 方法添加参数 `offset`，如下所示：

```ansi:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/getUpdates?offset=<update_id>
```

将 `<BOT_TOKEN>` 替换为你的 bot token，并将 `<update_id>` 替换为你收到的最新
update 的 `update_id`（数字最大的那个），这样你将只会收到晚于该 update 的
update，并且再也无法获取之前的 update。

现在，你就可以在本地开发环境中使用真实的 update 对象来测试你的 bot 了！

你还可以使用一些反向代理服务（例如
[Ngrok](https://ngrok.com/)）将本地开发服务器暴露到公网，并将 webhook
设置为你从它们那里获得的 URL，或者你也可以设置自己的反向代理（如果你有公网 IP
地址、域名和 SSL 证书的话），但这超出了本指南的范围。
有关设置反向代理的更多信息，请参阅你使用的软件的文档。

::: warning 使用第三方反向代理可能会导致信息泄露！ :::

::: tip 部署到生产环境时，不要忘记[重新设置 webhook](#设置你的-webhook)。 :::
