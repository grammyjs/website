---
prev: false
next: false
---

# Commands (`commands`)

Command handling on steroids.

This plugin offers advanced command-handling features beyond the core library's [command handling](../guide/commands).
Here is a quick overview of what you get with this plugin:

- Better code readability by encapsulating middleware with command definitions.
- User command menu synchronization via `setMyCommands`.
- Improved command grouping and organization.
- Command reach scoping, e.g. limiting access to group admins or specific channels.
- Support for command translations.
- `Did you mean ...?` feature to suggest the closest command when a user makes a typo.
- Case-insensitive command matching.
- Setting custom behavior for commands that explicitly mention your bot's username, such as `/start@your_bot`.
- Custom command prefixes, e.g. `+`, `?`, or any symbol instead of `/`.
- Support for commands not located at the start of a message.
- RegExp commands!

All of these features are powered by central command structures that you define for your bot.

## Basic Usage

Before we dive in, take a look at how you can register and handle a command with the plugin:

```ts
const myCommands = new CommandGroup();

myCommands.command("hello", "Say hello", (ctx) => ctx.reply(`Hello, world!`));

bot.use(myCommands);
```

This registers a new `/hello` command to your bot, which will be handled by the given middleware.

Now, let's get into some of the extra tools this plugin has to offer.

## Importing

