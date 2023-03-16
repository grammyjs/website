---
home: true
heroImage: /images/Y.png
actions:
  - text: Comenzar
    link: /es/guide/getting-started.html
    type: primary
  - text: Introducción
    link: /es/guide/introduction.html
    type: secondary
features:
  - title: Fácil de usar
    details: grammY hace crear bots de Telegram tan simple que ya sabes como hacerlo.
  - title: Flexible
    details: grammY es abierto y puede extenderse con plugins para adaptarse a tus necesidades.
  - title: Escalable
    details: grammY te tiene cubierto cuando tu bot se vuelve popular y el tráfico se incrementa.
permalink: /es/
---

<h6 align="right">… {{ [
  'piensa en el por qué',
  'la nueva era del desarrollo de bots',
  'se ejecuta más rápido que tú',
  'una actualización por delante',
  'puede hacer todo menos lavar los platos',
  'fácil de exprimir limones',
  'cientos de millones de peticiones',
][Math.floor(Math.random() * 7)] }}.</h6>

## Quickstart

Bots están escritos en [TypeScript](https://www.typescriptlang.org) (o JavaScript) y corren en varias plataformas, incluyendo [Node.js](https://nodejs.org).

`npm install grammy` y copia el siguiente código:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";

const bot = new Bot(""); // <-- pon tu token entre los "" (https://t.me/BotFather)

// Responde a cualquier mensaje con "¡Hola a todos!".
bot.on("message", (ctx) => ctx.reply("¡Hola a todos!"));

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");

const bot = new Bot(""); // <-- pon tu token entre los "" (https://t.me/BotFather)

// Responde a cualquier mensaje con "¡Hola a todos!".
bot.on("message", (ctx) => ctx.reply("¡Hola a todos!"));

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot(""); // <-- pon tu token entre los "" (https://t.me/BotFather)

// Responde a cualquier mensaje con "¡Hola a todos!".
bot.on("message", (ctx) => ctx.reply("¡Hola a todos!"));

bot.start();
```

</CodeGroupItem>
</CodeGroup>

¡Funciona! :tada:

---

<ClientOnly>
  <ThankYou :s="['Gracias, ', '', ', por ser colaborador de grammY.']" />
</ClientOnly>

<div style="font-size: 0.75rem;  display: flex; justify-content: center;">

© 2021-2023 &middot; grammY es compatible con la API 6.6 de Telegram Bot que fue [lanzada](https://core.telegram.org/bots/api#march-9-2023) el 9 de Marzo de 2023.
(Último punto destacado: Translated Bot Descriptions)

</div>
