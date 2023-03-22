# Хостинг: Supabase Edge Functions

Цей посібник розповість вам, як ви можете розмістити ваших ботів grammY на [Supabase](https://supabase.com/).

Зверніть увагу, що вам потрібен обліковий запис [GitHub](https://github.com), перш ніж ви зможете використовувати [Supabase Edge Functions](https://supabase.com/docs/guides/functions).
Крім того, Supabase Edge Functions базуються на [Deno Deploy](https://deno.com/deploy), тому, як і в [нашому посібнику з Deno Deploy](./deno-deploy.md), цей посібник призначений тільки для користувачів Deno в grammY.

Supabase Edge Functions ідеально підходить для більшості простих ботів, і вам слід знати, що не всі можливості Deno доступні для додатків, що працюють на Supabase Edge Functions.
Наприклад, на Supabase Edge Functions немає файлової системи.
Це так само, як і в багатьох інших безсерверних платформах, присвячених додаткам на Deno.

The result of this tutorial [can be seen in our example bots repository](https://github.com/grammyjs/examples/tree/main/supabase-edge-functions).

Результат цього підручника можна переглянути в [нашому репозиторії прикладних програм-ботів](https://github.com/grammyjs/examples/tree/main/supabase-edge-functions).

## Налаштування

Щоб розгорнути функцію Supabase Edge, вам потрібно створити обліковий запис Supabase, встановити їхній інтерфейс командного рядка та створити проєкт Supabase.
Спочатку вам слід ознайомитися з [їхньою документацією](https://supabase.com/docs/guides/functions#prerequisites) та встановити необхідне програмне забезпечення.

Створіть нову функцію Supabase, запустивши цю команду:

```sh
supabase functions new telegram-bot
```

Після створення проєкту функції Supabase ви можете написати свого бота.

## Підготовка вашого коду

> Не забудьте, що вам потрібно [запустити свого бота на вебхуках](../guide/deployment-types.md#how-to-use-webhooks), тому вам слід використовувати `webhookCallback` і не викликати `bot.start()` у своєму коді.

Ви можете використати цей короткий приклад бота як початкову точку.

```ts
import { serve } from "https://deno.land/std/http/server.ts";
import { Bot, webhookCallback } from "https://deno.land/x/grammy/mod.ts";

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN is unset");

const bot = new Bot(token);

bot.command("start", (ctx) => ctx.reply("Ласкаво просимо! Бот працює."));
bot.command("ping", (ctx) => ctx.reply(`Понг! ${new Date()}`));

const handleUpdate = webhookCallback(bot, "std/http");

serve(async (req) => {
  try {
    const url = new URL(req.url);
    if (url.searchParams.get("secret") !== bot.token) {
      return new Response("not allowed", { status: 405 });
    }
    return await handleUpdate(req);
  } catch (err) {
    console.error(err);
  }
});
```

## Розгортання

Тепер ви можете розгорнути свого бота на Supabase.
Зверніть увагу, що вам потрібно вимкнути авторизацію JWT, оскільки Telegram використовує інший спосіб переконатися, що запити надходять саме з Telegram.
Ви можете розгорнути функцію за допомогою цієї команди.

```sh
supabase functions deploy --no-verify-jwt telegram-bot
```

Далі вам потрібно передати токен вашого бота Supabase, щоб ваш код мав до нього доступ як змінну середовища.

```sh
# Замініть 123:aBcDeF-gh на ваш реальний токен від бота.
supabase secrets set BOT_TOKEN=123:aBcDeF-gh
```

Ваша функція Supabase працює.
Все, що залишається зробити, це повідомити Telegram, куди надсилати оновлення.
Ви можете це зробити, викликавши `setWebhook`.
Наприклад, відкрийте нову вкладку у вашому браузері та перейдіть за цим посиланням:

```plaintext
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<PROJECT_NAME>.functions.supabase.co/telegram-bot?secret=<BOT_TOKEN>
```

Замініть `<BOT_TOKEN>` на свій реальний токен бота.
Також замініть друге входження `<BOT_TOKEN>` на свій реальний токен бота.
Замініть `<PROJECT_NAME>` на назву вашого проєкту Supabase.

Тепер ви повинні побачити це на сторінці вашого браузера.

```json
{ "ok": true, "result": true, "description": "Webhook was set" }
```

Готово!
Ваш бот працює.
Перейдіть до Telegram та спостерігайте, як бот реагує на повідомлення!
