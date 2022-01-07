# Emoji Plugin (`emoji`)

With this plugin, you can easily insert emojis on your replies searching for them and inserting text instead of manually copying an emoji from web or Telegram and pasting at your code.

## Installing and examples

You can install this plugin on your bot like this:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>
    ```ts
      import { EmojiFlavor, emojiParser } from "@grammyjs/emoji";

      type FlavoredContext =
        & Context // You can pass your own context here
        & EmojiFlavor;
      const bot = new Bot<FlavoredContext>('<your token>');

      bot.use(emojiParser());
    ```

  </CodeGroupItem>
  <CodeGroupItem title="JavaScript">
    ```js
      const { emojiParser } = require("@grammyjs/emoji")

      const bot = new Bot('<your token>');

      bot.use(emojiParser());
    ```

  </CodeGroupItem>
  <CodeGroupItem title="Deno">
    ```ts
      import { EmojiFlavor, emojiParser } from "https://deno.land/x/grammy-emoji/src/mod.ts";

      const bot = new Bot('<your token>');

      bot.use(emojiParser());
    ```

  </CodeGroupItem>
</CodeGroup>

And you can get emojis in your replies like this:

```js
bot.command("start", async (ctx) => {
  await ctx.reply(ctx.emoji`Welcome! ${"smiling_face_with_sunglasses"}`);
});
```

Notice two things:

1. `ctx.emoji` and `ctx.replyWithEmoji` **ALWAYS** use template strings.
2. The emojis you want goes inside `${"templates"}`.

## Plugin Summary

- Name: `emoji`
- Source: <https://github.com/grammyjs/emoji>
- Reference: TBD
