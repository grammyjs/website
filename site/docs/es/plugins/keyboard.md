# Inline y Custom Keyboards (incorporados)

Tu bot puede enviar una serie de botones, ya sea para ser [mostrados debajo de un mensaje](#inline-keyboards), o para [reemplazar el teclado del usuario](#custom-keyboards).
Se denominan _inline keyboards_ y _custom keyboards_, respectivamente.
Si crees que esto es confuso, es porque lo es.
Gracias, Telegram, por este solapamiento terminológico.

Vamos a intentar aclararlo un poco:

| Término                                  | Definición                                                                                                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [**Inline Keyboard**](#inline-keyboards) | un conjunto de botones que se muestra debajo de un mensaje dentro del chat                                                                                    |
| [**Custom Keyboard**](#custom-keyboards) | un conjunto de botones que se muestra en lugar del teclado del sistema del usuario                                                                            |
| **Inline Keyboard button**               | un botón en un inline keyboard, envía una consulta de devolución de llamada no visible para el usuario cuando se pulsa, a veces sólo se llama _inline button_ |
| **Custom Keyboard button**               | un botón en un keyboard, envía un mensaje de texto con su etiqueta cuando se pulsa, a veces sólo se llama _keyboard button_                                   |
| **`InlineKeyboard`**                     | clase de grammY para crear inline keyboards                                                                                                                   |
| **`Keyboard` (!)**                       | clase de grammY para crear custom keyboards                                                                                                                   |

> Tenga en cuenta que tanto los botones de teclado personalizados como los botones de teclado en línea también pueden tener otras funciones, como solicitar la ubicación del usuario, abrir un sitio web, etc.
> Esto se ha omitido por razones de brevedad.

No es posible especificar tanto un teclado personalizado como un teclado en línea en el mismo mensaje.
Ambos son mutuamente excluyentes.
Además, el tipo de marcado de respuesta enviado no puede cambiarse posteriormente editando el mensaje.
Por ejemplo, no es posible enviar primero un teclado personalizado junto con un mensaje, y luego editar el mensaje para utilizar un teclado en línea.

# Inline Keyboards

> Revisa la sección del teclado en línea en la [Introducción para Desarrolladores](https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating) escrita por el equipo de Telegram.

grammY tiene una forma sencilla e intuitiva de construir los teclados en línea que tu bot puede enviar junto con un mensaje.
Proporciona una clase llamada `InlineKeyboard` para esto.

> Tanto los botones `switchInline` como `switchInlineCurrent` inician consultas en línea.
> Consulta la sección sobre [Inline Queries](../guide/inline-queries.md) para más información sobre su funcionamiento.

### Construyendo un Inline Keyboard

Aquí hay tres ejemplos de cómo construir un teclado en línea con botones de `texto`.

También puedes usar otros métodos como `url` para permitir que los clientes de Telegram abran una URL, y muchas más opciones como se listan en la [Referencia de la API de grammY](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/InlineKeyboard#Methods) así como en la [Referencia de la API de Telegram Bot](https://core.telegram.org/bots/api#inlinekeyboardbutton) para `InlineKeyboard`.

#### Ejemplo 1

Los botones para una navegación de paginación se pueden construir así:

##### Código

```ts
const inlineKeyboard = new InlineKeyboard()
  .text("« 1", "primero")
  .text("‹ 3", "previo")
  .text("· 4 ·", "actual")
  .text("5 ›", "siguiente")
  .text("31 »", "último");
```

##### Resultado

![Ejemplo 1](/inline-keyboard-example-1.webp)

#### Ejemplo 2

Un teclado en línea con botón de compartir puede ser construido así:

##### Código

```ts
const inlineKeyboard = new InlineKeyboard()
  .text("Obtener música al azar", "al azar").row()
  .switchInline("Enviar música a los amigos");
```

##### Resultado

![Ejemplo 2](/inline-keyboard-example-2.webp)

#### Ejemplo 3

Los botones de la URL se pueden construir así:

##### Código

```ts
const inlineKeyboard = new InlineKeyboard().url(
  "Leer en TechCrunch",
  "https://techcrunch.com/2016/04/11/this-is-the-htc-10/",
);
```

##### Resultado

![Ejemplo 3](/inline-keyboard-example-3.webp)

### Envío de un Inline Keyboard

Puedes enviar un teclado en línea directamente a lo largo de un mensaje, sin importar si usas `bot.api.sendMessage`, `ctx.api.sendMessage`, o `ctx.reply`:

```ts
// Enviar teclado en línea con el mensaje.
await ctx.reply(text, {
  reply_markup: inlineKeyboard,
});
```

Naturalmente, todos los demás métodos que envían mensajes que no sean de texto soportan las mismas opciones, como se especifica en la [Referencia de la API de Telegram Bot](https://core.telegram.org/bots/api).
Por ejemplo, puedes editar un teclado llamando a `editMessageReplyMarkup`, y pasando la nueva instancia de `InlineKeyboard` como `reply_markup`.
Especifique un teclado en línea vacío para eliminar todos los botones debajo de un mensaje.

### Respondiendo a los clics

::: tip Menu Plugin
El plugin de teclado te da acceso directo a los objetos de actualización que envía Telegram.
Sin embargo, responder a los clics de esta manera puede ser tedioso.
Si buscas una implementación de más alto nivel de los teclados en línea, echa un vistazo a [el plugin de menús](./menu.md).
Hace que sea sencillo crear menús interactivos.
:::

Cada botón de `texto` tiene adjuntada una cadena como dato de callback.
Si no se adjuntan datos de devolución de llamada, grammY utilizará el texto del botón como datos.

Una vez que un usuario hace clic en un botón de texto, tu bot recibirá una actualización que contiene los datos de callback del botón correspondiente.
Puedes escuchar los datos del callback a través de `bot.callbackQuery()`.

```ts
// Construye un teclado.
const inlineKeyboard = new InlineKeyboard().text("click", "click-payload");

// Envía un teclado junto con un mensaje.
bot.command("start", async (ctx) => {
  await ctx.reply("¿Tienes curiosidad? Haz clic en mí.", {
    reply_markup: inlineKeyboard,
  });
});

// Esperar eventos de clic con datos de devolución de llamada específicos.
bot.callbackQuery("click-payload", async (ctx) => {
  await ctx.answerCallbackQuery({
    text: "¡Eres curioso, en efecto!",
  });
});
```

::: tip Responder a todas las consultas de devolución de llamada
`bot.callbackQuery()` es útil para escuchar los eventos de clic de botones específicos.
Puedes usar `bot.on("callback_query:data")` para escuchar los eventos de cualquier botón.

```ts
bot.callbackQuery("click-payload" /* , ... */);

bot.on("callback_query:data", async (ctx) => {
  console.log(
    "Evento de botón desconocido con payload",
    ctx.callbackQuery.data,
  );
  await ctx.answerCallbackQuery(); // eliminar la animación de carga
});
```

Tiene sentido definir `bot.on("callback_query:data")` al final para responder siempre a todas las demás consultas de devolución de llamada que sus oyentes anteriores no manejaron.
De lo contrario, algunos clientes pueden mostrar una animación de carga durante un minuto cuando un usuario pulsa un botón al que tu bot no quiere reaccionar.
:::

## Custom Keyboards

Lo primero es lo primero: los teclados a veces se llaman simplemente keyboards, a veces se llaman reply keyboards, e incluso la propia documentación de Telegram no es consistente a este respecto.
Como simple regla general, cuando no es absolutamente obvio por el contexto y no se llama inline keyboard, probablemente es un custom keyboard.
Esto se refiere a una forma de reemplazar el teclado del sistema por un conjunto de botones que puedes definir.

> Revisa la sección de teclados en la [Introducción para Desarrolladores](https://core.telegram.org/bots#keyboards) escrita por el equipo de Telegram.

grammY tiene una manera simple e intuitiva de construir los teclados de respuesta que tu bot puede usar para reemplazar el teclado del usuario.
Proporciona una clase llamada `Keyboard` para esto.

Una vez que el usuario hace clic en un botón de texto, tu bot recibirá el texto enviado como un mensaje de texto plano.
Recuerda que puedes escuchar los mensajes de texto a través de `bot.on("message:text")`.

### Construyendo un Custom Keyboard

Aquí hay tres ejemplos de cómo construir un teclado con botones de `texto`.

También puedes solicitar el número de teléfono con `requestContact`, la ubicación con `requestLocation`, y un sondeo con `requestPoll`.

#### Ejemplo 1

Tres botones en una columna pueden ser construidos así:

##### Código

```ts
const keyboard = new Keyboard()
  .text("Sí, ciertamente lo son").row()
  .text("No estoy muy seguro").row()
  .text("No. 😈");
```

##### Resultado

![Ejemplo 1](/keyboard-example-1.webp)

#### Ejemplo 2

Un teclado de calculadora se puede construir así:

##### Código

```ts
const keyboard = new Keyboard()
  .text("7").text("8").text("9").text("*").row()
  .text("4").text("5").text("6").text("/").row()
  .text("1").text("2").text("3").text("-").row()
  .text("0").text(".").text("=").text("+");
```

##### Resultado

![Ejemplo 2](/keyboard-example-2.webp)

#### Ejemplo 3

Cuatro botones en una cuadrícula pueden ser construidos así:

##### Código

```ts
const keyboard = new Keyboard()
  .text("A").text("B").row()
  .text("C").text("D");
```

##### Resultado

![Ejemplo 3](/keyboard-example-3.webp)

### Envío de un Custom Keyboard

Puedes enviar un teclado directamente a lo largo de un mensaje, sin importar si usas `bot.api.sendMessage`, `ctx.api.sendMessage`, o `ctx.reply`:

```ts
// Envía el teclado con el mensaje.
await ctx.reply(text, {
  reply_markup: keyboard,
});
```

Naturalmente, todos los demás métodos que envían mensajes que no sean de texto soportan las mismas opciones, tal y como se especifica en la [Referencia de la API de Telegram Bot](https://core.telegram.org/bots/api).

Si quieres especificar más opciones con tu mensaje, puede que tengas que crear tu propio objeto `reply_markup`.
En ese caso, tienes que usar `keyboard.build()` al pasarlo a tu objeto personalizado.

#### Cambiar el tamaño del Custom Keyboard

Puedes especificar la opción `resize_keyboard` si quieres que el teclado sea redimensionado de acuerdo a los botones que contiene.
Esto hará que el teclado sea más pequeño.
(Normalmente, el teclado siempre tendrá el tamaño del teclado estándar de la aplicación).

```ts
await ctx.reply(text, {
  reply_markup: {
    resize_keyboard: true,
    keyboard: keyboard.build(),
  },
});
```

#### Custom Keyboards de un solo uso

Puede especificar la opción `one_time_keyboard` si desea que el teclado se oculte inmediatamente después de que se pulse el primer botón.

```ts
await ctx.reply(text, {
  reply_markup: {
    one_time_keyboard: true,
    keyboard: keyboard.build(),
  },
});
```

#### Marcador de posición del campo de entrada

Puede especificar la opción `input_field_placehoder` si desea que se muestre un marcador de posición en el campo de entrada mientras el teclado esté visible.

```ts
const keyboard = new Keyboard().text("IZQUIERDA").text("DERECHA");

await ctx.reply(text, {
  reply_markup: {
    input_field_placehoder: "Enviar IZQUIERDA o DERECHA",
    keyboard: keyboard.build(),
  },
});
```

#### Enviar selectivamente un Custom Keyboards

Puedes especificar la opción `selectiva` si quieres mostrar el teclado personalizado sólo a aquellos usuarios que sean @mencionados en el texto del objeto mensaje, y al remitente del mensaje original en caso de que tu mensaje sea una [respuesta](../guide/basics.md#sending-messages-with-reply).

```ts
await ctx.reply(text, {
  reply_markup: {
    selective: true,
    keyboard: keyboard.build(),
  },
});
```

### Respondiendo a los clics

Como se mencionó anteriormente, todo lo que hacen los custom keyboards es enviar mensajes de texto normales.
Tu bot no puede diferenciar entre los mensajes de texto ordinarios, y los mensajes de texto que fueron enviados al hacer clic en un botón.

Además, los botones siempre enviarán exactamente el mensaje que está escrito en ellos.
Telegram no te permite crear botones que muestren un texto, pero que envíen otro.
Si necesitas hacer esto, deberías usar un [inline-keyboards](#inline-keyboards) en su lugar.

Para manejar el clic de un botón específico, puedes usar `bot.hears` con el mismo texto que pusiste en el botón.
Si quieres manejar todos los clics de los botones a la vez, utiliza `bot.on("message:text")` e inspecciona `ctx.msg.text` para averiguar qué botón se ha pulsado, o si se ha enviado un mensaje de texto ordinario.

### Eliminación de un Custom Keyboard

A menos que especifique `one_time_keyboard` como se describe
(#one-time-keyboards), el teclado permanecerá abierto para el usuario (pero
el usuario puede minimizarlo).

Sólo se puede eliminar un teclado cuando se envía un nuevo mensaje en el chat, al igual que
como sólo se puede especificar un nuevo teclado al enviar un mensaje. Pasar
`{ remove_keyboard: true }` como `reply_markup` así:

```ts
await ctx.reply(text, {
  reply_markup: { remove_keyboard: true },
});
```

Junto a `remove_keyboard`, puede volver a establecer `selective: true` para
eliminar el teclado sólo para los usuarios seleccionados. Esto funciona de forma análoga a
[enviar selectivamente un custom keyboard](#selectively-send-keyboard).

## Resumen del plugin

Este plugin está incorporado en el núcleo de grammY.
No necesitas instalar nada para usarlo.
Simplemente importa todo desde el propio grammY.

Además, tanto la documentación como la referencia de la API de este plugin están unificadas con el paquete del núcleo.
