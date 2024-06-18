---
prev: false
next: false
---

# 互动菜单 (`menu`)

轻松地创建一个互动菜单。

## 简介

一个 inline keyboard 是一条消息下面的按钮数组。
grammY 有一个 [内置插件](./keyboard#inline-keyboards) 可以创建基本的 inline keybaords。

这个菜单插件将这个想法更进一步，让你能够在聊天里创建精美的菜单。
它们可以有交互的按钮，多个页面之间的导航，以及更多。

这里是一个简单的例子，不言自明。

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { Menu } from "@grammyjs/menu";

// 创建一个 bot。
const bot = new Bot("");

// 创建一个简单的菜单。
const menu = new Menu("my-menu-identifier")
  .text("A", (ctx) => ctx.reply("You pressed A!")).row()
  .text("B", (ctx) => ctx.reply("You pressed B!"));

// 使其具有互动性。
bot.use(menu);

bot.command("start", async (ctx) => {
  // 发送菜单。
  await ctx.reply("Check out this menu:", { reply_markup: menu });
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { Menu } = require("@grammyjs/menu");

// 创建一个 bot。
const bot = new Bot("");

// 创建一个简单的菜单。
const menu = new Menu("my-menu-identifier")
  .text("A", (ctx) => ctx.reply("You pressed A!")).row()
  .text("B", (ctx) => ctx.reply("You pressed B!"));

// 使其具有互动性。
bot.use(menu);

bot.command("start", async (ctx) => {
  // 发送菜单。
  await ctx.reply("Check out this menu:", { reply_markup: menu });
});

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { Menu } from "https://deno.land/x/grammy_menu/mod.ts";

// 创建一个 bot。
const bot = new Bot("");

// 创建一个简单的菜单。
const menu = new Menu("my-menu-identifier")
  .text("A", (ctx) => ctx.reply("You pressed A!")).row()
  .text("B", (ctx) => ctx.reply("You pressed B!"));

// 使其具有互动性。
bot.use(menu);

bot.command("start", async (ctx) => {
  // 发送菜单。
  await ctx.reply("Check out this menu:", { reply_markup: menu });
});

bot.start();
```

:::

> 请确保在其他中间件之前安装所有菜单，特别是在使用回调查询数据的中间件之前。
> 另外，如果你对 `allowed_updates` 使用自定义配置，请记得加上 `callback_query` update。

当然，如果你使用 [自定义的上下文类型](../guide/context#定制你的上下文对象)，你也可以传递给 `Menu`。

```ts
const menu = new Menu<MyContext>("id");
```

## 添加按钮

菜单插件会像 [inline keyboard 插件](./keyboard#inline-keyboards) 一样布局你的键盘。
`InlineKeyboard` 类替换为 `Menu` 类。

下面是一个菜单的例子，它有四个按钮，按钮的布局是 1-2-1。

```ts
const menu = new Menu("movements")
  .text("^", (ctx) => ctx.reply("Forward!")).row()
  .text("<", (ctx) => ctx.reply("Left!"))
  .text(">", (ctx) => ctx.reply("Right!")).row()
  .text("v", (ctx) => ctx.reply("Backwards!"));
```

使用 `text` 来添加新的文本按钮。
你可以传递一个标签和一个处理函数。

使用 `row` 来结束当前行，并将所有后续按钮添加到新的一行。

还有许多可用的按钮类型，例如打开 URL。
请查看这个插件的 [API 参考](/ref/menu/menurange) 了解更多关于 `MenuRange`，以及 [Telegram Bot API 参考](https://core.telegram.org/bots/api#inlinekeyboardbutton) 了解更多关于 `InlineKeyboardButton`。

## 发送菜单

你必须先安装一个菜单，然后才能发送它。
这样它就可以互动了。

```ts
bot.use(menu);
```

你现在可以直接传递菜单作为 `reply_markup` 发送消息。

```ts
bot.command("menu", async (ctx) => {
  await ctx.reply("Here is your menu", { reply_markup: menu });
});
```

## 动态标签

当你在按钮上放置标签字符串时，你也可以传递一个函数 `(ctx: Context) => string` 来在获取按钮上的动态标签。
这个函数可能是也可能不是 `async` 的（即异步）。

```ts
// 创建一个带有用户名字的按钮，按下后会向他们问好。
const menu = new Menu("greet-me")
  .text(
    (ctx) => `Greet ${ctx.from?.first_name ?? "me"}!`, // 动态标签
    (ctx) => ctx.reply(`Hello ${ctx.from.first_name}!`), // 处理函数
  );
```

由这样的函数生成的字符串被称为 _动态字符串_。
动态字符串是诸如切换按钮的理想选择。

请注意，你必须在你的按钮发生变化时，更新菜单。
调用 `ctx.menu.update()` 来确保你的菜单会被重新渲染。

```ts
// 已启用通知的用户标识符集合。
const notifications = new Set<number>();

function toggleNotifications(id: number) {
  if (notifications.has(id)) notifications.delete(id);
  else notifications.add(id);
}

const menu = new Menu("toggle")
  .text(
    (ctx) => ctx.from && notifications.has(ctx.from.id) ? "🔔" : "🔕",
    (ctx) => {
      toggleNotifications(ctx.from.id);
      ctx.menu.update(); // 更新菜单！
    },
  );
```

::: tip 储存数据
上面的例子展示了如何使用菜单插件。
将用户设置储存在一个 `Set` 对象中并不是一个好主意，因为这样当你停止服务器时所有的数据都会丢失。

相反，如果你想储存数据，请考虑使用数据库或 [会话插件](./session)。
:::

## 更新或关闭菜单

当按钮处理函数被调用时，在 `ctx.menu` 上会有一些有用的函数。

如果你想重新渲染菜单，你可以调用 `ctx.menu.update()`。
这只会在你安装在你的菜单上的处理函数中生效。
当从其他中间件调用时，它将不会生效，因为它不能确定应该更新 _哪个_ 菜单。

```ts
const menu = new Menu("time", { onMenuOutdated: false })
  .text(
    () => new Date().toLocaleString(), // 按钮标签为当前时间
    (ctx) => ctx.menu.update(), // 点击按钮时更新时间
  );
```

> `onMenuOutdated` 的目的 [如下](#过时的菜单和指纹)。
> 你可以暂时忽略它。

你也可以通过编辑相应的消息来自动更新菜单。

```ts
const menu = new Menu("time")
  .text(
    "What's the time?",
    (ctx) => ctx.editMessageText("It is" + new Date().toLocaleString()),
  );
```

菜单将自动检测你想要编辑消息的文本，并利用这个机会来更新按钮。
因此，你可以通过自动更新菜单来避免显式调用 `ctx.menu.update()`。

调用 `ctx.menu.update()` 不会立即更新菜单。
相反，它只设置了一个标志并在中间件执行期间更新它。
这个叫做 _懒更新_。
如果你稍后编辑了消息本身，插件可以使用相同的 API 调用来更新按钮。
这是非常高效的，并且它确保了消息和 keyboard 同时被更新。

当然，如果你调用了 `ctx.menu.update()` 但是你没有编辑消息，菜单插件会在中间件执行完成之前自动更新按钮。

你可以使用 `ctx.menu.update({ immediate: true })` 来强制更新菜单。
请注意，`ctx.menu.update()` 将会返回一个 Promise，所以你需要使用 `await`！
使用 `immediate` 标志也可以用于所有你可以在 `ctx.menu` 上调用的操作。
这只在必要时使用。

如果你想关闭菜单，请调用 `ctx.menu.close()`。
同样，这也是懒惰地执行的。

## 菜单之间的导航

你可以很容易地创建多个页面，并且在它们之间导航。
每个页面都有自己的 `Menu` 实例。
`submenu` 按钮是一个让你导航到其他页面的按钮。
向后导航是通过 `back` 按钮完成的。

```ts
const main = new Menu("root-menu")
  .text("Welcome", (ctx) => ctx.reply("Hi!")).row()
  .submenu("Credits", "credits-menu");

const settings = new Menu("credits-menu")
  .text("Show Credits", (ctx) => ctx.reply("Powered by grammY"))
  .back("Go Back");
```

这两个按钮可以接受中间件处理函数，以便你可以响应导航事件。

你也可以使用 `ctx.menu.nav()` 来手动导航。
这个函数接受菜单标识字符串，并且将懒惰地执行导航。
类似地，向后导航通过 `ctx.menu.back()` 进行。

接下来，你需要将菜单实例连接起来，通过注册一个在另一个上。
将菜单注册到另一个菜单中，会自动设置它们的层级关系。正在注册的菜单是父菜单，注册的菜单是子菜单。
下面，`main` 是 `settings` 的父菜单，除非你显式地指定了另一个父菜单。
在向后导航时，将使用父级菜单。

```ts
// 注册设置菜单到主菜单。
main.register(settings);
// 可选择设置不同的父级。
main.register(settings, "back-from-settings-menu");
```

你可以注册任意多个菜单，并且可以嵌套任意深度。
菜单标识可以让你快速跳转到任何页面。

**你只需要给你的嵌套菜单设置一个交互即可。**
例如，只需要传递根菜单给 `bot.use`。

```ts
// 如果你已经有了这个：
main.register(settings);

// 请这样做：
bot.use(main);

// 请不要这样做：
bot.use(main);
bot.use(settings);
```

**你可以创建多个独立的菜单并且使它们都可以交互。**
例如，如果你创建了两个不相关的菜单，并且你不需要在它们之间导航，那么你应该独立地安装这两个菜单。

```ts
// 如果你有像这样的独立菜单：
const menuA = new Menu("menu-a");
const menuB = new Menu("menu-b");
// 你可以这样做：
bot.use(menuA);
bot.use(menuB);
```

## Payloads

你可以将短文本 payload 与所有文本按钮和导航按钮一起存储。
当相应的处理程序被调用时，payload 将在 `ctx.match` 中可用。
这是非常有用的，因为它让你可以在菜单中存储一些数据。

这里是一个记住当前时间的菜单的例子。
其他用例可能是，例如，存储分页菜单的索引。

```ts
function generatePayload() {
  return Date.now().toString();
}

const menu = new Menu("store-current-time-in-payload")
  .text(
    { text: "终止！", payload: generatePayload },
    async (ctx) => {
      // 给用户5秒钟的时间来撤销。
      const text = Date.now() - Number(ctx.match) < 5000
        ? "该操作被成功取消。"
        : "太晚了！你的猫咪视频已经在网上疯传了。";
      await ctx.reply(text);
    },
  );

bot.use(menu);
bot.command("publish", async (ctx) => {
  await ctx.reply("视频将被发送。你有 5 秒钟时间来撤销它。", {
    reply_markup: menu,
  });
});
```

::: tip 限制
Payloads 不能用来实际存储任何大量的数据。
你能存储的唯一的东西是通常小于 50 字节的短字符串，例如索引或标识符。
如果你真的想存储用户数据，例如文件标识符，URL 或其他东西，你应该使用 [会话](./session)。

此外，payload 总是基于当前的上下文对象重新生成。
这意味着 _从哪里_ 导航到菜单很重要，这可能会导致令人惊讶的结果。
例如, 当一个菜单 [过时了](#过时的菜单和指纹), 它可以 _基于在过时菜单上的按钮点击_ 被重新渲染。
:::

Payloads 也能和动态范围一起使用。

## 动态范围

到目前为止，我们只看到了如何动态地改变按钮上的文本。
你也可以动态地调整菜单的结构，以便在任何时候添加和删除按钮。

::: danger 不要在信息处理过程中改变菜单
你不能在信息处理过程中创建或更改菜单。
所有菜单必须在你的机器人开始之前完全创建和注册。
这意味着你不能在你的 bot 的处理程序中使用 `new Menu("id")`。
你不能在你的 bot 的处理程序中调用 `menu.text` 或类似的东西。

在你的 bot 运行时，添加新的菜单会导致内存泄漏。
你的 bot 将会变得更慢，并且最终崩溃。

但是你可以使用本节中描述的动态范围来自定义菜单。
你可以通过它们任意地改变现有的菜单实例，所以它们同样的强大。
请使用动态范围！
:::

你可以让一部分按钮在运行时动态生成（或者全部）。
我们把这部分菜单称为 _动态范围_。
换句话说，你可以通过一个工厂函数在菜单被渲染时创建一个按钮，而不是直接在菜单上定义按钮。
在这个函数里创建动态范围的最简单方法是使用这个插件提供的 `MenuRange` 类。
`MenuRange` 为你提供了菜单的所有功能，但是它没有标识符，并且不能被注册。

```ts
const menu = new Menu("dynamic");

menu
  .url("About", "https://grammy.dev/plugins/menu").row()
  .dynamic(() => {
    // 动态生成一部分菜单！
    const range = new MenuRange();
    for (let i = 0; i < 3; i++) {
      range
        .text(i.toString(), (ctx) => ctx.reply(`You chose ${i}`))
        .row();
    }
    return range;
  })
  .text("Cancel", (ctx) => ctx.deleteMessage());
```

你传递给 `dynamic` 的范围构造器可以是 `async`，所以你甚至可以在返回新的菜单范围之前从 API 或数据库读取数据。
**在许多情况下，根据 [会话](./session)数据生成一个动态范围是有意义的。**

范围构造器的第一个参数是上下文对象。
（在上面的例子中，没有指定这一点。）

你可以选择在 `ctx` 后面接收一个新的 `MenuRange` 实例。
如果你喜欢的话，你可以修改它而不是返回你自己的实例。
下面是你如何使用范围构建器函数的两个参数。

```ts
menu.dynamic((ctx, range) => {
  for (const text of ctx.session.items) {
    range // 不需要 `new MenuRange()` 或者 `return`
      .text(text, (ctx) => ctx.reply(text))
      .row();
  }
});
```

你的工厂函数以某种方式工作是很重要的，否则你的菜单可能会出现奇怪的行为，甚至抛出错误。
由于菜单总是 [渲染两次](#它是如何工作的)（一次是当菜单被发送时，另一次是当按钮被按下时），你需要确保：

1. **你在建立动态范围的函数中没有任何副作用。**
   不要发送消息。
   不要写入会话数据。
   不要改变函数之外的任何变量。
   请查看 [维基百科上的副作用](https://zh.wikipedia.org/wiki/副作用_(计算机科学))。
2. **你的函数是稳定的**，也就是说，它不依赖于随机性、当前时间或其他快速变化的数据源。
   它必须在第一次和第二次渲染菜单时生成相同的按钮。
   否则，菜单插件无法将正确的处理程序与按下的按钮匹配。
   而是，它会 [检测](#过时的菜单和指纹) 你的菜单已经过期，并且拒绝调用处理程序。

## 手动回复 Callback 查询

这个插件会自动调用 `answerCallbackQuery` 来处理自己的按钮。
你可以设置 `autoAnswer: false` 来禁用这个功能。

```ts
const menu = new Menu("id", { autoAnswer: false });
```

现在你必须自己调用 `answerCallbackQuery`。
这允许你传递展示给用户的自定义消息。

## 过时的菜单和指纹

假设你有一个菜单，其中用户可以开关通知，比如在[上面](#动态标签)的例子中。
现在，如果用户发送 `/settings` 两次，他们将会得到相同的菜单两次。
但是，改变第一个消息中的通知设置将不会更新第二个消息！

很明显，我们不能在聊天中跟踪所有设置消息，并在整个聊天历史中更新所有菜单。
你需要使用很多 API 调用来实现这个，以至于 Telegram 会限制你的 bot。
你还需要大量存储来记住所有聊天中的每个菜单的所有消息标识符。
这是不现实的。

解决这个问题的办法是，在执行任何操作之前检查菜单是否过时。
这样，只有当用户真正开始点击菜单上的按钮时，我们才会更新过时的菜单。
菜单插件会自动为你处理这个问题，所以你不需要担心它。

你可以精确地配置当检测到过时菜单时会发生什么。
默认情况下，用户将会看到一条消息"菜单已过时，请重试！"，并且菜单将会被更新。
你可以在配置中的 `onMenuOutdated` 下定义自定义行为。

```ts
// 自定义消息
const menu0 = new Menu("id", { onMenuOutdated: "Updated, try now." });
// 自定义处理函数
const menu1 = new Menu("id", {
  onMenuOutdated: async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply("Here is a fresh menu", { reply_markup: menu1 });
  },
});
// 完全禁用过时检测（可能运行错误的按钮处理程序）。
const menu2 = new Menu("id", { onMenuOutdated: false });
```

我们有一个检测菜单是否过时的技巧。
我们认为，如果：

- 菜单的形状发生了变化（行数或任意一行中按钮的数量）。
- 被按下的按钮的行/列位置超出范围。
- 被按下的按钮上的标签改变了。
- 被按下的按钮不包含处理程序。

有可能会出现这种情况，你的菜单可能会改变，但是上面的所有东西都保持不变。

也有可能你的菜单根本没有改变（即处理程序的行为没有发生变化），即使上面的技巧地表明菜单已经过时。
这两种情况对大多数 bot 来说都不太可能发生，但如果你创建的菜单是这种情况，你应该使用指纹功能。

```ts
function ident(ctx: Context): string {
  // 返回一个字符串，当且仅当你的菜单发生显著变化
  // 以至于它应该被认为过时时，该字符串才会改变。
  return ctx.session.myStateIdentifier;
}
const menu = new Menu("id", { fingerprint: (ctx) => ident(ctx) });
```

指纹字符串将取代上面的技巧。
这样，你可以确保过时的菜单总是被检测到。

## 它是如何工作的

这个插件完全不需要存储任何数据。
这对于有百万用户的大型机器人来说非常重要。
保存所有菜单的状态会占用太多内存。

当你创建菜单对象并通过 `register` 调用链接它们时，实际上没有菜单被构建。
相反，菜单插件将记住如何根据你的操作构建新的菜单。
每当一个菜单被发送时，它将重放这些操作以渲染你的菜单。
这包括布局所有动态范围和生成所有动态标签。
一旦菜单被发送，渲染的按钮数组将被忘记。

当一个菜单被发送时，每个按钮都包含一个回调查询，它将存储：

- 菜单标识符。
- 按钮的行/列位置。
- 一个可选的 payload。
- 一个指纹标志，它存储了是否在菜单中使用了指纹。
- 一个4字节的哈希，用于编码指纹或菜单布局和按钮标签。

当一个按钮被按下时，回调查询将被发送到 bot。

这样，我们可以确定哪个菜单中哪个按钮被按下。
一个菜单只有在以下情况下才会处理按钮的按下：

- 匹配菜单标识符。
- 行/列位置已经指定。
- 存在指纹标志。

当用户按下一个菜单按钮时，我们需要找到在菜单渲染时被添加到这个按钮的处理程序。
因此，我们只需要再次渲染旧的菜单。
然而，这次，我们不需要完整的布局，我们只需要菜单的结构和一个特定的按钮。
因此，菜单插件将执行一个简单的渲染以获得更高的效率。
换句话说，菜单将只被部分渲染。

一旦再次知道被按下的按钮（并且我们已经检查了菜单没有[过时](#过时的菜单和指纹)），我们将调用处理程序。

在内部，菜单插件大量使用了 [API Transformer 函数](../advanced/transformers)，例如，以快速渲染出正在运行的菜单。

当你在一个大型层次结构中注册菜单以导航时，它们实际上不存储这些引用。
在内部，所有这个结构的菜单都被添加到同一个大型池中，并且这个池在所有包含的实例中共享。
每个菜单都对索引中的每个其他菜单负责，并且它们可以互相处理和渲染。
（大多数情况下，只有根菜单被传递给 `bot.use` 并且接收所有 update。
在这种情况下，这个实例将负责整个的池。）
因此，你能够在任意的菜单之间无限制地浏览，并且这个更新处理可以在 [`O(1)` 时间复杂度](https://en.wikipedia.org/wiki/Time_complexity#Constant_time)中发生，因为不需要在层次结构中搜索到正确的菜单来处理按钮点击。

## 插件概述

- 名字：`menu`
- [源码](https://github.com/grammyjs/menu)
- [参考](/ref/menu/)
