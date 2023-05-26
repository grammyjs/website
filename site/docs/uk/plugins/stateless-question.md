# Питання без стану (`stateless-question`)

> Створення питань без стану, які працюють у режимі конфіденційності, для користувачів Telegram.

Ви хочете зберегти конфіденційність користувача з [увімкненним (за замовчуванням) приватним режимом Telegram](https://core.telegram.org/bots/features#privacy-mode), надсилати користувачам перекладені їхньою мовою питання та не зберігати стан того, що користувачі роблять в даний момент?

Цей плагін прагне вирішити цю проблему.

Основна ідея полягає в тому, щоб надсилати ваше запитання зі [спеціальним текстом](https://en.wikipedia.org/wiki/Zero-width_non-joiner) в кінці.
Цей текст невидимий для користувача, але видимий для вашого бота.
Коли користувач відповідає на повідомлення, воно перевіряється.
Якщо воно містить цей спеціальний текст в кінці, то це відповідь на питання.
Отже, ви можете мати багато рядків для одних і тих самих питань, як і у випадку з перекладами.
Вам лише потрібно переконатися, що `uniqueIdentifier` є унікальним для вашого бота.

## Використання

```ts
import { StatelessQuestion } from "@grammyjs/stateless-question";

const bot = new Bot("");

const unicornQuestion = new StatelessQuestion("unicorns", (ctx) => {
  console.log("Користувач вважає, що єдинороги роблять:", ctx.message);
});

// Не забуваємо використати проміжний обробник.
bot.use(unicornQuestion.middleware());

bot.command("rainbows", async (ctx) => {
  let text;
  if (ctx.session.language === "de") {
    text = "Was machen Einhörner?";
  } else {
    text = "Що роблять єдинороги?";
  }

  return unicornQuestion.replyWithMarkdown(ctx, text);
});

// Або надішліть своє питання вручну, але обовʼязково використовуйте `parse_mode` та `force_reply`!
bot.command("unicorn", async (ctx) => {
  await ctx.replyWithMarkdown(
    "Що роблять єдинороги?" + unicornQuestion.messageSuffixMarkdown(),
    { parse_mode: "Markdown", reply_markup: { force_reply: true } },
  );
});
bot.command("unicorn", async (ctx) => {
  await ctx.replyWithHTML(
    "Що роблять єдинороги?" + unicornQuestion.messageSuffixHTML(),
    { parse_mode: "HTML", reply_markup: { force_reply: true } },
  );
});
```

Для отримання додаткової інформації дивіться [README в репозиторії плагіну](https://github.com/grammyjs/stateless-question).

## Загальні відомості про плагін

- Назва: `stateless-question`
- Джерело: <https://github.com/grammyjs/stateless-question>
