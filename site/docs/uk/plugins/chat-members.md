---
prev: false
next: false
---

# Учасники чату (`chat-members`)

Telegram не надає методу в Bot API для отримання учасників чату, тому ви маєте відстежувати їх самостійно.
Цей плагін полегшує роботу з обʼєктами `ChatMember`, пропонуючи зручний спосіб відстеження змін у вигляді власних фільтрів і зберігаючи та оновлюючи обʼєкти.

## Вступ

Робота з обʼєктами `ChatMember` з Telegram Bot API іноді може бути громіздкою.
Існує кілька різних статусів, які часто взаємозамінні в більшості застосунків.
Крім того, статус "обмежений" є неоднозначним, оскільки він може представляти як членів групи, так і обмежених користувачів, які не входять до групи.

Цей плагін спрощує роботу з учасниками чату, пропонуючи чітко визначені фільтри для оновлень учасників чату.

## Використання

### Фільтри учасників чату

За допомогою бота Telegram ви можете прослуховувати два види повідомлень щодо учасників чату: `chat_member` та `my_chat_member`.
Обидва вони вказують на минулий і новий статус користувача.

- Оновлення `my_chat_member` завжди надходять до вашого бота, щоб повідомити про зміну статусу бота в будь-якому чаті, а також коли користувачі блокують бота.
- Оновлення `chat_member` надходять лише в тому випадку, якщо ви явно включили їх в список дозволених оновлень, вони повідомляють про будь-які зміни статусів користувачів в чатах, в яких бот є **адміністартором**.

Замість того, щоб вручну фільтрувати минулі та нові статуси, фільтри учасників чату роблять це автоматично, дозволяючи вам реагувати на будь-який тип переходу, який вас цікавить.
В обробнику типи `old_chat_member` і `new_chat_member` звужуються відповідно.

::: code-group

```ts [TypeScript]
import { API_CONSTANTS, Bot } from "grammy";
import { chatMemberFilter, myChatMemberFilter } from "@grammyjs/chat-members";

const bot = new Bot(""); // <-- Помістіть токен свого бота між "" (https://t.me/BotFather)
const groups = bot.chatType(["group", "supergroup"]);

// Щоб реагувати на приєднання користувача до групи БЕЗ цього плагіна,
// вам доведеться вручну фільтрувати за статусом, що призводить до помилкового та нечитабельного коду.
groups.on("chat_member").filter(
  (ctx) => {
    const { old_chat_member: oldMember, new_chat_member: newMember } =
      ctx.chatMember;
    return (
      (["kicked", "left"].includes(oldMember.status) ||
        (oldMember.status === "restricted" && !oldMember.is_member)) &&
      (["administrator", "creator", "member"].includes(newMember.status) ||
        (newMember.status === "restricted" && newMember.is_member))
    );
  },
  (ctx) => {
    const user = ctx.chatMember.new_chat_member.user;
    await ctx.reply(`Вітаємо ${user.first_name} у групі!`);
  },
);

// ІЗ цим плагіном код значно спрощується і має менший ризик помилок.
// Код нижче відстежує ті ж самі події, але він набагато простіший.
groups.filter(chatMemberFilter("out", "in"), async (ctx) => {
  const user = ctx.chatMember.new_chat_member.user;
  await ctx.reply(`Вітаємо ${user.first_name} у групі!`);
});

// Відстежуйте оновлення, коли бот додається до групи як звичайний користувач.
groups.filter(myChatMemberFilter("out", "regular"), async (ctx) => {
  await ctx.reply("Привіт, дякую, що додали мене до групи!");
});

// Відстежуйте оновлення, коли бота додано до групи як адміністратора.
groups.filter(myChatMemberFilter("out", "admin"), async (ctx) => {
  await ctx.reply("Привіт, дякую, що додали мене до групи як адміністратора!");
});

// Відстежуйте оновлення, коли бота призначено адміністратором.
groups.filter(myChatMemberFilter("regular", "admin"), async (ctx) => {
  await ctx.reply("Мене було призначено адміністратором!");
});

// Відстежуйте оновлення, коли бота знижено до рівня звичайного користувача.
groups.filter(myChatMemberFilter("admin", "regular"), async (ctx) => {
  await ctx.reply("Я більше не адміністартор");
});

bot.start({
  // Переконайтеся, що ви включили тип оновлення `chat_member`, щоб наведені вище обробники працювали.
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

```js [JavaScript]
import { API_CONSTANTS, Bot } from "grammy";
import { chatMemberFilter, myChatMemberFilter } from "@grammyjs/chat-members";

