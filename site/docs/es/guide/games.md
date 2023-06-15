---
prev: ./files.md
next: ./deployment-types.md
---

# Juegos

## Introducción

Telegram Games es una función muy interesante y muy divertida para jugar.
¿Qué puedes hacer con ella?
La respuesta es cualquier cosa, cualquier juego HTML5 que hayas desarrollado puedes ofrecerlo a los usuarios en Telegram con la ayuda de esta función.
(Sí, esto significa que tendrás que desarrollar un juego real basado en un sitio web que sea accesible públicamente en Internet antes de poder integrarlo en tu bot de Telegram).

## Configurar un juego con tu bot vía @BotFather

Para simplificar, vamos a suponer que a estas alturas debes haber configurado un bot y un juego asociado a tu bot en [@BotFather](https://t.me/BotFather).
Si aún no lo has hecho, consulta este [artículo](https://core.telegram.org/bots/games) del equipo de Telegram.

> Nota: Sólo aprenderemos el desarrollo del lado del bot.
> El desarrollo del juego depende enteramente del desarrollador.
> Todo lo que necesitamos aquí es un enlace del juego HTML5 alojado en internet.

## Enviando el juego a través de un bot

Podemos enviar el juego en grammY a través del método `replyWithGame` que toma como argumento el nombre del juego creado con BotFather.
Alternativamente, también podemos utilizar el método `api.sendGame` (grammY proporciona todos los métodos oficiales de la [API del Bot](https://core.telegram.org/bots/api)).
Una ventaja de usar el método `api.sendGame` es que puedes especificar el `chat.id` de un usuario específico al que enviarlo.

1. Envío del juego a través de `replyWithGame`

   ```ts
   // Usaremos el comando start para invocar el método de respuesta del juego.
   bot.command("start", async (ctx) => {
     // Pasa el nombre del juego que has creado en BotFather, por ejemplo "my_game".
     await ctx.replyWithGame("my_game");
   });
   ```

2. Envío de un juego por medio de `api.sendGame`.

   ```ts
   bot.command("start", async (ctx) => {
     // Puedes obtener el identificador de chat del usuario al que enviar tu juego con `ctx.from.id`.
     // que te da el identificador de chat del usuario que invocó el comando de inicio.
     const chatId = ctx.from.id;
     await ctx.api.sendGame(chatid, "my_game");
   });
   ```

> [Recuerde](./basics.md#envio-de-mensajes) que puede especificar más opciones al enviar mensajes utilizando el objeto de opciones de tipo `Other`.

También puedes especificar un [teclado en línea](../plugins/keyboard.md#teclados-en-linea) personalizado para que el juego muestre los botones.
Por defecto, se enviará con un botón con nombre como `Play my_game`, donde _my_game_ es el nombre de su juego.

```ts
// Definir un nuevo teclado en línea. Puedes escribir cualquier texto que se muestre
// en el botón, ¡pero asegúrese de que el primer botón debe ser siempre
// sea el botón de jugar!

const keyboard = new InlineKeyboard().game("Start my_game");

// Observa que hemos utilizado game() a diferencia de un teclado en línea normal
// donde usamos url() o text()

// A través del método `replyWithGame`
await ctx.replyWithGame("my_game", { reply_markup: keyboard });

// A través del método `api.sendGame`
await ctx.api.sendGame(chatId, "my_game", { reply_markup: keyboard });
```

## Escuchando el Callback de nuestro botón de juego

Para dotar de lógica al botón cuando es pulsado, y para redirigir a nuestros usuarios a nuestro juego y muchas cosas más, escuchamos el evento `callback_query:game_short_name` que nos indica que un botón de juego ha sido pulsado por el usuario.
Todo lo que tenemos que hacer es

```ts
// Pasa aquí la url de tu juego que debe estar ya alojado en la web.

bot.on("callback_query:game_short_name", async (ctx) => {
  await ctx.answerCallbackQuery({ url: "your_game_url" });
});
```

---

### Nuestro código final debería ser algo así

```ts
bot.on("callback_query:game_short_name", async (ctx) => {
  await ctx.answerCallbackQuery({ url: "your_game_url" });
});

bot.command("start", (ctx) => {
  await ctx.replyWithGame("my_game", {
    reply_markup: keyboard,
    // O puede utilizar el método api aquí, según sus necesidades.
  });
});
```

> Recuerda añadir un adecuado [manejo de errores](./errors.md) a tu bot antes de ponerlo en marcha.

Puede que ampliemos este artículo en el futuro con más secciones avanzadas y preguntas frecuentes, pero esto es ya todo lo que necesitas para empezar tu juego en Telegram.
¡Diviértete jugando! :space_invader:
