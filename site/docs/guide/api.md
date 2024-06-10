# Bot API

## General Information

Telegram bots communicate with the Telegram servers via HTTP requests.
The Telegram Bot API is the specification of this interface, i.e. a [long list](https://core.telegram.org/bots/api) of methods and data types, commonly called a reference.
It defines everything that Telegram bots can do.
You can find it linked under the Resources tab in the Telegram section.

The setup can be visualized like this:

```asciiart:no-line-numbers
your grammY bot <———HTTP———> Bot API <———MTProto———> Telegram
```

In words: when your bot sends a message, it will be sent as an HTTP request to a _Bot API server_.
This server is hosted at `api.telegram.org`.
It will translate the request to Telegram's native protocol called MTProto, and send a request to the Telegram backend which takes care of sending the message to the user.

Analogously, whenever a user responds, the inverse path is taken.

When you run your bot, you need to decide how the updates should be sent across the HTTP connection.
This can be done with [long polling or webhooks](./deployment-types).

You can also host the Bot API server yourself.
This is mainly useful to send large files, or to decrease latency.

## Calling the Bot API

The Bot API is what defines what bots can and cannot do.
Every single method of the Bot API has an equivalent in grammY, and we make sure to always keep the library in sync with the latest and greatest features for bots.
Example: `sendMessage` in the [Telegram Bot API Reference](https://core.telegram.org/bots/api#sendmessage) and in the [grammY API Reference](/ref/core/api#sendmessage).

### Calling a Method

You can call API methods via `bot.api`, or [equivalently](./context#available-actions) via `ctx.api`:

::: code-group

```ts [TypeScript]
import { Api, Bot } from "grammy";

const bot = new Bot("");

async function sendHelloTo12345() {
  // Send a message to 12345.
  await bot.api.sendMessage(12345, "Hello!");

  // Send a message and store the response, which contains info about the sent message.
  const sentMessage = await bot.api.sendMessage(12345, "Hello again!");
  console.log(sentMessage.message_id);

  // Send a message without the `bot` object.
  const api = new Api(""); // <-- put your bot token between the ""
  await api.sendMessage(12345, "Yo!");
}
```

```js [JavaScript]
const { Api, Bot } = require("grammy");

const bot = new Bot("");

async function sendHelloTo12345() {
  // Send a message to 12345.
  await bot.api.sendMessage(12345, "Hello!");

  // Send a message and store the response, which contains info about the sent message.
  const sentMessage = await bot.api.sendMessage(12345, "Hello again!");
  console.log(sentMessage.message_id);

  // Send a message without the `bot` object.
  const api = new Api(""); // <-- put your bot token between the ""
  await api.sendMessage(12345, "Yo!");
}
```

```ts [Deno]
import { Api, Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot("");

async function sendHelloTo12345() {
  // Send a message to 12345.
  await bot.api.sendMessage(12345, "Hello!");

  // Send a message and store the response, which contains info about the sent message.
  const sentMessage = await bot.api.sendMessage(12345, "Hello again!");
  console.log(sentMessage.message_id);

  // Send a message without the `bot` object.
  const api = new Api(""); // <-- put your bot token between the ""
  await api.sendMessage(12345, "Yo!");
}
```

:::

> Note that `bot.api` is simply an instance of `Api` that is pre-constructed for you for convenience.
> Note also that if you have access to a context object (i.e. you are inside a message handler), it is always preferable to call `ctx.api` or one the [available actions](./context#available-actions).

While `Api` instances cover the entire Bot API, they sometimes change the function signatures a bit to make them more usable.
Strictly speaking, all methods of the Bot API expect a JSON object with a number of properties.
Notice, however, how `sendMessage` in the above code example receives two arguments, a chat identifier and a string.
grammY knows that these two values belong to the `chat_id` and the `text` property, respectively, and will build the correct JSON object for you.

As mentioned [earlier](./basics#sending-messages), you can specify other options in the third argument of type `Other`:

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

### Type Definitions for the Bot API

grammY ships with complete type coverage of the Bot API.
The [`@grammyjs/types`](https://github.com/grammyjs/types) repository contains the type definitions that grammY uses internally.
These type definitions are also directly exported from the core `grammy` package so you can use them in your own code.

#### Type Definitions on Deno

On Deno, you can simply import type definitions from `types.ts`, which is right next to `mod.ts`:

```ts
import { type Chat } from "https://deno.land/x/grammy/types.ts";
```

#### Type Definitions on Node.js

On Node.js, things are more complicated.
You need to import the types from `grammy/types`.
For example, you get access to the `Chat` type like this:

```ts
import { type Chat } from "grammy/types";
```

However, officially, Node.js only supports importing from sub-paths properly since Node.js 16.
Consequently, TypeScript requires the `moduleResolution` to be set to `node16` or `nodenext`.
Adjust your `tsconfig.json` accordingly and add the highlighted line:

```json{4}
{
  "compilerOptions": {
    // ...
    "moduleResolution": "node16"
    // ...
  }
}
```

In some cases, this can also work without adjusting your TypeScript configuration.

::: warning Wrong Autocomplete on Node.js
If you do not change your `tsconfig.json` file as described above, it may happen that your code editor suggests in autocomplete to import types from `grammy/out/client` or something.
**All paths starting with `grammy/out` are internal. Do not use them.**
They could be changed arbitrarily at any point in time, so we strongly advise you to import from `grammy/types` instead.
:::

### Making Raw API Calls

There may be times when you want to use the original function signatures, but still rely on the convenience of the grammY API (e.g. JSON serializing where appropriate).
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

Basically, all parameters of the function signature are merged with the options object when you use the raw API.

## Choosing a Data Center Location

> [Skip](./filter-queries) the rest of the page if you are just getting started.

If you want to reduce the networking latency of your bot, it matters where you host it.

The Bot API server behind `api.telegram.org` is hosted in Amsterdam in the Netherlands.
Therefore, the best location to run your bot is Amsterdam.

::: tip Hosting Comparison
You may be interested in our [comparison on hosting providers](../hosting/comparison#comparison-tables).
:::

However, there might be an even better place to run your bot, although this takes significantly more effort.

[Remember](#general-information) that the Bot API server does not actually contain your bot.
It only relays requests, translates between HTTP and MTProto, and so on.
The Bot API server may be in Amsterdam, but the Telegram servers are distributed across three different locations:

- Amsterdam, Netherlands
- Miami, Florida, United States
- Singapore

Thus, when the Bot API server sends a request to the Telegram servers, it may have to send data halfway around the globe.
Whether or not this happens depends on the data center of the bot itself.
The data center of the bot is the same data center as for the user who created the bot.
The data center of a user depends on many factors, including the location of the user.

Hence, this is what you can do if you want to reduce the latency even further.

1. Contact [@where_is_my_dc_bot](https://t.me/where_is_my_dc_bot) and send a file that was uploaded with your own account.
   It will tell you the location of your user account.
   This is also the location of your bot.
2. If your data center is in Amsterdam, there is nothing you need to do.
   Otherwise, keep reading.
3. Buy a [VPS](../hosting/comparison#vps) in the location of your data center.
4. [Run a local Bot API server](#running-a-local-bot-api-server) on that VPS.
5. Host your bot in the same location as your data center.

That way, each request will only travel the shortest possible distance between Telegram and your bot.

## Running a Local Bot API Server

There are two main advantages to running your own Bot API server.

1. Your bot can send and receive large files.
2. Your bot might have reduced networking delays (see [above](#choosing-a-data-center-location)).

> Other minor advantages are listed [here](https://core.telegram.org/bots/api#using-a-local-bot-api-server).

You must run the Bot API server on a VPS.
It will crash or drop messages if you try to run it somewhere else.

You should also compile the Bot API server from scratch.
It is helpful if you are experienced in compiling large C++ projects, but if you aren't, then you can simply copy the build instructions and hope that they work.

**The easiest way to run the Bot API server is by following the [build instructions generator](https://tdlib.github.io/telegram-bot-api/build.html?os=Linux) provided by Telegram.**

> More options can be found [Bot API server's repository](https://github.com/tdlib/telegram-bot-api#installation).

Building the server gives you an executable that you can run.

Did you obtain that executable?
You can now move your bot to the local Bot API server!

### Logging Out of the Hosted Bot API Server

First, you need to log out of the hosted Bot API server.
Take this URL and paste it into a browser (remember to replace `<token>` with your bot token):

```text
https://api.telegram.org/bot<token>/logOut
```

You should see `{"ok":true,"result":true}`.

### Configuring grammY to Use the Local Bot API Server

Next, you can tell grammY to use your local Bot API server instead of `api.telegram.org`.
Let's say that your bot runs on `localhost` on port 8081.
You should then use the following configuration.

```ts
const bot = new Bot("", { // <-- use the same token as before
  client: { apiRoot: "http://localhost:8081" },
});
```

You can now start your bot again.
It will use the local Bot API server.

> If something went wrong and you have no idea how to fix it no matter how much you google it, don't be shy to join our [community chat](https://t.me/grammyjs) and ask for help!
> We know even less about your mistake than you, but we can probably answer your questions.

Remember that you also have to adjust your code to work with local file paths instead of URLs pointing to your files.
For example, calling `getFile` will give you a `file_path` that points to your local disk, rather than a file that first needs to be downloaded from Telegram.
Similarly, the [files plugin](../plugins/files) has a method called `getUrl` that will no longer return a URL, but an absolute file path instead.

If you ever want to change this configuration again and move your bot to a different server, be sure to read [this section](https://github.com/tdlib/telegram-bot-api#moving-a-bot-to-a-local-server) of the README of the Bot API server repository.
