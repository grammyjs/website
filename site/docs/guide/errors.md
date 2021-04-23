---
prev: ./middleware.md
next: ./inline-queries.md
---

# Error handling

Every single error caused by your middleware will be caught by grammY.
You should install a custom error handler to handle errors.

## Catching errors

It depends on your setup how to catch errors.

### Long polling

If you run your bot via `bot.start()`, or if you are using [grammY runner](/plugins/runner.md), then you should **install an error handler via `bot.catch`**.

grammY has a default error handler installed that stops the bot if it was started by `bot.start()`.
It then rethrows the error.
It depends on the platform what will happen next.
That is why **you should install an error handler via `bot.catch`**.

Example:

```ts
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error(`Request failed: ${e.description}`);
  } else {
    console.error(`Unknown error: `, e);
  }
});
```

### Webhooks

If you run your bot via webhooks, grammY will pass the error on to the web framework that you use, e.g. `express`.
You should handle errors according to the conventions of that framework.

## The `BotError` object

Whatever error occurs while processing an update, grammY will catch the thrown error for you.
It is often useful to access the context object that caused the error.

grammY does not touch the thrown error in any way, but instead wraps it into an instance of `BotError`.
Given that object is named `err`, you can then access the original error via `err.error`.
You can access the respective context object via `err.ctx`.

Check out the [BotError](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#BotError) class in the grammY API Reference.

## The `GrammyError` object

If an API method like `sendMessage` fails, grammY will throw a `GrammyError`.
Note that also `GrammyError` instances will be wrapped in `BotError` objects if they are thrown in middleware.

A thrown `GrammyError` indicates that the corresponding API request failed.
The error provides access to the error code returned by the Telegram backend, as well as the description.

Check out the [GrammyError](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#GrammyError) class in the grammY API Reference.
