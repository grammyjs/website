# Conversations (`conversations`)

Create powerful conversational interfaces with ease.

## Introduction

Most chats consist of more than just one single message. (duh)

For example, you may want to ask the user a question, and then wait for the response.
This may even go back and forth several times, so that a conversation unfolds.

When you think about [middleware](../guide/middleware.md), you will notice that everything is based around a single [context object](../guide/context.md) per handler.
This means that you always only handle a single message in isolation.
It is not easy to write something like "check the text three messages ago" or something.

**This plugin comes to the rescue:**
It provides an extremely flexible way to define conversations between your bot and your users.

Many bot frameworks make you define large configuration objects with steps and stages and jumps and wizard flows and what have you.
This leads to a lot of boilerplate code, and makes it hard to follow along.
**This plugin does not work that way.**

Instead, with this plugin, you will use something much more powerful: **code**.
Basically, you simply define a normal JavaScript function which lets you define how the conversation evolves.
As the bot and the user talk to each other, the function will be executed statement by statement.

(To be fair, that's not actually how it works under the hood.
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
  conversations,
  createConversation,
} from "@grammyjs/conversations";
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const {
  conversations,
  createConversation,
} = require("@grammyjs/conversations");
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations/mod.ts";
```

</CodeGroupItem>
</CodeGroup>

With that out of the way, we can now have a look at how to define conversational interfaces.

The main element of a conversation is a function with two arguments.
We call this the _conversation builder function_.

```js
async function greeting(conversation, ctx) {
  // TODO: code the conversation
}
```

Let's see what the two parameters are.

**The second parameter** is not that interesting, it is just a regular context object.
As always, it is called `ctx` and uses your [custom context type](../guide/context.md#customizing-the-context-object) (maybe called `MyContext`).
The conversations plugin exports a [context flavor](../guide/context.md#additive-context-flavors) called `ConversationFlavor`.

**The first parameter** is the central element of this plugin.
It is commonly named `conversation`, and it has the type `Conversation` ([API reference](https://doc.deno.land/https://deno.land/x/grammy_conversations/mod.ts/~/Conversation)).
It can be used as a handle to control the conversation, such as waiting for user input, and more.
The type `Conversation` expects your [custom context type](../guide/context.md#customizing-the-context-object) as a type parameter, so you would often use `Conversation<MyContext>`.

In summary, in TypeScript, your conversation builder function will look like this.

```ts
type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

async function greeting(conversation: MyConversation, ctx: MyContext) {
  // TODO: code the conversation
}
```

Inside of your conversation builder function, you can now define how the conversation should look.
Before we go in depth about every feature of this plugin, let's have a look at a more complex example than the [simple one](#simple-example) above.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function movie(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("How many favorite movies do you have?");
  const count = await conversation.form.number();
  const movies: string[] = [];
  for (let i = 0; i < count; i++) {
    await ctx.reply(`Tell me number ${i + 1}!`);
    const titleCtx = await conversation.waitFor(":text");
    movies.push(titleCtx.msg.text);
  }
  await ctx.reply("Here is a better ranking!");
  movies.sort();
  await ctx.reply(movies.map((m, i) => `${i + 1}. ${m}`).join("\n"));
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function movie(conversation, ctx) {
  await ctx.reply("How many favorite movies do you have?");
  const count = await conversation.form.number();
  const movies = [];
  for (let i = 0; i < count; i++) {
    await ctx.reply(`Tell me number ${i + 1}!`);
    const titleCtx = await conversation.waitFor(":text");
    movies.push(titleCtx.msg.text);
  }
  await ctx.reply("Here is a better ranking!");
  movies.sort();
  await ctx.reply(movies.map((m, i) => `${i + 1}. ${m}`).join("\n"));
}
```

</CodeGroupItem>
</CodeGroup>

Can you figure out how this bot will work?

## Installing and Entering a Conversation

