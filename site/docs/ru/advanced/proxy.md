# TODO translate to Russian

---
prev: ./transformers.md
next: ./deployment.md
---

# Proxy Support

grammY let's you configure a number of things about how network requests are performed.
This includes injecting a custom payload into every request, which can be used to install a proxy agent.
Check out the `ApiClientOptions` in the [grammY API Reference](https://deno.land/x/grammy/mod.ts?s=ApiClientOptions).

In Deno, here is how you would use an `http` proxy:

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const client = Deno.createHttpClient({
  proxy: { url: "http://host:port/" },
});
const bot = new Bot(TOKEN, {
  client: {
    baseFetchConfig: {
      // @ts-ignore
      client,
    },
  },
});
```

> Note that you need to run this with the `--unstable` flag.

In Node.js, here is how you would use a proxy with the `socks5-https-client` package ([npm](https://www.npmjs.com/package/socks-proxy-agent)):

```ts
import { Bot } from "grammy";
import { SocksProxyAgent } from "socks-proxy-agent";

const socksAgent = new SocksProxyAgent({
  host: host, // put in the proxy host
  port: port, // put in the proxy port
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

Getting a proxy to work can be difficult.
Contact us in the [Telegram chat](https://t.me/grammyjs) if you run into issues, or if you need grammY to support further configuration options.
We also have a [Russian Telegram chat](https://t.me/grammyjs_ru).
