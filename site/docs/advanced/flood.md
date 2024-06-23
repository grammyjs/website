# Scaling Up IV: Flood Limits

Telegram limits how many messages your bot can send each second.
This means that any API request you perform could error with status code 429 (Too Many Requests) and a `retry_after` header as specified [here](https://core.telegram.org/bots/api#responseparameters).
This can happen anytime.

There is only one correct way to handle these situations:

1. Wait for the specified number of seconds.
2. Retry the request.

Fortunately, there is a [plugin](../plugins/auto-retry) for that.

That plugin is [very simple](https://github.com/grammyjs/auto-retry/blob/main/src/mod.ts).
It literally just sleeps and retries.
However, using it has a major implication: **any request can be slow**.
This means that when you run your bot on webhooks, [you technically have to use a queue](../guide/deployment-types#ending-webhook-requests-in-time) no matter what you do, or else you need to configure the auto-retry plugin in a way that it never takes a lot of time---but then your bot may skip some requests.

## What the Exact Limits Are

They are unspecified.

Deal with it.

We have some good ideas about how many requests you can perform, but the exact numbers are unknown.
(If someone tells you the actual limits, they are not well-informed.)
The limits are not simply hard thresholds that you can find out by experimenting with the Bot API.
Rather, they are flexible constraints that change based on your bot's exact request payloads, the number of users, and other factors, not all of which are known.

Here are a few misconceptions and false assumptions about rate limits.

- My bot is too new to receive flood wait errors.
- My bot does not get enough traffic to receive flood wait errors.
- This feature of my bot is not used enough to receive flood wait errors.
- My bot leaves enough time between API calls so it will not receive flood wait errors.
- This particular method call cannot receive flood wait errors.
- `getMe` cannot receive flood wait errors.
- `getUpdates` cannot receive flood wait errors.

All of these are wrong.

Let's get to the things we _do_ know.

## Safe Assumptions About Rate Limits

From the [Bot FAQ](https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this), we know a few limits that cannot be exceeded, ever.

1. _"When sending messages inside a particular chat, avoid sending more than one message per second. We may allow short bursts that go over this limit, but eventually you'll begin receiving 429 errors."_

   This one should be pretty clear. The auto-retry plugin handles this for you.

2. _"If you're sending bulk notifications to multiple users, the API will not allow more than 30 messages per second or so. Consider spreading out notifications over large intervals of 8—12 hours for best results."_

   **This only applies to bulk notifications,** i.e. if you proactively message many users.
   If you are just responding to messages from users, then it is no problem to send 1,000 or more messages per second.

   When the Bot FAQ says that you should _"consider spreading out notifications over large intervals"_, this does not mean that you should add any artificial delays.
   Instead, the main takeaway here is that sending bulk notifications is a process that will take many hours.
   You cannot expect to message all users instantly at the same time.

3. _"Also note that your bot will not be able to send more than 20 messages per minute to the same group."_

   Again, pretty clear.
   Completely unrelated to bulk notifications or how many messages are sent in the group.
   And yet again, the auto-retry plugin will take care of this for you.

There are a few other known limits there were revealed outside of the official Bot API documentation.
For example, [it is known](https://t.me/tdlibchat/146123) that bots can only do up to 20 message edits in a minute per group chat.
However, this is the exception, and we also have to assume that these limits may be changed in the future.
Thus, this information does not affect how to program your bot.

For instance, throttling your bot based on these numbers is still a bad idea:

## Throttling

Some think that it is bad to run into rate limits.
They prefer to know the exact limits so they can throttle their bot.

This is incorrect.
Rate limits are a tool useful for flood control, and if you act accordingly, they won't have any negative impacts on your bot.
That is to say, hitting rate limits does not lead to bans.
Ignoring them does.

What's more, [according to Telegram](https://t.me/tdlibchat/47285), it is "useless and harmful" to know the exact limits.

It is _useless_ because even if you knew the limits, you would still have to handle flood wait errors.
For example, the Bot API server returns 429 while it shuts down in order to reboot during maintenance.

It is _harmful_ because if you were to artificially delay some requests in order to avoid hitting limits, the performance of your bot would be far from optimal.
This is why you should always make your requests as fast as possible but respect all flood wait errors (using the auto-retry plugin).

But if it is bad to throttle requests, how can you do broadcasting?

## How to Broadcast Messages

Broadcasting can be done following a very simple approach.

1. Send a message to a user.
2. If you receive 429, wait and retry.
3. Repeat.

Do not add artificial delays.
(They make broadcasting slower.)

Do not ignore 429 errors.
(This could lead to a ban.)

Do not send many messages in parallel.
(You can send very few messages in parallel (maybe 3 or so) but this can be challenging to implement.)

Step 2 in the above list is done automatically by the auto-retry plugin, so the code will look like this:

```ts
bot.api.config.use(autoRetry());

for (const [chatId, text] of broadcast) {
  await bot.api.sendMessage(chatId, text);
}
```

The interesting part here is what `broadcast` will be.
You need to have all your chats stored in some database, and you need to be able to slowly fetch all of them.

Currently, you will have to implement this logic yourself.
In the future, we want to create a broadcasting plugin.
We would be happy to take your contributions!
Join us [here](https://t.me/grammyjs).
