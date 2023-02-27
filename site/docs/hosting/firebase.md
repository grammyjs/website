# Hosting: Firebase Functions

This tutorial will guide you on how to deploy your bot to [firebase](https://firebase.google.com/) by using [Firebase Serverless Functions](https://firebase.google.com/docs/functions).

## Prerequisites

1. Google account (you can [create one here](https://accounts.google.com/signup)).

## Setup

1. [Create a firebase project](https://firebase.google.com/docs/functions/get-started#create-a-firebase-project)
2. [Install firebase cli](https://firebase.google.com/docs/functions/get-started#set-up-node.js-and-the-firebase-cli)
3. [Initialize the project](https://firebase.google.com/docs/functions/get-started#initialize-your-project). You don't have to run step 3. in their docs (`firebase init firestore`). Thats for the their database.
4. [set up the firebase emulator](https://firebase.google.com/docs/functions/get-started#emulate-execution-of-your-functions) to run your cloud function locally.

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
Right now, your function is only availability to the localhost (your computer).
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

Replace <BOT_TOKEN> with your real bot token.
Replace <REGION> with the name of the region you chose to deploy your function to. Replace <PROJECT_NAME> with the name of your firebase project.
The firebase CLI should give you the whole URL to your cloud function, so you can just paste it after the `?url=`

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
