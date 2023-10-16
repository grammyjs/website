# Middleware

As funções listener que são passadas para `bot.on()`, `bot.command()` e seus irmãos são chamadas de _middleware_.
Embora não esteja errado dizer que elas estão ouvindo atualizações, chamá-las de "listeners" é uma simplificação.

> Esta seção explica o que é middleware e usa o grammY como exemplo para ilustrar como eles podem ser usados.
> Se você está procurando documentação específica sobre o que torna a implementação de middlewares do grammY especial, confira [Middleware Redux](../advanced/middleware) na seção avançada da documentação.

## A Pilha de Middlewares

Suponha que você escreva um bot assim:

```ts{8}
const bot = new Bot("");

bot.use(session());

bot.command("start", (ctx) => ctx.reply("Started!"));
bot.command("help", (ctx) => ctx.reply("Help text"));

bot.on(":text", (ctx) => ctx.reply("Text!")); // (*)
bot.on(":photo", (ctx) => ctx.reply("Photo!"));

bot.start();
```

Quando um update com uma mensagem de texto regular chega, essas etapas serão executadas:

1. Você envia `"Olá!"` para o bot.
2. O middleware de sessão recebe o update e faz suas coisas de sessão
3. O update será verificado à procura de um comando `/start`, que não existe
4. O update será verificado à procura de um comando `/help`, que não existe
5. O update será verificado à procura de texto na mensagem (ou postagem de canal), o que dá certo.
6. O middleware em `(*)` será invocado, ele lida com o update respondendo com `"Texto!"`.

O update **não** é verificado à procura de uma foto, porque o middleware em `(*)` já tratou o update.

Agora, como isso funciona?
Vamos descobrir.

