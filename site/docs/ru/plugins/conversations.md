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

Функции постройки диалогов не выполняются как обычные функции.

Когда начинается диалог, функция будет выполнена только до первого вызова `wait`.
Далее выполнение функции прерывается, и она больше не выполняется.
Плагин запоминает, что был достигнут вызов `wait`, и сохраняет эту информацию.

Когда поступает следующее обновление, диалог снова выполняется с самого начала.
Однако на этот раз никакие вызовы API не выполняются, из-за чего код выполняется очень быстро и не оказывает никакого эффекта.
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

Это означает, что каждая строка кода будет выполнена несколько раз --- один раз в обычном режиме и несколько раз во время воспроизведения.
Поэтому вам нужно убедиться, что ваш код ведёт себя одинаково как при обычном выполнении, так и при воспроизведении.

Если вы выполняете вызовы API через `ctx.api` (включая `ctx.reply`), плагин обрабатывает их автоматически.
В то же время ваша работа с базой данных требует специальной обработки.

Вот как это делается.

### Золотое правило для диалогов

Теперь, когда [мы знаем, как работают диалоги](#conversations-are-replay-engines), мы можем определить одно правило, которое относится к коду, написанному внутри функции построения диалога.
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

- вызываете `ctx.reply` или другие [действия контекста](../guide/context#доступные-действия),
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

### Разговоры хранят состояние

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
- **Внутренние объекты контекста** (также называемые **объектами контекста диалога**) — это объекты контекста, создаваемые плагином диалогов.
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
Эта возможность недоступна, если вы начинаете разговор из middleware.

:::code-group

```ts [TypeScript]
/**
 * Возвращает ответ на вопрос о смысле жизни, Вселенной и всего остального.
 * Это значение доступно только в случае, если разговор
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
 * Это значение доступно только в случае, если разговор
 * вызывается из другого разговора.
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

### Inspecting Context Objects

It is very common to [destructure](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) the received context objects.
You can then perform further checks on the received data.

```ts
const { message } = await conversation.waitFor("message");
if (message.photo) {
  // Handle photo message
}
```

Conversations are also an ideal place to use [has checks](../guide/context#probing-via-has-checks).

## Exiting Conversations

The easiest way to exit a conversation is to return from it.
Throwing an error also terminates the conversation.

If this is not enough, you can manually halt the conversation at any moment.

```ts
async function convo(conversation: Conversation, ctx: Context) {
  // All branches exit the conversation:
  if (ctx.message?.text === "return") {
    return;
  } else if (ctx.message?.text === "error") {
    throw new Error("boom");
  } else {
    await conversation.halt(); // never returns
  }
}
```

You can also exit a conversation from your middleware.

```ts
bot.use(conversations());
bot.command("clean", async (ctx) => {
  await ctx.conversation.exit("convo");
});
```

You can even do this _before_ the targeted conversation is installed on your middleware system.
It is enough to have the conversations plugin itself installed.

## It's Just JavaScript

With [side-effects out of the way](#the-golden-rule-of-conversations), conversations are just regular JavaScript functions.
They might be executed in weird ways, but when developing a bot, you can usually forget this.
All the regular JavaScript syntax just works.

Most the things in this section are obvious if you have used conversations for some time.
However, if you are new, some of these things could surprise you.

### Variables, Branching, and Loops

You can use normal variables to store state between updates.
You can use branching with `if` or `switch`.
Loops via `for` and `while` work, too.

```ts
await ctx.reply("Send me your favorite numbers, separated by commas!");
const { message } = await conversation.waitFor("message:text");
const numbers = message.text.split(",");
let sum = 0;
for (const str of numbers) {
  const n = parseInt(str.trim(), 10);
  if (!isNaN(n)) {
    sum += n;
  }
}
await ctx.reply("The sum of these numbers is: " + sum);
```

It's just JavaScript.

### Functions and Recursion

You can split a conversation into multiple functions.
They can call each other and even do recursion.
(In fact, the plugin does not even know that you used functions.)

Here is the same code as above, refactored to functions.

:::code-group

```ts [TypeScript]
/** A conversation to add numbers */
async function sumConvo(conversation: Conversation, ctx: Context) {
  await ctx.reply("Send me your favorite numbers, separated by commas!");
  const { message } = await conversation.waitFor("message:text");
  const numbers = message.text.split(",");
  await ctx.reply("The sum of these numbers is: " + sumStrings(numbers));
}

/** Converts all given strings to numbers and adds them up */
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
/** A conversation to add numbers */
async function sumConvo(conversation, ctx) {
  await ctx.reply("Send me your favorite numbers, separated by commas!");
  const { message } = await conversation.waitFor("message:text");
  const numbers = message.text.split(",");
  await ctx.reply("The sum of these numbers is: " + sumStrings(numbers));
}

/** Converts all given strings to numbers and adds them up */
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

It's just JavaScript.

### Modules and Classes

JavaScript has higher-order functions, classes, and other ways of structuring your code into modules.
Naturally, all of them can be turned into conversations.

Here is the above code once again, refactored to a module with simple dependency injection.

::: code-group

```ts [TypeScript]
/**
 * A module that can ask the user for numbers, and that
 * provides a way to add up numbers sent by the user.
 *
 * Requires a conversation handle to be injected.
 */
function sumModule(conversation: Conversation) {
  /** Converts all given strings to numbers and adds them up */
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

  /** Asks the user for numbers */
  async function askForNumbers(ctx: Context) {
    await ctx.reply("Send me your favorite numbers, separated by commas!");
  }

  /** Waits for the user to send numbers, and replies with their sum */
  async function sumUserNumbers() {
    const ctx = await conversation.waitFor(":text");
    const sum = sumStrings(ctx.msg.text);
    await ctx.reply("The sum of these numbers is: " + sum);
  }

  return { askForNumbers, sumUserNumbers };
}

/** A conversation to add numbers */
async function sumConvo(conversation: Conversation, ctx: Context) {
  const mod = sumModule(conversation);
  await mod.askForNumbers(ctx);
  await mod.sumUserNumbers();
}
```

```js [JavaScript]
/**
 * A module that can ask the user for numbers, and that
 * provides a way to add up numbers sent by the user.
 *
 * Requires a conversation handle to be injected.
 */
function sumModule(conversation: Conversation) {
  /** Converts all given strings to numbers and adds them up */
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

  /** Asks the user for numbers */
  async function askForNumbers(ctx: Context) {
    await ctx.reply("Send me your favorite numbers, separated by commas!");
  }

  /** Waits for the user to send numbers, and replies with their sum */
  async function sumUserNumbers() {
    const ctx = await conversation.waitFor(":text");
    const sum = sumStrings(ctx.msg.text);
    await ctx.reply("The sum of these numbers is: " + sum);
  }

  return { askForNumbers, sumUserNumbers };
}

/** A conversation to add numbers */
async function sumConvo(conversation: Conversation, ctx: Context) {
  const mod = sumModule(conversation);
  await mod.askForNumbers(ctx);
  await mod.sumUserNumbers();
}
```

:::

This is clearly overkill for such a simple task as adding up a few numbers.
However, it illustrates a broader point.

You guessed it:
It's just JavaScript.

## Непрекращающиеся диалоги

By default, all data stored by the conversations plugin is kept in memory.
This means that when your process dies, all conversations are exited and will have to be restarted.

If you want to persist the data across server restarts, you need to connect the conversations plugin to a database.
We have built [a lot of different storage adapters](https://github.com/grammyjs/storages/tree/main/packages#grammy-storages) to make this simple.
(They are the same adapters that the [session plugin uses](./session#known-storage-adapters).)

Let's say you want to store data on disk in a directory called `convo-data`.
This means that you need the [`FileAdapter`](https://github.com/grammyjs/storages/tree/main/packages/file#installation).

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

Done!

You can use any storage adapter that is able to store data of type [`VersionedState`](/ref/conversations/versionedstate) of [`ConversationData`](/ref/conversations/conversationdata).
Both types can be imported from the conversations plugin.
In other words, if you want to extract the storage to a variable, you can use the following type annotation.

```ts
const storage = new FileAdapter<VersionedState<ConversationData>>({
  dirName: "convo-data",
});
```

Naturally, the same types can be used with any other storage adapter.

### Versioning Data

If you persist the state of the conversation in a database and then update the source code, there is a mismatch between the stored data and the conversation builder function.
This is a form of data corruption and will break the replay.

You can prevent this by specifying a version of your code.
Every time you change your conversation, you can increment the version.
The conversations plugin will then detect a version mismatch and migrate all data automatically.

```ts
bot.use(conversations({
  storage: {
    type: "key",
    version: 42, // can be number or string
    adapter: storageAdapter,
  },
}));
```

If you do not specify a version, it defaults to `0`.

::: tip Forgot to Change the Version? Don't Worry!

The conversations plugin already has good protections in place that should catch most cases of data corruption.
If this is detected, an error is thrown somewhere inside the conversation, which causes the conversation to crash.
Assuming that you don't catch and suppress that error, the conversation will therefore wipe the bad data and restart correctly.

That being said, this protection does not cover 100 % of the cases, so you should definitely make sure to update the version number in the future.

:::

### Non-serializable Data

[Remember](#conversations-store-state) that all data returned from [`conversation.external`](/ref/conversations/conversation#external) will be stored.
This means that all data returned from `conversation.external` must be serializable.

If you want to return data that cannot be serialized, such as classes or [`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt), you can provide a custom serializer to fix this.

```ts
const largeNumber = await conversation.external({
  // Call an API that returns a BigInt (cannot be converted to JSON).
  task: () => 1000n ** 1000n,
  // Convert bigint to string for storage.
  beforeStore: (n) => String(n),
  // Convert string back to bigint for usage.
  afterLoad: (str) => BigInt(str),
});
```

If you want to throw an error from the task, you can specify additional serialization functions for error objects.
Check out [`ExternalOp`](/ref/conversations/externalop) in the API reference.

### Storage Keys

By default, conversation data is stored per chat.
This is identical to [how the session plugin works](./session#session-keys).

As a result, a conversation cannot handle updates from multiple chats.
If this is desired, you can [define your own storage key function](/ref/conversations/conversationoptions#storage).
As with sessions, it is [not recommended](./session#session-keys) to use this option in serverless environments due to potential race conditions.

Also, just like with sessions, you can store your conversations data under a namespace using the `prefix` option.
This is especially useful if you want to use the same storage adapter for both your session data and your conversations data.
Storing the data in namespaces will prevent it from clashing.

You can specify both options as follows.

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

If a conversation is entered for a user with user identifier `424242`, the storage key will now be `convo-424242`.

Check out the API reference for [`ConversationStorage`](/ref/conversations/conversationstorage) to see more details about storing data with the conversations plugin.
Among other things, it will explain how to store data without a storage key function at all using `type: "context"`.

## Использование плагинов внутри диалогов

[Remember](#conversational-context-objects) that the context objects inside conversations are independent from the context objects in the surrounding middleware.
This means that they will have no plugins installed on them by default---even if the plugins are installed on your bot.

Fortunately, all grammY plugins [except sessions](#accessing-sessions-inside-conversations) are compatible with conversations.
For example, this is how you can install the [hydrate plugin](./hydrate) for a conversation.

::: code-group

```ts [TypeScript]
// Only install the conversations plugin outside.
type MyContext = ConversationFlavor<Context>;
// Only install the hydrate plugin inside.
type MyConversationContext = HydrateFlavor<Context>;

bot.use(conversations());

// Pass the outside and the inside context object.
type MyConversation = Conversation<MyContext, MyConversationContext>;
async function convo(conversation: MyConversation, ctx: MyConversationContext) {
  // The hydrate plugin is installed on `ctx` here.
  const other = await conversation.wait();
  // The hydrate plugin is installed on `other` here, too.
}
bot.use(createConversation(convo, { plugins: [hydrate()] }));

bot.command("enter", async (ctx) => {
  // The hydrate plugin is NOT installed on `ctx` here.
  await ctx.conversation.enter("convo");
});
```

```js [JavaScript]
bot.use(conversations());

async function convo(conversation, ctx) {
  // The hydrate plugin is installed on `ctx` here.
  const other = await conversation.wait();
  // The hydrate plugin is installed on `other` here, too.
}
bot.use(createConversation(convo, { plugins: [hydrate()] }));

bot.command("enter", async (ctx) => {
  // The hydrate plugin is NOT installed on `ctx` here.
  await ctx.conversation.enter("convo");
});
```

:::

In regular [middleware](../guide/middleware), plugins get to run some code on the current context object, then call `next` to wait for downstream middleware, and then they get to run some code again.

Conversations are not middleware, and plugins cannot interact with conversations in the same way as with middleware.
When a [context object is created](#conversational-context-objects) by the conversation, it will be passed to the plugins which can process it normally.
To the plugins, it will look like only the plugins are installed and no downstream handlers exist.
After all plugins are done, the context object is made available to the conversation.

As a result, any cleanup work done by plugins is performed before the conversation builder function runs.
All plugins except sessions work well with this.
If you want to use sessions, [scroll down](#accessing-sessions-inside-conversations).

### Default Plugins

If you have a lot of conversations that all need the same set of plugins, you can define default plugins.
Now, you no longer have to pass `hydrate` to `createConversation`.

::: code-group

```ts [TypeScript]
// TypeScript needs some help with the two context types
// so you often have to specify them to use plugins.
bot.use(conversations<MyContext, MyConversationContext>({
  plugins: [hydrate()],
}));
// The following conversation will have hydrate installed.
bot.use(createConversation(convo));
```

```js [JavaScript]
bot.use(conversations({
  plugins: [hydrate()],
}));
// The following conversation will have hydrate installed.
bot.use(createConversation(convo));
```

:::

Make sure to install the context flavors of all default plugins on the inside context types of all conversations.

### Using Transformer Plugins Inside Conversations

If you install a plugin via `bot.api.config.use`, then you cannot pass it to the `plugins` array directly.
Instead, you have to install it on the `Api` instance of each context object.
This is done easily from inside a regular middleware plugin.

```ts
bot.use(createConversation(convo, {
  plugins: [async (ctx, next) => {
    ctx.api.config.use(transformer);
    await next();
  }],
}));
```

Replace `transformer` by whichever plugin you want to install.
You can install several transformers in the same call to `ctx.api.config.use`.

### Accessing Sessions Inside Conversations

Due to the way [how plugins work inside conversations](#using-plugins-inside-conversations), the [session plugin](./session) cannot be installed inside a conversation in the same way as other plugins.
You cannot pass it to the `plugins` array because it would:

1. read data,
2. call `next` (which resolves immediately),
3. write back the exact same data, and
4. hand over the context to the conversation.

Note how the session gets saved before you change it.
This means that all changes to the session data get lost.

Instead, you can use `conversation.external` to get [access to the outside context object](#conversational-context-objects).
It has the session plugin installed.

```ts
// Read session data inside a conversation.
const session = await conversation.external((ctx) => ctx.session);

// Change the session data inside a conversation.
session.count += 1;

// Save session data inside a conversation.
await conversation.external((ctx) => {
  ctx.session = session;
});
```

In a sense, using the session plugin can be seen as a way of performing side-effects.
After all, sessions access a database.
Given that we must follow [The Golden Rule](#the-golden-rule-of-conversations), it only makes sense that session access needs to be wrapped inside `conversation.external`.

## Conversational Menus

You can define a menu with the [menu plugin](./menu) outside a conversation, and then pass it to the `plugins` array [like any other plugin](#using-plugins-inside-conversations).

However, this means that the menu does not have access to the conversation handle `conversation` in its button handlers.
As a result, you cannot wait for updates from inside a menu.

Ideally, when a button is clicked, it should be possible to wait for a message by the user, and then perform menu navigation when the user replies.
This is made possible by `conversation.menu()`.
It lets you define _conversational menus_.

```ts
let email = "";

const emailMenu = conversation.menu()
  .text("Get current email", (ctx) => ctx.reply(email || "empty"))
  .text(() => email ? "Change email" : "Set email", async (ctx) => {
    await ctx.reply("What is your email?");
    const response = await conversation.waitFor(":text");
    email = response.msg.text;
    await ctx.reply(`Your email is ${email}!`);
    ctx.menu.update();
  })
  .row()
  .url("About", "https://grammy.dev");

const otherMenu = conversation.menu()
  .submenu("Go to email menu", emailMenu, async (ctx) => {
    await ctx.reply("Navigating");
  });

await ctx.reply("Here is your menu", {
  reply_markup: otherMenu,
});
```

`conversation.menu()` returns a menu that can be built up by adding buttons the same way the menu plugin does.
If fact, if you look at [`ConversationMenuRange`](/ref/conversations/conversationmenurange) in the API reference, you will find it to be very similar to [`MenuRange`](/ref/menu/menurange) from the menu plugin.

Conversational menus stay active only as long as the conversation active.
You should call `ctx.menu.close()` for all menus before exiting the conversation.

If you want to prevent the conversation from exiting, you can simply use the following code snippet at the end of your conversation.
However, [remember](#conversations-store-state) that is it a bad idea to let your conversation live forever.

```ts
// Wait forever.
await conversation.waitUntil(() => false, {
  otherwise: (ctx) => ctx.reply("Please use the menu above!"),
});
```

Finally, note that conversational menus are guaranteed to never interfere with outside menus.
In other words, an outside menu will never handle the update of a menu inside a conversation, and vice-versa.

### Menu Plugin Interoperability

When you define a menu outside a conversation and use it to enter a conversation, you can define a conversational menu that takes over as long as the conversation is active.
When the conversation completes, the outside menu will take control again.

You first have to give the same menu identifier to both menus.

```ts
// Outside conversation (menu plugin):
const menu = new Menu("my-menu");
// Inside conversation (conversations plugin):
const menu = conversation.menu("my-menu");
```

In order for this to work, you must ensure that both menus have the exact same structure when you transition the control in or out of the conversation.
Otherwise, when a button is clicked, the menu will be [detected as outdated](./menu#outdated-menus-and-fingerprints), and the button handler will not be called.

The structure is based on the following two things.

- The shape of the menu (number of rows, or number of buttons in any row).
- The label on the button.

It is usually advisable to first edit the menu to a shape that makes sense inside the conversation as soon as you enter the conversation.
The conversation can then define a matching menu which will be active immediately.

Similarly, if the conversation leaves behind any menus (by not closing them), outside menus can take over control again.
Again, the structure of the menus has to match.

An example of this interoperability can be found in the [example bots repository](https://github.com/grammyjs/examples?tab=readme-ov-file#menus-with-conversation-menu-with-conversation).

## Conversational Forms

Oftentimes, conversations are used to build forms in the chat interface.

All wait calls return context objects.
However, when you wait for a text message, you may only want to get the message text and not interact with the rest of the context object.

Conversation forms give you a way to combine update validation with extracting data from the context object.
This resembles a field in a form.
Consider the following exmaple.

```ts
await ctx.reply("Please send a photo for me to scale down!");
const photo = await conversation.form.photo();
await ctx.reply("What should be the new width of the photo?");
const width = await conversation.form.int();
await ctx.reply("What should be the new height of the photo?");
const height = await conversation.form.int();
await ctx.reply(`Scaling your photo to ${width}x${height} ...`);
const scaled = await scaleImage(photo, width, height);
await ctx.replyWithPhoto(scaled);
```

There are many more form fields available.
Check out [`ConversationForm`](/ref/conversations/conversationform#methods) in the API reference.

All form fields take an `otherwise` function that will run when a non-matching update is received.
In addition, they all take an `action` function that will run when the form field has been filled correctly.

```ts
// Wait for a basic calculation operation.
const op = await conversation.form.select(["+", "-", "*", "/"], {
  action: (ctx) => ctx.deleteMessage(),
  otherwise: (ctx) => ctx.reply("Expected +, -, *, or /!"),
});
```

Conversational forms even allow you to build custom form fields via [`conversation.form.build`](/ref/conversations/conversationform#build).

## Wait Timeouts

Every time you wait for an update, you can pass a timeout value.

```ts
// Only wait for one hour before exiting the conversation.
const oneHourInMilliseconds = 60 * 60 * 1000;
await conversation.wait({ maxMilliseconds: oneHourInMilliseconds });
```

When the wait call is reached, [`conversation.now()`](#the-golden-rule-of-conversations) is called.

As soon as the next update arrives, `conversation.now()` is called again.
If the update took more than `maxMilliseconds` to arrive, the conversation is halted, and the update is returned to the middleware system.
Any downstream middleware will be called.

This will make it look like the conversation was not active anymore at the time the arrived.

Note that this will not actually run any code after exactly the specified time.
Instead, the code is only run as soon as the next update arrives.

You can specify a default timeout value for all wait calls inside a conversation.

```ts
// Always wait for one hour only.
const oneHourInMilliseconds = 60 * 60 * 1000;
bot.use(createConversation(convo, {
  maxMillisecondsToWait: oneHourInMilliseconds,
}));
```

Passing a value to a wait call directly will override this default.

## Enter and Exit Events

You can specify a callback function that is invoked whenever a conversation is entered.
Similarly, you can specify a callback function that is invoked whenever a conversation is exited.

```ts
bot.use(conversations({
  onEnter(id, ctx) {
    // Entered conversation `id`.
  },
  onExit(id, ctx) {
    // Exited conversation `id`.
  },
}));
```

Each callback receives two values.
The first value is the identifier of the conversation that was entered or exited.
The second value is the current context object of the surrounding middleware.

Note that the callbacks are only called when a conversation is entered or exited via `ctx.conversation`.
The `onExit` callback is also invoked when the conversation terminates itself via `conversation.halt` or when it [times out](#wait-timeouts).

## Concurrent Wait Calls

You can use floating promises to wait for several things concurrently.
When a new update arrives, only the first matching wait call will resolve.

```ts
await ctx.reply("Send a photo and a caption!");
const [textContext, photoContext] = await Promise.all([
  conversation.waitFor(":text"),
  conversation.waitFor(":photo"),
]);
await ctx.replyWithPhoto(photoContext.msg.photo.at(-1).file_id, {
  caption: textContext.msg.text,
});
```

In the above example, it does not matter if the user sends a photo or text first.
Both promises will resolve in the order the user picks to send the two messages the code is waiting for.
[`Promise.all`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) works normally, it only resolves when all passed promises resolve.

This can be used to wait for unrelated things, too.
For example, here is how you install a global exit listener inside the conversation.

```ts
conversation.waitForCommand("exit") // no await!
  .then(() => conversation.halt());
```

As soon as the conversation [finishes in any way](#exiting-conversations), all pending wait calls will be discarded.
For example, the following conversation will complete immediately after it was entered, without ever waiting for any updates.

::: code-group

```ts [TypeScript]
async function convo(conversation: Conversation, ctx: Context) {
  const _promise = conversation.wait() // no await!
    .then(() => ctx.reply("I will never be sent!"));

  // Conversation is done immediately after being entered.
}
```

```js [JavaScript]
async function convo(conversation, ctx) {
  // Do not await this:
  const _promise = conversation.wait()
    .then(() => ctx.reply("I will never be sent!"));

  // Conversation is done immediately after being entered.
}
```

:::

Internally, when several wait calls are reached at the same time, the conversations plugin will keep track of a list of wait calls.
As soon as the next update arrives, it will then replay the conversation builder function once for each encountered wait call until one of them accepts the update.
Only if none of the pending wait calls accepts the update, the update will be dropped.

## Checkpoints and Going Back in Time

The conversations plugin [tracks](#conversations-are-replay-engines) the execution of your conversations builder function.

This allows you to create a checkpoint along the way.
A checkpoint contains information about how far the function has run so far.
It can be used to later jump back to this point.

Naturally, any actions performed in the meantime will not be undone.
In particular, rewinding to a checkpoint will not magically unsend any messages.

```ts
const checkpoint = conversation.checkpoint();

// Later:
if (ctx.hasCommand("reset")) {
  await conversation.rewind(checkpoint); // never returns
}
```

Checkpoints can be very useful to "go back."
However, like JavaScript's `break` and `continue` with [labels](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label), jumping around can make the code less readable.
**Make sure not to overuse this feature.**

Internally, rewinding a conversation aborts execution like a wait call does, and then replays the function only until the point where the checkpoint was created.
Rewinding a conversation does not literally execute functions in reverse, even though it feels like that.

## Parallel Conversations

Conversations in unrelated chats are fully independent and can always run in parallel.

However, by default, each chat can only have a single active conversation at all times.
If you try to enter a conversation while a conversation is already active, the `enter` call will throw an error.

You can change this behavior by marking a conversation as parallel.

```ts
bot.use(createConversation(convo, { parallel: true }));
```

This changes two things.

Firstly, you can now enter this conversation even when the same or a different conversation is already active.
For example, if you have the conversations `captcha` and `settings`, you can have `captcha` active five times and `settings` active twelve times---all in the same chat.

Secondly, when a conversation does not accept an update, the update is no longer dropped by default.
Instead, control is handed back to the middleware system.

All installed conversations will get a chance to handle an incoming update until one of them accepts it.
However, only a single conversation will be able to actually handle the update.

When multiple different conversations are active at the same time, the middleware order will determine which conversation gets to handle the update first.
When a single conversation is active multiple times, the oldest conversation (the one that was entered first) gets to handle the update first.

This is best illustrated by an example.

::: code-group

```ts [TypeScript]
async function captcha(conversation: Conversation, ctx: Context) {
  const user = ctx.from!.id;
  await ctx.reply("Welcome to the chat! What is the best bot framework?");
  const answer = await conversation.waitFor(":text").andFrom(user);
  if (answer.msg.text === "grammY") {
    await ctx.reply("Correct! Your future is bright!");
  } else {
    await ctx.banAuthor();
  }
}

async function settings(conversation: Conversation, ctx: Context) {
  const user = ctx.from!.id;
  const main = conversation.checkpoint();
  const options = ["Chat Settings", "About", "Privacy"];
  await ctx.reply("Welcome to the settings!", {
    reply_markup: Keyboard.from(options
      .map((btn) => [Keyboard.text(btn)])),
  });
  const option = await conversation.waitFor(":text")
    .andFrom(user)
    .and((ctx) => options.includes(ctx.msg.text), {
      otherwise: (ctx) => ctx.reply("Please use the buttons!"),
    });
  await openSettingsMenu(option, main);
}

bot.use(createConversation(captcha));
bot.use(createConversation(settings));
```

```js [JavaScript]
async function captcha(conversation, ctx) {
  const user = ctx.from.id;
  await ctx.reply("Welcome to the chat! What is the best bot framework?");
  const answer = await conversation.waitFor(":text").andFrom(user);
  if (answer.msg.text === "grammY") {
    await ctx.reply("Correct! Your future is bright!");
  } else {
    await ctx.banAuthor();
  }
}

async function settings(conversation, ctx) {
  const user = ctx.from.id;
  const main = conversation.checkpoint();
  const options = ["Chat Settings", "About", "Privacy"];
  await ctx.reply("Welcome to the settings!", {
    reply_markup: Keyboard.from(options
      .map((btn) => [Keyboard.text(btn)])),
  });
  const option = await conversation.waitFor(":text")
    .andFrom(user)
    .and((ctx) => options.includes(ctx.msg.text), {
      otherwise: (ctx) => ctx.reply("Please use the buttons!"),
    });
  await openSettingsMenu(option, main);
}

bot.use(createConversation(captcha));
bot.use(createConversation(settings));
```

:::

The above code works in group chats.
It provides two conversations.
The conversation `captcha` is used to make sure that only good developers join the chat (shameless grammY plug lol).
The conversation `settings` is used to implement a settings menu in the group chat.

Note that all wait calls filter for a user identifier, among other things.

Let's assume that the following has already happened.

1. You called `ctx.conversation.enter("captcha")` to enter the conversation `captcha` while handling an update from a user with identifier `ctx.from.id === 42`.
2. You called `ctx.conversation.enter("settings")` to enter the conversation `settings` while handling an update from a user with identifier `ctx.from.id === 3`.
3. You called `ctx.conversation.enter("captcha")` to enter the conversation `captcha` while handling an update from a user with identifier `ctx.from.id === 43`.

This means that three conversations are active in this group chat now---`captcha` is active twice and `settings` is active once.

> Note that `ctx.conversation` provides [various ways](/ref/conversations/conversationcontrols#exit) to exit specific conversations even with parallel conversations enabled.

Next, the following things happen in order.

1. User `3` sends a message containing the text `"About"`.
2. An update with a text message arrives.
3. The first instance of the conversation `captcha` is replayed.
4. The `waitFor(":text")` text call accepts the update, but the added filter `andFrom(42)` rejects the update.
5. The second instance of the conversation `captcha` is replayed.
6. The `waitFor(":text")` text call accepts the update, but the added filter `andFrom(43)` rejects the update.
7. All instances of `captcha` rejected the update, so control is handed back to the middleware system.
8. The instance of the conversation `settings` is replayed.
9. The wait call resolves and `option` will contain a context object for the text message update.
10. The function `openSettingsMenu` is called.
    It can send an about text to the user and rewind the conversation back to `main`, restarting the menu.

Note that even though two conversations were waiting for the the users `42` and `43` to complete their captcha, the bot correctly replied to user `3` who had started the settings menu.
Filtered wait calls can determine which updates are relevant for the current conversation.
Disregarded updates fall through and can be picked up by other conversations.

The above example uses a group chat to illustrate how conversations can handle multiple users in parallel in the same chat.
In reality, parallel conversations work in all chats.
This lets you wait for different things in a chat with a single user.

You can combine parallel conversations with [wait timeouts](#wait-timeouts) to keep the number of active conversations low.

## Inspecting Active Conversations

Inside your middleware, you can inspect which conversation is active.

```ts
bot.command("stats", (ctx) => {
  const convo = ctx.conversation.active("convo");
  console.log(convo); // 0 or 1
  const isActive = convo > 0;
  console.log(isActive); // false or true
});
```

When you pass a conversation identifier to `ctx.conversation.active`, it will return `1` if this conversation is active, and `0` otherwise.

If you enable [parallel conversations](#parallel-conversations) for the conversation, it will return the number of times that this conversation is currently active.

Call `ctx.conversation.active()` without arguments to receive an object that contains the identifiers of all active conversations as keys.
The respective values describe how many instances of each conversation are active.

If the conversation `captcha` is active twice and the conversation `settings` is active once, `ctx.conversation.active()` will work as follows.

```ts
bot.command("stats", (ctx) => {
  const stats = ctx.conversation.active();
  console.log(stats); // { captcha: 2, settings: 1 }
});
```

## Migrating From 1.x to 2.x

Conversations 2.0 is a complete rewrite from scratch.

Even though the basic concepts of the API surface remained the same, the two implementations are fundamentally different in how they operate under the hood.
In a nutshell, migrating from 1.x to 2.x results in very little adjustments to your code, but it requires you to drop all stored data.
Thus, all conversations will be restarted.

### Data Migration From 1.x to 2.x

There is no way to keep the current state of conversations when upgrading from 1.x to 2.x.

You should just drop the respective data from your sessions.
Consider using [session migrations](./session#migrations) for this.

Persisting conversations data with version 2.x can be done as described [here](#persisting-conversations).

### Type Changes Between 1.x and 2.x

With 1.x, the context type inside a conversation was the same context type used in the surrounding middleware.

With 2.x, you must now always declare two context types---[an outside context type and an inside context type](#conversational-context-objects).
These types can never be the same, and if they are, you have a bug in your code.
This is because the outside context type must always have [`ConversationFlavor`](/ref/conversations/conversationflavor) installed, while the inside context type must never have it installed.

In addition, you can now install an [independent set of plugins](#using-plugins-inside-conversations) for each conversation.

### Session Access Changes Between 1.x and 2.x

You can no longer use `conversation.session`.
Instead, you must use `conversation.external` for this.

```ts
// Read session data.
const session = await conversation.session; // [!code --]
const session = await conversation.external((ctx) => ctx.session); // [!code ++]

// Write session data.
conversation.session = newSession; // [!code --]
await conversation.external((ctx) => { // [!code ++]
  ctx.session = newSession; // [!code ++]
}); // [!code ++]
```

> Accessing `ctx.session` was possible with 1.x, but it was always incorrect.
> `ctx.session` is no longer available with 2.x.

### Plugin Compatibility Changes Between 1.x and 2.x

Conversations 1.x were barely compatible with any plugins.
Some compatibility could be achieved by using `conversation.run`.

This option was removed for 2.x.
Instead, you can now pass plugins to the `plugins` array as described [here](#using-plugins-inside-conversations).
Sessions need [special treatment](#session-access-changes-between-1-x-and-2-x).
Menus have improved compatibility since the introduction of [conversational menus](#conversational-menus).

### Parallel Conversation Changes Between 1.x and 2.x

Parallel conversations work the same way with 1.x and 2.x.

However, this feature was a common source of confusion when used accidentally.
With 2.x, you need to opt-in to the feature by specifying `{ parallel: true }` as described [here](#parallel-conversations).

The only breaking change to this feature is that updates no longer get passed back to the middleware system by default.
Instead, this is only done when the conversation is marked as parallel.

Note that all wait methods and form fields provide an option `next` to override the default behavior.
This option was renamed from `drop` in 1.x, and the semantics of the flag were flipped accordingly.

### Изменения форм между 1.x и 2.x

Forms were really broken with 1.x.
For example, `conversation.form.text()` returned text messages even for `edited_message` updates of old messages.
Many of these oddities were corrected for 2.x.

Fixing bugs technically does not count as a breaking change, but it is still a substatial change in behavior.

## Краткая информация о плагине

- Название: `conversations`
- [Исходник](https://github.com/grammyjs/conversations)
- [Ссылка](/ref/conversations/)
