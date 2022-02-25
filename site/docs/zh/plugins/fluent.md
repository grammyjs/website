# 使用 Fluent 进行国际化 (`fluent`)

[Fluent](https://projectfluent.org/) 是 Mozilla 基金会制作的一个本地化系统，用于自然发音的翻译。
它有一个非常强大和优雅的语法，可以让任何人写出高效和完全可理解的翻译。
这个插件利用了这个惊人的本地化系统，使得由 grammY 驱动的 bot 能够流畅地进行高质量的翻译。

## 初始化 Fluent

你需要做的第一件事是初始化一个 Fluent 实例：

```typescript
import { Fluent } from "@moebius/fluent";

const fluent = new Fluent();
```

然后，你需要添加至少一个翻译到 Fluent 实例中：

```typescript
await fluent.addTranslation({
  // 指定你的翻译所支持的一个或多个地区：
  locales: "en",

  // 你可以直接指定翻译内容：
  source: "{YOUR TRANSLATION FILE CONTENT}",

  // 你也可以指定翻译文件：
  filePath: [
    `${__dirname}/feature-1/translation.en.ftl`,
    `${__dirname}/feature-2/translation.en.ftl`,
  ],

  // Fluent 的各个方面都是高度可配置的：
  bundleOptions: {
    // 使用该选项可以避免被替换的变量周围出现隐形字符。
    useIsolating: false,
  },
});
```

## 撰写翻译消息

Fluent 的语法很容易掌握。
你可以从 [官方示例](https://projectfluent.org/#examples) 或 [综合性语法指南](https://projectfluent.org/fluent/guide/) 中开始。

让我们从这个示例开始吧：

```ftl
-bot-name = Apples Bot

welcome =
  Welcome, {$name}, to the {-bot-name}!
  You have { NUMBER($applesCount) ->
    [0] no apples
    [one] {$applesCount} apple
    *[other] {$applesCount} apples
  }.
```

它演示了 Fluent 中三个重要的功能，分别是： **terms**， **variable substitution** (即 _placeables_) 和 **pluralization**。

`welcome` 是消息 ID，后面跟着的是消息体，在渲染时会通过 `welcome` 来引用消息体。

语句 `-bot-name = Apples Bot` 定义了一个 **term**，名称为 `bot-name`，值为 `Apples Bot`。
`{-bot-name}` 结构引用了之前定义的 term，在渲染时会被 term 的值替换。

语句 `{$name}` 将会被替换为 `name` 变量的值，你需要自己传递给翻译函数。

最后一条语句 (_第 5 行到第 9 行_) 定义了一个 **selector**（非常类似于 switch 语句），它接收应用于 `applesCount` 变量的特殊 `NUMBER` 函数的结果，并根据匹配的值选择三种可能的信息之一来渲染。
`NUMBER` 函数将根据提供的值和使用的语言返回一个 [CLDR plural category](https://www.unicode.org/cldr/cldr-aux/charts/30/supplemental/language_plural_rules.html)。
这有效地实现了 pluralization。

## grammY 配置

现在，让我们看看上面这条消息如何被 bot 渲染出来。
但首先，我们需要配置 grammY 使用该插件。

在所有其他方面之前，你需要配置你的 bot 使用 Fluent 上下文调味剂。
如果你不熟悉这个概念，你应该阅读 [上下文调味剂](/zh/guide/context.html#context-flavors) 的官方文档。

```typescript
import { Context } from "grammy";
import { FluentContextFlavor } from "@grammyjs/fluent";

// 扩展你的应用程序上下文类型，添加提供的调味剂接口。
export type MyAppContext = (
  & Context
  & FluentContextFlavor
);
```

你需要使用下面的方式创建你的 bot 实例，以便使用扩展的上下文类型：

```typescript
const bot = new Bot<MyAppContext>();
```

最后一步是将 Fluent 插件注册到 grammY 中：

```typescript
bot.use(useFluent({
  fluent,
}));
```

确保传递 [先前创建的 Fluent 实例](#初始化-fluent)。

## 渲染本地化消息

很好，我们已经有了渲染我们的消息的所有条件！
让我们通过在我们的机器人中定义一个测试命令来做到这一点。

```typescript
bot.command("i18n_test", async (ctx) => {
  // Call the "translate" or "t" helper to render the
  // message by specifying its ID and additional parameters:
  // 调用 "translate" 或 "t" 来渲染消息，指定其 ID 和额外参数：
  await context.reply(ctx.t("welcome", {
    name: context.from.first_name,
    applesCount: 1,
  }));
});
```

现在你可以启动你的 bot，并使用 `/i18n_test` 命令。
它应该渲染以下消息：

```text:no-line-numbers
Welcome, Slava, to the Apples Bot!
You have 1 apple.
```

当然，你将会看到你自己的名字而不是 "Slava"。
试着改变 `applesCount` 变量的值，看看渲染的消息会有什么变化！

请注意，你现在可以在任何有 `Context` 的地方使用翻译函数。
这个库将根据每个与你的 bot 互动的用户的个人偏好（在 Telegram 客户端设置中设置的语言）来自动确定最佳的语言。
你只需要创建几个翻译文件并确保所有的翻译都正确同步。

## 更进一步

- 阅读 [Fluent 文档](https://projectfluent.org/)，尤其是 [语法指南](https://projectfluent.org/fluent/guide/)。
- [从 `i18n` 插件迁移。](https://github.com/grammyjs/fluent#i18n-plugin-replacement)
- 熟悉了解 [`@moebius/fluent`](https://github.com/the-moebius/fluent#readme)。

## 插件概述

- 名字：`fluent`
- 源码：<https://github.com/grammyjs/fluent>
