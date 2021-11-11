---
prev: ./games.md
next: /zh/advanced/
---

# 长轮询 vs. Webhooks

这里存在两种让你的 bot 接受来自 Telegram 服务器的信息的方式。
他们被称作 _长轮询_ 与 _webhooks_ 。 
grammY 同时支持这两种方式，使用长轮询作为默认方式。

这一部分将首先介绍长轮询问与 webhooks 分别是什么，
并同时概述了使用其中某一种方法的优缺点。
还将涵盖如何配合 grammY 进行使用。

## 介绍

你可以将整个关于 webhooks 与长轮询的问题看作是选择哪种 _部署方式_ 的问题。
换句话说，这里存在着两种部署 bot 的截然不同的方式，不同的地方同时存在于信息到达 bot 的方式和 grammY 将如何处理信息。

这是一个非常重要的决定，意味着你要选择如何部署 bot 。
例如一些基本接口只支持其中一种的方式。

你的 bot 可以主动拉取信息（长轮询），或者是由 Telegram 服务器主动推送过来 (webhooks) 。

> 如果你已经了解这些是如何工作的，滚动到下方了解如果通过 grammY 使用[长轮询](#如何使用长轮询)或者 [webhooks](#如何使用-webhooks) 。

## 长轮询是如何工作的？

_想象一下，你在你喜爱的冰淇淋店买了一勺冰淇淋，
你走向服务员点了一份最喜欢的冰淇淋。
但不走运的是，这种冰淇淋已经售罄了。_

_第二天，你又想吃那个美味的冰淇淋了，所以你又回到同一个地方，点了同样的冰淇淋。
好消息！
他们在昨晚进货，现在你可以吃美味的冰淇淋了！
这真的是非常美味的冰淇淋。_

**长轮询**意味着 grammY 主动的给 Telegram 服务器发送了一个请求，来询问是否有新的更新（或许是消息什么的）。
如果没有消息，Telegram 将返回一个空列表。
这个的意思是从你上一次请求到这一次请求之间并没有新的消息发送给你的 bot 。

当 grammY 发送请求给 Telegram 服务器时，有新的消息发送给了你的 bot，Telegram 将把这些更新以最多 100 条的更新以数组的形式发送给你。

```asciiart:no-line-numbers
______________                                   _____________
|            |                                   |           |
|            |   <---    有什么新的消息吗？  ---    |           |
|            |    ---       没有           --->   |           |
|            |                                   |           |
|            |   <---    有什么新的消息吗？  ---    |           |
|  Telegram  |    ---       没有           --->   |    Bot    |
|            |                                   |           |
|            |   <---    有什么新的消息吗？  ---    |           |
|            |    ---       有！给你       --->   |           |
|            |                                   |           |
|____________|                                   |___________|
```

显而易见，这样做有一些缺点。
您的 bot 每次请求时只接收新消息，每隔几秒左右发生一次。
为了使你的 bot 响应更快，你需要尽可能的发送更多的请求，并且使请求发生的间隔尽可能的短。
例如，我们可以每毫秒都请求新的消息。


为了避免污染 Telegram 服务器，我们决定使用 _长轮询_ 去代替常规的（短）轮询。

**长轮询**意味着 grammY 主动发送请求给 Telegram 以获得新的消息。
如果没有消息，Telegram 将保持这个请求连接，直到新的信息抵达。并且立刻对这些新的信息进行响应。

_冰淇淋时间又到了！
服务员现在对你已经非常熟悉，
当被问及你最喜欢的那种冰淇淋时，这位员工对你的微笑僵在脸上。
你的问题仍然没有被回复。
In fact, you don't get any response at all.
So you decide to wait, firmly smiling back.
And you wait.
And wait.
Some hours before the next sunrise, a truck of a local food delivery company arrives and brings a couple of large boxes into the parlor's storage room.
They read_ ice cream _on the outside.
The employee finally starts to move again.
“Of course we have salted caramel!
Two scoops with sprinkles, the usual?”
As if nothing had happened, you enjoy your ice cream while leaving the world's most unrealistic ice cream parlor._

```asciiart:no-line-numbers
______________                                   _____________
|            |                                   |           |
|            |   <--- are there messages? ---    |           |
|            |   .                               |           |
|            |   .                               |           |
|            |   .     *both waiting*            |           |
|  Telegram  |   .                               |    Bot    |
|            |   .                               |           |
|            |   .                               |           |
|            |    ---  yes, here you go   --->   |           |
|            |                                   |           |
|____________|                                   |___________|
```

> Note that in reality, no connection would be kept open for hours.
> Long polling requests have a default timeout of 30 seconds (in order to avoid a number of [technical problems](https://tools.ietf.org/id/draft-loreto-http-bidirectional-07.html#timeouts)).
> If no new messages are returned after this period of time, then the request will be cancelled and resent—but the general concept stays the same.

Using long polling, you don't need to spam Telegram's servers, and still you get new messages immediately!
Nifty.
This is what grammY does by default when you run `bot.start()`.

## How Do Webhooks Work?

_After this terrifying experience (a whole night without ice cream!), you'd prefer not to ask anyone about ice cream at all anymore.
Wouldn't it be cool if the ice cream could come to you?_

Setting up a **webhook** means that you will provide Telegram with a URL that is accessible from the public internet.
Whenever a new message is sent to your bot, Telegram (and not you!) will take the initiative and send a request with the update object to your server.
Nice, heh?

_You decide to walk to the ice cream parlor one very last time.
You tell your friend behind the counter where you live.
He promises to head over to your apartment personally whenever new ice cream is there (because it would melt in the mail).
Cool guy._

```asciiart:no-line-numbers
______________                                   _____________
|            |                                   |           |
|            |                                   |           |
|            |                                   |           |
|            |         *both waiting*            |           |
|            |                                   |           |
|  Telegram  |                                   |    Bot    |
|            |                                   |           |
|            |                                   |           |
|            |    ---  hi, new message   --->    |           |
|            |   <---    thanks dude     ---     |           |
|____________|                                   |___________|
```

## Comparison

**The main advantage of long polling over webhooks is that it is simpler.**
You don't need a domain or a public URL.
You don't need to fiddle around with setting up SSL certificates in case you're running your bot on a VPS.
Use `bot.start()` and everything will work, no further configuration required.
Under load, you are in complete control of how many messages you can process.

Places where long polling works well include:

- during development on your local machine,
- on all VPS', and
- on hosted “backend” instances, i.e. machines that actively run your bot 24/7.

**The main advantage of webhooks over long polling is that they are cheaper.**
You save a ton of superfluous requests.
You don't need to keep a network connection open at all times.
You can use services that automatically scale your infrastructure down to zero when no requests are coming.
If you want to, you can even [make an API call when responding to the Telegram request](#webhook-reply), even though this has [a number of drawbacks](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#ApiClientOptions).

Places where webhooks work well include:

- on VPS' with SSL certificate,
- on hosted “frontend” instances that scale according to their load, and
- on serverless platforms, such as cloud functions or programmable edge networks.

## I Still Have No Idea What to Use

Then go for long polling.
If you don't have a good reason to use webhooks, then note that there are no major drawbacks to long polling, and—according to our experience—you will spend much less time fixing things.
Webhooks can be a bit nasty from time to time (see [below](#ending-webhook-requests-in-time)).

Whatever you choose, if you ever run into serious problems, it should not be too hard to switch to the other deployment type after the fact.
With grammY, you only have to touch a few lines of code.
The setup of your [middleware](./middleware.md) is the same.

## How to Use Long Polling

Call

```ts
bot.start();
```

to run your bot with a very simple form of long polling.
It processes all updates sequentially.
This makes your bot very easy to debug, and all behavior very predictable, because there is no concurrency involved.

If you want your messages to be handled concurrently by grammY, or you worry about throughput, check out the section about [grammY runner](/plugins/runner.md).

## How to Use Webhooks

If you want to run grammY with webhooks, you can integrate your bot into a web server.
We therefore expect you to be able to start a simple web server with a framework of your choice.

Every grammY bot can be converted to middleware for a number of web frameworks, including `express`, `koa`/`oak`, and more.
You can import the `webhookCallback` function from grammY to convert your bot to middleware for the respective framework.

<CodeGroup>
 <CodeGroupItem title="TS">

```ts
import express from "express";

const app = express(); // or whatever you're using
app.use(express.json()); // parse the JSON request body

// 'express' is also used as default if no argument is given
app.use(webhookCallback(bot, "express"));
```

</CodeGroupItem>
 <CodeGroupItem title="JS">

```js
const express = require("express");

const app = express(); // or whatever you're using
app.use(express.json()); // parse the JSON request body

// 'express' is also used as default if no argument is given
app.use(webhookCallback(bot, "express"));
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application(); // or whatever you're using

// make sure to specify the framework you use
app.use(webhookCallback(bot, "oak"));
```

</CodeGroupItem>
</CodeGroup>

Be sure to read [Marvin's Marvellous Guide to All Things Webhook](https://core.telegram.org/bots/webhooks) written by the Telegram team if you consider running your bot on webhooks on a VPS.

### Webhook Reply

When a webhook request is received, your bot can call up to one method in the response.
As a benefit, this saves your bot from making up to one HTTP request per update. However, there are a number of drawbacks to using this:

1. You will not be able to handle potential errors of the respective API call.
   This includes rate limiting errors, so you won't actually be guaranteed that your request has any effect.
2. More importantly, you also won't have access to the response object.
   For example, calling `sendMessage` will not give you access to the message you send.
3. Furthermore, it is not possible to cancel the request.
   The `AbortSignal` will be disregarded.
4. Note also that the types in grammY do not reflect the consequences of a performed webhook callback!
   For instance, they indicate that you always receive a response object, so it is your own responsibility to make sure you're not screwing up while using this minor performance optimization.

If you want to use webhook replies, you can specify the `canUseWebhookReply` option in the `client` option of your `BotConfig` ([API reference](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#BotConfig)).
Pass a function that determines whether or not to use webhook reply for the given request, identified by method.

```ts
const bot = new Bot(token, {
  client: {
    // We accept the drawback of webhook replies for typing status
    canUseWebhookReply: (method) => method === "sendChatAction",
  },
});
```

This is how webhook replies work under the hood.

```asciiart:no-line-numbers
______________                                   _____________
|            |                                   |           |
|            |                                   |           |
|            |                                   |           |
|            |         *both waiting*            |           |
|            |                                   |           |
|  Telegram  |                                   |    Bot    |
|            |                                   |           |
|            |                                   |           |
|            |    ---  hi, new message   --->    |           |
|            | <--- okay, and sendChatAction --- |           |
|____________|                                   |___________|
```

### Ending Webhook Requests in Time

> You can ignore the rest of this page if all your middleware completes fast, i.e. within a few seconds.
> This section is primarily for people who want to do file transfers in response to messages, or other operations that need more time.

When Telegram sends an update from one chat to your bot, it will wait for you to end the request before delivering the next update that belongs to that chat.
In other words, Telegram will deliver updates from the same chat in sequence, and updates from different chats are sent concurrently.
(The source of this information is [here](https://github.com/tdlib/telegram-bot-api/issues/75#issuecomment-755436496).)

Telegram tries to make sure that your bot receives all updates.
That means that if an update delivery fails for a chat, the subsequent updates will be queued until the first update succeeds.

#### Why Not Ending a Webhook Request Is Dangerous

Telegram has a timeout for each update that it sends to your webhook endpoint.
If you don't end a webhook request fast enough, Telegram will re-send the update, assuming that it was not delivered.
As a result, your bot can unexpectedly process the same update multiple times.
This means that it will perform all update handling, including the sending of any response messages, multiple times.

```asciiart:no-line-numbers
______________                                   _____________
|            |                                   |           |
|            | ---    hi, new message    --->    |           |
|            |                              .    |           |
|            |        *bot processing*      .    |           |
|            |                              .    |           |
|  Telegram  | --- I said new message!!! --->    |    Bot    |
|            |                              ..   |           |
|            |    *bot processing twice*    ..   |           |
|            |                              ..   |           |
|            | ---      HEEELLLOOOO      --->    |           |
|            |                              ...  |           |
|            |   *bot processing thrice*    ...  |           |
|____________|                              ...  |___________|
```

This is why grammY has its own, shorter timeout inside `webhookCallback` (default: 10 seconds).
If your middleware finishes before that, the function `webhookCallback` will respond to the webhook automatically.
In that case, everything is fine.
However, if your middleware does not finish before grammY's timeout, `webhookCallback` will throw an error.
This means that you can handle the error in your web framework.
If you don't have that error handling, Telegram will send the same update again—but at least you will have error logs now, to tell you that something is wrong.

Once Telegram sends an update to your bot for the second time, it is unlikely that your handling of it will be faster than the first time.
As a result, it will likely timeout again, and Telegram will send the update again.
Thus, your bot will not just see the update two times, but a few dozen times, until Telegram stops retrying.
You may observe that your bot starts spamming users as it tries to handle all of those updates (that are in fact the same every time).

#### Why Ending a Webhook Request Early Is Also Dangerous

You can configure `webhookCallback` to not throw an error after the timeout, but instead end the webhook request early, even though your middleware is still running.
You can do this by passing `'return'` as a third argument to `webhookCallback`, instead of the default value `'throw'`.
However, while this behavior has some valid use cases, such a solution usually causes more problems than it solves.

Remember that once you respond to a webhook request, Telegram will send the next update for that chat.
However, as the old update is still being processed, two updates which were previously processed sequentially, are suddenly processed in parallel.
This can lead to race conditions.
For example, the session plugin will inevitably break due to [WAR](https://en.wikipedia.org/wiki/Hazard_(computer_architecture)#Write_after_read_(WAR)) hazards.
**This causes data loss!**
Other plugins and even your own middleware may break too.
The extent of this is unknown and depends on your bot.

#### How to Solve This Problem

This answer is easier said than done.
**It is your job to make sure that your middleware finishes fast enough.**
Don't use long-running middleware.
Yes, we know that you perhaps _want_ to have long-running tasks.
Still.
Don't do it.
Not in your middleware.

Instead, use a queue (there are plenty of queuing systems out there, from very simple to very sophisticated).
Instead of trying to perform all of the work in the small webhook timeout window, just append the task to the queue to be handled separately, and let your middleware complete.
The queue can use all the time it wants.
When it's done, it can send a message back to the chat.
This is straightforward to do if you just use a simple in-memory queue.
It can be a little more challenging if you're using a fault-tolerant external queuing system, that persists the state of all tasks, and can retry things even if your server suddenly dies.

```asciiart:no-line-numbers
______________                                   _____________
|            |                                   |           |
|            |   ---   hi, new message    --->   |           |
|            |  <---     thanks dude      ---.   |           |
|            |                               .   |           |
|            |                               .   |           |
|  Telegram  |      *bot queue working*      .   |    Bot    |
|            |                               .   |           |
|            |                               .   |           |
|            |  <--- message with result  ---    |           |
|            |   ---       alrighty       --->   |           |
|____________|                                   |___________|
```

#### Why `'return'` Is Generally Worse Than `'throw'`

You may be wondering why the default action of `webhookCallback` is to throw an error, instead of ending the request successfully.
This design choice was made for the following reasons.

Race conditions are very hard to reproduce and may occur extremely rarely or sporadically.
The solution to this is to _make sure not to run into timeouts_ in the first place.
But, if you do, you really want to know that this is happening, so that you can investigate and fix the problem!
For that reason, you want the error to occur in your logs.
Setting the timeout handler to `'return'`, hence suppressing the timeout and pretending that nothing happened, is exactly the opposite of useful behavior.

If you do this, you're in some sense using the update queue in Telegram's webhook delivery as your task queue.
This is a bad idea for all of the reasons described above.
Just because grammY _can_ suppress errors that can make you lose your data, does not mean you _should_ tell it to.
This configuration setting should not be used in cases where your middleware simply takes too much time to complete.
Take the time to correctly fix this issue, and your future self (and users) will thank you.
