# 中间件

传递给 `bot.on()`，`bot.command()` 和它们的兄弟姐妹的监听器函数被称为 _中间件_。
虽然说它们在监听更新是没有错的，但称它们为"监听者"又有些简单了。

> 本节解释了什么是中间件，并以 grammY 为例，说明如何使用中间件。
> 如果你正在寻找关于 grammY 实现中间件的特别之处的具体文档，请查看文档高级部分的 [Middleware Redux](../advanced/middleware)。

## 中间件栈

假设你写一个这样的 bot:

```ts{8}
const bot = new Bot("");

bot.use(session());

bot.command("start", (ctx) => ctx.reply("Started!"));
bot.command("help", (ctx) => ctx.reply("Help text"));

bot.on(":text", (ctx) => ctx.reply("Text!")); // (*)
bot.on(":photo", (ctx) => ctx.reply("Photo!"));

bot.start();
```

当有普通文本信息的更新到达时，将执行这些步骤：

1. 你向 bot 发送 `你好！`。
2. 你的 `session` 中间件会收到这些更新，并且做一些它需要做的事情。
3. 这次更新将检查是否存在 `/start` command，即使它并不存在。
4. 这次更新将检查是否存在 `/help` command，即使它并不存在。
5. 更新将检查存在于信息中（或是 channel post 中）存在的文本信息，这些是存在的。
6. 中间件 `(*)` 将被调用，它通过回复 `Text` 来处理更新。

这次更新是**不**检查照片内容的，因为 `(*)` 的中间件已经处理了该更新。

这是如何工作的呢？
让我们来了解一下。

我们可以在 grammY 的参考资料中查看 `Middleware` [类型](/ref/core/middleware)。

```ts
// 为了简洁起见，省略了一些类型参数。
type Middleware = MiddlewareFn | MiddlewareObj;
```

啊哈。
中间件可以是一个函数或一个对象。
我们只用了函数（`(ctx) => { ... }`），所以我们暂时忽略中间件对象，深入挖掘 `MiddlewareFn` 类型（[参考](/ref/core/middlewarefn)）。

```ts
// 再次省略了类型参数。
type MiddlewareFn = (ctx: Context, next: NextFunction) => MaybePromise<unknown>;
// 和
type NextFunction = () => Promise<void>;
```

所以，中间件需要两个参数!
到目前为止我们只用了一个，即上下文对象 `ctx`。
我们[已经知道](./context) `ctx` 是什么，但我们也看到一个名字为 `next` 的函数。
为了理解 `next` 是什么，我们必须把你安装在 bot 对象上的所有中间件作为一个整体来看。

你可以把所有安装的中间件功能看作是若干层，它们相互堆叠在一起。
第一个中间件（在我们的例子中是 `session` ）是最上层，因此首先接收每个更新。
然后它可以决定是否要处理更新，或将其传递给下一层（ `/start` command 处理程序）。
函数 `next` 可以用来调用后续的中间件，通常称为 _下游中间件_。
这也意味着，如果你在中间件中不调用 `next` ，底层的中间件将不会被调用。

这个函数栈就是 _中间件栈_。

```asciiart:no-line-numbers
(ctx, next) => ...    |
(ctx, next) => ...    |————— X 的上游中间件
(ctx, next) => ...    |
(ctx, next) => ...       <— 中间件 X 调用 `next` 来传递更新信息
(ctx, next) => ...    |
(ctx, next) => ...    |————— X 的下游中间件
(ctx, next) => ...    |
```

回顾我们之前的例子，我们现在知道为什么 `bot.on(":photo")` 从未被使用：`bot.on(":text", (ctx) => { ... })` 中的中间件已经处理了更新，它没有调用 `next` 。
事实上，它甚至没有把 `next` 作为一个参数。
它只是忽略了 `next` ，因此没有传递更新。

让我们用我们的新知识尝试一下其他的东西吧!

```ts
const bot = new Bot("");

bot.on(":text", (ctx) => ctx.reply("Text!"));
bot.command("start", (ctx) => ctx.reply("Command!"));

bot.start();
```

如果你运行上述 bot ，并发送 `/start` ，你将永远不会看到一个 `Command!` 的响应。
让我们思考一下会发生什么。

1. 你发送了 `"/start"` 给 bot.
2. `:text` 中间件收到更新并检查文本，由于 command 是文本信息，所以成功了。
   更新被第一个中间件立即处理，你的机器人回复 `Text!` 。

消息甚至从来没有被检查过是否包含 `/start` command。
你注册中间件的顺序很重要，因为它决定了中间件栈中各层的顺序。
你可以通过翻转第 3 和第 4 行的顺序来解决这个问题。
如果你在第 3 行调用 `next` ，就会有两个响应被发送。

**`bot.use()` 函数只是注册了接收所有更新的中间件**
这就是为什么 `session()` 要通过 `bot.use()` 来安装的原因，我们希望这个插件能对所有的更新进行操作，不管包含什么数据。

拥有一个中间件栈是任何网络框架的一个极其强大的属性，这种模式广泛流行（不仅仅是Telegram Bot）。

让我们自己写一个小的中间件来更好地说明它是如何工作的。

## 编写自定义中间件

我们将通过编写一个简单的中间件函数来说明中间件的概念，该函数可以统计你的 bot 的响应时间，即你的 bot 处理一个消息需要多长时间。

