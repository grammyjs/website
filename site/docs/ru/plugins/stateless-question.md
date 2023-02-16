# TODO translate to Russian

# Stateless Question (`stateless-question`)

> Create stateless questions to Telegram users working in privacy mode

You want to keep the privacy of the user with [Telegrams privacy mode enabled (by default)](https://core.telegram.org/bots/features#privacy-mode), send users translated questions in their language and don't save the state what users are currently doing?

This plugin wants to solve this problem.

The basic idea is to send your question with a [special text](https://en.wikipedia.org/wiki/Zero-width_non-joiner) at the end.
This text is invisible to the user but still visible for your bot.
When the user replies to a message, the message is checked.
If it is containing this special text at the end, then it is an answer to the question.
This way you can have many strings for the same questions as when having translations.
You only have to make sure the `uniqueIdentifier` is unique within your bot.

## Usage

```ts
import { StatelessQuestion } from "@grammyjs/stateless-question";

const bot = new Bot(token);

const unicornQuestion = new StatelessQuestion("unicorns", (ctx) => {
  console.log("User thinks unicorns are doing:", ctx.message);
});

// Don't forget to use the middleware.
bot.use(unicornQuestion.middleware());

bot.command("rainbows", async (ctx) => {
  let text;
  if (ctx.session.language === "de") {
    text = "Was machen Einhörner?";
  } else {
    text = "What are unicorns doing?";
  }

  return unicornQuestion.replyWithMarkdown(ctx, text);
});

// Or send your question manually (make sure to use a parse_mode and force_reply!).
bot.command("unicorn", async (ctx) => {
  await ctx.replyWithMarkdown(
    "What are unicorns doing?" + unicornQuestion.messageSuffixMarkdown(),
    { parse_mode: "Markdown", reply_markup: { force_reply: true } },
  );
});
bot.command("unicorn", async (ctx) => {
  await ctx.replyWithHTML(
    "What are unicorns doing?" + unicornQuestion.messageSuffixHTML(),
    { parse_mode: "HTML", reply_markup: { force_reply: true } },
  );
});
```

See the [plugin repo README](https://github.com/grammyjs/stateless-question) for more information.

## Plugin Summary

- Name: `stateless-question`
- Source: <https://github.com/grammyjs/stateless-question>
