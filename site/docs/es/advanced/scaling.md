---
prev: ./structuring.md
next: ./reliability.md
---

# Escalando II: Alta carga

Hacer que tu bot sea capaz de manejar una alta carga depende de si ejecutas tu bot [a través de un long polling o a través de webhooks](../guide/deployment-types.md).
En cualquier caso, deberías leer algunas dificultades [a continuación](#la-concurrencia-es-difícil).

## Long Polling

La mayoría de los bots nunca necesitan procesar más de un puñado de mensajes por minuto (durante los "picos de carga").
En otras palabras, la escalabilidad no es una preocupación para ellos.
Para ser predecible, grammY procesa las actualizaciones de forma secuencial.
Este es el orden de las operaciones:

1. Obtiene hasta 100 actualizaciones a través de `getUpdates` ([Telegram Bot API Reference](https://core.telegram.org/bots/api#getupdates))
2. Para cada actualización, `await` a todos los middlewares para ello

Sin embargo, si tu bot procesa un mensaje por segundo (o algo así) durante los picos de carga, esto puede empezar a afectar negativamente a la capacidad de respuesta.
Por ejemplo, el mensaje de Bob tiene que esperar hasta que el mensaje de Alice termine de procesarse.

Esto puede solucionarse no esperando a que el mensaje de Alice termine de procesarse, es decir, procesando ambos mensajes simultáneamente.
Para conseguir la máxima capacidad de respuesta, también nos gustaría recibir nuevos mensajes mientras los mensajes de Bob y Alice siguen siendo procesados.
Idealmente, también nos gustaría limitar la concurrencia a algún número fijo para restringir la carga máxima del servidor.

El procesamiento concurrente no está incluido en el paquete central de grammY.
En su lugar, **el paquete [grammY runner](../plugins/runner.md) puede ser utilizado** para ejecutar tu bot.
Soporta todo lo anterior fuera de la caja, y es extremadamente simple de usar.

```ts
// Previamente
bot.start();

// grammY runner, exporta `run`.
run(bot);
```

El límite de concurrencia por defecto es de 500.
Si quieres profundizar en el paquete, consulta [esta página](../plugins/runner.md).

La concurrencia es difícil, así que revisa la [subsección de abajo](#la-concurrencia-es-difícil) para saber lo que debes tener en cuenta cuando uses grammY runner.

## Webhooks

Naturalmente, para que esto funcione bien bajo una alta carga, debes familiarizarte con [el uso de webhooks](../guide/deployment-types.md#como-usar-webhooks).
Esto significa que todavía tienes que ser consciente de algunas consecuencias de la concurrencia, conferir la [subsección de abajo](#la-concurrencia-es-difícil).

Además, [recuerda que](../guide/deployment-types.md#terminar-las-solicitudes-de-webhooks-a-tiempo) Telegram entregará las actualizaciones del mismo chat en secuencia, pero las actualizaciones de diferentes chats de forma concurrente.

## La concurrencia es difícil

Si tu bot procesa todas las actualizaciones de forma concurrente, esto puede causar una serie de problemas a los que hay que prestar especial atención.
Por ejemplo, si dos mensajes del mismo chat acaban siendo recibidos por la misma llamada `getUpdates`, se procesarían concurrentemente.
Ya no se puede garantizar el orden de los mensajes dentro del mismo chat.

El principal punto en el que esto puede chocar es cuando se utiliza [sessiones](../plugins/session.md), que puede encontrarse con un peligro de escritura después de lectura.
Imagina esta secuencia de eventos:

1. Alice envía el mensaje A
2. El bot comienza a procesar A
3. El bot lee los datos de la sesión de Alice de la base de datos
4. Alice envía el mensaje B
5. El bot comienza a procesar B
6. El bot lee los datos de la sesión de Alice de la base de datos
7. El bot termina de procesar A, y escribe la nueva sesión en la base de datos
8. El bot termina de procesar B, y escribe la nueva sesión en la base de datos, sobrescribiendo así los cambios realizados durante el procesamiento de A.
   ¡Pérdida de datos!

> Nota: Podría intentar utilizar transacciones de base de datos para sus sesiones, pero entonces sólo podrá detectar el peligro y no evitarlo.
> Intentar usar un bloqueo en su lugar eliminaría efectivamente toda la concurrencia.
> Es mucho más fácil evitar el peligro en primer lugar.

La mayoría de los otros sistemas de sesión de los marcos web simplemente aceptan el riesgo de las condiciones de carrera, ya que no ocurren con demasiada frecuencia en la web.
Sin embargo, nosotros no queremos esto porque los bots de Telegram son mucho más propensos a experimentar choques de peticiones paralelas para la misma clave de sesión.
Por lo tanto, tenemos que asegurarnos de que las actualizaciones que acceden a los mismos datos de sesión se procesan en secuencia para evitar esta peligrosa condición de carrera.

grammY runner viene con el middleware `sequentialize()` que asegura que las actualizaciones que chocan se procesan en secuencia.
Puedes configurarlo con la misma función que utilizas para determinar la clave de sesión.
Entonces evitará la condición de carrera mencionada anteriormente, ralentizando aquellas (y sólo aquellas) actualizaciones que podrían causar una colisión.

::::code-group
:::code-group-item TypeScript

```ts
import { Bot, Context, session } from "grammy";
import { run, sequentialize } from "@grammyjs/runner";

// Crear un bot.
const bot = new Bot("");

// Construye un identificador único para el objeto `Context`.
function getSessionKey(ctx: Context) {
  return ctx.chat?.id.toString();
}

// ¡Secuencializa antes de acceder a los datos de la sesión!
bot.use(sequentialize(getSessionKey));
bot.use(session({ getSessionKey }));

// Añadir el middleware habitual, ahora con soporte de sesión segura.
bot.on("message", (ctx) => ctx.reply("Got your message."));

// ¡Aún así, ejecútalo de forma concurrente!
run(bot);
```

:::

:::code-group-item JavaScript

```js
const { Bot, Context, session } = require("grammy");
const { run, sequentialize } = require("@grammyjs/runner");

// Crear un bot.
const bot = new Bot("");

// Construye un identificador único para el objeto `Context`.
function getSessionKey(ctx) {
  return ctx.chat?.id.toString();
}

// ¡Secuencializa antes de acceder a los datos de la sesión!
bot.use(sequentialize(getSessionKey));
bot.use(session({ getSessionKey }));

// Añadir el middleware habitual, ahora con soporte de sesión segura.
bot.on("message", (ctx) => ctx.reply("Got your message."));

// ¡Aún así, ejecútalo de forma concurrente!
run(bot);
```

:::
:::code-group-item Deno

```ts
import { Bot, Context, session } from "https://deno.land/x/grammy/mod.ts";
import { run, sequentialize } from "https://deno.land/x/grammy_runner/mod.ts";

// Crear un bot.
const bot = new Bot("");

// Construye un identificador único para el objeto `Context`.
function getSessionKey(ctx: Context) {
  return ctx.chat?.id.toString();
}

// ¡Secuencializa antes de acceder a los datos de la sesión!
bot.use(sequentialize(getSessionKey));
bot.use(session({ getSessionKey }));

// Añadir el middleware habitual, ahora con soporte de sesión segura.
bot.on("message", (ctx) => ctx.reply("Got your message."));

// ¡Aún así, ejecútalo de forma concurrente!
run(bot);
```

:::
::::

No dudes en unirte al [chat de Telegram](https://t.me/grammyjs) para discutir cómo usar grammY runner con tu bot.
Siempre estamos contentos de escuchar a las personas que mantienen grandes bots para que podamos mejorar grammY en base a su experiencia con el paquete.
