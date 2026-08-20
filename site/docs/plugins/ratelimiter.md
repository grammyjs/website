---
prev: false
next: false
---

# Rate Limit Users (`ratelimiter`)

`ratelimiter` is a flexible rate-limiting middleware for grammY.
It lets you control how often a user, chat, user-chat pair, custom key, or the entire bot may perform an action.

Unlike a simple message counter, ratelimiter supports several rate-limiting algorithms, shared Redis-backed state, penalties, atomic multi-rule limits, manual consumption and refunds, non-consuming inspection, diagnostics, observe-only rollout, typed events, and reusable presets.

![How ratelimiter processes Telegram updates](/images/grammY-ratelimiter-schema.webp)

::: warning Rate-limiting Users, Not Telegram
ratelimiter does **not** reduce the number of updates Telegram sends to your bot.
The update has already reached your application when the middleware runs.

What ratelimiter does is stop an abusive update **before your expensive handlers, database work, API calls, or other middleware execute**.
:::

## Quick Start

A limiter rule needs three things:

1. a **strategy** that decides how capacity is measured,
2. a **scope** that decides what is being limited,
3. a **storage engine** that stores the rate-limit state.

The following rule allows each user to send a short burst of messages and then gradually restores capacity.

::: code-group

```ts [Node.js]
import { Bot, type Context } from "grammy";
import { limit, Limiter } from "@grammyjs/ratelimiter";
import { MemoryStore } from "@grammyjs/ratelimiter/storages";

const bot = new Bot("");
const storage = new MemoryStore();

const messages = Limiter.perUser<Context>()
  .tokenBucket({
    bucketSize: 5,
    tokensPerInterval: 1,
    interval: 2_000,
  })
  .useStorage(storage)
  .withKeyPrefix("messages");

bot.use(limit(messages));

bot.on("message", (ctx) => ctx.reply("Accepted"));

bot.start();
```

```ts [Deno]
import { Bot, type Context } from "jsr:@grammyjs/grammy";
import { limit, Limiter } from "jsr:@grammyjs/ratelimiter";
import { MemoryStore } from "jsr:@grammyjs/ratelimiter/storages";

const bot = new Bot("");
const storage = new MemoryStore();

const messages = Limiter.perUser<Context>()
  .tokenBucket({
    bucketSize: 5,
    tokensPerInterval: 1,
    interval: 2_000,
  })
  .useStorage(storage)
  .withKeyPrefix("messages");

bot.use(limit(messages));

bot.on("message", (ctx) => ctx.reply("Accepted"));

bot.start();
```

:::

`limit()` returns normal grammY middleware, so it can be used anywhere grammY accepts middleware.
It also exposes additional methods such as `inspect()`, `diagnose()`, `consume()`, and `reset()` which we will cover later.

::: tip Start Simple
For many bots, a per-user Token Bucket with `MemoryStore` is a good development setup.
Move to Redis when limiter state must be shared between multiple processes or machines.
:::

## How A Rule Is Built

The fluent `Limiter` builder lets you describe one policy without hiding important behavior behind defaults.
A typical rule reads from left to right:

```ts
const limiter = Limiter.perUser<Context>()
  .tokenBucket({
    bucketSize: 10,
    tokensPerInterval: 2,
    interval: 1_000,
  })
  .useStorage(storage)
  .withKeyPrefix("messages")
  .withName("message-spam");
```

The order in which you call most builder methods is not important.
The builder is validated when it is converted into middleware or explicitly built with `.build()`.

You may pass the builder directly to `limit()`:

```ts
bot.use(limit(limiter));
```

or build an immutable `Rule` first:

```ts
const rule = limiter.build();

bot.use(limit(rule));
```

## Choosing A Rate-limiting Algorithm

ratelimiter currently provides four rate-limiting algorithms plus the high-level `cooldown()` helper.
They solve different problems.

| Strategy | Best fit | Burst behavior | Boundary behavior | State | Weighted cost |
| --- | --- | --- | --- | --- | --- |
| Fixed Window | Simple hard quotas | Can burst near boundaries | Has fixed boundaries | O(1) | No |
| Sliding Window Counter | Rolling quotas without boundary spikes | Limited by rolling estimate | Smooths boundaries | O(1) | Yes |
| Token Bucket | General anti-spam and burst-friendly UX | Explicit burst capacity | No fixed reset boundary | O(1) | Yes |
| GCRA | Smooth sustained pacing | Explicit burst capacity | No fixed reset boundary | O(1) | Yes |
| Cooldown | Minimum delay between actions | One action at a time | No fixed-window edge case | O(1) | Fixed at one |

