---
prev: ./middleware.md
next: ./scaling.md
---

# Scalare I: Codebase Grandi

Non appena il tuo bot cresce in complessità, ti troverai di fronte alla sfida di come strutturare la codebase dell'applicazione.
Naturalmente, puoi suddivederla in file.

## Una Possibile Soluzione

> grammY è ancora piuttosto giovane e non fornisce ancora integrazioni ufficiali con i container DI.
> Iscriviti a [@grammyjs_news](https://t.me/grammyjs_news) per essere informato non appena forniamo il supporto.

Sei libero di strutturare il tuo codice come preferisci e non esiste una soluzione universale.
Detto ciò, una strategia semplice e collaudata per strutturare il codice è la seguente.

1. Raggruppa le cose che appartengono semanticamente insieme nello stesso file (o, a seconda della dimensione del codice, cartelle).
   Ogni parte espone un middleware che gestirà i messaggi designati.
2. Crea un'istanza di bot in modo centrale che unisca tutti i middleware installandoli sul bot.
3. (Opzionale.) Filtra in modo centrale gli aggiornamenti e invia solo quelli di interesse nelle varie parti.
   Ti potrebbe interessare `bot.route` ([API Reference](https://deno.land/x/grammy/mod.ts?s=Composer#method_route_0)) o, in alternativa, il [router plugin](../plugins/router.md).

Un esempio eseguibile che implementa la strategia sopra descritta si trova nel [Repository degli esempi del bot](https://github.com/grammyjs/examples/tree/main/scaling).

## Struttura di Esempio

Per un bot molto semplice che gestisce una lista TODO, potresti immaginare questa struttura.

```asciiart:no-line-numbers
src/
├── bot.ts
└── todo/
    ├── item.ts
    └── list.ts
```

`item.ts` definisce solo alcune cose relative agli elementi TODO, e queste parti di codice vengono utilizzate in `list.ts`.

In `list.ts`, farest qualcosa del genere:

```ts
export const lists = new Composer();

// Registra alcuni gestori qui che gestiranno il tuo middleware nel solito modo.
lists.on("message", (ctx) => {/* ... */});
```

> Nota che se usi TypeScript devi passare il [tipo di contesto personalizzato](../guide/context.md#customizing-the-context-object) quando crei il composer.
> Ad esempio, dovrai usare `new Composer<MyContext()>`.

Facoltativamente, puoi utilizzare un [errore di confine](../guide/errors.md#error-boundaries) per gestire tutti gli errori che si verificano all'interno del tuo modulo.

Ora, in `bot.ts`, puoi installare questo modulo in questo modo:

```ts
import { lists } from "./todo/list";

const bot = new Bot("");

bot.use(lists);
// ... magari altri moduli come `todo` qui

bot.start();
```

Opzionalmente, puoi utilizzare il [router plugin](../plugins/router.md) o [`bot.route`](https://deno.land/x/grammy/mod.ts?s=Composer#method_route_0) per raggruppare i diversi moduli, se sei in grado di determinare quale middleware è responsabile in anticipo.

Tuttavia, ricorda che è molto difficile dire in modo generico il modo esatto di strutturare il bot.
Come sempre nel software, fallo in modo che abbia senso :wink:

## Definizioni di tipo per il middleware estratto

La struttura sopra utilizzando i composer funziona bene.
Tuttavia, a volte ti troverai nella situazione in cui vuoi estrarre un handler in una funziona, invece di creare un nuovo composer e aggiugnere la logica ad esso.
Ciò richiede di aggiungere le definizioni dei tipi di middleware corretti ai tuoi gestori perchè non possono più essere inferiti attraverso il composer.

grammY esporta le definizioni dei tipi per tutti i **tipi ristretti del middleware**, come il middleware che puoi passare ai gestori dei comandi.
Inoltre, esporta le definizioni dei tipo per gli **oggetti dal contesto ristretto** che vengon outilizzati in quel middleware.
Entrambi i tipi sono parametrizzati con il tuo [oggetto di contesto personalizzato](../guide/context.md#customizing-the-context-object).
Pertanto, un gestore di comando avrebbe il tipo `CommandMiddleware<MyContext>` e il suo oggetto di contesto `CommandContext<MyContext>`.
Possono essere utilizzati come segue.

<CodeGroup>
  <CodeGroupItem title="Node.js" active>

```ts
import {
  type CallbackQueryMiddleware,
  type CommandContext,
  type NextFunction,
} from "grammy";

function commandMiddleware(ctx: CommandContext<MyContext>, next: NextFunction) {
  // gestione del comando
}
const callbackQueryMiddleware: CallbackQueryMiddleware<MyContext> = (ctx) => {
  // gestione della callback query
};

bot.command(["start", "help"], commandMiddleware);
bot.callbackQuery("query-data", callbackQueryMiddleware);
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import {
  type CallbackQueryMiddleware,
  type CommandContext,
  type NextFunction,
} from "https://deno.land/x/grammy/mod.ts";

function commandMiddleware(ctx: CommandContext<MyContext>, next: NextFunction) {
  // gestione del comando
}
const callbackQueryMiddleware: CallbackQueryMiddleware<MyContext> = (ctx) => {
  // gestione della callback query
};

bot.command(["start", "help"], commandMiddleware);
bot.callbackQuery("query-data", callbackQueryMiddleware);
```

</CodeGroupItem>
</CodeGroup>

Consulta il [riferimento dell'API degli alias di tipo](https://deno.land/x/grammy/mod.ts#Type_Aliases) per vedere una panoramica di tutti gli alias di tipo che grammY esporta.

