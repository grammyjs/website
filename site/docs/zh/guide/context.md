---
prev: ./basics.md
next: ./api.md
---

# 上下文

`Context` 对象（[grammY API 参考](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/Context)）是 grammY 的一个重要部分。

每当你在你的 bot 对象上注册一个监听器时，这个监听器将收到一个上下文对象。

```ts
bot.on("message", (ctx) => {
  // `ctx` 是一个 `Context` 对象。
});
```

你可以使用上下文对象去做这些事情：

- [访问有关聊天信息的内容](#available-information)
- [对信息进行响应的行动](#available-actions).

注意，上下文对象通常被称为 `ctx`。

## 可用信息

当用户向你的 bot 发送消息时，你可以通过 `ctx.message` 访问它。
举个例子，要获得消息的文本，你可以这样做：

```ts
bot.on("message", (ctx) => {
  // `txt` 在处理文本信息时将是一个 `string'。
  // 如果收到的信息没有任何信息文本，它将是 `undefined'。
  // 例如，照片、贴纸和其他信息。
  const txt = ctx.message.text;
});
```

同样，你也可以访问消息对象的其他属性，例如 `ctx.message.chat` ，以了解消息发送地的聊天信息。
请查看 [Telegram Bot API 参考 中关于 `Message' 的部分](https://core.telegram.org/bots/api#message)，看看哪些数据是可用的。
另外，你可以简单地在你的代码编辑器中使用自动完成功能来查看可能的选项。

如果你为其他类型的监听器注册监听，`ctx` 也会给你关于这些的信息。
示例：

```ts
bot.on("edited_message", (ctx) => {
  // 获得新的、经过编辑的信息文本。
  const editedText = ctx.editedMessage.text;
});
```

