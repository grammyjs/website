# Telegram Empresas

Telegram Empresas permite que tu chat privado con otro usuario (humano) sea
gestionado por un bot. Esto incluye enviar y recibir mensajes en tu nombre.
Típicamente, esto es útil si manejas tu negocio en Telegram, y ese otro usuario
es un cliente.

> Si aún no estás familiarizado con Telegram Empresas, revisa los
> [docs oficiales](https://core.telegram.org/bots#manage-your-business) de
> Telegram antes de continuar.

Naturalmente, grammY tiene soporte completo para esto.

## Gestión de mensajes de empresa

Un bot puede gestionar un chat privado entre dos usuarios a través de Telegram
Empresas---una cuenta que esté suscrita a la suscripción empresarial de
Telegram. La gestión de chats privados se realiza a través de un objeto
_business connection_ que se parece a [esto](/ref/types/businessconnection).

### Recepción de mensajes de negocios

Una vez establecida una conexión de negocios, el bot **recibirá mensajes** de
_ambos participantes del chat_.

```ts
bot.on("business_message", async (ctx) => {
  // Acceder al objeto mensaje.
  const message = ctx.businessMessage;
  // Los accesos directos funcionan como se esperaba.
  const msg = ctx.msg;
});
```

En este punto, no está claro quién de los dos participantes del chat envió un
mensaje. Podría ser un mensaje de tu cliente... ¡pero también podría ser un
mensaje enviado por ti mismo (no por tu bot)!

Por lo tanto, tenemos que diferenciar entre los dos usuarios. Para ello, tenemos
que inspeccionar el objeto de conexión de negocios antes mencionado. La conexión
comercial nos dice quién es el usuario de la cuenta comercial, es decir, el
identificador de usuario suyo (o de uno de sus empleados).

```ts
bot.on("business_message", async (ctx) => {
  // Obtener información sobre la conexión empresarial.
  const conn = await ctx.getBusinessConnection();
  const employee = conn.user;
  // Comprueba quién envió este mensaje.
  if (ctx.from.id === employee.id) {
    // Has enviado este mensaje.
  } else {
    // Su cliente ha enviado este mensaje.
  }
});
```

También puede omitir la llamada a `getBusinessConnection` para cada
actualización haciendo [esto](#trabajando-con-conexiones-empresariales).

### Envío de mensajes

Tu bot puede **enviar mensajes** a este chat _sin ser miembro del chat_.
Funciona como se espera con `ctx.reply` y todas sus variantes. grammY comprueba
si el [atajo](../guide/context#atajos) `ctx.businessConnectionId` está
disponible, para poder enviar el mensaje al chat gestionado por el negocio.

```ts
bot.on("business_message").filter(
  async (ctx) => {
    const conn = await ctx.getBusinessConnection();
    return ctx.from.id !== conn.user.id;
  },
  async (ctx) => {
    // Responda automáticamente a todas las preguntas de los clientes.
    if (ctx.msg.text.endsWith("?")) {
      await ctx.reply("Soon.");
    }
  },
);
```

Esto parecerá como si hubieras enviado el mensaje tú mismo. No hay forma de
decirle a tu cliente si el mensaje fue enviado manualmente o a través de tu bot.
(Aunque verá un pequeño indicador de ello). (Pero es probable que tu bot sea
mucho más rápido respondiendo que tú. Lo sentimos).

## Yendo más allá

Hay algunas cosas más a tener en cuenta a la hora de integrar tu bot con
Telegram Empresas. Aquí cubriremos brevemente algunos aspectos.

### Edición o eliminación de mensajes de empresa

Cuando usted o su cliente editen o borren mensajes en su chat, su bot será
notificado de ello. Más concretamente, recibirá las actualizaciones
`edited_business_message` o `deleted_business_messages`. Tu bot puede
gestionarlas de forma normal utilizando `bot.on` y sus innumerables
[consultas de filtro](../guide/filter-queries).

Sin embargo, tu bot **NO** puede editar o borrar mensajes en el chat. Del mismo
modo, tu bot **NO** puede reenviar mensajes desde el chat, o copiarlos en otro
lugar. Todo esto queda en manos de los humanos.

### Trabajando con conexiones empresariales

Cuando el bot esté conectado a una cuenta de empresa, recibirá una actualización
de `business_connection`. Esta actualización también se recibirá cuando el bot
se desconecte o la conexión se edite de otra forma.

Por ejemplo, un bot puede o no enviar mensajes a los chats que gestiona. Puedes
detectar esto utilizando la parte de consulta `:can_reply`.

```ts
bot.on("business_connection:can_reply", async (ctx) => {
  // La conexión permite enviar mensajes.
});
```

Tiene mucho sentido almacenar objetos de conexión de negocio en tu base de
datos. De esta manera, puedes evitar llamar a `ctx.getBusinessConnection()` para
cada actualización sólo para
[averiguar quién envió un mensaje](#recepcion-de-mensajes-de-negocios).

Además, una actualización de `business_connection` contiene un `user_chat_id`.
Este identificador de chat se puede utilizar para iniciar una conversación con
el usuario que conectó el bot.

```ts
bot.on("business_connection:is_enabled", async (ctx) => {
  const id = ctx.businessConnection.user_chat_id;
  await ctx.api.sendMessage(id, "¡Gracias por ponerte en contacto!");
});
```

Esto funciona incluso si el usuario aún no ha iniciado tu bot.

### Gestionar Chats Individuales

Si conectas un bot para gestionar tu cuenta, las aplicaciones de Telegram te
ofrecerán un botón para gestionar este bot en cada chat gestionado. Este botón
envía `/start` al bot.

Este comando de inicio tiene un payload especial con
[deep linking](../guide/commands#soporte-de-deep-linking) definido por Telegram.
Tiene el formato `bizChatXXXXX` donde `XXXXX` será el identificador del chat
gestionado.

```ts
bot.command("start", async (ctx) => {
  const payload = ctx.match;
  if (payload.startsWith("bizChat")) {
    const id = payload.slice(7); // quitar `bizChat`
    await ctx.reply(`Let's manage chat #${id}!`);
  }
});
```

Esto proporciona un contexto importante a su bot y le permite gestionar chats
empresariales individuales directamente desde la conversación con cada cliente.
