---
prev: false
next: false
---

# Хостинг: Heroku

> Мы предполагаем, что у вас есть базовые знания о создании ботов с помощью grammY.
> Если вы еще не готовы, не стесняйтесь заглянуть в наш дружественный [Гайд](../guide/)! :rocket:

В этом руководстве мы расскажем вам, как развернуть Telegram бота на [Heroku](https://heroku.com/) с помощью [вебхуков](../guide/deployment-types#как-использовать-вебхуки) или [long polling](../guide/deployment-types#как-использовать-long-polling).
Мы также предполагаем, что у вас уже есть аккаунт на Heroku.

## Необходимые условия

Сначала установите некоторые зависимости:

```sh
# Создайте директорию проекта.
mkdir grammy-bot
cd grammy-bot
npm init --y

# Установите основные зависимости.
npm install grammy express

# Установите зависимости для разработки.
npm install -D typescript @types/express @types/node

# Создайте конфиг TypeScript.
npx tsc --init
```

Мы будем хранить наши файлы TypeScript в папке `src`, а скомпилированные файлы --- в папке `dist`.
Создайте эти папки в корневом каталоге проекта.
Затем в папке `src` создайте новый файл с именем `bot.ts`.
Теперь наша структура папок должна выглядеть следующим образом:

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

После этого откройте файл `tsconfig.json` и измените его, чтобы использовать эту конфигурацию:

```json
{
  "compilerOptions": {
    "target": "ESNEXT",
    "module": "ESNext", // [!code hl] // переход с commonjs на esnext
    "lib": ["ES2021"],
    "outDir": "./dist/",
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

Поскольку опция `module` выше была установлена с `commonjs` на `esnext`, мы должны добавить `"type": "module"` в наш `package.json`.
Теперь наш `package.json` должен быть похож на этот:

```json{6}
{
  "name": "grammy-bot",
  "version": "0.0.1",
  "description": "",
  "main": "dist/app.js",
  "type": "module", // [!code hl] // добавьте свойство "type": "module"
  "scripts": {
    "dev-build": "tsc"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "grammy": "^1.2.0",
    "express": "^4.17.1"
  },
  "devDependencies": {
    "typescript": "^4.3.5",
    "@types/express": "^4.17.13",
    "@types/node": "^16.3.1"
  },
  "keywords": []
}
```

Как уже говорилось, у нас есть два варианта получения данных из Telegram: вебхуки и long polling.
Вы можете узнать больше о преимуществах обоих вариантов, а затем решить, какой из них подходит, в этих [потрясающих советах](../guide/deployment-types)!

## Вебхуки

> Если вы решите использовать long polling вместо этого, вы можете пропустить этот раздел и перейти к [разделу о long polling](#long-polling). :rocket:

Вкратце, в отличие от long polling, вебхук не будет запускаться постоянно для проверки входящих сообщений от Telegram.
Это снизит нагрузку на сервер и сэкономит нам много [dyno часов](https://devcenter.heroku.com/articles/eco-dyno-hours), особенно если вы используете тарифный план Eco. :grin:

Хорошо, давайте продолжим!
Помните, мы ранее создали `bot.ts`?
Мы не будем сбрасывать туда весь код и оставим программирование бота на ваше усмотрение.
Вместо этого мы сделаем `app.ts` нашей основной точкой входа.
Это означает, что каждый раз, когда Telegram (или кто-то другой) заходит на наш сайт, `express` решает, какая часть вашего сервера будет отвечать за обработку запроса.
Это полезно, когда вы разворачиваете и сайт, и бота в одном домене.
Кроме того, разделение кодов по разным файлам позволяет сделать наш код более аккуратным. :sparkles:

### Express и его middleware

Теперь создайте `app.ts` в папке `src` и напишите в нем этот код:

```ts
import express from "express";
import { webhookCallback } from "grammy";
import { bot } from "./bot.js";

const domain = String(process.env.DOMAIN);
const secretPath = String(process.env.BOT_TOKEN);
const app = express();

app.use(express.json());
app.use(`/${secretPath}`, webhookCallback(bot, "express"));

app.listen(Number(process.env.PORT), async () => {
  // Убедитесь, что это `https`, а не `http`!
  await bot.api.setWebhook(`https://${domain}/${secretPath}`);
});
```

Давайте посмотрим на наш код выше:

- `process.env`: Помните, НИКОГДА не храните учетные данные в коде!
  Для создания [переменных окружения](https://www.freecodecamp.org/news/using-environment-variables-the-right-way/) в Heroku, перейдите по этому [руководству](https://devcenter.heroku.com/articles/config-vars).
- `secretPath`: Это может быть наш `BOT_TOKEN` или любая произвольная строка.
  Лучше всего скрывать путь нашего бота, как [объясняет Telegram](https://core.telegram.org/bots/api#setwebhook).

::: tip ⚡ Оптимизация (необязательно)
`bot.api.setWebhook` в строке 14 будет запускаться всегда, когда Heroku снова запустит ваш сервер.
Для ботов с низким трафиком это будет происходить при каждом запросе.
Однако нам не нужно, чтобы этот код выполнялся каждый раз, когда приходит запрос.
Поэтому мы можем полностью удалить эту часть и выполнять `GET` только один раз вручную.
Откройте эту ссылку в браузере после развертывания нашего бота:

```asciiart:no-line-numbers
https://api.telegram.org/bot<токен>/setWebhook?url=<webhook_url>
```

Обратите внимание, что некоторые браузеры требуют вручную [закодировать](https://en.wikipedia.org/wiki/Percent-encoding#Reserved_characters) `webhook_url` перед передачей.
Например, если у нас есть токен бота `abcd:1234` и URL `https://grammybot.herokuapp.com/secret_path`, то наша ссылка должна выглядеть следующим образом:

```asciiart:no-line-numbers
https://api.telegram.org/botabcd:1234/setWebhook?url=https%3A%2F%2Fgrammybot.herokuapp.com%2Fsecret_path
```

:::

::: tip ⚡ Оптимизация (необязательно)
Используйте [Webhook Reply](../guide/deployment-types#ответ-вебхука) для большей эффективности.
:::

### Создание `bot.ts` (вебхуки)

Следующим шагом перейдите к файлу `bot.ts`:

```ts
import { Bot } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN не установлен");

export const bot = new Bot(token);

bot.command("start", (ctx) => ctx.reply("Привет!"));
bot.on("message", (ctx) => ctx.reply("Получил сообщение!"));
```

Отлично!
Теперь мы закончили написание наших основных файлов.
Но прежде чем перейти к шагам развертывания, мы можем немного оптимизировать нашего бота.
Как обычно, это необязательно.

::: tip ⚡ Оптимизация (необязательно)
При каждом запуске вашего сервера, grammY будет запрашивать [информацию о боте](https://core.telegram.org/bots/api#getme) у Telegram, чтобы предоставить ее в [объект контекста](../guide/context) в `ctx.me`.
Мы можем заранее обозначить всю [информацию о боте](/ref/core/botconfig#botinfo), чтобы предотвратить чрезмерные вызовы `getMe`.

1. Откройте эту ссылку `https://api.telegram.org/bot<токен>/getMe` в вашем любимом браузере. Рекомендуем [Firefox](https://www.firefox.com/en-US/), так как он хорошо справляется с отображением `JSON`.
2. Измените наш код в строке 4 выше и заполните значение в соответствии с результатами, полученными от `getMe`:

   ```ts
   const token = process.env.BOT_TOKEN;
   if (!token) throw new Error("BOT_TOKEN не установлен");

   export const bot = new Bot(token, {
     botInfo: {
       id: 111111111,
       is_bot: true,
       first_name: "xxxxxxxxx",
       username: "xxxxxxbot",
       can_join_groups: true,
       can_read_all_group_messages: false,
       supports_inline_queries: false,
     },
   });
   ```

:::

Круто!
Пришло время подготовить среду развертывания!
Всем прямая дорога в раздел [Развертывания](#развертывание)! :muscle:

## Long Polling

::: warning Ваш код будет выполняться непрерывно при использовании long polling
Если вы не знаете, как справиться с таким поведением, убедитесь, что у вас достаточно [dyno часов](https://devcenter.heroku.com/articles/eco-dyno-hours).
:::

> Рассмотрите возможность использования вебхуков?
> Перейдите к разделу [вебхуки](#вебхуки). :rocket:

Использование long polling на вашем сервере --- не всегда плохая идея.
Иногда он подходит для ботов, собирающих данные, которым не нужно быстро реагировать и обрабатывать большое количество данных.
Если вы хотите делать это раз в час, вы можете легко это сделать.
Это то, что вы не можете контролировать с помощью вебхуков.
Если ваш бот будет переполнен сообщениями, вы увидите много запросов вебхука, однако вы можете более легко ограничить скорость обработки обновлений с помощью long polling.

### Создание `bot.ts` (Long Polling)

Откроем файл `bot.ts`, который мы создали ранее.
Пусть он содержит следующие строки кода:

```ts
import { Bot } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN не установлен");

const bot = new Bot(token);

bot.command(
  "start",
  (ctx) => ctx.reply("Я работаю на Heroku, используя long polling!"),
);

bot.start();
```

Вот и все!
Мы готовы к развертыванию.
Довольно просто, правда? :smiley:
Если вам кажется, что это слишком просто, посмотрите наши [советы по развертыванию](../advanced/deployment#long-polling)! :rocket:

## Развертывание

Нет... наш _Шикарный бот_ еще не готов к запуску.
Сначала завершите эти этапы!

### Компиляция файлов

Запустите этот код в терминале, чтобы скомпилировать файлы TypeScript в JavaScript:

```sh
npx tsc
```

Если он запустится успешно и не выдаст никаких ошибок, наши скомпилированные файлы должны оказаться в папке `dist` с расширением `.js`.

### Установите `Procfile`

На данный момент у `Heroku` есть несколько [типов dyno](https://devcenter.heroku.com/articles/dynos#use-cases).
Два из них:

- **Web dynos**:

  _Web dynos_ --- это dynos процесса "web", которые получают HTTP-трафик от роутеров.
  Этот вид дино имеет таймаут в 30 секунд на выполнение кода.
  Кроме того, он отключится, если в течение 30 минут не будет обработано ни одного запроса.
  Этот тип дино вполне подходит для _вебхуков_.

- **Worker dynos**

  _Worker dynos_ обычно используются для фоновых заданий.
  У них нет таймаута, и они НЕ отключатся, если не обработают никаких запросов.
  Он подходит для _long polling_.

Создайте файл с именем `Procfile` без расширения в корневой директории нашего проекта.
Например, `Procfile.txt` и `procfile` не подходят.
Затем напишите код в формате одной строки:

```procfile
<тип dynos>: <наш главный файл>
```

Для нашего случая должно быть так:

::: code-group

```procfile [Webhook]
web: node dist/app.js
```

```procfile [Long Polling]
worker: node dist/bot.js
```

:::

### Установка Git

Мы собираемся развернуть нашего бота с помощью [Git и Heroku Cli](https://devcenter.heroku.com/articles/git).
Вот ссылка для установки:

- [Инструкция по установке Git](https://git-scm.com/download)
- [Инструкция по установке Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli#install-the-heroku-cli)

Предположим, что они уже установлены на вашем компьютере, и у вас открыт терминал в корневой директории нашего проекта.
Теперь инициализируйте локальный git-репозиторий, выполнив этот код в терминале:

```sh
git init
```

Далее нам нужно предотвратить попадание ненужных файлов на наш рабочий сервер, в данном случае `Heroku`.
Создайте файл с именем `.gitignore` в корневой директории нашего проекта.
Затем добавьте в него этот список:

```text
node_modules/
src/
tsconfig.json
```

Теперь наша окончательная структура папок должна выглядеть следующим образом:

::: code-group

```asciiart:no-line-numbers [Вебхук]
.
├── .git/
├── node_modules/
├── dist/
│   ├── bot.js
│   └── app.js
├── src/
│   ├── bot.ts
│   └── app.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── Procfile
└── .gitignore
```

```asciiart:no-line-numbers [Long Polling]
.
├── .git/
├── node_modules/
├── dist/
│   └── bot.js
├── src/
│   └── bot.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── Procfile
└── .gitignore
```

:::

Зафиксируйте файлы в нашем git-репозитории:

```sh
git add .
git commit -m "My first commit"
```

### Настройте удаленный доступ к Heroku

Если вы уже создали [Heroku app](https://dashboard.heroku.com/apps/), передайте имя вашего `Existing app` в `<myApp>` ниже, затем запустите код.
В противном случае запустите `New app`.

::: code-group

```sh [New app]
heroku create
git remote -v
```

```sh [Existing app]
heroku git:remote -a <myApp>
```

:::

### Развертывание кода

Наконец, нажмите _красную кнопку_ и взлетайте! :rocket:

```sh
git push heroku main
```

Если это не сработает, то, скорее всего, наша ветка git не `main`, а `master`.
Вместо этого нажмите эту _синюю кнопку_:

```sh
git push heroku master
```
