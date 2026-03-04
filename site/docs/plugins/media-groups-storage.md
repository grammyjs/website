---
prev: false
next: false
---

# Media Groups Storage (`media-groups`)

When a user sends an album (a media group) to a Telegram bot, it does not arrive as a single update.
Instead, Telegram delivers each photo, video, or document in the album as a **separate message**, each carrying the same `media_group_id`.
These messages may arrive in any order and with unpredictable timing.

This creates a fundamental challenge: there is no built-in way to know when all parts of the album have arrived, and no way to retrieve the full album later, for example when the user replies to one of the messages or when you need to forward the entire group.

The media groups storage plugin solves this problem.
It automatically collects and stores all messages that share the same `media_group_id` (both from incoming updates and outgoing API responses) and lets you retrieve the complete group at any time by any of its messages.

::: tip Built-in Media Groups
grammY has a [built-in plugin](./media-group) for building `InputMedia` objects.
That plugin helps you _create_ media for sending.
The media groups storage plugin on this page helps you _collect, store, and retrieve_ media groups that were already sent.
These two plugins complement each other.
:::

## How It Works

The plugin works on two levels simultaneously:

1. **Middleware** stores every incoming message that has a `media_group_id`.
   It also stores media group messages found in `reply_to_message` and `pinned_message` sub-objects.
2. **Transformer** intercepts outgoing API responses from methods like `sendMediaGroup`, `forwardMessage`, `editMessageMedia`, `editMessageCaption`, and `editMessageReplyMarkup`, and stores the returned messages.

Together, this means that both received and sent media groups are tracked automatically.

The plugin **hydrates the context object** with a `ctx.mediaGroups` namespace providing methods to retrieve, store, and convert media group messages.
It also exposes programmatic access outside middleware via the returned composer object.

## Installation

::: code-group

```ts [TypeScript]
import { Bot, Context } from "grammy";
import { mediaGroups, type MediaGroupsFlavor } from "grammy-media-groups";

type MyContext = Context & MediaGroupsFlavor;

const bot = new Bot<MyContext>("");
```

```js [JavaScript]
const { Bot } = require("grammy");
const { mediaGroups } = require("grammy-media-groups");

const bot = new Bot("");
```

```ts [Deno]
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import { mediaGroups, type MediaGroupsFlavor } from "npm:grammy-media-groups";

type MyContext = Context & MediaGroupsFlavor;

const bot = new Bot<MyContext>("");
```

:::

## Setup

The plugin has two components that need to be registered: middleware (via `bot.use`) and a transformer (via `bot.api.config.use`).

```ts
// Uses in-memory storage by default
const mg = mediaGroups();

// Register middleware to store incoming media group messages
bot.use(mg);

// Register transformer to store outgoing media group API responses
bot.api.config.use(mg.transformer);
```

After this setup, media groups from both incoming updates and outgoing API calls are automatically stored.

## Retrieving Media Groups

The plugin hydrates the context with `ctx.mediaGroups` containing several methods for retrieving stored media groups.

### Current Message's Media Group

Use `ctx.mediaGroups.getForMsg()` to get all messages belonging to the current message's media group.
This returns `undefined` if the current message is not part of a media group.

```ts
bot.on("message", async (ctx) => {
  const group = await ctx.mediaGroups.getForMsg();
  if (group) {
    await ctx.reply(`This album has ${group.length} item(s) so far.`);
  }
});
```

### Replied Message's Media Group

Use `ctx.mediaGroups.getForReply()` to get the media group of the message being replied to.
This is useful for commands like `/copy` that should operate on a replied album.

```ts
bot.command("copy", async (ctx) => {
  const group = await ctx.mediaGroups.getForReply();
  if (group) {
    await ctx.replyWithMediaGroup(ctx.mediaGroups.toInputMedia(group));
  }
});
```

### Pinned Message's Media Group

Use `ctx.mediaGroups.getForPinned()` to get the media group of a pinned message.

```ts
bot.on("message:pinned_message", async (ctx) => {
  const group = await ctx.mediaGroups.getForPinned();
  if (group) {
    await ctx.reply(`Pinned album contains ${group.length} item(s).`);
  }
});
```

### Programmatic Access Outside Middleware

The composer object returned by `mediaGroups()` exposes `getMediaGroup(mediaGroupId)` for use outside middleware.
This is useful when you need to access stored groups from scheduled jobs, webhook handlers, or other non-middleware contexts.

```ts
const mg = mediaGroups();
bot.use(mg);

// Later, outside middleware:
const messages = await mg.getMediaGroup("some-media-group-id");
```

## Converting Messages to InputMedia

