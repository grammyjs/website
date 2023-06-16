# Plugin para miembros del chat (`chat-members`)

Almacena automáticamente información sobre los usuarios de un chat y recupérala fácilmente.
Rastrea miembros de grupos y canales, y enlístalos.

## Introducción

En muchas situaciones, es necesario que un bot tenga información sobre todos los usuarios de un determinado chat.
Actualmente, sin embargo, la API de Telegram Bot no expone ningún método que nos permita recuperar esta información.

Este plugin viene al rescate: escucha automáticamente los eventos `chat_member` y almacena todos los objetos `ChatMember`.

## Uso

### Almacenamiento de miembros del chat

Puedes usar un [adaptador de almacenamiento](./session.md#adaptadores-de-almacenamiento-conocidos) válido de grammY o una instancia de cualquier clase que implemente la interfaz [`StorageAdapter`](https://deno.land/x/grammy/mod.ts?s=StorageAdapter).

Por favor, ten en cuenta que según la [documentación oficial de Telegram](https://core.telegram.org/bots/api#getupdates), tu bot necesita especificar la actualización `chat_member` en el array `allowed_updates`, como se muestra en el ejemplo de abajo.
Esto significa que también necesitas especificar cualquier otro evento que quieras recibir.

::::code-group
:::code-group-item TypeScript

```ts
import { Bot, type Context, MemorySessionStorage } from "grammy";
import { type ChatMember } from "grammy/types";
import { chatMembers, type ChatMembersFlavor } from "@grammyjs/chat-members";

type MyContext = Context & ChatMembersFlavor;

const adapter = new MemorySessionStorage<ChatMember>();

const bot = new Bot<MyContext>("<tu token de bot>");

bot.use(chatMembers(adapter));

bot.start({
  // Asegúrese de especificar los tipos de actualización deseados
  allowed_updates: ["chat_member", "message"],
});
```

:::

:::code-group-item JavaScript

```js
import { Bot, MemorySessionStorage } from "grammy";
import { chatMembers } from "@grammyjs/chat-members";

const adapter = new MemorySessionStorage();

const bot = new Bot("");

bot.use(chatMembers(adapter));

bot.start({
  // Asegúrese de especificar los tipos de actualización deseados
  allowed_updates: ["chat_member", "message"],
});
```

:::

:::code-group-item Deno

```ts
import {
  Bot,
  type Context,
  MemorySessionStorage,
} from "https://deno.land/x/grammy/mod.ts";
import { type ChatMember } from "https://deno.land/x/grammy/types.ts";
import {
  chatMembers,
  type ChatMembersFlavor,
} from "https://deno.land/x/grammy_chat_members/mod.ts";

type MyContext = Context & ChatMembersFlavor;

const adapter = new MemorySessionStorage<ChatMember>();

const bot = new Bot<MyContext>("<tu token de bot>");

bot.use(chatMembers(adapter));

bot.start({
  // Asegúrese de especificar los tipos de actualización deseados
  allowed_updates: ["chat_member", "message"],
});
```

:::

::::

### Lectura de Miembros del Chat

Este complemento también añade una nueva función `ctx.chatMembers.getChatMember` que buscará en el almacenamiento, información sobre un miembro del chat antes de solicitarla a Telegram.
Si el miembro del chat existe en el almacenamiento, será devuelto.
Si no, se llamará a `ctx.api.getChatMember` y el resultado se guardará en el almacenamiento, haciendo que las llamadas posteriores sean más rápidas y eliminando la necesidad de volver a llamar a Telegram para ese usuario y chat en el futuro.

Aquí tienes un ejemplo:

```ts
bot.on("message", async (ctx) => {
  const chatMember = await ctx.chatMembers.getChatMember();

  return ctx.reply(
    `Hola, ${chatMember.user.first_name}! Veo que eres un ${chatMember.status} de este chat!`,
  );
});
```

Esta función acepta los siguientes parámetros opcionales:

- `chatId`:
  - Por defecto: `ctx.chat.id`
  - El identificador del chat
- `userId`:
  - Por defecto: `ctx.from.id`
  - El identificador del chat

Puedes pasarlos así:

```ts
bot.on("message", async (ctx) => {
  const chatMember = await ctx.chatMembers.getChatMember(
    ctx.chat.id,
    ctx.from.id,
  );
  return ctx.reply(
    `Hola, ${chatMember.user.first_name}! Veo que eres un ${chatMember.status} de este chat!`,
  );
});
```

Tenga en cuenta que, si no proporciona un identificador de chat y no hay ninguna propiedad `chat` dentro del contexto (por ejemplo, en las actualizaciones de consulta en línea), se producirá un error.
Lo mismo ocurrirá si no hay `ctx.from` en el contexto.

## Almacenamiento agresivo

La opción de configuración `enableAggressiveStorage` instalará un middleware para almacenar en caché los miembros del chat sin depender del evento `chat_member`.
Para cada actualización, el middleware comprueba si `ctx.chat` y `ctx.from` existen.
Si ambos existen, entonces procede a llamar a `ctx.chatMembers.getChatMember` para añadir la información del miembro del chat al almacenamiento en caso de que no exista.

Ten en cuenta que esto significa que se llamará al almacenamiento para **cada actualización**, lo que puede ser mucho, dependiendo de cuántas actualizaciones reciba tu bot.
Esto puede afectar drásticamente al rendimiento de tu bot.
Utilízalo sólo si _realmente_ sabes lo que estás haciendo y estás de acuerdo con los riesgos y consecuencias.

## Resumen del plugin

- Nombre: `chat-members`
- Fuente: <https://github.com/grammyjs/chat-members>
- Referencia: <https://deno.land/x/grammy_chat_members/mod.ts>
