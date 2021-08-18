---
prev: ./files.md
next: ./deployment-types.md
---

# Games

## Introduction

Telegram Games is a very interesting feature and it is great fun to play with.
What can you do with it?
The answer is anything, any HTML5 game that you have developed you can provide to users on Telegram with the help of this feature.
(Yes, this means that you will have to develop a real website-based game that is publicly accessible on the internet before you can integrate it into your Telegram bot.)

## Setting up a game with your bot via @BotFather

For simplicity, let's assume that by now you must have set up a bot and a game associated with your bot on [@BotFather](https://telegram.me/BotFather).
If you haven't already, check out this [article](https://core.telegram.org/bots/games) by the Telegram team.

> Note: We will only learn the bot side development.
> Developing the game is entirely up to the developer.
> All we need here is a link of the HTML5 game hosted on the internet.

## Sending the game via a bot

We can send the game in grammY via the `replyWithGame` method which takes the name of the game you created with BotFather as argument.
Alternatively, we can also use the `api.sendGame` method (grammY provides all the official [Bot API](https://core.telegram.org/bots/api) methods).
An advantage of using the `api.sendGame` method is you can specify the `chat.id` of a speicifc user to send it to.

1. Sending Game via `replyWithGame`

   ```ts
   // We will be using the start command to invoke the game reply method
   bot.command("start", async (ctx) => {
     // Pass the name of the game you created in BotFather, for example "my_game"
     await ctx.replyWithGame("my_game");
   });
   ```

2. Sending game via `api.sendGame`

   ```ts
   bot.command("start", async (ctx) => {
     // You can get the chat identifier of the user to send your game to with `ctx.from.id`
     // which gives you the chat identifier of the user who invoked the start command.
     const chatId = ctx.from.id;
     await ctx.api.sendGame(chatid, "my_game");
   });
   ```

> You can also specify a custom [inline keyboard](/plugins/keyboard.md#inline-keyboards) for the game to show buttons.
> By default, it will be sent with a button with name as `Play my_game` where _my_game_ is the name of your game.

```ts
// Define a new inline keyboard. You can write any text to be shown
// on the button, but make sure that the first button should always
// be the play button!

const keyboard = new InlineKeyboard().game("Start my_game");

// Notice that we have used game() unlike a normal inline keyboard
// where we use url() or text()

// Via replyWithGame method
await ctx.replyWithGame("my_game", { reply_markup: keyboard });

// Via api.sendGame method
await ctx.api.sendGame(chatid, "my_game", { reply_markup: keyboard });
```

## Listening to the callback of our game button

For providing logic to the button when it is pressed, and to redirect our users to our game and many more, we listen to the event `callback_query:game_short_name` which tells us that a game button has been pressed by the user
All we need to do is:

```ts
// Pass your game url here that should be already hosted on the web.

bot.on("callback_query:game_short_name", async (ctx) => {
  await ctx.answerCallbackQuery({ url: "your_game_url" });
});
```
___
### Our final code should look something like this

```ts
bot.on("callback_query:game_short_name", async (ctx) => {
  await ctx.answerCallbackQuery({ url: "your_game_url" });
});

bot.command("start", (ctx) => {
  
  await ctx.replyWithGame("my_game", {
    reply_markup: keyboard,
    // or you can use the api method here according to 
    // your needs
  });
});

```


> Remember to add proper [error handling](/guide/errors.md) to your bot before going live.

We may extend this article in the future by further advanced sections and FAQ's, but this is already all you need to start your game in Telegram.
Have fun playing! :space_invader:
