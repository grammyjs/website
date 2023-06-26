# Медіагрупи (вбудовано)

Плагін медіагрупи допоможе вам надсилати групи мультимедійних даних, дозволяючи створювати обʼєкти `InputMedia`.
До речі, обʼєкти `InputMedia` також використовуються під час редагування медіаповідомлень, тому цей плагін також допоможе вам редагувати медіа.

Памʼятайте, що обʼєкти `InputMedia` описано [тут](https://core.telegram.org/bots/api#inputmedia).

## Побудова обʼєкту `InputMedia`

Ви можете використовувати цей плагін ось так:

::::code-group
:::code-group-item TypeScript

```ts
import { InputMediaBuilder } from "grammy";

const photo = InputMediaBuilder.photo(new InputFile("/tmp/photo.mp4"));
const video = InputMediaBuilder.video(new InputFile("/tmp/video.mp4"));
// тощо
```

:::
:::code-group-item JavaScript

```js
const { InputMediaBuilder } = require("grammy");

const photo = InputMediaBuilder.photo(new InputFile("/tmp/photo.mp4"));
const video = InputMediaBuilder.video(new InputFile("/tmp/video.mp4"));
// тощо
```

:::
:::code-group-item Deno

```ts
import { InputMediaBuilder } from "https://deno.land/x/grammy/mod.ts";

const photo = InputMediaBuilder.photo(new InputFile("/tmp/photo.mp4"));
const video = InputMediaBuilder.video(new InputFile("/tmp/video.mp4"));
// тощо
```

:::
::::

Ознайомтеся зі всіма методами `InputMediaBuilder` у [довідці API](https://deno.land/x/grammy/mod.ts?s=InputMediaBuilder).

Ви також можете безпосередньо передавати публічні URL-адреси, які запросить (`fetch`) Telegram.

```ts
const photo = InputMediaBuilder.photo("https://grammy.dev/images/Y.png");
```

Інші параметри можуть бути надані в обʼєкті параметрів в кінці.

```ts
const photo = InputMediaBuilder.photo("https://grammy.dev/images/Y.png", {
  caption: "grammY чудовий",
  // тощо
});
```

## Надсилання медіагруп

Ви можете надіслати медіагрупу наступним чином:

```ts
await ctx.replyWithMediaGroup([photo0, photo1, photo2, video]);
```

Так само ви можете передати масив обʼєктів `InputMedia` до `ctx.api.sendMediaGroup` або `bot.api.sendMediaGroup`.

## Редагування медіаповідомлень

Оскільки обʼєкти `InputMedia` також використовуються для редагування медіаповідомлень, цей плагін допоможе вам і тут:

```ts
const newMedia = InputMediaBuilder.photo("https://grammy.dev/images/Y.png");
await ctx.editMessageMedia(newMedia);
```

Як і завжди, це працює для `ctx.api.editMessageMedia` та `bot.api.editMessageMedia`.

## Загальні відомості про плагін

Цей плагін вбудовано в ядро grammY.
Вам не потрібно нічого встановлювати, щоб використовувати його.
Просто імпортуйте все з самого grammY.

До того ж документація і довідка API цього плагіна уніфіковані з ядром пакета.
