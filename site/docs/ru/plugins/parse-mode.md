---
prev: false
next: false
---

# Плагин Parse Mode (`parse-mode`)

Telegram поддерживает [стилизованные сообщения](https://core.telegram.org/bots/api#messageentity).
А этот плагин предоставляет возможность на лету форматировать любой текст.
Он позволяет отправлять сообщения с любыми стилями с помощью декларативного и type-safe API.

В Telegram Bot API форматированный текст представлен с помощью `entities` --- специальных маркеров, которые определяют, какие части текста должны быть отформатированы определённым образом.

::: tip
Далее в тексте каждый `entity` будет иметь название `сущность`.
:::

Каждая `сущность` имеет свой:

- _тип_ (`type`) --- `bold`, `italic` и т.д.
- _смещение_ (`offset`) --- с какого места должно начинаться форматирование
- _длина_ (`length`) --- количество символов, которое это форматирование затронет.

## Два подхода: `fmt` и `FormattedString`

Этот плагин предлагает два основных подхода к форматированию текста:

1. **`fmt`, шаблонные строки**:
   [Шаблонный литеральный тег](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Template_literals#теговые_шаблоны), который позволяет писать текст естественным образом с помощью шаблонных строк.
   Он внутренне управляет смещениями и длинами сущностей.

2. **Класс `FormattedString`**:
   Подход с помощью класса, позволяющий создавать форматированный текст с помощью цепочки методов.
   Это особенно полезно для программного построения сложных сообщений с большим количеством отформатированных строк.

Оба подхода создают единый объект `FormattedString`, который можно использовать для манипулирования отформатированным текстом.

## Использование (с помощью `fmt`)

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { b, fmt, u } from "@grammyjs/parse-mode";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Использование возвращаемых значений fmt
  const combined = fmt`${b}жирный${b} ${ctx.msg.text} ${u}подчёркнутый${u}`;
  await ctx.reply(combined.text, { entities: combined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    { caption: combined.caption, caption_entities: combined.caption_entities },
  );
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { fmt, b, u } = require("@grammyjs/parse-mode");

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Использование возвращаемых значений fmt
  const combined = fmt`${b}жирный${b} ${ctx.msg.text} ${u}подчёркнутый${u}`;
  await ctx.reply(combined.text, { entities: combined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    { caption: combined.caption, caption_entities: combined.caption_entities },
  );
});

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { b, fmt, u } from "https://deno.land/x/grammy_parse_mode/mod.ts";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Использование возвращаемых значений fmt
  const combined = fmt`${b}жирный${b} ${ctx.msg.text} ${u}подчёркнутый${u}`;
  await ctx.reply(combined.text, { entities: combined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    { caption: combined.caption, caption_entities: combined.caption_entities },
  );
});

bot.start();
```

:::

## Использование (с помощью `FormattedString`)

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { FormattedString } from "@grammyjs/parse-mode";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Статичный метод
  const staticCombined = FormattedString.b("жирный").plain(` ${ctx.msg.text} `)
    .u("подчёркнутый");
  await ctx.reply(staticCombined.text, { entities: staticCombined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: staticCombined.caption,
      caption_entities: staticCombined.caption_entities,
    },
  );

  // или конструктор
  const constructorCombined = (new FormattedString("")).b("жирный").plain(
    ` ${ctx.msg.text} `,
  ).u("подчёркнутый");
  await ctx.reply(constructorCombined.text, {
    entities: constructorCombined.entities,
  });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: constructorCombined.caption,
      caption_entities: constructorCombined.caption_entities,
    },
  );
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { FormattedString } = require("@grammyjs/parse-mode");

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Статичный метод
  const staticCombined = FormattedString.b("жирный").plain(` ${ctx.msg.text} `)
    .u("подчёркнутый");
  await ctx.reply(staticCombined.text, { entities: staticCombined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: staticCombined.caption,
      caption_entities: staticCombined.caption_entities,
    },
  );

  // или конструктор
  const constructorCombined = (new FormattedString("")).b("жирный").plain(
    ` ${ctx.msg.text} `,
  ).u("подчёркнутый");
  await ctx.reply(constructorCombined.text, {
    entities: constructorCombined.entities,
  });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: constructorCombined.caption,
      caption_entities: constructorCombined.caption_entities,
    },
  );
});

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { FormattedString } from "https://deno.land/x/grammy_parse_mode/mod.ts";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Статичный метод
  const staticCombined = FormattedString.b("жирный").plain(` ${ctx.msg.text} `)
    .u("подчёркнутый");
  await ctx.reply(staticCombined.text, { entities: staticCombined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: staticCombined.caption,
      caption_entities: staticCombined.caption_entities,
    },
  );

  // или конструктор
  const constructorCombined = (new FormattedString("")).b("жирный").plain(
    ` ${ctx.msg.text} `,
  ).u("подчёркнутый");
  await ctx.reply(constructorCombined.text, {
    entities: constructorCombined.entities,
  });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: constructorCombined.caption,
      caption_entities: constructorCombined.caption_entities,
    },
  );
});

bot.start();
```

:::

## Основные понятия

### `FormattedString` как тип возвращаемого значения

Класс `FormattedString` является основным компонентом плагина `parse-mode`, предоставляющим интерфейс для работы с форматированным текстом.
Возвращаемое значение `fmt`, `new FormattedString` и `FormattedString.<staticMethod>` возвращает `FormattedString`.
Это означает, что можно комбинировать различные стили использования.

Например, можно использовать `fmt`, за которым следуют цепочка методов `FormattedString`, а затем передать результат в другой шаблон с тегом `fmt`.

```ts
bot.on("msg:text", async ctx => {
  // Результатом fmt`${${u}Память обновлена!${u}}` является FormattedString,
  // чей вызов метода `.plain("\n") также возвращает FormattedString.
  const header = fmt`${${u}Память обновлена!${u}}`.plain("\n");
  const body = FormattedString.plain("Я запомню это!");
  const footer = "\n - от grammY AI";

  // За это тоже не посадят — вы можете передать FormattedString и строку в `fmt`.
  const response = fmt`${header}${body}${footer}`;
  await ctx.reply(response.text, { entities: response.entities });
});
```

### Что принимает `fmt`

Шаблон с тегом `fmt` принимает широкий спектр значений для построения `FormattedString`, в том числе:

- `TextWithEntities` --- реализуется `FormattedString` и обычными текстовыми сообщениями Telegram
- `CaptionWithEntities` --- реализуется `FormattedString` и обычными медиа-сообщениями Telegram с под(писями)
- `EntityTag` (например, ваши функции `b()` и `a(url)`)
- Нульарные функции, возвращающие `EntityTag` (например, `b` и `i`)
- Любые типы, реализующие `toString()` (будут рассматриваться как значение простого текста)

### `TextWithEntities`

Интерфейс `TextWithEntities` представляет текст с сущностями, которые вы можете добавить по желанию.

```ts
interface TextWithEntities {
  text: string;
  entities?: MessageEntity[];
}
```

Обратите внимание, что форма этого типа подразумевает, что обычные текстовые сообщения из Telegram также неявно реализуют `TextWithEntities`.
Это означает, что на самом деле можно сделать следующее:

```ts
bot.on("msg:text", async (ctx) => {
  const response = fmt`${ctx.msg}`.plain("\n---\n").bold("Это мой ответ");
  await ctx.reply(response.text, { entities: response.entities });
});
```

### `CaptionWithEntities`

Интерфейс `CaptionWithEntities` представляет подпись с сущностями, которые вы также можете добавить по желанию

```ts
interface CaptionWithEntities {
  caption: string;
  caption_entities?: MessageEntity[];
}
```

Также обратите внимание, что форма этого типа подразумевает, что обычные медиа-сообщения с подписью из Telegram также неявно реализуют `CaptionWithEntities`.
Это означает, что на самом деле можно сделать следующее:

```ts
bot.on("msg:caption", async (ctx) => {
  const response = fmt`${ctx.msg}`.plain("\n---\n").bold("Это мой ответ");
  await ctx.reply(response.text, { entities: response.entities });
});
```

## Краткая информация о плагине

- Название: `parse-mode`
- [Исходник](https://github.com/grammyjs/parse-mode)
- [Ссылка](/ref/parse-mode/)
