---
prev: ./transformers.md
next: ./deployment.md
---

# 代理支持

grammY 可以让你配置一系列关于网络请求怎么执行的东西。

这包括注入一个自定义的载荷到每一个请求中，该载荷可以被用于安装一个代理委托。

在 [grammY API 参考](https/deno.land/x/grammy/mod.ts#ApiClientOptions) 查看 `ApiClientOptions`

在 Node.js 中，下面是怎样用 `socks5-https-client` 这个 [npm](https://www.npmjs.com/package/socks5-https-client) 包去使用代理的例子：

```ts
import { Bot } from "grammy";
import SocksAgent from "socks5-https-client/lib/Agent";

const socksAgent = new SocksAgent({
  socksHost: proxyHost, // 输入代理主机
  socksPort: proxyPort, // 输入代理端口号
  socksUsername: proxyUser, // 输入用户名
  socksPassword: proxyPassword, // 输入密码
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
>
> 它和代理支持无关。
>
> 它只是 `baseFetchConfig` 默认值的一部分，所以如果你想要使用，你应该再次声明它。

让一个代理工作是很困难的。

如果你遇到问题或者你需要 grammY 去支持更多的配置选项，可以通过 [Telegram chat](https://t.me/grammyjs) 联系我们。
