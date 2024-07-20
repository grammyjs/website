---
prev: false
next: false
---

# Hosting: Funciones sin servidor de Vercel

Este tutorial te guiará sobre cómo desplegar tu bot en [Vercel](https://vercel.com/) utilizando [Vercel Serverless Functions](https://vercel.com/docs/functions), asumiendo que ya tienes una cuenta en [Vercel](https://vercel.com).

## Estructura del proyecto

El único prerrequisito para empezar con **Vercel Serverless Functions** es mover tu código al directorio `api/` como se muestra a continuación.
También puedes ver la [documentación de Vercel](https://vercel.com/docs/functions/quickstart) para más información.

```asciiart:no-line-numbers
.
├── node_modules/
├── build/
├── api/
│   └── bot.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

Si estás usando TypeScript, es posible que quieras instalar `@vercel/node` como dependencia de desarrollo, pero no es obligatorio para seguir esta guía.

## Configurar Vercel

El siguiente paso es crear un archivo `vercel.json` en el nivel superior de tu proyecto.
Para nuestra estructura de ejemplo, su contenido sería:

```json
{
  "functions": {
    "api/bot.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

> Si quieres usar la suscripción gratuita de Vercel, tus configuraciones `memory` y `maxDuration` podrían ser como las de arriba para no saltarse sus límites.

Si quieres saber más sobre el archivo de configuración `vercel.json`, consulta [su documentación](https://vercel.com/docs/projects/project-configuration).

## Configuración de TypeScript

En nuestro `tsconfig.json`, tenemos que especificar nuestro directorio de salida como `build/`, y nuestro directorio raíz como `api/`.
Esto es importante ya que los especificaremos en las opciones de despliegue de Vercel.

```json{5,8}
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "commonjs",
    "rootDir": "./api",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "outDir": "./build",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

## El archivo principal

Independientemente de usar TypeScript o JavaScript, deberíamos tener un archivo fuente por el que se ejecute nuestro bot.
Debería ser más o menos así:

```ts
import { Bot, webhookCallback } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("Falta BOT_TOKEN.");

const bot = new Bot(token);

export default webhookCallback(bot, "std/http");
```

::: tip [Vercel Edge Functions](https://vercel.com/docs/functions) proporciona soporte limitado para grammY
Puedes seguir usando el paquete principal de grammY y un número de plugins, pero otros pueden ser incompatibles debido a dependencias exclusivas de Node.js que podrían no estar soportadas por [Edge Runtime](https://edge-runtime.vercel.app) de Vercel.

Actualmente, no tenemos una lista completa de plugins compatibles, así que tienes que probarlo por ti mismo.

Añada esta línea al fragmento anterior si desea cambiar a Edge Functions:

```ts
export const config = {
  runtime: "edge",
};
```

:::

## En el panel de control de Vercel

Asumiendo que ya tienes una cuenta de Vercel a la que está conectado tu GitHub, añade un nuevo proyecto y selecciona el repositorio de tu bot.
En _Build & Development Settings_:

- Directorio de salida: `build`
- Comando de instalación: `npm install`

No olvides añadir los secretos como el token de tu bot como variables de entorno en la configuración.
Una vez hecho esto, ¡puedes desplegarlo!

## Configurar el Webhook

El último paso es conectar tu aplicación Vercel con Telegram.
Modifica la siguiente URL con tus credenciales y visítala desde tu navegador:

```text
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=<HOST_URL>
```

El `HOST_URL` es un poco complicado, porque necesitas usar el dominio de tu **aplicación Vercel siguiendo la ruta al código del bot**, por ejemplo `https://appname.vercel.app/api/bot`.
Donde `bot` se refiere a tu archivo `bot.ts` o `bot.js`.

Entonces deberías ver una respuesta como esta:

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

¡Enhorabuena!
Tu bot debería estar ahora en funcionamiento.
