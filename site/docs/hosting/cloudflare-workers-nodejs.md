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
2. a working [NodeJS](https://nodejs.org/) environment with `npm` installed.

## Setting Things Up

First, create a new project:

```sh
npm create cloudflare@latest
```

Then, you will be asked to enter the name of the worker:

```ansi{6}
using create-cloudflare version 2.17.1

╭ Create an application with Cloudflare Step 1 of 3
│
╰ In which directory do you want to create your application? also used as application name  // [!code focus]
  ./grammybot  // [!code focus]
```

Here we create a project named `grammybot`, you can choose your own, this will be the name of your worker as well as a part of the request URL.

::: tip
You can change the name of your worker in `wrangler.toml` later.
:::

Next, you will be asked to select the type of your worker, here we choose `"Hello World" Worker`:

```ansi{8}
using create-cloudflare version 2.17.1

╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./grammybot
│
╰ What type of application do you want to create?  // [!code focus]
  ● "Hello World" Worker  // [!code focus]
  ○ "Hello World" Worker (Python)  // [!code focus]
  ○ "Hello World" Durable Object  // [!code focus]
  ○ Website or web app  // [!code focus]
  ○ Example router & proxy Worker  // [!code focus]
  ○ Scheduled Worker (Cron Trigger)  // [!code focus]
  ○ Queue consumer & producer Worker  // [!code focus]
  ○ API starter (OpenAPI compliant)  // [!code focus]
  ○ Worker built from a template hosted in a git repository  // [!code focus]
```

Next, you will be asked to choose whether you want to use TypeScript, if you want to use JavaScript, choose `No`.
Here we choose `Yes`:

```ansi{11}
using create-cloudflare version 2.17.1

╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./grammybot
│
├ What type of application do you want to create?
│ type "Hello World" Worker
│
╰ Do you want to use TypeScript?  // [!code focus]
  Yes / No  // [!code focus]
```

Your project will be set up in a few minutes.
After that, you will be asked whether you want to use git for version control, choose `Yes` if you want the repo to be initialized automatically or `No` if you want to initialize it by yourself later.

Here we choose `Yes`:

```ansi{36}
using create-cloudflare version 2.17.1

╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./grammybot
│
├ What type of application do you want to create?
│ type "Hello World" Worker
│
├ Do you want to use TypeScript?
│ yes typescript
│
├ Copying template files
│ files copied to project directory
│
├ Updating name in `package.json`
│ updated `package.json`
│
├ Installing dependencies
│ installed via `npm install`
│
╰ Application created

╭ Configuring your application for Cloudflare Step 2 of 3
│
├ Installing @cloudflare/workers-types
│ installed via npm
│
├ Adding latest types to `tsconfig.json`
│ added @cloudflare/workers-types/2023-07-01
│
├ Retrieving current workerd compatibility date
│ compatibility date 2024-04-05
│
╰ Do you want to use git for version control?  // [!code focus]
  Yes / No  // [!code focus]
```

Finally, you will be asked whether you want to deploy your worker, choose `No`, we will deploy it when we have a working Telegram bot:

```ansi{49}
using create-cloudflare version 2.17.1

╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./grammybot
│
├ What type of application do you want to create?
│ type "Hello World" Worker
│
├ Do you want to use TypeScript?
│ yes typescript
│
├ Copying template files
│ files copied to project directory
│
├ Updating name in `package.json`
│ updated `package.json`
│
├ Installing dependencies
│ installed via `npm install`
│
╰ Application created

╭ Configuring your application for Cloudflare Step 2 of 3
│
├ Installing @cloudflare/workers-types
│ installed via npm
│
├ Adding latest types to `tsconfig.json`
│ added @cloudflare/workers-types/2023-07-01
│
├ Retrieving current workerd compatibility date
│ compatibility date 2024-04-05
│
├ Do you want to use git for version control?
│ yes git
│
├ Initializing git repo
│ initialized git
│
├ Committing new files
│ git commit
│
╰ Application configured

╭ Deploy with Cloudflare Step 3 of 3
│
╰ Do you want to deploy your application?  // [!code focus]
  Yes / No  // [!code focus]
```

## Install dependencies

`cd` into `grammybot` (replace this by your worker's name you set above), install `grammy`, and other packages you might need:

```sh
npm install grammy
```

## Creating Your Bot

Edit `src/index.js` or `src/index.ts`, and write this code inside:

```ts{11,28-29,38,40-42,44}
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Bot, Context, webhookCallback } from "grammy";

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
  //
  // Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
  // MY_QUEUE: Queue;
  BOT_INFO: string;
  BOT_TOKEN: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const bot = new Bot(env.BOT_TOKEN, { botInfo: JSON.parse(env.BOT_INFO) });

    bot.command("start", async (ctx: Context) => {
      await ctx.reply("Hello World!");
    });

    return webhookCallback(bot, "cloudflare-mod")(request);
  },
};
```

Here, we first import `Bot`, `Context` and `webhookCallback` from `grammy`.

Inside the interface `Env`, we add a variable `BOT_INFO`, this is an environment variable that stores your bot info, you can get your bot info by calling Telegram Bot API with `getMe` method.
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

Now, open `wrangler.toml` in the root of your project and add an environment variable `BOT_INFO` under `[vars]` section with the value from `result` object you get above like this:

```toml
[vars]
BOT_INFO = """{
    "id": 1234567890,
    "is_bot": true,
    "first_name": "mybot",
    "username": "MyBot",
    "can_join_groups": true,
    "can_read_all_group_messages": false,
    "supports_inline_queries": true,
    "can_connect_to_business": false
}"""
```

Replace the bot info with what you get from the web browser.
Pay attention to the three double quotation marks `"""` at the beginning and end.

In addition to `BOT_INFO`, we also add a variable `BOT_TOKEN`, this is an environment variable that stores your bot token that is used to create your bot.

You may notice that we just define the variable `BOT_TOKEN`, but didn't assign it yet.
Usually you need to store your environment variable in `wrangler.toml`, however, this is not safe in our case, since the bot token should be kept secret.
Cloudflare Workers provide us a safe way to store sensitive information like API keys and auth tokens in environment variable: [secrets](https://developers.cloudflare.com/workers/configuration/secrets/#secrets)!

::: tip
Secret values are not visible within Wrangler or the Cloudflare dashboard after you define them.
:::

You can add a secret to your project using the following command:

```sh
npx wrangler secret put BOT_TOKEN
```

Follow the instruction and input your bot token, your bot token will be uploaded and encrypted.

::: tip
You can change to whatever name you want for the environment variables, but keep in mind that you do the same in following steps.
:::

Inside the function `fetch()`, we create a bot with `BOT_TOKEN` which replies "Hello, world!" when it receives `/start`.

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

In a development environment, your bot doesn't have access to your secret environment variables.
So, [according to Cloudflare](https://developers.cloudflare.com/workers/configuration/secrets/#secrets-in-development), you can create a `.dev.vars` file in the root of your project to define secrets:

```env
BOT_TOKEN=<your_bot_token>  # <- replace this with your bot token.
```

Don't forget to add `BOT_INFO` for development as well.
Click [here](https://developers.cloudflare.com/workers/configuration/environment-variables/) and [here](https://developers.cloudflare.com/workers/configuration/secrets/) for more details about environment variables and secrets.

Replace `BOT_INFO` and `BOT_TOKEN` with your value if you change the environment variable name in the previous step.

::: tip
You can use a different bot token for development to ensure it doesn't affect production.
:::

Now, you can run the following command to start a development server:

```sh
npm run dev
```

Once the development server has started, you can test your bot by sending sample updates to it using tools like `curl`, [Insomnia](https://insomnia.rest), or [Postman](https://postman.com).
Refer to [here](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates) for update examples and [here](https://core.telegram.org/bots/api#update) for more information on the update structure.

If you don't want to construct the update, or if you want to test with a real update, you can get the update from Telegram Bot API with `getUpdates` method.
To do that, you will need to delete the webhook first. Open your web browser and visit this link:

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
