---
prev: ./basics.md
next: ./api.md
---

# Context

El objeto `Context` ([Referencia de la API de grammY](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/Context)) es una parte importante de grammY.

Siempre que registres un oyente en tu objeto bot, este oyente recibirá un objeto `Context`.

```ts
bot.on("message", (ctx) => {
  // `ctx` es el objeto `Context`.
});
```

Puedes utilizar el objeto de contexto para:

- [acceder a la información sobre el mensaje](#available-information)
- [realizar acciones en respuesta al mensaje](#available-actions).

Tenga en cuenta que los objetos `Context` se llaman comúnmente `ctx`.

# Información disponible

Cuando un usuario envía un mensaje a tu bot, puedes acceder a él a través de `ctx.message`.
Como ejemplo, para obtener el texto del mensaje, puedes hacer esto:

```ts
bot.on("message", (ctx) => {
  // `ctx` será un `string` cuando se procesen mensajes de texto.
  // Será `undefined` si el mensaje recibido no tiene ningún mensaje de texto,
  // por ejemplo, fotos, pegatinas y otros mensajes.
  const txt = ctx.message.text;
});
```

Del mismo modo, puedes acceder a otras propiedades del objeto mensaje, por ejemplo `ctx.message.chat` para obtener información sobre el chat donde se envió el mensaje.
Revisa la [parte sobre `Mensajes` en la Referencia de la API de Telegram Bot](https://core.telegram.org/bots/api#message) para ver qué datos están disponibles.
Alternativamente, puedes usar simplemente el autocompletado en tu editor de código para ver las posibles opciones.

Si registras tu listener para otros tipos, `ctx` también te dará información sobre ellos.
Ejemplo:

```ts
bot.on("edited_message", (ctx) => {
  // Obtenga el nuevo texto editado del mensaje.
  const editedText = ctx.editedMessage.text;
});
```

Además, puedes obtener acceso al objeto crudo `Update` ([Referencia de la API de Telegram Bot](https://core.telegram.org/bots/api#update)) que Telegram envía a tu bot.
Este objeto de actualización (`ctx.update`) contiene todos los datos que las fuentes `ctx.message` y similares.

El objeto context siempre contiene información sobre tu bot, accesible a través de `ctx.me`.

### Atajos

Hay una serie de accesos directos instalados en el objeto de contexto.

| Atajo                 | Descripción                                                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `ctx.msg`             | Obtiene el objeto mensaje, también los editados                                                                              |
| `ctx.chat`            | Obtiene el objeto chat                                                                                                       |
| `ctx.senderChat`      | Obtiene el objeto de chat del remitente de `ctx.msg` (para mensajes anónimos de canal/grupo)                                 |
| `ctx.from`            | Obtiene el autor del mensaje, la consulta de devolución de llamada, u otras cosas                                            |
| `ctx.inlineMessageId` | Obtiene el identificador del mensaje en línea para las consultas de devolución de llamada o los resultados elegidos en línea |

En otras palabras, también puedes hacer esto:

```ts
bot.on("message", (ctx) => {
  // Obtenga el texto del mensaje.
  const text = ctx.msg.text;
});

bot.on("edited_message", (ctx) => {
  // Obtener el nuevo texto editado del mensaje.
  const editedText = ctx.msg.text;
});
```

Por lo tanto, si lo desea, puede olvidarse de `ctx.message` y `ctx.channelPost` y `ctx.editedMessage` y así sucesivamente, y sólo utilizar siempre `ctx.msg` en su lugar.

## Acciones disponibles

Si quieres responder a un mensaje de un usuario, puedes escribir esto:

```ts
bot.on("message", async (ctx) => {
  // Obtener el identificador del chat.
  const chatId = ctx.msg.chat.id;
  // El texto a responder con
  const text = "¡Recibí tu mensaje!";
  // Enviar la respuesta.
  await bot.api.sendMessage(chatId, text);
});
```

Puedes notar dos cosas que no son óptimas en esto:

1. Debemos tener acceso al objeto `bot`.
   Esto significa que tenemos que pasar el objeto `bot` por toda nuestra base de código para responder, lo cual es molesto cuando tienes más de un archivo fuente y defines tu listener en otro lugar.
2. Tenemos que sacar el identificador de chat del contexto, y pasarlo explícitamente a `sendMessage` de nuevo.
   Esto también es molesto, porque lo más probable es que siempre quieras responder al mismo usuario que envió un mensaje.
   ¡Imagina cuántas veces escribirías lo mismo una y otra vez!

En cuanto al punto 1., el objeto contexto simplemente te proporciona acceso al mismo objeto API que encuentras en `bot.api`, se llama `ctx.api`.
Ahora puedes escribir `ctx.api.sendMessage` en su lugar y ya no tienes que pasar tu objeto `bot`.
Fácil.

Sin embargo, la verdadera fuerza es arreglar el punto 2.
El objeto context te permite simplemente enviar una respuesta así:

Traducción realizada con la versión gratuita del traductor www.DeepL.com/Translator

```ts
bot.on("message", async (ctx) => {
  await ctx.reply("¡Recibí tu mensaje!");
});

// O, incluso más corto:
bot.on("message", (ctx) => ctx.reply("¡Te tengo!"));
```

¡Genial! :tada:

Bajo el capó, el contexto _ya conoce su identificador de chat_ (es decir, `ctx.msg.chat.id`), por lo que te da el método `reply` para simplemente enviar un mensaje de vuelta al mismo chat.
Internamente, `reply` vuelve a llamar a `sendMessage` con el identificador del chat pre-rellenado para ti.

::: tip Función de respuesta de Telegram
Aunque el método se llama `ctx.reply` en grammY (y en muchos otros frameworks), no utiliza la función de respuesta de Telegram donde se enlaza un mensaje anterior.

Si buscas lo que puede hacer `sendMessage` en el [Referencia Bot API de Telegram](https://core.telegram.org/bots/api#sendmessage), verás un número de opciones, como `parse_mode`, `disable_web_page_preview`, y `reply_to_message_id`.
Esta última puede utilizarse para convertir un mensaje en una respuesta:

```ts
await ctx.reply("^ ¡Esto es un mensaje!", {
  reply_to_message_id: ctx.msg.message_id,
});
```

El mismo objeto de opciones se puede pasar a `bot.api.sendMessage` y `ctx.api.sendMessage`.
Utiliza el autocompletado para ver las opciones disponibles directamente en tu editor de código.
:::

Naturalmente, todos los demás métodos de `ctx.api` tienen un acceso directo con los valores correctos precompletados, como `ctx.replyWithPhoto` para responder con una foto, o `ctx.exportChatInviteLink` para obtener un enlace de invitación para el chat correspondiente. Si quieres tener una visión general de los accesos directos que existen, el autocompletado es tu amigo, junto con la [Referencia de la API de grammY](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/Context).

Ten en cuenta que puede que no quieras reaccionar siempre en el mismo chat.
En este caso, puedes volver a utilizar los métodos `ctx.api`, y especificar todas las opciones al llamarlos.
Por ejemplo, si recibes un mensaje de Alice y quieres reaccionar enviando un mensaje a Bob, entonces no puedes usar `ctx.reply` porque siempre enviará mensajes al chat con Alice.
En su lugar, llama a `ctx.api.sendMessage` y especifica el identificador del chat de Bob.

## Cómo se crean los objetos de contexto

Cada vez que tu bot recibe un nuevo mensaje de Telegram, se envuelve en un objeto de actualización.
De hecho, los objetos de actualización no sólo pueden contener nuevos mensajes, sino también todo tipo de cosas, como ediciones de mensajes, respuestas a encuestas, y [mucho más](https://core.telegram.org/bots/api#update).

Un objeto de contexto nuevo se crea exactamente una vez para cada actualización entrante.
Los contextos para las diferentes actualizaciones son objetos completamente no relacionados, sólo hacen referencia a la misma información del bot a través de `ctx.me`.

El mismo objeto de contexto para una actualización será compartido por todo el middleware instalado ([documentación](./middleware.md)) en el bot.

## Personalización del objeto de contexto

> Si eres nuevo en los objetos de contexto, no necesitas preocuparte por el resto de esta página.

Si lo desea, puede instalar sus propias propiedades en el objeto de contexto.
Esto es posible de dos maneras:

1. Instalando [middleware](./middleware.md) que modifique el contexto (recomendado), o
2. estableciendo un constructor de contexto personalizado.

Si eliges la opción 1., debes especificar el contexto personalizado como un parámetro de tipo (omitir para JavaScript):

<CodeGroup>
  <CodeGroupItem title="Node.js" active>

```ts
import { Bot, Context } from "grammy";

// Definir un tipo de contexto personalizado.
interface MyContext extends Context {
  customProp: string | number | undefined;
}

// Pasa el tipo de contexto personalizado al constructor `Bot`.
const bot = new Bot<MyContext>("<token>");

bot.on("message", (ctx) => {
  // ¡`ctx` es ahora del tipo `MyContext`!
  const prop = ctx.customProp;
});
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";

// Definir un tipo de contexto personalizado.
interface MyContext extends Context {
  customProp: string | number | undefined;
}

// Pasa el tipo de contexto personalizado al constructor `Bot`.
const bot = new Bot<MyContext>("<token>");

bot.on("message", (ctx) => {
  // ¡`ctx` es ahora del tipo `MyContext`!
  const prop = ctx.customProp;
});
```

</CodeGroupItem>
</CodeGroup>

Naturalmente, el hecho de que el _tipo_ de contexto tenga ahora nuevas propiedades, no significa que haya realmente _valores_ detrás de ellas.
Tienes que asegurarte de que un plugin (o tu propio middleware) establece todas las propiedades correctamente para satisfacer el tipo que has especificado.

> Algunos middleware (por ejemplo, [session middleware](../plugins/session.md)) requieren que mezcles los tipos correctos en el objeto contexto, lo que puede hacerse _flavoring_ tu contexto como se explica [aquí abajo](#context-flavors).

Si eliges la opción 2., así es como estableces un constructor de contexto personalizado que se utilizará para instanciar los objetos de contexto.
Ten en cuenta que tu clase debe extender `Context`.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context } from "grammy";
import type { Update, UserFromGetMe } from "@grammyjs/types";

// Definir una clase de contexto personalizada.
class MyContext extends Context {
  // Establecer algunas propiedades personalizadas.
  public readonly customProp: number;

  constructor(update: Update, api: Api, me: UserFromGetMe) {
    super(update, api, me);
    this.customProp = me.username.length * 42;
  }
}

// Pasar el constructor de la clase de contexto personalizado como una opción.
const bot = new Bot("<token>", {
  ContextConstructor: MyContext,
});

bot.on("message", (ctx) => {
  // `ctx` es ahora de tipo `MyContext`.
  const prop = ctx.customProp;
});

bot.start();
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript" active>

```ts
const { Bot, Context } = require("grammy");

// Definir una clase de contexto personalizada.
class MyContext extends Context {
  // Establecer algunas propiedades personalizadas.
  public readonly customProp;

  constructor(update, api, me) {
    super(update, api, me);
    this.customProp = me.username.length * 42;
  }
}

// Pasar el constructor de la clase de contexto personalizado como una opción.
const bot = new Bot("<token>", {
  ContextConstructor: MyContext,
});

bot.on("message", (ctx) => {
  // `ctx` es ahora de tipo `MyContext`.
  const prop = ctx.customProp;
});

bot.start();
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import type { Update, UserFromGetMe } from "https://esm.sh/@grammyjs/types";

// Definir una clase de contexto personalizada.
class MyContext extends Context {
  // Establecer algunas propiedades personalizadas.
  public readonly customProp: number;

  constructor(update: Update, api: Api, me: UserFromGetMe) {
    super(update, api, me);
    this.customProp = me.username.length * 42;
  }
}

// Pasar el constructor de la clase de contexto personalizado como una opción.
const bot = new Bot("<token>", {
  ContextConstructor: MyContext,
});

bot.on("message", (ctx) => {
  // `ctx` es ahora de tipo `MyContext`.
  const prop = ctx.customProp;
});

bot.start();
```

</CodeGroupItem>
</CodeGroup>

::: tip Relacionado
[Middleware](./middleware.md) se refiere a una función que recibe un objeto de contexto como parámetro, como los listeners instalados.
:::

## Context Flavors

Context flavors son una forma de informar a TypeScript sobre las nuevas propiedades de su objeto de contexto.

### Additive Context Flavors

Hay dos tipos diferentes de context flavors.
El básico se llama _additive context flavor_, y siempre que hablamos de sabor de contexto, nos referimos a esta forma básica.
Veamos cómo funciona.

Por ejemplo, cuando tienes [session data](../plugins/session.md), debes registrar `ctx.session` en el tipo de contexto.
De lo contrario,

1. no puedes instalar el plugin de sesiones incorporado, y
2. no tendrás acceso a `ctx.session` en tus listeners.

> Aunque usaremos las sesiones como ejemplo aquí, cosas similares se aplican para muchas otras cosas.
> De hecho, la mayoría de los plugins te darán un context flavor que debes usar.

Un context flavor es simplemente un pequeño tipo nuevo que define las propiedades que deben añadirse al tipo de contexto.
Veamos un ejemplo de un flavor.

```ts
interface SessionFlavor<S> {
  session: S;
}
```

El tipo `SessionFlavor` ([Referencia API](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/SessionFlavor)) es sencillo: sólo define la propiedad `session`.
Toma un parámetro de tipo que definirá la estructura real de los datos de la sesión.

¿Qué utilidad tiene esto?
Así es como puedes dar flavor a tu context con session data:

```ts
import { Context, SessionFlavor } from "grammy";

// Declarar que `ctx.session` es de tipo `string`.
type MyContext = Context & SessionFlavor<string>;
```

Ahora puedes usar el plugin de sesión, y tienes acceso a `ctx.session`:

```ts
bot.on("message", (ctx) => {
  // Ahora `str` es de tipo `string`.
  const str = ctx.session;
});
```

### Transformative Context Flavors

El otro tipo de context flavor es más potente.
En lugar de instalarse con el operador `&`, deben instalarse así:

```ts
import { Context } from "grammy";
import { SomeFlavorA } from "my-plugin";

type MyContext = SomeFlavorA<Context>;
```

Todo lo demás funciona de la misma manera.

Cada plugin (oficial) indica en su documentación si debe usarse a través de un additive or via transformative context flavor.

### Combinando Diferentes Context Flavors

Si tienes diferentes [additive context flavors](#additive-context-flavors), puedes simplemente instalarlos así:

```ts
type MyContext = Context & FlavorA & FlavorB & FlavorC;
```

MultMúltiplesiple [transformative context flavors](#transformative-context-flavors) también pueden combinarse:

```ts
type MyContext = FlavorX<FlavorY<FlavorZ<Context>>>;
```

Incluso se pueden mezclar additive and transformative flavors:

```ts
type MyContext = FlavorX<
  FlavorY<
    FlavorZ<
      Context & FlavorA & FlavorB & FlavorC
    >
  >
>;
```

El orden de los context flavors no importa, puedes combinarlos en el orden que quieras.
