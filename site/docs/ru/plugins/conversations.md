---
prev: false
next: false
---

# Диалоги (`conversations`)

Создавайте мощные интерфейсы для общения с легкостью.

## Быстрый старт

Диалоги позволяют вашему боту ожидать сообщения.
Используйте этот плагин, если общение с вашим ботом состоит из нескольких шагов.

> Диалоги уникальны, поскольку вводят новую концепцию, которую вы не найдете в других местах.
> Они предлагают изящное решение, но вам придется немного разобраться в их работе, чтобы понять, что именно делает ваш код.

Вот быстрый старт, чтобы вы могли поэкспериментировать с плагином, прежде чем перейти к интересным деталям.

:::code-group

```ts [TypeScript]
import { Bot, type Context } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";

const bot = new Bot<ConversationFlavor<Context>>(""); // <-- вставьте токен вашего бота между "" (https://t.me/BotFather)
bot.use(conversations());

/** Определение диалога */
async function hello(conversation: Conversation, ctx: Context) {
  await ctx.reply("Привет! Как тебя зовут?");
  const { message } = await conversation.waitFor("message:text");
  await ctx.reply(`Добро пожаловать в чат, ${message.text}!`);
}
bot.use(createConversation(hello));

bot.command("enter", async (ctx) => {
  // Вход в функцию "hello", которую вы объявили.
  await ctx.conversation.enter("hello");
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { conversations, createConversation } = require(
  "@grammyjs/conversations",
);

const bot = new Bot(""); // <-- вставьте токен вашего бота между "" (https://t.me/BotFather)
bot.use(conversations());

/** Определение диалога */
async function hello(conversation, ctx) {
  await ctx.reply("Привет! Как тебя зовут?");
  const { message } = await conversation.waitFor("message:text");
  await ctx.reply(`Добро пожаловать в чат, ${message.text}!`);
}
bot.use(createConversation(hello));

bot.command("enter", async (ctx) => {
  // Вход в функцию "hello", которую вы объявили.
  await ctx.conversation.enter("hello");
});

bot.start();
```

```ts [Deno]
import { Bot, type Context } from "https://deno.land/x/grammy/mod.ts";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations/mod.ts";

const bot = new Bot<ConversationFlavor<Context>>(""); // <-- вставьте токен вашего бота между "" (https://t.me/BotFather)
bot.use(conversations());

/** Определение диалога */
async function hello(conversation: Conversation, ctx: Context) {
  await ctx.reply("Привет! Как тебя зовут?");
  const { message } = await conversation.waitFor("message:text");
  await ctx.reply(`Добро пожаловать в чат, ${message.text}!`);
}
bot.use(createConversation(hello));

bot.command("enter", async (ctx) => {
  // Вход в функцию "hello", которую вы объявили.
  await ctx.conversation.enter("hello");
});

bot.start();
```

:::

Когда вы входите в указанный диалог `hello`, бот отправляет сообщение, затем ожидает текстовое сообщение от пользователя, а потом отправляет ещё одно сообщение.
После этого диалог завершается.

Теперь перейдём к интересным деталям.

## Как работают диалоги

Рассмотрим следующий пример традиционной обработки сообщений.

```ts
bot.on("message", async (ctx) => {
  // обработка одного сообщения
});
```

В обычных обработчиках сообщений у вас всегда есть только один объект контекста.

Сравните это с диалогами.

```ts
async function hello(conversation: Conversation, ctx0: Context) {
  const ctx1 = await conversation.wait();
  const ctx2 = await conversation.wait();
  // обработка трёх сообщений
}
```

В диалоге вы можете использовать три объекта контекста!

Как и обычные обработчики, плагин для диалогов получает только один объект контекста из [системы middleware](../guide/middleware).
Но внезапно он предоставляет вам сразу три объекта контекста.
Как это возможно?

**Функции постройки диалога не выполняются как обычные функции**.
(Хотя мы можем писать код для них их именно так.)

### Диалоги --- это механизмы воспроизведения

Функции создания диалогов работают иначе, чем обычные.

Когда начинается диалог, функция будет выполнена только до первого вызова `wait`.
Далее выполнение функции прерывается, и она больше не выполняется.
Плагин запоминает, что был достигнут вызов `wait`, и сохраняет эту информацию.

Когда поступает следующее обновление, диалог снова выполняется с самого начала.
Однако, на этот раз никакие вызовы API не выполняются, из-за чего код выполняется очень быстро и не оказывает никакого эффекта.
Это называется **воспроизведением**.
Как только выполнение достигает ранее вызванного `wait`, выполнение функции возобновляется в нормальном режиме.

::: code-group

```ts [Вход]
async function hello( //                      |
  conversation: Conversation, //              |
  ctx0: Context, //                           |
) { //                                        |
  await ctx0.reply("Привет!"); //             |
  const ctx1 = await conversation.wait(); //  A
  await ctx1.reply("Снова привет!"); //
  const ctx2 = await conversation.wait(); //
  await ctx2.reply("До свидания!"); //
} //
```

```ts [Воспроизведение]
async function hello( //                      .
  conversation: Conversation, //              .
  ctx0: Context, //                           .
) { //                                        .
  await ctx0.reply("Привет!"); //             .
  const ctx1 = await conversation.wait(); //  A
  await ctx1.reply("Снова привет!"); //       |
  const ctx2 = await conversation.wait(); //  B
  await ctx2.reply("До свидания!"); //
} //
```

```ts [Воспроизведение 2]
async function hello( //                      .
  conversation: Conversation, //              .
  ctx0: Context, //                           .
) { //                                        .
  await ctx0.reply("Привет!"); //             .
  const ctx1 = await conversation.wait(); //  A
  await ctx1.reply("Снова привет!"); //       .
  const ctx2 = await conversation.wait(); //  B
  await ctx2.reply("До свидания!"); //        |
} //                                          —
```

:::

1. Когда начинается диалог, функция выполняется до точки `A`.
2. Когда поступает следующее обновление, функция воспроизводится до `A`, а затем выполняется в нормальном режиме от `A` до `B`.
3. Когда поступает последнее обновление, функция воспроизводится до `B`, а затем выполняется в нормальном режиме до конца.

Это означает, что каждая строка кода будет выполнена несколько раз --- один раз в обычном режиме и несколько во время воспроизведения.
Поэтому вам нужно убедиться, что ваш код ведёт себя одинаково как при обычном выполнении, так и при воспроизведении.

Если вы выполняете вызовы API через `ctx.api` (включая `ctx.reply`), плагин обрабатывает их автоматически.
В то же время ваша работа с базой данных требует специальной обработки.

Вот как это делается.

### Золотое правило для диалогов

