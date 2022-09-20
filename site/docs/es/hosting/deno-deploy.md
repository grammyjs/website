# Alojamiento: Deno Deploy

<Tag type="deno"/>

Esta guía le informa sobre las formas de alojar sus bots de grammY en [Deno Deploy](https://deno.com/deploy).

Ten en cuenta que esta guía es sólo para usuarios de Deno, y que necesitas tener una cuenta de [GitHub](https://github.com) para crear una cuenta de [Deno Deploy](https://deno.com/deploy).

Deno Deploy es ideal para la mayoría de los bots simples, y debe tener en cuenta que no todas las características de Deno están disponibles para las aplicaciones que se ejecutan en Deno Deploy.
Por ejemplo, no hay sistema de archivos en Deno Deploy.
Es igual que las demás plataformas sin servidor, pero dedicado a las aplicaciones de Deno.

El resultado de este tutorial [puede verse en nuestro repositorio de bots de ejemplo](https://github.com/grammyjs/examples/tree/main/deno-deploy).

## Preparación de su código

> Recuerda que necesitas [ejecutar tu bot en webhhoks](../guide/deployment-types.md#como-usar-webhooks), por lo que debes usar `webhookCallback` y no llamar a `bot.start()` en tu código.

1. Asegúrate de que tienes un archivo que exporta tu objeto `Bot`, para que puedas importarlo después para ejecutarlo.
2. Crea un archivo llamado `mod.ts` o `mod.js`, o en realidad cualquier nombre que te guste (pero deberías recordar y usar este como el archivo principal para desplegar), con el siguiente contenido:

```ts
import { serve } from "https://deno.land/std/http/server.ts";
import { Bot, webhookCallback } from "https://deno.land/x/grammy/mod.ts";
// Puedes modificar esto a la forma correcta de importar tu objeto `Bot`.
import bot from "./bot.ts";

const handleUpdate = webhookCallback(bot, "std/http");

serve(async (req) => {
  if (req.method == "POST") {
    const url = new URL(req.url);
    if (url.pathname.slice(1) == bot.token) {
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

3. Visita tu [Deno Deploy dashboard](https://dash.deno.com/projects).
4. Haz clic en "Nuevo proyecto", y ve a la sección "Despliegue desde el repositorio de GitHub".
5. Instala la app de GitHub en tu cuenta u organización, y elige tu repositorio.
6. Selecciona la rama que quieres desplegar, y luego elige tu archivo `mod.ts` para ser desplegado.

### Método 2: Con `deployctl`

> Este es un método para usuarios más avanzados. Te permite desplegar el proyecto a través de la línea de comandos o de las acciones de Github.

1. Visita tu [Deno Deploy dashboard](https://dash.deno.com/projects).
2. Haz clic en "Nuevo proyecto", y luego en "Proyecto vacío".
3. Instale [`deployctl`](https://github.com/denoland/deployctl).
4. [Crear un token de acceso](https://dash.deno.com/user/access-tokens).
5. Ejecuta el siguiente comando:

```bash
deployctl deploy --project <project> ./mod.ts --prod --token <token>
```

6. Para configurar las acciones de Github, consulte [esto](https://github.com/denoland/deployctl/blob/main/action/README.md).

### Método 3: Con URL

> Todo lo que necesitas para seguir este método para desplegar tu bot de grammY, es una URL pública a tu archivo `mod.ts`.

1. Crea un nuevo proyecto en Deno Deploy.
2. Haz clic en "Desplegar URL".
3. Introduzca la URL pública de su archivo `mod.ts` y haga clic en "Deploy".

### Nota

Después de poner en marcha tu aplicación, debes configurar los ajustes de los webhooks de tu bot para que apunten a tu aplicación.
Para ello, envía una petición a

```md:no-line-numbers
https://api.telegram.org/bot<token>/setWebhook?url=<url>
```

sustituyendo `<token>` por el token de tu bot, y `<url>` por la URL completa de tu aplicación junto con la ruta al manejador del webhook.
