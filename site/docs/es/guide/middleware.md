# Middleware

Las funciones de escucha que se pasan a `bot.on()`, `bot.command()`, y sus hermanos, se llaman _middleware_.
Aunque no es incorrecto decir que están escuchando las actualizaciones, llamarlos "oyentes" es una simplificación.

> Esta sección explica qué es el middleware, y utiliza grammY como ejemplo para ilustrar cómo se puede utilizar.
> Si buscas documentación específica sobre lo que hace especial a la implementación de middleware de grammY, revisa [Middleware Redux](../advanced/middleware) en la sección avanzada de la documentación.

## The Middleware Stack

Supongamos que escribes un bot como este:

```ts{8}
const bot = new Bot("");

bot.use(session());

bot.command("start", (ctx) => ctx.reply("¡Comenzó!"));
bot.command("help", (ctx) => ctx.reply("Texto de ayuda"));

bot.on(":text", (ctx) => ctx.reply("¡Texto!")); // (*)
bot.on(":photo", (ctx) => ctx.reply("¡Foto!"));

bot.start();
```

Cuando llegue una actualización con un mensaje de texto normal, se realizarán estos pasos:

1. Se envía `"¡Hola!"` al bot.
2. El middleware de sesión recibe la actualización, y hace sus cosas de sesión
3. La actualización será comprobada por un comando `/start`, que no está contenido
4. Se comprobará si la actualización contiene un comando `/help`, que no está contenido
5. Se comprobará que la actualización contiene un texto en el mensaje (o en el mensaje del canal), que tiene éxito.
6. Se invocará al middleware en `(*)`, que maneja la actualización respondiendo con `"¡Texto!"`

La actualización **no** se comprueba para el contenido de una foto, porque el middleware en `(*)` ya maneja la actualización.

Ahora, ¿cómo funciona esto?
Averigüémoslo.

Podemos inspeccionar el tipo `Middleware` en la referencia de grammY [aquí](/ref/core/middleware):

```ts
// Se han omitido algunos parámetros de tipo por razones de brevedad.
type Middleware = MiddlewareFn | MiddlewareObj;
```

¡Ajá!
El middleware puede ser una función o un objeto.
Sólo hemos utilizado funciones (`(ctx) => { ... }`) hasta ahora, así que ignoremos los objetos middleware por ahora, y profundicemos en el tipo `MiddlewareFn` ([reference](/ref/core/middlewarefn)):

```ts
// Vuelve a omitir los parámetros del tipo.
type MiddlewareFn = (ctx: Context, next: NextFunction) => MaybePromise<unknown>;
// con
type NextFunction = () => Promise<void>;
```

Por lo tanto, ¡el middleware toma dos parámetros!
Hasta ahora sólo hemos utilizado uno, el objeto de contexto `ctx`.
Ya sabemos (./context) lo que es `ctx`, pero también vemos una función con el nombre `next`.
Para entender qué es `next`, tenemos que ver todo el middleware que se instala en el objeto bot como un todo.

Puedes ver todas las funciones de middleware instaladas como un número de capas que se apilan unas sobre otras.
El primer middleware (`session` en nuestro ejemplo) es la capa superior, por lo tanto recibe cada actualización primero.
Entonces puede decidir si quiere manejar la actualización, o pasarla a la siguiente capa (el manejador de comandos `/start`).
La función `next` se puede utilizar para invocar el middleware posterior, a menudo llamado _downstream middleware_.
Esto también significa que si no llamas a `next` en tu middleware, las capas subyacentes de middleware no serán invocadas.

Este stack de funciones es la _middleware stack_.

```asciiart:no-line-numbers
(ctx, next) => ...    |
(ctx, next) => ...    |—————upstream middleware de X
(ctx, next) => ...    |
(ctx, next) => ...       <— middleware X. Llamar a `next` para pasar las actualizaciones
(ctx, next) => ...    |
(ctx, next) => ...    |—————downstream middleware de X
(ctx, next) => ...    |
```

