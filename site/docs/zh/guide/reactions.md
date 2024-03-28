# 反应

Bot 可以处理消息反应
有两种类型的反应：emoji 反应和自定义 emoji 反应。

## 对消息做出反应

Bot 可以向消息添加单个 emoji 反应。

在相同的情况下，bot 也可以使用自定义 emoji 做出反应（即使 bot 无法拥有 [Telegram Premium](https://telegram.org/faq_premium?setln=en)）。
当高级用户向消息添加自定义 emoji 反应时，bot 稍后可以向该消息添加相同的反应。
此外，如果聊天管理员明确允许使用自定义 emoji，则该聊天中的 bot 也可以使用它们。

以下是你可以如何对消息做出反应。

```ts
// 使用 `ctx.react` 对当前消息做出反应。
bot.command("start", (ctx) => ctx.react("😍"));
bot.on("message", (ctx) => ctx.react("👍"));

// 使用 `ctx.api.setMessageReaction` 对其他地方的消息做出反应。
bot.on("message", async (ctx) => {
  await ctx.api.setMessageReaction(chat_id, message_id, "🎉");
});

// 在处理程序外的使用 `bot.api.setMessageReaction`。
await bot.api.setMessageReaction(chat_id, message_id, "💯");
```

与往常一样，TypeScript 将为你可以使用的 emoji 提供自动补全功能。
可用 emoji 反应的列表可以在 [此处](https://core.telegram.org/bots/api#reactiontypeemoji) 找到。

::: tip Emoji 插件
使用 emoji 进行编程可能会很丑陋。
并非所有系统都可以正确显示你的源代码。
而且，总是从不同的地方复制它们也很烦人。

让 [emoji 插件](../plugins/emoji#有用的反应数据) 帮助你！
:::

现在你已经知道 bot 如何对消息做出反应，让我们看看如何处理用户的反应。

## 接收有关反应的 Update

有几种不同的方法可以处理有关反应的 update。
在私聊和群聊中，如果用户更改了对消息的反应，你的 bot 将收到 `message_reaction` update。
在频道（自动转发到群聊中的频道帖子）中，你的 bot 将收到 `message_reaction_count` update，该 update 仅显示反应总数，但不会透露谁做出了反应。

这两种类型的反应都需要先启用才能接收。
例如，通过内置轮询，你可以像这样启用它们：

```ts
bot.start({
  allowed_updates: ["message", "message_reaction", "message_reaction_count"],
});
```

::: tip 启用所有 update 类型
你需要从 grammY 导入 `API_CONSTANTS`，然后设置

```ts
allowed_updates: API_CONSTANTS.ALL_UPDATE_TYPES;
```

来接收所有 update。
请务必查看 [API 参考](/ref/core/apiconstants#ALL_UPDATE_TYPES)。
:::

[grammY runner](../plugins/runner#高级选项) 和 `setWebhook` 有着相同的方式来设置 `allowed_updates`。

现在你的 bot 可以接收反应 update，让我们看看它是如何处理它们的！

### 处理新的反应

处理新添加的反应非常简单。
grammY 通过 `bot.reaction` 对此提供了特殊支持。

```ts
bot.reaction("🎉", (ctx) => ctx.reply("呜呼~"));
bot.reaction(["👍", "👎"], (ctx) => ctx.reply("漂亮的大拇指"));
```

每当用户向消息添加新的 emoji 反应时，这些处理程序就会触发。

当然，如果你的 bot 可以处理高级用户的自定义 emoji 反应，你也可以监听它们。

```ts
bot.reaction(
  { type: "custom_emoji", custom_emoji_id: "identifier-string" },
  async (ctx) => {/* ... */},
);
```

这就需要你提前知道自定义 emoji 的标识符。

### 处理任意变化的反应

尽管这在任何官方 Telegram 客户端的 UI 中都不可见，但用户实际上可以一次更改多个反应。
这就是为什么反应 update 会为你提供两个列表：旧反应和新反应。
这允许你的 bot 处理对反应列表的任意更改。

```ts
bot.on("message_reaction", async (ctx) => {
  const reaction = ctx.messageReaction;
  // 我们只接收消息标识符，而不接收消息内容。
  const message = reaction.message_id;
  // 这两个列表之间的差异展示了变化。
  const old = reaction.old_reaction; // 之前的
  const now = reaction.new_reaction; // 当前的
});
```

grammY 允许你使用针对反应类型的特殊的 [filter 查询](./filter-queries) 进一步过滤 update。

```ts
// 当前的反应至少包含一个 emoji 的 update。
bot.on("message_reaction:new_reaction:emoji", (ctx) => {/* ... */});
// 之前的反应至少包含一个自定义 emoji 的 update。
bot.on("message_reaction:old_reaction:custom_emoji", (ctx) => {/* ... */});
```

虽然这两个 [`ReactionType` 对象](https://core.telegram.org/bots/api#reactiontype) 数组在技术上为你提供了处理反应 update 所需的所有信息，但它们用起来仍然有点麻烦。
这就是为什么 grammY 可以从 update 中计算出更多有用的东西。

### 查看反应如何变化

有一个名为 `ctx.reactions` 的 [上下文快捷方式](./context#快捷方式)，可让你查看反应到底是如何变化的。

以下是如何使用 `ctx.reactions` 来检测用户是否取消了他们的点赞（但如果他们仍然保持ok手势反应，则原谅他们）。

```ts
bot.on("message_reaction", async (ctx) => {
  const { emoji, emojiAdded, emojiRemoved } = ctx.reactions();
  if (emojiRemoved.includes("👍")) {
    // 点赞已被删除！不可接受。
    if (emoji.includes("👌")) {
      // 还是可以的，不处罚
      await ctx.reply("我原谅你");
    } else {
      // 他们怎么敢的，给丫封了。
      await ctx.banAuthor();
    }
  }
});
```

`ctx.reaction` 返回四个数组：添加的 emoji、删除的 emoji、保留的emoji，以及一个告诉你更改结果的列表。
此外，还有四个具有类似信息的自定义 emoji 数组。

```ts
const {
  /** 当前存在在该用户的反应中的 emoji */
  emoji,
  /** 新添加了到该用户的反应中的 emoji */
  emojiAdded,
  /** 未因该用户反应的 update 而改变的 emoji */
  emojiKept,
  /** 从该用户的反应中移除的 emoji */
  emojiRemoved,
  /** 当前存在在该用户的反应中的自定义 emoji */
  customEmoji,
  /** 新添加了到该用户的反应中的自定义 emoji */
  customEmojiAdded,
  /** 未因该用户反应的 update 而改变的自定义 emoji */
  customEmojiKept,
  /** 从该用户的反应中移除的自定义 emoji */
  customEmojiRemoved,
} = ctx.reactions();
```

关于处理私聊和群聊中的 update 已经说了很多。
我们来看看频道。

### 处理反应计数 Update

在私聊、群组和超级群组中，我们知道谁对哪条消息做出反应。
但是，对于频道帖子，我们只有一个匿名的反应列表。
我们无法获取对某个帖子做出反应的用户列表。
自动转发到讨论组聊天的频道帖子也是如此。

在这两种情况下，你的 bot 都会收到一个 `message_reaction_count` update。

你可以这样处理它。

```ts
bot.on("message_reaction_count", async (ctx) => {
  const counts = ctx.messageReactionCount;
  // 同样，我们只能看到消息标识符。
  const message = counts.message_id;
  // 这是带有计数的反应列表。
  const { reactions } = counts;
});
```

请务必查看 [规范](https://core.telegram.org/bots/api#messagereactioncountupdated) 以获取消息反应计数 update。
