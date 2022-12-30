# Parsear (`parse-mode`)

Este plugin proporciona un transformador para establecer el `parse_mode` por defecto, y un middleware para hidratar el `Context` con los métodos variantes familiares de `reply` - es decir, `replyWithHTML`, `replyWithMarkdown`, etc.

## Uso (Mejorar la experiencia de formateo)

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context } from "grammy";
import { bold, fmt, hydrateReply, italic, link } from "@grammyjs/parse-mode";

import type { ParseModeFlavor } from "@grammyjs/parse-mode";

const bot = new Bot<ParseModeFlavor<Context>>("");

// Instalar el plugin.
bot.use(hydrateReply);

bot.command("demo", async (ctx) => {
  await ctx.replyFmt(fmt`${bold("negrita!")}
${bold(italic("ambas!"))}
${bold(fmt`negrita ${link("blink", "example.com")} negrita`)}`);

  // fmt también puede ser llamada como cualquier otra función.
  await ctx.replyFmt(
    fmt(
      ["", " and ", " and ", ""],
      fmt`${bold("negrita")}`,
      fmt`${bold(italic("ambas"))}`,
      fmt`${italic("cursiva")}`,
    ),
  );
});

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { Bot, Context } = require("grammy");
const { bold, fmt, hydrateReply, italic, link } = require(
  "@grammyjs/parse-mode",
);

const bot = new Bot("");

// Instalar el plugin.
bot.use(hydrateReply);

bot.command("demo", async (ctx) => {
  await ctx.replyFmt(fmt`${bold("negrita!")}
${bold(italic("ambas!"))}
${bold(fmt`negrita ${link("blink", "example.com")} negrita`)}`);

  // fmt también puede ser llamada como cualquier otra función.
  await ctx.replyFmt(
    fmt(
      ["", " and ", " and ", ""],
      fmt`${bold("negrita")}`,
      fmt`${bold(italic("ambas"))}`,
      fmt`${italic("cursiva")}`,
    ),
  );
});

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  bold,
  fmt,
  hydrateReply,
  italic,
  link,
} from "https://deno.land/x/grammy_parse_mode/mod.ts";

import type { ParseModeFlavor } from "https://deno.land/x/grammy_parse_mode/mod.ts";

const bot = new Bot<ParseModeFlavor<Context>>("");

// Instalar el plugin.
bot.use(hydrateReply);

bot.command("demo", async (ctx) => {
  await ctx.replyFmt(fmt`${bold("negrita!")}
${bold(italic("ambas!"))}
${bold(fmt`negrita ${link("blink", "example.com")} negrita`)}`);

  // fmt también puede ser llamada como cualquier otra función.
  await ctx.replyFmt(
    fmt(
      ["", " and ", " and ", ""],
      fmt`${bold("negrita")}`,
      fmt`${bold(italic("ambas"))}`,
      fmt`${italic("cursiva")}`,
    ),
  );
});

bot.start();
```

</CodeGroupItem>
</CodeGroup>

## Uso (modo de análisis sintáctico por defecto y métodos de respuesta)

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Composer, Context } from "grammy";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";

import type { ParseModeFlavor } from "@grammyjs/parse-mode";

const bot = new Bot<ParseModeFlavor<Context>>("");

// Instalar el plugin.
bot.use(hydrateReply);

// Establece el modo de formateo por defecto de `ctx.reply`.
bot.api.config.use(parseMode("MarkdownV2"));

bot.command("demo", async (ctx) => {
  await ctx.reply(
    "*Este* es _el_ `formato` por defecto",
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
const { Bot, Composer, Context } = require("grammy");
const { hydrateReply, parseMode } = require("@grammyjs/parse-mode");

const bot = new Bot("");

// Instalar el plugin.
bot.use(hydrateReply);

// Establece el modo de formateo por defecto de `ctx.reply`.
bot.api.config.use(parseMode("MarkdownV2"));

bot.command("demo", async (ctx) => {
  await ctx.reply(
    "*Este* es _el_ `formato` por defecto",
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
import { Bot, Composer, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  hydrateReply,
  parseMode,
} from "https://deno.land/x/grammy_parse_mode/mod.ts";

import type { ParseModeFlavor } from "https://deno.land/x/grammy_parse_mode/mod.ts";

const bot = new Bot<ParseModeFlavor<Context>>("");

// Instalar el plugin.
bot.use(hydrateReply);

// Establece el modo de formateo por defecto de `ctx.reply`.
bot.api.config.use(parseMode("MarkdownV2"));

bot.command("demo", async (ctx) => {
  await ctx.reply(
    "*Este* es _el_ `formato` por defecto",
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
- Referencia: <https://deno.land/x/grammy_parse_mode/mod.ts>
