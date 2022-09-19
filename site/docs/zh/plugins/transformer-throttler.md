# 流量控制（`transformer-throttler`）

![官方维护](/badges/official-zh.svg) ![Deno](/badges/deno.svg) ![Node.js](/badges/nodejs.svg)

这个插件通过 [Bottleneck](https://github.com/SGrondin/bottleneck) 对传出的 API 请求实例进行排队，以防止你的 bot 被 [限流](https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this)，正如在 [这个高级部分](../advanced/flood.md) 的文档中描述的那样。

::: warning 不存在文档中的 API 限制
Telegram 实现了一些未指定的和无文档的 API 调用的限制。
这些无文档的限制**不被限流器计算**。
如果你在某些 API 调用出现 floodwait 错误，例如 `api.sendContact`，请考虑将 [auto-retry 插件](./auto-retry.md) 和这个插件一起使用。
:::

## 使用方法

这里是使用默认选项的一个示例。
请注意，默认选项与 Telegram 所实现的限制率一致，因此它们应该可以正常使用。

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";
import { run } from "@grammyjs/runner";
import { apiThrottler } from "@grammyjs/transformer-throttler";

const botToken = process.env.BOT_TOKEN;
if (!botToken) {
  throw Error("BOT_TOKEN is required");
}
const bot = new Bot(botToken);

const throttler = apiThrottler();
bot.api.config.use(throttler);

bot.command("/example", (ctx) => ctx.reply("I am throttled"));

// 如果你使用了限流器，你可能想要使用一个 runner 来并发处理 update。
run(bot);
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");
const { run } = require("@grammyjs/runner");
const { apiThrottler } = require("@grammyjs/transformer-throttler");

const botToken = process.env.BOT_TOKEN;
if (!botToken) {
  throw Error("BOT_TOKEN is required");
}
const bot = new Bot(botToken);

const throttler = apiThrottler();
bot.api.config.use(throttler);

bot.command("/example", (ctx) => ctx.reply("I am throttled"));

// 如果你使用了限流器，你可能想要使用一个 runner 来并发处理 update。
run(bot);
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { run } from "https://deno.land/x/grammy_runner/mod.ts";
import { apiThrottler } from "https://deno.land/x/grammy_transformer_throttler/mod.ts";

const botToken = Deno.env.get("BOT_TOKEN");
if (!botToken) {
  throw Error("BOT_TOKEN is required");
}
const bot = new Bot(botToken);

const throttler = apiThrottler();
bot.api.config.use(throttler);

bot.command("/example", (ctx) => ctx.reply("I am throttled"));

// 如果你使用了限流器，你可能想要使用一个 runner 来并发处理 update。
run(bot);
```

</CodeGroupItem>
</CodeGroup>

## 配置

限流器接受一个可选的参数，其形式如下：

```ts
type ThrottlerOptions = {
  global?: Bottleneck.ConstructorOptions; // 限制所有 API 调用
  group?: Bottleneck.ConstructorOptions; // 限制传出群组消息
  out?: Bottleneck.ConstructorOptions; // 限制传出私人消息
};
```

`Bottleneck.ConstructorOptions` 可用的所有属性可以在 [Bottleneck](https://github.com/SGrondin/bottleneck#constructor) 中找到。

如果没有传入参数，限流器创建时将使用默认配置，这些配置应该适用于大多数情况。
默认配置如下：

```ts
// 传出的全局限流器
const globalConfig = {
  reservoir: 30, // 限流器开始时可以接受的新任务数
  reservoirRefreshAmount: 30, // 限流器刷新后可以接受的新任务数
  reservoirRefreshInterval: 1000, // 限流器刷新的间隔时间（毫秒）
};

// 传出的群组限流器
const groupConfig = {
  maxConcurrent: 1, // 一次只能执行一个任务
  minTime: 1000, // 任务执行完成后等待的时间（毫秒）
  reservoir: 20, // 任务开始时可以接受的新任务数
  reservoirRefreshAmount: 20, // 任务刷新后可以接受的新任务数
  reservoirRefreshInterval: 60000, // 任务刷新的间隔时间（毫秒）
};

// 传出的私聊限流器
const outConfig = {
  maxConcurrent: 1, // 一次只能执行一个任务
  minTime: 1000, // 任务执行完成后等待的时间（毫秒）
};
```

## 插件概述

- 名字：`transformer-throttler`
- 源码：<https://github.com/grammyjs/transformer-throttler>
- 参考：<https://doc.deno.land/https://deno.land/x/grammy_transformer_throttler/mod.ts>
