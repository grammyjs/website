# Хостинг: Supabase Edge Functions

Цей посібник розповість вам, як ви можете розмістити ваших ботів grammY на [Supabase](https://supabase.com/).

Зверніть увагу, що вам потрібен обліковий запис [GitHub](https://github.com), перш ніж ви зможете використовувати [Supabase Edge Functions](https://supabase.com/docs/guides/functions).
Крім того, Supabase Edge Functions базуються на [Deno Deploy](https://deno.com/deploy), тому, як і [посібник по Deno Deploy](./deno-deploy.md), цей посібник призначений тільки для користувачів Deno.

Supabase Edge Functions ідеально підходить для більшості простих ботів, але вам слід знати, що не всі можливості Deno доступні для застосунків, що працюють на Supabase Edge Functions.
Наприклад, на Supabase Edge Functions немає файлової системи.
Це така ж платформа, як і багато інших безсерверних платформ, але призначена для застосунків на Deno.

Результат цього посібника можна переглянути в [репозиторії з прикладами ботів](https://github.com/grammyjs/examples/tree/main/supabase-edge-functions).

## Налаштування

Щоб розгорнутися на Supabase Edge Function, вам потрібно створити обліковий запис Supabase, встановити їхній CLI (інтерфейс командного рядка) та створити проєкт Supabase.
Спочатку вам слід ознайомитися з [їхньою документацією](https://supabase.com/docs/guides/functions#prerequisites) та встановити необхідне програмне забезпечення.

Створіть новий проєкт Supabase Function, запустивши цю команду:

```sh
supabase functions new telegram-bot
```

Після створення проєкту Supabase Function ви можете написати свого бота.

## Підготовка вашого коду

> Не забудьте, що вам потрібно [запустити свого бота на вебхуках](../guide/deployment-types.md#як-використвувати-вебхуки), тому вам слід використовувати `webhookCallback` і не викликати `bot.start()` у своєму коді.

Для початку ви можете скористатися цим простим прикладом бота.

```ts
import { serve } from "https://deno.land/std/http/server.ts";
import { Bot, webhookCallback } from "https://deno.land/x/grammy/mod.ts";

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN не встановлено");

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
Зверніть увагу, що вам потрібно вимкнути авторизацію JWT, оскільки Telegram використовує інший спосіб перевірки того, що запити надходять саме від Telegram.
Ви можете розгорнути проєкт за допомогою цієї команди.

```sh
supabase functions deploy --no-verify-jwt telegram-bot
```

Далі вам потрібно передати токен вашого бота Supabase як змінну середовища, щоб ваш код мав до нього доступ.

```sh
# Замініть 123:aBcDeF-gh на ваш реальний токен бота.
supabase secrets set BOT_TOKEN=123:aBcDeF-gh
```

Тепер ваш проєкт на Supabase Function працює.
Все, що залишається зробити, це повідомити Telegram, куди надсилати оновлення.
Ви можете це зробити, викликавши `setWebhook`.
Наприклад, відкрийте нову вкладку у вашому браузері та перейдіть за цим посиланням:

```plaintext
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<PROJECT_NAME>.functions.supabase.co/telegram-bot?secret=<BOT_TOKEN>
```

Замініть `<BOT_TOKEN>` на свій реальний токен бота.
Також замініть другий аргумент `<BOT_TOKEN>` на свій реальний токен бота.
Замініть `<PROJECT_NAME>` на назву вашого проєкту Supabase.

Тепер ви повинні побачити на сторінці вашого браузера наступний текст.

```json
{ "ok": true, "result": true, "description": "Webhook was set" }
```

Готово!
Ваш бот працює.
Перейдіть до Telegram та подивіться, як бот відповідає на повідомлення!
