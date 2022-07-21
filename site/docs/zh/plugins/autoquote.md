# 总是回复消息

有时，特别是对于打算在组中使用的机器人，有必要始终发送消息作为对开始交互的消息的回复（或引用）。通常，这样做的方法是手动将 `reply_to_message_id` 添加到发送消息的方法的参数中（`sendText` / `reply`、`sendPhoto` / `replyWithPhoto`）。但是，如果您对每条消息都这样做，它可能会变得有点混乱和累人。

该插件将每个 `send` 方法的 `reply_to_message_id` 参数的值设置为 `ctx.msg.message_id`（`sendChatAction` 除外，它不支持此参数），从而使每条消息都成为对触发消息的回复那个更新。

＃＃ 用法

### 对于单条路线

如果您希望从特定上下文（如特定命令）中发送的所有消息，请使用此选项

```ts
import { Bot } from "grammy";
import { addReplyParam } from "@roziscoding/grammy-autoquote";
// import { addReplyParam } from 'https://deno.land/x/grammy_autoquote/mod.ts'

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  ctx.reply("Demo command!"); // This will quote the user's message
});

bot.start();
```

### 每条路线的使用情况

如果您绝对希望从您的机器人发送的所有可能消息都引用触发消息，请使用此选项。

```ts
import { Bot } from "grammy";
import { autoQuote } from "@roziscoding/grammy-autoquote";
// import { autoQuote } from 'https://deno.land/x/grammy_autoquote/mod.ts'

const bot = new Bot("");

bot.use(autoQuote);

bot.command("demo", async (ctx) => {
  ctx.reply("Demo command!"); // This will quote the user's message
});

bot.command("hello", async (ctx) => {
  ctx.reply("Hi there :)"); // Also quotes the user's message
});

bot.start();
```

## 插件总结

- 名称：自动报价
- 来源：<https://github.com/roziscoding/grammy-autoquote>
- 参考：<https://doc.deno.land/https://deno.land/x/grammy_autoquote/mod.ts>
