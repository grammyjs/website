# Internationalization with Fluent (`fluent`)

[Fluent](https://projectfluent.org/) is a localization system made by the Mozilla Foundation for natural-sounding translations.
It has a very powerful and elegant syntax that lets anyone write efficient and fully-understandable translations.
This plugin takes advantage of this amazing localization system to make grammY-powered bots fluent with high-quality translations.

::: tip Not to be confused
Don't confuse this with [i18n](./i18n.md).

[i18n](./i18n.md) is an improved version of this plugin that works on both Deno and Node.js.
:::

## Initialize Fluent

The first thing you do is to initialize a Fluent instance:

```typescript
import { Fluent } from "@moebius/fluent";

const fluent = new Fluent();
```

Then, you will need to add at least one translation to the Fluent instance:

```typescript
await fluent.addTranslation({
  // Specify one or more locales supported by your translation:
  locales: "en",

  // You can specify the translation content directly:
  source: "{YOUR TRANSLATION FILE CONTENT}",

  // Or the translation files:
  filePath: [
    `${__dirname}/feature-1/translation.en.ftl`,
    `${__dirname}/feature-2/translation.en.ftl`,
  ],

  // All the aspects of Fluent are highly configurable:
  bundleOptions: {
    // Use this option to avoid invisible characters around placeables.
    useIsolating: false,
  },
});
```

## Write Translation Messages

The Fluent syntax should be easy to master.
You can start by looking at the [official examples](https://projectfluent.org/#examples) or by studying the [comprehensive syntax guide](https://projectfluent.org/fluent/guide/).

Let's start with this example for now:

```ftl
-bot-name = Apples Bot

welcome =
  Welcome, {$name}, to the {-bot-name}!
  You have { NUMBER($applesCount) ->
    [0] no apples
    [one] {$applesCount} apple
    *[other] {$applesCount} apples
  }.
```

It demonstrates three important features of Fluent, namely: **terms**, **variable substitution** (aka _placeables_) and **pluralization**.

The `welcome` is the **message ID**, which will be used to reference its message whenever render it.

The statement `-bot-name = Apples Bot` defines a **term** with name `bot-name` and value `Apples Bot`.
The construct `{-bot-name}` references the previously defined term and will be get replaced by the term's value when rendered.

The statement `{$name}` will be replaced with the value of the `name` variable that you will need to pass to the translation function yourself.

And the final statement (_lines 5 to 9_) defines a **selector** (very similar to a switch statement) that takes result of the special `NUMBER` function applied to the `applesCount` variable and selects one of the three possible messages to be rendered based on the matched value.
The `NUMBER` function will return a [CLDR plural category](https://www.unicode.org/cldr/cldr-aux/charts/30/supplemental/language_plural_rules.html) based on the provided value and the used locale.
This effectively implements the pluralization.

## grammY Configuration

Now let's see how this message above could be rendered by a bot.
But first, we will need to configure grammY to use the plugin.

Before all else, you will need to configure your bot to use the Fluent context flavor.
If you are not familiar with this concept, you should read the official docs on [Context Flavors](../guide/context.md#context-flavors).

```typescript
import { Context } from "grammy";
import { FluentContextFlavor } from "@grammyjs/fluent";

// Extend your application context type with the provided flavor interface.
export type MyAppContext = Context & FluentContextFlavor;
```

You will need to create your bot instance the following way in order to use the augmented context type:

```typescript
const bot = new Bot<MyAppContext>();
```

And the final step would be to register the Fluent plugin itself with grammY:

```typescript
bot.use(
  useFluent({
    fluent,
  })
);
```

Make sure to pass the [previously created Fluent instance](#initialize-fluent).

## Render the Localized Messages

Great, now we have everything in place to render our messages!
Let's do that by defining a test command in our bot:

```typescript
bot.command("i18n_test", async (ctx) => {
  // Call the "translate" or "t" helper to render the
  // message by specifying its ID and additional parameters:
  await ctx.reply(
    ctx.t("welcome", {
      name: ctx.from.first_name,
      applesCount: 1,
    })
  );
});
```

Now you can start your bot and use the `/i18n_test` command.
It should render the following message:

```text:no-line-numbers
Welcome, Slava, to the Apples Bot!
You have 1 apple.
```

Of course, you will see you own name instead of "Slava".
Try to change the value of the `applesCount` variable to see how the rendered message would change!

Be advised that you can now use the translation function everywhere where the `Context` is available.
The library would automatically determine the best possible locale to use for each user that will interact with your bot based on their personal preferences (the language set in the Telegram client settings).
You will just need to create several translation files and make sure that all the translation are properly synchronized.

## Further Steps

- Complete reading the [Fluent documentation](https://projectfluent.org/), especially the [syntax guide](https://projectfluent.org/fluent/guide/).
- [Migrate from the `i18n` plugin.](https://github.com/grammyjs/fluent#i18n-plugin-replacement)
- Familiarize yourself with [`@moebius/fluent`](https://github.com/the-moebius/fluent#readme).

## Plugin Summary

- Name: `fluent`
- Source: <https://github.com/grammyjs/fluent>
