# Keyboards 与 Inline Keyboards（内置）

你的 bot 可以发送一些按钮，可以 [显示在信息下面](#inline-keyboards)，也可以 [替换用户的键盘](#keyboards)。

## Inline Keyboards

> 重温 Telegram 团队编写的 [Introduction for Developers](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating) 中的 inline keyboard 部分。

grammY 有一个简单且直观的方式来构建 inline keyboard，让你的 bot 可以和信息一起发送 inline keyboard。
它提供了一个叫做 `InlineKeyboard` 的类。

> `switchInline` 和 `switchInlineCurrent` 按钮都可以启动内联查询。
> 你也可以查看 [内联查询](/zh/guide/inline-queries.md) 的部分，来了解更多关于它们是怎样工作的。

### 构建一个 Inline Keyboard

这里有三个例子来演示如何构建带有 `text` 按钮的 inline keyboard。

你也可以使用其他方法，比如 `url`，让 Telegram 客户端打开一个 URL，或者 [grammY API Reference](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#InlineKeyboard) 和 [Telegram Bot API Reference](https://core.telegram.org/bots/api#inlinekeyboardbutton) 中列出的提供给 `InlineKeyboard` 方法。

#### 示例 1

构建分页导航按钮：

##### 代码

```ts
const inlineKeyboard = new InlineKeyboard()
  .text("« 1", "first")
  .text("‹ 3", "prev")
  .text("· 4 ·", "stay")
  .text("5 ›", "next")
  .text("31 »", "last");
```

##### 结果

![示例 1](https://core.telegram.org/file/811140217/1/NkRCCLeQZVc/17a804837802700ea4)

#### 示例 2

构建一个带有分享按钮的 inline keyboard：

##### 代码

```ts
const inlineKeyboard = new InlineKeyboard()
  .text("Get random music", "random").row()
  .switchInline("Send music to friends");
```

##### 结果

![示例 2](https://core.telegram.org/file/811140659/1/RRJyulbtLBY/ea6163411c7eb4f4dc)

#### 示例 3

构建 URL 按钮：

##### 代码

```ts
const inlineKeyboard = new InlineKeyboard().url(
  "Read on TechCrunch",
  "https://techcrunch.com/2016/04/11/this-is-the-htc-10/",
);
```

##### 结果

![示例 3](https://core.telegram.org/file/811140999/1/2JSoUVlWKa0/4fad2e2743dc8eda04)

### 发送一个 Inline Keyboard

不论你是用 `bot.api.sendMessage` 、 `ctx.api.sendMessage` 还是 `ctx.reply`，你都可以直接发送 inline keyboard：

```ts
// 和消息一起发送 inline keyboard：
await ctx.reply(text, {
  reply_markup: inlineKeyboard,
});
```

当然，除了文本消息以外，其他发送消息的方法都支持相同的选项，即 [Telegram Bot API Reference](https://core.telegram.org/bots/api) 中所规定的。
比如说，你可以通过调用 `editMessageReplyMarkup` 来编辑一个按键，并将新的 `InlineKeyboard` 实例作为 `reply_markup` 来传递。
指定一个空的 inline keyboard 可以移除信息下方的所有按钮。

### 响应点击

每个 `text` 按钮都会附加一个字符串作为回调数据。
如果你没有附加回调数据，grammY 将会使用按钮的文本来作为回调数据。

一旦用户点击了一个文本按钮，你的 bot 将会收到一个包含相应按钮的回调数据的 update。
你可以通过 `bot.callbackQuery()` 来监听回调数据。

```ts
// 构建一个 keyboard
const inlineKeyboard = new InlineKeyboard().text("click", "click-payload");

// 和消息一起发送 keyboard
bot.command("start", async (ctx) => {
  await ctx.reply("Curious? Click me!", { reply_markup: inlineKeyboard });
});

// 等待具有特定回调数据的点击事件
bot.callbackQuery("click-payload", async (ctx) => {
  await ctx.answerCallbackQuery({
    text: "You were curious, indeed!",
  });
});
```

::: tip 响应所有回调查询
`bot.callbackQuery()` 可以用于监听特定按钮的点击事件。
你也可以使用 `bot.on('callback_query:data')` 来监听所有按钮的点击事件。

```ts
bot.callbackQuery("click-payload" /* ... */);

bot.on("callback_query:data", async (ctx) => {
  console.log("Unknown button event with payload", ctx.callbackQuery.data);
  await ctx.answerCallbackQuery(); // 移除加载动画
});
```

在最后定义 `bot.on('callback_query:data')` 来处理那些你没有设置监听的按钮的回调查询。
不然的话，当用户按下一个你的 bot 没有处理的回调查询的按钮时，一些客户端可能会显示长达 1 分钟的加载动画。
:::

## Keyboards

> 重温 Telegram 团队编写的 [Introduction for Developers](https://core.telegram.org/bots#keyboards) 中的 keyboard 部分。

grammY 有一个简单且直观的方式来构建回复 keyboard，让你的 bot 可以用它来替换用户的键盘。
它提供了一个叫做 `Keyboard` 的类。

一旦用户点击了一个文本按钮，你的 bot 就会收到作为纯文本信息发送的消息。
请记住，你可以通过 `bot.on('message:text')` 列出文本信息。

### 构建一个 Keyboard

这里有三个例子来演示如何构建带有 `text` 按钮的 keyboard。

你也可以使用 `requestContact` 来请求电话号码，使用 `requestLocation` 来请求位置，使用 `requestPoll` 来请求投票。

#### 样例 1

构建一行三个按钮：

##### 代码

```ts
const keyboard = new Keyboard()
  .text("Yes, they certainly are").row()
  .text("I'm not quite sure").row()
  .text("No. 😈");
```

##### 结果

![样例 1](https://core.telegram.org/file/811140184/1/5YJxx-rostA/ad3f74094485fb97bd)

#### 样例 2

构建一个计算器的 keyboard：

##### 代码

```ts
const keyboard = new Keyboard()
  .text("7").text("8").text("9").text("*").row()
  .text("4").text("5").text("6").text("/").row()
  .text("1").text("2").text("3").text("-").row()
  .text("0").text(".").text("=").text("+");
```

##### 结果

![样例 2](https://core.telegram.org/file/811140880/1/jS-YSVkDCNQ/b397dfcefc6da0dc70)

#### 样例 3

构建一个网格中的四个按钮：

##### 代码

```ts
const keyboard = new Keyboard()
  .text("A").text("B").row()
  .text("C").text("D");
```

##### 结果

![样例 3](https://core.telegram.org/file/811140733/2/KoysqJKQ_kI/a1ee46a377796c3961)

### 发送一个 Keyboard

不论你是用 `bot.api.sendMessage` 、 `ctx.api.sendMessage` 还是 `ctx.reply`，你都可以直接发送 keyboard：

```ts
// 和消息一起发送 keyboard：
await ctx.reply(text, {
  reply_markup: keyboard,
});
```

当然，除了文本消息以外，其他发送消息的方法都支持相同的选项，即 [Telegram Bot API Reference](https://core.telegram.org/bots/api) 中所规定的。

如果你想在你的信息中指定更多选项，你可能需要创建你自己的 `reply_markup` 对象。
在这种情况下，你必须在传递你的自定义对象时使用 `keyboard.build()`。

#### 调整 Keyboard 大小

如果你想让键盘根据其包含的按钮调整大小，你可以指定 `resize_keyboard` 选项。
这可以让 keyboard 变得更小。
（通常情况下，keyboard 与应用程序的标准键盘的大小一致。）

```ts
await ctx.reply(text, {
  reply_markup: {
    resize_keyboard: true,
    keyboard: keyboard.build(),
  },
});
```

#### 一次性 Keyboards

如果你想在按钮第一次被按下后立即隐藏 keyboard，你可以指定 `one_time_keyboard` 选项。

```ts
await ctx.reply(text, {
  reply_markup: {
    one_time_keyboard: true,
    keyboard: keyboard.build(),
  },
});
```

#### 输入栏占位符

如果你想在 keyboard 可见时，在输入栏中显示一个占位符，你可以指定 `input_field_placehoder` 选项。

```ts
const keyboard = new Keyboard().text("LEFT").text("RIGHT");

await ctx.reply(text, {
  reply_markup: {
    input_field_placehoder: "Send LEFT or RIGHT",
    keyboard: keyboard.build(),
  },
});
```

#### 选择性地发送 Keyboard

如果你想只向消息对象的文本中提到的 @ 的用户显示键盘，你可以指定 `selective` 选项，如果你的消息是回复，则向原始消息的发送者显示。

```ts
await ctx.reply(text, {
  reply_markup: {
    selective: true,
    keyboard: keyboard.build(),
  },
});
```

### 移除 Keyboard

除非你指定 `one_time_keyboard`，像 [上面](#一次性-keyboards) 描述的那样。不然的话，keyboard 会一直保持打开状态（但用户可以将其最小化）。

你只能在聊天中发送新信息时移除 keyboard，就像你只能通过发送消息指定新 keyboard。
将 `{ remove_keyboard: true }` 像下面这样作为 `reply_markup` 传入：

```ts
await ctx.reply(text, {
  reply_markup: { remove_keyboard: true },
});
```

在 `remove_keyboard` 旁边，你可以再次设置 `selective: true`，以便只为选定的用户移除 keyboard。
它的作用类似于 [选择性地发送 Keyboard](#选择性地发送-keyboard)
