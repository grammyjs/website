---
prev: false
next: false
---

# Хостинг: Cloudflare Workers (Node.js)

[Cloudflare Workers](https://workers.cloudflare.com) --- это публичная платформа для бессерверных вычислений, которая предлагает удобное и простое решение для выполнения JavaScript на [edge](https://en.wikipedia.org/wiki/Edge_computing).
Благодаря возможности обрабатывать HTTP-трафик и использованию [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), создание ботов Telegram становится простым делом.
Кроме того, вы можете даже разрабатывать [web приложения](https://core.telegram.org/bots/webapps) на edge, и все это бесплатно в пределах определенных квот.

В этом руководстве мы расскажем вам о том, как разместить ботов Telegram на Cloudflare Workers.

::: tip Ищете версию Deno?
В этом руководстве объясняется, как развернуть бота Telegram на Cloudflare Workers с помощью Node.js.
Если вы ищете версию Deno, пожалуйста, ознакомьтесь с [этой страницей](./cloudflare-workers).
:::

## Необходимые условия

1. Аккаунт [Cloudflare](https://dash.cloudflare.com/login) с [настроенным](https://dash.cloudflare.com/?account=workers) и рабочим поддоменом.
2. Рабочая среда [Node.js](https://nodejs.org/) с установленным `npm`.

## Настройка

Сначала создайте новый проект:

```sh
npm create cloudflare@latest
```

Затем вам будет предложено ввести имя worker'а:

```ansi{6}
using create-cloudflare version 2.17.1

╭ Create an application with Cloudflare Step 1 of 3
│
╰ In which directory do you want to create your application? also used as application name  // [!code focus]
  ./grammybot  // [!code focus]
```

Здесь мы создаем проект с именем `grammybot`, вы можете выбрать свое собственное, это будет имя вашего worker'а, а также часть URL запроса.

::: tip
Вы можете изменить имя worker'а в файле `wrangler.toml` позже.
:::

Далее вам будет предложено выбрать тип рабочего, здесь мы выбрали `"Hello World" Worker`:

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

Далее вам будет предложено выбрать, хотите ли вы использовать TypeScript, если вы хотите использовать JavaScript, выберите `No`.
Здесь мы выбираем `Yes`:

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

Ваш проект будет настроен через несколько минут.
После этого вас спросят, хотите ли вы использовать git для контроля версий, выберите `Yes`, если вы хотите, чтобы репозиторий инициализировался автоматически, или `No`, если вы хотите инициализировать его самостоятельно позже.

Здесь мы выбираем `Yes`:

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

Наконец, вас спросят, хотите ли вы развернуть worker'а, выберите `No`, поскольку мы собираемся развернуть его, когда у нас будет рабочий Telegram бот:

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

## Установка зависимостей

`cd` в `grammybot` (замените это имя на имя вашего worker'а, которое вы задали выше), установите `grammy` и другие пакеты, которые могут вам понадобиться:

```sh
npm install grammy
```

## Создание бота

Отредактируйте `src/index.js` или `src/index.ts` и напишите этот код внутри:

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
      await ctx.reply("Привет, мир!");
    });

    return webhookCallback(bot, "cloudflare-mod")(request);
  },
};
```

Здесь мы сначала импортируем `Bot`, `Context` и `webhookCallback` из `grammy`.

Внутри интерфейса `Env` мы добавляем переменную `BOT_INFO`, это переменная окружения, которая хранит информацию о вашем боте, вы можете получить информацию о боте, вызвав Telegram Bot API с помощью метода `getMe`.
Откройте эту ссылку в своем браузере:

```ansi:no-line-numbers
https://api.telegram.org/bot<токен>/getMe
```

Замените `<токен>` на токен вашего бота.
В случае успеха вы увидите ответ в формате JSON, похожий на этот:

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

Теперь откройте файл `wrangler.toml` в корне вашего проекта и добавьте переменную окружения `BOT_INFO` в разделе `[vars]` со значением из объекта `result`, которое вы получили выше, следующим образом:

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

Замените информацию о боте на ту, которую вы получаете из браузера.
Обратите внимание на три двойные кавычки `""` в начале и в конце.

В дополнение к `BOT_INFO`, мы также добавляем переменную `BOT_TOKEN`, это переменная окружения, которая хранит ваш токен бота, используемый для создания бота.

Вы можете заметить, что мы только определили переменную `BOT_TOKEN`, но еще не присвоили ее.
Обычно нужно хранить переменную окружения в файле `wrangler.toml`, однако в нашем случае это небезопасно, поскольку токен бота должен храниться в секрете.
Cloudflare Workers предоставляет нам безопасный способ хранения конфиденциальной информации, такой как API-ключи и auth-токены, в переменной окружения: [secrets](https://developers.cloudflare.com/workers/configuration/secrets/#secrets)!

::: tip
Секретные значения не видны в Wrangler или в Cloudflare Dashboard после того, как вы их определили.
:::

Вы можете добавить секрет в свой проект с помощью следующей команды:

```sh
npx wrangler secret put BOT_TOKEN
```

Следуйте инструкциям и введите свой токен бота, который будет загружен и зашифрован.

::: tip
Вы можете изменить название переменных окружения на любое другое, но помните, что в следующих шагах вы будете делать то же самое.
:::

Внутри функции `fetch()` мы создаем бота с `BOT_TOKEN`, который отвечает "Привет, мир!", когда получает `/start`.

## Развертывание вашего бота

Теперь вы можете развернуть своего бота с помощью следующей команды:

```sh
npm run deploy
```

## Настройка вебхука

Нам нужно указать Telegram, куда отправлять обновления.
Откройте браузер и перейдите по этой ссылке:

```ansi:no-line-numbers
https://api.telegram.org/bot<токен>/setWebhook?url=https://<мой_бот>.<мой_поддомен>.workers.dev/
```

Замените `<токен>` на токен вашего бота, замените `<мой_бот>` на имя вашего рабочего, замените `<мой_поддомен>` на ваш рабочий поддомен, настроенный в Cloudflare.

Если настройка прошла успешно, вы увидите JSON следующего вида:

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

## Тестирование вашего бота

Откройте приложение Telegram и запустите своего бота.
Если он ответит, значит, все готово!

## Отладка вашего бота

Для тестирования и отладки вы можете запустить локальный или удаленный сервер разработки, прежде чем развертывать бота.

В среде разработки ваш бот не имеет доступа к секретным переменным окружения.
Поэтому, [согласно Cloudflare](https://developers.cloudflare.com/workers/configuration/secrets/#local-development-with-secrets), вы можете создать файл `.dev.vars` в корне вашего проекта для определения секретов:

```env
BOT_TOKEN=<токен_вашего_бота>  # <- заменит это на свой токен.
```

Не забудьте также добавить `BOT_INFO` для разработки.
Щелкните [здесь](https://developers.cloudflare.com/workers/configuration/environment-variables/) и [здесь](https://developers.cloudflare.com/workers/configuration/secrets/) для получения более подробной информации о переменных окружения и секретах.

Замените `BOT_INFO` и `BOT_TOKEN` своим значением, если вы изменили имя переменной окружения на предыдущем шаге.

::: tip
Вы можете использовать другой токен бота для разработки, чтобы он не влиял на работу основного.
:::

Теперь вы можете выполнить следующую команду, чтобы запустить сервер разработки:

```sh
npm run dev
```

После запуска сервера разработки вы можете протестировать своего бота, отправив ему примеры обновлений с помощью таких инструментов, как `curl`, [Insomnia](https://insomnia.rest) или [Postman](https://postman.com).
Примеры обновлений см. в [здесь](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates), а более подробную информацию о структуре обновлений --- [здесь](https://core.telegram.org/bots/api#update).

Если вы не хотите конструировать обновление или хотите протестировать его на реальном обновлении, вы можете получить обновление из Telegram Bot API с помощью метода `getUpdates`.
Для этого вам нужно будет сначала удалить вебхук.
Откройте веб-браузер и перейдите по этой ссылке:

```ansi:no-line-numbers
https://api.telegram.org/bot<токен>/deleteWebhook
```

Замените `<токен>` на токен вашего бота, и вы увидите JSON, похожий на этот:

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was deleted"
}
```

Затем откройте клиент Telegram и отправьте что-нибудь боту, например, отправьте `/start`.

Теперь перейдите по этой ссылке в браузере, чтобы получать обновления:

```ansi:no-line-numbers
https://api.telegram.org/bot<токен>/getUpdates
```

Снова замените `<токен>` на токен вашего бота, в случае успеха вы увидите JSON, похожий на этот:

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

`result` --- это массив объектов обновлений (выше содержится только один объект обновлений), вам следует скопировать только один объект и протестировать бота, разместив этот объект на сервере разработки с помощью вышеупомянутых инструментов.

Если вы хотите игнорировать устаревшие обновления (например, игнорировать все обновления во время разработки перед развертыванием в производственной среде), вы можете добавить параметр `offset` в метод `getUpdates`, как показано ниже:

```ansi:no-line-numbers
https://api.telegram.org/bot<токен>/getUpdates?offset=<update_id>
```

Замените `<токен>` на ваш токен бота, а `<update_id>` на `update_id` последнего полученного обновления (с наибольшим номером), после чего вы будете получать только обновления, вышедшие позже этого обновления, и никогда не сможете получить обновления, вышедшие раньше.

Теперь вы можете тестировать своего бота с реальными объектами обновлений в своей локальной среде разработки!

Вы также можете вывести свой локальный сервер разработки в публичный интернет, используя некоторые сервисы обратного прокси, например [Ngrok](https://ngrok.com/), и установить вебхук на URL, который вы получите от них, или вы можете настроить свой собственный обратный прокси, если у вас есть публичный IP-адрес, доменное имя и SSL сертификат, но это выходит за рамки данного руководства.
Дополнительную информацию о настройке обратного прокси см. в документации к используемому вами программному обеспечению.

::: warning
Использование стороннего обратного прокси может привести к утечке информации!
:::

::: tip
Не забудьте [установить вебхук обратно](#настроика-вебхука) при развертывании в prod.
:::
