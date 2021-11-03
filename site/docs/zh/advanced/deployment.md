---
prev: ./proxy.md
---

# 部署清单

在托管一个大型 bot 的时候，这里有一系列你需要深深记在脑海里的东西。

> 你可能也会对我们的部署一个 bot 的指导感兴趣。
>
> 查看页面顶部的 **资源/托管服务** 查看一些已经有专用指南的平台。

## 错误

1. [安装一个错误处理器 `bot.catch`](/zh/guide/errors.md)。
2. 使用 `await` 去等待所有的 Promise，并且使用 **lint** 工具去确保你不会忘记做这件事。

## 发送消息

1. 通过 path 或 `Buffer` 发送文件而不是通过 stream流，或者至少确保你 [了解这些风险](./transformers.md#use-cases-of-transformer-functions)。
2. 使用 `bot.on('callback_query:data')` 作为回调处理 [响应所有回调查询](/zh/plugins/keyboard.md#响应点击)。

3. 使用 [`transformer-throttler` 插件](/zh/plugins/transformer-throttler.md) 去避免到达速率限制。

## 伸缩性

这取决于你的部署类型。

### 长轮询

1. [使用 grammY runner](/zh/plugins/runner.md)

2. [使用相同的 session 密钥处理函数作为 session 中间件来进行 `sequentialize`](./scaling.md#并发是困难的)

3. 通过 `run` （[参考API](https://doc.deno.land/https/deno.land/x/grammy_runner/mod)）方法的配置选项并确保它们适合你的需求，或者甚至可以考虑用外部的资源和插槽来组成你自己的 runner 。

4. 当你想要结束你的 bot 的时候（或者切换版本的时候），为了优雅去停用你的 bot 可以考虑监听 `SIGINT` 和 `SIGTERM` 事件。

   这个可以通过 grammY runner 提供给你的处理来完成。

   （如果你忽略第一点，因为一些原因你使用了内置的长轮询，请使用 `bot.stop` 方法来进行替代）。

### Webhooks

1. 如果你对你的 session 调整过 `getSessionKey` 选项，[使用相同的 session 密钥处理函数作为 session 中间件来进行 `sequentialize`](./scaling.md#并发是困难的)。

2. 让你自己熟悉 `webhookCallback` （[API参考](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#webhookCallback)）的配置。
3. 如果你在一个 serverless 或者 autoscaling 平台上运行，[设置 bot 信息](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#BotConfig) 来阻止过多的 `getMe` 调用。
4. 考虑使用 [webhook 回复](/zh/guide/deployment-types.html#webhook-reply) 。

## Sessions

1. 请考虑使用 [这里](/zh/plugins/session.md#懒会话) 解释的 `lazySessions`。
2. 使用 `storage` 选项去设置你的 storage（存储） 适配器，否则当 bot 进程关闭的时候所有的数据都将会丢失。

## 测试

为你的 bot 编写测试用例。

可以使用 grammY 像这样做：

1. 对外部的 API 请求使用 [transformer 函数](./transformers.md) 来进行Mock。
2. 通过 `bot.handleUpdate` （参考API）定义并发送一些测试更新对象到你的 bot 。考虑从 Telegram 团队提供的 [这些更新对象](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates) 来获取一些灵感。
