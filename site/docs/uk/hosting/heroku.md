# Хостинг: Heroku

> Ми припускаємо, що у вас є базові знання про створення ботів за допомогою grammY.
> Якщо ви ще не готові, не соромтеся перейти до нашого дружнього [посібника](../guide)! :rocket:

Цей посібник навчить вас, як розгорнути бота Telegram на [Heroku](https://heroku.com/) за допомогою [вебхуків](../guide/deployment-types.md#як-використовувати-вебхуки) або [тривалого опитування](../guide/deployment-types.md#як-використовувати-тривале-опитування).
Ми також припускаємо, що у вас вже є обліковий запис Heroku.

## Передумови

Спочатку встановіть деякі залежності:

```sh
# Створіть каталог проєкту.
mkdir grammy-bot
cd grammy-bot
npm init --y

# Встановіть основні залежності.
npm install grammy express

# Встановіть залежності розробки.
npm install -D typescript @types/express @types/node

# Створіть конфігурацію TypeScript.
npx tsc --init
```

Ми зберігатимемо файли TypeScript у каталозі `src`, а скомпільовані файли у каталозі `dist`.
Створіть каталоги у кореневій директорії проєкту.
Далі, у каталозі `src` створіть новий файл з назвою `bot.ts`.
Тепер структура каталогів має виглядати наступним чином:

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

Після цього відкрийте `tsconfig.json` і змініть його, щоб використовувати таку конфігурацію:

```json{4}
{
  "compilerOptions": {
    "target": "ESNEXT",
    "module": "esnext", // змінено з CommonJS на ESNext.
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

Оскільки опція `module` вище була змінена з `commonjs` на `esnext`, нам потрібно додати `"type": "module"` до нашого `package.json`.
Тепер наш `package.json` має бути подібним до наступного:

```json{6}
{
  "name": "grammy-bot",
  "version": "0.0.1",
  "description": "",
  "main": "dist/app.js",
  "type": "module",  // встановлюємо параметр "type": "module"
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

Як вже згадувалося раніше, у нас є два варіанти як отримувати дані від Telegram: вебхуки та тривале опитування.
Ви можете дізнатися більше про переваги обох методів та вирішити, який з них підходить для вас, перейшовши за цим посиланням до [чудових порад](../guide/deployment-types.md)!

## Вебхуки

> Якщо ви вирішили використовувати тривале опитування, ви можете пропустити цей розділ та перейти до розділу [про тривале опитування](#тривале-опитування). :rocket:

Коротко кажучи, на відміну від тривалого опитування, вебхуки не працюють постійно для перевірки вхідних повідомлень від Telegram.
Це зменшує навантаження на сервер та економить нам багато [dyno hours](https://devcenter.heroku.com/articles/eco-dyno-hours), особливо коли ви використовуєте план Eco. :grin:

Добре, продовжимо!
Памʼятаєте, що ми раніше створили `bot.ts`?
Ми не будемо кидати весь код туди, а залишимо написання бота на ваш розсуд.
Замість цього, ми зробимо `app.ts` нашою головною точкою входу.
Це означає, що кожного разу, коли Telegram або хто-небудь інший відвідує наш сайт, `express` вирішує, яка частина вашого сервера буде відповідальною за обробку запиту.
Це корисно, коли ви розгортаєте вебсайт та бота на одному домені.
Крім того, розділення коду на різні файли робить наш код більш організованим. :sparkles:

### Express та його middleware

Створіть зараз файл `app.ts` у каталозі `src` та напишіть у ньому наступний код:

```ts
import express from "express";
import { webhookCallback } from "grammy";
import { bot } from "./bot";

const domain = String(process.env.DOMAIN);
const secretPath = String(process.env.BOT_TOKEN);
const app = express();

app.use(express.json());
app.use(`/${secretPath}`, webhookCallback(bot, "express"));

app.listen(Number(process.env.PORT), async () => {
  // Переконайтеся, що ви використовуєте `https`, а не `http`!
  await bot.api.setWebhook(`https://${domain}/${secretPath}`);
});
```

Давайте розглянемо наш код вище:

- `process.env`: памʼятайте, НІКОЛИ не зберігайте дані авторизації у вашому коді!
  Для створення [змінних середовища](https://www.freecodecamp.org/news/using-environment-variables-the-right-way/) в Heroku, перейдіть за цим [посиланням](https://devcenter.heroku.com/articles/config-vars).
- `secretPath`: це може бути наш `BOT_TOKEN` або будь-який випадковий рядок. Краще всього приховати наш шлях, як [пояснено Telegram](https://core.telegram.org/bots/api#setwebhook).

::: tip ⚡ Оптимізація (не обовʼязково)
`bot.api.setWebhook` у 14-му рядку завжди запускатиметься, коли Heroku запускає ваш сервер знову.
Для ботів з низьким трафіком це відбуватиметься для кожного запиту.
Однак нам не потрібно, щоб цей код виконувався щоразу, як надходить запит.
Тому ми можемо повністю видалити цю частину і виконати `GET` лише один раз вручну.
Відкрийте наступне посилання у своєму браузері після розгортання нашого бота:

```asciiart:no-line-numbers
https://api.telegram.org/bot<bot_token>/setWebhook?url=<webhook_url>
```

Зверніть увагу, що деякі браузери вимагають ручного [кодування](https://uk.wikipedia.org/wiki/%D0%92%D1%96%D0%B4%D1%81%D0%BE%D1%82%D0%BA%D0%BE%D0%B2%D0%B5_%D0%BA%D0%BE%D0%B4%D1%83%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F#%D0%92%D1%96%D0%B4%D1%81%D0%BE%D1%82%D0%BA%D0%BE%D0%B2%D0%B5_%D0%BA%D0%BE%D0%B4%D1%83%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F_%D0%B7%D0%B0%D1%80%D0%B5%D0%B7%D0%B5%D1%80%D0%B2%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%85_%D1%81%D0%B8%D0%BC%D0%B2%D0%BE%D0%BB%D1%96%D0%B2) вашого `webhook_url` перед передачею його.
Наприклад, якщо у нас є токен бота `abcd:1234` та URL-адреса `https://grammybot.herokuapp.com/secret_path`, то наше посилання повинно виглядати наступним чином:

```asciiart:no-line-numbers
https://api.telegram.org/botabcd:1234/setWebhook?url=https%3A%2F%2Fgrammybot.herokuapp.com%2Fsecret_path
```

:::

::: tip ⚡ Оптимізація (не обовʼязково)
Використовуйте [відповідь вебхуку](../guide/deployment-types.md#відповідь-вебхуку) для більшої ефективності.
:::

### Створення `bot.ts`

Наступним кроком перейдіть до файлу `bot.ts`:

```ts
import { Bot } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN не встановлено");

export const bot = new Bot(token);

bot.command("start", (ctx) => ctx.reply("Привіт всім!"));
bot.on("message", (ctx) => ctx.reply("Отримав інше повідомлення!"));
```

Добре!
Наразі ми закінчили написання наших основних файлів.
Але перед тим, як перейти до кроків розгортання, ми можемо трішки оптимізувати нашого бота.
Як зазвичай, це не обовʼязково.

::: tip ⚡ Оптимізація (не обовʼязково)
Кожного разу, коли ваш сервер запускається, grammY буде запитувати [інформацію про бота](https://core.telegram.org/bots/api#getme) з Telegram з метою надання цієї інформації в [обʼєкту контексту](../guide/context.md) в `ctx.me`.
Ми можемо встановити [інформацію про бота](https://deno.land/x/grammy/mod.ts?s=BotConfig#prop_botInfo), щоб запобігти надмірним викликам `getMe`.

1. Відкрийте посилання `https://api.telegram.org/bot<bot_token>/getMe` в вашому улюбленному браузері. Рекомендується [Firefox](https://www.mozilla.org/en-US/firefox/), бо він чудово працює з форматом `json`.
2. Змініть наш код на 4-му рядку вище і заповніть значення відповідно до результатів, отриманих з `getMe`:

```ts
const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN не вказано");

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
Настала пора підготувати наше середовище для розгортання!
Усі прямуємо до [розділу про розгортання](#розгортання)! :muscle:

## Тривале опитування

::: warning Ваш скрипт буде запущено безперервно при використанні тривалого опитування.
Якщо ви не знаєте, як керувати цією поведінкою, переконайтеся, що у вас є достатньо [dyno hours](https://devcenter.heroku.com/articles/eco-dyno-hours) для цього.
:::

> Хочете розглянути можливовсті використання вебхуків?
> Перейдіть до [розділу про вебхуки](#вебхуки). :rocket:

Використання тривалого опитування на вашому сервері не завжди є поганою ідеєю.
Іноді воно підходить для ботів, що збирають дані і не потребують швидкої відповіді та обробки великої кількості даних.
Якщо ви хочете робити це раз на годину, це легко зробити.
Цього не можна контролювати за допомогою вебхуків.
Якщо ваш бот буде завалений повідомленнями, ви побачите багато запитів вебхуків, однак ви можете легко обмежити швидкість обробки оновлень за допомогою тривалого опитування.

### Створення `bot.ts`

Давайте відкриємо файл `bot.ts`, який ми створили раніше.
Він має містити наступний код:

```ts
import { Bot } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN не вказано");

const bot = new Bot(token);

bot.command(
  "start",
  (ctx) =>
    ctx.reply("Я запущений на Heroku з використанням тривалого опитування!"),
);

bot.start();
```

Ось і все!
Ми готові розгорнути його.
Досить просто, чи не так? :smiley:
Якщо ви думаєте, що це занадто просто, перевірте наш [контрольний список розгортання](../advanced/deployment.md#тривале-опитування)! :rocket:

## Розгортання

Ні... наш _Rocket Bot_ ще не готовий до запуску.
Спочатку завершіть наступні етапи!

### Компіляція файлів

Запустіть цей код у терміналі, щоб скомпілювати файли TypeScript в JavaScript:

```sh
npx tsc
```

Якщо він успішно виконається й не видасть жодних помилок, наші скомпільовані файли з розширенням `.js` повинні знаходитись у каталозі `dist`.

### Налаштування `Procfile`

Наразі у `Heroku` є кілька [типів dyno](https://devcenter.heroku.com/articles/dyno-types).
Два з них:

- **Веб dyno**:
  <br> _Веб dyno_ процесу "web", які отримують HTTP трафік від роутерів.
  Цей тип dyno має 30-ти секундний тайм-аут для виконання коду.
  Крім того, він засинає, якщо протягом 30-ти хвилин не було запиту для обробки.
  Цей тип dyno цілком підходить для _вебхуків_.

- **Worker dyno**:
  <br> _Worker dyno_ зазвичай використовуються для фонових задач.
  Він НЕ має тайм-ауту і НЕ засинає, якщо не обробляє жодного вебзапиту.
  Він підходить для _тривалого опитування_.

Створіть файл з назвою `Procfile` без розширення в кореневому каталозі нашого проєкту.
Наприклад, `Procfile.txt` і `procfile` не є дійсними.
Далі напишіть цей код одним рядком у такому форматі:

```
<dynos type>: <command for executing our main entry file>
```

Для нашого випадку це повинно бути:

<CodeGroup>
<CodeGroupItem title="Вебхук" active>

```
web: node dist/app.js
```

</CodeGroupItem>
<CodeGroupItem title="Тривале опитування">

```
worker: node dist/bot.js
```

</CodeGroupItem>
</CodeGroup>

### Налаштування Git

Ми збираємося розгорнути нашого бота за допомогою [Git та Heroku Cli](https://devcenter.heroku.com/articles/git).
Ось посилання на інсталяцію:

- [Інструкція для встановлення Git](https://git-scm.com/download/)
- [Інструкція для встановлення Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli#download-and-install)

Припускаємо, що ви вже маєте їх на своєму компʼютері й у вас відкритий термінал в кореневому каталозі нашого проєкту.
Тепер ініціалізуйте локальний репозиторій Git, запустивши цей код у вашому терміналі:

```sh
git init
```

Далі нам потрібно запобігти наданню зайвих файлів нашому серверу production, у цьому випадку `Heroku`.
Створіть файл з назвою `.gitignore` в кореневому каталозі нашого проєкту.
Потім додайте цей список:

```
node_modules/
src/
tsconfig.json
```

Наша кінцева структура каталогів повинна виглядати наступним чином:

<CodeGroup>
<CodeGroupItem title="Вебхук" active>

```asciiart:no-line-numbers
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

</CodeGroupItem>
  <CodeGroupItem title="Тривале опитування">

```asciiart:no-line-numbers
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

</CodeGroupItem>
</CodeGroup>

Збережіть файли у нашому репозиторії Git:

```sh
git add .
git commit -m "Мій перший коміт"
```

### Налаштування віддаленого доступу Heroku

Якщо ви вже створили [застосунок Heroku](https://dashboard.heroku.com/apps/), введіть назву вашого існуючого застосунку (`Existing app`) замість `<мій застосунок>` нижче, а потім запустіть код.
В іншому випадку запустіть новий застосунок (`New app`).

<CodeGroup>
  <CodeGroupItem title="Новий застосунок" active>

```sh
heroku create
git remote -v
```

</CodeGroupItem>
  <CodeGroupItem title="Існуючий застосунок" active>

```sh
heroku git:remote -a <мій застосунок>
```

</CodeGroupItem>
</CodeGroup>

### Розгортання коду

Наостанок, натисніть _червону кнопку_ і стартуємо! :rocket:

```sh
git push heroku main
```

Якщо це не працює, можливо, наша гілка Git називається не `main`, а `master`.
Тоді натисніть _синю кнопку_:

```sh
git push heroku master
```
