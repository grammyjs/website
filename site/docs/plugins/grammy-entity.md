---
prev: false
next: false
---

# Convert Telegram Entities (grammy-entity)

Converts [Telegram entities](https://core.telegram.org/bots/api#messageentity) to [HTML](https://core.telegram.org/bots/api#messageentity) or [Markdown](https://core.telegram.org/bots/api#markdownv2-style).

## When Should I Use This?

Probably NEVER!

While this plugin can generate Telegram-compatible HTML or MarkdownV2, it’s usually best to just send the text and entities back to Telegram.

Converting them to HTML or Markdown is only necessary in those rare cases when you need to use Telegram-formatted text **outside** of Telegram itself.

If you’re still unsure whether this plugin is the right fit for your use case, please don’t hesitate to ask in our [Telegram group](https://t.me/grammyjs).
In most cases, people find they don’t actually need this plugin to solve their problems!

## Installation

Simply run this line of code in your terminal.

::: code-group

```sh:no-line-numbers [Deno]
deno add @qz/grammy-entity
```

```sh:no-line-numbers [Bun]
bunx jsr add @qz/grammy-entity
```

```sh:no-line-numbers [pnpm]
pnpm dlx jsr add @qz/grammy-entity
```

```sh:no-line-numbers [Yarn]
yarn dlx jsr add @qz/grammy-entity
```

```sh:no-line-numbers [npm]
npx jsr add @qz/grammy-entity
```

:::

## Simple Usage

Using this plugin is super straightforward!
Here’s a quick example.

```ts
import { toHTML, toMarkdownV2 } from "@qz/grammy-entity";

bot.on(":text", async (ctx) => {
  const html = toHTML(ctx.msg); // Convert text to HTML string
  const md = toMarkdownV2(ctx.msg); // Convert text to MarkdownV2 string
});
```

Both functions will also work with captioned messages, such as photos or videos.

```ts
bot.on(":photo", async (ctx) => {
  const html = toHTML(ctx.msg); // Convert caption to HTML string
  const md = toMarkdownV2(ctx.msg); // Convert caption to MarkdownV2 string
});
```

You can also pass a text and entities object directly:

```ts
toHTML({ text: '...', entities: [...] }); // Get the HTML string
```

## Advanced Usage

The `toHTML` and `toMarkdown` functions are designed to produce HTML or Markdown that’s compatible with Telegram, which is a sensible default for a Telegram library.

However, if you want to serialize your data differently for another system, you can do that too!
Simply use the `serializeWith` function.

To get started, you’ll need to create a serializer with the following type.

```ts
import type { Serializer } from "@qz/grammy-entity";

const myHTMLSerializer: Serializer (match, node) {
	// Your custom implementation here
}
```

Each matched node will be passed to your function, and you only need to wrap it however you like!

If you’re looking for inspiration, check out the implementation of the [serializers](https://github.com/quadratz/grammy-entity/blob/main/src/serializers.ts).
You can easily copy, paste, and tweak it to fit your needs.

We’ve also got some built-in escapers available for your convenience.

```ts
import { escapeHtml, escapeMarkdownV2, type Escaper } from "@qz/grammy-entity";

escapeHtml(text); // Get HTML escaped text
escapeMarkdownV2(text); // Escape text for Telegram's MarkdownV2

// Or create your own escaper
const myEscaper: Escaper = (match) => {/* Your implementation here */};
```

With these tools at your disposal, you can whip up your own HTML serializer like this:

```ts
import { escapeHtml, serializeWith } from "@qz/grammy-entity";

const serialize = serializeWith(myHTMLSerializer, escapeHtml);
serialize(ctx.msg);
```

## Plugin Summary

- Name: grammy-entity
- Package: <https://jsr.io/@qz/grammy-entity>
- Source: <https://github.com/quadratz/grammy-entity>
