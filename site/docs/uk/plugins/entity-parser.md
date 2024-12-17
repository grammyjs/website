---
prev: false
next: false
---

# Парсер сутностей (`entity-parser`)

Перетворює [сутності Telegram](https://core.telegram.org/bots/api#messageentity) у семантичний HTML.

## Коли мені слід використовувати це?

Напевно, ніколи!

Хоча цей плагін може генерувати HTML, зазвичай краще надсилати до Telegram безпосередньо текст і сутності.

Перетворення в HTML необхідне лише в рідкісних випадках, коли вам потрібно використовувати текст у форматі Telegram **поза межами** самого Telegram, наприклад, для відображення повідомлень Telegram на вебсайті.

Перегляньте розділ [_Випадки, коли краще не використовувати цей пакет_](#випадки-коли-краще-не-використовувати-цеи-пакет), щоб визначити, чи є у вас подібна проблема, яку потрібно вирішити.

Якщо ви не впевнені, чи підходить цей плагін для вашого випадку використання, будь ласка, не соромтеся запитувати в нашій [групі в Telegram](https://t.me/grammyjs).
У більшості випадків люди приходять до висновку, що їм насправді не потрібен цей плагін для вирішення їхніх проблем!

## Встановлення

Запустіть наступну команду у вашому терміналі на основі вашого середовища виконання або пакетного менеджера:

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

## Просте використання

Використовувати цей плагін дуже просто.
Ось короткий приклад:

```ts
import { EntitiesParser } from "@qz/telegram-entities-parser";
import type { Message } from "@qz/telegram-entities-parser/types";

// Для кращої продуктивності створіть екземпляр поза функцією.
const entitiesParser = new EntitiesParser();
const parse = (message: Message) => entitiesParser.parse({ message });

bot.on(":text", (ctx) => {
  const html = parse(ctx.msg); // Перетворення тексту в рядок HTML.
});

bot.on(":photo", (ctx) => {
  const html = parse(ctx.msg); // Перетворення підпису в рядок HTML.
});
```

## Просунуте використання

### Налаштування вихідного тегу HTML

Цей пакет перетворює сутності у семантичний HTML, дотримуючись найкращих практик і стандартів, наскільки це можливо.
Однак, результат може не завжди відповідати вашим очікуванням.

Щоб вирішити цю проблему, ви можете використати власний `renderer` для налаштування елементів HTML, що оточують текст, відповідно до ваших правил.
Ви можете змінити певні правила, розширивши стандартний [`RendererHtml`](https://github.com/quadratz/telegram-entities-parser/blob/main/src/renderers/renderer_html.ts) або перевизначити всі правила, застосувавши [`Renderer`](https://github.com/quadratz/telegram-entities-parser/blob/main/src/renderers/renderer.ts).

Щоб розширити існуючий `renderer`, зробіть наступне:

```ts
import { EntitiesParser, RendererHtml } from "@qz/telegram-entities-parser";
import type {
  CommonEntity,
  RendererOutput,
} from "@qz/telegram-entities-parser/types";

// Змініть правило для сутності з жирним шрифтом,
// залишивши решту типів, як визначено у `RendererHtml`.
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

Параметр `options` приймає обʼєкт з `text` та `entity`.

- `text`: конкретний текст, на який посилається поточна сутність.
- `entity`: залежно від типу сутності може бути представлений різними інтерфейсами, як-от `CommonEntity`, `CustomEmojiEntity`, `PreEntity`, `TextLinkEntity` або `TextMentionEntity`.
  Наприклад, тип `bold` має сутність з інтерфейсом `CommonEntity`, тоді як тип `text_link` може мати сутність з інтерфейсом `TextLinkEntity`, оскільки він включає додаткові властивості, наприклад, `url`.

Ось повний список інтерфейсів та результати для кожного типу сутності:

| Тип сутності            | Інтерфейс           | Результат                                                                                                                                                                           |
| ----------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `blockquote`            | `CommonEntity`      | `<blockquote class="tg-blockquote"> ... </blockquote>`                                                                                                                              |
| `bold`                  | `CommonEntity`      | `<b class="tg-bold"> ... </b>`                                                                                                                                                      |
| `bot_command`           | `CommonEntity`      | `<span class="tg-bot-command"> ... </span>`                                                                                                                                         |
| `cashtag`               | `CommonEntity`      | `<span class="tg-cashtag"> ... </span>`                                                                                                                                             |
| `code`                  | `CommonEntity`      | `<code class="tg-code"> ... </code>`                                                                                                                                                |
| `custom_emoji`          | `CustomEmojiEntity` | `<span class="tg-custom-emoji" data-custom-emoji-id="${options.entity.custom_emoji_id}"> ... </span>`                                                                               |
| `email`                 | `CommonEntity`      | `<a class="tg-email" href="mailto:${options.text}"> ... </a>`                                                                                                                       |
| `expandable_blockquote` | `CommonEntity`      | `<blockquote class="tg-expandable-blockquote"> ... </blockquote>`                                                                                                                   |
| `hashtag`               | `CommonEntity`      | `<span class="tg-hashtag"> ... </span>`                                                                                                                                             |
| `italic`                | `CommonEntity`      | `<i class="tg-italic"> ... </i>`                                                                                                                                                    |
| `mention`               | `CommonEntity`      | `<a class="tg-mention" href="https://t.me/${username}"> ... </a>`                                                                                                                   |
| `phone_number`          | `CommonEntity`      | `<a class="tg-phone-number" href="tel:${options.text}"> ... </a>`                                                                                                                   |
| `pre`                   | `PreEntity`         | `<pre class="tg-pre-code"><code class="language-${options.entity.language}"> ... </code></pre>` або `<pre class="tg-pre"> ... </pre>`                                               |
| `spoiler`               | `CommonEntity`      | `<span class="tg-spoiler"> ... </span>`                                                                                                                                             |
| `strikethrough`         | `CommonEntity`      | `<del class="tg-strikethrough"> ... </del>`                                                                                                                                         |
| `text_link`             | `TextLinkEntity`    | `<a class="tg-text-link" href="${options.entity.url}"> ... </a>`                                                                                                                    |
| `text_mention`          | `TextMentionEntity` | `<a class="tg-text-mention" href="https://t.me/${options.entity.user.username}"> ... </a>` або `<a class="tg-text-mention" href="tg://user?id=${options.entity.user.id}"> ... </a>` |
| `underline`             | `CommonEntity`      | `<span class="tg-bot-command"> ... </span>`                                                                                                                                         |
| `url`                   | `CommonEntity`      | `<a class="tg-url" href="${options.text}"> ... </a>`                                                                                                                                |

Якщо ви не впевнені, який інтерфейс правильний, зверніться до того, як реалізовано [Renderer](https://github.com/quadratz/telegram-entities-parser/blob/main/src/renderers/renderer.ts) або [RendererHtml](https://github.com/quadratz/telegram-entities-parser/blob/main/src/renderers/renderer_html.ts).

### Редагування та очищення тексту

Вихідний текст за замовчуванням очищується, щоб забезпечити правильне відображення HTML і запобігти XSS-вразливостям.

| Вхідний символ | Вихідна сутність HTML |
| -------------- | --------------------- |
| `&`            | `&amp;`               |
| `<`            | `&lt;`                |
| `>`            | `&gt;`                |
| `"`            | `&quot;`              |
| `'`            | `&#x27;`              |

Наприклад, результат `<b>Жирний</b> & <i>Курсив</i>` буде перетворений в `<b>Жирний</b> &amp; <i>Курсив</i>`.

Ви можете змінити цю поведінку, вказавши `textSanitizer` при створенні екземпляра [`EntitiesParser`](https://github.com/quadratz/telegram-entities-parser/blob/main/src/mod.ts):

- Якщо ви не вкажете `textSanitizer`, буде використано [`sanitizerHtml`](https://github.com/quadratz/telegram-entities-parser/blob/main/src/utils/sanitizer_html.ts) як типовий очищувач.
- Якщо вказати значення `false`, очищення буде пропущено, а виведений текст буде збережено як оригінал.
  Це не рекомендується, оскільки може призвести до некоректного рендерингу і зробити вашу програму вразливою до XSS-атак.
  Якщо ви вибрали цю опцію, забезпечте належну обробку результату.
- Якщо ви надасте функцію, вона буде використовуватися замість типового очищувача.

```ts
const myTextSanitizer: TextSanitizer = (options: TextSanitizerOption): string =>
  // Замінюємо небезпечні символи.
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

// Застосовуємо очищувач.
const entitiesParser = new EntitiesParser({ textSanitizer: myTextSanitizer });
```

## Випадки, коли краще не використовувати цей пакет

Якщо ви зіткнулися з проблемами, подібними до наведених нижче, можливо, вам вдасться вирішити їх без використання цього пакету.

### Копіювання та пересилання одного і того ж повідомлення

Використовуйте [`forwardMessage`](https://core.telegram.org/bots/api#forwardmessage) для пересилання повідомлень будь-якого типу.

Ви також можете використовувати [`copyMessage`](https://core.telegram.org/bots/api#copymessage), який виконає ту ж саму дію, але не міститиме посилання на оригінальне повідомлення.
[`copyMessage`](https://core.telegram.org/bots/api#copymessage) поводиться так, ніби копіює повідомлення і надсилає його назад у Telegram, при цьому воно відображається як звичайне повідомлення, а не як переслане.

```ts
bot.on(":text", async (ctx) => {
  // Ідентифікатор цільового чату для надсилання.
  const chatId = -946659600;
  // Пересилаємо поточне повідомлення без посилання на початкове повідомлення.
  await ctx.copyMessage(chatId);
  // Пересилаємо поточне повідомлення з посиланням на початкове повідомлення.
  await ctx.forwardMessage(chatId);
});
```

### Відповідь на повідомлення зі зміненим форматуванням тексту

Ви можете легко відповідати на вхідні повідомлення за допомогою HTML, Markdown або сутностей.

```ts
bot.on(":text", async (ctx) => {
  // Відповідаємо за допомогою HTML.
  await ctx.reply("<b>жирний</b> <i>курсив</i>", { parse_mode: "HTML" });
  // Відповідаємо за допомогою Telegram Markdown V2.
  await ctx.reply("*жирний* _курсив_", { parse_mode: "MarkdownV2" });
  // Відповідаємо за допомогою сутностей.
  await ctx.reply("жирний курсив", {
    entities: [
      { offset: 0, length: 6, type: "bold" },
      { offset: 7, length: 6, type: "italic" },
    ],
  });
});
```

::: tip Просунуте форматування

Використовуйте офіційний плагін [`parse-mode`](./parse-mode) для кращого досвіду створення форматованих повідомлень.

:::

## Загальні відомості про плагін

- Назва: `entity-parser`
- [Пакет](https://jsr.io/@qz/telegram-entities-parser)
- [Джерело](https://github.com/quadratz/telegram-entities-parser)
