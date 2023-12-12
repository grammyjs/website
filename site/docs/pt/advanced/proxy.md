# Suporte a Proxy

O grammY te permite configurar uma série de coisas sobre como requisições são performadas.
Isso inclui a injeção de payloads customizados a cada requisição, o que pode ser feito instalando um agente de proxy.
Confira nossa `ApiClientOptions` na [Referência de API do grammY](https://deno.land/x/grammy/mod.ts?s=ApiClientOptions).

Você pode usar um proxy `http` da seguinte forma no Deno:

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

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

> Note que você precisa executar isso com a flag `--unstable`.

No Node.js você pode usar um proxy com o pacote `socks-proxy-agent` do ([npm](https://www.npmjs.com/package/socks-proxy-agent)):

```ts
import { Bot } from "grammy";
import { SocksProxyAgent } from "socks-proxy-agent";

const socksAgent = new SocksProxyAgent({
  hostname: host, // coloque o host do proxy
  port: port, // coloque a porta do proxy
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

> Note que especificar `compress: true` é uma otimização de performance opcional
> Isso não tem nada a ver com o suporte a proxy.
> Isso é parte do valor padrão para `baseFetchConfig`, então se você ainda quiser isso, deve especificar novamente.

Conseguir um proxy para trabalhar pode ser difícil.
Chama gente no nosso [Chat do Telegram](https://t.me/grammyjs) se você tiver qualquer problema, ou caso precise que o grammY suporte outras opções de configuração.
Também temos um [chat Russo do Telegram](https://t.me/grammyjs_ru).
