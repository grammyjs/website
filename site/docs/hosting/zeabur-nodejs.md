---
prev: false
next: false
---

# Hosting: Zeabur (Node.js)

[Zeabur](https://zeabur.com) is a platform that allows you to deploy your full-stack applications with ease. It supports various programming languages and frameworks, including Node.js and grammY.

This tutorial will guide you how to deploy your grammY bots with Node.js to [Zeabur](https://zeabur.com/).

::: tip Looking for the Deno Version?
This tutorial explains how to deploy a Telegram bot to Zeabur using Node.js.
If you're looking for the Deno version, please check out [this tutorial](./zeabur-deno) instead.
:::


## Prerequisites

To follow along, you need to have [Github](https://github.com) and [Zeabur](https://zeabur.com/) accounts.

### Method 1: Create a New Project From Scratch

Initialize your project and install some necessary dependencies:

```sh
# Initialize the project.
mkdir grammy-bot
cd grammy-bot
pnpm init -y

# Install main dependencies.
pnpm install grammy

# Install development dependencies.
pnpm install -D nodemon
```

Then, cd into `src/`, and create a file named `bot.js`. 
It is where you will write your bot's code.

Now, you can start writing your bot's code in `src/bot.js`.

```js
import { Bot } from "grammy";

const bot = new Bot(
  process.env.TELEGRAM_BOT_TOKEN || "your_telegram_bot_token",
);

bot.on("message:text", async (ctx) => {
  console.log("Message: ", ctx.message.text);
  
  const response = "Hello, I'm a bot!";

  ctx.reply(response);
});

bot.start();
```

> Note: Get your bot token with [@BotFather](https://t.me/BotFather) on Telegram, and set is as an environment variable `TELEGRAM_BOT_TOKEN` in Zeabur. 
> 
> You can check out [this tutorial](https://zeabur.com/docs/deploy/variables) for setting environment variables in Zeabur.

Now your project's root directory should now look like this:

```asciiart:no-line-numbers
.
├── node_modules/
├── src/
│   └── bot.js
├── package.json
├── pnpm-lock.yaml
```

And then we have to add `start` and `dev` scripts to our `package.json`.
Our `package.json` should now be similar to this:

```json{7-10}
{
  "name": "grammy-telegram-bot-starter",
  "type": "module",
  "version": "1.0.0",
  "description": "Telegram Bot Starter with JavaScript and Grammy",
  "main": "index.js",
  "scripts": {
    "dev": "nodemon src/bot.js",
    "start": "node src/bot.js"
  },
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "grammy": "^1.21.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

Now, you can run your bot locally by running:

```sh
pnpm run dev
```

### Method 2: Use Zeabur's Template

Zeabur has already provided a template for you to use.
You can find it [here](https://github.com/zeabur/telegram-bot-starter).

You can just use the template and start writing your bot's code.

## Deploying

### Method 1: Deploy From GitHub in Zeabur's Dashboard

1. Create a repository on GitHub, it can be public or private and push your code to it.
2. Go to [Zeabur dashboard](https://dash.zeabur.com).
3. Click on the `New Project` button, and click on the `Deploy New Service` button, choose `GitHub` as the source and select your repository.
4. Go to Variables tab to add your environment variables like `BOT_TOKEN`.
5. Your service will be deployed automatically.

### Method 2: Deploy With Zeabur CLI

`cd` into your project directory and run the following command:

```sh
npx @zeabur/cli deploy
```

Follow the instructions to select a region to deploy, and your bot will be deployed automatically.


