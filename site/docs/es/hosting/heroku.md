# Alojamiento: Heroku

> Asumimos que tienes los conocimientos básicos sobre la creación de bots usando grammY.
> Si aún no estás preparado, ¡no dudes en dirigirte a nuestra amigable [Guía](../guide)! :cohete:

Este tutorial te guiará en cómo desplegar un bot de Telegram en [Heroku](https://heroku.com/) usando [webhooks](../guide/deployment-types.md#¿como-funcionan-los-webhooks) o [long polling](../guide/deployment-types.md#¿como-funciona-el-long-polling).
También asumimos que ya tienes una cuenta en Heroku.

## Requisitos previos

Primero, instala algunas dependencias:

```sh
# Crear un directorio de proyecto.
mkdir grammy-bot
cd grammy-bot
npm init --y

# Instalar las dependencias principales.
npm install grammy express

# Instala las dependencias de desarrollo.
npm install -D typescript @types/express @types/node

# Crear la configuración de TypeScript.
npx tsc --init
```

Almacenaremos nuestros archivos TypeScript dentro de una carpeta `src`, y nuestros archivos compilados en una carpeta `dist`.
Crea las carpetas en el directorio raíz del proyecto.
Luego, dentro de la carpeta `src`, crea un nuevo archivo llamado `bot.ts`.
Nuestra estructura de carpetas debería ser así:

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

Después, abre `tsconfig.json` y cámbialo para usar esta configuración:

```json{4}
{
  "compilerOptions": {
    "target": "ESNEXT",
    "module": "esnext", // cambiado de commonjs a esnext
    "lib": ["ES2021"],
    "outDir": "./dist/",
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

Debido a que la opción `module` anterior se ha establecido de `commonjs` a `esnext`, tenemos que añadir `"type": "module"` a nuestro `package.json`.
Nuestro `package.json` debería ser ahora similar a esto:

```json{6}
{
  "name": "grammy-bot",
  "version": "0.0.1",
  "description": "",
  "main": "dist/app.js",
  "type": "module", // añadir propiedad "type": "module"
  "scripts": {
    "dev-build": "tsc"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "grammy": "^1.2.0",
    "express": "^4.17.1"
  },
  "devDependencies": {
    "typescript": "^4.3.5",
    "@types/express": "^4.17.13",
    "@types/node": "^16.3.1"
  },
  "keywords": []
}
```

Como hemos mencionado anteriormente, tenemos dos opciones para recibir datos de Telegram: los webhooks y el long polling.
¡Puedes aprender más sobre las dos ventajas y luego decidir cuál es la adecuada en [estos increíbles consejos](../guide/deployment-types.md)!

## Webhooks

> Si decides usar el long polling en su lugar, puedes saltarte esta sección y pasar a la [sección sobre long polling](#long-polling). :rocket:

En resumen, a diferencia del long polling, los webhooks no se ejecutan continuamente para comprobar los mensajes entrantes de Telegram.
Esto reducirá la carga del servidor y nos ahorrará un montón de [horas de dyno](https://devcenter.heroku.com/articles/eco-dyno-hours), especialmente si utiliza el plan Eco. :grin:

Bien, ¡continuemos!
¿Recuerdas que hemos creado `bot.ts` antes?
No vamos a volcar todo el código allí, y dejar la codificación del bot hasta usted.
En su lugar, vamos a hacer que `app.ts` sea nuestro principal punto de entrada.
Eso significa que cada vez que Telegram (o cualquier otra persona) visite nuestro sitio, `express` decide qué parte de tu servidor será responsable de manejar la petición.
Esto es útil cuando estás desplegando tanto el sitio web como el bot en el mismo dominio.
Además, al dividir los códigos en diferentes archivos, hace que nuestro código se vea ordenado. :sparkles:

### Express y su Middleware

Ahora crea `app.ts` dentro de la carpeta `src` y escribe este código dentro:

```ts
import express from "express";
import { webhookCallback } from "grammy";
import { bot } from "./bot";

const domain = String(process.env.DOMAIN);
const secretPath = String(process.env.BOT_TOKEN);
const app = express();

app.use(express.json());
app.use(`/${secretPath}`, webhookCallback(bot, "express"));

app.listen(Number(process.env.PORT), async () => {
  // ¡Asegúrate de que es `https` y no `http`!
  await bot.api.setWebhook(`https://${domain}/${secretPath}`);
});
```

Echemos un vistazo a nuestro código anterior:

- `process.env`: Recuerda, ¡nunca almacenes credenciales en nuestro código!
  Para crear [variables de entorno](https://www.freecodecamp.org/news/using-environment-variables-the-right-way/) en Heroku, dirígete a [esta guía](https://devcenter.heroku.com/articles/config-vars).
- `secretPath`: Puede ser nuestro `BOT_TOKEN` o cualquier cadena aleatoria.
  Es una buena práctica ocultar la ruta de nuestro bot, tal y como se explica en Telegram (https://core.telegram.org/bots/api#setwebhook).

::: tip ⚡ Optimización (opcional)
`bot.api.setWebhook` en la línea 14 siempre se ejecutará cuando Heroku inicie su servidor de nuevo.
Para los bots de bajo tráfico, esto será para cada solicitud.
Sin embargo, no necesitamos que este código se ejecute cada vez que llega una petición.
Por lo tanto, podemos eliminar esta parte completamente, y ejecutar el `GET` sólo una vez manualmente.
Abre este enlace en tu navegador web después de desplegar nuestro bot:

```asciiart:no-line-numbers
https://api.telegram.org/bot<bot_token>/setWebhook?url=<webhook_url>
```

Ten en cuenta que algunos navegadores requieren que codifiques manualmente (https://en.wikipedia.org/wiki/Percent-encoding#Reserved_characters) la `webhook_url` antes de pasarla.
Por ejemplo, si tenemos el token bot `abcd:1234` y la URL `https://grammybot.herokuapp.com/secret_path`, entonces nuestro enlace debería tener este aspecto:

```asciiart:no-line-numbers
https://api.telegram.org/botabcd:1234/setWebhook?url=https%3A%2F%2Fgrammybot.herokuapp.com%2Fsecret_path
```

:::

::: tip Optimización (opcional)
Utilice [Webhook Reply](../guide/deployment-types.md#webhook-reply) para una mayor eficiencia.
:::

### Creando `bot.ts`

Siguiente paso, dirígete a `bot.ts`:

```ts
import { Bot } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("Falta BOT_TOKEN.");

export const bot = new Bot(token);

bot.command("start", (ctx) => ctx.reply("¡Hola!"));
bot.on("message", (ctx) => ctx.reply("¡Tengo otro mensaje!"));
```

Bien.
Ya hemos terminado de codificar nuestros archivos principales.
Pero antes de ir a los pasos de despliegue, podemos optimizar nuestro bot un poco.
Como siempre, esto es opcional.

::: tip ⚡ Optimización (opcional)
Cada vez que tu servidor se inicie, grammY solicitará [información sobre el bot](https://core.telegram.org/bots/api#getme) a Telegram para proporcionarla en el [objeto de contexto](../guide/context.md) bajo `ctx.me`.
Podemos establecer la [información sobre el bot](https://deno.land/x/grammy/mod.ts?s=BotConfig#prop_botInfo) para evitar un exceso de llamadas a `getMe`.

1. Abre este enlace `https://api.telegram.org/bot<bot_token>/getMe` en tu navegador web favorito. Se recomienda usar [Firefox](https://www.mozilla.org/en-US/firefox/) ya que muestra muy bien el formato `json`.
2. Cambia nuestro código en la línea 4 de arriba y rellena el valor de acuerdo con los resultados de `getMe`:

```ts
const token = process.env.BOT_TOKEN;
if (!token) throw new Error("Falta BOT_TOKEN.");

export const bot = new Bot(token, {
  botInfo: {
    id: 111111111,
    is_bot: true,
    first_name: "xxxxxxxxx",
    username: "xxxxxxbot",
    can_join_groups: true,
    can_read_all_group_messages: false,
    supports_inline_queries: false,
  },
});
```

:::

¡Genial! ¡Es hora de preparar nuestro entorno de despliegue!
¡Directamente a la [Sección de Despliegue](#despliegue) todo el mundo! :muscle:

## Long Polling

::: warning Su script se ejecutará de forma continua cuando utilice el sondeo largo
A menos que sepa cómo manejar este comportamiento, asegúrese de que tiene suficientes [horas de dyno](https://devcenter.heroku.com/articles/eco-dyno-hours).
:::

> ¿Considerar el uso de webhooks?
> Vaya a la sección [webhooks](#webhooks). :rocket:

Usar long polling en tu servidor no es siempre una mala idea.
A veces, es adecuado para los bots de recolección de datos que no necesitan responder rápidamente y manejar muchos datos.
Si quieres hacerlo una vez por hora, puedes hacerlo fácilmente.
Eso es algo que no puedes controlar con los webhooks.
Si tu bot se inunda de mensajes, verás muchas peticiones de webhooks, sin embargo, puedes limitar más fácilmente la tasa de actualizaciones a procesar con un long polling.

### Creando `bot.ts`

Abramos el archivo `bot.ts` que hemos creado anteriormente.
Que contenga estas líneas de código:

```ts
import { Bot } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("Falta BOT_TOKEN");

const bot = new Bot(token);

bot.command(
  "start",
  (ctx) => ctx.reply("¡Estoy corriendo en Heroku usando long polling!"),
);

bot.start();
```

¡Ya está!
Estamos listos para desplegarlo.
Bastante sencillo, ¿verdad? :smiley:
Si crees que es demasiado fácil, ¡consulta nuestra [Lista de verificación de despliegue](../advanced/deployment.md#long-polling)! :rocket:

## Despliegue

No... nuestro _Rocket Bot_ no está listo para ser lanzado todavía.
¡Completa estas etapas primero!

### Compilar Archivos

Ejecute este código en su terminal para compilar los archivos TypeScript a JavaScript:

```sh
npx tsc
```

Si se ejecuta con éxito y no imprime ningún error, nuestros archivos compilados deberían estar en la carpeta `dist` con extensiones `.js`.

### Configurar el `Procfile`

Por el momento, `Heroku` tiene varios [tipos de dynos](https://devcenter.heroku.com/articles/dyno-types).
Dos de ellos son:

- **Web dynos**:
  <br> _Web dynos_ son dynos del proceso "web" que reciben tráfico HTTP de los routers.
  Este tipo de dyno tiene un tiempo de espera de 30 segundos para ejecutar código.
  Además, se suspenderá si no hay ninguna petición que atender en un periodo de 30 minutos.
  Este tipo de dyno es muy adecuado para los _webhooks_.

- **Worker dynos**:
  <br> _Worker dynos_ se utilizan normalmente para trabajos en segundo plano.
  NO tiene un tiempo de espera, y NO dormirá si no maneja ninguna petición web.
  Se adapta al _long polling_.

Crear un archivo llamado `Procfile` sin extensión de archivo en el directorio raíz de nuestro proyecto.
Por ejemplo, `Procfile.txt` y `procfile` no son válidos.
A continuación, escriba este formato de código de una sola línea:

```
<tipo de dyno>: <omando para ejecutar nuestro archivo de entrada principal>
```

Para nuestro caso debería serlo:

::::code-group
:::code-group-item Webhook

```
web: node dist/app.js
```

:::
<CodeGroupItem title="Long Polling">

```
worker: node dist/bot.js
```

:::
::::

### Configurar Git

Vamos a desplegar nuestro bot usando [Git y Heroku Cli](https://devcenter.heroku.com/articles/git).
Aquí está el enlace para la instalación:

- [Instrucciones de instalación de Git](https://git-scm.com/download/)
- [Instrucciones de instalación de Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli#download-and-install)

Suponiendo que ya los tienes en tu máquina, y tienes una terminal abierta en la raíz del directorio de nuestro proyecto.
Ahora inicializa un repositorio git local ejecutando este código en tu terminal:

```sh
git init
```

A continuación, tenemos que evitar que los archivos innecesarios lleguen a nuestro servidor de producción, en este caso `Heroku`.
Crea un archivo llamado `.gitignore` en la raíz del directorio de nuestro proyecto.
Luego añade esta lista:

```
node_modules/
src/
tsconfig.json
```

Nuestra estructura final de carpetas debería tener este aspecto:

::::code-group
:::code-group-item Webhook

```asciiart:no-line-numbers
.
├── .git/
├── node_modules/
├── dist/
│   ├── bot.js
│   └── app.js
├── src/
│   ├── bot.ts
│   └── app.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── Procfile
└── .gitignore
```

:::
:::code-group-item Long Polling

```asciiart:no-line-numbers
.
├── .git/
├── node_modules/
├── dist/
│   └── bot.js
├── src/
│   └── bot.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── Procfile
└── .gitignore
```

:::
::::

Confirmar los archivos a nuestro repositorio git:

```sh
git add .
git commit -m "My first commit"
```

### Configurar un Heroku Remote

Si ya has creado una [aplicación Heroku](https://dashboard.heroku.com/apps/), pasa el nombre de tu `Aplicación existente` en `<miApp>` a continuación, y ejecuta el código.
De lo contrario, ejecute `Nueva aplicación`.

::::code-group
:::code-group-item New app

```sh
heroku create
git remote -v
```

:::
:::code-group-item Existing app

```sh
heroku git:remote -a <myApp>
```

:::
::::

### Despliegue del código

Finalmente, pulsa el _botón rojo_ y ¡despega! :rocket:

```sh
git push heroku main
```

Si no funciona, es probable que nuestra rama git no sea `main` sino `master`.
Pulsa este _botón azul_ en su lugar:

```sh
git push heroku master
```
