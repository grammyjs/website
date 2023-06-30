# Hosting: Supabase Edge Functions

This guide tells you how you can host your grammY bots on [Supabase](https://supabase.com/).

Please note that you need to have a [GitHub](https://github.com) account before you can use [Supabase Edge Functions](https://supabase.com/docs/guides/functions/quickstart).
Moreover, Supabase Edge Functions are based on [Deno Deploy](https://deno.com/deploy), so just like [our Deno Deploy guide](./deno-deploy), this guide is only for Deno users of grammY.

Supabase Edge Functions is ideal for most simple bots, and you should note that not all Deno features are available for apps running on Supabase Edge Functions.
For example, there is no file system on Supabase Edge Functions.
It's just like the other many serverless platforms, but dedicated for Deno apps.

The result of this tutorial [can be seen in our example bots repository](https://github.com/grammyjs/examples/tree/main/supabase-edge-functions).

## Setup

In order to deploy a Supabase Edge Function, you will need to create a Supabase account, install their CLI, and create a Supabase project.
You should first [follow their documentation](https://supabase.com/docs/guides/functions/quickstart#prerequisites) to set things up.

Create a new Supabase Function by running this command:

```sh
supabase functions new telegram-bot
```

Once you have created a Supabase Function project, you can write your bot.

## Preparing Your Code

> Remember that you need to [run your bot on webhooks](../guide/deployment-types#how-to-use-webhooks), so you should use `webhookCallback` and not call `bot.start()` in your code.

You can use this short example bot as a starting point.

```ts
import { serve } from "https://deno.land/std/http/server.ts";
import { Bot, webhookCallback } from "https://deno.land/x/grammy/mod.ts";

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN is unset");

const bot = new Bot(token);

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
bot.command("ping", (ctx) => ctx.reply(`Pong! ${new Date()}`));

const handleUpdate = webhookCallback(bot, "std/http");

serve(async (req) => {
  try {
    const url = new URL(req.url);
    if (url.searchParams.get("secret") !== bot.token) {
      return new Response("not allowed", { status: 405 });
    }
    return await handleUpdate(req);
  } catch (err) {
    console.error(err);
  }
});
```

## Deploying

You can now deploy your bot to Supabase.
Note that you will have to disable JWT authorization because Telegram uses a different way to make sure the requests are coming from Telegram.
You can deploy the function using this command.

```sh
supabase functions deploy --no-verify-jwt telegram-bot
```

Next, you need to give your bot token to Supabase so that your code has access to it as an environment variable.

```sh
# Replace 123:aBcDeF-gh with your real bot token.
supabase secrets set BOT_TOKEN=123:aBcDeF-gh
```

Your Supabase Function is now working.
All that's left to do is to tell Telegram where to send the updates.
You can do this by calling `setWebhook`.
For example, open a new tab in your browser and visit this URL:

```text
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<PROJECT_NAME>.functions.supabase.co/telegram-bot?secret=<BOT_TOKEN>
```

Replace `<BOT_TOKEN>` with your real bot token.
Also, replace the second occurrence of `<BOT_TOKEN>` with your real bot token.
Replace `<PROJECT_NAME>` with the name of your Supabase project.

You should now see this in your browser window.

```json
{ "ok": true, "result": true, "description": "Webhook was set" }
```

Done!
Your bot is working now.
Head over to Telegram and watch it respond to messages!
