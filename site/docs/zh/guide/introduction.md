# 简介

Telegram Bot 是一个特殊的用户账户，由一个程序自动运行。
任何人都可以创建 Telegram Bot ，唯一的前提条件是你要懂得一点编程。

> 如果你已经知道如何创建 Bot，请前往 [入门](./getting-started)！

grammY 是一个库，它使编写这样一个 bot 变得超级简单。

## 怎么编写一个 Bot

在你开始创建你的 bot 之前，让自己熟悉 Telegram Bot 能做什么和不能做什么。
请看 Telegram 团队的 [开发者介绍](https://core.telegram.org/bots)。

在制作你的 Telegram Bot 时，你将创建一个包含你的 bot 源代码的文本文件。
（你也可以复制我们的一个例子文件。）
它定义了**你的 Bot 实际做什么**，即"当用户发送这个消息时，用这个来回应"，等等。

然后你可以运行该源文件。
你的 bot 现在将工作，直到你停止运行它。

现在你的 bot 基本上要完成了。

## 如何保持 Bot 的运行

...除非你想严肃对待你的 bot。
如果你停止你的 bot（或关闭你的电脑），你的 bot 会变得没有反应，所以它将不再对任何信息作出回复。

> 如果你只想尝试一下 Bot ，就跳过这一节，[继续往下看前提条件](#开始的前提条件)，就可以了。

简单地说，如果你想让 Bot 一直在线，你必须保持一台电脑每天24小时运行。
因为你很可能不想用你的笔记本电脑做这个，你应该把你的代码上传到一个 _主机提供商_（换句话说，别人的电脑，也被称为 _服务器_），让那些人替你运行它。

有无数的公司可以让你免费运行你的 Telegram Bot。
本文档涵盖了一些不同的托管服务提供商，我们知道它们与 grammY 配合得很好（请查看 [托管](../hosting/comparison) 章节）。
选择哪个供应商由你决定。
请记住，在其他地方运行你的代码，意味着无论谁拥有这个"地方"，都可以访问你的所有信息和你的用户数据，所以你应该选择一个你可以信任的供应商。

下面是一个（简化的）图表，说明当 Alice 与你的 bot 联系时，流程会是什么样子。

```asciiart:no-line-numbers
 _______      telegram         __________                     __________
| Alice | —>  发送消息  —>  | Telegram | —> HTTP 请求 —> | 你的 bot |
 -------      给你的 bot       ----------                     ----------

 一部手机                  Telegram 服务器                  你的笔记本电脑,
                                                        当然，一台服务器会更好。


|_____________________________________|                     |___________|
                |                                                 |
        Telegram 负责的部分                                   你负责的部分
```

同样，你的 bot 可以向 Telegram 的服务器发出 HTTP 请求，将信息发回给 Alice。
（如果你没有听说过 HTTP，你可以暂时把它看作是通过互联网发送的数据包。）

## grammY 为你做了些什么

bot 通过 HTTP 请求与 Telegram 互动。
每次你的 bot 发送或接收信息时，HTTP 请求都会在 Telegram 服务器和你的服务器/电脑之间来回移动。

在其核心部分，grammY 为你实现了所有这些通信，所以你只需在代码中输入 `sendMessage`，一条信息就会被发送出去。
此外，grammY 还做了许多其他有用的事情，使创建你的 bot 更加简单。
你会在 grammY 的旅途中了解他们。

## 开始的前提条件

> 如果你已经知道如何开发 Deno 或 Node.js 应用程序，请跳过本页面的其余部分，[开始](./getting-started)。

这里有一些关于编程的事情——对编程是必不可少的事情，但大家却很少解释，因为大多数开发者认为它们是不言而喻的。

在下一节中，你将通过编写一个包含编程语言 [TypeScript](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html) 源代码的文本文件来创建一个 bot。
grammY 文档不会教你如何编程，所以我们希望你能自学。
不过，请记住：用 grammY 创建 Telegram Bot 是个学习编程的好方法。恭喜你找到了他。 :rocket:

::: tip 学习编程
你可以从 TypeScript 团队编写的 [官方教程](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html) 开始学习 TypeScript，然后再从这里开始。
这些东西不会花费你太多的时间，接着你可以回到这里阅读剩下的部分，并 [开始](./getting-started)。

如果你在文档中看到不熟悉的语法，或者你得到一个你不理解的错误信息，请用谷歌搜索它——互联网上已经有解释了（例如在 Stack Overflow 上）。
:::

::: danger 拒绝编程！
通过观看这个 [34秒长的视频](https://youtu.be/8RtGlWmXGhA)，为自己节省一些时间。
:::

通过选择 grammY ，你已经确定了一种编程语言，即 TypeScript 。
一旦你创建了 TypeScript 代码，会发生什么，它将如何开始运行？
为此，你需要安装一些软件，能够 _执行_ 你的代码。
这种类型的软件被称为 _运行时环境_。
它接收你的源代码文件，并实际执行其中的任何程序。

对我们来说，有两种运行时环境可供选择，[Deno](https://deno.land) 和 [Node.js](https://nodejs.org) 。
（如果你看到有人叫它 _Node_ ，他们只是懒得打 ".js" ，但他们的意思是一样的。）

> 本节的其余部分将帮助你在这两个平台之间做出决定。
> 如果你已经知道你要使用什么，请跳到 [Node.js 的前提条件](#node-js-的前提条件) 或 [Deno 的前提条件](#deno-的前提条件)。

Node.js 是更古老、更成熟的技术。
如果你需要连接到一个时髦的数据库或做其他与系统有关的低级别的事情，你用 Node.js 做的可能非常大。
Deno 相对较新，所以它有时还缺乏对一些高级事物的支持。
今天，大多数服务器都使用 Node.js 。

另一方面，Deno 明显更容易学习和使用。
如果你还没有太多的编程经验，**从 Deno 开始是有意义的**。

即使你以前为 Node.js 写过代码，你也应该考虑给 Deno 一个机会。
许多在 Node.js 下很难做到的事情，在 Deno 下都是轻而易举的。

Deno：

- 更容易安装
- 不需要你配置任何关于你的项目
- 使用更少的磁盘空间
- 具有卓越的内置开发工具和出色的编辑器集成，
- 更安全，并且，
- 还有更多优点，这里不再一一赘述。

在 Deno 下开发代码也更加有趣。
至少这是我们的看法。

然而，如果你有理由使用 Node.js ，例如因为你已经很了解它，那么这完全没问题!
我们正在确保 grammY 在两个平台上都能正常工作，并且不需要任何过多设置。
请选择你认为最适合你的方式。

### Deno 的前提条件

[安装 Deno](https://deno.com/manual/getting_started/installation)，这是一切的前提。

在开始创建你的 bot 之前，让我们先花几分钟时间为软件开发进行适当的设置。
也就是安装一些工具。

#### 为开发准备环境

如果你还没有安装 Deno，那么就先 [安装 Deno](https://deno.com/manual/getting_started/installation#download-and-install)。

你还需要一个非常适合编码的文本编辑器。
最适合 Deno 的是 Visual Studio Code，通常简称为 VS Code。
[安装它。](https://code.visualstudio.com)

接下来，你需要连接 VS Code 和 Deno。
这非常简单：有一个 VS Code 的扩展可以自动完成所有事情。
你可以 [按照这里的描述](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno) 安装它。

你的系统现在可以进行 bot 开发了！ :tada:

#### 开发 Bot

在某个地方创建一个新目录。
它将包含你的机器人项目。
在 VS Code 中打开这个新目录。

```sh
mkdir ./my-bot
cd ./my-bot
code .
```

> 如果你在 macOS 上并且 `code` 命令不可用，只需打开 VS Code，按 `Cmd+Shift+P`，输入“shell 命令”，然后按回车。

在 VS Code 中，将这个空目录变成一个 Deno 项目。
按 `Ctrl+Shift+P`，输入“deno init”，然后按回车。
编辑器的右下角应该会显示系统上安装的 Deno 版本。

你的 Deno 开发环境已准备就绪。
你现在可以开始编写你的 bot 了。
这在下一页解释。

最后一件事:
在你创建了你的 bot 之后，例如在一个名为 `bot.ts` 的文件中，你可以通过在终端中输入 `deno run --allow-net bot.ts` 来运行它。
（是的，写软件意味着大量使用终端，慢慢适应吧。）
你可以使用 `Ctrl+C` 停止 bot。

都准备好了吗?
[开始吧](./getting-started#通过-deno-开始)！ :robot:

### Node.js 的前提条件

你将用 TypeScript 编写你的 bot，但是，与 Deno 相反， Node.js 实际上不能运行 TypeScript。
一旦你有了一个源文件（例如，称为 `bot.ts` ），你要把它编译成 JavaScript 。
然后你会有两个文件：你的原始 `bot.ts` ，和一个生成的 `bot.js` ，它又可以被 Node.js 运行。
所有这些的确切命令将在下一节中介绍，当你真正创建一个 bot 时，但重要的是要知道这些步骤是必要的。

为了运行 `bot.js` 文件，你必须安装[Node.js](https://nodejs.org/zh-cn/)。

你将 Node.js 所要做的事情有下面这些：

1. 用 TypeScript 代码创建一个源文件 `bot.ts` ，例如使用 [VS Code](https://code.visualstudio.com/) （或任何其他代码编辑器）。
2. 通过在你的终端运行一个命令来编译代码。这将生成一个名为 `bot.js` 的文件。
3. 同样从你的终端，使用 Node.js 运行 `bot.js`。

每次你修改 `bot.ts` 中的代码时，你都需要重新启动 Node.js 进程。
在你的终端点击 `Ctrl+C` 来停止这个进程。
这将停止你的 bot 。
然后，你需要重复步骤 2 和 3。

::: tip 等等, 什么?

安装 Node.js 并正确设置和配置所有内容需要花费大量时间。
如果你以前从未这样做过，你应该预料到会遇到大量难以解决的令人困惑的问题。

这就是为什么我们希望你知道如何设置你的系统，或者你能够自学。
（以 _正确的方式_ 安装 Node.js 太复杂了，不适合这个页面。）

如果此时你感到迷茫，你应该抛开 Node.js，转而使用 [Deno](#deno-的前提条件)。

:::

还有信心吗？
非常棒！
[开始吧](./getting-started#通过-deno-开始)！ :robot:
