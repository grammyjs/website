# Conversaciones (`conversations`)

Crea potentes interfaces conversacionales con facilidad.

## Introducción

La mayoría de los chats consisten en algo más que un solo mensaje. (meh)

Por ejemplo, puedes querer hacer una pregunta al usuario, y luego esperar la respuesta.
Esto puede incluso ir y venir varias veces, de modo que se desarrolla una conversación.

Cuando pienses en el [middleware](../guide/middleware.md), te darás cuenta de que todo se basa en un único [objeto contexto](../guide/context.md) por manejador.
Esto significa que siempre se maneja un solo mensaje de forma aislada.
No es fácil escribir algo como "comprobar el texto de hace tres mensajes" o algo así.

**Este plugin viene al rescate:**
Proporciona una forma extremadamente flexible de definir las conversaciones entre tu bot y tus usuarios.

Muchos marcos de bots te hacen definir grandes objetos de configuración con pasos y etapas y saltos y flujos de asistentes y lo que sea.
Esto conduce a una gran cantidad de código repetitivo, y hace que sea difícil de seguir.
**Este plugin no funciona así.**

En su lugar, con este plugin, usarás algo mucho más poderoso: **código**.
Básicamente, simplemente defines una función JavaScript normal que te permite definir cómo evoluciona la conversación.
A medida que el bot y el usuario hablen entre sí, la función se ejecutará declaración por declaración.

(Para ser justos, en realidad no es así como funciona bajo el capó.
Pero es muy útil pensarlo así).
En realidad, tu función se ejecutará de manera un poco diferente, pero llegaremos a eso [más tarde](#esperar-a-las-actualizaciones).

## Ejemplo simple

Antes de que nos sumerjamos en cómo se pueden crear conversaciones, echa un vistazo a un breve ejemplo de JavaScript de cómo se verá una conversación.

```js
async function saludo(conversation, ctx) {
  await ctx.reply("¡Hola! ¿Cuál es tu nombre?");
  const { mensaje } = await conversation.wait();
  await ctx.reply(`¡Bienvenido al chat, ${mensaje.texto}!`);
}
```

En esta conversación, el bot saludará primero al usuario y le preguntará su nombre.
Luego esperará hasta que el usuario envíe su nombre.
Por último, el bot da la bienvenida al usuario al chat, repitiendo el nombre.

Fácil, ¿verdad?
¡Veamos cómo se hace!

## Funciones del Constructor de Conversaciones

En primer lugar, vamos a importar algunas cosas.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const {
  conversations,
  createConversation,
} = require("@grammyjs/conversations");
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations/mod.ts";
```

</CodeGroupItem>
</CodeGroup>

Una vez aclarado esto, podemos ver cómo definir las interfaces conversacionales.

El elemento principal de una conversación es una función con dos argumentos.
A esto lo llamamos la _función constructora de la conversación_.

```js
async function saludo(conversation, ctx) {
  // TODO: codificar la conversación
}
```

Veamos cuáles son los dos parámetros.

_El segundo parámetro_* no es tan interesante, es sólo un objeto de contexto normal.
Como siempre, se llama `ctx` y utiliza tu [tipo de contexto personalizado](../guide/context.md#customizing-the-context-object) (quizás llamado `MyContext`).
El plugin de conversaciones exporta un [context flavor](../guide/context.md#additive-context-flavors) llamado `ConversationFlavor`.

**El primer parámetro** es el elemento central de este plugin.
Se llama comúnmente `conversation`, y tiene el tipo `Conversación` ([referencia de la API](https://deno.land/x/grammy_conversations/mod.ts?s=Conversation)).
Puede ser usado como un manejador para controlar la conversación, como esperar la entrada del usuario, y más.
El tipo `Conversation` espera su [tipo de contexto personalizado](../guide/context.md#customizing-the-context-object) como parámetro de tipo, por lo que a menudo utilizaría `Conversation<MyContext>`.

En resumen, en TypeScript, tu función de construcción de conversación se verá así.

```ts
type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

async function greeting(conversation: MyConversation, ctx: MyContext) {
  // TODO: codificar la conversación
}
```

Dentro de su función de construcción de conversación, ahora puede definir cómo debe ser la conversación.
Antes de profundizar en cada una de las características de este plugin, echemos un vistazo a un ejemplo más complejo que el [simple](#ejemplo-simple) anterior.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function movie(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("¿Cuántas películas favoritas tiene?");
  const count = await conversation.form.number();
  const movies: string[] = [];
  for (let i = 0; i < count; i++) {
    await ctx.reply(`¡Dime el número ${i + 1}!`);
    const titleCtx = await conversation.waitFor(":text");
    movies.push(titleCtx.msg.text);
  }
  await ctx.reply("¡Aquí hay una mejor clasificación!");
  movies.sort();
  await ctx.reply(movies.map((m, i) => `${i + 1}. ${m}`).join("\n"));
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function movie(conversation, ctx) {
  await ctx.reply("¿Cuántas películas favoritas tiene?");
  const count = await conversation.form.number();
  const movies = [];
  for (let i = 0; i < count; i++) {
    await ctx.reply(`¡Dime el número ${i + 1}!`);
    const titleCtx = await conversation.waitFor(":text");
    movies.push(titleCtx.msg.text);
  }
  await ctx.reply("¡Aquí hay una mejor clasificación!");
  movies.sort();
  await ctx.reply(movies.map((m, i) => `${i + 1}. ${m}`).join("\n"));
}
```

</CodeGroupItem>
</CodeGroup>

¿Puedes averiguar cómo funcionará este bot?

## Instalar y entrar en una conversación

En primer lugar, **debes** utilizar el [plugin de sesión](../plugins/session.md) si quieres utilizar el plugin de conversaciones.
También tienes que instalar el propio plugin de conversaciones, antes de poder registrar conversaciones individuales en tu bot.

```ts
// Instalar el plugin de sesión.
bot.use(session({
  initial() {
    // devuelve un objeto vacío por ahora
    return {};
  },
}));

// Instala el plugin de conversaciones.
bot.use(conversations());
```

A continuación, puedes instalar la función de construcción de conversación como middleware en tu objeto bot envolviéndola dentro de `createConversation`.

```ts
bot.use(createConversation(greeting));
```

Ahora que tu conversación está registrada en el bot, puedes entrar en la conversación desde cualquier manejador.
Asegúrate de usar `await` para todos los métodos en `ctx.conversation`---de lo contrario tu código se romperá.

```ts
bot.command("start", async (ctx) => {
  await ctx.conversation.enter("greeting");
});
```

Tan pronto como el usuario envíe `/start` al bot, la conversación será introducida.
El objeto de contexto actual se pasa como segundo argumento a la función de construcción de la conversación.
Por ejemplo, si inicias tu conversación con `await ctx.reply(ctx.message.text)`, contendrá la actualización que contiene `/start`.

::: tip Cambiar el identificador de la conversación

Por defecto, tienes que pasar el nombre de la función a `ctx.conversation.enter()`.
Sin embargo, si prefieres utilizar un identificador diferente, puedes especificarlo así

```ts
bot.use(createConversation(greeting, "new-name"));
```

A su vez, puedes entrar en la conversación con él:

```ts
bot.command("start", (ctx) => ctx.conversation.enter("new-name"));
```

:::

En total, tu código debería tener ahora más o menos este aspecto:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context, session } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

const bot = new Bot<MyContext>("");

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

/** Define la conversación */
async function greeting(conversation: MyConversation, ctx: MyContext) {
  // TODO: codificar la conversación
}

bot.use(createConversation(greeting));

bot.command("start", async (ctx) => {
  // introduce la función "saludo" que has declarado
  await ctx.conversation.enter("greeting");
});

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { Bot, Context, session } = require("grammy");
const {
  conversations,
  createConversation,
} = require("@grammyjs/conversations");

const bot = new Bot("");

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

/** Define la conversación */
async function greeting(conversation, ctx) {
  // TODO: codificar la conversación
}

bot.use(createConversation(greeting));

bot.command("start", async (ctx) => {
  // introduce la función "saludo" que has declarado
  await ctx.conversation.enter("greeting");
});

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot, Context, session } from "https://deno.land/x/grammy/mod.ts";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations/mod.ts";

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

const bot = new Bot<MyContext>("");

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

/** Define la conversación */
async function greeting(conversation: MyConversation, ctx: MyContext) {
  // TODO: codificar la conversación
}

bot.use(createConversation(greeting));

bot.command("start", async (ctx) => {
  // introduce la función "saludo" que has declarado
  await ctx.conversation.enter("greeting");
});

bot.start();
```

</CodeGroupItem>
</CodeGroup>

### Instalación con datos de sesión personalizados

Ten en cuenta que si utilizas TypeScript y quieres almacenar tus propios datos de sesión además de utilizar conversaciones, tendrás que proporcionar más información de tipo al compilador.
Digamos que tienes esta interfaz que describe tus datos de sesión personalizados:

```ts
interface SessionData {
  /** propiedad de sesión personalizada */
  foo: string;
}
```

Su tipo de contexto personalizado podría entonces tener el siguiente aspecto:

```ts
type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor;
```

Lo más importante es que al instalar el plugin de sesión con un almacenamiento externo, tendrás que proporcionar los datos de sesión explícitamente.
Todos los adaptadores de almacenamiento te permiten pasar el `SessionData` como un parámetro de tipo.
Por ejemplo, así es como tendrías que hacerlo con el [`almacenamiento gratuito`](./session.md#almacenamiento-gratuito) que proporciona grammY.

```ts
// Instalar el plugin de sesión.
bot.use(session({
  // Añade los tipos de sesión al adaptador.
  storage: freeStorage<SessionData>(bot.token),
  initial: () => ({ foo: "" }),
}));
```

Puedes hacer lo mismo para todos los demás adaptadores de almacenamiento, como `new FileAdapter<SessionData>()` y así sucesivamente.

### Instalación Con Sesiones Múltiples

Naturalmente, puedes combinar conversaciones con [multi sesiones](./session.md#multi-sesiones).

Este plugin almacena los datos de la conversación dentro de `session.conversation`.
Esto significa que si quieres usar multi sesiones, tienes que especificar este fragmento.

```ts
// Instala el plugin de sesiones.
bot.use(session({
  type: "multi",
  custom: {
    initial: () => ({ foo: "" }),
  },
  conversation: {}, // puede dejarse vacío
}));
```

De esta forma, puedes almacenar los datos de la conversación en un lugar diferente al de otros datos de la sesión.
Por ejemplo, si dejas la configuración de conversación vacía como se ilustra arriba, el plugin de conversación almacenará todos los datos en memoria.

## Salir de una conversación

La conversación se ejecutará hasta que su función de construcción de conversación se complete.
Esto significa que puedes salir de una conversación simplemente usando `return` o `throw`.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function hiAndBye(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("¡Hola! ¡Y adiós!");
  // Deja la conversación:
  return;
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function hiAndBye(conversation, ctx) {
  await ctx.reply("¡Hola! ¡Y adiós!");
  // Deja la conversación:
  return;
}
```

