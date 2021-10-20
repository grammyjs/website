---
prev: ./errors.md
next: ./files.md
---

# Inline Queries

Users can type `@your_bot_name` in a text field, and query your bot for suggestions.
If they pick one of the options you specify, your bot can send a single message in a chat of which it need not be a member.

Note that you have to enable inline mode for you bot by contacting [@BotFather](https://telegram.me/BotFather) first.

> Revisit the Inline mode section in the [Introduction for Developers](https://core.telegram.org/bots#inline-mode) written by the Telegram team.
> Further resources are their [detailed description](https://core.telegram.org/bots/inline) of inline bots, as well as the [original blog post](https://telegram.org/blog/inline-bots) announcing the feature, and the Inline mode section in the [Telegram Bot API Reference](https://core.telegram.org/bots/api#inline-mode).
> They are all worth a read before implementing inline queries for your bot.

Once a user triggers an inline query, i.e. begins typing “@your_bot_name ...” in a text field, your bot will receive updates about this.
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

Remember that grammY can auto-complete all the fields in the above structure for you.
Also, be sure to check out the exact specification of how inline results should look in the [Telegram Bot API Reference](https://core.telegram.org/bots/api#inline-mode).
