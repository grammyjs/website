# Reactions

Bots can work with message reactions.
There are two types of reactions: emoji reactions and custom emoji reactions.

## Reacting to Messages

Bots can add a single emoji reaction to a message.

In same cases, bots can also react with custom emoji (even though bots cannot have [Telegram Premium](https://telegram.org/faq_premium?setln=en)).
When a premium user adds a custom emoji reaction to a message, bots can later add the same reaction to this message.
In addition, if a chat administrator explicitly allows custom emoji to be used, they can be used by the bots in that chat, too.

This is how you can react to messages.

```ts
// Use `ctx.react` for reactions on the current message.
bot.command("start", (ctx) => ctx.react("😍"));
bot.on("message", (ctx) => ctx.react("👍"));

// Use `ctx.api.setMessageReaction` for reactions somewhere else.
bot.on("message", async (ctx) => {
  await ctx.api.setMessageReaction(chat_id, message_id, "🎉");
});

// Use `bot.api.setMessageReaction` outside handlers.
await bot.api.setMessageReaction(chat_id, message_id, "💯");
```

As usual, TypeScript will provide auto-complete for the emojis you can use.
The list of available emoji reactions can be found [here](https://core.telegram.org/bots/api#reactiontypeemoji).

::: tip Emoji Plugin
It can be ugly to program with emoji.
Not all systems can display your source code properly.
Also, it is annoying to copy them from different places all the time.

Let the [emoji plugin](../plugins/emoji#useful-data-for-reactions) help you!
:::

Now that you know how your bot can react to messages, let's see how we can handle your users' reactions.

## Receiving Updates About Reactions

There are a few different ways to handle updates about reactions.
In private chats and group chats, your bot will receive a `message_reaction` update if a user changes their reaction to a message.
In channels (or automatically forwarded channel posts in groups), your bot will receive a `message_reaction_count` update that only shows the total count of reactions, but without revealing who reacted.

Both types of reactions need to be enabled before you can receive them.
For example, with built-in polling, you can enable them like this:

```ts
bot.start({
  allowed_updates: ["message", "message_reaction", "message_reaction_count"],
});
```

::: tip Enabling All Update Types
You may want to import `API_CONSTANTS` from grammY and then specify

```ts
allowed_updates: API_CONSTANTS.ALL_UPDATE_TYPES;
```

in order to receive all updates.
Be sure to check out the [API reference](/ref/core/apiconstants#all-update-types).
:::

[grammY runner](../plugins/runner#advanced-options) and `setWebhook` have similar ways to specify `allowed_updates`.

Now that your bot can receive reaction updates, let's see how it can handle them!

### Handling New Reactions

It is very simple to handle newly added reactions.
grammY has special support for this via `bot.reaction`.

```ts
bot.reaction("🎉", (ctx) => ctx.reply("whoop whoop"));
bot.reaction(["👍", "👎"], (ctx) => ctx.reply("Nice thumb"));
```

These handlers will trigger whenever a user adds a new emoji reaction to a message.

Naturally, if your bot handles custom emoji reactions by premium users, you can listen for them, too.

```ts
bot.reaction(
  { type: "custom_emoji", custom_emoji_id: "identifier-string" },
  async (ctx) => {/* ... */},
);
```

This requires you to know the identifier of the custom emoji in advance.

### Handling Arbitrary Changes to Reactions

Even though this is not visible in the UI of any official Telegram client, users can actually change several reactions at once.
This is why reaction updates give you two lists, the old reactions and the new reactions.
This allows your bot to handle arbitrary changes to the list of reactions.

```ts
bot.on("message_reaction", async (ctx) => {
  const reaction = ctx.messageReaction;
  // We only receive the message identifier, not the message content.
  const message = reaction.message_id;
  // The difference between these two lists describes the change.
  const old = reaction.old_reaction; // previous
  const now = reaction.new_reaction; // current
});
```

grammY lets you filter down the updates even more with special [filter queries](./filter-queries) for the reaction type.

```ts
// Updates where the current reaction contains at least one emoji.
bot.on("message_reaction:new_reaction:emoji", (ctx) => {/* ... */});
// Updates where the previous reaction contained at least one custom emoji.
bot.on("message_reaction:old_reaction:custom_emoji", (ctx) => {/* ... */});
```

While these two arrays of [`ReactionType` objects](https://core.telegram.org/bots/api#reactiontype) technically give you all the information you need in order to handle reaction updates, they can still be a bit cumbersome to work with.
This is why grammY can compute more useful things from the update.

### Inspecting How Reactions Changed

There is a [context shortcut](./context#shortcuts) called `ctx.reactions` that lets you see how exactly a reaction changed.

Here is how you can use `ctx.reactions` to detect if a user removes their upvote (but forgives them if they still keep their ok hand reaction).

```ts
bot.on("message_reaction", async (ctx) => {
  const { emoji, emojiAdded, emojiRemoved } = ctx.reactions();
  if (emojiRemoved.includes("👍")) {
    // Upvote was removed! Unacceptable.
    if (emoji.includes("👌")) {
      // Still okay, do not punish
      await ctx.reply("I forgive you");
    } else {
      // How dare they.
      await ctx.banAuthor();
    }
  }
});
```

There are four arrays returned by `ctx.reaction`: added emoji, removed emoji, kept emoji, and a list that tells you what the result of the change is.
In addition, there are four more arrays for custom emoji with similar information.

```ts
const {
  /** Emoji currently present in this user's reaction */
  emoji,
  /** Emoji newly added to this user's reaction */
  emojiAdded,
  /** Emoji not changed by the update to this user's reaction */
  emojiKept,
  /** Emoji removed from this user's reaction */
  emojiRemoved,
  /** Custom emoji currently present in this user's reaction */
  customEmoji,
  /** Custom emoji newly added to this user's reaction */
  customEmojiAdded,
  /** Custom emoji not changed by the update to this user's reaction */
  customEmojiKept,
  /** Custom emoji removed from this user's reaction */
  customEmojiRemoved,
} = ctx.reactions();
```

A lot has been said about handling updates in private chats and group chats.
Let's look at channels.

### Handling Reaction Count Updates

In private chats, groups, and supergroups, it is known who reacts to which message.
However, for channel posts, we only have a list of anonymous reactions.
It is not possible to obtain a list of users who reacted to a certain post.
The same is true for channel posts that get forwarded to linked discussion group chats automatically.

In both cases, your bot will receive a `message_reaction_count` update.

You can handle it like so.

```ts
bot.on("message_reaction_count", async (ctx) => {
  const counts = ctx.messageReactionCount;
  // Again, we can only see the message identifer.
  const message = counts.message_id;
  // Here is a list of reactions with a count.
  const { reactions } = counts;
});
```

Be sure to check out the [specification](https://core.telegram.org/bots/api#messagereactioncountupdated) for message reaction count updates.
