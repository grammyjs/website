---
prev: false
next: false
---

# Хостинг: Fly

У цьому посібнику ви дізнаєтеся про способи розміщення ваших ботів grammY на [Fly](https://fly.io), використовуючи Deno або Node.js.

## Підготовка коду

Ви можете запустити свого бота, використовуючи [вебхуки або тривале опитування](../guide/deployment-types).

### Вебхуки

> Памʼятайте, що ви не повинні викликати `bot.start()` у своєму коді, коли використовуєте вебхуки.

1. Переконайтеся, що у вас є файл, який експортує ваш обʼєкт `Bot`, щоб ви могли імпортувати його пізніше для запуску.
2. Створіть файл з назвою `app.ts` або `app.js` або насправді будь-якою назвою, яку ви хочете, але ви повинні памʼятати і використовувати його як головний файл для розгортання, з наступним вмістом:

::: code-group

```ts{11} [Deno]
import { webhookCallback } from "https://deno.land/x/grammy/mod.ts";
// Ви можете змінити це на правильний спосіб імпорту вашого обʼєкта `Bot`.
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
// Ви можете змінити це на правильний спосіб імпорту вашого обʼєкта `Bot`.
import { bot } from "./bot";

const port = 8000;
const app = express();

app.use(express.json());
app.use(`/${bot.token}`, webhookCallback(bot, "express"));
app.use((_req, res) => res.status(200).send());

app.listen(port, () => console.log(`працюю на порті ${port}`));
```

:::

Ми радимо вам зареєструвати ваш обробник на деякому секретному шляху, а не на кореневому (`/`).
Як показано на підсвіченому рядку вище, ми використовуємо токен бота (`/<токен бота>`) як секретний шлях.

### Тривале опитування

Створіть файл з назвою `app.ts` або `app.js` або насправді будь-якою назвою, яку ви хочете, але ви повинні памʼятати і використовувати його як головний файл для розгортання, з наступним вмістом:

::: code-group

```ts{4} [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN не вказано");

const bot = new Bot(token);

bot.command(
  "start",
  (ctx) => ctx.reply("Я запущений на Fly за допомогою тривалого опитування!"),
);

Deno.addSignalListener("SIGINT", () => bot.stop());
Deno.addSignalListener("SIGTERM", () => bot.stop());

bot.start();
```

```ts{4} [Node.js]
import { Bot } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN не вказано");

const bot = new Bot(token);

bot.command(
  "start",
  (ctx) => ctx.reply("Я запущений на Fly за допомогою тривалого опитування!"),
);

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

bot.start();
```

:::

Як ви можете побачити на підсвіченому рядку вище, ми отримуємо деякі конфіденційні значення (токен вашого бота) зі змінних середовища.
Fly дозволяє нам зберігати цей секрет, виконавши цю команду:

```sh
flyctl secrets set BOT_TOKEN="AAAA:12345"
```

Ви можете вказати інші секрети аналогічним чином.
Для отримання додаткової інформації про ці _секрети_, дивіться <https://fly.io/docs/reference/secrets/>.

## Розгортання

### 1-й метод: за допомогою `flyctl`

Цей метод є найпростішим для використання.

1. Встановіть [flyctl](https://fly.io/docs/hands-on/install-flyctl) та [авторизуйтесь](https://fly.io/docs/hands-on/sign-up-sign-in/).
2. Виконайте команду `flyctl launch`, щоб згенерувати файли `Dockerfile` та `fly.toml` для розгортання.
   Але **НЕ** розгортайте ваш проєкт.

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

3. **Deno**: змініть версію Deno та видаліть `CMD`, якщо він існує, у файлі `Dockerfile`.
   Наприклад, у цьому випадку ми оновлюємо `DENO_VERSION` до `1.25.2`.

   **Node.js**: щоб змінити версію Node.js, вам потрібно вставити властивість `"node"` в межах властивості `"engines"` у `package.json`.
   Ми оновлюємо версію Node.js до `16.14.0` у наступному прикладі.

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
   # CMD видалено
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

4. Відредагуйте `app` у файлі `fly.toml`.
   Шлях `./app.ts` або `./app.js` для Node.js у наведеному нижче прикладі вказує на розташування головного файлу.
   Ви можете змінити їх, щоб вони відповідали каталогу вашого проєкту.
   Якщо ви використовуєте вебхуки, переконайтеся, що порт відповідає тому, що ви вказали у своєму [конфігураційному файлі](#вебхуки) (`8000`).

   ::: code-group

   ```toml{7,11,12} [Deno (Вебхук)]
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

   ```toml{7} [Deno (Тривале опитування)]
   # fly.toml
   app = "grammy"
   kill_signal = "SIGINT"
   kill_timeout = 5

   [processes]
   app = "run --allow-net ./app.ts"

   # Просто опускаємо весь розділ [[services]],
   # оскільки ми не прослуховуємо HTTP
   ```

   ```toml{7,11,18,19} [Node.js (Вебхук)]
   # fly.toml
   app = "grammy"
   kill_signal = "SIGINT"
   kill_timeout = 5

   [processes]
   app = "node ./build/app.js"

   # Налаштуйте змінну середовища NODE_ENV, щоб прибрати попередження.
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

   ```toml{7,11,22,23} [Node.js (Тривале опитування)]
   # fly.toml
   app = "grammy"
   kill_signal = "SIGINT"
   kill_timeout = 5

   [processes]
   app = "node ./build/app.js"

   # Налаштуйте змінну середовища NODE_ENV, щоб прибрати попередження.
   [build.args]
   NODE_ENV = "production"

   [build]
   builder = "heroku/buildpacks:20"

   # Просто пропустіть увесь розділ [[services]], оскільки ми не прослуховуємо HTTP.
   ```

   :::

5. Запустіть `flyctl deploy` для розгортання вашого коду.

### 2-й метод: за допомогою GitHub Actions

Основною перевагою такого підходу є те, що Fly буде стежити за змінами у вашому репозиторії, включаючи код вашого бота, й автоматично розгортатиме нові версії.
Відвідайте <https://fly.io/docs/app-guides/continuous-deployment-with-github-actions> для отримання більш детальних інструкцій.

1. Встановіть [flyctl](https://fly.io/docs/hands-on/install-flyctl) та [авторизуйтесь](https://fly.io/docs/hands-on/sign-up-sign-in/).
2. Отримайте токен Fly API, виконавши `flyctl auth token`.
3. Створіть репозиторій на GitHub, який може бути приватним або загальнодоступним.
4. Перейдіть до налаштувань, виберіть вкладку секретів та створіть секрет з назвою `FLY_API_TOKEN` та значенням токена з 2-го кроку.
5. Створіть `.github/workflows/main.yml` із таким змістом:

   ```yml
   name: Розгортання на Fly
   on: [push]
   env:
   FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
   jobs:
   deploy:
      name: Розгортання застосунку
      runs-on: ubuntu-latest
      steps:
         - uses: actions/checkout@v2
         - uses: superfly/flyctl-actions/setup-flyctl@master
         - run: flyctl deploy --remote-only
   ```

6. Виконайте 2-й та 4-й крок з [1-го методу](#_1-и-метод-за-допомогою-flyctl) вище.

Зверніть увагу, що останній, 5-й, крок потрібно пропустити, оскільки ми не розгортаємо код вручну.
7. Збережіть внесені зміни і відправте їх на GitHub.
8. Ось тут і відбувається чаклунство --- push викликав розгортання, і з цього моменту, кожного разу, коли ви зробите зміну і відправите її на GitHub, додаток автоматично буде розгоратися.

### Налаштування URL-адреси вебхуку

Якщо ви використовуєте вебхуки, після запуску вашого застосунку, вам потрібно налаштувати вебхук вашого бота, щоб запити посилалися на ваш застосунок.
Для цього відправте запит на

```text
https://api.telegram.org/bot<токен-бота>/setWebhook?url=<адреса>
```

замініть `<токен-бота>` на токен вашого бота, а `<адреса>` --- на повну URL-адресу вашого застосунку разом з шляхом до обробника вебхуку.

### Оптимізація Dockerfile

При запуску `Dockerfile` він копіює все з каталогу в образ Docker.
Для застосунків Node.js деякі каталоги, як-от `node_modules`, все одно будуть перебудовані, тому немає необхідності їх копіювати.
Для цього створіть файл `.dockerignore` і додайте до нього `node_modules`.
Ви також можете використовувати `.dockerignore`, щоб не копіювати будь-які інші файли, які не потрібні під час виконання.

## Довідкова інформація

- <https://fly.io/docs/js/frameworks/deno/>
- <https://fly.io/docs/js/>
