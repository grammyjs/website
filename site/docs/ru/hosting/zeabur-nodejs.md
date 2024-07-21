---
prev: false
next: false
---

# Хостинг: Zeabur (Node.js)

[Zeabur](https://zeabur.com) --- это платформа, позволяющая с легкостью развертывать полнофункциональные приложения.
Она поддерживает различные языки программирования и фреймворки, включая Node.js и grammY.

В этом руководстве вы узнаете, как развернуть бота grammY с Node.js на [Zeabur](https://zeabur.com).

::: tip Ищете версию Deno?
В этом руководстве объясняется, как развернуть Telegram-бота на Zeabur с помощью Node.js.
Если вы ищете версию Deno, пожалуйста, посмотрите [эту страницу](./zeabur-deno) вместо этого.
:::

## Необходимые условия

Чтобы следить за этим, вам необходимо иметь аккаунты [GitHub](https://github.com) и [Zeabur](https://zeabur.com).

### Метод 1: Создайте новый проект с нуля

Инициализируйте ваш проект и установите некоторые необходимые зависимости:

```sh
# Инициализируйте проект.
mkdir grammy-bot
cd grammy-bot
npm init -y

# Установите основные зависимости.
npm install grammy

# Установите зависимости для разработки.
npm install -D typescript ts-node @types/node

# Инициализируйте TypeScript.
npx tsc --init
```

Затем `cd` в `src/` и создайте файл с именем `bot.ts`.
В нем вы будете писать код вашего бота.

Теперь вы можете начать писать код бота в `src/bot.ts`.

```ts
import { Bot } from "grammy";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("TELEGRAM_BOT_TOKEN не установлен");

const bot = new Bot(token);

bot.on("message:text", async (ctx) => {
  console.log("Сообщение: ", ctx.message.text);

  const response = "Привет, я бот!";

  await ctx.reply(response);
});

bot.start();
```

> Примечание: Получите токен бота с помощью [@BotFather](https://t.me/BotFather) в Telegram и установите его в качестве переменной окружения `TELEGRAM_BOT_TOKEN` в Zeabur.
> Вы можете ознакомиться с [этим руководством](https://zeabur.com/docs/deploy/variables) по настройке переменных окружения в Zeabur.

Теперь корневая директория вашего проекта должна выглядеть следующим образом:

```asciiart:no-line-numbers
.
├── node_modules/
├── src/
│   └── bot.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

А затем нам нужно добавить скрипты `start` в наш `package.json`.
Теперь наш `package.json` должен быть похож на этот:

```json
{
  "name": "telegram-bot-starter",
  "version": "1.0.0",
  "description": "Стартовый бот Telegram с TypeScript и grammY",
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

Теперь вы можете запустить своего бота локально, выполнив команду:

```sh
npm run start
```

### Method 2: Use Zeabur's Template

Zeabur has already provided a template for you to use.
You can find it [here](https://github.com/zeabur/telegram-bot-starter).

You can just use the template and start writing your bot's code.

## Deploying

### Method 1: Deploy From GitHub in Zeabur's Dashboard

1. Create a repository on GitHub, it can be public or private and push your code to it.
2. Go to [Zeabur dashboard](https://dash.zeabur.com).
3. Click on the `New Project` button, and click on the `Deploy New Service` button, choose `GitHub` as the source and select your repository.
4. Go to `Variables` tab to add your environment variables like `TELEGRAM_BOT_TOKEN`.
5. Your service will be deployed automatically.

### Method 2: Deploy With Zeabur CLI

`cd` into your project directory and run the following command:

```sh
npx @zeabur/cli deploy
```

Follow the instructions to select a region to deploy, and your bot will be deployed automatically.
