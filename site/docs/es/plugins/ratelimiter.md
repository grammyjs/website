# Usuarios con límite de velocidad (`ratelimiter`)

rateLimiter es un middleware de limitación de tasa para los bots de Telegram hechos con los frameworks de bots grammY o [Telegraf](https://github.com/telegraf/telegraf).
En términos simples, es un plugin que te ayuda a desviar el spam pesado en tus bots.
Para entender mejor rateLimiter, puedes echar un vistazo a la siguiente ilustración:

![El papel de rateLimiter para desviar el spam](/rateLimiter-role.png)

## ¿Cómo funciona exactamente?

En circunstancias normales, cada solicitud será procesada y respondida por su bot, lo que significa que hacer spam no será tan difícil. ¡Cada usuario puede enviar múltiples peticiones por segundo y tu script tiene que procesar cada petición, pero ¿cómo puedes detenerlo? con rateLimiter!

::: warning Limitando los usuarios, no los servidores de Telegram.
Debes tener en cuenta que este paquete **NO** limita la tasa de las solicitudes entrantes de los servidores de telegramas, en su lugar, rastrea las solicitudes entrantes por `from.id` y las descarta a su llegada para que no se añada más carga de procesamiento a tus servidores.
:::

## Personalización

Este plugin expone 5 opciones personalizables:

- `timeFrame`: El intervalo de tiempo durante el cual se monitorizarán las peticiones (por defecto es `1000` ms).
- `limit`: El número de peticiones permitidas dentro de cada `timeFrame` (por defecto es `1`).
- `storageClient`: El tipo de almacenamiento que se utilizará para mantener un registro de los usuarios y sus peticiones. El valor por defecto es `MEMORY_STORE` que utiliza un [Mapa] en memoria (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map), pero también se puede pasar un cliente Redis (más información en [About storageClient](#about-storageclient)).
- `onLimitExceeded`: Una función que describe qué hacer si el usuario excede el límite (ignora las peticiones extra por defecto).
- `keyGenerator`: Una función que devuelve una clave única generada para cada usuario (utiliza `from.id` por defecto). Esta clave se utiliza para identificar al usuario, por lo que debe ser única, específica del usuario y en formato de cadena.

### Sobre `storageClient`

El `MEMORY_STORE` o el seguimiento en memoria es adecuado para la mayoría de los bots, sin embargo si implementas el clustering para tu bot no podrás utilizar el almacenamiento en memoria de forma efectiva.
Por eso también se proporciona la opción Redis.
Puedes pasar un cliente Redis desde [ioredis](https://github.com/luin/ioredis) o [redis](https://deno.land/x/redis) en caso de que uses deno.
En realidad, cualquier controlador de Redis que implemente los métodos `incr` y `pexpire` debería funcionar bien.
rateLimiter es agnóstico al controlador.

> Nota: Debe tener redis-server **2.6.0** y superior en su servidor para utilizar el cliente de almacenamiento Redis con rateLimiter.
> Las versiones anteriores de Redis no son compatibles.

## Cómo utilizarlo

Hay dos maneras de utilizar rateLimiter:

- Aceptando los valores por defecto ([Configuración por defecto](#default-configuration)).
- Pasando un objeto personalizado que contenga sus ajustes ([Configuración manual](#manual-configuration)).

### Configuración por defecto

Este fragmento demuestra la forma más sencilla de utilizar rateLimiter, que es aceptar el comportamiento por defecto:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { limit } from "@grammyjs/ratelimiter";

// Limita el manejo de mensajes a un mensaje por segundo para cada usuario.
bot.use(limit());
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const { limit } = require("@grammyjs/ratelimiter");
// Limita el manejo de mensajes a un mensaje por segundo para cada usuario.
bot.use(limit());
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { limit } from "https://deno.land/x/grammy_ratelimiter/mod.ts";
// Limita el manejo de mensajes a un mensaje por segundo para cada usuario.
bot.use(limit());
```

</CodeGroupItem>
</CodeGroup>

### Configuración manual

Como se mencionó anteriormente, puedes pasar un objeto `Options` al método `limit()` para alterar el comportamiento del limitador.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import Redis from "ioredis";
import { limit } from "@grammyjs/ratelimiter";

const redis = new Redis(...);

bot.use(
  limit({
    // Permitir que sólo se manejen 3 mensajes cada 2 segundos.
    timeFrame: 2000,

    limit: 3,

    // "MEMORY_STORE" es el valor por defecto. Si no quieres usar Redis, no pases storageClient en absoluto.
    storageClient: redis,

    // Se llama cuando se supera el límite.
    onLimitExceeded: async (ctx) => {
      await ctx.reply("¡Por favor, absténgase de enviar demasiadas solicitudes!");
    },

    // Tenga en cuenta que la clave debe ser un número en formato de cadena como "123456789".
    keyGenerator: (ctx) => {
      return ctx.from?.id.toString();
    },
  })
);
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const Redis = require("ioredis");
const { limit } = require("@grammyjs/ratelimiter");

const redis = new Redis(...);

bot.use(
  limit({
    // Permitir que sólo se manejen 3 mensajes cada 2 segundos.
    timeFrame: 2000,

    limit: 3,

    // "MEMORY_STORE" es el valor por defecto. Si no quieres usar Redis, no pases storageClient en absoluto.
    storageClient: redis,

    // Se llama cuando se supera el límite.
    onLimitExceeded: async (ctx) => {
      await ctx.reply("¡Por favor, absténgase de enviar demasiadas solicitudes!");
    },
    // Tenga en cuenta que la clave debe ser un número en formato de cadena como "123456789".
    keyGenerator: (ctx) => {
      return ctx.from?.id.toString();
    },
  })
);
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { connect } from "https://deno.land/x/redis/mod.ts";
import { limit } from "https://deno.land/x/grammy_ratelimiter/mod.ts";

const redis = await connect(...);

bot.use(
  limit({
    // Permitir que sólo se manejen 3 mensajes cada 2 segundos.
    timeFrame: 2000,

    limit: 3,

    // "MEMORY_STORE" es el valor por defecto. Si no quieres usar Redis, no pases storageClient en absoluto.
    storageClient: redis,

    // Se llama cuando se supera el límite.
    onLimitExceeded: async (ctx) => {
      await ctx.reply("¡Por favor, absténgase de enviar demasiadas solicitudes!");
    },
    // Tenga en cuenta que la clave debe ser un número en formato de cadena como "123456789".
    keyGenerator: (ctx) => {
      return ctx.from?.id.toString();
    },
  })
);
```

</CodeGroupItem>
</CodeGroup>

Como puedes ver en el ejemplo anterior, cada usuario puede enviar 3 peticiones cada 2 segundos.
Si dicho usuario envía más peticiones, el bot responde con _Por favor, absténgase de enviar demasiadas peticiones_.
Esa petición no viajará más y morirá inmediatamente ya que no llamamos a [next()](/guide/middleware.html#the-middleware-stack) en el middleware.

> Nota: Para evitar inundar los servidores de Telegram, `onLimitExceeded` sólo se ejecuta una vez en cada `timeFrame`.

Otro caso de uso sería limitar las peticiones entrantes de un chat en lugar de un usuario específico:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { limit } from "@grammyjs/ratelimiter";

bot.use(
  limit({
    keyGenerator: (ctx) => {
      if (ctx.chat?.type === "group" || ctx.chat?.type === "supergroup") {
        // Tenga en cuenta que la clave debe ser un número en formato de cadena como "123456789".
        return ctx.chat.id.toString();
      }
    },
  }),
);
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const { limit } = require("@grammyjs/ratelimiter");

bot.use(
  limit({
    keyGenerator: (ctx) => {
      if (ctx.chat?.type === "group" || ctx.chat?.type === "supergroup") {
        // Tenga en cuenta que la clave debe ser un número en formato de cadena como "123456789".
        return ctx.chat.id.toString();
      }
    },
  }),
);
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { limit } from "https://deno.land/x/grammy_ratelimiter/mod.ts";

bot.use(
  limit({
    keyGenerator: (ctx) => {
      if (ctx.chat?.type === "group" || ctx.chat?.type === "supergroup") {
        // Tenga en cuenta que la clave debe ser un número en formato de cadena como "123456789".
        return ctx.chat.id.toString();
      }
    },
  }),
);
```

</CodeGroupItem>
</CodeGroup>

En este ejemplo, he utilizado `chat.id` como clave única para la limitación de la tasa.

## Resumen del plugin

- Nombre: `ratelimitador`
- Fuente: <https://github.com/grammyjs/rateLimiter>
- Referencia: <https://doc.deno.land/https://deno.land/x/grammy_ratelimiter/rateLimiter.ts>
