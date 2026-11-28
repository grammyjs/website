---
prev: false
next: false
---

# FlowCastle Integration (`flowcastle`)

[FlowCastle](https://flowcastle.ai) is a hosted service with a web dashboard for Telegram bots.
This plugin connects an existing grammY bot to it, so that the dashboard can show contacts, message analytics, conversion goals, and a live-chat inbox for your bot.
Your bot keeps running on your own infrastructure with your own handlers, and the bot token is never sent to FlowCastle.

## How It Works

The plugin is a middleware.
It observes incoming updates as well as outgoing Bot API calls made through `ctx.api`.
These events are batched and sent to FlowCastle in the background.
Your handlers do not wait for the network: events go into a bounded queue, and if delivery fails, the analytics data is dropped instead of throwing into your middleware chain.

You can control what leaves your process.
Filtering runs locally before an event is queued: you choose which contact fields are sent, how much message content is sent, and you can pass a function that redacts text.

## Usage

```ts
import { Bot } from "grammy";
import { flowcastle } from "@flowcastle/grammy";

const bot = new Bot(""); // <-- put your bot token between the ""

bot.use(flowcastle({ apiKey: "", privacy: {} })); // <-- put your FlowCastle API key between the ""

bot.command("hello", (ctx) => ctx.reply("Hello!"));

bot.start();
```

You get an API key in the FlowCastle dashboard by opening your application and choosing **Add bot → Code SDK**.

Passing `privacy: {}` enables the strict defaults: no optional profile fields such as names or usernames, and only routing data such as command names and callback identifiers instead of message text.
The [privacy section of the README](https://github.com/FlowCastle/flowcastle-sdk/blob/main/packages/sdk-grammy/README.md#privacy-controls) describes all options.

### Goals and Live Chat

The plugin adds `ctx.flowcastle` to the context object.
You can use it to record a goal or to hand the chat over to a human agent in the dashboard.

```ts
bot.command("buy", async (ctx) => {
  await ctx.flowcastle.goal("started-checkout");
});

bot.command("support", async (ctx) => {
  await ctx.flowcastle.requestLiveAgent();
});
```

## Limitations

- The plugin only works on Node.js 18 or newer.
- Bot API calls made through `bot.api` outside of a handler are not observed.
- The backend is a hosted service that cannot be self-hosted.
  It has a free plan.

## Plugin Summary

- Name: `flowcastle`
- [Package](https://www.npmjs.com/package/@flowcastle/grammy)
- [Source](https://github.com/FlowCastle/flowcastle-sdk)
