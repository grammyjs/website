# Filter Queries e `bot.on()`

O primeiro argumento de `bot.on()` é uma string chamada _filter query_.

## Introdução

A maioria (todos?) dos outros frameworks de bot permitem que você realize uma forma primitiva de filtragem de atualizações, por exemplo, apenas `on("message")` e similares.

Em outros casos, a filtragem de mensagens é deixada para o desenvolvedor, o que frequentemente leva a intermináveis declarações `if` em seu código.

Por outro lado, **o grammY vem com sua própria linguagem de consulta** que você pode usar para **filtrar exatamente as mensagens** que deseja.

Isso permite que mais de 820 filtros diferentes sejam usados, e podemos adicionar mais com o tempo.
Cada filtro válido pode ser auto-completado em seu editor de código.
Portanto, você pode simplesmente digitar `bot.on("")`, abrir o auto-completar e pesquisar todas as consultas digitando algo.

![Pesquisa de Filter Query](/images/filter-query-search.png)

A inferência de tipo de `bot.on()` compreenderá a consulta de filtro que você escolheu.
Portanto, ele ajusta os tipos do contexto de acordo com o que é sabido que existe.

```ts
bot.on("message", async (ctx) => {
  // Pode ser undefined se a mensagem recebida não tiver texto.
  const text: string | undefined = ctx.msg.text;
});
bot.on("message:text", async (ctx) => {
  // O texto é sempre definido porque este handler é chamado quando uma mensagem de texto é recebida.
  const text: string = ctx.msg.text;
});
```

Em certo sentido, o grammY implementa as filter queries tanto em tempo de execução quanto no nível do tipo.

## Exemplos de Queries

Aqui estão algumas queries de exemplo:

### Queries Comuns

Filtros simples para updates e sub-filtros:

```ts
bot.on("message"); // chamado quando qualquer mensagem é recebida
bot.on("message:text"); // apenas mensagens de texto
bot.on("message:photo"); // apenas mensagens de foto
```

### Filtrando por Entidades

Sub-filtros que vão um nível mais profundo:

```ts
bot.on("message:entities:url"); // mensagens contendo uma URL
bot.on("message:entities:code"); // mensagens contendo um trecho de código
bot.on("edited_message:entities"); // mensagens editadas com qualquer tipo de entidade
```

### Omitindo Valores

Você pode omitir alguns valores nas filter queries.
O grammY pesquisará em diferentes valores para corresponder à sua query.

```ts
bot.on(":text"); // qualquer mensagem de texto e qualquer post de texto de canais
bot.on("message::url"); // mensagens com URL no texto ou legenda (fotos, etc)
bot.on("::email"); // mensagens ou posts de canal com email no texto ou legenda
```

