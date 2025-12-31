---
prev: false
next: false
---

# Hosting: Deno Deploy

This guide tells you about the ways you can host your grammY bots on [Deno Deploy](https://deno.com/deploy).

Please note that this guide is only for Deno users, and you need to have a [GitHub](https://github.com) account for creating a [Deno Deploy](https://deno.com/deploy) account.

Deno Deploy is ideal for most simple bots, and you should note that not all Deno features are available for apps running on Deno Deploy.
For example, the platform only supports a [limited set](https://docs.deno.com/deploy/classic/api/runtime-fs/) of the file system APIs available in Deno.
It's just like the other many serverless platforms, but dedicated for Deno apps.

The result of this tutorial [can be seen in our example bots repository](https://github.com/grammyjs/examples/tree/main/setups/deno-deploy).

## Preparing Your Code

> Remember that you need to [run your bot on webhooks](../guide/deployment-types#how-to-use-webhooks), so you should use `webhookCallback` and not call `bot.start()` in your code.

1. Make sure that you have a file which exports your `Bot` object, so that you can import it later to run it.
2. Create a file named `main.ts` or `main.js`, or actually any name you like (but you should be remembering and using this as the main file to deploy), with the following content:

```ts
import { webhookCallback } from "https://deno.land/x/grammy/mod.ts";
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

> This is the recommended method, and the easiest one to go with.
> The main advantage of following this method is that Deno Deploy will watch for changes in your repository which includes your bot code, and it will deploy new versions automatically.

1. Create a repository on GitHub, it can be either private or public.
2. Push your code.

   > It is recommended that you have a single stable branch and you do your testing stuff in other branches, so that you won't get some unexpected things happen.

3. Visit your [Deno Deploy dashboard](https://dash.deno.com/account/overview).
4. Click on "New Project".
5. Install the GitHub app on your account or organization, and choose your repository.
6. Select the branch you want to deploy.
7. Select the entrypoint file `main.ts`, and click "Deploy Project" to deploy.

### Method 2: With `deployctl`

> This is a method for more advanced users or if you don't want to upload your code to GitHub.
> It allows you to deploy the project via the command line or GitHub Actions.

1. Install [`deployctl`](https://github.com/denoland/deployctl).
2. Create an access token from the "Access Tokens" section in [account settings](https://dash.deno.com/account).
3. Go to your project directory and run the following command:

   ```sh:no-line-numbers
   deployctl deploy --project=<project> --entrypoint=./main.ts --prod --token=<token>
   ```

   ::: tip Setting environment variables
   Environment variables can be set by heading to your project's settings after deploying.

   But this is possible from the command line, as well:

   1. You can assign environment variables from a dotenv file by adding the `--env-file=<file>` argument.
   2. You can also specify them individually by using the `--env=<key=value>` argument.

   :::
4. To set up GitHub Actions, refer to [this](https://github.com/denoland/deployctl/blob/main/action/README.md).

Check out the [deployctl documentation](https://docs.deno.com/deploy/classic/deployctl/) for more information.

### Note

After getting your app running, you should configure your bot's webhook settings to point to your app.
To do that, send a request to

```sh:no-line-numbers
curl https://api.telegram.org/bot<token>/setWebhook?url=<url>
```

replacing `<token>` with your bot token, and `<url>` with the full URL of your app along with the path to the webhook handler.
