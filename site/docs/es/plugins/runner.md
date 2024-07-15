---
prev: false
next: false
---

# Concurrencia (`runner`)

Este paquete se puede utilizar si ejecutas tu bot [usando long polling](../guide/deployment-types), y quieres que los mensajes se procesen concurrentemente.

> Asegúrate de entender [Scaling Up II](../advanced/scaling#long-polling) antes de usar el runner de grammY.

## Por qué necesitamos un Bot Runner

Si estás alojando tu bot usando long polling y quieres hacerlo escalar, no hay forma de procesar las actualizaciones de forma concurrente ya que el procesamiento secuencial de las actualizaciones es demasiado lento.
Como resultado, los bots se enfrentan a una serie de retos.

- ¿Existen condiciones de carrera?
- ¿Podemos seguir "esperando" la pila de middleware? ¡Debemos tener esto para el manejo de errores!
- ¿Qué pasa si el middleware nunca se resuelve por alguna razón, esto bloquea al bot?
- ¿Podemos procesar algunas actualizaciones seleccionadas en secuencia?
- ¿Podemos limitar la carga del servidor?
- ¿Podemos procesar las actualizaciones en varios núcleos?

Como puedes ver, necesitamos una solución que pueda resolver todos los problemas anteriores para conseguir un sondeo largo adecuado para un bot.
Este es un problema muy distinto al de componer middleware o enviar mensajes a Telegram.
En consecuencia, no está resuelto por el paquete central de grammY.
En su lugar, puedes utilizar [grammY runner](https://github.com/grammyjs/runner).
También tiene su propia [Referencia API](/ref/runner/).

## Uso

He aquí un ejemplo sencillo.

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { run } from "@grammyjs/runner";

// Crear un bot.
const bot = new Bot("");

// Añade el middleware habitual
bot.on("message", (ctx) => ctx.reply("Got your message."));

// Ejecútalo de forma concurrente.
run(bot);
```

```js [JavaScript]
const { Bot } = require("grammy");
const { run } = require("@grammyjs/runner");

// Crear un bot.
const bot = new Bot("");

// Añade el middleware habitual
bot.on("message", (ctx) => ctx.reply("Got your message."));

// Ejecútalo de forma concurrente.
run(bot);
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { run } from "https://deno.land/x/grammy_runner/mod.ts";

// Crear un bot.
const bot = new Bot("");

// Añade el middleware habitual
bot.on("message", (ctx) => ctx.reply("Got your message."));

// Ejecútalo de forma concurrente.
run(bot);
```

:::

## Procesamiento secuencial cuando sea necesario

Lo más probable es que quieras tener la garantía de que los mensajes del mismo chat se procesan en orden.
Esto es útil cuando se instala [session middleware](./session), pero también asegura que tu bot no confunda el orden de los mensajes en el mismo chat.

grammY runner exporta el middleware `sequentialize` que se encarga de esto.
Puedes consultar esta [sección](../advanced/scaling#la-concurrencia-es-dificil) para aprender a usarlo.

Ahora vamos a ver un uso más avanzado del plugin.

La función de restricción suministrada puede usarse no sólo para especificar el identificador de chat, o el identificador de usuario.

En su lugar, puede devolver _una lista de cadenas de identificadores de restricciones_ que determinan para cada actualización individualmente qué otros cálculos debe esperar antes de que pueda comenzar el procesamiento.

Por ejemplo, podría devolver tanto el identificador de chat como el identificador de usuario del autor del mensaje.

```ts
bot.use(
  sequentialize((ctx) => {
    const chat = ctx.chat?.id.toString();
    const user = ctx.from?.id.toString();
    return [chat, user].filter((con) => con !== undefined);
  }),
);
```

Esto aseguraría que los mensajes en el mismo chat se ordenen correctamente.
Además, si Alice envía un mensaje en un grupo, y luego envía un mensaje a tu bot en el chat privado, entonces estos dos mensajes se ordenan correctamente.

En cierto sentido, puedes, por tanto, especificar un grafo de dependencias entre actualizaciones.
grammY runner resolverá todas las restricciones necesarias sobre la marcha y bloqueará esas actualizaciones el tiempo que sea necesario para garantizar el orden correcto de los mensajes.

La implementación de esto es muy eficiente.
Necesita memoria constante (a menos que especifiques concurrencia infinita), y necesita (amortizado) tiempo de procesamiento constante por actualización.

## Apagado gradual

Para que el bot complete su trabajo correctamente, [debes indicarle](../advanced/reliability#usando-grammy-runner) que se detenga cuando el proceso esté a punto de ser destruido.

Ten en cuenta que puedes esperar a que el runner `await` la `task` en el [`RunnerHandle`](/ref/runner/runnerhandle) devuelto por `run`.

```ts
const handle = run(bot);
handle.task().then(() => {
  console.log("¡Procesamiento de Bot hecho!");
});
```

## Opciones avanzadas

grammY runner consta de tres cosas: una fuente, un sumidero y un ejecutor.
La fuente extrae actualizaciones, el sumidero consume actualizaciones, y el corredor configura y conecta los dos.

> Puede encontrar una descripción detallada de cómo funciona internamente el corredor [aquí abajo](#como-funciona-entre-bastidores).

Cada una de estas tres partes puede ser configurada a través de varias opciones.
Esto puede reducir el tráfico de red, permitirte especificar las actualizaciones permitidas y mucho más.

Cada parte del ejecutor acepta su configuración a través de un objeto de opciones dedicado.

```ts
run(bot, {
  source: {},
  runner: {},
  sink: {},
});
```

Debería consultar las `RunOptions` en la [referencia API](/ref/runner/runoptions) para ver qué opciones están disponibles.

Por ejemplo, allí encontrarás que `allowed_updates` puede ser activado usando el siguiente fragmento de código.

```ts
run(bot, { runner: { fetch: { allowed_updates: [] } } });
```

## Multihilo

> No tiene sentido el multithreading si tu bot no procesa al menos 50 millones de actualizaciones al día (>500 por segundo).
> [Sáltate esta sección](#como-funciona-entre-bastidores) si tu bot maneja menos tráfico que eso.

JavaScript es monohilo.
Esto es asombroso porque la [concurrencia es dificil](../advanced/scaling#la-concurrencia-es-dificil), lo que significa que si sólo hay un único hilo, naturalmente se eliminan muchos quebraderos de cabeza.

Sin embargo, si tu bot tiene una carga extremadamente alta (estamos hablando de 1000 actualizaciones por segundo y más), entonces hacer todo en un solo núcleo puede que ya no sea suficiente.
Básicamente, un solo núcleo comenzará a luchar con el procesamiento JSON de todos los mensajes que tu bot tiene que manejar.

### Bot Workers para la gestión de actualizaciones

Hay una forma sencilla de solucionarlo: ¡los bot workers!
grammY runner te permite crear varios workers que pueden procesar tus actualizaciones en paralelo en núcleos realmente diferentes (usando diferentes bucles de eventos y con memoria separada).

En Node.js, grammY runner utiliza [Worker Threads](https://nodejs.org/api/worker_threads.html).
En Deno, grammY runner usa [Web Workers](https://docs.deno.com/runtime/manual/runtime/workers).

Conceptualmente, grammY runner te proporciona una clase llamada `BotWorker` que puede manejar actualizaciones.
Es equivalente a la clase normal `Bot` (de hecho, incluso `extends Bot`).
La principal diferencia entre `BotWorker` y `Bot` es que `BotWorker` no puede obtener actualizaciones.
En su lugar, tiene que recibirlas de un `Bot` normal que controle a sus trabajadores.

```asciiart:no-line-numbers
1. obtener actualizaciones                       Bot
                                              __// \\__
                                           __/  /   \  \__
2. enviar actualizaciones               __/    /     \    \__
                                     __/      /       \      \__
                                    /        /         \        \
3. procesar actualizaciones   BotWorker  BotWorker  BotWorker  BotWorker
```

grammY runner te proporciona un middleware que puede enviar actualizaciones a los bot workers.
Los bot workers pueden entonces recibir esta actualización y manejarla.
De esta forma, el bot central sólo tiene que preocuparse de recibir y distribuir las actualizaciones entre los bot workers que orquesta.
La gestión real de las actualizaciones (filtrado de mensajes, envío de respuestas, etc.) corre a cargo de los bot workers.

Veamos ahora cómo se puede utilizar esto.

### Usando Bot Workers

> Se pueden encontrar ejemplos de esto en el [repositorio grammY runner](https://github.com/grammyjs/runner/tree/main/examples).

Empezaremos creando la instancia central del bot que obtiene las actualizaciones y las distribuye entre los workers.
Empecemos creando un archivo llamado `bot.ts` con el siguiente contenido.

::: code-group

```ts [TypeScript]
// bot.ts
import { Bot } from "grammy";
import { distribute, run } from "@grammyjs/runner";

// Crea el bot.
const bot = new Bot(""); // <-- pon tu bot token entre los ""

// Opcionalmente, secuencializa las actualizaciones aquí.
// bot.use(sequentialize(...))

// Distribuye las actualizaciones entre los bot workers.
bot.use(distribute(__dirname + "/worker"));

// Ejecuta el bot concurrentemente con multi-threading.
run(bot);
```

```js [JavaScript]
// bot.js
const { Bot } = require("grammy");
const { distribute, run } = require("@grammyjs/runner");

// Crea el bot.
const bot = new Bot(""); // <-- pon tu bot token entre los ""

// Opcionalmente, secuencializa las actualizaciones aquí.
// bot.use(sequentialize(...))

// Distribuye las actualizaciones entre los bot workers.
bot.use(distribute(__dirname + "/worker"));

// Ejecuta el bot concurrentemente con multi-threading.
run(bot);
```

```ts [Deno]
// bot.ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { distribute, run } from "https://deno.land/x/grammy_runner/mod.ts";

// Crea el bot.
const bot = new Bot(""); // <-- pon tu bot token entre los ""

// Opcionalmente, secuencializa las actualizaciones aquí.
// bot.use(sequentialize(...))

// Distribuye las actualizaciones entre los bot workers.
bot.use(distribute(new URL("./worker.ts", import.meta.url)));

// Ejecuta el bot concurrentemente con multi-threading.
run(bot);
```

:::

Junto a `bot.ts`, creamos un segundo archivo llamado `worker.ts` (como se especifica en la línea 12 del código anterior).
Este contendrá la lógica real del bot.

::: code-group

```ts [TypeScript]
// worker.ts
import { BotWorker } from "@grammyjs/runner";

// Crea un nuevo bot worker.
const bot = new BotWorker(""); // <-- pasa tu bot token aquí de nuevo.

// Añade la lógica de manejo de mensajes.
bot.on("message", (ctx) => ctx.reply("¡Viva!"));
```

```js [JavaScript]
// worker.js
const { BotWorker } = require("@grammyjs/runner");

// Crea un nuevo bot worker.
const bot = new BotWorker(""); // <-- pasa tu bot token aquí de nuevo.

// Añade la lógica de manejo de mensajes.
bot.on("message", (ctx) => ctx.reply("¡Viva!"));
```

```ts [Deno]
// worker.ts
import { BotWorker } from "https://deno.land/x/grammy_runner/mod.ts";

// Crea un nuevo bot worker.
const bot = new BotWorker(""); // <-- pasa tu bot token aquí de nuevo.

// Añade la lógica de manejo de mensajes.
bot.on("message", (ctx) => ctx.reply("¡Viva!"));
```

:::

> Ten en cuenta que cada worker puede enviar mensajes de vuelta a Telegram.
> Esta es la razón por la que debes dar tu token bot a cada worker, también.

No tienes que iniciar los bot workers, ni exportar nada del archivo.
Es suficiente con crear una instancia de `BotWorker`.
Escuchará las actualizaciones automáticamente.

Es importante entender que **sólo las actualizaciones en bruto** se envían a los bot workers.
En otras palabras, los [objetos de contexto](../guide/context) se crean dos veces para cada actualización: una en `bot.ts` para que pueda ser distribuida a un bot worker, y otra en `worker.ts` para que pueda ser realmente manejada.
Es más: las propiedades que se instalan en el objeto de contexto en `bot.ts` no se envían a los bot workers.
Esto significa que todos los plugins deben ser instalados en los bot workers.

::: tip Distribuir sólo algunas actualizaciones
Como optimización del rendimiento, puedes descartar las actualizaciones que no quieras gestionar.
De esta forma, tu bot no tiene que enviar la actualización a un worker, sólo para que sea ignorada allí.

::: code-group

```ts [Node.js]
// Nuestro bot sólo maneja mensajes, ediciones y consultas de devolución de llamada,
// por lo que podemos ignorar el resto de actualizaciones y no distribuirlas.
bot.on(
  ["message", "edited_message", "callback_query"],
  distribute(__dirname + "/worker"),
);
```

```ts [Deno]
// Nuestro bot sólo maneja mensajes, ediciones y consultas de devolución de llamada,
// por lo que podemos ignorar el resto de actualizaciones y no distribuirlas.
bot.on(
  ["message", "edited_message", "callback_query"],
  distribute(new URL("./worker.ts", import.meta.url)),
);
```

:::

Por defecto, `distribute` crea 4 bot workers.
Puedes ajustar este número fácilmente.

```ts
// Distribuye las actualizaciones entre 8 bot workers.
bot.use(distribute(workerFile, { count: 8 }));
```

Tenga en cuenta que su aplicación nunca debe generar más subprocesos que los núcleos físicos de su CPU.
Esto no mejorará el rendimiento, sino que lo degradará.

## Cómo funciona entre bastidores

Por supuesto, aunque el uso de grammY runner parece muy sencillo, hay mucho que hacer bajo el capó.

Cada corredor consta de tres partes diferentes.

1. La **source** extrae las actualizaciones de Telegram.
2. El **sink** suministra las actualizaciones a la instancia del bot.
3. El componente **runner** conecta la fuente y el sumidero, y te permite iniciar y detener tu bot.

```asciiart:no-line-numbers
api.telegram.org <—> source <—> runner <—> sink <—> bot
```

### Source

El runner de grammY viene con una fuente por defecto que puede operar con cualquier `UpdateSupplier` ([referencia API](/ref/runner/updatesupplier)).
Dicho proveedor de actualizaciones es sencillo de crear a partir de una instancia del bot.
Si quieres crear uno tú mismo, asegúrate de consultar `createUpdateFetcher` ([referencia de la API](/ref/runner/createupdatefetcher)).

El origen es un iterador asíncrono de lotes de actualización, pero puede estar activo o inactivo, y puedes `cerrarlo` para desconectarte de los servidores de Telegram.

### Sink

grammY runner viene con tres posibles implementaciones de sumideros, uno secuencial (el mismo comportamiento que `bot.start()`), uno por lotes (principalmente útil para la compatibilidad con otros frameworks), y uno totalmente concurrente (utilizado por `run`).
Todos ellos operan con objetos `UpdateConsumer` ([referencia de la API](/ref/runner/updateconsumer)) que son fáciles de crear a partir de una instancia del bot.
Si quieres hacer uno tú mismo, asegúrate de revisar `handleUpdate` en la instancia `Bot` de grammY ([referencia API](/ref/core/bot#handleupdate)).

El sumidero contiene una cola ([referencia de la API](/ref/runner/decayingdeque)) de actualizaciones individuales que se están procesando actualmente.
Añadir nuevas actualizaciones a la cola hará que el consumidor de actualizaciones las maneje inmediatamente, y devolverá una promesa que se resuelve tan pronto como haya capacidad en la cola de nuevo.
El número integral resuelto determina el espacio libre.
Por lo tanto, el establecimiento de un límite de concurrencia para el corredor grammY se respeta a través de la instancia de cola subyacente.

La cola también arroja las actualizaciones que tardan demasiado en procesarse, y se puede especificar un `timeoutHandler` al crear el sumidero respectivo.
Por supuesto, también debes proporcionar un manejador de errores al crear un sumidero.

Si utilizas `run(bot)`, se utilizará el gestor de errores de `bot.catch`.

### Runner

El runner es un bucle simple que extrae las actualizaciones del source y las suministra al sink.
Una vez que el sumidero tiene espacio de nuevo, el runner obtendrá el siguiente lote de actualizaciones del source.

Cuando creas un runner con `createRunner` ([referencia de la API](/ref/runner/createrunner)), obtienes un manejador que puedes usar para controlar el runner.
Por ejemplo, te permite iniciarlo y detenerlo, u obtener una promesa que resuelve si el runner se detiene.
(Este handle también es devuelto por `run`).
Consulta la [referencia API](/ref/runner/runnerhandle) del `RunnerHandle`.

### La función `run`

La función `run` hace algunas cosas para ayudarle a utilizar la estructura anterior con facilidad.

1. Crea un proveedor de actualizaciones desde tu bot.
2. Crea una [source](#source) a partir del proveedor de actualizaciones.
3. Crea un consumidor de actualizaciones desde tu bot.
4. Crea un [sink](#sink) a partir del consumidor de actualizaciones.
5. Crea un [runner](#runner) a partir del source y del sink.
6. Inicia el ejecutor.

Se devuelve el manejador del runner creado, lo que permite controlar el runner.

## Resumen del plugin

- Nombre: `runner`
- [Fuente](https://github.com/grammyjs/runner)
- [Referencia](/ref/runner/)
