# Manejo de archivos simplificado en grammY (`files`)

Este plugin te permite descargar fácilmente archivos de los servidores de Telegram, y obtener una URL para que puedas descargar el archivo tú mismo.

## Descargando Archivos

Necesitas pasar el token de tu bot a este plugin porque debe autenticarse como tu bot cuando descarga archivos.
Este plugin entonces instala el método `download` en los resultados de la llamada `getFile`.
Ejemplo:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context } from "grammy";
import { FileFlavor, hydrateFiles } from "@grammyjs/files";

// Transformative Context flavor
type MyContext = FileFlavor<Context>;

// Crea un bot.
const bot = new Bot<MyContext>("");

// Usa el plugin.
bot.api.config.use(hydrateFiles(bot.token));

// Descarga vídeos y GIFs en ubicaciones temporales.
bot.on([":video", ":animation"], async (ctx) => {
  // Prepare el archivo para su descarga.
  const file = await ctx.getFile();
  // Descargue el archivo en una ubicación temporal.
  const path = await file.download();
  // Imprime la ruta del archivo.
  console.log("Archivo guardado en ", path);
});
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
import { Bot } from "grammy";
import { hydrateFiles } from "@grammyjs/files";

// Crea un bot.
const bot = new Bot("");

// Usa el plugin.
bot.api.config.use(hydrateFiles(bot.token));

// Descarga vídeos y GIFs en ubicaciones temporales.
bot.on([":video", ":animation"], async (ctx) => {
  // Prepare el archivo para su descarga.
  const file = await ctx.getFile();
  // Descargue el archivo en una ubicación temporal.
  const path = await file.download();
  // Imprime la ruta del archivo.
  console.log("Archivo guardado en ", path);
});
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  FileFlavor,
  hydrateFiles,
} from "https://deno.land/x/grammy_files/mod.ts";

// Transformative Context flavor
type MyContext = FileFlavor<Context>;

// Crea un bot.
const bot = new Bot<MyContext>("");

// Usa el plugin.
bot.api.config.use(hydrateFiles(bot.token));

// Descarga vídeos y GIFs en ubicaciones temporales.
bot.on([":video", ":animation"], async (ctx) => {
  // Prepare el archivo para su descarga.
  const file = await ctx.getFile();
  // Descargue el archivo en una ubicación temporal.
  const path = await file.download();
  // Imprime la ruta del archivo.
  console.log("Archivo guardado en ", path);
});
```

</CodeGroupItem>
</CodeGroup>

Puedes pasar una cadena con una ruta de archivo a `download` si no quieres crear un archivo temporal.
Simplemente haga `await file.download("/ruta/al/archivo")`.

Si sólo quieres obtener la URL del archivo para poder descargarlo tú mismo, utiliza `file.getUrl`.
Esto devolverá un enlace HTTPS a su archivo que es válido durante al menos una hora.

## Servidor local del Bot API

Si estás usando un servidor local de Bot API, entonces la llamada `getFile` efectivamente descarga el archivo en tu disco ya.

A su vez, puedes llamar a `file.getUrl()` para acceder a esa ruta de archivo.
Tenga en cuenta que `await file.download()` simplemente copiará ese archivo localmente presente en una ubicación temporal (o en la ruta dada si se especifica).

## Apoyo a las llamadas de `bot.api`

Por defecto, los resultados de `await bot.api.getFile()` también contarán con los métodos `download` y `getUrl`.
Sin embargo, esto no se refleja en los tipos.
Si necesitas estas llamadas, también debes instalar un [API flavor](../advanced/transformers.md#api-flavoring) en el objeto bot llamado `FileApiFlavor`:

<CodeGroup>
  <CodeGroupItem title="Node.js" active>

```ts
import { Api, Bot, Context } from "grammy";
import { FileApiFlavor, FileFlavor, hydrateFiles } from "@grammyjs/files";

type MyContext = FileFlavor<Context>;
type MyApi = FileApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");
// ...
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { Api, Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  FileApiFlavor,
  FileFlavor,
  hydrateFiles,
} from "https://deno.land/x/grammy_files/mod.ts";

type MyContext = FileFlavor<Context>;
type MyApi = FileApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");
// ...
```

</CodeGroupItem>
</CodeGroup>

## Resumen del plugin

- Nombre: `files`
- Fuente: <https://github.com/grammyjs/files>
- Referencia: <https://doc.deno.land/https://deno.land/x/grammy_files/mod.ts>
