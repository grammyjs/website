---
prev: ./inline-queries.md
next: ./games.md
---

# File Handling

Telegram bots cannot only send and receive text messages, but also all other kinds of messages, such as photos and videos.
This involves handling the files that are attached to the messages.

## How Files Work for Telegram Bots

> This section explains how files work for Telegram bots.
> If you want to know how you can work with files in grammY scroll down for [downloading](#receiving-files) and [uploading](#sending-files) files.

Files are stored seperately from messages.
A file on the Telegram servers is identified by a `file_id`, which is just a long string of characters.

`AgADBAADZRAxGyhM3FKSE4qKa-RODckQHxsoABDHe0BDC1GzpGACAAEC` is an example for such a `file_id`.

Whenever your bot **receives** a message, it will in fact not directly receive the complete file data, but only the `file_id` instead.
If your bot actually wants to download the file then, it can do so by the `getFile` method ([Telegram Bot API reference](https://core.telegram.org/bots/api#getfile)).
This method gives you a URL to download the file data.
Note that the URL is only valid for at least 60 minutes, then it may expire and you have to call `getFile` again to obtain a new link.

When a bot **sends** a message, it can specify a `file_id` that is has seen before.
This will then send the identified file.
(You can also upload your own files, [scroll down](#sending-files) to see how.)
You can reuse the same `file_id` as often as you want, so you could send the same file to five different chats, always with the same `file_id`.
Make sure to use the correct method—for instance, you cannot use a `file_id` that identifies a photo when calling [`sendVideo`](https://core.telegram.org/bots/api#sendvideo).

Every bot has its own set of `file_id`s for the files that it can access.
You cannot give the `file_id` to your friend's bot to download it there, as another bot will use a different identifier for the same file.
This implies that you cannot simply guess a `file_id` and access some random person's file, because Telegram keeps track of what `file_id`s are valid for your bot.

On the other hand, it can happen that the same file is identified by different `file_id`s even for the same bot.
That means that you cannot reliably compare `file_id`s to check if two files are the same.
In cases where you do need to identify the same file over time and across bots, you should use the value for `file_unique_id` that your bot receives along with every `file_id`.
The `file_unique_id` cannot be used to download files.

## Receiving Files

You can receive all files just like any other message.
For instance, if you want to listen for voice messages, you can do this:

```ts
bot.on("message:voice", async (ctx) => {
  const voice = ctx.msg.voice;

  const duration = voice.duration; // seconds
  await ctx.reply(`Your voice message is ${duration} seconds long.`);

  const fileId = voice.file_id;
  await ctx.reply("The file identifier of your voice note is: " + fileId);

  const file = await ctx.getFile(); // valid for 1 hour
  const path = file.file_path; // file path on Bot API server
  await ctx.reply("Download your own file again: " + path);
});
```

::: tip Passing file_id to getFile
On context object `getFile` is [a shortcut](/guide/context.md#shortcuts) that will get you a file from current message.
If you want to get another file while handling a message - use `ctx.api.getFile(file_id)`.
:::

> Check out [the `:media` and `:file` shortcuts](/guide/filter-queries.md#shortcuts) for filter queries if you want to receive any kind of file.

You can use the file path to know where on the Telegram Bot API servers your file resides.
You can then download it again using the URL `https://api.telegram.org/file/bot<token>/<file_path>` where `<token>` must be replaced by your bot token, and `<file_path>` must be replaced by the file path.

::: tip Files Plugin
grammY does not ship its own file downloader, but you can install it using [the official files plugin](/plugins/files.md).
It allows you to download files via `await file.download()`, and to obtain their URL via `file.getUrl()`.
:::

## Sending Files

Telegram bots have [three ways](https://core.telegram.org/bots/api#sending-files) to send files:

1. Via `file_id`, i.e. by sending a file by identifier that already exists in another chat.
2. Via URL, i.e. by passing a public file URL to Telegram that will in turn download and send the file.
3. Via uploading your own file.

### Via `file_id` or URL

The first two means are simple: you just pass the respective value as `string` and you're done.

```ts
// Sending by file_id
await ctx.replyWithPhoto(existingFileId);

// Sending by URL
await ctx.replyWithPhoto("https://avatars.githubusercontent.com/u/81446018");

// or use bot.api.sendPhoto() or ctx.api.sendPhoto()
```

### Uploading Your Own File

grammY has good support for uploading your own files.
You can do this by importing and using the `InputFile` class ([grammY API Reference](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#InputFile)).

```ts
// Send a file via path
await ctx.replyWithPhoto(new InputFile("/tmp/picture.jpg"));

// or use bot.api.sendPhoto() or ctx.api.sendPhoto()
```

The `InputFile` constructor not only takes file paths, but also streams, `Buffer` objects, async iterators, and—depending on your platform—more.
grammY will automatically convert all file formats to `Uint8Array` objects internally, and build a multipart/form-data stream from them.
All you need to remember is: **create an instance of `InputFile` and pass it to any method to send a file**.
Instances of `InputFile` can be passed to all methods that accept sending files by upload.

::: warning InputFile Constructor Types
Note that the [grammY API Reference](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#InputFile) for `InputFile` lists only the types that are available on Deno.
If you use grammY on Node.js, check out the respective type definition or implementation, or trust TypeScript.
:::

## File Size Limits

grammY itself can send files without size limit, however, Telegram restricts the file size as they document [here](https://core.telegram.org/bots/api#sending-files).
This means that your bot cannot download files larger than 20 MB, and it cannot upload files larger than 50 MB.
Some file types have even stricter limits, such as photos.

If you want to support files up to 2000 MB (maximal file size on Telegram) for both uploading and downloading, you must host your own Bot API server in addition to your bot.
Refer to the official documentation about this [here](https://core.telegram.org/bots/api#using-a-local-bot-api-server).

Hosting a Bot API server has in itself nothing to do with grammY.
However, grammY supports all necessary methods that you need to invoke when configuring your bot to use it.

Also, you may want to revisit an earlier chapter of this guide about the setup of the Bot API [here](./api.md).
