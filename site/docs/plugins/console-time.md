# Console Logging While Debugging

If you are familiar with JavaScript/TypeScript you probably used [`console.log`](https://developer.mozilla.org/en-US/docs/Web/API/Console/log) or [`console.time`](https://developer.mozilla.org/en-US/docs/Web/API/Console/time) to check what is happening while debugging something.
While working on your bot or middleware you might want to check something similar: What happened, and how long took it?

This plugin is interested in individual requests to debug individual problems.
While being in a production environment, you probably want something opposite in order to get a rough overview.
For example: while debugging why `/start` fails you will check the individual Telegram update.
In a production context you are more interested in all `/start` messages that are happening.
This library is intended to help with individual updates.

## Debug Your Implementation

```ts
import { generateUpdateMiddleware } from "telegraf-middleware-console-time";

if (process.env.NODE_ENV !== "production") {
  bot.use(generateUpdateMiddleware());
}

// Your implementation
bot.command("start" /* , ... */);
```

which will output stuff like this:

```plaintext
2020-03-31T14:32:36.974Z 490af message text Edgar 6 /start: 926.247ms
2020-03-31T14:32:57.750Z 490ag message text Edgar 6 /start: 914.764ms
2020-03-31T14:33:01.188Z 490ah message text Edgar 5 /stop: 302.666ms
2020-03-31T14:46:11.385Z 490ai message text Edgar 6 /start: 892.452ms
```

The `490af` is the `update_id`.

The number before the commands is the total length of the content.
This is helpful when considering max length for stuff like callback data.

The content itself is shortened in order to prevent log spamming.

## Debug Your Middleware

When you create your own middleware or assume slow timings of another middleware you can use these middlewares to create a timing profile.

```ts
import {
  generateAfterMiddleware,
  generateBeforeMiddleware,
} from "telegraf-middleware-console-time";

const bot = new Bot(/* ... */);

// Use BeforeMiddleware before loading the tested middleware.
bot.use(generateBeforeMiddleware("foo"));

// Middleware to be tested
bot.use(); /* ... */

// Use AfterMiddleware after loading the middleware you are testing (with the same label).
bot.use(generateAfterMiddleware("foo"));

// Other middleware/implementations (they will take the "inner" amount of time when used).
bot.use(); /* ... */
bot.on("message" /* ... */);
```

This will output something like this:

```plaintext
490ai foo before: 304.185ms
490ai foo inner: 83.122ms
490ai foo after: 501.028ms
490ai foo total: 891.849ms
```

This indicates the checked middleware alone took 800ms and isn't as performant as maybe needed.

## Plugin Summary

- Source: <https://github.com/EdJoPaTo/telegraf-middleware-console-time>
