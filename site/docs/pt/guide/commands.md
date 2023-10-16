# Comandos

Comandos são entidades especiais em mensagens do Telegram, que servem como instruções para bots.

## Uso

> Revisite a seção de comandos em [Telegram Bot Features](https://core.telegram.org/bots/features#commands) escrita pela equipe do Telegram.

O grammY fornece tratamento especial para comandos (por exemplo, `/start` e `/help`).
Você pode registrar diretamente listeners para determinados comandos via `bot.command()`.

```ts
// Responde ao comando /start.
bot.command("start" /* , ... */);
// Responde ao comando /help.
bot.command("help" /* , ... */);
// Responde aos comandos /a, /b, /c e /d.
bot.command(["a", "b", "c", "d"] /* , ... */);
```

Observe que apenas os comandos que estão no início de uma mensagem são tratados, então se um usuário enviar `"POr favor não envie /start para esse bot!"`, então seu listener não será chamado, mesmo que o comando `/start` _esteja_ contido na mensagem.

O Telegram suporta o envio de comandos direcionados a bots, ou seja, comandos que terminam com `@nome_do_seu_bot`.
O grammY trata isso automaticamente para você, então `bot.command("start")` irá corresponder a mensagens com `/start` e com `/start@nome_do_seu_bot` como comandos.
Você pode escolher corresponder apenas a comandos direcionados especificando `bot.command("start@nome_do_seu_bot")`.

::: tip Sugira comandos aos usuários
Você pode chamar

```ts
await bot.api.setMyCommands([
  { command: "start", description: "Inicia o bot" },
  { command: "help", description: "Mostra o texto de ajuda" },
  { command: "settings", description: "Abre as configurações" },
]);
```

para fazer com que os clientes do Telegram exibam uma lista de comandos sugeridos no campo de entrada de texto.

Alternativamente, você pode configurar isso conversando com o [@BotFather](https://t.me/BotFather).
:::

## Argumentos

Os usuários podem enviar **argumentos** junto com seus comandos.
Você pode acessar a string de argumentos via `ctx.match`.

```ts
bot.command("add", async (ctx) => {
  // `item` será "torta de maçã" se um usuário enviar "/add torta de maçã".
  const item = ctx.match;
});
```

Observe que você sempre pode acessar o texto da mensagem inteira via `ctx.msg.text`.

## Suporte a Deep Linking

> Revisite a seção de deep linking em [Telegram Bot Features](https://core.telegram.org/bots/features#deep-linking) escrita pela equipe do Telegram.

Quando um usuário visita `https://t.me/nome_do_seu_bot?start=payload`, o cliente do Telegram mostrará um botão START que (quando clicado) envia a string do parâmetro da URL junto com a mensagem, neste exemplo, o texto da mensagem será `"/start payload"`.
Os clientes do Telegram não mostrarão o payload ao usuário (eles verão apenas `"/start"` na interface do usuário), no entanto, seu bot o receberá.
O grammY extrai esse payload para você e o fornece em `ctx.match`.
Em nosso exemplo com o link acima, `ctx.match` conteria a string `"payload"`.

Deep linking é útil se você quiser construir um sistema de referência ou rastrear onde os usuários descobriram seu bot.
Por exemplo, seu bot poderia enviar um post de canal com um botão de [inline keyboard](../plugins/keyboard#inline-keyboards).
O botão contém uma URL como a acima, por exemplo, `https://t.me/nome_do_seu_bot?start=post-incrivel-no-canal-12345`.
Quando um usuário clica no botão abaixo do post, o cliente do Telegram abrirá um chat com seu bot e exibirá o botão START conforme descrito acima.
Dessa forma, seu bot pode identificar de onde um usuário veio e que eles clicaram no botão abaixo de um post específico no canal.

Naturalmente, você também pode incorporar esses links em qualquer outro lugar: na web, em mensagens, em códigos QR, etc.

Confira esta [seção da documentação do Telegram](https://core.telegram.org/api/links#bot-links) para ver uma lista completa dos possíveis formatos de link.
Eles também permitem que você solicite aos usuários que adicionem seu bot a grupos ou canais e, opcionalmente, concedam ao seu bot os direitos de administrador necessários.
