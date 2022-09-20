# 托管：Supabase Edge Functions

<Tag type="deno"/>

这个指南告诉你如何将你的 grammY bots 托管到 [Supabase](https://supabase.com/).

请注意，在使用 [Supabase Edge Functions](https://supabase.com/docs/guides/functions) 之前，你需要有一个 [GitHub](https://github.com) 账户。
此外，Supabase Edge Functions 是基于[Deno Deploy](https://deno.com/deploy)，所以就像 [我们的Deno Deploy指南](./deno-deploy.md) 一样，本指南只针对使用 Deno 的 grammY 用户。

Supabase Edge Functions 是大多数简单 bot 的理想选择，并且你应该注意，Supabase Edge Functions 上运行的应用程序不一定完整支持 Deno 的所有功能。
例如，Supabase Edge Functions 上没有文件系统。
它就像其他许多 serverless 平台一样，但专门用于 Deno 应用程序。

这个教程的结果 [可以在我们的示例 bot 仓库中看到](https://github.com/grammyjs/examples/tree/main/supabase-edge-functions)。

## 设置

为了部署 Supabase Edge Functions，你需要创建一个 Supabase 账户，安装他们的 CLI，并创建一个 Supabase 项目。
你应该首先 [按照他们的文档](https://supabase.com/docs/guides/functions#prerequisites) 来进行设置。

通过运行这个命令来创建一个新的 Supabase Function：

```sh
supabase functions new telegram-bot
```

一旦你创建了一个 Supabase Function 项目，你就可以开始编写你的 bot。

## 准备你的代码

> 请注意，你需要 [在 webhooks 上运行你的 bot](../guide/deployment-types.md#如何使用-webhooks)，所以你应该调用 `webhookCallback`，而不是 `bot.start()`。

你可以使用这个简单的示例 bot 作为一个起点。

```ts
import { serve } from "https://deno.land/std/http/server.ts";
import { Bot, webhookCallback } from "https://deno.land/x/grammy/mod.ts";
const bot = new Bot(Deno.env.get("BOT_TOKEN") ?? "");
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
bot.command("ping", (ctx) => ctx.reply(`Pong! ${new Date()}`));
const handleUpdate = webhookCallback(bot, "std/http");
serve(async (req) => {
  try {
    const url = new URL(req.url);
    if (url.searchParams.get("secret") !== bot.token) {
      return new Response("not allowed", { status: 405 });
    }
    return await handleUpdate(req);
  } catch (err) {
    console.error(err);
  }
});
```

## 部署

现在，你可以将你的 bot 部署到 Supabase。
请注意，你需要禁用 JWT 授权，因为 Telegram 使用了不同的方式来确保请求来自于 Telegram。
你可以使用这个命令来部署函数。

```sh
supabase functions deploy --no-verify-jwt telegram-bot
```

然后，你需要将你的 bot token 添加到你的 Supabase 项目中，这样你的代码可以通过环境变量来获取它。

```sh
# 将 123:aBcDeF-gh 替换为你的 bot 的 token。
supabase secrets set BOT_TOKEN=123:aBcDeF-gh
```

你的 Supabase 函数现在可以正常工作了。
剩下的事情是告诉 Telegram 你的 bot 的 webhook 地址。
你可以通过调用 `setWebhook` 来实现。
例如，在浏览器中打开一个新的标签页，并访问这个 URL：

```plaintext
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<PROJECT_NAME>.functions.supabase.co/telegram-bot?secret=<BOT_TOKEN>
```

将 `<BOT_TOKEN>` 替换为你的 bot 的 token。
同时，将第二次出现的 `<BOT_TOKEN>` 替换为你的 bot 的 token。
将 `PROJECT_NAME` 替换为你的 Supabase 项目名。

你应该会在你的浏览器窗口中看到这个。

```json
{ "ok": true, "result": true, "description": "Webhook was set" }
```

完成！
你的 bot 已经可以正常工作了。
现在，转到 Telegram 中，看看它是如何回应消息的！
