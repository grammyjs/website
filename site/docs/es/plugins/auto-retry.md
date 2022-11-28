# Auto-reintento de solicitudes a la API (`auto-retry`)

> Considera usar el [plugin throttler](./transformer-throttler.md) en su lugar.

Este plugin es una [función transformadora de la API](../advanced/transformers.md), lo que significa que le permite interceptar y modificar las peticiones HTTP salientes sobre la marcha.
Más concretamente, este plugin detectará automáticamente si una petición de la API falla con un valor `retry_after`, es decir, debido a la limitación de velocidad.
Entonces atrapará el error, esperará el período de tiempo especificado, y luego reintentará la solicitud.

::: warning Sea amable con el servidor de la API del bot
Telegram proporciona generosamente información sobre cuánto tiempo debe esperar tu bot antes de la siguiente solicitud.
Usar el plugin `auto-retry` permitirá a tu bot rendir mejor durante los picos de carga, ya que las peticiones no fallarán simplemente por el límite de inundación.
Sin embargo, **auto-retry no debería ser usado** si quieres evitar golpear los límites de velocidad de forma regular.
Si regularmente cruzas el umbral de la cantidad de solicitudes que puedes realizar, Telegram puede tomar medidas como restringir o prohibir tu bot.
:::

Puedes instalar este plugin en el objeto `bot.api`:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { autoRetry } from "@grammyjs/auto-retry";

// Usa el plugin.
bot.api.config.use(autoRetry());
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { autoRetry } = require("@grammyjs/auto-retry");

// Usa el plugin.
bot.api.config.use(autoRetry());
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { autoRetry } from "https://esm.sh/@grammyjs/auto-retry";

// Usa el plugin.
bot.api.config.use(autoRetry());
```

</CodeGroupItem>
</CodeGroup>

Si ahora llama, por ejemplo, a `sendMessage` y se encuentra con un límite de velocidad, parecerá que la petición tarda un tiempo inusual.
Bajo el capó, se están realizando múltiples peticiones HTTP, con los retrasos apropiados entre ellas.

Puede pasar un objeto de opciones que especifique un número máximo de reintentos (`maxRetryAttempts`, por defecto: 3), o un umbral para un tiempo máximo de espera (`maxDelaySeconds`, por defecto: 1 hora).

Tan pronto como se agote el número máximo de reintentos, los siguientes errores para la misma petición no se volverán a intentar.
En su lugar, se pasa el objeto de error de Telegram, fallando efectivamente la petición con un [`GrammyError`] (/guide/errors.md#the-grammyerror-object).

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
