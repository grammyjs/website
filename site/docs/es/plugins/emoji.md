# Plugin Emoji (`emoji`)

Con este plugin, puedes insertar fácilmente emojis en tus respuestas buscándolos en lugar de copiar y pegar manualmente un emoji de la web en tu código.

## ¿Por qué debería usar esto?

¿Por qué no? La gente utiliza emojis en su código todo el tiempo para ilustrar mejor el mensaje que quieren pasar o para organizar las cosas.
Pero se pierde el enfoque cada vez que se necesita un nuevo emoji, ver:

1. Dejas de codificar para buscar un emoji específico.
2. Vas a un chat de Telegram y te pasas ~6 segundos (por no decir más) buscando el emoji que quieres.
3. Los copias y pegas en tu código y vuelves a codificar, pero con el foco perdido.

Con este plugin, simplemente no dejas de codificar ya que tampoco pierdes la concentración.
También hay sistemas y/o editores que no les gusta y no muestran los emojis, por lo que terminas pegando un cuadrado blanco, como este triste-pequeño-cuidado mensaje `Estoy tan feliz □`.

Este plugin pretende resolver estos problemas, manejando por ti la difícil tarea de analizar los emojis en todos los sistemas y permitiéndote sólo buscarlos de forma sencilla (está disponible el autocompletado). Ahora, los pasos anteriores se pueden reducir a este:

1. Describe el emoji que quieres y úsalo. Justo en tu código. Así de simple.

### ¿Esto es brujería?

No, se llama cadenas de plantillas.
Puedes leer más sobre ellas [aquí](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).

## Instalación y ejemplos

Puedes instalar este plugin en tu bot así:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context } de "grammy";
import { EmojiFlavor, emojiParser } from "@grammyjs/emoji";

// Esto se llama Context Flavoring
// Puedes leer más en:
// https://grammy.dev/guide/context.html#transformative-context-flavors
type MyContext = EmojiFlavor<Context>;

const bot = new Bot<MyContext>(""); // <-- pon tu token de bot entre los ""

bot.use(emojiParser());
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");
const { emojiParser } = require("@grammyjs/emoji");

const bot = new Bot(""); // <-- pon tu token de bot entre los ""

bot.use(emojiParser());
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
importar {
  EmojiFlavor,
  emojiParser,
} de "https://deno.land/x/grammy_emoji/mod.ts";

// Esto se llama Context Flavoring
// Puedes leer más en:
// https://grammy.dev/guide/context.html#transformative-context-flavors
tipo MyContext = EmojiFlavor<Context>;

const bot = new Bot<MyContext>(""); // <-- pon tu token de bot entre los ""

bot.use(emojiParser());
```

</CodeGroupItem>
</CodeGroup>

Ahora puedes obtener emojis por sus nombres:

```js
bot.command("start", async (ctx) => {
  const parsedString = ctx.emoji`¡Bienvenido! ${"smiling_face_with_sunglasses"}`; // => ¡Bienvenido! 😎
  await ctx.reply(parsedString);
});
```

También puedes responder directamente con el método `replyWithEmoji`:

```js
bot.command("ping", async (ctx) => {
  await ctx.replyWithEmoji`Pong ${"ping_pong"}`; // => Pong 🏓
});
```

::: warning Ten en cuenta que
`ctx.emoji` y `ctx.replyWithEmoji` **Siempre** utilizan cadenas de plantilla.
Si no estás familiarizado con esta sintaxis, puedes leer más sobre ella [aquí](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).
:::

## Resumen del plugin

- Nombre: `emoji`
- Fuente: <https://github.com/grammyjs/emoji>
- Referencia: <https://doc.deno.land/https://deno.land/x/grammy_emoji/mod.ts>
