---
prev: ./api.md
next: ./commands.md
---

# Filter 参数与 `bot.on()`

`bot.on()` 的第一个参数是一个叫做 _filter 参数_ 的字符串。

## 简介

大多数（所有？）其他机器人框架允许你对更新进行原始形式的筛选，例如，只有 `on("message")` 之类的。
其他的信息筛选是留给开发人员的，这往往导致他们的代码中出现无休止的 `if` 语句。

相反，**grammY 带有自己的查询语言**，你可以用它来**筛选你想要的信息**。

这允许使用超过 500 种不同的 filter 进行筛选，而且我们可能会随着时间的推移增加更多的过滤器。
每个有效的 filter 都可以在你的代码编辑器中自动完成。
因此，你可以简单地输入 `bot.on('')`，打开自动完成，并通过输入一些东西来搜索所有的查询。

![Filter 参数查询](/filter-query-search.png)

`bot.on()` 的类型推理将理解你挑选的 filter。
因此，它在上下文中浓缩了一些已知存在的类型。

```ts
bot.on("message", (ctx) => {
  // 照片信息的文本可能未被定义！
  const text: string | undefined = ctx.msg.text;
});
bot.on("message:text", (ctx) => {
  // 文本出现在文字信息中是可知的！
  const text: string = ctx.msg.text;
});
```

从某种意义上说，grammY 在运行时和类型层面上都实现了筛选。

## 查询示例

下面是一些查询的例子：

### 常规查询

简单的更新 filter，以及 sub-filter 的应用。

```ts
bot.on("message"); // 对所有的信息都进行调用
bot.on("message:text"); // 只有文本信息才会被调用
bot.on("message:photo"); // 只有图片信息才会被调用
```

### 可用于 Entities 的 Filter

Sub-filters 带来了更强的能力与新的可能性。

```ts
bot.on("message:entities:url"); // 含有一个URL的信息
bot.on("message:entities:code"); // 含有代码片断的信息
bot.on("edited_message:entities"); // 编辑的信息与任何 Entities
```

### 缺省值

你可以在 filter 查询中省略一些参数。
然后，grammY 将通过不同的值来搜索，以匹配你的查询。

```ts
bot.on(":text"); // 所有文本信息和 channel 中的所有的文本 post
bot.on("message::url"); // 消息中带有URL的文字或标题（照片等）。
bot.on("::email"); // 所有信息、channel post 的标题或内容中包括的 email（有时你确实会对某一类信息这样执着）。
```

