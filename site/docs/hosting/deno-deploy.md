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
import {
  serve,
} from "https://deno.land/x/sift@0.5.0/mod.ts";
// You might modify this to the correct way to import your `Bot` object.
import bot from "./bot.ts";

const handleUpdate = webhookCallback(bot, "std/http");

serve({
  ['/' + Deno.env.get('TOKEN')]: async (req) => {
    if (req.method == "POST") {
      try {
        return await handleUpdate(req);
      } catch (err) {
        console.error(err);
      }
    }
    return new Response();
  },
  '/': () => {
    return new Response('Hello world!')
  }
});
```

It's advisable to have webhook handler on some secret path rather that root. Here we use a bot token for that.

## Deploying

### Method 1: With GitHub

> This is the recommended method, and the easiest one to go with.
> The main advantage of following this method is that Deno Deploy will watch for changes in your repository which includes your bot code, and it will deploy new versions automatically.

1. Create a repository on GitHub, it can be either private or public.
2. Push your code.

> It is recommended that you have a single stable branch and you do your testing stuff in other branches, so that you won't get some unexpected things happen.

1. Visit your [Deno Deploy dashboard](https://dash.deno.com/projects).
2. Click on "New Project" and go to "Deploy from GitHub repository" section.
3. Install the GitHub app on your account or organization and choose your repository.
4. Select the branch you want to deploy, and then choose your `mod.ts` file to be deployed.
3. It's recommended to store the token in environment variables. You can set them up on the Settings page.
4. Set your bot's webhook url to `https://<PROJECT_NAME>.deno.dev/<TOKEN>` (Replacing `<...>` with respective values). In order to do that, run this url (in your browser, for example): `https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<PROJECT_NAME>.deno.dev/<TOKEN>`

### Method 2: With `deployctl`

> This is a method for more advanced users. It allows you to deploy the project via the command line or Github Actions.

1. Visit your [Deno Deploy dashboard](https://dash.deno.com/projects).
2. Click on "New Project", then "Empty Project".
3. Install [`deployctl`](https://github.com/denoland/deployctl)
4. It's recommended to store the token in environment variables. You can set them up on the Settings page.
5. Set your bot's webhook url to `https://<PROJECT_NAME>.deno.dev/<TOKEN>` (Replacing `<...>` with respective values). In order to do that, run this url (in your browser, for example): `https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<PROJECT_NAME>.deno.dev/<TOKEN>`
6. Create a new [access token](https://dash.deno.com/user/access-tokens). Save it somewhere
7. Run this command to deploy: `deployctl deploy --project <PROJECT_NAME> ./mod.ts --prod --token <ACCESS_TOKEN>`
8. To set up Github actions, refer to [this](https://github.com/denoland/deployctl/blob/main/action/README.md) documentation

### Method 3: With URL

> All you need for following this method to deploy your grammY bot, is a public URL to your `mod.ts` file.

1. Create a new project on Deno Deploy.
2. Click "Deploy URL".
3. Input the public URL to your `mod.ts` file, and click "Deploy".
4. It's recommended to store the token in environment variables. You can set them up on the Settings page.
5. Set your bot's webhook url to `https://<PROJECT_NAME>.deno.dev/<TOKEN>` (Replacing `<...>` with respective values). In order to do that, run this url (in your browser, for example): `https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<PROJECT_NAME>.deno.dev/<TOKEN>`
