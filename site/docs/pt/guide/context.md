# Contexto

O objeto `Contexto` ([Referência da API grammY](https://deno.land/x/grammy/mod.ts?s=Context)) é uma parte importante do grammY.

Sempre que você registra um listener no objeto do seu bot, esse listener receberá um objeto de contexto.

```ts
bot.on("message", async (ctx) => {
  // `ctx` é o objeto `Contexto`.
});
```

Você pode usar o objeto de contexto para

- [acessar informações sobre a mensagem](#informações-disponíveis)
- [realizar ações em resposta à mensagem](#ações-disponíveis).

Observe que os objetos de contexto são comumente chamados de `ctx`.

## Informações Disponíveis

Quando um usuário envia uma mensagem para o seu bot, você pode acessá-la através de `ctx.message`.
Como exemplo, para obter o texto da mensagem, você pode fazer o seguinte:

```ts
bot.on("message", async (ctx) => {
  // `txt` será uma `string` ao processar mensagens de texto.
  // Será `undefined` se a mensagem recebida não tiver nenhum texto de mensagem,
  // por exemplo, fotos, stickers e outras mensagens.
  const txt = ctx.message.text;
});
```

Da mesma forma, você pode acessar outras propriedades do objeto da mensagem, por exemplo, `ctx.message.chat` para informações sobre o chat onde a mensagem foi enviada.
Confira a [parte sobre `Mensagens` na Referência da API de Bots do Telegram](https://core.telegram.org/bots/api#message) para ver quais dados estão disponíveis.
Alternativamente, você pode simplesmente usar o recurso de autocompletar no seu editor de código para ver as opções possíveis.

Se você registrar o seu listener para outros tipos, `ctx` também vai te fornecer informações sobre eles.
Exemplo:

```ts
bot.on("edited_message", async (ctx) => {
  // Obtenha o novo texto editado da mensagem.
  const editedText = ctx.editedMessage.text;
});
```

Além disso, você pode obter acesso ao objeto de `Update` bruto ([Referência da API de Bots do Telegram](https://core.telegram.org/bots/api#update)) que o Telegram envia para o seu bot.
Este objeto de atualização (`ctx.update`) contém todos os dados que originam `ctx.message` e similares.

O objeto de contexto sempre contém informações sobre o seu bot, acessíveis através de `ctx.me`.

### Atalhos

Existem vários atalhos instalados no objeto de contexto.

| Atalho           | Descrição                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------ |
| `ctx.msg`        | Obtém o objeto da mensagem, inclusive as mensagens editadas                                |
| `ctx.chat`       | Obtém o objeto do chat                                                                     |
| `ctx.senderChat` | Obtém o objeto de chat do remetente de `ctx.msg` (para mensagens de canal/grupos anônimos) |
| `ctx.from`       | Obtém o autor da mensagem, callback query ou outras coisas                                 |

| `ctx.inlineMessageId` | Obtém o identificador da mensagem inline para callback queries ou resultados inline escolhidos |
| `ctx.entities` | Obtém as entidades da mensagem e seu texto, opcionalmente filtrados por tipo de entidade |

Em outras palavras, você também pode fazer isso:

```ts
bot.on("message", async (ctx) => {
  // Pega o texto da mensagem.
  const text = ctx.msg.text;
});

bot.on("edited_message", async (ctx) => {
  // Pega o novo texto editado da mensagem.
  const editedText = ctx.msg.text;
});

bot.on("message:entities", async (ctx) => {
  // Pega todas as entidades.
  const entities = ctx.entities();

  // Pega o texto da primeira entidade.
  entities[0].text;

  // Pega entidades de e-mail.
  const emails = ctx.entities("email");

  // Pega entidades de e-mail e telefone.
  const phonesAndEmails = ctx.entities(["email", "phone"]);
});
```

Ainda, se preferir, você pode ignorar `ctx.message`, `ctx.channelPost`, `ctx.editedMessage`, etc e simplesmente usar sempre `ctx.msg` no lugar.

## Sondagem via Verificações "Has"

O objeto de contexto tem alguns métodos que permitem sondar os dados contidos para coisas específicas.
Por exemplo, você pode chamar `ctx.hasCommand("start")` para ver se o objeto de contexto contém um comando `/start`.
É por isso que os métodos são coletivamente chamados de _verificações has_.

::: tip Saber Quando Usar Verificações "Has"

Essa é exatamente a mesma lógica usada por `bot.command("start")`.
Note que normalmente é melhor usar [filter queries](./filter-queries) e métodos similares.

Usar verificações "has" funciona melhor dentro do [plugin de conversas](../plugins/conversations).

:::

As verificações "has" reduzem corretamente o tipo de contexto.
Isso significa que verificar se um contexto tem dados de callback query dirá ao TypeScript que o contexto possui o campo `ctx.callbackQuery.data` presente.

```ts
if (ctx.hasCallbackQuery(/query-data-\d+/)) {
  // `ctx.callbackQuery.data` está presente aqui
  const data: string = ctx.callbackQuery.data;
}
```

O mesmo se aplica a todas as outras verificações "has".
Confira a [referência da API do objeto de contexto](https://deno.land/x/grammy/mod.ts?s=Context#method_has_0) para ver uma lista de todas as verificações "has".
Veja também a propriedade estática `Context.has` na [referência da API](https://deno.land/x/grammy/mod.ts?s=Context#Static_Properties) que permite criar funções de predicado eficientes para sondar muitos objetos de contexto.

## Ações Disponíveis

Se quiser responder a uma mensagem de um usuário, você poderia fazer assim:

```ts
bot.on("message", async (ctx) => {
  // Pega o identificador do chat.
  const chatId = ctx.msg.chat.id;
  // O texto para responder
  const text = "Recebi sua mensagem!";
  // Envia a resposta.
  await bot.api.sendMessage(chatId, text);
});
```

É possível notar duas coisas que não são ideais aqui:

1. Precisamos ter acesso ao objeto `bot`.
   Isso significa que temos que passar o objeto `bot` por todo o nosso código para poder responder, o que é chato quando você tem mais de um arquivo e define seu listener em algum outro lugar.
2. Precisamos pegar o identificador do chat do contexto e passá-lo explicitamente para `sendMessage` novamente.
   Isso também é chato, pois você provavelmente sempre quer responder ao mesmo usuário que enviou uma mensagem.
   Imagine quantas vezes você digitaria a mesma coisa repetidamente!

Em relação ao ponto 1, o objeto de contexto simplesmente fornece acesso ao mesmo objeto API que você encontra em `bot.api`, ele é chamado de `ctx.api`.
Agora você pode escrever `ctx.api.sendMessage` e não precisa mais passar o objeto `bot` por aí.
Fácil.

No entanto, a verdadeira vantagem é resolver o ponto 2.
O objeto de contexto permite que você simplesmente envie uma resposta assim:

```ts
bot.on("message", async (ctx) => {
  await ctx.reply("Recebi sua mensagem!");
});

// Ou, ainda mais curto:
bot.on("message", (ctx) => ctx.reply("Entendi!"));
```

Da hora! :tada:

Por baixo dos panos, o contexto _já conhece o identificador do chat_ (ou seja, `ctx.msg.chat.id`), então ele te dá o método `reply` para apenas enviar uma mensagem de volta para o mesmo chat.

Internamente, `reply` novamente chama `sendMessage` com o identificador do chat pré-preenchido para você.

Consequentemente, todos os métodos no objeto de contexto aceitam objetos de opções do tipo `Other` como explicado [anteriormente](./basics#enviando-mensagens).
Isso pode ser usado para passar mais configurações para cada chamada de API.

::: tip Funcionalidade de Resposta no Telegram
Mesmo que o método seja chamado de `ctx.reply` no grammY (e em muitos outros frameworks), ele não utiliza a [funcionalidade de resposta do Telegram](https://telegram.org/blog/replies-mentions-hashtags#replies), onde uma mensagem anterior é vinculada.

Se você verificar o que `sendMessage` pode fazer na [Referência da API de Bots do Telegram](https://core.telegram.org/bots/api#sendmessage), verá várias opções, como `parse_mode`, `disable_web_page_preview` e `reply_to_message_id`.
Este último pode ser usado para enviar uma mensagem como resposta:

```ts
await ctx.reply("^ Esta é uma mensagem!", {
  reply_to_message_id: ctx.msg.message_id,
});
```

O mesmo objeto de opções pode ser passado para `bot.api.sendMessage` e `ctx.api.sendMessage`.
Use o auto-completar para ver as opções disponíveis diretamente no seu editor de código.
:::

Naturalmente, todos os outros métodos em `ctx.api` têm atalhos com os valores pré-preenchidos corretos, como `ctx.replyWithPhoto` para responder com uma foto, ou `ctx.exportChatInviteLink` para obter um link de convite para o chat correspondente.

Se você deseja ter uma visão geral sobre quais atalhos existem, então o auto-completar é seu amigo, juntamente com a [Referência da API do grammY](https://deno.land/x/grammy/mod.ts?s=Context).

Note que você pode não querer reagir sempre no mesmo chat.

Nesse caso, você pode simplesmente recorrer ao uso dos métodos `ctx.api` e especificar todas as opções ao chamá-los.
Por exemplo, se você receber uma mensagem da Alice e quiser reagir enviando uma mensagem para o Bob, então você não pode usar `ctx.reply` porque sempre enviará mensagens para o chat com a Alice.

Em vez disso, chame `ctx.api.sendMessage` e especifique o identificador do chat do Bob.

## Como os Objetos de Contexto São Criados

Sempre que seu bot recebe uma nova mensagem do Telegram, ela é encapsulada em um objeto de atualização.
Na verdade, os objetos de atualização podem conter não apenas novas mensagens, mas também todos os tipos de coisas, como edições de mensagens, respostas a enquetes e [muito mais](https://core.telegram.org/bots/api#update).

Um novo objeto de contexto é criado exatamente uma vez para cada atualização recebida.
Contextos para diferentes atualizações são objetos completamente independentes, que apenas referenciam as mesmas informações do bot por meio de `ctx.me`.

O mesmo objeto de contexto para uma atualização será compartilhado por todos os middlewares instalados ([docs](./middleware)) no bot.

## Personalizando o Objeto de Contexto

> Se você está começando a entender os objetos de contexto, não precisa se preocupar com o restante desta página.

Você pode adicionar suas próprias propriedades ao objeto de contexto se desejar.

### Através de Middlewares (Recomendado)

As personalizações podem ser facilmente feitas nos [middlewares](./middleware).

::: tip Middlequê?
Esta seção requer uma compreensão de middlewares, então, caso você ainda não tenha pulado para esta [seção](./middleware), aqui está um resumo muito breve.

Tudo que você realmente precisa saber é que vários handlers podem processar o mesmo objeto de contexto.
Existem handlers especiais que podem modificar `ctx` antes que qualquer outro handler seja executado, e as modificações do primeiro handler serão visíveis para todos os handlers subsequentes.
:::

A ideia é instalar middlewares antes de registrar outros listeners.
Você pode então definir as propriedades que deseja dentro desses middlewares.
Se você fizer `ctx.nomeDaSuaPropriedadePersonalizada = seuValorPersonalizado` dentro de um handler, a propriedade `ctx.nomeDaSuaPropriedadePersonalizada` estará disponível nos handlers restantes também.

Para fins de ilustração, vamos supor que você queira definir uma propriedade chamada `ctx.config` no objeto de contexto.
Neste exemplo, vamos usá-lo para armazenar alguma configuração sobre o projeto para que todos os handlers tenham acesso a ela.
A configuração tornará mais fácil detectar se o bot está sendo usado por seu desenvolvedor ou por usuários regulares.

Logo após criar seu bot, faça o seguinte:

```ts
const BOT_DEVELOPER = 123456; // identificador do chat do desenvolvedor do bot

bot.use(async (ctx, next) => {
  // Modifique o objeto de contexto aqui definindo a configuração.
  ctx.config = {
    botDeveloper: BOT_DEVELOPER,
    isDeveloper: ctx.from?.id === BOT_DEVELOPER,
  };
  // Execute os handlers restantes.
  await next();
});
```

Depois disso, você pode usar `ctx.config` nos handlers restantes.

```ts
bot.command("start", async (ctx) => {
  // Trabalhe com o contexto modificado aqui!
  if (ctx.config.isDeveloper) await ctx.reply("Oi, mamãe!! <3");
  else await ctx.reply("Boas vindas, ser humano!");
});
```

Entretanto, você perceberá que o TypeScript não sabe que `ctx.config` está disponível, mesmo que estejamos atribuindo a propriedade corretamente.
Enquanto o código funcionará em tempo de execução, ele não compilará.
Para corrigir isso, precisamos ajustar o tipo do contexto e adicionar a propriedade.

```ts
interface ConfigBot {
  botDeveloper: number;
  isDeveloper: boolean;
}

type MyContext = Context & {
  config: ConfigBot;
};
```

O novo tipo `MyContext` descreve de forma precisa os objetos de contexto que nosso bot está realmente manipulando.

> Você precisará garantir que mantenha os tipos sincronizados com as propriedades que você inicializa.

Podemos usar o novo tipo passando-o para o construtor `Bot`.

```ts
const bot = new Bot<MyContext>("");
```

Resumidamente, a configuração ficará assim:

::: code-group

```ts [TypeScript]
const BOT_DEVELOPER = 123456; // identificador do chat do desenvolvedor do bot

// Defina um tipo de contexto personalizado.
interface BotConfig {
  botDeveloper: number;
  isDeveloper: boolean;
}
type MyContext = Context & {
  config: BotConfig;
};

const bot = new Bot<MyContext>("");

// Defina propriedades personalizadas nos objetos de contexto.
bot.use(async (ctx, next) => {
  ctx.config = {
    botDeveloper: BOT_DEVELOPER,
    isDeveloper: ctx.from?.id === BOT_DEVELOPER,
  };
  await next();
});

// Defina handlers para objetos de contexto personalizados.
bot.command("start", async (ctx) => {
  if (ctx.config.isDeveloper) await ctx.reply("Oi, mamãe!");
  else await ctx.reply("Bem-vindo");
});
```

```js [JavaScript]
const BOT_DEVELOPER = 123456; // identificador do chat do desenvolvedor do bot

const bot = new Bot("");

// Defina propriedades personalizadas nos objetos de contexto.
bot.use(async (ctx, next) => {
  ctx.config = {
    botDeveloper: BOT_DEVELOPER,
    isDeveloper: ctx.from?.id === BOT_DEVELOPER,
  };
  await next();
});

// Defina handlers para objetos de contexto personalizados.
bot.command("start", async (ctx) => {
  if (ctx.config.isDeveloper) await ctx.reply("Oi mãe!");
  else await ctx.reply("Bem-vindo");
});
```

:::

Naturalmente, o tipo de contexto personalizado também pode ser passado para outras coisas que lidam com middlewares, como [compositores](https://deno.land/x/grammy/mod.ts?s=Composer).

```ts
const composer = new Composer<MeuContexto>();
```

Alguns plugins também exigirão que você passe um tipo de contexto personalizado, como o plugin [router](../plugins/router) ou o plugin [menu](../plugins/menu).
Confira a documentação deles para ver como eles podem usar um tipo de contexto personalizado.
Esses tipos são chamados de sabores de contexto, como descrito [aqui embaixo](#sabores-de-contexto).

### Por Meio de Herança

Além de definir propriedades personalizadas no objeto de contexto, você pode criar uma subclasse da classe `Context`.

```ts
class MyContext extends Context {
  // etc
}
```

No entanto, recomendamos que você personalize o objeto de contexto [por meio de middlewares](#por-meio-de-middlewares-recomendado) porque isso é muito mais flexível e funciona muito melhor se você quiser instalar plugins.

Agora vamos ver como usar classes personalizadas para objetos de contexto.

Ao construir seu bot, você pode passar um construtor de contexto personalizado que será usado para instanciar os objetos de contexto.
Observe que sua classe deve estender `Context`.

::: code-group

```ts [TypeScript]
import { Bot, Context } from "grammy";
import type { Update, UserFromGetMe } from "grammy/types";

// Defina uma classe de contexto personalizada.
class MyContext extends Context {
  // Defina algumas propriedades personalizadas.
  public readonly customProperty: number;

  constructor(update: Update, api: Api, me: UserFromGetMe) {
    super(update, api, me);
    this.customProperty = me.username.length * 42;
  }
}

// Passe o construtor da classe de contexto personalizada como opção.
const bot = new Bot("", {
  ContextConstructor: MyContext,
});

bot.on("message", async (ctx) => {
  // `ctx` agora é do tipo `MyContext`.
  const prop = ctx.customProperty;
});

bot.start();
```

```js [JavaScript]
const { Bot, Context } = require("grammy");

// Defina uma classe de contexto personalizada.
class MyContext extends Context {
  // Defina algumas propriedades personalizadas.
  constructor(update, api, me) {
    super(update, api, me);
    this.customProperty = me.username.length * 42;
  }
}

// Passe o construtor da classe de contexto personalizada como opção.
const bot = new Bot("", {
  ContextConstructor: MyContext,
});

bot.on("message", async (ctx) => {
  // `ctx` agora é do tipo `MyContext`.
  const prop = ctx.customProperty;
});

bot.start();
```

```ts [Deno]
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import type {
  Update,
  UserFromGetMe,
} from "https://deno.land/x/grammy/types.ts";

// Defina uma classe de contexto personalizada.
class MyContext extends Context {
  // Defina algumas propriedades personalizadas.
  public readonly customProperty: number;

  constructor(update: Update, api: Api, me: UserFromGetMe) {
    super(update, api, me);
    this.customProperty = me.username.length * 42;
  }
}

// Passe o construtor da classe de contexto personalizada como opção.
const bot = new Bot("", {
  ContextConstructor: MyContext,
});

bot.on("message", async (ctx) => {
  // `ctx` agora é do tipo `MyContext`.
  const prop = ctx.customProperty;
});

bot.start();
```

:::

Note como o tipo de contexto personalizado será inferido automaticamente quando você estiver usando uma subclasse.
Você não precisa mais escrever `Bot<MyContext>` porque você já especificou o construtor da sua subclasse no objeto de opções de `new Bot()`.

No entanto, isso torna muito difícil (se não impossível) instalar plugins, já que frequentemente eles exigem que você instale os sabores de contexto.

## Sabores de Contexto

Os sabores de contexto são uma maneira de informar ao TypeScript sobre novas propriedades no seu objeto de contexto.
Essas novas propriedades podem ser incluídas em plugins ou outros módulos e então instaladas no seu bot.

Os sabores de contexto também têm a capacidade de transformar os tipos de propriedades existentes usando procedimentos automáticos definidos por plugins.

### Sabores de Contexto Aditivos

Como implícito acima, existem dois tipos diferentes de sabores de contexto.
O básico é chamado de _sabor de contexto aditivo_, e sempre que falamos sobre sabores de contexto, nos referimos a essa forma básica.
Vamos ver como isso funciona.

Como exemplo, quando você possui [dados de sessão](../plugins/session), você deve registrar `ctx.session` no tipo de contexto.
Caso contrário,

1. você não pode instalar o plugin de sessões integrado e
2. você não tem acesso a `ctx.session` nos seus ouvintes.

> Mesmo que usemos sessões como exemplo aqui, coisas semelhantes se aplicam a muitas outras coisas.
> Na verdade, a maioria dos plugins fornecerá um sabor de contexto que você precisa usar.

Um sabor de contexto é simplesmente um novo tipo pequeno que define as propriedades que devem ser adicionadas ao tipo de contexto.
Vamos ver um exemplo de um sabor.

```ts
interface SessionFlavor<S> {
  session: S;
}
```

O tipo `SessionFlavor` ([Referência da API](https://deno.land/x/grammy/mod.ts?s=SessionFlavor)) é direto: ele define apenas a propriedade `session`.
Ele recebe um parâmetro de tipo que irá definir a estrutura real dos dados da sessão.

Como isso é útil?
Desta forma, você pode adicionar um sabor de dados de sessão ao seu contexto:

```ts
import { Context, SessionFlavor } from "grammy";

// Declare `ctx.session` como sendo do tipo `string`.
type MyContext = Context & SessionFlavor<string>;
```

Agora você pode usar o plugin de sessão e tem acesso a `ctx.session`:

```ts
bot.on("message", async (ctx) => {
  // Agora `str` está do tipo `string`.
  const str = ctx.session;
});
```

### Sabores de Contexto Transformadores

O outro tipo de sabor de contexto é mais poderoso.
Em vez de serem instalados com o operador `&`, eles precisam ser instalados assim:

```ts
import { Context } from "grammy";
import { SomeFlavorA } from "meu-plugin";

type MyContext = SomeFlavorA<Context>;
```

Todo o resto funciona da mesma forma.

Cada plugin (oficial) especifica em sua documentação se deve ser usado através de um sabor de contexto aditivo ou transformador.

### Combinando Diferentes Sabores de Contexto

Se você possui diferentes [sabores de contexto aditivos](#sabores-de-contexto-aditivos), você pode apenas instalá-los assim:

```ts
type MyContext = Context & FlavorA & FlavorB & FlavorC;
```

A ordem dos sabores de contexto não importa, você pode combiná-los em qualquer ordem que preferir.

Múltiplos [sabores de contexto transformadores](#sabores-de-contexto-transformadores) também podem ser combinados:

```ts
type MyContext = FlavorX<FlavorY<FlavorZ<Context>>>;
```

Aqui, a ordem pode ser importante, pois `FlavorZ` transforma `Context` primeiro, depois `FlavorY`, e o resultado disso será transformado novamente por `FlavorX`.

Você até mesmo pode misturar sabores aditivos e transformadores:

```ts
type MyContext = SaborX<
  FlavorY<
    FlavorZ<
      Context & FlavorA & FlavorB & FlavorC
    >
  >
>;
```

Certifique-se de seguir esse padrão ao instalar vários plugins.
Existem diversos erros de tipo que surgem de combinações incorretas de sabores de contexto.
