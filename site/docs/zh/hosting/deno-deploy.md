# 托管：Deno Deploy

这个指南告诉你如何将你的 grammY bots 托管到 [Deno Deploy](https://deno.com/deploy).

请注意，这个指南只适用于 Deno 用户，你需要一个 [GitHub](https://github.com) 账户来创建一个 [Deno Deploy](https://deno.com/deploy) 账户。

Deno Deploy 是大多数简单 bot 的理想选择，并且你应该注意，并且你应该注意，Deno Deploy 上运行的应用程序不一定完整支持 Deno 的所有功能。
例如，Deno Deploy 上没有文件系统。
它就像其他许多 serverless 平台一样，但专门用于 Deno 应用程序。

这个教程的结果 [可以在我们的示例 bot 仓库中看到](https://github.com/grammyjs/examples/tree/main/deno-deploy)。

## 准备你的代码

> 请注意，你需要 [在 webhooks 上运行你的 bot](../guide/deployment-types.md/#如何使用-webhooks)，所以你应该调用 `webhookCallback`，而不是 `bot.start()`。

1. 确保你有一个文件可以导出你的`Bot`对象，这样你就可以在以后导入它来运行它。
2. 创建一个名为 `mod.ts` 或 `mod.js` 的文件，或任何你喜欢的名字（但你应该记住并使用这个文件作为部署的主要文件），其内容如下：

```ts
import { webhookCallback } from "https://deno.land/x/grammy/mod.ts";
import { serve } from "https://deno.land/x/sift@0.5.0/mod.ts";
// 你可以将其修改为正确的方式来导入你的 `Bot` 对象。
import bot from "./bot.ts";

const handleUpdate = webhookCallback(bot, "std/http");

serve({
  ["/" + Deno.env.get("TOKEN")]: async (req) => {
    if (req.method == "POST") {
      try {
        return await handleUpdate(req);
      } catch (err) {
        console.error(err);
      }
    }
    return new Response();
  },
  "/": () => {
    return new Response("Hello world!");
  },
});
```

我们建议你将你的处理程序放在一个相对隐蔽的路径而不是根路径（`/`）。
这里，我们使用 bot token 作为路径（`/<bot token>`）。

## 部署

### 方法 1：使用 GitHub

> 这是推荐的方法，也是最容易操作的方法。
> 使用这种方法的主要优势是，Deno Deploy 将会自动监视你的仓库变化，其中包括你的代码，并自动部署新版本。

1. 在 GitHub 上创建一个新的仓库，它可以是私有的或公开的。
2. 将你的代码推送到这个仓库。

> 建议你有一个单一且稳定的分支，然后在其他分支中进行测试，这样你就不会发送一些意外的事情。

3. 访问你的 [Deno Deploy 仪表台](https://dash.deno.com/projects)。
4. 点击 "New Project"，然后进入 "Deploy from GitHub repository" 部分
5. 安装 GitHub 应用程序到你的账户或组织，并选择你的仓库。
6. 选择你想部署的分支，然后选择你要部署的`mod.ts`文件

### 方法 2: 使用 `deployctl`

> 这是一个更高级的方法，它允许你通过命令行或 Github Actions 来部署项目。

1. 访问你的 [Deno Deploy 仪表台](https://dash.deno.com/projects).
2. 点击 "New Project"，然后再选择 "Empty Project".
3. 安装 [`deployctl`](https://github.com/denoland/deployctl).
4. [创建一个访问 token](https://dash.deno.com/user/access-tokens).
5. 执行以下命令：

```bash
deployctl deploy --project <project> ./mod.ts --prod --token <token>
```

6. 配置 GitHub Action，请参考 [这里](https://github.com/denoland/deployctl/blob/main/action/README.md).

### 方法 3：使用 URL

> 按照这个方法部署你的 grammY bot，你只需要一个到你的 `mod.ts` 的公开 URL。

1. 在 Deno Deploy 上创建一个新的项目。
2. 点击 "Deploy URL"。
3. 输入你的 `mod.ts` 文件的公开 URL，然后点击 "Deploy"。

### 注意

在部署完成后，你需要配置你的 bot 的 webhook 设置来指向你的 app。
为了配置 webhook，发送一个请求到

```text
https://api.telegram.org/bot<token>/setWebhook?url=<url>
```

将 `<token>` 替换为你的 bot 的 token，并将 `<url>` 替换为你的 app 的完整的 URL 以及 webhook 处理程序的路径。
