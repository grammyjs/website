---
prev:
  text: Про grammY
  link: ./about
---

# Часті Питання

Тут зібрано відповіді на найбільш поширені запитання, які більше нікуди не потрапили.
Питання щодо [типових помилок](#чому-я-отримую-цю-помилку) та [проблем, повʼязаних з Deno](#запитання-про-deno), були згруповані у двох окремих розділах.

Якщо у цих ЧаПи немає відповіді на ваше запитання, ознайомтеся з [ЧаПи про ботів](https://core.telegram.org/bots/faq), створеними командою Telegram.

## Де я можу знайти довідку про метод?

У довідці по API.
Також вам, напевно, буде корисним ознайомитися з [посібником](../guide/).

## У методі відсутній параметр!

Ні, це не так.

1. Переконайтеся, що у вас встановлена остання версія grammY.
2. Перевірте [тут](https://core.telegram.org/bots/api), чи є параметр опціональним.
   Якщо це так, то він знаходиться в обʼєкті необовʼязкових параметрів під назвою `other`.
   Передайте `{ назва_параметру: значення }` у цьому місці, тоді це спрацює.
   Звичайно, TypeScript буде автоматично доповнювати назви параметрів для вас.
3. Перевірте [тут](/ref/core/context#methods) сигнатуру [методу](../guide/context#доступні-діі) обʼєкту контексту `ctx` або перевірте [тут](/ref/core/api#methods) сигнатуру методу API: `ctx.api`, `bot.api`.

## Як я можу отримати доступ до історії чату?

Ви не можете.

Telegram не зберігає повідомлення для вашого бота.

Замість цього вам потрібно дочекатися надходження нових повідомлень або дописів каналу і зберегти їх у вашій базі даних.
Потім ви можете завантажити історію чату з вашої бази даних.

Це те, що [плагін розмов](../plugins/conversations) робить всередині для відповідної частини історії повідомлень.

## Як я можу обробляти альбоми?

Ви не можете...
Принаймні, не так, як ви думаєте.

Альбом реально існує лише в інтерфейсі клієнта Telegram.
Для бота робота з медіа-групою --- це те саме, що робота з серією окремих повідомлень.
Найпрактичніша порада --- ігнорувати існування медіа-груп і просто створювати бота для роботи з окремими повідомленнями.
Тоді альбоми працюватимуть автоматично.
Наприклад, ви можете попросити користувача [натиснути кнопку](../plugins/keyboard#вбудовані-клавіатури) або надіслати `/done`, коли всі файли буде завантажено до чату вашого бота.

_Але якщо це вміє клієнт Telegram, то мій бот повинен вміти те ж саме!_

І так, і ні.
Технічно, існує `media_group_id`, який дозволяє визначити повідомлення, що належать до одного альбому.
Однак є кілька нюансів:

- немає можливості дізнатися кількість повідомлень в альбомі,
- неможливо дізнатися, коли було отримано останнє повідомлення в альбомі,
- між повідомленнями в альбомі можуть надсилатися інші повідомлення, як-от текстові, службові тощо.

Так, теоретично, ви можете знати, які повідомлення належать до одного альбому, але тільки щодо тих повідомлень, які ви отримали на даний момент.
Ви не можете знати, чи будуть додані нові повідомлення до альбому пізніше.
Якщо ви коли-небудь отримували альбом у клієнті Telegram при _надзвичайно_ поганому інтернет-зʼєднанні, ви могли побачити, як клієнт неодноразово перегруповує альбом в міру того, як надходять нові повідомлення.

## Чому я отримую цю помилку?

### 400 Bad Request: Cannot parse entities

Ви надсилаєте повідомлення з форматуванням, тобто встановили `parse_mode` під час надсилання повідомлення.
Проте форматування вашого повідомлення неправильне, тому Telegram не знає, як його розібрати.
Вам варто перечитати [розділ про форматування](https://core.telegram.org/bots/api#formatting-options) у документації Telegram.
Байтовий зсув, вказаний у повідомленні про помилку, надасть інформацію про те, де саме у тексті повідомлення міститься помилка.

::: tip Передача сутностей замість форматування
Ви можете попередньо розібрати сутності для Telegram і вказати `entities` при надсиланні повідомлення.
Тоді текст вашого повідомлення може бути звичайним текстом без форматування.
Отже, вам не доведеться турбуватися про екранування незвичайних символів.
Може здаватися, що це потребує більше коду, але це набагато надійніше й безпечніше рішення цієї проблеми.
А головне, що це значно простіше завдяки плагіну [parse-mode](../plugins/parse-mode).
:::

### 401 Unauthorized

Ваш токен бота неправильний.
Можливо, ви вважаєте, що він правильний.
Але це не так.
Зверніться до [@BotFather](https://t.me/BotFather), щоб дізнатися токен вашого боту.

### 403 Forbidden: bot was blocked by the user

Ймовірно, ви намагалися надіслати повідомлення користувачеві, однак виникла ця помилка.

Коли користувач блокує вашого бота, ви не зможете надсилати йому повідомлення або іншим чином взаємодіяти з ним, за винятком випадків, коли ваш бот був запрошений до групового чату, учасником якого є цей користувач.
Telegram робить це для захисту своїх користувачів.
Ви не можете нічого з цим зробити.

Але ви можете:

- Обробити цю помилку і, наприклад, видалити дані користувача з вашої бази даних.
- Ігнорувати помилку.
- Обробляти оновлення `my_chat_member` через `bot.on("my_chat_member")`, щоб отримувати сповіщення, коли користувач блокує вашого бота.
  Порада: Порівняйте поля `status` старого і нового учасника чату.

### 404 Not found

Якщо це відбувається під час запуску бота, це означає, що токен бота неправильний.
Зверніться до [@BotFather](https://t.me/BotFather), щоб дізнатися токен вашого боту.

Якщо ваш бот працює нормально більшість часу, але раптом ви отримуєте помилку 404, це означає, що ви робите дещо незвичайне.
Ви можете задати нам питання в [англомовному](https://t.me/grammyjs) або [російськомовному](https://t.me/grammyjs_ru) групових чатах.

### 409 Conflict: terminated by other getUpdates request

Ви помилково запустили бота двічі під час тривалого опитування.
Ви можете запустити лише один екземпляр бота.

Якщо ви вважаєте, що запустили бота лише один раз, ви можете просто змінити токен вашого бота.
Це зупинить всі інші екземпляри бота.
Зверніться до [@BotFather](https://t.me/BotFather), щоб це зробити.

### 429: Too Many Requests: retry after X

Вітаємо!
Ви стикнулися з помилкою, яка є однією з найскладніших для виправлення.

Існує два можливих сценарії:

**Перший:** У вашого бота небагато користувачів.
У такому випадку ви просто надсилаєте занадто багато запитів на сервери Telegram.
Рішення: не робіть цього!
Вам слід серйозно замислитись над тим, яким чином можна зменшити кількість запитів до API.

**Другий:** Ваш бот став дуже популярним і має багато користувачів (сотні тисяч).
Якщо ви вже переконалися, що використовуєте мінімальну кількість запитів до API для найбільш популярних функцій вашого бота, але все одно стикаєтеся з такими помилками, так званим _flood wait_.

Є кілька речей, які ви можете зробити:

1. Прочитати [статтю](../advanced/flood) в документації, щоб отримати базове розуміння ситуації.
2. Використовувати плагін [`auto-retry`](../plugins/auto-retry).
3. Звернутися по допомогу до нас у [груповий чат](https://t.me/grammyjs).
   Там є досвідчені люди.
4. Можна попросити Telegram збільшити ліміти, але це дуже малоймовірно, якщо ви не виконали кроки з 1-го по 3-й.

### Cannot find type definition file for 'node-fetch'

Це результат деяких відсутніх оголошень типів.

Рекомендованим способом виправлення є встановлення `skipLibCheck` у значення `true` у параметрах компіляції TypeScript.

Якщо ви впевнені, що вам потрібно залишити цей параметр у значенні `false`, ви можете замість цього встановити відсутні визначення типів, виконавши `npm i -D @types/node-fetch@2`.

## Запитання про Deno

### Чому ви підтримуєте Deno?

Кілька важливих причин, чому ми любимо Deno більше, ніж Node.js:

- Простіше і швидше почати роботу.
- Інструментарій значно кращий.
- Має вбудовану підтримку виконування TypeScript.
- Не потрібно підтримувати `package.json` або `node_modules`.
- Має перевірену стандартну бібліотеку.

> Deno був заснований Райаном Далом (Ryan Dahl) --- тією ж людиною, яка заснувала Node.js.
> Він розповів про свої 10 причин жалітись про Node.js у цьому [відео](https://youtu.be/M3BM9TB-8yA).

grammY розробляється в першу чергу для Deno, але так само добре підтримує Node.js.
