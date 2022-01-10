---
prev: ./transformers.md
next: ./deployment.md
---

# 代理支持

grammY 可以让你对网络请求如何执行进行配置。
这包括注入一个自定义的 payload 到每一个请求中，它可以被用于安装一个代理。
在 [grammY API 参考](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/ApiClientOptions) 中查看 `ApiClientOptions`。

在 Node.js 中，下面是怎样用 `socks5-https-client` 这个 [npm](https://www.npmjs.com/package/socks-proxy-agent) 包去使用代理的例子：

```ts
import { Bot } from "grammy";
import { SocksProxyAgent } from "socks-proxy-agent";

const socksAgent = new SocksProxyAgent({
  host: host, // 输入代理主机
  port: port, // 输入代理端口号
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

> 注意声明 `compress: true` 是一个可选的性能优化。
> 它和代理支持无关。
> 它只是 `baseFetchConfig` 默认值的一部分，所以如果你想要使用，你应该再次声明它。

让一个代理工作是很困难的。
如果你遇到问题或者你需要 grammY 去支持更多的配置选项，可以通过 [Telegram chat](https://t.me/grammyjs) 联系我们。
我们还有一个 [俄语 Telegram chat](https://t.me/grammyjs_ru)。
