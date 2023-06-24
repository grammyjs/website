---
prev:
  link: ./introduction
next:
  link: ./basics
---

# Getting Started

Create your first bot in minutes. (Scroll [down](#getting-started-on-deno) for a Deno guide.)

## Getting Started on Node.js

> This guide assumes that you have [Node.js](https://nodejs.org) installed, and `npm` should come with it.
> If you don't know what these things are, check out our [Introduction](./introduction)!

Create a new TypeScript project and install the `grammy` package.
Do this by opening a terminal and typing:

::: code-group

```sh [npm]
# Create a new directory and change into it.
mkdir my-bot
cd my-bot

# Set up TypeScript (skip if you use JavaScript).
npm install -D typescript
npx tsc --init

# Install grammY.
npm install grammy
```

```sh [Yarn]
# Create a new directory and change into it.
mkdir my-bot
cd my-bot

# Set up TypeScript (skip if you use JavaScript).
yarn add typescript -D
npx tsc --init

# Install grammY.
yarn add grammy
```

```sh [pnpm]
# Create a new directory and change into it.
mkdir my-bot
cd my-bot

# Set up TypeScript (skip if you use JavaScript).
pnpm add -D typescript
npx tsc --init

# Install grammY.
pnpm add grammy
```

:::

Create a new empty text file, e.g. called `bot.ts`.
Your folder structure should now look like this:

```asciiart:no-line-numbers
.
├── bot.ts
├── node_modules/
├── package.json
├── package-lock.json
└── tsconfig.json
```

Now, it's time to open Telegram to create a bot account, and obtain a bot token for it.
Talk to [@BotFather](https://t.me/BotFather) to do this.
The bot token looks like `123456:aBcDeF_gHiJkLmNoP-q`.
It is used to authenticate your bot.

Got the token? You can now code your bot in the `bot.ts` file.
You can copy the following example bot into that file, and pass your token to the `Bot` constructor:

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";

// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new Bot(""); // <-- put your bot token between the ""

// You can now register listeners on your bot object `bot`.
// grammY will call the listeners when users send messages to your bot.

// Handle the /start command.
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
// Handle other messages.
bot.on("message", (ctx) => ctx.reply("Got another message!"));

// Now that you specified how to handle messages, you can start your bot.
// This will connect to the Telegram servers and wait for messages.

// Start the bot.
bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");

// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new Bot(""); // <-- put your bot token between the ""

// You can now register listeners on your bot object `bot`.
// grammY will call the listeners when users send messages to your bot.

// Handle the /start command.
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
// Handle other messages.
bot.on("message", (ctx) => ctx.reply("Got another message!"));

// Now that you specified how to handle messages, you can start your bot.
// This will connect to the Telegram servers and wait for messages.

// Start the bot.
bot.start();
```

:::

Compile the code by running

```sh
npx tsc
```

in your terminal.
This generates the JavaScript file `bot.js`.

You can now run the bot by executing

```sh
node bot.js
```

in your terminal.
Done! :tada:

Head over to Telegram to watch your bot respond to messages!

::: tip Enabling Logging
You can enable basic logging by running

```sh
export DEBUG="grammy*"
```

in your terminal before you execute `node bot.js`.
This makes it easier to debug your bot.
:::

## Getting Started on Deno

> This guide assumes that you have [Deno](https://deno.com/runtime) installed.

Create a new directory somewhere and create a new empty text file in it, e.g. called `bot.ts`.

```sh
mkdir ./my-bot
cd ./my-bot
touch bot.ts
```

Now, it's time to open Telegram to create a bot account, and obtain a bot token for it.
Talk to [@BotFather](https://t.me/BotFather) to do this.
The bot token looks like `123456:aBcDeF_gHiJkLmNoP-q`.
It is used to authenticate your bot.

Got the token? You can now code your bot in the `bot.ts` file.
You can copy the following example bot into that file, and pass your token to the `Bot` constructor:

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new Bot(""); // <-- put your bot token between the ""

// You can now register listeners on your bot object `bot`.
// grammY will call the listeners when users send messages to your bot.

// Handle the /start command.
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
// Handle other messages.
bot.on("message", (ctx) => ctx.reply("Got another message!"));

// Now that you specified how to handle messages, you can start your bot.
// This will connect to the Telegram servers and wait for messages.

// Start the bot.
bot.start();
```

You can now run the bot by executing

```sh
deno run --allow-net bot.ts
```

in your terminal.
Done! :tada:

Head over to Telegram to watch your bot respond to messages!

::: tip Enabling Logging
You can enable basic logging by running

```sh
export DEBUG="grammy*"
```

in your terminal before you run your bot.
This makes it easier to debug your bot.

You now need to run the bot using

```sh
deno run --allow-net --allow-env bot.ts
```

so grammY can detect that `DEBUG` is set.
:::
