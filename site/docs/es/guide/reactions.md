# Reacciones

Los bots pueden trabajar con reacciones de mensajes.
Hay dos tipos de reacciones: reacciones emoji y reacciones emoji personalizadas.

## Reaccionando a los mensajes

Los bots pueden añadir una única reacción emoji a un mensaje.

En los mismos casos, los bots también pueden reaccionar con emoji personalizados (aunque los bots no pueden tener [Telegram Premium](https://telegram.org/faq_premium?setln=es)).
Cuando un usuario Premium añade una reacción emoji personalizada a un mensaje, los bots pueden añadir posteriormente la misma reacción a este mensaje.
Además, si un administrador de chat permite explícitamente el uso de emoji personalizados, también pueden ser utilizados por los bots en ese chat.

Así es como puedes reaccionar a los mensajes.

```ts
// Utilice `ctx.react` para las reacciones sobre el mensaje actual.
bot.command("start", (ctx) => ctx.react("😍"));
bot.on("message", (ctx) => ctx.react("👍"));

// Utilice `ctx.api.setMessageReaction` para reacciones en otro lugar.
bot.on("message", async (ctx) => {
  await ctx.api.setMessageReaction(chat_id, message_id, "🎉");
});

// Utiliza `bot.api.setMessageReaction` fuera de los manejadores.
await bot.api.setMessageReaction(chat_id, message_id, "💯");
```

Como de costumbre, TypeScript proporcionará autocompletado para los emojis que puedes usar.
La lista de reacciones emoji disponibles se puede encontrar [aquí](https://core.telegram.org/bots/api#reactiontypeemoji).

::: tip Plugin Emoji
Puede ser feo programar con emoji.
No todos los sistemas pueden mostrar su código fuente correctamente.
Además, es molesto copiarlos de diferentes lugares todo el tiempo.

¡Deja que el [plugin emoji](../plugins/emoji#datos-utiles-para-reacciones) te ayude!
:::

Ahora que ya sabes cómo puede reaccionar tu bot a los mensajes, veamos cómo podemos manejar las reacciones de tus usuarios.

## Recepción de actualizaciones sobre reacciones

Existen varias formas de gestionar las actualizaciones sobre las reacciones.
En los chats privados y de grupo, tu bot recibirá una actualización `message_reaction` si un usuario cambia su reacción a un mensaje.
En los canales (o en las publicaciones de canal reenviadas automáticamente en los grupos), tu bot recibirá una actualización `message_reaction_count` que sólo muestra el recuento total de reacciones, pero sin revelar quién ha reaccionado.

Ambos tipos de reacciones deben estar activados para poder recibirlas.
Por ejemplo, con el polling incorporado, puedes habilitarlas así:

```ts
bot.start({
  allowed_updates: ["message", "message_reaction", "message_reaction_count"],
});
```

::: tip Habilitar todos los tipos de actualización
Puede que quieras importar `API_CONSTANTS` de grammY y luego especificar

```ts
allowed_updates: API_CONSTANTS.ALL_UPDATE_TYPES;
```

para recibir todas las actualizaciones.
Asegúrese de consultar la [referencia API](/ref/core/apiconstants#all-update-types).
:::

[grammY runner](../plugins/runner#opciones-avanzadas) y `setWebhook` tienen formas similares de especificar `allowed_updates`.

Ahora que tu bot puede recibir actualizaciones de reacción, ¡vamos a ver cómo puede manejarlas!

### Manejo de nuevas reacciones

Es muy sencillo manejar reacciones recién añadidas.
grammY tiene un soporte especial para esto a través de `bot.reaction`.

```ts
bot.reaction("🎉", (ctx) => ctx.reply("whoop whoop"));
bot.reaction(["👍", "👎"], (ctx) => ctx.reply("Nice thumb"));
```

Estos controladores se activarán cada vez que un usuario añada una nueva reacción emoji a un mensaje.

Naturalmente, si tu bot gestiona reacciones emoji personalizadas de usuarios premium, también puedes escucharlas.

```ts
bot.reaction(
  { type: "custom_emoji", custom_emoji_id: "identifier-string" },
  async (ctx) => {/* ... */},
);
```

Esto requiere que conozcas de antemano el identificador del emoji personalizado.

### Manejo de cambios arbitrarios en las reacciones

Aunque esto no es visible en la interfaz de usuario de ningún cliente oficial de Telegram, los usuarios pueden cambiar varias reacciones a la vez.
Esta es la razón por la que las actualizaciones de reacciones te dan dos listas, las reacciones antiguas y las nuevas.
Esto permite a tu bot manejar cambios arbitrarios en la lista de reacciones.

```ts
bot.on("message_reaction", async (ctx) => {
  const reaction = ctx.messageReaction;
  // Sólo recibimos el identificador del mensaje, no su contenido.
  const message = reaction.message_id;
  // La diferencia entre estas dos listas describe el cambio.
  const old = reaction.old_reaction; // anterior
  const now = reaction.new_reaction; // actual
});
```

grammY le permite filtrar aún más las actualizaciones con [consultas de filtro especiales](./filter-queries) para el tipo de reacción.

```ts
// Actualizaciones en las que la reacción actual contiene al menos un emoji.
bot.on("message_reaction:new_reaction:emoji", (ctx) => {/* ... */});
// Actualizaciones en las que la reacción anterior contenía al menos un emoji personalizado.
bot.on("message_reaction:old_reaction:custom_emoji", (ctx) => {/* ... */});
```

Mientras que estas dos matrices de [objetos `ReactionType`](https://core.telegram.org/bots/api#reactiontype) técnicamente te dan toda la información que necesitas para manejar las actualizaciones de las reacciones, todavía pueden ser un poco engorrosas para trabajar.
Por eso grammY puede calcular cosas más útiles a partir de la actualización.

### Inspeccionar Cómo Cambiaron las Reacciones

Hay un [atajo de contexto](./context#atajos) llamado `ctx.reactions` que te permite ver cómo cambió exactamente una reacción.

Así es como puedes usar `ctx.reactions` para detectar si un usuario elimina su voto positivo (pero lo perdona si aún mantiene su reacción de ok).

```ts
bot.on("message_reaction", async (ctx) => {
  const { emoji, emojiAdded, emojiRemoved } = ctx.reactions();
  if (emojiRemoved.includes("👍")) {
    // ¡Voto positivo fue eliminado! Inaceptable.
    if (emoji.includes("👌")) {
      // Aún así está bien, no castigar
      await ctx.reply("Te perdono");
    } else {
      // ¿Cómo se atreven?
      await ctx.banAuthor();
    }
  }
});
```

Hay cuatro matrices devueltas por `ctx.reaction`: emoji añadido, emoji eliminado, emoji conservado, y una lista que te dice cuál es el resultado del cambio.
Además, hay cuatro arrays más para emojis personalizados con información similar.

```ts
const {
  /** Emoji actualmente presente en la reacción de este usuario */
  emoji,
  /** Emoji recién añadido a la reacción de este usuario */
  emojiAdded,
  /** Emoji no cambiado por la actualización de la reacción de este usuario */
  emojiKept,
  /** Emoji eliminado de la reacción de este usuario */
  emojiRemoved,
  /** Emoji personalizado actualmente presente en la reacción de este usuario */
  customEmoji,
  /** Emoji personalizado recién añadido a la reacción de este usuario */
  customEmojiAdded,
  /** Emoji personalizado no modificado por la actualización de la reacción de este usuario */
  customEmojiKept,
  /** Emoji personalizado eliminado de la reacción de este usuario */
  customEmojiRemoved,
} = ctx.reactions();
```

Se ha hablado mucho sobre la gestión de las actualizaciones en los chats privados y en los chats de grupo.
Veamos los canales.

### Manejo de las Actualizaciones del Recuento de Reacciones

En los chats privados, grupos y supergrupos, se sabe quién reacciona a cada mensaje.
Sin embargo, para los mensajes del canal, sólo disponemos de una lista de reacciones anónimas.
No es posible obtener una lista de los usuarios que han reaccionado a un determinado mensaje.
Lo mismo ocurre con los mensajes del canal que se reenvían automáticamente a los chats de los grupos de debate vinculados.

En ambos casos, tu bot recibirá una actualización de `message_reaction_count`.

Puedes manejarlo así.

```ts
bot.on("message_reaction_count", async (ctx) => {
  const counts = ctx.messageReactionCount;
  // De nuevo, sólo podemos ver el identificador del mensaje.
  const message = counts.message_id;
  // Aquí hay una lista de reacciones con un recuento.
  const { reactions } = counts;
});
```

No deje de consultar la [especificación](https://core.telegram.org/bots/api#messagereactioncountupdated) para conocer las actualizaciones del recuento de reacciones a los mensajes.
