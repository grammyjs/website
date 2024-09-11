# Поддержка прокси

grammY позволяет настраивать выполнение сетевых запросов.
Это включает в себя инъекцию пользовательского payload в каждый запрос, который может быть использована для установки прокси-агента.
Посмотрите `ApiClientOptions` в [документации grammY API](/ref/core/apiclientoptions).

В Deno вот как можно использовать `http` прокси:

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

> Обратите внимание, что вам нужно запустить это с флагом `--unstable`.

В Node.js вот как можно использовать прокси с пакетом `socks-proxy-agent` ([npm](https://www.npmjs.com/package/socks-proxy-agent)):

```ts
import { Bot } from "grammy";
import { SocksProxyAgent } from "socks-proxy-agent";

const socksAgent = new SocksProxyAgent({
  hostname: host, // введите хост прокси-сервера
  port: port, // введите порт прокси-сервера
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

> Обратите внимание, что указание `compress: true` --- это необязательная оптимизация производительности.
> Она не имеет никакого отношения к поддержке прокси.
> Она является частью значения по умолчанию для `baseFetchConfig`, так что если вы все еще хотите ее получить, вам следует указать ее снова.

Заставить прокси работать может быть непросто.
Свяжитесь с нами в [Telegram чате](https://t.me/grammyjs), если у вас возникнут проблемы, или если вам нужно, чтобы grammY поддерживал дополнительные параметры конфигурации.
У нас также есть [русскоязычный Telegram чат](https://t.me/grammyjs_ru).
