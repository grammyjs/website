---
prev: false
next: false
---

# 聊天成员插件 (`chat-members`)

Telegram 在 Bot API 中并没有提供获取聊天成员的方法，因此你需要自己去追踪他们。
这个插件让处理 `ChatMember` 对象变得更简单 —— 它通过自定义 filter 提供了一种方便的方式来监听成员状态的变化，并负责存储和更新这些对象。

## 介绍

在使用 Telegram Bot API 中的 `ChatMember` 对象时，有时会显得比较繁琐。
在大多数应用场景中，有几种不同的成员状态经常是可以互换的。
此外，受限状态比较模糊，因为它既可能表示群内的受限成员，也可能表示那些已不在群中的受限用户。

这个插件通过为聊天成员 update 提供强类型过滤器，从而简化了处理聊天成员的过程。

## 使用方法

### 聊天成员 filter

在使用 Telegram bot 时，你可以监听两种与聊天成员相关的 update：`chat_member` 和 `my_chat_member`。 这两种 update 都会包含用户的旧状态和新状态。

- `my_chat_member` update 总是会被你的 bot 接收，用于告知你 bot 在任意聊天中的状态变化，以及当用户拉黑了 bot。
- `chat_member` update 只有在你显式地将其包含在允许的 update 列表中时才会接收，它用于通知 bot 作为 **管理员** 的聊天中用户的任何状态变化。

与手动筛选旧状态和新状态相反，聊天成员 filter 会自动为你完成这一步，使你能够针对感兴趣的任意类型的状态变化进行处理。
在处理程序中，`old_chat_member` 和 `new_chat_member` 的类型会相应地缩小范围。

::: code-group

```ts [TypeScript]
import { API_CONSTANTS, Bot } from "grammy";
import { chatMemberFilter, myChatMemberFilter } from "@grammyjs/chat-members";

const bot = new Bot("");
const groups = bot.chatType(["group", "supergroup"]);

// 如果没有这个插件，每当用户加入群组时，你都必须
// 手动按状态进行筛选，这会导致代码容易出错且难以阅读。
groups.on("chat_member").filter(
  (ctx) => {
    const { old_chat_member: oldMember, new_chat_member: newMember } =
      ctx.chatMember;
    return (
      (["kicked", "left"].includes(oldMember.status) ||
        (oldMember.status === "restricted" && !oldMember.is_member)) &&
      (["administrator", "creator", "member"].includes(newMember.status) ||
        (newMember.status === "restricted" && newMember.is_member))
    );
  },
  (ctx) => {
    const user = ctx.chatMember.new_chat_member.user;
    await ctx.reply(`Welcome ${user.first_name} to the group!`);
  },
);

// 使用此插件，代码将大大简化，出错的风险也会降低。
// 下面的代码监听相同的事件，但要简单得多。
groups.filter(chatMemberFilter("out", "in"), async (ctx) => {
  const user = ctx.chatMember.new_chat_member.user;
  await ctx.reply(`Welcome ${user.first_name} to the group!`);
});

// 监听 bot 作为普通用户加入群组的 update。
groups.filter(myChatMemberFilter("out", "regular"), async (ctx) => {
  await ctx.reply("Hello, thank you for adding me to the group!");
});

// 监听 bot 作为管理员加入群组的 update。
groups.filter(myChatMemberFilter("out", "admin"), async (ctx) => {
  await ctx.reply("Hello, thank you for adding me to the group as admin!");
});

// 监听 bot 被设为管理员的 update。
groups.filter(myChatMemberFilter("regular", "admin"), async (ctx) => {
  await ctx.reply("I was promoted to admin!");
});

// 监听 bot 被降级为普通用户的 update。
groups.filter(myChatMemberFilter("admin", "regular"), async (ctx) => {
  await ctx.reply("I am no longer admin");
});

bot.start({
  // 请确保包含 "chat_member" update 类型，以便上述处理程序能够正常工作。
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

```js [JavaScript]
import { API_CONSTANTS, Bot } from "grammy";
import { chatMemberFilter, myChatMemberFilter } from "@grammyjs/chat-members";

const bot = new Bot("");
const groups = bot.chatType(["group", "supergroup"]);

