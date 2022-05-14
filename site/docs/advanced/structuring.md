---
prev: ./middleware.html
next: ./scaling.html
---

# Scaling Up I: Large Codebase

As soon as your bot grows in complexity, you are going to face the challenge of how to structure your application code base.
Naturally, you can split it across files.

## Possible Solution

> grammY is still pretty young and does not provide any official integrations with DI containers yet.
> Subscribe to [@grammyjs_news](https://t.me/grammyjs_news) to be notified as soon as we support this.

You are free to structure your code however you like, and there is no one-size-fits-all solution.
That being said, a straightforward and proven strategy to structure your code is the following.

1. Group things that semantically belong together in the same file (or, depending on the code size, directory).
   Every single one of these parts exposes middleware that will handle the designated messages.
2. Create a bot instance centrally that merges all middleware by installing it onto the bot.
3. (Optional.) Pre-filter the updates centrally, and send down updates the right way only.
   You may also want to check out `bot.route` ([API Reference](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/Composer#route)) or alternatively the [router plugin](../plugins/router.md) for that.

A runnable example that implements the above strategy can be found in the [Example Bot repository](https://github.com/grammyjs/examples/tree/main/scaling).

## Example Structure

For a very simple bot that manages a TODO list, you could imagine this structure.

```asciiart:no-line-numbers
src/
├── bot.ts
└── todo/
    ├── item.ts
    └── list.ts
```

`item.ts` just defines some stuff about TODO items, and these code parts are used in `list.ts`.

In `list.ts`, you would then do something like this:

```ts
export const lists = new Composer();

// Register some handlers here that handle your middleware the usual way.
lists.on('message', ctx => { ... });
```

Optionally, you can use an [error boundary](../guide/errors.md#error-boundaries) to handle all errors that happen inside your module.

Now, in `bot.ts`, you can install this module like so:

```ts
import { lists } from "./todo/list";

const bot = new Bot("<token>");

bot.use(lists);
// ... maybe more modules like `todo` here

bot.start();
```

Optionally, you can use the [router plugin](../plugins/router.md) or to bundle up the different modules, if you're able to determine which middleware is responsible upfront.

However, remember that the exact way of how to structure your bot is very hard to say generically.
As always in software, do it in a way that makes the most sense :wink:
