---
home: true
heroImage: /Y.png
actions:
  - text: Comece 
    link: /pt/guide/getting-started.md
    type: primary
  - text: Introdução 
    link: /pt/guide/introduction.md
    type: secondary
features:
  - title: Fácil de usar 
    details: grammY torna a criação de bots para Telegram tão simples que você já sabe como fazer.
  - title: Flexível
    details: grammY é aberto e pode ser extendido por plugins para atender exatamente às suas necessidades.
  - title: Escalável
    details: grammY te dá cobertura quando seu bot se torna popular e o tráfico aumenta.
footer: Copyright © 2021
permalink: /pt/
---

<h6 align="right">… {{ [
  'pense no por que',
  'uma nova era de desenvolvimento de bots',
  'roda mais rápido que você',
  'uma atualização à frente',
  'faz qualquer coisa, exceto lavar pratos',
  'tão fácil quanto tirar doce de criança'
][Math.floor(Math.random() * 6)] }}.</h6>

## Início Rápido

Os bots são escritos em [TypeScript](https://www.typescriptlang.org) (ou JavaScript) e rodam em várias plataformas, incluindo [Node.js](https://nodejs.org).

`npm install grammy` e cole o seguinte código:

<CodeGroup>
  <CodeGroupItem title="TS" active>

```ts
import { Bot } from "grammy";

const bot = new Bot(""); // <-- coloque o token do seu bot aqui (https://t.me/BotFather)

// Responda a todas as mensagens com "Olá!"
bot.on("message", (ctx) => ctx.reply("Olá!"));

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JS">

```ts
const { Bot } = require("grammy");

const bot = new Bot(""); // <-- coloque o token do seu bot aqui (https://t.me/BotFather)

// Responda a todas as mensagens com "Olá!"
bot.on("message", (ctx) => ctx.reply("Olá!"));

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot(""); // <-- coloque o token do seu bot aqui (https://t.me/BotFather)

// Responda a todas as mensagens com "Olá!"
bot.on("message", (ctx) => ctx.reply("Olá!"));

bot.start();
```

</CodeGroupItem>
</CodeGroup>

Funciona! :tada:

---

grammY suporta a API 5.3 de bots para Telegram, [lançada](https://core.telegram.org/bots/api#june-25-2021) em 25 de Junho, 2021
(Última novidade: Comandos Personalizados)
