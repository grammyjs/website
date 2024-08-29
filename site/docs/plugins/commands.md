---
prev: false
next: false
---

# Commands (`commands`)

Command handling on steroids.

This plugin provides various features related to command handling that are not
contained in the
[command handling done by the grammY core library](../guide/commands). Here is a
quick overview of what you get with this plugin:

- Better code readability by encapsulating middleware with command definitions
- User command menu synchronization via `setMyCommands`
- Improved command grouping and organization
- Ability to scope command reach, e.g: only accessible to group admins or
  channels, etc
- Defining command translations
- `Did you mean ...?` feature that finds the nearest existing command to a given
  user miss-input
- Case-insensitive command matching
- Set custom behavior for commands that explicitly mention your bot's user,
  like: `/start@your_bot`
- Custom command prefixes, e.g: `+`, `?` or any symbol instead of `/`
- Support for commands that are not in the beginning of the message
- RegExp Commands!

All of these features are made possible because you will define one or more
central command structures that define your bot's commands.

## Basic Usage

Before we dive in, take a look at how you can register and handle a command with
the plugin:

```js
const myCommands = new CommandGroup();

myCommands.command("hello", "Say hello", (ctx) => ctx.reply(`Hello, world!`));

bot.use(myCommands);
```

This registers a new `/start` command to your bot that will be handled by the
given middleware.

Now, let's get into some of the extra tools this plugin has to offer.

## Importing

First of all, we need to import the `CommandGroup` class.

::: code-group

```ts [TypeScript]
import {
  CommandGroup,
  commands,
  type CommandsFlavor,
} from "@grammyjs/commands";
```

```js [JavaScript]
const { CommandGroup, commands } = require("@grammyjs/commands");
```

```ts [Deno]
import {
  CommandGroup,
  commands,
  type CommandsFlavor,
} from "https://deno.land/x/grammy_commands/mod.ts";
```

:::

Now that that's settled, let's see how we can make our commands visible to our
users.

## User Command Menu Setting

Once you defined your commands with an instance of the `CommandGroup` class, you
can call the `setCommands` method, which will register all the defined commands
to your bot.

```js
const myCommands = new CommandGroup();

myCommands.command("hello", "Say hello", (ctx) => ctx.reply("Hi there!"));
myCommands.command("start", "Start the bot", (ctx) => ctx.reply("Starting..."));

bot.use(myCommands);

await myCommands.setCommands(bot);
```

This will make it so every command you registered is displayed on the menu of a
private chat with your bot, or whenever users type `/` on a chat your bot is a
member of.

### Context Shortcut

What if you want some commands to be displayed only to certain users. For
example, imagine you have a `login` and a `logout` command. The `login` command
should only appear for logged out users, and vice versa. This is how you can do
that with the Commands plugin:

::: code-group

```ts [TypeScript]
// Use the flavor to create a custom context
type MyContext = Context & CommandsFlavor;

// Use the new context to instantiate your bot
const bot = new Bot<MyContext>("token");

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

This way when a user calls `/login`, they'll have their commands list changed to
contain only the `logout` command. Neat, right?

If you want to prevent, for example, the commands contained in
`loggedInCommands` from being callable after the user called `/logout`, you must
implement it in your handlers with your own business logic.

::: danger
As stated in the
[Telegram API documentation](https://core.telegram.org/bots/api#botcommand),
command names can only be form out of:

> 1-32 characters. Can contain only lowercase English letters, digits and
> underscores.

Therefore calling `setCommands` or `setMyCommands` with anything but
lower_c4s3_commands will throw an exception. Commands not following this rules
can still be registered, used and handled, but will never be displayed on the
user menu as such.
:::

**Be aware** that `SetCommands` and `SetMyCommands` only affects the commands
displayed in the user's commands menu, and not the actual access to them. You
will learn how to implement restricted command access in the
[Scoped Commands](#scoped-commands) section.

### Grouping Commands

Since we can split and group our commands into different instances, it allows
for a much more idiomatic command file organization.

Let say we want to have developer-only commands. We can achieve that with the
the following code structure:

```ascii
src/
├─ commands/
│  ├─ users.ts
│  ├─ admin.ts
├─ bot.ts
├─ types.d.ts
tsconfig.json
```

::: tip
We are assuming your `tsconfig` file is well-set to resolve the types
from `types.d.ts` and have resolved every necessary import.
:::

The following code group exemplifies how we could implement a developer only
command group, and update our Telegram client Command menu. Make sure you
inspect the `admin.ts` and `user.ts` file-tabs.

::: code-group

```ts [bot.ts]
import { devCommands } from "./commands/admin.ts";
import { userCommands } from "./commands/users.ts";

export const bot = new Bot<MyContext>("MyBotToken");

bot.use(commands());

bot.use(userCommands);
bot.use(devCommands);
```

```ts [admin.ts]
import { userCommands } from './users.ts'

export const devCommands = new CommandGroup<MyContext>()