::: tip There Is No Universally Best Algorithm
The right algorithm depends on what you are protecting.
A command that should run at most once every 30 seconds has different semantics from a chat where users should be allowed to send a short burst and then slow down.
:::

### Fixed Window

A Fixed Window divides time into windows and counts requests inside the active window.

```ts
const limiter = Limiter.perUser<Context>()
  .fixedWindow({
    limit: 5,
    timeFrame: 10_000,
  })
  .useStorage(storage)
  .withKeyPrefix("fixed-example");
```

This allows at most five matching updates in a 10-second window.

The main advantage is simplicity.
It is easy to understand and works well for hard quotas such as "five attempts per minute".

The main trade-off is the **window boundary**.
A client may consume capacity near the end of one window and immediately consume a fresh window after the boundary.
That can create a short burst much larger than the nominal average rate.

::: warning Fixed Window Is Not A Minimum-delay Primitive
A Fixed Window configured as `{ limit: 1, timeFrame: 30_000 }` does not guarantee 30 seconds between two accepted actions.
One action may arrive at the end of one window and another just after the next window begins.

Use [`cooldown()`](#cooldown) when you require an actual minimum interval between actions.
:::

The `limit` may be generated from the current context while `timeFrame` remains static:

```ts
const limiter = Limiter.perUser<Context>()
  .fixedWindow({
    limit: (ctx) => ctx.from?.is_premium ? 20 : 5,
    timeFrame: 60_000,
  })
  .useStorage(storage)
  .withKeyPrefix("premium-aware");
```

### Sliding Window Counter

The Sliding Window Counter smooths the major boundary weakness of Fixed Window without storing every request timestamp.

ratelimiter keeps the current fixed bucket and the immediately previous bucket.
The previous bucket is weighted by how much of the current window remains.
This gives a bounded-memory approximation of usage over a rolling window.

```ts
const limiter = Limiter.perUser<Context>()
  .slidingWindow({
    limit: 10,
    timeFrame: 60_000,
  })
  .useStorage(storage)
  .withKeyPrefix("rolling-minute");
```

Use Sliding Window Counter when you want a familiar "N requests per time frame" policy but do not want the sharp reset behavior of Fixed Window.

::: info Counter, Not Request Log
This is a **Sliding Window Counter**, not an exact sliding log of every request timestamp.
It deliberately keeps O(1) state per limited key.
That makes it practical for large keyspaces while giving a much smoother result than a plain Fixed Window.
:::

Both `limit` and `cost` may be dynamic.
`timeFrame` is intentionally static because changing the bucket geometry for persisted state would make the rolling estimate ambiguous.

```ts
const limiter = Limiter.perUser<Context>()
  .slidingWindow({
    limit: (ctx) => ctx.from?.is_premium ? 50 : 20,
    timeFrame: 60_000,
    cost: (ctx) => ctx.message?.video ? 5 : 1,
  })
  .useStorage(storage)
  .withKeyPrefix("weighted-media");
```

### Token Bucket

Token Bucket is a strong general-purpose choice for interactive bots.

Each key has a bucket with a maximum capacity.
Requests spend tokens and tokens refill over time.
Idle users can accumulate capacity up to `bucketSize`, which lets them send a short burst without losing the sustained rate limit.

```ts
const limiter = Limiter.perUser<Context>()
  .tokenBucket({
    bucketSize: 8,
    tokensPerInterval: 2,
    interval: 1_000,
  })
  .useStorage(storage)
  .withKeyPrefix("messages");
```

In this example:

- an idle user may immediately spend up to eight tokens,
- two tokens are restored per second,
- the bucket never grows beyond eight tokens.

Token Bucket is useful when natural human bursts are acceptable but sustained spam is not.

It also supports weighted requests:

```ts
const limiter = Limiter.perUser<Context>()
  .tokenBucket({
    bucketSize: 20,
    tokensPerInterval: 5,
    interval: 1_000,
    cost: (ctx) => ctx.message?.video ? 10 : 1,
  })
  .useStorage(storage)
  .withKeyPrefix("weighted-work");
```

All Token Bucket numeric options may be static or generated from the current context.
This makes it possible to vary burst capacity, refill rate, interval, or cost by user tier or operation type.

::: tip Weighted Cost Is Useful Beyond Messages
A "request" does not need to mean one Telegram update.
You can use `cost` to model expensive operations.
For example, a lightweight lookup may cost `1` while a report generation request costs `10`.
:::

### GCRA

GCRA, the Generic Cell Rate Algorithm, models a smooth schedule for allowed work.
It is a good fit when you care about a stable sustained rate and want to avoid window boundaries entirely.

```ts
const limiter = Limiter.perUser<Context>()
  .gcra({
    rate: 5,
    interval: 10_000,
    burst: 3,
  })
  .useStorage(storage)
  .withKeyPrefix("smooth-rate");
```

Here:

- the sustained rate is five cost units per 10 seconds,
- up to three cost units may be admitted immediately after enough idle time,
- subsequent work is paced according to the rate.

Like Token Bucket, GCRA supports weighted `cost` and dynamic numeric options.

A practical difference is how you think about the configuration:

- **Token Bucket** is intuitive when you think in terms of stored capacity that refills.
- **GCRA** is intuitive when you think in terms of scheduling or spacing accepted work over time.

Both avoid the hard boundary reset of Fixed Window.

### Cooldown

`cooldown()` is a developer-friendly primitive for "allow one action, then require a real delay before the next one".

```ts
const limiter = Limiter.perUser<Context>()
  .cooldown(30_000)
  .useStorage(storage)
  .withKeyPrefix("expensive-command");
```

The first matching action is allowed immediately.
After that, the same key must wait the full 30 seconds before another action can pass.

The duration may be context-dependent:

```ts
const limiter = Limiter.perUser<Context>()
  .cooldown((ctx) => ctx.from?.is_premium ? 5_000 : 30_000)
  .useStorage(storage)
  .withKeyPrefix("tiered-command");
```

Internally, cooldown uses GCRA with a rate, burst, and cost of one.
It therefore inherits the same atomic Memory/Redis behavior, inspection, reset, refund, and atomic-composition support.

## Scoping A Limiter

A strategy describes **how much** capacity exists.
The scope describes **who shares that capacity**.

### Scope Helpers

The common scopes have concise factory helpers.

```ts
Limiter.perUser<Context>();
Limiter.perChat<Context>();
Limiter.perUserPerChat<Context>();
Limiter.global<Context>();
```

They only configure the key generator.
They do not select a strategy, storage engine, penalty, or other policy.

#### Per User

```ts
const limiter = Limiter.perUser<Context>()
  .cooldown(5_000)
  .useStorage(storage)
  .withKeyPrefix("user-action");
```

Each `ctx.from.id` receives independent state.
Updates without `ctx.from` bypass the rule.

#### Per Chat

```ts
const limiter = Limiter.perChat<Context>()
  .fixedWindow({ limit: 100, timeFrame: 60_000 })
  .useStorage(storage)
  .withKeyPrefix("chat-volume");
```

All users inside the same chat share one limit.

#### Per User Per Chat

```ts
const limiter = Limiter.perUserPerChat<Context>()
  .tokenBucket({
    bucketSize: 10,
    tokensPerInterval: 2,
    interval: 1_000,
  })
  .useStorage(storage)
  .withKeyPrefix("user-chat");
```

The same user receives independent capacity in different chats.
The generated entity key is `<userId>:<chatId>`.

#### Global

```ts
const limiter = Limiter.global<Context>()
  .tokenBucket({
    bucketSize: 1_000,
    tokensPerInterval: 100,
    interval: 1_000,
  })
  .useStorage(storage)
  .withKeyPrefix("global-work");
```

Every matching update shares one global capacity pool.

::: warning Be Careful With Global Limits
A global limit can intentionally slow down **every user** because they all share the same key.
It is useful as a final protection layer around scarce resources, but it is rarely a replacement for per-user anti-spam limits.
:::

### Custom Scope

Use `.limitFor()` directly when the built-in scopes are not enough.

```ts
const limiter = new Limiter<Context>()
  .limitFor((ctx) => {
    const userId = ctx.from?.id;
    const command = ctx.message?.text?.split(" ", 1)[0];

    if (userId === undefined || command === undefined) {
      return undefined;
    }

    return `${userId}:${command}`;
  })
  .fixedWindow({ limit: 5, timeFrame: 60_000 })
  .useStorage(storage)
  .withKeyPrefix("commands");
```

Returning `undefined` bypasses the rule for that update.

## Storage

ratelimiter separates rate-limiting policy from persistence.
The built-in stores are exported from `@grammyjs/ratelimiter/storages`.

```ts
import { MemoryStore, RedisStore } from "@grammyjs/ratelimiter/storages";
```

### MemoryStore

`MemoryStore` keeps limiter state in the current JavaScript process.

```ts
const storage = new MemoryStore();
```

It is fast and requires no external service, but state is lost when the process restarts and it is not shared with another process.

Use it for development, single-process deployments, or cases where process-local limits are explicitly acceptable.

### RedisStore

`RedisStore` stores shared limiter state in Redis and implements the atomic operations required by the built-in strategies.

```ts
const storage = new RedisStore(redisClient);
```

ratelimiter intentionally does **not** depend on a specific Redis library.
You provide a client object that implements the small `IRedisClient` contract.

```ts
interface IRedisClient {
  scriptLoad(script: string): Promise<string>;
  evalsha(
    sha: string,
    keys: string[],
    args: (string | number)[],
  ): Promise<unknown>;
  get(key: string): Promise<string | null>;
  setWithExpiry(
    key: string,
    value: string,
    ttlMilliseconds: number,
  ): Promise<unknown>;
  exists(key: string): Promise<number>;
  del(key: string): Promise<unknown>;
}
```

This keeps the plugin driver-agnostic.
You may adapt ioredis, node-redis, a Deno Redis client, or another client as long as the required Redis command semantics are preserved.

::: info No Redis Client Dependency
Installing ratelimiter does not install or choose a Redis client for your application.
`RedisStore` is the rate-limit storage implementation; the network client remains your choice.
:::

### Redis Uses Atomic Server-side Operations

The Redis implementation uses Lua scripts for operations that must remain atomic under concurrency.
Token Bucket, GCRA, Sliding Window, escalation, refunds, and atomic composites are not implemented as unsafe client-side `GET` then `SET` sequences.

For time-sensitive algorithms, Redis server time is used where the algorithm requires one authoritative clock.
That prevents multiple bot processes from disagreeing because their local clocks differ.

::: warning Redis Cluster and `limitAllAtomic()`
A Redis Cluster can execute a multi-key atomic script only when all participating keys are in the same hash slot.
If you use `limitAllAtomic()` with Redis Cluster, choose key prefixes/hash tags so the participating keys share a slot.
:::

### Custom Storage Engines

The public storage API is capability-based.
The core storage contract includes primitives for the built-in strategies, while newer capabilities such as atomic composition, penalty escalation, and refunds are optional where possible.

This makes custom storage possible, but the atomicity guarantees are part of the contract.
For example, a Token Bucket backend must atomically perform refill + consume for one key.
A plain read followed by a write is not sufficient under concurrency.

::: danger DO NOT FAKE ATOMICITY
If a custom storage engine claims a built-in atomic capability, it must actually preserve that capability under concurrent access.
Incorrect storage semantics can make a limiter appear to work in development while allowing substantial over-admission in production.
:::

## Key Prefixes And Rule Isolation

Every logical rule should have its own storage namespace.
Use `.withKeyPrefix()` to provide it.

```ts
const messages = Limiter.perUser<Context>()
  .fixedWindow({ limit: 20, timeFrame: 60_000 })
  .useStorage(storage)
  .withKeyPrefix("messages");

const search = Limiter.perUser<Context>()
  .cooldown(5_000)
  .useStorage(storage)
  .withKeyPrefix("search");
```

::: danger USE UNIQUE PREFIXES FOR INDEPENDENT RULES
Two independent rules that share both a storage engine and the same strategy key namespace can overwrite or misinterpret one another's state.

ratelimiter warns when you build a rule without an explicit key prefix.
Treat that warning seriously when your application has more than one logical rule.
:::

Penalty keys are isolated from strategy keys.
When no custom penalty namespace is provided, the penalty namespace is derived from the rule's key prefix.

## Conditional Limiting

`.onlyIf()` lets a rule run only for updates that match a predicate.
The predicate may be synchronous or asynchronous.

```ts
const stickerLimiter = Limiter.perUser<Context>()
  .fixedWindow({ limit: 5, timeFrame: 60_000 })
  .onlyIf((ctx) => ctx.message?.sticker !== undefined)
  .useStorage(storage)
  .withKeyPrefix("stickers");
```

The predicate runs before entity-key generation, penalty lookup, and strategy storage operations.
Returning `false` fully bypasses the rule.

## Handling Throttled Updates

Use `.onThrottled()` when an enforced strategy rejection should trigger application code.

```ts
const limiter = Limiter.perUser<Context>()
  .cooldown(10_000)
  .useStorage(storage)
  .withKeyPrefix("command")
  .onThrottled(async (ctx, info) => {
    const seconds = Math.ceil(info.reset / 1_000);

    await ctx.reply(`Please try again in ${seconds} seconds.`);
  });
```

The callback receives:

- the grammY context,
- the strategy `LimitResult`,
- the configured storage engine.

Returned promises are awaited.

::: warning Avoid Creating A Reply Flood
Without a penalty, `onThrottled()` may run for every request the strategy rejects.
A user that keeps spamming could therefore make your bot send many warning messages.

If you want later requests to be dropped before the strategy and callback run again, combine the rule with a penalty.
:::

## Penalties

A strategy rejection can place the entity in a temporary penalty box.
While the penalty is active, subsequent matching updates are rejected before strategy evaluation.

```ts
const limiter = Limiter.perUser<Context>()
  .tokenBucket({
    bucketSize: 5,
    tokensPerInterval: 1,
    interval: 1_000,
  })
  .useStorage(storage)
  .withKeyPrefix("messages")
  .withPenalty({
    penaltyTime: 30_000,
  });
```

A dynamic penalty can depend on the current context and the strategy result:

```ts
.withPenalty({
  penaltyTime: (ctx, info) => {
    return ctx.from?.is_premium ? 5_000 : Math.max(10_000, info.reset);
  },
})
```

Returning `0` or a negative value skips applying a penalty for that throttled update.

### Escalating Penalties

Repeated strategy violations can increase the penalty geometrically.

```ts
.withPenalty({
  penaltyTime: 10_000,
  escalation: {
    factor: 2,
    maxPenaltyTime: 10 * 60_000,
    resetAfter: 30 * 60_000,
  },
})
```

With this configuration, new strikes grow from the previous effective penalty until the configured maximum is reached.
Strike history expires after `resetAfter` milliseconds of inactivity.

Requests rejected by an already-active penalty do **not** add another strike.
Only a new strategy throttle does.

::: tip Penalty State and Strike State Are Separate
The middleware exposes both `clearPenalty()` and `clearStrikes()`.
You may remove the active penalty without forgiving recent strike history, or clear strike history without touching the current penalty.
:::

## Combining Multiple Rules

Real systems often need more than one limit.
For example, a bot may enforce:

- a per-user anti-spam limit,
- a stricter per-command limit,
- a global protection limit around an expensive external service.

ratelimiter provides two composition modes with intentionally different semantics.

### Sequential Composition With `limitAll()`

`limitAll()` evaluates rules from left to right.
All layers must allow or bypass the update before downstream middleware runs.

```ts
const perUser = Limiter.perUser<Context>()
  .tokenBucket({
    bucketSize: 10,
    tokensPerInterval: 2,
    interval: 1_000,
  })
  .useStorage(storage)
  .withKeyPrefix("messages:user");

const global = Limiter.global<Context>()
  .tokenBucket({
    bucketSize: 1_000,
    tokensPerInterval: 100,
    interval: 1_000,
  })
  .useStorage(storage)
  .withKeyPrefix("messages:global");

bot.use(limitAll(perUser, global));
```

The chain short-circuits when one layer rejects.

::: warning Sequential Composition Consumes As It Goes
If an earlier layer consumes capacity and a later layer rejects the same update, the earlier consumption is **not rolled back**.

This is deliberate because sequential layers may use independent or distributed storage engines where cross-layer rollback cannot be guaranteed.
Put the most selective rule first when that ordering better matches your policy.
:::

### Atomic Composition With `limitAllAtomic()`

Use `limitAllAtomic()` when multiple rules must behave as one all-or-nothing admission decision.

```ts
bot.use(limitAllAtomic(perUser, global));
```

If a later layer throttles or hits an active penalty, strategy state for the earlier layers is not committed.
All active layers are evaluated as one storage transaction.

This is stronger than "inspect every layer, then consume" because a preview/commit sequence would still race under concurrency.
The storage backend itself performs the atomic decision.

::: danger Requirements For Atomic Composition
`limitAllAtomic()` is intentionally strict.

- All participating rules must use the **same storage instance**.
- The storage must implement the atomic-composite capability.
- Observe-only rules cannot participate.
- A custom strategy must expose an equivalent atomic operation.
- Redis Cluster keys must share a hash slot.

Use normal `limitAll()` when these guarantees are not available or not required.
:::

## Manual Rate Limiting with `consume()`

The middleware returned by `limit()` can be invoked manually without entering the grammY middleware chain.

```ts
const middleware = limit(
  Limiter.perUser<Context>()
    .cooldown(5_000)
    .useStorage(storage)
    .withKeyPrefix("export"),
);

const result = await middleware.consume(ctx);

if (!result.isAllowed) {
  return;
}

await runExpensiveExport(ctx);
```

`consume()` uses the same evaluator as normal middleware.
Filters, keys, penalties, strategy behavior, observe-only mode, failure policy, events, and escalation therefore stay consistent with automatic middleware execution.

The difference is that `consume()` never calls grammY's `next()`.
It gives control flow back to you through `result.isAllowed`.

::: warning Do Not Accidentally Charge Twice
If the same update already passed through the same limiter as middleware, calling `consume(ctx)` on that same limiter performs another consumption.
Do that only when you intentionally want to charge the operation twice.
:::

## Refunding Manual Consumption

A successful manual `consume()` can be refunded using the exact result object returned by that limiter.

```ts
const result = await middleware.consume(ctx);

if (!result.isAllowed) {
  return;
}

try {
  await reserveResource();
} catch (error) {
  await middleware.refund(result);
  throw error;
}
```

Refund receipts are:

- internal,
- single-use,
- bound to the limiter instance that created them.

A result that was bypassed, throttled, already refunded, or produced by another limiter returns `false`.
Refunding does not clear penalties or strike history.

### Best-effort Refund

When latency matters more than waiting for the refund to finish, use `refundBestEffort()`.

```ts
if (!operationStarted) {
  middleware.refundBestEffort(result);
}
```

This schedules the refund and returns immediately.
Detached failures are contained and can be observed through the `refundError` event.

::: warning Best Effort Means Best Effort
The process may exit before detached refund work completes.
Use `await middleware.refund(result)` when restoring capacity is important to the correctness of your operation.
:::

## Inspecting Limiter State

`inspect(ctx)` returns a non-consuming snapshot of the rule for a particular context.

```ts
const state = await middleware.inspect(ctx);

console.log(state);
```

Depending on the current context and storage capabilities, inspection can include:

- whether the rule is bypassed,
- the resolved entity key,
- the storage key,
- the active penalty and remaining TTL,
- escalation strike state,
- a preview of the next strategy decision.

Built-in `MemoryStore` and `RedisStore` implement all built-in strategy preview operations.
Custom strategies may omit preview support; inspection reports that honestly instead of mutating state to approximate an answer.

## Diagnostics

`diagnose(ctx)` is a higher-level explanation of what the limiter would do **right now**, without consuming capacity.

```ts
const diagnostic = await middleware.diagnose(ctx);

console.dir(diagnostic, { depth: null });
```

Diagnostics can report outcomes such as:

- `bypassed`,
- `penalty-hit`,
- `would-allow`,
- `would-throttle`,
- `unknown` when a custom strategy cannot be previewed safely.

They also include strategy kind/options and the configured storage-failure policy.

::: info Diagnostics are pull-based
Diagnostics do no background work and are not controlled by environment variables.
Nothing is collected unless your code explicitly calls `diagnose()`.

Calling it does not consume capacity, persist penalties, invoke `onThrottled()`, or emit limiter events.
:::

Composite middleware also exposes `diagnose()`:

```ts
const combined = limitAll(perUser, global);
const diagnostic = await combined.diagnose(ctx);
```

The result identifies the blocking or uncertain layer when possible.

## Administrative Controls

The middleware returned by `limit()` exposes several state controls.

### Reset Strategy State

```ts
await middleware.reset(ctx);
```

This deletes the strategy state for the entity resolved from `ctx`.
It intentionally does **not** clear an active penalty.

### Clear A Penalty

```ts
await middleware.clearPenalty(ctx);
```

This removes penalty state without touching strategy capacity.

### Clear Escalation Strikes

```ts
await middleware.clearStrikes(ctx);
```

This removes strike history without clearing current strategy state or the active penalty.

These administrative operations intentionally ignore `onlyIf()` so an administrator can operate on state even when the supplied context would normally bypass the rule.

## Observe-only Mode

`observeOnly()` evaluates a rule without enforcing its rate-limit decision.

```ts
const candidate = Limiter.perUser<Context>()
  .gcra({
    rate: 5,
    interval: 10_000,
    burst: 3,
  })
  .useStorage(storage)
  .withKeyPrefix("candidate-policy")
  .withName("candidate-policy")
  .observeOnly()
  .on("decision", (_ctx, decision) => {
    console.log(decision);
  });

bot.use(limit(candidate));
```

Observe-only rules:

- evaluate the strategy,
- keep their state in an isolated shadow namespace,
- report what would have happened,
- never block downstream middleware because of a limiter decision,
- skip `onThrottled()` to avoid user-visible enforcement side effects.

::: tip Safer Policy Rollout
Observe-only mode is useful when replacing a production limit.
You can measure a candidate policy against real traffic before making it enforceable, without consuming or creating the production rule's enforcement state.
:::

Storage errors still follow the configured failure policy.
A `throw` policy can therefore still surface a broken backend even when the rule itself is observe-only.

## Storage Failure Policy

By default, limiter-owned storage failures are thrown.
This prevents a broken backend from silently changing your application's behavior.

You may choose another policy explicitly:

```ts
const limiter = Limiter.perUser<Context>()
  .tokenBucket({
    bucketSize: 10,
    tokensPerInterval: 2,
    interval: 1_000,
  })
  .useStorage(storage)
  .withKeyPrefix("messages")
  .withStorageFailurePolicy("fail-open");
```

Three modes are available:

| Mode | Behavior | Typical priority |
| --- | --- | --- |
| `throw` | Propagate the backend failure | Visibility/correctness |
| `fail-open` | Avoid blocking because limiter state is unavailable | Availability |
| `fail-closed` | Do not allow traffic when the limiter cannot decide safely | Protection |

A resolver may choose dynamically based on the context and failure metadata:

```ts
.withStorageFailurePolicy(async (ctx, info) => {
  await reportStorageFailure(info);

  if (ctx.hasChatType("private")) {
    return "fail-open";
  }

  return "fail-closed";
})
```

Failure metadata identifies the limiter phase, storage operation, exact key, entity key, and original error.

::: danger Choose Failure Behavior Deliberately
There is no universally safe default between fail-open and fail-closed.

Fail-open protects availability but can temporarily remove rate-limit protection.
Fail-closed preserves protection but can block legitimate traffic during a backend outage.
The default `throw` makes the failure explicit so your application decides what to do.
:::

## Naming Rules

`.withName()` attaches a human-readable name to structured results.
It does not affect storage keys or limiting behavior.

```ts
const limiter = Limiter.perUser<Context>()
  .cooldown(5_000)
  .useStorage(storage)
  .withKeyPrefix("search")
  .withName("search-command");
```

Names are useful in logs, decisions, metrics, inspection, diagnostics, and multi-rule compositions where a raw storage prefix is not a good observability label.

## Rich Metadata

Rich identity metadata is opt-in.
Enable the built-in Telegram identifiers with:

```ts
const limiter = Limiter.perUser<Context>()
  .cooldown(5_000)
  .useStorage(storage)
  .withKeyPrefix("search")
  .withMetadata();
```

When present, `ctx.from.id` and `ctx.chat.id` are included as `userId` and `chatId`.
Names, usernames, message contents, and other profile data are not collected automatically.

Add custom application identity with a synchronous resolver:

```ts
const limiter = Limiter.perUser<Context>()
  .cooldown(5_000)
  .useStorage(storage)
  .withKeyPrefix("search")
  .withMetadata((ctx) => ({
    tenant: getTenantId(ctx),
    plan: getPlan(ctx),
  }));
```

Custom fields are nested under `custom`, so they cannot overwrite the built-in Telegram IDs.
Their TypeScript type is preserved in structured results.

::: info Metadata Stays Opt-in
Metadata resolution is skipped unless `.withMetadata()` is enabled.
Normal middleware also keeps metadata off the hot path unless an observed structured decision needs it.
:::

## Events And Structured Decisions

Rules expose typed synchronous events through `.on()` and `.off()`.

```ts
const limiter = Limiter.perUser<Context>()
  .cooldown(5_000)
  .useStorage(storage)
  .withKeyPrefix("search")
  .withName("search")
  .on("decision", (_ctx, decision) => {
    console.log(decision);
  });
```

Available events include:

- `allowed`,
- `throttled`,
- `bypassed`,
- `penaltyHit`,
- `penaltyApplied`,
- `penaltyStrike`,
- `storageError`,
- `refundError`,
- `metric`,
- `decision`.

The `decision` event is the most convenient structured integration point.
Its discriminated outcome can represent allowed, throttled, bypassed, penalty-hit, and non-throwing storage-failure decisions.

::: warning Event Listeners Are Synchronous
Listener exceptions propagate through the middleware call.
Treat event handlers as part of your application execution path.
If telemetry must never break bot processing, contain failures inside your telemetry handler.
:::

## Metrics Hooks

ratelimiter does not force a metrics vendor or instrumentation SDK on your application.
Instead, the optional `metric` event emits vendor-neutral structured data.

```ts
const limiter = Limiter.perUser<Context>()
  .tokenBucket({
    bucketSize: 10,
    tokensPerInterval: 2,
    interval: 1_000,
  })
  .useStorage(storage)
  .withKeyPrefix("messages")
  .withName("messages")
  .on("metric", (_ctx, metric) => {
    metricsBackend.record(metric);
  });
```

Decision metrics include:

- the execution source,
- a timestamp,
- monotonic decision duration,
- the structured limiter decision.

Refund metrics report awaited vs best-effort execution and whether the refund succeeded, was unsupported, or failed.

Metric generation is lazy.
If there is no `metric` listener, the limiter does not create metric objects or capture timing data for them.

## Reusable Presets

Use `defineLimiterPreset()` when the same policy should be applied in several places without sharing one mutable builder.

```ts
import {
  defineLimiterPreset,
  limit,
  Limiter,
} from "@grammyjs/ratelimiter";

const antiSpam = defineLimiterPreset(() =>
  Limiter.perUser<Context>()
    .tokenBucket({
      bucketSize: 10,
      tokensPerInterval: 2,
      interval: 1_000,
    })
    .useStorage(storage)
    .withPenalty({ penaltyTime: 15_000 }),
);

bot.use(
  limit(
    antiSpam
      .apply()
      .withKeyPrefix("messages")
      .withName("messages"),
  ),
);

bot.command(
  "search",
  limit(
    antiSpam
      .apply()
      .withKeyPrefix("search")
      .withName("search"),
  ),
);
```

Each `.apply()` call executes the preset factory and must produce a **fresh** `Limiter` builder.
The returned builder can then be customized normally.

The preset itself contains no limiter state.
Captured storage instances may intentionally be shared while each applied rule receives its own key prefix.

::: tip Why A Factory Instead Of A Giant Configuration Object?
The preset reuses the fluent builder itself.
That means new builder capabilities automatically remain available without maintaining a second parallel configuration API.
:::

## Custom Strategies

If none of the built-in algorithms model your policy, use `.customStrategy()` with an object implementing `ILimiterStrategy`.

At minimum, a custom strategy implements `check()`:

```ts
const strategy = {
  async check(key, storage) {
    // Evaluate and consume your custom state here.
    return {
      isAllowed: true,
      remaining: 0,
      reset: 0,
    };
  },
};

const limiter = Limiter.perUser<Context>()
  .customStrategy(strategy)
  .useStorage(storage)
  .withKeyPrefix("custom");
```

Optional capabilities let custom strategies integrate more deeply:

- `preview()` for `inspect()` and `diagnose()`,
- `reset()` for administrative reset,
- `refund()` for manual refunds,
- `toAtomicOperation()` for `limitAllAtomic()` when the custom behavior is exactly representable by one of the supported atomic storage primitives.

::: warning Unsupported Is Better Than Unsafe
If a custom strategy cannot preview, refund, reset, or participate atomically with correct semantics, omit that capability.
ratelimiter reports unsupported functionality instead of mutating state or pretending an unsafe operation is atomic.
:::

## A Practical Layered Policy

The features above can be combined into a production policy without making every rule complicated.
For example:

```ts
const storage = new RedisStore(redisClient);

const messages = Limiter.perUser<Context>()
  .tokenBucket({
    bucketSize: 8,
    tokensPerInterval: 2,
    interval: 1_000,
  })
  .useStorage(storage)
  .withKeyPrefix("messages:user")
  .withName("message-spam")
  .withPenalty({
    penaltyTime: 10_000,
    escalation: {
      factor: 2,
      maxPenaltyTime: 5 * 60_000,
      resetAfter: 30 * 60_000,
    },
  });

const botWide = Limiter.global<Context>()
  .gcra({
    rate: 500,
    interval: 1_000,
    burst: 1_000,
  })
  .useStorage(storage)
  .withKeyPrefix("messages:global")
  .withName("global-protection");

bot.use(limitAllAtomic(messages, botWide));
```

This gives each user a burst-friendly personal policy while also placing one bot-wide ceiling around the protected pipeline.
Because both rules share an atomic-capable storage instance, the two capacity decisions can be committed together.

That is only one possible design.
The important part is to choose each layer according to the resource or abuse pattern it is protecting.

## Plugin Summary

- Name: `ratelimiter`
- [Source](https://github.com/grammyjs/ratelimiter)
- [API reference](/ref/ratelimiter/)
