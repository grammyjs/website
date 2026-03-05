---
prev: false
next: false
---

# Menús interactivos (`menu`)

Crea fácilmente menús interactivos.

## Introducción

Un teclado en línea es un conjunto de botones debajo de un mensaje.
grammY tiene un [plugin incorporado](./keyboard#teclados-en-linea) para crear teclados en línea básicos.

El plugin de menús lleva esta idea más allá y te permite crear menús ricos justo dentro del chat.
Pueden tener botones interactivos, múltiples páginas con navegación entre ellas, y más.

Aquí hay un ejemplo simple que habla por sí mismo.

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { Menu } from "@grammyjs/menu";

// Crea un bot.
const bot = new Bot("");

// Cree un menú sencillo.
const menu = new Menu("mi-identificador-de-menu")
  .text("A", (ctx) => ctx.reply("¡Has pulsado A!")).row()
  .text("B", (ctx) => ctx.reply("¡Has pulsado B!"));

// Hazlo interactivo.
bot.use(menu);

bot.command("start", async (ctx) => {
  // Envía el menú.
  await ctx.reply("Mira este menú:", { reply_markup: menu });
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { Menu } = require("@grammyjs/menu");

// Crea un bot.
const bot = new Bot("");

// Cree un menú sencillo.
const menu = new Menu("mi-identificador-de-menu")
  .text("A", (ctx) => ctx.reply("¡Has pulsado A!")).row()
  .text("B", (ctx) => ctx.reply("¡Has pulsado B!"));

// Hazlo interactivo.
bot.use(menu);

bot.command("start", async (ctx) => {
  // Envía el menú.
  await ctx.reply("Mira este menú:", { reply_markup: menu });
});

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { Menu } from "https://deno.land/x/grammy_menu/mod.ts";

// Crea un bot.
const bot = new Bot("");

// Cree un menú sencillo.
const menu = new Menu("mi-identificador-de-menu")
  .text("A", (ctx) => ctx.reply("¡Has pulsado A!")).row()
  .text("B", (ctx) => ctx.reply("¡Has pulsado B!"));

// Hazlo interactivo.
bot.use(menu);

bot.command("start", async (ctx) => {
  // Envía el menú.
  await ctx.reply("Mira este menú:", { reply_markup: menu });
});

bot.start();
```

:::

> Asegúrese de instalar todos los menús antes de otros middleware, especialmente antes de los middleware que utilizan datos de consulta de devolución de llamada.
> Además, si utiliza una configuración personalizada para `allowed_updates`, recuerde incluir actualizaciones `callback_query`.

Naturalmente, si está utilizando un [tipo de contexto personalizado](../guide/context#personalizacion-del-objeto-de-contexto), puede pasarlo a `Menu` también.

```ts
const menu = new Menu<MyContext>("id");
```

## Adding Buttons

El plugin de menús presenta sus teclados exactamente como lo hace el [plugin para teclados en línea] (./keyboard#building-an-inline-keyboard).
La clase `Menu` reemplaza a la clase `InlineKeyboard`.

Aquí hay un ejemplo para un menú que tiene cuatro botones en forma de fila 1-2-1.

```ts
const menu = new Menu("movimientos")
  .text("^", (ctx) => ctx.reply("¡Adelante!")).row()
  .text("<", (ctx) => ctx.reply("¡Izquierda!"))
  .text(">", (ctx) => ctx.reply("¡Derecha!")).row()
  .text("v", (ctx) => ctx.reply("¡Atrás!"));
```

Utilice `text` para añadir nuevos botones de texto.
Puede pasar una etiqueta y una función manejadora.

Utilice `row` para terminar la fila actual, y añadir todos los botones posteriores a una nueva fila.

Hay muchos más tipos de botones disponibles, por ejemplo, para abrir URLs.
Echa un vistazo a la [Referencia API de este plugin](/ref/menu/menurange) para `MenuRange`, así como a la [Referencia API de Telegram Bot](https://core.telegram.org/bots/api#inlinekeyboardbutton) para `InlineKeyboardButton`.

## Enviando un Menú

Primero debes instalar un menú.
Esto lo hace interactivo.

```ts
bot.use(menu);
```

Ahora puede pasar simplemente el menú como `reply_markup` al enviar un mensaje.

```ts
bot.command("menu", async (ctx) => {
  await ctx.reply("Este es su menú", { reply_markup: menu });
});
```

## Etiquetas dinámicas

Siempre que pongas una cadena de etiqueta en un botón, también puedes pasar una función `(ctx: Context) => string` para obtener una etiqueta dinámica en el botón.
Esta función puede ser o no `async`.

```ts
// Cree un botón con el nombre del usuario, que le dará la bienvenida cuando lo pulse.
const menu = new Menu("saludame")
  .text(
    (ctx) => `Saluda ${ctx.from?.first_name ?? "me"}!`, // etiqueta dinámica
    (ctx) => ctx.reply(`Hola ${ctx.from.first_name}!`), // manejador
  );
```

Una cadena generada por una función de este tipo se denomina _cadena dinámica_.
Las cadenas dinámicas son ideales para cosas como los botones de alternancia.

```ts
// Conjunto de identificadores de usuario que tienen activadas las notificaciones.
const notifications = new Set<number>();

function toggleNotifications(id: number) {
  if (!notifications.delete(id)) notifications.add(id);
}

const menu = new Menu("toggle")
  .text(
    (ctx) => ctx.from && notifications.has(ctx.from.id) ? "🔔" : "🔕",
    (ctx) => {
      toggleNotifications(ctx.from.id);
      ctx.menu.update(); // ¡actualizar el menú!
    },
  );
```

Tenga en cuenta que debe actualizar un menú siempre que quiera que sus botones cambien.
Llama a `ctx.menu.update()` para asegurarte de que tu menú se volverá a renderizar.

::: tip Almacenamiento de datos
El ejemplo anterior demuestra cómo utilizar el plugin de menú.
No es una buena idea almacenar la configuración del usuario en un objeto `Set`, porque entonces todos los datos se perderán cuando se detenga el servidor.

En su lugar, considere el uso de una base de datos o el [plugin de sesión] (./session) si desea almacenar datos.
:::

## Actualizar o cerrar el menú

Cuando se llama a un manejador de botón, un número de funciones útiles están disponibles en `ctx.menu`.

Si quieres que tu menú se vuelva a renderizar, puedes llamar a `ctx.menu.update()`.
Esto sólo funcionará dentro de los manejadores que instales en tu menú.
No funcionará cuando se llame desde otro bot middleware, ya que en estos casos no hay forma de saber _qué_ menú debe ser actualizado.

```ts
const menu = new Menu("time", { onMenuOutdated: false })
  .text(
    () => new Date().toLocaleString(), // la etiqueta del botón es la hora actual
    (ctx) => ctx.menu.update(), // actualiza la hora al pulsar el botón
  );
```

> El propósito de `onMenuOutdated` se explica [más abajo](#menus-y-huellas-anticuadas).
> Puedes ignorarlo por ahora.

También puede actualizar el menú implícitamente editando el mensaje correspondiente.

```ts
const menu = new Menu("time")
  .text(
    "¿Qué hora es?",
    (ctx) => ctx.editMessageText("Son las " + new Date().toLocaleString()),
  );
```

El menú detectará que usted tiene la intención de editar el texto del mensaje, y aprovechará la oportunidad para actualizar también los botones que se encuentran debajo.
Como resultado, a menudo puede evitar tener que llamar a `ctx.menu.update()` explícitamente.

Llamar a `ctx.menu.update()` no actualiza el menú inmediatamente.
En su lugar, establece una bandera y recuerda actualizarlo en algún momento durante la ejecución de tu middleware.
Esto se llama _actualización lenta_.
Si editas el mensaje en sí más tarde, el plugin puede simplemente usar la misma llamada a la API para actualizar también los botones.
Esto es muy eficiente, y asegura que tanto el mensaje como el teclado se actualicen al mismo tiempo.

Naturalmente, si llamas a `ctx.menu.update()` pero nunca solicitas ninguna edición del mensaje, el plugin del menú actualizará el teclado por sí mismo, antes de que tu middleware se complete.

Puedes forzar que el menú se actualice inmediatamente con `await ctx.menu.update({ immediate: true })`.
Ten en cuenta que `ctx.menu.update()` devolverá una promesa, por lo que debes usar `await`.
El uso de la bandera `inmediata` también funciona para todas las demás operaciones que puedes llamar en `ctx.menu`.
Esto sólo debería usarse cuando sea necesario.

Si quieres cerrar un menú, es decir, eliminar todos los botones, puedes llamar a `ctx.menu.close()`.
De nuevo, esto se realizará de forma perezosa.

## Navegación entre menús

Se pueden crear fácilmente menús con varias páginas, y navegar entre ellas.
Cada página tiene su propia instancia de `Menú`.
El botón `submenú` es un botón que le permite navegar a otras páginas.
La navegación hacia atrás se hace a través del botón `back`.

```ts
const main = new Menu("root-menu")
  .text("Bienvenido", (ctx) => ctx.reply("¡Hola!")).row()
  .submenu("Créditos", "credits-menu");

const settings = new Menu("credits-menu")
  .text("Mostrar créditos", (ctx) => ctx.reply("Desarrollado por grammY"))
  .back("Volver");
```

Ambos botones toman opcionalmente manejadores de middleware para que puedas reaccionar a los eventos de navegación.

En lugar de utilizar los botones `submenu` y `back` para navegar entre páginas, también puedes hacerlo manualmente utilizando `ctx.menu.nav()`.
Esta función toma la cadena del identificador del menú, y realizará la navegación de forma perezosa.
Análogamente, la navegación hacia atrás funciona a través de `ctx.menu.back()`.

A continuación, hay que enlazar los menús registrándolos entre sí.
Registrar un menú a otro implica su jerarquía. El menú al que se está registrando es el padre, y el menú registrado es el hijo.
A continuación, `main` es el padre de `settings`, a menos que se defina explícitamente un padre diferente.
El menú padre se utiliza cuando se realiza una navegación hacia atrás.

```ts
// Registrar el menú de ajustes en el menú principal.
main.register(settings);
// Opcionalmente, establece un padre diferente.
main.register(settings, "back-from-settings-menu");
```

Puedes registrar tantos menús como quieras, y anidarlos tan profundamente como quieras.
Los identificadores de menú le permiten saltar fácilmente a cualquier página.

**Sólo tienes que hacer interactivo un único menú de tu estructura de menús anidados.**
Por ejemplo, sólo pasa el menú raíz a `bot.use`.

```ts
// Si tienes esto:
main.register(settings);

// Haz esto:
bot.use(main);

// No hagas esto:
bot.use(main);
bot.use(settings);
```

**Puedes crear varios menús independientes y hacerlos todos interactivos.**
Por ejemplo, si creas dos menús no relacionados entre sí y nunca necesitas navegar entre ellos, entonces debes instalar ambos de forma independiente.

```ts
// Si tienes menús independientes como este
const menuA = new Menu("menu-a");
const menuB = new Menu("menu-b");

// Puedes hacer esto
bot.use(menuA);
bot.use(menuB);
```

## Payloads

Puede almacenar cargas útiles de texto cortas junto con todos los botones de navegación y de texto.
Cuando los respectivos manejadores son invocados, la carga útil de texto estará disponible bajo `ctx.match`.
Esto es útil porque le permite almacenar un poco de información en un menú.

Este es un ejemplo de menú que recuerda la hora actual en el payload.
Otros casos de uso podrían ser, por ejemplo, almacenar el índice en un menú paginado.

```ts
function generatePayload() {
  return Date.now().toString();
}

const menu = new Menu("store-current-time-in-payload")
  .text(
    { text: "¡ABORTAR!", payload: generatePayload },
    async (ctx) => {
      // Dar al usuario 5 segundos para deshacer.
      const text = Date.now() - Number(ctx.match) < 5000
        ? "La operación se ha cancelado con éxito."
        : "Demasiado tarde. Tus vídeos de gatos ya se han hecho virales en Internet.";
      await ctx.reply(text);
    },
  );

bot.use(menu);
bot.command("publish", async (ctx) => {
  await ctx.reply(
    "Los vídeos se enviarán. Tienes 5 segundos para cancelarlo.",
    {
      reply_markup: menu,
    },
  );
});
```

::: tip Limitaciones
Las cargas útiles no pueden utilizarse para almacenar cantidades significativas de datos.
Lo único que puede almacenar son cadenas cortas de típicamente menos de 50 bytes, como un índice o un identificador.
Si realmente quieres almacenar datos de usuario como un identificador de fichero, una URL, o cualquier otra cosa, deberías usar [sessions](./session).

Además, tenga en cuenta que la carga útil siempre se genera basándose en el objeto de contexto actual.
Esto significa que importa _desde_ dónde se navega al menú, lo que puede dar lugar a resultados sorprendentes.
Por ejemplo, cuando un menú está [desactualizado](#menus-y-huellas-anticuadas), se volverá a renderizar _basándose en el clic del botón del menú desactualizado_.
:::

Payloads también funcionan bien junto con los rangos dinámicos.

## Rangos dinámicos

Hasta ahora, sólo hemos visto cómo cambiar el texto de un botón de forma dinámica.
También se puede ajustar dinámicamente la estructura de un menú para añadir y eliminar botones sobre la marcha.

::: peligro Cambiar un menú durante el manejo de mensajes
No se pueden crear o modificar los menús durante la gestión de los mensajes.
Todos los menús deben estar completamente creados y registrados antes de que se inicie tu bot.
Esto significa que no puedes hacer `new Menu("id")` en un manejador de tu bot.

Añadir nuevos menús mientras tu bot se está ejecutando causaría una fuga de memoria.
Tu bot se ralentizaría cada vez más, y finalmente se colgaría.

Sin embargo, puedes hacer uso de los rangos dinámicos descritos en esta sección.
Te permiten cambiar arbitrariamente la estructura de una instancia de menú existente, por lo que son igualmente potentes.
¡Utilice rangos dinámicos!
:::

Puede dejar que una parte de los botones de un menú se genere sobre la marcha (o todos ellos si lo desea).
A esta parte del menú la llamamos _rango dinámico_.
La forma más sencilla de crear un rango dinámico es utilizando la clase `MenuRange` que proporciona este plugin.
Un `MenuRange` le proporciona exactamente las mismas funciones que un menú, pero no tiene un identificador, y no puede ser registrado.

```ts
function getRandomInt(minInclusive: number, maxExclusive: number) {
  const range = maxExclusive - minInclusive;
  return minInclusive + Math.floor(range * Math.random());
}

// Crea un menú con un número aleatorio de botones.
const menu = new Menu("random", { onMenuOutdated: false });

menu
  .text("Regenerar", (ctx) => ctx.menu.update())
  .row();
menu.dynamic(() => {
  const range = new MenuRange();
  const buttonCount = getRandomInt(2, 9); // 2-8 botones
  for (let i = 0; i < buttonCount; i++) {
    range
      .text(i.toString(), (ctx) => ctx.reply(`${i} seleccionado`))
      .row();
  }
  return range;
});
```

La función de generación de rangos que se pasa a `dynamic` puede ser `async`, por lo que incluso se pueden realizar llamadas a la API o hacer comunicación con la base de datos antes de devolver el nuevo rango del menú.
**En muchos casos, tiene sentido generar un rango dinámico basado en los datos de [session](./session).**

Además, la función de construcción de rangos toma un objeto de contexto como primer argumento.
(Esto no se especifica en el ejemplo anterior).
Opcionalmente, como segundo argumento después de `ctx`, puede recibir una instancia fresca de `MenuRange`.
Puedes modificarlo en lugar de devolver tu propia instancia si es lo que prefieres.
Así es como puedes utilizar los dos parámetros de la función constructora de rangos.

```ts
menu.dynamic((ctx, range) => {
  for (const text of ctx.session.items) {
    range // no se necesita `new MenuRange()` o un `return`.
      .text(text, (ctx) => ctx.reply(text))
      .row();
  }
});
```

## Responder manualmente a las consultas de devolución de llamada

El plugin del menú llamará a `answerCallbackQuery` automáticamente para sus propios botones.
Puede establecer `autoAnswer: false` si quiere desactivar esto.

```ts
const menu = new Menu("id", { autoAnswer: false });
```

Ahora tendrá que llamar usted mismo a `answerCallbackQuery`.
Esto le permite pasar mensajes personalizados que se muestran al usuario.

## Menús y Huellas Anticuadas

Digamos que tienes un menú donde un usuario puede activar y desactivar las notificaciones, como en el ejemplo [aquí arriba](#etiquetas-dinamicas).
Ahora, si un usuario envía `/settings` dos veces, obtendrá el mismo menú dos veces.
Pero, ¡cambiar la configuración de la notificación en uno de los dos mensajes no actualizará el otro!

Está claro que no podemos hacer un seguimiento de todos los mensajes de configuración en un chat, y actualizar todos los menús antiguos en todo el historial del chat.
Tendrías que usar tantas llamadas a la API para esto que Telegram limitaría la velocidad de tu bot.
También necesitarías mucho almacenamiento para recordar todos los identificadores de los mensajes de cada menú, en todos los chats.
Esto no es práctico.

La solución, es comprobar si un menú está desactualizado _antes_ de realizar cualquier acción.
De esta manera, sólo actualizaremos los menús antiguos si un usuario empieza a hacer clic en los botones de los mismos.
El plugin de menús maneja esto automáticamente por ti, así que no tienes que preocuparte por ello.

Puedes configurar exactamente lo que ocurre cuando se detecta un menú obsoleto.
Por defecto, se mostrará al usuario el mensaje "El menú estaba obsoleto, inténtelo de nuevo" y se actualizará el menú.
Puede definir un comportamiento personalizado en la configuración bajo `onMenuOutdated`.

```ts
// Mensaje personalizado a mostrar
const menu0 = new Menu("id", { onMenuOutdated: "Updated, try now." });
// Función de gestión personalizada
const menu1 = new Menu("id", {
  onMenuOutdated: async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply("Here is a fresh menu", { reply_markup: menu1 });
  },
});
// Desactivar por completo la comprobación de la caducidad (puede ejecutar manejadores de botón erróneos).
const menu2 = new Menu("id", { onMenuOutdated: false });
```

Disponemos de una heurística para comprobar si el menú está anticuado.
Lo consideramos obsoleto si

- La forma del menú ha cambiado (número de filas, o número de botones en cualquier fila).
- La posición de la fila/columna del botón pulsado está fuera de rango.
- La etiqueta del botón pulsado ha cambiado.
- El botón pulsado no contiene un manejador.

Es posible que su menú cambie, mientras todas las cosas anteriores permanecen igual.
También es posible que su menú no cambie fundamentalmente (es decir, que el comportamiento de los manejadores no cambie), aunque la heurística anterior indique que el menú está desactualizado.
Ambos escenarios son poco probables para la mayoría de los bots, pero si estás creando un menú en el que este es el caso, deberías usar una función de huella digital.

```ts
function ident(ctx: Context): string {
  // Devuelve una cadena que cambiaría si y sólo si su menú cambia
  // de forma tan significativa que debería considerarse obsoleto.
  return ctx.session.myStateIdentifier;
}
const menu = new Menu("id", { fingerprint: (ctx) => ident(ctx) });
```

La cadena de huellas digitales sustituirá a la heurística anterior.
De este modo, puede estar seguro de que siempre se detectan los menús obsoletos.

## Cómo funciona

El plugin de menús funciona completamente sin almacenar ningún dato.
Esto es importante para grandes bots con millones de usuarios.
Guardar el estado de todos los menús consumiría demasiada memoria.

Cuando creas tus objetos de menú y los enlazas a través de las llamadas `register`, no se construye ningún menú.
En su lugar, el plugin de menús recordará cómo montar nuevos menús basándose en sus operaciones.
Cada vez que se envíe un menú, reproducirá estas operaciones para renderizar su menú.
Esto incluye la disposición de todos los rangos dinámicos y la generación de todas las etiquetas dinámicas.
Una vez enviado el menú, la matriz de botones renderizada se olvidará de nuevo.

Cuando se envía un menú, cada botón contiene una consulta de devolución de llamada que almacena

- El identificador del menú.
- La posición de la fila/columna del botón.
- Una carga útil opcional.
- Una bandera de huella digital que almacena si se ha utilizado o no una huella digital en el menú.
- Un hash de 4 bytes que codifica la huella digital o el diseño del menú y la etiqueta del botón.

De esta forma, podemos identificar exactamente qué botón de qué menú se ha pulsado.
Un menú sólo manejará las pulsaciones de los botones si:

- Los identificadores del menú coinciden.
- Se especifica la fila/columna.
- La bandera de la huella digital existe.

Cuando un usuario pulsa un botón de un menú, necesitamos encontrar el manejador que se añadió a ese botón en el momento en que se renderizó el menú.
Por lo tanto, simplemente renderizamos el viejo menú de nuevo.
Sin embargo, esta vez, no necesitamos el diseño completo---todo lo que necesitamos es la estructura general, y ese botón específico.
En consecuencia, el plugin del menú realizará una representación superficial para ser más eficiente.
En otras palabras, el menú sólo se renderizará parcialmente.

Una vez que se conoce el botón pulsado de nuevo (y hemos comprobado que el menú no está [desactualizado](#menus-y-huellas-anticuadas)), invocamos el manejador.

Internamente, el plugin de menús hace un gran uso de [API Transformer Functions](../advanced/transformers), por ejemplo, para renderizar rápidamente los menús salientes sobre la marcha.

Cuando se registran los menús en una gran jerarquía de navegación, de hecho no almacenan estas referencias explícitamente.
Bajo el capó, todos los menús de esa estructura se añaden al mismo pool grande, y ese pool se comparte entre todas las instancias contenidas.
Cada menú es responsable de todos los demás en el índice, y pueden manejarse y renderizarse mutuamente.
(La mayoría de las veces, es sólo el menú raíz el que se pasa a `bot.use` y el que recibe las actualizaciones.
En tales casos, esta instancia manejará el conjunto completo).
Como resultado, puedes navegar entre menús arbitrarios sin límite, todo mientras el manejo de las actualizaciones puede ocurrir en [`O(1)` complejidad de tiempo](https://en.wikipedia.org/wiki/Time_complexity#Constant_time) porque no hay necesidad de buscar a través de jerarquías enteras para encontrar el menú correcto para manejar cualquier clic de botón dado.

## Resumen del complemento

- Nombre: `menu`
- [Fuente](https://github.com/grammyjs/menu)
- [Referencia](/ref/menu/)
