# Consultas de filtro y `bot.on()`

El primer argumento de `bot.on()` es una cadena llamada _filter query_.

## Introducción

La mayoría (¿todos?) de los otros frameworks de bots permiten realizar una forma primitiva de filtrado para las actualizaciones, por ejemplo, sólo `on("message")` y similares.
El resto del filtrado de los mensajes se deja al desarrollador, lo que a menudo conduce a interminables declaraciones `if` en su código.

Por el contrario, **grammY incluye su propio lenguaje de consulta** que puedes utilizar para **filtrar exactamente los mensajes** que quieras.

Esto permite utilizar más de 1150 filtros diferentes, y es posible que añadamos más con el tiempo.
Todos los filtros válidos se pueden autocompletar en el editor de código.
Por lo tanto, puedes simplemente escribir `bot.on("")`, abrir el autocompletado, y buscar entre todas las consultas escribiendo algo

![Filtro de búsqueda de consultas](/images/filter-query-search.png)

La inferencia de tipos de `bot.on()` comprenderá la consulta de filtro que hayas elegido.
Por lo tanto, ajusta algunos tipos en el contexto que se sabe que existen.

```ts
bot.on("message", async (ctx) => {
  // Podría ser undefined si el mensaje recibido no tiene texto.
  const text: string | undefined = ctx.msg.text;
});
bot.on("message:text", async (ctx) => {
  // El texto siempre está presente porque este manejador es llamado cuando se recibe un mensaje de texto.
  const text: string = ctx.msg.text;
});
```

