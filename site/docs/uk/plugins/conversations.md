# Розмови (`conversations`)

З легкістю створюйте потужні розмовні інтерфейси.

## Вступ

Більшість чатів складаються з більш ніж одного повідомлення, що очевидно.

Наприклад, ви можете поставити користувачу запитання, а потім дочекатися відповіді.
Це можна повторювати кілька разів, створюючи таким чином розмову.

Замислившись над [middleware](../guide/middleware.md), ви помітите, що все базується на одному [обʼєкті контексту](../guide/context.md) для кожного обробника.
Це означає, що ви завжди обробляєте лише одне повідомлення, до того ж ізольовано.
Непросто написати щось на кшталт "перевірити текст три повідомлення тому" або щось подібне.

**Цей плагін приходить на допомогу:**
Він надає надзвичайно гнучкий спосіб визначення розмов між вашим ботом і користувачами.

Багато фреймворків для створення ботів змушують вас визначати великі обʼєкти конфігурації з кроками, етапами, переходами, покроковими формами тощо.
Це призводить до появи великої кількості шаблонного коду, що ускладнює роботу з ним.
**Цей плагін влаштований інакше.**

Натомість з цим плагіном ви будете використовувати щось набагато потужніше: **код**.
По суті, ви просто визначаєте звичайну функцію JavaScript, яка дозволяє вам керувати ходом розмови.
Коли бот і користувач розмовляють один з одним, функція буде виконуватися вираз за виразом.

Насправді, під капотом це працює не зовсім так.
Але дуже зручно думати про це саме так!
У реальності ваша функція буде виконуватися трохи інакше, але до цього ми ще повернемося [пізніше](#очікування-оновлень).

## Простий приклад

Перш ніж ми зануримося в те, як ви можете створювати розмови, погляньте на короткий приклад JavaScript, який показує, як виглядатиме розмова.

```js
async function greeting(conversation, ctx) {
  await ctx.reply("Привіт! Як тебе звати?");
  const { message } = await conversation.wait();
  await ctx.reply(`Ласкаво просимо до чату, ${message.text}!`);
}
```

У цій розмові бот спочатку привітається з користувачем і запитає його імʼя.
Потім він чекатиме, поки користувач надішле своє імʼя.
Нарешті, бот вітає користувача в чаті, повторюючи його імʼя.

Легко, чи не так?
Давайте подивимося, як саме це зроблено!

## Функції побудови розмов

Спершу давайте імпортуємо кілька речей.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const {
  conversations,
  createConversation,
} = require("@grammyjs/conversations");
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations/mod.ts";
```

</CodeGroupItem>
</CodeGroup>

Тепер ми можемо розглянути, як визначати розмовні інтерфейси.

Основним елементом розмови є функція з двома аргументами.
Ми називаємо її _функцією побудови розмови_.

```js
async function greeting(conversation, ctx) {
  // TODO: запрограмувати розмову
}
```

Давайте подивимося, що це за два параметри.

**Другий параметр** не такий цікавий, це звичайний обʼєкт контексту.
Як завжди, він називається `ctx` і використовує [ваш тип контексту](../guide/context.md#налаштування-обʼєкта-контексту), який може називатися `MyContext`.
Плагін розмов експортує [flavor для контексту](../guide/context.md#додаючии-flavor), який називається `ConversationFlavor`.

**Перший параметр** є центральним елементом цього плагіна.
Він має загальну назву `conversation` і тип `Conversation` ([довідка API](https://deno.land/x/grammy_conversations/mod.ts?s=Conversation)).
Його можна використовувати як обʼєкт для керування розмовою, наприклад, для очікування на введення користувачем певних даних тощо.
Тип `Conversation` очікує [ваш тип контексту](../guide/context.md#налаштування-обʼєкта-контексту) як параметр типу, тому вам варто використовувати `Conversation<MyContext>`.

Підсумовуючи, у TypeScript ваша функція побудови розмови матиме наступний вигляд.

```ts
type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

async function greeting(conversation: MyConversation, ctx: MyContext) {
  // TODO: запрограмувати розмову
}
```

Усередині функції побудови розмови ви можете визначити, як має виглядати ваша розмова.
Перш ніж ми детально розберемо кожну функцію цього плагіна, давайте розглянемо більш складний приклад, ніж [простий](#простии-приклад) вище.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function movie(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Скільки у вас улюблених фільмів?");
  const count = await conversation.form.number();
  const movies: string[] = [];
  for (let i = 0; i < count; i++) {
    await ctx.reply(`Скажіть мені фільм під номером ${i + 1}!`);
    const titleCtx = await conversation.waitFor(":text");
    movies.push(titleCtx.msg.text);
  }
  await ctx.reply("Ось кращий рейтинг!");
  movies.sort();
  await ctx.reply(movies.map((m, i) => `${i + 1}. ${m}`).join("\n"));
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function movie(conversation, ctx) {
  await ctx.reply("Скільки у вас улюблених фільмів?");
  const count = await conversation.form.number();
  const movies = [];
  for (let i = 0; i < count; i++) {
    await ctx.reply(`Скажіть мені фільм під номером ${i + 1}!`);
    const titleCtx = await conversation.waitFor(":text");
    movies.push(titleCtx.msg.text);
  }
  await ctx.reply("Ось кращий рейтинг!");
  movies.sort();
  await ctx.reply(movies.map((m, i) => `${i + 1}. ${m}`).join("\n"));
}
```

</CodeGroupItem>
</CodeGroup>

Чи можете ви зрозуміти, як працюватиме цей бот?

## Встановлення та вхід до розмови

По-перше, якщо ви хочете використовувати плагін розмов, ви **повинні** використовувати [плагін сесії](./session.md).
Ви також повинні встановити сам плагін розмов, перш ніж ви зможете реєструвати окремі розмови у вашому боті.

```ts
// Встановлюємо плагін сесії.
bot.use(session({
  initial() {
    // поки що повертаємо порожній обʼєкт
    return {};
  },
}));

// Встановлюємо плагін розмов.
bot.use(conversations());
```

Далі ви можете встановити функцію побудови розмови як middleware на обʼєкт бота, обернувши її у `createConversation`.

```ts
bot.use(createConversation(greeting));
```

Тепер, коли ваша розмова зареєстрована в боті, ви можете увійти в неї з будь-якого обробника.
Переконайтеся, що ви використовуєте `await` для всіх методів у `ctx.conversation`, інакше ваш код зламається.

```ts
bot.command("start", async (ctx) => {
  await ctx.conversation.enter("greeting");
});
```

Щойно користувач надішле боту команду `/start`, розмова буде розпочата.
Поточний обʼєкт контексту передається другим аргументом до функції побудови розмови.
Наприклад, якщо ви почнете розмову з `await ctx.reply(ctx.message.text)`, вона міститиме оновлення, яке містить `/start`.

::: tip Зміна ідентифікатора розмови

За замовчуванням ви повинні передати назву функції до `ctx.conversation.enter()`.
Однак, якщо ви бажаєте використовувати інший ідентифікатор, ви можете вказати його ось так:

```ts
bot.use(createConversation(greeting, "нова-назва"));
```

Потім ви можете ввійти в розмову наступним чином:

```ts
bot.command("start", (ctx) => ctx.conversation.enter("нова-назва"));
```

:::

Загалом ваш код тепер повинен виглядати приблизно так:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context, session } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

