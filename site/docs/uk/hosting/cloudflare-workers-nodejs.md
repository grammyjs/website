---
prev: false
next: false
---

# Хостинг: Cloudflare Workers (Node.js)

[Cloudflare Workers](https://workers.cloudflare.com) --- це загальнодоступна безсерверна обчислювальна платформа, яка пропонує зручне та просте рішення для запуску JavaScript за допомогою парадигми [кордонних обчислень](https://uk.wikipedia.org/wiki/Кордонні_обчислення).
Маючи здатність обробляти HTTP трафік та базуючись на [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), розробка ботів Telegram стає легкою справою.
Крім того, ви можете розробляти [вебдодатки](https://core.telegram.org/bots/webapps) використовуючи кордонні обчислення, і все це безкоштовно у межах певних лімітів.

Цей посібник допоможе вам розмістити вашого бота Telegram на Cloudflare Workers.

::: tip Шукаєте версію для Deno?
Цей посібник пояснює, як розгорнути бота Telegram на Cloudflare Workers за допомогою Node.js.
Якщо ви шукаєте версію для Deno, перегляньте [цей посібник](./cloudflare-workers).
:::

## Передумови

1. [Обліковий запис Cloudflare](https://dash.cloudflare.com/login) з [налаштованим](https://dash.cloudflare.com/?account=workers) піддоменом worker'ів.
2. Робоче середовище [Node.js](https://nodejs.org/) зі встановленим `npm`.

## Налаштування

Спочатку створіть новий проєкт:

```sh
npm create cloudflare@latest
```

Потім вас попросять ввести імʼя worker'а:

```ansi{6}
using create-cloudflare version 2.17.1

╭ Create an application with Cloudflare Step 1 of 3
│
╰ In which directory do you want to create your application? also used as application name  // [!code focus]
  ./grammybot  // [!code focus]
```

Ось ми створюємо проєкт з назвою `grammybot`, ви можете вибрати власну назву, це буде імʼя вашого worker'а, а також частина URL-адреси запиту.

::: tip
Ви можете згодом змінити імʼя вашого worker'а у `wrangler.toml`.
:::

Далі вам буде запропоновано вибрати тип вашого worker'а, тут ми обираємо `"Hello World" Worker`:

```ansi{8}
using create-cloudflare version 2.17.1
╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./grammybot
│
╰ What type of application do you want to create?  // [!code focus]
  ● "Hello World" Worker  // [!code focus]
  ○ "Hello World" Worker (Python)  // [!code focus]
  ○ "Hello World" Durable Object  // [!code focus]
  ○ Website or web app  // [!code focus]
  ○ Example router & proxy Worker  // [!code focus]
  ○ Scheduled Worker (Cron Trigger)  // [!code focus]
  ○ Queue consumer & producer Worker  // [!code focus]
  ○ API starter (OpenAPI compliant)  // [!code focus]
  ○ Worker built from a template hosted in a git repository  // [!code focus]
```

Далі вам буде запропоновано вибрати, чи хочете ви використовувати TypeScript.
Якщо ви хочете використовувати JavaScript, виберіть `No`.
Ми вибираємо `Yes`:

```ansi{11}
using create-cloudflare version 2.17.1
╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./grammybot
│
├ What type of application do you want to create?
│ type "Hello World" Worker
│
╰ Do you want to use TypeScript?  // [!code focus]
  Yes / No  // [!code focus]
```

Ваш проект буде налаштовано за кілька хвилин.
Після цього вас запитають, чи хочете ви використовувати git для контролю версій.
Виберіть `Yes`, якщо хочете, щоб репозиторій був ініціалізований автоматично, або `No`, якщо ви хочете ініціалізувати його самостійно пізніше.

Ми вибираємо `Yes`:

```ansi{36}
using create-cloudflare version 2.17.1
╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./grammybot
│
├ What type of application do you want to create?
│ type "Hello World" Worker
│
├ Do you want to use TypeScript?
│ yes typescript
│
├ Copying template files
│ files copied to project directory
│
├ Updating name in `package.json`
│ updated `package.json`
│
├ Installing dependencies
│ installed via `npm install`
│
╰ Application created
╭ Configuring your application for Cloudflare Step 2 of 3
│
├ Installing @cloudflare/workers-types
│ installed via npm
│
├ Adding latest types to `tsconfig.json`
│ added @cloudflare/workers-types/2023-07-01
│
├ Retrieving current workerd compatibility date
│ compatibility date 2024-04-05
│
╰ Do you want to use git for version control?  // [!code focus]
  Yes / No  // [!code focus]
```

Нарешті, вас запитають, чи хочете ви розгорнути свого worker'а.
Виберіть `No`, оскільки ми збираємося розгорнути його, коли у нас буде робочий бот Telegram:

```ansi{49}
using create-cloudflare version 2.17.1
╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./grammybot
│
├ What type of application do you want to create?
│ type "Hello World" Worker
│
├ Do you want to use TypeScript?
│ yes typescript
│
├ Copying template files
│ files copied to project directory
│
├ Updating name in `package.json`
│ updated `package.json`
│
├ Installing dependencies
│ installed via `npm install`
│
╰ Application created
╭ Configuring your application for Cloudflare Step 2 of 3
│
├ Installing @cloudflare/workers-types
│ installed via npm
│
├ Adding latest types to `tsconfig.json`
│ added @cloudflare/workers-types/2023-07-01
│
├ Retrieving current workerd compatibility date
│ compatibility date 2024-04-05
│
├ Do you want to use git for version control?
│ yes git
│
├ Initializing git repo
│ initialized git
│
├ Committing new files
│ git commit
│
╰ Application configured
╭ Deploy with Cloudflare Step 3 of 3
│
╰ Do you want to deploy your application?  // [!code focus]
  Yes / No  // [!code focus]
```

## Встановіть залежності

`cd` у `grammybot` (замініть назву каталогу імʼям вашого worker'а, яке ви вказали вище), встановіть `grammy` та інші залежності, які вам можуть знадобитися:

```sh
npm install grammy
```

## Створення вашого бота

Відредагуйте `src/index.js` або `src/index.ts` та напишіть такий код всередині:

```ts{11,28-29,38,40-42,44}
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Bot, Context, webhookCallback } from "grammy";

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
  //
  // Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
  // MY_QUEUE: Queue;
  BOT_INFO: string;
  BOT_TOKEN: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const bot = new Bot(env.BOT_TOKEN, { botInfo: JSON.parse(env.BOT_INFO) });

    bot.command("start", async (ctx: Context) => {
      await ctx.reply("Привіт, світ!");
    });

    return webhookCallback(bot, "cloudflare-mod")(request);
  },
};
```

Тут ми спочатку імпортуємо `Bot`, `Context` і `webhookCallback` з `grammy`.
Всередині інтерфейсу `Env` ми додаємо змінну `BOT_INFO`, це змінна оточення, яка зберігає інформацію про вашого бота.
Ви можете отримати інформацію про бота, викликавши Bot API Telegram за допомогою методу `getMe`.
Відкрийте це посилання у вашому браузері:

```ansi:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/getMe
```

Замініть `<BOT_TOKEN>` на токен вашого бота.
Якщо все пройшло успішно, ви побачите відповідь у форматі JSON, подібну до цієї:

```json{3-12}
{
    "ok": true,
    "result": {
        "id": 1234567890,
        "is_bot": true,
        "first_name": "mybot",
        "username": "MyBot",
        "can_join_groups": true,
        "can_read_all_group_messages": false,
        "supports_inline_queries": true,
        "can_connect_to_business": false
    }
}
```

Тепер відкрийте `wrangler.toml` у корені вашого проєкту і додайте змінну оточення `BOT_INFO` у секцію `[vars]` зі значенням з обʼєкта `result`, яке ви отримали вище, як показано тут:

```toml
[vars]
BOT_INFO = """{
    "id": 1234567890,
    "is_bot": true,
    "first_name": "mybot",
    "username": "MyBot",
    "can_join_groups": true,
    "can_read_all_group_messages": false,
    "supports_inline_queries": true,
    "can_connect_to_business": false
}"""
```

Замініть інформацію бота тим, що ви отримали з браузера.
Зверніть увагу на три подвійні лапки `"""` на початку і в кінці.

На додаток до `BOT_INFO`, ми також додаємо змінну `BOT_TOKEN`, це змінна оточення, яка зберігає токен бота, який використовується для створення бота.

Ви можете помітити, що ми просто визначили змінну `BOT_TOKEN`, але ще не присвоїли їй значення.
Зазвичай ви повинні зберігати змінну оточення у файлі `wrangler.toml`, однак у нашому випадку це небезпечно, оскільки токен бота повинен бути секретним.
Cloudflare Workers надають нам безпечний спосіб зберігати конфіденційну інформацію, як-от ключі API та токени авторизації, у змінній оточення [secrets](https://developers.cloudflare.com/workers/configuration/secrets/#secrets)!

::: tip
Секретні значення не відображаються у Wrangler або інформаційній панелі Cloudflare після того, як ви їх визначили.
:::

Ви можете додати секретну змінну оточення до вашого проєкту за допомогою наступної команди:

```sh
npx wrangler secret put BOT_TOKEN
```

Дотримуйтесь інструкцій і введіть свій токен бота.
Ваш токен бота буде завантажено і зашифровано.

::: tip
Ви можете змінити назву змінних оточення на будь-яку іншу, але памʼятайте, що в наступних кроках вам треба буде так само змінити назву.
:::

Усередині функції `fetch()` ми створюємо бота з `BOT_TOKEN`, який відповідає "Привіт, світ!", коли отримує `/start`.

## Розгортання вашого бота

Тепер ви можете розгорнути свого бота за допомогою наступної команди:

```sh
npm run deploy
```

## Встановлення вашого вебхуку

Нам потрібно повідомити Telegram, куди надсилати оновлення.
Відкрийте свій браузер і відвідайте цей URL:

```ansi:no-line-numbers
https://api.telegram.org/bot<токен-бота>/setWebhook?url=https://<назва-бота>.<піддомен>.workers.dev/
```

Замініть `<BOT_TOKEN>` на токен вашого бота, `<MY_BOT>` на імʼя вашого worker'а, `<MY_SUBDOMAIN>` на субдомен вашого worker'а, налаштований в інформаційній панелі Cloudflare.

Якщо налаштування пройшло успішно, ви побачите відповідь у форматі JSON, схожу на цю:

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

## Тестування вашого бота

Відкрийте свою програму Telegram та запустіть свого бота.
Якщо він відповідає, значить все працює!

## Налагодження вашого бота

Для тестування та налагодження бота ви можете запустити локальний або віддалений сервер розробки перед розгортанням бота у продакшені.

У середовищі розробки ваш бот не має доступу до ваших секретних змінних середовища.
Отже, [згідно з Cloudflare](https://developers.cloudflare.com/workers/configuration/secrets/#secrets-in-development), ви можете створити файл `.dev.vars` у корені вашого проєкту для визначення секретних змінних:

```sh
BOT_TOKEN=<токен_вашого_бота>  # <- замініть це на токен вашого бота
```

Не забудьте також додати `BOT_INFO` для розробки.
Натисніть [тут](https://developers.cloudflare.com/workers/configuration/environment-variables/) і [тут](https://developers.cloudflare.com/workers/configuration/secrets/) для отримання більш детальної інформації про звичайні та секретні змінні середовища.

Замініть `BOT_INFO` і `BOT_TOKEN` своїми значеннями, якщо ви змінили назву змінної оточення на попередньому кроці.

::: tip
Ви можете використовувати інший токен бота для розробки, щоб гарантувати, що це не вплине на продакшн.
:::

Тепер ви можете запустити наступну команду для запуску сервера розробки:

```sh
npm run dev
```

Після запуску сервера розробки ви можете протестувати свого бота, надсилаючи приклади оновлень до нього за допомогою певних інструментів, як-от `curl`, [Insomnia](https://insomnia.rest) або [Postman](https://postman.com).
Для прикладів оновлень зверніться [сюди](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates), а для отримання додаткової інформації про структуру оновлень зверніться [сюди](https://core.telegram.org/bots/api#update).

Якщо ви не хочете створювати оновлення або хочете протестувати з реальним оновленням, ви можете отримати оновлення з Bot API Telegram за допомогою методу `getUpdates`.
Для цього спочатку потрібно видалити вебхук.
Відкрийте браузер і перейдіть за цим посиланням:

```ansi:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/deleteWebhook
```

Замініть `<BOT_TOKEN>` на токен вашого бота. Ви побачите відповідь JSON, подібну до цієї:

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was deleted"
}
```

Потім відкрийте свій клієнт Telegram і надішліть щось боту, наприклад, команду `/start`.

Тепер перейдіть за цим посиланням у вашому браузері, щоб отримати оновлення:

```ansi:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
```

Знову замініть `<BOT_TOKEN>` на токен бота.
Якщо все пройде успішно, ви побачите відповідь JSON, подібну до цієї:

```json{4-29}
{
    "ok": true,
    "result": [
        {
            "update_id": 123456789,
            "message": {
                "message_id": 123,
                "from": {
                    "id": 987654321,
                    "is_bot": false,
                    "first_name": "",
                    "language_code": "en"
                },
                "chat": {
                    "id": 987654321,
                    "first_name": "",
                    "type": "private"
                },
                "date": 1712803046,
                "text": "/start",
                "entities": [
                    {
                        "offset": 0,
                        "length": 6,
                        "type": "bot_command"
                    }
                ]
            }
        }
    ]
}
```

`result` --- це масив обʼєктів оновлення (вище наведено лише один обʼєкт оновлення), вам слід скопіювати лише один обʼєкт і протестувати вашого бота, надіславши цей обʼєкт на сервер розробки за допомогою інструментів, згаданих вище.

Якщо ви хочете ігнорувати застарілі оновлення (наприклад, ігнорувати всі оновлення під час розробки перед розгортанням у продакшн середовищі), ви можете додати параметр `offset` до методу `getUpdates` ось так:

```ansi:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/getUpdates?offset=<update_id>
```

Замініть `<BOT_TOKEN>` на токен вашого бота, а `<update_id>` на `update_id` останнього отриманого вами оновлення (з найбільшим номером), після цього ви будете отримувати тільки оновлення, що надійшли пізніше цього оновлення, і ніколи не зможете отримати більш ранні оновлення.

Тепер ви можете протестувати свого бота з реальними обʼєктами оновлень у вашому локальному середовищі розробки!

Ви також можете відкрити свій локальний сервер розробки для загального доступу до Інтернету за допомогою деяких служб зворотного проксі, як-от [Ngrok](https://ngrok.com/), і встановити вебхук на URL-адресу, яку ви отримаєте від них, або налаштувати власний зворотний проксі, якщо у вас є публічна IP-адреса, доменне імʼя та SSL-сертифікат, але це виходить за рамки цього посібника.
Для отримання додаткової інформації про налаштування зворотного проксі зверніться до документації до програмного забезпечення, яке ви використовуєте.

::: warning
Використання стороннього зворотного проксі може призвести до витоку інформації!
:::

::: tip
Не забудьте [встановити вебхук назаж](#встановлення-вашого-вебхуку) під час розгортання у продакшн середовищі.
:::
