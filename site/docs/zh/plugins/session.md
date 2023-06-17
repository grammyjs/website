---
prev: false
next: false
---

# 会话与数据存储（内置）

你可以通过自己编写代码来实现连接你选择的数据存储，但是 grammY 提供了一个非常方便的存储模式，称为 _会话_。

> [向下跳转](#如何使用会话) 如果你已经知道会话是怎样工作的。

## 为什么我们必须考虑存储问题？

和 Telegram 上的普通用户相反，bot 在 Telegram 云中只有 [有限的云存储空间](https://core.telegram.org/bots#how-are-bots-different-from-users) 。
因此，下面这几件事你不能用 bot 来做：

1. 你不能访问你的 bot 收到的旧消息。
2. 你不能访问你的 bot 发送的旧消息。
3. 你不能获取所有与你的 bot 聊天的列表。
4. 还有更多，比如没有媒体概览等

基本上，它可以总结成这样一个事实，即**一个 bot 只能访问当前传入的 update**（比如消息），即上下文对象 `ctx` 上的信息。

因此，如果你 _真的想访问_ 旧数据，你必须在收到它时立刻把它存下来。
也就是说你必须有一个数据存储，比如说文件、数据库或者内存存储。

当然，grammY 在这里为你提供了保障：你不需要自己托管。
你可以直接使用 grammY 的会话存储，它不需要任何设置，而且永久免费。

> 当然，还有很多其他提供数据存储的服务，而 grammY 也能与它们无缝整合。
> 如果你想运行自己的数据库，请放心，grammY 同样支持这个的能力。
> [向下跳转](#已知的存储适配器) 查看目前支持的集成。

## 什么是会话？

通常情况下，对于 bot 来说，每次聊天都会存储一些数据。
举个例子，假设我们想建立一个 bot，计算一条消息的文本中包含披萨表情 :pizza: 的次数。
这个 bot 可以添加到一个小组里，并且它可以告诉你，你和你的朋友有多喜欢披萨。

当我们的披萨 bot 收到一条消息时，它必须记住之前在当前聊天中看到过多少次 :pizza:。
并且当你的妹妹将披萨 bot 添加到她的群聊中时，你的披萨计数器不应该发生改变，也就是说我们真正想要的是可以存储 _每个聊天一个计数器_。

会话就是这样一种优雅的方式来给 _每个聊天_ 存储数据。
你将会使用聊天标识符来作为数据库的键，和一个计数器作为值。
在这种情况下，我们会把聊天标识符称为 _会话密钥_。
（你可以在 [这里](#会话密钥) 阅读更多关于会话密钥的信息。）
实际上，你的 bot 将存储一个键为聊天标识符，值为自定义会话数据的字典，即类似这样的东西：

```json:no-line-numbers
{
  "424242": { "pizzaCount": 24 },
  "987654": { "pizzaCount": 1729 }
}
```

> 当我们说数据库时，我们实际上是指任何数据存储解决方案。
> 这包括文件，云存储，或者其他任何东西。

但是，到底什么是会话？

我们可以在 bot 上安装中间件，为每次 update 提供 `ctx.session` 上的会话数据。
安装的插件将会在我们的处理程序被调用之前和之后做一些事情：

1. **在我们的中间件之前。**
   会话插件从数据库加载当前聊天的会话数据。
   它将数据存储在 `ctx.session` 上下文对象中。
2. **在我们的中间件运行时**
   我们可以 _读_ `ctx.session` 来检查数据库中的值。
   例如，当我们的中间件在运行时，如果有一条标识符为 `424242` 的消息被发送到聊天中，那么它将是 `ctx.session = { pizzaCount: 24 }`（根据上面的数据库状态示例）。
   我们还可以随意 _修改_ `ctx.session`，所以我们可以根据需要添加、删除和改变字段。
3. **在我们的中间件之后。**
   会话中间件确保数据被写回数据库。
   在中间件执行完毕后，无论 `ctx.session` 的值是多少，它都会被保存在数据库中。

因此，我们不必再担心与数据存储之间的通信了。
我们只需要修改 `ctx.session` 中的数据，插件会自动处理剩下的事情。

## 什么时候使用会话

> 如果你已经知道你想要使用会话，请 [跳过这一部分](#如何使用会话)。
> 你可能会想，这太好了，我再也不用担心数据库了！
> 你是对的，会话是一个理想的解决方案，但只适用于某些类型的数据。

根据我们的经验，在一些用例中，会话确实很有价值。
另一方面，在有些情况下 ，一个传统的数据库可能更合适。

这个比较可以帮助你决定是否使用会话。

|                  | 会话                                       | 数据库                                     |
| ---------------- | ------------------------------------------ | ------------------------------------------ |
| _访问_           | **每个聊天**有一个隔离的存储空间           | **多个聊天**访问相同的数据                 |
| _共享_           | 数据**仅被 bot 使用**                      | 数据被其他系统使用（例如，一个网络服务器） |
| _格式_           | 任何 JavaScript 对象：字符串、数字、数组等 | 任何数据（二进制，文件，结构体等）         |
| _每个聊天的大小_ | 每个聊天最好少于 ~3MB                      | 任意大小                                   |
| _独家特色_       | 一些 grammY 插件必需                       | 支持数据库事务                             |

这并不意味着如果你选择会话/数据库而不是其他的，其他方面就 _不能工作_ 了。
例如，你可以将大型二进制数据存储在会话中。
然而，你的 bot 不会像另一种方式那样表现良好，所以我们建议只在有意义的地方使用会话。

## 如何使用会话

你可以添加内置的会话中间件来为 grammY 添加会话支持。

### 使用示例

下面是一个计算含有披萨表情 :pizza: 的信息的 bot 例子

:::code-group

```ts [TypeScript]
import { Bot, Context, session, SessionFlavor } from "grammy";

// 定义我们的会话。
interface SessionData {
  pizzaCount: number;
}

// 对上下文类型进行修饰以包含会话。
type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>("");

// 安装会话中间件，并定义会话初始值。
function initial(): SessionData {
  return { pizzaCount: 0 };
}
bot.use(session({ initial }));

bot.command("hunger", async (ctx) => {
  const count = ctx.session.pizzaCount;
  await ctx.reply(`Your hunger level is ${count}!`);
});

bot.hears(/.*🍕.*/, (ctx) => ctx.session.pizzaCount++);

bot.start();
```

```js [JavaScript]
const { Bot, session } = require("grammy");

const bot = new Bot("");

// 安装会话中间件，并定义会话初始值。
function initial(): SessionData {
  return { pizzaCount: 0 };
}
bot.use(session({ initial }));

bot.command("hunger", async (ctx) => {
  const count = ctx.session.pizzaCount;
  await ctx.reply(`Your hunger level is ${count}!`);
});

bot.hears(/.*🍕.*/, (ctx) => ctx.session.pizzaCount++);

bot.start();
```

```ts [Deno]
import {
  Bot,
  Context,
  session,
  SessionFlavor,
} from "https://deno.land/x/grammy/mod.ts";

// 定义我们的会话。
interface SessionData {
  pizzaCount: number;
}

// 对上下文类型进行修饰以包含会话。
type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>("");

// 安装会话中间件，并定义会话初始值。
function initial(): SessionData {
  return { pizzaCount: 0 };
}
bot.use(session({ initial }));

bot.command("hunger", async (ctx) => {
  const count = ctx.session.pizzaCount;
  await ctx.reply(`Your hunger level is ${count}!`);
});

bot.hears(/.*🍕.*/, (ctx) => ctx.session.pizzaCount++);

bot.start();
```

:::

请注意，我们还必须 [调整上下文类型](../guide/context#定制你的上下文对象)，使得会话可以在上下文上使用。
上下文修饰器被称为 `SessionFlavor`。

### 初始化会话数据

当一个用户第一次联系你的 bot 时，他们没有任何会话数据可以使用。
因此，你需要在会话中间件中指定 `initial` 选项。
传入一个函数，为新的聊天生成一个带有初始会话数据的新对象。

```ts
// 创建一个新的对象，作为初始会话数据使用。
function createInitialSessionData() {
  return {
    pizzaCount: 0,
    // 更多数据放在这里
  };
}
bot.use(session({ initial: createInitialSessionData }));
```

相同但更短的写法：

```ts
bot.use(session({ initial: () => ({ pizzaCount: 0 }) }));
```

::: warning 共享对象
请确保总是创建一个 _新的对象_。
**不要**这样做：

```ts
// 危险的，不安全的，错误的，应该被制止的
const initialData = { pizzaCount: 0 }; // 不要这么干
bot.use(session({ initial: { initialData } })); // 邪恶的
```

如果你这样做，几个不同的聊天室可能会在内存中共享同一个会话对象。
因此，在一个聊天中更改会话数据可能会导致另一个聊天的会话数据也被更改。
:::

你也可以完全忽略 `initial` 选项，尽管我们建议你不要这样做。
如果你不指定它，读取 `ctx.session` 时将会给新用户抛出一个错误。

### 会话密钥

> 本章节介绍一个大多数人不需要关心的高级特性。
> 你可能想继续阅读有关 [存储数据](#储存你的数据) 的章节。

你可以通过向 [options](https://deno.land/x/grammy/mod.ts?s=SessionOptions#prop_getSessionKey) 传入一个名为 `getSessionKey` 的函数来指定会话使用哪个会话密钥。
这样，你可以从根本上改变会话插件的工作方式。
默认情况下，会话数据存储在每个聊天中。
使用 `getSessionKey`，你可以按每个用户，或每个用户-聊天组合，或任何你想要的方式存储数据。
这里有三个示例：

:::code-group

```ts [TypeScript]
// 为每个聊天存储数据（默认）。
function getSessionKey(ctx: Context): string | undefined {
  // 让群聊中的所有用户共享同一个会话，
  // 但私聊中每个用户都有一个独立的私人会话
  return ctx.chat?.id.toString();
}

// 为每个用户存储数据。
function getSessionKey(ctx: Context): string | undefined {
  // 给每个用户提供一个私人的会话存储
  //（将在群聊和私人聊天中共享）
  return ctx.from?.id.toString();
}

// 为用户-聊天组合存储数据。
function getSessionKey(ctx: Context): string | undefined {
  // 在每次与 bot 聊天时，给每个用户一个独立的会话存储
  // （给每个群聊和私人聊天一个独立的会话存储）
  return ctx.from === undefined || ctx.chat === undefined
    ? undefined
    : `${ctx.from.id}/${ctx.chat.id}`;
}

bot.use(session({ getSessionKey }));
```

```js [JavaScript]
// 为每个聊天存储数据（默认）。
function getSessionKey(ctx) {
  // 让群聊中的所有用户共享同一个会话，
  // 但私聊中每个用户都有一个独立的私人会话
  return ctx.chat?.id.toString();
}

// 为每个用户存储数据。
function getSessionKey(ctx) {
  // 给每个用户提供一个私人的会话存储
  //（将在群聊和私人聊天中共享）
  return ctx.from?.id.toString();
}

// 为用户-聊天组合存储数据。
function getSessionKey(ctx) {
  // 在每次与 bot 聊天时，给每个用户一个独立的会话存储
  // （给每个群聊和私人聊天一个独立的会话存储）
  return ctx.from === undefined || ctx.chat === undefined
    ? undefined
    : `${ctx.from.id}/${ctx.chat.id}`;
}

bot.use(session({ getSessionKey }));
```

:::

当 `getSessionKey` 返回 `undefined` 时，`ctx.session` 也会被设置为 `undefined`。
举个例子，默认的会话密钥解析器不能处理 `poll`/`poll_answer` update 或 `inline_query` update，因为它们不属于一个聊天（`ctx.chat` 是 `undefined`）。

::: warning 会话密钥和 webhooks
当你在 webhooks 上运行你的 bot，你应该避免使用 `getSessionKey` 选项。
Telegram 在每次聊天时都会按照顺序发送 webhooks，因此默认的会话密钥解析器是唯一能保证不会丢失数据的实现。

如果你必须使用该选项（当然，这仍然是可能的），你应该知道你在做什么。
通过阅读 [这个](../guide/deployment-types)，特别是 [这个](./runner#为什么需要顺序处理)，确保你了解使用这个配置的后果。
:::

### 聊天迁移

如果你正在群组中使用会话，你应该知道 Telegram 在某些情况下会将常规群组迁移到超级群组（例如 [此处](https://github.com/telegramdesktop/tdesktop/issues/5593)）。

这种迁移对每个群组只发生一次，但它会导致不一致。
这是因为迁移的聊天在技术上是一个完全不同的聊天，具有不同的标识符，因此其会话将被不同地标识。

目前，这个问题没有安全的解决方案，因为来自两个聊天的消息也有不同的标识。
这可能导致数据竞争。
但是，有几种方法可以处理此问题：

- 忽略这个问题。
  迁移群组时，bot 的会话数据将有效重置。
  简单、可靠、默认行为，但每个聊天可能出现一次潜在的意外。
  例如，如果在用户处于由 [对话插件](./conversations) 支持的对话中时发生迁移，则对话将被重置。

- 只在会话中存储临时数据（或超时数据），并使用数据库存储聊天迁移时需要迁移的重要内容。
  然后，这可以使用事务和自定义逻辑来处理来自旧聊天和新聊天的并发数据访问。
  需要很多付出并且有性能成本，但是是解决这个问题的唯一真正可靠的方法。

- 理论上可以实现一种解决方法来匹配两个聊天**但不保证可靠性**。
  触发迁移后，Telegram Bot API 会为两个聊天中的每一个发送迁移 update（请参阅 [Telegram API 文档](https://core.telegram.org/bots/api#message)）。
  但问题是无法保证在超级群组中的新消息出现之前发送这些消息。
  因此， bot 可以在意识到任何迁移之前收到来自新超级群组的消息，因此，它无法匹配两个聊天，从而导致上述问题。

- 另一种解决方法是使用 [filtering](../guide/filter-queries) 将 bot 仅限制为超级群组（或仅将会话相关功能限制为超级群组）。
  但是，这将问题/不便转移给了用户。

- 让用户明确决定。
  （“此聊天已迁移，是否要转移 bot 数据？”）
  由于人为增加的延迟，比自动迁移更可靠和透明，但用户体验更差。

最后，由开发人员决定如何处理这种边缘情况。
根据 bot 的功能，人们可能会选择一种方式或另一种方式。
如果有问题的数据是短暂的（例如临时的，涉及超时），则迁移不是问题。
用户可能会遇到迁移问题（如果时机不对），并且只需要重新运行该功能。

忽略该问题无疑是最简单的方法，但无论如何了解此行为很重要。
否则它会引起混乱并可能花费数小时的调试时间。

### 储存你的数据

在上面的例子中，会话数据存储在你的内存中，所以一旦你的 bot 被停止了，所有的数据都会丢失。
当你开发 bot 或者运行自动测试时，这样会很方便（因为不需要配置数据库），但是不应该在生产环境中使用这种方式。
在生产环境中，你可能希望持久保存数据，例如保存在文件、数据库或其他存储中。

在生产环境中，你应该使用会话中间件的 `storage` 选项，将它连接到你的数据存储中。
这里可能已经有你需要并且可以使用的为 grammY 编写的存储适配器（见 [下文](#已知的存储适配器)），如果没有，通常只需要 5 行代码就可以自己实现一个。

## 已知的存储适配器

默认情况下，会话会由内置的存储适配器存储[在你的内存中](#内存-默认)。
你也可以使用 grammY [免费提供](#免费存储) 的存储适配器，或者连接到 [外部存储](#外部存储解决方案)。

你可以使用下面的一个存储适配器来安装它。

```ts
const storageAdapter = ... // 取决于配置

bot.use(session({
  initial: ...
  storage: storageAdapter,
}));
```

### 内存（默认）

默认情况下，所有数据都会被存储在内存中。
这意味着，当你的 bot 停止时，所有的会话都会丢失。

如果你想配置更多的内存存储选项，你可以使用 grammY 核心包中的 `MemorySessionStorage` 类（[API Reference](https://deno.land/x/grammy/mod.ts?s=MemorySessionStorage)）。

```ts
bot.use(session({
  initial: ...
  storage: new MemorySessionStorage() // 同样使用默认选项
}));
```

### 免费存储

> 免费存储是为了用于业余项目。
> 产品级应用程序应该使用自己的数据库。
> 支持的外部存储解决方案的支持请参考 [这里](#外部存储解决方案)。

使用 grammY 的一个好处是你可以使用免费的云存储。
它不需要任何配置，所有的认证都是痛使用你的 bot token 完成的。
查看 [这个仓库](https://github.com/grammyjs/storages/tree/main/packages/free)！

它非常容易使用：

:::code-group

```ts [TypeScript]
import { freeStorage } from "@grammyjs/storage-free";

bot.use(session({
  initial: ...
  storage: freeStorage<SessionData>(bot.token),
}));
```

```js [JavaScript]
const { freeStorage } = require("@grammyjs/storage-free");

bot.use(session({
  initial: ...
  storage: freeStorage(bot.token),
}));
```

```ts [Deno]
import { freeStorage } from "https://deno.land/x/grammy_storages/free/src/mod.ts";

bot.use(session({
  initial: ...
  storage: freeStorage<SessionData>(bot.token),
}));
```

:::

完成！
你的 bot 将会使用一个持久的数据存储。

这是一个完整的 bot 示例，你可以复制它来试试。

:::code-group

```ts [TypeScript]
import { Bot, Context, session, SessionFlavor } from "grammy";
import { freeStorage } from "@grammyjs/storage-free";

// 定义会话结构。
interface SessionData {
  count: number;
}
type MyContext = Context & SessionFlavor<SessionData>;

// 创建 bot 并且注册会话中间件。
const bot = new Bot<MyContext>(""); // <-- 把你的 bot token 放在 "" 中间

bot.use(session({
  initial: () => ({ count: 0 }),
  storage: freeStorage<SessionData>(bot.token),
}));

// 在 update 处理中使用持久会话数据。
bot.on("message", async (ctx) => {
  ctx.session.count++;
  await ctx.reply(`Message count: ${ctx.session.count}`);
});

bot.catch((err) => console.error(err));
bot.start();
```

```js [JavaScript]
const { Bot, session } = require("grammy");
const { freeStorage } = require("@grammyjs/storage-free");

// 创建 bot 并且注册会话中间件。
const bot = new Bot("");

bot.use(session({
  initial: () => ({ count: 0 }),
  storage: freeStorage(bot.token),
}));

// 在 update 处理中使用持久会话数据。
bot.on("message", async (ctx) => {
  ctx.session.count++;
  await ctx.reply(`Message count: ${ctx.session.count}`);
});

bot.catch((err) => console.error(err));
bot.start();
```

```ts [Deno]
import {
  Bot,
  Context,
  session,
  SessionFlavor,
} from "https://deno.land/x/grammy/mod.ts";
import { freeStorage } from "https://deno.land/x/grammy_storages/free/src/mod.ts";

// 定义会话结构。
interface SessionData {
  count: number;
}
type MyContext = Context & SessionFlavor<SessionData>;

// 创建 bot 并且注册会话中间件。
const bot = new Bot<MyContext>(""); // <-- 把你的 bot token 放在 "" 中间

bot.use(session({
  initial: () => ({ count: 0 }),
  storage: freeStorage<SessionData>(bot.token),
}));

// 在 update 处理中使用持久会话数据。
bot.on("message", async (ctx) => {
  ctx.session.count++;
  await ctx.reply(`Message count: ${ctx.session.count}`);
});

bot.catch((err) => console.error(err));
bot.start();
```

:::

### 外部存储解决方案

我们维护了一系列官方存储适配器，允许你将会话数据存储在不同的地方。
它们中的每一个都需要你在托管提供商处注册，或者托管你自己的存储解决方案。

访问 [此处](https://github.com/grammyjs/storages/tree/main/packages#grammy-storages) 查看当前支持的适配器列表并获得使用指南。

::: tip 你的存储解决方案还没被支持？没问题！
创建一个自定义存储适配器非常简单。
`storage` 选项可以与任何实现了这个 [接口](https://deno.land/x/grammy/mod.ts?s=StorageAdapter) 的对象连接，所以你只需要在几行代码就可以连接到你的存储。

> 如果你发布了自己的存储适配器，请随时编辑这个页面并且添加链接到这里，以便其他人也可以使用它。

:::

所有的存储适配器都可以以同样的方式安装。
首先，你应该注意你所选择的存储适配器的包名。
例如，Supabase 的存储适配器叫做 `supabase`。

**在 Node.js 中**，你可以通过 `npm i @grammyjs/storage-<name>` 安装适配器。
例如，Supabase 的存储适配器可以通过 `npm i @grammyjs/storage-supabase` 安装。

**在 Deno 中**，所有的存储适配器都在同一个 Deno 模块中发布。
你可以从 `https://deno.land/x/grammy_storages/<adapter>/src/mod.ts` 的子路径中导入你需要的适配器。
例如，Supabase 的存储适配器可以通过 `https://deno.land/x/grammy_storages/supabase/src/mod.ts` 导入。

请查看各自的仓库，了解不同适配器的设置。
它们的仓库中包含了如何连接到你的存储解决方案的信息。

你可能还想 [向下滚动](#存储增强) 查看会话插件如何增强存储适配器

## 多会话

会话插件能够将会话数据的不同片段存储在不同的地方。
基本上，这就好像你安装了多个独立的会话插件实例一样，每个实例都有不同的配置。

这些数据片段中的每一个都会有一个名字，它们可以在这个名字下存储它们的数据。
然后你就能够访问 `ctx.session.foo` 和 `ctx.session.bar` 并且这些值是从不同的数据存储加载的，它们也会被写回不同的数据存储。
当然，你也可以使用不同配置的相同存储。

为每个片段使用不同的 [会话密钥](#会话密钥) 也是可以的。
因此，你可以为每个聊天存储一些数据，为每个用户存储一些数据。

> 如果你使用的是 [grammY runner](./runner)，请确保通过返回**所有**会话密钥作为函数的约束来正确配置 `sequentialize`。

你可以通过将 `type: "multi"` 传递给会话配置来使用此功能。
反过来，你将需要使用它自己的配置来配置每个片段。

```ts
bot.use(session({
  type: "multi",
  foo: {
    // 这些也是默认值
    storage: new MemorySessionStorage(),
    initial: () => undefined,
    getSessionKey: (ctx) => ctx.chat?.id.toString(),
  },
  bar: {
    initial: () => ({ prop: 0 }),
    storage: freeStorage(bot.token),
  },
  baz: {},
}));
```

请注意，你必须为要使用的每个片段添加一个配置条目。
如果你想使用默认配置，你可以指定一个空对象（比如我们在上面的例子中为 `baz` 做的那样）。

你的会话数据仍将包含一个具有多个属性的对象。
这就是为什么你的上下文调味剂不会改变的原因。
上面的示例在自定义上下文对象时可以使用此接口：

```ts
interface SessionData {
  foo?: string;
  bar: { prop: number };
  baz: { width?: number; height?: number };
}
```

然后，你可以继续在你的上下文对象上使用 `SessionFlavor<SessionData>`。

## 懒会话

> 本章节介绍了大多数人不需要关心的性能优化。
> 你可能想继续写阅读有关 [已知的存储适配器](#已知的存储适配器) 的章节。

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
bot.command("settings", async (ctx) => {
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
bot.command("reset", async (ctx) => {
  // 比 `await ctx.session` 要短得多：
  ctx.session = ctx.session.then((stats) => {
    stats.counter = 0;
  });
});
```

有人可能会争论说，明确地使用 `await` 比赋值一个 promise 给 `ctx.session` 要更好，但重点是如果你出于某种原因更喜欢这种风格，你 _可以_ 这样写。

::: tip 需要会话的插件
使用 `ctx.session` 的插件开发者应该始终允许用户传入 `SessionFlavor | LazySessionFlavor`，从而支持这两种模式。
在插件代码中，只需要一直 await `ctx.session`：如果一个非 promise 对象被传入，那么它将会简单地计算为它自己，因此你实际上只需要支持懒会话就能够自动支持严格的会话。
:::

## 存储增强

会话插件能够通过向存储添加更多功能来增强存储适配器：[超时](#超时) 和 [迁移](#迁移)。

可以使用 `enhanceStorage` 函数安装它们。

```ts
// 使用增强型存储适配器
bot.use(session({
  storage: enhanceStorage({
    storage: freeStorage(bot.token), // 修改这里
    // 更多配置在这里
  }),
}));
```

你也可以同时使用两者。

### 超时

超时增强功能可以向会话数据添加过期日期。
这意味着你可以指定一个时间段，如果会话在此期间从未更改，则特定聊天的数据将被删除。

你可以通过 `millisecondsToLive` 选项使用会话超时。

```ts
const enhanced = enhanceStorage({
  storage,
  millisecondsToLive: 30 * 60 * 1000, // 30 分钟
});
```

请注意，数据的实际删除只会在下次读取相应会话数据时发生。

### 迁移

如果你在已有会话数据的情况下进一步开发你的 bot，则迁移非常有用。
如果你想在不破坏所有先前数据的情况下更改会话数据，则可以使用它们。

这是通过为数据提供版本号，然后编写简单的迁移函数来实现的。
迁移函数定义了如何将会话数据从一个版本升级到下一个版本。

我们将尝试通过示例来说明这一点。
假设你存储了有关用户宠物的信息。
到目前为止，您只将宠物的名称存储在 `ctx.session.petNames` 中的字符串数组中。

```ts
interface SessionData {
  petNames: string[];
}
```

现在你知道您还想存储宠物的年龄。

你可以这样做：

```ts
interface SessionData {
  petNames: string[];
  petBirthdays?: number[];
}
```

这不会破坏你现有的会话数据。
然而，这不太好，因为现在姓名和生日存储在不同的地方。
理想情况下，你的会话数据应如下所示：

```ts
interface Pet {
  name: string;
  birthday?: number;
}

interface SessionData {
  pets: Pet[];
}
```

迁移函数让你可以将旧字符串数组转换为新的宠物对象数组。

:::code-group

```ts [TypeScript]
function addBirthdayToPets(old: { petNames: string[] }): SessionData {
  return {
    pets: old.petNames.map((name) => ({ name })),
  };
}

const enhanced = enhanceStorage({
  storage,
  migrations: {
    1: addBirthdayToPets,
  },
});
```

```js [JavaScript]
function addBirthdayToPets(old) {
  return {
    pets: old.petNames.map((name) => ({ name })),
  };
}

const enhanced = enhanceStorage({
  storage,
  migrations: {
    1: addBirthdayToPets,
  },
});
```

:::

每当读取会话数据时，存储增强功能都会检查会话数据是否已经处于版本 `1`。
如果版本较低（或因为你之前未使用此功能而丢失），则将运行迁移功能。
这会将数据升级到版本 `1`。
因此，在你的 bot 中，你始终可以假设你的会话数据具有最新的结构，存储增强将处理其余部分并根据需要迁移你的数据。

随着时间的推移和你的 bot 的进一步变化，你可以添加更多的迁移功能：

```ts
const enhanced = enhanceStorage({
  storage,
  migrations: {
    1: addBirthdayToPets,
    2: addIsFavoriteFlagToPets,
    3: addUserSettings,
    10: extendUserSettings,
    10.1: fixUserSettings,
    11: compressData,
  },
});
```

您可以选择任何 JavaScript 编号作为版本。
无论聊天的会话数据发展了多远，一旦被读取，它就会通过版本进行迁移，直到它使用最新的结构。

## 插件概述

这个插件是内置在 grammY 的核心中的。
你不需要安装任何东西来使用它。
只需要导入 grammY 即可。

并且，这个插件的文档和 API 参考都与核心包一致。