First of all, you **must** use the [session plugin](./session.md) if you want to use the conversations plugin.
You also have to install the conversations plugin itself, before you can register individual conversations on your bot.

```ts
// Install the session plugin.
bot.use(session({
  initial() {
    // return empty object for now
    return {};
  },
}));

// Install the conversations plugin.
bot.use(conversations());
```

Next, you can install the conversation builder function as middleware on your bot object by wrapping it inside `createConversation`.

```ts
bot.use(createConversation(greeting));
```

Now that your conversation is registered on the bot, you can enter the conversation from any handler.
Make sure to use `await` for all methods on `ctx.conversation`---otherwise your code will break.

```ts
bot.command("start", async (ctx) => {
  await ctx.conversation.enter("greeting");
});
```

As soon as the user sends `/start` to the bot, the conversation will be entered.
The current context object is passed as the second argument to the conversation builder function.
For example, if you start your conversation with `await ctx.reply(ctx.message.text)`, it will contain the update that contains `/start`.

::: tip Change the Conversation Identifier

By default, you have to pass the name of the function to `ctx.conversation.enter()`.
However, if you prefer to use a different identifier, you can specify it like so:

```ts
bot.use(createConversation(greeting, "new-name"));
```

In turn, you can enter the conversation with it:

```ts
bot.command("start", (ctx) => ctx.conversation.enter("new-name"));
```

:::

In total, your code should now roughly look like this:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context, session } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

const bot = new Bot<MyContext>("");

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

/** Defines the conversation */
async function greeting(conversation: MyConversation, ctx: MyContext) {
  // TODO: code the conversation
}

bot.use(createConversation(greeting));

bot.command("start", async (ctx) => {
  // enter the function "greeting" you declared
  await ctx.conversation.enter("greeting");
});

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { Bot, Context, session } = require("grammy");
const {
  conversations,
  createConversation,
} = require("@grammyjs/conversations");

const bot = new Bot("");

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

/** Defines the conversation */
async function greeting(conversation, ctx) {
  // TODO: code the conversation
}

bot.use(createConversation(greeting));

bot.command("start", async (ctx) => {
  // enter the function "greeting" you declared
  await ctx.conversation.enter("greeting");
});

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot, Context, session } from "https://deno.land/x/grammy/mod.ts";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations/mod.ts";

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

const bot = new Bot<MyContext>("");

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

/** Defines the conversation */
async function greeting(conversation: MyConversation, ctx: MyContext) {
  // TODO: code the conversation
}

bot.use(createConversation(greeting));

bot.command("start", async (ctx) => {
  // enter the function "greeting" you declared
  await ctx.conversation.enter("greeting");
});

