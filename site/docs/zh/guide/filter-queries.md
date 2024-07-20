# Filter 参数与 `bot.on()`

`bot.on()` 的第一个参数是一个叫做 _filter 参数_ 的字符串。

## 简介

大多数（所有？）其他机器人框架允许你对更新进行原始形式的筛选，例如，只有 `on("message")` 之类的。
其他消息筛选是留给开发人员的，这往往导致他们的代码中出现无休止的 `if` 语句。

相反，**grammY 带有自己的查询语言**，你可以用它来**筛选你想要的消息**。

这允许使用超过 1150 种不同的 filter 进行筛选，而且我们可能会随着时间的推移增加更多的过滤器。
每个有效的 filter 都可以在你的代码编辑器中自动完成。
因此，你可以简单地输入 `bot.on("")`，打开自动完成，并通过输入一些东西来搜索所有的查询。

![Filter 参数查询](/images/filter-query-search.png)

`bot.on()` 的类型推理将理解你挑选的 filter。
因此，它在上下文中浓缩了一些已知存在的类型。

```ts
bot.on("message", async (ctx) => {
  // 如果收到的消息没有文本，则可能是未定义的。
  const text: string | undefined = ctx.msg.text;
});
bot.on("message:text", async (ctx) => {
  // 文本始终存在，因为收到文本消息时会调用此处理程序。
  const text: string = ctx.msg.text;
});
```

