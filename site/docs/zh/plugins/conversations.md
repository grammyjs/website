# 对话 (`conversations`)

轻松创建强大的对话界面。

## 介绍

大部分聊天都是多条消息组成的。

比如说，你可能想问用户一个问题，然后等待用户的回应。
这可能还会重复几次，从而展开一场对话。

当你考虑到 [中间件](../guide/middleware.md) 时，你会发现中间件的所有处理逻辑都是围绕着一个 [上下文对象](../guide/context.md)。
这意味着你每次只能孤立地处理一条消息。
所以要写出“检查三条消息之前的内容”之类的东西会很麻烦。

**这个插件能帮助你:**
它提供了一种极其灵活的方式来定义你的 bot 和用户之间的对话。

许多 bot 框架会让你定义大量的配置对象，包括步骤，阶段，跳转，向导流程等等。
这会导致大量的模版代码，让你很难跟上它的开发路径。
**这个插件不会以这样的方式工作。**

相反，通过这个插件，你将使用更强大的东西：**代码**。
基本上，你只需要定义一个普通的用于描述对话演变过程的 JavaScript 函数。
当 bot 和用户进行交谈时，这个函数将被逐条语句执行。

（公平地说，这并不是它真正的工作原理。
但这样思考有助于你理解和使用这个插件！
在实际情况中，函数的执行方式会有一点不同,但我们会在 [后面](#waiting-for-updates) 讨论这个问题。）

## 简单样例

在我们深入探讨如何创建对话之前，先通过一个简短的 JavaScript 的例子，看看一个对话会是什么样子。

```js
async function greeting(conversation, ctx) {
  await ctx.reply("你好！你叫什么名字？");
  const { message } = await conversation.wait();
  await ctx.reply(`欢迎加入聊天, ${message.text}!`);
}
```

在这个对话中，bot 会先问候用户，并询问他们的名字。
然后它会一直等待，知道用户发出他们的名字。
最后，bot 会欢迎用户加入聊天，并且重复用户的名字。

非常简单，对吗？
让我们看看它是怎么做到的！

## 对话生成器函数

首先，让我们导入几样东西。

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const {
  conversations,
  createConversation,
} = require("@grammyjs/conversations");
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations/mod.ts";
```

</CodeGroupItem>
</CodeGroup>

有了这些方法，我们现在可以看一下怎么定义对话式界面。

对话的主要元素是一个带有两个参数的函数。
我们称其为_对话生成器函数_

```js
async function greeting(conversation, ctx) {
  // TODO: 编写对话
}
```

让我们来看看这两个参数分别是什么。

**第二个参数**不是什么新奇的东西，它只是一个普通的上下文对象。
一如既往，它被称为 `ctx`，并使用你的 [自定义上下文类型](../guide/context.md#定制你的上下文对象)（可能称为 `MyContext`）。

**第一个参数**是这个插件的核心元素。
它通常被命名为 `conversation`，它的类型是 `Conversation`（[API 参考](https://deno.land/x/grammy_conversations/mod.ts?s=Conversation)）。
它可以用于控制对话，比如等待用户输入等等。
`Conversation` 类型会希望你使用你的 [自定义上下文类型](../guide/context.md#定制你的上下文对象) 作为它的类型参数，所以你通常会用的的是 `Conversation<MyContext>`。

综上所述，在 TypeScript 中，你的对话生成器函数将看起来像这样。

```ts
type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

async function greeting(conversation: MyConversation, ctx: MyContext) {
  // TODO: 编写对话
}
```

你现在可以在你的对话生成器函数中定义对话了。
在我们深入了解这个插件的每个功能之前，让我们看一下比上面的 [简单样例](#简单样例) 更复杂的例子。

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function movie(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("你有多少部最喜欢的电影？");
  const count = await conversation.form.number();
  const movies: string[] = [];
  for (let i = 0; i < count; i++) {
    await ctx.reply(`告诉我第 ${i + 1} 名！`);
    const titleCtx = await conversation.waitFor(":text");
    movies.push(titleCtx.msg.text);
  }
  await ctx.reply("这里有一个更好的排名！");
  movies.sort();
  await ctx.reply(movies.map((m, i) => `${i + 1}. ${m}`).join("\n"));
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function movie(conversation, ctx) {
  await ctx.reply("你有多少部最喜欢的电影？");
  const count = await conversation.form.number();
  const movies = [];
  for (let i = 0; i < count; i++) {
    await ctx.reply(`告诉我第 ${i + 1} 名！`);
    const titleCtx = await conversation.waitFor(":text");
    movies.push(titleCtx.msg.text);
  }
  await ctx.reply("这里有一个更好的排名！");
  movies.sort();
  await ctx.reply(movies.map((m, i) => `${i + 1}. ${m}`).join("\n"));
}
```

</CodeGroupItem>
</CodeGroup>

你能想象的出来这个 bot 将会怎样工作吗？

## 安装并进入对话

首先，如果你想使用对话插件，你**必须**使用 [会话插件](./session.md)。
你还必须安装对话插件本身，然后你才能在 bot 上注册单的的对话。

```ts
// 安装会话插件。
bot.use(session({
  initial() {
    // 暂时返回一个空对象
    return {};
  },
}));

// 安装对话插件。
bot.use(conversations());
```

接下来，你可以把对话生成器函数包装在 `createConversation` 中作为中间件安装在你的 bot 对象上。

```ts
bot.use(createConversation(greeting));
```

现在，你的对话已经注册到了 bot 上，你可以从任意处理程序中进入对话。
请确保在 `ctx.conversation` 上的所有方法都使用 `await` ---否则你的代码会崩溃。

```ts
bot.command("start", async (ctx) => {
  await ctx.conversation.enter("greeting");
});
```

只要用户向 bot 发送 `/start`，用户就会进入对话。
当前的上下文对象作为第二个参数传入对话生成器函数。
举个例子，如果你用 `await ctx.reply(ctx.message.text)` 开始对话，它将包含 `/start` 在内的 update。

::: tip 改变对话标识符

默认情况下，你必须向 `ctx.conversation.enter()` 传入函数的名称。
然而，如果你喜欢使用一个不同的标识符，你可以这样指定它：

```ts
bot.use(createConversation(greeting, "new-name"));
```

然后，你可以用下面的方式进入对话：

```ts
bot.command("start", (ctx) => ctx.conversation.enter("new-name"));
```

:::

总的来说，你的代码现在应该看起来像这样：

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context, session } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

