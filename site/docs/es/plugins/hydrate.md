---
prev: false
next: false
---

# Hidratar (`hydrate`)

Este plugin instala métodos útiles en dos tipos de objetos, a saber

1. los resultados de las llamadas a la API, y
2. los objetos del objeto de contexto `ctx`.

En lugar de tener que llamar a `ctx.api` o `bot.api` y tener que suministrar todo tipo de identificadores, ahora puedes simplemente llamar a los métodos de los objetos y simplemente funcionarán.
Esto se ilustra mejor con un ejemplo.

**SIN** este plugin:

```ts
bot.on(":photo", async (ctx) => {
  const statusMessage = await ctx.reply("Procesando");
  await doWork(ctx.msg.photo); // un procesado largo de la imagen
  await ctx.api.editMessageText(
    ctx.chat.id,
    statusMessage.message_id,
    "¡Hecho!",
  );
  setTimeout(
    () =>
      ctx.api.deleteMessage(ctx.chat.id, statusMessage.message_id).catch(
        () => {
          // No hacer nada en caso de error.
        },
      ),
    3000,
  );
});
```

**CON** este plugin:

```ts
bot.on(":photo", async (ctx) => {
  const statusMessage = await ctx.reply("Procesando");
  await doWork(ctx.msg.photo); // un procesado largo de la imagen
  await statusMessage.editText("¡Hecho!"); // ¡tan fácil!
  setTimeout(() => statusMessage.delete().catch(() => {}), 3000);
});
```

Genial, ¿verdad?

## Instalación

Hay dos maneras de instalar este plugin.

### Instalación simple

Este plugin se puede instalar de una manera sencilla que debería ser suficiente para la mayoría de los usuarios.

::: code-group

```ts [TypeScript]
import { Bot, Context } from "grammy";
import { hydrate, HydrateFlavor } from "@grammyjs/hydrate";

type MyContext = HydrateFlavor<Context>;

const bot = new Bot<MyContext>("");

bot.use(hydrate());
```

```js [JavaScript]
import { Bot } from "grammy";
import { hydrate } from "@grammyjs/hydrate";

const bot = new Bot("");

bot.use(hydrate());
```

```ts [Deno]
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  hydrate,
  HydrateFlavor,
} from "https://deno.land/x/grammy_hydrate/mod.ts";

type MyContext = HydrateFlavor<Context>;

const bot = new Bot<MyContext>("");

bot.use(hydrate());
```

:::

### Instalación avanzada

Al utilizar la instalación simple, sólo se hidratarán los resultados de las llamadas a la API que pasen por `ctx.api`, por ejemplo, `ctx.reply`.
Estas son la mayoría de las llamadas para la mayoría de los bots.

Sin embargo, algunos bots pueden necesitar hacer llamadas a `bot.api`.
En este caso, deberías utilizar esta instalación avanzada.

Integrará la hidratación del contexto y la hidratación de los resultados de las llamadas a la API por separado en tu bot.
Ten en cuenta que ahora también tienes que instalar un [API flavor](../advanced/transformers#api-flavoring).

::: code-group

```ts [TypeScript]
import { Api, Bot, Context } from "grammy";
import {
  hydrateApi,
  HydrateApiFlavor,
  hydrateContext,
  HydrateFlavor,
} from "@grammyjs/hydrate";

type MyContext = HydrateFlavor<Context>;
type MyApi = HydrateApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");

bot.use(hydrateContext());
bot.api.config.use(hydrateApi());
```

```js [JavaScript]
import { Bot } from "grammy";
import { hydrateApi, hydrateContext } from "@grammyjs/hydrate";

const bot = new Bot("");

bot.use(hydrateContext());
bot.api.config.use(hydrateApi());
```

```ts [Deno]
import { Api, Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  hydrateApi,
  HydrateApiFlavor,
  hydrateContext,
  HydrateFlavor,
} from "https://deno.land/x/grammy_hydrate/mod.ts";

type MyContext = HydrateFlavor<Context>;
type MyApi = HydrateApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");

bot.use(hydrateContext());
bot.api.config.use(hydrateApi());
```

:::

## Qué objetos se hidratan

Este plugin actualmente hidrata

- mensajes y mensajes del canal
- mensajes editados y mensajes de canal editados
- consultas de devolución de llamada
- consultas en línea
- resultados elegidos en línea
- consultas de la aplicación web
- consultas de precomprobación y envío
- solicitudes de ingreso al chat

Todos los objetos se hidratan en

- el objeto de contexto `ctx`,
- el objeto de actualización `ctx.update` dentro del contexto,
- los accesos directos al objeto de contexto, como `ctx.msg`, y
- los resultados de las llamadas a la API, cuando corresponda.

## Resumen del plugin

- Nombre: `hydrate`
- Fuente: <https://github.com/grammyjs/hydrate>
- Referencia: <https://deno.land/x/grammy_hydrate/mod.ts>
