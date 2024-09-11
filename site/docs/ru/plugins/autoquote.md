---
prev: false
next: false
---

# Всегда отвечать на сообщения

Иногда необходимо всегда отправлять сообщения в виде ответов, особенно для ботов, которые предназначены для использования в группах.
Обычно мы делаем это, добавляя `reply_parameters` к методам, которые отправляют сообщение: `sendText`, `reply`, `sendPhoto`, `replyWithPhoto` и т.д.
Однако если вы будете делать это для каждого сообщения, это может стать беспорядочным и скучным.

Этот плагин устанавливает свойства `reply_parameters` для всех методов `reply*` и `send*`, которые его поддерживают, чтобы каждое сообщение было ответом на сообщение и чат, которые его вызвали.

Вы можете передать объект options со свойством `allowSendingWithoutReply` функциям `addReplyParam` и `autoQuote`, что позволит вашему боту отправлять сообщения, даже если сообщение, на которое отвечают, больше не существует.

## Использование

### В определенном контексте

Если вы хотите, чтобы все сообщения отправлялись в определенном контексте (например, по определенной команде), вы можете специально применить плагин к ним:

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { addReplyParam } from "@roziscoding/grammy-autoquote";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("Тестовая команда!"); // это будет цитировать сообщение пользователя
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { addReplyParam } = require("@roziscoding/grammy-autoquote");

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("Тестовая команда!"); // это будет цитировать сообщение пользователя
});

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { addReplyParam } from "https://deno.land/x/grammy_autoquote/mod.ts";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("Тестовая команда!"); // это будет цитировать сообщение пользователя
});

bot.start();
```

:::

### В каждом контексте

Если вы хотите, чтобы каждое отправленное сообщение цитировало сообщения пользователя, которые использовали команду, вы можете применить плагин таким образом:

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { autoQuote } from "@roziscoding/grammy-autoquote";

const bot = new Bot("");

bot.use(autoQuote());

bot.command("demo", async (ctx) => {
  await ctx.reply("Тестовая команда!"); // это будет цитировать сообщение пользователя
});

bot.command("hello", async (ctx) => {
  await ctx.reply("Привет :)"); // здесь также цитируется сообщение пользователя
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { autoQuote } = require("@roziscoding/grammy-autoquote");

const bot = new Bot("");

bot.use(autoQuote());

bot.command("demo", async (ctx) => {
  await ctx.reply("Тестовая команда!"); // это будет цитировать сообщение пользователя
});

bot.command("hello", async (ctx) => {
  await ctx.reply("Привет :)"); // здесь также цитируется сообщение пользователя
});

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { autoQuote } from "https://deno.land/x/grammy_autoquote/mod.ts";

const bot = new Bot("");

bot.use(autoQuote());

bot.command("demo", async (ctx) => {
  await ctx.reply("Тестовая команда!"); // это будет цитировать сообщение пользователя
});

bot.command("hello", async (ctx) => {
  await ctx.reply("Привет :)"); // здесь также цитируется сообщение пользователя
});

bot.start();
```

:::

## Краткая информация о плагине

- Название: Autoquote
- [Исходник](https://github.com/roziscoding/grammy-autoquote)
