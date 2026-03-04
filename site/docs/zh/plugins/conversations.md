---
prev: false
next: false
---

# 对话 (`conversations`)

轻松创建强大的对话界面。

## 快速开始

对话插件让你能够等待消息。
如果你的 bot 有多个步骤，请使用此插件。

> 对话是独一无二的，因为它引入了一个你在世界其他地方找不到的新概念。
> 它提供了一个优雅的解决方案，但你需要先了解一下它是如何工作的，你才能理解你的代码实际上在做什么。

在进入有意思的部分之前，这里有一个快速入门，让你可以试用该插件。

:::code-group

```ts [TypeScript]
import { Bot, type Context } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";

const bot = new Bot<ConversationFlavor<Context>>(""); // <-- 把你的 bot token 放在 "" 之间 (https://t.me/BotFather)
bot.use(conversations());

/** 定义对话 */
async function hello(conversation: Conversation, ctx: Context) {
  await ctx.reply("嗨，你好呀！你叫什么名字呀？");
  const { message } = await conversation.waitFor("message:text");
  await ctx.reply(`欢迎来聊天，${message.text}！`);
}
bot.use(createConversation(hello));

bot.command("enter", async (ctx) => {
  // 进入你定义的 "hello" 函数。
  await ctx.conversation.enter("hello");
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { conversations, createConversation } = require(
  "@grammyjs/conversations",
);

const bot = new Bot(""); // <-- 把你的 bot token 放在 "" 之间 (https://t.me/BotFather)
bot.use(conversations());

/** 定义对话 */
async function hello(conversation, ctx) {
  await ctx.reply("嗨，你好呀！你叫什么名字呀？");
  const { message } = await conversation.waitFor("message:text");
  await ctx.reply(`欢迎来聊天，${message.text}！`);
}
bot.use(createConversation(hello));

bot.command("enter", async (ctx) => {
  // 进入你定义的 "hello" 函数。
  await ctx.conversation.enter("hello");
});

bot.start();
```

```ts [Deno]
import { Bot, type Context } from "https://deno.land/x/grammy/mod.ts";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations/mod.ts";

const bot = new Bot<ConversationFlavor<Context>>(""); // <-- 把你的 bot token 放在 "" 之间 (https://t.me/BotFather)
bot.use(conversations());

/** 定义对话 */
async function hello(conversation: Conversation, ctx: Context) {
  await ctx.reply("嗨，你好呀！你叫什么名字呀？");
  const { message } = await conversation.waitFor("message:text");
  await ctx.reply(`欢迎来聊天，${message.text}！`);
}
bot.use(createConversation(hello));

bot.command("enter", async (ctx) => {
  // 进入你定义的 "hello" 函数。
  await ctx.conversation.enter("hello");
});

bot.start();
```

:::

当你输入上述对话 `hello` 时，它会发送一条消息，然后等待用户发送文本消息，然后再发送另一条消息。
最后，对话完成。

现在，让我们进入有意思的部分。

## 对话插件是怎么工作的

请先看看以下传统消息处理的例子。

```ts
bot.on("message", async (ctx) => {
  // 处理一条消息
});
```

在一般的消息处理流程中，你始终只有一个上下文对象。

再和对话进行比较。

```ts
async function hello(conversation: Conversation, ctx0: Context) {
  const ctx1 = await conversation.wait();
  const ctx2 = await conversation.wait();
  // 处理三条消息
}
```

在这个对话中，你有三个可用的上下文对象！

与常规处理程序一样，对话插件仅从 [中间件系统](../guide/middleware) 接收单个上下文对象。
现在，它突然为你提供了三个上下文对象。
这怎么可能呢？

**对话构建器函数的执行方式与普通函数不同**。
（尽管我们可以用这种方式进行编程。）

### 对话是重放引擎

对话构建器函数不像普通函数那样执行。

当进入对话时，函数将只执行到第一个 wait 调用。
随后该函数被中断，不会再往下执行。
插件会记住当前运行到的 wait 调用，并存储此信息。

当下一个 update 到达时，会话将从函数的开头重新执行。
但这一次，所有的 API 调用都不会执行，这使得代码运行非常快，并且不会产生任何影响。
这称为 _重放_。
一旦再次到达先前运行到的 wait 调用，函数执行就会正常恢复。

::: code-group

```ts [进入]
async function hello( //                      |
  conversation: Conversation, //              |
  ctx0: Context, //                           |
) { //                                        |
  await ctx0.reply("嗨，你好呀！"); //         |
  const ctx1 = await conversation.wait(); //  A
  await ctx1.reply("再次欢迎你！"); //
  const ctx2 = await conversation.wait(); //
  await ctx2.reply("再见！"); //
} //
```

```ts [重放]
async function hello( //                      .
  conversation: Conversation, //              .
  ctx0: Context, //                           .
) { //                                        .
  await ctx0.reply("嗨，你好呀！"); //         .
  const ctx1 = await conversation.wait(); //  A
  await ctx1.reply("再次欢迎你！"); //         |
  const ctx2 = await conversation.wait(); //  B
  await ctx2.reply("再见！"); //
} //
```

```ts [重放 2]
async function hello( //                      .
  conversation: Conversation, //              .
  ctx0: Context, //                           .
) { //                                        .
  await ctx0.reply("嗨，你好呀！"); //         .
  const ctx1 = await conversation.wait(); //  A
  await ctx1.reply("再次欢迎你！"); //         .
  const ctx2 = await conversation.wait(); //  B
  await ctx2.reply("再见！"); //               |
} //                                          —
```

:::

1. 当进入对话时，函数将运行，直到 `A`，然后中断。
2. 当下一次 update 到达时，函数将重放，直到 `A`，并从 `A` 正常运行到 `B`，在 `B` 处中断。
3. 当最后一次 update 到达时，函数将重放，直到 `B`，并正常运行直到结束。

这意味着你编写的每一行代码都将被执行多次一一正常执行一次，重放期间执行更多次。
因此，你必须确保你的代码在重放时的行为与首次执行时相同。

如果你通过 `ctx.api`（包括 `ctx.reply`）执行任何 API 调用，插件会自动处理它们。
相反，你自己的数据库通信需要特殊处理。

操作如下。

### 对话的黄金法则