const bot = new Bot<MyContext>("");

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

/** 定义对话 */
async function greeting(conversation: MyConversation, ctx: MyContext) {
  // TODO: 编写对话
}

bot.use(createConversation(greeting));

bot.command("start", async (ctx) => {
  // 进入你声明的 “greeting” 函数
  await ctx.conversation.enter("greeting");
});

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { Bot, Context, session } = require("grammy");
const {
  conversations,
  createConversation,
} = require("@grammyjs/conversations");

const bot = new Bot("");

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

/** 定义对话 */
async function greeting(conversation, ctx) {
  // TODO: 编写对话
}

bot.use(createConversation(greeting));

bot.command("start", async (ctx) => {
  // 进入你声明的 “greeting” 函数
  await ctx.conversation.enter("greeting");
});

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot, Context, session } from "https://deno.land/x/grammy/mod.ts";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations/mod.ts";

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

const bot = new Bot<MyContext>("");

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

/** 定义对话 */
async function greeting(conversation: MyConversation, ctx: MyContext) {
  // TODO: 编写对话
}

bot.use(createConversation(greeting));

bot.command("start", async (ctx) => {
  // 进入你声明的 “greeting” 函数
  await ctx.conversation.enter("greeting");
});

bot.start();
```

</CodeGroupItem>
</CodeGroup>

### 使用自定义会话数据进行安装

请注意，如果你在使用 TypeScript，并且想要使用对话的时候存储自己的会话数据，你需要向编译器提供更多的类型信息。
假设你有一个描述了你的自定义会话数据的接口：

```ts
interface SessionData {
  /** 自定义会话属性 */
  foo: string;
}
```

你的自定义上下文类型会像这样：

```ts
type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor;
```

最重要的是，当你使用外部存储安装会话插件时，你必须明确地提供会话数据。
所有的存储适配器都允许你把 `SessionData` 作为一个类型参数传入。
举个例子，你需要按照下面的代码来使用 grammY 提供的 [`freeStorage`](./session.md#免费存储)

```ts
// 安装会话插件。
bot.use(session({
  // 向适配器添加会话类型。
  storage: freeStorage<SessionData>(bot.token),
  initial: () => ({ foo: "" }),
}));
```

其他存储适配器也是一样的，比如 `new FileAdapter<SessionData>()` 等等。

### 多会话安装

当然，你可以将对话与 [多会话](./session.md#多会话) 结合起来。

这个插件将对话数据存储在 `session.conversation` 中。
这意味着如果你想使用多会话，你必须指定这个片段。

```ts
// 安装会话插件。
bot.use(session({
  type: "multi",
  custom: {
    initial: () => ({ foo: "" }),
  },
  conversation: {}, // 可以留空
}));
```

这样，你可以将对话数据存储在与其他会话数据不同的位置。
例如，如果你将对话配置留空，如上图所示，对话插件会将所有数据存储在内存中。

## 离开对话

对话将一直运行到你的对话生成器函数完成。
也就是说你可以简单地通过使用 `return` 离开一个对话。

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function hiAndBye(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Hi! And Bye!");
  // 离开对话：
  return;
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function hiAndBye(conversation, ctx) {
  await ctx.reply("Hi! And Bye!");
  // 离开对话：
  return;
}
```

