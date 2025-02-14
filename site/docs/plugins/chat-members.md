---
prev: false
next: false
---

# Chat Members Plugin (`chat-members`)

Telegram doesn't offer a method in the Bot API to retrieve the members of a chat, you have to keep track of them yourself.
This plugin makes it easy to work with `ChatMember` objects, by offering a convenient way to listen for changes in the form of custom filters, and by storing and updating the objects.

## Introduction

Working with `ChatMember` objects from the Telegram Bot API can sometimes be cumbersome.
There are several different statuses that are often interchangeable in most applications.
In addition, the restricted status is ambiguous because it can represent both members of the group and restricted users that are not in the group.

This plugin simplifies dealing with chat members by offering fully typed filters for chat member updates.

## Usage

### Chat Member Filters

You can listen for two kinds of updates regarding chat members using a Telegram bot: `chat_member` and `my_chat_member`.
Both of them specify the old and new status of the user.

- `my_chat_member` updates are received by your bot by default and they inform you about the status of the bot being updated in any chat, as well as users blocking the bot;
- `chat_member` updates are only received if you explicitly include them in the list of allowed updates, they notify about any status changes for users in chats **where your bot is admin**.

Instead of manually filtering the old and new status, chat member filters do this automatically for you, allowing you to react to every type of transition you're interested in.
Within the handler, the types of `old_chat_member` and `new_chat_member` are narrowed down accordingly.

::: code-group

```ts [TypeScript]
import { API_CONSTANTS, Bot } from "grammy";
import { chatMemberFilter, myChatMemberFilter } from "@grammyjs/chat-members";

const bot = new Bot("");
const groups = bot.chatType(["group", "supergroup"]);

// Listen for updates where the bot is added to a group as a regular user.
groups.filter(myChatMemberFilter("out", "regular"), async (ctx) => {
  await ctx.reply("Hello, thank you for adding me to the group!");
});

// Listen for updates where the bot is added to a group as an admin.
groups.filter(myChatMemberFilter("out", "admin"), async (ctx) => {
  await ctx.reply("Hello, thank you for adding me to the group as admin!");
});

// Listen for updates where the bot is promoted to admin.
groups.filter(myChatMemberFilter("regular", "admin"), async (ctx) => {
  await ctx.reply("I was promoted to admin!");
});

// Listen for updates where the bot is demoted to a regular user.
groups.filter(myChatMemberFilter("admin", "regular"), async (ctx) => {
  await ctx.reply("I am no longer admin");
});

// Listen for updates where a user joins a group where your bot is admin.
groups.filter(chatMemberFilter("out", "in"), async (ctx) => {
  const user = ctx.chatMember.new_chat_member.user;
  await ctx.reply(`Welcome ${user.first_name} to the group!`);
});

bot.start({
  // Make sure to specify the desired update types.
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

```js [JavaScript]
import { API_CONSTANTS, Bot } from "grammy";
import { chatMemberFilter, myChatMemberFilter } from "@grammyjs/chat-members";

const bot = new Bot("");
const groups = bot.chatType(["group", "supergroup"]);

// Listen for updates where the bot is added to a group as a regular user.
groups.filter(myChatMemberFilter("out", "regular"), async (ctx) => {
  await ctx.reply("Hello, thank you for adding me to the group!");
});

// Listen for updates where the bot is added to a group as an admin.
groups.filter(myChatMemberFilter("out", "admin"), async (ctx) => {
  await ctx.reply("Hello, thank you for adding me to the group as admin!");
});

// Listen for updates where the bot is promoted to admin.
groups.filter(myChatMemberFilter("regular", "admin"), async (ctx) => {
  await ctx.reply("I was promoted to admin!");
});

// Listen for updates where the bot is demoted to a regular user.
groups.filter(myChatMemberFilter("admin", "regular"), async (ctx) => {
  await ctx.reply("I am no longer admin");
});

// Listen for updates where a user joins a group where your bot is admin.
groups.filter(chatMemberFilter("out", "in"), async (ctx) => {
  const user = ctx.chatMember.new_chat_member.user;
  await ctx.reply(`Welcome ${user.first_name} to the group!`);
});

