---
prev: ./context.md
next: ./filter-queries.md
---

# API del Bot

## Información general

Los bots de Telegram se comunican con los servidores de Telegram a través de peticiones HTTP.
La API del bot de Telegram es la especificación de esta interfaz, es decir, una [lista larga](https://core.telegram.org/bots/api) de métodos y tipos de datos, comúnmente llamada referencia.
Define todo lo que los bots de Telegram pueden hacer.
Puedes encontrarla enlazada en la pestaña de Recursos.

La configuración se puede visualizar así:

```asciiart:no-line-numbers
( ( ( Telegram ) MTProto API ) Bot HTTP API ) <-- el bot se conecta aquí
```

En otras palabras: cuando tu bot envíe un mensaje, será enviado como una petición HTTP a un servidor _Bot API_ (ya sea alojado por el equipo de Telegram, o [alojado por ti](https://core.telegram.org/bots/api#using-a-local-bot-api-server)).
Este servidor traducirá la petición al protocolo nativo de Telegram llamado MTProto, y enviará una petición al backend de Telegram que se encarga de enviar el mensaje al usuario.

De forma análoga, cada vez que un usuario responde, se realiza el camino inverso.

::: tip Rludir los límites de tamaño de los archivos
El backend de Telegram permite a tu bot [enviar archivos](./files.md) de hasta 2000 MB.
Sin embargo, el servidor de la API del bot que se encarga de traducir las peticiones a HTTP restringe el tamaño de los archivos a 50 MB para las descargas y 20 MB para las subidas.

Por lo tanto, si evitas el servidor Bot API que Telegram ejecuta por ti, y simplemente [alojas tu propio servidor Bot API](https://core.telegram.org/bots/api#using-a-local-bot-api-server), puedes permitir que tu bot envíe archivos de hasta 2000 MB.

> Nota: si estás trabajando con archivos grandes a través de [long polling](./deployment-types.md), deberías usar [grammY runner](../plugins/runner.md).

:::

## Llamar a la API del Bot

Cada método de la API del Bot tiene un equivalente en grammY.
Ejemplo: `sendMessage` en el [Telegram Bot API Reference](https://core.telegram.org/bots/api#sendmessage) y en el [grammY API Reference](https://deno.land/x/grammy/mod.ts?s=Api#method_sendMessage_0).

### Llamar a un Método

Puedes llamar a los métodos de la API a través de `bot.api`, o [equivalentemente](./context.md#acciones-disponibles) a través de `ctx.api`:

```ts
async function sendHelloTo12345() {
  // Envía un mensaje a 12345.
  await bot.api.sendMessage(12345, "¡Hola!");

  // Envía un mensaje y almacena la respuesta, que contiene información sobre el mensaje enviado.
  const sentMessage = await bot.api.sendMessage(12345, "¡Hola de nuevo!");
  console.log(sentMessage.message_id);
}
```

Aunque `bot.api` cubre toda la API del Bot, a veces cambia un poco las firmas de las funciones para hacerlas más usables.
Estrictamente hablando, todos los métodos de la API del Bot esperan un objeto JSON con una serie de propiedades.
Fíjate, sin embargo, en que `sendMessage` en el ejemplo anterior recibe dos argumentos, un identificador de chat y una cadena.
grammY sabe que estos dos valores pertenecen a la propiedad `chat_id` y `text`, respectivamente, y construirá el objeto JSON correcto para ti.

Como se mencionó [anteriormente](./basics.md#envio-de-mensajes), puede especificar otras opciones en el tercer argumento de tipo `Other`:

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

### Definiciones de tipos para la API

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

```json{4}
{
  "compilerOptions": {
    // ...
    "moduleResolution": "node16"
    // ...
  }
}
```

En algunos casos, esto también puede funcionar sin ajustar la configuración de TypeScript.

::: warning Autocompletar incorrecto

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
