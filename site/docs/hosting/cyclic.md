---
prev: false
next: false
---

# Hosting: Cyclic

This guide tells you how you can host your grammY bots on [Cyclic](https://cyclic.sh).

## Prerequisites

To follow along, you need to have a [Github](https://github.com) and [Cyclic](https://cyclic.sh) account.
First, initialize your project and install some dependencies:

```sh
# Initialize the project.
mkdir grammy-bot
cd grammy-bot
npm init -y

# Install main dependencies.
npm install grammy express dotenv

# Install development dependencies.
npm install -D typescript ts-node nodemon @types/express @types/node

# Initialize TypeScript config.
npx tsc --init
```

We will store our TypeScript files inside `src/`, and our compiled files in `dist/`.
After creating both of them, cd into `src/`, and create a file named `bot.ts`.
Your project's root directory should now look like this:

```asciiart:no-line-numbers
.
├── node_modules/
├── dist/
├── src/
│   └── bot.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

Then, open `tsconfig.json`, and rewrite its contents to use this configuration:

```json
{
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "./src",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true
  }
}
```

And then we have to add `start`, `build` and `dev` scripts to our `package.json`.
Our `package.json` should now be similar to this:

```json{6}
{
  "name": "grammy-bot",
  "version": "1.0.0",
  "description": "",
  "main": "dist/bot.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/bot.js",
    "dev": "nodemon src/bot.ts"
  },
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "grammy": "^1.17.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.4.9",
    "typescript": "^5.1.6"
    "nodemon": "^3.0.1",
    "ts-node": "^10.9.1"
  },
  "keywords": []
}
```

### Webhooks

Open `src/bots.ts` write the following contents to it:

```ts{10}
import express from "express";
import { Bot, webhookCallback } from "grammy";
import "dotenv/config";

const bot = new Bot(process.env.BOT_TOKEN || "");

bot.command("start", (ctx) => ctx.reply("Hello World!"))

if (process.env.NODE_ENV === "DEVELOPMENT") {
  bot.start();
} else {
  const port = process.env.PORT || 3000;
  const app = express();
  app.use(express.json());
  app.use(`/${bot.token}`, webhookCallback(bot, "express"));
  app.listen(port, () => console.log(`listening on port ${port}`));
}
```

We recommend that you have your webhook handler on a secret path rather than `/`.
As shown in the highlighted line above, we are using the `/<bot-token>` instead of `/`.

### Local Development

Create a `.env` file at the root of your project with the following contents:

```
BOT_TOKEN=<bot-token>
NODE_ENV=DEVELOPMENT
```

After that, run your `dev` script:

```shell
npm run dev
```

Nodemon will watch your `bot.ts` file and restart your bot on every code change.

## Deploying

1. Create a repository on GitHub, it can be either private or public.
2. Push your code.

> It is recommended that you have a single stable branch and you do your testing in separate branches, so that you won't land unexpected behaviors to production.

1. Visit your [Cyclic dashboard](https://app.cyclic.sh).
2. Click "Link Your Own" and select your repository.
3. Go to Advanced > Variables and add your `BOT_TOKEN`.
4. Deploy your bot with "Connect Cyclic".

### Setting the Webhook URL

If you are using webhooks, after your first deployment, you should configure your bot's webhook settings to point to your app.
To do that, send a request to

```text
https://api.telegram.org/bot<token>/setWebhook?url=<url>/<token>
```

replacing `<token>` with your bot token, and `<url>` with the full URL of your app along with the path to the webhook handler.

Congratulations!
Your bot should now be up and running.
