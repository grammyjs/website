---
prev: false
next: false
---

# Auto-reintento de solicitudes a la API (`auto-retry`)

> Considera usar el [plugin throttler](./transformer-throttler) en su lugar.

Este plugin es una [función transformadora de la API](../advanced/transformers), lo que significa que le permite interceptar y modificar las peticiones HTTP salientes sobre la marcha.
Más concretamente, este plugin detectará automáticamente si una petición de la API falla con un valor `retry_after`, es decir, debido a la limitación de velocidad.
Entonces atrapará el error, esperará el período de tiempo especificado, y luego reintentará la solicitud.

::: tip Control de inundaciones
Telegram te avisará si envías mensajes demasiado rápido.
Esta es una medida importante para el control de inundaciones, ya que se asegura de que tu bot no someta a Telegram a demasiada carga.
Usar este plugin es importante porque si te olvidas de respetar los errores 429, Telegram puede banear tu bot.
:::

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
import { autoRetry } from "https://esm.sh/@grammyjs/auto-retry";

// Usa el plugin.
bot.api.config.use(autoRetry());
```

:::

Si ahora llama, por ejemplo, a `sendMessage` y se encuentra con un límite de velocidad, parecerá que la petición tarda un tiempo inusual.
Bajo el capó, se están realizando múltiples peticiones HTTP, con los retrasos apropiados entre ellas.

Puede pasar un objeto de opciones que especifique un número máximo de reintentos (`maxRetryAttempts`, por defecto: 3), o un umbral para un tiempo máximo de espera (`maxDelaySeconds`, por defecto: 1 hora).

Tan pronto como se agote el número máximo de reintentos, los siguientes errores para la misma petición no se volverán a intentar.
En su lugar, se pasa el objeto de error de Telegram, fallando efectivamente la petición con un [`GrammyError`](../guide/errors#el-objeto-grammyerror).

De forma similar, si la petición falla con `retry_after` mayor que lo especificado por la opción `maxDelaySeconds`, la petición fallará inmediatamente.

```ts
autoRetry({
  maxRetryAttempts: 1, // Sólo se repiten las peticiones una vez
  maxDelaySeconds: 5, // Falla inmediatamente si tenemos que esperar >5 segundos
});
```

## Resumen del plugin

- Nombre: `auto-retry`
- Fuente: <https://github.com/grammyjs/auto-retry>
- Reference: <https://doc.deno.land/https://raw.githubusercontent.com/grammyjs/auto-retry/main/src/index.ts>
