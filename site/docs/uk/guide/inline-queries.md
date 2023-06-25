---
prev: ./errors.md
next: ./files.md
---

# Inline-запити

За допомогою inline-запитів користувачі можуть шукати, переглядати та надсилати контент, запропонований вашим ботом, у будь-якому чаті, навіть якщо бот не учасник цього чату.
Для цього користувачі починають повідомлення з `@your_bot_name` і вибирають один із результатів.

::: tip Увімкніть inline-режим
У типових налаштуванням бота inline-режим вимкнено.
Для того, щоб отримувати inline-запити, потрібно звернутися до [@BotFather](https://t.me/BotFather) та увімкнути inline-режим для свого бота.
:::

> Перегляньте розділ про inline-режим у [можливостях ботів Telegram](https://core.telegram.org/bots/features#inline-requests), створений командою Telegram.
> Додатковими ресурсами є їхній [детальний опис](https://core.telegram.org/bots/inline) inline ботів, а також [оригінальна публікація в блозі](https://telegram.org/blog/inline-bots), яка анонсувала цю можливість, і розділ про inline-режим у [довіднику Telegram Bot API](https://core.telegram.org/bots/api#inline-mode).
> Це все варто прочитати, перш ніж застосовувати inline-запити для вашого бота.

Щойно користувач ініціює inline-запит, тобто почне друкувати повідомлення, ввівши `@your_bot_name ...` у полі введення тексту, ваш бот отримає оновлення про це.
grammY має спеціальну підтримку для обробки inline-запитів за допомогою методу `bot.inlineQuery()`, як описано в класі `Composer` у [довідці API grammY](https://deno.land/x/grammy/mod.ts?s=Composer#method_inlineQuery_0).
Це дозволяє вам обробляти певні inline-запити, які відповідають рядкам або регулярним виразам.
Якщо ви хочете обробляти всі inline-запити узагальнено, використовуйте `bot.on("inline_query")`.

```ts
// Безсоромна самореклама в документації в межах одного проєкту
// є найкращим видом реклами.
bot.inlineQuery(
  /(найкращий фреймворк|найкраща бібліотека) для створення ботів/,
  async (ctx) => {
    await ctx.answerInlineQuery(
      [
        {
          type: "article",
          id: "grammy-website",
          title: "grammY",
          input_message_content: {
            message_text:
"<b>grammY</b> — це найкращий спосіб створити власних ботів Telegram. \
У них навіть є гарний вебсайт! 👇",
            parse_mode: "HTML",
          },
          reply_markup: new InlineKeyboard().url(
            "Вебсайт grammY",
            "https://grammy.dev/uk/",
          ),
          url: "https://grammy.dev/",
          description: "Фреймворк для створення Telegram ботів.",
        },
      ],
      { cache_time: 30 * 24 * 3600 }, // один місяць у секундах
    );
  },
);

// Повертаємо порожній список результатів для інших запитів.
bot.on("inline_query", (ctx) => ctx.answerInlineQuery([]));
```

> [Памʼятайте](./basics.md#надсилання-повідомлень), що ви завжди можете вказати додаткові параметри під час виклику методів API за допомогою обʼєкта параметрів типу `Other`.
> Наприклад, це дозволяє виконувати розбиття на сторінки для inline-запитів через зсув (offset).

Зауважте, що grammY вміє автоматично доповнювати поля у наведеній вище структурі для вас.
Також обовʼязково ознайомтеся зі специфікацією щодо inline результатів у [довіднику Telegram Bot API](https://core.telegram.org/bots/api#inlinequeryresult).
