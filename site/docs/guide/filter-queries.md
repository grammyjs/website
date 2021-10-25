---
prev: ./api.md
next: ./commands.md
---

# Filter Queries and `bot.on()`

The first argument of `bot.on()` is a string called _filter query_.

## Introduction

Most (all?) other bot frameworks allow you to perform a primitive form of filtering for updates, e.g. only `on("message")` and the like.
Other filtering of messages is left to the developer, which often leads to endless `if` statements in their code.

On the contrary, **grammY ships with its own query language** that you can use in order to **filter for exactly the messages** you want.

This allows for over 500 different filters to be used, and we may add more over time.
Every valid filter can be auto-completed in your code editor.
Hence, you can simply type `bot.on('')`, open auto-complete, and search through all queries by typing something.

![Filter Query Search](/filter-query-search.png)

The type inference of `bot.on()` will comprehend the filter query you picked.
It therefore tightens a few types on the context that are known to exist.

```ts
bot.on("message", (ctx) => {
  // text could be undefined for photo messages!
  const text: string | undefined = ctx.msg.text;
});
bot.on("message:text", (ctx) => {
  // text is known to be present for text messages!
  const text: string = ctx.msg.text;
});
```

In a sense, grammY implements the filter queries both at runtime, and on the type level.

## Example Queries

Here are some example queries:

### Regular Queries

Simple filters for updates, and sub-filters:

```ts
bot.on("message"); // called for all messages
bot.on("message:text"); // only text messages
bot.on("message:photo"); // only photo messages
```

### Filter for Entities

Sub-filters that go one level deeper:

```ts
bot.on("message:entities:url"); // messages that contain a URL
bot.on("message:entities:code"); // messages that contain a code snippet
bot.on("edited_message:entities"); // edited message with any kind of entities
```

### Omit Values

You can omit some values in the filter queries.
grammY will then search through different values to match your query.

```ts
bot.on(":text"); // all text messages and all text channel posts
bot.on("message::url"); // messages with URL in text or caption (photos, etc)
bot.on("::email"); // messages or channel posts with email in text or caption
```

