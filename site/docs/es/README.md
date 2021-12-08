---
home: true
heroImage: /Y.png
actions:
  - text: Comenzar
    link: /guide/getting-started.md
    type: primary
  - text: Introducción
    link: /guide/introduction.md
    type: secondary
features:
  - title: Fácil de usar
    details: grammY hace crear bots de Telegram tan simple que ya sabes como hacerlo.
  - title: Flexible
    details: grammY es abierto y puede extenderse con plugins para adaptarse a tus necesidades.
  - title: Escalable
    details: grammY te tiene cubierto cuando tu bot se vuelve popular y el tráfico se incrementa.
footer: Copyright © 2021
permalink: /
---

<h6 align="right">… {{ [
  'piensa en el por qué',
  'la nueva era del desarrollo de bots',
  'se ejecuta más rápido que tú',
  'una actualización por delante',
  'puede hacer todo menos lavar los platos',
  'fácil de exprimir',
  'cientos de millones de peticiones',
][Math.floor(Math.random() * 7)] }}.</h6>

## Quickstart

Bots están escritos en [TypeScript](https://www.typescriptlang.org) (o JavaScript) y corren en varias plataformas, incluyendo [Node.js](https://nodejs.org).

`npm install grammy` y copia el siguiente código:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";

const bot = new Bot(""); // <-- Pon el token del bot aquí (https://t.me/BotFather)

// Responde a cualquier mensaje con "Reply to any message with "Hola a todos!".
bot.on("message", (ctx) => ctx.reply("Hola a todos!"));

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```ts
const { Bot } = require("grammy");

const bot = new Bot(""); // <-- Pon el token del bot aquí (https://t.me/BotFather)

// Responde a cualquier mensaje con "Reply to any message with "Hola a todos!".
bot.on("message", (ctx) => ctx.reply("Hola a todos!"));

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot(""); // <-- Pon el token del bot aquí (https://t.me/BotFather)

// Responde a cualquier mensaje con "Reply to any message with "Hola a todos!".
bot.on("message", (ctx) => ctx.reply("Hola a todos!"));

bot.start();
```

</CodeGroupItem>
</CodeGroup>

¡Funciona! :tada:

---

grammY soporta el API de Telegram 5.5 que fue [lanzado](https://core.telegram.org/bots/api#november-5-2021) el 8 de Diciembre del 2021.
(Lo más destacado: Solicitudes de adhesión)
