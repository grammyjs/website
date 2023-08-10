# Enviando e Recebendo Mensagens

Assim que você inicia o seu bot com `bot.start()`, o grammY vai passar para os seus listeners as mensagens que os usuários enviam para o seu bot.
O grammY também fornece métodos para responder facilmente a essas mensagens.

## Recebendo Mensagens

A forma mais fácil de tratar mensagens é via

```ts
bot.on("message", async (ctx) => {
  const message = ctx.message; // o objeto da mensagem
});
```

Porém, existem várias outras opções também.

```ts
// Trata comandos, como /start.
bot.command("start", async (ctx) => {/* ... */});

// Compara a mensagem com uma string ou expressão regular
bot.hears(/echo *(.+)?/, async (ctx) => {/* ... */});
```

Você pode usar o auto-complete no seu editor de código pra ver todas as opções disponíveis, ou dar uma olhada em [todos os métodos](https://deno.land/x/grammy/mod.ts?s=Composer) da classe `Composer`.

> [Leia mais](./filter-queries) sobre como filtrar por tipos específicos de mensagem utilizando `bot.on()`.

## Enviando Mensagens

Todos os métodos que um bot pode usar (**[lista importante](https://core.telegram.org/bots/api#available-methods)**) estão disponíveis no objeto `bot.api`.

```ts
// Envia uma mensagem para o usuário 12345.
await bot.api.sendMessage(12345, "Oi!");
// Opcionalmente, você pode passar um objeto de opções.
await bot.api.sendMessage(12345, "Oi!", {/* mais opções */});
// Inspeciona o objeto da mensagem enviada
const message = await bot.api.sendMessage(12345, "Oi!");
console.log(message.message_id);

// Obtém informações sobre o bot em si.
const me = await bot.api.getMe();

// etc
```

Todo método aceita um objeto opcional do tipo `Other`, que permite que você defina mais opções para suas chamadas de API.
Esses objetos de opções correspondem exatamente às opções encontradas na lista de métodos acima.
Você também pode usar o auto-complete no seu editor de código para ver todas as opções disponíveis, ou dar uma olhada em [todos os métodos](https://deno.land/x/grammy/mod.ts?s=Api) da classe `Api`.
O resto desta página mostra alguns exemplos.

Além disso, veja a [próxima seção](./context) para aprender como o objeto de context de um listener faz o envio de mensagens se tornar molezinha!

## Enviando Mensagens Como Resposta

É possível utilizar a funcionalidade de resposta do telegram ao especificar o identificador da mensagem a ser respondida usando `reply_to_message_id`.

```ts
bot.hears("ping", async (ctx) => {
  // `reply` é um atalho para `sendMessage` no mesmo chat (veja a próxima sessão)
  await ctx.reply("pong", {
    // `reply_to_message_id` especifica a funcionalidade de resposta de fato.
    reply_to_message_id: ctx.msg.message_id,
  });
});
```

> Note que apenas enviar a mensagem através do `ctx.reply` **NÃO** significa que você está de fato respondendo a nada.
> Ao invés disso, você precisa especificar `reply_to_message_id` para que isso aconteça.
> A função `ctx.reply` é apenas um atalho para `ctx.api.sendMessage`, veja a [próxima seção](./context#available-actions)

## Enviando Mensagens Com Formatação

> Veja a [seção sobre opções de formatação](https://core.telegram.org/bots/api#formatting-options) na Referência da API de Bots do Telegram crida pelo time do Telegram.

Você pode enviar mensagens com texto em **negrito** ou _itálico_, usar URLs, e mais.
Existem duas formas de fazer isso, conforme descrito na [seção sobre opções de formatação](https://core.telegram.org/bots/api#formatting-options), que são Markdown e HTML.

### Markdown

> Veja também <https://core.telegram.org/bots/api#markdownv2-style>

Envie sua mensagem com texto em markdown, e especifique `parse_mode: "MarkdownV2"`.

```ts
await bot.api.sendMessage(
  12345,
  "*Oi\\!* _Boas vindas_ ao [grammY](https://grammy.dev)\\.",
  { parse_mode: "MarkdownV2" },
);
```

### HTML

> Veja também <https://core.telegram.org/bots/api#html-style>

Envie sua mensagem com HTML no texto, e especifique `parse_mode: "HTML"`.

```ts
await bot.api.sendMessage(
  12345,
  '<b>Oi!</b> <i>Boas vindas</i> ao <a href="https://grammy.dev">grammY</a>.',
  { parse_mode: "HTML" },
);
```

## Eviando Arquivos

O tratamento de arquivos é explicado com profundidade em uma [seção mais à frente](./files#sending-files).

## Forçando Resposta

> Possivelmente útil se seu bot está rodando no [modo de privacidade](https://core.telegram.org/bots/features#privacy-mode) em grupos.

Quando você envia uma mensagem, você pode fazer com que o cliente Telegram do usuário automaticamente especifique a mensagem como uma resposta.
Isso significa que o usuário vai responder automaticamente à mensagem do seu bot (a não ser que ele removam a resposta manualmente).
Como resultado, seu bot vai receber a mensagem do usuário mesmo quando estiver rodando no [modo de privacidade](https://core.telegram.org/bots/features#privacy-mode) em grupos.

Você pode forçar uma resposta assim:

```ts
bot.command("start", async (ctx) => {
  await ctx.reply("Só consigo ler mensagens que explicitamente me respondem!", {
    // Faz com que clientes Telegram automaticamente mostrem uma interface de resposta para o usuário.
    reply_markup: { force_reply: true },
  });
});
```
