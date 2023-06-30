# Comenzando

Crea tu primer bot en minutos. (Desplázate [abajo](#introduccion-a-deno) para una guía de Deno.)

## Comenzando en Node.js

> Esta guía asume que tienes [Node.js](https://nodejs.org) instalado, y `npm` debería venir con él.
> Si no sabes qué son estas cosas, ¡consulta nuestra [Introducción](./introduction)!

Crea un nuevo proyecto TypeScript e instala el paquete `grammy`.
Hazlo abriendo un terminal y escribiendo:

::: code-group

```sh [npm]
# Crea un nuevo directorio y entra en él.
mkdir my-bot
cd my-bot

# Instala TypeScript (sáltate si usas JavaScript).
npm install -D typescript
npx tsc --init

# Instala grammY.
npm install grammy
```

```sh [Yarn]
# Crea un nuevo directorio y entra en él.
mkdir my-bot
cd my-bot
# Instala TypeScript (sáltate si usas JavaScript).
yarn add typescript -D
npx tsc --init
# Instala grammY.
yarn add grammy
```

```sh
# Crea un nuevo directorio y entra en él.
mkdir my-bot
cd my-bot
# Instala TypeScript (sáltate si usas JavaScript).
pnpm add -D typescript
npx tsc --init
# Instala grammY.
pnpm add grammy
```

:::

Crea un nuevo archivo de texto vacío, por ejemplo, llamado `bot.ts`.
La estructura de tu carpeta debería ser así:

```asciiart:no-line-numbers
.
├── bot.ts
├── node_modules/
├── package.json
├── package-lock.json
└── tsconfig.json
```

Ahora, es el momento de abrir Telegram para crear una cuenta bot, y obtener un token para ella.
Habla con [@BotFather](https://t.me/BotFather) para hacerlo.
El bot token se parece a `123456:aBcDeF_gHiJkLmNoP-q`.
Se utiliza para autenticar tu bot.

¿Tienes el token? Ahora puedes codificar tu bot en el archivo `bot.ts`.
Puedes copiar el siguiente ejemplo de bot en ese archivo, y pasar tu token al constructor `Bot`:

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";

// Crea una instancia de la clase `Bot` y pásale tu token.
const bot = new Bot(""); // <-- pon tu token entre los ""

// Ahora puedes registrar oyentes en tu objeto bot `bot`.
// grammY llamará a los listeners cuando los usuarios envíen mensajes a tu bot.

// Maneja el comando /start.
bot.command("start", (ctx) => ctx.reply("¡Bienvenido! Ya está funcionando."));
// Maneja otros mensajes.
bot.on("message", (ctx) => ctx.reply("¡Tengo otro mensaje!"));

// Ahora que has especificado cómo manejar los mensajes, puedes iniciar tu bot.
// Esto se conectará a los servidores de Telegram y esperará los mensajes.

// Inicia el bot.
bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");

// Crea una instancia de la clase `Bot` y pásale tu token.
const bot = new Bot(""); // <-- pon tu token entre los ""

// Ahora puedes registrar oyentes en tu objeto bot `bot`.
// grammY llamará a los listeners cuando los usuarios envíen mensajes a tu bot.

// Maneja el comando /start.
bot.command("start", (ctx) => ctx.reply("¡Bienvenido! Ya está funcionando."));
// Maneja otros mensajes.
bot.on("message", (ctx) => ctx.reply("¡Tengo otro mensaje!"));

// Ahora que has especificado cómo manejar los mensajes, puedes iniciar tu bot.
// Esto se conectará a los servidores de Telegram y esperará los mensajes.

// Inicia el bot.
bot.start();
```

:::

Compila el código ejecutando

```sh
npx tsc
```

en tu terminal.
Esto genera el archivo JavaScript `bot.js`.

Ahora puedes ejecutar el bot ejecutando

```sh
node bot.js
```

en tu terminal.
¡Ya está! :tada:

¡Dirígete a Telegram para ver cómo tu bot responde a los mensajes!

::: tip Activar el registro
Puedes habilitar el registro básico ejecutando

```sh
export DEBUG="grammy*"
```

en tu terminal antes de ejecutar `node bot.js`.
Esto facilita la depuración de tu bot.
:::

## Introducción a Deno

> Esta guía asume que tiene instalado [Deno](https://deno.land).

Crea un nuevo directorio en algún lugar y crea un nuevo archivo de texto vacío en él, por ejemplo, llamado `bot.ts`.

```sh
mkdir ./my-bot
cd ./my-bot
touch bot.ts
```

Ahora, es el momento de abrir Telegram para crear una cuenta bot, y obtener un token para ella.
Habla con [@BotFather](https://t.me/BotFather) para hacerlo.
El bot token se parece a `123456:aBcDeF_gHiJkLmNoP-q`.
Se utiliza para autenticar tu bot.

¿Tienes el token? Ahora puedes codificar tu bot en el archivo `bot.ts`.
Puedes copiar el siguiente ejemplo de bot en ese archivo, y pasar tu token al constructor `Bot`:

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

// Crea una instancia de la clase `Bot` y pásale tu token.
const bot = new Bot(""); // <-- pon tu token entre los ""

// Ahora puedes registrar oyentes en tu objeto bot `bot`.
// grammY llamará a los listeners cuando los usuarios envíen mensajes a tu bot.

// Maneja el comando /start.
bot.command("start", (ctx) => ctx.reply("¡Bienvenido! Ya está funcionando."));
// Maneja otros mensajes.
bot.on("message", (ctx) => ctx.reply("¡Tengo otro mensaje!"));

// Ahora que has especificado cómo manejar los mensajes, puedes iniciar tu bot.
// Esto se conectará a los servidores de Telegram y esperará los mensajes.

// Inicia el bot.
bot.start();
```

Ahora puedes ejecutar el bot ejecutando

```sh
deno run --allow-net bot.ts
```

en tu terminal.
¡Ya está! :tada:

¡Dirígete a Telegram para ver cómo tu bot responde a los mensajes!

::: tip Activar el registro
Puedes activar el registro básico ejecutando

```sh
export DEBUG="grammy*"
```

en tu terminal antes de ejecutar tu bot.
Esto facilita la depuración de tu bot.

Ahora necesitas ejecutar el bot usando

```sh
deno run --allow-net --allow-env bot.ts
```

para que grammY pueda detectar que `DEBUG` está activado.
:::
