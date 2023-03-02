# Chat Members Plugin (`chat-members`)

Automatically store information about users in a chat and retrieve it easily.

## Introduction

In many situations, it is necessary for a bot to have information about all the users of a given chat.
Currently, though, the Telegram Bot API exposes no method that allows us to retrieve this information.

This plugin comes to the rescue: automatically listening to `chat_member` events and storing all `ChatMember` objects.

## Usage

### Storing Chat Members

You can use a valid grammY [storage adapter](./session.md#known-storage-adapters) or an instance of any class that implements the [`StorageAdapter`](https://deno.land/x/grammy/mod.ts?s=StorageAdapter) interface.

Please note that, as per the official Telegram docs, your bot needs to specify the `chat_member` update in the `allowed_updates` array, as shown in the example below.
This means you also need to specify any other events you'd like to receive.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, type Context, MemorySessionStorage } from "grammy";
import { type ChatMember } from "grammy/types";
import { chatMembers, type ChatMembersFlavor } from "@grammyjs/chat-members";

type MyContext = Context & ChatMembersFlavor;

const adapter = new MemorySessionStorage<ChatMember>();

const bot = new Bot<MyContext>("<your bot token>");

bot.use(chatMembers(adapter));

bot.start({
  // Make sure to specify the desired update types
  allowed_updates: ["chat_member", "message"],
});
```

</CodeGroupItem>

<CodeGroupItem title="JavaScript">

```js
import { Bot, MemorySessionStorage } from "grammy";
import { chatMembers } from "@grammyjs/chat-members";

const adapter = new MemorySessionStorage();

const bot = new Bot("<your bot token>");

bot.use(chatMembers(adapter));

bot.start({
  // Make sure to specify the desired update types
  allowed_updates: ["chat_member", "message"],
});
```

</CodeGroupItem>

<CodeGroupItem title="Deno">

```ts
import {
  Bot,
  type Context,
  MemorySessionStorage,
} from "https://deno.land/x/grammy/mod.ts";
import { type ChatMember } from "https://deno.land/x/grammy/types.ts";
import {
  chatMembers,
  type ChatMembersFlavor,
} from "https://deno.land/x/grammy_chat_members/mod.ts";

type MyContext = Context & ChatMembersFlavor;

const adapter = new MemorySessionStorage<ChatMember>();

const bot = new Bot<MyContext>("<your bot token>");

bot.use(chatMembers(adapter));

bot.start({
  // Make sure to specify the desired update types
  allowed_updates: ["chat_member", "message"],
});
```

</CodeGroupItem>

</CodeGroup>

### Reading Chat Members

This plugin also adds a new `ctx.chatMembers.getChatMember` function that will check the storage for information about a chat member before querying Telegram for it.
If the chat member exists in the storage, it will be returned.
Otherwise, `ctx.api.getChatMember` will be called and the result will be saved to the storage, making subsequent calls faster and removing the need to call Telegram again for that user and chat in the future.

Here's an example:

```ts
bot.on("message", async (ctx) => {
  const chatMember = await ctx.chatMembers.getChatMember();

  return ctx.reply(
    `Hello, ${chatMember.user.first_name}! I see you are a ${chatMember.status} of this chat!`,
  );
});
```

This function accepts the following optional parameters:

- `chatId`:
  - Default: `ctx.chat.id`
  - The chat identifier
- `userId`:
  - Default: `ctx.from.id`
  - The user identifier

You can pass them like so:

```ts
bot.on("message", async (ctx) => {
  const chatMember = await ctx.chatMembers.getChatMember(
    ctx.chat.id,
    ctx.from.id,
  );
  return ctx.reply(
    `Hello, ${chatMember.user.first_name}! I see you are a ${chatMember.status} of this chat!`,
  );
});
```

Please notice that, if you don't provide a chat identifier and there's no `chat` property inside the context (for example, on inline query updates), this will throw an error.
The same will happen if there's no `ctx.from` in the context.

## Aggressive Storage

The `enableAggressiveStorage` config option will install middleware to cache chat members without depending on the `chat_member` event.
For every update, the middleware checks if `ctx.chat` and `ctx.from` exist.
If they both do, it then proceeds to call `ctx.chatMembers.getChatMember` to add the chat member information to the storage in case it doesn't exist.

Please note that this means the storage will be called for **every update**, which may be a lot, depending on how many updates your bot receives.
This has the potential to impact the performance of your bot drastically.
Only use this if you _really_ know what you're doing and are okay with the risks and consequences.

## Plugin Summary

- Name: `chat-members`
- Source: <https://github.com/grammyjs/chat-members>
- Reference: <https://deno.land/x/grammy_chat_members/mod.ts>
