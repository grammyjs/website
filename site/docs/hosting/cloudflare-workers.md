# Hosting: Cloudflare Workers (Deno)

[Cloudflare Workers](https://workers.cloudflare.com) is a public serverless computing platform that offers a convenient and simple solution for running small workloads at the [edge](https://en.wikipedia.org/wiki/Edge_computing).

This guide will take you through the process of hosting your bot on Cloudflare Workers.

::: tip Looking for the Node.js Version?
This tutorial explains how to deploy a Telegram bot to Cloudflare Workers using Deno.
If you're looking for the Node.js version, please check out [this tutorial](./cloudflare-workers-nodejs) instead.
:::

## Prerequisites

To follow along, please make sure that you have a [Cloudflare account](https://dash.cloudflare.com/login) with your workers subdomain [configured](https://dash.cloudflare.com/?account=workers).

## Setting Things Up

Make sure you have [Deno](https://deno.land) and [Denoflare](https://denoflare.dev) installed.

Create a new directory, and create a new file `.denoflare` in that directory.
Put the following contents in the file:

> Note: The "$schema" key in the following JSON code specifies a fixed version in its URL ("v0.5.12").
> At the time of writing, this was the latest version available.
> You should update them to the [newest version](https://github.com/skymethod/denoflare/releases).

```json
{
  "$schema": "https://raw.githubusercontent.com/skymethod/denoflare/v0.5.12/common/config.schema.json",
  "scripts": {
    "my-bot": {
      "path": "bot.ts",
      "localPort": 3030,
      "bindings": {
        "BOT_TOKEN": {
          "value": "YOUR_BOT_TOKEN"
        }
      },
      "workersDev": true
    }
  },
  "profiles": {
    "account1": {
      "accountId": "YOUR_ACCOUNT_ID",
      "apiToken": "YOUR_API_TOKEN"
    }
  }
}
```

Make sure to replace `YOUR_ACCOUNT_ID`, `YOUR_API_TOKEN`, and `YOUR_BOT_TOKEN` appropriately.
When creating your API token, you can choose the `Edit Cloudflare Workers` preset from the pre-configured permissions.

## Creating Your Bot

Create a new file named `bot.ts` and put the following contents in it:

```ts
import { Bot, webhookCallback } from "https://deno.land/x/grammy/mod.ts";
import { UserFromGetMe } from "https://deno.land/x/grammy/types.ts";

interface Environment {
  BOT_TOKEN: string;
}

let botInfo: UserFromGetMe | undefined = undefined;

export default {
  async fetch(request: Request, env: Environment) {
    try {
      const bot = new Bot(env.BOT_TOKEN, { botInfo });

      if (botInfo === undefined) {
        await bot.init();
        botInfo = bot.botInfo;
      }

      bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
      bot.on("message", (ctx) => ctx.reply("Got another message!"));

      const cb = webhookCallback(bot, "cloudflare-mod");

      return await cb(request);
    } catch (e) {
      return new Response(e.message);
    }
  },
};
```

## Deploying Your Bot

It's as easy as running:

```sh
denoflare push my-bot
```

The output of the above command will provide you with the host the worker is running on.
Watch out for a line containing something like `<MY_BOT>.<MY_SUBDOMAIN>.workers.dev`.
That's the host where your bot is waiting to be called.

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
denoflare serve my-bot
```

Once the development server has started, you can test your bot by sending sample updates to it using tools like `curl`, [Insomnia](https://insomnia.rest), or [Postman](https://postman.com).
Refer to [here](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates) for update examples and [here](https://core.telegram.org/bots/api#update) for more information on the update structure.
