# Inline 与自定义 Keyboards（内置）

你的 bot 可以发送一些按钮，可以 [显示在信息下面](#inline-keyboards)，也可以 [替换用户的键盘](#自定义-keyboards)。
它们分别被称为 _inline keyboards_ 和 _自定义 keyboards_。
如果你认为这很混乱，那是因为它的确很混乱。
谢谢 Telegram，使用的这种重叠的术语。

让我们试着理清一下：

| 术语                                     | 定义                                                                                               |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [**Inline Keyboard**](#inline-keyboards) | 显示在聊天消息下面的一组按钮。                                                                     |
| [**自定义 Keyboard**](#自定义-keyboards) | 代替用户的系统键盘显示的一组按钮。                                                                 |
| **Inline keyboard button**               | inline keyboard 中的一个按钮，按下后会发送一个用户不可见的回调查询，有时候被称为 _inline button_。 |
| **自定义 Keyboard button**               | keyboard 中的一个按钮，按下后会发送带有其标签的文本信息，有时候被称为 _keyboard button_。          |
| **`InlineKeyboard`**                     | grammY 中用来创建 inline keyboards 的类。                                                          |
| **`Keyboard`**                           | grammY 中用来创建自定义 keyboards 的类。                                                           |

> 请注意，自定义 keyboard 按钮和 inline keyboard 按钮也可以有其他功能，例如请求用户的位置，打开网站等等。
> 为了简洁起见，我们省略了这一点。

不能在同一消息中同时指定了自定义 keyboard 和 inline keyboard。
两者是互斥的。
此外，发送的回复类型不能通过编辑消息更改。
例如，不能先发送一个自定义 keyboard，然后编辑消息使用 inline keyboard。

## Inline Keyboards

> 重温 Telegram 团队编写的 [Telegram Bot 特性](https://core.telegram.org/bots/features#inline-keyboards) 中的 inline keyboard 部分。

grammY 有一个简单且直观的方式来构建 inline keyboard，让你的 bot 可以和信息一起发送 inline keyboard。
它提供了一个叫做 `InlineKeyboard` 的类。

> 通过调用 `switchInline`、`switchInlineCurrent` 和 `switchInlineChosen` 添加的按钮都可以启动 Inline Queries。
> 你也可以查看 [Inline Queries](../guide/inline-queries.md) 的部分，来了解更多关于它们是怎样工作的。

### 构建一个 Inline Keyboard

你可以通过创建 `InlineKeyboard` 类的新实例，然后使用 `.text()` 和其他方法向其中添加你喜欢的按钮，来构建一个 inline keyboard。

以下是一个示例：

![示例](/images/inline-keyboard-example.webp)

```ts
const inlineKeyboard = new InlineKeyboard()
  .text("« 1", "first")
  .text("‹ 3", "prev")
  .text("· 4 ·", "stay")
  .text("5 ›", "next")
  .text("31 »", "last");
```

如果你想开始新的一行按钮，请调用 `.row()` 方法。
你还可以使用其他方法，比如 `.url()` 让用户的客户端打开特定的 URL 或执行其他酷炫的操作。
请务必查看 `InlineKeyboard` 类上的 [所有方法](https://deno.land/x/grammy/mod.ts?s=InlineKeyboard#Methods)。

如果你已经有一个字符串数组，并希望将其转换为 inline keyboard，你可以使用第二种方式来构建 inline keyboard 实例。
`InlineKeyboard` 类具有像 `InlineKeyboard.text` 这样的静态方法，可以用来创建按钮对象。
然后，你可以使用 `InlineKeyboard.from` 从按钮对象数组创建 inline keyboard 实例。

这样，你可以以一种实用的方式构建上述的 inline keyboard。

```ts
const labelDataPairs = [
  ["« 1", "first"],
  ["‹ 3", "prev"],
  ["· 4 ·", "stay"],
  ["5 ›", "next"],
  ["31 »", "last"],
];
const buttonRow = labelDataPairs
  .map(([label, data]) => InlineKeyboard.text(label, data));
const keyboard = InlineKeyboard.from([buttonRow]);
```

### 发送一个 Inline Keyboard

不论你是用 `bot.api.sendMessage` 、 `ctx.api.sendMessage` 还是 `ctx.reply`，你都可以直接发送 inline keyboard：

```ts
// 和消息一起发送 inline keyboard。
await ctx.reply(text, {
  reply_markup: inlineKeyboard,
});
```

当然，除了文本消息以外，其他发送消息的方法都支持相同的选项，即 [Telegram Bot API 参考](https://core.telegram.org/bots/api) 中所规定的。
比如说，你可以通过调用 `editMessageReplyMarkup` 来编辑一个 keyboard，并将新的 `InlineKeyboard` 实例作为 `reply_markup` 来传递。
指定一个空的 inline keyboard 可以移除信息下方的所有按钮。

### 响应点击

::: tip 菜单插件
keyboard 插件让你可以获取到 Telegram 发送的 update 对象。
然而，这种方式可能会很麻烦。
如果你想要一个更高级的实现，请查看 [菜单插件](./menu.md)。
它使得创建交互式菜单更加简单。
:::

每个 `text` 按钮都会附加一个字符串作为回调数据。
如果你没有附加回调数据，grammY 将会使用按钮的文本来作为回调数据。

一旦用户点击了一个 `text` 按钮，你的 bot 将会收到一个包含相应按钮的回调数据的 update。
你可以通过 `bot.callbackQuery()` 来监听回调数据。

```ts
// 构建一个 keyboard。
const inlineKeyboard = new InlineKeyboard().text("click", "click-payload");

// 和消息一起发送 keyboard。
bot.command("start", async (ctx) => {
  await ctx.reply("Curious? Click me!", { reply_markup: inlineKeyboard });
});

// 等待具有特定回调数据的点击事件。
bot.callbackQuery("click-payload", async (ctx) => {
  await ctx.answerCallbackQuery({
    text: "You were curious, indeed!",
  });
});
```

::: tip 响应所有回调查询
`bot.callbackQuery()` 可以用于监听特定按钮的点击事件。
你也可以使用 `bot.on("callback_query:data")` 来监听所有按钮的点击事件。

```ts
bot.callbackQuery("click-payload" /* , ... */);

bot.on("callback_query:data", async (ctx) => {
  console.log("Unknown button event with payload", ctx.callbackQuery.data);
  await ctx.answerCallbackQuery(); // 移除加载动画
});
```

在最后定义 `bot.on("callback_query:data")` 来处理那些你没有设置监听的按钮的回调查询。
不然的话，当用户按下一个你的 bot 没有处理的回调查询的按钮时，一些客户端可能会显示长达 1 分钟的加载动画。
:::

## 自定义 Keyboards

首先：自定义 keyboards 通常叫做 keyboards，有时也叫做回复 keyboards，甚至 Telegram 自己的文档在这方面也不一致。
作为一个简单的规则，当它从上下文中没有绝对明显的特征，而且不叫 inline keyboard 的时候，它可能就是一个自定义 keyboards。
这是指用一组你可以定义的按钮来替换系统键盘的方法。

> 重温 Telegram 团队编写的 [Telegram Bot 特性](https://core.telegram.org/bots/features#keyboards) 中的 keyboard 部分。

grammY 有一个简单且直观的方式来构建回复 keyboard，让你的 bot 可以用它来替换用户的键盘。
它提供了一个叫做 `Keyboard` 的类。

一旦用户点击了一个 `text` 按钮，你的 bot 就会收到作为纯文本信息发送的消息。
请记住，你可以通过 `bot.on("message:text")` 或者 `bot.hears()` 列出文本信息。

### 构建一个自定义 Keyboard

你可以通过创建 `Keyboard` 类的新实例，并通过 `.text()` 等方法向其中添加按钮来构建自定义 keyboard。
调用 `.row()` 可以开始新的一行按钮。

以下是一个示例：

![示例](/images/keyboard-example.webp)

```ts
const keyboard = new Keyboard()
  .text("Yes, they certainly are").row()
  .text("I'm not quite sure").row()
  .text("No. 😈")
  .resized();
```

你还可以发送更强大的按钮，请求用户的电话号码或位置，或执行其他酷炫的操作。
请务必查看 `Keyboard` 类上的 [所有方法](https://deno.land/x/grammy/mod.ts?s=Keyboard#Methods)。

如果你已经有一个字符串数组，并希望将其转换为 keyboard，你可以使用第二种方式来构建 keyboard 实例。
`Keyboard` 类具有像 `Keyboard.text` 这样的静态方法，可以用来创建按钮对象。
然后，你可以使用 `Keyboard.from` 从按钮对象数组创建 keyboard 实例。

这样，你可以以一种实用的方式构建上述的 inline keyboard。

```ts
const labels = [
  "Yes, they certainly are",
  "I'm not quite sure",
  "No. 😈",
];
const buttonRows = labels
  .map((label) => Keyboard.text(label))
  .map((button) => Keyboard.row(button));
const keyboard = Keyboard.from(buttonRows, { resize_keyboard: true });
```

### 发送一个自定义 Keyboard

不论你是用 `bot.api.sendMessage`，`ctx.api.sendMessage` 还是 `ctx.reply`，你都可以直接发送自定义 keyboard：

```ts
// 和消息一起发送 keyboard。
await ctx.reply(text, {
  reply_markup: keyboard,
});
```

当然，除了文本消息以外，其他发送消息的方法都支持相同的选项，即 [Telegram Bot API 参考](https://core.telegram.org/bots/api) 中所规定的。

你也可以通过调用特殊方法给你的 keyboard 添加一个或者多个属性。
它们不会添加任何新的按钮，而是定义 keyboard 的行为。
在上面的示例中，我们已经看到了 `resized`，下面是一些你可以做的其他事情。

#### 永久 Keyboards

默认情况下，用户会看到一个图标，允许他们显示或隐藏你的机器人设置的自定义 keyboard。

如果你希望在隐藏常规系统 keyboard 时始终显示自定义 keyboard，则可以调用 `persistent`。
这样，用户将始终看到自定义 keyboard 或系统 keyboard。

```ts
new Keyboard()
  .text("Skip")
  .persistent();
```

#### 调整自定义 Keyboard 大小

如果你想让键盘根据其包含的按钮调整大小，你可以调用 `resized`。
这可以让自定义 keyboard 变得更小。
（通常情况下，keyboard 与应用程序的标准键盘的大小一致。）

```ts
new Keyboard()
  .text("Yes").row()
  .text("No")
  .resized();
```

不管你是最开始调用 `resized`，还是最后调用，还是在某个地方的两者之间调用，都没有关系。
结果都是一样的。

#### 一次性自定义 Keyboards

如果你想在按钮第一次被按下后立即隐藏自定义 keyboard，你可以调用 `oneTime`。

```ts
new Keyboard()
  .text("Yes").row()
  .text("No")
  .oneTime();
```

不管你是最开始调用 `oneTime`，还是最后调用，还是在某个地方的两者之间调用，都没有关系。
结果都是一样的。

#### 输入栏占位符

如果你想在自定义 keyboard 可见时，在输入栏中显示一个占位符，你可以调用 `placeholder`。

```ts
new Keyboard()
  .text("Yes").row()
  .text("No")
  .placeholder("Decide now!");
```

不管你是最开始调用 `placeholder`，还是最后调用，还是在某个地方的两者之间调用，都没有关系。
结果都是一样的。

#### 选择性地发送自定义 Keyboard

如果你想只向消息对象的文本中提到的 @ 的用户显示自定义 keyboard，你可以调用 `selected`，如果你的消息是 [回复](../guide/basics.md#发送带回复的信息)，则向原始消息的发送者显示。

```ts
new Keyboard()
  .text("Yes").row()
  .text("No")
  .selected();
```

不管你是最开始调用 `selected`，还是最后调用，还是在某个地方的两者之间调用，都没有关系。
结果都是一样的。

### 响应点击

正如前面所说的，自定义 keyboards 所做的就是发送普通的文本消息。
你的 bot 不能区分普通文本消息和通过点击按钮发送的文本消息。

此外，按钮将总是准确地发送它们上面所写的文本。
Telegram 不允许你创建显示一个文本，但发送另一个文本的按钮。
如果你需要这样做，你应该使用 [Inline Keyboard](#inline-keyboards) 来代替。

为了处理特定按钮的点击，你可以使用 `bot.hears`， 其文本与你放在按钮上的文本一样。
如果你想一次性处理所有按钮的点击，你可以使用 `bot.on("message:text")`，并且检查 `ctx.msg.text` 来确定哪个按钮被点击了，或者是否发送了一个普通的文本消息。

### 移除 Keyboard

除非你指定 `one_time_keyboard`，像 [上面](#一次性自定义-keyboards) 描述的那样。不然的话，自定义 keyboard 会一直保持打开状态（但用户可以将其最小化）。

你只能在聊天中发送新信息时移除自定义 keyboard，就像你只能通过发送消息指定新 keyboard。
将 `{ remove_keyboard: true }` 像下面这样作为 `reply_markup` 传入：

```ts
await ctx.reply(text, {
  reply_markup: { remove_keyboard: true },
});
```

在 `remove_keyboard` 旁边，你可以再次设置 `selective: true`，以便只为选定的用户移除自定义 keyboard。
它的作用类似于 [选择性地发送自定义 Keyboard](#选择性地发送自定义-keyboard)

## 插件概述

这个插件是内置在 grammY 的核心中的。
你不需要安装任何东西来使用它。
只需要导入 grammY 即可。

并且，这个插件的文档和 API 参考都与核心包一致。
