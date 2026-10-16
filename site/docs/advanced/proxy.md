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

Be sure to specify the `timeout` option for the agent.
It causes the connection to be dropped if no data was sent or received for the given number of milliseconds.
This is important because connections can die silently, for example when the SSH tunnel behind a SOCKS proxy (`ssh -D`) loses its connection.
grammY has its own timeout of 500 seconds which cancels the request, but **it is unable to drop the underlying connections**.
Setting this option fixes that.

> Note that specifying `compress: true` is an optional performance optimization.
> It has nothing to do with proxy support.
> It is part of the default value for `baseFetchConfig`, so if you still want it, you should specify it again.

Getting a proxy to work can be difficult.
Contact us in the [Telegram chat](https://t.me/grammyjs) if you run into issues, or if you need grammY to support further configuration options.
We also have a [Russian Telegram chat](https://t.me/grammyjs_ru).