这里是我们中间件的函数签名。
你可以把它与上面的中间件类型进行比较，并说服自己，我们在这里确实完成了一个中间件。

::: code-group

```ts [TypeScript]
/** 统计 bot 的响应时间，并将其记录到 `console`。 */
async function responseTime(
  ctx: Context,
  next: NextFunction, // 这是 `() => Promise<void>` 的一个别名
): Promise<void> {
  // TODO：实现
}
```

```js [JavaScript]
/** 统计 bot 的响应时间，并将其记录到 `console`。 */
async function responseTime(ctx, next) {
  // TODO：实现
}
```

:::

我们可以用 `bot.use()` 把它安装到我们的 `bot` 实例中。

```ts
bot.use(responseTime);
```

让我们开始实现它。
以下是我们要做的事情：

1. 一旦有更新到来，我们就把 `Date.now()` 存储在一个变量中。
2. 我们调用下游的中间件，好让所有的消息处理发生。
   这包括 command 匹配、回复以及你的 bot 所做的其他一切。
3. 我们再次使用 `Date.now()` ，将其与旧值进行比较，然后 `console.log` 显示时间差异。

重要的是，要先在 bot 上安装我们的 `responseTime` 中间件（在中间件栈的顶部），以确保所有操作都包括在统计中。

::: code-group

```ts [TypeScript]
/** 统计 bot 的响应时间，并将其记录到 `console`。 */
async function responseTime(
  ctx: Context,
  next: NextFunction, // 这是 `() => Promise<void>` 的一个别名
): Promise<void> {
  // 开始计时
  const before = Date.now(); // 毫秒
  // 调用下游的中间件
  await next(); // 请务必使用 `await`！
  // 停止计时
  const after = Date.now(); // 毫秒
  // 打印时间差
  console.log(`Response time: ${after - before} ms`);
}

bot.use(responseTime);
```

```js [JavaScript]
/** 统计 bot 的响应时间，并将其记录到 `console`。 */
async function responseTime(ctx, next) {
  // 开始计时
  const before = Date.now(); // 毫秒
  // 调用下游的中间件
  await next(); // 请务必使用 `await`！
  // 停止计时
  const after = Date.now(); // 毫秒
  // 打印时间差
  console.log(`Response time: ${after - before} ms`);
}

bot.use(responseTime);
```

:::

完成，并且可以正常工作! :heavy_check_mark:

欢迎在你的 bot 对象上使用这个中间件，注册更多的监听器，并试一试这个例子。
这样做将有助于你充分理解什么是中间件。

::: danger DANGER: 请一定要对 `next` 使用 `await`！
如果你在调用 `next()` 时没有使用 `await` 关键字，有几件事会被搞砸：

- :x: 你的中间件栈将以错误的顺序执行。
- :x: 你可能会遇到数据丢失。
- :x: 一些消息可能无法发送
- :x: 你的 bot 可能会以难以重现的方式随机崩溃。
- :x: 如果发生错误，你的错误处理程序将不会被调用。
  相反，你会看到一个 `UnhandledPromiseRejectionWarning` 发生，这可能会使你的 bot 进程崩溃。
- :x: [grammY runner](../plugins/runner) 的抗压机制被打破，它可以保护你的服务器免受过高的负载，例如在负载高峰期。
- :skull: 有时，它还会杀死你所有的无辜代码（是真的！）。:crying_cat_face:

:::

你应该在 `next()` 前使用 `await` 这一规则是特别重要的，但它实际上适用于任何返回 `Promise` 的一般表达式。
这包括 `bot.api.sendMessage`，`ctx.reply`，以及所有其他网络调用。
如果你的项目对你很重要，那么你就会使用提示工具，如果你忘记在 `Promise` 上使用 `await`，工具会警告你。

::: tip 启用 no-floating-promises
考虑使用 [ESLint](https://eslint.org/) 并配置它使用 [no-floating-promises](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-floating-promises.mdx) 规则。
这将确保你永远不会忘记使用 `await`（通过不停的唠叨你）。
:::

## grammY 的中间件属性

对于 grammY，中间件将返回一个 `Promise`（必须结合 `await` 使用）, 但它也可以是同步的。

与其他中间件系统（如来自 `express` 的中间件系统）相比，你不能向 `next` 传递错误值。
`next` 不接受任何参数。
如果你想报错，你可以直接 `throw` 错误。
另一个区别是，你的中间件接受多少个参数并不重要。`() => {}` 将被完全作为 `(ctx) => {}` 处理，或作为 `(ctx, next) => {}` 处理。

有两种类型的中间件：函数和对象。
中间件对象只是中间件函数的一个封装器。
它们大多在内部使用，但有时也可以帮助第三方库，或用于高级用例，如与 [Composer](/ref/core/composer)：

```ts
const bot = new Bot("");

bot.use(/*...*/);
bot.use(/*...*/);

const composer = new Composer();
composer.use(/*...*/);
composer.use(/*...*/);
composer.use(/*...*/);
bot.use(composer); // composer 是一个中间件对象!

bot.use(/*...*/);
bot.use(/*...*/);
// ...
```

如果你想深入了解 grammY 如何实现中间件，请在文档的进阶部分查阅 [Middleware Redux](../advanced/middleware)。
