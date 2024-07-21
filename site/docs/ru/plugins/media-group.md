---
prev: false
next: false
---

# Медиагруппы (встроенный)

Плагин медиагрупп помогает вам отправлять медиагруппы, позволяя создавать объекты `InputMedia`.
Кстати, объекты `InputMedia` также используются при редактировании медиа-сообщений, так что этот плагин также поможет вам редактировать медиа.

Помните, что объекты `InputMedia` описываются [здесь](https://core.telegram.org/bots/api#inputmedia).

## Создание объекта `InputMedia`

Вы можете использовать этот плагин следующим образом:

::: code-group

```ts [TypeScript]
import { InputMediaBuilder } from "grammy";

const photo = InputMediaBuilder.photo(new InputFile("/tmp/photo.mp4"));
const video = InputMediaBuilder.video(new InputFile("/tmp/video.mp4"));
// т.д.
```

```js [JavaScript]
const { InputMediaBuilder } = require("grammy");

const photo = InputMediaBuilder.photo(new InputFile("/tmp/photo.mp4"));
const video = InputMediaBuilder.video(new InputFile("/tmp/video.mp4"));
// т.д.
```

```ts [Deno]
import { InputMediaBuilder } from "https://deno.land/x/grammy/mod.ts";

const photo = InputMediaBuilder.photo(new InputFile("/tmp/photo.mp4"));
const video = InputMediaBuilder.video(new InputFile("/tmp/video.mp4"));
// т.д.
```

:::

Ознакомьтесь со всеми методами `InputMediaBuilder` в [документации API](/ref/core/inputmediabuilder).

Вы также можете напрямую передавать публичные ссылки, которые считывает Telegram.

```ts
const photo = InputMediaBuilder.photo("https://grammy.dev/images/grammY.png");
```

Дополнительные параметры могут быть предоставлены в объекте options в конце.

```ts
const photo = InputMediaBuilder.photo("https://grammy.dev/images/grammY.png", {
  caption: "grammY заметелен",
  // т.д.
});
```

## Отправка медиагруппы

Вы можете отправить медиагруппу следующим образом:

```ts
await ctx.replyWithMediaGroup([photo0, photo1, photo2, video]);
```

Аналогичным образом вы можете передать массив объектов `InputMedia` в `ctx.api.sendMediaGroup` или `bot.api.sendMediaGroup`.

## Редактирование медиасообщения

Поскольку объекты `InputMedia` также используются для редактирования медиа сообщений, этот плагин поможет вам и здесь:

```ts
const newMedia = InputMediaBuilder.photo(
  "https://grammy.dev/images/grammY.png",
);
await ctx.editMessageMedia(newMedia);
```

Как обычно, это работает и для `ctx.api.editMessageMedia` и `bot.api.editMessageMedia`.

## Краткая информация о плагине

Этот плагин встроен в библиотеку grammY.
Вам не нужно ничего устанавливать, чтобы использовать его.
Просто импортируйте всё из самого grammY.

Кроме того, документация и ссылки на API этого плагина объединены с основным пакетом.
