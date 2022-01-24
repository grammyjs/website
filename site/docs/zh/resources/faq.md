# FAQ

这里收集了一些 [关于 grammY 本身](#关于-grammy-的问题)，[常见错误](#为什么我会收到这个错误) 和 [Deno](#关于-deno-的问题) 的常见问题。

如果这个 FAQ 不能答复你的问题，你也应该看看 Telegram 团队写的 [Bot FAQ]((https://core.telegram.org/bots/faq))。

## 关于 grammY 的问题

### grammY 是什么？

grammY 是一个用于在 [Telegram](https://telegram.org) 上创建聊天 bot 的软件（也可以说是一个框架）。
当你在创建 bot 时，你会发现其中有很大一部分是重复且乏味的。
grammY 帮你完成了这些繁琐的工作，让你创建 bot 变得超级简单。

### grammY 是什么时候被创造出来的？

grammY 的首次发布是在 2021 年 3 月底。
几周后，我们发布了第一个稳定版本。

### grammY 是如何开发的？

grammY 是一个完全免费并且开源的软件，由一个志愿者团队开发。
你可以在 GitHub 上找到它的源码。

我们非常欢迎你的 [加入](https://t.me/grammyjs)！
（如果你会说俄语，你也可以在 [这里](https://t.me/grammyjs_ru) 加入我们！）

### grammY 使用什么编程语言？

grammY 是由 TypeScript 编写的，一个 JavaScript 的超集。
因此，它可以在 Node.js 上运行。
并且，grammY 也可以在 Deno（它将自己定义为 Node.js 的继承者）上运行。
（从技术上来讲，你可以在现代浏览器上运行 grammY，尽管这可能没什么用。）

### grammY 和它的竞争对手相比如何？

如果你来自不同编程语言或者不同的 JavaScript 框架，你可以查看我们 [框架之间的细节比较](./comparison.md)。

## 为什么我会收到这个错误？

### 400 Bad Request: Cannot parse entities

你正在发送带有格式的消息，即你设置了 `parse_mode`。
但是你的格式不正确，因此 Telegram 不知道怎么解析它。
你应该在 Telegram 文档中重新阅读 [关于格式化选项](https://core.telegram.org/bots/api#formatting-options)。
错误消息中提到的字节偏移量将告诉你在你的字符串中出错的位置。

::: tip 传入 entities 而不是格式化
如果你愿意，你可以在 Telegram 上预解析 entities，并在发送消息时指定 `entities`。
然后你的消息文本可以是一个普通的字符串。
这样以来，你不必担心对奇怪的字符进行转义。
这可能会看起来需要更多代码，但实际上它是这个问题的最可靠和安全的解决方案。
:::

### 401 Unauthorized

你的 bot token 是错误的。
也许你认为它是对的。
其实不然。
和 [@BotFather](https://t.me/BotFather) 交流，以获得你正确的 token。

### 403 Forbidden: bot was blocked by the user

你可能试图向一个用户发送信息，然后你遇到了这个问题。

当一个用户屏蔽了你的 bot，你就无法向他们发送消息或以任何其他方式与他们互动（除非你的机器人被邀请参加该用户是成员的群聊）。
Telegram 会这样做以保护他们的用户。
对此，你无能为力。

你可以选择：

- 处理这个错误，例如从你的数据库中删除该用户的数据。
- 忽略这个错误。
- 通过 `bot.on("my_chat_member")` 监听 `my_chat_member` 的 updates，以便在用户屏蔽了你的 bot 时获得通知。
  提示：比较新旧聊天成员的 `status` 字段。

### 404 Not found

如果这个错误出现在你的 bot 启动时，那么你的 bot token 是错误的。
和 [@BotFather](https://t.me/BotFather) 交流，以获得你正确的 token。

如果你的 bot 大多数时间都能正常工作，但是突然发生了 404 错误，那么你可能正在做一些奇怪的事情。
你可以在群聊中问我们。

### 409 Conflict: terminated by other getUpdates request

你不小心在长轮询模式下运行了你的 bot 两次。
你只能运行一个实例。

如果你认为你只运行了你的 bot 一次，那么你可以直接撤销 bot token。
这将停止所有其他实例。
和 [@BotFather](https://t.me/BotFather) 交流来撤销 token。

### 429: Too Many Requests: retry after X

恭喜你。
你遇到了一个最难解决的错误。

有两种可能的情况。

一：你的 bot 没有太多用户。
在这种情况下，你只是发送了太多请求，以至于被 Telegram 服务器禁用了。
解决方案：不要这样做。
你应该认真考虑如何大幅减少 API 的调用数量。

二：你的 bot 非常受欢迎，它有非常多的用户（成千上万）。
你已经确保使用了最少的 API 调用，并且仍然遇到这些错误（称为 flood wait）。

这里有几件事情你可以做。

1. 阅读 [这篇文章](/zh/advanced/flood.md) 以获得对情况的基本了解。
2. 使用 [`transformer-throttler` 插件](/zh/plugins/transformer-throttler.md)。
3. 使用 [`auto-retry` 插件](/zh/plugins/auto-retry.md)。
4. 在群聊中向我们寻求帮助。我们有经验丰富的人能帮你。
5. 可以要求 Telegram 增加限制，但如果不先执行步骤 1-3，就不太可能发生这种情况。

## 关于 Deno 的问题

### 你为什么要支持 Deno？

这里有一些我们觉得 Deno 比 Node.js 更好的原因：

- 从零开始更简单、更快速。
- 工具链有大幅度优化。
- 它可以原生执行 TypeScript。
- 不需要维护 `package.json` 或者 `node_modules`。
- 它有一个经过审查的标准库。

> Deno 是由发明 Node.js 的同一个人 Ry 创造的。
> 他在 [这个视频](https://youtu.be/M3BM9TB-8yA) 里总结了他对 Node.js 的 10 个遗憾。

grammY 实际上在编写时是优先 Deno，然后再支持 Node.js。

### 我在哪里可以托管 Deno 程序？

因为 Deno 比较新，并且生态系统还不够完善，所以你能够托管 Deno 应用的地方比 Node.js 的少。
以下是你可以托管 Deno 应用的一些选择：

1. [Cloudflare Workers](https://workers.dev)
2. [Deno Deploy](https://deno.com/deploy)
3. [Heroku](https://dev.to/ms314006/deploy-your-deno-apps-to-heroku-375h)
4. [Vercel](https://github.com/vercel-community/deno)
