---
prev: /plugins/
---

# The Hitchhiker's Guide to grammY Plugins

If you would like to develop your own plugin and publish it, or if you want to know how grammY plugins work behind the scenes, this is the place for you!

> Please note that there is already a summary about [grammY plugins](./) are and what they do.
> This article is a deep dive into their inner workings.

## Types of Plugins in grammY

There are two main types of plugins in grammY:

- Middleware Plugins: The plugin's sole job is to return a [middleware function](../guide/middleware.md) that can be fed to a grammY bot.
- Transformer Plugins: The plugin's sole job is to return a [transformer function](../advanced/transformers.md) that can be fed to a grammY bot.

However, you will sometimes find plugins that do both things.
There are also other packages that are neither middleware nor transformer functions, but we will call them plugins anyway because they extend grammY in various ways.

## Rules of Contribution

You may publish your plugins in one of the following forms:

- Publishing as an **official** plugin.
- Publishing as a **third-party** plugin.

If you choose to publish your plugins as a third party, we can still offer you a prominent place on this website.
However, we prefer it if you publish your plugin under [the grammyjs organization](https://github.com/grammyjs) on GitHub, hence making it an official plugin.
In such a case, you will be granted publish access to GitHub and npm.
Also, You will be responsible for maintaining your code.

Before diving into some hands-on examples, there are some rules to pay attention to if you'd like your plugins to be listed on this website.

1. Have a README file on GitHub (and npm) with **short and clear** instructions on how to use it.
2. Explain the purpose of your plugin and how to use it by adding a page to the [docs](https://github.com/grammyjs/website).
   (We can create the page for you if you are unsure how to do that.)
3. Choose a permissive license such as MIT or ISC.

Finally, you should know that even though grammY supports both Node.js and [Deno](https://deno.land/), it is a Deno-first project, and we also encourage you to write your plugins for Deno (and subsequently in style!).
There is a handy-dandy tool called [deno2node](https://github.com/wojpawlik/deno2node) that transpiles your code from Deno to Node.js so we can support both platforms equally well.
Deno support is only a strict requirement for official plugins, but not for third-party ones.
Nonetheless, it is very much encouraged to give Deno a try.
You will not want to go back.

## Designing a Dummy Middleware Plugin

Let's assume we would like to design a plugin that only responds to certain users!
For example, we could decide to only respond to people whose usernames contain a certain word.
The bot will simply refuse to work for everyone else.

Here is a dummy example:

```ts
// plugin.ts

// Importing the types from grammY (we re-export them in `deps.deno.ts`).
import type { Context, Middleware, NextFunction } from "./deps.deno.ts";

// Your plugin can have one main function that creates middleware
export function onlyAccept<C extends Context>(str: string): Middleware<C> {
  // Create and return middleware.
  return async (ctx, next) => {
    // Get first name of user.
    const name = ctx.from?.first_name;
    // Let through all matching updates.
    if (name === undefined || name.includes(str)) {
      // Pass on control flow to downstream middleware.
      await next();
    } else {
      // Tell them we don't like them.
      await ctx.reply(`I'm not talking to you! You don't care about ${str}!`);
    }
  };
}
```

Now, it can be used in a real bot:

```ts
// Here, the plugin code is in a file called `plugin.ts`.
import { onlyAccept } from "./plugin.ts";
import { Bot } from "./deps.deno.ts";

const bot = new Bot(""); // <-- put your bot token here

bot.use(onlyAccept("grammY"));

bot.on("message", (ctx) => ctx.reply("You passed the middleware plugin"));

bot.start();
```

Voilà!
You got yourself a plugin, right?
Well, not so fast.
We still need to package it up, but before that, let's take a look at transformer plugins, as well.

## Designing a Dummy Transformer Plugin

Imagine writing a plugin that sends the appropriate [chat action](https://core.telegram.org/bots/api#sendchataction) automatically whenever the bot sends a document.
This means that while your bot is sending a file, users will automatically see "_sending file…_" as status.
Pretty cool, right?

```ts
// plugin.ts
import type { Transformer } from "./deps.deno.ts";

// Main plugin function
export function autoChatAction(): Transformer {
  // Create and return a transformer function.
  return async (prev, method, payload, signal) => {
    // Save the handle of the set interval so we can clear it later.
    let handle: ReturnType<typeof setTimeout> | undefined;
    if (method === "sendDocument" && "chat_id" in payload) {
      // We now know that a document is being sent.
      const actionPayload = {
        chat_id: payload.chat_id,
        action: "upload_document",
      };
      // Repeatedly set the chat action while the file is being uploaded.
      handle ??= setInterval(() => {
        prev("sendChatAction", actionPayload).catch(console.error);
      }, 5000);
    }

    try {
      // Run the actual method from the bot.
      return await prev(method, payload, signal);
    } finally {
      // Clear the interval so we stop sending the chat action to the client.
      clearInterval(handle);
    }
  };
}
```

Now, we can use it in a real bot:

```ts
import { Bot, InputFile } from "./deps.deno.ts";
// The plugin code is in a file called `plugin.ts`
import { autoChatAction } from "./plugin.ts";

// Create a bot instance.
const bot = new Bot(""); // <-- put your bot token here

// Use the plugin.
bot.api.config.use(autoChatAction());

bot.hears("send me a document", async (ctx) => {
  // If user send this command, we will send him a pdf file (for demonstration purposes)
  await ctx.replyWithDocument(new InputFile("/tmp/document.pdf"));
});

// start the bot
bot.start();
```

Now, every time we send a document, the chat action of `upload_document` will be sent to our client.
Note that this was for demonstration purposes.
Telegram recommends using chat actions only when "a response from the bot will take a **noticeable** amount of time to arrive".
You probably don't actually need to set the status if the file is very small, so there are some optimisations that could be done here.

## Extraction Into a Plugin

Whichever type of plugin you made, you have to bundle it in a standalone package.
This is a fairly simple task.
There are no specific rules on how to do this and npm is your oyster, but just to keep things organized, we have a template suggestion for you.
You can download the code from [our plugin template repository on GitHub](https://github.com/grammyjs/plugin-template) and start developing your plugin without any time spent on configuration.

The initially suggested folder structure:

```asciiart:no-line-numbers
plugin-template/
├─ src/
│  ├─ deps.deno.ts
│  ├─ deps.node.ts
│  └─ index.ts
├─ package.json
├─ tsconfig.json
└─ README.md
```

**`deps.deno.ts` and `deps.node.ts`**: This is for the developers who are willing to write the plugin for Deno, and then transpile it to Node.js.
As mentioned before, we use the tool `deno2node` to transpile our Deno code for Node.js.
`deno2node` has a feature that allows you to provide runtime-specific files to it.
These files should be adjacent to each other and follow the `*.deno.ts` and `*.node.ts` name structure as [explained in the docs](https://github.com/wojpawlik/deno2node#runtime-specific-code).
This is why there are two files `deps.deno.ts` and `deps.node.ts`.
If there are any Node.js-specific dependencies, put them in `deps.node.ts`, otherwise, leave it empty.

> _**Note**_: You may also use other tools such as [deno dnt](https://github.com/denoland/dnt) to transpile your deno codebase or use other folder structures.
> The tooling you use is irrelevant, the main point here is that writing code for Deno is better and easier.

**`tsconfig.json`**: This is the TypeScript compiler configuration file used by `deno2node` to transpile your code.
A default one is provided in the repository as a suggestion.
It corresponds with the TypeScript configuration that Deno uses internally, and we recommend that you stick with this.

**`package.json`**: The package.json file for the npm version of your plugin.
**Make sure to change it according to your project**.

**`README.md`**: Instructions on how to use the plugin.
**Make sure to change it according to your project**.

**`index.ts`**: The file containing your business logic, i.e., your main plugin code.

## There Is a Boilerplate

If you would like to develop a plugin for grammY and do not know where to start, we highly suggest the template code in [our repository](https://github.com/grammyjs/plugin-template).
You can clone the code for yourself and start coding based on what was covered in this article.
This repository also includes some extra goodies such as `.editorconfig`, `LICENSE`, `.gitignore`, etc, but you may choose to delete them.

## I Don't Like Deno

Well, you're missing out!
But you can also write your plugins only for Node.js.
You can still publish the plugin and have it listed as a third-party plugin on this website.
In such a case, you may use any folder structure you like (as long as it is organized like any other npm project).
Simply install grammY through npm with `npm install grammy`, and start coding.

## How to Submit?

If you have a plugin ready, you may simply submit a pull request on GitHub (according to the [Rules of Contribution](#rules-of-contribution)), or notify us in the [community chat](https://t.me/grammyjs) for further help.
