---
prev: false
next: false
---

# 重试 API 请求（`auto-retry`）

自动重试插件是处理 [洪水限制](../advanced/flood) （即代码 429 的错误）所需的一切。
在正常运行期间，每个 bot 都可以使用它，但在 [广播](../advanced/flood#如何进行消息广播) 时尤其有用。

这个插件是一个 [API 转换函数](../advanced/transformers)，这意味着它可以让你动态地拦截和修改传出的 HTTP 请求。
更具体一点，这个插件将自动检测一个 API 请求是否失败（比如说因为速率限制），并且使用返回值中的 `retry_after`。
它会自动捕捉错误，等待指定时间后重试请求。

除处理洪水限制外，如果请求因服务器内部错误（即代码为 500 或更大的错误）而失败，该插件还会重试请求。
网络错误（那些在 grammY 中 [抛出的 `HttpError`](../guide/errors#httperror-对象) 的错误）也会导致重试。
重试这些请求或多或少是处理这两类错误的唯一合理策略。
由于这两种错误都不提供 `retry_after` 值，因此插件采用了从 3 秒开始、以一小时为上限的指数退避策略。

## 安装

你可以在 `bot.api` 对象上安装这个插件：

::: code-group

```ts [TypeScript]
import { autoRetry } from "@grammyjs/auto-retry";

// 使用插件。
bot.api.config.use(autoRetry());
```

```js [JavaScript]
const { autoRetry } = require("@grammyjs/auto-retry");

// 使用插件。
bot.api.config.use(autoRetry());
```

```ts [Deno]
import { autoRetry } from "https://deno.land/x/grammy_auto_retry/mod.ts";

// 安装插件
bot.api.config.use(autoRetry());
```

:::

如果你现在在调用，比如说 `sendMessage` 并且碰到了速率限制，它只是会看起来需要请求特别长的时间。
在内部会执行多个 HTTP 请求，并且添加适当的延迟。

## 配置

你可以传入一个选项对象，指定最大的重试次数（`maxRetryAttempts`）或者最大的等待时间阈值（`maxDelaySeconds`）。

### 限制重试

一旦耗尽最大重试次数，将不会再次重试相同错误的请求。
相反，来自 Telegram 的错误对象会被包装成 [`GrammyError`](../guide/errors#grammyerror-对象) 抛出。

同样的，如果请求失败时 `retry_after` 大于 `maxDelaySeconds` 所指定的时间，请求会立即失败。

```ts
autoRetry({
  maxRetryAttempts: 1, // 只重复请求一次
  maxDelaySeconds: 5, // 如果我们必须等待大于 5 秒以上，则立即失败
});
```

### 重新抛出服务器内部错误

你可以使用 `rethrowInternalServerErrors` 来选择不处理服务器内部错误，如 [上文](#重试-api-请求-auto-retry) 所述。
同样，Telegram 的错误对象也会传递过来，实际上就是用 [`GrammyError`](../guide/errors#grammyerror-对象) 使请求失败。

```ts
autoRetry({
  rethrowInternalServerErrors: true, // 不处理服务器内部错误
});
```

### 重新抛出网络错误的重抛

你可以使用 `rethrowHttpErrors` 来选择不处理网络错误，如 [上文](#重试-api-请求-auto-retry) 所述。
如果启用，抛出的 [`HttpError`](../guide/errors#httperror-对象) 实例将被传递，导致请求失败。

```ts
autoRetry({
  rethrowHttpErrors: true, // 不处理网络错误
});
```

## 插件概述

- 名字：`auto-retry`
- [源码](https://github.com/grammyjs/auto-retry)
- [参考](/ref/auto-retry/)
