---
layout: home
titleTemplate: false

hero:
  name: grammY
  text: O Framework de Bots para o Telegram.
  taglines: 
    - lembre-se do Y.
    - uma nova era de desenvolvimento de bots.
    - funciona mais rápido que você.
    - divirta-se criando bots.
    - um passo a frente.
    - pode fazer tudo, menos lavar a louça.
    - mamão com açúcar.
    - bilhões e bilhões de requisições.
    - movido pela obsessão.
  image:
    src: /images/Y.webp
    alt: logo do grammY
  actions:
    - theme: brand
      text: Primeiros Passos
      link: ./guide/getting-started
    - theme: alt
      text: Introdução
      link: ./guide/introduction

features:
  - icon: <img class="VPImage" src="/icons/beach-animation.webp" alt="animação de praia" width="32" height="32">
    title: Fácil de usar
    details: O grammY torna criar bots do Telegram tão simples que você já sabe como fazer isso.
  - icon: <img class="VPImage" src="/icons/palette-animation.webp" alt="animação de paleta de cores" width="32" height="32">
    title: Flexível
    details: grammY é aberto e pode ser extendido por plugins para caber exatamente nas suas necessidades.
  - icon: <img class="VPImage" src="/icons/rocket-animation.webp" alt="animação de foguete" width="32" height="32">
    title: Escalável
    details: grammY te dá cobertura quando o seu bot fica popular e o tráfego aumenta.
---

<HomeContent>

## Início rápido

Bots são escritos em [TypeScript](https://www.typescriptlang.org) (ou JavaScript) e rodam em várias plataformas, incluindo [Node.js](https://nodejs.org).

`npm install grammy` e cole o seguinte código:

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";

const bot = new Bot(""); // <-- coloque o token do seu bot entre os "" (https://t.me/BotFather)

// Responde qualquer mensagem com "Oiê!".
bot.on("message", (ctx) => ctx.reply("Oiê!"));

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");

const bot = new Bot(""); // <-- coloque o token do seu bot entre os "" (https://t.me/BotFather)

// Responde qualquer mensagem com "Oiê!".
bot.on("message", (ctx) => ctx.reply("Oiê!"));

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot(""); // <-- coloque o token do seu bot entre os "" (https://t.me/BotFather)

// Responde qualquer mensagem com "Oiê!".
bot.on("message", (ctx) => ctx.reply("Oiê!"));

bot.start();
```

:::

Funciona! :tada:

<footer id="home-footer">

---

<ClientOnly>
  <ThankYou :s="[
    'Obrigado, ',
    '{name}',
    ', por ser um contribuidor do grammY.',
    ', por criar o grammY.'
  ]" />
</ClientOnly>

<div style="font-size: 0.75rem; display: flex; justify-content: center;">

© 2021-2023 &middot; grammY suporta a API de bots para o Telegram 6.7 que foi [lançada](https://core.telegram.org/bots/api#april-21-2023) em 21 de Abril de 2023.
(Último destaque: múltiplos nomes de bot, emojis customizáveis e melhor inline queries)

</div>
</footer>
<ClientOnly>
  <LanguagePopup />
</ClientOnly>
</HomeContent>
