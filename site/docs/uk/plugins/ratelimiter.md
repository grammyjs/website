# Обмеження запитів від користувачів (`ratelimiter`)

ratelimiter - це проміжний обробник для обмеження кількості запитів до ботів, створених за допомогою grammY або [Telegraf](https://github.com/telegraf/telegraf).
Простіше кажучи, це плагін, який допоможе вам захистити ваших ботів від інтенсивного спаму.
Щоб краще зрозуміти, що таке ratelimiter, ви можете подивитися на наступну ілюстрацію:

![роль ratelimiter у боротьбі зі спамом](/images/ratelimiter-role.png)

## Як саме це працює?

За звичайних обставин кожен запит буде оброблено, а ваш бот потім відповість на нього, проте це означає, що спамити не так вже й складно.
Кожен користувач може надсилати кілька запитів в секунду, а ваш скрипт оброблятиме кожен запит, але як ви можете запобігти цьому?
За допомогою ratelimiter!

::: warning Обмеження запитів користувачів, а не серверів Telegram!
Зверніть увагу, що цей пакет **НЕ** обмежує вхідні запити з серверів Telegram, натомість він відстежує вхідні запити за `from.id` і відхиляє їх при надходженні, щоб запобігти додатковому навантаженню на ваші сервери.
:::

## Налаштування

Цей плагін має 5 параметрів, які можна налаштувати:

- `timeFrame` - часовий інтервал, протягом якого будуть відстежуватися запити; початково `1000` мс.
- `limit` - кількість запитів, дозволених протягом кожного `timeFrame`; початково `1`.
- `storageClient` - тип сховища для зберігання даних про користувачів та їхніх запитів.
  Типове значення - `MEMORY_STORE`, для якого використовується [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) у памʼяті для зберігання даних, але ви також можете вказати клієнт Redis. [Докладніше про storageClient](#про-storageclient).
- `onLimitExceeded` - функція, яка описує, що робити, якщо користувач перевищив ліміт; початково ігнорує надмірні запити.
- `keyGenerator` - функція, яка повертає унікальний ключ, згенерований для кожного користувача; початково використовує `from.id`.
  Цей ключ використовується для ідентифікації користувача, тому він повинен бути унікальним, специфічним для користувача й у форматі рядка.

### Про `storageClient`

Для більшості ботів підходить `MEMORY_STORE` або відстеження в памʼяті, однак якщо ви використовуєте кластеризацію для вашого бота, ви не зможете ефективно використовувати сховище в оперативній памʼяті.
Ось чому ми також надаємо опцію Redis.
Ви можете використовувати клієнт Redis з [ioredis](https://github.com/luin/ioredis) або [redis](https://deno.land/x/redis), якщо ви використовуєте Deno.
Насправді, будь-який драйвер Redis, який реалізує методи `incr` і `pexpire`, має чудово працювати.
ratelimiter не залежить від якогось конкретного драйверу.

> Примітка: щоб використовувати клієнт сховища Redis з ratelimiter, на вашому сервері має бути встановлений redis-server **2.6.0** або новішої версії.
> Старіші версії Redis не підтримуються.

## Як використовувати

Існує два способи використання ratelimiter:

- Використання [налаштувань за замовчуванням](#налаштування-за-замовчуванням).
- Використання [ручного налаштування](#ручне-налаштування) з передачею власного обʼєкта з налаштуваннями.

### Налаштування за замовчуванням

Цей фрагмент демонструє найпростіший спосіб використання ratelimiter, який полягає у використанні налаштувань за замовчуванням:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { limit } from "@grammyjs/ratelimiter";

// Обмежуємо обробку повідомлень до одного повідомлення на секунду для кожного користувача.
bot.use(limit());
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const { limit } = require("@grammyjs/ratelimiter");

// Обмежуємо обробку повідомлень до одного повідомлення на секунду для кожного користувача.
bot.use(limit());
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { limit } from "https://deno.land/x/grammy_ratelimiter/mod.ts";

// Обмежуємо обробку повідомлень до одного повідомлення на секунду для кожного користувача.
bot.use(limit());
```

</CodeGroupItem>
</CodeGroup>

### Ручне налаштування

Як згадувалося раніше, ви можете передати обʼєкт `Options` методу `limit()`, щоб змінити поведінку обмежувача.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import Redis from "ioredis";
import { limit } from "@grammyjs/ratelimiter";

const redis = new Redis(...);

bot.use(
  limit({
    // Дозволяємо обробляти лише 3 повідомлення кожні 2 секунди.
    timeFrame: 2000,
    limit: 3,

    // "MEMORY_STORE" - це значення за замовчуванням. Якщо ви не хочете використовувати Redis, не передавайте storageClient взагалі.
    storageClient: redis,

    // Викликається, коли перевищено ліміт.
    onLimitExceeded: async (ctx) => {
      await ctx.reply("Будь ласка, не надсилайте забагато запитів!");
    },

    // Зауважте, що ключ повинен бути числом у форматі рядка, наприклад, "123456789".
    keyGenerator: (ctx) => {
      return ctx.from?.id.toString();
    },
  })
);
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const Redis = require("ioredis");
const { limit } = require("@grammyjs/ratelimiter");

const redis = new Redis(...);

bot.use(
  limit({
    // Дозволяємо обробляти лише 3 повідомлення кожні 2 секунди.
    timeFrame: 2000,
    limit: 3,

    // "MEMORY_STORE" - це значення за замовчуванням. Якщо ви не хочете використовувати Redis, не передавайте storageClient взагалі.
    storageClient: redis,

    // Викликається, коли перевищено ліміт.
    onLimitExceeded: async (ctx) => {
      await ctx.reply("Будь ласка, не надсилайте забагато запитів!");
    },

    // Зауважте, що ключ повинен бути числом у форматі рядка, наприклад, "123456789".
    keyGenerator: (ctx) => {
      return ctx.from?.id.toString();
    },
  })
);
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { connect } from "https://deno.land/x/redis/mod.ts";
import { limit } from "https://deno.land/x/grammy_ratelimiter/mod.ts";

const redis = await connect(...);

bot.use(
  limit({
    // Дозволяємо обробляти лише 3 повідомлення кожні 2 секунди.
    timeFrame: 2000,
    limit: 3,

    // "MEMORY_STORE" - це значення за замовчуванням. Якщо ви не хочете використовувати Redis, не передавайте storageClient взагалі.
    storageClient: redis,

    // Викликається, коли перевищено ліміт.
    onLimitExceeded: async (ctx) => {
      await ctx.reply("Будь ласка, не надсилайте забагато запитів!");
    },

    // Зауважте, що ключ повинен бути числом у форматі рядка, наприклад, "123456789".
    keyGenerator: (ctx) => {
      return ctx.from?.id.toString();
    },
  })
);
```

</CodeGroupItem>
</CodeGroup>

Як ви можете бачити в прикладі вище, кожному користувачеві дозволено надсилати 3 запити кожні 2 секунди.
Якщо користувач надсилає більше запитів, бот відповідає _"Будь ласка, не надсилайте забагато запитів!"_.
Цей запит не пройде далі й одразу ж помре, оскільки ми не викликаємо [next()](../guide/middleware.md#стек-проміжних-обробників) у проміжному обробнику.

> Примітка: щоб уникнути надмірних запитів до серверів Telegram, `onLimitExceeded` виконується лише один раз у кожному `timeFrame`.

Іншим варіантом використання може бути обмеження вхідних запитів від чату, а не від конкретного користувача:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { limit } from "@grammyjs/ratelimiter";

bot.use(
  limit({
    keyGenerator: (ctx) => {
      if (ctx.hasChatType(["group", "supergroup"])) {
        // Зауважте, що ключ повинен бути числом у форматі рядка, наприклад, "123456789".
        return ctx.chat.id.toString();
      }
    },
  }),
);
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const { limit } = require("@grammyjs/ratelimiter");

bot.use(
  limit({
    keyGenerator: (ctx) => {
      if (ctx.hasChatType(["group", "supergroup"])) {
        // Зауважте, що ключ повинен бути числом у форматі рядка, наприклад, "123456789".
        return ctx.chat.id.toString();
      }
    },
  }),
);
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { limit } from "https://deno.land/x/grammy_ratelimiter/mod.ts";

bot.use(
  limit({
    keyGenerator: (ctx) => {
      if (ctx.hasChatType(["group", "supergroup"])) {
        // Зауважте, що ключ повинен бути числом у форматі рядка, наприклад, "123456789".
        return ctx.chat.id.toString();
      }
    },
  }),
);
```

</CodeGroupItem>
</CodeGroup>

У цьому прикладі ми використали `chat.id` як унікальний ключ для обмеження швидкості.

## Загальні відомості про плагін

- Назва: `ratelimiter`
- Джерело: <https://github.com/grammyjs/ratelimiter>
- Довідка: <https://deno.land/x/grammy_ratelimiter/mod.ts>
