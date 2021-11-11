---
prev: ./files.md
next: ./deployment-types.md
---

# 游戏

## 解释

Telegram 游戏是 Telegram 一个非常有意思，可以玩的很开心的功能。
那么你能在这上面做些什么呢？
答案是任何事情，通过这个功能，任何你写的 HTML5 游戏都可以上传到 Telegram。
（是的，这意味着你必须开发一个基于 web 并且已经是网络公开的游戏，这之后你才能把这个游戏加入你的 bot。）

## 在你的 bot 中设置游戏通过 @BotFather


为了简单起见，我们假设到现在为止，您已经在上通过[@BotFather](https://t.me/BotFather)设置了一个 bot 和一个与您的 bot 关联的游戏
如果还没有，查看这篇[文章](https://core.telegram.org/bots/games)在 Telegram 小组中。


> 注意：我们将只学习 bot 端上传开发。
> 开发游戏将完全取决于开发者。
> 我们这里做的是把一个在网上开发的 HTML5 游戏链接到 bot 上。

## 通过 Bot 发送游戏

在 grammY，我们可以通过 `replyWithGame` 发送游戏，该方法将用 BotFather 创建的游戏名称作为参数。
或者，我们可以使用 `api.sendGame` 方法(grammY 官方提供[Bot API](https://core.telegram.org/bots/api))。
你使用 `api.sendGame` 的一个优势是你可以明确规定你发送游戏给他人时的 `chat.id`。  

1.  发送游戏通过 `replyWithGame`

   ```ts
   // 我们会使用命令行来调用游戏回调方法
   bot.command("start", async (ctx) => {
     // 把你在 BotFather 创建的游戏的名字作为参数，例如 "my_game"
     await ctx.replyWithGame("my_game");
   });
   ```

2.  通过 `api.sendGame` 发送游戏

   ```ts
   bot.command("start", async (ctx) => {
     // 你可以通过 `ctx.from.id` 拿到用户的聊天室 ID 来发送你的游戏
     // 他会给你用户的聊天室 ID 来调用命令行
     const chatId = ctx.from.id;
     await ctx.api.sendGame(chatid, "my_game");
   });
   ```

> 你也可以在游戏中明确规定一个规范[内置键盘](/zh/plugins/keyboard.md#inline-keyboards)来显示特殊按键。
> 默认情况下，它将与一个名为 `Play my_game` 的参数一起发送，其中 _my_game_ 是游戏的名称。

```ts

// 定义新的内联按键，你可以写任何文字在按钮上，但是要保证第一个按钮是开始游戏。
const keyboard = new InlineKeyboard().game("Start my_game");

// 注意：我们使用 game() 和正常使用 url() 或者 text() 的内联键盘不同。
// 通过 replyWithGame 方法
await ctx.replyWithGame("my_game", { reply_markup: keyboard });

// 通过 api.sendGame 方法
await ctx.api.sendGame(chatid, "my_game", { reply_markup: keyboard });
```

## 监听游戏按键的回调函数

为了在按下按钮时为按钮提供逻辑，并将用户重定向到我们的游戏和更多，可以
监听 `callback_query:game_short_name` 事件来设置游戏中的按键按下时的回调函数。

需要做的是：

```ts
// 传递你的游戏 url，但是这必须是一个已经上线的游戏 url

bot.on("callback_query:game_short_name", async (ctx) => {
  await ctx.answerCallbackQuery({ url: "your_game_url" });
});
```

---

### 最终的代码应该类似于下例
```ts
bot.on("callback_query:game_short_name", async (ctx) => {
  await ctx.answerCallbackQuery({ url: "your_game_url" });
});

bot.command("start", (ctx) => {
  await ctx.replyWithGame("my_game", {
    reply_markup: keyboard,
    //
    // 或者你可以根据你的需要使用 api
  });
});
```

> 在上线前记得添加适当的[错误处理器](/zh/guide/errors.md) 到你的 bot 中。

我们可能会在未来拓展这篇文章，但是现在的内容已经足够你在 Telegram 上传游戏。
玩的开心！ :space_invader:

