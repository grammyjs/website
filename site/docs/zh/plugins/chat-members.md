# 聊天成员插件 (`chat-members`)

在聊天中自动存储有关用户的信息并轻松检索。
追踪群组和频道成员，并列出他们。

## 介绍

在许多情况下，bot 有必要了解给定聊天的所有用户的信息。
不过，目前 Telegram Bot API 没有公开允许我们检索此信息的方法。

这个插件来解决：自动监听 `chat_member` 事件并存储所有 `ChatMember` 对象。

## 使用方法

### 存储聊天成员

你可以使用有效的 grammY [存储适配器](./session.md#已知的存储适配器) 或任何实现 [`StorageAdapter`](https://deno.land/x/grammy/mod.ts?s=StorageAdapter) 接口的类的实例。

请注意，根据 [Telegram 官方文档](https://core.telegram.org/bots/api#getupdates)，你的 bot 需要在 `allowed_updates` 数组中指定 `chat_member` update，如下例所示。
这意味着你还需要指定你希望接收的任何其他事件。

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, type Context, MemorySessionStorage } from "grammy";
import { type ChatMember } from "grammy/types";
import { chatMembers, type ChatMembersFlavor } from "@grammyjs/chat-members";

type MyContext = Context & ChatMembersFlavor;

const adapter = new MemorySessionStorage<ChatMember>();

const bot = new Bot<MyContext>("<your bot token>");

bot.use(chatMembers(adapter));

bot.start({
  // 确保指定所需的 update 类型
  allowed_updates: ["chat_member", "message"],
});
```

</CodeGroupItem>

<CodeGroupItem title="JavaScript">

```js
import { Bot, MemorySessionStorage } from "grammy";
import { chatMembers } from "@grammyjs/chat-members";

const adapter = new MemorySessionStorage();

const bot = new Bot("");

bot.use(chatMembers(adapter));

bot.start({
  // 确保指定所需的 update 类型
  allowed_updates: ["chat_member", "message"],
});
```

</CodeGroupItem>

<CodeGroupItem title="Deno">

```ts
import {
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
  allowed_updates: ["chat_member", "message"],
});
```

</CodeGroupItem>

</CodeGroup>

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

请注意，这意味着**每个 update**都会调用存储，这可能很多，具体取决于你的 bot 接收到的 update 数量。
这有可能极大地影响你的 bot 的性能。
仅当你 _真的_ 知道自己在做什么并且可以接受风险和后果时才使用它。

## 插件概述

- 名字: `chat-members`
- 源码: <https://github.com/grammyjs/chat-members>
- 参考: <https://deno.land/x/grammy_chat_members/mod.ts>
