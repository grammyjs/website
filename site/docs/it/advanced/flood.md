---
prev: ./reliability.md
next: ./transformers.md
---

# Scalare IV: Limiti di Flood

Telegram limita il numero di messaggi che il tuo bot può inviare al secondo, consulta la [Bot FAQ](https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this).
Assicurati sempre di rimanere al di sotto di questi limiti, altrimenti il tuo bot verrà limitato.
Se ignori questi errori, il tuo bot potrebbe essere eventualmente bandito.

## La soluzione semplice

:::warning Non è una soluzione reale
Questa sezione risolve il problema a breve termine, ma se stai costruendo un bot che dovrebbe effettivamente scalare bene, leggi invece la [prossima sottosezione](#the-real-solution-recommended).
:::

C'è una soluzione molto semplice per il raggiungimento dei limiti di richieste: se una richiesta API fallisce a causa di un limite di richieste, basta aspettare il tempo che Telegram ti dice di aspettare e ripetere la richiesta.

Se vuoi farlo, puoi usare il [plugin `auto-retry`](../plugins/auto-retry.md).
È una [funzione di trasformazione dell'API](./transformers.md) che fa esattamente questo.

Tuttavia, se il traffico verso il tuo bot aumenta rapidamente, ad esempio quando viene aggiunto a un grande gruppo, potrebbe incontrare molti errori di limitazione delle richieste prima che l'aumento di traffico si stabilizzi.
Ciò potrebbe portare a un ban.
Inoltre, poiché le richieste potrebbero essere tentate più volte, il tuo server consumerà più RAM e larghezza di banda del necessario.
Invece di risolvere il problema dopo il fatto, è molto meglio accodare tutte le richieste API e inviarle solo alla velocità consentita:

## La soluzione reale (consigliata)

grammY ti fornisce il [plugin throttler](../plugins/transformer-throttler.md) che fa automaticamente rispettare al tuo bot tutti i limiti di richieste accodando le richieste in uscita dal tuo bot in una coda di messaggi.
Questo plugin è altrettanto semplice da configurare ma fa un lavoro molto migliore nel controllo del flood.
Non c'è davvero alcuna buona ragione per usare [auto-retry](../plugins/auto-retry.md) invece che [plugin throttler](../plugins/transformer-throttler.md).
In alcuni casi potrebbe avere senso usarli entrambi. 
