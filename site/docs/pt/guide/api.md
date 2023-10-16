# Bot API

## Informações Gerais

Os bots do Telegram se comunicam com os servidores do Telegram por meio de solicitações HTTP.
A API de bots do Telegram é a especificação dessa interface, ou seja, uma [longa lista](https://core.telegram.org/bots/api) de métodos e tipos de dados, comumente chamada de referência.
Ela define tudo o que os bots do Telegram podem fazer.
Você pode encontrá-la vinculada na aba Recursos.

A configuração pode ser visualizada da seguinte forma:

```asciiart:no-line-numbers
( ( ( Telegram ) API MTProto ) API HTTP de Bots ) <-- o bot se conecta aqui
```

Em palavras: quando seu bot envia uma mensagem, ela será enviada como uma solicitação HTTP para um _servidor da Bot API_ (seja hospedado pela equipe do Telegram ou [hospedado por você](https://core.telegram.org/bots/api#using-a-local-bot-api-server)).
Este servidor irá traduzir a solicitação para o protocolo nativo do Telegram chamado MTProto e enviar uma solicitação para o backend do Telegram, que cuida do envio da mensagem para o usuário.

Analogamente, quando um usuário responde, o caminho inverso é percorrido.

::: tip Contornando os Limites de Tamanho de Arquivo
O backend do Telegram permite que seu bot [envie arquivos](./files) de até 2000 MB.
No entanto, o servidor da Bot API responsável por traduzir as solicitações para HTTP restringe o tamanho do arquivo para 50 MB para downloads e 20 MB para uploads.

Portanto, se você contornar o servidor da Bot API que o Telegram fornece para você e simplesmente [hospedar seu próprio servidor da Bot API](https://core.telegram.org/bots/api#using-a-local-bot-api-server), você pode permitir que seu bot envie arquivos de até 2000 MB.

> Nota: se você está trabalhando com arquivos grandes por meio de [long polling](./deployment-types), você deve usar o [grammY runner](../plugins/runner).

:::

## Chamando a Bot API

Cada um dos métodos da Bot API tem um equivalente no grammY.
Exemplo: `sendMessage` na [Referência da Bot API do Telegram](https://core.telegram.org/bots/api#sendmessage) e na [Referência da API do grammY](https://deno.land/x/grammy/mod.ts?s=Api#method_sendMessage_0).

### Chamando um Método

Você pode chamar métodos da API por meio de `bot.api`, ou [equivalentemente](./context#available-actions) por meio de `ctx.api`:

```ts
async function sendHelloTo12345() {
  // Envia uma mensagem para 12345.
  await bot.api.sendMessage(12345, "Oi!");

  // Envia uma mensagem e armazena a resposta, que contém informações sobre a mensagem enviada.
  const sentMessage = await bot.api.sendMessage(12345, "Oi de novo!");
  console.log(sentMessage.message_id);
}
```

Embora `bot.api` cubra toda a Bot API, às vezes ele altera um pouco as assinaturas de funções para torná-las mais utilizáveis.
Estritamente falando, todos os métodos da Bot API esperam um objeto JSON com várias propriedades.
No entanto, observe como o `sendMessage` no exemplo acima recebe dois argumentos: um identificador de chat e uma string.
O grammY sabe que esses dois valores pertencem às propriedades `chat_id` e `text`, respectivamente, e construirá o objeto JSON correto para você.

Conforme mencionado [anteriormente](./basics#sending-messages), você pode especificar outras opções no terceiro argumento de tipo `Other`:

```ts
async function sendHelloTo12345() {
  await bot.api.sendMessage(12345, "<i>Oi!</i>", {
    parse_mode: "HTML",
  });
}
```

Além disso, o grammY cuida de vários detalhes técnicos para simplificar o uso da API.
Como exemplo, algumas propriedades específicas em alguns métodos específicos precisam ser passadas por `JSON.stringify` antes de serem enviadas.
Isso é fácil de esquecer, difícil de debugar e quebra a inferência de tipos.
O grammY permite que você especifique objetos de maneira consistente em toda a API e garante que as propriedades corretas sejam serializadas automaticamente antes de serem enviadas.

### Definições de Tipo para a API

O grammY possui cobertura de tipos completa para a Bot API.
O repositório [`@grammyjs/types`](https://github.com/grammyjs/types) contém as definições de tipo que o grammY usa internamente.
Essas definições de tipo também são exportadas diretamente do pacote principal `grammy`, para que você possa usá-las em seu próprio código.

#### Definições de Tipo no Deno

No Deno, você pode simplesmente importar as definições de tipo de `types.ts`, que está ao lado de `mod.ts`:

```ts
import { type Chat } from "https://deno.land/x/grammy/types.ts";
```

#### Definições de Tipo no Node.js

No Node.js, as coisas são um pouco mais complicadas.
Você precisa importar os tipos de `grammy/types`.
Por exemplo, você obtém acesso ao tipo `Chat` da seguinte forma:

```ts
import { type Chat } from "grammy/types";
```

No entanto, oficialmente, o Node.js só suporta a importação de subcaminhos corretamente desde o Node.js 16.
Consequentemente, o TypeScript exige que a opção `moduleResolution` seja definida como `node16` ou `nodenext`.
Ajuste seu arquivo `tsconfig.json` de acordo e adicione a linha destacada:

```json{4}
{
  "compilerOptions": {
    // ...
    "moduleResolution": "node16"
    // ...
  }
}
```

Em alguns casos, isso também pode funcionar sem ajustar sua configuração do TypeScript.

::: aviso Autocomplete Incorreto

Se você não alterar seu arquivo `tsconfig.json` conforme descrito acima, pode acontecer de seu editor de código sugerir, no autocomplete, importar os tipos de `grammy/out/client` ou algo do tipo.
**Todos os caminhos começando com `grammy/out` são internos. Não os utilize.**
Eles podem ser alterados arbitrariamente a qualquer momento, então recomendamos fortemente que você importe de `grammy/types`.

:::

### Realizando Chamadas de API Brutas

Pode haver momentos em que você deseja usar as assinaturas originais das funções, mas ainda contar com a conveniência da API do grammY (por exemplo, serialização JSON quando apropriado).
O grammY oferece suporte a isso por meio das propriedades `bot.api.raw` (ou `ctx.api.raw`).

Você pode chamar os métodos brutos assim:

```ts
async function sendHelloTo12345() {
  await bot.api.raw.sendMessage({
    chat_id: 12345,
    text: "<i>Oi!</i>",
    parse_mode: "HTML",
  });
}
```

Basicamente, todos os parâmetros da assinatura da função são mesclados com o objeto de opções quando você usa a API bruta.
