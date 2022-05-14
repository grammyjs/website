# 限制用户速率 (`ratelimiter`)

rateLimiter 是用 grammY 或 [Telegraf](https://github.com/telegraf/telegraf) bot 框架制作的一个限速中间件。简单来说，它是一个帮助你的 bot 阻塞垃圾信息的插件。要更好地理解 rateLimiter，你可以看下面的图示：

![速率限制器在抵御垃圾信息中的作用](/rateLimiter-role.png)

## 它是如何工作的？

在正常情况下，每个请求都会被你的 bot 处理，这意味着发送垃圾信息不会很困难。每个用户每秒可以发送多次请求，你的脚本必须处理每个请求，但是如何阻止它呢？用 rateLimiter！

::: warning 限制用户速率，而不是 Telegram 服务器！
你应该注意，这个插件 **不会** 限制来自 telegram 服务器的请求，而是通过 `from.id` 跟踪请求，当请求到达时，它会被拒绝，从而不会增加到你的服务器的处理负荷。
:::

## 可定制性

这个插件可以定制的选项有 5 个：

- `timeFrame`：对请求进行监测的时间范围（默认为 `1000` 毫秒）。
- `limit`：在每个 `timeFrame` 内允许的请求数量（默认为 `1`）。
- `storageClient`：一个用于跟踪用户和他们的请求的存储类型。默认值是 `MEMORY_STORE`，它使用内存中的 [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)，但你也可以传入 Redis 客户端（更多信息在 [关于 storageClient](#关于-storageclient) 中）。
- `onLimitExceeded`：如果用户超出限制，则执行的函数（默认值是忽略额外的请求）。
- `keyGenerator`：用于生成每个用户的唯一键的函数（默认值是使用 `from.id`）。这个键用于标识用户，因此它应该是唯一的，用户特定的，并且是字符串格式。

### 关于 `storageClient`

`MEMORY_STORE` 或者内存中的跟踪是适用于大多数 bot 的，但如果你实现了 bot 集群，你将无法有效地使用内存存储。这就是为什么也提供了 Redis 选项。如果你使用 Deno，你可以传入 [ioredis](https://github.com/luin/ioredis) 或 [redis](https://deno.land/x/redis) 的客户端。任何实现了 `incr` 和 `pexpire` 方法的 Redis 驱动器都可以正常工作。rateLimiter 与驱动器无关。

> 请注意：如果你使用 Redis 存储类型，你必须在你的服务器上安装 Redis-server 2.6.0 及以上版本。不支持老版本的 Redis。

## 如何使用

这里有两种方式使用 rateLimiter：

- 使用默认配置（[默认配置](#默认配置)）。
- 传入一个包含你的设置的自定义对象（[手动配置](#手动配置)）。

### 默认配置

下面的示例使用 [express](https://github.com/expressjs/express) 作为服务器，并且使用 [webhooks](https://grammy.dev/zh/guide/deployment-types.html) 模式。这个示例演示了最简单的方式来使用默认行为的 rateLimiter：

```ts
import express from "express";
import { Bot } from "grammy";
import { limit } from "@grammyjs/ratelimiter";

const app = express();
const bot = new Bot("YOUR BOT TOKEN HERE");

app.use(express.json());
bot.use(limit());

app.listen(3000, () => {
  bot.api.setWebhook("YOUR DOMAIN HERRE", { drop_pending_updates: true });
  console.log("The application is listening on port 3000!");
});
```

### 手动配置

正如前面所说，你可以向 `limit()` 方法传入一个 `Options` 对象来改变 rateLimiter 的行为。在下面的示例中，我决定使用 Redis 作为存储选项：

```ts
import express from "express";
import { Bot } from "grammy";
import { limit } from "@grammyjs/ratelimiter";
import Redis from "ioredis";

const app = express();
const bot = new Bot("YOUR BOT TOKEN HERE");
const redis = new Redis();

app.use(express.json());
bot.use(
  limit({
    timeFrame: 2000,

    limit: 3,

    // "MEMORY_STORAGE" 是默认的存储模式。如果你想使用 Redis，请不要忘记传入 storageClient。
    storageClient: redis,

    onLimitExceeded: (ctx) => {
      ctx?.reply("Please refrain from sending too many requests!");
    },

    // 请注意，这个键应该是一个字符串格式的数字，如 "123456789"
    keyGenerator: (ctx) => {
      return ctx.from?.id.toString();
    },
  }),
);

app.listen(3000, () => {
  bot.api.setWebhook("YOUR DOMAIN HERRE", { drop_pending_updates: true });
  console.log("The application is listening on port 3000!");
});
```

正如你在上面的示例中看到的，每个用户每 2 秒钟最多只能发送 3 次请求。如果该用户发送更多请求，机器人会回复 _Please refrain from sending too many requests!_。由于我们不调用 [next()](../guide/middleware.html#the-middleware-stack)，这个请求将立即死亡。

> 请注意：为了避免 Telegram 服务器被请求淹没，`onLimitExceeded` 只会在每个 `timeFrame` 中执行一次。

另一个用例是限制来自聊天室的请求而不是特定用户的请求：

```ts
import express from "express";
import { Bot } from "grammy";
import { limit } from "@grammyjs/ratelimiter";

const app = express();
const bot = new Bot("YOUR BOT TOKEN HERE");

app.use(express.json());
bot.use(
  limit({
    keyGenerator: (ctx) => {
      if (ctx.chat?.type === "group" || ctx.chat?.type === "supergroup") {
        // 请注意，这个键应该是一个字符串格式的数字，如 "123456789"
        return ctx.chat.id.toString();
      }
    },
  }),
);

app.listen(3000, () => {
  bot.api.setWebhook("YOUR DOMAIN HERRE", { drop_pending_updates: true });
  console.log("The application is listening on port 3000!");
});
```

在这个示例中，我使用 `chat.id` 作为限制的唯一键。

## 插件概述

- 名字：`ratelimiter`
- 源码：<https://github.com/grammyjs/rateLimiter>
- 参考：<https://doc.deno.land/https://deno.land/x/grammy_ratelimiter/rateLimiter.ts>