const bot = new Bot<MyContext>("");

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

/** Визначає розмову */
async function greeting(conversation: MyConversation, ctx: MyContext) {
  // TODO: запрограмувати розмову
}

bot.use(createConversation(greeting));

bot.command("start", async (ctx) => {
  // Вводимо оголошену функцію `greeting`
  await ctx.conversation.enter("greeting");
});

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const { Bot, Context, session } = require("grammy");
const {
  conversations,
  createConversation,
} = require("@grammyjs/conversations");

const bot = new Bot("");

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

/** Визначає розмову */
async function greeting(conversation, ctx) {
  // TODO: запрограмувати розмову
}

bot.use(createConversation(greeting));

bot.command("start", async (ctx) => {
  // Вводимо оголошену функцію `greeting`
  await ctx.conversation.enter("greeting");
});

bot.start();
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot, Context, session } from "https://deno.land/x/grammy/mod.ts";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations/mod.ts";

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

const bot = new Bot<MyContext>("");

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

/** Визначає розмову */
async function greeting(conversation: MyConversation, ctx: MyContext) {
  // TODO: запрограмувати розмову
}

bot.use(createConversation(greeting));

bot.command("start", async (ctx) => {
  // Вводимо оголошену функцію `greeting`
  await ctx.conversation.enter("greeting");
});

bot.start();
```

</CodeGroupItem>
</CodeGroup>

### Встановлення з власними даними сесії

Зауважте, що якщо ви використовуєте TypeScript і хочете зберігати власні дані сесії, а також використовувати розмови, вам потрібно буде надати більше інформації про типи компілятору.
Припустимо, у вас є такий інтерфейс, який описує ваші дані сесії:

```ts
interface SessionData {
  /** власна властивість сесії */
  foo: string;
}
```

Ваш тип контексту може мати такий вигляд:

```ts
type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor;
```

Найважливіше, що при встановленні плагіна сесії із зовнішнім сховищем, вам необхідно надати дані сесії в явному вигляді.
Всі адаптери сховищ дозволяють передавати `SessionData` як параметр типу.
Ось, наприклад, як це треба робити при використанні [`freeStorage` (безкоштовне сховище)](./session.md#безкоштовне-сховище), який надає grammY.

```ts
// Встановлюємо плагін сесії.
bot.use(session({
  // Надаємо адаптеру тип сесії.
  storage: freeStorage<SessionData>(bot.token),
  initial: () => ({ foo: "" }),
}));
```

Ви можете робити те саме для всіх інших адаптерів сховищ, наприклад, `new FileAdapter<SessionData>()` тощо.

### Встановлення з декількома сесіями

Авжеж ви можете обʼєднати розмови з [декількома сесіями](./session.md#декілька-сесіи).

Цей плагін зберігає дані розмови всередині властивості `session.conversation`.
Це означає, що якщо ви хочете використовувати декілька сесій, ви повинні вказати цей фрагмент.

```ts
// Встановлюємо плагін сесії.
bot.use(session({
  type: "multi",
  custom: {
    initial: () => ({ foo: "" }),
  },
  conversation: {}, // можемо залишити порожнім
}));
```

Отже, ви можете зберігати дані розмови в іншому місці, окремому від інших даних сесії.
Наприклад, якщо ви залишите конфігурацію розмови порожньою, як показано вище, плагін розмови збереже всі дані в памʼяті.

## Вихід із розмови

Розмова триватиме доти, доки не завершиться функція побудови розмови.
Це означає, що ви можете вийти з розмови за допомогою `return` або `throw`.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function hiAndBye(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Привіт! І бувайте!");
  // Виходимо з розмови:
  return;
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function hiAndBye(conversation, ctx) {
  await ctx.reply("Привіт! І бувайте!");
  // Виходимо з розмови:
  return;
}
```

