---
prev: false
next: false
---

# Commands (`commands`)

Command handling on steroids.

This plugin provides various features related to command handling that are not contained in the [command handling done by the grammY core library](../guide/commands).
Here is a quick overview of what you get with this plugin:

- Better code structure by attaching middleware to command definitions
- Automatic synchronization via `setMyCommands`
- Command scope handling
- Defining command translations
- "Did you mean ...?" feature that finds the nearest existing command
- Custom command prefixes
- Specify what to do with commands that mention your bot's user
- Support for commands that are not in the beggining of the message
- RegEx support for command names

All of these features are made possible because you will define one or more central command structures that define your bot's commands.

## Basic Usage

Before we dive in, take a look at how you can register and handle a command with the plugin:

```js
const myCommands = new Commands();

myCommands.command("hello", "Say hello", (ctx) => ctx.reply(`Hello, world!`));

bot.use(myCommands);
```

This registers a new "/start" command to your bot that will be handled by the given middleware.

Now, let's get into some of the extra tools this plugin has to offer.

## Importing

First of all, we need to import the `Commands` class.

::: code-group

```ts [TypeScript]
import { Commands, commands, type CommandsFlavor } from "@grammyjs/commands";
```

```js [JavaScript]
const { Commands, commands } = require("@grammyjs/commands");
```

```ts [Deno]
import {
  Commands,
  commands,
  type CommandsFlavor,
} from "https://deno.land/x/grammy_commands/mod.ts";
```

:::

Now that that's settled, let's see how we can make our commands visible to our users.

## Automatic Command Setting

Once you defined your commands with an instance of the `Commands` class, you can call the `setCommands` method, which will register all the defined commands to your bot.

```js
const myCommands = new Commands()

myCommands.command("hello", "Say hello", (ctx) => ctx.reply("Hi there!"))
myCommands.command("start", "Start the bot", (ctx) => ctx.reply("Starting..."));

bot.use(myCommands)

await myCommands.setCommands(bot)
```

This will make it so every command you registered is displayed on the menu of a private chat with your bot, or whenever users type `/` on a chat your bot is a member of.

## Scoped Commands

Did you know you can allow different commands to be shown on different chats depending on the chat type, the language, and even the user status in a chat group?
That's what Telegram call **Command Scopes**.

The `Command` class returned by the `command` method exposes a method called `addToScope`.
This method takes in a [BotCommandScope](/ref/types/botcommandscope) together with one or more handlers, and registers those handlers to be ran at that specific scope.

You don't even need to worry about calling `filter`, the `addToScope` method will guarantee that your handler only gets called if the context is right.

Here's an example of a scoped command:

```js
const myCommands = new Commands();

myCommands
  .command("start", "Initializes bot configuration")
  .addToScope(
    { type: "all_private_chats" },
    (ctx) => ctx.reply(`Hello, ${ctx.chat.first_name}!`),
  )
  .addToScope(
    { type: "all_group_chats" },
    (ctx) => ctx.reply(`Hello, members of ${ctx.chat.title}!`),
  );
```

The "start" command can now be called from both private and group chats, and it will give a different response depending on where it gets called from.
Now if you call `myCommands.setCommands`, the "start" command will be registered to both private and group chats.

### Context shortcut

What if you want some commands to be displayed only for certain users.
For example, imagine you have a "login" and a "logout" command.
The "login" command should only appear for logged out users, and vice versa.
This is how you can do that with the Commands plugin:

::: code-group

```ts [TypeScript]
// Use the flavor to create a custom context
type MyContext = Context & CommandsFlavor;

// Use the new context to instantiate your bot
const bot = new Bot<MyContext>("token");

// Register the context shortcut
bot.use(commands());

const loggedOutCommands = new Commands();
const loggedInCommands = new Commands();

loggedOutCommands.command(
  "login",
  "Start your session with the bot",
  async (ctx) => {
    await ctx.setMyCommands(loggedInCommands);
    await ctx.reply("Welcome! Session started!");
  },
);

loggedInCommands.command(
  "logout",
  "End your session with the bot",
  async (ctx) => {
    await ctx.setMyCommands(loggedOutCommands);
    await ctx.reply("Goodbye :)");
  },
);

bot.use(loggedInCommands);
bot.use(loggedOutCommands);

// by default, users are not logged in,
// so you can set the logged out commands for everyone
await loggedOutCommands.setCommands(bot);
```

