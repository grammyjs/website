# Always Replying to Messages

Sometimes, especially for bots that are meant to be used in groups, it is necessary to always send messages as a reply (or quote) to the message that started the interaction.
Usually, the way to do that is to mannualy add `reply_to_message_id` to the params of the method that sends the message (`sendText` / `reply`, `sendPhoto` / `replyWithPhoto`).
However, if you're doing this for every message, it can get a bit messy and tiring.

This plugin sets the value of `reply_to_message_id` param to `ctx.msg.message_id` for every `send` method (except for `sendChatAction`, which does not support this parameter), thus making every message a reply to the message that triggered that update.

## Usage

### For a Single Route

Use this if you want all messages sent from within a specific context (like a specific command) to

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

    ```ts
    import { Bot } from "grammy";
    import { addReplyParam } from "@roziscoding/grammy-autoquote";

    const bot = new Bot("");

    bot.command("demo", async (ctx) => {
      ctx.api.config.use(addReplyParam(ctx));
      await ctx.reply("Demo command!"); // This will quote the user's message
    });

    bot.start();
    ```

  </CodeGroupItem>
  <CodeGroupItem title="JavaScript">

    ```ts
    const { Bot } = require("grammy");
    const { addReplyParam } = require("@roziscoding/grammy-autoquote");

    const bot = new Bot("");

    bot.command("demo", async (ctx) => {
      ctx.api.config.use(addReplyParam(ctx));
      await ctx.reply("Demo command!"); // This will quote the user's message
    });

    bot.start();
    ```

  </CodeGroupItem>
  <CodeGroupItem title="Deno">

    ```ts
    import { Bot } from "https://deno.land/x/grammy/mod.ts";
    import { addReplyParam } from "https://deno.land/x/grammy_autoquote/mod.ts";

    const bot = new Bot("");

    bot.command("demo", async (ctx) => {
      ctx.api.config.use(addReplyParam(ctx));
      await ctx.reply("Demo command!"); // This will quote the user's message
    });

    bot.start();
    ```

  </CodeGroupItem>
</CodeGroup>

### Usage for Every Route

Use this if you want absolutelly every possible message sent from your bot to quote the triggering message.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

    ```ts
    import { Bot } from "grammy";
    import { autoQuote } from "@roziscoding/grammy-autoquote";
    
    const bot = new Bot("");
    
    bot.use(autoQuote);
    
    bot.command("demo", async (ctx) => {
      await ctx.reply("Demo command!"); // This will quote the user's message
    });
    
    bot.command("hello", async (ctx) => {
      await ctx.reply("Hi there :)"); // Also quotes the user's message
    });
    
    bot.start();
    ```

  </CodeGroupItem>
  <CodeGroupItem title="JavaScript">

    ```ts
    const { Bot } = require("grammy");
    const { autoQuote } = require("@roziscoding/grammy-autoquote");
    
    const bot = new Bot("");
    
    bot.use(autoQuote);
    
    bot.command("demo", async (ctx) => {
      await ctx.reply("Demo command!"); // This will quote the user's message
    });
    
    bot.command("hello", async (ctx) => {
      await ctx.reply("Hi there :)"); // Also quotes the user's message
    });
    
    bot.start();
    ```

  </CodeGroupItem>
  <CodeGroupItem title="Deno">

    ```ts
    import { Bot } from "https://deno.land/x/grammy/mod.ts";
    import { autoQuote } from "https://deno.land/x/grammy_autoquote/mod.ts";
    
    const bot = new Bot("");
    
    bot.use(autoQuote);
    
    bot.command("demo", async (ctx) => {
      await ctx.reply("Demo command!"); // This will quote the user's message
    });
    
    bot.command("hello", async (ctx) => {
      await ctx.reply("Hi there :)"); // Also quotes the user's message
    });
    
    bot.start();
    ```

  </CodeGroupItem>
</CodeGroup>

## Plugin Summary

- Name: Autoquote
- Source: <https://github.com/roziscoding/grammy-autoquote>
- Reference: <https://doc.deno.land/https://deno.land/x/grammy_autoquote/mod.ts>
