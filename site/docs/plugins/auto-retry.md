# Retry API Requests (`auto-retry`)

This plugin is an [API transformer function](../advanced/transformers.md), which means that it let's you intercept and modify outgoing HTTP requests on the fly.
More specifically, this plugin will automatically detect if an API requests fails with a `retry_after` value, i.e. because of rate limiting.
It will then catch the error, wait the specified period of time, and then retry the request.

:::tip Flood Control and Broadcasting
Telegram will let you know if you send messages too fast.
This is an important measure for flood control, as it makes sure that your bot does not put Telegram under too much load.
Using this plugin is important because if you forget to respect 429 errors, Telegram may ban your bot.
:::

You can install this plugin on the `bot.api` object:

::::code-group
:::code-group-item TypeScript

```ts
import { autoRetry } from "@grammyjs/auto-retry";

// Use the plugin.
bot.api.config.use(autoRetry());
```

:::
:::code-group-item JavaScript

```js
const { autoRetry } = require("@grammyjs/auto-retry");

// Use the plugin.
bot.api.config.use(autoRetry());
```

:::
:::code-group-item Deno

```ts
import { autoRetry } from "https://esm.sh/@grammyjs/auto-retry";

// Use the plugin.
bot.api.config.use(autoRetry());
```

:::
::::

If you now call e.g. `sendMessage` and run into a rate limit, it will look like the request just takes unusually long.
Under the hood, multiple HTTP requests are being performed, with the appropriate delays in between.

You may pass an options object that specifies a maximum number of retries (`maxRetryAttempts`, default: 3), or a threshold for a maximum time to wait (`maxDelaySeconds`, default: 1 hour).

As soon as the maximum number of retries is exhausted, subsequent errors for the same request will not be retried again.
Instead, the error object from Telegram is passed on, effectively failing the request with a [`GrammyError`](../guide/errors.md#the-grammyerror-object).

Similarly, if the request ever fails with `retry_after` larger than what is specified by the option `maxDelaySeconds`, the request will fail immediately.

```ts
autoRetry({
  maxRetryAttempts: 1, // only repeat requests once
  maxDelaySeconds: 5, // fail immediately if we have to wait >5 seconds
});
```

You can use `retryOnInternalServerErrors` to include all other internal server errors by Telegram (status code >= 500) in the above procedure.
Those errors will be retried immediately, but they also respect the `maxRetryAttempts` option.

## Plugin Summary

- Name: `auto-retry`
- Source: <https://github.com/grammyjs/auto-retry>
- Reference: <https://doc.deno.land/https://raw.githubusercontent.com/grammyjs/auto-retry/main/src/index.ts>
