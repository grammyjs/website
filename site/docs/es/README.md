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
    - una actualización por delante.
    - puede hacer todo menos lavar los platos.
    - fácil de exprimir limones.
    - miles y miles de millones de peticiones.
  image:
    src: /images/Y.webp
    alt: Logotipo de grammY
  actions:
    - theme: brand
      text: Comenzar
      link: ./guide/getting-started
    - theme: alt
      text: Introducción
      link: ./guide/introduction

features:
  - icon: ⛱️
    title: Fácil de usar
    details: grammY hace crear bots de Telegram tan simple que ya sabes como hacerlo.
  - icon: 🧩
    title: Flexible
    details: grammY es abierto y puede extenderse con plugins para adaptarse a tus necesidades.
  - icon: 🏆
    title: Escalable
    details: grammY te tiene cubierto cuando tu bot se vuelve popular y el tráfico se incrementa.
---

<HomeContent>

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

© 2021-2023 &middot; grammY es compatible con la API 6.7 de Telegram Bot que fue [lanzada](https://core.telegram.org/bots/api#april-21-2023) el 21 de Abril del 2023.
(Último punto destacado: varios nombres de bot, emoji personalizados y mejores consultas en línea)

</div>

</HomeContent>
