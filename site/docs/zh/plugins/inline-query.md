# Inline Queries

使用 inline query，用户可以在任何聊天中搜索、浏览和发送你的 bot 建议的内容，即使他们不是该聊天的成员。
要实现这一点，他们可以在消息中以 `@your_bot_name` 开头并选择一个结果。

> 请查阅 Telegram 团队编写的 [Telegram Bot 特性](https://core.telegram.org/bots/features#inline-requests) 中的 Inline 模式部分。
> 更多资源包括他们对 inline bot 的 [详细描述](https://core.telegram.org/bots/inline)，以及宣布该功能的 [原始博客文章](https://telegram.org/blog/inline-bots) 和 [Telegram Bot API 参考](https://core.telegram.org/bots/api#inline-mode) 的 Inline 模式部分。
> 在为你的 bot 实现 inline query 之前，这些内容都值得阅读一遍，因为 inline query 属于稍微高级的功能。
> 如果你不想阅读所有这些内容，可以放心，本页面将逐步指导你完成每一步。

## 开启 Inline 模式

默认情况下，你的 bot 不支持 inline 模式。
你需要联系 [@BotFather](https://t.me/BotFather) 并为你的 bot 启用 inline 模式来开始接收inline query。

明白了吗？
现在，你的 Telegram 客户端在任何文本输入框中输入 bot 名称时应显示“...”并显示加载动画。
你现在可以开始输入内容了。
现在让我们看看你的 bot 如何处理这些查询。

## 处理 Inline Query

一旦用户触发了 inline query，即通过在文本输入框中输入“@your_bot_name ...”开始一条消息，你的 bot 将收到与此相关的 update。
通过 `bot.inlineQuery()` 方法，grammY 支持处理 inline query，详见 [grammY API参考](https://deno.land/x/grammy/mod.ts?s=Composer#method_inlineQuery_0) 中的 `Composer` 类文档。
该方法允许你监听与字符串或正则表达式匹配的特定 inline query。
如果你希望通用地处理所有 inline query，请使用 `bot.on("inline_query")`。

```ts
// 监听特定的字符串或正则表达式。
bot.inlineQuery(/best bot (framework|library)/, async (ctx) => {
  const match = ctx.match; // 正则匹配对象
  const query = ctx.inlineQuery.query; // 查询字符串
});

// 监听所有 inline query.
bot.on("inline_query", async (ctx) => {
  const query = ctx.inlineQuery.query; // 查询字符串
});
```

现在我们知道如何监听 inline query 的 update，我们可以用结果列表来回复它们。

## 构建 Inline Query 结果

构建 inline query 的结果列表是一项繁琐的任务，因为你需要构建拥有各种属性的 [复杂的嵌套对象](https://core.telegram.org/bots/api#inlinequeryresult)。
幸运的是，你正在使用 grammY，当然有一些辅助工具可以使这个任务变得非常简单。

每个结果都需要三个要素。

1. 一个唯一的字符串标识符。
2. 一个描述如何显示 inline query 结果的 _结果对象_。
   它可以包含标题、链接或图像等内容。
3. 一个描述用户选择此结果时将发送的消息内容的 _消息内容对象_。
   在某些情况下，可以从结果对象中隐含地推断出消息内容。
   例如，如果你希望结果以 GIF 的形式显示，Telegram 会明白消息内容将同样是 GIF，除非你指定一个消息内容对象。

grammY 为 inline query 结果导出了一个名为 `InlineQueryResultBuilder` 的构建器。
以下是一些使用示例。

::::code-group
:::code-group-item TypeScript

```ts
import { InlineKeyboard, InlineQueryResultBuilder } from "grammy";

// 构建一个图片结果。
InlineQueryResultBuilder.photo("id-0", "https://grammy.dev/images/Y.png");

// 构建一个显示为图片但发送的是文本消息的结果。
InlineQueryResultBuilder.photo("id-1", "https://grammy.dev/images/Y.png")
  .text("This text will be sent instead of the photo");

// 构建一个文本结果。
InlineQueryResultBuilder.article("id-2", "Inline Queries")
  .text("Great inline query docs: grammy.dev/plugins/inline-query");

// 将更多选项传递给结果。
const keyboard = new InlineKeyboard()
  .text("Aw yis", "call me back");
InlineQueryResultBuilder.article("id-3", "Hit me", { reply_markup: keyboard })
  .text("Push my buttons");

// 将更多选项传递给消息内容。
InlineQueryResultBuilder.article("id-4", "Inline Queries")
  .text("**Outstanding** docs: grammy.dev", { parse_mode: "MarkdownV2" });
```

:::
::: code-group-item JavaScript

```js
const { InlineKeyboard, InlineQueryResultBuilder } = require("grammy");

// 构建一个图片结果。
InlineQueryResultBuilder.photo("id-0", "https://grammy.dev/images/Y.png");

// 构建一个显示为图片但发送的是文本消息的结果。
InlineQueryResultBuilder.photo("id-1", "https://grammy.dev/images/Y.png")
  .text("This text will be sent instead of the photo");

// 构建一个文本结果。
InlineQueryResultBuilder.article("id-2", "Inline Queries")
  .text("Great inline query docs: grammy.dev/plugins/inline-query");

// 将更多选项传递给结果。
const keyboard = new InlineKeyboard()
  .text("Aw yis", "call me back");
InlineQueryResultBuilder.article("id-3", "Hit me", { reply_markup: keyboard })
  .text("Push my buttons");

// 将更多选项传递给消息内容。
InlineQueryResultBuilder.article("id-4", "Inline Queries")
  .text("**Outstanding** docs: grammy.dev", { parse_mode: "MarkdownV2" });
```

:::
:::code-group-item Deno

```ts
import {
  InlineKeyboard,
  InlineQueryResultBuilder,
} from "https://deno.land/x/grammy/mod.ts";

// 构建一个图片结果。
InlineQueryResultBuilder.photo("id-0", "https://grammy.dev/images/Y.png");

// 构建一个显示为图片但发送的是文本消息的结果。
InlineQueryResultBuilder.photo("id-1", "https://grammy.dev/images/Y.png")
  .text("This text will be sent instead of the photo");

// 构建一个文本结果。
InlineQueryResultBuilder.article("id-2", "Inline Queries")
  .text("Great inline query docs: grammy.dev/plugins/inline-query");

// 将更多选项传递给结果。
const keyboard = new InlineKeyboard()
  .text("Aw yis", "call me back");
InlineQueryResultBuilder.article("id-3", "Hit me", { reply_markup: keyboard })
  .text("Push my buttons");

// 将更多选项传递给消息内容。
InlineQueryResultBuilder.article("id-4", "Inline Queries")
  .text("**Outstanding** docs: grammy.dev", { parse_mode: "MarkdownV2" });
```

:::
::::

请注意，如果你希望通过现有文件标识符发送文件，你应该使用 `*Cached` 方法。

```ts
// 通过文件标识符发送的音频文件的结果。
const audioFileId = "AgADBAADZRAxGyhM3FKSE4qKa-RODckQHxsoABDHe0BDC1GzpGACAAEC";
InlineQueryResultBuilder.audioCached("id-0", audioFileId);
```

> [点击此处](../guide/files.md#文件怎么在-telegram-bot-程序中工作) 阅读有关文件标识符的更多信息。

你应该阅读 `InlineQueryResultBuilder` 的 [API 参考](https://deno.land/x/grammy/mod.ts?s=InlineQueryResultBuilder) 和 `InlineQueryResult` 的 [规范](https://core.telegram.org/bots/api#inlinequeryresult) 来查看所有可用选项。


## 回复 Inline Query

在使用 [上述](#构建-inline-query-结果) 构建器生成 inline query 结果的数组后，你可以调用 `answerInlineQuery` 将这些结果发送给用户。

```ts
// 在一个项目的文档中的不要脸的自我宣传
// 就是最好的广告。
bot.inlineQuery(/best bot (framework|library)/, async (ctx) => {
  // 创建一个单独的 inline query 结果。
  const result = InlineQueryResultBuilder
    .article("id:grammy-website", "grammY", {
      reply_markup: new InlineKeyboard()
        .url("grammY website", "https://grammy.dev/"),
    })
    .text(
      `<b>grammY</b> is the best way to create your own Telegram bots.
They even have a pretty website! 👇`,
      { parse_mode: "HTML" },
    );

  // 回复 inline query.
  await ctx.answerInlineQuery(
    [result], // 用结果列表回复
    { cache_time: 30 * 24 * 3600 }, // 30 天的秒数
  );
});

// 对于其他查询，返回空结果列表。
bot.on("inline_query", (ctx) => ctx.answerInlineQuery([]));
```

[别忘了](../guide/basics.md#发送信息)，当调用 API 方法时，你始终可以使用类型为 `Other` 的选项对象来指定更多选项。例如，你可以在 [这里](https://core.telegram.org/bots/api#answerinlinequery) 看到，`answerInlineQuery` 允许你通过偏移量来进行 inline query 分页。

:::tip 混合文本和媒体
虽然允许发送同时包含媒体和文本元素的结果列表，但大多数 Telegram 客户端并不能很好地渲染它们。
从用户体验的角度来看，你应该避免这种情况。
:::

## Inline Query 结果上方的按钮

Telegram 客户端可以在结果列表上方 [显示一个按钮](https://core.telegram.org/bots/api#inlinequeryresultsbutton)。
这个按钮可以将用户带到与 bot 的私聊界面。

```ts
const button = {
  text: "Open private chat",
  start_parameter: "login",
};
await ctx.answerInlineQuery(results, { button });
```

当用户按下按钮时，将向你的 bot 发送一个 `/start` 命令消息。
启动参数将通过 [深度链接](../guide/commands.md#深度链接支持) 提供。
换句话说，使用上述代码片段，在你的命令处理程序中，`ctx.match` 将具有值 `"login"`。

如果你随后使用一个 `switchInline` 按钮发送一个 [inline keyboard](./keyboard.md#构建一个-inline-keyboard)，用户将返回到最初按下 inline query 结果按钮的聊天界面。

```ts
bot
  .command("start")
  .filter((ctx) => ctx.match === "login", async (ctx) => {
    // 当用户请求 inline query 结果。
    await ctx.reply("DM open, you can go back now!", {
      reply_markup: new InlineKeyboard()
        .switchInline("Go back"),
    });
  });
```

这样，你可以在发送 inline query 结果之前，在私聊中执行诸如登录之类的程序。
在将它们发送回去之前，可以来回进行一些对话交流。
例如，你可以使用对话插件 [进行简短对话](./conversations.md#安装并进入对话)。

## 获取关于选中结果的反馈

Inline query 的结果以一种发送后忘记的方式进行发送。
换句话说，当你的 bot 将 inline query 结果列表发送到 Telegram 之后，它将不知道用户选择了哪个结果（或者是否选择了一个结果）。

如果你对此感兴趣，你可以通过 [@BotFather](https://t.me/BotFather) 启用 inline feedback。
你可以通过选择 0％（禁用反馈）和 100％（为每个选择的结果接收反馈）之间的几个选项来决定你想要接收多少反馈。

Inline feedback 通过 `chosen_inline_result` update 发送。
你可以通过字符串或正则表达式监听特定的结果标识符。
当然，你也可以通过正常的 filter query 的方式来监听 update。

```ts
// 监听特定结果标识符
bot.chosenInlineResult(/id-[0-9]+/, async (ctx) => {
  const match = ctx.match; // 正则匹配对象
  const query = ctx.chosenInlineResult.query; // 使用的 inline query
});

// 监听任何选中的 inline query 结果
bot.on("chosen_inline_result", async (ctx) => {
  const query = ctx.chosenInlineResult.query; // 使用的 inline query
});
```

有些 bot 将反馈设置为 100%，并将其用作一种奇技淫巧。
它们在 `answerInlineQuery` 中发送没有实际内容的虚拟消息。
在接收到 `chosen_inline_result` 的 update 后，它们会编辑相应的消息并注入真正的消息内容。

这些 bot 在匿名管理员或发送定时消息时将无法工作，因为在这些情况下无法接收到 inline feedback。
然而，如果这对你来说不是问题，那么这种技巧将允许你无需为最终不会被发送的消息生成大量的消息内容。
这可以节省你的 bot 资源。

## 插件概述

这个插件已内置到 grammY 的核心中。
你无需安装即可使用它。
只需从 grammY 本身导入即可。

此外，该插件的文档和 API 参考与核心包统一。