devCommands.command('devlogin', 'Greetings', async (ctx, next) => {
   if (ctx.from?.id === ctx.env.DEVELOPER_ID) {
      await ctx.reply('Hi to me')
      await ctx.setMyCommands(userCommands, devCommands)
   } else next()
})

devCommands.command('usercount', 'Greetings', async (ctx, next) => {
   if (ctx.from?.id === ctx.env.DEVELOPER_ID) {
      await ctx.reply(
        `Active users: ${/** Your business logic */}`
    )
   } else next()
})

devCommands.command('devlogout', 'Greetings', async (ctx, next) => {
    if (ctx.from?.id === ctx.env.DEVELOPER_ID) {
       await ctx.reply('Bye to me')
       await ctx.setMyCommands(userCommands)
    } else next()
 })
```

```ts [users.ts]
export const userCommands = new CommandGroup<MyContext>();

userCommands.command("start", "Greetings", async (ctx) => {
  await ctx.reply("Hello user");
  await ctx.setMyCommands(userCommands);
});
```

```ts [types.d.ts]
type MyContext = Context & CommandsFlavor<MyContext>;
```

:::

Combining this knowledge with the following section will get your Command-game
to the next level.

## Scoped Commands

Did you know you can allow different commands to be shown on different chats
depending on the chat type, the language, and even the user status in a chat
group? That's what Telegram calls **Command Scopes**.

The `Command` class returned by the `command` method exposes a method called
`addToScope`. This method takes in a
[BotCommandScope](/ref/types/botcommandscope) together with one or more
handlers, and registers those handlers to be ran at that specific scope.

You don't even need to worry about calling `filter`, the `addToScope` method
will guarantee that your handler only gets called if the context is right.

Here's an example of a scoped command:

```js
const myCommands = new CommandGroup();

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

The `start` command can now be called from both private and group chats, and it
will give a different response depending on where it gets called from. Now if
you call `myCommands.setCommands`, the `start` command will be registered to
both private and group chats.

Heres an example of a command that's only accesible to group admins

```js
adminCommands
  .command("secret", "Admin only")
  .addToScope({
    type: "all_chat_administrators",
  }, async (ctx) => {
    await ctx.reply("Free cake!");
  });
```

::: tip
If you only want a command to be accesible on certain scopes, make sure
you do not add a handler in the first `MyCommands.command` call. Doing that will
automatically add it to all private chats, including groups.
:::

Here is an example of a command that's only accesible in groups

```js
myCommands
  .command(
    "fun",
    "Laugh",
    /** skip this handler */
  ).addToScope({
    type: "all_group_chats",
  }, async (ctx) => {
    await ctx.reply("Haha");
  });
```

## Command Translations

Another powerful feature is the ability to set different names for the same
command, and their respective descriptions based on the user language. The
Commands plugin makes that easy by providing the `localize` method. Check it
out:

```js
myCommands
  // You need to set a default name and description
  .command("hello", "Say hello")
  // And then you can set the localized ones
  .localize("pt", "ola", "Dizer olá");
```

Add as many as you want! The plugin will take care of registering them for you
when you call `myCommands.setCommands`.

For convenience the types package exports a `LanguageCodes` enum-like object,
that you can use for a more idiomatic approach:

::: code-group

```ts [TypeScript]
import { LanguageCodes } from "@grammyjs/types";

myCommands.command(
  "chef",
  "Steak delivery",
  async (ctx) => await ctx.reply("Steak on the plate!"),
)
  .localize(
    LanguageCodes.Spanish,
    "cocinero",
    "Bife a domicilio",
  );
```

```js [JavaScript]
const { LanguageCodes } = require("@grammyjs/types");

myCommands.command(
  "chef",
  "Steak delivery",
  async (ctx) => await ctx.reply("Steak on the plate!"),
)
  .localize(
    LanguageCodes.Spanish,
    "cocinero",
    "Bife a domicilio",
  );
```

```ts [Deno]
import { LanguageCodes } from "https://deno.land/x/grammy_types/mod.ts";

myCommands.command(
  "chef",
  "Steak delivery",
  async (ctx) => await ctx.reply("Steak on the plate!"),
)
  .localize(
    LanguageCodes.Spanish,
    "cocinero",
    "Bife a domicilio",
  );
```

:::

### Combo with i18n

If you are looking to have your localized command names and descriptions bundle
inside your `.ftl` files, you could make use of the following idea:

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

Even though Telegram is capable of auto completing the registered commands,
sometimes users do type them manually and, in some cases, happen to make
mistakes. The Commands plugin helps you deal with that by allowing you to
suggest a command that might be what the user wanted in the first place. It is
compatible with custom prefixes, so you don't have to worry about that, and its
usage is quite straight-forward:

::: code-group

