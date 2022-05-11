# Hosting: Deno Deploy

This guide tells you about the ways you can host your grammY bots on [Deno Deploy](https://deno.com/deploy).

Please note that this guide is only for Deno users, and you need to have a [GitHub](https://github.com) account for creating a [Deno Deploy](https://deno.com/deploy) account.

Deno Deploy is ideal for most simple bots, and you should note that not all Deno features are available for apps running on Deno Deploy.
For example, there is no file system on Deno Deploy.
It's just like the other many serverless platforms, but dedicated for Deno apps.

## Preparing Your Code

1. Make sure that you have a file which exports your `Bot` object, so that you can import it later to run it.
2. Create a file named `mod.ts` or `mod.js`, or actually any name you like (but you should be remembering and using this as the main file to deploy), with the following content:

```ts
import { webhookCallback } from "https://deno.land/x/grammy/mod.ts";
import { serve } from "https://deno.land/x/sift@0.5.0/mod.ts";
// You might modify this to the correct way to import your `Bot` object.
import bot from "./bot.ts";

const handleUpdate = webhookCallback(bot, "std/http");

serve({
  ["/" + Deno.env.get("TOKEN")]: async (req) => {
    if (req.method == "POST") {
      try {
        return await handleUpdate(req);
      } catch (err) {
        console.error(err);
      }
    }
    return new Response();
  },
  "/": () => {
    return new Response("Hello world!");
  },
});
```

We advise you to have your handler on some secret path rather than root. Here, we are using the bot token.

## Deploying

### Method 1: With GitHub

> This is the recommended method, and the easiest one to go with.
> The main advantage of following this method is that Deno Deploy will watch for changes in your repository which includes your bot code, and it will deploy new versions automatically.

1. Create a repository on GitHub, it can be either private or public.
2. Push your code.

> It is recommended that you have a single stable branch and you do your testing stuff in other branches, so that you won't get some unexpected things happen.

3. Visit your [Deno Deploy dashboard](https://dash.deno.com/projects).
4. Click on "New Project" and go to the "Deploy from GitHub repository" section.
5. Install the GitHub app on your account or organization and choose your repository.
6. Select the branch you want to deploy, and then choose your `mod.ts` file to be deployed.

### Method 2: With `deployctl`

> This is a method for more advanced users. It allows you to deploy the project via the command line or Github Actions.

1. Visit your [Deno Deploy dashboard](https://dash.deno.com/projects).
2. Click on "New Project", then "Empty Project".
3. Install [`deployctl`](https://github.com/denoland/deployctl)
4. Create a new [access token](https://dash.deno.com/user/access-tokens). Save it somewhere
5. Run this command to deploy: `deployctl deploy --project <PROJECT_NAME> ./mod.ts --prod --token <ACCESS_TOKEN>`
6. To set up Github Actions, refer to [this](https://github.com/denoland/deployctl/blob/main/action/README.md).

### Method 3: With URL

> All you need for following this method to deploy your grammY bot, is a public URL to your `mod.ts` file.

1. Create a new project on Deno Deploy.
2. Click "Deploy URL".
3. Input the public URL to your `mod.ts` file, and click "Deploy".

### Note

After getting your app running, you should configure your bot's webhook settings to point to your app.
To do that, send a request to https://api.telegram.org/bot<token>/setWebhook?url=<url>, replacing `<token>` with your bot's token, and `<url>` with the full URL of your app along with the path to the webhook handler.
