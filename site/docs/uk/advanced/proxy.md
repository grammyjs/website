---
prev:
  link: ./transformers
next:
  link: ./deployment
---

# Підтримка проксі

grammY дозволяє вам налаштувати деякі параметри виконання мережевих запитів.
Це включає в себе додання власних параметрів в кожен запит, наприклад, для встановлення проксі-агента.
Ознайомтеся з `ApiClientOptions` у [довідці API grammY](https://deno.land/x/grammy/mod.ts?s=ApiClientOptions).

Ось як у Deno можна використовувати проксі-сервер `http`:

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

> Зауважте, що вам слід запускати цю програму з прапором `--unstable`.

Ось як у Node.js можна використовувати проксі з пакетом `socks-proxy-agent` ([npm](https://www.npmjs.com/package/socks-proxy-agent)):

```ts
import { Bot } from "grammy";
import { SocksProxyAgent } from "socks-proxy-agent";

const socksAgent = new SocksProxyAgent({
  hostname: host, // вкажіть хост проксі-сервера
  port: port, // вкажіть порт проксі-сервера
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

> Зауважте, що параметр `compress: true` є необовʼязковою оптимізацією продуктивності.
> Це не має нічого спільного з підтримкою проксі.
> Він є частиною початкового значення для `baseFetchConfig`, тому, якщо ви все ще хочете його використовувати, вам слід вказати його.

Змусити проксі працювати може бути складно.
Звʼяжіться з нами у [чаті Telegram](https://t.me/grammyjs), якщо у вас виникнуть проблеми або якщо вам потрібна підтримка grammY інших параметрів конфігурації.
У нас також є [російськомовний чат Telegram](https://t.me/grammyjs_ru).
