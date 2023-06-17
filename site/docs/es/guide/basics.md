---
prev:
  link: ./getting-started
next:
  link: ./context
---

# Envío y recepción de mensajes

Tan pronto como inicies tu bot con `bot.start()`, grammY suministrará a tus oyentes los mensajes que los usuarios envíen a tu bot.
grammY también proporciona métodos para responder fácilmente a estos mensajes.

## Recepción de mensajes

La forma más fácil de escuchar los mensajes es a través de:

```ts
bot.on("message", async (ctx) => {
  const message = ctx.message; // el mensaje
});
```

Sin embargo, también hay otras opciones:

```ts
// Maneja comandos, como /start.
bot.command("start", async (ctx) => {/* ... */});

// Compara el texto del mensaje con una cadena o una expresión regular.
bot.hears(/echo *(.+)?/, async (ctx) => {/* ... */});
```

Puedes utilizar la función de autocompletar en tu editor de código para ver todas las opciones disponibles, o consultar [todos los métodos](https://deno.land/x/grammy/mod.ts?s=Composer) de la clase `Composer`.

> [Leer más](./filter-queries) sobre el filtrado de tipos de mensajes específicos con `bot.on()`.

## Envío de mensajes

Todos los métodos que los bots pueden utilizar (**[lista importante](https://core.telegram.org/bots/api#available-methods)**) están disponibles en el objeto `bot.api`.

```ts
// Enviar un mensaje de texto al usuario 12345.
await bot.api.sendMessage(12345, "Hi!");
// Opcionalmente, puede pasar un objeto options.
await bot.api.sendMessage(12345, "Hi!", {/* más opciones */});
// Inspecciona el objeto del mensaje enviado.
const message = await bot.api.sendMessage(12345, "Hi!");
console.log(message.message_id);

// Obtener información sobre el propio bot.
const me = await bot.api.getMe();

// etc
```

Cada método toma un objeto opcional de opciones de tipo `Other`, que le permite establecer otras opciones para sus llamadas a la API.
Estos objetos de opciones se corresponden exactamente con las opciones que puedes encontrar en la lista de métodos enlazada anteriormente.
También puedes utilizar el autocompletado en tu editor de código para ver todas las opciones disponibles, o consultar [todos los métodos](https://deno.land/x/grammy/mod.ts?s=Api) de la clase `Api`.
El resto de esta página muestra algunos ejemplos para esto.

También, revisa la [siguiente sección](./context) para aprender cómo el objeto context de un listener hace que el envío de mensajes sea un juego de niños.

## Enviando Mensajes con Respuesta

Puedes usar la función de respuesta de Telegram especificando el identificador del mensaje al que se va a responder usando `reply_to_message_id`.

```ts
bot.hears("ping", async (ctx) => {
  // `reply` es un alias de `sendMessage` en el mismo chat (ver siguiente sección).
  await ctx.reply("pong", {
    // `reply_to_message_id` especifica la función de respuesta real.
    reply_to_message_id: ctx.msg.message_id,
  });
});
```

> Tenga en cuenta que sólo el envío de un mensaje a través de `ctx.reply` no **significa que usted está respondiendo automáticamente a cualquier cosa.
> En su lugar, debes especificar `reply_to_message_id` para ello.
> La función `ctx.reply` es sólo un alias de `ctx.api.sendMessage`, ver la [siguiente sección](./context#acciones-disponibles).

## Envío de mensajes con formato

> Revisa la [sección sobre opciones de formato](https://core.telegram.org/bots/api#formatting-options) en la Referencia de la API de Telegram Bot escrita por el equipo de Telegram.

Puedes enviar mensajes con texto en **negrita** o _cursiva_, usar URLs, y más.
Hay dos formas de hacerlo, como se describe en la [sección sobre opciones de formato](https://core.telegram.org/bots/api#formatting-options), a saber, Markdown y HTML.

### Markdown

> Ver también <https://core.telegram.org/bots/api#markdownv2-style>

Envía tu mensaje con markdown en el texto, y especifica `parse_mode: "MarkdownV2"`.

```ts
await bot.api.sendMessage(
  12345,
  "*Hola\\!* Bienvenido a [grammY](https://grammy.dev)\\.",
  { parse_mode: "MarkdownV2" },
);
```

### HTML

> Véase también <https://core.telegram.org/bots/api#html-style>

Envía tu mensaje con elementos HTML en el texto, y especifica `parse_mode: "HTML"`.

```ts
await bot.api.sendMessage(
  12345,
  '<b>¡Hola!</b> <i>Bienvenido</i> to <a href="https://grammy.dev">grammY</a>.',
  { parse_mode: "HTML" },
);
```

## Envío de archivos

El manejo de archivos se explica con mayor profundidad en una [sección posterior] (./files#sending-files).

## Forzar respuesta

> Esto puede ser útil si tu bot está funcionando en [modo privacidad](https://core.telegram.org/bots/features#privacy-mode) en los chats de grupo.

Cuando envíes un mensaje, puedes hacer que el cliente de Telegram del usuario especifique automáticamente el mensaje como respuesta.
Esto significa que el usuario responderá al mensaje de tu bot automáticamente (a menos que elimine la respuesta manualmente).
Como resultado, tu bot recibirá el mensaje del usuario incluso cuando se ejecute en [modo de privacidad](https://core.telegram.org/bots/features#privacy-mode) en los chats de grupo.

Puedes forzar una respuesta así:

```ts
bot.command("start", async (ctx) => {
  await ctx.reply(
    "¡Hola! Sólo puedo leer los mensajes que me responden explícitamente!",
    {
      // Haz que los clientes de Telegram muestren automáticamente una interfaz de respuesta al usuario.
      reply_markup: { force_reply: true },
    },
  );
});
```
