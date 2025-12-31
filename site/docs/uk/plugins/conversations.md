---
prev: false
next: false
---

# Розмови (`conversations`)

З легкістю створюйте потужні розмовні інтерфейси.

## Вступ

Розмови дозволяють вам чекати надходження повідомлення.
Використовуйте цей плагін, якщо ваш бот має кілька етапів взаємодії з користувачем.

> Розмови унікальні тим, що вони представляють нову концепцію, яку ви не знайдете більше ніде у світі.
> Вони надають елегантне рішення, але вам потрібно буде трохи ознайомитись з тим, як вони працюють, перш ніж ви зрозумієте, що насправді робить ваш код.

Ось простий приклад, щоб ви могли погратися з плагіном, перш ніж ми перейдемо до найцікавішого.

:::code-group

```ts [TypeScript]
import { Bot, type Context } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";

const bot = new Bot<ConversationFlavor<Context>>(""); // <-- Помістіть токен свого бота між "" (https://t.me/BotFather)
bot.use(conversations());

/** Визначаємо розмову */
async function hello(conversation: Conversation, ctx: Context) {
  await ctx.reply("Привіт! Як тебе звати?");
  const { message } = await conversation.waitFor("message:text");
  await ctx.reply(`Ласкаво просимо до чату, ${message.text}!`);
}
bot.use(createConversation(hello));

bot.command("enter", async (ctx) => {
  // Входимо в оголошену нами функцію "hello".
  await ctx.conversation.enter("hello");
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { conversations, createConversation } = require(
  "@grammyjs/conversations",
);

const bot = new Bot(""); // <-- Помістіть токен свого бота між "" (https://t.me/BotFather)
bot.use(conversations());

/** Визначаємо розмову */
async function hello(conversation, ctx) {
  await ctx.reply("Привіт! Як тебе звати?");
  const { message } = await conversation.waitFor("message:text");
  await ctx.reply(`Ласкаво просимо до чату, ${message.text}!`);
}
bot.use(createConversation(hello));

bot.command("enter", async (ctx) => {
  // Входимо в оголошену нами функцію "hello".
  await ctx.conversation.enter("hello");
});

bot.start();
```

```ts [Deno]
import { Bot, type Context } from "https://deno.land/x/grammy/mod.ts";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations/mod.ts";

const bot = new Bot<ConversationFlavor<Context>>(""); // <-- Помістіть токен свого бота між "" (https://t.me/BotFather)
bot.use(conversations());

/** Визначаємо розмову */
async function hello(conversation: Conversation, ctx: Context) {
  await ctx.reply("Привіт! Як тебе звати?");
  const { message } = await conversation.waitFor("message:text");
  await ctx.reply(`Ласкаво просимо до чату, ${message.text}!`);
}
bot.use(createConversation(hello));

bot.command("enter", async (ctx) => {
  // Входимо в оголошену нами функцію "hello".
  await ctx.conversation.enter("hello");
});

bot.start();
```

:::

Коли ви увійдете у вищезгадану розмову `hello`, бот надішле повідомлення, потім дочекається текстового повідомлення від користувача, після чого надішле ще одне повідомлення.
Після цього розмова завершиться.

Тепер перейдемо до найцікавішого.

## Як працюють розмови

Погляньте на наступний приклад звичайної обробки повідомлень.

```ts
bot.on("message", async (ctx) => {
  // обробляємо єдине повідомлення
});
```

У звичайних обробниках повідомлень ви завжди маєте лише один обʼєкт контексту.

Порівняйте це з розмовами.

```ts
async function hello(conversation: Conversation, ctx0: Context) {
  const ctx1 = await conversation.wait();
  const ctx2 = await conversation.wait();
  // обробляємо три повідомлення
}
```

У цій розмові вам доступні три обʼєкти контексту!

Як і звичайні обробники, плагін розмов отримує лише один обʼєкт контексту від [проміжного обробника](../guide/middleware).
А тепер раптом він надає вам три обʼєкти контексту.
Як таке можливо?

**Функції побудови розмов виконуються не так, як звичайні функції**, хоч ми і можемо запрограмувати їх саме так.

### Розмови — це механізм для повторного відтворення

Функції побудови розмов виконуються не так, як звичайні функції.

Коли розмова починається, вона виконуватиметься лише до першого виклику очікування.
Після цього функція переривається і далі не виконується.
Плагін запамʼятовує, що було здійснено виклик очікування, і зберігає цю інформацію.

Коли надійде наступне оновлення, розмова буде виконана з самого початку.
Проте цього разу жодні виклики API не виконуються, що дозволяє вашому коду працювати дуже швидко і не мати жодних ефектів.
Це називається _відтворенням_.
Як тільки знову буде досягнуто попередній виклик очікування, виконання функції відновиться у звичайному режимі.

::: code-group

```ts [Вхід]
async function hello( //                      |
  conversation: Conversation, //              |
  ctx0: Context, //                           |
) { //                                        |
  await ctx0.reply("Привіт!"); //             |
  const ctx1 = await conversation.wait(); //  A
  await ctx1.reply("Привіт ще раз!"); //
  const ctx2 = await conversation.wait(); //
  await ctx2.reply("Бувай!"); //
} //
```

```ts [Перше відтворення]
async function hello( //                      .
  conversation: Conversation, //              .
  ctx0: Context, //                           .
) { //                                        .
  await ctx0.reply("Привіт!"); //             .
  const ctx1 = await conversation.wait(); //  A
  await ctx1.reply("Привіт ще раз!"); //      |
  const ctx2 = await conversation.wait(); //  B
  await ctx2.reply("Бувай!"); //
} //
```

```ts [Друге відтворення]
async function hello( //                      .
  conversation: Conversation, //              .
  ctx0: Context, //                           .
) { //                                        .
  await ctx0.reply("Привіт!"); //             .
  const ctx1 = await conversation.wait(); //  A
  await ctx1.reply("Привіт ще раз!"); //      .
  const ctx2 = await conversation.wait(); //  B
  await ctx2.reply("Бувай!"); //              |
} //                                          —
```

:::

1. При вході в розмову функція виконуватиметься до мітки `A`.
2. Коли надійде наступне оновлення, функція буде відтворюватися до мітки `A`, і працюватиме в звичайному режимі від мітки `A` до мітки `B`.
3. Коли надійде останнє оновлення, функція буде відтворена до мітки `B` і виконана в нормальному режимі до кінця.

Це означає, що кожен написаний вами рядок коду буде виконано декілька разів: один раз нормально, і ще багато разів під час повторних запусків.
Отже, ви повинні переконатися, що ваш код поводитиметься так само під час повторів, як і під час першого виконання.

Якщо ви виконуєте будь-які виклики API через `ctx.api`, включно з `ctx.reply`, плагін подбає про них автоматично.
На відміну від цього, взаємодія з вашою власною базою даних потребує спеціальної обробки.

Це робиться як наведено нижче.

### Золоте правило розмов

