# Вимірювання часу обробки у консоль під час налагодження

Якщо ви знайомі з JavaScript/TypeScript, ви, напевно, використовували [`console.log`](https://developer.mozilla.org/en-US/docs/Web/API/Console/log) або [`console.time`](https://developer.mozilla.org/en-US/docs/Web/API/Console/time), щоб під час налагодження перевірити, що відбувається.
Під час роботи з вашим ботом або middleware ви, можливо, захочете перевірити щось подібне: що відбулося і скільки часу це зайняло?

Цей плагін призначений для налагодження окремих запитів з метою вирішення окремих проблем.
У production середовищі вам знадобиться щось інше, щоб отримати загальну інформацію про всі запити.
Наприклад, під час налагодження проблеми з командою `/start` ви перевіряєте окреме оновлення Telegram.
У контексті production вас скоріше цікавлять взагалі всі оновлення з командою `/start`, але ця бібліотека призначена для допомоги в роботі з окремими оновленнями.

## Налагодження вашої реалізації

```ts
import { generateUpdateMiddleware } from "telegraf-middleware-console-time";

if (process.env.NODE_ENV !== "production") {
  bot.use(generateUpdateMiddleware());
}

// Ваша реалізація
bot.command("start" /* , ... */);
```

Цей код виведе щось на зразок цього:

```plaintext
2020-03-31T14:32:36.974Z 490af message text Andrey 6 /start: 926.247ms
2020-03-31T14:32:57.750Z 490ag message text Andrey 6 /start: 914.764ms
2020-03-31T14:33:01.188Z 490ah message text Andrey 5 /stop: 302.666ms
2020-03-31T14:46:11.385Z 490ai message text Andrey 6 /start: 892.452ms
```

`490af` - це `update_id`.

Число перед командами - це загальна довжина вмісту.
Це корисно, коли потрібно врахувати максимальну довжину для таких речей, як дані зворотного виклику.

Сам вміст скорочується, щоб запобігти засміченню журналу.

## Налагодження вашого middleware

Коли ви створюєте власний middleware або вважаєте, що якийсь middleware повільний, ви можете використовувати ці middleware, щоб створити профіль часу виконання.

```ts
import {
  generateAfterMiddleware,
  generateBeforeMiddleware,
} from "telegraf-middleware-console-time";

const bot = new Bot(/* ... */);

// Використовуйте BeforeMiddleware перед встановленням middleware, що тестується.
bot.use(generateBeforeMiddleware("foo"));

// Middleware, який потрібно протестувати.
bot.use(); /* ... */

// Використовуйте AfterMiddleware з тією самою міткою, після встановлення middleware, що тестується.
bot.use(generateAfterMiddleware("foo"));

// Усі інші middleware та код боту, рахуватимуться як "inner" при вимірюванні часу.
bot.use(); /* ... */
bot.on("message" /* ... */);
```

Цей код виведе щось на зразок цього:

```plaintext
490ai foo before: 304.185ms
490ai foo inner: 83.122ms
490ai foo after: 501.028ms
490ai foo total: 891.849ms
```

Це свідчить про те, що перевірений middleware виконувався сам по собі 800 мс і, можливо, його продуктивність недостатня.

## Загальні відомості про плагін

- Джерело: <https://github.com/EdJoPaTo/telegraf-middleware-console-time>