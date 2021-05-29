---
prev: ./files.md
next: /advanced/
---

# Long Polling vs. Webhooks

There are two ways how your bot can receive messages from the Telegram servers.
Your bot can either pull them in (long polling), or the Telegram servers can push them to your bot (webhooks).

grammY supports both ways of receiving updates, while long polling is the default.
This section outlines some of the advantages and disadvantes of using one or the other deployment method, and shows you how to use both.

## Long polling

Polling describes the process of continuously asking for updates every few milliseconds or so.
On the other hand, long polling sends a request that will be blocked by the server until a new message arrives, and then it returns.
Long polling resets the connection every now and then to avoid a number of [technical problems](https://tools.ietf.org/id/draft-loreto-http-bidirectional-07.html#timeouts).

### Advantages

1. **It's simpler.**
   You can run your bot on any device without the need for a public URL.
2. **It is more reliable in some cases.**
   If your bot takes very long to handle a message, the Telegram server just patiently waits.
   On the other hand, for webhooks, it may try to deliver the message again after some time, which leads to duplicate messages.

### How to use

Call

```ts
bot.start();
```

to run your bot with a very simple form of long polling.
It processes all updates sequentially.
This makes your bot very easy to debug, and all behaviour very predictable, because there is no concurrency involved.

If you want your messages to be handled concurrently by grammY, or you worry about throughput, check out the section about [grammY runner](/plugins/runner.md).

## Webhooks

If you own a server with a public URL, you can give that URL to Telegram and it will make HTTP requests against it to deliver the messages to you.

### Advantages

1. **It is more efficient.**
   If a webhook request comes it, it delivers a message and [can take back the response](#webhook-reply).
   Long polling always needs two requests for this, and it needs an open connection all the time, and it makes a lot of superfluous requests when no messages are sent to your bot. As a result, depending on the provider, hosting with webhooks can be cheaper.
2. **It is more reliable in other cases.**
   With webhooks, you can host your bots on serverless platforms.
   If processing a message fails, only that one request fails.
   Long polling might crash the complete instance if error handling is not done correctly, data loss may happen, and the bot may be offline until it restarts.

### How to use

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

Be sure to read [Marvin's Marvellous Guide to All Things Webhook](https://core.telegram.org/bots/webhooks) written by the Telegram team if you consider running your bot on webhooks.

### Webhook reply

When a webhook request is received, your bot can call up to one method in the response.
As a benefit, this saves your bot from making up to one HTTP request per update. However, there are a number of drawbacks to using this:

1. You will not be able to handle potential errors of the respective API call.
2. More importantly, you also won't have access to the response object, so e.g. calling `sendMessage` will not give you access to the message you send.
3. Furthermore, it is not possible to cancel the request. The `AbortSignal` will be disregarded.
4. Note also that the types in grammY do not reflect the consequences of a performed webhook callback!
   For instance, they indicate that you always receive a response object, so it is your own responsibility to make sure you're not screwing up while using this minor performance optimisation.

If you want to use webhook replies, you can specify the `canUseWebhookReply` option in the `client` option of your `BotConfig` ([API reference](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#BotConfig)).
Pass a function that determines whether or not to use webhook reply for the given request, identified by method.

```ts
const bot = new Bot(token, {
  client: {
    canUseWebhookReply: (method) => method === "sendChatAction",
  },
});
```

## I have still no idea what to use

Then go for long polling.
If you don't have a good reason to use webhooks, there are no major drawbacks to long polling, and—according to our experience—you will spend much less time fixing things.
Webhooks can be a bit nasty from time to time.

Either way, if you ever run into serious problems, it should not be too hard to switch after the fact.
