---
prev: false
next: false
---

# Plugin para miembros del chat (`chat-members`)

Telegram no ofrece un método en la API del Bot para recuperar los miembros de un chat, tienes que seguirles la pista tú mismo.
Este plugin facilita el trabajo con objetos `ChatMember`, ofreciendo una forma cómoda de escuchar los cambios en forma de filtros personalizados, y almacenando y actualizando los objetos.

## Introducción

Trabajar con objetos `ChatMember` de la API de Telegram Bot a veces puede ser engorroso.
Hay varios estados diferentes que suelen ser intercambiables en la mayoría de las aplicaciones.
Además, el estado restringido es ambiguo porque puede representar tanto a miembros del grupo como a usuarios restringidos que no están en el grupo.

Este complemento simplifica el tratamiento de los miembros del chat al ofrecer filtros de escritura fuerte para las actualizaciones de los miembros del chat.

## Uso

### Filtros de miembros del chat

Puedes escuchar dos tipos de actualizaciones relacionadas con los miembros del chat usando un bot de Telegram: `chat_member` y `my_chat_member`.
Ambos especifican el estado antiguo y nuevo del usuario.

- Las actualizaciones de `my_chat_member` son siempre recibidas por tu bot para informarte sobre el estado del bot siendo actualizado en cualquier chat, así como cuando los usuarios bloquean al bot.
- Las actualizaciones de `chat_member` sólo se reciben si las incluyes explícitamente en la lista de actualizaciones permitidas, notifican sobre cualquier cambio de estado de los usuarios en los chats en los que el bot es **admin**.

En lugar de filtrar manualmente los estados antiguos y los nuevos, los filtros de miembros de chat lo hacen automáticamente por ti, permitiéndote actuar sobre cualquier tipo de transición que te interese.
Dentro del manejador, los tipos de `old_chat_member` y `new_chat_member` se reducen en consecuencia.

::: code-group

```ts [TypeScript]
import { API_CONSTANTS, Bot } from "grammy";
import { chatMemberFilter, myChatMemberFilter } from "@grammyjs/chat-members";

const bot = new Bot("");
const groups = bot.chatType(["group", "supergroup"]);

// SIN este plugin, para reaccionar cada vez que un usuario se une a un grupo, tienes que
// filtrar manualmente por estado, resultando en código propenso a errores y difícil de leer.
groups.on("chat_member").filter(
  (ctx) => {
    const { old_chat_member: oldMember, new_chat_member: newMember } =
      ctx.chatMember;
    return (
      (["kicked", "left"].includes(oldMember.status) ||
        (oldMember.status === "restricted" && !oldMember.is_member)) &&
      (["administrator", "creator", "member"].includes(newMember.status) ||
        (newMember.status === "restricted" && newMember.is_member))
    );
  },
  (ctx) => {
    const user = ctx.chatMember.new_chat_member.user;
    await ctx.reply(`Welcome ${user.first_name} to the group!`);
  },
);

// CON este plugin, el código se simplifica enormemente y tiene un menor riesgo de errores.
// El código de abajo escucha los mismos eventos pero es mucho más simple.
groups.filter(chatMemberFilter("out", "in"), async (ctx) => {
  const user = ctx.chatMember.new_chat_member.user;
  await ctx.reply(`Welcome ${user.first_name} to the group!`);
});

// Escucha las actualizaciones en las que el bot se añade a un grupo como usuario normal.
groups.filter(myChatMemberFilter("out", "regular"), async (ctx) => {
  await ctx.reply("Hello, thank you for adding me to the group!");
});

// Escucha las actualizaciones en las que el bot se añade a un grupo como administrador.
groups.filter(myChatMemberFilter("out", "admin"), async (ctx) => {
  await ctx.reply("Hello, thank you for adding me to the group as admin!");
});

// Escucha las actualizaciones en las que el bot es ascendido a admin.
groups.filter(myChatMemberFilter("regular", "admin"), async (ctx) => {
  await ctx.reply("I was promoted to admin!");
});

// Escucha las actualizaciones en las que el bot es degradado a usuario normal.
groups.filter(myChatMemberFilter("admin", "regular"), async (ctx) => {
  await ctx.reply("I am no longer admin");
});

bot.start({
  /// Asegúrate de incluir el tipo de actualización "chat_member" para que los manejadores anteriores funcionen.
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

```js [JavaScript]
import { API_CONSTANTS, Bot } from "grammy";
import { chatMemberFilter, myChatMemberFilter } from "@grammyjs/chat-members";