```js [JavaScript]
// Register the context shortcut
bot.use(commands());

const loggedOutCommands = new Commands();
const loggedInCommands = new Commands();

loggedOutCommands.command(
  "login",
  "Start your session with the bot",
  async (ctx) => {
    await ctx.setMyCommands(loggedInCommands);
    await ctx.reply("Welcome! Session started!");
  },
);

loggedInCommands.command(
  "logout",
  "End your session with the bot",
  async (ctx) => {
    await ctx.setMyCommands(loggedOutCommands);
    await ctx.reply("Goodbye :)");
  },
);

bot.use(loggedInCommands);
bot.use(loggedOutCommands);

// by default, users are not logged in,
// so you can set the logged out commands for everyone
await loggedOutCommands.setCommands(bot);
```

:::

This way when a user calls `/login`, they'll have their commands list changed to contain only the "logout" command.
Neat, right?

## Command Translations

Another extremely useful possibility is setting commands to have different names and descriptions based on the user language.
The Commands plugin makes that easy by providing the `localize` method.
Check it out:

```js
myCommands
  // You need to set a default name and description
  .command("hello", "Say hello")
  // And then you can set the localized ones
  .localize("pt", "ola", "Dizer olá");
```

Add as many as you want!
The plugin will take care of registering them for you when you call `myCommands.setCommands`.

## Finding the Nearest Command

Even though Telegram it capable of auto completing the registered commands, sometimes users do type them manually and, in some cases, happen to make mistakes.
The Commands plugin helps you deal with that by allowing you to suggest a command that might be what the user wanted in the first place.
Usage is quite straight-forward:

::: code-group

```ts [TypeScript]
// Use the flavor to create a custom context
type MyContext = Context & CommandsFlavor;

// Use the new context to instantiate your bot
const bot = new Bot<MyContext>("token");

// Register the context shortcut
bot.use(commands());

const myCommands = new Commands();

// ... Register the commands

bot
  // Check if there is a command
  .filter(Context.has.filterQuery("::bot_command"))
  // If so, that means it wasn't handled by any of our commands.
  // Let's try and guess what the user meant.
  .use(async (ctx) => {
    const suggestedCommand = ctx.getNearestCommand(myCommands);

    // We found a potential match
    if (suggestedCommand) {
      return ctx.reply(
        `Hm... I don't know that command. Did you mean ${suggestedCommand}?`,
      );
    }

    // Nothing seems to come close to what the user typed
    await ctx.reply("Ops... I don't know that command :/");
  });
```

```js [JavaScript]
// Register the context shortcut
bot.use(commands());

const myCommands = new Commands();

// ... Register the commands

bot
  // Check if there is a command
  .filter(Context.has.filterQuery("::bot_command"))
  // If so, that means it wasn't handled by any of our commands.
  // Let's try and guess what the user meant.
  .use(async (ctx) => {
    const suggestedCommand = ctx.getNearestCommand(myCommands);

    // We found a potential match
    if (suggestedCommand) {
      return ctx.reply(
        `Hm... I don't know that command. Did you mean ${suggestedCommand}?`,
      );
    }

    // Nothing seems to come close to what the user typed
    await ctx.reply("Ops... I don't know that command :/");
  });
```

:::

## Command Options

There are a few options that can be specified per command, per scope, or globally for a `Commands` instance.
These options allow you to further customize how your bot handles commands, giving you more flexibility.

### `targetedCommands`

When users invoke a command, they can optionally tag your bot, like so: `/command@bot_username`.
You can decide what to do with these commands by using the `targetedCommands` config option.
With it you can coose between three different behaviors:

- `ignored`: Ignores commands that mention your bot's user
- `optional`: Handles both commands that do and that don't mention the bot's user
- `required`: Only handles commands that mention the bot's user

### `prefix`

Currently, only commands starting with `/` are recognized by Telegram and, thus, by the [command handling done by the grammY core library](../guide/commands).
In some occasions, you might want to change that and use a custom prefix for your bot.
That is made possible by the `prefix` option, which will tell the Commands plugin to look for that prefix when trying to identify a command

### `matchOnlyAtStart`

When [handling commands](../guide/commands.md), the grammY core library will only recognize commands that start on the first carachter of a message.
The Commands plugin, however, allows you to listen for commands in the middle of the message text, or in the end, it doesn't matter!
All you have to do is set the `matchOnlyAtStart` option to `false`, and the rest will be done by the plugin.

## Plugin Summary

- Name: `commands`
- [Source](https://github.com/grammyjs/commands)
- [Reference](/ref/commands/)
