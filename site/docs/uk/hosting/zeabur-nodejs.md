---
prev: false
next: false
---

# Хостинг: Zeabur (Node.js)

[Zeabur](https://zeabur.com) --- це платформа, яка дозволяє легко розгортати full-stack застосунки.
Zeabur підтримує різні мови програмування та фреймворки, зокрема Node.js та grammY.

У цьому посібнику ви дізнаєтеся, як розгорнути своїх ботів grammY за допомогою Node.js на [Zeabur](https://zeabur.com).

::: tip Шукаєте версію для Deno?
Цей посібник пояснює, як розгорнути бота Telegram на Zeabur за допомогою Node.js.
Якщо ви шукаєте версію для Deno, перегляньте [цей посібник](./zeabur-deno).
:::

## Передумови

Щоб слідувати посібнику, вам потрібно мати облікові записи [GitHub](https://github.com) та [Zeabur](https://zeabur.com).

### Спосіб 1: створення нового проєкту з нуля

Ініціалізуйте ваш проєкт та встановіть деякі необхідні залежності:

```sh
# Ініціалізуємо проєкт.
mkdir grammy-bot
cd grammy-bot
npm init -y

# Встановлюємо головні залежності.
npm install grammy

# Встановлюємо залежності для розробки.
npm install -D typescript ts-node @types/node

# Ініціалізуємо TypeScript.
npx tsc --init
```

Потім перейдіть до каталогу `src/` і створіть файл з назвою `bot.ts`.
У ньому ви будете писати код вашого бота.

Тепер ви можете почати писати код вашого бота в `src/bot.ts`.

```ts
import { Bot } from "grammy";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("TELEGRAM_BOT_TOKEN не встановлено");

const bot = new Bot(token);

bot.on("message:text", async (ctx) => {
  console.log("Повідомлення: ", ctx.message.text);

  const response = "Привіт, я бот!";

  await ctx.reply(response);
});

bot.start();
```

> Примітка: отримайте токен бота за допомогою [@BotFather](https://t.me/BotFather) в Telegram і встановіть його як змінну оточення `TELEGRAM_BOT_TOKEN` в Zeabur.
>
> Ви можете ознайомитися з [цим посібником](https://zeabur.com/docs/deploy/variables) щодо налаштування змінних середовища в Zeabur.

Тепер кореневий каталог вашого проєкту має виглядати так:

```asciiart:no-line-numbers
.
├── node_modules/
├── src/
│   └── bot.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

Далі нам потрібно додати до нашого `package.json` скрипт `start`.
Тепер наш `package.json` має виглядати приблизно так:

```json
{
  "name": "telegram-bot-starter",
  "version": "1.0.0",
  "description": "Telegram Bot Starter with TypeScript and grammY",
  "scripts": {
    "start": "ts-node src/bot.ts" // [!code focus]
  },
  "author": "MichaelYuhe",
  "license": "MIT",
  "dependencies": {
    "grammy": "^1.21.1"
  },
  "devDependencies": {
    "@types/node": "^20.14.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.5"
  }
}
```

Тепер ви можете запустити бота локально за допомогою наступної команди:

```sh
npm run start
```

### Спосіб 2: використання шаблону Zeabur

Zeabur вже надає шаблон, який ви можете використовувати.
Ви можете знайти його [тут](https://github.com/zeabur/deno-telegram-bot-starter).

Ви можете просто скористатися шаблоном і почати писати код свого бота.

## Розгортання

### Спосіб 1: розгортання з GitHub на інформаційній панелі Zeabur

1. Створіть репозиторій на GitHub (він може бути публічним або приватним) і завантажте туди свій код.
2. Перейдіть на [інформаційну панель Zeabur](https://dash.zeabur.com).
3. Натисніть на кнопку `New Project`, потім на кнопку `Deploy New Service`, виберіть `GitHub` як джерело і виберіть свій репозиторій.
4. Перейдіть на вкладку `Variables`, щоб додати ваші змінні оточення, як-от `TELEGRAM_BOT_TOKEN`.
5. Ваш сервіс буде розгорнуто автоматично.

### Спосіб 2: розгортання за допомогою Zeabur CLI

Перейдіть в каталог вашого проєкту і виконайте наступну команду:

```sh
npx @zeabur/cli deploy
```

Дотримуйтесь інструкцій, щоб вибрати регіон для розгортання, і ваш бот буде розгорнутий автоматично.
