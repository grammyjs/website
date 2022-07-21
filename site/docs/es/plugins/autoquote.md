# Siempre respondiendo a los mensajes

A veces, especialmente para los bots que están destinados a ser utilizados en grupos, siempre es necesario enviar mensajes como respuesta (o cita) al mensaje que inició la interacción. Por lo general, la forma de hacerlo es agregar manualmente `reply_to_message_id` a los parámetros del método que envía el mensaje (`sendText` / `reply`, `sendPhoto` / `replyWithPhoto`). Sin embargo, si está haciendo esto para cada mensaje, puede volverse un poco complicado y agotador.

Este complemento establece el valor del parámetro `reply_to_message_id` en `ctx.msg.message_id` para cada método `send` (excepto `sendChatAction`, que no admite este parámetro), por lo que hace que cada mensaje sea una respuesta al mensaje que activó esa actualización.

## Uso

### Para una sola ruta

Use esto si desea que todos los mensajes enviados desde un contexto específico (como un comando específico)

```ts
import { Bot } from "grammy";
import { addReplyParam } from "@roziscoding/grammy-autoquote";
// import { addReplyParam } from 'https://deno.land/x/grammy_autoquote/mod.ts'

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  ctx.reply("Demo command!"); // This will quote the user's message
});

bot.start();
```

### Uso para cada ruta

Úselo si desea absolutamente todos los mensajes posibles enviados desde su bot para citar el mensaje desencadenante.

```ts
import { Bot } from "grammy";
import { autoQuote } from "@roziscoding/grammy-autoquote";
// import { autoQuote } from 'https://deno.land/x/grammy_autoquote/mod.ts'

const bot = new Bot("");

bot.use(autoQuote);

bot.command("demo", async (ctx) => {
  ctx.reply("Demo command!"); // This will quote the user's message
});

bot.command("hello", async (ctx) => {
  ctx.reply("Hi there :)"); // Also quotes the user's message
});

bot.start();
```

## Resumen del complemento

- Name: Autoquote
- Source: <https://github.com/roziscoding/grammy-autoquote>
- Reference: <https://doc.deno.land/https://deno.land/x/grammy_autoquote/mod.ts>
