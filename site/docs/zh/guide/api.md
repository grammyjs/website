# Bot API

## 基本信息

Telegram Bot 通过 HTTP 请求与 Telegram 服务器进行通信。
Telegram Bot 的 API 是这个接口的规范，即一个 [很长的列表](https://core.telegram.org/bots/api)，包括方法和数据类型，我们一般把它称为参考。
它定义了 Telegram Bot 所能做的一切。
你可以在资源标签下 Telegram 的部分找到它的链接。

请求的步骤可以被可视化为这样：

```asciiart:no-line-numbers
你的 grammY bot <———HTTP———> Bot API <———MTProto———> Telegram
```

换句话说：当你的 bot 发送消息时，它将以 HTTP 请求的形式发送到一个 _Bot API服务器_。
这个服务器托管在 `api.telegram.org`。
它会把请求转换成 Telegram 的本地协议，称为 MTProto，并向 Telegram 的后端发送请求，后者负责将信息发送给用户。

类似地，每当用户返回响应时，会采取相反的路径。

当你运行你的 bot 时，你需要决定如何通过 HTTP 连接发送 update。
这可以通过 [长轮询或 webhook](./deployment-types)来实现。

你也可以自己托管 Bot API 服务器。
这主要用于发送大文件或减少延迟。

## 调用 Bot API

Bot API 定义了 bot 能做什么和不能做什么。
Bot API 的每种方法在 grammY 中都有对应方法，我们确保库始终与最新、最强大的 bot 功能保持同步。
例如：[Telegram Bot API 参考](https://core.telegram.org/bots/api#sendmessage) 和 [grammY API 参考](/ref/core/api#sendmessage) 中的 `sendMessage`。

### 调用方法

你可以通过 `bot.api` 调用 API 方法，或者调用 [等价](./context#可用操作) 的 `ctx.api`。

::: code-group

```ts [TypeScript]
import { Api, Bot } from "grammy";

const bot = new Bot("");

async function sendHelloTo12345() {
  // 发送消息给 12345。
  await bot.api.sendMessage(12345, "Hello!");

  // 发送一个消息并存储响应，响应中包含关于所发送消息的信息。
  const sentMessage = await bot.api.sendMessage(12345, "Hello again!");
  console.log(sentMessage.message_id);

  // 不使用 `bot` 对象发送消息。
  const api = new Api(""); // <-- 将你的 bot token 放在 "" 中
  await api.sendMessage(12345, "Yo!");
}
```

```js [JavaScript]
const { Api, Bot } = require("grammy");

const bot = new Bot("");

async function sendHelloTo12345() {
  // 发送消息给 12345。
  await bot.api.sendMessage(12345, "Hello!");

  // 发送一个消息并存储响应，响应中包含关于所发送消息的信息。
  const sentMessage = await bot.api.sendMessage(12345, "Hello again!");
  console.log(sentMessage.message_id);

  // 不使用 `bot` 对象发送消息。
  const api = new Api(""); // <-- 将你的 bot token 放在 "" 中
  await api.sendMessage(12345, "Yo!");
}
```

```ts [Deno]
import { Api, Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot("");

async function sendHelloTo12345() {
  // 发送消息给 12345。
  await bot.api.sendMessage(12345, "Hello!");

  // 发送一个消息并存储响应，响应中包含关于所发送消息的信息。
  const sentMessage = await bot.api.sendMessage(12345, "Hello again!");
  console.log(sentMessage.message_id);

  // 不使用 `bot` 对象发送消息。
  const api = new Api(""); // <-- 将你的 bot token 放在 "" 中
  await api.sendMessage(12345, "Yo!");
}
```

:::

> 请注意，`bot.api` 只是为方便起见而预先构建的 `Api` 的实例。
> 另请注意，如果你可以访问上下文对象（即你在消息处理程序当中），则最好调用 `ctx.api` 或 [可用操作](./context#可用操作)。

虽然 `Api` 实例涵盖了整个 Bot API，但它们有时会对函数签名稍作改动，以使其更易于使用。
严格来说，Bot API 的所有方法都希望有一个带有若干属性的 JSON 对象。
但请注意，上述代码示例中的 `sendMessage` 是如何接收两个参数的：一个聊天标识符和一个字符串。
grammY 知道这两个值分别属于 `chat_id` 和 `text` 属性，并将为你构建正确的 JSON 对象。

正如 [前面](./basics#发送信息) 提到的，你可以在 `Other` 类型的第三个参数中指定其他选项：

```ts
async function sendHelloTo12345() {
  await bot.api.sendMessage(12345, "<i>Hello!</i>", {
    parse_mode: "HTML",
  });
}
```

此外，grammY 还处理了许多技术细节以简化 API 的使用。
例如，在一些特定的方法中，一些特定的属性在发送前必须进行 `JSON.stringify` 处理。
这很容易忘记，很难调试，而且会破坏类型推导。
grammY 允许你在整个 API 中统一的指定对象，并确保正确的属性在发送前就被序列化了。

### Bot API 的类型定义

grammY 提供了完整的 Bot API 的类型覆盖。
[`@grammyjs/types`](https://github.com/grammyjs/types) 仓库包含 grammY 内部使用的类型定义。
这些类型定义也被直接从核心 `grammy` 包中导出，因此你可以在你的代码中使用它们。

#### 在 Deno 中的类型定义

在 Deno 中, 你可以简单地从 `types.ts` 导入类型定义：

```ts
import { type Chat } from "https://deno.land/x/grammy/types.ts";
```

#### 在 Node.js 中的类型定义

在 Node.js 中，事情要复杂一点。
你需要从 `grammy/types` 导入类型。
例如，你可以通过如下方式获取 `Chat` 类型：

```ts
import { type Chat } from "grammy/types";
```

然而，自 Node.js 16 起 Node.js 才正式支持从子路径正确导入。
因此，TypeScript 需要设置 `moduleResolution` 为 `node16` 或 `nodenext`。
调整你的 `tsconfig.json` 并将以下列高亮行添加到配置文件中：

```json
{
  "compilerOptions": {
    // ...
    "moduleResolution": "node16"
    // ...
  }
}
```

在某些情况下，不调整 TypeScript 配置的也行。

::: warning Node.js 中错误的自动补全
如果你不按上述方法修改 `tsconfig.json` 文件，那么你的代码编辑器可能会在自动补全中提示你导入 `grammy/out/client` 或其他东西。
**所有以 `grammy/out` 开头的路径都是内部的。请不要使用它们。**
它们可能在任何时候被改变，所以我们强烈建议你从 `grammy/types` 导入。
:::

### 调用原始方法

有时你可能想使用原始的函数签名，但仍然享受 grammY API 的便利性（例如在适当的时候进行 JSON 序列化）。
grammY 通过 `bot.api.raw`（或 `ctx.api.raw`）属性支持这一点。

你可以像这样调用原始方法：

```ts
async function sendHelloTo12345() {
  await bot.api.raw.sendMessage({
    chat_id: 12345,
    text: "<i>Hello!</i>",
    parse_mode: "HTML",
  });
}
```

基本上，当你使用原始 API 时，函数签名的所有参数都与 options 对象合并。

## 选择数据中心位置

> 如果你刚刚开始学习，请 [跳过](./filter-queries) 本页剩余部分。

如果你想减少 bot 的网络延迟，那么在哪里托管 bot 就很重要。

`api.telegram.org` 背后的 Bot API 服务器托管在荷兰的阿姆斯特丹。
因此，运行 bot 的最佳地点是阿姆斯特丹。

::: tip 托管服务商的对比
你可能会对我们的 [托管服务商的对比](../hosting/comparison#对比表格) 感兴趣。
:::

不过，也许有更好的地方来运行 bot，尽管这需要付出明显更多的努力。

[还记得](#基本信息) Bot API 服务器实际上并不包含你的 bot。
它只负责转发请求、在 HTTP 和 MTProto 之间进行转换等。
Bot API 服务器可能位于阿姆斯特丹，但 Telegram 服务器却分布在三个不同地点：

- 阿姆斯特丹，荷兰
- 迈阿密, 佛罗里达, 美国
- 新加坡

因此，当 Bot API 服务器向 Telegram 服务器发送请求时，可能不得不绕半个地球发送数据。
这种情况是否发生取决于 bot 本身的数据中心。
bot 的数据中心与创建 bot 的用户的数据中心相同。
用户的数据中心取决于许多因素，包括用户所在位置。

因此，如果你想进一步减少延迟，可以这样做。

1. 联系 [@where_is_my_dc_bot](https://t.me/where_is_my_dc_bot) 并发送用你自己的账户上传的文件。
   它会告诉你你的用户账户的位置。
   这也是你的 bot 的位置。
2. 如果你的数据中心位于阿姆斯特丹，你无需做任何事情。
   否则，请继续阅读。
3. 在你的数据中心的位置购买一个 [VPS](../hosting/comparison#vps)。
4. 在这个 VPS 上 [运行一个本地 Bot API 服务器](#运行一个本地-bot-api-服务器)。
5. 将 bot 托管在与数据中心相同的位置。

这样，每个请求只会在 Telegram 和你的 bot 之间以最短的距离传送。

## 运行一个本地 Bot API 服务器

运行自己的 Bot API 服务器有两大优势。

1. 你的 bot 可以发送和接收大文件。
2. 你的 bot 可能减少了网络延迟（见 [上文](#选择数据中心位置)）。

> 其他次要优点在 [此处](https://core.telegram.org/bots/api#using-a-local-bot-api-server) 列出。

你必须在一个 VPS 上运行 Bot API 服务器。
如果你尝试在其他地方运行，它就会崩溃或丢失信息。

你还应该从头开始编译 Bot API 服务器。
如果你有编译大型 C++ 项目的经验，这对你很有帮助，但如果你没有，你可以简单地复制编译指令，并希望它们能正常工作。

**运行 Bot API 服务器的最简单方法是使用 Telegram 提供的 [构建指令生成器](https://tdlib.github.io/telegram-bot-api/build.html?os=Linux)。**

> 更多选项请参见 [Bot API 服务器的仓库](https://github.com/tdlib/telegram-bot-api#installation)。

构建服务器后，你就会获得一个可以运行的可执行文件。

你获得那个可执行文件了吗？
现在，你可以将你的 bot 移至本地 Bot API 服务器了！

### 退出托管的 Bot API 服务器

首先，你需要退出托管的 Bot API 服务器。
将此 URL 粘贴到浏览器中（别忘了把 `<token>` 替换成你的 bot token）：

```text
https://api.telegram.org/bot<token>/logOut
```

你会看到 `{"ok":true,"result":true}`。

### 配置 grammY 使用本地 Bot API 服务器

接下来，你就可以告诉 grammY 使用你本地的 Bot API 服务器，而不是 `api.telegram.org`。
假设你的 bot 在 `localhost` 的 8081 端口上运行。
你应该使用以下配置。

```ts
const bot = new Bot("", { // <-- 使用跟前面一样的 token
  client: { apiRoot: "http://localhost:8081" },
});
```

现在你可以再次启动 bot。
它将使用本地 Bot API 服务器。

> 如果出了问题，无论你怎么谷歌都不知道如何解决，请不要害羞，加入我们的 [社区聊天](https://t.me/grammyjs) 并寻求帮助！
> 我们比你更不了解你的错误，但我们也许能回答你的问题。

请记住，你还需要修改代码来使用本地文件路径，而不是指向你的文件的 URL。
例如，调用 `getFile` 会得到一个指向本地磁盘的 `file_path` 而不是一个需要先从 Telegram 下载的文件。
类似地，[文件插件](../plugins/files) 有一个名为 `getUrl` 的方法，该方法不再返回 URL，而是返回文件的绝对路径。

如果你想再次更改配置并将你的 bot 移到另一个服务器上，请务必阅读 Bot API 服务器仓库 README 的 [这一节](https://github.com/tdlib/telegram-bot-api#moving-a-bot-to-a-local-server)。