When you retrieve a stored media group, you get an array of raw `Message` objects.
To resend the group, you need to convert them into `InputMedia` objects.
The plugin provides a `toInputMedia` function that does exactly that.

It supports photo, video, document, and audio messages.
Unsupported message types are silently skipped.

```ts
bot.command("copy", async (ctx) => {
  const group = await ctx.mediaGroups.getForReply();
  if (group) {
    await ctx.replyWithMediaGroup(ctx.mediaGroups.toInputMedia(group));
  }
});
```

You can also override captions and formatting:

```ts
bot.command("forward", async (ctx) => {
  const group = await ctx.mediaGroups.getForReply();
  if (group) {
    const media = ctx.mediaGroups.toInputMedia(group, {
      caption: "<b>Forwarded album</b>",
      parse_mode: "HTML",
    });
    await ctx.replyWithMediaGroup(media);
  }
});
```

The `toInputMedia` function accepts the following options (all optional):

| Option                     | Description                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `caption`                  | Override caption on the first item of the media group.                               |
| `parse_mode`               | Text formatting mode for the overridden caption. Only applied when `caption` is set. |
| `caption_entities`         | Entities for the overridden caption. Only applied when `caption` is set.             |
| `show_caption_above_media` | Show caption above media. Applied to all photo and video items.                      |
| `has_spoiler`              | Mark media as containing a spoiler. Applied to all photo and video items.            |

The `toInputMedia` function is also available as a standalone import:

::: code-group

```ts [TypeScript]
import { toInputMedia } from "grammy-media-groups";
```

```js [JavaScript]
const { toInputMedia } = require("grammy-media-groups");
```

```ts [Deno]
import { toInputMedia } from "npm:grammy-media-groups";
```

:::

## Full Example

Here is a complete example that detects incoming albums, replies once with a button, and lets the user copy the album by pressing the button or replying with a command.

::: code-group

```ts [TypeScript]
import { Bot, Context, InlineKeyboard } from "grammy";
import { mediaGroups, type MediaGroupsFlavor } from "grammy-media-groups";

type MyContext = Context & MediaGroupsFlavor;

const bot = new Bot<MyContext>("");

const mg = mediaGroups();
bot.use(mg);
bot.api.config.use(mg.transformer);

// Reply once when the first message of a media group arrives
bot.on("message", async (ctx) => {
  const group = await ctx.mediaGroups.getForMsg();
  if (group?.length === 1) {
    await ctx.reply("Media group detected!", {
      reply_parameters: { message_id: ctx.msg.message_id },
      reply_markup: new InlineKeyboard().text("Copy album", "copy"),
    });
  }
});

// Handle inline keyboard button to resend the album
bot.callbackQuery("copy", async (ctx) => {
  const group = await ctx.mediaGroups.getForReply();
  if (group) {
    await ctx.replyWithMediaGroup(ctx.mediaGroups.toInputMedia(group));
  }
  await ctx.answerCallbackQuery();
});

// Reply to an album message with /copy to resend the full media group
bot.command("copy", async (ctx) => {
  const group = await ctx.mediaGroups.getForReply();
  if (group) {
    await ctx.replyWithMediaGroup(ctx.mediaGroups.toInputMedia(group));
  }
});

bot.start();
```

```js [JavaScript]
const { Bot, InlineKeyboard } = require("grammy");
const { mediaGroups } = require("grammy-media-groups");

const bot = new Bot("");

const mg = mediaGroups();
bot.use(mg);
bot.api.config.use(mg.transformer);

// Reply once when the first message of a media group arrives
bot.on("message", async (ctx) => {
  const group = await ctx.mediaGroups.getForMsg();
  if (group?.length === 1) {
    await ctx.reply("Media group detected!", {
      reply_parameters: { message_id: ctx.msg.message_id },
      reply_markup: new InlineKeyboard().text("Copy album", "copy"),
    });
  }
});

// Handle inline keyboard button to resend the album
bot.callbackQuery("copy", async (ctx) => {
  const group = await ctx.mediaGroups.getForReply();
  if (group) {
    await ctx.replyWithMediaGroup(ctx.mediaGroups.toInputMedia(group));
  }
  await ctx.answerCallbackQuery();
});

// Reply to an album message with /copy to resend the full media group
bot.command("copy", async (ctx) => {
  const group = await ctx.mediaGroups.getForReply();
  if (group) {
    await ctx.replyWithMediaGroup(ctx.mediaGroups.toInputMedia(group));
  }
});

bot.start();
```

