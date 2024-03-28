# Escalando III: Fiabilidad

Si te aseguraste de tener un adecuado [manejo de errores](../guide/errors) para tu bot, básicamente estás listo para ir.
Todos los errores que se espera que ocurran (llamadas a la API que fallan, solicitudes de red que fallan, consultas a la base de datos que fallan, middleware que falla, etc) son capturados.

Deberías asegurarte de siempre `esperar` todas las promesas, o al menos llamar a `catch` en ellas si alguna vez no quieres `esperar` cosas.
Usa una regla de linting para asegurarte de que no puedes olvidar esto.

## Apagado correcto

Para los bots que utilizan long polling, hay una cosa más a considerar.
Como vas a detener tu instancia durante la operación en algún momento de nuevo, deberías considerar la captura de eventos `SIGTERM` y `SIGINT`, y llamar a `bot.stop` (long polling incorporado) o detener tu bot a través de su [manejador](/ref/runner/runnerhandle#stop) (grammY runner):

### Simple long polling

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";

const bot = new Bot("");

// Detener el bot cuando el proceso de Node.js
// está a punto de terminar
process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

await bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");

const bot = new Bot("");

// Detener el bot cuando el proceso de Node.js
// está a punto de terminar
process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

await bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot("");

// Detener el bot cuando el proceso de Deno
// está a punto de terminar
Deno.addSignalListener("SIGINT", () => bot.stop());
Deno.addSignalListener("SIGTERM", () => bot.stop());

await bot.start();
```

:::

### Usando grammY runner

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { run } from "@grammyjs/runner";

const bot = new Bot("");

const runner = run(bot);

// Detener el bot cuando el proceso de Node.js
// está a punto de terminar
const stopRunner = () => runner.isRunning() && runner.stop();
process.once("SIGINT", stopRunner);
process.once("SIGTERM", stopRunner);
```

```js [JavaScript]
const { Bot } = require("grammy");
const { run } = require("@grammyjs/runner");

const bot = new Bot("");

const runner = run(bot);

// Detener el bot cuando el proceso de Node.js
// está a punto de terminar
const stopRunner = () => runner.isRunning() && runner.stop();
process.once("SIGINT", stopRunner);
process.once("SIGTERM", stopRunner);
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { run } from "https://deno.land/x/grammy_runner/mod.ts";

const bot = new Bot("");

const runner = run(bot);

// Detener el bot cuando el proceso de Deno
// está a punto de terminar
const stopRunner = () => runner.isRunning() && runner.stop();
Deno.addSignalListener("SIGINT", stopRunner);
Deno.addSignalListener("SIGTERM", stopRunner);
```

:::

Eso es básicamente todo lo que hay que hacer para la fiabilidad, su instancia debería:registrado: nunca:tm: fallar ahora.

## Garantías de fiabilidad

¿Qué pasa si tu bot está procesando transacciones financieras y debes considerar un [escenario de `kill -9`](https://stackoverflow.com/questions/43724467/what-is-the-difference-between-kill-and-kill-9) donde la CPU se rompe físicamente o hay un corte de energía en el centro de datos?
Si por alguna razón alguien o algo realmente mata el proceso, la cosa se complica un poco más.

En esencia, los bots no pueden garantizar una ejecución _exacta_ de su middleware.
Lee [esta discusión en GitHub](https://github.com/tdlib/telegram-bot-api/issues/126) para aprender más sobre **por qué** tu bot podría enviar mensajes duplicados (o ninguno) en casos extremadamente raros.
El resto de esta sección se refiere a **cómo** se comporta grammY bajo estas circunstancias inusuales, y cómo manejar estas situaciones.

> ¿Sólo te interesa codificar un bot de Telegram? (/advanced/flood)

### Webhook

Si estás ejecutando tu bot con webhooks, el servidor de la API del bot reintentará entregar actualizaciones a tu bot si no responde con `OK` a tiempo.
Esto define el comportamiento del sistema de forma exhaustiva---si necesitas evitar el procesamiento de actualizaciones duplicadas, deberás construir tu propia desduplicación basada en `update_id`.
grammY no hace esto por ti, pero siéntete libre de PR si crees que alguien más podría beneficiarse de esto.

### Long Polling

El long polling es más interesante.
El long polling incorporado básicamente vuelve a ejecutar el lote de actualización más reciente que fue obtenido pero no pudo completarse.

> Ten en cuenta que si detienes adecuadamente tu bot con `bot.stop`, el desplazamiento de la actualización se sincronizará con los servidores de Telegram llamando a `getUpdates` con el desplazamiento correcto pero sin procesar los datos de la actualización.

En otras palabras, nunca perderás ninguna actualización, sin embargo, puede ocurrir que vuelvas a procesar hasta 100 actualizaciones que hayas visto antes.
Como las llamadas a `sendMessage` no son idempotentes, los usuarios pueden recibir mensajes duplicados de tu bot.
Sin embargo, se garantiza el procesamiento de _al menos una vez_.

### grammY Runner

Si estás utilizando el [grammY runner](../plugins/runner) en modo concurrente, la siguiente llamada a `getUpdates` se realiza potencialmente antes de que tu middleware procese la primera actualización del lote actual.
Por lo tanto, el desplazamiento de la actualización es [confirmado](https://core.telegram.org/bots/api#getupdates) prematuramente.
Este es el coste de una gran concurrencia, y desafortunadamente, no puede evitarse sin reducir tanto el rendimiento como la capacidad de respuesta.
Como resultado, si tu instancia es eliminada en el momento correcto (equivocado), podría ocurrir que hasta 100 actualizaciones no puedan ser obtenidas de nuevo porque Telegram las considera confirmadas.
Esto lleva a la pérdida de datos.

Si es crucial prevenir esto, deberías usar las fuentes y sumideros del paquete grammY runner para componer tu propio pipeline de actualización que pase todas las actualizaciones a través de una cola de mensajes primero.

1. Básicamente tendrías que crear un [sink](/ref/runner/updatesink) que empuje a la cola, e iniciar un corredor que sólo alimente tu cola de mensajes.

2. A continuación, tendría que crear un [source](/ref/runner/updatesource) que se alimente de la cola de mensajes de nuevo.
   Efectivamente, ejecutará dos instancias diferentes del corredor grammY.

Este vago borrador descrito arriba sólo ha sido esbozado pero no implementado, según nuestro conocimiento.
Por favor, [ponte en contacto con el grupo de Telegram](https://t.me/grammyjs) si tienes alguna pregunta o si intentas esto y puedes compartir tu progreso.

Por otro lado, si tu bot está bajo una gran carga y el sondeo de actualizaciones se ralentiza debido a las [restricciones de carga automática](../plugins/runner#sink), aumentan las posibilidades de que algunas actualizaciones sean recuperadas de nuevo, lo que lleva a la duplicación de mensajes de nuevo.
Por lo tanto, el precio de la concurrencia total es que no se puede garantizar el procesamiento _al menos una vez_ ni _como máximo una vez_.
