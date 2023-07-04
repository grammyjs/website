# File Handling

Telegram bots can not only send and receive text messages, but also many other kinds of messages, such as photos and videos.
This involves handling the files that are attached to the messages.

## How Files Work for Telegram Bots

> This section explains how files work for Telegram bots.
> If you want to know how you can work with files in grammY scroll down for [downloading](#receiving-files) and [uploading](#sending-files) files.

Files are stored separately from messages.
A file on the Telegram servers is identified by a `file_id`, which is just a long string of characters.

`AgADBAADZRAxGyhM3FKSE4qKa-RODckQHxsoABDHe0BDC1GzpGACAAEC` is an example of a `file_id`.

Whenever your bot **receives** a message with a file, it will in fact not directly receive the complete file data, but only the `file_id` instead.
If your bot actually wants to download the file, then it can do so by calling the `getFile` method ([Telegram Bot API reference](https://core.telegram.org/bots/api#getfile)).
This method enables you to download the file by constructing a special, temporary, URL.
Note that this URL is only guaranteed to be valid for 60 minutes, after which it may expire. In this case, you can simply call `getFile` again.

Whenever your bot **sends** a message with a file, it will receive information about the sent message, including the `file_id` of the sent file.
This means that all files the bot sees, both via sending or receiving, will make a `file_id` available to the bot.

When a bot sends a message, it can **specify a `file_id` that it has seen before**.
This will allow it to send the identified file, without needing to upload the data for it.
(To see how to upload your own files, [scroll down](#sending-files).)
You can reuse the same `file_id` as often as you want, so you could send the same file to five different chats, using the same `file_id`.
However, you must make sure to use the correct method---for example, you cannot use a `file_id` that identifies a photo when calling [`sendVideo`](https://core.telegram.org/bots/api#sendvideo).

Every bot has its own set of `file_id`s for the files that it can access.
You cannot reliably use a `file_id` from your friend's bot, to access a file with _your_ bot.
Each bot will use different identifiers for the same file.
This implies that you cannot simply guess a `file_id` and access some random person's file, because Telegram keeps track of which `file_id`s are valid for your bot.

::: warning Using Foreign file_ids
Note that in some cases it _is_ technically possible that a `file_id` from another bot seems to work correctly.
**However**, using a foreign `file_id` like this is dangerous as it can stop working at any time, without warning.
So, always ensure that any `file_id`s you use were originally for your bot.
:::

On the other hand, it is possible that a bot eventually sees the same file identified by different `file_id`s.
This means that you cannot rely on comparing `file_id`s to check if two files are the same.
If you need to identify the same file over time (or across multiple bots), you should use the `file_unique_id` value that your bot receives along with every `file_id`.
The `file_unique_id` cannot be used to download files, but will be the same for any given file, across every bot.

## Receiving Files

You can handle files just like any other message.
For example, if you want to listen for voice messages, you can do this:

```ts
bot.on("message:voice", async (ctx) => {
  const voice = ctx.msg.voice;

  const duration = voice.duration; // in seconds
  await ctx.reply(`Your voice message is ${duration} seconds long.`);

  const fileId = voice.file_id;
  await ctx.reply("The file identifier of your voice message is: " + fileId);

  const file = await ctx.getFile(); // valid for at least 1 hour
  const path = file.file_path; // file path on Bot API server
  await ctx.reply("Download your own file again: " + path);
});
```

::: tip Passing a Custom file_id to getFile
On the context object, `getFile` is a [shortcut](./context#shortcuts), and will fetch information for a file on the current message.
If you want to get a different file while handling a message, use `ctx.api.getFile(file_id)` instead.
:::

> Check out the [`:media` and `:file` shortcuts](./filter-queries#shortcuts) for filter queries if you want to receive any kind of file.

Once you have called `getFile`, you can use the returned `file_path` to download the file using this URL `https://api.telegram.org/file/bot<token>/<file_path>`, where `<token>` must be replaced by your bot token.

::: tip Files Plugin
grammY does not come bundled with its own file downloader, but you can install the [official files plugin](../plugins/files).
This allows you to download files via `await file.download()`, and to obtain a download URL for them via `file.getUrl()`.
:::

## Sending Files

Telegram bots have [three ways](https://core.telegram.org/bots/api#sending-files) to send files:

1. Via `file_id`, i.e. by sending a file by an identifier that is already known to the bot.
2. Via URL, i.e. by passing a public file URL, which Telegram downloads and sends for you.
3. Via uploading your own file.

In all cases, the methods you need to call are named the same.
Depending on which of the three ways you pick to send your file, the parameters to these functions will vary.
For example, to send a photo, you can use `ctx.replyWithPhoto` (or `sendPhoto` if you use `ctx.api` or `bot.api`).

You can send other types of files by simply renaming the method and changing the type of the data you pass to it.
In order to send a video, you can use `ctx.replyWithVideo`.
It's the same case for a document: `ctx.replyWithDocument`.
You get the idea.

Let's dive into what the three ways of sending a file are.

### Via `file_id` or URL

The first two methods are simple: you just pass the respective value as a `string`, and you're done.

```ts
// Send via file_id.
await ctx.replyWithPhoto(existingFileId);

// Send via URL.
await ctx.replyWithPhoto("https://grammy.dev/images/Y.jpeg");

// Alternatively, you use bot.api.sendPhoto() or ctx.api.sendPhoto().
```

### Uploading Your Own Files

grammY has good support for uploading your own files.
You can do this by importing and using the `InputFile` class ([grammY API Reference](https://deno.land/x/grammy/mod.ts?s=InputFile)).

```ts
// Send a file via local path
await ctx.replyWithPhoto(new InputFile("/tmp/picture.jpg"));

// alternatively, use bot.api.sendPhoto() or ctx.api.sendPhoto()
```

The `InputFile` constructor not only takes file paths, but also streams, `Buffer` objects, async iterators, and---depending on your platform---more, or a function that creates any of these things.
All you need to remember is: **create an instance of `InputFile` and pass it to any method to send a file**.
Instances of `InputFile` can be passed to all methods that accept sending files by upload.

Here are some examples on how you can construct `InputFile`s.

#### Uploading a File From Disk

If you already have a file stored on your machine, you can let grammY upload this file.

::: code-group

```ts [Node.js]
import { createReadStream } from "fs";

// Send a local file.
new InputFile("/path/to/file");

// Send from a read stream.
new InputFile(createReadStream("/path/to/file"));
```

```ts [Deno]
// Send a local file.
new InputFile("/path/to/file");

// Send a `Deno.FsFile` instance.
new InputFile(await Deno.open("/path/to/file"));
```

:::

#### Uploading Raw Binary Data

You can also send a `Buffer` object, or an iterator that yields `Buffer` objects.
On Deno, you can send `Blob` objects, too.

::: code-group

```ts [Node.js]
// Send a buffer or a byte array.
const buffer = Uint8Array.from([65, 66, 67]);
new InputFile(buffer); // "ABC"
// Send an iterable.
new InputFile(function* () {
  // "ABCABCABCABC"
  for (let i = 0; i < 4; i++) yield buffer;
});
```

```ts [Deno]
// Send a blob.
const blob = new Blob("ABC", { type: "text/plain" });
new InputFile(blob);
// Send a buffer or a byte array.
const buffer = Uint8Array.from([65, 66, 67]);
new InputFile(buffer); // "ABC"
// Send an iterable.
new InputFile(function* () {
  // "ABCABCABCABC"
  for (let i = 0; i < 4; i++) yield buffer;
});
```

:::

#### Downloading and Reuploading a File

You can even make grammY download a file from the internet.
This will not actually save the file on your disk.
Instead, grammY will only pipe through the data, and only keep a small chunk of it in memory.
This is very efficient.

> Note that Telegram supports downloading the file for you in many methods.
> If possible, you should prefer to [send the file via URL](#via-file-id-or-url), instead of using `InputFile` to stream the file contents through your server.

::: code-group

```ts [Node.js]
import { URL } from "url";

// Download a file, and stream the response to Telegram.
new InputFile(new URL("https://grammy.dev/images/Y.jpeg"));
new InputFile({ url: "https://grammy.dev/images/Y.jpeg" }); // equivalent
```

```ts [Deno]
// Download a file, and stream the response to Telegram.
new InputFile(new URL("https://grammy.dev/images/Y.jpeg"));
new InputFile({ url: "https://grammy.dev/images/Y.jpeg" }); // equivalent
```

:::

### Adding a Caption

When sending files, you can specify further options in an options object of type `Other`, exactly as explained [earlier](./basics#sending-messages).
For example, this lets you send captions.

```ts
// Send a photo from a local file to user 1235 with the caption "photo.jpg".
await bot.api.sendPhoto(12345, new InputFile("/path/to/photo.jpg"), {
  caption: "photo.jpg",
});
```

As always, just like with all other API methods, you can send files via `ctx` (easiest), `ctx.api`, or `bot.api`.

## File Size Limits

grammY itself can send files without any size limits, however, Telegram restricts file sizes as documented [here](https://core.telegram.org/bots/api#sending-files).
This means that your bot cannot download files larger than 20 MB, or upload files larger than 50 MB.
Some combinations have even stricter limits, such as photos sent by URL (5 MB).

If you want to support uploading and downloading files up to 2000 MB (maximum file size on Telegram), you must host your own Bot API server in addition to hosting your bot.
Refer to the official documentation about this [here](https://core.telegram.org/bots/api#using-a-local-bot-api-server).

Hosting your own Bot API server has, in and of itself, nothing to do with grammY.
However, grammY supports all of the methods that are needed to configure your bot to use your own Bot API Server.

Also, you may want to revisit an earlier chapter of this guide about the setup of the Bot API [here](./api).
