---
next: false
---

# O Guia do Mochileiro dos Plugins do grammY

Se você gostaria de desenvolver seu próprio plugin e publicá-lo, ou quer saber como os plugins do grammY funcionam por debaixo dos panos, você está no lugar certo!

> Por favor note que já existe um sumário sobre os [plugins do grammY](./) e o que eles fazem.
> Esse artigo é um mergulho no seu funcionamento interno.

## Tipos de Plugins no grammY

Existem dois tipos principais de plugins no grammY:

- Plugins Middleware: O único propósito desse plugin é retornar uma [função middlware](../guide/middleware) que vai alimentar um bot do grammY.
- Plugins Middleware: O único propósito desse plugin é retornar uma [função transformadora](../guide/middleware) que vai alimentar um bot do grammY.

Entretanto, as vezes você vai encontrar plugins que fazem as duas coisas.
Tem também outros pacotes que não são nem middlewares e nem funções transformadores, mas nós vamos chamar eles de plugins de qualquer jeito porque extendem as funcionalidades do grammy de diversas formas.

## Regras de Contribuição

Você pode publicar plugins em uma das seguintes formas:

- Publicando como um plugin **oficial**.
- Publicando como um plugin de **terceiro**.

Se você escolher publicar seus plugins como um terceiro, nós ainda podemos te oferecer um lugar de destaque nesse site.
No entanto, nós vamos preferir se você publicar seu plugin sob a [organização grammyjs](https://github.com/grammyjs) no GitHub, sendo assim um plugin oficial.
Nesse caso, você vai ganhar acesso a publicar no GitHub e no npm.
Adicionalmente, Você será responsável por manter seu código.

Antes de entrar em alguns exemplos práticos, tem algumas regras para se atentar se quiser que seus plugins sejam listados nesse site.

1. Tenha um README no GitHub (e npm) com instruções **curtas e claras** de como usá-lo.
2. Explique o propósito do seu plugin e como usá-lo adicionando uma página na [documentação](https://github.com/grammyjs/website).
   (Nós podemos criar essa página pra você se não inseguro sobre como faze-lo.)
3. Escolha licenças permissivas como MIT ou ISC.

Finalmente, saiba que mesmo que o grammY suporte tanto Node.js quanto [Deno](https://deno.com), esse projeto é Deno-first, e te encorajamos a escrever seus plugins para o Deno (e consequentemente com estilo!)

Tem uma ferramenta muito útil chamada [deno2node](https://github.com/fromdeno/deno2node) que transpila seu código Deno para Node.js, para que possamos dar suporte a ambas as plataformas igualmente bem.
O suporte a Deno é um requisito obrigatório apenas para plugins oficiais, mas não para plugins de terceiros.
Entretanto, encorajamos bastante que dê uma chance ao Deno.
Você não vai se arrepender.

## Escrevendo um Exemplo de Plugin Middleware

Vamos assumir que você gostaria de escrever um plugin que só responde a certos usuários!
Por exemplo, poderiamos decidir só responder pessoas cujo nome começa com uma determinada palavra.
O bot vai simplesmente recusar funcionar com todas as outras pessoas.

Aqui vai um exemplo simples:

```ts
// plugin.ts

// Importando tipos do grammY (nós vamos re-exportá-los no `deps.deno.ts`).
import type { Context, Middleware, NextFunction } from "./deps.deno.ts";

// Seu plugin só pode ter uma função principal que cria o middleware
export function onlyAccept<C extends Context>(str: string): Middleware<C> {
  // Cria e retorna o middleware.
  return async (ctx, next) => {
    // Pega o primeiro nome do usuário.
    const name = ctx.from?.first_name;
    // Aceita todo nome que bater com o desejado.
    if (name === undefined || name.includes(str)) {
      // Passa o controle do fluxo para o próximo middleware.
      await next();
    } else {
      // Diga que não gostamos dele.
      await ctx.reply(`Eu não falo com você! Você não liga para o ${str}!`);
    }
  };
}
```

Agora, pode ser usado em um bot de verdade:

```ts
// Aqui o código do plugin está num arquivo chamado `plugin.ts`.
import { onlyAccept } from "./plugin.ts";
import { Bot } from "./deps.deno.ts";

const bot = new Bot("");

bot.use(onlyAccept("grammY"));

bot.on("message", (ctx) => ctx.reply("Você passou o plugin middleware"));

bot.start();
```

Voilà!
Você criou um plugin, certo?
Bom, não tão rápido.
Nós ainda precisamos empacotá-lo, mas antes disso, vamos dar também uma olhada em plugins transformadores.

## Escrevendo um Exemplo de Plugin Transformador

Imagine um plugin que envia uma [ação de chat](https://core.telegram.org/bots/api#sendchataction) apropriada automaticamente sempre que o bot enviar um documento.
Isso significa que enquanto seu bot estiver enviando um arquivo, os usuários automaticamente verão um "_enviando arquivo_" como status.
Muito legal, certo?

```ts
// plugin.ts
import type { Transformer } from "./deps.deno.ts";

// Função principal do plugin
export function autoChatAction(): Transformer {
  // Cria e retorna uma função transformadora.
  return async (prev, method, payload, signal) => {
    // Salva o handle do set interval pra poder limpá-lo depois.
    let handle: ReturnType<typeof setTimeout> | undefined;
    if (method === "sendDocument" && "chat_id" in payload) {
      // Nós sabemos que um documento está sendo enviado.
      const actionPayload = {
        chat_id: payload.chat_id,
        action: "upload_document",
      };
      // Mude a ação de chat repetidamente enquanto o arquivo está sendo enviado.
      handle ??= setInterval(() => {
        prev("sendChatAction", actionPayload).catch(console.error);
      }, 5000);
    }

    try {
      // Execute o método do bot.
      return await prev(method, payload, signal);
    } finally {
      // Limpa o set interval para interromper o envio da ação de chat para o cliente.
      clearInterval(handle);
    }
  };
}
```

Agora, podemos usá-lo num bot de verdade:

```ts
import { Bot, InputFile } from "./deps.deno.ts";
// O código do plugin está num arquivo chamado `plugin.ts`
import { autoChatAction } from "./plugin.ts";

// Instancia um bot.
const bot = new Bot("");

// Usa o plugin.
bot.api.config.use(autoChatAction());

bot.hears("me envie um documento", async (ctx) => {
  // Se o usuário enviar esse comando, nós vamos mandar um arquivo pdf de volta (para fins de demonstração)
  await ctx.replyWithDocument(new InputFile("/tmp/document.pdf"));
});

// inicia o bot
bot.start();
```

Agora, toda vez que enviarmos um documento, a ação de chat de `upload_document` vai ser enviada para nosso cliente.
Note que isso foi apenas para fins de demonstração.
O Telegram recomenda usar ações de chat apenas quando "uma resposta do bot vai demorar um tempo **considerável** para chegar".
Você provavelmente não vai precisar alterar o status se o arquivo for muito pequeno, então existem algumas otimizações possíveis aqui.

## Extraindo para um Plugin

Qualquer que seja o tipo de plugin criado, você deve empacotá-lo como um pacote independente.
Essa tarefa é bem simples.
Não existem regras específicas para como fazer isso e o npm está ao seu dispor, mas apenas para manter as coisas organizadas, nós temos um template sugerido pra você.
Você pode baixar o código do nosso [repositório de plugins no GitHub](https://github.com/grammyjs/plugin-template) e começar a desenvolver seu plugin sem gastar tempo nenhum com configurações.

A sugestão inicial de estrutura de pastas:

```asciiart:no-line-numbers
plugin-template/
├─ src/
│  ├─ deps.deno.ts
│  ├─ deps.node.ts
│  └─ index.ts
├─ package.json
├─ tsconfig.json
└─ README.md
```

**`deps.deno.ts` e `deps.node.ts`**: Isso é para os desenvolvedores que estão dispostos a escrever o plugin para Deno e depois transpilá-lo para Node.js.
Como mencionado anteriormente, nós usamos o `deno2node` para transpilar nosso código Deno para Node.js.
O `deno2node` tem uma feature que permite que você disponibilize arquivos específicos de runtime pra ele.
Esses arquivos devem estar adjacentes e seguir a estrutura de nomes `*.deno.ts` e `*.node.ts` como [explicado na documentação](https://github.com/fromdeno/deno2node#runtime-specific-code).
Esse é o porquê de ter os dois arquivos: `deps.deno.ts` e `deps.node.ts`.
Se houver qualquer dependência específica de Node.js, coloque-a no `deps.node.ts`, se não, deixe em branco.

> _**Nota**_: Você talvez use outras ferramentas como [deno dnt](https://github.com/denoland/dnt) para transpilar seu código deno ou usar estruturas de pastas diferentes.
> A ferramenta é irrelevante, o principal ponto aqui é que escrever código Deno é melhor e mais fácil.

**`tsconfig.json`**: Esse é o arquivo de configuração do compilador TypeScript usado pelo `deno2node` para transpilar seu código.
Um arquivo padrão é oferecido no repositório como sugestão.
Ele corresponde a configuração TypeScript que o Deno usa internamente, e recomendamos que você mantenha assim.

**`package.json`**: O arquivo package.json para a versão do seu plugin no npm.
**Certifique-se de alterá-lo de acordo com seu projeto**

**`README.md`**: Instruções de como usar o plugin.
**Certifique-se de alterá-lo de acordo com seu projeto**

**`index.ts`**: O arquivo contendo suas regras de negócio, ou seja, o código principal do seu plugin.

## Existe um Modelo

Se você gostaria de desenvolver um plugin para o grammY e não sabe por onde começar, recomendamos fortemente o template no [nosso repositório](https://github.com/grammyjs/plugin-template).
Você pode clonar o código e começar a codar baseado no que foi coberto nesse artigo.
Esse repositório também inclui alguns mimos como `.editorconfig`, `LICENSE`, `.gitignore`, etc, mas você pode deletá-los se quiser.

## Eu Não Gosto de Deno

Bom, você está perdendo!
Porém você também pode escrever seus plugins apenas em Node.js.
Você ainda pode publicar seu plugin e ter ele listado como plugin de terceiro nesse site.
Nesse caso, você pode usar qualquer estrutura de pastas que preferir (contanto que seja tão organizado como qualquer outro projeto npm).
Simplesmente installe o grammY pelo npm com `npm install grammy` e comece a codar.

## Como Submeter?

Se você tem um plugin pronto, você pode simplesmente abrir um pull request no GitHub (de acordo com as [Regras de Contrinbuição](#rules-of-contribution)), ou nos notificar no [chat da comunidade](https://t.me/grammyjs) para mais auxílio.
