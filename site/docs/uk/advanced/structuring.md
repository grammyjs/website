---
prev: ./middleware.md
next: ./scaling.md
---

# Масштабування I: велика кодова база

Як тільки ваш бот стане складнішим, ви зіткнетеся з проблемою структурування кодової бази вашого застосунку.
Звісно, ви можете розділити його на файли.

## Можливе рішення

> grammY ще досить молодий і поки що не надає жодних офіційних інтеграцій з DI-контейнерами.
> Підпишіться на [@grammyjs_news](https://t.me/grammyjs_news), щоб отримати сповіщення, як тільки ми надамо підтримку цього.

Ви можете структурувати свій код як завгодно, універсального рішення не існує.
З огляду на це, проста і перевірена стратегія структурування вашого коду полягає в наступному.

1. Групуйте семантично повʼязані речі в одному файлі або каталозі, в залежності від кількості коду.
   Кожен із таких блоків має надавати middleware, який оброблятиме певні повідомлення.
2. Створюйте екземпляр бота в єдиному місці, в якому також буде встановлено всі middleware, які він використовує.
3. **Необов'язково**. Попередньо фільтруйте оновлення та передавайте їх далі за правильним маршрутом.
   Для цього рекомендуємо розглянути `bot.route` ([довідка API](https://deno.land/x/grammy/mod.ts?s=Composer#method_route_0)) або скористатися [плагіном для маршрутизації](../plugins/router.md).

Приклад, який можна запустити і який реалізує описану вище стратегію, можна знайти в [репозиторії з прикладами ботів](https://github.com/grammyjs/examples/tree/main/scaling).

## Приклад структури

Для дуже простого бота, який керує списком TODO, ви можете уявити собі таку структуру.

```asciiart:no-line-numbers
src/
├── bot.ts
└── todo/
    ├── item.ts
    └── list.ts
```

`item.ts` просто визначає деякі речі про пункти TODO, і ці частини коду використовуються в `list.ts`.

У `list.ts` ви можете зробити щось на кшталт цього:

```ts
export const lists = new Composer();

// Реєструємо тут деякі обробники, які обробляють middleware звичайним чином.
lists.on("message", (ctx) => {/* ... */});
```

> Зауважте, що якщо ви використовуєте TypeScript, вам потрібно передати ваш [власний тип контексту](../guide/context.md#налаштування-об-єкта-контексту) під час створення екземпляру `Composer`.
> Наприклад, вам потрібно написати `new Composer<MyContext>()`.

За потреби ви можете використати [межу помилок](../guide/errors.md#межі-помилок) для обробки всіх помилок, що трапляються у вашому модулі.

Тепер в `bot.ts` ви можете встановити цей модуль ось так:

```ts
import { lists } from "./todo/list";

const bot = new Bot("<token>");

bot.use(lists);
// ... можливо, тут буде більше модулів на кшталт `todo`

bot.start();
```

За потреби ви можете використовувати [плагін для маршрутизації](../plugins/router.md) або [`bot.route`](https://deno.land/x/grammy/mod.ts?s=Composer#method_route_0) для об'єднання різних модулів, якщо ви можете заздалегідь визначити, який модуль повинен обробити оновлення.

Однак пам'ятайте, що дуже важко сказати, як саме потрібно структурувати бота в загальних рисах.
Як зазвичай у програмному забезпеченні, робіть це так, щоб це мало найбільший сенс :wink:

## Визначення типів для окремого middleware

Описана вище структура з використанням `Composer` працює добре.
Однак іноді ви можете опинитися в ситуації, коли ви хочете вилучити обробник у функцію, замість того, щоб створювати новий `Composer` і додавати до нього логіку.
Це вимагає додавання правильних визначень типів до ваших обробників, оскільки вони більше не можуть бути виведені через `Composer`.

grammY експортує визначення типів для всіх **звужених типів middleware**, наприклад, для middleware, які ви можете передати обробникам команд.
Крім того, він експортує визначення типів для **звужених обʼєктів контексту**, які використовуються у таких middleware.
Обидва типи параметризуються за допомогою вашого [власного обʼєкта контексту](../guide/context.md#налаштування-об-єкта-контексту).
Відповідно, обробник команди матиме тип `CommandMiddleware<MyContext>`, а обʼєкт контексту матиме тип `CommandContext<MyContext>`.
Їх можна використовувати наступним чином.

<CodeGroup>
  <CodeGroupItem title="Node.js" active>

```ts
import {
  type CallbackQueryMiddleware,
  type CommandContext,
  type NextFunction,
} from "grammy";

function commandMiddleware(ctx: CommandContext<MyContext>, next: NextFunction) {
  // обробка команди
}
const callbackQueryMiddleware: CallbackQueryMiddleware<MyContext> = (ctx) => {
  // обробка запитів зворотного виклику
};

bot.command(["start", "help"], commandMiddleware);
bot.callbackQuery("query-data", callbackQueryMiddleware);
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import {
  type CallbackQueryMiddleware,
  type CommandContext,
  type NextFunction,
} from "https://deno.land/x/grammy/mod.ts";

function commandMiddleware(ctx: CommandContext<MyContext>, next: NextFunction) {
  // обробка команди
}
const callbackQueryMiddleware: CallbackQueryMiddleware<MyContext> = (ctx) => {
  // обробка запитів зворотного виклику
};

bot.command(["start", "help"], commandMiddleware);
bot.callbackQuery("query-data", callbackQueryMiddleware);
```

</CodeGroupItem>
</CodeGroup>

Перегляньте [довідку API щодо псевдонімів типів](https://deno.land/x/grammy/mod.ts#Type_Aliases), щоб ознайомитися з оглядом усіх псевдонімів типів, які експортує grammY.