省去 _filter 第一个参数_ ，可以同时匹配消息和 channel posts 。
[记住](./context.md#available-actions)，`ctx.msg` 让你可以访问消息或 channel posts ，它们都是符合匹配规则的，可以放心使用。

遗漏 _第二_ 个值可以同时匹配 entities 和标题 entities。
你可以同时省略第一和第二部分。

### 快捷方式

grammY 的查询引擎允许定义整齐的快捷方式，将相关的查询组合在一起。

#### `msg`

`msg` 快捷键将新消息和 channel posts 归纳其中。
换句话说，使用 `msg` 相当于同时监听 `message` 和 `channel_post` 事件。

```ts
bot.on("msg"); // 所有的信息和 channel posts
bot.on("msg:text"); // 与 `:text` 完全一致
```

#### `edit`

这个 `edit` 快捷方式将编辑过的信息和编辑过的 channel posts 归纳其中。

```ts
bot.on("edit"); // 所有编辑过的信息和编辑过的 channel posts
bot.on("edit:text"); // 已编辑过的文字信息
bot.on("edit::url"); // 所有编辑过的信息和编辑过的 channel posts 中带有 URL 的部分
bot.on("edit:location"); // 实时位置更新
```

#### `:media`

`:media` 快捷方式将照片和视频信息归纳其中。

```ts
bot.on("message:media"); // 照片和视频
bot.on("edited_channel_post:media"); // 已编辑的 channel posts 中带有照片或视频的部分
bot.on(":media"); // 新的信息中包括照片或视频的部分。新的信息包括普通信息与 channel posts。
```

#### `:file`

`:file` 快捷方式将所有包含文件的归纳。
因此，`await ctx.getFile()` 将会会返回给你一个文件对象。

```ts
bot.on(":file"); // 在信息或 channel posts 包含文件的部分
bot.on("edit:file"); // 在信息或 channel posts 包含文件的部分且已被编辑的部分
```

### 实用技巧！

你可以通过 `:is_bot` 的查询部分来检测信息来源是否是 bot。
语法糖 `:me` 可以用来在查询中指代你的 bot ，它将在内部为你比对用户标识符来实现这个效果。

```ts
bot.on("message:new_chat_members:is_bot"); // 一个 bot 加入了会话
bot.on("message:left_chat_member:me"); // 你的 bot 留下了一条聊天记录（已被删除）
```

::: tip 按照用户属性筛选

如果你想通过用户的其他属性进行过滤，你需要执行一个额外的请求，例如 `await ctx.getAuthor()` 来获取消息的作者。
filter 查询不会秘密地为你执行进一步的 API 请求。
执行这种查询仍然很简单：

```ts
bot.on("message").filter(
  async (ctx) => {
    const user = await ctx.getAuthor();
    return user.status === "creator" || user.status === "administrator";
  },
  (ctx) => {
    // 处理来自 creator 和 administrator 的信息
  },
);
```

:::

## 组合多个查询

你可以用 `AND` 以及 `OR` 操作来组合任何数量的 filter 查询（这是真的）。

### 使用 OR 进行组合

如果你想在两个查询的 OR 串联后面安装一些中间件，你可以把这两个查询以数组的形式传递给 `bot.on()`。

```ts
// 如果更新是关于一个消息或对一个消息的编辑，则运行。
bot.on(["message", "edited_message"], (ctx) => {});
// 如果在文本或标题中发现 hashtag 或电子邮件，或提及 entity，则运行。
bot.on(["::hashtag", "::email", "::mention"], (ctx) => {});
```

你所提供的 _任何查询匹配_，中间件都将被执行。
所以查询的顺序并不重要。

### 使用 AND 进行组合

如果你想在两个查询的 AND 串联后面安装一些中间件，你可以连锁调用 `bot.on()`。

```ts
// 匹配转发的 URL
bot.on("::url").on(":forward_date" /* , ... */);
// 匹配在标题中含有标签的照片
bot.on(":photo").on("::hashtag" /* , ... */);
```

你所提供的 _任何查询匹配_，中间件都将被执行。
所以查询的顺序并不重要。

### 构建复杂的查询

从技术上讲，如果 filter 查询是在 [CNF](https://zh.wikipedia.org/wiki/%E5%90%88%E5%8F%96%E8%8C%83%E5%BC%8F) 中进行的，就有可能将其与更复杂的公式相结合，尽管这可能不太有用。

```ts
bot
  // 匹配所有频道的帖子和转发的信息 ...
  .on(["channel_post", ":forward_date"])
  // ... 包含文本. ...
  .on(":text")
  // ... 至少有一个 URL，hashtag 或 cashtag。
  .on(["::url", "::hashtag", "::cashtag"], (ctx) => {});
```

`ctx` 的类型推理将扫描整个调用链并检查所有三个 `.on` 调用的每个元素。
打个比方，它可以检测到`ctx.msg.text`是上述代码片断的一个必要属性。

## 查询语言

> 本节是为那些想对 grammY 中的 filter 查询有更深入了解的用户准备的，它不包含创建 bot 所需的任何知识。

### 查询结构

每个查询由最多三个查询部分组成。
根据一个查询有多少个查询部分，我们区分了 L1，L2 和 L3 查询，如 `message`，`message:entities` 和 `message:entities:url`。我们能很清晰的分辨出这三个等级。

查询部分由冒号(`:`)分隔。
我们把第一个冒号之前的部分或查询字符串的末尾称为查询的 _L1 部分_。
我们把从第一个冒号到第二个冒号或到查询字符串结尾的部分称为查询的 _L2 部分_。
我们把从第二个冒号到查询字符串结尾的部分称为查询的 _L3 部分_。

示例:

| Filter 查询                    | L1 部分       | L2 部分        | L3 部分       |
| ---------------------------- | ----------- | ------------ | ----------- |
| `'message'`                  | `'message'` | `undefined`  | `undefined` |
| `'message:entities'`         | `'message'` | `'entities'` | `undefined` |
| `'message:entities:mention'` | `'message'` | `'entities'` | `'mention'` |

### 查询前验证

尽管类型系统应该在编译时捕获所有无效的过滤器查询，但 grammY 在设置时也会在运行时检查所有通过的过滤器查询。
每个通过的过滤器查询都会与一个验证结构相匹配，以检查它是否有效。
在设置过程中立即失败而不是在运行时失败不仅是好事，以前也发生过 TypeScript 中的错误导致复杂的类型推理系统出现严重问题的情况。
如果将来再发生这种情况，查询前验证将防止可能发生的问题。
在这种情况下，你将会得到有用的错误信息。

### 性能

**grammY 可以在每次更新的恒定时间内检查每个 filter 查询**，与查询的结构或传入的更新无关。

filter 查询的验证只发生一次，当 bot 被初始化和 `bot.on()` 被调用时。

在启动时，grammY 从 filter 查询中导出一个函数语句，将其拆分为查询部分。
每个部分都将被映射到一个函数，该函数执行一个单一的 `in` 检查，或者如果该部分被省略，需要检查两个值，则执行两个检查。
然后这些函数被组合成一个语句，这个语句只需要检查与查询相关的值，而不需要对 `Update` 的对象键进行迭代。

这个系统使用的操作比一些同类库要少，这些库在路由更新时需要对数组进行包含性检查。如你所见， grammY 的 filter 查询系统要强大得多。
