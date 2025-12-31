---
prev: false
next: false
---

# Alojamiento: Deno Deploy

Esta guía te explica cómo puedes alojar tus bots de grammy en [Deno Deploy](https://deno.com/deploy).

Ten en cuenta que esta guía es solo para usuarios de Deno, y que necesitas tener una cuenta [GitHub](https://github.com) para crear una cuenta [Deno Deploy](https://deno.com/deploy).

Deno Deploy es ideal para la mayoría de los bots sencillos, y debe tener en cuenta que no todas las funciones de Deno están disponibles para las aplicaciones que se ejecutan en Deno Deploy.
Por ejemplo, la plataforma solo admite un [conjunto limitado](https://docs.deno.com/deploy/classic/api/runtime-fs/) de las API del sistema de archivos disponibles en Deno.
Es como las otras muchas plataformas serverless-y-paas, pero dedicadas a las aplicaciones Deno.

El resultado de este tutorial [puede verse en nuestro repositorio de bots de ejemplo](https://github.com/grammyjs/examples/tree/main/setups/deno-deploy).

## Preparación de su código

> Recuerda que necesitas [ejecutar tu bot en webhhoks](../guide/deployment-types#como-usar-webhooks), por lo que debes usar `webhookCallback` y no llamar a `bot.start()` en tu código.

1. Asegúrate de que tienes un archivo que exporta tu objeto `Bot`, para que puedas importarlo después para ejecutarlo.
2. Crea un archivo llamado `main.ts` o `main.js`, o en realidad cualquier nombre que te guste (pero deberías recordar y usar este como el archivo principal para desplegar), con el siguiente contenido:

```ts
import { Bot, webhookCallback } from "https://deno.land/x/grammy/mod.ts";
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

> Este es el método recomendado, y el más fácil de seguir.
> La principal ventaja de seguir este método es que Deno Deploy estará atento a los cambios en tu repositorio que incluya el código de tu bot, y desplegará las nuevas versiones automáticamente.

1. Crea un repositorio en GitHub, puede ser privado o público.
2. Empuja tu código.

   > Es recomendable que tengas una única rama estable y que hagas tus pruebas en otras ramas, para que no te ocurran cosas inesperadas.

3. Visite su [Deno Deploy dashboard](https://dash.deno.com/account/overview).
4. Haga clic en "Nuevo proyecto".
5. Instala la app de GitHub en tu cuenta u organización, y elige tu repositorio.
6. Selecciona la rama que quieres desplegar.
7. Selecciona el archivo de entrada `main.ts`, y haz clic en "Deploy Project" para desplegar.

### Método 2: Con `deployctl`

> Este es un método para usuarios más avanzados o si no quieres subir tu código a GitHub.
> Te permite desplegar el proyecto a través de la línea de comandos o de las GitHub Actions.

1. Instala [`deployctl`](https://github.com/denoland/deployctl).
2. Crea un token de acceso desde la sección "Access Tokens" en [configuración de la cuenta](https://dash.deno.com/account).
3. Vaya al directorio de su proyecto y ejecute el siguiente comando:

   ```sh:no-line-numbers
   deployctl deploy --project=<project> --entrypoint=./main.ts --prod --token=<token>
   ```

   ::: tip Configuración de variables de entorno
   Las variables de entorno pueden establecerse accediendo a la configuración del proyecto después de desplegarlo.

   Pero esto también es posible desde la línea de comandos:

   1. Puedes asignar variables de entorno desde un archivo dotenv añadiendo el argumento `--env-file=<file>`.
   2. También puede especificarlas individualmente utilizando el argumento `--env=<clave=valor>`.

   :::
4. Para configurar las Acciones de GitHub, consulta [this](https://github.com/denoland/deployctl/blob/main/action/README.md).

Consulta la [documentación de deployctl](https://docs.deno.com/deploy/classic/deployctl/) para más información.

### Nota

Después de poner en marcha tu aplicación, debes configurar los ajustes de los webhooks de tu bot para que apunten a tu aplicación.
Para ello, envía una petición a

```sh:no-line-numbers
curl https://api.telegram.org/bot<token>/setWebhook?url=<url>
```

sustituyendo `<token>` por el token de tu bot, y `<url>` por la URL completa de tu aplicación junto con la ruta al manejador del webhook.
