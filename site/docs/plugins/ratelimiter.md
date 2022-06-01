# Rate Limit Users (`ratelimiter`)

rateLimiter is a rate-limiting middleware for Telegram bots made with grammY or [Telegraf](https://github.com/telegraf/telegraf) bot frameworks.
In simple terms, it is a plugin that helps you deflect heavy spamming in your bots.
To understand rateLimiter better, you can take a look at the following illustration:

![rateLimiter's role in deflecting spam](/rateLimiter-role.png)

## How Does It Work Exactly?

Under normal circumstances every request will be processed and answered by your bot which means spamming it will not be that difficult.
Each user might send multiple requests per second and your script has to process each request, but how can you stop it?
With rateLimiter!

::: warning Rate-Limiting Users, Not Telegram Servers!
You should note that this package **DOES NOT** rate limit the incoming requests from telegram servers, instead, it tracks the incoming requests by `from.id` and dismisses them on arrival so no further processing load is added to your servers.
:::

## Customizability

This plugin exposes 5 customizable options:

- `timeFrame`: The time frame during which the requests will be monitored (defaults to `1000` ms).
- `limit`: The number of requests allowed within each `timeFrame` (defaults to `1`).
- `storageClient`: The type of storage to use for keeping track of users and their requests.
  The default value is `MEMORY_STORE` which uses an in-memory [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map), but you can also pass in a Redis client as well (more info at [About storageClient](#about-storageclient)).
- `onLimitExceeded`: A function that describes what to do if the user exceeds the limit (ignores the extra requests by default).
- `keyGenerator`: A function that returns a unique key generated for each user (it uses `from.id` by default).
  This key is used to identify the user, therefore it should be unique, user specific and in string format.

### About `storageClient`

The `MEMORY_STORE` or the in-memory tracking is suitable for most bots, however if you implement clustering for your bot you will not be able to use the in-memory storage effectively.
That's why the Redis option is provided as well.
You can pass a Redis client from [ioredis](https://github.com/luin/ioredis) or [redis](https://deno.land/x/redis) in case you use Deno.
In reality, any Redis driver that implements the `incr` and `pexpire` methods should work just fine.
rateLimiter is driver agnostic.

> Note: You must have redis-server **2.6.0** and above on your server to use Redis storage client with rateLimiter.
> Older versions of Redis are not supported.

## How to Use

There are two ways of using rateLimiter:

- Accepting the defaults ([Default Configuration](#default-configuration)).
- Passing a custom object containing your settings ([Manual Configuration](#manual-configuration)).

### Default Configuration

This snippet demonstrates the easiest way of using rateLimiter, which is accepting the default behavior:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { limit } from "@grammyjs/ratelimiter";

// Limits message handling to a message per second for each user.
bot.use(limit());
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const { limit } = require("@grammyjs/ratelimiter");

// Limits message handling to a message per second for each user.
bot.use(limit());
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { limit } from "https://deno.land/x/grammy_ratelimiter/mod.ts";

// Limits message handling to a message per second for each user.
bot.use(limit());
```

</CodeGroupItem>
</CodeGroup>

### Manual Configuration

As mentioned earlier, you can pass an `Options` object to the `limit()` method to alter the limiter's behavior.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import Redis from "ioredis";
import { limit } from "@grammyjs/ratelimiter";

const redis = new Redis(...);

bot.use(
  limit({
    // Allow only 3 messages to be handled every 2 seconds.
    timeFrame: 2000,

    limit: 3,

    // "MEMORY_STORE" is the default value. If you do not want to use Redis, do not pass storageClient at all.
    storageClient: redis,

    // This is called when the limit is exceeded.
    onLimitExceeded: async (ctx) => {
      await ctx.reply("Please refrain from sending too many requests!");
    },

    // Note that the key should be a number in string format such as "123456789".
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
    // Allow only 3 messages to be handled every 2 seconds.
    timeFrame: 2000,

    limit: 3,

    // "MEMORY_STORE" is the default value. If you do not want to use Redis, do not pass storageClient at all.
    storageClient: redis,

    // This is called when the limit is exceeded.
    onLimitExceeded: async (ctx) => {
      await ctx.reply("Please refrain from sending too many requests!");
    },

    // Note that the key should be a number in string format such as "123456789".
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
    // Allow only 3 messages to be handled every 2 seconds.
    timeFrame: 2000,

    limit: 3,

    // "MEMORY_STORE" is the default value. If you do not want to use Redis, do not pass storageClient at all.
    storageClient: redis,

    // This is called when the limit is exceeded.
    onLimitExceeded: async (ctx) => {
      await ctx.reply("Please refrain from sending too many requests!");
    },

    // Note that the key should be a number in string format such as "123456789".
    keyGenerator: (ctx) => {
      return ctx.from?.id.toString();
    },
  })
);
```

</CodeGroupItem>
</CodeGroup>

As you can see in the example above, each user is allowed to send 3 requests every 2 seconds.
If said user sends more requests, the bot replies with _Please refrain from sending too many requests_. That request will not travel further and dies immediately as we do not call [next()](../guide/middleware.md#the-middleware-stack) in the middleware.

> Note: To avoid flooding Telegram servers, `onLimitExceeded` is only executed once in every `timeFrame`.

Another use case would be limiting the incoming requests from a chat instead of a specific user:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { limit } from "@grammyjs/ratelimiter";

bot.use(
  limit({
    keyGenerator: (ctx) => {
      if (ctx.chat?.type === "group" || ctx.chat?.type === "supergroup") {
        // Note that the key should be a number in string format, such as "123456789".
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
        // Note that the key should be a number in string format, such as "123456789".
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
        // Note that the key should be a number in string format, such as "123456789".
        return ctx.chat.id.toString();
      }
    },
  }),
);
```

</CodeGroupItem>
</CodeGroup>

In this example, I have used `chat.id` as the unique key for rate-limiting.

## Plugin Summary

- Name: `ratelimiter`
- Source: <https://github.com/grammyjs/rateLimiter>
- Reference: <https://doc.deno.land/https://deno.land/x/grammy_ratelimiter/rateLimiter.ts>
