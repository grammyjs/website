---
prev: ./files.md
next: ./deployment-types.md
---

# Games

## Introduction

Telegram games features is a very interesting one and one of my favourites to play with.
What can you do with it? The answer is anything, any HTML 5 game that you have developed you can provide that to users on telegram with the help of this feature.

## Setting up a game with your bot on Bot Father

For simplicity i am assuming that by now you must have set up a bot and a game associated with your bot on Bot father if not? Refer this [article](https://core.telegram.org/bots/games) by Telegram.

> _Note: We will only learn the bot side development and the game is entirely up to the developer all we need here is a link of the HTML 5 game hosted on the internet._

## Sending the Game via Bot

We can send the game in grammy via the `replyWithGame` method which takes the name of th egame you created with BotFather as argument or we can also use the `api.sendGame` method (_grammy provides all the official [`telegram api`](https://core.telegram.org/bots/api) call methods_).
An advantage of using the `api.sendGame` method is you can specify the `chat.id` of a speicifc user to send it to.

1. Sending Game via `replyWithGame`

   ```ts
   // I will be using the start command to invoke the game reply method you can use any event or logic.

   bot.command("start", (ctx) => {
     //Pass the name of the game you created in BotFather for example "my_game"
     ctx.replyWithGame("my_game");
   });
   ```

2. Sending game via `api.sendGame`

   ```ts
   bot.command("start", (ctx) => {
     //you can get the ChatID of the user sending it by `ctx.from.id` which gives you the ChatID of the user who invoked the start command.

     const chatId = ctx.from.id;
     ctx.api.sendGame(chatid, "my_game");
   });
   ```

> You can also specify a custom inline keyboard for the game to show buttons. By default it will be sent with a button with name as `Play my_game` where my_game is the name of your game.

```ts
// Define a new inline keyboard and you can write any text to be shown on button but the first button should always be the play button

const keyboard = new InlineKeyboard().game("Start my_hame");

//notice that we have used game() unlike a normal inline keyboard where we use url() or text()

//via replyWithGame method
ctx.replyWithGame("my_game", { reply_markup: keyboard });

//via api.sendGame method
ctx.api.sendGame(chatid, "my_game", {
  reply_markup: keyboard,
});
```

## Listening to the callback of our game button

For providing logic to the button when it is pressed and to redirect our users to our game and many more we listen to the event `callback_query:game_short_name` which tells us that a game button has been pressed by the user and all we need to do is :

```ts
// you will pass your game url here that should be already hosted on the web.

bot.on("callback_query:game_short_name", (ctx) => {
  ctx.answerCallbackQuery({ url: "your_game_url" });
});

//It's a lways a good habit to catch errors as it may stop your script if any error is encountered due to server failure or network failure or any other circumstances so we will use the built in .catch() method

bot.catch((ctx) => console.error(ctx));

//you can implement any logic here you want i have just logged it
```

and that was all you needed to start your game in telegram.
Further advanced sections and FAQ's will be added to this article so please bear with us :)
