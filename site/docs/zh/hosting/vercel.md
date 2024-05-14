---
prev: false
next: false
---

# 托管: Vercel Serverless Functions

本教程将指导你如何使用 [Vercel Serverless Functions](https://vercel.com/docs/functions) 将 bot 部署到 [Vercel](https://vercel.com/)，假设你已经拥有 [Vercel](https://vercel.com) 帐户。

## 项目结构

开始使用 **Vercel Serverless Functions** 的唯一先决条件是将代码移动到 `api/` 目录，如下所示。
你还可以查看 [Vercel 的文档](https://vercel.com/docs/functions/quickstart) 了解更多信息。

```asciiart:no-line-numbers
.
├── node_modules/
├── build/
├── api/
│   └── bot.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

如果你使用的是 TypeScript，你可能还想安装 `@vercel/node` 作为开发依赖项，但这不是遵循本指南所必需的。

## 配置 Vercel

下一步是在项目的顶层创建一个 `vercel.json` 文件。
对于我们的示例结构，其内容为：

```json
{
  "functions": {
    "api/bot.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

> 如果你想使用 Vercel 的免费订阅，你的 `memory` 和 `maxDuration` 配置可能看起来像上面那样不绕过它的限制。

如果你想了解有关 `vercel.json` 配置文件的更多信息，请参阅[其文档](https://vercel.com/docs/projects/project-configuration)。

## 配置 TypeScript

在我们的 `tsconfig.json` 中，我们必须将输出目录指定为 `build/`，将根目录指定为 `api/`。
这很重要，因为我们将在 Vercel 的部署选项中指定它们。

```json{5,8}
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "commonjs",
    "rootDir": "./api",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "outDir": "./build",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

## 主文件

无论使用 TypeScript 还是 JavaScript，我们都应该有一个源文件来运行我们的 bot。
它应该大致如下所示：

```ts
import { Bot, webhookCallback } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is unset");

const bot = new Bot(token);

export default webhookCallback(bot, "std/http");
```

::: tip [Vercel Edge Functions](https://vercel.com/docs/functions) 为 grammY 提供了有限支持
你仍然可以使用 grammY 核心包和许多插件，但其他的可能会不兼容，因为 Vercel 的 [Edge Runtime](https://edge-runtime.vercel.app) 可能不支持仅支持 Node.js 的依赖项 ）。

目前，我们没有完整的兼容插件列表，因此你需要自行测试。

如果你想切换到 Edge Functions，请将此行添加到上面的代码片段中：

```ts
export const config = {
  runtime: "edge",
};
```

:::

## 在 Vercel 的仪表盘中

假设你已经有了一个连接到你的 GitHub 的 Vercel 帐户，请添加一个新项目并选择你的 bot 的仓库。
在 _Build & Development Settings_ 中：

- Output directory: `build`
- Install command: `npm install`

不要忘记在设置中添加诸如 bot token 之类的密钥作为环境变量。
完成后，你就可以部署它了！

## 设置 Webhook

最后一步是将你的 Vercel 应用程序与 Telegram 连接。
将以下 URL 修改为你的，并在你的浏览器中访问它：

```text
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=<HOST_URL>
```

`HOST_URL` 有点复杂，因为你需要使用你的 **Vercel 应用程序域名加上 bot 代码的路由**，例如 `https://appname.vercel.app/api/bot`。
`bot` 指的是你的 `bot.ts` 或 `bot.js` 文件。

然后你应该看到这样的响应：

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

恭喜！
你的 bot 现在应该已启动并正在运行。
