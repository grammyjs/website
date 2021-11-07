---
prev: ./errors.md
next: ./files.md
---

# Inline Queries

With inline queries, users can search for, browse, and send content suggested by your bot in any chat, even if it is not a member there.
To do this, they start a message with `@your_bot_name` and choose one of the results.

::: tip Enable Inline Mode
By default, support for inline mode is disabled. You must contact [@BotFather](https://t.me/BotFather) and enable inline mode for your bot, to start receiving inline queries.
:::

> Revisit the Inline mode section in the [Introduction for Developers](https://core.telegram.org/bots#inline-mode) written by the Telegram team.
> Further resources are their [detailed description](https://core.telegram.org/bots/inline) of inline bots, as well as the [original blog post](https://telegram.org/blog/inline-bots) announcing the feature, and the Inline mode section in the [Telegram Bot API Reference](https://core.telegram.org/bots/api#inline-mode).
> They are all worth a read before implementing inline queries for your bot.

Once a user triggers an inline query, i.e. starts a message by typing “@your_bot_name ...” in the text input field, your bot will receive updates about this.
grammY has special support for handling inline queries via the `bot.inlineQuery()` method, as documented on the `Composer` class in the [grammY API Reference](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#Composer).
It allows you to listen for specific inline queries that match strings or regular expressions.
If you want to handle all inline queries generically, use `bot.on('inline_query')`.

```ts
// Shameless self-advertising in a project's documentation
// is the best kind of advertising
bot.inlineQuery(/best bot (framework|library)/, async (ctx) => {
  await ctx.answerInlineQuery(
    [
      {
        type: "article",
        id: "grammy-website",
        title: "grammY",
        input_message_content: {
          message_text:
"<b>grammY</b> is the best way to create your own Telegram bots. \
They even have a pretty website! 👇",
          parse_mode: "HTML",
        },
        reply_markup: new InlineKeyboard().url(
          "grammY website",
          "https://grammy.dev/",
        ),
        url: "https://grammy.dev/",
        description: "The Telegram Bot Framework.",
      },
    ],
    { cache_time: 30 * 24 * 3600 }, // one month in seconds
  );
});

// Return empty result list for other queries
bot.on("inline_query", (ctx) => ctx.answerInlineQuery([]));
```

Remember that grammY can auto-complete all of the fields in the above structure for you.
Also, be sure to check out the exact specifications for inline results in the [Telegram Bot API Reference](https://core.telegram.org/bots/api#inlinequeryresult).