const bot = new Bot("");
const groups = bot.chatType(["group", "supergroup"]);

// SIN este plugin, para reaccionar cada vez que un usuario se une a un grupo, tienes que
// filtrar manualmente por estado, resultando en código propenso a errores y difícil de leer.
groups.on("chat_member").filter(
  (ctx) => {
    const { old_chat_member: oldMember, new_chat_member: newMember } =
      ctx.chatMember;
    return (
      (["kicked", "left"].includes(oldMember.status) ||
        (oldMember.status === "restricted" && !oldMember.is_member)) &&
      (["administrator", "creator", "member"].includes(newMember.status) ||
        (newMember.status === "restricted" && newMember.is_member))
    );
  },
  (ctx) => {
    const user = ctx.chatMember.new_chat_member.user;
    await ctx.reply(`Welcome ${user.first_name} to the group!`);
  },
);

// CON este plugin, el código se simplifica enormemente y tiene un menor riesgo de errores.
// El código de abajo escucha los mismos eventos pero es mucho más simple.
groups.filter(chatMemberFilter("out", "in"), async (ctx) => {
  const user = ctx.chatMember.new_chat_member.user;
  await ctx.reply(`Welcome ${user.first_name} to the group!`);
});

// Escucha las actualizaciones en las que el bot se añade a un grupo como usuario normal.
groups.filter(myChatMemberFilter("out", "regular"), async (ctx) => {
  await ctx.reply("Hello, thank you for adding me to the group!");
});

// Escucha las actualizaciones en las que el bot se añade a un grupo como administrador.
groups.filter(myChatMemberFilter("out", "admin"), async (ctx) => {
  await ctx.reply("Hello, thank you for adding me to the group as admin!");
});

// Escucha las actualizaciones en las que el bot es ascendido a admin.
groups.filter(myChatMemberFilter("regular", "admin"), async (ctx) => {
  await ctx.reply("I was promoted to admin!");
});

// Escucha las actualizaciones en las que el bot es degradado a usuario normal.
groups.filter(myChatMemberFilter("admin", "regular"), async (ctx) => {
  await ctx.reply("I am no longer admin");
});

