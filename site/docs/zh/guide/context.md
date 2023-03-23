---
prev: ./basics.md
next: ./api.md
---

# 上下文

`Context` 对象（[grammY API 参考](https://deno.land/x/grammy/mod.ts?s=Context)）是 grammY 的一个重要部分。

每当你在你的 bot 对象上注册一个监听器时，这个监听器将收到一个上下文对象。

```ts
bot.on("message", (ctx) => {
  // `ctx` 是一个 `Context` 对象。
});
```

你可以使用上下文对象去做这些事情：

- [访问有关聊天信息的内容](#可用信息)
- [对信息进行响应的行动](#可用操作).

注意，上下文对象通常被称为 `ctx`。

## 可用信息

当用户向你的 bot 发送消息时，你可以通过 `ctx.message` 访问它。
举个例子，要获得消息的文本，你可以这样做：

```ts
bot.on("message", (ctx) => {
  // `txt` 在处理文本信息时将是一个 `string`。
  // 如果收到的信息没有任何信息文本，它将是 `undefined`。
  // 例如，照片、贴纸和其他信息。
  const txt = ctx.message.text;
});
```

同样，你也可以访问消息对象的其他属性，例如 `ctx.message.chat` ，以了解消息发送地的聊天信息。
请查看 [Telegram Bot API 参考 中关于 `Message` 的部分](https://core.telegram.org/bots/api#message)，看看哪些数据是可用的。
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

| 快捷方式              | 描述                                                         |
| --------------------- | ------------------------------------------------------------ |
| `ctx.msg`             | 获取 `message` 对象，包括已编辑的信息对象                    |
| `ctx.chat`            | 获取 `chat` 对象                                             |
| `ctx.senderChat`      | 从 `ctx.msg` 中获取发送者聊天对象（用于匿名通道/群组消息）。 |
| `ctx.from`            | 获取消息的作者，回调查询，或其他东西的作者                   |
| `ctx.inlineMessageId` | 获取回调查询的内联信息标识符或选择的内联结果                 |
| `ctx.entities`        | 获取消息实体和它们的文本，可选择通过实体类型过滤             |

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
bot.on("message:entities", (ctx) => {
  // 获取所有实体.
  const entities = ctx.entities();
  // 获取第一个实体的文本.
  entities[0].text;
  // 获取Email实体.
  const emails = ctx.entities("email");
  // 获取手机和Email实体.
  const phonesAndEmails = ctx.entities(["email", "phone"]);
});
```

因此，如果你愿意，你可以忘记 `ctx.message` 和 `ctx.channelPost` 以及 `ctx.editedMessage` 等等，而只是一直使用 `ctx.msg` 来代替。

## 通过 Has Checks 进行检测

上下文对象有一些方法可以让你为某些事情检测包含的数据。
例如，你可以调用 `ctx.hasCommand("start")` 来查看上下文对象是否包含了一个 `/start` 命令。
这就是为什么这些方法被统称为 _has checks_ 。
::: 知道什么时候使用 Has Checks
这与 `bot.command("start")` 使用的逻辑完全相同。
请注意，你通常应该使用 [filter 查询](./filter-queries.md) 或者类似的方法。
has checks 在 [conversations 插件](../plugins/conversations.md) 里面使用效果最好。
:::
has checks 正确地缩小了上下文类型的范围。
这意味着，检查上下文是否具有回调查询数据，将告诉 TypeScript 该上下文具有 `ctx.callbackQuery.data` 字段。

```ts
if (ctx.hasCallbackQuery(/query-data-\d+/)) {
  // 存在 `ctx.callbackQuery.data` 字段
  const data: string = ctx.callbackQuery.data;
}
```

这同样适用于所有其他 has checks。
阅读 [上下文对象的 API 参考](https://deno.land/x/grammy/mod.ts?s=Context#method_has_0) 来获取查看 has checks 的列表。
阅读 [API 参考](https://deno.land/x/grammy/mod.ts?s=Context#Static_Properties) 中的静态属性 `Context.has` ， 这能让你创建高效的判定函数来检测大量上下文对象。

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

因此，正如 [前面](./basics.md#发送信息) 所解释的，上下文对象的所有方法都可以接受 `Other` 类型的选项对象，以传递给每个 API 调用。
这可以用于向每个 API 调用传递进一步的配置。

::: tip Telegram 的回复功能
尽管该方法在 grammY （和许多其他框架）中被称为 `ctx.reply`，但它并没有使用 [Telegram 的回复功能](https://telegram.org/blog/replies-mentions-hashtags#replies)，因为在 Telegram 中，前一条信息是被链接的。

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

当然，`ctx.api` 上的每一个其他方法都有一个快捷方式，并且有正确的预填值，比如 `ctx.replyWithPhoto` 用来回复照片，或者 `ctx.exportChatInviteLink` 用来获取相应聊天的邀请链接。如果你想了解存在哪些快捷方式，那么自动完成是你的伙伴，还有 [grammY API 参考](https://deno.land/x/grammy/mod.ts?s=Context)。

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

### 通过中间件（推荐）

在 [中间件](./middleware.md) 中，可以轻松完成定制。

::: tip 什么是中间件？
本节需要对中间件有所了解，所以如果你还没有跳过到这一 [部分](./middleware.md)，那么这里有一个非常简短的总结。

你需要知道，多个处理程序可以处理相同的上下文对象。
有一些特殊处理程序可以在任何其他处理程序之前修改 `ctx`，并且第一个处理程序的修改对所有后续处理程序都是可见的。
:::

这个思想是在注册其他监听器之前安装中间件。
然后你可以在这些处理程序中设置你想要的属性。
如果你在一个处理程序中 `ctx.yourCustomPropertyName = yourCustomValue`， 那么 `ctx.yourCustomPropertyName` 属性也能够在后续的处理程序中被使用。

为了便于说明，我们假设你想要在上下文对象上设置一个属性 `ctx.config`。
在这个例子中，我们将使用它来存储一些项目相关的配置，以便所有处理程序都能访问它。
这个配置将让我们更容易检测机器人是被它的开发者还是普通用户使用。

在创建你的机器人之后，请这样做：

```ts
const BOT_DEVELOPER = 123456; // bot 开发者的聊天标识符

bot.use(async (ctx, next) => {
  // 通过设置配置，在这里修改上下文对象。
  ctx.config = {
    botDeveloper: BOT_DEVELOPER,
    isDeveloper: ctx.from?.id === BOT_DEVELOPER,
  };
  // 运行其余处理程序。
  await next();
});
```

然后，你可以在其余处理程序中使用 `ctx.config`。

```ts
bot.command("start", async (ctx) => {
  // 在这里使用修改过的上下文！
  if (ctx.config.isDeveloper) await ctx.reply("Hi mom!! <3");
  else await ctx.reply("Welcome, human!");
});
```

然而，你会发现 TypeScript 不知道 `ctx.config` 是可用的，即使我们正确地赋值了属性。
因此，尽管这段代码在运行时可以正常工作，但是它不能编译。
为了解决这个问题，我们需要调整上下文的类型，并且添加属性。

```ts
interface BotConfig {
  botDeveloper: number;
  isDeveloper: boolean;
}

type MyContext = Context & {
  config: BotConfig;
};
```

新类型 `MyContext` 现在更加准确地描述了我们机器人正在处理的上下文对象。

> 你需要确保你的类型和你初始化的属性保持同步。

我们可以通过将新类型传递给 `Bot` 构造函数来使用它。

```ts
const bot = new Bot<MyContext>("");
```

综上所述，设置将像这样：

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
const BOT_DEVELOPER = 123456; // bot 开发者的聊天标识符

// 定义自定义上下文类型。
interface BotConfig {
  botDeveloper: number;
  isDeveloper: boolean;
}
type MyContext = Context & {
  config: BotConfig;
};

const bot = new Bot<MyContext>("");

// 在上下文对象上设置自定义属性。
bot.use(async (ctx, next) => {
  ctx.config = {
    botDeveloper: BOT_DEVELOPER,
    isDeveloper: ctx.from?.id === BOT_DEVELOPER,
  };
  await next();
});

// 为自定义上下文对象定义处理程序。
bot.command("start", async (ctx) => {
  if (ctx.config.isDeveloper) await ctx.reply("Hi mom!");
  else await ctx.reply("Welcome");
});
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const BOT_DEVELOPER = 123456; // bot 开发者的聊天标识符

const bot = new Bot("");

// 在上下文对象上设置自定义属性。
bot.use(async (ctx, next) => {
  ctx.config = {
    botDeveloper: BOT_DEVELOPER,
    isDeveloper: ctx.from?.id === BOT_DEVELOPER,
  };
  await next();
});

// 为自定义上下文对象定义处理程序。
bot.command("start", async (ctx) => {
  if (ctx.config.isDeveloper) await ctx.reply("Hi mom!");
  else await ctx.reply("Welcome");
});
```

</CodeGroupItem>
</CodeGroup>

当然，自定义上下文类型也可以传递给其他处理中间件的东西，比如 [组合器](https://deno.land/x/grammy/mod.ts?s=Composer)。

```ts
const composer = new Composer<MyContext>();
```

一些插件也需要你传递自定义上下文类型，比如 [路由器](../plugins/router.md) 或 [互动菜单](../plugins/menu.md) 插件。
请查看它们的文档，以了解它们如何使用自定义上下文类型。
这些类型被称为上下文调味剂，如 [下面](#上下文调味剂) 所述。

### 通过继承

除了在上下文对象中设置自定义属性外，你还可以继承 `Context` 类。

```ts
class MyContext extends Context {
  // etc
}
```

然而，我们建议你 [通过中间件](#通过中间件) 来自定义上下文对象，因为它更加灵活，并且在你想要安装插件的情况下工作得更好。

我们现在将看看如何为上下文对象使用自定义类。

当你构建你的 bot 时，你可以传递一个自定义上下文构造函数，这个函数将用于实例化上下文对象。
请注意，你的类必须继承 `Context`。

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context } from "grammy";
import type { Update, UserFromGetMe } from "grammy/types";

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
const bot = new Bot("", {
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
const bot = new Bot("", {
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
import type { Update, UserFromGetMe } from "https://deno.land/x/grammy/types.ts";

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
const bot = new Bot("", {
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

请注意，当你使用自定义上下文类的子类时，类型会被自动推断。
你不再需要写 `Bot<MyContext>` 因为你已经在 `new Bot()` 的选项对象中指定了你的子类构造函数。

然而，这使得安装插件非常困难，因为它们通常需要你安装上下文调味剂。

## 上下文调味剂

上下文调味剂是一种告诉 TypeScript 关于你的上下文对象的新属性的方式。
这些新属性可以在插件或其他模块中发布，然后安装在你的 bot 上。

上下文调味剂还能够使用由插件定义的自动程序来转换现有属性的类型。

### 添加式上下文调味剂

正如上文所提到的，我们有两种不同类型的上下文调味剂。
最基本的被称为 _添加式上下文调味剂_，而且每当我们谈论 _给上下文烹饪调味_ 时，我们一般指这种基本形式。
让我们来看看它是如何工作的：

举个例子，当你有 [会话数据](../plugins/session.md) 时，你必须在上下文类型上注册 `ctx.session`。
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

`SessionFlavor` 类型（[API 参考](https://deno.land/x/grammy/mod.ts?s=SessionFlavor)）是清晰的：它只定义了属性 `session`。
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

调味的顺序并不重要，你可以以任何你喜欢的顺序组合它们。

多个 [转换式调味剂](#转换式上下文调味剂) 也可以结合起来：

```ts
type MyContext = FlavorX<FlavorY<FlavorZ<Context>>>;
```

在这里，顺序可能很重要，因为 `Context` 先转换为 `FlavorZ`， 然后再转换为 `FlavorY`，最后转换为 `FlavorX`。

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

在安装多个插件时，请确保遵循此模式。
大部分类型错误都是因为上下文调味剂的不正确组合。
