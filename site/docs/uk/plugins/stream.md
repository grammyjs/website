---
prev: false
next: false
---

# Потокова передача повідомлень (`stream`)

Цей плагін дозволяє потоково передавати довгі текстові повідомлення до Telegram.
Будь-який [ітератор](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) фрагментів рядків може передаватися потоково безпосередньо до будь-якого приватного чату.

Наприклад, ви можете зробити так, щоб відповідь LLM (large language model, велика мовна модель) [зʼявлялася поступово](#інтеграція-з-llm) під час генерування.

## Початок роботи

Плагін додає до [обʼєкта контексту](../guide/context) три методи:

- [`ctx.replyWithStream`](/ref/stream/streamcontextextension#replywithstream): потокова передача звичайного тексту
- [`ctx.replyWithMarkdownStream`](/ref/stream/streamcontextextension#replywithmarkdownstream): потокова передача Markdown (**рекомендовано**)
- [`ctx.replyWithHtmlStream`](/ref/stream/streamcontextextension#replywithhtmlstream): потокова передача HTML

Потокова передача звичайного тексту (перший варіант) надсилає звичайні текстові повідомлення.
Інші два методи використовують [розширені повідомлення](https://core.telegram.org/bots/api#rich-messages) Telegram і рекомендуються для більшості випадків.

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
import { Bot, type Context } from "npm:grammy";
import { autoRetry } from "npm:@grammyjs/auto_retry";
import { stream, type StreamFlavor } from "npm:@grammyjs/stream";

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
    await ctx.replyWithMarkdownStream(textStream);
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
    await ctx.replyWithMarkdownStream(textStream);
  });
```

:::

Не забудьте замінити `gemini-2.5-flash` на найновішу модель.

## Загальні відомості про плагін

- Назва: `stream`
- [Джерело](https://github.com/grammyjs/stream)
- [Довідка](/ref/stream/)
