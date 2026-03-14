---
prev: false
next: false
---

# Потокова передача повідомлень (`stream`)

Цей плагін дозволяє потоково передавати довгі текстові повідомлення до Telegram.
Будь-який [ітератор](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) фрагментів рядків може передаватися потоково безпосередньо до будь-якого приватного чату.

Наприклад, ви можете зробити так, щоб відповідь LLM [зʼявлялася поступово](#інтеграція-з-llm) під час генерування.

## Початок роботи

Плагін встановлює [`ctx.replyWithStream`](/ref/stream/streamcontextextension#replywithstream) на [обʼєкт контексту](../guide/context).

> Потокова передача повідомлень дуже швидко виконує дуже багато запитів до API.
> Настійно рекомендується використовувати [плагін `auto-retry`](./auto-retry) разом із плагіном `stream`.

::: code-group

```ts [TypeScript]
import { Bot, type Context } from "grammy";
import { autoRetry } from "@grammyjs/auto-retry";
import { stream, type StreamFlavor } from "@grammyjs/stream";

type MyContext = StreamFlavor<Context>;
const bot = new Bot<MyContext>("");

bot.api.config.use(autoRetry()); // Настійно рекомендується!
bot.use(stream());

async function* slowText() {
  // Імітуємо повільне генерування тексту.
  yield "Це деяки";
  await new Promise((r) => setTimeout(r, 2000));
  yield "й повільно зге";
  await new Promise((r) => setTimeout(r, 2000));
  yield "нерований текст";
}

// Telegram підтримує потокову передачу лише у приватних чатах.
bot.chatType("private")
  .command("stream", async (ctx) => {
    // Передаємо повідомлення потоково!
    await ctx.replyWithStream(slowText());
  });

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { autoRetry } = require("@grammyjs/auto-retry");
const { stream } = require("@grammyjs/stream");

const bot = new Bot("");

bot.api.config.use(autoRetry()); // Настійно рекомендується!
bot.use(stream());

async function* slowText() {
  // Імітуємо повільне генерування тексту.
  yield "Це деяки";
  await new Promise((r) => setTimeout(r, 2000));
  yield "й повільно зге";
  await new Promise((r) => setTimeout(r, 2000));
  yield "нерований текст";
}

// Telegram підтримує потокову передачу лише у приватних чатах.
bot.chatType("private")
  .command("stream", async (ctx) => {
    // Передаємо повідомлення потоково!
    await ctx.replyWithStream(slowText());
  });

bot.start();
```

```ts [Deno]
import { Bot, type Context } from "https://deno.land/x/grammy/mod.ts";
import { autoRetry } from "https://deno.land/x/grammy_auto_retry/mod.ts";
import {
  stream,
  type StreamFlavor,
} from "https://deno.land/x/grammy_stream/mod.ts";

type MyContext = StreamFlavor<Context>;
const bot = new Bot<MyContext>("");

bot.api.config.use(autoRetry()); // Настійно рекомендується!
bot.use(stream());

async function* slowText() {
  // Імітуємо повільне генерування тексту.
  yield "Це деяки";
  await new Promise((r) => setTimeout(r, 2000));
  yield "й повільно зге";
  await new Promise((r) => setTimeout(r, 2000));
  yield "нерований текст";
}

// Telegram підтримує потокову передачу лише у приватних чатах.
bot.chatType("private")
  .command("stream", async (ctx) => {
    // Передаємо повідомлення потоково!
    await ctx.replyWithStream(slowText());
  });

bot.start();
```

:::

Ось і все!

## Інтеграція з LLM

Більшість інтеграцій з [LLM](https://uk.wikipedia.org/wiki/%D0%92%D0%B5%D0%BB%D0%B8%D0%BA%D0%B0_%D0%BC%D0%BE%D0%B2%D0%BD%D0%B0_%D0%BC%D0%BE%D0%B4%D0%B5%D0%BB%D1%8C) дозволяють передавати результат потоково під час його генерування.
Ви можете використовувати цей плагін, щоб відповідь LLM зʼявлялася поступово у будь-якому приватному чаті.

Наприклад, якщо ви використовуєте [AI SDK](https://ai-sdk.dev), налаштування може виглядати так:

::: code-group

```ts [Node.js]
import { streamText } from "ai";
import { google } from "@ai-sdk/google";

bot.chatType("private")
  .command("credits", async (ctx) => {
    // Надсилаємо запит до LLM:
    const { textStream } = streamText({
      model: google("gemini-2.5-flash"),
      prompt: "Наскільки класні боти grammY?",
    });

    // Автоматично передаємо відповідь потоково за допомогою grammY:
    await ctx.replyWithStream(textStream);
  });
```

```ts [Deno]
import { streamText } from "npm:ai";
import { google } from "npm:@ai-sdk/google";

bot.chatType("private")
  .command("credits", async (ctx) => {
    // Надсилаємо запит до LLM:
    const { textStream } = streamText({
      model: google("gemini-2.5-flash"),
      prompt: "Наскільки класні боти grammY?",
    });

    // Автоматично передаємо відповідь потоково за допомогою grammY:
    await ctx.replyWithStream(textStream);
  });
```

:::

Не забудьте замінити `gemini-2.5-flash` на найновішу модель.

## Потокова передача стилізованих повідомлень

Це _значно_ складніше, ніж здається.

1. LLM генерують _імовірнісний_ Markdown.
   Він часто правильний, але не завжди.
   Він не дотримується жодного конкретного стандарту.
   Зокрема, **вони не завжди генерують Markdown, сумісний із Telegram**.
   Це означає, що спроба надіслати або передати його потоково до Telegram не вдасться.
2. LLM генерують _часткові_ сутності Markdown.
   Навіть якщо результат ідеально відповідає специфікації [MarkdownV2](https://core.telegram.org/bots/api#markdownv2-style) від Telegram, **окремі вихідні фрагменти можуть бути неправильними**.
   Якщо ви почнете курсивний текст, але завершите його лише в наступному фрагменті, потокова передача обірветься і жодне повідомлення не буде надіслане.
3. LLM іноді генерують форматування, яке не підтримується Telegram (навіть якщо ви інструктуєте їх не робити цього).
   Наприклад, більшість LLM _обожнюють_ **таблиці, марковані списки та нумеровані переліки**.
   Клієнти Telegram не можуть відображати ці елементи.

> Telegram також приймає [HTML-форматування](https://core.telegram.org/bots/api#html-style).
> Воно має точно такі самі проблеми, як і Markdown.
> Крім того, HTML споживає значно більше токенів, що є зайвою витратою.

Тож... що тепер?

На жаль, гарного рішення немає.
Проте ось кілька ідей:

- Попросіть вашу LLM виводити текст без форматування.
- Сподівайтеся, що ваша LLM не помилиться у генеруванні Markdown, і просто повторіть запит зі звичайним текстом, якщо це не вдасться.
- Використовуйте HTML-форматування і сподівайтеся, що це трохи покращить ситуацію.
- Напишіть власний [перетворювач](../advanced/transformers), який автоматично повторюватиме невдалі запити.
- Використовуйте потоковий парсер Markdown і створіть власні масиви [`MessageEntity`](https://core.telegram.org/bots/api#messageentity) для форматування кожного [`MessageDraftPiece`](/ref/stream/messagedraftpiece).
- Передавайте Markdown у вигляді звичайного тексту, а потім застосовуйте форматування за допомогою звичайного парсера Markdown лише після завершення потокової передачі та надсилання всіх повідомлень.
- Придумайте геніальне рішення, про яке ніхто ще не здогадався, і розкажіть нам про нього у [груповому чаті](https://t.me/grammyjs).

## Загальні відомості про плагін

- Назва: `stream`
- [Джерело](https://github.com/grammyjs/stream)
- [Довідка](/ref/stream/)
