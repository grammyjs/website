# Retry API Requests (`auto-retry`)

> Consider using [the throttler plugin](./transformer-throttler.md) instead.

This plugin is an [API transformer function](/advanced/transformers.md), which means that it let's you intercept and modify outgoing HTTP requests on the fly.
More specifically, this plugin will automatically detect if an API requests fails with a `retry_after` value. i.e. because of rate limiting.
It will then catch the error, wait the specified period of time, and then retry the request.

::: warning Be Gentle With the Bot API Server
Telegram is generously providing information about how long your bot must wait before the next request.
Using the `auto-retry` plugin will allow your bot to perform better during load spikes, as the requests will not simply fail because of the flood limit.
However, **auto-retry should not be used** if you want to avoid hitting rate limits on a regular basis.
If you regularly cross the threshold of how many requests you may perform, Telegram may take measures such as restricting or banning your bot.
:::

You can install this plugin on the `bot.api` object:

<CodeGroup>
  <CodeGroupItem title="TS" active>

```ts
import { autoRetry } from "@grammyjs/auto-retry";

// Use the plugin.
bot.api.config.use(autoRetry());
```

</CodeGroupItem>
 <CodeGroupItem title="JS">

```js
const { autoRetry } = require("@grammyjs/auto-retry");

// Use the plugin
bot.api.config.use(autoRetry());
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { autoRetry } from "https://cdn.skypack.dev/@grammyjs/auto-retry?dts";

// Use the plugin.
bot.api.config.use(autoRetry());
```

</CodeGroupItem>
</CodeGroup>

If you now call e.g. `sendMessage` and run into a rate limit, it will look like the request just takes unusually long.
Under the hood, multiple HTTP requests are being performed, with the appropriate delays in between.

You may pass an options object that specifies a maximum number of retries (`maxRetryAttempts`, default: 3), or a threshold for a maximum time to wait (`maxDelaySeconds`, default: 1 hour).

As soon as the maximum number of retries is exhausted, subsequent errors for the same request will not be retried again.
Instead, the error object from Telegram is passed on, effectively failing the request with a [`GrammyError`](/guide/errors.html#the-grammyerror-object).

Similarly, if the request ever fails with `retry_after` larger than what is specified by the option `maxDelaySeconds`, the request will fail immediately.

```ts
autoRetry({
  maxRetryAttempts: 1, // Repeat requests once, only.
  maxDelaySeconds: 5, // Fall immediately if we have to wait more than 6 seconds.
});
```

## Plugin Summary

- Name: `auto-retry`
- Source: <https://github.com/grammyjs/auto-retry>
- Reference: <https://doc.deno.land/https/raw.githubusercontent.com%2Fgrammyjs%2Fauto-retry%2Fmain%2Fsrc%2Findex.ts>
