# 重试 API 请求（`auto-retry`）

> 请考虑使用 [流量控制插件](./transformer-throttler.md) 替代。

这个插件是一个 [API 转换函数](/zh/advanced/transformers.md)，这意味着它可以让你动态地拦截和修改传出的 HTTP 请求。
更具体一点，这个插件将自动检测一个 API 请求是否失败（比如说因为速率限制），并且使用返回值中的 `retry_after`。
它会自动捕捉错误，等待指定时间后重试请求。

::: warning 请对 Bot API 服务器温柔一点
Telegram 不像别的服务那样直接限制你的请求，它会告诉你，你的 bot 在下一个请求前必须等待多长时间。
使用 `auto-retry` 插件可以让你的 bot 在负载高峰期表现得更好，因为请求不会简单地因为流量限制而失败。。
但是，如果你想避免经常触及速率限制，**那么你不应该使用 auto-retry**。
如果你经常超过请求数量的阈值，Telegram 可能会采取一些措施，比如说限制或者封禁你的 bot。
:::

你可以在 `bot.api` 对象上安装这个插件：

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { autoRetry } from "@grammyjs/auto-retry";

// 使用插件。
bot.api.config.use(autoRetry());
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { autoRetry } = require("@grammyjs/auto-retry");

// 使用插件。
bot.api.config.use(autoRetry());
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { autoRetry } from "https://esm.sh/@grammyjs/auto-retry";

// 安装插件
bot.api.config.use(autoRetry());
```

</CodeGroupItem>
</CodeGroup>

如果你现在在调用，比如说 `sendMessage` 并且碰到了速率限制，它只是会看起来需要请求特别长的时间。
在内部会执行多个 HTTP 请求，并且添加适当的延迟。

你可以传入一个选项对象，指定最大的重试次数（`maxRetryAttempts`，默认值：3）或者最大的等待时间阈值（`maxDelaySeconds`，默认值：一小时）。

一旦耗尽最大重试次数，将不会再次重试相同错误的请求。
相反，来自 Telegram 的错误对象会被包装成 [`GrammyError`](/zh/guide/errors.md#grammyerror-对象) 抛出。

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
- 参考：<https://doc.deno.land/https://raw.githubusercontent.com%2Fgrammyjs%2Fauto-retry%2Fmain%2Fsrc%2Findex.ts>
