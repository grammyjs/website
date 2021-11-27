# 文件助手（`files`）

这个插件允许你轻松地从 Telegram 服务器下载文件，并且获取一个URL，以便你自己下载文件。

## 下载文件

你需要传递你的 bot 令牌给这个插件，因为它必须在下载文件时以你的 bot 身份进行认证。
然后这个插件在 `getFile` 调用结果上安装了 `download` 方法。
例子：

<CodeGroup>
  <CodeGroupItem title="TS" active>

```ts
import { Bot, Context } from "grammy";
import { FileFlavor, hydrateFiles } from "@grammyjs/files";

// 添加上下文调味剂
type MyContext = FileFlavor<Context>;

// 创建一个 bot。
const bot = new Bot<MyContext>("");

// 使用插件。
bot.api.config.use(hydrateFiles(bot.token));

// 下载视频和 GIF 到临时位置。
bot.on([":video", ":animation"], async (ctx) => {
  // 准备文件供下载。
  const file = await ctx.getFile();
  // 下载文件到一个临时位置。
  const path = await file.download();
  // 打印文件路径
  console.log("File saved at", path);
});
```

</CodeGroupItem>
 <CodeGroupItem title="JS">

```js
import { Bot } from "grammy";
import { hydrateFiles } from "@grammyjs/files";

// 创建一个 bot。
const bot = new Bot("");

// 使用插件。
bot.api.config.use(hydrateFiles(bot.token));

// 下载视频和 GIF 到临时位置。
bot.on([":video", ":animation"], async (ctx) => {
  // 准备文件供下载。
  const file = await ctx.getFile();
  // 下载文件到一个临时位置。
  const path = await file.download();
  // 打印文件路径。
  console.log("File saved at", path);
});
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  FileFlavor,
  hydrateFiles,
} from "https://deno.land/x/grammy_files/mod.ts";

// 添加上下文调味剂
type MyContext = FileFlavor<Context>;

// 创建一个 bot。
const bot = new Bot<MyContext>("");

// 使用插件。
bot.api.config.use(hydrateFiles(bot.token));

// 下载视频和 GIF 到临时位置。
bot.on([":video", ":animation"], async (ctx) => {
  // 准备文件供下载。
  const file = await ctx.getFile();
  // 下载文件到一个临时位置。
  const path = await file.download();
  // 打印文件路径。
  console.log("File saved at", path);
});
```

</CodeGroupItem>
</CodeGroup>

如果你不想创建临时文件，你可以传递一个文件路径到 `download`。
像这样：`await file.download('/path/to/file')`。

如果你只想获取文件的 URL，以便你自己下载文件，请使用 `file.getUrl`。
这将返回一个你的文件对 HTTPS 链接，这个链接有效的时间至少是一个小时。

## 本地 Bot API 服务器

如果你使用本地 Bot API 服务器，那么 `getFile` 调用有效地下载文件到你的磁盘。

反过来，你可以调用 `file.getUrl()` 以访问这个文件路径。
请注意，`await file.download()` 现在将会将这个本地存在的文件复制到临时位置（或者指定的路径）。

## 支持 `bot.api` 调用

默认情况下，`await bot.api.getFile()` 的结果将会被配备上 `download` 和 `getUrl` 方法。
但是，这并不会在类型中反映出来。
如果你需要这些调用，你应该也安装一个叫作 `FileApiFlavor` 的 [API flavor](/advanced/transformers.html#api-flavoring) 在 bot 对象上。

<CodeGroup>
  <CodeGroupItem title="Node.js" active>

```ts
import { Api, Bot, Context } from "grammy";
import { FileApiFlavor, FileFlavor, hydrateFiles } from "@grammyjs/files";

type MyContext = FileFlavor<Context>;
type MyApi = FileApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");
// ...
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { Api, Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  FileApiFlavor,
  FileFlavor,
  hydrateFiles,
} from "https://deno.land/x/grammy_files/mod.ts";

type MyContext = FileFlavor<Context>;
type MyApi = FileApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");
// ...
```

</CodeGroupItem>
</CodeGroup>

## 插件概述

- 名字：`files`
- 源码：<https://github.com/grammyjs/files>
- 参考：<https://doc.deno.land/https/deno.land/x/grammy_files/mod.ts>
