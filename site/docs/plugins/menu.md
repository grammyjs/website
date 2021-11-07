# Interactive Menus (`menu`)

Easily create interactive menus.
Note that this plugin has not reached 1.0 yet, so breaking changes may occur.

## Introduction

An inline keyboard is an array of buttons underneath a message.
grammY has [a built-in plugin](./keyboard.md#inline-keyboards) to create basic inline keybaords.

The menu plugin takes this idea further and lets you create rich, interactive menus right inside the chat.

Here is a simple example that speaks for itself.

<CodeGroup>
  <CodeGroupItem title="TS" active>

```ts
import { Bot } from "grammy";
import { Menu } from "@grammyjs/menu";

// Create bot
const bot = new Bot("token");

// Creating a simple menu
const menu = new Menu("my-menu-identifier")
  .text("A", (ctx) => ctx.reply("You pressed A!")).row()
  .text("B", (ctx) => ctx.reply("You pressed B!"));

// Make it interactive
bot.use(menu);

bot.command("start", async (ctx) => {
  // Send the menu:
  await ctx.reply("Check out this menu:", { reply_markup: menu });
});

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JS">

```js
const { Bot } = require("grammy");
const { Menu } = require("@grammyjs/menu");

// Create bot
const bot = new Bot("token");

// Creating a simple menu
const menu = new Menu("my-menu-identifier")
  .text("A", (ctx) => ctx.reply("You pressed A!")).row()
  .text("B", (ctx) => ctx.reply("You pressed B!"));

// Make it interactive
bot.use(menu);

bot.command("start", async (ctx) => {
  // Send the menu:
  await ctx.reply("Check out this menu:", { reply_markup: menu });
});

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { Menu } from "https://deno.land/x/grammy_menu/mod.ts";

// Create bot
const bot = new Bot("token");

// Creating a simple menu
const menu = new Menu("my-menu-identifier")
  .text("A", (ctx) => ctx.reply("You pressed A!")).row()
  .text("B", (ctx) => ctx.reply("You pressed B!"));

// Make it interactive
bot.use(menu);

bot.command("start", async (ctx) => {
  // Send the menu:
  await ctx.reply("Check out this menu:", { reply_markup: menu });
});

bot.start();
```

</CodeGroupItem>
</CodeGroup>

Here are some tentative docs to get you started.
A full documentation will be published when this plugin reaches a stable version 1.0.

## Adding Buttons

Works like the inline keybaord plugin.

TODO: explain button types, and give code example

## Dynamic Labels

Basically everywhere you can pass a string, you can also pass `(ctx: Context) => string` to get a dynamic label or so.

TODO: say where this is possible, and give code examples

## Navigation Between Menus

1. Register a menu using `menuA.register(menuB)`
2. Access it again using `menuA.at('menu-b-identifier')`
3. Either simply send a menu instance as `reply_markup`, or
4. use `ctx.menu.nav('menu-b-identifier')`, or
5. use `menuA.submenu('go down!', 'menu-b-identifier')` to perform navigation.

TODO: code examples, explain differences, explain lazy navigation, mention immediate mode

## Backwards Navigation

Use `ctx.menu.back()` or `menuA.back()`.

TODO: code examples

## Payloads

You can store short text along with all text and navigation buttons.
Use them in your handlers from `ctx.match`.

TODO: what problem does this solve, and give code examples

## Dynamic Ranges

Use `menuA.dynamic` to add a dynamic number of buttons.
Use a `MenuRange` for this.

TODO: how does it work, what the hell happens under the hood, code examples

## Outdated Menus and Fingerprints

We have a heuristic to check if the menu is outdated.
Read the API reference to see config.

TODO: explain the problem and the solution, mention shortcomings, explain config

## Plugin Summary

- Name: `menu`
- Source: <https://github.com/grammyjs/menu>
- Reference: <https://doc.deno.land/https/deno.land/x/grammy_menu/mod.ts>
