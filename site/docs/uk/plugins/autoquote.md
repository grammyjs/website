# Завжди відповідати на повідомлення

Іноді необхідно завжди надсилати повідомлення як відповіді, особливо для ботів, призначених для використання в групах. Зазвичай ми робимо це, додаючи параметр `reply_to_message_id` до методів, які надсилають повідомлення: `sendText`, `reply`, `sendPhoto`, `replyWithPhoto` та інші.
Однак, якщо ви робите це для кожного повідомлення окремо, це може бути марночасним і нудним.

Цей плагін встановлює параметр `reply_to_message_id` зі значенням `ctx.msg.message_id` для всіх методів `reply*` та `send*`, які підтримують його, щоб кожне повідомлення ставало відповіддю на повідомлення, яке його викликало.

## Використання

### У певних обробниках

Якщо ви хочете, щоб всі повідомлення, надіслані в межах певного контексту, наприклад, певної команди, були оброблені плагіном, ви можете застосувати його спеціально до них:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";
import { addReplyParam } from "@roziscoding/grammy-autoquote";

const bot = new Bot("");

bot.command("демо", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("Демо команда!"); // це повідомлення буде з цитуванням повідомлення від користувача
});

bot.start();
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");
const { addReplyParam } = require("@roziscoding/grammy-autoquote");

const bot = new Bot("");

bot.command("демо", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("Демо команда!"); // це повідомлення буде з цитуванням повідомлення від користувача
});

bot.start();
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { addReplyParam } from "https://deno.land/x/grammy_autoquote/mod.ts";

const bot = new Bot("");

bot.command("демо", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("Демо команда!"); // це повідомлення буде з цитуванням повідомлення від користувача
});

bot.start();
```

</CodeGroupItem>
</CodeGroup>

### У всіх обробниках

Якщо ви хочете, щоб кожне надіслане повідомлення було відповіддю на повідомлення, яке його спричинило, ви можете застосувати плагін таким чином:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";
import { autoQuote } from "@roziscoding/grammy-autoquote";

const bot = new Bot("");

bot.use(autoQuote);

bot.command("демо", async (ctx) => {
  await ctx.reply("Демо команда!"); // це повідомлення буде з цитуванням повідомлення від користувача
});

bot.command("привіт", async (ctx) => {
  await ctx.reply("Привіт :)"); // тут цитування повідомлення буде також
});

bot.start();
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");
const { autoQuote } = require("@roziscoding/grammy-autoquote");

const bot = new Bot("");

bot.use(autoQuote);

bot.command("демо", async (ctx) => {
  await ctx.reply("Демо команда!"); // це повідомлення буде з цитуванням повідомлення від користувача
});

bot.command("привіт", async (ctx) => {
  await ctx.reply("Привіт :)"); // тут цитування повідомлення буде також
});

bot.start();
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { autoQuote } from "https://deno.land/x/grammy_autoquote/mod.ts";

const bot = new Bot("");

bot.use(autoQuote);

bot.command("демо", async (ctx) => {
  await ctx.reply("Демо команда!"); // це повідомлення буде з цитуванням повідомлення від користувача
});

bot.command("привіт", async (ctx) => {
  await ctx.reply("Привіт :)"); // тут цитування повідомлення буде також
});

bot.start();
```

</CodeGroupItem>
</CodeGroup>

## Опис плагіна

- Назва: Автоцитати
- Джерело: <https://github.com/roziscoding/grammy-autoquote>
- Довідка API: <https://deno.land/x/grammy_autoquote/mod.ts>
