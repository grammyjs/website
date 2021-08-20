---
prev: ./games.md
next: /advanced/
---

# Long Polling vs. Webhooks

There are two ways how your bot can receive messages from the Telegram servers.
grammY supports both of these two ways, while long polling is the default.

This section first describes what long polling and webhooks actually are, and in turn outlines some of the advantages and disadvantes of using one or the other deployment method.
It will also cover how to use them with grammY.

## Introduction

You can think of the whole webhooks vs. long polling discussion as a question of what _deployment type_ to use.
In other words, there are two fundamentally different ways to host your bot (run it on some server), and they differ in the way how the messages reach your bot, and can be processed by grammY.

Your bot can either pull them in (long polling), or the Telegram servers can push them to your bot (webhooks).

> If you already know how these things work, scroll down to see how to use [long polling](#how-to-use-long-polling) or [webhooks](#how-to-use-webhooks) with grammY.

## How does long polling work?

_Imagine you're buying a box of ice-cream in a store.
You can't find your favourite type of ice-cream, so you ask an employee to check if they have some in their storage.
The employee leaves, and comes back to you, telling you that they are out of stock._

_The next day, you're craving that delicious ice-cream again, so you go back to the same store.
You find the freezer to still be empty, but maybe they restocked over night?
Once again, you send the employee to the storage rooms, and voila, they can bring you three packs of best-in-town salted cararmel ice-cream.
Yummy._

**Polling** means that grammY proactively sends a request to Telegram, asking for new updates (=messages).
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
You can only get new ice-cream once every day (which is pretty bad), and your bot only receives new messages every few seconds or so (which is worse).
Instead of deciding to spam the Telegram servers with a request every few milliseconds to get the latest updates, we will use _long polling_ instead of just _polling_.

**Long polling** means that grammY proactively sends a request to Telegram, asking for new updates.
If no messages are there, Telegram will keep the connection open until new messages arrive, and then respond to the request with those new messages.

_Your trusted shop assistant already greets you with your first name by now.
Asked about another pack of ice-cream (don't they ever refill those freezers?), the employee walks back to the storage.
Unfortunately, no ice-cream is in stock.
But because it's a long polling shop assistant, he won't tell you that.
Instead, you just stand and wait patiently for three long days and nights until the shop is supplied with new products again.
Once the restocking is done at a demolishing 5 AM on Friday morning, the employee returns from the storage room.
“Good news”, you hear from a degenerated employee that started to grow a beard, “we do have ice-cream!”
An exhausted smile plays on his dry lips, and his tired eyes are flashing for a moment as his shaking hands hand you a tactlessly shiny pack of salted caramel._

And it is at this point that you know you have go to a different shop next time and make sure that long polling is only applied to grammY bot development.
Not to shop assistants.
Sorry for this terrible analogy.

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

> Note that in reality, no connection would be kept open for days.
> Long polling requests have a default timeout of 30 seconds (in order to avoid a number of [technical problems](https://tools.ietf.org/id/draft-loreto-http-bidirectional-07.html#timeouts)).
> If no new messages are returned after this period of time, then the request will be cancelled and resent.

## How do webhooks work?

_After this terrifying experience (three days without ice-cream!), you'd prefer not to go to the store at all anymore.
Wouldn't it be cool if the ice-cream could come to you?_

Setting up a **webhook** means that you will provide Telegram with a URL that is accessible from the public internet.
Whenever a new message is sent to your bot, Telegram (and not you!) will take the initiative and send a request with the update object to your server.
Nice, heh?

_You decide to walk to the shop one last time.
You tell your well-rested shop buddy where you live.
He promises to head over to your apartment personally whenever new ice-cream is there (because it would melt in the mail).
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
- on serverless platforms, such as cloud functions.

## I have still no idea what to use

Then go for long polling.
If you don't have a good reason to use webhooks, then note that there are no major drawbacks to long polling, and—according to our experience—you will spend much less time fixing things.
Webhooks can be a bit nasty from time to time.

Whatever you choose, if you ever run into serious problems, it should not be too hard to switch to the other deployment type after the fact.
With grammY, you only have to touch a few lines of code.

## How to use long polling

Call

```ts
bot.start();
```

to run your bot with a very simple form of long polling.
It processes all updates sequentially.
This makes your bot very easy to debug, and all behaviour very predictable, because there is no concurrency involved.

If you want your messages to be handled concurrently by grammY, or you worry about throughput, check out the section about [grammY runner](/plugins/runner.md).

## How to use webhooks

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

### Webhook reply

When a webhook request is received, your bot can call up to one method in the response.
As a benefit, this saves your bot from making up to one HTTP request per update. However, there are a number of drawbacks to using this:

1. You will not be able to handle potential errors of the respective API call.
   This includes rate limiting errors, so you won't actually be guaranteed that your request has any effect.
2. More importantly, you also won't have access to the response object.
   For example, calling `sendMessage` will not give you access to the message you send.
3. Furthermore, it is not possible to cancel the request.
   The `AbortSignal` will be disregarded.
4. Note also that the types in grammY do not reflect the consequences of a performed webhook callback!
   For instance, they indicate that you always receive a response object, so it is your own responsibility to make sure you're not screwing up while using this minor performance optimisation.

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
