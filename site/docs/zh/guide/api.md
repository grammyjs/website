---
prev: ./context.md
next: ./filter-queries.md
---

# Bot API

## 基本信息

Telegram Bot 通过 HTTP 请求与 Telegram 服务器进行通信。
Telegram Bot 的 API 是这个接口的规范，即一个 [很长的列表](https://core.telegram.org/bots/api)，包括方法和数据类型，我们一般把它称为参考。
它定义了 Telegram Bot 所能做的一切。
你可以在资源标签下找到它的链接。

请求的步骤可以被可视化为这样：

```asciiart:no-line-numbers
( ( ( Telegram ) MTProto API ) Bot HTTP API ) <-- bot 在此连接
```

换句话说：当你的 bot 发送消息时，它将以 HTTP 请求的形式发送到一个 _Bot API服务器_（由 Telegram 团队托管，或者 [由你自己托管](https://core.telegram.org/bots/api#using-a-local-bot-api-server)）。
这个服务器将把请求转换成 Telegram 的本地协议，称为 MTProto，并向 Telegram 的后端发送请求，后者负责将信息发送给用户。

类似地，每当用户返回响应时，会采取相反的路径。

::: tip 绕过文件大小限制
Telegram 的后端允许你的 bot [发送文件](./files.md)，最大容量为 2000 MB 。
负责将请求转换为 HTTP 的 Bot API 服务器将文件大小限制为下载 50 MB，上传 20 MB。

因此，如果你绕过 Telegram 为你运行的 Bot API 服务器，[使用你自己托管的 Bot API 服务器](https://core.telegram.org/bots/api#using-a-local-bot-api-server)，你可以允许向你的 bot 发送最大可达 2000 MB 的文件。

> 注意：如果你在 [长轮询](./deployment-types.md) 上处理大文件，你应该使用 [grammY runner](/zh/plugins/runner.md)。

:::

## 调用 Bot API

Bot API 的每一个方法在 grammY 中都有对应的方法。
例如：[Telegram Bot API 参考](https://core.telegram.org/bots/api#sendmessage) 和 [grammY API 参考](https://doc.deno.land/https://deno.land/x/grammy/mod.ts#Api) 中的 `sendMessage`。

### 调用方法

你可以通过 `bot.api` 调用 API 方法，或者调用 [等价](./context.md#可用操作) 的 `ctx.api`。

```ts
async function sendHelloTo12345() {
  // 发送消息给 12345。
  await bot.api.sendMessage(12345, "Hello!");

  // 发送一个消息并存储响应，响应中包含关于所发送消息的信息。
  const sentMessage = await bot.api.sendMessage(12345, "Hello again!");
  console.log(sentMessage.message_id);
}
```

`bot.api` 涵盖了整个 Bot API，但其中部分会对函数签名做一些改变，以使其更实用。
严格来说，Bot API 的所有方法都希望有一个带有若干属性的 JSON 对象。
但请注意，上例中的 `sendMessage` 如何接收两个参数？即一个聊天标识符和一个字符串。
grammY 知道这两个值分别属于 `chat_id` 和 `text` 属性，并将为你构建正确的 JSON 对象。

如果你想指定其他选项，你可以在第三个参数中指定：

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
