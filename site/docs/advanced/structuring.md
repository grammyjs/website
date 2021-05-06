---
prev: ./middleware.md
next: ./scaling.md
---

# Scaling Up I: Large codebase

As soon as your bot grows in complexity, you are going to face the challenge of how to structure your application code base.
Naturally, you can split it across files.

## Possible solution

> grammY is still pretty young and does not provide any official integrations with DI containers yet.
> Subscribe to [@grammyjs_news](https://telegram.me/grammyjs_news) to be notified as soon as we support this.

You are free to structure your code however you like, and there is no one-size-fits-all solution.
That being said, a straightforward and proven strategy to structure your code is the following.

1. Group things that semantically belong together in the same file (or, depending on the code size, directory).
   Every single one of these parts exposes middleware that will handle the designated messages.
2. Create a bot instance centrally that merges all middleware by installing it onto the bot.
3. (Optional.) Pre-filter the updates centrally, and sends down updates the right way only.
   You may also want to check out the [router plugin](/plugins/router.md) for that.

## Example structure

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

// Register some handlers here that handle your middleware the usual way
composer.on('message', ctx => { ... });
```

Now, in `bot.ts`, you can install this module like so:

```ts
import { lists } from './todo/list'

const bot = new Bot("<token>");

bot.use(lists)
// ... maybe more modules like `todo` here

bot.start()
```

Optionally, you can use the [router plugin](/plugins/router.md) or to bundle up the different modules, if you're able to determine which middleware is responsible upfront.

However, remember that the exact way of how to structure your bot is very hard to say generically.
As always in software, do it in a way that makes the most sense :wink:
