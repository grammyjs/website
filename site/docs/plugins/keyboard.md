# Keyboards and Inline Keyboards (built-in)

Your bot may send a number of buttons, either to be [displayed underneath a message](#inline-keyboards), or to [replace the user's keyboard](#keyboards).

## Inline Keyboards

> Revisit the inline keyboard section in the [Introduction for Developers](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating) written by the Telegram team.

grammY has a simple and intuitive way to build up the inline keyboards that your bot can send along with a message.
It provides a class called `InlineKeyboard` for this.

> Both `switchInline` and `switchInlineCurrent` buttons start inline queries.
> Check out the section about [Inline Queries](/guide/inline-queries.md) for more information about how they work.

### Building an Inline Keyboard

Here are three examples how to build an inline keyboard with `text` buttons.

You can also use other methods like `url` to let the Telegram clients open a URL, and many more options as listed in the [grammY API Reference](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#InlineKeyboard) as well as the [Telegram Bot API Reference](https://core.telegram.org/bots/api#inlinekeyboardbutton) for `InlineKeyboard`.

#### Example 1

Buttons for a pagination navigation can be built like this:

##### Code

```ts
const inlineKeyboard = new InlineKeyboard()
  .text("« 1", "first")
  .text("‹ 3", "prev")
  .text("· 4 ·", "stay")
  .text("5 ›", "next")
  .text("31 »", "last");
```

##### Result

![Example 1](https://core.telegram.org/file/811140217/1/NkRCCLeQZVc/17a804837802700ea4)

#### Example 2

An inline keyboard with share button can be built like this:

##### Code

```ts
const inlineKeyboard = new InlineKeyboard()
  .text("Get random music", "random").row()
  .switchInline("Send music to friends");
```

##### Result

![Example 2](https://core.telegram.org/file/811140659/1/RRJyulbtLBY/ea6163411c7eb4f4dc)

#### Example 3

URL buttons can be built like this:

##### Code

```ts
const inlineKeyboard = new InlineKeyboard().url(
  "Read on TechCrunch",
  "https://techcrunch.com/2016/04/11/this-is-the-htc-10/",
);
```

##### Result

![Example 3](https://core.telegram.org/file/811140999/1/2JSoUVlWKa0/4fad2e2743dc8eda04)

### Sending an Inline Keyboard

You can send an inline keyboard directly along a message, no matter whether you use `bot.api.sendMessage`, `ctx.api.sendMessage`, or `ctx.reply`:

```ts
// Send inline keyboard with message:
await ctx.reply(text, {
  reply_markup: inlineKeyboard,
});
```

Naturally, all other methods that send messages other than text messages support the same options, as specified by the [Telegram Bot API Reference](https://core.telegram.org/bots/api).
For example, you can edit a keybaord by calling `editMessageReplyMarkup`, and passing the new `InlineKeyboard` instance as `reply_markup`.
Specify an empty inline keyboard to remove all buttons underneath a message.

### Responding to Clicks

::: tip Menu Plugin
The keyboard plugin gives you raw access to the update objects that Telegram is sending.
However, responding to clicks that way can be tedious.
If you are looking for a more high-level implementation of inline keyboards, check out [the menu plugin](./menu.md).
It makes it simple to create interactive menus.
:::

Every `text` button has a string as callback data attached.
If you don't attach callback data, grammY will use the button's text as data.

Once a user clicks a text button, your bot will receive an update containing the corresponding button's callback data.
You can listen for callback data via `bot.callbackQuery()`.

```ts
// Construct a keyboard
const inlineKeyboard = new InlineKeyboard().text("click", "click-payload");

// Send a keyboard along a message
bot.command("start", async (ctx) => {
  await ctx.reply("Curious? Click me!", { reply_markup: inlineKeyboard });
});

// Wait for click events with specific callback data
bot.callbackQuery("click-payload", async (ctx) => {
  await ctx.answerCallbackQuery({
    text: "You were curious, indeed!",
  });
});
```

::: tip Answering all callback queries
`bot.callbackQuery()` is useful to listen for click events of specific buttons.
You can use `bot.on('callback_query:data')` to listen for events of any button.

```ts
bot.callbackQuery("click-payload" /* ... */);

bot.on("callback_query:data", async (ctx) => {
  console.log("Unknown button event with payload", ctx.callbackQuery.data);
  await ctx.answerCallbackQuery(); // remove loading animation
});
```

It makes sense to define `bot.on('callback_query:data')` at last to always answer all other callback queries that your previous listeners did not handle.
Otherwise, some clients may display a loading animation for up to a minute when a user presses a button that your bot does not want to react to.
:::

## Keyboards

> Revisit the keyboard section in the [Introduction for Developers](https://core.telegram.org/bots#keyboards) written by the Telegram team.

grammY has a simple and intuitive way to build up the reply keyboards that your bot can use to replace the user's keyboard.
It provides a class called `Keyboard` for this.

Once a user clicks a text button, your bot will receive the sent text as a plain text message.
Remember that you can listed for text message via `bot.on('message:text')`.

### Building a Keyboard

Here are three examples how to build a keyboard with `text` buttons.

You can also request the phone number with `requestContact`, the location with `requestLocation`, and a poll with `requestPoll`.

#### Example 1

Three buttons in one column can be built like this:

##### Code

```ts
const keyboard = new Keyboard()
  .text("Yes, they certainly are").row()
  .text("I'm not quite sure").row()
  .text("No. 😈");
```

##### Result

![Example 1](https://core.telegram.org/file/811140184/1/5YJxx-rostA/ad3f74094485fb97bd)

#### Example 2

A calculator keyboard can be built like this:

##### Code

```ts
const keyboard = new Keyboard()
  .text("7").text("8").text("9").text("*").row()
  .text("4").text("5").text("6").text("/").row()
  .text("1").text("2").text("3").text("-").row()
  .text("0").text(".").text("=").text("+");
```

##### Result

![Example 2](https://core.telegram.org/file/811140880/1/jS-YSVkDCNQ/b397dfcefc6da0dc70)

#### Example 3

Four buttons in a grid can be built like this:

##### Code

```ts
const keyboard = new Keyboard()
  .text("A").text("B").row()
  .text("C").text("D");
```

##### Result

![Example 3](https://core.telegram.org/file/811140733/2/KoysqJKQ_kI/a1ee46a377796c3961)

### Sending a Keyboard

You can send a keyboard directly along a message, no matter whether you use `bot.api.sendMessage`, `ctx.api.sendMessage`, or `ctx.reply`:

```ts
// Send keyboard with message:
await ctx.reply(text, {
  reply_markup: keyboard,
});
```

Naturally, all other methods that send messages other than text messages support the same options, as specified by the [Telegram Bot API Reference](https://core.telegram.org/bots/api).

If you want to specify further options with your message, you may need to create your own `reply_markup` object.
In that case, you have to use `keyboard.build()` when passing it to your custom object.

#### Resize Keyboard

You can specify the `resize_keyboard` option if you want the keyboard to be resized according to the buttons it contains.
This will effectively make the keyboard smaller.
(Usually, the keyboard will always have the size of the app's standard keyboard.)

```ts
await ctx.reply(text, {
  reply_markup: {
    resize_keyboard: true,
    keyboard: keyboard.build(),
  },
});
```

#### One-Time Keyboards

You can specify the `one_time_keyboard` option if you want the keyboard to be hidden immediately after the first button was pressed.

```ts
await ctx.reply(text, {
  reply_markup: {
    one_time_keyboard: true,
    keyboard: keyboard.build(),
  },
});
```

#### Input Field Placeholder

You can specify the `input_field_placehoder` option if you want a placeholder to be shown in the input field as long as the keyboard is visible.

```ts
const keyboard = new Keyboard().text("LEFT").text("RIGHT");

await ctx.reply(text, {
  reply_markup: {
    input_field_placehoder: "Send LEFT or RIGHT",
    keyboard: keyboard.build(),
  },
});
```

#### Selectively Send Keyboard

You can specify the `selective` option if you want to show the keyboard to only those users that are @-mentioned in the text of the message object, and to the sender of the original message in case your message is a reply.

```ts
await ctx.reply(text, {
  reply_markup: {
    selective: true,
    keyboard: keyboard.build(),
  },
});
```

### Removing a Keyboard

Unless you specify `one_time_keyboard` as described
[above](#one-time-keyboards), the keyboard will remain open for the user (but
the user can minimize it).

You can only remove a keyboard when you send a new message in the chat, just
like you can only specify a new keyboard by sending a message. Pass
`{ remove_keyboard: true }` as `reply_markup` like so:

```ts
await ctx.reply(text, {
  reply_markup: { remove_keyboard: true },
});
```

Next to `remove_keyboard`, you can again set `selective: true` in order to
remove the keyboard for selected users only. This works analogously to
[selectively sending a keyboard](#selectively-send-keyboard).

## Plugin Summary

This plugin is built-in into the core of grammY.
You don't need to install anything to use it.
Simply import everything from grammY itself.

Also, both the documentation and the API reference of this plugin are unified with the core package.
