---
prev: false
next: false
---

# Диалоги (`conversations`)

Создавайте мощные диалоговые интерфейсы с легкостью.

## Введение

Большинство чатов состоит не только из одного сообщения. (ага)

Например, вы можете задать пользователю вопрос, а затем дождаться ответа.
Это может происходить даже несколько раз, так что получается целая беседа.

Когда вы думаете о [middleware](../guide/middleware), вы замечаете, что все основано на одном [объекте контекста](../guide/context) для каждого обработчика.
Это означает, что вы всегда обрабатываете только одно сообщение в отдельности.
Не так-то просто написать что-то вроде "проверьте текст три сообщения назад" или что-то в этом роде.

**Этот плагин приходит на помощь:**.
Он предоставляет чрезвычайно гибкий способ определения разговоров между вашим ботом и пользователями.

Многие фреймворки заставляют вас определять большие объекты конфигурации с шагами, этапами, переходами, wizard и так далее.
Это приводит к появлению большого количества шаблонного кода и затрудняет дальнейшую работу.
**Этот плагин не работает таким образом**.

Вместо этого с помощью этого плагина вы будете использовать нечто гораздо более мощное: **код**.
По сути, вы просто определяете обычную функцию JavaScript, которая позволяет вам определить, как будет развиваться разговор.
По мере того как бот и пользователь будут разговаривать друг с другом, функция будет выполняться по порядку.

(Честно говоря, на самом деле все работает не так.
Но очень полезно думать об этом именно так!
В реальности ваша функция будет выполняться немного иначе, но мы вернемся к этому [позже](#ожидание-обновлении)).

## Простой пример

Прежде чем мы перейдем к рассмотрению того, как можно создавать диалоги, посмотрите на короткий пример JavaScript того, как будет выглядеть беседа.

```js
async function greeting(conversation, ctx) {
  await ctx.reply("Привет, как тебя зовут?");
  const { message } = await conversation.wait();
  await ctx.reply(`Добро пожаловать в чат, ${message.text}!`);
}
```

В этом разговоре бот сначала поприветствует пользователя и спросит его имя.
Затем он будет ждать, пока пользователь не назовет свое имя.
И наконец, бот приветствует пользователя в чате, повторяя его имя.

Легко, правда?
Давайте посмотрим, как это делается!

## Функции конструктора диалогов

Прежде всего, давайте разберемся в некоторых моментах.

::: code-group

```ts [TypeScript]
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";
```

```js [JavaScript]
const {
  conversations,
  createConversation,
} = require("@grammyjs/conversations");
```

```ts [Deno]
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations/mod.ts";
```

:::

С этим покончено, теперь мы можем посмотреть, как определять разговорные интерфейсы.

Основным элементом разговора является функция с двумя аргументами.
Мы называем ее _функцией построения беседы_.

```js
async function greeting(conversation, ctx) {
  // TODO: Код для диалога
}
```

Давайте посмотрим, что представляют собой эти два параметра.

**Второй параметр** не так интересен, это обычный объект контекста.
Как обычно, он называется `ctx` и использует ваш [пользовательский тип контекста](../guide/context#кастомизация-объекта-контекста) (может называться `MyContext`).
Плагин conversations экспортирует [расширитель контекста](../guide/context#дополнительные-расширители-контекста) под названием `ConversationFlavor`.

**Первый параметр** является центральным элементом этого плагина.
Он обычно называется `conversation` и имеет тип `Conversation` ([документация API](/ref/conversations/conversation)).
Он может использоваться в качестве ручага для управления беседой, например, для ожидания ввода данных пользователем и т. д.
Тип `Conversation` ожидает ваш [пользовательский тип контекста](../guide/context#кастомизация-объекта-контекста) в качестве параметра типа, поэтому вы часто будете использовать `Conversation<MyContext>`.

В общем, в TypeScript ваша функция построения диалога будет выглядеть следующим образом.

```ts
type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

async function greeting(conversation: MyConversation, ctx: MyContext) {
  // TODO: Код для диалога
}
```

Внутри функции построения диалога вы можете определить, как она должна выглядеть.
Прежде чем мы подробно остановимся на каждой функции этого плагина, давайте рассмотрим более сложный пример, чем [простой](#простои-пример) выше.

::: code-group

```ts [TypeScript]
async function movie(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Сколько у вас любимых фильмов?");
  const count = await conversation.form.number();
  const movies: string[] = [];
  for (let i = 0; i < count; i++) {
    await ctx.reply(`Какой фильм будет под номером ${i + 1}!`);
    const titleCtx = await conversation.waitFor(":text");
    movies.push(titleCtx.msg.text);
  }
  await ctx.reply("Вот рейтинг!");
  movies.sort();
  await ctx.reply(movies.map((m, i) => `${i + 1}. ${m}`).join("\n"));
}
```

```js [JavaScript]
async function movie(conversation, ctx) {
  await ctx.reply("Сколько у вас любимых фильмов?");
  const count = await conversation.form.number();
  const movies = [];
  for (let i = 0; i < count; i++) {
    await ctx.reply(`Какой фильм будет под номером ${i + 1}!`);
    const titleCtx = await conversation.waitFor(":text");
    movies.push(titleCtx.msg.text);
  }
  await ctx.reply("Вот рейтинг!");
  movies.sort();
  await ctx.reply(movies.map((m, i) => `${i + 1}. ${m}`).join("\n"));
}
```

:::

Можете ли вы понять, как будет работать этот бот?

## Создание диалога и вступление в него

Прежде всего, вы **должны** использовать плагин [session plugin](./session), если хотите использовать плагин conversations.
Вам также необходимо установить сам плагин conversations, прежде чем вы сможете регистрировать отдельные разговоры в вашем боте.

```ts
// Установите плагин сессии.
bot.use(session({
  initial() {
    // пока возвращайте пустой объект
    return {};
  },
}));

// Установите плагин conversations
bot.use(conversations());
```

Далее вы можете установить функцию конструктора диалогов в качестве middleware на объект бота, обернув ее внутри `createConversation`.

```ts
bot.use(createConversation(greeting));
```

Теперь, когда ваша беседа зарегистрирована в боте, вы можете войти в нее из любого обработчика.
Обязательно используйте `await` для всех методов на `ctx.conversation` - иначе ваш код сломается.

```ts
bot.command("start", async (ctx) => {
  await ctx.conversation.enter("greeting");
});
```

Как только пользователь отправит боту команду `/start`, беседа будет начата.
Текущий объект контекста передается в качестве второго аргумента функции построения беседы.
Например, если вы начнете разговор с `await ctx.reply(ctx.message.text)`, он будет содержать обновление, содержащее `/start`.

::: tip Изменение идентификатора разговора
По умолчанию вы должны передать имя функции в `ctx.conversation.enter()`.
Однако если вы предпочитаете использовать другой идентификатор, вы можете указать его следующим образом:

```ts
bot.use(createConversation(greeting, "new-name"));
```

В свою очередь, вы можете вступить с ним в разговор:

```ts
bot.command("start", (ctx) => ctx.conversation.enter("new-name"));
```

:::

В целом ваш код теперь должен выглядеть примерно так:

::: code-group

```ts [TypeScript]
import { Bot, Context, session } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

const bot = new Bot<MyContext>("");

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

/** Определяет разговор */
async function greeting(conversation: MyConversation, ctx: MyContext) {
  // TODO: Код для диалога
}

bot.use(createConversation(greeting));

bot.command("start", async (ctx) => {
  // войдите в функцию greeting, которую вы создали
  await ctx.conversation.enter("greeting");
});

bot.start();
```

```js [JavaScript]
const { Bot, Context, session } = require("grammy");
const {
  conversations,
  createConversation,
} = require("@grammyjs/conversations");

const bot = new Bot("");

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

/** Определяет разговор */
async function greeting(conversation, ctx) {
  // TODO: Код для диалога
}

bot.use(createConversation(greeting));

bot.command("start", async (ctx) => {
  // войдите в функцию greeting, которую вы создали
  await ctx.conversation.enter("greeting");
});

bot.start();
```

```ts [Deno]
import { Bot, Context, session } from "https://deno.land/x/grammy/mod.ts";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations/mod.ts";

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

const bot = new Bot<MyContext>("");

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

/** Определяет разговор */
async function greeting(conversation: MyConversation, ctx: MyContext) {
  // TODO: Код для диалога
}

bot.use(createConversation(greeting));

bot.command("start", async (ctx) => {
  // войдите в функцию greeting, которую вы создали
  await ctx.conversation.enter("greeting");
});

bot.start();
```

:::

### Установка с пользовательскими данными сессии

Обратите внимание, что если вы используете TypeScript и хотите хранить свои собственные данные сессии, а также использовать разговоры, вам нужно будет предоставить компилятору больше информации о типе.
Допустим, у вас есть этот интерфейс, который описывает ваши пользовательские данные сессии:

```ts
interface SessionData {
  /** пользовательское свойство сессии */
  foo: string;
}
```

Ваш пользовательский тип контекста может выглядеть следующим образом:

```ts
type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor;
```

Самое главное, что при установке плагина сессий с внешним хранилищем вам придется явно предоставлять данные сессии.
Все адаптеры хранилищ позволяют передавать `SessionData` в качестве параметра типа.
Например, вот как это нужно сделать с [`freeStorage`](./session#бесплатное-хранилище), который предоставляет grammY.

```ts
// Установите плагин сессии.
bot.use(session({
  // Добавьте типы сессии в адаптер.
  storage: freeStorage<SessionData>(bot.token),
  initial: () => ({ foo: "" }),
}));
```

То же самое можно сделать и для всех остальных адаптеров хранения, например `new FileAdapter<SessionData>()` и так далее.

### Установка с несколькими сессиями

Естественно, вы можете объединять беседы с помощью [мультисессий](./session#мульти-сессии).

Этот плагин хранит данные разговора внутри `session.conversation`.
Это означает, что если вы хотите использовать несколько сессий, вам необходимо указать этот фрагмент.

```ts
// Установите плагин сессии.
bot.use(session({
  type: "multi",
  custom: {
    initial: () => ({ foo: "" }),
  },
  conversation: {}, // может быть пустым
}));
```

Таким образом, вы можете хранить данные разговора в другом месте, чем другие данные сессии.
Например, если оставить конфигурацию беседы пустой, как показано выше, плагин беседы будет хранить все данные в памяти.

## Выход из диалога

Разговор будет продолжаться до тех пор, пока ваша функция конструктора диалогов не завершится.
Это означает, что вы можете просто выйти из беседы, используя `return` или `throw`.

::: code-group

```ts [TypeScript]
async function hiAndBye(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Привет! И пока!");
  // Выйти из беседы:
  return;
}
```

```js [JavaScript]
async function hiAndBye(conversation, ctx) {
  await ctx.reply("Привет! И пока!");
  // Выйти из беседы:
  return;
}
```

:::

(Да, ставить `return` в конце функции немного бессмысленно, но вы поняли идею).

Выброс ошибки также приведет к завершению беседы.
Однако плагин [session](#создание-диалога-и-вступление-в-него) сохраняет данные только при успешном выполнении middleware.
Таким образом, если вы выбросите ошибку внутри беседы и не поймаете ее до того, как она достигнет плагина сессии, то не будет сохранено, что беседа была завершена.
В результате следующее сообщение вызовет ту же ошибку.

Вы можете смягчить это, установив [границу ошибки](../guide/errors#границы-ошибок) между сессией и разговором.
Таким образом, вы предотвратите распространение ошибки по дереву [middleware](../advanced/middleware) и, следовательно, позволите плагину сессии записать данные обратно.

> Обратите внимание, что если вы используете стандартные сессии in-memory, все изменения в данных сессии отражаются немедленно, поскольку нет бэкенда хранения.
> В этом случае вам не нужно использовать границы ошибок, чтобы выйти из разговора, выбросив ошибку.

Вот как границы ошибок и разговоры можно использовать вместе.

::: code-group

```ts [TypeScript]
bot.use(session({
  storage: freeStorage(bot.token), // настройка
  initial: () => ({}),
}));
bot.use(conversations());

async function hiAndBye(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Привет! И пока!");
  // Выйти из беседы:
  throw new Error("Поймай меня, если сможешь!");
}

bot.errorBoundary(
  (err) => console.error("Диалог выбросил ошибку!", err),
  createConversation(greeting),
);
```

```js [JavaScript]
bot.use(session({
  storage: freeStorage(bot.token), // настройка
  initial: () => ({}),
}));
bot.use(conversations());

async function hiAndBye(conversation, ctx) {
  await ctx.reply("Привет! И пока!");
  // Выйти из беседы:
  throw new Error("Поймай меня, если сможешь!");
}

bot.errorBoundary(
  (err) => console.error("Диалог выбросил ошибку!", err),
  createConversation(greeting),
);
```

:::

Что бы вы ни делали, не забудьте [установить обработчик ошибок](../guide/errors) для вашего бота.

Если вы хотите жестко отключить беседу от вашего обычного middleware, пока она ожидает ввода пользователя, вы также можете использовать `await ctx.conversation.exit()`.
Это просто удалит данные плагина беседы из сессии.
Часто лучше придерживаться простого возврата из функции, но есть несколько примеров, когда использование `await ctx.conversation.exit()` будет удобным.
Помните, что вы должны `дождаться` вызова.

::: code-group

```ts{6,22} [TypeScript]
async function movie(conversation: MyConversation, ctx: MyContext) {
  // TODO: Код для диалога
}

// Установите плагин conversations
bot.use(conversations());

// Всегда выходите из любого разговора по команде /cancel
bot.command("cancel", async (ctx) => {
  await ctx.conversation.exit();
  await ctx.reply("Leaving.");
});

// Всегда выходите из диалога `movie`. 
// при нажатии кнопки `отмена` на встроенной клавиатуре.
bot.callbackQuery("cancel", async (ctx) => {
  await ctx.conversation.exit("movie");
  await ctx.answerCallbackQuery("Выход из диалога");
});

bot.use(createConversation(movie));
bot.command("movie", (ctx) => ctx.conversation.enter("movie"));
```

```js{6,22} [JavaScript]
async function movie(conversation, ctx) {
  // TODO: Код для диалога
}

// Установите плагин conversations
bot.use(conversations());

// Всегда выходите из любого разговора по команде /cancel
bot.command("cancel", async (ctx) => {
  await ctx.conversation.exit();
  await ctx.reply("Leaving.");
});

// Всегда выходите из диалога `movie`. 
// при нажатии кнопки `отмена` на встроенной клавиатуре.
bot.callbackQuery("cancel", async (ctx) => {
  await ctx.conversation.exit("movie");
  await ctx.answerCallbackQuery("Выход из диалога");
});

bot.use(createConversation(movie));
bot.command("movie", (ctx) => ctx.conversation.enter("movie"));
```

:::

Обратите внимание, что порядок здесь имеет значение.
Вы должны сначала установить плагин conversations (строка 6), прежде чем сможете вызвать `await ctx.conversation.exit()`.
Кроме того, общие обработчики отмены должны быть установлены до того, как будут зарегистрированы реальные разговоры (строка 22).

## Ожидание обновлений

Чтобы дождаться следующего обновления в этом конкретном чате, можно использовать обработчик беседы `conversation`.

::: code-group

```ts [TypeScript]
async function waitForMe(conversation: MyConversation, ctx: MyContext) {
  // Дождитесь следующего обновления:
  const newContext = await conversation.wait();
}
```

```js [JavaScript]
async function waitForMe(conversation, ctx) {
  // Дождитесь следующего обновления:
  const newContext = await conversation.wait();
}
```

:::

Обновление может означать, что было отправлено текстовое сообщение, или нажата кнопка, или что-то было отредактировано, или практически любое другое действие было выполнено пользователем.
Ознакомьтесь с полным списком в документации Telegram [здесь](https://core.telegram.org/bots/api#update).

Метод `wait` всегда выдает новый объект [контекста](../guide/context), представляющий полученное обновление.
Это означает, что вы всегда имеете дело с таким количеством объектов контекста, сколько обновлений получено во время разговора.

::: code-group

```ts [TypeScript]
const TEAM_REVIEW_CHAT = -1001493653006;
async function askUser(conversation: MyConversation, ctx: MyContext) {
  // Попросите пользователя указать его домашний адрес.
  await ctx.reply("Не могли бы вы указать свой домашний адрес?");

  // Дождитесь, пока пользователь отправит свой адрес:
  const userHomeAddressContext = await conversation.wait();

  // Спросите пользователя о его национальности.
  await ctx.reply("Не могли бы вы также указать вашу национальность?");

  // Дождитесь, пока пользователь укажет свою национальность:
  const userNationalityContext = await conversation.wait();

  await ctx.reply(
    "Это был последний шаг. Теперь, когда я получил всю необходимую информацию, я передам ее нашей команде для рассмотрения. Спасибо!",
  );

  // Теперь мы копируем ответы в другой чат для просмотра.
  await userHomeAddressContext.copyMessage(TEAM_REVIEW_CHAT);
  await userNationalityContext.copyMessage(TEAM_REVIEW_CHAT);
}
```

```js [JavaScript]
const TEAM_REVIEW_CHAT = -1001493653006;
async function askUser(conversation, ctx) {
  // Попросите пользователя указать его домашний адрес.
  await ctx.reply("Не могли бы вы указать свой домашний адрес?");

  // Дождитесь, пока пользователь отправит свой адрес:
  const userHomeAddressContext = await conversation.wait();

  // Спросите пользователя о его национальности.
  await ctx.reply("Не могли бы вы также указать вашу национальность?");

  // Дождитесь, пока пользователь укажет свою национальность:
  const userNationalityContext = await conversation.wait();

  await ctx.reply(
    "Это был последний шаг. Теперь, когда я получил всю необходимую информацию, я передам ее нашей команде для рассмотрения. Спасибо!",
  );

  // Теперь мы копируем ответы в другой чат для просмотра.
  await userHomeAddressContext.copyMessage(TEAM_REVIEW_CHAT);
  await userNationalityContext.copyMessage(TEAM_REVIEW_CHAT);
}
```

:::

Обычно, вне плагина разговоров, каждое из этих обновлений обрабатывается [middleware](../guide/middleware) вашего бота.
Таким образом, ваш бот будет обрабатывать обновления через объект контекста, который передается вашим обработчикам.

В обработчиках вы получите этот новый объект контекста из вызова `wait`.
В свою очередь, вы можете обрабатывать различные обновления по-разному, основываясь на этом объекте.
Например, вы можете проверять наличие текстовых сообщений:

::: code-group

```ts [TypeScript]
async function waitForText(conversation: MyConversation, ctx: MyContext) {
  // Дождитесь следующего обновления:
  ctx = await conversation.wait();
  // Проверьте наличие текста:
  if (ctx.message?.text) {
    // ...
  }
}
```

```js [JavaScript]
async function waitForText(conversation, ctx) {
  // Дождитесь следующего обновления:
  ctx = await conversation.wait();
  // Проверьте наличие текста:
  if (ctx.message?.text) {
    // ...
  }
}
```

:::

Кроме того, наряду с `wait` существует ряд других методов, которые позволяют ждать только определенных обновлений.
Одним из примеров является `waitFor`, который принимает [фильтрующий запрос](../guide/filter-queries) и затем ожидает только те обновления, которые соответствуют заданному запросу.
Это особенно эффективно в сочетании с [деструктуризацией объектов](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment):

::: code-group

```ts [TypeScript]
async function waitForText(conversation: MyConversation, ctx: MyContext) {
  // Дождитесь следующего обновления текстового сообщения:
  const { msg: { text } } = await conversation.waitFor("message:text");
}
```

```js [JavaScript]
async function waitForText(conversation, ctx) {
  // Дождитесь следующего обновления текстового сообщения:
  const { msg: { text } } = await conversation.waitFor("message:text");
}
```

:::

Посмотрите [документацию API](/ref/conversations/conversationhandle#wait), чтобы увидеть все доступные методы, похожие на `wait`.

## Три золотых правила ведения диалога

Есть три правила, которые применяются к коду, написанному внутри функции построения беседы.
Вы должны следовать им, если хотите, чтобы ваш код работал правильно.

Прокрутите [вниз](#как-это-работает), если хотите узнать больше о том, _почему_ применяются эти правила, и что на самом деле делают вызовы `wait` внутри функции.

### Правило I: Все побочные эффекты должны быть завернуты

Код, зависящий от внешних систем, таких как базы данных, API, файлы или другие ресурсы, которые могут меняться от одного выполнения к другому, должен быть обернут в вызовы `conversation.external()`.

```ts
// ПЛОХО
const response = await externalApi();
// ХОРОШО
const response = await conversation.external(() => externalApi());
```

Сюда входит как чтение данных, так и выполнение побочных эффектов (например, запись в базу данных).

::: tip Сравнимо с React
Если вы знакомы с React, то вам может быть знакома сопоставимая концепция `useEffect`.
:::

### Правило II: все случайные значения должны быть завернуты

Код, который зависит от случайности или от глобального состояния, которое может измениться, должен обернуть все обращения к нему в вызовы `conversation.external()` или использовать удобную функцию `conversation.random()`.

```ts
// ПЛОХО
if (Math.random() < 0.5) { /* сделать что-то */ }
// ХОРОШО
if (conversation.random() < 0.5) { /* сделать что-то */ }
```

### Правило III: Используйте удобные функции

На `conversation` установлена куча вещей, которые могут сильно помочь вам.
Ваш код иногда даже не ломается, если вы не используете их, но даже тогда он может быть медленным или вести себя непонятным образом.

```ts
// `ctx.session` сохраняет изменения только для самого последнего объекта контекста
conversation.session.myProp = 42; // надежнее!

// Date.now() может быть неточным внутри обращений
await conversation.now(); // более точно!

// Ведение журнала отладки через разговор, не печатает запутанные логи
conversation.log("Привет, мир"); // более прозрачно!
```

Обратите внимание, что большинство из вышеперечисленных действий можно выполнить через `conversation.external()`, но это может быть утомительно, поэтому проще использовать удобные функции ([документация API](/ref/conversations/conversationhandle#methods)).

## Переменные, ветвление и циклы

Если вы следуете трем вышеперечисленным правилам, вы можете использовать любой код, который вам нравится.
Сейчас мы рассмотрим несколько концепций, которые вы уже знаете из программирования, и покажем, как они применяются в чистых и читабельных беседах.

Представьте, что весь приведенный ниже код написан внутри функции построения беседы.

Вы можете объявлять переменные и делать с ними все, что захотите:

```ts
await ctx.reply("Присылайте мне свои любимые номера, разделяя их запятыми!");
const { message } = await conversation.waitFor("message:text");
const sum = message.text
  .split(",")
  .map((n) => parseInt(n.trim(), 10))
  .reduce((x, y) => x + y);
await ctx.reply("Сумма этих чисел равна: " + sum);
```

Разветвление тоже работает:

```ts
await ctx.reply("Пришлите мне фотографию!");
const { message } = await conversation.wait();
if (!message?.photo) {
  await ctx.reply("Это не фотография! Я ухожу!");
  return;
}
```

Как и циклы:

```ts
do {
  await ctx.reply("Пришлите мне фотографию!");
  ctx = await conversation.wait();

  if (ctx.message?.text === "/cancel") {
    await ctx.reply("Отмена, ухожу!");
    return;
  }
} while (!ctx.message?.photo);
```

## Функции и рекурсии

Вы также можете разделить свой код на несколько функций и использовать их повторно.
Например, так можно определить многоразовую капчу.

::: code-group

```ts [TypeScript]
async function captcha(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Докажите, что вы человек! Что является ответом на все вопросы?");
  const { message } = await conversation.wait();
  return message?.text === "42";
}
```

```js [JavaScript]
async function captcha(conversation, ctx) {
  await ctx.reply("Докажите, что вы человек! Что является ответом на все вопросы?");
  const { message } = await conversation.wait();
  return message?.text === "42";
}
```

:::

Она возвращает `true`, если пользователь может пройти, и `false` в противном случае.
Теперь вы можете использовать его в своей основной функции построения разговора следующим образом:

::: code-group

```ts [TypeScript]
async function enterGroup(conversation: MyConversation, ctx: MyContext) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("Добро пожаловать!");
  else await ctx.banChatMember();
}
```

```js [JavaScript]
async function enterGroup(conversation, ctx) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("Добро пожаловать!");
  else await ctx.banChatMember();
}
```

:::

Посмотрите, как функция captcha может быть повторно использована в разных местах вашего кода.

> Этот простой пример предназначен только для того, чтобы проиллюстрировать работу функций.
> В реальности он может работать плохо, потому что он только ожидает нового обновления из соответствующего чата, но не проверяет, что оно действительно исходит от того же пользователя, который присоединился.
> Если вы хотите создать настоящую капчу, вы можете использовать [параллельные диалоги](#параллельные-диалоги).

При желании вы можете разделить код на еще большее количество функций или использовать рекурсию, взаимную рекурсию, генераторы и так далее.
(Только убедитесь, что все функции следуют [трем правилам](#три-золотых-правила-ведения-диалога)).

Естественно, вы можете использовать обработку ошибок и в своих функциях.
Обычные операторы `try`/`catch` прекрасно работают, в том числе и в функциях.
В конце концов, беседы - это всего лишь JavaScript.

Если главная функция беседы выкинет ошибку, она распространится дальше в [механизмы обработки ошибок](../guide/errors) вашего бота.

## Модули и классы

Естественно, вы можете просто перемещать свои функции между модулями.
Таким образом, вы можете определить некоторые функции в одном файле, `экспортировать` их, а затем `импортировать` и использовать их в другом файле.

При желании вы также можете определять классы.

::: code-group

```ts [TypeScript]
class Auth {
  public token?: string;

  constructor(private conversation: MyConversation) {}

  authenticate(ctx: MyContext) {
    const link = getAuthLink(); // получите ссылку авторизации из вашей системы
    await ctx.reply(
      "Откройте эту ссылку, чтобы получить токен, и отправьте его мне обратно: " + link,
    );
    ctx = await this.conversation.wait();
    this.token = ctx.message?.text;
  }

  isAuthenticated(): this is Auth & { token: string } {
    return this.token !== undefined;
  }
}

async function askForToken(conversation: MyConversation, ctx: MyContext) {
  const auth = new Auth(conversation);
  await auth.authenticate(ctx);
  if (auth.isAuthenticated()) {
    const token = auth.token;
    // делать что-то с токеном
  }
}
```

```js [JavaScript]
class Auth {
  constructor(conversation) {
    this.#conversation = conversation;
  }

  authenticate(ctx) {
    const link = getAuthLink(); // получите ссылку авторизации из вашей системы
    await ctx.reply(
      "Откройте эту ссылку, чтобы получить токен, и отправьте его мне обратно: " + link,
    );
    ctx = await this.#conversation.wait();
    this.token = ctx.message?.text;
  }

  isAuthenticated() {
    return this.token !== undefined;
  }
}

async function askForToken(conversation, ctx) {
  const auth = new Auth(conversation);
  await auth.authenticate(ctx);
  if (auth.isAuthenticated()) {
    const token = auth.token;
    // делать что-то с токеном
  }
}
```

:::

Дело не столько в том, что мы строго рекомендуем вам так поступать.
Это скорее пример того, как можно использовать бесконечную гибкость JavaScript для структурирования кода.

## Формы

Как уже упоминалось [ранее](#ожидание-обновлении), существует несколько различных вспомогательных функций на обработчике беседы, таких как `await conversation.waitFor('message:text')`, которая возвращает только обновления текстовых сообщений.

Если этих методов недостаточно, плагин conversations предоставляет еще больше вспомогательных функций для создания форм через `conversation.form`.

::: code-group

```ts [TypeScript]
async function waitForMe(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Сколько вам лет?");
  const age: number = await conversation.form.number();
}
```

```js [JavaScript]
async function waitForMe(conversation, ctx) {
  await ctx.reply("Сколько вам лет?");
  const age = await conversation.form.number();
}
```

:::

Как всегда, ознакомьтесь с [документацией API](/ref/conversations/conversationform), чтобы узнать, какие методы доступны.

## Работа с плагинами

Как уже упоминалось [ранее](#введение), обработчики grammY всегда обрабатывают только одно обновление.
Однако с помощью бесед вы можете обрабатывать множество обновлений последовательно, как если бы все они были доступны в одно и то же время.
Плагин делает это возможным, сохраняя старые контекстные объекты и предоставляя их позже.
Именно поэтому контекстные объекты внутри бесед не всегда подвержены влиянию некоторых плагинов grammY так, как можно было бы ожидать.

:: warning Интерактивные меню внутри разговоров
С плагином [menu plugin](./menu) эти концепции очень сильно конфликтуют.
Хотя меню _могут_ работать внутри бесед, мы не рекомендуем использовать эти два плагина вместе.
Вместо этого используйте обычный плагин [встроенной клавиатуры](./keyboard#встроенные-клавиатуры) (пока мы не добавим встроенную поддержку меню в беседах).
Вы можете ожидать определенных запросов обратного вызова с помощью `await conversation.waitForCallbackQuery("my-query")` или любого запроса с помощью `await conversation.waitFor("callback_query")`.

```ts
const keyboard = new InlineKeyboard()
  .text("A", "a").text("B", "b");
await ctx.reply("A или B?", { reply_markup: keyboard });
const response = await conversation.waitForCallbackQuery(["a", "b"], {
  otherwise: (ctx) => ctx.reply("Используйте кнопки!", { reply_markup: keyboard }),
});
if (response.match === "a") {
  // Пользователь выбрал "A".
} else {
  // Пользователь выбрал "B".
}
```

:::

Другие плагины работают нормально.
Некоторые из них просто нужно установить не так, как вы обычно это делаете.
Это относится к следующим плагинам:

- [hydrate](./hydrate)
- [i18n](./i18n) и [fluent](./fluent)
- [emoji](./emoji)

Их объединяет то, что все они хранят функции на объекте контекста, которые плагин conversations не может обрабатывать корректно.
Поэтому, если вы хотите объединить беседы с одним из этих плагинов grammY, вам придется использовать специальный синтаксис для установки другого плагина внутри каждой беседы.

Вы можете установить другие плагины внутри бесед с помощью `conversation.run`:

::: code-group

```ts [TypeScript]
async function convo(conversation: MyConversation, ctx: MyContext) {
  // Установите плагины grammY здесь
  await conversation.run(plugin());
  // Продолжайте диалог ...
}
```

```js [JavaScript]
async function convo(conversation, ctx) {
  // Установите плагины grammY здесь
  await conversation.run(plugin());
  // Продолжайте диалог ...
}
```

:::

Это сделает плагин доступным внутри беседы.

### Пользовательские объекты контекста

Если вы используете [пользовательский контекстный объект](../guide/context#кастомизация-объекта-контекста) и хотите установить пользовательские свойства на свои контекстные объекты перед вводом беседы, то некоторые из этих свойств тоже могут быть потеряны.
В некотором смысле middleware, который вы используете для настройки контекстного объекта, тоже можно рассматривать как плагин.

Самое чистое решение - полностью **отказаться от использования пользовательских свойств контекста** или, по крайней мере, устанавливать только сериализуемые свойства на объект контекста.
Другими словами, если все пользовательские свойства контекста могут быть сохранены в базе данных и впоследствии восстановлены, вам не нужно ни о чем беспокоиться.

Как правило, существуют другие решения проблем, которые обычно решаются с помощью пользовательских свойств контекста.
Например, часто можно просто получить их в самом разговоре, а не в обработчике.

Если ничего из перечисленного вам не подходит, вы можете попробовать самостоятельно разобраться с `conversation.run`.
Следует знать, что вы должны вызывать `next` внутри переданного middleware --- в противном случае обработка обновлений будет перехвачена.

Middleware будет выполняться для всех прошлых обновлений каждый раз, когда приходит новое обновление.
Например, если приходят три контекстных объекта, то происходит следующее:

1. получено первое обновление
2. middleware работает для первого обновления
3. получено второе обновление
4. middleware запускается для первого обновления
5. middleware запускается для второго обновления
6. получено третье обновление
7. middleware запускается для первого обновления
8. middleware запускается для второго обновления
9. middleware запускается для третьего обновления

Обратите внимание, что middleware запускается с первым обновлением трижды.

## Параллельные диалоги

Естественно, плагин conversations может запускать любое количество бесед параллельно в разных чатах.

Однако если ваш бот добавлен в групповой чат, он может захотеть вести параллельные беседы с несколькими разными пользователями _в одном и том же чате_.
Например, если ваш бот содержит капчу, которую он хочет отправлять всем новым пользователям.
Если два пользователя присоединяются одновременно, бот должен иметь возможность вести с ними две независимые беседы.

Именно поэтому плагин conversations позволяет вводить несколько бесед одновременно для каждого чата.
Например, можно вести пять разных бесед с пятью новыми пользователями и в то же время общаться с администратором по поводу новой конфигурации чата.

### Как это работает под капотом

Каждое входящее обновление будет обработано только одной из активных бесед в чате.
По аналогии с обработчиками middleware, беседы будут вызываться в том порядке, в котором они зарегистрированы.
Если беседа запускается несколько раз, то эти экземпляры беседы будут вызываться в хронологическом порядке.

Каждая беседа может либо обработать обновление, либо вызвать `await conversation.skip()`.
В первом случае обновление будет просто пропущено, пока разговор обрабатывает его.
Во втором случае разговор фактически отменит получение обновления и передаст его следующему разговору.
Если все разговоры пропустят обновление, поток управления будет передан обратно в систему middleware и запустит все последующие обработчики.

Это позволяет начать новый разговор из обычного middleware.

### Как вы можете это использовать

На практике вам вообще не нужно вызывать `await conversation.skip()`.
Вместо этого вы можете просто использовать такие вещи, как `await conversation.waitFrom(userId)`, которые позаботятся о деталях за вас.
Это позволяет общаться в групповом чате только с одним пользователем.

Например, давайте снова реализуем пример с капчей, но на этот раз с параллельными беседами.

::: code-group

```ts{4} [TypeScript]
async function captcha(conversation: MyConversation, ctx: MyContext) {
  if (ctx.from === undefined) return false;
  await ctx.reply("Докажите, что вы человек! Что является ответом на все вопросы?");
  const { message } = await conversation.waitFrom(ctx.from);
  return message?.text === "42";
}

async function enterGroup(conversation: MyConversation, ctx: MyContext) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("Добро пожаловать!");
  else await ctx.banChatMember();
}
```

```js{4} [JavaScript]
async function captcha(conversation, ctx) {
  if (ctx.from === undefined) return false;
  await ctx.reply("Докажите, что вы человек! Что является ответом на все вопросы?");
  const { message } = await conversation.waitFrom(ctx.from);
  return message?.text === "42";
}

async function enterGroup(conversation, ctx) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("Добро пожаловать!");
  else await ctx.banChatMember();
}
```

:::

Обратите внимание, что мы ждем сообщений только от конкретного пользователя.

Теперь мы можем создать простой обработчик, который вступает в разговор, когда к нему присоединяется новый участник

```ts
bot.on("chat_member")
  .filter((ctx) => ctx.chatMember.old_chat_member.status === "left")
  .filter((ctx) => ctx.chatMember.new_chat_member.status === "member")
  .use((ctx) => ctx.conversation.enter("enterGroup"));
```

### Проверка активных диалогов

Вы можете увидеть, сколько разговоров с каким идентификатором запущено.

```ts
const stats = await ctx.conversation.active();
console.log(stats); // { "enterGroup": 1 }
```

Он будет предоставлен в виде объекта, ключами которого являются идентификаторы разговоров, а число указывает на количество запущенных разговоров для каждого идентификатора.

## Как это работает

> [Помните](#три-золотых-правила-ведения-диалога), что код внутри ваших функций построения разговоров должен следовать трем правилам.
> Сейчас мы рассмотрим, _почему_ их нужно строить именно так.

Сначала мы посмотрим, как этот плагин работает концептуально, а затем остановимся на некоторых деталях.

### Как вызов `wait` работает

Давайте немного поменяем точку зрения и зададим вопрос с точки зрения разработчика плагина.
Как реализовать вызов `wait` в плагине?

Наивным подходом к реализации вызова `wait` в плагине conversations было бы создание нового promise и ожидание прибытия следующего контекстного объекта.
Как только он появится, мы решим promise, и разговор может быть продолжен.

Однако это плохая идея по нескольким причинам.

**Потеря данных.**
Что, если ваш сервер упадет во время ожидания контекстного объекта?
В этом случае мы потеряем всю информацию о состоянии беседы.
По сути, бот теряет ход своих мыслей, и пользователю приходится начинать все сначала.
Это плохой и раздражающий дизайн.

**Блокировка.**
Если вызовы wait блокируются до прихода следующего обновления, это означает, что выполнение middleware для первого обновления не может завершиться до тех пор, пока не завершится весь разговор.

- Для встроенного polling это означает, что никакие последующие обновления не могут быть обработаны, пока не завершится текущее.
  Таким образом, бот будет просто заблокирован навсегда.
- Для [grammY runner](./runner) бот не будет заблокирован.
  Однако при параллельной обработке тысяч разговоров с разными пользователями он будет занимать потенциально очень большой объем памяти.
  Если многие пользователи перестанут отвечать, бот застрянет посреди бесчисленных разговоров.
- Вебхуки имеют целую [категорию проблем](../guide/deployment-types#своевременное-завершение-запросов-вебхуков) с долго работающим middleware.

**Состояние.**
В бессерверной инфраструктуре, такой как облачные функции, мы не можем предположить, что один и тот же экземпляр обрабатывает два последующих обновления от одного и того же пользователя.
Следовательно, если мы создадим разговоры с состоянием, они могут постоянно случайно ломаться, поскольку некоторые вызовы `wait` не разрешаются, но внезапно выполняется другой middleware.
В результате мы получим обилие случайных ошибок и хаос.

Есть и другие проблемы, но вы поняли, о чем идет речь.

Следовательно, плагин conversations делает все по-другому.
Очень по-другому.
Как уже говорилось ранее, вызовы **`wait` не заставляют бота ждать**, хотя мы можем запрограммировать разговоры так, как будто это так и есть.

Плагин conversations отслеживает выполнение вашей функции.
Когда достигается вызов ожидания, он преобразовывает состояние выполнения в сессию и надежно сохраняет его в базе данных.
Когда приходит следующее обновление, он сначала проверяет данные сессии.
Если он обнаружит, что прервался на середине разговора, он преобразовывает состояние выполнения, берет вашу функцию построения разговора и воспроизводит его до момента последнего вызова `wait`.
Затем он возобновляет обычное выполнение вашей функции - до тех пор, пока не будет достигнут следующий вызов `wait`, и выполнение снова должно быть остановлено.

Что мы понимаем под состоянием выполнения?
В двух словах, оно состоит из трех вещей:

1. Входящие обновления
2. Исходящие вызовы API
3. Внешние события и эффекты, такие как случайность или обращения к внешним API или базам данных

Что мы имеем в виду под воспроизведением?
Воспроизведение означает регулярный вызов функции с самого начала, но когда она делает такие вещи, как вызов `wait` или выполнение вызовов API, мы на самом деле не делаем ничего из этого.
Вместо этого мы проверяем логи, где записано, какие значения были возвращены при предыдущем запуске.
Затем мы вставляем эти значения, чтобы функция построения разговора просто выполнялась очень быстро - до тех пор, пока наши логи не иссякнут.
В этот момент мы переключаемся обратно в обычный режим выполнения и начинаем снова выполнять вызовы API.

Вот почему плагин должен отслеживать все входящие обновления, а также все вызовы Bot API.
(См. пункты 1 и 2 выше.)
Однако плагин не может контролировать внешние события, побочные эффекты или случайности.
Например, вы можете сделать следующее:

```ts
if (Math.random() < 0.5) {
  // делать одно
} else {
  // делать другое
}
```

В этом случае при вызове функции она может внезапно вести себя каждый раз по-разному, так что повторное выполнение функции будет нарушено!
Она может случайно сработать не так, как при первоначальном выполнении.
Вот почему существует пункт 3 и необходимо следовать [Трем золотым правилам](#три-золотых-правила-ведения-диалога).

### Как перехватить выполнение функции

Концептуально говоря, ключевые слова `async` и `await` дают нам контроль над тем, где поток будет [вытеснен](https://en.wikipedia.org/wiki/Preemption_(computing)).
Следовательно, если кто-то вызывает `await conversation.wait()`, которая является функцией нашей библиотеки, мы получаем возможность упредить ее выполнение.

Говоря конкретнее, секретный основной примитив, позволяющий нам прерывать выполнение функции, - это `Promise`, который никогда не решается.

```ts
await new Promise<never>(() => {}); // БУМ
```

Если в любом JavaScript-файле выполнить `await` такого promise, то выполнение мгновенно завершится.
(Не стесняйтесь вставить приведенный выше код в файл и опробовать его).

Поскольку мы, очевидно, не хотим завершать выполнения JS, мы должны поймать это снова.
Как бы вы поступили в этом случае?
(Не стесняйтесь заглянуть в исходный код плагина, если это не сразу понятно).

## Краткая информация о плагине

- Название: `conversations`
- [Исходник](https://github.com/grammyjs/conversations)
- [Документация](/ref/conversations/)
