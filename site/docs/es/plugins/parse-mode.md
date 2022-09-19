# Parse Mode Plugin (`parse-mode`)

![Oficial](/badges/official-es.svg) ![Deno](/badges/deno.svg) ![Node.js](/badges/nodejs.svg)

Este plugin proporciona un transformador para establecer el `parse_mode` por defecto, y un middleware para hidratar el `Context` con los métodos variantes familiares de `reply` - es decir, `replyWithHTML`, `replyWithMarkdown`, etc.

## Uso

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot } from "grammy";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";

import type { ParseModeContext } from "@grammyjs/parse-mode";

const bot = new Bot<ParseModeContext>("");

// Usa el plugin.
bot.use(hydrateReply);

// Establece el parse_mode por defecto para ctx.reply
bot.api.config.use(parseMode("MarkdownV2"));

bot.command("demo", async (ctx) => {
  await ctx.reply(
    "*Esta* respuesta utiliza _MarkdownV2_ como `formato` por defecto",
  );
  await ctx.replyWithHTML(
    "<b>Este</b> es el <code>formato</code> <i>conHTML</i>",
  );
  await ctx.replyWithMarkdown("*Este* es el `formato` _conMarkdown_");
  await ctx.replyWithMarkdownV1("*Este* es el `formato` _conMarkdownV1_");
  await ctx.replyWithMarkdownV2("*Este* es el `formato` _conMarkdownV2_");
});

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { Bot } = require("grammy");
const { hydrateReply, parseMode } = require("@grammyjs/parse-mode");

const bot = new Bot("");

// Usa el plugin.
bot.use(hydrateReply);

// Establece el `parse_mode` por defecto de `ctx.reply`.
bot.api.config.use(parseMode("MarkdownV2"));

bot.command("demo", async (ctx) => {
  await ctx.reply(
    "*Esta* respuesta utiliza _MarkdownV2_ como `formato` por defecto",
  );
  await ctx.replyWithHTML(
    "<b>Este</b> es el <code>formato</code> <i>conHTML</i>",
  );
  await ctx.replyWithMarkdown("*Este* es el `formato` _conMarkdown_");
  await ctx.replyWithMarkdownV1("*Este* es el `formato` _conMarkdownV1_");
  await ctx.replyWithMarkdownV2("*Este* es el `formato` _conMarkdownV2_");
});

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import {
  hydrateReply,
  parseMode,
} from "https://deno.land/x/grammy_parse_mode/mod.ts";

import type { ParseModeContext } from "https://deno.land/x/grammy_parse_mode/mod.ts";

const bot = new Bot<ParseModeContext>("");

// Usa el plugin.
bot.use(hydrateReply);

// Establece el `parse_mode` por defecto de `ctx.reply`.
bot.api.config.use(parseMode("MarkdownV2"));

bot.command("demo", async (ctx) => {
  await ctx.reply(
    "*Esta* respuesta utiliza _MarkdownV2_ como `formato` por defecto",
  );
  await ctx.replyWithHTML(
    "<b>Este</b> es el <code>formato</code> <i>conHTML</i>",
  );
  await ctx.replyWithMarkdown("*Este* es el `formato` _conMarkdown_");
  await ctx.replyWithMarkdownV1("*Este* es el `formato` _conMarkdownV1_");
  await ctx.replyWithMarkdownV2("*Este* es el `formato` _conMarkdownV2_");
});

bot.start();
```

</CodeGroupItem>
</CodeGroup>

## Resumen del plugin

- Nombre: `parse-mode`
- Fuente: <https://github.com/grammyjs/parse-mode>
- Referencia: <https://doc.deno.land/https://deno.land/x/grammy_parse_mode/mod.ts>
