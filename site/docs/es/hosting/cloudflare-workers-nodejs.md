---
prev: false
next: false
---

# Alojamiento: Cloudflare Workers (Node.js)

[Cloudflare Workers](https://workers.cloudflare.com) es una plataforma pública de computación sin servidor que ofrece una solución conveniente y simple para ejecutar JavaScript en el [borde](https://en.wikipedia.org/wiki/Edge_computing).
Al tener la capacidad de manejar tráfico HTTP y estar basado en la [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), construir bots para Telegram se convierte en algo muy sencillo.
Además, puedes incluso desarrollar [Web Apps](https://core.telegram.org/bots/webapps) en el edge, todo gratis dentro de ciertas cuotas.

Esta guía te llevará a través del proceso de alojar tus bots de Telegram en Cloudflare Workers.

::: tip ¿Buscas la versión de Deno?
Este tutorial explica cómo implementar un bot de Telegram en Cloudflare Workers usando Node.js.
Si estás buscando la versión Deno, por favor revisa [este tutorial](./cloudflare-workers) en su lugar.
:::

## Requisitos previos

1. una [cuenta Cloudflare](https://dash.cloudflare.com/login) con el subdominio de tus trabajadores [configurado](https://dash.cloudflare.com/?account=workers).
2. un entorno [Node.js](https://nodejs.org/) con `npm` instalado.

## Puesta a punto

En primer lugar, crea un nuevo proyecto:

```sh
npm create cloudflare@latest
```

A continuación, se le pedirá que introduzca el nombre del worker:

```ansi{6}
using create-cloudflare version 2.17.1

╭ Create an application with Cloudflare Step 1 of 3
│
╰ In which directory do you want to create your application? also used as application name  // [!code focus]
  ./grammybot  // [!code focus]
```

Aquí creamos un proyecto llamado `grammybot`, puedes elegir el tuyo, este será el nombre de tu trabajador así como una parte de la URL de la petición.

::: tip
Puedes cambiar el nombre de tu trabajador en `wrangler.toml` más tarde.
:::

A continuación, se le pedirá que seleccione el tipo de su worker, aquí elegimos `"Hello World" Worker`:

```ansi{8}
using create-cloudflare version 2.17.1

╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./grammybot
│
╰ What type of application do you want to create?  // [!code focus]
  ● "Hello World" Worker  // [!code focus]
  ○ "Hello World" Worker (Python)  // [!code focus]
  ○ "Hello World" Durable Object  // [!code focus]
  ○ Website or web app  // [!code focus]
  ○ Example router & proxy Worker  // [!code focus]
  ○ Scheduled Worker (Cron Trigger)  // [!code focus]
  ○ Queue consumer & producer Worker  // [!code focus]
  ○ API starter (OpenAPI compliant)  // [!code focus]
  ○ Worker built from a template hosted in a git repository  // [!code focus]
```

A continuación, se le pedirá que elija si desea utilizar TypeScript, si desea utilizar JavaScript, elija `No`.
Aquí elegimos `Sí`:

```ansi{11}
using create-cloudflare version 2.17.1

╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./grammybot
│
├ What type of application do you want to create?
│ type "Hello World" Worker
│
╰ Do you want to use TypeScript?  // [!code focus]
  Yes / No  // [!code focus]
```

Tu proyecto se configurará en unos minutos.
Después de eso, se le preguntará si desea utilizar git para el control de versiones, elija `Sí` si desea que el repositorio se inicialice automáticamente o `No` si desea inicializarlo usted mismo más tarde.

Aquí elegimos `Sí`:

```ansi{36}
using create-cloudflare version 2.17.1

╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./grammybot
│
├ What type of application do you want to create?
│ type "Hello World" Worker
│
├ Do you want to use TypeScript?
│ yes typescript
│
├ Copying template files
│ files copied to project directory
│
├ Updating name in `package.json`
│ updated `package.json`
│
├ Installing dependencies
│ installed via `npm install`
│
╰ Application created

╭ Configuring your application for Cloudflare Step 2 of 3
│
├ Installing @cloudflare/workers-types
│ installed via npm
│
├ Adding latest types to `tsconfig.json`
│ added @cloudflare/workers-types/2023-07-01
│
├ Retrieving current workerd compatibility date
│ compatibility date 2024-04-05
│
╰ Do you want to use git for version control?  // [!code focus]
  Yes / No  // [!code focus]
```

Por último, se te preguntará si quieres desplegar tu worker, elige `No`, ya que vamos a desplegarlo cuando tengamos un bot de Telegram funcionando:

```ansi{49}
using create-cloudflare version 2.17.1

╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./grammybot
│
├ What type of application do you want to create?
│ type "Hello World" Worker
│
├ Do you want to use TypeScript?
│ yes typescript
│
├ Copying template files
│ files copied to project directory
│
├ Updating name in `package.json`
│ updated `package.json`
│
├ Installing dependencies
│ installed via `npm install`
│
╰ Application created

╭ Configuring your application for Cloudflare Step 2 of 3
│
├ Installing @cloudflare/workers-types
│ installed via npm
│
├ Adding latest types to `tsconfig.json`
│ added @cloudflare/workers-types/2023-07-01
│
├ Retrieving current workerd compatibility date
│ compatibility date 2024-04-05
│
├ Do you want to use git for version control?
│ yes git
│
├ Initializing git repo
│ initialized git
│
├ Committing new files
│ git commit
│
╰ Application configured

╭ Deploy with Cloudflare Step 3 of 3
│
╰ Do you want to deploy your application?  // [!code focus]
  Yes / No  // [!code focus]
```

## Instalación de dependencias

`cd` en `grammybot` (sustitúyalo por el nombre de su worker que estableció anteriormente), instale `grammy` y otros paquetes que pueda necesitar:

```sh
npm install grammy
```

## Creando tu Bot

Edita `src/index.js` o `src/index.ts`, y escribe este código dentro:

```ts{11,28-29,38,40-42,44}
/**
 * ¡Bienvenido a Cloudflare Workers! Este es su primer worker.
 *
 * - Ejecute `npm run dev` en su terminal para iniciar un servidor de desarrollo
 * - Abra una pestaña del navegador en http://localhost:8787/ para ver su worker en acción
 * - Ejecute `npm run deploy` para publicar su worker
 *
 * Más información en https://developers.cloudflare.com/workers/
 */

import { Bot, Context, webhookCallback } from "grammy";

export interface Env {
  // Ejemplo de vinculación a KV. Más información en https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Ejemplo de enlace a un objeto duradero. Más información en https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Ejemplo de enlace a R2. Más información en https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  //
  // Ejemplo de vinculación a un servicio. Más información en https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
  //
  // Ejemplo de enlace a una cola. Más información en https://developers.cloudflare.com/queues/javascript-apis/
  // MY_QUEUE: Queue;
  BOT_INFO: string;
  BOT_TOKEN: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const bot = new Bot(env.BOT_TOKEN, { botInfo: JSON.parse(env.BOT_INFO) });

    bot.command("start", async (ctx: Context) => {
      await ctx.reply("¡Hola, mundo!");
    });

    return webhookCallback(bot, "cloudflare-mod")(request);
  },
};
```

Aquí, primero importamos `Bot`, `Context` y `webhookCallback` de `grammy`.

Dentro de la interfaz `Env`, añadimos una variable `BOT_INFO`, esta es una variable de entorno que almacena la información de tu bot, puedes obtener la información de tu bot llamando a Telegram Bot API con el método `getMe`.
Abre este enlace en tu navegador web:

```ansi:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/getMe
```

Sustituye `<BOT_TOKEN>` por tu bot token.
Si tiene éxito, verá una respuesta JSON similar a esta:

```json{3-12}
{
    "ok": true,
    "result": {
        "id": 1234567890,
        "is_bot": true,
        "first_name": "mybot",
        "username": "MyBot",
        "can_join_groups": true,
        "can_read_all_group_messages": false,
        "supports_inline_queries": true,
        "can_connect_to_business": false
    }
}
```

Ahora, abre `wrangler.toml` en la raíz de tu proyecto y añade una variable de entorno `BOT_INFO` en la sección `[vars]` con el valor del objeto `result` que obtuviste arriba de esta manera:

```toml
[vars]
BOT_INFO = """{
    "id": 1234567890,
    "is_bot": true,
    "first_name": "mybot",
    "username": "MyBot",
    "can_join_groups": true,
    "can_read_all_group_messages": false,
    "supports_inline_queries": true,
    "can_connect_to_business": false
}"""
```

Sustituye la información del bot por la que obtengas del navegador web.
Presta atención a las tres comillas dobles `"""` al principio y al final.

Además de `BOT_INFO`, también añadimos una variable `BOT_TOKEN`, esta es una variable de entorno que almacena tu bot token que se utiliza para crear tu bot.

Puedes notar que acabamos de definir la variable `BOT_TOKEN`, pero no la hemos asignado todavía.
Normalmente necesitas almacenar tu variable de entorno en `wrangler.toml`, sin embargo, esto no es seguro en nuestro caso, ya que el bot token debe mantenerse en secreto.
Cloudflare Workers nos proporciona una forma segura de almacenar información sensible como claves API y auth tokens en la variable de entorno: ¡[secrets](https://developers.cloudflare.com/workers/configuration/secrets/#secrets-on-deployed-workers)!

::: tip
Los valores secretos no son visibles en Wrangler ni en el panel de Cloudflare una vez definidos.
:::

Puedes añadir un secreto a tu proyecto utilizando el siguiente comando:

```sh
npx wrangler secret put BOT_TOKEN
```

Sigue las instrucciones e introduce tu bot token, tu bot token será cargado y encriptado.

::: tip
Puedes cambiar el nombre que quieras para las variables de entorno, pero ten en cuenta que harás lo mismo en los pasos siguientes.
:::

Dentro de la función `fetch()`, creamos un bot con `BOT_TOKEN` que responde "¡Hola, mundo!" cuando recibe `/start`.

## Despliegue de su bot

Ahora, puedes desplegar tu bot usando el siguiente comando:

```sh
npm run deploy
```

## Configurando tu Webhook

Necesitamos decirle a Telegram a dónde enviar las actualizaciones.
Abre tu navegador y visita esta URL:

```ansi:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<MY_BOT>.<MY_SUBDOMAIN>.workers.dev/
```

Sustituye `<BOT_TOKEN>` por tu token de bot, sustituye `<MY_BOT>` por el nombre de tu worker, sustituye `<MY_SUBDOMAIN>` por el subdominio de tu worker configurado en el panel de control de Cloudflare.

Si la configuración es correcta, verás una respuesta JSON como esta:

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

En un entorno de desarrollo, tu bot no tiene acceso a tus variables de entorno secretas.
Así que, [según Cloudflare](https://developers.cloudflare.com/workers/configuration/secrets/#local-development-with-secrets), puedes crear un archivo `.dev.vars` en la raíz de tu proyecto para definir secretos:

```env
BOT_TOKEN=<your_bot_token>  # <- reemplazar esto con su token bot.
```

No olvides añadir `BOT_INFO` también para el desarrollo.
Pulsa [aquí](https://developers.cloudflare.com/workers/configuration/environment-variables/) y [aquí](https://developers.cloudflare.com/workers/configuration/secrets/) para más detalles sobre variables de entorno y secretos.

Sustituye `BOT_INFO` y `BOT_TOKEN` por tu valor si cambias el nombre de la variable de entorno en el paso anterior.

::: tip
Puedes utilizar un bot token diferente para el desarrollo para asegurarte de que no afecta a la producción.
:::

Ahora, puede ejecutar el siguiente comando para iniciar un servidor de desarrollo:

```sh
npm run dev
```

Una vez iniciado el servidor de desarrollo, puedes probar tu bot enviándole actualizaciones de ejemplo utilizando herramientas como `curl`, [Insomnia](https://insomnia.rest), o [Postman](https://postman.com).
Consulta [aquí](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates) para ejemplos de actualización y [aquí](https://core.telegram.org/bots/api#update) para más información sobre la estructura de actualización.

Si no quieres construir la actualización, o si quieres probar con una actualización real, puedes obtener la actualización desde Telegram Bot API con el método `getUpdates`.
Para ello, primero tendrás que eliminar el webhook.
Abre tu navegador web y visita este enlace:

```ansi:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/deleteWebhook
```

Sustituye `<BOT_TOKEN>` por tu bot token, verás una respuesta JSON como esta:

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was deleted"
}
```

A continuación, abre tu cliente de Telegram y envía algo al bot, por ejemplo, envía `/start`.

Ahora visita este enlace en tu navegador web para obtener las actualizaciones:

```ansi:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
```

De nuevo, sustituye `<BOT_TOKEN>` por tu bot token, si tiene éxito, verás una respuesta JSON similar a esta:

```json{4-29}
{
    "ok": true,
    "result": [
        {
            "update_id": 123456789,
            "message": {
                "message_id": 123,
                "from": {
                    "id": 987654321,
                    "is_bot": false,
                    "first_name": "",
                    "language_code": "en"
                },
                "chat": {
                    "id": 987654321,
                    "first_name": "",
                    "type": "private"
                },
                "date": 1712803046,
                "text": "/start",
                "entities": [
                    {
                        "offset": 0,
                        "length": 6,
                        "type": "bot_command"
                    }
                ]
            }
        }
    ]
}
```

`result` es un array de objetos de actualización (arriba sólo contiene un objeto de actualización), deberías copiar sólo un objeto y probar tu bot enviando este objeto al servidor de desarrollo con las herramientas mencionadas arriba.

Si quieres ignorar las actualizaciones obsoletas (por ejemplo, ignorar todas las actualizaciones durante el desarrollo antes de desplegarlas en el entorno de producción), puedes añadir un parámetro `offset` al método `getUpdates` como este:

```ansi:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/getUpdates?offset=<update_id>
```

Sustituye `<BOT_TOKEN>` por tu token de bot, y sustituye `<update_id>` por el `update_id` de la última actualización que hayas recibido (la que tenga el número mayor), entonces sólo recibirás actualizaciones posteriores a esa actualización y nunca podrás obtener las actualizaciones de antes.

Ahora, ¡puedes probar tu bot con objetos de actualización reales en tu entorno de desarrollo local!

También puedes exponer tu servidor de desarrollo local a la Internet pública utilizando algunos servicios de proxy inverso como [Ngrok](https://ngrok.com/) y establecer el webhook a la URL que obtienes de ellos, o puedes configurar tu propio proxy inverso si tienes una dirección IP pública, un nombre de dominio y un certificado SSL, pero eso está fuera del alcance de esta guía.
Para más información sobre cómo configurar un proxy inverso, consulta la documentación del software que estés utilizando.

::: warning
El uso de un proxy inverso de terceros puede provocar fugas de información.
:::

::: tip
No olvide [volver a configurar el webhook](#configurando-tu-webhook) cuando despliegue en el entorno de producción.
:::
