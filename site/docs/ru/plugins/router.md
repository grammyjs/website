---
prev: false
next: false
---

# Роутер (`router`)

Класс `Router` ([документация API](/ref/router/)) предоставляет возможность структурировать вашего бота, направляя объекты контекста в различные части вашего кода.
Это более сложная версия `bot.route` в `Composer` ([grammY API](/ref/core/composer#route)).

## Пример

Вот пример использования роутера, который говорит сам за себя.

```ts
const router = new Router((ctx) => {
  // Определите, какой маршрут выбрать здесь.
  return "key";
});

router.route("key", async (ctx) => {/* ... */});
router.route("other-key", async (ctx) => {/* ... */});
router.otherwise((ctx) => {/* ... */}); // вызывается, если ни один маршрут не соответствует

bot.use(router);
```

## Связь с Middleware

Естественно, плагин роутера легко интегрируется с [деревьями middleware](../advanced/middleware).
Например, вы можете фильтровать обновления после их маршрутизации.

```ts
router.route("key").on("message:text", async (ctx) => {/* ... */});

const other = router.otherwise();
other.on(":text", async (ctx) => {/* ... */});
other.use((ctx) => {/* ... */});
```

Возможно, вы также захотите просмотреть этот [раздел](../guide/filter-queries#комбинирование-запросов-с-другими-методами) о комбинировании обработчиков middlware.

## Объединение роутера с сессиями

Роутеры хорошо работают вместе с [сессиями](./session).
Например, объединение этих двух концепций позволяет воссоздать формы в интерфейсе чата.

> Обратите внимание, что гораздо лучшим решением является использование плагина [conversations](./conversations).
> Оставшаяся часть этой страницы устарела с тех пор, как был создан этот плагин.
> Мы оставим эту страницу в качестве справочника для тех, кто использовал маршрутизатор для форм.

Допустим, вы хотите создать бота, который будет сообщать пользователям, сколько дней осталось до их дня рождения.
Для того чтобы вычислить количество дней, бот должен знать месяц (например, июнь) и день месяца (например, 15), когда у пользователя день рождения.

Поэтому бот должен задать два вопроса:

1. В каком месяце родился пользователь?
2. В какой день месяца родился пользователь?

Только если оба значения известны, бот может сказать пользователю, сколько дней осталось.

Вот как может быть реализован подобный бот:

::: code-group

```ts [TypeScript]
import { Bot, Context, Keyboard, session, SessionFlavor } from "grammy";
import { Router } from "@grammyjs/router";

interface SessionData {
  step: "idle" | "day" | "month"; // на каком этапе формы мы находимся
  dayOfMonth?: number; // день, в котором родился пользователь
  month?: number; // месяц, в котором родился пользователь
}
type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>("");

// Используйте сессии.
bot.use(session({ initial: (): SessionData => ({ step: "idle" }) }));

// Определите некоторые команды.
bot.command("start", async (ctx) => {
  await ctx.reply(`Добро пожаловать!
Я могу сказать, сколько дней осталось до твоего рождения!
Отправь /birthday чтобы начать`);
});

bot.command("birthday", async (ctx) => {
  const day = ctx.session.dayOfMonth;
  const month = ctx.session.month;
  if (day !== undefined && month !== undefined) {
    // Информация уже предоставлена!
    await ctx.reply(`Ваш день рождения через ${getDays(month, day)} дней!`);
  } else {
    // Отсутствующая информация, войдите в форму на основе роутера
    ctx.session.step = "day";
    await ctx.reply(
      "Пожалуйста, отправьте мне день месяца \
в который вы родились в виде числа!",
    );
  }
});

// Используйте роутер
const router = new Router<MyContext>((ctx) => ctx.session.step);

// Определите этап, на который будет обрабатывать день.
const day = router.route("day");
day.on("message:text", async (ctx) => {
  const day = parseInt(ctx.msg.text, 10);
  if (isNaN(day) || day < 1 || 31 < day) {
    await ctx.reply("Это не верный день, попробуйте снова!");
    return;
  }
  ctx.session.dayOfMonth = day;
  // Форма для перехода к месяцу
  ctx.session.step = "month";
  await ctx.reply("Получил, теперь назовите мне месяц!", {
    reply_markup: {
      one_time_keyboard: true,
      keyboard: new Keyboard()
        .text("Янв").text("Февр").text("Март").row()
        .text("Апр").text("Май").text("Июнь").row()
        .text("Июль").text("Авг").text("Сент").row()
        .text("Окт").text("Нояб").text("Дек").build(),
    },
  });
});
day.use((ctx) => ctx.reply("Пожалуйста, пришлите мне день в виде текстового сообщения!"));

// Определите шаг, который обрабатывает месяц.
const month = router.route("month");
month.on("message:text", async (ctx) => {
  // Не должно происходить, если только данные сессии не повреждены.
  const day = ctx.session.dayOfMonth;
  if (day === undefined) {
    await ctx.reply("Мне нужен день, когда вы родились!");
    ctx.session.step = "day";
    return;
  }

  const month = months.indexOf(ctx.msg.text);
  if (month === -1) {
    await ctx.reply(
      "Это неправильный месяц, \
используйте одну из кнопок!",
    );
    return;
  }

  ctx.session.month = month;
  const diff = getDays(month, day);
  await ctx.reply(
    `Ваш день рождения ${months[month]} ${day}.
Это через ${diff} дней!`,
    { reply_markup: { remove_keyboard: true } },
  );
  ctx.session.step = "idle";
});
month.use((ctx) => ctx.reply("Пожалуйста, нажмите одну из кнопок!"));

// Определите шаг, на котором обрабатываются все остальные случаи.
router.otherwise(async (ctx) => { // idle
  await ctx.reply("Отправьте /birthday чтобы понять, сколько вам осталось ждать.");
});

bot.use(router); // используйте роутер
bot.start();

// Утилиты для преобразования даты
const months = [
  "Янв",
  "Февр",
  "Март",
  "Апр",
  "Май",
  "Июнь",
  "Июль",
  "Авг",
  "Сент",
  "Окт",
  "Нояб",
  "Дек",
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

```js [JavaScript]
const { Bot, Context, Keyboard, session, SessionFlavor } = require("grammy");
const { Router } = require("@grammyjs/router");

const bot = new Bot("");

// Используйте сессии.
bot.use(session({ initial: () => ({ step: "idle" }) }));

// Определите некоторые команды.
bot.command("start", async (ctx) => {
  await ctx.reply(`Добро пожаловать!
Я могу сказать, сколько дней осталось до твоего рождения!
Отправь /birthday чтобы начать`);
});

bot.command("birthday", async (ctx) => {
  const day = ctx.session.dayOfMonth;
  const month = ctx.session.month;
  if (day !== undefined && month !== undefined) {
    // Информация уже предоставлена!
    await ctx.reply(`Ваш день рождения через ${getDays(month, day)} дней!`);
  } else {
    // Отсутствующая информация, войдите в форму на основе роутера
    ctx.session.step = "day";
    await ctx.reply(
      "Пожалуйста, отправьте мне день месяца \
в который вы родились в виде числа!",
    );
  }
});

// Используйте роутер
const router = new Router((ctx) => ctx.session.step);

// Определите этап, на который будет обрабатывать день.
const day = router.route("day");
day.on("message:text", async (ctx) => {
  const day = parseInt(ctx.msg.text, 10);
  if (isNaN(day) || day < 1 || 31 < day) {
    await ctx.reply("Это не верный день, попробуйте снова!");
    return;
  }
  ctx.session.dayOfMonth = day;
  // Форма для перехода к месяцу
  ctx.session.step = "month";
  await ctx.reply("Получил, теперь назовите мне месяц!", {
    reply_markup: {
      one_time_keyboard: true,
      keyboard: new Keyboard()
        .text("Янв").text("Февр").text("Март").row()
        .text("Апр").text("Май").text("Июнь").row()
        .text("Июль").text("Авг").text("Сент").row()
        .text("Окт").text("Нояб").text("Дек").build(),
    },
  });
});
day.use((ctx) => ctx.reply("Пожалуйста, пришлите мне день в виде текстового сообщения!"));

// Определите шаг, который обрабатывает месяц.
const month = router.route("month");
month.on("message:text", async (ctx) => {
  // Не должно происходить, если только данные сессии не повреждены.
  const day = ctx.session.dayOfMonth;
  if (day === undefined) {
    await ctx.reply("Мне нужен день, когда вы родились!");
    ctx.session.step = "day";
    return;
  }

  const month = months.indexOf(ctx.msg.text);
  if (month === -1) {
    await ctx.reply(
      "Это неправильный месяц, \
используйте одну из кнопок!",
    );
    return;
  }

  ctx.session.month = month;
  const diff = getDays(month, day);
  await ctx.reply(
    `Ваш день рождения ${months[month]} ${day}.
Это через ${diff} дней!`,
    { reply_markup: { remove_keyboard: true } },
  );
  ctx.session.step = "idle";
});
month.use((ctx) => ctx.reply("Пожалуйста, нажмите одну из кнопок!"));

// Определите шаг, на котором обрабатываются все остальные случаи.
router.otherwise(async (ctx) => { // idle
  await ctx.reply("Отправьте /birthday чтобы понять, сколько вам осталось ждать.");
});

bot.use(router); // используйте роутер
bot.start();

// Утилиты для преобразования даты
const months = [
  "Янв",
  "Февр",
  "Март",
  "Апр",
  "Май",
  "Июнь",
  "Июль",
  "Авг",
  "Сент",
  "Окт",
  "Нояб",
  "Дек",
];
function getDays(month, day) {
  const bday = new Date();
  const now = Date.now();
  bday.setMonth(month);
  bday.setDate(day);
  if (bday.getTime() < now) bday.setFullYear(bday.getFullYear() + 1);
  const diff = (bday.getTime() - now) / (1000 * 60 * 60 * 24);
  return diff;
}
```

```ts [Deno]
import {
  Bot,
  Context,
  Keyboard,
  session,
  SessionFlavor,
} from "https://deno.land/x/grammy/mod.ts";
import { Router } from "https://deno.land/x/grammy_router/router.ts";

interface SessionData {
  step: "idle" | "day" | "month"; // на каком этапе формы мы находимся
  dayOfMonth?: number; // день, в котором родился пользователь
  month?: number; // месяц, в котором родился пользователь
}
type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>("");

// Используйте сессии.
bot.use(session({ initial: (): SessionData => ({ step: "idle" }) }));

// Определите некоторые команды.
bot.command("start", async (ctx) => {
  await ctx.reply(`Добро пожаловать!
Я могу сказать, сколько дней осталось до твоего рождения!
Отправь /birthday чтобы начать`);
});

bot.command("birthday", async (ctx) => {
  const day = ctx.session.dayOfMonth;
  const month = ctx.session.month;
  if (day !== undefined && month !== undefined) {
    // Информация уже предоставлена!
    await ctx.reply(`Ваш день рождения через ${getDays(month, day)} дней!`);
  } else {
    // Отсутствующая информация, войдите в форму на основе роутера
    ctx.session.step = "day";
    await ctx.reply(
      "Пожалуйста, отправьте мне день месяца \
в который вы родились в виде числа!",
    );
  }
});

// Используйте роутер
const router = new Router<MyContext>((ctx) => ctx.session.step);

// Определите этап, на который будет обрабатывать день.
const day = router.route("day");
day.on("message:text", async (ctx) => {
  const day = parseInt(ctx.msg.text, 10);
  if (isNaN(day) || day < 1 || 31 < day) {
    await ctx.reply("Это не верный день, попробуйте снова!");
    return;
  }
  ctx.session.dayOfMonth = day;
  // Форма для перехода к месяцу
  ctx.session.step = "month";
  await ctx.reply("Получил, теперь назовите мне месяц!", {
    reply_markup: {
      one_time_keyboard: true,
      keyboard: new Keyboard()
        .text("Янв").text("Февр").text("Март").row()
        .text("Апр").text("Май").text("Июнь").row()
        .text("Июль").text("Авг").text("Сент").row()
        .text("Окт").text("Нояб").text("Дек").build(),
    },
  });
});
day.use((ctx) => ctx.reply("Пожалуйста, пришлите мне день в виде текстового сообщения!"));

// Определите шаг, который обрабатывает месяц.
const month = router.route("month");
month.on("message:text", async (ctx) => {
  // Не должно происходить, если только данные сессии не повреждены.
  const day = ctx.session.dayOfMonth;
  if (day === undefined) {
    await ctx.reply("Мне нужен день, когда вы родились!");
    ctx.session.step = "day";
    return;
  }

  const month = months.indexOf(ctx.msg.text);
  if (month === -1) {
    await ctx.reply(
      "Это неправильный месяц, \
используйте одну из кнопок!",
    );
    return;
  }

  ctx.session.month = month;
  const diff = getDays(month, day);
  await ctx.reply(
    `Ваш день рождения ${months[month]} ${day}.
Это через ${diff} дней!`,
    { reply_markup: { remove_keyboard: true } },
  );
  ctx.session.step = "idle";
});
month.use((ctx) => ctx.reply("Пожалуйста, нажмите одну из кнопок!"));

// Определите шаг, на котором обрабатываются все остальные случаи.
router.otherwise(async (ctx) => { // idle
  await ctx.reply("Отправьте /birthday чтобы понять, сколько вам осталось ждать.");
});

bot.use(router); // используйте роутер
bot.start();

// Утилиты для преобразования даты
const months = [
  "Янв",
  "Февр",
  "Март",
  "Апр",
  "Май",
  "Июнь",
  "Июль",
  "Авг",
  "Сент",
  "Окт",
  "Нояб",
  "Дек",
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

:::

Обратите внимание, что сессия имеет свойство `step`, которое хранит шаг формы, т.е. какое значение заполняется в данный момент.
Роутер используется для перехода между различными middleware, которые заполняют поля `month` и `dayOfMonth` в сессии.
Если оба значения известны, бот вычисляет оставшиеся дни и отправляет их обратно пользователю.

## Краткая информация о плагине

- Название: `router`
- [Исходник](https://github.com/grammyjs/router)
- [Ссылка](/ref/router/)
