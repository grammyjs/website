---
prev: false
next: false
---

# 解析模式（`parse-mode`）

Telegram 支持 [格式化消息](https://core.telegram.org/bots/api#messageentity)。
这个库为 grammY 带来了简化的格式化工具。
它使你能够使用声明式、类型安全的 API 来编写富文本格式的消息。

在 Telegram Bot API 中，格式化文本使用 *实体* 来表示，这些特殊的标记定义了文本的哪些部分应该以特定的方式格式化。
每个实体都有一个 *类型*（例如 `bold`、`italic` 等）、一个 *偏移量*（它在文本中的起始位置）和一个 *长度*（它影响多少个字符）。

直接处理这些实体可能很麻烦，因为你需要手动跟踪偏移量和长度。
解析模式插件通过提供一个简单的、声明式的 API 来格式化文本，解决了这个问题。

## 两种方法：`fmt` 和 `FormattedString`

这个库提供了两种主要的文本格式化方法：

1.  **`fmt` 标签模板函数**：
    一个 [带标签的模板字符串](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Template_literals#%E5%B8%A6%E6%A0%87%E7%AD%BE%E7%9A%84%E6%A8%A1%E6%9D%BF)，允许你使用模板表达式以自然的方式编写格式化文本。
    它在内部为你管理实体的偏移量和长度。

2.  **`FormattedString` 类**：
    一种基于类的方法，允许你通过方法链来构建格式化文本。
    这对于以编程方式构建复杂的格式化消息特别有用。

两种方法都产生一个统一的 `FormattedString` 对象，可用于操作格式化文本。

## 使用方法 (使用 `fmt`)

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { b, fmt, u } from "@grammyjs/parse-mode";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // 使用 fmt 返回值
  const combined = fmt`${b}加粗${b} ${ctx.msg.text} ${u}下划线${u}`;
  await ctx.reply(combined.text, { entities: combined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    { caption: combined.caption, caption_entities: combined.caption_entities },
  );
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { fmt, b, u } = require("@grammyjs/parse-mode");

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // 使用 fmt 返回值
  const combined = fmt`${b}加粗${b} ${ctx.msg.text} ${u}下划线${u}`;
  await ctx.reply(combined.text, { entities: combined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    { caption: combined.caption, caption_entities: combined.caption_entities },
  );
});

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { b, fmt, u } from "https://deno.land/x/grammy_parse_mode/mod.ts";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // 使用 fmt 返回值
  const combined = fmt`${b}加粗${b} ${ctx.msg.text} ${u}下划线${u}`;
  await ctx.reply(combined.text, { entities: combined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    { caption: combined.caption, caption_entities: combined.caption_entities },
  );
});

bot.start();
```

:::

## 使用方法 (使用 `FormattedString`)

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { FormattedString } from "@grammyjs/parse-mode";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // 静态方法
  const staticCombined = FormattedString.b("加粗").plain(` ${ctx.msg.text} `)
    .u("下划线");
  await ctx.reply(staticCombined.text, { entities: staticCombined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: staticCombined.caption,
      caption_entities: staticCombined.caption_entities,
    },
  );

  // 或构造函数
  const constructorCombined = (new FormattedString("")).b("加粗").plain(
    ` ${ctx.msg.text} `,
  ).u("下划线");
  await ctx.reply(constructorCombined.text, {
    entities: constructorCombined.entities,
  });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: constructorCombined.caption,
      caption_entities: constructorCombined.caption_entities,
    },
  );
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { FormattedString } = require("@grammyjs/parse-mode");

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // 静态方法
  const staticCombined = FormattedString.b("加粗").plain(` ${ctx.msg.text} `)
    .u("下划线");
  await ctx.reply(staticCombined.text, { entities: staticCombined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: staticCombined.caption,
      caption_entities: staticCombined.caption_entities,
    },
  );

  // 或构造函数
  const constructorCombined = (new FormattedString("")).b("加粗").plain(
    ` ${ctx.msg.text} `,
  ).u("下划线");
  await ctx.reply(constructorCombined.text, {
    entities: constructorCombined.entities,
  });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: constructorCombined.caption,
      caption_entities: constructorCombined.caption_entities,
    },
  );
});

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { FormattedString } from "https://deno.land/x/grammy_parse_mode/mod.ts";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // 静态方法
  const staticCombined = FormattedString.b("加粗").plain(` ${ctx.msg.text} `)
    .u("下划线");
  await ctx.reply(staticCombined.text, { entities: staticCombined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: staticCombined.caption,
      caption_entities: staticCombined.caption_entities,
    },
  );

  // 或构造函数
  const constructorCombined = (new FormattedString("")).b("加粗").plain(
    ` ${ctx.msg.text} `,
  ).u("下划线");
  await ctx.reply(constructorCombined.text, {
    entities: constructorCombined.entities,
  });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: constructorCombined.caption,
      caption_entities: constructorCombined.caption_entities,
    },
  );
});

bot.start();
```

:::

## 核心概念

### `FormattedString` 作为统一返回类型

`FormattedString` 类是 `parse-mode` 插件的核心组件，为处理格式化文本提供了一个统一的接口。
`fmt`、`new FormattedString` 和 `FormattedString.<staticMethod>` 的返回值都是 `FormattedString` 的实例。
这意味着不同风格的用法可以组合使用。

例如，可以使用 `fmt`，然后链式调用 `FormattedString` 的实例方法，再将结果传递给另一个 `fmt` 标签模板。

```ts
bot.on("msg:text", async (ctx) => {
  // fmt`${${u}内存已更新！${u}}` 的结果是一个 FormattedString
  // 其 `.plain("\n")` 的实例方法调用也返回一个 FormattedString
  const header = fmt`${u}内存已更新！${u}`.plain("\n");
  const body = FormattedString.plain("我会记住这个的！");
  const footer = "\n - by grammy AI";

  // 这也可以 - 你可以给 `fmt` 传递 FormattedString 和字符串
  const response = fmt`${header}${body}${footer}`;
  await ctx.reply(response.text, { entities: response.entities });
});
```

### `fmt` 接受的内容

`fmt` 标签模板接受多种值来构造你的 `FormattedString`，包括：

- `TextWithEntities` (由 `FormattedString` 和普通的 Telegram 文本消息实现)
- `CaptionWithEntities` (由 `FormattedString` 和带标题的普通 Telegram 媒体消息实现)
- EntityTag (例如 `b()` 和 `a(url)` 函数)
- 返回 EntityTag 的无参函数 (例如 `b` 和 `i`)
- 任何实现了 `toString()` 的类型 (将被视为纯文本值)

### TextWithEntities

`TextWithEntities` 接口表示带有可选格式化实体的文本。

```ts
interface TextWithEntities {
  text: string;
  entities?: MessageEntity[];
}
```

请注意，这样的类型意味着来自 Telegram 的常规文本消息也隐式实现了 `TextWithEntities`。
这意味着实际上可以执行以下操作：

```ts
bot.on("msg:text", async (ctx) => {
  const response = fmt`${ctx.msg}`.plain("\n---\n").bold("这是我的回应");
  await ctx.reply(response.text, { entities: response.entities });
});
```

### CaptionWithEntities

`CaptionWithEntities` 接口表示带有可选格式化实体的标题。

```ts
interface CaptionWithEntities {
  caption: string;
  caption_entities?: MessageEntity[];
}
```

同样，请注意，这样的类型意味着来自 Telegram 的带标题的常规媒体消息也隐式实现了 `CaptionWithEntities`。
这意味着实际上也可以执行以下操作：

```ts
bot.on("msg:caption", async (ctx) => {
  const response = fmt`${ctx.msg}`.plain("\n---\n").bold("这是我的回应");
  await ctx.reply(response.text, { entities: response.entities });
});
```

## 插件概述

- 名字：`parse-mode`
- [源码](https://github.com/grammyjs/parse-mode)
- [参考](/ref/parse-mode/)
