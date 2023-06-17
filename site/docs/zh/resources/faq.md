---
prev: false
next: false
---

# FAQ

这里收集了一些 [常见错误](#为什么我会收到这个错误) 和 [Deno](#关于-deno-的问题) 的常见问题。

如果这个 FAQ 不能回答你的问题，你也应该看看 Telegram 团队写的 [Bot FAQ](https://core.telegram.org/bots/faq)。

## 在哪里可以找到有关方法的文档？

在 API 参考中。
你可能想更好地理解 [这个](../guide)。

## 方法缺少参数！

不，不是的。

1. 确保安装了最新版本的 grammY。
2. 在 [这里](https://core.telegram.org/bots/api) 查看参数是否是可选的。
   如果是，则 grammY 会将其收集到名为 `other` 的选项对象中。
   在那个地方传递 `{ parameter_name: value }` 就可以了。
   与以往一样，TypeScript 会为你自动补全参数名称。
3. 也许在 [这里](https://deno.land/x/grammy/mod.ts?s=Context#Methods) 再次检查 `ctx` 上的 [操作](../guide/context#可用操作) 的方法签名，或在 [这里](https://deno.land/x/grammy/mod.ts?s=Api#Methods) 检查 API 方法（`ctx.api`、`bot.api`）的方法签名。

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
最重要的是，我们的 [parse-mode 插件](../plugins/parse-mode) 大大简化了这一点。
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
你可以在 [群聊](https://t.me/grammyjs)（或者 [使用俄语的群聊](https://t.me/grammyjs_ru)） 中问我们。

### 409 Conflict: terminated by other getUpdates request

你不小心在长轮询模式下运行了你的 bot 两次。
你只能运行一个实例。

如果你认为你只运行了你的 bot 一次，那么你可以直接撤销 bot token。
这将停止所有其他实例。
和 [@BotFather](https://t.me/BotFather) 交流来撤销 token。

### 429: Too Many Requests: retry after X

恭喜你。
你遇到了一个最难解决的错误。

有两种可能的情况：

**一**：你的 bot 没有太多用户。
在这种情况下，你只是发送了太多请求，以至于被 Telegram 服务器禁用了。
解决方案：不要这样做。
你应该认真考虑如何大幅减少 API 的调用数量。

**二**：你的 bot 非常受欢迎，它有非常多的用户（成千上万）。
你已经确保使用了最少的 API 调用，并且仍然遇到这些错误（称为 flood wait）。

这里有几件事情你可以做：

1. 阅读文档中的这篇 [文章](../advanced/flood) 以获得对情况的基本了解。
2. 使用 [`transformer-throttler` 插件](../plugins/transformer-throttler)。
3. 使用 [`auto-retry` 插件](../plugins/auto-retry)。
4. 在 [群聊](https://t.me/grammyjs) 中向我们寻求帮助。我们有经验丰富的人能帮你。
5. 可以要求 Telegram 增加限制，但如果不先执行步骤 1-3，就不太可能发生这种情况。

### Cannot find type definition file for 'node-fetch'

这是因为你丢失了类型定义。

推荐的解决方案是在你的 TypeScript 编译选项中设置 `skipLibCheck` 为 `true`。

如果你确定你需要这个选项保持为 `false`，你可以通过运行 `npm i -D @types/node-fetch@2` 安装丢失的类型定义。

## 关于 Deno 的问题

### 你为什么要支持 Deno？

这里有一些我们觉得 Deno 比 Node.js 更好的原因：

- 从零开始更简单、更快速。
- 工具链有大幅度优化。
- 它可以原生执行 TypeScript。
- 不需要维护 `package.json` 或者 `node_modules`。
- 它有一个经过审查的标准库。

> Deno 是由发明 Node.js 的同一个人 Ry 创造的。
> 他在这个 [视频](https://youtu.be/M3BM9TB-8yA) 里总结了他对 Node.js 的 10 个遗憾。

grammY 实际上在编写时是优先 Deno，然后再支持 Node.js。
