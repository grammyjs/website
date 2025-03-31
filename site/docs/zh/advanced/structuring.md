# 关注点一：代码组织

当你的 bot
变得很复杂的时候，你就得去面对怎么组织构建你的应用代码库的挑战。通常的做法是，可以把单个文件给拆分开成不同的文件。

## 可能有效的做法

> grammY 这个库目前很年轻，而且暂时还没有提供任何跟 DI 容器相关的官方集成。
> 你可以订阅 [@grammyjs_news](https://t.me/grammyjs_news)
> ，一旦我们支持之后就会通知你。

你可以按照你自己喜欢的风格去组织你的代码库结构，这并没有一个放之四海而皆准的解决方案。
不过下面有一些简单有效并且已经经过了验证的组织代码库的方式或许可以帮到你。

1. 将语义上属于同一文件的内容来拆分（或者可以根据代码的大小，目录来拆分）。
   这些中的每一个单独部分都暴露出可以处理指定消息的中间件。
2. 集中创建一个 bot 实例，通过将其安装到 bot 上来合并所有中间件。
3. （可选的）集中提前找出更新，并且以正确的方式去发送这些更新。
   你可能还想查看相关的 `bot.route`（[API 参考](/ref/core/composer#route)） 或者
   [路由器插件](../plugins/router)。

你可以在
[Example Bot repository](https://github.com/grammyjs/examples/tree/main/scaling)
找到实现上面所提到的策略的一个可运行示例。

## 示例结构

这是对于管理待办事项列表的非常简单的 bot ，你可以参考这种结构。

```asciiart:no-line-numbers
src/
├── bot.ts
└── todo/
    ├── item.ts
    └── list.ts
```

`item.ts` 只是用来定义一些关于 TODO 项内容的东西，里面的代码会在 `list.ts`
中使用。

在 `list.ts` 中，你可以像下面这样做：

```ts
export const lists = new Composer();

// 在这里注册一些处理程序来处理你的中间件。
lists.on("message", async (ctx) => {/* ... */});
```

> 请注意，如果你使用 TypeScript ，你需要在创建 `Composer` 时传递你的
> [自定义上下文类型](../guide/context#定制你的上下文对象)。 例如，你需要用
> `new Composer<MyContext>()`。

你也可以使用 [Error 边界](../guide/errors#error-边界)
去处理所有程序模块中可能出现的错误。

现在在 `bot.ts` 中，你可以像下面这样去使用你的模块：

```ts
import { lists } from "./todo/list";

const bot = new Bot("");

bot.use(lists);
// ... 更多像 `todo` 一样的模块也可以像这样来使用。

bot.start();
```

可选地，如果你能够事先知道哪个中间件可以发挥相应的作用，你也可以使用
[router 插件](../plugins/router) 或者 [`bot.route`](/ref/core/composer#route)
去绑定不同的模块。

不过，需要记住的是，一般来说怎样去组织你的 bot
代码结构是很难去用一个具体的方式去描述的。
就像在软件中，用最合理的方式去做就好啦 :wink:

## 提取的中间件的类型定义

上面使用 composer 的结构效果很好。
但是，有时你可能会发现自己想要将处理程序提取到函数中，而不是创建一个新的
composer 并向其添加逻辑。
这要求你将正确的中间件类型定义添加到处理程序中，因为它们无法再通过 composer
被推断出来。

grammY 导出所有 **收窄 (narrowed) 的中间件类型**
的类型定义，例如可以传递给命令处理程序的中间件。 此外，它还导出该中间件中使用的
**收窄 (narrowed) 的上下文对象** 的类型定义。 这两种类型都使用你的
[自定义上下文对象](../guide/context#定制你的上下文对象) 进行参数化。
因此，一个命令处理程序将具有 `CommandMiddleware<MyContext>` 类型及其上下文对象
`CommandContext<MyContext>`。 它们可以按如下方式使用。

::: code-group

```ts [Node.js]
import {
  type CallbackQueryMiddleware,
  type CommandContext,
  type NextFunction,
} from "grammy";

function commandMiddleware(ctx: CommandContext<MyContext>, next: NextFunction) {
  // 处理命令
}
const callbackQueryMiddleware: CallbackQueryMiddleware<MyContext> = (ctx) => {
  // 处理 callback query
};

bot.command(["start", "help"], commandMiddleware);
bot.callbackQuery("query-data", callbackQueryMiddleware);
```

```ts [Deno]
import {
  type CallbackQueryMiddleware,
  type CommandContext,
  type NextFunction,
} from "https://deno.land/x/grammy/mod.ts";

function commandMiddleware(ctx: CommandContext<MyContext>, next: NextFunction) {
  // 处理命令
}
const callbackQueryMiddleware: CallbackQueryMiddleware<MyContext> = (ctx) => {
  // 处理 callback query
};

bot.command(["start", "help"], commandMiddleware);
bot.callbackQuery("query-data", callbackQueryMiddleware);
```

:::

阅读 [类型别名 API 参考](/ref/core/#type-aliases) 以查看 grammY
导出的所有类型别名。
