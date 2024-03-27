---
prev: false
next: false
---

# Inline and Custom Keyboards (built-in)

Your bot may send a number of buttons, either to be [displayed underneath a message](#inline-keyboards), or to [replace the user's keyboard](#custom-keyboards).
They are called _inline keyboards_ and _custom keyboards_, respectively.
If you think that this is confusing, then that's because it is.
Thank you, Telegram, for this overlapping terminology.

Let us try to clear it up a bit:

| Term                                     | Definition                                                                                                                          |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [**Inline Keyboard**](#inline-keyboards) | a set of buttons that is displayed underneath a message inside the chat.                                                            |
| [**Custom Keyboard**](#custom-keyboards) | a set of buttons that is displayed instead of the user's system keyboard.                                                           |
| **Inline Keyboard button**               | a button in an inline keyboard, sends a callback query not visible to the user when pressed, sometimes just called _inline button_. |
| **Custom Keyboard button**               | a button in a keyboard, sends a text message with its label when pressed, sometimes just called _keyboard button_.                  |
| **`InlineKeyboard`**                     | class in grammY to create inline keyboards.                                                                                         |
| **`Keyboard`**                           | class in grammY to create custom keyboards.                                                                                         |

> Note that both custom keyboard buttons and inline keyboard buttons can also have other functions, such as requesting the user's location, opening a website, and so on.
> This was omitted for brevity.

It is not possible to specify both a custom keyboard and an inline keyboard in the same message.
The two are mutually exclusive.
Moreover, the sent kind of reply markup cannot be changed at a later point by editing the message.
For example, it is not possible to first send a custom keyboard along with a message, and then edit the message to use an inline keyboard.

## Inline Keyboards

> Revisit the inline keyboard section in the [Telegram Bot Features](https://core.telegram.org/bots/features#inline-keyboards) written by the Telegram team.

grammY has a simple and intuitive way to build up the inline keyboards that your bot can send along with a message.
It provides a class called `InlineKeyboard` for this.

> The buttons added by calling `switchInline`, `switchInlineCurrent`, and `switchInlineChosen` start inline queries.
> Check out the section about [Inline Queries](./inline-query) for more information on how they work.

### Building an Inline Keyboard

You can build an inline keyboard by creating a new instance of the `InlineKeyboard` class, and then adding buttons you like to it using `.text()` and its other methods.

Here is an example:

![Example](/images/inline-keyboard-example.png)

```ts
const inlineKeyboard = new InlineKeyboard()
  .text("« 1", "first")
  .text("‹ 3", "prev")
  .text("· 4 ·", "stay")
  .text("5 ›", "next")
  .text("31 »", "last");
```

Call `.row()` if you want to begin a new row of buttons.
You can also use other methods like `.url()` to let the user's client open a specific URL or do other cool things.
Be sure to check out [all methods](/ref/core/inlinekeyboard#methods) on the `InlineKeyboard` class.

If you already have an array of strings that you would like to turn into an inline keyboard, you can use a second, alternative style for building inline keyboard instances.
The `InlineKeyboard` class has static methods such as `InlineKeyboard.text` that let you create button objects.
In turn, you can create an inline keyboard instance from array of button objects using `InlineKeyboard.from`.

That way, you can build the above inline keyboard in a functional way.

```ts
const labelDataPairs = [
  ["« 1", "first"],
  ["‹ 3", "prev"],
  ["· 4 ·", "stay"],
  ["5 ›", "next"],
  ["31 »", "last"],
];
const buttonRow = labelDataPairs
  .map(([label, data]) => InlineKeyboard.text(label, data));
const keyboard = InlineKeyboard.from([buttonRow]);
```

### Sending an Inline Keyboard

You can send an inline keyboard directly along a message, no matter whether you use `bot.api.sendMessage`, `ctx.api.sendMessage`, or `ctx.reply`:

```ts
// Send inline keyboard with message.
await ctx.reply(text, {
  reply_markup: inlineKeyboard,
});
```

Naturally, all other methods that send messages other than text messages support the same options, as specified by the [Telegram Bot API Reference](https://core.telegram.org/bots/api).
For example, you can edit a keyboard by calling `editMessageReplyMarkup`, and passing the new `InlineKeyboard` instance as `reply_markup`.
Specify an empty inline keyboard to remove all buttons underneath a message.

### Responding to Inline Keyboard Clicks

::: tip Menu Plugin
The keyboard plugin gives you raw access to the update objects that Telegram sends.
However, responding to clicks this way can be tedious.
If you are looking for a more high-level implementation of inline keyboards, check out the [menu plugin](./menu).
It makes it simple to create interactive menus.
:::

Every `text` button has a string as callback data attached.
If you don't attach callback data, grammY will use the button's text as data.

Once a user clicks a `text` button, your bot will receive an update containing the corresponding button's callback data.
You can listen for callback data via `bot.callbackQuery()`.

```ts
// Construct a keyboard.
const inlineKeyboard = new InlineKeyboard().text("click", "click-payload");

// Send a keyboard along with a message.
bot.command("start", async (ctx) => {
  await ctx.reply("Curious? Click me!", { reply_markup: inlineKeyboard });
});

// Wait for click events with specific callback data.
bot.callbackQuery("click-payload", async (ctx) => {
  await ctx.answerCallbackQuery({
    text: "You were curious, indeed!",
  });
});
```

::: tip Answering All Callback Queries
`bot.callbackQuery()` is useful to listen for click events of specific buttons.
You can use `bot.on("callback_query:data")` to listen for events of any button.

```ts
bot.callbackQuery("click-payload" /* , ... */);

bot.on("callback_query:data", async (ctx) => {
  console.log("Unknown button event with payload", ctx.callbackQuery.data);
  await ctx.answerCallbackQuery(); // remove loading animation
});
```

It makes sense to define `bot.on("callback_query:data")` at last to always answer all other callback queries that your previous listeners did not handle.
Otherwise, some clients may display a loading animation for up to a minute when a user presses a button that your bot does not want to react to.
:::

## Custom Keyboards

First things first: custom keyboards are sometimes just called keyboards, sometimes they're called reply keyboards, and even Telegram's own documentation is not consistent in this respect.
As a simple rule of thumb, when it isn't absolutely obvious from the context and not called inline keyboard, it probably is a custom keyboard.
This refers to a way to replace the system keyboard by a set of buttons that you can define.

> Revisit the custom keyboard section in the [Telegram Bot Features](https://core.telegram.org/bots/features#keyboards) written by the Telegram team.

grammY has a simple and intuitive way to build up the custom keyboards that your bot can use to replace the system keyboard.
It provides a class called `Keyboard` for this.

Once a user clicks a `text` button, your bot will receive the sent text as a plain text message.
Remember that you can listen for text message via `bot.on("message:text")` or `bot.hears()`.

### Building a Custom Keyboard

You can build a custom keyboard by creating a new instance of the `Keyboard` class, and by then adding buttons like to it via `.text()` and others.
Call `.row()` to begin a new row of buttons.

Here is an example:

![Example](/images/keyboard-example.png)

```ts
const keyboard = new Keyboard()
  .text("Yes, they certainly are").row()
  .text("I'm not quite sure").row()
  .text("No. 😈")
  .resized();
```

You can also send more powerful buttons that request the user's phone number or location or do other cool things.
Be sure to check out [all methods](/ref/core/keyboard#methods) on the `Keyboard` class.

If you already have an array of strings that you would like to turn into a keyboard, you can use a second, alternative style for building keyboard instances.
The `Keyboard` class has static methods such as `Keyboard.text` that let you create button objects.
In turn, you can create a keyboard instance from array of button objects using `Keyboard.from`.

That way, you can build the above keyboard in a functional way.

```ts
const labels = [
  "Yes, they certainly are",
  "I'm not quite sure",
  "No. 😈",
];
const buttonRows = labels
  .map((label) => [Keyboard.text(label)]);
const keyboard = Keyboard.from(buttonRows).resized();
```

### Sending a Custom Keyboard

You can send a custom keyboard directly along a message, no matter whether you use `bot.api.sendMessage`, `ctx.api.sendMessage`, or `ctx.reply`:

```ts
// Send keyboard with message.
await ctx.reply(text, {
  reply_markup: keyboard,
});
```

Naturally, all other methods that send messages other than text messages support the same options, as specified by the [Telegram Bot API Reference](https://core.telegram.org/bots/api).

You can also give your keyboard one or more further properties by calling special methods on it.
They will not add any buttons, but rather define the behavior of the keyboard.
We have already seen `resized` in the example above---here are a few more things you can do.

#### Persistent Keyboards

By default, users see an icon that allows them to show or hide the custom keyboard which your bot set.

You can call `persistent` if you want the custom keyboard to always be shown when the regular system keyboard is hidden.
That way, users will always see either the custom keyboard or the system keyboard.

```ts
new Keyboard()
  .text("Skip")
  .persistent();
```

#### Resize Custom Keyboard

You can call `resized` if you want the custom keyboard to be resized according to the buttons it contains.
This will effectively make the keyboard smaller.
(Usually, the keyboard will always have the size of the app's standard keyboard.)

```ts
new Keyboard()
  .text("Yes").row()
  .text("No")
  .resized();
```

It does not matter whether you call `resized` first, last or somewhere in between.
The result will always be the same.

#### One-Time Custom Keyboards

You can call `oneTime` if you want the custom keyboard to be hidden immediately after the first button was pressed.

```ts
new Keyboard()
  .text("Yes").row()
  .text("No")
  .oneTime();
```

It does not matter whether you call `oneTime` first, last or somewhere in between.
The result will always be the same.

#### Input Field Placeholder

You can call `placeholder` if you want a placeholder to be shown in the input field as long as the custom keyboard is visible.

```ts
new Keyboard()
  .text("Yes").row()
  .text("No")
  .placeholder("Decide now!");
```

It does not matter whether you call `placeholder` first, last or somewhere in between.
The result will always be the same.

#### Selectively Send Custom Keyboards

You can call `selected` if you want to show the custom keyboard only to those users that are @-mentioned in the text of the message object, and to the sender of the original message in case your message is a [reply](../guide/basics#sending-messages-with-reply).

```ts
new Keyboard()
  .text("Yes").row()
  .text("No")
  .selected();
```

It does not matter whether you call `selected` first, last or somewhere in between.
The result will always be the same.

### Responding to Custom Keyboard Clicks

As mentioned earlier, all that custom keyboards do is sending regular text messages.
Your bot cannot differentiate between ordinary text messages, and text messages that were sent by clicking a button.

Moreover, buttons will always send exactly the message that's written on them.
Telegram does not allow you to create buttons that display one text, but send another.
If you need to do this, you should use an [inline keyboard](#inline-keyboards) instead.

In order to handle the click of a specific button, you can use `bot.hears` with the same text as you put on the button.
If you want to handle all button clicks at once, you use `bot.on("message:text")` and inspect `ctx.msg.text` to figure out which button was clicked, or if an ordinary text message was sent.

### Removing a Custom Keyboard

Unless you specify `one_time_keyboard` as described [above](#one-time-custom-keyboards), the custom keyboard will remain open for the user (but
the user can minimize it).

You can only remove a custom keyboard when you send a new message in the chat, just like you can only specify a new keyboard by sending a message.
Pass `{ remove_keyboard: true }` as `reply_markup` like so:

```ts
await ctx.reply(text, {
  reply_markup: { remove_keyboard: true },
});
```

Next to `remove_keyboard`, you can set `selective: true` in order to remove the custom keyboard for selected users only.
This works analogously to [selectively sending a custom keyboard](#selectively-send-custom-keyboards).

## Plugin Summary

This plugin is built-in into the core of grammY.
You don't need to install anything to use it.
Simply import everything from grammY itself.

Also, both the documentation and the API reference of this plugin are unified with the core package.
