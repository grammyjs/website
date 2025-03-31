---
prev: false
next: false
---

# Контроль флуда (`transformer-throttler`)

> Вместо этого используйте плагин [auto-retry](./auto-retry).

Этот плагин регистрирует исходящие API-запросы через
[Bottleneck](https://github.com/SGrondin/bottleneck), чтобы ваш бот не сбивал
[ограничения скорости](https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this),
как описано в этом [расширенном разделе](../advanced/flood) документации.

::: warning Существуют недокументированные ограничения API Telegram реализует
неопределенные и недокументированные ограничения скорости для некоторых вызовов
API. Эти недокументированные ограничения **не учитываются** троттлером. Если вы
все еще хотите использовать этот плагин, подумайте об использовании плагина
[auto-retry](./auto-retry) вместе с ним. :::

## Использование

Вот пример того, как использовать этот плагин с параметрами по умолчанию.
Обратите внимание, что параметры по умолчанию соответствуют фактическим
ограничениям скорости, установленным Telegram, так что они должны быть в
порядке.

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { run } from "@grammyjs/runner";
import { apiThrottler } from "@grammyjs/transformer-throttler";

const bot = new Bot("");

const throttler = apiThrottler();
bot.api.config.use(throttler);

bot.command("example", (ctx) => ctx.reply("Я затроттлил"));

// Если вы используете троттлер, то, скорее всего, захотите использовать runner для одновременной обработки обновлений.
run(bot);
```

```js [JavaScript]
const { Bot } = require("grammy");
const { run } = require("@grammyjs/runner");
const { apiThrottler } = require("@grammyjs/transformer-throttler");

const bot = new Bot("");

const throttler = apiThrottler();
bot.api.config.use(throttler);

bot.command("example", (ctx) => ctx.reply("Я затроттлил"));

// Если вы используете троттлер, то, скорее всего, захотите использовать runner для одновременной обработки обновлений.
run(bot);
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { run } from "https://deno.land/x/grammy_runner/mod.ts";
import { apiThrottler } from "https://deno.land/x/grammy_transformer_throttler/mod.ts";

const bot = new Bot("");

const throttler = apiThrottler();
bot.api.config.use(throttler);

bot.command("example", (ctx) => ctx.reply("Я затроттлил"));

// Если вы используете троттлер, то, скорее всего, захотите использовать runner для одновременной обработки обновлений.
run(bot);
```

:::

## Настройка

Троттлер принимает один необязательный аргумент следующего вида:

```ts
type ThrottlerOptions = {
  global?: Bottleneck.ConstructorOptions; // для троттлинга всех вызовов API
  group?: Bottleneck.ConstructorOptions; // для троттлинга исходящих групповых сообщений
  out?: Bottleneck.ConstructorOptions; // для троттлинга исходящих личных сообщений
};
```

Полный список свойств объектов, доступных для `Bottleneck.ConstructorOptions`,
можно найти в [Bottleneck](https://github.com/SGrondin/bottleneck#constructor).

Если аргумент не передан, созданный троттлер будет использовать настройки
конфигурации по умолчанию, которые должны подходить для большинства случаев
использования. Конфигурация по умолчанию выглядит следующим образом:

```ts
// Исходящий глобальный троттлер
const globalConfig = {
  reservoir: 30, // количество новых заданий, которые троттлер будет принимать при запуске
  reservoirRefreshAmount: 30, // количество заданий, которые троттлер будет принимать после обновления
  reservoirRefreshInterval: 1000, // интервал в миллисекундах, через который резервуар будет обновляться
};

// Outgoing Group Throttler
const groupConfig = {
  maxConcurrent: 1, // только 1 задание за раз
  minTime: 1000, // сколько миллисекунд ждать, чтобы быть готовым, после выполнения задания
  reservoir: 20, // количество новых заданий, которые троттлер будет принимать при запуске
  reservoirRefreshAmount: 20, // количество заданий, которые троттлер будет принимать после обновления
  reservoirRefreshInterval: 60000, // интервал в миллисекундах, через который резервуар будет обновляться
};

// Outgoing Private Throttler
const outConfig = {
  maxConcurrent: 1, // только 1 задание за раз
  minTime: 1000, // сколько миллисекунд ждать, чтобы быть готовым, после выполнения задания
};
```

## Краткая информация о плагине

- Название: `transformer-throttler`
- [Исходник](https://github.com/grammyjs/transformer-throttler)
- [Ссылка](/ref/transformer-throttler/)
