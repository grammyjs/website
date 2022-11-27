---
next: ./guide.md
---

# 什么是一个插件？

我们想 grammY 是简明扼要的，但可扩展的。
为什么？
因为不是所有人都会使用所有的东西！
插件被设计为添加到上述软件的额外功能。

## grammY 中的插件

大部分 bot 都需要的插件被直接**内置**到 grammY 核心库中。
这让新用户更容易使用它们，避免了需要额外安装一个新的软件包。

**官方**插件是和 grammY 的核心包一起发布的。
它们从 npm 上的 `@grammyjs/*` 安装，并在 GitHub 的 [@grammyjs](https://github.com/grammyjs) 组织下发布。
官方插件与 grammY 同步发布，确保插件与 grammY 的运行一致性。
官方插件文档的每一节标题中都有软件包（即插件）的名称。
举个例子，[grammY runner](./runner.md) 插件（`runner`）需要通过 `npm install @grammyjs/runner` 来安装。
（如果你在使用 Deno 而不是 Node.js，你应该从 <https://deno.land/x> 中导入插件，也就是从 `grammy_runner` 模块的 `mod.ts` 文件中导入）

## grammY 中的插件类型

所有闪闪发光的东西都是金子，对吧？
好吧，一种不同的金子！
grammY 可以利用两种类型的插件：_中间件插件_ 和 _转换器插件_。
简单地说，grammY 中的插件要么返回一个中间件函数，要么返回一个转换器函数。
让我们来谈谈其中的区别。

### 类型 I: 中间件插件

[中间件](../guide/middleware.md) 是一个处理各种形式传入数据的函数。
中间件插件是作为——嗯，你猜对了——中间件，被喂给 bot 的插件。
这意味着你可以通过 `bot.use` 来安装它们。

### 类型 II: 转换器插件

[转换器函数](../advanced/transformers.md) 与中间件相反！
它是一个处理传出数据的函数。
转换器插件是作为——你没疯！你又猜对了——转换器函数，被喂给 bot 的插件。
这意味着你可以通过 `bot.api.config.use` 来安装它们。

## 创建你自己的插件

如果你想开发一个插件并且和其他用户分享（甚至是在官方的 grammY 网站上发布的），你可以查看这个 [有用的指南](./guide.md)。

## 关于更多插件的想法

我们正在 [GitHub 上的这个 issue](https://github.com/grammyjs/grammY/issues/110) 中收集更多的关于新插件的想法。
