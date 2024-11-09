---
prev: false
next: false
---

# Conversations (`conversations`)

Create powerful conversational interfaces with ease.

## Quickstart

Conversations let you wait for messages.
Use this plugin if your bot has multiple steps.

> Conversations are unique because they introduce a novel concept that you won't find elsewhere in the world.
> They provide an elegant solution, but you will need to read a bit about how they work before you understand what your code actually does.

Here is a quickstart to let you play around with the plugin before we get to the interesting parts.

:::code-group

```ts [TypeScript]
import { Bot, type Context } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";

const bot = new Bot<ConversationFlavor<Context>>("");
bot.use(conversations());

/** Defines the conversation */
async function hello(conversation: Conversation<Context>, ctx: Context) {
  await ctx.reply("Hi there! What is your name?");
  const { message } = await conversation.waitFor("message:text");
  await ctx.reply(`Welcome to the chat, ${message.text}!`);
}
bot.use(createConversation(hello));

bot.command("enter", async (ctx) => {
  // enter the function "hello" you declared
  await ctx.conversation.enter("hello");
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { conversations, createConversation } = require(
  "@grammyjs/conversations",
);

const bot = new Bot("");
bot.use(conversations());

/** Defines the conversation */
async function hello(conversation, ctx) {
  await ctx.reply("Hi there! What is your name?");
  const { message } = await conversation.waitFor("message:text");
  await ctx.reply(`Welcome to the chat, ${message.text}!`);
}
bot.use(createConversation(hello));

bot.command("enter", async (ctx) => {
  // enter the function "hello" you declared
  await ctx.conversation.enter("hello");
});

bot.start();
```

```ts [Deno]
import { Bot, type Context } from "https://deno.land/x/grammy/mod.ts";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations/mod.ts";

const bot = new Bot<ConversationFlavor<Context>>("");
bot.use(conversations());

/** Defines the conversation */
async function hello(conversation: Conversation<Context>, ctx: Context) {
  await ctx.reply("Hi there! What is your name?");
  const { message } = await conversation.waitFor("message:text");
  await ctx.reply(`Welcome to the chat, ${message.text}!`);
}
bot.use(createConversation(hello));

bot.command("enter", async (ctx) => {
  // enter the function "hello" you declared
  await ctx.conversation.enter("hello");
});

bot.start();
```

:::

When you enter the above conversation `hello`, it will send a message, then wait for a text message by the user, and then send another message.
Finally, the conversation completes.

Let's now get to the interesting parts.

## How Conversations Work

Take a look at the following example of traditional message handling.

```ts
bot.on("message", async (ctx) => {
  // handle one message
});
```

In regular message handlers, you only have a single context object at all times.

Compare this with conversations.

```ts
async function hello(conversation: Conversation<Context>, ctx0: Context) {
  const ctx1 = await conversation.wait();
  const ctx2 = await conversation.wait();
  // handle three messages
}
```

In this conversation, you have three context objects available!

Like regular handlers, the conversations plugin only receives a single context object from the [middleware system](../guide/middleware.md).
Now suddenly it makes three context objects available to you.
How is this possible?

**Conversation builder functions are not executed like normal functions**.
(Even though we can program them that way.)

### Conversations Are Replay Engines

Conversation builder functions are not executed like normal functions.

When a conversation is entered, it will only be executed up until the first wait call.
The function is then interrupted and won't be executed any further.
The plugin remembers that the wait call has been reached and stores this information.

When the next update arrives, the conversation will be executed again from the start.
However, this time, none of the API calls are performed, which makes your code run very fast and not have any effects.
This is called a _replay_.
As soon as the previously reached wait call is reached once again, function execution resumes normally.

::: code-group

```ts [Enter]
async function hello( //                      |
  conversation: Conversation<Context>, //     |
  ctx0: Context, //                           |
) { //                                        |
  await ctx0.reply("Hi there!"); //           |
  const ctx1 = await conversation.wait(); //  A
  await ctx1.reply("Hello again!"); //
  const ctx2 = await conversation.wait(); //
  await ctx1.reply("Goodbye!"); //
} //
```

