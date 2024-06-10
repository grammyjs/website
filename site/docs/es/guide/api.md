# API del Bot

## Información general

Los bots de Telegram se comunican con los servidores de Telegram a través de peticiones HTTP.
La API del bot de Telegram es la especificación de esta interfaz, es decir, una [lista larga](https://core.telegram.org/bots/api) de métodos y tipos de datos, comúnmente llamada referencia.
Define todo lo que los bots de Telegram pueden hacer.
Puedes encontrarlo enlazado en la pestaña de Recursos de la sección Telegram.

La configuración se puede visualizar así:

```asciiart:no-line-numbers
Tu bot de grammY <———HTTP———> Bot API <———MTProto———> Telegram
```

En palabras: cuando tu bot envíe un mensaje, se enviará como una petición HTTP a un servidor _Bot API_.
Este servidor está alojado en `api.telegram.org`.
Traducirá la petición al protocolo nativo de Telegram llamado MTProto, y enviará una petición al backend de Telegram que se encarga de enviar el mensaje al usuario.

De forma análoga, cada vez que un usuario responde, se realiza el camino inverso.

Cuando ejecutes tu bot, necesitas decidir cómo deben enviarse las actualizaciones a través de la conexión HTTP.
Esto se puede hacer con [long polling o webhooks](./deployment-types).

También puedes alojar tú mismo el servidor Bot API.
Esto es útil principalmente para enviar archivos grandes, o para disminuir la latencia.

## Llamar a la API del Bot

El Bot API es lo que define lo que los bots pueden y no pueden hacer.
Cada uno de los métodos de la API de bots tiene un equivalente en grammY, y nos aseguramos de mantener siempre la biblioteca sincronizada con las últimas y mejores funciones para bots.
Ejemplo: `sendMessage` en el [Telegram Bot API Reference](https://core.telegram.org/bots/api#sendmessage) y en el [grammY API Reference](/ref/core/api#sendmessage).

### Llamar a un Método

Puedes llamar a los métodos de la API a través de `bot.api`, o [equivalentemente](./context#acciones-disponibles) a través de `ctx.api`:

::: code-group

```ts [TypeScript]
import { Api, Bot } from "grammy";

const bot = new Bot("");

async function sendHelloTo12345() {
  // Envía un mensaje a 12345.
  await bot.api.sendMessage(12345, "¡Hola!");

  // Envía un mensaje y almacena la respuesta, que contiene información sobre el mensaje enviado.
  const sentMessage = await bot.api.sendMessage(12345, "¡Hola de nuevo!");
  console.log(sentMessage.message_id);

  // Enviar un mensaje sin el objeto `bot`.
  const api = new Api(""); // <-- pon tu bot token entre los ""
  await api.sendMessage(12345, "Yo!");
}
```

```js [JavaScript]
const { Api, Bot } = require("grammy");

const bot = new Bot("");

async function sendHelloTo12345() {
  // Envía un mensaje a 12345.
  await bot.api.sendMessage(12345, "Hello!");

  // Envía un mensaje y almacena la respuesta, que contiene información sobre el mensaje enviado.
  const sentMessage = await bot.api.sendMessage(12345, "Hello again!");
  console.log(sentMessage.message_id);

  // Enviar un mensaje sin el objeto `bot`.
  const api = new Api(""); // <-- pon tu bot token entre los ""
  await api.sendMessage(12345, "Yo!");
}
```

```ts [Deno]
import { Api, Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot("");

async function sendHelloTo12345() {
  // Envía un mensaje a 12345.
  await bot.api.sendMessage(12345, "Hello!");

  // Envía un mensaje y almacena la respuesta, que contiene información sobre el mensaje enviado.
  const sentMessage = await bot.api.sendMessage(12345, "Hello again!");
  console.log(sentMessage.message_id);

  // Enviar un mensaje sin el objeto `bot`.
  const api = new Api(""); // <-- pon tu bot token entre los ""
  await api.sendMessage(12345, "Yo!");
}
```

:::

> Tenga en cuenta que `bot.api` es simplemente una instancia de `Api` que está pre-construida para usted por conveniencia.
> Ten en cuenta también que si tienes acceso a un objeto de contexto (es decir, estás dentro de un manejador de mensajes), siempre es preferible llamar a `ctx.api` o a una de las [acciones disponibles](./context#acciones-disponibles).

Aunque las instancias `Api` cubren toda la API del Bot, a veces cambian un poco las firmas de las funciones para hacerlas más usables.
Estrictamente hablando, todos los métodos de la API del Bot esperan un objeto JSON con una serie de propiedades.
Observa, sin embargo, cómo `sendMessage` en el ejemplo de código anterior recibe dos argumentos, un identificador de chat y una cadena.
grammY sabe que estos dos valores pertenecen a las propiedades `chat_id` y `text`, respectivamente, y construirá el objeto JSON correcto para ti.

Como se mencionó [anteriormente](./basics#envio-de-mensajes), puede especificar otras opciones en el tercer argumento de tipo `Other`:

```ts
async function sendHelloTo12345() {
  await bot.api.sendMessage(12345, "<i>¡Hola!</i>", {
    parse_mode: "HTML",
  });
}
```

Además, grammY se encarga de numerosos detalles técnicos para simplificar el uso de la API.
Por ejemplo, algunas propiedades específicas en algunos métodos específicos tienen que ser `JSON.stringify` antes de ser enviados.
Esto es fácil de olvidar, difícil de depurar y rompe la inferencia de tipos.
grammY te permite especificar objetos de forma consistente a través de la API, y se asegura de que las propiedades correctas se serialicen sobre la marcha antes de enviarlas.

### Definiciones de tipos para la Bot API

grammY viene con una cobertura completa de tipos de la API del Bot.
El repositorio [`@grammyjs/types`](https://github.com/grammyjs/types) contiene las definiciones de tipos que grammY utiliza internamente.
Estas definiciones de tipos también se exportan directamente desde el paquete `grammy` para que puedas utilizarlas en tu propio código.

#### Definiciones de tipos en Deno

En Deno, puede simplemente importar definiciones de tipos desde `types.ts`, que está justo al lado de `mod.ts`:

```ts
import { type Chat } from "https://deno.land/x/grammy/types.ts";
```

#### Definiciones de tipos en Node.js

En Node.js, las cosas son más complicadas.
Necesitas importar los tipos desde `grammy/types`.
Por ejemplo, puedes acceder al tipo `Chat` de esta manera:

```ts
import { type Chat } from "grammy/types";
```

Sin embargo, oficialmente, Node.js sólo soporta la importación desde sub-rutas correctamente desde Node.js 16.
En consecuencia, TypeScript requiere que el `moduleResolution` se establezca en `node16` o `nodenext`.
Ajusta tu `tsconfig.json` en consecuencia y añade la línea resaltada:

```json
{
  "compilerOptions": {
    // ...
    "moduleResolution": "node16"
    // ...
  }
}
```

En algunos casos, esto también puede funcionar sin ajustar la configuración de TypeScript.

::: warning Autocompletado incorrecto en Node.js
Si no cambias tu archivo `tsconfig.json` como se ha descrito anteriormente, puede ocurrir que tu editor de código sugiera en el autocompletado importar tipos de `grammy/out/client` o algo así.
**Todas las rutas que comienzan con `grammy/out` son internas. No las utilices.
Podrían cambiarse arbitrariamente en cualquier momento, por lo que te aconsejamos encarecidamente que importes desde `grammy/types` en su lugar.
:::

### Haciendo llamadas a la API en bruto

Puede haber ocasiones en las que quieras usar las firmas de las funciones originales, pero seguir confiando en la comodidad de la API de grammY (por ejemplo, serializando JSON cuando sea apropiado).
grammY soporta esto a través de las propiedades `bot.api.raw` (o `ctx.api.raw`).

Puedes llamar a los métodos raw así:

```ts
async function sendHelloTo12345() {
  await bot.api.raw.sendMessage({
    chat_id: 12345,
    text: "<i>¡Hola!</i>",
    parse_mode: "HTML",
  });
}
```

Básicamente, todos los parámetros de la firma de la función se fusionan con el objeto de opciones cuando se utiliza la API en bruto.

## Elegir la ubicación de un centro de datos

> [Saltar](./filter-queries) el resto de la página si estás empezando.

Si quieres reducir la latencia de red de tu bot, importa dónde lo alojes.

El servidor Bot API detrás de `api.telegram.org` está alojado en Ámsterdam, en los Países Bajos.
Por lo tanto, la mejor ubicación para ejecutar tu bot es Ámsterdam.

::: tip Comparación de alojamiento
Puede que te interese nuestra [comparación de proveedores de alojamiento](../hosting/comparison#tablas-de-comparacion).
:::

Sin embargo, podría haber un lugar aún mejor para ejecutar tu bot, aunque esto requiere un esfuerzo significativamente mayor.

[Recuerda](#informacion-general) que el servidor Bot API no contiene realmente tu bot.
Sólo retransmite peticiones, traduce entre HTTP y MTProto, etc.
Puede que el servidor Bot API esté en Ámsterdam, pero los servidores de Telegram están distribuidos en tres ubicaciones diferentes:

- Ámsterdam, Países Bajos
- Miami, Florida, Estados Unidos
- Singapur

Así, cuando el servidor Bot API envía una petición a los servidores de Telegram, puede que tenga que enviar datos a medio mundo de distancia.
Que esto ocurra o no depende del centro de datos del propio bot.
El centro de datos del bot es el mismo centro de datos que el del usuario que creó el bot.
El centro de datos de un usuario depende de muchos factores, incluida la ubicación del usuario.

Por lo tanto, esto es lo que puedes hacer si quieres reducir la latencia aún más.

1. Ponte en contacto con [@where_is_my_dc_bot](https://t.me/where_is_my_dc_bot) y envíale un archivo subido con tu propia cuenta.
   Te indicará la ubicación de tu cuenta de usuario.
   Esta es también la ubicación de tu bot.
2. Si su centro de datos está en Ámsterdam, no tiene que hacer nada.
   En caso contrario, siga leyendo.
3. Compre un [VPS](../hosting/comparison#vps) en la ubicación de su centro de datos.
4. [Ejecuta un servidor local Bot API](#ejecutar-un-servidor-local-de-bot-api) en ese VPS.
5. Aloja tu bot en la misma ubicación que tu centro de datos.

De esa forma, cada petición solo viajará la distancia más corta posible entre Telegram y tu bot.

## Ejecutar un servidor local de Bot API

Hay dos ventajas principales para ejecutar su propio servidor Bot API.

1. Tu bot puede enviar y recibir archivos de gran tamaño.
2. Tu bot puede tener retrasos de red reducidos (ver [arriba](#elegir-la-ubicacion-de-un-centro-de-datos)).

> Otras ventajas menores se enumeran [aquí](https://core.telegram.org/bots/api#using-a-local-bot-api-server).

Debes ejecutar el servidor Bot API en un VPS.
Se bloqueará o perderá mensajes si intentas ejecutarlo en otro lugar.

También debes compilar el servidor Bot API desde cero.
Es útil si tienes experiencia compilando grandes proyectos C++, pero si no la tienes, puedes simplemente copiar las instrucciones de compilación y esperar que funcionen.

**La forma más fácil de ejecutar el servidor Bot API es siguiendo el [generador de instrucciones de compilación](https://tdlib.github.io/telegram-bot-api/build.html?os=Linux) proporcionado por Telegram.

> Puedes encontrar más opciones [repositorio del servidor Bot API](https://github.com/tdlib/telegram-bot-api#installation).

Construir el servidor te da un ejecutable que puedes ejecutar.

¿Has obtenido ese ejecutable?
¡Ya puedes mover tu bot al servidor local del Bot API!

### Cerrar Sesión en el Servidor Bot API Alojado

En primer lugar, tienes que cerrar sesión en el servidor Bot API alojado.
Toma esta URL y pégala en un navegador (recuerda sustituir `<token>` por tu token de bot):

```text
https://api.telegram.org/bot<token>/logOut
```

Deberías ver `{"ok":true, "result":true}`.

### Configurar grammY para Usar el Servidor Local Bot API

A continuación, puedes decirle a grammY que use tu servidor Bot API local en lugar de `api.telegram.org`.
Digamos que tu bot corre en `localhost` en el puerto 8081.
Entonces deberías usar la siguiente configuración.

```ts
const bot = new Bot("", { // <-- usa el mismo token que antes
  client: { apiRoot: "http://localhost:8081" },
});
```

Ahora puedes iniciar tu bot de nuevo.
Usará el servidor local de la API del bot.

> Si algo ha ido mal y no tienes ni idea de cómo arreglarlo por mucho que lo busques en Google, ¡no seas tímido y únete a nuestro [chat de la comunidad](https://t.me/grammyjs) y pide ayuda!
> Sabemos incluso menos que tú sobre tu error, pero probablemente podamos responder a tus preguntas.

Recuerda que también tienes que ajustar tu código para trabajar con rutas de archivos locales en lugar de URLs apuntando a tus archivos.
Por ejemplo, llamar a `getFile` te dará una `file_path` que apunta a tu disco local, en lugar de un archivo que primero necesita ser descargado de Telegram.
De forma similar, el plugin [files](../plugins/files) tiene un método llamado `getUrl` que ya no devolverá una URL, sino una ruta absoluta de archivo.

Si alguna vez quieres cambiar esta configuración de nuevo y mover tu bot a un servidor diferente, asegúrate de leer [esta sección](https://github.com/tdlib/telegram-bot-api#moving-a-bot-to-a-local-server) del README del repositorio del servidor Bot API.
