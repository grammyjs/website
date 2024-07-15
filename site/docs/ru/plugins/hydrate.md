---
prev: false
next: false
---

# Плагин Hydration для grammY (`hydrate`)

Этот плагин устанавливает полезные методы на два типа объектов, а именно

1. результаты вызовов API, и
2. объекты на контекстном объекте `ctx`.

Вместо того чтобы вызывать `ctx.api` или `bot.api` и вводить всевозможные идентификаторы, теперь вы можете просто вызывать методы на объектах, и они будут работать.
Лучше всего это видно на примере.

**БЕЗ** этого плагина:

```ts
bot.on(":photo", async (ctx) => {
  const statusMessage = await ctx.reply("Обрабатываю");
  await doWork(ctx.msg.photo); // длительная обработка изображения
  await ctx.api.editMessageText(ctx.chat.id, statusMessage.message_id, "Готово!");
  setTimeout(
    () =>
      ctx.api.deleteMessage(ctx.chat.id, statusMessage.message_id).catch(() => {
        // Ничего не делайте при ошибках.
      }),
    3000
  );
});
```

**C** этим плагином:

```ts
bot.on(":photo", async (ctx) => {
  const statusMessage = await ctx.reply("Обрабатываю");
  await doWork(ctx.msg.photo); // длительная обработка изображения
  await statusMessage.editText("Done!"); // очень просто!
  setTimeout(() => statusMessage.delete().catch(() => {}), 3000);
});
```

Неплохо, правда?

## Установка

Существует два способа установки этого плагина.

### Простая установка

Этот плагин можно установить простым способом, которого должно быть достаточно для большинства пользователей.

::: code-group

```ts [TypeScript]
import { Bot, Context } from "grammy";
import { hydrate, HydrateFlavor } from "@grammyjs/hydrate";

type MyContext = HydrateFlavor<Context>;

const bot = new Bot<MyContext>("");

bot.use(hydrate());
```

```js [JavaScript]
import { Bot } from "grammy";
import { hydrate } from "@grammyjs/hydrate";

const bot = new Bot("");

bot.use(hydrate());
```

```ts [Deno]
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  hydrate,
  HydrateFlavor,
} from "https://deno.land/x/grammy_hydrate/mod.ts";

type MyContext = HydrateFlavor<Context>;

const bot = new Bot<MyContext>("");

bot.use(hydrate());
```

:::

### Расширенная установка

При использовании простой установки гидратируются только те результаты вызовов API, которые проходят через `ctx.api`, например, `ctx.reply`.
Это большинство вызовов для большинства ботов.

Однако некоторым ботам может потребоваться обращение к `bot.api`.
В этом случае вам следует использовать эту расширенную установку.

Она интегрирует гидратацию контекста и гидратацию результатов вызовов API отдельно в вашего бота.
Обратите внимание, что теперь вам также необходимо установить [расширители API](../advanced/transformers#расширитель-api).

::: code-group

```ts [TypeScript]
import { Api, Bot, Context } from "grammy";
import {
  hydrateApi,
  HydrateApiFlavor,
  hydrateContext,
  HydrateFlavor,
} from "@grammyjs/hydrate";

type MyContext = HydrateFlavor<Context>;
type MyApi = HydrateApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");

bot.use(hydrateContext());
bot.api.config.use(hydrateApi());
```

```js [JavaScript]
import { Bot } from "grammy";
import { hydrateApi, hydrateContext } from "@grammyjs/hydrate";

const bot = new Bot("");

bot.use(hydrateContext());
bot.api.config.use(hydrateApi());
```

```ts [Deno]
import { Api, Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  hydrateApi,
  HydrateApiFlavor,
  hydrateContext,
  HydrateFlavor,
} from "https://deno.land/x/grammy_hydrate/mod.ts";

type MyContext = HydrateFlavor<Context>;
type MyApi = HydrateApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");

bot.use(hydrateContext());
bot.api.config.use(hydrateApi());
```

:::

## Какие предметы гидратируются

В настоящее время этот плагин гидратирует

- сообщения и посты канала
- редактируемые сообщения и редактируемые посты канала
- callback queries
- inline queries
- выбранные результаты inline
- запросы веб приложения
- запросы перед оформлением заказа и доставкой
- запросы на присоединение к чату

Все объекты гидратируются на

- объект контекста `ctx`,
- объект обновления `ctx.update` внутри контекста,
- краткие записи на объекте контекста, такие как `ctx.msg`, и
- результаты вызовов API, где это применимо.

## Краткая информация о плагине

- Название: `hydrate`
- [Исходник](https://github.com/grammyjs/hydrate)
- [Документация](/ref/hydrate/)
