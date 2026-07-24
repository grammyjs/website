---
prev: false
next: false
---

# Borradores de mensajes en tiempo real (`stream`)

Este complemento te permite enviar mensajes de texto largos a Telegram.
Cualquier [iterador](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) de fragmentos de texto se puede enviar directamente a cualquier chat privado.

Por ejemplo, puedes hacer que la salida del LLM [aparezca gradualmente](#integracion-de-llm) mientras se genera la respuesta.

## Inicio rápido

El complemento instala tres métodos en el [objeto de contexto](../guide/context):

- [`ctx.replyWithStream`](/ref/stream/streamcontextextension#replywithstream): transmisión de mensajes sin formato
- [`ctx.replyWithMarkdownStream`](/ref/stream/streamcontextextension#replywithmarkdownstream): transmisión de mensajes en formato Markdown (**recomendado**)
- [`ctx.replyWithHtmlStream`](/ref/stream/streamcontextextension#replywithhtmlstream): transmisión de mensajes en HTML

La transmisión de texto sin formato (primera opción) envía mensajes de texto normales.
Los otros dos métodos utilizan los [mensajes enriquecidos](https://core.telegram.org/bots/api#rich-messages) de Telegram y se recomiendan para la mayoría de los casos.

> El módulo de streaming de mensajes realiza numerosas llamadas a la API a gran velocidad.
> Se recomienda encarecidamente utilizar el [complemento de reintentos automáticos](./auto-retry) junto con el complemento de streaming.

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
import { Bot, type Context } from "npm:grammy";
import { autoRetry } from "npm:@grammyjs/auto_retry";
import {
  stream,
  type StreamFlavor,
} from "npm:@grammyjs/stream";

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

La mayoría de las integraciones de [LLM](https://en.wikipedia.org/wiki/Large_language_model) te permiten transmitir el resultado a medida que se genera. Puedes utilizar este complemento para que el resultado del LLM aparezca gradualmente en cualquier chat privado.

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
    await ctx.replyWithMarkdownStream(textStream);
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
    await ctx.replyWithMarkdownStream(textStream);
  });
```

:::

Asegúrate de sustituir `gemini-2.5-flash` por el último modelo disponible.

## Resumen del complemento

- Nombre: `stream`
- [Fuente](https://github.com/grammyjs/stream)
- [Referencia](/ref/stream/)
