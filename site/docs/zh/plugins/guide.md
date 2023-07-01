---
prev: ../plugins/
---

# grammy 插件的搭便车指南

如果你想开发自己的插件并发布它，或者你想知道 grammY 插件在幕后是如何工作的，这就是你要来的地方！

> 请注意，已经有一个关于 [grammY 插件](./) 是什么以及它们做什么的概要。
> 这篇文章是关于它们内部工作的深入探索。

## grammY 中的插件类型

grammY 中主要有两种类型的插件：

- 中间件插件：该插件的唯一工作是返回一个 [中间件函数](../guide/middleware.md)，可以喂给 grammY bot。
- 转化器插件：该插件的唯一工作是返回一个 [转换器函数](../advanced/transformers.md)，可以喂给 grammY bot。

然而，有时候你会发现插件同时做这两件事。
还有一些软件包既不是中间件，也不是转化器函数，但我们还是称它们为插件，因为它们以各种方式扩展了 grammY。

## 贡献规则

你可以通过下面任意一种方式发布你的插件：

- 作为**官方**插件发布。
- 作为**第三方**插件发布。

如果你选择以第三方的方式发布插件，我们仍然可以在本网站上为你提供一个突出的位置。
但是，我们更希望你在 GitHub 上的 [grammyjs 组织](https://github.com/grammyjs) 下发布你的插件，从而使其成为一个官方插件。
在这种情况下，你将被授予 GitHub 和 npm 的发布权限。
此外，你还将负责维护你的代码。

在深入研究一些实践案例之前，如果你想让你的插件在这个网站上列出，你需要注意以下规则。

1. 在 GitHub（和npm）上有一个 README 文件，简短而清晰地描述如何使用它。
2. 通过在 [文档](https://github.com/grammyjs/website) 中添加一个页面来解释你的插件的目的以及如何使用它。
   （如果你不确定怎么做，我们可以为你做这件事。）
3. 选择一个许可证，比如 MIT 或 ISC。

最后，你应该知道，尽管 grammY 同时支持 Node.js 和 [Deno](https://deno.land)，但它是一个 Deno 优先的项目，我们也鼓励你为 Deno 编写你的插件（和在风格上）。
有一个可以转换 Deno 代码到 Node.js 的工具，叫做 [deno2node](https://github.com/fromdeno/deno2node)，所以我们可以同时支持这两个平台。
Deno 支持只是对官方插件的严格要求，而不是对第三方插件的。
尽管如此，我们还是非常鼓励你去尝试一下 Deno。
用过都说好。

## 设计一个虚拟的中间件插件

让我们假设我们想设计一个只响应某些特定用户的插件！
例如，我们可以决定只响应用户的名字中包含特定字符的人。
这个 bot 将简单地拒绝为其他人服务。

下面是一个虚拟的示例：

```ts
// plugin.ts
// 从 grammY 中导入类型（我们在 `deps.deno.ts` 中重新导出了它们）。
import type { Context, Middleware, NextFunction } from "./deps.deno.ts";
// 你的插件可以有一个创建中间件的主函数。
export function onlyAccept<C extends Context>(str: string): Middleware<C> {
  // 创建并返回一个中间件。
  return async (ctx, next) => {
    // 获取用户的名字。
    const name = ctx.from?.first_name;
    // 通过所有匹配的 updates。
    if (name === undefined || name.includes(str)) {
      // 将控制流传递给下游的中间件。
      await next();
    } else {
      // 告诉他们我们不喜欢他们。
      await ctx.reply(`I'm not talking to you! You don't care about ${str}!`);
    }
  };
}
```

现在，它可以在真正的 bot 中使用：

```ts
import { onlyAccept } from "./testing.ts";
import { Bot } from "./deps.deno.ts";
const bot = new Bot("");
bot.use(onlyAccept("grammY"));
bot.on("message", (ctx) => ctx.reply("You passed the middleware plugin"));
bot.start();
```

Voilà!
你得到了一个插件，对吧？
对，但这么快。
我们还需要打包它，但在这之前，我们先看一下转换器插件。

## 设计一个虚拟的转换器插件

想象一下，写一个插件，每当 bot 发送文件时，自动发送相应的 [聊天动作](https://core.telegram.org/bots/api#sendchataction)。
这意味着当你的 bot 在发送文件时，用户会自动看到 "_sending file…_" 作为状态。
很酷，对吗？

```ts
// plugin.ts
import type { Transformer } from "./deps.deno.ts";
// 函数的主要功能
export function autoChatAction(): Transformer {
  // 创建并返回一个转换器函数。
  return async (prev, method, payload, signal) => {
    // 保存已设定的时间间隔的 handle，以便我们稍后可以清除它。
    let handle: ReturnType<typeof setTimeout> | undefined;
    if (method === "sendDocument" && "chat_id" in payload) {
      // 我们现在知道，一份文件正在被发送。
      const actionPayload = {
        chat_id: payload.chat_id,
        action: "upload_document",
      };
      // 在上传文件的过程中，重复设置聊天动作。
      handle ??= setInterval(() => {
        prev("sendChatAction", actionPayload).catch(console.error);
      }, 5000);
    }
    try {
      // 从 bot 中运行实际的方法。
      return await prev(method, payload, signal);
    } finally {
      // 清除间隔，以便我们停止向客户端发送聊天动作。
      clearInterval(handle);
    }
  };
}
```

现在，它可以在真正的 bot 中使用：

```ts
import { Bot, InputFile } from "./deps.deno.ts";
// 该插件的代码在一个名为 `plugin.ts` 的文件中。
import { autoChatAction } from "./plugin.ts";
// 创建一个 bot 实例。
const bot = new Bot("");
// 使用插件。
bot.api.config.use(autoChatAction());
bot.hears("send me a document", async (ctx) => {
  // 如果用户发送这个命令，我们将向他发送一个 pdf 文件（用于演示）。
  await ctx.replyWithDocument(new InputFile("/tmp/document.pdf"));
});
// 启动 bot
bot.start();
```

现在，每次我们发送文件时，`upload_document` 聊天动作将被发送到我们的客户端。
请注意，这是为了演示目的。
Telegram 建议只有在 "bot 的响应需要**明显**的时间才能到达时" 才使用聊天动作。
如果文件非常小，你可能实际上不需要设置状态，所以这里可以做一些优化。

## 提取到一个插件中

无论你做的是哪种类型的插件，你都需要把它打包成一个独立的包。
这是一个相当简单的任务。
关于如何做到这一点没有具体的规则，npm 是你自己的，但为了让事情有条理，我们有一个模板建议给你。
你可以从 [我们在 GitHub 上的插件模板库](https://github.com/grammyjs/plugin-template) 中下载代码，并开始开发你的插件，不用消耗任何时间在配置上。

建议的初始化文件夹结构：

```asciiart:no-line-numbers
plugin-template/
├─ src/
│  ├─ deps.deno.ts
│  ├─ deps.node.ts
│  └─ index.ts
├─ package.json
├─ tsconfig.json
└─ README.md
```

**`deps.deno.ts` 和 `deps.node.ts`**：这是为那些愿意为 Deno 编写插件，然后将其转译为 Node.js 的开发者准备的。
正如前面提到的，我们使用 `deno2node` 将 Deno 的代码转译为 Node.js。
`deno2node` 有一个特性，允许你向它提供运行时的特定文件。
这些文件应该是相邻的，并且按照如 [文档中解释](https://github.com/fromdeno/deno2node#runtime-specific-code) 的 `*.deno.ts` 和 `*.node.ts` 的名称结构来命名。
这就是为什么这里有两个文件：`deps.deno.ts` 和 `deps.node.ts`。
如果有任何 Node.js 特定的依赖项，请放在 `deps.node.ts` 中，否则，请让它保持空白。

> _**注意**_：你也可以使用其他工具，例如 [deno dnt](https://github.com/denoland/dnt) 来转译你的 Deno 代码或使用其他文件夹结构。
> 你使用的工具并不重要，这里的主要目的是为了更好和更简单地写 Deno 代码。

**`tsconfig.json`**：这是 TypeScript 编译器的配置文件，用于 `deno2node` 的转译。
仓库中提供了一个默认的配置作为建议。
它与 Deno 使用的内部 TypeScript 配置相同，我们建议你坚持使用它。

**`package.json`**：你的插件的 npm 版本的 package.json 文件。
**确保根据你的项目来改变它**.

**`README.md`**：关于如何使用该插件的说明。
**确保根据你的项目来改变它**.

**`index.ts`**：包含你的业务逻辑的文件，即你的主要插件代码。

## 这里有一个模版

如果你想为 grammY 开发一个插件，但不知道从哪里开始，我们强烈建议使用 [我们的仓库](https://github.com/grammyjs/plugin-template) 中的模板代码。
你可以为自己克隆代码，并根据这篇文章所涉及的内容开始写代码。
这个仓库还包括一些额外的好东西，比如 `.editorconfig`，`LICENSE`，`.gitignore` 等等，但你可以选择删除它们。

## 我不喜欢 Deno

好吧，你错过了好东西！
但你也可以只为 Node.js 写你的插件。
你仍然可以发布插件，让它作为第三方插件列在这个网站上。
在这种情况下，你可以使用任何你喜欢的文件夹结构（只要它像其他 npm 项目一样组织结构）。
只需要通过 `npm install grammy` 安装 grammy，然后开始写代码。

## 如何提交？

如果你已经准备好了一个插件，你可以直接在 GitHub 上提交一个 pull request（根据 [贡献规则](#贡献规则)），或者在 [社区聊天](https://t.me/grammyjs) 中通知我们以获得进一步的帮助。