Volviendo a nuestro ejemplo anterior, ahora sabemos por qué `bot.on(":photo")` ni siquiera se comprobó: el middleware en `bot.on(":text", (ctx) => { ... })` ya se encargó de la actualización, y no llamó a `next`.
De hecho, ni siquiera especificó "next" como parámetro.
Simplemente ha ignorado `next`, por lo que no ha pasado la actualización.

¡Probemos otra cosa con nuestros nuevos conocimientos!

```ts
const bot = new Bot("");

bot.on(":text", (ctx) => ctx.reply("¡Texto!"));
bot.command("start", (ctx) => ctx.reply("¡Comando!"));

bot.start();
```

Si ejecutas el bot anterior, y envías `/start`, nunca llegarás a ver una respuesta que diga `¡Comando!`.
Vamos a inspeccionar lo que sucede:

1. Envías `"/start"` al bot.
2. El middleware `":text"` recibe la actualización y comprueba si hay texto, lo cual tiene éxito porque los comandos son mensajes de texto.
   La actualización es manejada inmediatamente por el primer middleware y su bot responde con "¡Texto!".

¡El mensaje ni siquiera se comprueba si contiene el comando `/start`!
El orden en el que registras tu middleware importa, porque determina el orden de las capas en la pila de middleware.
Puedes solucionar el problema invirtiendo el orden de las líneas 3 y 4.
Si llamas a `next` en la línea 3, se enviarán dos respuestas.

**La función `bot.use()` simplemente registra el middleware que recibe todas las actualizaciones.
Esta es la razón por la que `session()` se instala a través de `bot.use()`---queremos que el plugin opere sobre todas las actualizaciones, sin importar los datos que contenga.

Tener un middleware stack es una propiedad extremadamente poderosa de cualquier framework web, y este patrón es ampliamente popular (no sólo para los bots de Telegram).

Escribamos nuestra propia pieza de middleware para ilustrar mejor cómo funciona.

## Escribiendo un middleware personalizado

Ilustraremos el concepto de middleware escribiendo una simple función de middleware que pueda medir el tiempo de respuesta de tu bot, es decir, cuánto tarda tu bot en gestionar un mensaje.

Aquí está la firma de la función para nuestro middleware.
Puedes compararla con el tipo de middleware de arriba, y convencerte de que realmente tenemos un middleware aquí.

::: code-group

```ts [TypeScript]
/** Mide el tiempo de respuesta del bot, y lo registra en el `console` */
async function responseTime(
  ctx: Context,
  next: NextFunction, // es un alias de: () => Promise<void>
): Promise<void> {
  // TODO: implementar
}
```

```js [JavaScript]
/** Mide el tiempo de respuesta del bot, y lo registra en el `console` */
async function responseTime(ctx, next) {
  // TODO: implementar
}
```

:::

Podemos instalarlo en nuestra instancia `bot` con `bot.use()`:

```ts
bot.use(responseTime);
```

Empecemos a aplicarlo.
Esto es lo que queremos hacer:

1. Una vez que llega una actualización, almacenamos `Date.now()` en una variable.
2. Invocamos el middleware downstream, por lo que dejamos que todo el manejo de los mensajes ocurra.
   Esto incluye la coincidencia de comandos, la respuesta, y todo lo que su bot hace.
3. Tomamos `Date.now()` de nuevo, lo comparamos con el valor anterior, y `console.log` la diferencia de tiempo.

Es importante instalar nuestro middleware `responseTime` _primero_ en el bot (en la parte superior de la pila de middleware) para asegurarse de que todas las operaciones se incluyen en la medición.

::: code-group

```ts [TypeScript]
/** Mide el tiempo de respuesta del bot, y lo registra en el `console` */
async function responseTime(
  ctx: Context,
  next: NextFunction, // es un alias de: () => Promise<void>
): Promise<void> {
  // tomar el tiempo antes
  const before = Date.now(); // milisegundos
  // invocar downstream middleware
  await next(); // ¡asegúrate de `await`!
  // tomar el tiempo despues
  const after = Date.now(); // milisegundos
  // registrar la diferencia
  console.log(`Response time: ${after - before} ms`);
}

bot.use(responseTime);
```

