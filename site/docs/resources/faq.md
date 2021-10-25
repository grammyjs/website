# FAQ

## What is grammY?

grammY is a piece of software that you can use when you want to program your own chat bot for [the Telegram messenger](https://telegram.org).
When you make bots, you will notice that some parts of this process are tedious and always the same.
grammY does the heavy lifting for you and makes it super simple to create a bot.

## When was grammY created?

The first publish of grammY code was in late March, 2021.
It reached the first stable version a few weeks later.

## How is grammY developed?

grammY is completely free and open source software, developed by a team of volunteers.
Its code is available on GitHub.

You're welcome to [join us](https://t.me/grammyjs)!

## What programming language does grammY use?

grammY is written from the ground up in TypeScript, a superset of JavaScript.
It can therefore run on Node.js.
However, grammY can also run on Deno, which positions itself as the successor of Node.js.
(Technically, you can actually run grammY in modern browsers, even though this will rarely be useful.)

## How does grammY compare to its competitors?

If you're coming from a different programming language or a different JavaScript framework, you can check out our [detailed comparison](./comparison.md) between frameworks.

## Why do you support Deno?

Some important reasons for why we like Deno better than Node are:

- It's simpler and faster to get started.
- The tooling is substantially better.
- It natively executes TypeScript.
- No need to maintain `package.json` or `node_modules`.
- It has a reviewed standard library.

> Deno was founded by Ry the same person that invented Node.
> He summarized his 10 regrets about Node in [this video](https://youtu.be/M3BM9TB-8yA).

grammY is actually written Deno-first, and backported to support Node.

You may also want to watch [10 Things I Regret About Node.js - Ryan Dahl - JSConf EU](https://youtu.be/M3BM9TB-8yA).

## Where can I host a Deno app?

Because deno is new and its ecosystem is small, the number of places where you can host a Deno app are fewer than the ones for Node.js.
Here's are some options to where you can host your Deno app:

1. [Cloudflare Workers](https://workers.dev)
2. [Deno Deploy](https://deno.com/deploy)
3. Heroku, [read here](https://dev.to/ms314006/deploy-your-deno-apps-to-heroku-375h)
