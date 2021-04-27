---
prev: ./getting-started.md
next: ./context.md
---

# Sending and receiving messages

As soon as you started your bot with `bot.start()`, grammY will supply your listeners with the messages that users send to your bot.
grammY also provides methods to easily reply to these messages.

## Receiving messages

The easiest way to listen for messages is via

```ts
bot.on("message", (ctx) => {
  const message = ctx.message; // message object
});
```

However, there are a number of other ways to filter for messages, too.

```ts
// Handles commands, such as /start
bot.command('start', (ctx) => { ... });

// Matches the message text against a string or a regular expression
bot.hears(/echo *(.+)?/, (ctx) => { ... });
```

You can use auto-complete in your editor to see all available options, or check out [all methods](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#Bot) of the `Bot` class.

> [Read more](./filter-queries.md) about filtering for specific message types with `bot.on()`.

## Sending messages

[All methods that bots can use](https://core.telegram.org/bots/api#available-methods) are available on the `bot.api` object.

```ts
// Send a text message to user 12345
await bot.api.sendMessage(12345, 'Hi!')

// Get information about the bot itself
const me = await bot.api.getMe()

// etc
```

You can use auto-complete in your editor to see all available options, or check out [all methods](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#Api) of the `Api` class.

Check out the [next section](./context.md) to learn how the context object of a listener makes sending messages a breeze!
