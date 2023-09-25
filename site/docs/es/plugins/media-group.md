---
prev: false
next: false
---

# Medios de comunicación (incorporado)

El plugin de grupo de medios te ayuda a enviar grupos de medios permitiéndote construir objetos `InputMedia`.
Por cierto, los objetos `InputMedia` también se utilizan cuando se editan mensajes multimedia, así que este plugin también te ayuda a editar multimedia.

Recuerda que los objetos `InputMedia` se especifican [aquí](https://core.telegram.org/bots/api#inputmedia).

## Creación de un objeto `InputMedia`

Puede utilizar este plugin de la siguiente manera:

::: code-group

```ts [TypeScript]
import { InputMediaBuilder } from "grammy";

const photo = InputMediaBuilder.photo(new InputFile("/tmp/photo.mp4"));
const video = InputMediaBuilder.video(new InputFile("/tmp/video.mp4"));
// etc
```

```js [JavaScript]
const { InputMediaBuilder } = require("grammy");

const photo = InputMediaBuilder.photo(new InputFile("/tmp/photo.mp4"));
const video = InputMediaBuilder.video(new InputFile("/tmp/video.mp4"));
// etc
```

```ts [Deno]
import { InputMediaBuilder } from "https://deno.land/x/grammy/mod.ts";

const photo = InputMediaBuilder.photo(new InputFile("/tmp/photo.mp4"));
const video = InputMediaBuilder.video(new InputFile("/tmp/video.mp4"));
// etc
```

:::

Echa un vistazo a todos los métodos de `InputMediaBuilder` en la [referencia API](https://deno.land/x/grammy/mod.ts?s=InputMediaBuilder).

También puedes pasar directamente URLs públicas que Telegram obtiene.

```ts
const photo = InputMediaBuilder.photo("https://grammy.dev/images/grammY.png");
```

Se pueden proporcionar más opciones en un objeto de opciones al final.

```ts
const photo = InputMediaBuilder.photo("https://grammy.dev/images/grammY.png", {
  caption: "grammY es impresionante",
  // etc
});
```

## Envío de un grupo de medios

Puede enviar un grupo de medios de la siguiente manera:

```ts
await ctx.replyWithMediaGroup([photo0, photo1, photo2, video]);
```

Del mismo modo, puedes pasar un array de objetos `InputMedia` a `ctx.api.sendMediaGroup` o `bot.api.sendMediaGroup`.

## Editar un mensaje multimedia

Dado que los objetos `InputMedia` también se utilizan para editar mensajes multimedia, este plugin también te ayudará en este caso:

```ts
const newMedia = InputMediaBuilder.photo(
  "https://grammy.dev/images/grammY.png",
);
await ctx.editMessageMedia(newMedia);
```

Como siempre, esto funciona también para `ctx.api.editMessageMedia` y `bot.api.editMessageMedia`.

## Resumen del plugin

Este plugin está integrado en el núcleo de grammY.
No necesitas instalar nada para usarlo.
Simplemente importa todo desde el propio grammY.

Además, tanto la documentación como la referencia API de este plugin están unificadas con el paquete core.
