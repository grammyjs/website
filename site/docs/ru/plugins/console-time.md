---
prev: false
next: false
---

# Ведение журнала консоли при отладке

Если вы знакомы с JavaScript/TypeScript, то наверняка использовали
[`console.log`](https://developer.mozilla.org/en-US/docs/Web/API/console/log_static)
или
[`console.time`](https://developer.mozilla.org/en-US/docs/Web/API/console/time_static),
чтобы проверить, что происходит во время отладки. Во время работы над ботом или
middleware вы можете захотеть проверить что-то типа: что произошло, и сколько
времени это заняло?

Этот плагин нацелен на индивидуальные запросы для отладки отдельных проблем.
Находясь в производственной среде, вы, вероятно, захотите получить что-то
противоположное, чтобы получить обобщенный обзор. Например: при отладке причин
сбоя `/start`, вы будете проверять отдельные обновления Telegram. В
производственном контексте вас больше интересуют все сообщения `/start`, которые
происходят. Эта библиотека призвана помочь в работе с отдельными обновлениями.

## Отладка вашей реализации

```ts
import { generateUpdateMiddleware } from "telegraf-middleware-console-time";

if (process.env.NODE_ENV !== "production") {
  bot.use(generateUpdateMiddleware());
}

// Ваша реализация
bot.command("start" /* , ... */);
```

который выведет примерно следующее:

```text
2020-03-31T14:32:36.974Z 490af message text Edgar 6 /start: 926.247ms
2020-03-31T14:32:57.750Z 490ag message text Edgar 6 /start: 914.764ms
2020-03-31T14:33:01.188Z 490ah message text Edgar 5 /stop: 302.666ms
2020-03-31T14:46:11.385Z 490ai message text Edgar 6 /start: 892.452ms
```

`490af` --- это `update_id`.

Число перед командами --- это общая длина содержимого. Это полезно при
определении максимальной длины для таких вещей, как данные callback.

Само содержимое сокращено, чтобы предотвратить спам в логах.

## Отладка вашего middleware

Если вы создаете собственный middleware или используете медленные тайминги
другого middleware, вы можете использовать эти middleware для создания профиля
тайминга.

```ts
import {
  generateAfterMiddleware,
  generateBeforeMiddleware,
} from "telegraf-middleware-console-time";

const bot = new Bot("");

// Используйте BeforeMiddleware перед загрузкой протестированного middleware.
bot.use(generateBeforeMiddleware("foo"));

// Middleware, который нужно протестировать
bot.use(); /* ... */

// Используйте AfterMiddleware после загрузки тестируемого middleware (с тем же названием).
bot.use(generateAfterMiddleware("foo"));

// Другие middleware/имплементации (при использовании они будут занимать "внутреннее" количество времени).
bot.use(); /* ... */
bot.on("message" /* ... */);
```

В результате получится что-то вроде этого:

```text
490ai foo before: 304.185ms
490ai foo inner: 83.122ms
490ai foo after: 501.028ms
490ai foo total: 891.849ms
```

Это указывает на то, что проверка одного только middleware заняла 800 мс и не
является настолько производительной, как это может быть необходимо.

## Краткая информация о плагине

- [Исходник](https://github.com/EdJoPaTo/telegraf-middleware-console-time)
