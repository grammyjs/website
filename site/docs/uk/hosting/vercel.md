---
prev: false
next: false
---

# Хостинг: Vercel Serverless Functions

У цьому посібнику ви дізнаєтесь, як розгорнути свого бота на [Vercel](https://vercel.com/) за допомогою [Vercel Serverless Functions](https://vercel.com/docs/functions); передбачається, що у вас вже є обліковий запис [Vercel](https://vercel.com).

## Структура проєкту

Єдиною передумовою для початку роботи з **Vercel Serverless Functions** є переміщення вашого коду до каталогу `api/`, як показано нижче.
Ви також можете переглянути [документацію Vercel](https://vercel.com/docs/functions/quickstart) для отримання додаткової інформації.

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

Якщо ви використовуєте TypeScript, то вам, напевно, захочеться встановити `@vercel/node` як залежність розробки (`dev dependency`), але це необовʼязково для слідування цьому посібнику.

## Налаштування Vercel

Наступним кроком є створення файлу `vercel.json` на верхньому рівні вашого проєкту.
Для прикладу наданої вище структури його вміст буде наступним:

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

> Якщо ви хочете використовувати безкоштовний тарифний план Vercel, ваші конфігурації `memory` та `maxDuration` мають виглядати так, як показано вище, щоб не виходити за межі безкоштовних лімітів.

Якщо ви хочете дізнатися більше про файл конфігурації `vercel.json`, дивіться [документацію Vercel](https://vercel.com/docs/projects/project-configuration).

## Налаштування TypeScript

У файлі `tsconfig.json` ми повинні вказати каталог виведення збірки як `build/`, а кореневий каталог як `api/`.
Це важливо, оскільки ми будемо вказувати їх у параметрах розгортання Vercel.

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

## Головний файл

Незалежно від того, чи використовуєте ви TypeScript або JavaScript, має бути вихідний файл, через який працює ваш бот.
Він має виглядати приблизно так:

```ts
import { Bot, webhookCallback } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN не вказаний");

const bot = new Bot(token);

export default webhookCallback(bot, "std/http");
```

::: tip [Vercel Edge Functions](https://vercel.com/docs/functions) надає обмежену підтримку grammY
Ви все ще можете використовувати пакет grammY та низку плагінів, але інші плагіни можуть бути несумісними через залежності лише від Node.js, які можуть не підтримуватися в [Edge Runtime](https://edge-runtime.vercel.app) Vercel.

Наразі ми не маємо повного списку сумісних плагінів, тому вам доведеться перевірити це самостійно.

Додайте цей рядок до фрагмента вище, якщо ви хочете переключитися на Edge Functions:

```ts
export const config = {
  runtime: "edge",
};
```

:::

## У панелі керування Vercel

Припускаючи, що у вас вже є обліковий запис у Vercel, який підключений до GitHub, додайте новий проєкт та виберіть репозиторій свого бота.
У розділі _Build & Development Settings_:

- Каталог виведення: `build`
- Команда встановлення: `npm install`

Не забудьте в налаштуваннях додати секрети, як-от токен вашого бота, як змінні середовища.
Якщо ви це зробили, ви можете розгорнути свого бота!

## Налаштування вебхуку

Наступним кроком є підключення вашого застосунку Vercel до Telegram.
Змініть наведену нижче URL-адресу на свої дані авторизації та відвідайте її у своєму браузері:

```text
https://api.telegram.org/bot<токен-бота>/setWebhook?url=<адреса>
```

`<адреса>` потребує особливої уваги, оскільки потрібно використовувати домен вашого **застосунку Vercel з маршрутом до коду бота**: наприклад, `https://appname.vercel.app/api/bot`.
Де `bot` посилається на ваш файл `bot.ts` або `bot.js`.

Після цього ви повинні побачити відповідь, схожу на цю:

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

Вітаємо!
Ваш бот тепер має бути запущений та працювати.
