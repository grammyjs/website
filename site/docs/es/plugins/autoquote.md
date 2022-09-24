# Responder siempre a los mensajes

<TagGroup>
  <Tag type="thirdparty" text="DE TERCEROS"/>
  <Tag type="deno"/>
  <Tag type="nodejs"/>
</TagGroup>

A veces es necesario enviar siempre los mensajes como respuestas, especialmente para los bots que están destinados a ser utilizados en grupos.
Normalmente hacemos esto añadiendo el parámetro `reply_to_message_id` a los métodos que envían el mensaje: `sendText`, `reply`, `sendPhoto`, `replyWithPhoto` y otros.
Sin embargo, si estás haciendo esto para cada mensaje, puede ser un desastre y aburrido.

Este plugin establece el parámetro `reply_to_message_id` a `ctx.msg.message_id` para todos los métodos `reply*` y `send*` que lo soportan para hacer que cada mensaje sea una respuesta al mensaje que lo activó.

## Uso

### En Rutas Específicas

Si quieres que todos los mensajes se envíen dentro de un contexto específico (como un comando específico), puedes aplicar el plugin específicamente a ellos:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";
import { addReplyParam } from "@roziscoding/grammy-autoquote";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("¡Comando demo!"); // esto va a citar el mensaje del usuario
});

bot.start();
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");
const { addReplyParam } = require("@roziscoding/grammy-autoquote");

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("¡Comando demo!"); // esto va a citar el mensaje del usuario
});

bot.start();
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { addReplyParam } from "https://deno.land/x/grammy_autoquote/mod.ts";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  ctx.api.config.use(addReplyParam(ctx));
  await ctx.reply("¡Comando demo!"); // esto va a citar el mensaje del usuario
});

bot.start();
```

</CodeGroupItem>
</CodeGroup>

### Para todas las rutas

Si quieres que todos los mensajes enviados respondan a los mensajes que los desencadenaron, puedes aplicar el plugin de esta manera:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";
import { autoQuote } from "@roziscoding/grammy-autoquote";

const bot = new Bot("");

bot.use(autoQuote);

bot.command("demo", async (ctx) => {
  await ctx.reply("¡Comando demo!"); // esto va a citar el mensaje del usuario
});

bot.command("hola", async (ctx) => {
  await ctx.reply("Hola :)"); // esto también cita el mensaje del usuario
});

bot.start();
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");
const { autoQuote } = require("@roziscoding/grammy-autoquote");

const bot = new Bot("");

bot.use(autoQuote);

bot.command("demo", async (ctx) => {
  await ctx.reply("¡Comando demo!"); // esto va a citar el mensaje del usuario
});

bot.command("hola", async (ctx) => {
  await ctx.reply("Hola :)"); // esto también cita el mensaje del usuario
});

bot.start();
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { autoQuote } from "https://deno.land/x/grammy_autoquote/mod.ts";

const bot = new Bot("");

bot.use(autoQuote);

bot.command("demo", async (ctx) => {
  await ctx.reply("¡Comando demo!"); // esto va a citar el mensaje del usuario
});

bot.command("hola", async (ctx) => {
  await ctx.reply("Hola :)"); // esto también cita el mensaje del usuario
});

bot.start();
```

</CodeGroupItem>
</CodeGroup>

## Resumen del plugin

- Nombre: Autoquote
- Fuente: <https://github.com/roziscoding/grammy-autoquote>
- Referencia de la API: <https://doc.deno.land/https://deno.land/x/grammy_autoquote/mod.ts>
