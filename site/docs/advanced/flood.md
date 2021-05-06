---
prev: ./reliability.md
next: ./transformers.md
---

# Scaling Up IV: Flood Limits

Telegram restricts how many messages your bot can send, confer the [Bot FAQ](https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this).
You should always make sure to stay below these limits.

In the future, we want to provide you with a plugin that automatically handles this for you by enqueuing the outgoing requests of your bot, and that will eventually slow down the processing to prevent your bot from running out of memory.
Until then, you can try writing your own solution on top of [transformer functions](./transformers.md).
