---
prev: false
next: false
---

# Inline Queries (built-in)

With inline queries, users can search for, browse, and send content suggested by your bot in any chat, even if it is not a member there.
To do this, they start a message with `@your_bot_name` and choose one of the results.

> Revisit the Inline mode section in the [Telegram Bot Features](https://core.telegram.org/bots/features#inline-requests) written by the Telegram team.
> Further resources are their [detailed description](https://core.telegram.org/bots/inline) of inline bots, as well as the [original blog post](https://telegram.org/blog/inline-bots) announcing the feature, and the Inline mode section in the [Telegram Bot API Reference](https://core.telegram.org/bots/api#inline-mode).
> They are all worth a read before implementing inline queries for your bot, as inline queries are a little advanced.
> If you do not feel like reading all of that, then rest assured that this page will walk you through every step.

## Enabling Inline Mode

By default, support for inline mode is disabled for your bot.
You must contact [@BotFather](https://t.me/BotFather) and enable inline mode for your bot to start receiving inline queries.

Got it?
Your Telegram client should now display "..." when you type the bot name in any text field, and show a loading spinner.
You can already start typing something.
Let us now see how your bot can handle these queries.

## Handling Inline Queries

Once a user triggers an inline query, i.e. starts a message by typing "@your_bot_name ..." in the text input field, your bot will receive updates about this.
grammY has special support for handling inline queries via the `bot.inlineQuery()` method, as documented on the `Composer` class in the [grammY API Reference](https://deno.land/x/grammy/mod.ts?s=Composer#method_inlineQuery_0).
It allows you to listen for specific inline queries that match strings or regular expressions.
If you want to handle all inline queries generically, use `bot.on("inline_query")`.

```ts
// Listen for specific strings or regular expressions.
bot.inlineQuery(/best bot (framework|library)/, async (ctx) => {
  const match = ctx.match; // regex match object
  const query = ctx.inlineQuery.query; // query string
});

// Listen for any inline query.
bot.on("inline_query", async (ctx) => {
  const query = ctx.inlineQuery.query; // query string
});
```

Now that we know how to listen for inline query updates, we can answer them with a result list.

## Building Inline Query Results

Building result lists for inline queries is a tedious task because you need to construct [complex nested objects](https://core.telegram.org/bots/api#inlinequeryresult) with a variety of properties.
Fortunately, you are using grammY, and of course there are helpers that make this task very simple.

Every result needs three things.

1. A unique string identifier.
2. A _result object_ that describes how to display the inline query result.
   It can contain things like a title, a link, or an image.
3. A _message content object_ that describes the content of the message which will be sent by the user if they pick this result.
   In some cases, the message content can be inferred implicitly from the result object.
   For example, if you want your result to be displayed as a GIF, then Telegram will understand that the message content will be that same GIF---unless you specify a message content object.

grammY exports a builder for inline query results, named `InlineQueryResultBuilder`.
Here are some examples for its usage.

::: code-group

```ts [TypeScript]
import { InlineKeyboard, InlineQueryResultBuilder } from "grammy";

// Build a photo result.
InlineQueryResultBuilder.photo("id-0", "https://grammy.dev/images/Y.jpeg");

// Build a result that displays a photo but sends a text message.
InlineQueryResultBuilder.photo("id-1", "https://grammy.dev/images/Y.jpeg")
  .text("This text will be sent instead of the photo");

// Build a text result.
InlineQueryResultBuilder.article("id-2", "Inline Queries")
  .text("Great inline query docs: grammy.dev/plugins/inline-query");

// Pass further options to the result.
const keyboard = new InlineKeyboard()
  .text("Aw yis", "call me back");
InlineQueryResultBuilder.article("id-3", "Hit me", { reply_markup: keyboard })
  .text("Push my buttons");

// Pass further options to the message content.
InlineQueryResultBuilder.article("id-4", "Inline Queries")
  .text("**Outstanding** docs: grammy.dev", { parse_mode: "MarkdownV2" });
```

```js [JavaScript]
const { InlineKeyboard, InlineQueryResultBuilder } = require("grammy");

// Build a photo result.
InlineQueryResultBuilder.photo("id-0", "https://grammy.dev/images/Y.jpeg");

// Build a result that displays a photo but sends a text message.
InlineQueryResultBuilder.photo("id-1", "https://grammy.dev/images/Y.jpeg")
  .text("This text will be sent instead of the photo");

// Build a text result.
InlineQueryResultBuilder.article("id-2", "Inline Queries")
  .text("Great inline query docs: grammy.dev/plugins/inline-query");

// Pass further options to the result.
const keyboard = new InlineKeyboard()
  .text("Aw yis", "call me back");
InlineQueryResultBuilder.article("id-3", "Hit me", { reply_markup: keyboard })
  .text("Push my buttons");

// Pass further options to the message content.
InlineQueryResultBuilder.article("id-4", "Inline Queries")
  .text("**Outstanding** docs: grammy.dev", { parse_mode: "MarkdownV2" });
```

```ts [Deno]
import {
  InlineKeyboard,
  InlineQueryResultBuilder,
} from "https://deno.land/x/grammy/mod.ts";

// Build a photo result.
InlineQueryResultBuilder.photo("id-0", "https://grammy.dev/images/Y.jpeg");

// Build a result that displays a photo but sends a text message.
InlineQueryResultBuilder.photo("id-1", "https://grammy.dev/images/Y.jpeg")
  .text("This text will be sent instead of the photo");

// Build a text result.
InlineQueryResultBuilder.article("id-2", "Inline Queries")
  .text("Great inline query docs: grammy.dev/plugins/inline-query");

// Pass further options to the result.
const keyboard = new InlineKeyboard()
  .text("Aw yis", "call me back");
InlineQueryResultBuilder.article("id-3", "Hit me", { reply_markup: keyboard })
  .text("Push my buttons");

// Pass further options to the message content.
InlineQueryResultBuilder.article("id-4", "Inline Queries")
  .text("**Outstanding** docs: grammy.dev", { parse_mode: "MarkdownV2" });
```

:::

Note that if you want to send files via existing file identifiers, you should use the `*Cached` methods.

```ts
// Result for an audio file sent via file identifier.
const audioFileId = "AgADBAADZRAxGyhM3FKSE4qKa-RODckQHxsoABDHe0BDC1GzpGACAAEC";
InlineQueryResultBuilder.audioCached("id-0", audioFileId);
```

> Read more about file identifiers [here](../guide/files#how-files-work-for-telegram-bots).

You should check out the [API reference](https://deno.land/x/grammy/mod.ts?s=InlineQueryResultBuilder) of `InlineQueryResultBuilder` and maybe also the [specification](https://core.telegram.org/bots/api#inlinequeryresult) of `InlineQueryResult` to see all available options.

## Answering Inline Queries

After generating an array of inline query results using the [above](#building-inline-query-results) builder, you can call `answerInlineQuery` to send these results to the user.

```ts
// Shameless self-advertisement in one project's documentation
// is the best kind of advertisement.
bot.inlineQuery(/best bot (framework|library)/, async (ctx) => {
  // Create a single inline query result.
  const result = InlineQueryResultBuilder
    .article("id:grammy-website", "grammY", {
      reply_markup: new InlineKeyboard()
        .url("grammY website", "https://grammy.dev/"),
    })
    .text(
      `<b>grammY</b> is the best way to create your own Telegram bots.
They even have a pretty website! 👇`,
      { parse_mode: "HTML" },
    );

  // Answer the inline query.
  await ctx.answerInlineQuery(
    [result], // answer with result list
    { cache_time: 30 * 24 * 3600 }, // 30 days in seconds
  );
});

// Return empty result list for other queries.
bot.on("inline_query", (ctx) => ctx.answerInlineQuery([]));
```

[Remember](../guide/basics#sending-messages) that you can always specify further options when calling API methods by using the options object of type `Other`.
For example, `answerInlineQuery` allows you to perform pagination for inline queries via an offset, as you can see [here](https://core.telegram.org/bots/api#answerinlinequery).

::: tip Mixing Text and Media
While it is allowed to send a result lists that contain both media and text elements, most Telegram clients do not render them very well.
From a user experience point of view, you should avoid them.
:::

## Button Above Inline Query Results

Telegram clients are able to [show a button](https://core.telegram.org/bots/api#inlinequeryresultsbutton) above the result list.
This button can take the user to the private chat with the bot.

```ts
const button = {
  text: "Open private chat",
  start_parameter: "login",
};
await ctx.answerInlineQuery(results, { button });
```

When the user presses the button, a `/start` command message will be sent to your bot.
The start parameter will be available via [deep linking](../guide/commands#deep-linking-support).
In other words, using the above code snippet, `ctx.match` will have the value `"login"` in your command handler.

If you then send an [inline keyboard](./keyboard#building-a-custom-keyboard) with a `switchInline` button, the user will be returned to the chat where they pressed the inline query results button initially.

```ts
bot
  .command("start")
  .filter((ctx) => ctx.match === "login", async (ctx) => {
    // User is coming from inline query results.
    await ctx.reply("DM open, you can go back now!", {
      reply_markup: new InlineKeyboard()
        .switchInline("Go back"),
    });
  });
```

That way, you can perform e.g. login procedures in a private chat with the user before delivering inline query results.
The dialogue can go back and forth a bit before you send them back.
For example, you can [enter a short conversation](./conversations#installing-and-entering-a-conversation) with the conversations plugin.

## Getting Feedback About Chosen Results

Inline query results are delivered in a fire-and-forget fashion.
In other words, after your bot sent the list of inline query results to Telegram, it will not know which result the user picked (or if they picked one at all).

If you are interested in this, you can enable inline feedback with [@BotFather](https://t.me/BotFather).
You can decide how much feedback you want to receive by chosing among several options between 0 % (feedback disabled) and 100 % (receive feedback for every chosen inline result).

Inline feedback is delivered via `chosen_inline_result` updates.
You can listen for specific result identifiers via string or regular expression.
Naturally, you can also listen for the updates the normal way via filter queries.

```ts
// Listen for specific result identifiers.
bot.chosenInlineResult(/id-[0-9]+/, async (ctx) => {
  const match = ctx.match; // regex match object
  const query = ctx.chosenInlineResult.query; // used inline query
});

// Listen for any chosen inline results.
bot.on("chosen_inline_result", async (ctx) => {
  const query = ctx.chosenInlineResult.query; // used inline query
});
```

Some bots set the feedback to 100 % and use it as a hack.
They deliver dummy messages with no real content in `answerInlineQuery`.
Immediately after receiving a `chosen_inline_result` update, they edit the respective message and inject the real message content.

These bots will not work for anonymous admins or when sending scheduled messages, as no inline feedback can be received there.
However, if this is not a problem for you, then this hack will allow you to not have to generate a lot of message content for messages that never end up being sent.
This can save your bot resources.

## Plugin Summary

This plugin is built-in into the core of grammY.
You don't need to install anything to use it.
Simply import everything from grammY itself.

Also, both the documentation and the API reference of this plugin are unified with the core package.
