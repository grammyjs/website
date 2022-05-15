---
prev: ../plugins/
---

# La Guía del Autoestopista de los Plugins de grammY

Si quieres desarrollar tu propio plugin y publicarlo, o si quieres saber cómo funcionan los plugins de grammY entre bastidores, ¡este es el lugar para ti!

> Por favor, ten en cuenta que ya hay un resumen sobre los [plugins de grammY](./) son y lo que hacen.
> Este artículo es una inmersión profunda en su funcionamiento interno.

## Tipos de Plugins en grammY

Hay dos tipos principales de plugins en grammY:

- Plugins de Middleware: El único trabajo del plugin es devolver una [función middleware](../guide/middleware.md) que puede ser alimentada a un bot de grammY.
- Plugins transformadores: El único trabajo del plugin es devolver una [función transformadora](../advanced/transformers.md) que puede ser alimentada a un bot de grammY.

Sin embargo, a veces encontrarás plugins que hacen ambas cosas.
También hay otros paquetes que no son ni middleware ni funciones transformadoras, pero los llamaremos plugins de todos modos porque extienden grammY de varias maneras.

## Reglas de contribución

Puedes publicar tus plugins de una de las siguientes formas:

- Publicando como un plugin **oficial**.
- Publicando como un **plugin de terceros**.

