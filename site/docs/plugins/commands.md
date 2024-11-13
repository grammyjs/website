---
prev: false
next: false
---

# Commands (`commands`)

Command handling on steroids.

This plugin provides various features related to command handling that are not contained in the [command handling done by the core library](../guide/commands).
Here is a quick overview of what you get with this plugin:

- Better code readability by encapsulating middleware with command definitions
- User command menu synchronization via `setMyCommands`
- Improved command grouping and organization
- Ability to scope command reach, e.g: only accessible to group admins or channels, etc
- Defining command translations
- `Did you mean ...?` feature that finds the nearest existing command to a given user miss-input
- Case-insensitive command matching
- Setting custom behavior for commands that explicitly mention your bot's user, like: `/start@your_bot`
- Custom command prefixes, e.g: `+`, `?` or any symbol instead of `/`
- Support for commands that are not in the beginning of the message
- RegExp Commands!

All of these features are made possible because you will define one or more central command structures that define your bot's commands.

## Basic Usage

Before we dive in, take a look at how you can register and handle a command with the plugin:

```ts
const myCommands = new CommandGroup();

myCommands.command("hello", "Say hello", (ctx) => ctx.reply(`Hello, world!`));

bot.use(myCommands);
```

This registers a new `/hello` command to your bot that will be handled by the given middleware.

Now, let's get into some of the extra tools this plugin has to offer.

## Importing

First of all, here's how you can import all the necessary types and classes the plugin provides.

::: code-group

```ts [TypeScript]
import {
  CommandGroup,
  commandNotFound,
  commands,
  type CommandsFlavor,
} from "@grammyjs/commands";
```

```js [JavaScript]
const { CommandGroup, commands, commandNotFound } = require(
  "@grammyjs/commands",
);
```

```ts [Deno]
import {
  CommandGroup,
  commandNotFound,
  commands,
  type CommandsFlavor,
} from "https://deno.land/x/grammy_commands/mod.ts";
```

:::

Now that the imports are settled, let's see how we can make our commands visible to our users.

## User Command Menu Setting

Once you defined your commands with an instance of the `CommandGroup` class, you can call the `setCommands` method, which will register all the defined commands to your bot.

```ts
const myCommands = new CommandGroup();

myCommands.command("hello", "Say hello", (ctx) => ctx.reply("Hi there!"));
myCommands.command("start", "Start the bot", (ctx) => ctx.reply("Starting..."));

bot.use(myCommands);

await myCommands.setCommands(bot);
```

This will make it so every command you registered is displayed on the menu of a private chat with your bot, or whenever users type `/` on a chat your bot is a member of.

### Context Shortcut

What if you want some commands to be displayed only to certain users?
For example, imagine you have a `login` and a `logout` command.
The `login` command should only appear for logged out users, and vice versa.
This is how you can do that with the commands plugin:

::: code-group

```ts [TypeScript]
// Use the flavor to create a custom context
type MyContext = Context & CommandsFlavor;

// Use the new context to instantiate your bot
const bot = new Bot<MyContext>("token");

// Register the context shortcut
bot.use(commands());

const loggedOutCommands = new CommandGroup<MyContext>();
const loggedInCommands = new CommandGroup<MyContext>();

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

// By default, users are not logged in,
// so you can set the logged out commands for everyone
await loggedOutCommands.setCommands(bot);
```

```js [JavaScript]
// Register the context shortcut
bot.use(commands());

const loggedOutCommands = new CommandGroup();
const loggedInCommands = new CommandGroup();

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

// By default, users are not logged in,
// so you can set the logged out commands for everyone
await loggedOutCommands.setCommands(bot);
```

:::

This way when a user calls `/login`, they'll have their command list changed to contain only the `logout` command.
Neat, right?

