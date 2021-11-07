# 会话与数据存储（内置）

你可以通过自己编写代码来实现连接你选择的数据存储，但是 grammY 提供了一个非常方便的存储模式，称为 _会话_。

> [向下跳转](#如何使用会话) 如果你已经知道会话是怎样工作的。

## 为什么我们必须考虑存储问题？

和 Telegram 上的普通用户相反，bot 在 Telegram 云中只有 [有限的云存储空间](https://core.telegram.org/bots#4-how-are-bots-different-from-humans) 。
因此，下面这几件事你不能用 bot 来做：

1. 你不能访问你的 bot 收到的旧消息。
2. 你不能访问你的 bot 发送的旧消息。
3. 你不能获取所有与你的 bot 聊天的列表。
4. 还有更多，比如没有媒体概览等

基本上，它可以总结成这样一个事实，即**一个 bot 只能访问当前传入的 update**（比如消息），即上下文对象 `ctx` 上的信息。

因此，如果你 _真的想访问_ 旧数据，你必须在收到它时立刻把它存下来。
也就是说你必须有一个数据存储，比如说文件、数据库或者内存存储。
当然，你可以不用自己托管，有很多第三方的服务商可以提供数据存储服务。

## 什么是会话？

通常情况下，对于 bot 来说，每次聊天都会存储一些数据。
举个例子，假设我们想建立一个 bot，计算一条消息的文本中包含披萨表情 :pizza: 的次数。
这个 bot 可以添加到一个小组里，并且它可以告诉你，你和你的朋友有多喜欢披萨。

当我们的披萨 bot 收到一条消息时，它必须记住之前在当前聊天中看到过多少次 :pizza:。
并且当你的妹妹将披萨 bot 添加到她的群聊中时，别的披萨计数器不应该发生改变，也就是说我们真正想要的是可以存储 _每个聊天一个计数器_。

会话就是这样一种优雅的方式来给 _每个聊天_ 存储数据。
你将会使用聊天标识符来作为数据库的键，和一个计数器作为值。
在这种情况下，我们会把聊天标识符称为 _会话密钥_。

我们可以在 bot 上安装中间件，这个中间件会在运行前，从数据库中加载聊天会话数据到 `ctx.session` 来提供给每个 update。
它还会确保一旦我们完成了工作，会话数据就会被写回数据库，这样我们就不用再担心与数据存储的实际通信了。

在我们的例子中，我们可以在会话对象 `ctx.session` 上访问 _对应的聊天_ 的披萨数量。

## 如何使用会话

你可以添加内置的会话中间件来为 grammY 添加会话支持。

下面是一个计算含有披萨表情 :pizza: 的信息的 bot 例子

<CodeGroup>
 <CodeGroupItem title="TS">

```ts
import { Bot, Context, session, SessionFlavor } from "grammy";

// 定义我们的会话
interface SessionData {
  pizzaCount: number;
}

// 对上下文类型进行修饰以包含会话
type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>("");

// 安装会话中间件，并定义会话初始值
bot.use(
  session({
    initial(): SessionData {
      return { pizzaCount: 0 };
    },
  }),
);

bot.command("hunger", async (ctx) => {
  const count = ctx.session.pizzaCount;
  await ctx.reply(`Your hunger level is ${count}!`);
});

bot.hears(/.*🍕.*/, (ctx) => ctx.session.pizzaCount++);

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JS">

```js
const { Bot, session } = require("grammy");

const bot = new Bot("");

// 安装会话中间件，并定义会话初始值
bot.use(
  session({
    initial() {
      return { pizzaCount: 0 };
    },
  }),
);

bot.command("hunger", async (ctx) => {
  const count = ctx.session.pizzaCount;
  await ctx.reply(`Your hunger level is ${count}!`);
});

bot.hears(/.*🍕.*/, (ctx) => ctx.session.pizzaCount++);

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import {
  Bot,
  Context,
  session,
  SessionFlavor,
} from "https://deno.land/x/grammy/mod.ts";

// 定义我们的会话
interface SessionData {
  pizzaCount: number;
}

// 对上下文类型进行修饰以包含会话
type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>("");

// 安装会话中间件，并定义会话初始值
bot.use(
  session({
    initial(): SessionData {
      return { pizzaCount: 0 };
    },
  }),
);

bot.command("hunger", async (ctx) => {
  const count = ctx.session.pizzaCount;
  await ctx.reply(`Your hunger level is ${count}!`);
});

bot.hears(/.*🍕.*/, (ctx) => ctx.session.pizzaCount++);

bot.start();
```

</CodeGroupItem>
</CodeGroup>

请注意，我们还必须 [调整上下文类型](/zh/guide/context.md#customising-the-context-object)，使得会话可以在上下文上使用。
上下文修饰器被称为 `SessionFlavor`。

为会话中间件指定 `initial` 是很重要的（但也是可选的）。
传入一个函数，为新的聊天生成一个带有初始会话数据的新对象。

你可以通过向 [options](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#SessionOptions) 传入一个名为 `getSessionKey` 的函数来指定会话使用哪个会话密钥。
只要 `getSessionKey` 返回 `underfined`， `ctx.session` 也会是 `undefined`。

在上面的例子中，会话数据存储在你的内存中，所以一旦你的 bot 被停止了，所有的数据都会丢失。
当你开发 bot 或者运行自动测试时，这样会很方便（因为不需要配置数据库），但是**不应该在生产环境中使用这种方式**。
在生产环境中，你应该使用会话中间件的 `storage` 选项，将它连接到你的数据存储中。
这里可能已经有你需要并且可以使用的为 grammY 编写的存储适配器（见下文），如果没有，通常只需要 5 行代码就可以自己实现一个。

::: warning 会话密钥和 webhooks
当你在 webhooks 上运行你的 bot，你应该避免使用 `getSessionKey` 选项。

如果你需要使用该选项（这完全没问题），并且你传入的函数在一定程度上不依赖于 `ctx.chat.id`，请确保你读了 [这个](/zh/guide/deployment-types.md) 和 [这个](/zh/plugins/runner.md) 以了解后果。

:::

## 懒会话

懒会话是会话的另一种实现方式，通过跳过多余的读写操作，可以大大减少你的 bot 的数据库流量。

假设你的 bot 在一个群组聊天中，它只响应命令而不响应普通的文本消息。
没有会话时，会发生下列情况：

1. 附带新的文本消息的 update 会被发送到你的 bot 上
2. 没有调用处理程序，所以不采取任何行动
3. 中间件会立刻完成

一旦你添加了（默认，严格）的会话，直接在上下文对象中提供会话数据，会发生下列情况：

1. 附带新的文本消息的 update 会被发送到你的 bot 上
2. 从会话存储（例如数据库）中加载会话数据
3. 没有调用处理程序，所以不采取任何行动
4. 相同的会话数据会被写回到会话存储中
5. 中间件完成后，堆数据存储进行了一次读和一次写

根据你的 bot 的性质，这可能会导致大量多余的读和写。
如果发现没有没有调用处理程序需要会话数据，懒会话允许你跳过步骤 2 和步骤 4。
在这种情况下，不会从数据存储中读出数据，也不会写回数据。

这是通过拦截对 `ctx.session` 的访问来实现的。
如果没有调用处理程序，那么 `ctx.session` 将永远不会被访问。
懒会话以这个为一个指标来避免进行数据库通信。

在实践中，不是在 `ctx.session` 下提供会话数据，而是在 `ctx.session` 下提供 _一个会话数据的 promise_。

```ts
// 默认会话 (严格会话)
bot.command("settings", (ctx) => {
  // `session` 是会话数据
  const session = ctx.session;
});

// 懒会话
bot.command("settings", async (ctx) => {
  // `promise` 是会话数据的一个 promise
  const promise = ctx.session;
  // `session` 是会话数据
  const session = await ctx.session;
});
```

如果你一直没有访问 `ctx.session`，就不会发生任何操作，但只要你访问了上下文对象的 `session` 属性，就会触发读操作。
如果你一直没有触发读取（或者直接给 `ctx.session` 赋一个新值），因为它不可能被改变，所以我们知道我们不需要写回任何数据。
因此，我们也会跳过写入操作。
通过上诉操作，我们实现了最小的读写操作，只需要在你的代码中添加 `async` 和 `await` 关键字，你就可以像之前一样使用会话。

所以使用懒会话而不是默认（严格）的会话需要什么？
主要是下面这三件事请：

1. 用 `LazySessionFlavor` 而不是 `SessionFlavor` 来装饰你的上下文
   它们的工作方式是一样的，只是 `ctx.session` 被包裹在一个懒变量的 promise 中。
2. 使用 `lazySession` 而不是 `session` 来注册你的会话中间件。
3. 在你的中间件中，不管是读还是写，都要使用內联的 `await ctx.session` 来替代 `ctx.session`。
   不要担心：你可以用会话数据多次使用 `await` Promise，但你会一直引用相同的值，所以永远不会有重复读取更新。

注意，对于懒会话，你可以把对象和 promise 对象都赋值给 `ctx.session`。
如果你把 `ctx.session` 设置为一个 promise，那在把数据写会数据仓库之前，它会被 `await`。
这样可以实现以下代码：

```ts
bot.command("reset", (ctx) => {
  // 比 `await ctx.session` 要短得多：
  ctx.session = ctx.session.then((stats) => {
    stats.counter = 0;
  });
});
```

有人可能会争论说，明确地使用 `await` 比赋值一个 promise 给 `ctx.seesion` 要更好，但重点是如果你出于某种原因更喜欢这种风格，你 _可以_ 这样写。

::: tip 需要会话的插件
使用 `ctx.session` 的插件开发者应该始终允许用户传入 `SeesionFlavor | LazySessionFlavor`，从而支持这两种模式。
在插件代码中，只需要一直 await `ctx.session`：如果一个非 promise 对象被传入，那么它将会简单地计算为它自己，因此你实际上只需要支持懒会话就能够自动支持严格的会话。
:::

## 已知的存储适配器

默认情况下，会话会由内置的存储适配器存储在你的内存中。
下面是我们所知道的存储适配器的列表，它们允许你在其他地方存储会话数据。
如果你发布了自己的存储适配器，请编辑这个页面并且添加链接到这里，这样可以让其他人也使用它。

### 官方

- Supabase: <https://github.com/grammyjs/storage-supabase>
- Google Firestore (Node.js-only): <https://github.com/grammyjs/storage-firestore>

### 第三方

- Files: <https://github.com/Satont/grammy-file-storage>
- MongoDB: <https://github.com/Satont/grammy-mongodb-storage>
- Redis: <https://github.com/Satont/grammy-redis-storage>
- TypeORM (Node.js-only): <https://github.com/Satont/grammy-typeorm-storage>
- Submit your own by editing this page!

## 插件概述

这个插件是内置在 grammY 的核心中的。
你不需要安装任何东西来使用它。
只需要导入 grammY 即可。

并且，这个插件的文档和 API 参考都与核心包一致。
