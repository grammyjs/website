# Інтернаціоналізація за допомогою Fluent (`fluent`)

[Fluent](https://projectfluent.org/) - це система локалізації, створена Mozilla Foundation для створення перекладів з природнім звучанням.
Вона має дуже потужний та вишуканий синтаксис, який дозволяє будь-кому писати ефективні та повністю зрозумілі переклади.
Цей плагін використовує переваги цієї дивовижної системи локалізації, щоб зробити ботів, створених за допомогою grammY, здатними використовувати високоякісні переклади.

::: tip Не плутайте
Не плутайте це з [i18n](./i18n.md).

[i18n](./i18n.md) - покращена версія цього плагіна, яка працює на Deno та Node.js.
:::

## Ініціалізація Fluent

Насамперед ініціалізуйте екземпляр Fluent:

```ts
import { Fluent } from "@moebius/fluent";

const fluent = new Fluent();
```

Потім вам потрібно буде додати принаймні один переклад до екземпляра Fluent:

```ts
await fluent.addTranslation({
  // Вказуємо одну або більше локалей, які підтримуються перекладом:
  locales: "en",

  // Також можемо вказати безпосередньо зміст перекладу:
  source: "{ВМІСТ ВАШОГО ФАЙЛУ ПЕРЕКЛАДУ}",

  // Або файли перекладу:
  filePath: [
    `${__dirname}/feature-1/translation.en.ftl`,
    `${__dirname}/feature-2/translation.en.ftl`,
  ],

  // Усі аспекти Fluent легко налаштовуються:
  bundleOptions: {
    // Використовуємо цю опцію, щоб уникнути невидимих символів навколо підставлених змінних.
    useIsolating: false,
  },
});
```

## Написання перекладів повідомлень

Синтаксис Fluent має бути простим у засвоєнні.
Ви можете почати з перегляду [офіційних прикладів](https://projectfluent.org/#examples) або з вивчення [повного посібника по синтаксису](https://projectfluent.org/fluent/guide/).

Давайте почнемо з цього прикладу:

```ftl
-bot-name = Apples Bot

welcome =
  Ласкаво просимо, {$name}, до {-bot-name}!
  У вас { NUMBER($applesCount) ->
    [0] немає яблук
    [one] є {$applesCount} яблуко
    [few] є {$applesCount} яблука
    *[other] є {$applesCount} яблук
  }.
```

Він демонструє три важливі особливості Fluent, а саме: **терміни**, **підставлення змінних** та **множинність**.

`welcome` - це **ідентифікатор повідомлення**, який використовуватиметься для посилання на його зміст під час рендерингу.

Вираз `-bot-name = Apples Bot` визначає **термін** з іменем `bot-name` і значенням `Apples Bot`.
Конструкція `{-bot-name}` посилається на попередньо визначений термін і буде замінена його значенням під час рендерингу.

Вираз `{$name}` буде замінено значенням змінної `name`, яке ви повинні будете передати функції перекладу самостійно.

І останній вираз _на рядках з 5-го по 10-й_ визначає **селектор**, який дуже схожий на вираз `switch`, який приймає результат спеціальної функції `NUMBER`, застосованої до змінної `applesCount`, і вибирає одне з трьох можливих повідомлень для перекладу на основі значення, що відповідає результату.
Функція `NUMBER` поверне [категорію множини CLDR](https://www.unicode.org/cldr/cldr-aux/charts/30/supplemental/language_plural_rules.html) на основі наданого значення і використаної локалі.
Це ефективно реалізує множину.

## Конфігурація grammY

Тепер давайте подивимося, як зробити рендеринг вищенаведеного повідомлення за допомогою бота.
Але спочатку нам потрібно налаштувати grammY на використання плагіна.

Передусім, вам потрібно налаштувати бота на використання розширювача для контексту з плагіну.
Якщо ви не знайомі з цією концепцією, вам слід прочитати офіційну документацію про [розширювач для контексту](../guide/context.md#розширювач-для-контексту).

```ts
import { Context } from "grammy";
import { FluentContextFlavor } from "@grammyjs/fluent";

// Розширимо тип контексту застосунку за допомогою наданого розширювача.
export type MyAppContext = Context & FluentContextFlavor;
```

Щоб використати розширений тип контексту, вам потрібно створити екземпляр бота наступним чином:

```ts
const bot = new Bot<MyAppContext>();
```

І завершальним кроком буде реєстрація самого плагіна Fluent у grammY:

```ts
bot.use(
  useFluent({
    fluent,
  }),
);
```

Не забудьте передати [раніше створений екземпляр Fluent](#ініціалізація-fluent).

## Рендеринг локалізованих повідомлень

Чудово, тепер у нас є все необхідне для рендерингу наших повідомлень!
Давайте зробимо це, визначивши тестову команду в боті:

```ts
bot.command("i18n_test", async (ctx) => {
  // Викличемо допоміжний метод "translate" або "t",
  // щоб зробити рендеринг повідомлення, вказавши його ідентифікатор та додаткові параметри:
  await ctx.reply(
    ctx.t("welcome", {
      name: ctx.from.first_name,
      applesCount: 1,
    }),
  );
});
```

Тепер ви можете запустити бота і скористатися командою `/i18n_test`.
Вона повинна вивести наступне повідомлення:

```text:no-line-numbers
Ласкаво просимо, Slava, до Apples Bot!
У вас є 1 яблуко.
```

Звичайно, ви побачите власне імʼя замість "Slava".
Спробуйте змінити значення змінної `applesCount`, щоб побачити, як зміниться рендер повідомлення!

Зауважте, що тепер ви можете використовувати функцію перекладу скрізь, де доступний `Context`.
Бібліотека автоматично визначить найкращу локалізацію для кожного користувача, який буде взаємодіяти з вашим ботом, виходячи з його особистих уподобань: мови, встановленої в налаштуваннях клієнта Telegram.
Вам лише потрібно буде створити кілька файлів перекладу і переконатися, що всі переклади належним чином синхронізовані.

## Подальші кроки

- Повністю прочитайте [документацію Fluent](https://projectfluent.org/), особливо [посібник по синтаксису](https://projectfluent.org/fluent/guide/).
- [Перехід з плагіна `i18n`](https://github.com/grammyjs/fluent#i18n-plugin-replacement).
- Ознайомтеся з [`@moebius/fluent`](https://github.com/the-moebius/fluent#readme).

## Загальні відомості про плагін

- Назва: `fluent`
- Джерело: <https://github.com/grammyjs/fluent>