---
next: ./guide.md
---

# What Is a Plugin?

We want grammY to be concise and minimal, but extensible.
Why?
Because not everyone uses everything!
Plugins are designed as extra functionalities added to said pieces of software.

## Plugins in grammY

Some plugins are right **built-in** into the grammY core library because we assume that many bots need them.
This makes it easier for new users to use them, without having to install a new package first.

Most plugins are published alongside the core package of grammY, we call them **official** plugins.
They are installed from `@grammyjs/*` on npm, and they are published under the [@grammyjs](https://github.com/grammyjs) organization on GitHub.
We coordinate their releases with the releases of grammY, and we make sure that everything works well together.
Every section of the plugin docs for an official plugin has the package name in its title.
As an example, the [grammY runner](./runner.md) plugin (`runner`) needs to be installed via `npm install @grammyjs/runner`.
(If you are using Deno and not Node.js, you should import the plugin from <https://deno.land/x/> instead, so from the `grammy_runner` module's `mod.ts` file.)

## Types of Plugins in grammY

All that glitters is gold, right?
Well, a different kind of gold!
grammY can take advantage of two types of plugins: _middleware plugins_ and _transformer plugins_.
In simple terms, plugins in grammY return either a middleware function or a transformer one.
Let's talk about the differences.

### Type I: Middleware Plugins

[Middleware](../guide/middleware.md) is a function that handles incoming data in various forms.
Middleware plugins are plugins that are fed to a bot as—well, you guessed it—middleware.
This means that you install them via `bot.use`.

### Type II: Transformer Plugins

A [transformer function](../advanced/transformers.md) is the opposite of middleware!
It is a function that handles outgoing data.
Transformer plugins are plugins that are fed to a bot as a—crazy! guessed it again—transformer function.
This means that you install them via `bot.api.config.use`.

## Create Your Own Plugins

If you want to develop a plugin and share it with other users (even published on the official website of grammY), there is a [useful guide](./guide.md) that you can check out.

## Ideas for More Plugins

We are collecting ideas for new plugins [on GitHub in this issue](https://github.com/grammyjs/grammY/issues/110).
