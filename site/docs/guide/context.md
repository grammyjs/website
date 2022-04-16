---
prev: ./basics.md
next: ./api.md
---

# Context

The `Context` object ([grammY API Reference](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/Context)) is an important part of grammY.

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
```

Hence, if you want to, you can forget about `ctx.message` and `ctx.channelPost` and `ctx.editedMessage` and so on and so forth, and just always use `ctx.msg` instead.

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

::: tip Telegram Reply Feature
Even though the method is called `ctx.reply` in grammY (and many other frameworks), it does not use the reply feature of Telegram where a previous message is linked.

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

Naturally, every other method on `ctx.api` has a shortcut with the correct pre-filled values, such as `ctx.replyWithPhoto` to reply with a photo, or `ctx.exportChatInviteLink` to get an invite link for the respective chat. If you want to get an overview over what shortcuts exist, then auto-complete is your friend, along with the [grammY API Reference](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/Context).

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

## Customising the Context Object

> If you are new to context objects, you don't need to worry about the rest of this page.

You can install your own properties on the context object if you want.
This is possible in two ways:

1. Installing [middleware](./middleware.md) that modifies the context (recommended), or
2. setting a custom context constructor.

If you choose option 1., you must specify the custom context as a type parameter (skip for JavaScript):

<CodeGroup>
  <CodeGroupItem title="Node.js" active>

```ts
import { Bot, Context } from "grammy";

// Define a custom context type.
interface MyContext extends Context {
  customProp: string | number | undefined;
}

// Pass the custom context type to the `Bot` constructor.
const bot = new Bot<MyContext>("<token>");

bot.on("message", (ctx) => {
  // `ctx` is now of type `MyContext`!
  const prop = ctx.customProp;
});
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";

// Define a custom context type.
interface MyContext extends Context {
  customProp: string | number | undefined;
}

// Pass the custom context type to the `Bot` constructor.
const bot = new Bot<MyContext>("<token>");

bot.on("message", (ctx) => {
  // `ctx` is now of type `MyContext`!
  const prop = ctx.customProp;
});
```

</CodeGroupItem>
</CodeGroup>

Naturally, just because the context _type_ now has new properties, this does not mean that there will actually be _values_ behind them.
You have to make sure that a plugin (or your own middleware) sets all properties correctly to satisfy the type you specified.

> Some middleware (e.g. [session middleware](/plugins/session.md)) requires you to mix in the correct types on the context object, which can be done by _flavoring_ your context as explained [down here](#context-flavors).

If you choose option 2., this is how you set a custom context constructor that will be used to instantiate the context objects.
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
const bot = new Bot("<token>", {
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
const bot = new Bot("<token>", {
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
const bot = new Bot("<token>", {
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

::: tip Related
[Middleware](./middleware.md) refers to a function that receives a context object as parameter, such as installed listeners.
:::

## Context Flavors

Context flavors are a way to tell TypeScript about new properties on your context object.

### Additive Context Flavors

There are two different kinds of context flavors.
The basic one is called _additive context flavor_, and whenever we talk about context flavoring, we just mean this basic form.
Let's look at how it works.

As an example, when you have [session data](/plugins/session.md), you must register `ctx.session` on the context type.
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

The `SessionFlavor` type ([API Reference](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/SessionFlavor)) is straightforward: it defines only the property `session`.
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

Multiple [transformative context flavors](#transformative-context-flavors) can also be combined:

```ts
type MyContext = FlavorX<FlavorY<FlavorZ<Context>>>;
```

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

The order of context flavors does not matter, you can combine them in any order you like.
