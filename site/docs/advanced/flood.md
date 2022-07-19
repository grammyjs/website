---
prev: ./reliability.md
next: ./transformers.md
---

# Scaling Up IV: Flood Limits

Telegram restricts how many messages your bot can send per second, confer the [Bot FAQ](https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this).
You should always make sure to stay below these limits, otherwise your bot gets rate limited.
If you ignore these errors, your bot may eventually be banned.

## The Simple Solution

:::warning Not a Real Solution
This section solves your problem short-term, but if you are building a bot that should actually scale well, read [the next subsection](#the-real-solution-recommended) instead.
:::

There is a very simple solution to hitting rate limits: if an API request fails due to a rate limit, just wait the time Telegram tells you to wait, and repeat the request.

If you want to do this, you can use [the super simple `auto-retry` plugin](../plugins/auto-retry.md).
It is an [API transformer function](./transformers.md) that does exactly that.

However, if the traffic to your bot increases rapidly, e.g.,when it is added to a large group, it may run into a lot of rate limiting errors before the traffic spike settles.
This could lead to a ban.
Moreover, as requests might be tried several times, your server will consume more RAM and bandwidth than necessary.
Instead of fixing the problem after the fact, it is much better to enqueue all API requests and only send them at the permitted speed:

## The Real Solution (recommended)

grammY provides you with [the throttler plugin](../plugins/transformer-throttler.md) that automatically makes your bot respect all rate limits by enqueuing the outgoing requests of your bot in a message queue.
This plugin is just as simple to set up but does a much better job at flood control.
There isn't really any good reason to use `auto-retry` over the throttler plugin.
In some cases it may make sense to use both.
