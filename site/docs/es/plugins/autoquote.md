---
prev: false
next: false
---

# Responder siempre a los mensajes

A veces es necesario enviar siempre los mensajes como respuestas, especialmente para los bots que están destinados a ser utilizados en grupos.
Normalmente lo hacemos añadiendo `reply_parameters` a los métodos que envían el mensaje: `sendText`, `reply`, `sendPhoto`, `replyWithPhoto` y etc.
Sin embargo, si estás haciendo esto para cada mensaje, puede ser un desastre y aburrido.

Este plugin establece las propiedades de `reply_parameters` para todos los métodos `reply*` y `send*` que lo soportan para hacer que cada mensaje sea una respuesta al mensaje y chat que lo desencadenó.

Puedes pasar un objeto options con la propiedad `allowSendingWithoutReply` a las funciones `addReplyParam` y `autoQuote`, lo que permitirá a tu bot enviar mensajes incluso si el mensaje al que se está respondiendo ya no existe.

## Uso

### En un contexto específico

Si quieres que todos los mensajes se envíen dentro de un contexto específico (como un comando específico), puedes aplicar el plugin específicamente a ellos:

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { addReplyParam } from "@roziscoding/grammy-autoquote";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("¡Comando demo!"); // esto va a citar el mensaje del usuario
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { addReplyParam } = require("@roziscoding/grammy-autoquote");

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("¡Comando demo!"); // esto va a citar el mensaje del usuario
});

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { addReplyParam } from "https://deno.land/x/grammy_autoquote/mod.ts";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("¡Comando demo!"); // esto va a citar el mensaje del usuario
});

bot.start();
```

:::

### En todos los contextos

Si quieres que todos los mensajes enviados respondan a los mensajes que los desencadenaron, puedes aplicar el plugin de esta manera:

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { autoQuote } from "@roziscoding/grammy-autoquote";

const bot = new Bot("");

bot.use(autoQuote());

bot.command("demo", async (ctx) => {
  await ctx.reply("¡Comando demo!"); // esto va a citar el mensaje del usuario
});

bot.command("hola", async (ctx) => {
  await ctx.reply("Hola :)"); // esto también cita el mensaje del usuario
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { autoQuote } = require("@roziscoding/grammy-autoquote");

const bot = new Bot("");

bot.use(autoQuote());

bot.command("demo", async (ctx) => {
  await ctx.reply("¡Comando demo!"); // esto va a citar el mensaje del usuario
});

bot.command("hola", async (ctx) => {
  await ctx.reply("Hola :)"); // esto también cita el mensaje del usuario
});

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { autoQuote } from "https://deno.land/x/grammy_autoquote/mod.ts";

const bot = new Bot("");

bot.use(autoQuote());

bot.command("demo", async (ctx) => {
  await ctx.reply("¡Comando demo!"); // esto va a citar el mensaje del usuario
});

bot.command("hola", async (ctx) => {
  await ctx.reply("Hola :)"); // esto también cita el mensaje del usuario
});

bot.start();
```

:::

## Resumen del plugin

- Nombre: Autoquote
- [Fuente](https://github.com/roziscoding/grammy-autoquote)
