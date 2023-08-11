# Introdução

Um bot do Telegram é uma conta de usuário especial automatizada por um programa.
Qualquer pessoa pode criar um bot do Telegram, o único pré-requisito é que você saiba um pouco de programação.

> Se você já sabe como criar bots, avance para os [Primeiros Passos](./getting-started)!

O grammY é uma biblioteca que torna a criação desses bots uma tarefa bem simples.

## Como Escrever um Bot

Antes que você comece a criar seu bot, é importante saber o que eles podem ou não fazer.
Confira a [Introdução para Desenvolvedores](https://core.telegram.org/bots) feita pelo time do Telegram.

Para fazer o seu bot do Telegram, você vai precisar criar um arquivo de texto com o código-fonte do seu bot.
(Você também pode copiar um dos nossos arquivos de exemplo.)
Isso vai definir _o que seu bot faz_, ou seja, "quando um usuário enviar essa mensagem, responda com isso aqui", e por aí vai.

Depois disso você vai poder executar seu código.
Seu bot então vai funcionar, até você parar de rodar ele.

Já tá quase acabando…

## Como Manter um Bot Rodando

…a não ser que você esteja levando o seu projeto a sério.
Se você parar o seu bot (ou desligar o seu computador), seu bot congela e não vai responder a nenhuma mensagem.

> Pule essa seção se você só quer brincar com bots, e [continue aqui em baixo com os pré-requisitos](#pré-requisitos-para-os-primeiros-passos) para os primeiros passos.

De maneira simples, se você quer que seu bot fique online o tempo inteiro, você vai precisar manter um computador ligado 24 horas por dia.
Já que você provavelmente não vai querer fazer isso com o seu laptop, você vai precisar subir seu código para um _provedor de hospedagem_ (em outras palavras, o computador de outra pessoa, também conhecido como _servidor_), e deixar que essas pessoas rodem ele pra você.

Existem inúmeras empresas que deixam você rodar seu bot do Telegram de graça.
Essa documentação cobre uma série de provedores de hospedagem que sabemos que funcionam bem com o grammY (confira a seção [Hospedagem](../hosting/comparison)).
Entretanto, a decisão de qual provedor escolher no final é sua.
Lembre-se que rodar seu código em outro lugar significa que quem quer que seja o dono desse "outro lugar" tem acesso a todas as suas mensagens e os dados dos seus usuários, então você deve escolher um provedor que você confia.

Aqui está um diagrama (simplificado) de como vai ficar a estrutura quando Alice entrar em contato com o seu bot:

```asciiart:no-line-numbers
_________          envia uma         ____________                        ___________
| Alice | —> mensagem no Telegram —> | Telegram | —> solicitação HTTP —> | seu bot |
—————————       para o seu bot       ————————————                        ———————————

Um celular                      Servidores do Telegram                   seu laptop,
                                                                         ou melhor: um servidor


|_______________________________________________|                        |__________|
                    |                                                         |
        responsabilidade do Telegram                                 sua responsabilidade
```

De maneira parecida, seu bot pode fazer requisições HTTP para os servidores do Telegram para enviar mensagens de volta para Alice.
(Se você nunca ouviu falar sobre HTTP, por enquanto pense nisso como pacotes de dados que são enviados pela internet.)

## O Que o Grammy Faz Para Você

Bots interagem com o telegram via requisições HTTP.
Toda vez que seu bot envia ou recebe mensagens, requisições HTTP vão e voltam entre os servidores do Telegram e o seu servidor/computador.

Por debaixo dos panos, o grammY implementa toda essa comunicação pra você, de modo que você pode simplesmente digitar `sendMessage` no seu código e a mensagem será enviada.
Além disso, tem uma variedade de outras coisas úteis que o grammY faz para deixar mais simples criar seu bot.
Você vai conhecê-las conforme avançar.

## Pré-Requisitos para os Primeiros Passos

> Pule o resto dessa página se você já sabe como desenvolver uma aplicação em Node.js ou Deno a vá direto para os [primeiros passos](./getting-started).

Aqui estão algumas coisas interessantes sobre programação---coisas que são essencias para programar, mas raramente explicadas porque muitos desenvolvedores acham que elas são óbvias.

Na próxima seção, você vai criar um bot escrevendo o arquivo de texto que contém o código-fonte na linguagem de programação [TypeScript](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html).
A documentação do grammY não vai te ensinar a programar, então esperamos que você aprenda sozinho.
Mas lembre-se: Criar bots para Telegram com o grammY é na verdade uma ótima forma de aprender a programar! :rocket:

::: tip Como Aprender a Programar
Você pode começar a aprender TypeScript com o [tutorial oficial](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html) escrito pelo time do TypeScript e continuar a partir daí.
Não gaste mais do que 30 minutos lendo coisas na internet, então volte aqui, (leia o resto da seção) e dê seus [primeiros passos](./getting-started).

Se você vir alguma sintaxe estranha na documentação, ou se receber uma mensagem de erro que você não entende, pesquise ela no google---a explicação já está na internet (por exemplo, no site Stack Overflow).
:::

::: danger Como Não Aprender a Programar
Economize seu tempo assistindo esse [vídeo de 34 segundos](https://youtu.be/8RtGlWmXGhA).
:::

Ao escolher o grammY, você já decidiu a linguagem de programação, chamada TypeScript.
Mas o que acontece uma vez que você criou seu código TypeScript? Como ele vai começar a rodar?
Para isso, você precisa instalar algum software que é capaz de _executar_ seu código.
Esse tipo de software é chamado _ambiente de execução_.
Ele lê seus arquivos de código e executa seja lá o que está programado neles.

Para nós, existem dois ambientes de execução para escolher, [Deno](https://deno.land) e [Node.js](https://nodejs.org).
(Se você vir pessoas falando _Node_, elas só estão sendo preguiçosas demais pra digitar o ".js", mas querem dizer a mesma coisa.)

> O resto dessa seção te ajuda a decidir entre essas duas plataformas.
> Se você já sabe o que quer usar, pule para os [pré-requisitos para Node.js](#pré-requisitos-para-o-node-js) ou [para Deno](#pré-requisitos-para-o-deno).

O Node.js é uma tecnologia mais velha e madura.
Se você precisa se conectar a um banco de dados diferente ou outras coisas de baixo nível relacionadas ao sistema, muito provavelmente você vai conseguir fazer isso com Node.js.
O Deno é relativamente novo, então as vezes ainda falta suporte para algumas coisas avançadas.
Hoje em dia, muitos servidores utilizam Node.js.

Por outro lado, Deno é significativamente mais fácil de aprender e usar.
Se você não tem muita experiência com programação ainda, **faz sentido começar com Deno**.

Mesmo que você já tenha escrito código para Node.js antes, você deve considerar dar uma chance ao Deno.
Muitas coisas que são difíceis em Node.js são triviais no Deno.

Deno

- é mais simples de instalar,
- não requer que você configure nada no seu projeto,
- usa bem menos espaço no seu disco,
- tem ferramentas de desenvolvimento superiores e built-in, com boa integração em editores de código,
- é bem mais seguro e
- tem ainda mais vantagens que não cabem aqui.

Desenvolver programas no Deno também é bem mais divertido.
Ao menos, essa é nossa opinião.

Entretando, se você tem motivos para usar Node.js, por exemplo, se você já está acostumado, então tá tudo bem!
Nós estamos garantindo que o grammY roda igualmente bem nas duas plataformas, e não estamos pegando nenhum atalho.
Por favor, escolha o que você acredita ser o melhor para você.

### Pré-Requisitos Para o Deno

Antes que você possa começar a criar seu bot, vamos passar alguns minutos montando um setup correto de desenvolvimento de software.
Isso significa instalar algumas ferramentas.

#### Preparando sua Máquina para Desenvolvimento

[Instale o Deno](https://deno.com/manual/getting_started/installation#download-and-install), caso não tenha feito isso ainda.

Você também precisa de um editor de texto que funciona bem com programação.
O melhor para o Deno é o Visual Studio Code, geralmente chamado apenas de VS Code.
[Instale ele.](https://code.visualstudio.com)

Depois, você precisa conectar o VS Code ao Deno.
Isso é bem simples: Tem uma extensão para VS Code que faz tudo automaticamente.
Você pode instalar ela [desse jeito](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno).

Seu sistema agora está pronto para desenvolver bots! :tada:

#### Desenvolvendo um Bot

Crie um novo diretório em algum lugar.
Ele vai conter o seu projeto do bot.
Abra esse novo diretório no VS Code.

```sh
mkdir ./meu-bot
cd ./meu-bot
code .
```

> Se você está usando macOS e o comando `code` não está disponível, é só abrir o VS Code, apertar `Cmd+Shift+P`, digitar "shell command" e apertar Enter.

No VS Code, transforme esse diretório vazio em um projeto Deno.
Para isso, é só apertar `Ctrl+Shift+P`, digitar "deno init" e apertar Enter.
Após isso a parte inferior direita do seu editor deve mostrar a versão do Deno instalada no seu sistema.

Seu ambiente de desenvolvimento Deno está pronto.
Agora você pode começar a escrever seu bot.
Isso é explicado na próxima página.

Uma última coisa:
Depois que você tiver criado seu bot, por exemplo em um arquivo `bot.ts`, você pode rodar ele digitando `deno run --allow-net bot.ts` no seu terminal.
(Sim, escrever software significa usar bastante o terminal, se acostume com ele.)
Você pode parar o bot novamente com `Ctrl+C`.

Pronto?
[Primeiros Passos](./getting-started#getting-started-on-deno)! :robot:

### Pré-Requisitos para o Node.js

Você vai escrever seu bot em TypeScript, mas, ao contrário do Deno, Node.js não consegue rodar TypeScript.
Em vez disso, uma vez que você tenha um arquivo de código (chamado `bot.ts`, por exemplo), você vai _compilar_ ele para JavaScript.
Após isso você terá dois arquivos: seu original `bot.ts` e o gerado `bot.js`, que por sua vez pode ser executado pelo Node.js.
Os comandos exatos para tudo isso serão apresentados na próxima seção quando você, de fato, criar um bot, mas é importante saber que essas etapas são necessárias.

Para executar o arquivo `bot.js`, você precisa ter o [Node.js](https://nodejs.org/en/) instalado.

Em resumo, é isso que você precisa fazer para usar o Node.js:

1. Criar o arquivo de código `bot.ts` com código TypeScript, por exemplo usando o [VS Code](https://code.visualstudio.com/) (ou qualquer outro editor de código).
2. Compilar o código executando um comando no seu terminal. Isso gera um novo arquivo chamado `bot.js`.
3. Executar `bot.js` usando Node.js, novamente no seu terminal.

Sempre que você modificar seu código em `bot.ts`, você precisa reiniciar o seu processo Node.js.
Aperte `Ctrl+C` no seu terminal para parar o processo.
Isso vai parar o seu bot.
Então, repita as etapas 2 e 3.

::: tip Pera, que?

Instalar o Node.js e configurar tudo corretamente toma bastante tempo.
Se você nunca fez isso antes, espere se meter em problemas bem confusos que são difíceis de resolver.

É por isso que nós meio que esperamos que você saiba configurar seu sistema, ou pelo menos que saiba aprender sozinho.
(Instalar Node.js _da forma correta_ é tão complicado que não cabe aqui nessa página.)

Se você tá se sentindo confuso nesse momento, aconselhamos deixar o Node.js pra trás e usar o [Deno](#pré-requisitos-para-o-deno) no lugar.

:::

Ainda confiante?
Ótimo!
[Bora Começar](./getting-started#getting-started-on-node-js)! :robot:
