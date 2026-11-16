---
prev: false
next: false
---

# Hosting: Deno Deploy

This guide shows how to run a grammY bot on [Deno Deploy](https://docs.deno.com/deploy/).

::: warning Deno Deploy is shutting down
Deno Deploy Classic shut down in July 2026, and the current Deno Deploy service will [shut down in April 2027](https://deno.com/blog/cloudflare).
For a new bot or to migrate an existing one, you can [run your Deno bot on a VPS](./vps).
:::

The result of this tutorial [can be seen in our example bots repository](https://github.com/grammyjs/examples/tree/main/setups/deno-deploy).

## Preparing Your Code

> Remember that you need to [run your bot on webhooks](../guide/deployment-types#how-to-use-webhooks), so you should use `webhookCallback` and not call `bot.start()` in your code.

1. Make sure that you have a file which exports your `Bot` object, so that you can import it later to run it.
2. Create a file named `main.ts` or `main.js`, or actually any name you like (but you should be remembering and using this as the main file to deploy), with the following content:

```ts
import { webhookCallback } from "npm:grammy";
// You might modify this to the correct way to import your `Bot` object.
import bot from "./bot.ts";

const handleUpdate = webhookCallback(bot, "std/http");

Deno.serve(async (req) => {
  if (req.method === "POST") {
    const url = new URL(req.url);
    if (url.pathname.slice(1) === bot.token) {
      try {
        return await handleUpdate(req);
      } catch (err) {
        console.error(err);
      }
    }
  }
  return new Response();
});
```

We advise you to have your handler on some secret path rather than the root (`/`).
Here, we are using the bot token (`/<bot token>`).

## Deploying

### Method 1: With GitHub

Follow the [Deno Deploy getting started guide](https://docs.deno.com/deploy/getting_started/) to create an app and connect your GitHub repository.
Configure the app as dynamic, set its entrypoint to `main.ts` or the filename you chose above, and set any environment variables your bot needs.

### Method 2: With `deno deploy`

Follow the [`deno deploy` documentation](https://docs.deno.com/runtime/reference/cli/deploy/) to create and deploy a dynamic app from your local project.
Use `main.ts` or the filename you chose above as the entrypoint.

### Note

After getting your app running, you should configure your bot's webhook settings to point to your app.
To do that, send a request to

```sh:no-line-numbers
curl https://api.telegram.org/bot<token>/setWebhook?url=<url>
```

replacing `<token>` with your bot token, and `<url>` with the full URL of your app along with the path to the webhook handler.
