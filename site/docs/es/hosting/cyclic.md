---
prev: false
next: false
---

# Alojamiento: Cyclic

Esta guía te explica cómo puedes alojar tus bots grammY en [Cyclic](https://cyclic.sh).

## Requisitos previos

Para seguir adelante, necesitas tener una cuenta [Github](https://github.com) y [Cyclic](https://cyclic.sh).
Primero, inicializa tu proyecto e instala algunas dependencias:

```sh
# Inicializa el proyecto.
mkdir grammy-bot
cd grammy-bot
npm init -y

# Instalar dependencias principales.
npm install grammy express dotenv

# Instalar dependencias de desarrollo.
npm install -D typescript ts-node nodemon @types/express @types/node

# Inicializar la configuración de TypeScript.
npx tsc --init
```

Almacenaremos nuestros archivos TypeScript dentro de `src/`, y nuestros archivos compilados en `dist/`.
Después de crear ambos, entra en `src/`, y crea un archivo llamado `bot.ts`.
El directorio raíz de tu proyecto debería tener ahora este aspecto:

```asciiart:no-line-numbers
.
├── node_modules/
├── dist/
├── src/
│   └── bot.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

A continuación, abra `tsconfig.json`, y reescriba su contenido para utilizar esta configuración:

```json
{
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true
  }
}
```

Y luego tenemos que añadir los scripts `start`, `build` y `dev` a nuestro `package.json`.
Nuestro `package.json` ahora debe ser similar a esto:

```json{6-10}
{
  "name": "grammy-bot",
  "version": "1.0.0",
  "description": "",
  "main": "dist/bot.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/bot.js",
    "dev": "nodemon src/bot.ts"
  },
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "grammy": "^1.17.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.4.9",
    "typescript": "^5.1.6",
    "nodemon": "^3.0.1",
    "ts-node": "^10.9.1"
  },
  "keywords": []
}
```

### Webhooks

Abre `src/bot.ts` y escribe el siguiente contenido en él:

```ts{15}
import express from "express";
import { Bot, webhookCallback } from "grammy";
import "dotenv/config";

const bot = new Bot(process.env.BOT_TOKEN || "");

bot.command("start", (ctx) => ctx.reply("¡Hola Mundo!"))

if (process.env.NODE_ENV === "DEVELOPMENT") {
  bot.start();
} else {
  const port = process.env.PORT || 3000;
  const app = express();
  app.use(express.json());
  app.use(`/${bot.token}`, webhookCallback(bot, "express"));
  app.listen(port, () => console.log(`escuchando en el puerto ${port}`));
}
```

Te recomendamos que tengas tu controlador de webhooks en una ruta secreta en lugar de `/`.
Como se muestra en la línea resaltada arriba, estamos usando `/<bot-token>` en lugar de `/`.

### Desarrollo Local

Cree un archivo `.env` en la raíz de su proyecto con el siguiente contenido:

```text
BOT_TOKEN=<bot-token>
NODE_ENV=DEVELOPMENT
```

Después, ejecuta tu script `dev`:

```sh
npm run dev
```

Nodemon vigilará tu archivo `bot.ts` y reiniciará tu bot en cada cambio de código.

## Despliegue

1. Crea un repositorio en GitHub, puede ser privado o público.
2. Empuja tu código.
   > Es recomendable que tengas una única rama estable y hagas tus pruebas en ramas separadas, para no desplegar comportamientos inesperados en producción.
3. Visita tu [Cyclic dashboard](https://app.cyclic.sh).
4. Haz clic en "Link Your Own" y selecciona tu repositorio.
5. Vaya a Avanzado > Variables y añada su `BOT_TOKEN`.
6. Despliega tu bot con "Connect Cyclic".

### Configuración de la URL del webhook

Si estás usando webhooks, después de tu primer despliegue, deberías configurar los ajustes de webhook de tu bot para que apunten a tu app.
Para ello, envía una petición a

```text
https://api.telegram.org/bot<token>/setWebhook?url=<url>/<token>
```

sustituyendo `<token>` por tu token de bot, y `<url>` por la URL completa de tu aplicación junto con la ruta al controlador del webhook.

Enhorabuena.
Tu bot ya debería estar funcionando.