bot.start();
```

</CodeGroupItem>
</CodeGroup>

### Installation With Custom Session Data

Note that if you use TypeScript and you want to store your own session data as well as use conversations, you will need to provide more type information to the compiler.
Let's say you have this interface which describes your custom session data:

```ts
interface SessionData {
  /** custom session property */
  foo: string;
}
```

Your custom context type might then look like this:

```ts
type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor;
```

Most importantly, when installing the session plugin with an external storage, you will have to provide the session data explicitly.
All storage adapters allow you to pass the `SessionData` as a type parameter.
For example, this is how you'd have to do it with the [`freeStorage`](./session.md#free-storage) that grammY provides.

```ts
// Install the session plugin.
bot.use(session({
  // Add session types to adapter.
  storage: freeStorage<SessionData>(bot.token),
  initial: () => ({ foo: "" }),
}));
```

You can do the same thing for all other storage adapters, such as `new FileAdapter<SessionData>()` and so on.

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
Remember to [install an error handler](../guide/errors.md) on your bot.

If you want to hard-kill the conversation while it is waiting for user input, you can also use `await ctx.conversation.exit()`.
It's often better to stick with simply returning from the function, but there are a few examples where using `await ctx.conversation.exit()` is convenient.
Remember that you must `await` the call.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts{6,21}
async function movie(conversation: MyConversation, ctx: MyContext) {
  // TODO: code the conversation
}

// Install the conversations plugin.
bot.use(conversations());

// Always exit any conversation upon /cancel
bot.command("cancel", async (ctx) => {
  await ctx.conversation.exit();
  await ctx.reply("Leaving.");
});

// Always exit the `movie` conversation 
// when the inline keyboard's `cancel` button is pressed.
bot.callbackQuery("cancel", async (ctx) => {
  await ctx.conversation.exit("movie");
  await ctx.answerCallbackQuery("Left conversation");
});

bot.use(createConversation(movie));
bot.command("movie", (ctx) => ctx.conversation.enter("movie"));
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js{6,21}
async function movie(conversation, ctx) {
  // TODO: code the conversation
}

// Install the conversations plugin.
bot.use(conversations());

// Always exit any conversation upon /cancel
bot.command("cancel", async (ctx) => {
  await ctx.conversation.exit();
  await ctx.reply("Leaving.");
});

// Always exit the `movie` conversation 
// when the inline keyboard's `cancel` button is pressed.
bot.callbackQuery("cancel", async (ctx) => {
  await ctx.conversation.exit("movie");
  await ctx.answerCallbackQuery("Left conversation");
});

bot.use(createConversation(movie));
bot.command("movie", (ctx) => ctx.conversation.enter("movie"));
```

</CodeGroupItem>
</CodeGroup>

