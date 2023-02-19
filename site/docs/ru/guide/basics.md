---
prev: ./getting-started.md
next: ./context.md
---

# Sending and Receiving Messages

As soon as you start your bot with `bot.start()`, grammY will supply your listeners with the messages that users send to your bot.
grammY also provides methods to easily reply to these messages.

## Receiving Messages

The easiest way to listen for messages is via

```ts
bot.on("message", (ctx) => {
  const message = ctx.message; // the message object
});
```

However, there are a number of other options, too.

```ts
// Handles commands, such as /start.
bot.command("start", (ctx) => {/* ... */});

// Matches the message text against a string or a regular expression.
bot.hears(/echo *(.+)?/, (ctx) => {/* ... */});
```

You can use auto-complete in your code editor to see all available options, or check out [all methods](https://deno.land/x/grammy/mod.ts?s=Composer) of the `Composer` class.

> [Read more](./filter-queries.md) about filtering for specific message types with `bot.on()`.

## Sending Messages

All methods that bots can use (**[important list](https://core.telegram.org/bots/api#available-methods)**) are available on the `bot.api` object.

```ts
// Send a text message to user 12345.
await bot.api.sendMessage(12345, "Hi!");
// Optionally, you can pass an options object.
await bot.api.sendMessage(12345, "Hi!", {/* more options */});

// Get information about the bot itself.
const me = await bot.api.getMe();

// etc
```

Every method takes an optional options object of type `Other`, which allows you to set further options for your API calls.
These options objects correspond exactly with the options that you can find in list of methods linked above.
You can also use auto-complete in your code editor to see all available options, or check out [all methods](https://deno.land/x/grammy/mod.ts?s=Api) of the `Api` class.
The rest of this page shows some examples for this.

Also, check out the [next section](./context.md) to learn how the context object of a listener makes sending messages a breeze!

## Sending Messages With Reply

You can use the Telegram reply-to feature by specifying the message identifier to reply to using `reply_to_message_id`.

```ts
bot.hears("ping", async (ctx) => {
  // `reply` is an alias for `sendMessage` in the same chat (see next section).
  await ctx.reply("pong", {
    // `reply_to_message_id` specifies the actual reply feature.
    reply_to_message_id: ctx.msg.message_id,
  });
});
```

> Note that only sending a message via `ctx.reply` does **NOT** mean you are automatically replying to anything.
> Instead, you should specify `reply_to_message_id` for this.
> The function `ctx.reply` is just an alias for `ctx.api.sendMessage`, see the [next section](./context.md#available-actions).

## Sending Message With Formatting

> Check out the [section about formatting options](https://core.telegram.org/bots/api#formatting-options) in the Telegram Bot API Reference written by the Telegram team.

You can send messages with **bold** or _italic_ text, use URLs, and more.
There are two ways to do this, as described in the [section about formatting options](https://core.telegram.org/bots/api#formatting-options), namely Markdown and HTML.

### Markdown

> Also see <https://core.telegram.org/bots/api#markdownv2-style>

Send your message with markdown in the text, and specify `parse_mode: "MarkdownV2"`.

```ts
await bot.api.sendMessage(
  12345,
  "*Hi\\!* _Welcome_ to [grammY](https://grammy.dev)\\.",
  { parse_mode: "MarkdownV2" },
);
```

### HTML

> Also see <https://core.telegram.org/bots/api#html-style>

Send your message with HTML elements in the text, and specify `parse_mode: "HTML"`.

```ts
await bot.api.sendMessage(
  12345,
  '<b>Hi!</b> <i>Welcome</i> to <a href="https://grammy.dev">grammY</a>.',
  { parse_mode: "HTML" },
);
```

## Sending Files

File handling is explained in greater depth in a [later section](./files.md#sending-files).

## Force Reply

> This can be useful if your bot is running in [privacy mode](https://core.telegram.org/bots/features#privacy-mode) in group chats.

When you send a message, you can make the user's Telegram client automatically specify the message as reply.
That means that the user will reply to your bot's message automatically (unless they remove the reply manually).
As a result, your bot will receive the user's message even when running in [privacy mode](https://core.telegram.org/bots/features#privacy-mode) in group chats.

You can force a reply like this:

```ts
bot.command("start", async (ctx) => {
  await ctx.reply("Hi! I can only read messages that explicitly reply to me!", {
    // Make Telegram clients automatically show a reply interface to the user.
    reply_markup: { force_reply: true },
  });
});
```
