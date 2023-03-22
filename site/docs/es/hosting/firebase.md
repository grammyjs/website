# Alojamiento: Firebase Functions

Este tutorial le guiará a través del proceso de despliegue de su bot en [Firebase Functions](https://firebase.google.com/docs/functions).

## Requisitos previos

Para seguir el tutorial, necesitarás tener una cuenta de Google.
Si aún no tienes una, puedes crearla [aquí](https://accounts.google.com/signup).

## Configuración inicial

Esta sección te guiará a través del proceso de configuración.
Si necesitas explicaciones más detalladas sobre cada paso que darás, consulta la [documentación oficial de Firebase](https://firebase.google.com/docs/functions/get-started).

### Creación de un Proyecto Firebase

1. Vaya a la [consola Firebase](https://console.firebase.google.com/) y haga clic en **Añadir Proyecto**.
2. Si se le solicita, revise y acepte los términos de Firebase.
3. Haga clic en **Continuar**.
4. Decide si quieres compartir analíticas o no.
5. Haga clic en **Crear proyecto**.

### Configuración

Para escribir funciones y desplegarlas en Firebase Functions, necesitarás configurar un entorno Node.js e instalar Firebase CLI.

> Es importante tener en cuenta que actualmente sólo las versiones 14, 16 y 18 de Node.js son compatibles con Firebase Functions.
> Para más información sobre las versiones de Node.js soportadas, consulte [aquí](https://firebase.google.com/docs/functions/manage-functions#set_nodejs_version).

Una vez que tengas Node.js y NPM instalados, instala Firebase CLI globalmente:

```sh
npm install -g firebase-tools
```

### Inicialización del Proyecto

1. Ejecuta `firebase login` para abrir tu navegador y autenticar Firebase CLI con tu cuenta.
2. `cd` en el directorio de tu proyecto.
3. Ejecute `firebase init functions`, y escriba `y` cuando se le pregunte si desea inicializar una nueva base de código.
4. Elige `use existing project` y selecciona el proyecto que creaste en el paso 1.
5. El CLI te da dos opciones para el soporte de lenguajes:
   - JavaScript
   - TypeScript
6. Opcionalmente, puede seleccionar ESLint.
7. El CLI te pregunta si quieres instalar las dependencias con npm.
   Si usas otro gestor de paquetes como `yarn` o `pnpm` puedes rechazarlo.
   En ese caso, tienes que `cd` en el directorio `functions` e instalar las dependencias manualmente.
8. Abre `./functions/package.json` y busca la clave: `"engines": {"node": "16"}`.
   La versión `node` debe coincidir con tu versión instalada de Node.js.
   De lo contrario, el proyecto podría no ejecutarse.

## Preparando tu código

Puedes usar este corto ejemplo de bot como punto de partida:

```ts
import * as functions from "firebase-functions";
import { Bot, webhookCallback } from "grammy";

const bot = new Bot("");

bot.command("start", (ctx) => ctx.reply("¡Bienvenido!. En marcha."));
bot.command("ping", (ctx) => ctx.reply(`¡Pong! ${new Date()}`));

// Durante el desarrollo, puede activar su función desde https://localhost/<firebase-projectname>/us-central1/helloWorld
export const helloWorld = functions.https.onRequest(webhookCallback(bot));
```

## Desarrollo Local

Durante el desarrollo, puedes utilizar el emulador de Firebase para ejecutar tu código localmente.
Esto es mucho más rápido que desplegar cada cambio en Firebase.
Para instalar los emuladores, ejecute:

```sh
firebase init emulators
```

El emulador de funciones ya debería estar seleccionado.
(Si no lo está, navega hasta él usando las teclas de flecha, y selecciónalo usando `espacio`).
Para las preguntas sobre qué puerto usar para cada emulador, simplemente pulsa `enter`.

Para iniciar los emuladores y ejecutar tu código, utiliza:

```sh
npm run serve
```

::: tip
Por alguna razón la configuración estándar del script npm no inicia el compilador TypeScript en modo watch.
Por lo tanto, si usas TypeScript, también tienes que ejecutar:

```sh
npm run build:watch
```

:::

Después de que se inicien los emuladores, deberías encontrar una línea en la salida de la consola parecida a esta:

```sh
+  functions[us-central1-helloWorld]: http function initialized (http://127.0.0.1:5001/<firebase-projectname>/us-central1/helloWorld).
```

Esa es la URL local de tu función en la nube.
Sin embargo, tu función sólo está disponible para el localhost de tu ordenador.
Para probar realmente tu bot, necesitas exponer tu función a Internet para que la API de Telegram pueda enviar actualizaciones a tu bot.
Hay varios servicios, como [localtunnel](https://localtunnel.me) o [ngrok](https://ngrok.com), que pueden ayudarte con eso.
En este ejemplo, utilizaremos localtunnel.

En primer lugar, vamos a instalar localtunnel:

```sh
npm i -g localtunnel
```

Después de eso, puede reenviar el puerto `5001`:

```sh
lt --port 5001
```

localtunnel debería darte una URL única, como `https://modern-heads-sink-80-132-166-120.loca.lt`.

Todo lo que queda por hacer es decirle a Telegram dónde enviar las actualizaciones.
Puedes hacerlo llamando a `setWebhook`.
Por ejemplo, abre una nueva pestaña en tu navegador y visita esta URL:

```text:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=<WEBHOOK_URL>/<firebase-projectname>/us-central1/helloWorld
```

Sustituye `<BOT_TOKEN>` por tu bot token real, y `<WEBHOOK_URL>` por tu propia URL obtenida de localtunnel.

Ahora deberías ver esto en la ventana de tu navegador.

```json:no-line-numbers
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

Tu bot ya está listo para las pruebas de despliegue.

## Despliegue

Para desplegar tu función, simplemente ejecuta:

```sh
firebase deploy
```

La CLI de Firebase te dará la URL de tu función una vez que el despliegue se haya completado.
Debería ser algo como `https://<REGION>.<MY_PROJECT.cloudfunctions.net/helloWorld`.
Para una explicación más detallada puedes echar un vistazo al paso 8 de la [guía de inicio](https://firebase.google.com/docs/functions/get-started#deploy-functions-to-a-production-environment).

Después de desplegar, necesitas decirle a Telegram dónde enviar las actualizaciones a tu bot llamando al método `setWebhook`.
Para ello, abre una nueva pestaña del navegador y visita esta URL:

```text:no-line-numbers
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<REGION>.<MY_PROJECT>.cloudfunctions.net/helloWorld
```

Reemplaza `<BOT_TOKEN>` con tu bot token real, `<REGION>` con el nombre de la región donde desplegaste tu función, y `<MY_PROJECT>` con el nombre de tu proyecto Firebase.
La CLI de Firebase debería proporcionarte la URL completa de tu función en la nube, así que puedes simplemente pegarla después del parámetro `?url=` en el método `setWebhook`.

Si todo está configurado correctamente, deberías ver esta respuesta en la ventana de tu navegador:

```json:no-line-numbers
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

Eso es todo, tu bot está listo para funcionar.
Ve a Telegram y mira cómo responde a los mensajes.
