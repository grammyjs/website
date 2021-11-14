---
prev: ./inline-queries.md
next: ./games.md
---

# 文件管理

Telegram bot 不仅仅可以发送和接受文本，并且可以发送任何其他种类的消息，比如图片和视频。
这需要处理在消息中的文件。

## 文件怎么在 Telegram bot 程序中工作

> 这个章节会描述文件怎么在 Telegram bot 程序中工作。
> 如果你想要知道你如何能在 grammY [下载](#接收文件) 和 [上传](#发送文件) 文件。

文件与消息是分开存储的。
Telegram 服务器上的文件由 `file_id` 标识，它是一个长字符串。
比如 `AgADBAADZRAxGyhM3FKSE4qKa-RODckQHxsoABDHe0BDC1GzpGACAAEC` 就是一个 `file_id` 的例子。

当你的 bot **接收**一条伴有文件的消息，它不会直接接受完整的文件数据，会先用 `file_id` 作为代替。
如果你的 bot 确实想要下载这个文件，那么你可以使用 `getFile` 方法来实现（[Telegram Bot API 指南](https://core.telegram.org/bots/api#getfile)）。
这个方法返回给你一个下载这些文件数据的 URL。
需要注意的是这个 URL 的有效时间只有 60 分钟，之后它可能会失效，你可以简单的重新调用 `getFile` 方法获取一个新的链接。

当一个 bot **发送**一条消息，它可以指定一个以前用过的 `file_id`。
这就会发送那个被识别到的文件。
（你也可以上传你自己的文件, [向下滚动](#发送文件) 去查看如何实现。）
你可以多次使用同一个 `file_id`，从而你可以通过同一个 `file_id` 发送同样的文件到五个不同的聊天室。
请确保你使用了正确的方法，例如，你不可以用一个标识图片的 `file_id` 来调用 [`sendVideo`](https://core.telegram.org/bots/api#sendvideo)。

每一个 bot 都有它独立的 `file_id` 集合，集合包含了所有它自己能调用的文件。
你不能将 `file_id` 交给你朋友的 bot 在那里下载。为了区别你的 bot 与其它 bot，另一个 bot 会对同一个文件使用不同的标识符。
这意味着你不能简单的猜测 `file_id` 去随机获取用户的文件，因为 Telegram 会跟踪哪些 `file_id` 在你的 bot 是有效的。

另一方面，同一个文件被定义为不同的 `file_id` 即使是同一个 bot。
这意味你不能通过可靠地比较他们的 `file_id` 来辨别他们两个文件是否一致。
因此如果你需要在一定时间内跨 bot 比较你的两个文件是否相同，你需要使用随每一个 `file_id` 一起接收的 `file_unique_id`。
但是 `file_unique_id` 不能用于下载文件。

## 接收文件

你可以像其他消息一样接收所有文件。
例如，如果你想要听取音频消息，你可以像这样做：

```ts
bot.on("message:voice", async (ctx) => {
  const voice = ctx.msg.voice;

  const duration = voice.duration; // 秒
  await ctx.reply(`Your voice message is ${duration} seconds long.`);

  const fileId = voice.file_id;
  await ctx.reply("The file identifier of your voice note is: " + fileId);

  const file = await ctx.getFile(); // 至少一小时内有效
  const path = file.file_path; // 文件在 BOT API 服务器内的路径
  await ctx.reply("Download your own file again: " + path);
});
```

::: tip 将 file_id 传递给 `getFile` 方法
在上下文对象中的 `getFile` 是一个 [快捷方式](/zh/guide/context.md#shortcuts)，它可以在当前的消息中下载文件。
如果你想要在处理消息的时候拿到不同的文件 - 使用 `ctx.api.getFile(file_id)`。
:::

> 如果你想要去接收所有类型的文件，了解使用 [`:media` 和 `:file` 快捷方式](/zh/guide/filter-queries.md#shortcuts) 用于筛选查询。

你可以通过文件路径知道你在 Telegram Bot API 服务器上的文件地址。
你可以通过 `https://api.telegram.org/file/bot<token>/<file_path>` 再次下载文件，其中 `<token>` 是你自己 bot 的 token，`<file_path>` 要用文件路径代替。

::: tip 文件插件
grammY 不能与本身的文件下载器进行捆绑，但是你可以安装使用 [官方文件插件](/zh/plugins/files.md)。
它允许你通过 `await file.download()` 方法下载文件和通过 `file.getUrl()` 方法获取一个常规构造的 URL。
:::

## 发送文件

Telegram bot 有 [三种方法](https://core.telegram.org/bots/api#sending-files) 去发送文件：

1. 通过 `file_id`，例如发送一个已经在其他聊天中被辨识的文件。
2. 通过 URL，例如传递一个公共的文件 URL 到 Telegram，Telegram 就会下载和发送文件。
3. 通过上传你自己的文件。

### 通过 `file_id` 或者 URL

前两种方法很简单：只需将各自的值作为 `string` 传递，就完成了。

```ts
// 通过 file_id 发送
await ctx.replyWithPhoto(existingFileId);

// 通过 URL 发送
await ctx.replyWithPhoto("https://grammy.dev/Y.png");

// 使用 bot.api.sendPhoto() 或者 ctx.api.sendPhoto()
```

### 上传你自己的文件

grammY 对上传文件有着很好的支持。
您可以通过导入并使用 `InputFile` 类来实现这一点（[grammY API 指南](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#InputFile)）。

```ts
// 通过路径发送文件
await ctx.replyWithPhoto(new InputFile("/tmp/picture.jpg"));

// 使用 bot.api.sendPhoto() 或者 ctx.api.sendPhoto()
```

`InputFile` 构建器不仅仅能适用于文件路径，也可以适用流，`Buffer`对象，异步迭代器，这取决于你所使用的平台。
grammY 会自动的在内部转化所有的文件格式成 `Uint8Array` 对象，构建一个 multipart/form-data 数据流。
所以你需要记住的是：**创造一个 `InputFile` 实例，并且把它传递到任何发送文件的方法**。
`InputFile` 实例能够传递到所有发送上传文件的方法中。

::: warning InputFile 构建器 类型
需要注意的是 [grammY API 指南](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#InputFile) 中对于 `InputFile`，只列出在 Deno 上可用的类型。
如果你在 Node.js 中使用 grammY，检查相应的类型定义或实现，或者相信 TypeScript。
:::

## 文件大小限制

grammY 本身可以不受限制地发送文件，但是 Telegram 在他们的 [文档里](https://core.telegram.org/bots/api#sending-files) 重新规范了文件大小。
这意味着你的 bot 不可以下载大小超过 20 MB 的文件也不能上传超过 50 MB 的文件。
一些文件类型有着更加严格的限制，比如图片。

如果你想要同时支持上传和下载超过 2000 MB 的文件(Telegram 上的最大文件大小)，除了 bot 程序之外，您还必须托管自己的 Bot API 服务器。
请参阅有关此问题的官方文档 [链接](https://core.telegram.org/bots/api#using-a-local-bot-api-server)。

托管一个 Bot API 服务器与 grammY 无关。
然而，grammY 支持在配置 bot 需要调用的所有必要方法。

另外，你可能想要在 [这里](./api.md) 重温一下我们关于 Bot API 的指引文档。
