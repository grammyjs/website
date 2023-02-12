# Hosting: Cloudflare Workers

[Cloudflare Workers](https://workers.cloudflare.com/) is a public serverless computing platform that offers a convenient and simple solution for running JavaScript at the edge.
With the ability to handle HTTP traffic and work with [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), building Telegram bots becomes a breeze.
In addition, you can even develop [Web Apps](https://core.telegram.org/bots/webapps) at the edge, all for free within certain quotas.

This guide will take you through the process of hosting your Telegram bots on Cloudflare Workers.

## Prerequisites

To follow along, please make sure that you have a [Cloudflare account](https://dash.cloudflare.com/login) with your workers subdomain [configured](https://dash.cloudflare.com/?account=workers).

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
```

Next, install `grammy`, and other packages you might need:

```sh
npm install grammy
```

## Creating Your Bot

Edit `src/index.js` or `src/index.ts`, and write this code inside:

```ts
// Note that we're importing from 'grammy/web', not 'grammy'.
import { Bot, webhookCallback } from "grammy/web";

// You can replace `BOT_TOKEN` with your bot token, but it is better to store it in an environment variable.
// For more on this, see https://developers.cloudflare.com/workers/platform/environment-variables/#secrets-on-deployed-workers.
// You should also replace `BOT_INFO` with your bot info obtained from `bot.api.getMe()`.
const bot = new Bot(BOT_TOKEN, { botInfo: BOT_INFO });

bot.command("start", async (ctx) => {
  await ctx.reply("Hello, world!");
});

addEventListener("fetch", webhookCallback(bot, "cloudflare"));
```

The above example bot replies "Hello, world!" when it receives `/start`.

## Deploying Your Bot

Before deploying, we need to edit `wrangler.toml`:

```toml
account_id = 'your account_id' # Get this from Cloudflare's dashboard.
name = 'my-bot' # Your bot's name, which will appear in the webhook URL, for example: https://my-bot.my-subdomain.workers.dev
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
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<MY_BOT>.<MY_SUBDOMAIN>.workers.dev/
```

Replace `<BOT_TOKEN>`, `<MY_BOT>`, and `<MY_SUBDOMAIN>` with your values.
If the setup is successful, you'll see a JSON response like this:

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

## Testing Your Bot

Open your Telegram app, and start your bot.
If it responds, it means you're good to go!

## Debugging Your Bot

For testing and debugging purposes, you can run a local or remote development server before deploying your bot to production.
Simply run the following command:

```sh
npm run start
```

Once the development server has started, you can test your bot by sending sample updates to it using tools like `curl`, [Insomnia](https://insomnia.rest), or [Postman](https://postman.com).
For more information on the update structure, refer to the [Telegram API documentation](https://core.telegram.org/bots/api#update).

