# Jogos

## Introdução

Os Jogos do Telegram são uma funcionalidade muito interessante e é muito divertido brincar com eles.
O que você pode fazer com eles?
A resposta é qualquer coisa, qualquer jogo HTML5 que você tenha desenvolvido você pode fornecer aos usuários do Telegram com a ajuda dessa funcionalidade.
(Sim, isso significa que você terá que desenvolver um jogo baseado em website que seja publicamente acessível na internet antes de poder integrá-lo ao seu bot do Telegram.)

## Configurando um Jogo Com Seu Bot via @BotFather

Para simplicidade, vamos assumir que a essa altura você deve ter configurado um bot e um jogo associado ao seu bot no [@BotFather](https://t.me/BotFather).
Se você ainda não fez isso, confira este [artigo](https://core.telegram.org/bots/games) do time do Telegram.

> Nota: Nós aprenderemos apenas o desenvolvimento do lado do bot.
> Desenvolver o jogo é inteiramente por conta do desenvolvedor.
> Tudo o que precisamos aqui é um link do jogo HTML5 hospedado na internet.

## Enviando o Jogo via um Bot

Podemos enviar o jogo no grammY via o método `replyWithGame` que recebe o nome do jogo que você criou com o BotFather como argumento.
Alternativamente, nós também podemos usar o método `api.sendGame` (o grammY fornece todos os métodos oficiais da [Bot API](https://core.telegram.org/bots/api)).
Uma vantagem de usar o método `api.sendGame` é que você pode especificar o `chat.id` de um usuário específico para enviá-lo.

1. Enviando o Jogo via `replyWithGame`

   ```ts
   // Usaremos o comando start para invocar o método de resposta do jogo.
   bot.command("start", async (ctx) => {
     // Passe o nome do jogo que você criou no BotFather, por exemplo "meu_jogo".
     await ctx.replyWithGame("meu_jogo");
   });
   ```

2. Enviando um Jogo via `api.sendGame`

   ```ts
   bot.command("start", async (ctx) => {
     // Você pode obter o identificador do chat do usuário para enviar seu jogo com `ctx.from.id`.
     // que te dá o identificador do chat do usuário que invocou o comando start.
     const chatId = ctx.from.id;
     await ctx.api.sendGame(chatId, "meu_jogo");
   });
   ```

> [Lembre-se](./basics#enviando-mensagens) que você pode especificar mais opções ao enviar mensagens usando o objeto de opções do tipo `Other`.

Você também pode especificar um [teclado inline](../plugins/keyboard#teclados-inline) personalizado para o jogo mostrar botões.
Por padrão, ele será enviado com um botão com o nome `Jogar meu_jogo`, onde _meu_jogo_ é o nome do seu jogo.

```ts
// Define um novo teclado inline. Você pode escrever qualquer texto para ser mostrado
// no botão, mas certifique-se de que o primeiro botão seja sempre
// o botão de jogar!

const keyboard = new InlineKeyboard().game("Iniciar meu_jogo");

// Note que nós usamos game() diferente de um teclado inline normal
// onde nós usamos url() ou text()

// Via o método `replyWithGame`
await ctx.replyWithGame("meu_jogo", { reply_markup: keyboard });

// Via o método `api.sendGame`
await ctx.api.sendGame(chatId, "meu_jogo", { reply_markup: keyboard });
```

## Ouvindo o Callback do Nosso Botão de Jogo

Para fornecer lógica ao botão quando ele é pressionado, e para redirecionar nossos usuários para nosso jogo e muitos outros, nós ouvimos o evento `callback_query:game_short_name` que nos diz que um botão de jogo foi pressionado pelo usuário.
Tudo o que precisamos fazer é:

```ts
// Passe a url do seu jogo que deve estar hospedado na web aqui.

bot.on("callback_query:game_short_name", async (ctx) => {
  await ctx.answerCallbackQuery({ url: "url_do_seu_jogo" });
});
```

---

### Nosso Código Final Deve Parecer Algo Assim

```ts
bot.on("callback_query:game_short_name", async (ctx) => {
  await ctx.answerCallbackQuery({ url: "url_do_seu_jogo" });
});

bot.command("start", async (ctx) => {
  await ctx.replyWithGame("meu_jogo", {
    reply_markup: keyboard,
    // Ou você pode usar o método api aqui, de acordo com suas necessidades.
  });
});
```

> Lembre-se de adicionar um [tratamento de erros](./errors) adequado ao seu bot antes de ir ao ar.

Nós podemos estender este artigo no futuro com seções avançadas adicionais e perguntas frequentes, mas isso já é tudo o que você precisa para iniciar seu jogo no Telegram.
Divirta-se jogando! :space_invader:
