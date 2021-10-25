---
prev: ./transformers.md
next: ./deployment.md
---

# Proxy Support

grammY let's you configure a number of things about how network requests are performed.
This includes injecting a custom payload into every request, which can be used to install a proxy agent.
Check out the `ApiClientOptions` in the [grammY API Reference](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#ApiClientOptions).

In Node.js, here is how you would use a proxy with the `socks5-https-client` package ([npm](https://www.npmjs.com/package/socks5-https-client)):

```ts
import { Bot } from "grammy";
import SocksAgent from "socks5-https-client/lib/Agent";

const socksAgent = new SocksAgent({
  socksHost: proxyHost, // put in the proxy host
  socksPort: proxyPort, // put in the proxy port
  socksUsername: proxyUser, // put in the username
  socksPassword: proxyPassword, // put in the password
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

> Note that specifying `compress: true` is an optional performance optimisation.
> It has nothing to do with proxy support.
> It is part of the default value for `baseFetchConfig`, so if you still want it, you should specify it again.

Getting a proxy to work can be difficult.
Contact us in the [Telegram chat](https://t.me/grammyjs) if you run into issues, or if you need grammY to support further configuration options.
