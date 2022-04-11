---
prev: ./context.md
next: ./filter-queries.md
---

# Bot API

## General Information

Telegram bots communicate with the Telegram servers via HTTP requests.
The Telegram Bot API is the specification of this interface, i.e. a [long list](https://core.telegram.org/bots/api) of methods and data types, commonly called a reference.
It defines everything that Telegram bots can do.
You can find it linked under the Resources tab.

The setup can be visualized like this:

```asciiart:no-line-numbers
( ( ( Telegram ) MTProto API ) Bot HTTP API ) <-- bot connects here
```

In words: when your bot sends a message, it will be sent as an HTTP request to a _Bot API server_ (either hosted by the Telegram team, or [hosted by you](https://core.telegram.org/bots/api#using-a-local-bot-api-server)).
This server will translate the request to Telegram’s native protocol called MTProto, and send a request to the Telegram backend which takes care of sending the message to the user.

Analogously, whenever a user responds, the inverse path is taken.

::: tip Circumventing File Size Limits
The Telegram backend allows your bot to [send files](./files.md) up to 2000 MB.
However, the Bot API server that is responsible for translating the requests to HTTP restricts the file size to 50 MB for downloads and 20 MB for uploads.

Hence, if you circumvent the Bot API server that Telegram runs for you, and simply [host your own Bot API server](https://core.telegram.org/bots/api#using-a-local-bot-api-server), you can allow your bot to send files up to 2000 MB.

> Note: if you are working with large files over [long polling](./deployment-types.md), you should use [grammY runner](/plugins/runner.md).

:::

## Calling the Bot API

Every single method of the Bot API has an equivalent in grammY.
Example: `sendMessage` in the [Telegram Bot API Reference](https://core.telegram.org/bots/api#sendmessage) and in the [grammY API Reference](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/Api#sendMessage).

### Calling a Method

You can call API methods via `bot.api`, or [equivalently](./context.md#available-actions) via `ctx.api`:

```ts
async function sendHelloTo12345() {
  // Send a message to 12345.
  await bot.api.sendMessage(12345, "Hello!");

  // Send a message and store the response, which contains info about the sent message.
  const sentMessage = await bot.api.sendMessage(12345, "Hello again!");
  console.log(sentMessage.message_id);
}
```

While `bot.api` covers the entire Bot API, it sometimes changes the function signatures a bit to make it more usable.
Strictly speaking, all methods of the Bot API expect a JSON object with a number of properties.
Notice, however, how `sendMessage` in the above example receives two arguments, a chat identifier and a string.
grammY knows that these two values belong to the `chat_id` and the `text` property, respectively, and will built the correct JSON object for you.

If you want to specify other options, you do so in the third argument:

```ts
async function sendHelloTo12345() {
  await bot.api.sendMessage(12345, "<i>Hello!</i>", {
    parse_mode: "HTML",
  });
}
```

Moreover, grammY takes care of numerous technical details to simplify the API usage.
As an example, some specific properties in some specific methods have to be `JSON.stringify`ed before they are sent.
This is easy to forget, hard to debug, and it breaks type inference.
grammY allows you to specify objects consistently across the API, and makes sure that the right properties are serialized on the fly before sending them.

### Making Raw API Calls

There may be times when you want to use the original function signatures, but still rely on the convenience of the grammY API (e.g. JSON serialising where appropriate).
grammY supports this via the `bot.api.raw` (or the `ctx.api.raw`) properties.

You can call the raw methods like this:

```ts
async function sendHelloTo12345() {
  await bot.api.raw.sendMessage({
    chat_id: 12345,
    text: "<i>Hello!</i>",
    parse_mode: "HTML",
  });
}
```
