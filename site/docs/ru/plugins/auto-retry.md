---
prev: false
next: false
---

# Повторные запросы к API (`auto-retry`)

Плагин auto-retry - это все, что нужно для борьбы с [лимитами флуда](../advanced/flood), то есть ошибками с кодом 429.
Его можно использовать для каждого бота во время обычной работы, но особенно он пригодится во время [трансляции сообщений](../advanced/flood#как-транслировать-сообщения).

Этот плагин представляет собой [трансформирующую функцию API](../advanced/transformers), что означает, что он позволяет перехватывать и изменять исходящие HTTP-запросы на лету.
Более конкретно, этот плагин автоматически определяет, если API-запрос не выполняется со значением `retry_after`, т. е. из-за ограничения скорости.
Он перехватит ошибку, подождет указанный период времени, а затем повторит запрос.

В дополнение к обработке ограничения скорости, этот плагин повторит запрос, если он завершился с внутренней ошибкой сервера, т.е. ошибкой с кодом 500 или больше.
Сетевые ошибки (те, которые [бросают `HttpError`](../guide/errors#объект-httperror) в grammY) также будут вызывать повторную попытку.
Повторное выполнение таких запросов - более или менее единственная разумная стратегия обработки этих двух типов ошибок.
Поскольку ни одна из них не предоставляет значения `retry_after`, плагин использует экспоненциальный возврат, начинающийся с 3 секунд и ограничивающийся одним часом.

## Установка

You can install this plugin on the `bot.api` object:

::: code-group

```ts [TypeScript]
import { autoRetry } from "@grammyjs/auto-retry";

// Use the plugin.
bot.api.config.use(autoRetry());
```

```js [JavaScript]
const { autoRetry } = require("@grammyjs/auto-retry");

// Use the plugin.
bot.api.config.use(autoRetry());
```

```ts [Deno]
import { autoRetry } from "https://deno.land/x/grammy_auto_retry/mod.ts";

// Use the plugin.
bot.api.config.use(autoRetry());
```

:::

If you now call e.g. `sendMessage` and run into a rate limit, it will look like the request just takes unusually long.
Under the hood, multiple HTTP requests are being performed, with the appropriate delays in between.

## Настройка

You may pass an options object that specifies a maximum number of retries (`maxRetryAttempts`), or a threshold for a maximum time to wait (`maxDelaySeconds`).

### Ограничение повторов

As soon as the maximum number of retries is exhausted, subsequent errors for the same request will not be retried again.
Instead, the error object from Telegram is passed on, effectively failing the request with a [`GrammyError`](../guide/errors#the-grammyerror-object).

Similarly, if the request ever fails with `retry_after` larger than what is specified by the option `maxDelaySeconds`, the request will fail immediately.

```ts
autoRetry({
  maxRetryAttempts: 1, // only repeat requests once
  maxDelaySeconds: 5, // fail immediately if we have to wait >5 seconds
});
```

### Повторный запрос ошибок внутреннего сервера

You can use `rethrowInternalServerErrors` to opt out of handling internal server errors as described [above](#retry-api-requests-auto-retry).
Again, the error object from Telegram is passed on, effectively failing the request with a [`GrammyError`](../guide/errors#the-grammyerror-object).

```ts
autoRetry({
  rethrowInternalServerErrors: true, // do not handle internal server errors
});
```

### Повторный запрос сетевых ошибок

You can use `rethrowHttpErrors` to opt out of handling networking errors as described [above](#retry-api-requests-auto-retry).
If enabled, the thrown [`HttpError`](../guide/errors#the-httperror-object) instances are passed on, failing the request.

```ts
autoRetry({
  rethrowHttpErrors: true, // do not handle networking errors
});
```

## Краткая информация о плагине

- Название: `auto-retry`
- [Исходник](https://github.com/grammyjs/auto-retry)
- [Документация](/ref/auto-retry/)
