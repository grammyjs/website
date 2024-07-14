---
prev: false
next: false
---

# 并发 (`runner`)

如果你使用 [长轮询](../guide/deployment-types) 的方式运行你的机器人，你可以使用这个包来并发处理消息。

> 在使用 grammY runner 之前，请确保你了解 [关注点二：高负载](../advanced/scaling#长轮询)。

## 为什么我们需要一个 bot runner

如果你使用长轮询的方式来托管你的机器人，并且希望它能够扩展，那么就没有办法避免并发处理 update，因为顺序处理 update 太慢了。
因此，bots 将面临一系列的挑战。

- 是否存在竞态条件？
- 我们是否还能 `await` 中间件堆栈？我们必须用它来处理错误！
- 如果中间件因为某种原因永远不能解决，是否会阻塞 bot？
- 我们可以按顺序处理一些选定的 update 吗？
- 是否能限制服务器负载？
- 我们可以在多核上处理 update 吗？

正如你可以看到，我们需要一个能够解决上述所有问题的解决方案，以实现长轮询的 bot。
这是一个与组合中间件或发送消息到 Telegram 非常不同的问题。
因此，它不是 grammY 内核包的一部分。
而是使用 [grammY runner](https://github.com/grammyjs/runner)。
它有自己的 [API 参考](/ref/runner/)。

## 使用方法

这里是一个简单的例子。

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { run } from "@grammyjs/runner";

// 创建一个 bot。
const bot = new Bot("");

// 添加常见的中间件，bala bala
bot.on("message", (ctx) => ctx.reply("Got your message."));

// 并发运行 bot！
run(bot);
```

```js [JavaScript]
const { Bot } = require("grammy");
const { run } = require("@grammyjs/runner");

// 创建 bot
const bot = new Bot("");

// 添加常见的中间件，bala bala
bot.on("message", (ctx) => ctx.reply("Got your message."));

// 并发运行 bot！
run(bot);
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { run } from "https://deno.land/x/grammy_runner/mod.ts";

// 创建 bot
const bot = new Bot("");

// 添加常见的中间件，bala bala
bot.on("message", (ctx) => ctx.reply("Got your message."));

// 并发运行 bot！
run(bot);
```

:::

## 为什么需要顺序处理？

最有可能的原因是，你想保证同一个聊天中的消息被顺序处理。
这在安装 [session 中间件](./session) 时很有用，但它也确保了你的 bot 不会在同一个聊天中混乱消息的顺序。

grammY runner 也提供了一个 `sequentialize` 中间件来实现这个目的。
你可以查看这个 [部分](../advanced/scaling#并发是困难的) 来学习如何使用它。

我们现在将看一些更高级的使用。

提供的约束函数可以用来指定聊天标识符或用户标识符。
相反，你可以返回一个 _约束标识符列表_，它们决定了每个 update 是否需要单独等待其他计算才能开始处理。

例如，你可以同时返回消息的聊天标识符和消息的用户标识符。

```ts
bot.use(
  sequentialize((ctx) => {
    const chat = ctx.chat?.id.toString();
    const user = ctx.from?.id.toString();
    return [chat, user].filter((con) => con !== undefined);
  }),
);
```

这将确保同一聊天记录中的消息被正确的排序。
此外，如果 Alice 在群组中发送消息，并且在私人聊天中发送消息给你的 bot，那么这两个消息将被正确的排序。

因此，你可以指定一个更新之间的依赖关系图。
grammY runner 将在运行时自动解决所有必要的约束，并在必要时阻止这些更新，以确保正确的消息顺序。

这是一个非常高效的实现。
它只需要常量内存（除非你指定无限并发），并且它只需要（平均）常量处理时间每个 update。

## 优雅关闭

为了让 bot 正确地完成工作，你应该在进程即将被销毁时，[发出信号](../advanced/reliability#使用-grammy-runner) 让 bot 停止。

请注意， 你可以通过 `await` 那个从 `run` 返回的 [`RunnerHandle`](/ref/runner/runnerhandle) 中的 `task` 来等待 runner 停止。

```ts
const handle = run(bot);
handle.task().then(() => {
  console.log("Bot done processing!");
});
```

## 高级选项

grammY runner 由三部分组成：source、sink 和 runner。
source 拉取 update，sink 消费 update，runner 配置并连接两者。

> 可以在 [下面](#它背后是如何工作的) 查看有关 runner 内部工作方式的深入描述。

这三个部分中的每一个都可以通过各种选项进行配置。
这可以减少网络流量，让你指定允许的 update 等等。

runner 的每个部分都通过专用的选项对象接受其配置。

```ts
run(bot, {
  source: {},
  runner: {},
  sink: {},
});
```

你应该查看 [API 参考](/ref/runner/runoptions) 中的 `RunOptions` 以查看哪些选项可用。

例如，你会发现可以使用以下代码片段启用 `allowed_updates`。

```ts
run(bot, { runner: { fetch: { allowed_updates: [] } } });
```

## 多线程

> 如果你的 bot 每天不处理至少 5000 万个 update （每秒 >500 个），那么多线程就毫无意义。
> 如果你的 bot 处理的流量比这少，那么请 [跳过此部分](#它背后是如何工作的)。

JavaScript 是单线程的。
这很棒棒，因为[并发是困难的](../advanced/scaling#并发是困难的)，这意味着如果只有一个线程，自然会消除很多令人头疼的问题。

然而，如果你的 bot 负载非常高（我们说的是每秒 1000 个以上的 update），那么在单个内核上完成所有工作可能就不够了。
基本上，单个核心在处理你的 bot 所必须处理的所有消息的 JSON 时就开始心有余而力不足了。

### 用于处理 Update 的 Bot Worker

这有一个简单的出路：bot worker！
grammY runner 允许你创建多个 worker，它们可以在实际不同的核心（使用不同的事件循环和单独的内存）上并行处理你的 update。

在 Node.js 中, grammY runner 使用 [Worker 线程](https://nodejs.org/api/worker_threads.html)。
在 Deno 中, grammY runner 使用 [Web Workers](https://docs.deno.com/runtime/manual/runtime/workers)。

从概念上讲，grammY runner 为你提供了一个名为 `BotWorker` 的类，它可以处理 update。
它等同于常规类 `Bot`（实际上，它甚至是 `extends Bot`）。
`BotWorker` 和 `Bot` 之间的主要区别在于 `BotWorker` 无法获取 update。
相反，它必须从一个常规 `Bot` 接收。

```asciiart:no-line-numbers
1. 获取 update                                    Bot
                                              __// \\__
                                           __/  /   \  \__
2. 发送 update 到 workers                __/    /     \    \__
                                     __/      /       \      \__
                                    /        /         \        \
3. 处理 update              BotWorker   BotWorker   BotWorker   BotWorker
```

grammY runner 为你提供了可以将 update 发送给 bot worker 的中间件。
然后 bot worker 可以接收此 update 并处理它。
这样，中心 bot 只需关心在它编排的 bot worker 之间拉取和分发 update。
实际的 update 处理（过滤消息、发送回复等）由 bot worker 执行。

现在让我们看看如何使用它。

### 使用 Bot Workers

> 可以在 [grammY runner 仓库](https://github.com/grammyjs/runner/tree/main/examples) 中找到这方面的示例。

我们将从创建中心 bot 实例开始，它获取 update 并将它们分发给 worker。
让我们首先创建一个名为 `bot.ts` 的文件，其中包含以下内容。

::: code-group

```ts [TypeScript]
// bot.ts
import { Bot } from "grammy";
import { distribute, run } from "@grammyjs/runner";

// 创建 bot。
const bot = new Bot("");

// 可选地，在此处对 update 进行顺序化操作。
// bot.use(sequentialize(...))

// 在 bot worker 之间分发 update。
bot.use(distribute(__dirname + "/worker"));

// 使用多线程并发运行。
run(bot);
```

```js [JavaScript]
// bot.js
const { Bot } = require("grammy");
const { distribute, run } = require("@grammyjs/runner");

// 创建 bot。
const bot = new Bot("");

// 可选地，在此处对 update 进行顺序化操作。
// bot.use(sequentialize(...))

// 在 bot worker 之间分发 update。
bot.use(distribute(__dirname + "/worker"));

// 使用多线程并发运行。
run(bot);
```

```ts [Deno]
// bot.ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { distribute, run } from "https://deno.land/x/grammy_runner/mod.ts";

// 创建 bot。
const bot = new Bot("");

// 可选地，在此处对 update 进行顺序化操作。
// bot.use(sequentialize(...))

// 在 bot worker 之间分发 update。
bot.use(distribute(new URL("./worker.ts", import.meta.url)));

// 使用多线程并发运行。
run(bot);
```

:::

在 `bot.ts` 之后，我们创建了第二个，名为 `worker.ts` 的文件（如上面代码第 12 行所指定）。
这将包含实际的 bot 逻辑。

::: code-group

```ts [TypeScript]
// worker.ts
import { BotWorker } from "@grammyjs/runner";

// 创建一个新的 bot worker。
const bot = new BotWorker(""); // <-- 再次在这里传入你的 bot token

// 添加消息处理逻辑。
bot.on("message", (ctx) => ctx.reply("yay!"));
```

```js [JavaScript]
// worker.js
const { BotWorker } = require("@grammyjs/runner");

// 创建一个新的 bot worker。
const bot = new BotWorker(""); // <-- 再次在这里传入你的 bot token

// 添加消息处理逻辑。
bot.on("message", (ctx) => ctx.reply("yay!"));
```

```ts [Deno]
// worker.ts
import { BotWorker } from "https://deno.land/x/grammy_runner/mod.ts";

// 创建一个新的 bot worker。
const bot = new BotWorker(""); // <-- 再次在这里传入你的 bot token

// 添加消息处理逻辑。
bot.on("message", (ctx) => ctx.reply("yay!"));
```

:::

> 请注意，每个 worker 都能够将消息发送回 Telegram。
> 这就是为什么你也必须把你的 bot token 给每个 worker。

你不必启动 bot worker，或从文件中导出任何内容。
创建一个 `BotWorker` 实例就足够了。
它会自动监听 update。

理解**只有原始 update** 会发送给 bot worker 是很重要的。
换句话说，[上下文对象](../guide/context) 为每次 update 创建两次：一次在 `bot.ts` 中，以便它可以被分发给 bot worker，一次在 `worker.ts` 中，以便让它可以真正地被处理。
更重要的是：安装在 `bot.ts` 中的上下文对象上的属性不会发送给 bot worker。
这意味着所有插件都必须安装在 bot worker 中。

::: tip 仅分发一些 update
作为性能优化，你可以丢弃不想处理的 update 。
这样，你的 bot 就不必将更新发送给 worker，在那里就被忽略了。

::: code-group

```ts [Node.js]
// 我们的 bot 只处理消息、编辑和 callback query。
// 因此我们可以忽略其他所有 update ，不分发它们。
bot.on(
  ["message", "edited_message", "callback_query"],
  distribute(__dirname + "/worker"),
);
```

```ts [Deno]
// 我们的 bot 只处理消息、编辑和 callback query。
// 因此我们可以忽略其他所有 update ，不分发它们。
bot.on(
  ["message", "edited_message", "callback_query"],
  distribute(new URL("./worker.ts", import.meta.url)),
);
```

:::

默认情况下，`distribute` 创建 4 个 bot worker。
你可以轻松调整此数字。

```ts
// 在 8 个 bot worker 中分发 update。
bot.use(distribute(workerFile, { count: 8 }));
```

请注意，你的应用程序不应创建比 CPU 上的物理核心更多的线程。
这不会提高性能，反而会降低性能。

## 它背后是如何工作的

当然，虽然使用 grammY runner 看起来非常简单，但在背后却发生了很多事情。

每一个 runner 都有三个不同的部分。

1. 它的 **source** 从 Telegram 中拉取 updates。
2. 它的 **sink** 提供 updates 给 bot。
3. 它的 **runner** 组件连接 source 和 sink，并允许你启动和停止你的 bot。

```asciiart:no-line-numbers
api.telegram.org <—> source <—> runner <—> sink <—> bot
```

### Source

grammY runner 有一个默认的 source，它可以操作任何 `UpdateSupplier`（[API 参考](/ref/runner/updatesupplier)）。
这样一个 update supplier 可以直接从 bot 实例中创建。
如果你想自己创建一个，请检查 `createUpdateFetcher`（[API 参考](/ref/runner/createupdatefetcher)）。

source 是一个异步迭代器，但它可以是活动的或非活动的，并且你可以通过 `close` 方法来断开与 Telegram 服务器的连接。

### Sink

grammY runner 有三种 sink，一种是顺序的（与 bot.start() 相同），一种是批量的（主要用于兼容其他框架），和一种是全并发的（由 `run` 调用）。
所有的 sink 都是在 `UpdateConsumer` 上操作的（[API 参考](/ref/runner/updateconsumer)）。
如果你想自己创建一个，请检查 `Bot` 的 `handleUpdate`（[API 参考](/ref/core/bot#handleupdate)）。

sink 包含了一个当前正在处理的 updates 的队列（[API 参考](/ref/runner/decayingdeque)）。
添加新的 updates 到队列中会立即让 update 消费者处理它们，并且返回一个 Promise，它在队列中有空闲空间时就会解决。
已解决的整数数字表示队列中的空闲空间。
为 grammY runner 设置一个并发限制是通过队列实例来实现的。

队列也会抛弃超时的 updates，并且你可以在创建 sink 时指定一个 `timeoutHandler`。
当然，你也应该在创建 sink 时提供一个错误处理器。

如果你使用 `run(bot)`，那么将使用 `bot.catch` 中的错误处理器。

### Runner

runner 是一个简单的循环，它从 source 中拉取 updates，并将它们提供给 sink。
一旦 sink 可以再次提供 updates，runner 将从 source 中拉取下一批 updates。

当你使用 `createRunner`（[API 参考](/ref/runner/createrunner)） 创建一个 runner 时，你会获得一个可以控制它的处理器。
例如，它允许你启动和停止它，或者获得一个 Promise，它在 runner 停止时解决。
(这个处理器也会在 `run` 中返回。)
查看 [API 参考](/ref/runner/runnerhandle) 中的 `RunnerHandle`。

### `run` 函数

`run` 函数做了一些事情来帮助你轻松地使用上面的架构。

1. 它从你的 bot 创建一个 update 供应者。
2. 它从 update 供应者创建一个 [source](#source)。
3. 它从你的 bot 创建一个 update 消费者。
4. 它从 update 消费者者创建一个 [sink](#sink)。
5. 它从 source 和 sink 创建一个 [runner](#runner)。
6. 它启动 runner。

返回创建的 runner 的句柄，它可以让你控制 runner。

## 插件概述

- 名字：`runner`
- [源码](https://github.com/grammyjs/runner)
- [参考](/ref/runner/)