bot.start({
  // Make sure to specify the desired update types.
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

```ts [Deno]
import { API_CONSTANTS, Bot } from "https://deno.land/x/grammy/mod.ts";
import {
  chatMemberFilter,
  myChatMemberFilter,
} from "https://deno.land/x/grammy_chat_members/mod.ts";

const bot = new Bot("");
const groups = bot.chatType(["group", "supergroup"]);

// Listen for updates where the bot is added to a group as a regular user.
groups.filter(myChatMemberFilter("out", "regular"), async (ctx) => {
  await ctx.reply("Hello, thank you for adding me to the group!");
});

// Listen for updates where the bot is added to a group as an admin.
groups.filter(myChatMemberFilter("out", "admin"), async (ctx) => {
  await ctx.reply("Hello, thank you for adding me to the group as admin!");
});

// Listen for updates where the bot is promoted to admin.
groups.filter(myChatMemberFilter("regular", "admin"), async (ctx) => {
  await ctx.reply("I was promoted to admin!");
});

// Listen for updates where the bot is demoted to a regular user.
groups.filter(myChatMemberFilter("admin", "regular"), async (ctx) => {
  await ctx.reply("I am no longer admin");
});

// Listen for updates where a user joins a group where your bot is admin.
groups.filter(chatMemberFilter("out", "in"), async (ctx) => {
  const user = ctx.chatMember.new_chat_member.user;
  await ctx.reply(`Welcome ${user.first_name} to the group!`);
});

bot.start({
  // Make sure to specify the desired update types.
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

:::

Filters include the regular Telegram statuses (owner, administrator, member, restricted, left, kicked) and some additional ones for convenience:

- `restricted_in`: a member of the chat with restrictions;
- `restricted_out`: not a member of the chat, has restrictions;
- `in`: a member of the chat (administrator, creator, member, restricted_in);
- `out`: not a member of the chat (left, kicked, restricted_out);
- `free`: a member of the chat that isn't restricted (administrator, creator, member);
- `admin`: an admin of the chat (administrator, creator);
- `regular`: a non-admin member of the chat (member, restricted_in).

To summarize, here is a diagram showing what each query corresponds to:

![Diagram showing the statuses corresponding to each query.](/images/chat-members-statuses.svg)

You can create your custom groupings of chat member types by passing an array instead of a string:

```typescript
groups.filter(
  chatMemberFilter(["restricted", "kicked"], ["free", "left"]),
  async (ctx) => {
    const from = ctx.from;
    const { status: oldStatus, user } = ctx.chatMember.old_chat_member;
    await ctx.reply(
      `${from.first_name} lifted ` +
        `${oldStatus === "kicked" ? "ban" : "restrictions"} ` +
        `from ${user.first_name}`,
    );
  },
);
```

#### Example Usage

The best way to use the filters is to pick a set of relevant statuses, for example 'out', 'regular' and 'admin', then
make a table of the transitions between them:

| ↱           | Out         | Regular              | Admin               |
| ----------- | ----------- | -------------------- | ------------------- |
| **Out**     | ban-changed | join                 | join-and-promoted   |
| **Regular** | exit        | restrictions-changed | promoted            |
| **Admin**   | exit        | demoted              | permissions-changed |

Assign a listener to all the transitions that are relevant to your use-case.

Combine these filters with `bot.chatType` to only listen for transitions for a specific type of chat.
Add a middleware to listen to all updates as a way to perform common operations (like updating your database) before handing off control to a specific handler.

```typescript
const groups = bot.chatType(["group", "supergroup"]);

groups.on("chat_member", async (ctx, next) => {
  // ran on all updates of type chat_member
  const {
    old_chat_member: { status: oldStatus },
    new_chat_member: { user, status },
    from,
    chat,
  } = ctx.chatMember;
  console.log(
    `In group ${chat.id} user ${from.id} changed status of ${user.id}:`,
    `${oldStatus} -> ${status}`,
  );

  // update database data here

  await next();
});

// specific handlers

groups.filter(chatMemberFilter("out", "in"), async (ctx, next) => {
  const { new_chat_member: { user } } = ctx.chatMember;
  await ctx.reply(`Welcome ${user.first_name}!`);
});
```

### Status Checking Utility

The `chatMemberIs` utility function can be useful whenever you want to use filtering logic within a handler.
It takes as input any of the regular and custom statuses (or an array of them), and narrows the type of the passed variable.

```ts
bot.callbackQuery("foo", async (ctx) => {
  const chatMember = await ctx.getChatMember(ctx.from.id);

  if (!chatMemberIs(chatMember, "free")) {
    chatMember.status; // "restricted" | "left" | "kicked"
    await ctx.answerCallbackQuery({
      show_alert: true,
      text: "You don't have permission to do this!",
    });
    return;
  }

  chatMember.status; // "creator" | "administrator" | "member"
  await ctx.answerCallbackQuery("bar");
});
```

### Hydrating Chat Member Objects

You can further improve your development experience by using the hydration [API transformer](../advanced/transformers).
This transformer will apply to calls to `getChatMember` and `getChatAdministrators`, adding a convenient `is` method to the returned `ChatMember` objects.

```ts
type MyContext = HydrateChatMemberFlavor<Context>;
type MyApi = HydrateChatMemberApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");

bot.api.config.use(hydrateChatMember());

bot.command("ban", async (ctx) => {
  const author = await ctx.getAuthor();

  if (!author.is("admin")) {
    author.status; // "member" | "restricted" | "left" | "kicked"
    await ctx.reply("You don't have permission to do this");
    return;
  }

  author.status; // "creator" | "administrator"
  // ...
});
```

### Storing Chat Members

You can use a valid grammY [storage adapter](./session#known-storage-adapters) or an instance of any class that implements the [`StorageAdapter`](/ref/core/storageadapter) interface.

Please note that as per the [official Telegram docs](https://core.telegram.org/bots/api#getupdates), your bot needs to specify the `chat_member` update in the `allowed_updates` array, as shown in the example below.
This means you also need to specify any other events you'd like to receive.

::: code-group

```ts [TypeScript]
import { Bot, type Context, MemorySessionStorage } from "grammy";
import { type ChatMember } from "grammy/types";
import { chatMembers, type ChatMembersFlavor } from "@grammyjs/chat-members";

type MyContext = Context & ChatMembersFlavor;

const adapter = new MemorySessionStorage<ChatMember>();

const bot = new Bot<MyContext>("");

bot.use(chatMembers(adapter));

bot.start({
  // Make sure to specify the desired update types.
  allowed_updates: ["chat_member", "message"],
});
```

```js [JavaScript]
import { Bot, MemorySessionStorage } from "grammy";
import { chatMembers } from "@grammyjs/chat-members";

const adapter = new MemorySessionStorage();

const bot = new Bot("");

bot.use(chatMembers(adapter));

bot.start({
  // Make sure to specify the desired update types.
  allowed_updates: ["chat_member", "message"],
});
```

```ts [Deno]
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

const bot = new Bot<MyContext>("");

bot.use(chatMembers(adapter));

bot.start({
  // Make sure to specify the desired update types.
  allowed_updates: ["chat_member", "message"],
});
```

:::

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
- [Source](https://github.com/grammyjs/chat-members)
- [Reference](/ref/chat-members/)
