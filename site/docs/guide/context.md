---
prev: ./basics.md
next: ./api.md
---

# Context

The `Context` object ([grammY API Reference](https://deno.land/x/grammy/mod.ts?s=Context)) is an important part of grammY.

Whenever you register a listener on your bot object, this listener will receive a context object.

```ts
bot.on("message", (ctx) => {
  // `ctx` is the `Context` object.
});
```

You can use the context object to

- [access information about the message](#available-information)
- [perform actions in response to the message](#available-actions).

Note that context objects are commonly called `ctx`.

## Available Information

When a user sends a message to your bot, you can access it via `ctx.message`.
As an example, to get the message text, you can do this:

```ts
bot.on("message", (ctx) => {
  // `txt` will be a `string` when processing text messages.
  // It will be `undefined` if the received message does not have any message text,
  // e.g. photos, stickers, and other messages.
  const txt = ctx.message.text;
});
```

Similarly, you can access other properties of the message object, e.g. `ctx.message.chat` for information about the chat where the message was sent.
Check out the [part about `Message`s in the Telegram Bot API Reference](https://core.telegram.org/bots/api#message) to see which data is available.
Alternatively, you can simply use autocomplete in your code editor to see the possible options.

If you register your listener for other types, `ctx` will also give you information about those.
Example:

```ts
bot.on("edited_message", (ctx) => {
  // Get the new, edited, text of the message.
  const editedText = ctx.editedMessage.text;
});
```

Moreover, you can get access to the raw `Update` object ([Telegram Bot API Reference](https://core.telegram.org/bots/api#update)) that Telegram sends to your bot.
This update object (`ctx.update`) contains all the data that sources `ctx.message` and the like.

The context object always contains information about your bot, accessible via `ctx.me`.

### Shortcuts

There are a number of shortcuts installed on the context object.

| Shortcut              | Description                                                                         |
| --------------------- | ----------------------------------------------------------------------------------- |
| `ctx.msg`             | Gets the message object, also edited ones                                           |
| `ctx.chat`            | Gets the chat object                                                                |
| `ctx.senderChat`      | Gets the sender chat object out of `ctx.msg` (for anonymous channel/group messages) |
| `ctx.from`            | Gets the author of the message, callback query, or other things                     |
| `ctx.inlineMessageId` | Gets the inline message identifier for callback queries or chosen inline results    |
| `ctx.entities`        | Gets the message entities and their text, optionally filtered by entity type        |

In other words, you can also do this:

```ts
bot.on("message", (ctx) => {
  // Get the text of the message.
  const text = ctx.msg.text;
});

bot.on("edited_message", (ctx) => {
  // Get the new, edited, text of the message.
  const editedText = ctx.msg.text;
});

bot.on("message:entities", (ctx) => {
  // Get all the entities.
  const entities = ctx.entities();

  // Get the first entity's text.
  entities[0].text;

  // Get email entities.
  const emails = ctx.entities("email");

  // Get phone and email entities.
  const phonesAndEmails = ctx.entities(["email", "phone"]);
});
```

Hence, if you want to, you can forget about `ctx.message` and `ctx.channelPost` and `ctx.editedMessage` and so on and so forth, and just always use `ctx.msg` instead.

## Probing via Has Checks

The context object has a few methods that allow you to probe the contained data for certain things.
For example, you can call `ctx.hasCommand("start")` to see if the context object contains a `/start` command.
This is why the methods are collectively named _has checks_.

::: tip Know When to Use Has Checks

This is the exact same logic that is used by `bot.command("start")`.
Note that you should usually use [filter queries](./filter-queries.md) and similar methods.
Using has checks works best inside the [conversations plugin](../plugins/conversations.md).

:::

The has checks correctly narrow down the context type.
This means that checking if a context has callback query data will tell TypeScript that the context has the field `ctx.callbackQuery.data` present.

```ts
if (ctx.hasCallbackQuery(/query-data-\d+/)) {
  // `ctx.callbackQuery.data` is known to be present here
  const data: string = ctx.callbackQuery.data;
}
```

The same applies to all other has checks.
Check out the [API reference of the context object](https://deno.land/x/grammy/mod.ts?s=Context#method_has_0) to see a list of all has checks.
Also check out the static property `Context.has` in the [API reference](https://deno.land/x/grammy/mod.ts?s=Context#Static_Properties) that lets you create efficient predicate functions for probing a lot of context objects.

## Available Actions

If you want to respond to a message from a user, you could write this:

```ts
bot.on("message", async (ctx) => {
  // Get the chat identifier.
  const chatId = ctx.msg.chat.id;
  // The text to reply with
  const text = "I got your message!";
  // Send the reply.
  await bot.api.sendMessage(chatId, text);
});
```

You can notice two things that are not optimal about this:

1. We must have access to the `bot` object.
   This means that we have to pass the `bot` object all around our code base in order to respond, which is annoying when you have more than one source file and you define your listener somewhere else.
2. We have to take out the chat identifier of the context, and explicitly pass it to `sendMessage` again.
   This is annoying, too, because you most likely always want to respond to the same user that sent a message.
   Imagine how often you would type the same thing over and over again!

Regarding point 1., the context object simply provides you access to the same API object that you find on `bot.api`, it is called `ctx.api`.
You could now write `ctx.api.sendMessage` instead and you no longer have to pass around your `bot` object.
Easy.

However, the real strength is to fix point 2.
The context object lets you simply send a reply like this:

```ts
bot.on("message", async (ctx) => {
  await ctx.reply("I got your message!");
});

// Or, even shorter:
bot.on("message", (ctx) => ctx.reply("Gotcha!"));
```

Neat! :tada:

Under the hood, the context _already knows its chat identifier_ (namely `ctx.msg.chat.id`), so it gives you the `reply` method to just send a message back to the same chat.
Internally, `reply` again calls `sendMessage` with the chat identifier pre-filled for you.

Consequently, all methods on the context object take options objects of type `Other` as explained [earlier](./basics.md#sending-messages).
This can be used to pass further configuration to every API call.

::: tip Telegram Reply Feature
Even though the method is called `ctx.reply` in grammY (and many other frameworks), it does not use the [reply feature of Telegram](https://telegram.org/blog/replies-mentions-hashtags#replies) where a previous message is linked.

If you look up what `sendMessage` can do in the [Telegram Bot API Reference](https://core.telegram.org/bots/api#sendmessage), you will see a number of options, such as `parse_mode`, `disable_web_page_preview`, and `reply_to_message_id`.
The latter can be used to make a message a reply:

```ts
await ctx.reply("^ This is a message!", {
  reply_to_message_id: ctx.msg.message_id,
});
```

The same options object can be passed to `bot.api.sendMessage` and `ctx.api.sendMessage`.
Use auto-complete to see the available options right in your code editor.
:::

Naturally, every other method on `ctx.api` has a shortcut with the correct pre-filled values, such as `ctx.replyWithPhoto` to reply with a photo, or `ctx.exportChatInviteLink` to get an invite link for the respective chat.
If you want to get an overview over what shortcuts exist, then auto-complete is your friend, along with the [grammY API Reference](https://deno.land/x/grammy/mod.ts?s=Context).

Note that you may not want to react in the same chat always.
In this case, you can just fall back to using `ctx.api` methods, and specify all options when calling them.
For example, if you receive a message from Alice and want to react by sending a message to Bob, then you cannot use `ctx.reply` because it will always send messages to the chat with Alice.
Instead, call `ctx.api.sendMessage` and specify the chat identifier of Bob.

## How Context Objects Are Created

Whenever your bot receives a new message from Telegram, it is wrapped in an update object.
In fact, update objects can not only contain new messages, but also all other sorts of things, such as edits to messages, poll answers, and [much more](https://core.telegram.org/bots/api#update).

A fresh context object is created exactly once for every incoming update.
Contexts for different updates are completely unrelated objects, they only reference the same bot information via `ctx.me`.

The same context object for one update will be shared by all installed middleware ([docs](./middleware.md)) on the bot.

## Customizing the Context Object

> If you are new to context objects, you don't need to worry about the rest of this page.

You can install your own properties on the context object if you want.

### Via Middleware (Recommended)

The customizations can be easily done in [middleware](./middleware.md).

::: tip Middlewhat?
This section requires an understanding of middleware, so in case you have not skipped ahead to this [section](./middleware.md) yet, here is a very brief summary.

All you really need to know is that several handlers can process the same context object.
There are special handlers which can modify `ctx` before any other handlers are run, and the modifications of the first handler will be visible to all subsequent handlers.
:::

The idea is to install middleware before you register other listeners.
You can then set the properties you want inside these handlers.
If you do `ctx.yourCustomPropertyName = yourCustomValue` inside such a handler, then the property `ctx.yourCustomPropertyName` will be available in the remaining handlers, too.

For illustration purposes, let's say you want to set a property called `ctx.config` on the context object.
In this example, we will use it to store some configuration about the project so that all handlers have access to it.
The configuration will make it easier to detect if the bot is used by its developer or by regular users.

Right after creating your bot, do this:

```ts
const BOT_DEVELOPER = 123456; // bot developer chat identifier

bot.use(async (ctx, next) => {
  // Modify context object here by setting the config.
  ctx.config = {
    botDeveloper: BOT_DEVELOPER,
    isDeveloper: ctx.from?.id === BOT_DEVELOPER,
  };
  // Run remaining handlers.
  await next();
});
```

After that, you can use `ctx.config` in the remaining handlers.

```ts
bot.command("start", async (ctx) => {
  // Work with modified context here!
  if (ctx.config.isDeveloper) await ctx.reply("Hi mom!! <3");
  else await ctx.reply("Welcome, human!");
});
```

However, you will notice that TypeScript does not know that `ctx.config` is available, even though we are assigning the property correctly.
So while the code will work at runtime, it does not compile.
To fix this, we need to adjust the type of the context and add the property.

```ts
interface BotConfig {
  botDeveloper: number;
  isDeveloper: boolean;
}

type MyContext = Context & {
  config: BotConfig;
};
```

The new type `MyContext` now accurately describes the context objects our bot is actually handling.

> You will need to make sure that you keep the types in sync with the properties you initialize.

We can use the new type by passing it to the `Bot` constructor.

```ts
const bot = new Bot<MyContext>("");
```

In summary, the setup will look like this:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
const BOT_DEVELOPER = 123456; // bot developer chat identifier

// Define custom context type.
interface BotConfig {
  botDeveloper: number;
  isDeveloper: boolean;
}
type MyContext = Context & {
  config: BotConfig;
};

const bot = new Bot<MyContext>("");

// Set custom properties on context objects.
bot.use(async (ctx, next) => {
  ctx.config = {
    botDeveloper: BOT_DEVELOPER,
    isDeveloper: ctx.from?.id === BOT_DEVELOPER,
  };
  await next();
});

// Define handlers for custom context objects.
bot.command("start", async (ctx) => {
  if (ctx.config.isDeveloper) await ctx.reply("Hi mom!");
  else await ctx.reply("Welcome");
});
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const BOT_DEVELOPER = 123456; // bot developer chat identifier

const bot = new Bot("");

// Set custom properties on context objects.
bot.use(async (ctx, next) => {
  ctx.config = {
    botDeveloper: BOT_DEVELOPER,
    isDeveloper: ctx.from?.id === BOT_DEVELOPER,
  };
  await next();
});

// Define handlers for custom context objects.
bot.command("start", async (ctx) => {
  if (ctx.config.isDeveloper) await ctx.reply("Hi mom!");
  else await ctx.reply("Welcome");
});
```

</CodeGroupItem>
</CodeGroup>

Naturally, the custom context type can also be passed to other things which handle middleware, such as [composers](https://deno.land/x/grammy/mod.ts?s=Composer).

```ts
const composer = new Composer<MyContext>();
```

Some plugins will also require you to pass a custom context type, such as the [router](../plugins/router.md) or the [menu](../plugins/menu.md) plugin.
Check out their docs to see how they can use a custom context type.
These types are called context flavors, as described [down here](#context-flavors).

### Via Inheritance

In addition to setting custom properties on the context object, you can subclass the `Context` class.

```ts
class MyContext extends Context {
  // etc
}
```

However, we recommend that you customize the context object [via middleware](#via-middleware-recommended) because it is much more flexible and works much better if you want to install plugins.

We will now see how to use custom classes for context objects.

When constructing your bot, you can pass a custom context constructor that will be used to instantiate the context objects.
Note that your class must extend `Context`.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context } from "grammy";
import type { Update, UserFromGetMe } from "@grammyjs/types";

// Define a custom context class.
class MyContext extends Context {
  // Set some custom properties.
  public readonly customProp: number;

  constructor(update: Update, api: Api, me: UserFromGetMe) {
    super(update, api, me);
    this.customProp = me.username.length * 42;
  }
}

// Pass the constructor of the custom context class as an option.
const bot = new Bot("", {
  ContextConstructor: MyContext,
});

bot.on("message", (ctx) => {
  // `ctx` is now of type `MyContext`.
  const prop = ctx.customProp;
});

bot.start();
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript" active>

```ts
const { Bot, Context } = require("grammy");

// Define a custom context class.
class MyContext extends Context {
  // Set some custom properties.
  public readonly customProp;

  constructor(update, api, me) {
    super(update, api, me);
    this.customProp = me.username.length * 42;
  }
}

// Pass the constructor of the custom context class as an option.
const bot = new Bot("", {
  ContextConstructor: MyContext,
});

bot.on("message", (ctx) => {
  // `ctx` is now of type `MyContext`.
  const prop = ctx.customProp;
});

bot.start();
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import type { Update, UserFromGetMe } from "https://esm.sh/@grammyjs/types";

// Define a custom context class.
class MyContext extends Context {
  // Set some custom properties.
  public readonly customProp: number;

  constructor(update: Update, api: Api, me: UserFromGetMe) {
    super(update, api, me);
    this.customProp = me.username.length * 42;
  }
}

// Pass the constructor of the custom context class as an option.
const bot = new Bot("", {
  ContextConstructor: MyContext,
});

bot.on("message", (ctx) => {
  // `ctx` is now of type `MyContext`.
  const prop = ctx.customProp;
});

bot.start();
```

</CodeGroupItem>
</CodeGroup>

Notice how the custom context type will be inferred automatically when you are using a subclass.
You no longer need to write `Bot<MyContext>` because you already specified your subclass constructor in the options object of `new Bot()`.

However, this makes it very hard (if not impossible) to install plugins, as they often need you to install context flavors.

## Context Flavors

Context flavors are a way to tell TypeScript about new properties on your context object.
These new properties can be shipped in plugins or other modules and then installed on your bot.

Context flavors are also able to transform the types of existing properties using automatic procedures which are defined by plugins.

### Additive Context Flavors

As implied above, there are two different kinds of context flavors.
The basic one is called _additive context flavor_, and whenever we talk about context flavoring, we just mean this basic form.
Let's look at how it works.

As an example, when you have [session data](../plugins/session.md), you must register `ctx.session` on the context type.
Otherwise,

1. you cannot install the built-in sessions plugin, and
2. you don't have access to `ctx.session` in your listeners.

> Even though we'll use sessions as an example here, similar things apply for lots of other things.
> In fact, most plugins will give you a context flavor that you need to use.

A context flavor is simply a small new type that defines the properties that should be added to the context type.
Let's look at an example for a flavor.

```ts
interface SessionFlavor<S> {
  session: S;
}
```

The `SessionFlavor` type ([API Reference](https://deno.land/x/grammy/mod.ts?s=SessionFlavor)) is straightforward: it defines only the property `session`.
It takes a type parameter that will define the actual structure of the session data.

How is that useful?
This is how you can flavor your context with session data:

```ts
import { Context, SessionFlavor } from "grammy";

// Declare `ctx.session` to be of type `string`.
type MyContext = Context & SessionFlavor<string>;
```

You can now use the session plugin, and you have access to `ctx.session`:

```ts
bot.on("message", (ctx) => {
  // Now `str` is of type `string`.
  const str = ctx.session;
});
```

### Transformative Context Flavors

The other kind of context flavor is more powerful.
Instead of being installed with the `&` operator, they need to be installed like so:

```ts
import { Context } from "grammy";
import { SomeFlavorA } from "my-plugin";

type MyContext = SomeFlavorA<Context>;
```

Everything else works the same way.

Every (official) plugin states in its documentation whether it must be used via additive or via transformative context flavor.

### Combining Different Context Flavors

If you have different [additive context flavors](#additive-context-flavors), you can just install them like this:

```ts
type MyContext = Context & FlavorA & FlavorB & FlavorC;
```

The order of context flavors does not matter, you can combine them in any order you like.

Multiple [transformative context flavors](#transformative-context-flavors) can also be combined:

```ts
type MyContext = FlavorX<FlavorY<FlavorZ<Context>>>;
```

Here, the order could matter, as `FlavorZ` transforms `Context` first, then `FlavorY`, and the result of this will be transformed again by `FlavorX`.

You can even mix additive and transformative flavors:

```ts
type MyContext = FlavorX<
  FlavorY<
    FlavorZ<
      Context & FlavorA & FlavorB & FlavorC
    >
  >
>;
```

Make sure to follow this pattern when installing several plugins.
There are a number of type errors that stem from incorrect combination of context flavors.