First of all, here's how you can import all the necessary types and classes provided by the plugin.

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
const { CommandGroup, commandNotFound, commands } = require(
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

Once you have defined your commands using the `CommandGroup` class, you can call the `setCommands` method to add all the defined commands to the user command menu.

```ts
const myCommands = new CommandGroup();

myCommands.command("hello", "Say hello", (ctx) => ctx.reply("Hello there!"));
myCommands.command("start", "Start the bot", (ctx) => ctx.reply("Starting..."));

bot.use(myCommands);

// Update the user command menu
await myCommands.setCommands(bot); // [!code highlight]
```

This ensures that each registered command appears in the menu of a private chat with your bot or when users type `/` in a chat where your bot is a member.

### Context Shortcut

What if you want some commands displayed only to certain users?
For example, imagine you have a `login` and a `logout` command.
The `login` command should only appear for logged-out users, and vice versa.
Here's how to do that with the commands plugin:

::: code-group

```ts [TypeScript]
// Use the flavor to create a custom context
type MyContext = Context & CommandsFlavor<MyContext>;

// Use the new context to instantiate your bot
const bot = new Bot<MyContext>(""); // <-- put your bot token between the "" (https://t.me/BotFather)

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
// so you can set the logged-out commands for everyone
await loggedOutCommands.setCommands(bot);
```

```js [JavaScript]
const bot = new Bot(""); // <-- put your bot token between the "" (https://t.me/BotFather)

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
// so you can set the logged-out commands for everyone
await loggedOutCommands.setCommands(bot);
```

:::

This way, when a user calls `/login`, they'll have their command list changed to contain only the `logout` command.
Neat, right?

::: danger Command Name Restrictions
As stated in the [Telegram Bot API documentation](https://core.telegram.org/bots/api#botcommand), command names must consist of:

1. Between 1 and 32 characters.
2. Only lowercase English letters (a-z), digits (0-9), and underscores (_).

Therefore, calling `setCommands` or `setMyCommands` with invalid command names will throw an exception.
Commands that don't follow these rules can still be registered and handled, but won't appear in the user command menu.
:::

**Be aware** that `setCommands` and `setMyCommands` only affect the commands displayed in the user's commands menu, and not the actual access to them.
You will learn how to implement restricted command access in the [Scoped Commands](#scoped-commands) section.

### Grouping Commands

Since we can split and group our commands into different instances, it allows for a much more idiomatic command file organization.

Let's say we want to have developer-only commands.
We can achieve that with the following code structure:

```ascii
.
├── types.ts
├── bot.ts
└── commands/
    ├── admin.ts
    └── users/
        ├── group.ts
        ├── say-hello.ts
        └── say-bye.ts
```

The following code group exemplifies how we could implement a developer only command group, and update the Telegram client command menu accordingly.
Make sure you take notice of the different patterns being used in the `admin.ts` and `group.ts` file-tabs.

::: code-group

```ts [types.ts]
import type { Context } from "grammy";
import type { CommandsFlavor } from "grammy_commands";

export type MyContext = Context & CommandsFlavor<MyContext>;
```

```ts [bot.ts]
import { devCommands } from "./commands/admin.ts";
import { userCommands } from "./commands/users/group.ts";
import type { MyContext } from "./types.ts";

export const bot = new Bot<MyContext>(""); // <-- put your bot token between the "" (https://t.me/BotFather)

bot.use(commands());

bot.use(userCommands);
bot.use(devCommands);
```

```ts [admin.ts]
import { userCommands } from './users/group.ts';
import type { MyContext } from '../types.ts';

export const devCommands = new CommandGroup<MyContext>();

devCommands.command('devlogin', 'Login', async (ctx, next) => {
  if (ctx.from?.id === ctx.env.DEVELOPER_ID) {
    await ctx.reply('Hello, fellow developer! Are we having coffee today too?');
    await ctx.setMyCommands(userCommands, devCommands);
  } else {
    await next();
  }
});

devCommands.command('usercount', 'Count the active users', async (ctx, next) => {
  if (ctx.from?.id === ctx.env.DEVELOPER_ID) {
    await ctx.reply( `Active users: ${/** Your business logic */}`);
  } else {
    await next();
  }
});

devCommands.command('devlogout', 'Logout', async (ctx, next) => {
  if (ctx.from?.id === ctx.env.DEVELOPER_ID) {
    await ctx.reply('Until next commit!');
    await ctx.setMyCommands(userCommands);
  } else {
    await next();
  }
 });
```

```ts [group.ts]
import sayHello from "./say-hello.ts";
import sayBye from "./say-bye.ts";
import type { MyContext } from "../../types.ts";

export const userCommands = new CommandGroup<MyContext>()
  .add([sayHello, sayBye]);
```

```ts [say-hello.ts]
import type { MyContext } from "../../types.ts";

export default new Command<MyContext>("hello", "Say hello", async (ctx) => {
  await ctx.reply("Hello, little user!");
});
```

```ts [say-bye.ts]
import type { MyContext } from "../../types.ts";

export default new Command<MyContext>("bye", "Say bye", async (ctx) => {
  await ctx.reply("Goodbye :)");
});
```

:::

Did you know that, as shown in the example above, you can create commands either by using the `.command(...)` method directly or by registering initialized `Commands` into a `CommandGroup` instance with the `.add` method?
This approach lets you keep everything in a single file, like in `admin.ts`, or organize your commands across multiple files, like in `group.ts`.

::: tip Always Use Command Groups

When creating and exporting commands using the `Command` constructor, it's mandatory to register them onto a `CommandGroup` instance via the `.add` method.
On their own they are useless, so make sure you do that at some point.

:::

The plugin also ensures that a `CommandGroup` and its `Commands` share the same `Context` type, so you can avoid that kind of silly mistake at first glance!

Combining this knowledge with the following section will get your command-game to the next level.

## Scoped Commands

Did you know you can show different commands in various chats based on the chat type, language, and even user status within a chat group?
That's what Telegram refers to as [**command scopes**](https://core.telegram.org/bots/features#command-scopes).

Now, command scopes are a cool feature, but using them by hand can get really messy since it's hard to keep track of all the scopes and the commands they present.
Plus, by using command scopes on their own, you have to do manual filtering inside each command to ensure they run only for the correct scopes.
Syncing those two things up can be a nightmare, which is why this plugin exists.
Let's check how it's done.

The `Command` class returned by the `command` method exposes a method called `addToScope`.
This method takes in a [`BotCommandScope`](/ref/types/botcommandscope) together with one or more handlers, and registers those handlers to be run at that specific scope.

You don't even need to worry about calling `filter`, the `addToScope` method will guarantee that your handler only gets called if the context is right.

Here's an example of a scoped command:

```ts
const myCommands = new CommandGroup();

myCommands
  .command("hello", "Say hello")
  .addToScope(
    { type: "all_private_chats" },
    (ctx) => ctx.reply(`Hello, ${ctx.chat.first_name}!`),
  )
  .addToScope(
    { type: "all_group_chats" },
    (ctx) => ctx.reply(`Hello, members of ${ctx.chat.title}!`),
  );
```

The `hello` command can now be called from both private and group chats, and it will give a different response depending on where it gets called from.
Now, if you call `myCommands.setCommands`, the `hello` command menu will be displayed in both private and group chats.

Here's an example of a command that's only accessible to group admins.

```js
adminCommands
  .command("secret", "Admin only")
  .addToScope(
    { type: "all_chat_administrators" },
    (ctx) => ctx.reply("Free cake!"),
  );
```

And here is an example of a command that's only accessible in groups.

```js
groupCommands
  .command("fun", "Laugh")
  .addToScope(
    { type: "all_group_chats" },
    (ctx) => ctx.reply("Haha"),
  );
```

Notice that the `command` method could receive the handler too.
If you give it a handler, that handler will apply to the `default` scope of that command.
Calling `addToScope` on that command will then add a new handler, which will be filtered for that scope.
Take a look at this example.

```ts
myCommands
  .command(
    "default",
    "Default command",
    // This will be called when not in a group chat
    (ctx) => ctx.reply("Hello from default scope"),
  )
  .addToScope(
    { type: "all_group_chats" },
    // This will only be called for non-admin users in a group
    (ctx) => ctx.reply("Hello, group chat!"),
  )
  .addToScope(
    { type: "all_chat_administrators" },
    // This will be called for group admins, when inside that group
    (ctx) => ctx.reply("Hello, admin!"),
  );
```

## Command Translations

Another powerful feature is the ability to set different names and their respective descriptions for the same command based on the user language.
The commands plugin makes that easy by providing the `localize` method.
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

For convenience, grammY exports a `LanguageCodes` enum-like object, which you can use to create a more idiomatic approach.

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

### Localizing Commands with the Internationalization Plugin

If you are looking to have your localized command names and descriptions bundled inside your `.ftl` files, you could make use of the following approach:

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

Telegram can automatically complete registered commands.
However, sometimes users still type these commands manually and may make mistakes.

To help with this, the commands plugin suggests a command that the user might have intended to use.

This plugin works with custom prefixes, so you don’t need to worry about compatibility.
Plus, it’s easy to use.

::: code-group

```ts [TypeScript]
// Use the flavor to create a custom context
type MyContext = Context & CommandsFlavor;

// Use the new context to instantiate your bot
const bot = new Bot<MyContext>(""); // <-- put your bot token between the "" (https://t.me/BotFather)
const myCommands = new CommandGroup<MyContext>();

// ... Register the commands

bot
  // Check if there is a command
  .filter(commandNotFound(myCommands))
  // If so, that means it wasn't handled by any of our commands
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
const bot = new Bot(""); // <-- put your bot token between the "" (https://t.me/BotFather)
const myCommands = new CommandGroup();

// ... Register the commands

bot
  // Check if there is a command
  .filter(commandNotFound(myCommands))
  // If so, that means it wasn't handled by any of our commands
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

The `commandNotFound` gives you some options to configure:

- `ignoreLocalization`: By default, `commandNotFound` prioritizes commands that match the user language.
  To opt-out, set this option to `true`.
- `ignoreCase`: Allows the plugin to ignore letter casing when searching for similar commands.
- `similarityThreshold`: Determines how similar a command name must be to the user input in order to be suggested.

Additionally, you can search across multiple `CommandGroup` instances by providing an array of `CommandGroup` instead of just one instance.

The `commandNotFound` function will only trigger for updates which contain command-like text similar to your registered commands.
For example, if you only have registered [commands with a custom prefix](#prefix) like `?`, it will trigger the handler for anything that looks like your commands, e.g. `?sayhi` but not `/definitely_a_command`.

Same goes the other way, if you only have commands with the default prefix, it will only trigger on updates that look like `/regular` and `/commands`.

The recommended commands will only come from the `CommandGroup` instances you pass to the function.
This means you can separate the checks into multiple, separate filters.

Now, let's apply this understanding to the next example.

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

// Let's assume the user is French and typed '/Papi'
bot
  // This filter will trigger for any command-like as '/regular' or '?custom'
  .filter(commandNotFound([myCommands, otherCommands], {
    ignoreLocalization: true,
    ignoreCase: true,
  }))
  .use(async (ctx) => {
    ctx.commandSuggestion === "?papa"; // Evaluates to true
  });
```

If the `ignoreLocalization` were set to false, then `ctx.commandSuggestion` would equal `/pain`.

We could also add more filters similar to the one mentioned earlier by using different parameters or `CommandGroup`s to check against.

There are many possibilities for how we can customize this!

## Command Options

There are a few options that can be specified per command, per scope, or globally for a `CommandGroup` instance.
These options allow you to further customize how your bot handles commands, giving you more flexibility.

### `ignoreCase`

By default, commands match user input in a case-sensitive manner.
When this flag is set, a command like `/dandy` will match variations such as `/DANDY` or `/dandY`, regardless of case.

### `targetedCommands`

When users invoke a command, they can optionally tag your bot, like so: `/command@bot_username`.
You can decide what to do with these commands by using the `targetedCommands` config option.
With this option, you can choose between three different behaviors:

- `ignored`: Ignores commands that mention your bot's username.
- `optional`: Handles both commands that mention the bot's username and ones that don't.
- `required`: Only handles commands that mention the bot's username.

### `prefix`

Currently, only commands starting with `/` are recognized by Telegram and, consequently, by the [command handling done by the grammY core library](../guide/commands).
In some occasions, you might want to change that and use a custom prefix for your bot.
That is made possible by the `prefix` option, which will tell the commands plugin to look for that prefix when trying to identify a command.

If you ever need to retrieve `botCommand` entities from an update and need them to be hydrated with the custom prefix you have registered, there is a method specifically tailored for that, called `ctx.getCommandEntities(yourCommands)`, which returns the same interface as `ctx.entities('bot_command')`

::: tip

Commands with custom prefixes cannot be shown in the Commands Menu.

:::

### `matchOnlyAtStart`

When [handling commands](../guide/commands), the grammY core library recognizes commands only if they start at the first character of a message.
The commands plugin, however, allows you to listen for commands in the middle of the message text, or in the end, it doesn't matter!
Simply set the `matchOnlyAtStart` option to `false`, and the plugin will handle the rest.

## RegExp Commands

This feature is for those who want to go wild.
It allows you to create command handlers based on regular expressions instead of static strings.
A basic example would look like this:

```ts
myCommands
  .command(
    /delete_([a-zA-Z]+)/,
    (ctx) => ctx.reply(`Deleting ${ctx.msg?.text?.split("_")[1]}`),
  );
```

This command handler will trigger on `/delete_me` the same as on `/delete_you`, and it will reply `Deleting me` in the first case and `Deleting you` in the second, but will not trigger on `/delete_` nor `/delete_123xyz`, passing through as if it wasn't there.

## Plugin Summary

- Name: `commands`
- [Source](https://github.com/grammyjs/commands)
- [Reference](/ref/commands/)
