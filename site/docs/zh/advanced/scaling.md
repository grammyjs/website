---
prev: ./structuring.md
next: ./reliability.md
---

# 关注点二：高负载

你的 bot 能够处理高负载的消息取决于你有没有让它处于 [长轮询状态运行或者通过使用 webhooks](/guide/deployment-types.md)。

不论使用哪种方式，你都应该阅读 [下面的一些坑点](#并发是困难的)。

## 长轮询

大多数 bot 都不需要在每分钟处理超过一些信息( "高峰值" 期间)。

换句话来说，伸缩性不是它们要关心的问题。

为了便于预测， grammY 会按顺序处理更新。

这是操作的顺序：

1. 通过 `getUpdates` ([Telegram Bot API Reference](https://core.telegram.org/bots/api#getupdates)) 获取超过100个更新 。
2. 对于每一次更新， `等待` 中间件去堆栈。

不过，如果你的 bot 在高负载期间每秒钟处理一条信息（或者在类似这样的场景下），这可能会对响应造成负面影响。

例如， Bob 的消息必须得等待 Alice 的消息处理完。

这能够通过使用并发去解决，从而不需要等待 Alice 的消息被处理完再执行下一条消息，而同时去处理两条消息。

为了实现最大限度的响应，我们还希望在 Bob 和 Alice 的消息还在处理时引入新的消息。

理想情况下，我们还希望将并发限制在某个固定数量，以约束最大服务器负载。

并发处理的模块并没有被打包在 grammy 的核心库中。

相应替代的是， [grammY runner](/plugins/runner.md) 这个包可以在你的 bot 中使用。

它支持上述所有开箱即用的功能，而且使用起来非常简单。

```ts
// 之前的写法
bot.start();

// 使用 grammY runner 的写法 (从中导出的 `run`)
run(bot);
```

默认的并发量限制在了500。

如果你想对这个库有更深入的了解，[看这里]((/plugins/runner.md))

并发是困难的，所以当你使用 `grammY runner` 的时候你应该记住一些东西，详情看 [下面的小节](#并发是困难的)

## Webhooks

如果你让你的 bot 运行在 webhooks模式下，只要接收到更新它就会并发去处理。

当然，为了让它能够在高负载下运行良好，你应该熟悉 [怎样去使用 webhooks](/guide/deployment-types.md#how-to-use-1)。

这就意味着你不得不去意识到一些并发带来的后果，详见 [下一小节](#并发是困难的)。

Telegram 将按顺序传送来自同一聊天的更新，但也同时并发传送来自不同聊天的更新 ([source](https://github.com/tdlib/telegram-bot-api/issues/75#issuecomment-755436496))。

## 并发是困难的

如果你的 bot 使用并发来处理所有更新，这将会引起一系列需要特别注意的问题。

比如，如果两条来自同一聊天的信息最终被同一个 `getUpdates` 处理，它们将会被并发处理。

同一聊天中消息的顺序不再得到保证。

发生冲突的主要原因是，当你使用 [sessions](/plugins/session.md)，有可能会发生读后写的风险。

想一下这些事件的顺序：

1. Alice 发送消息 A
2. Bot 开始处理消息 A
3. Bot 从数据库中为 Alice 读 session 的数据
4. Alice 发送消息 B
5. Bot 开始处理消息 B
6. Bot 从数据库中为 Alice 读 session 的数据
7. Bot 完成处理消息 A ，并且写入新的 session 到数据库中。
8. Bot 完成处理消息B， 并且写入新的 session到数据库中，并且覆盖掉在处理消息 A 期间执行的操作。
   数据因为读后写而丢失掉了！

> Note: 你可以尝试使用数据库事务对 session 进行处理 ，但你只能检测到风险而不能阻止它。
>
> 尝试使用锁将有效地排除所有并发带来的问题。
>
> 首先避免风险要容易得多。

大多数其他web框架的 session 系统只是简单地接受竞态的风险，因为它们在web上并不经常发生

但是，我们不希望这样，因为Telegram bots 更有可能遇到对同一会话密钥的并行请求冲突。

因此，为了避免这些危险的竞态风险，我们必须确保访问相同的 session 数据的更新是按顺序的。

grammY runner 中封装了 `sequentialize()` 中间件来确保发生冲突的更新可以被按顺序处理。

你可以将其配置为与确定 session 密钥相同的功能 。

它将通过减慢那些（也仅仅是那些）可能引起冲突的更新来避免上述所说的竞态。

<CodeGroup>
  <CodeGroupItem title="TS" active>

```ts
import { Bot, Context, session } from "grammy";
import { run, sequentialize } from "@grammyjs/runner";

// 创建一个 bot
const bot = new Bot("<token>");

/** 解析上下文对象的 session key */
function getSessionKey(ctx: Context) {
  return ctx.chat?.id.toString();
}

// 在访问 session 数据之前顺序化
bot.use(sequentialize(getSessionKey));
bot.use(session({ getSessionKey }));

// 添加常用中间件，现在提供了安全的 session 支持
bot.on("message", (ctx) => ctx.reply("Got your message."));

// 仍然让它并发运行！
run(bot);
```

</CodeGroupItem>

<CodeGroupItem title="JS">

```ts
const { Bot, Context, session } = require("grammy";)
const { run, sequentialize } = require("@grammyjs/runner";)

// 创建一个 bot
const bot = new Bot("<token>");

/** 解析上下文对象的 session key */
function getSessionKey(ctx) {
  return ctx.chat?.id.toString();
}

// 在访问 session 数据之前顺序化
bot.use(sequentialize(getSessionKey));
bot.use(session({ getSessionKey }));

// 添加常用中间件，现在提供了安全的 session 支持
bot.on("message", (ctx) => ctx.reply("Got your message."));

// 仍然让它并发运行！
run(bot);
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot, Context, session } from "https://deno.land/x/grammy/mod.ts";
import { run, sequentialize } from "https://deno.land/x/grammy_runner/mod.ts";

// 创建一个 bot
const bot = new Bot("<token>");

/** 解析上下文对象的 session key */
function getSessionKey(ctx: Context) {
  return ctx.chat?.id.toString();
}

// 在访问 session 数据之前顺序化
bot.use(sequentialize(getSessionKey));
bot.use(session({ getSessionKey }));

// 添加常用中间件，现在提供了安全的 session 支持
bot.on("message", (ctx) => ctx.reply("Got your message."));

// 仍然让它并发运行！
run(bot);
```

</CodeGroupItem>
</CodeGroup>

加入 [Telegram chat](https://t.me/grammjs) 自由的讨论怎样在你的 bot 中使用 grammY 。

我们总是很高兴收到维护大型 bot 项目的朋友的来信，我们可以根据他们的经验来不断改进 grammY。
