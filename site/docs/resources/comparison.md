---
next: false
---

# How grammY Compares to Other Bot Frameworks

While grammY uses some concepts known from other bot frameworks (and web frameworks), it was written from scratch for optimal readability and performance.

> Please assume that this comparison is biased, even though we're trying to provide you with an objective description of the advantages and disadvantages of using grammY over using other libraries.
> We are trying to keep things in this article up-to-date.
> If you notice that anything is outdated, please edit this page using the link at the bottom.

## Comparison With Other JavaScript Frameworks

::: tip Choose Your Programming Language First
Given that you're reading the docs of a framework within the JavaScript ecosystem, you are likely looking for something to run on Node.js or Deno.
However, if that's not you, [scroll down](#comparison-with-frameworks-in-other-programming-languages) for a comparison of what programming languages are suited for bot development.
Naturally, you will also find a brief comparison against frameworks of other languages (mainly Python).
:::

There are two main projects that grammY takes inspiration from, namely [Telegraf](https://github.com/telegraf/telegraf) and [NTBA](https://github.com/yagop/node-telegram-bot-api).
We will focus on them for now, but we (or you?) may add other comparisons in the future.

### Telegraf

grammY has its roots in Telegraf, so here is a brief summary of how these frameworks relate historically.

When grammY was created, Telegraf was an amazing library, and grammY would not be where it is without it.
However, Telegraf used to be written in JavaScript (in v3).
The rare type annotations were manually added and poorly maintained, so they were incomplete, incorrect, and outdated.
Strong type annotations are a crucial aspect of any serious library for the tooling support they enable, and because it allows you to iterate significantly faster on your code base.
Many people prefer to have type safety when developing a complex bot, and for some it's a deal-breaker not to offer it.

Telegraf v4 attempted to fix this by migrating the entire code base to TypeScript.
Unfortunately, many of the resulting types were so complex that they were too hard to understand (but correct).
Moreover, the migration revealed countless oddities ([example](https://github.com/telegraf/telegraf/issues/1076)) in the code base that made it painful to even find correct typings for the existing code at all.

As a result, even though version 4.0 tried to _improve_ correctness and tooling support, it ended up making Telegraf substantially _harder to use_ than its untyped predecessor.
Understandably, many existing users of Telegraf 3 were unwilling to upgrade.
It also got harder for new users to get started.

**grammY takes a step back and rethinks a type-safe bot framework with approachability first.**
This allowed to skip a lot of the frustrating discussions around how to cope with strange internal typings.
It enabled the project to have clean, consistent, compiling code that provides users with excellent types (=editor support).
Type safety in turn permits more advanced features that fundamentally change how we think about bot development, such as [API transformers](../advanced/transformers).

Even though Telegraf 3 is still used by many active bots, the library is widely outdated.
Furthermore, the plugin ecosystem of Telegraf has moved on to Telegraf 4 (at least those that were not migrated to grammY).

This comparison only compares grammY to Telegraf 4.

Here is a list of reasons why you should use grammY instead of Telegraf.

- grammY always supports the latest version of the Bot API.
  Telegraf often lags behind by a few versions.
- grammY has a [documentation](../).
  Telegraf does not---it was replaced by a generated API reference that lacks explanations, and the few guides that exist are incomplete and hard to find.
- grammY embraces TypeScript, the types _just work_ and they will follow your code.
  In Telegraf, you will often need to write your code a certain way, otherwise it does not compile (even though it would actually run fine).
- grammY integrates hints from the [official Bot API reference](https://core.telegram.org/bots/api) inline that help you while you're coding.
  Telegraf does not give you any explanations on your code.
- Many more things like better performance, a large plugin ecosystem, documentation that is translated for billions of people, better integration with databases and web frameworks, better runtime compatibility, a [VS Code extension](https://marketplace.visualstudio.com/items?itemName=grammyjs.grammyjs), and a number of other things that you will discover as you go.

Here is a list of reasons why you should use Telegraf instead of grammY.

- You already have a large bot written in Telegraf and you no longer really work on it.
  In that case, migrating to grammY may take more time than you will save in the long run, no matter how smooth the migration is.
- You know Telegraf like the back of your hand and you do not care about changing your skill set.
  grammY introduces a number of novel concepts that can be unfamiliar if you have used Telegraf only, and using grammY means that you will be exposed to new things.
- There are a few details where Telegraf and grammY use different syntax to achieve the same thing, and you just happen to prefer one style over the other.
  For instance, Telegraf uses `bot.on(message("text"))` and grammY uses `bot.on("message:text")` to listen for text messages.

### NTBA

The `node-telegram-bot-api` package is the second big project that impacted the development of grammY.
Its main advantage over other frameworks is that it just is dead simple.
Its architecture can be described in a single sentence, while grammY needs a [guide](../guide/) on its documentation website to do the same.
We believe that all these explanations on the grammY website help people to get started easily, but it is tempting to have a library which does not need any explanations in the first place.

On the downside, this is only good in the short-term perspective.
The idea of putting everything in a gigantic file, and using a primitive `EventEmitter` to process streams of complex objects (aka. web requests) has brought a lot of pain to the world of Telegram bots, and it certainly prevented a number of good ideas from being implemented.

Bots always start small, but a responsible framework must provide them a clear path to grow, and to scale up.
Unfortunately, NTBA fails horribly at doing that.
Any code base with more than 50 lines that uses NTBA ends up being a terrible mess of spaghetti-like cross-references.
You don't want that.

### Other Frameworks

There currently are no other TypeScript libraries that are worth using for building bots.
Everything except grammY, Telegraf, and NTBA is largely unmaintained and thus horribly out of date.

Did you just create a new awesome library and we are not aware of it yet?
Feel free to edit this page and add a comparison---or tell us what you think in the [group chat](https://t.me/grammyjs)!

## Comparison With Frameworks in Other Programming Languages

There are reasons to favor a different programming language over TypeScript.
The most important thing is that you like working with your tools and languages.
If you are determined to stick with a different language, then you can stop reading here.

Given that you're still reading, you may want to know why grammY is written in TypeScript, and why you should maybe consider picking this language for your bot, too.

This section will outline how TypeScript has a few advantages over other languages when it comes to developing Telegram bots.
This comparison will be limited to Python, Go, and Rust.
Feel free to add more sections if you want to contrast TypeScript with another language.

Some of the following points are partially based on personal opinions.
People have different taste, so take this section with a grain of salt.

### Frameworks Written in Python

A clear case can be made when comparing TypeScript to Python.
Pick TypeScript and you will enjoy:

1. **Better editor tooling.**
   The type annotations of grammY are outstanding.
   While Python did introduce types in its 3.5 release, they are not used as commonly in the ecosystem as it is the case with JavaScript/TypeScript.
   Hence, they cannot compare to what you get out of the box with grammY and its accompanying libraries.
   With the types come auto-completion at every step of development, as well as helpful tooltips with explanations and links.

2. **Easier to scale up code base.**
   The type system has a second advantage---it lets you scale the code base of your bot.
   This is much harder to do for projects written in a language with worse type safety.

3. **Easier to scale up load.**
   If your bot actually starts to get popular, it is significantly easier to scale bots written in JS rather than in Python.

4. **Higher responsiveness of your bot.**
   Right now, V8 and its competitors make JavaScript the world's fastest scripting language.
   If you like your bot to be as fast as possible while still enjoying a dynamic language, then grammY is your best bet.

As always, programming languages excel at certain tasks and should be avoided for others.
This is no exception.

For example, with the current state of the ecosystems, anything related to machine learning should not be done in JavaScript.
However, when it comes to web servers, TypeScript tends to be a much better choice.

### Frameworks Written in Go

If you are proficient in both TypeScript and Go, then a reasonable metric for deciding on a language for your bot is the balance between development speed and execution speed.

Pick grammY if you are not completely sure what you are building.
TypeScript lets you iterate on your code base at incredible speeds.
It is great for rapid prototyping, trying out new things, getting to know bots, and getting things done quickly.
As a rule of thumb, processing ~100,000,000 updates per day can be done easily with TypeScript, but going beyond that will require extra work, such as using one more grammY plugin.

Pick a library written in Go if you already know fairly well what you will be building (you don't expect to need much assistance), and you already know that your bot will process a very large number of updates.
As a natively compiled language, Go outperforms TypeScript at raw CPU speed by several orders of magnitude.
This is much less relevant when you write a bot because most of the time is spent waiting for the network, but eventually, it will start to matter how fast your bot can parse JSON.
Go can be a better choice in these cases.

### Frameworks Written in Rust

A similar point can be made [as with Go](#frameworks-written-in-go), but it is even stronger with Rust.
In a way, it will take you even more time to write Rust, but your bot will be even faster, too.

Also, please note that using Rust is fun but rarely necessary for bots.
If you want to use Rust, then do it, but consider saying that you love Rust and not that it is the right tool for the job.

## How to Disagree With This Comparison

If you think that something is wrong on this page, don't despair!
Please let us know in the [group chat](https://t.me/grammyjs)!
We'd love for you to educate us about your perspective.
Naturally, you can also just edit this page on GitHub, or file an issue there to point out mistakes or suggest other things.
This page will always have room to be more objective, and more fair.
