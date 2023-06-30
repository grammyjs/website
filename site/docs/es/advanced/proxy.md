# Soporte Proxy

grammY le permite configurar una serie de cosas sobre cómo se realizan las peticiones de red.
Esto incluye inyectar un payload personalizado en cada petición, que puede ser usado para instalar un agente proxy.
Mira las `ApiClientOptions` en la [referencia de la API de grammY](https://deno.land/x/grammy/mod.ts?s=ApiClientOptions).

En Deno, así es como se usaría un proxy `http`:

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

> Note that you need to run this with the `--unstable` flag.

En Node.js, así es como usarías un proxy con el paquete `socks-proxy-agent` ([npm](https://www.npmjs.com/package/socks-proxy-agent)):

```ts
import { Bot } from "grammy";
import { SocksProxyAgent } from "socks-proxy-agent";

const socksAgent = new SocksProxyAgent({
  hostname: host, // proxy host
  port: port, // proxy port
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

> Tenga en cuenta que especificar `compress: true` es una optimización de rendimiento opcional.
> No tiene nada que ver con el soporte de proxy.
> Es parte del valor por defecto de `baseFetchConfig`, así que si todavía lo quieres, debes especificarlo de nuevo.

Conseguir que un proxy funcione puede ser difícil.
Contacta con nosotros en el [chat de Telegram](https://t.me/grammyjs) si tienes problemas, o si necesitas que grammY soporte más opciones de configuración.
También tenemos un [chat ruso de Telegram](https://t.me/grammyjs_ru).