```ts [Deno]
import {
  Bot,
  Context,
  InlineKeyboard,
} from "https://deno.land/x/grammy/mod.ts";
import { mediaGroups, type MediaGroupsFlavor } from "npm:grammy-media-groups";

type MyContext = Context & MediaGroupsFlavor;

const bot = new Bot<MyContext>("");

const mg = mediaGroups();
bot.use(mg);
bot.api.config.use(mg.transformer);

// Reply once when the first message of a media group arrives
bot.on("message", async (ctx) => {
  const group = await ctx.mediaGroups.getForMsg();
  if (group?.length === 1) {
    await ctx.reply("Media group detected!", {
      reply_parameters: { message_id: ctx.msg.message_id },
      reply_markup: new InlineKeyboard().text("Copy album", "copy"),
    });
  }
});

// Handle inline keyboard button to resend the album
bot.callbackQuery("copy", async (ctx) => {
  const group = await ctx.mediaGroups.getForReply();
  if (group) {
    await ctx.replyWithMediaGroup(ctx.mediaGroups.toInputMedia(group));
  }
  await ctx.answerCallbackQuery();
});

// Reply to an album message with /copy to resend the full media group
bot.command("copy", async (ctx) => {
  const group = await ctx.mediaGroups.getForReply();
  if (group) {
    await ctx.replyWithMediaGroup(ctx.mediaGroups.toInputMedia(group));
  }
});

bot.start();
```

:::

## Custom Storage

By default, the plugin uses `MemorySessionStorage`, which keeps data in memory.
When your bot process restarts, all stored media groups are lost.

For persistence, you can pass any grammY-compatible [storage adapter](./session#known-storage-adapters).
This follows the same [storages](https://github.com/grammyjs/storages) protocol used by grammY sessions, so you can use any adapter from the `@grammyjs/storage-*` family.

```ts
import { freeStorage } from "@grammyjs/storage-free";

const mg = mediaGroups(
  freeStorage<Message[]>(bot.token),
);
bot.use(mg);
bot.api.config.use(mg.transformer);
```

Any class implementing the [`StorageAdapter`](/ref/core/storageadapter) interface will work.

## Manual Mode

By default, the plugin automatically stores every incoming message that has a `media_group_id`.
If you need finer control over which messages are stored, you can disable this behavior:

```ts
const mg = mediaGroups(undefined, { autoStore: false });
bot.use(mg);

bot.on("message", async (ctx) => {
  // Only store messages you care about
  if (ctx.msg.media_group_id) {
    await ctx.mediaGroups.store(ctx.msg);
  }

  // You can also manually store reply_to_message
  const reply = ctx.msg.reply_to_message;
  if (reply?.media_group_id) {
    await ctx.mediaGroups.store(reply);
  }
});
```

This can be useful when you only want to track media groups in specific chats or from specific users, avoiding unnecessary writes to your storage backend.

## Deleting Media Groups

You can remove a media group from storage when it is no longer needed:

```ts
// From within middleware
await ctx.mediaGroups.delete("some-media-group-id");

// From outside middleware
await mg.deleteMediaGroup("some-media-group-id");
```

## Understanding the Transformer

The plugin includes an API transformer that intercepts responses from the following Bot API methods:

| Bot API Method           | What it stores                         |
| ------------------------ | -------------------------------------- |
| `sendMediaGroup`         | All returned messages (the sent album) |
| `forwardMessage`         | The returned forwarded message         |
| `editMessageMedia`       | The returned edited message            |
| `editMessageCaption`     | The returned edited message            |
| `editMessageReplyMarkup` | The returned edited message            |

When any of these methods returns a result that contains a `media_group_id`, the plugin stores it.
This means that albums you _send_ via `sendMediaGroup` are also tracked, not just the ones you receive.

The transformer is installed separately from the middleware:

```ts
const mg = mediaGroups();
bot.use(mg); // middleware for incoming updates
bot.api.config.use(mg.transformer); // transformer for outgoing API calls
```

If you only want to track incoming media groups, you can skip the transformer installation.
However, installing both ensures complete coverage.

## How Storage Works Internally

The plugin stores media group messages under their `media_group_id` as the key.
Each key maps to an array of `Message` objects.

When a new message is stored:

1. The plugin reads the existing array for that `media_group_id` (if any).
2. If a message with the same `message_id` and `chat.id` already exists, it is replaced in-place (this handles edited messages).
3. Otherwise, the new message is appended to the array.
4. The updated array is written back to storage.

Multiple messages with different `media_group_id` values are batched efficiently, requiring only one read and one write per group instead of per message.

## Plugin Summary

- Name: `media-groups`
- [Source](https://github.com/PonomareVlad/grammy-media-groups)
