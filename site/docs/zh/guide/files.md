---
prev:
  link: ./inline-queries
next:
  link: ./games
---

# 文件管理

Telegram bot 不仅可以发送和接受文本，还可以发送许多其他种类的消息，比如图片和视频。
这需要处理在消息中的文件。

## 文件怎么在 Telegram bot 程序中工作

> 这个章节会描述文件怎么在 Telegram bot 程序中工作。
> 如果你想要知道你如何能在 grammY [下载](#接收文件) 和 [上传](#发送文件) 文件。

文件与消息是分开存储的。
Telegram 服务器上的文件由 `file_id` 标识，它是一个长字符串。

比如 `AgADBAADZRAxGyhM3FKSE4qKa-RODckQHxsoABDHe0BDC1GzpGACAAEC` 就是一个 Telegram `file_id` 的例子。

当你的 bot **接收**一条伴有文件的消息时，它不会直接接受完整的文件数据，会先用 `file_id` 作为代替。
如果你的 bot 确实想要下载这个文件，那么你可以使用 `getFile` 方法来实现（[Telegram Bot API 指南](https://core.telegram.org/bots/api#getfile)）。
这个方法返回给你一个下载这些文件数据的 URL。
需要注意的是这个 URL 只有 60 分钟的有效期。失效后，你需要重新调用 `getFile` 方法获取一个新的链接。

每当你的 bot **发送**带有文件的消息时，它将收到关于发送的消息的信息，包括发送的文件的 `file_id`。
这意味着 bot 看到的所有的文件，无论是发送还是接收，都会向 bot 提供一个 `file_id`。

当一个 bot 发送一条消息，它可以**指定一个以前用过的 `file_id`**。
这就会发送那个被识别到的文件。
（要查看如何上传你自己的文件，请 [向下滚动](#发送文件)。）
你可以多次使用同一个 `file_id`，从而你可以通过同一个 `file_id` 发送同样的文件到五个不同的聊天室。
但是，请确保你使用了正确的方法 ---- 例如，你不可以用一个标识图片的 `file_id` 来调用 [`sendVideo`](https://core.telegram.org/bots/api#sendvideo)。

每一个 bot 都有它独立的 `file_id` 集合，集合包含了所有它自己能调用的文件。
你不能可靠地使用你朋友的机器人的 `file_id`，来访问你的机器人的文件。每个机器人会对同一个文件使用不同的标识符。
这意味着你不能简单地猜测一个 `file_id` 并访问一些随机的人的文件，因为 Telegram 会跟踪哪些 `file_id` 对你的机器人有效。

::: warning 使用外部的 file_ids
请注意，在某些情况下，在技术上完全可能会从另一个 bot 中得到可以正确工作的 `file_id`。
**但是**， 使用这种外部的 `file_id` 是危险的，因为它可能在任何时候停止工作，并且不会有警告。
所以，请确保你使用的 `file_id` 只是你的 bot 的。
:::

另一方面，同一个文件被定义为不同的 `file_id` 即使是同一个 bot。
这意味你不能通过可靠地比较他们的 `file_id` 来辨别他们两个文件是否一致。
因此如果你需要在一定时间内跨 bot 比较你的两个文件是否相同，你需要使用随每一个 `file_id` 一起接收的 `file_unique_id`。
但是 `file_unique_id` 不能用于下载文件。

## 接收文件

你可以像其他消息一样处理文件。
例如，如果你想要听取音频消息，你可以像这样做：

```ts
bot.on("message:voice", async (ctx) => {
  const voice = ctx.msg.voice;

  const duration = voice.duration; // 秒
  await ctx.reply(`Your voice message is ${duration} seconds long.`);

  const fileId = voice.file_id;
  await ctx.reply("The file identifier of your voice message is: " + fileId);

  const file = await ctx.getFile(); // 至少一小时内有效
  const path = file.file_path; // 文件在 Bot API 服务器内的路径
  await ctx.reply("Download your own file again: " + path);
});
```

::: tip 传入一个自定义个 file_id 给 `getFile` 方法
在上下文对象中，`getFile` 是一个 [快捷方式](./context#快捷方式)，它可以在当前的消息中下载文件。
如果你想要在处理消息的时候拿到不同的文件，请使用 `ctx.api.getFile(file_id)`。
:::

> 如果你想要去接收所有类型的文件，了解使用 [`:media` 和 `:file` 快捷方式](./filter-queries#快捷方式) 用于筛选查询。

一旦你调用了 `getFile`，你可以使用返回的 `file_path` 下载文件，使用这个 URL `https://api.telegram.org/file/bot<token>/<file_path>`，其中 `<token>` 必须用你的 bot token 替换。

::: tip 文件插件
grammY 没有捆绑自己的文件下载器，但是你可以安装 [官方文件插件](../plugins/files)。
这允许你通过 `await file.download()` 下载文件，以及通过 `file.getUrl()` 获取一个下载文件的 URL。
:::

## 发送文件

Telegram bot 有 [三种方法](https://core.telegram.org/bots/api#sending-files) 去发送文件：

1. 通过`file_id`，即通过一个已经被机器人知道的标识符来发送文件。
2. 通过URL，即通过传递一个公共文件 URL，由 Telegram 为你下载和发送。
3. 通过上传你自己的文件。

在所有情况下，你需要调用的方法名都是相同的。
根据你选择的三种发送文件的方式中的哪一种，这些函数的参数将有所不同。
比如说，要发送一张照片，你可以使用 `ctx.replyWithPhoto`（或者 `sendPhoto`，如果你使用 `ctx.api` 或 `bot.api`）。

你可以通过简单地重命名方法并更改传递给它的数据的类型来发送其他类型的文件
要发送一个视频，你可以使用 `ctx.replyWithVideo`。
对于发送文档也是同样的情况：`ctx.replyWithDocument`。
你明白了吧。

让我们深入了解三种发送文件的方式。

### 通过 `file_id` 或者 URL

前两种方法很简单：只需将各自的值作为 `string` 传递即可。

```ts
// 通过 file_id 发送
await ctx.replyWithPhoto(existingFileId);

// 通过 URL 发送
await ctx.replyWithPhoto("https://grammy.dev/images/Y.webp");

// 或者，你可以使用 bot.api.sendPhoto() 或 ctx.api.sendPhoto()
```

### 上传你自己的文件

grammY 对上传文件有着很好的支持。
您可以通过导入并使用 `InputFile` 类来实现这一点（[grammY API 指南](https://deno.land/x/grammy/mod.ts?s=InputFile)）。

```ts
// 通过本地路径发送文件
await ctx.replyWithPhoto(new InputFile("/tmp/picture.jpg"));

// 或者，使用 bot.api.sendPhoto() 或 ctx.api.sendPhoto()
```

`InputFile` 构建器不仅仅能适用于文件路径，也可以适用流，`Buffer` 对象，异步迭代器，这取决于你所使用的平台。
所以你需要记住的是：**创造一个 `InputFile` 实例，并且把它传递到任何发送文件的方法**。
`InputFile` 实例能够传递到所有发送上传文件的方法中。

下面是一些关于如何构建 `InputFile` 的例子。

#### 从硬盘中上传一个文件

如果你的机器中已经存储了一个文件，你可以让 garmmY 上传这个文件。

:::code-group

```ts [Node.js]
import { createReadStream } from "fs";

// 发送一个本地文件。
new InputFile("/path/to/file");

// 从一个读文件流中发送。
new InputFile(createReadStream("/path/to/file"));
```

```ts [Deno]
// 发送一个本地文件。
new InputFile("/path/to/file");

// 发送一个 `Deno.FsFile` 实例。
new InputFile(await Deno.open("/path/to/file"));
```

:::

#### 上传原始二进制数据

你也可以发送一个 `Buffer` 对象，或者一个产生 `Buffer` 对象的迭代器。
在 Deno 中，你也可以发送 `Blob` 对象。

:::code-group

```ts [Node.js]
// 发送一个 buffer 或者一个 byte 数组。
const buffer = Uint8Array.from([65, 66, 67]);
new InputFile(buffer); // "ABC"
// 发送可迭代的数据。
new InputFile(function* () {
  // "ABCABCABCABC"
  for (let i = 0; i < 4; i++) yield buffer;
});
```

```ts [Deno]
// 发送一个 blob。
const blob = new Blob("ABC", { type: "text/plain" });
new InputFile(blob);
// 发送一个 buffer 或一个 byte 数组。
const buffer = Uint8Array.from([65, 66, 67]);
new InputFile(buffer); // "ABC"
// 发送可迭代的数据。
new InputFile(function* () {
  // "ABCABCABCABC"
  for (let i = 0; i < 4; i++) yield buffer;
});
```

:::

#### 下载和重新上传文件

你甚至可以让 grammY 从网上下载一个文件。
这实际上不会保存文件到你的磁盘上。
相反，grammY 将只通过管道传输数据，并且只在内存中保留一小段数据。
这是非常高效的。

> 请注意，Telegram 支持用许多种方法为你下载文件。
> 如果可能，你应该选择 [通过 URL 发送文件](#通过-file-id-或者-url)，而不是使用 `InputFile` 来通过你的服务器流式传输文件内容。

:::code-group

```ts [Node.js]
import { URL } from "url";
// 下载一个文件，并将响应的内容流转到 Telegram。
new InputFile(new URL("https://grammy.dev/images/Y.webp"));
new InputFile({ url: "https://grammy.dev/images/Y.webp" }); // 等价的写法
```

```ts [Deno]
// 下载一个文件，并将响应的内容流转到 Telegram。
new InputFile(new URL("https://grammy.dev/images/Y.webp"));
new InputFile({ url: "https://grammy.dev/images/Y.webp" }); // 等价的写法
```

:::

### 添加一个标题

正如 [前面](./basics#发送信息) 所解释的，当发送文件时，你可以在 `Other` 类型的选项对象中指定更多的选项。
例如，这让你可以指定文件的标题。

```ts
// 发送一个本地文件给用户 1235，并且添加一个标题 "photo.jpg"。
await bot.api.sendPhoto(12345, new InputFile("/path/to/photo.jpg"), {
  caption: "photo.jpg",
});
```

一如既往，就像所有其他 API 方法一样，你可以通过 `ctx` (最简单的)，`ctx.api` 或 `bot.api` 来发送文件。

## 文件大小限制

grammY 本身可以不受限制地发送文件，但是 Telegram 在他们的 [文档里](https://core.telegram.org/bots/api#sending-files) 重新规范了文件大小。
这意味着你的 bot 不可以下载大小超过 20 MB 的文件也不能上传超过 50 MB 的文件。
一些文件类型有着更加严格的限制，比如图片。

如果你想要同时支持上传和下载超过 2000 MB 的文件（Telegram 上的最大文件大小），除了 bot 程序之外，您还必须托管自己的 Bot API 服务器。
请参阅有关此问题的官方文档 [链接](https://core.telegram.org/bots/api#using-a-local-bot-api-server)。

托管一个 Bot API 服务器与 grammY 无关。
然而，grammY 支持在配置 bot 需要调用的所有必要方法。

另外，你可能想要在 [这里](./api) 重温一下我们关于 Bot API 的指引文档。
