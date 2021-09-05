---
prev: ./commands.md
next: ./errors.md
---

# Middleware

The listener functions that are being passed to `bot.on()`, `bot.command()`, and their siblings, are called _middleware_.
While it is not wrong that they are listening for updates, calling them just listeners is a simplification.

> This section explains what middleware is, and uses grammY as an example to illustrate how it can be used.
> If you are looking for the documentation about what is special about grammY's implementation of middleware, check out [Middleware redux](/advanced/middleware.md) in the advanced section of the docs.

## The middleware stack

Suppose you write a bot like this:

```ts
const bot = new Bot("<token>");

bot.use(session());

bot.command("start", (ctx) => ctx.reply("Started!"));
bot.command("help", (ctx) => ctx.reply("Help text"));

bot.on(":text", (ctx) => ctx.reply("Text!")); // (*)
bot.on(":photo", (ctx) => ctx.reply("Photo!"));

bot.start();
```

When an update with a regular text message arrives, these steps will be performed:

1. You send `'Hi there!'` to the bot.
2. The session middleware receives the update, and does its session things
3. The update will be checked for a `/start` command, which is not contained
4. The update will be checked for a `/help` command, which is not contained
5. The update will be checked for text in the message (or channel post), which succeeds.
6. The middleware at `(*)` will be invoked, it handles the update by replying with `'Text!'`.

The update is **not** checked for a photo content, because the middleware at `(*)` already handled the update.

Now, how does this work?
Let's find out.

We can inspect the `Middleware` type in grammY's reference [here](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#Middleware):

```ts
// omitted some type paramters for brevity
type Middleware = MiddlewareFn | MiddlewareObj;
```

Aha.
Middleware can be a function or an object.
We only used functions (`(ctx) => { ... }`) so far, so let's ignore middleware objects for now, and dig deeper into the `MiddlewareFn` type ([reference](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#MiddlewareFn)):

```ts
// omitted type parameters again
type MiddlewareFn = (ctx: Context, next: NextFunction) => MaybePromise<unknown>;
// with
type NextFunction = () => Promise<void>;
```

So, middleware takes two parameters!
We only used one so far, the context object `ctx`.
We [already know](./context.md) what `ctx` is, but we also see a function with the name `next`.
In order to understand what `next` is, we have to look at all middleware that you install on your bot as a whole.

You can view all installed middleware functions as a number of layers that are stacked on top of each other.
The first middleware (`session` in our example) is the uppermost layer, hence receiving each update first.
It can then decide if it wants to handle the update, or pass it down to the next layer (the `/start` command handler).
The function `next` can be used to invoke the subsequent middleware, often called _downstream middleware_.
This also means that if you don't call `next` in your middleware, the underlying layers of middleware will not be invoked.

This stack of functions is the _middleware stack_.

```asciiart:no-line-numbers
 (ctx, next) => ...    |
 (ctx, next) => ...    |—————upstream middleware of X
 (ctx, next) => ...    |
 (ctx, next) => ...       <— middleware X. Call `next` to pass down updates
 (ctx, next) => ...    |
 (ctx, next) => ...    |—————downstream middleware of X
 (ctx, next) => ...    |
```

Looking back at our example earlier, we now know why `bot.on(":photo")` was never even checked: the middleware in `bot.(":text", (ctx) => { ... })` already handled the update, and it did not call `next`.
In fact, it did not even specify `next` as a parameter.
It simply ignored `next`, hence not passing on the update.

Let's try out something else with our new knowledge!

```ts
const bot = new Bot("<token>");

bot.on(":text", (ctx) => ctx.reply("Text!"));
bot.command("start", (ctx) => ctx.reply("Command!"));

bot.start();
```

If you run the above bot, and send `/start`, you will never get to see a response saying `Command!`.
Let's inspect what happens:

1. You send `'/start'` to the bot.
2. The `':text'` middleware receives the update and checks for text, which succeeds because commands are text messages.
   The update is handled immediately by the first middleware and your bot replies with “Text!”.

The message is never even checked for containing the `/start` command!
The order in which you register your middleware matters, because it determines the order of the layers in the middleware stack.
You can fix the issue by flipping the order of lines 3 and 4.
If you would call `next` in line 3, two responses would be sent.

