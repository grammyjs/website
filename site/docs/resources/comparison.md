# How grammY Compares to Other Bot Frameworks

While grammY uses some concepts known from other bot frameworks (and web frameworks), it was written from scratch for optimal readability and performance.
In other words, it does not use any code of competing projects, but it will still feel familiar to users of some frameworks.

> Please assume that this comparison is biased, even though we're trying to provide you with an objective description of the advantages and disadvantages of using grammY over using other libraries.
> We are trying to keep things in this article up-to-date.
> If you notice that anything is outdated, please edit this page using the link at the bottom.

## Comparison With Other JavaScript Frameworks

::: tip Choose your programming language first
Given that you're reading the docs of a framework within the JavaScript ecosystem, you are likely looking for something to run on Node.js (or Deno).
However, if that's not you, scroll down for a comparison of what programming languages are suited for bot development.
Naturally, you will also find a brief comparison against frameworks of other languages (mainly Python).
:::

There are two main projects that grammY takes inspiration from, namely [Telegraf](https://github.com/telegraf/telegraf) and [NTBA](https://github.com/yagop/node-telegram-bot-api).
We will focus on them for now, but we (or you?) may add other comparisons in the future.

### Telegraf

grammY has its roots in Telegraf, so here is a brief summary of how these frameworks relate historically.

#### Some History

Telegraf is an amazing library, and grammY would not be where it is without it.
However, Telegraf used to be written in JavaScript (in v3).
The rare type annotations were manually added and poorly maintained, so they were incomplete, incorrect, and outdated.
Strong type annotations are a crucial aspect of any serious library for the tooling support they enable, and because it allows you to iterate significantly faster on your code base.
Many people prefer to have type safety when developing a complex bot, and for some it's a deal-breaker not to offer it.

Telegraf v4 attempted to fix this by migrating the entire code base to TypeScript.
Unfortunately, many of the resulting types were so complex that they were too hard to understand (but correct).
Moreover, the migration revealed countless oddities ([example](https://github.com/telegraf/telegraf/issues/1076)) in the code base that made it painful to even find correct typings for the existing code at all.

As a result, even though version 4.0 tried to _improve_ correctness and tooling support, it ended up making Telegraf substatially _harder to use_ than its untyped predecessor.
Understandably, many existing users of Telegraf 3 were unwilling to upgrade.
It also got harder for new users to get started.

**grammY takes a step back and rethinks a type-safe bot framework with approachability first.**
This allowed to skip a lot of the frustrating discussions around how to cope with strange internal typings.
It enabled the project to have clean, consistent, compiling code that provides users with excellent types (=editor support).
Type safety in turn permits more advanced features that fundamentally change how we think about bot development, such as [API transformers](/advanced/transformers.md).

Today, Telegraf 3 is outdated.
There are some unofficial forks out there that try to keep the legacy code base up to date with the evolvement of the Bot API, but their compatibility is unknown.
Furthermore, the plugin ecosystem of Telegraf has moved on to Telegraf 4.
Most plugins developers do not maintain versions for third-party forks of old Telegraf versions.
Based on the fact that Telegraf hangs somewhere between version 3 and 4, it makes sense to compare grammY to both versions individually.

#### Comparison to v3

Given their shared history, grammY and Telegraf have a lot in common.
They both have a [middleware system](/guide/middleware.md) in their core.
They also share a lot of their basic syntax:

```ts
// works with both grammY and Telegraf
bot.on("message", (ctx) => ctx.reply("Hi!"));
```

Any code written in Telegraf will work in grammY with minimal changes.
(Note that the oppsite is not true as many grammY features are not available to Telegraf users.)

The main advantage of grammY over Telegraf 3.x is **substatially better tooling support**.
Telegraf 3 is written in JavaScript.
The shipped types are incorrect and incomplete, and the consumed Bot API types are outdated by several years.
As a result, there is no reliable support for auto-complete or spell-checking bot code.
Experience shows that you often have to run your bot to find out whether your code works.

In contrast, grammY is written in pure TypeScript.
This allows your code editor (e.g. VSCode) to analyze your code while you are typing, and assist you.
In addition, it can show the complete Telegram Bot API inline—the website's documentation will be available right at your fingertips when hovering your mouse over any name or element of your code.

Another remarkable advantage is that you are finally able to **write your own bots in TypeScript**.
This was hard to do because the wrong type annotations of Telegraf were preventing perfectly correct code from compiling, thus effectively encouraging users not to check their code in the first place.
However, type-safe code is a major advantage for any non-trivial code base.

grammY and Telegraf have distinct code bases.
Beeing freed from the legacy, grammY could also make substantial contributions to the underlying middleware system, enabling exciting use cases such as [filter queries](/guide/filter-queries.md), [error boundaries](/guide/errors.md#error-boundaries), [API transformers](/advanced/transformers.md), and many more.
This also enables the development of valuable plugins that are impossible to work under Telegraf.

The main advantage of Telegraf over grammY is that it is still **known by a lot more people**.
The Telegraf community may be divided between the versions, but at this early point most of these groups are still larger than the united group of grammY users.
This also means that you can find more stories on the internet about Telegraf users, and you will find more unofficial tutorials by other coders, which can help you if the official documentation of a library has shortcomings.

#### Comparison to v4

The main advantage of grammY over Telegraf 4.x is that **it is simply a lot easier**.
For example:

- grammY has [a documentation](/).
  Telegraf does not (it was replaced by a generated API reference that lacks explanations).
- Types in grammY _just work_ and they will follow your code.
  In Telegraf, you will often need to write your code a certain way, otherwise it does not compile (even though it would actually work fine).
- grammY integrates hints from [the official Bot API reference](core.telegram.org/bots/api) inline that help you while you're coding.
  Telegraf does not give you any explanations on your code.

#### Summary

##### Advantages of grammY

- Easier to use than Telegraf 3 and 4
- Proper TypeScript support
- Has both a documentation and a generated API reference
- Significantly faster on long polling (with grammY runner)
- United community and ecosystem
- More actively developed
- Helpful error messages
- Much harder to run into dangerous race conditions
- Designed to protect you from making programming mistakes
- Runs on Node.js, but also on Deno and in the browser

##### Advantages of Telegraf

- Older, thus more mature
- More plugins (but this is changing currently)
- Many more example bots, both in the repository and in the wild
- Telegraf 3 has significantly more users

### NTBA

The `node-telegram-bot-api` package is the second big project that impacted the development of grammY.
Its main advantage over other frameworks is that it just is dead simple.
Its architecture can be described in a single sentence, while grammY needs a [guide](/guide/) on its documentation website to do the same.
We believe that all these explanations on the grammY website help people to get started easily, but it is tempting to have a library which does not need any explanations in the first place.

On the downside, this is only good in the short-term perspective.
The idea of putting everything in a gigantic file, and using a primitive `EventEmitter` to process streams of complex objects (aka. web requests) has brought a lot of pain to the world of Telegram bots, and it certainly prevented a number of good ideas from being implemented.
Bots always start small, but a responsible framework must provide them a clear path to grow, and to scale up.
Unfortunately, NTBA fails horribly at doing that.
Any code base with more than 50 lines that uses NTBA ends up being a terrible mess of spaghetti-like cross-references.
You don't want that.

### Other Frameworks

Do you think that your favorite framework is better than grammY in some respect?
Feel free to edit this page and add a comparison—or tell us what you think in the [group chat](https://t.me/grammyjs)!

## Comparison With Frameworks in Other Programming Languages

There are reasons to favor a different programming language over TypeScript.
The most important thing is that you like working with your tools and languages.
If you are determined to stick with something else, then you can stop reading here.

Given that you're still reading, you may want to know why grammY is written in TypeScript, and why you should maybe consider picking this language for your bot, too.

This section will outline how TypeScript has a few advantages over other languages when it comes to developing Telegram bots.
The main other language that is used to develop chat bots for Telegram is Python, so we will limit ourselves to this for now.
Some of the following points are rather personal opinions than objective facts.
People have different taste, so take this section with a grain of salt.

1. **Better editor tooling.**
   The type annotations of grammY are outstanding.
   While Python did introduce types in its 3.5 release, they are not used as commonly in the ecosystem as it is the case with JavaScript/TypeScript.
   Hence, they cannot compare to what you get out of the box with grammY and its accompanying libraries.
   With the types come auto-completion at every step of development, as well as helpful tooltips with explanations and links.
2. **Easier to scale up code base.**
   The type system has a second advantage—it lets you scale the code base of your bot.
   This is much harder to do for projects written in a language with worse type safety.
3. **Easier to scale up load.**
   If your bot actually starts to get popular, it is significantly easier to scale bots written in JS rather than in Python.
4. **Higher responsiveness of your bot.**
   The V8 engine makes JavaScript the fastest scripting language in the observable universe.
   If you like your bot to be as fast as possible while still enjoying a dynamic language, then grammY is your best bet.
5. **`async`/`await` support.**
   This is a very popular programming pattern to tame concurrency.
   The recent years show a strong trend towards asynchronous programming.
   The largest bot framework for Python, PTB, [announced its migration](https://t.me/pythontelegrambotchannel/94) to asynchronous programming in January 2021, which is expected to maybe take “2 years”.
   grammY is already there.
   (Other, less known Python frameworks may be faster at transitioning.
   Disregard this point if you are using a Python framework that has support for `async`/`await`.)

## How to Disagree With This Comparison

If you think that something is wrong on this page, don't despair!
Please let us know in the [group chat](https://t.me/grammyjs)!
We'd love for you to educate us about your perspective.
Naturally, you can also just edit this page on GitHub, or file an issue there to point out mistakes or suggest other things.
This page will always have room to be more objective, and more fair.
