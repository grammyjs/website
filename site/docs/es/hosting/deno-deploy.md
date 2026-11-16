---
prev: false
next: false
---

# Alojamiento: Deno Deploy

Esta guía explica cómo ejecutar un bot de grammY en [Deno Deploy](https://docs.deno.com/deploy/).

::: warning Deno Deploy dejará de funcionar
Deno Deploy Classic dejó de funcionar en julio de 2026 y el servicio actual de Deno Deploy [cerrará en abril de 2027](https://deno.com/blog/cloudflare).
Para alojar un bot nuevo o migrar uno existente, puedes [ejecutar tu bot de Deno en un VPS](./vps).
:::

El resultado de este tutorial [puede verse en nuestro repositorio de bots de ejemplo](https://github.com/grammyjs/examples/tree/main/setups/deno-deploy).

## Preparación de su código

> Recuerda que necesitas [ejecutar tu bot en webhhoks](../guide/deployment-types#como-usar-webhooks), por lo que debes usar `webhookCallback` y no llamar a `bot.start()` en tu código.

1. Asegúrate de que tienes un archivo que exporta tu objeto `Bot`, para que puedas importarlo después para ejecutarlo.
2. Crea un archivo llamado `main.ts` o `main.js`, o en realidad cualquier nombre que te guste (pero deberías recordar y usar este como el archivo principal para desplegar), con el siguiente contenido:

```ts
import { Bot, webhookCallback } from "npm:grammy";
// Puedes modificar esto a la forma correcta de importar tu objeto `Bot`.
import bot from "./bot.ts";

const handleUpdate = webhookCallback(bot, "std/http");

Deno.serve(async (req) => {
  if (req.method === "POST") {
    const url = new URL(req.url);
    if (url.pathname.slice(1) === bot.token) {
      try {
        return await handleUpdate(req);
      } catch (err) {
        console.error(err);
      }
    }
  }
  return new Response();
});
```

Le aconsejamos que tenga su manejador en alguna ruta secreta en lugar de la raíz (`/`).
Aquí, estamos usando el token del bot (`/<bot token>`).

## Despliegue

### Método 1: Con GitHub

Sigue la [guía de introducción a Deno Deploy](https://docs.deno.com/deploy/getting_started/) para crear una aplicación y conectar tu repositorio de GitHub.
Configura la aplicación como dinámica, indica `main.ts` o el archivo que elegiste antes como punto de entrada y define las variables de entorno que necesite tu bot.

### Método 2: Con `deno deploy`

Sigue la [documentación de `deno deploy`](https://docs.deno.com/runtime/reference/cli/deploy/) para crear y desplegar una aplicación dinámica desde tu proyecto local.
Usa `main.ts` o el archivo que elegiste antes como punto de entrada.

### Nota

Después de poner en marcha tu aplicación, debes configurar los ajustes de los webhooks de tu bot para que apunten a tu aplicación.
Para ello, envía una petición a

```sh:no-line-numbers
curl https://api.telegram.org/bot<token>/setWebhook?url=<url>
```

sustituyendo `<token>` por el token de tu bot, y `<url>` por la URL completa de tu aplicación junto con la ruta al manejador del webhook.
