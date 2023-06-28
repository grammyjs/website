# Media Groups (built-in)

The media group plugin helps you send media groups by letting you build `InputMedia` objects.
Incidentally, `InputMedia` object are also used when editing media messages, so this plugin also helps you to edit media.

Remember that `InputMedia` objects are specified [here](https://core.telegram.org/bots/api#inputmedia).

## Building an `InputMedia` Object

You can use this plugin like so:

::: code-group

```ts [TypeScript]
import { InputMediaBuilder } from "grammy";

const photo = InputMediaBuilder.photo(new InputFile("/tmp/photo.mp4"));
const video = InputMediaBuilder.video(new InputFile("/tmp/video.mp4"));
// etc
```

:::
:::code-group-item JavaScript

```js
const { InputMediaBuilder } = require("grammy");

const photo = InputMediaBuilder.photo(new InputFile("/tmp/photo.mp4"));
const video = InputMediaBuilder.video(new InputFile("/tmp/video.mp4"));
// etc
```

```ts [Deno]
import { InputMediaBuilder } from "https://deno.land/x/grammy/mod.ts";

const photo = InputMediaBuilder.photo(new InputFile("/tmp/photo.mp4"));
const video = InputMediaBuilder.video(new InputFile("/tmp/video.mp4"));
// etc
```

:::

Check out all methods of `InputMediaBuilder` in the [API reference](https://deno.land/x/grammy/mod.ts?s=InputMediaBuilder).

You can also directly pass public URLs which Telegram fetches.

```ts
const photo = InputMediaBuilder.photo("https://grammy.dev/images/Y.png");
```

Further options can be provided in an options object at the end.

```ts
const photo = InputMediaBuilder.photo("https://grammy.dev/images/Y.png", {
  caption: "grammY is awesome",
  // etc
});
```

## Sending a Media Group

You can send a media group as follows:

```ts
await ctx.replyWithMediaGroup([photo0, photo1, photo2, video]);
```

Likewise, you can pass an array of `InputMedia` objects to `ctx.api.sendMediaGroup` or `bot.api.sendMediaGroup`.

## Editing a Media Message

Since `InputMedia` objects are also used to edit media messages, this plugin will assist you here, too:

```ts
const newMedia = InputMediaBuilder.photo("https://grammy.dev/images/Y.png");
await ctx.editMessageMedia(newMedia);
```

As always, this works for `ctx.api.editMessageMedia` and `bot.api.editMessageMedia`, too.

## Plugin Summary

This plugin is built-in into the core of grammY.
You don't need to install anything to use it.
Simply import everything from grammY itself.

Also, both the documentation and the API reference of this plugin are unified with the core package.
