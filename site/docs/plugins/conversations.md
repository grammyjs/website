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
async function hello(conversation: Conversation, ctx: Context) {
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
async function hello(conversation: Conversation, ctx: Context) {
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
async function hello(conversation: Conversation, ctx0: Context) {
  const ctx1 = await conversation.wait();
  const ctx2 = await conversation.wait();
  // handle three messages
}
```

In this conversation, you have three context objects available!

Like regular handlers, the conversations plugin only receives a single context object from the [middleware system](../guide/middleware).
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
  conversation: Conversation, //              |
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
  conversation: Conversation, //              .
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
  conversation: Conversation, //              .
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
For TypeScript code, this also means that you now have two [flavors](../guide/context#context-flavors) of context objects.

- **Outside context objects** are the context objects that your bot uses in middleware.
  They give you access to `ctx.conversation.enter`.
  For TypeScript, they will at least have `ConversationFlavor` installed.
  Outside context objects will also have other properties defined by plugins which you installed via `bot.use`.
- **Inside context objects** (also called **conversational context objects**) are the context objects created by the conversations plugin.
  They can never have access to `ctx.conversation.enter` and by default, they also don't have access to any plugins.
  If you want to have custom properties on inside context objects, [scroll down](#using-plugins-inside-conversations).

You have to pass both the outside and the inside context types to the conversation.
The TypeScript setup therefore typically looks as follows.

::: code-group

```ts [Node.js]
import { Bot, type Context } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
} from "@grammyjs/conversations";

// Outside context objects (knows all middleware plugins)
type MyContext = ConversationFlavor<Context>;
// Inside context objects (knows all conversation plugins)
type MyConversationContext = Context;

// Use the outside context type for your bot.
const bot = new Bot<MyContext>("");

// Use both the outside and the inside type for your conversation.
type MyConversation = Conversation<MyContext, MyConversationContext>;

// Define your conversation and make sure
async function example(
  conversation: MyConversation,
  ctx0: MyConversationContext,
) {
  // All context objects inside the conversation are
  // of type `MyConversationContext`.
  const ctx1 = await conversation.wait();

  // The outside context object can be accessed
  // via `conversation.external` and it is inferred to be
  // of type `MyContext`.
  const session = await conversation.external((ctx) => ctx.session);
}
```

```ts [Deno]
import { Bot, type Context } from "https://deno.land/x/grammy/mod.ts";
import {
  type Conversation,
  type ConversationFlavor,
} from "https://deno.land/x/grammy_conversations/mod.ts";

// Outside context objects (knows all middleware plugins)
type MyContext = ConversationFlavor<Context>;
// Inside context objects (knows all conversation plugins)
type MyConversationContext = Context;

// Use the outside context type for your bot.
const bot = new Bot<MyContext>("");

// Use both the outside and the inside type for your conversation.
type MyConversation = Conversation<MyContext, MyConversationContext>;

// Define your conversation and make sure
async function example(
  conversation: MyConversation,
  ctx0: MyConversationContext,
) {
  // All context objects inside the conversation are
  // of type `MyConversationContext`.
  const ctx1 = await conversation.wait();

  // The outside context object can be accessed
  // via `conversation.external` and it is inferred to be
  // of type `MyContext`.
  const session = await conversation.external((ctx) => ctx.session);
}
```

:::

Naturally, if you have several conversations and you want the context types to differ between them, you can define several conversational context types.

Congrats!
If you have understood all of the above, the hard parts are over.
The rest of the page is about the wealth of features that this the conversations plugin provides.

## Entering Conversations

Conversations can be entered from a normal handler.

By default, a conversation has the same name as the [name](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name) of the function.
Optionally, you can rename it when installing it on your bot.

Optionally, you can pass arguments to the conversation.
Note that the arguments will be stored as a JSON string, so you need to make sure they can be safely passed to `JSON.stringify`.

Conversations can also be entered from within other conversations by doing a normal JavaScript function call.
In that case, they get access to a potential return value of the called conversation.
This isn't available when you enter a conversation from inside middleware.

:::code-group

```ts [TypeScript]
/**
 * Returns the answer to life, the universe, and everything.
 * This value is only accessible when the conversation
 * is called from another conversation.
 */
async function convo(conversation: Conversation, ctx: Context) {
  await ctx.reply("Computing answer");
  return 42;
}
/** Accepts two arguments (must be JSON-serializable) */
async function args(
  conversation: Conversation,
  ctx: Context,
  answer: number,
  config: { text: string },
) {
  const truth = await convo(conversation, ctx);
  if (answer === truth) {
    await ctx.reply(config.text);
  }
}
bot.use(createConversation(convo, "new-name"));
bot.use(createConversation(args));

bot.command("enter", async (ctx) => {
  await ctx.conversation.enter("new-name");
});
bot.command("enter_with_arguments", async (ctx) => {
  await ctx.conversation.enter("args", 42, { text: "foo" });
});
```

```js [JavaScript]
/**
 * Returns the answer to life, the universe, and everything.
 * This value is only accessible when the conversation
 * is called from another conversation.
 */
async function convo(conversation, ctx) {
  await ctx.reply("Computing answer");
  return 42;
}
/** Accepts two arguments (must be JSON-serializable) */
async function args(conversation, ctx, answer, config) {
  const truth = await convo(conversation, ctx);
  if (answer === truth) {
    await ctx.reply(config.text);
  }
}
bot.use(createConversation(convo, "new-name"));
bot.use(createConversation(args));

bot.command("enter", async (ctx) => {
  await ctx.conversation.enter("new-name");
});
bot.command("enter_with_arguments", async (ctx) => {
  await ctx.conversation.enter("args", 42, { text: "foo" });
});
```

:::

:::warning Missing Type Safety for Arguments

Double-check that you used the right type annotations for the parameters of your conversation, and that you passed matching arguments to it in your `enter` call.
The plugin is not able to check any types beyond `conversation` and `ctx`.

:::

Remember that [the order of your middleware matters](../guide/middleware).
You can only enter conversations that have been installed prior to the handler that calls `enter`.

## Waiting for Updates

The most basic kind of wait call just waits for any update.

```ts
const ctx = await conversation.wait();
```

It simply returns a context object.
All other wait calls are based on this.

### Filtered Wait Calls

If you want to wait for a specific type of update, you can use a filtered wait call.

```ts
// Match a filter query like with `bot.on`.
const message = await conversation.waitFor("message");
// Wait for text like with `bot.hears`.
const hears = await conversation.waitForHears(/regex/);
// Wait for commands like with `bot.command`.
const start = await conversation.waitFor("start");
// etc
```

Take a look at the API reference to see [all the available ways to filter wait calls](/ref/conversations/conversation#wait).

Filtered wait calls are guaranteed to return only update that match the respective filter.
If the bot receives an update that does not match, it will be dropped.
You can pass a callback function that will be invoked in this case.

```ts
const message = await conversation.waitFor(":photo", {
  otherwise: (ctx) => ctx.reply("Please send a photo!"),
});
```

All filtered wait calls can be chained to filter for several things at once.

```ts
// Wait for a photo with a specific caption
let photoWithCaption = await conversation.waitFor(":photo")
  .andForHears("XY");
// Handle each case with a different otherwise function:
photoWithCaption = await conversation
  .waitFor(":photo", { otherwise: (ctx) => ctx.reply("No photo") })
  .andForHears("XY", { otherwise: (ctx) => ctx.reply("Bad caption") });
```

If you only specify `otherwise` in of the chained wait calls, then it will only be invoked if that specific filter drops the update.

### Inspecting Context Objects

It is very common to [destructure](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) the received context objects.
You can then perform further checks on the received data.

```ts
const { message } = await conversation.waitFor("message");
if (message.photo) {
  // Handle photo message
}
```

Conversations are also an ideal place to use [has checks](../guide/context#probing-via-has-checks).

## Exiting Conversations

The easiest way to exit a conversation is to return from it.
Throw an error also terminates the conversation.

If this is not enough, you can manually halt the conversation at any moment.

```ts
async function convo(conversation: Conversation, ctx: Context) {
  // All branches exit the conversation:
  if (ctx.message?.text === "return") {
    return;
  } else if (ctx.message?.text === "error") {
    throw new Error("boom");
  } else {
    await conversation.halt();
  }
}
```

You can also exit a conversation from your middleware.

```ts
bot.use(conversations());
bot.command("clean", async (ctx) => {
  await ctx.conversation.exit("convo");
});
```

You can even do this _before_ the targeted conversation is installed on your middleware system.
It is enough to have the conversations plugin itself installed.

## It's Just JavaScript

With [side-effects out of the way](#the-golden-rule-of-conversations), conversations are just regular JavaScript functions.
They might be executed in weird ways, but when developing a bot, you can usually forget this.
All the regular JavaScript syntax just works.

Most the things in this section are obvious if you have used conversations for some time.
However, if you are new, some of these things could surprise you.

### Variables, Branching, and Loops

You can use normal variables to store state between updates.
You can use branching with `if` or `switch`.
Loops via `for` and `while` work, too.

```ts
await ctx.reply("Send me your favorite numbers, separated by commas!");
const { message } = await conversation.waitFor("message:text");
const numbers = message.text.split(",");
let sum = 0;
for (const str of numbers) {
  const n = parseInt(str.trim(), 10);
  if (!isNaN(n)) {
    sum += n;
  }
}
await ctx.reply("The sum of these numbers is: " + sum);
```

It's just JavaScript.

### Functions and Recursion

You can split a conversation into multiple functions.
They can call each other and even do recursion.
(In fact, the plugin does not even know that you used functions.)

Here is the same code as above, refactored to functions.

:::code-group

```ts [TypeScript]
/** A conversation to add numbers */
async function sumConvo(conversation: Conversation, ctx: Context) {
  await ctx.reply("Send me your favorite numbers, separated by commas!");
  const { message } = await conversation.waitFor("message:text");
  const numbers = message.text.split(",");
  await ctx.reply("The sum of these numbers is: " + sumStrings(numbers));
}

/** Converts all given strings to numbers and adds them up */
function sumStrings(numbers: string[]): number {
  let sum = 0;
  for (const str of numbers) {
    const n = parseInt(str.trim(), 10);
    if (!isNaN(n)) {
      sum += n;
    }
  }
  return sum;
}
```

```js [JavaScript]
/** A conversation to add numbers */
async function sumConvo(conversation, ctx) {
  await ctx.reply("Send me your favorite numbers, separated by commas!");
  const { message } = await conversation.waitFor("message:text");
  const numbers = message.text.split(",");
  await ctx.reply("The sum of these numbers is: " + sumStrings(numbers));
}

/** Converts all given strings to numbers and adds them up */
function sumStrings(numbers) {
  let sum = 0;
  for (const str of numbers) {
    const n = parseInt(str.trim(), 10);
    if (!isNaN(n)) {
      sum += n;
    }
  }
  return sum;
}
```

:::

It's just JavaScript.

### Modules and Classes

JavaScript has higher-order functions, classes, and other ways of structuring your code into modules.
Naturally, all of them can be turned into conversations.

Here is the above code once again, refactored to a module with simple dependency injection.

::: code-group

```ts [TypeScript]
/**
 * A module that can ask the user for numbers, and that
 * provides a way to add up numbers sent by the user.
 *
 * Requires a conversation handle to be injected.
 */
function sumModule(conversation: Conversation) {
  /** Converts all given strings to numbers and adds them up */
  function sumStrings(numbers) {
    let sum = 0;
    for (const str of numbers) {
      const n = parseInt(str.trim(), 10);
      if (!isNaN(n)) {
        sum += n;
      }
    }
    return sum;
  }

  /** Asks the user for numbers */
  async function askForNumbers(ctx: Context) {
    await ctx.reply("Send me your favorite numbers, separated by commas!");
  }

  /** Waits for the user to send numbers, and replies with their sum */
  async function sumUserNumbers() {
    const ctx = await conversation.waitFor(":text");
    const sum = sumStrings(ctx.msg.text);
    await ctx.reply("The sum of these numbers is: " + sum);
  }

  return { askForNumbers, sumUserNumbers };
}

/** A conversation to add numbers */
async function sumConvo(conversation: Conversation, ctx: Context) {
  const mod = sumModule(conversation);
  await mod.askForNumbers(ctx);
  await mod.sumUserNumbers();
}
```

```js [JavaScript]
/**
 * A module that can ask the user for numbers, and that
 * provides a way to add up numbers sent by the user.
 *
 * Requires a conversation handle to be injected.
 */
function sumModule(conversation: Conversation) {
  /** Converts all given strings to numbers and adds them up */
  function sumStrings(numbers) {
    let sum = 0;
    for (const str of numbers) {
      const n = parseInt(str.trim(), 10);
      if (!isNaN(n)) {
        sum += n;
      }
    }
    return sum;
  }

  /** Asks the user for numbers */
  async function askForNumbers(ctx: Context) {
    await ctx.reply("Send me your favorite numbers, separated by commas!");
  }

  /** Waits for the user to send numbers, and replies with their sum */
  async function sumUserNumbers() {
    const ctx = await conversation.waitFor(":text");
    const sum = sumStrings(ctx.msg.text);
    await ctx.reply("The sum of these numbers is: " + sum);
  }

  return { askForNumbers, sumUserNumbers };
}

/** A conversation to add numbers */
async function sumConvo(conversation: Conversation, ctx: Context) {
  const mod = sumModule(conversation);
  await mod.askForNumbers(ctx);
  await mod.sumUserNumbers();
}
```

:::

This is clearly overkill for such a simple task as adding up a few numbers.
However, it illustrates a broader point.

You guessed it:
It's just JavaScript.

## Persisting Conversations

By default, all data stored by the conversations plugin is kept in memory.
This means that when your process dies, all conversations are exited and will have to be restarted.

If you want to persist the data across server restarts, you need to connect the conversations plugin to a database.
We have built [a lot of different storage adapters](https://github.com/grammyjs/storages/tree/main/packages#grammy-storages) to make this simple.
(They are the same adapters that the [session plugin uses](./session#known-storage-adapters).)

Let's say you want to store data on disk in a directory called `convo-data`.
This means that you need the [`FileAdapter`](https://github.com/grammyjs/storages/tree/main/packages/file#installation).

::: code-group

```ts [Node.js]
import { FileAdapter } from "@grammyjs/storage-file";

bot.use(conversations({
  storage: new FileAdapter({ dirName: "convo-data" }),
}));
```

```ts [Deno]
import { FileAdapter } from "https://deno.land/x/grammy_storages/file/src/mod.ts";

bot.use(conversations({
  storage: new FileAdapter({ dirName: "convo-data" }),
}));
```

:::

Done!

### Versioning Data

If you persist the state of the conversation in a database and then update the source code, there is a mismatch between the stored data and the conversation builder function.
This is a form of data corruption and will break the replay.

You can prevent this by specifying a version of your code.
Every time you change your conversation, you can increment the version.
The conversations plugin will then detect a version mismatch and migrate all data automatically.

```ts
bot.use(conversations({
  storage: {
    type: "key",
    version: 42, // can be number or string
    adapter: storageAdapter,
  },
}));
```

If you do not specify a version, it defaults to `0`.

:::tip Forgot to Change the Version? Don't Worry!

The conversations plugin already has good protections in place that should catch most cases of data corruption.
If this is detected, an error is thrown somewhere inside the conversation, which causes the conversation to crash.
Assuming that you don't catch and suppress that error, the conversation will therefore wipe the bad data and restart correctly.

That being said, this protection does not cover 100 % of the cases so you should definitely make sure to update the version number in the future.

:::

### Non-serializable Data

[Remember](#conversations-store-state) that all data returned from `conversation.external` will be stored.
This means that all data returned from `conversation.external` must be serializable.

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

If you want to throw an error from the task, you can specify additional serialization functions for error objects.
Check out [`ExternalOp`](/ref/conversations/externalop) in the API reference.

### Storage Keys

By default, conversation data is stored per chat.
This is identical to [how the session plugin works](./session#session-keys).

As a result, a conversation cannot handle updates from multiple chats.
If this is desired, you can [define your own storage key function](/ref/conversations/conversationoptions#storage).
As with sessions, it is [not recommended](./session#session-keys) to use this option in serverless environments.

You can specify the storage key function as follows.

```ts
bot.use(conversations({
  storage: {
    type: "key",
    adapter: storageAdapter,
    getStorageKey: (ctx) => ctx.from?.id.toString(),
  },
}));
```

Check out the API reference for [`ConversationStorage`](/ref/conversations/conversationstorage) to see more details about storing data with the conversations plugin.
Among other things, it will explain how to store data without a storage key function at all using `type: "context"`.

## Using Plugins Inside Conversations

[Remember](#conversational-context-objects) that the context objects inside conversations are independent from the context objects in the surrounding middleware.
This means that they will have to plugins installed on them by default.

Fortunately, all grammY plugins [except sessions](#accessing-sessions-inside-conversations) are compatible with conversations.
For example, this is how you can install the [hydrate plugin](./hydrate) for a conversation.

::: code-group

```ts [TypeScript]
// Only install the conversations plugin outside.
type MyContext = ConversationFlavor<Context>;
// Only install the hydrate plugin inside.
type MyConversationContext = HydrateFlavor<Context>;

bot.use(conversations());

type MyConversation = Conversation<MyContext, MyConversationContext>;
async function convo(conversation: MyConversation, ctx: MyConversationContext) {
  // hydrate plugin is installed on `ctx` here
  const other = await conversation.wait();
  // hydrate plugin is installed on `other` here, too
}
bot.use(createConversation(convo, { plugins: [hydrate()] }));

bot.command("enter", async (ctx) => {
  // hydrate plugin is NOT installed on `ctx` here
  await ctx.conversation.enter("convo");
});
```

```js [JavaScript]
bot.use(conversations());

async function convo(conversation, ctx) {
  // hydrate plugin is installed on `ctx` here
  const other = await conversation.wait();
  // hydrate plugin is installed on `other` here, too
}
bot.use(createConversation(convo, { plugins: [hydrate()] }));

bot.command("enter", async (ctx) => {
  // hydrate plugin is NOT installed on `ctx` here
  await ctx.conversation.enter("convo");
});
```

:::

In regular [middleware](../guide/middleware), plugins get to run some code on the current context object, then call `next` to wait for downstream middleware, and then they get to run some code again.

Conversations are not middleware, and plugins will work slightly differently in this context.
When a [context object is created](#conversational-context-objects) by the conversation, it will be passed through the array of plugins.
Each plugin gets access to the context object, then `next` resolves immediately, and the plugins can run some more code.
Only after this, the context object is made available to the conversation.

As a result, any cleanup work done by plugins is performed before the conversation builder function runs.
All plugins except sessions work well with this.
If you want to use sessions, [scroll down](#accessing-sessions-inside-conversations).

### Default Plugins

If you have a lot of conversations that all need the same set of plugins, you can define default plugins.
Now, you no longer have to pass `hydrate` to `enterConversation`.

```ts
bot.use(conversations({
  plugins: [hydrate()],
}));
// ...
bot.use(createConversation(convo));
```

Make sure to install the context flavors of all default plugins on the inside context types of all conversations.

### Using Transformer Plugins Inside Conversations

If you install a plugin via `bot.api.config.use`, then you cannot pass it to the `plugins` array directly.
Instead, you have to install it on the `Api` instance of each context object.
This is done easily from inside a regular middleware plugin.

```ts
bot.use(createConversation(convo, {
  plugins: [async (ctx, next) => {
    ctx.api.config.use(transformer);
    await next();
  }],
}));
```

Replace `transformer` by whichever plugin you want to install.
You can install several transformers in the same call to `ctx.api.config.use`.

### Accessing Sessions Inside Conversations

Due to the way [how plugins work inside conversations](#using-plugins-inside-conversations), the session plugin cannot be installed inside a conversation in the same way as other plugins.
You cannot pass it to the `plugins` array because it would:

1. read data,
2. call `next` (which resolves immediately),
3. write back the exact same data, and
4. hand over the context to the conversation.

Note how the session gets saved before you change it.
This means that all changes to the session data get lost.

Instead, you can use `conversation.external` to get [access to the outside context object](#conversational-context-objects).
It has the session plugin installed.

```ts
// Read session data inside a conversation.
const session = await conversation.external((ctx) => ctx.session);

// Change the session data inside a conversation.
session.count += 1;

// Save session data inside a conversation.
await conversation.external((ctx) => {
  ctx.session = session;
});
```

In a sense, the session plugin can be seen as performing side-effects.
After all, it stores data in a database.
Given that we must follow [The Golden Rule](#the-golden-rule-of-conversations), it only makes sense that session access needs to be wrapped inside `conversation.external`.

## Conversational Menus

You can define a menu with the [menu plugin](./menu) outside a conversation, and then pass it to the `plugins` array [like any other plugin](#using-plugins-inside-conversations).

However, this means that the menu does not have access to the conversation handle `conversation` in its button handlers.
As a result, you cannot wait for updates from inside a menu.

Ideally, when a button is clicked, it should be possible to wait for a message by the user, and then perform menu navigation when the user replies.
This is made possible by `conversation.menu()`.
It lets you define _conversational menus_.

```ts
let email = "";

const emailMenu = conversation.menu()
  .text("Get current email", (ctx) => ctx.reply(email || "empty"))
  .text(() => email ? "Change email" : "Set email", async (ctx) => {
    await ctx.reply("What is your email?");
    const response = await conversation.waitFor(":text");
    email = response.msg.text;
    await ctx.reply(`Your email is ${email}!`);
    ctx.menu.update();
  })
  .row()
  .url("Privacy policy", "https://example.com");

const otherMenu = conversation.menu()
  .submenu("Go to email menu", emailMenu, async (ctx) => {
    await ctx.reply("Navigating");
  });

await ctx.reply("Here is your menu", {
  reply_markup: otherMenu,
});
```

`conversation.menu()` returns a menu that can be built up by adding buttons the same way the menu plugin does.
If fact, if you look at [`ConversationMenuRange`](/ref/conversations/conversationmenurange) in the API reference, you will find it to be very similar to [`MenuRange`](/ref/menu/menurange) from the menu plugin.

Conversational menus stay active only as long as the conversation active.
You should call `ctx.menu.close()` for all menus before exiting the conversation.

If you want to prevent the conversation from exiting, you can simply use the following code snippet at the end of your conversation.

```ts
// Wait forever.
await conversation.waitUntil(() => false, {
  otherwise: (ctx) => ctx.reply("Please use the menu above!"),
});
```

Finally, note that conversational menus are guaranteed to never interfere with outside menus.
In other words, an outside menu will never handle the update of a menu inside a conversation, and vice-versa.

### Menu Plugin Interoperation

When you define a menu outside a conversation and use it to enter a conversation, you can define a conversational menu that takes over as long as the conversation is active.
When the conversation completes, the outside menu will take control again.

You first have to give the same menu identifer to both menus.

```ts
// Outside conversation (menu plugin):
const menu = new Menu("my-menu");
// Inside conversation (conversations plugin):
const menu = conversation.menu("my-menu");
```

In order for this to work, you must ensure that both menus have the exact same structure when you transition the control in or out of the conversation.
Otherwise, when a button is clicked, the menu will be [detected as outdated](./menu#outdated-menus-and-fingerprints), and the button handler will not be called.

The structure is defined as follows.

- The shape of the menu (number of rows, or number of buttons in any row).
- The label on the button.

It is usually advisable to first edit the menu to a shape that makes sense inside the conversation, and then enter the conversation.
The conversation can then define a matching menu which will be active immediately.

Similarly, if the conversation leaves behind any menus (by not closing them), outside menus can take over control again.
Again, the structure of the menus has to match.

## Conversational Forms

- `conversation.form`
- building custom form fields

## Concurrent Wait Calls

- waiting for several update via floating promises
- when does the conversation exit
- halting a conversation

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

