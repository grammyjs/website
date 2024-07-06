# Масштабирование I: большой размер кода

Как только ваш бот вырастет в сложности, вы столкнетесь с проблемой, как структурировать кодовую базу приложения.
Естественно, вы можете разделить ее по файлам.

## Возможное решение

> grammY еще довольно молод и пока не предоставляет официальных интеграций с DI-контейнерами.
> Подпишитесь на [@grammyjs_news](https://t.me/grammyjs_news), чтобы получить уведомление, как только мы начнем поддерживать это.

Вы вольны структурировать свой код так, как вам нравится, и не существует универсального решения.
Тем не менее, простая и проверенная стратегия структурирования кода заключается в следующем.

1. Группируйте вещи, которые семантически принадлежат друг другу, в одном файле (или, в зависимости от размера кода, директории).
   Каждая из этих частей раскрывает middleware, который будет обрабатывать назначенные сообщения.
2. Централизованно создайте экземпляр бота, который объединит все middleware.
3. (Необязательно.) Предварительно отфильтруйте обновления централизованно и отправляйте их только в нужном направлении.
   Для этого вам может пригодиться `bot.route` ([Ссылка на API](/ref/core/composer#route)) или, как вариант, плагин [router](../plugins/router).

Выполняемый пример, реализующий описанную выше стратегию, можно найти в репозитории [Репозиторий бота для примера](https://github.com/grammyjs/examples/tree/main/scaling).

## Пример структуры

Для очень простого бота, управляющего списком TODO, можно представить такую структуру.

```asciiart:no-line-numbers
src/
├── bot.ts
└── todo/
    ├── item.ts
    └── list.ts
```

`item.ts` просто определяет некоторые вещи об элементах TODO, и эти части кода используются в `list.ts`.

В `list.ts`, вы можете сделать следующее:

```ts
export const lists = new Composer();

// Зарегистрируйте здесь несколько обработчиков, которые будут работать с вашим middleware обычным способом.
lists.on("message", async (ctx) => {
  /* ... */
});
```

> Обратите внимание, что если вы используете TypeScript, то при создании композитора вам нужно передать ваш [пользовательский тип контекста](../guide/context#кастомизация-объекта-контекста).
> Например, вам нужно будет использовать `new Composer<MyContext>()`.

Как вариант, вы можете использовать [погрешность ошибок](../guide/errors#границы-ошибок) для обработки всех ошибок, возникающих внутри вашего модуля.

Теперь в `bot.ts` вы можете установить этот модуль следующим образом:

<!-- ```ts
import { lists } from "./todo/list";

const bot = new Bot("");

bot.use(lists);
// ... maybe more modules like `todo` here

bot.start();
```

Optionally, you can use the [router plugin](../plugins/router) or [`bot.route`](/ref/core/composer#route) to bundle up the different modules, if you're able to determine which middleware is responsible upfront.

However, remember that the exact way of how to structure your bot is very hard to say generically.
As always in software, do it in a way that makes the most sense :wink:

## Type Definitions for Extracted Middleware

The above structure using composers works well.
However, sometimes you may find yourself in the situation that you want to extract a handler into a function, rather than creating a new composer and adding the logic to it.
This requires you to add the correct middleware type definitions to your handlers because they can no longer be inferred through the composer.

grammY exports type definitions for all **narrowed types of middleware**, such as the middleware that you can pass to command handlers.
In addition, it exports the type definitions for the **narrowed context objects** that are being used in that middleware.
Both types are parameterized with your [custom context object](../guide/context#customizing-the-context-object).
Hence, a command handler would have the type `CommandMiddleware<MyContext>` and its context object `CommandContext<MyContext>`.
They can be used as follows.

::: code-group

```ts [Node.js]
import {
  type CallbackQueryMiddleware,
  type CommandContext,
  type NextFunction,
} from "grammy";

function commandMiddleware(ctx: CommandContext<MyContext>, next: NextFunction) {
  // command handling
}
const callbackQueryMiddleware: CallbackQueryMiddleware<MyContext> = (ctx) => {
  // callback query handling
};

bot.command(["start", "help"], commandMiddleware);
bot.callbackQuery("query-data", callbackQueryMiddleware);
```

```ts [Deno]
import {
  type CallbackQueryMiddleware,
  type CommandContext,
  type NextFunction,
} from "https://deno.land/x/grammy/mod.ts";

function commandMiddleware(ctx: CommandContext<MyContext>, next: NextFunction) {
  // command handling
}
const callbackQueryMiddleware: CallbackQueryMiddleware<MyContext> = (ctx) => {
  // callback query handling
};

bot.command(["start", "help"], commandMiddleware);
bot.callbackQuery("query-data", callbackQueryMiddleware);
```

:::

Check out the [type aliases API reference](/ref/core/#type-aliases) to see an overview over all type aliases that grammY exports. -->
