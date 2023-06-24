---
prev: false
next: false
---

# Hosting: Deno Deploy

This guide tells you about the ways you can host your grammY bots on [Deno Deploy](https://deno.com/deploy).

Please note that this guide is only for Deno users, and you need to have a [GitHub](https://github.com) account for creating a [Deno Deploy](https://deno.com/deploy) account.

Deno Deploy is ideal for most simple bots, and you should note that not all Deno features are available for apps running on Deno Deploy.
For example, the platform only supports a [limited set](https://deno.com/deploy/docs/runtime-fs) of the file system APIs available in Deno.
It's just like the other many serverless platforms, but dedicated for Deno apps.

The result of this tutorial [can be seen in our example bots repository](https://github.com/grammyjs/examples/tree/main/deno-deploy).

## Preparing Your Code

> Remember that you need to [run your bot on webhooks](../guide/deployment-types#how-to-use-webhooks), so you should use `webhookCallback` and not call `bot.start()` in your code.

1. Make sure that you have a file which exports your `Bot` object, so that you can import it later to run it.
2. Create a file named `mod.ts` or `mod.js`, or actually any name you like (but you should be remembering and using this as the main file to deploy), with the following content:

```ts
import { serve } from "https://deno.land/std/http/server.ts";
import { webhookCallback } from "https://deno.land/x/grammy/mod.ts";
// You might modify this to the correct way to import your `Bot` object.
import bot from "./bot.ts";

const handleUpdate = webhookCallback(bot, "std/http");

serve(async (req) => {
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

> This is the recommended method, and the easiest one to go with.
> The main advantage of following this method is that Deno Deploy will watch for changes in your repository which includes your bot code, and it will deploy new versions automatically.

1. Create a repository on GitHub, it can be either private or public.
2. Push your code.

> It is recommended that you have a single stable branch and you do your testing stuff in other branches, so that you won't get some unexpected things happen.

3. Visit your [Deno Deploy dashboard](https://dash.deno.com/projects).
4. Click on "New Project", and go to the "Deploy from GitHub repository" section.
5. Install the GitHub app on your account or organization, and choose your repository.
6. Select the branch you want to deploy, and then choose your `mod.ts` file to be deployed.

### Method 2: With `deployctl`

> This is a method for more advanced users. It allows you to deploy the project via the command line or Github Actions.

1. Visit your [Deno Deploy dashboard](https://dash.deno.com/projects).
2. Click "New Project", and then "Empty Project".
3. Install [`deployctl`](https://github.com/denoland/deployctl).
4. [Create an access token](https://dash.deno.com/user/access-tokens).
5. Run the following command:

```sh
deployctl deploy --project <project> ./mod.ts --prod --token <token>
```

6. To set up Github Actions, refer to [this](https://github.com/denoland/deployctl/blob/main/action/README).

### Method 3: With URL

> All you need for following this method to deploy your grammY bot, is a public URL to your `mod.ts` file.

1. Create a new project on Deno Deploy.
2. Click "Deploy URL".
3. Input the public URL to your `mod.ts` file, and click "Deploy".

### Note

After getting your app running, you should configure your bot's webhook settings to point to your app.
To do that, send a request to

```text
https://api.telegram.org/bot<token>/setWebhook?url=<url>
```

replacing `<token>` with your bot's token, and `<url>` with the full URL of your app along with the path to the webhook handler.
