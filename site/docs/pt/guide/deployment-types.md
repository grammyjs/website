---
next: false
---

# Long Polling vs. Webhooks

Seu bot recebe mensagens do servidor do Telegram de duas maneiras.
Elas são chamadas _long polling_ e _webhooks_.
O grammY suporta os dois jeitos, e long polling é o padrão.

Esta seção primeiro descreve o que long polling e webhooks são, e depois descreve algumas das vantagens e desvantagens de usar cada um dos métodos de deploy, respectivamente.
Também iremos cobrir como usar cada um deles com o grammY.

## Introdução

Você pode pensar sobre toda a discussão de webhook vs. long polling como uma questão de qual _método de deploy_ utilizar.
Em outras palavras, há duas formas fundamentalmente diferentes de hospedar seu bot (rodar ele em algum servidor), e elas diferem entre si na maneira que as mensagens chegam ao seu bot, e podem ser processadas pelo grammY.

Essa escolha importa muito quando você precisa decidir onde hospedar seu bot.
Por exemplo, alguns provedores de infraestrutura suportam apenas um dos dois tipos de deploy.

Seu bot pode ou puxá-las do servidor (long polling), ou os servidores do Telegram podem enviá-las para o seu bot (webhooks).

> Se você já sabe como essas coisas funcionam, desça para ver como usar [long polling](#como-usar-long-polling) ou [webhooks](#como-usar-webhooks) com o grammY.

## Como Long Polling Funciona?

_Imagine que você está comprando uma bola de sorvete na sua sorveteria de confiança.
Você caminha até o atendente e pede o seu tipo favorito de sorvete.
Infelizmente, ele te avisa que esse sabor está esgotado._

_No próximo dia, você está doido por aquele sorvete de novo, então você volta no mesmo lugar e pede pelo mesmo sabor de sorvete.
Boas notícias!
Eles reabasteceram o estoque na noite passada então você vai poder aproveitar o seu delicioso sorvete de milho verde hoje!
Hmmmm._

**Polling** significa que o grammY proativamente envia a requisição ao Telegram, perguntando por novos updates (pense: mensagens).
Se não há novas mensagens lá, o Telegram vai retornar uma lista vazia, indicando que nenhuma nova mensagem foi enviada para o seu bot desde a última vez que você perguntou.

Quando o grammY envia uma requisição para o Telegram e novas mensagens foram enviadas para o seu bot nesse período, o Telegram vai retorná-las como um array de até 100 objetos.

```asciiart:no-line-numbers
______________                                   _____________
|            |                                   |           |
|            |   <---  tem mensagem nova? ---    |           |
|            |    ---       nem.          --->   |           |
|            |                                   |           |
|            |   <---  tem mensagem nova? ---    |           |
|  Telegram  |    ---       nem.          --->   |    Bot    |
|            |                                   |           |
|            |   <--- tem mensagem nova?  ---    |           |
|            |    ---   sim, aqui está    --->   |           |
|            |                                   |           |
|____________|                                   |___________|
```

É imediatamente óbvio que isso tem algumas desvantagens.
Seu bot apenas recebe novas mensagens quando ele pergunta por elas, ou seja, a cada poucos segundos ou algo assim.
Para fazer seu bot responder mais rápido, você poderia apenas enviar mais requisições e não esperar tanto entre elas.
Nós poderíamos por exemplo perguntar por novas mensagens a cada milisegundo! O que poderia dar errado...

Em vez de decidir spammar os servidores do Telegram, nós iremos usar _long polling_ em vez do polling regular (e curto).

**Long polling** siginifica que o grammY proativamente envia uma requisição para o Telegram, perguntando por novas atualizações.
Se não houver mensagens lá, o Telegram vai manter a conexão aberta até novas mensagens chegarem,
e então responder a requisição com aquelas novas mensagens.

_Hora do sorverte de novo!
O atendendente já te cumprimenta pelo primeiro nome agora.
Depois de perguntar sobre o seu sabor favorito, o atendente sorri pra você e congela.
Na verdade, você não recebe resposta nenhuma.
Então decide esperar, sorrindo de volta firmemente.
E você espera.
E espera._

_Algumas horas antes do sol nascer, um caminhão de de uma empresa local de entrega de alimentos chega e traz algumas caixas grandes para o depósito da sorveteria.
Está escrito **sorvete** do lado de fora.
O atendente finalmente começa a se mover novamente.
"Mas é claro que nós temos o de milho verde!
As duas bolas com granulado de sempre?"_

_Como se nada tivesse acontecido, você curte o seu sorvete enquanto sai da sorveteria mais esquisita do mundo._

```asciiart:no-line-numbers
______________                                   _____________
|            |                                   |           |
|            |   <--- tem mensagem nova ? ---    |           |
|            |   .                               |           |
|            |   .                               |           |
|            |   .     *ambos esperam*           |           |
|  Telegram  |   .                               |    Bot    |
|            |   .                               |           |
|            |   .                               |           |
|            |    ---   sim, aqui está    --->   |           |
|            |                                   |           |
|____________|                                   |___________|
```
> Note que na verdade, a conexão seria mantida por horas.
> Requisições long polling possuem um timeout padrão de 30 segundos (para evitar alguns [problemas técnicos](https://datatracker.ietf.org/doc/html/rfc6202#section-5.5)).
> Se nenhuma mensagem nova é retornada depois desse período de tempo, então a requisição será cancelada e reenviada---Mas o conceito geral permanece o mesmo.

Usando long polling você não precisa spammar os servidores do telegram, mas ainda assim recebe novas mensagens imediatamente!
Bacana.
Isso é o que o grammY faz por padrão quando você executa `bot.start()`.

## Como Webhooks Funcionam?

_Depois dessa experiência aterrorizante (uma noite inteira sem sorvete!), você preferiu não perguntar para mais ninguém sobre sorvete.
Não seria legal se o sorvete pudesse vir até você?_

Configurar um **webhook** significa que você fornece ao Telegram uma URL que é acessível pela internet pública.
Sempre que uma nova mensagem é enviada para o seu bot, o Telegram (e não você!) vai tomar a iniciativa e enviar uma requisição com o objeto de atualização para o seu servidor.
Legal, né?

_Você decide ir até a sorveteria uma última vez.
Você conta para o seu amigo atrás do balcão onde você mora.
Ele promete ir até o seu apartamento pessoalmente sempre que o sorvete chegar lá (porque pelo correio iria derreter).
Que cara legal._

```asciiart:no-line-numbers
______________                                   _____________
|            |                                   |           |
|            |                                   |           |
|            |                                   |           |
|            |       *ambos esperando*           |           |
|            |                                   |           |
|  Telegram  |                                   |    Bot    |
|            |                                   |           |
|            |                                   |           |
|            |   ---  oi, nova mensagem   --->   |           |
|            |    <---    valeu, cara     ---    |           |
|____________|                                   |___________|
```

## Comparação

**A principal vantagem de long polling em vez de webhooks é que ele é mais simples.**
Você não precisa de um domínio ou uma URL pública.
Você não precis fuçar as coisas configurando certificador SSL caso você esteja rodando seu bot em uma VPS.
Use `bot.start()` e tudo vai funcionar, nenhuma configuração adicional é necessária.
Sob carga, você está em controle total de quantas mensagens você é capaz de processar.

Lugares onde long polling funciona bem incluem:

- Durante o desenvolvimento na sua máquina local.
- Na maioria dos servidores.
- Em instâncias de "backend" hospedadas, ou seja, máquinas que ativamente rodam seu bot 24/7.

**A principal vantagem de webhooks em vez de long polling é que eles são mais baratos.**
Você poupa toneladas de requisições supérfluas.
Você não precisa manter uma conexão de rede aberta o tempo inteiro.
Você pode usar serviçoes que automaticamente escalam sua infraestrutura pra próximo de zero quando nenhuma requisição está chegando.
Se você quiser, você pode até mesmo [fazer uma chamada de API quando estiver respondendo a requisição do Telegram](#resposta-de-webhook), ainda que isso tenha algumas desvantagens.
Dê uma olhada na opção de configuração [aqui](https://deno.land/x/grammy/mod.ts?s=ApiClientOptions#prop_canUseWebhookReply).

Lugares onde webhooks funcionam bem incluem:

- Em servidores com certificados SSL.
- Em instâncias hospedadas de "frontend" que escalam de acordo com sua carga.
- Em plataformas serverless, como cloud functions ou edge networks programáveis.

## Eu Ainda Não Faço Ideia de Qual Usar

Então use long polling.
Se você não tem uma boa razão para utilizar webhooks, então note que não há nenhuma grande desvantagem em usar long polling, e---de acordo com nossa experiência---você vai gastar bem menos tempo consertando coisas.
Webhooks podem ser um pouquinho desagradáveis de vez em quando (veja [abaixo](#terminando-requisições-de-webhook-a-tempo)).

Independente da sua escolha, se você acabar entrando em grandes problemas, não deve ser tão difícil mudar para outro método de deploy depois.
Com o grammY, você só vai ter que mexer em poucas linhas de código.
A configuração dos seus [middlewares](./middleware) é a mesma.

## Como Usar Long Polling

Chame

```ts
bot.start()
```

para rodar seu bot com uma forme bem simples de long polling.
Isso vai processar todos os updates sequencialmente.
Isso torna seu bot bem simples de debuggar, além de manter todo o comportamente bem previsível, porque não há nenhuma concorrência envolvida.

Se você quer que suas mensagens sejam tratadas concorrentemente pelo grammY, ou se está preocupado com a velocidade do processamento de updates, dê uma olhada na seção sobre o [grammY runner](../plugins/runner).

## Como Usar Webhooks

Se você quiser usar o grammY com webhooks, você pode integrar seu bot em um servidor web.
Portanto, nós esperamos que você seja capaz de iniciar um servidor web simples com um framework de sua preferênca.

Todos os bots que usam grammY podem ser convertidos para um middleware de vários frameworks web, incluindo `express`, `koa`/`oak`, e mais.
Você pode importar a função `webhookCallback` ([Referência da API](https://deno.land/x/grammy/mod.ts?s=webhookCallback)) para criar um middleware para o respectivo framework.

::: code-group

```ts [TypeScript]
import express from "express";

const app = express(); // ou seja lá o que você estiver usando
app.use(express.json()); // parsear o JSON no body da requisição

// "express" também é usado como default se nenhum argumento for fornecido
app.use(webhookCallback(bot, "express"));
```

```js [JavaScript]
const express = require("express");

const app = express(); // ou seja lá o que você estiver usando
app.use(express.json()); // parsear o JSON no body da requisição

// "express" também é usado como default se nenhum argumento for fornecido
app.use(webhookCallback(bot, "express"));
```

```ts [Deno]
import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application(); // ou seja lá o que você estiver usando

// Lembre-se de especificar o framework que está utilizando
app.use(webhookCallback(bot, "oak"));
```

:::

> Note que você nunca deve chamar `bot.start()` quando usar webhooks.

Lembre-se de ler o [Maravilhoso Guia para Tudo sobre Webhooks](https://core.telegram.org/bots/webhooks) escrito pelo time do Telegram se você considera rodar seu bot via webhooks em uma VPS.

### Adaptadores de Frameworks Web

Para que possa suportar diferente tipos de frameworks web, grammY adota o conceito de **adaptadores**.
Cada adaptador é responsável por transmitir informações que chegam e saem do framework para o grammY e vice-versa.
The second parameter passed to `webhookCallback` ([Referência da API](https://deno.land/x/grammy/mod.ts?s=webhookCallback)) define o adaptador de framework usado para se comunicar com o framework web.

Pela maneira que essa abordagem funciona, nós geralmente precisamos de um adaptador para cada framework mas já que alguns frameworks compartilham uma interface similar, existem adaptadores que são conhecidos por funcionar em múltiplos frameworks.

| Adaptador        | Framework/API/Runtime                                                          |
| ---------------- | ------------------------------------------------------------------------------ |
| `aws-lambda`     | AWS Lambda Functions                                                           |
| `azure`          | Azure Functions                                                                |
| `cloudflare`     | Cloudflare Workers                                                             |
| `cloudflare-mod` | Cloudflare Module Workers                                                      |
| `express`        | Express, Google Cloud Functions                                                |
| `fastify`        | Fastify                                                                        |
| `hono`           | Hono                                                                           |
| `http`, `https`  | Módulos `http`/`https` do Node.js, Vercel                                      |
| `koa`            | Koa                                                                            |
| `next-js`        | Next.js                                                                        |
| `oak`            | Oak                                                                            |
| `serveHttp`      | `Deno.serveHttp`                                                               |
| `std/http`       | `Deno.serve`, `std/http`, `Deno.upgradeHttp`, `Fresh`, `Ultra`, `Rutt`, `Sift` |
| `sveltekit`      | SvelteKit                                                                      |
| `worktop`        | Worktop                                                                        |

### Resposta de Webhook

Quando uma requisicão é recebida pelo seu webhook, seu bot pode chamar até um método na resposta.
Como benefício, isso poupa seu bot de fazer até uma requisição HTTP por update.
Entretanto, existem algumas desvantagens de utilizar isso:

1. Você não vai poder gerenciar potencias erros na respectiva chamada de API.
   Isso inclui erros de limitação de taxa, então você não vai ter garantias de que sua requisição teve algum efeito.
2. Mais importante, você também não vai ter acesso ao objeto de resposta.
   Por exemplo, chamar `sendMessage` não vai te dar acesso a mensagem enviada.
3. Além disso, não será possível cancelar uma requisição.
   O `AbortSignal` será desconsiderado.
4. Note também que os tipos no grammY não refletirão nas consequências de um callback de webhook performado!
   Por exemplo, eles indicam que você sempre vai receber um objeto de resposta, então é sua próprio responsabilidade garantir que você não vai fazer besteira enquanto utiliza esse detalhe de optmização de performance.

Se você quiser usar as respostas de webhook, você pode especificar a opção `canUseWebhookReply` na opção `client` do seu `BotConfig` ([Refência de API](https://deno.land/x/grammy/mod.ts?s=BotConfig)).
Passe a funcão que determina se você vai ou não utilizar o resposta de webhook para a dada requisição, identificada por método.

```ts
const bot = new Bot("", {
  client: {
    // Nós aceitamos a desvantagem da resposta de webhook para o status "digitando".
    canUseWebhookReply: (method) => method === "sendChatAction",
  },
});
```

É assim que as respostas de webhook funcionam por debaixo dos panos:

```asciiart:no-line-numbers
______________                                   _____________
|            |                                   |           |
|            |                                   |           |
|            |                                   |           |
|            |        *ambos esperando*          |           |
|            |                                   |           |
|  Telegram  |                                   |    Bot    |
|            |                                   |           |
|            |                                   |           |
|            |    ---  oi, nova mensagem --->    |           |
|            | <---ok, e leva sendChatAction --- |           |
|____________|                                   |___________|
```

### Terminando Requisições de Webhook a Tempo

> Você pode ignorar o resto dessa página se todos os seus middlewares concluem rápido, isto é, dentro de poucos segundos.
> Essa seção é primariamente para pessoas que querem fazer envio de arquivos em resposta a mensagens, ou outras operações que tomam mais tempo.

Quando o Telegram envia um update de um chat do seu bot, ele vai esperar você terminar a requisição antes de entregar o próximo update que pertence ao chat.

Em outras palavras, o Telegram vai entregar os updates de um mesmo chat em sequência, e updates de chats diferentes serão enviadas concorrentemente.
(A fonte desta informação está [aqui](https://github.com/tdlib/telegram-bot-api/issues/75#issuecomment-755436496).)

O Telegram garante que o seu bot receberá todos os updates.
Isso significa que se uma entrega de update falha para um chat, os updates subsequentes aguardarão até que o primeiro obtenha sucesso para serem entregues.

#### Por Que Não Terminar uma Requisição de Webhook É Perigoso

O Telegram tem um timeout para cada update que é enviado para o endpoint do seu webhook.
Se você não termina uma requisição de webhook rápido o suficiente, o Telegram vai reenviar o update, assumindo que ele não foi entregue.
Como resultado, o seu bot pode inesperadamente processar o mesmo update duas vezes.
Isso significa que ele vai performar todos os tratamentos de updates, incluindo o envio de qualquer mensagem de resposta, múltiplas vezes.

```asciiart:no-line-numbers
______________                                   _____________
|            |                                   |           |
|            | ---    oi, nova mensagem  --->    |           |
|            |                              .    |           |
|            |        *bot processando*     .    |           |
|            |                              .    |           |
|  Telegram  | --- Eu disse nova mensagem!! ---> |    Bot    |
|            |                              ..   |           |
|            |       *bot processando 2x*   ..   |           |
|            |                              ..   |           |
|            | ---      AAALOOOOOOO      --->    |           |
|            |                              ...  |           |
|            |       *bot processando 3x*   ...  |           |
|____________|                              ...  |___________|
```

É por isso que o grammY tem seu próprio e mais curto timeout dentro de `webhookCallback` (padrão: 10 segundos).
Se o seu middleware terminar antes disso, a função `webhookCallback` vai responder ao webhook automaticamente.
Nesse caso, tudo ocorre normalmente.
Entretanto, se o seu middleware não terminar antes do timeout do grammY, `webhookCallback` vai lançar um erro.
Isso significa que você pode tratar o erro no seu framework web.
Se você não tem esse tratamento de erro, o Telegram vai enviar o mesmo update novamente---mas ao menos você vai ter os logs de erros agora para te dizer que alguma coisa está errada.

Uma vez que o Telegram envia o update para o seu bot pela segunda vez, é improvável que o seu tratamento será mais rápido que da primeira vez.
Como resultado, ele provavelmente vai receber um timeout novamente, e o Telegram vai enviar o update de novo.
Por isso, seu bot não verá o update apenas duas vezes, mas algumas dúzias de vezes, até o Telegram parar de tentar.
Você pode observar seu bot começar a spammar usuários enquanto tenta tratar todos esses updates (que são na verdade o mesmo toda vez).

#### Por Que Terminar uma Requisição de Webhook Cedo Também É Perigoso

Você pode configurar `webhookCallback` para não lançar um erro depois do timeout, mas em vez disso terminar a requisição do webhook cedo, ainda que seu middleware ainda esteja sendo executado.
Você pode fazer isso passando `"return"` como o terceiro argumento de `webhookCallback`, em vez do valor padrão `"throw"`.
Entretanto, enquanto este comportamento tem alguns casos de uso válidos, esta solução geralmente causa mais problemas do que resolve.

Lembre-se de que uma vez que você responde à requisição do webhook, o Telegram vai enviar o próximo update para aquele chat.
Entretanto, como o antigo update ainda está sendop processado, dois updates que seriam previamente processados sequencialmente, são repentinamente processados em paralelo.
Isso pode levar a race conditions.
Por exemplo, o plugin de sessão vai inevitavalmente quebrar devido a riscos de [WAR](https://en.wikipedia.org/wiki/Hazard_(computer_architecture)#Write_after_read_(WAR)).
**Isso causa perda de dados!**
Outros plugins e até seu próprio middleware podem quebrar também.
A extensão desse problema é desconhecida e depende do seu bot.

#### Como Resolver Esse Problema

Essa resposta é mais fácil de dizer do que implementar.
**É seu dever garantir que seu middleware termine rápido o suficiente.**
Não use middlewares grandes demais.
Sim, nós sabemos que você talvez _queira_ ter tarefas longas.
Mesmo assim.
Não faça isso.
Não no seu middleware.

Em vez disso, use uma fila (há várioos sistemas de filas por aí, do mais simples ao mais sofisticado).
Em vez de tentar fazer todo o trabalho na pequena janela de tempo do webhook, apenas adicione a tarefa à fila para ser tratada separadamente, e deixe seu middleware completar.
A fila pode tomar o tempo que precisar.
Quando terminar, ela pode enviar uma mensagem de volta ao chat.
Isso é bem intuitivo de fazer se você usar uma fila simples em memória.
Pode ser um pouco mais desafiador se você está usando um sistema de filas externo e tolerante a erros, que persiste o estado de todas as tarefas e pode realizar novas tentativas mesmo se seu servidor morrer repentinamente.

```asciiart:no-line-numbers
______________                                   _____________
|            |                                   |           |
|            |   ---   oi, nova mensagem  --->   |           |
|            |  <---       vlw mano       ---.   |           |
|            |                               .   |           |
|            |                               .   |           |
|  Telegram  |   *fila do bot trabalhando*   .   |    Bot    |
|            |                               .   |           |
|            |                               .   |           |
|            |  <--- mensagem com resultado  --- |           |
|            |   ---       certinho       --->   |           |
|____________|                                   |___________|
```

#### Por Que `"return"` É Geralmente Pior Que `"throw"`

Você talvez possa estar se perguntando por que a ação padrão do `webhookCallback` é lançar um erro, em vez de terminar a requisição com sucesso.
Essa escolha de design foi feita pelas seguintes razões.

Race conditions são muito difíceis de reproduzir e podem ocorrer de maneira extremamente rara e esporádica.
A solução para isso é _garantir que não ocorram timeouts_ em primeiro lugar.
Mas, se ocorrerem, você realmente quer saber que isso está acontecendo, para poder então investigar e resolver o problema!
Por esse motivo, você quer que os erros apareçam nos seus logs.
Configurar o handler de timeout para `"return"`, consequentemente suprimindo o timeout e fingindo que nada aconteceu, é o exato oposto de comportamento útil.

Se você faz isso, você está de alguma forma usando a fila de updates na entrega de webhooks do Telegram como suas fila de tarefas.
Isso é uma ideia ruim por todos os motivos descritos acima.
Só porque o grammY _pode_ surprimir erros que podem fazer você perder dados, não siginifca que você _deve_ mandar ele fazer isso.
Esse modelo de configuração não deve ser utilizado em casos onde seu middleware simplesmente leva muito tempo para completar.
Gaste algum tempo para resolver o problema corretamente e o seu futuro eu (e usuários) vai agradecer você.
