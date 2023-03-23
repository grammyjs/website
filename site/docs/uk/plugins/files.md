# Спрощена обробка файлів у grammY (`files`)

Цей плагін дозволяє легко завантажувати файли з серверів Telegram, а також отримувати URL-адресу, щоб ви могли завантажити файл самостійно.

## Завантаження файлів

Вам потрібно передати токен бота цьому плагіну, оскільки він повинен автентифікуватися як ваш бот, коли завантажує файли.
Потім цей плагін встановлює метод `download` на результати виклику `getFile`.
Наприклад:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context } from "grammy";
import { FileFlavor, hydrateFiles } from "@grammyjs/files";

// Трансформуючий flavor для контексту
type MyContext = FileFlavor<Context>;

// Створюємо бота.
const bot = new Bot<MyContext>("");

// Використовуємо плагін.
bot.api.config.use(hydrateFiles(bot.token));

// Завантажуємо відео та GIF у тимчасові місця розташування.
bot.on([":video", ":animation"], async (ctx) => {
  // Готуємо файл до завантаження.
  const file = await ctx.getFile();
  // Завантажуємо файл у тимчасове місце розташування.
  const path = await file.download();
  // Виводимо шлях до файлу.
  console.log("Файл збережено за шляхом ", path);
});
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
import { Bot } from "grammy";
import { hydrateFiles } from "@grammyjs/files";

// Створюємо бота.
const bot = new Bot("");

// Використовуємо плагін.
bot.api.config.use(hydrateFiles(bot.token));

// Завантажуємо відео та GIF у тимчасові місця розташування.
bot.on([":video", ":animation"], async (ctx) => {
  // Готуємо файл до завантаження.
  const file = await ctx.getFile();
  // Завантажуємо файл у тимчасове місце розташування.
  const path = await file.download();
  // Виводимо шлях до файлу.
  console.log("Файл збережено за шляхом ", path);
});
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  FileFlavor,
  hydrateFiles,
} from "https://deno.land/x/grammy_files/mod.ts";

// Трансформуючий flavor для контексту
type MyContext = FileFlavor<Context>;

// Створюємо бота.
const bot = new Bot<MyContext>("");

// Використовуємо плагін.
bot.api.config.use(hydrateFiles(bot.token));

// Завантажуємо відео та GIF у тимчасові місця розташування.
bot.on([":video", ":animation"], async (ctx) => {
  // Готуємо файл до завантаження.
  const file = await ctx.getFile();
  // Завантажуємо файл у тимчасове місце розташування.
  const path = await file.download();
  // Виводимо шлях до файлу.
  console.log("Файл збережено за шляхом ", path);
});
```

</CodeGroupItem>
</CodeGroup>

Якщо ви не хочете створювати тимчасовий файл, ви можете передати методу `download` рядок із шляхом до файлу.
Просто виконайте `await file.download("/шлях/до/файлу")`.

Якщо ви хочете отримати лише URL-адресу файлу, щоб завантажити його самостійно, використовуйте `file.getUrl`.
Він поверне посилання HTTPS на ваш файл, яке буде дійсним протягом принаймні однієї години.

## Локальний сервер Bot API

Якщо ви використовуєте [локальний сервер Bot API](https://core.telegram.org/bots/api#using-a-local-bot-api-server), то виклик `getFile` вже фактично завантажує файл на ваш диск.

У свою чергу, ви можете викликати `file.getUrl()`, щоб отримати доступ до шляху цього файлу.
Зверніть увагу, що `await file.download()` тепер просто копіює наявний локальний файл у тимчасове місце розташування або за вказаним шляхом, якщо його було вказано.

## Підтримка викликів `bot.api`

За замовчуванням результати `await bot.api.getFile()` також матимуть методи `download` та `getUrl`.
Однак це не відображатиметься у типах.
Якщо вам потрібно їх викливати, вам також варто встановити [flavor для API](../advanced/transformers.md#flavor-для-api) з назвою `FileApiFlavor` на обʼєкті бота:

<CodeGroup>
  <CodeGroupItem title="Node.js" active>

```ts
import { Api, Bot, Context } from "grammy";
import { FileApiFlavor, FileFlavor, hydrateFiles } from "@grammyjs/files";

type MyContext = FileFlavor<Context>;
type MyApi = FileApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");
// ...
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
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

</CodeGroupItem>
</CodeGroup>

## Загальні відомості про плагін

- Назва: `files`
- Джерело: <https://github.com/grammyjs/files>
- Довідка: <https://deno.land/x/grammy_files/mod.ts>
