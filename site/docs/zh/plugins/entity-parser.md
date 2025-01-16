---
prev: false
next: false
---

# 实体解析器 (`entity-parser`)

将 [Telegram 实体 (entities)](https://core.telegram.org/bots/api#messageentity) 转换为语义 HTML。

## 我应该在什么时候用这个插件？

最好**永远别用**！

虽然这个插件可以生成 HTML，但一般而言最好将文本和实体发送回 Telegram。

仅在极少数情况下才需要将实体转换为 HTML，即您需要在 Telegram **之外**使用带 Telegram 格式的文本，例如在网站上显示 Telegram 消息。

请参阅 [_最好不要使用这个包的情况_](#最好不要使用这个包的情况) 部分，确认您是不是有类似的问题要解决。

如果您不确定在您的情况下使用此插件是否合适，请随时在我们的 [Telegram 群组](https://t.me/grammyjs) 中提问。
在大多数情况下，人们会发现他们实际上并不需要这个插件来解决他们的问题！

## 安装

根据您的运行时或包管理器在终端中运行以下命令：

::: code-group

```sh:no-line-numbers [Deno]
deno add jsr:@qz/telegram-entities-parser
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

## 基本用法

使用此插件非常简单。
这是一个简单的示例：

```ts
import { EntitiesParser } from "@qz/telegram-entities-parser";
import type { Message } from "@qz/telegram-entities-parser/types";

// 为了获得更好的性能，请在函数外部创建实例。
const entitiesParser = new EntitiesParser();
const parse = (message: Message) => entitiesParser.parse({ message });

bot.on(":text", (ctx) => {
  const html = parse(ctx.msg); // 将文本转换为 HTML 字符串
});

bot.on(":photo", (ctx) => {
  const html = parse(ctx.msg); // 将标题转换为 HTML 字符串
});
```

## 高级用法

### 自定义输出的 HTML 标签

这个包将实体转换为语义 HTML，尽可能地遵循最佳实践和标准。
但是，提供的输出可能并不总是您所期望的。

为了解决这个问题，您可以使用自己的 `renderer` 根据规则自定义环绕文本的 HTML 元素。
您可以通过扩展默认的 [`RendererHtml`](https://github.com/quadratz/telegram-entities-parser/blob/main/src/renderers/renderer_html.ts) 来修改特定规则，或者通过实现 [`Renderer`](https://github.com/quadratz/telegram-entities-parser/blob/main/src/renderers/renderer.ts) 来覆盖所有规则。

要扩展现有的 `renderer`，请执行以下操作：

```ts
import { EntitiesParser, RendererHtml } from "@qz/telegram-entities-parser";
import type {
  CommonEntity,
  RendererOutput,
} from "@qz/telegram-entities-parser/types";

// 更改粗体类型实体的规则，
// 但保留 `RendererHtml` 定义的其余类型。
class MyRenderer extends RendererHtml {
  override bold(
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

`options` 参数接受带有 `text` 和 `entity` 参数的对象。

- `text`：当前实体引用的特定文本。
- `entity`：根据实体类型以不同接口表示，例如 `CommonEntity`、`CustomEmojiEntity`、`PreEntity`、`TextLinkEntity` 或 `TextMentionEntity`。
  例如，`bold` 实体符合 `CommonEntity` 接口，而 `text_link` 实体则符合 `TextLinkEntity` 接口，因为它包含其他属性，例如 `url`。

以下是接口的完整列表以及每种实体类型的输出：

| 实体类型                | 接口                | 结果                                                                                                                                                                               |
| ----------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `blockquote`            | `CommonEntity`      | `<blockquote class="tg-blockquote"> ... </blockquote>`                                                                                                                             |
| `bold`                  | `CommonEntity`      | `<b class="tg-bold"> ... </b>`                                                                                                                                                     |
| `bot_command`           | `CommonEntity`      | `<span class="tg-bot-command"> ... </span>`                                                                                                                                        |
| `cashtag`               | `CommonEntity`      | `<span class="tg-cashtag"> ... </span>`                                                                                                                                            |
| `code`                  | `CommonEntity`      | `<code class="tg-code"> ... </code>`                                                                                                                                               |
| `custom_emoji`          | `CustomEmojiEntity` | `<span class="tg-custom-emoji" data-custom-emoji-id="${options.entity.custom_emoji_id}"> ... </span>`                                                                              |
| `email`                 | `CommonEntity`      | `<a class="tg-email" href="mailto:${options.text}"> ... </a>`                                                                                                                      |
| `expandable_blockquote` | `CommonEntity`      | `<blockquote class="tg-expandable-blockquote"> ... </blockquote>`                                                                                                                  |
| `hashtag`               | `CommonEntity`      | `<span class="tg-hashtag"> ... </span>`                                                                                                                                            |
| `italic`                | `CommonEntity`      | `<i class="tg-italic"> ... </i>`                                                                                                                                                   |
| `mention`               | `CommonEntity`      | `<a class="tg-mention" href="https://t.me/${username}"> ... </a>`                                                                                                                  |
| `phone_number`          | `CommonEntity`      | `<a class="tg-phone-number" href="tel:${options.text}"> ... </a>`                                                                                                                  |
| `pre`                   | `PreEntity`         | `<pre class="tg-pre-code"><code class="language-${options.entity.language}"> ... </code></pre>` 或 `<pre class="tg-pre"> ... </pre>`                                               |
| `spoiler`               | `CommonEntity`      | `<span class="tg-spoiler"> ... </span>`                                                                                                                                            |
| `strikethrough`         | `CommonEntity`      | `<del class="tg-strikethrough"> ... </del>`                                                                                                                                        |
| `text_link`             | `TextLinkEntity`    | `<a class="tg-text-link" href="${options.entity.url}"> ... </a>`                                                                                                                   |
| `text_mention`          | `TextMentionEntity` | `<a class="tg-text-mention" href="https://t.me/${options.entity.user.username}"> ... </a>` 或 `<a class="tg-text-mention" href="tg://user?id=${options.entity.user.id}"> ... </a>` |
| `underline`             | `CommonEntity`      | `<span class="tg-bot-command"> ... </span>`                                                                                                                                        |
| `url`                   | `CommonEntity`      | `<a class="tg-url" href="${options.text}"> ... </a>`                                                                                                                               |

如果你不确定哪个接口是正确的，请参考 [Renderer](https://github.com/quadratz/telegram-entities-parser/blob/main/src/renderers/renderer.ts) 或 [RendererHtml](https://github.com/quadratz/telegram-entities-parser/blob/main/src/renderers/renderer_html.ts) 的实现方式。

### 自定义文本清理器

默认情况下，输出文本经过清理，以确保正确呈现 HTML 并防止 XSS 漏洞。

| 输入 | 输出     |
| ---- | -------- |
| `&`  | `&amp;`  |
| `<`  | `&lt;`   |
| `>`  | `&gt;`   |
| `"`  | `&quot;` |
| `'`  | `&#x27;` |

例如，结果 `<b>粗体</b> & <i>斜体</i>` 将被清理为 `<b>粗体</b> &amp; <i>斜体</i>`。

您可以在实例化 [`EntitiesParser`](https://github.com/quadratz/telegram-entities-parser/blob/main/src/mod.ts) 时指定 `textSanitizer` 来覆盖此行为：

- 如果您未指定 `textSanitizer`，它将默认使用 [`sanitizerHtml`](https://github.com/quadratz/telegram-entities-parser/blob/main/src/utils/sanitizer_html.ts) 作为清理程序。
- 将值设置为 `false` 将跳过清理，保持输出文本为原始文本。
  不建议这样做，因为它可能会导致渲染不正确，并使您的应用程序容易受到 XSS 攻击。
  如果选择此选项，请确保您正确处理输出文本。
- 如果您提供一个函数，它将被用来代替默认清理程序。

```ts
const myTextSanitizer: TextSanitizer = (options: TextSanitizerOption): string =>
  // 替换危险的字符
  options.text.replaceAll(/[&<>"']/, (match) => {
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

// 实施清理。
const entitiesParser = new EntitiesParser({ textSanitizer: myTextSanitizer });
```

## 最好不要使用这个包的情况

如果您遇到的问题和下面列出的问题类似，您可能不需要使用这个包就能解决问题。

### 复制和转发同一条消息

使用 [`forwardMessage`](https://core.telegram.org/bots/api#forwardmessage) 即可转发任何类型的消息。

您还可以使用 [`copyMessage`](https://core.telegram.org/bots/api#copymessage) API。该 API 会执行同样的操作，但不包含指向原始消息的链接。
[`copyMessage`](https://core.telegram.org/bots/api#copymessage) 的行为类似于复制消息并将其发送回 Telegram，使其显示为常规消息而不是转发的消息。

```ts
bot.on(":text", async (ctx) => {
  // 要发送消息的对话的 ID。
  const chatId = -946659600;
  // 转发当前消息，不包含原始消息的链接。
  await ctx.copyMessage(chatId);
  // 转发当前消息，包含原始消息的链接。
  await ctx.forwardMessage(chatId);
});
```

### 回复修改了文本格式的消息

你可以轻松使用 HTML、Markdown 或实体 (`entities`) 来回复消息。

```ts
bot.on(":text", async (ctx) => {
  // 使用 HTML 回复
  await ctx.reply("<b>bold</b> <i>italic</i>", { parse_mode: "HTML" });
  // 使用 Telegram Markdown V2 回复
  await ctx.reply("*bold* _italic_", { parse_mode: "MarkdownV2" });
  // 使用实体回复
  await ctx.reply("bold italic", {
    entities: [
      { offset: 0, length: 5, type: "bold" },
      { offset: 5, length: 6, type: "italic" },
    ],
  });
});
```

::: tip 使用 parse-mode 获得更好的格式化体验

使用官方 [`parse-mode` (解析模式)](./parse-mode) 插件获得更好的格式化消息构建体验。
:::

## 插件概述

- 名称: `entity-parser`
- [包](https://jsr.io/@qz/telegram-entities-parser)
- [源码](https://github.com/quadratz/telegram-entities-parser)
