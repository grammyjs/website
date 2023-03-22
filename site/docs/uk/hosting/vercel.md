# Хостинг: Vercel Serverless Functions

У цьому посібнику ви дізнаєтесь, як розгорнути свого бота на [Vercel](https://vercel.com/) за допомогою [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions), передбачається, що у вас вже є обліковий запис [Vercel](https://vercel.com).

## Структура проєкту

Єдиним передумовою для початку роботи з **Vercel Serverless Functions** є переміщення вашого коду до каталогу `api/`, як показано нижче.
Ви також можете переглянути [документацію Vercel](https://vercel.com/docs/concepts/functions/serverless-functions#deploying-serverless-functions) для отримання додаткової інформації.

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

Якщо ви використовуєте TypeScript, то вам, напевно, захочеться встановити `@vercel/node` як dev-залежність, але це необовʼязково для слідування цьому посібнику.

## Налаштування Vercel

Наступним кроком є створення файлу `vercel.json` на верхньому рівні вашого проєкту.
Для нашої структури прикладу, його вміст буде:

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

> Якщо ви хочете використовувати безкоштовний тарифний план Vercel, ваші конфігурації `memory` та `maxDuration` можуть бути схожими з тими, що наведені вище, щоб не обмежувати їх обмеженнями.

Якщо ви хочете дізнатися більше про файл конфігурації vercel.json, див. [документацію](https://vercel.com/docs/project-configuration).

## Налаштування TypeScript

У нашому `tsconfig.json` ми повинні вказати наш каталог виведення як `build/`, а наш кореневий каталог як `api/`.
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

Незалежно від того, чи використовуєте ви TypeScript або JavaScript, має бути вихідний файл, через який працює ваш бот. Він має виглядати приблизно так:

```ts
import { Bot, webhookCallback } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN не вказаний");

const bot = new Bot(token);

export default webhookCallback(bot, "http");
```

## В Панелі управління Vercel

Припускаючи, що у вас вже є обліковий запис в Vercel, який підключений до GitHub, додайте новий проєкт та виберіть репозиторій свого бота.
У розділі _Build & Development Settings_:

- Директорія виводу: `build`
- Команда встановлення: `npm install`

Не забудьте додати секрети, такі як токен вашого бота, як змінні середовища в налаштуваннях.
Якщо ви це зробили, ви можете розгорнути свого бота!

## Налаштування Webhook

Наступним кроком є підключення вашого додатку Vercel до Telegram.
Змініть наведену нижче URL-адресу на свої дані авторизації та відвідайте її у своєму браузері:

```md:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=<HOST_URL>
```

The `HOST_URL` is a little tricky, because you need to use your **Vercel app domain following with the route to the bot code**, for example `https://appname.vercel.app/api/bot`.
Where `bot` is referring to your `bot.ts` or `bot.js` file.

`HOST_URL` трохи заплутано, оскільки потрібно використовувати домен вашого додатку **Vercel з маршрутом до коду боту**, наприклад, `https://appname.vercel.app/api/bot`.
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
Ваш бот тепер має запуститись і працювати.
