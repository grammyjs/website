---
prev: false
next: false
---

# Хостинг: Zeabur (Deno)

[Zeabur](https://zeabur.com) --- це платформа, яка дозволяє легко розгортати full-stack застосунки.
Zeabur підтримує різні мови програмування та фреймворки, зокрема Deno та grammY.

У цьому посібнику ви дізнаєтеся, як розгорнути своїх ботів grammY за допомогою Deno на [Zeabur](https://zeabur.com).

::: tip Шукаєте версію для Node.js?
Цей посібник пояснює, як розгорнути бота Telegram на Zeabur за допомогою Deno.
Якщо ви шукаєте версію для Node.js, перегляньте [цей посібник](./zeabur-nodejs).
:::

## Передумови

Щоб слідувати посібнику, вам потрібно мати облікові записи [GitHub](https://github.com) та [Zeabur](https://zeabur.com).

### Спосіб 1: створення нового проєкту з нуля

> Переконайтеся, що на вашому комп'ютері встановлено Deno.

Ініціалізуйте ваш проєкт та встановіть деякі необхідні залежності:

```sh
# Ініціалізуємо проєкт.
mkdir grammy-bot
cd grammy-bot

# Створюємо файл main.ts
touch main.ts

# Створюємо файл deno.json, щоб згенерувати lock-файл
touch deno.json
```

Потім внесіть у `main.ts` наступний код:

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
if (!token) throw new Error("TELEGRAM_BOT_TOKEN не встановлено");

const bot = new Bot(token);

bot.command("start", (ctx) => ctx.reply("Привіт від Deno та grammY!"));

bot.on("message", (ctx) => ctx.reply("Чим я можу вам допомогти?"));

bot.start();
```

> Примітка: отримайте токен бота за допомогою [@BotFather](https://t.me/BotFather) в Telegram і встановіть його як змінну оточення `TELEGRAM_BOT_TOKEN` в Zeabur.
>
> Ви можете ознайомитися з [цим посібником](https://zeabur.com/docs/deploy/variables) щодо налаштування змінних середовища в Zeabur.

Потім виконайте наступну команду, щоб запустити бота:

```sh
deno run --allow-net main.ts
```

Deno автоматично завантажить залежності, згенерує lock-файл і запустить вашого бота.

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
