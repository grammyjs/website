---
prev: ./scaling.md
next: ./flood.md
---

# 关注点三：可靠性

如果你确保你的 bot 有正确的 [错误处理](/zh/guide/errors.md)，基本就可以运行了。
所有可能发生的错误（失败的 API 调用、失败的网络请求、失败的数据库查询、失败的中间件，等等）都被捕获。

你应当确保总是去 `await` 所有的 Promise，或者如果你不想等待的事情，至少也要调用 `catch` 去捕获错误。
可以使用 lint 规则去确保你不会忘记这些。

## 优雅关闭

对于使用了长轮询的 bot，还有更多的事要去考虑。
当你打算在某个操作期间再次停止你的实例，你应该去考虑捕获 `SIGTERM` 和 `SIGINT` 事件，并调用 `bot.stop`（长轮询内置的） 方法或者通过它的 [处理](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/RunnerHandle#stop) （grammY runner）来停止你的 bot。

### 简单的长轮询

<CodeGroup>

<CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";
const bot = new Bot("<token>");
// 当 Node 进程将要被终止时，停止你的 bot。
process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());
await bot.start();
```

</CodeGroupItem>

<CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");
const bot = new Bot("<token>");
// 当 Node 进程将要被终止时，停止你的 bot。
process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());
await bot.start();
```

</CodeGroupItem>

<CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
const bot = new Bot("<token>");
// 当 Deno 进程将要被终止时，停止你的 bot。
Deno.addSignalListener("SIGINT", () => bot.stop());
Deno.addSignalListener("SIGTERM", () => bot.stop());
await bot.start();
```

</CodeGroupItem>
</CodeGroup>

### 使用 grammY runner

<CodeGroup>

<CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";
import { run } from "@grammyjs/runner";
const bot = new Bot("<token>");
const runner = run(bot);
// 当 Node 进程将要被终止时，停止你的 bot。
const stopRunner = () => runner.isRunning() && runner.stop();
process.once("SIGINT", stopRunner);
process.once("SIGTERM", stopRunner);
```

</CodeGroupItem>

<CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");
const { run } = require("@grammyjs/runner");
const bot = new Bot("<token>");
const runner = run(bot);
// 当 Node 进程将要被终止时，停止你的 bot。
const stopRunner = () => runner.isRunning() && runner.stop();
process.once("SIGINT", stopRunner);
process.once("SIGTERM", stopRunner);
```

</CodeGroupItem>
<CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { run } from "https://deno.land/x/grammy_runner/mod.ts";
const bot = new Bot("<token>");
const runner = run(bot);
// 当 Deno 进程将要被终止时，停止你的 bot。
const stopRunner = () => runner.isRunning() && runner.stop();
Deno.addSignalListener("SIGINT", stopRunner);
Deno.addSignalListener("SIGTERM", stopRunner);
```

</CodeGroupItem>
</CodeGroup>

这就是基本的对可靠性所做的东西，你的实例现在将 :registered: 永远 :tm: 不会崩溃了。

## 可靠性保证

如果你的 bot 正在处理金融交易，你必须考虑一个 `kill -9` 的场景设想，即 CPU 物理故障或者数据中心断电该怎么办？
如果因为一些原因，某人或者某事真的很难处理这过程，它将会变得更加复杂。

本质上，bot 不能保证你的中间件只执行一次。
阅读一下 [GitHub上的这个讨论](https://github.com/tdlib/telegram-bot-api/issues/126) 去了解更多为什么你的 bot 在某些极端情况下会重复发送信息（或者根本不发送）。
本章剩下的部分主要是详细解释 grammY 在这些不常见的情况下会怎样表现，并且怎样去处理这些情况。

> 如果你只关心怎样去编写一个 Telegram bot 的代码？[跳过本章剩下的部分](/zh/advanced/flood.md)。

如果你在 webhooks 模式下运行你的 bot，如果你的bot没有及时返回正确响应 Bot API 服务器将会再次尝试传送 updates 到你的 bot。
这基本上全面定义了系统的行为，如果你需要阻止处理重复的 updates，你应该基于 `update_id` 来构建你自己的重复数据删除。
grammY 没有为你做这些工作，但是如果你认为其他人可以从中获得收益，你可以向我们提交 PR 。

长轮询是更加有意思的。
内置的轮询基本上是重新运行已获取但无法完成的最近的 update 批处理。
（注意如果你使用 `bot.stop` 正确停止了你的 bot ， Telegram服务器会用正确的偏移量调用 `getUpdates` ，update 偏移量将会被同步但是不会处理 update 的数据）。
换句话说，你将不会错过任何的 update，不过，你可能会重新处理多达100个以前见过的 update。
由于对 `sendMessage` 的调用不是幂等的，用户可能会从你的 bot 收到重复的消息。
不过，_至少有一次_ 处理是可以被保证的。

如果你在并发模式使用 [grammY runner](/zh/plugins/runner.md)， 下一次的 `getUpdates` 调用可能会在你的中间件处理当前批处理的第一个 update 之前执行。
因此，update 偏移量被提前 [确认](https://core.telegram.org/bots/api#getupdates) 。
这是高并发性的代价，不幸的是，如果不降低吞吐量和响应能力，就无法避免这种代价。
结果是，如果你的实例被正确的（或错误的）时间被关闭了，可能会发生多达 100 个 update 无法再次获取，因为 Telegram 认为它们已被确认。
这将会引起数据丢失。
如果防止这种情况非常重要，那么应该使用 grammY 源程序库来组成自己的 update 管道，首先通过消息队列传递所有 update。
你基本上必须创建一个发送到队列的接收器，并启动一个只提供消息队列的运行程序。
然后，你必须再次创建一个从消息队列提取的 [源](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/UpdateSource) 。
你将有效的运行两个不同的 grammY runner 实例。
据我们所知，上述这个模糊的草案只是草图，还没有实现。
如果你有问题或者你想尝试并分享你的进展，请 [联系 Telegram group](https://t.me/grammyjs) 。

另一方面，如果你的 bot 出于高负载并且 update 轮循由于 [自动加载限制](/zh/plugins/runner.md#sink) 而减慢，那么再次获取 update 的机会将会增加，这将导致再次重复发送消息。
因此，完全并发的代价是既不能保证 _至少一次处理，也不能保证_ 最多一次处理。
