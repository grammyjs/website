---
prev: false
next: false
---

# Alojamiento: Cloudflare Workers (Deno)

[Cloudflare Workers](https://workers.cloudflare.com) es una plataforma pública de computación sin servidor que ofrece una solución cómoda y sencilla para ejecutar pequeñas cargas de trabajo en el [edge](https://en.wikipedia.org/wiki/Edge_computing).

Esta guía te llevará a través del proceso de alojar tu bot en Cloudflare Workers.

::: tip ¿Buscas la versión de Node.js?
Este tutorial explica cómo implementar un bot de Telegram en Cloudflare Workers usando Deno.
Si estás buscando la versión Node.js, por favor consulta [este tutorial](./cloudflare-workers-nodejs) en su lugar.
:::

## Requisitos previos

Para seguir adelante, por favor asegúrese de que tiene una [cuenta de Cloudflare](https://dash.cloudflare.com/login) con su subdominio de workers [configurado](https://dash.cloudflare.com/?account=workers).

## Puesta a punto

Asegúrate de tener instalados [Deno](https://deno.land) y [Denoflare](https://denoflare.dev).

Cree un nuevo directorio, y cree un nuevo archivo `.denoflare` en ese directorio.
Ponga el siguiente contenido en el archivo:

> Nota: La clave "$schema" en el siguiente código JSON especifica una versión fija en su URL ("v0.5.12").
> En el momento de escribir esto, esta era la última versión disponible.
> Debería actualizarlos a la [versión más reciente](https://github.com/skymethod/denoflare/releases).

```json{2,9,17-18}
{
  "$schema": "https://raw.githubusercontent.com/skymethod/denoflare/v0.5.12/common/config.schema.json",
  "scripts": {
    "my-bot": {
      "path": "bot.ts",
      "localPort": 3030,
      "bindings": {
        "BOT_TOKEN": {
          "value": "YOUR_BOT_TOKEN"
        }
      },
      "workersDev": true
    }
  },
  "profiles": {
    "account1": {
      "accountId": "YOUR_ACCOUNT_ID",
      "apiToken": "YOUR_API_TOKEN"
    }
  }
}
```

Asegúrate de reemplazar `YOUR_ACCOUNT_ID`, `YOUR_API_TOKEN`, y `YOUR_BOT_TOKEN` apropiadamente.
Al crear su token de API, puede elegir el preajuste "Editar Cloudflare Workers" de los permisos preconfigurados.

## Creando tu Bot

Crea un nuevo fichero llamado `bot.ts` y pon en él el siguiente contenido:

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

      bot.command("start", (ctx) => ctx.reply("¡Bienvenido! En marcha."));
      bot.on("message", (ctx) => ctx.reply("¡Recibí otro mensaje!"));

      const cb = webhookCallback(bot, "cloudflare-mod");

      return await cb(request);
    } catch (e) {
      return new Response(e.message);
    }
  },
};
```

## Desplegando tu Bot

Es tan fácil como correr:

```sh
denoflare push my-bot
```

La salida del comando anterior le proporcionará el host en el que se está ejecutando el trabajador.
Busca una línea que contenga algo como `<MY_BOT>.<MY_SUBDOMAIN>.workers.dev`.
Ese es el host donde tu bot está esperando a ser llamado.

## Configurando tu Webhook

Necesitamos decirle a Telegram a dónde enviar las actualizaciones.
Abre tu navegador y visita esta URL:

```text
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<MY_BOT>.<MY_SUBDOMAIN>.workers.dev/
```

Sustituye `<BOT_TOKEN>`, `<MY_BOT>`, y `<MY_SUBDOMAIN>` por tus valores.
Si la configuración se realiza correctamente, verá una respuesta JSON como esta:

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

## Probando tu Bot

Abre tu aplicación de Telegram, e inicia tu bot.
Si responde, ¡significa que estás listo!

## Depurando tu Bot

Para propósitos de prueba y depuración, puedes ejecutar un servidor de desarrollo local o remoto antes de desplegar tu bot en producción.
Simplemente ejecuta el siguiente comando:

```sh
denoflare serve my-bot
```

Una vez que el servidor de desarrollo se haya iniciado, puedes probar tu bot enviándole actualizaciones de ejemplo utilizando herramientas como `curl`, [Insomnia](https://insomnia.rest), o [Postman](https://postman.com).
Consulta [aquí](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates) para ver ejemplos de actualizaciones y [aquí](https://core.telegram.org/bots/api#update) para obtener más información sobre la estructura de actualizaciones.