Тепер, коли [ми знаємо, як виконуються розмови](#розмови-—-це-механізм-для-повторного-відтворення), ми можемо визначити одне правило, яке застосовується до коду, який ви пишете у функції побудови розмов.
Ви повинні дотримуватися цього правила, якщо хочете, щоб ваш код працював коректно.

::: warning ЗОЛОТЕ ПРАВИЛО

**Код, який виконується по-різному між відтвореннями, слід обгорнути у [`conversation.external`](/ref/conversations/conversation#external).**

:::

Ось як застосовувати його:

```ts
// ПОГАНО
const response = await accessDatabase();
// ДОБРЕ
const response = await conversation.external(() => accessDatabase());
```

Обгортання частини вашого коду за допомогою [`conversation.external`](/ref/conversations/conversation#external) повідомляє плагіну, що ця частина коду має бути пропущена під час повторного відтворення.
Значення, що повертається з обгорнутого коду, зберігається плагіном і повторно використовується під час наступних відтворень.
У наведеному вище прикладі це запобігає повторному доступу до бази даних.

ВИКОРИСТОВУЙТЕ `conversation.external`, коли ви ...

- читаєте або записуєте до файлів, баз даних/сесій, мережі або глобального стану,
- викликаєте `Math.random()` або `Date.now()`,
- виконуєте виклики API через `bot.api` або інші незалежні екземпляри `Api`.

НЕ ВИКОРИСТОВУЙТЕ `conversation.external`, коли ви ...

- викликаєте `ctx.reply` або інші [дії контексту](../guide/context#доступні-діі),
- викликаєте `ctx.api.sendMessage` або інші методи [Bot API](https://core.telegram.org/bots/api) через `ctx.api`.

Плагін розмов надає кілька зручних методів на основі `conversation.external`.
Це не тільки спрощує використання `Math.random()` і `Date.now()`, але й полегшує відлагодження, надаючи можливість приховати логи під час відтворення.

```ts
// await conversation.external(() => Math.random());
const rnd = await conversation.random();
// await conversation.external(() => Date.now());
const now = await conversation.now();
// await conversation.external(() => console.log("abc"));
await conversation.log("abc");
```

Як `conversation.wait` і `conversation.external` можуть відновити початкові значення, коли відбувається повторне відтворення?
Плагін повинен якось запамʼятати ці дані, чи не так?

Саме так.

### Розмови зберігають стан

У базі даних зберігаються два види даних.
Типово використовується легка база даних у памʼяті, яка базується на `Map`, але ви можете легко [використовувати персистентну базу даних](#персистентні-розмови).

1. Плагін розмов зберігає всі оновлення.
2. Плагін розмов зберігає всі значення, що повертаються `conversation.external` і результати всіх викликів API.

Це не є проблемою, якщо ви маєте лише кілька десятків оновлень у розмові.
Памʼятайте, що під час тривалого опитування кожен виклик `getUpdates` також повертає до 100 оновлень.

Однак, якщо ваша розмова ніколи не завершується, ці дані будуть накопичуватися і сповільнювати роботу бота.
**Уникайте нескінченних циклів.**

### Обʼєкти контексту розмови

Коли розмова виконується, вона використовує збережені оновлення для створення нових обʼєктів контексту з нуля.
**Ці обʼєкти контексту відрізняються від обʼєктів контексту, що використовуються в навколишніх проміжних обробниках.**
Для коду на TypeScript це також означає, що вам тепер потрібно мати два [розширювача](../guide/context#розширювач-для-контексту) обʼєктів контексту.

- **Зовнішні обʼєкти контексту** --- це обʼєкти контексту, які ваш бот використовує у проміжних обробниках.
  Вони надають вам доступ до `ctx.conversation.enter`.
  Для TypeScript вони принаймні матимуть встановлений `ConversationFlavor`.
  Зовнішні обʼєкти контексту також матимуть інші властивості, визначені плагінами, які ви встановили за допомогою `bot.use`.
- **Внутрішні обʼєкти контексту** (також звані **обʼєктами контексту розмов**) --- це обʼєкти контексту, створені плагіном розмов.
  Вони ніколи не мають доступу до `ctx.conversation.enter`, і за замовчуванням вони також не мають доступу до жодного плагіна.
  Якщо ви хочете мати власні властивості для внутрішніх обʼєктів контексту, [прогорніть вниз](#використання-плагінів-всередині-розмов).

Ви маєте передати як зовнішній, так і внутрішній типи контексту до розмови.
Відтак, налаштування TypeScript зазвичай виглядає ось так:

::: code-group

```ts [Node.js]
import { Bot, type Context } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
} from "@grammyjs/conversations";

// Зовнішні обʼєкти контексту (містять всі плагіни проміжних обробників).
type MyContext = ConversationFlavor<Context>;
// Внутрішні обʼєкти контексту (містять всі плагіни розмов).
type MyConversationContext = Context;

// Використовуйте зовнішній тип контексту для вашого бота.
const bot = new Bot<MyContext>(""); // <-- Помістіть токен свого бота між "" (https://t.me/BotFather)

// Використовуйте як зовнішній, так і внутрішній тип для розмови.
type MyConversation = Conversation<MyContext, MyConversationContext>;

// Визначте розмову.
async function example(
  conversation: MyConversation,
  ctx0: MyConversationContext,
) {
  // Усі обʼєкти контексту всередині розмови
  // мають тип `MyConversationContext`.
  const ctx1 = await conversation.wait();

  // До обʼєкту зовнішнього контексту можна отримати доступ
  // через `conversation.external` і він буде виведений як
  // тип `MyContext`.
  const session = await conversation.external((ctx) => ctx.session);
}
```

```ts [Deno]
import { Bot, type Context } from "https://deno.land/x/grammy/mod.ts";
import {
  type Conversation,
  type ConversationFlavor,
} from "https://deno.land/x/grammy_conversations/mod.ts";

// Зовнішні обʼєкти контексту (містять всі плагіни проміжних обробників).
type MyContext = ConversationFlavor<Context>;
// Внутрішні обʼєкти контексту (містять всі плагіни розмов).
type MyConversationContext = Context;

// Використовуйте зовнішній тип контексту для вашого бота.
const bot = new Bot<MyContext>(""); // <-- Помістіть токен свого бота між "" (https://t.me/BotFather)

// Використовуйте як зовнішній, так і внутрішній тип для розмови.
type MyConversation = Conversation<MyContext, MyConversationContext>;

// Визначте розмову.
async function example(
  conversation: MyConversation,
  ctx0: MyConversationContext,
) {
  // Усі обʼєкти контексту всередині розмови
  // мають тип `MyConversationContext`.
  const ctx1 = await conversation.wait();

  // До обʼєкту зовнішнього контексту можна отримати доступ
  // через `conversation.external` і він буде виведений як
  // тип `MyContext`.
  const session = await conversation.external((ctx) => ctx.session);
}
```

:::

> У наведеному вище прикладі у розмові не встановлено жодного плагіна.
> Щойно ви почнете [встановлювати](#використання-плагінів-всередині-розмов) їх, визначення `MyConversationContext` більше не буде голим типом `Context`.

Звісно, якщо у вас є декілька розмов і ви хочете, щоб типи контексту відрізнялися між ними, ви можете визначити декілька типів контексту розмови.

Вітаємо!
Якщо ви зрозуміли все вищесказане, то найскладніше вже позаду.
Решта сторінки присвячена різноманітним можливостям, які надає цей плагін.

## Вхід до розмов

До розмов можна увійти зі звичайного обробника.

Типово, розмова має ту ж назву, що і [назва](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name) функції.
За бажанням ви можете перейменувати її під час встановлення у боті.

За бажанням ви можете передавати аргументи до розмови.
Зверніть увагу, що аргументи будуть збережені у вигляді JSON-рядка, тому вам потрібно переконатися, що їх можна безпечно передати в `JSON.stringify`.

До розмов також можна входити з інших розмов за допомогою звичайного виклику функції JavaScript.
У цьому випадку вони отримують доступ до потенційного значення, що повертається викликаною розмовою.
Це недоступно, коли ви входите до розмови з проміжного обробника.

:::code-group

```ts [TypeScript]
/**
 * Повертає відповідь на питання про життя, всесвіт і все інше.
 * Це значення доступне лише тоді, коли розмова
 * викликається з іншої розмови.
 */
async function convo(conversation: Conversation, ctx: Context) {
  await ctx.reply("Обчислення відповіді");
  return 42;
}
/** Приймає два аргументи, які можна серіалізувати у форматі JSON */
async function args(
  conversation: Conversation,
  ctx: Context,
  answer: number,
  config: { text: string },
) {
  const truth = await convo(conversation, ctx);
  if (answer === truth) {
    await ctx.reply(config.text);
  }
}
bot.use(createConversation(convo, "new-name"));
bot.use(createConversation(args));

bot.command("enter", async (ctx) => {
  await ctx.conversation.enter("new-name");
});
bot.command("enter_with_arguments", async (ctx) => {
  await ctx.conversation.enter("args", 42, { text: "foo" });
});
```

```js [JavaScript]
/**
 * Повертає відповідь на питання про життя, всесвіт і все інше.
 * Це значення доступне лише тоді, коли розмова
 * викликається з іншої розмови.
 */
async function convo(conversation, ctx) {
  await ctx.reply("Computing answer");
  return 42;
}
/** Приймає два аргументи, які можна серіалізувати у форматі JSON */
async function args(conversation, ctx, answer, config) {
  const truth = await convo(conversation, ctx);
  if (answer === truth) {
    await ctx.reply(config.text);
  }
}
bot.use(createConversation(convo, "new-name"));
bot.use(createConversation(args));

bot.command("enter", async (ctx) => {
  await ctx.conversation.enter("new-name");
});
bot.command("enter_with_arguments", async (ctx) => {
  await ctx.conversation.enter("args", 42, { text: "foo" });
});
```

:::

::: warning Відсутність безпеки типів для аргументів

Перевірте, чи ви використовуєте правильні анотації типів для аргументів вашої розмови, і чи передали ви їй відповідні аргументи у виклику `enter`.
Плагін не може перевіряти типи, крім `conversation` та `ctx`.

:::

Памʼятайте, що [порядок проміжних обробників має значення](../guide/middleware).
Ви можете входити до тих розмов, які було встановлено перед обробником, що викликає `enter`.

## Очікування на оновлення

Найпростіший тип виклику очікування просто чекає на будь-яке оновлення.

```ts
const ctx = await conversation.wait();
```

Він просто повертає обʼєкт контексту.
Всі інші виклики очікування базуються саме на ньому.

### Відфільтровані виклики очікування

Якщо ви хочете дочекатися певного типу оновлень, ви можете використовувати виклик очікування з фільтрацією.

```ts
// Відповідає запиту фільтрування, як у `bot.on`.
const message = await conversation.waitFor("message");
// Чекаємо на текст, як у випадку з `bot.hears`.
const hears = await conversation.waitForHears(/regex/);
// Чекаємо на команду, як у випадку з `bot.command`.
const start = await conversation.waitForCommand("start");
// тощо
```

Перегляньте довідку API, щоб побачити [всі доступні способи фільтрації викликів очікування] (/ref/conversations/conversation#wait).

Виклики очікування з фільтрацією гарантовано повертатимуть лише ті оновлення, які відповідають відповідному фільтру.
Якщо бот отримає оновлення, яке не відповідає фільтру, воно буде відкинуто.
Ви можете передати функцію зворотного виклику, яка буде викликана в цьому випадку.

```ts
const message = await conversation.waitFor(":photo", {
  otherwise: (ctx) => ctx.reply("Будь ласка, надішліть фото!"),
});
```

Усі виклики очікування з фільтрацією можна обʼєднати в ланцюжок для фільтрації за кількома параметрами одночасно.

```ts
// Чекаємо на фото з конкретним підписом.
let photoWithCaption = await conversation.waitFor(":photo")
  .andForHears("XY");
// Для кожного випадку використовуємо окрему функцію для незадовільних оновлень:
photoWithCaption = await conversation
  .waitFor(":photo", { otherwise: (ctx) => ctx.reply("Не фото") })
  .andForHears("XY", { otherwise: (ctx) => ctx.reply("Не той підпис") });
```

Якщо в одному з ланцюжкових викликів очікування вказати лише `otherwise`, то він буде викликаний лише тоді, коли цей конкретний фільтр відкине оновлення.

### Перевірка обʼєктів контексту

Дуже поширеною практикою є [деструктуризація](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring) отриманих обʼєктів контексту.
Після цього можна виконувати подальші перевірки отриманих даних.

```ts
const { message } = await conversation.waitFor("message");
if (message.photo) {
  // Обробляємо повідомлення з фото
}
```

Розмови також є ідеальним місцем для використання [`has`-перевірок](../guide/context#дослідження-через-has-перевірку).

## Вихід з розмов

Найпростіший спосіб завершити розмову --- це вийти (`return`) з неї.
Викидання помилки також завершує розмову.

Якщо цього недостатньо, ви можете зупинити розмову вручну в будь-який момент.

```ts
async function convo(conversation: Conversation, ctx: Context) {
  // Усі гілки завершають розмову:
  if (ctx.message?.text === "return") {
    return;
  } else if (ctx.message?.text === "error") {
    throw new Error("boom");
  } else {
    await conversation.halt(); // ніколи не повертає значення
  }
}
```

Ви також можете завершити розмову у проміжному обробнику.

```ts
bot.use(conversations());
bot.command("clean", async (ctx) => {
  await ctx.conversation.exit("convo");
});
```

Ви можете зробити це ще _до того_, як цільова розмова буде встановлена у вашій системі проміжних обробників.
Достатньо мати встановленим сам плагін розмов.

## Це просто JavaScript

Якщо відкинути [побічні ефекти](#золоте-правило-розмов), то розмови --- це звичайні функції JavaScript.
Вони можуть виконуватися дивним чином, але при розробці бота про це зазвичай можна забути.
Весь звичайний синтаксис JavaScript буде працювати.

Більшість речей у цьому розділі очевидні, якщо ви використовували розмови протягом деякого часу.
Однак, якщо ви новачок, деякі з цих речей можуть вас здивувати.

### Змінні, розгалуження та цикли

Ви можете використовувати звичайні змінні для зберігання стану між оновленнями.
Ви можете використовувати розгалуження за допомогою `if` або `switch`.
Цикли `for` і `while` також працюють.

```ts
await ctx.reply("Надішліть мені свої улюблені числа, відокремлені комами!");
const { message } = await conversation.waitFor("message:text");
const numbers = message.text.split(",");
let sum = 0;
for (const str of numbers) {
  const n = parseInt(str.trim(), 10);
  if (!isNaN(n)) {
    sum += n;
  }
}
await ctx.reply("Сума цих чисел становить: " + sum);
```

Це просто JavaScript

### Функції та рекурсія

Ви можете розбити розмову на кілька функцій.
Вони можуть викликати одна одну і навіть застосовувати рекурсію.
Насправді, плагін навіть не знає, що ви використовували окремі функції.

Ось той самий код, що і вище, перероблений з використанням функцій.

:::code-group

```ts [TypeScript]
/** Розмова для складання чисел */
async function sumConvo(conversation: Conversation, ctx: Context) {
  await ctx.reply("Надішліть мені свої улюблені числа, відокремлені комами!");
  const { message } = await conversation.waitFor("message:text");
  const numbers = message.text.split(",");
  await ctx.reply("Сума цих чисел становить: " + sumStrings(numbers));
}

/** Перетворює всі задані рядки у числа та складає їх */
function sumStrings(numbers: string[]): number {
  let sum = 0;
  for (const str of numbers) {
    const n = parseInt(str.trim(), 10);
    if (!isNaN(n)) {
      sum += n;
    }
  }
  return sum;
}
```

```js [JavaScript]
/** Розмова для складання чисел */
async function sumConvo(conversation, ctx) {
  await ctx.reply("Надішліть мені свої улюблені числа, відокремлені комами!");
  const { message } = await conversation.waitFor("message:text");
  const numbers = message.text.split(",");
  await ctx.reply("Сума цих чисел становить: " + sumStrings(numbers));
}

/** Перетворює всі задані рядки у числа та складає їх */
function sumStrings(numbers) {
  let sum = 0;
  for (const str of numbers) {
    const n = parseInt(str.trim(), 10);
    if (!isNaN(n)) {
      sum += n;
    }
  }
  return sum;
}
```

:::

Це просто JavaScript

### Модулі та класи

У JavaScript є функції вищого порядку, класи та інші способи структурування коду в модулі.
Звісно, всі вони можуть бути перетворені на розмови.

Отже, ось наведений вище код ще раз перероблений, але вже в модуль за допомогою простої інʼєкції залежностей.

::: code-group

```ts [TypeScript]
/**
 * Модуль, який може запитувати у користувача числа, і який
 * надає спосіб складання чисел, надісланих користувачем.
 *
 * Потребує передачі дескриптора розмови.
 */
function sumModule(conversation: Conversation) {
  /** Перетворює всі задані рядки у числа та складає їх */
  function sumStrings(numbers) {
    let sum = 0;
    for (const str of numbers) {
      const n = parseInt(str.trim(), 10);
      if (!isNaN(n)) {
        sum += n;
      }
    }
    return sum;
  }

  /** Запитує у користувача числа */
  async function askForNumbers(ctx: Context) {
    await ctx.reply("Надішліть мені свої улюблені числа, відокремлені комами!");
  }

  /** Чекає, поки користувач надішле числа, та надсилає їхню суму */
  async function sumUserNumbers() {
    const ctx = await conversation.waitFor(":text");
    const sum = sumStrings(ctx.msg.text);
    await ctx.reply("Сума цих чисел становить: " + sum);
  }

  return { askForNumbers, sumUserNumbers };
}

/** Розмова для складання чисел */
async function sumConvo(conversation: Conversation, ctx: Context) {
  const mod = sumModule(conversation);
  await mod.askForNumbers(ctx);
  await mod.sumUserNumbers();
}
```

```js [JavaScript]
/**
 * Модуль, який може запитувати у користувача числа, і який
 * надає спосіб складання чисел, надісланих користувачем.
 *
 * Потребує передачі дескриптора розмови.
 */
function sumModule(conversation: Conversation) {
  /** Перетворює всі задані рядки у числа та складає їх */
  function sumStrings(numbers) {
    let sum = 0;
    for (const str of numbers) {
      const n = parseInt(str.trim(), 10);
      if (!isNaN(n)) {
        sum += n;
      }
    }
    return sum;
  }

  /** Запитує у користувача числа */
  async function askForNumbers(ctx: Context) {
    await ctx.reply("Надішліть мені свої улюблені числа, відокремлені комами!");
  }

  /** Чекає, поки користувач надішле числа, та надсилає їхню суму */
  async function sumUserNumbers() {
    const ctx = await conversation.waitFor(":text");
    const sum = sumStrings(ctx.msg.text);
    await ctx.reply("Сума цих чисел становить: " + sum);
  }

  return { askForNumbers, sumUserNumbers };
}

/** Розмова для складання чисел */
async function sumConvo(conversation: Conversation, ctx: Context) {
  const mod = sumModule(conversation);
  await mod.askForNumbers(ctx);
  await mod.sumUserNumbers();
}
```

:::

Це явно перебір для такого простого завдання, як складання кількох чисел.
Однак це демонструє ширшу ідею.

Ви вже здогадалися:
Це просто JavaScript.

## Персистентні розмови

Типово, всі дані, що зберігаються плагіном розмов, зберігаються в памʼяті.
Це означає, що коли ваш процес завершується, всі розмови будуть видалені і їх потрібно буде перезапустити.

Якщо ви хочете зберегти дані після перезавантажень сервера, вам потрібно підключити плагін розмов до бази даних.
Ми створили [багато різних адаптерів сховищ](https://github.com/grammyjs/storages/tree/main/packages#grammy-storages), щоб спростити цю задачу.
Це ті самі адаптери, які використовує [плагін сесій](./session#відомі-адаптери-сховищ).

Припустимо, ви хочете зберігати дані на диску у каталозі з назвою `convo-data`.
Це означає, що вам потрібен [`FileAdapter`](https://github.com/grammyjs/storages/tree/main/packages/file#installation).

::: code-group

```ts [Node.js]
import { FileAdapter } from "@grammyjs/storage-file";

bot.use(conversations({
  storage: new FileAdapter({ dirName: "convo-data" }),
}));
```

```ts [Deno]
import { FileAdapter } from "https://deno.land/x/grammy_storages/file/src/mod.ts";

bot.use(conversations({
  storage: new FileAdapter({ dirName: "convo-data" }),
}));
```

:::

Готово!

Ви можете використовувати будь-який адаптер сховища, який може зберігати дані типу [`VersionedState`](/ref/conversations/versionedstate) з [`ConversationData`](/ref/conversations/conversationdata).
Обидва типи можна імпортувати з плагіна розмов.
Інакше кажучи, якщо ви хочете витягти сховище у змінну, ви можете використати таку анотацію типу.

```ts
const storage = new FileAdapter<VersionedState<ConversationData>>({
  dirName: "convo-data",
});
```

Аналогічні типи можна використовувати з будь-якими іншими адаптерами сховищ.

### Версіонування даних

Якщо ви збережете стан розмови в базі даних, а потім оновите вихідний код, виникне невідповідність між збереженими даними і функцією побудови розмови.
Це є різновидом пошкодження даних, що призведе до неможливості відтворення.

Ви можете запобігти цьому, вказавши версію вашого коду.
Щоразу, коли ви змінюєте розмову, ви можете збільшувати версію.
Тоді плагін розмов виявить невідповідність версій і автоматично оновить всі дані.

```ts
bot.use(conversations({
  storage: {
    type: "key",
    version: 42, // може бути числом або рядком
    adapter: storageAdapter,
  },
}));
```

Якщо ви не вкажете версію, буде використано значення `0`.

::: tip Забули змінити версію? Не хвилюйтеся!

Плагін розмов вже має хороші засоби захисту, які повинні перехоплювати більшість випадків пошкодження даних.
У разі виявлення, десь всередині розмови виникне помилка, яка призведе до аварійного завершення розмови.
При умові, що ви не перехопите і не подавите цю помилку, розмова видалить пошкоджені дані і перезапуститься коректно.

Проте, цей захист не покриває 100% випадків, тому вам варто обовʼязково оновлювати номер версії в майбутньому.

:::

### Дані, які неможливо серіалізувати

[Памʼятайте](#розмови-зберігають-стан), що всі дані, повернуті з [`conversation.external`](/ref/conversations/conversation#external), будуть збережені.
Це означає, що всі дані, повернуті з `conversation.external`, мають підлягати серіалізації.

Якщо ви хочете повернути дані, які не можна серіалізувати, наприклад, класи або [`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt), ви можете надати власний серіалізатор, щоб виправити це.

```ts
const largeNumber = await conversation.external({
  // Викликаємо API, який повертає BigInt, який не можна серіалізувати в JSON.
  task: () => 1000n ** 1000n,
  // Перетворюємо bigint у рядок для зберігання.
  beforeStore: (n) => String(n),
  // Перетворюємо рядок назад у тип bigint для використання.
  afterLoad: (str) => BigInt(str),
});
```

Якщо ви хочете викинути помилку з функції, ви можете вказати додаткові функції серіалізації обʼєктів помилок.
Перевірте [`ExternalOp`](/ref/conversations/externalop) у довіднику API.

### Ключі сховища

Типово, дані розмов зберігаються для кожного чату.
Це відповідає [роботі плагіна сесій](./session#ключі-сесіі).

Отже, розмова не може обробляти оновлення з декількох чатів.
За бажанням, ви можете [визначити власну функцію ключа зберігання](/ref/conversations/conversationoptions#storage).
Як і у випадку з сесіями, [не рекомендується](./session#ключі-сесіі) використовувати цю опцію у безсерверних середовищах через потенційні стани гонитви.

Також, як і у випадку з сесіями, ви можете зберігати дані розмов у певному просторі імен за допомогою параметра `prefix`.
Це особливо корисно, якщо ви хочете використовувати один і той самий адаптер для зберігання даних сесій і даних розмов.
Зберігання даних у просторах імен запобігатиме їхньому змішуванню.

Ви можете вказати обидві опції ось так.

```ts
bot.use(conversations({
  storage: {
    type: "key",
    adapter: storageAdapter,
    getStorageKey: (ctx) => ctx.from?.id.toString(),
    prefix: "convo-",
  },
}));
```

Якщо до розмови увійшов користувач з ідентифікатором `424242`, ключем зберігання буде `convo-424242`.

Ознайомтеся з довідкою API для [`ConversationStorage`](/ref/conversations/conversationstorage), щоб дізнатися більше про зберігання даних за допомогою плагіна розмов.
Серед іншого, там пояснюється, як зберігати дані взагалі без функції ключа зберігання, використовуючи `type: "context"`.

## Використання плагінів всередині розмов

[Зауважте](#обʼєкти-контексту-розмови), що обʼєкти контексту всередині розмов не залежать від обʼєктів контексту у навколишніх проміжномих обробниках.
Це означає, що вони не будуть мати встановлених плагінів, навіть якщо плагіни встановлені у вашому боті.

На щастя, усі плагіни grammY [окрім сесій](#доступ-до-сесіи-всередині-розмов) сумісні з розмовами.
Наприклад, ось як ви можете встановити плагін [гідратації](./hydrate) для розмови.

::: code-group

```ts [TypeScript]
// Встановлюємо ззовні лише плагін розмов.
type MyContext = ConversationFlavor<Context>;
// Встановлюємо всередині лише плагін гідратації.
type MyConversationContext = HydrateFlavor<Context>;

bot.use(conversations());

// Передаємо зовнішній та внутрішній обʼєкт контексту.
type MyConversation = Conversation<MyContext, MyConversationContext>;
async function convo(conversation: MyConversation, ctx: MyConversationContext) {
  // Плагін гідратації встановлений на `ctx`.
  const other = await conversation.wait();
  // Плагін гідратації також встановлений на контексті `other`.
}
bot.use(createConversation(convo, { plugins: [hydrate()] }));

bot.command("enter", async (ctx) => {
  // Плагін гідратації НЕ встановлений на `ctx` тут.
  await ctx.conversation.enter("convo");
});
```

```js [JavaScript]
bot.use(conversations());

async function convo(conversation, ctx) {
  // Плагін гідратації встановлений на `ctx`.
  const other = await conversation.wait();
  // Плагін гідратації також встановлений на контексті `other`.
}
bot.use(createConversation(convo, { plugins: [hydrate()] }));

bot.command("enter", async (ctx) => {
  // Плагін гідратації НЕ встановлений на `ctx` тут.
  await ctx.conversation.enter("convo");
});
```

:::

У звичайному [проміжному обробнику](../guide/middleware) плагіни виконують певний код на поточному обʼєкті контексту, потім викликають `next`, щоб дочекатися наступного проміжного обробника, а потім знову виконують певний код.

Розмови не є проміжними обробниками, і у цьому контексті плагіни працюватимуть дещо інакше.
Коли розмова створює [обʼєкт контексту](#обʼєкти-контексту-розмови), він буде переданий плагінам, які оброблять його у звичайному режимі.
Для плагінів це виглядає так, ніби встановлені лише плагіни і не існує жодних наступних обробників.
Після обробки всіма плагінами обʼєкт контексту стає доступним для розмови.

У підсумку, будь-яка робота з очищення, виконана плагінами, виконується до того, як буде запущено функцію побудови розмови.
З цим добре працюють усі плагіни, окрім сесій.
Якщо ви хочете використовувати сесії, [прогорність вниз](#доступ-до-сесіи-всередині-розмов).

### Типові плагіни

Якщо у вас багато розмов, які потребують однакового набору плагінів, ви можете визначити типові плагіни.
Тепер вам більше не потрібно передавати `hydrate` до `createConversation`.

::: code-group

```ts [TypeScript]
// TypeScript потребує допомоги з двома типами контексту,
// тому вам часто доведеться вказувати їх для використання плагінів.
bot.use(conversations<MyContext, MyConversationContext>({
  plugins: [hydrate()],
}));
// У цій розмові буде встановлено плагін гідратації.
bot.use(createConversation(convo));
```

```js [JavaScript]
bot.use(conversations({
  plugins: [hydrate()],
}));
// У цій розмові буде встановлено плагін гідратації.
bot.use(createConversation(convo));
```

:::

Переконайтеся, що ви встановили розширювачі контексту всіх типових плагінів на внутрішні типи контексту всіх розмов.

### Використання плагінів-перетворювачі у розмовах

Якщо ви встановлюєте плагін через `bot.api.config.use`, ви не можете передати його безпосередньо до масиву `plugins`.
Замість цього ви повинні встановити його в екземпляр `Api` кожного обʼєкту контексту.
Це легко зробити зсередини звичайного проміжного обробника плагіна.

```ts
bot.use(createConversation(convo, {
  plugins: [async (ctx, next) => {
    ctx.api.config.use(transformer);
    await next();
  }],
}));
```

Замініть `transformer` на будь-який плагін, який ви хочете встановити.
Ви можете встановити декілька перетворювачів в одному виклику `ctx.api.config.use`.

### Доступ до сесій всередині розмов

Через те, [як плагіни працюють всередині розмов](#використання-плагінів-всередині-розмов), [плагін сесії](./session) не може бути встановлений всередині розмови таким самим чином, як інші плагіни.
Ви не можете передати його до масиву `plugins`, оскільки він:

1. Зчитає дані.
2. Викличе `next`, який негайно завершить виконання.
3. Запише назад ті самі дані.
4. Передасть обʼєкт контекст розмові.

Зверніть увагу на те, що сесія зберігається перед тим, як ви її зміните.
Це означає, що всі зміни даних сесії буде втрачено.

Замість цього ви можете використовувати `conversation.external` для отримання [доступу до зовнішнього обʼєкта контексту](#обʼєкти-контексту-розмови).
Саме в ньому встановлено плагін сесії.

```ts
// Зчитуємо дані сесії всередині розмови.
const session = await conversation.external((ctx) => ctx.session);

// Змінюємо дані сесії всередині розмови.
session.count += 1;

// Зберігаємо дані сесії всередині розмови.
await conversation.external((ctx) => {
  ctx.session = session;
});
```

У певному сенсі, використання плагіна сесій можна вважати виконанням побічних ефектів.
Зрештою, сесії отримують доступ до бази даних.
Враховуючи, що ми повинні дотримуватися [золотого правила](#золоте-правило-розмов), цілком логічно, що доступ до сесії має бути загорнутий у `conversation.external`.

## Розмовні меню

Ви можете визначити меню за допомогою [плагіна меню](./menu) поза межами розмови, а потім передати його до масиву `plugins`, [як і будь-який інший плагін](#використання-плагінів-всередині-розмов).

Однак це означає, що меню не матиме доступу до дескриптора розмови `conversation` у своїх обробниках кнопок.
Отже, ви не можете чекати на оновлення зсередини меню.

В ідеалі, після натискання кнопки має бути можливість дочекатися повідомлення від користувача, а потім виконати навігацію по меню, коли користувач відповість.
Це можна зробити за допомогою `conversation.menu()`.
Він дозволяє визначати _розмовні меню_.

```ts
let email = "";

const emailMenu = conversation.menu()
  .text("Отримати поточний email", (ctx) => ctx.reply(email || "порожньо"))
  .text(() => email ? "Змінити email" : "Встановити email", async (ctx) => {
    await ctx.reply("Який ваш email?");
    const response = await conversation.waitFor(":text");
    email = response.msg.text;
    await ctx.reply(`Ваш email: ${email}!`);
    ctx.menu.update();
  })
  .row()
  .url("Довідка", "https://grammy.dev");

const otherMenu = conversation.menu()
  .submenu("Перейти до меню emailʼів", emailMenu, async (ctx) => {
    await ctx.reply("Навігування");
  });

await ctx.reply("Ось ваше меню", {
  reply_markup: otherMenu,
});
```

`conversation.menu()` повертає меню, яке можна створити, додаючи кнопки так само, як це робить плагін меню.
Насправді, якщо ви подивитеся на [`ConversationMenuRange`](/ref/conversations/conversationmenurange) у довіднику API, ви побачите, що він дуже схожий на [`MenuRange`](/ref/menu/menurange) з плагіна меню.

Розмовні меню залишаються активними лише доти, доки активна розмова.
Перед виходом з розмови вам необхідно викликати `ctx.menu.close()` для всіх меню.

Якщо ви хочете запобігти завершенню розмови, ви можете просто використати наступний фрагмент коду наприкінці розмови.
Утім, [майте на увазі](#розмови-зберігають-стан), що це погана ідея --- залишати розмову жити вічно.

```ts
// Очікувати вічно.
await conversation.waitUntil(() => false, {
  otherwise: (ctx) =>
    ctx.reply("Будь ласка, скористайтеся наведеним вище меню!"),
});
```

Нарешті, зверніть увагу, що розмовні меню гарантовано ніколи не перетинаються із зовнішніми меню.
Це означає, що зовнішнє меню ніколи не буде обробляти оновлення меню всередині розмови, і навпаки.

### Сумісність з плагіном меню

Коли ви визначаєте меню поза розмовою і використовуєте його для входу в розмову, ви можете визначити розмовне меню, яке буде діяти доти, доки розмова активна.
Коли розмова завершиться, зовнішнє меню відновить керування.

Спершу ви маєте надати однаковий ідентифікатор обом меню.

```ts
// Ззовні розмови (плагін меню):
const menu = new Menu("my-menu");
// Всередині розмови (розмовне меню):
const menu = conversation.menu("my-menu");
```

Для того, щоб це працювало, ви повинні переконатися, що обидва меню мають однакову структуру, коли ви передаєте керування у розмову або з розмови.
Інакше при натисканні кнопки меню буде [визначено як застаріле](./menu#застарілі-меню-та-відбиток-меню-fingerprint), і обробник кнопки не буде викликано.

Структура базується на двох факторах:

- Форма меню: кількість рядків або кількість кнопок у кожному рядку.
- Напис на кнопці.

Рекомендується спочатку відредагувати меню до вигляду, який відповідає потребам розмови, щойно ви в неї входите.
Після цього розмова може визначити відповідне меню, яке відразу стане активним.

Аналогічно, якщо розмова залишає після себе якісь меню (не закриваючи їх), зовнішні меню зможуть перейняти контроль над ними.
Знову ж таки, структура меню повинна збігатися.

Приклад такої сумісності можна знайти у [репозиторії прикладів ботів](https://github.com/grammyjs/examples?tab=readme-ov-file#menus-with-conversation-menu-with-conversation).

## Розмовні форми

Часто розмови використовуються для побудови форм в інтерфейсі чату.

Усі виклики очікування повертають обʼєкти контексту.
Однак, коли ви чекаєте на текстове повідомлення, ви можете захотіти отримати лише текст повідомлення і не взаємодіяти з рештою елементів обʼєкта контексту.

Форми розмов дають вам можливість поєднати валідацію оновлень з отриманням даних з обʼєкта контексту.
Це схоже на поле у формі.
Розглянемо наступний приклад.

```ts
await ctx.reply("Будь ласка, надішліть мені фото, щоб я зменшив його розмір!");
const photo = await conversation.form.photo();
await ctx.reply("Якою має бути нова ширина фото?");
const width = await conversation.form.int();
await ctx.reply("Якою має бути нова висота фото?");
const height = await conversation.form.int();
await ctx.reply(`Зменшення розміру фото до ${width}x${height} ...`);
const scaled = await scaleImage(photo, width, height);
await ctx.replyWithPhoto(scaled);
```

Існує набагато більше доступних полів форми.
Перегляньте [`ConversationForm`](/ref/conversations/conversationform#methods) у довіднику API.

Всі поля форми приймають функцію `otherwise`, яка буде виконана, коли буде отримано невідповідне оновлення.
Крім того, всі вони приймають функцію `action`, яка буде виконана, коли поле форми буде заповнено правильно.

```ts
// Чекаємо на основну операцію обчислення.
const op = await conversation.form.select(["+", "-", "*", "/"], {
  action: (ctx) => ctx.deleteMessage(),
  otherwise: (ctx) => ctx.reply("Очікується +, -, *, або /!"),
});
```

Розмовні форми навіть дозволяють створювати власні поля за допомогою [`conversation.form.build`](/ref/conversations/conversationform#build).

## Тайм-аути очікування

Кожного разу, коли ви чекаєте на оновлення, ви можете передати значення тайм-ауту.

```ts
// Чекаємо лише одну годину, перш ніж вийти з розмови.
const oneHourInMilliseconds = 60 * 60 * 1000;
await conversation.wait({ maxMilliseconds: oneHourInMilliseconds });
```

Коли виконується виклик очікування, викликається [`conversation.now()`](#золоте-правило-розмов).

Як тільки надходить наступне оновлення, знову викликається `conversation.now()`.
Якщо отримання оновлення зайняло більше `maxMilliseconds`, розмову буде перервано, а оновлення буде повернуто системі проміжних обробників.
Отже, буде запущено будь-який наступне проміжний обробник.

Це створить враження, що на момент отримання оновлення розмова вже не була активною.

Зверніть увагу, що це не призведе до запуску коду через точно вказаний час.
Натомість код буде запущено, як тільки надійде наступне оновлення.

Ви можете вказати типове значення тайм-ауту для всіх викликів очікування всередині розмови.

```ts
// Завжди чекаємо лише одну годину.
const oneHourInMilliseconds = 60 * 60 * 1000;
bot.use(createConversation(convo, {
  maxMillisecondsToWait: oneHourInMilliseconds,
}));
```

Передача значення безпосередньо виклику очікування замінить типове значення.

## Події входу та виходу

Ви можете вказати функцію зворотного виклику, яка буде виконана щоразу, коли ви входите до розмови.
Аналогічно, ви можете вказати функцію зворотного виклику, яка буде виконана при завершенні розмови.

```ts
bot.use(conversations({
  onEnter(id, ctx) {
    // `id` розмови, до якої увійшли.
  },
  onExit(id, ctx) {
    // `id` розмови, з якої вийшли.
  },
}));
```

Кожна функція зворотного виклику отримує два значення.
Перше значення --- це ідентифікатор розмови, до якої увійшли або з якої вийшли.
Друге значення --- це поточний обʼєкт контексту навколишнього проміжного обробника.

Зауважте, що зворотні виклики викликаються лише при вході або виході з розмови через `ctx.conversation`.
Зворотний виклик `onExit` також викликається, коли розмова завершується за допомогою `conversation.halt` або коли [вичерпується час очікування](#таим-аути-очікування).

## Одночасні виклики очікування

Ви можете використовувати комбінований `Promise` для одночасного очікування декількох подій.
Коли надійде нове оновлення, буде виконано лише перший відповідний виклик очікування.

```ts
await ctx.reply("Надішліть фото та підпис!");
const [textContext, photoContext] = await Promise.all([
  conversation.waitFor(":text"),
  conversation.waitFor(":photo"),
]);
await ctx.replyWithPhoto(photoContext.msg.photo.at(-1).file_id, {
  caption: textContext.msg.text,
});
```

У наведеному вище прикладі не має значення, що користувач відправить першим --- фото чи текст.
Обидва `Promise`и будуть виконані в тому порядку, в якому користувач відправить два повідомлення, на які очікує код.
[`Promise.all`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) працює у звичайному режимі; він виконається лише тоді, коли виконаються всі передані `Promise`и.

Це також може бути використано для очікування не повʼязаних між собою подій.
Наприклад, ось як ви можете встановити глобальний обробник завершення розмови всередині неї.

```ts
conversation.waitForCommand("exit") // немає `await`!
  .then(() => conversation.halt());
```

Щойно розмова [завершиться будь-яким чином](#вихід-з-розмов), всі незавершені виклики очікування будуть скасовані.
Наприклад, наступна розмова завершиться одразу після того, як до неї увійшли, не чекаючи жодних оновлень.

::: code-group

```ts [TypeScript]
async function convo(conversation: Conversation, ctx: Context) {
  const _promise = conversation.wait() // немає `await`!
    .then(() => ctx.reply("Мене ніколи не надішлють!"));

  // Розмова завершується одразу після входу.
}
```

```js [JavaScript]
async function convo(conversation, ctx) {
  const _promise = conversation.wait() // немає `await`!
    .then(() => ctx.reply("Мене ніколи не надішлють!"));

  // Розмова завершується одразу після входу.
}
```

:::

Коли декілька викликів очікування надходять одночасно, плагін розмов буде відстежувати список викликів очікування.
Щойно надійде наступне оновлення, він відтворить функцію побудови розмови один раз для кожного виклику очікування, доки один з них не прийме оновлення.
Лише якщо жоден з очікуваних викликів не прийме оновлення, оновлення буде відхилено.

## Контрольні точки та повернення в минуле

Плагін розмов [відстежує](#розмови-—-це-механізм-для-повторного-відтворення) виконання ваших функцій побудови розмов.

Це дозволяє створювати контрольні точки протягом виконання.
Контрольна точка містить інформацію про те, як далеко функція пройшла на даний момент.
Вона може бути використана для того, щоб пізніше повернутися до цієї точки.

При цьому всі операції вводу/виводу, виконані за цей час, не будуть скасовані.
Зокрема, повернення до контрольної точки не призведе до магічного скасування надсилання будь-яких повідомлень.

```ts
const checkpoint = conversation.checkpoint();

// Пізніше:
if (ctx.hasCommand("reset")) {
  await conversation.rewind(checkpoint); // ніколи не повертає результат
}
```

Контрольні точки можуть бути дуже корисними для "повернення назад".
Однак, подібно до `break` та `continue` у JavaScript з [мітками](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label), стрибки можуть зробити код менш читабельним.
**Переконайтеся, що ви не зловживаєте цією можливістю.**

За лаштунками, перемотування розмови перериває виконання розмови так само, як і при виклику очікування.
Потім функція відтворюється лише до того місця, де було створено контрольну точку.
Перемотування розмови не виконує функції в буквальному сенсі у зворотному порядку, хоч це і виглядає саме так.

## Паралельні розмови

Розмови в неповʼязаних чатах повністю незалежні і завжди можуть вестися паралельно.

Однак, у кожному чаті типово може бути лише одна активна розмова.
Якщо ви спробуєте увійти до розмови, коли розмова вже активна, виклик `enter` призведе до помилки.

Ви можете змінити цю поведінку, позначивши розмову як таку, що може виконуватися паралельно.

```ts
bot.use(createConversation(convo, { parallel: true }));
```

Це змінює дві речі.

По-перше, тепер ви можете увійти до цієї розмови, навіть якщо та сама або інша розмова вже активна.
Наприклад, якщо у вас є розмови `captcha` і `settings`, ви можете активувати `captcha` пʼять разів, а `settings` --- дванадцять разів, і все це в одному і тому ж чаті.

По-друге, коли розмова не приймає оновлення, оновлення більше не відхиляється.
Замість цього, управління передається до системи проміжних обробників.

Всі встановлені розмови отримають можливість обробляти вхідне оновлення, доки якась з них не прийме його.
Однак, лише одна розмова зможе фактично обробити оновлення.

Якщо одночасно активними є кілька різних розмов, порядок у системі проміжних обробників визначатиме, яка розмова отримає оновлення першою.
Якщо одна розмова активна кілька разів, найстаріша розмова (та, до якої увійшли першою) отримає можливість обробити оновлення першою.

Це найкраще пояснити на прикладі.

::: code-group

```ts [TypeScript]
async function captcha(conversation: Conversation, ctx: Context) {
  const user = ctx.from!.id;
  await ctx.reply(
    "Ласкаво просимо до чату! Який фреймворк для розробки ботів найкращий?",
  );
  const answer = await conversation.waitFor(":text").andFrom(user);
  if (answer.msg.text === "grammY") {
    await ctx.reply("Правильно! У вас світле майбутнє!");
  } else {
    await ctx.banAuthor();
  }
}

async function settings(conversation: Conversation, ctx: Context) {
  const user = ctx.from!.id;
  const main = conversation.checkpoint();
  const options = ["Налаштування чату", "Довідка", "Приватність"];
  await ctx.reply("Ласкаво просимо до налаштувань!", {
    reply_markup: Keyboard.from(options
      .map((btn) => [Keyboard.text(btn)])),
  });
  const option = await conversation.waitFor(":text")
    .andFrom(user)
    .and((ctx) => options.includes(ctx.msg.text), {
      otherwise: (ctx) => ctx.reply("Будь ласка, використовуйте кнопки!"),
    });
  await openSettingsMenu(option, main);
}

bot.use(createConversation(captcha));
bot.use(createConversation(settings));
```

```js [JavaScript]
async function captcha(conversation, ctx) {
  const user = ctx.from.id;
  await ctx.reply(
    "Ласкаво просимо до чату! Який фреймворк для розробки ботів найкращий?",
  );
  const answer = await conversation.waitFor(":text").andFrom(user);
  if (answer.msg.text === "grammY") {
    await ctx.reply("Правильно! У вас світле майбутнє!");
  } else {
    await ctx.banAuthor();
  }
}

async function settings(conversation, ctx) {
  const user = ctx.from.id;
  const main = conversation.checkpoint();
  const options = ["Налаштування чату", "Довідка", "Приватність"];
  await ctx.reply("Ласкаво просимо до налаштувань!", {
    reply_markup: Keyboard.from(options
      .map((btn) => [Keyboard.text(btn)])),
  });
  const option = await conversation.waitFor(":text")
    .andFrom(user)
    .and((ctx) => options.includes(ctx.msg.text), {
      otherwise: (ctx) => ctx.reply("Будь ласка, використовуйте кнопки!"),
    });
  await openSettingsMenu(option, main);
}

bot.use(createConversation(captcha));
bot.use(createConversation(settings));
```

:::

Наведений вище код працює в групових чатах.
Він надає дві розмови.
Розмова `captcha` використовується для того, щоб переконатися, що до чату приєднуються тільки хороші розробники (безсоромний прикол grammY, хах).
Розмова `settings` використовується для реалізації меню налаштувань у груповому чаті.

Зверніть увагу, що всі виклики очікування фільтруються, серед іншого, за ідентифікатором користувача.

Припустимо, що вже відбулося наступне.

1. Викликано `ctx.conversation.enter("captcha")` для входу до розмови `captcha` під час обробки оновлення від користувача з ідентифікатором `ctx.from.id === 42`.
2. Викликано `ctx.conversation.enter("settings")` для входу до розмови `settings` під час обробки оновлення від користувача з ідентифікатором `ctx.from.id === 3`.
3. Викликано `ctx.conversation.enter("captcha")` для входу до розмови `captcha` під час обробки оновлення від користувача з ідентифікатором `ctx.from.id === 43`.

Це означає, що у цьому груповому чаті зараз активні три розмови: `captcha` активна двічі, а `settings` активна один раз.

> Зауважте, що `ctx.conversation` надає [різні способи](/ref/conversations/conversationcontrols#exit) для виходу з конкретних розмов, навіть якщо увімкнено паралельні розмови.

Далі відбувається наступне.

1. Користувач `3` надсилає повідомлення з текстом `"About"`.
2. Приходить оновлення з текстовим повідомленням.
3. Відтворюється перший екземпляр розмови `captcha`.
4. Виклик `waitFor(":text")` приймає оновлення, але доданий фільтр `andFrom(42)` відхиляє оновлення.
5. Відтворюється другий екземпляр розмови `captcha`.
6. Виклик `waitFor(":text")` приймає оновлення, але доданий фільтр `andFrom(43)` відхиляє оновлення.
7. Всі екземпляри `captcha` відхилили оновлення, тому управління передається системі проміжних обробників.
8. Відтворюється екземпляр розмови `settings`.
9. Виклик очікування завершується, і `option` буде містити обʼєкт контексту для оновлення текстового повідомлення.
10. Викликається функція `openSettingsMenu`.
    Вона може надіслати користувачеві інформаційне повідомлення та відмотати розмову назад до `main`, перезапустивши меню.

Зверніть увагу, що хоча дві розмови чекали, поки користувачі `42` і `43` завершать введення капчі, бот коректно відповів користувачеві `3`, який запустив меню налаштувань.
Виклики очікування з фільтрацією можуть визначати, які оновлення є релевантними для поточної розмови.
Відхилені оновлення пропускаються і можуть бути оброблені в інших розмовах.

У наведеному вище прикладі використовується груповий чат, щоб проілюструвати, як розмови можуть обробляти декілька користувачів паралельно в одному чаті.
Насправді паралельні розмови працюють у всіх чатах.
Це дозволяє вам чекати на різні події в чаті з одним користувачем.

Ви можете комбінувати паралельні розмови з [тайм-аутами очікування](#таим-аути-очікування), щоб зменшити кількість активних розмов.

## Перевірка активних розмов

У проміжному обробнику ви можете перевірити, яка розмова наразі активна.

```ts
bot.command("stats", (ctx) => {
  const convo = ctx.conversation.active("convo");
  console.log(convo); // 0 або 1
  const isActive = convo > 0;
  console.log(isActive); // false або true
});
```

Коли ви передаєте ідентифікатор розмови до `ctx.conversation.active`, вона поверне `1`, якщо ця розмова активна, і `0` в іншому випадку.

Якщо для розмови увімкнено [паралельність](#паралельні-розмови), функція поверне кількість активних на даний момент екземплярів розмови.

Викличте `ctx.conversation.active()` без аргументів, щоб отримати обʼєкт, який містить ідентифікатори усіх активних розмов як ключі.
Відповідні значення описують, скільки екземплярів кожної розмови є активними.

Якщо розмова `captcha` активна двічі, а розмова `settings` активна один раз, `ctx.conversation.active()` буде працювати ось так.

```ts
bot.command("stats", (ctx) => {
  const stats = ctx.conversation.active();
  console.log(stats); // { captcha: 2, settings: 1 }
});
```

## Перехід з версії 1.x на 2.x

Conversations 2.0 --- це повне переписування з нуля.

Незважаючи на те, що основні концепції зовнішнього вигляду API залишилися незмінними, обидві реалізації кардинально відрізняються в тому, як вони працюють під капотом.
У двох словах, міграція з версії 1.x на 2.x призводить до дуже незначних змін у вашому коді, але вимагає від вас видалення всіх збережених даних.
Тобто, всі розмови будуть перезапущені.

### Міграція даних з версії 1.x на 2.x

Під час оновлення з версії 1.x до 2.x немає можливості зберегти поточний стан розмов.

Вам слід просто видалити відповідні дані з ваших сесій.
Подумайте про використання для цього [міграції сесій](./session#міграціі).

Збереження даних про поточні розмови у версії 2.x можна зробити, як описано [тут](#персистентні-розмови).

### Зміни у типах між версією 1.x та 2.x

У версії 1.x тип контексту всередині розмови був тим самим типом контексту, який використовувався у навколишньому проміжному обробнику.

Починаючи з версії 2.x, ви повинні завжди оголошувати два типи контексту --- [тип зовнішнього контексту і тип внутрішнього контексту](#обʼєкти-контексту-розмови).
Ці типи ніколи не можуть бути однаковими, а якщо вони збігаються, то у вашому коді закралася помилка.
Це повʼязано з тим, що тип зовнішнього контексту завжди повинен мати [`ConversationFlavor`](/ref/conversations/conversationflavor), тоді як тип внутрішнього контексту ніколи не повинен мати його встановленим.

Крім того, тепер ви можете встановити [незалежний набір плагінів](#використання-плагінів-всередині-розмов) для кожної розмови.

### Зміни у доступі до сесії між версією 1.x та 2.x

Ви більше не можете використовувати `conversation.session`.
Замість цього ви повинні використовувати `conversation.external`.

```ts
// Зчитуємо дані сесії.
const session = await conversation.session; // [!code --]
const session = await conversation.external((ctx) => ctx.session); // [!code ++]

// Записуємо дані сесії.
conversation.session = newSession; // [!code --]
await conversation.external((ctx) => { // [!code ++]
  ctx.session = newSession; // [!code ++]
}); // [!code ++]
```

> Доступ до `ctx.session` був можливий у версії 1.x, але він завжди був некоректним.
> `ctx.session` більше не доступний у версії 2.x.

### Зміни у сумісності плагінів між версією 1.x та 2.x

Розмови версії 1.x були майже не сумісні з жодним плагіном.
Хоча деякої сумісності можна було досягти за допомогою `conversation.run`.

У версії 2.x цю можливість було вилучено.
Замість цього ви можете передавати плагіни до масиву `plugins`, як описано [тут](#використання-плагінів-всередині-розмов).
Сесії потребують [особливого використання](#зміни-у-доступі-до-сесіі-між-версією-1-x-та-2-x).
Сумісність меню покращилася з впровадженням [розмовних меню](#розмовні-меню).

### Зміни у паралельних розмовах між версією 1.x та 2.x

Паралельні розмови працюють однаково для 1.x і 2.x.

Однак, ця можливість була поширеним джерелом плутанини при ненавмисному використанні.
У версії 2.x вам потрібно спеціально увімкнути цю можливість, вказавши `{ parallel: true }`, як описано [тут](#паралельні-розмови).

Єдиною суттєвою зміною у цій функціональності є те, що оновлення більше не передаються до системи проміжних обробників за замовчуванням.
Замість цього, це робиться тільки тоді, коли розмова позначена як паралельна.

Зауважте, що всі методи очікування і поля форм надають параметр `next` для заміни типової поведінки.
Цей параметр було перейменовано з `drop` у версії 1.x, а семантику прапорця було відповідно змінено.

### Зміни у формах між версією 1.x та 2.x

У 1.x форми були справді зламані.
Наприклад, `conversation.form.text()` повертала текстові повідомлення навіть для оновлень `edited_message` старих повідомлень.
Багато з цих дивацтв було виправлено у версії 2.x.

Виправлення помилок технічно не вважається зміною, що порушує роботу системи, але це все одно суттєва зміна поведінки.

## Загальні відомості про плагін

- Назва: `conversations`
- [Джерело](https://github.com/grammyjs/conversations)
- [Довідка](/ref/conversations/)
