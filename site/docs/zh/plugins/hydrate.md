# Hydration（`hydrate`）

这个插件会安装一些有用的方法在两种类型的对象，即

1. API调用的结果, 和
2. 上下文对象 `ctx` 上的对象。

你现在可以直接调用对象上的方法, 它们就可以正常工作，而不需要调用 `ctx.api` 或 `bot.api`，也不需要提供各种标识符。
这一点最好用一个例子来说明。

在**没有**这个插件的情况下：

```ts
bot.on(":photo", async (ctx) => {
  const statusMessage = await ctx.reply("Processing");
  await doWork(ctx.msg.photo); // 一些漫长的图像处理
  await ctx.api.editMessageText(
    ctx.chat.id,
    statusMessage.message_id,
    "Done!",
  );
  setTimeout(
    () =>
      ctx.api.deleteMessage(ctx.chat.id, statusMessage.message_id).catch(
        () => {
          // 出错时什么也不做。
        },
      ),
    3000,
  );
});
```

在**有**这个插件的情况下：

```ts
bot.on(":photo", async (ctx) => {
  const statusMessage = await ctx.reply("Processing");
  await doWork(ctx.msg.photo); // 一些漫长的图像处理
  await statusMessage.editText("Done!"); // 看，如此简单！
  setTimeout(() => statusMessage.delete().catch(() => {}), 3000);
});
```

是不是非常简洁？

## 安装

有两种方式安装这个插件。

### 简单安装

这个插件可以简单直接地安装，应该可以满足绝大多数用户。

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context } from "grammy";
import { hydrate, HydrateFlavor } from "@grammyjs/hydrate";

type MyContext = HydrateFlavor<Context>;

const bot = new Bot<MyContext>("");

bot.use(hydrate());
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
import { Bot } from "grammy";
import { hydrate } from "@grammyjs/hydrate";

const bot = new Bot("");

bot.use(hydrate());
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  hydrate,
  HydrateFlavor,
} from "https://deno.land/x/grammy_hydrate/mod.ts";

type MyContext = HydrateFlavor<Context>;

const bot = new Bot<MyContext>("");

bot.use(hydrate());
```

</CodeGroupItem>
</CodeGroup>

### 高级安装

当使用简单安装时，只有通过 `ctx.api` 的 API 调用结果将被 hydrated，例如 `ctx.reply`。
这是大多数 bot 最常用的调用。

然而，有些 bot 可能需要调用 `bot.api`。
在这种情况下，你应该使用高级安装。

它将会在你的 bot 中分别集成上下文 hydration 和 API 调用结果 hydration。
请注意，你还需要安装一个 [API 调味剂](/zh/advanced/transformers.md#api-调味剂)。

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Api, Bot, Context } from "grammy";
import {
  hydrateApi,
  HydrateApiFlavor,
  hydrateContext,
  HydrateFlavor,
} from "@grammyjs/hydrate";

type MyContext = HydrateFlavor<Context>;
type MyApi = HydrateApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");

bot.use(hydrateContext());
bot.api.config.use(hydrateApi());
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
import { Bot } from "grammy";
import { hydrateApi, hydrateContext } from "@grammyjs/hydrate";

const bot = new Bot("");

bot.use(hydrateContext());
bot.api.config.use(hydrateApi());
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Api, Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  hydrateApi,
  HydrateApiFlavor,
  hydrateContext,
  HydrateFlavor,
} from "https://deno.land/x/grammy_hydrate/mod.ts";

type MyContext = HydrateFlavor<Context>;
type MyApi = HydrateApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");

bot.use(hydrateContext());
bot.api.config.use(hydrateApi());
```

</CodeGroupItem>
</CodeGroup>

## 什么对象会被 hydrated

这个插件目前会 hydrates

- 消息和频道消息
- 编辑过的消息和编辑过的频道消息
- 回调查询
- inline 查询
- 选定的 inline 结果
- web 应用查询
- 预付款和配送查询

所有对象都会被 hydrated 在

- 在上下文对象 `ctx` 中，
- 上下文对象中的 update 对象 `ctx.update`，
- 上下文对象的快捷方式，例如 `ctx.msg`，
- 适用的 API 调用结果。

## 插件概述

- 名字：`hydrate`
- 源码：<https://github.com/grammyjs/hydrate>
- 参考：<https://doc.deno.land/https://deno.land/x/grammy_hydrate/mod.ts>
