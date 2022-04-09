# FAQ

Here is a collection of frequently asked questions [regarding grammY itself](#questions-about-grammy), [common errors](#why-am-i-getting-this-error), and [Deno things](#questions-about-deno).

If this FAQ does not answer your question, you should also have a look at [the Bot FAQ](https://core.telegram.org/bots/faq) written by the Telegram team.

## Questions About grammY

### What is grammY?

grammY is a piece of software that you can use when you want to program your own chat bot for [the Telegram messenger](https://telegram.org).
When you make bots, you will notice that some parts of this process are tedious and always the same.
grammY does the heavy lifting for you and makes it super simple to create a bot.

### When was grammY created?

The first publish of grammY code was in late March, 2021.
It reached the first stable version a few weeks later.

### How is grammY developed?

grammY is a completely free and open-source software, developed by a team of volunteers.
Its code is available on GitHub.

You're welcome to [join us](https://t.me/grammyjs)!
(If you speak Russian, you can also join us [here](https://t.me/grammyjs_ru)!)

### What programming language does grammY use?

grammY is written from the ground up in TypeScript—a superset of JavaScript.
Therefore, it runs on Node.js.

However, grammY can also run on Deno, which positions itself as the successor of Node.js.
(Technically, you can even run grammY on modern browsers, though this will rarely be useful.)

### How does grammY compare to its competitors?

If you're coming from a different programming language or framework, you can check out our [detailed comparison between frameworks](./comparison.md).

## Why Am I Getting This Error?

### 400 Bad Request: Cannot parse entities

You are sending a message with formatting, i.e. you're setting `parse_mode` when sending a message.
However, your formatting is broken, so Telegram does not know how to parse it.
You should re-read [the section about formatting](https://core.telegram.org/bots/api#formatting-options) in the Telegram docs.
The byte offset that is mentioned in the error message will tell you where exactly the error is in your string.

::: tip Passing entities instead of formatting
You can pre-parse the entities for Telegram if you want, and specify `entities` when sending your message.
Your message text could then be a regular string.
That way, you don't have to worry about escaping weird characters.
This may look like it needs more code, but in fact it is the far more reliable and fool-proof solution to this problem.
:::

### 401 Unauthorized

Your bot token is wrong.
Maybe you think it's right.
It is not.
Talk to [@BotFather](https://t.me/BotFather) to see what your token is.

### 403 Forbidden: bot was blocked by the user

You probably tried to send a message to a user and then you ran into this issue.

When a user blocks your bot, you are no able to send messages to them or interact with them in any other way (except if your bot was invited to a group chat where the user is a member).
Telegram does this to protect their users.
You cannot do anything about it.

You can either:

- Handle the error and for example delete the user's data from your database.
- Ignore the error.
- Listen for `my_chat_member` updates via `bot.on("my_chat_member")` in order to be notified when the user blocks your bot.
  Hint: Compare the `status` fields of the old and the new chat member.

### 404 Not found

If this happens while starting your bot, then your bot token is wrong.
Talk to [@BotFather](https://t.me/BotFather) to see what your token is.

If your bot works fine most of the time, but then suddenly you're getting a 404, then you're doing something very funky.
You can come ask us in the group chat.

### 409 Conflict: terminated by other getUpdates request

You are accidentally running your bot twice on long polling.
You can only run one instance of your bot.

If you think that you only run your bot once, you can just revoke the bot token.
That will stop all other instances.
Talk to [@BotFather](https://t.me/BotFather) to do this.

### 429: Too Many Requests: retry after X

Congratulations.
You ran into an error that is among the most difficult ones to fix.

There are two possible scenarios.

One: Your bot does not have many users.
In that case, you are just spamming the Telegram servers by sending too many requests.
Solution: don't do that.
You should seriously think about how to reduce the number of API calls substantially.

Two: Your bot is getting very popular and it has a lot of users (hundreds of thousands).
You have already made sure to use the minimum number of API calls for the most common operations of your bot, and _still_ you're running to these errors (called flood wait).

There are a few things you can do.

1. Read [this article in the docs](/advanced/flood.md) to gain a basic understanding of the situation.
2. Use [the `transformer-throttler` plugin](/plugins/transformer-throttler.md).
3. Use [the `auto-retry` plugin](/plugins/auto-retry.md).
4. Come ask us in the group chat for help. We have experienced people there.
5. It is possible to ask Telegram to increase the limits, but this is very unlikely to happen if you did not do steps 1-3 first.

### Cannot find type definition file for 'node-fetch'.

This is the result of some missing type declarations.

The recommended way to fix this is to set `skipLibCheck` to `true` in your TypeScript compile options.

If you are sure that you need this option to be kept to `false`, you can instead install the missing type definitions by running `npm i -D @types/node-fetch@2`.
## Questions About Deno

### Why do you support Deno?

Some important reasons why we like Deno more than Node.js:

- It's simpler and faster to get started.
- The tooling is substantially better.
- It natively executes TypeScript.
- No need to maintain `package.json` or `node_modules`.
- It has a reviewed standard library.

> Deno was founded by Ryan Dahl—the same person that invented Node.js.
> He summarized his 10 regrets about Node.js in [this video](https://youtu.be/M3BM9TB-8yA).

grammY itself is Deno-first, and it is backported to support Node.js equally well.

### Where can I host a Deno app?

Because Deno is new and its ecosystem is smaller, the number of places where you can host a Deno app are fewer than the ones for Node.js.

Here are some places where you can host your Deno app:

1. [Cloudflare Workers](https://workers.dev)
2. [Deno Deploy](https://deno.com/deploy)
3. [Heroku](https://dev.to/ms314006/deploy-your-deno-apps-to-heroku-375h)
4. [Vercel](https://github.com/vercel-community/deno)
