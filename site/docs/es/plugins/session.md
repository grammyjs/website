# Sesiones y almacenamiento de datos (incorporado)

Aunque siempre puedes escribir tu propio código para conectarte a un almacenamiento de datos de tu elección, grammY soporta un patrón de almacenamiento muy conveniente llamado _sessions_.

> [Salta hacia abajo](#how-to-use-sessions) si sabes cómo funcionan las sesiones.

## ¿Por qué debemos pensar en el almacenamiento?

A diferencia de las cuentas de usuarios regulares en Telegram, los bots tienen [almacenamiento limitado en la nube](https://core.telegram.org/bots#4-how-are-bots-different-from-humans) en la nube de Telegram.
Como resultado, hay algunas cosas que no puedes hacer con los bots:

1. No puedes acceder a los mensajes antiguos que recibió tu bot.
2. No puedes acceder a los mensajes antiguos que tu bot envió.
3. No puedes obtener una lista de todos los chats con tu bot.
4. Más cosas, por ejemplo, no hay resumen de medios, etc.

Básicamente, se reduce al hecho de que **un bot sólo tiene acceso a la información de la actualización entrante en ese momento** (por ejemplo, un mensaje), es decir, la información que está disponible en el objeto de contexto `ctx`.

En consecuencia, si _quieres acceder_ a datos antiguos, tienes que almacenarlos en cuanto lleguen.
Esto significa que debes tener un almacenamiento de datos, como un archivo, una base de datos o un almacenamiento en memoria.
Por supuesto, no tienes que alojarlo tú mismo, hay muchos servicios que ofrecen el almacenamiento de datos como servicio, es decir, otras personas alojarán tu base de datos por ti.

## ¿Qué son las sesiones?

Es muy común que los bots almacenen algún dato por chat.
Por ejemplo, digamos que queremos construir un bot que cuente el número de veces que un mensaje contiene el emoji de la pizza :pizza: en su texto.
Este bot podría añadirse a un grupo, y podría decir cuánto os gusta la pizza a ti y a tus amigos.

Cuando nuestro bot de la pizza recibe un mensaje, tiene que recordar cuántas veces ha visto antes un :pizza: en ese chat.
Por supuesto, el recuento de pizzas no debería cambiar cuando tu hermana añada el bot de la pizza a su chat de grupo, así que lo que realmente queremos es almacenar _un contador por chat_.

Las sesiones son una forma elegante de almacenar datos _por chat_.
Utilizarías el identificador del chat como clave en tu base de datos, y un contador como valor.
En este caso, llamaríamos al identificador del chat la _clave de la sesión_.

> Puedes leer más sobre las claves de sesión [aquí abajo](#session-keys).

Podemos instalar un middleware en el bot que proporcione los datos de sesión de un chat en `ctx.session` para cada actualización, cargándolos desde la base de datos antes de que se ejecute nuestro middleware.
También se aseguraría de que los datos de la sesión se escriben de nuevo en la base de datos una vez que hayamos terminado, de modo que nunca más tengamos que preocuparnos de comunicarnos con el almacenamiento de datos.

En nuestro ejemplo, tendríamos acceso a la cuenta de pizzas _del chat correspondiente_ en el objeto de sesión `ctx.session`.

## Cómo usar las sesiones

Puedes añadir soporte de sesión a grammY utilizando el middleware de sesión incorporado.

### Ejemplo de uso

Aquí hay un ejemplo de bot que cuenta los mensajes que contienen un emoji de pizza :pizza::

<CodeGroup>
 <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context, session, SessionFlavor } from "grammy";

// Definir la forma de nuestra sesión.
interface SessionData {
  pizzaCount: number;
}

// Tipo de flavor context para incluir las sesiones.
type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>("");

// Instalar el middleware de sesión, y definir el valor inicial de la sesión.
function initial(): SessionData {
  return { pizzaCount: 0 };
}
bot.use(session({ initial }));

bot.command("hunger", async (ctx) => {
  const count = ctx.session.pizzaCount;
  await ctx.reply(`¡Tu nivel de hambre es ${count}!`);
});

bot.hears(/.*🍕.*/, (ctx) => ctx.session.pizzaCount++);

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { Bot, session } = require("grammy");

const bot = new Bot("");

// Instalar el middleware de sesión, y definir el valor inicial de la sesión.
function initial() {
  return { pizzaCount: 0 };
}
bot.use(session({ initial }));

bot.command("hunger", async (ctx) => {
  const count = ctx.session.pizzaCount;
  await ctx.reply(`¡Tu nivel de hambre es ${count}!`);
});

bot.hears(/.*🍕.*/, (ctx) => ctx.session.pizzaCount++);

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import {
  Bot,
  Context,
  session,
  SessionFlavor,
} from "https://deno.land/x/grammy/mod.ts";

// Definir la forma de nuestra sesión.
interface SessionData {
  pizzaCount: number;
}

// Tipo de flavor context para incluir las sesiones.
type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>("");

// Instalar el middleware de sesión, y definir el valor inicial de la sesión.
function initial(): SessionData {
  return { pizzaCount: 0 };
}
bot.use(session({ initial }));

bot.command("hunger", async (ctx) => {
  const count = ctx.session.pizzaCount;
  await ctx.reply(`¡Tu nivel de hambre es ${count}!`);
});

bot.hears(/.*🍕.*/, (ctx) => ctx.session.pizzaCount++);

bot.start();
```

</CodeGroupItem>
</CodeGroup>

Nótese que también tenemos que [ajustar el tipo de contexto](/guide/context.md#customising-the-context-object) para que la sesión esté disponible en él.
El context flavor se llama `SessionFlavor`.

### Datos de la sesión inicial

Cuando un usuario contacta por primera vez con tu bot, no hay datos de sesión disponibles para él.
Por lo tanto, es importante que especifiques la opción `initial` para el middleware de sesión.
Pasa una función que genere un nuevo objeto con datos de sesión iniciales para los nuevos chats.

```ts
// Crea un nuevo objeto que se utilizará como datos iniciales de la sesión.
function createInitialSessionData() {
  return {
    pizzaCount: 0,
    // más datos aquí
  };
}
bot.use(session({ initial: createInitialSessionData }));
```

Same but much shorter:

```ts
bot.use(session({ initial: () => ({ pizzaCount: 0 }) }));
```

::: warning Compartir objetos
Asegúrate de crear siempre un _objeto nuevo_.
No **haga esto**:

```ts
// PELIGRO, MAL, INCORRECTO, PARAR
bot.use(session({ initial: { pizzaCount: 0 } })); // EL MAL
```

Si se hiciera esto, varios chats podrían compartir el mismo objeto de sesión en la memoria.
Por lo tanto, cambiar los datos de la sesión en un chat puede afectar accidentalmente a los datos de la sesión en el otro chat.
:::

También puede omitir la opción `initial` por completo, aunque se aconseja no hacerlo.
Si no la especifica, la lectura de `ctx.session` arrojará un error para los nuevos usuarios.

### Claves de sesión

Puedes especificar qué clave de sesión usar pasando una función llamada `getSessionKey` a las [opciones](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/SessionOptions#getSessionKey).
De esta manera, puedes cambiar fundamentalmente el funcionamiento del plugin de sesión.
Por defecto, los datos se almacenan por chat.
El uso de `getSessionKey` le permite almacenar los datos por usuario, o por combinación de usuario-chat, o como usted quiera.
Aquí hay tres ejemplos:

<CodeGroup>
 <CodeGroupItem title="TypeScript" active>

```ts
// Almacena los datos por chat (por defecto).
function getSessionKey(ctx: Context): string | undefined {
  // Permite que todos los usuarios de un chat grupal compartan la misma sesión,
  // pero dar una privada independiente a cada usuario en los chats privados
  return ctx.chat?.id.toString();
}

// Almacena los datos por usuario.
function getSessionKey(ctx: Context): string | undefined {
  // Da a cada usuario su almacenamiento de sesión personal
  // (se compartirá en los grupos y en su chat privado)
  return ctx.from?.id.toString();
}

// Almacena los datos por combinación usuario-chat.
function getSessionKey(ctx: Context): string | undefined {
  // Dar a cada usuario su almacenamiento de una sesión personal por chat con el bot
  // (una sesión independiente para cada grupo y su chat privado)
  return ctx.from === undefined || ctx.chat === undefined
    ? undefined
    : `${ctx.from.id}/${ctx.chat.id}`;
}

bot.use(session({ getSessionKey }));
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
// Almacena los datos por chat (por defecto).
function getSessionKey(ctx) {
  // Permite que todos los usuarios de un chat grupal compartan la misma sesión,
  // pero dar una privada independiente a cada usuario en los chats privados
  return ctx.chat?.id.toString();
}

// Almacena los datos por usuario.
function getSessionKey(ctx) {
  // Da a cada usuario su almacenamiento de sesión personal
  // (se compartirá en los grupos y en su chat privado)
  return ctx.from?.id.toString();
}

// Almacena los datos por combinación usuario-chat.
function getSessionKey(ctx) {
  // Dar a cada usuario su almacenamiento de una sesión personal por chat con el bot
  // (una sesión independiente para cada grupo y su chat privado)
  return ctx.from === undefined || ctx.chat === undefined
    ? undefined
    : `${ctx.from.id}/${ctx.chat.id}`;
}

bot.use(session({ getSessionKey }));
```

</CodeGroupItem>
</CodeGroup>

Siempre que `getSessionKey` devuelva `undefined`, `ctx.session` estará `undefined`.
Por ejemplo, el resolvedor de claves de sesión por defecto no funcionará para las actualizaciones de `poll`/`poll_answer` o `inline_query` porque no pertenecen a un chat (`ctx.chat` está `undefined`).

::: warning Claves de sesión y Webhooks
Cuando estés ejecutando tu bot con webhooks, deberías evitar usar la opción `getSessionKey`.
Telegram envía los webhooks secuencialmente por chat, por lo que la resolución de la clave de sesión por defecto es la única implementación que garantiza no causar pérdida de datos.

Si debes usar la opción (que por supuesto sigue siendo posible), debes saber lo que estás haciendo.
Asegúrese de entender las consecuencias de esta configuración leyendo el artículo [este](/guía/deployment-types.md) y especialmente [este](/plugins/runner.html#sequential-processing-where-necessary).
:::

### Almacenamiento de sus datos

En todos los ejemplos anteriores, los datos de la sesión se almacenan en su memoria RAM, por lo que tan pronto como su bot se detiene, todos los datos se pierden.
Esto es conveniente cuando desarrollas tu bot o si ejecutas pruebas automáticas (no se necesita configurar la base de datos), sin embargo, **es muy probable que no se desee en producción**.
En producción, querrás persistir tus datos, por ejemplo en un archivo, una base de datos, o algún otro almacenamiento.

Deberías utilizar la opción `storage` del middleware de sesión para conectarlo a tu almacén de datos.
Puede que ya haya un adaptador de almacenamiento escrito para grammY que puedas utilizar (ver [abajo](#known-storage-adapters), pero si no, normalmente sólo se necesitan 5 líneas de código para implementar uno tú mismo.

## Sesiones perezosas

Las sesiones perezosas son una implementación alternativa de las sesiones que puede reducir significativamente el tráfico de la base de datos de tu bot al omitir operaciones de lectura y escritura superfluas.

Supongamos que tu bot está en un chat de grupo en el que no responde a los mensajes de texto normales, sino sólo a los comandos.
Sin sesiones, esto sucedería:

1. Se envía una actualización con un nuevo mensaje de texto a tu bot
2. No se invoca ningún manejador, por lo que no se realiza ninguna acción
3. El middleware se completa inmediatamente

En cuanto se instalan sesiones (por defecto, estrictas), que proporcionan directamente los datos de la sesión en el objeto de contexto, sucede lo siguiente

1. La actualización con el nuevo mensaje de texto se envía a su bot
2. Los datos de la sesión se cargan desde el almacenamiento de la sesión (por ejemplo, la base de datos)
3. No se invoca ningún manejador, por lo que no se realiza ninguna acción
4. Los datos idénticos de la sesión se escriben de nuevo en el almacenamiento de la sesión
5. El middleware se completa, y ha realizado una lectura y una escritura en el almacenamiento de datos

Dependiendo de la naturaleza de tu bot, esto puede llevar a un montón de lecturas y escrituras superfluas.
Las sesiones perezosas te permiten saltarte los pasos 2. y 4. si resulta que ningún manejador invocado necesita datos de sesión.
En ese caso, no se leerá ningún dato del almacén de datos, ni se escribirá en él.

Esto se consigue interceptando el acceso a `ctx.session`.
Si no se invoca ningún gestor, nunca se accederá a `ctx.session`.
Las sesiones perezosas utilizan esto como un indicador para evitar la comunicación con la base de datos.

En la práctica, en lugar de tener los datos de la sesión disponibles en `ctx.session`, ahora tendrá _una promesa de los datos de la sesión_ disponible en `ctx.session`.

```ts
// Sesiones por defecto (sesiones estrictas)
bot.command("settings", (ctx) => {
  // `session` es el dato de la sesión
  const session = ctx.session;
});

// Lazy sessions
bot.command("settings", async (ctx) => {
  // `promise` es una Promise de los datos de la sesión, y
  const promise = ctx.session;
  // `session` es el dato de la sesión
  const session = await ctx.session;
});
```

Si nunca accedes a `ctx.session`, no se realizará ninguna operación, pero en cuanto accedas a la propiedad `session` del objeto contexto, se lanzará la operación de lectura.
Si nunca se lanza la lectura (o se asigna directamente un nuevo valor a `ctx.session`), sabemos que tampoco necesitaremos escribir ningún dato de vuelta, porque no hay forma de que haya sido alterado.
En consecuencia, nos saltamos también la operación de escritura.
Como resultado, conseguimos un mínimo de operaciones de lectura y escritura, pero puedes usar la sesión casi idéntica a la anterior, sólo con unas pocas palabras clave `async` y `await` mezcladas en tu código.

Entonces, ¿qué es necesario para utilizar sesiones perezosas en lugar de las sesiones por defecto (estrictas)?
Principalmente tienes que hacer tres cosas:

1. Flavor tu contexto con `LazySessionFlavor` en lugar de `SessionFlavor`.
   Funcionan de la misma manera, sólo que `ctx.session` se envuelve dentro de una promesa para la variante perezosa.
2. Usa `lazySession` en lugar de `session` para registrar tu middleware de sesión.
3. Pon siempre una promesa en línea `await ctx.session` en lugar de `ctx.session` en todas las partes de tu middleware, tanto para lecturas como para escrituras.
   No te preocupes: puedes `await` la promesa con tus datos de sesión tantas veces como quieras, pero siempre te referirás al mismo valor, así que nunca habrá lecturas duplicadas para una actualización.

Ten en cuenta que con las sesiones lazy, puedes asignar tanto objetos como promesas de objetos a `ctx.session`.
Si estableces que `ctx.session` sea una promesa, se `esperará` antes de escribir los datos de vuelta al almacenamiento de datos.
Esto permitiría el siguiente código:

```ts
bot.command("reset", (ctx) => {
  // Mucho más corto que tener que `esperar ctx.session` primero:
  ctx.session = ctx.session.then((stats) => {
    stats.counter = 0;
  });
});
```

Se puede argumentar bien que usar explícitamente `await` es preferible a asignar una promesa a `ctx.session`, la cuestión es que _podrías_ hacer esto si te gusta más ese estilo por alguna razón.

::: tip Plugins que necesitan sesiones
Los desarrolladores de plugins que hacen uso de `ctx.session` siempre deberían permitir a los usuarios pasar `SessionFlavor | LazySessionFlavor` y por lo tanto soportar ambos modi.
En el código del plugin, simplemente espere `ctx.session` todo el tiempo: si se pasa un objeto no prometido, éste simplemente se evaluará a sí mismo, por lo que efectivamente sólo se escribe código para sesiones perezosas y así se soportan sesiones estrictas automáticamente.
:::

## Adaptadores de almacenamiento conocidos

Por defecto, las sesiones serán almacenadas en su memoria por el adaptador de almacenamiento incorporado.
Aquí hay una lista de adaptadores de almacenamiento de los que tenemos conocimiento, y que le permiten almacenar sus datos de sesión en otros lugares.
Si has publicado tu propio adaptador de almacenamiento, por favor edita esta página y enlázala aquí, para que otras personas puedan utilizarla.

### Oficial

- Supabase: <https://github.com/grammyjs/storage-supabase>
- Base Deta.sh: <https://github.com/grammyjs/storage-deta>
- Google Firestore (sólo Node.js): <https://github.com/grammyjs/storage-firestore>

### Third-Party

- Archivos: <https://github.com/Satont/grammy-file-storage>
- MongoDB: <https://github.com/Satont/grammy-mongodb-storage>
- Redis: <https://github.com/Satont/grammy-redis-storage>
- PostgreSQL: <https://github.com/Satont/grammy-psql-storage>
- TypeORM (sólo Node.js): <https://github.com/Satont/grammy-typeorm-storage>
- ¡Envíe el suyo propio editando esta página!

## Resumen del plugin

Este plugin está incorporado en el núcleo de grammY.
No necesitas instalar nada para usarlo.
Simplemente importa todo desde el propio grammY.

Además, tanto la documentación como la referencia de la API de este plugin están unificadas con el paquete del núcleo.
