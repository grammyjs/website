---
prev: ./scaling.md
next: ./flood.md
---

# Scalare III: Affidabilità

Se ti sei assicurato di avere una corretta [gestione degli errori](../guide/errors.md) per il tuo bot, sei essenzialmente a posto.
Tutti gli errori che potrebbero verificarsi (chiamate API fallite, richieste di rete fallite, query del database fallite, middleware falliti, ecc.) vengono tutti catturati.

Dovresti assicurarti di usare sempre `await` sulle promesse, o almeno chiamare `catch` su di esse se non vuoi mai aspettare cose con `await`.
Usa una regola di linting per assicurarti di non dimenticare questo.

## Arresto regolare

Per i bot che utilizzano il long polling, c'è un'altra cosa da considerare.
Poichè in qualche momento interromperai la tua istanza durante il funzionamento dovresti considerare la cattura degli eventi `SIGTERM` e `SIGINT` e chiamare `bot.stop` (integrato con il long polling) o arrestare il tuo bot tramite il suo [handle](https://deno.land/x/grammy_runner/mod.ts?s=RunnerHandle#prop_stop) (grammY runner):

### Long polling semplice

<CodeGroup>

<CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";

const bot = new Bot("");

// Arresto del bot quando il processo Node
// sta per essere terminato
process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

await bot.start();
```

</CodeGroupItem>

<CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");

const bot = new Bot("");

// Arresto del bot quando il processo Node
// sta per essere terminato
process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

await bot.start();
```

</CodeGroupItem>

<CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const bot = new Bot("");

// Arresto del bot quando il processo Node
// sta per essere terminato
Deno.addSignalListener("SIGINT", () => bot.stop());
Deno.addSignalListener("SIGTERM", () => bot.stop());

await bot.start();
```

</CodeGroupItem>
</CodeGroup>

### Utilizzare grammY runner

<CodeGroup>

<CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";
import { run } from "@grammyjs/runner";

const bot = new Bot("");

const runner = run(bot);

// Arresto del bot quando il processo Node
// sta per essere terminato
const stopRunner = () => runner.isRunning() && runner.stop();
process.once("SIGINT", stopRunner);
process.once("SIGTERM", stopRunner);
```

</CodeGroupItem>

<CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");
const { run } = require("@grammyjs/runner");

const bot = new Bot("");

const runner = run(bot);

// Arresto del bot quando il processo Node
// sta per essere terminato
const stopRunner = () => runner.isRunning() && runner.stop();
process.once("SIGINT", stopRunner);
process.once("SIGTERM", stopRunner);
```

</CodeGroupItem>
<CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { run } from "https://deno.land/x/grammy_runner/mod.ts";

const bot = new Bot("");

const runner = run(bot);

// Arresto del bot quando il processo Node
// sta per essere terminato
const stopRunner = () => runner.isRunning() && runner.stop();
Deno.addSignalListener("SIGINT", stopRunner);
Deno.addSignalListener("SIGTERM", stopRunner);
```

</CodeGroupItem>
</CodeGroup>

Questo è praticamente tutto ciò che c'è da sapere, la tua istanza ora non dovrebbe:registered: mai:tm: andare in errore.

## Garanzie di Affidabilità

Cosa succede se il tuo bot elabora transazioni finanziare e devi considere il caso [`kill -9`](https://stackoverflow.com/questions/43724467/what-is-the-difference-between-kill-and-kill-9) dove la CPU si rompe fisicamente o c'è un'interruzione di corrente nel data center?
Se per qualche motivo qualcuno o qualcosa uccide effettivamente il processo, diventa un po' più complicato.

In sostanza, i bot non possono garantire un'elaborazione _sempre unica_ del tuo middleware.
Leggi questa[discussione](https://github.com/tdlib/telegram-bot-api/issues/126) su GitHub per saperne di più sul **perchè** il tuo bot potrebbe inviare messaggi duplicato (o nessuno) in casi estremamente rari.
Il resto di questa sezione approfondisce invece su **come** grammY si comporti in questi casi insoliti e come gestirli.

> Ti interessa solo scrivere un bot Telegram? [Salta questa pagina.](./flood.md)

### Webhook

Se stai eseguendo il tuo bot su webhook, il server della Bot API riproverà a consegnare i nuovi messaggi al tuo bot se non risponde con `OK` in tempo.
Ciò definisce praticamente il comportamente del sistema in modo esauriente: se devi impedire l'elaborazione di aggiornamenti duplicati, dovresti creare la tua deduplicazione basata su `update_id`.
grammY non lo fa, ma sentiti libero di fare una PR se pensi che qualcun altro potrebbe trarne beneficio.

### Long Polling

Il long polling è più interessante.
Il polling incorporato ripete l'ultimo insieme di aggiornamenti ottenuti e non elaborati.

> Nota che se si ferma correttamente il bot con `bot.stop`, l'[offset dell'aggiornamento](https://core.telegram.org/bots/api#getting-updates) verrà sincronizzato con i server Telegram chiamando `getUpdates` con l'offset corretto ma senza elaborare i dati di ottenuti.

In altre parole, non perderai mai alcun nuovo dati, tuttavia può accadere che si ricalcoli fino a 100 aggiornamenti che hai già visto.
Poiché le chiamate a `sendMessage` non sono idempotenti, gli utenti potrebbero ricevere messaggi duplicati dal tuo bot.
Tuttavia, è garantita l'esecuzione _almeno una volta_.

### grammY Runner

Se si utilizza il [grammY runner](../plugins/runner.md) in modalità concorrente, la successiva chiamata a `getUpdates` viene potenzialmente eseguita prima che il middleware elabori il primo aggiornamento dell'isieme di dati attuale.
Pertanto, l'offset dell'aggiornamento viene [confermato](https://core.telegram.org/bots/api#getupdates) in modo prematuro.
Questo è il costo di un uso pesante della concorrenza e sfortunatamente non può essere evitato senza ridurre sia la capacità che la reattività.
Di conseguenza, se l'istanza viene terminata nel momento giusto (sbagliato), potrebbe accadere che fino a 100 aggiornamenti non possano essere recuperati perchè Telegram li considera confermati.
Questo porta alla perdita di dati.

Se è cruciale evitarlo, è necessario usare sources e sinks del pacchetto grammY runner per comporre la propria pipeline di aggiornamento che passi tutti gli aggiornamenti attraverso una coda di messaggi prima.

1. Fondamentalmente, dovresti creare un [sink](https://deno.land/x/grammy_runner/mod.ts?s=UpdateSink) che aggiunge alla coda e avviare un runner che fornisce solo la tua coda di messaggi.
2. Successivamente, dovresti creare una [source](https://deno.land/x/grammy_runner/mod.ts?s=UpdateSource) che recupera nuovamente dalla coda di messaggi i dati.
   In pratica, verranno eseguite due diverse istanze del grammY runner.

Questo processo generico descritto qua sopra è stato solo pensato e non implementato, per quanto ne sappiamo.
[Contatta il gruppo Telegram](https://t.me/grammyjs) se hai qualche domanda o provi ad implementarlo e puoi condividere il tuo progresso.

D'altra parte, se il tuo bot è sotto carico pesante e il polling di aggiornamento viene rallentato a cuasa dei [vincoli di carico automatici](../plugins/runner.md#sink), aumentano le probabilità che alcuni aggiornamenti verranno scaricati nuovamente, il che porta di nuovo a messaggi duplicati.
Pertanto, il prezzo della concorrenza completa è che né l'elaborazione _almeno una volta_ né quella _al massimo una volta_ possono essere garantite.
