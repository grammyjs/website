---
prev: ./
next: ./structuring.md
---

# Middleware redux

In the Guide, [we introduced middleware](/guide/middleware.md) as a stack of functions.
While it is not wrong that you can use middleware in this linear fashion (also in grammY), calling it just a stack is a simplification.

## Middleware in grammY

Commonly, you see the following pattern.

```ts
const bot = new Bot("<token>");

bot.use(/* ... */);
bot.use(/* ... */);

bot.on(/* ... */);
bot.on(/* ... */);
bot.on(/* ... */);

bot.start();
```

Looks pretty much like a stack, except, behind the scenes, it really is a tree.
The heart of this functionality is the `Composer` class ([reference](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#Composer)) that builds up this tree.

First of all, every instance of `Bot` is an instance of `Composer`.
It's just a subclass, so `class Bot extends Composer`.

Also, you should know that every single method of `Composer` internally calls `use`.
For example, `filter` just calls `use` with some branching middleware, while `on` just calls `filter` again with some predicate function that matches updates against the given [filter query](/guide/filter-queries.md).
We can therefore limit ourselves to looking at `use` for now, and the rest follows.

We now have to dive a bit into the details of what `Composer` does with your `use` calls, and how it differs from other middleware systems out there.
The difference may seem subtle, but wait until the next subsection to find out why it has remarkable consequences.

## Augmenting `Composer`

You can install more middleware on an instance of `Composer` even after installing the `Composer` itself somewhere.

```ts
const bot = new Bot("<token>"); // subclass of `Composer`!

const composer = new Composer();
bot.use(composer);

// These will be run:
composer.use(/* A */);
composer.use(/* B */);
composer.use(/* C */);
```

`A`, `B`, and `C` will be run.
All this says is that once you have installed an instance of `Composer`, you can still call `use` on it and this middleware will still be run.
(This is nothing spectacular, but already a main difference to popular competing frameworks that simply ignore subsequent operations.)

You may be wondering where the tree structure is in there.
Let's have a look at this snippet:

```ts
const composer = new Composer();

composer.use(/* A */);
composer.use(/* B */).use(/* C */);
composer.use(/* D */).use(/* E */).use(/* F */).use(/* G */);
composer.use(/* H */).use(/* I */);
composer.use(/* J */).use(/* K */).use(/* L */);
```

Can you see it?

As you can guess, all middleware will be run in order from `A` to `L`.

Other libraries would internally flatten this code to be equivalent to `composer.use(/* A */).use(/* B */).use(/* C */).use(/* D */)...` and so on.
On the contrary, grammY preserves the tree you specified: one root node (`composer`) has five children (`A`, `B`, `D`, `H`, `J`), while the child `B` has one other child, `C`, etc.
This tree will then be traversed by every update in depth-first order, hence effectively passing through `A` to `L` in linear order, much like what you know from other systems.

This is made possible by creating a new instance of `Composer` every time you call `use` that will in turn be extended (as explained above).

## Concatenating `use` calls

If we only used `use`, this would not be too useful (pun intended).
It gets more interesting as soon as e.g. `filter` comes into play.

Check this out:

```ts
const composer = new Composer();

composer.filter(/* 1 */, /* A */).use(/* B */)

composer.filter(/* 2 */).use(/* C */, /* D */)
```

In line 3, we register `A` behind a predicate function `1`.
`A` will only be evaluated for updates which pass the condition `1`.
However, `filter` returns a `Composer` instance that we augment with the `use` call in line 3, so `B` is still guarded by `1`, even though it is installed in a completely different `use` call.

Line 5 is equivalent to line 3 in the respect that both `C` and `D` will only be run if `2` holds.

Remember how `bot.on()` calls could be chained in order to concatenate filter queries with AND?
Imagine this:

```ts
const composer = new Composer();

composer.filter(/* 1 */).filter(/* 2 */).use(/* A */);
```

`2` will only be checked if `1` holds, and `A` will only be run if `2` (and thus `1`) holds.

Revisit the section about [combining filter queries](/guide/filter-queries.md#combining-multiple-queries) with your new knowledge and feel your new power.

A special case here is `fork`, as it starts two computations that are concurrent, i.e. interleaved on the event loop.
Instead of returning the `Composer` instance created by the underlying `use` call, it returns a `Composer` that reflects the forked computation.
This allows for concise patterns like `bot.fork().on(':text').use(/* A */)`.
`A` will now be executed on the parallel computation branch.
