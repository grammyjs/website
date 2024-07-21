---
prev: false
next: false
---

# Хостинг: Fly

Это руководство расскажет вам о том, как вы можете разместить своих ботов grammY на [Fly](https://fly.io), используя Deno или Node.js.

## Подготовка кода

Вы можете запустить своего бота, используя оба варианта [вебхуки или long polling](../guide/deployment-types).

### Вебхуки

> Помните, что при использовании вебхуков не следует вызывать `bot.start()` в коде.

1. Убедитесь, что у вас есть файл, который экспортирует ваш объект `Bot`, чтобы вы могли импортировать его позже для запуска.
2. Создайте файл с именем `app.ts` или `app.js`, или вообще любым другим именем, которое вам нравится (но вы должны запомнить и использовать его как основной файл для развертывания), со следующим содержанием:

::: code-group

```ts{11} [Deno]
import { webhookCallback } from "https://deno.land/x/grammy/mod.ts";
// Вы можете изменить это, чтобы правильно импортировать свой объект `Bot`.
import { bot } from "./bot.ts";

const port = 8000;
const handleUpdate = webhookCallback(bot, "std/http");

Deno.serve({ port }, async (req) => {
  const url = new URL(req.url);
  if (req.method === "POST" && url.pathname.slice(1) === bot.token) {
    try {
      return await handleUpdate(req);
    } catch (err) {
      console.error(err);
    }
  }
  return new Response();
});
```

```ts{10} [Node.js]
import express from "express";
import { webhookCallback } from "grammy";
// Вы можете изменить это, чтобы правильно импортировать свой объект `Bot`.
import { bot } from "./bot";

const port = 8000;
const app = express();

app.use(express.json());
app.use(`/${bot.token}`, webhookCallback(bot, "express"));
app.use((_req, res) => res.status(200).send());

app.listen(port, () => console.log(`прослушиваю порт ${port}`));
```

:::

Мы советуем располагать обработчик не в корне (`/`), а на каком-то секретном пути.
Как показано в выделенной строке выше, мы используем токен бота (`/<токен бота>`) в качестве секретного пути.

### Long Polling

Создайте файл с именем `app.ts` или `app.js`, или вообще любым другим именем, которое вам нравится (но вы должны запомнить и использовать этот файл как основной для развертывания), со следующим содержимым:

::: code-group

```ts{4} [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN не установлен");

const bot = new Bot(token); 

bot.command(
  "start",
  (ctx) => ctx.reply("Я запущен на хостинге Fly с помощью long polling!"),
);

Deno.addSignalListener("SIGINT", () => bot.stop());
Deno.addSignalListener("SIGTERM", () => bot.stop());

bot.start();
```

```ts{4} [Node.js]
import { Bot } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN не установлен");

const bot = new Bot(token);

bot.command(
  "start",
  (ctx) => ctx.reply("Я запущен на хостинге Fly с помощью long polling!"),
);

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

bot.start();
```

:::

Как вы можете видеть в выделенной строке выше, мы берем некоторые чувствительные значения (ваш токен бота) из переменных окружения.
Fly позволяет нам сохранить этот секрет, выполнив эту команду:

```sh
flyctl secrets set BOT_TOKEN="AAAA:12345"
```

Аналогичным образом можно указать и другие секреты.
Более подробную информацию об этих _секретах_ см. по адресу <https://fly.io/docs/apps/secrets/>.

## Развертывание

### Метод 1: С помощью `flyctl`

Это самый простой метод.

1. Установите [flyctl](https://fly.io/docs/flyctl/install/) и [войдите в аккаунт](https://fly.io/docs/getting-started/sign-up-sign-in/).
2. Запустите `flyctl launch` для создания `Dockerfile` и `fly.toml` файлов для развертывания.
   Но **НЕ** развертывайте.

   ::: code-group

   ```sh [Deno]
   flyctl launch
   ```

   ```log{10} [Log]
   Creating app in /my/telegram/bot
   Scanning source code
   Detected a Deno app
   ? App Name (leave blank to use an auto-generated name): grammy
   Automatically selected personal organization: CatDestroyer
   ? Select region: ams (Amsterdam, Netherlands)
   Created app grammy in organization personal
   Wrote config file fly.toml
   ? Would you like to set up a Postgresql database now? No
   ? Would you like to deploy now? No
   Your app is ready. Deploy with `flyctl deploy`
   ```

   :::

   ::: code-group

   ```sh [Node.js]
   flyctl launch
   ```

   ```log{12} [Log]
   Creating app in /my/telegram/bot
   Scanning source code
   Detected a NodeJS app
   Using the following build configuration:
         Builder: heroku/buildpacks:20
   ? App Name (leave blank to use an auto-generated name): grammy
   Automatically selected personal organization: CatDestroyer
   ? Select region: ams (Amsterdam, Netherlands)
   Created app grammy in organization personal
   Wrote config file fly.toml
   ? Would you like to set up a Postgresql database now? No
   ? Would you like to deploy now? No
   Your app is ready. Deploy with `flyctl deploy`
   ```

   :::

3. **Deno**: Измените версию Deno и удалите `CMD`, если он существует в файле `Dockerfile`.
   Например, в данном случае мы обновляем `DENO_VERSION` до `1.25.2`.

   **Node.js**: Чтобы изменить версию Node.js, вам нужно вставить свойство `"node"` внутри свойства `"engines"` в файле `package.json`.
   Например, в примере ниже мы обновляем версию Node.js до `16.14.0`.

   ::: code-group

   ```dockerfile{2,26} [Deno]
   # Dockerfile
   ARG DENO_VERSION=1.25.2
   ARG BIN_IMAGE=denoland/deno:bin-${DENO_VERSION}
   FROM ${BIN_IMAGE} AS bin

   FROM frolvlad/alpine-glibc:alpine-3.13

   RUN apk --no-cache add ca-certificates

   RUN addgroup --gid 1000 deno \
   && adduser --uid 1000 --disabled-password deno --ingroup deno \
   && mkdir /deno-dir/ \
   && chown deno:deno /deno-dir/

   ENV DENO_DIR /deno-dir/
   ENV DENO_INSTALL_ROOT /usr/local

   ARG DENO_VERSION
   ENV DENO_VERSION=${DENO_VERSION}
   COPY --from=bin /deno /bin/deno

   WORKDIR /deno-dir
   COPY . .

   ENTRYPOINT ["/bin/deno"]
   # CMD is removed
   ```

   ```json [Node.js]{19}
   // package.json
   {
     "name": "grammy",
     "version": "1.0.0",
     "description": "grammy",
     "main": "app.js",
     "author": "itsmeMario",
     "license": "MIT",
     "dependencies": {
       "express": "^4.18.1",
       "grammy": "^1.11.0"
     },
     "devDependencies": {
       "@types/express": "^4.17.14",
       "@types/node": "^18.7.18",
       "typescript": "^4.8.3"
     },
     "engines": {
       "node": "16.14.0"
     }
   }
   ```

   :::

4. Отредактируйте `app` внутри файла `fly.toml`.
   Путь `./app.ts` (или `./app.js` для Node.js) в примере ниже относится к директории главного файла.
   Вы можете изменить их, чтобы они соответствовали директории вашего проекта.
   Если вы используете вебхуки, убедитесь, что порт совпадает с портом в вашей [конфигурации](#вебхуки) (`8000`).

   ::: code-group

   ```toml [Deno (Webhooks)]{7,11,12}
   # fly.toml
   app = "grammy"
   kill_signal = "SIGINT"
   kill_timeout = 5

   [processes]
   app = "run --allow-net ./app.ts"

   [[services]]
   http_checks = []
   internal_port = 8000
   processes = ["app"]
   protocol = "tcp"
   script_checks = []
   [services.concurrency]
      hard_limit = 25
      soft_limit = 20
      type = "connections"

   [[services.ports]]
      force_https = true
      handlers = ["http"]
      port = 80

   [[services.ports]]
      handlers = ["tls", "http"]
      port = 443

   [[services.tcp_checks]]
      grace_period = "1s"
      interval = "15s"
      restart_limit = 0
      timeout = "2s"
   ```

   ```toml [Deno (Long Polling)]{7}
   # fly.toml
   app = "grammy"
   kill_signal = "SIGINT"
   kill_timeout = 5

   [processes]
   app = "run --allow-net ./app.ts"

   # Просто опустите весь раздел [[services]]
   # поскольку мы не слушаем HTTP
   ```

   ```toml [Node.js (Webhooks)]{7,11,18,19}
   # fly.toml
   app = "grammy"
   kill_signal = "SIGINT"
   kill_timeout = 5

   [processes]
   app = "node ./build/app.js"

   # Настройте переменную окружения NODE_ENV, чтобы убрать предупреждение
   [build.args]
   NODE_ENV = "production"

   [build]
   builder = "heroku/buildpacks:20"

   [[services]]
   http_checks = []
   internal_port = 8000
   processes = ["app"]
   protocol = "tcp"
   script_checks = []
   [services.concurrency]
      hard_limit = 25
      soft_limit = 20
      type = "connections"

   [[services.ports]]
      force_https = true
      handlers = ["http"]
      port = 80

   [[services.ports]]
      handlers = ["tls", "http"]
      port = 443

   [[services.tcp_checks]]
      grace_period = "1s"
      interval = "15s"
      restart_limit = 0
      timeout = "2s"
   ```

   ```toml [Node.js (Long polling)]{7,11,22,23}
   # fly.toml
   app = "grammy"
   kill_signal = "SIGINT"
   kill_timeout = 5

   [processes]
   app = "node ./build/app.js"

   # Настройте переменную окружения NODE_ENV, чтобы убрать предупреждение
   [build.args]
   NODE_ENV = "production"

   [build]
   builder = "heroku/buildpacks:20"

   # Просто опустите всю секцию [[services]], поскольку мы не слушаем HTTP.
   ```

   :::

5. Запустите `flyctl deploy`, чтобы развернуть ваш код.

### Метод 2: С помощью Github Actions

Основное преимущество этого метода в том, что Fly будет следить за изменениями в вашем репозитории, включающем код бота, и автоматически разворачивать новые версии.
Посетите <https://fly.io/docs/app-guides/continuous-deployment-with-github-actions> для получения более подробных инструкций.

1. Установите [flyctl](https://fly.io/docs/flyctl/install/) и [войдите в аккаунт](https://fly.io/docs/getting-started/sign-up-sign-in/).
2. Получите токен Fly API, выполнив команду `flyctl auth token`.
3. Создайте репозиторий на GitHub, он может быть как приватным, так и публичным.
4. Перейдите в раздел Settings, выберите Secrets и создайте секрет под названием `FLY_API_TOKEN` со значением токена из шага 2.
5. Создайте файл `.github/workflows/main.yml` с таким содержимым:

   ```yml
   name: Fly Deploy
   on: [push]
   env:
   FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
   jobs:
   deploy:
         name: Deploy app
         runs-on: ubuntu-latest
         steps:
         - uses: actions/checkout@v2
         - uses: superfly/flyctl-actions/setup-flyctl@master
         - run: flyctl deploy --remote-only
   ```

6. Выполните шаги со 2 по 4 из [Метода 1](#метод-1-с-помощью-flyctl) выше.
   Не забудьте пропустить последний шаг (шаг 5), поскольку мы не будем разворачивать код напрямую.
7. Зафиксируйте изменения и выложите их на GitHub.
8. Вот тут-то и происходит волшебство --- push вызвал развертывание, и с этого момента при каждом изменении приложение будет автоматически развертываться.

### Настройка URL вебхука

Если вы используете вебхуки, то после запуска приложения вам необходимо настроить параметры вебхуков бота так, чтобы они указывали на ваше приложение.
Для этого отправьте запрос на

```text
https://api.telegram.org/bot<токен>/setWebhook?url=<url>
```

заменив `<токен>` на токен вашего бота, а `<url>` на полный URL вашего приложения вместе с путем к обработчику вебхука.

### Оптимизация Dockerfile

Когда запускается наш `Dockerfile`, он копирует все из каталога в образ Docker.
Для приложений Node.js некоторые каталоги, например `node_modules`, будут перестроены в любом случае, поэтому копировать их не нужно.
Для этого создайте файл `.dockerignore` и добавьте в него `node_modules`.
Вы также можете использовать `.dockerignore`, чтобы не копировать любые другие файлы, которые не нужны во время выполнения.

## Ссылки

- <https://fly.io/docs/js/frameworks/deno/>
- <https://fly.io/docs/js/>
