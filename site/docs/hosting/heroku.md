# Hosting: Heroku

> We assume that you have the basic knowledge about creating bots using grammY.
> If you are not ready yet, don't hesitate to head over to our friendly [Guide](../guide)! :rocket:

This tutorial will guide you how to deploy a Telegram bot to [Heroku](https://heroku.com/) by using either [webhooks](../guide/deployment-types.md#how-to-use-webhooks) or [long polling](../guide/deployment-types.md#how-to-use-long-polling).
We also assume that you have a Heroku account already.

## Prerequisites

First, install some dependencies:

```bash
# Create a project directory.
mkdir grammy-bot
cd grammy-bot
npm init --y

# Install main dependencies.
npm install grammy express

# Install development dependencies.
npm install -D typescript @types/express @types/node

# Create TypeScript config.
npx tsc --init
```

We will store our TypeScript files inside a folder `src`, and our compiled files in a folder `dist`.
Create the folders in the project's root directory.
Then, inside folder `src`, create a new file named `bot.ts`.
Our folder structure should now look like this:

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

After that, open `tsconfig.json` and change it to use this configuration:

```json{4}
{
  "compilerOptions": {
    "target": "ESNEXT",
    "module": "esnext", // changed from commonjs to esnext
    "lib": ["ES2021"],
    "outDir": "./dist/",
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

Because the `module` option above has been set from `commonjs` to `esnext`, we have to add `"type": "module"` to our `package.json`.
Our `package.json` should now be similar to this:

```json{6}
{
  "name": "grammy-bot",
  "version": "0.0.1",
  "description": "",
  "main": "dist/app.js",
  "type": "module",  // add property of "type": "module"
  "scripts": {
    "dev-build": "tsc"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "grammy": "^1.2.0",
    "express": "^4.17.1"
  },
  "devDependencies": {
    "typescript": "^4.3.5",
    "@types/express": "^4.17.13",
    "@types/node": "^16.3.1"
  },
  "keywords": []
}
```

As mentioned earlier, we have two options for receiving data from Telegram: webhooks and long polling.
You can learn more about the both advantages and then decide which ones is suitable in [these awesome tips](../guide/deployment-types.md)!

## Webhooks

> If you decide to use long polling instead, you can skip this section and jump down to the [section about long polling](#long-polling). :rocket:

In short, unlike long polling, webhook do not run continuously for checking incoming messages from Telegram.
This will reduce server load and save us a lot of [dyno hours](https://devcenter.heroku.com/articles/free-dyno-hours), especially when you are using the free tier. :grin:

Okay, let us continue!
Remember we have created `bot.ts` earlier?
We will not dump all the code there, and leave coding the bot up to you.
Instead, we are going to make `app.ts` our main entry point.
That means every time Telegram (or anyone else) visits our site, `express` decides which part of your server will be responsible for handling the request.
This is useful when you are deploying both website and bot in the same domain.
Also, by splitting codes to different files, it make our code look tidy. :sparkles:

### Express and Its Middleware

Now create `app.ts` inside folder `src` and write this code inside:

```ts
import express from "express";
import { webhookCallback } from "grammy";
import { bot } from "./bot";

const domain = String(process.env.DOMAIN);
const secretPath = String(process.env.BOT_TOKEN);
const app = express();

app.use(express.json());
app.use(`/${secretPath}`, webhookCallback(bot, "express"));

app.listen(Number(process.env.PORT), async () => {
  // Make sure it is `https` not `http`!
  await bot.api.setWebhook(`https://${domain}/${secretPath}`);
});
```

Let's take a look at our code above:

- `process.env`: Remember, NEVER store credentials in our code!
  For creating [environment variables](https://www.freecodecamp.org/news/using-environment-variables-the-right-way/) in Heroku, head over to [this guide](https://devcenter.heroku.com/articles/config-vars).
- `secretPath`: It could be our `BOT_TOKEN` or any random string.
  It is best practice to hide our bot path as [explained by Telegram](https://core.telegram.org/bots/api#setwebhook).

::: tip ⚡ Optimization (optional)
`bot.api.setWebhook` at line 14 will always run when Heroku starts your server again.
For low traffic bots, this will be for every request.
However, we do not need this code to run every time a request is coming.
Therefore, we can delete this part completely, and execute the `GET` only once manually.
Open this link on your web browser after deploying our bot:

```asciiart:no-line-numbers
https://api.telegram.org/bot<bot_token>/setWebhook?url=<webhook_url>
```

Note that some browsers require you to manually [encode](https://en.wikipedia.org/wiki/Percent-encoding#Reserved_characters) the `webhook_url` before passing it.
For instance, if we have bot token `abcd:1234` and URL `https://grammybot.herokuapp.com/secret_path`, then our link should look like this:

```asciiart:no-line-numbers
https://api.telegram.org/botabcd:1234/setWebhook?url=https%3A%2F%2Fgrammybot.herokuapp.com%2Fsecret_path
```

:::

::: tip ⚡ Optimization (optional)
Use [Webhook Reply](../guide/deployment-types.md#webhook-reply) for more efficiency.
:::

### Creating `bot.ts`

Next step, head over to `bot.ts`:

```ts
import { Bot } from "grammy";

if (process.env.BOT_TOKEN == null) throw Error("BOT_TOKEN is missing.");
export const bot = new Bot(`${process.env.BOT_TOKEN}`);

bot.command("start", (ctx) => ctx.reply("Hello there!"));
bot.on("message", (ctx) => ctx.reply("Got another message!"));
```

Good!
We have now finished coding our main files.
But before we go to the deployment steps, we can optimize our bot a little bit.
As usual, this is optional.

::: tip ⚡ Optimization (optional)
Every time your server starts up, grammY will request [information about the bot](https://core.telegram.org/bots/api#getme) from Telegram in order to provide it on the [context object](../guide/context.md) under `ctx.me`.
We can set the [bot information](/ref/core/BotConfig.md#botInfo) to prevent excessive `getMe` calls.

1. Open this link `https://api.telegram.org/bot<bot_token>/getMe` in your favorite web browser. [Firefox](https://www.mozilla.org/en-US/firefox/) is recommended since it displays `json` format nicely.
2. Change our code at line 4 above and fill the value according to the results from `getMe`:

```ts
export const bot = new Bot(`${process.env.BOT_TOKEN}`, {
  botInfo: {
    id: 111111111,
    is_bot: true,
    first_name: "xxxxxxxxx",
    username: "xxxxxxbot",
    can_join_groups: true,
    can_read_all_group_messages: false,
    supports_inline_queries: false,
  },
});
```

:::

Cool!
It's time to prepare our deployment environment!
Straight to [Deployment Section](#deployment) everyone! :muscle:

## Long Polling

::: warning Your Script Will Run Continuously When Using Long Polling
Unless you know how to handle this behavior, make sure you have enough [dyno hours](https://devcenter.heroku.com/articles/free-dyno-hours).
:::

> Consider using webhooks?
> Jump up to the [webhooks section](#webhooks). :rocket:

Using long polling on your server is not always a bad idea.
Sometimes, it is suitable for data gathering bots that don't need to respond quickly and handle lots of data.
If you want to do this once an hour, you can do that easily.
That's something you cannot control with webhooks.
If your bot gets flooded with messages, you will see a lot of webhooks requests, however, you can more easily limit the rate of updates to process with long polling.

### Creating `bot.ts`

Let's open the `bot.ts` file that we have created earlier.
Have it contain these lines of code:

```ts
import { Bot } from "grammy";

if (process.env.BOT_TOKEN == null) throw new Error("BOT_TOKEN is missing.");
const bot = new Bot(process.env.BOT_TOKEN);

bot.command(
  "start",
  (ctx) => ctx.reply("I'm running on Heroku using long polling!"),
);

bot.start();
```

That's it!
We are ready to deploy it.
Pretty simple, right? :smiley:
If you think it is too easy, check out our [Deployment Checklist](../advanced/deployment.md#long-polling)! :rocket:

## Deployment

Nope… our _Rocket Bot_ is not ready to launch yet.
Complete these stages first!

### Compile Files

Run this code in your terminal to compile the TypeScript files to JavaScript:

```bash
npx tsc
```

If it runs successfully and does not print any errors, our compiled files should be in the `dist` folder with `.js` extensions.

### Set up `Procfile`

For the time being, `Heroku` has several [types of dynos](https://devcenter.heroku.com/articles/free-dyno-hours).
Two of them are:

- **Web dynos**:
  <br> _Web dynos_ are dynos of the "web" process that receive HTTP traffic from routers.
  This kind of dyno has a timeout of 30 seconds for executing code.
  Also, it will sleep if there is no request to handle within a 30 minutes period.
  This type of dyno is quite suitable for _webhooks_.

- **Worker dynos**:
  <br> _Worker dynos_ are typically used for background jobs.
  It does NOT have a timeout, and will NOT sleep if it does not handle any web requests.
  It fits _long polling_.

Create file named `Procfile` without a file extension in the root directory of our project.
For example, `Procfile.txt` and `procfile` are not valid.
Then write this single line code format:

```
<dynos type>: <command for executing our main entry file>
```

For our case it should be:

<CodeGroup>
<CodeGroupItem title="Webhook" active>

```
web: node dist/app.js
```

</CodeGroupItem>
<CodeGroupItem title="Long Polling">

```
worker: node dist/bot.js
```

</CodeGroupItem>
</CodeGroup>

### Set up Git

We are going to deploy our bot using [Git and Heroku Cli](https://devcenter.heroku.com/articles/git).
Here is the link for the installation:

- [Git installation instructions](https://git-scm.com/download/)
- [Heroku CLI installation instructions](https://devcenter.heroku.com/articles/heroku-cli#download-and-install)

Assuming that you already have them in your machine, and you have a terminal open in the root of our project's directory.
Now initialize a local git repository by running this code in your terminal:

```bash
git init
```

Next, we need to prevent unnecessary files from reaching our production server, in this case `Heroku`.
Create a file named `.gitignore` in root of our project's directory.
Then add this list:

```
node_modules/
src/
tsconfig.json
```

Our final folder structure should now look like this:

<CodeGroup>
<CodeGroupItem title="Webhook" active>

```asciiart:no-line-numbers
.
├── .git/
├── node_modules/
├── dist/
│   ├── bot.js
│   └── app.js
├── src/
│   ├── bot.ts
│   └── app.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── Procfile
└── .gitignore
```

</CodeGroupItem>
  <CodeGroupItem title="Long Polling">

```asciiart:no-line-numbers
.
├── .git/
├── node_modules/
├── dist/
│   └── bot.js
├── src/
│   └── bot.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── Procfile
└── .gitignore
```

</CodeGroupItem>
</CodeGroup>

Commit files to our git repository:

```bash
git add .
git commit -m "My first commit"
```

### Set Up a Heroku Remote

If you have already created [Heroku app](https://dashboard.heroku.com/apps/), pass your `Existing app`'s name in `<myApp>` below, then run the code.
Otherwise, run `New app`.

<CodeGroup>
  <CodeGroupItem title="New app" active>

```bash
heroku create
git remote -v
```

</CodeGroupItem>
  <CodeGroupItem title="Existing app" active>

```bash
heroku git:remote -a <myApp>
```

</CodeGroupItem>
</CodeGroup>

### Deploying Code

Finally, press the _red button_ and liftoff! :rocket:

```bash
git push heroku main
```

If it doesn't work, it's probably our git branch is not `main` but `master`.
Press this _blue button_ instead:

```bash
git push heroku master
```
