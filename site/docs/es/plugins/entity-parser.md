---
prev: false
next: false
---

# Analizador de entidades (`entity-parser`)

Convierte
[entidades de Telegram](https://core.telegram.org/bots/api#messageentity) a HTML
semántico.

## ¿Cuándo debo usar esto?

Probablemente ¡NUNCA!

Aunque este plugin puede generar HTML, generalmente es mejor enviar el texto y
las entidades de vuelta a Telegram.

Convertirlos a HTML sólo es necesario en raros casos en los que necesites usar
texto con formato de Telegram **fuera** de Telegram mismo, como mostrar mensajes
de Telegram en un sitio web.

Mira la sección
[_Casos en los que es mejor no usar este paquete_](#casos-en-los-que-es-mejor-no-utilizar-este-paquete)
para determinar si tienes un problema similar que resolver.

Si no estás seguro de si este plugin es el adecuado para tu caso de uso, no
dudes en preguntar en nuestro [grupo de Telegram](https://t.me/grammyjs). En la
mayoría de los casos, la gente descubre que no necesita este complemento para
resolver sus problemas.

## Instalación

Ejecute el siguiente comando en su terminal en función de su tiempo de ejecución
o gestor de paquetes:

::: code-group

```sh:no-line-numbers [Deno]
deno add jsr:@qz/telegram-entities-parser
```

```sh:no-line-numbers [Bun]
bunx jsr add @qz/telegram-entities-parser
```

```sh:no-line-numbers [pnpm]
pnpm dlx jsr add @qz/telegram-entities-parser
```

```sh:no-line-numbers [Yarn]
yarn dlx jsr add @qz/telegram-entities-parser
```

```sh:no-line-numbers [npm]
npx jsr add @qz/telegram-entities-parser
```

:::

## Uso sencillo

El uso de este plugin es muy sencillo. He aquí un ejemplo rápido:

```ts
import { EntitiesParser } from "@qz/telegram-entities-parser";
import type { Message } from "@qz/telegram-entities-parser/types";

// Para un mejor rendimiento, cree la instancia fuera de la función.
const entitiesParser = new EntitiesParser();
const parse = (message: Message) => entitiesParser.parse({ message });

bot.on(":text", (ctx) => {
  const html = parse(ctx.msg); // Convertir texto en cadena HTML
});

bot.on(":photo", (ctx) => {
  const html = parse(ctx.msg); // Convertir pie de foto en cadena HTML
});
```

## Uso avanzado

### Personalización de la etiqueta HTML de salida

Este paquete convierte entidades en HTML semántico, adhiriéndose lo más posible
a las mejores prácticas y estándares. Sin embargo, la salida proporcionada puede
no ser siempre la esperada.

Para solucionarlo, puede utilizar su propio `renderer` para personalizar los
elementos HTML que rodean al texto de acuerdo con sus reglas. Puedes modificar
reglas específicas extendiendo el
[`RendererHtml`](https://github.com/quadratz/telegram-entities-parser/blob/main/src/renderers/renderer_html.ts)
por defecto o anular todas las reglas implementando el
[`Renderer`](https://github.com/quadratz/telegram-entities-parser/blob/main/src/renderers/renderer.ts).

Para extender el `renderer` existente, haz lo siguiente:

```ts
import { EntitiesParser, RendererHtml } from "@qz/telegram-entities-parser";
import type {
  CommonEntity,
  RendererOutput,
} from "@qz/telegram-entities-parser/types";

// Cambiar la regla para la entidad de tipo negrita,
// pero deja el resto de los tipos como están definidos por `RendererHtml`.
class MyRenderer extends RendererHtml {
  override bold(
    options: { text: string; entity: CommonEntity },
  ): RendererOutput {
    return {
      prefix: '<strong class="tg-bold">',
      suffix: "</strong>",
    };
  }
}

const entitiesParser = new EntitiesParser({ renderer: new MyRenderer() });
```

El parámetro `options` acepta un objeto con `text` y `entity`.

- `text`: El texto específico al que se refiere la entidad actual.
- `entity`: Puede estar representada por varias interfaces dependiendo del tipo
  de entidad, como `CommonEntity`, `CustomEmojiEntity`, `PreEntity`,
  `TextLinkEntity`, o `TextMentionEntity`. Por ejemplo, el tipo `bold` tiene una
  entidad con la interfaz `CommonEntity`, mientras que el tipo `text_link` puede
  tener una entidad con la interfaz `TextLinkEntity`, ya que incluye propiedades
  adicionales como `url`.

Aquí está la lista completa de interfaces y la salida para cada tipo de entidad:

| Entity Type             | Interface           | Result                                                                                                                                                                            |
| ----------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `blockquote`            | `CommonEntity`      | `<blockquote class="tg-blockquote"> ... </blockquote>`                                                                                                                            |
| `bold`                  | `CommonEntity`      | `<b class="tg-bold"> ... </b>`                                                                                                                                                    |
| `bot_command`           | `CommonEntity`      | `<span class="tg-bot-command"> ... </span>`                                                                                                                                       |
| `cashtag`               | `CommonEntity`      | `<span class="tg-cashtag"> ... </span>`                                                                                                                                           |
| `code`                  | `CommonEntity`      | `<code class="tg-code"> ... </code>`                                                                                                                                              |
| `custom_emoji`          | `CustomEmojiEntity` | `<span class="tg-custom-emoji" data-custom-emoji-id="${options.entity.custom_emoji_id}"> ... </span>`                                                                             |
| `email`                 | `CommonEntity`      | `<a class="tg-email" href="mailto:${options.text}"> ... </a>`                                                                                                                     |
| `expandable_blockquote` | `CommonEntity`      | `<blockquote class="tg-expandable-blockquote"> ... </blockquote>`                                                                                                                 |
| `hashtag`               | `CommonEntity`      | `<span class="tg-hashtag"> ... </span>`                                                                                                                                           |
| `italic`                | `CommonEntity`      | `<i class="tg-italic"> ... </i>`                                                                                                                                                  |
| `mention`               | `CommonEntity`      | `<a class="tg-mention" href="https://t.me/${username}"> ... </a>`                                                                                                                 |
| `phone_number`          | `CommonEntity`      | `<a class="tg-phone-number" href="tel:${options.text}"> ... </a>`                                                                                                                 |
| `pre`                   | `PreEntity`         | `<pre class="tg-pre-code"><code class="language-${options.entity.language}"> ... </code></pre>` o `<pre class="tg-pre"> ... </pre>`                                               |
| `spoiler`               | `CommonEntity`      | `<span class="tg-spoiler"> ... </span>`                                                                                                                                           |
| `strikethrough`         | `CommonEntity`      | `<del class="tg-strikethrough"> ... </del>`                                                                                                                                       |
| `text_link`             | `TextLinkEntity`    | `<a class="tg-text-link" href="${options.entity.url}"> ... </a>`                                                                                                                  |
| `text_mention`          | `TextMentionEntity` | `<a class="tg-text-mention" href="https://t.me/${options.entity.user.username}"> ... </a>` o `<a class="tg-text-mention" href="tg://user?id=${options.entity.user.id}"> ... </a>` |
| `underline`             | `CommonEntity`      | `<span class="tg-bot-command"> ... </span>`                                                                                                                                       |
| `url`                   | `CommonEntity`      | `<a class="tg-url" href="${options.text}"> ... </a>`                                                                                                                              |

Si no está seguro de cuál es la interfaz correcta, consulte cómo se implementa
[Renderer](https://github.com/quadratz/telegram-entities-parser/blob/main/src/renderers/renderer.ts)
o
[RendererHtml](https://github.com/quadratz/telegram-entities-parser/blob/main/src/renderers/renderer_html.ts).

### Personalizar el sanitizador de texto

El texto de salida se desinfecta de forma predeterminada para garantizar la
correcta representación del HTML y evitar vulnerabilidades XSS.

| Input | Output   |
| ----- | -------- |
| `&`   | `&amp;`  |
| `<`   | `&lt;`   |
| `>`   | `&gt;`   |
| `"`   | `&quot;` |
| `'`   | `&#x27;` |

Por ejemplo, el resultado `<b>Negrita</b> & <i>Cursiva</i>` se saneará a
`<b>Negrita</b> &amp; <i>Cursiva</i>`.

Puede anular este comportamiento especificando un `textSanitizer` al crear una
instancia de
[`EntitiesParser`](https://github.com/quadratz/telegram-entities-parser/blob/main/src/mod.ts):

- Si no especifica `textSanitizer`, se utilizará de manera predeterminada
  [`sanitizerHtml`](https://github.com/quadratz/telegram-entities-parser/blob/main/src/utils/sanitizer_html.ts)
  como sanitizador.
- Si establece el valor en `false`, se omitirá la sanitización y se mantendrá el
  texto de salida como el original. Esto no se recomienda, ya que puede generar
  una representación incorrecta y hacer que su aplicación sea vulnerable a
  ataques XSS. Asegúrese de manipularlo correctamente si elige esta opción.
- Si proporciona una función, se utilizará en lugar del desinfectante
  predeterminado.

```ts
const myTextSanitizer: TextSanitizer = (options: TextSanitizerOption): string =>
  // Sustituir carácter peligroso
  options.text.replaceAll(/[&<>"']/, (match) => {
    switch (match) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#x27;";
      default:
        return match;
    }
  });

// Aplique el desinfectante.
const entitiesParser = new EntitiesParser({ textSanitizer: myTextSanitizer });
```

## Casos en los que es mejor no utilizar este paquete

Si se enfrenta a problemas similares a los que se enumeran a continuación, es
posible que pueda resolverlos sin utilizar este paquete.

### Copiar y reenviar el mismo mensaje

Utiliza [`forwardMessage`](https://core.telegram.org/bots/api#forwardmessage)
para reenviar mensajes de cualquier tipo.

También puedes utilizar la API
[`copyMessage`](https://core.telegram.org/bots/api#copymessage), que realiza la
misma acción pero no incluye un enlace al mensaje original.
[`copyMessage`](https://core.telegram.org/bots/api#copymessage) se comporta como
copiar el mensaje y enviarlo de vuelta a Telegram, haciendo que aparezca como un
mensaje normal en lugar de uno reenviado.

```ts
bot.on(":text", async (ctx) => {
  // El identificador de chat de destino que se enviará.
  const chatId = -946659600;
  // Reenvía el mensaje actual sin un enlace al mensaje original.
  await ctx.copyMessage(chatId);
  // Reenvía el mensaje actual con un enlace al mensaje original.
  await ctx.forwardMessage(chatId);
});
```

### Responder a mensajes con formato de texto modificado

Puede responder fácilmente a los mensajes entrantes utilizando HTML, Markdown o
entidades.

```ts
bot.on(":text", async (ctx) => {
  // Responder con HTML
  await ctx.reply("<b>bold</b> <i>italic</i>", { parse_mode: "HTML" });
  // Responder usando Telegram Markdown V2
  await ctx.reply("*bold* _italic_", { parse_mode: "MarkdownV2" });
  // Responder con entidades
  await ctx.reply("bold italic", {
    entities: [
      { offset: 0, length: 5, type: "bold" },
      { offset: 5, length: 6, type: "italic" },
    ],
  });
});
```

::: tip Use parse-mode para una mejor experiencia de formateo

Utiliza el plugin oficial [`parse-mode`](./parse-mode) para una mejor
experiencia en la construcción de mensajes formateados. :::

## Resumen del plugin

- Nombre: `entity-parser`
- [Fuente](https://jsr.io/@qz/telegram-entities-parser)
- [Referencia](https://github.com/quadratz/telegram-entities-parser)
