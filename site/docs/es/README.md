---
home: true
heroImage: /Y.png
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
footer: Copyright © 2021-2023
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

const bot = new Bot(""); // <-- Pon el token del bot aquí (https://t.me/BotFather)

// Responde a cualquier mensaje con "¡Hola a todos!".
bot.on("message", (ctx) => ctx.reply("¡Hola a todos!"));

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");

const bot = new Bot(""); // <-- Pon el token del bot aquí (https://t.me/BotFather)

// Responde a cualquier mensaje con "¡Hola a todos!".
bot.on("message", (ctx) => ctx.reply("¡Hola a todos!"));

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot(""); // <-- Pon el token del bot aquí (https://t.me/BotFather)

// Responde a cualquier mensaje con "¡Hola a todos!".
bot.on("message", (ctx) => ctx.reply("¡Hola a todos!"));

bot.start();
```

</CodeGroupItem>
</CodeGroup>

¡Funciona! :tada:

---

grammY es compatible con la API 6.5 de Telegram Bot que fue [lanzada](https://core.telegram.org/bots/api#february-02-2023) el 2 de Febrero de 2023.
(Último punto destacado: Solicitudes de usuarios y chat)
