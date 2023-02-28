# Hosting: Firebase Functions

This tutorial will guide you through the process of deploying your bot to [Firebase](https://firebase.google.com) using [Firebase Serverless Functions](https://firebase.google.com/docs/functions).

## Prerequisites

To follow this tutorial, you will need a Google account.
If you don't have one, you can [create one here](https://accounts.google.com/signup).

## Setup

This section will guide you through the setup process.
If you need a more detailed explanation of each step, you can refer to the [official Firebase documentation](https://firebase.google.com/docs/functions/get-started).

### 1. Create A Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **Add Project**.
2. If prompted, review and accept the Firebase terms.
3. Click **Continue**.
4. Uncheck the analytics.
5. Click **Create Project**.

### 2. Setup Node.js and Firebase CLI

To write functions and deploy them to the Cloud Functions runtime, you'll need to set up a Node.js environment and install the Firebase CLI.

> It's important to note that only Node.js versions 14, 16, and 18 are currently supported by Firebase Functions.
> For more information on Node.js version support, please refer to [Set Node.js version](https://firebase.google.com/docs/functions/manage-functions#set_nodejs_version) section in their docs.
```

Once you have Node.js and npm installed, install the Firebase CLI via your preferred method. To install the CLI via npm, use:

```shell
npm install -g firebase-tools
```

### 3. Initialize The Project

1. Run `firebase login` to log in via the browser and authenticate the Firebase CLI.
2. Go to your Firebase project directory.
3. Run `firebase init functions`, and type `y` when asked, whether you want to initialize a new codebase
4. Choose `use existing project` and select the project you created in Step 1.
5. The CLI gives you two options for language support:
   - JavaScript
   - TypeScript

   For this tutorial, select TypeScript.

6. Optionally you can select ESLint
7. The CLI asks you if you want to install the dependencies with npm.
   If you use another package manager like `yarn` or `pnpm` you can decline.
   In that case you have to cd into the `functions` directory and install the dependencies manually.
8. open `./functions/package.json` and look for the key: `"engines": {"node": "16"}`.
   The node version should match your installed version of node.
   Otherwise the project might not run.

## Preparing Your Code

You can use this short example bot as a starting point:

```ts
import * as functions from "firebase-functions";
import {webhookCallback, Bot} from "grammy";

const bot = new Bot(<BOT_TOKEN>);

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
bot.command("ping", (ctx) => ctx.reply(`Pong! ${new Date()}`));

//you can trigger your function on https://localhost/<firebase-projectname>/us-central1/helloworld during development 
export const helloWorld = functions.https.onRequest(webhookCallback(bot));
```

## Development

During development you can use the firebase emulator suite to run your code locally, which is way faster than deploying every change to firebase.
To install the emulators run:

```shell
firebase init emulators
```

The functions emulator should be select already, if not navigate to it using the arrow keys, and select it using `space`.
You can just hit `enter` for the questions about which port to use for which emulator.

To start the emulators and run :

```shell
npm run serve
```

> For some reason the standard configuration of the npm script does not start the typescript compiler in watch mode, so if you use typescript, you also have to run

> ```shell
> npm run build:watch
> ```

after the emulators started you should find a line in the console output, that looks like this:

```shell
+  functions[us-central1-helloWorld]: http function initialized (http://127.0.0.1:5001/<firebase-projectname>/us-central1/helloWorld).
```

This is the local url of your cloud function.
Right now, your function is only available to the localhost (your computer).
To actually test your bot, you need to expose your function to the internet, so that the Telegram API can send updates to your bot.\
There are several services like [localtunnel](https://localtunnel.me/) or [ngrok](https://ngrok.com/) that can help you with that.
Let's go with localtunnel, because it does not shut down after an hour, if you don't give them money like ngrok does.
First let's install localtunnel:

```shell
npm i -g localtunnel
```

After that we can expose the port `5001` to the internet:

```shell
lt --port 5001
```

The local tunnel should give you a unique url like `https://modern-heads-sink-80-132-166-120.loca.lt`

All that's left to do is to tell Telegram where to send the updates.
You can do this by calling setWebhook.
For example, open a new tab in your browser and visit this URL:

```text:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://modern-heads-sink-80-132-166-120.loca.lt/hotsouceservice/us-central1/deleteImage
```

Replace <BOT_TOKEN> with your real bot token, and the `.loca.lt` url with you own url you got from localtunnel.

You should now see this in your browser window.

```json:no-line-numbers
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

Done! Your bot is working now.
Head over to Telegram and watch it respond to messages!

## Deploying

You can follow Step 8. of the [get started guide](https://firebase.google.com/docs/functions/get-started#deploy-functions-to-a-production-environment)

Your firebase function is now working.
All that's left to do is to tell Telegram where to send the updates.
You can do this by calling setWebhook.
For example, open a new tab in your browser and visit this URL:

```text:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<REGION>.<MY_PROJECT>.cloudfunctions.net/helloworld
```

Replace <BOT_TOKEN> with your actual bot token, <REGION> with the name of the region where you deployed your function, and <MY_PROJECT> with the name of your Firebase project.
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
