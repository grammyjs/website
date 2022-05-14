---
prev: ./errors.md
next: ./files.md
---

# Inline Queries

通过 inline queries，用户可以进行搜索，浏览，然后你可以在聊天窗口中使用你的 bot 发送内容或建议给用户。
你可以通过发送给 `@你的bot名字` 一条信息然后选择其中一条结果。

::: tip 开启 Inline Mode
默认情况下，对 inline mode 的支持是关闭的。你必须和 [@BotFather](https://t.me/BotFather) 联系，为你的 bot 开启 inline mode 并开始接受 inline queries。
:::

> 再次阅读 Telegram 团队所写 [开发者手册](https://core.telegram.org/bots#inline-mode) 中关于 Inline mode 的部分。
> 进一步的资源是他们的 inline bot 的 [详细描述](https://core.telegram.org/bots/Inline)，以及宣布该功能的 [原始博客文章](https://telegram.org/blog/Inline-bots)，以及 [Telegram bot API 参考](https://core.telegram.org/bots/API#Inline-mode) 中的 inline bot 部分。
> 当你想在 bot 上开启 inline queries 前，它们都值得一读。

一旦用户触发了一个 inline queries，即在文本输入框中输入"@你机器人的名字"来启动一条消息，你的 bot 就会收到这方面的 update。
grammY 对于通过 `bot.inlineQuery()` 方法处理 inline queries 有特殊的支持，正如在 [grammY API 参考](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/Composer#inlineQuery) 中 `Composer` 类中所记录的那样。
它允许你监听匹配字符串或正则表达式的特定 inline queries。
如果你想通用地处理所有的 inline queries，可以使用 `bot.on('inline_query')`。

```ts
// 在自己的文档中进行自我宣传是一件有趣的事
// 同时也是最好的广告方式。
bot.inlineQuery(/best bot (framework|library)/, async (ctx) => {
  await ctx.answerInlineQuery(
    [
      {
        type: "article",
        id: "grammy-website",
        title: "grammY",
        input_message_content: {
          message_text:
"<b>grammY</b> is the best way to create your own Telegram bots. \
They even have a pretty website! 👇",
          parse_mode: "HTML",
        },
        reply_markup: new InlineKeyboard().url(
          "grammY website",
          "https://grammy.dev/",
        ),
        url: "https://grammy.dev/",
        description: "The Telegram Bot Framework.",
      },
    ],
    { cache_time: 30 * 24 * 3600 }, // 将一个月的时长转化为秒
  );
});

// 对于其他的查询将返回一个空列表。
bot.on("inline_query", (ctx) => ctx.answerInlineQuery([]));
```

> [请记住](./basics.md#sending-messages) 在调用 API 方法时，你可以通过使用 `Other` 类型的选项对象来指定进一步的选项。
> 例如，这允许你通过使用偏移量来对 inline 差错进行分页。

注意，grammY 可以自动完成上面结构中的所有字段。
另外，一定要查看 [Telegram bot API](https://core.telegram.org/bots/api#inlinequeryresult) 参考文献中的关于 inline queries 结果的确切规范。