Теперь, когда [мы знаем, как работают диалоги](#диалоги-это-механизмы-воспроизведения), мы можем определить одно правило, которое относится к коду, написанному внутри функции построения диалога.
Вы должны следовать ему, чтобы ваш код работал корректно.

::: warning ЗОЛОТОЕ ПРАВИЛО

**Код, который ведет себя по-разному во время воспроизведений, должен быть обёрнут в [`conversation.external`](/ref/conversations/conversation#external).**

:::

Вот как его применять:

```ts
// ПЛОХО
const response = await accessDatabase();
// ХОРОШО
const response = await conversation.external(() => accessDatabase());
```

Изоляция части кода через [`conversation.external`](/ref/conversations/conversation#external) сигнализирует плагину, что эта часть кода должна быть пропущена во время воспроизведений.
Возвращаемое значение обёрнутого кода сохраняется плагином и повторно используется в последующих воспроизведениях.
В приведённом выше примере это предотвращает повторный доступ к базе данных.

ИСПОЛЬЗУЙТЕ `conversation.external`, если вы...

- читаете или записываете файлы, базы данных/сессии, в сеть или глобальное состояние,
- вызываете `Math.random()` или `Date.now()`,
- выполняете API-запросы через `bot.api` или другие независимые экземпляры `Api`.

НЕ ИСПОЛЬЗУЙТЕ `conversation.external`, если вы...

- вызываете `ctx.reply` или другие [действия контекста](../guide/context#доступные-деиствия),
- вызываете `ctx.api.sendMessage` или другие методы [Bot API](https://core.telegram.org/bots/api) через `ctx.api`.

Плагин диалогов предоставляет несколько удобных методов для `conversation.external`.
Это упрощает использование `Math.random()` и `Date.now()`, а также упрощает отладку, предоставляя способ подавления логов во время воспроизведений.

```ts
// await conversation.external(() => Math.random());
const rnd = await conversation.random();
// await conversation.external(() => Date.now());
const now = await conversation.now();
// await conversation.external(() => console.log("абв"));
await conversation.log("абв");
```

Как `conversation.wait` и `conversation.external` восстанавливают исходные значения при воспроизведении?
Плагину нужно как-то сохранять эти данные, верно?

Да.

### Диалоги хранят состояние

Два типа данных сохраняются в базе данных.
По умолчанию используется лёгкая база данных в памяти на основе `Map`, но вы можете [использовать постоянную базу данных](#непрекращающиеся-диалоги) без труда.

1. Плагин диалогов сохраняет все обновления.
2. Плагин диалогов сохраняет все возвращаемые значения `conversation.external` и результаты всех API вызовов.

Это не проблема, если в диалоге только несколько десятков обновлений.
(Помните, что при long polling каждый вызов `getUpdates` также возвращает до 100 обновлений.)

Однако, если ваш диалог никогда не заканчивается, эти данные будут накапливаться и замедлять вашего бота.
**Избегайте бесконечных циклов.**

### Объекты контекста диалогов

Когда выполняется диалог, он использует сохранённые обновления для создания новых объектов контекста с нуля.
**Эти объекты контекста отличаются от объекта контекста в окружающем middleware.**
Для TypeScript это также означает, что теперь у вас есть два [расширителя](../guide/context#расширители-контекста) объектов контекста.

- **Внешние объекты контекста** --- это объекты контекста, которые ваш бот использует в middleware.
  Они предоставляют доступ к `ctx.conversation.enter`.
  Для TypeScript они, по крайней мере, будут содержать установленный `ConversationFlavor`.
  Внешние объекты контекста также будут иметь другие свойства, определённые плагинами, которые вы установили через `bot.use`.
- **Внутренние объекты контекста** (также называемые **объектами контекста диалога**) --- это объекты контекста, создаваемые плагином диалогов.
  Они никогда не могут иметь доступ к `ctx.conversation.enter`, и по умолчанию также не имеют доступа к каким-либо плагинам.
  Если вы хотите иметь пользовательские свойства на внутренних объектах контекста, [пролистайте вниз](#использование-плагинов-внутри-диалогов).

Вы должны передать как внешний, так и внутренний тип контекста в диалоге.
Настройка TypeScript обычно выглядит следующим образом:

::: code-group

```ts [Node.js]
import { Bot, type Context } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
} from "@grammyjs/conversations";

// Внешние объекты контекста (знают все плагины middleware)
type MyContext = ConversationFlavor<Context>;
// Внутренние объекты контекста (знают все плагины диалогов)
type MyConversationContext = Context;

// Используйте внешний тип контекста для вашего бота.
const bot = new Bot<MyContext>("");

// Используйте как внешний, так и внутренний тип для вашего диалога.
type MyConversation = Conversation<MyContext, MyConversationContext>;

// Определите ваш диалог
async function example(
  conversation: MyConversation,
  ctx0: MyConversationContext,
) {
  // Все объекты контекста внутри диалог
  // имеют тип `MyConversationContext`.
  const ctx1 = await conversation.wait();

  // Внешний объект контекста можно получить
  // через `conversation.external`, и он выводится как
  // тип `MyContext`.
  const session = await conversation.external((ctx) => ctx.session);
}
```

```ts [Deno]
import { Bot, type Context } from "https://deno.land/x/grammy/mod.ts";
import {
  type Conversation,
  type ConversationFlavor,
} from "https://deno.land/x/grammy_conversations/mod.ts";

// Внешние объекты контекста (знают все плагины middleware)
type MyContext = ConversationFlavor<Context>;
// Внутренние объекты контекста (знают все плагины диалогов)
type MyConversationContext = Context;

// Используйте внешний тип контекста для вашего бота.
const bot = new Bot<MyContext>(""); // <-- вставьте токен вашего бота между "" (https://t.me/BotFather)

// Используйте как внешний, так и внутренний тип для вашего диалога.
type MyConversation = Conversation<MyContext, MyConversationContext>;

// Определите ваш диалог
async function example(
  conversation: MyConversation,
  ctx0: MyConversationContext,
) {
  // Все объекты контекста внутри диалога
  // имеют тип `MyConversationContext`.
  const ctx1 = await conversation.wait();

  // Внешний объект контекста можно получить
  // через `conversation.external`, и он выводится как
  // тип `MyContext`.
  const session = await conversation.external((ctx) => ctx.session);
}
```

:::

> В приведённом выше примере в диалоге не установлено никаких плагинов.
> Как только вы начнёте [устанавливать их](#использование-плагинов-внутри-диалогов), определение `MyConversationContext` больше не будет просто типом `Context`.

Естественно, если у вас несколько диалогов, и вы хотите, чтобы типы контекста отличались между ними, вы можете определить несколько типов контекста диалога.

Поздравляем!
Если вы поняли всё вышесказанное, самые сложные части остались позади.
Остальная часть страницы посвящена множеству возможностей, которые предоставляет этот плагин.

## Вход в диалоги

Вы можете начать диалог из обычного обработчика.

По умолчанию диалог имеет то же имя, что и [name](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name) функции.
При установке вы можете переименовать его, если это необходимо.

Также вы можете передавать аргументы в диалог.
Обратите внимание, что аргументы будут сохранены в виде строки JSON, поэтому убедитесь, что их можно безопасно передать в `JSON.stringify`.

Диалоги также могут быть вызваны изнутри других диалогов с помощью обычного вызова функции.
В таком случае вызывающий диалог получит доступ к возвращаемому значению вызванного диалога.
Эта возможность недоступна, если вы начинаете диалог из middleware.

:::code-group

```ts [TypeScript]
/**
 * Возвращает ответ на вопрос о смысле жизни, Вселенной и всего остального.
 * Это значение доступно только в случае, если диалог
 * вызывается из другого диалога.
 */
async function convo(conversation: Conversation, ctx: Context) {
  await ctx.reply("Вычисляем ответ");
  return 42;
}
/** Принимает два аргумента (должны быть сериализуемы в JSON) */
async function args(
  conversation: Conversation,
  ctx: Context,
  answer: number,
  config: { text: string },
) {
  const truth = await convo(conversation, ctx);
  if (answer === truth) {
    await ctx.reply(config.text);
  }
}
bot.use(createConversation(convo, "new-name"));
bot.use(createConversation(args));

bot.command("enter", async (ctx) => {
  await ctx.conversation.enter("new-name");
});
bot.command("enter_with_arguments", async (ctx) => {
  await ctx.conversation.enter("args", 42, { text: "foo" });
});
```

```js [JavaScript]
/**
 * Возвращает ответ на вопрос о смысле жизни, Вселенной и всего остального.
 * Это значение доступно только в случае, если диалог
 * вызывается из другого диалога.
 */
async function convo(conversation, ctx) {
  await ctx.reply("Вычисляем ответ");
  return 42;
}
/** Принимает два аргумента (должны быть сериализуемы в JSON) */
async function args(conversation, ctx, answer, config) {
  const truth = await convo(conversation, ctx);
  if (answer === truth) {
    await ctx.reply(config.text);
  }
}
bot.use(createConversation(convo, "new-name"));
bot.use(createConversation(args));

bot.command("enter", async (ctx) => {
  await ctx.conversation.enter("new-name");
});
bot.command("enter_with_arguments", async (ctx) => {
  await ctx.conversation.enter("args", 42, { text: "foo" });
});
```

:::

::: warning Отсутствие проверки типов аргументов

Убедитесь, что вы указали правильные аннотации типов для параметров вашего диалога, и что вы передали соответствующие аргументы в вызов `enter`.
Плагин не может проверить типы, кроме `conversation` и `ctx`.

:::

Не забывайте, что [порядок middleware имеет значение](../guide/middleware).
Вы можете войти только в те диалоги, которые были установлены до обработчика, вызывающего `enter`.

## Ожидание обновлений

Самый простой вызов ожидания просто ждет любого обновления.

```ts
const ctx = await conversation.wait();
```

Он просто возвращает объект контекста.
Все остальные вызовы ожидания основаны на этом.

### Фильтрованные вызовы ожидания

Если нужно ожидать определенный тип обновления, используйте фильтрованный вызов ожидания.

```ts
// Фильтр, как в `bot.on`.
const message = await conversation.waitFor("message");
// Ожидание текста, как в `bot.hears`.
const hears = await conversation.waitForHears(/regex/);
// Ожидание команды, как в `bot.command`.
const start = await conversation.waitForCommand("start");
// и т.д.
```

Посмотрите справочник API, чтобы увидеть [все доступные способы фильтрации вызовов ожидания](/ref/conversations/conversation#wait).

Фильтрованные вызовы ожидания гарантированно возвращают только те обновления, которые соответствуют фильтру.
Если бот получает обновление, не соответствующее фильтру, оно будет отклонено.
Вы можете передать функцию обратного вызова, которая будет вызвана в этом случае.

```ts
const message = await conversation.waitFor(":photo", {
  otherwise: (ctx) => ctx.reply("Пожалуйста, отправьте фото!"),
});
```

Все фильтрованные вызовы ожидания можно объединять в цепочки для фильтрации сразу нескольких условий.

```ts
// Ожидание фото с определенной подписью
let photoWithCaption = await conversation.waitFor(":photo")
  .andForHears("XY");
// Обработка каждого случая с разными функциями otherwise:
photoWithCaption = await conversation
  .waitFor(":photo", { otherwise: (ctx) => ctx.reply("Нет фото") })
  .andForHears("XY", { otherwise: (ctx) => ctx.reply("Неправильная подпись") });
```

Если указать `otherwise` только в одном из фильтров цепочки, то оно будет вызвано, только если этот конкретный фильтр отклонит обновление.

### Осмотр объектов контекста

Часто возникает необходимость [деструктуризации](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring) полученных объектов контекста.
Это позволяет проводить дополнительные проверки данных.

```ts
const { message } = await conversation.waitFor("message");
if (message.photo) {
  // Обработка сообщения с фото
}
```

Диалоги также идеально подходят для использования [проверок наличия данных](../guide/context#поиск-информации-с-помощью-проверок).

## Выход из диалогов

Самый простой способ выйти из диалога --- это выйти из функции с помощью `return`.
Выброс ошибки также завершает диалог.

Если этого недостаточно, можно вручную прервать диалог в любой момент.

```ts
async function convo(conversation: Conversation, ctx: Context) {
  // Все ветки кода завершают диалог:
  if (ctx.message?.text === "return") {
    return;
  } else if (ctx.message?.text === "error") {
    throw new Error("бум");
  } else {
    await conversation.halt(); // не возвращает управление
  }
}
```

Вы также можете выйти из диалога из вашего middleware.

```ts
bot.use(conversations());
bot.command("clean", async (ctx) => {
  await ctx.conversation.exit("convo");
});
```

Можно сделать это даже _до_ того, как целевой диалог будет установлен в вашей системе middleware.
Для этого достаточно установить плагин диалогов.

## Это просто JavaScript

С учетом [устранения побочных эффектов](#золотое-правило-для-диалогов), диалоги представляют собой обычные функции JavaScript.
Хотя их выполнение происходит особым образом, при разработке бота об этом можно забыть.
Весь стандартный синтаксис JavaScript работает как обычно.

Большинство вещей в этом разделе очевидны для тех, кто уже использовал диалоги.
Однако для новичков некоторые из них могут стать неожиданностью.

### Переменные, ветвления и циклы

Вы можете использовать обычные переменные для хранения состояния между обновлениями.
Ветвления с помощью `if` или `switch` также работают.
Циклы через `for` и `while` применимы без ограничений.

```ts
await ctx.reply("Отправьте мне ваши любимые числа, разделенные запятыми!");
const { message } = await conversation.waitFor("message:text");
const numbers = message.text.split(",");
let sum = 0;
for (const str of numbers) {
  const n = parseInt(str.trim(), 10);
  if (!isNaN(n)) {
    sum += n;
  }
}
await ctx.reply("Сумма этих чисел: " + sum);
```

Это всего лишь JavaScript.

### Функции и рекурсия

Вы можете разделить диалог на несколько функций.
Функции могут вызывать друг друга, а также использовать рекурсию.
(На самом деле, плагин даже не замечает, что вы используете функции.)

Вот тот же код, что и ранее, но переработанный с использованием функций.

:::code-group

```ts [TypeScript]
/** Диалог для сложения чисел */
async function sumConvo(conversation: Conversation, ctx: Context) {
  await ctx.reply("Отправьте мне ваши любимые числа, разделенные запятыми!");
  const { message } = await conversation.waitFor("message:text");
  const numbers = message.text.split(",");
  await ctx.reply("Сумма этих чисел: " + sumStrings(numbers));
}

/** Преобразует строки в числа и суммирует их */
function sumStrings(numbers: string[]): number {
  let sum = 0;
  for (const str of numbers) {
    const n = parseInt(str.trim(), 10);
    if (!isNaN(n)) {
      sum += n;
    }
  }
  return sum;
}
```

```js [JavaScript]
/** Диалог для сложения чисел */
async function sumConvo(conversation, ctx) {
  await ctx.reply("Отправьте мне ваши любимые числа, разделенные запятыми!");
  const { message } = await conversation.waitFor("message:text");
  const numbers = message.text.split(",");
  await ctx.reply("Сумма этих чисел: " + sumStrings(numbers));
}

/** Преобразует строки в числа и суммирует их */
function sumStrings(numbers) {
  let sum = 0;
  for (const str of numbers) {
    const n = parseInt(str.trim(), 10);
    if (!isNaN(n)) {
      sum += n;
    }
  }
  return sum;
}
```

:::

Это всего лишь JavaScript.

### Модули и классы

JavaScript поддерживает функции высшего порядка, классы и другие способы структурирования кода в модули.
Естественно, все это может быть использовано в диалогах.

Вот тот же код, преобразованный в модуль с простой реализацией через внедрение зависимостей.

::: code-group

```ts [TypeScript]
/**
 * Модуль, который может запросить у пользователя числа
 * и предоставляет способ их сложения.
 *
 * Требует объект диалога, переданный через внедрение зависимостей.
 */
function sumModule(conversation: Conversation) {
  /** Преобразует строки в числа и суммирует их */
  function sumStrings(numbers: string[]): number {
    let sum = 0;
    for (const str of numbers) {
      const n = parseInt(str.trim(), 10);
      if (!isNaN(n)) {
        sum += n;
      }
    }
    return sum;
  }

  /** Запрашивает числа у пользователя */
  async function askForNumbers(ctx: Context) {
    await ctx.reply("Отправьте мне ваши любимые числа, разделенные запятыми!");
  }

  /** Ждет, пока пользователь отправит числа, и отвечает их суммой */
  async function sumUserNumbers() {
    const ctx = await conversation.waitFor(":text");
    const sum = sumStrings(ctx.msg.text);
    await ctx.reply("Сумма этих чисел: " + sum);
  }

  return { askForNumbers, sumUserNumbers };
}

/** Диалог для сложения чисел */
async function sumConvo(conversation: Conversation, ctx: Context) {
  const mod = sumModule(conversation);
  await mod.askForNumbers(ctx);
  await mod.sumUserNumbers();
}
```

```js [JavaScript]
/**
 * Модуль, который может запросить у пользователя числа
 * и предоставляет способ их сложения.
 *
 * Требует объект диалога, переданный через внедрение зависимостей.
 */
function sumModule(conversation) {
  /** Преобразует строки в числа и суммирует их */
  function sumStrings(numbers) {
    let sum = 0;
    for (const str of numbers) {
      const n = parseInt(str.trim(), 10);
      if (!isNaN(n)) {
        sum += n;
      }
    }
    return sum;
  }

  /** Запрашивает числа у пользователя */
  async function askForNumbers(ctx) {
    await ctx.reply("Отправьте мне ваши любимые числа, разделенные запятыми!");
  }

  /** Ждет, пока пользователь отправит числа, и отвечает их суммой */
  async function sumUserNumbers() {
    const ctx = await conversation.waitFor(":text");
    const sum = sumStrings(ctx.msg.text);
    await ctx.reply("Сумма этих чисел: " + sum);
  }

  return { askForNumbers, sumUserNumbers };
}

/** Диалог для сложения чисел */
async function sumConvo(conversation, ctx) {
  const mod = sumModule(conversation);
  await mod.askForNumbers(ctx);
  await mod.sumUserNumbers();
}
```

:::

Это избыточно для простой задачи сложения чисел.
Тем не менее, это демонстрирует важный момент.

Вы правы:
Это всего лишь JavaScript.

## Непрекращающиеся диалоги

По умолчанию все данные, хранимые плагином диалогов, сохраняются в памяти.
Это означает, что при завершении работы вашего процесса все активные диалоги завершатся и их потребуется перезапустить.

Если вы хотите сохранять данные между перезапусками сервера, нужно подключить плагин диалогов к базе данных.
Мы создали [множество различных адаптеров для хранения](https://github.com/grammyjs/storages/tree/main/packages#grammy-storages), чтобы упростить этот процесс.
(Это те же адаптеры, которые использует [плагин сессий](./session#известные-адаптеры-хранения).)

Предположим, вы хотите сохранять данные на диске в директории с именем `convo-data`.
Для этого вам понадобится [`FileAdapter`](https://github.com/grammyjs/storages/tree/main/packages/file#installation).

::: code-group

```ts [Node.js]
import { FileAdapter } from "@grammyjs/storage-file";

bot.use(conversations({
  storage: new FileAdapter({ dirName: "convo-data" }),
}));
```

```ts [Deno]
import { FileAdapter } from "https://deno.land/x/grammy_storages/file/src/mod.ts";

bot.use(conversations({
  storage: new FileAdapter({ dirName: "convo-data" }),
}));
```

:::

Готово!

Вы можете использовать любой адаптер для хранения данных, который способен сохранять данные типа [`VersionedState`](/ref/conversations/versionedstate) из [`ConversationData`](/ref/conversations/conversationdata).
Оба типа можно импортировать из плагина conversations.
Другими словами, если вы хотите вынести хранилище в переменную, можно использовать следующую аннотацию типа:

```ts
const storage = new FileAdapter<VersionedState<ConversationData>>({
  dirName: "convo-data",
});
```

Разумеется, те же типы можно использовать с любым другим адаптером для хранения.

### Версионирование данных

Если вы сохраняете состояние диалога в базе данных, а затем обновляете исходный код, возникает несоответствие между сохранёнными данными и функцией построения диалога.
Это приводит к повреждению данных и нарушает воспроизведение.

Вы можете предотвратить это, указав версию вашего кода.
Каждый раз, когда вы меняете диалог, увеличивайте версию.
Плагин для работы с диалогами обнаружит несоответствие версий и автоматически выполнит миграцию всех данных.

```ts
bot.use(conversations({
  storage: {
    type: "key",
    version: 42, // может быть числом или строкой
    adapter: storageAdapter,
  },
}));
```

Если вы не укажете версию, она по умолчанию будет равна `0`.

::: tip Забыли изменить версию? Не переживайте!

Плагин для работы с диалогами уже имеет надёжные механизмы защиты, которые должны отловить большинство случаев повреждения данных.
Если это будет обнаружено, внутри диалога будет выброшена ошибка, что приведёт к сбою работы диалога.
При условии, что вы не перехватываете и не подавляете эту ошибку, диалог удалит повреждённые данные и перезапустится корректно.

Тем не менее, эта защита не покрывает 100 % случаев, поэтому в будущем обязательно обновляйте номер версии.

:::

### Несериализуемые данные

[Помните](#диалоги-хранят-состояние), что все данные, возвращённые из [`conversation.external`](/ref/conversations/conversation#external), будут сохранены.
Это означает, что все данные, возвращаемые `conversation.external`, должны быть сериализуемыми.

Если вы хотите вернуть данные, которые не могут быть сериализованы, такие как классы или [`BigInt`](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/BigInt), вы можете предоставить пользовательский сериализатор для решения этой проблемы.

```ts
const largeNumber = await conversation.external({
  // Вызов API, который возвращает BigInt (не может быть преобразован в JSON).
  task: () => 1000n ** 1000n,
  // Преобразование BigInt в строку для хранения.
  beforeStore: (n) => String(n),
  // Преобразование строки обратно в BigInt для использования.
  afterLoad: (str) => BigInt(str),
});
```

Если вы хотите выбросить ошибку из задачи, вы можете указать дополнительные функции сериализации для объектов ошибок.
Подробнее смотрите в разделе [`ExternalOp`](/ref/conversations/externalop) в документации API.

### Ключи для хранения данных

По умолчанию данные диалогов хранятся для каждого чата отдельно.
Это идентично тому, [как работает плагин сессий](./session#ключи-сессии).

В результате диалог не может обрабатывать обновления из нескольких чатов одновременно.
Если это необходимо, вы можете [определить собственную функцию для создания ключей хранения](/ref/conversations/conversationoptions#storage).
Однако, как и в случае с сессиями, [не рекомендуется](./session#ключи-сессии) использовать эту опцию в serverless средах из-за возможных проблем с состояниями гонок.

Также, как и в случае с сессиями, вы можете хранить данные диалогов под пространством имён, используя опцию `prefix`.
Это особенно полезно, если вы хотите использовать один и тот же адаптер для хранения данных как для сессий, так и для диалогов.
Хранение данных в разных пространствах имён предотвратит их конфликт.

Обе опции можно указать следующим образом:

```ts
bot.use(conversations({
  storage: {
    type: "key",
    adapter: storageAdapter,
    getStorageKey: (ctx) => ctx.from?.id.toString(),
    prefix: "convo-",
  },
}));
```

Если пользователь с идентификатором `424242` войдёт в диалог, ключ хранения теперь будет выглядеть как `convo-424242`.

Изучите документацию API для [`ConversationStorage`](/ref/conversations/conversationstorage), чтобы узнать больше о хранении данных с использованием плагина диалогов.
В частности, там объясняется, как хранить данные без использования функции ключей хранения, с помощью параметра `type: "context"`.

## Использование плагинов внутри диалогов

[Помните](#объекты-контекста-диалогов), что объекты контекста внутри диалогов независимы от объектов контекста в окружающем middleware.
Это означает, что на них не будут установлены никакие плагины по умолчанию, даже если плагины установлены для вашего бота.

К счастью, все плагины grammY, [кроме сессий](#доступ-к-сессиям-внутри-диалогов), совместимы с диалогами.
Например, вот как можно установить [плагин hydrate](./hydrate) для диалога.

::: code-group

```ts [TypeScript]
// Устанавливаем плагин для диалогов только снаружи.
type MyContext = ConversationFlavor<Context>;
// Устанавливаем плагин hydrate только внутри.
type MyConversationContext = HydrateFlavor<Context>;

bot.use(conversations());

// Передаём внешний и внутренний объект контекста.
type MyConversation = Conversation<MyContext, MyConversationContext>;
async function convo(conversation: MyConversation, ctx: MyConversationContext) {
  // Плагин hydrate установлен в`ctx` здесь.
  const other = await conversation.wait();
  // Плагин hydrate установлен и в `other` здесь.
}
bot.use(createConversation(convo, { plugins: [hydrate()] }));

bot.command("enter", async (ctx) => {
  // Плагин hydrate НЕ установлен в `ctx` здесь.
  await ctx.conversation.enter("convo");
});
```

```js [JavaScript]
bot.use(conversations());

async function convo(conversation, ctx) {
  // Плагин hydrate установлен в `ctx` здесь.
  const other = await conversation.wait();
  // Плагин hydrate установлен и в `other` здесь.
}
bot.use(createConversation(convo, { plugins: [hydrate()] }));

bot.command("enter", async (ctx) => {
  // Плагин hydrate НЕ установлен в `ctx` здесь.
  await ctx.conversation.enter("convo");
});
```

:::

В обычных [middleware](../guide/middleware) плагины выполняют код для текущего объекта контекста, затем вызывают `next`, чтобы дождаться последующего middleware, а потом снова могут выполнить код.

Диалоги не являются middleware, и плагины не могут взаимодействовать с диалогами так же, как с middleware.
Когда [объект контекста создаётся](#объекты-контекста-диалогов) внутри диалога, он передаётся плагинам, которые могут обрабатывать его как обычно.
Для плагинов это выглядит так, будто установлены только плагины и отсутствуют последующие обработчики.
После завершения работы всех плагинов объект контекста становится доступным для диалога.

В результате любая работа по очистке, выполняемая плагинами, завершается до запуска функции построения диалога.
Все плагины, кроме сессий, работают с этим подходом корректно.
Если вы хотите использовать сессии, [перейдите вниз](#доступ-к-сессиям-внутри-диалогов).

### Плагины по умолчанию

Если у вас есть множество диалогов, которые требуют одинакового набора плагинов, вы можете определить плагины по умолчанию.
В этом случае больше не нужно передавать `hydrate` в `createConversation`.

::: code-group

```ts [TypeScript]
// В TypeScript необходимо указать типы контекста для использования плагинов.
bot.use(conversations<MyContext, MyConversationContext>({
  plugins: [hydrate()],
}));
// Следующий диалог будет содержать установленный hydrate.
bot.use(createConversation(convo));
```

```js [JavaScript]
bot.use(conversations({
  plugins: [hydrate()],
}));
// Следующий диалог будет содержать установленный hydrate.
bot.use(createConversation(convo));
```

:::

Убедитесь, что вы установили типы контекста для всех плагинов по умолчанию внутри всех диалогов.

### Использование трансформирующих плагинов внутри диалогов

Если вы устанавливаете плагин через `bot.api.config.use`, то вы не можете передать его напрямую в массив `plugins`.
Вместо этого его нужно устанавливать для экземпляра `Api` каждого объекта контекста. Это легко сделать внутри обычного middleware-плагина.

```ts
bot.use(createConversation(convo, {
  plugins: [async (ctx, next) => {
    ctx.api.config.use(transformer);
    await next();
  }],
}));
```

Замените `transformer` на нужный плагин.
Вы можете установить несколько трансформеров одним вызовом `ctx.api.config.use`.

### Доступ к сессиям внутри диалогов

Из-за [особенностей работы плагинов внутри диалогов](#использование-плагинов-внутри-диалогов) [плагин сессий](./session) не может быть установлен в диалоге так же, как другие плагины.
Вы не можете передать его в массив `plugins`, так как это приведёт к следующему:

1. Данные будут считаны.
2. Вызовется `next` (который сразу завершится).
3. Те же самые данные будут записаны обратно.
4. Контекст будет передан в диалог.

Обратите внимание, что сессия сохраняется до внесения изменений.
Это означает, что все изменения данных сессии теряются.

Вместо этого вы можете использовать `conversation.external`, чтобы получить [доступ к внешнему объекту контекста](#объекты-контекста-диалогов), где установлен плагин сессий.

```ts
// Чтение данных сессии внутри диалога.
const session = await conversation.external((ctx) => ctx.session);

// Изменение данных сессии внутри диалога.
session.count += 1;

// Сохранение данных сессии внутри диалога.
await conversation.external((ctx) => {
  ctx.session = session;
});
```

Использование плагина сессий можно рассматривать как способ выполнения побочных эффектов, так как сессии обращаются к базе данных.
Следуя [Золотому правилу](#золотое-правило-для-диалогов), это нужно делать аккуратно и в строго определённой последовательности.y makes sense that session access needs to be wrapped inside `conversation.external`.

## Диалоговые Меню

Вы можете определить меню с помощью [плагина меню](./menu) за пределами диалога и затем передать его в массив `plugins` [как любой другой плагин](#использование-плагинов-внутри-диалогов).

Однако это означает, что меню не будет иметь доступ к обработчику `conversation` в своих обработчиках кнопок.
Как результат, вы не сможете ожидать обновлений внутри меню.

Идеально, если при нажатии на кнопку можно было бы дождаться сообщения от пользователя, а затем выполнить навигацию по меню в зависимости от ответа пользователя.
Это возможно с помощью `conversation.menu()`, который позволяет создавать _диалоговые меню_.

```ts
let email = "";

const emailMenu = conversation.menu()
  .text("Узнать текущий email", (ctx) => ctx.reply(email || "пусто"))
  .text(() => email ? "Изменить email" : "Установить email", async (ctx) => {
    await ctx.reply("Какой ваш email?");
    const response = await conversation.waitFor(":text");
    email = response.msg.text;
    await ctx.reply(`Ваш email: ${email}!`);
    ctx.menu.update();
  })
  .row()
  .url("О проекте", "https://grammy.dev");

const otherMenu = conversation.menu()
  .submenu("Перейти к меню email", emailMenu, async (ctx) => {
    await ctx.reply("Переход...");
  });

await ctx.reply("Вот ваше меню", {
  reply_markup: otherMenu,
});
```

`conversation.menu()` возвращает меню, которое можно настраивать, добавляя кнопки так же, как в плагине меню.
Фактически, если вы посмотрите на [`ConversationMenuRange`](/ref/conversations/conversationmenurange) в документации API, то увидите, что оно похоже на [`MenuRange`](/ref/menu/menurange) из плагина меню.

Диалоговые меню остаются активными только пока активен диалог.
Вы должны вызывать `ctx.menu.close()` для всех меню перед выходом из диалога.

Если вы хотите предотвратить завершение диалога, вы можете использовать следующий фрагмент кода в конце диалога.
Однако [помните](#диалоги-хранят-состояние), что плохая идея заставлять диалог работать бесконечно.

```ts
// Ожидать бесконечно.
await conversation.waitUntil(() => false, {
  otherwise: (ctx) => ctx.reply("Пожалуйста, используйте меню выше!"),
});
```

Наконец, обратите внимание, что диалоговые меню гарантированно не будут мешать внешним меню.
Другими словами, внешнее меню никогда не обработает обновление меню внутри диалога и наоборот.

### Совместимость с Плагином Меню

Когда вы определяете меню за пределами диалога и используете его для входа в диалог, можно определить диалоговое меню, которое будет активно, пока идет диалог.
Когда диалог завершится, управление снова перейдет внешнему меню.

Для этого необходимо задать одинаковый идентификатор меню для обоих случаев.

```ts
// Вне диалога (плагин меню):
const menu = new Menu("my-menu");
// Внутри диалога (плагин диалогов):
const menu = conversation.menu("my-menu");
```

Чтобы это работало, нужно убедиться, что оба меню имеют **одинаковую структуру** при передаче управления в диалог или обратно.
Иначе при нажатии на кнопку меню будет [обнаружено как устаревшее](./menu#устаревшие-меню-и-отпечатки), и обработчик кнопки не будет вызван.

Структура меню определяется следующими характеристиками:

- Формой меню (число строк и кнопок в каждой строке).
- Надписью на кнопке.

1. **Изменение формы меню при входе в диалог**:
   Рекомендуется сразу редактировать меню так, чтобы оно имело смысл в контексте диалога.
   Диалог тогда может использовать меню с подходящей структурой.

2. **Возврат управления внешнему меню**:
   Если диалог оставляет меню (например, не закрывает его), управление снова может перейти внешнему меню.
   Структура меню при этом должна совпадать.

Пример этой совместимости можно найти в [репозитории ботов-примеров](https://github.com/grammyjs/examples?tab=readme-ov-file#menus-with-conversation-menu-with-conversation).
Обратите внимание, что совместимость упрощает взаимодействие между меню, обеспечивая гладкую навигацию для пользователя.

## Conversational Forms

Часто диалоги используются для создания форм в интерфейсе чата.

Все вызовы wait возвращают объекты контекста.
Однако, когда вы ждете текстовое сообщение, вам может понадобиться только текст сообщения, без взаимодействия с остальной частью объекта контекста.

Диалоговые формы позволяют сочетать проверку обновлений с извлечением данных из объекта контекста.
Это похоже на поле в форме.
Рассмотрим следующий пример.

```ts
await ctx.reply("Пожалуйста, отправьте фотографию, чтобы я уменьшил её!");
const photo = await conversation.form.photo();
await ctx.reply("Какой ширины должна быть фотография?");
const width = await conversation.form.int();
await ctx.reply("Какой высоты должна быть фотография?");
const height = await conversation.form.int();
await ctx.reply(`Изменяю размер фотографии до ${width}x${height} ...`);
const scaled = await scaleImage(photo, width, height);
await ctx.replyWithPhoto(scaled);
```

Существует гораздо больше полей для форм.
Ознакомьтесь с [`ConversationForm`](/ref/conversations/conversationform#methods) в документации API.

Все поля форм принимают функцию otherwise, которая будет выполнена, если получено не подходящее обновление.
Кроме того, они принимают функцию action, которая будет выполнена, если поле формы заполнено корректно.

```ts
// Ожидание выбора базовой операции вычисления.
const op = await conversation.form.select(["+", "-", "*", "/"], {
  action: (ctx) => ctx.deleteMessage(),
  otherwise: (ctx) => ctx.reply("Expected +, -, *, or /!"),
});
```

Диалоговые формы так же позволяют вам создавать кастомные поля с помощью [`conversation.form.build`](/ref/conversations/conversationform#build).

## Таймаут ожидания

Каждый раз, когда вы ожидаете обновления, вы можете указать значение таймаута.

```ts
// Ожидание только в течение одного часа, затем выход из диалога.
const oneHourInMilliseconds = 60 * 60 * 1000;
await conversation.wait({ maxMilliseconds: oneHourInMilliseconds });
```

Когда вызывается метод ожидания, автоматически вызывается [`conversation.now()`](#золотое-правило-для-диалогов).

Как только поступает следующее обновление, `conversation.now()` вызывается снова.
Если обновление заняло больше времени, чем указано в `maxMilliseconds`, диалог прекращается, а обновление передаётся обратно в систему middleware.
Будут вызваны все downstream middleware.

Это создаёт впечатление, что диалог больше не был активным в момент получения обновления.

Обратите внимание, что код не будет выполнен точно через указанное время.
Код выполняется только при поступлении следующего обновления.

Вы можете указать значение таймаута по умолчанию для всех вызовов ожидания внутри диалога.

```ts
// Всегда ожидать только один час.
const oneHourInMilliseconds = 60 * 60 * 1000;
bot.use(createConversation(convo, {
  maxMillisecondsToWait: oneHourInMilliseconds,
}));
```

Передача значения непосредственно в вызов ожидания переопределяет значение по умолчанию.

## События входа и выхода

Вы можете указать callback функцию, которая будет вызываться каждый раз, когда происходит вход в диалог.
Аналогично, можно указать callback функцию, которая вызывается при выходе из диалога.

```ts
bot.use(conversations({
  onEnter(id, ctx) {
    // Вход в диалог с идентификатором `id`.
  },
  onExit(id, ctx) {
    // Выход из диалога с идентификатором `id`.
  },
}));
```

Каждая callback функция получает два значения.
Первое значение --- это идентификатор диалога, в который вошли или из которого вышли.
Второе значение --- это текущий объект контекста окружающего middleware.

Обратите внимание, что функции обратного вызова вызываются только при входе или выходе из диалога с использованием `ctx.conversation`.
Функция `onExit` также вызывается, когда диалог завершает себя с помощью `conversation.halt` или в случае [истечения времени ожидания](#таимаут-ожидания).

## Одновременные вызовы ожидания

Вы можете использовать плавающие промисы для одновременного ожидания нескольких событий.
Когда поступает новое обновление, разрешается только первый подходящий вызов ожидания.

```ts
await ctx.reply("Отправьте фото и подпись!");
const [textContext, photoContext] = await Promise.all([
  conversation.waitFor(":text"),
  conversation.waitFor(":photo"),
]);
await ctx.replyWithPhoto(photoContext.msg.photo.at(-1).file_id, {
  caption: textContext.msg.text,
});
```

В приведённом примере не имеет значения, что пользователь отправит первым: фото или текст.
Оба промиса будут выполнены в порядке, выбранном пользователем для отправки двух ожидаемых сообщений.
[`Promise.all`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) работает стандартным образом и разрешается только тогда, когда выполнены все переданные промисы.

Этот подход также можно использовать для ожидания несвязанных событий.
Например, вот как установить глобальный обработчик выхода из диалога:

```ts
conversation.waitForCommand("exit") // без await!
  .then(() => conversation.halt());
```

Как только диалог [завершается любым способом](#выход-из-диалогов), все ожидающие вызовы будут отброшены.
Например, следующий диалог завершится сразу после входа, не ожидая никаких обновлений.

::: code-group

```ts [TypeScript]
async function convo(conversation: Conversation, ctx: Context) {
  const _promise = conversation.wait() // без await!
    .then(() => ctx.reply("Это сообщение никогда не будет отправлено!"));

  // Диалог завершается сразу после входа.
}
```

```js [JavaScript]
async function convo(conversation, ctx) {
  // Не используйте await:
  const _promise = conversation.wait()
    .then(() => ctx.reply("Это сообщение никогда не будет отправлено!"));

  // Диалог завершается сразу после входа.
}
```

:::

Внутренне, когда одновременно достигается несколько вызовов ожидания, плагин для диалогов отслеживает список таких вызовов.
Как только поступает следующее обновление, функция построения диалога выполняется заново для каждого вызова ожидания, пока один из них не примет обновление.
Если ни один из ожидающих вызовов не принимает обновление, оно будет отброшено.

## Контрольные точки и возврат во времени

Плагин диалогов [отслеживает](#диалоги-это-механизмы-воспроизведения) выполнение функции построения диалога.

Это позволяет создавать контрольные точки в процессе выполнения.
Контрольная точка содержит информацию о том, насколько далеко выполнена функция на текущий момент.
Она может быть использована для возврата к этой точке позже.

Естественно, все выполненные за это время операции ввода-вывода не будут отменены.
В частности, возврат к контрольной точке не отменяет отправленные сообщения.

```ts
const checkpoint = conversation.checkpoint();

// Позже:
if (ctx.hasCommand("reset")) {
  await conversation.rewind(checkpoint); // никогда не возвращается
}
```

Контрольные точки очень полезны для "возврата назад."
Однако, как и использование `break` и `continue` с [метками](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label) в JavaScript, перемещение по коду может снизить читаемость.
**Не злоупотребляйте этой возможностью.**

Внутренне, перемотка диалога завершает выполнение функции так же, как вызов ожидания, и затем воспроизводит её только до точки, где была создана контрольная точка.
Перемотка не выполняет функции в обратном порядке, даже если это кажется таковым.

## Параллельные диалоги

Диалоги в разных чатах полностью независимы и всегда могут выполняться параллельно.

Однако по умолчанию в каждом чате может быть только один активный диалог.
Если вы попытаетесь начать новый диалог, пока уже активен другой, вызов `enter` вызовет ошибку.

Вы можете изменить это поведение, отметив диалог как параллельный.

```ts
bot.use(createConversation(convo, { parallel: true }));
```

Это влечёт за собой два изменения.

Во-первых, теперь вы можете начинать этот диалог даже тогда, когда уже активен другой (тот же или другой).
Например, если у вас есть диалоги `captcha` и `settings`, можно запустить `captcha` пять раз и `settings` двенадцать раз --- все в одном чате.

Во-вторых, если диалог не принимает обновление, оно больше не отбрасывается по умолчанию.
Вместо этого управление передаётся обратно системе middleware.

Все установленные диалоги получают возможность обработать входящее обновление, пока один из них не примет его.
Однако только один диалог сможет обработать обновление.

Когда несколько разных диалогов активны одновременно, порядок middleware определяет, какой из них обработает обновление первым.
Если один диалог активен несколько раз, первым его обработает самый старый экземпляр (тот, который был запущен раньше).

Это отлично проиллюстрировано на примере:

::: code-group

```ts [TypeScript]
async function captcha(conversation: Conversation, ctx: Context) {
  const user = ctx.from!.id;
  await ctx.reply("Добро пожаловать в чат! Какая лучшая библиотека для ботов?");
  const answer = await conversation.waitFor(":text").andFrom(user);
  if (answer.msg.text === "grammY") {
    await ctx.reply("Правильно! Ваше будущее светло!");
  } else {
    await ctx.banAuthor();
  }
}

async function settings(conversation: Conversation, ctx: Context) {
  const user = ctx.from!.id;
  const main = conversation.checkpoint();
  const options = ["Настройки чата", "О нас", "Конфиденциальность"];
  await ctx.reply("Добро пожаловать в настройки!", {
    reply_markup: Keyboard.from(options
      .map((btn) => [Keyboard.text(btn)])),
  });
  const option = await conversation.waitFor(":text")
    .andFrom(user)
    .and((ctx) => options.includes(ctx.msg.text), {
      otherwise: (ctx) => ctx.reply("Пожалуйста, используйте кнопки!"),
    });
  await openSettingsMenu(option, main);
}

bot.use(createConversation(captcha));
bot.use(createConversation(settings));
```

```js [JavaScript]
async function captcha(conversation, ctx) {
  const user = ctx.from.id;
  await ctx.reply("Добро пожаловать в чат! Какая лучшая библиотека для ботов?");
  const answer = await conversation.waitFor(":text").andFrom(user);
  if (answer.msg.text === "grammY") {
    await ctx.reply("Правильно! Ваше будущее светло!");
  } else {
    await ctx.banAuthor();
  }
}

async function settings(conversation, ctx) {
  const user = ctx.from.id;
  const main = conversation.checkpoint();
  const options = ["Настройки чата", "О нас", "Конфиденциальность"];
  await ctx.reply("Добро пожаловать в настройки!", {
    reply_markup: Keyboard.from(options
      .map((btn) => [Keyboard.text(btn)])),
  });
  const option = await conversation.waitFor(":text")
    .andFrom(user)
    .and((ctx) => options.includes(ctx.msg.text), {
      otherwise: (ctx) => ctx.reply("Пожалуйста, используйте кнопки!"),
    });
  await openSettingsMenu(option, main);
}

bot.use(createConversation(captcha));
bot.use(createConversation(settings));
```

:::

Приведённый выше код работает в групповых чатах.
Он предоставляет два вида диалогов.
Диалог `captcha` используется, чтобы убедиться, что в чат присоединяются только хорошие разработчики (немного саморекламы grammY, лол).
Диалог `settings` используется для реализации меню настроек в групповом чате.

Обратите внимание, что все вызовы `wait` фильтруют по идентификатору пользователя и другим параметрам.

Предположим, что произошли следующие действия:

1. Вы вызвали `ctx.conversation.enter("captcha")`, чтобы войти в диалог `captcha`, обрабатывая обновление от пользователя с идентификатором `ctx.from.id === 42`.
2. Вы вызвали `ctx.conversation.enter("settings")`, чтобы войти в диалог `settings`, обрабатывая обновление от пользователя с идентификатором `ctx.from.id === 3`.
3. Вы вызвали `ctx.conversation.enter("captcha")`, чтобы войти в диалог `captcha`, обрабатывая обновление от пользователя с идентификатором `ctx.from.id === 43`.

Таким образом, в этом групповом чате сейчас активно три диалога: `captcha` используется дважды, а `settings` один раз.

> Учтите, что `ctx.conversation` предоставляет [различные способы](/ref/conversations/conversationcontrols#exit) выхода из конкретных диалогов даже при включённых параллельных диалогах.

Далее происходят следующие события в порядке их очереди:

1. Пользователь `3` отправляет сообщение с текстом `"О нас"`.
2. Приходит обновление с текстовым сообщением.
3. Первая активная сессия диалога `captcha` воспроизводится.
4. Вызов `waitFor(":text")` принимает обновление, но дополнительный фильтр `andFrom(42)` отклоняет его.
5. Вторая активная сессия диалога `captcha` воспроизводится.
6. Вызов `waitFor(":text")` принимает обновление, но дополнительный фильтр `andFrom(43)` отклоняет его.
7. Все активные сессии `captcha` отклонили обновление, поэтому управление возвращается в систему middleware.
8. Воспроизводится активная сессия диалога `settings`.
9. Вызов `wait` разрешается, и `option` получает объект контекста для обновления текстового сообщения.
10. Вызывается функция `openSettingsMenu`.
    Она может отправить пользователю текст о нас и перезапустить меню, возвращая его в состояние `main`.

Обратите внимание, что, несмотря на то, что два диалога ожидали завершения проверки CAPTCHA для пользователей `42` и `43`, бот корректно ответил пользователю `3`, который запустил меню настроек.
Фильтруемые вызовы `wait` позволяют определить, какие обновления относятся к текущему диалогу.
Игнорируемые обновления передаются дальше и могут быть обработаны другими диалогами.

Пример выше использует групповой чат для иллюстрации того, как диалоги могут обрабатывать нескольких пользователей параллельно в одном чате.
В действительности параллельные диалоги работают во всех чатах.
Это позволяет ожидать разные события в одном чате с единственным пользователем.

Вы можете комбинировать параллельные диалоги с [таймаутами ожидания](#таимаут-ожидания), чтобы уменьшить количество активных диалогов.

## Обзор активных диалогов

Внутри вашего middleware вы можете проверить, какой диалог активен.

```ts
bot.command("stats", (ctx) => {
  const convo = ctx.conversation.active("convo");
  console.log(convo); // 0 или 1
  const isActive = convo > 0;
  console.log(isActive); // false или true
});
```

Если вы передадите идентификатор диалога в `ctx.conversation.active` --- он вернёт `1`, если этот диалог активен, и `0` в противном случае.

Если вы включите [параллельные диалоги](#параллельные-диалоги) для диалога, он вернёт то количество диалогов, сколько их сейчас активно.

Вызовите `ctx.conversation.active()` без аргументов, чтобы получить объект, содержащий идентификаторы всех активных диалогов в виде ключей.
Соответствующие значения показывают, сколько экземпляров каждого диалога активно.

Если диалог `captcha` активен дважды, а диалог `settings` активен один раз, `ctx.conversation.active()` будет работать следующим образом:

```ts
bot.command("stats", (ctx) => {
  const stats = ctx.conversation.active();
  console.log(stats); // { captcha: 2, settings: 1 }
});
```

## Миграция с версии 1.x на 2.x

Conversations 2.0 --- это полное переписывание библиотеки с нуля.

Несмотря на то, что базовые концепции API остались прежними, две реализации кардинально отличаются в том, как они работают «под капотом».
Вкратце, миграция с версии 1.x на 2.x требует минимальных изменений в вашем коде, но предполагает необходимость сброса всех сохранённых данных.
Таким образом, все активные диалоги будут перезапущены.

### Миграция данных с версии 1.x на 2.x

При обновлении с версии 1.x на 2.x невозможно сохранить текущее состояние диалогов.

Вам нужно просто удалить соответствующие данные из ваших сессий.
Рассмотрите возможность использования [миграций сессий](./session#миграции) для этого.

Сохранение данных диалогов в версии 2.x выполняется так, как описано [здесь](#непрекращающиеся-диалоги).

### Изменения типов между версиями 1.x и 2.x

В версии 1.x тип контекста внутри диалога совпадал с типом контекста, используемым в окружающем middleware.

В версии 2.x вы должны всегда объявлять два типа контекста --- [тип контекста снаружи и тип контекста внутри](#объекты-контекста-диалогов).
Эти типы никогда не могут быть одинаковыми, и если они совпадают, это ошибка в вашем коде.

Это связано с тем, что внешний тип контекста должен всегда включать [`ConversationFlavor`](/ref/conversations/conversationflavor), а внутренний тип контекста не должен его содержать.

Кроме того, теперь вы можете устанавливать [независимый набор плагинов](#использование-плагинов-внутри-диалогов) для каждого диалога.

### Изменения доступа к сессиям между версиями 1.x и 2.x

Вы больше не можете использовать `conversation.session`.
Теперь вы должны использовать `conversation.external` для работы с сессиями.

```ts
// Чтение данных сессии.
const session = await conversation.session; // [!code --]
const session = await conversation.external((ctx) => ctx.session); // [!code ++]

// Запись данных сессии.
conversation.session = newSession; // [!code --]
await conversation.external((ctx) => { // [!code ++]
  ctx.session = newSession; // [!code ++]
}); // [!code ++]
```

> Доступ к `ctx.session` был возможен в версии 1.x, но всегда являлся некорректным.
> В версии 2.x `ctx.session` больше недоступен.

### Изменения совместимости с плагинами между версиями 1.x и 2.x

В версии 1.x диалоги имели низкую совместимость с плагинами.
Некоторую совместимость можно было достичь с помощью `conversation.run`.

Этот способ был удалён в версии 2.x.
Теперь вы можете передавать плагины в массив `plugins`, как описано [здесь](#использование-плагинов-внутри-диалогов).
Сессии требуют [особого подхода](#изменения-доступа-к-сессиям-между-версиями-1-x-и-2-x).
Совместимость с меню улучшена благодаря внедрению [диалоговых меню](#диалоговые-меню).

### Изменения в параллельных диалогах между версиями 1.x и 2.x

Параллельные диалоги работают одинаково в версиях 1.x и 2.x.

Однако эта функция часто вызывала путаницу, когда использовалась случайно.
В версии 2.x необходимо явно включить эту функцию, указав `{ parallel: true }`, как описано [здесь](#параллельные-диалоги).

Единственное кардинальное изменение в этой функции --- обновления больше не передаются обратно в middleware систему по умолчанию.
Это происходит только в случае, если диалог помечен как параллельный.

Обратите внимание, что все методы ожидания и поля формы предоставляют опцию `next` для переопределения поведения по умолчанию.
Эта опция была переименована из `drop` в версии 1.x, и семантика флага была изменена соответствующим образом.

### Изменения форм между версиями 1.x и 2.x

Формы в версии 1.x были неисправны.
Например, `conversation.form.text()` возвращал текстовые сообщения даже для обновлений `edited_message` старых сообщений.
Многие из этих проблем были исправлены в версии 2.x.

Технически исправление ошибок не считается кардинальным изменением, но это всё же значительное изменение в поведении.

## Краткая информация о плагине

- Название: `conversations`
- [Исходник](https://github.com/grammyjs/conversations)
- [Ссылка](/ref/conversations/)
