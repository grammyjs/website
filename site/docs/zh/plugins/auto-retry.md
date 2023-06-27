# 重试 API 请求（`auto-retry`）

这个插件是一个 [API 转换函数](../advanced/transformers.md)，这意味着它可以让你动态地拦截和修改传出的 HTTP 请求。
更具体一点，这个插件将自动检测一个 API 请求是否失败（比如说因为速率限制），并且使用返回值中的 `retry_after`。
它会自动捕捉错误，等待指定时间后重试请求。

::: tip 洪水控制
Telegram 会在你发送消息过快时向你发出提醒。
这是洪水控制的重要措施，它确保你的 bot 不会给 Telegram 造成过大的负荷。
使用这个插件非常重要，因为如果你忘记遵循 [429 错误](../resources/faq.md#429-too-many-requests-retry-after-x)，Telegram 可能会封禁你的 bot。
:::

你可以在 `bot.api` 对象上安装这个插件：

::::code-group
:::code-group-item TypeScript

```ts
import { autoRetry } from "@grammyjs/auto-retry";

// 使用插件。
bot.api.config.use(autoRetry());
```

:::
:::code-group-item JavaScript

```js
const { autoRetry } = require("@grammyjs/auto-retry");

// 使用插件。
bot.api.config.use(autoRetry());
```

:::
:::code-group-item Deno

```ts
import { autoRetry } from "https://esm.sh/@grammyjs/auto-retry";

// 安装插件
bot.api.config.use(autoRetry());
```

:::
::::

如果你现在在调用，比如说 `sendMessage` 并且碰到了速率限制，它只是会看起来需要请求特别长的时间。
在内部会执行多个 HTTP 请求，并且添加适当的延迟。

你可以传入一个选项对象，指定最大的重试次数（`maxRetryAttempts`，默认值：3）或者最大的等待时间阈值（`maxDelaySeconds`，默认值：一小时）。

一旦耗尽最大重试次数，将不会再次重试相同错误的请求。
相反，来自 Telegram 的错误对象会被包装成 [`GrammyError`](../guide/errors.md#grammyerror-对象) 抛出。

同样的，如果请求失败时 `retry_after` 大于 `maxDelaySeconds` 所指定的时间，请求会立即失败。

```ts
autoRetry({
  maxRetryAttempts: 1, // 只重复请求一次
  maxDelaySeconds: 5, // 如果我们必须等待大于 5 秒以上，则立即失败
});
```

你可以使用 `retryOnInternalServerErrors` 将 Telegram 的所有其他内部服务器错误（状态码 >= 500）纳入上述程序。
这些错误将会被立即重试，但是它们也会遵循 `maxRetryAttempts` 选项。

## 插件概述

- 名字：`auto-retry`
- 源码：<https://github.com/grammyjs/auto-retry>
- 参考：<https://doc.deno.land/https://raw.githubusercontent.com/grammyjs/auto-retry/main/src/index.ts>
