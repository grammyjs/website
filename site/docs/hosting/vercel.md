# Hosting: Vercel Serverless Functions

This tutorial will guide you how to deploy a Telegram bot to [Vercel](https://vercel.com/) by using [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions). We also assume that you have a Vercel account already.

## Project Structure

The only requisite you need to add to your project in order to use **Vercel Serverless Functions** is to create your bot code within an `api/` folder just like the example of below. You can check [the official Vercel documentation](https://vercel.com/docs/concepts/functions/serverless-functions#deploying-serverless-functions) for more info.

```asciiart:no-line-numbers
.
├── node_modules/
├── build/
├── api/
│   └── bot.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

If you are using _TypeScript_ you probably want to add `@vercel/node` but it is not mandatory to follow this guide. Anyway, feel free to install it by typing `npm i -D @vercel/node`.

## Vercel.json file

The next step is to create a `vercel.json` file **at the root** of your project. The content of that file is the following for this example:

```json
{
  "functions": {
    "api/bot.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

> The free version of vercel has restrictions on quotas, which we need to enable in the configuration file vercel.json. [grammY examples repo](https://github.com/grammyjs/examples/blob/main/vercel-bot/api/index.ts).

If you want more information about the commands that you can add to that file, [check the official documentation](https://vercel.com/docs/project-configuration).

## Tsconfig.json file

In this case, in `tsconfig.json` we can define our _output directory_, for this case is **build** as well as our root directory is **api**. This is important because we will have to add it in the Vercel deploy options.

```json
{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "rootDir": "./api",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "outDir": "./build",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

## Our bot.ts or bot.js file

Regardless if we are using TypeScript or JavaScript, we should have a file through which our bot runs. The only thing we have to add at the end of it is this line:

```ts
import { Bot, webhookCallback } from "grammy";

const bot = new Bot(""); // <-- put your authentication token between the ""

export default webhookCallback(bot, "http"); // <-- This line will do the trick!
```

## Go to Vercel website

Assuming you have a Vercel account and have your GitHub account connected to Vercel, add a new project and select your GitHub bot repository. In the _Build & Development Settings_:

- Output directory: `build`
- Install command: `npm install`

Don't forget to add **environment variables** such as your **bot token**. Once you have done, deploy it!

## Setting up the Telegram webhook

Your bot is ready. The last step is to add the webhook that connects your deployment with Telegram and yout bot token. Here is the command you need to run in your browser:

`https://api.telegram.org/bot{bot-key}/setWebhook?url={host-url}`

The _host url_ is a little tricky, because you need to use your **Vercel app domain following with the route to the bot code**, for example `https://appname.vercel.app/api/bot`. Where `bot` is your `bot.ts` or `bot.js` file.

If everything is ok you should now see this in your browser window.

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

Other useful commands are:

- Info about webhook: `https://api.telegram.org/bot{bot-key}/getWebhookInfo`
- Delete webhook: `https://api.telegram.org/bot{bot-key}/deleteWebhook`

Congratulations! your bot is ready. Head over to Telegram and try it!
