---
prev: false
next: false
---

# Гідратація для grammY (`hydrate`)

Цей плагін встановлює корисні методи на два типи обʼєктів, а саме:

1. Результати викликів API.
2. Обʼєкти на обʼєкті контексту `ctx`.

Замість того, щоб викликати `ctx.api` або `bot.api` і вказувати всілякі ідентифікатори, тепер ви можете просто викликати методи на обʼєктах, і вони просто працюватимуть.
Найкраще це проілюструвати на прикладі.

**БЕЗ** цього плагіна:

```ts
bot.on(":photo", async (ctx) => {
  const statusMessage = await ctx.reply("Обробка");
  await doWork(ctx.msg.photo); // деяка тривала обробка зображення
  await ctx.api.editMessageText(
    ctx.chat.id,
    statusMessage.message_id,
    "Готово!",
  );
  setTimeout(
    () =>
      ctx.api.deleteMessage(ctx.chat.id, statusMessage.message_id).catch(
        () => {
          // Нічого не робимо при помилках.
        },
      ),
    3000,
  );
});
```

**Із** цим плагіном:

```ts
bot.on(":photo", async (ctx) => {
  const statusMessage = await ctx.reply("Обробка");
  await doWork(ctx.msg.photo); // деяка тривала обробка зображення
  await statusMessage.editText("Готово!"); // так просто!
  setTimeout(() => statusMessage.delete().catch(() => {}), 3000);
});
```

Круто, чи не так?

## Встановлення

Існує два способи встановлення цього плагіна.

### Просте встановлення

Цей плагін можна встановити простим способом, якого має бути достатньо для більшості користувачів.

:::code-group

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

### Просунуте встановлення

При використанні простого встановлення будуть гідратовані лише результати викликів API, які проходять через `ctx.api`, наприклад, `ctx.reply`.
Це більшість викликів для більшості ботів.

Однак деяким ботам може знадобитися звертатися до `bot.api`.
У цьому випадку вам слід скористатися цим просунутим встановленням.

Воно інтегрує гідратацію контексту та гідратацію результатів виклику API окремо у вашого бота.
Зверніть увагу, що тепер вам також потрібно встановити [розширювач для API](../advanced/transformers#розширювач-для-api).

:::code-group

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

## Які обʼєкти піддаються гідратації

Наразі цей плагін гідратує

- повідомлення та публікації каналу,
- відредаговані повідомлення та відредаговані дописи каналу,
- запити зворотного виклику,
- inline-запити,
- вибрані inline результати,
- запити вебзастосунків,
- запити на попереднє замовлення та доставку,
- запити на приєднання до чату.

Всі обʼєкти гідратовані на

- обʼєкті контексту `ctx`,
- обʼєкті оновлення `ctx.update` всередині контексту,
- скоречені методі на обʼєкті контексту, як-от `ctx.msg`,
- результати викликів API, де це можливо.

## Загальні відомості про плагін

- Назва: `hydrate`
- Джерело: <https://github.com/grammyjs/hydrate>
- Довідка: <https://deno.land/x/grammy_hydrate/mod.ts>