Podemos inspecionar o tipo `Middleware` na referência do grammY [aqui](https://deno.land/x/grammy/mod.ts?s=Middleware):

```ts
// Alguns parâmetros de tipo omitidos para brevidade.
type Middleware = MiddlewareFn | MiddlewareObj;
```

Aha!
Middlewares podem ser uma função ou um objeto.
Até agora, só usamos funções (`(ctx) => { ... }`), então vamos ignorar os objetos de middleware por enquanto e aprofundar no tipo `MiddlewareFn` ([referência](https://deno.land/x/grammy/mod.ts?s=MiddlewareFn)):

```ts
// Parâmetros de tipo omitidos novamente.
type MiddlewareFn = (ctx: Context, next: NextFunction) => MaybePromise<unknown>;
// sendo que
type NextFunction = () => Promise<void>;
```

Então, o middleware recebe dois parâmetros!
Até agora, só usamos um, o objeto de contexto `ctx`.
Nós [já sabemos](./context) o que `ctx` é, mas também vemos uma função com o nome `next`.
Para entender o que é `next`, temos que olhar para todos os middlewares que você instala no seu objeto bot como um todo.

Você pode ver todas as funções de middleware instaladas como um número de camadas que são empilhadas umas sobre as outras.
O primeiro middleware (`session` em nosso exemplo) é a camada mais alta, recebendo cada update primeiro.
Ele pode então decidir se deseja tratar o update ou passá-lo para a próxima camada (que trata o comando `/start`).
A função `next` pode ser usada para invocar o middleware subsequente, frequentemente chamado de _downstream middleware_.
Isso também significa que, se você não chamar `next` no seu middleware, as camadas subjacentes de middleware não serão invocadas.

Esta pilha de funções é a _pilha de middlewares_.

```asciiart:no-line-numbers
(ctx, next) => ...    |
(ctx, next) => ...    |—————middleware upstream de X
(ctx, next) => ...    |
(ctx, next) => ...       <— middleware X. Chame `next` para passar os updates para baixo
(ctx, next) => ...    |
(ctx, next) => ...    |—————middleware downstream de X
(ctx, next) => ...    |
```

Olhando para o nosso exemplo anterior, agora sabemos por que `bot.on(":photo")` nunca foi verificado: o middleware em `bot.on(":text", (ctx) => { ... })` já tratou o update e não chamou `next`.
Na verdade, nem especificou `next` como parâmetro.
Simplesmente ignorou `next`, portanto, não passou o update adiante.

Vamos experimentar outra coisa com nosso novo conhecimento!

```ts
const bot = new Bot("");

bot.on(":text", (ctx) => ctx.reply("Texto!"));
bot.command("start", (ctx) => ctx.reply("Commando!"));

bot.start();
```

Se você executar o bot acima e enviar `/start`, nunca verá uma resposta dizendo `Commando!`.
Vamos inspecionar o que acontece:

1. Você envia `"/start"` para o bot.
2. O middleware `":text"` recebe o update e verifica o texto, o que dá certo porque os comandos são mensagens de texto.
   O update é tratado imediatamente pelo primeiro middleware e seu bot responde com "Texto!".

A mensagem nem é verificada se contém o comando `/start`!
A ordem em que você registra seus middlewares importa, porque determina a ordem das camadas na pilha de middlewares.
Você pode corrigir o problema invertendo a ordem das linhas 3 e 4.
Se você chamasse `next` na linha 3, duas respostas seriam enviadas.

**A função `bot.use()` simplesmente registra middlewares que recebem todos os updates.**
É por isso que `session()` é instalado via `bot.use()`---queremos que o plugin opere em todos os updates, não importa quais dados estejam contidos.

Ter uma pilha de middlewares é uma propriedade extremamente poderosa de qualquer framework web, e esse padrão é amplamente popular (não apenas para bots do Telegram).

Vamos escrever nosso próprio pequeno middleware para ilustrar melhor como ele funciona.

## Escrevendo Middlewares Personalizados

Vamos ilustrar o conceito de middleware escrevendo uma função de middleware simples que mede o tempo de resposta do seu bot, ou seja, quanto tempo ele leva para tratar uma mensagem.

Aqui está a assinatura da função para nosso middleware.
Você pode compará-lo ao tipo de middleware acima e se convencer de que realmente temos um middleware aqui.

::: code-group

```ts [TypeScript]
/** Mede o tempo de resposta do bot e o registra no `console` */
async function responseTime(
  ctx: Context,
  next: NextFunction, // é um alias para: () => Promise<void>
): Promise<void> {
  // TODO: implementar
}
```

```js [JavaScript]
/** Measures the response time of the bot, and logs it to `console` */
/** Mede o tempo de resposta do bot e o registra no `console` */
async function responseTime(ctx, next) {
  // TODO: implementar
}
```

:::

Podemos instalá-lo em nossa instância `bot` com `bot.use()`:

```ts
bot.use(responseTime);
```

Vamos começar a implementá-lo.
Aqui está o que queremos fazer:

1. Assim que um update chegar, armazenamos `Date.now()` em uma variável.
2. Invocamos o middleware downstream, portanto, deixamos todo o tratamento de mensagens acontecer.
   Isso inclui a busca por comandos, respostas e tudo mais que seu bot faz.
3. Pegamos `Date.now()` novamente, comparamos com o valor antigo e chamamos `console.log` com a diferença de tempo.

É importante instalar nosso middleware `responseTime` _primeiro_ no bot (no topo da pilha de middlewares) para garantir que todas as operações sejam incluídas na medição.

::: code-group

```ts [TypeScript]
/** Mede o tempo de resposta do bot e o registra no `console` */
async function responseTime(
  ctx: Context,
  next: NextFunction, // é um alias alias para: () => Promise<void>
): Promise<void> {
  // obtém a hora antes
  const before = Date.now(); // millissegundos
  // invoca o middleware downstream
  await next(); // certifique-se de dar `await`!
  // obtém a hora depois
  const after = Date.now(); // millissegundos
  // registra a diferença
  console.log(`Tempo de resposta: ${after - before} ms`);
}

bot.use(responseTime);
```

```js [JavaScript]
/** Mede o tempo de resposta do bot e o registra no `console` */
async function responseTime(ctx, next) {
  // obtém a hora antes
  const before = Date.now(); // millisegundos
  // invoca o middleware downstream
  await next(); // certifique-se de dar `await`!
  // obtém a hora depois
  const after = Date.now(); // millissegundos
  // registra a diferença
  console.log(`Response time: ${after - before} ms`);
}

bot.use(responseTime);
```

:::

Completo e funciona! :heavy_check_mark:

Sinta-se à vontade para usar este middleware no seu objeto bot, registrar mais listeners e brincar com o exemplo.
Fazê-lo ajudará você a entender completamente o que é middleware.

::: danger PERIGO: Sempre certifique-se de dar await no next!
Se você chamar `next()` sem a palavra-chave `await`, várias coisas vão quebrar:

- :x: Sua pilha de middlewares será executada na ordem errada.
- :x: Você pode perder dados.
- :x: Algumas mensagens podem não ser enviadas.
- :x: Seu bot pode travar aleatoriamente de maneiras difíceis de reproduzir.
- :x: Se ocorrer um erro, seu tratamento de erros não será chamado para ele.
  Em vez disso, você verá que ocorrerá um `UnhandledPromiseRejectionWarning`, que pode travar o processo do seu bot.
- :x: O mecanismo de backpressure do [grammY runner](../plugins/runner) quebra, o que protege seu servidor de cargas excessivamente altas, como durante picos de carga.
- :skull: Às vezes, também mata todos os seus gatinhos inocentes. :crying_cat_face:

:::

A regra de que você deve usar `await` é especialmente importante para `next()`, mas na verdade se aplica a qualquer expressão em geral que retorna uma `Promise`.
Isso inclui `bot.api.sendMessage`, `ctx.reply` e todas as outras chamadas de rede.
Se o seu projeto é importante para você, então você usa ferramentas de linting que avisam se você esquecer de usar `await` em uma `Promise`.

::: tip Ative no-floating-promises
Considere usar o [ESLint](https://eslint.org/) e configure-o para usar a regra [no-floating-promises](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-floating-promises.md).
Isso garantirá que você nunca esqueça de usar `await` (gritando com você).
:::

## Propriedades de Middlewares no grammY

No grammY, middlewares podem retornar uma `Promise` (que será chamada com `await`), mas também pode ser síncrono.

Em contraste com outros sistemas de middleware (como o do `express`), você não pode passar valores de erro para `next`.
`next` não recebe nenhum argumento.
Se você quiser um erro, pode simplesmente dar `throw` no erro.
Outra diferença é que não importa quantos argumentos seu middleware recebe: `() => {}` será tratado exatamente como `(ctx) => {}`, ou como `(ctx, next) => {}`.

Existem dois tipos de middlewares: funções e objetos.
Objetos de middleware são simplesmente um invólucro para funções de middleware.
Eles são usados principalmente internamente, mas às vezes também podem ajudar bibliotecas de terceiros ou ser usados em casos de uso avançados, como com [Composer](https://deno.land/x/grammy/mod.ts?s=Composer):

```ts
const bot = new Bot("");

bot.use(/*...*/);
bot.use(/*...*/);

const composer = new Composer();
composer.use(/*...*/);
composer.use(/*...*/);
composer.use(/*...*/);
bot.use(composer); // composer é um objeto de middleware!

bot.use(/*...*/);
bot.use(/*...*/);
// ...
```

Se você quiser se aprofundar em como o grammY implementa middlewares, confira [Middleware Redux](../advanced/middleware) na seção avançada da documentação.
