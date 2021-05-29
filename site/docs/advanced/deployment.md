---
prev: ./proxy.md
---

# Deployment Checklist

Here is a list of things that you may want to keep in mind when hosting a large bot.

## Errors

1. [Install an error handler with `bot.catch`.](/guide/errors.md)
2. [Install an error handler with `bot.catch`.](/guide/errors.md)
3. Also, don't forget to [install an error handler with `bot.catch`.](/guide/errors.md)
4. Use `await` on all promises, and installed **linting** tools that make sure you cannot forget this.

## Message sending

1. Send files by path or `Buffer` instead of by stream, or at least make sure you [know the pitfalls](./transformers.md#use-cases-of-transformer-functions).
2. Use `bot.on('callback_query:data')` as the fallback handler to [react to all callback queries](/plugins/keyboard.md#responding-to-clicks).
3. Use [the `transformer-throttler` plugin](/plugins/transformer-throttler.md) to avoid hitting rate limits.

## Scaling

This depends on your deployment type.

### Long polling

1. [Use grammY runner.](/plugins/runner.md)
2. [Use `sequentialize` with the same session key resolver function as your session middleware.](./scaling.md#concurrency-is-hard)
3. Go through the configuration options of `run` ([API reference](https://doc.deno.land/https/deno.land/x/grammy_runner/mod.ts#run)) and make sure they fit your needs, or even consider composing your own runner out of sources and sinks.
4. Consider listening for `SIGINT` and `SIGTERM` events in order to stop your bot gracefully when you want to terminate it (i.e. to switch to a new version).
   This can be done via the handle that the grammY runner gives you.
   (If you ignored point 1. for some reason and you are using built-in long polling, call `bot.stop` instead.)

### Webhooks

1. If you adjusted the `getSessionKey` option for your session, [use `sequentialize` with the same session key resolver function as your session middleware.](./scaling.md#concurrency-is-hard)
2. Make yourself familiar with the configuration of `webhookCallback` [API refenece](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#webhookCallback).
3. If you are running on a serverless or autoscaling platform, [set the bot information](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#BotConfig) to prevent excessive `getMe` calls.
4. Consider using [webhook replies](/guide/deployment-types.html#webhook-reply).

## Sessions

1. Consider using `lazySessions` as explained [here](/plugins/session.md#lazy-sessions).
2. Use the `storage` option to set your storage adapter, otherwise all data will be lost when the bot process stops.

## Testing

Write tests for your bot.
This can be done with grammY like so:

1. Mock outgoing API requests using [transformer functions](./transformers.md).
2. Define and send sample update objects to your bot via `bot.handleUpdate` (API reference).
   Consider to take some inspiration from [these update objects](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates) provided by the Telegram team.
