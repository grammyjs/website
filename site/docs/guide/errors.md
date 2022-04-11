---
prev: ./middleware.md
next: ./inline-queries.md
---

# Error Handling

Every single error caused by your middleware will be caught by grammY.
You should install a custom error handler to handle errors.

Most importantly, this section will teach you [how to catch errors](#catching-errors) that can be thrown.

Afterwards, we will look at all three types of errors that your bot can encounter.

| Name                                     | Purpose                                                                                                   |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [`BotError`](#the-boterror-object)       | Error object that wraps any error thrown in your middleware (for example, the two errors below)           |
| [`GrammyError`](#the-grammyerror-object) | Thrown if the Bot API server returns `ok: false`, indicating that your API request was invalid and failed |
| [`HttpError`](#the-httperror-object)     | Thrown if the Bot API server could not be reached                                                         |

A more advanced error handling mechanism can be found [down here](#error-boundaries).

## Catching Errors

How you catch errors will depend on your setup.

### Long Polling

If you run your bot via `bot.start()`, or if you are using [grammY runner](/plugins/runner.md), then you should **install an error handler via `bot.catch`**.

grammY has a default error handler installed that stops the bot if it was started by `bot.start()`.
It then re-throws the error.
It depends on the platform what will happen next.
That is why **you should install an error handler via `bot.catch`**.

Example:

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

If you run your bot via webhooks, grammY will pass the error on to the web framework that you use, e.g. `express`.
You should handle errors according to the conventions of that framework.

## The `BotError` Object

The `BotError` object bundles up a thrown error with the corresponding [context object](/guide/context.md) that caused the error to be thrown.
This works as follows.

Whatever error occurs while processing an update, grammY will catch the thrown error for you.
It is often useful to access the context object that caused the error.

grammY does not touch the thrown error in any way, but instead wraps it into an instance of `BotError`.
Given that object is named `err`, you can then access the original error via `err.error`.
You can access the respective context object via `err.ctx`.

Check out the `BotError` class in the [grammY API Reference](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/BotError).

## The `GrammyError` Object

If an API method like `sendMessage` fails, grammY will throw a `GrammyError`.
Note that also `GrammyError` instances will be wrapped in `BotError` objects if they are thrown in middleware.

A thrown `GrammyError` indicates that the corresponding API request failed.
The error provides access to the error code returned by the Telegram backend, as well as the description.

Check out the `GrammyError` class in the [grammY API Reference](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/GrammyError).

## The `HttpError` Object

An `HttpError` is thrown if a network request fails.
This means that grammY was unable to contact the Bot API server.
The error object holds information about why the request failed, which are available under the `error` property.

You will rarely see this kind of error, unless your network infrastructure is unstable, or the Bot API server of your bot is temporarily offline.

> Note that if the Bot API server can be contacted, but it returns `ok: false` for a given method call, a [`GrammyError`](/guide/errors.md#the-grammyerror-object) is thrown instead.

Check out the `HttpError` class in the [grammY API Reference](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/HttpError).

## Error Boundaries

> This is an advanced topic that is mostly useful for larger bots.
> If you are relatively new to grammY, simply skip the remainder of this section.

If you divide your code base into different parts, _error boundaries_ allow you install different error handlers for different parts of your middleware.
They achieve this by letting you fence errors in a part of your middleware.
In other words, if an error is thrown in a specially protected part of middleware, it will not be able to escape from that part of the middleware system.
Instead, a dedicated error handler is invoked, and the surrounded part of the middleware pretends to complete successfully.
This is a feature of grammY’s middleware system, so error boundaries don’t care whether you’re running your bot with webhooks or long polling.

Optionally, you may choose to instead let the middleware execution _resume_ normally after the error was handled, continuing right outside the error boundary.
In that case, the fenced middleware does not only act as if it had completed successfully, but it also passes on the control flow to the next middleware that was installed after the error boundary.
Thus, it looks like the middleware inside the error boundary has called `next`.

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
   * You could call `next` if you want to run
   * the middleware at C in case of an error:
   */
  // await next()
}

function errorHandler(err: BotError) {
  console.error("Error in A, B, C, or D!", err);
}
```

In the above example, the `boundaryHandler` will be invoked for

1. all middlewares that are passed to `bot.errorBoundary` after `boundaryHandler` (i.e. `Q`), and
2. all middlewares that are installed on subsequently installed composer instances (i.e. `X`, `Y`, and `Z`).

> Regarding point 2, you may want to skip ahead to [the advanced explanation](/advanced/middleware.md) of middleware to learn how chaining works in grammY.

You can also apply an error boundary to a composer without calling `bot.errorBoundary`:

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

The `boundaryHandler` of the above example will be invoked for middlewares bound to `protected`.

If you actively want the error to cross a boundary (that is, pass it outside), you can re-throw the error inside your error handler.
The error will then be passed to the next surrounding boundary.

In a sense, you can regard the error handler installed via `bot.catch` as the outermost error boundary.
