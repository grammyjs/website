---
prev: false
next: false
---

# Вопросы без состояния (`stateless-question`)

> Создание вопросов без статичности для пользователей Telegram, работающих в
> режиме конфиденциальности

Вы хотите сохранить конфиденциальность пользователя с помощью
[включённого режима приватности Telegram (по умолчанию)](https://core.telegram.org/bots/features#privacy-mode),
отправлять пользователям переведенные вопросы на их язык и не сохранять
информацию о том, что пользователи делают в данный момент?

Этот плагин призван решить эту проблему.

Основная идея заключается в том, чтобы отправить свой вопрос с
[специальным текстом](https://en.wikipedia.org/wiki/Zero-width_non-joiner) в
конце. Этот текст невидим для пользователя, но виден для бота. Когда
пользователь отвечает на сообщение, оно проверяется. Если оно содержит этот
специальный текст в конце, значит, это ответ на вопрос. Таким образом, вы можете
иметь много строк для одних и тех же вопросов, как и в случае с переводами. Вам
нужно только убедиться, что `uniqueIdentifier` уникален в пределах вашего бота.

## Использование

```ts
import { StatelessQuestion } from "@grammyjs/stateless-question";

const bot = new Bot("");

const unicornQuestion = new StatelessQuestion("unicorns", async (ctx) => {
  console.log("Пользователь считает, что единороги делают:", ctx.message);
});

// Не забудьте использовать middleware.
bot.use(unicornQuestion.middleware());

bot.command("rainbows", async (ctx) => {
  let text;
  if (ctx.session.language === "de") {
    text = "Was machen Einhörner?";
  } else {
    text = "Что делают единороги?";
  }

  return unicornQuestion.replyWithMarkdown(ctx, text);
});

// Или отправьте свой вопрос вручную (обязательно используйте parse_mode и force_reply!).
bot.command("unicorn", async (ctx) => {
  await ctx.replyWithMarkdown(
    "Что делают единороги?" + unicornQuestion.messageSuffixMarkdown(),
    { parse_mode: "Markdown", reply_markup: { force_reply: true } },
  );
});
bot.command("unicorn", async (ctx) => {
  await ctx.replyWithHTML(
    "Что делают единороги?" + unicornQuestion.messageSuffixHTML(),
    { parse_mode: "HTML", reply_markup: { force_reply: true } },
  );
});
```

Дополнительную информацию см. в
[README репозитория плагина](https://github.com/grammyjs/stateless-question).

## Краткая информация о плагине

- Название: `stateless-question`
- [Исходник](https://github.com/grammyjs/stateless-question)
