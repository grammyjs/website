---
prev: ./proxy.md
---

# Elenco di verifiche quando lo distribuisci

Ecco una lista di cose da tenere in mente quando vai a ospitare un bot di grandi dimensioni.

> Potresti anche essere interessato nelle nostre guide per ospitare un bot.
> Dai un'occhiata a **Ospitare / Guide** in cima alla pagina per vedere alcune delle piattaforme che hanno già guide dedicate.

## Errori

1. [Inizializza un gestore di errori con `bot.catch` (long polling) o sulla tua struttura web (webhooks).](../guide/errors.md)
2. Usa `await` su tutte le promesse e usa il **linting**, con regole che lo obblighino, così non ti dimentichi mai.

## Invio di Messaggi

1. Invia file per indirizzo o `Buffer` invece che come `Stream`, o almeno assicurati di [conoscere i rischi](./transformers.md#casi-duso-delle-funzioni-di-trasformazionie).
2. Usa `bot.on("callback_query:data")` come alternativa principale per [rispondere a tutte le chiamate di ritorno](../plugins/keyboard.md#rispondere-ai-click).
3. Usa il [`transformer-throttler` plugin](../plugins/transformer-throttler.md) per prevenire il raggiungimento dei limiti.
4. **Opzionale.** Valuta l'uso di [`auto-retry` plugin](../plugins/auto-retry.md) per gestire automaticamente gli errori di sovraccarico.

## Scalare

Questo dipende dal modo in cui lo distribuisci.

### Long Polling

1. [Usa grammY runner.](../plugins/runner.md)
2. [Usa `sequentialize` con lo stesso id di sessione del tuo middleware di sessione.](./scaling.md#la-concorrenza-e-difficile)
3. Revisiona le opzioni di configurazione di `run` ([riferimento alla API](https://deno.land/x/grammy_runner/mod.ts?s=run)) e assicurati di adeguarlo alle tue necessità, o considera la possibilità di creare il tuo esecutore a partire da [sources](https://deno.land/x/grammy_runner/mod.ts?s=UpdateSource) e [sinks](https://deno.land/x/grammy_runner/mod.ts?s=UpdateSink).
   La cosa principale da considerare è il carico massimo che vuoi sostenere con il tuo serverm per esempio quanti aggiornamenti saranno processati nello stesso momento.
4. Considera di implementare uno [spegnimento graduale](../advanced/reliability.md#spegnimento-grazioso) per spegnere il tuo bot quando vuoi (per esempio per passare ad una nuova versione).

### Webhooks

1. Assicurati di non attuare nessuna operazione di lunga durata nel middleware, come il trasferimento di archivi di grandi dimensioni. [Questo porta a errori di tempo scaduto](../guide/deployment-types.md#terminare-le-richieste-dei-webhook-in-tempo) per i webhook, e duplica il processare degli aggiornamenti in quanto Telegram manderà nuovamente gli aggiornamenti a cui non si ha risposto velocemente. Considera invece la possibilità di utilizzare una coda di processi.
2. Familiarizza con la configurazione di `webhookCallback` ([riferimento alla API](https://deno.land/x/grammy/mod.ts?s=webhookCallback)).
3. Se hai modificato l' opzione `getSessionKey` per la tua sessione, [usa `sequentialize` con la stessa funzione di risoluzione della chiave di sessione del middleware di sessione](./scaling.md#la-concorrenza-e-difficile).
4. Se stai distribuendo su una piattaforma senza server o che scala automaticamente, [imposta le informazioni del bot](https://deno.land/x/grammy/mod.ts?s=BotConfig) per prevenire eccessive chiamate `getMe`.
5. Considera l' utilizzo delle [webhook replies](../guide/deployment-types.md#webhook-reply).

## Sesioni

1. Valuta l'uso di `lazySessions` come spiegato [qui](../plugins/session.md#lazy-sessions).
2. Use l'opzione `storage` per configurare l'adattatore dello storage, altrimenti tutti i dati verranno persi quando il processo del bot viene arrestato.

## Prove

Scrivi i test per il tuo bot. Questo si può fare con grammY in questo modo:

1. Simula le richieste API in uscita usando le [funzioni transfromer](./transformers.md).
2. Definisci e invia aggiornamenti di esempio al tuo bot tramite `bot.handleUpdate` ([riferimento alla API](https://deno.land/x/grammy/mod.ts?s=Bot#method_handleUpdate_0)). Prendi ispirazione da [questi esempi](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates) forniti dagli sviluppatori di Telegram.

::: tip Contribuisci al framework di testing.

Anche se grammY fornisce gli hook necessari per iniziare a scrivere test, sarebbe molto utile avere un framework dedicato.
Questo è territorio ancora inesplorato, framework simili principalmente non esistono. Speriamo nel tuo contributo!

Un esempio di come i test potrebbero essere fatti [può essere torvato qui](https://github.com/PavelPolyakov/grammy-with-tests).
:::
