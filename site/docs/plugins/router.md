# Router (`router`)

The `Router` class ([grammY API Reference](https://doc.deno.land/https/deno.land/x/grammy/mod.ts#Router)) provides a way to structure your bot by routing context objects to different parts of your code.

## Example

Here is an example of a router usage that speaks for itself.

```ts
const router = new Router(ctx => {
  // determine route to pick here
  return 'key'
})

router.route('key',       ctx => { ... })
router.route('other-key', ctx => { ... })
router.otherwise(ctx => { ... }) // called if no route matches

bot.use(router)
```

## Combining routers with sessions

Routers work well together with [sessions](./session.md).
As an example, combining the two concepts allows you to re-create forms in the chat interface.

Let's say that you want to build a bot that tells users how many days are left until it is their birthday.
In order to compute the number of days, the bot has to know the month (e.g. June) and the day of month (e.g. 15) of the birthday.

The bot therefore has to ask two questions:

1. In what month is the user born?
2. What day of the month is the user born?

Only if both values are known, the bot can tell the user how many days are left.

This is how a bot like that could be implemented:

<CodeGroup>
  <CodeGroupItem title="TS" active>

```ts
import { Bot, Context, Keyboard, session, SessionFlavor } from "grammy";
import { Router } from '@grammyjs/router'

interface SessionData {
  step: "idle" | "day" | "month"; // what step of the form we are at
  dayOfMonth?: number; // birthday date
  month?: number; // birthday month
}
type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>("");
// Use session
bot.use(session({ initial: (): SessionData => ({ step: "idle" }) }));

// Define some commands
bot.command("start", async (ctx) => {
  await ctx.reply(`Welcome!
I can tell you in how many days it is your birthday!
Send /birthday to start`);
});

bot.command("birthday", async (ctx) => {
  const day = ctx.session.dayOfMonth;
  const month = ctx.session.month;
  if (day !== undefined && month !== undefined) {
    // Information already provided!
    await ctx.reply(`Your birthday is in ${getDays(month, day)} days!`);
  } else {
    // Missing information, enter router-based form
    ctx.session.step = "day";
    await ctx.reply(
      "Please send me the day of month \
of your birthday as a number!"
    );
  }
});

// Use router
const router = new Router<MyContext>((ctx) => ctx.session.step);

// Define step that handles the day
router.route("day", async (ctx, next) => {
  const day = parseInt(ctx.msg?.text ?? "", 10);
  if (isNaN(day) || day < 1 || 31 < day) {
    await ctx.reply("That is not a valid day, try again!");
    return;
  }
  ctx.session.dayOfMonth = day;
  // Advance form to step for month
  ctx.session.step = "month";
  await ctx.reply("Got it! Now, send me the month!", {
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

router.route("month", async (ctx) => {
  // should not happen, unless session data is corrupted
  const day = ctx.session.dayOfMonth
  if (day === undefined) {
    await ctx.reply("I need your day of month!");
    ctx.session.step = "day";
    return;
  }

  const month = months.indexOf(ctx.msg?.text ?? "");
  if (month === -1) {
    await ctx.reply(
      "That is not a valid month, \
please use one of the buttons!"
    );
    return;
  }

  ctx.session.month = month;
  const diff = getDays(month, day);
  await ctx.reply(
    `Your birthday is on ${months[month]} ${day}.
That is in ${diff} days!`,
    { reply_markup: { remove_keyboard: true } }
  );
  ctx.session.step = "idle";
});

router.route("idle", async (ctx) => {
  await ctx.reply("Send /birthday to find out how long you have to wait.");
});

bot.use(router); // register the router
bot.start();

// Date conversion utils:
const months = ["Jan","Feb","Mar","Apr","May","Jun",
                "Jul","Aug","Sep","Oct","Nov","Dec"];
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
  <CodeGroupItem title="JS">

```js
import { Bot, Context, Keyboard, session, SessionFlavor } from "grammy";
import { Router } from '@grammyjs/router'

const bot = new Bot("");
// Use session
bot.use(session({ initial: () => ({ step: "idle" }) }));

// Define some commands
bot.command("start", async (ctx) => {
  await ctx.reply(`Welcome!
I can tell you in how many days it is your birthday!
Send /birthday to start`);
});

bot.command("birthday", async (ctx) => {
  const day = ctx.session.dayOfMonth;
  const month = ctx.session.month;
  if (day !== undefined && month !== undefined) {
    // Information already provided!
    await ctx.reply(`Your birthday is in ${getDays(month, day)} days!`);
  } else {
    // Missing information, enter router-based form
    ctx.session.step = "day";
    await ctx.reply(
      "Please send me the day of month \
of your birthday as a number!"
    );
  }
});

// Use router
const router = new Router((ctx) => ctx.session.step);

// Define step that handles the day
router.route("day", async (ctx, next) => {
  const day = parseInt(ctx.msg?.text ?? "", 10);
  if (isNaN(day) || day < 1 || 31 < day) {
    await ctx.reply("That is not a valid day, try again!");
    return;
  }
  ctx.session.dayOfMonth = day;
  // Advance form to step for month
  ctx.session.step = "month";
  await ctx.reply("Got it! Now, send me the month!", {
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

router.route("month", async (ctx) => {
  // should not happen, unless session data is corrupted
  const day = ctx.session.dayOfMonth
  if (day === undefined) {
    await ctx.reply("I need your day of month!");
    ctx.session.step = "day";
    return;
  }

  const month = months.indexOf(ctx.msg?.text ?? "");
  if (month === -1) {
    await ctx.reply(
      "That is not a valid month, \
please use one of the buttons!"
    );
    return;
  }

  ctx.session.month = month;
  const diff = getDays(month, day);
  await ctx.reply(
    `Your birthday is on ${months[month]} ${day}.
That is in ${diff} days!`,
    { reply_markup: { remove_keyboard: true } }
  );
  ctx.session.step = "idle";
});

router.route("idle", async (ctx) => {
  await ctx.reply("Send /birthday to find out how long you have to wait.");
});

bot.use(router); // register the router
bot.start();

// Date conversion utils:
const months = ["Jan","Feb","Mar","Apr","May","Jun",
                "Jul","Aug","Sep","Oct","Nov","Dec"];
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
import { Router } from "https://deno.land/x/grammy_router/mod.ts";

interface SessionData {
  step: "idle" | "day" | "month"; // what step of the form we are at
  dayOfMonth?: number; // birthday date
  month?: number; // birthday month
}
type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>("");
// Use session
bot.use(session({ initial: (): SessionData => ({ step: "idle" }) }));

// Define some commands
bot.command("start", async (ctx) => {
  await ctx.reply(`Welcome!
I can tell you in how many days it is your birthday!
Send /birthday to start`);
});

bot.command("birthday", async (ctx) => {
  const day = ctx.session.dayOfMonth;
  const month = ctx.session.month;
  if (day !== undefined && month !== undefined) {
    // Information already provided!
    await ctx.reply(`Your birthday is in ${getDays(month, day)} days!`);
  } else {
    // Missing information, enter router-based form
    ctx.session.step = "day";
    await ctx.reply(
      "Please send me the day of month \
of your birthday as a number!"
    );
  }
});

// Use router
const router = new Router<MyContext>((ctx) => ctx.session.step);

// Define step that handles the day
router.route("day", async (ctx, next) => {
  const day = parseInt(ctx.msg?.text ?? "", 10);
  if (isNaN(day) || day < 1 || 31 < day) {
    await ctx.reply("That is not a valid day, try again!");
    return;
  }
  ctx.session.dayOfMonth = day;
  // Advance form to step for month
  ctx.session.step = "month";
  await ctx.reply("Got it! Now, send me the month!", {
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

router.route("month", async (ctx) => {
  // should not happen, unless session data is corrupted
  const day = ctx.session.dayOfMonth
  if (day === undefined) {
    await ctx.reply("I need your day of month!");
    ctx.session.step = "day";
    return;
  }

  const month = months.indexOf(ctx.msg?.text ?? "");
  if (month === -1) {
    await ctx.reply(
      "That is not a valid month, \
please use one of the buttons!"
    );
    return;
  }

  ctx.session.month = month;
  const diff = getDays(month, day);
  await ctx.reply(
    `Your birthday is on ${months[month]} ${day}.
That is in ${diff} days!`,
    { reply_markup: { remove_keyboard: true } }
  );
  ctx.session.step = "idle";
});

router.route("idle", async (ctx) => {
  await ctx.reply("Send /birthday to find out how long you have to wait.");
});

bot.use(router); // register the router
bot.start();

// Date conversion utils:
const months = ["Jan","Feb","Mar","Apr","May","Jun",
                "Jul","Aug","Sep","Oct","Nov","Dec"];
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

::: tip Breaking up the code
If you feel like your code gets too complex, you can split it across several files.
You can read more about how to scale your codebase in [this advanced section](/advanced/structuring.md).
:::

Note how the session has a property `step` that stores the step of the form, i.e. which value is currently being filled.
The router is used to jump between different middleware that completes both the `month` and the `dayOfMonth` fields on the session.
If both values are known, the bot computes the remaining days and sends it back to the user.
