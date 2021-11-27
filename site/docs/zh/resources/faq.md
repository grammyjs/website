# FAQ

## grammY 是什么？

grammY 是一个用于在 [Telegram](https://telegram.org) 上创建聊天 bot 的软件（也可以说是一个框架）。
当你在创建 bot 时，你会发现其中有很大一部分是重复且乏味的。
grammY 帮你完成了这些繁琐的工作，让你创建 bot 变得超级简单。

## grammY 是什么时候被创造出来的？

grammY 的首次发布是在 2021 年 3 月底。
几周后，我们发布了第一个稳定版本。

## grammY 是如何开发的？

grammY 是一个完全免费并且开源的软件，由一个志愿者团队开发。
你可以在 GitHub 上找到它的源码。

我们非常欢迎你的 [加入](https://t.me/grammyjs)！

## grammY 使用什么编程语言？

grammY 是由 TypeScript 编写的，一个 JavaScript 的超集。
因此，它可以在 Node.js 上运行。
并且，grammY 也可以在 Deno（它将自己定义为 Node.js 的继承者）上运行。
（从技术上来讲，你可以在现代浏览器上运行 grammY，尽管这可能没什么用。）

## grammY 和它的竞争对手相比如何？

如果你来自不同编程语言或者不同的 JavaScript 框架，你可以查看我们 [框架之间的细节比较](./comparison.md)。

## 你为什么要支持 Deno？

这里有一些我们觉得 Deno 比 Node.js 更好的原因：

- 从零开始更简单、更快速。
- 工具链有大幅度优化。
- 它可以原生执行 TypeScript。
- 不需要维护 `package.json` 或者 `node_modules`。
- 它有一个经过审查的标准库。

> Deno 是由发明 Node.js 的同一个人 Ry 创造的。
> 他在 [这个视频]](https://youtu.be/M3BM9TB-8yA) 里总结了他对 Node.js 的 10 个遗憾。

grammY 实际上在编写时是优先 Deno，然后再支持 Node.js。

## 我在哪里可以托管 Deno 程序？

因为 Deno 比较新，并且生态系统还不够完善，所以你能够托管 Deno 应用的地方比 Node.js 的少。
以下是你可以托管 Deno 应用的一些选择：

1. [Cloudflare Workers](https://workers.dev)
2. [Deno Deploy](https://deno.com/deploy)
3. [Heroku](https://dev.to/ms314006/deploy-your-deno-apps-to-heroku-375h)
4. [Vercel](https://github.com/vercel-community/deno)
