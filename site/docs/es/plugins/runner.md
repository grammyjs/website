# Concurrencia con grammY runner (`runner`)

Este paquete se puede utilizar si ejecutas tu bot [usando long polling](../guide/deployment-types.html#long-polling), y quieres que los mensajes se procesen concurrentemente.

> Asegúrate de entender [Scaling Up II](../advanced/scaling.html#long-polling) antes de usar el runner de grammY.

## Por qué necesitamos un Bot Runner

Si estás alojando tu bot usando long polling y quieres hacerlo escalar, no hay forma de procesar las actualizaciones de forma concurrente ya que el procesamiento secuencial de las actualizaciones es demasiado lento.
Como resultado, los bots se enfrentan a una serie de retos.

- ¿Existen condiciones de carrera?
- ¿Podemos seguir "esperando" la pila de middleware? ¡Debemos tener esto para el manejo de errores!
- ¿Qué pasa si el middleware nunca se resuelve por alguna razón, esto bloquea al bot?
- ¿Podemos limitar la carga del servidor?

Como puedes ver, necesitamos una solución que pueda resolver todos los problemas anteriores para conseguir un sondeo largo adecuado para un bot.
Este es un problema muy distinto al de componer middleware o enviar mensajes a Telegram.
En consecuencia, no está resuelto por el paquete central de grammY.
En su lugar, puedes utilizar [grammY runner](https://github.com/grammyjs/runner).
También tiene su propia [Referencia API](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts).

## Uso

He aquí un ejemplo sencillo.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";
import { run } from "@grammyjs/runner";

// Crear un bot.
const bot = new Bot("<token>");

// Añade el middleware habitual
bot.on("message", (ctx) => ctx.reply("Got your message."));

// Ejecútalo de forma concurrente.
run(bot);
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```ts
const { Bot } = require("grammy");
const { run } = require("@grammyjs/runner");

// Crear un bot.
const bot = new Bot("<token>");

// Añade el middleware habitual
bot.on("message", (ctx) => ctx.reply("Got your message."));

// Ejecútalo de forma concurrente.
run(bot);
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { run } from "https://deno.land/x/grammy_runner/mod.ts";

// Crear un bot.
const bot = new Bot("<token>");

// Añade el middleware habitual
bot.on("message", (ctx) => ctx.reply("Got your message."));

// Ejecútalo de forma concurrente.
run(bot);
```

</CodeGroupItem>
</CodeGroup>

Por supuesto, aunque esto parece muy simple, hay muchas cosas que suceden bajo el capó.

## Cómo funciona entre bastidores

Cada corredor consta de tres partes diferentes.

1. La **source** extrae las actualizaciones de Telegram.
2. El **sink** suministra las actualizaciones a la instancia del bot.
3. El componente **runner** conecta la fuente y el sumidero, y te permite iniciar y detener tu bot.

```asciiart:no-line-numbers
api.telegram.org <—> source <—> runner <—> sink <—> bot
```

### Source

El runner de grammY viene con una fuente por defecto que puede operar con cualquier `UpdateSupplier` ([referencia API](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/UpdateSupplier)).
Dicho proveedor de actualizaciones es sencillo de crear a partir de una instancia del bot.
Si quieres crear uno tú mismo, asegúrate de consultar `createUpdateFetcher` ([referencia de la API](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/createUpdateFetcher)).

El origen es un iterador asíncrono de lotes de actualización, pero puede estar activo o inactivo, y puedes `cerrarlo` para desconectarte de los servidores de Telegram.

### Sink

grammY runner viene con tres posibles implementaciones de sumideros, uno secuencial (el mismo comportamiento que `bot.start()`), uno por lotes (principalmente útil para la compatibilidad con otros frameworks), y uno totalmente concurrente (utilizado por `run`).
Todos ellos operan con objetos `UpdateConsumer` ([referencia de la API](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/UpdateConsumer)) que son fáciles de crear a partir de una instancia del bot.
Si quieres hacer uno tú mismo, asegúrate de revisar `handleUpdate` en la instancia `Bot` de grammY ([referencia API](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/Bot#handleUpdate)).

El sumidero contiene una cola ([referencia de la API](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/DecayingDeque)) de actualizaciones individuales que se están procesando actualmente.
Añadir nuevas actualizaciones a la cola hará que el consumidor de actualizaciones las maneje inmediatamente, y devolverá una promesa que se resuelve tan pronto como haya capacidad en la cola de nuevo.
El número integral resuelto determina el espacio libre.
Por lo tanto, el establecimiento de un límite de concurrencia para el corredor grammY se respeta a través de la instancia de cola subyacente.

La cola también arroja las actualizaciones que tardan demasiado en procesarse, y se puede especificar un `timeoutHandler` al crear el sumidero respectivo.
Por supuesto, también debes proporcionar un manejador de errores al crear un sumidero.

Si utilizas `run(bot)`, se utilizará el gestor de errores de `bot.catch`.

### Runner

El runner es un bucle simple que extrae las actualizaciones del source y las suministra al sink.
Una vez que el sumidero tiene espacio de nuevo, el runner obtendrá el siguiente lote de actualizaciones del source.

Cuando creas un runner con `createRunner` ([referencia de la API](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/createRunner)), obtienes un manejador que puedes usar para controlar el runner.
Por ejemplo, te permite iniciarlo y detenerlo, u obtener una promesa que resuelve si el runner se detiene.
(Este handle también es devuelto por `run`).
Consulta la [referencia API](https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts/~/RunnerHandle) del `RunnerHandle`.

## Procesamiento secuencial cuando sea necesario

Lo más probable es que quieras tener la garantía de que los mensajes de un mismo chat se procesen en orden.
Esto es útil cuando se instala [session middleware](./session.html), pero también asegura que tu bot no confunda el orden de los mensajes en el mismo chat.

grammY runner exporta el middleware `sequentialize` que se encarga de esto.
Puedes consultar [esta sección](../advanced/scaling.html#concurrency-is-hard) para aprender a usarlo.

Ahora vamos a ver un uso más avanzado del plugin.

La función de restricción suministrada puede usarse no sólo para especificar el identificador del chat, o el identificador del usuario.
En su lugar, puede devolver _una lista de cadenas de identificadores de restricciones_ que determinan para cada actualización individualmente qué otros cálculos debe esperar antes de que pueda comenzar el procesamiento.

Por ejemplo, podría devolver tanto el identificador de chat como el identificador de usuario del autor del mensaje.

```ts
bot.use(sequentialize((ctx) => {
  const chat = ctx.chat?.id.toString();
  const user = ctx.from?.id.toString();
  return [chat, user].filter((con) => con !== undefined);
}));
```

Esto aseguraría que los mensajes en el mismo chat se ordenen correctamente.
Además, si Alice envía un mensaje en un grupo, y luego envía un mensaje a tu bot en el chat privado, entonces estos dos mensajes se ordenan correctamente.

En cierto sentido, puedes especificar un gráfico de dependencias entre actualizaciones.
El corredor de grammY resolverá todas las restricciones necesarias sobre la marcha y bloqueará esas actualizaciones todo el tiempo que sea necesario para garantizar un ordenamiento correcto de los mensajes.

La implementación de esto es muy eficiente.
Necesita memoria constante (a menos que se especifique una concurrencia infinita), y necesita un tiempo de procesamiento constante (amortizado) por actualización.

## Graceful shutdown

Para que el bot complete su trabajo correctamente, debes indicarle (/advanced/reliability.html#using-grammy-runner) que se detenga cuando el proceso Node esté a punto de ser destruido.

## Resumen del plugin

- Nombre: `runner`
- Fuente: <https://github.com/grammyjs/runner>
- Referencia: <https://doc.deno.land/https://deno.land/x/grammy_runner/mod.ts>
