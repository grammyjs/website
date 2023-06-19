---
prev: ./filter-queries.md
next: ./middleware.md
---

# Comandos

Los comandos son entidades especiales en los mensajes de Telegram, que sirven como instrucciones para los bots.

## Uso

> Revisa la sección de comandos en las [Características de los bots de Telegram](https://core.telegram.org/bots/features#commands) escrita por el equipo de Telegram.

grammY proporciona un manejo especial para los comandos (por ejemplo, `/start` y `/help`). Puedes registrar directamente oyentes para ciertos comandos a través de `bot.command()`.

```ts
// Responde al comando /start.
bot.command("start" /* , ... */);
// Responde al comando /help.
bot.command("help" /* , ... */);
// Responde a los comandos /a, /b, /c, y /d.
bot.command(["a", "b", "c", "d"] /* , ... */);
```

Ten en cuenta que sólo se manejan los comandos que están al principio de un mensaje, así que si un usuario envía `"¡Por favor, no envíes /start a ese bot!"`, entonces su escuchador no será llamado, aunque el comando`/start` _está_ contenido en el mensaje.

Telegram soporta el envío de comandos dirigidos a los bots, es decir, comandos que terminan con `@tu_nombre_del_bot`.
grammY maneja esto automáticamente por ti, así que `bot.command("start")` coincidirá con mensajes con `/start` y con `/start@your_bot_name` como comandos.
Puedes elegir coincidir sólo con comandos específicos especificando `bot.command("start@your_bot_name")`.

::: tip Sugerir comandos a los usuarios

Puedes llamar a:

```ts
await bot.api.setMyCommands([
  { command: "start", description: "Iniciar el bot" },
  { command: "help", description: "Mostrar texto de ayuda" },
  { command: "settings", description: "Abrir la configuración" },
]);
```

para hacer que los clientes de Telegram muestren una lista de comandos sugeridos en el campo de entrada de texto.

Alternativamente, puedes configurar esto hablando con [@BotFather](https://t.me/BotFather).
:::

## Argumentos

Los usuarios pueden enviar **argumentos** junto con sus comandos.
Puedes acceder a la cadena de argumentos a través de `ctx.match`.

```ts
bot.command("add", async (ctx) => {
  // `item` será "apple pie" si un usuario envía "/add apple pie".
  const item = ctx.match;
});
```

Ten en cuenta que siempre puedes acceder al texto completo del mensaje a través de `ctx.msg.text`.

## Soporte de Deep Linking

> Revisa la sección de enlaces profundos en las [Características de los bots de Telegram](https://core.telegram.org/bots/features#deep-linking) escrita por el equipo de Telegram.

Cuando un usuario visita `https://t.me/your_bot_name?start=payload`, su cliente de Telegram mostrará un botón START que (al hacer clic) envía la cadena del parámetro de la URL junto con el mensaje, en este ejemplo, el texto del mensaje será `"/start payload"`.
Los clientes de Telegram no mostrarán el payload al usuario (sólo verán `"/start"` en la UI), sin embargo, tu bot lo recibirá.
grammY extrae este payload por ti, y lo proporciona bajo `ctx.match`.
En nuestro ejemplo con el enlace anterior, `ctx.match` contendría la cadena `"payload"`.

La vinculación profunda es útil si quieres construir un sistema de referencias, o rastrear dónde los usuarios descubrieron tu bot.
Por ejemplo, tu bot podría enviar un mensaje de canal con un botón del [teclado en línea](../plugins/keyboard.md#teclados-en-linea).
El botón contiene una URL como la de arriba, por ejemplo `https://t.me/your_bot_name?start=awesome-channel-post-12345`.
Cuando un usuario haga clic en el botón debajo de la publicación, su cliente de Telegram abrirá un chat con tu bot, y mostrará el botón START como se ha descrito anteriormente.
De esta manera, tu bot puede identificar de dónde viene un usuario, y que hizo clic en el botón debajo de una publicación específica del canal.

Naturalmente, también puedes incrustar dichos enlaces en cualquier otro lugar: en la web, en mensajes, en códigos QR, etc.

Echa un vistazo a esta [sección de los documentos de Telegram](https://core.telegram.org/api/links#bot-links) para ver una lista completa de posibles formatos de enlace.

También te permiten pedir a los usuarios que añadan tu bot a grupos o canales, y opcionalmente conceder a tu bot los derechos de administrador necesarios.
