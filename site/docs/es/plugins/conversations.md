---
prev: false
next: false
---

# Conversaciones (`conversations`)

Cree potentes interfaces conversacionales con facilidad.

## Inicio rápido

Las conversaciones te permiten esperar mensajes.
Usa este plugin si tu bot tiene múltiples pasos.

> Las conversaciones son únicas porque introducen un concepto novedoso que no encontrarás en ninguna otra parte del mundo.
> Proporcionan una solución elegante, pero necesitarás leer un poco sobre cómo funcionan antes de entender qué hace realmente tu código.

Este es un inicio rápido para que pueda jugar con el plugin antes de que lleguemos a las partes interesantes.

:::code-group

```ts [TypeScript]
import { Bot, type Context } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";

const bot = new Bot<ConversationFlavor<Context>>(""); // <-- pon tu token de bot entre los "" (https://t.me/BotFather)
bot.use(conversations());

/** Define la conversación */
async function hello(conversation: Conversation, ctx: Context) {
  await ctx.reply("¿Qué tal? ¿Cómo te llamas?");
  const { message } = await conversation.waitFor("message:text");
  await ctx.reply(`Bienvenido al chat, ${message.text}!`);
}
bot.use(createConversation(hello));

bot.command("enter", async (ctx) => {
  // Introduce la función "hola" que has declarado.
  await ctx.conversation.enter("hello");
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { conversations, createConversation } = require(
  "@grammyjs/conversations",
);

const bot = new Bot(""); // <-- pon tu token de bot entre los "" (https://t.me/BotFather)
bot.use(conversations());

/** Define la conversación */
async function hello(conversation, ctx) {
  await ctx.reply("¿Qué tal? ¿Cómo te llamas?");
  const { message } = await conversation.waitFor("message:text");
  await ctx.reply(`Bienvenido al chat, ${message.text}!`);
}
bot.use(createConversation(hello));

bot.command("enter", async (ctx) => {
  // Introduce la función "hola" que has declarado.
  await ctx.conversation.enter("hello");
});

bot.start();
```

```ts [Deno]
import { Bot, type Context } from "https://deno.land/x/grammy/mod.ts";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations/mod.ts";

const bot = new Bot<ConversationFlavor<Context>>(""); // <-- pon tu token de bot entre los "" (https://t.me/BotFather)
bot.use(conversations());

/** Define la conversación */
async function hello(conversation: Conversation, ctx: Context) {
  await ctx.reply("¿Qué tal? ¿Cómo te llamas?");
  const { message } = await conversation.waitFor("message:text");
  await ctx.reply(`Bienvenido al chat, ${message.text}!`);
}
bot.use(createConversation(hello));

bot.command("enter", async (ctx) => {
  // Introduce la función "hola" que has declarado.
  await ctx.conversation.enter("hello");
});

bot.start();
```

:::

Cuando entras en la conversación anterior `hello`, enviará un mensaje, luego esperará un mensaje de texto por parte del usuario, y luego enviará otro mensaje.
Finalmente, la conversación se completa.

Vayamos ahora a las partes interesantes.

## Cómo funcionan las conversaciones

Eche un vistazo al siguiente ejemplo de gestión tradicional de mensajes.

```ts
bot.on("message", async (ctx) => {
  // manejar un mensaje
});
```

En los manejadores de mensajes normales, sólo tienes un único objeto de contexto en todo momento.

Compara esto con las conversaciones.

```ts
async function hello(conversation: Conversation, ctx0: Context) {
  const ctx1 = await conversation.wait();
  const ctx2 = await conversation.wait();
  // manejar tres mensajes
}
```

En esta conversación, ¡tienes tres objetos de contexto disponibles!

Al igual que los manejadores normales, el plugin de conversaciones sólo recibe un único objeto de contexto del [sistema middleware](../guide/middleware).
Ahora, de repente, pone a tu disposición tres objetos de contexto.
¿Cómo es posible?

**Las funciones del constructor de conversaciones no se ejecutan como funciones normales**.
(Aunque podamos programarlas así).

### Las conversaciones son máquinas de repetición

Las funciones del constructor de conversaciones no se ejecutan como las funciones normales.

Cuando se introduce una conversación, sólo se ejecutará hasta la primera llamada de espera.
Entonces la función se interrumpe y no se ejecutará más.
El plugin recuerda que se ha alcanzado la llamada de espera y almacena esta información.

Cuando llegue la siguiente actualización, la conversación se ejecutará de nuevo desde el principio.
Sin embargo, esta vez no se realiza ninguna de las llamadas a la API, lo que hace que su código se ejecute muy rápido y no tenga ningún efecto.
Esto se denomina _repetición_.
En cuanto se alcanza de nuevo la llamada de espera alcanzada anteriormente, la ejecución de la función se reanuda normalmente.

::: code-group

```ts [Entrada]
async function hello( //                      |
  conversation: Conversation, //              |
  ctx0: Context, //                           |
) { //                                        |
  await ctx0.reply("¡Hola!"); //           |
  const ctx1 = await conversation.wait(); //  A
  await ctx1.reply("¡Hola de nuevo!"); //
  const ctx2 = await conversation.wait(); //
  await ctx2.reply("¡Adiós!"); //
} //
```

```ts [Repetir]
async function hello( //                      .
  conversation: Conversation, //              .
  ctx0: Context, //                           .
) { //                                        .
  await ctx0.reply("¡Hola!"); //           .
  const ctx1 = await conversation.wait(); //  A
  await ctx1.reply("¡Hola de nuevo!"); //        |
  const ctx2 = await conversation.wait(); //  B
  await ctx2.reply("¡Adiós!"); //
} //
```

```ts [Repetir 2]
async function hello( //                      .
  conversation: Conversation, //              .
  ctx0: Context, //                           .
) { //                                        .
  await ctx0.reply("¡Hola!"); //           .
  const ctx1 = await conversation.wait(); //  A
  await ctx1.reply("¡Hola de nuevo!"); //        .
  const ctx2 = await conversation.wait(); //  B
  await ctx2.reply("¡Adiós!"); //            |
} //                                          —
```

:::

1. Cuando se introduce la conversación, la función se ejecutará hasta `A`.
2. Cuando llegue la siguiente actualización, la función se reproducirá hasta `A`, y se ejecutará normalmente desde `A` hasta `B`.
3. Cuando llegue la última actualización, la función se reproducirá hasta `B`, y se ejecutará normalmente hasta el final.

Esto significa que cada línea de código que escribas se ejecutará muchas veces: una vez normalmente y muchas más durante las repeticiones.
Como resultado, tienes que asegurarte de que tu código se comporta de la misma manera durante las repeticiones que cuando se ejecutó por primera vez.

Si realizas alguna llamada a la API a través de `ctx.api` (incluyendo `ctx.reply`), el plugin se encarga de ello automáticamente.
En cambio, tu propia comunicación con la base de datos necesita un tratamiento especial.

Esto se hace de la siguiente manera.

### La regla de oro de las conversaciones