此外，你可以访问 Telegram 发送给你的 bot 的原始 `Update` 对象（[Telegram Bot API 参考](https://core.telegram.org/bots/api#update)）。
这个更新对象（`ctx.update`）包含了 `ctx.message` 之类的所有数据来源。

上下文对象包含关于你的机器人的信息，可以通过 `ctx.me` 访问。

### 快捷方式

在上下文对象上安装了一些快捷方式。

| 快捷方式                  | 描述                                   |
| --------------------- | ------------------------------------ |
| `ctx.msg`             | 获取 `message` 对象，包括已编辑的信息对象           |
| `ctx.chat`            | 获取 `chat` 对象                         |
| `ctx.senderChat`      | 从 `ctx.msg` 中获取发送者聊天对象（用于匿名通道/群组消息）。 |
| `ctx.from`            | 获取消息的作者，回调查询，或其他东西的作者                |
| `ctx.inlineMessageId` | 获取回调查询的内联信息标识符或选择的内联结果               |

换句话说，你也可以这样做：

```ts
bot.on("message", (ctx) => {
  // 获取接收到的信息的文本。
  const text = ctx.msg.text;
});
bot.on("edited_message", (ctx) => {
  // 获得新的、经过编辑的信息文本。
  const editedText = ctx.msg.text;
});
```

因此，如果你愿意，你可以忘记 `ctx.message` 和 `ctx.channelPost` 以及 `ctx.editedMessage` 等等，而只是一直使用 `ctx.msg` 来代替。

## 可用操作

如果你想回应一个用户的信息，你可以这样：

```ts
bot.on("message", async (ctx) => {
  // 获取聊天 id。
  const chatId = ctx.msg.chat.id;
  // 要回复的文本。
  const text = "I got your message!";
  // 发送回复。
  await bot.api.sendMessage(chatId, text);
});
```

你可以注意到，这有两点不是最佳的选择：

1. 我们必须能够访问 `bot` 对象。
   这意味着我们必须在我们的代码库中传递 `bot` 对象，以便做出反应，当你有多个源文件，并且在其他地方定义了你的监听器时，这就很烦人。
2. 我们必须取出上下文的聊天标识符，并再次明确将其传递给 `sendMessage`。
   这也很烦人，因为你很可能总是想回复发出信息的同一个用户。
   想象一下！你会有多频繁地一遍又一遍，一遍又一遍打出同样的东西

关于第 1 点，上下文对象只是为你提供了访问 `bot.api` 上的相同的API对象，它被称为 `ctx.api`。
你现在可以写 `ctx.api.sendMessage` 来代替，你不再需要传递你的 `bot` 对象。
很简单。

然而，真正需要花大力气解决的是第二点。
`ctx` 对象可以让你简单地发送一个像这样的回复：

```ts
bot.on("message", async (ctx) => {
  await ctx.reply("I got your message!");
});

// 甚至可以再简单一点：
bot.on("message", (ctx) => ctx.reply("Gotcha!"));
```

很整洁! :tada:

在后台，上下文 _已经知道_ 它的聊天标识符（即 `ctx.msg.chat.id`），所以它给你 `reply` 方法，让你向同一个聊天记录发送消息。
在内部，`reply` 再次调用 `sendMessage`，并为您预先填写了聊天标识符。

::: tip Telegram 的回复功能
尽管该方法在 grammY （和许多其他框架）中被称为 `ctx.reply`，但它并没有使用 Telegram 的回复功能，因为在 Telegram 中，前一条信息是被链接的。

如果你在 [Telegram Bot API 参考](https://core.telegram.org/bots/api#sendmessage) 中查看 `sendMessage` 能做什么，你会看到一些选项，比如`parse_mode`，`disable_web_page_preview` 和 `reply_to_message_id`。
最后的那个选项可以使一条消息成为回复：

```ts
await ctx.reply("^ This is a message!", {
  reply_to_message_id: ctx.msg.message_id,
});
```

同样的选项对象可以传递给 `bot.api.sendMessage` 和 `ctx.api.sendMessage`。
在你的代码编辑器中使用自动完成来查看可用的选项。
:::

当然，`ctx.api` 上的每一个其他方法都有一个快捷方式，并且有正确的预填值，比如 `ctx.replyWithPhoto` 用来回复照片，或者 `ctx.exportChatInviteLink` 用来获取相应聊天的邀请链接。如果你想了解存在哪些快捷方式，那么自动完成是你的伙伴，还有 [grammY API 参考](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/Context)。

请注意，你可能不希望总是在同一个聊天中做出回复。
在这种情况下，你可以退回到使用 `ctx.api` 方法，并在调用它们时指定所有选项。
例如，如果你收到来自 Alice 的消息，并想通过向 Bob 发送消息来做出反应，那么你不能使用 `ctx.reply` ，因为它总是会向 Alice 的聊天室发送消息。
那么你就可以调用 `ctx.api.sendMessage` 并指定 Bob 的聊天标识符。

## 上下文对象是如何被创造的？

每当你的机器人从 Telegram 收到一条新消息时，它就会被包裹在一个 update 对象中。
事实上，update 对象不仅可以包含新的消息，还可以包含所有其他种类的东西，例如对消息的编辑、投票的回答，以及 [更多](https://core.telegram.org/bots/api#update)。

对于每一个传入的 update，都会精确地创建一个新的 `Context` 对象。
不同 update 的上下文是完全不相关的对象，它们只是通过 `ctx.me` 引用相同的 bot 信息。

一个 update 的相同上下文对象将被 bot 上所有安装的中间件（[docs](./middleware.md)）共享。

## 定制你的上下文对象

> 如果你是初次使用 `Context`，那么请暂时忽略这一部分。

如果你愿意，你可以在 `Context` 对象上安装你自己的需要的。
这可以通过两种方式实现：

1. 安装修改上下文的[中间件](./middleware.md)（推荐），或
2. 设置一个自定义的上下文构造函数。

如果你选择选项 1，你必须指定自定义上下文作为一个类型参数（JavaScript 可以忽略这条）。

<CodeGroup>
  <CodeGroupItem title="Node.js" active>

```ts
import { Bot, Context } from "grammy";

// 自定义一个上下文类型。
interface MyContext extends Context {
  customProp: string | number | undefined;
}

// 向 `Bot` 构造函数传入自定义的上下文类型。
const bot = new Bot<MyContext>("<token>");

bot.on("message", (ctx) => {
  // `ctx` 现在是 `MyContext` 类型！
  const prop = ctx.customProp;
});
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";

// 自定义一个上下文类型。
interface MyContext extends Context {
  customProp: string | number | undefined;
}

// 向 `Bot` 构造函数传入自定义的上下文类型。
const bot = new Bot<MyContext>("<token>");

bot.on("message", (ctx) => {
  // `ctx` 现在成为 `MyContext` 类型！
  const prop = ctx.customProp;
});
```

</CodeGroupItem>
</CodeGroup>

自然地，仅仅因为现在上下文 _类型_ 有了新的属性，这并不意味着它们背后会有实际的 _值_。
你必须确保一个插件（或你自己的中间件）正确设置所有属性，以满足你指定的类型。

> 一些中间件（例如 [会话中间件](/zh/plugins/session.md)）要求你在上下文对象中混入正确的类型，这可以通过 _调味_ 你的上下文来完成，正如 [在下面](#上下文调味剂) 所解释的。

如果你选择了选项 2，这就是你设置自定义上下文构造函数的方式，它将被用来实例化上下文对象。
注意，你的类必须扩展 `Context`。

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context } from "grammy";
import type { Update, UserFromGetMe } from "@grammyjs/types";

// 自定义一个上下文类。
class MyContext extends Context {
  // 自定义一些属性
  public readonly customProp: number;
  constructor(update: Update, api: Api, me: UserFromGetMe) {
    super(update, api, me);
    this.customProp = me.username.length * 42;
  }
}

// 作为一个选项，传入自定义上下文类的构造函数。
const bot = new Bot("<token>", {
  ContextConstructor: MyContext,
});

bot.on("message", (ctx) => {
  // `ctx` 现在成为了 `MyContext` 类型。
  const prop = ctx.customProp;
});

bot.start();
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript" active>

```ts
const { Bot, Context } = require("grammy");

// 自定义一个上下文类。
class MyContext extends Context {
  // 自定义一些属性
  public readonly customProp;
  constructor(update, api, me) {
    super(update, api, me);
    this.customProp = me.username.length * 42;
  }
}

// 作为一个选项，传入自定义 上下文类的构造函数。
const bot = new Bot("<token>", {
  ContextConstructor: MyContext,
});

bot.on("message", (ctx) => {
  // `ctx` 现在成为了 `MyContext` 类型。
  const prop = ctx.customProp;
});

bot.start();
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import type { Update, UserFromGetMe } from "https://esm.sh/@grammyjs/types";

// 自定义一个上下文类
class MyContext extends Context {
  // 自定义一些属性。
  public readonly customProp: number;
  constructor(update: Update, api: Api, me: UserFromGetMe) {
    super(update, api, me);
    this.customProp = me.username.length * 42;
  }
}

// 作为一个选项，传递自定义上下文类的构造函数。
const bot = new Bot("<token>", {
  ContextConstructor: MyContext,
});

bot.on("message", (ctx) => {
  // `ctx` 现在成为了 `MyContext` 类型。
  const prop = ctx.customProp;
});

bot.start();
```

</CodeGroupItem>
</CodeGroup>

::: tip 相关
[中间件](./middleware.md) 指的是接收上下文对象作为参数的函数，比如已安装的监听器。
:::

## 上下文调味剂

上下文调味剂是一种告诉 TypeScript 关于你的上下文对象的新属性的方式。

### 添加式上下文调味剂

有两种不同类型的上下文调味剂。
基本的一种被称为 _添加式上下文调味剂_，而且每当我们谈论 _给上下文烹饪调味_ 时，我们一般指这种基本形式。
让我们来看看它是如何工作的：

举个例子，当你有 [会话数据](/plugins/session.md) 时，你必须在上下文类型上注册 `ctx.session`。
否则：

1. 你不能安装内置的 session 插件
2. 你在听众中没有访问 `ctx.session` 的权限

> 尽管我们在这里将使用会话作为一个例子，但类似的事情适用于许多其他事情。
> 事实上，大多数插件会给你一个你需要使用的上下文调味剂。

上下文调味剂只是一个小的新类型，它定义了应该被添加到上下文类型中的属性。
让我们来看看一个调味的例子。

```ts
interface SessionFlavor<S> {
  session: S;
}
```

`SessionFlavor` 类型（[API 参考](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/SessionFlavor)）是清晰的：它只定义了属性 `session`。
它需要一个类型参数，用来定义会话数据的实际结构。

这有什么用呢？
这里是一个例子：如果使用 `session` 数据来给上下文增鲜亮色。

```ts
import { Context, SessionFlavor } from "grammy";

// 声明 `ctx.session` 为 `string` 类型。
type MyContext = Context & SessionFlavor<string>;
```

现在你可以使用 session 插件了，你可以访问`ctx.session`。

```ts
bot.on("message", (ctx) => {
  // 现在 `str` 是 `string` 类型的。
  const str = ctx.session;
});
```

### 转换式上下文调味剂

另一种上下文调味剂更强大。
它们不是用`&`操作符来配置，而是需要像这样配置：

```ts
import { Context } from "grammy";
import { SomeFlavorA } from "my-plugin";

type MyContext = SomeFlavorA<Context>;
```

其他一切都以添加式调味剂同样的方式运作。

每个（官方）插件都在其文档中说明了它是否必须通过添加式或转换式上下文风味来使用。

### 结合不同类型的上下文调味剂

如果你有不同的 [添加式调味剂](#添加式上下文调味剂)，你可以像这样配置它们：

```ts
type MyContext = Context & FlavorA & FlavorB & FlavorC;
```

多个 [转换式调味剂](#转换式上下文调味剂) 也可以结合起来：

```ts
type MyContext = FlavorX<FlavorY<FlavorZ<Context>>>;
```

你甚至可以混合添加式和转化式的，以"烹饪"出更佳的上下文。

```ts
type MyContext = FlavorX<
  FlavorY<
    FlavorZ<
      Context & FlavorA & FlavorB & FlavorC
    >
  >
>;
```

调味的顺序并不重要，你可以以任何你喜欢的顺序组合它们。
