---
prev: false
next: false
---

# 托管：Deno Deploy

本指南介绍如何在 [Deno Deploy](https://docs.deno.com/deploy/) 上运行 grammY bot。

::: warning Deno Deploy 即将停止运营
Deno Deploy Classic 已于 2026 年 7 月停止运营，现有的 Deno Deploy 服务将于 [2027 年 4 月停止运营](https://deno.com/blog/cloudflare)。
如果你要部署新的 bot 或迁移现有的 bot，可以[在 VPS 上运行你的 Deno bot](./vps)。
:::

这个教程的结果 [可以在我们的示例 bot 仓库中看到](https://github.com/grammyjs/examples/tree/main/setups/deno-deploy)。

## 准备你的代码

> 请注意，你需要 [在 webhooks 上运行你的 bot](../guide/deployment-types#如何使用-webhook)，所以你应该调用 `webhookCallback`，而不是 `bot.start()`。

1. 确保你有一个文件可以导出你的`Bot`对象，这样你就可以在以后导入它来运行它。
2. 创建一个名为 `main.ts` 或 `main.js` 的文件，或任何你喜欢的名字（但你应该记住并使用这个文件作为部署的主要文件），其内容如下：

```ts
import { webhookCallback } from "npm:grammy";
// 你可以将其修改为正确的方式来导入你的 `Bot` 对象。
import bot from "./bot.ts";

const handleUpdate = webhookCallback(bot, "std/http");

Deno.serve(async (req) => {
  if (req.method === "POST") {
    const url = new URL(req.url);
    if (url.pathname.slice(1) === bot.token) {
      try {
        return await handleUpdate(req);
      } catch (err) {
        console.error(err);
      }
    }
  }
  return new Response();
});
```

我们建议你将你的处理程序放在一个相对隐蔽的路径而不是根路径（`/`）。
这里，我们使用 bot token 作为路径（`/<bot token>`）。

## 部署

### 方法 1：使用 GitHub

按照 [Deno Deploy 入门指南](https://docs.deno.com/deploy/getting_started/)创建应用并连接你的 GitHub 仓库。
将应用配置为动态应用，使用 `main.ts` 或你之前选定的文件作为入口点，并设置 bot 所需的环境变量。

### 方法 2: 使用 `deno deploy`

按照 [`deno deploy` 文档](https://docs.deno.com/runtime/reference/cli/deploy/)从本地项目创建并部署动态应用。
使用 `main.ts` 或你之前选定的文件作为入口点。

### 注意

在部署完成后，你需要配置你的 bot 的 webhook 设置来指向你的 app。
为了配置 webhook，发送一个请求到

```sh:no-line-numbers
curl https://api.telegram.org/bot<token>/setWebhook?url=<url>
```

将 `<token>` 替换为你的 bot 的 token，并将 `<url>` 替换为你的 app 的完整的 URL 以及 webhook 处理程序的路径。
