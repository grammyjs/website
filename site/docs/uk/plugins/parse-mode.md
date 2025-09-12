---
prev: false
next: false
---

# Режим форматування (`parse-mode`)

Як відомо, Telegram підтримує [стилізовані повідомлення](https://core.telegram.org/bots/api#messageentity).
Ця бібліотека надає спрощені утиліти форматування для grammY.
Вона дозволяє створювати різноманітно оформлені повідомлення за допомогою декларативного, типобезпечного API.

У Telegram Bot API форматований текст представлено за допомогою _сутностей_ --- спеціальних маркерів, які визначають, як слід форматувати певні частини тексту.
Кожна сутність має _type_ (тип, наприклад, `bold`, `italic` тощо), _offset_ (зсув, де сутність починається в тексті) та _length_ (довжину, на скільки символів вона впливає).

Робота безпосередньо з цими сутностями може бути громіздкою, оскільки потрібно вручну відстежувати зсуви та довжини.
Цей плагін вирішує цю проблему, надаючи простий, декларативний API для форматування тексту.

## Два підходи: `fmt` та `FormattedString`

Ця бібліотека надає два основні підходи для форматування тексту:

1. **Шаблонна функція `fmt`**:
   [Шаблонна функція](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates), яка дозволяє писати форматований текст природним чином за допомогою шаблонних виразів.
   Всередині вона керує зсувами та довжинами сутностей за вас.

2. **Клас `FormattedString`**:
   Підхід на основі класів, який дозволяє створювати форматований текст через ланцюжок методів.
   Це особливо корисно для програмного створення складних форматованих повідомлень.

Обидва підходи створюють уніфікований обʼєкт `FormattedString`, який можна використовувати для маніпулювання форматованим текстом.

## Використання (за допомогою `fmt`)

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { b, fmt, u } from "@grammyjs/parse-mode";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Використання значень, що повертаються функцією `fmt`.
  const combined = fmt`${b}жирний${b} ${ctx.msg.text} ${u}підкреслений${u}`;
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
  // Використання значень, що повертаються функцією `fmt`.
  const combined = fmt`${b}жирний${b} ${ctx.msg.text} ${u}підкреслений${u}`;
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
  // Використання значень, що повертаються функцією `fmt`.
  const combined = fmt`${b}жирний${b} ${ctx.msg.text} ${u}підкреслений${u}`;
  await ctx.reply(combined.text, { entities: combined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    { caption: combined.caption, caption_entities: combined.caption_entities },
  );
});

bot.start();
```

:::

## Використання (за допомогою `FormattedString`)

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { FormattedString } from "@grammyjs/parse-mode";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Статичні методи.
  const staticCombined = FormattedString.b("жирний").plain(` ${ctx.msg.text} `)
    .u("підкреслений");
  await ctx.reply(staticCombined.text, { entities: staticCombined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: staticCombined.caption,
      caption_entities: staticCombined.caption_entities,
    },
  );

  // Або конструктор.
  const constructorCombined = (new FormattedString("")).b("жирний").plain(
    ` ${ctx.msg.text} `,
  ).u("підкреслений");
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
  // Статичні методи.
  const staticCombined = FormattedString.b("жирний").plain(` ${ctx.msg.text} `)
    .u("підкреслений");
  await ctx.reply(staticCombined.text, { entities: staticCombined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: staticCombined.caption,
      caption_entities: staticCombined.caption_entities,
    },
  );

  // Або конструктор.
  const constructorCombined = (new FormattedString("")).b("жирний").plain(
    ` ${ctx.msg.text} `,
  ).u("підкреслений");
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
  // Статичні методи.
  const staticCombined = FormattedString.b("жирний").plain(` ${ctx.msg.text} `)
    .u("підкреслений");
  await ctx.reply(staticCombined.text, { entities: staticCombined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: staticCombined.caption,
      caption_entities: staticCombined.caption_entities,
    },
  );

  // Або конструктор.
  const constructorCombined = (new FormattedString("")).b("жирний").plain(
    ` ${ctx.msg.text} `,
  ).u("підкреслений");
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

## Основні концепції

### `FormattedString` як уніфікований тип повернення

Клас `FormattedString` є основним компонентом плагіна режиму форматування (`parse-mode`), що надає уніфікований інтерфейс для роботи з форматованим текстом.
Значення, повернене `fmt`, `new FormattedString` та `FormattedString.<staticMethod>`, повертає екземпляр `FormattedString`.
Це означає, що можливо комбінувати різні стилі використання.

Наприклад, можна використати шаблонну функцію `fmt`, за якою слідує ланцюжок методів екземпляра `FormattedString`, а потім передати результат в іншу шаблонну функцію `fmt`.

```ts
bot.on("msg:text", async (ctx) => {
  // Результат fmt`${u}Памʼять оновлено!${u}` є екземпляром `FormattedString`,
  // чий виклик методу екземпляра `.plain("\n")` також повертає `FormattedString`.
  const header = fmt`${u}Памʼять оновлено!${u}`.plain("\n");
  const body = FormattedString.plain("Я запам'ятаю це!");
  const footer = "\n - від grammY AI";

  // Також допустимо, що ви можете передати `FormattedString` та рядок до `fmt`.
  const response = fmt`${header}${body}${footer}`;
  await ctx.reply(response.text, { entities: response.entities });
});
```

### Що приймає `fmt`

Шаблонна функція `fmt` приймає широкий спектр значень для створення вашого екземпляру `FormattedString`, включно з:

- `TextWithEntities`, реалізований `FormattedString` та звичайними текстовими повідомленнями Telegram.
- `CaptionWithEntities`, реалізований `FormattedString` та звичайними медіаповідомленнями Telegram з підписами.
- `EntityTag`, як-от ваші функції `b()` та `a(url)`.
- Функції без аргументів, що повертають `EntityTag` (наприклад, `b` та `i`).
- Будь-які типи, що реалізують `toString()` (вони будуть оброблені як звичайний текст).

### `TextWithEntities`

Інтерфейс `TextWithEntities` представляє текст з необовʼязковими сутностями форматування.

```ts
interface TextWithEntities {
  text: string;
  entities?: MessageEntity[];
}
```

Зауважте, що форма цього типу означає, що звичайні текстові повідомлення від Telegram також неявно реалізують `TextWithEntities`.
Це означає, що насправді можна зробити наступне:

```ts
bot.on("msg:text", async (ctx) => {
  const response = fmt`${ctx.msg}`.plain("\n---\n").bold("Це моя відповідь");
  await ctx.reply(response.text, { entities: response.entities });
});
```

### `CaptionWithEntities`

Інтерфейс `CaptionWithEntities` представляє підпис з необовʼязковими сутностями форматування.

```ts
interface CaptionWithEntities {
  caption: string;
  caption_entities?: MessageEntity[];
}
```

Так само зауважте, що форма цього типу означає, що звичайні медіаповідомлення з підписом від Telegram також неявно реалізують `CaptionWithEntities`.
Це означає, що також насправді можна зробити наступне:

```ts
bot.on("msg:caption", async (ctx) => {
  const response = fmt`${ctx.msg}`.plain("\n---\n").bold("Це моя відповідь");
  await ctx.reply(response.text, { entities: response.entities });
});
```

## Загальні відомості про плагін

- Назва: `parse-mode`
- [Джерело](https://github.com/grammyjs/parse-mode)
- [Довідка](/ref/parse-mode/)
