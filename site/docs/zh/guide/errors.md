---
prev: ./middleware.html
next: ./inline-queries.html
---

# 错误处理

由中间件造成的每一个错误都会被 grammY 捕获。
你应该安装一个专用的错误处理器去处理这些错误。

最重要的是, 这个章节会教你 [如何处理抛出的错误](#错误捕捉)。

然后，我们会把你遇到的错误分为三个种类。

| 名称                                 | 用途                                              |
| ---------------------------------- | ----------------------------------------------- |
| [`Bot Errors`](#boterror-对象)       | 包含所有插件抛出的错误对象（比如下面这两种错误）                        |
| [`Grammy Errors`](#grammyerror-对象) | 当 Bot API 返回 `ok: false` 时抛出, 表示你的API请求是无效的或失败的 |
| [`Http Errors`](#httperror-对象)     | 当 BOT API 服务器无法连接时抛出                            |

更高级的错误处理机制 [链接](#error-边界)。

## 错误捕捉

这取决于你错误捕捉的设置。

### 长轮询

如果你运行 bot 通过 `bot.start()` 或者你使用 [grammY runner](/zh/plugins/runner.md) 运行, 那么然后你应该**通过 `bot.catch` 安装一个错误处理器**。

如果通过 `bot.start()` 启动， grammY 会安装一个默认的错误处理器。
你的设置会决定程序如何捕捉错误。
这就是为什么 **你要应该要通过 `bot.catch` 安装一个错误处理器**。

示例:

```ts
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});
```

### Webhooks

如果你通过 webhooks 来运行你的机器人，grammY 会传递错误到你所用的网络框架中，例如 `express`。
你应该更加框架的习惯来处理错误。

## `BotError` 对象

`BotError` 对象将抛出的错误与导致该错误的对应的 [上下文对象](/zh/guide/context.md) 绑定在一起。

其工作原理如下：

无论在处理更新时发生什么错误，grammY 都会为您捕获抛出的错误。
这通常对你定位错误上下文非常有效。

grammY 不会以任何方式触及抛出的错误，而是把它包装成一个 `BotError` 实例，
会给你一个名为 `err` 的对象， 你可以找到最根本的错误通过 `err.error`，
同样，你可以到达相应的上下文对象通过 `err.ctx`。

在 [grammY API 参考](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/BotError) 中了解 `BotError` 类。

## `GrammyError` 对象

如果一个像 `sendMessage` 的 API 方法失败了，grammY 会抛出一个 `GrammyError` 错误。
同样需要注意的是如果一个 `GrammyError` 错误实例是被中间件抛出的，那么它同样会被封装成 `BotError` 对象。

一个被抛出的`GrammyError` 意味着对应的 API 方法失败了。
这个错误对象提供路径去查看 Telegram 后台返回的错误代码和描述。

在 [grammY API 参考](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/GrammyError) 中了解 `GrammyError` 类。

## `HttpError` 对象

如果一个网络请求失败了，那么会抛出一个 `HttpError`。
这意味着 grammY 不能连接到 Bot API 服务器。
你可以在这个错误对象的 `error` 属性中找到你请求失败的原因。

除非你的网络不可用了或者 你的 Bot API 服务器暂时下线了，否则你基本看不到这种类型的错误。

> 需要注意的是如果 Bot API 服务器能被链接，但是方法回调返回了 `ok: false`，这时就会抛出 [`GrammyError`](/zh/guide/errors.md#GrammyError对象) 作为代替。

在 [grammY API 参考](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/HttpError) 中了解 `HttpError` 类。

## Error 边界

> 这是一个高级主题，对大型机器人程序非常有用
> 如果您对 grammY 还比较陌生，可以跳过本节的其余部分。

如果你把你的代码库划分成不同的部分，_error 边界_ 允许你安装不同的错误处理器处理不同的中间件部分。
它们通过让您在中间件的一部分中隔离错误来实现这一点。
换句话说，如果一个错误在一个特殊隔离的中间件被抛出，他不能逃离中间件系统的该部分。
相反，一个专用的错误处理器会被调用，并且隔离的中间件部分会假设成功的运行。
这是 grammY 中间件系统的特性， 所以错误边界不在意你是否运行你的机器人程序在网站函数或者长轮询上。

或者，您可以选择让中间件执行在错误处理后正常恢复，并在错误边界之外继续。

在这种情况下， 中间件隔离不仅表现得好像它已经成功完成了，并且他会传递控制流到下一个中间件（被安装在这个错误边界之外的）。

因此，看起来就好像包含错误的中间件运行了 `next`。

```ts
const bot = new Bot("");

bot.use(/* A */);
bot.use(/* B */);

const composer = new Composer();
composer.use(/* X */);
composer.use(/* Y */);
composer.use(/* Z */);
bot.errorBoundary(boundaryHandler /* , Q */).use(composer);

bot.use(/* C */);
bot.use(/* D */);

bot.catch(errorHandler);

function boundaryHandler(err: BotError, next: NextFunction) {
  console.error("Error in Q, X, Y, or Z!", err);
  /*
   * 如果你想在 C 处运行中间件以防止出错
   * 你可以调用 `next`：
   */
  // await next()
}

function errorHandler(err: BotError) {
  console.error("Error in A, B, C, or D!", err);
}
```

在上面的例子里，`boundaryHandler` 将在下面两种中间件中被调用：

1. 在 `bot.errorBoundary`（即 `Q`）之后传递给 `boundaryHandler` 的所有中间件
2. 安装在随后安装的 composer 实例（即 `X`，`Y`，和 `Z`）上的所有中间件。

> 关于第 2 点，你可能想要跳转到中间件的 [高级解释](/zh/advanced/middleware.md) 中去学习如何在 grammY 中连接中间件。

你还可以将错误边界应用到一个没有调用 `bot.errorBoundary` 的 composer 中：

```ts
const composer = new Composer();

const protected = composer.errorBoundary(boundaryHandler);
protected.use(/* B */);

bot.use(composer);
bot.use(/* C */);

bot.catch(errorHandler);

function boundaryHandler(err: BotError, next: NextFunction) {
  console.error("Error in B!", err);
}

function errorHandler(err: BotError) {
  console.error("Error in C!", err);
}
```

上述例子中的 `boundaryHandler` 将被绑定到 `protected` 的中间件调用。

如果你还是想要你的错误穿越错误边界（到达边界外），你可以重新在你的错误处理器里面抛出这个错误。

这个错误会被传递到下一个包围边界。

在这种情景中， 你可以将通过 `bot.catch` 安装的错误处理器视为最外围的错误边界。
