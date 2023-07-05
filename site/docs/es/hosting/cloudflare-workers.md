# Alojamiento: Cloudflare Workers

[Cloudflare Workers](https://workers.cloudflare.com/) es una plataforma pública de computación sin servidor que ofrece una solución conveniente y simple para ejecutar JavaScript en el [edge](https://en.wikipedia.org/wiki/Edge_computing).
Al tener la capacidad de manejar tráfico HTTP y estar basada en la [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), construir bots para Telegram se convierte en algo muy sencillo.
Además, puedes incluso desarrollar [Web Apps](https://core.telegram.org/bots/webapps) en el edge, todo gratis dentro de ciertas cuotas.

Esta guía te llevará a través del proceso de alojar tus bots de Telegram en Cloudflare Workers.

## Requisitos previos

Para seguir adelante, por favor asegúrese de que tiene una [cuenta de Cloudflare](https://dash.cloudflare.com/login) con su subdominio de workers [configurado](https://dash.cloudflare.com/?account=workers).

## Configuración

En primer lugar, crea un nuevo proyecto:

```sh
npx wrangler generate my-bot
```

Puedes cambiar `my-bot` por lo que quieras.
Este será el nombre de tu bot y el directorio del proyecto.

Después de ejecutar el comando anterior, sigue las instrucciones que veas para inicializar el proyecto.
Allí, puedes elegir entre JavaScript o TypeScript.

Cuando el proyecto esté inicializado, `cd` en `my-bot` o en el directorio en el que hayas inicializado tu proyecto.
Dependiendo de cómo inicializaste el proyecto, deberías ver una estructura de archivos similar a la siguiente:

```asciiart:no-line-numbers
.
├── node_modules
├── package.json
├── package-lock.json
├── src
│   ├── index.js
│   └── index.test.js
└── wrangler.toml
```

A continuación, instala `grammy`, y otros paquetes que puedas necesitar:

```sh
npm install grammy
```

## Creando tu Bot

Edita `src/index.js` o `src/index.ts`, y escribe este código dentro:

```ts
// Ten en cuenta que estamos importando de 'grammy/web', no de 'grammy'.
import { Bot, webhookCallback } from "grammy/web";

// La siguiente línea de código asume que ha configurado los secretos BOT_TOKEN y BOT_INFO.
// Ver https://developers.cloudflare.com/workers/platform/environment-variables/#secrets-on-deployed-workers.
// El BOT_INFO se obtiene de bot.api.getMe().
const bot = new Bot(BOT_TOKEN, { botInfo: BOT_INFO });

bot.command("start", async (ctx) => {
  await ctx.reply("¡Hola, mundo!");
});

addEventListener("fetch", webhookCallback(bot, "cloudflare"));
```

El bot de ejemplo anterior responde "¡Hola, mundo!" cuando recibe `/start`.

## Desplegando tu Bot

Antes de desplegar, necesitamos editar `wrangler.toml`:

```toml
account_id = 'your account_id' # Obtén esto del dashboard de Cloudflare.
name = 'my-bot' # El nombre de tu bot, que aparecerá en la URL del webhook, por ejemplo: https://my-bot.my-subdomain.workers.dev
main = "src/index.js" # El archivo de entrada del worker.
compatibility_date = "2023-01-16"
```

A continuación, puede desplegar utilizando el siguiente comando:

```sh
npm run deploy
```

## Configurando tu Webhook

Necesitamos decirle a Telegram a dónde enviar las actualizaciones.
Abre tu navegador y visita esta URL:

```txt
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
npm run start
```

Una vez que el servidor de desarrollo se haya iniciado, puedes probar tu bot enviándole actualizaciones de ejemplo utilizando herramientas como `curl`, [Insomnia](https://insomnia.rest), o [Postman](https://postman.com).
Consulta [aquí](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates) para ver ejemplos de actualizaciones y [aquí](https://core.telegram.org/bots/api#update) para obtener más información sobre la estructura de actualizaciones.
