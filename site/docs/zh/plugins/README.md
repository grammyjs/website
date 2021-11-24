# grammY 的插件

grammY 支持安装插件，其中大部分插件是通过添加新的 [中间件](/zh/guide/middleware.md) 和 [转化器函数](/zh/advanced/transformers.md) 实现的。

## 插件的分类

大部分 bot 都需要的插件被直接**内置**到 grammY 核心库中。
这让新用户更容易使用它们，避免了需要额外安装一个新的软件包。

**官方**插件是和 grammY 的核心包一起发布的。
它们从 npm 上的 `@grammyjs/*` 安装，并在 GitHub 的 [@grammyjs](https://github.com/grammyjs) 组织下发布。
官方插件与 grammY 同步发布，确保插件与 grammY 的运行一致性。
官方插件文档的每一节标题中都有软件包（即插件）的名称。
举个例子，[grammY runner](./runner.md) 插件（`runner`）需要通过 `npm install @grammyjs/runner` 来安装。
（如果你在使用 Deno 而不是 Node.js，你应该从 <https://deno.land/x> 中导入插件，也就是从 `grammy_runner` 模块的 `mod.ts` 文件中导入）

> 如果你想把自己的软件包发布为官方支持的插件，只需要在 [社区聊天](https://t.me/grammyjs) 中喊我们一声，并且让我们知道你的计划，然后我们可以授予你 GitHub 和 npm 的发布权限。
> 你将负责维护你的代码（但也许会有其他人加入进来和你一起维护）。

当然，你也可以决定作为**第三方**独立发布你的软件包。
如果是这样的话，我们仍然可以在这个网站上为你提供一个位置：

## 向文档提交你自己的插件

如果你是一个可以帮助其他 grammY 用户的库的作者，你可以在 GitHub 上提交一个 PR，在 grammY 的官方网站（就是现在这个）上为它添加一个页面。
这可以让其他用户能够找到它，并且为你提供了一个简单的方法来拥有一个优秀的文档。

如果你想让你的插件被收录到这里，你需要满足下列条件。

1. 在 GitHub （和 npm）上有一个说明如何使用你的插件的 README 文件。
2. 在 PR 中添加一个页面，其中包括以下内容

   - 你的插件解决了什么问题，以及
   - 如何使用它

   最简单的办法是从你的 README 文件中复制到 PR 中

3. 它是在允许的许可证下发布的开源软件，最好是 MIT （和 grammY 一样）或者是 ISC。

那是坠好的，如果你的插件还能在 Deno 上运行，那样的话我们会把这些插件移到列表的顶部。
但是，支持 Deno 并不是必选项。

## 关于更多插件的想法

我们正在 [GitHub 上的这个 issue](https://github.com/grammyjs/grammY/issues/110) 上收集更多的关于新插件的想法。