```ts [Replay]
async function hello( //                      .
  conversation: Conversation<Context>, //     .
  ctx0: Context, //                           .
) { //                                        .
  await ctx0.reply("Hi there!"); //           .
  const ctx1 = await conversation.wait(); //  A
  await ctx1.reply("Hello again!"); //        |
  const ctx2 = await conversation.wait(); //  B
  await ctx1.reply("Goodbye!"); //
} //
```

```ts [Replay 2]
async function hello( //                      .
  conversation: Conversation<Context>, //     .
  ctx0: Context, //                           .
) { //                                        .
  await ctx0.reply("Hi there!"); //           .
  const ctx1 = await conversation.wait(); //  A
  await ctx1.reply("Hello again!"); //        .
  const ctx2 = await conversation.wait(); //  B
  await ctx1.reply("Goodbye!"); //            |
} //                                          —
```

:::

1. When the conversation is entered, the function will run until `A`.
2. When the next update arrives, the function will be replayed until `A`, and run normally from `A` until `B`.
3. When the last update arrives, the function will be replayed until `B`, and run normally until the end.

This means that each line of code you write will be executed many times---once normally, and many more times during replays.
As a result, you have to make sure that your code behaves the same way during replays as it did when it was first executed.

If you perform any API calls via `ctx.api` (including `ctx.reply`), the plugin takes care of them automatically.
In contrast, your own database communcation needs special treatment.

This is done as follows.

### The Golden Rule of Conversations

