---
prev: ./proxy.md
---

# 部署清单

在托管一个大型 bot 的时候，这里有一系列你需要深深记在脑海里的东西。

> 你可能也会对我们的部署一个 bot 的指导感兴趣。
> 查看页面顶部的 **托管服务/教程** 查看一些已经有专用指南的平台。

## 错误

1. [使用 `bot.catch`在长轮询或者 webhooks 中安装错误处理器](../guide/errors.md)。
2. 使用 `await` 去等待所有的 Promise，并且安装 **lint** 工具去确保你不会忘记做这件事。

## 发送消息

1. 通过 path 或 `Buffer` 发送文件而不是通过 stream流，或者至少确保你 [了解这些风险](./transformers.md#use-cases-of-transformer-functions)。
2. 使用 `bot.on("callback_query:data")` 作为回调处理 [响应所有回调查询](../plugins/keyboard.md#responding-to-clicks)
3. 使用 [`transformer-throttler` 插件](../plugins/transformer-throttler.md) 去避免到达速率限制。
4. **可选的**，考虑使用 [auto-retry 插件](../plugins/auto-retry.md) 去自动处理流量等待的错误。

## 伸缩性

这取决于你的部署类型。

### 长轮询

1. [使用 grammY runner](../plugins/runner.md)
2. [使用相同的 session 密钥处理函数作为 session 中间件来进行 `sequentialize`](./scaling.md#并发是困难的)
3. 通过 `run`（[参考API](https://deno.land/x/grammy_runner/mod.ts?s=run)）方法的配置选项并确保它们适合你的需求，或者甚至可以考虑用外部的 [资源](https://deno.land/x/grammy_runner/mod.ts?s=UpdateSource) 和 [插槽](https://deno.land/x/grammy_runner/mod.ts?s=UpdateSink) 来组成你自己的 runner。
   主要考虑的事情就是你想给你的服务器应用的最大负载，例如会有多少 update 会在同一时间内被处理。
4. 当你想要结束你的 bot 的时候（或者切换版本的时候），为了优雅去停用你的 bot 可以考虑监听 `SIGINT` 和 `SIGTERM` 事件。
   这个可以通过 grammY runner 提供给你的处理来完成。
   （如果你忽略第一点，因为一些原因你使用了内置的长轮询，请使用 `bot.stop` 方法来进行替代）。

### Webhooks

1. 确保你没有在你的中间件中执行任何长时间的操作，例如大文件的转换。
   这将导致 webhooks 的超时错误，并且 Telegram 将会重复发送未确认的 update。
   考虑用任何队列来代替。
2. 让你自己熟悉 `webhookCallback`（[API参考](https://deno.land/x/grammy/mod.ts?s=webhookCallback)）的配置。
3. 如果你对你的 session 调整过 `getSessionKey` 选项，[使用相同的 session 密钥处理函数作为 session 中间件来进行 `sequentialize`](./scaling.md#concurrency-is-hard)。
4. 如果你在一个 serverless 或者 autoscaling 平台上运行，[设置 bot 信息](https://deno.land/x/grammy/mod.ts?s=BotConfig) 来阻止过多的 `getMe` 调用。
5. 考虑使用 [Webhook Reply](../guide/deployment-types.md#webhook-reply) 。

## Sessions

1. 请考虑使用 [这里](../plugins/session.md#懒会话) 解释的 `lazySessions`。
2. 使用 `storage` 选项去设置你的 storage（存储） 适配器，否则当 bot 进程关闭的时候所有的数据都将会丢失。

## 测试

为你的 bot 编写测试用例。
可以使用 grammY 像这样做：

1. 对外部的 API 请求使用 [transformer 函数](./transformers.md) 来进行 Mock。
2. 通过 `bot.handleUpdate`（[API 参考](https://deno.land/x/grammy/mod.ts?s=Bot#method_handleUpdate_0)）定义并发送一些测试 update 对象到你的 bot。考虑从 Telegram 团队提供的这些 [update 对象](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates) 来获取一些灵感。

::: tip 贡献测试框架
虽然 grammY 提供了必要的 hooks 钩子去编写测试用例，但是如果对于 bot 来说有一个测试框架会更加有用。
这是一个全新的领域，这样的测试框架目前基本上并不存在。
我们很期待你的贡献！

关于如何进行测试的例子 [可以在这里找到](https://github.com/PavelPolyakov/grammy-with-tests)。
:::
