---
prev: ./
next: ./structuring.md
---

# 重构中间件

在指南中，[我们介绍了中间件](/zh/guide/middleware.md) 作为一个函数栈。
你可以以线性方式去使用中间件（也可以在 grammY 中使用），而称它是一个栈也仅仅是一种简化。

## grammY 中的中间件

通常，你可以看到下面这样的模式：

```ts
const bot = new Bot("<token>");

bot.use(/* ... */);
bot.use(/* ... */);

bot.on(/* ... */);
bot.on(/* ... */);
bot.on(/* ... */);

bot.start();
```

看起来很像栈对吧，只不过，在背后的实现中，它实际是一棵树。

该功能的核心是构建这棵树的 `Composer` 类 ([参考](https://doc.deno.land/https://deno.land/x/grammy/mod.ts#Composer))。

首先，每一个 `Bot` 的实例同样也是 `Composer` 的实例。
它是一个子类，就像是 `class Bot extends Composer`。

此外，你应该知道 `Composer` 的每个方法都会在内部调用 `use` 方法。
举个栗子，`filter` 方法会在一些分支中间件中调用 `use` 方法，而 `on` 方法会再次调用 `filter` 方法，传入回调函数来根据给定的 [筛选条件](/zh/guide/filter-queries.md) 去匹配 updates。
我们可以因此把注意力限制在 `use` 方法上，其余部分如下。

我们现在需要深入了解一下其实的细节，`Composer` 对你的 `use` 方法做了些什么，还有探究它和其它中间件系统的区别。
这种区别可能会比较微妙，但是得等到下一小节我们才能察觉出它值得注意的影响。

## 扩展 `Composer`

你可以在一个 `Composer` 实例上安装更多中间件尽管已经在某处安装了 `Composer` 它本身。

```ts
const bot = new Bot("<token>"); // `Composer` 的子类

const composer = new Composer();
bot.use(composer);

// 这些将被运行：
composer.use(/* A */);
composer.use(/* B */);
composer.use(/* C */);
```

`A`, `B`, 和`C` 都将被运行。

这些表明，一旦你已经安装了 `Composer` 实例， 你仍然可以在它身上去调用 `use` 方法，并且这些中间件也仍会被运行。
（这并不是什么令人引人注目的地方，但这已经是和那些简单忽略了后续操作的主流竞对框架的主要区别。）

你可能会想知道这树结构在哪里。
接下来让我们看看这下面的代码片段：

```ts
const composer = new Composer();

composer.use(/* A */);
composer.use(/* B */).use(/* C */);
composer.use(/* D */).use(/* E */).use(/* F */).use(/* G */);
composer.use(/* H */).use(/* I */);
composer.use(/* J */).use(/* K */).use(/* L */);
```

看到了吗？

你可能猜得出来了，所有中间件都会被从A到L的顺序运行。

其它的库可能会在内部将这段代码简化为像 `composer.use(/* A */).use(/* B */).use(/* C */).use(/* D */)...` 这样的结构等等。
而恰恰相反，grammY 保留了你所指定的这棵树：一个根节点（`composer`）拥有五个子节点（`A`, `B`, `D`, `H`, `J`），而`B`节点有一个其它的子节点 `C`，以此类推。
然后，这棵树将以深度优先遍历每一次更新，从而有效地以线性顺序从 `A` 传递到 `L` ，就像你从其他系统中所知道的那样。

这使得你每次调用 `use` 方法时创建一个新的 `Composer` 实例成为可能，该实例将被扩展（如上述所介绍的那样）。

## 串行调用 `use`

如果我们仅仅使用 `use` 方法，这不会太有用（一语双关）。
如果我们带着 `filter` 方法一起加入进来和 `use` 玩耍那会变得更有意思。

来看看这个：

```ts
const composer = new Composer();

composer.filter(/* 1 */, /* A */).use(/* B */)

composer.filter(/* 2 */).use(/* C */, /* D */)
```

第三行中，我们在回调函数 `1` 后面注册了 `A`。
`A` 将只会通过给定的条件 `1` 来进行更新计算。
不过， 第三行中 `filter` 方法会返回一个 `Composer` 实例来给我们调用 `use` 方法进行扩展， 所以 `B` 仍然会遵从 `1` 里面所定义的条件， 尽管它是在一个完全不同的 `use` 方法中执行的。

第五行和第三行是等效的，因为只有 `2` 满足的时候， `C` 和 `D` 才会运行。

还记得 `bot.on()` 调用是如何被链接的以便将多个filter过滤查询条件链接起来吗？
想一下下面的：

```ts
const composer = new Composer();

composer.filter(/* 1 */).filter(/* 2 */).use(/* A */);
```

只有 `1` 的条件满足时 `2` 才会被检查， 并且 `A` 只有同时满足 `1` 和 `2` 的时候才会去运行。

用你所学的新知识去重温一下这个章节 [结合过滤查询](/zh/guide/filter-queries.md#组合多个查询) 并且感受一下你所学到的新能力。

一个特殊的例子是 `fork`，它开启了两个并行的计算。交替在事件循环中。
它不是返回由底层 `use` 调用创建的 `Composer` 实例，而是返回一个映射分叉计算的 `Composer` 实例。
这允许使用简洁模式，像 `bot.fork().on(':text').use(/* A */)`。
`A` 现在将在并行的计算分支上执行。
