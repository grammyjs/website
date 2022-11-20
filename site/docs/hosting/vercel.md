# Hosting: Vercel Serverless Functions

This tutorial will guide you on how to deploy your bot to [Vercel](https://vercel.com/) by using [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions), assuming that you already have a [Vercel](https://vercel.com) account.

## Project Structure

The only prerequisite to get started with **Vercel Serverless Functions** is to move your code to the `api/` directory as shown below. You can also see [Vercel's documentation](https://vercel.com/docs/concepts/functions/serverless-functions#deploying-serverless-functions) for more on this.

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

If you are using TypeScript, you might as well want to install `@vercel/node` as a dev dependency, but it is not mandatory to follow this guide.

## Configuring Vercel

The next step is to create a `vercel.json` file at the top level of your project. For our example structure, its content would look be:

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

> Vercel's free subscription has restrictions on quotas, which we need to enable in the configuration file, `vercel.json` ([grammY Examples](https://github.com/grammyjs/examples/blob/main/vercel-bot/api/index.ts)).

If you want to learn more about this configuration file, see [its documentation](https://vercel.com/docs/project-configuration).

## Configuring TypeScript

In our `tsconfig.json` we have to define specify our output directory as `build/`\*, and our root directory is `api/`. This is important since we will specify them in Vercel's deploy options.

```json
{
  "compilerOptions": {
    "target": "ES2019",
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

## The Main File

Regardless of using TypeScript or JavaScript, we should have a file through which our bot runs that should end like this:

```ts
import { Bot, webhookCallback } from 'grammy';

const bot = new Bot(process.env.BOT_TOKEN); // <-- use an environment variable with dotenv dependency

export default webhookCallback(bot, 'http'); // <-- This line will do the trick!
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
