# Emoji 插件（`emoji`）

<TagGroup><Tag type="official" text="官方维护"/></TagGroup>

有了这个插件，你可以轻松地在你的回复中插入搜索到的 emoji，而不是在你的代码中手动复制和粘贴网络上的一个 emoji。

## 我为什么要使用它？

为什么不呢？人们总是在他们的代码中使用 emoji，以更好地说明他们愿意传递的信息或组织事情。但是每次你需要一个新的 emoji 时，你就不能专注在写代码上，看：

1. 你停止编码来搜索一个特定的 emoji。
2. 你去 Telegram 中，花了 ~6 秒（可能还会更多）搜索你想要的表情符号。
3. 你把它们复制粘贴到你的代码中，并重新开始写代码，但失去了你的注意力。

有了这个插件，你就不用停止写代码，也不会失去你的注意力。也有一些糟糕的系统和/或编辑器不喜欢也不显示 emoji，所以你最后只能粘贴一个白色的方块，就像这个悲哀的、小的、安静的信息：`I'm so happy □`。

这个插件旨在解决这些问题，为你处理所有系统中解析 emoji 的艰巨任务，并让你只用简单的方式搜索它们（可以使用自动完成）。现在，上述步骤可以减少到一个：

1. 在你的代码中描述你想要的 emoji 并使用它。就这么简单。

### 这是妖术吗？

不，它被称为模板字符串。你可以在 [这里](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Template_literals) 阅读更多关于它们的信息。

## 安装和示例

你可以在你的 bot 上安装这个插件，像这样：

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context } from "grammy";
import { EmojiFlavor, emojiParser } from "@grammyjs/emoji";

// 这个被称为上下文调味剂
// 你可以在这里阅读更多关于它们的信息：
// https://grammy.dev/zh/guide/context.html#转换式上下文调味剂
type MyContext = EmojiFlavor<Context>;

const bot = new Bot<MyContext>(""); // <-- 在 "" 之间填上你的 bot token。

bot.use(emojiParser());
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");
const { emojiParser } = require("@grammyjs/emoji");

const bot = new Bot(""); // <-- 在 "" 之间填上你的 bot token。

bot.use(emojiParser());
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  EmojiFlavor,
  emojiParser,
} from "https://deno.land/x/grammy_emoji/mod.ts";

// 这个被称为上下文调味剂
// 你可以在这里阅读更多关于它们的信息：
// https://grammy.dev/zh/guide/context.html#转换式上下文调味剂
type MyContext = EmojiFlavor<Context>;

const bot = new Bot<MyContext>(""); // <-- 在 "" 之间填上你的 bot token。

bot.use(emojiParser());
```

</CodeGroupItem>
</CodeGroup>

现在你可以通过它们的名字来获得 emoji：

```js
bot.command("start", async (ctx) => {
  const parsedString = ctx.emoji`Welcome! ${"smiling_face_with_sunglasses"}`; // => Welcome! 😎
  await ctx.reply(parsedString);
});
```

或者，你也可以使用 `replyWithEmoji` 方法直接回复：

```js
bot.command("ping", async (ctx) => {
  await ctx.replyWithEmoji`Pong ${"ping_pong"}`; // => Pong 🏓
});
```

::: warning 请牢记
`ctx.emoji` 和 `ctx.replyWithEmoji` **总是**使用模板字符串。如果你不熟悉这种语法，你可以在 [这里](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Template_literals) 阅读更多关于它的信息。
:::

## 插件概述

- 名字：`emoji`
- 源码：<https://github.com/grammyjs/emoji>
- 参考：<https://doc.deno.land/https://deno.land/x/grammy_emoji/mod.ts>
