---
prev: false
next: false
---

# Convert Telegram Entities (telegram-entities-parser)

Converts [Telegram entities](https://core.telegram.org/bots/api#messageentity)
to semantic HTML.

## When Should I Use This?

Probably NEVER!

While this plugin can generate HTML, it's generally best to send the text and entities back to Telegram.

Converting them to HTML is only necessary in rare cases where you need to use Telegram-formatted text **outside** of Telegram itself, such as displaying Telegram messages on a website.

See the [_Cases When It's Better to Not Use This Package_](#cases-when-it-s-better-to-not-use-this-package) section to determine if you have a similar problem to solve.

If you're unsure whether this plugin is the right fit for your use case, please don't hesitate to ask in our [Telegram group](https://t.me/grammyjs).
In most cases, people find they don't actually need this plugin to solve their problems!

## Installation

Run the following command in your terminal based on your runtime or package manager:

::: code-group

```sh:no-line-numbers [Deno]
deno add @qz/telegram-entities-parser
```

```sh:no-line-numbers [Bun]
bunx jsr add @qz/telegram-entities-parser
```

```sh:no-line-numbers [pnpm]
pnpm dlx jsr add @qz/telegram-entities-parser
```

```sh:no-line-numbers [Yarn]
yarn dlx jsr add @qz/telegram-entities-parser
```

```sh:no-line-numbers [npm]
npx jsr add @qz/telegram-entities-parser
```

:::

## Simple Usage

Using this plugin is straightforward.
Here's a quick example:

```ts
import { EntitiesParser } from "@qz/telegram-entities-parser";
import type { Message } from "@qz/telegram-entities-parser/types";

// For better performance, create the instance outside the function.
const entitiesParser = new EntitiesParser();
const parse = (message: Message) => entitiesParser.parse({ message });

bot.on(":text", (ctx) => {
  const html = parse(ctx.msg); // Convert text to HTML string
});

bot.on(":photo", (ctx) => {
  const html = parse(ctx.msg); // Convert caption to HTML string
});
```

## Advanced usage

### Customize the Output HTML Tag

This package converts entities into semantic HTML, adhering to best practices and standards as closely as possible.
However, you might find that the provided output is not exactly what you expected.

To address this, you can use your own `renderer` to customize the HTML elements surrounding the text according to your rules.
You can modify specific rules by extending the default [`RendererHtml`](https://github.com/quadratz/telegram-entities-parser/blob/main/src/renderers/renderer_html.ts) or override all the rules by implementing the [`Renderer`](https://github.com/quadratz/telegram-entities-parser/blob/main/src/renderers/renderer.ts).

To extend the existing `renderer`, do the following:

```ts
import { EntitiesParser, RendererHtml } from "@qz/telegram-entities-parser";
import type {
  CommonEntity,
  RendererOutput,
} from "@qz/telegram-entities-parser/types";

// Change the rule for bold type entity,
// but leave the rest of the types as defined by `RendererHtml`.
class MyRenderer extends RendererHtml {
  bold(
    options: { text: string; entity: CommonEntity },
  ): RendererOutput {
    return {
      prefix: '<strong class="tg-bold">',
      suffix: "</strong>",
    };
  }
}

const entitiesParser = new EntitiesParser({ renderer: new MyRenderer() });
```

The `options` parameter accepts an object with `text` and `entity`.

- `text`: The specific text that the current entity refers to.
- `entity`: This may be represented by various interfaces depending on the entity type, such as `CommonEntity`, `CustomEmojiEntity`, `PreEntity`, `TextLinkEntity`, or `TextMentionEntity`.
  For instance, the `bold` type has an entity with the `CommonEntity` interface, while the `text_link` type may have an entity with the `TextLinkEntity` interface, as it includes additional properties like `url`.

Here is the full list of interfaces and the output for each entity type:

| Entity Type            | Interface           | Result                                                                                                                                                                             |
| ---------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `blockquote`           | `CommonEntity`      | `<blockquote class="tg-blockquote"> ... </blockquote>`                                                                                                                             |
| `bold`                 | `CommonEntity`      | `<b class="tg-bold"> ... </b>`                                                                                                                                                     |
| `bot_command`          | `CommonEntity`      | `<span class="tg-bot-command"> ... </span>`                                                                                                                                        |
| `cashtag`              | `CommonEntity`      | `<span class="tg-cashtag"> ... </span>`                                                                                                                                            |
| `code`                 | `CommonEntity`      | `<code class="tg-code"> ... </code>`                                                                                                                                               |
| `custom_emoji`         | `CustomEmojiEntity` | `<span class="tg-custom-emoji" data-custom-emoji-id="${options.entity.custom_emoji_id}"> ... </span>`                                                                              |
| `email`                | `CommonEntity`      | `<a class="tg-email" href="mailto:${options.text}"> ... </a>`                                                                                                                      |
| `expandableBlockquote` | `CommonEntity`      | `<blockquote class="tg-expandable-blockquote"> ... </blockquote>`                                                                                                                  |
| `hashtag`              | `CommonEntity`      | `<span class="tg-hashtag"> ... </span>`                                                                                                                                            |
| `italic`               | `CommonEntity`      | `<i class="tg-italic"> ... </i>`                                                                                                                                                   |
| `mention`              | `CommonEntity`      | `<a class="tg-mention" href="https://t.me/${username}"> ... </a>`                                                                                                                  |
| `phone_number`         | `CommonEntity`      | `<a class="tg-phone-number" href="tel:${options.text}"> ... </a>`                                                                                                                  |
| `pre`                  | `PreEntity`         | `<pre class="tg-pre-code"><code class="language-${options.entity.language} ... </code></pre>` or `<pre class="tg-pre"> ... </pre>`                                                 |
| `spoiler`              | `CommonEntity`      | `<span class="tg-spoiler"> ... </span>`                                                                                                                                            |
| `strikethrough`        | `CommonEntity`      | `<del class="tg-strikethrough"> ... </del>`                                                                                                                                        |
| `text_link`            | `TextLinkEntity`    | `<a class="tg-text-link" href="${options.entity.url}"> ... </a>`                                                                                                                   |
| `text_mention`         | `TextMentionEntity` | `<a class="tg-text-mention" href="https://t.me/${options.entity.user.username}"> ... </a>` or `<a class="tg-text-mention" href="tg://user?id=${options.entity.user.id}"> ... </a>` |
| `underline`            | `CommonEntity`      | `<span class="tg-bot-command"> ... </span>`                                                                                                                                        |
| `url`                  | `CommonEntity`      | `<a class="tg-url" href="${options.text}"> ... </a>`                                                                                                                               |

If you are unsure which interface is correct, refer to how the [Renderer](https://github.com/quadratz/telegram-entities-parser/blob/main/src/renderers/renderer.ts) or [RendererHtml](https://github.com/quadratz/telegram-entities-parser/blob/main/src/renderers/renderer_html.ts) is implemented.

### Customize the Text Sanitizer

The output text is sanitized by default to ensure proper HTML rendering and prevent XSS vulnerabilities.

| Input | Output   |
| ----- | -------- |
| `&`   | `&amp;`  |
| `<`   | `&lt;`   |
| `>`   | `&gt;`   |
| `"`   | `&quot;` |
| `'`   | `&#x27;` |

For example, the result `<b>Bold</b> & <i>Italic</i>` will be sanitized to `<b>Bold</b> &amp; <i>Italic</i>`.

You can override this behavior by specifying a `textSanitizer` when instantiating the [`EntitiesParser`](https://github.com/quadratz/telegram-entities-parser/blob/main/src/mod.ts):

- If you do not specify `textSanitizer`, it will default to using [`sanitizerHtml`](https://github.com/quadratz/telegram-entities-parser/blob/main/src/utils/sanitizer_html.ts) as the sanitizer.
- Setting the value to `false` will skip sanitization, keeping the output text as the original.
  This is not recommended, as it may result in incorrect rendering and make your application vulnerable to XSS attacks.
  Ensure proper handling if you choose this option.
- If you provide a function, it will be used instead of the default sanitizer.

Example,

```ts
const myTextSanitizer: TextSanitizer = (options: TextSanitizerOption): string =>
  // Replace dangerous character
  options.text.replace(/[&<>"']/g, (match) => {
    switch (match) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#x27;";
      default:
        return match;
    }
  });

// Implement the sanitizer.
const entitiesParser = new EntitiesParser({ textSanitizer: myTextSanitizer });
```

## Cases When It's Better to Not Use This Package

If you face problems similar to those listed below, you might be able to resolve them without using this package.

### Copy and Forward the Same Message

Use [`forwardMessage`](https://core.telegram.org/bots/api#forwardmessage) to forward messages of any kind.

You can also use the [`copyMessage`](https://core.telegram.org/bots/api#copymessage) API, which performs the same action but does not include a link to the original message.
[`copyMessage`](https://core.telegram.org/bots/api#copymessage) behaves like copying the message and sending it back to Telegram, making it appear as a regular message rather than a forwarded one.

Example:

```ts
bot.on(":text", async (ctx) => {
  // The target chat id to send.
  const chatId = "-946659600";
  // Forward the current message without a link to the original message.
  await ctx.copyMessage(chatId);
  // Forward the current message with a link to the original message.
  await ctx.forwardMessage(chatId);
});
```

### Reply to Messages with Modified Text Format

You can easily reply to incoming messages using HTML, Markdown, or entities.

```ts
bot.on(":text", async (ctx) => {
  // Reply using HTML
  await ctx.reply("<b>bold</b> <i>italic</i>", { parse_mode: "HTML" });
  // Reply using Telegram Markdown V2
  await ctx.reply("*bold* _italic_", { parse_mode: "MarkdownV2" });
  // Reply with entities
  await ctx.reply("bold italic", {
    entities: [
      { offset: 0, length: 5, type: "bold" },
      { offset: 5, length: 6, type: "italic" },
    ],
  });
});
```

::: tip Use parse-mode for a Better Formatting Experience

grammY also provides a useful plugin called [`parse-mode`](./parse-mode) for better message formatting.
You can format messages like this:

```ts
ctx.replyFmt(fmt`${bold("bold")} ${italic("italic")}`);
```

[Check it out](./parse-mode) if you're interested.
:::

## Plugin Summary

- Name: telegram-entities-parser
- Package: <https://jsr.io/@qz/telegram-entities-parser>
- Source: <https://github.com/quadratz/telegram-entities-parser>
