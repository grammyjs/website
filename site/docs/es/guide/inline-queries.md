---
prev: ./errors.md
next: ./files.md
---

# Inline Queries

Con las inline queries, los usuarios pueden buscar, navegar y enviar el contenido sugerido por tu bot en cualquier chat, incluso si no es un miembro del mismo.
Para ello, inician un mensaje con `@tu_nombre_del_bot` y eligen uno de los resultados.

::: tip Habilitar el modo inline
Por defecto, el soporte para el modo inline está desactivado.
Debes ponerte en contacto con [@BotFather](https://t.me/BotFather) y habilitar el modo inline para tu bot, para empezar a recibir consultas inline.
:::

> Revisa la sección del modo inline en la [Introducción para desarrolladores](https://core.telegram.org/bots#inline-mode) escrita por el equipo de Telegram.
> Otros recursos son su [descripción detallada](https://core.telegram.org/bots/inline) de los bots en línea, así como el [post original del blog](https://telegram.org/blog/inline-bots) que anuncia la característica, y la sección del modo en línea en la [Referencia de la API de los bots de Telegram](https://core.telegram.org/bots/api#inline-mode).
> Merece la pena leerlos todos antes de implementar las inline queries para tu bot.

Una vez que un usuario desencadena una consulta en línea, es decir, inicia un mensaje escribiendo "@tu_nombre_del_bot ..." en el campo de entrada de texto, tu bot recibirá actualizaciones al respecto.
grammY tiene un soporte especial para manejar las inline queries a través del método `bot.inlineQuery()`, como se documenta en la clase `Composer` en la [Referencia de la API de grammY](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/Composer#inlineQuery).
Le permite escuchar inline queries específicas que coincidan con cadenas o expresiones regulares.
Si quieres manejar todas las inline queries genéricamente, usa `bot.on("inline_query")`.

```ts
// La autopublicidad descarada en la documentación de un proyecto
// es el mejor tipo de publicidad.
bot.inlineQuery(/best bot (framework|library)/, async (ctx) => {
  await ctx.answerInlineQuery(
    [
      {
        type: "article",
        id: "grammy-website",
        title: "grammY",
        input_message_content: {
          message_text:
"<b>grammY</b> es la mejor manera de crear tus propios bots de Telegram. \
¡Incluso tienen una bonita página web! 👇",
          parse_mode: "HTML",
        },
        reply_markup: new InlineKeyboard().url(
          "grammY website",
          "https://grammy.dev/",
        ),
        url: "https://grammy.dev/",
        description: "El Telegram Bot Framework.",
      },
    ],
    { cache_time: 30 * 24 * 3600 }, // un mes en segundos
  );
});

// Devuelve una lista de resultados vacía para otras consultas.
bot.on("inline_query", (ctx) => ctx.answerInlineQuery([]));
```

> [Recuerde](./basics.md#sending-messages) que siempre puede especificar más opciones al llamar a los métodos de la API utilizando el objeto de opciones de tipo `Other`.
> Por ejemplo, esto le permite realizar la paginación para las consultas en línea a través de un desplazamiento.

Tenga en cuenta que grammY puede autocompletar todos los campos de la estructura anterior por usted.
Además, asegúrate de revisar las especificaciones exactas para los resultados en línea en la [Referencia de la API de Telegram Bot](https://core.telegram.org/bots/api#inlinequeryresult).
