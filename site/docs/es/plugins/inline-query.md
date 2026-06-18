---
prev: false
next: false
---

# Consultas en línea (incorporado)

Con las consultas en línea, los usuarios pueden buscar, examinar y enviar contenido sugerido por tu bot en cualquier chat, aunque no sea miembro del mismo.
Para ello, inician un mensaje con `@nombre_de_tu_bot` y eligen uno de los resultados.

> Revisa la sección del modo Inline en [Funcionalidades de los bot de Telegram](https://core.telegram.org/bots/features#inline-requests) escrita por el equipo de Telegram.
> Otros recursos son su [descripción detallada](https://core.telegram.org/bots/inline) de los bots inline, así como el [post original del blog](https://telegram.org/blog/inline-bots) anunciando la característica, y la sección del modo Inline en la [Referencia de la API del Bot de Telegram](https://core.telegram.org/bots/api#inline-mode).
> Merece la pena leerlos todos antes de implementar consultas inline para tu bot, ya que las consultas inline son un poco avanzadas.
> Si no te apetece leer todo eso, ten por seguro que esta página te guiará paso a paso.

## Activación del modo inline

Por defecto, el soporte para el modo inline está deshabilitado para tu bot.
Debes ponerte en contacto con [@BotFather](https://t.me/BotFather) y activar el modo inline para que tu bot empiece a recibir consultas inline.

¿Lo has conseguido?
Tu cliente de Telegram debería mostrar ahora "..." cuando escribas el nombre del bot en cualquier campo de texto, y mostrar un spinner de carga.
Ya puedes empezar a escribir algo.
Veamos ahora cómo tu bot puede manejar estas consultas.

## Manejo de consultas en línea

Una vez que un usuario activa una consulta en línea, es decir, inicia un mensaje escribiendo "@nombre_de_tu_bot ..." en el campo de entrada de texto, tu bot recibirá actualizaciones sobre esto.
grammY tiene un soporte especial para manejar consultas en línea a través del método `bot.inlineQuery()`, como se documenta en la clase `Composer` en la [Referencia API grammY](/ref/core/composer#inlinequery).
Te permite escuchar consultas en línea específicas que coincidan con cadenas o expresiones regulares.
Si quieres manejar todas las consultas en línea genéricamente, usa `bot.on("inline_query")`.

```ts
// Busca cadenas específicas o expresiones regulares.
bot.inlineQuery(/mejor bot (framework|library)/, async (ctx) => {
  const match = ctx.match; // objeto regex
  const query = ctx.inlineQuery.query; // cadena de consulta
});

// Escucha cualquier consulta en línea.
bot.on("inline_query", async (ctx) => {
  const query = ctx.inlineQuery.query; // cadena de consulta
});
```

Ahora que sabemos cómo escuchar las actualizaciones de las consultas en línea, podemos responderlas con una lista de resultados.

## Construcción de resultados de consultas en línea

Construir listas de resultados para consultas en línea es una tarea tediosa porque necesitas construir [objetos anidados complejos](https://core.telegram.org/bots/api#inlinequeryresult) con una variedad de propiedades.
Afortunadamente, estás usando grammY, y por supuesto hay ayudantes que hacen esta tarea muy simple.

Cada resultado necesita tres cosas.

1. Un identificador de cadena único.
2. Un _objeto de resultado_ que describe cómo mostrar el resultado de la consulta en línea.
   Puede contener cosas como un título, un enlace o una imagen.
3. Un _objeto de contenido del mensaje_ que describe el contenido del mensaje que enviará el usuario si elige este resultado.
   En algunos casos, el contenido del mensaje puede deducirse implícitamente del objeto resultado.
   Por ejemplo, si quieres que tu resultado se muestre como un GIF, entonces Telegram entenderá que el contenido del mensaje será ese mismo GIF--a menos que especifiques un objeto de contenido de mensaje.

grammY exporta un constructor para resultados de consulta en línea, llamado `InlineQueryResultBuilder`.
Aquí hay algunos ejemplos de su uso.

::: code-group

```ts [TypeScript]
import { InlineKeyboard, InlineQueryResultBuilder } from "grammy";

// Construye un resultado de foto.
InlineQueryResultBuilder.photo("id-0", "https://grammy.dev/images/grammY.png");

// Crear un resultado que muestre una foto pero envíe un mensaje de texto.
InlineQueryResultBuilder.photo("id-1", "https://grammy.dev/images/grammY.png")
  .text("Se enviará este texto en lugar de la foto");

// Construir un resultado de texto.
InlineQueryResultBuilder.article("id-2", "Consultas en línea")
  .text(
    "Gran documentación sobre consultas en línea: grammy.dev/plugins/inline-query",
  );

// Pasar más opciones al resultado.
const keyboard = new InlineKeyboard()
  .text("Aw yis", "llámame");
InlineQueryResultBuilder.article("id-3", "Golpéame", { reply_markup: keyboard })
  .text("Pulsa mis botones");

// Pasar más opciones al contenido del mensaje.
InlineQueryResultBuilder.article("id-4", "Consultas en línea")
  .text("Documentos **destacados**: grammy.dev", { parse_mode: "MarkdownV2" });
```

```js [JavaScript]
const { InlineKeyboard, InlineQueryResultBuilder } = require("grammy");

// Construye un resultado de foto.
InlineQueryResultBuilder.photo("id-0", "https://grammy.dev/images/grammY.png");

// Crear un resultado que muestre una foto pero envíe un mensaje de texto.
InlineQueryResultBuilder.photo("id-1", "https://grammy.dev/images/grammY.png")
  .text("Se enviará este texto en lugar de la foto");

// Construir un resultado de texto.
InlineQueryResultBuilder.article("id-2", "Consultas en línea")
  .text(
    "Gran documentación sobre consultas en línea: grammy.dev/plugins/inline-query",
  );

// Pasar más opciones al resultado.
const keyboard = new InlineKeyboard()
  .text("Aw yis", "llámame");
InlineQueryResultBuilder.article("id-3", "Golpéame", { reply_markup: keyboard })
  .text("Pulsa mis botones");

// Pasar más opciones al contenido del mensaje.
InlineQueryResultBuilder.article("id-4", "Consultas en línea")
  .text("Documentos **destacados**: grammy.dev", { parse_mode: "MarkdownV2" });
```

```ts [Deno]
import {
  InlineKeyboard,
  InlineQueryResultBuilder,
} from "https://deno.land/x/grammy/mod.ts";

// Construye un resultado de foto.
InlineQueryResultBuilder.photo("id-0", "https://grammy.dev/images/grammY.png");

// Crear un resultado que muestre una foto pero envíe un mensaje de texto.
InlineQueryResultBuilder.photo("id-1", "https://grammy.dev/images/grammY.png")
  .text("Se enviará este texto en lugar de la foto");

// Construir un resultado de texto.
InlineQueryResultBuilder.article("id-2", "Consultas en línea")
  .text(
    "Gran documentación sobre consultas en línea: grammy.dev/plugins/inline-query",
  );

// Pasar más opciones al resultado.
const keyboard = new InlineKeyboard()
  .text("Aw yis", "llámame");
InlineQueryResultBuilder.article("id-3", "Golpéame", { reply_markup: keyboard })
  .text("Pulsa mis botones");

// Pasar más opciones al contenido del mensaje.
InlineQueryResultBuilder.article("id-4", "Consultas en línea")
  .text("Documentos **destacados**: grammy.dev", { parse_mode: "MarkdownV2" });
```

:::

Tenga en cuenta que si desea enviar archivos a través de identificadores de archivo existentes, debe utilizar los métodos `*Cached`.

```ts
// Resultado para un archivo de audio enviado a través de identificador de archivo.
const audioFileId = "AgADBAADZRAxGyhM3FKSE4qKa-RODckQHxsoABDHe0BDC1GzpGACAAEC";
InlineQueryResultBuilder.audioCached("id-0", audioFileId);
```

> Lee más sobre los identificadores de archivo [aquí](../guide/files#como-funcionan-los-archivos-para-los-bots-de-telegram).

Deberías consultar la [referencia API](/ref/core/inlinequeryresultbuilder) de `InlineQueryResultBuilder` y quizás también la [especificación](https://core.telegram.org/bots/api#inlinequeryresult) de `InlineQueryResult` para ver todas las opciones disponibles.

## Responder consultas en línea

Después de generar un array de resultados de consultas en línea utilizando el constructor de [arriba](#construccion-de-resultados-de-consultas-en-linea), puedes llamar a `answerInlineQuery` para enviar estos resultados al usuario.

```ts
// La autopublicidad desvergonzada en la documentación de un proyecto
// es el mejor tipo de publicidad.
bot.inlineQuery(/mejor bot (framework|library)/, async (ctx) => {
  // Crea un único resultado de consulta inline.
  const result = InlineQueryResultBuilder
    .article("id:grammy-website", "grammY", {
      reply_markup: new InlineKeyboard()
        .url("sitio web de grammY", "https://grammy.dev/"),
    })
    .text(
      `<b>grammY</b> es la mejor forma de crear tus propios bots de Telegram.
¡Incluso tienen una bonita página web! 👇`,
      { parse_mode: "HTML" },
    );

  // Responde a la consulta en línea.
  await ctx.answerInlineQuery(
    [result], // responder con la lista de resultados
    { cache_time: 30 * 24 * 3600 }, // 30 días en segundos
  );
});

// Devuelve una lista de resultados vacía para otras consultas.
bot.on("inline_query", (ctx) => ctx.answerInlineQuery([]));
```

[Recuerda](../guide/basics#envio-de-mensajes) que siempre puedes especificar más opciones cuando llames a métodos de la API utilizando el objeto options de tipo `Other`.
Por ejemplo, `answerInlineQuery` le permite realizar la paginación para consultas en línea a través de un desplazamiento, como puede ver [aquí](https://core.telegram.org/bots/api#answerinlinequery).

::: tip Mezcla de texto y medios
Aunque está permitido enviar listas de resultados que contengan elementos multimedia y de texto, la mayoría de los clientes de Telegram no los renderizan muy bien.
Desde el punto de vista de la experiencia de usuario, deberías evitarlas.
:::

## Botón sobre los resultados de la consulta en línea

Los clientes de Telegram pueden [mostrar un botón](https://core.telegram.org/bots/api#inlinequeryresultsbutton) encima de la lista de resultados.
Este botón puede llevar al usuario al chat privado con el bot.

```ts
const button = {
  text: "Abrir chat privado",
  start_parameter: "login",
};
await ctx.answerInlineQuery(results, { button });
```

Cuando el usuario pulse el botón, se enviará un mensaje de comando `/start` a tu bot.
El parámetro start estará disponible a través de [deep linking](../guide/commands#soporte-de-deep-linking).
En otras palabras, utilizando el fragmento de código anterior, `ctx.match` tendrá el valor `"login"` en tu manejador de comandos.

Si a continuación envía un [teclado en línea](./keyboard#construyendo-un-teclado-en-linea) con un botón `switchInline`, el usuario será devuelto al chat donde pulsó inicialmente el botón de resultados de consulta en línea.

```ts
bot
  .command("start")
  .filter((ctx) => ctx.match === "login", async (ctx) => {
    // El usuario procede de los resultados de la consulta en línea.
    await ctx.reply("DM abierto, ¡ya puedes volver!", {
      reply_markup: new InlineKeyboard()
        .switchInline("Volver atrás"),
    });
  });
```

De esta forma, puede realizar, por ejemplo, procedimientos de inicio de sesión en un chat privado con el usuario antes de entregar los resultados de la consulta en línea.
El diálogo puede ir y venir un poco antes de devolverlos.
Por ejemplo, puedes introducir una breve conversación con el plugin [de conversaciones](./conversations).

## Obtener información sobre los resultados elegidos

Los resultados de las consultas en línea se entregan de forma inmediata.
En otras palabras, después de que tu bot envíe la lista de resultados de la consulta en línea a Telegram, no sabrá qué resultado eligió el usuario (o si eligió alguno).

Si estás interesado en esto, puedes habilitar el feedback inline con [@BotFather](https://t.me/BotFather).
Puedes decidir la cantidad de feedback que quieres recibir eligiendo entre varias opciones entre 0 % (feedback desactivado) y 100 % (recibir feedback por cada resultado en línea elegido).

La información en línea se envía a través de las actualizaciones de `chosen_inline_result`.
Puede escuchar identificadores de resultados específicos mediante cadenas o expresiones regulares.
Naturalmente, también puede escuchar las actualizaciones de forma normal mediante consultas de filtro.

```ts
// Escuche los resultados elegidos en línea.
bot.chosenInlineResult(/id-[0-9]+/, async (ctx) => {
  const match = ctx.match; // regex match object
  const query = ctx.chosenInlineResult.query; // consulta en línea utilizada
});

// Escuche los resultados elegidos en línea.
bot.on("chosen_inline_result", async (ctx) => {
  const query = ctx.chosenInlineResult.query; // consulta en línea utilizada
});
```

Algunos bots configuran la respuesta al 100% y la utilizan como un hack.
Envían mensajes ficticios sin contenido real en `answerInlineQuery`.
Inmediatamente después de recibir una actualización de `chosen_inline_result`, editan el mensaje respectivo e inyectan el contenido real del mensaje.

Estos bots no funcionarán para administradores anónimos o cuando se envíen mensajes programados, ya que en estos casos no se puede recibir ninguna respuesta en línea.
Sin embargo, si esto no es un problema para ti, entonces este hack te permitirá no tener que generar un montón de contenido de mensaje para mensajes que nunca terminan siendo enviados.
Esto puede ahorrar recursos a tu bot.

## Resumen del complemento

Este plugin está integrado en el núcleo de grammY.
No necesitas instalar nada para usarlo.
Simplemente importa todo desde el propio grammY.

Además, tanto la documentación como la referencia API de este plugin están unificadas con el paquete del núcleo.
