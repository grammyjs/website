---
prev: ./reliability.md
next: ./transformers.md
---

# 关注点四：流量限制

Telegram 对你的 bot 每秒钟能发送多少条信息进行了限制，详见 [Bot FAQ](https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this) 。

你应当总是确保在限制线之下，否则你的 bot 会达到速率限制。

如果你忽略这些错误，你的 bot 可能最终会被禁用。

## 简单的解决方案

:::warning 不是一个真正的解决方案

这部分可以在短期内解决你遇到的问题， 但是如果你正在编写一个 bot 那它应该要能拓展得比较好，相应的可以阅读 [下一小节](#实用的解决方案（推荐）)
:::

有一个非常简单的解决方案来到达速率限制：如果一个 API 请求由于速率限制而失败了，等待 Telegram 告诉你需要等待的时间就行了，然后重复这个请求。

如果你想做这一步，你可以使用 [超级简单的 `auto-retry` 插件](/zh/plugins/auto-retry.md).

它是一个用来做这一步工作的 [API transformer 函数](/zh/advanced/transformers.md) 。

不过，如果你的 bot 信息流量增长得很快，例如，当你被添加到一个很大的群组，在流量高峰期到达之前，它可能会遇到很多速率限制的错误。

这将会导致被禁用。

此外，由于一些请求可能会被多次尝试，你的服务器将会消耗比必要的多更多的 RAM 和带宽。

与其事后解决问题，还不如将所有的 API 请求入队然后以限定的速度去发送它们。

## 实用的解决方案（推荐）

grammY 给你提供了 [throttler 插件](/zh/plugins/transformer-throttler.md) 让你的 bot 请求自动按照限定的速率去将外部的请求添加到消息队列中。

这个插件设置很简单但却可以为流量控制做出很好的效果。

没有更好的理由去使用 `auto-retry` 插件而不去使用 `throttler` 插件。
