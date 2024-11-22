---
prev: false
next: false
---

# Парсер сущностей (`entity-parser`)

Преобразует [сущности Telegram](https://core.telegram.org/bots/api#messageentity) в семантический HTML.

## Когда стоит это использовать?

Вероятно, НИКОГДА!

Хотя этот плагин может генерировать HTML, в большинстве случаев лучше передавать текст и сущности обратно в Telegram.

Преобразование в HTML требуется только в редких случаях, например, если вам нужно использовать текст с форматированием Telegram **вне** самого Telegram, например, для отображения сообщений на сайте.

Посмотрите раздел [_Случаи, когда лучше не использовать этот пакет_](#случаи-когда-лучше-не-использовать-этот-пакет), чтобы понять, сталкиваетесь ли вы с аналогичной задачей.

Если вы не уверены, подходит ли этот плагин для вашего случая, не стесняйтесь задавать вопросы в наших [англоязычном](https://t.me/grammyjs) и [русскоязычном](https://t.me/grammyjs_ru) чатах.
В большинстве случаев выясняется, что для решения ваших задач этот плагин не нужен!

## Уставнока

Выполните следующую команду в вашем терминале, исходя из используемого пакетного менеджера:

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

## Простое использование

Использовать этот плагин очень просто.
Вот краткий пример:

```ts
import { EntitiesParser } from "@qz/telegram-entities-parser";
import type { Message } from "@qz/telegram-entities-parser/types";

// Для повышения производительности создайте парсер вне функции.
const entitiesParser = new EntitiesParser();
const parse = (message: Message) => entitiesParser.parse({ message });

bot.on(":text", (ctx) => {
  const html = parse(ctx.msg); // Преобразует текст в строку HTML
});

bot.on(":photo", (ctx) => {
  const html = parse(ctx.msg); // Преобразует подпись к фото в строку HTML
});
```

## Расширенное использование

### Настройка выходного HTML тега

Этот пакет преобразует сущности в семантический HTML, следуя лучшим практикам и стандартам настолько близко, насколько это возможно.
Однако предоставленный результат может не всегда соответствовать вашим ожиданиям.

Чтобы это исправить, вы можете использовать собственный `renderer` для настройки HTML тегов, окружающих текст, в соответствии с вашими правилами.
Вы можете изменить конкретные правила, расширив стандартный [`RendererHtml`](https://github.com/quadratz/telegram-entities-parser/blob/main/src/renderers/renderer_html.ts), или переопределить все правила, реализовав собственный [`Renderer`](https://github.com/quadratz/telegram-entities-parser/blob/main/src/renderers/renderer.ts).

Чтобы расширить существующий `renderer`, выполните следующие шаги:

```ts
import { EntitiesParser, RendererHtml } from "@qz/telegram-entities-parser";
import type {
  CommonEntity,
  RendererOutput,
} from "@qz/telegram-entities-parser/types";

// Изменение правила для жирного текста,
// оставив остальные типы, определенные в `RendererHtml`.
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

Параметр `options` принимает объект с полями `text` и `entity`.

- `text`: Конкретный текст, к которому относится текущая сущность.
- `entity`: Может быть представлен различными интерфейсами в зависимости от типа сущности, такими как `CommonEntity`, `CustomEmojiEntity`, `PreEntity`, `TextLinkEntity` или `TextMentionEntity`.
  Например, сущность типа `bold` имеет интерфейс `CommonEntity`, тогда как тип `text_link` может иметь интерфейс `TextLinkEntity`, так как включает дополнительные свойства, такие как `url`.

Вот полный список интерфейсов и выходных данных для каждого типа сущности:

| Тип сущности            | Интерфейс           | Результат                                                                                                                                                                          |
| ----------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `blockquote`            | `CommonEntity`      | `<blockquote class="tg-blockquote"> ... </blockquote>`                                                                                                                             |
| `bold`                  | `CommonEntity`      | `<b class="tg-bold"> ... </b>`                                                                                                                                                     |
| `bot_command`           | `CommonEntity`      | `<span class="tg-bot-command"> ... </span>`                                                                                                                                        |
| `cashtag`               | `CommonEntity`      | `<span class="tg-cashtag"> ... </span>`                                                                                                                                            |
| `code`                  | `CommonEntity`      | `<code class="tg-code"> ... </code>`                                                                                                                                               |
| `custom_emoji`          | `CustomEmojiEntity` | `<span class="tg-custom-emoji" data-custom-emoji-id="${options.entity.custom_emoji_id}"> ... </span>`                                                                              |
| `email`                 | `CommonEntity`      | `<a class="tg-email" href="mailto:${options.text}"> ... </a>`                                                                                                                      |
| `expandable_blockquote` | `CommonEntity`      | `<blockquote class="tg-expandable-blockquote"> ... </blockquote>`                                                                                                                  |
| `hashtag`               | `CommonEntity`      | `<span class="tg-hashtag"> ... </span>`                                                                                                                                            |
| `italic`                | `CommonEntity`      | `<i class="tg-italic"> ... </i>`                                                                                                                                                   |
| `mention`               | `CommonEntity`      | `<a class="tg-mention" href="https://t.me/${username}"> ... </a>`                                                                                                                  |
| `phone_number`          | `CommonEntity`      | `<a class="tg-phone-number" href="tel:${options.text}"> ... </a>`                                                                                                                  |
| `pre`                   | `PreEntity`         | `<pre class="tg-pre-code"><code class="language-${options.entity.language}"> ... </code></pre>` or `<pre class="tg-pre"> ... </pre>`                                               |
| `spoiler`               | `CommonEntity`      | `<span class="tg-spoiler"> ... </span>`                                                                                                                                            |
| `strikethrough`         | `CommonEntity`      | `<del class="tg-strikethrough"> ... </del>`                                                                                                                                        |
| `text_link`             | `TextLinkEntity`    | `<a class="tg-text-link" href="${options.entity.url}"> ... </a>`                                                                                                                   |
| `text_mention`          | `TextMentionEntity` | `<a class="tg-text-mention" href="https://t.me/${options.entity.user.username}"> ... </a>` or `<a class="tg-text-mention" href="tg://user?id=${options.entity.user.id}"> ... </a>` |
| `underline`             | `CommonEntity`      | `<span class="tg-bot-command"> ... </span>`                                                                                                                                        |
| `url`                   | `CommonEntity`      | `<a class="tg-url" href="${options.text}"> ... </a>`                                                                                                                               |

Если вы не уверены, какой интерфейс использовать, обратитесь к реализации [Renderer](https://github.com/quadratz/telegram-entities-parser/blob/main/src/renderers/renderer.ts) или [RendererHtml](https://github.com/quadratz/telegram-entities-parser/blob/main/src/renderers/renderer_html.ts).

### Настройка санитайзера текста

Выводимый текст по умолчанию проходит санитизацию для обеспечения корректного HTML-рендеринга и предотвращения XSS уязвимостей.

| Ввод | Вывод    |
| ---- | -------- |
| `&`  | `&amp;`  |
| `<`  | `&lt;`   |
| `>`  | `&gt;`   |
| `"`  | `&quot;` |
| `'`  | `&#x27;` |

Например, результат `<b>Bold</b> & <i>Italic</i>` будет санитизирован в `<b>Bold</b> &amp; <i>Italic</i>`.

Вы можете изменить это поведение, указав `textSanitizer` при создании экземпляра [`EntitiesParser`](https://github.com/quadratz/telegram-entities-parser/blob/main/src/mod.ts):

- Если вы не укажете `textSanitizer`, по умолчанию будет использоваться [`sanitizerHtml`](https://github.com/quadratz/telegram-entities-parser/blob/main/src/utils/sanitizer_html.ts) для санитизации.
- Установка значения в `false` отключит санитизацию, сохраняя текст вывода в исходном виде.
  Это не рекомендуется, так как может привести к некорректному рендерингу и сделать ваше приложение уязвимым для XSS атак.
  Если вы выбираете этот вариант, убедитесь в правильной обработке данных.
- Если вы предоставите функцию, она будет использована вместо стандартного санитайзера.

```ts
const myTextSanitizer: TextSanitizer = (options: TextSanitizerOption): string =>
  // Замените опасные символы
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

// Используйте собственный санитайзер
const entitiesParser = new EntitiesParser({ textSanitizer: myTextSanitizer });
```

## Случаи, когда лучше не использовать этот пакет

Если вы сталкиваетесь с проблемами, подобными перечисленным ниже, возможно, вы сможете решить их без использования этого пакета.

### Копирование и пересылка одного и того же сообщения

Используйте метод [`forwardMessage`](https://core.telegram.org/bots/api#forwardmessage) для пересылки сообщений любого типа.

Вы также можете воспользоваться методом [`copyMessage`](https://core.telegram.org/bots/api#copymessage), который выполняет ту же задачу, но без ссылки на оригинальное сообщение.
Метод [`copyMessage`](https://core.telegram.org/bots/api#copymessage) работает как копирование сообщения и отправка его обратно в Telegram, что делает его похожим на обычное сообщение, а не на пересланное.

```ts
bot.on(":text", async (ctx) => {
  // ID целевого чата для отправки.
  const chatId = -946659600;
  // Копировать текущее сообщение без ссылки на оригинальное.
  await ctx.copyMessage(chatId);
  // Переслать текущее сообщение с ссылкой на оригинальное.
  await ctx.forwardMessage(chatId);
});
```

### Ответ на сообщения с изменённым форматом текста

Вы можете легко отвечать на входящие сообщения, используя HTML, Markdown или сущности.

```ts
bot.on(":text", async (ctx) => {
  // Ответ с использованием HTML
  await ctx.reply("<b>bold</b> <i>italic</i>", { parse_mode: "HTML" });
  // Ответ с использованием Telegram Markdown V2
  await ctx.reply("*bold* _italic_", { parse_mode: "MarkdownV2" });
  // Ответ с использованием сущностей
  await ctx.reply("bold italic", {
    entities: [
      { offset: 0, length: 5, type: "bold" },
      { offset: 5, length: 6, type: "italic" },
    ],
  });
});
```

::: tip Используйте parse-mode для улучшенного форматирования
Используйте официальный плагин [`parse-mode`](./parse-mode) для более удобного создания форматированных сообщений.
:::

## Краткая информация о плагине

- Название: entity-parser
- Пакет: <https://jsr.io/@qz/telegram-entities-parser>
- Исходник: <https://github.com/quadratz/telegram-entities-parser>
