---
prev: false
next: false
---

# Control de flujo (`transformer-throttler`)

> Considere usar el [plugin auto-retry](./auto-retry) en su lugar.

Este plugin pone en cola la instancia de solicitudes de API salientes a través de [Bottleneck](https://github.com/SGrondin/bottleneck) para evitar que su bot alcance los [límites de velocidad](https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this) como se describe en [esta sección avanzada](../advanced/flood) de la documentación.

::: warning Existen límites no documentados en la API
Telegram implementa límites de velocidad no especificados y no documentados para algunas llamadas de la API.
Estos límites no documentados **no son tenidos en cuenta** por el estrangulador.
Si aún desea utilizar este plugin, considere la posibilidad de utilizar el [auto-retry plugin](./auto-retry) junto con él.
:::

## Uso

Aquí hay un ejemplo de cómo usar este plugin con las opciones por defecto.
Ten en cuenta que las opciones por defecto están alineadas con los límites de velocidad reales aplicados por Telegram, por lo que deberían estar bien.

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { apiThrottler } from "@grammyjs/transformer-throttler";

const bot = new Bot("");

const throttler = apiThrottler();
bot.api.config.use(throttler);

bot.command("example", (ctx) => ctx.reply("I am throttled"));
bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { apiThrottler } = require("@grammyjs/transformer-throttler");

const bot = new Bot("");

const throttler = apiThrottler();
bot.api.config.use(throttler);

bot.command("example", (ctx) => ctx.reply("I am throttled"));
bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { apiThrottler } from "https://deno.land/x/grammy_transformer_throttler/mod.ts";

const bot = new Bot("");

const throttler = apiThrottler();
bot.api.config.use(throttler);

bot.command("example", (ctx) => ctx.reply("I am throttled"));
bot.start();
```

:::

## Configuración

El throttler acepta un único argumento opcional de la siguiente forma:

```ts
type ThrottlerOptions = {
  global?: Bottleneck.ConstructorOptions; // para limitar todas las llamadas a la API
  group?: Bottleneck.ConstructorOptions; // para limitar los mensajes de grupo salientes
  out?: Bottleneck.ConstructorOptions; // para limitar los mensajes privados salientes
};
```

La lista completa de propiedades de los objetos disponibles para `Bottleneck.ConstructorOptions` se puede encontrar en [Bottleneck](https://github.com/SGrondin/bottleneck#constructor).

Si no se pasa ningún argumento, el estrangulador creado utilizará los ajustes de configuración por defecto que deberían ser apropiados para la mayoría de los casos de uso.
La configuración por defecto es la siguiente:

```ts
// Acelerador global saliente
const globalConfig = {
  reservoir: 30, // número de nuevos trabajos que el throttler aceptará al inicio
  reservoirRefreshAmount: 30, // número de trabajos que el throttler aceptará después de la actualización
  reservoirRefreshInterval: 1000, // intervalo en milisegundos en el que se refrescará el reservorio
};

// Acelerador de grupo saliente
const groupConfig = {
  maxConcurrent: 1, // sólo 1 trabajo a la vez
  minTime: 1000, // esperar esta cantidad de milisegundos para estar listo, después de un trabajo
  reservoir: 20, // número de nuevos trabajos que el throttler aceptará al inicio
  reservoirRefreshAmount: 20, // número de trabajos que el throttler aceptará después de la actualización
  reservoirRefreshInterval: 60000, // intervalo en milisegundos en el que se refrescará el reservorio
};

// Acelerador privado de salida
const outConfig = {
  maxConcurrent: 1, // sólo 1 trabajo a la vez
  minTime: 1000, // esperar esta cantidad de milisegundos para estar listo, después de un trabajo
};
```

## Resumen del plugin

- Nombre: `transformer-throttler`
- Fuente: <https://github.com/grammyjs/transformer-throttler>
- Referencia: <https://deno.land/x/grammy_transformer_throttler/mod.ts>