const bot = new Bot(""); // <-- Помістіть токен свого бота між "" (https://t.me/BotFather)
const groups = bot.chatType(["group", "supergroup"]);

// Щоб реагувати на приєднання користувача до групи БЕЗ цього плагіна,
// вам доведеться вручну фільтрувати за статусом, що призводить до помилкового та нечитабельного коду.
groups.on("chat_member").filter(
  (ctx) => {
    const { old_chat_member: oldMember, new_chat_member: newMember } =
      ctx.chatMember;
    return (
      (["kicked", "left"].includes(oldMember.status) ||
        (oldMember.status === "restricted" && !oldMember.is_member)) &&
      (["administrator", "creator", "member"].includes(newMember.status) ||
        (newMember.status === "restricted" && newMember.is_member))
    );
  },
  (ctx) => {
    const user = ctx.chatMember.new_chat_member.user;
    await ctx.reply(`Вітаємо ${user.first_name} у групі!`);
  },
);

// ІЗ цим плагіном код значно спрощується і має менший ризик помилок.
// Код нижче відстежує ті ж самі події, але він набагато простіший.
groups.filter(chatMemberFilter("out", "in"), async (ctx) => {
  const user = ctx.chatMember.new_chat_member.user;
  await ctx.reply(`Вітаємо ${user.first_name} у групі!`);
});

// Відстежуйте оновлення, коли бот додається до групи як звичайний користувач.
groups.filter(myChatMemberFilter("out", "regular"), async (ctx) => {
  await ctx.reply("Привіт, дякую, що додали мене до групи!");
});

// Відстежуйте оновлення, коли бота додано до групи як адміністратора.
groups.filter(myChatMemberFilter("out", "admin"), async (ctx) => {
  await ctx.reply("Привіт, дякую, що додали мене до групи як адміністратора!");
});

// Відстежуйте оновлення, коли бота призначено адміністратором.
groups.filter(myChatMemberFilter("regular", "admin"), async (ctx) => {
  await ctx.reply("Мене було призначено адміністратором!");
});

// Відстежуйте оновлення, коли бота знижено до рівня звичайного користувача.
groups.filter(myChatMemberFilter("admin", "regular"), async (ctx) => {
  await ctx.reply("Я більше не адміністартор");
});

