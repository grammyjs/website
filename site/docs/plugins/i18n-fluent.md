
# Internationalization with Fluent

[Fluent](https://projectfluent.org/) is a localization system for natural-sounding translations created and maintained by Mozilla Foundation.
It has a very powerful and elegant syntax that lets anyone write efficient and fully-understandable translations.
Thanks to the [grammY Fluent integration plugin](https://github.com/grammyjs/fluent) you can easily translate your bot to multiple languages using industry best practices like variable substitution, pluralization, locale negotiation, conditional messages and message reuse.


## Install

Install the dependencies:

```shell
npm install --save @grammyjs/fluent @moebius/fluent
```

grammY Fluent is built on top of the `@moebius/fluent` package, so you will need to install it as well.
Also, it is highly advisable to read the documentation of the [original library](https://github.com/the-moebius/fluent#moebiusfluent).


## Instantiate Fluent

The next step would be to create a Fluent instance:

```typescript
import { Fluent } from '@moebius/fluent';

const fluent = new Fluent();
```

Then, you will need to add at least one translation to the Fluent instance:

```typescript
await fluent.addTranslation({
  
  // Specify locale supported by your translation,
  // you can specify multiple locales if you want
  locales: 'en',
  
  // You can specufy the translation content directly:
  source: '{YOUR TRANSLATION FILE CONTENT}',

  // OR you can specify a path to translation file or multiple files:
  filePath: [
    `${__dirname}/feature-1/translation.en.ftl`,
    `${__dirname}/feature-2/translation.en.ftl`
  ],

  // All the aspects of Fluent are highly configurable
  bundleOptions: {
    // Use this option to avoid invisible characters
    // around placeables
    useIsolating: false,
  },
  
});
```


## Write translation messages

Translation file syntax should be easy to master.
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

It demonstrates three important features of Fluent, namely: **terms**, **variable substitution** (aka *placeables*) and **pluralization**.

The `welcome` is the **message ID**, you will use it to reference this translation message when you will need to render it.

The `-bot-name = Apples Bot` statement defines a **term** with name: `bot-name` and value: `Apples Bot`.
The `{-bot-name}` construct references the previously defined term and will be automatically replaced by the term's value when rendered.

The `{$name}` statement will be replaced with the value of the `name` variable that you will need to pass to the translation function yourself.

And the final statement (*lines 5 to 9*) defines a **selector** (very similar to a switch statement) that takes result of the special `NUMBER` function applied to the `applesCount` variable and selects one of the three possible messages to be rendered based on the matched value.
The `NUMBER` function will return a [CLDR plural category](https://www.unicode.org/cldr/cldr-aux/charts/30/supplemental/language_plural_rules.html) based on the provided value and the used locale.
This effectively implements the pluralization.


## grammY Configuration

Now, let's see how this message above could be rendered by a bot.
But first, we will need to configure grammY to use the plugin.

Before all else, you will need to configure your bot to use the Fluent context flavor.
By the way, if you are not familiar with this concept, you should read the official docs on [Context Flavors](/guide/context.html#context-flavors).

```typescript
import { Context } from 'grammy';
import { FluentContextFlavor } from '@grammyjs/fluent';

// Extend your application context type with the provided
// flavor interface
export type MyAppContext = (
  & Context
  & FluentContextFlavor
);
```

You will need to create you bot instance the following way in order to use the augmented context type:

```typescript
const bot = new Bot<MyAppContext>();
```

And the final step would be to register the Fluent plugin itself with grammY:

```typescript
// Add fluent middleware to the bot
bot.use(useFluent({
  fluent,
}));
```

Just make sure to pass the [previously created](#instantiate-fluent) Fluent instance.


## Render the Localized Messages

Great, now we have everything in place to render our translated message!
Let's do just that by defining a test command in our bot:

```typescript
bot.command('i18n_test', async context => {

  // Call the "translate" or "t" helper to render the
  // message by specifying it's ID and
  // additional parameters:
  await context.reply(context.t('welcome', {
    name: context.from.first_name,
    applesCount: 1,
  }));

});
```

Now, you can start your bot and use the `/i18n_test` command.
It should render the following message:

```text
Welcome, Slava, to the Apples Bot!
You have 1 apple.
```

Of course, you will see you own name instead of `Slava`.
Try to change the value of the `applesCount` variable to see how the rendered message would change!

Be advised, that you can now use the translation function everywhere where the `Context` is available.
The library would automatically determine the best possible locale to use for each user that will interact with your bot based on their personal preferences (the language set in the Telegram client settings).
You will just need to create several translation files and make sure that all the translation are properly synchronized.


## Further Steps

- read the [project Fluent](https://projectfluent.org/) documentation, especially the [syntax guide](https://projectfluent.org/fluent/guide/)
- familiarize yourself with the [@moebius/fluent](https://github.com/the-moebius/fluent#readme) package documentation
- study the dedicated grammY Fluent [plugin documentation](https://github.com/grammyjs/fluent)
- want to replace the original [i18n](/plugins/i18n.md) plugin? Read the corresponding [cookbook recipe](https://github.com/grammyjs/fluent#i18n-plugin-replacement)
- have questions? Ask in the [grammY Telegram chat](https://t.me/grammyjs) (use the `@slavafomin` tag)
