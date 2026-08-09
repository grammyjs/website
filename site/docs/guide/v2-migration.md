# v1 → v2 migration

## Renamed

Types and errors:

- `Filter<C, Q>` → `FilterQueryContext<C, Q>`
- `GrammyError` → `BotApiError`

`Bot`:

- `bot.botInfo` → `bot.me`
- `new Bot(token, { botInfo })` → `new Bot(token, { me })`

`ctx.reply*` → `ctx.send*`:

- `ctx.reply` → `ctx.sendMessage`. Prefer going straight to `ctx.send`, see [Refactoring Opportunities](#refactoring-opportunities)
- `ctx.replyWithAnimation` → `ctx.sendAnimation`
- `ctx.replyWithAudio` → `ctx.sendAudio`
- `ctx.replyWithChatAction` → `ctx.sendChatAction`
- `ctx.replyWithChatJoinRequestWebApp` → `ctx.sendChatJoinRequestWebApp`
- `ctx.replyWithChecklist` → `ctx.sendChecklist`
- `ctx.replyWithContact` → `ctx.sendContact`
- `ctx.replyWithDice` → `ctx.sendDice`
- `ctx.replyWithDocument` → `ctx.sendDocument`
- `ctx.replyWithDraft` → `ctx.sendMessageDraft`
- `ctx.replyWithGame` → `ctx.sendGame`
- `ctx.replyWithGift` → `ctx.sendGiftToUser`
- `ctx.replyWithGiftToChannel` → `ctx.sendGiftToChat`
- `ctx.replyWithInvoice` → `ctx.sendInvoice`
- `ctx.replyWithLivePhoto` → `ctx.sendLivePhoto`
- `ctx.replyWithLocation` → `ctx.sendLocation`
- `ctx.replyWithMediaGroup` → `ctx.sendMediaGroup`
- `ctx.replyWithPaidMedia` → `ctx.sendPaidMedia`
- `ctx.replyWithPhoto` → `ctx.sendPhoto`
- `ctx.replyWithPoll` → `ctx.sendPoll`
- `ctx.replyWithRichMessage` → `ctx.sendRichMessage`
- `ctx.replyWithRichMessageDraft` → `ctx.sendRichMessageDraft`
- `ctx.replyWithSticker` → `ctx.sendSticker`
- `ctx.replyWithVenue` → `ctx.sendVenue`
- `ctx.replyWithVideo` → `ctx.sendVideo`
- `ctx.replyWithVideoNote` → `ctx.sendVideoNote`
- `ctx.replyWithVoice` → `ctx.sendVoice`

Reaction methods gained a `By` infix (on both `ctx` and `ctx.api`):

- `deleteMessageReactionChat` → `deleteMessageReactionByChat`
- `deleteMessageReactionUser` → `deleteMessageReactionByUser`
- `deleteAllMessageReactionsChat` → `deleteAllMessageReactionsByChat`
- `deleteAllMessageReactionsUser` → `deleteAllMessageReactionsByUser`

Gifts:

- `api.sendGift` → `api.sendGiftToUser`
- `api.sendGiftToChannel` → `api.sendGiftToChat`

Other:

- `ctx.setChatAdministratorAuthorCustomTitle` → `ctx.setAuthorCustomTitle`
- `ctx.kickAuthor` → `ctx.banChatAuthor`
- `api.config.use(...t)` → `api.transform(...t)`. `config` was an object with a `use` method; `transform` is the method itself
- `TransformableApi.use(...t)` → `TransformableApi.transform(...t)`

## Deleted

Removed with a direct replacement:

- `ctx.senderChat` → `ctx.msg?.sender_chat`
- `ctx.deleteMessageReaction` → `ctx.deleteMessageReactionByAuthor` / `ctx.deleteMessageReactionByChatAuthor`. **Not a drop-in**, see [Reaction deletion no longer picks the actor](#reaction-deletion-no-longer-picks-the-actor)
- `ctx.deleteAllMessageReactions` → `ctx.deleteAllMessageReactionsByAuthor` / `ctx.deleteAllMessageReactionsByChatAuthor`. **Not a drop-in**, see [Reaction deletion no longer picks the actor](#reaction-deletion-no-longer-picks-the-actor)
- `getChatMembersCount` → `getChatMemberCount` (deprecated alias dropped, `ctx` and `ctx.api`)
- `kickChatMember` → `banChatMember` (deprecated alias dropped, `ctx` and `ctx.api`)
- `api.answerShippingQuery(id, ok, other)` → `api.answerShippingQueryOk(id, shipping_options, other)` / `api.answerShippingQueryError(id, error_message, other)`
- `api.answerPreCheckoutQuery(id, ok, other)` → `api.answerPreCheckoutQueryOk(id, other)` / `api.answerPreCheckoutQueryError(id, error_message, other)`
- `setManagedBotAccessSettings` → `setManagedBotAccessSettingsRestricted` / `setManagedBotAccessSettingsUnrestricted` (`ctx` and `ctx.api`)
- `ctx.setBusinessAccountGiftSettings` → `ctx.setBusinessAccountGiftSettingsShowGiftButton` / `ctx.setBusinessAccountGiftSettingsHideGiftButton`
- `api.config` → gone as an object. Its other member, `api.config.installedTransformers()`, has no v2 equivalent, so there is no read access to installed transformers
- `BotConfig.ContextConstructor` → gone. `Bot` always constructs the base `Context`, extend via context flavors instead
- `ApiClientOptions.fetch` → gone. Only `baseFetchConfig` remains for customizing requests

Removed as `ctx` shortcuts, still available on `ctx.api`:

- `ctx.getChatMenuButton` / `ctx.setChatMenuButton`
- `ctx.getMyDefaultAdministratorRights` / `ctx.setMyDefaultAdministratorRights`
- `ctx.getCustomEmojiStickers`

Moved out of the main entry point into subpath exports:

- `Keyboard`, `InlineKeyboard` → `@grammyjs/grammy/keyboard`
- `InlineQueryResultBuilder` → `@grammyjs/grammy/inline_query`
- `InputMediaBuilder` → `@grammyjs/grammy/input_media`
- `WebhookOptions` and all adapters → `@grammyjs/grammy/webhook`
- `API_CONSTANTS` → `@grammyjs/grammy/constants`, split into named exports `ALL_UPDATE_TYPES`, `DEFAULT_UPDATE_TYPES`, `ALL_CHAT_PERMISSIONS` (the `ApiConstants` type is gone)

Removed from core entirely:

- `session`, `lazySession`, `SessionFlavor`, `LazySessionFlavor`, `SessionOptions`, `MultiSessionOptions`, `MemorySessionStorage`, `StorageAdapter`, `enhanceStorage`, `Enhance`, `Migrations`, `MigrationOptions` → moved to <https://github.com/grammyjs/sessions>
- `webhookCallback(bot, "express", options)` → `webhookAdapters.express(bot, options)` from `@grammyjs/grammy/webhook`

## Refactoring Opportunities

Not required, but v2 offers better ways to do these:

- `ctx.editMessageText(text)` → `ctx.edit(text)`. It also picks `editMessageCaption`/`Media`/`LiveLocation`/`ReplyMarkup` from the payload shape, and routes to inline editing automatically when `ctx.inlineMessageId` is set, so the separate inline branch goes away
- `ctx.sendMessage(text)` / `ctx.sendPhoto(photo)` / etc. → `ctx.send(data)`, one polymorphic call that dispatches on which field is present (`{ text }`, `{ photo }`, `{ video }`, `{ latitude, longitude }`, and so on). A bare string is `sendMessage`

  This is the most common call in a v1 codebase, so it is worth combining the
  rename with the refactor in one pass. `ctx.reply` is [a forced
  rename](#renamed) anyway, so send it to its final destination directly instead
  of touching every call site twice:

  ```ts
  ctx.reply("hi")        // v1
  ctx.sendMessage("hi")  // v2, mechanical rename
  ctx.send("hi")         // v2, what you actually want
  ```

  The media shortcuts work the same way: `ctx.replyWithPhoto(photo)` can become
  `ctx.send({ photo })` rather than stopping at `ctx.sendPhoto(photo)`.
- `ctx.api.sendMessage(ctx.chat.id, text)` → `ctx.sendMessage(text)`. The `ctx.*` aliases pre-fill `chat_id`, plus `business_connection_id`, `message_thread_id` and `direct_messages_topic_id` when the update has them
- `api.config.use(t)` → `api.transform(t)` returns a `TransformerComposer` (v1's `use` returned `this`), so you can scope transformers to specific methods with `.on(method)` / `.filter()` instead of branching on `data.method` by hand. Transformers can also be objects now (`TransformerObj` with a `transformer()` method). The transformer signature itself changed too, see [Transformers take a single data object](#transformers-take-a-single-data-object)
- `ctx.chat?.id` / `ctx.from?.id` → `ctx.chatId` / `ctx.fromId`
- `ctx.msg?.text ?? ctx.msg?.caption` → `ctx.txt`
- Manual `parse_mode` string building → `EntityString` from the main entry point (formatting is now built in, no `parse-mode` plugin needed)
- `bot.start()` → `bot.start({ onStop })` if you need a shutdown hook; `PollingOptions.onStop` is new

## Caveats

### Transformers take a single data object

The signature changed from `(prev, method, payload, signal)` to
`(prev, data, signal)`, where `data` is a `CallData`, a large discriminated union
of `{ method, payload }` pairs.

Pass `data` straight through. Do not destructure it and rebuild the object:

```ts
// BAD: Argument of type '{ method: string & keyof R; payload: unknown; }'
// is not assignable to parameter of type 'CallData<R>'. deno-ts(2345)
return async (prev, data, signal) => {
  const { method, payload } = data;
  const res = await prev({ method, payload }, signal);
  // ...
};

// GOOD
return async (prev, data, signal) => {
  const res = await prev(data, signal);
  // ...
};
```

The cause is a TypeScript limitation. Once you pick `method` and `payload` out of
the union, TypeScript widens them to `string & keyof R` and `unknown`
independently and no longer knows the two are correlated, so the rebuilt object
matches no member of the union. Keeping the original object intact preserves the
correlation.

You can still read `data.method` and `data.payload` freely, just forward `data`
itself to `prev`.

### Reaction deletion no longer picks the actor

In v1, `ctx.deleteMessageReaction()` and `ctx.deleteAllMessageReactions()` took
no identifier and branched at runtime to the user or chat variant. v2 removes
that dispatch: you pick `ByAuthor` (user) or `ByChatAuthor` (actor chat)
yourself, and the wrong choice throws where v1 would have succeeded.

The two v1 methods also disagreed on which actor wins, so there is no single
correct replacement:

- `ctx.deleteMessageReaction()` required a `message_reaction` update, and
  preferred `reaction.user` over `reaction.actor_chat`.
- `ctx.deleteAllMessageReactions()` preferred the chat actor
  (`messageReaction.actor_chat ?? senderChat ?? pollAnswer.voter_chat`) and only
  fell back to `ctx.from`.

If you relied on the branching, keep it explicit:

```ts
const reaction = ctx.messageReaction;
if (reaction?.user !== undefined) {
  await ctx.deleteMessageReactionByAuthor();
} else if (reaction?.actor_chat !== undefined) {
  await ctx.deleteMessageReactionByChatAuthor();
}
```
