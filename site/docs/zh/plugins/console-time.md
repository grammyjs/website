# 调试时输出日志

<Tag type="third-party-zh nodejs"/>

如果你熟悉 JavaScript / TypeScript，你可能使用 [`console.log`](https://developer.mozilla.org/en-US/docs/Web/API/Console/log) 或 [`console.time`](https://developer.mozilla.org/en-US/docs/Web/API/Console/time) 来检查你正在调试的事情。
当你在你的 bot 或中间件中工作时，你可能想要检查一个类似的事情：发生了什么，花了多少时间？

这个插件用于定位单个请求的问题。
当你在生产环境中工作时，你可能想要一个相反的东西，以获得一个大致的概览。
例如：当调试 `/start` 失败时，你会检查单个 Telegram update。
在生产环境中，你可能更加感兴趣的是所有 `/start` 消息。
这个库的目的是用于调试单个 update。

## 调试你的实现

```ts
import { generateUpdateMiddleware } from "telegraf-middleware-console-time";

if (process.env.NODE_ENV !== "production") {
  bot.use(generateUpdateMiddleware());
}

// 你的实现：
bot.command("start" /* , ... */);
```

它将输出这样的东西：

```plaintext
2020-03-31T14:32:36.974Z 490af message text Edgar 6 /start: 926.247ms
2020-03-31T14:32:57.750Z 490ag message text Edgar 6 /start: 914.764ms
2020-03-31T14:33:01.188Z 490ah message text Edgar 5 /stop: 302.666ms
2020-03-31T14:46:11.385Z 490ai message text Edgar 6 /start: 892.452ms
```

`490af` 是 `update_id`.

命令前面的数字是内容的总长度。这在某些情况下非常有用，例如回调数据的最大长度。

我们会缩短日志输出的内容，以防止日志垃圾。

## 调试你的中间件

当你创建自己的中间件或者假设有其他中间件执行得很慢时，你可以使用这些中间件来创建一个时间分析。

```ts
import {
  generateAfterMiddleware,
  generateBeforeMiddleware,
} from "telegraf-middleware-console-time";

const bot = new Bot(/* ... */);

// 在加载被测试中间件之前使用 BeforeMiddleware
bot.use(generateBeforeMiddleware("foo"));

// 被测试的中间件
bot.use(/* ... */);

// 在加载被测试中间件之后使用 AfterMiddleware（使用相同标签）
bot.use(generateAfterMiddleware("foo"));

// 其他中间件或者实现（它们会在使用时获得 "inner" 的时间）
bot.use(/* ... */);
bot.on("message" /* ... */);
```

它将输出这样的东西：

```plaintext
490ai foo before: 304.185ms
490ai foo inner: 83.122ms
490ai foo after: 501.028ms
490ai foo total: 891.849ms
```

这表明被测试的中间件花了 800ms，并没有达到预期的性能。

## 插件概述

- 源码：<https://github.com/EdJoPaTo/telegraf-middleware-console-time>
