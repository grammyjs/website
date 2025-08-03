---
prev: false
next: false
---

# Hosting: Cloudflare Workers (Node.js)

[Cloudflare Workers](https://workers.cloudflare.com) is a public serverless computing platform that offers a convenient and simple solution for running JavaScript at the [edge](https://en.wikipedia.org/wiki/Edge_computing).
Having the ability to handle HTTP traffic and being based on the [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), building Telegram bots becomes a breeze.
In addition, you can even develop [Web Apps](https://core.telegram.org/bots/webapps) at the edge, all for free within certain quotas.

This guide will take you through the process of hosting your Telegram bots on Cloudflare Workers.

::: tip Looking for the Deno Version?
This tutorial explains how to deploy a Telegram bot to Cloudflare Workers using Node.js.
If you're looking for the Deno version, please check out [this tutorial](./cloudflare-workers) instead.
:::

## Prerequisites

1. a [Cloudflare account](https://dash.cloudflare.com/login) with your workers subdomain [configured](https://dash.cloudflare.com/?account=workers).
2. a working [Node.js](https://nodejs.org/) environment with `npm` installed.

## Setting Things Up

First, [create a new project](https://developers.cloudflare.com/workers/get-started/guide/#1-create-a-new-worker-project):

```sh
npm create cloudflare@latest
```

Follow the instructions to set up the project.
In this guide, we assume that you start the project with the `Hello World` example in TypeScript.
The rest of the options are on your own.

## Install Dependencies

`cd` into your project directory, install `grammy`, and other packages you might need:

```sh
npm install grammy
```

## Creating Your Bot

Edit `src/index.ts`, and write this code inside:

```ts{12,29-30,33-38,41}
import { env } from "cloudflare:workers";
import { Bot, Context, webhookCallback } from "grammy";

export interface Env {
  BOT_TOKEN: string;
  BOT_INFO: string;
}

const bot = new Bot(env.BOT_TOKEN, { botInfo: JSON.parse(env.BOT_INFO) });
const handleUpdate = webhookCallback(bot, "cloudflare-mod");

bot.command("start", async (ctx: Context) => {
  await ctx.reply("Hello, world!");
});

export default {
  fetch: handleUpdate
};
```

Here, we first import `env` from `cloudflare:workers` to access your environment variables and secrets in the global scope.
Then, we import `Bot`, `Context` and `webhookCallback` from `grammy` to set up the bot.

Inside the interface `Env`, we add a variable `BOT_INFO`.
This is an environment variable that stores your bot info.
You can get your bot info by calling Telegram Bot API with `getMe` method.

Open this link in your web browser:

```ansi:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/getMe
```

Replace `<BOT_TOKEN>` with your bot token.
If successful, you will see a JSON response similar to this:

```json{3-12}
{
    "ok": true,
    "result": {
        "id": 1234567890,
        "is_bot": true,
        "first_name": "mybot",
        "username": "MyBot",
        "can_join_groups": true,
        "can_read_all_group_messages": false,
        "supports_inline_queries": true,
        "can_connect_to_business": false
    }
}
```

Store this info as the [secrets](https://developers.cloudflare.com/workers/configuration/secrets/) of your project.
In development, they can be set in the `.dev.vars` file, and in production, via the dashboard.

```env
BOT_TOKEN=
BOT_INFO='{
    "id": 1234567890,
    "is_bot": true,
    "first_name": "mybot",
    "username": "MyBot",
    "can_join_groups": true,
    "can_read_all_group_messages": false,
    "supports_inline_queries": true,
    "can_connect_to_business": false
}'
```

## Deploying Your Bot

Now, you can deploy your bot using the following command:

```sh
npm run deploy
```

## Setting Your Webhook

We need to tell Telegram where to send updates to.
Open your browser and visit this URL:

```ansi:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<MY_BOT>.<MY_SUBDOMAIN>.workers.dev/
```

Replace `<BOT_TOKEN>` with your bot token, replace `<MY_BOT>` with the name of your worker, replace `<MY_SUBDOMAIN>` with your worker subdomain configured on the Cloudflare dashboard.

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

Once the development server has started, you can test your bot by sending sample updates to it using tools like `curl`, [Insomnia](https://insomnia.rest), or [Postman](https://postman.com).
Refer to [here](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates) for update examples and [here](https://core.telegram.org/bots/api#update) for more information on the update structure.

If you don't want to construct the update, or if you want to test with a real update, you can get the update from Telegram Bot API with `getUpdates` method.
To do that, you will need to delete the webhook first.
Open your web browser and visit this link:

```ansi:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/deleteWebhook
```

Replace `<BOT_TOKEN>` with your bot token, you will see a JSON response like this:

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was deleted"
}
```

Then, open your Telegram client and send something to the bot, e.g. send `/start`.

Now visit this link in your web browser to get the updates:

```ansi:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
```

Again, replace `<BOT_TOKEN>` with your bot token, if successful, you will see a JSON response similar to this:

```json{4-29}
{
    "ok": true,
    "result": [
        {
            "update_id": 123456789,
            "message": {
                "message_id": 123,
                "from": {
                    "id": 987654321,
                    "is_bot": false,
                    "first_name": "",
                    "language_code": "en"
                },
                "chat": {
                    "id": 987654321,
                    "first_name": "",
                    "type": "private"
                },
                "date": 1712803046,
                "text": "/start",
                "entities": [
                    {
                        "offset": 0,
                        "length": 6,
                        "type": "bot_command"
                    }
                ]
            }
        }
    ]
}
```

`result` is an array of update objects (above only contains one update object), you should only copy one object and test your bot by post this object to the development server with the tools mentioned above.

If you want to ignore outdated updates (e.g., ignore all updates during development before deploying to production environment), you can add a parameter `offset` to the `getUpdates` method like this:

```ansi:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/getUpdates?offset=<update_id>
```

Replace `<BOT_TOKEN>` with your bot token, and replace `<update_id>` with the `update_id` of the latest update you received (the one with largest number), you will then only receive updates later than that update and will never be able to get the updates from earlier.

Now, you can test your bot with real update objects in your local development environment!

You can also expose your local development server to the public internet using some reverse proxy services like [Ngrok](https://ngrok.com/) and set the webhook to the URL you get from them, or you can set up your own reverse proxy if you have a public IP address, a domain name and a SSL certificate, but that is beyond the of scope of this guide.
For more information about setting up a reverse proxy, see the documentation for the software you are using.

::: warning
Using a third-party reverse proxy may result in information leakage!
:::

::: tip
Don't forget to [set the webhook back](#setting-your-webhook) when you deploy to production environment.
:::
