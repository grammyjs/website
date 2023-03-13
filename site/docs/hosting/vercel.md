# Hosting: Vercel Serverless Functions

This tutorial will guide you on how to deploy your bot to [Vercel](https://vercel.com/) by using [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions), assuming that you already have a [Vercel](https://vercel.com) account.

## Project Structure

The only prerequisite to get started with **Vercel Serverless Functions** is to move your code to the `api/` directory as shown below.
You can also see [Vercel's documentation](https://vercel.com/docs/concepts/functions/serverless-functions#deploying-serverless-functions) for more on this.

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

If you are using TypeScript, you might as well want to install `@vercel/node` as a dev dependency, but it is not mandatory for following this guide.

## Configuring Vercel

The next step is to create a `vercel.json` file at the top level of your project.
For our example structure, its content would be:

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

> If you want to use Vercel's free subscription, your `memory` and `maxDuration` configurations might look like above to not bypass its limits.

If you want to learn more about the `vercel.json` configuration file, see [its documentation](https://vercel.com/docs/project-configuration).

## Configuring TypeScript

In our `tsconfig.json`, we have to specify our output directory as `build/`, and our root directory as `api/`.
This is important since we will specify them in Vercel's deploy options.

```json{5,8}
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

Regardless of using TypeScript or JavaScript, we should have a source file through which our bot runs.
It should look roughly like this:

```ts
import { Bot, webhookCallback } from "grammy";

// Here, we take the bot token from the environment variable "BOT_TOKEN".
const bot = new Bot(process.env.BOT_TOKEN ?? "");

export default webhookCallback(bot, "http");
```

## In Vercel's Dashboard

Assuming that you already have a Vercel account your GitHub is connected to, add a new project and select your bot's repository.
In _Build & Development Settings_:

- Output directory: `build`
- Install command: `npm install`

Don't forget to add the secrets such as your bot token as environment variables in the settings.
Once you have done that, you can deploy it!

## Setting the Webhook

The last step is to connect your Vercel app with Telegram.
Modify the below URL to your credentials and visit it from your browser:

```md:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=<HOST_URL>
```

The `HOST_URL` is a little tricky, because you need to use your **Vercel app domain following with the route to the bot code**, for example `https://appname.vercel.app/api/bot`.
Where `bot` is referring to your `bot.ts` or `bot.js` file.

You should then see a response like this:

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

Congratulations!
Your bot should now be up and running.