```ts [TypeScript]
import { commandNotFound } from "@grammyjs/commands";

// Use the flavor to create a custom context
type MyContext = Context & CommandsFlavor;

// Use the new context to instantiate your bot
const bot = new Bot<MyContext>("token");

// Register the plugin
bot.use(commands());

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
// Register the context shortcut
bot.use(commands());

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

Behind the scenes, `commandNotFound` will use the `getNearestCommand` context
method which by default will prioritize commands that correspond to the user
language. If you want to opt-out of this behavior, you can pass the
`ignoreLocalization` flag set to true.

It is possible to search across multiple CommandGroup instances, and
`ctx.commandSuggestion` will be the most similar command, if any, across them
all.

It also allows to set the `ignoreCase` flag, which will ignore casing while
looking for a similar command and the `similarityThreshold` flag, which controls
how similar a command name has to be to the user input for it to be recommended.

The `commandNotFound` function will only trigger for updates which contains
command-like-text similar to your registered commands. For example, if you only
have register [commands with custom prefixes](#prefix) `?` and `supercustom`, it
will trigger the handle for anything that looks like your commands, e.g:
`?sayhi` or `supercustomhi`, but no `/definitely_a_command`. Same goes the other
way, if you only have commands with the default prefix, it will only trigger on
updates that looks like `/regular /commands`.

The recommended commands will only come from the `CommandGroup` instances you
pass to the function. So you could defer the checks into multiple, separate
filters.

Let's use the previous knowledge to inspect the next example:

```js
const myCommands = new CommandGroup();
myCommands.command("dad", "calls dad", () => {}, { prefix: "?" })
  .localize("es", "papa", "llama a papa")
  .localize("fr", "pere", "appelle papa");

const otherCommands = new CommandGroup();
otherCommands.command("bread", "eat a toast", () => {})
  .localize("es", "pan", "come un pan")
  .localize("fr", "pain", "manger du pain");

// Register Each

// Let's assume the user is french and typed /Papi
bot
  // this filter will trigger for any command-like as '/regular' or '?custom'
  .filter(commandNotFound([myCommands, otherCommands], {
    ignoreLocalization: true,
    ignoreCase: true,
  }))
  .use(async (ctx) => {
    ctx.commandSuggestion === "?papa"; // evaluates to true

    /* if the ignoreLocalization was falsy instead
     * we would have gotten:
     * ctx.commandSuggestion equals "/pain"
     */
  });

/* We could add more filters like the above,
 * with different parameters or CommandGroups to check against
 */
```

There is a lot of possibilities!

## Command Options

There are a few options that can be specified per command, per scope, or
globally for a `CommandGroup` instance. These options allow you to further
customize how your bot handles commands, giving you more flexibility.

### ignoreCase

By default commands will match the user input in a case-sensitive manner. Having
this flag set, for example, in a command named `/dandy` will match `/DANDY` the
same as `/dandY` or any other case-only variation.

### targetedCommands

When users invoke a command, they can optionally tag your bot, like so:
`/command@bot_username`. You can decide what to do with these commands by using
the `targetedCommands` config option. With it you can choose between three
different behaviors:

- `ignored`: Ignores commands that mention your bot's user
- `optional`: Handles both commands that do and that don't mention the bot's
  user
- `required`: Only handles commands that mention the bot's user

### prefix

Currently, only commands starting with `/` are recognized by Telegram and, thus,
by the [command handling done by the grammY core library](../guide/commands). In
some occasions, you might want to change that and use a custom prefix for your
bot. That is made possible by the `prefix` option, which will tell the Commands
plugin to look for that prefix when trying to identify a command.

If you ever need to retrieve `botCommand` entities from an update and need them
to be hydrated with the custom prefix you have registered, there is a method
specifically tailored for that, called `ctx.getCommandEntities(yourCommands)`.
It returns the same interface as `ctx.entities('bot_command')`

:::tip
Commands with custom prefixes cannot be shown in the Commands Menu.
:::

### matchOnlyAtStart

When [handling commands](../guide/commands), the grammY core library will only
recognize commands that start on the first character of a message. The Commands
plugin, however, allows you to listen for commands in the middle of the message
text, or in the end, it doesn't matter! All you have to do is set the
`matchOnlyAtStart` option to `false`, and the rest will be done by the plugin.

## RegExp Commands

This feature is for those who are really looking to go wild, it allows you to
create command handlers based on Regular Expressions instead of static strings,
a basic example would look like:

```js
myCommands
  .command(
    /delete_([a-zA-Z]{1,})/,
    (ctx) => ctx.reply(`Deleting ${ctx.message?.text?.split("_")[1]}`),
  );
```

This command handler will trigger on `/delete_me` the same as in `/delete_you`,
and it will reply `Deleting me` in the first case and `Deleting you` in the
later, but will not trigger on `/delete_` nor `/delete_123xyz`, passing trough
as if it wasn't there.

You can use custom prefixes and localize them as usual.

## Plugin Summary

- Name: `commands`
- [Source](https://github.com/grammyjs/commands)
- [Reference](/ref/commands/)
- [Telegram Docs commands reference](https://core.telegram.org/bots/features#commands)
