---
prev: ./filter-queries.md
next: ./middleware.md
---

# Commands

Commands are special entities in Telegram messages, that serve as instructions for bots.

## Usage

> Revisit the commands section in the [Introduction for Developers](https://core.telegram.org/bots#commands) written by the Telegram team.

grammY provides special handling for commands (e.g. `/start` and `/help`).
You can directly register listeners for certain commands via `bot.command()`.

```ts
// Respond to the command /start.
bot.command("start" /* , ... */);
// Respond to the command /help.
bot.command("help" /* , ... */);
// Respond to the commands /a, /b, /c, and /d.
bot.command(["a", "b", "c", "d"] /* , ... */);
```

Note that only those commands that are in the beginning of a message are handled, so if a user sends `'Please do not send /start to that bot!'`, then your listener will not be called, even though the `/start` command _is_ contained in the message.

Telegram supports sending targeted commands to bots, i.e. commands that end with `@your_bot_name`.
grammY handles this automatically for you, so `bot.command('start')` will match messages with `/start` and with `/start@your_bot_name` as commands.
You can choose to match only targeted commands by specifying `bot.command('start@your_bot_name')`.

::: tip Suggest Commands to Users
You can call

```ts
await bot.api.setMyCommands([
  { command: "start", description: "Start the bot" },
  { command: "help", description: "Show help text" },
  { command: "settings", description: "Open settings" },
]);
```

to make Telegram clients display a list of suggested commands in the text input field.

Alternatively, you can configure this by talking to [@BotFather](https://t.me/BotFather).
:::

## Arguments

Users can send **arguments** along with their commands.
You can access the argument string via `ctx.match`.

```ts
bot.command("add", (ctx) => {
  // `item` will be 'apple pie' if a user sends '/add apple pie'.
  const item = ctx.match;
});
```

Note that you can always access the entire message's text via `ctx.msg.text`.

## Deep Linking Support

> Revisit the deep linking section in the [Introduction for Developers](https://core.telegram.org/bots#deep-linking) written by the Telegram team.

When a user visits `https://t.me/your_bot_name?start=payload`, their Telegram client will show a START button that (when clicked) sends the string from the URL parameter along with the message, in this example, the message text will be `'/start payload'`.
Telegram clients will not show the payload to the user (they will only see `'/start'` in the UI), however, your bot will receive it.
grammY extracts this payload for you, and provides it under `ctx.match`.
In our example, `ctx.match` would contain the string `'payload'`.

Deep linking is useful if you want to build a referral system, or track where users discovered your bot.
For example, your bot could send a channel post with an [inline query](/plugins/keyboard.html#inline-keyboards) button.
The button contains a URL like the one above, e.g. `https://t.me/your_bot_name?start=awesome-channel-post-12345`.
When a user clicks on the button underneath the post, their Telegram client will open a chat with your bot, and display the START button as described above.
This way, your bot can identify where a user came from, and that they clicked the button underneath a specific channel post.

Naturally, you can also embed such links anywhere else: on the web, in messages, in QR codes, etc.
