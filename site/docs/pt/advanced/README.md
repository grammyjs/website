---
prev: false
---

# Visão Geral: Tópicos Avançados

Quando seu bot se torna mais popular, você pode se deparar com problemas mais complexos do que apenas fazer seu bot funcionar.

Esta seção da documentação começará com uma análise profunda do [sistema de middlewares do grammY](./middleware), que permitirá que você escreva um tratamento de mensagens mais sofisticado do que o comumente necessário.

Os próximos quatro capítulos falam sobre escala.
Leia [Parte I](./structuring) se seu código ficar muito complexo.
Leia [Parte II](./scaling) se você tiver que processar muitas mensagens.
Leia [Parte III](./reliability) se você se preocupa com a confiabilidade do seu bot.
Leia [Parte IV](./flood) se você estiver atingindo limites de taxa, ou seja, recebendo erros 429.

Se você precisar interceptar e transformar solicitações de API em tempo real, o grammY oferece a você a possibilidade de fazer isso instalando [funções transformadoras](./transformers).

O grammY também tem [suporte a proxy](./proxy).

Por último, mas não menos importante, compilamos uma [lista de algumas coisas que você deve ter em mente](./deployment) ao deployar seu bot.
Não há nada de novo lá, é apenas um monte de coisas sobre possíveis armadilhas, tudo em um lugar central para você passar por elas.
Talvez isso te deixe dormir melhor à noite.
