# Tratamento de Erros

Cada um dos erros causados por seus middlewares será capturado pelo grammY.
Você deve instalar um tratamento de erro personalizado para lidar com os erros.

Mais importante, esta seção irá ensiná-lo [como capturar erros](#capturando-erros) que podem ser lançados.

Em seguida, veremos os três tipos de erros que seu bot pode encontrar.

| Nome                                   | Propósito                                                                                                            |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| [`BotError`](#o-objeto-boterror)       | Objeto de erro que envolve qualquer erro lançado em seus middlewares (por exemplo, os dois erros abaixo)             |
| [`GrammyError`](#o-objeto-grammyerror) | Lançado se o servidor da API do Bot retornar `ok: false`, indicando que sua solicitação de API foi inválida e falhou |
| [`HttpError`](#o-objeto-httperror)     | Lançado se o servidor da API do Bot não puder ser alcançado                                                          |

Um mecanismo de tratamento de erros mais avançado pode ser encontrado [aqui](#barreiras-de-erro).

## Capturando Erros

Como você captura erros dependerá da sua configuração.

### Long Polling

Se você executar seu bot via `bot.start()`, ou se estiver usando o [grammY runner](../plugins/runner), então você deve **instalar um tratamento de erro via `bot.catch`**.

O grammY tem um tratamento de erro padrão instalado que interrompe o bot se ele foi iniciado por `bot.start()`.
Em seguida, ele relança o erro.
O que acontece a seguir depende da plataforma.
É por isso que **você deve instalar um tratamento de erro via `bot.catch`**.

Exemplo:

```ts
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Erro ao tratar update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Erro na request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Não foi possível contactar o Telegram:", e);
  } else {
    console.error("Erro desconhecido:", e);
  }
});
```

### Webhooks

Se você executar seu bot via webhooks, o grammY passará o erro para o framework da web que você usa, por exemplo, o `express`.
Você deve lidar com erros de acordo com as convenções desse framework.

## O Objeto `BotError`

O objeto `BotError` agrupa um erro lançado com o objeto de contexto correspondente que levou o erro a ser lançado.
Isso funciona da seguinte forma.

Qualquer erro que ocorra durante o processamento de uma atualização será capturado pelo grammY para você.
Frequentemente é útil acessar o objeto de contexto que causou o erro.

O grammY não toca no erro lançado de forma alguma, mas o envolve em uma instância de `BotError`.
Dado que o objeto é nomeado `err`, você pode então acessar o erro original via `err.error`.
Você pode acessar o respectivo objeto de contexto via `err.ctx`.

Veja a classe `BotError` na [Referência de API do grammY](https://deno.land/x/grammy/mod.ts?s=BotError).

## O Objeto `GrammyError`

Se um método de API como `sendMessage` falhar, o grammY lançará um `GrammyError`.
Observe que as instâncias de `GrammyError` também serão envolvidas em objetos `BotError` se forem lançadas em middlewares.

Um `GrammyError` lançado indica que a solicitação de API correspondente falhou.
O erro fornece acesso ao código de erro retornado pelo backend do Telegram, bem como à descrição.

Veja a classe `GrammyError` na [Referência de API do grammY](https://deno.land/x/grammy/mod.ts?s=GrammyError).

## O Objeto `HttpError`

Um `HttpError` é lançado se uma solicitação de rede falhar.
Isso significa que o grammY não conseguiu entrar em contato com o servidor da Bot API.
O objeto de erro contém informações sobre o motivo da falha da solicitação, que estão disponíveis na propriedade `error`.

Você raramente verá esse tipo de erro, a menos que sua infraestrutura de rede seja instável ou o servidor da Bot API do seu bot esteja temporariamente offline.

> Observe que, se o servidor da Bot API puder ser contatado, mas retornar `ok: false` para uma determinada chamada de método, um [`GrammyError`](./errors#the-grammyerror-object) é lançado em vez disso.

Veja a classe `HttpError` na [Referência de API do grammY](https://deno.land/x/grammy/mod.ts?s=HttpError).

## Barreiras de Erro

> Este é um tópico avançado que é mais útil para bots maiores.
> Se você é relativamente novo no grammY, simplesmente ignore o restante desta seção.

Se você dividir sua base de código em diferentes partes, as _barreiras de erro_ permitem que você instale diferentes tratamentos de erro para diferentes partes de seus middlewares.
Elas conseguem isso permitindo que você cerque erros em uma parte do seu middleware.
Em outras palavras, se um erro for lançado em uma parte especialmente protegida do middleware, ele não poderá escapar dessa parte do sistema de middleware.
Em vez disso, um tratamento de erro dedicado é invocado e a parte cercada do middleware finge ser concluída com êxito.
Este é um recurso do sistema de middleware do grammY, portanto, as barreiras de erro não se importam se você está executando seu bot com webhooks ou long polling.

Opcionalmente, você pode optar por, em vez disso, permitir que a execução do middleware _resuma_ normalmente após o erro ser tratado, continuando logo após a barreira de erro.
Nesse caso, o middleware cercado não apenas age como se tivesse sido concluído com êxito, mas também passa o fluxo de controle para o próximo middleware que foi instalado após a barreira de erro.
Assim, parece que o middleware dentro da barreira de erro chamou `next`.

```ts
const bot = new Bot("");

bot.use(/* A */);
bot.use(/* B */);

const composer = new Composer();
composer.use(/* X */);
composer.use(/* Y */);
composer.use(/* Z */);
bot.errorBoundary(boundaryHandler /* , Q */).use(composer);

bot.use(/* C */);
bot.use(/* D */);

bot.catch(errorHandler);

function boundaryHandler(err: BotError, next: NextFunction) {
  console.error("Error in Q, X, Y, or Z!", err);
  /*
   * Você poderia chamar `next` se quiser executar
   * o middleware em C em caso de erro:
   */
  // await next()
}

function errorHandler(err: BotError) {
  console.error("Erro em A, B, C, ou D!", err);
}
```

No exemplo acima, o `boundaryHandler` será invocado para

1. todos os middlewares que são passados para `bot.errorBoundary` após `boundaryHandler` (ou seja, `Q`), e
2. todos os middlewares que são instalados em instâncias de composer subsequentemente instaladas (ou seja, `X`, `Y` e `Z`).

> Em relação ao ponto 2, você pode querer pular para a [explicação avançada](../advanced/middleware) de middlewares para aprender como o encadeamento funciona no grammY.

Você também pode aplicar uma barreira de erro a um composer sem chamar `bot.errorBoundary`:

```ts
const composer = new Composer();

const protected = composer.errorBoundary(boundaryHandler);
protected.use(/* B */);

bot.use(composer);
bot.use(/* C */);

bot.catch(errorHandler);

function boundaryHandler(err: BotError, next: NextFunction) {
  console.error("Erro em B!", err);
}

function errorHandler(err: BotError) {
  console.error("Erro em C!", err);
}
```

O `boundaryHandler` do exemplo acima será invocado para middlewares vinculados a `protected`.

Se você quiser ativamente que o erro atravesse uma barreira (ou seja, passe para fora), pode relançar o erro da sua função de tratamento de erro.
O erro será então passado para a próxima barreira.

De certa forma, você pode considerar o tratamento de erro instalado via `bot.catch` como a barreira de erro mais externa.
