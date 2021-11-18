---
prev: ./files.md
next: ./deployment-types.md
---

# 游戏

## 介绍

Telegram 游戏是一个非常有趣的功能，很好玩。
你能用它做什么？
答案是任何东西，你可以提供给用户任何你已经开发的 HTML5 游戏，在 Telegram 上提供与功能相应的帮助文档。
（是的，这意味着你将不得不开发一个以真正的网站为基础的游戏，它应当可以在互联网上公开访问，这样才可以集成到 Telegram bot。）

## 通过 @BotFather 给你的 bot 设置游戏

简单起见, 假设你已经通过 [@BotFather](https://t.me/BotFather) 给你的 bot 设置了一个游戏。
如果你还没有准备好这个, 查看这篇来自 Telegram 团队的 [文章](https://core.telegram.org/bots/games)。

> 注意： 我们将只学习与 bot 开发相关的内容。
> 开发什么游戏完全取决于开发者。
> 我们所需要的只是一个网络托管的 html5 游戏链接。

## 通过 bot 发送游戏

我们可以通过 `replyWithGame` 方法在 grammY 发送游戏，该方法以你用 BotFather 创建的游戏的名称作为参数。
或者，我们也可以使用 `api.sendGame` 方法（grammY 提供了所有官方的 [Bot API](https://core.telegram.org/bots/api)方法）。
使用 `api.sendGame` 方法的一个优点是，您可以指定要将其发送给特定用户的 `chat.id`。

1. 使用 `replyWithGame` 发送信息

   ```ts
   // 我们将使用 start 命令来调用游戏回复方法
   bot.command("start", async (ctx) => {
     // 传递在 BotFather 中创建的游戏的名称，例如 “my_game”
     await ctx.replyWithGame("my_game");
   });
   ```

2. 使用 `api.sendGame` 发送消息

   ```ts
   bot.command("start", async (ctx) => {
     // 你可以通过 `ctx.from.id` 获得用户发送游戏的聊天标识符
     // 它提供了调用 start 命令的用户的聊天标识符。
     const chatId = ctx.from.id;
     await ctx.api.sendGame(chatid, "my_game");
   });
   ```

> 你也可以为你的游戏按钮自定义一个 [inline keyboard](/zh/plugins/keyboard.md#inline-keyboards)。
> 默认情况下，发送时会有一个名为 `Play my_game` 的按钮，其中 my_game 是你游戏的名称。

```ts
// 定义一个新的 inline keyboard 。您可以编写任何要显示的文本
// 在按钮上，但要确定第一个按钮为
// 开始游戏按钮！

const keyboard = new InlineKeyboard().game("Start my_game");

// 注意，我们使用的 game() 不同于普通的 inline keyboard
// 在我们使用 url() 或 text() 的时候

// 使用 replyWithGame 方法
await ctx.replyWithGame("my_game", { reply_markup: keyboard });

// 使用 api.sendGame 方法
await ctx.api.sendGame(chatid, "my_game", { reply_markup: keyboard });
```

## 监听我们游戏按钮的回调

为了在按下按钮时为其提供逻辑，为了将用户重定向到我们的游戏等等，我们监听事件 `callback_query:game_short_name`，它将告知我们一个游戏按钮已按下的用户。
而我们所需要做的仅仅是：

```ts
// 在这里传递你的游戏网址，这个网址应该已经在网上托管了。

bot.on("callback_query:game_short_name", async (ctx) => {
  await ctx.answerCallbackQuery({ url: "your_game_url" });
});
```

---

### 我们最终的代码看起来像是这样

```ts
bot.on("callback_query:game_short_name", async (ctx) => {
  await ctx.answerCallbackQuery({ url: "your_game_url" });
});

bot.command("start", (ctx) => {
  await ctx.replyWithGame("my_game", {
    reply_markup: keyboard,
    // 或者你可以在这里根据你的需要
    // 使用 api 方法
  });
});
```

> 记得在 bot 启动前添加适合的 [错误捕获处理](/guide/errors.md)。

我们将在之后的进阶模块与 FAQ 模块扩展相关的知识。不过目前所描述的已经足够你在 Telegram 中开始游戏。
玩的开心！ :space_invader:
