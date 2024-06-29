---
prev: false
next: false
---

# Alojamiento: Zeabur (Deno)

[Zeabur](https://zeabur.com) es una plataforma que te permite desplegar tus aplicaciones full-stack con facilidad.
Soporta varios lenguajes de programación y frameworks, incluyendo Deno y grammY.

Este tutorial te guiará en el despliegue de tus bots grammY con Deno en [Zeabur](https://zeabur.com).

::: tip ¿Buscas la versión para Node.js?
Este tutorial explica cómo desplegar un bot de Telegram en Zeabur usando Deno.
Si estás buscando la versión Node.js, por favor revisa [este tutorial](./zeabur-nodejs) en su lugar.
:::

## Requisitos previos

Para seguirnos, necesitas tener cuentas [GitHub](https://github.com) y [Zeabur](https://zeabur.com).

### Método 1: Crear un nuevo proyecto desde cero

> Asegúrese de tener Deno instalado en su máquina local.

Inicialice su proyecto e instale algunas dependencias necesarias:

```sh
# Inicializar el proyecto.
mkdir grammy-bot
cd grammy-bot

# Crear archivo main.ts
touch main.ts

# Crear archivo deno.json para generar archivo de bloqueo
touch deno.json
```

Luego modifica el archivo `main.ts` con el siguiente código:

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
if (!token) throw new Error("TELEGRAM_BOT_TOKEN no está configurado");

const bot = new Bot(token);

bot.command("start", (ctx) => ctx.reply("¡Hola de Deno & grammY!"));

bot.on("message:text", (ctx) => ctx.reply("¿En qué puedo ayudarle?"));

bot.start();
```

> Nota: Obtén tu bot token con [@BotFather](https://t.me/BotFather) en Telegram, y establécelo como variable de entorno `TELEGRAM_BOT_TOKEN` en Zeabur.
>
> Puedes consultar [este tutorial](https://zeabur.com/docs/deploy/variables) para establecer variables de entorno en Zeabur.

Luego ejecuta el siguiente comando para iniciar tu bot:

```sh
deno run --allow-net main.ts
```

Deno descargará automáticamente las dependencias, generará el archivo de bloqueo e iniciará tu bot.

### Método 2: Utilizar la plantilla de Zeabur

Zeabur ya ha proporcionado una plantilla para su uso.
Puedes encontrarla [aquí](https://github.com/zeabur/deno-telegram-bot-starter).

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