Note that the order matters here.
You must first install the conversations plugin (line 6) before you can call `await ctx.conversation.exit()`.
Also, the generic cancel handlers must be installed before the actual conversations (line 21) are registered.

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
Check out the full list in the Telegram docs [here](https://core.telegram.org/bots/api#update).

Usually, outside of the conversations plugin, each of these updates would be handled by the [middleware system](../guide/middleware.md) of your bot.
Hence, your bot would handle the update via a context object which gets passed to your handlers.

In conversations, you will obtain this new context object from the `wait` call.
In turn, you can handle different updates differently based on this object.
For example, you can check for text messages:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function waitForText(conversation: MyConversation, ctx: MyContext) {
  // Wait for the next update:
  ctx = await conversation.wait();
  // Check for text:
  if (ctx.message?.text) {
    // ...
  }
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function waitForText(conversation, ctx) {
  // Wait for the next update:
  ctx = await conversation.wait();
  // Check for text:
  if (ctx.message?.text) {
    // ...
  }
}
```

</CodeGroupItem>
</CodeGroup>

In addition, there are a number of other methods alongside `wait` that let you wait for specific updates only.
One example is `waitFor` which takes a [filter query](../guide/filter-queries.md) and then only waits for updates that match the provided query.
This is especially powerful in combination with [object destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment):

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function waitForText(conversation: MyConversation, ctx: MyContext) {
  // Wait for the next text message update:
  const { msg: { text } } = await conversation.waitFor("message:text");
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function waitForText(conversation, ctx) {
  // Wait for the next text message update:
  const { msg: { text } } = await conversation.waitFor("message:text");
}
```

</CodeGroupItem>
</CodeGroup>

Check out the [API reference](https://doc.deno.land/https://deno.land/x/grammy_conversations/mod.ts/~/ConversationHandle#wait) to see all available methods that are similar to `wait`.

## Three Golden Rules of Conversations

There are three rules that apply to the code you write inside a conversation builder function.
You must follow them if you want your code to behave correctly.

Scroll [down](#how-it-works) if you want to know more about _why_ these rules apply, and what `wait` calls really do internally.

### Rule I: All Side-effects Must Be Wrapped

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

### Rule II: All Random Behavior Must Be Wrapped

Code that depends on randomness or on global state which could change, must wrap all access to it in `conversation.external()` calls, or use the `conversation.random()` convenience function.

```ts
// BAD
if (Math.random() < 0.5) { /* do stuff */ }
// GOOD
if (conversation.random() < 0.5) { /* do stuff */ }
```

### Rule III: Use Convenience Functions

There are a bunch of things installed on `conversation` which may greatly help you.
Your code doesn't exactly break if you don't use them, but it can be slow or behave in a confusing way.
The end user might not notice a difference, though.

```ts
// Sleep via conversation, massive performance improvement
await conversation.sleep(3000); // 3 seconds

// Debug logging via conversation, does not print confusing logs
conversation.log("Hello, world");
```

Note that you can do all of the above via `conversation.external()`, but this can be tedious to type, so it's just easier to use the convenience functions ([API reference](https://doc.deno.land/https://deno.land/x/grammy_conversations/mod.ts/~/ConversationHandle#Methods)).

## Variables, Branching, and Loops

If you follow the three rules above, you are completely free to use any code you like.
We will now go through a few concepts that you already know from programming, and show how they translate to clean and readable conversations.

Imagine that all code below is written inside a conversation builder function.

You can declare variables and do whatever you want with them:

```ts
await ctx.reply("Send me your favorite numbers, separated by commas!");
const { message } = await conversation.waitFor("message:text");
const sum = message.text
  .split(",")
  .map((n) => parseInt(n.trim(), 10))
  .reduce((x, y) => x + y);
await ctx.reply("The sum of these numbers is: " + sum);
```

Branching works, too:

```ts
await ctx.reply("Send me a photo!");
const { message } = await conversation.wait();
if (!message?.photo) {
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
} while (!ctx.message?.photo);
```

## Functions and Recursion

You can also split up your code in several functions, and reuse them.
For example, this is how you can define a reusable captcha.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function captcha(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Prove you are human! What is the answer to everything?");
  const { message } = await conversation.wait();
  return message?.text === "42";
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function captcha(conversation, ctx) {
  await ctx.reply("Prove you are human! What is the answer to everything?");
  const { message } = await conversation.wait();
  return message?.text === "42";
}
```

</CodeGroupItem>
</CodeGroup>

It returns `true` if the user may pass, and `false` otherwise.
You can now use it in your main conversation builder function like this:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function enterGroup(conversation: MyConversation, ctx: MyContext) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("Welcome!");
  else await ctx.banChatMember();
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function enterGroup(conversation, ctx) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("Welcome!");
  else await ctx.banChatMember();
}
```

</CodeGroupItem>
</CodeGroup>

See how the captcha function can be reused in different places in your code.

> This simple example is only meant to illustrate how functions work.
> In reality, it may work poorly because it only waits for a new update from the respective chat, but without verifying that it actually comes from the same user who joined.
> If you want to create a real captcha, you may want to use [parallel conversations](#parallel-conversations).

If you want, you can also split your code across even more functions, or use recursion, mutual recursion, generators, and so on.
(Just make sure that all functions follow the [three rules](#three-golden-rules-of-conversations).)

Naturally, you can use error handling in your functions, too.
Regular `try`/`catch` statements work just fine, also across functions.
After all, conversations are just JavaScript.

If the main conversation function throws an error, the error will propagate further into the [error handling mechanisms](../guide/errors.md) of your bot.

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
      "Open this link to obtain a token, and send it back to me: " + link,
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

```js
class Auth {
  constructor(conversation) {
    this.#conversation = conversation;
  }

  authenticate(ctx) {
    const link = getAuthLink(); // get auth link from your system
    await ctx.reply(
      "Open this link to obtain a token, and send it back to me: " + link,
    );
    ctx = await this.#conversation.wait();
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

As mentioned [earlier](#waiting-for-updates), there are several different utility functions on the conversation handle, such as `await conversation.waitFor('message:text')` which only returns text message updates.

If these methods are not enough, the conversations plugin provides even more helper functions for building forms via `conversation.form`.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function waitForMe(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("How old are you?");
  const age: number = await conversation.form.number();
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function waitForMe(conversation, ctx) {
  await ctx.reply("How old are you?");
  const age = await conversation.form.number();
}
```

</CodeGroupItem>
</CodeGroup>

As always, check out the [API reference](https://doc.deno.land/https://deno.land/x/grammy_conversations/mod.ts/~/ConversationForm) to see which methods are available.

## Parallel Conversations

Naturally, the conversations plugin can run any number of conversations in parallel in different chats.

However, if your bot gets added to a group chat, it may want to have conversations with several different users in parallel _in the same chat_.
For example, if your bot features a captcha that it wants to send to all new members.
If two members join at the same time, the bot should be able to have two independent conversations with them.

This is why the conversations plugin allows you to enter several conversations at the same time for every chat.
For instance, it is possible to have five different conversations with five new users, and at the same time chat with an admin about new chat config.

### How It Works Behind the Scenes

Every incoming update will only be handled by one of the active conversations in a chat.
Comparable to middleware handlers, the conversations will be called in the order they are registered.
If a conversation is started multiple times, these instances of the conversation will be called in chronological order.

Each conversation can then either handle the update, or it can call `await conversation.skip()`.
In the former case, the update will simply be consumed while the conversation is handling it.
In the latter case, the conversation will effectively undo receiving the update, and pass it on to the next conversation.
If all conversations skip an update, the control flow will be passed back to the middleware system, and run any subsequent handlers.

This allows you to start a new conversation from the regular middleware.

### How You Can Use It

In practice, you never really need to call `await conversation.skip()` at all.
Instead, you can just use things like `await conversation.waitFrom(userId)`, which will take care of the details for you.
This allows you to chat with a single user only in a group chat.

For instance, let's implement the captcha example from up here again, but this time with parallel conversations.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts{4}
async function captcha(conversation: MyConversation, ctx: MyContext) {
  if (ctx.from === undefined) return false;
  await ctx.reply("Prove you are human! What is the answer to everything?");
  const { message } = await conversation.waitFrom(ctx.from);
  return message?.text === "42";
}

async function enterGroup(conversation: MyConversation, ctx: MyContext) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("Welcome!");
  else await ctx.banChatMember();
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js{4}
async function captcha(conversation, ctx) {
  if (ctx.from === undefined) return false;
  await ctx.reply("Prove you are human! What is the answer to everything?");
  const { message } = await conversation.waitFrom(ctx.from);
  return message?.text === "42";
}

async function enterGroup(conversation, ctx) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("Welcome!");
  else await ctx.banChatMember();
}
```

</CodeGroupItem>
</CodeGroup>

Note how we only wait for messages from a particular user.

We can now have a simple handler that enters the conversation when a new member joins.

```ts
bot.on("chat_member")
  .filter((ctx) => ctx.chatMember.old_chat_member.status === "left")
  .filter((ctx) => ctx.chatMember.new_chat_member.status === "member")
  .use((ctx) => ctx.conversation.enter("enterGroup"));
```

### Inspecting Active Conversations

You can see how many conversations with which identifier are running.

```ts
const stats = await ctx.conversation.active();
console.log(stats); // { "enterGroup": 1 }
```

This will be provided as an object that has the conversation identifiers as keys, and a number indicating the number of running conversations for each identifier.

## How It Works

> [Remember](#three-golden-rules-of-conversations) that the code inside your conversation builder functions must follow three rules.
> We are now going to see _why_ you need to build them that way.

We are first going to see how this plugin works conceptually, before we elaborate on some details.

### How `wait` Calls Work

Let us switch perspectives for a while, and ask a question from a plugin developer's point of view.
How to implement a `wait` call in the plugin?

The naïve approach to implementing a `wait` call in the conversations plugin would be to create a new promise, and to wait until the next context object arrives.
As soon as it does, we resolve the promise, and the conversation can continue.

However, this is a bad idea for several reasons.

**Data Loss.**
What if your server crashes while waiting for a context object?
In that case, we lose all information about the state of the conversation.
Basically, the bot loses its train of thought, and the user has to start over.
This is a bad and annoying design.

**Blocking.**
If wait calls would block until the next update arrives, it means that the middleware execution for the first update can't complete until the entire conversation completes.

- For built-in polling, this means that no further updates can be processed until the current one is done.
  Hence, the bot would simply be blocked forever.
- For [grammY runner](./runner.md), the bot would not be blocked.
  However, when processing thousands of conversations in parallel with different users, it would consume potentially very large amounts of memory.
  If many users stop responding, this leaves the bot stuck in the middle of countless conversations.
- Webhooks have their own whole [category of problems](../guide/deployment-types.md#ending-webhook-requests-in-time) with long-running middleware.

**State.**
On serverless infrastructure such as cloud functions, we cannot actually assume that the same instance handles two subsequent updates from the same user.
Hence, if we were to create stateful conversations, they may randomly break all the time, as some `wait` calls don't resolve, but some other middleware is suddenly executed.
The result is an abundance of random bugs and chaos.

There are more problems, but you get the idea.

Consequently, the conversations plugin does things differently.
Very differently.
As mentioned earlier, **they don't _literally_ make your bot wait**, even though we can program conversations as if that was the case.

The conversations plugin tracks the execution of your function.
When a wait call is reached, it serializes the state of execution into the session, and safely stores it in a database.
When the next update arrives, it first inspects the session data.
If it finds that it left off in the middle of a conversation, it deserializes the state of execution, takes your conversation builder function, and replays it up to the point of the last `wait` call.
It then resumes ordinary execution of your function—until the next `wait` call is reached, and the execution must be halted again.

What do we mean by the state of execution?
In a nutshell, it consists on three things:

1. Incoming updates
2. Outgoing API calls
3. External events and effects, such as randomness or calls to external APIs or databases

What do we mean by replaying?
Replaying simply means calling the function regularly from the start, but when it does things like calling `wait` or performing API calls, we don't actually do any of those.
Instead, we check out or logs where we recorded from a previous run which values were returned.
We then inject these values so that the conversation builder function simply runs through very fast---until our logs are exhausted.
At that point, we switch back to normal execution mode, which is just a fancy way of saying that we stop injecting stuff, and start to actually perform API calls again.

This is why the plugin has to track all incoming updates as well as all Bot API calls.
(See points 1 and 2 above.)
However, the plugin has no control over external events, side-effects, or randomness.
For example, you could this:

```ts
if (Math.random() < 0.5) {
  // do one thing
} else {
  // do another thing
}
```

In that case, when calling the function, it may suddenly behave differently every time, so replaying the function will break!
It could randomly work differently than the original execution.
This is why point 3 exists, and the [Three Golden Rules](#three-golden-rules-of-conversations) must be followed.

### How to Intercept Function Execution

Conceptually speaking, the keywords `async` and `await` give us control over where the thread is [preempted](https://en.wikipedia.org/wiki/Preemption_(computing)).
Hence, if someone calls `await conversation.wait()`, which is a function of our library, we are given the power to preempt the execution.

Concretely speaking, the secret core primitive that enables us to interrupt function execution is a `Promise` that never resolves.

```ts
await new Promise<never>(() => {}); // BOOM
```

If you `await` such a promise in any JavaScript file, your runtime will terminate instantly.
(Feel free to paste the above code into a file and try it out.)

Since we obviously don't want to kill the JS runtime, we have to catch this again.
How would you go about this?
(Feel free to check out the plugin's source code if this isn't immediately obvious to you.)

## Plugin Summary

- Name: `conversations`
- Source: <https://github.com/grammyjs/conversations>
- Reference: <https://doc.deno.land/https://deno.land/x/grammy_conversations/mod.ts>
