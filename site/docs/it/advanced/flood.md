---
prev: ./reliability.md
next: ./transformers.md
---

# Scalare IV: Limiti

Telegram restringe quanti messaggi il tuo bot possa inviare al secondo, scopri di più nelle [Bot FAQ](https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this).
Assicurati sempre di stare sotto qeusti limiti, altrimenti il tuo bot verrà limitato.
Se ingori questi erriri, il tuo bot potrebbe venir bandito.

## La soluzione semplcie

:::warning Non una soluzione reale
Questa sezione può risolverti il problema nel breve termine, ma se stai creando un bot che deve realmente scalare bene, leggi la [prossima sottosezione](#la-solución-real-recomendada) invece.
:::

C'è una soluzione molto semplice per il raggiungimento dei limiti di richieste: se una richiesta API fallisce a cuasa di questi limiti, attendi il tempo che Telegram ti dice di attenere, e ripeti la richeista.

Se vuoi fare questo, puoi utilizzare il [semplicissimo plugin `auto-retry`](../plugins/auto-retry.md).
È una [funzione di trasformazione della API](../advanced/transformers.md) che fa esattamente quello.

Tuttavia, se il traffico del tuo bot aumenta rapidamente, per esempio, quando viene aggiunto ad un gruppo grande, potresti inccorrere in molti errori di limite prima che il picco di traffico si calmi.
Questo potrebbe portare ad essere banditi.
Inoltre, se le richieste vengono tentate più volte, il tuo server consumerà più RAM e larghezza di banda di quanto sia necessario.
Invece di sistemare il problema dopo che avviene, è meglio accodare tutte le richieste API e mandarle alla velocità permessa:

## La soluzione reale (raccomandata)

grammY fornisce il [throttler plugin](../plugins/transformer-throttler.md) che automaticamente fa rispettare al tuo bot tutti i limiti di richieste creando una coda con le richieste in uscita.
Questo plugin è ugualmente semplice al precedente ma fa un lavoro migliore nel controllare il numero di messaggi.
Non c'è una vera buona ragione per usare [auto-retry](../plugins/auto-retry.md) invece di [plugin throttler](../plugins/transformer-throttler.md).
In alcuni casi potrebbe aver senso usare entrambi.