# 托管：Firebase Functions

本教程将指导你完成将 bot 部署到 [Firebase Functions](https://firebase.google.com/docs/functions) 的过程。

## 先决条件

要跟随本教程，你需要有一个 Google 帐户。
如果你还没有，请在 [此处](https://accounts.google.com/signup) 创建。

## 设置

本节将指导你完成设置过程。
如果你需要关于每一步的更详细的解释，你可以参考 [官方 Firebase 文档](https://firebase.google.com/docs/functions/get-started)。

### 创建一个 Firebase 项目

1. 进入 [Firebase 控制台](https://console.firebase.google.com/)，然后点击 **Add Project**。
2. 如果提示，查看并接受 Firebase 条款。
3. 点击 **Continue**。
4. 决定是否要共享分析信息。
5. 点击 **Create Project**。

### 配置环境

要编写函数并将它们部署到 Firebase Functions 运行时，你需要搭建 Node.js 环境并安装 Firebase CLI。

> 请务必注意，Firebase Functions 当前仅支持 Node.js 版本 14、16 和 18。
> 有关受支持的 Node.js 版本的更多信息，请参阅 [此处](https://firebase.google.com/docs/functions/manage-functions#set_nodejs_version)。

当你安装 Node.js 和 npm 后，全局安装 Firebase CLI：

```sh
npm install -g firebase-tools
```

### 初始化项目

1. 运行 `firebase login` 来打开浏览器并使用你的帐户对 Firebase CLI 进行身份验证。
2. `cd` 到你的项目目录中。
3. 运行 `firebase init functions`, 然后当被问到是否要初始化一个新的代码库时，输入 `y`。
4. 选择 `use existing project` 并选择你在第 1 步中创建的项目。
5. CLI 为你提供了两种支持语言的选项：
   - JavaScript
   - TypeScript
6. ESLint 也是可选的。
7. CLI 会询问你是否要使用 npm 安装依赖项。
   如果你使用其他包管理器，如 `yarn` 或 `pnpm`，你可以拒绝。
   在这种情况下，你必须 `cd` 进入 `functions` 目录并手动安装依赖项。
8. 打开 `./functions/package.json` 并查找键：`"engines": {"node": "16"}`。
   `node` 版本应该与你安装的 Node.js 版本相匹配。
   否则，项目可能无法运行。

## 准备你的代码

你可以使用这个简短的示例 bot 作为起点：

```ts
import * as functions from "firebase-functions";
import { Bot, webhookCallback } from "grammy";

const bot = new Bot("");

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
bot.command("ping", (ctx) => ctx.reply(`Pong! ${new Date()}`));

// 在开发期间，你可以从 https://localhost/<firebase-projectname>/us-central1/helloWorld 触发你的函数。
export const helloWorld = functions.https.onRequest(webhookCallback(bot));
```

## 本地开发

在开发过程中，你可以使用 firebase 模拟器套件在本地运行你的代码。
这比将每个更改都部署到 Firebase 要快得多。
要安装模拟器，请运行：

```sh
firebase init emulators
```

函数模拟器应该已经被选中了。
（如果没有被选中，则使用箭头键导航到它，并使用 `空格` 键进行选择。）
对于每个模拟器使用哪个端口的问题，只需按 `回车` 键即可。

要启动模拟器并运行你的代码，请使用以下命令：

```sh
npm run serve
```

::: tip
由于某种原因，npm 脚本的标准配置不会以监视模式启动 TypeScript 编译器。
因此，如果你使用 TypeScript，你还必须运行：

```sh
npm run build:watch
```

:::

模拟器启动后，你应该在控制台输出中找到如下所示的一行：

```sh
+  functions[us-central1-helloWorld]: http function initialized (http://127.0.0.1:5001/<firebase-projectname>/us-central1/helloWorld).
```

这是你的云函数的本地 URL。
然而，你的函数仅在你的计算机上可用。
要实际测试你的 bot，你需要将你的函数公开到互联网上，以便 Telegram API 可以向你的 bot 发送 update。
有多种服务，例如 [localtunnel](https://localtunnel.me) 或 [ngrok](https://ngrok.com)，可以帮助你。
在此示例中，我们将使用 localtunnel。

首先，让我们安装localtunnel：

```sh
npm i -g localtunnel
```

之后，你可以转发端口 `5001`：

```sh
lt --port 5001
```

localtunnel 应该给你一个唯一的 URL，例如 `https://modern-heads-sink-80-132-166-120.loca.lt`。

剩下的就是告诉 Telegram 将 update 发送到哪。
你可以通过调用 `setWebhook` 方法实现。
例如，打开浏览器中的新标签页并访问以下 URL：

```text
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=<WEBHOOK_URL>/<firebase-projectname>/us-central1/helloWorld
```

将 `<BOT_TOKEN>` 替换为你真实的 bot token，并将 `<WEBHOOK_URL>` 替换为你自己的从 localtunnel 获得的 URL。

你现在应该能在浏览器窗口中看到这个。

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

你的 bot 现在已准备好进行部署测试。

## 部署

要部署你的函数，只需运行:

```sh
firebase deploy
```

部署完成后，Firebase CLI 将为你提供函数的 URL。
它看上去应该类似于 `https://<REGION>.<MY_PROJECT.cloudfunctions.net/helloWorld`。
有关更详细的说明，你可以查看 [入门指南](https://firebase.google.com/docs/functions/get-started#deploy-functions-to-a-production-environment) 中的步骤 8。

部署后，你需要通过调用 `setWebhook` 方法告诉 Telegram 将 update 发送到你的 bot。
为此，请打开一个新的浏览器选项卡并访问此 URL：

```text
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<REGION>.<MY_PROJECT>.cloudfunctions.net/helloWorld
```

将 `<BOT_TOKEN>` 替换为你实际的 bot token，将 `<REGION>` 替换为你部署函数的区域名称，并将 `<MY_PROJECT>` 替换为你的 Firebase 项目名称。
Firebase CLI 应该为你提供了云函数的完整 URL，因此你只需将其粘贴到 `setWebhook` 方法中的 `?url=` 参数之后即可。

如果一切设置正确，你应该会在浏览器窗口中看到以下响应：

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

就是这样，你的 bot 已准备就绪。
打开 Telegram 看它对消息的回复吧！
