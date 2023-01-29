# Hosting: Cloudflare Workers

[Cloudflare Workers](https://workers.cloudflare.com/) is a public serverless computing service developed by Cloudflare, which allows you to run JavaScript at the edge.
Specifically, it is a worker which handles HTTP traffic and is written against the [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API).
In combination with other services provided by Cloudflare, we can create powerful Telegram bots with ease.
Here are some of the awesome services that Cloudflare Workers offer us:

1. [Workers KV](https://developers.cloudflare.com/workers/runtime-apis/kv/), a global, low-latency, key-value data store,
2. [Durable Objects](https://developers.cloudflare.com/workers/runtime-apis/durable-objects/), a low-latency coordination and consistent storage for the Workers,
3. [R2](https://developers.cloudflare.com/r2/), an S3-compatible, zero egress-fee, globally distributed object storage,
4. [D1](https://developers.cloudflare.com/d1/), a queryable relational database at the edge,
5. [Queues](https://developers.cloudflare.com/queues/), a message queuing service that allows applications to reliably send and receive messages using Cloudflare Workers.

In addition, we can develop [Web Apps](https://core.telegram.org/bots/webapps) at the edge.
The best part of it is that all of this is free within some quotas.

This guide shows you how you can host your grammY bots on Cloudflare Workers.

## Prerequisites

To follow along, please make sure that you have a Cloudflare account with your workers subdomain configured.

## Setting Things Up

First, create a new project:

```sh
npx wrangler generate my-bot
```

You can change `my-bot` to whatever you want.
This will be the name of your bot and the project directory.

After running the above command, follow the instructions you see to initialize the project.
There, you can choose between JavaScript or TypeScript.

When the project is initialized, `cd` into `my-bot` or whatever directory you initialized your project in.
Depending on how you initialized the project, you should see a file structure similar to the following:

```asciiart:no-line-numbers
.
├── node_modules
├── package.json
├── package-lock.json
├── src
│   ├── index.js
│   └── index.test.js
└── wrangler.toml

Next, install `grammy`, and other packages you might need:

```sh
npm install grammy
```

## Creating Your Bot

Edit `src/index.js` or `src/index.ts`, and write this code inside:

```js
// Note that we're importing from 'grammy/web', not 'grammy'.
import { Bot, webhookCallback } from "grammy/web";

// You can replace `BOT_TOKEN` with your bot token, but it is better to store in an environment variable.
// For more on this, see https://developers.cloudflare.com/workers/platform/environment-variables/#secrets-on-deployed-workers.
// You should also replace `BOT_INFO` with your bot info from `bot.api.getMe()`.
const bot = new Bot(BOT_TOKEN, { botInfo: BOT_INFO });

bot.command("start", async (ctx) => {
  await ctx.reply("Hello, world!");
});

addEventListener("fetch", webhookCallback(bot, "cloudflare"));
```

The above example bot replies "Hello, world!" when it receives the start command.

## Deploying Your Bot

Before deploying, we need to edit `wrangler.toml`:

```toml
account_id = 'your account_id' # Get this from Cloudflare's dashboard.
name = 'my-bot' # The name of your bot, which will be a part of its webhook URL, for example: https://my-bot.my-subdomain.workers.dev
main = "src/index.js"  # The entry file of the worker.
compatibility_date = "2023-01-16"
```

You can then deploy using the following command:

```sh
npm run deploy
```

## Setting Your Webhook

We need to tell Telegram where to send updates to.
Open your browser and visit this URL:

```text
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://my-bot.my-subdomain.workers.dev/
```

Replacing `<BOT_TOKEN>`, `my-bot`, and `my-subdomain` with your values. If successful, you get a JSON response similar to this:

```json
{ "ok": true, "result": true, "description": "Webhook was set" }
```

## Testing Your Bot

Open your Telegram app, and start your bot.
If it responded, it means you're good to go!

## Debugging Your Bot

You can also run a local or remote development server for testing and debugging before deploying your bot to production:

```sh
npm run start
```
