---
prev: false
next: false
---

# Teclados en línea y personalizados (incluido)

Tu bot puede enviar una serie de botones, ya sea para ser [mostrados debajo de un mensaje](#teclados-en-linea), o para [reemplazar el teclado del usuario](#teclados-personalizados).
Se denominan _teclados en línea_ y _teclados personalizados_, respectivamente.
Si crees que esto es confuso, es porque lo es.
Gracias, Telegram, por este solapamiento terminológico.

Vamos a intentar aclararlo un poco:

| Término                                               | Definición                                                                                                                                                      |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [**Teclado en Línea**](#teclados-en-linea)            | un conjunto de botones que se muestra debajo de un mensaje dentro del chat.                                                                                     |
| [**Teclado Personalizado**](#teclados-personalizados) | un conjunto de botones que se muestra en lugar del teclado del sistema del usuario.                                                                             |
| **Botón del Teclado en Línea**                        | un botón en un teclado en línea, envía una consulta de devolución de llamada no visible para el usuario cuando se pulsa, a veces sólo se llama _inline button_. |
| **Botón del Teclado Personalizado**                   | un botón en un teclado personalizado, envía un mensaje de texto con su etiqueta cuando se pulsa, a veces sólo se llama _keyboard button_.                       |
| **`InlineKeyboard`**                                  | clase de grammY para crear teclados en línea.                                                                                                                   |
| **`Keyboard`**                                        | clase de grammY para crear teclados personalizados.                                                                                                             |

> Tenga en cuenta que tanto los botones de teclado personalizados como los botones de teclado en línea también pueden tener otras funciones, como solicitar la ubicación del usuario, abrir un sitio web, etc.
> Esto se ha omitido por razones de brevedad.

No es posible especificar tanto un teclado personalizado como un teclado en línea en el mismo mensaje.
Ambos son mutuamente excluyentes.
Además, el tipo de marcado de respuesta enviado no puede cambiarse posteriormente editando el mensaje.
Por ejemplo, no es posible enviar primero un teclado personalizado junto con un mensaje, y luego editar el mensaje para utilizar un teclado en línea.

## Teclados en línea

> Revisa la sección del teclado en línea en las [Características de los bots de Telegram](https://core.telegram.org/bots/features#inline-keyboards) escrita por el equipo de Telegram.

grammY tiene una forma sencilla e intuitiva de construir los teclados en línea que tu bot puede enviar junto con un mensaje.
Proporciona una clase llamada `InlineKeyboard` para esto.

> Los botones añadidos al llamar a `switchInline`, `switchInlineCurrent`, y `switchInlineChosen` inician consultas inline.
> Consulta la sección sobre [Consultas en línea](./inline-query) para obtener más información sobre su funcionamiento.

### Construyendo un Teclado en Línea

Puedes construir un teclado en línea creando una nueva instancia de la clase `InlineKeyboard`, y luego añadiéndole los botones que quieras usando `.text()` y sus otros métodos.

Aquí tienes un ejemplo:

![Ejemplo](/images/inline-keyboard-example.png)

```ts
const inlineKeyboard = new InlineKeyboard()
  .text("« 1", "primero")
  .text("‹ 3", "anterior")
  .text("· 4 ·", "actual")
  .text("5 ›", "siguiente")
  .text("31 »", "último");
```

Llama a `.row()` si quieres empezar una nueva fila de botones.
También puedes usar otros métodos como `.url()` para permitir al cliente del usuario abrir una URL específica o hacer otras cosas interesantes.
Asegúrate de revisar [todos los métodos](/ref/core/inlinekeyboard#methods) en la clase `InlineKeyboard`.

Si ya tienes una cadena de caracteres que te gustaría convertir en un teclado en línea, puedes usar un segundo estilo alternativo para construir instancias de teclado en línea.
La clase `InlineKeyboard` tiene métodos estáticos como `InlineKeyboard.text` que te permiten crear objetos botón.
A su vez, puedes crear una instancia de teclado en línea a partir de un array de objetos botón utilizando `InlineKeyboard.from`.

De esta manera, puedes construir el teclado en línea anterior de una manera funcional.

```ts
const labelDataPairs = [
  ["« 1", "primero"],
  ["‹ 3", "anterior"],
  ["· 4 ·", "actual"],
  ["5 ›", "siguiente"],
  ["31 »", "último"],
];
const buttonRow = labelDataPairs
  .map(([label, data]) => InlineKeyboard.text(label, data));
const keyboard = InlineKeyboard.from([buttonRow]);
```

### Envío de un Teclado en línea

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

### Respondiendo a las pulsaciones del teclado en línea

::: tip Menu Plugin
El plugin de teclado te da acceso directo a los objetos de actualización que envía Telegram.
Sin embargo, responder a los clics de esta manera puede ser tedioso.
Si buscas una implementación de más alto nivel de los teclados en línea, echa un vistazo al [plugin de menús](./menu).
Hace que sea sencillo crear menús interactivos.
:::

Cada botón de `texto` tiene adjuntada una cadena como dato de callback.
Si no se adjuntan datos de devolución de llamada, grammY utilizará el texto del botón como datos.

Una vez que un usuario hace clic en un botón de `texto`, tu bot recibirá una actualización que contiene los datos de callback del botón correspondiente.
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

## Teclados personalizados

Lo primero es lo primero: los teclados a veces se llaman simplemente keyboards, a veces se llaman reply keyboards, e incluso la propia documentación de Telegram no es consistente a este respecto.
Como simple regla general, cuando no es absolutamente obvio por el contexto y no se llama teclado en línea, probablemente es un teclado personalizado.
Esto se refiere a una forma de reemplazar el teclado del sistema por un conjunto de botones que puedes definir.

> Revisa la sección de teclados en las [Características de los bots de Telegram](https://core.telegram.org/bots/features#keyboards) escrita por el equipo de Telegram.

grammY tiene una manera simple e intuitiva de construir los teclados de respuesta que tu bot puede usar para reemplazar el teclado del usuario.
Proporciona una clase llamada `Keyboard` para esto.

Una vez que el usuario hace clic en un botón de `texto`, tu bot recibirá el texto enviado como un mensaje de texto plano.
Recuerda que puedes escuchar los mensajes de texto a través de `bot.on("message:text")`.

### Construyendo un Teclado Personalizado

Puedes construir un teclado personalizado creando una nueva instancia de la clase `Keyboard`, y añadiéndole botones como `.text()` y otros.
Llama a `.row()` para comenzar una nueva fila de botones.

He aquí un ejemplo:

![Ejemplo](/images/keyboard-example.png)

```ts
const keyboard = new Keyboard()
  .text("Yes, they certainly are").row()
  .text("I'm not quite sure").row()
  .text("No. 😈")
  .resized();
```

También puedes enviar botones más potentes que soliciten el número de teléfono o la localización del usuario o que hagan otras cosas interesantes.
Asegúrate de revisar [todos los métodos](/ref/core/keyboard#methods) en la clase `Keyboard`.

Si ya tienes una cadena de caracteres que te gustaría convertir en un teclado, puedes usar un segundo estilo alternativo para construir instancias de teclado.
La clase `Keyboard` tiene métodos estáticos como `Keyboard.text` que te permiten crear objetos botón.
A su vez, puedes crear una instancia de teclado a partir de un array de objetos botón usando `Keyboard.from`.

De esta manera, puedes construir el teclado anterior de una manera funcional.

```ts
const labels = [
  "Yes, they certainly are",
  "I'm not quite sure",
  "No. 😈",
];
const buttonRows = labels
  .map((label) => [Keyboard.text(label)]);
const keyboard = Keyboard.from(buttonRows).resized();
```

### Envío de un Teclado Personalizado

Puedes enviar un teclado directamente a lo largo de un mensaje, sin importar si usas `bot.api.sendMessage`, `ctx.api.sendMessage`, o `ctx.reply`:

```ts
// Envía el teclado con el mensaje.
await ctx.reply(text, {
  reply_markup: keyboard,
});
```

Naturalmente, todos los demás métodos que envían mensajes que no sean de texto soportan las mismas opciones, tal y como se especifica en la [Referencia de la API de Telegram Bot](https://core.telegram.org/bots/api).

También puede dotar a su teclado de una o varias propiedades más llamando a métodos especiales sobre él.
No añadirán ningún botón, sino que definirán el comportamiento del teclado.
Ya hemos visto `resized` en el ejemplo anterior---aquí hay algunas cosas más que puedes hacer.

#### Teclados persistentes

Por defecto, los usuarios ven un icono que les permite mostrar u ocultar el teclado personalizado que tu bot configuró.

Puedes llamar a `persistent` si quieres que el teclado personalizado se muestre siempre que el teclado normal del sistema esté oculto.
De esta forma, los usuarios siempre verán el teclado personalizado o el teclado del sistema.

```ts
new Keyboard()
  .text("Omitir")
  .persistent();
```

#### Cambiar el tamaño del Teclado Personalizado

Puedes llamar a `resized` si quieres que el teclado personalizado se redimensione en función de los botones que contiene.
Esto hará que el teclado sea más pequeño.
(Normalmente, el teclado siempre tendrá el tamaño del teclado estándar de la aplicación).

```ts
new Keyboard()
  .text("Si").row()
  .text("No")
  .resized();
```

No importa si llama a `resized` primero, último o en algún punto intermedio.
El resultado será siempre el mismo.

#### Teclado Personalizado de un solo uso

Puede llamar a `oneTime` si quiere que el teclado personalizado se oculte inmediatamente después de que se pulse el primer botón.

```ts
new Keyboard()
  .text("Si").row()
  .text("No")
  .oneTime();
```

No importa si se llama a `oneTime` primero, último o en algún punto intermedio.
El resultado será siempre el mismo.

#### Marcador de posición del campo de entrada

Puede llamar a `placeholder` si quiere que se muestre un marcador de posición en el campo de entrada mientras el teclado personalizado esté visible.

```ts
new Keyboard()
  .text("Si").row()
  .text("No")
  .placeholder("¡Decide ahora!");
```

No importa si se llama a `placeholder` primero, último o en algún punto intermedio.
El resultado será siempre el mismo.

#### Enviar selectivamente un Teclado Personalizado

Puedes llamar a `selected` si quieres mostrar el teclado personalizado sólo a aquellos usuarios que sean @mencionados en el texto del objeto mensaje, y al remitente del mensaje original en caso de que tu mensaje sea una [respuesta](../guide/basics#enviando-mensajes-con-respuesta).

```ts
new Keyboard()
  .text("Si").row()
  .text("No")
  .selected();
```

No importa si llama a `selected` primero, último o en algún punto intermedio.
El resultado será siempre el mismo.

### Respuesta a pulsaciones del teclado personalizado

Como se mencionó anteriormente, todo lo que hacen los teclado personalizado es enviar mensajes de texto normales.
Tu bot no puede diferenciar entre los mensajes de texto ordinarios, y los mensajes de texto que fueron enviados al hacer clic en un botón.

Además, los botones siempre enviarán exactamente el mensaje que está escrito en ellos.
Telegram no te permite crear botones que muestren un texto, pero que envíen otro.
Si necesitas hacer esto, deberías usar un [teclado en línea](#teclados-en-linea) en su lugar.

Para manejar el clic de un botón específico, puedes usar `bot.hears` con el mismo texto que pusiste en el botón.
Si quieres manejar todos los clics de los botones a la vez, utiliza `bot.on("message:text")` e inspecciona `ctx.msg.text` para averiguar qué botón se ha pulsado, o si se ha enviado un mensaje de texto ordinario.

### Eliminación de un Teclado Personalizado

A menos que especifique `one_time_keyboard` como se describe [arriba](#teclado-personalizado-de-un-solo-uso), el teclado personalizado permanecerá abierto para el usuario (pero
el usuario puede minimizarlo).

Sólo puedes eliminar un teclado personalizado cuando envías un nuevo mensaje en el chat, al igual que sólo puedes especificar un nuevo teclado al enviar un mensaje. Pasar `{ remove_keyboard: true }` como `reply_markup` así:

```ts
await ctx.reply(text, {
  reply_markup: { remove_keyboard: true },
});
```

Junto a `remove_keyboard`, puede establecer `selective: true` para eliminar el teclado personalizado sólo para los usuarios seleccionados. Esto funciona de forma análoga a [enviar selectivamente un teclado personalizado](#enviar-selectivamente-un-teclado-personalizado).

## Resumen del complemento

Este plugin está integrado en el núcleo de grammY.
No necesitas instalar nada para usarlo.
Simplemente importa todo desde el propio grammY.

Además, tanto la documentación como la referencia API de este plugin están unificadas con el paquete del núcleo.
