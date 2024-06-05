---
next: false
---

# 长轮询 vs. Webhooks

这里存在两种让你的 bot 接受来自 Telegram 服务器的信息的方式。
他们被称作 _长轮询_ 与 _webhooks_。
grammY 同时支持这两种方式，使用长轮询作为默认方式。

这一部分将首先介绍长轮询问与 webhooks 分别是什么，
并同时概述了使用其中某一种方法的优缺点。
还将涵盖如何配合 grammY 进行使用。

## 介绍

你可以将整个关于 webhooks 与长轮询的问题看作是选择哪种 _部署方式_ 的问题。
换句话说，这里存在着两种部署 bot 的截然不同的方式，不同的地方同时存在于信息到达 bot 的方式和 grammY 将如何处理信息。

这是一个非常重要的决定，意味着你要选择如何部署 bot。
例如一些基本接口只支持其中一种的方式。

你的 bot 可以主动拉取信息（长轮询），或者是由 Telegram 服务器主动推送过来（webhooks）。

> 如果你已经了解这些是如何工作的，滚动到下方了解如果通过 grammY 使用 [长轮询](#如何使用长轮询) 或者 [webhooks](#如何使用-webhooks)。

## 长轮询是如何工作的？

_想象一下，你在你喜爱的冰淇淋店买了一勺冰淇淋，
你走向服务员点了一份最喜欢的冰淇淋。
但不走运的是，这种冰淇淋已经售罄了。_

_第二天，你又想吃那个美味的冰淇淋了，所以你又回到同一个地方，点了同样的冰淇淋。
好消息！
他们在昨晚进货，现在你可以吃美味的冰淇淋了！
这真的是非常美味的冰淇淋。_

**长轮询**意味着 grammY 主动的给 Telegram 服务器发送了一个请求，来询问是否有新的 update。
如果没有消息，Telegram 将返回一个空列表。
这个的意思是从你上一次请求到这一次请求之间并没有新的消息发送给你的 bot。

当 grammY 发送请求给 Telegram 服务器时，有新的消息发送给了你的 bot，Telegram 将最多 100 条的 updates 以数组的形式发送给你。

```asciiart:no-line-numbers
______________                                     _____________
|            |                                     |           |
|            |   <---    有什么新的消息吗？  ---      |           |
|            |    ---       没有           --->     |           |
|            |                                     |           |
|            |   <---    有什么新的消息吗？  ---      |           |
|  Telegram  |    ---       没有           --->     |    Bot    |
|            |                                     |           |
|            |   <---    有什么新的消息吗？  ---      |           |
|            |    ---       有！给你       --->     |           |
|            |                                     |           |
|____________|                                     |___________|
```

显而易见，这样做有一些缺点。
你的 bot 每次请求时只接收新消息，每隔几秒左右发生一次。
为了使你的 bot 响应更快，你需要尽可能的发送更多的请求，并且使请求发生的间隔尽可能的短。
例如，我们可以每毫秒都请求新的消息。

为了避免污染 Telegram 服务器，我们决定使用 _长轮询_ 去代替常规的（短）轮询。

**长轮询**意味着 grammY 主动发送请求给 Telegram 以获得新的消息。
如果没有消息，Telegram 将保持这个请求连接，直到新的信息抵达。并且立刻对这些新的信息进行响应。

_冰淇淋时间又到了！
服务员现在对你已经非常熟悉，
当被问及你最喜欢的那种冰淇淋时，这位员工对你的微笑僵在脸上。
你的问题仍然没有被回复。
然后你等待。
接着等待。_

_直到在下一个日出之前的几个小时，当地一家外卖公司的卡车来了，把几个大箱子送到大厅旁的储藏室。
他们在里面交谈着有关 **冰淇淋** 的事情。
终于，服务员动了起来！
"我们当然有咸焦糖种类的，
两勺带糖的，老样子?"_

_就好像什么都没发生过一样，你享受着你的冰淇淋，离开了世界上最不真实的冰淇淋店。_

```asciiart:no-line-numbers
______________                                     _____________
|            |                                     |           |
|            |   <--- 这里有什么新消息吗？  ---       |           |
|            |   .                                 |           |
|            |   .                                 |           |
|            |   .     *一同等待*                   |           |
|  Telegram  |   .                                 |    Bot    |
|            |   .                                 |           |
|            |   .                                 |           |
|            |    ---  是的，我们有新消息！ --->       |           |
|            |                                     |           |
|____________|                                     |___________|
```

> 请注意，在现实中，没有连接将保持数小时。
> 长轮询请求的默认超时时间为 30 秒（为了避免一些 [技术问题](https://datatracker.ietf.org/doc/html/rfc6202#section-5.5)）
> 如果在这段时间之后没有返回任何新消息，那么请求将被取消并重新执行，但总体信息保持不变。

使用长轮询，你不需要污染 Telegram 的服务器，你仍然可以立即得到新的信息！
漂亮。
这就是当你运行 `bot.start ()` 时，默认情况下 grammY 会做的事情。

## Webhooks 是如何工作的？

_在这次可怕的经历之后（一整晚都没有冰淇淋！），你不再问任何人关于冰淇淋的事。
但如果冰淇淋可以送到你面前，那不是很酷吗_

建立一个 **webhook** 意味着你将为 Telegram 提供一个可以从公共互联网上访问的 URL。
无论何时，只要有新的信息发送到你的 bot，Telegram（而不是你！）将主动发送一个请求与 update 对象到你的服务器。
很方便，不是吗？

_你决定最后一次走到冰淇淋店。
你告诉柜台后面的朋友你住在哪里。
他承诺，只要有新的冰淇淋，他就会亲自到你的公寓（因为邮寄时冰淇淋会化掉）。
很热心的人。_

```asciiart:no-line-numbers
______________                                   _____________
|            |                                   |           |
|            |                                   |           |
|            |                                   |           |
|            |         *一同等待*                 |           |
|            |                                   |           |
|  Telegram  |                                   |    Bot    |
|            |                                   |           |
|            |                                   |           |
|            |    ---  你好，新的信息！   --->      |           |
|            |   <---    谢谢你，兄弟      ---     |           |
|____________|                                   |___________|
```

## 比较

**长轮询相比于 webhooks 的主要优势在于它更简单**
你不再需要一个域名或是可以访问的 URL。
当你在 VPS 上运行你的 bot 时不需要在设置 SSL 证书上浪费时间。
使用 `bot.start ()`，一切都会正常工作，不需要进一步配置。
在负载下，你可以完全控制需要处理消息的个数。

长轮询可以在这些地方良好地运行：

- 在你的本地机器上。
- 在大多数服务器上。
- 在后端运行的 bot 示例上（即一个全天候运行的机器）都可以良好运行。

**Webhooks 比长轮询的主要优势在于它们更"便宜"。**
你省下了一大堆多余的请求。
你不需要一直让 bot 与 Telegram 保持连接。
当没有请求时，你可以使用自动将基础结构收敛为零消耗的服务。
如果你愿意， 你甚至可以 [在响应 Telegram 请求时调用 API](#webhook-reply), 即使这样会有很多缺点。
你可以在 [这里](/ref/core/apiclientoptions#canusewebhookreply) 查看配置选项。

Webhooks 可以在这些地方良好运行：

- 在有着 SSL 证书的服务器上。
- 在一台可以前端运行的，拥有可以负载伸缩的主机上。
- 在 serverless 平台， 比如云函数或者可编程边缘网络。

## 我还是不知道该用什么

那就选择长轮询吧。
如果你没有充分的理由使用 Webhooks，那么请注意，长轮询没有重大的缺点，而且 **根据我们的经验** 你花在修理东西上的时间会少得多。
Webhooks 有时候可能会有点令人讨厌（见 [下文](#及时结束-webhook-请求)）。

无论你选择什么，如果遇到严重问题，在事后切换到其他部署类型应该不会太难。
使用 grammY，这都只需要修改几行代码。
关于你的 [中间件](./middleware) 的设置也是一样的。

## 如何使用长轮询

使用

```ts
bot.start();
```

你使用一个非常简单的长轮询运行你的 bot。
它按顺序处理所有 update。
这使得你的 bot 代码很容易调试，而且所有的行为都是可预测的，因为这里面没有并发性。

如果你希望你的消息能够被 grammY 并发处理，或者你担心吞吐量，请查看关于 [并发](../plugins/runner) 的信息.

## 如何使用 Webhooks

如果你想运行 grammY Webhooks，你可以把你的 bot 集成到一个网络服务器上。
因此，我们希望你能够选择一个合适的框架，去启动一个简单的 web 服务器。

每个 grammY bot 都可以转换为许多 web 框架的中间件，包括 `express`，`koa`/`oak` 等等。
你可以从 grammY 中导入 `webhookCallback` 函数 ([API 参考](/ref/core/webhookcallback)) 为对应的框架创建一个中间件。

::: code-group

```ts [TypeScript]
import express from "express";

const app = express(); // 或者其它你正在使用的
app.use(express.json()); // 解析 JSON 请求

// 如果没有给出参数，则使用 "express" 作为默认值。
app.use(webhookCallback(bot, "express"));
```

```js [JavaScript]
const express = require("express");

const app = express(); // 或者其它你正在使用的
app.use(express.json()); // 解析 JSON 请求

// 如果没有给出参数，则使用 "express" 作为默认值。
app.use(webhookCallback(bot, "express"));
```

```ts [Deno]
import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application(); // 或者其它你正在使用的

// 确保指定你使用的框架。
app.use(webhookCallback(bot, "oak"));
```

:::

> 请注意，使用 webhooks 的时候不要调用 `bot.start()`。

如果你考虑在 VPS 上使用 webhooks 运行你的 bot，请确保你阅读了 Telegram 团队写的 [Marvin's Marvellous Guide to All Things Webhook](https://core.telegram.org/bots/webhooks)。

### Web 框架适配器

为了支持多种不同的 web 框架，grammY 采用了 **适配器** 的概念.
每个适配器负责将 Web 框架的输入和输出中继到 grammY，反之亦然。
传递给 `webhookCallback` 的第二个参数 ([API 参考](/ref/core/webhookcallback)) 定义了用于与 Web 框架通信的框架适配器。

由于这种方法的工作方式，我们通常需要为每个框架配备一个适配器，但是，由于某些框架共享相似的接口，因此已知适配器可以与多个框架一起工作。
下表包含当前可用的适配器，以及它们已知可使用的框架、API 或运行时。

| 适配器             | 框架/API/运行时                                                                |
| ------------------ | ------------------------------------------------------------------------------ |
| `aws-lambda`       | AWS Lambda Functions                                                           |
| `aws-lambda-async` | AWS Lambda Functions with `async`/`await`                                      |
| `azure`            | Azure Functions                                                                |
| `bun`              | `Bun.serve`                                                                    |
| `cloudflare`       | Cloudflare Workers (Service Worker)                                            |
| `cloudflare-mod`   | Cloudflare Workers (Module Worker)                                             |
| `express`          | Express, Google Cloud Functions                                                |
| `fastify`          | Fastify                                                                        |
| `hono`             | Hono                                                                           |
| `http`, `https`    | Node.js `http`/`https` modules, Vercel                                         |
| `koa`              | Koa                                                                            |
| `next-js`          | Next.js                                                                        |
| `nhttp`            | NHttp                                                                          |
| `oak`              | Oak                                                                            |
| `serveHttp`        | `Deno.serveHttp`                                                               |
| `std/http`         | `Deno.serve`, `std/http`, `Deno.upgradeHttp`, `Fresh`, `Ultra`, `Rutt`, `Sift` |
| `sveltekit`        | SvelteKit                                                                      |
| `worktop`          | Worktop                                                                        |

### Webhook Reply

当收到一个 webhook 请求时，你的 bot 可以在响应中调用一个方法。
这样做的一个好处是，每次 update 时 bot 都可以节省一个 HTTP 请求。然而，使用这种方法也有一些缺点:

1. 你将无法处理各个 API 调用的潜在错误。
   这包括速率限制错误，因此实际上不能保证你的请求有任何效果。
2. 更重要的是，你也无法访问响应对象。
   例如，调用 `sendMessage` 将不能使你访问你发送的消息。
3. 此外，不可能取消请求。
   `abotsignal` 将被忽略。
4. 还要注意的是，grammY 中的类型并不反映所执行的 webhook 回调的结果！
   例如，它们表明你总是接收到一个响应对象，但确保在使用这个次要的性能优化时，你将自己责任，努力让他不会出错。

如果你想使用 webhook reply，你可以在你的 `BotConfig` 的 `client` 选项中指定 `canUseWebhookReply` 选项（[API 参考](/ref/core/botconfig)）。
传递一个函数，该函数决定是否对给定的请求使用 webhook 应答(由方法标识)。

```ts
const bot = new Bot("", {
  client: {
    // 如果你愿意在某些方法上使用 webhook reply。
    canUseWebhookReply: (method) => method === "sendChatAction",
  },
});
```

这就是 webhook 在内部的工作原理。

```asciiart:no-line-numbers
______________                                     _____________
|            |                                     |           |
|            |                                     |           |
|            |                                     |           |
|            |         *一同等待*                   |           |
|            |                                     |           |
|  Telegram  |                                     |    Bot    |
|            |                                     |           |
|            |                                     |           |
|            |    --- 你好！这里有一条新消息 --->      |           |
|            | <--- 好的，执行 sendChatAction ---    |           |
|____________|                                     |___________|
```

### 及时结束 Webhook 请求

> 如果所有中间件都很快完成，也就是在几秒钟内完成，则可以忽略本页面的其余部分。
> 本节主要为那些希望进行文件传输以响应消息或其他需要更多时间的操作的用户服务。

当 Telegram 服务从一个聊天发送 update 到你的 bot 服务器时，它会等待你结束请求，然后再发送属于该聊天的下一个 update。
换句话说，Telegram 将按顺序发送来自同一聊天的 update，来自不同聊天的 update 将同时发送。
（这条消息的来源是 [这里](https://github.com/tdlib/telegram-bot-api/issues/75#issuecomment-755436496)）

Telegram 试图确保你的 bot 收到所有 update。
这意味着，如果某个聊天的 update 传递失败，后续的 update 将被排队，直到第一次 update 成功。

#### 为什么不停止一个 Webhook 请求是危险的

对于每次发送到你的 webhook 端点的 update，Telegram 都有一个超时时间。
如果你不尽快结束一个 webhook 请求，Telegram 将假设它没有发送，于是重新发送了 update。
因此，你的 bot 可能会意外地多次处理同一个 update。
这意味着它将多次执行所有 update 处理，包括发送任何响应消息。

```asciiart:no-line-numbers
______________                                     _____________
|            |                                     |           |
|            | ---    你好，我这里有新信息   --->      |           |
|            |                                .    |           |
|            |        *bot 处理*               .    |           |
|            |                                .    |           |
|  Telegram  | ---    我说了有新消息！！！   --->      |    Bot    |
|            |                                ..   |           |
|            |        *bot 处理了第二次*        ..   |           |
|            |                                ..   |           |
|            | ---      你好！！！！       --->      |           |
|            |                                ...  |           |
|            |        *bot 处理了第三次*        ...  |           |
|____________|                                ...  |___________|
```

这就是为什么 grammY 在 `webhookCallback` 中有着更短的超时时间（默认值：10 秒）。
如果你的中间件在此之前完成，`webhookCallback` 函数将自动响应 webhook。
那样的话，一切都很好。
但是，如果你的中间件在 grammY 超时之前没有完成，`webhookCallback` 会抛出一个错误。
这意味着你可以处理 web 框架中的错误。
如果你没有处理那个错误，Telegram 将会再次发送同样的 update，但至少你现在有了错误日志，告诉你有什么地方出错了。

一旦 Telegram 第二次向你的 bot 发送 update ，你处理它的速度不可能比第一次快。
因此，它可能会再次超时，而 Telegram 将再次发送 update。
因此，你的 bot 不仅仅会看到两次 update ，而是几十次，直到 Telegram 停止重新尝试。
你可能会发现你的 bot 开始给用户发送垃圾邮件，因为它试图处理所有这些 update（实际上每次都是一样的）。

#### 为什么提前终止一个 Webhook 请求也是危险的

你可以配置 `webhookCallback` 在超时后不抛出错误，而是提前结束 webhook 请求，即使你的中间件仍然在运行。
你可以通过传递 `return` 作为第三个参数到 `webhookCallback`，而不是默认使用 `throw` 来实现。
然而，尽管这种行为有一些有效的用例，但这种解决方案通常会导致比它解决的问题更多的问题。

请记住，一旦你响应了一个 webhook 请求，Telegram 将发送该聊天的下一个 update。
但是，由于旧的 update 仍在处理中，先前顺序处理的两个 update 突然并行处理。
这可能导致竞态效应。
例如，插件将不可避免地由于 [WAR](https://en.wikipedia.org/wiki/Hazard_(computer_architecture)#Write_after_read_(WAR)) 的危险而中断。
**这会导致数据丢失！**
其他插件，甚至你自己的中间件也可能崩溃。
这种情况的程度是未知的，取决于你的 bot。

#### 如何解决这个问题

这个答案说起来容易做起来难。
**确保你的中间件以足够快的速度完成是必要的。**
不要使用长时间运行的中间件。
是的，我们知道你可能希望拥有长时间运行的任务。
不过。
不要在你的中间件中这样做。

相反，使用一个队列（有很多队列库，从非常简单到非常复杂）。
与其尝试在 webhook 容易超时的窗口中执行所有工作，不如将任务附加到要单独处理的队列中，并让你的中间件完成。
队列可以随时使用它想用的时间。
当它完成后，它可以发送一个消息回到聊天。
如果你只是使用一个简单的内存中队列，那么这是很容易做到的。
如果你使用的是容错的外部队列系统，这种系统将持久保存所有任务的状态，并且即使服务器突然宕机也可以重试。

```asciiart:no-line-numbers
______________                                   _____________
|            |                                   |           |
|            |   ---   你好，有新消息      --->     |           |
|            |  <---     谢谢你兄弟       ---  .   |           |
|            |                               .   |           |
|            |                               .   |           |
|  Telegram  |      *bot 队列工作中*           .   |    Bot    |
|            |                               .   |           |
|            |                               .   |           |
|            |  <---   返回了结果消息      ---      |           |
|            |   ---       好的          --->     |           |
|____________|                                   |___________|
```

#### 为什么 `return` 比 `throw` 更糟糕

你可能想知道为什么 `webhookCallback` 的默认操作是 throw 错误，而不是成功结束请求。
这个设计的选择是基于以下原因。

竞态效应极少或偶尔发生。
解决这个问题的方法是首先确保不会遇到超时。
如果你能确保这样，问题发生时你将能看到排错信息，这样你就可以调查并解决问题！
由于这个原因，你希望错误可以被记录在日志中。
将超时处理程序设置为 `return`，从而抑制超时并假装什么都没有发生，这与有用的行为恰恰相反。

如果你这样做，在某种意义上，你是在使用 Telegram 的 webhook 传递中的 update 队列作为你的任务队列。
由于上述所有原因，这是一个坏主意。
仅仅因为 grammY 可以抑制可能导致你丢失数据的错误，但这并不意味着你应该告诉它。
在你的中间件需要花费太多时间才能完成的情况下，不应该使用此配置设置。
花点时间正确地解决这个问题，你未来的自己（和用户）会感谢你的。