**The `bot.use()` function simply registers middleware that receives all updates.**
This is why `session()` is installed via `bot.use()`—we want the plugin to operate on all updates, no matter what data is contained.

Having a middleware stack is an extremely powerful property of any web framework, and this pattern is widely popular (not just for Telegram bots).

Let's write our own little piece of middleware to illustrate even better how it works.

## Writing custom middleware

We will illustrate the concept of middleware by writing a simple middleware function that can measure the response time of your bot, i.e. how long it takes your bot to handle a message.

Here is the function signature for our middleware.
You can compare it to the middleware type from above, and convince yourself that we actually have middleware here.

```ts
/** Measure the response time of the bot, and logs it to `console` */
async function responseTime(
  ctx: Context,
  next: NextFunction // is an alias for: () => Promise<void>
): Promise<void> {
  // TODO implement
}
```

We can install it into our `bot` instance with `bot.use()`:

```ts
bot.use(responseTime);
```

Let's begin implementing it.
Here is what we want to do:

1. Once an update arrives, we store `Date.now()` in a variable.
2. We invoke the downstream middleware, hence let all message handling happen.
   This includes command matching, replying, and everything else your bot does.
3. We take `Date.now()` again, compare it to the old value, and `console.log` the time difference.

It is important to install our `responseTime` middleware _at first_ on the bot to make sure that all operations are included in the measurement.

```ts
/** Measure the response time of the bot, and log it */
async function responseTime(
  ctx: Context,
  next: NextFunction
): Promise<void> {
  // take time before
  const before = Date.now(); // milliseconds
  // invoke downstream middleware
  await next(); // make sure to `await`!
  // take time after
  const after = Date.now(); // milliseconds
  // log difference
  console.log(`Response time: ${after - before} ms`);
}

bot.use(responseTime);
```

Complete, and works! :heavy_check_mark:

Feel free to use this middleware on your bot, register more listeners, and play around with the example.
It helps a lot to really understand what middleware is.

::: danger DANGER: Always make sure to await next!
If you ever call `next()` without the `await` keyword, several things will break:

- :x: Your middleware stack will be executed in the wrong order.
- :x: If an error happens, your error handler will not be called for it.
  Instead, you will see that an `UnhandledPromiseRejectionWarning` will occur, which may crash the Node.js process
- :x: The backpressure mechanism of [grammY runner](/plugins/runner.md) breaks, which protects your server from too high load, such as during load spikes.
- :skull: Sometimes it also kills all your innocent kittens.

:::

The rule that you should use `await` is actually not just true for `next()`, but for any expression that returns a `Promise` in general.
This includes `bot.api.sendMessage`, `ctx.reply`, and all other network calls.
If your project is important to you, then you use linting tools that warn you if you ever forget to use `await` on a `Promise`.

::: tip Enable no-floating-promises
Consider using [ESLint](https://eslint.org/) and configure it to use the [no-floating-promises](https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-floating-promises.md) rule.
This will make sure that you never forget to use `await` (by yelling at you).
:::

## Properties of middleware in grammY

In grammY, middleware may return a `Promise` (which will be `await`ed), but it can also be synchronous.

In contrast to other middleware systems (such as the one from `express`), you cannot pass error values to `next`.
`next` does not take any arguments.
If you want to error, you can simply `throw` the error.
Another difference is that it does not matter how many arguments your middleware takes: `() => {}` will be handled exactly as `(ctx) => {}`, or as `(ctx, next) => {}`.

There are two types of middleware: functions and objects.
Middleware objects are simply a wrapper for middleware functions.
They are mostly used internally, but can sometimes also help third-party libraries, or be used in advanced use cases, such as with [Composer](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#Composer):

```ts
const bot = new Bot("<token>");

bot.use(/*...*/);
bot.use(/*...*/);

const composer = new Composer();
composer.use(/*...*/);
composer.use(/*...*/);
composer.use(/*...*/);
bot.use(composer); // composer is a middleware object!

bot.use(/*...*/);
bot.use(/*...*/);
// ...
```

If you want to dig deeper into how grammY implements middleware, check out [Middleware redux](/advanced/middleware.md) in the advanced section of the docs.
