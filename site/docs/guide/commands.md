---
prev: ./filter-queries.md
next: ./middleware.md
---

# Commands

Commands are special entities in the Telegram messages that serve as instructions for bots.

## Usage

> Revisit the commands section in the [Introduction for Developers](https://core.telegram.org/bots#commands) written by the Telegram team.

grammY provides special handling for commands (e.g. `/start` and `/help`).
You can directly register listeners for certain commands via `bot.command()`.

```ts
// React to /start commands
bot.command("start" /* ... */);
// React to /help commands
bot.command("help" /* ... */);
// React to /a, /b, /c, and /d commands
bot.command(["a", "b", "c", "d"] /* ... */);
```

Note that only those commands are handled that are in the beginning of the message, so if a user sends `'Please do not send /start to that bot!'`, then your listener will not be called, even though the `/start` command is contained in the message.

Telegram supports sending directed commands to bots, i.e. commands that end on `@your_bot_name`.
grammY handles this automatically for you, so `bot.command('start')` will match messages with `/start` and with `/start@your_bot_name` as commands.
You can still match only directed commands by specifying `bot.command('start@your_bot_name')`.

::: tip Suggest commands to users
You can call

```ts
await bot.api.setMyCommands([
  { command: "start", description: "Starts the bot" },
  { command: "help", description: "Show help text" },
  { command: "settings", description: "Open settings" },
]);
```

to make Telegram clients display a list of suggested commands in the text field.

Alternatively, you can configure this when talking to [@BotFather](https://telegram.me/BotFather).
:::

## Arguments

Users can send **arguments** along with their commands.
You can access the argument string via `ctx.match`.

```ts
bot.command("add", (ctx) => {
  // `item` will be 'apple pie' if a user sends '/add apple pie'
  const item = ctx.match;
});
```

Note that you can always access the entire message's text via `ctx.msg.text`.

## Deep linking support

> Revisit the deep linking section in the [Introduction for Developers](https://core.telegram.org/bots#deep-linking) written by the Telegram team.

When a user visits `https://t.me/your_bot_name?start=payload`, then the Telegram client will offer a START button that sends the string from the URL parameter along the message, in this example, `'payload'`.
This payload is not going to be displayed in the UI of the Telegram clients, however, your bot can receive it.
grammY extracts this data for you, and provides it under `ctx.match`.
In our example, `ctx.match` would contain the string `'payload'`.
