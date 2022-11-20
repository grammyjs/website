# 路由器（`router`）

`Router` 类（[API 参考](/ref/router/)）提供了一种更为灵活的方式来结构化你的 bot，通过路由上下文对象到不同的部分代码。
它是 `Composer` 的 `bot.route` 的更高级版本（[grammY API 参考](/ref/core/Composer.md#route))。

## 示例

这里是一个路由器的使用示例，不言自明。

```ts
const router = new Router((ctx) => {
  // 在此处确定路由。
  return "key";
});

router.route("key", (ctx) => {/* ... */});
router.route("other-key", (ctx) => {/* ... */});
router.otherwise((ctx) => {/* ... */}); // 如果没有匹配的路由，则调用此方法

bot.use(router);
```

## 与中间件集成

自然，路由器插件与 grammY 的 [中间件树](../advanced/middleware.md) 可以无缝集成。
例如，你可以在路由之后继续过滤 updates。

```ts
router.route("key").on("message:text", (ctx) => {/* ... */});
bot.use(router);
const other = router.otherwise();
other.on(":text", (ctx) => {/* ... */});
other.use((ctx) => {/* ... */});
```

你可能还想回顾一下 [这一章节](../guide/filter-queries.md#将查询与其他方法相结合)，了解更多关于中间件的组合。

## 绑定路由器和会话

路由器与 [会话](./session.md) 可以完美结合。
作为一个示例，结合路由器与会话可以让你在聊天界面中重新创建表单。

假设你想创建一个让用户知道他们生日剩余多少天的机器人。
为了计算天数，机器人必须知道生日的月份（例如：6月）和日期（例如：15日）。

因此，机器人必须要询问两个问题：

1. 在哪个月生日？
2. 在哪一天生日？

只有当两个值都已知时，机器人才能告诉用户剩余多少天。

这是如何实现这样的机器人的示例：

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context, Keyboard, session, SessionFlavor } from "grammy";
import { Router } from "@grammyjs/router";

interface SessionData {
  step: "idle" | "day" | "month"; // 我们在表单的哪一步
  dayOfMonth?: number; // 生日日期
  month?: number; // 生日月份
}
type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>("");
// 使用会话。
bot.use(session({ initial: (): SessionData => ({ step: "idle" }) }));

// 定义一些命令。
bot.command("start", async (ctx) => {
  await ctx.reply(`欢迎！
我可以告诉你还有几天到你的生日！
发送 /birthday 开始吧～`);
});

bot.command("birthday", async (ctx) => {
  const day = ctx.session.dayOfMonth;
  const month = ctx.session.month;
  if (day !== undefined && month !== undefined) {
    // 已经提供了信息！
    await ctx.reply(`距离你的生日还有 ${getDays(month, day)} 天！`);
  } else {
    // 缺少信息，进入路由器的表单。
    ctx.session.step = "day";
    await ctx.reply("请把你生日的日期以数字形式发送给我～");
  }
});

// 使用路由器。
const router = new Router<MyContext>((ctx) => ctx.session.step);

// 定义一个处理日期的步骤。
const day = router.route("day");
day.on("message:text", async (ctx) => {
  const day = parseInt(ctx.msg.text, 10);
  if (isNaN(day) || day < 1 || 31 < day) {
    await ctx.reply("啊哦，日期好像无效捏，再试一次吧！");
    return;
  }
  ctx.session.dayOfMonth = day;
  // 提前进入月份的步骤
  ctx.session.step = "month";
  await ctx.reply("好嘞～现在请发送你的生日月份给我！", {
    reply_markup: {
      one_time_keyboard: true,
      keyboard: new Keyboard()
        .text("Jan").text("Feb").text("Mar").row()
        .text("Apr").text("May").text("Jun").row()
        .text("Jul").text("Aug").text("Sep").row()
        .text("Oct").text("Nov").text("Dec").build(),
    },
  });
});
day.use((ctx) => ctx.reply("请把日期以文字消息形式发送给我！"));

// 定义一个处理月份的步骤。
const month = router.route("month");
month.on("message:text", async (ctx) => {
  // 应该不会发生，除非会话数据被破坏。
  const day = ctx.session.dayOfMonth;
  if (day === undefined) {
    await ctx.reply("咱还不知道你的生日日期和月份呢～");
    ctx.session.step = "day";
    return;
  }

  const month = months.indexOf(ctx.msg.text);
  if (month === -1) {
    await ctx.reply("啊哦，月份好像无效捏，请使用按钮发送～");
    return;
  }

  ctx.session.month = month;
  const diff = getDays(month, day);
  await ctx.reply(
    `你的生日在 ${months[month]} ${day}。
还有 ${diff} 天就到啦！`,
    { reply_markup: { remove_keyboard: true } },
  );
  ctx.session.step = "idle";
});
month.use((ctx) => ctx.reply("请点击其中一个按钮！"));

router.otherwise(async (ctx) => {
  await ctx.reply("发送 /birthday 看看还有多久到你的生日。");
});

bot.use(router); // 注册路由器
bot.start();

// 日期转换工具
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
function getDays(month: number, day: number) {
  const bday = new Date();
  const now = Date.now();
  bday.setMonth(month);
  bday.setDate(day);
  if (bday.getTime() < now) bday.setFullYear(bday.getFullYear() + 1);
  const diff = (bday.getTime() - now) / (1000 * 60 * 60 * 24);
  return diff;
}
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const { Bot, Context, Keyboard, session, SessionFlavor } = require("grammy");
const { Router } = require("@grammyjs/router");

const bot = new Bot("");
// 使用会话。
bot.use(session({ initial: () => ({ step: "idle" }) }));

// 定义一些命令。
bot.command("start", async (ctx) => {
  await ctx.reply(`欢迎！
我可以告诉你还有几天到你的生日！
发送 /birthday 开始吧～`);
});

bot.command("birthday", async (ctx) => {
  const day = ctx.session.dayOfMonth;
  const month = ctx.session.month;
  if (day !== undefined && month !== undefined) {
    // 已经提供了信息！
    await ctx.reply(`距离你的生日还有 ${getDays(month, day)} 天！`);
  } else {
    // 缺少信息，进入路由器的表单。
    ctx.session.step = "day";
    await ctx.reply("请把你生日的日期以数字形式发送给我～");
  }
});

// 使用路由器。
const router = new Router((ctx) => ctx.session.step);

// 定义一个处理日期的步骤。
const day = router.route("day");
day.on("message:text", async (ctx) => {
  const day = parseInt(ctx.msg.text, 10);
  if (isNaN(day) || day < 1 || 31 < day) {
    await ctx.reply("啊哦，日期好像无效捏，再试一次吧！");
    return;
  }
  ctx.session.dayOfMonth = day;
  // 提前进入月份的步骤
  ctx.session.step = "month";
  await ctx.reply("好嘞～现在请发送你的生日月份给我！", {
    reply_markup: {
      one_time_keyboard: true,
      keyboard: new Keyboard()
        .text("Jan").text("Feb").text("Mar").row()
        .text("Apr").text("May").text("Jun").row()
        .text("Jul").text("Aug").text("Sep").row()
        .text("Oct").text("Nov").text("Dec").build(),
    },
  });
});
day.use((ctx) => ctx.reply("请把日期以文字消息形式发送给我！"));

// 定义一个处理月份的步骤。
const month = router.route("month");
month.on("message:text", async (ctx) => {
  // 应该不会发生，除非会话数据被破坏。
  const day = ctx.session.dayOfMonth;
  if (day === undefined) {
    await ctx.reply("咱还不知道你的生日日期和月份呢～");
    ctx.session.step = "day";
    return;
  }

  const month = months.indexOf(ctx.msg.text);
  if (month === -1) {
    await ctx.reply("啊哦，月份好像无效捏，请使用按钮发送～");
    return;
  }

  ctx.session.month = month;
  const diff = getDays(month, day);
  await ctx.reply(
    `你的生日在 ${months[month]} ${day}。
还有 ${diff} 天就到啦！`,
    { reply_markup: { remove_keyboard: true } },
  );
  ctx.session.step = "idle";
});
month.use((ctx) => ctx.reply("请点击其中一个按钮！"));

router.otherwise(async (ctx) => {
  await ctx.reply("发送 /birthday 看看还有多久到你的生日。");
});

bot.use(router); // 注册路由器
bot.start();

// 日期转换工具
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
function getDays(month, day) {
  const bday = new Date();
  const now = Date.now();
  bday.setMonth(month);
  bday.setDate(day);
  if (bday.getTime() < now) bday.setFullYear(bday.getFullYear() + 1);
  const diff = (bday.getTime() - now) / (1000 * 60 * 60 * 24);
  return diff;
}
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import {
  Bot,
  Context,
  Keyboard,
  session,
  SessionFlavor,
} from "https://deno.land/x/grammy/mod.ts";
import { Router } from "https://deno.land/x/grammy_router/router.ts";

interface SessionData {
  step: "idle" | "day" | "month"; // 我们在表单的哪一步
  dayOfMonth?: number; // 生日日期
  month?: number; // 生日月份
}
type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>("");
// 使用会话。
bot.use(session({ initial: (): SessionData => ({ step: "idle" }) }));

// 定义一些命令。
bot.command("start", async (ctx) => {
  await ctx.reply(`欢迎！
我可以告诉你还有几天到你的生日！
发送 /birthday 开始吧～`);
});

bot.command("birthday", async (ctx) => {
  const day = ctx.session.dayOfMonth;
  const month = ctx.session.month;
  if (day !== undefined && month !== undefined) {
    // 已经提供了信息！
    await ctx.reply(`距离你的生日还有 ${getDays(month, day)} 天！`);
  } else {
    // 缺少信息，进入路由器的表单。
    ctx.session.step = "day";
    await ctx.reply("请把你生日的日期以数字形式发送给我～");
  }
});

// 使用路由器。
const router = new Router<MyContext>((ctx) => ctx.session.step);

// 定义一个处理日期的步骤。
const day = router.route("day");
day.on("message:text", async (ctx) => {
  const day = parseInt(ctx.msg.text, 10);
  if (isNaN(day) || day < 1 || 31 < day) {
    await ctx.reply("啊哦，日期好像无效捏，再试一次吧！");
    return;
  }
  ctx.session.dayOfMonth = day;
  // 提前进入月份的步骤
  ctx.session.step = "month";
  await ctx.reply("好嘞～现在请发送你的生日月份给我！", {
    reply_markup: {
      one_time_keyboard: true,
      keyboard: new Keyboard()
        .text("Jan").text("Feb").text("Mar").row()
        .text("Apr").text("May").text("Jun").row()
        .text("Jul").text("Aug").text("Sep").row()
        .text("Oct").text("Nov").text("Dec").build(),
    },
  });
});
day.use((ctx) => ctx.reply("请把日期以文字消息形式发送给我！"));

// 定义一个处理月份的步骤。
const month = router.route("month");
month.on("message:text", async (ctx) => {
  // 应该不会发生，除非会话数据被破坏。
  const day = ctx.session.dayOfMonth;
  if (day === undefined) {
    await ctx.reply("咱还不知道你的生日日期和月份呢～");
    ctx.session.step = "day";
    return;
  }

  const month = months.indexOf(ctx.msg.text);
  if (month === -1) {
    await ctx.reply("啊哦，月份好像无效捏，请使用按钮发送～");
    return;
  }

  ctx.session.month = month;
  const diff = getDays(month, day);
  await ctx.reply(
    `你的生日在 ${months[month]} ${day}。
还有 ${diff} 天就到啦！`,
    { reply_markup: { remove_keyboard: true } },
  );
  ctx.session.step = "idle";
});
month.use((ctx) => ctx.reply("请点击其中一个按钮！"));

router.otherwise(async (ctx) => {
  await ctx.reply("发送 /birthday 看看还有多久到你的生日。");
});

bot.use(router); // 注册路由器
bot.start();

// 日期转换工具
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
function getDays(month: number, day: number) {
  const bday = new Date();
  const now = Date.now();
  bday.setMonth(month);
  bday.setDate(day);
  if (bday.getTime() < now) bday.setFullYear(bday.getFullYear() + 1);
  const diff = (bday.getTime() - now) / (1000 * 60 * 60 * 24);
  return diff;
}
```

</CodeGroupItem>
</CodeGroup>

请注意，会话有一个属性 `step`，它存储表单的步骤，即当前正在填写的值。
路由器用于跳转到不同的中间件，完成 `month` 和 `dayOfMonth` 字段的填写。
如果两个值都已知，机器人计算剩余天数并发送给用户。

## 插件概述

- 名字：`router`
- 源码：<https://github.com/grammyjs/router>
- 参考：[router](/ref/router/)
