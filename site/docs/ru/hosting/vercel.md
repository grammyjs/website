---
prev: false
next: false
---

# Хостинг: Vercel Serverless Functions

В этом руководстве вы узнаете, как развернуть своего бота на [Vercel](https://vercel.com/) с помощью [Vercel Serverless Functions](https://vercel.com/docs/functions), предполагая, что у вас уже есть аккаунт [Vercel](https://vercel.com).

## Структура проекта

Единственным условием для начала работы с **Vercel Serverless Functions** является перемещение вашего кода в директорию `api/`, как показано ниже.
Вы также можете посмотреть [документацию Vercel](https://vercel.com/docs/functions/quickstart), чтобы узнать больше об этом.

```asciiart:no-line-numbers
.
├── node_modules/
├── build/
├── api/
│   └── bot.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

Если вы используете TypeScript, вы можете установить `@vercel/node` в качестве dev-зависимости, но это не обязательно для выполнения данного руководства.

## Настройка Vercel

Следующим шагом будет создание файла `vercel.json` на верхнем уровне вашего проекта.
Для нашего примера структуры его содержимое будет таким:

```json
{
  "functions": {
    "api/bot.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

> Если вы хотите использовать бесплатную подписку Vercel, ваши конфигурации `memory` и `maxDuration` могут выглядеть так, как указано выше, чтобы не обходить ограничения.

Если вы хотите узнать больше о конфигурационном файле `vercel.json`, смотрите [его документацию](https://vercel.com/docs/project-configuration).

## Настройка TypeScript

В нашем `tsconfig.json` мы должны указать выходной каталог как `build/`, а корневой каталог как `api/`.
Это важно, поскольку мы будем указывать их в опциях развертывания Vercel.

```json{5,8}
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "commonjs",
    "rootDir": "./api",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "outDir": "./build",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

## Главный файл

Независимо от использования TypeScript или JavaScript, у нас должен быть исходный файл, через который запускается наш бот.
Он должен выглядеть примерно так:

```ts
import { Bot, webhookCallback } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN не установлен");

const bot = new Bot(token);

export default webhookCallback(bot, "https");
```

::: tip [Vercel Edge Functions](https://vercel.com/docs/functions) обеспечивает ограниченную поддержку grammY
Вы все еще можете использовать основной пакет grammY и ряд плагинов, но другие могут быть несовместимы из-за зависимостей только от Node.js, которые могут не поддерживаться Vercel [Edge Runtime](https://edge-runtime.vercel.app).

В настоящее время у нас нет полного списка совместимых плагинов, поэтому вам нужно проверить это самостоятельно.

Добавьте эту строку к приведенному выше сниппету, если вы хотите перейти на Edge Functions:

```ts
import { Bot, webhookCallback } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN не назначен");

const bot = new Bot(token);

export const config = {
  runtime: "edge",
};

export default webhookCallback(bot, "std/http");
```

:::

## В Vercel Dashboard

Предполагая, что у вас уже есть аккаунт Vercel, к которому подключен GitHub, добавьте новый проект и выберите репозиторий вашего бота.
В разделе _Build & Development Settings_:

- Output directory: `build`
- Install command: `npm install`

Не забудьте добавить секреты, такие как токен вашего бота, в качестве переменных окружения в настройках.
Как только вы это сделаете, вы сможете развернуть его!

## Настройка вебхука

Последний шаг --- подключение приложения Vercel к Telegram.
Измените приведенный ниже URL на свои учетные данные и зайдите на него через браузер:

```text
https://api.telegram.org/bot<токен>/setWebhook?url=<URL_ХОСТА>
```

С `URL_ХОСТА` все немного сложнее, потому что вам нужно использовать ваш **домен приложения Vercel с маршрутом к коду бота**, например `https://appname.vercel.app/api/bot`.
Где `bot` ссылается на ваш файл `bot.ts` или `bot.js`.

После этого вы увидите следующий ответ:

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

Поздравляем!
Теперь ваш бот должен быть запущен.
