# Manejo de archivos

Los bots de Telegram no sólo pueden enviar y recibir mensajes de texto, sino también muchos otros tipos de mensajes, como fotos y vídeos.
Esto implica el manejo de los archivos que se adjuntan a los mensajes.

## Cómo funcionan los archivos para los bots de Telegram

> Esta sección explica cómo funcionan los archivos para los bots de Telegram.
> Si quieres saber cómo puedes trabajar con archivos en grammY desplázate hacia abajo para [descargar](#reciviendo-archivos) y [subir](#envio-de-archivos) archivos.

Los archivos se almacenan por separado de los mensajes.
Un archivo en los servidores de Telegram es identificado por un `file_id`, que es sólo una larga cadena de caracteres.
Por ejemplo, podría parecerse a `AgADBAADZRAxGyhM3FKSE4qKa-RODckQHxsoABDHe0BDC1GzpGACAAEC`.

### Identificadores para recibir archivos

> Los robots sólo reciben identificadores de ficheros.
> Si quieren obtener contenidos de archivos, tienen que solicitarlos explícitamente.

Siempre que tu bot **reciba** un mensaje con un archivo, no recibirá directamente los datos completos del archivo, sino sólo el `file_id`.
Si tu bot realmente quiere descargar el archivo, entonces puede hacerlo llamando al método `getFile` ([Referencia Telegram Bot API](https://core.telegram.org/bots/api#getfile)).
Este método te permite descargar el archivo construyendo una URL especial y temporal.
Ten en cuenta que la validez de esta URL sólo está garantizada durante 60 minutos, después de los cuales puede expirar. En este caso, puedes simplemente llamar a `getFile` de nuevo.

Los archivos se pueden recibir como [esto](#reciviendo-archivos).

### Identificadores para el envío de ficheros

> Al enviar archivos también se obtiene un identificador de archivo.

Siempre que tu bot **envíe** un mensaje con un archivo, recibirá información sobre el mensaje enviado, incluyendo el `file_id` del archivo enviado.
Esto significa que todos los archivos que el bot vea, tanto a través del envío como de la recepción, pondrán un `file_id` a disposición del bot.
Si quieres trabajar con un archivo después de que tu bot lo vea, siempre debes almacenar su `file_id`.

> Utiliza identificadores de archivo siempre que puedas.
> Son muy eficientes.

Cuando un bot envía un mensaje, puede **especificar un `file_id` que haya visto antes**.
Esto le permitirá enviar el archivo identificado, sin necesidad de subir los datos para ello.

Puede reutilizar el mismo `file_id` tantas veces como quiera, por lo que podría enviar el mismo archivo a cinco chats diferentes, utilizando el mismo `file_id`.
Sin embargo, debes asegurarte de utilizar el método correcto---por ejemplo, no puedes utilizar un `file_id` que identifique una foto al llamar a [`sendVideo`](https://core.telegram.org/bots/api#sendvideo).

Los archivos pueden enviarse como [esto](#envio-de-archivos).

### Los identificadores pueden sorprenderte

> Los identificadores de archivo **sólo funcionan para tu bot**.
> Si otro bot usa tus identificadores de archivo, puede funcionar aleatoriamente y estrellarse aleatoriamente y matar gatitos inocentes aleatoriamente.
> :cat: → :skull:

Cada bot tiene su propio conjunto de `file_id` para los archivos a los que puede acceder.
No puedes usar de forma fiable un `file_id` del bot de tu amigo, para acceder a un archivo con _tu_ bot.
Cada bot utilizará diferentes identificadores para el mismo archivo.
Esto implica que no puedes simplemente adivinar un `file_id` y acceder a un archivo de una persona al azar, porque Telegram mantiene un registro de qué `file_id`s son válidos para tu bot.

::: warning Uso de `file_id`s extranjeros
Ten en cuenta que en algunos casos _es_ técnicamente posible que un `file_id` de otro bot parezca funcionar correctamente.
**Sin embargo, el uso de un `file_id` extranjero es peligroso, ya que puede dejar de funcionar en cualquier momento, sin previo aviso.
Por lo tanto, asegúrate siempre de que cualquier `file_id` que utilices sea originalmente para tu bot.
:::

> Un fichero puede tener varios identificadores.

Por otro lado, es posible que un bot vea eventualmente el mismo archivo identificado por diferentes `file_id`s.
Esto significa que no puedes confiar en la comparación de `file_id`s para comprobar si dos archivos son el mismo.
Si necesitas identificar el mismo fichero a lo largo del tiempo (o a través de múltiples bots), debes utilizar el valor `file_unique_id` que tu bot recibe junto con cada `file_id`.

El `file_unique_id` no se puede utilizar para descargar archivos, pero será el mismo para cualquier archivo dado, a través de cada bot.

## Reciviendo archivos

Puedes manejar archivos como cualquier otro mensaje.
Por ejemplo, si quieres escuchar mensajes de voz, puedes hacer lo siguiente:

```ts
bot.on("message:voice", async (ctx) => {
  const voice = ctx.msg.voice;

  const duration = voice.duration; // en segundos
  await ctx.reply(
    `Su mensaje de voz tiene una duración de ${duration} segundos.`,
  );

  const fileId = voice.file_id;
  await ctx.reply(
    "El identificador de archivo de tu mensaje de voz es: " + fileId,
  );

  const file = await ctx.getFile(); // válido durante al menos 1 hora
  const path = file.file_path; // ruta del archivo en el servidor de la API de Bot
  await ctx.reply("Descargue su propio archivo de nuevo: " + path);
});
```

::: tip Pasar un file_id personalizado a getFile
En el objeto de contexto, `getFile` es un [acceso directo](../guide/context#atajos), y obtendrá la información de un archivo en el mensaje actual.
Si quieres obtener un archivo diferente mientras manejas un mensaje, utiliza `ctx.api.getFile(file_id)` en su lugar.
:::

> Consulta the [`:media` and `:file` shortcuts](../guide/filter-queries#accesos-directos) para las consultas de filtro si quieres recibir cualquier tipo de archivo.

Una vez que hayas llamado a `getFile`, puedes usar el `file_path` devuelta para descargar el archivo usando esta URL `https://api.telegram.org/file/bot<token>/<file_path>`, donde `<token>` debe ser reemplazado por tu token de bot.

Si [ejecutas tu propio servidor Bot API](./api#ejecutar-un-servidor-local-de-bot-api), la `file_path` será en su lugar una ruta de archivo absoluta que apunta a un archivo en tu disco local.
En ese caso, ya no tendrás que descargar nada, ya que el servidor de la API de bots descargará el archivo por ti cuando llames a `getFile`.

::: tip Plugin de archivos
grammY no viene con su propio descargador de archivos, pero puedes instalar el [plugin oficial de archivos](../plugins/files).
Esto permite descargar archivos mediante `await file.download()`, y obtener una URL de descarga para ellos mediante `file.getUrl()`.
:::

## Envío de archivos

Los bots de Telegram tienen [tres formas](https://core.telegram.org/bots/api#sending-files) de enviar archivos:

1. A través de `file_id`, es decir, enviando un archivo por un identificador que ya conoce el bot.
2. Vía URL, es decir, pasando una URL de archivo pública, que Telegram descarga y envía por ti.
3. Mediante la subida de tu propio archivo.

En todos los casos, los métodos a los que hay que llamar tienen el mismo nombre.
Dependiendo de cuál de las tres formas elija para enviar su archivo, los parámetros de estas funciones variarán.
Por ejemplo, para enviar una foto, puedes utilizar `ctx.replyWithPhoto` (o `sendPhoto` si utilizas `ctx.api` o `bot.api`).

Puedes enviar otros tipos de archivos simplemente cambiando el nombre del método y el tipo de datos que le pasas.
Para enviar un vídeo, puedes utilizar `ctx.replyWithVideo`.
Es el mismo caso para un documento: `ctx.replyWithDocument`.
Ya te haces una idea.

Vamos a profundizar en cuáles son las tres formas de enviar un archivo.

### Mediante `file_id` o URL

Los dos primeros métodos son sencillos: sólo tienes que pasar el valor respectivo como una `cadena`, y ya está.

```ts
// Enviar a través de file_id.
await ctx.replyWithPhoto(existingFileId);

// Enviar a través de URL.
await ctx.replyWithPhoto("https://grammy.dev/images/grammY.png");

// Alternativamente, se utiliza bot.api.sendPhoto() o ctx.api.sendPhoto().
```

### Cómo subir tus propios archivos

grammY tiene un buen soporte para subir tus propios archivos.
Puedes hacerlo importando y utilizando la clase `InputFile` ([Referencia grammY API](/ref/core/inputfile)).

```ts
// Enviar un archivo a través de la ruta local
await ctx.replyWithPhoto(new InputFile("/tmp/picture.jpg"));

// alternativamente, usa bot.api.sendPhoto() o ctx.api.sendPhoto()
```

El constructor `InputFile` no sólo toma rutas de archivos, sino también flujos, objetos `Buffer`, iteradores asíncronos, y---dependiendo de su plataforma---más, o una función que crea cualquiera de estas cosas.
Todo lo que necesitas recordar es: **crear una instancia de `InputFile` y pasarla a cualquier método para enviar un archivo**.
Las instancias de `InputFile` se pueden pasar a todos los métodos que aceptan el envío de archivos por carga.

Así es como puedes construir `InputFile`s.

#### Cargar un archivo desde el disco

Si ya tiene un archivo almacenado en su máquina, puede dejar que grammY cargue este archivo.

::: code-group

```ts [Node.js]
import { createReadStream } from "fs";

// Enviar un archivo local.
new InputFile("/ruta/a/archivo");

// Enviar desde un flujo de lectura.
new InputFile(createReadStream("/ruta/a/archivo"));
```

```ts [Deno]
// Enviar un archivo local.
new InputFile("/ruta/a/archivo");

// Enviar una instancia `Deno.FsFile`.
new InputFile(await Deno.open("/ruta/a/archivo"));
```

:::

#### Carga de datos binarios sin procesar

También se puede enviar un objeto `Buffer`, o un iterador que produzca objetos `Buffer`.
En Deno, también se pueden enviar objetos `Blob`.

::: code-group

```ts [Node.js]
// Enviar un buffer o un array de bytes.
const buffer = Uint8Array.from([65, 66, 67]);
new InputFile(buffer); // "ABC"
// Enviar un iterable.
new InputFile(function* () {
  // "ABCABCABCABC"
  for (let i = 0; i < 4; i++) yield buffer;
});
```

```ts [Deno]
// Enviar un blob.
const blob = new Blob("ABC", { type: "text/plain" });
new InputFile(blob);
// Enviar un buffer o un array de bytes.
const buffer = Uint8Array.from([65, 66, 67]);
new InputFile(buffer); // "ABC"
// Enviar un iterable.
new InputFile(function* () {
  // "ABCABCABCABC"
  for (let i = 0; i < 4; i++) yield buffer;
});
```

:::

#### Descargar y volver a cargar un archivo

Puedes hacer que grammY descargue un archivo de Internet.
Esto no guardará el archivo en tu disco.
En su lugar, grammY sólo canalizará los datos, y sólo mantendrá una pequeña parte de ellos en la memoria.
Esto es muy eficiente.

> Ten en cuenta que Telegram soporta la descarga del archivo por ti en muchos métodos.
> Si es posible, deberías preferir [enviar el archivo vía URL](#mediante-file-id-o-url), en lugar de usar `InputFile` para transmitir el contenido del archivo a través de tu servidor.

```ts
// Descargar un archivo, y transmitir la respuesta a Telegram.
new InputFile(new URL("https://grammy.dev/images/grammY.png"));
new InputFile({ url: "https://grammy.dev/images/grammY.png" }); // equivalente
```

### Añadir un pie de foto

Cuando se envían archivos, se pueden especificar más opciones en un objeto de opciones de tipo `Other`, exactamente como se explicó [anteriormente](./basics#envio-de-mensajes).
Por ejemplo, esto le permite enviar subtítulos.

```ts
// Enviar una foto desde un archivo local al usuario 12345 con el título "foto.jpg".
await bot.api.sendPhoto(12345, new InputFile("/ruta/a/la/foto.jpg"), {
  caption: "foto.jpg",
});
```

Como siempre, al igual que con el resto de métodos de la API, puedes enviar archivos a través de `ctx` (lo más fácil), `ctx.api`, o `bot.api`.

## Límites de tamaño de los archivos

grammY puede enviar archivos sin ningún límite de tamaño, sin embargo, Telegram restringe el tamaño de los archivos como está documentado [aquí](https://core.telegram.org/bots/api#sending-files).
Esto significa que tu bot no puede descargar archivos de más de 20 MB, o subir archivos de más de 50 MB.
Algunas combinaciones tienen límites aún más estrictos, como las fotos enviadas por URL (5 MB).

Como se mencionó en una [sección anterior](./api), tu bot es capaz de trabajar con archivos grandes con algo de esfuerzo extra.
Si quieres soportar la subida de archivos de hasta 2000 MB (tamaño máximo de archivo en Telegram) y la descarga de archivos de cualquier tamaño ([4000 MB con Telegram Premium](https://t.me/premium/5)), debes [alojar tu propio servidor Bot API](./api#ejecutar-un-servidor-local-de-bot-api) además de alojar tu bot.

Alojar tu propio servidor Bot API no tiene, en sí mismo, nada que ver con grammY.
Sin embargo, grammY soporta todos los métodos que se necesitan para configurar tu bot para usar tu propio servidor Bot API.
