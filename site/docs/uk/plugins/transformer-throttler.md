---
prev: false
next: false
---

# Обмеження запитів до API (`transformer-throttler`)

Цей плагін виконує вихідні запити до API в черзі через [Bottleneck](https://github.com/SGrondin/bottleneck), щоб запобігти перевищенню вашим ботом [лімітів](https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this), як це описано в [просунутому розділі](../advanced/flood) документації.

::: warning Існують недокументовані ліміти API
Telegram реалізує невизначені та недокументовані обмеження запитів для деяких викликів API.
Ці недокументовані обмеження **не враховуються** плагіном.
Розгляньте можливість використання [плагіна `auto-retry`](./auto-retry) разом з цим плагіном, якщо у вас виникають помилки `floodwait` для певних викликів API, таких як `api.sendContact`.
:::

## Використання

Ось приклад використання цього плагіна з параметрами за замовчуванням.
Зверніть увагу, що типові налаштування відповідають фактичним обмеженням швидкості, які застосовує Telegram, тому вони повинні нормально працювати.

:::code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { run } from "@grammyjs/runner";
import { apiThrottler } from "@grammyjs/transformer-throttler";

const bot = new Bot("");

const throttler = apiThrottler();
bot.api.config.use(throttler);

bot.command("example", (ctx) => ctx.reply("Я обмежений"));

// Якщо ви використовуєте цей плагін, то ви, швидше за все, захочете використати runner для паралельної обробки оновлень.
run(bot);
```

```js [JavaScript]
const { Bot } = require("grammy");
const { run } = require("@grammyjs/runner");
const { apiThrottler } = require("@grammyjs/transformer-throttler");

const bot = new Bot("");

const throttler = apiThrottler();
bot.api.config.use(throttler);

bot.command("example", (ctx) => ctx.reply("Я обмежений"));

// Якщо ви використовуєте цей плагін, то ви, швидше за все, захочете використати runner для паралельної обробки оновлень.
run(bot);
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { run } from "https://deno.land/x/grammy_runner/mod.ts";
import { apiThrottler } from "https://deno.land/x/grammy_transformer_throttler/mod.ts";

const bot = new Bot("");

const throttler = apiThrottler();
bot.api.config.use(throttler);

bot.command("example", (ctx) => ctx.reply("Я обмежений"));

// Якщо ви використовуєте цей плагін, то ви, швидше за все, захочете використати runner для паралельної обробки оновлень.
run(bot);
```

:::

## Налаштування

Плагін приймає один необовʼязковий обʼєкт наступного вигляду:

```ts
type ThrottlerOptions = {
  global?: Bottleneck.ConstructorOptions; // для обмеження всіх викликів api
  group?: Bottleneck.ConstructorOptions; // для обмеження вихідних повідомлень у групах
  out?: Bottleneck.ConstructorOptions; // для обмеження вихідних приватних повідомлень
};
```

Повний список властивостей обʼєкта, доступних для `Bottleneck.ConstructorOptions`, можна знайти на сторінці [Bottleneck](https://github.com/SGrondin/bottleneck#constructor).

Якщо не передано жодного аргументу, створений обмежувач використовуватиме параметри конфігурації за замовчуванням, які мають бути придатними для більшості випадків використання.
Типова конфігурація наступна:

```ts
// Глобальний обмежувач для вихідних запитів
const globalConfig = {
  reservoir: 30, // кількість нових завдань, які обмежувач візьме після старту
  reservoirRefreshAmount: 30, // кількість завдань, які обмежувач візьме після оновлення резервуару
  reservoirRefreshInterval: 1000, // інтервал у мілісекундах, з яким оновлюватиметься резервуар
};

// Обмежувач для вихідних запитів у групах
const groupConfig = {
  maxConcurrent: 1, // тільки 1-е завдання одночасно
  minTime: 1000, // чекати стільки-то мілісекунд після виконання завдання
  reservoir: 20, // кількість нових завдань, які обмежувач візьме після старту
  reservoirRefreshAmount: 20, // кількість завдань, які обмежувач візьме після оновлення резервуару
  reservoirRefreshInterval: 60000, // інтервал у мілісекундах, з яким оновлюватиметься резервуар
};

// Обмежувач для вихідних запитів у приватних чатах
const outConfig = {
  maxConcurrent: 1, // тільки 1-е завдання одночасно
  minTime: 1000, // чекати стільки-то мілісекунд після виконання завдання
};
```

## Загальні відомості про плагін

- Назва: `transformer-throttler`
- Джерело: <https://github.com/grammyjs/transformer-throttler>
- Довідка: <https://deno.land/x/grammy_transformer_throttler/mod.ts>
