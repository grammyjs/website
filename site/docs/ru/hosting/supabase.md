---
prev: false
next: false
---

# Хостинг: Supabase Edge Functions

В этом руководстве рассказывается о том, как разместить своих ботов grammY на
[Supabase](https://supabase.com/).

Обратите внимание, что перед использованием
[Supabase Edge Functions](https://supabase.com/docs/guides/functions/quickstart)
вам необходимо иметь аккаунт на [GitHub](https://github.com). Более того,
Supabase Edge Functions основаны на [Deno Deploy](https://deno.com/deploy),
поэтому, как и [наше руководство по Deno Deploy](./deno-deploy), это руководство
предназначено только для пользователей Deno для grammY.

Supabase Edge Functions идеально подходит для большинства простых ботов, при
этом следует учитывать, что не все функции Deno доступны для приложений,
работающих на Supabase Edge Functions. Например, на Supabase Edge Functions нет
файловой системы. Она такая же, как и на многих других бессерверных платформах,
но предназначена для приложений Deno.

Результат этого урока
[можно увидеть в нашем репозитории примеров ботов](https://github.com/grammyjs/examples/tree/main/setups/supabase-edge-functions).

## Установка

Чтобы развернуть Supabase Edge Function, вам нужно создать учетную запись
Supabase, установить их CLI и создать проект Supabase. Сначала вам следует
[следовать их документации](https://supabase.com/docs/guides/functions/quickstart#step-1-create-or-configure-your-project),
чтобы все настроить.

Создайте новую функцию Supabase Function, выполнив следующую команду:

```sh
supabase functions new telegram-bot
```

Создав проект Supabase Function, вы можете написать своего бота.

## Настройка

> Помните, что вам нужно
> [запускать бота на вебхуках](../guide/deployment-types#как-использовать-вебхуки),
> поэтому в коде следует использовать `webhookCallback`, а не вызывать
> `bot.start()`.

Вы можете использовать этот короткий пример бота в качестве отправной точки.

```ts
import { Bot, webhookCallback } from "https://deno.land/x/grammy/mod.ts";

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN не установлен");

const bot = new Bot(token);

bot.command(
  "start",
  (ctx) => ctx.reply("Добро пожаловать! Запущен и работаю."),
);
bot.command("ping", (ctx) => ctx.reply(`Понг! ${new Date()}`));

const handleUpdate = webhookCallback(bot, "std/http");

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    if (url.searchParams.get("secret") !== bot.token) {
      return new Response("not allowed", { status: 405 });
    }
    return await handleUpdate(req);
  } catch (err) {
    console.error(err);
  }
  return new Response();
});
```

## Развертывание

Теперь вы можете развернуть своего бота на Supabase. Обратите внимание, что вам
придется отключить JWT-авторизацию, поскольку Telegram использует другой способ
убедиться, что запросы поступают от Telegram. Вы можете развернуть функцию с
помощью этой команды.

```sh
supabase functions deploy --no-verify-jwt telegram-bot
```

Далее необходимо передать токен бота в Supabase, чтобы ваш код имел к нему
доступ как к переменной окружения.

```sh
# Замените 123:aBcDeF-gh на свой настоящий токен бота.
supabase secrets set BOT_TOKEN=123:aBcDeF-gh
```

Ваш Supabase Function теперь работает. Осталось только указать Telegram, куда
отправлять обновления. Это можно сделать с помощью вызова `setWebhook`.
Например, откройте новую вкладку в браузере и перейдите по этому URL:

```text
https://api.telegram.org/bot<токен>/setWebhook?url=https://<ID_ПРОЕКТА>.supabase.co/functions/v1/telegram-bot?secret=<токен>
```

Замените `<токен>` на ваш настоящий токен бота. Также замените второй
`<токен>` на ваш реальный токен бота. Замените `<ID_ПРОЕКТА>` на
идентификатор ссылки вашего проекта Supabase.

Теперь вы должны увидеть это в окне браузера.

```json
{ "ok": true, "result": true, "description": "Webhook was set" }
```

Готово! Теперь ваш бот работает. Перейдите в Telegram и посмотрите, как он
отвечает на сообщения!
