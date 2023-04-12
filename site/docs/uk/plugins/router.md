# Маршрутизатор (`router`)

Клас `Router` ([довідка API](https://deno.land/x/grammy_router/router.ts)) надає спосіб структурувати вашого бота шляхом маршрутизації обʼєктів контексту до різних частин вашого коду.
Це більш досконала версія `bot.route` у `Composer` ([довідка grammY API](https://deno.land/x/grammy/mod.ts?s=Composer#method_route_0)).

## Приклад

Ось приклад використання маршрутизатора, який говорить сам за себе.

```ts
const router = new Router((ctx) => {
  // Визначаємо маршрут.
  return "ключ";
});

router.route("ключ", (ctx) => {/* ... */});
router.route("інший ключ", (ctx) => {/* ... */});
router.otherwise((ctx) => {/* ... */}); // викликається, якщо жоден маршрут не збігається

bot.use(router);
```

## Інтеграція з middleware

Звісно, плагін маршрутизатора легко інтегрується з [деревами middleware](../advanced/middleware.md), які надає grammY.
Наприклад, ви можете додатково фільтрувати оновлення після їх маршрутизації.

```ts
router.route("ключ").on("message:text", (ctx) => {/* ... */});

const other = router.otherwise();
other.on(":text", (ctx) => {/* ... */});
other.use((ctx) => {/* ... */});
```

Ви також можете переглянути цей [розділ](../guide/filter-queries.md#комбінування-запитів-з-іншими-методами) про комбінування обробників.

## Комбінування маршрутизаторів із сесіями

Маршрутизатори добре працюють разом із [сесіями](./session.md).
Наприклад, поєднання цих двох концепцій дозволяє створювати форми у вигляді інтерфейсу чата.

> Зауважте, що набагато кращим рішенням є використання [плагіна розмов](./conversations.md).
> Решта цієї сторінки застаріла з моменту створення того плагіна.
> Ми збережемо цю сторінку як довідник для тих, хто використовував маршрутизатор для створення форм.

Припустимо, ви хочете створити бота, який повідомляє користувачам, скільки днів залишилося до їхнього дня народження.
Щоб обчислити кількість днів, бот повинен знати дату дня народження, а саме місяць і день, наприклад, місяць - червень, день місяця - 15-й.

Тому бот повинен задати два питання:

1. Якого місяця народився користувач?
2. Якого дня народився користувач?

Тільки якщо обидва значення відомі, бот може сказати користувачу, скільки днів залишилося до його дня народження.

Ось як можна реалізувати такого бота:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context, Keyboard, session, SessionFlavor } from "grammy";
import { Router } from "@grammyjs/router";

interface SessionData {
  // "порожній", "день" та "місяць" відповідно
  step: "idle" | "day" | "month"; // крок форми, на якому ми знаходимося
  dayOfMonth?: number; // день місяця
  month?: number; // місяць народження
}
type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>("");

// Використовуємо сесії.
bot.use(session({ initial: (): SessionData => ({ step: "idle" }) }));

// Визначаємо деякі команди.
bot.command("start", async (ctx) => {
  await ctx.reply(`Ласкаво просимо!
Я можу сказати вам, через скільки днів у вас день народження!
Надішліть /birthday, щоб почати`);
});

bot.command("birthday", async (ctx) => {
  const day = ctx.session.dayOfMonth;
  const month = ctx.session.month;
  if (day !== undefined && month !== undefined) {
    // Відповідаємо користувачу, якщо інформація вже надана
    await ctx.reply(`Ваш день народження через ${getDays(month, day)} днів!`);
  } else {
    // Починаємо опитування, якщо деякої інформації не вистачає
    ctx.session.step = "day";
    await ctx.reply(
"Будь ласка, надішліть мені день \
вашого народження у вигляді числа!",
    );
  }
});

// Використовуємо маршрутизатор.
const router = new Router<MyContext>((ctx) => ctx.session.step);

// Визначаємо крок, який обробляє день.
const day = router.route("day");
day.on("message:text", async (ctx) => {
  const day = parseInt(ctx.msg.text, 10);
  if (isNaN(day) || day < 1 || 31 < day) {
    await ctx.reply("Цей день недійсний, спробуйте ще раз!");
    return;
  }
  ctx.session.dayOfMonth = day;
  // Попередньо змінюємо крок форми
  ctx.session.step = "month";
  await ctx.reply("Готово! А тепер скажіть, якого місяця ви народилися?", {
    reply_markup: {
      one_time_keyboard: true,
      keyboard: new Keyboard()
        .text("січня").text("лютого").text("березня").row()
        .text("квітня").text("травня").text("червня").row()
        .text("липня").text("серпня").text("вересня").row()
        .text("жовтня").text("листопада").text("грудня").build(),
    },
  });
});
day.use((ctx) =>
  ctx.reply(
    "Будь ласка, надішліть мені день у вигляді текстового повідомлення!",
  )
);

// Визначаємо крок, який обробляє місяць.
const month = router.route("month");
month.on("message:text", async (ctx) => {
  // Наступна умова виконається, лише якщо дані сесії пошкоджено.
  const day = ctx.session.dayOfMonth;
  if (day === undefined) {
    await ctx.reply("Спочатку мені потрібно дізнатися твій день місяця!");
    ctx.session.step = "day";
    return;
  }

  const month = months.indexOf(ctx.msg.text);
  if (month === -1) {
    await ctx.reply(
"Цей місяць недійсний, \
будь ласка, скористайтеся однією з кнопок!",
    );
    return;
  }

  ctx.session.month = month;
  const diff = getDays(month, day);
  await ctx.reply(
    `Ваш день народження ${day}-го ${months[month]}.
Це за ${diff} днів!`,
    { reply_markup: { remove_keyboard: true } },
  );
  ctx.session.step = "idle";
});
month.use((ctx) => ctx.reply("Будь ласка, натисніть одну з кнопок!"));

// Визначаємо крок, який обробляє всі інші випадки.
router.otherwise(async (ctx) => { // idle
  await ctx.reply(
    "Надішліть /birthday, щоб дізнатися, як довго вам доведеться чекати.",
  );
});

bot.use(router); // реєструємо маршрутизатор
bot.start();

// Утиліти для перетворення дат
const months = [
  "січня",
  "лютого",
  "березня",
  "квітня",
  "травня",
  "червня",
  "липня",
  "серпня",
  "вересня",
  "жовтня",
  "листопада",
  "грудня",
];
function getDays(month: number, day: number) {
  const bday = new Date();
  const now = Date.now();
  bday.setMonth(month);
  bday.setDate(day);
  if (bday.getTime() < now) bday.setFullYear(bday.getFullYear() + 1);
  const diff = (bday.getTime() - now) / (1000 * 60 * 60 * 24);
  return diff;
}
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const { Bot, Context, Keyboard, session, SessionFlavor } = require("grammy");
const { Router } = require("@grammyjs/router");

const bot = new Bot("");

// Використовуємо сесії.
bot.use(session({ initial: () => ({ step: "idle" }) }));

// Визначаємо деякі команди.
bot.command("start", async (ctx) => {
  await ctx.reply(`Ласкаво просимо!
Я можу сказати вам, через скільки днів у вас день народження!
Надішліть /birthday, щоб почати`);
});

bot.command("birthday", async (ctx) => {
  const day = ctx.session.dayOfMonth;
  const month = ctx.session.month;
  if (day !== undefined && month !== undefined) {
    // Відповідаємо користувачеві, якщо інформація вже надана
    await ctx.reply(`Ваш день народження через ${getDays(month, day)} днів!`);
  } else {
    // Починаємо опитування, якщо деякої інформації не вистачає
    ctx.session.step = "day";
    await ctx.reply(
"Будь ласка, надішліть мені день \
вашого народження у вигляді числа!",
    );
  }
});

// Використовуємо маршрутизатор.
const router = new Router((ctx) => ctx.session.step);

// Визначаємо крок, який обробляє день.
const day = router.route("day");
day.on("message:text", async (ctx) => {
  const day = parseInt(ctx.msg.text, 10);
  if (isNaN(day) || day < 1 || 31 < day) {
    await ctx.reply("Цей день недійсний, спробуйте ще раз!");
    return;
  }
  ctx.session.dayOfMonth = day;
  // Попередньо змінюємо крок форми
  ctx.session.step = "month";
  await ctx.reply("Готово! А тепер скажіть, якого місяця ви народилися?", {
    reply_markup: {
      one_time_keyboard: true,
      keyboard: new Keyboard()
        .text("січня").text("лютого").text("березня").row()
        .text("квітня").text("травня").text("червня").row()
        .text("липня").text("серпня").text("вересня").row()
        .text("жовтня").text("листопада").text("грудня").build(),
    },
  });
});
day.use((ctx) =>
  ctx.reply(
    "Будь ласка, надішліть мені день у вигляді текстового повідомлення!",
  )
);

// Визначаємо крок, який обробляє місяць.
const month = router.route("month");
month.on("message:text", async (ctx) => {
  // Наступна умова виконається, лише якщо дані сесії пошкоджено.
  const day = ctx.session.dayOfMonth;
  if (day === undefined) {
    await ctx.reply("Спочатку мені потрібно дізнатися твій день місяця!");
    ctx.session.step = "day";
    return;
  }

  const month = months.indexOf(ctx.msg.text);
  if (month === -1) {
    await ctx.reply(
"Цей місяць недійсний, \
будь ласка, скористайтеся однією з кнопок!",
    );
    return;
  }

  ctx.session.month = month;
  const diff = getDays(month, day);
  await ctx.reply(
    `Ваш день народження ${day}-го ${months[month]}.
Це за ${diff} днів!`,
    { reply_markup: { remove_keyboard: true } },
  );
  ctx.session.step = "idle";
});
month.use((ctx) => ctx.reply("Будь ласка, натисніть одну з кнопок!"));

// Визначаємо крок, який обробляє всі інші випадки.
router.otherwise(async (ctx) => { // idle
  await ctx.reply(
    "Надішліть /birthday, щоб дізнатися, як довго вам доведеться чекати.",
  );
});

bot.use(router); // реєструємо маршрутизатор
bot.start();

// Утиліти для перетворення дат
const months = [
  "січня",
  "лютого",
  "березня",
  "квітня",
  "травня",
  "червня",
  "липня",
  "серпня",
  "вересня",
  "жовтня",
  "листопада",
  "грудня",
];
function getDays(month: number, day: number) {
  const bday = new Date();
  const now = Date.now();
  bday.setMonth(month);
  bday.setDate(day);
  if (bday.getTime() < now) bday.setFullYear(bday.getFullYear() + 1);
  const diff = (bday.getTime() - now) / (1000 * 60 * 60 * 24);
  return diff;
}
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import {
  Bot,
  Context,
  Keyboard,
  session,
  SessionFlavor,
} from "https://deno.land/x/grammy/mod.ts";
import { Router } from "https://deno.land/x/grammy_router/router.ts";

interface SessionData {
  // "порожній", "день" та "місяць" відповідно
  step: "idle" | "day" | "month"; // крок форми, на якому ми знаходимося
  dayOfMonth?: number; // день місяця
  month?: number; // місяць народження
}
type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>("");

// Використовуємо сесії.
bot.use(session({ initial: (): SessionData => ({ step: "idle" }) }));

// Визначаємо деякі команди.
bot.command("start", async (ctx) => {
  await ctx.reply(`Ласкаво просимо!
Я можу сказати вам, через скільки днів у вас день народження!
Надішліть /birthday, щоб почати`);
});

bot.command("birthday", async (ctx) => {
  const day = ctx.session.dayOfMonth;
  const month = ctx.session.month;
  if (day !== undefined && month !== undefined) {
    // Відповідаємо користувачеві, якщо інформація вже надана
    await ctx.reply(`Ваш день народження через ${getDays(month, day)} днів!`);
  } else {
    // Починаємо опитування, якщо деякої інформації не вистачає
    ctx.session.step = "day";
    await ctx.reply(
"Будь ласка, надішліть мені день \
вашого народження у вигляді числа!",
    );
  }
});

// Використовуємо маршрутизатор.
const router = new Router<MyContext>((ctx) => ctx.session.step);

// Визначаємо крок, який обробляє день.
const day = router.route("day");
day.on("message:text", async (ctx) => {
  const day = parseInt(ctx.msg.text, 10);
  if (isNaN(day) || day < 1 || 31 < day) {
    await ctx.reply("Цей день недійсний, спробуйте ще раз!");
    return;
  }
  ctx.session.dayOfMonth = day;
  // Попередньо змінюємо крок форми
  ctx.session.step = "month";
  await ctx.reply("Готово! А тепер скажіть, якого місяця ви народилися?", {
    reply_markup: {
      one_time_keyboard: true,
      keyboard: new Keyboard()
        .text("січня").text("лютого").text("березня").row()
        .text("квітня").text("травня").text("червня").row()
        .text("липня").text("серпня").text("вересня").row()
        .text("жовтня").text("листопада").text("грудня").build(),
    },
  });
});
day.use((ctx) =>
  ctx.reply(
    "Будь ласка, надішліть мені день у вигляді текстового повідомлення!",
  )
);

// Визначаємо крок, який обробляє місяць.
const month = router.route("month");
month.on("message:text", async (ctx) => {
  // Наступна умова виконається, лише якщо дані сесії пошкоджено.
  const day = ctx.session.dayOfMonth;
  if (day === undefined) {
    await ctx.reply("Спочатку мені потрібно дізнатися твій день місяця!");
    ctx.session.step = "day";
    return;
  }

  const month = months.indexOf(ctx.msg.text);
  if (month === -1) {
    await ctx.reply(
"Цей місяць недійсний, \
будь ласка, скористайтеся однією з кнопок!",
    );
    return;
  }

  ctx.session.month = month;
  const diff = getDays(month, day);
  await ctx.reply(
    `Ваш день народження ${day}-го ${months[month]}.
Це за ${diff} днів!`,
    { reply_markup: { remove_keyboard: true } },
  );
  ctx.session.step = "idle";
});
month.use((ctx) => ctx.reply("Будь ласка, натисніть одну з кнопок!"));

// Визначаємо крок, який обробляє всі інші випадки.
router.otherwise(async (ctx) => { // idle
  await ctx.reply(
    "Надішліть /birthday, щоб дізнатися, як довго вам доведеться чекати.",
  );
});

bot.use(router); // реєструємо маршрутизатор
bot.start();

// Утиліти для перетворення дат
const months = [
  "січня",
  "лютого",
  "березня",
  "квітня",
  "травня",
  "червня",
  "липня",
  "серпня",
  "вересня",
  "жовтня",
  "листопада",
  "грудня",
];
function getDays(month: number, day: number) {
  const bday = new Date();
  const now = Date.now();
  bday.setMonth(month);
  bday.setDate(day);
  if (bday.getTime() < now) bday.setFullYear(bday.getFullYear() + 1);
  const diff = (bday.getTime() - now) / (1000 * 60 * 60 * 24);
  return diff;
}
```

</CodeGroupItem>
</CodeGroup>

Зверніть увагу, що сесія має властивість `step`, яка зберігає крок форми, тобто яке значення наразі заповнюється.
Маршрутизатор використовується для переходу між різними middleware, які заповнюють поля `month` і `dayOfMonth` у сесії.
Якщо обидва значення відомі, бот обчислює кількість днів, що залишилися, і надсилає її назад користувачеві.

## Загальні відомості про плагін

- Назва: `router`
- Джерело: <https://github.com/grammyjs/router>
- Довідка: <https://deno.land/x/grammy_router/router.ts>
