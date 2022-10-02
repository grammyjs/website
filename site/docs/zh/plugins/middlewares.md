# 一套有用的中间件

我一直在为我所有的 bot 写重复的中间件，所以我决定把它们全部提取到一个单独的包中。

## 安装

`yarn add grammy-middlewares`

## 使用方法

所有的中间件访问器都是工厂，尽管不是所有的中间件都必须是。但我决定让 API 具有一致性。

有些工厂消费可选或必须的参数。

```typescript
import {
  ignoreOld,
  onlyAdmin,
  onlyPublic,
  onlySuperAdmin,
  sequentialize,
} from "grammy-middlewares";

// ...

bot.use(
  ignoreOld(),
  onlyAdmin((ctx) => ctx.reply("Only admins can do this")),
  onlyPublic((ctx) => ctx.reply("You can only use public chats")),
  onlySuperAdmin(env.SUPER_ADMIN_ID),
  sequentialize(),
);
```

## 中间件

### `ignoreOld`

忽略旧的 updates，当 bot 已经停止工作一段时间时很有用。你可以选择指定超时时间（以秒为单位），默认为 `5 * 60`。

### `onlyAdmin`

检查用户是否是管理员。你可以选择指定 `errorHandler`，如果用户不是管理员时，它将在上下文中调用。

### `onlyPublic`

检查是否是群组或频道。你可以选择指定 `errorHandler`，如果不是群组或频道时，它将在上下文中调用。

### `onlySuperAdmin`

检查用户是否是超级管理员。你必须提供超级管理员 id。

### `sequentialize`

基本的 [顺序化](../advanced/scaling.md#并发是困难的) 中间件，将聊天 id 作为一个顺序标识。

## 插件概述

- 名字：`grammy-middlewares`
- 源码：<https://github.com/backmeupplz/grammy-middlewares>
- 参考：<https://github.com/backmeupplz/grammy-middlewares>
