# Хостинг: Cloudflare Workers

[Cloudflare Workers](https://workers.cloudflare.com/) - це загальнодоступна безсерверна обчислювальна платформа, яка пропонує зручне та просте рішення для запуску JavaScript на [межі мережі](https://en.wikipedia.org/wiki/Edge_computing).
Маючи здатність обробляти HTTP трафік та базуючись на [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), розробка ботів Telegram стає легкою справою.
Крім того, ви можете розробляти [вебдодатки](https://core.telegram.org/bots/webapps) на межі мережі, і все це безкоштовно у межах певних лімітів.

Цей посібник допоможе вам розмістити вашого бота Telegram на Cloudflare Workers.

## Передумови

Щоб продовжити, переконайтеся, що у вас є [обліковий запис Cloudflare](https://dash.cloudflare.com/login) з [налаштованим](https://dash.cloudflare.com/?account=workers) піддоменом worker'ів.

## Налаштування

Спочатку створіть новий проєкт:

```sh
npx wrangler generate my-bot
```

Ви можете змінити `my-bot` на будь-що інше.
Це буде назвою вашого бота та каталогу проєкту.

Після запуску вищезазначеної команди слідуйте інструкціям, які ви бачите, щоб ініціалізувати проєкт.
Там ви можете вибрати між JavaScript або TypeScript.

Коли проєкт ініціалізовано, виконайте команду `cd my-bot` або перейдіть в каталог проєкту, який ви ініціалізували.
В залежності від того, як ви ініціалізували проєкт, ви повинні побачити структуру файлів, схожу на таку:

```asciiart:no-line-numbers
.
├── node_modules
├── package.json
├── package-lock.json
├── src
│   ├── index.js
│   └── index.test.js
└── wrangler.toml
```

Далі встановіть `grammy` та інші пакети, які вам можуть знадобитись:

```sh
npm install grammy
```

## Створення вашого бота

Відредагуйте `src/index.js` або `src/index.ts` та напишіть такий код всередині:

```ts
// Зверніть увагу, що ми імпортуємо з 'grammy/web', а не з 'grammy'.
import { Bot, webhookCallback } from "grammy/web";

// Наступний рядок коду передбачає, що ви налаштували секрети BOT_TOKEN та BOT_INFO.
// Дивіться https://developers.cloudflare.com/workers/platform/environment-variables/#secrets-on-deployed-workers
// BOT_INFO отримуємо за допомогою `bot.api.getMe()`.
const bot = new Bot(BOT_TOKEN, { botInfo: BOT_INFO });

bot.command("start", async (ctx) => {
  await ctx.reply("Привіт, світ!");
});

addEventListener("fetch", webhookCallback(bot, "cloudflare"));
```

Вищезазначений бот відповідає "Привіт, світ!", коли отримує `/start`.

## Розгортання вашого бота

Перед розгортанням нам потрібно відредагувати файл `wrangler.toml`:

```toml
account_id = 'ідентифікатор облікового запису' # Отримайте його з панелі керування Cloudflare.
name = 'my-bot' # Назва вашого бота, яка зʼявиться в URL-адресі вебхука: https://my-bot.my-subdomain.workers.dev
main = "src/index.js"  # Основний файл робітника.
compatibility_date = "2023-01-16"
```

Після цього ви можете розгорнути за допомогою наступної команди:

```sh
npm run deploy
```

## Встановлення вашого вебхуку

Нам потрібно повідомити Telegram, куди надсилати оновлення.
Відкрийте свій браузер і відвідайте цей URL:

```text
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<MY_BOT>.<MY_SUBDOMAIN>.workers.dev/
```

Замініть `<BOT_TOKEN>`, `<MY_BOT>` та `<MY_SUBDOMAIN>` своїми значеннями.
Якщо налаштування пройшло успішно, ви побачите JSON-відповідь, схожу на цю:

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

## Тестування вашого бота

Відкрийте свою програму Telegram та запустіть свого бота.
Якщо він відповідає, це означає, що все працює!

## Відлагодження вашого бота

Для тестування та відлагодження бота ви можете запустити локальний або віддалений сервер розробки перед розгортанням бота в продакшн.
Просто запустіть наступну команду:

```sh
npm run start
```

Після запуску сервера розробки ви можете протестувати свого бота, надсиланням зразкових оновлень до нього за допомогою інструментів, таких як `curl`, [Insomnia](https://insomnia.rest) або [Postman](https://postman.com).
Для прикладів оновлень зверніться [сюди](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates), а для отримання додаткової інформації про структуру оновлень зверніться [сюди](https://core.telegram.org/bots/api#update).
