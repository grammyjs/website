# 限制用户速率 (`ratelimiter`)

ratelimiter 是用 grammY 或 [Telegraf](https://github.com/telegraf/telegraf) bot 框架制作的一个限速中间件。简单来说，它是一个帮助你的 bot 阻塞垃圾信息的插件。要更好地理解 ratelimiter，你可以看下面的图示：

![速率限制器在抵御垃圾信息中的作用](/ratelimiter-role.png)

## 它是如何工作的？

在正常情况下，每个请求都会被你的 bot 处理，这意味着发送垃圾信息不会很困难。每个用户每秒可以发送多次请求，你的脚本必须处理每个请求，但是如何阻止它呢？用 ratelimiter！

::: warning 限制用户速率，而不是 Telegram 服务器！
你应该注意，这个插件 **不会** 限制来自 Telegram 服务器的请求，而是通过 `from.id` 跟踪请求，当请求到达时，它会被拒绝，从而不会增加到你的服务器的处理负荷。
:::

## 可定制性

这个插件可以定制的选项有 5 个：

- `timeFrame`：对请求进行监测的时间范围（默认为 `1000` 毫秒）。
- `limit`：在每个 `timeFrame` 内允许的请求数量（默认为 `1`）。
- `storageClient`：一个用于跟踪用户和他们的请求的存储类型。默认值是 `MEMORY_STORE`，它使用内存中的 [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)，但你也可以传入 Redis 客户端（更多信息在 [关于 storageClient](#关于-storageclient) 中）。
- `onLimitExceeded`：如果用户超出限制，则执行的函数（默认值是忽略额外的请求）。
- `keyGenerator`：用于生成每个用户的唯一键的函数（默认值是使用 `from.id`）。这个键用于标识用户，因此它应该是唯一的，用户特定的，并且是字符串格式。

### 关于 `storageClient`

`MEMORY_STORE` 或者内存中的跟踪是适用于大多数 bot 的，但如果你实现了 bot 集群，你将无法有效地使用内存存储。这就是为什么也提供了 Redis 选项。如果你使用 Deno，你可以传入 [ioredis](https://github.com/luin/ioredis) 或 [redis](https://deno.land/x/redis) 的客户端。任何实现了 `incr` 和 `pexpire` 方法的 Redis 驱动器都可以正常工作。ratelimiter 与驱动器无关。

> 请注意：如果你使用 Redis 存储类型，你必须在你的服务器上安装 Redis-server 2.6.0 及以上版本。不支持老版本的 Redis。

## 如何使用

这里有两种方式使用 ratelimiter：

- 使用默认配置（[默认配置](#默认配置)）。
- 传入一个包含你的设置的自定义对象（[手动配置](#手动配置)）。

### 默认配置

这个示例演示了最简单的方式来使用默认行为的 ratelimiter：

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { limit } from "@grammyjs/ratelimiter";

// 将每个用户的信息处理限制在每秒一条信息。
bot.use(limit());
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const { limit } = require("@grammyjs/ratelimiter");

// 将每个用户的信息处理限制在每秒一条信息。
bot.use(limit());
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { limit } from "https://deno.land/x/grammy_ratelimiter/mod.ts";

// 将每个用户的信息处理限制在每秒一条信息。
bot.use(limit());
```

</CodeGroupItem>
</CodeGroup>

### 手动配置

正如前面所说，你可以向 `limit()` 方法传入一个 `Options` 对象来改变 ratelimiter 的行为。

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import Redis from "ioredis";
import { limit } from "@grammyjs/ratelimiter";

const redis = new Redis(...);

bot.use(
  limit({
    // 每 2 秒只允许处理 3 条信息。
    timeFrame: 2000,
    limit: 3,

    // "MEMORY_STORE" 是默认值。如果你不想使用 Redis，请不要传入 storageClient。
    storageClient: redis,

    // 当超过限制时执行调用。
    onLimitExceeded: async (ctx) => {
      await ctx.reply("Please refrain from sending too many requests!");
    },

    // 请注意，这个键应该是一个字符串格式的数字，如 "123456789"。
    keyGenerator: (ctx) => {
      return ctx.from?.id.toString();
    },
  })
);
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const Redis = require("ioredis");
const { limit } = require("@grammyjs/ratelimiter");

const redis = new Redis(...);

bot.use(
  limit({
    // 每 2 秒只允许处理 3 条信息。
    timeFrame: 2000,
    limit: 3,

    // "MEMORY_STORE" 是默认值。如果你不想使用 Redis，请不要传入 storageClient。
    storageClient: redis,

    // 当超过限制时执行调用。
    onLimitExceeded: async (ctx) => {
      await ctx.reply("Please refrain from sending too many requests!");
    },

    // 请注意，这个键应该是一个字符串格式的数字，如 "123456789"。
    keyGenerator: (ctx) => {
      return ctx.from?.id.toString();
    },
  })
);
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { connect } from "https://deno.land/x/redis/mod.ts";
import { limit } from "https://deno.land/x/grammy_ratelimiter/mod.ts";

const redis = await connect(...);

bot.use(
  limit({
    // 每 2 秒只允许处理 3 条信息。
    timeFrame: 2000,
    limit: 3,

    // "MEMORY_STORE" 是默认值。如果你不想使用 Redis，请不要传入 storageClient。
    storageClient: redis,

    // 当超过限制时执行调用。
    onLimitExceeded: async (ctx) => {
      await ctx.reply("Please refrain from sending too many requests!");
    },

    // 请注意，这个键应该是一个字符串格式的数字，如 "123456789"。
    keyGenerator: (ctx) => {
      return ctx.from?.id.toString();
    },
  })
);
```

</CodeGroupItem>
</CodeGroup>

正如你在上面的示例中看到的，每个用户每 2 秒钟最多只能发送 3 次请求。如果该用户发送更多请求，机器人会回复 _Please refrain from sending too many requests!_。
由于我们不调用 [next()](../guide/middleware.html#中间件栈)，这个请求将被立即关闭。

> 请注意：为了避免 Telegram 服务器被请求淹没，`onLimitExceeded` 只会在每个 `timeFrame` 中执行一次。

另一个用例是限制来自聊天室的请求而不是特定用户的请求：

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { limit } from "@grammyjs/ratelimiter";

bot.use(
  limit({
    keyGenerator: (ctx) => {
      if (ctx.chat?.type === "group" || ctx.chat?.type === "supergroup") {
        // 请注意，这个键应该是一个字符串格式的数字，如 "123456789"。
        return ctx.chat.id.toString();
      }
    },
  }),
);
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const { limit } = require("@grammyjs/ratelimiter");

bot.use(
  limit({
    keyGenerator: (ctx) => {
      if (ctx.chat?.type === "group" || ctx.chat?.type === "supergroup") {
        // 请注意，这个键应该是一个字符串格式的数字，如 "123456789"。
        return ctx.chat.id.toString();
      }
    },
  }),
);
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { limit } from "https://deno.land/x/grammy_ratelimiter/mod.ts";

bot.use(
  limit({
    keyGenerator: (ctx) => {
      if (ctx.chat?.type === "group" || ctx.chat?.type === "supergroup") {
        // 请注意，这个键应该是一个字符串格式的数字，如 "123456789"。
        return ctx.chat.id.toString();
      }
    },
  }),
);
```

</CodeGroupItem>
</CodeGroup>

在这个示例中，我使用 `chat.id` 作为限制的唯一键。

## 插件概述

- 名字：`ratelimiter`
- 源码：<https://github.com/grammyjs/ratelimiter>
- 参考：<https://deno.land/x/grammy_ratelimiter/mod.ts>
