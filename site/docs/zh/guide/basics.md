---
prev:
  link: ./getting-started
next:
  link: ./context
---

# 发送和接收信息

一旦你用 `bot.start()` 启动你的 bot，grammY 将为你的监听器提供用户发送给你的 bot 的信息。
grammY 还提供了方便回复的方法。

## 接收信息

监听信息的最简单的方法，是这样：

```ts
bot.on("message", async (ctx) => {
  const message = ctx.message; // 消息对象
});
```

当然，也有一些其他选择：

```ts
// 处理 commands, 比如 /start。
bot.command("start", async (ctx) => {/* ... */});

// 把信息文本与一个字符串或正则表达式相匹配。
bot.hears(/echo *+)?/, async (ctx) => {/* ... */});
```

你可以在你的代码编辑器中使用自动完成来查看所有可用的选项，或者查看 `Composer` 类的 [所有方法](https://deno.land/x/grammy/mod.ts?s=Composer)。

> [了解更多](./filter-queries) 关于使用 `bot.on()` 来筛选请求的内容。

## 发送信息

Bot 可以使用的所有方法（**[重要的列表](https://core.telegram.org/bots/api#available-methods)**）都可以通过 `bot.api` 对象上使用。

```ts
// 向用户 12345 发送一条消息。
await bot.api.sendMessage(12345, "Hi!");
// 你也可以选择性地传入一个选项对象。
await bot.api.sendMessage(12345, "Hi!", {/* 其他选项 */});
// 检查已发送消息的消息对象。
const message = await bot.api.sendMessage(12345, "Hi!");
console.log(message.message_id);

// 获取有关 bot 本身的信息。
const me = await bot.api.getMe();

// 及其他
```

每个方法都接受一个可选的 `Other` 类型的选项对象，它允许你为你的 API 调用设置更多选项。
这些选项对象与上面列出的方法的选项对象完全对应。
你也可以在你的代码编辑器中使用自动完成来查看所有可用的选项，或者查看 `Api` 类的 [所有方法](https://deno.land/x/grammy/mod.ts?s=Api)。
本页的其余部分展示了一些相关示例。

同时，请看 [下一节](./context)，以了解监听器的上下文对象如何使发送消息变得轻而易举！

## 发送带回复的信息

你可以使用 Telegram 的回复功能，使用 `reply_to_message_id` 指定要回复的信息标识符。

```ts
bot.hears("ping", async (ctx) => {
  // `reply` 是同一聊天中 `sendMessage` 的别名（见下一节）。
  await ctx.reply("pong", {
    // `reply_to_message_id` 指定实际的回复哪一条信息。
    reply_to_message_id: ctx.msg.message_id,
  });
});
```

> 注意，只通过 `ctx.reply` 发送消息**并不**意味着你会自动回复任何东西。
> 相反，你应该为此指定 `reply_to_message_id` 。
> 函数 `ctx.reply` 只是 `ctx.api.sendMessage` 的一个别名，见 [下一节](./context#可用操作)。

## 发送格式化的信息

> 查看 Telegram 团队编写的 Telegram Bot API 参考中的[关于格式化选项的部分](https://core.telegram.org/bots/api#formatting-options)。

你可以通过 **加粗** 或 _斜体_ 文字，使用超链接以及其他来发送消息。
有两种方法可以实现这一点，如 [关于格式化选项的部分](https://core.telegram.org/bots/api#formatting-options) 所述，即 Markdown 和 HTML 。

### Markdown

> 查看 <https://core.telegram.org/bots/api#markdownv2-style>

发送你的信息时，在文本中加入 markdown，并指定 `parse_mode: "MarkdownV2"`。

```ts
await bot.api.sendMessage(
  12345,
  "*Hi\\!* _Welcome_ to [grammY](https://grammy.dev)\\.",
  { parse_mode: "MarkdownV2" },
);
```

### HTML

> 查看 <https://core.telegram.org/bots/api#html-style>

发送你的信息，文本中含有 HTML 元素，并指定 `parse_mode: "HTML"`。

```ts
await bot.api.sendMessage(
  12345,
  '<b>Hi!</b> <i>Welcome</i> to <a href="https://grammy.dev">grammY</a>.',
  { parse_mode: "HTML" },
);
```

## 发送文件

文件处理在 [后面的章节](./files#发送文件) 中有更深入的解释。

## 强行回复

> 如果你的 bot 在群聊中以 [隐私模式](https://core.telegram.org/bots/features#privacy-mode) 运行，这应该会很有用。

当你发送消息时，你可以让用户的 Telegram 客户端自动指定该消息为回复。
这意味着，用户会自动回复你 bot 的消息（除非他们手动删除回复）。
因此，即使在群聊中以 [隐私模式](https://core.telegram.org/bots/features#privacy-mode) 运行，你的 bot 也会收到用户的信息。

你可以像这样强行回复：

```ts
bot.command("start", async (ctx) => {
  await ctx.reply("Hi！ 我只能收到明确回复我的信息！", {
    // 让 Telegram 客户端自动向用户显示回复界面。
    reply_markup: { force_reply: true },
  });
});
```
