# Tratamento de Arquivos

Bots do telegram não só podem enviar e receber mensagens de texto, mas também muitos outros tipos de mensagens, como fotos e vídeos.
Isso envolve o tratamento dos arquivos que estão anexados às mensagens.

## Como os Arquivos Funcionam para os Bots do Telegram

> Esta seção explica como os arquivos funcionam para os bots do Telegram.
> Se você quiser saber como pode trabalhar com arquivos no grammY, role para baixo para [baixar](#recebendo-arquivos) e [carregar](#enviando-arquivos) arquivos.

Arquivos são armazenados separadamente das mensagens.
Um arquivo nos servidores do Telegram é identificado por um `file_id`, que é apenas uma longa sequência de caracteres.

`AgADBAADZRAxGyhM3FKSE4qKa-RODckQHxsoABDHe0BDC1GzpGACAAEC` é um exemplo de um `file_id`.

Sempre que seu bot **recebe** uma mensagem com um arquivo, ele na verdade não receberá diretamente os dados completos do arquivo, mas apenas o `file_id`.
Se o seu bot realmente quiser baixar o arquivo, ele poderá fazê-lo chamando o método `getFile` ([referência da API de bots do Telegram](https://core.telegram.org/bots/api#getfile)).
Este método permite que você baixe o arquivo construindo uma URL especial e temporária.
Observe que a validade dessa URL é garantida apenas por 60 minutos, após o qual ela pode expirar. Neste caso, você pode simplesmente chamar `getFile` novamente.

Sempre que seu bot **envia** uma mensagem com um arquivo, ele receberá informações sobre a mensagem enviada, incluindo o `file_id` do arquivo enviado.
Isso significa que todos os arquivos que o bot vê, tanto via envio quanto recebimento, disponibilizarão um `file_id` para o bot.

Quando um bot envia uma mensagem, ele pode **especificar um `file_id` que ele já viu antes**.
Isso permitirá que ele envie o arquivo identificado, sem precisar fazer o upload dos dados dele.
(Para ver como fazer o upload de seus próprios arquivos, [role para baixo](#enviando-arquivos).)
Você pode reutilizar o mesmo `file_id` quantas vezes quiser, portanto, pode enviar o mesmo arquivo para cinco chats diferentes, usando o mesmo `file_id`.
No entanto, você deve se certificar de usar o método correto---por exemplo, você não pode usar um `file_id` que identifica uma foto ao chamar [`sendVideo`](https://core.telegram.org/bots/api#sendvideo).

Cada bot tem seu próprio conjunto de `file_id`s para os arquivos que ele pode acessar.
Você não pode usar, de forma confiável, um `file_id` do bot do seu amigo para acessar um arquivo com _seu_ bot.
Cada bot usará identificadores diferentes para o mesmo arquivo.
Isso significa que você não pode simplesmente adivinhar um `file_id` e acessar o arquivo de uma pessoa aleatória, porque o Telegram mantém o controle de quais `file_id`s são válidos para o seu bot.

::: warning Usando `file_id`s estrangeiros
Observe que, em alguns casos, é _tecnicamente_ possível que um `file_id` de outro bot pareça funcionar corretamente.
**No entanto**, usar um `file_id` estrangeiro assim é perigoso, pois pode parar de funcionar a qualquer momento, sem aviso.
Portanto, sempre certifique-se de que quaisquer `file_id`s que você usar serão originalmente do seu bot.
:::

Por outro lado, é possível que um bot eventualmente veja o mesmo arquivo identificado por diferentes `file_id`s.
Isso significa que você não pode confiar na comparação de `file_id`s para verificar se dois arquivos são iguais.
Se você precisar identificar o mesmo arquivo ao longo do tempo (ou em vários bots), deverá usar o valor `file_unique_id` que seu bot recebe junto com cada `file_id`.
O `file_unique_id` não pode ser usado para baixar arquivos, mas será o mesmo para qualquer arquivo, em todos os bots.

## Recebendo Arquivos

Você pode tratar arquivos como qualquer outra mensagem.
Por exemplo, se você deseja ouvir mensagens de voz, pode fazer isso:

```ts
bot.on("message:voice", async (ctx) => {
  const voice = ctx.msg.voice;

  const duration = voice.duration; // em segundos
  await ctx.reply(`Sua mensagem de voz tem ${duration} segundos de duração.`);

  const fileId = voice.file_id;
  await ctx.reply(
    "O identificador de arquivo da sua mensagem de voz é: " + fileId,
  );

  const file = await ctx.getFile(); // válido por pelo menos uma hora
  const path = file.file_path; // caminho do arquivo no servidor da Bot API
  await ctx.reply("Baixe seu próprio arquivo novamente: " + path);
});
```

::: tip Passando um `file_id` Personalizado para getFile
No objeto de contexto, `getFile` é um [atalho](./context#atalhos) e buscará informações de um arquivo na mensagem atual.
Se você quiser obter um arquivo diferente ao tratar uma mensagem, use `ctx.api.getFile(file_id)` em vez disso.
:::

> Confira os atalhos [`:media` e `:file`](./filter-queries#atalhos) para filter queries se você quiser receber qualquer tipo de arquivo.

Depois de chamar `getFile`, você pode usar o `file_path` retornado para baixar o arquivo usando esta URL `https://api.telegram.org/file/bot<token>/<file_path>`, onde `<token>` deve ser substituído pelo token do seu bot.

::: tip Plugin de Arquivos
O grammY não vem com seu próprio downloader de arquivos, mas você pode instalar o [plugin oficial de arquivos](../plugins/files).
Isso permite que você baixe arquivos via `await file.download()` e obtenha uma URL de download para eles via `file.getUrl()`.
:::

## Enviando Arquivos

Bots do Telegram têm [três maneiras](https://core.telegram.org/bots/api#enviando-arquivos) de enviar arquivos:

1. Via `file_id`, ou seja, enviando um arquivo por um identificador que já é conhecido pelo bot.
2. Via URL, ou seja, passando uma URL de arquivo pública, que o Telegram baixa e envia para você.
3. Via upload do seu próprio arquivo.

Em todos os casos, os métodos que você precisa chamar têm o mesmo nome.
Dependendo de qual das três maneiras você escolher para enviar seu arquivo, os parâmetros dessas funções variarão.
Por exemplo, para enviar uma foto, você pode usar `ctx.replyWithPhoto` (ou `sendPhoto` se você usar `ctx.api` ou `bot.api`).

Você pode enviar outros tipos de arquivos simplesmente renomeando o método e alterando o tipo dos dados que você passa para ele.
Para enviar um vídeo, você pode usar `ctx.replyWithVideo`.
É o mesmo caso para um documento: `ctx.replyWithDocument`.
Você entendeu a ideia.

Vamos mergulhar em quais são as três maneiras de enviar um arquivo.

### Via `file_id` ou URL

Os dois primeiros métodos são simples: você apenas passa o valor respectivo como uma `string` e pronto.

```ts
// Enviar via file_id.
await ctx.replyWithPhoto(existingFileId);

// Enviar via URL.
await ctx.replyWithPhoto("https://grammy.dev/images/grammY.png");

// Alternativamente, você pode usar bot.api.sendPhoto() ou ctx.api.sendPhoto().
```

### Enviando Seus Próprios Arquivos

O grammY tem um bom suporte para fazer upload de seus próprios arquivos.
Você pode fazer isso importando e usando a classe `InputFile` ([grammY API Reference](https://deno.land/x/grammy/mod.ts?s=InputFile)).

```ts
// Enviar um arquivo via caminho local
await ctx.replyWithPhoto(new InputFile("/tmp/picture.jpg"));

// alternativamente, use bot.api.sendPhoto() ou ctx.api.sendPhoto()
```

O construtor `InputFile` não apenas aceita caminhos de arquivos, mas também streams, objetos `Buffer`, iteradores assíncronos e---dependendo da sua plataforma---mais, ou uma função que cria qualquer uma dessas coisas.
Tudo o que você precisa lembrar é: **crie uma instância de `InputFile` e passe-a para qualquer método para enviar um arquivo**.
Instâncias de `InputFile` podem ser passadas para todos os métodos que aceitam o envio de arquivos por upload.

Aqui estão alguns exemplos de como você pode construir `InputFile`s.

#### Enviando um Arquivo do Disco

Se você já tem um arquivo armazenado em sua máquina, pode deixar o grammY fazer o upload deste arquivo.

::: code-group

```ts [Node.js]
import { createReadStream } from "fs";

// Enviar um arquivo local.
new InputFile("/path/to/file");

// Enviar de um read stream.
new InputFile(createReadStream("/path/to/file"));
```

```ts [Deno]
// Enviar um arquivo local.
new InputFile("/path/to/file");

// Enviar uma instância `Deno.FsFile`.
new InputFile(await Deno.open("/path/to/file"));
```

:::

#### Enviando Dados Binários Brutos

Você também pode enviar um objeto `Buffer`, ou um iterador que entrega objetos `Buffer`.
No Deno, você também pode enviar objetos `Blob`.

::: code-group

```ts [Node.js]
// Enviar um buffer ou um array de bytes.
const buffer = Uint8Array.from([65, 66, 67]);
new InputFile(buffer); // "ABC"
// Enviar um iterable.
new InputFile(function* () {
  // "ABCABCABCABC"
  for (let i = 0; i < 4; i++) yield buffer;
});
```

```ts [Deno]
// Enviar um blob.
const blob = new Blob("ABC", { type: "text/plain" });
new InputFile(blob);
// Enviar um buffer ou um array de bytes.
const buffer = Uint8Array.from([65, 66, 67]);
new InputFile(buffer); // "ABC"
// Enviar um iterable.
new InputFile(function* () {
  // "ABCABCABCABC"
  for (let i = 0; i < 4; i++) yield buffer;
});
```

:::

#### Baixando e Reenviando um Arquivo

Você pode até fazer o grammY baixar um arquivo da internet.
Isso não salvará o arquivo em seu disco.
Em vez disso, o grammY apenas encaminhará os dados e manterá apenas um pequeno pedaço deles na memória.
Isso é muito eficiente.

> Observe que o Telegram suporta o download do arquivo para você em muitos métodos.
> Se possível, você deve preferir [enviar o arquivo via URL](#via-file_id-ou-url), em vez de usar `InputFile` para transmitir o conteúdo do arquivo por meio do seu servidor.

```ts
// Baixar um arquivo e transmitir a resposta para o Telegram.
new InputFile(new URL("https://grammy.dev/images/grammY.png"));
new InputFile({ url: "https://grammy.dev/images/grammY.png" }); // equivalente
```

### Adicionando uma Legenda

Ao enviar arquivos, você pode especificar mais opções em um objeto de opções do tipo `Other`, exatamente como explicado [anteriormente](./basics#enviando-mensagens).
Por exemplo, isso permite que você envie legendas.

```ts
// Enviar uma foto de um arquivo local para o usuário 1235 com a legenda "photo.jpg".
await bot.api.sendPhoto(12345, new InputFile("/path/to/photo.jpg"), {
  caption: "photo.jpg",
});
```

Assim como com todos os outros métodos da API, você pode enviar arquivos via `ctx` (mais fácil), `ctx.api` ou `bot.api`.

## Limites de Tamanho de Arquivo

O próprio grammY pode enviar arquivos sem nenhum limite de tamanho, no entanto, o Telegram restringe os tamanhos de arquivo conforme documentado [aqui](https://core.telegram.org/bots/api#enviando-arquivos).
Isso significa que seu bot não pode baixar arquivos maiores que 20 MB ou fazer upload de arquivos maiores que 50 MB.
Algumas combinações têm limites ainda mais rigorosos, como fotos enviadas por URL (5 MB).

Se você quiser oferecer suporte ao upload e download de arquivos de até 2000 MB (tamanho máximo de arquivo no Telegram), deverá hospedar seu próprio servidor da Bot API além de hospedar seu bot.
Consulte a documentação oficial sobre isso [aqui](https://core.telegram.org/bots/api#using-a-local-bot-api-server).

Hospedar seu próprio servidor da Bot API não tem, em si, nada a ver com o grammY.
No entanto, o grammY suporta todos os métodos necessários para configurar seu bot para usar seu próprio servidor da Bot API.

Além disso, você pode querer revisitar um capítulo anterior deste guia sobre a configuração da Bot API [aqui](./api).
