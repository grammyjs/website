# Hosting: Supabase Edge Functions

<Tag type="deno"/>

Esta guía te explica cómo puedes alojar tus bots de grammY en [Supabase](https://supabase.com/).

Ten en cuenta que necesitas tener una cuenta de [GitHub](https://github.com) antes de poder utilizar [Supabase Edge Functions](https://supabase.com/docs/guides/functions).
Además, Supabase Edge Functions se basa en [Deno Deploy](https://deno.com/deploy), así que al igual que [nuestra guía de Deno Deploy](./deno-deploy.md), esta guía es sólo para usuarios de Deno de grammY.

Supabase Edge Functions es ideal para la mayoría de los bots simples, y debes tener en cuenta que no todas las características de Deno están disponibles para las aplicaciones que se ejecutan en Supabase Edge Functions.
Por ejemplo, no hay sistema de archivos en Supabase Edge Functions.
Es igual que las otras plataformas sin servidor, pero dedicado a las aplicaciones de Deno.

El resultado de este tutorial [se puede ver en nuestro repositorio de bots de ejemplo](https://github.com/grammyjs/examples/tree/main/supabase-edge-functions).

## Configuración

Para desplegar una función de borde de Supabase, necesitarás crear una cuenta de Supabase, instalar su CLI, y crear un proyecto de Supabase.
Primero debes [seguir su documentación](https://supabase.com/docs/guides/functions#prerequisites) para configurar las cosas.

Crea una nueva Función Supabase ejecutando este comando:

```sh
supabase functions new telegram-bot
```

Una vez que hayas creado un proyecto de Supabase Function, puedes escribir tu bot.

## Preparando tu código

> Recuerda que necesitas [ejecutar tu bot en webhhoks](../guide/deployment-types.md#cómo-usar-webhooks), por lo que debes usar `webhookCallback` y no llamar a `bot.start()` en tu código.

Puedes utilizar este breve ejemplo de bot como punto de partida.

```ts
import { serve } from "https://deno.land/std/http/server.ts";
import { Bot, webhookCallback } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot(Deno.env.get("BOT_TOKEN") ?? "");

bot.command("start", (ctx) => ctx.reply("¡Bienvenido! En marcha");
bot.command("ping", (ctx) => ctx.reply(`¡Pong! ${new Date()}`));

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

## Despliegue

Ahora puedes desplegar tu bot en Supabase.
Ten en cuenta que tendrás que deshabilitar la autorización JWT porque Telegram utiliza una forma diferente de asegurarse de que las peticiones provienen de Telegram.
Puedes desplegar la función usando este comando.

```sh
supabase functions deploy --no-verify-jwt telegram-bot
```

A continuación, tienes que dar tu token de bot a Supabase para que tu código tenga acceso a él como variable de entorno.

```sh
# Reemplaza 123:aBcDeF-gh con tu token de bot real.
supabase secrets set BOT_TOKEN=123:aBcDeF-gh
```

Tu función Supabase ya está funcionando.
Todo lo que queda por hacer es decirle a Telegram dónde enviar las actualizaciones.
Puedes hacerlo llamando a `setWebhook`.
Por ejemplo, abre una nueva pestaña en tu navegador y visita esta URL:

```plaintext
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<PROJECT_NAME>.functions.supabase.co/telegram-bot?secret=<BOT_TOKEN>
```

Sustituye `<BOT_TOKEN>` por tu token de bot real.
Además, sustituye la segunda aparición de `<BOT_TOKEN>` por tu token de bot real.
Sustituye `<PROJECT_NAME>` por el nombre de tu proyecto Supabase.

Ahora deberías ver esto en la ventana de tu navegador.

```json
{ "ok": true, "result": true, "description": "Webhook was set" }
```

Ya está.
Tu bot ya está funcionando.
Dirígete a Telegram y observa cómo responde a los mensajes.