Omitir o _primeiro_ valor filtra por mensagens e posts de canal.
[Lembre-se](./context#available-actions) que `ctx.msg` dá acesso a mensagens e posts de canal, o que for filtrado pela query.

Omitir o _segundo_ valor filtra por entidades e entidades de legenda.
Você pode omitir a primeira e a segunda parte ao mesmo tempo.

### Atalhos

O mecanismo de query do grammY permite definir atalhos que agrupam queries relacionadas.

#### `msg`

O atalho `msg` agrupa novas mensagens e novos posts de canal.
Em outras palavras, usar `msg` é equivalente a ouvir os eventos `"message"` e `"channel_post"`.

```ts
bot.on("msg"); // qualquer mensagem ou post de canal
bot.on("msg:text"); // exatamente o mesmo que `:text`
```

#### `edit`

O atalho `edit` agrupa mensagens editadas e posts de canal editados.
Em outras palavras, usar `edit` é equivalente a ouvir os eventos `"edited_message"` e `"edited_channel_post"`.

```ts
bot.on("edit"); // qualquer mensagem ou post de canal editado
bot.on("edit:text"); // edições de mensagens de texto
bot.on("edit::url"); // edições de mensagens com URL no texto ou legenda
bot.on("edit:location"); // localização ao vivo atualizada
```

#### `:media`

O atalho `:media` agrupa mensagens de foto e vídeo.
Em outras palavras, usar `:media` é equivalente a ouvir os eventos `":photo"` e `":video"`.

```ts
bot.on("message:media"); // mensagens de foto e vídeo
bot.on("edited_channel_post:media"); // posts de canal editados com mídia
bot.on(":media"); // mensagens de mídia ou posts de canal
```

#### `:file`

O atalho `:file` agrupa todas as mensagens que contêm um arquivo.
Em outras palavras, usar `:file` é equivalente a ouvir os eventos `":photo"`, `":animation"`, `":audio"`, `":document"`, `":video"`, `":video_note"`, `":voice"` e `":sticker"`.
Portanto, você pode ter certeza de que `await ctx.getFile()` lhe dará um objeto de arquivo.

```ts
bot.on(":file"); // arquivos em mensagens ou posts de canal
bot.on("edit:file"); // edições de mensagens de arquivo ou posts de canal de arquivo
```

### Açúcar Sintático

Existem dois casos especiais de fragmento de query que tornam a filtragem de usuários mais conveniente.
Você pode detectar bots em queries com o fragmento de query `:is_bot`.
O açúcar sintático `:me` pode ser usado para se referir ao seu bot de dentro de uma query, que irá comparar os identificadores de usuário para você.

```ts
// Uma mensagem de serviço sobre um bot que entrou no chat
bot.on("message:new_chat_members:is_bot");
// Uma mensagem de serviço sobre seu bot sendo removido
bot.on("message:left_chat_member:me");
```

Observe que, embora este açúcar sintático seja útil para trabalhar com mensagens de serviço, ele não deve ser usado para detectar se alguém realmente entra ou sai de um chat.
Mensagens de serviço são mensagens que informam os usuários no chat, e algumas delas não serão visíveis em todos os casos.
Por exemplo, em grupos grandes, não haverá mensagens de serviço sobre usuários que entram ou saem do chat.
Portanto, seu bot pode não perceber isso.
Em vez disso, você deve ouvir [updates de membros do chat](#chat-member-updates).

## Combinando Múltiplas Queries

Você pode combinar qualquer número de filter queries com operações AND e OR.

### Combinando com OR

Se você quiser instalar algum middleware por trás da concatenação OR de duas queries, você pode passar ambas para `bot.on()` em um array.

```ts
// Executa se o update for sobre uma mensagem OU uma edição de uma mensagem
bot.on(["message", "edited_message"] /* , ... */);
// Executa se uma hashtag OU email OU entidade de menção for encontrada no texto ou legenda
bot.on(["::hashtag", "::email", "::mention"] /* , ... */);
```

O middleware será executado se _qualquer uma das queries fornecidas_ corresponder.
A ordem das queries não importa.

### Combinando com AND

Se você quiser instalar algum middleware por trás da concatenação AND de duas queries, você pode encadear as chamadas para `bot.on()`.

```ts
// Matches forwarded URLs
bot.on("::url").on(":forward_date" /* , ... */);
// Filtra fotos que contêm uma hashtag na legenda de uma foto
bot.on(":photo").on("::hashtag" /* , ... */);
```

O middleware será executado se _todas as queries fornecidas_ corresponderem.
A ordem das queries não importa.

### Construindo Queries Complexas

Tecnicamente é possível combinar filter queries em fórmulas mais complicadas se elas estiverem em [FNC](https://pt.wikipedia.org/wiki/Forma_normal_conjuntiva), embora seja pouco provável que isso seja útil.

```ts
bot
  // Filtra todos os posts de canal ou mensagens encaminhadas ...
  .on(["channel_post", ":forward_date"])
  // ... que contêm texto ...
  .on(":text")
  // ... com pelo menos uma URL, hashtag ou cashtag.
  .on(["::url", "::hashtag", "::cashtag"] /* , ... */);
```

A inferência de tipo de `ctx` irá percorrer toda a cadeia de chamadas e inspecionar todos os elementos das três chamadas `.on`.
Como exemplo, é possível detectar que `ctx.msg.text` é uma propriedade necessária para o trecho de código acima.

## Dicas Úteis

Aqui estão alguns recursos menos conhecidos das filter queries que podem ser úteis.
Alguns deles são um pouco avançados, então sinta-se à vontade para passar para a [próxima seção](./commands).

### Updates de Membros do Chat

Você pode usar a seguinte filter query para receber atualizações de status sobre seu bot.

```ts
bot.on("my_chat_member"); // start, stop, join, ou leave
```

Em chats privados, são acionados quando o bot é iniciado ou parado.
Em grupos, são acionados quando o bot é adicionado ou removido.
Agora você pode inspecionar `ctx.myChatMember` para descobrir o que exatamente aconteceu.

Isso não deve ser confundido com

```ts
bot.on("chat_member");
```

que pode ser usado para detectar alterações de status de outros membros do chat, como quando as pessoas entram, são promovidas, e assim por diante.

> Observe que os updates `chat_member` precisam ser habilitados explicitamente especificando `allowed_updates` ao iniciar seu bot.

### Combinando Queries com Outros Métodos

Você pode combinar filter queries com outros métodos na classe `Composer` ([Referência de API](https://deno.land/x/grammy/mod.ts?s=Composer)), como `command` ou `filter`.
Isso permite padrões poderosos de manipulação de mensagens.

```ts
bot.on(":forward_date").command("help"); comandos /help encaminhados

// Apenas trata comandos em chats privados.
const pm = bot.chatType("private");
pm.command("start");
pm.command("help");
```

### Filtrando por Tipo de Remetente da Mensagem

Existem cinco tipos diferentes de autores de mensagens possíveis no Telegram:

1. Autores de posts de canal
2. Encaminhamentos automáticos de canais vinculados em grupos de discussão
3. Contas de usuário normais, isso inclui bots (ou seja, mensagens "normais")
4. Admins enviando em nome do grupo ([admins anônimos](https://telegram.org/blog/filters-anonymous-admins-comments#anonymous-group-admins))
5. Usuários enviando mensagens como um de seus canais

Você pode combinar filter queries com outros mecanismos de manipulação de atualizações para descobrir o tipo do autor da mensagem.

```ts
// Posts de canal enviados por `ctx.senderChat`
bot.on("channel_post");
// Encaminhamento automático do canal `ctx.senderChat`:
bot.on("message:is_automatic_forward");
// Mensagens normais enviadas por `ctx.from`
bot.on("message").filter((ctx) => ctx.senderChat === undefined);
// Admin anônimo em `ctx.chat`
bot.on("message").filter((ctx) => ctx.senderChat?.id === ctx.chat.id);
// Usuários enviando mensagens em nome de seu canal `ctx.senderChat`
bot.on("message").filter((ctx) =>
  ctx.senderChat !== undefined && ctx.senderChat.id !== ctx.chat.id
);
```

### Filtrando por Propriedades do Usuário

Se você quiser filtrar por outras propriedades de um usuário, precisará realizar uma request adicional, por exemplo, `await ctx.getAuthor()` para o autor da mensagem.
As filter queries não realizarão requests adicionais para você.
Ainda é simples realizar esse tipo de filtragem:

```ts
bot.on("message").filter(
  async (ctx) => {
    const user = await ctx.getAuthor();
    return user.status === "creator" || user.status === "administrator";
  },
  (ctx) => {
    // Trata mensagens de criadores e administradores.
  },
);
```

### Reutilizando a Lógica de Uma Filter Query

Internamente, o `bot.on` depende de uma função chamada `matchFilter`.
Ela recebe uma filter query e a compila para uma função de predicado.
O predicado é simplesmente passado para `bot.filter` para filtrar atualizações.

Você pode importar `matchFilter` diretamente se quiser usá-lo em sua própria lógica.
Por exemplo, você pode decidir descartar todas as atualizações que correspondem a uma determinada query:

```ts
// Descarta todas as mensagens de texto ou posts de text em canais.
bot.drop(matchFilter(":text"));
```

Analogamente, você pode fazer uso dos tipos de filter query que o grammY usa internamente:

### Reutilizando os Tipos de Filter Query

Internamente, `matchFilter` usa os [type predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) do TypeScript para ajustar o tipo de `ctx`.
Ela recebe um tipo `C extends Context` e um `Q extends FilterQuery` e produz `ctx is Filter<C, Q>`.
Em outras palavras, o tipo `Filter` é o que você realmente recebe como seu `ctx` no middleware.

Você pode importar `Filter` diretamente se quiser usá-lo em sua própria lógica.
Por exemplo, você pode decidir definir uma função de handler que trata objetos de contexto específicos que foram filtrados por uma filter query:

```ts
function handler(ctx: Filter<Context, ":text">) {
  // trata objeto de contexto ajustado
}

bot.on(":text", handler);
```

> Confira as referências de API para [`matchFilter`](https://deno.land/x/grammy/filter.ts?s=matchFilter), [`Filter`](https://deno.land/x/grammy/filter.ts?s=Filter) e [`FilterQuery`](https://deno.land/x/grammy/filter.ts?s=FilterQuery) para ler mais.

## A Linguagem de Query

> Esta seção é destinada a usuários que desejam ter um entendimento mais profundo das filter queries no grammY, mas não contém nenhum conhecimento necessário para criar um bot.

### Estrutura da Query

Toda query consiste em até três fragmentos de query.
Dependendo de quantos fragmentos de query uma query tem, diferenciamos entre queries L1, L2 e L3, como `"message"`, `"message:entities"` e `"message:entities:url"`, respectivamente.

Os fragmentos de query são separados por dois pontos (`:`).
Nos referimos ao fragmento anterior aos dois pontos ou ao final da string de query como _fragmento L1_ de uma query.
Nos referimos ao fragmento dos dois pontos ao segundo dois pontos ou ao final da string de query como _fragmento L2_ da query.
Nos referimos ao fragmento dos dois pontos ao final da string de query como _fragmento L3_ da query.

Exemplo:

| Filter Query                 | Fragmento L1   | Fragmento L2    | Fragmento L3   |
| ---------------------------- | ----------- | ------------ | ----------- |
| `"message"`                  | `"message"` | `undefined`  | `undefined` |
| `"message:entities"`         | `"message"` | `"entities"` | `undefined` |
| `"message:entities:mention"` | `"message"` | `"entities"` | `"mention"` |

### Validação da Query

Embora o sistema de tipos deva capturar todas as filter queries inválidas no momento da compilação, o grammY também verifica todas as filter queries passadas em tempo de execução durante a configuração.
Toda filter query passada é comparada com uma estrutura de validação que verifica se ela é válida.
Não apenas é bom falhar imediatamente durante a configuração em vez de em tempo de execução, mas também já aconteceu antes que bugs no TypeScript causem problemas sérios com o sofisticado sistema de inferência de tipo que alimenta as filter queries.
Se isso acontecer novamente no futuro, isso evitará problemas que poderiam ocorrer.
Nesse caso, você receberá mensagens de erro úteis.

### Performance

**o grammY consegue verificar cada filter query em tempo (amortizado) constante por update**, independente da estrutura da query ou do update recebido.

A validação das filter queries acontece apenas uma vez, quando o bot é inicializado e `bot.on()` é chamado.

Na inicialização, o grammY deriva uma função de predicado da filter query dividindo-a em seus fragmentos de query.
Cada fragmento será mapeado para uma função que executa uma única verificação `in`, ou duas verificações se o pedaço for omitido e dois valores precisarem ser verificados.
Essas funções são então combinadas para formar um predicado que só precisa verificar quantos valores forem relevantes para a query, sem iterar sobre as chaves do objeto `Update`.

Este sistema usa menos operações do que algumas bibliotecas concorrentes, que precisam realizar verificações de contenção em arrays ao rotear atualizações.
O sistema de filter query do grammY é muito mais poderoso.
