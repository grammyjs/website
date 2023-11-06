# CheckList do Deploy

Aqui está uma lista de coisas que você talvez queria ter em mente ao hospedar um grande bot.

> Você talvez também esteja interessado em nossos guias de hospedagem de bots.
> Dê uma olhada em **Hospedagem / Tutoriais** no topo de nossa página para ver algumas das plataformas que já possuem guias dedicados

## Erros

1. [Instale um tratamento de erro com `bot.catch` (long polling) ou no seu framework web (webhooks).](../guide/errors)
2. Use `await` em todas as suas `Promise`s e instale um **linter**, com regras que garantam isso, para que você nunca se esqueça.

## Envio de Mensagens

1. Envie arquivos pelo caminho ou `Buffer` em vez streams, ou ao menos tenha certeza que você [conhece as armadilhas](./transformers#casos-de-uso-de-funções-transformadoras).
2. Use `bot.on("callback_query:data")` como o handler reserva para [reagir a todas callback queries](../plugins/keyboard#respondendo-a-clicks).
3. Use o [plugin de `auto-retry`]((../plugins/auto-retry)) para lidar automaticamente com erros de espera por flood.

## Escalando

Isso depende do seu tipo de deploy.

### Long Polling

1. [Use o grammY runner.](../plugins/runner)
2. [Use `sequentialize` com a mesma função que que você utiliza para gerar chaves em seu middleware de sessão](./scaling#concorrência-é-difícil)
3. Confira as opções de configuração de `run` ([Referência da API](https://deno.land/x/grammy_runner/mod.ts?s=run)) e garanta que elas se adequem às suas necessidades, ou considere até compor seu próprio runner a partir das [fontes](https://deno.land/x/grammy_runner/mod.ts?s=UpdateSource) e [coletores](https://deno.land/x/grammy_runner/mod.ts?s=UpdateSink).
    A principal coisa a se considerar é a carga máxima que você quer aplicar ao seu servidor, isto é, quantas atualizações podem ser processadas ao mesmo tempo.
4. Considere implementar [desligamento seguro](./reliability#desligamento-seguro) para parar seu bot quando você o encerrar (isto é, para mudar para uma nova versão).

### Webhooks

1. Garanta que você não vai realizar nenhuma operação de longa duração nos seus middlewares, como transferência de grandes arquivos.
    [Isso leva a erros de timeout](../guide/deployment-types#terminando-requisições-de-webhook-a-tempo) para os webhooks, e duplica o processamento de atualizações já que o Telegram vai reenviar atualizações não reconhecidas.
    Considere usar um sistema de filas de tarefas no lugar.
2. Familiarize-se com a configuração de `webhookCallback` ([Referência de API](https://deno.land/x/grammy/mod.ts?s=webhookCallback)).
3. Se você ajustou a opção de `getSessionKey` para sua sessão, [use `sequentialize` com a mesma função que que você utiliza para gerar chaves em seu middleware de sessão](./scaling#concorrência-é-difícil)
4. Se você está rodando seu bot em plataformas serverless ou de scaling automático, [ajuste as informações do bot](https://deno.land/x/grammy/mod.ts?s=BotConfig) para prevenir chamadas `getMe` excessivas.
5. Considere usar [respostas de webhook](./guide/deployment-types#resposta-de-webhook).

## Sessões

1. Considere usar `LazySession` como explicado [aqui](../plugins/session#lazy-sessions).
2. Use a opção de `armazenamento` para ajustar o seu adaptador de armazenamento, se não todos os seus dados serão perdidos quando o seu bot parar.

## Testes

Escreva testes para o seu bot.
Isso pode ser feito com o grammY assim:

1. Faça o mock de requisições de API externas usando [funções transformadoras](./transformers).
2. Defina e envie modelos de objetos de atualização para o seu bot via `bot.handleUpdate` ([Referência da API](https://deno.land/x/grammy/mod.ts?s=Bot#method_handleUpdate_0)).
    Considere pegar um pouco de inspiração desses [objetos de atualização](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates) fornecidos pelo time do Telegram.

::: tip Contribua para um Framework de Testes
Ainda que o grammY forneça os ganchos necessários parar começar a escrever testes, seria muito útil ter um framework de testes para bots.
Essa área é um território totalmente novo, já que tal framework de testes ainda não existe.
Nós estamos esperando pelas suas contribuições!

Um exemplo de como testes podem ser realizados [pode ser encontrado aqui](https://github.com/PavelPolyakov/grammy-with-tests).
:::