Now that [we know how conversations are executed](#conversations-are-replay-engines), we can define one rule that applies to the code you write inside a conversation builder function.
You must follow it if you want your code to behave correctly.

::: warning THE GOLDEN RULE

**Code behaving differently between replays must be wrapped in `conversation.external`.**

:::

This is how to apply it:

```ts
// BAD
const response = await accessDatabase();
// GOOD
const response = await conversation.external(() => accessDatabase());
```

Escaping a part of your code via `conversation.external` signals to the plugin that this part of the code should be skipped during replays.
The return value of the wrapped code is stored by the plugin and reused during subsequent replays.
In the above example, this prevents repeated database access.

USE `conversation.external` when you ...

- read or write to files, databases/sessions, the network, or global state
- call `Math.random()` or `Date.now()`
- perform API calls on `bot.api` or other independent instances of `Api`

DO NOT USE `conversation.external` when you ...

- call `ctx.reply` or `ctx.api.sendMessage` or similar methods
- use any other JavaScript syntax like functions, classes, if-else, loops, etc

The conversations plugin provides a few convenience methods around `conversation.external`.
This not only simplifies using `Math.random()` and `Date.now()`.
It also simplifies debugging by providing a way to suppress logs during a replay.

```ts
// await conversation.external(() => Math.random());
const rnd = await conversation.random();
// await conversation.external(() => Date.now());
const now = await conversation.now();
// await conversation.external(() => console.log("abc"));
await conversation.log("abc");
```

How can `conversation.wait` and `conversation.external` recover the original values when a replay happens?
The plugin has to somehow remember this data, right?

Yes.

### Conversations Store State

Two types of data are being stored in a database.
By default, it uses a lightweight in-memory database that is based on a `Map`, but you can [use a persistent database](#persisting-conversations) easily.

1. The conversations plugin stores all updates.
2. The conversations plugin stores all return values of `conversation.external` and the results of all API calls.

This is not an issue if you only have a few dozen updates in a conversation.
(Remember that during long polling, every call to `getUpdates` retrieves up to 100 updates, too.)

However, if your conversation never exists, this data will accumulate and slow down your bot.
**Avoid infinite loops.**

### Conversational Context Objects

When a conversation is executed, it uses the persisted updates to generate new context objects from scratch.
**These context objects are different from the context object in the surrounding middleware.**
For TypeScript code, this also means that you now have two [flavors](../guide/context.md#context-flavors) of context objects.

- **Outside context objects** are the context objects that your bot uses in middleware.
  They give you access to `ctx.conversation.enter`.
  For TypeScript, they will at least have `ConversationFlavor` installed.
  Outside context objects will also have other properties defined by plugins which you installed via `bot.use`.
- **Inside context objects** (also called **conversational context objects**) are the context objects created by the conversations plugin.
  They can never have access to `ctx.conversation.enter` and by default, they also don't have access to any plugins.
  If you want to have custom properties on inside context objects, [scroll down](#using-plugins-inside-conversations).

The TypeScript setup therefore typically looks as follows.

::: code-group

```ts [Node.js]
import { Bot, type Context } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
} from "@grammyjs/conversations";

// Outside context objects
type MyContext = ConversationFlavor<Context>;
// Inside context objects
type MyConversationContext = Context;

// Use the outside context type for your bot.
const bot = new Bot<MyContext>("");

// Use the inside context type for your conversation.
type MyConversation = Conversation<MyConversationContext>;
async function example(
  conversation: MyConversation,
  ctx0: MyConversationContext,
) {
  const ctx1: MyConversationContext = await conversation.wait();
  // All context objects inside the conversation
  // are of type `MyConversationContext`.
}
```

```ts [Deno]
import { Bot, type Context } from "https://deno.land/x/grammy/mod.ts";
import {
  type Conversation,
  type ConversationFlavor,
} from "https://deno.land/x/grammy_conversations/mod.ts";

// Outside context objects
type MyContext = ConversationFlavor<Context>;
// Inside context objects
type MyConversationContext = Context;

// Use the outside context type for your bot.
const bot = new Bot<MyContext>("");

// Use the inside context type for your conversation.
type MyConversation = Conversation<MyConversationContext>;
async function example(
  conversation: MyConversation,
  ctx0: MyConversationContext,
) {
  const ctx1: MyConversationContext = await conversation.wait();
  // All context objects inside the conversation
  // are of type `MyConversationContext`.
}
```

:::

Naturally, if you have several conversations and you want the context types to differ between them, you can define several conversational context types.

Congrats!
If you have understood all of the above, the hard parts are over.
The rest of the page is about the wealth of features that this the conversations plugin provides.

## Waiting for Updates

- `conversation.wait`
- `waitFor`, `waitUntil`, etc
- chaining wait calls
- inspecting context objects via `if`
- inspecting context objects via `ctx.has`

## Entering and Exiting Conversations

Entering:

- `ctx.conversation`
- recursive calls
- arguments

Exiting:

- returning
- throwing
- `ctx.conversation`
- `conversation.halt`

## It's Just JavaScript

- as long as The Golden Rule is respected, you can do anything you want
- variables, branching, loops
- functions, recursion
- classes, modules

## Persisting Conversations

- default: RAM
- pass storage adapter to `conversations`
- types of storage adapters
- versioning data
- making sure all data is serializable

Note that all data returned from `conversation.external` must be serializable because the plugin stores it.
If you want to return data that cannot be serialized, such as classes or [`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt), you can provide a custom serializer to fix this.

```ts
const largeNumber = await conversation.external({
  // Call an API that returns a BigInt (cannot be converted to JSON).
  task: () => 1000n ** 1000n,
  // Convert bigint to string for storage.
  beforeStore: (n) => String(n),
  // Convert string back to bigint for usage.
  afterLoad: (str) => BigInt(str),
});
```

## Using Plugins Inside Conversations

- pass plugins (except session) to the `plugins` array on `createConversation`
- default plugins (except session) using the `plugins` array on `conversations`
- how to install transformers
- sessions
- menus

## Conversational Menus

- `conversation.menu`
- menu plugin interop

## Conversational Forms

- `conversation.form`
- building custom form fields

## Parallel Conversations

- disabled by default
- many concurrent conversations in the same chat
- connected via middleware

## Inspecting Active Conversations

- checking if a single conversation is active
- checking all active conversations at once

## Migrating From v1 to v2

- storage, data migration
- plugins, sessions
- parallel conversations
- anything else?

## Plugin Summary

- Name: `conversations`
- [Source](https://github.com/grammyjs/conversations)
- [Reference](/ref/conversations/)
