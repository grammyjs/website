---
prev: ./transformers.md
next: ./deployment.md
---

# Supporto Proxy

grammY consente di configurare diverse opzioni relative a come vengono eseguite le richieste di rete.
Questo include l'inserimento di un payload personalizzato in ogni richeista, che può essere utilizzato per inizializzare un agente proxy.
Consulta `ApiClientOptions` nella [grammY API Reference](https://deno.land/x/grammy/mod.ts?s=ApiClientOptions).

In Deno, ecco come utilizzare un proxy `http`:

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

> Nota che è necessario eseguirlo con l'opzione `--unstable`.

In Node.js, ecco come utilizzare un proxy con il pacchetto `socks-proxy-agent` ([npm](https://www.npmjs.com/package/socks-proxy-agent)):

```ts
import { Bot } from "grammy";
import { SocksProxyAgent } from "socks-proxy-agent";

const socksAgent = new SocksProxyAgent({
  hostname: host, // put in the proxy host
  port: port, // inserire la porta del proxy
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

> Nota che specificare `compress: true` è un opzione di ottimizzazione delle prestazioni facoltativa.
> Non ha nulla a che fare con il supporto al proxy.
> Fa parte del valore predefinito per `baseFetchConfig`, quindi se lo vuoi comunque, devi specificarlo di nuovo.

Riuscire a far funzionare un proxy può essere difficile.
Contattaci nella [chat Telegram](https://t.me/grammyjs) se riscontri problemi o se hai bisogno che grammY supporti altre opzioni di configurazione.
Abbiamo anche una [chat Telegram russa](https://t.me/grammyjs_ru).