Si decide publicar sus plugins como terceros, podemos ofrecerle un lugar destacado en este sitio web.
Sin embargo, preferimos que publiques tu plugin bajo [la organización grammyjs](https://github.com/grammyjs) en GitHub, convirtiéndolo así en un plugin oficial.
En tal caso, se le concederá acceso de publicación a GitHub y npm.
Además, serás responsable de mantener tu código.

Antes de sumergirte en algunos ejemplos prácticos, hay algunas reglas a las que debes prestar atención si quieres que tus plugins aparezcan en este sitio web.

1. Tener un archivo README en GitHub (y npm) con **cortas y claras** instrucciones de uso.
2. Explica el propósito de tu plugin y cómo usarlo añadiendo una página en [docs](https://github.com/grammyjs/website).
   (Podemos crear la página por ti si no estás seguro de cómo hacerlo).
3. Elige una licencia permisiva como MIT o ISC.

Finalmente, debes saber que aunque grammY soporta tanto Node.js como [Deno](https://deno.land/), es un proyecto Deno-first, y también te animamos a escribir tus plugins para Deno (¡y posteriormente con estilo!).
Existe una práctica herramienta llamada [deno2node](https://github.com/wojpawlik/deno2node) que transpira tu código de Deno a Node.js para que podamos soportar ambas plataformas por igual.
La compatibilidad con Deno sólo es un requisito estricto para los plugins oficiales, pero no para los de terceros.
No obstante, se recomienda encarecidamente probar Deno.
No querrá volver atrás.

## Diseño de un plugin Middleware ficticio

Supongamos que queremos diseñar un plugin que sólo responda a determinados usuarios.
Por ejemplo, podríamos decidir que sólo responda a personas cuyos nombres de usuario contengan una determinada palabra.
El bot simplemente se negará a trabajar para todos los demás.

He aquí un ejemplo ficticio:

```ts
// plugin.ts

// Importar los tipos de grammY (los reexportamos en `deps.deno.ts`).
import type { Context, Middleware, NextFunction } from "./deps.deno.ts";

// Tu plugin puede tener una función principal que cree el middleware
export function onlyAccept<C extends Context>(str: string): Middleware<C> {
  // Crea y devuelve el middleware.
  return async (ctx, next) => {
    // Obtener el nombre del usuario.
    const name = ctx.from?.first_name;
    // Deja pasar todas las actualizaciones que coincidan.
    if (name === undefined || name.includes(str)) {
      // Pasar el flujo de control al middleware posterior.
      await next();
    } else {
      // Decirles que no nos gustan.
      await ctx.reply(`¡No estoy hablando contigo! No te interesa ${str}!`);
    }
  };
}
```

Ahora, se puede utilizar en un bot real:

```ts
// Aquí, el código del plugin está en un archivo llamado `plugin.ts`.
import { onlyAccept } from "./plugin.ts";
import { Bot } from "./deps.deno.ts";

const bot = new Bot(""); // <-- pon tu token de bot aquí

bot.use(onlyAccept("grammY"));

bot.on("message", (ctx) => ctx.reply("You passed the middleware plugin"));

bot.start();
```

¡Voilà!
Ya tienes un plugin, ¿verdad?
Bueno, no tan rápido.
Todavía tenemos que empaquetarlo, pero antes de eso, vamos a echar un vistazo a los plugins transformadores, también.

## Diseño de un plugin transformador ficticio

Imagina que escribes un plugin que envía la [acción de chat](https://core.telegram.org/bots/api#sendchataction) apropiada automáticamente cada vez que el bot envía un documento.
Esto significa que mientras tu bot está enviando un archivo, los usuarios verán automáticamente "_enviando archivo..._" como estado.
Muy bonito, ¿verdad?

```ts
// plugin.ts
import type { Transformer } from "./deps.deno.ts";

// Función principal del plugin
export function autoChatAction(): Transformer {
  // Crea y devuelve una función transformadora.
  return async (prev, method, payload, signal) => {
    // Guarda el handle del intervalo establecido para que podamos borrarlo después.
    let handle: ReturnType<tipo de setTimeout> | undefined;
    if (method === "sendDocument" && "chat_id" in payload) {
      // Ahora sabemos que se está enviando un documento.
      const actionPayload = {
        chat_id: payload.chat_id,
        acción: "upload_document",
      };
      // Establecer repetidamente la acción del chat mientras se sube el archivo.
      handle = setInterval(() => {
        prev("sendChatAction", actionPayload).catch(console.error);
      }, 5000);
    }

    try {
      // Ejecuta el método real del bot.
      return await prev(method, payload, signal);
    } finally {
      // Borra el intervalo para que dejemos de enviar la acción de chat al cliente.
      clearInterval(handle);
    }
  };
}
```

Ahora, podemos usarlo en un bot real:

```ts
import { Bot, InputFile } from "./deps.deno.ts";
// El código del plugin está en un archivo llamado `plugin.ts`.
import { autoChatAction } from "./plugin.ts";

// Crear una instancia del bot.
const bot = new Bot(""); // <-- pon tu token de bot aquí

// Utiliza el plugin.
bot.api.config.use(autoChatAction());

bot.hears("envíame un documento", async (ctx) => {
  // Si el usuario envía este comando, le enviaremos un archivo pdf (a modo de demostración)
  await ctx.replyWithDocument(new InputFile("/tmp/document.pdf"));
});

// iniciar el bot
bot.start();
```

Ahora, cada vez que enviemos un documento, la acción de chat de `upload_document` será enviada a nuestro cliente.
Ten en cuenta que esto era a modo de demostración.
Telegram recomienda usar acciones de chat sólo cuando "una respuesta del bot tardará una cantidad de tiempo **notable** en llegar".
Probablemente no sea necesario establecer el estado si el archivo es muy pequeño, por lo que hay algunas optimizaciones que se podrían hacer aquí.

## Extracción en un plugin

Sea cual sea el tipo de plugin que hayas hecho, tienes que empaquetarlo en un paquete independiente.
Esta es una tarea bastante sencilla.
No hay reglas específicas sobre cómo hacer esto y npm es su ostra, pero sólo para mantener las cosas organizadas, tenemos una sugerencia de plantilla para usted.
Puedes descargar el código desde [nuestro repositorio de plantillas de plugins en GitHub](https://github.com/grammyjs/plugin-template) y empezar a desarrollar tu plugin sin perder tiempo en la configuración.

La estructura de carpetas sugerida inicialmente:

```asciiart:no-line-numbers
plugin-template/
├─ src/
│ ├─ deps.deno.ts
│ ├─ deps.node.ts
│ └─ index.ts
├─ package.json
├─ tsconfig.json
└─ README.md
```

**`deps.deno.ts` y `deps.node.ts`**: Esto es para los desarrolladores que están dispuestos a escribir el plugin para Deno, y luego transpilarlo a Node.js.
Como ya hemos mencionado, utilizamos la herramienta `deno2node` para transpilar nuestro código Deno a Node.js.
`deno2node` tiene una característica que te permite proporcionarle archivos específicos para el tiempo de ejecución.
Estos archivos deben ser adyacentes entre sí y seguir la estructura de nombres `*.deno.ts` y `*.node.ts` como se [explica en la documentación](https://github.com/wojpawlik/deno2node#runtime-specific-code).
Por eso hay dos archivos `deps.deno.ts` y `deps.node.ts`.
Si hay alguna dependencia específica de Node.js, ponla en `deps.node.ts`, si no, déjala vacía.

> _**Nota**_: También puede utilizar otras herramientas como [deno dnt](https://github.com/denoland/dnt) para transpilar su código base de deno o utilizar otras estructuras de carpetas.
> La herramienta que utilice es irrelevante, el punto principal aquí es que escribir código para Deno es mejor y más fácil.

**`tsconfig.json`**: Este es el archivo de configuración del compilador de TypeScript utilizado por `deno2node` para transpilar su código.
Se proporciona uno por defecto en el repositorio como sugerencia.
Se corresponde con la configuración de TypeScript que Deno utiliza internamente, y recomendamos que te quedes con este.

**`package.json`**: El archivo package.json para la versión npm de su plugin.
**Asegúrate de cambiarlo según tu proyecto**.

**`README.md`**: Instrucciones sobre cómo utilizar el plugin.
**Asegúrate de cambiarlo según tu proyecto**.

**`index.ts`**: El archivo que contiene tu lógica de negocio, es decir, el código principal del plugin.

## Hay un Boilerplate

Si quieres desarrollar un plugin para grammY y no sabes por dónde empezar, te sugerimos el código de la plantilla en [nuestro repositorio](https://github.com/grammyjs/plugin-template).
Puedes clonar el código por ti mismo y empezar a codificar basándote en lo que se ha cubierto en este artículo.
Este repositorio también incluye algunas cosas extra como `.editorconfig`, `LICENSE`, `.gitignore`, etc, pero puedes optar por eliminarlas.

## No me gusta Deno

Bueno, ¡te lo pierdes!
Pero también puedes escribir tus plugins sólo para Node.js.
Todavía puedes publicar el plugin y tenerlo listado como un plugin de terceros en este sitio web.
En tal caso, puedes usar la estructura de carpetas que quieras (siempre que esté organizada como cualquier otro proyecto npm).
Simplemente instala grammY a través de npm con `npm install grammy`, y empieza a codificar.

## ¿Cómo enviar?

Si tienes un plugin listo, puedes simplemente enviar un pull request en GitHub (de acuerdo con las [Reglas de Contribución](#reglas-de-contribucion)), o notificarnos en el [chat de la comunidad](https://t.me/grammyjs) para más ayuda.