Ahora que [sabemos cómo se ejecutan las conversaciones](#las-conversaciones-son-maquinas-de-repeticion), podemos definir una regla que se aplica al código que escribes dentro de una función constructora de conversación.
Debes seguirla si quieres que tu código se comporte correctamente.

::: warning LA REGLA DE ORO

**El código que se comporte de forma diferente entre repeticiones debe estar envuelto en [`conversation.external`](/ref/conversations/conversation#external).**

:::

Así se aplica:

```ts
// MAL
const response = await accessDatabase();
// BUENO
const response = await conversation.external(() => accessDatabase());
```

Escapar de una parte de su código a través de [`conversation.external`](/ref/conversations/conversation#external) indica al complemento que esta parte del código debe omitirse durante las repeticiones.
El valor de retorno del código envuelto es almacenado por el complemento y reutilizado durante las siguientes repeticiones.
En el ejemplo anterior, esto evita el acceso repetido a la base de datos.

USE `conversation.external` cuando ...

- leer o escribir en archivos, bases de datos/sesiones, la red o el estado global,
- llamar a `Math.random()` o `Date.now()`,
- realizar llamadas a la API en `bot.api` u otras instancias independientes de `Api`.

NO UTILICE `conversation.external` cuando ...

- llamar a `ctx.reply` u otras [acciones del contexto](../guide/context#acciones-disponibles),
- llamar a `ctx.api.sendMessage` u otros métodos de la [Bot API](https://core.telegram.org/bots/api) a través de `ctx.api`.

El plugin de conversaciones proporciona algunos métodos convenientes alrededor de `conversation.external`.
Esto no sólo simplifica el uso de `Math.random()` y `Date.now()`, sino que también simplifica la depuración al proporcionar una forma de suprimir los registros durante una repetición.

```ts
// await conversation.external(() => Math.random());
const rnd = await conversation.random();
// await conversation.external(() => Date.now());
const now = await conversation.now();
// await conversation.external(() => console.log("abc"));
await conversation.log("abc");
```

¿Cómo pueden `conversation.wait` y `conversation.external` recuperar los valores originales cuando se produce una repetición?
El plugin tiene que recordar de alguna manera estos datos, ¿verdad?

Sí.

### Almacenar Estado en Conversaciones

Se almacenan dos tipos de datos en una base de datos.
Por defecto, utiliza una base de datos ligera en memoria que se basa en un `Mapa`, pero se puede [utilizar una base de datos persistente](#persistencia-de-las-conversaciones) fácilmente.

1. El plugin de conversaciones almacena todas las actualizaciones.
2. El plugin de conversaciones almacena todos los valores de retorno de `conversation.external` y los resultados de todas las llamadas a la API.

Esto no es un problema si sólo tienes unas pocas docenas de actualizaciones en una conversación.
(Recuerda que durante un sondeo largo, cada llamada a `getUpdates` recupera también hasta 100 actualizaciones).

Sin embargo, si tu conversación nunca sale, estos datos se acumularán y ralentizarán tu bot.
**Evita los bucles infinitos.**

### Objetos de contexto conversacional

Cuando se ejecuta una conversación, ésta utiliza las actualizaciones persistentes para generar nuevos objetos de contexto desde cero.
**Estos objetos de contexto son diferentes del objeto de contexto en el middleware circundante.**
Para el código TypeScript, esto también significa que ahora tienes dos [sabores](../guide/context#context-flavors) de objetos de contexto.

- Los **objetos de contexto externos** son los objetos de contexto que tu bot utiliza en el middleware.
  Te dan acceso a `ctx.conversation.enter`.
  Para TypeScript, al menos tendrán instalado `ConversationFlavor`.
  Los objetos de contexto externos también tendrán otras propiedades definidas por los plugins que hayas instalado a través de `bot.use`.
- Los **objetos de contexto internos** (también llamados **objetos de contexto conversacional**) son los objetos de contexto creados por el plugin de conversaciones.
  Nunca pueden tener acceso a `ctx.conversation.enter`, y por defecto, tampoco tienen acceso a ningún plugin.
  Si quieres tener propiedades personalizadas en objetos de contexto inside, [desplázate hacia abajo](#uso-de-plugins-dentro-de-conversaciones).

Tienes que pasar tanto el tipo de contexto exterior como el interior a la conversación.
Por lo tanto, la configuración de TypeScript suele ser la siguiente:

::: code-group

```ts [Node.js]
import { Bot, type Context } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
} from "@grammyjs/conversations";

// Objetos de contexto externos (conoce todos los plugins de middleware)
type MyContext = ConversationFlavor<Context>;
// Dentro de los objetos de contexto (conoce todos los plugins de conversación)
type MyConversationContext = Context;

// Utilice el tipo de contexto exterior para su bot.
const bot = new Bot<MyContext>(""); // <-- pon tu bot token entre los "" (https://t.me/BotFather)

// Utilice tanto el tipo exterior como el interior para su conversación.
type MyConversation = Conversation<MyContext, MyConversationContext>;

// Define tu conversación.
async function example(
  conversation: MyConversation,
  ctx0: MyConversationContext,
) {
  // Todos los objetos de contexto dentro de la conversación son
  // de tipo `MyConversationContext`.
  const ctx1 = await conversation.wait();

  // Se puede acceder al objeto de contexto externo
  // a través de `conversation.external` y se infiere que es
  // de tipo `MyContext`.
  const session = await conversation.external((ctx) => ctx.session);
}
```

```ts [Deno]
import { Bot, type Context } from "https://deno.land/x/grammy/mod.ts";
import {
  type Conversation,
  type ConversationFlavor,
} from "https://deno.land/x/grammy_conversations/mod.ts";

// Objetos de contexto externos (conoce todos los plugins de middleware)
type MyContext = ConversationFlavor<Context>;
// Dentro de los objetos de contexto (conoce todos los plugins de conversación)
type MyConversationContext = Context;

// Utilice el tipo de contexto exterior para su bot.
const bot = new Bot<MyContext>(""); // <-- pon tu bot token entre los "" (https://t.me/BotFather)

// Utilice tanto el tipo exterior como el interior para su conversación
type MyConversation = Conversation<MyContext, MyConversationContext>;

// Define tu conversación.
async function example(
  conversation: MyConversation,
  ctx0: MyConversationContext,
) {
  // Todos los objetos de contexto dentro de la conversación son
  // de tipo `MyConversationContext`.
  const ctx1 = await conversation.wait();

  // Se puede acceder al objeto de contexto externo
  // a través de `conversation.external` y se infiere que es
  // de tipo `MyContext`.
  const session = await conversation.external((ctx) => ctx.session);
}
```

:::

> En el ejemplo anterior, no hay plugins instalados en la conversación.
> En cuanto empieces a [instalarlos](#uso-de-plugins-dentro-de-conversaciones), la definición de `MyConversationContext` dejará de ser el tipo desnudo `Context`.

Naturalmente, si tienes varias conversaciones y quieres que los tipos de contexto difieran entre ellas, puedes definir varios tipos de contexto de conversación.

¡Enhorabuena!
Si has entendido todo lo anterior, las partes difíciles han terminado.
El resto de la página es sobre la riqueza de características que este plugin proporciona.

## Introducir conversaciones

Las conversaciones pueden introducirse desde un manejador normal.

Por defecto, una conversación tiene el mismo nombre que el [nombre](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name) de la función.
Opcionalmente, puedes renombrarla al instalarla en tu bot.

Opcionalmente, puedes pasar argumentos a la conversación.
Ten en cuenta que los argumentos se almacenarán como una cadena JSON, por lo que debes asegurarte de que se pueden pasar de forma segura a `JSON.stringify`.

También se puede entrar en las conversaciones desde otras conversaciones haciendo una llamada normal a una función JavaScript.
En ese caso, obtienen acceso a un potencial valor de retorno de la conversación llamada.
Esto no está disponible cuando entras en una conversación desde dentro de un middleware.

:::code-group

```ts [TypeScript]
/**
 * Devuelve la respuesta a la vida, el universo y todo.
 * Este valor sólo es accesible cuando la conversación
 * es llamada desde otra conversación.
 */
async function convo(conversation: Conversation, ctx: Context) {
  await ctx.reply("Computando respuesta");
  return 42;
}
/** Acepta dos argumentos (deben ser serializables en JSON) */
async function args(
  conversation: Conversation,
  ctx: Context,
  answer: number,
  config: { text: string },
) {
  const truth = await convo(conversation, ctx);
  if (answer === truth) {
    await ctx.reply(config.text);
  }
}
bot.use(createConversation(convo, "new-name"));
bot.use(createConversation(args));

bot.command("enter", async (ctx) => {
  await ctx.conversation.enter("new-name");
});
bot.command("enter_with_arguments", async (ctx) => {
  await ctx.conversation.enter("args", 42, { text: "foo" });
});
```

```js [JavaScript]
/**
 * Devuelve la respuesta a la vida, el universo y todo.
 * Este valor sólo es accesible cuando la conversación
 * es llamada desde otra conversación.
 */
async function convo(conversation, ctx) {
  await ctx.reply("Computing answer");
  return 42;
}
/** Acepta dos argumentos (deben ser serializables en JSON) */
async function args(conversation, ctx, answer, config) {
  const truth = await convo(conversation, ctx);
  if (answer === truth) {
    await ctx.reply(config.text);
  }
}
bot.use(createConversation(convo, "new-name"));
bot.use(createConversation(args));

bot.command("enter", async (ctx) => {
  await ctx.conversation.enter("new-name");
});
bot.command("enter_with_arguments", async (ctx) => {
  await ctx.conversation.enter("args", 42, { text: "foo" });
});
```

:::

::: warning Falta de Seguridad de Tipo para Argumentos

Comprueba que has utilizado las anotaciones de tipo correctas para los parámetros de tu conversación, y que le has pasado argumentos coincidentes en tu llamada `enter`.
El plugin no es capaz de comprobar ningún tipo más allá de `conversation` y `ctx`.

:::

Recuerda que [el orden de tu middleware importa](../guide/middleware).
Sólo puedes entrar en conversaciones que hayan sido instaladas antes del manejador que llama a `enter`.

## Esperar actualizaciones

El tipo más básico de llamada de espera se limita a esperar cualquier actualización.

```ts
const ctx = await conversation.wait();
```

Simplemente devuelve un objeto de contexto.
Todas las demás llamadas wait se basan en esto.

### Llamadas de espera filtradas

Si desea esperar un tipo específico de actualización, puede utilizar una llamada de espera filtrada.

```ts
// Coincide con una consulta de filtro como con `bot.on`.
const message = await conversation.waitFor("message");
// Espera el texto como con `bot.hears`.
const hears = await conversation.waitForHears(/regex/);
// Espera comandos como con `bot.command`.
const start = await conversation.waitForCommand("start");
// etc
```

Eche un vistazo a la referencia de la API para ver [todas las formas disponibles de filtrar las llamadas de espera](/ref/conversations/conversation#wait).

Las llamadas de espera filtradas están garantizadas para devolver sólo las actualizaciones que coincidan con el filtro respectivo.
Si el bot recibe una actualización que no coincide, será descartada.
Puedes pasar una función callback que será invocada en este caso.

```ts
const message = await conversation.waitFor(":photo", {
  otherwise: (ctx) => ctx.reply("¡Por favor, envíenos una foto."),
});
```

Todas las llamadas de espera filtradas pueden encadenarse para filtrar varias cosas a la vez.

```ts
// Esperar una foto con un pie de foto específico
let photoWithCaption = await conversation.waitFor(":photo")
  .andForHears("XY");
// Trate cada caso con una función distinta:
photoWithCaption = await conversation
  .waitFor(":photo", { otherwise: (ctx) => ctx.reply("Sin foto") })
  .andForHears("XY", { otherwise: (ctx) => ctx.reply("Mal pie de foto") });
```

Si sólo especifica `otherwise` en una de las llamadas de espera encadenadas, sólo se invocará si ese filtro específico abandona la actualización.

### Inspección de los objetos de contexto

Es muy habitual [desestructurar](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring) los objetos de contexto recibidos.
A continuación, puede realizar otras comprobaciones de los datos recibidos.

```ts
const { message } = await conversation.waitFor("message");
if (message.photo) {
  // Manejar mensaje con foto
}
```

Las conversaciones también son un lugar ideal para utilizar [las comprobaciones](../guide/context#probar-a-traves-de-comprobaciones-has).

## Salir de una conversación

La forma más sencilla de salir de una conversación es volver de ella.
Lanzar un error también finaliza la conversación.

Si esto no es suficiente, puedes detener manualmente la conversación en cualquier momento.

```ts
async function convo(conversation: Conversation, ctx: Context) {
  // Todas las ramas salen de la conversación:
  if (ctx.message?.text === "return") {
    return;
  } else if (ctx.message?.text === "error") {
    throw new Error("boom");
  } else {
    await conversation.halt(); // nunca returns
  }
}
```

También puedes salir de una conversación desde tu middleware.

```ts
bot.use(conversations());
bot.command("clean", async (ctx) => {
  await ctx.conversation.exit("convo");
});
```

Incluso puedes hacerlo _antes_ de que la conversación objetivo esté instalada en tu sistema middleware.
Basta con tener instalado el propio plugin de conversaciones.

## Sólo es JavaScript

Con [efectos secundarios fuera del camino](#la-regla-de-oro-de-las-conversaciones), las conversaciones son sólo funciones normales de JavaScript.
Puede que se ejecuten de formas extrañas, pero al desarrollar un bot, normalmente puedes olvidarte de esto.
Toda la sintaxis normal de JavaScript funciona.

La mayoría de las cosas en esta sección son obvias si has utilizado conversaciones durante algún tiempo.
Sin embargo, si eres nuevo, algunas de estas cosas podrían sorprenderte.

### Variables, bifurcaciones y bucles

Puedes utilizar variables normales para almacenar el estado entre actualizaciones.
Puedes usar bifurcaciones con `if` o `switch`.
Los bucles mediante `for` y `while` también funcionan.

```ts
await ctx.reply("¡Envíame tus números favoritos, separados por comas!");
const { message } = await conversation.waitFor("message:text");
const numbers = message.text.split(",");
let sum = 0;
for (const str of numbers) {
  const n = parseInt(str.trim(), 10);
  if (!isNaN(n)) {
    sum += n;
  }
}
await ctx.reply("La suma de estos números es: " + sum);
```

Es sólo JavaScript.

### Funciones y recursión

Puedes dividir una conversación en múltiples funciones.
Pueden llamarse unas a otras e incluso hacer recursión.
(De hecho, el plugin ni siquiera sabe que has usado funciones).

Aquí está el mismo código anterior, refactorizado a funciones.

:::code-group

```ts [TypeScript]
/** Una conversación para sumar números */
async function sumConvo(conversation: Conversation, ctx: Context) {
  await ctx.reply("¡Envíame tus números favoritos, separados por comas!");
  const { message } = await conversation.waitFor("message:text");
  const numbers = message.text.split(",");
  await ctx.reply("La suma de estos números es: " + sumStrings(numbers));
}

/** Convierte todas las cadenas dadas en números y las suma */
function sumStrings(numbers: string[]): number {
  let sum = 0;
  for (const str of numbers) {
    const n = parseInt(str.trim(), 10);
    if (!isNaN(n)) {
      sum += n;
    }
  }
  return sum;
}
```

```js [JavaScript]
/** Una conversación para sumar números */
async function sumConvo(conversation, ctx) {
  await ctx.reply("¡Envíame tus números favoritos, separados por comas!");
  const { message } = await conversation.waitFor("message:text");
  const numbers = message.text.split(",");
  await ctx.reply("La suma de estos números es: " + sumStrings(numbers));
}

/** Convierte todas las cadenas dadas en números y las suma */
function sumStrings(numbers) {
  let sum = 0;
  for (const str of numbers) {
    const n = parseInt(str.trim(), 10);
    if (!isNaN(n)) {
      sum += n;
    }
  }
  return sum;
}
```

:::

Es sólo JavaScript.

### Módulos y clases

JavaScript dispone de funciones de orden superior, clases y otras formas de estructurar el código en módulos.
Naturalmente, todas ellas pueden convertirse en conversaciones.

Aquí está el código anterior una vez más, refactorizado a un módulo con inyección de dependencia simple.

::: code-group

```ts [TypeScript]
/**
 * Un módulo que puede pedir números al usuario, y que
 * proporciona una manera de sumar los números enviados por el usuario.
 *
 * Requiere que se inyecte un manejador de conversación.
 */
function sumModule(conversation: Conversation) {
  /** Convierte todas las cadenas dadas en números y las suma */
  function sumStrings(numbers) {
    let sum = 0;
    for (const str of numbers) {
      const n = parseInt(str.trim(), 10);
      if (!isNaN(n)) {
        sum += n;
      }
    }
    return sum;
  }

  /** Pide números al usuario */
  async function askForNumbers(ctx: Context) {
    await ctx.reply("¡Envíame tus números favoritos, separados por comas!");
  }

  /** Espera a que el usuario envíe números y responde con su suma */
  async function sumUserNumbers() {
    const ctx = await conversation.waitFor(":text");
    const sum = sumStrings(ctx.msg.text);
    await ctx.reply("La suma de estos números es: " + sum);
  }

  return { askForNumbers, sumUserNumbers };
}

/** Una conversación para sumar números */
async function sumConvo(conversation: Conversation, ctx: Context) {
  const mod = sumModule(conversation);
  await mod.askForNumbers(ctx);
  await mod.sumUserNumbers();
}
```

```js [JavaScript]
/**
 * Un módulo que puede pedir números al usuario, y que
 * proporciona una manera de sumar los números enviados por el usuario.
 *
 * Requiere que se inyecte un manejador de conversación.
 */
function sumModule(conversation: Conversation) {
  /** Convierte todas las cadenas dadas en números y las suma */
  function sumStrings(numbers) {
    let sum = 0;
    for (const str of numbers) {
      const n = parseInt(str.trim(), 10);
      if (!isNaN(n)) {
        sum += n;
      }
    }
    return sum;
  }

  /** Pide números al usuario */
  async function askForNumbers(ctx: Context) {
    await ctx.reply("¡Envíame tus números favoritos, separados por comas!");
  }

  /** Espera a que el usuario envíe números y responde con su suma */
  async function sumUserNumbers() {
    const ctx = await conversation.waitFor(":text");
    const sum = sumStrings(ctx.msg.text);
    await ctx.reply("La suma de estos números es: " + sum);
  }

  return { askForNumbers, sumUserNumbers };
}

/** Una conversación para sumar números */
async function sumConvo(conversation: Conversation, ctx: Context) {
  const mod = sumModule(conversation);
  await mod.askForNumbers(ctx);
  await mod.sumUserNumbers();
}
```

:::

Está claro que es una exageración para una tarea tan sencilla como sumar unos cuantos números.
Sin embargo, ilustra un punto más amplio.

Lo has adivinado:
Es sólo JavaScript.

## Persistencia de las conversaciones

Por defecto, todos los datos almacenados por el plugin de conversaciones se mantienen en memoria.
Esto significa que cuando su proceso muere, todas las conversaciones son abandonadas y tendrán que ser reiniciadas.

Si quieres mantener los datos a través de reinicios del servidor, necesitas conectar el plugin de conversaciones a una base de datos.
Hemos construido [un montón de adaptadores de almacenamiento diferentes](https://github.com/grammyjs/storages/tree/main/packages#grammy-storages) para hacer esto simple.
(Son los mismos adaptadores que utiliza el [plugin de sesión](./session#adaptadores-de-almacenamiento-conocidos).).

Digamos que quieres almacenar datos en disco en un directorio llamado `convo-data`.
Esto significa que necesitas el [`FileAdapter`](https://github.com/grammyjs/storages/tree/main/packages/file#installation).

::: code-group

```ts [Node.js]
import { FileAdapter } from "@grammyjs/storage-file";

bot.use(conversations({
  storage: new FileAdapter({ dirName: "convo-data" }),
}));
```

```ts [Deno]
import { FileAdapter } from "https://deno.land/x/grammy_storages/file/src/mod.ts";

bot.use(conversations({
  storage: new FileAdapter({ dirName: "convo-data" }),
}));
```

:::

Listo.

Puedes utilizar cualquier adaptador de almacenamiento que sea capaz de almacenar datos de tipo [`VersionedState`](/ref/conversations/versionedstate) o [`ConversationData`](/ref/conversations/conversationdata).
Ambos tipos pueden importarse desde el plugin de conversaciones.
En otras palabras, si desea extraer el almacenamiento a una variable, puede utilizar la siguiente anotación de tipo.

```ts
const storage = new FileAdapter<VersionedState<ConversationData>>({
  dirName: "convo-data",
});
```

Naturalmente, los mismos tipos pueden utilizarse con cualquier otro adaptador de almacenamiento.

### Versionado de datos

Si persistes el estado de la conversación en una base de datos y luego actualizas el código fuente, se produce un desajuste entre los datos almacenados y la función del constructor de la conversación.
Esto es una forma de corrupción de datos y romperá la reproducción.

Puedes evitarlo especificando una versión de tu código.
Cada vez que cambies tu conversación, puedes incrementar la versión.
El plugin de conversaciones detectará entonces un desajuste de versión y migrará todos los datos automáticamente.

```ts
bot.use(conversations({
  storage: {
    type: "key",
    version: 42, // puede ser un número o una cadena
    adapter: storageAdapter,
  },
}));
```

Si no se especifica una versión, el valor por defecto es `0`.

::: tip ¿Ha olvidado cambiar la versión? No te preocupes.

El plugin de conversaciones ya cuenta con buenas protecciones que deberían detectar la mayoría de los casos de corrupción de datos.
Si esto se detecta, se produce un error en algún lugar dentro de la conversación, lo que hace que la conversación se bloquee.
Suponiendo que no detectes y suprimas ese error, la conversación borrará los datos dañados y se reiniciará correctamente.

Dicho esto, esta protección no cubre el 100 % de los casos, por lo que deberías asegurarte de actualizar el número de versión en el futuro.

:::

### Datos no serializables

[Recuerda](#almacenar-estado-en-conversaciones) que todos los datos devueltos desde [`conversation.external`](/ref/conversations/conversation#external) serán almacenados.
Esto significa que todos los datos devueltos desde `conversation.external` deben ser serializables.

Si quieres devolver datos que no se pueden serializar, como clases o [`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt), puedes proporcionar un serializador personalizado para solucionarlo.

```ts
const largeNumber = await conversation.external({
  // Llama a una API que devuelve un BigInt (no se puede convertir a JSON).
  task: () => 1000n ** 1000n,
  // Convierte bigint a cadena para su almacenamiento.
  beforeStore: (n) => String(n),
  // Convierte una cadena a bigint para su uso.
  afterLoad: (str) => BigInt(str),
});
```

Si quieres lanzar un error desde la tarea, puedes especificar funciones de serialización adicionales para los objetos de error.
Consulta [`ExternalOp`](/ref/conversations/externalop) en la referencia de la API.

### Claves de almacenamiento

Por defecto, los datos de conversación se almacenan por chat.
Esto es idéntico a [cómo funciona el plugin de sesión](./session#claves-de-sesion).

Como resultado, una conversación no puede manejar actualizaciones de múltiples chats.
Si lo desea, puede [definir su propia función de clave de almacenamiento](/ref/conversations/conversationoptions#storage).
Al igual que con las sesiones, [no se recomienda](./session#claves-de-sesion) utilizar esta opción en entornos sin servidor debido a posibles race conditions.

Además, al igual que con las sesiones, puedes almacenar los datos de tus conversaciones bajo un espacio de nombres utilizando la opción `prefix`.
Esto es especialmente útil si quieres usar el mismo adaptador de almacenamiento tanto para tus datos de sesión como para tus datos de conversaciones.
Almacenar los datos en espacios de nombres evitará que se mezclen.

Puedes especificar ambas opciones de la siguiente manera.

```ts
bot.use(conversations({
  storage: {
    type: "key",
    adapter: storageAdapter,
    getStorageKey: (ctx) => ctx.from?.id.toString(),
    prefix: "convo-",
  },
}));
```

Si se introduce una conversación para un usuario con el identificador de usuario `424242`, la clave de almacenamiento será ahora `convo-424242`.

Consulta la referencia API para [`ConversationStorage`](/ref/conversations/conversationstorage) para ver más detalles sobre el almacenamiento de datos con el complemento de conversaciones.
Entre otras cosas, explicará cómo almacenar datos sin una función de clave de almacenamiento utilizando `type: "context"`.

## Uso de plugins dentro de conversaciones

[Recuerda](#objetos-de-contexto-conversacional) que los objetos de contexto dentro de las conversaciones son independientes de los objetos de contexto en el middleware circundante.
Esto significa que no tendrán plugins instalados en ellos por defecto---incluso si los plugins están instalados en tu bot.

Afortunadamente, todos los plugins de grammY [excepto sessions](#acceso-a-sesiones-dentro-de-conversaciones) son compatibles con las conversaciones.
Por ejemplo, así es como puedes instalar el plugin [hydrate](./hydrate) para una conversación.

::: code-group

```ts [TypeScript]
// Instale sólo el plugin de conversaciones en el exterior.
type MyContext = ConversationFlavor<Context>;
// Instale sólo el plugin de hidratos en su interior.
type MyConversationContext = HydrateFlavor<Context>;

bot.use(conversations());

// Pasa el objeto de contexto exterior e interior.
type MyConversation = Conversation<MyContext, MyConversationContext>;
async function convo(conversation: MyConversation, ctx: MyConversationContext) {
  // El plugin hydrate está instalado en `ctx` aquí.
  const other = await conversation.wait();
  // El plugin hydrate está instalado en `other` aquí también.
}
bot.use(createConversation(convo, { plugins: [hydrate()] }));

bot.command("enter", async (ctx) => {
  // El plugin hydrate NO está instalado en `ctx` aquí.
  await ctx.conversation.enter("convo");
});
```

```js [JavaScript]
bot.use(conversations());

async function convo(conversation, ctx) {
  // El plugin hydrate está instalado en `ctx` aquí.
  const other = await conversation.wait();
  // El plugin hydrate está instalado en `other` aquí también.
}
bot.use(createConversation(convo, { plugins: [hydrate()] }));

bot.command("enter", async (ctx) => {
  // El plugin hydrate NO está instalado en `ctx` aquí.
  await ctx.conversation.enter("convo");
});
```

:::

En el [middleware normal](../guide/middleware), los plugins ejecutan código en el objeto de contexto actual, luego llaman a `next` para esperar al middleware siguiente, y luego ejecutan código de nuevo.

Las conversaciones no son middleware, y los plugins no pueden interactuar con las conversaciones de la misma manera que con el middleware.
Cuando un [objeto de contexto es creado](#objetos-de-contexto-conversacional) por la conversación, será pasado a los plugins que pueden procesarlo normalmente.
Para los plugins, parecerá que sólo los plugins están instalados y que no existen manejadores aguas abajo.
Una vez que todos los plugins han terminado, el objeto de contexto se pone a disposición de la conversación.

Como resultado, cualquier trabajo de limpieza realizado por los plugins se lleva a cabo antes de que se ejecute la función de construcción de la conversación.
Todos los plugins excepto las sesiones funcionan bien con esto.
Si quieres usar sesiones, [desplázate hacia abajo](#acceso-a-sesiones-dentro-de-conversaciones).

### Plugins por defecto

Si tienes muchas conversaciones que necesitan el mismo conjunto de plugins, puedes definir plugins por defecto.
Ahora, ya no tienes que pasar `hydrate` a `createConversation`.

::: code-group

```ts [TypeScript]
// TypeScript necesita algo de ayuda con los dos tipos de contexto
// por lo que a menudo hay que especificarlos para usar plugins.
bot.use(conversations<MyContext, MyConversationContext>({
  plugins: [hydrate()],
}));
// La siguiente conversación tendrá hidrato instalado.
bot.use(createConversation(convo));
```

```js [JavaScript]
bot.use(conversations({
  plugins: [hydrate()],
}));
// La siguiente conversación tendrá hidrato instalado.
bot.use(createConversation(convo));
```

:::

Asegúrese de instalar los sabores de contexto de todos los plugins por defecto en los tipos de contexto interiores de todas las conversaciones.

### Uso de Plugins Transformadores dentro de Conversaciones

Si instalas un plugin a través de `bot.api.config.use`, entonces no puedes pasarlo al array `plugins` directamente.
En su lugar, tienes que instalarlo en la instancia `Api` de cada objeto de contexto.
Esto se hace fácilmente desde dentro de un plugin middleware normal.

```ts
bot.use(createConversation(convo, {
  plugins: [async (ctx, next) => {
    ctx.api.config.use(transformer);
    await next();
  }],
}));
```

Sustituye `transformer` por el plugin que quieras instalar.
Puede instalar varios transformadores en la misma llamada a `ctx.api.config.use`.

### Acceso a sesiones dentro de conversaciones

Debido a la forma en que [funcionan los plugins dentro de las conversaciones](#uso-de-plugins-dentro-de-conversaciones), el plugin [session](./session) no puede ser instalado dentro de una conversación de la misma forma que otros plugins.
No puedes pasarlo al array `plugins` porque podría:

1. leer datos,
2. llamaría a `next` (que resuelve inmediatamente),
3. volvería a escribir exactamente los mismos datos, y
4. entregar el contexto a la conversación.

Observa cómo la sesión se guarda antes de que la cambies.
Esto significa que todos los cambios en los datos de la sesión se pierden.

En su lugar, puedes usar `conversation.external` para obtener [acceso al objeto de contexto externo](#objetos-de-contexto-conversacional).
Tiene instalado el plugin de sesión.

```ts
// Leer datos de sesión dentro de una conversación.
const session = await conversation.external((ctx) => ctx.session);

// Cambiar los datos de sesión dentro de una conversación.
session.count += 1;

// Guardar los datos de sesión dentro de una conversación.
await conversation.external((ctx) => {
  ctx.session = session;
});
```

En cierto sentido, utilizar el complemento de sesión puede verse como una forma de realizar efectos secundarios.
Después de todo, las sesiones acceden a una base de datos.
Dado que debemos seguir [La Regla de Oro](#la-regla-de-oro-de-las-conversaciones), sólo tiene sentido que el acceso a la sesión necesita ser envuelto dentro de `conversation.external`.

## Menús conversacionales

Puedes definir un menú con el plugin [menu](./menu) fuera de una conversación, y luego pasarlo al array `plugins` [como cualquier otro plugin](#uso-de-plugins-dentro-de-conversaciones).

Sin embargo, esto significa que el menú no tiene acceso al manejador de conversación `conversation` en sus manejadores de botón.
Como resultado, no puedes esperar actualizaciones desde dentro de un menú.

Idealmente, cuando se pulsa un botón, debería ser posible esperar un mensaje del usuario, y luego realizar la navegación del menú cuando el usuario responde.
Esto es posible gracias a `conversation.menu()`.
Te permite definir _menús conversacionales_.

```ts
let email = "";

const emailMenu = conversation.menu()
  .text("Obtener correo electrónico", (ctx) => ctx.reply(email || "empty"))
  .text(
    () =>
      email ? "Cambiar correo electrónico" : "Establecer correo electrónico",
    async (ctx) => {
      await ctx.reply("¿Cuál es su correo electrónico?");
      const response = await conversation.waitFor(":text");
      email = response.msg.text;
      await ctx.reply(`Su correo electrónico es ${email}!`);
      ctx.menu.update();
    },
  )
  .row()
  .url("Acerca de", "https://grammy.dev");

const otherMenu = conversation.menu()
  .submenu("Ir al menú de correo electrónico", emailMenu, async (ctx) => {
    await ctx.reply("Navegando");
  });

await ctx.reply("Este es su menú", {
  reply_markup: otherMenu,
});
```

`conversation.menu()` devuelve un menú que se puede construir añadiendo botones de la misma forma que lo hace el plugin de menú.
De hecho, si miras [`ConversationMenuRange`](/ref/conversations/conversationmenurange) en la referencia API, verás que es muy similar a [`MenuRange`](/ref/menu/menurange) del plugin de menús.

Los menús conversacionales permanecen activos sólo mientras está activa la conversación.
Debes llamar a `ctx.menu.close()` para todos los menús antes de salir de la conversación.

Si quieres evitar que la conversación se cierre, puedes utilizar el siguiente fragmento de código al final de la conversación.
Sin embargo, [recuerda](#almacenar-estado-en-conversaciones) que es una mala idea dejar que tu conversación viva para siempre.

```ts
// Espera para siempre.
await conversation.waitUntil(() => false, {
  otherwise: (ctx) => ctx.reply("¡Utilice el menú de arriba!"),
});
```

Por último, ten en cuenta que se garantiza que los menús conversacionales nunca interferirán con los menús externos.
En otras palabras, un menú externo nunca gestionará la actualización de un menú dentro de una conversación, y viceversa.

### Interoperabilidad de los complementos de menú

Cuando defines un menú fuera de una conversación y lo utilizas para entrar en una conversación, puedes definir un menú conversacional que tome el control mientras la conversación esté activa.
Cuando la conversación finalice, el menú externo volverá a tomar el control.

Primero tienes que dar el mismo identificador de menú a ambos menús.

```ts
// Conversación exterior (complemento del menú):
const menu = new Menu("my-menu");
// Conversación interna (plugin de conversaciones):
const menu = conversation.menu("my-menu");
```

Para que esto funcione, debes asegurarte de que ambos menús tienen exactamente la misma estructura cuando realizas la transición del control dentro o fuera de la conversación.
De lo contrario, cuando se pulse un botón, el menú será [detectado como obsoleto](./menu#menus-y-huellas-anticuadas), y no se llamará al manejador del botón.

La estructura se basa en las dos cosas siguientes.

- La forma del menú (número de filas, o número de botones en cualquier fila).
- La etiqueta del botón.

Normalmente es aconsejable editar primero el menú a una forma que tenga sentido dentro de la conversación tan pronto como entres en la conversación.
La conversación puede entonces definir un menú coincidente que estará activo inmediatamente.

Del mismo modo, si la conversación deja atrás algún menú (por no cerrarlo), los menús externos pueden volver a tomar el control.
De nuevo, la estructura de los menús tiene que coincidir.

Puedes encontrar un ejemplo de esta interoperabilidad en el [repositorio de bots de ejemplo](https://github.com/grammyjs/examples?tab=readme-ov-file#menus-with-conversation-menu-with-conversation).

## Formularios conversacionales

A menudo, las conversaciones se utilizan para construir formularios en la interfaz de chat.

Todas las llamadas de espera devuelven objetos de contexto.
Sin embargo, cuando esperas un mensaje de texto, es posible que sólo quieras obtener el texto del mensaje y no interactuar con el resto del objeto de contexto.

Los formularios de conversación te ofrecen una forma de combinar la validación de actualizaciones con la extracción de datos del objeto de contexto.
Esto se asemeja a un campo en un formulario.
Considere el siguiente ejemplo.

```ts
await ctx.reply("¡Por favor, envíame una foto para que pueda reducirla!");
const photo = await conversation.form.photo();
await ctx.reply("¿Cuál debería ser la nueva anchura de la foto?");
const width = await conversation.form.int();
await ctx.reply("¿Cuál debería ser la nueva altura de la foto?");
const height = await conversation.form.int();
await ctx.reply(`Escalando la foto a ${width}x${height} ...`);
const scaled = await scaleImage(photo, width, height);
await ctx.replyWithPhoto(scaled);
```

Hay muchos más campos de formulario disponibles.
Consulta [`ConversationForm`](/ref/conversations/conversationform#methods) en la referencia API.

Todos los campos de formulario toman una función `otherwise` que se ejecutará cuando se reciba una actualización que no coincida.
Además, todos toman una función `action` que se ejecutará cuando el campo del formulario se haya rellenado correctamente.

```ts
// Espera una operación de cálculo básico.
const op = await conversation.form.select(["+", "-", "*", "/"], {
  action: (ctx) => ctx.deleteMessage(),
  otherwise: (ctx) => ctx.reply("Previsto +, -, *, or /!"),
});
```

Los formularios conversacionales permiten incluso crear campos de formulario personalizados a través de [`conversation.form.build`](/ref/conversations/conversationform#build).

## Tiempos de espera

Cada vez que espere una actualización, puede pasar un valor de tiempo de espera.

```ts
// Espere sólo una hora antes de salir de la conversación.
const oneHourInMilliseconds = 60 * 60 * 1000;
await conversation.wait({ maxMilliseconds: oneHourInMilliseconds });
```

Cuando se alcanza la llamada de espera, se llama a [`conversation.now()`](#la-regla-de-oro-de-las-conversaciones).

Tan pronto como llega la siguiente actualización, se vuelve a llamar a `conversation.now()`.
Si la actualización tarda más de `maxMilliseconds` en llegar, la conversación se detiene, y la actualización se devuelve al sistema middleware.
Cualquier middleware posterior será llamado.

Esto hará que parezca que la conversación ya no estaba activa en el momento en que llegó la actualización.

Ten en cuenta que esto no ejecutará ningún código exactamente después del tiempo especificado.
En su lugar, el código sólo se ejecutará tan pronto como llegue la siguiente actualización.

Puedes especificar un valor de tiempo de espera por defecto para todas las llamadas de espera dentro de una conversación.

```ts
// Espere siempre sólo una hora.
const oneHourInMilliseconds = 60 * 60 * 1000;
bot.use(createConversation(convo, {
  maxMillisecondsToWait: oneHourInMilliseconds,
}));
```

Si se pasa directamente un valor a una llamada de espera, se anulará este valor predeterminado.

## Eventos de entrada y salida

Puedes especificar una función callback que se invoque cada vez que se entre en una conversación.
Del mismo modo, puedes especificar una función callback que se invoque cada vez que se salga de una conversación.

```ts
bot.use(conversations({
  onEnter(id, ctx) {
    // Se ha introducido el `id` de la conversación.
  },
  onExit(id, ctx) {
    // Se ha salido de la conversación `id`.
  },
}));
```

Cada callback recibe dos valores.
El primer valor es el identificador de la conversación en la que se ha entrado o salido.
El segundo valor es el objeto de contexto actual del middleware circundante.

Ten en cuenta que las retrollamadas sólo se invocan cuando se entra o se sale de una conversación a través de `ctx.conversation`.
La llamada de retorno `onExit` también es invocada cuando la conversación termina por sí misma a través de `conversation.halt` o cuando se agota el tiempo de espera (#wait-timeouts).

## Llamadas de espera concurrentes

Puedes usar promesas flotantes para esperar varias cosas concurrentemente.
Cuando llegue una nueva actualización, sólo se resolverá la primera llamada de espera que coincida.

```ts
await ctx.reply("¡Envíe una foto y un pie de foto!");
const [textContext, photoContext] = await Promise.all([
  conversation.waitFor(":text"),
  conversation.waitFor(":photo"),
]);
await ctx.replyWithPhoto(photoContext.msg.photo.at(-1).file_id, {
  caption: textContext.msg.text,
});
```

En el ejemplo anterior, no importa si el usuario envía primero una foto o un texto.
Ambas promesas se resolverán en el orden que el usuario elija para enviar los dos mensajes que el código está esperando.
[Promise.all`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) funciona normalmente, sólo se resuelve cuando todas las promesas pasadas se resuelven.

Esto también se puede utilizar para esperar cosas no relacionadas.
Por ejemplo, así es como se instala un exit listener global dentro de la conversación.

```ts
conversation.waitForCommand("exit") // ¡No esperes!
  .then(() => conversation.halt());
```

Tan pronto como la conversación [finalice de cualquier forma](#salir-de-una-conversacion), todas las llamadas de espera pendientes serán descartadas.
Por ejemplo, la siguiente conversación finalizará inmediatamente después de que se haya introducido, sin esperar nunca ninguna actualización.

::: code-group

```ts [TypeScript]
async function convo(conversation: Conversation, ctx: Context) {
  const _promise = conversation.wait() // ¡No esperes!
    .then(() => ctx.reply("I will never be sent!"));

  // La conversación se realiza inmediatamente después de entrar.
}
```

```js [JavaScript]
async function convo(conversation, ctx) {
  const _promise = conversation.wait() // ¡No esperes!
    .then(() => ctx.reply("I will never be sent!"));

  // La conversación se realiza inmediatamente después de entrar.
}
```

:::

Internamente, cuando se alcanzan varias llamadas de espera al mismo tiempo, el plugin de conversaciones mantendrá un registro de una lista de llamadas de espera.
Tan pronto como llegue la siguiente actualización, reproducirá la función de creación de conversación una vez por cada llamada en espera encontrada hasta que una de ellas acepte la actualización.
Sólo si ninguna de las llamadas en espera pendientes acepta la actualización, ésta será descartada.

## Puntos de control y retroceso en el tiempo

El plugin de conversaciones [rastrea](#las-conversaciones-son-maquinas-de-repeticion) la ejecución de tu función constructora de conversaciones.

Esto te permite crear un punto de control a lo largo del camino.
Un punto de control contiene información sobre hasta dónde se ha ejecutado la función hasta el momento.
Se puede utilizar para volver más tarde a este punto.

Naturalmente, cualquier operación de E/S realizada mientras tanto no se podrá deshacer.
En particular, rebobinar hasta un punto de control no anulará mágicamente ningún mensaje.

```ts
const checkpoint = conversation.checkpoint();

// Más tarde:
if (ctx.hasCommand("reset")) {
  await conversation.rewind(checkpoint); // nunca vuelve
}
```

Los puntos de control pueden ser muy útiles para "volver atrás".
Sin embargo, al igual que `break` y `continue` de JavaScript con [labels](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label), saltar de un lado a otro puede hacer que el código sea menos legible.
**Asegúrate de no abusar de esta función.**

Internamente, rebobinar una conversación aborta la ejecución como lo hace una llamada de espera, y luego vuelve a ejecutar la función sólo hasta el punto donde se creó el punto de control.
Rebobinar una conversación no ejecuta literalmente funciones a la inversa, aunque lo parezca.

## Conversaciones paralelas

Las conversaciones en chats no relacionados son totalmente independientes y siempre pueden ejecutarse en paralelo.

Sin embargo, por defecto, cada chat sólo puede tener una única conversación activa en todo momento.
Si intentas entrar en una conversación mientras otra ya está activa, la llamada `enter` arrojará un error.

Puedes cambiar este comportamiento marcando una conversación como paralela.

```ts
bot.use(createConversation(convo, { parallel: true }));
```

Esto cambia dos cosas.

En primer lugar, ahora puedes entrar en esta conversación incluso cuando la misma o una conversación diferente ya está activa.
Por ejemplo, si tienes las conversaciones `captcha` y `settings`, puedes tener `captcha` activo cinco veces y `settings` activo doce veces---todo en el mismo chat.

En segundo lugar, cuando una conversación no acepta una actualización, ésta ya no se abandona por defecto.
En su lugar, se devuelve el control al sistema de middleware.

Todas las conversaciones instaladas tendrán la oportunidad de gestionar una actualización entrante hasta que una de ellas la acepte.
Sin embargo, sólo una conversación podrá gestionar la actualización.

Cuando varias conversaciones diferentes están activas al mismo tiempo, el orden del middleware determinará qué conversación puede gestionar la actualización en primer lugar.
Cuando una sola conversación está activa varias veces, la conversación más antigua (la que se introdujo primero) es la primera en gestionar la actualización.

Esto se ilustra mejor con un ejemplo.

::: code-group

```ts [TypeScript]
async function captcha(conversation: Conversation, ctx: Context) {
  const user = ctx.from!.id;
  await ctx.reply("¡Bienvenido al chat! ¿Cuál es el mejor bot framework?");
  const answer = await conversation.waitFor(":text").andFrom(user);
  if (answer.msg.text === "grammY") {
    await ctx.reply("¡Correcto! ¡Tu futuro es brillante!");
  } else {
    await ctx.banAuthor();
  }
}

async function settings(conversation: Conversation, ctx: Context) {
  const user = ctx.from!.id;
  const main = conversation.checkpoint();
  const options = ["Configuración del chat", "Acerca de", "Privacidad"];
  await ctx.reply("¡Bienvenido a la configuración!", {
    reply_markup: Keyboard.from(options
      .map((btn) => [Keyboard.text(btn)])),
  });
  const option = await conversation.waitFor(":text")
    .andFrom(user)
    .and((ctx) => options.includes(ctx.msg.text), {
      otherwise: (ctx) => ctx.reply("¡Por favor, use los botones!"),
    });
  await openSettingsMenu(option, main);
}

bot.use(createConversation(captcha));
bot.use(createConversation(settings));
```

```js [JavaScript]
async function captcha(conversation, ctx) {
  const user = ctx.from.id;
  await ctx.reply("¡Bienvenido al chat! ¿Cuál es el mejor bot framework?");
  const answer = await conversation.waitFor(":text").andFrom(user);
  if (answer.msg.text === "grammY") {
    await ctx.reply("¡Correcto! ¡Tu futuro es brillante!");
  } else {
    await ctx.banAuthor();
  }
}

async function settings(conversation, ctx) {
  const user = ctx.from.id;
  const main = conversation.checkpoint();
  const options = ["Configuración del chat", "Acerca de", "Privacidad"];
  await ctx.reply("¡Bienvenido a la configuración!", {
    reply_markup: Keyboard.from(options
      .map((btn) => [Keyboard.text(btn)])),
  });
  const option = await conversation.waitFor(":text")
    .andFrom(user)
    .and((ctx) => options.includes(ctx.msg.text), {
      otherwise: (ctx) => ctx.reply("¡Por favor, use los botones!"),
    });
  await openSettingsMenu(option, main);
}

bot.use(createConversation(captcha));
bot.use(createConversation(settings));
```

:::

El código anterior funciona en chats de grupo.
Proporciona dos conversaciones.
La conversación `captcha` se utiliza para asegurarse de que sólo los buenos desarrolladores se unan al chat (descarado grammY plug lol).
La conversación `settings` se utiliza para implementar un menú de configuración en el chat de grupo.

Ten en cuenta que todas las llamadas de espera filtran por un identificador de usuario, entre otras cosas.

Supongamos que ya ha sucedido lo siguiente

1. Has llamado a `ctx.conversation.enter(«captcha»)` para introducir el `captcha` de la conversación mientras gestionabas una actualización de un usuario con identificador `ctx.from.id === 42`.
2. Has llamado a `ctx.conversation.enter(«settings»)` para entrar en la conversación `settings` mientras gestionabas una actualización de un usuario con identificador `ctx.from.id === 3`.
3. Has llamado a `ctx.conversation.enter(«captcha»)` para entrar en la conversación `captcha` mientras gestionas una actualización de un usuario con identificador `ctx.from.id === 43`.

Esto significa que tres conversaciones están activas en este chat de grupo ahora---`captcha` está activo dos veces y `settings` está activo una vez.

> Ten en cuenta que `ctx.conversation` proporciona [varias formas](/ref/conversations/conversationcontrols#exit) de salir de conversaciones específicas incluso con conversaciones paralelas activadas.

A continuación, las siguientes cosas suceden en orden.

1. El usuario `3` envía un mensaje con el texto `"Configuración del chat"`.
2. Llega una actualización con un mensaje de texto.
3. Se reproduce la primera instancia de la conversación `captcha`.
4. La llamada de texto `waitFor(«:text»)` acepta la actualización, pero el filtro añadido `andFrom(42)` rechaza la actualización.
5. Se reproduce la segunda instancia de la conversación `captcha`.
6. La llamada de texto `waitFor(«:text»)` acepta la actualización, pero el filtro añadido `andFrom(43)` rechaza la actualización.
7. Todas las instancias de `captcha` rechazan la actualización, por lo que el control se devuelve al sistema middleware.
8. Se reproduce la instancia de la conversación `settings`.
9. La llamada de espera se resuelve y `option` contendrá un objeto de contexto para la actualización del mensaje de texto.
10. Se llama a la función `openSettingsMenu`.
    Puede enviar un mensaje de texto al usuario y rebobinar la conversación de vuelta a `main`, reiniciando el menú.

Observa que, aunque había dos conversaciones esperando a que los usuarios `42` y `43` completaran su captcha, el bot respondió correctamente al usuario `3`, que había iniciado el menú de configuración.
Las llamadas de espera filtradas pueden determinar qué actualizaciones son relevantes para la conversación actual.
Las actualizaciones descartadas se pierden y pueden ser recogidas por otras conversaciones.

El ejemplo anterior utiliza un chat de grupo para ilustrar cómo las conversaciones pueden manejar múltiples usuarios en paralelo en el mismo chat.
En realidad, las conversaciones paralelas funcionan en todos los chats.
Esto te permite esperar diferentes cosas en un chat con un mismo usuario.

Puedes combinar conversaciones paralelas con [tiempos de espera](#tiempos-de-espera) para mantener bajo el número de conversaciones activas.

## Inspección de conversaciones activas

Dentro de tu middleware, puedes inspeccionar qué conversación está activa.

```ts
bot.command("stats", (ctx) => {
  const convo = ctx.conversation.active("convo");
  console.log(convo); // 0 ó 1
  const isActive = convo > 0;
  console.log(isActive); // falso o verdadero
});
```

Cuando pasas un identificador de conversación a `ctx.conversation.active`, devolverá `1` si esta conversación está activa, y `0` en caso contrario.

Si habilitas [conversaciones paralelas](#conversaciones-paralelas) para la conversación, devolverá el número de veces que esta conversación está actualmente activa.

Llama a `ctx.conversation.active()` sin argumentos para recibir un objeto que contiene los identificadores de todas las conversaciones activas como claves.
Los valores respectivos describen cuántas instancias de cada conversación están activas.

Si la conversación `captcha` está activa dos veces y la conversación `settings` está activa una vez, `ctx.conversation.active()` funcionará como sigue.

```ts
bot.command("stats", (ctx) => {
  const stats = ctx.conversation.active();
  console.log(stats); // { captcha: 2, settings: 1 }
});
```

## Migración de 1.x a 2.x

Conversaciones 2.0 es una reescritura completa desde cero.

Aunque los conceptos básicos de la superficie de la API siguen siendo los mismos, las dos implementaciones son fundamentalmente diferentes en la forma en que operan bajo el capó.
En pocas palabras, la migración de 1.x a 2.x supone muy pocos ajustes en el código, pero requiere que se eliminen todos los datos almacenados.
Por lo tanto, todas las conversaciones se reiniciarán.

### Migración de datos de 1.x a 2.x

No hay forma de mantener el estado actual de las conversaciones al actualizar de 1.x a 2.x.

Simplemente debe eliminar los datos respectivos de sus sesiones.
Considere el uso de [migraciones de sesión](./session#migraciones) para esto.

La persistencia de los datos de las conversaciones con la versión 2.x puede hacerse como se describe [aquí](#persistencia-de-las-conversaciones).

### Cambios de tipo entre 1.x y 2.x

Con 1.x, el tipo de contexto dentro de una conversación era el mismo tipo de contexto utilizado en el middleware circundante.

Con 2.x, ahora siempre debes declarar dos tipos de contexto---[un tipo de contexto externo y un tipo de contexto interno](#objetos-de-contexto-conversacional).
Estos tipos nunca pueden ser el mismo, y si lo son, usted tiene un error en su código.
Esto se debe a que el tipo de contexto externo siempre debe tener instalado [`ConversationFlavor`](/ref/conversations/conversationflavor), mientras que el tipo de contexto interno nunca debe tenerlo instalado.

Además, ahora puedes instalar un [conjunto independiente de plugins](#uso-de-plugins-dentro-de-conversaciones) para cada conversación.

### Cambios en el acceso a la sesión entre 1.x y 2.x

Ya no se puede utilizar `conversation.session`.
En su lugar, debe utilizar `conversation.external` para ello.

```ts
// Leer los datos de la sesión.
const session = await conversation.session; // [!code --]
const session = await conversation.external((ctx) => ctx.session); // [!code ++]

// Escribir datos de sesión.
conversation.session = newSession; // [!code --]
await conversation.external((ctx) => { // [!code ++]
  ctx.session = newSession; // [!code ++]
}); // [!code ++]
```

> Acceder a `ctx.session` era posible con 1.x, pero siempre era incorrecto.
> `ctx.session` ya no está disponible con 2.x.

### Cambios de compatibilidad de plugins entre 1.x y 2.x

Conversations 1.x apenas era compatible con ningún plugin.
Se podía conseguir cierta compatibilidad utilizando `conversation.run`.

Esta opción se ha eliminado en la versión 2.x.
En su lugar, ahora puedes pasar plugins al array `plugins` como se describe [aquí](#uso-de-plugins-dentro-de-conversaciones).
Las sesiones necesitan un [tratamiento especial](#cambios-en-el-acceso-a-la-sesion-entre-1-x-y-2-x).
Los menús han mejorado su compatibilidad desde la introducción de los [menús conversacionales](#menus-conversacionales).

### Cambios en las conversaciones paralelas entre 1.x y 2.x

Las conversaciones paralelas funcionan igual en 1.x y 2.x.

Sin embargo, esta función era una fuente habitual de confusión cuando se utilizaba accidentalmente.
En la versión 2.x, es necesario activar la función especificando `{ parallel: true }` como se describe [aquí](#conversaciones-paralelas).

El único cambio en esta característica es que las actualizaciones ya no se devuelven al sistema de middleware por defecto.
En su lugar, esto sólo se hace cuando la conversación está marcada como paralela.

Tenga en cuenta que todos los métodos de espera y campos de formulario proporcionan una opción «siguiente» para anular el comportamiento predeterminado.
Esta opción cambió su nombre de «drop» en 1.x, y la semántica de la bandera se cambió en consecuencia.

### Cambios en los formularios entre 1.x y 2.x

Los formularios estaban realmente rotos con 1.x.
Por ejemplo, `conversation.form.text()` devolvía mensajes de texto incluso para `edited_message` actualizaciones de mensajes antiguos.
Muchas de estas rarezas se corrigieron en 2.x.

Corregir errores técnicamente no cuenta como un cambio de ruptura, pero sigue siendo un cambio substacial en el comportamiento.

## Resumen del plugin

- Nombre: `conversations`
- [Fuente](https://github.com/grammyjs/conversations)
- [Referencia](/ref/conversations/)
