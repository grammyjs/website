# Hosting: Deno deploy

Esta guía le informa sobre las formas de alojar sus bots de grammY en [Deno Deploy](https://deno.com/deploy).

Ten en cuenta que esta guía es sólo para usuarios de Deno, y que necesitas tener una cuenta de [GitHub](https://github.com) para crear una cuenta de [Deno Deploy](https://deno.com/deploy).

Deno Deploy es ideal para la mayoría de los bots simples, y debe tener en cuenta que no todas las características de Deno están disponibles para las aplicaciones que se ejecutan en Deno Deploy.
Por ejemplo, no hay sistema de archivos en Deno Deploy.
Es igual que las demás plataformas sin servidor, pero dedicado a las aplicaciones de Deno.

## Preparación de su código

1. Asegúrate de que tienes un archivo que exporta tu objeto `Bot`, para que puedas importarlo después para ejecutarlo.
2. Crea un archivo llamado `mod.ts` o `mod.js`, o en realidad cualquier nombre que te guste (pero deberías recordar y usar este como el archivo principal para desplegar), con el siguiente contenido:

```ts
import { webhookCallback } from "https://deno.land/x/grammy/mod.ts";
// Puedes modificar esto a la forma correcta de importar tu objeto `Bot`.
import bot from "./bot.ts";

import { serve } from "https://deno.land/std/http/server.ts";

const handleUpdate = webhookCallback(bot, "std/http");

serve(async (req) => {
  if (req.method == "POST") {
    try {
      return await handleUpdate(req);
    } catch (err) {
      console.error(err);
      return new Response();
    }
  }

  return new Response();
});
```

## Despliegue

### Método 1: Con GitHub

> Este es el método recomendado, y el más fácil de seguir.
> La principal ventaja de seguir este método es que Deno Deploy estará atento a los cambios en tu repositorio que incluya el código de tu bot, y desplegará las nuevas versiones automáticamente.

1. Crea un repositorio en GitHub, puede ser privado o público.
2. Empuja tu código.

> Es recomendable que tengas una única rama estable y que hagas tus pruebas en otras ramas, para que no te ocurran cosas inesperadas.

3. Visita tu [Deno Deploy dashboard](https://dash.deno.com/projects).
4. Crea un nuevo proyecto.
5. Desplázate hasta la sección "Deploy from GitHub" y haz clic en "Continue".
6. Instala la app de GitHub en tu cuenta u organización y elige tu repositorio.
7. Seleccione la rama que desea desplegar y, a continuación, elija el archivo `mod.ts` que desea desplegar.

### Método 2: Con URL

> Todo lo que necesitas para seguir este método para desplegar tu bot de grammY, es una URL pública a tu archivo `mod.ts`.

1. Crea un nuevo proyecto en Deno Deploy.
2. Haz clic en "Desplegar URL".
3. Introduzca la URL pública de su archivo `mod.ts` y haga clic en "Deploy".