::: danger Command Name Restrictions
As stated in the [Telegram Bot API documentation](https://core.telegram.org/bots/api#botcommand), command names can only be form out of:

1. 1-32 characters.
2. Can contain only lowercase English letters, digits and underscores.

Therefore calling `setCommands` or `setMyCommands` with anything but lower_c4s3_commands will throw an exception.
Commands not following this rules can still be registered, used and handled, but will never be displayed on the user menu as such.
:::

**Be aware** that `setCommands` and `setMyCommands` only affects the commands displayed in the user's commands menu, and not the actual access to them.
You will learn how to implement restricted command access in the [Scoped Commands](#scoped-commands) section.

### Grouping Commands

Since we can split and group our commands into different instances, it allows for a much more idiomatic command file organization.

Let's say we want to have developer-only commands.
We can achieve that with the following code structure:

```ascii
src/
├─ commands/
│  ├─ admin.ts
│  ├─ users/
│  │  ├─ group.ts
│  │  ├─ say-hi.ts
│  │  ├─ say-bye.ts
│  │  ├─ ...
├─ bot.ts
├─ types.ts
tsconfig.json
```

The following code group exemplifies how we could implement a developer only command group, and update the Telegram client Command menu accordingly.
Make sure you take notice of the different patterns being use in the `admin.ts` and `group.ts` file-tabs.

::: code-group

```ts [types.ts]
export type MyContext = Context & CommandsFlavor<MyContext>;
```

```ts [bot.ts]
import { devCommands } from "./commands/admin.ts";
import { userCommands } from "./commands/users/group.ts";
import type { MyContext } from "./types.ts";

export const bot = new Bot<MyContext>("MyBotToken");

bot.use(commands());

bot.use(userCommands);
bot.use(devCommands);
```

```ts [admin.ts]
import { userCommands } from './users/group.ts'
import type { MyContext } from '../types.ts'

export const devCommands = new CommandGroup<MyContext>()

devCommands.command('devlogin', 'Greetings', async (ctx, next) => {
   if (ctx.from?.id === ctx.env.DEVELOPER_ID) {
      await ctx.reply('Hi to me')
      await ctx.setMyCommands(userCommands, devCommands)
   } else {
     await next()
   }
})

devCommands.command('usercount', '', async (ctx, next) => {
   if (ctx.from?.id === ctx.env.DEVELOPER_ID) {
      await ctx.reply(
        `Active users: ${/** Your business logic */}`
    )
   } else {
     await next()
   }
})

devCommands.command('devlogout', 'Greetings', async (ctx, next) => {
    if (ctx.from?.id === ctx.env.DEVELOPER_ID) {
       await ctx.reply('Bye to me')
       await ctx.setMyCommands(userCommands)
   } else {
     await next()
   }
 })
```

```ts [group.ts]
import sayHi from "./say-hi.ts";
import sayBye from "./say-bye.ts";
import etc from "./another-command.ts";
import type { MyContext } from "../../types.ts";

export const userCommands = new CommandGroup<MyContext>()
  .add([sayHi, sayBye]);
```

```ts [say-hi.ts]
import type { MyContext } from "../../types.ts";

export default new Command<MyContext>("sayhi", "Greetings", async (ctx) => {
  await ctx.reply("Hello little User!");
});
```

:::

Did you notice it is possible to register single initialized Commands via the `.add` method into the `CommandGroup` instance or also directly through the `.command(...)` method?
This allows for a one-file-only structure, like in the `admin.ts` file, or a more distributed file structure like in the `group.ts` file.

::: tip Always Use Command Groups

When creating and exporting commands using the `Command` constructor, it's mandatory to register them onto a `CommandGroup` instance via the `.add` method.
On their own they are useless, so make sure you do that at some point.

:::

The plugin also enforce you to have the same Context-type for a given `CommandGroup` and their respective `Commands` so you avoid at first glance that kind of silly mistake!

Combining this knowledge with the following section will get your Command-game to the next level.

## Scoped Commands

Did you know you can allow different commands to be shown on different chats depending on the chat type, the language, and even the user status in a chat group?
That's what Telegram calls [**Command Scopes**](https://core.telegram.org/bots/features#command-scopes).

Now, Command Scopes are a cool feature, but using it by hand can get really messy, since it's hard to keep track of all the scopes and what commands they present.
Plus, by using Command Scopes on their own, you have to do manual filtering inside each command to ensure they'll only run for the correct scopes.
Syncing those two things up can be a nightmare, and that's why this plugin exists.
Check how it's done.

The `Command` class returned by the `command` method exposes a method called `addToScope`.
This method takes in a [`BotCommandScope`](/ref/types/botcommandscope) together with one or more handlers, and registers those handlers to be ran at that specific scope.

You don't even need to worry about calling `filter`, the `addToScope` method will guarantee that your handler only gets called if the context is right.

Here's an example of a scoped command:

```ts
const myCommands = new CommandGroup();

myCommands
  .command("start", "Initializes bot configuration")
  .addToScope(
    { type: "all_group_chats" },
    (ctx) => ctx.reply(`Hello, members of ${ctx.chat.title}!`),
  )
  .addToScope(
    { type: "all_private_chats" },
    (ctx) => ctx.reply(`Hello, ${ctx.chat.first_name}!`),
  );
```

The `start` command can now be called from both private and group chats, and it will give a different response depending on where it gets called from.
Now if you call `myCommands.setCommands`, the `start` command will be registered to both private and group chats.

Here's an example of a command that's only accessible to group admins.

```js
adminCommands
  .command("secret", "Admin only")
  .addToScope(
    { type: "all_chat_administrators" },
    (ctx) => ctx.reply("Free cake!"),
  );
```

And here is an example of a command that's only accessible in groups

```js
myCommands
  .command("fun", "Laugh")
  .addToScope(
    { type: "all_group_chats" },
    (ctx) => ctx.reply("Haha"),
  );
```

Notice that when you call the `command` method, it opens up a new command.
If you give it a handler, that handler will apply to the `default` scope of that command.
Calling `addToScope` on that command will then add a new handler, which will be filtered to that scope.
Take a look at this example.

```ts
myCommands
  .command(
    "default",
    "Default command",
    // This will be called when not on a group chat, or when the user is not an admin
    (ctx) => ctx.reply("Hello from default scope"),
  )
  .addToScope(
    { type: "all_chat_administrators" },
    // This will be called for group admins, when inside that group
    (ctx) => ctx.reply("Hello, admin!"),
  )
  .addToScope(
    { type: "all_group_chats" },
    // This will only be called for non-admin users in a group
    (ctx) => ctx.reply("Hello, group chat!"),
  );
```

## Command Translations

Another powerful feature is the ability to set different names for the same command, and their respective descriptions based on the user language.
The commands plugin makes that easy by providing the `localize` method.
Check it out:

```js
myCommands
  // You need to set a default name and description
  .command("hello", "Say hello")
  // And then you can set the localized ones
  .localize("pt", "ola", "Dizer olá");
```

Add as many as you want! The plugin will take care of registering them for you when you call `myCommands.setCommands`.

For convenience, grammY exports a `LanguageCodes` enum-like object that you can use for a more idiomatic approach:

::: code-group

```ts [TypeScript]
import { LanguageCodes } from "grammy/types";

myCommands.command(
  "chef",
  "Steak delivery",
  (ctx) => ctx.reply("Steak on the plate!"),
)
  .localize(
    LanguageCodes.Spanish,
    "cocinero",
    "Bife a domicilio",
  );
```

```js [JavaScript]
const { LanguageCodes } = require("grammy/types");

myCommands.command(
  "chef",
  "Steak delivery",
  (ctx) => ctx.reply("Steak on the plate!"),
)
  .localize(
    LanguageCodes.Spanish,
    "cocinero",
    "Bife a domicilio",
  );
```

```ts [Deno]
import { LanguageCodes } from "https://deno.land/x/grammy/types.ts";

myCommands.command(
  "chef",
  "Steak delivery",
  (ctx) => ctx.reply("Steak on the plate!"),
)
  .localize(
    LanguageCodes.Spanish,
    "cocinero",
    "Bife a domicilio",
  );
```

:::

### Localizing Commands With the Internationalization Plugin

If you are looking to have your localized command names and descriptions bundle inside your `.ftl` files, you could make use of the following idea:

```ts
function addLocalizations(command: Command) {
  i18n.locales.forEach((locale) => {
    command.localize(
      locale,
      i18n.t(locale, `${command.name}.command`),
      i18n.t(locale, `${command.name}.description`),
    );
  });
  return command;
}

myCommands.commands.forEach(addLocalizations);
```

## Finding the Nearest Command

Even though Telegram is capable of auto completing the registered commands, sometimes users do type them manually and, in some cases, happen to make mistakes.
The commands plugin helps you deal with that by allowing you to suggest a command that might be what the user wanted in the first place.
It is compatible with custom prefixes, so you don't have to worry about that, and its usage is quite straightforward:

::: code-group

```ts [TypeScript]
// Use the flavor to create a custom context
type MyContext = Context & CommandsFlavor;

// Use the new context to instantiate your bot
const bot = new Bot<MyContext>("token");
const myCommands = new CommandGroup<MyContext>();

// ... Register the commands

bot
  // Check if there is a command
  .filter(commandNotFound(myCommands))
  // If so, that means it wasn't handled by any of our commands.
  .use(async (ctx) => {
    // We found a potential match
    if (ctx.commandSuggestion) {
      await ctx.reply(
        `Hmm... I don't know that command. Did you mean ${ctx.commandSuggestion}?`,
      );
    }

    // Nothing seems to come close to what the user typed
    await ctx.reply("Oops... I don't know that command :/");
  });