Leaving out the _first_ value matches both messages and channel posts.
[Remember](./context.md#available-actions) that `ctx.msg` gives you access to both messages or channel posts, whichever is matched by the query.

Leaving out the _second_ value matches both entities and caption entities.
You can leave out both the first and the second part at the same time.

### Shortcuts

The query engine of grammY allows to define neat shortcuts that group related queries together.

#### `msg`

The `msg` shortcut groups new messages and new channel posts.
In other words, using `msg` is equivalent to listening for both `'message'` and `'channel_post'` events.

```ts
bot.on("msg"); // all messages or channel posts
bot.on("msg:text"); // exactly the same as `:text`
```

#### `edit`

This `edit` shortcut groups edited messages and edited channel posts.

```ts
bot.on("edit"); // all edits of messages or channel posts
bot.on("edit:text"); // edits of text messages
bot.on("edit::url"); // edits of messages or channel posts with URL
bot.on("edit:location"); // live location updated
```

#### `:media`

The `:media` shortcut groups photo and video messages.

```ts
bot.on("message:media"); // photo messages and video messages
bot.on("edited_channel_post:media"); // edited channel posts with media
bot.on(":media"); // new media messages or media channel posts
```

#### `:file`

The `:file` shortcut groups all messages that contain a file.
Hence, you can be sure that `await ctx.getFile()` will give you a file object.

```ts
bot.on(":file"); // files in messages or channel posts
bot.on("edit:file"); // edits to file messages or file channel posts
```

### Useful Tips

You can detect bots in queries with the `:is_bot` query part.
The syntactic sugar `:me` can be used to refer to your bot from within a query, which will compare the user identifiers for you.

```ts
bot.on("message:new_chat_members:is_bot"); // a bot joined the chat
bot.on("message:left_chat_member:me"); // your bot left a chat (was removed)
```

::: tip Filter by user properties

If you want to filter by other properties of a user, you need to perform an additional request, e.g. `await ctx.getAuthor()` for the author of the message.
Filter queries will not secretly perform further API requests for you.
It is still simple to perform this kind of filtering:

```ts
bot.on("message").filter(
  async (ctx) => {
    const user = await ctx.getAuthor();
    return user.status === "creator" || user.status === "administrator";
  },
  (ctx) => {
    // handles messages from creators and admins
  },
);
```

:::

## Combining Multiple Queries

You can combine any number of filter queries with AND as well as OR operations.

### Combine With OR

If you want to install some piece of middleware behind the OR concatenation of two queries, you can pass both of them to `bot.on()` in an array.

```ts
// Runs if the update is about a message OR an edit to a message
bot.on(["message", "edited_message"], (ctx) => {});
// Runs if a hashtag OR email OR mention entity is found in text or caption
bot.on(["::hashtag", "::email", "::mention"], (ctx) => {});
```

The middleware will be executed if _any of the provided queries_ matches.
The order of the queries does not matter.

### Combine With AND

If you want to install some piece of middleware behind the AND concatenation of two queries, you can chain the calls to `bot.on()`.

```ts
// Matches forwarded URLs
bot.on("::url").on(":forward_date", (ctx) => {});
// Matches photos that contain a hashtag in a photo's caption
bot.on(":photo").on("::hashtag", (ctx) => {});
```

The middleware will be executed if _all of the provided queries_ match.
The order of the queries does not matter.

### Building Complex Queries

It is technically possible to combine filter queries to more complicated formulas if they are in [CNF](https://en.wikipedia.org/wiki/Conjunctive_normal_form), even though this is unlikely to be useful.

```ts
bot
  // Matches all channel posts and forwarded messages ...
  .on(["channel_post", ":forward_date"])
  // ... that contain text ...
  .on(":text")
  // ... with at least one URL, hashtag, or cashtag.
  .on(["::url", "::hashtag", "::cashtag"], (ctx) => {});
```

The type inference of `ctx` will scan through the entire call chain and inspect every element of all three `.on` calls.
As an example, it can detect that `ctx.msg.text` is a required property for the above code snippet.

## The Query Language

> This section is meant for users who want to have a deeper understanding of filter queries in grammY, but it does not contain any knowledge required to create a bot.

### Query Structure

Every query consists of up to three query parts.
Depending on how many query parts a query has, we differentiate between L1, L2, and L3 queries, such as `'message'`, `'message:entities'`, and `'message:entities:url'`, respectively.

The query parts are separated by colons (`:`).
We refer to the part up to the first colon or the end of the query string as the _L1 part_ of a query.
We refer to the part from the first colon to the second colon or to the end of the query string as the _L2 part_ of the query.
We refer to the part from the second colon to the end of the query string as the _L3 part_ of the query.

Example:

| Filter Query                 | L1 part     | L2 part      | L3 part     |
| ---------------------------- | ----------- | ------------ | ----------- |
| `'message'`                  | `'message'` | `undefined`  | `undefined` |
| `'message:entities'`         | `'message'` | `'entities'` | `undefined` |
| `'message:entities:mention'` | `'message'` | `'entities'` | `'mention'` |

### Query Validation

Even though the type system should catch all invalid filter queries at compile time, grammY also checks all passed filter queries at runtime during setup.
Every passed filter query is matched against a validation structure that checks if it is valid.
Not only is it good to fail immediately during setup instead of at runtime, it has also happened before that bugs in TypeScript cause serious problems with the sophisticated type inference system that powers filter queries.
If this happens again in the future, this will prevent issues that could otherwise occur.
In this case, you will be provided with helpful error messages.

### Performance

**grammY can check every filter query in (amortized) constant time per update**, independent of the structure of the query or the incoming update.

The validation of the filter queries happens only once, when the bot is initialized and `bot.on()` is called.

On start-up, grammY derives a predicate function from the filter query by splitting it into its query parts.
Every part will be mapped to a function that performs a single `in` check, or two checks if the part is omitted and two values need to be checked.
These functions are then combined to form a predicate that only has to check for as many values as are relevant for the query, without iterating over the object keys of `Update`.

This system uses less operations than some competing libraries, which need to perform containment checks in arrays when routing updates. grammY's filter query system is much more powerful.
