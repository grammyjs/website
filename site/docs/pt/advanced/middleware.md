# Middleware Redux

No Guia, [introduzimos o middleware](../guide/middleware) como uma pilha de funções.
Embora não esteja errado que você possa usar o middleware dessa maneira linear (também no grammY), chamá-lo apenas de uma pilha é uma simplificação.

## Middlewares no grammY

Geralmente, você vê o seguinte padrão.

```ts
const bot = new Bot("");

bot.use(/* ... */);
bot.use(/* ... */);

bot.on(/* ... */);
bot.on(/* ... */);
bot.on(/* ... */);

bot.start();
```

Parece muito com uma pilha, exceto que, nos bastidores, é na verdade uma árvore.
O coração dessa funcionalidade é a classe `Composer` ([referência](https://deno.land/x/grammy/mod.ts?s=Composer)) que constrói essa árvore.

Em primeiro lugar, cada instância de `Bot` é uma instância de `Composer`.
É apenas uma subclasse, então `class Bot extends Composer`.

Além disso, você deve saber que cada método de `Composer` chama internamente `use`.
Por exemplo, `filter` chama apenas `use` com algum middleware de ramificação, enquanto `on` chama apenas `filter` novamente com alguma função de predicado que compara updates com a [filter query](../guide/filter-queries.md) fornecida.
Portanto, podemos nos limitar a olhar para `use` por enquanto, e o resto segue.

Agora temos que mergulhar um pouco nos detalhes do que `Composer` faz com suas chamadas `use`, e como ele difere de outros sistemas de middleware por aí.
A diferença pode parecer sutil, mas espere até a próxima subseção para descobrir por que ela tem consequências notáveis.

## Aumentando `Composer`

Você pode instalar mais middlewares em uma instância de `Composer` mesmo depois de instalar o `Composer` em algum lugar.

```ts
const bot = new Bot(""); // subclasse de `Composer`

const composer = new Composer();
bot.use(composer);

// Estes serão executados:
composer.use(/* A */);
composer.use(/* B */);
composer.use(/* C */);
```

`A`, `B` e `C` serão executados.
Tudo que isso diz é que uma vez que você instalou uma instância de `Composer`, você ainda pode chamar `use` nele e esse middleware ainda será executado.
(Isso não é nada espetacular, mas já é uma diferença principal para os populares frameworks concorrentes que simplesmente ignoram operações subsequentes.)

Você pode estar se perguntando onde está a estrutura da árvore.
Vamos dar uma olhada neste trecho de código:

```ts
const composer = new Composer();

composer.use(/* A */);
composer.use(/* B */).use(/* C */);
composer.use(/* D */).use(/* E */).use(/* F */).use(/* G */);
composer.use(/* H */).use(/* I */);
composer.use(/* J */).use(/* K */).use(/* L */);
```

Você consegue ver?

Como você pode imaginar, todos os middlewares serão executados em ordem de `A` a `L`.

Outras bibliotecas internamente achatariam esse código para ser equivalente a `composer.use(/* A */).use(/* B */).use(/* C */).use(/* D */)...` e assim por diante.
Pelo contrário, o grammY preserva a árvore que você especificou: um nó raiz (`composer`) tem cinco filhos (`A`, `B`, `D`, `H`, `J`), enquanto o filho `B` tem um outro filho, `C`, etc.
Esta árvore será então percorrida por cada update em ordem de profundidade, passando assim por `A` a `L` em ordem linear, muito parecido com o que você conhece de outros sistemas.

Isso se torna possível criando uma nova instância de `Composer` toda vez que você chama `use` que, por sua vez, será estendida (como explicado acima).

## Concatenando Chamadas `use`

Se usássemos apenas `use`, isso não seria muito útil (piadinha proposital).
Fica mais interessante assim que, por exemplo, `filter` entra em jogo.

Confira isso:

```ts
const composer = new Composer();

composer.filter(/* 1 */, /* A */).use(/* B */)

composer.filter(/* 2 */).use(/* C */, /* D */)
```

Na linha 3, registramos `A` atrás de uma função de predicado `1`.
`A` só será avaliado para updates que passam pela condição `1`.
No entanto, `filter` retorna uma instância `Composer` que aumentamos com a chamada `use` na linha 3, então `B` ainda é protegido por `1`, mesmo que seja instalado em uma chamada `use` completamente diferente.

A linha 5 é equivalente à linha 3 no sentido de que tanto `C` quanto `D` só serão executados se `2` for verdadeiro.

Lembra como as chamadas `bot.on()` poderiam ser encadeadas para concatenar consultas de filtro com AND?
Imagine isso:

```ts
const composer = new Composer();

composer.filter(/* 1 */).filter(/* 2 */).use(/* A */);
```

`2` só será verificado se `1` for verdadeiro, e `A` só será executado se `2` (e assim `1`) for verdadeiro.

Reveja a seção sobre [combinação de filter queries](../guide/filter-queries.md#combinando-múltiplas-queries) com seu novo conhecimento e sinta seu novo poder.

Um caso especial aqui é `fork`, pois ele inicia duas computações que são concorrentes, ou seja, intercaladas no loop de eventos.
Em vez de retornar a instância de `Composer` criada pela chamada `use` subjacente, ela retorna um `Composer` que reflete a computação bifurcada.
Isso permite padrões concisos como `bot.fork().on(":text").use(/* A */)`.
`A` agora será executado na branch de computação paralela.
