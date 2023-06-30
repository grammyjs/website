# Спрощена обробка файлів у grammY (`files`)

Цей плагін дозволяє легко завантажувати файли з серверів Telegram, а також отримувати URL-адресу, щоб ви могли завантажити файл самостійно.

## Завантаження файлів

Вам потрібно передати токен бота цьому плагіну, оскільки він повинен автентифікуватися як ваш бот, коли завантажує файли.
Потім цей плагін встановлює метод `download` на результати виклику `getFile`.
Наприклад:

::: code-group

```ts [TypeScript]
import { Bot, Context } from "grammy";
import { FileFlavor, hydrateFiles } from "@grammyjs/files";

// Перетворювальний розширювач для контексту
type MyContext = FileFlavor<Context>;

// Створюємо бота.
const bot = new Bot<MyContext>("");

// Використовуємо плагін.
bot.api.config.use(hydrateFiles(bot.token));

// Завантажуємо відео та GIF у тимчасове сховище.
bot.on([":video", ":animation"], async (ctx) => {
  // Готуємо файл до завантаження.
  const file = await ctx.getFile();
  // Завантажуємо файл у тимчасове сховище.
  const path = await file.download();
  // Виводимо шлях до файлу.
  console.log("Файл збережено за шляхом ", path);
});
```

```js [JavaScript]
import { Bot } from "grammy";
import { hydrateFiles } from "@grammyjs/files";

// Створюємо бота.
const bot = new Bot("");

// Використовуємо плагін.
bot.api.config.use(hydrateFiles(bot.token));

// Завантажуємо відео та GIF у тимчасове сховище.
bot.on([":video", ":animation"], async (ctx) => {
  // Готуємо файл до завантаження.
  const file = await ctx.getFile();
  // Завантажуємо файл у тимчасове сховище.
  const path = await file.download();
  // Виводимо шлях до файлу.
  console.log("Файл збережено за шляхом ", path);
});
```

```ts [Deno]
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  FileFlavor,
  hydrateFiles,
} from "https://deno.land/x/grammy_files/mod.ts";

// Перетворювальний розширювач для контексту
type MyContext = FileFlavor<Context>;

// Створюємо бота.
const bot = new Bot<MyContext>("");

// Використовуємо плагін.
bot.api.config.use(hydrateFiles(bot.token));

// Завантажуємо відео та GIF у тимчасове сховище.
bot.on([":video", ":animation"], async (ctx) => {
  // Готуємо файл до завантаження.
  const file = await ctx.getFile();
  // Завантажуємо файл у тимчасове сховище.
  const path = await file.download();
  // Виводимо шлях до файлу.
  console.log("Файл збережено за шляхом ", path);
});
```

:::

Ви можете передати методу `download` рядок із шляхом для зберігання файлу, якщо не хочете створювати тимчасовий файл.
Просто виконайте `await file.download("/шлях/до/файлу")`.

Якщо ви хочете отримати лише URL-адресу файлу, щоб завантажити його самостійно, використовуйте `file.getUrl`.
Цей метод поверне посилання HTTPS на ваш файл, яке буде дійсним протягом принаймні однієї години.

## Локальний сервер Bot API

Якщо ви використовуєте [локальний сервер Bot API](https://core.telegram.org/bots/api#using-a-local-bot-api-server), то виклик `getFile` вже фактично завантажує файл на ваш диск.

У свою чергу, ви можете викликати `file.getUrl()`, щоб отримати доступ до шляху цього файлу.
Зверніть увагу, що `await file.download()` тепер просто копіює наявний локальний файл у тимчасове місце розташування або за вказаним шляхом, якщо його було вказано.

## Підтримка викликів `bot.api`

Результати `await bot.api.getFile()` також матимуть типові методи `download` та `getUrl`.
Однак це не відображатиметься у типах.
Якщо вам потрібно їх викликати, вам також варто встановити [розширювач для API](../advanced/transformers#розширювач-для-api) з назвою `FileApiFlavor` на обʼєкті бота:

::: code-group

```ts [Node.js]
import { Api, Bot, Context } from "grammy";
import { FileApiFlavor, FileFlavor, hydrateFiles } from "@grammyjs/files";

type MyContext = FileFlavor<Context>;
type MyApi = FileApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");
// ...
```

```ts [Deno]
import { Api, Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  FileApiFlavor,
  FileFlavor,
  hydrateFiles,
} from "https://deno.land/x/grammy_files/mod.ts";

type MyContext = FileFlavor<Context>;
type MyApi = FileApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");
// ...
```

:::

## Загальні відомості про плагін

- Назва: `files`
- Джерело: <https://github.com/grammyjs/files>
- Довідка: <https://deno.land/x/grammy_files/mod.ts>
