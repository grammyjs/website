---
prev: ./filter-queries.md
next: ./middleware.md
---

# Commands

Commands 是 Telegram 信息中的特殊对象，作为 bot 的指令存在。

## 使用方法

> 重温 Telegram 团队编写的 [Introduction for Developers](https://core.telegram.org/bots#commands)中的 Commands 部分。

grammY 为命令（例如 `/start` 和 `/help` ）提供了特殊处理。
你可以通过 `bot.command()` 直接为某些命令注册监听器。

```ts
// 响应 /start 命令。
bot.command("start" /* , ... */);
// 响应 /help 命令。
bot.command("help" /* , ... */);
// 响应 /a, /b, /c 和 /d 命令。
bot.command(["a", "b", "c", "d"] /* , ... */);
```

请注意，只有那些在消息开头的命令才会被处理，所以如果一个用户发送 `请不要向那个 bot 发送 /start ！`，那么你的监听器将不会被调用，即使 `/start` 命令 _是_ 包含在消息中。

Telegram 支持向 bot 发送目标命令，即以 `@your_bot_name` 结尾的命令。
grammY 会为你自动处理这个问题，所以 `bot.command("start")` 将匹配带有 `/start` 和带有 `/start@your_bot_name` 的命令信息。
你可以通过指定 `bot.command("start@your_bot_name")` 来选择只匹配目标命令。

::: tip 向用户推荐你的命令
你可以这样调用函数：

```ts
await bot.api.setMyCommands([
  { command: "start", description: "Start the bot" },
  { command: "help", description: "Show help text" },
  { command: "settings", description: "Open settings" },
]);
```

以使 Telegram 客户端在文本输入栏中显示建议的命令列表。

或者，你也可以通过与 [@BotFather](https://t.me/BotFather) 交谈来设置这些信息。
:::

## 参数

用户可以将**参数**与他们的命令一起发送。
你可以通过 `ctx.match` 访问参数字符串。

```ts
bot.command("add", (ctx) => {
  // `item` 将被赋值为 `apple pie` ， 如果一个用户输入了 `/add apple pie`。
  const item = ctx.match;
});
```

注意，你总是可以通过 `ctx.msg.text` 访问整个消息的文本。

## 深度链接支持

> 重新温习 Telegram 团队的 [Introduction for Developers](https://core.telegram.org/bots#deep-linking) 中关于深度链接的部分。

当用户返回 `https://t.me/your_bot_name?start=payload` 时，他们的 `Telegram` 客户端将显示一个 `START` 按钮，点击后将 URL 参数中的字符串与信息一起发送，在这个例子中，消息文本将是 `start payload` 。
Telegram 客户端不会向用户显示 `payload`（他们只会在页面中看到 `start`）。但是，你的 bot 会收到它。
grammY 为你提取这个 `payload`，并在 `ctx.match` 下提供。
在我们的例子中，`ctx.match` 将包含字符串 `payload`。

如果你想建立一个推荐系统，或跟踪用户在哪里发现你的 bot ，那么深度链接是很有用的。
例如，你的 bot 可以发送一个带有 [inline-keyboards](/zh/plugins/keyboard.md#inline-keyboards) 按钮的 channel post。
该按钮包含一个类似上述的 URL，例如 `https://t.me/your_bot_name?start=awesome-channel-post-12345`。
当用户点击帖子下面的按钮时，他们的 Telegram 客户端将打开与你的 bot 的聊天，并显示上述的 START 按钮。
这样，你的 bot 可以识别用户来自哪里，以及他们点击了哪个特定频道帖子下的按钮。

当然，你也可以在其他任何地方嵌入这样的链接：在网络上、信息中、二维码中等等。
