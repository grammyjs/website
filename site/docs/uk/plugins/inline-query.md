---
prev: false
next: false
---

# Inline-запити (вбудовано)

За допомогою inline-запитів користувачі можуть шукати, переглядати та надсилати контент, запропонований вашим ботом, у будь-якому чаті, навіть якщо бот не учасник цього чату.
Для цього користувачі починають повідомлення з `@псевдонім_вашого_бота` і вибирають один із результатів.

> Перегляньте розділ про inline-режим у [можливостях ботів Telegram](https://core.telegram.org/bots/features#inline-requests), створений командою Telegram.
> Додатковими ресурсами є їхній [детальний опис](https://core.telegram.org/bots/inline) inline ботів, а також [оригінальна публікація в блозі](https://telegram.org/blog/inline-bots), яка анонсувала цю можливість, і розділ про inline-режим у [довіднику Telegram Bot API](https://core.telegram.org/bots/api#inline-mode).
> Це все варто прочитати, перш ніж застосовувати inline-запити у вашому боті, оскільки вони є досить складними.
> Якщо вам не хочеться все це читати, то ця сторінка допоможе вам розібратися крок за кроком.

## Увімкнення inline-режиму

За замовчуванням для вашого бота вимкнено підтримку inline-режиму.
Ви повинні звʼязатися з [@BotFather](https://t.me/BotFather) та увімкнути inline-режим, щоб ваш бот почав отримувати inline-запити.

Зробили це?
Тепер ваш клієнт Telegram повинен відображати "...", коли ви вводите імʼя бота в будь-якому текстовому полі, а також показувати спінер завантаження.
Ви вже можете починати щось вводити.
Тепер давайте подивимося, як ваш бот може обробляти ці запити.

## Обробка inline-запитів

Як тільки користувач запускає inline-запит, тобто починає вводити повідомлення з `@псевдонім_вашого_бота ...` у полі для введення тексту, ваш бот отримає оновлення про це.
grammY має спеціальну підтримку для обробки inline-запитів за допомогою методу `bot.inlineQuery()`, як задокументовано в класі `Composer` у [довідці API grammY](/ref/core/composer#inlinequery).
Він дозволяє прослуховувати певні inline-запити, які відповідають рядкам або регулярним виразам.
Якщо ви хочете обробляти всі inline-запити загалом, використовуйте `bot.on("inline_query")`.

```ts
// Прослуховуємо певні рядки або регулярні вирази.
bot.inlineQuery(
  /(найкращий фреймворк|найкраща бібліотека) для створення ботів/,
  async (ctx) => {
    const match = ctx.match; // обʼєкт збігу регулярного виразу
    const query = ctx.inlineQuery.query; // рядок запиту
  },
);

// Прослуховуємо будь-який inline-запит.
bot.on("inline_query", async (ctx) => {
  const query = ctx.inlineQuery.query; // рядок запиту
});
```

Тепер, коли ми знаємо, як прослуховувати оновлення inline-запитів, ми можемо відповідати на них списком результатів.

## Побудова результатів inline-запитів

Створення списків результатів для inline-запитів є нудним завданням, оскільки вам потрібно створювати [складні вкладені обʼєкти](https://core.telegram.org/bots/api#inlinequeryresult) з різноманітними властивостями.
На щастя, ви використовуєте grammY, тому звичайно є допоміжні інструменти, які роблять це завдання дуже простим.

Кожен результат потребує трьох речей:

1. Унікальний рядковий ідентифікатор.
2. _Обʼєкт результату_, який описує, як відобразити результат inline-запиту.
   Він може містити такі речі, як заголовок, посилання або зображення.
3. _Об'єкт вмісту повідомлення_, який описує вміст повідомлення, яке буде надіслано користувачеві, якщо він вибере цей результат.
   У деяких випадках вміст повідомлення може бути виведений неявно з обʼєкта результату.
   Наприклад, якщо ви хочете, щоб ваш результат відображався у вигляді GIF-файлу, то Telegram зрозуміє, що вміст повідомлення буде тим самим GIF-файлом, якщо ви не вкажете обʼєкт вмісту повідомлення.

grammY експортує будівельника для результатів inline-запитів, який називається `InlineQueryResultBuilder`.
Ось кілька прикладів його використання:

::: code-group

```ts [TypeScript]
import { InlineKeyboard, InlineQueryResultBuilder } from "grammy";

// Будуємо результат з фото.
InlineQueryResultBuilder.photo("id-0", "https://grammy.dev/images/grammY.png");

// Будуємо результат, який відображає фотографію, але надсилає текстове повідомлення.
InlineQueryResultBuilder.photo("id-1", "https://grammy.dev/images/grammY.png")
  .text("Цей текст буде надіслано замість фотографії.");

// Будуємо текстовий результат.
InlineQueryResultBuilder.article("id-2", "Inline-запити")
  .text(
    "Чудова документація по inline-запитам: grammy.dev/uk/plugins/inline-query",
  );

// Передаємо додаткові параметри до результату.
const keyboard = new InlineKeyboard()
  .text("О, так", "викликай мене");
InlineQueryResultBuilder.article(
  "id-3",
  "Вдарь мене",
  { reply_markup: keyboard },
).text("Натисни на мої кнопки");

// Передаємо додаткові параметри до вмісту повідомлення.
InlineQueryResultBuilder.article("id-4", "Inline-запити")
  .text(
    "**Видатна** документація: grammy.dev/uk",
    { parse_mode: "MarkdownV2" },
  );
```

```js [JavaScript]
const { InlineKeyboard, InlineQueryResultBuilder } = require("grammy");

// Будуємо результат з фото.
InlineQueryResultBuilder.photo("id-0", "https://grammy.dev/images/grammY.png");

// Будуємо результат, який відображає фотографію, але надсилає текстове повідомлення.
InlineQueryResultBuilder.photo("id-1", "https://grammy.dev/images/grammY.png")
  .text("Цей текст буде надіслано замість фотографії.");

// Будуємо текстовий результат.
InlineQueryResultBuilder.article("id-2", "Inline-запити")
  .text(
    "Чудова документація по inline-запитам: grammy.dev/uk/plugins/inline-query",
  );

// Передаємо додаткові параметри до результату.
const keyboard = new InlineKeyboard()
  .text("О, так", "викликай мене");
InlineQueryResultBuilder.article(
  "id-3",
  "Вдарь мене",
  { reply_markup: keyboard },
).text("Натисни на мої кнопки");

// Передаємо додаткові параметри до вмісту повідомлення.
InlineQueryResultBuilder.article("id-4", "Inline-запити")
  .text(
    "**Видатна** документація: grammy.dev/uk",
    { parse_mode: "MarkdownV2" },
  );
```

```ts [Deno]
import {
  InlineKeyboard,
  InlineQueryResultBuilder,
} from "https://deno.land/x/grammy/mod.ts";

// Будуємо результат з фото.
InlineQueryResultBuilder.photo("id-0", "https://grammy.dev/images/grammY.png");

// Будуємо результат, який відображає фотографію, але надсилає текстове повідомлення.
InlineQueryResultBuilder.photo("id-1", "https://grammy.dev/images/grammY.png")
  .text("Цей текст буде надіслано замість фотографії.");

// Будуємо текстовий результат.
InlineQueryResultBuilder.article("id-2", "Inline-запити")
  .text(
    "Чудова документація по inline-запитам: grammy.dev/uk/plugins/inline-query",
  );

// Передаємо додаткові параметри до результату.
const keyboard = new InlineKeyboard()
  .text("О, так", "викликай мене");
InlineQueryResultBuilder.article(
  "id-3",
  "Вдарь мене",
  { reply_markup: keyboard },
).text("Натисни на мої кнопки");

// Передаємо додаткові параметри до вмісту повідомлення.
InlineQueryResultBuilder.article("id-4", "Inline-запити")
  .text(
    "**Видатна** документація: grammy.dev/uk",
    { parse_mode: "MarkdownV2" },
  );
```

:::

Зауважте, що якщо ви хочете надіслати файли за допомогою існуючих ідентифікаторів файлів, вам потрібно використовувати методи `*Cached`.

```ts
// Результат для аудіофайлу, надісланого за допомогою ідентифікатора файлу.
const audioFileId = "AgADBAADZRAxGyhM3FKSE4qKa-RODckQHxsoABDHe0BDC1GzpGACAAEC";
InlineQueryResultBuilder.audioCached("id-0", audioFileId);
```

> Дізнайтеся більше про ідентифікатори файлів [тут](../guide/files#як-працюють-фаили-для-ботів-telegram).

Вам слід переглянути [довідку API](/ref/core/inlinequeryresultbuilder) `InlineQueryResultBuilder` і, можливо, також [специфікацію](https://core.telegram.org/bots/api#inlinequeryresult) `InlineQueryResult`, щоб побачити всі доступні параметри.

## Відповідь на inline-запити

Після створення масиву результатів inline-запиту за допомогою будівельника [вище](#побудова-результатів-inline-запитів) ви можете викликати `answerInlineQuery`, щоб відправити ці результати користувачу.

```ts
// Безсоромна самореклама в документації в межах одного проєкту
// є найкращим видом реклами.
bot.inlineQuery(
  /(найкращий фреймворк|найкраща бібліотека) для створення ботів/,
  async (ctx) => {
    // Створюємо єдиний результат inline-запиту.
    const result = InlineQueryResultBuilder
      .article("id:grammy-website", "grammY", {
        reply_markup: new InlineKeyboard()
          .url("сайт grammY", "https://grammy.dev/uk/"),
      })
      .text(
        `<b>grammY</b> — це найкращий спосіб створити власних ботів Telegram.
У них навіть є гарний вебсайт! 👇`,
        { parse_mode: "HTML" },
      );

    // Відповідаємо на inline-запит.
    await ctx.answerInlineQuery(
      [result], // відповідаємо списком результатів
      { cache_time: 30 * 24 * 3600 }, // 30 днів у секундах
    );
  },
);

// Повертаємо порожній список для інших запитів.
bot.on("inline_query", (ctx) => ctx.answerInlineQuery([]));
```

[Памʼятайте](../guide/basics#надсилання-повідомлень), що ви завжди можете вказати додаткові параметри під час виклику методів API за допомогою обʼєкта параметрів типу `Other`.
Наприклад, `answerInlineQuery` дозволяє виконувати розбиття на сторінки для inline-запитів через зсув (offset), як ви можете побачити [тут](https://core.telegram.org/bots/api#answerinlinequery).

::: tip Поєднання тексту та медіа
Хоча дозволяється надсилати списки результатів, які містять як медіа, так і текстові елементи, більшість клієнтів Telegram не дуже добре їх відображають.
З точки зору користувацького досвіду, їх варто уникати.
:::

## Кнопка над результатами inline-запиту

Клієнти Telegram можуть [показати кнопку](https://core.telegram.org/bots/api#inlinequeryresultsbutton) над списком результатів.
Ця кнопка може перевести користувача до приватного чату з ботом.

```ts
const button = {
  text: "Відкрити приватний чат",
  start_parameter: "вхід",
};
await ctx.answerInlineQuery(results, { button });
```

Коли користувач натисне кнопку, вашому боту буде надіслано командне повідомлення `/start`.
Параметр start (`start_parameter`) буде доступний через [deep linking](../guide/commands#підтримка-deep-linking).
Іншими словами, використовуючи вищенаведений фрагмент коду, `ctx.match` матиме значення `"вхід"` у вашому обробнику команди.

Якщо ви надішлете [вбудовану клавіатуру](./keyboard#побудова-вбудованоі-клавіатури) з кнопкою `switchInline`, користувач буде повернутий до чату, де він спочатку натиснув кнопку результатів inline-запиту.

```ts
bot
  .command("start")
  .filter((ctx) => ctx.match === "вхід", async (ctx) => {
    // Користувач приходить з результатів inline-запиту.
    await ctx.reply(
      "Особисті повідомлення відкриті, ви можете повернутися назад",
      {
        reply_markup: new InlineKeyboard()
          .switchInline("Повернутися назад"),
      },
    );
  });
```

Отже, ви можете виконати, наприклад, процедуру входу в систему в приватному чаті з користувачем, перш ніж надсилати результати запиту.
Діалог може тривати деякий час, перш ніж ви відправите користувача назад.
Наприклад, ви можете [провести коротку розмову](./conversations) за допомогою плагіна розмов (`conversations`).

## Отримання зворотного звʼязку про вибрані результати

Результати inline-запитів надсилаються за принципом "вистрілив і забув".
Іншими словами, після того, як ваш бот відправив список результатів inline-запиту в Telegram, він не знатиме, який результат вибрав користувач і чи вибрав взагалі.

Якщо ви зацікавлені в цьому, ви можете увімкнути зворотний звʼязок за допомогою [@BotFather](https://t.me/BotFather).
Ви можете вирішити, скільки зворотного звʼязку ви хочете отримувати, вибравши один з декількох варіантів між 0% (зворотний звʼязок вимкнено) та 100% (отримувати зворотний звʼязок для кожного обраного результату).

Зворотній звʼязок доставляється через оновлення `chosen_inline_result`.
Ви можете прослуховувати певні ідентифікатори результатів за допомогою рядка або регулярного виразу.
Звичайно, ви також можете прослуховувати оновлення звичайним способом за допомогою запитів фільтрування.

```ts
// Прослуховуємо конкретні ідентифікатори результатів.
bot.chosenInlineResult(/id-[0-9]+/, async (ctx) => {
  const match = ctx.match; // обʼєкт збігу регулярного виразу
  const query = ctx.chosenInlineResult.query; // використаний inline-запит
});

// Прослуховуємо будь-який обраний результат.
bot.on("chosen_inline_result", async (ctx) => {
  const query = ctx.chosenInlineResult.query; // використаний inline-запит
});
```

Деякі боти встановлюють зворотний звʼязок на 100% і використовують його як хакерство.
Вони надсилають фіктивні повідомлення без реального вмісту в `answerInlineQuery`.
Одразу після отримання оновлення `chosen_inline_result` вони редагують відповідне повідомлення і вставляють справжній вміст.

Ці боти не працюватимуть для анонімних адміністраторів або при надсиланні відкладених повідомлень, оскільки там не можна отримати зворотний звʼязок.
Однак, якщо для вас це не є проблемою, то цей хак дозволить вам не генерувати багато контенту для повідомлень, які ніколи не будуть відправлені.
Це може заощадити ресурси вашого бота.

## Загальні відомості про плагін

Цей плагін вбудовано в ядро grammY.
Вам не потрібно нічого встановлювати, щоб використовувати його.
Просто імпортуйте все з самого grammY.

До того ж документація і довідка API цього плагіна уніфіковані з ядром пакета.
