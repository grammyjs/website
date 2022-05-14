---
prev: ./middleware.html
next: ./scaling.html

---

# 关注点一：代码组织

当你的 bot 变得很复杂的时候，你就得去面对怎么组织构建你的应用代码库的挑战。通常的做法是，可以把单个文件给拆分开成不同的文件。

## 可能有效的做法

> grammY 这个库目前很年轻，而且暂时还没有提供任何跟 DI 容器相关的官方集成。
> 你可以订阅 [@grammyjs_news](https://t.me/grammyjs_news) ，一旦我们支持之后就会通知你。

你可以按照你自己喜欢的风格去组织你的代码库结构，这并没有一个放之四海而皆准的解决方案。
不过下面有一些简单有效并且已经经过了验证的组织代码库的方式或许可以帮到你。

1. 将语义上属于同一文件的内容来拆分（或者可以根据代码的大小，目录来拆分）。
   这些中的每一个单独部分都暴露出可以处理指定消息的中间件。
2. 集中创建一个 bot 实例，通过将其安装到 bot 上来合并所有中间件。
3. （可选的）集中提前找出更新，并且以正确的方式去发送这些更新。
   你可能还想查看相关的 `bot.route`（[API 参考](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/Composer#route)） 或者 [路由器插件](/zh/plugins/router.md)。

你可以在 [Example Bot repository](https://github.com/grammyjs/examples/tree/main/scaling) 找到实现上面所提到的策略的一个可运行示例。

## 示例结构

这是对于管理待办事项列表的非常简单的 bot ，你可以参考这种结构。

```asciiart:no-line-numbers
src/
├── bot.ts
└── todo/
    ├── item.ts
    └── list.ts
```

`item.ts` 只是用来定义一些关于 TODO 项内容的东西，里面的代码会在 `list.ts` 中使用。

在 `list.ts` 中，你可以像下面这样做：

```ts
export const lists = new Composer();

// 在这里注册一些处理的方法来处理你的中间件。
lists.on('message', ctx => { ... });
```

你也可以使用 [Error 边界](/zh/guide/errors.md#error-边界) 去处理所有程序模块中可能出现的错误。

现在在 `bot.ts` 中，你可以像下面这样去使用你的模块：

```ts
import { lists } from "./todo/list";

const bot = new Bot("<token>");

bot.use(lists);
// ... 更多像 `todo` 一样的模块也可以像这样来使用

bot.start();
```

可选地，如果你能够事先知道哪个中间件可以发挥相应的作用，你也可以使用 [router 插件](/zh/plugins/router.md) 或者去绑定不同的模块。

不过，需要记住的是，一般来说怎样去组织你的 bot 代码结构是很难去用一个具体的方式去描述的。
就像在软件中，用最合理的方式去做就好啦 :wink:
