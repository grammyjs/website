# Inline Queries

With inline queries, users can search for, browse, and send content suggested by your bot in any chat, even if it is not a member there.
To do this, they start a message with `@your_bot_name` and choose one of the results.

> Revisit the Inline mode section in the [Telegram Bot Features](https://core.telegram.org/bots/features#inline-requests) written by the Telegram team.
> Further resources are their [detailed description](https://core.telegram.org/bots/inline) of inline bots, as well as the [original blog post](https://telegram.org/blog/inline-bots) announcing the feature, and the Inline mode section in the [Telegram Bot API Reference](https://core.telegram.org/bots/api#inline-mode).
> They are all worth a read before implementing inline queries for your bot.

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

// Listen for any inline query
bot.on("inline_query", async (ctx) => {
  const query = ctx.inlineQuery.query; // query string
});
```

Now that we know how to listen for inline query updates, we can answer them with a result list.

## Building Inline Query Results

Building result lists for inline queries is a tedious task because you need to construct [complex nested objects](https://core.telegram.org/bots/api#inlinequeryresult) with a variety of properties.
Fortunately, you are using grammY, and of course there are helpers that make this task very simple.

Every result needs a unique string identifier of the result, a title which is displayed in the results, and the actual message text that will be sent.

::::code-group
:::code-group-item TypeScript

```ts
import { InlineQueryResultBuilder } from "grammy";

// Build one result for now. Articles are text messages.
const result = InlineQueryResultBuilder.article(
  "id-0",
  "Success!",
  "This message was sent via your bot",
);
```

:::
::: code-group-item JavaScript

```js
const { InlineQueryResultBuilder } = require("grammy");

// Build one result for now. Articles are text messages.
const result = InlineQueryResultBuilder.article(
  "id-0",
  "Success!",
  "This message was sent via your bot",
);
```

:::
:::code-group-item Deno

```ts
import { InlineQueryResultBuilder } from "https://deno.land/x/grammy/mod.ts";

// Build one result for now. Articles are text messages.
const result = InlineQueryResultBuilder.article(
  "id-0",
  "Success!",
  "This message was sent via your bot",
);
```

:::
::::

Optionally, you can pass many more options such as a description for display in the result list, or an [inline keyboard](./keyboard.md#inline-keyboards) that will be attached to the sent message.

```ts
const result = InlineQueryResultBuilder.article(
  "id-0",
  "Success!",
  "This message was sent via your bot",
  {
    description: "Pick me.",
    reply_markup: new InlineKeyboard()
      .switchInline("Spread the word!"),
  },
);
```

In addition, you can send many more types of messages---not just text messages.
The respective methods are called `InlineQueryResultBuilder.photo`, `InlineQueryResultBuilder.audio`, and so on.

```ts
// Result for an audio file sent via file identifier.
const audioFileId = "AgADBAADZRAxGyhM3FKSE4qKa-RODckQHxsoABDHe0BDC1GzpGACAAEC";
InlineQueryResultBuilder.audioCached("id-0", audioFileId);
```

> Read more about file identifiers [here](../guide/files.md#how-files-work-for-telegram-bots).

You should check out the [API reference](https://deno.land/x/grammy/mod.ts?s=InlineQueryResultBuilder) of `InlineQueryResultBuilder` and maybe also the [specification](https://core.telegram.org/bots/api#inlinequeryresult) of `InlineQueryResult` to see all available options.

## Answering Inline Queries

After generating an array of inline query results using the [above](#building-inline-query-results) builder, you can call `answerInlineQuery` to send these results to the user.

```ts
// Shameless self-advertising in one project's documentation
// is the best kind of advertising.
bot.inlineQuery(/best bot (framework|library)/, async (ctx) => {
  // Define message content.
  const content = {
    message_text:
"<b>grammY</b> is the best way to create your own Telegram bots. \
They even have a pretty website! 👇",
    parse_mode: "HTML",
  };
  // Define an inline keyboard with a URL button.
  const keyboard = new InlineKeyboard()
    .url("grammY website", "https://grammy.dev/");

  // Create a single inline query result.
  const result = InlineQueryResultBuilder.article(
    "id:grammy-website",
    "grammY",
    content,
    { reply_markup: keyboard },
  );

  // Answer the inline query.
  await ctx.answerInlineQuery(
    [result], // answer with result list
    { cache_time: 30 * 24 * 3600 }, // one month in seconds
  );
});

// Return empty result list for other queries.
bot.on("inline_query", (ctx) => ctx.answerInlineQuery([]));
```

[Remember](./basics.md#sending-messages) that you can always specify further options when calling API methods by using the options object of type `Other`.
For example, `answerInlineQuery` allows you to perform pagination for inline queries via an offset, as you can see [here](https://core.telegram.org/bots/api#answerinlinequery).

:::tip Mixing Text and Media
While it is allowed to send a result lists that contain both media and text elements, most Telegram client do not render them very well.
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
The start parameter will be available via [deep linking](../guide/commands.md#deep-linking-support).

If you then send an [inline keyboard](./keyboard.md#building-a-custom-keyboard) with a `switchInline` button, the user will be returned to the chat where they pressed the inline query results button initially.

```ts
bot
  .command("start")
  .filter((ctx) => ctx.match === "login", async (ctx) => {
    // User is coming from inline query results
    await ctx.reply("DM open, you can go back now!", {
      reply_markup: new InlineKeyboard()
        .switchInline("Go back"),
    });
  });
```

That way, you can perform e.g. login procedures in a private chat with the user before delivering inline query results.
The dialogue can go back and forth a bit before you send them back.
For example, you can [enter a short conversation](./conversations.md#installing-and-entering-a-conversation) with the conversations plugin.

## Getting Feedback About Chosen Results

Inline query results are delivered in a fire-and-forget fashion.
In other words, after your bot sent the list of inline query results to Telegram, it will not know which result the user picked (or if they picked one at all).

If you are interested in this, you can enable inline feedback with [@BotFather](https://t.me/grammyjs).
You can decide how much feedback you want to receive by chosing among several options between 0 % (feedback disabled) and 100 % (receive feedback for every chosen inline result).

Inline feedback is delivered via `chosen_inline_result` updates.
You can listen for specific result identifiers via string or regular expression.
Naturally, you can also listen for the updates the normal way via filter queries.

```ts
// Listen for specific result identifiers.
bot.chosenInlineQuery(/id-[0-9]+/, async (ctx) => {
  const match = ctx.match; // regex match object
  const query = ctx.chosenInlineResult.query; // used inline query
});

// Listen for any chosen inline results.
bot.on("chosen_inline_result", async (ctx) => {
  const query = ctx.chosenInlineResult.query; // used inline query
});
```

Some bots set the feedback to 100 % and use it as a hack.
They deliver dummy message content with no real content in `answerInlineQuery`.
Immediately after receiving a `chosen_inline_result` update, they edit the respective message and inject the real message content.

These bots will not work for anonymous admins or when sending scheduled messages as no inline feedback can be received there.
However, if this is not a problem for you, then this hack will allow you to not have to generate a lot of message content for messages that never end up being sent.
This can save your bot resources.