bot.start({
  // Asegúrate de incluir el tipo de actualización "chat_member" para que los manejadores anteriores funcionen.
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

```ts [Deno]
import { API_CONSTANTS, Bot } from "https://deno.land/x/grammy/mod.ts";
import {
  chatMemberFilter,
  myChatMemberFilter,
} from "https://deno.land/x/grammy_chat_members/mod.ts";

const bot = new Bot("");
const groups = bot.chatType(["group", "supergroup"]);

// SIN este plugin, para reaccionar cada vez que un usuario se une a un grupo, tienes que
// filtrar manualmente por estado, resultando en código propenso a errores y difícil de leer.
groups.on("chat_member").filter(
  (ctx) => {
    const { old_chat_member: oldMember, new_chat_member: newMember } =
      ctx.chatMember;
    return (
      (["kicked", "left"].includes(oldMember.status) ||
        (oldMember.status === "restricted" && !oldMember.is_member)) &&
      (["administrator", "creator", "member"].includes(newMember.status) ||
        (newMember.status === "restricted" && newMember.is_member))
    );
  },
  (ctx) => {
    const user = ctx.chatMember.new_chat_member.user;
    await ctx.reply(`Welcome ${user.first_name} to the group!`);
  },
);

// CON este plugin, el código se simplifica enormemente y tiene un menor riesgo de errores.
// El código de abajo escucha los mismos eventos pero es mucho más simple.
groups.filter(chatMemberFilter("out", "in"), async (ctx) => {
  const user = ctx.chatMember.new_chat_member.user;
  await ctx.reply(`Welcome ${user.first_name} to the group!`);
});

// Escucha las actualizaciones en las que el bot se añade a un grupo como usuario normal.
groups.filter(myChatMemberFilter("out", "regular"), async (ctx) => {
  await ctx.reply("Hello, thank you for adding me to the group!");
});

// Escucha las actualizaciones en las que el bot se añade a un grupo como administrador.
groups.filter(myChatMemberFilter("out", "admin"), async (ctx) => {
  await ctx.reply("Hello, thank you for adding me to the group as admin!");
});

// Escucha las actualizaciones en las que el bot es ascendido a admin.
groups.filter(myChatMemberFilter("regular", "admin"), async (ctx) => {
  await ctx.reply("I was promoted to admin!");
});

// Escucha las actualizaciones en las que el bot es degradado a usuario normal.
groups.filter(myChatMemberFilter("admin", "regular"), async (ctx) => {
  await ctx.reply("I am no longer admin");
});

bot.start({
  // Asegúrate de incluir el tipo de actualización "chat_member" para que los manejadores anteriores funcionen.
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

:::

Los filtros incluyen los estados habituales (propietario, administrador, miembro, restringido, abandonado, expulsado) y algunos adicionales por comodidad:

- `restricted_in`: miembro restringido del chat
- `restricted_out`: no es miembro del chat, tiene restricciones
- `in`: miembro del chat (administrador, creador, miembro, restricted_in)
- `out`: no es miembro del chat (abandono, expulsado, restricted_out)
- `free`: miembro no restringido del chat (administrador, creador, miembro)
- `admin`: un administrador del chat (administrador, creador)
- `regular`: miembro no administrador del chat (miembro, restricted_in)

Para resumir, he aquí un diagrama que muestra a qué corresponde cada consulta:

![Diagrama que muestra los estados correspondientes a cada consulta.](/images/chat-members-statuses.svg)

Puede crear sus agrupaciones personalizadas de tipos de miembros de chat pasando una matriz en lugar de una cadena:

```typescript
groups.filter(
  chatMemberFilter(["restricted", "kicked"], ["free", "left"]),
  async (ctx) => {
    const from = ctx.from;
    const { status: oldStatus, user } = ctx.chatMember.old_chat_member;
    const lifted = oldStatus === "kicked" ? "ban" : "restrictions";
    await ctx.reply(
      `${from.first_name} levantó la ${lifted} de ${user.first_name}`,
    );
  },
);
```

#### Ejemplo de uso

La mejor manera de utilizar los filtros es elegir un conjunto de estados relevantes, por ejemplo `out`, `regular` y `admin`, y luego hacer una tabla de las transiciones entre ellos:

| ↱         | `out`                  | `regular`                 | `admin`              |
| --------- | ---------------------- | ------------------------- | -------------------- |
| `out`     | prohibición modificada | unirse                    | unión y promoción    |
| `regular` | salida                 | restricciones modificadas | promoción            |
| `admin`   | salida                 | degradado                 | permisos modificados |

Asigne una escucha a todas las transiciones que sean relevantes para su caso de uso.

Combina estos filtros con `bot.chatType` para escuchar sólo las transiciones de un tipo específico de chat.
Añade un middleware para escuchar todas las actualizaciones como una forma de realizar operaciones comunes (como actualizar tu base de datos) antes de entregar el control a un manejador específico.

```typescript
const groups = bot.chatType(["group", "supergroup"]);

groups.on("chat_member", async (ctx, next) => {
  // ejecutado en todas las actualizaciones de tipo chat_member
  const {
    old_chat_member: { status: oldStatus },
    new_chat_member: { user, status },
    from,
    chat,
  } = ctx.chatMember;
  console.log(
    `In group ${chat.id} user ${from.id} changed status of ${user.id}:`,
    `${oldStatus} -> ${status}`,
  );

  // actualice aquí los datos de la base de datos

  await next();
});

// controladores específicos

groups.filter(chatMemberFilter("out", "in"), async (ctx, next) => {
  const { new_chat_member: { user } } = ctx.chatMember;
  await ctx.reply(`Welcome ${user.first_name}!`);
});
```

### Utilidad de comprobación de estado

La función de utilidad `chatMemberIs` puede ser útil siempre que desee utilizar la lógica de filtrado dentro de un manejador.
Toma como entrada cualquiera de los estados regulares y personalizados (o una matriz de ellos), y reduce el tipo de la variable pasada.

```ts
bot.callbackQuery("foo", async (ctx) => {
  const chatMember = await ctx.getChatMember(ctx.from.id);

  if (!chatMemberIs(chatMember, "free")) {
    chatMember.status; // "restricted" | "left" | "kicked"
    await ctx.answerCallbackQuery({
      show_alert: true,
      text: "You don't have permission to do this!",
    });
    return;
  }

  chatMember.status; // "creator" | "administrator" | "member"
  await ctx.answerCallbackQuery("bar");
});
```

### Hidratación de objetos miembros del chat

Puede mejorar aún más su experiencia de desarrollo utilizando la hidratación [API transformer](../advanced/transformers).
Este transformador se aplicará a las llamadas a `getChatMember` y `getChatAdministrators`, añadiendo un práctico método `is` a los objetos `ChatMember` devueltos.

```ts
type MyContext = HydrateChatMemberFlavor<Context>;
type MyApi = HydrateChatMemberApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");

bot.api.config.use(hydrateChatMember());

bot.command("ban", async (ctx) => {
  const author = await ctx.getAuthor();

  if (!author.is("admin")) {
    author.status; // "member" | "restricted" | "left" | "kicked"
    await ctx.reply("You don't have permission to do this");
    return;
  }

  author.status; // "creator" | "administrator"
  // ...
});
```

### Almacenamiento de miembros del chat

Puedes usar un [adaptador de almacenamiento](./session#adaptadores-de-almacenamiento-conocidos) válido de grammY o una instancia de cualquier clase que implemente la interfaz [`StorageAdapter`](/ref/core/storageadapter).

Por favor, ten en cuenta que según la [documentación oficial de Telegram](https://core.telegram.org/bots/api#getupdates), tu bot necesita especificar la actualización `chat_member` en el array `allowed_updates`, como se muestra en el ejemplo de abajo.
Esto significa que también necesitas especificar cualquier otro evento que quieras recibir.

::: code-group

```ts [TypeScript]
import { API_CONSTANTS, Bot, type Context, MemorySessionStorage } from "grammy";
import { type ChatMember } from "grammy/types";
import { chatMembers, type ChatMembersFlavor } from "@grammyjs/chat-members";

type MyContext = Context & ChatMembersFlavor;

const adapter = new MemorySessionStorage<ChatMember>();

const bot = new Bot<MyContext>("<tu token de bot>");

bot.use(chatMembers(adapter));

bot.start({
  // Asegúrese de especificar los tipos de actualización deseados.
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

```js [JavaScript]
import { API_CONSTANTS, Bot, MemorySessionStorage } from "grammy";
import { chatMembers } from "@grammyjs/chat-members";

const adapter = new MemorySessionStorage();

const bot = new Bot("");

bot.use(chatMembers(adapter));

bot.start({
  // Asegúrese de especificar los tipos de actualización deseados.
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

```ts [Deno]
import {
  API_CONSTANTS,
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
  // Asegúrese de especificar los tipos de actualización deseados.
  allowed_updates: [...API_CONSTANTS.DEFAULT_UPDATE_TYPES, "chat_member"],
});
```

:::

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
- [Fuente](https://github.com/grammyjs/chat-members)
- [Referencia](/ref/chat-members/)
