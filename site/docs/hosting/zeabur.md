---
prev: false
next: false
---

# Hosting: Zeabur

This tutorial will guide you how to deploy your grammY bots to [Zeabur](https://zeabur.com/).

## Prerequisites

To follow along, you need to have a [Github](https://github.com) and [Zeabur](https://zeabur.com/) account.

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

Your project's root directory should now look like this:

```asciiart:no-line-numbers
.
├── node_modules/
├── dist/
├── src/
│   └── bot.js
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

And then we have to add `start`, `build` and `dev` scripts to our `package.json`.
Our `package.json` should now be similar to this:

```json{6-10}
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

### Setting the Webhook URL

If you are using webhooks, after your first deployment, you should configure your bot's webhook settings to point to your app.
To do that, send a request to

```text
https://api.telegram.org/bot<token>/setWebhook?url=<url>/<token>
```

replacing `<token>` with your bot token, and `<url>` with the full URL of your app along with the path to the webhook handler.

Congratulations!
Your bot should now be up and running.
