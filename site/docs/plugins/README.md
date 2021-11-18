# Plugins in grammY

grammY supports installing plugins, most of them via adding new [middleware](/guide/middleware.md) or [transformer functions](/advanced/transformers.md).

## Categories of Plugins

Some plugins are right **built-in** into the grammY core library because we assume that many bots need them.
This makes it easier for new users to use them, without having to install a new package first.

Most plugins are published alongside the core package of grammY, we call them **official** plugins.
They are installed from `@grammyjs/*` on npm, and they are published under the [@grammyjs](https://github.com/grammyjs) organization on GitHub.
We coordinate their releases with the releases of grammY, and we make sure that everything works well together.
Every section of the plugin docs for an official plugin has the package name in its title.
As an example, the [grammY runner](./runner.md) plugin (`runner`) needs to be installed via `npm install @grammyjs/runner`.
(If you are using Deno and not Node.js, you should import the plugin from <https://deno.land/x/> instead, so from the `grammy_runner` module's `mod.ts` file.)

> If you want to publish your own package as an officially supported plugin, just ping us in the [community chat](https://t.me/grammyjs) and let us know what you're planning, then we can grant you publish access to GitHub and npm.
> You will be responsible for maintaining your code (but maybe others want to join in).

You may decide to publish your package independently as a **third party**.
In that case, we can still offer you a prominent place on this website:

## Submitting Your Own Plugin to the Docs

If you are the author of a library that can help other users of grammY, you can submit a PR on GitHub that adds a page for it to the official website of grammY (this one).
This will enable other users to find it, and it gives you a simple way to have a good documentation.

Here are a few things that we expect from your plugin if you want it to be displayed here.

1. It has a README file on GitHub (and npm) with instructions how to use it.
2. Your PR adds a page that includes meaningful content about

   - what problem your plugin solves, and
   - how to use it.

   In the simplest case, you can copy the text from your README file.

3. It is open-source software that is published under a permissive license, preferably MIT (like grammY), or ISC.

It would be cool if your plugin also runs on Deno, and we will move those plugins to the top of the list.
However, Deno support is not a strict requirement.
