---
prev: false
next: false
---

# CRM, Live Chat, and Analytics (`flowcastle`)

Bot code alone does not show you who your users are, which conversations convert, or give your support team an inbox.
FlowCastle is a hosted dashboard for exactly that, and this plugin connects it to the grammY bot you already have.
One middleware line adds a contact CRM, live-chat handoff, broadcasts, goal tracking, and conversion funnels.
Your handlers, deployment, database, and bot token stay yours; FlowCastle never sees the token.

The plugin observes incoming updates and outgoing Bot API calls, batches them, and ships them to FlowCastle in the background.
Ordinary updates never wait on FlowCastle: events go into a bounded fire-and-forget queue, and your handlers run immediately.
Privacy filtering runs locally in your process before anything is transmitted, with a contact-field allowlist, message-content modes, and an awaited redaction hook.

## Usage

```ts
import { Bot } from "grammy";
import { flowcastle } from "@flowcastle/grammy";

const bot = new Bot(""); // <-- put your bot token between the ""

bot.use(flowcastle({ apiKey: "", privacy: {} })); // <-- put your FlowCastle API key between the ""

bot.command("hello", (ctx) => ctx.reply("Still handled by my code"));

bot.start();
```

Contacts, message analytics, blocked-user detection, and a live connection indicator then appear in the FlowCastle dashboard.
An API key is available on the free plan without a card: open your application in the dashboard and choose **Add bot → Code SDK**.

Passing `privacy: {}` opts into privacy-first defaults: no optional contact profile fields and routing-only message content.
See the [privacy controls documentation](https://github.com/FlowCastle/flowcastle-sdk/blob/main/packages/sdk-grammy/README.md#privacy-controls) for the allowlist, content modes, and the `transformText` redaction hook.

Handlers can also report conversion goals and hand a chat over to a human agent:

```ts
bot.command("buy", async (ctx) => {
  await ctx.flowcastle.goal("started-checkout");
});

bot.command("support", async (ctx) => {
  await ctx.flowcastle.requestLiveAgent();
});
```

Teammates can additionally build no-code flows in the FlowCastle editor that run server-side next to your code.
Updates claimed by such a flow are consumed by FlowCastle, and all unmatched updates continue through your normal grammY middleware chain.

The SDK is MIT-licensed with zero runtime dependencies and requires Node.js 18 or newer.
The backend is FlowCastle's hosted service (free tier available); it is not self-hostable today.

## Plugin Summary

- Name: `flowcastle`
- [Package](https://www.npmjs.com/package/@flowcastle/grammy)
- [Source](https://github.com/FlowCastle/flowcastle-sdk)
