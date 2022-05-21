# Conversations (`conversations`)

Create powerful conversational interfaces with ease.

## Introduction

Most chats consist of more than just one single message. (duh)

For example, you may want to ask the user a question, and then wait for the response.
This may even go back and forth several times, so that a conversation unfolds.

When you think about [middleware](/guide/middleware.md), you will notice that everything is based around a single [context object](/guide/context.md) per handler.
This means that you always only handle a single message in isolation.
It is not easy to write something like "check the text three messages ago" or something.

**This plugin comes to the rescue:**
It provides an extremely flexible way to define conversations between your bot and your users.

Many bot frameworks make you define large configuration objects with steps and stages and jumps and wizard flows and what have you.
This leads to a lot of boilerplate code, and makes it hard to follow along.
**This plugin does not work that way.**

Instead, with plugin, you will use something much more powerful: **code**.
Basically, you simply define a normal JavaScript function which lets you define how the conversation evolves.
As the bot and the user talk to each other, the function will be executed statement by statement.

(To be fair, that's not actually how it works.
But it is very helpful to think of it that way!
In reality, your function will be executed a bit differently, but we'll get to that [later](#waiting-for-updates).)

## Simple Example

Before we dive into how you can create conversations, have a look at a short JavaScript example of how a conversation will look.

```js
async function greeting(conversation, ctx) {
  await ctx.reply("Hi there! What is your name?");
  const { message } = await conversation.wait();
  await ctx.reply(`Welcome to the chat, ${message.text}!`);
}
```

In this conversation, the bot will first greet the user, and ask for their name.
Then it will wait until the user sends their name.
Lastly, the bot welcomes the user to the chat, repeating the name.

Easy, right?
Let's see how it's done!

## Conversation Builder Functions

First of all, lets import a few things.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import {
  type Conversation,
  type ConversationFlavor,
  createConversation,
} from "@grammyjs/conversations";
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { createConversation } = require("@grammyjs/conversations");
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import {
  type Conversation,
  type ConversationFlavor,
  createConversation,
} from "https://deno.land/x/grammy_conversations/mod.ts";
```

</CodeGroupItem>
</CodeGroup>

The main element of a conversation is a function with two arguments.
We call this the _conversation builder function_.

```js
async function greeting(conversation, ctx) {
  // TODO code the conversation
}
```

Let's see what the two parameters are.

**The second parameter** is not that interesting, it is just a regular context object.
As always, it is called `ctx` and uses your custom context type (maybe called `MyContext`).
The conversations plugin exports a [transformative context flavor](/guide/context.md#transformative-context-flavors) called `ConversationFlavor`.

**The first parameter** is the central element of this plugin.
It is commonly named `conversation`, and it has the type `Conversation` ([API reference](https://doc.deno.land/https://deno.land/x/grammy_conversations/mod.ts/~/Conversation)).
It can be used as a handle to control the conversation, such as waiting for user input, and more.
The type `Conversation` expects your custom context type as a type parameter, so you would often use `Conversation<MyContext>`.

In summary, in TypeScript, your conversation builder function will look like this.

```ts
type MyContext = ConversationFlavor<Context>;
type MyConversation = Conversation<MyContext>;

async function greeting(conversation: MyConversation, ctx: MyContext) {
  // TODO code the conversation
}
```

Inside of your conversation builder function, you can now define how the conversation should look.

Let's now see how you can actually enter the conversation.

## Installing and Entering a Conversation

First of all, you **must** use [the session plugin](/plugins/session.md) if you want to use the conversations plugin.

```ts
bot.use(session({
  initial() {
    // return empty object for now
    return {};
  },
}));
```

Next, you can install the conversation builder function as middleware on your bot object by wrapping it inside `createConversation`.

```ts
bot.use(createConversation(greeting));
```

Now that your conversation is registered on the bot, you can enter the conversation from any handler.

```ts
bot.command("start", (ctx) => {
  ctx.conversation.enter("greeting");
});
```

As soon as the user sends `/start` to the bot, the conversation will be entered.
The current context object is passed as the second argument to the conversation builder function.
For example, if you start your conversation with `await ctx.reply(ctx.message.text)`, it will echo `/start` to the user, because `/start` is the message text that was received when the conversation was entered.

::: tip Change the Conversation Identifier
By default, you have to pass the name of the function to `ctx.conversation.enter()`.
However, if you prefer to use a different identifier, you can specify it like so:

```ts
bot.use(createConversation(greeting, "new-name"));
```

In turn, you can enter the conversation with it:

```ts
bot.command("start", (ctx) => {
  ctx.conversation.enter("new-name");
});
```

:::

## Leaving a Conversation

The conversation will run until your conversation builder function completes.
This means that you can simply leave a conversation by using `return`.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function hiAndBye(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Hi! And Bye!");
  // Leave the conversation:
  return;
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function hiAndBye(conversation, ctx) {
  await ctx.reply("Hi! And Bye!");
  // Leave the conversation:
  return;
}
```

</CodeGroupItem>
</CodeGroup>

(Yes, putting a `return` at the end of the function is a bit pointless, but you get the idea.)

You can also throw an error.
This will likewise exit the conversation.
Remember to [install an error handler](/guide/errors.md) on your bot.

If you want to hard-kill the conversation while it is waiting for user input, you can also use `ctx.conversation.exit()`.
However, this tends to make your code less readable, so it's often better to stick with simply returning from the function.

## Waiting for Updates

You can use the conversation handle `conversation` to wait for the next update in this particular chat.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function waitForMe(conversation: MyConversation, ctx: MyContext) {
  // Wait for the next update:
  const newContext = await conversation.wait();
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function waitForMe(conversation, ctx) {
  // Wait for the next update:
  const newContext = await conversation.wait();
}
```

</CodeGroupItem>
</CodeGroup>

An update can mean that a text message was sent, or a button was pressed, or something was edited, or virtually any other action was performed by the user.

Usually, outside of the conversations plugin, every one of these updates would be handled by [the middleware system](/guide/middleware.md) of your bot.
Hence, your bot would handle the update via a context object which gets passed to your handlers.

In conversations, you will obtain this new context object from the `wait` call.
In turn, you can handle different updates differently based on this object.
For example, you can check for text messages:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function waitForMe(conversation: MyConversation, ctx: MyContext) {
  // Wait for the next update:
  ctx = await conversation.wait();
  // Check for text:
  if (ctx.message.text) {
    // ...
  }
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function waitForMe(conversation, ctx) {
  // Wait for the next update:
  ctx = await conversation.wait();
  // Check for text:
  if (ctx.message.text) {
    // ...
  }
}
```

</CodeGroupItem>
</CodeGroup>

Let's now see how wait calls actually work.
As mentioned earlier, **they don't _literally_ make your bot wait**, even though we can program conversations as if that was the case.

## Rules and Side-effects

There are a few rules to the code you write inside a conversation builder function.
Before diving into the actual rules, here is what `wait` call really do internally.

### How `wait` Calls Work

> [Skip this part](#golden-rules-of-conversations) if you want to learn _how_ to build things without reading about _why_ you need to build them that way.

The naïve approach to implementing a `wait` call in the conversations plugin would be to create a new promise, and to wait until the next context object arrives.
As soon as it does, we resolve the promise, and the conversation can continue.

However, this is a bad idea for several reasons.

**Data Loss.**
What if your server crashes while waiting for a context object?
In that case, we lose all information about the state of the conversation.
Basically, the bot loses its train of thought, and the user has to start over.
This is bad desgin and annoying.

**Blocking.**
If wait calls would block until the next update arrives, it means that the middleware execution for the first update can't complete until the entire conversation completes.

- For built-in polling, this means that no further updates can be processed until the current one is done.
  Hence, the bot would simply be blocked forever.
- For [the grammY runner](./runner.md), the bot would not be blocked.
  However, when processing thousands of conversations in parallel with different users, it would consume potentially very large amounts of memory.
  If many users stop responding, this leaves the bot stuck in the middle of countless conversations.
- Webhooks have their own whole [category of problems](/guide/deployment-types.html#ending-webhook-requests-in-time) with long-running middleware.

**State.**
On serverless infrastructure such as cloud functions, we cannot actually assume that the same instance handles two subsequent updates from the same user.
Hence, if we were to create stateful conversations, they may randomly break all the time, as some `wait` calls don't resolve, but some other middleware is suddenly executed.
The result is an abundance of random bugs and chaos.

There are more problems, but you get the idea.

Consequently, the conversations plugin does things differently.

The conversations plugin tracks the execution of your function.
When a wait call is reached, it serializes the state of execution into the session, and safely stores it in a database.
When the next update arrives, it first inspects the session data.
If it finds that it left off in the middle of a conversation, it deserializes the state of execution, takes your conversation builder function, and replays it up to the point of the last `wait` call.
It then switches back to normal execution mode, and resumes ordinary execution of your function—until the next `wait` call is reached, and the execution must be haltet again.

What do we mean by the state of execution?
In a nutshell, it consists on three things:

1. The conversation builder function.
2. Incoming and outgoing messages.
3. External events and effects, such as randomness or calls to external APIs or databases.

The plugin has access to the conversation builder function, so starting, stopping, and replaying the function is easy.
The plugin also tracks all incoming updates as well as all Bot API calls, so point 2 is similarly easy.

However, the plugin has no control over external events, side-effects, or randomness.
For example, you could this:

```ts
if (Math.random() < 0.5) {
  // do one thing
} else {
  // do another thing
}
```

In that case, when replaying the function, it may suddenly behave differently every time, so replaying the function will break!

Don't worry, you can still use external events and randomness if you want.
However, in order for the plugin to work correctly, you need to follow some rules in your conversation builder function.

### Golden Rules of Conversations

The code in conversation builder functions must follow these three golden rules.

#### Rule I: All Side-effects Must Be Wrapped

Code that depends on external system such as databases, APIs, files, or other resources which could change from one execution to the next must be wrapped in `conversation.external()` calls.

```ts
// BAD
const response = await externalApi();
// GOOD
const response = await conversation.external(() => externalApi());
```

This includes both reading data, as well as performing side-effects (such as writing to a database).

::: tip Comparable to React

If you are familiar with React, you may know a comparable concept from `useEffect`.

:::

#### Rule II: All Random Behavior Must Be Wrapped

Code that depends on randomness or on global state which could change, must wrap all access to it in `conversation.external()` calls, or use the `conversation.random()` convenience function.

```ts
// BAD
if (Math.random() < 0.5) { /* do stuff */ }
// GOOD
if (conversation.random() < 0.5) { /* do stuff */ }
```

#### Rule III: Use Convenience Functions

There are a bunch of things installed on `conversation` which may greatly help you.
Your code doesn't exactly break if you don't use them, but it can be slow or behave in a confusing way.
The end user might not notice a difference, though.

```ts
// Sleep via conversation, massive performance improvement
await conversation.sleep(3000); // 3 seconds

// Debug logging via conversation, does not print confusing logs
conversation.log("Hello, world");
```

Note that you can do all of the above via `conversation.external()`, but this can be tedious to type, so it's just easier to use the convenience functions.

## Variables, Branching, and Loops

If you follow the three rules above, you are completely free to use any code you like.
We will now go through a few concepts that you already know from programming, and show how they translate to clean and readable conversations.

Imagine that all code below is written inside a conversation builder function.

You can declare variables and do whatever you want with them.

```ts
await ctx.reply("Send me you favorite numbers, separated by commas!");
const { message } = await conversation.wait();
const sum = message.text
  .split(",")
  .map((n) => parseInt(n.trim(), 10))
  .reduce((x, y) => x + y);
await ctx.reply("The sum of these numbers is: " + sum);
```

Branching works, too.

```ts
await ctx.reply("Send me a photo!");
const { photo } = await conversation.wait();
if (!photo) {
  await ctx.reply("That is not a photo! I'm out!");
  return;
}
```

So do loops:

```ts
do {
  await ctx.reply("Send me a photo!");
  ctx = await conversation.wait();

  if (ctx.message?.text === "/cancel") {
    await ctx.reply("Cancelled, leaving!");
    return;
  }
} while (!ctx.photo);
```

## Functions and Recursion

You can also split up your code in several functions, and reuse them.
For example, this is how you can define a reusable captcha.

```ts
async function captcha(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Prove you are human! What is the answer to everything?");
  const { message } = await conversation.wait();
  return message?.text === "42";
}
```

It returns `true` if the user may pass, and `false` otherwise.
You can now use it in your main conversation builder function like this:

```ts
async function enterGroup(conversation: MyConversation, ctx: MyContext) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("Welcome!");
  else await ctx.banChatMember();
}
```

See how the captcha function can be reused in different places in your code.

> This simple example is only meant to illustrate how functions work.
> In reality, it may work poorly because it only waits for a new update from the chat, but without verifying that it actually comes from the user who joined.
> In this case, you may want to use [parallel conversations](#parallel-conversations).

If you want, you can also split your code across even more fuctions, or use recursion, mutual recursion, generators, and so on.
(Just make sure that all functions follow [the three rules](#golden-rules-of-conversations).)

Naturally, you can use error handling in your functions, too.
Regulary `try`-`catch` statement work just fine, also across functions.
After all, conversations are just JavaScript.

If the main conversation function throws, the error will propagate further into [the error handling mechanisms](/guide/errors.md) of your bot.

## Modules and Classes

Naturally, you can just move your functions across modules.
That way, you can define some functions in one file, `export` them, and then `import` and use them in another file.

If you want, you can also define classes.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
class Auth {
  public token?: string;

  constructor(private conversation: MyConversation) {}

  authenticate(ctx: MyContext) {
    const link = getAuthLink(); // get auth link from your system
    await ctx.reply(
      "Open this link to obtain a token, and sent it back to me: " + link,
    );
    ctx = await this.conversation.wait();
    this.token = ctx.message?.text;
  }

  isAuthenticated(): this is Auth & { token: string } {
    return this.token !== undefined;
  }
}

async function askForToken(conversation: MyConversation, ctx: MyContext) {
  const auth = new Auth(conversation);
  await auth.authenticate(ctx);
  if (auth.isAuthenticated()) {
    const token = auth.token;
    // do stuff with token
  }
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```ts
class Auth {
  constructor(conversation) {
    this.conversation = conversation;
  }

  authenticate(ctx) {
    const link = getAuthLink(); // get auth link from your system
    await ctx.reply(
      "Open this link to obtain a token, and sent it back to me: " + link,
    );
    ctx = await this.conversation.wait();
    this.token = ctx.message?.text;
  }

  isAuthenticated() {
    return this.token !== undefined;
  }
}

async function askForToken(conversation, ctx) {
  const auth = new Auth(conversation);
  await auth.authenticate(ctx);
  if (auth.isAuthenticated()) {
    const token = auth.token;
    // do stuff with token
  }
}
```

</CodeGroupItem>
</CodeGroup>

The point here is not so much that we strictly recommend you to do this.
It is rather meant as an example for how you can use the endless flexibilities of JavaScript to structure your code.

## Forms

> This has not been implemented yet.

Notes:

- lots of utils are provided to build proper forms, such as `conversation.waitFor('message:text')`
- even integrations with other plugins

## Parallel Conversations

> This has not been implemented yet.

Notes:

- several conversations in a group chat with different members (at the same time)
- you can skip updates via `await conversation.skip()`, hence giving back control to the middleware system
- you can then start a new conversation in parallel
- how to install timeouts and timeout handlers for individual conversations
- listing active conversations

## External Events

> This has not been implemented yet.

Notes:

- we can wait for external events and only resume execution after that
- show how to do that

## How It Works

Notes:

- magical promise
- must work across server restarts
- logging and replaying
- reason for no side-effects or non-deterministic behavior

## Plugin Summary

- Name: `conversations`
- Source: <https://github.com/grammyjs/conversations>
- Reference: <https://doc.deno.land/https://deno.land/x/grammy_conversations/mod.ts>
