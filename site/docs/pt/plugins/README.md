# O que é um Plugin?

Nós queremos que o grammY seja pequeno e consiso, mas extensível.
Por quê?
Porque nem todo mundo usa tudo!
Plugins são desenhados como funcionalidades extras adicionadas a uma aplicação.

## Plugins no grammY

Alguns plugins já são **built-in** na lib grammY porque assumimos que muitos bots vão utilizá-los.
Isso facilita  que novos usuários os usem, sem precisar instalar algo a mais.

A maioria dos plugins são publicados junto com o pacote principal do grammY, nós os chamamos de plugins **oficiais**.
Eles são instalados da `@grammyjs/*`no npm, e publicados sob a organização [@grammyjs](https://github.com/grammyjs) no GitHub.
Nós coordenamos seus lançamentos com os do grammY, garantido o bom funcionamento do conjunto.
Cada seção da documentação de plugins para um plugin oficial tem o nome do pacote no título.
Por exemplo, o plugin [grammY runner](./runner) (`runner`) precisa ser instalado via `npm install @grammyjs/runner`. (Se você está usando Deno e não Node.js, você precisa importar o plugin do <https://deno.land/x/>, do módulo `grammy_runner`no arquivo `mod.ts``)

Temos também alguns plugins de **terceiros**.
Todos podem publicá-los.
Nós não podemos garantir que eles estejam atualizados, bem documentados, ou que funcionem com outros plugins.
Se desejar, seu próprio plugin também pode ser listado no site para que mais pessoas consigam conhecê-lo.

## Overview

Nós compilamos um overview objetivo com descrições curtas para cada plugin.
Instalar plugins é fácil, e gostariamos de mostrar o que temos a oferecer.

> Clique no nome do pacote para mais informações sobre o respectivo plugin.

| Plugin                                     | Package                                            | Description                                             |
| ------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------- |
| [Sessions](./session)                      | _built-in_                                         | Grava dados do usuário no seu database                  |
| [Inline and Custom Keyboards](./keyboard)  | _built-in_                                         | Simplifica a criação de inline e custom keyboards       |
| [Media Groups](./media-group)              | _built-in_                                         | Simplifica o envio de albums e a edição de media        |
| [Inline Queries](./inline-query)           | _built-in_                                         | Facilita a construção de resultados para queries inline |
| [Auto-retry](./auto-retry)                 | [`auto-retry`](./auto-retry)                       | Automaticamente lida com rate limit                     |
| [Conversations](./conversations)           | [`conversations`](./conversations)                 | Crie poderosas interfaces conversacionais e diálogos    |
| [Chat Members](./chat-members)             | [`chat-members`](./chat-members)                   | Rastreie que usuário entrou no chat                     |
| [Emoji](./emoji)                           | [`emoji`](./emoji)                                 | Simplifica o uso de emojis em código                    |
| [Files](./files)                           | [`files`](./files)                                 | Facilita a manipulação de arquivos                      |
| [Hydration](./hydrate)                     | [`hydrate`](./hydrate)                             | Executa métodos em objetos retornados de chamados de API|
| [Internationalization](./i18n)             | [`i18n`](./i18n) or [`fluent`](./fluent)           | Permite que seu bot fale vários idiomas                 |
| [Interactive Menus](./menu)                | [`menu`](./menu)                                   | Projeta menus dinâmicos com navegação flexível          |
| [Parse Mode](./parse-mode)                 | [`parse-mode`](./parse-mode)                       | Simplifica a formatação de mensagens                    |
| [Rate Limiter](./ratelimiter)              | [`ratelimiter`](./ratelimiter)                     | Automaticamente restringe usuários que spammarem seu bot|
| [Router](./router)                         | [`router`](./router)                               | Direciona mensagens para diferentes partes do seu código|
| [Runner](./runner)                         | [`runner`](./runner)                               | Faz long polling de forma concorrente e em escala       |
| [Stateless Question](./stateless-question) | [`stateless-question`](./stateless-question)       | Cria diálogos sem necessidade de armazenamento          |
| [Throttler](./transformer-throttler)       | [`transformer-throttler`](./transformer-throttler) | Reduz a velocidade de chamadas de API                   |

Também temos plugins de terceiros!
Você pode encontrá-los no menu em _Plugins_ > _Terceiros_
Não deixe de dar uma olhada neles também!

## Tipos de Plugins no grammY

Bom, tudo que reluz é ouro, certo?
Bom, um tipo diferente de ouro!
O grammY toma vantagem de dois tipos de plugins: _plugins middleware_ e _plugins transformadores_.
Em termos simples, plugins no grammy retornam uma função middleware ou uma função de transformador.
Vamos falar das diferenças entre elas.

### Type I: Plugins Middleware

[Middleware](../guide/middleware) é uma função que lida com dados de entrada de várias formas.
Plugins Middleware são plugins conectados a um bot como---um, você adivinhou---middleware.
Isso significa que a instalação é feita via `bot.use``

### Type II: Plugins Transformadores

Uma [função transformadora](../advanced/transformers) é o contrário de um middleware!
É uma função que lida com dados de saída.
Plugins Transformadores são plugins conectados a um bot como uma---loucura! adivinhou de novo---função transformadora.
Isso significa que a instalação é feita via `bot.api.config.use`.
A [transformer function](../advanced/transformers) is the opposite of middleware!

## Crie seus próprios Plugins

Se você deseja desenvolver um plugin e compartilhá-lo com outros usuários (e até publicá-lo no site oficial do grammY), temos um [guia muito útil](./guide) que você deveria conferir.

## Ideias para mais Plugins

Estamos coletando ideias para novos plugins [nessa issue do GitHub](https://github.com/grammyjs/grammY/issues/110).
