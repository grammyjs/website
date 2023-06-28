# 媒体组（内置）

媒体组插件通过允许你构建 `InputMedia` 对象来帮助你发送媒体组。
顺便提一下，当编辑媒体消息时也会使用 `InputMedia` 对象，所以这个插件还可以帮助你编辑媒体。

别忘了 `InputMedia` 对象是在 [这里](https://core.telegram.org/bots/api#inputmedia) 规定的。

## 创建一个 `InputMedia` 对象

你可以这样使用这个插件：

::: code-group

```ts [TypeScript]
import { InputMediaBuilder } from "grammy";

const photo = InputMediaBuilder.photo(new InputFile("/tmp/photo.mp4"));
const video = InputMediaBuilder.video(new InputFile("/tmp/video.mp4"));
// 其他
```

```js [JavaScript]
const { InputMediaBuilder } = require("grammy");

const photo = InputMediaBuilder.photo(new InputFile("/tmp/photo.mp4"));
const video = InputMediaBuilder.video(new InputFile("/tmp/video.mp4"));
// 其他
```

```ts [Deno]
import { InputMediaBuilder } from "https://deno.land/x/grammy/mod.ts";

const photo = InputMediaBuilder.photo(new InputFile("/tmp/photo.mp4"));
const video = InputMediaBuilder.video(new InputFile("/tmp/video.mp4"));
// 其他
```

:::

请查看 [API 参考文档](https://deno.land/x/grammy/mod.ts?s=InputMediaBuilder) 中 `InputMediaBuilder` 的所有方法。

你也可以直接传递公开的 URL 给 Telegram 抓取。

```ts
const photo = InputMediaBuilder.photo("https://grammy.dev/images/Y.png");
```

在最后可以提供一个选项对象来提供更多选项。

```ts
const photo = InputMediaBuilder.photo("https://grammy.dev/images/Y.png", {
  caption: "grammY is awesome",
  // 其他
});
```

## 发送一个媒体组

你可以像下面这样发送一个媒体组：

```ts
await ctx.replyWithMediaGroup([photo0, photo1, photo2, video]);
```

类似的，你可以传递一个 `InputMedia` 对象的数组给 `ctx.api.sendMediaGroup` 或者 `bot.api.sendMediaGroup`。

## 编辑一个媒体组

由于 `InputMedia` 对象也用于编辑媒体消息，这个插件也会在这方面为你提供帮助：

```ts
const newMedia = InputMediaBuilder.photo("https://grammy.dev/images/Y.png");
await ctx.editMessageMedia(newMedia);
```

同样地，这也适用于 `ctx.api.editMessageMedia` 和 `bot.api.editMessageMedia`。

## 插件概述

这个插件已经内置到 grammY 的核心中。
你无需安装任何东西即可使用它。
只需从 grammY 本身导入即可。

此外，该插件的文档和 API 参考都与核心包统一。
