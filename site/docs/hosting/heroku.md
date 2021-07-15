# Hosting: Heroku

> We assume that you have the basic knowledge about creating bots using grammY.
> If you are not ready yet, don't hestitate to head over to our [Friendly Guide](../guide)! 🚀

This tutorial will guide you how to deploy our telegram bot to [Heroku](https://heroku.com/) by using either [webhooks](../guide/deployment-types.md#webhooks) or [long polling](../guide/deployment-types.md#long-polling) method. We also assumes that you have a Heroku account already. 

## Prerequisite
First, install some dependecies:
```bash
# Create a project directory
mkdir grammy-bot
cd grammy-bot
npm init --y

# install main dependency
npm install grammy express

# Dev dependency
npm install -D typescript @types/express @types/node

# create config for typescript
npx tsc --init
```
We will store our typescript files inside folder `src` and compiled files in folder `dist`. Create the folders in our root directory project. Then inside folder `src`, create new file named `bot.ts`. Our folder structure should now look like this:

```asciiart:no-line-numbers
.
├── node_modules/
├── dist/
├── src/
│    └── bot.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

After that, open `tsconfig.json` and set with these configuration:
```json
{
  "compilerOptions": {
    "target": "ESNEXT", 
    "module": "esnext", 
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
Because the `module` option above has been set from `commonjs` to `esnext`, we have to add `"type": "module"` to our `package.json`. Our `package.json` should now similar to this:
```json
{
  "name": "grammy-bot",
  "version": "0.0.1",
  "description": "",
  "main": "dist/app.js",
  "type": "module",
  "scripts": {
    "dev-build": "tsc",
  },
  "author": "Nama_dimawarkan",
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
As mentioned earlier, we have two options for receiving data from telegram: `webhooks` and `long polling`. You can learn more about the both advantages and then decide which ones is suitable from this [Awesome Tips](../guide/deployment-types.md)!

## Webhook

> If you decide to use `long polling` instead, you can skip this page and head over to [Long Polling section](#long-polling). 🚀

In short, unlike `long polling`, `webhooks` does not run continously for checking incoming message from Telegram. This will reduce server load and save us a lot of [dyno hours](https://devcenter.heroku.com/articles/free-dyno-hours), especially when you are using free tier like me. 😁

Okay, let us continue!
Remember we have created `bot.ts` earlier? We will not dump all of our codes there. Instead, we are going to make `app.ts` as our main entry point. That means everytime telegram or anyone visits our site, the `express` middleware creates a server and decides which script will be run next. This is useful when you are deploying both website and bot in the same domain. Also, by splitting codes to different files, it make our code look tidy. ✨

### Express as middleware
Now create `app.ts` inside folder `src` and write this code inside:
```ts
import express from "express";
import { webhookCallback } from "grammy";
import { bot } from './bot.js';

const domain =  String(process.env.DOMAIN);
const secretPath = String(process.env.BOT_TOKEN);
const app = express();

app.use(express.json());
app.use(`/${secretPath}`, webhookCallback(bot, "express"));

app.listen(Number(process.env.PORT), () => {
  // Make sure it is https not http!
  bot.api.setWebhook(`https://${domain}/${secretPath}`)
});
```
Let's take a look at of our code above:
* `process.env`: Remember, NEVER store credentials in our code! For creating [Environment Variables](https://www.freecodecamp.org/news/using-environment-variables-the-right-way/) in `Heroku`, head over to this [Guide](https://devcenter.heroku.com/articles/config-vars).
* `secretPath`: It could be our `BOT_TOKEN` or any random string. It is best practice to hide our bot path as explained by [Telegram](https://core.telegram.org/bots/api#setwebhook).

Optional configuration. It's __not__ mandatory:
::: tip ⚡ Optimization
1. `bot.api.setWebhook` at `line 14` will always run on every request. We do not need them to run this code everytime request coming. Therefore we can delete this them completely and execute once manually using `GET` method. Open this link on your web browser after deploying our bot: 

```asciiart:no-line-numbers
https://api.telegram.org/bot<bot_token>/setWebhook?url=<webhook_url>
``` 
Make sure to [encode](https://en.wikipedia.org/wiki/Percent-encoding#Reserved_characters) the `webhook_url` before passing it. For instance, if we have bot token `abcd:1234` and url `https://grammybot.herokuapp.com/secret_path`, then our link should look like this:
```asciiart:no-line-numbers
https://api.telegram.org/botabcd:1234/setWebhook?url=https%3A%2F%2Fgrammybot.herokuapp.com%2Fsecret_path
``` 
2. Use [Webhook Reply](./deployment-types.md#webhook-reply) for more efficiency.
:::

### Bot.ts
Next step, head over to `bot.ts`:
```ts
import { Bot } from "grammy";

if (process.env.BOT_TOKEN == null) throw TypeError('BOT_TOKEN is missing.');
export const bot = new Bot(`${process.env.BOT_TOKEN}`);

bot.command('start', (ctx) => ctx.reply('Hello there!'));
bot.on('message', (ctx) => ctx.reply('Got another message!'));
```
Good! We have finished code our main files. But before we go to the deployment steps, we can optimize our bot a little bit. As usual, this is optional.

::: tip ⚡ Optimization
We can set the [bot information](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#BotConfig) to prevent excessive `getMe` calls.
1. Open this link ```https://api.telegram.org/bot<bot_token>/getMe``` in your favorite web browser. [Firefox](https://www.mozilla.org/en-US/firefox/) is recommended since it display `json` format nicely.
2. Change our code at `line 4` above and fill the value according to the results from `getMe`:
```ts
export const bot = new Bot(`${process.env.BOT_TOKEN}`, {
  botInfo: {
    id: 111111111,
    is_bot: true,
    first_name: "xxxxxxxxx",
    username: "xxxxxxbot",
    can_join_groups: true,
    can_read_all_group_messages: false,
    supports_inline_queries: false
  }
});
```
:::
Cool! It's time to prepare our deployment environment! Straight to [Deployment Section](#deployment) everyone! 💪

## Long Polling
::: warning Your script will continuously run when using long polling. 
Unless you know how to handle this behavior, make sure you have enough [dyno hours](https://devcenter.heroku.com/articles/free-dyno-hours). Consider using webhook? head over to [Webhook Section](#webhook). 🚀
:::

Using `long polling` in server is not always a bad idea. Sometimes, it is suitable for data gathering bots that don't need to respond quickly and handling lots of data. If you want to do this once an hour, you can do that easily. That's something you cannot control with `webhooks`. If your bot gets flooded with messages, you will see a lot of `webhook` requests, however you can more easily limit the rate of updates to process with `long polling`.

### Bot.ts
Let's open the `bot.ts` that we have created earlier. Then writes these lines of codes:
```ts
import { Bot } from 'grammy';

if (process.env.BOT_TOKEN == null) throw new TypeError('BOT_TOKEN is missing.');
const bot = new Bot(process.env.BOT_TOKEN);

bot.command('start', (ctx) => ctx.reply("I'm running on Heroku using long polling!"));

bot.start();
```
That's it! We are ready to deploy it. Pretty simple right? 😃
If you think it is too easy, check out our [Deployment Checklist](../advanced/deployment.md#long-polling) 🚀

## Deployment
Nope... Our *Rocket Bot* is not ready to lunch yet. Complete these stages first!

### Compile Files
Run this code in `terminal` for compiling our `Typescript` files to `Javascript`:
```bash
npx tsc
```
If it run successfully, our compiled files should be in `dist` folder with extension `.js`.

### Set up Procfile
For time being, `Heroku` have some [type of dynos](https://devcenter.heroku.com/articles/free-dyno-hours). Two of them are:
  * **Web dynos**: 
    <br>`Web dynos` are dynos of the “web” process that receive `HTTP` traffic from the routers. 
    This kind of dynos have `timeout` for 30 seconds for executing code. Also It will sleep if there is no request to handle in 30 minutes period. This type of dynos is quite suitable for `Webhook`.
  
  * **Worker dynos**: 
    <br>`Worker dynos` are typically used for background jobs. It does NOT have `timeout` and will NOT sleep in 30 minutes period if they do not respond to web requests. It is fit for `Long polling`.

Create file named `Procfile` without a file extension in the root directory of our project. For example, `Procfile.txt` or `procfile` is not valid. 
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
  <CodeGroupItem title="Long Polling" active>

  ```
  worker: node dist/bot.js
  ``` 
  </CodeGroupItem>
</CodeGroup>

### Set up Git
We are going to deploy our bot using [Git and Heroku Cli](https://devcenter.heroku.com/articles/git). Here is the link for the installation: 
* [Git installation instructions](https://git-scm.com/download/) 
* [Heroku CLI installation instructions](https://devcenter.heroku.com/articles/heroku-cli#download-and-install)

Assuming that you already have them in your machine and `terminal` runs in root of our project's directory. Now initialize a local `Git` repository by running this code in `terminal`:
```bash
git init
```
Next, we need to prevent unnecessary files to reach our production server, in this case `Heroku` server. Create file named `.gitignore` in root of our project's directory. Then add these list:
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
  │    └── bot.js
  │    └── app.js
  ├── src/
  │    ├── bot.ts
  │    └── app.ts
  ├── package.json
  ├── package-lock.json
  ├── tsconfig.json
  ├── Procfile
  └── .gitignore
  ```
  </CodeGroupItem>
  <CodeGroupItem title="Long Polling" active>

  ```asciiart:no-line-numbers
  .
  ├── .git/
  ├── node_modules/
  ├── dist/
  │    └── bot.js
  ├── src/
  │    └── bot.ts
  ├── package.json
  ├── package-lock.json
  ├── tsconfig.json
  ├── Procfile
  └── .gitignore
  ```
  </CodeGroupItem>
</CodeGroup>

Commit files to our `Git` repository:
```bash
git add .
git commit -m "My first commit"
```
### Set up a Heroku Remote
If you have already created [Heroku app](https://dashboard.heroku.com/apps/), pass your `Existing app`'s name in `<myApp>` below then run the code. Otherwise, run the `New app`.

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

### Deploying code
Finally, press this *red button* and liftoff! 🚀
``` bash
git push heroku main
```
if it doesn't work, it's probably our `git` branch is not `main` but `master`. Press this *blue button* instead:
```bash
git push heroku master
```