```

```js [JavaScript]
// Use the new context to instantiate your bot
const bot = new Bot("token");
const myCommands = new CommandGroup();

// ... Register the commands

bot
  // Check if there is a command
  .filter(commandNotFound(myCommands))
  // If so, that means it wasn't handled by any of our commands.
  .use(async (ctx) => {
    // We found a potential match
    if (ctx.commandSuggestion) {
      await ctx.reply(
        `Hmm... I don't know that command. Did you mean ${ctx.commandSuggestion}?`,
      );
    }

    // Nothing seems to come close to what the user typed
    await ctx.reply("Oops... I don't know that command :/");
  });
```

:::

Behind the scenes, `commandNotFound` will use the `getNearestCommand` context method which by default will prioritize commands that correspond to the user language.
If you want to opt-out of this behavior, you can pass the `ignoreLocalization` flag set to true.
It is possible to search across multiple `CommandGroup` instances, and `ctx.commandSuggestion` will be the most similar command, if any, across them all.
It also allows to set the `ignoreCase` flag, which will ignore casing while looking for a similar command and the `similarityThreshold` flag, which controls how similar a command name has to be to the user input for it to be recommended.

The `commandNotFound` function will only trigger for updates which contain command-like text similar to your registered commands.
For example, if you only have registered [commands with a custom prefix](#prefix) like `?`, it will trigger the handler for anything that looks like your commands, e.g: `?sayhi` but not `/definitely_a_command`.
Same goes the other way, if you only have commands with the default prefix, it will only trigger on updates that look like `/regular` `/commands`.

The recommended commands will only come from the `CommandGroup` instances you pass to the function.
So you could defer the checks into multiple, separate filters.

Let's use the previous knowledge to inspect the next example:

```ts
const myCommands = new CommandGroup();
myCommands.command("dad", "calls dad", () => {}, { prefix: "?" })
  .localize("es", "papa", "llama a papa")
  .localize("fr", "pere", "appelle papa");

