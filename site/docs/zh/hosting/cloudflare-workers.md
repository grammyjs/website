---
prev: false
next: false
---

# 托管: Cloudflare Workers

# 托管: Cloudflare Workers (Deno)

[Cloudflare Workers](https://workers.cloudflare.com) 是一个公共的无服务器计算平台，为在 [边缘](https://en.wikipedia.org/wiki/Edge_computing) 上运行小型工作负载提供了便捷且简单的解决方案。

本指南将引导你完成在 Cloudflare Workers 上托管 bot 的过程。

::: tip 正在寻找 Node.js 版本？
本教程介绍如何使用 Deno 将 Telegram bot 部署到 Cloudflare Workers。
如果你正在寻找 Node.js 版本，请查看 [这个教程](./cloudflare-workers-nodejs)。
:::

## 先决条件

请确保你已经拥有 [Cloudflare 帐户](https://dash.cloudflare.com/login)，并且已经 [配置](https://dash.cloudflare.com/?account=workers) 了你的 workers 子域名，以便跟随操作。

## 设置

请确保你已经安装了 [Deno](https://deno.land) 和 [Denoflare](https://denoflare.dev)。

创建一个新目录，并在该目录中创建一个名为 `.denoflare` 的新文件。
将以下内容放入文件中：

> 注意：以下 JSON 代码中的 "$schema" 键在其 URL 中指定了一个固定版本（"v0.5.12"）。
> 在撰写本文时，这是最新可用的版本。
> 你应该将它们更新为 [最新版本](https://github.com/skymethod/denoflare/releases)。

```json{2,9,17-18}
{
  "$schema": "https://raw.githubusercontent.com/skymethod/denoflare/v0.5.12/common/config.schema.json",
  "scripts": {
    "my-bot": {
      "path": "bot.ts",
      "localPort": 3030,
      "bindings": {
        "BOT_TOKEN": {
          "value": "YOUR_BOT_TOKEN"
        }
      },
      "workersDev": true
    }
  },
  "profiles": {
    "account1": {
      "accountId": "YOUR_ACCOUNT_ID",
      "apiToken": "YOUR_API_TOKEN"
    }
  }
}
```

请确保正确替换 `YOUR_ACCOUNT_ID`、`YOUR_API_TOKEN` 和 `YOUR_BOT_TOKEN`。
在创建 API token 时，你可以从预配置的权限中选择 `Edit Cloudflare Workers` 预设选项。

## 创建你的 bot

创建一个名为 `bot.ts` 的新文件，并将以下内容放入其中：

```ts
import { Bot, webhookCallback } from "https://deno.land/x/grammy/mod.ts";
import { UserFromGetMe } from "https://deno.land/x/grammy/types.ts";

interface Environment {
  BOT_TOKEN: string;
}

let botInfo: UserFromGetMe | undefined = undefined;

export default {
  async fetch(request: Request, env: Environment) {
    try {
      const bot = new Bot(env.BOT_TOKEN, { botInfo });

      if (botInfo === undefined) {
        await bot.init();
        botInfo = bot.botInfo;
      }

      bot.command("start", (ctx) => ctx.reply("欢迎！已启动并正在运行。"));
      bot.on("message", (ctx) => ctx.reply("又收到了一条消息!"));

      const cb = webhookCallback(bot, "cloudflare-mod");

      return await cb(request);
    } catch (e) {
      return new Response(e.message);
    }
  },
};
```

## 部署你的 bot

只需运行以下命令：

```sh
denoflare push my-bot
```

上述命令的输出会告诉你正在运行的 worker 的地址。
留意包含类似 `<MY_BOT>.<MY_SUBDOMAIN>.workers.dev` 的行。
那就是你的 bot 的地址。

## 设置你的 webhook

我们需要告诉 Telegram 把 update 发送到哪里。
打开你的浏览器并访问以下网址：

```text
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<MY_BOT>.<MY_SUBDOMAIN>.workers.dev/
```

用你自己的值替换 `<BOT_TOKEN>`，`<MY_BOT>` 和 `<MY_SUBDOMAIN>`。
如果设置成功，你将会看到一个像这样的 JSON 响应：

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

## 测试你的 bot

打开你的 Telegram 应用，然后启动你的 bot。
如果它有响应，就表示一切都搞定了！

## 调试你的 bot

为了测试和调试，在部署你的 bot 到生产环境之前，你可以先在本地或远程开发服务器上运行。
只需执行以下命令：

```sh
denoflare serve my-bot
```

一旦开发服务器启动，你可以使用 `curl`、[Insomnia](https://insomnia.rest) 或 [Postman](https://postman.com) 等工具发送示例 update 来测试你的 bot。
请参阅 [此处](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates) 查看有关 update 示例和 [此处](https://core.telegram.org/bots/api#update) 查看有关 update 结构的更多信息。
