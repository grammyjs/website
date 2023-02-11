# Chat Members plugin (`chat-members`)

Automatically store information about users on a chat and retrieve it easilly

## Introduction

In many situations, it is necessary for a bot to have information about all the users of a given chat. Currently, though, the Telegram Bot API exposes no method that allows us to retrieve this information.

This plugin does the next best thing: automatically listening to `chat_member` events and storing the `ChatMember` object. It then allows you to use `ctx.chatMembers.getChatMember()` to obtain information about a specific chat member, taking the previously stored information into account.

## Usage

### Storing chat members

You can use a valid grammY [storage adapter](https://grammy.dev/plugins/session.html#known-storage-adapters) or an
instance of any class that implements the [`StorageAdapter`](https://deno.land/x/grammy/mod.ts?s=StorageAdapter)
interface.

```typescript
import {
  Bot,
  Context,
  MemorySessionStorage,
} from "https://deno.land/x/grammy/mod.ts";
import type { ChatMember } from "https://deno.land/x/grammy/types.ts";
import {
  chatMembers,
  ChatMembersFlavor,
} from "https://deno.land/x/grammy_chat_members/mod.ts";

type MyContext = Context & ChatMembersFlavor;

const adapter = new MemorySessionStorage<ChatMember>();

const bot = new Bot<MyContext>("<your bot token>");

bot.use(chatMembers(adapter));

bot.start({
  allowed_updates: ["chat_member", "message"],
  onStart: ({ username }) => console.log(`Listening as ${username}`),
});
```

### Reading chat member info

This plugin also adds a new `ctx.chatMembers.getChatMember` function that will check the storage for information about a
chat member before querying telegram for it. If the chat member exists in the storage, it will be returned. Otherwise,
`ctx.api.getChatMember` will be called and the result will be saved to the storage, making subsequent calls faster and
removing the need to call telegram again for that user and chat in the future.

Here's an example:

```typescript
bot.on("message", async (ctx) => {
  const chatMember = await ctx.chatMembers.getChatMember();

  return ctx.reply(
    `Hello, ${chatMember.user.first_name}! I see you are a ${chatMember.status} of this chat!`,
  );
});
```

All parameters are optional; if you don't provide them, `ctx.chat.id` and `ctx.from.id` will be used instead.
Please notice that, if you don't provide a chat id and there's no `chat` property inside the context (for example: on
inline query updates), this will throw an error. The same will happen if there's no `ctx.from` in the context.

## Aggressive storage

The `enableAggressiveStorage` config option will install middleware to cache chat members without depending on the
`chat_member` event. For every update, the middleware checks if `ctx.chat` and `ctx.from` exist. If they both do, it
then proceeds to call `ctx.chatMembers.getChatMember` to add the chat member information to the storage in case it
doesn't exist.

Please note that this means the storage will be called for **every update**, which may be a lot, depending on how many
updates your bot receives. This also has the potential to impact the performance of your bot drastically. Only use this
if you _really_ know what you're doing and are ok with the risks and consequences.

## Plugin Summary

- Name: `command-filter`
- Source: <https://github.com/grammyjs/chat-members>
- Reference: <https://deno.land/x/grammy_chat_members/mod.ts>