En cierto sentido, grammY implementa las consultas de filtro tanto [en tiempo de ejecución](#rendimiento), como [a nivel de tipo](#seguridad-de-tipos).

## Ejemplos de consulta

Aquí hay algunos ejemplos de consultas:

### Consultas regulares

Filtros simples para actualizaciones, y sub-filtros:

```ts
bot.on("message"); // se llama cuando se recibe cualquier mensaje
bot.on("message:text"); // sólo mensajes de texto
bot.on("message:photo"); // sólo mensajes de foto
```

### Filtro para entidades

Subfiltros que van un nivel más allá:

```ts
bot.on("message:entities:url"); // mensajes que contienen una URL
bot.on("message:entities:code"); // mensajes que contienen un fragmento de código
bot.on("edited_message:entities"); // mensajes editados con cualquier tipo de entidades
```

### Omitir valores

Puedes omitir algunos valores en las consultas del filtro.
Entonces grammY buscará entre diferentes valores para que coincidan con tu consulta.

```ts
bot.on(":text"); // cualquier mensaje de texto y cualquier mensaje de texto de los canales
bot.on("::url"); // mensajes con URL en el texto o en el pie de foto (fotos, etc)
bot.on("::email"); // mensajes o publicaciones de canales con email en texto o pie de foto
```

Si se omite el valor _first_, se pueden obtener tanto los mensajes como los mensajes del canal.
[Recuerde](./context#acciones-disponibles) que `ctx.msg` le da acceso tanto a los mensajes como a las publicaciones del canal, lo que coincida con la consulta.

Si se omite el valor _segundo_, se obtiene acceso tanto a las entidades como a los subtítulos.
Puede omitir tanto la primera como la segunda parte al mismo tiempo.

### Accesos directos

El motor de consulta de grammY permite definir accesos directos que agrupan consultas relacionadas.

#### `msg`

El atajo `msg` agrupa los nuevos mensajes y los nuevos mensajes del canal.
En otras palabras, usar `msg` es equivalente a escuchar los eventos `"message"` y `"channel_post"`.

```ts
bot.on("msg"); // cualquier mensaje o mensaje de canal
bot.on("msg:text"); // exactamente lo mismo que `:text`.
```

#### `edit`

Este atajo `edit` agrupa los mensajes editados y los mensajes editados del canal.
En otras palabras, usar `edit` equivale a escuchar los eventos `"edited_message"` y `"edited_channel_post"`.

```ts
bot.on("edit"); // cualquier edición de mensajes o publicaciones del canal
bot.on("edit:text"); // ediciones de mensajes de texto
bot.on("edit::url"); // ediciones de mensajes o entradas de canal con URL
bot.on("edit:location"); // actualización de la ubicación en vivo
```

#### `:media`

El atajo `:media` agrupa los mensajes de foto y vídeo.
En otras palabras, utilizar `:media` equivale a escuchar tanto eventos `":photo"` como `":video"`.

```ts
bot.on("message:media"); // mensajes de foto y video
bot.on("edited_channel_post:media"); // mensajes editados del canal con medios
bot.on(":media"); // mensajes multimedia o publicaciones del canal
```

#### `:archivo`

El atajo `:file` agrupa todos los mensajes que contienen un archivo.
En otras palabras, utilizar `:file` equivale a escuchar los eventos `":photo"`, `":animation"`, `":audio"`, `":document"`, `":video"`, `":video_note"`, `":voice"`, y `":sticker"`.
Por lo tanto, puedes estar seguro de que `await ctx.getFile()` te dará un objeto archivo.

```ts
bot.on(":file"); // archivos en mensajes o mensajes del canal
bot.on("edit:file"); // ediciones de mensajes de archivos o mensajes de canales de archivos
```

### Azúcar sintáctico

Hay dos casos especiales para las partes de consulta que hacen más cómodo el filtrado para usuarios.
Puedes detectar bots en las consultas con la parte de consulta `:is_bot`.
El azúcar sintáctico `:me` se puede utilizar para referirse a su bot desde dentro de una consulta, que comparará los identificadores de usuario para usted.

```ts
// Un mensaje de servicio sobre un bot que se unió al chat
bot.on("message:new_chat_members:is_bot");
// Un mensaje de servicio sobre un bot que se ha dado de baja
bot.on("message:left_chat_member:me");
```

Tenga en cuenta que aunque este azúcar sintáctico es útil para trabajar con mensajes de servicio, no debe utilizarse para detectar si alguien realmente se une o abandona un chat.
Los mensajes de servicio son mensajes que informan a los usuarios en el chat, y algunos de ellos no serán visibles en todos los casos.
Por ejemplo, en los grupos grandes, no habrá mensajes de servicio sobre los usuarios que se unen o abandonan el chat.
Por lo tanto, es posible que tu bot no se dé cuenta de ello.
En su lugar, deberías escuchar las [actualizaciones de los miembros del chat](#actualizaciones-de-los-miembros-del-chat).

## Combinación de varias consultas

Puede combinar cualquier número de consultas de filtro con las operaciones AND y OR.

### Combinar con OR

Si quiere instalar alguna pieza de middleware detrás de la concatenación OR de dos consultas, puede pasar ambas a `bot.on()` en un array.

```ts
// Se ejecuta si la actualización es sobre un mensaje O una edición de un mensaje
bot.on(["message", "edited_message"] /* , ... */);
// Se ejecuta si se encuentra un hashtag O un correo electrónico O una entidad de mención en el texto o en el pie de foto
bot.on(["::hashtag", "::email", "::mention"] /* , ... */);
```

El middleware se ejecutará si _cualquiera de las consultas proporcionadas_ coincide.
El orden de las consultas no importa.

### Combinar con AND

Si quieres instalar alguna pieza de middleware detrás de la concatenación AND de dos consultas, puedes encadenar las llamadas a `bot.on()`.

```ts
// Coincide con las URLs reenviadas
bot.on("::url").on(":forward_origin" /* , ... */);
// Coincide con las fotos que contienen un hashtag en el pie de foto
bot.on(":photo").on("::hashtag" /* , ... */);
```

El middleware se ejecutará si _todas las consultas proporcionadas_ coinciden.
El orden de las consultas no importa.

### Construcción de consultas complejas

Es técnicamente posible combinar consultas de filtro a fórmulas más complicadas si están en [CNF](https://en.wikipedia.org/wiki/Conjunctive_normal_form), aunque es poco probable que esto sea útil.

```ts
bot
  // Coincide con todas las publicaciones del canal o los mensajes reenviados ...
  .on(["channel_post", ":forward_origin"])
  // ... que contengan texto ...
  .on(":text")
  // ... con al menos una URL, un hashtag o un cashtag.
  .on(["::url", "::hashtag", "::cashtag"] /* , ... */);
```

La inferencia de tipo de `ctx` recorrerá toda la cadena de llamadas e inspeccionará cada elemento de las tres llamadas a `.on`.
Como ejemplo, puede detectar que `ctx.msg.text` es una propiedad necesaria para el fragmento de código anterior.

## Consejos útiles

Aquí hay algunas características menos conocidas de las consultas de filtro que pueden ser útiles.
Algunas de ellas son un poco avanzadas, así que no dudes en pasar a la [siguiente sección](./commands).

### Actualizaciones de los miembros del chat

Puedes utilizar la siguiente consulta de filtro para recibir actualizaciones de estado sobre tu bot.

```ts
bot.on("my_chat_member"); // bloquear, desbloquear, unirse o abandonar
```

En los chats privados, se activa cuando el bot es bloqueado o desbloqueado.
En los grupos, esto se dispara cuando el bot es añadido o eliminado.
Ahora puedes inspeccionar `ctx.myChatMember` para saber qué ha pasado exactamente.

Esto no debe confundirse con

```ts
bot.on("chat_member");
```

que se puede utilizar para detectar los cambios de estado de otros miembros del chat, como cuando la gente se une, es promovida, etc.

> Ten en cuenta que las actualizaciones de `chat_member` deben ser habilitadas explícitamente especificando `allowed_updates` al iniciar tu bot.

### Combinación de consultas con otros métodos

Puedes combinar consultas de filtro con otros métodos de la clase `Composer` ([Referencia de la API](/ref/core/composer)), como `command` o `filter`.
Esto permite crear potentes patrones de manejo de mensajes.

```ts
bot.on(":forward_origin").command("help"); // comandos /help reenviados

// Solo maneja comandos en chats privados.
const pm = bot.chatType("private");
pm.command("start");
pm.command("help");
```

### Filtrado por tipo de remitente del mensaje

Hay cinco tipos diferentes de autores de mensajes en Telegram:

1. Autores de mensajes del canal
2. Reenvíos automáticos desde canales vinculados en grupos de discusión
3. Cuentas de usuarios normales, esto incluye a los bots (es decir, mensajes "normales")
4. Administradores que envían en nombre del grupo ([administradores anónimos](https://telegram.org/blog/filters-anonymous-admins-comments#anonymous-group-admins))
5. Usuarios que envían mensajes como uno de sus canales

Puedes combinar las consultas de filtro con otros mecanismos de gestión de actualizaciones para averiguar el tipo de autor del mensaje.

```ts
// Mensajes del canal enviados por `ctx.senderChat`
bot.on("channel_post");

// Reenvío automático desde el canal `ctx.senderChat`:
bot.on("message:is_automatic_forward");
// Mensajes regulares enviados por `ctx.from`
bot.on("mensaje").filter((ctx) => ctx.senderChat === undefined);
// Administrador anónimo en `ctx.chat`
bot.on("message").filter((ctx) => ctx.senderChat?.id === ctx.chat.id);
// Usuarios que envían mensajes en nombre de su canal `ctx.senderChat`
bot.on("message").filter((ctx) =>
  ctx.senderChat !== undefined && ctx.senderChat.id !== ctx.chat.id
);
```

### Filtrado por propiedades del usuario

Si quieres filtrar por otras propiedades de un usuario, tienes que realizar una petición adicional, por ejemplo `await ctx.getAuthor()` para el autor del mensaje.
Las consultas de filtrado no realizarán secretamente otras peticiones a la API por ti.
Sigue siendo sencillo realizar este tipo de filtrado:

```ts
bot.on("mensaje").filter(
  async (ctx) => {
    const user = await ctx.getAuthor();
    return user.status === "creator" | user.status === "administrator";
  },
  (ctx) => {
    // Maneja los mensajes de los creadores y administradores.
  },
);
```

### Reutilización de la lógica de consulta del filtro

Internamente, `bot.on` se basa en una función llamada `matchFilter`.
Toma una consulta de filtro y la compila en una función de predicado.
El predicado se pasa simplemente a `bot.filter` para filtrar las actualizaciones.

Puedes importar `matchFilter` directamente si quieres usarlo en tu propia lógica.
Por ejemplo, puedes decidir eliminar todas las actualizaciones que coincidan con una determinada consulta:

```ts
// Deja caer todos los mensajes de texto o las publicaciones del canal de texto.
bot.drop(matchFilter(":text"));
```

Análogamente, puedes hacer uso de los tipos de consulta de filtro que grammY utiliza internamente:

### Reutilización de los tipos de consulta de filtro

Internamente, `matchFilter` utiliza los [predicados de tipo](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) de TypeScript para acotar el tipo de `ctx`.
Toma un tipo `C extends Context` y un `Q extends FilterQuery` y produce `ctx is Filter<C, Q>`.
En otras palabras, el tipo `Filter` es lo que realmente recibes para tu `ctx` en el middleware.

Puedes importar `Filter` directamente si quieres utilizarlo en tu propia lógica.
Por ejemplo, puedes decidir definir una función manejadora que maneje objetos de contexto específicos que fueron filtrados por una consulta de filtro:

```ts
function handler(ctx: Filter<Context, ":text">) {
  // maneja el objeto de contexto filtrado
}

bot.on(":text", handler);
```

> Consulta las referencias de la API para [`matchFilter`](/ref/core/matchfilter), [`Filter`](/ref/core/filter), y [`FilterQuery`](/ref/core/filterquery) para seguir leyendo.

## El lenguaje de consulta

> Esta sección está pensada para los usuarios que quieran tener un conocimiento más profundo de las consultas de filtrado en grammY, pero no contiene ningún conocimiento necesario para crear un bot.

### Estructura de la consulta

Cada consulta consta de un máximo de tres partes de consulta.
Dependiendo del número de partes de consulta que tenga una consulta, diferenciamos entre consultas L1, L2 y L3, como `"message"`, `"message:entities"` y `"message:entities:url"`, respectivamente.

Las partes de la consulta están separadas por dos puntos (`:`).
Nos referimos a la parte hasta los primeros dos puntos o el final de la cadena de consulta como la _L1 parte_ de una consulta.
La parte desde los primeros dos puntos hasta los segundos o hasta el final de la cadena de consulta se denomina parte _L2_ de la consulta.
La parte que va desde los segundos dos puntos hasta el final de la cadena de consulta se denomina parte _L3_ de la consulta.

Ejemplo:

| Filter Query                 | L1 part     | L2 part      | L3 part     |
| ---------------------------- | ----------- | ------------ | ----------- |
| `"message"`                  | `"message"` | `undefined`  | `undefined` |
| `"message:entities"`         | `"message"` | `"entities"` | `undefined` |
| `"message:entities:mention"` | `"message"` | `"entities"` | `"mention"` |

### Validación de consultas

Aunque el sistema de tipos debería detectar todas las consultas de filtro inválidas en tiempo de compilación, grammY también comprueba todas las consultas de filtro pasadas en tiempo de ejecución durante la configuración.
Cada consulta de filtro pasada se compara con una estructura de validación que comprueba si es válida.
No sólo es bueno fallar inmediatamente durante la configuración en lugar de en tiempo de ejecución, también ha sucedido antes que los errores en TypeScript causen serios problemas con el sofisticado sistema de inferencia de tipos que potencia las consultas de filtro.
Si esto vuelve a ocurrir en el futuro, esto evitará problemas que podrían ocurrir de otra manera.
En este caso, se le proporcionarán mensajes de error útiles.

### Rendimiento

**grammY puede comprobar cada consulta de filtro en tiempo constante (amortizado) por actualización**, independientemente de la estructura de la consulta o de la actualización entrante.

La validación de las consultas de filtrado ocurre sólo una vez, cuando se inicializa el bot y se llama a `bot.on()`.

Al iniciarse, grammY deriva una función de predicado de la consulta de filtro dividiéndola en sus partes de consulta.
Cada parte se asignará a una función que realiza una única comprobación de veracidad para una propiedad del objeto, o dos comprobaciones si se omite la parte y es necesario comprobar dos valores.
Estas funciones se combinan entonces para formar un predicado que sólo tiene que comprobar tantos valores como sean relevantes para la consulta, sin iterar sobre las claves del objeto `Update`.

Este sistema utiliza menos operaciones que algunas bibliotecas de la competencia, que necesitan realizar comprobaciones de contención en arrays cuando se enrutan las actualizaciones.
El sistema de consulta de filtros de grammY es más rápido a pesar de ser mucho más potente.

### Seguridad de tipos

Como se ha mencionado anteriormente, las consultas de filtro restringirán automáticamente ciertas propiedades del objeto de contexto.
El predicado derivado de una o más consultas de filtro es un predicado de tipo TypeScript que realiza este estrechamiento.
En general, puede confiar en que la inferencia de tipo funciona correctamente.
Si se infiere que una propiedad está presente, puede confiar en ella.
Si se infiere que una propiedad está potencialmente ausente, significa que hay ciertos casos en los que falta.
No es una buena idea realizar cambios de tipo con el operador `!`.

> Puede que no te resulte obvio cuáles son esos casos.
> No dudes en preguntar en el [chat de grupo](https://t.me/grammyjs) si no puedes averiguarlo.

Calcular estos tipos es complicado.
Mucho conocimiento sobre la API del Bot fue invertido en esta parte de grammY.
Si quieres entender más sobre los enfoques básicos de cómo se calculan estos tipos, hay una [charla en YouTube](https://youtu.be/ZvT_xexjnMk) que puedes ver.
