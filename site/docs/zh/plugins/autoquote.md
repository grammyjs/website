# 总是回复消息

有时候有必要总是将消息作为回复发送，特别是对于那些打算要在群组中使用的 bot。
我们通常通过在发送消息的方法中添加 `reply_to_message_id` 参数来实现这一点：`sendText`, `reply`, `sendPhoto`, `replyWithPhoto` 等等。
然而，如果你对每一条消息都这样做，这会使得代码变得很无聊和繁琐。

这个插件将所有 `reply*` 和 `send*` 方法的 `reply_to_message_id` 参数设置为 `ctx.msg.message_id`，以便每条消息都是对触发这条消息的回复。

## 使用方式

### 在指定的路由中

如果你想让所有在特定上下文的消息进行回复（比如特定的命令），你可以专门应用这个插件到它们上面：

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";
import { addReplyParam } from "@roziscoding/grammy-autoquote";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("Demo command!"); // 这将会引用用户的消息
});

bot.start();
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");
const { addReplyParam } = require("@roziscoding/grammy-autoquote");

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("Demo command!"); // 这将会引用用户的消息
});

bot.start();
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { addReplyParam } from "https://deno.land/x/grammy_autoquote/mod.ts";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("Demo command!"); // 这将会引用用户的消息
});

bot.start();
```

</CodeGroupItem>
</CodeGroup>

### 在所有路由中

如果你希望每条发送的消息都回复触发它的消息，你可以通过这样的方式应用这个插件：

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";
import { autoQuote } from "@roziscoding/grammy-autoquote";

const bot = new Bot("");

bot.use(autoQuote);

bot.command("demo", async (ctx) => {
  await ctx.reply("Demo command!"); // 这将会引用用户的消息
});

bot.command("hello", async (ctx) => {
  await ctx.reply("Hi there :)"); // 这也会引用用户的消息
});

bot.start();
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");
const { autoQuote } = require("@roziscoding/grammy-autoquote");

const bot = new Bot("");

bot.use(autoQuote);

bot.command("demo", async (ctx) => {
  await ctx.reply("Demo command!"); // 这将会引用用户的消息
});

bot.command("hello", async (ctx) => {
  await ctx.reply("Hi there :)"); // 这也会引用用户的消息
});

bot.start();
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { autoQuote } from "https://deno.land/x/grammy_autoquote/mod.ts";

const bot = new Bot("");

bot.use(autoQuote);

bot.command("demo", async (ctx) => {
  await ctx.reply("Demo command!"); // 这将会引用用户的消息
});

bot.command("hello", async (ctx) => {
  await ctx.reply("Hi there :)"); // 这也会引用用户的消息
});

bot.start();
```

</CodeGroupItem>
</CodeGroup>

## 插件概述

- 名字：Autoquote
- 源码：<https://github.com/roziscoding/grammy-autoquote>
- API 参考：<https://deno.land/x/grammy_autoquote/mod.ts>