从某种意义上说，grammY [在运行时](#性能) 和 [类型层面上](#类型安全) 都实现了筛选。

## 查询示例

下面是一些查询的例子：

### 常规查询

简单的更新 filter，以及 sub-filter 的应用。

```ts
bot.on("message"); // 当收到任何消息时被调用
bot.on("message:text"); // 只有文本消息才会被调用
bot.on("message:photo"); // 只有图片消息才会被调用
```

### 可用于 Entities 的 Filter

Sub-filters 带来了更强的能力与新的可能性。

```ts
bot.on("message:entities:url"); // 包含一个 URL 的消息
bot.on("message:entities:code"); // 包含一个代码片断的消息
bot.on("edited_message:entities"); // 编辑的消息与任何 entities
```

### 缺省值

你可以在 filter 查询中省略一些参数。
然后，grammY 将通过不同的值来搜索，以匹配你的查询。

```ts
bot.on(":text"); // 任何文本消息和 channel 中的所有文本 post
bot.on("message::url"); // 消息中带有 URL 的文字或标题（照片等）。
bot.on("::email"); // 所有消息、channel post 的标题或内容中包括的 email（有时你确实会对某一类消息这样执着）。
```

省去 _filter 第一个参数_ ，可以同时匹配消息和 channel posts 。
[记住](./context#可用操作)，`ctx.msg` 让你可以访问消息或 channel posts ，它们都是符合匹配规则的，可以放心使用。

遗漏 _第二_ 个值可以同时匹配 entities 和标题 entities。
你可以同时省略第一和第二部分。

### 快捷方式

grammY 的查询引擎允许定义整齐的快捷方式，将相关的查询组合在一起。

#### `msg`

`msg` 快捷键将新消息和频道 posts 归纳其中。
换句话说，使用 `msg` 相当于同时监听 `message` 和 `channel_post` 事件。

```ts
bot.on("msg"); // 任何的消息或者频道 post
bot.on("msg:text"); // 与 `:text` 完全一致
```

#### `edit`

这个 `edit` 快捷方式将编辑过的消息和编辑过的频道 posts 归纳其中。
换句话说，使用 `edit` 与监听 `"edited_message"` 和 `"edited_channel_post"` 事件是等价的。

```ts
bot.on("edit"); // 任何编辑过的消息和编辑过的频道 post
bot.on("edit:text"); // 已编辑过的文字消息
bot.on("edit::url"); // 在文本或标题中编辑带有 URL 的消息
bot.on("edit:location"); // 实时位置更新
```

#### `:media`

`:media` 快捷方式将照片和视频消息归纳其中。
换句话说，使用 `:media` 与监听 `":photo"` 和 `":video"` 事件是等价的。

```ts
bot.on("message:media"); // 照片和视频消息
bot.on("edited_channel_post:media"); // 已编辑的频道 posts 中带有媒体的部分
bot.on(":media"); // 媒体消息或者频道 posts
```

#### `:file`

`:file` 快捷方式将所有包含文件的归纳。
换句话说，使用 `:file` 与监听 `":photo"`、`":animation"`、`":audio"`、`":document"`、`":video"`、`":video_note"`、`":voice"` 和 `":sticker"` 事件是等价的。
因此，`await ctx.getFile()` 将会会返回给你一个文件对象。

```ts
bot.on(":file"); // 消息或频道 posts 包含文件的部分
bot.on("edit:file"); // 在消息或频道 posts 包含文件的部分且已被编辑的部分
```

### 语法糖

查询部分有两种特殊情况，使用户的过滤更方便。
你可以通过 `:is_bot` 的查询部分来检测消息来源是否是 bot。
语法糖 `:me` 可以用来在查询中指代你的 bot ，它将在内部为你比对用户标识符来实现这个效果。

```ts
// 一个 bot 加入了聊天的服务信息
bot.on("message:new_chat_members:is_bot");
// 你的 bot 被移除的服务信息
bot.on("message:left_chat_member:me");
```

请注意，虽然这个语法糖对于服务消息很有用，但是它不应该用于检测用户是否真的加入或离开聊天。
服务消息是通知聊天中的用户的消息，其中一些不一定会在所有情况下都可见。
例如，在大型群组中，用户加入或离开聊天的消息不会出现在消息中。
因此，你的 bot 可能不会注意到这个。
所以，你应该监听 [聊天成员更新](#聊天成员更新)。

## 组合多个查询

你可以用 `AND` 以及 `OR` 操作来组合任何数量的 filter 查询（这是真的）。

### 使用 OR 进行组合

如果你想在两个查询的 OR 串联后面安装一些中间件，你可以把这两个查询以数组的形式传递给 `bot.on()`。

```ts
// 如果更新是关于一个消息或对一个消息的编辑，则运行。
bot.on(["message", "edited_message"] /* , ... */);
// 如果在文本或标题中发现 hashtag 或电子邮件，或提及 entity，则运行。
bot.on(["::hashtag", "::email", "::mention"] /* , ... */);
```

你所提供的 _任何查询匹配_，中间件都将被执行。
所以查询的顺序并不重要。

### 使用 AND 进行组合

如果你想在两个查询的 AND 串联后面安装一些中间件，你可以连锁调用 `bot.on()`。

```ts
// 匹配转发的 URL
bot.on("::url").on(":forward_origin" /* , ... */);
// 匹配在标题中含有标签的照片
bot.on(":photo").on("::hashtag" /* , ... */);
```

你所提供的 _任何查询匹配_，中间件都将被执行。
所以查询的顺序并不重要。

### 构建复杂的查询

从技术上讲，如果 filter 查询是在 [CNF](https://zh.wikipedia.org/wiki/%E5%90%88%E5%8F%96%E8%8C%83%E5%BC%8F) 中进行的，就有可能将其与更复杂的公式相结合，尽管这可能不太有用。

```ts
bot
  // 匹配所有频道的帖子或转发的消息 ...
  .on(["channel_post", ":forward_origin"])
  // ... 包含文本. ...
  .on(":text")
  // ... 至少有一个 URL，hashtag 或 cashtag。
  .on(["::url", "::hashtag", "::cashtag"] /* , ... */);
```

`ctx` 的类型推理将扫描整个调用链并检查所有三个 `.on` 调用的每个元素。
打个比方，它可以检测到 `ctx.msg.text` 是上述代码片断的一个必要属性。

## 实用贴士

这里有一些鲜为人知的过滤器查询的功能，它们可能会派上用场。
其中一些是一些比较高级的，所以你可以跳过它们到 [下一节](./commands)。

### 聊天成员更新

你可以使用下面的过滤查询来接收你的 bot 的状态更新。

```ts
bot.on("my_chat_member"); // 封禁，取消封禁，加入，或者离开
```

在私人聊天中，这将在 bot 封禁或取消封禁时触发。
在群组中，这将在 bot 加入或移除时触发。
你可以检查 `ctx.myChatMember` 来确定到底发生了什么。

这一点不能与下面混淆

```ts
bot.on("chat_member");
```

上面可用于检测其他聊天成员的状态变化，如人们加入、权限提升等。

> 请注意，`chat_member` 更新需要在启动 bot 时显式地指定 `allowed_updates`。

### 将查询与其他方法相结合

你可以将过滤器查询与 `Composer` 类（[API 参考](/ref/core/composer)）的其他方法相结合，例如 `command` 或 `filter`。
这可以让你构建更复杂的消息处理模式。

```ts
bot.on(":forward_origin").command("help"); // 转发的 /help 命令

// 只在私人聊天中处理命令。
const pm = bot.chatType("private");
pm.command("start");
pm.command("help");
```

### 按消息发送者类型过滤

在 Telegram 上有 5 种可能的消息发送者类型：

1. 频道中帖子的作者
2. 在讨论组中从链接的频道的自动转发
3. 正常的用户账户，这包括机器人（即"普通"消息）
4. 管理员代表小组发送（[匿名组管理员](https://telegram.org/blog/filters-anonymous-admins-comments#anonymous-group-admins)）
5. 用户将消息作为其频道之一发送

你可以将过滤查询与其他更新处理机制结合起来，以找出消息作者的类型。

```ts
// 从 `ctx.senderChat` 发送的频道帖子
bot.on("channel_post");

// 从 `ctx.senderChat`频道自动转发
bot.on("message:is_automatic_forward");
// 从 `ctx.from` 发送的常规信息
bot.on("message").filter((ctx) => ctx.senderChat === undefined);
// `ctx.chat` 中的匿名管理员
bot.on("message").filter((ctx) => ctx.senderChat?.id === ctx.chat?.id);
// 其他一切，比如用户作为 `ctx.senderChat` 发送消息
bot.on("message").filter((ctx) =>
  ctx.senderChat !== undefined && ctx.senderChat.id !== ctx.chat.id
);
```

### 按照用户属性筛选

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
    // 处理来自 creator 和 administrator 的消息
  },
);
```

### 复用过滤查询逻辑

在内部，`bot.on` 依赖于一个名为 `matchFilter` 的函数。
它接受一个过滤查询并编译成一个判断函数。
这个判断函数被简单地传递给 `bot.filter`，用于过滤 updates。

如果你想在你自己的逻辑中使用 `matchFilter`，你可以直接导入它。
例如，你可以决定丢弃所有匹配某个查询的 updates：

```ts
// 丢弃所有文本消息或文本频道帖子。
bot.drop(matchFilter(":text"));
```

类似地，你可以使用 grammY 内部的过滤查询类型：

### 复用过滤查询类型

在内部，`matchFilter` 使用 TypeScript 的 [类型预先定义](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) 来缩小 `ctx` 的类型。
它接受一个 `C extends Context` 类型和一个 `Q extends FilterQuery`类型，并生成 `ctx is Filter<C, Q>`。
换句话说，`Filter` 类型是你在中间件中接收到的 `ctx` 的类型。

如果你想在你自己的逻辑中使用 `Filter`，你可以直接导入它。
例如，你可以定义一个处理函数，处理被过滤查询筛选的特定上下文对象：

```ts
function handler(ctx: Filter<Context, ":text">) {
  // 处理缩小的上下文对象
}

bot.on(":text", handler);
```

> 查看并阅读更多 [`matchFilter`](/ref/core/matchfilter)，[`Filter`](/ref/core/filter) 和 [`FilterQuery`](/ref/core/filterquery) 的 API 参考。

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

| Filter 查询                  | L1 部分     | L2 部分      | L3 部分     |
| ---------------------------- | ----------- | ------------ | ----------- |
| `"message"`                  | `"message"` | `undefined`  | `undefined` |
| `"message:entities"`         | `"message"` | `"entities"` | `undefined` |
| `"message:entities:mention"` | `"message"` | `"entities"` | `"mention"` |

### 查询前验证

尽管类型系统应该在编译时捕获所有无效的过滤器查询，但 grammY 在设置时也会在运行时检查所有通过的过滤器查询。
每个通过的过滤器查询都会与一个验证结构相匹配，以检查它是否有效。
在设置过程中立即失败而不是在运行时失败不仅是好事，以前也发生过 TypeScript 中的错误导致复杂的类型推理系统出现严重问题的情况。
如果将来再发生这种情况，查询前验证将防止可能发生的问题。
在这种情况下，你将会得到有用的错误消息。

### 性能

**grammY 可以在每次更新的恒定时间内检查每个 filter 查询**，与查询的结构或传入的更新无关。

filter 查询的验证只发生一次，当 bot 被初始化和 `bot.on()` 被调用时。

在启动时，grammY 从 filter 查询中导出一个函数语句，将其拆分为查询部分。
每个部分都将被映射到一个函数，该函数对对象属性执行一次真值检查，或者如果该部分被省略并且需要检查两个值，则执行两次检查。
然后这些函数被组合成一个语句，这个语句只需要检查与查询相关的值，而不需要对 `Update` 的对象键进行迭代。

这个系统使用的操作比一些同类库要少，这些库在路由更新时需要对数组进行包含性检查。
如你所见，grammY 的 filter 查询系统虽说强大得多，但丝毫不影响效率，反而更快。

### 类型安全

如上所述，filter 查询将自动缩小上下文对象上的某些属性的范围。
从一个或多个 filter 查询派生的谓词是执行此范围缩小的 TypeScript 类型谓词。
一般来说，你可以相信类型推断是正确的。
如果推断存在某个属性，你可以放心地信赖它。
如果推断某个属性可能不存在，则意味着在某些情况下它就是缺失的。
使用 `!` 运算符执行类型转换不是一个好主意。

> 这些情况对你来说可能不是显而易见的。
> 如果你无法弄清楚，请随时在 [群聊](https://t.me/grammyjs) 中提问。

计算这些类型是很复杂的。
grammY 的这一部分涉及到很多关于 Bot API 的知识。
如果你想了解更多有关如何计算这些类型的基本方法，你可以观看 [YouTube 上的演讲](https://youtu.be/ZvT_xexjnMk)（英文，可开启自动翻译的中文字幕）。
