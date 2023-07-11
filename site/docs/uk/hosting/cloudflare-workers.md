# Хостинг: Cloudflare Workers (Deno)

[Cloudflare Workers](https://workers.cloudflare.com) --- це загальнодоступна безсерверна обчислювальна платформа, яка пропонує зручне та просте рішення для запуску невеликих обчислень за допомогою парадигми [кордонних обчислень](https://uk.wikipedia.org/wiki/Кордонні_обчислення).

Цей посібник допоможе вам розмістити вашого бота на Cloudflare Workers.

::: tip Шукаєте версію для Node.js?
Цей посібник пояснює, як розгорнути бота Telegram на Cloudflare Workers за допомогою Deno.
Якщо ви шукаєте версію для Node.js, перегляньте [цей посібник](./cloudflare-workers-nodejs).
:::

## Передумови

Щоб продовжити, переконайтеся, що у вас є [обліковий запис Cloudflare](https://dash.cloudflare.com/login) з [налаштованим](https://dash.cloudflare.com/?account=workers) піддоменом worker'ів.

## Налаштування

Переконайтеся, що у вас встановлені [Deno](https://deno.land/) та [Denoflare](https://denoflare.dev/).

Створіть новий каталог, в якому у свою чергу створіть новий файл `.denoflare`.
Внесіть до файлу наступний вміст:

> Примітка: ключове слово "$schema" у наведеному нижче коді JSON вказує на фіксовану версію в URL-адресі, а саме "v0.5.12".
> На момент написання посібник це була остання доступна версія.
> Вам слід оновити її до [найновішої версії](https://github.com/skymethod/denoflare/releases).

```json
{
  "$schema": "https://raw.githubusercontent.com/skymethod/denoflare/v0.5.12/common/config.schema.json",
  "scripts": {
    "my-bot": {
      "path": "bot.ts",
      "localPort": 3030,
      "bindings": {
        "BOT_TOKEN": {
          "value": "<ваш-токен-бота>"
        }
      },
      "workersDev": true
    }
  },
  "profiles": {
    "account1": {
      "accountId": "<ідентифікатор-вашого-акаунта>",
      "apiToken": "<ваш-токен-API>"
    }
  }
}
```

Переконайтеся, що ви замінили `<ідентифікатор-вашого-акаунта>`, `<ваш-токен-API>` і `<ваш-токен-бота>` належним чином.
При створенні токена API ви можете вибрати пресет `Edit Cloudflare Workers` з попередньо налаштованих дозволів.

## Створення вашого бота

Створіть новий файл з назвою `bot.ts` і помістіть в нього наступний вміст:

```ts
import { Bot, webhookCallback } from "https://deno.land/x/grammy/mod.ts";
import { UserFromGetMe } from "https://deno.land/x/grammy/types.ts";

interface Environment {
  BOT_TOKEN: string;
}

let botInfo: UserFromGetMe | undefined = undefined;

export default {
  async fetch(request: Request, env: Environment) {
    try {
      const bot = new Bot(env.BOT_TOKEN, { botInfo });

      if (botInfo === undefined) {
        await bot.init();
        botInfo = bot.botInfo;
      }

      bot.command(
        "start",
        (ctx) => ctx.reply("Ласкаво просимо! Бот запущений."),
      );
      bot.on("message", (ctx) => ctx.reply("Отримав ще одне повідомлення!"));

      const cb = webhookCallback(bot, "cloudflare-mod");

      return await cb(request);
    } catch (e) {
      return new Response(e.message);
    }
  },
};
```

## Розгортання вашого бота

Це так само просто, як бігати:

```sh
denoflare push my-bot
```

У результаті виконання вищенаведеної команди ви отримаєте хост, на якому запущений worker.
Зверніть увагу на рядок, що містить щось на кшталт `<ваш-бот>.<ваш-піддомен>.workers.dev`.
Це хост, на якому ваш бот чекає на виклик.

## Встановлення вашого вебхуку

Нам потрібно повідомити Telegram, куди надсилати оновлення.
Відкрийте свій браузер і відвідайте цей URL:

```text
https://api.telegram.org/bot<токен-бота>/setWebhook?url=https://<назва-бота>.<піддомен>.workers.dev/
```

Замініть `<токен-бота>`, `<назва-бота>` та `<піддомен>` своїми значеннями.
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
Просто запустіть наступну команду:

```sh
denoflare serve my-bot
```

Після запуску сервера розробки ви можете протестувати свого бота, надсилаючи приклади оновлень до нього за допомогою певних інструментів, як-от `curl`, [Insomnia](https://insomnia.rest) або [Postman](https://postman.com).
Для прикладів оновлень зверніться [сюди](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates), а для отримання додаткової інформації про структуру оновлень зверніться [сюди](https://core.telegram.org/bots/api#update).
