# Hosting: Firebase Functions

This tutorial will guide you through the process of deploying your bot to [Firebase Functions](https://firebase.google.com/docs/functions).

## Prerequisites

To follow along, you will need to have a Google account.
If you don't already have one, you can create it [here](https://accounts.google.com/signup).

## Setup

This section guides you through the setup process.
If you need more detailed explanations on each step that you'll take, refer to the [official Firebase documentation](https://firebase.google.com/docs/functions/get-started).

### Creating a Firebase Project

1. Go to the [Firebase console](https://console.firebase.google.com/) and click **Add Project**.
2. If prompted, review and accept the Firebase terms.
3. Click **Continue**.
4. Decide on whether you want to share analytics or not.
5. Click **Create Project**.

### Setup Node.js and Firebase CLI

To write functions and deploy them to the Firebase Functions runtime, you'll need to set up a Node.js environment and install the Firebase CLI.

> It's important to note that only the Node.js versions 14, 16, and 18 are currently supported by Firebase Functions.
> For more on the supported Node.js versions, refer to [here](https://firebase.google.com/docs/functions/manage-functions#set_nodejs_version).

Once you have Node.js and NPM installed, install Firebase CLI globally:

```sh
npm install -g firebase-tools
```

### Initializing the Project

1. Run `firebase login` to log in via the browser and authenticate the Firebase CLI.
2. `cd` into your project's directory.
3. Run `firebase init functions`, and type `y` when asked whether you want to initialize a new codebase.
4. Choose `use existing project` and select the project you created in Step 1.
5. The CLI gives you two options for language support:
   - JavaScript
   - TypeScript

   For this tutorial, select TypeScript.

6. Optionally, you can select ESLint.
7. The CLI asks you if you want to install the dependencies with npm.
   If you use another package manager like `yarn` or `pnpm` you can decline.
   In that case, you have to `cd` into the `functions` directory and install the dependencies manually.
8. Open `./functions/package.json` and look for the key: `"engines": {"node": "16"}`.
   The `node` version should match your installed version of Node.js.
   Otherwise, the project might not run.

## Preparing Your Code

You can use this short example bot as a starting point:

```ts
import * as functions from "firebase-functions";
import { Bot, webhookCallback } from "grammy";

const bot = new Bot(""); // <-- put your bot token here (https://t.me/BotFather)

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
bot.command("ping", (ctx) => ctx.reply(`Pong! ${new Date()}`));

// During development, you can trigger your function at https://localhost/<firebase-projectname>/us-central1/helloworld
export const helloWorld = functions.https.onRequest(webhookCallback(bot));
```

## Local Development

During development, you can use the firebase emulator suite to run your code locally.
This is way faster than deploying every change to Firebase.
To install the emulators, run:

```sh
firebase init emulators
```

The functions emulator should be selected already.
(If it isn't, navigate to it using the arrow keys, and select it using `space`.)
For the questions about which port to use for each emulator, simply press `enter`.

To start the emulators and run your code, use:

```sh
npm run serve
```

::: tip
For some reason the standard configuration of the npm script does not start the TypeScript compiler in watch mode.
Therefore, if you use TypeScript, you also have to run:

```sh
npm run build:watch
```

:::

After the emulators start, you should find a line in the console output that looks like this:

```sh
+  functions[us-central1-helloWorld]: http function initialized (http://127.0.0.1:5001/<firebase-projectname>/us-central1/helloWorld).
```

That is the local URL of your cloud function.
However, your function is only available to the localhost on your computer.
To actually test your bot, you need to expose your function to the internet so that the Telegram API can send updates to your bot.
There are several services, such as [localtunnel](https://localtunnel.me) or [ngrok](https://ngrok.com), that can help you with that.
In this example, we will use localtunnel, as it does not shut down after an hour like ngrok does.

First, let's install localtunnel:

```sh
npm i -g localtunnel
```

After that, you can expose the port `5001` to the internet:

```sh
lt --port 5001
```

localtunnel should give you a unique URL, such as `https://modern-heads-sink-80-132-166-120.loca.lt`

All that's left to do is to tell Telegram where to send the updates.
You can do this by calling setWebhook.
For example, open a new tab in your browser and visit this URL:

```text:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=<LT_URL>/<firebase-projectname>/us-central1/helloWorld
```

Replace `<BOT_TOKEN>` with your real bot token, and `<LT_URL>` with your own URL you received from localtunnel.

You should now see this in your browser window.

```json:no-line-numbers
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

Your bot is now ready for deployment testing.

## Deploying

To deploy your function, just run:

```sh
firebase deploy
```

The Firebase CLI will give you the url of your function once the deployment is completed.
It should look something like `https://<REGION>.<MY_PROJECT.cloudfunctions.net/helloWorld`.
For a more detailed explanation you can take a look at step 8. of the [get started guide](https://firebase.google.com/docs/functions/get-started#deploy-functions-to-a-production-environment).

After deploying, you need to tell Telegram where to send updates to your bot by calling the `setWebhook` method.
To do this, open a new browser tab and visit this URL:

```text:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<REGION>.<MY_PROJECT>.cloudfunctions.net/helloworld
```

Replace `<BOT_TOKEN>` with your actual bot token, `<REGION>` with the name of the region where you deployed your function, and `<MY_PROJECT>` with the name of your Firebase project.
The Firebase CLI should provide you with the full URL of your cloud function, so you can simply paste it after the `?url=` parameter in the `setWebhook` method.

If everything is set up correctly, you should see this response in your browser window:

```json:no-line-numbers
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

That's it!
Your bot is ready to go.
Head over to Telegram and watch it respond to messages!
