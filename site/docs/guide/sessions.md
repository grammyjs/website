---
prev: ./files.md
next: ./router.md
---

# Sessions and storing data

While you can always just write you own code to connect to a data storage of your choice, grammY supports a very convenient storage pattern called _sessions_.

> Jump down if you know how sessions work.

## Why must we think about storage?

In opposite to regular user accounts on Telegram, bots have [limited cloud storage](https://core.telegram.org/bots#4-how-are-bots-different-from-humans) in the Telegram cloud.
As a result, there are a few things you cannot do with bots:

1. You cannot access old messages that your bot received.
2. You cannot access old messages that your bot sent.
3. You cannot get a list of all chats of you bot.
4. More things, e.g. no media overview, etc

Basically, it boils down to the fact that **a bot only has access to the information of the currently incoming update** (e.g. message), i.e. the information that is available on the context object `ctx`.

Consequently, if you _do want to access_ old data, you have to store it as soon as it arrives.
This means that you must have a data storage, such as a file, a data base, or an in-memory storage.
Of course you don't have to host this yourself, there are plenty of services that offer data storage as a service, i.e. other people will host your database for you.

## What are sessions?

It is a very common thing for bots to store some piece of data per chat.
For example, let's say we want to build a bot that counts the number of times that a message contains the pizza emoji :pizza: in its text.
This bot could be added to a group, and it can tell you how much you and your friends like pizza.

When our pizza bot receives a message, it has to remember how many times it saw a :pizza: in that chat before.
The pizza count should of course not change when your sister adds the pizza bot to her group chat, so what we really want is to store _one counter per chat_.

Sessions are an elegant way to store data _per chat_.
You would use the chat identifier as the key in your data base, and a counter as the value.
In this case, we would call the chat identifier the _session key_.

We can install middleware on the bot that will provide a chat's session data on `ctx.session` for every update by loading it from the database before our middleware runs.
It would also make sure that the session data is written back to the database once we're done, so that we never have to worry about actually communicating with the data storage anymore.

In our example, we would have access to the pizza count _of the corresponding chat_ on the session object `ctx.session`.

## How to use sessions

You can add session support to grammY by using the built-in session middleware.

Here is an example how that counts messages containing a pizza emoji :pizza::

<CodeGroup>
 <CodeGroupItem title="TS">

```ts
import { Bot, session, SessionContext } from "grammy";

// define shape of our session
interface SessionData {
  pizzaCount: number;
}

// adjust the context type to include sessions
type MyContext = SessionContext<SessionData>;

const bot = new Bot<MyContext>("");

// install session middleware, and define how to resolve a session key
bot.use(session({ getSessionKey: (ctx) => ctx.chat?.id.toString() }));

bot.command("hunger", async (ctx) => {
  const count = ctx.session?.pizzaCount ?? 0;
  await ctx.reply(`Your hunger level is ${count}!`);
});

bot.on(":text", (ctx) => {
  // Make sure to initialize the session data
  ctx.session ??= { pizzaCount: 0 };
  if (ctx.msg.text.includes("🍕")) ctx.session.pizzaCount++;
});

bot.start();
```

 </CodeGroupItem>
 <CodeGroupItem title="JS">

```js
const { Bot, session } = require("grammy");

const bot = new Bot() < MyContext > "";

// install session middleware, and define how to resolve a session key
bot.use(session({ getSessionKey: (ctx) => ctx.chat?.id.toString() }));

bot.command("hunger", async (ctx) => {
  const count = ctx.session?.pizzaCount ?? 0;
  await ctx.reply(`Your hunger level is ${count}!`);
});

bot.on(":text", (ctx) => {
  // Make sure to initialize the session data
  ctx.session ??= { pizzaCount: 0 };
  if (ctx.msg.text.includes("🍕")) ctx.session.pizzaCount++;
});

bot.start();
```

 </CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import {
  Bot,
  session,
  SessionContext,
} from "https://deno.land/x/grammy/mod.ts";

// define shape of our session
interface SessionData {
  pizzaCount: number;
}

// adjust the context type to include sessions
type MyContext = SessionContext<SessionData>;

const bot = new Bot<MyContext>("");

// install session middleware, and define how to resolve a session key
bot.use(session({ getSessionKey: (ctx) => ctx.chat?.id.toString() }));

bot.command("hunger", async (ctx) => {
  const count = ctx.session?.pizzaCount ?? 0;
  await ctx.reply(`Your hunger level is ${count}!`);
});

bot.on(":text", (ctx) => {
  // Make sure to initialize the session data
  ctx.session ??= { pizzaCount: 0 };
  if (ctx.msg.text.includes("🍕")) ctx.session.pizzaCount++;
});

bot.start();
```

 </CodeGroupItem>
</CodeGroup>

Note how we also have to [adjust the context type](./context.md#customizing-the-context-object) to make the session available on it.

You can specify which session key to use by passing a function called `getSessionKey` to the [options](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#SessionOptions).
Whenever `getSessionKey` returns `undefined`, `ctx.session` will be `undefined`.

In the example above, the session data is stored in your RAM, so as soon as your bot is stopped, all data is lost.
This is convenient when you develop your bot or if you run automatic tests (no database setup needed), however, **that is most likely not desired in production**.
In production, you should use the `storageAdapter` option of the session middleware to connect it to your datastore.
There may be a third-party storage adapter written for grammY that you can use.

::: warning Sessions and webhooks
When you are running your bot on webhooks, you should always use `getSessionKey` from the example above, i.e.

```ts
function getSessionKey(ctx) {
  return ctx.chat?.id.toString();
}
```

If you need to use a different function (which is totally possible), you should first make sure you understand the consequences of that by reading [this](./deployment-types.md) and [this](/advanced/runner.md) article.
:::
