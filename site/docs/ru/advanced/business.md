# Telegram Бизнес

Telegram Бизнес позволяет управлять личным чатом с другим пользователем (человеком) с помощью бота.
Это включает в себя отправку и получение сообщений от вашего имени.
Как правило, это полезно, если вы ведете бизнес в Telegram, а другой пользователь является вашим клиентом.

> Если вы до сих пор не знакомы с Telegram Бизнес, посмотрите [официальную документацию](https://core.telegram.org/bots#manage-your-business) от Telegram, перед тем как продолжить.

Естественно, grammY полностью поддерживает это.

## Обработка бизнес-сообщений

Бот может управлять личным чатом между двумя пользователями через Telegram Бизнес --- аккаунт, который подписан на бизнес-подписку Telegram.
Управление личными чатами осуществляется через объект _business connection_, который выглядит [вот так](/ref/types/businessconnection).

### Получение бизнес-сообщений

После установки бизнес-подключения бот будет **получать сообщения** от _обоих участников чата_.

```ts
bot.on("business_message", async (ctx) => {
  // Получаем объект сообщения.
  const message = ctx.businessMessage;
  // Сокращенные методы работают, как и ожидалось.
  const msg = ctx.msg;
});
```

Сейчас непонятно, кто из двух участников чата отправил сообщение.
Это может быть сообщение вашего клиента, а может быть сообщение, отправленное лично вами (не вашим ботом)!

Итак, нам нужно различить этих двух пользователей.
Для этого нам нужно проверить вышеупомянутый объект бизнес-подключения.
Бизнес-подключение сообщает нам, кто является пользователем бизнес аккаунта, то есть идентификатор пользователя вас (или одного из ваших сотрудников).

```ts
bot.on("business_message", async (ctx) => {
  // Получаем информацию о бизнес-подключении.
  const conn = await ctx.getBusinessConnection();
  const employee = conn.user;
  // Проверяем, кто отправил это сообщение.
  if (ctx.from.id === employee.id) {
    // Это сообщение отправили вы.
  } else {
    // Это сообщение отправил ваш клиент.
  }
});
```

Вы также можете пропустить вызов `getBusinessConnection` для каждого обновления, выполнив [это](#работа-с-бизнес-подключениями).

### Отправка сообщений

Ваш бот может **отправлять сообщения** в этот чат _не будучи участником чата_.
Это работает, как и ожидалось, с помощью `ctx.reply` и всех его вариантов.
grammY проверяет, доступен ли [сокращенный метод контекста](../guide/context#краткая-запись) `ctx.businessConnectionId`, чтобы отправить сообщение в управляемый бизнес-чат.

```ts
bot.on("business_message").filter(
  async (ctx) => {
    const conn = await ctx.getBusinessConnection();
    return ctx.from.id !== conn.user.id;
  },
  async (ctx) => {
    // Автоматически отвечаем на все вопросы клиентов.
    if (ctx.msg.text.endsWith("?")) {
      await ctx.reply("Скоро.");
    }
  }
);
```

Это будет выглядеть так, будто вы отправили сообщение лично.
Ваш клиент не сможет определить, было ли сообщение отправлено вручную или через бота.
(Однако вы увидите небольшой индикатор на этот счет.)
(Но ваш бот, вероятно, отвечает намного быстрее, чем вы.
Приносим свои извинения.)

## Продвинутые возможности

Есть еще несколько вещей, которые следует учитывать при интеграции вашего бота с Telegram Бизнес.
Здесь мы кратко рассмотрим несколько аспектов.

### Редактирование или удаление бизнес-сообщений

Когда вы или ваш клиент редактируете или удаляете сообщения в чате, ваш бот будет уведомлен об этом.
Точнее, вы будете получать обновления `edited_business_message` или `deleted_business_messages`.
Ваш бот может обрабатывать их обычным способом, используя `bot.on` и его бесчисленными [фильтрами запросов](../guide/filter-queries).

Однако ваш бот **НЕ** может редактировать или удалять сообщения в чате.
Аналогично, ваш бот **НЕ** может пересылать сообщения из чата или копировать их куда-либо.
Все эти возможности остаются за человеком.

### Работа с бизнес-подключениями

Когда бот будет подключен к бизнес-аккаунту, он получит обновление `business_connection`.
Это обновление также будет получено, когда бот будет отключен или подключение будет отредактировано как-то иначе.

Например, бот может или не может отправлять сообщения в чаты, которыми он управляет.
Вы можете узнать об этом с помощью части запроса `:can_reply`.

```ts
bot.on("business_connection:can_reply", async (ctx) => {
  // Подключение позволяет отправлять сообщения.
});
```

Имеет смысл хранить объекты бизнес-подключений в вашей базе данных.
Так вы сможете избежать вызова `ctx.getBusinessConnection()` при каждом обновлении только для того, чтобы [выяснить, кто отправил сообщение](#получение-бизнес---сообщений).

Кроме того, обновление `business_connection` содержит `user_chat_id`.
Этот идентификатор чата может быть использован для инициирования разговора с пользователем, который подключил бота.

```ts
bot.on("business_connection:is_enabled", async (ctx) => {
  const id = ctx.businessConnection.user_chat_id;
  await ctx.api.sendMessage(id, "Спасибо, что подключили меня!");
});
```

Это будет работать, даже если пользователь еще не запустил вашего бота.

### Управление личными чатами

Если вы подключите бота для управления своим аккаунтом, приложения Telegram будут предлагать вам кнопку для управления этим ботом в каждом управляемом чате.
Эта кнопка отправляет боту команду `/start`.

Эта команда запуска имеет специальные данные [deep linking](../guide/commands#поддержка-deep-linking), определяемые Telegram.
Они имеют формат `bizChatXXXXX`, где `XXXXX` будет идентификатором чата, которым вы управляете.

```ts
bot.command("start", async (ctx) => {
  const payload = ctx.match;
  if (payload.startsWith("bizChat")) {
    const id = payload.slice(7); // обрезаем `bizChat`
    await ctx.reply(`Давайте управлять чатом #${id}!`);
  }
});
```

Это придает вашему боту важный контекст и позволяет ему управлять индивидуальными бизнес-чатами прямо из разговора с каждым клиентом.