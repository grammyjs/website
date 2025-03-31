---
prev: false
next: false
---

# Auto-reintento de solicitudes a la API (`auto-retry`)

El plugin auto-retry es todo lo que necesitas para manejar
[límites de velocidad](../advanced/flood), es decir, errores con código 429.

Se puede utilizar para todos los bots durante el funcionamiento normal, pero
será especialmente útil durante la
[difusión](../advanced/flood#como-difundir-mensajes).

Este plugin es una [función transformadora de la API](../advanced/transformers),
lo que significa que le permite interceptar y modificar las peticiones HTTP
salientes sobre la marcha. Más concretamente, este plugin detectará
automáticamente si una petición de la API falla con un valor `retry_after`, es
decir, debido a la limitación de velocidad. Entonces atrapará el error, esperará
el período de tiempo especificado, y luego reintentará la solicitud.

Además de manejar los límites de velocidad, este plugin reintentará una petición
si falla con un error interno del servidor, es decir, errores con código 500 o
mayor.

Los errores de red (aquellos que
[lanzan un `HttpError`](../guide/errors#el-objeto-httperror) en grammY) también
causarán un reintento.

Reintentar estas peticiones es más o menos la única estrategia sensata para
manejar estos dos tipos de errores.

Dado que ninguno de ellos proporciona un valor `retry_after`, el plugin emplea
un backoff exponencial que comienza a los 3 segundos y tiene un límite de una
hora.

## Instalación

Puedes instalar este plugin en el objeto `bot.api`:

::: code-group

```ts [TypeScript]
import { autoRetry } from "@grammyjs/auto-retry";

// Usa el plugin.
bot.api.config.use(autoRetry());
```

```js [JavaScript]
const { autoRetry } = require("@grammyjs/auto-retry");

// Usa el plugin.
bot.api.config.use(autoRetry());
```

```ts [Deno]
import { autoRetry } from "https://deno.land/x/grammy_auto_retry/mod.ts";

// Usa el plugin.
bot.api.config.use(autoRetry());
```

:::

Si ahora llama, por ejemplo, a `sendMessage` y se encuentra con un límite de
velocidad, parecerá que la petición tarda un tiempo inusual. Bajo el capó, se
están realizando múltiples peticiones HTTP, con los retrasos apropiados entre
ellas.

## Configuración

Puede pasar un objeto de opciones que especifique un número máximo de reintentos
(`maxRetryAttempts`), o un umbral para un tiempo máximo de espera
(`maxDelaySeconds`).

### Limitar Reintentos

Tan pronto como se agote el número máximo de reintentos, los siguientes errores
para la misma petición no se volverán a intentar. En su lugar, se pasa el objeto
de error de Telegram, fallando efectivamente la petición con un
[`GrammyError`](../guide/errors#el-objeto-grammyerror).

De forma similar, si la petición falla con `retry_after` mayor que lo
especificado por la opción `maxDelaySeconds`, la petición fallará
inmediatamente.

```ts
autoRetry({
  maxRetryAttempts: 1, // Sólo se repiten las peticiones una vez
  maxDelaySeconds: 5, // Falla inmediatamente si tenemos que esperar >5 segundos
});
```

### Rechazo de errores internos del servidor

Puedes usar `rethrowInternalServerErrors` para optar por no manejar los errores
internos del servidor como se describe
[arriba](#auto-reintento-de-solicitudes-a-la-api-auto-retry).

De nuevo, se pasa el objeto de error de Telegram, fallando efectivamente la
petición con un [`GrammyError`](../guide/errors#el-objeto-grammyerror).

```ts
autoRetry({
  rethrowInternalServerErrors: true, // no gestionar los errores internos del servidor
});
```

### Errores en la red

Puede usar `rethrowHttpErrors` para optar por no manejar errores de red como se
describe [arriba](#auto-reintento-de-solicitudes-a-la-api-auto-retry).

Si se activa, las instancias lanzadas de
[`HttpError`](../guide/errors#el-objeto-httperror) son pasadas, fallando la
petición.

```ts
autoRetry({
  rethrowHttpErrors: true, // no gestionar los errores de red
});
```

## Resumen del plugin

- Nombre: `auto-retry`
- [Fuente](https://github.com/grammyjs/auto-retry)
- [Referencia de la API](/ref/auto-retry/)
