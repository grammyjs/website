---
prev:
  text: About grammY
  link: ./about
---

# FAQ

Here is a collection of frequently asked questions that did not fit anywhere else.
Questions regarding [common errors](#why-am-i-getting-this-error) and [Deno things](#questions-about-deno) were grouped in the two dedicated sections.

If this FAQ does not answer your question, you should also have a look at the [Bot FAQ](https://core.telegram.org/bots/faq) written by the Telegram team.

## Where Can I Find Docs About a Method?

In the API reference.
You probably want to understand [this](../guide/) better.

## A Method Is Missing a Parameter!

No, it's not.

1. Make sure you have the latest grammY version installed.
2. Check [here](https://core.telegram.org/bots/api) if the parameter is optional.
   If it is, then grammY will collect it in the options object called `other`.
   Pass `{ parameter_name: value }` in that place and it'll work.
   As always, TypeScript will auto-complete the parameter names for you.
3. Perhaps double-check the method signature for [actions](../guide/context#available-actions) on `ctx` [here](/ref/core/context#methods), or for API methods (`ctx.api`, `bot.api`) [here](/ref/core/api#methods).

## How Can I Access the Chat History?

You can't.

Telegram does not store the messages for your bot.

Instead, you need to wait for new messages/channel posts to arrive, and store the messages in your database.
You can then load the chat history from your database.

This is what [conversations](../plugins/conversations) do internally for the relevant part of the message history.

## How Can I Handle Albums?

You can't ... at least not in the way you think.

An album only really exists in the UI of a Telegram client.
For a bot, handling a media group is the same thing as handling a series of individual messages.
The most practical advice is to ignore that media groups exist, and to simple write your bot with individual messages in mind.
Albums will then work automatically.
For example, you can ask the user to [click a button](../plugins/keyboard#inline-keyboards) or send `/done` when all files are uploaded to your bot's chat.

_But if a Telegram client can do it, then my bot should be able to do the same thing!_

Yes and no.
Technically, there is the `media_group_id` which lets you determine the messages that belong to the same album.
However,

- there is no way to know the number of messages in an album,
- there is no way to know when the last message in an album was received, and
- other messages such text messages, service messages, etc may be sent in between album messages.

So yes, in theory, you can know which messages belong to together, but only regarding the messages you have received so far.
You cannot know if there will be more messages added to the album at a later point.
If you ever receive an album on a Telegram client while having _extremely_ bad internet connection, you can actually see how the client repeatedly regroups the album as new messages arrive.

## Why Am I Getting This Error?

### 400 Bad Request: Cannot parse entities

You are sending a message with formatting, i.e. you're setting `parse_mode` when sending a message.
However, your formatting is broken, so Telegram does not know how to parse it.
You should re-read the [section about formatting](https://core.telegram.org/bots/api#formatting-options) in the Telegram docs.
The byte offset that is mentioned in the error message will tell you where exactly the error is in your string.

::: tip Passing entities instead of formatting
You can pre-parse the entities for Telegram if you want, and specify `entities` when sending your message.
Your message text could then be a regular string.
That way, you don't have to worry about escaping weird characters.
This may look like it needs more code, but in fact it is the far more reliable and fool-proof solution to this problem.
Most importantly, this is greatly simplified by our [parse-mode plugin](../plugins/parse-mode).
:::

### 401 Unauthorized

Your bot token is wrong.
Maybe you think it's right.
It is not.
Talk to [@BotFather](https://t.me/BotFather) to see what your token is.

### 403 Forbidden: bot was blocked by the user

You probably tried to send a message to a user and then you ran into this issue.

When a user blocks your bot, you are not able to send messages to them or interact with them in any other way (except if your bot was invited to a group chat where the user is a member).
Telegram does this to protect their users.
You cannot do anything about it.

You can either:

- Handle the error and for example delete the user's data from your database.
- Ignore the error.
- Listen for `my_chat_member` updates via `bot.on("my_chat_member")` in order to be notified when the user blocks your bot.
  Hint: Compare the `status` fields of the old and the new chat member.

### 404 Not found

If this happens while starting your bot, then your bot token is wrong.
Talk to [@BotFather](https://t.me/BotFather) to see what your token is.

If your bot works fine most of the time, but then suddenly you're getting a 404, then you're doing something very funky.
You can come ask us in the [group chat](https://t.me/grammyjs) (or the [Russian-speaking group chat](https://t.me/grammyjs_ru)).

### 409 Conflict: terminated by other getUpdates request

You are accidentally running your bot twice on long polling.
You can only run one instance of your bot.

If you think that you only run your bot once, you can just revoke the bot token.
That will stop all other instances.
Talk to [@BotFather](https://t.me/BotFather) to do this.

### 429: Too Many Requests: retry after X

Congratulations!
You ran into an error that is among the most difficult ones to fix.

There are two possible scenarios:

**One:** Your bot does not have many users.
In that case, you are just spamming the Telegram servers by sending too many requests.
Solution: don't do that!
You should seriously think about how to reduce the number of API calls substantially.

**Two:** Your bot is getting very popular and it has a lot of users (hundreds of thousands).
You have already made sure to use the minimum number of API calls for the most common operations of your bot, and _still_ you're running into these errors (called flood wait).

There are a few things you can do:

1. Read this [article](../advanced/flood) in the docs to gain a basic understanding of the situation.
2. Use the [`auto-retry` plugin](../plugins/auto-retry).
3. Come ask us in the [group chat](https://t.me/grammyjs) for help.
   We have experienced people there.
4. It is possible to ask Telegram to increase the limits, but this is very unlikely to happen if you did not do steps 1-3 first.

### Cannot find type definition file for 'node-fetch'

This is the result of some missing type declarations.

The recommended way to fix this is to set `skipLibCheck` to `true` in your TypeScript compile options.

If you are sure that you need this option to be kept to `false`, you can instead install the missing type definitions by running `npm i -D @types/node-fetch@2`.

## Questions About Deno

### Why do you support Deno?

Some important reasons why we like Deno more than Node.js:

- It's simpler and faster to get started.
- The tooling is substantially better.
- It natively executes TypeScript.
- No need to maintain `package.json` or `node_modules`.
- It has a reviewed standard library.

> Deno was founded by Ryan Dahl---the same person that invented Node.js.
> He summarized his 10 regrets about Node.js in this [video](https://youtu.be/M3BM9TB-8yA).

grammY itself is Deno-first, and it is backported to support Node.js equally well.
