# Telegram Business

Telegram Business allows your private chat with another (human) user to be managed by a bot.
This includes sending and receiving messages on your behalf.
Typically, this is useful if you run your business on Telegram, and that other user is a customer.

> If you are not familiar with Telegram Business yet, check out the [official docs](https://core.telegram.org/bots#manage-your-business) by Telegram before you continue.

Naturally, grammY has full support for this.

## Handling Business Messages

A bot can manage a private chat between two users via Telegram Business---an account that is subscribed to Telegram's business subscription.
Managing private chats is done via a _business connection_ object that looks like [this](/ref/types/businessconnection).

### Receiving Business Messages

Once a business connection was set up, the bot will **receive messages** from _both chat participants_.

```ts
bot.on("business_message", async (ctx) => {
  // Access the message object.
  const message = ctx.businessMessage;
  // Shortcuts work as expected.
  const msg = ctx.msg;
});
```

At this point, it is not clear who of the two chat participants sent a message.
It could be a message by your customer---but it could also be a message sent by yourself (not your bot)!

Thus, we need to differentiate between the two users.
For this, we need to inspect the aforementioned business connection object.
The business connection tells us who is the business account user, i.e. the user identifier of you (or one of your employees).

```ts
bot.on("business_message", async (ctx) => {
  // Get information about the business connection.
  const conn = await ctx.getBusinessConnection();
  const employee = conn.user;
  // Check who sent this message.
  if (ctx.from.id === employee.id) {
    // You sent this message.
  } else {
    // Your customer sent this message.
  }
});
```

You can also skip calling `getBusinessConnection` for every update by doing [this](#working-with-business-connections).

### Sending Messages

Your bot is able to **send messages** to this chat _without being a member of the chat_.
It works as expected with `ctx.reply` and all of its variants.
grammY checks if the [context shortcut](../guide/context#shortcuts) `ctx.businessConnectionId` is available, so it can send the message to the managed business chat.

```ts
bot.on("business_message").filter(
  async (ctx) => {
    const conn = await ctx.getBusinessConnection();
    return ctx.from.id !== conn.user.id;
  },
  async (ctx) => {
    // Automatically respond to all customer questions.
    if (ctx.msg.text.endsWith("?")) {
      await ctx.reply("Soon.");
    }
  },
);
```

This will look as if you had sent the message yourself.
There is no way to tell for your customer whether the message was sent manually or via your bot.
(You will see a small indicator for this, though.)
(But your bot is probably much faster at replying than you.
Sorry.)

## Going Further

There are a few more things to consider when integrating your bot with Telegram Business.
We will cover a few aspects here briefly.

### Editing or Deleting Business Messages

When you or your customer edit or delete messages in your chat, your bot will be notified of this.
More specifically, you will receive `edited_business_message` or `deleted_business_messages` updates.
Your bot can handle them the normal way using `bot.on` and its countless [filter queries](../guide/filter-queries).

You can edit the message in the usual way, using `ctx.editMessageText` or other variants of it.

```ts
bot.on("business_message").filter(async (ctx) => {
  const conn = await ctx.getBusinessConnection();
  return ctx.msg.text == "This message will be edited" &&
    ctx.from.id == conn.user.id;
}, async (ctx) => {
  await ctx.editMessageText("Edited!");
});
```

However, your bot is **NOT** able delete messages in the chat.

Similarly, your bot is **NOT** able to forward messages from the chat, or copy them elsewhere.
All of these things are left to humans.

### Working With Business Connections

When the bot is connected to a business account, it will receive a `business_connection` update.
This update will also be received when the bot is disconnected or the connection is edited in a different way.

For example, a bot may or may not be able to send messages to the chats it manages.
You can catch this using the `:can_reply` query part.

```ts
bot.on("business_connection:can_reply", async (ctx) => {
  // Connection allows sending messages.
});
```

It makes a lot of sense to store business connection objects in your database.
That way, you can avoid calling `ctx.getBusinessConnection()` for every update only to [find out who sent a message](#receiving-business-messages).

Moreover, a `business_connection` update contains a `user_chat_id`.
This chat identifier can be used to initate a conversation with the user who connected the bot.

```ts
bot.on("business_connection:is_enabled", async (ctx) => {
  const id = ctx.businessConnection.user_chat_id;
  await ctx.api.sendMessage(id, "Thanks for connecting me!");
});
```

This works even if the user has not started your bot yet.

### Managing Individual Chats

If you connect a bot to manage your account, Telegram apps will offer you a button to manage this bot in each managed chat.
This button sends `/start` to the bot.

This start command has a special [deep linking](../guide/commands#deep-linking-support) payload defined by Telegram.
It has the format `bizChatXXXXX` where `XXXXX` will be the chat identifier of the managed chat.

```ts
bot.command("start", async (ctx) => {
  const payload = ctx.match;
  if (payload.startsWith("bizChat")) {
    const id = payload.slice(7); // strip `bizChat`
    await ctx.reply(`Let's manage chat #${id}!`);
  }
});
```

This gives important context to your bot and enables it to manage individual business chats right from the conversation with each customer.
