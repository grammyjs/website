# Hosting: Firebase Functions

This tutorial will guide you on how to deploy your bot to [firebase](https://firebase.google.com/) by using [Firebase Serverless Functions](https://firebase.google.com/docs/functions).

## Prerequisites

1. Google account (you can [create one here](https://accounts.google.com/signup)).

## Setup

1. [Create a firebase projet](https://firebase.google.com/docs/functions/get-started#create-a-firebase-project)
2. [Install firebase cli](https://firebase.google.com/docs/functions/get-started#set-up-node.js-and-the-firebase-cli)
3. [Initialize the project](https://firebase.google.com/docs/functions/get-started#initialize-your-project). You don't have to run step 3. in their docs (`firebase init firestore`). Thats for the their database.
4. [set up the firebase emulator](https://firebase.google.com/docs/functions/get-started#emulate-execution-of-your-functions) to run your cloud function locally.

## Preparing Your Code

You can use this short example bot as a starting point

```ts
import * as functions from "firebase-functions";
import {webhookCallback, Bot} from "grammy";

const bot = new Bot(<BOT_TOKEN>);

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
bot.command("ping", (ctx) => ctx.reply(`Pong! ${new Date()}`));

//you can trigger your function on https://<domain>/<firebase-projectname>/helloworld
export const helloWorld = functions.https.onRequest(webhookCallback(bot))
```

## Deploying

You can follow Step 8. of the [get started guide](https://firebase.google.com/docs/functions/get-started#deploy-functions-to-a-production-environment)

Your firebase function is now working. All that's left to do is to tell Telegram where to send the updates. You can do this by calling setWebhook. For example, open a new tab in your browser and visit this URL:

`https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<REGION>.<MY_PROJECT>.cloudfunctions.net/helloworld`

Replace <BOT_TOKEN> with your real bot token. Replace <REGION> with the name of the region you chose to deploy your function to. Replace <PROJECT_NAME> with the name of your firebase project.\
The firebase CLI should give you the whole URL to your cloud function, so you can just paste it after the `?url=`

You should now see this in your browser window.

{ "ok": true, "result": true, "description": "Webhook was set" }
Done! Your bot is working now. Head over to Telegram and watch it respond to messages!
