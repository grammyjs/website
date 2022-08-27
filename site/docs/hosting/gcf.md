# Hosting: Cloud Functions for Firebase

This guide tells you how to host your grammY bots on [Cloud Functions for Firebase](https://firebase.google.com/docs/functions).
It will assume that you will be using grammY [sessions](https://grammy.dev/plugins/session.html), which is required for [conversations](https://grammy.dev/plugins/conversations.html).
	  
Note: Cloud Functions is not compatible with Deno, but supports Node versions 10, 12, 14, and 16 as well as Typescript.

## Setup
You will need:
- A Google account
- A payment card for the [Blaze plan](https://firebase.google.com/pricing), on which you can immediately set a spending cap (you will pay nothing until your usage exceeds the plan's generous free allowance)
- npm
- Node.js  
- Typescript

1. Create a new Firebase project `grammy-bot` from the [Firebase console](https://console.firebase.google.com/u/0/)
2. Install `firebase-functions` and `firebase-tools`
``` sh
npm install firebase-functions@latest firebase-admin@latest --save
npm install -g firebase-tools
```
3. Run `firebase login`  to log in via the browser and authenticate the firebase tool
4. Go to your Firebase project directory
5. Run `firebase init firestore`
6. Run `firebase init functions`, install dependencies, and select `Typescript` language support
7. Go to your `functions` directory
8. `npm install firebase-admin` and `npm install @grammyjs/storage-firestore`

## Preparing your code
``` ts
// grammy-bot/functions/src/index.ts
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { Bot, webhookCallback, session } from 'grammy';
import { adapter } from "@grammyjs/storage-firestore";
		  
		  initializeApp();
		  
		  const db = getFirestore();
		  
		  db.settings({
		  	ignoreUndefinedProperties: true
		  }); 
		  
		  const webhook = functions
		  	.runWith({
		  		secrets: [
		  			'BOT_TOKEN' // Access with process.env. Set through CLI before deployment.
		  		]
		  	})
		  	.region('europe-west1') // omit if you wish to use your project's default region
		  	.https.onRequest(async (req, res) => {
		        const bot = new Bot<MyContext>(process.env.TELEGRAM_TOKEN ?? '', {
              client: {
                canUseWebhookReply: (method) => method === 'sendChatAction'
              }
		  		  });
		    });
	```
