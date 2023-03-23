# Учасники чату (`chat-members`)

Автоматично зберігайте інформацію про користувачів у чаті та легко отримуйте її.
Відстежуйте учасників груп і каналів та скаладйте їхній перелік.

## Вступ

У багатьох ситуаціях боту необхідно мати інформацію про всіх користувачів певного чату.
Однак, наразі Telegram Bot API не надає жодного методу, який би дозволяв отримати цю інформацію.

На допомогу приходить цей плагін: він автоматично прослуховує події `chat_member` і зберігає всі обʼєкти `ChatMember`.

## Використання

### Зберігання учасників чату

Ви можете використовувати дійсний [адаптер сховища](./session.md#відомі-адаптери-сховищ) або екземпляр будь-якого класу, що реалізує інтерфейс [`StorageAdapter`](https://deno.land/x/grammy/mod.ts?s=StorageAdapter).

Зверніть увагу, що згідно з [офіційною документацією Telegram](https://core.telegram.org/bots/api#getupdates), ваш бот повинен вказати оновлення `chat_member` в масиві `allowed_updates`, як показано в прикладі нижче.
Це означає, що вам також потрібно вказати будь-які інші події, які ви хочете отримувати.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, type Context, MemorySessionStorage } from "grammy";
import { type ChatMember } from "grammy/types";
import { chatMembers, type ChatMembersFlavor } from "@grammyjs/chat-members";

type MyContext = Context & ChatMembersFlavor;

const adapter = new MemorySessionStorage<ChatMember>();

const bot = new Bot<MyContext>("");

bot.use(chatMembers(adapter));

bot.start({
  // Не забуваємо вказати бажані типи оновлень
  allowed_updates: ["chat_member", "message"],
});
```

</CodeGroupItem>

<CodeGroupItem title="JavaScript">

```js
import { Bot, MemorySessionStorage } from "grammy";
import { chatMembers } from "@grammyjs/chat-members";

const adapter = new MemorySessionStorage();

const bot = new Bot("");

bot.use(chatMembers(adapter));

bot.start({
  // Не забуваємо вказати бажані типи оновлень
  allowed_updates: ["chat_member", "message"],
});
```

</CodeGroupItem>

<CodeGroupItem title="Deno">

```ts
import {
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

const bot = new Bot<MyContext>("");

bot.use(chatMembers(adapter));

bot.start({
  // Не забуваємо вказати бажані типи оновлень
  allowed_updates: ["chat_member", "message"],
});
```

</CodeGroupItem>

</CodeGroup>

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

Ця функція приймає наступні необов'язкові параметри:

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

Параметр конфігурації `enableAggressiveStorage` встановить middleware для кешування учасників чату без залежності від події `chat_member`.
Під час кожного оновлення middleware перевіряє наявність `ctx.chat` та `ctx.from`.
Якщо обидві властивості наявні й користувач відстуній у сховищі, виконується виклик `ctx.chatMembers.getChatMember` для додавання інформації про учасника чату до сховища.

Зверніть увагу, що це означає, що сховище буде викликатися для **кожного оновлення**, що може бути дуже часто, залежно від того, скільки оновлень отримує ваш бот.
Це може суттєво вплинути на продуктивність вашого бота.
Використовуйте цю функцію, тільки якщо ви дійсно знаєте, що робите, й згодні з ризиками та наслідками.

## Загальні відомості про плагін

- Назва: `chat-members`
- Джерело: <https://github.com/grammyjs/chat-members>
- Довідка: <https://deno.land/x/grammy_chat_members/mod.ts>
