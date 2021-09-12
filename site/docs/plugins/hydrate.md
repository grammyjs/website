# Hydration plugin for grammY

This plugin installs useful methods on two types of objects, namely

1. the results of API calls, and
2. the objects on the context object `ctx`.

Instead of having to call `ctx.api` or `bot.api` and having to supply all sorts of identifiers, you can now just call methods on objects and they will just work.
This is best illustrated by an example.

**WITHOUT** this plugin:

```ts
bot.on(":photo", async (ctx) => {
  const statusMessage = await ctx.reply("Processing");
  await doWork(ctx.photo); // some long image processing
  await ctx.api.editMessageText(statusMessage.message_id, "Done!");
  setTimeout(
    () =>
      ctx.api.deleteMessage(statusMessage.message_id).catch(() => {
        // do nothing on error
      }),
    3000
  );
});
```

**WITH** this plugin:

```ts
bot.on(":photo", async (ctx) => {
  const statusMessage = await ctx.reply("Processing");
  await doWork(ctx.photo); // some long image processing
  await statusMessage.editText("Done!"); // so easy!
  setTimeout(() => statusMessage.delete().catch(() => {}), 3000);
});
```

Neat, right?

## Installation

There are two ways to install this plugin.

### Simple installation

This plugin can be installed in a straightforward way that should be enough for most users.

<CodeGroup>
  <CodeGroupItem title="TS" active>

```ts
import { Bot, Context } from "grammy";
import { hydrate, HydrateFlavor } from "@grammyjs/hydrate";

type MyContext = HydrateFlavor<Context>;

const bot = new Bot<MyContext>("");

bot.use(hydrate());
```

 </CodeGroupItem>
 <CodeGroupItem title="JS">

```js
import { Bot } from "grammy";
import { hydrate } from "@grammyjs/hydrate";

const bot = new Bot("");

bot.use(hydrate());
```

 </CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  hydrate,
  HydrateFlavor,
} from "https://deno.land/x/grammy_hydrate/mod.ts";

type MyContext = HydrateFlavor<Context>;

const bot = new Bot<MyContext>("");

bot.use(hydrate());
```

 </CodeGroupItem>
</CodeGroup>

### Advanced installation

When using the simple installation, only the API call results that go through `ctx.api` will be hydrated, e.g. `ctx.reply`.
These are most calls for most bots.

However, some bots may need to make calls to `bot.api`.
In this case, you should use this advanced installation.

It will integrate context hydration and API call result hydration separately into your bot.
Note that you now also have to install an [API flavour](/advanced/transformers.html#api-flavouring).

<CodeGroup>
  <CodeGroupItem title="TS" active>

```ts
import { Api, Bot, Context } from "grammy";
import {
  hydrateContext,
  HydrateFlavor,
  hydrateApi,
  HydrateApiFlavor,
} from "@grammyjs/hydrate";

type MyContext = HydrateFlavor<Context>;
type MyApi = HydrateApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");

bot.use(hydrateContext());
bot.api.config.use(hydrateApi());
```

 </CodeGroupItem>
 <CodeGroupItem title="JS">

```js
import { Bot } from "grammy";
import { hydrateContext, hydrateApi } from "@grammyjs/hydrate";

const bot = new Bot("");

bot.use(hydrateContext());
bot.api.config.use(hydrateApi());
```

 </CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Api, Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  hydrateContext,
  HydrateFlavor,
  hydrateApi,
  HydrateApiFlavor,
} from "https://deno.land/x/grammy_hydrate/mod.ts";

type MyContext = HydrateFlavor<Context>;
type MyApi = HydrateApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");

bot.use(hydrateContext());
bot.api.config.use(hydrateApi());
```

 </CodeGroupItem>
</CodeGroup>

## What objects are hydrated

This plugin currently hydrates

- messages and channel posts
- edited messages and edited channel posts
- callback queries
- inline queries
- pre-checkout and shipping queries

All objects are hydrated on

- the context object `ctx`,
- the update object `ctx.update` inside the context,
- shortcuts on the context object such as `ctx.msg`, and
- API call results where applicable.

## Plugin summary

- Name: `hydrate`
- Source: <https://github.com/grammyjs/hydrate>
- Reference: <https://doc.deno.land/https/deno.land/x/grammy_hydrate/mod.ts>
