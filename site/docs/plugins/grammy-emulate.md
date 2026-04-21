---
prev: false
next: false
---

# End-to-End Testing with grammy-emulate (`grammy-emulate`)

Testing a grammY bot end-to-end has always been awkward.
You either stub `bot.api.config.use` one method at a time, hand-craft `Update` objects for `bot.handleUpdate`, or drive a real bot through [a second Telegram account via Telethon](https://dev.to/shallowdepth/end-to-end-testing-for-telegram-bots-18d4).
None of these exercise the full wire format, and none of them let you assert on multi-turn flows (edits, callbacks, follow-up messages) without fabricating state by hand.

The [`grammy-emulate`](https://github.com/serejke/grammy-emulate) plugin fills that gap.
It boots a stateful, in-process Telegram Bot API emulator, points your grammY bot at it via the `apiRoot` option, and exposes a fluent surface for seeding fixtures, simulating user actions, and inspecting bot output.
No real bot token, no network, no second Telegram account.

::: tip Built on @emulators/telegram
The underlying Bot API emulator is [`@emulators/telegram`](https://github.com/vercel-labs/emulate/tree/main/packages/%40emulators/telegram).
It is a framework-agnostic HTTP server that speaks the real Bot API — this plugin just wires grammY's `Bot` lifecycle to it and adds a test-facing ergonomic surface.
:::

## Installation

```bash
npm install --save-dev grammy-emulate
```

Peer dependencies: `grammy ^1.40` and, optionally, `vitest ^1` for the custom matchers.

## Quick Start

Here is a complete Vitest file that boots the emulator, seeds a bot and a user, mounts a grammY bot against it, sends a message, and asserts on the reply.

::: code-group

```ts [TypeScript]
import { describe, test, expect } from "vitest";
import { Bot } from "grammy";
import { emulator } from "grammy-emulate";
import { emuVitest } from "grammy-emulate/vitest";

const emu = emulator();
emuVitest(emu);

describe("my bot", () => {
  test("replies to /start", async () => {
    const bot = await emu.seed.bot({ username: "my_bot" });
    const alice = await emu.seed.user({ first_name: "Alice" });
    const dm = await emu.seed.privateChat(bot, alice);

    await emu.mount(bot, (token, apiRoot) => {
      const b = new Bot(token, { client: { apiRoot } });
      b.command("start", (ctx) => ctx.reply("hello"));
      return b;
    });

    await emu.as(alice).in(dm).send("/start");
    const reply = await emu.in(dm).waitForReply();
    expect(reply).toMatchReply("hello");
  });
});
```

```js [JavaScript]
const { describe, test, expect } = require("vitest");
const { Bot } = require("grammy");
const { emulator } = require("grammy-emulate");
const { emuVitest } = require("grammy-emulate/vitest");

const emu = emulator();
emuVitest(emu);

describe("my bot", () => {
  test("replies to /start", async () => {
    const bot = await emu.seed.bot({ username: "my_bot" });
    const alice = await emu.seed.user({ first_name: "Alice" });
    const dm = await emu.seed.privateChat(bot, alice);

    await emu.mount(bot, (token, apiRoot) => {
      const b = new Bot(token, { client: { apiRoot } });
      b.command("start", (ctx) => ctx.reply("hello"));
      return b;
    });

    await emu.as(alice).in(dm).send("/start");
    const reply = await emu.in(dm).waitForReply();
    expect(reply).toMatchReply("hello");
  });
});
```

:::

`emuVitest` wires the emulator into `beforeAll` (start), `afterEach` (reset), and `afterAll` (stop), so each test starts with a fresh store.

## Seeding Fixtures

`emu.seed.*` returns typed fixture builders for every chat shape real Telegram supports.

```ts
const bot = await emu.seed.bot({
  username: "trip_bot",
  commands: [{ command: "start", description: "Start" }],
});
const alice = await emu.seed.user({ first_name: "Alice", username: "alice" });
const bob = await emu.seed.user({ first_name: "Bob" });

const dm = await emu.seed.privateChat(bot, alice);
const group = await emu.seed.group({
  title: "Test Group",
  users: [alice, bob],
  bots: [bot],
});
const sg = await emu.seed.supergroup({
  title: "Community",
  users: [alice, bob],
  bots: [bot],
});
const topic = await emu.seed.forumTopic(sg, "general");
const channel = await emu.seed.channel({ title: "News", bots: [bot] });
```

Private, group, supergroup (with forum topics), and channel chats are all modelled — including `channel_post` / `edited_channel_post` semantics.

## Mounting the grammY Bot

`emu.mount(bot, factory)` is the single point where your real grammY `Bot` meets the emulator.
The factory receives the emulator-issued `token` and `apiRoot`; you construct the `Bot`, register its handlers, and return it.
The helper calls `bot.init()`, starts long-polling in the background, and resolves once polling is ready for traffic.

```ts
const mounted = await emu.mount(bot, (token, apiRoot) => {
  const b = new Bot(token, { client: { apiRoot } });
  b.command("start", (ctx) => ctx.reply("welcome"));
  b.command("echo", (ctx) => ctx.reply(ctx.match?.toString() ?? ""));
  return b;
});

// mounted.bot is the grammY Bot you built.
// mounted.stop() halts polling; emuVitest() also stops it between tests.
```

### Polling or Webhook

Pass `mode: "webhook"` to exercise the same delivery path your production bot uses.
The plugin stands up a receiver on a random free port, calls `setWebhook(url, { secret_token })` on the emulator, and relies on grammY's `webhookCallback` to verify the `X-Telegram-Bot-Api-Secret-Token` header on every incoming POST.

```ts
await emu.mount(bot, factory, {
  mode: "webhook",
  allowedUpdates: ["message", "callback_query"],
});
```

Polling is the default.
Both modes accept `allowedUpdates` and `dropPendingUpdates`.

## Simulating User Actions

`emu.as(user).in(chat)` returns a fluent builder for every action a real Telegram user can take against your bot.

```ts
await emu.as(alice).in(dm).send("/start");
await emu.as(alice).in(dm).sendPhoto(photoBytes, { caption: "look" });
await emu.as(alice).in(dm).sendVideo(videoBytes, { duration: 10 });
await emu.as(alice).in(dm).sendAudio(audioBytes, { mimeType: "audio/mpeg" });
await emu.as(alice).in(dm).sendVoice(voiceBytes, { duration: 3 });
await emu.as(alice).in(dm).sendAnimation(gifBytes);
await emu.as(alice).in(dm).sendSticker(stickerBytes);
await emu.as(alice).in(dm).sendDocument(docBytes, { fileName: "notes.txt" });
await emu.as(alice).in(dm).edit(messageId, "edited text");
await emu.as(alice).in(dm).click(messageId, "menu:about");
await emu.as(alice).in(dm).react(messageId, "👍");
await emu.as(alice).in(dm).reply(otherMessageId, "on it");
```

Every call dispatches a real `Update` through the emulator's dispatcher to your mounted grammY bot.

## Inspecting Bot Output

`emu.in(chat)` returns an inspector over the chat's message stream.

```ts
await emu.in(dm).replies(); // bot-sent messages only
await emu.in(dm).messages(); // all messages (user + bot)
await emu.in(dm).lastReply();
await emu
  .in(dm)
  .waitForReply({ matcher: (m) => /welcome/i.test(m.text ?? "") });
await emu.in(dm).waitForReplyCount(3);
await emu.in(dm).drafts(messageId); // sendMessageDraft snapshots

await emu.inspect.callbackAnswer(callbackQueryId);
```

`waitForReply` polls the emulator's store until a matching reply lands or a timeout elapses, so you never have to race the grammY poll loop by hand.

## Injecting Faults

Testing error paths — retry logic, rate-limit handling, "bot blocked by user" branches — is where mock-based approaches fall over.
The emulator exposes a typed fault-injection primitive that surfaces as `emu.faults.*` in the plugin.

```ts
await emu.faults.inject({
  bot,
  method: "sendMessage",
  code: 429,
  retryAfter: 2,
  count: 1,
});

await emu.as(alice).in(dm).send("/start");
// The bot's ctx.reply() throws a GrammyError(429); your bot.catch handler fires.
```

The scoped `during()` sugar is cleared automatically on exit, even when the wrapped block throws.

```ts
await emu.faults.during(
  async () => {
    await emu.as(alice).in(dm).send("/start");
    // assertions
  },
  { bot, method: "sendMessage", code: 403 },
);
```

Supported codes are `400`, `401`, `403`, `404`, and `429`.
`count` defaults to `1` — only the very next call fails.

## Vitest Matchers

Importing `grammy-emulate/vitest` extends `expect` with bot-specific matchers.

```ts
expect(reply).toMatchReply("hello");
expect(reply).toMatchReply(/welcome/i);
expect(reply).toMatchReply({ text: "hello", reply_markup: undefined });

await expect(emu.in(dm)).toHaveReplied(/welcome/i);
await expect(emu.in(dm)).toHaveReplyCount(2);
expect(answer).toHaveAnsweredCallback();
```

The same inspector target passed to `emu.in(chat).replies()` can be handed directly to the matchers.

## What the Emulator Covers

Inherited from [`@emulators/telegram`](https://github.com/vercel-labs/emulate/tree/main/packages/%40emulators/telegram):

- **Delivery**: `getUpdates` with `offset` confirmation, long-poll takeover 409, `setWebhook` with `secret_token` and 5xx retry, `deleteWebhook`, `getWebhookInfo`.
- **Messaging**: `sendMessage`, `sendPhoto`, `sendDocument`, `sendVideo`, `sendAudio`, `sendVoice`, `sendAnimation`, `sendSticker`, `editMessageText`, `editMessageReplyMarkup`, `deleteMessage`, `sendChatAction`.
- **Parse modes**: MarkdownV2, HTML, and legacy Markdown, with UTF-16 entity offsets and real Telegram-style error wording on unescaped reserved characters.
- **Callbacks and inline keyboards**: `answerCallbackQuery` with `text` / `show_alert` / `url` / `cache_time` round-trip.
- **Reactions**: `setMessageReaction`, per-user and anonymous aggregate counts.
- **Chat types**: private, group, supergroup (with forum topics and `message_thread_id`), channel (with `channel_post` and `edited_channel_post`).
- **Forum topics**: create, edit, close, reopen, delete.
- **Privacy Mode**: groups drop bare `/cmd`; `@bot_username` and `/cmd@bot_username` pass through.
- **Files**: `getFile` plus `/file/bot<token>/...` download; stable `file_id` across resends.
- **Fault injection**: 401 / 403 / 404 / 429 with `retry_after` for exercising adapter retry paths.

The following are explicit non-goals for the underlying emulator: payments, games, Business API, Passport, inline mode, media groups (`sendMediaGroup`), polls, and the legacy stories / web-apps surfaces.
See the upstream [non-goals](https://github.com/vercel-labs/emulate/tree/main/packages/%40emulators/telegram#non-goals) for the full list.

## Showcase

A production-shaped grammY bot with eight end-to-end tests lives in the [`examples/echo-bot`](https://github.com/serejke/grammy-emulate/tree/main/examples/echo-bot) directory of the plugin repository.
The same `/echo hello` test is also written in the classic transformer-mock style in [`bot.before.test.ts`](https://github.com/serejke/grammy-emulate/blob/main/examples/echo-bot/src/bot.before.test.ts) so you can compare the two approaches side by side.

## Resources

- [Source code and issue tracker](https://github.com/serejke/grammy-emulate)
- [Underlying Bot API emulator (`@emulators/telegram`)](https://github.com/vercel-labs/emulate/tree/main/packages/%40emulators/telegram)
- [Open a discussion if something is missing](https://github.com/serejke/grammy-emulate/issues)