</CodeGroupItem>
</CodeGroup>

(Sí, poner un `return` al final de la función es un poco inútil, pero se entiende la idea).

Si se produce un error, también se saldrá de la conversación.
Sin embargo, el [plugin de sesión](#instalar-y-entrar-en-una-conversacion) sólo persigue los datos si el middleware se ejecuta con éxito.
Por lo tanto, si lanzas un error dentro de tu conversación y no lo capturas antes de que llegue al plugin de sesión, no se guardará que la conversación fue abandonada.
Como resultado, el siguiente mensaje causará el mismo error.

Puedes mitigar esto instalando un [límite de error](../guide/errors.md#error-boundaries) entre la sesión y la conversación.
De esta manera, puede evitar que el error se propague por el [árbol de middleware](../advanced/middleware.md) y por lo tanto permitir que el plugin de sesión vuelva a escribir los datos.

> Tenga en cuenta que si está utilizando las sesiones en memoria por defecto, todos los cambios en los datos de la sesión se reflejan inmediatamente, porque no hay un backend de almacenamiento.
> En ese caso, no es necesario utilizar los límites de error para abandonar una conversación lanzando un error.
> Así es como los límites de error y las conversaciones podrían usarse juntos.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
bot.use(session({
  storage: freeStorage(bot.token), // ajustar
  initial: () => ({}),
}));
bot.use(conversations());
async function hiAndBye(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("¡Hola! y ¡Adiós!");
  // Abandona la conversación:
  throw new Error("¡Atrápame si puedes!");
}
bot.errorBoundary(
  (err) => console.error("¡La conversación arrojó un error!", err),
  createConversation(greeting),
);
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
bot.use(session({
  storage: freeStorage(bot.token), // ajustar
  initial: () => ({}),
}));
bot.use(conversations());
async function hiAndBye(conversation, ctx) {
  await ctx.reply("¡Hola! y ¡Adiós!");
  // Abandona la conversación:
  throw new Error("¡Atrápame si puedes!");
}
bot.errorBoundary(
  (err) => console.error("¡La conversación arrojó un error!", err),
  createConversation(greeting),
);
```

</CodeGroupItem>
</CodeGroup>

Hagas lo que hagas, debes recordar [instalar un manejador de errores](../guide/errors.md) en tu bot.

Si quieres acabar con la conversación desde tu middleware habitual mientras espera la entrada del usuario, también puedes usar `await ctx.conversation.exit()`.
Esto simplemente borrará los datos del plugin de conversación de la sesión.
A menudo es mejor quedarse con el simple retorno de la función, pero hay algunos ejemplos en los que el uso de `await ctx.conversation.exit()` es conveniente.
Recuerda que debes `await` la llamada.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts{6,21}
async function movie(conversation: MyConversation, ctx: MyContext) {
  // TODO: definir la conversación
}

// Instalar el plugin de conversaciones.
bot.use(conversations());

// Salir siempre de cualquier conversación tras /cancelar
bot.command("cancel", async (ctx) => {
  await ctx.conversation.exit();
  await ctx.reply("Saliendo.");
});

// Salir siempre de la conversación de la `movie` 
// cuando se pulsa el botón de `cancel` del teclado en línea.
bot.callbackQuery("cancel", async (ctx) => {
  await ctx.conversation.exit("movie");
  await ctx.answerCallbackQuery("Dejando la conversación");
});

bot.use(createConversation(movie));
bot.command("movie", (ctx) => ctx.conversation.enter("movie"));
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js{6,21}
async function movie(conversation, ctx) {
  // TODO: definir la conversación
}

// Instalar el plugin de conversaciones.
bot.use(conversations());

// Salir siempre de cualquier conversación tras /cancelar
bot.command("cancel", async (ctx) => {
  await ctx.conversation.exit();
  await ctx.reply("Saliendo.");
});

// Salir siempre de la conversación de la `movie` 
// cuando se pulsa el botón de `cancel` del teclado en línea.
bot.callbackQuery("cancel", async (ctx) => {
  await ctx.conversation.exit("movie");
  await ctx.answerCallbackQuery("Dejando la conversación");
});

bot.use(createConversation(movie));
bot.command("movie", (ctx) => ctx.conversation.enter("movie"));
```

</CodeGroupItem>
</CodeGroup>

Tenga en cuenta que el orden es importante aquí.
Primero debes instalar el plugin de conversaciones (línea 6) antes de poder llamar a `await ctx.conversation.exit()`.
Además, los manejadores de cancelación genéricos deben ser instalados antes de que las conversaciones reales (línea 21) sean registradas.

## Esperar a las actualizaciones

Puedes usar el manejador de conversación `conversation` para esperar la siguiente actualización en este chat en particular.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function waitForMe(conversation: MyConversation, ctx: MyContext) {
  // Espere a la próxima actualización:
  const newContext = await conversation.wait();
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function waitForMe(conversation, ctx) {
  // Espere a la próxima actualización:
  const newContext = await conversation.wait();
}
```

</CodeGroupItem>
</CodeGroup>

Una actualización puede significar que se ha enviado un mensaje de texto, o que se ha pulsado un botón, o que se ha editado algo, o prácticamente cualquier otra acción realizada por el usuario.
Consulta la lista completa en los documentos de Telegram [aquí](https://core.telegram.org/bots/api#update).

Normalmente, fuera del plugin de conversaciones, cada una de estas actualizaciones sería manejada por el [sistema de middleware](../guide/middleware.md) de tu bot.
Por lo tanto, tu bot manejaría la actualización a través de un objeto de contexto que se pasa a tus manejadores.

En las conversaciones, obtendrá este nuevo objeto de contexto de la llamada `wait`.
A su vez, puedes manejar diferentes actualizaciones de manera diferente en base a este objeto.
Por ejemplo, puedes comprobar si hay mensajes de texto:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function waitForText(conversation: MyConversation, ctx: MyContext) {
  // Espere a la próxima actualización:
  ctx = await conversation.wait();
  // Comprueba el texto:
  if (ctx.message?.text) {
    // ...
  }
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function waitForText(conversation, ctx) {
  // Espere a la próxima actualización:
  ctx = await conversation.wait();
  // Comprueba el texto:
  if (ctx.message?.text) {
    // ...
  }
}
```

</CodeGroupItem>
</CodeGroup>

Además, existen otros métodos junto a `wait` que permiten esperar sólo actualizaciones específicas.
Un ejemplo es `waitFor` que toma una [consulta de filtro](../guide/filter-queries.md) y luego sólo espera las actualizaciones que coincidan con la consulta proporcionada.
Esto es especialmente potente en combinación con [desestructuración de objetos](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment):

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function waitForText(conversation: MyConversation, ctx: MyContext) {
  // Espere a la siguiente actualización de los mensajes de texto:
  const { msg: { text } } = await conversation.waitFor("message:text");
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function waitForText(conversation, ctx) {
  // Espere a la siguiente actualización de los mensajes de texto:
  const { msg: { text } } = await conversation.waitFor("message:text");
}
```

</CodeGroupItem>
</CodeGroup>

Consulta la [referencia de la API](https://deno.land/x/grammy_conversations/mod.ts?s=ConversationHandle#method_wait_0) para ver todos los métodos disponibles que son similares a `wait`.

Veamos ahora cómo funcionan realmente las llamadas wait.
Como se mencionó anteriormente, **no hacen _literalmente_ que tu bot espere**, aunque podemos programar las conversaciones como si ese fuera el caso.

## Tres reglas de oro de las conversaciones

Hay tres reglas que se aplican al código que escribes dentro de una función constructora de conversaciones.
Debes seguirlas si quieres que tu código se comporte correctamente.

Desplázate [hacia abajo](#como-funciona) si quieres saber más sobre _por qué_ se aplican estas reglas, y qué hacen realmente las llamadas `wait` internamente.

### Regla I: Todos los efectos secundarios deben estar envueltos

El código que depende de un sistema externo, como bases de datos, APIs, archivos u otros recursos que podrían cambiar de una ejecución a otra, debe ser envuelto en llamadas `conversation.external()`.

```ts
// MAL
const response = await externalApi();
// BIEN
const response = await conversation.external(() => externalApi());
```

Esto incluye tanto la lectura de datos como la realización de efectos secundarios (como la escritura en una base de datos).

::: tip Comparable a React

Si estás familiarizado con React, puede que conozcas un concepto comparable de `useEffect`.

:::

### Regla II: Todo comportamiento aleatorio debe estar envuelto

El código que depende de la aleatoriedad o del estado global que podría cambiar, debe envolver todo el acceso a él en llamadas a `conversation.external()`, o utilizar la función de conveniencia `conversation.random()`.

```ts
// MAL
if (Math.random() < 0.5) { /* hace cosas */ }
// BIEN
if (conversation.random() < 0.5) { /* hace cosas */ }
```

### Regla III: Usar funciones de conveniencia

Hay un montón de cosas instaladas en `conversation` que pueden ayudarte mucho.
Tu código a veces ni siquiera se rompe si no las usas, pero incluso así puede ser lento o comportarse de forma confusa.

```ts
// `ctx.session` sólo persiste los cambios para el objeto de contexto más reciente
conversation.session.myProp = 42; // ¡más fiable!
// Date.now() puede ser impreciso dentro de las conversaciones
await conversation.now(); // ¡más preciso!
// Debug logging via conversation, no imprime logs confusos
conversation.log("Hola, mundo"); // ¡más transparente!
```

Ten en cuenta que puedes hacer todo lo anterior a través de `conversation.external()`, pero esto puede ser tedioso de escribir, así que es más fácil usar las funciones de conveniencia ([referencia de la API](https://deno.land/x/grammy_conversations/mod.ts?s=ConversationHandle#Methods)).

## Variables, bifurcaciones y bucles

Si sigues las tres reglas anteriores, eres completamente libre de usar el código que quieras.
Ahora repasaremos algunos conceptos que ya conoces de programación, y mostraremos cómo se traducen en conversaciones limpias y legibles.

Imagina que todo el código de abajo está escrito dentro de una función de construcción de conversación.

Puedes declarar variables y hacer lo que quieras con ellas:

```ts
await ctx.reply("¡Envíame tus números favoritos, separados por comas!");
const { message } = await conversation.waitFor("message:text");
const suma = message.texto
  .split(",")
  .map((n) => parseInt(n.trim(), 10))
  .reduce((x, y) => x + y);
await ctx.reply("La suma de estos números es: " + suma);
```

La ramificación también funciona:

```ts
await ctx.reply("¡Envíame una foto!");
const { message } = await conversation.wait();
if (!message?.photo) {
  await ctx.reply("¡Eso no es una foto! ¡Estoy fuera!");
  return;
}
```

También lo hacen los bucles:

```ts
do {
  await ctx.reply("¡Envíame una foto!");
  ctx = await conversation.wait();

  if (ctx.message?.text === "/cancel") {
    await ctx.reply("¡Cancelado, me voy!");
    return;
  }
} while (!ctx.message?.photo);
```

## Funciones y recursión

También puedes dividir tu código en varias funciones, y reutilizarlas.
Por ejemplo, así es como puedes definir un captcha reutilizable.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function captcha(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("¡Demuestra que eres humano! ¿Cuál es la respuesta a todo?");
  const { message } = await conversation.wait();
  return message?.texto === "42";
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function captcha(conversation, ctx) {
  await ctx.reply("¡Demuestra que eres humano! ¿Cuál es la respuesta a todo?");
  const { message } = await conversation.wait();
  return message?.texto === "42";
}
```

</CodeGroupItem>
</CodeGroup>

Devuelve `true` si el usuario puede pasar, y `false` en caso contrario.
Ahora puedes usarlo en tu función principal del constructor de conversación así:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function enterGroup(conversation: MyConversation, ctx: MyContext) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("¡Bienvenido!");
  else await ctx.banChatMember();
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function enterGroup(conversation, ctx) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("¡Bienvenido!");
  else await ctx.banChatMember();
}
```

</CodeGroupItem>
</CodeGroup>

Vea cómo la función captcha puede ser reutilizada en diferentes lugares de su código.

> Este sencillo ejemplo sólo pretende ilustrar cómo funcionan las funciones.
> En realidad, puede funcionar mal porque sólo espera una nueva actualización del chat respectivo, pero sin verificar que realmente proviene del mismo usuario que se unió.
> Si quieres crear un captcha real, puedes usar [conversaciones paralelas](#conversaciones-paralelas).

Si quieres, también puedes dividir tu código en más funciones, o usar recursión, recursión mutua, generadores, etc.
(Sólo asegúrese de que todas las funciones siguen las [tres reglas](#tres-reglas-de-oro-de-las-conversaciones).

Naturalmente, también puedes usar el manejo de errores en tus funciones.
Las declaraciones regulares `try`/`catch` funcionan bien, también en las funciones.
Después de todo, las conversaciones son sólo JavaScript.

Si la función de conversación principal arroja un error, el error se propagará más allá en los [mecanismos de manejo de errores] (../guide/errors.md) de tu bot.

## Módulos y clases

Naturalmente, puedes mover tus funciones a través de los módulos.
De esta manera, puedes definir algunas funciones en un archivo, `exportarlas`, y luego `importarlas` y usarlas en otro archivo.

Si quieres, también puedes definir clases.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
class Auth {
  public token?: string;

  constructor(private conversation: MyConversation) {}

  authenticate(ctx: MyContext) {
    const link = getAuthLink(); // obtener el enlace de autentificación de su sistema
    await ctx.reply(
      "Abre este enlace para obtener una ficha, y envíamela: " + link,
    );
    ctx = await this.conversation.wait();
    this.token = ctx.message?.text;
  }

  isAuthenticated(): this is Auth & { token: string } {
    return this.token !== undefined;
  }
}

async function askForToken(conversation: MyConversation, ctx: MyContext) {
  const auth = new Auth(conversation);
  await auth.authenticate(ctx);
  if (auth.isAuthenticated()) {
    const token = auth.token;
    // haz cosas con el token
  }
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
class Auth {
  constructor(conversation) {
    this.#conversation = conversation;
  }

  authenticate(ctx) {
    const link = getAuthLink(); // obtener el enlace de autentificación de su sistema
    await ctx.reply(
      "Abre este enlace para obtener una ficha, y envíamela: " + link,
    );
    ctx = await this.#conversation.wait();
    this.token = ctx.message?.text;
  }

  isAuthenticated() {
    return this.token !== undefined;
  }
}

async function askForToken(conversation, ctx) {
  const auth = new Auth(conversation);
  await auth.authenticate(ctx);
  if (auth.isAuthenticated()) {
    const token = auth.token;
    // haz cosas con el token
  }
}
```

</CodeGroupItem>
</CodeGroup>

El punto aquí no es tanto que recomendemos estrictamente hacer esto.
Se trata más bien de un ejemplo de cómo puede utilizar las infinitas flexibilidades de JavaScript para estructurar su código.

## Formularios

Como se mencionó [anteriormente](#esperar-a-las-actualizaciones), hay varias funciones de utilidad diferentes en el manejador de la conversación, como `await conversation.waitFor('message:text')` que sólo devuelve las actualizaciones de los mensajes de texto.

Si estos métodos no son suficientes, el plugin de conversaciones proporciona aún más funciones de ayuda para construir formularios a través de `conversation.form`.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function waitForMe(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("¿Qué edad tienes?");
  const age: number = await conversation.form.number();
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function waitForMe(conversation, ctx) {
  await ctx.reply("¿Qué edad tienes?");
  const age = await conversation.form.number();
}
```

</CodeGroupItem>
</CodeGroup>

Como siempre, consulte la [referencia de la API](https://deno.land/x/grammy_conversations/mod.ts?s=ConversationForm) para ver qué métodos están disponibles.

## Trabajando con Plugins

Como se mencionó [anteriormente](#introduccion), los manejadores grammY siempre manejan una sola actualización.
Sin embargo, con las conversaciones, puedes procesar muchas actualizaciones en secuencia como si todas estuvieran disponibles al mismo tiempo.
Los plugins hacen esto posible almacenando objetos de contexto antiguos, y reabasteciéndolos más tarde.
Esta es la razón por la que los objetos de contexto dentro de las conversaciones no siempre se ven afectados por algunos plugins de grammY de la manera que cabría esperar.
Esto es relevante para los siguientes plugins:

- [menu](./menu.md)
- [hydrate](./hydrate.md)
- [i18n](./i18n.md) y [fluent](./fluent.md)
- [emoji](./emoji.md)

Todos ellos tienen en común que almacenan funciones en el objeto de contexto, que el plugin de conversaciones no puede manejar correctamente.
Por lo tanto, si quieres combinar conversaciones con uno de estos plugins de grammY, tendrás que utilizar una sintaxis especial para instalar el otro plugin dentro de cada conversación.
Puedes instalar otros plugins dentro de las conversaciones usando `conversation.run`:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function convo(conversation: MyConversation, ctx: MyContext) {
  // Instala los plugins de grammY aquí
  await conversation.run(plugin());
  // Continúa definiendo la conversación ...
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function convo(conversation, ctx) {
  // Instala los plugins de grammY aquí
  await conversation.run(plugin());
  // Continúa definiendo la conversación ...
}
```

</CodeGroupItem>
</CodeGroup>

Esto hará que el plugin esté disponible dentro de la conversación.

Como ejemplo, si quieres usar un menú dentro de una conversación, tu código podría ser así.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function convo(conversation: MyConversation, ctx: MyContext) {
  const menu = new Menu<MyContext>()
    .text("Click", (ctx) => ctx.reply("¡Hola!"));
  await conversation.run(menu);
  // Continuar definiendo la conversación ...
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function convo(conversation, ctx) {
  const menu = new Menu()
    .text("Click", (ctx) => ctx.reply("¡Hola!"));
  await conversation.run(menu);
  // Continuar definiendo la conversación ...
}
```

</CodeGroupItem>
</CodeGroup>

### Objetos de contexto personalizados

Si estás usando un [objeto de contexto personalizado](../guide/context.md#personalizacion-del-objeto-de-contexto) y quieres instalar propiedades personalizadas en tus objetos de contexto antes de entrar en una conversación, entonces algunas de estas propiedades pueden perderse también.
En cierto modo, el middleware que utilizas para personalizar tu objeto de contexto también puede considerarse un plugin.

La solución más limpia es **evitar las propiedades de contexto personalizadas** por completo, o al menos sólo instalar propiedades serializables en el objeto de contexto.
En otras palabras, si todas las propiedades de contexto personalizadas pueden persistir en una base de datos y ser restauradas después, no tienes que preocuparte de nada.

Normalmente, existen otras soluciones a los problemas que se suelen resolver con las propiedades de contexto personalizadas.
Por ejemplo, a menudo es posible simplemente obtenerlas dentro de la propia conversación, en lugar de obtenerlas dentro de un manejador.

Si ninguna de estas cosas es una opción para ti, puedes intentar trastear tú mismo con `conversation.run`.
Debes saber que debes llamar a `next` dentro del middleware pasado---de lo contrario, el manejo de actualizaciones será interceptado.

El middleware se ejecutará para todas las actualizaciones pasadas cada vez que llegue una nueva actualización.
Por ejemplo, si llegan tres objetos de contexto, esto es lo que ocurre:

1. se recibe la primera actualización
2. se ejecuta el middleware para la primera actualización
3. se recibe la segunda actualización
4. el middleware se ejecuta para la primera actualización
5. el middleware se ejecuta para la segunda actualización
6. se recibe la tercera actualización
7. el middleware se ejecuta para la primera actualización
8. el middleware se ejecuta para la segunda actualización
9. el middleware se ejecuta para la tercera actualización

Nótese que el middleware se ejecuta con la primera actualización tres veces.

## Conversaciones paralelas

Naturalmente, el plugin de conversaciones puede ejecutar cualquier número de conversaciones en paralelo en diferentes chats.

Sin embargo, si tu bot se añade a un chat de grupo, puede querer tener conversaciones con varios usuarios diferentes en paralelo _en el mismo chat_.
Por ejemplo, si tu bot tiene un captcha que quiere enviar a todos los nuevos miembros.
Si dos miembros se unen al mismo tiempo, el bot debería ser capaz de mantener dos conversaciones independientes con ellos.

Por eso el plugin de conversaciones permite introducir varias conversaciones al mismo tiempo para cada chat.
Por ejemplo, es posible tener cinco conversaciones diferentes con cinco nuevos usuarios, y al mismo tiempo chatear con un administrador sobre la nueva configuración del chat.

### Cómo funciona entre bastidores

Cada actualización entrante sólo será manejada por una de las conversaciones activas en un chat.
Comparable a los manejadores de middleware, las conversaciones serán llamadas en el orden en que son registradas.
Si una conversación se inicia varias veces, estas instancias de la conversación serán llamadas en orden cronológico.

Cada conversación puede entonces manejar la actualización, o puede llamar a `await conversation.skip()`.
En el primer caso, la actualización simplemente se consumirá mientras la conversación la maneja.
En el segundo caso, la conversación deshará efectivamente la recepción de la actualización, y la pasará a la siguiente conversación.
Si todas las conversaciones omiten una actualización, el flujo de control será devuelto al sistema de middleware, y ejecutará cualquier manejador posterior.

Esto permite iniciar una nueva conversación desde el middleware regular.

### Cómo se puede utilizar

En la práctica, nunca necesitas llamar a `await conversation.skip()` en absoluto.
En su lugar, puedes usar cosas como `await conversation.waitFrom(userId)`, que se encargará de los detalles por ti.
Esto te permite chatear con un solo usuario en un chat de grupo.

Por ejemplo, vamos a implementar el ejemplo del captcha de aquí arriba de nuevo, pero esta vez con conversaciones paralelas.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts{4}
async function captcha(conversation: MyConversation, ctx: MyContext) {
  if (ctx.from === undefined) return false;
  await ctx.reply("¡Demuestra que eres humano! ¿Cuál es la respuesta a todo?");
  const { message } = await conversation.waitFrom(ctx.from);
  return message?.text === "42";
}

async function enterGroup(conversation: MyConversation, ctx: MyContext) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("¡Bienvenido!");
  else await ctx.banChatMember();
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js{4}
async function captcha(conversation, ctx) {
  if (ctx.from === undefined) return false;
  await ctx.reply("¡Demuestra que eres humano! ¿Cuál es la respuesta a todo?");
  const { message } = await conversation.waitFrom(ctx.from);
  return message?.text === "42";
}

async function enterGroup(conversation, ctx) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("¡Bienvenido!");
  else await ctx.banChatMember();
}
```

</CodeGroupItem>
</CodeGroup>

Observa cómo sólo esperamos los mensajes de un usuario en particular.

Ahora podemos tener un simple manejador que entra en la conversación cuando un nuevo miembro se une.

```ts
bot.on("chat_member")
  .filter((ctx) => ctx.chatMember.old_chat_member.status === "left")
  .filter((ctx) => ctx.chatMember.new_chat_member.status === "member")
  .use((ctx) => ctx.conversation.enter("enterGroup"));
```

### Inspección de conversaciones activas

Puede ver cuántas conversaciones con qué identificador se están ejecutando.

```ts
const stats = await ctx.conversation.active();
console.log(stats); // { "enterGroup": 1 }
```

Esto se proporcionará como un objeto que tiene los identificadores de conversación como claves, y un número que indica el número de conversaciones en curso para cada identificador.

## Cómo funciona

> [Recuerda](#tres-reglas-de-oro-de-las-conversaciones) que el código dentro de tus funciones de construcción de conversaciones debe seguir tres reglas.
> Ahora vamos a ver _por qué_ necesitas construirlas de esa manera.

Primero vamos a ver cómo funciona este plugin conceptualmente, antes de elaborar algunos detalles.

### Cómo funcionan las llamadas `wait`

Cambiemos de perspectiva por un momento, y hagamos una pregunta desde el punto de vista de un desarrollador de plugins.
¿Cómo implementar una llamada `wait` en el plugin?

El enfoque ingenuo para implementar una llamada `wait` en el plugin de conversaciones sería crear una nueva promesa, y esperar hasta que llegue el siguiente objeto de contexto.
Tan pronto como lo haga, resolvemos la promesa, y la conversación puede continuar.

Sin embargo, esto es una mala idea por varias razones.

**Pérdida de datos.**
¿Qué pasa si tu servidor se cae mientras esperas un objeto de contexto?
En ese caso, perdemos toda la información sobre el estado de la conversación.
Básicamente, el bot pierde su tren de pensamiento, y el usuario tiene que empezar de nuevo.
Esto es un mal diseño y molesto.

**Bloqueo.**
Si las llamadas de espera se bloquean hasta que llega la siguiente actualización, significa que la ejecución del middleware para la primera actualización no puede completarse hasta que la conversación entera se complete.

- Para el sondeo incorporado, esto significa que no se pueden procesar más actualizaciones hasta que la actual haya terminado.
  Por lo tanto, el bot simplemente se bloquearía para siempre.
- Para [grammY runner](./runner.md), el bot no se bloquearía.
  Sin embargo, al procesar miles de conversaciones en paralelo con diferentes usuarios, consumiría cantidades potencialmente muy grandes de memoria.
  Si muchos usuarios dejan de responder, esto deja al bot atascado en medio de innumerables conversaciones.
- Los webhooks tienen su propia [categoría de problemas](../guide/deployment-types.md#terminar-las-solicitudes-de-webhooks-a-tiempo) con middleware de larga duración.

**Estado.**
En la infraestructura sin servidor, como las funciones en la nube, no podemos asumir que la misma instancia maneja dos actualizaciones posteriores del mismo usuario.
Por lo tanto, si fuéramos a crear conversaciones con estado, podrían romperse aleatoriamente todo el tiempo, ya que algunas llamadas `wait` no se resuelven, pero algún otro middleware se ejecuta de repente.
El resultado es una abundancia de bugs aleatorios y caos.

Hay más problemas, pero se entiende la idea.

En consecuencia, el plugin de conversaciones hace las cosas de forma diferente.
Muy diferente.

El plugin de conversaciones rastrea la ejecución de su función.
Cuando se alcanza una llamada de espera, serializa el estado de ejecución en la sesión, y lo almacena de forma segura en una base de datos.
Cuando llega la siguiente actualización, primero inspecciona los datos de la sesión.
Si encuentra que lo dejó en medio de una conversación, deserializa el estado de ejecución, toma su función constructora de conversación y la reproduce hasta el punto de la última llamada `wait`.
A continuación, reanuda la ejecución ordinaria de tu función, hasta que se alcanza la siguiente llamada `wait`, y la ejecución debe ser detenida de nuevo.

¿Qué entendemos por estado de ejecución?
En pocas palabras, consiste en tres cosas

1. Las actualizaciones entrantes
2. Las llamadas salientes a la API
3. Eventos y efectos externos, como la aleatoriedad o las llamadas a APIs o bases de datos externas

¿Qué entendemos por repetición?
Reproducir significa simplemente llamar a la función regularmente desde el principio, pero cuando hace cosas como llamar a `wait` o realizar llamadas a la API, en realidad no hacemos nada de eso.
En su lugar, comprobamos o registramos de una ejecución anterior qué valores fueron devueltos.
A continuación, inyectamos estos valores para que la función de construcción de la conversación simplemente se ejecute muy rápido - hasta que nuestros registros se agoten.
En ese momento, cambiamos de nuevo al modo de ejecución normal, que es sólo una forma elegante de decir que dejamos de inyectar cosas, y empezamos a realizar realmente las llamadas a la API de nuevo.

Por eso el plugin tiene que hacer un seguimiento de todas las actualizaciones entrantes, así como de todas las llamadas a la API de los bots.
(Véanse los puntos 1 y 2 anteriores).
Sin embargo, el plugin no tiene control sobre los eventos externos, los efectos secundarios o la aleatoriedad.
Por ejemplo, podría esto:

```ts
if (Math.random() < 0.5) {
  // hacer una cosa
} else {
  // hacer otra cosa
}
```

En ese caso, al llamar a la función, puede que de repente se comporte de forma diferente cada vez, por lo que la reproducción de la función se romperá.
Podría funcionar aleatoriamente de forma diferente a la ejecución original.
Por eso existe el punto 3, y hay que seguir las [Tres Reglas de Oro](#tres-reglas-de-oro-de-las-conversaciones).

### Cómo interceptar la ejecución de una función

Conceptualmente hablando, las palabras clave `async` y `await` nos dan el control sobre el lugar en el que el hilo es [preempted](https://en.wikipedia.org/wiki/Preemption_(computing)).
Por lo tanto, si alguien llama a la conversación `await.wait()`, que es una función de nuestra biblioteca, se nos da el poder de adelantarnos a la ejecución.

Concretamente, la primitiva secreta del núcleo que nos permite interrumpir la ejecución de una función es una `Promise` que nunca se resuelve.

```ts
await new Promise<never>(() => {}); // BOOM
```

Si esperas una promesa de este tipo en cualquier archivo JavaScript, tu tiempo de ejecución terminará instantáneamente.
(Siéntase libre de pegar el código anterior en un archivo y probarlo).

Como obviamente no queremos matar el runtime de JS, tenemos que atrapar esto de nuevo.
¿Cómo lo harías?
(Siéntase libre de revisar el código fuente del plugin si esto no es inmediatamente obvio para usted).

## Resumen del plugin

- Name: `conversations`
- Source: <https://github.com/grammyjs/conversations>
- Reference: <https://deno.land/x/grammy_conversations/mod.ts>
