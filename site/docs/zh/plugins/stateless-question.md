# 无状态问题 (`stateless-question`)

> 向隐私模式下的 Telegram 用户创建无状态问题

你想在 [启用 Telegrams 隐私模式（默认）](https://core.telegram.org/bots/features#privacy-mode) 的情况下，保护用户的隐私，向用户发送他们所使用的语言的问题，并且不保存用户当前状态？

这个插件想要解决这个问题。

基本思路是在发送你的问题时，在结尾处添加一个 [特殊文本](https://en.wikipedia.org/wiki/Zero-width_non-joiner)。
这个文本对用户来说是不可见的，但对你的 bot 来说仍然可见。
当用户回复消息时，会检查这个消息。
如果它在结尾处含有这种特殊的文本，说明这条回复是对这个问题的回答。
这样，你就可以像有翻译时那样，为同样的问题准备多个不同的特殊文本。
你只需要确保 `uniqueIdentifier` 在你的 bot 中是唯一的。

## 使用方法

```ts
import { StatelessQuestion } from "@grammyjs/stateless-question";

const bot = new Bot(token);

const unicornQuestion = new StatelessQuestion("unicorns", (ctx) => {
  console.log("User thinks unicorns are doing:", ctx.message);
});

// 不要忘记使用中间件。
bot.use(unicornQuestion.middleware());

bot.command("rainbows", async (ctx) => {
  let text;
  if (ctx.session.language === "de") {
    text = "Was machen Einhörner?";
  } else {
    text = "What are unicorns doing?";
  }

  return unicornQuestion.replyWithMarkdown(ctx, text);
});

// 或者手动发送你的问题（请确保使用 parse_mode 和 force_reply！）。
bot.command("unicorn", async (ctx) => {
  await ctx.replyWithMarkdown(
    "What are unicorns doing?" + unicornQuestion.messageSuffixMarkdown(),
    { parse_mode: "Markdown", reply_markup: { force_reply: true } },
  );
});
bot.command("unicorn", async (ctx) => {
  await ctx.replyWithHTML(
    "What are unicorns doing?" + unicornQuestion.messageSuffixHTML(),
    { parse_mode: "HTML", reply_markup: { force_reply: true } },
  );
});
```

更多信息请查看 [插件仓库 README](https://github.com/grammyjs/stateless-question) 。

## 插件概述

- 名字：`stateless-question`
- 源码：<https://github.com/grammyjs/stateless-question>