既然 [我们知道对话是如何执行的](#对话是重放引擎)，我们可以定义一条适用于你在对话构建器函数中编写的代码的规则。
如果你希望代码正常运行，则必须遵循该规则。

::: warning 黄金法则

**在重放之间表现不同的代码必须包装在 [`conversation.external`](/ref/conversations/conversation#external) 中。**

:::

这是使用它的方法：

```ts
// 错误的
const response = await accessDatabase();
// 正确的
const response = await conversation.external(() => accessDatabase());
```

通过 [`conversation.external`](/ref/conversations/conversation#external) 转义代码的一部分，会告知插件在重放期间应跳过这部分代码。
被包裹代码的返回值由插件存储，并在后续重放期间重复使用。
在上面的示例中，这可以防止重复访问数据库。

使用 `conversation.external` 的情况包括：

- 读取或写入文件、数据库/会话、网络或全局状态；
- 调用 `Math.random()` 或 `Date.now()`；
- 执行 `bot.api` 或其他 `Api` 的独立实例上的 API 调用。

不应该使用 `conversation.external` 的情况包括：

- 调用 `ctx.reply` 或其他 [上下文操作](../guide/context#可用操作)；
- 通过 `ctx.api` 调用 `ctx.api.sendMessage` 或其他 [Bot API](https://core.telegram.org/bots/api) 方法。

对话插件围绕 `conversation.external` 打造了一些简便方法。
这不仅简化了 `Math.random()` 和 `Date.now()` 的使用，而且还提供一种在重放期间抑制日志的方法，从而简化了调试。

```ts
// await conversation.external(() => Math.random());
const rnd = await conversation.random();
// await conversation.external(() => Date.now());
const now = await conversation.now();
// await conversation.external(() => console.log("abc"));
await conversation.log("abc");
```

`conversation.wait` 和 `conversation.external` 是怎样在重放时恢复原始的值的呢？
插件有什么办法记住这些数据，对吧？

当然。

### 对话存储状态

两类数据将在一个数据库中存储。
默认情况下，插件使用基于 `Map` 的轻量级内存数据库，但你也可以轻松地 [选用持久数据库](#持久化对话)。

1. 对话插件存储所有的 update。
2. 对话插件存储所有 `conversation.external` 的返回值和所有 API 调用的结果。

如果对话中只有几十条 update，这不是问题。
（别忘了在长轮询期间，每次调用 `getUpdates` 也最多只会检索 100 条 update。）

但是，如果你的对话从未退出，这些数据就会累积，让你的 bot 速度变慢。
**请避免无限循环。**

### 对话上下文对象

当会话被执行时，它会使用持久化的 update 数据从头生成新的上下文对象。
**这些上下文对象与外围中间件中的上下文对象不同。**
对于 TypeScript 代码，这也意味着你现在会有两种上下文 [调味剂](../guide/context#上下文调味剂)。

- **外部上下文对象** 是你的 bot 在中间件中使用的上下文对象。
  它们允许你访问 `ctx.conversation.enter`。
  对于 TypeScript，它们至少会包含 `ConversationFlavor`。
  外部上下文对象还会包含你通过 `bot.use` 安装的插件定义的其他属性。
- **内部上下文对象**（也称为 **对话上下文对象**）是由对话插件创建的上下文对象。
  它们无法访问 `ctx.conversation.enter`，并且默认情况下也无法访问任何插件。
  如果你希望在内部上下文对象中拥有自定义属性，请 [滚动到下面](#在对话中使用插件)。

你需要同时将外部和内部上下文类型传递给对话。
因此，TypeScript 的设置通常如下：

::: code-group

```ts [Node.js]
import { Bot, type Context } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
} from "@grammyjs/conversations";

// 外部上下文对象 (知道所有中间件插件)
type MyContext = ConversationFlavor<Context>;
// 内部上下文对象 (知道所有对话插件)
type MyConversationContext = Context;

// 对你的 bot 使用外部上下文类型。
const bot = new Bot<MyContext>(""); // <-- 把你的 bot token 放在 "" 之间 (https://t.me/BotFather)

// 对于你的对话，同时使用外部和内部类型。
type MyConversation = Conversation<MyContext, MyConversationContext>;

// 定义你的对话。
async function example(
  conversation: MyConversation,
  ctx0: MyConversationContext,
) {
  // 对话中的所有上下文对象
  // 都是 `MyConversationContext` 类型。
  const ctx1 = await conversation.wait();

  // 外部上下文对象可以通过
  // `conversation.external` 访问，
  // 并且被推断为 `MyContext` 类型。
  const session = await conversation.external((ctx) => ctx.session);
}
```

```ts [Deno]
import { Bot, type Context } from "https://deno.land/x/grammy/mod.ts";
import {
  type Conversation,
  type ConversationFlavor,
} from "https://deno.land/x/grammy_conversations/mod.ts";

// 外部上下文对象 (知道所有中间件插件)
type MyContext = ConversationFlavor<Context>;
// 内部上下文对象 (知道所有对话插件)
type MyConversationContext = Context;

// 对你的 bot 使用外部上下文类型。
const bot = new Bot<MyContext>(""); // <-- 把你的 bot token 放在 "" 之间 (https://t.me/BotFather)

// 对于你的对话，同时使用外部和内部类型。
type MyConversation = Conversation<MyContext, MyConversationContext>;

// 定义你的对话。
async function example(
  conversation: MyConversation,
  ctx0: MyConversationContext,
) {
  // 对话中的所有上下文对象
  // 都是 `MyConversationContext` 类型。
  const ctx1 = await conversation.wait();

  // 外部上下文对象可以通过
  // `conversation.external` 访问，
  // 并且被推断为 `MyContext` 类型。
  const session = await conversation.external((ctx) => ctx.session);
}
```

:::

> 在上面的例子中，在对话中没有安装任何插件。
> 一旦你开始 [安装](#在对话中使用插件) 插件，`MyConversationContext` 的定义将不再是原始的 `Context`。

当然，如果你有多个对话，并且希望每个对话的上下文类型不同，你可以定义多种对话上下文类型。

恭喜！
如果你读懂了上述全部内容，最难的部分就结束了。
这个页面的剩余部分是关于这个插件的功能带来的价值。

## 进入对话

对话可以通过普通的处理程序进入。

默认情况下，对话的名称和函数的 [名称](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/name) 相同。
当然，你也可以在将对话安装到 bot 时重新命名。

同时，你也可以向对话传递参数。
请注意，这些参数将被存储为 JSON 字符串，因此请确保参数可以安全地传递给 `JSON.stringify`。

对话也可以通过普通的 JavaScript 函数调用从其他对话中进入。
在这种情况下，调用的函数可以访问被调用的对话可能提供的返回值。
当你在中间件内部进入对话时不可用。

:::code-group

```ts [TypeScript]
/**
 * 回答关于生命、宇宙和一切的问题。
 * 只有当对话从另一个对话中调用时，
 * 才能访问这个值。
 */
async function convo(conversation: Conversation, ctx: Context) {
  await ctx.reply("正在计算答案");
  return 42;
}
/** 接受两个参数 (必须是 JSON 可序列化的) */
async function args(
  conversation: Conversation,
  ctx: Context,
  answer: number,
  config: { text: string },
) {
  const truth = await convo(conversation, ctx);
  if (answer === truth) {
    await ctx.reply(config.text);
  }
}
bot.use(createConversation(convo, "new-name"));
bot.use(createConversation(args));

bot.command("enter", async (ctx) => {
  await ctx.conversation.enter("new-name");
});
bot.command("enter_with_arguments", async (ctx) => {
  await ctx.conversation.enter("args", 42, { text: "foo" });
});
```

```js [JavaScript]
/**
 * 回答关于生命、宇宙和一切的问题。
 * 只有当对话从另一个对话中调用时，
 * 才能访问这个值。
 */
async function convo(conversation, ctx) {
  await ctx.reply("Computing answer");
  return 42;
}
/** 接受两个参数 (必须是 JSON 可序列化的) */
async function args(conversation, ctx, answer, config) {
  const truth = await convo(conversation, ctx);
  if (answer === truth) {
    await ctx.reply(config.text);
  }
}
bot.use(createConversation(convo, "new-name"));
bot.use(createConversation(args));

bot.command("enter", async (ctx) => {
  await ctx.conversation.enter("new-name");
});
bot.command("enter_with_arguments", async (ctx) => {
  await ctx.conversation.enter("args", 42, { text: "foo" });
});
```

:::

::: warning 参数缺少类型安全

请再三确认对话的参数是否使用了正确的类型注释，以及是否向 `enter` 调用传递了相匹配的参数。
此插件无法检查 `conversation` 和 `ctx` 外的任何类型。

:::

不要忘了 [中间件的顺序很重要](../guide/middleware)。
你只能进入在调用 `enter` 的处理程序前就已经安装的对话。

## 等待 update

最基本的 wait 调用简单地等待任何 update。

```ts
const ctx = await conversation.wait();
```

它单纯返回一个上下文对象。
其他的 wait 调用都基于此实现。

### 过滤的 wait 调用

若要等待某种特定类型的 update，你可以使用过滤的 wait 调用。

```ts
// 像 `bot.on` 那样匹配过滤查询。
const message = await conversation.waitFor("message");
// 像 `bot.hears` 那样等待文本。
const hears = await conversation.waitForHears(/regex/);
// 像 `bot.command` 那样等待指令。
const start = await conversation.waitForCommand("start");
// 更多
```

请查看 API 参考中列出的 [过滤的 wait 调用的所有可用方法](/ref/conversations/conversation#wait)。

过滤的 wait 调用可保证仅返回匹配相应过滤条件的 update。
当 bot 接收到不符合条件的 update 时，update 将被丢弃。
你可以传递一个在这种情况下执行的回调函数。

```ts
const message = await conversation.waitFor(":photo", {
  otherwise: (ctx) => ctx.reply("请发送图片给我！"),
});
```

所有过滤等待调用都可以链式调用，以便一次添加多个过滤条件。

```ts
// 等待一张带特定标题的图片
let photoWithCaption = await conversation.waitFor(":photo")
  .andForHears("XY");
// 处理过滤的另一种情况：
photoWithCaption = await conversation
  .waitFor(":photo", { otherwise: (ctx) => ctx.reply("没有照片") })
  .andForHears("XY", { otherwise: (ctx) => ctx.reply("标题不正确") });
```

如果仅在其中一个链式等待调用中指定了 `otherwise`，那么仅当指定了的过滤器丢弃 update 时才会调用它。

### 检查上下文对象

对接收到的上下文对象进行 [解构](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Destructuring) 是很常见的。
因此你可以对接收的数据进行进一步的检查。

```ts
const { message } = await conversation.waitFor("message");
if (message.photo) {
  // 处理图片消息
}
```

对话也是 [has checks](../guide/context#通过-has-checks-进行检测) 的理想使用场景。

## 退出对话

退出对话最简单的方式就是让函数返回 (`return`)。
抛出一个错误也会结束对话。

如果这还不够，你可以随时手动停止对话。

```ts
async function convo(conversation: Conversation, ctx: Context) {
  // 所有分支都会退出对话
  if (ctx.message?.text === "return") {
    return;
  } else if (ctx.message?.text === "error") {
    throw new Error("boom");
  } else {
    await conversation.halt(); // 不会返回
  }
}
```

你也可以在中间件中退出对话。

```ts
bot.use(conversations());
bot.command("clean", async (ctx) => {
  await ctx.conversation.exit("convo");
});
```

你甚至可以在目标对话在中间件系统上安装 _之前_ 就执行此操作。
安装对话插件本身就足够了。

## 这只是 JavaScript

虽然有一些 [副作用](#对话的黄金法则)，但对话插件只是普通的 JavaScript 函数。
它们可能以一种奇怪的方式执行，但开发 bot 时，通常不需要考虑这些。
所有常见的 JavaScript 语法都可以正常工作。

如果你已经使用了对话一段时间，本节中的大部分内容都是显而易见的。
但是，如果你是新手，其中一些内容可能会让你感到惊讶。

### 变量、分支和循环

你可以使用正常的变量在 update 之间存储数据。
你也可以使用 `if` 或 `switch` 进行分支。
通过 `for` 和 `while` 进行循环同样照常运作。

```ts
await ctx.reply("把你最爱的数字发送给我，以逗号分隔！");
const { message } = await conversation.waitFor("message:text");
const numbers = message.text.split(",");
let sum = 0;
for (const str of numbers) {
  const n = parseInt(str.trim(), 10);
  if (!isNaN(n)) {
    sum += n;
  }
}
await ctx.reply("这些数字的和是：" + sum);
```

这只是 JavaScript。

### 函数和递归

你可以将一个对话分割成多个函数。
函数可以互相调用，进行递归也不在话下。
（实际上，插件根本不知道你使用了函数。）

以下代码和上面一样，现在用函数重构了。

:::code-group

```ts [TypeScript]
/** 用以添加数字的对话 */
async function sumConvo(conversation: Conversation, ctx: Context) {
  await ctx.reply("把你最爱的数字发送给我，以逗号分隔！");
  const { message } = await conversation.waitFor("message:text");
  const numbers = message.text.split(",");
  await ctx.reply("这些数字的和是：" + sumStrings(numbers));
}

/** 转换得到的字符串为数字，然后将它们相加 */
function sumStrings(numbers: string[]): number {
  let sum = 0;
  for (const str of numbers) {
    const n = parseInt(str.trim(), 10);
    if (!isNaN(n)) {
      sum += n;
    }
  }
  return sum;
}
```

```js [JavaScript]
/** 用以添加数字的对话 */
async function sumConvo(conversation, ctx) {
  await ctx.reply("把你最爱的数字发送给我，以逗号分隔！");
  const { message } = await conversation.waitFor("message:text");
  const numbers = message.text.split(",");
  await ctx.reply("这些数字的和是：" + sumStrings(numbers));
}

/** 转换得到的字符串为数字，然后将它们相加 */
function sumStrings(numbers) {
  let sum = 0;
  for (const str of numbers) {
    const n = parseInt(str.trim(), 10);
    if (!isNaN(n)) {
      sum += n;
    }
  }
  return sum;
}
```

:::

这只是 JavaScript。

### 模块和类

JavaScript 具有高阶函数、类和其他将代码构造为模块的方法。
当然，所有这些都可以转化为对话。

以下仍然是一样的代码，通过简单的依赖注入重构为模块。

::: code-group

```ts [TypeScript]
/**
 * 这个模块可向用户请求数字，
 * 并提供一种计算用户发送的数字的方法。
 *
 * 需要注入一个对话句柄。
 */
function sumModule(conversation: Conversation) {
  /** 将所有给定的字符串转换为数字并相加 */
  function sumStrings(numbers) {
    let sum = 0;
    for (const str of numbers) {
      const n = parseInt(str.trim(), 10);
      if (!isNaN(n)) {
        sum += n;
      }
    }
    return sum;
  }

  /** 询问用户数字 */
  async function askForNumbers(ctx: Context) {
    await ctx.reply("把你最爱的数字发送给我，以逗号分隔！");
  }

  /** 等待用户发送数字，然后回复它们的和 */
  async function sumUserNumbers() {
    const ctx = await conversation.waitFor(":text");
    const sum = sumStrings(ctx.msg.text);
    await ctx.reply("这些数字的和是：" + sum);
  }

  return { askForNumbers, sumUserNumbers };
}

/** 用以添加数字的对话 */
async function sumConvo(conversation: Conversation, ctx: Context) {
  const mod = sumModule(conversation);
  await mod.askForNumbers(ctx);
  await mod.sumUserNumbers();
}
```

```js [JavaScript]
/**
 * 这个模块可向用户请求数字，
 * 并提供一种计算用户发送的数字的方法。
 *
 * 需要注入一个对话句柄。
 */
function sumModule(conversation: Conversation) {
  /** Converts all given strings to numbers and adds them up */
  function sumStrings(numbers) {
    let sum = 0;
    for (const str of numbers) {
      const n = parseInt(str.trim(), 10);
      if (!isNaN(n)) {
        sum += n;
      }
    }
    return sum;
  }

  /** 询问用户数字 */
  async function askForNumbers(ctx: Context) {
    await ctx.reply("把你最爱的数字发送给我，以逗号分隔！");
  }

  /** 等待用户发送数字，然后回复它们的和 */
  async function sumUserNumbers() {
    const ctx = await conversation.waitFor(":text");
    const sum = sumStrings(ctx.msg.text);
    await ctx.reply("这些数字的和是：" + sum);
  }

  return { askForNumbers, sumUserNumbers };
}

/** 用以添加数字的对话 */
async function sumConvo(conversation: Conversation, ctx: Context) {
  const mod = sumModule(conversation);
  await mod.askForNumbers(ctx);
  await mod.sumUserNumbers();
}
```

:::

对于像加几个数字这样简单的任务来说，这显然是杀鸡用牛刀。
然而，它说明了一个更广泛的点。

你猜对了：
这只是 JavaScript。

## 持久化对话

默认情况下，对话插件会将所有数据存储在内存中。
这也就是说，一旦进程结束，所有对话都将退出，必须重新开始。

如果你希望在服务器重启后保留数据，就需要将对话插件连接到数据库。
我们构建了 [大量存储适配器](https://github.com/grammyjs/storages/tree/main/packages#grammy-storages)，让连接数据库变得简单。
（它们和 [会话插件](./session#已知的存储适配器) 使用相同的适配器。）

我们假设你想要将数据存储在磁盘上名为 `convo-data` 的目录中。
这意味着你需要 [`FileAdapter`](https://github.com/grammyjs/storages/tree/main/packages/file#installation)。

::: code-group

```ts [Node.js]
import { FileAdapter } from "@grammyjs/storage-file";

bot.use(conversations({
  storage: new FileAdapter({ dirName: "convo-data" }),
}));
```

```ts [Deno]
import { FileAdapter } from "https://deno.land/x/grammy_storages/file/src/mod.ts";

bot.use(conversations({
  storage: new FileAdapter({ dirName: "convo-data" }),
}));
```

:::

就是这样！

你可以使用任何能够存储 [`VersionedState`](/ref/conversations/versionedstate) 类型或 [`ConversationData`](/ref/conversations/conversationdata) 数据的存储适配器。
这两种类型都可以从对话插件中导入。
换句话说，如果你想将存储提取到变量，可以使用以下类型注释。

```ts
const storage = new FileAdapter<VersionedState<ConversationData>>({
  dirName: "convo-data",
});
```

当然，相同的类型可以与任何其他存储适配器一起使用。

### 版本控制数据

如果你将对话状态保留在数据库中，然后更新源代码，则存储的数据和对话构建器函数之间会存在不匹配。
这是一种数据损坏形式，会破坏重放。

你可以通过指定代码版本来防止这种情况。
每次更改对话时，你都可以增加版本。
对话插件将检测到版本不匹配，并自动迁移所有数据。

```ts
bot.use(conversations({
  storage: {
    type: "key",
    version: 42, // 可以是数字或字符串
    adapter: storageAdapter,
  },
}));
```

如果没有指定版本，默认值是 `0`。

::: tip 忘记更改版本号了？别担心！

对话插件已经具备良好的保护措施，可以捕获大多数数据损坏情况。
如果检测到这种情况，对话内部某处会抛出错误，从而导致对话崩溃。
假设你没有捕获并抑制该错误，对话将清除损坏数据并正确重新启动。

话虽如此，这种保护措施并不能覆盖 100% 的情况，因此下次请一定要记得更新版本号。

:::

### 不可序列化的数据

[还记得](#对话存储状态) 从 [`conversation.external`](/ref/conversations/conversation#external) 返回的所有数据都将被存储。
这意味着从 `conversation.external` 返回的所有数据都必须是可序列化的。

如果你想要返回无法序列化的数据，例如类或 [`BigInt`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/BigInt)，则可以提供自定义序列化程序来修复此问题。

```ts
const largeNumber = await conversation.external({
  // 调用一个返回 BigInt（无法转换为 JSON）的 API。
  task: () => 1000n ** 1000n,
  // 将 BigInt 转换为字符串以便存储。
  beforeStore: (n) => String(n),
  // 将字符串转换回 BigInt 以便使用。
  afterLoad: (str) => BigInt(str),
});
```

如果你想从任务中抛出错误，你可以为错误对象指定额外的序列化函数。
请查看 API 参考中的 [`ExternalOp`](/ref/conversations/externalop)。

### 存储键

默认情况下，对话数据按聊天存储。
这与 [会话插件的工作方式](./session#会话键) 相同。

因此，对话无法处理来自多个聊天的 update。
如果需要，你可以 [定义自己的存储键函数](/ref/conversations/conversationoptions#storage)。
与会话一样，由于潜在的竞争条件，[不建议](./session#会话键) 在无服务器环境中使用此选项。

此外，与会话一样，你可以使用 `prefix` 选项将对话数据存储在命名空间下。
如果你想对会话数据和对话数据使用相同的存储适配器，这将特别有用。
将数据存储在命名空间中将防止发生冲突。

你可以按如下方式指定这两个选项。

```ts
bot.use(conversations({
  storage: {
    type: "key",
    adapter: storageAdapter,
    getStorageKey: (ctx) => ctx.from?.id.toString(),
    prefix: "convo-",
  },
}));
```

如果一个 ID 为 `424242` 的用户进入了一个对话，则存储键将为 `convo-424242`。

请查看 [`ConversationStorage`](/ref/conversations/conversationstorage) 的 API 参考，了解有关使用对话插件存储数据的更多详细信息。
除此之外，它还将解释如何使用 `type: "context"` 来存储数据，而无需任何存储键函数。

## 在对话中使用插件

[还记得](#对话上下文对象) 对话中的上下文对象独立于外围中间件中的上下文对象。
这意味着默认情况下对话不会安装任何插件，即使你的 bot 上安装了插件。

幸运的是，[除会话外](#在对话中访问会话)，所有 grammY 插件都与对话兼容。
例如，你可以这样为对话安装 [hydrate 插件](./hydrate)。

::: code-group

```ts [TypeScript]
// 只在外部安装对话插件。
type MyContext = ConversationFlavor<Context>;
// 只在内部安装 hydrate 插件。
type MyConversationContext = HydrateFlavor<Context>;

bot.use(conversations());

// 传递外部和内部上下文对象。
type MyConversation = Conversation<MyContext, MyConversationContext>;
async function convo(conversation: MyConversation, ctx: MyConversationContext) {
  // hydrate 插件安装在此处的 `ctx` 参数上。
  const other = await conversation.wait();
  // hydrate 插件也安装在此处的 `other` 变量上。
}
bot.use(createConversation(convo, { plugins: [hydrate()] }));

bot.command("enter", async (ctx) => {
  // hydrate 插件**没有**安装在此处的 `ctx` 上。
  await ctx.conversation.enter("convo");
});
```

```js [JavaScript]
bot.use(conversations());

async function convo(conversation, ctx) {
  // hydrate 插件安装在此处的 `ctx` 参数上。
  const other = await conversation.wait();
  // hydrate 插件也安装在此处的 `other` 变量上。
}
bot.use(createConversation(convo, { plugins: [hydrate()] }));

bot.command("enter", async (ctx) => {
  // hydrate 插件**没有**安装在此处的 `ctx` 上。
  await ctx.conversation.enter("convo");
});
```

:::

在常规 [中间件](../guide/middleware) 中，插件可以在当前上下文对象上运行一些代码，然后调用 `next` 等待下游中间件，然后它们可以再次运行一些代码。

对话不是中间件，插件不能以与中间件相同的方式与对话交互。
当对话创建 [上下文对象](#对话上下文对象) 时，它将被传递给可以正常处理它的插件。
对于插件来说，它看起来只安装了插件，不存在下游处理程序。
所有插件完成后，上下文对象可供对话使用。

因此，插件所做的任何清理工作都在对话构建器函数运行之前执行。
除了会话之外的所有插件都可以很好地与此配合使用。
如果你想使用会话，请 [向下滚动](#在对话中访问会话)。

### 默认插件

如果你有很多对话都需要同一组插件，你可以定义默认插件。
现在，你不再需要将 `hydrate` 传递给 `createConversation`。

::: code-group

```ts [TypeScript]
// TypeScript 需要两种上下文类型的帮助
// 因此你经常必须指定它们才能使用插件。
bot.use(conversations<MyContext, MyConversationContext>({
  plugins: [hydrate()],
}));
// 下面的对话将有 hydrate 安装。
bot.use(createConversation(convo));
```

```js [JavaScript]
bot.use(conversations({
  plugins: [hydrate()],
}));
// 下面的对话将有 hydrate 安装。
bot.use(createConversation(convo));
```

:::

确保在所有对话的内部上下文类型上安装所有默认插件的上下文风格。

### 在对话中使用转换器插件

如果你通过 `bot.api.config.use` 安装插件，则无法直接将其传递给 `plugins` 数组。
相反，你必须将其安装在每个上下文对象的 `Api` 实例上。
这可以从常规中间件插件中轻松完成。

```ts
bot.use(createConversation(convo, {
  plugins: [async (ctx, next) => {
    ctx.api.config.use(transformer);
    await next();
  }],
}));
```

将 `transformer` 替换为你想要安装的任何插件。
你可以在对 `ctx.api.config.use` 的同一调用中安装多个转换器。

### 在对话中访问会话

由于 [插件在对话中的工作方式](#在对话中使用插件)，[会话插件](./session) 无法像其他插件一样安装在对话中。
你无法将其传递给 `plugins` 数组，因为它会：

1. 读取数据，
2. 调用 `next`（将立即解析），
3. 写回完全相同的数据，
4. 将上下文移交给对话。

请注意在更改会话之前如何保存会话。
这意味着对会话数据的所有更改都会丢失。

相反，你可以使用 `conversation.external` 来 [访问外部上下文对象](#对话上下文对象)。
它已安装会话插件。

```ts
// 在对话内读取会话数据。
const session = await conversation.external((ctx) => ctx.session);

// 在对话内更改会话数据。
session.count += 1;

// 在对话内保存会话数据。
await conversation.external((ctx) => {
  ctx.session = session;
});
```

某种意义上，使用会话插件可以看作是执行副作用的一种方式。
毕竟，会话访问的是数据库。
鉴于我们必须遵循 [黄金法则](#对话的黄金法则)，会话访问必须要包装在 `conversation.external` 中。

## 对话式菜单

你可以在对话外使用 [菜单插件](./menu) 定义菜单，然后将其传递给 `plugins` 数组，[就像任何其他插件一样](#在对话中使用插件)。

但是，这意味着菜单无法在其按钮处理程序中访问对话句柄 `conversation`。
因此，你无法在菜单内部等待 update。

理想情况下，单击按钮时，应该可以等待用户发送消息，然后在用户回复时执行菜单导航。
这可以通过 `conversation.menu()` 实现。
它允许你定义 _对话式菜单_。

```ts
let email = "";

const emailMenu = conversation.menu()
  .text("获取当前邮箱", (ctx) => ctx.reply(email || "空"))
  .text(() => email ? "更改邮箱" : "设置邮箱", async (ctx) => {
    await ctx.reply("你的邮箱是什么？");
    const response = await conversation.waitFor(":text");
    email = response.msg.text;
    await ctx.reply(`你的邮箱是 ${email}!`);
    ctx.menu.update();
  })
  .row()
  .url("关于", "https://grammy.dev");

const otherMenu = conversation.menu()
  .submenu("打开邮箱菜单", emailMenu, async (ctx) => {
    await ctx.reply("正在导航");
  });

await ctx.reply("你的菜单在此", {
  reply_markup: otherMenu,
});
```

`conversation.menu()` 返回一个菜单，可以通过添加按钮来构建，方式与菜单插件相同。
事实上，如果你查看 API 参考中的 [`ConversationMenuRange`](/ref/conversations/conversationmenurange)，你会发现它与菜单插件中的 [`MenuRange`](/ref/menu/menurange) 非常相似。

对话菜单仅在对话处于活跃状态时保持活跃状态。
你应该在退出对话之前为所有菜单调用 `ctx.menu.close()`。

如果你想阻止对话退出，你只需在对话结束时使用以下代码片段即可。
但是，[别忘了](#对话存储状态) 让你的对话永远存在不是一个好主意。

```ts
// 永远等待。
await conversation.waitUntil(() => false, {
  otherwise: (ctx) => ctx.reply("请使用上方的菜单！"),
});
```

最后，请注意，对话菜单保证永远不会干扰外部菜单。
换句话说，外部菜单永远不会处理对话内部菜单的 update，反之亦然。

### 菜单插件互操作性

当你在对话之外定义菜单并使用它进入对话时，你可以定义一个对话菜单，只要对话处于活跃状态，该菜单就会接管。
而在对话完成后，外部菜单将再次接管控制权。

你首先必须为两个菜单提供相同的菜单标识符。

```ts
// 在对话外 (菜单插件)：
const menu = new Menu("my-menu");
// 在对话内 (对话插件)：
const menu = conversation.menu("my-menu");
```

为了使其正常工作，你必须确保在将控制权转入或转出对话时，两个菜单具有完全相同的结构。
否则，单击按钮时，菜单将被 [检测为过时](./menu#过时的菜单和指纹)，并且不会调用按钮处理程序。

结构基于以下两点。

- 菜单的形状（行数或每个行中的按钮数）。
- 按钮上的标签。

通常建议你在进入对话时，首先将菜单编辑为在对话中有意义的样子。
随后，对话可以定义一个匹配的菜单，该菜单将立即处于活跃状态。

类似地，如果对话留下任何菜单（通过不关闭它们），外部菜单可以再次接管控制。
同样，菜单的结构必须匹配。

这种互操作性的示例可以在 [示例 bot 仓库](https://github.com/grammyjs/examples?tab=readme-ov-file#menus-with-conversation-menu-with-conversation) 中找到。

## 对话表单

对话通常用于在聊天界面中构建表单。

所有 wait 调用都会返回上下文对象。
但是，当你等待文本消息时，你可能只想获取消息文本，而不与其余上下文对象交互。

对话表单为你提供了一种将 update 验证与从上下文对象中提取数据相结合的方法。
这类似于表单中的字段。
请看以下示例。

```ts
await ctx.reply("请发送一张要缩放的图片！");
const photo = await conversation.form.photo();
await ctx.reply("图片要缩放到多大宽度？");
const width = await conversation.form.int();
await ctx.reply("图片要缩放到多大高度？");
const height = await conversation.form.int();
await ctx.reply(`正在缩放图片到 ${width}x${height} ...`);
const scaled = await scaleImage(photo, width, height);
await ctx.replyWithPhoto(scaled);
```

还有更多可用的表单字段。
请查看 API 参考中的 [`ConversationForm`](/ref/conversations/conversationform#methods)。

所有表单字段都接收 `otherwise` 函数，该函数将在收到不匹配的 update 时运行。
此外，它们都接收 `action` 函数，该函数将在表单字段填写正确时运行。

```ts
// 等待一个基础运算操作。
const op = await conversation.form.select(["+", "-", "*", "/"], {
  action: (ctx) => ctx.deleteMessage(),
  otherwise: (ctx) => ctx.reply("请使用 +, -, * 或 /！"),
});
```

对话表单甚至允许你通过 [`conversation.form.build`](/ref/conversations/conversationform#build) 构建自定义表单字段。

## 等待超时

每次等待 update 时，你都可以传递一个超时值。

```ts
// 在退出对话前，等待一小时时间。
const oneHourInMilliseconds = 60 * 60 * 1000;
await conversation.wait({ maxMilliseconds: oneHourInMilliseconds });
```

当到达 wait 调用时，[`conversation.now()`](#对话的黄金法则) 将被调用。

下一次 update 到达后，将再次调用 `conversation.now()`。
如果 update 花费的时间超过 `maxMilliseconds`，对话将停止，update 将返回到中间件系统。
任何下游中间件将被调用。

这样看起来，对话似乎在 update 到达时已经不再处于活跃状态。

请注意，这实际上不会在指定的时间之后运行任何代码。
相反，代码只会在下一次 update 到达时运行。

你可以为对话内的所有 wait 调用指定默认超时值。

```ts
// 始终只等待一小时。
const oneHourInMilliseconds = 60 * 60 * 1000;
bot.use(createConversation(convo, {
  maxMillisecondsToWait: oneHourInMilliseconds,
}));
```

给 wait 调用直接传值将覆盖此默认值。

## 进入和退出事件

你可以指定一个回调函数，该函数在进入对话时调用。
同样也可以指定一个回调函数在退出对话时调用。

```ts
bot.use(conversations({
  onEnter(id, ctx) {
    // 进入了对话 `id`。
  },
  onExit(id, ctx) {
    // 退出了对话 `id`。
  },
}));
```

每个回调都会收到两个值。
第一个值是进入或退出对话的标识符。
第二个值是外围中间件的当前上下文对象。

请注意，只有通过 `ctx.conversation` 进入或退出对话时才会调用回调。
当对话通过 `conversation.halt` 自行终止或 [超时](#等待超时) 时，也会调用 `onExit` 回调。

## 并发等待调用

你可以使用浮动 `promise` 同时等待几件事。
当有新 update 到达时，只有第一个匹配的 wait 调用会解析。

```ts
await ctx.reply("发送一张图片以及描述!");
const [textContext, photoContext] = await Promise.all([
  conversation.waitFor(":text"),
  conversation.waitFor(":photo"),
]);
await ctx.replyWithPhoto(photoContext.msg.photo.at(-1).file_id, {
  caption: textContext.msg.text,
});
```

在上面的例子中，用户先发送照片还是先发送文本并不重要。
两个 `Promise` 都将按照用户发送代码正在等待的两条消息的顺序解析。
[`Promise.all`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) 正常工作，只有当所有传递的承诺都解析后，它才会解析。

这也可用于等待不相关的事情。
例如，以下是在对话中安装全局退出侦听器的方法。

```ts
conversation.waitForCommand("exit") // 没有 await！
  .then(() => conversation.halt());
```

一旦对话 [以任何方式结束](#退出对话)，所有待处理的 `wait` 调用都将被丢弃。
例如，以下对话将在进入后立即完成，而无需等待任何 update。

::: code-group

```ts [TypeScript]
async function convo(conversation: Conversation, ctx: Context) {
  const _promise = conversation.wait() // 没有 await！
    .then(() => ctx.reply("这条消息永远不会发送！"));

  // 对话在进入后立即就完成了。
}
```

```js [JavaScript]
async function convo(conversation, ctx) {
  const _promise = conversation.wait() // 没有 await！
    .then(() => ctx.reply("这条消息永远不会发送！"));

  // 对话在进入后立即就完成了。
}
```

:::

在内部，当多个 wait 调用同时到达时，对话插件将跟踪 wait 调用列表。
下一次 update 到达后，它将为每个遇到的 wait 调用重放一次对话构建器函数，直到其中一个接受了 update。
仅当所有待处理的 wait 调用均未接受 update 时，才会丢弃 update。

## 检查点和回溯时间

对话插件 [跟踪](#对话是重放引擎) 对话构建器函数的执行情况。

这允许你沿途创建一个检查点。
检查点包含有关该函数迄今为止运行程度的信息。
它可用于稍后跳回到此点。

当然，在此期间执行的任何 IO 都不会撤消。
特别是，倒回到检查点不会神奇地取消发送任何消息。

```ts
const checkpoint = conversation.checkpoint();

// 稍后：
if (ctx.hasCommand("reset")) {
  await conversation.rewind(checkpoint); // 从不会 return
}
```

检查点对于“返回”非常有用。
但是，就像 JavaScript 的带有 [标签](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/label) 的 `break` 和 `continue` 一样，跳转会使代码的可读性降低。
**请不要过度使用此功能。**

在内部，倒回对话会像 wait 调用一样中止执行，然后仅重放函数直到创建检查点的位置。
倒回对话实际上并不是反向执行函数，尽管感觉是这样。

## 并行对话

不相关聊天中的对话完全独立，并且始终可以并行运行。

但是，默认情况下，每个聊天始终只能有一个活跃对话。
如果你尝试在一个对话已处于活跃状态时进入对话，则 `enter` 调用将抛出一个错误。

你可以通过将对话标记为并行来更改此行为。

```ts
bot.use(createConversation(convo, { parallel: true }));
```

这改变了两件事。

首先，即使相同或不同的对话已经处于活跃状态，你现在也可以进入此对话。
例如，如果你有对话 `captcha` 和 `settings`，你可以让 `captcha` 处于活跃状态五次，让 `settings` 处于活跃状态十二次，所有这些都在同一个聊天中。

其次，当对话不接受 update 时，默认情况下不再丢弃 update。
相反，控制权交还给中间件系统。

所有已安装的对话都将有机会处理传入的 update，直到其中一个接受它。
但是，只有一个对话能够真正处理 update。

当多个不同的对话同时处于活跃状态时，中间件顺序将确定哪个对话首先处理 update。
当单个对话多次处于活跃状态时，最早的对话（最先进入的对话）将首先处理 update。

最好通过一个例子来说明这一点。

::: code-group

```ts [TypeScript]
async function captcha(conversation: Conversation, ctx: Context) {
  const user = ctx.from!.id;
  await ctx.reply("欢迎加入聊天！世界上最棒的 bot 框架是哪个？");
  const answer = await conversation.waitFor(":text").andFrom(user);
  if (answer.msg.text === "grammY") {
    await ctx.reply("回答正确！你的路走宽了！");
  } else {
    await ctx.banAuthor();
  }
}

async function settings(conversation: Conversation, ctx: Context) {
  const user = ctx.from!.id;
  const main = conversation.checkpoint();
  const options = ["聊天设置", "关于", "隐私"];
  await ctx.reply("欢迎来到设置！", {
    reply_markup: Keyboard.from(options
      .map((btn) => [Keyboard.text(btn)])),
  });
  const option = await conversation.waitFor(":text")
    .andFrom(user)
    .and((ctx) => options.includes(ctx.msg.text), {
      otherwise: (ctx) => ctx.reply("请使用按钮！"),
    });
  await openSettingsMenu(option, main);
}

bot.use(createConversation(captcha));
bot.use(createConversation(settings));
```

```js [JavaScript]
async function captcha(conversation, ctx) {
  const user = ctx.from.id;
  await ctx.reply("欢迎加入聊天！世界上最棒的 bot 框架是哪个？");
  const answer = await conversation.waitFor(":text").andFrom(user);
  if (answer.msg.text === "grammY") {
    await ctx.reply("回答正确！你的路走宽了！");
  } else {
    await ctx.banAuthor();
  }
}

async function settings(conversation, ctx) {
  const user = ctx.from.id;
  const main = conversation.checkpoint();
  const options = ["聊天设置", "关于", "隐私"];
  await ctx.reply("欢迎来到设置！", {
    reply_markup: Keyboard.from(options
      .map((btn) => [Keyboard.text(btn)])),
  });
  const option = await conversation.waitFor(":text")
    .andFrom(user)
    .and((ctx) => options.includes(ctx.msg.text), {
      otherwise: (ctx) => ctx.reply("请使用按钮！"),
    });
  await openSettingsMenu(option, main);
}

bot.use(createConversation(captcha));
bot.use(createConversation(settings));
```

:::

上述代码适用于群组。
它提供了两个对话：
对话 `captcha` 用于确保只有优秀的开发人员才能加入聊天（这 grammY 插件脸都不要了~）。
对话 `settings` 用于在群组中实现设置菜单。

请注意，所有的 wait 调用都会基于用户标识符以及其他条件进行筛选。

让我们假设发生了以下情况。

1. 你在处理来自标识符为 `ctx.from.id === 42` 的用户的 update 时，调用 `ctx.conversation.enter("captcha")` 进入了对话 `captcha`。
2. 你在处理来自标识符为 `ctx.from.id === 3` 的用户的 update 时，调用 `ctx.conversation.enter("settings")` 进入了对话 `settings`。
3. 你在处理来自标识符为 `ctx.from.id === 43` 的用户的 update 时，调用 `ctx.conversation.enter("captcha")` 进入了对话 `captcha`。

这意味着现在此群组中有三个对话处于活跃状态——`captcha` 处于活跃状态两次，`settings` 处于活跃状态一次。

> 请注意，即使启用了并行对话，`ctx.conversation` 也提供了[各种方式](/ref/conversations/conversationcontrols#exit) 退出特定对话。

接下来，以下事件按顺序发生。

1. 用户 `3` 发送包含文本 `"关于"` 的消息。
2. 一个带有文本消息的 update 到达。
3. 对话 `captcha` 的第一个实例被重放。
4. `waitFor(":text")` 文本调用接受 update，但添加的 filter `andFrom(42)` 拒绝 update。
5. 对话 `captcha` 的第二个实例被重放。
6. `waitFor(":text")` 文本调用接受 update，但添加的 filter `andFrom(43)` 拒绝 update。
7. 所有 `captcha` 实例都拒绝 update，因此控制权交还给中间件系统。
8. 重放对话 `settings` 的实例。
9. wait 调用解析，`option` 将包含文本消息 update 的上下文对象。
10. `openSettingsMenu` 被调用。
    它可以向用户发送关于文本，并将对话倒回 `main`，重新启动菜单。

请注意，即使两个对话都在等待用户 `42` 和 `43` 完成验证，bot 也会正确回复已启动设置菜单的用户 `3`。
经过过滤的 wait 调用可以确定哪些 update 与当前对话相关。
被 wait 调用忽略的 update 会继续被其他对话处理，并可能被其他对话接收。

上述示例使用群组来说明对话如何在同一聊天中同时处理多个用户。
实际上，并行对话适用于所有聊天。
因此你也可以在与单个用户的聊天中等待不同的事情。

你可以将并行对话与 [等待超时](#等待超时) 结合使用，以保持较低数量的活跃对话。

## 检查活跃对话

在中间件中，你可以检查哪些对话处于活跃状态。

```ts
bot.command("stats", (ctx) => {
  const convo = ctx.conversation.active("convo");
  console.log(convo); // 0 或 1
  const isActive = convo > 0;
  console.log(isActive); // false 或 true
});
```

当你将对话标识符传递给 `ctx.conversation.active` 时，如果此对话处于活跃状态，它将返回 `1`，否则返回 `0`。

如果你为对话启用 [并行对话](#并行对话)，它将返回此对话当前处于活跃的次数。

调用不带参数的 `ctx.conversation.active()` 以接收包含所有活跃对话的标识符作为键的对象。
相应的值描述每个对话中有多少个实例处于活跃状态。

如果对话 `captcha` 处于活跃状态两次，对话 `settings` 处于活跃状态一次，则 `ctx.conversation.active()` 将按如下方式工作。

```ts
bot.command("stats", (ctx) => {
  const stats = ctx.conversation.active();
  console.log(stats); // { captcha: 2, settings: 1 }
});
```

## 从 1.x 迁移到 2.x

对话插件 2.0 是完全从头开始重写的。

尽管 API 层面的基本概念保持不变，但这两种实现在底层操作方式上存在根本区别。
简而言之，从 1.x 迁移到 2.x 几乎不需要对代码进行任何调整，但需要删除所有存储的数据。
因此，所有对话都将重新启动。

### 从 1.x 到 2.x 的数据迁移

从 1.x 升级到 2.x 时，无法保持对话的当前状态。

你应该从会话中删除相应的数据。
可以考虑使用 [会话迁移](./session#迁移) 来实现这一点。

可以按照 [此处](#持久化对话) 所述保存 2.x 版本的对话数据。

### 1.x 和 2.x 之间的类型变化

在 1.x 中，对话中的上下文类型与外围中间件中使用的上下文类型相同。

在 2.x 中，你现在必须始终声明两种上下文类型——[外部上下文类型和内部上下文类型](#对话上下文对象)。
这些类型永远不能相同，如果相同，则你的代码中存在 bug。
这是因为外部上下文类型必须始终安装 [`ConversationFlavor`](/ref/conversations/conversationflavor)，而内部上下文类型永远不能安装它。

此外，你现在可以为每个对话安装一组 [独立的插件](#在对话中使用插件)。

### 1.x 和 2.x 之间的会话访问变化

你不能再使用 `conversation.session`。
相反，你必须使用 `conversation.external` 完成操作。

```ts
// 读取会话数据。
const session = await conversation.session; // [!code --]
const session = await conversation.external((ctx) => ctx.session); // [!code ++]

// 写入会话数据。
conversation.session = newSession; // [!code --]
await conversation.external((ctx) => { // [!code ++]
  ctx.session = newSession; // [!code ++]
}); // [!code ++]
```

> 在 1.x 中可以访问 `ctx.session`，但总是不正确。
> 在 2.x 中 `ctx.session` 不再可用。

### 1.x 和 2.x 之间的插件兼容性变化

对话 1.x 几乎不与任何插件兼容。
使用 `conversation.run` 可以实现一定的兼容性。

此选项已在 2.x 中删除。
相反，你现在可以将插件传递给 `plugins` 数组，如 [此处](#在对话中使用插件) 所述。
会话需要 [特殊处理](#_1-x-和-2-x-之间的会话访问变化)。
自从引入 [对话菜单](#对话式菜单) 以来，菜单的兼容性得到了改善。

### 1.x 和 2.x 之间的并行对话变化

并行对话在 1.x 和 2.x 中的工作方式相同。

但是，如果意外使用此功能，则经常会引起混淆。
在 2.x 中，你需要通过指定 `{ parallel: true }` 来选择加入此功能，如 [此处](#并行对话) 所述。

此功能的唯一重大变化是默认情况下 update 不再传递回中间件系统。
相反，这仅在对话标记为并行时才执行。

请注意，所有等待方法和表单字段都提供了一个选项 `next` 来覆盖默认行为。
此选项重命名自 1.x 中的 `drop`，并且标志的语义也相应地反转。

### 1.x 和 2.x 之间的表单变化

1.x 中的表单实质上是损坏的。
例如，即使对于旧消息的 `edited_message` update，`conversation.form.text()` 也会返回文本消息。
许多这些奇怪的事情已在 2.x 中得到更正。

从技术上讲，修复错误不算重大更改，但它仍然是行为上的重大变化。

## 插件概述

- 名称：`conversations`
- [源码](https://github.com/grammyjs/conversations)
- [参考](/ref/conversations/)
