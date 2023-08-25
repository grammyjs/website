---
prev: false
next: false
---

# Хостинг: Cyclic

У цьому посібнику ви дізнаєтеся, як розмістити ваших ботів на grammY на [Cyclic](https://cyclic.sh).

## Передумови

Щоб почати, вам потрібно мати обліковий запис [Github](https://github.com) та [Cyclic](https://cyclic.sh).
Спочатку ініціалізуйте ваш проєкт та встановіть деякі залежності:

```sh
# Ініціалізуємо проєкт.
mkdir grammy-bot
cd grammy-bot
npm init -y

# Встановлюємо основні залежності.
npm install grammy express dotenv

# Встановлюємо залежності для розробки.
npm install -D typescript ts-node nodemon @types/express @types/node

# Ініціалізуємо конфіг TypeScript.
npx tsc --init
```

Ми зберігатимемо наші файли TypeScript у каталозі `src/`, а скомпільовані файли --- у каталозі `dist/`.
Після створення обох каталогів перейдіть до каталогу `src/` і створіть файл з назвою `bot.ts`.
Тепер кореневий каталог вашого проекту має виглядати так:

```asciiart:no-line-numbers
.
├── node_modules/
├── dist/
├── src/
│   └── bot.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

Потім відкрийте `tsconfig.json` і перепишіть його вміст, щоб використовувати наступну конфігурацію:

```json
{
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true
  }
}
```

Після цього ви повинні додати до вашого `package.json` скрипти `start`, `build` і `dev`.
Тепер ваш `package.json` має виглядати приблизно так:

```json{6-10}
{
  "name": "grammy-bot",
  "version": "1.0.0",
  "description": "",
  "main": "dist/bot.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/bot.js",
    "dev": "nodemon src/bot.ts"
  },
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "grammy": "^1.17.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.4.9",
    "typescript": "^5.1.6",
    "nodemon": "^3.0.1",
    "ts-node": "^10.9.1"
  },
  "keywords": []
}
```

### Вебхуки

Відкрийте файл `src/bot.ts` і запишіть до нього наступний вміст:

```ts{15}
import express from "express";
import { Bot, webhookCallback } from "grammy";
import "dotenv/config";

const bot = new Bot(process.env.BOT_TOKEN || "");

bot.command("start", (ctx) => ctx.reply("Привіт, світ!"))

if (process.env.NODE_ENV === "DEVELOPMENT") {
  bot.start();
} else {
  const port = process.env.PORT || 3000;
  const app = express();
  app.use(express.json());
  app.use(`/${bot.token}`, webhookCallback(bot, "express"));
  app.listen(port, () => console.log(`Прослуховується порт ${port}`));
}
```

Ми рекомендуємо розміщувати обробник вебхука на секретному шляху, а не на `/`.
Як показано у виділеному рядку вище, ми використовуємо `/<токен-бота>` замість простого `/`.

### Локальна розробка

Створіть файл `.env` у корені вашого проєкту з наступним вмістом:

```
BOT_TOKEN=<токен-бота>
NODE_ENV=DEVELOPMENT
```

Після цього запустіть ваш скрипт `dev`:

```sh
npm run dev
```

Nodemon стежитиме за вашим файлом `bot.ts` і перезапускатиме бота при кожній зміні коду.

## Розгортання

1. Створіть репозиторій на GitHub, він може бути як приватним, так і публічним.
2. Завантажте свій код.

> Рекомендується мати одну стабільну гілку і виконувати тестування в окремих гілках, щоб не допустити непередбачуваної поведінки у продакшні.

1. Відвідайте свою [панель керування Cyclic](https://app.cyclic.sh).
2. Натисніть "Link Your Own" і виберіть свій репозиторій.
3. Перейдіть в "Advanced" > "Variables" і додайте свій `BOT_TOKEN`.
4. Розгорніть свого бота, натиснувши "Connect Cyclic".

### Встановлення URL-адреси вебхука

Якщо ви використовуєте вебхуки, після першого розгортання вам слід налаштувати параметри вебхука, щоб він вказував на ваш застосунок.
Для цього надішліть запит на адресу

```text
https://api.telegram.org/bot<токен-бота>/setWebhook?url=<адреса>
```

замінивши `<токен-бота>` на токен вашого бота, а `<адреса>` --- на повну URL-адресу вашого застосунку разом з шляхом до обробника вебхуків.

Вітаємо!
Тепер ваш бот має бути готовий до роботи.
