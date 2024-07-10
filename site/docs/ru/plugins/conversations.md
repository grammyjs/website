---
prev: false
next: false
---

# Conversations (`conversations`)

Create powerful conversational interfaces with ease.

## Introduction

Most chats consist of more than just one single message. (duh)

For example, you may want to ask the user a question, and then wait for the response.
This may even go back and forth several times, so that a conversation unfolds.

When you think about [middleware](../guide/middleware), you will notice that everything is based around a single [context object](../guide/context) per handler.
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

::: code-group

```ts [TypeScript]
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";
```

```js [JavaScript]
const {
  conversations,
  createConversation,
} = require("@grammyjs/conversations");
```

```ts [Deno]
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations/mod.ts";
```

:::

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
As always, it is called `ctx` and uses your [custom context type](../guide/context#customizing-the-context-object) (maybe called `MyContext`).
The conversations plugin exports a [context flavor](../guide/context#additive-context-flavors) called `ConversationFlavor`.

**The first parameter** is the central element of this plugin.
It is commonly named `conversation`, and it has the type `Conversation` ([API reference](/ref/conversations/conversation)).
It can be used as a handle to control the conversation, such as waiting for user input, and more.
The type `Conversation` expects your [custom context type](../guide/context#customizing-the-context-object) as a type parameter, so you would often use `Conversation<MyContext>`.

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

::: code-group

```ts [TypeScript]
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

```js [JavaScript]
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

:::

Can you figure out how this bot will work?

## Installing and Entering a Conversation

First of all, you **must** use the [session plugin](./session) if you want to use the conversations plugin.
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

::: code-group

```ts [TypeScript]
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

```js [JavaScript]
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

```ts [Deno]
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

:::

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
For example, this is how you'd have to do it with the [`freeStorage`](./session#free-storage) that grammY provides.

```ts
// Install the session plugin.
bot.use(session({
  // Add session types to adapter.
  storage: freeStorage<SessionData>(bot.token),
  initial: () => ({ foo: "" }),
}));
```

You can do the same thing for all other storage adapters, such as `new FileAdapter<SessionData>()` and so on.

### Installation With Multi Sessions

Naturally, you can combine conversations with [multi sessions](./session#multi-sessions).

This plugin stores the conversation data inside `session.conversation`.
This means that if you want to use multi sessions, you have to specify this fragment.

```ts
// Install the session plugin.
bot.use(session({
  type: "multi",
  custom: {
    initial: () => ({ foo: "" }),
  },
  conversation: {}, // may be left empty
}));
```

This way, you can store the conversation data in a different place than other session data.
For example, if you leave the conversation config empty as illustrated above, the conversation plugin will store all data in memory.

## Leaving a Conversation

The conversation will run until your conversation builder function completes.
This means that you can simply leave a conversation by using `return` or `throw`.

::: code-group

```ts [TypeScript]
async function hiAndBye(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Hi! And Bye!");
  // Leave the conversation:
  return;
}
```

```js [JavaScript]
async function hiAndBye(conversation, ctx) {
  await ctx.reply("Hi! And Bye!");
  // Leave the conversation:
  return;
}
```

:::

(Yes, putting a `return` at the end of the function is a bit pointless, but you get the idea.)

Throwing an error will likewise exit the conversation.
However, the [session plugin](#installing-and-entering-a-conversation) only persists data if the middleware runs successfully.
Hence, if you throw an error inside your conversation and do not catch it before it reaches the session plugin, it will not be saved that the conversation was left.
As a result, the next message will cause the same error.

You can mitigate this by installing an [error boundary](../guide/errors#error-boundaries) between the session and the conversation.
That way, you can prevent the error from propagating up the [middleware tree](../advanced/middleware) and hence permit the session plugin to write back the data.

> Note that if you are using the default in-memory sessions, all changes to the session data are reflected immediately, because there is no storage backend.
> In that case, you do not need to use error boundaries to leave a conversation by throwing an error.

This is how error boundaries and conversations could be used together.

::: code-group

```ts [TypeScript]
bot.use(session({
  storage: freeStorage(bot.token), // adjust
  initial: () => ({}),
}));
bot.use(conversations());

async function hiAndBye(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Hi! And Bye!");
  // Leave the conversation:
  throw new Error("Catch me if you can!");
}

bot.errorBoundary(
  (err) => console.error("Conversation threw an error!", err),
  createConversation(greeting),
);
```

```js [JavaScript]
bot.use(session({
  storage: freeStorage(bot.token), // adjust
  initial: () => ({}),
}));
bot.use(conversations());

async function hiAndBye(conversation, ctx) {
  await ctx.reply("Hi! And Bye!");
  // Leave the conversation:
  throw new Error("Catch me if you can!");
}

bot.errorBoundary(
  (err) => console.error("Conversation threw an error!", err),
  createConversation(greeting),
);
```

:::

Whatever you do, you should remember to [install an error handler](../guide/errors) on your bot.

If you want to hard-kill the conversation from your regular middleware while it is waiting for user input, you can also use `await ctx.conversation.exit()`.
This will simply erase the conversation plugin's data from the session.
It's often better to stick with simply returning from the function, but there are a few examples where using `await ctx.conversation.exit()` is convenient.
Remember that you must `await` the call.

::: code-group

```ts{6,22} [TypeScript]
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

```js{6,22} [JavaScript]
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

:::

Note that the order matters here.
You must first install the conversations plugin (line 6) before you can call `await ctx.conversation.exit()`.
Also, the generic cancel handlers must be installed before the actual conversations (line 22) are registered.

## Waiting for Updates

You can use the conversation handle `conversation` to wait for the next update in this particular chat.

::: code-group

```ts [TypeScript]
async function waitForMe(conversation: MyConversation, ctx: MyContext) {
  // Wait for the next update:
  const newContext = await conversation.wait();
}
```

```js [JavaScript]
async function waitForMe(conversation, ctx) {
  // Wait for the next update:
  const newContext = await conversation.wait();
}
```

:::

An update can mean that a text message was sent, or a button was pressed, or something was edited, or virtually any other action was performed by the user.
Check out the full list in the Telegram docs [here](https://core.telegram.org/bots/api#update).

The `wait` method always yields a new [context object](../guide/context) representing the received update.
That means you're always dealing with as many context objects as there are updates received during the conversation.

::: code-group

```ts [TypeScript]
const TEAM_REVIEW_CHAT = -1001493653006;
async function askUser(conversation: MyConversation, ctx: MyContext) {
  // Ask the user for their home address.
  await ctx.reply("Could you state your home address?");

  // Wait for the user to send their address:
  const userHomeAddressContext = await conversation.wait();

  // Ask the user for their nationality.
  await ctx.reply("Could you also please state your nationality?");

  // Wait for the user to state their nationality:
  const userNationalityContext = await conversation.wait();

  await ctx.reply(
    "That was the final step. Now that I have received all relevant information, I will forward them to our team for review. Thank you!",
  );

  // We now copy the responses to another chat for review.
  await userHomeAddressContext.copyMessage(TEAM_REVIEW_CHAT);
  await userNationalityContext.copyMessage(TEAM_REVIEW_CHAT);
}
```

```js [JavaScript]
const TEAM_REVIEW_CHAT = -1001493653006;
async function askUser(conversation, ctx) {
  // Ask the user for their home address.
  await ctx.reply("Could you state your home address?");

  // Wait for the user to send their address:
  const userHomeAddressContext = await conversation.wait();

  // Ask the user for their nationality.
  await ctx.reply("Could you also please state your nationality?");

  // Wait for the user to state their nationality:
  const userNationalityContext = await conversation.wait();

  await ctx.reply(
    "That was the final step. Now that I have received all relevant information, I will forward them to our team for review. Thank you!",
  );

  // We now copy the responses to another chat for review.
  await userHomeAddressContext.copyMessage(TEAM_REVIEW_CHAT);
  await userNationalityContext.copyMessage(TEAM_REVIEW_CHAT);
}
```

:::

Usually, outside of the conversations plugin, each of these updates would be handled by the [middleware system](../guide/middleware) of your bot.
Hence, your bot would handle the update via a context object which gets passed to your handlers.

In conversations, you will obtain this new context object from the `wait` call.
In turn, you can handle different updates differently based on this object.
For example, you can check for text messages:

::: code-group

```ts [TypeScript]
async function waitForText(conversation: MyConversation, ctx: MyContext) {
  // Wait for the next update:
  ctx = await conversation.wait();
  // Check for text:
  if (ctx.message?.text) {
    // ...
  }
}
```

```js [JavaScript]
async function waitForText(conversation, ctx) {
  // Wait for the next update:
  ctx = await conversation.wait();
  // Check for text:
  if (ctx.message?.text) {
    // ...
  }
}
```

:::

In addition, there are a number of other methods alongside `wait` that let you wait for specific updates only.
One example is `waitFor` which takes a [filter query](../guide/filter-queries) and then only waits for updates that match the provided query.
This is especially powerful in combination with [object destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment):

::: code-group

```ts [TypeScript]
async function waitForText(conversation: MyConversation, ctx: MyContext) {
  // Wait for the next text message update:
  const { msg: { text } } = await conversation.waitFor("message:text");
}
```

```js [JavaScript]
async function waitForText(conversation, ctx) {
  // Wait for the next text message update:
  const { msg: { text } } = await conversation.waitFor("message:text");
}
```

:::

Check out the [API reference](/ref/conversations/conversationhandle#wait) to see all available methods that are similar to `wait`.

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
Your code sometimes does not even break if you don't use them, but even then it can be slow or behave in a confusing way.

```ts
// `ctx.session` only persists changes for the most recent context object
conversation.session.myProp = 42; // more reliable!

// Date.now() can be inaccurate inside conversations
await conversation.now(); // more accurate!

// Debug logging via conversation, does not print confusing logs
conversation.log("Hello, world"); // more transparent!
```

Note that you can do most of the above via `conversation.external()`, but this can be tedious to type, so it's just easier to use the convenience functions ([API reference](/ref/conversations/conversationhandle#methods)).

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

::: code-group

```ts [TypeScript]
async function captcha(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Prove you are human! What is the answer to everything?");
  const { message } = await conversation.wait();
  return message?.text === "42";
}
```

```js [JavaScript]
async function captcha(conversation, ctx) {
  await ctx.reply("Prove you are human! What is the answer to everything?");
  const { message } = await conversation.wait();
  return message?.text === "42";
}
```

:::

It returns `true` if the user may pass, and `false` otherwise.
You can now use it in your main conversation builder function like this:

::: code-group

```ts [TypeScript]
async function enterGroup(conversation: MyConversation, ctx: MyContext) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("Welcome!");
  else await ctx.banChatMember();
}
```

```js [JavaScript]
async function enterGroup(conversation, ctx) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("Welcome!");
  else await ctx.banChatMember();
}
```

:::

See how the captcha function can be reused in different places in your code.

> This simple example is only meant to illustrate how functions work.
> In reality, it may work poorly because it only waits for a new update from the respective chat, but without verifying that it actually comes from the same user who joined.
> If you want to create a real captcha, you may want to use [parallel conversations](#parallel-conversations).

If you want, you can also split your code across even more functions, or use recursion, mutual recursion, generators, and so on.
(Just make sure that all functions follow the [three rules](#three-golden-rules-of-conversations).)

Naturally, you can use error handling in your functions, too.
Regular `try`/`catch` statements work just fine, also across functions.
After all, conversations are just JavaScript.

If the main conversation function throws an error, the error will propagate further into the [error handling mechanisms](../guide/errors) of your bot.

## Modules and Classes

Naturally, you can just move your functions across modules.
That way, you can define some functions in one file, `export` them, and then `import` and use them in another file.

If you want, you can also define classes.

::: code-group

```ts [TypeScript]
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

```js [JavaScript]
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

:::

The point here is not so much that we strictly recommend you to do this.
It is rather meant as an example for how you can use the endless flexibilities of JavaScript to structure your code.

## Forms

As mentioned [earlier](#waiting-for-updates), there are several different utility functions on the conversation handle, such as `await conversation.waitFor('message:text')` which only returns text message updates.

If these methods are not enough, the conversations plugin provides even more helper functions for building forms via `conversation.form`.

::: code-group

```ts [TypeScript]
async function waitForMe(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("How old are you?");
  const age: number = await conversation.form.number();
}
```

```js [JavaScript]
async function waitForMe(conversation, ctx) {
  await ctx.reply("How old are you?");
  const age = await conversation.form.number();
}
```

:::

As always, check out the [API reference](/ref/conversations/conversationform) to see which methods are available.

## Working With Plugins

As mentioned [earlier](#introduction), grammY handlers always only handle a single update.
However, with conversations, you are able to process many updates in sequence as if they were all available at the same time.
The plugin makes this possible by storing old context objects, and resupplying them later.
This is why the context objects inside conversations are not always affected by some grammY plugins in the way one would expect.

::: warning Interactive Menus Inside Conversations
With the [menu plugin](./menu), these concepts clash very badly.
While menus _can_ work inside conversations, we do not recommend to use these two plugins together.
Instead, use the regular [inline keyboard plugin](./keyboard#inline-keyboards) (until we add native menus support for conversations).
You can wait for specific callback queries using `await conversation.waitForCallbackQuery("my-query")` or any query using `await conversation.waitFor("callback_query")`.

```ts
const keyboard = new InlineKeyboard()
  .text("A", "a").text("B", "b");
await ctx.reply("A or B?", { reply_markup: keyboard });
const response = await conversation.waitForCallbackQuery(["a", "b"], {
  otherwise: (ctx) => ctx.reply("Use the buttons!", { reply_markup: keyboard }),
});
if (response.match === "a") {
  // User picked "A".
} else {
  // User picked "B".
}
```

:::

Other plugins work fine.
Some of them just need to be installed differently from how you would usually do it.
This is relevant for the following plugins:

- [hydrate](./hydrate)
- [i18n](./i18n) and [fluent](./fluent)
- [emoji](./emoji)

They have in common that they all store functions on the context object, which the conversations plugin cannot handle correctly.
Hence, if you want to combine conversations with one of these grammY plugins, you will have to use special syntax to install the other plugin inside each conversation.

You can install other plugins inside conversations using `conversation.run`:

::: code-group

```ts [TypeScript]
async function convo(conversation: MyConversation, ctx: MyContext) {
  // Install grammY plugins here
  await conversation.run(plugin());
  // Continue defining the conversation ...
}
```

```js [JavaScript]
async function convo(conversation, ctx) {
  // Install grammY plugins here
  await conversation.run(plugin());
  // Continue defining the conversation ...
}
```

:::

This will make the plugin available inside the conversation.

### Custom Context Objects

If you are using a [custom context object](../guide/context#customizing-the-context-object) and you want to install custom properties on your context objects before a conversation is entered, then some of these properties can get lost, too.
In a way, the middleware you use to customize your context object can be regarded as a plugin, as well.

The cleanest solution is to **avoid custom context properties** entirely, or at least to only install serializable properties on the context object.
In other words, if all custom context properties can be persisted in a database and be restored afterwards, you don't have to worry about anything.

Typically, there are other solutions to the problems that you usually solve with via custom context properties.
For example, it is often possible to just obtain them inside the conversation itself, rather than obtaining them inside a handler.

If none of these things are an option for you, you can try messing around with `conversation.run` yourself.
You should know that you must call `next` inside the passed middleware---otherwise, update handling will be intercepted.

The middleware will be run for all past updates every time a new update arrives.
For instance, if three context objects arrive, this is what happens:

1. the first update is received
2. the middleware runs for the first update
3. the second update is received
4. the middleware runs for the first update
5. the middleware runs for the second update
6. the third update is received
7. the middleware runs for the first update
8. the middleware runs for the second update
9. the middleware runs for the third update

Note that the middleware is run with first update thrice.

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

::: code-group

```ts{4} [TypeScript]
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

```js{4} [JavaScript]
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

:::

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
- For [grammY runner](./runner), the bot would not be blocked.
  However, when processing thousands of conversations in parallel with different users, it would consume potentially very large amounts of memory.
  If many users stop responding, this leaves the bot stuck in the middle of countless conversations.
- Webhooks have their own whole [category of problems](../guide/deployment-types#ending-webhook-requests-in-time) with long-running middleware.

**State.**
On serverless infrastructure such as cloud functions, we cannot actually assume that the same instance handles two subsequent updates from the same user.
Hence, if we were to create stateful conversations, they may randomly break all the time, as some `wait` calls don't resolve, but some other middleware is suddenly executed.
The result is an abundance of random bugs and chaos.

There are more problems, but you get the idea.

Consequently, the conversations plugin does things differently.
Very differently.
As mentioned earlier, **`wait` calls don't _literally_ make your bot wait**, even though we can program conversations as if that were the case.

The conversations plugin tracks the execution of your function.
When a wait call is reached, it serializes the state of execution into the session, and safely stores it in a database.
When the next update arrives, it first inspects the session data.
If it finds that it left off in the middle of a conversation, it deserializes the state of execution, takes your conversation builder function, and replays it up to the point of the last `wait` call.
It then resumes ordinary execution of your function---until the next `wait` call is reached, and the execution must be halted again.

What do we mean by the state of execution?
In a nutshell, it consists of three things:

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
- [Source](https://github.com/grammyjs/conversations)
- [Reference](/ref/conversations/)
