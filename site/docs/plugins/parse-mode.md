---
prev: false
next: false
---

# Parse Mode Plugin (`parse-mode`)

This library provides simplified formatting utilities for the [grammY](https://grammy.dev) Telegram Bot framework. It enables you to compose richly formatted messages using a declarative, type-safe API.

In the Telegram Bot API, formatted text is represented using "entities" - special markers that define which parts of the text should be formatted in specific ways. Each entity has a type (e.g., `bold`, `italic`), an offset (where it starts in the text), and a length (how many characters it affects).

Working directly with these entities can be cumbersome as you need to manually track offsets and lengths. The Parse Mode plugin solves this problem by providing a simple, declarative API for formatting text.

## Two Approaches: `fmt` and `FormattedString`

This library offers two main approaches to text formatting:

1. **`fmt` Tagged Template Function**: A template literal tag that allows you to write formatted text in a natural way using template expressions. It internally manages entity offsets and lengths for you.

2. **`FormattedString` Class**: A class-based approach that allows you to build formatted text through method chaining. This is particularly useful for programmatically constructing complex formatted messages.

Both approaches produce a unified `FormattedString` object that can be used to manipulate formatted text.

## Usage (using `fmt`)

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { fmt, b, u } from "@grammyjs/parse-mode";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Using return values of fmt
  const combined = fmt`${b}bolded${b} ${ctx.msg.text} ${u}underlined${u}`;
  await ctx.reply(combined.text { entities: combined.entities });
  await ctx.replyWithPhoto(
    'https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png',
    { caption: combined.caption, caption_entities: combined.caption_entities }
  );
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { fmt, b, u } = require("@grammyjs/parse-mode");

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Using return values of fmt
  const combined = fmt`${b}bolded${b} ${ctx.msg.text} ${u}underlined${u}`;
  await ctx.reply(combined.text { entities: combined.entities });
  await ctx.replyWithPhoto(
    'https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png',
    { caption: combined.caption, caption_entities: combined.caption_entities }
  );
});

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { fmt, b, u } from "https://deno.land/x/grammy_parse_mode/mod.ts";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Using return values of fmt
  const combined = fmt`${b}bolded${b} ${ctx.msg.text} ${u}underlined${u}`;
  await ctx.reply(combined.text { entities: combined.entities });
  await ctx.replyWithPhoto(
    'https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png',
    { caption: combined.caption, caption_entities: combined.caption_entities }
  );
});

bot.start();
```

:::

## Usage (using `FormattedString`)

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { FormattedString } from "@grammyjs/parse-mode";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Static method
  const staticCombined = FormattedString.b("bolded").plain(` ${ctx.msg.text} `).u("underlined");
  await ctx.reply(staticCombined.text { entities: staticCombined.entities });
  await ctx.replyWithPhoto(
    'https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png',
    { caption: staticCombined.caption, caption_entities: staticCombined.caption_entities }
  );

  // Or constructor
  const constructorCombined = (new FormattedString("")).b("bolded").plain(` ${ctx.msg.text} `).u("underlined");
  await ctx.reply(constructorCombined.text { entities: constructorCombined.entities });
  await ctx.replyWithPhoto(
    'https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png',
    { caption: constructorCombined.caption, caption_entities: constructorCombined.caption_entities }
  );
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { FormattedString } = require("@grammyjs/parse-mode");

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Static method
  const staticCombined = FormattedString.b("bolded").plain(` ${ctx.msg.text} `).u("underlined");
  await ctx.reply(staticCombined.text { entities: staticCombined.entities });
  await ctx.replyWithPhoto(
    'https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png',
    { caption: staticCombined.caption, caption_entities: staticCombined.caption_entities }
  );

  // Or constructor
  const constructorCombined = (new FormattedString("")).b("bolded").plain(` ${ctx.msg.text} `).u("underlined");
  await ctx.reply(constructorCombined.text { entities: constructorCombined.entities });
  await ctx.replyWithPhoto(
    'https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png',
    { caption: constructorCombined.caption, caption_entities: constructorCombined.caption_entities }
  );
});

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { FormattedString } from "https://deno.land/x/grammy_parse_mode/mod.ts";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Static method
  const staticCombined = FormattedString.b("bolded").plain(` ${ctx.msg.text} `).u("underlined");
  await ctx.reply(staticCombined.text { entities: staticCombined.entities });
  await ctx.replyWithPhoto(
    'https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png',
    { caption: staticCombined.caption, caption_entities: staticCombined.caption_entities }
  );

  // Or constructor
  const constructorCombined = (new FormattedString("")).b("bolded").plain(` ${ctx.msg.text} `).u("underlined");
  await ctx.reply(constructorCombined.text { entities: constructorCombined.entities });
  await ctx.replyWithPhoto(
    'https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png',
    { caption: constructorCombined.caption, caption_entities: constructorCombined.caption_entities }
  );
});

bot.start();
```

:::

## Core Concepts

### `FormattedString` as unified return type
The `FormattedString` class is a core component of the `parse-mode` plugin, providing a unified interface for working with formatted text. The return value of `fmt`, `new FormattedString` and `FormattedString.<staticMethod>` returns an instance of `FormattedString`. This means that different style of usages can be combined.

For example, it is possible to use `fmt`, followed by chainable instance methods of `FormattedString`, and then passing the result into another `fmt` tagged template.

```ts
bot.on("msg:text", async ctx => {
  // The result of fmt`${${u}Memory updated!${u}}` is a FormattedString
  // whose instance method call of `.plain("\n") also returns a FormattedString
  const header = fmt`${${u}Memory updated!${u}}`.plain("\n");
  const body = FormattedString.plain("I will remember this!");
  const footer = "\n - by grammy AI";

  // This is also legal - you can give FormattedString and string to `fmt`
  const response = fmt`${header}${body}${footer}`;
  await ctx.reply(response.text, { entities: response.entities });
});

```

### Things that `fmt` accepts
The `fmt` tagged template accepts a wide variety of values for constructing your `FormattedString`, including:
 - `TextWithEntities` (implemented by `FormattedString` and regular Telegram text messages)
 - `CaptionWithEntities` (implemented by `FormattedString` and regular Telegram media messages with captions)
 - EntityTag (such as your `b()` and `a(url)` functions)
 - Nullary functions that returns an EntityTag (such as `b` and `i`)
 - Any types that implements `toString()` (will be treated as plain text value)

### TextWithEntities
The `TextWithEntities` interface represents text with optional formatting entities.
```ts
interface TextWithEntities {
  text: string;
  entities?: MessageEntity[];
}
```

Notice that the shape of this type implies that regular text messages from Telegram also implement `TextWithEntities` implicitly. This means that it is in fact possible to do the following:

```ts
bot.on("msg:text", async ctx => {
  const response = fmt`${ctx.msg}`.plain("\n---\n").bold("This is my response");
  await ctx.reply(response.text, { entities: response.entities });
});
```

### CaptionWithEntities
The `CaptionWithEntities` interface represents a caption with optional formatting entities.
```ts
interface CaptionWithEntities {
  caption: string;
  caption_entities?: MessageEntity[];
}
```

Likewise, notice that the shape of this type implies that regular media messages with caption from Telegram also implement `CaptionWithEntities` implicitly. This means that it is also in fact possible to do the following:

```ts
bot.on("msg:caption", async ctx => {
  const response = fmt`${ctx.msg}`.plain("\n---\n").bold("This is my response");
  await ctx.reply(response.text, { entities: response.entities });
});
```



## Plugin Summary

- Name: `parse-mode`
- [Source](https://github.com/grammyjs/parse-mode)
- [Reference](/ref/parse-mode/)
