# Primeiros Passos

Crie seu primeiro Bot em minutos. ([Desça um pouco](#getting-started-on-deno) para um guia para um projeto Deno.)

## Primeiros passos no Node.js

> Esse guia assume que você tem o [Node.js](https://nodejs.org) instalado, e o `npm` deve vir com ele.
> Se você não sabe o que são essas coisas, dê uma olhada na nossa [Introdução](./introduction)!

Crie um novo projeto TypeScript e instale o pacote `grammy`.
Para fazer isso, abra um terminal e digite:

::: code-group

```sh [npm]
# Crie um novo diretório e entre nele.
mkdir meu-bot
cd meu-bot

# Configure o TypeScript (ignore esse passo se você usa JavaScript).
npm install -D typescript
npx tsc --init

# Instale o grammY.
npm install grammy
```

```sh [Yarn]
# Crie um novo diretório e entre nele.
mkdir meu-bot
cd meu-bot

# Configure o TypeScript (ignore esse passo se você usa JavaScript).
yarn add typescript -D
npx tsc --init

# Instale o grammY.
yarn add grammy
```

```sh [pnpm]
# Crie um novo diretório e entre nele.
mkdir meu-bot
cd meu-bot

# Configure o TypeScript (ignore esse passo se você usa JavaScript).
pnpm add -D typescript
npx tsc --init

# Instale o grammY.
pnpm add grammy
```

:::

Crie um novo arquivo de texto vazio chamado `bot.ts`, por exemplo.
Sua estrutura de diretórios deve ficar mais ou menos assim:

```asciiart:no-line-numbers
.
├── bot.ts
├── node_modules/
├── package.json
├── package-lock.json
└── tsconfig.json
```

Agora, é hora de abrir o Telegram para criar um bot e obter um token para ele.
Fale com o [@BotFather](https://t.me/BotFather) para fazer isso.
O token do bot é algo como `123456:aBcDeF_gHiJkLmNoP-q`.
Ele é usado para autenticar seu bot.

Pegou o token? Agora você pode escrever o código do seu bot no arquivo `bot.ts`.
Copie o seguinte bot de exemplo para esse arquivo, e passar seu token para o construtor `Bot`:

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";

// Crie uma instância da classe `Bot` e passe seu token de bot para ela.
const bot = new Bot(""); // <-- coloque o token do seu bot entre ""

// Agora você pode registrar listeners no objeto `bot`.
// O grammY irá chamar os listeners quando usuários enviarem mensagens para seu bot.

// Trata o comando /start.
bot.command("start", (ctx) => ctx.reply("Online e roteando! :sunglasses:"));
// Trata outras mensagens.
bot.on("message", (ctx) => ctx.reply("Chegou outra mensagem!"));

// Agora que você especificou como tratar mensagens, você pode iniciar seu bot.
// Isso irá conectar aos servidores do Telegram e esperar por mensagens.

// Inicia o bot.
bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");

// Crie uma instância da classe `Bot` e passe seu token de bot para ela.
const bot = new Bot(""); // <-- coloque o token do seu bot entre ""

// Agora você pode registrar listeners no objeto `bot`.
// O grammY irá chamar os listeners quando usuários enviarem mensagens para seu bot.

// Trata o comando /start.
bot.command("start", (ctx) => ctx.reply("Boas vindas! Online e roteando :sunglasses:"));
// Trata outras mensagens.
bot.on("message", (ctx) => ctx.reply("Chegou outra mensagem!"));

// Agora que você especificou como tratar mensagens, você pode iniciar seu bot.
// Isso irá conectar aos servidores do Telegram e esperar por mensagens.

// Inicia o bot.
bot.start();
```

:::

Para compilar o código, execute

```sh
npx tsc
```

no seu terminal.
Isso gera o arquivo JavaScript `bot.js`.

Agora é só executar o bot rodando o comando

```sh
node bot.js
```

no terminal.
E pronto! :tada:

Vá para o Telegram para ver seu bot responder às mensagens!

::: tip Habilitando Logs
Para habilitar alguns logs básicos, execute

```sh
export DEBUG="grammy*"
```

no seu terminal antes de executar `node bot.js`.
Vai ser mais fácil debugar o seu bot assim.
:::

## Primeiros passos no Deno

> Esse guia assume que você tem o [Deno](https://deno.land) instalado.

Crie um novo diretório em algum lugar, e crie um novo arquivo de texto vazio nele, chamado `bot.ts` por exemplo.

```sh
mkdir ./meu-bot
cd ./meu-bot
touch bot.ts
```

Agora, é hora de abrir o Telegram para criar um bot e obter um token para ele.
Fale com o [@BotFather](https://t.me/BotFather) para fazer isso.
O token do bot é algo como `123456:aBcDeF_gHiJkLmNoP-q`.
Ele é usado para autenticar seu bot.

Pegou o token? Agora você pode escrever o código do seu bot no arquivo `bot.ts`.
Copie o seguinte bot de exemplo para esse arquivo, e passar seu token para o construtor `Bot`:

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

// Crie uma instância da classe `Bot` e passe seu token de bot para ela.
const bot = new Bot(""); // <-- coloque o token do seu bot entre ""

// Agora você pode registrar listeners no objeto `bot`.
// O grammY irá chamar os listeners quando usuários enviarem mensagens para seu bot.

// Trata o comando /start.
bot.command("start", (ctx) => ctx.reply("Online e roteando! :sunglasses:"));
// Trata outras mensagens.
bot.on("message", (ctx) => ctx.reply("Chegou outra mensagem!"));

// Agora que você especificou como tratar mensagens, você pode iniciar seu bot.
// Isso irá conectar aos servidores do Telegram e esperar por mensagens.

// Inicia o bot.
bot.start();
```

Agora é só executar o bot rodando o comando

```sh
deno run --allow-net bot.ts
```

no terminal.
E pronto! :tada:

Vá para o Telegram para ver seu bot responder às mensagens!

::: tip Habilitando Logs
Para habilitar alguns logs básicos, execute

```sh
export DEBUG="grammy*"
```

no seu terminal antes de executar seu bot.
Vai ser mais fácil debugar o seu bot assim.

Além disso, você precisa executar o bot usando

```sh
deno run --allow-net --allow-env bot.ts
```

para que o grammY consiga ler a variável de ambiente `DEBUG`.
:::