bot.start({
  // Переконайтеся, що ви включили тип оновлення `chat_member`, щоб наведені вище обробники працювали.
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

```ts [Deno]
import { API_CONSTANTS, Bot } from "https://deno.land/x/grammy/mod.ts";
import {
  chatMemberFilter,
  myChatMemberFilter,
} from "https://deno.land/x/grammy_chat_members/mod.ts";

const bot = new Bot(""); // <-- Помістіть токен свого бота між "" (https://t.me/BotFather)
const groups = bot.chatType(["group", "supergroup"]);

// Щоб реагувати на приєднання користувача до групи БЕЗ цього плагіна,
// вам доведеться вручну фільтрувати за статусом, що призводить до помилкового та нечитабельного коду.
groups.on("chat_member").filter(
  (ctx) => {
    const { old_chat_member: oldMember, new_chat_member: newMember } =
      ctx.chatMember;
    return (
      (["kicked", "left"].includes(oldMember.status) ||
        (oldMember.status === "restricted" && !oldMember.is_member)) &&
      (["administrator", "creator", "member"].includes(newMember.status) ||
        (newMember.status === "restricted" && newMember.is_member))
    );
  },
  (ctx) => {
    const user = ctx.chatMember.new_chat_member.user;
    await ctx.reply(`Вітаємо ${user.first_name} у групі!`);
  },
);

// ІЗ цим плагіном код значно спрощується і має менший ризик помилок.
// Код нижче відстежує ті ж самі події, але він набагато простіший.
groups.filter(chatMemberFilter("out", "in"), async (ctx) => {
  const user = ctx.chatMember.new_chat_member.user;
  await ctx.reply(`Вітаємо ${user.first_name} у групі!`);
});

// Відстежуйте оновлення, коли бот додається до групи як звичайний користувач.
groups.filter(myChatMemberFilter("out", "regular"), async (ctx) => {
  await ctx.reply("Привіт, дякую, що додали мене до групи!");
});

// Відстежуйте оновлення, коли бота додано до групи як адміністратора.
groups.filter(myChatMemberFilter("out", "admin"), async (ctx) => {
  await ctx.reply("Привіт, дякую, що додали мене до групи як адміністратора!");
});

// Відстежуйте оновлення, коли бота призначено адміністратором.
groups.filter(myChatMemberFilter("regular", "admin"), async (ctx) => {
  await ctx.reply("Мене було призначено адміністратором!");
});

// Відстежуйте оновлення, коли бота знижено до рівня звичайного користувача.
groups.filter(myChatMemberFilter("admin", "regular"), async (ctx) => {
  await ctx.reply("Я більше не адміністартор");
});

bot.start({
  // Переконайтеся, що ви включили тип оновлення `chat_member`, щоб наведені вище обробники працювали.
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

:::

Фільтри включають звичайні статуси (`owner`, `administrator`, `member`, `restricted`, `left`, `kicked`), а також деякі додаткові для зручності:

- `restricted_in`: обмежений учасник чату
- `restricted_out`: не є учасником чату, має обмеження
- `in`: учасник чату (`administrator`, `creator`, `member`, `restricted_in`)
- `out`: не є учасником чату (`left`, `kicked`, `restricted_out`)
- `free`: не обмежений учасник чату (`administrator`, `creator`, `member`)
- `admin`: адміністратор чату (`administrator`, `creator`)
- `regular`: користувач чату, який не є адміністратором (`member`, `restricted_in`)

Підсумовуючи, ось діаграма, яка показує, що відповідає кожному запиту:

![Діаграма, що показує статуси, які відповідають кожному запиту.](/images/chat-members-statuses.svg)

Ви можете створити власне групування типів учасників чату, передавши масив замість рядка:

```typescript
groups.filter(
  chatMemberFilter(["restricted", "kicked"], ["free", "left"]),
  async (ctx) => {
    const from = ctx.from;
    const { status: oldStatus, user } = ctx.chatMember.old_chat_member;
    await ctx.reply(
      `${from.first_name} зняв ` +
        `${oldStatus === "kicked" ? "бан" : "обмеження"} ` +
        `з ${user.first_name}`,
    );
  },
);
```

#### Приклад використання

Найкращий спосіб використання фільтрів --- вибрати набір відповідних статусів, наприклад, `out`, `regular` та `admin`, а потім скласти таблицю переходів між ними:

| ↱         | `out`       | `regular`         | `admin`                |
| --------- | ----------- | ----------------- | ---------------------- |
| `out`     | бан змінено | приєднався        | приєднався призначеним |
| `regular` | вийшов      | обмеження змінено | призначений            |
| `admin`   | вийшов      | знижено           | дозволи змінено        |

Призначте прослуховувач для всіх переходів, які мають відношення до вашого сценарію використання.

Обʼєднайте ці фільтри з `bot.chatType`, щоб прослуховувати переходи лише для певного типу чату.
Додайте проміжний обробник для відстеження всіх оновлень, щоб виконувати типові операції (наприклад, оновлення бази даних) перед тим, як передати керування конкретному обробнику.

```typescript
const groups = bot.chatType(["group", "supergroup"]);

groups.on("chat_member", async (ctx, next) => {
  // Виконується на всіх оновленнях типу `chat_member`.
  const {
    old_chat_member: { status: oldStatus },
    new_chat_member: { user, status },
    from,
    chat,
  } = ctx.chatMember;
  console.log(
    `У групі ${chat.id} користувач ${from.id} змінив статус ${user.id}:`,
    `${oldStatus} -> ${status}`,
  );

  // Оновіть базу даних тут.

  await next();
});

// Певні обробники.

groups.filter(chatMemberFilter("out", "in"), async (ctx, next) => {
  const { new_chat_member: { user } } = ctx.chatMember;
  await ctx.reply(`Вітаємо, ${user.first_name}!`);
});
```

### Утиліта для перевірки статусу

Утиліта `chatMemberIs` може бути корисною, коли ви хочете використати логіку фільтрації в обробнику.
Вона приймає на вхід будь-який зі звичайних і власних статусів або їх масив і звужує тип змінної, що передається.

```ts
bot.callbackQuery("foo", async (ctx) => {
  const chatMember = await ctx.getChatMember(ctx.from.id);

  if (!chatMemberIs(chatMember, "free")) {
    chatMember.status; // `restricted` | `left` | `kicked`
    await ctx.answerCallbackQuery({
      show_alert: true,
      text: "У вас немає дозволу на це!",
    });
    return;
  }

  chatMember.status; // `creator` | `administrator` | `member`
  await ctx.answerCallbackQuery("bar");
});
```

### Гідратація обʼєктів учасників чату

Ви можете ще більше покращити свій досвід розробки, використовуючи гідратацію [перетворювача API](../advanced/transformers).
Цей перетворювач застосовуватиметься до викликів `getChatMember` і `getChatAdministrators`, додаючи зручний метод `is` до обʼєктів `ChatMember`, що повертаються.

```ts
type MyContext = HydrateChatMemberFlavor<Context>;
type MyApi = HydrateChatMemberApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>(""); // <-- Помістіть токен свого бота між "" (https://t.me/BotFather)

bot.api.config.use(hydrateChatMember());

bot.command("ban", async (ctx) => {
  const author = await ctx.getAuthor();

  if (!author.is("admin")) {
    author.status; // `member` | `restricted` | `left` | `kicked`
    await ctx.reply("У вас немає дозволу на це!");
    return;
  }

  author.status; // `creator` | `administrator`
  // ...
});
```

### Зберігання учасників чату

Ви можете використовувати дійсний [адаптер сховища](./session#відомі-адаптери-сховищ) або екземпляр будь-якого класу, що реалізує інтерфейс [`StorageAdapter`](/ref/core/storageadapter).

Зверніть увагу, що згідно з [офіційною документацією Telegram](https://core.telegram.org/bots/api#getupdates), ваш бот повинен вказати оновлення `chat_member` в масиві `allowed_updates`, як показано в прикладі нижче.
Це означає, що вам також потрібно вказати всі інші оновлення, які ви також хотіли б отримувати.

::: code-group

```ts [TypeScript]
import { API_CONSTANTS, Bot, type Context, MemorySessionStorage } from "grammy";
import { type ChatMember } from "grammy/types";
import { chatMembers, type ChatMembersFlavor } from "@grammyjs/chat-members";

type MyContext = Context & ChatMembersFlavor;

const adapter = new MemorySessionStorage<ChatMember>();

const bot = new Bot<MyContext>(""); // <-- Помістіть токен свого бота між "" (https://t.me/BotFather)

bot.use(chatMembers(adapter));

bot.start({
  // Не забуваємо вказати бажані типи оновлень.
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

```js [JavaScript]
import { API_CONSTANTS, Bot, MemorySessionStorage } from "grammy";
import { chatMembers } from "@grammyjs/chat-members";

const adapter = new MemorySessionStorage();

const bot = new Bot(""); // <-- Помістіть токен свого бота між "" (https://t.me/BotFather)

bot.use(chatMembers(adapter));

bot.start({
  // Не забуваємо вказати бажані типи оновлень.
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

```ts [Deno]
import {
  API_CONSTANTS,
  Bot,
  type Context,
  MemorySessionStorage,
} from "https://deno.land/x/grammy/mod.ts";
import { type ChatMember } from "https://deno.land/x/grammy/types.ts";
import {
  chatMembers,
  type ChatMembersFlavor,
} from "https://deno.land/x/grammy_chat_members/mod.ts";

type MyContext = Context & ChatMembersFlavor;

const adapter = new MemorySessionStorage<ChatMember>();

const bot = new Bot<MyContext>(""); // <-- Помістіть токен свого бота між "" (https://t.me/BotFather)

bot.use(chatMembers(adapter));

bot.start({
  // Не забуваємо вказати бажані типи оновлень.
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

:::

### Читання учасників чату

Цей плагін також додає нову функцію `ctx.chatMembers.getChatMember`, яка перевірятиме сховище на наявність інформації про учасника чату перед тим, як запитувати його в Telegram.
Якщо учасник чату існує в сховищі, буде повернута інформація про нього.
В іншому випадку буде викликано `ctx.api.getChatMember`, а результат буде збережено до сховища, що пришвидшить подальші виклики і усуне необхідність повторного виклику Telegram для цього користувача і чату в майбутньому.

Ось приклад:

```ts
bot.on("message", async (ctx) => {
  const chatMember = await ctx.chatMembers.getChatMember();

  return ctx.reply(
    `Привіт, ${chatMember.user.first_name}! Я бачу, що ви є ${chatMember.status} цього чату!`,
  );
});
```

Ця функція приймає наступні необовʼязкові параметри:

- `chatId`:
  - Значення за замовчуванням: `ctx.chat.id`
  - Ідентифікатор чату
- `userId`:
  - Значення за замовчуванням: `ctx.from.id`
  - Ідентифікатор користувача

Ви можете передавати їх наступним чином:

```ts
bot.on("message", async (ctx) => {
  const chatMember = await ctx.chatMembers.getChatMember(
    ctx.chat.id,
    ctx.from.id,
  );
  return ctx.reply(
    `Привіт, ${chatMember.user.first_name}! Я бачу, що ви є ${chatMember.status} цього чату!`,
  );
});
```

Зверніть увагу, що якщо ви не вкажете ідентифікатор чату і в контексті не буде властивості `chat`, що може бути при оновленні запиту в режимі реального часу, це призведе до помилки.
Те ж саме станеться, якщо в контексті немає властивості `ctx.from`.

## Агресивне зберігання

Параметр конфігурації `enableAggressiveStorage` встановить проміжний обробник для кешування учасників чату без залежності від події `chat_member`.
Під час кожного оновлення проміжний обробник перевіряє наявність `ctx.chat` та `ctx.from`.
Якщо обидві властивості наявні й користувач відстуній у сховищі, виконується виклик `ctx.chatMembers.getChatMember` для додавання інформації про учасника чату до сховища.

Зверніть увагу, що це означає, що сховище буде викликатися для **кожного оновлення**, що може бути дуже часто, залежно від того, скільки оновлень отримує ваш бот.
Це може суттєво вплинути на продуктивність вашого бота.
Використовуйте цю функцію, тільки якщо ви дійсно знаєте, що робите, й згодні з ризиками та наслідками.

## Загальні відомості про плагін

- Назва: `chat-members`
- [Джерело](https://github.com/grammyjs/chat-members)
- [Довідка](/ref/chat-members/)
