---
layout: home
titleTemplate: false

hero:
  name: grammY
  text: El Framework de Bots para Telegram.
  taglines: 
    - piensa en el por qué.
    - la nueva era del desarrollo de bots.
    - se ejecuta más rápido que tú.
    - diviértete haciendo bots.
    - una actualización por delante.
    - puede hacer todo menos lavar los platos.
    - fácil de exprimir limones.
    - miles y miles de millones de peticiones.
    - impulsado por la obsesión.
  image:
    src: /images/Y.svg
    alt: Logotipo de grammY
  actions:
    - theme: brand
      text: Comenzar
      link: ./guide/getting-started
    - theme: alt
      text: Documentación
      link: ./guide/

features:
  - icon: <lazy-tgs-player class="VPImage" src="/icons/beach-animation.tgs"><img src="/icons/beach.svg" alt="beach animation"></lazy-tgs-player>
    title: Fácil de usar
    details: grammY hace crear bots de Telegram tan simple que ya sabes como hacerlo.
  - icon: <lazy-tgs-player class="VPImage" src="/icons/palette-animation.tgs"><img src="/icons/palette.svg" alt="palette animation"></lazy-tgs-player>
    title: Flexible
    details: grammY es abierto y puede extenderse con plugins para adaptarse a tus necesidades.
  - icon: <lazy-tgs-player class="VPImage" src="/icons/rocket-animation.tgs"><img src="/icons/rocket.svg" alt="rocket animation"></lazy-tgs-player>
    title: Escalable
    details: grammY te tiene cubierto cuando tu bot se vuelve popular y el tráfico se incrementa.
---

<!-- markdownlint-disable no-inline-html -->

## Quickstart

Bots están escritos en [TypeScript](https://www.typescriptlang.org) (o JavaScript) y corren en varias plataformas, incluyendo [Node.js](https://nodejs.org).

`npm install grammy` y copia el siguiente código:

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";

const bot = new Bot(""); // <-- pon tu token entre los "" (https://t.me/BotFather)

// Responde a cualquier mensaje con "¡Hola a todos!".
bot.on("message", (ctx) => ctx.reply("¡Hola a todos!"));

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");

const bot = new Bot(""); // <-- pon tu token entre los "" (https://t.me/BotFather)

// Responde a cualquier mensaje con "¡Hola a todos!".
bot.on("message", (ctx) => ctx.reply("¡Hola a todos!"));

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot(""); // <-- pon tu token entre los "" (https://t.me/BotFather)

// Responde a cualquier mensaje con "¡Hola a todos!".
bot.on("message", (ctx) => ctx.reply("¡Hola a todos!"));

bot.start();
```

:::

¡Funciona! :tada:

<footer id="home-footer">

---

<ClientOnly>
  <ThankYou :s="[
    'Gracias, ',
    '{name}',
    ', por ser colaborador de grammY.',
    ', por crear grammY.'
  ]" />
</ClientOnly>

<div style="font-size: 0.75rem;  display: flex; justify-content: center;">

© 2021-2024 &middot; grammY soporta Telegram Bot API 7.7 que fue [liberada](https://core.telegram.org/bots/api#july-7-2024) el 7 de Julio del 2024.
(Última novedad: Mensajes de servicios de reembolso de pagos)

</div>
</footer>
