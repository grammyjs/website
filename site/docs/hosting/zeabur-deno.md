---
prev: false
next: false
---

# Hosting: Zeabur (Deno)

[Zeabur](https://zeabur.com) is a platform that allows you to deploy your full-stack applications with ease. It supports various programming languages and frameworks, including Deno and grammY.

This tutorial will guide you how to deploy your grammY bots with Deno to [Zeabur](https://zeabur.com/).

::: tip Looking for the Node.js Version?
This tutorial explains how to deploy a Telegram bot to Zeabur using Deno.
If you're looking for the Node.js version, please check out [this tutorial](./zeabur-nodejs) instead.
:::

## Prerequisites

To follow along, you need to have a [Github](https://github.com) and [Zeabur](https://zeabur.com/) account.

### Method 1: Create a New Project From Scratch

> Make sure you have Deno installed on your local machine. 

Initialize your project and install some necessary dependencies:

```sh
# Initialize the project.
mkdir grammy-bot
cd grammy-bot

# Create main.ts file
touch main.ts

# Create deno.json file to generate lock file
touch deno.json
```

Then modify `main.ts` file with the following code:

```typescript
import { Bot } from "https://deno.land/x/grammy@v1.23.0/mod.ts";

const bot = new Bot("your telegram bot token"); 

bot.command("start", (ctx) => ctx.reply("Hello from Deno & grammY!"));

bot.on("message", (ctx) => ctx.reply("How can I help you?"));

bot.start();
```

> Note: Replace `your_telegram_bot_token` with your bot's token from the BotFather.

Then run the following command to start your bot:

```sh
deno run --allow-net main.ts
```

Deno will automatically download the dependencies, generate the lock file and start your bot.

### Method 2: Use Zeabur's Template

Zeabur has already provided a template for you to use.
You can find it [here](https://github.com/zeabur/deno-telegram-bot-starter).

You can just use the template and start writing your bot's code.

## Deploying

### Method 1: Deploy From GitHub in Zeabur's Dashboard

1. Create a repository on GitHub, it can be public or private and push your code to it.
2. Go to [Zeabur dashboard](https://dash.zeabur.com).
3. Click on the `New Project` button, and click on the `Deploy New Service` button, choose `GitHub` as the source and select your repository.
4. Your service will be deployed automatically.

### Method 2: Deploy With Zeabur CLI

`cd` into your project directory and run the following command:

```sh
npx @zeabur/cli deploy
```

Follow the instructions to select a region to deploy, and your bot will be deployed automatically.