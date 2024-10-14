---
prev: false
next: false
---

# Плагин участников чата (`chat-members`)

Автоматически сохраняйте информацию о пользователях в чате и легко извлекайте ее.
Отслеживайте участников групп и каналов и составляйте их списки.

## Введение

Во многих ситуациях боту необходимо иметь информацию обо всех пользователях данного чата.
Однако, в настоящее время Telegram Bot API не предоставляет методов, позволяющих получить эту информацию.

Этот плагин приходит на помощь: автоматически прослушивает события `chat_member` и сохраняет все объекты `ChatMember`.

## Использование

### Сохранение пользователей чата

Вы можете использовать действующий адаптер grammY [storage adapter](./session#известные-адаптеры-хранения) или экземпляр любого класса, реализующего интерфейс [`StorageAdapter`](/ref/core/storageadapter).

Обратите внимание, что, согласно [официальной документации Telegram](https://core.telegram.org/bots/api#getupdates), ваш бот должен указать обновление `chat_member` в массиве `allowed_updates`, как показано в примере ниже.
Это означает, что вам также нужно указать любые другие события, которые вы хотели бы получать.

::: code-group

```ts [TypeScript]
import { Bot, type Context, MemorySessionStorage } from "grammy";
import { type ChatMember } from "grammy/types";
import { chatMembers, type ChatMembersFlavor } from "@grammyjs/chat-members";

type MyContext = Context & ChatMembersFlavor;

const adapter = new MemorySessionStorage<ChatMember>();

const bot = new Bot<MyContext>("");

bot.use(chatMembers(adapter));

bot.start({
  // Обязательно укажите нужные типы обновлений
  allowed_updates: ["chat_member", "message"],
});
```

```js [JavaScript]
import { Bot, MemorySessionStorage } from "grammy";
import { chatMembers } from "@grammyjs/chat-members";

const adapter = new MemorySessionStorage();

const bot = new Bot("");

bot.use(chatMembers(adapter));

bot.start({
  // Обязательно укажите нужные типы обновлений
  allowed_updates: ["chat_member", "message"],
});
```

```ts [Deno]
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
  // Обязательно укажите нужные типы обновлений
  allowed_updates: ["chat_member", "message"],
});
```

:::

### Чтение пользователей чата

Этот плагин также добавляет новую функцию `ctx.chatMembers.getChatMember`, которая будет проверять хранилище на наличие информации об участнике чата, прежде чем запрашивать ее у Telegram.
Если участник чата существует в хранилище, он будет возвращен.
В противном случае, будет вызвана функция `ctx.api.getChatMember`, и результат будет сохранен в хранилище, что ускорит последующие вызовы и избавит вас от необходимости снова обращаться к Telegram для этого пользователя и чата в будущем.

Вот пример:

```ts
bot.on("message", async (ctx) => {
  const chatMember = await ctx.chatMembers.getChatMember();

  return ctx.reply(
    `Привет, ${chatMember.user.first_name}! Я вижу, что вы ${chatMember.status} этого чата!`,
  );
});
```

Эта функция принимает следующие необязательные параметры:

- `chatId`:
  - По умолчанию: `ctx.chat.id`
  - Идентификатор чата
- `userId`:
  - По умолчанию: `ctx.from.id`
  - Идентификатор пользователя

Вы можете передавать их следующим образом:

```ts
bot.on("message", async (ctx) => {
  const chatMember = await ctx.chatMembers.getChatMember(
    ctx.chat.id,
    ctx.from.id,
  );
  return ctx.reply(
    `Привет, ${chatMember.user.first_name}! Я вижу, что вы ${chatMember.status} этого чата!`,
  );
});
```

Обратите внимание, что если вы не указали идентификатор чата и в контексте нет свойства `chat` (например, при обновлении запроса), это приведет к ошибке.
То же самое произойдет, если в контексте нет свойства `ctx.from`.

## Агрессивное хранение

Параметр конфигурации `enableAggressiveStorage` установит middleware для кэширования членов чата без зависимости от события `chat_member`.
При каждом обновлении middleware проверяет, существуют ли `ctx.chat` и `ctx.from`.
Если они существуют, то выполняется вызов `ctx.chatMembers.getChatMember`, чтобы добавить информацию о пользователи чата в хранилище, если она не существует.

Обратите внимание, что это означает, что хранилище будет вызываться **каждое обновление**, что может быть очень много, в зависимости от того, сколько обновлений получает ваш бот.
Это может сильно повлиять на производительность вашего бота.
Используйте это только в том случае, если вы действительно знаете, что делаете, и не боитесь рисков и последствий.

## Краткая информация о плагине

- Название: `chat-members`
- [Исходник](https://github.com/grammyjs/chat-members)
- [Ссылка](/ref/chat-members/)
