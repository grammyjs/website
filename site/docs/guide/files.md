---
prev: ./inline-queries.md
next: ./sessions.md
---

# File handling

Telegram bots have three ways to send files:

1. Via `file_id`, i.e. by sending a file by identifier that already exists in another chat.
2. Via URL, i.e. by passing a public file URL to Telegram that will in turn download and send the file.
3. Via uploading your own file.

## Via file_id or URL

The first two means are simple: you just pass the respective value as `string` and you're done.

```ts
// Sending by file_id
await ctx.replyWithPhoto(existingFileId);

// Sending by URL
await ctx.replyWithPhoto("https://avatars.githubusercontent.com/u/81446018");

// or use bot.api.sendPhoto() or ctx.api.sendPhoto()
```

> Revisit the section about sending files in the [Telegram Bot API Reference](https://core.telegram.org/bots/api#sending-files) to read more about sending files via `file_id` or URL.

## Uploading your own file

grammY has good support for uploading your own files.
You can do this by importing and using the `InputFile` class.

```ts
// Send a file via path
await ctx.replyWithPhoto(new InputFile("/tmp/picture.jpg"));

// or use bot.api.sendPhoto() or ctx.api.sendPhoto()
```

The `InputFile` constructor not only takes file paths, but also streams, `Buffer` objects, async iterators, and—depending on your platform—more.
grammY will automatically convert all file formats to `Uint8Array` objects internally, and build a multipart/form-data stream from them.
Instances of `InputFile` can be passed to all methods that accept sending files by upload.

::: warning InputFile constructor types
Note that the [grammY API Reference](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#InputFile) for `InputFile` lists only the types that are available on Deno.
If you use grammY on Node.js or in the browser, check out the respective type definitions or implementation.
:::

## File size limits

grammY itself can send files without size limit, however, Telegram restricts the file size as they document [here](https://core.telegram.org/bots/api#sending-files).
This means that your bot cannot download files larger than 20 MB, and it cannot upload files larger than 50 MB.

If you want to support files up to 2000 MB (maximal file size on Telegram) for both uploading and downloading, you must host your own Bot API server.
Refer to the official documentation about this [here](https://core.telegram.org/bots/api#using-a-local-bot-api-server).
grammY supports all necessary methods that you need to invoke while configuring your bot to use it.

Also, you may want to revisit an earlier chapter of this guide about the setup of the Bot API [here](./api.html).
