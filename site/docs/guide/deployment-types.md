---
next: false
---

# Long Polling vs. Webhooks

There are two ways how your bot can receive messages from the Telegram servers.
They are called _long polling_ and _webhooks_.
grammY supports both of these two ways, while long polling is the default.

This section first describes what long polling and webhooks actually are, and in turn outlines some of the advantages and disadvantages of using one or the other deployment method.
It will also cover how to use them with grammY.

## Introduction

You can think of the whole webhooks vs. long polling discussion as a question of what _deployment type_ to use.
In other words, there are two fundamentally different ways to host your bot (run it on some server), and they differ in the way how the messages reach your bot, and can be processed by grammY.

This choice matters a lot when you need to decide where to host your bot.
For instance, some infrastructure providers only support one of the two deployment types.

Your bot can either pull them in (long polling), or the Telegram servers can push them to your bot (webhooks).

> If you already know how these things work, scroll down to see how to use [long polling](#how-to-use-long-polling) or [webhooks](#how-to-use-webhooks) with grammY.

## How Does Long Polling Work?

_Imagine you're getting yourself a scoop of ice cream in your trusted ice cream parlor.
You walk up to the employee and ask for your favorite type of ice cream.
Unfortunately, he lets you know that it is out of stock._

_The next day, you're craving that delicious ice cream again, so you go back to the same place and ask for the same ice cream.
Good news!
They restocked over night so you can enjoy your salted caramel ice cream today!
Yummy._

**Polling** means that grammY proactively sends a request to Telegram, asking for new updates (think: messages).
If no messages are there, Telegram will return an empty list, indicating that no new messages were sent to your bot since the last time you asked.

When grammY sends a request to Telegram and new messages have been sent to your bot in the meantime, Telegram will return them as an array of up to 100 update objects.

```asciiart:no-line-numbers
______________                                   _____________
|            |                                   |           |
|            |   <--- are there messages? ---    |           |
|            |    ---       nope.         --->   |           |
|            |                                   |           |
|            |   <--- are there messages? ---    |           |
|  Telegram  |    ---       nope.         --->   |    Bot    |
|            |                                   |           |
|            |   <--- are there messages? ---    |           |
|            |    ---  yes, here you go   --->   |           |
|            |                                   |           |
|____________|                                   |___________|
```

It is immediately obvious that this has some drawbacks.
Your bot only receives new messages every time it asks, i.e. every few seconds or so.
To make your bot respond faster, you could just send more requests and not wait as long between them.
We could for example ask for new messages every millisecond! What could go wrong…

Instead of deciding to spam the Telegram servers, we will use _long polling_ instead of regular (short) polling.

**Long polling** means that grammY proactively sends a request to Telegram, asking for new updates.
If no messages are there, Telegram will keep the connection open until new messages arrive, and then respond to the request with those new messages.

_Time for ice cream again!
The employee already greets you with your first name by now.
Asked about some ice cream of your favorite kind, the employee smiles at you and freezes.
In fact, you don't get any response at all.
So you decide to wait, firmly smiling back.
And you wait.
And wait._

_Some hours before the next sunrise, a truck of a local food delivery company arrives and brings a couple of large boxes into the parlor's storage room.
They read **ice cream** on the outside.
The employee finally starts to move again.
"Of course we have salted caramel!
Two scoops with sprinkles, the usual?"_

_As if nothing had happened, you enjoy your ice cream while leaving the world's most unrealistic ice cream parlor._

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
> Long polling requests have a default timeout of 30 seconds (in order to avoid a number of [technical problems](https://datatracker.ietf.org/doc/html/rfc6202#section-5.5)).
> If no new messages are returned after this period of time, then the request will be cancelled and resent---but the general concept stays the same.

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

- During development on your local machine.
- On the majority of servers.
- On hosted "backend" instances, i.e. machines that actively run your bot 24/7.

**The main advantage of webhooks over long polling is that they are cheaper.**
You save a ton of superfluous requests.
You don't need to keep a network connection open at all times.
You can use services that automatically scale your infrastructure down to zero when no requests are coming.
If you want to, you can even [make an API call when responding to the Telegram request](#webhook-reply), even though this has a number of drawbacks.
Check out the configuration option [here](/ref/core/apiclientoptions#canusewebhookreply).

Places where webhooks work well include:

- On servers with SSL certificates.
- On hosted "frontend" instances that scale according to their load.
- On serverless platforms, such as cloud functions or programmable edge networks.

## I Still Have No Idea What to Use

Then go for long polling.
If you don't have a good reason to use webhooks, then note that there are no major drawbacks to long polling, and---according to our experience---you will spend much less time fixing things.
Webhooks can be a bit nasty from time to time (see [below](#ending-webhook-requests-in-time)).

Whatever you choose, if you ever run into serious problems, it should not be too hard to switch to the other deployment type after the fact.
With grammY, you only have to touch a few lines of code.
The setup of your [middleware](./middleware) is the same.

## How to Use Long Polling

Call

```ts
bot.start();
```

to run your bot with a very simple form of long polling.
It processes all updates sequentially.
This makes your bot very easy to debug, and all behavior very predictable, because there is no concurrency involved.

If you want your messages to be handled concurrently by grammY, or you worry about throughput, check out the section about [grammY runner](../plugins/runner).

## How to Use Webhooks

If you want to run grammY with webhooks, you can integrate your bot into a web server.
We therefore expect you to be able to start a simple web server with a framework of your choice.

Every grammY bot can be converted to middleware for a number of web frameworks, including `express`, `koa`/`oak`, and more.
You can import the `webhookCallback` function ([API reference](/ref/core/webhookcallback)) to create a middleware for the respective framework.

::: code-group

```ts [TypeScript]
import express from "express";

const app = express(); // or whatever you're using
app.use(express.json()); // parse the JSON request body

// "express" is also used as default if no argument is given.
app.use(webhookCallback(bot, "express"));
```

```js [JavaScript]
const express = require("express");

const app = express(); // or whatever you're using
app.use(express.json()); // parse the JSON request body

// "express" is also used as default if no argument is given.
app.use(webhookCallback(bot, "express"));
```

```ts [Deno]
import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application(); // or whatever you're using

// Make sure to specify the framework you use.
app.use(webhookCallback(bot, "oak"));
```

:::

> Note that you must not call `bot.start()` when using webhooks.

Be sure to read [Marvin's Marvellous Guide to All Things Webhook](https://core.telegram.org/bots/webhooks) written by the Telegram team if you consider running your bot on webhooks on a VPS.

### Web Framework Adapters

In order to support many different web frameworks, grammY adopts the concept of **adapters**.
Each adapter is responsible for relaying input and output from the web framework to grammY and vice versa.
The second parameter passed to `webhookCallback` ([API reference](/ref/core/webhookcallback)) defines the framework adapter used to communicate with the web framework.

Because of how this approach works, we usually need an adapter for each framework but, since some frameworks share a similiar interface, there are adapters that are known to work with multiple frameworks.
Below is a table containing the currently available adapters, and the framework, APIs, or runtimes they are known to work with.

| Adapter            | Framework/API/Runtime                                                          |
| ------------------ | ------------------------------------------------------------------------------ |
| `aws-lambda`       | AWS Lambda Functions                                                           |
| `aws-lambda-async` | AWS Lambda Functions with `async`/`await`                                      |
| `azure`            | Azure Functions                                                                |
| `bun`              | `Bun.serve`                                                                    |
| `cloudflare`       | Cloudflare Workers                                                             |
| `cloudflare-mod`   | Cloudflare Module Workers                                                      |
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

When a webhook request is received, your bot can call up to one method in the response.
As a benefit, this saves your bot from making up to one HTTP request per update.
However, there are a number of drawbacks to using this:

1. You will not be able to handle potential errors of the respective API call.
   This includes rate limiting errors, so you won't actually be guaranteed that your request has any effect.
2. More importantly, you also won't have access to the response object.
   For example, calling `sendMessage` will not give you access to the message you send.
3. Furthermore, it is not possible to cancel the request.
   The `AbortSignal` will be disregarded.
4. Note also that the types in grammY do not reflect the consequences of a performed webhook callback!
   For instance, they indicate that you always receive a response object, so it is your own responsibility to make sure you're not screwing up while using this minor performance optimization.

If you want to use webhook replies, you can specify the `canUseWebhookReply` option in the `client` option of your `BotConfig` ([API reference](/ref/core/botconfig)).
Pass a function that determines whether or not to use webhook reply for the given request, identified by method.

```ts
const bot = new Bot("", {
  client: {
    // We accept the drawback of webhook replies for typing status.
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
If you don't have that error handling, Telegram will send the same update again---but at least you will have error logs now, to tell you that something is wrong.

Once Telegram sends an update to your bot for the second time, it is unlikely that your handling of it will be faster than the first time.
As a result, it will likely timeout again, and Telegram will send the update again.
Thus, your bot will not just see the update two times, but a few dozen times, until Telegram stops retrying.
You may observe that your bot starts spamming users as it tries to handle all of those updates (that are in fact the same every time).

#### Why Ending a Webhook Request Early Is Also Dangerous

You can configure `webhookCallback` to not throw an error after the timeout, but instead end the webhook request early, even though your middleware is still running.
You can do this by passing `"return"` as a third argument to `webhookCallback`, instead of the default value `"throw"`.
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

#### Why `"return"` Is Generally Worse Than `"throw"`

You may be wondering why the default action of `webhookCallback` is to throw an error, instead of ending the request successfully.
This design choice was made for the following reasons.

Race conditions are very hard to reproduce and may occur extremely rarely or sporadically.
The solution to this is to _make sure not to run into timeouts_ in the first place.
But, if you do, you really want to know that this is happening, so that you can investigate and fix the problem!
For that reason, you want the error to occur in your logs.
Setting the timeout handler to `"return"`, hence suppressing the timeout and pretending that nothing happened, is exactly the opposite of useful behavior.

If you do this, you're in some sense using the update queue in Telegram's webhook delivery as your task queue.
This is a bad idea for all of the reasons described above.
Just because grammY _can_ suppress errors that can make you lose your data, does not mean you _should_ tell it to.
This configuration setting should not be used in cases where your middleware simply takes too much time to complete.
Take the time to correctly fix this issue, and your future self (and users) will thank you.
