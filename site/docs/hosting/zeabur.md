---
prev: false
next: false
---

# Hosting: Zeabur

This tutorial will guide you how to deploy your grammY bots to [Zeabur](https://zeabur.com/).

## Prerequisites

To follow along, you need to have a [Github](https://github.com) and [Zeabur](https://zeabur.com/) account.

### Method 1: Create a New Project from Scratch

Initialize your project and install some necessary dependencies:

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

Then, cd into `src/`, and create a file named `bot.ts`. 
It is where you will write your bot's code.

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
    "rootDir": "src",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true
  }
}
```

And then we have to add `start`, `build` and `dev` scripts to our `package.json`.
Our `package.json` should now be similar to this:

```json{6-10}
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
    "typescript": "^5.1.6",
    "nodemon": "^3.0.1",
    "ts-node": "^10.9.1"
  },
  "keywords": []
}
```

### Method 2: Use Zeabur's Template

Zeabur has already provided a template for you to use.
You can find it [here](https://github.com/zeabur/telegram-bot-starter).

You can just use the template and start writing your bot's code.

## Deploying

### Method 1: Deploy from GitHub in Zeabur's Dashboard

1. Create a repository on GitHub, it can be public or private and push your code to it.
2. Go to [Zeabur dashboard](https://dash.zeabur.com).
3. Click on the `New Project` button, and click on the `Deploy New Service` button, choose `GitHub` as the source and select your repository.
4. Go to Variables tab to add your environment variables like `BOT_TOKEN`.
5. Your service will be deployed automatically.

### Method 2: Deploy with Zeabur CLI

cd into your project directory and run the following command:

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
