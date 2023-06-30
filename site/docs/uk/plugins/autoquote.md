---
next: false
---

# Автоматичне встановлення відповіді

Іноді необхідно завжди надсилати повідомлення як відповіді, особливо для ботів, призначених для використання в групах.
Зазвичай ми робимо це, додаючи параметр `reply_to_message_id` до методів, які надсилають повідомлення: `sendText`, `reply`, `sendPhoto`, `replyWithPhoto` тощо.
Однак, якщо ви робите це для кожного повідомлення окремо, це може бути трудомістким і нудним.

Цей плагін встановлює параметр `reply_to_message_id` зі значенням `ctx.msg.message_id` для всіх методів `reply*` та `send*`, які підтримують його, щоб кожне повідомлення ставало відповіддю на повідомлення, яке його викликало.

## Використання

### У певних обробниках

Якщо ви хочете, щоб всі повідомлення, надіслані в межах певного контексту, наприклад, певної команди, були оброблені плагіном, ви можете застосувати його спеціально до них:

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { addReplyParam } from "@roziscoding/grammy-autoquote";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("Демонстраційна команда!"); // це повідомлення буде відповіддю на повідомлення користувача
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { addReplyParam } = require("@roziscoding/grammy-autoquote");

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("Демонстраційна команда!"); // це повідомлення буде відповіддю на повідомлення користувача
});

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { addReplyParam } from "https://deno.land/x/grammy_autoquote/mod.ts";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("Демонстраційна команда!"); // це повідомлення буде відповіддю на повідомлення користувача
});

bot.start();
```

:::

### У всіх обробниках

Якщо ви хочете, щоб кожне надіслане повідомлення було відповіддю на повідомлення, яким було викликане, ви можете застосувати плагін ось так:

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { autoQuote } from "@roziscoding/grammy-autoquote";

const bot = new Bot("");

bot.use(autoQuote);

bot.command("demo", async (ctx) => {
  await ctx.reply("Демонстраційна команда!"); // це повідомлення буде відповіддю на повідомлення користувача
});

bot.command("hello", async (ctx) => {
  await ctx.reply("Привіт :)"); // тут також буде встановлена відпоповідь на повідомлення користувача
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { autoQuote } = require("@roziscoding/grammy-autoquote");

const bot = new Bot("");

bot.use(autoQuote);

bot.command("demo", async (ctx) => {
  await ctx.reply("Демонстраційна команда!"); // це повідомлення буде відповіддю на повідомлення користувача
});

bot.command("hello", async (ctx) => {
  await ctx.reply("Привіт :)"); // тут також буде встановлена відпоповідь на повідомлення користувача
});

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { autoQuote } from "https://deno.land/x/grammy_autoquote/mod.ts";

const bot = new Bot("");

bot.use(autoQuote);

bot.command("demo", async (ctx) => {
  await ctx.reply("Демонстраційна команда!"); // це повідомлення буде відповіддю на повідомлення користувача
});

bot.command("hello", async (ctx) => {
  await ctx.reply("Привіт :)"); // тут також буде встановлена відпоповідь на повідомлення користувача
});

bot.start();
```

:::

## Загальні відомості про плагін

- Назва: Autoquote
- Джерело: <https://github.com/roziscoding/grammy-autoquote>
- Довідка API: <https://deno.land/x/grammy_autoquote/mod.ts>
