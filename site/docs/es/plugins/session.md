# Sesiones y almacenamiento de datos (incluido)

Aunque siempre puedes escribir tu propio código para conectarte a un almacenamiento de datos de tu elección, grammY soporta un patrón de almacenamiento muy conveniente llamado _sesiones_.

> [Salta hacia abajo](#como-usar-las-sesiones) si sabes cómo funcionan las sesiones.

## ¿Por qué debemos pensar en el almacenamiento?

A diferencia de las cuentas de usuarios regulares en Telegram, los bots tienen [almacenamiento limitado en la nube](https://core.telegram.org/bots#how-are-bots-different-from-users) en la nube de Telegram.
Como resultado, hay algunas cosas que no puedes hacer con los bots:

1. No puedes acceder a los mensajes antiguos que recibió tu bot.
2. No puedes acceder a los mensajes antiguos que tu bot envió.
3. No puedes obtener una lista de todos los chats con tu bot.
4. Más cosas, por ejemplo, no hay resumen de medios, etc.

Básicamente, se reduce al hecho de que **un bot sólo tiene acceso a la información de la actualización entrante en ese momento** (por ejemplo, un mensaje), es decir, la información que está disponible en el objeto de contexto `ctx`.

En consecuencia, si _quieres acceder_ a datos antiguos, tienes que almacenarlos en cuanto lleguen.
Esto significa que debes tener un almacenamiento de datos, como un archivo, una base de datos o un almacenamiento en memoria.

Por supuesto, grammY te tiene cubierto aquí: no tienes que alojar esto tú mismo.
Puedes utilizar el almacenamiento de sesiones de grammY, que no necesita ninguna configuración y es gratuito para siempre.

> Naturalmente, hay muchos otros servicios que ofrecen almacenamiento de datos como servicio, y grammY se integra perfectamente con ellos también.
> Si quieres manejar tu propia base de datos, ten por seguro que grammY lo soporta igualmente bien.
> [Desplázate hacia abajo](#adaptadores-de-almacenamiento-conocidos) para ver qué integraciones están actualmente disponibles.

## ¿Qué son las sesiones?

Es muy común que los bots almacenen algún dato por chat.
Por ejemplo, digamos que queremos construir un bot que cuente el número de veces que un mensaje contiene el emoji de la pizza :pizza: en su texto.
Este bot podría añadirse a un grupo, y podría decir cuánto os gusta la pizza a ti y a tus amigos.

Cuando nuestro bot de pizza recibe un mensaje, tiene que recordar cuántas veces ha visto una :pizza: en ese chat antes.
Su recuento de pizzas no debería cambiar, por supuesto, cuando su hermana añada el bot de pizzas a su chat de grupo, así que lo que realmente queremos es almacenar _un contador por chat_.

Las sesiones son una forma elegante de almacenar datos _por chat_.
Utilizarías el identificador del chat como clave en tu base de datos, y un contador como valor.
En este caso, llamaríamos al identificador del chat la _clave de la sesión_.
(Puedes leer más sobre las claves de sesión [aquí abajo](#claves-de-sesion).
Efectivamente, tu bot almacenará un mapa desde un identificador de chat a unos datos de sesión personalizados, es decir, algo así:

```json:no-line-numbers
{
  "424242": { "pizzaCount": 24 },
  "987654": { "pizzaCount": 1729 }
}
```

> Cuando decimos base de datos, en realidad nos referimos a cualquier solución de almacenamiento de datos.
> Esto incluye archivos, almacenamiento en la nube o cualquier otra cosa.

Bien, pero ¿qué son las sesiones ahora?

Podemos instalar un middleware en el bot que proporcionará los datos de la sesión del chat en `ctx.session` para cada actualización.
El plugin instalado hará algo antes y después de que nuestros manejadores sean llamados:

1. **Antes de nuestro middleware.**
   El plugin de sesión carga los datos de sesión del chat actual desde la base de datos.
   Almacena los datos en el objeto de contexto bajo `ctx.session`.
2. **Nuestro middleware se ejecuta.**
   Podemos _leer_ `ctx.session` para inspeccionar qué valor estaba en la base de datos.
   Por ejemplo, si se envía un mensaje al chat con el identificador `424242`, sería `ctx.session = { pizzaCount: 24 }` mientras se ejecuta nuestro middleware (al menos con el estado de la base de datos de ejemplo anterior).
   También podemos _modificar_ `ctx.session` arbitrariamente, por lo que podemos añadir, eliminar y cambiar campos a nuestro gusto.
3. **Después de nuestro middleware.**
   El middleware de sesión se asegura de que los datos se escriban de nuevo en la base de datos.
   Cualquiera que sea el valor de `ctx.session` después de que el middleware termine de ejecutarse, se guardará en la base de datos.

Como resultado, ya no tenemos que preocuparnos de comunicarnos con el almacenamiento de datos.
Simplemente modificamos los datos en `ctx.session`, y el plugin se encargará del resto.

## Cuándo usar las sesiones

> [Sáltate el paso](#como-usar-las-sesiones) si ya sabes que quieres usar sesiones.

Puede que pienses, esto es genial, ¡nunca más tendré que preocuparme por las bases de datos!
Y tienes razón, las sesiones son una solución ideal, pero sólo para algunos tipos de datos.

Según nuestra experiencia, hay casos de uso en los que las sesiones realmente brillan.
Por otro lado, hay casos en los que una base de datos tradicional puede ser más adecuada.

Esta comparación puede ayudarte a decidir si utilizar las sesiones o no.

|                            | Sesiones                                                      | Base de datos                                                                            |
| -------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| _Acceso_                   | un almacenamiento aislado **por chat**                        | accede a los mismos datos desde **múltiples chats**                                      |
| _Compartir_                | los datos son **sólo utilizados por el bot**                  | los datos son **utilizados por otros sistemas** (por ejemplo, un servidor web conectado) |
| _Formato_                  | cualquier objeto JavaScript: cadenas, números, matrices, etc. | cualquier dato (binario, archivos, estructurado, etc)                                    |
| _Tamaño por chat_          | preferiblemente menos de ~3 MB por chat                       | cualquier tamaño                                                                         |
| _Característica exclusiva_ | Requerida por algunos plugins de grammY.                      | Soporta transacciones de base de datos.                                                  |

Esto no significa que las cosas _no puedan funcionar_ si eliges sesiones/bases de datos por encima de las otras.
Por ejemplo, por supuesto que puedes almacenar grandes datos binarios en tu sesión.
Sin embargo, tu bot no funcionaría tan bien como podría hacerlo de otro modo, por lo que recomendamos usar sesiones sólo cuando tengan sentido.

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

Nótese que también tenemos que [ajustar el tipo de contexto](../guide/context.md#personalizacion-del-objeto-de-contexto) para que la sesión esté disponible en él.
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

Lo mismo pero mucho más corto:

```ts
bot.use(session({ initial: () => ({ pizzaCount: 0 }) }));
```

::: warning Compartir objetos
Asegúrate de crear siempre un _objeto nuevo_.
No **haga esto**:

```ts
// PELIGRO, MAL, INCORRECTO, PARAR
const initialData = { pizzaCount: 0 }; // NO
bot.use(session({ initial: { pizzaCount: 0 } })); // EL MAL
```

Si se hiciera esto, varios chats podrían compartir el mismo objeto de sesión en la memoria.
Por lo tanto, cambiar los datos de la sesión en un chat puede afectar accidentalmente a los datos de la sesión en el otro chat.
:::

También puede omitir la opción `initial` por completo, aunque se aconseja no hacerlo.
Si no la especifica, la lectura de `ctx.session` arrojará un error para los nuevos usuarios.

### Claves de sesión

> Esta sección describe una característica avanzada de la que la mayoría de la gente no tiene que preocuparse.
> Es posible que desee continuar con la sección sobre [almacenamiento de sus datos](#almacenamiento-de-sus-datos).

Puedes especificar qué clave de sesión usar pasando una función llamada `getSessionKey` a las [opciones](https://deno.land/x/grammy/mod.ts?s=SessionOptions#prop_getSessionKey).
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
Asegúrese de entender las consecuencias de esta configuración leyendo el artículo [este](../guide/deployment-types.md) y especialmente [este](../plugins/runner.md#sequential-processing-where-necessary).
:::

### Migraciones de chat

Si está utilizando sesiones para grupos, debe tener en cuenta que Telegram migra grupos regulares a supergrupos en determinadas circunstancias (por ejemplo, [aquí](https://github.com/telegramdesktop/tdesktop/issues/5593)).

Esta migración solo ocurre una vez para cada grupo, pero puede causar inconsistencias.
Esto se debe a que el chat migrado es técnicamente un chat completamente diferente que tiene un identificador diferente y, por lo tanto, su sesión se identificará de manera diferente.

Actualmente, no existe una solución segura para este problema porque los mensajes de los dos chats también se identifican de manera diferente.
Esto puede conducir a carreras de datos.
Sin embargo, hay varias maneras de tratar este problema:

- Ignorar el problema.
  Los datos de la sesión del bot se restablecerán efectivamente cuando se migre un grupo.
  Comportamiento simple, confiable y predeterminado, pero potencialmente inesperado una vez por chat.
  Por ejemplo, si ocurre una migración mientras un usuario está en una conversación impulsada por el [complemento de conversaciones](./conversations.md), la conversación se restablecerá.

- Solo almacenar datos temporales (o datos con tiempos de espera) en la sesión y usar una base de datos para las cosas importantes que deben migrarse cuando migra un chat.
  Esto puede usar transacciones y lógica personalizada para manejar el acceso a datos simultáneos desde el chat antiguo y el nuevo.
  Es mucho esfuerzo y tiene un costo de rendimiento, pero es la única forma verdaderamente confiable de resolver este problema.

- En teoría, es posible implementar una solución alternativa que coincida con ambos chats **sin garantía de confiabilidad**.
  La API de Telegram Bot envía una actualización de migración para cada uno de los dos chats una vez que se activa la migración (consulte las propiedades `migrate_to_chat_id` o `migrate_from_chat_id` en los [Documentos de la API de Telegram](https://core.telegram.org/bots/api#message)).
  El problema es que no hay garantía de que estos mensajes se envíen antes de que aparezca un nuevo mensaje en el supergrupo.
  Por lo tanto, el bot podría recibir un mensaje del nuevo supergrupo antes de que se dé cuenta de cualquier migración y, por lo tanto, no puede hacer coincidir los dos chats, lo que genera los problemas antes mencionados.

- Otra solución alternativa sería limitar el bot solo para los supergrupos con [filtrado](../guide/filter-queries.md) (o limitar solo las funciones relacionadas con la sesión a los supergrupos).
  Sin embargo, esto traslada la problemática/inconveniencia a los usuarios.

- Dejar que los usuarios decidan explícitamente.
  ("Este chat se migró, ¿quieres transferir los datos del bot?")
  Mucho más confiable y transparente que las migraciones automáticas debido a la demora agregada artificialmente, pero peor UX.

Finalmente, depende del desarrollador decidir cómo manejar este caso límite.
Dependiendo de las funcionalidades del bot, se puede elegir una forma u otra.
Si los datos en cuestión son de corta duración (por ejemplo, temporales, tiempos de espera involucrados), la migración es un problema menor.
Un usuario experimentaría la migración como un contratiempo (si el momento no es el adecuado) y simplemente tendría que volver a ejecutar la función.

Ignorar el problema es seguramente la forma más fácil, sin embargo, es importante conocer este comportamiento.
De lo contrario, puede causar confusión y puede costar horas de tiempo de depuración.

### Almacenamiento de sus datos

En todos los ejemplos anteriores, los datos de la sesión se almacenan en su memoria RAM, por lo que tan pronto como su bot se detiene, todos los datos se pierden.
Esto es conveniente cuando desarrollas tu bot o si ejecutas pruebas automáticas (no se necesita configurar la base de datos), sin embargo, **es muy probable que no se desee en producción**.
En producción, querrás persistir tus datos, por ejemplo en un archivo, una base de datos, o algún otro almacenamiento.

Deberías utilizar la opción `storage` del middleware de sesión para conectarlo a tu almacén de datos.
Puede que ya haya un adaptador de almacenamiento escrito para grammY que puedas utilizar (ver [abajo](#adaptadores-de-almacenamiento-conocidos)), pero si no, normalmente sólo se necesitan 5 líneas de código para implementar uno tú mismo.

## Adaptadores de almacenamiento conocidos

Por defecto, las sesiones serán almacenadas [en su memoria](#ram-por-defecto) por el adaptador de almacenamiento incorporado.
También puedes utilizar las sesiones persistentes que grammY [ofrece gratuitamente](#almacenamiento-gratuito), o conectarte a [almacenamientos externos](#soluciones-de-almacenamiento-externo).

Así es como puedes instalar uno de los adaptadores de almacenamiento desde abajo.

```ts
const storageAdapter = ... // depende de la configuración

bot.use(session({
  initial: ...
  storage: storageAdapter,
}));
```

### RAM (por defecto)

Por defecto, todos los datos se almacenan en la memoria RAM.
Esto significa que todas las sesiones se pierden tan pronto como tu bot se detenga.

Puedes usar la clase `MemorySessionStorage` ([API Reference](https://deno.land/x/grammy/mod.ts?s=MemorySessionStorage)) del paquete central de grammY si quieres configurar más cosas sobre el almacenamiento de datos en la RAM.

```ts
bot.use(session({
  initial: ...
  storage: new MemorySessionStorage() // también el valor por defecto
}));
```

### Almacenamiento gratuito

> El almacenamiento gratuito está pensado para ser utilizado en proyectos de aficionados.
> Las aplicaciones a escala de producción deberían alojar su propia base de datos.
> La lista de integraciones soportadas de soluciones de almacenamiento externo está [aquí abajo](#soluciones-de-almacenamiento-externo).

Un beneficio de usar grammY es que obtienes acceso a almacenamiento gratuito en la nube.
No requiere ninguna configuración - toda la autenticación se hace usando tu token de bot.
¡Echa un vistazo a el [repositorio](https://github.com/grammyjs/storage-free)!

Es muy fácil de usar:

<CodeGroup>
<CodeGroupItem title="TypeScript" active>

```ts
import { freeStorage } from "@grammyjs/storage-free";

bot.use(session({
  initial: ...
  storage: freeStorage<SessionData>(bot.token),
}));
```

</CodeGroupItem>
<CodeGroupItem title="JavaScript">

```js
const { freeStorage } = require("@grammyjs/storage-free");

bot.use(session({
  initial: ...
  storage: freeStorage(bot.token),
}));
```

</CodeGroupItem>
<CodeGroupItem title="Deno">

```ts
import { freeStorage } from "https://deno.land/x/grammy_storage/free/mod.ts";

bot.use(session({
  initial: ...
  storage: freeStorage<SessionData>(bot.token),
}));
```

</CodeGroupItem>
</CodeGroup>

Ya está.
Tu bot ahora utilizará un almacenamiento de datos persistente.

Aquí hay un ejemplo de bot completo que puedes copiar para probarlo.

<CodeGroup>
<CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context, session, SessionFlavor } from "grammy";
import { freeStorage } from "@grammyjs/storage-free";

// Definir la estructura de la sesión.
interface SessionData {
  count: number;
}
type MyContext = Context & SessionFlavor<SessionData>;

// Crear el bot y registrar el middleware de sesión.
const bot = new Bot<MyContext>("");

bot.use(session({
  initial: () => ({ count: 0 }),
  storage: freeStorage<SessionData>(bot.token),
}));

// Utilizar datos de sesión persistentes en los manejadores de actualización.
bot.on("message", async (ctx) => {
  ctx.session.count++;
  await ctx.reply(`Message count: ${ctx.session.count}`);
});

bot.catch((err) => console.error(err));
bot.start();
```

</CodeGroupItem>
<CodeGroupItem title="JavaScript">

```js
const { Bot, session } = require("grammy");
const { freeStorage } = require("@grammyjs/storage-free");

// Crear el bot y registrar el middleware de sesión.
const bot = new Bot("");

bot.use(session({
  initial: () => ({ count: 0 }),
  storage: freeStorage(bot.token),
}));

// Utilizar datos de sesión persistentes en los manejadores de actualización.
bot.on("message", async (ctx) => {
  ctx.session.count++;
  await ctx.reply(`Message count: ${ctx.session.count}`);
});

bot.catch((err) => console.error(err));
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
import { freeStorage } from "https://deno.land/x/grammy_storage/free/mod.ts";

// Definir la estructura de la sesión.
interface SessionData {
  count: number;
}
type MyContext = Context & SessionFlavor<SessionData>;

// Crear el bot y registrar el middleware de sesión.
const bot = new Bot<MyContext>("");

bot.use(session({
  initial: () => ({ count: 0 }),
  storage: freeStorage<SessionData>(bot.token),
}));

// Utilizar datos de sesión persistentes en los manejadores de actualización.
bot.on("message", async (ctx) => {
  ctx.session.count++;
  await ctx.reply(`Message count: ${ctx.session.count}`);
});

bot.catch((err) => console.error(err));
bot.start();
```

</CodeGroupItem>
</CodeGroup>

### Soluciones de almacenamiento externo

Mantenemos una colección de adaptadores de almacenamiento oficiales que le permiten almacenar los datos de su sesión en diferentes lugares.
Cada uno de ellos requerirá que te registres en un proveedor de alojamiento, o que alojes tu propia solución de almacenamiento.

Visite [aquí](https://github.com/grammyjs/storages/tree/main/packages#grammy-storages) para ver una lista de los adaptadores compatibles actualmente y obtener orientación sobre su uso.

::: tip ¿Su almacenamiento no es compatible? No hay problema.
Crear un adaptador de almacenamiento personalizado es extremadamente sencillo.
La opción `storage` funciona con cualquier objeto que se adhiera a [esta interfaz](https://deno.land/x/grammy/mod.ts?s=StorageAdapter), por lo que puedes conectarte a tu almacenamiento con sólo unas líneas de código.

> Si has publicado tu propio adaptador de almacenamiento, no dudes en editar esta página y enlazarla aquí, para que otras personas puedan utilizarla.

:::

Todos los adaptadores de almacenamiento pueden instalarse de la misma manera.
En primer lugar, debes buscar el nombre del paquete del adaptador que hayas elegido.
Por ejemplo, el adaptador de almacenamiento para Supabase se llama `supabase`.

**En Node.js**, puedes instalar los adaptadores a través de `npm i @grammyjs/storage-<nombre>`.
Por ejemplo, el adaptador de almacenamiento para Supabase puede instalarse mediante `npm i @grammyjs/storage-supabase`.

**En Deno**, todos los adaptadores de almacenamiento se publican en el mismo módulo de Deno.
A continuación, puede importar el adaptador que necesite desde su sub-ruta en `https://deno.land/x/grammy_storages/<adaptador>/src/mod.ts`.
Por ejemplo, el adaptador de almacenamiento para Supabase puede importarse desde `https://deno.land/x/grammy_storages/supabase/src/mod.ts`.

Consulta los repositorios respectivos sobre cada configuración individual.
Contienen información sobre cómo conectarlos a tu solución de almacenamiento.

## Multi Sesiones

El plugin de sesión es capaz de almacenar diferentes fragmentos de sus datos de sesión en diferentes lugares.
Básicamente, esto funciona como si usted instalara múltiples instancias independientes del plugin de sesión, cada una con una configuración diferente.

Cada uno de estos fragmentos de datos tendrá un nombre bajo el cual puede almacenar sus datos.
Entonces podrás acceder a `ctx.session.foo` y `ctx.session.bar` y estos valores serán cargados desde diferentes almacenamientos de datos, y también serán escritos de vuelta a diferentes almacenamientos de datos.
Naturalmente, también se puede utilizar el mismo almacenamiento con una configuración diferente.

También es posible utilizar diferentes [claves de sesión](#claves-de-sesion) para cada fragmento.
Como resultado, puede almacenar algunos datos por chat y otros por usuario.

> Si está utilizando [grammY runner](./runner.md), asegúrese de configurar `sequentialize` correctamente devolviendo **todas** las claves de sesión como restricciones de la función.

Puede utilizar esta función pasando `type: "multi"` a la configuración de la sesión.
A su vez, tendrás que configurar cada fragmento con su propia configuración.

```ts
bot.use(session({
  type: "multi",
  foo: {
    // estos son también los valores por defecto
    storage: new MemorySessionStorage(),
    initial: () => undefined,
    getSessionKey: (ctx) => ctx.chat?.id.toString(),
  },
  bar: {
    initial: () => ({ prop: 0 }),
    storage: freeStorage(bot.token),
  },
  baz: {},
}));
```

Tenga en cuenta que debe añadir una entrada de configuración para cada fragmento que desee utilizar.
Si deseas utilizar la configuración por defecto, puedes especificar un objeto vacío (como hacemos con `baz` en el ejemplo anterior).

Sus datos de sesión seguirán consistiendo en un objeto con múltiples propiedades.
Por ello, el sabor de su contexto no cambia.
El ejemplo anterior podría utilizar esta interfaz al personalizar el objeto de contexto:

```ts
interface SessionData {
  foo?: string;
  bar: { prop: number };
  baz: { width?: number; height?: number };
}
```

Entonces puedes seguir usando `SessionFlavor<SessionData>` para tu objeto de contexto.

## Lazy Sessions

> Esta sección describe una optimización del rendimiento de la que la mayoría de la gente no tiene que preocuparse.

Las lazy sessions son una implementación alternativa de las sesiones que puede reducir significativamente el tráfico de la base de datos de tu bot al omitir operaciones de lectura y escritura superfluas.

Supongamos que tu bot está en un chat de grupo en el que no responde a los mensajes de texto normales, sino sólo a los comandos.
Sin sesiones, esto ocurriría:

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
bot.command("settings", async (ctx) => {
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
bot.command("reset", async (ctx) => {
  // Mucho más corto que tener que `esperar ctx.session` primero:
  ctx.session = ctx.session.then((stats) => {
    stats.counter = 0;
  });
});
```

Se puede argumentar bien que usar explícitamente `await` es preferible a asignar una promesa a `ctx.session`, la cuestión es que _podrías_ hacer esto si te gusta más ese estilo por alguna razón.

::: tip Plugins que necesitan sesiones
Los desarrolladores de plugins que hacen uso de `ctx.session` siempre deben permitir a los usuarios pasar `SessionFlavor | LazySessionFlavor` y por lo tanto soportar ambos modos.
En el código del plugin, simplemente espere `ctx.session` todo el tiempo: si se pasa un objeto no prometido, éste simplemente se evaluará a sí mismo, por lo que efectivamente sólo se escribe código para sesiones perezosas y así se soportan sesiones estrictas automáticamente.
:::

## Mejoras en el almacenamiento

El plugin de sesión es capaz de mejorar cualquier adaptador de almacenamiento añadiendo más funciones al mismo: [tiempos de espera](#tiempos-de-espera) y [migraciones](#migraciones).

Pueden ser instalados usando la función `enhanceStorage`.

```ts
// Usar el adaptador de almacenamiento mejorado.
bot.use(session({
  storage: enhanceStorage({
    storage: freeStorage(bot.token), // ajusta esto
    // más configuración aquí
  }),
}));
```

También puedes usar ambos al mismo tiempo.

### Tiempos de espera

La mejora de los tiempos de espera puede añadir una fecha de caducidad a los datos de la sesión.
Esto significa que puede especificar un período de tiempo, y si la sesión no se modifica durante este tiempo, los datos para el chat en particular serán eliminados.

Puede utilizar los tiempos de espera de la sesión a través de la opción `millisecondsToLive`.

```ts
const enhanced = enhanceStorage({
  almacenamiento,
  millisecondsToLive: 30 * 60 * 1000, // 30 min
});
```

Tenga en cuenta que el borrado real de los datos sólo se producirá la próxima vez que se lean los datos de la sesión correspondiente.

### Migraciones

Las migraciones son útiles si desarrollas más tu bot mientras ya existen datos de sesión.
Puedes usarlas si quieres cambiar tus datos de sesión sin romper todos los datos anteriores.

Esto funciona dando números de versión a los datos, y luego escribiendo pequeñas funciones de migración.
Las funciones de migración definen cómo actualizar los datos de sesión de una versión a la siguiente.

Intentaremos ilustrar esto con un ejemplo.
Supongamos que almacena información sobre la mascota de un usuario.
Hasta ahora, sólo has almacenado los nombres de las mascotas en un array de cadenas en `ctx.session.petNames`.

```ts
interfaz SessionData {
  petNames: string[];
}
```

Ahora te haces a la idea de que también quieres almacenar la edad de las mascotas.

Podrías hacer esto:

```ts
interfaz SessionData {
  petNames: string[];
  petBirthdays: number[];
}
```

Esto no rompería tus datos de sesión existentes.
Sin embargo, esto no es tan bueno, porque los nombres y los cumpleaños se almacenan ahora en lugares diferentes.
Lo ideal sería que tus datos de sesión tuvieran este aspecto:

```ts
interfaz Pet {
  nombre: cadena;
  cumpleaños: número;
}

interfaz SessionData {
  mascotas: Mascota[];
}
```

Las funciones de migración permiten transformar el antiguo array de cadenas en el nuevo array de objetos mascota.

<CodeGroup>
<CodeGroupItem title="TypeScript" active>

```ts
function addBirthdayToPets(old: { petNames: string[] }): SessionData {
  return {
    pets: old.petNames.map((name) => ({ name })),
  };
}

const enhanced = enhanceStorage({
  storage,
  migrations: {
    1: addBirthdayToPets,
  },
});
```

</CodeGroupItem>
<CodeGroupItem title="JavaScript">

```js
function addBirthdayToPets(old) {
  return {
    pets: old.petNames.map((name) => ({ name })),
  };
}

const enhanced = enhanceStorage({
  storage,
  migrations: {
    1: addBirthdayToPets,
  },
});
```

</CodeGroupItem>
</CodeGroup>

Siempre que se lean los datos de la sesión, la mejora del almacenamiento comprobará si los datos de la sesión ya están en la versión `1`.
Si la versión es inferior (o no existe porque no se utilizaba antes esta función), se ejecutará la función de migración.
Esto actualiza los datos a la versión `1`.
Por lo tanto, en tu bot, siempre puedes asumir que tus datos de sesión tienen la estructura más actualizada, y la mejora del almacenamiento se encargará del resto y migrará tus datos según sea necesario.

A medida que el tiempo evoluciona y tu bot cambia más, puedes añadir más y más funciones de migración:

```ts
const enhanced = enhanceStorage({
  almacenamiento,
  migraciones: {
    1: addBirthdayToPets,
    2: addIsFavoriteFlagToPets,
    3: addUserSettings,
    10: extendUserSettings,
    10.1: fixUserSettings,
    11: compressData,
  },
});
```

Puedes elegir cualquier número de JavaScript como versiones.
No importa la evolución de los datos de sesión de un chat, en cuanto se lea, se migrará a través de las versiones hasta utilizar la estructura más reciente.

## Resumen del plugin

Este plugin está incorporado en el núcleo de grammY.
No necesitas instalar nada para usarlo.
Simplemente importa todo desde el propio grammY.

Además, tanto la documentación como la referencia de la API de este plugin están unificadas con el paquete del núcleo.
