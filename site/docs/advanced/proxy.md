# Proxy Support

grammY lets you configure a number of things about how network requests are performed.
This includes injecting a custom payload into every request, which can be used to install a proxy agent.
Check out the `ApiClientOptions` in the [grammY API Reference](/ref/core/apiclientoptions).

In Deno, here is how you would use an `http` proxy:

```ts
import { Bot } from "npm:grammy";

const client = Deno.createHttpClient({
  proxy: { url: "http://host:port/" },
});
const bot = new Bot("", {
  client: {
    baseFetchConfig: {
      // @ts-ignore
      client,
    },
  },
});
```

> Note that you need to run this with the `--unstable` flag.

In Node.js, here is how you would use a proxy with the `socks-proxy-agent` package ([npm](https://www.npmjs.com/package/socks-proxy-agent)):

```ts
import { Bot } from "grammy";
import { SocksProxyAgent } from "socks-proxy-agent";

const socksAgent = new SocksProxyAgent("socks5://host:port", {
  timeout: 60_000, // close stalled connections after 60 seconds
});

const bot = new Bot("", {
  client: {
    baseFetchConfig: {
      agent: socksAgent,
      compress: true,
    },
  },
});
```

> Note that specifying `compress: true` is an optional performance optimization.
> It has nothing to do with proxy support.
> It is part of the default value for `baseFetchConfig`, so if you still want it, you should specify it again.

Specifying a `timeout` for the agent is not optional, though.
Proxied connections can die silently, for example when the SSH tunnel behind a SOCKS proxy (`ssh -D`) loses its connection.
Nobody notices this, so Node.js keeps waiting for a response that will never arrive.
grammY only gives up on the request after [`timeoutSeconds`](/ref/core/apiclientoptions#timeoutseconds) have passed, which is 500 seconds by default.
Until then, your bot hangs without any error, and it does not receive any updates.

The `timeout` option makes the agent close the connection if no data was sent or received for the given number of milliseconds.
grammY then reports an error and retries the request.

::: warning Long Polling Timeout
When you use long polling, Telegram keeps the connection open without sending any data for up to 30 seconds.
Make sure that the `timeout` of the agent is larger than that, or else every long polling request without new updates will be cancelled.
If you pass a custom `timeout` to `bot.start()`, adjust the `timeout` of the agent accordingly.
:::

Getting a proxy to work can be difficult.
Contact us in the [Telegram chat](https://t.me/grammyjs) if you run into issues, or if you need grammY to support further configuration options.
We also have a [Russian Telegram chat](https://t.me/grammyjs_ru).