// 如果没有这个插件，每当用户加入群组时，你都必须
// 手动按状态进行筛选，这会导致代码容易出错且难以阅读。
groups.on("chat_member").filter(
  (ctx) => {
    const { old_chat_member: oldMember, new_chat_member: newMember } =
      ctx.chatMember;
    return (
      (["kicked", "left"].includes(oldMember.status) ||
        (oldMember.status === "restricted" && !oldMember.is_member)) &&
      (["administrator", "creator", "member"].includes(newMember.status) ||
        (newMember.status === "restricted" && newMember.is_member))
    );
  },
  (ctx) => {
    const user = ctx.chatMember.new_chat_member.user;
    await ctx.reply(`Welcome ${user.first_name} to the group!`);
  },
);

// 使用此插件，代码将大大简化，出错的风险也会降低。
// 下面的代码监听相同的事件，但要简单得多。
groups.filter(chatMemberFilter("out", "in"), async (ctx) => {
  const user = ctx.chatMember.new_chat_member.user;
  await ctx.reply(`Welcome ${user.first_name} to the group!`);
});

// 监听 bot 作为普通用户加入群组的 update。
groups.filter(myChatMemberFilter("out", "regular"), async (ctx) => {
  await ctx.reply("Hello, thank you for adding me to the group!");
});

// 监听 bot 作为管理员加入群组的 update。
groups.filter(myChatMemberFilter("out", "admin"), async (ctx) => {
  await ctx.reply("Hello, thank you for adding me to the group as admin!");
});

// 监听 bot 被设为管理员的 update。
groups.filter(myChatMemberFilter("regular", "admin"), async (ctx) => {
  await ctx.reply("I was promoted to admin!");
});

// 监听 bot 被降级为普通用户的 update。
groups.filter(myChatMemberFilter("admin", "regular"), async (ctx) => {
  await ctx.reply("I am no longer admin");
});

