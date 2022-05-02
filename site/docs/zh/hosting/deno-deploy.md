# 托管：Deno Deploy

这个指南告诉你如何将你的 grammY bots 托管到 [Deno Deploy](https://deno.com/deploy).

请注意，这个指南只适用于 Deno 用户，你需要一个 [GitHub](https://github.com) 账户来创建一个 [Deno Deploy](https://deno.com/deploy) 账户。

Deno Deploy 是大多数简单 bot 的理想选择，并且你应该注意，不是所有的 Deno 功能都适用于在 Deno Deploy 上运行的应用程序。
例如，Deno Deploy 上没有文件系统。
它就像其他许多 serverless 平台一样，但专门用于 Deno 应用程序。

## 准备你的代码

1. 确保你有一个文件可以导出你的`Bot'对象，这样你就可以在以后导入它来运行它。
2. 创建一个名为 `mod.ts` 或 `mod.js` 的文件，或任何你喜欢的名字（但你应该记住并使用这个文件作为部署的主要文件），其内容如下：

```ts
import { Bot, webhookCallback } from "https://deno.land/x/grammy/mod.ts";
// 你可以将其修改为正确的方式来导入你的 `Bot' 对象。
import bot from "./bot.ts";
import { serve } from "https://deno.land/std/http/server.ts";
const handleUpdate = webhookCallback(bot, "std/http");
serve(async (req) => {
  if (req.method == "POST") {
    try {
      return await handleUpdate(req);
    } catch (err) {
      console.error(err);
      return new Response();
    }
  }
  return new Response();
});
```

## 部署

### 方法 1：使用 GitHub

> 这是推荐的方法，也是最容易操作的方法。
> 使用这种方法的主要优势是，Deno Deploy 将会自动监视你的仓库变化，其中包括你的代码，并自动部署新版本。

1. 在 GitHub 上创建一个新的仓库，它可以是私有的或公开的。
2. 将你的代码推送到这个仓库。

> 建议你有一个单一且稳定的分支，然后在其他分支中进行测试，这样你就不会发送一些意外的事情。

3. 访问你的 [Deno Deploy 仪表台](https://dash.deno.com/projects)。
4. 创建一个新的项目。
5. 滚动到 "Deploy from GitHub" 部分，然后点击 "Continue"。
6. 安装 GitHub 应用程序到你的账户或组织，并选择你的仓库。
7. 选择你想部署的分支，然后选择你要部署的`mod.ts`文件

### 方法 2：使用 URL

> 按照这个方法部署你的 grammY bot，你所需要的只是一个到你的 `mod.ts` 的公开 URL。

1. 在 Deno Deploy 上创建一个新的项目。
2. 点击 "Deploy URL"。
3. 输入你的 `mod.ts` 文件的公开 URL，然后点击 "Deploy"。