```js [JavaScript]
/** Mide el tiempo de respuesta del bot, y lo registra en el `console` */
async function responseTime(ctx, next) {
  // tomar el tiempo antes
  const before = Date.now(); // milliseconds
  // invocar downstream middleware
  await next(); // ¡asegúrate de `await`!
  // tomar el tiempo despues
  const after = Date.now(); // milliseconds
  // registrar la diferencia
  console.log(`Response time: ${after - before} ms`);
}
bot.use(responseTime);
```

:::

Completo, ¡y funciona! :heavy_check_mark:

Siéntase libre de utilizar este middleware en su objeto bot, registrar más oyentes, y jugar con el ejemplo.
Hacerlo te ayudará a entender completamente lo que es el middleware.

::: danger PELIGRO: ¡Asegúrate siempre de esperar a next!
Si alguna vez llamas a `next()` sin la palabra clave `await`, varias cosas se romperán:

- :x: Tu pila de middleware se ejecutará en el orden equivocado.
- :x: Puede experimentar una pérdida de datos.
- :x: Es posible que algunos mensajes no se envíen.
- :x: Tu bot puede fallar aleatoriamente de forma difícil de reproducir.
- :x: Si ocurre un error, su manejador de errores no será llamado por él.
  En su lugar, verás que se producirá un `UnhandledPromiseRejectionWarning`, que puede hacer que tu proceso bot se caiga.
- :x: Se rompe el mecanismo de backpressure de [grammY runner](../plugins/runner), que protege a tu servidor de una carga excesiva, como por ejemplo durante los picos de carga.
- :skull: A veces, también mata a todos tus inocentes gatitos. :crying_cat_face:

:::

La regla de usar `await` es especialmente importante para `next()`, pero en realidad se aplica a cualquier expresión en general que devuelva una `Promise`.
Esto incluye `bot.api.sendMessage`, `ctx.reply`, y todas las demás llamadas de red.
Si tu proyecto es importante para ti, entonces utiliza herramientas de linting que te avisen si alguna vez te olvidas de usar `await` en una `Promise`.

::: tip Habilitar las promesas no flotantes
Considere utilizar [ESLint](https://eslint.org/) y configúrelo para que utilice la regla [no-floating-promises](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-floating-promises.mdx).
Esto se asegurará de que nunca se olvide de usar `await` (gritando).
:::

## Propiedades del Middleware en grammY

En grammY, el middleware puede devolver una `Promesa` (que será `await`), pero también puede ser síncrono.

En contraste con otros sistemas de middleware (como el de `express`), no puedes pasar valores de error a `next`.
`next` no toma ningún argumento.
Si quieres que se produzca un error, puedes simplemente `tirar` el error.
Otra diferencia es que no importa cuántos argumentos tome tu middleware: `() => {}` será manejado exactamente como `(ctx) => {}`, o como `(ctx, next) => {}`.

Hay dos tipos de middleware: funciones y objetos.
Los objetos middleware son simplemente una envoltura para las funciones middleware.
Se utilizan sobre todo internamente, pero a veces también pueden ayudar a las bibliotecas de terceros, o ser utilizados en casos de uso avanzado, como con [Composer](/ref/core/composer):

```ts
const bot = new Bot("");

bot.use(/*...*/);
bot.use(/*...*/);

const composer = new Composer();
composer.use(/*...*/);
composer.use(/*...*/);
composer.use(/*...*/);
bot.use(composer); // ¡composer es un objeto middleware!

bot.use(/*...*/);
bot.use(/*...*/);
// ...
```

Si quieres profundizar en cómo grammY implementa el middleware, consulta [Middleware Redux](../advanced/middleware) en la sección avanzada de la documentación.