bot.start({
  // 请确保包含 "chat_member" update 类型，以便上述处理程序能够正常工作。
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

```ts [Deno]
import { API_CONSTANTS, Bot } from "https://deno.land/x/grammy/mod.ts";
import {
  chatMemberFilter,
  myChatMemberFilter,
} from "https://deno.land/x/grammy_chat_members/mod.ts";

const bot = new Bot("");
const groups = bot.chatType(["group", "supergroup"]);

// 如果没有这个插件，每当用户加入群组时，你都必须
// 手动按状态进行筛选，这会导致代码容易出错且难以阅读。
groups.on("chat_member").filter(
  (ctx) => {
    const { old_chat_member: oldMember, new_chat_member: newMember } =
      ctx.chatMember;
    return (
      (["kicked", "left"].includes(oldMember.status) ||
        (oldMember.status === "restricted" && !oldMember.is_member)) &&
      (["administrator", "creator", "member"].includes(newMember.status) ||
        (newMember.status === "restricted" && newMember.is_member))
    );
  },
  (ctx) => {
    const user = ctx.chatMember.new_chat_member.user;
    await ctx.reply(`Welcome ${user.first_name} to the group!`);
  },
);

// 使用此插件，代码将大大简化，出错的风险也会降低。
// 下面的代码监听相同的事件，但要简单得多。
groups.filter(chatMemberFilter("out", "in"), async (ctx) => {
  const user = ctx.chatMember.new_chat_member.user;
  await ctx.reply(`Welcome ${user.first_name} to the group!`);
});

// 监听 bot 作为普通用户加入群组的 update。
groups.filter(myChatMemberFilter("out", "regular"), async (ctx) => {
  await ctx.reply("Hello, thank you for adding me to the group!");
});

// 监听 bot 作为管理员加入群组的 update。
groups.filter(myChatMemberFilter("out", "admin"), async (ctx) => {
  await ctx.reply("Hello, thank you for adding me to the group as admin!");
});

// 监听 bot 被设为管理员的 update。
groups.filter(myChatMemberFilter("regular", "admin"), async (ctx) => {
  await ctx.reply("I was promoted to admin!");
});

// 监听 bot 被降级为普通用户的 update。
groups.filter(myChatMemberFilter("admin", "regular"), async (ctx) => {
  await ctx.reply("I am no longer admin");
});

bot.start({
  // 请确保包含 "chat_member" update 类型，以便上述处理程序能够正常工作。
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

:::

filter 包括常规状态（所有者、管理员、成员、受限、离开、踢出）以及一些为了方便起见而添加的其他状态：

- `restricted_in`：聊天内的受限成员
- `restricted_out`：非聊天内的受限成员
- `in`：聊天成员（administrator, creator, member, restricted_in）
- `out`：非聊天成员（left, kicked, restricted_out）
- `free`：非受限聊天成员（administrator, creator, member）
- `admin`：管理员（administrator, creator）
- `regular`：非管理员（member, restricted_in）

总而言之，下图展示了每个查询对应的内容：

![图示显示了每个查询对应的状态。](/images/chat-members-statuses.svg)

你可以通过传递数组而不是字符串来创建自定义的聊天成员类型分组：

```typescript
groups.filter(
  chatMemberFilter(["restricted", "kicked"], ["free", "left"]),
  async (ctx) => {
    const from = ctx.from;
    const { status: oldStatus, user } = ctx.chatMember.old_chat_member;
    const lifted = oldStatus === "kicked" ? "ban" : "restrictions";
    await ctx.reply(
      `${from.first_name} lifted ${lifted} from ${user.first_name}`,
    );
  },
);
```

#### 用法示例

使用 filter 的最佳方法是选择一组相关的状态，例如 `out`, `regular` 和 `admin`，然后创建一个表格，列出它们之间的转换：

| ↱         | `out`    | `regular` | `admin`    |
| --------- | -------- | --------- | ---------- |
| `out`     | 封禁改变 | 加入      | 加入并晋升 |
| `regular` | 退出     | 限制改变  | 晋升       |
| `admin`   | 退出     | 降级      | 权限改变   |

为你的用例相关的所有转换分配监听器。

将这些 filter 与 `bot.chatType` 结合使用，即可仅监听特定类型聊天的转换。
添加一个中间件来监听所有 update，以便在将控制权交给特定处理程序之前执行常见操作（例如更新数据库）。


```typescript
const groups = bot.chatType(["group", "supergroup"]);

groups.on("chat_member", async (ctx, next) => {
  // 对所有类型为 chat_member 的 update 都执行
  const {
    old_chat_member: { status: oldStatus },
    new_chat_member: { user, status },
    from,
    chat,
  } = ctx.chatMember;
  console.log(
    `In group ${chat.id} user ${from.id} changed status of ${user.id}:`,
    `${oldStatus} -> ${status}`,
  );

  // 在这里更新数据库

  await next();
});

// 特定处理程序

groups.filter(chatMemberFilter("out", "in"), async (ctx, next) => {
  const { new_chat_member: { user } } = ctx.chatMember;
  await ctx.reply(`Welcome ${user.first_name}!`);
});
```

### 状态检查实用程序

当你想在处理程序中使用过滤逻辑时，`chatMemberIs` 函数会非常有用。
它接受任何常规状态和自定义状态（或它们的数组）作为输入，并缩小传递变量的类型。

```ts
bot.callbackQuery("foo", async (ctx) => {
  const chatMember = await ctx.getChatMember(ctx.from.id);

  if (!chatMemberIs(chatMember, "free")) {
    chatMember.status; // "restricted" | "left" | "kicked"
    await ctx.answerCallbackQuery({
      show_alert: true,
      text: "You don't have permission to do this!",
    });
    return;
  }

  chatMember.status; // "creator" | "administrator" | "member"
  await ctx.answerCallbackQuery("bar");
});
```

### 增强聊天成员对象

你可以通过使用 hydration [API transformer](../advanced/transformers) 进一步改进开发体验。
这个 transformer 会作用于 `getChatMember` 和 `getChatAdministrators` 的调用，为返回的 `ChatMember` 对象添加一个方便的 `is` 方法。

```ts
type MyContext = HydrateChatMemberFlavor<Context>;
type MyApi = HydrateChatMemberApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");

bot.api.config.use(hydrateChatMember());

bot.command("ban", async (ctx) => {
  const author = await ctx.getAuthor();

  if (!author.is("admin")) {
    author.status; // "member" | "restricted" | "left" | "kicked"
    await ctx.reply("You don't have permission to do this");
    return;
  }

  author.status; // "creator" | "administrator"
  // ...
});
```

### 存储聊天成员

你可以使用有效的 grammY [存储适配器](./session#已知的存储适配器) 或任何实现 [`StorageAdapter`](/ref/core/storageadapter) 接口的类的实例。

请注意，根据 [Telegram 官方文档](https://core.telegram.org/bots/api#getupdates)，你的 bot 需要在 `allowed_updates` 数组中指定 `chat_member` update，如下例所示。
这意味着你还需要指定你希望接收的任何其他事件。

::: code-group

```ts [TypeScript]
import { API_CONSTANTS, Bot, type Context, MemorySessionStorage } from "grammy";
import { type ChatMember } from "grammy/types";
import { chatMembers, type ChatMembersFlavor } from "@grammyjs/chat-members";

type MyContext = Context & ChatMembersFlavor;

const adapter = new MemorySessionStorage<ChatMember>();

const bot = new Bot<MyContext>("<your bot token>");

bot.use(chatMembers(adapter));

bot.start({
  // 确保指定所需的 update 类型
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

```js [JavaScript]
import { API_CONSTANTS, Bot, MemorySessionStorage } from "grammy";
import { chatMembers } from "@grammyjs/chat-members";

const adapter = new MemorySessionStorage();

const bot = new Bot("");

bot.use(chatMembers(adapter));

bot.start({
  // 确保指定所需的 update 类型
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

```ts [Deno]
import {
  API_CONSTANTS,
  Bot,
  type Context,
  MemorySessionStorage,
} from "https://deno.land/x/grammy/mod.ts";
import { type ChatMember } from "https://deno.land/x/grammy/types.ts";
import {
  chatMembers,
  type ChatMembersFlavor,
} from "https://deno.land/x/grammy_chat_members/mod.ts";

type MyContext = Context & ChatMembersFlavor;

const adapter = new MemorySessionStorage<ChatMember>();

const bot = new Bot<MyContext>("<your bot token>");

bot.use(chatMembers(adapter));

bot.start({
  // 确保指定所需的 update 类型
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

:::

### 读取聊天成员

此插件还添加了一个新的 `ctx.chatMembers.getChatMember` 函数，该函数将在向 Telegram 查询之前检查有关聊天成员信息的存储。
如果聊天成员在存储中存在，则返回。
否则，将调用 `ctx.api.getChatMember` 并将结果保存到存储中，从而使后续调用更快，并且将来无需为该用户和聊天再次调用 Telegram。

以下是一个例子：

```ts
bot.on("message", async (ctx) => {
  const chatMember = await ctx.chatMembers.getChatMember();

  return ctx.reply(
    `Hello, ${chatMember.user.first_name}! I see you are a ${chatMember.status} of this chat!`,
  );
});
```

此函数接受以下可选参数：

- `chatId`:
  - 默认: `ctx.chat.id`
  - 聊天标识符
- `userId`:
  - 默认: `ctx.from.id`
  - 用户标识符

你可以像这样传递它们：

```ts
bot.on("message", async (ctx) => {
  const chatMember = await ctx.chatMembers.getChatMember(
    ctx.chat.id,
    ctx.from.id,
  );
  return ctx.reply(
    `Hello, ${chatMember.user.first_name}! I see you are a ${chatMember.status} of this chat!`,
  );
});
```

请注意，如果你不提供聊天标识符并且上下文中没有 `chat` 属性（例如，在 inline query update 中），这将抛出一个错误。
如果上下文中没有 `ctx.from`，也会发生同样的情况。

## 激进的存储

`enableAggressiveStorage` 配置选项将安装中间件来缓存聊天成员，而不依赖于 `chat_member` 事件。
对于每个 update，中间件都会检查 `ctx.chat` 和 `ctx.from` 是否存在。
如果他们都存在，则它会继续调用 `ctx.chatMembers.getChatMember` 以将聊天成员信息添加到存储中，以免它不存在。

请注意，这意味着 **每个 update** 都会调用存储，这可能很多，具体取决于你的 bot 接收到的 update 数量。
这有可能极大地影响你的 bot 的性能。
仅当你 _真的_ 知道自己在做什么并且可以接受风险和后果时才使用它。

## 插件概述

- 名字: `chat-members`
- [源码](https://github.com/grammyjs/chat-members)
- [参考](/ref/chat-members/)
