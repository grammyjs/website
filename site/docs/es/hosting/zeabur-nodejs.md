---
prev: false
next: false
---

# Alojamiento: Zeabur (Node.js)

[Zeabur](https://zeabur.com) es una plataforma que te permite desplegar tus aplicaciones full-stack con facilidad.
Soporta varios lenguajes de programación y frameworks, incluyendo Node.js y grammY.

Este tutorial te guiará sobre cómo desplegar tus bots grammY con Node.js en [Zeabur](https://zeabur.com).

::: tip ¿Buscas la versión de Deno?
Este tutorial explica cómo desplegar un bot de Telegram en Zeabur usando Node.js.
Si estás buscando la versión Deno, por favor revisa [este tutorial](./zeabur-deno) en su lugar.
:::

## Requisitos previos

Para seguirnos, necesitas tener cuentas [GitHub](https://github.com) y [Zeabur](https://zeabur.com).

### Método 1: Crear un nuevo proyecto desde cero

Inicialice su proyecto e instale algunas dependencias necesarias:

```sh
# Inicializar el proyecto.
mkdir grammy-bot
cd grammy-bot
npm init -y

# Instale las dependencias principales.
npm install grammy

# Instale las dependencias de desarrollo.
npm install -D typescript ts-node @types/node

# Inicializar TypeScript.
npx tsc --init
```

Luego, `cd` en `src/`, y crea un archivo llamado `bot.ts`.
Es donde escribirás el código de tu bot.

Ahora, puedes empezar a escribir el código de tu bot en `src/bot.ts`.

```ts
import { Bot } from "grammy";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("TELEGRAM_BOT_TOKEN no está definido");

const bot = new Bot(token);

bot.command("start", (ctx) => ctx.reply("¡Hola de Deno & grammY!"));

bot.on("message:text", (ctx) => ctx.reply("¿En qué puedo ayudarle?"));

bot.start();
```

> Nota: Obtén tu bot token con [@BotFather](https://t.me/BotFather) en Telegram, y establécelo como variable de entorno `TELEGRAM_BOT_TOKEN` en Zeabur.
>
> Puedes consultar [este tutorial](https://zeabur.com/docs/deploy/variables) para establecer variables de entorno en Zeabur.

Ahora el directorio raíz de tu proyecto debería verse así:

```asciiart:no-line-numbers
.
├── node_modules/
├── src/
│   └── bot.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

Y luego tenemos que añadir scripts `start` a nuestro `package.json`.
Nuestro `package.json` ahora debe ser similar a esto:

```json
{
  "name": "telegram-bot-starter",
  "version": "1.0.0",
  "description": "Telegram Bot Starter con TypeScript y grammY",
  "scripts": {
    "start": "ts-node src/bot.ts" // [!code focus]
  },
  "author": "MichaelYuhe",
  "license": "MIT",
  "dependencies": {
    "grammy": "^1.21.1"
  },
  "devDependencies": {
    "@types/node": "^20.14.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.5"
  }
}
```

Ahora, puedes ejecutar tu bot localmente ejecutando:

```sh
npm run start
```

### Método 2: Utilizar la plantilla de Zeabur

Zeabur ya ha proporcionado una plantilla para su uso.
Puedes encontrarla [aquí](https://github.com/zeabur/telegram-bot-starter).

Puedes usar la plantilla y empezar a escribir el código de tu bot.

## Despliegue

### Método 1: Despliegue desde GitHub en el Dashboard de Zeabur

1. Crea un repositorio en GitHub, puede ser público o privado y empuja tu código a él.
2. Ve a [Zeabur dashboard](https://dash.zeabur.com).
3. Haz click en el botón `New Project`, y haz click en el botón `Deploy New Service`, elige `GitHub` como fuente y selecciona tu repositorio.
4. Ve a la pestaña `Variables` para añadir tus variables de entorno como `TELEGRAM_BOT_TOKEN`.
5. Tu servicio se desplegará automáticamente.

### Método 2: Despliegue con Zeabur CLI

`cd` en el directorio de tu proyecto y ejecuta el siguiente comando:

```sh
npx @zeabur/cli deploy
```

Siga las instrucciones para seleccionar una región para desplegar, y su bot se desplegará automáticamente.