</CodeGroupItem>
</CodeGroup>

（当然了，在函数的末尾放一个 `return` 有点没有意义，但这是一个让你用于理解离开对话的例子）

抛出错误同样会退出对话。
但是，[会话插件](#安装并进入对话) 只有在中间件成功运行时才会保留数据。
因此，如果你在对话中抛出错误并且在它到达会话插件之前没有捕获它，则在对话离开时不会被保存。
结果就是，下一条消息将导致相同的错误。

你可以通过在会话和对话之间安装 [error 边界](../guide/errors.md#error边界) 来缓解这种情况。
这样，你可以防止错误沿着 [中间件树](../advanced/middleware.md) 向上传播，从而允许会话插件写回数据。

> 请注意，如果你使用默认的内存会话，会话数据的所有更改都会立即反映出来，因为没有存储后端。
> 在那种情况下，你不需要使用 error 边界通过抛出错误来离开对话。

这就是 error 边界和对话一起使用的方式。

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
bot.use(session({
  storage: freeStorage(bot.token), // 修改这里
  initial: () => ({}),
}));
bot.use(conversations());

async function hiAndBye(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Hi! And Bye!");
  // 离开对话
  throw new Error("Catch me if you can!");
}

bot.errorBoundary(
  (err) => console.error("Conversation threw an error!", err),
  createConversation(greeting),
);
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
bot.use(session({
  storage: freeStorage(bot.token), // 修改这里
  initial: () => ({}),
}));
bot.use(conversations());

async function hiAndBye(conversation, ctx) {
  await ctx.reply("Hi! And Bye!");
  // 离开对话
  throw new Error("Catch me if you can!");
}

bot.errorBoundary(
  (err) => console.error("Conversation threw an error!", err),
  createConversation(greeting),
);
```

</CodeGroupItem>
</CodeGroup>

无论你做什么，你都应该记得在你的机器人上 [安装错误处理程序](../guide/errors.md)。

如果你想在等待用户输入时从常规中间件中强制终止对话，你还可以使用 `await ctx.conversation.exit()`。
这只会从会话中删除对话插件的数据。
通常情况下，简单地从函数返回来进行退出时更好的做法，但在一些情况中，使用 `await ctx.conversation.exit()` 更方便。
请记住，你必须 `await` 这个调用。

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts{6,20}
async function movie(conversation: MyConversation, ctx: MyContext) {
  // TODO: 编写对话
}

// 安装对话插件。
bot.use(conversations());

// 始终在 /cancel 时退出任意对话
bot.command("cancel", async (ctx) => {
  await ctx.conversation.exit();
  await ctx.reply("Leaving.");
});

// 始终在按下按钮后退出 `movie` 对话
// 当按下inline keyboard 的 `cancel` 按钮时。
bot.callbackQuery("cancel", async (ctx) => {
  await ctx.conversation.exit("movie");
  await ctx.answerCallbackQuery("Left conversation");
});

bot.use(createConversation(movie));
bot.command("movie", (ctx) => ctx.conversation.enter("movie"));
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js{6,20}
async function movie(conversation, ctx) {
  // TODO: 编写对话
}

// 安装对话插件。
bot.use(conversations());

// 始终在 /cancel 时退出任意对话
bot.command("cancel", async (ctx) => {
  await ctx.conversation.exit();
  await ctx.reply("Leaving.");
});

// 始终在按下按钮后退出 `movie` 对话
// 当按下inline keyboard 的 `cancel` 按钮时。
bot.callbackQuery("cancel", async (ctx) => {
  await ctx.conversation.exit("movie");
  await ctx.answerCallbackQuery("Left conversation");
});

bot.use(createConversation(movie));
bot.command("movie", (ctx) => ctx.conversation.enter("movie"));
```

</CodeGroupItem>
</CodeGroup>

请注意，这里的顺序很重要。
你必须先安装对话插件（第 6 行），然后才能调用 `await ctx.conversation.exit()`。
此外，在实际的对话被注册之前，必须安装通用的取消处理程序（第 21 行）。

## 等待 Updates

你可以使用对话的处理程序 `conversation` 来等待特定聊天的下一个 update。

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function waitForMe(conversation: MyConversation, ctx: MyContext) {
  // 等待下一个 update：
  const newContext = await conversation.wait();
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function waitForMe(conversation, ctx) {
  // 等待下一个 update：
  const newContext = await conversation.wait();
}
```

</CodeGroupItem>
</CodeGroup>

一个 update 可以意味着用户发送了一条文本消息，或者按下了一个按钮，或者编辑了一些东西，或者是任何其他用户执行的动作。
请在 [这里](https://core.telegram.org/bots/api#update) 参考 Telegram 官方文档。

`wait` 方法总是产生一个新的 [上下文对象](../guide/context.md) 表示接收到的 update。
这意味着你总是要处理与对话期间收到的 update 一样多的上下文对象。

<CodeGroup>
<CodeGroupItem title="TypeScript" active>

```ts
const TEAM_REVIEW_CHAT = -1001493653006;
async function askUser(conversation: MyConversation, ctx: MyContext) {
  // 向用户询问他们的家庭住址
  await ctx.reply("Could you state your home address?");

  // 等待用户发送他们的地址
  const userHomeAddressContext = await conversation.wait();

  // 询问用户的国籍
  await ctx.reply("Could you also please state your nationality?");

  // 等待用户声明他们的国籍
  const userNationalityContext = await conversation.wait();

  await ctx.reply(
    "That was the final step. Now that I have received all relevant information, I will forward them to our team for review. Thank you!",
  );

  // 我们现在将回复复制到另一个聊天以供审核
  await userHomeAddressContext.copyMessage(TEAM_REVIEW_CHAT);
  await userNationalityContext.copyMessage(TEAM_REVIEW_CHAT);
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const TEAM_REVIEW_CHAT = -1001493653006;
async function askUser(conversation, ctx) {
  // 向用户询问他们的家庭住址
  await ctx.reply("Could you state your home address?");

  // 等待用户发送他们的地址
  const userHomeAddressContext = await conversation.wait();

  // 询问用户的国籍
  await ctx.reply("Could you also please state your nationality?");

  // 等待用户声明他们的国籍
  const userNationalityContext = await conversation.wait();

  await ctx.reply(
    "That was the final step. Now that I have received all relevant information, I will forward them to our team for review. Thank you!",
  );

  // 我们现在将回复复制到另一个聊天以供审核
  await userHomeAddressContext.copyMessage(TEAM_REVIEW_CHAT);
  await userNationalityContext.copyMessage(TEAM_REVIEW_CHAT);
}
```

</CodeGroupItem>
</CodeGroup>

通常，在对话插件之外，这些 update 都是由你的 bot 的 [中间件系统](../guide/middleware.md) 处理的。
因此，你的 bot 将通过一个上下文对象来处理这些 update，这个上下文对象会被传递给你的处理程序。

在对话中，你可以从 `wait` 调用中获取到这个新的上下文对象。
然后，你可以根据这个对象以不同的方式处理不同的 update。
例如，你可以检查文本消息：

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function waitForText(conversation: MyConversation, ctx: MyContext) {
  // 等待下一个 update：
  ctx = await conversation.wait();
  // 检查文本消息：
  if (ctx.message?.text) {
    // ...
  }
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function waitForText(conversation, ctx) {
  // 等待下一个 update：
  ctx = await conversation.wait();
  // 检查文本消息：
  if (ctx.message?.text) {
    // ...
  }
}
```

</CodeGroupItem>
</CodeGroup>

此外，在 `wait` 之外，还有一些其他方法，可以等待特定的 update。
其中一个例子是 `waitFor`，它接受一个 [过滤器查询](../guide/filter-queries.md)，然后只等待匹配这个查询的 update。
这与 [对象解构赋值](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) 结合使用非常强大：

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function waitForText(conversation: MyConversation, ctx: MyContext) {
  // 等待下一个文本消息的 update：
  const { msg: { text } } = await conversation.waitFor("message:text");
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function waitForText(conversation, ctx) {
  // 等待下一个文本消息的 update：
  const { msg: { text } } = await conversation.waitFor("message:text");
}
```

</CodeGroupItem>
</CodeGroup>

通过 [API 参考](https://deno.land/x/grammy_conversations/mod.ts?s=ConversationHandle#method_wait_0) 来查看所有与 `wait` 类似的方法。

## 对话的三条黄金法则

这里有三条适用于你的对话生成器函数中的代码的规则，
如果你想你的代码正常工作，你必须遵循它们。

如果你想知道更多这些规则的 _秘密_，以及 `wait` 调用真正的作用，请 [向下](#how-it-works)滚动。

### 规则一：所有副作用必须被封装

依赖于外部系统的代码，例如数据库、API、文件、或其他资源，在一次执行中可能会发生变化，必须使用 `conversation.external()` 调用来封装它们。

```ts
// 错误的
const response = await externalApi();
// 正确的
const response = await conversation.external(() => externalApi());
```

这包括读取数据，以及执行副作用（例如写入数据库）。

::: tip 可与 React 媲美

如果你熟悉 React，你会发现它和 `useEffect` 的概念相似。

:::

### 规则二：所有随机行为必须被封装

依赖于随机性或者可能发生变化的全局状态的代码，必须使用 `conversation.external()` 调用来封装它们，或使用 `conversation.random()` 函数。

```ts
// 错误的
if (Math.random() < 0.5) { /* 干些好事 */ }
// 正确的
if (conversation.random() < 0.5) { /* 干些好事 */ }
```

### 规则三：使用便捷函数

我们在 `conversation` 上安装了一些可能会帮助你的代码。
如果你不使用它们，你的代码有时甚至不会出问题，但即使那样它也可能比原来慢，或者可能会表现出一种很奇怪的行为。

```ts
// `ctx.session` 只保留最近上下文对象的更改
conversation.session.myProp = 42; // 更可靠！

// Date.now() 在对话中可能不准确
await conversation.now(); // 更精确！

// 通过对话调试日志，不会打印令人困惑的日志
conversation.log("Hello, world"); // 更透明！
```

请注意，你可以使用 `conversation.external()` 来执行所有上述操作，但这可能会很麻烦，所以我们提供了一些便捷函数（[API 参考](https://deno.land/x/grammy_conversations/mod.ts?s=ConversationHandle#method_wait_0)）。

## 变量，分支和循环

如果你遵循了上述三条规则，你可以完全自由地使用任何你想使用的代码。
现在我们将介绍一些你已经知道的编程语言的概念，并展示它们如何转换为清晰和易读的对话。

想象一下，下面的所有代码都是在一个对话生成器函数中写的。

你可以声明变量，并对它们做任何你想做的事情：

```ts
await ctx.reply("把你最喜欢的数字用逗号隔开后发给我！");
const { message } = await conversation.waitFor("message:text");
const sum = message.text
  .split(",")
  .map((n) => parseInt(n.trim(), 10))
  .reduce((x, y) => x + y);
await ctx.reply("这些数字的总和为：" + sum);
```

分支也能正常运行：

```ts
await ctx.reply("发给我一张照片！");
const { message } = await conversation.wait();
if (!message?.photo) {
  await ctx.reply("啊，这不是一张照片！我死了！");
  return;
}
```

循环也是一样的：

```ts
do {
  await ctx.reply("发给我一张照片！");
  ctx = await conversation.wait();

  if (ctx.message?.text === "/cancel") {
    await ctx.reply("呜呜，被取消了，我走了！");
    return;
  }
} while (!ctx.message?.photo);
```

## 函数和递归

你也可以将你的代码分割几个函数，并重用它们。
例如，你可以这样定义一个可重复使用的验证码函数。

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function captcha(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("请证明你是个人！一切的答案是什么？");
  const { message } = await conversation.wait();
  return message?.text === "42";
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function captcha(conversation, ctx) {
  await ctx.reply("请证明你是个人！一切的答案是什么？");
  const { message } = await conversation.wait();
  return message?.text === "42";
}
```

</CodeGroupItem>
</CodeGroup>

如果用户可以通过验证，返回 `true`，否则返回 `false`。
现在，你可以在你的主对话生成器函数中使用它，如下所示：

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function enterGroup(conversation: MyConversation, ctx: MyContext) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("欢迎！");
  else await ctx.banChatMember();
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function enterGroup(conversation, ctx) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("欢迎！");
  else await ctx.banChatMember();
}
```

</CodeGroupItem>
</CodeGroup>

看，这样一来 captcha 函数就可以在不同的地方重复使用。

> 这个简单的例子只是为了说明函数的工作方式。
> 实际上，它可能会工作得差，因为它只是等待来自相应的聊天的新 update，但没有验证它实际上来自于同一个新加入的用户。
> 如果你想创建一个真正的验证码，你可能需要使用 [并行对话](#并行对话)。

如果你愿意，你也可以将你的代码分割成几个函数，或者使用递归，互相递归，生成器，等等。
(只要确保所有函数遵循 [对话的三条黄金法则](#对话的三条黄金法则) 即可。)

当然，你也可以在函数中使用错误处理。
`try`/`catch` 可以正常使用，也可以在函数之间使用。
毕竟，对话的代码是使用 JavaScript 编写的。

如果主对话函数抛出错误，错误将会向上传递到你的 bot 的 [错误处理机制](../guide/errors.md)。

## 模块与类

当然，你可以在不同的模块中移动一的函数。
这样，你可以在一个文件中定义一些可导出的函数，然后在另一个文件中通过导入进行使用。

如果你想，你还可以定义类。

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
class Auth {
  public token?: string;

  constructor(private conversation: MyConversation) {}

  authenticate(ctx: MyContext) {
    const link = getAuthLink(); // 从你的系统中获取认证链接
    await ctx.reply(
      "打开这个链接获得一个 token，并将它发送回给我：" + link,
    );
    ctx = await this.conversation.wait();
    this.token = ctx.message?.text;
  }

  isAuthenticated(): this is Auth & { token: string } {
    return this.token !== undefined;
  }
}

async function askForToken(conversation: MyConversation, ctx: MyContext) {
  const auth = new Auth(conversation);
  await auth.authenticate(ctx);
  if (auth.isAuthenticated()) {
    const token = auth.token;
    // 用 token 来干些事情
  }
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
class Auth {
  constructor(conversation) {
    this.#conversation = conversation;
  }

  authenticate(ctx) {
    const link = getAuthLink(); // 从你的系统中获取认证链接
    await ctx.reply(
      "打开这个链接获得一个 token，并将它发送回给我：" + link,
    );
    ctx = await this.#conversation.wait();
    this.token = ctx.message?.text;
  }

  isAuthenticated() {
    return this.token !== undefined;
  }
}

async function askForToken(conversation, ctx) {
  const auth = new Auth(conversation);
  await auth.authenticate(ctx);
  if (auth.isAuthenticated()) {
    const token = auth.token;
    // 用 token 来干些事情
  }
}
```

</CodeGroupItem>
</CodeGroup>

这里的重点并不是说我们强烈建议你这么做。
它是为了说明你可以使用 JavaScript 的无穷无尽的灵活性来组织你的代码。

## 表单

正如 [前面](#等待-updates) 提到的，对话中有很多工具函数，比如 `await conversation.waitFor('message:text')`，它只会返回文本消息 update。

如果这些方法不够，对话插件通过 `conversation.form` 提供了更多帮助函数来构建表单。

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function waitForMe(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("你多大了？");
  const age: number = await conversation.form.number();
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function waitForMe(conversation, ctx) {
  await ctx.reply("你多大了？");
  const age = await conversation.form.number();
}
```

</CodeGroupItem>
</CodeGroup>

像往常一样，查看 [API 参考](https://deno.land/x/grammy_conversations/mod.ts?s=ConversationForm) 以了解哪些方法可用。

## 使用插件

正如 [前面](#介绍) 所述，grammY 处理程序始终只处理单个 update。
但是，通过对话，你可以按顺序处理许多 update，就好像它们同时可用一样。
插件通过存储旧的上下文对象并在以后重新提供它们来实现这一点。

这就是为什么对话中的上下文对象并不总是像人们预期的那样受到某些 grammY 插件的影响。
这与以下插件相关：

- [menu](./menu.md)
- [hydrate](./hydrate.md)
- [i18n](./i18n.md) and [fluent](./fluent.md)
- [emoji](./emoji.md)

它们的共同点是它们都将功能存储在上下文对象上，而对话插件无法正确处理。
因此，如果你想将对话与其中一个 grammY 插件结合使用，则必须使用特殊语法在每个对话中安装另一个插件。

你可以使用 `conversation.run` 在对话中安装其他插件：

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function convo(conversation: MyConversation, ctx: MyContext) {
  // 在此处安装 grammY 插件
  await conversation.run(plugin());
  // 继续定义对话 ...
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function convo(conversation, ctx) {
  // 在此处安装 grammY 插件
  await conversation.run(plugin());
  // 继续定义对话 ...
}
```

</CodeGroupItem>
</CodeGroup>

这将使该插件在对话中可用。

例如，如果你想在对话中使用菜单，你的代码可能如下所示。

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function convo(conversation: MyConversation, ctx: MyContext) {
  const menu = new Menu<MyContext>()
    .text("Click", (ctx) => ctx.reply("Hi!"));
  await conversation.run(menu);

  // 继续定义对话 ...
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function convo(conversation, ctx) {
  const menu = new Menu()
    .text("Click", (ctx) => ctx.reply("Hi!"));
  await conversation.run(menu);

  // 继续定义对话 ...
}
```

</CodeGroupItem>
</CodeGroup>

### 自定义上下文对象

如果你使用的是 [自定义上下文对象](../guide/context.md#定制你的上下文对象) 并且你想在输入对话之前在上下文对象上安装自定义属性，那么其中一些属性也可能会丢失。
在某种程度上，你用来自定义上下文对象的中间件也可以视为插件。

最干净的解决方案是完全**避免自定义上下文属性**，或者至少只在上下文对象上安装可序列化的属性。
换句话说，如果所有自定义上下文属性都可以保存在数据库中并在之后恢复，你就不必担心任何事情。

一般来说，对于你通常通过自定义上下文属性解决的问题，都还有其他解决方案。
例如，通常可以在对话本身中获取它们，而不是在处理程序中获取。

如果这些都不是你的选择，你可以自己尝试用 `conversation.run` 来折腾。
你应该知道必须在传递的中间件中调用 `next` ————否则，update 的处理将被拦截。

每次新的 update 到达时，中间件都会为所有过去的 update 运行。
例如，如果三个上下文对象到达，则会发生以下情况：

1. 收到第一个 update
2. 中间件为第一个 update 运行
3. 收到第二个 update
4. 中间件为第一个 update 运行
5. 中间件为第二个 update 运行
6. 收到第三个 update
7. 中间件为第一个 update 运行
8. 中间件为第二个 update 运行
9. 中间件为第三个 update 运行

请注意，中间件为第一个 update 运行三次。

## 并行对话

当然，对话插件可以在不同的聊天中并行运行多个对话。

但是，如果你的 bot 加入了一个群聊，它可能想在 _同一个聊天中_ 和多个不同的用户并行运行对话。
例如，如果你的 bot 有一个验证码，它想发送给所有新成员。
如果两个成员同时加入，它应该能够与他们进行两个独立的对话。

这就是为什么对话插件允许你在同一个聊天中进入多个对话。
例如，可以与五个新用户进行五个不同的对话，同时与管理员对聊天配置进行更新。

### 它在幕后是如何运作的

每个传入的 update 将只由聊天中的一个活跃对话处理。
与中间件处理程序蕾丝，对话将按照它们注册的顺序被调用。
如果一个对话被多次启动，这些对话实例将按时间顺序被调用。

然后，每个对话可以处理 update，或者调用 `await conversation.skip()`。
在前一种情况下，update 将在对话处理它的时候被消费。
在后一种情况下，对话将实际上放弃消费 update，并将它传递给下一个对话。
如果所有对话都跳过同一个 update，控制流将被传递给中间件处理程序，并运行任何后续处理程序。

这允许你从常规中间件中开始一个新的对话。

### 你可以如何使用它

在实践中，你根本不需要调用 `await conversation.skip()`。
相反，你可以直接使用 `await conversation.waitFrom(userId)`，它将自动处理细节问题。
这允许你在群聊中与指定用户进行聊天。

举个例子，让我们重新使用平行对话的方式实现上面的验证码流程。

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts{4}
async function captcha(conversation: MyConversation, ctx: MyContext) {
  if (ctx.from === undefined) return false;
  await ctx.reply("请证明你是个人！一切的答案是什么？");
  const { message } = await conversation.waitFrom(ctx.from);
  return message?.text === "42";
}

async function enterGroup(conversation: MyConversation, ctx: MyContext) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("欢迎！");
  else await ctx.banChatMember();
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js{4}
async function captcha(conversation, ctx) {
  if (ctx.from === undefined) return false;
  await ctx.reply("请证明你是个人！一切的答案是什么？");
  const { message } = await conversation.waitFrom(ctx.from);
  return message?.text === "42";
}

async function enterGroup(conversation, ctx) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("欢迎！");
  else await ctx.banChatMember();
}
```

</CodeGroupItem>
</CodeGroup>

请注意，我们是怎么样等待来自特定用户的消息的。

我们现在可以有一个简单的处理程序，当新成员加入时进入对话。

```ts
bot.on("chat_member")
  .filter((ctx) => ctx.chatMember.old_chat_member.status === "left")
  .filter((ctx) => ctx.chatMember.new_chat_member.status === "member")
  .use((ctx) => ctx.conversation.enter("enterGroup"));
```

### 检查活跃的对话

你可以看到有多少会话正在使用哪个标识符运行。

```ts
const stats = await ctx.conversation.active();
console.log(stats); // { "enterGroup": 1 }
```

这将以一个对象的形式提供，该对象以对话标识符为键，以每个标识符的运行会话数量为值。

## 它是如何工作的

> [牢记](#对话的三条黄金法则)，在你的对话构建函数中的代码必须遵循三个规则。
> 我们现在来看一看你为什么需要按这种方式构建它们。

我们首先要看一下这个插件在概念上是如何工作的，然后再阐述一些细节。

### `wait` 调用是如何工作的

让我们暂时切换视角，然后从插件开发者的角度来问一个问题。
如何在插件中实现一个 `wait` 调用？

在对话插件中实现 `wait` 调用的原生方式是创建一个新的 promise，并等待下一个上下文对象到来。
一旦它到达，我们就 resolve 这个 promise，然后对话可以继续。

然而，这是一个坏的想法，因为：

**数据丢失。**
如果你的服务器在等待一个上下文对象时崩溃了怎么办？
在这种情况下，我们会丢失所有的信息，包括对话的状态。
也就是说，机器人会丢失了它的记忆，用户必须重新开始。
这是一个很糟糕的设计，并且很可能会使用户感到不舒服。

**阻塞。**
如果等待调用会一直阻塞到下一个 update 到来，这就意味着在整个对话完成之前，第一个 update 的中间件不能完成执行。

- 对于内置的轮询，这意味着在当前的轮询完成之前，不能再处理其他 update。
  因此，机器人将永远被阻塞。
- 对于 [grammY runner](./runner.md)，bot 不会被阻塞。
  但是，当与不同的用户并行处理成千上万的对话时，它会消耗巨量的内存。
  如果多个用户停止响应，这将使 bot 卡在无数个对话中间。
- Webhooks 则会有它自己的一整套与长时间运行的中间件的 [问题](../guide/deployment-types.md#及时结束-webhook-请求)。

**状态。**
在例如云函数的 serverless 基础设施上，我们实际上不能假设同一个实例会处理来自同一个用户的两个后续的 update。
因此，如果我们要创建有状态的对话，它们可能会在随机的时候崩溃，因为某些 `wait` 调用不会被 resolve，但是其他的中间件却被意外的执行了。
这样会导致大量的随机 bug 和运行时混乱。

这里还不止上面提到的问题，但你已经能明白我们的意思了。

因此，对话插件以不同的方式工作。
非常不同。
如前面所述，**调用 `wait` 不会真的让你的 bot 等待**，尽管我们可以将对话编程成这样。

对话插件会跟踪你的函数的执行。
当一个 `wait` 调用被触发时，它会将执行状态序列化到会话中，并安全地存储到数据库中。
当下一个 update 到达时，它会首先检查会话数据。
如果它发现它在对话的过程中离开了，它就会反序列化执行状态，使用你的对话生成器函数，并重放到上次 `wait` 调用之前。
然后它会继续正常执行你的函数——直到下一个 `wait` 调用被触发，并且必须再次停止执行时。

我们所说的执行状态是什么意思？
简而言之，它包括三方面：

1. 传入 updates
2. 发出 API 调用
3. 外部事件和影响，例如随机性或对外部 API 或数据库的调用

我们所说的重放是什么意思？
重放只是意味着从头开始调用函数，但当它做诸如 `wait` 或者执行 API 调用时，我们实际上不执行它们。
而是通过检查日志，从上一次的运行记录中拿到对应的返回值。
然后我们注入这些返回值，这样以来，对话生成器函数就能以非常快的速度运行，直到日志被全部消费。
日志被消费完后，我们切换回正常的执行模式（这是一种华丽的说辞），即停止注入，并开始真正执行 API 调用。

这就是为什么这个插件必须跟踪所有传入的 update 以及所有 Bot API 调用。
（参见上面的第 1 点和第 2 点）
然而，这个插件没办法控制外部事件、副作用或者随机性。
例如，你可以这样：

```ts
if (Math.random() < 0.5) {
  // 干一些事情
} else {
  // 干另一些事情
}
```

在这种情况下，当调用函数时，它可能会突然每次都表现得不同，导致重放函数将发生崩溃！
它可以随机地以不同于原始执行的方式工作。
这就是为什么存在第 3 点，和必须遵守 [对话的三条黄金法则](#对话的三条黄金法则)

### 如何拦截函数的执行

从概念上讲，关键字 `async` 和 `await` 可以控制线程的 [预先抢占](https://en.wikipedia.org/wiki/Preemption_(computing))。
因此，如果调有人调用 `await conversation.wait()`，我们就获得了抢占执行的权力。

具体来说，使我们能够中断函数执行的秘密核心是一个永远不会 resolve 的 `Promise`。

```ts
await new Promise<never>(() => {}); // BOOM
```

如果你在任何 JavaScript 文件中 `await` 这样一个个 `Promise`，你的运行时将立即终止。
(请将上面的代码粘贴到一个文件中，然后试一试。)

由于我们显然不想杀掉 JS 的运行时，因此我们必须再次捕获这个。
你会怎么做呢？
(如果你不了解这个，请查看插件的源代码。)

## 插件概述

- 名字：`conversations`
- 源码：<https://github.com/grammyjs/conversations>
- 参考：<https://deno.land/x/grammy_conversations/mod.ts>
