# Игры

## Введение

Игры в Telegram - это очень интересная функция, с которой очень весело работать.
Что вы можете сделать с ее помощью?
Ответ: все, что угодно. Любую HTML5-игру, которую вы разработали, вы можете предоставить пользователям Telegram с помощью этой функции.
(Да, это означает, что вам придется разработать настоящую игру на основе веб-сайта, которая находится в открытом доступе в интернете, прежде чем вы сможете интегрировать ее в своего Telegram-бота).

## Настройка игр вашего бота через @BotFather

Для простоты предположим, что к этому моменту вы уже настроили бота и игру, связанную с вашим ботом, написав [@BotFather](https://t.me/BotFather).
Если вы еще не сделали этого, ознакомьтесь с этой [статьей](https://core.telegram.org/bots/games) от команды Telegram.

> Примечание: мы будем изучать только разработку бота.
> Разработка игры полностью зависит от разработчика.
> Все, что нам нужно, это ссылка на HTML5-игру, размещенную в интернете.

## Отправка игр через бота

Мы можем отправить игру в grammY с помощью метода `replyWithGame`, который принимает в качестве аргумента название игры, созданной вами в BotFather.
В качестве альтернативы можно использовать метод `api.sendGame` (grammY предоставляет все официальные методы [API бота](https://core.telegram.org/bots/api)).
Преимущество использования метода `api.sendGame` в том, что вы можете указать `chat.id` конкретного пользователя для отправки.

1. Отправка игры через `replyWithGame`

   ```ts
   // Мы будем использовать команду start для вызова метода ответа игрой
   bot.command("start", async (ctx) => {
     // Передайте имя игры, которую вы создали в BotFather, например "my_game".
     await ctx.replyWithGame("my_game");
   });
   ```

2. Sending a Game via `api.sendGame`

   ```ts
   bot.command("start", async (ctx) => {
     // Вы можете получить идентификатор чата пользователя, которому нужно отправить игру, с помощью `ctx.from.id`.
     // который дает вам идентификатор чата пользователя, вызвавшего команду start.
     const chatId = ctx.from.id;
     await ctx.api.sendGame(chatid, "my_game");
   });
   ```

> [Помните](./basics#sending-messages) что вы можете указать дополнительные параметры при отправке сообщений, используя объект options типа `Other`.

Вы также можете указать пользовательскую [встроенную клавиатуру](../plugins/keyboard#встроенная-клавиатура) для отображения кнопок в игре.
По умолчанию будет отправлена кнопка с именем `Play my_game`, где _my_game_ - название вашей игры.

```ts
// Определите новую встроенную клавиатуру. Вы можете написать любой текст, который будет отображаться
// на кнопках, но убедитесь, что первой кнопкой всегда должна
// быть кнопкая запуска!

const keyboard = new InlineKeyboard().game("Играть в my_game");

// Обратите внимание, что мы использовали game(), в отличие от обычной встроенной клавиатуры.
// где мы используем url() или text()

// Через метод `replyWithGame`.
await ctx.replyWithGame("my_game", { reply_markup: keyboard });

// Через метод `api.sendGame`.
await ctx.api.sendGame(chatId, "my_game", { reply_markup: keyboard });
```

## Прослушивание callback-функции нашей кнопки в игре

Для обеспечения логики при нажатии кнопки, а также для перенаправления пользователей в нашу игру и многого другого мы слушаем событие `callback_query:game_short_name`, которое сообщает нам, что пользователь нажал игровую кнопку.
Все, что нам нужно сделать, это:

```ts
// Передайте сюда url вашей игры, которая уже должна быть размещена в Интернете.

bot.on("callback_query:game_short_name", async (ctx) => {
  await ctx.answerCallbackQuery({ url: "ваша_ссылка_на_игру" });
});
```

---

### Наш окончательный код должен выглядеть примерно так

```ts
bot.on("callback_query:game_short_name", async (ctx) => {
  await ctx.answerCallbackQuery({ url: "ваша_ссылка_на_игру" });
});

bot.command("start", async (ctx) => {
  await ctx.replyWithGame("my_game", {
    reply_markup: keyboard,
    // Или вы можете использовать метод api здесь, в зависимости от ваших потребностей.
  });
});
```

> Не забудьте добавить правильную [обработку ошибок](./errors) в вашего бота перед запуском.

Возможно, в будущем мы расширим эту статью дополнительными разделами и FAQ, но это все, что вам нужно, чтобы начать создание своей игры в Telegram.
Приятной игры! :space_invader: