---
prev: false
next: false
---

# Retry API Requests (`auto-retry`)

The auto-retry plugin is everything you need to handle [flood limits](../advanced/flood), i.e. errors with code 429.
It can be used for every bot during normal operation, but it will come especially handy during [broadcasting](../advanced/flood#how-to-broadcast-messages).

This plugin is an [API transformer function](../advanced/transformers), which means that it let's you intercept and modify outgoing HTTP requests on the fly.
More specifically, this plugin will automatically detect if an API requests fails with a `retry_after` value, i.e. because of rate limiting.
It will then catch the error, wait the specified period of time, and then retry the request.

In addition to handling flood limits, this plugin will retry a request if it fails with an internal server error, i.e. errors with code 500 or larger.
Networking errors (those that [throw an `HttpError`](../guide/errors.md#the-httperror-object) in grammY) will cause a retry, too.
Retrying such requests is more or less the only sane strategy to handle these two types of errors.
Since neither of them provide a `retry_after` value, the plugin employs exponential backoff starting at 3 seconds and capped at one hour.

## Installation

You can install this plugin on the `bot.api` object:

::: code-group

```ts [TypeScript]
import { autoRetry } from "@grammyjs/auto-retry";

// Use the plugin.
bot.api.config.use(autoRetry());
```

```js [JavaScript]
const { autoRetry } = require("@grammyjs/auto-retry");

// Use the plugin.
bot.api.config.use(autoRetry());
```

```ts [Deno]
import { autoRetry } from "https://deno.land/x/grammy_auto_retry/mod.ts";

// Use the plugin.
bot.api.config.use(autoRetry());
```

:::

If you now call e.g. `sendMessage` and run into a rate limit, it will look like the request just takes unusually long.
Under the hood, multiple HTTP requests are being performed, with the appropriate delays in between.

## Configuration

You may pass an options object that specifies a maximum number of retries (`maxRetryAttempts`), or a threshold for a maximum time to wait (`maxDelaySeconds`).

### Limiting Retries

As soon as the maximum number of retries is exhausted, subsequent errors for the same request will not be retried again.
Instead, the error object from Telegram is passed on, effectively failing the request with a [`GrammyError`](../guide/errors#the-grammyerror-object).

Similarly, if the request ever fails with `retry_after` larger than what is specified by the option `maxDelaySeconds`, the request will fail immediately.

```ts
autoRetry({
  maxRetryAttempts: 1, // only repeat requests once
  maxDelaySeconds: 5, // fail immediately if we have to wait >5 seconds
});
```

### Rethrowing Internal Server Errros

You can use `rethrowInternalServerErrors` to opt out of handling internal server errors as described [above](#retry-api-requests-auto-retry).
Again, the error object from Telegram is passed on, effectively failing the request with a [`GrammyError`](../guide/errors#the-grammyerror-object).

```ts
autoRetry({
  rethrowInternalServerErrors: true, // do not handle internal server errors
});
```

### Rethrowing Networking Errros

You can use `rethrowHttpErrors` to opt out of handling networking errors as described [above](#retry-api-requests-auto-retry).
If enabled, the thrown [`HttpError`](../guide/errors.md#the-httperror-object) instances are passed on, failing the request.

```ts
autoRetry({
  rethrowHttpErrors: true, // do not handle networking errors
});
```

## Plugin Summary

- Name: `auto-retry`
- [Source](https://github.com/grammyjs/auto-retry)
- [Reference](/ref/auto-retry/)
