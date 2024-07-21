---
prev: false
next: false
---

# Хостинг: Cloudflare Workers (Deno)

[Cloudflare Workers](https://workers.cloudflare.com) --- это публичная платформа для бессерверных вычислений, которая предлагает удобное и простое решение для выполнения небольших рабочих нагрузок на [edge](https://en.wikipedia.org/wiki/Edge_computing).

Это руководство проведет вас через процесс размещения вашего бота на Cloudflare Workers.

::: tip Ищете версию для Node.js?
В этом руководстве объясняется, как развернуть бота Telegram на Cloudflare Workers с помощью Deno.
Если вы ищете версию для Node.js, пожалуйста, ознакомьтесь с [этим руководством](./cloudflare-workers-nodejs).
:::

## Необходимые условия

Чтобы следовать дальше, убедитесь, что у вас есть [учетная запись Cloudflare](https://dash.cloudflare.com/login) с рабочим, [настроенным](https://dash.cloudflare.com/?account=workers) поддоменом.

## Настройка

Убедитесь, что у вас установлены [Deno](https://deno.com) и [Denoflare](https://denoflare.dev).

Создайте новый каталог и создайте новый файл `.denoflare` в этом каталоге.
Поместите в этот файл следующее содержимое:

> Примечание: Ключ «$schema» в следующем JSON-коде указывает на фиксированную версию в своем URL («v0.5.12»).
> На момент написания статьи это была последняя доступная версия.
> Вам следует обновить их до [самой новой версии](https://github.com/skymethod/denoflare/releases).

```json{2,9,17-18}
{
  "$schema": "https://raw.githubusercontent.com/skymethod/denoflare/v0.5.12/common/config.schema.json",
  "scripts": {
    "my-bot": {
      "path": "bot.ts",
      "localPort": 3030,
      "bindings": {
        "BOT_TOKEN": {
          "value": "ВАШ_ТОКЕН_БОТА"
        }
      },
      "workersDev": true
    }
  },
  "profiles": {
    "account1": {
      "accountId": "ВАШ_АККАУНТ_ID",
      "apiToken": "ВАШ_API_ТОКЕН"
    }
  }
}
```

Обязательно замените `ВАШ_АККАУНТ_ID`, `ВАШ_API_ТОКЕН` и `ВАШ_ТОКЕН_БОТА` соответствующим образом.
При создании API-токена вы можете выбрать предустановку `Edit Cloudflare Workers` из предварительно настроенных разрешений.

## Создание бота

Создайте новый файл с именем `bot.ts` и поместите в него следующее содержимое:

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

      bot.command("start", (ctx) => ctx.reply("Добро пожаловать! Запущен и работаю."));
      bot.on("message", (ctx) => ctx.reply("Получил сообщение!"));

      const cb = webhookCallback(bot, "cloudflare-mod");

      return await cb(request);
    } catch (e) {
      return new Response(e.message);
    }
  },
};
```

## Развертывание вашего бота

Это так же просто, как бегать:

```sh
denoflare push my-bot
```

В результате выполнения этой команды вы получите информацию о хосте, на котором запущен worker.
Обратите внимание на строку, содержащую что-то вроде `<МОЙ_БОТ>.<МОЙ_ПОДДОМЕН>.workers.dev`.
Это хост, на котором ваш бот ожидает вызова.

## Настройка вебхука

Нам нужно указать Telegram, куда отправлять обновления.
Откройте браузер и перейдите по этому URL-адресу:

```text
https://api.telegram.org/bot<ТОКЕН_БОТА>/setWebhook?url=https://<МОЙ_БОТ>.<МОЙ_ПОДДОМЕН>.workers.dev/
```

Замените `<ТОКЕН_БОТА>`, `<МОЙ_БОТ>` и `<МОЙ_ПОДДОМЕН>` своими значениями.
Если настройка прошла успешно, вы увидите JSON-ответ следующего вида:

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

Для тестирования и отладки вы можете запустить локальный или удаленный сервер разработки перед развертыванием бота в производстве.
Просто выполните следующую команду:

```sh
denoflare serve my-bot
```

После запуска сервера разработки вы можете протестировать своего бота, отправив ему примеры обновлений с помощью таких инструментов, как `curl`, [Insomnia](https://insomnia.rest) или [Postman](https://postman.com).
Примеры обновлений см. на [здесь](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates), а более подробную информацию о структуре обновлений [здесь](https://core.telegram.org/bots/api#update).
