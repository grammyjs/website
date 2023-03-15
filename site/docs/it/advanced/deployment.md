---
prev: ./proxy.md
---

# Elenco di verifiche quando lo distribuisci

Lista di cose da tenere in mente quando vai a rilasciare un bot grande.

> Potresti essere interessato nelle nostre guide per ospitare un bot.
> Guarda **Ospitare / Guide** in cima alla pagina per vedere alcune delle piattaforme che hanno già guide dedicate.

## Errori

1. [Installa un gestore di errori con `bot.catch` (long polling) o sul tuo web framework (webhooks).](../guide/errors.md)
2. Usa `await` su tutte le promesse e installa **linting**, con regole che obbligato questo, così non ti dimentichi mai.

## Invio di Messaggi

1. Invia file per indirizzo o `Buffer` invece che come `Stream`,o almeno assicurato di [conoscere le trappole](./transformers.md#casi-duso-delle-funzioni-di-trasformazionie).
2. Usa `bot.on("callback_query:data")` come alternativa principale per [reagire a tutte le chiamate di ritorno](../plugins/keyboard.md#rispondere-ai-click).
3. Usa il [`transformer-throttler` plugin](../plugins/transformer-throttler.md) per prevenire di raggiungere i limiti.
4. **Opzionale.** Considera l'uso di [`auto-retry` plugin](../plugins/auto-retry.md) par automaticamente gestire gli errori di sovraccarico.

## Scalare

Questo dipende dal tipo di dispiegamento.

### Long Polling

1. [Usa grammY runner.](../plugins/runner.md)
2. [Usa `sequentialize` con lo stesso id di sessione del tuo middleware di sessione.](./scaling.md#la-concorrenza-e-difficile)
3. Revisiona le opzioni di configurazione di `run` ([riferimento alla API](https://deno.land/x/grammy_runner/mod.ts?s=run)) e assicurati di aggiustarlo alle tue necessità, o perfino considera la possibilità di creare il tuo esecutore a partire dal [sources](https://deno.land/x/grammy_runner/mod.ts?s=UpdateSource) e [sinks](https://deno.land/x/grammy_runner/mod.ts?s=UpdateSink).
   La cosa principale da considerare è il carico massimo che vuoi sostenere con il tuo serverm per esempio quanti aggiornamenti saranno processati nello stesso momento.
4. Considera di implementare uno [spegnimento grazioso](../advanced/reliability.md#spegnimento-grazioso) per spegnere il tuo bot quando vuoi terminaro (per esempio per passare ad una nuova versione).

### Webhooks

1. Assicurati di non realizzare nessuna operazione di lunga durata nel middleware, come il trasferimento di archivi di grandi dimensioni. [Questo porta a errori di tempo scaduto](../guide/deployment-types.md#terminare-le-richieste-dei-webhook-in-tempo) per i webhooks, e duplica il processamento degli aggiornamenti in quanto Telegram manderà nuovamente gli aggiornamenti non riconosciuti. Considera invece la possibilità di utilizzare un sistema di code di compiti.
2. Familiarizza con la configurazione di `webhookCallback` ([riferimento alla API](https://deno.land/x/grammy/mod.ts?s=webhookCallback)).
3. Se hai cambiato l' opzione `getSessionKey` per la tua sessione, [usa `sequentialize` con la stessa funzione di risoluzione della chiave di sessione che sul middleware di sessione](./scaling.md#la-concorrenza-e-difficile).
4. Se stai eseguendo su una piattaforma senza server o che scala automaticamente, [imposta le informazioni del bot](https://deno.land/x/grammy/mod.ts?s=BotConfig) per prevenire eccessive chiamate `getMe`.
5. Considera l' utilizzo delle [webhook replies](../guide/deployment-types.md#webhook-reply).

## Sesioni

1. Considera di usara `lazySessions` come spiegato [qui](../plugins/session.md#lazy-sessions).
2. Use l'opzione `storage` par configurare l'adattatore per lo storage, altrimenti tutti i dati verranno persi quando il processo del bot viene arrestato.

## Tests

Scrivi i test per il tuo bot. Questo si può fare con grammY in questo modo:

1. Simular las peticiones salientes de la API utilizando [funciones de transformación](./transformers.md).
2. Definisci e invia aggiornatimenti di esempio al tuo bot tramite `bot.handleUpdate` ([riferimento alla API](https://deno.land/x/grammy/mod.ts?s=Bot#method_handleUpdate_0)). Prendi ispirazione da [questi esempi](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates) forniti dagli sviluppatori di Telegram.

::: tip Contribuisci al framework di testing.

Anche se grammY fornisce gli uncini necessari per iniziare a scrivere tests, sarebbe molto utile avere un framework dedicato.
Questo è territorio ancora inesplorato, framework simili principalmente non esistono. Speriamo nel tuo contributo!

Un esempio di come i tests potrebbero essere fatti [può essere torvato qui](https://github.com/PavelPolyakov/grammy-with-tests).
:::
