---
prev: false
next: false
---

# Borradores de mensajes en tiempo real (`stream`)

Este complemento te permite enviar mensajes de texto largos a Telegram.
Cualquier
[iterador](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)
de fragmentos de texto se puede enviar directamente a cualquier chat privado.

Por ejemplo, puedes hacer que la salida del LLM
[aparezca gradualmente](#integración-de-llm) mientras se genera la respuesta.

## Inicio rápido

El complemento instala
[`ctx.replyWithStream`](/ref/stream/streamcontextextension#replywithstream) en
el [objeto de contexto](../guide/context).

> La transmisión de mensajes realiza numerosas llamadas a la API a gran
> velocidad. Se recomienda encarecidamente utilizar el
> [complemento de reintentos automáticos](./auto-retry) junto con el complemento
> de transmisión.

::: code-group

```ts [TypeScript]
import { Bot, type Context } from "grammy";
import { autoRetry } from "@grammyjs/auto-retry";
import { stream, type StreamFlavor } from "@grammyjs/stream";

type MyContext = StreamFlavor<Context>;
const bot = new Bot<MyContext>("");

bot.api.config.use(autoRetry()); // ¡Muy recomendable!
bot.use(stream());

async function* slowText() {
  // emular la generación lenta de texto
  yield "This is som";
  await new Promise((r) => setTimeout(r, 2000));
  yield "e slowly gen";
  await new Promise((r) => setTimeout(r, 2000));
  yield "erated text";
}

// Telegram solo admite la transmisión en directo en los chats privados.
bot.chatType("private")
  .command("stream", async (ctx) => {
    // ¡Transmite el mensaje!
    await ctx.replyWithStream(slowText());
  });

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { autoRetry } = require("@grammyjs/auto-retry");
const { stream } = require("@grammyjs/stream");

const bot = new Bot("");

bot.api.config.use(autoRetry()); // ¡Muy recomendable!
bot.use(stream());

async function* slowText() {
  // emular la generación lenta de texto
  yield "This is som";
  await new Promise((r) => setTimeout(r, 2000));
  yield "e slowly gen";
  await new Promise((r) => setTimeout(r, 2000));
  yield "erated text";
}

// Telegram solo admite la transmisión en directo en los chats privados.
bot.chatType("private")
  .command("stream", async (ctx) => {
    // ¡Transmite el mensaje!
    await ctx.replyWithStream(slowText());
  });

bot.start();
```

```ts [Deno]
import { Bot, type Context } from "https://deno.land/x/grammy/mod.ts";
import { autoRetry } from "https://deno.land/x/grammy_auto_retry/mod.ts";
import {
  stream,
  type StreamFlavor,
} from "https://deno.land/x/grammy_stream/mod.ts";

type MyContext = StreamFlavor<Context>;
const bot = new Bot<MyContext>("");

bot.api.config.use(autoRetry()); // ¡Muy recomendable!
bot.use(stream());

async function* slowText() {
  // emular la generación lenta de texto
  yield "This is som";
  await new Promise((r) => setTimeout(r, 2000));
  yield "e slowly gen";
  await new Promise((r) => setTimeout(r, 2000));
  yield "erated text";
}

// Telegram solo admite la transmisión en directo en los chats privados.
bot.chatType("private")
  .command("stream", async (ctx) => {
    // ¡Transmite el mensaje!
    await ctx.replyWithStream(slowText());
  });

bot.start();
```

:::

¡Eso es todo!

## Integración de LLM

La mayoría de las integraciones de
[LLM](https://en.wikipedia.org/wiki/Large_language_model) te permiten transmitir
el resultado a medida que se genera. Puedes utilizar este complemento para que
el resultado del LLM aparezca gradualmente en cualquier chat privado.

Por ejemplo, si utilizas el [AI SDK](https://ai-sdk.dev), tu configuración
podría tener este aspecto:

::: code-group

```ts [Node.js]
import { streamText } from "ai";
import { google } from "@ai-sdk/google";

bot.chatType("private")
  .command("credits", async (ctx) => {
    // Envía la solicitud al LLM:
    const { textStream } = streamText({
      model: google("gemini-2.5-flash"),
      prompt: "How cool are grammY bots?",
    });

    // Transmite respuestas automáticamente con grammY:
    await ctx.replyWithStream(textStream);
  });
```

```ts [Deno]
import { streamText } from "npm:ai";
import { google } from "npm:@ai-sdk/google";

bot.chatType("private")
  .command("credits", async (ctx) => {
    // Envía la solicitud al LLM:
    const { textStream } = streamText({
      model: google("gemini-2.5-flash"),
      prompt: "How cool are grammY bots?",
    });

    // Transmite respuestas automáticamente con grammY:
    await ctx.replyWithStream(textStream);
  });
```

:::

Asegúrate de sustituir `gemini-2.5-flash` por el último modelo disponible.

## Transmisión de mensajes formateados

Esto es _mucho_ más difícil de lo que crees.

1. Los LLM generan Markdown _probabilístico_. A menudo es correcto, pero a veces
   no lo es. No sigue ningún estándar específico. En concreto, **no siempre
   generan Markdown compatible con Telegram**. Esto significa que intentar
   enviarlo o transmitirlo a Telegram fallará.
2. Los LLM generan entidades Markdown _parciales_. Aunque el resultado se ajuste
   perfectamente a la especificación
   [MarkdownV2](https://core.telegram.org/bots/api#markdownv2-style) de
   Telegram, **los fragmentos individuales del resultado pueden estar rotos**.
   Si abres una sección de texto en cursiva pero solo la cierras en el fragmento
   siguiente, la transmisión se bloqueará y no se enviará ningún mensaje.
3. Los LLM a veces generan formatos que no son compatibles con Telegram (incluso
   si les indicas que no lo hagan). Por ejemplo, a la mayoría de los LLM les
   _encantan_ **las tablas, las listas con viñetas y las enumeraciones**. Los
   clientes de Telegram no pueden representar estos elementos.

> Telegram también admite el formato
> [HTML](https://core.telegram.org/bots/api#html-style). Esto plantea
> exactamente los mismos problemas que Markdown. Además, la salida en HTML
> consume muchos más tokens, lo cual supone un gasto innecesario.

Entonces... ¿y ahora qué?

Por desgracia, no hay una solución ideal. Sin embargo, aquí van algunas ideas:

- Indicarle a tu LLM que genere texto sin formato
- Confiar en que tu LLM no cometa errores al generar Markdown y, si falla,
  volver a intentarlo simplemente con texto sin formato
- Utilizar formato HTML y esperar que esto mejore un poco las cosas
- Escribir una función [transformadora](../advanced/transformers) personalizada
  que vuelva a intentar automáticamente las solicitudes fallidas
- Utiliza un analizador de Markdown en streaming y crea tus propias matrices
  [`MessageEntity`](https://core.telegram.org/bots/api#messageentity) para dar
  formato a cada [`MessageDraftPiece`](/ref/stream/messagedraftpiece)
- Transmite Markdown en texto sin formato y luego utiliza un analizador de
  Markdown normal para aplicar el formato solo después de que la transmisión
  haya finalizado y se hayan enviado todos los mensajes
- Da con una solución genial en la que nadie más haya pensado antes y
  cuéntanosla en el [chat grupal](https://t.me/grammyjs)

## Resumen del complemento

- Nombre: `stream`
- [Fuente](https://github.com/grammyjs/stream)
- [Referencia](/ref/stream/)