const otherCommands = new CommandGroup();
otherCommands.command("bread", "eat a toast", () => {})
  .localize("es", "pan", "come un pan")
  .localize("fr", "pain", "manger du pain");

// Register each language-specific command group

// Let's assume the user is French and typed /Papi
bot
  // this filter will trigger for any command-like as '/regular' or '?custom'
  .filter(commandNotFound([myCommands, otherCommands], {
    ignoreLocalization: true,
    ignoreCase: true,
  }))
  .use(async (ctx) => {
    ctx.commandSuggestion === "?papa"; // evaluates to true
  });
```

If the `ignoreLocalization` was falsy instead we would have gotten "`ctx.commandSuggestion` equals `/pain`".
We could add more filters like the above, with different parameters or `CommandGroup`s to check against.
There are a lot of possibilities!

## Command Options

There are a few options that can be specified per command, per scope, or globally for a `CommandGroup` instance.
These options allow you to further customize how your bot handles commands, giving you more flexibility.

### `ignoreCase`

By default commands will match the user input in a case-sensitive manner.
Having this flag set, for example, in a command named `/dandy` will match `/DANDY` the same as `/dandY` or any other case-only variation.

### `targetedCommands`

When users invoke a command, they can optionally tag your bot, like so: `/command@bot_username`.
You can decide what to do with these commands by using the `targetedCommands` config option.
With it you can choose between three different behaviors:

- `ignored`: Ignores commands that mention your bot's user
- `optional`: Handles both commands that do and that don't mention the bot's user
- `required`: Only handles commands that mention the bot's user

### `prefix`

Currently, only commands starting with `/` are recognized by Telegram and, thus, by the [command handling done by the grammY core library](../guide/commands).
In some occasions, you might want to change that and use a custom prefix for your bot.
That is made possible by the `prefix` option, which will tell the commands plugin to look for that prefix when trying to identify a command.

If you ever need to retrieve `botCommand` entities from an update and need them to be hydrated with the custom prefix you have registered, there is a method specifically tailored for that, called `ctx.getCommandEntities(yourCommands)`, which returns the same interface as `ctx.entities('bot_command')`

::: tip

Commands with custom prefixes cannot be shown in the Commands Menu.

:::

### `matchOnlyAtStart`

When [handling commands](../guide/commands), the grammY core library will only recognize commands that start on the first character of a message.
The commands plugin, however, allows you to listen for commands in the middle of the message text, or in the end, it doesn't matter!
All you have to do is set the `matchOnlyAtStart` option to `false`, and the rest will be done by the plugin.

## RegExp Commands

This feature is for those who are really looking to go wild, it allows you to create command handlers based on regular expressions instead of static strings, a basic example would look like:

```ts
myCommands
  .command(
    /delete_([a-zA-Z]+)/,
    (ctx) => ctx.reply(`Deleting ${ctx.msg?.text?.split("_")[1]}`),
  );
```

This command handler will trigger on `/delete_me` the same as in `/delete_you`, and it will reply "Deleting me" in the first case and "Deleting you" in the later, but will not trigger on `/delete_` nor `/delete_123xyz`, passing through as if it wasn't there.

## Plugin Summary

- Name: `commands`
- [Source](https://github.com/grammyjs/commands)
- [Reference](/ref/commands/)
