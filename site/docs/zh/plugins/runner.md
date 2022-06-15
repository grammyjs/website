# 并发 (`runner`)

如果你使用 [长轮询](/zh/guide/deployment-types.md#长轮询) 的方式运行你的机器人，你可以使用这个包来并发处理消息。

> 在使用 grammY runner 之前，请确保你了解 [关注点二：高负载](/zh/advanced/scaling.md#长轮询)。

## 为什么我们需要一个 bot runner

如果你使用长轮询的方式来托管你的机器人，并且希望它能够扩展，那么就没有办法避免并发处理 update，因为顺序处理 update 太慢了。
因此，bots 将面临一系列的挑战。

- 是否存在竞争条件？
- 我们是否还能 `await` 中间件堆栈？我们必须用它来处理错误！
- 如果中间件因为某种原因永远不能解决，是否会阻塞 bot？
- 是否能限制服务器负载？

正如你可以看到，我们需要一个能够解决上述所有问题的解决方案，以实现长轮询的 bot。
这是一个与组合中间件或发送消息到 Telegram 非常不同的问题。
因此，它不是 grammY 内核包的一部分。
而是使用 [grammY runner](https://github.com/grammyjs/runner)。
它有自己的 [API 参考](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts)。

## 使用方法

这里是一个简单的例子。

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";
import { run } from "@grammyjs/runner";

// 创建一个 bot。
const bot = new Bot("<token>");

// 添加常见的中间件，bala bala
bot.on("message", (ctx) => ctx.reply("Got your message."));

// 并发运行 bot！
run(bot);
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```ts
const { Bot } = require("grammy");
const { run } = require("@grammyjs/runner");

// 创建 bot
const bot = new Bot("<token>");

// 添加常见的中间件，bala bala
bot.on("message", (ctx) => ctx.reply("Got your message."));

// 并发运行 bot！
run(bot);
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { run } from "https://deno.land/x/grammy_runner/mod.ts";

// 创建 bot
const bot = new Bot("<token>");

// 添加常见的中间件，bala bala
bot.on("message", (ctx) => ctx.reply("Got your message."));

// 并发运行 bot！
run(bot);
```

</CodeGroupItem>
</CodeGroup>

当然，这看起来很简单，但是内部做了很多事情。

## 它是如何工作的

每一个运行器都有三个不同的部分。

1. 它的 **source** 从 Telegram 中拉取 updates。
2. 它的 **sink** 提供 updates 给 bot。
3. 它的 **runner** 组件连接 source 和 sink，并允许你启动和停止你的 bot。

```asciiart:no-line-numbers
api.telegram.org <—> source <—> runner <—> sink <—> bot
```

### Source

grammY runner 有一个默认的 source，它可以操作任何 `UpdateSupplier`（[API 参考](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/UpdateSupplier)）。
这样一个 update supplier 可以直接从 bot 实例中创建。
如果你想自己创建一个，请检查 `createUpdateFetcher`（[API 参考](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/createUpdateFetcher)）。

source 是一个异步迭代器，但它可以是活动的或非活动的，并且你可以通过 `close` 方法来断开与 Telegram 服务器的连接。

### Sink

grammY runner 有三种 sink，一种是顺序的（与 bot.start() 相同），一种是批量的（主要用于兼容其他框架），和一种是全并发的（由 `run` 调用）。
所有的 sink 都是在 `UpdateConsumer` 上操作的（[API 参考](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/UpdateConsumer)）。
如果你想自己创建一个，请检查 `Bot` 的 `handleUpdate`（[API 参考](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/Bot#handleUpdate)）。

sink 包含了一个当前正在处理的 updates 的队列（[API 参考](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/DecayingDeque)）。
添加新的 updates 到队列中会立即让 update 消费者处理它们，并且返回一个 Promise，它在队列中有空闲空间时就会解决。
已解决的整数数字表示队列中的空闲空间。
为 grammY runner 设置一个并发限制是通过队列实例来实现的。

队列也会抛弃超时的 updates，并且你可以在创建 sink 时指定一个 `timeoutHandler`。
当然，你也应该在创建 sink 时提供一个错误处理器。

如果你使用 `run(bot)`，那么将使用 `bot.catch` 中的错误处理器。

### Runner

runner 是一个简单的循环，它从 source 中拉取 updates，并将它们提供给 sink。
一旦 sink 可以再次提供 updates，runner 将从 source 中拉取下一批 updates。

当你使用 `createRunner`（[API 参考](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/createRunner)） 创建一个 runner 时，你会获得一个可以控制它的处理器。
例如，它允许你启动和停止它，或者获得一个 Promise，它在 runner 停止时解决。
(这个处理器也会在 `run` 中返回。)
检查 [API 参考](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/RunnerHandle) 中的 `RunnerHandle`。

## 为什么需要顺序处理？

最有可能的原因是，你想保证同一个聊天中的消息被顺序处理。
这在安装 [session 中间件](./session.md) 时很有用，但它也确保了你的 bot 不会在同一个聊天中混乱消息的顺序。

grammY runner 也提供了一个 `sequentialize` 中间件来实现这个目的。
你可以查看 [这个部分](../advanced/scaling.md#concurrency-is-hard) 来学习如何使用它。

我们现在将看一些更高级的使用。

提供的约束函数可以用来指定聊天标识符或用户标识符。
相反，你可以返回一个 _约束标识符列表_，它们决定了每个 update 是否需要单独等待其他计算才能开始处理。

例如，你可以同时返回消息的聊天标识符和消息的用户标识符。

```ts
bot.use(sequentialize((ctx) => {
  const chat = ctx.chat?.id.toString();
  const user = ctx.from?.id.toString();
  return [chat, user].filter((con) => con !== undefined);
}));
```

这将确保同一聊天记录中的消息被正确的排序。
此外，如果 Alice 在群组中发送消息，并且在私人聊天中发送消息给你的 bot，那么这两个消息将被正确的排序。

因此，你可以指定一个更新之间的依赖关系图。
grammY runner 将在运行时自动解决所有必要的约束，并在必要时阻止这些更新，以确保正确的消息顺序。

这是一个非常高效的实现。
它只需要常量内存（除非你指定无限并发），并且它只需要（平均）常量处理时间每个 update。

## 优雅关闭

为了让 bot 正确地完成工作，你应该在进程即将被销毁时，[发出信号](/zh/advanced/reliability.md#使用-grammy-runner) 让 bot 停止。

## 插件概述

- 名字：`runner`
- 源码：<https://github.com/grammyjs/runner>
- 参考：<https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts>
