# FAQ

## What is grammY?

grammY is a piece of software that you can use when you want to program your own chat bot for [the Telegram messenger](https://telegram.org).
When you make bots, you will notice that some parts of this process are tedious and always the same.
grammY does the heavy lifting for you and makes it super simple to create a bot.

## When was grammY created?

The first publish of grammY code was in late March, 2021.
It reached the first stable version a few weeks later.

## How is grammY developed?

grammY is a completely free and open-source software, developed by a team of volunteers.
Its code is available on GitHub.

You're welcome to [join us](https://t.me/grammyjs)!

## What programming language does grammY use?

grammY is written from the ground up in TypeScrip — a superset of JavaScript.
Therefore, it runs on Node.js.

However, grammY can also run on Deno, which positions itself as the successor of Node.js.
(Technically, you can even run grammY on modern browsers, though this will rarely be useful.)

## How does grammY compare to its competitors?

If you're coming from a different programming language or framework, you can check out our [detailed comparison between frameworks](./comparison.md).

## Why do you support Deno?

Some important reasons why we like Deno more than Node.js:

- It's simpler and faster to get started.
- The tooling is substantially better.
- It natively executes TypeScript.
- No need to maintain `package.json` or `node_modules`.
- It has a reviewed standard library.

> Deno was founded by Ryan Dahl—the same person that invented Node.js.
> He summarized his 10 regrets about Node.js in [this video](https://youtu.be/M3BM9TB-8yA).

grammY itself is Deno-first, and it is backported to support Node.js.

## Where can I host a Deno app?

Because Deno is new and its ecosystem is small, the number of places where you can host a Deno app are fewer than the ones for Node.js.

Here are some places where you can host your Deno app:

1. [Deno Deploy](https://deno.com/deploy)
2. [Cloudflare Workers](https://workers.dev)
3. [Vercel](https://github.com/vercel-community/deno)
4. [Heroku](https://dev.to/ms314006/deploy-your-deno-apps-to-heroku-375h)
