# Escalando I: Codebase Grande

Assim que seu bot crescer em complexidade, você vai enfrentar o desafio de como estruturar a codebase de seu app.
Naturalmente, você pode dividi-la em arquivos.

## Possível Solução

> O grammY ainda é bem jovem e não fornece nenhuma integração oficial com containers de DI ainda.
> Inscreva-se em [@grammyjs_news](https://t.me/grammyjs_news) para ser notificado assim que suportarmos isso.

Você é livre para estruturar seu código como quiser, e não há uma solução única.
Dito isso, uma estratégia direta e comprovada para estruturar seu código é a seguinte.

1. Agrupe as coisas que pertencem semanticamente juntas no mesmo arquivo (ou, dependendo do tamanho do código, diretório).
   Cada uma dessas partes expõe middlewares que tratarão as mensagens designadas.
2. Crie uma instância de bot centralmente que mescla todos os middlewares instalando-os no bot.
3. (Opcional.) Pré-filtre as atualizações centralmente e envie as atualizações apenas para o caminho correto.
   Você também pode querer conferir `bot.route` ([Referência de API](https://deno.land/x/grammy/mod.ts?s=Composer#method_route_0)) ou, alternativamente, o [plugin router](../plugins/router) para isso.

Um exemplo executável que implementa a estratégia acima pode ser encontrado no [repositório Example Bot](https://github.com/grammyjs/examples/tree/main/scaling)

## Exemplo de Estrutura

Para um bot muito simples que gerencia uma lista de tarefas, você pode imaginar esta estrutura.

```asciiart:no-line-numbers
src/
├── bot.ts
└── todo/
    ├── item.ts
    └── list.ts
```

`item.ts` apenas define algumas coisas sobre itens TODO, e essas partes de código são usadas em `list.ts`.

Em `list.ts`, você faria algo assim:

```ts
export const lists = new Composer();

// Registra alguns handlers aqui que tratam seu middleware da maneira usual.
lists.on("message", async (ctx) => {/* ... */});
```

> Observe que, se você usar o TypeScript, precisará passar seu [tipo de contexto personalizado](../guide/context#personalizando-o-objeto-de-contexto) ao criar o compositor.
> Por exemplo, você precisará usar `new Composer<MyContext>()`.

Opcionalmente, você pode usar um [error boundary](../guide/errors#error-boundaries) para lidar com todos os erros que acontecem dentro do seu módulo.

Agora, em `bot.ts`, você pode instalar este módulo assim:

```ts
import { lists } from "./todo/list";

const bot = new Bot("");

bot.use(lists);
// ... talvez mais módulos como `todo` aqui

bot.start();
```

Opcionalmente, você pode usar o [plugin router](../plugins/router) ou [`bot.route`](https://deno.land/x/grammy/mod.ts?s=Composer#method_route_0) para agrupar os diferentes módulos, se você puder determinar qual middleware é responsável com antecedência.

No entanto, lembre-se de que a maneira exata de estruturar seu bot é muito difícil de dizer genericamente.
Como sempre no software, faça de uma maneira que faça mais sentido :wink:

## Definições de Tipo para Middlewares Extraídos

A estrutura acima usando composers funciona bem.
No entanto, às vezes você pode se encontrar na situação em que deseja extrair um handler para uma função, em vez de criar um novo composer e adicionar a lógica a ele.
Isso requer que você adicione as definições de tipo de middleware corretas aos seus handlers, pois elas não podem mais ser inferidas pelo composer.

O grammY exporta definições de tipo para todos os **tipos específicos de middleware**, como o middleware que você pode passar para os handlers de comandos.
Além disso, ele exporta as definições de tipo para os **objetos de contexto específicos** que estão sendo usados ​​nesse middleware.
Ambos os tipos são parametrizados com seu [objeto de contexto personalizado](../guide/context#personalizando-o-objeto-de-contexto).
Portanto, um handler de comando teria o tipo `CommandMiddleware<MyContext>` e seu objeto de contexto `CommandContext<MyContext>`.
Eles podem ser usados ​​da seguinte forma.

::: code-group

```ts [Node.js]
import {
  type CallbackQueryMiddleware,
  type CommandContext,
  type NextFunction,
} from "grammy";

function commandMiddleware(ctx: CommandContext<MyContext>, next: NextFunction) {
  // tratamento de comando
}
const callbackQueryMiddleware: CallbackQueryMiddleware<MyContext> = (ctx) => {
  // tratamento de callback query
};

bot.command(["start", "help"], commandMiddleware);
bot.callbackQuery("query-data", callbackQueryMiddleware);
```

```ts [Deno]
import {
  type CallbackQueryMiddleware,
  type CommandContext,
  type NextFunction,
} from "https://deno.land/x/grammy/mod.ts";

function commandMiddleware(ctx: CommandContext<MyContext>, next: NextFunction) {
  // tratamento de comando
}
const callbackQueryMiddleware: CallbackQueryMiddleware<MyContext> = (ctx) => {
  // tratamento de callback query
};

bot.command(["start", "help"], commandMiddleware);
bot.callbackQuery("query-data", callbackQueryMiddleware);
```

:::

Confira a [referência de API de aliases de tipo](https://deno.land/x/grammy/mod.ts#Type_Aliases) para ver uma visão geral de todos os aliases de tipo que o grammY exporta.
