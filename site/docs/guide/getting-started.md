---
prev: ./introduction.md
next: ./basics.md
---

# Getting started

> This guide assumes that you have [Node.js](https://nodejs.org) installed, and `npm` should come with it.
> If you don't know what these things are, check out our [Introduction](./introduction.md)!

Create a new TypeScript project and install the `grammY` package:

```bash
# Create a new directory
mkdir my-bot
cd my-bot

# Set up TypeScript (skip if you use JavaScript)
npm install -D typescript
npx tsc --init

# Install grammY
npm install grammy
```

Create a new file, e.g. called `bot.ts`.
Your folder structure should now look like this:

```asciiart:no-line-numbers
.
├── bot.ts
├── node_modules/
├── package.json
├── package-lock.json
└── tsconfig.json
```

Now it is time to open Telegram to create a bot and obtain a bot token for it.
Talk to [@BotFather](https://telegram.me/BotFather) to do this.
The bot token looks like `123456:aBcDeF_gHiJkLmNoP-q`.

Got the token? You can now code your bot in the `bot.ts` file.
You can copy the following example bot into that file, and pass your token to the `Bot` constructor:

<CodeGroup>
 <CodeGroupItem title="TS">

```ts
import { Bot } from 'grammy'

// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new Bot('') // <-- put your bot token between the ''

// You can now register listeners on your bot object `bot`.
// grammY will call the listeners when users send messages to your bot.

// React to /start command
bot.command('start', (ctx) => ctx.reply('Welcome! Up and running.'))
// Handle other messages
bot.on('message', (ctx) => ctx.reply('Got another message!'))

// Now that you specified how to handle messages, you can start your bot.
// This will connect to the Telegram servers and wait for messages.

// Start your bot
bot.start()
```

 </CodeGroupItem>
 <CodeGroupItem title="JS">

```js
const { Bot } = require('grammy')

// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new Bot('') // <-- put your bot token between the ''

// You can now register listeners on your bot object `bot`.
// grammY will call the listeners when users send messages to your bot.

// React to /start command
bot.command('start', (ctx) => ctx.reply('Welcome! Up and running.'))
// Handle other messages
bot.on('message', (ctx) => ctx.reply('Got another message!'))

// Now that you specified how to handle messages, you can start your bot.
// This will connect to the Telegram servers and wait for messages.

// Start your bot
bot.start()
```

 </CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot } from 'https://deno.land/x/grammy/mod.ts'

// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new Bot('') // <-- put your bot token between the ''

// You can now register listeners on your bot object `bot`.
// grammY will call the listeners when users send messages to your bot.

// React to /start command
bot.command('start', (ctx) => ctx.reply('Welcome! Up and running.'))
// Handle other messages
bot.on('message', (ctx) => ctx.reply('Got another message!'))

// Now that you specified how to handle messages, you can start your bot.
// This will connect to the Telegram servers and wait for messages.

// Start your bot
bot.start()
```

 </CodeGroupItem>
</CodeGroup>

Compile the code by running

```bash
npx tsc
```

in your terminal which generates the JavaScript file `bot.js`.

You can now run the bot by executing

<CodeGroup>
  <CodeGroupItem title="Node" active>

```bash
node bot.js
```

 </CodeGroupItem>
 <CodeGroupItem title="Deno">

```bash
deno run --allow-env --allow-net bot.ts
```

 </CodeGroupItem>
</CodeGroup>

in your terminal.
Done! :tada:

Head over to Telegram to watch your bot respond to messages!

::: tip Enabling logging
You can enable basic logging by running

```bash
export DEBUG='grammy*'
```

in your terminal before you execute `node bot.js`.
This makes it easier to debug your bot.
:::