</CodeGroupItem>
</CodeGroup>

Так, додавати `return` в кінці функції трохи безглуздо, але ідею ви зрозуміли.

Помилка також призведе до виходу з розмови.
Однак [плагін сесії](#встановлення-та-вхід-до-розмови) зберігає дані лише у разі успішного виконання middleware.
Отже, якщо ви викините помилку під час розмови і не перехопите її до того, як вона дійде до плагіна сесії, дані про те, що ви вийшли з розмови, не буде збережено.
Тож наступне повідомлення спричинить ту саму помилку.

Ви можете помʼякшити цю проблему, встановивши [межу помилок](../guide/errors.md#межі-помилок) між сесією та розмовою.
Тоді ви зможете запобігти поширенню помилки вгору по [дереву middleware](../advanced/middleware.md), а значить дозволите плагіну сесії записати дані.

> Зауважте, що якщо ви використовуєте звичайні сесії, вбудовані у памʼять, всі зміни в даних сесії відображаються миттєво, оскільки немає серверної частини сховища даних.
> У цьому випадку вам не потрібно використовувати межі помилок, щоб вийти з розмови, викинувши помилку.

Отже, межі помилок та сесії можуть використовуватися разом.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
bot.use(session({
  storage: freeStorage(bot.token), // налаштуйте як вам потрібно
  initial: () => ({}),
}));
bot.use(conversations());

async function hiAndBye(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Привіт! І бувайте!");
  // Виходимо з розмови:
  throw new Error("Спіймайте мене, якщо зможете!");
}

bot.errorBoundary(
  (err) => console.error("Розмова викинула помилку!", err),
  createConversation(greeting),
);
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
bot.use(session({
  storage: freeStorage(bot.token), // налаштуйте як вам потрібно
  initial: () => ({}),
}));
bot.use(conversations());

async function hiAndBye(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Привіт! І бувайте!");
  // Виходимо з розмови:
  throw new Error("Спіймайте мене, якщо зможете!");
}

bot.errorBoundary(
  (err) => console.error("Розмова викинула помилку!", err),
  createConversation(greeting),
);
```

</CodeGroupItem>
</CodeGroup>

Що б ви не робили, не забудьте [встановити обробник помилок](../guide/errors.md) у вашому боті.

Якщо ви хочете жорстко завершити розмову у вашому звичайному middleware, поки він очікує на введення користувачем певних даних, ви також можете використати `await ctx.conversation.exit()`.
Це просто видалить дані плагіна розмов із сесії.
Часто краще просто повернутися (`return`) з функції, але є кілька прикладів, де використання `await ctx.conversation.exit()` є зручним.
Памʼятайте, що ви повинні дочекатися (`await`) виконання методу.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts{6,22}
async function movie(conversation: MyConversation, ctx: MyContext) {
  // TODO: запрограмувати розмову
}

// Встановлюємо плагін розмов.
bot.use(conversations());

// Завжди виходимо з будь-якої розмови після `/cancel`
bot.command("cancel", async (ctx) => {
  await ctx.conversation.exit();
  await ctx.reply("Виходимо.");
});

// Завжди виходимо з розмови `movie`,
// коли натиснута кнопка `cancel` вбудованої клавіатури.
bot.callbackQuery("cancel", async (ctx) => {
  await ctx.conversation.exit("movie");
  await ctx.answerCallbackQuery("Виходимо з розмови");
});

bot.use(createConversation(movie));
bot.command("movie", (ctx) => ctx.conversation.enter("movie"));
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js{6,22}
async function movie(conversation, ctx) {
  // TODO: запрограмувати розмову
}

// Встановлюємо плагін розмов.
bot.use(conversations());

// Завжди виходимо з будь-якої розмови після `/cancel`
bot.command("cancel", async (ctx) => {
  await ctx.conversation.exit();
  await ctx.reply("Виходимо.");
});

// Завжди виходимо з розмови `movie`,
// коли натиснута кнопка `cancel` вбудованої клавіатури.
bot.callbackQuery("cancel", async (ctx) => {
  await ctx.conversation.exit("movie");
  await ctx.answerCallbackQuery("Виходимо з розмови");
});

bot.use(createConversation(movie));
bot.command("movie", (ctx) => ctx.conversation.enter("movie"));
```

</CodeGroupItem>
</CodeGroup>

Зверніть увагу, що тут важливий порядок.
Ви повинні спочатку встановити плагін розмов, що показано на 6-у рядку, перш ніж викликати `await ctx.conversation.exit()`.
Крім того, загальні обробники скасувань (`cancel`) мають бути встановлені до того, як буде зареєстровано власне розмови, що показано на 22-у рядку.

## Очікування оновлень

Ви можете використовувати обʼєкт розмови `conversation` для очікування наступного оновлення у цьому конкретному чаті.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function waitForMe(conversation: MyConversation, ctx: MyContext) {
  // Очікуємо наступне оновлення:
  const newContext = await conversation.wait();
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function waitForMe(conversation, ctx) {
  // Очікуємо наступне оновлення:
  const newContext = await conversation.wait();
}
```

</CodeGroupItem>
</CodeGroup>

Оновлення може означати, що було надіслано текстове повідомлення, натиснуто кнопку, щось відредаговано або практично будь-яку іншу дію користувача.
Повний список можна знайти в документації Telegram [тут](https://core.telegram.org/bots/api#update).

Метод `wait` завжди повертає новий [обʼєкт контексту](../guide/context.md), який представляє отримане оновлення.
Це означає, що ви завжди маєте справу з такою кількістю обʼєктів контексту, яка відповідає кількості оновлень, отриманих під час розмови.

<CodeGroup>
<CodeGroupItem title="TypeScript" active>

```ts
const TEAM_REVIEW_CHAT = -1001493653006;
async function askUser(conversation: MyConversation, ctx: MyContext) {
  // Запитуємо у користувача його домашню адресу.
  await ctx.reply("Можете вказати свою домашню адресу?");

  // Очікуємо, поки користувач надішле свою адресу:
  const userHomeAddressContext = await conversation.wait();

  // Запитуємо у користувача його національність.
  await ctx.reply("Також вкажіть, будь ласка, вашу національність.");

  // Очікуємо, поки користувач вкаже свою національність:
  const userNationalityContext = await conversation.wait();

  await ctx.reply(
    "Це був останній крок. Тепер, коли я отримав всю необхідну інформацію, я передам її для розгляду нашій команді. Дякую вам!",
  );

  // Тепер ми копіюємо відповіді в інший чат для перегляду.
  await userHomeAddressContext.copyMessage(TEAM_REVIEW_CHAT);
  await userNationalityContext.copyMessage(TEAM_REVIEW_CHAT);
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
const TEAM_REVIEW_CHAT = -1001493653006;
async function askUser(conversation, ctx) {
  // Запитуємо у користувача його домашню адресу.
  await ctx.reply("Можете вказати свою домашню адресу?");

  // Очікуємо, поки користувач надішле свою адресу:
  const userHomeAddressContext = await conversation.wait();

  // Запитуємо у користувача його національність.
  await ctx.reply("Також вкажіть, будь ласка, вашу національність.");

  // Очікуємо, поки користувач вкаже свою національність:
  const userNationalityContext = await conversation.wait();

  await ctx.reply(
    "Це був останній крок. Тепер, коли я отримав всю необхідну інформацію, я передам її для розгляду нашій команді. Дякую вам!",
  );

  // Тепер ми копіюємо відповіді в інший чат для перегляду.
  await userHomeAddressContext.copyMessage(TEAM_REVIEW_CHAT);
  await userNationalityContext.copyMessage(TEAM_REVIEW_CHAT);
}
```

</CodeGroupItem>
</CodeGroup>

Зазвичай поза плагіном розмов кожне з цих оновлень обробляється [системою middleware](../guide/middleware.md) вашого бота.
Отже, ваш бот оброблятиме оновлення через обʼєкт контексту, який передаватиметься вашим обробникам.

У розмовах ви отримаєте цей новий обʼєкт контексту за допомогою виклику `wait`.
Зі свого боку ви можете обробляти різні оновлення по-різному на основі цього обʼєкта.
Наприклад, ви можете перевіряти наявність текстових повідомлень:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function waitForText(conversation: MyConversation, ctx: MyContext) {
  // Очікуємо наступне оновлення:
  ctx = await conversation.wait();
  // Перевіряємо наявність тексту:
  if (ctx.message?.text) {
    // ...
  }
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function waitForText(conversation, ctx) {
  // Очікуємо наступне оновлення:
  ctx = await conversation.wait();
  // Перевіряємо наявність тексту:
  if (ctx.message?.text) {
    // ...
  }
}
```

</CodeGroupItem>
</CodeGroup>

Крім того, поряд з `wait` існує низка інших методів, які дозволяють вам очікувати лише певні оновлення.
Одним з прикладів є `waitFor`, який отримує [запит фільтрування](../guide/filter-queries.md), а потім очікує лише оновлення, які відповідають наданому запиту.
Це особливо ефективно у поєднанні з [деструктуризацією обʼєктів](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment):

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function waitForText(conversation: MyConversation, ctx: MyContext) {
  // Очікуємо наступне оновлення текстового повідомлення:
  const { msg: { text } } = await conversation.waitFor("message:text");
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function waitForText(conversation, ctx) {
  // Очікуємо наступне оновлення текстового повідомлення:
  const { msg: { text } } = await conversation.waitFor("message:text");
}
```

</CodeGroupItem>
</CodeGroup>

Зверніться до [довідки API](https://deno.land/x/grammy_conversations/mod.ts?s=ConversationHandle#method_wait_0), щоб переглянути всі доступні методи, схожі на `wait`.

## Три золоті правила розмов

Існує три правила, які стосуються коду, який ви пишете всередині функції побудови розмови.
Ви повинні дотримуватися їх, якщо хочете, щоб ваш код працював коректно.

Прокрутіть [вниз](#як-це-працює), якщо ви хочете дізнатися більше про те, чому застосовуються ці правила й що насправді роблять виклики `wait`.

### 1-е правило: всі побічні ефекти повинні бути загорнуті

Код, який залежить від зовнішньої системи, наприклад, бази даних, API, файлів або інших ресурсів, які можуть змінюватися від одного виконання до іншого, повинен бути обгорнутий у виклики `conversation.external()`.

```ts
// ПОГАНО
const response = await externalApi();
// ДОБРЕ
const response = await conversation.external(() => externalApi());
```

Це включає як читання даних, так і виконання побічних ефектів, наприклад, запис до бази даних.

::: tip Порівняння з React

Якщо ви знайомі з React, ви можете знати схожу концепцію з `useEffect`.

:::

### 2-е правило: будь-яка випадкова поведінка повинна бути загорнута

Код, який залежить від випадковості або від глобального стану, який може змінюватися, має бути загорнутий у виклики `conversation.external()` або використовувати зручний метод `conversation.random()`.

```ts
// ПОГАНО
if (Math.random() < 0.5) { /* робимо щось */ }
// ДОБРЕ
if (conversation.random() < 0.5) { /* робимо щось */ }
```

### 3-є правило: використовуйте зручні методи

У `conversation` встановлено багато речей, які можуть дуже допомогти вам.
Ваш код іноді навіть не ламається, якщо ви їх не використовуєте, але навіть тоді він може працювати повільно або поводитися заплутано.

```ts
// `ctx.session` зберігає зміни лише для останнього обʼєкта контексту
conversation.session.myProp = 42; // надійніше!

// `Date.now()` може бути неточним всередині розмов
await conversation.now(); // точніше!

// Логування для налагодження за допомогою обʼєкта розмови, не друкує заплутані логи
conversation.log("Hello, world"); // прозоріше!
```

Зауважте, що ви можете зробити все це за допомогою `conversation.external()`, але може бути нудно писати так багато коду, який щоразу повторюється, тому простіше скористатися зручними методами ([довідка API](https://deno.land/x/grammy_conversations/mod.ts?s=ConversationHandle#Methods)).

## Змінні, розгалуження та цикли

Якщо ви дотримуєтесь трьох вищезгаданих правил, ви можете використовувати будь-який код, який вам подобається.
Зараз ми розглянемо кілька концепцій, які ви вже знаєте з програмування, і покажемо, як вони перетворюються на чисті та читабельні розмови.

Уявіть, що весь код нижче написаний всередині функції побудови розмови.

Ви можете оголошувати змінні та робити з ними все, що завгодно:

```ts
await ctx.reply("Надішліть мені свої улюблені числа через кому!");
const { message } = await conversation.waitFor("message:text");
const sum = message.text
  .split(",")
  .map((n) => parseInt(n.trim(), 10))
  .reduce((x, y) => x + y);
await ctx.reply("Сума цих чисел складає " + sum);
```

Розгалуження також працює:

```ts
await ctx.reply("Надішліть мені фото!");
const { message } = await conversation.wait();
if (!message?.photo) {
  await ctx.reply("Це не фотографія! Я пішов!");
  return;
}
```

Так само як і цикли:

```ts
do {
  await ctx.reply("Надішліть мені фото!");
  ctx = await conversation.wait();

  if (ctx.message?.text === "/cancel") {
    await ctx.reply("Скасовано, виходимо!");
    return;
  }
} while (!ctx.message?.photo);
```

## Функції та рекурсія

Ви також можете розділити код на кілька функцій і використовувати їх повторно.
Наприклад, так можна визначити багаторазову капчу.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function captcha(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Доведіть, що ви людина! Яка відповідь на все?");
  const { message } = await conversation.wait();
  return message?.text === "42";
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function captcha(conversation, ctx) {
  await ctx.reply("Доведіть, що ви людина! Яка відповідь на все?");
  const { message } = await conversation.wait();
  return message?.text === "42";
}
```

</CodeGroupItem>
</CodeGroup>

Вона повертає `true`, якщо користувач може пройти, інакше `false`.
Тепер ви можете використовувати її у вашій основній функції побудови розмови наступним чином:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function enterGroup(conversation: MyConversation, ctx: MyContext) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("Ласкаво просимо!");
  else await ctx.banChatMember();
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function enterGroup(conversation, ctx) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("Ласкаво просимо!");
  else await ctx.banChatMember();
}
```

</CodeGroupItem>
</CodeGroup>

Подивіться, як функцію капчі можна повторно використовувати в різних місцях вашого коду.

> Цей простий приклад призначений лише для того, щоб проілюструвати, як працюють функції.
> Насправді він може працювати погано, оскільки лише чекає на нове оновлення з відповідного чату, але не перевіряє, чи дійсно воно надходить від того самого користувача, який приєднався до чату.
> Якщо ви хочете створити справжню капчу, скористайтеся [паралельними розмовами](#паралельні-розмови).

Якщо ви хочете, ви також можете розбити свій код на ще більшу кількість функцій або використовувати рекурсію, взаємну рекурсію, генератори тощо.
Просто переконайтеся, що всі функції відповідають [трьом правилам](#три-золоті-правила-розмов).

Звичайно, ви також можете використовувати обробку помилок у своїх функціях.
Звичайні оператори `try`/`catch` працюють чудово, в тому числі й у функціях.
Зрештою, розмови - це всього лише JavaScript.

Якщо основна функція розмови викине помилку, вона пошириться далі в [механізми обробки помилок](../guide/errors.md) вашого бота.

## Модулі та класи

Звичайно, ви можете просто переміщувати функції між модулями.
Отже, ви можете визначити деякі функції в одному файлі, експортувати їх, а потім імпортувати й використовувати їх в іншому файлі.

Якщо ви хочете, ви також можете визначати класи.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
class Auth {
  public token?: string;

  constructor(private conversation: MyConversation) {}

  authenticate(ctx: MyContext) {
    const link = getAuthLink(); // певним чином отримуємо посилання для авторизації
    await ctx.reply(
      `Перейдіть за цим посиланням, щоб отримати токен, а потім надішліть його мені: ${link}`,
    );
    ctx = await this.conversation.wait();
    this.token = ctx.message?.text;
  }

  isAuthenticated(): this is Auth & { token: string } {
    return this.token !== undefined;
  }
}

async function askForToken(conversation: MyConversation, ctx: MyContext) {
  const auth = new Auth(conversation);
  await auth.authenticate(ctx);
  if (auth.isAuthenticated()) {
    const token = auth.token;
    // робимо щось з токеном
  }
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
class Auth {
  constructor(conversation) {
    this.#conversation = conversation;
  }

  authenticate(ctx) {
    const link = getAuthLink(); // певним чином отримуємо посилання для авторизації
    await ctx.reply(
      `Перейдіть за цим посиланням, щоб отримати токен, а потім надішліть його мені: ${link}`,
    );
    ctx = await this.#conversation.wait();
    this.token = ctx.message?.text;
  }

  isAuthenticated() {
    return this.token !== undefined;
  }
}

async function askForToken(conversation, ctx) {
  const auth = new Auth(conversation);
  await auth.authenticate(ctx);
  if (auth.isAuthenticated()) {
    const token = auth.token;
    // робимо щось з токеном
  }
}
```

</CodeGroupItem>
</CodeGroup>

Справа не в тому, що ми наполегливо рекомендуємо вам це робити.
Це скоріше приклад того, як можна використовувати безмежну гнучкість JavaScript для структурування коду.

## Форми

Як згадувалося [раніше](#очікування-оновлень), в обʼєкті розмови є кілька різних допоміжних методів, як-от `await conversation.waitFor('message:text')`, який повертає лише оновлення текстових повідомлень.

Якщо цих методів недостатньо, плагін розмов надає ще більше допоміжних методів для створення форм за допомогою `conversation.form`.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function waitForMe(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Скільки вам років?");
  const age: number = await conversation.form.number();
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function waitForMe(conversation, ctx) {
  await ctx.reply("Скільки вам років?");
  const age = await conversation.form.number();
}
```

</CodeGroupItem>
</CodeGroup>

Як завжди, зверніться до [довідки API](https://deno.land/x/grammy_conversations/mod.ts?s=ConversationForm), щоб дізнатися, які методи доступні.

## Робота з плагінами

Як згадувалося [раніше](#вступ), обробники grammY завжди обробляють лише одне оновлення.
Однак за допомогою розмов ви можете обробляти багато оновлень послідовно, ніби всі вони доступні одночасно.
Плагін робить це можливим завдяки збереженню старих обʼєктів контексту та їх повторному завантаженню пізніше.

Ось чому деякі плагіни grammY не завжди впливають на обʼєкти контексту всередині розмов так, як очікується.
Це стосується наступних плагінів:

- [меню](./menu.md),
- [гідратація (`hydrate`)](./hydrate.md),
- інтернаціоналізація за допомогою [`i18n`](./i18n.md) чи [`fluent`](./fluent.md),
- [емодзі](./emoji.md).

Спільним для них є те, що всі вони зберігають функції на обʼєкті контексту, з яким плагін розмов не може коректно працювати.
Отже, якщо ви хочете обʼєднати розмови з одним із цих плагінів grammY, вам доведеться використовувати спеціальний синтаксис для встановлення іншого плагіна всередині кожної розмови.

Ви можете встановити інші плагіни всередині розмов за допомогою `conversation.run`:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function convo(conversation: MyConversation, ctx: MyContext) {
  // Встановлюємо плагін grammY
  await conversation.run(plugin());
  // Продовжуємо визначати розмову ...
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function convo(conversation, ctx) {
  // Встановлюємо плагін grammY
  await conversation.run(plugin());
  // Продовжуємо визначати розмову ...
}
```

</CodeGroupItem>
</CodeGroup>

Це зробить плагін доступним всередині розмови.

Наприклад, якщо ви хочете використовувати меню всередині розмови, ваш код може виглядати так.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
async function convo(conversation: MyConversation, ctx: MyContext) {
  const menu = new Menu<MyContext>()
    .text("Натиснути", (ctx) => ctx.reply("Привіт!"));
  await conversation.run(menu);

  // Продовжуємо визначати розмову ...
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
async function convo(conversation, ctx) {
  const menu = new Menu()
    .text("Натиснути", (ctx) => ctx.reply("Привіт!"));
  await conversation.run(menu);

  // Продовжуємо визначати розмову ...
}
```

</CodeGroupItem>
</CodeGroup>

### Власні обʼєкти контексту

Якщо ви використовуєте [власний обʼєкт контексту](../guide/context.md#налаштування-обʼєкта-контексту) й хочете встановити власні властивості на ваші обʼєкти контексту перед початком розмови, то деякі з цих властивостей також можуть бути втрачені.
Певною мірою middleware, який ви використовуєте для налаштування обʼєкта контексту, також можна вважати плагіном.

Найчистішим рішенням є повне **уникнення власних властивостей контексту** або, принаймні, встановлення на обʼєкті контексту лише тих властивостей, які можна серіалізувати.
Інакше кажучи, якщо всі власні властивості контексту можна зберігати у базі даних і згодом відновлювати, вам не потрібно ні про що турбуватися.

Звичайно, існують інші способи вирішення проблем, які ви зазвичай вирішуєте за допомогою власних властивостей контексту.
Наприклад, часто можна просто отримати їх у самій розмові, замість того, щоб отримувати їх в обробнику.

Якщо жоден з цих варіантів вам не підходить, ви можете спробувати самостійно попрацювати з `conversation.run`.
Ви маєте знати, що ви повинні викликати `next` всередині переданого middleware, інакше обробку оновлень буде перехоплено.

Middleware буде виконано для всіх попередніх оновлень кожного разу, коли надійде нове оновлення.
Наприклад, якщо надходять три обʼєкти контексту, станеться наступне:

1. Отримано 1-е оновлення.
2. Middleware виконується для 1-го оновлення
3. Отримано 2-е оновлення.
4. Middleware виконується для 1-го оновлення.
5. Middleware виконується для 2-го оновлення.
6. Отримано 3-є оновлення.
7. Middleware виконується для 1-го оновлення.
8. Middleware виконується для 2-го оновлення.
9. Middleware виконується для 3-го оновлення.

Зверніть увагу, що middleware тричі виконується для 1-го оновлення.

## Паралельні розмови

Звичайно, плагін розмов може вести будь-яку кількість розмов паралельно в різних чатах.

Однак, якщо вашого бота додано до групового чату, він може захотіти вести розмови з кількома різними користувачами паралельно _в одному чаті_.
Наприклад, якщо ваш бот має капчу, яку він хоче надіслати всім новим користувачам.
Якщо двоє користувачів приєднуються одночасно, бот повинен мати можливість вести з ними дві незалежні розмови.

Ось чому плагін розмов дозволяє вести кілька розмов одночасно для кожного чату.
Наприклад, можна вести пʼять різних розмов з пʼятьма новими користувачами, і в той же час спілкуватися з адміністратором щодо нових налаштувань чату.

### Як це працює за кулісами

Кожне вхідне оновлення буде оброблятися лише однією з активних розмов у чаті.
Подібно до middleware обробників, розмови будуть викликатися в порядку їх реєстрації.
Якщо розмову запущено кілька разів, ці екземпляри розмови буде викликано у хронологічному порядку.

Кожен екземпляр розмови може або обробити оновлення, або викликати `await conversation.skip()`.
У першому випадку оновлення буде просто поглинено, поки розмова буде його обробляти.
У другому випадку розмова фактично скасує отримання оновлення і передасть його наступній розмові.
Якщо всі розмови пропускають оновлення, потік керування буде передано назад до системи middleware, яка запустить всі наступні обробники.

Це дозволяє розпочати новий діалог зі звичайного middleware.

### Як ви можете це використовувати

На практиці, вам ніколи не потрібно викликати `await conversation.skip()` взагалі.
Замість цього ви можете використовувати такі речі, як `await conversation.waitFrom(userId)`, які подбають про деталі за вас.
Це дозволить вам спілкуватися лише з одним користувачем у груповому чаті.

Для прикладу, давайте застосуємо приклад з капчею знову, але цього разу з паралельними розмовами.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts{4}
async function captcha(conversation: MyConversation, ctx: MyContext) {
  if (ctx.from === undefined) return false;
  await ctx.reply("Доведіть, що ви людина! Яка відповідь на все?");
  const { message } = await conversation.waitFrom(ctx.from);
  return message?.text === "42";
}

async function enterGroup(conversation: MyConversation, ctx: MyContext) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("Ласкаво просимо!");
  else await ctx.banChatMember();
}
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js{4}
async function captcha(conversation, ctx) {
  if (ctx.from === undefined) return false;
  await ctx.reply("Доведіть, що ви людина! Яка відповідь на все?");
  const { message } = await conversation.waitFrom(ctx.from);
  return message?.text === "42";
}

async function enterGroup(conversation, ctx) {
  const ok = await captcha(conversation, ctx);

  if (ok) await ctx.reply("Ласкаво просимо!");
  else await ctx.banChatMember();
}
```

</CodeGroupItem>
</CodeGroup>

Зверніть увагу, що ми очікуємо лише на повідомлення від певного користувача.

Тепер у нас є простий обробник, який входить у розмову, коли в чат приєднується новий учасник.

```ts
bot.on("chat_member")
  .filter((ctx) => ctx.chatMember.old_chat_member.status === "left")
  .filter((ctx) => ctx.chatMember.new_chat_member.status === "member")
  .use((ctx) => ctx.conversation.enter("enterGroup"));
```

### Перевірка активних розмов

Ви можете побачити, скільки розмов з яким ідентифікатором ведеться.

```ts
const stats = await ctx.conversation.active();
console.log(stats); // { "enterGroup": 1 }
```

Це буде надано у вигляді обʼєкта, який має ідентифікатори розмов як ключі та число, що вказує на кількість запущених розмов для кожного ідентифікатора.

## Як це працює

> [Памʼятайте](#три-золоті-правила-розмов), що код у ваших функціях побудови розмов має відповідати трьом правилам.
> Зараз ми побачимо, _чому_ вам потрібно будувати їх саме так.

Спершу ми подивимося, як цей плагін працює концептуально, а потім розглянемо деякі деталі.

### Як працюють виклики `wait`

Давайте на деякий час поміняємо точку зору і поставимо питання з точки зору розробника плагіна.
Як реалізувати виклик `wait` в плагіні?

Наївний підхід до реалізації виклику `wait` у плагіні розмов полягав би у створенні нового `Promise` та очікуванні, поки не прийде наступний обʼєкт контексту.
Як тільки це станеться, ми виконаємо (`resolve`) `Promise`, тому розмова зможе продовжитися.

Однак, це погана ідея з кількох причин.

**Втрата даних.**
Що, якщо ваш сервер вийде з ладу під час очікування обʼєкта контексту?
У такому випадку ми втрачаємо всю інформацію про стан розмови.
По суті, бот втрачає хід своїх думок, а користувачеві доводиться починати все спочатку.
Це поганий та дратівливий дизайн.

**Блокування.**
Якщо виклики `wait` блокуються до отримання наступного оновлення, це означає, що виконання middleware для першого оновлення не може завершитися, доки не завершиться вся розмова.

- Для вбудованого тривалого опитування це означає, що жодне наступне оновлення не може бути оброблене, поки не завершиться поточне.
  Отже, бот буде просто заблоковано назавжди.
- Для [плагіну для конкурентності (runner)](./runner.md) бот не буде заблокований.
  Однак, обробляючи тисячі розмов паралельно з різними користувачами, він потенційно споживатиме дуже великі обсяги памʼяті.
  Якщо багато користувачів перестануть відповідати, бот застрягне посеред незліченної кількості розмов.
- Вебхуки мають свою власну [категорію проблем](../guide/deployment-types.md#своєчасне-завершення-запитів-вебхуків) з довготривалим middleware.

**Стан.**
У безсерверній інфраструктурі, як-от хмарні функції, ми не можемо припускати, що один і той самий екземпляр обробляє два наступних оновлення від одного й того ж користувача.
Отже, якщо ми створимо розмови зі станом, вони можуть постійно випадково перериватися, оскільки деякі виклики `wait` не обробляються, а інший middleware несподівано виконується.
Наслідком цього є велика кількість випадкових помилок і хаос.

Проблем насправді ще більше, але ідею ви зрозуміли.

Отже, плагін розмов робить все інакше.
Зовсім інакше.
Як згадувалося раніше, **виклики `wait` не змушують вашого бота чекати в _буквальному сенсі_**, хоча ми можемо запрограмувати розмови так, ніби це саме так і відбувається.

Плагін розмов відстежує виконання вашої функції.
Коли надходить виклик `wait`, він серіалізує стан виконання в сесію й безпечно зберігає її в базі даних.
Коли надходить наступне оновлення, він спочатку перевіряє дані сесії.
Якщо він виявляє, що зупинився посеред розмови, він десеріалізує стан виконання, бере вашу функцію побудови розмови й відтворює її до моменту останнього виклику `wait`.
Після цього відновлюється звичайне виконання вашої функції, а саме до наступного виклику `wait`, після чого виконання має бути знову зупинено.

Що ми маємо на увазі під станом виконання?
Якщо коротко, то він складається з трьох речей:

1. Вхідні оновлення.
2. Вихідні виклики API.
3. Зовнішні події та ефекти, як-от випадковість або виклики зовнішніх API або баз даних.

Що ми маємо на увазі під повторним виконанням?
Повторне виконання означає звичайний виклик функції з самого початку, але коли вона виконує такі дії, як виклик `wait` або виклик API, ми насправді не робимо нічого з цього.
Замість цього, ми перевіряємо записи в журналі, у якому ми зберегли значення, які були повернуті під час попереднього запуску.
Потім ми підставляємо ці значення, завдяки цьому функція побудови розмови виконується дуже швидко, до тих пір, доки не скінчаться записи в журналі.
У цей момент ми перемикаємося назад у звичайний режим виконання, тобто припиняємо підставляти значення і знову починаємо виконувати виклики API.

Ось чому плагін повинен відстежувати всі вхідні оновлення, а також всі виклики API бота.
Дивіться 1-й та 2-й пункт вище.
Однак, плагін не має контролю над зовнішніми подіями, побічними ефектами або випадковістю.
Наприклад, ви можете зробити наступне:

```ts
if (Math.random() < 0.5) {
  // робимо щось
} else {
  // робимо щось інше
}
```

У такому випадку при виклику функції вона може раптово поводитися по-різному кожного разу, так що повторне виконання функції призведе до збою!
Вона може випадково спрацювати інакше, ніж при початковому виконанні.
Ось чому існує 3-й пункт, а ви повинні дотримуватися [3-х золотих правил](#три-золоті-правила-розмов).

### Як перехопити виконання функції

Концептуально кажучи, ключові слова `async` та `await` дають нам контроль над тим, де потік [витісняється](https://uk.wikipedia.org/wiki/Витискальна_багатозадачність).
Отже, якщо хтось викликає `await conversation.wait()`, яка є функцією нашої бібліотеки, ми маємо право витіснити виконання.

Якщо говорити конкретніше, то секретний примітив ядра, який дозволяє нам переривати виконання функції, - це `Promise`, який ніколи не завершується (`resolve`).

```ts
await new Promise<never>(() => {}); // БУМ
```

Якщо ви дочекаєтеся (`await`) такого `Promise` в будь-якому файлі JavaScript, виконання програми миттєво завершиться.
Не соромтеся вставити наведений вище код у файл і випробувати його.

Оскільки ми, очевидно, не хочемо вбивати середовище виконання JS, нам потрібно перехопити (`catch`) це знову.
Як би ви це зробили?
Не соромтеся звертатися до вихідного коду плагіна, якщо це не є одразу очевидним для вас.

## Загальні відомості про плагін

- Назва: `conversations`
- Джерело: <https://github.com/grammyjs/conversations>
- Довідка: <https://deno.land/x/grammy_conversations/mod.ts>
