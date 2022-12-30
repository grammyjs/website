# Sessions and Storing Data (built-in)

While you can always just write you own code to connect to a data storage of your choice, grammY supports a very convenient storage pattern called _sessions_.

> [Jump down](#how-to-use-sessions) if you know how sessions work.

## Why Must We Think About Storage?

In opposite to regular user accounts on Telegram, bots have [limited cloud storage](https://core.telegram.org/bots#how-are-bots-different-from-users) in the Telegram cloud.
As a result, there are a few things you cannot do with bots:

1. You cannot access old messages that your bot received.
2. You cannot access old messages that your bot sent.
3. You cannot get a list of all chats with your bot.
4. More things, e.g. no media overview, etc

Basically, it boils down to the fact that **a bot only has access to the information of the currently incoming update** (e.g. message), i.e. the information that is available on the context object `ctx`.

Consequently, if you _do want to access_ old data, you have to store it as soon as it arrives.
This means that you must have a data storage, such as a file, a database, or an in-memory storage.

Of course, grammY has you covered here: you don't have to host this yourself.
You can just use the grammY session storage which needs zero setup and is free forever.

> Naturally, there are plenty of other services that offer data storage as a service, and grammY integrates seamlessly with them, too.
> If you want to run your own database, rest assured that grammY supports this equally well.
> [Scroll down](#known-storage-adapters) to see which integrations are currently available.

## What Are Sessions?

It is a very common thing for bots to store some piece of data per chat.
For example, let's say we want to build a bot that counts the number of times that a message contains the pizza emoji :pizza: in its text.
This bot could be added to a group, and it can tell you how much you and your friends like pizza.

When our pizza bot receives a message, it has to remember how many times it saw a :pizza: in that chat before.
Your pizza count should of course not change when your sister adds the pizza bot to her group chat, so what we really want is to store _one counter per chat_.

Sessions are an elegant way to store data _per chat_.
You would use the chat identifier as the key in your database, and a counter as the value.
In this case, we would call the chat identifier the _session key_.
(You can read more about session keys [down here](#session-keys).)
Effectively, your bot will store a map from a chat identifier to some custom session data, i.e. something like this:

```json:no-line-numbers
{
  "424242": { "pizzaCount": 24 },
  "987654": { "pizzaCount": 1729 }
}
```

> When we say database, we really mean any data storage solution.
> This includes files, cloud storage, or anything else.

Okay, but what are sessions now?

We can install middleware on the bot that will provide a chat's session data on `ctx.session` for every update.
The installed plugin will do something before and after our handlers are called:

1. **Before our middleware.**
   The session plugin loads the session data for the current chat from the database.
   It stores the data on the context object under `ctx.session`.
2. **Our middleware runs.**
   We can _read_ `ctx.session` to inspect which value was in the database.
   For example, if a message is sent to the chat with the identifier `424242`, it would be `ctx.session = { pizzaCount: 24 }` while our middleware runs (at least with the example database state above).
   We can also _modify_ `ctx.session` arbitrarily, so we can add, remove, and change fields as we like.
3. **After our middleware.**
   The session middleware makes sure that the data is written back to the database.
   Whatever the value of `ctx.session` is after the middleware is done executing, it will be saved in the database.

As a result, we never have to worry about actually communicating with the data storage anymore.
We just modify the data in `ctx.session`, and the plugin will take care of the rest.

## When to Use Sessions

> [Skip ahead](#how-to-use-sessions) if you already know that you want to use sessions.

You may think, this is great, I never have to worry about databases again!
And you are right, sessions are an ideal solution—but only for some types of data.

In our experience, there are use cases where sessions truly shine.
On the other hand, there are cases where a traditional database may be better suited.

This comparison may help you decide whether to use sessions or not.

|                     | Sessions                                                    | Database                                                           |
| ------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------ |
| _Access_            | one isolated storage **per chat**                           | access same data from **multiple chats**                           |
| _Sharing_           | data is **only used by bot**                                | data is **used by other systems** (e.g. by a connected web server) |
| _Format_            | any JavaScript objects: strings, numbers, arrays, and so on | any data (binary, files, structured, etc)                          |
| _Size per chat_     | preferably less than ~3 MB per chat                         | any size                                                           |
| _Exclusive feature_ | Required by some grammY plugins.                            | Supports database transactions.                                    |

This does not mean that things _cannot work_ if you pick sessions/databases over the other.
For example, you can of course store large binary data in your session.
However, your bot would not perform as well as it could otherwise, so we recommend using sessions only where they make sense.

## How to Use Sessions

You can add session support to grammY by using the built-in session middleware.

### Example Usage

Here is an example bot that counts messages containing a pizza emoji :pizza::

<CodeGroup>
 <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context, session, SessionFlavor } from "grammy";

// Define the shape of our session.
interface SessionData {
  pizzaCount: number;
}

// Flavor the context type to include sessions.
type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>("");

// Install session middleware, and define the initial session value.
function initial(): SessionData {
  return { pizzaCount: 0 };
}
bot.use(session({ initial }));

bot.command("hunger", async (ctx) => {
  const count = ctx.session.pizzaCount;
  await ctx.reply(`Your hunger level is ${count}!`);
});

bot.hears(/.*🍕.*/, (ctx) => ctx.session.pizzaCount++);

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { Bot, session } = require("grammy");

const bot = new Bot("");

// Install session middleware, and define the initial session value.
function initial() {
  return { pizzaCount: 0 };
}
bot.use(session({ initial }));

bot.command("hunger", async (ctx) => {
  const count = ctx.session.pizzaCount;
  await ctx.reply(`Your hunger level is ${count}!`);
});

bot.hears(/.*🍕.*/, (ctx) => ctx.session.pizzaCount++);

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import {
  Bot,
  Context,
  session,
  SessionFlavor,
} from "https://deno.land/x/grammy/mod.ts";

// Define shape of our session.
interface SessionData {
  pizzaCount: number;
}

// Flavor the context type to include sessions.
type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>("");

// Install session middleware, and define the initial session value.
function initial(): SessionData {
  return { pizzaCount: 0 };
}
bot.use(session({ initial }));

bot.command("hunger", async (ctx) => {
  const count = ctx.session.pizzaCount;
  await ctx.reply(`Your hunger level is ${count}!`);
});

bot.hears(/.*🍕.*/, (ctx) => ctx.session.pizzaCount++);

bot.start();
```

</CodeGroupItem>
</CodeGroup>

Note how we also have to [adjust the context type](../guide/context.md#customizing-the-context-object) to make the session available on it.
The context flavor is called `SessionFlavor`.

### Initial Session Data

When a user first contacts your bot, no session data is available for them.
It is therefore important that you specify the `initial` option for the session middleware.
Pass a function that generates a new object with initial session data for new chats.

```ts
// Creates a new object that will be used as initial session data.
function createInitialSessionData() {
  return {
    pizzaCount: 0,
    // more data here
  };
}
bot.use(session({ initial: createInitialSessionData }));
```

Same but much shorter:

```ts
bot.use(session({ initial: () => ({ pizzaCount: 0 }) }));
```

::: warning Sharing Objects
Make sure to always create a _new object_.
Do **NOT** do this:

```ts
// DANGER, BAD, WRONG, STOP
const initialData = { pizzaCount: 0 }; // NOPE
bot.use(session({ initial: () => initialData })); // EVIL
```

If you would do this, several chats might share the same session object in memory.
Hence, changing the session data in one chat may accidentally impact the session data in the other chat.
:::

You may also omit the `initial` option entirely, even though you are well advised not to do that.
If you don't specify it, reading `ctx.session` will throw an error for new users.

### Session Keys

> This section describes an advanced feature that most people do not have to worry about.
> You may want to continue with the section about [storing your data](#storing-your-data).

You can specify which session key to use by passing a function called `getSessionKey` to the [options](https://deno.land/x/grammy/mod.ts?s=SessionOptions#prop_getSessionKey).
That way, you can fundamentally change the way how the session plugin works.
By default, data is stored per chat.
Using `getSessionKey` allows you to store data per user, or per user-chat combination, or however you want.
Here are three examples:

<CodeGroup>
<CodeGroupItem title="TypeScript" active>

```ts
// Stores data per chat (default).
function getSessionKey(ctx: Context): string | undefined {
  // Let all users in a group chat share the same session,
  // but give an independent private one to each user in private chats
  return ctx.chat?.id.toString();
}

// Stores data per user.
function getSessionKey(ctx: Context): string | undefined {
  // Give every user their personal session storage
  // (will be shared across groups and in their private chat)
  return ctx.from?.id.toString();
}

// Stores data per user-chat combination.
function getSessionKey(ctx: Context): string | undefined {
  // Give every user their one personal session storage per chat with the bot
  // (an independent session for each group and their private chat)
  return ctx.from === undefined || ctx.chat === undefined
    ? undefined
    : `${ctx.from.id}/${ctx.chat.id}`;
}

bot.use(session({ getSessionKey }));
```

</CodeGroupItem>
<CodeGroupItem title="JavaScript">

```js
// Stores data per chat (default).
function getSessionKey(ctx) {
  // Let all users in a group chat share the same session,
  // but give an independent private one to each user in private chats
  return ctx.chat?.id.toString();
}

// Stores data per user.
function getSessionKey(ctx) {
  // Give every user their personal session storage
  // (will be shared across groups and in their private chat)
  return ctx.from?.id.toString();
}

// Stores data per user-chat combination.
function getSessionKey(ctx) {
  // Give every user their one personal session storage per chat with the bot
  // (an independent session for each group and their private chat)
  return ctx.from === undefined || ctx.chat === undefined
    ? undefined
    : `${ctx.from.id}/${ctx.chat.id}`;
}

bot.use(session({ getSessionKey }));
```

</CodeGroupItem>
</CodeGroup>

Whenever `getSessionKey` returns `undefined`, `ctx.session` will be `undefined`.
For example, the default session key resolver will not work for `poll`/`poll_answer` updates or `inline_query` updates because they do not belong to a chat (`ctx.chat` is `undefined`).

::: warning Session Keys and Webhooks
When you are running your bot on webhooks, you should avoid using the option `getSessionKey`.
Telegram sends webhooks sequentially per chat, so the default session key resolver is the only implementation that guarantees not to cause data loss.

If you must use the option (which is of course still possible), you should know what you are doing.
Make sure you understand the consequences of this configuration by reading [this](../guide/deployment-types.md) article and especially [this](./runner.md#sequential-processing-where-necessary) one.
:::

### Storing Your Data

In all examples above, the session data is stored in your RAM, so as soon as your bot is stopped, all data is lost.
This is convenient when you develop your bot or if you run automatic tests (no database setup needed), however, **that is most likely not desired in production**.
In production, you would want to persist your data, for example in a file, a database, or some other storage.

You should use the `storage` option of the session middleware to connect it to your datastore.
There may already be a storage adapter written for grammY that you can use (see [below](#known-storage-adapters)), but if not, it usually only takes 5 lines of code to implement one yourself.

## Known Storage Adapters

By default, sessions will be stored [in your memory](#ram-default) by the built-in storage adapter.
You can also use persistent sessions that grammY [offers for free](#free-storage), or connect to [external storages](#external-storage-solutions).

This is how you can install one of the storage adapters from below.

```ts
const storageAdapter = ... // depends on setup

bot.use(session({
  initial: ...
  storage: storageAdapter,
}));
```

### RAM (default)

By default, all data will be stored in RAM.
This means that all sessions are lost as soon as your bot stops.

You can use the `MemorySessionStorage` class ([API Reference](https://deno.land/x/grammy/mod.ts?s=MemorySessionStorage)) from the grammY core package if you want to configure further things about storing data in RAM.

```ts
bot.use(session({
  initial: ...
  storage: new MemorySessionStorage() // also the default value
}));
```

### Free Storage

> The free storage is meant to be used in hobby projects.
> Production-scale applications should host their own database.
> The list of supported integrations of external storage solutions is [down here](#external-storage-solutions).

A benefit of using grammY is that you get access to free cloud storage.
It requires zero setup—all authentication is done using your bot token.
Check out the [repository](https://github.com/grammyjs/storages/tree/main/packages/free)!

It is very easy to use:

<CodeGroup>
<CodeGroupItem title="TypeScript" active>

```ts
import { freeStorage } from "@grammyjs/storage-free";

bot.use(session({
  initial: ...
  storage: freeStorage<SessionData>(bot.token),
}));
```

</CodeGroupItem>
<CodeGroupItem title="JavaScript">

```ts
const { freeStorage } = require("@grammyjs/storage-free");

bot.use(session({
  initial: ...
  storage: freeStorage(bot.token),
}));
```

</CodeGroupItem>
<CodeGroupItem title="Deno">

```ts
import { freeStorage } from "https://deno.land/x/grammy_storages/free/src/mod.ts";

bot.use(session({
  initial: ...
  storage: freeStorage<SessionData>(bot.token),
}));
```

</CodeGroupItem>
</CodeGroup>

Done!
Your bot will now use a persistent data storage.

Here is a full example bot that you can copy to try it out.

<CodeGroup>
<CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context, session, SessionFlavor } from "grammy";
import { freeStorage } from "@grammyjs/storage-free";

// Define the session structure.
interface SessionData {
  count: number;
}
type MyContext = Context & SessionFlavor<SessionData>;

// Create the bot and register the session middleware.
const bot = new Bot<MyContext>(""); // <-- put your bot token between the ""

bot.use(session({
  initial: () => ({ count: 0 }),
  storage: freeStorage<SessionData>(bot.token),
}));

// Use persistent session data in update handlers.
bot.on("message", async (ctx) => {
  ctx.session.count++;
  await ctx.reply(`Message count: ${ctx.session.count}`);
});

bot.catch((err) => console.error(err));
bot.start();
```

</CodeGroupItem>
<CodeGroupItem title="JavaScript">

```ts
const { Bot, session } = require("grammy");
const { freeStorage } = require("@grammyjs/storage-free");

// Create the bot and register the session middleware.
const bot = new Bot(""); // <-- put your bot token between the ""

bot.use(session({
  initial: () => ({ count: 0 }),
  storage: freeStorage(bot.token),
}));

// Use persistent session data in update handlers.
bot.on("message", async (ctx) => {
  ctx.session.count++;
  await ctx.reply(`Message count: ${ctx.session.count}`);
});

bot.catch((err) => console.error(err));
bot.start();
```

</CodeGroupItem>
<CodeGroupItem title="Deno">

```ts
import {
  Bot,
  Context,
  session,
  SessionFlavor,
} from "https://deno.land/x/grammy/mod.ts";
import { freeStorage } from "https://deno.land/x/grammy_storages/free/src/mod.ts";

// Define the session structure.
interface SessionData {
  count: number;
}
type MyContext = Context & SessionFlavor<SessionData>;

// Create the bot and register the session middleware.
const bot = new Bot<MyContext>(""); // <-- put your bot token between the ""

bot.use(session({
  initial: () => ({ count: 0 }),
  storage: freeStorage<SessionData>(bot.token),
}));

// Use persistent session data in update handlers.
bot.on("message", async (ctx) => {
  ctx.session.count++;
  await ctx.reply(`Message count: ${ctx.session.count}`);
});

bot.catch((err) => console.error(err));
bot.start();
```

</CodeGroupItem>
</CodeGroup>

### External Storage Solutions

We maintain a list of official storage adapters that allow you to store your session data in different places.
Each of them will require you to register at a hosting provider, or to host your own storage solution.

- Supabase: <https://github.com/grammyjs/storages/tree/main/packages/supabase>
- Deta.sh Base: <https://github.com/grammyjs/storages/tree/main/packages/deta>
- Google Firestore (Node.js-only): <https://github.com/grammyjs/storages/tree/main/packages/firestore>
- Files: <https://github.com/grammyjs/storages/tree/main/packages/file>
- MongoDB: <https://github.com/grammyjs/storages/tree/main/packages/mongodb>
- Redis: <https://github.com/grammyjs/storages/tree/main/packages/redis>
- PostgreSQL: <https://github.com/grammyjs/storages/tree/main/packages/psql>
- TypeORM (Node.js-only): <https://github.com/grammyjs/storages/tree/main/packages/typeorm>
- DenoDB (Deno-only): <https://github.com/grammyjs/storages/tree/main/packages/denodb>
- Prisma (Node.js-only): <https://github.com/grammyjs/storages/tree/main/packages/prisma>

::: tip Your storage is not supported? No problem!
Creating a custom storage adapter is extremely simple.
The `storage` option works with any object that adheres to [this interface](https://deno.land/x/grammy/mod.ts?s=StorageAdapter), so you can connect to your storage just in a few lines of code.

> If you published your own storage adapter, feel free to edit this page and link it here, so that other people can use it.

:::

All storage adapters can be installed in the same way.
First, you should look out for the package name of the adapter of your choice.
For example, the storage adapter for Supabase is called `supabase`.

**On Node.js**, you can install the adapters via `npm i @grammyjs/storage-<name>`.
For example, the storage adapter for Supabase can be installed via `npm i @grammyjs/storage-supabase`.

**On Deno**, all storage adapters are published in the same Deno module.
You can then import the adapter you need from its subpath at `https://deno.land/x/grammy_storages/<adapter>/src/mod.ts`.
For example, the storage adapter for Supabase can be imported from `https://deno.land/x/grammy_storages/supabase/src/mod.ts`.

Check out the respective repositories about each individual setup.
They contain information about how to connect them to your storage solution.

You may also want to [scroll down](#storage-enhancements) to see how the session plugin is able to enhance any storage adapter.

## Multi Sessions

The session plugin is able to store different fragments of your session data in different places.
Basically, this works as if you would install multiple independent instances of the the session plugin, each with a different configuration.

Each of these data fragments will have a name under which they can store their data.
You will then be able to access `ctx.session.foo` and `ctx.session.bar` and these values were loaded from different data storages, and they will also be written back to different data storages.
Naturally, you can also use the same storage with different configuration.

It is also possible to use different [session keys](#session-keys) for each fragment.
As a result, you can store some data per chat and some data per user.

> If you are using [grammY runner](./runner.md), make sure to configure `sequentialize` correctly by returning **all** session keys as constraints from the function.

You can use this feature by passing `type: "multi"` to the session configuration.
In turn, you will need to configure each fragment with its own config.

```ts
bot.use(session({
  type: "multi",
  foo: {
    // these are also the default values
    storage: new MemorySessionStorage(),
    initial: () => undefined,
    getSessionKey: (ctx) => ctx.chat?.id.toString(),
  },
  bar: {
    initial: () => ({ prop: 0 }),
    storage: freeStorage(bot.token),
  },
  baz: {},
}));
```

Note that you must add a configuration entry for every fragment you want to use.
If you wish to use the default configuration, you can specify an empty object (such as we do for `baz` in the above example).

Your session data will still consist of an object with multiple properties.
This is why your context flavor does not change.
The above example could use this interface when customizing the context object:

```ts
interface SessionData {
  foo?: string;
  bar: { prop: number };
  baz: { width?: number; height?: number };
}
```

You can then keep using `SessionFlavor<SessionData>` for your context object.

## Lazy Sessions

> This section describes a performance optimization that most people do not have to worry about.

Lazy sessions is an alternative implementation of sessions that can significantly reduce the database traffic of your bot by skipping superfluous read and write operations.

Let's assume that your bot is in a group chat where it does not respond to regular text messages, but only to commands.
Without sessions, this would happen:

1. Update with new text message is sent to your bot.
2. No handler is invoked, so no action is taken.
3. The middleware completes immediately.

As soon as you install default (strict) sessions, which directly provide the session data on the context object, this happens:

1. Update with new text message is sent to your bot.
2. Session data is loaded from session storage (e.g. database).
3. No handler is invoked, so no action is taken.
4. Identical session data is written back to session storage.
5. The middleware completes, and has performed a read and a write to the data storage.

Depending on the nature of your bot, this may lead to a lot of superfluous reads and writes.
Lazy sessions allow you to skip steps 2. and 4. if it turns out that no invoked handler needs session data.
In that case, no data will be read from the data storage, nor written back to it.

This is achieved by intercepting access to `ctx.session`.
If no handler is invoked, then `ctx.session` will never be accessed.
Lazy sessions use this as an indicator to prevent database communication.

In practice, instead of having the session data available under `ctx.session`, you will now have _a promise of the session data_ available under `ctx.session`.

```ts
// Default sessions (strict sessions)
bot.command("settings", (ctx) => {
  // `session` is the session data
  const session = ctx.session;
});

// Lazy sessions
bot.command("settings", async (ctx) => {
  // `promise` is a Promise of the session data, and
  const promise = ctx.session;
  // `session` is the session data
  const session = await ctx.session;
});
```

If you never access `ctx.session`, no operations will be performed, but as soon as you access the `session` property on the context object, the read operation will be triggered.
If you never trigger the read (or directly assign a new value to `ctx.session`), we know that we also won't need to write any data back, because there is no way it could have been altered.
Consequently, we skip the write operation, too.
As a result, we achieve minimal read and write operations, but you can use session almost identical to before, just with a few `async` and `await` keywords mixed into your code.

So what is necessary to use lazy sessions instead of the default (strict) ones?
You mainly have to do three things:

1. Flavor your context with `LazySessionFlavor` instead of `SessionFlavor`.
   They work the same way, just that `ctx.session` is wrapped inside a promise for the lazy variant.
2. Use `lazySession` instead of `session` to register your session middleware.
3. Always put an inline `await ctx.session` instead of `ctx.session` everywhere in your middleware, for both reads and writes.
   Don't worry: You can `await` the promise with your session data as many times as you want, but you will always refer to the same value, so there are never going to be duplicate reads for an update.

Note that with lazy sessions you can assign both objects and promises of objects to `ctx.session`.
If you set `ctx.session` to be a promise, it will be `await`ed before writing the data back to the data storage.
This would allow for the following code:

```ts
bot.command("reset", (ctx) => {
  // Much shorter than having to `await ctx.session` first:
  ctx.session = ctx.session.then((stats) => {
    stats.counter = 0;
  });
});
```

One may argue well that explicitly using `await` is preferable over assigning a promise to `ctx.session`, the point is that you _could_ do this if you like that style better for some reason.

::: tip Plugins That Need Sessions
Plugin developers that make use of `ctx.session` should always allow users to pass `SessionFlavor | LazySessionFlavor` and hence support both modes.
In the plugin code, simply await `ctx.session` all the time: if a non-promise object is passed, this will simply be evaluated to itself, so you effectively only write code for lazy sessions and thus support strict sessions automatically.
:::

## Storage Enhancements

The session plugin is able to enhance any storage adapter by adding more features to the storage: [timeouts](#timeouts) and [migrations](#migrations).

They can be installed using the `enhanceStorage` function.

```ts
// Use the enhanced storage adapter.
bot.use(session({
  storage: enhanceStorage({
    storage: freeStorage(bot.token), // adjust this
    // more config here
  }),
}));
```

You can also use both at the same time.

### Timeouts

The timeouts enhancement can add an expiry date to the session data.
This means that you can specify a time period, and if the session is never changed during this time, the data for the particular chat will be deleted.

You can use session timeouts via the `millisecondsToLive` option.

```ts
const enhanced = enhanceStorage({
  storage,
  millisecondsToLive: 30 * 60 * 1000, // 30 min
});
```

Note that the actual deletion of the data will only happen the next time the respective session data is read.

### Migrations

Migrations are useful if you develop your bot further while there is already existing session data.
You can use them if you want to change your session data without breaking all previous data.

This works by giving version numbers to the data, and then writing small migration functions.
The migration functions define how to upgrade session data from one version to the next.

We will try to illustrate this by example.
Let's say that you stored information about the pet of a user.
So far, you only stored the names of the pets in a string array in `ctx.session.petNames`.

```ts
interface SessionData {
  petNames: string[];
}
```

Now you get the idea that you also want to store the age of the pets.

You could do this:

```ts
interface SessionData {
  petNames: string[];
  petBirthdays?: number[];
}
```

This would not break your existing session data.
However, this is not so great, because the names and the birthdays are now stored in different places.
Ideally, your session data should look like this:

```ts
interface Pet {
  name: string;
  birthday?: number;
}

interface SessionData {
  pets: Pet[];
}
```

Migration functions let you transform the old string array into the new array of pet objects.

<CodeGroup>
<CodeGroupItem title="TypeScript" active>

```ts
function addBirthdayToPets(old: { petNames: string[] }): SessionData {
  return {
    pets: old.petNames.map((name) => ({ name })),
  };
}

const enhanced = enhanceStorage({
  storage,
  migrations: {
    1: addBirthdayToPets,
  },
});
```

</CodeGroupItem>
<CodeGroupItem title="JavaScript">

```ts
function addBirthdayToPets(old) {
  return {
    pets: old.petNames.map((name) => ({ name })),
  };
}

const enhanced = enhanceStorage({
  storage,
  migrations: {
    1: addBirthdayToPets,
  },
});
```

</CodeGroupItem>
</CodeGroup>

Whenever session data is read, the storage enhancement will check if the session data is already at version `1`.
If the version is lower (or missing because you were not using this feature before) then the migration function will be run.
This upgrades the data to version `1`.
Hence, in your bot, you can always just assume that your session data has the most up to date structure, and the storage enhancement will take care of the rest and migrate your data as necessary.

As time evolves and your bot changes further, you can add more and more migration functions:

```ts
const enhanced = enhanceStorage({
  storage,
  migrations: {
    1: addBirthdayToPets,
    2: addIsFavoriteFlagToPets,
    3: addUserSettings,
    10: extendUserSettings,
    10.1: fixUserSettings,
    11: compressData,
  },
});
```

You can pick any JavaScript numbers as versions.
No matter how far the session data for a chat has evolved, as soon as it is read, it will be migrated through the versions until it uses the most recent structure.

## Plugin Summary

This plugin is built-in into the core of grammY.
You don't need to install anything to use it.
Simply import everything from grammY itself.

Also, both the documentation and the API reference of this plugin are unified with the core package.
