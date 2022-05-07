# Conversations (`conversations`)

Create powerful conversational interfaces with ease.

## Introduction

Most chats consist of more than just one single message. (duh)

For example, you may want to ask the user a question, and then wait for the response.
This may even go back and forth several times, so that a conversation unfolds.

When you think about [middleware](/guide/middleware.md), you will notice that everything is based around a context object.
This means that you always only handle a single message in isolation.
It is not easy to write something like "check the text three messages ago" or something.

**This plugin comes to the rescue:**
It provides an extremely flexible way to define conversations between your bot and your users.

Many bot frameworks make you define large configuration objects with steps and stages jumps and wizard flows and what have you.
This leads to a lot of boilerplate code.
**This plugin does not work that way.**

Instead, with plugin, you will use something **much more powerful: code**.
Basically, you simply define a normal JavaScript function which lets you define how the conversation evolves.
As the bot and the user talk to each other, statement by statement in the fuction will be executed.

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

**The second parameter** is a regular context object.
As always, it is called `ctx` and uses your custom context type (maybe called `MyContext`).

The conversations plugin exports a [transformative context flavor](/guide/context.md#transformative-context-flavors) called `ConversationFlavor`.
For example, you could define your custom context type like this.

```ts
// Define custom context type (will be used for the second parameter).
type MyContext = ConversationFlavor<Context>;
```

**The first parameter** is commonly named `conversation`, and it has the type `Conversation` ([API reference](https://doc.deno.land/https://deno.land/x/grammy_conversations/mod.ts/~/Conversation)).
It can be used as a handle to control the conversation, such as waiting for user input, and more.
The type `Conversation` expects your custom context type as a type parameter, so you would often use `Conversation<MyContext>`.

```ts
// Define the type of the first parameter.
type MyConversation = Conversation<MyContext>;
```

In summary, in TypeScript, your conversation builder function will look like this.

```ts
async function greeting(conversation: MyConversation, ctx: MyContext) {
  // define conversation
}
```

Inside of your conversation builder function, you can write your conversation definiton.

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
For example, if you start your conversation with `console.log(ctx.message.text)`, it will print `/start` to the console.

::: tip Change the Conversation Name
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

```ts
async function greeting(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Hi! And Bye!");
  // Leave the conversation:
  return;
}
```

You can also throw an error.
This will likewise exit the conversation.
Remember to [install an error handler](/guide/errors.md) on your bot.

If you want to hard-kill the conversation while it is waiting for user input, you can also use `ctx.conversation.exit()`.

## Waiting for Updates

Notes:

- how to wait for updates
- why new context

## Side-effects

Notes:

- must not perform side-effects
- can perform then in external calls
- must not perform non-deterministic stuff
- can perform that in external calls
- have convenience methods for it: logging, random, sleeping

## Variables, Branching and Loops

Notes:

- we can have variables
- we can have branching
- we can have loops

## Functions and Recursion

Notes:

- we can split things across reusable functions
- they can have return values
- we can use recursion

## Error Handling

Notes:

- try-catch-finally works normally
- works even across functions

## Modules

Notes:

- we can divide up the code across modules

## Forms

Notes:

- lots of utils are provided to build proper forms
- even integrations with other plugins

## External Events

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
