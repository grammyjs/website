---
prev: false
next: false
---

# Плагин эмодзи (`emoji`)

С помощью этого плагина вы можете легко вставлять эмодзи в свои ответы, находя
их, вместо того чтобы вручную копировать и вставлять эмодзи из Интернета в свой
код.

## Почему я должен использовать это?

Почему бы и нет? Люди постоянно используют эмодзи в своем коде, чтобы лучше
проиллюстрировать сообщение, которое они хотят передать, или чтобы упорядочить
вещи. Но вы теряете фокус каждый раз, когда вам нужен новый эмодзи:

1. Вы прекращаете программировать для поиска конкретного эмодзи.
2. Вы заходите в чат Telegram и тратите ~6 секунд (если не больше) на поиск
   нужного вам эмодзи.
3. Вы копируете и вставляете их в свой код и возвращаетесь к программированию,
   но уже с потерянным фокусом.

С этим плагином вы не только не перестанете писать код, но и не потеряете фокус.
Есть также плохо работающие системы и/или редакторы, которые не любят и не
показывают эмодзи, поэтому в итоге вы вставляете белый квадрат, как в этом
грустном сообщении: `Я так счастлив □`.

Этот плагин призван решить эти проблемы, выполняя за вас сложную задачу по
разбору эмодзи во всех системах и позволяя вам только искать их простым способом
(доступно автоподсказка). Теперь все описанные выше действия можно свести к
одному:

1. Опишите нужный вам эмодзи и используйте его. Прямо в вашем коде. Все просто.

### Это что, колдовство?

Нет, это называется шаблонными строками. Подробнее о них вы можете прочитать
[здесь](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).

## Установка и примеры

Вы можете установить этот плагин на своего бота следующим образом:

::: code-group

```ts [TypeScript]
import { Bot, Context } from "grammy";
import { EmojiFlavor, emojiParser } from "@grammyjs/emoji";

// Это называется расширители контекста
// Подробнее об этом вы можете прочитать на:
// https://grammy.dev/guide/context#transformative-context-flavors
type MyContext = EmojiFlavor<Context>;

const bot = new Bot<MyContext>("");

bot.use(emojiParser());
```

```js [JavaScript]
const { Bot } = require("grammy");
const { emojiParser } = require("@grammyjs/emoji");

const bot = new Bot("");

bot.use(emojiParser());
```

```ts [Deno]
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  EmojiFlavor,
  emojiParser,
} from "https://deno.land/x/grammy_emoji/mod.ts";

// Это называется расширители контекста
// Подробнее об этом вы можете прочитать на:
// https://grammy.dev/guide/context#transformative-context-flavors
type MyContext = EmojiFlavor<Context>;

const bot = new Bot<MyContext>("");

bot.use(emojiParser());
```

:::

Теперь вы можете получать эмодзи по их именам:

```js
bot.command("start", async (ctx) => {
  const parsedString = ctx
    .emoji`Добро пожаловать! ${"smiling_face_with_sunglasses"}`; // => Добро пожаловать! 😎
  await ctx.reply(parsedString);
});
```

Кроме того, вы можете ответить напрямую, используя метод `replyWithEmoji`:

```js
bot.command("ping", async (ctx) => {
  await ctx.replyWithEmoji`Понг ${"ping_pong"}`; // => Понг 🏓
});
```

::: warning Имейте в виду, что `ctx.emoji` и `ctx.replyWithEmoji` **ВСЕГДА**
используют шаблонные строки. Если вы не знакомы с этим синтаксисом, вы можете
прочитать о нем подробнее
[здесь](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).
:::

## Полезные данные для реакций

Когда вы используете [реакции](../guide/reactions) в своем боте, вам придется
много программировать и с эмодзи! Это не менее раздражает, и так как этот
плагин --- это влажные сны всех ваших эмодзи, он может помочь вам и с реакциями.

Вы можете импортировать `Reactions` из этого плагина и затем использовать его
следующим образом.

```ts
bot.on("message", (ctx) => ctx.react(Reactions.thumbs_up));
```

Как мило.

## Краткая информация о плагине

- Название: `emoji`
- [Исходник](https://github.com/grammyjs/emoji)
- [Ссылка](/ref/emoji/)
