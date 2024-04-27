# Telegram Business

Telegram Business 允许 bot 管理你与其他（真人）用户的私聊。
这包括以你的名义发送和接收信息。
通常情况下，如果你在 Telegram 上开展业务，而其他用户是你的客户，那么这将非常有用。

> 如果你对 Telegram Business 还不熟悉，请先查看 Telegram 的 [官方文档](https://core.telegram.org/bots#manage-your-business)，之后再继续。

当然，grammY 对此也是完全支持的。

## 处理 Business 消息

Bot 可以通过 Telegram Business 管理两个用户之间的私聊---一个订阅了 Telegram 商业订阅的帐号。
管理私聊是通过像 [这样](/ref/types/businessconnection) 的 _business connection_ 对象实现的。

### 接收 Business 消息

一旦建立了 business connection，bot 就会从 _聊天双方_ **接收消息**。

```ts
bot.on("business_message", async (ctx) => {
  // 访问消息对象.
  const message = ctx.businessMessage;
  // 也可以使用快捷方式
  const msg = ctx.msg;
});
```

至此，我们还不清楚两名聊天参与者中谁发送了消息。
这可能是你的客户发送的信息---但也可能是你自己（不是你的 bot）发送的消息！

因此，我们需要区分这两个用户。
为此，我们需要查看前面提到的 business connection 对象。
business connection 会告诉我们谁是业务账户用户，也就是你（或你的员工之一）的用户标识符。

```ts
bot.on("business_message", async (ctx) => {
  // 获取有关 business connection 的信息。
  const conn = await ctx.getBusinessConnection();
  const employee = conn.user;
  // 查看是谁发送的这条消息
  if (ctx.from.id === employee.id) {
    // 你发送的这条消息
  } else {
    // 你的客户发送的这条消息
  }
});
```

你还可以通过 [这样](#使用-business-connection) 做来跳过每次 update 都调用 `getBusinessConnection` 的过程。

### 发送消息

你的 bot 可以向该聊天**发送消息**，而 _无需成为该聊天的成员_。
它可以按预想的那样与 `ctx.reply` 及其所有变体一起使用。
grammY 会检查 [上下文快捷方式](../guide/context#快捷方式) `ctx.businessConnectionId` 是否可用，以便它可以将消息发送到托管的业务聊天。

```ts
bot.on("business_message").filter(
  async (ctx) => {
    const conn = await ctx.getBusinessConnection();
    return ctx.from.id !== conn.user.id;
  },
  async (ctx) => {
    // 自动回复所有客户问题。
    if (ctx.msg.text.endsWith("?")) {
      await ctx.reply("Soon.");
    }
  },
);
```

这看起来就像是你自己发送的消息。
你的客户无法分辨消息是手动发送的还是通过你的 bot 发送的。
（不过，你会看到一个小小的提示。）
（但你的 bot 可能比你回复得更快。
抱歉。）

## 更深入一点

将你的 bot 与 Telegram Business 整合时，还有一些事项需要考虑。
我们将在此简要介绍几个方面。

### 编辑或删除 Business 消息

当你或你的客户编辑或删除聊天消息时，你的 bot 会收到通知。
更具体地说，你将收到 `edited_business_message` 或 `deleted_business_messages` update。
你的 bot 可以正常使用 `bot.on` 及其无数的 [filter queries](../guide/filter-queries) 处理它们。

然而，你的 bot **不能**编辑或删除聊天中的消息。
同样，你的 bot 也**不能**转发消息，或将其复制到其他地方。
所有这些事情都留给真人去做。

### 使用 Business Connection

当 bot 被关联到一个企业账户时，它将收到一个 `business_connection` update。
当 bot 被断开联系或以不同方式编辑关联时，也会收到此 update。

例如，bot 可以向其管理的聊天发送消息，也可以不发送。
你可以使用 `:can_reply` query 来捕捉到这一点。

```ts
bot.on("business_connection:can_reply", async (ctx) => {
  // 关联允许发送信息。
});
```

在数据库中存储 business connection 对象非常有意义。
这样，你就可以避免每次 update 都调用 `ctx.getBusinessConnection()` 仅仅为了 [查看谁发送了消息](#接收-business-消息)。

此外，`business_connection` update 包含一个 `user_chat_id`。
这个聊天标识符可用于发起与 bot 所关联的用户的对话。

```ts
bot.on("business_connection:is_enabled", async (ctx) => {
  const id = ctx.businessConnection.user_chat_id;
  await ctx.api.sendMessage(id, "Thanks for connecting me!");
});
```

即使用户尚未启动你的 bot，这也能正常工作。

### 管理单个聊天

If you connect a bot to manage your account, Telegram apps will offer you a button to manage this bot in each managed chat.
如果你关联了一个 bot 来管理你的账号，Telegram 应用程序会在每个托管的聊天中为你提供一个管理这个 bot 的按钮。
该按钮将向 bot 发送 `/start`。

该启动命令具有一个由 Telegram 定义的特殊 [深度链接](../guide/commands#深度链接支持) payload。
它的格式为 `bizChatXXXXX`，其中 `XXXXX` 将是托管聊天的聊天标识符。

```ts
bot.command("start", async (ctx) => {
  const payload = ctx.match;
  if (payload.startsWith("bizChat")) {
    const id = payload.slice(7); // 剥离掉 `bizChat`
    await ctx.reply(`Let's manage chat #${id}!`);
  }
});
```

这为你的 bot 提供了重要的上下文环境，使其能够从与每位客户的对话中管理个人业务聊天。
