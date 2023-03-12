# Набір корисних middlewares

Я постійно переписував ті самі middleware знову і знову для всіх своїх ботів, тому я вирішив помістити усі в окремий пакет.

## Встановлення

`yarn add grammy-middlewares`

## Використання

Всі middleware є фабриками, навіть якщо не всі з них повинні бути такими.
Я вирішив зробити API однорідним.

Деякі з фабрик використовують необов'язкові або обов'язкові параметри.

```ts
import {
  ignoreOld,
  onlyAdmin,
  onlyPublic,
  onlySuperAdmin,
  sequentialize,
} from "grammy-middlewares";

// ...

bot.use(
  ignoreOld(),
  onlyAdmin((ctx) => ctx.reply("Тільки адміни можуть це робити!")),
  onlyPublic((ctx) =>
    ctx.reply("Ви можете використовувати це тільки в публічних групах")
  ),
  onlySuperAdmin(env.SUPER_ADMIN_ID),
  sequentialize(),
);
```

## Middlewares

### `ignoreOld`

Ігнорує старі оновлення, корисно, коли бот був неактивний протягом тривалого часу.
Ви можете необов'язково вказати тайм-аут у секундах, який за замовчуванням становить `5 * 60`.

### `onlyAdmin`

Перевіряє, чи є користувач адміністратором.
Ви можете необов'язково вказати `errorHandler`, який буде викликано з контекстом, якщо користувач не є адміністратором.

### `onlyPublic`

Перевіряє, чи є це груповим чатом або каналом.
Ви можете необов'язково вказати `errorHandler`, який буде викликано з контекстом, якщо це не груповий чат або канал.

### `onlySuperAdmin`

Перевіряє, чи є користувач суперадміністратором.
Вам потрібно надати ідентифікатор суперадміністратора.

### `sequentialize`

Базовий [sequentialize](../advanced/scaling.md#concurrency-is-hard) middleware, який використовує chat id як послідовний ідентифікатор.

## Загальні відомості про плагін

- Назва: `grammy-middlewares`
- Джерело: <https://github.com/backmeupplz/grammy-middlewares>
- Довідка: <https://github.com/backmeupplz/grammy-middlewares>
