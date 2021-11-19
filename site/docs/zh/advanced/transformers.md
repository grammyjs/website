---
prev: ./flood.md
next: ./proxy.md
---

# Bot API Transformers（转换器）

中间件是一个可以处理上下文对象的处理函数，例如处理输入的数据。

grammY 为你提供了和中间件相反的功能。
transformer 是一个可以处理输出的数据的函数，例如：

- 一个用来调用 Bot API 的方法名
- 一个可以匹配方法的 payload 对象

你接收 `prev` 作为使用上游 transformer 函数的第一个参数，而不是 将 `next` 作为调用下游中间件的最后一个参数。
查看 `Transformer`（[grammY API 参考](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#Transformer)）的类型签名，我们可以看见是如何映射的。
注意 `Payload<M, R>` 指的是 payload 对象必须匹配给定的方法，并且 `ApiResponse<ApiCallResult<M, R>>` 是调用方法的返回类型。

最后调用的 transformer 函数是一个内置的调用者，它可以对某些字段进行 JSON 序列化，并在最后调用 `fetch`。

对于 transformer 函数，没有等效的 `Composer` 类，因为这可能有点过分了，但是如果你需要它的话，你可以自己写一个，然后给我们提 PR，大大的欢迎！:wink:

## 安装一个 Transformer 函数

Transformer 函数可以被安装在 `bot.api` 中。
这是一个没有做任何事情的 transformer 函数的例子：

```ts
// 传递 transformer 函数
bot.api.config.use((prev, method, payload) => prev(method, payload));

// 对照传递的中间件
bot.use((ctx, next) => next());
```

这是一个 transformer 函数从发生时阻止所有 API 调用的例子：

```ts
// 错误的返回 undefined 而不是各自的对象类型
bot.api.config.use((prev, method, payload) => undefined as any);
```

你也可以在上下文对象的 API 对象中安装 transformer 函数。
然后，transformer 函数将仅临时用于在特定上下文对象上执行的API请求。
调用 `bot.api` 并不受影响。
通过并发运行的中间件的上下文对象调用也不受影响。
一旦各自的中间件完成，transformer 函数就会被废弃。

```ts
bot.on("message", (ctx) => {
  // 安装所有处理消息的上下文对象
  ctx.api.config.use((prev, method, payload) => prev(method, payload));
});
```

已经在 `bot.api` 中安装了Transformer 函数将会被预安装到每一个 `ctx.api` 对象中。
因此，调用 `ctx.api` 将会被 `ctx.api` 中的 transformers 转换，同样那些 transformers 也会被安装在 `bot.api` 中。

## Transformer 函数的使用用例

Transformer 函数像中间件一样灵活，并且他们也有很多不同的应用。

例如，[grammY menu 插件]((/zh/plugins/menu.md)) 使用了一个 transformer 函数来将 menu 实例转换成一个正确的 payload。
你也可以用它们来：

- 实现 [流量控制](/zh/plugins/transformer-throttler.md)
- 测试期间用来 mock API 请求
- 增加 [重试行为]((/zh/plugins/auto-retry.md))
- 或者更多其它的事情

注意，不过重试一个 API 调用会有偶然的副作用：如果你调用 `senDocument` 并且将一个可读流实例传递给 `InputFile`，可读流将会在尝试请求时第一时间被读取。
如果你再次调用 `prev`，这个流可能已经被（部分地）读取，会导致读取到损坏的文件。
因此它是将文件路径传递给 `InputFile` 的更加可靠的做法，grammY 可以在必要的时候重建这个流。

## API 调味剂

grammY 具有 [上下文调味剂](/zh/guide/context.md#上下文调味剂) 可以用于调整上下文类型。
这包括 API 方法 — 包括那些直接包含在上下文对象中的像 `ctx.reply` ，并且在 `ctx.api` 和 `ctx.api.raw` 中的方法。
不过你不能通过上下文调味剂来调整 `bot.api` 和 `bot.api.raw` 的类型。

这是为什么 grammY 支持 API 风格
它们解决了这个问题：

```ts
import { Api, Bot, Context } from "grammy";
import { SomeApiFlavor, someContextFlavor, somePlugin } from "some-plugin";

// 调味上下文
type MyContext = Context & SomeContextFlavor;
// 调味 API
type MyApi = Api & SomeApiFlavor;

// 同时使用两个调味剂
const bot = new Bot<MyContext, MyApi>("my-token");

// 使用插件
bot.api.config.use(somePlugin());

// 现在用从 API 调味剂调整过的类型调用 `bot.api`
bot.api.somePluginMethod();

// 还可以使用根据上下文调味剂调整的上下文类型
bot.on("message", (ctx) => ctx.api.somePluginMethod());
```

API 调味剂与上下文调味剂的工作方式完全相似。
这里有附加的和变革性的 API 调味剂，可以像处理上下文调味剂一样组合多个 API 调味剂。
如果你还不太清楚这是如何工作的，去查看这里面的指导信息 [关于上下文调味剂的小节](/zh/guide/context.md#上下文调味剂) 。
