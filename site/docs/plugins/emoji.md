---
prev: false
next: false
---

# Emoji Plugin (`emoji`)

With this plugin, you can easily insert emojis on your replies searching for them instead of manually copying and pasting an emoji from web at your code.

## Why Should I Use This?

Why not? People use emojis in their code all the time to better illustrate the message they're willing to pass or to organize things.
But you lose your focus every time you need a new emoji, see:

1. You stop coding to search for a specific emoji.
2. You go to a Telegram chat and spent ~6 seconds (to not say more) searching for the emoji you want.
3. You copy-paste them into your code and get back coding, but with lost focus.

With this plugin, you just don't stop coding as also you don't lose your focus.
There is also bad-frickin'-laggy systems and/or editors that doesn't like and don't show emojis, so you end up pasting a white square, like this sad-little-squary message: `I'm so happy □`.

This plugin aims to solve these issues, handling for you the hard task of parsing emojis in all systems and letting you only search for them in a easy way (autocomplete is available).
Now, the above steps can be reduced to this one:

1. Describe the emoji you want and use it. Right in your code. Simple as that.

### Is This Sorcery?

No, it is called template strings.
You can read more about them [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).

## Installing and Examples

You can install this plugin on your bot like this:

:::code-group

```ts [TypeScript]
import { Bot, Context } from "grammy";
import { EmojiFlavor, emojiParser } from "@grammyjs/emoji";

// This is called Context Flavoring
// You can read more about at:
// https://grammy.dev/guide/context#transformative-context-flavors
type MyContext = EmojiFlavor<Context>;

const bot = new Bot<MyContext>("");

bot.use(emojiParser());
```

```js [JavaScript]
const { Bot } = require("grammy");
const { emojiParser } = require("@grammyjs/emoji");

const bot = new Bot("");

bot.use(emojiParser());
```

```ts [Deno]
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  EmojiFlavor,
  emojiParser,
} from "https://deno.land/x/grammy_emoji/mod.ts";

// This is called Context Flavoring
// You can read more about at:
// https://grammy.dev/guide/context#transformative-context-flavors
type MyContext = EmojiFlavor<Context>;

const bot = new Bot<MyContext>("");

bot.use(emojiParser());
```

:::

Now you can get emojis by their names:

```js
bot.command("start", async (ctx) => {
  const parsedString = ctx.emoji`Welcome! ${"smiling_face_with_sunglasses"}`; // => Welcome! 😎
  await ctx.reply(parsedString);
});
```

Alternatively, you can reply directly using the `replyWithEmoji` method:

```js
bot.command("ping", async (ctx) => {
  await ctx.replyWithEmoji`Pong ${"ping_pong"}`; // => Pong 🏓
});
```

::: warning Keep in Mind That
`ctx.emoji` and `ctx.replyWithEmoji` **ALWAYS** use template strings.
If you're unfamiliar with this syntax, you can read more about it [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).
:::

## Plugin Summary

- Name: `emoji`
- Source: <https://github.com/grammyjs/emoji>
- Reference: <https://deno.land/x/grammy_emoji/mod.ts>
