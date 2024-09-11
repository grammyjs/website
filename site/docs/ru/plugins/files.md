---
prev: false
next: false
---

# Упрощенная работа с файлами в grammY (`files`)

Этот плагин позволяет легко загружать файлы с серверов Telegram, а также получать URL-адрес, чтобы вы могли скачать файл самостоятельно.

> [Помните](../guide/files) как работают файлы и как их загружать.

## Скачивание файлов

Вам нужно передать токен вашего бота этому плагину, потому что он должен аутентифицироваться как ваш бот, когда загружает файлы.
Затем этот плагин устанавливает метод `download` на результаты вызова `getFile`.
Пример:

::: code-group

```ts [TypeScript]
import { Bot, Context } from "grammy";
import { FileFlavor, hydrateFiles } from "@grammyjs/files";

// Трансформирующий расширитель контекста
type MyContext = FileFlavor<Context>;

// Создайте бота.
const bot = new Bot<MyContext>("");

// Используйте плагин.
bot.api.config.use(hydrateFiles(bot.token));

// Загружайте видео и GIF-файлы во временные локации
bot.on([":video", ":animation"], async (ctx) => {
  // Подготовьте файл к загрузке.
  const file = await ctx.getFile();
  // Загрузите файл во временную локацию
  const path = await file.download();
  // Выведите путь к файлу.
  console.log("Файл сохранён в ", path);
});
```

```js [JavaScript]
import { Bot } from "grammy";
import { hydrateFiles } from "@grammyjs/files";

// Создайте бота.
const bot = new Bot("");

// Используйте плагин.
bot.api.config.use(hydrateFiles(bot.token));

// Загружайте видео и GIF-файлы во временные локации
bot.on([":video", ":animation"], async (ctx) => {
  // Подготовьте файл к загрузке.
  const file = await ctx.getFile();
  // Загрузите файл во временную локацию
  const path = await file.download();
  // Выведите путь к файлу.
  console.log("Файл сохранён в ", path);
});
```

```ts [Deno]
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  FileFlavor,
  hydrateFiles,
} from "https://deno.land/x/grammy_files/mod.ts";

// Трансформирующий расширитель контекста
type MyContext = FileFlavor<Context>;

// Создайте бота.
const bot = new Bot<MyContext>("");

// Используйте плагин.
bot.api.config.use(hydrateFiles(bot.token));

// Загружайте видео и GIF-файлы во временные локации
bot.on([":video", ":animation"], async (ctx) => {
  // Подготовьте файл к загрузке.
  const file = await ctx.getFile();
  // Загрузите файл во временную локацию
  const path = await file.download();
  // Выведите путь к файлу.
  console.log("Файл сохранён в ", path);
});
```

:::

Вы можете передать строку с путем к файлу в `download`, если не хотите создавать временный файл.
Просто сделайте `await file.download("/path/to/file")`.

Если вам нужно получить только URL-адрес файла, чтобы вы могли скачать его самостоятельно, используйте `file.getUrl`.
Это вернет HTTPS ссылку на ваш файл, которая будет действительна в течение как минимум одного часа.

## Локальный API сервер бота

Если вы используете [локальный сервер Bot API](https://core.telegram.org/bots/api#using-a-local-bot-api-server), то вызов `getFile` фактически уже загружает файл на ваш диск.

В свою очередь, вы можете вызвать `file.getUrl()` для доступа к этому пути к файлу.
Обратите внимание, что `await file.download()` теперь просто скопирует этот локально присутствующий файл во временное место (или по заданному пути, если он указан).

## Поддержка вызовов `bot.api`

По умолчанию результаты `await bot.api.getFile()` будут также оснащены методами `download` и `getUrl`.
Однако это не отражено в типах.
Если вам нужны эти вызовы, вы должны также установить [расширители API](../advanced/transformers#расширитель-api) на объект бота под названием `FileApiFlavor`:

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

## Краткая информация о плагине

- Название: `files`
- [Исходник](https://github.com/grammyjs/files)
- [Ссылка](/ref/files/)
