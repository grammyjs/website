---
prev: false
next: false
---

# 指令 (`commands`)

指令处理增强插件

此插件提供了超出核心库的 [指令处理](../guide/commands) 的高级指令处理功能。
以下是该插件所提供功能的快速概览：

- 通过将中间件与指令定义封装在一起，提高代码可读性。
- 通过 `setMyCommands` 实现用户指令菜单的同步。
- 改进的指令分组和组织结构。
- 指令可见范围，例如限制对群管理员或特定频道的访问。
- 支持指令的多语言翻译。
- `Did you mean ...?` 功能可以找到与给定指令最接近的现有指令。
- 支持指令匹配不区分大小写。
- 为提到你 bot 用户名的指令设置自定义行为。例如 `/start@your_bot`。
- 自定义指令前缀，例如：`+`、`?` 或任何非 `/` 的符号。
- 支持不在消息开头的指令。
- 支持正则表达式指令！

所有这些功能均由你为 bot 定义的中央指令结构提供支持。

## 基本用法

在我们深入讨论之前，我们先看看如何用插件注册和处理指令。

```ts
const myCommands = new CommandGroup();

myCommands.command("hello", "Say hello", (ctx) => ctx.reply(`Hello, world!`));

bot.use(myCommands);
```

这会向你的 bot 注册一个新的 `/hello` 指令，该指令将由给定的中间件处理。

现在，让我们了解该插件提供的一些额外工具。

## 导入

首先，以下是如何导入插件提供的所有必需类型和类。

::: code-group

```ts [TypeScript]
import {
  CommandGroup,
  commandNotFound,
  commands,
  type CommandsFlavor,
} from "@grammyjs/commands";
```

```js [JavaScript]
const { CommandGroup, commandNotFound, commands } = require(
  "@grammyjs/commands",
);
```

```ts [Deno]
import {
  CommandGroup,
  commandNotFound,
  commands,
  type CommandsFlavor,
} from "https://deno.land/x/grammy_commands/mod.ts";
```

:::

现在已经导入了，让我们看看如何使我们的指令对用户可见。

## 用户指令菜单设置

一旦你使用 `CommandGroup` 类的实例定义指令后，你可以调用 `setCommands` 方法将所有定义的指令注册到用户的指令菜单上。

```ts
const myCommands = new CommandGroup();

myCommands.command("hello", "Say hello", (ctx) => ctx.reply(`Hello, world!`));

bot.use(myCommands);

// 更新用户指令菜单
await myCommands.setCommands(bot); // [!code highlight]
```

这可确保每个注册的指令都会出现在与你的 bot 私聊的菜单中，或者当用户在你的 bot 作为成员的聊天中输入 `/` 时出现。

### 上下文捷径

如果你希望某些指令仅向某些用户显示怎么办？
例如，假设你有一个 `login` 和一个 `logout` 指令。
`login` 指令应该只对未登录的用户显示，反之亦然。
这是使用指令插件执行此操作的方法：

::: code-group

```ts [TypeScript]
// 使用 Flavor 创建自定义上下文
type MyContext = CommandsFlavor<Context>;

// 使用新的上下文来实例化你的 bot
const bot = new Bot<MyContext>(""); // <-- 把你的 bot token 放在 "" 中 (https://t.me/BotFather)

// 注册上下文捷径
bot.use(commands());

const loggedOutCommands = new CommandGroup<MyContext>();
const loggedInCommands = new CommandGroup<MyContext>();

loggedOutCommands.command(
  "login",
  "Start your session with the bot",
  async (ctx) => {
    await ctx.setMyCommands(loggedInCommands);
    await ctx.reply("Welcome! Session started!");
  },
);

loggedInCommands.command(
  "logout",
  "End your session with the bot",
  async (ctx) => {
    await ctx.setMyCommands(loggedOutCommands);
    await ctx.reply("Goodbye :)");
  },
);

bot.use(loggedInCommands);
bot.use(loggedOutCommands);

// 默认情况下，用户未登录，
// 因此你就可以为每个人设置注销指令
await loggedOutCommands.setCommands(bot);
```

```js [JavaScript]
const bot = new Bot(""); // <-- 把你的 bot token 放在 "" 中 (https://t.me/BotFather)

// 注册上下文捷径
bot.use(commands());

const loggedOutCommands = new CommandGroup();
const loggedInCommands = new CommandGroup();

loggedOutCommands.command(
  "login",
  "Start your session with the bot",
  async (ctx) => {
    await ctx.setMyCommands(loggedInCommands);
    await ctx.reply("Welcome! Session started!");
  },
);

loggedInCommands.command(
  "logout",
  "End your session with the bot",
  async (ctx) => {
    await ctx.setMyCommands(loggedOutCommands);
    await ctx.reply("Goodbye :)");
  },
);

bot.use(loggedInCommands);
bot.use(loggedOutCommands);

// 默认情况下，用户未登录，
// 因此你就可以为每个人设置注销指令
await loggedOutCommands.setCommands(bot);
```

:::

这样，当用户调用 `/login` 时，他们的指令列表将被更改为仅包含 `logout` 指令。
很简洁，对吧？

::: danger 指令名称限制
如 [Telegram Bot API 文档](https://core.telegram.org/bots/api#botcommand) 中所述，指令名称必须包含：

1. 1-32 个字符。
2. 只能包含小写英文字母（a-z）、数字（0-9）以及下划线（_）。

因此，使用无效指令名称调用 `setCommands` 或 `setMyCommands` 都会引发异常。
不遵循此规则的指令仍然可以注册和处理，但不会出现在用户菜单上。
:::

**请注意**， `setCommands` 和 `setMyCommands` 仅影响用户指令菜单中显示的指令，而不影响对它们的实际访问。
你将在 [作用域指令](#作用域指令) 部分了解如何实现受限指令访问。

### 分组指令

由于我们可以将指令拆分并分组到不同的实例中，因此它允许更惯用的指令文件组织。

假设我们想要仅限开发人员使用的指令。
我们可以通过以下代码结构来实现：

```ascii
.
├── bot.ts
├── types.ts
└── commands/
    ├── admin.ts
    └── users/
        ├── group.ts
        ├── say-hello.ts
        └── say-bye.ts
```

以下代码组举例说明了我们如何实现仅限开发人员的指令组，并相应地更新 Telegram 客户端指令菜单。
请注意到 `admin.ts` 和 `group.ts` 文件选项卡中使用的不同模式。

::: code-group

```ts [bot.ts]
import { devCommands } from "./commands/admin.ts";
import { userCommands } from "./commands/users/group.ts";
import type { MyContext } from "./types.ts";

export const bot = new Bot<MyContext>(""); // <-- 把你的 bot token 放在 "" 中 (https://t.me/BotFather)

bot.use(commands());

bot.use(userCommands);
bot.filter((ctx) => ctx.from?.id == /** Put your ID here **/)
      .use(devCommands);
```

```ts [types.ts]
import type { Context } from "grammy";

export type MyContext = CommandsFlavor<Context>;
```

```ts [admin.ts]
import { userCommands } from './users/group.ts';
import type { MyContext } from '../types.ts';

export const devCommands = new CommandGroup<MyContext>();

devCommands.command("devlogin", "Set command menu to dev mode", async (ctx, next) => {
  await ctx.reply("Hello, fellow developer! Are we having coffee today too?");
  await ctx.setMyCommands(userCommands, devCommands);
});

devCommands.command("usercount", "Display user count", async (ctx, next) => {
  await ctx.reply(`Total users: ${/** 你的业务逻辑 */}`);
});

devCommands.command("devlogout", "Reset command menu to user-mode", async (ctx, next) => {
  await ctx.reply("Until next commit!");
  await ctx.setMyCommands(userCommands);
});
```

```ts [group.ts]
import sayHello from "./say-hello.ts";
import sayBye from "./say-bye.ts";
import type { MyContext } from "../../types.ts";

export const userCommands = new CommandGroup<MyContext>()
  .add([sayHello, sayBye]);
```

```ts [say-hello.ts]
import type { MyContext } from "../../types.ts";

export default new Command<MyContext>("hello", "Say hello", async (ctx) => {
  await ctx.reply("Hello, little user!");
});
```

```ts [say-bye.ts]
import type { MyContext } from "../../types.ts";

export default new Command<MyContext>("bye", "Say bye", async (ctx) => {
  await ctx.reply("Goodbye :)");
});
```

:::

你是否知道，如上例所示，你可以直接使用 `.command(...)` 方法来创建指令，也可以通过使用 `.add` 方法将已初始化的 `Commands` 注册到 `CommandGroup` 实例中来创建指令？
这种方法可以让你将所有内容保存在单个文件中，例如在 `admin.ts` 中，或者跨多个文件组织指令，例如在 `group.ts` 中。

::: tip 始终使用指令组

使用 `Command` 构造函数创建和导出指令时，必须通过 `.add` 方法将它们注册到 `CommandGroup` 实例上。
它们本身是没有用的，所以一定要在某个时刻注册上。

:::

插件还确保 `CommandGroup` 及其 `Commands` 共享相同的 `Context` 类型，因此你看一眼就可以避免那种愚蠢的错误！
将这些知识与以下部分相结合将使你的指令游戏更上一层楼。

## 作用域指令

你是否知道你可以根据聊天类型、语言甚至聊天组中的用户状态允许在不同的聊天中显示不同的指令？
这就是 Telegram 所说的 [**指令范围**](https://core.telegram.org/bots/features#command-scopes)。

现在，指令范围是一个很酷的功能，但手动使用它可能会变得非常混乱，因为很难跟踪所有范围以及它们提供的指令。
另外，通过单独使用指令范围，你必须在每个指令内进行手动过滤，以确保它们仅在正确的范围内运行。
同步这两件事可能是一场噩梦，这就是这个插件存在的原因。
让我们看看它是如何做到的。

`command` 方法返回的 `Command` 类暴露了一个名为 `addToScope` 的方法。
此方法接受 [`BotCommandScope`](/ref/types/botcommandscope) 以及一个或多个处理程序，并将这些处理程序注册为在该特定范围内运行。

你甚至不需要担心调用 `filter`，`addToScope` 方法将保证只有在上下文正确的情况下才会调用你的处理程序。

下面是一个作用域指令的示例：

```ts
const myCommands = new CommandGroup();

myCommands
  .command("hello", "Say hello")
  .addToScope(
    { type: "all_group_chats" },
    (ctx) => ctx.reply(`Hello, members of ${ctx.chat.title}!`),
  )
  .addToScope(
    { type: "all_private_chats" },
    (ctx) => ctx.reply(`Hello, ${ctx.chat.first_name}!`),
  );
```

现在可以从私聊和群聊中调用 `hello` 指令，并且根据调用位置它会给出不同的响应。
现在，如果你调用 `myCommands.setCommands` 了，`hello` 指令菜单将会显示在私聊和群聊中。

以下是仅群管理员可以访问的指令示例。

```js
adminCommands
  .command("secret", "Admin only")
  .addToScope(
    { type: "all_chat_administrators" },
    (ctx) => ctx.reply("Free cake!"),
  );
```

这是只能在群组中访问的指令的示例。

```js
groupCommands
  .command("fun", "Laugh")
  .addToScope(
    { type: "all_group_chats" },
    (ctx) => ctx.reply("Haha"),
  );
```

请注意，`command` 方法也可以接收处理程序。
如果你给它一个处理程序，该处理程序将应用于该指令的 `default` 范围。
在该指令上调用 `addToScope` 将添加一个新的处理程序，该处理程序将被过滤到该范围。
看一下这个例子。

```ts
myCommands
  .command(
    "default",
    "Default command",
    // 当不在群聊中时将调用此方法
    (ctx) => ctx.reply("Hello from default scope"),
  )
  .addToScope(
    { type: "all_chat_administrators" },
    // 当在该群组内时，群管理员可以调用此指令
    (ctx) => ctx.reply("Hello, admin!"),
  )
  .addToScope(
    { type: "all_group_chats" },
    // 这只会对群聊中的非管理员用户调用
    (ctx) => ctx.reply("Hello, group chat!"),
  );
```

## 指令翻译

另一个强大的功能是能够根据用户语言为同一指令设置不同的名称以及各自的描述。
指令插件通过提供 `localize` 方法使这变得简单。
来看一下：

```js
myCommands
  // 你需要设置默认名称和描述
  .command("hello", "Say hello")
  // 然后就可以设置本地化的了
  .localize("pt", "ola", "Dizer olá");
```

想加多少就加多少！
当你调用 `myCommands.setCommands` 时，该插件将负责为你注册它们。

为了方便起见，grammY 导出一个类似于枚举类的 `LanguageCodes` 对象，你可以将其用于创建更惯用的方法：

::: code-group

```ts [TypeScript]
import { LanguageCodes } from "@grammyjs/commands";

myCommands.command(
  "chef",
  "Steak delivery",
  (ctx) => ctx.reply("Steak on the plate!"),
)
  .localize(
    LanguageCodes.Spanish,
    "cocinero",
    "Bife a domicilio",
  );
```

```js [JavaScript]
const { LanguageCodes } = require("@grammyjs/commands");

myCommands.command(
  "chef",
  "Steak delivery",
  (ctx) => ctx.reply("Steak on the plate!"),
)
  .localize(
    LanguageCodes.Spanish,
    "cocinero",
    "Bife a domicilio",
  );
```

```ts [Deno]
import { LanguageCodes } from "https://deno.land/x/grammy_commands/mod.ts";

myCommands.command(
  "chef",
  "Steak delivery",
  (ctx) => ctx.reply("Steak on the plate!"),
)
  .localize(
    LanguageCodes.Spanish,
    "cocinero",
    "Bife a domicilio",
  );
```

:::

### 使用国际化插件本地化指令

如果你希望将本地化的指令名称和描述捆绑在你的 `.ftl` 文件中，你可以用以下方法：

```ts
function addLocalizations(command: Command) {
  i18n.locales.forEach((locale) => {
    command.localize(
      locale,
      i18n.t(locale, `${command.name}.command`),
      i18n.t(locale, `${command.name}.description`),
    );
  });
  return command;
}

myCommands.commands.forEach(addLocalizations);
```

## 查找最接近的指令

Telegram 会在输入时自动补全已注册的指令。
但是，有时用户仍然完全手动输入这些指令，可能会出错。

为了解决这个问题，指令插件会建议用户可能想要使用的指令。

此功能适用于自定义前缀，因此你无需担心兼容性。
此外，它易于使用。

::: code-group

```ts [TypeScript]
// 使用 Flavor 创建自定义上下文
type MyContext = Context & CommandsFlavor;

// 使用新的上下文来实例化你的 bot
const bot = new Bot<MyContext>(""); // <-- 把你的 bot token 放在 "" 中 (https://t.me/BotFather)
const myCommands = new CommandGroup<MyContext>();

// ... 注册指令

bot
  // 检查是否有指令
  .filter(commandNotFound(myCommands))
  // 如果有，则意味着我们的任何指令都没有处理它。
  .use(async (ctx) => {
    if (ctx.commandSuggestion) {
      // 我们找到了潜在的匹配对象
      return ctx.reply(
        `Hmm... I don't know that command. Did you mean ${ctx.commandSuggestion}?`,
      );
    }

    // 似乎没有什么与用户输入的内容相近
    await ctx.reply("Oops... I don't know that command :/");
  });
```

```js [JavaScript]
const bot = new Bot(""); // <-- 把你的 bot token 放在 "" 中 (https://t.me/BotFather)
const myCommands = new CommandGroup();

// ... 注册指令

bot
  // 检查是否有指令
  .filter(commandNotFound(myCommands))
  // 如果有，则意味着我们的任何指令都没有处理它。
  .use(async (ctx) => {
    if (ctx.commandSuggestion) {
      // 我们找到了潜在的匹配对象
      return ctx.reply(
        `Hmm... I don't know that command. Did you mean ${ctx.commandSuggestion}?`,
      );
    }

    // 似乎没有什么与用户输入的内容相近
    await ctx.reply("Oops... I don't know that command :/");
  });
```

:::

`commandNotFound` 断言使用一些选项来自定义其行为：

- `ignoreLocalization`：不优先考虑与用户语言匹配的指令。
- `ignoreCase`：允许插件在搜索类似指令时忽略字母大小写。
- `similarityThreshold`：确定指令名称必须与用户输入有多相似才能被推荐。

此外，你可以通过提供一个 `CommandGroup` 数组（而不是仅一个实例）以在多个 `CommandGroup` 实例中搜索。

`commandNotFound` 函数只会被包含与你注册的指令类似的类指令文本的 update 所触发。
例如，如果你只注册了 [带有自定义前缀的指令](#prefix)，如 `?`，它将触发任何看起来像你的指令的处理程序，例如：`?sayhi`，而不是 `/definitely_a_command`。

反之亦然，如果你只有带有默认前缀的指令，它只会在看起来像 `/regular` 和 `/commands` 的 update 上触发。

推荐的指令仅来自你传递给函数的 `CommandGroup` 实例。
这意味着你可以将检查分成多个单独的 filter。

让我们利用前面的知识来看看下一个示例：

```ts
const myCommands = new CommandGroup();
myCommands.command("dad", "calls dad", () => {}, { prefix: "?" })
  .localize("es", "papa", "llama a papa")
  .localize("fr", "pere", "appelle papa");

const otherCommands = new CommandGroup();
otherCommands.command("bread", "eat a toast", () => {})
  .localize("es", "pan", "come un pan")
  .localize("fr", "pain", "manger du pain");

bot.use(myCommands);
bot.use(otherCommands);

// 假设用户是法国人并输入 /Papi
bot
  // 此 filter 将被任何像指令一样的文本所触发，例如 `/regular` 或 `?custom`
  .filter(commandNotFound([myCommands, otherCommands], {
    ignoreLocalization: true,
    ignoreCase: true,
  }))
  .use(async (ctx) => {
    ctx.commandSuggestion === "?papa"; // 计算结果为真
  });
```

如果 `ignoreLocalization` 为假，那么 `ctx.commandSuggestion` 将会等于 `/pain`。

我们还可以通过使用不同的参数或 `CommandGroups` 来添加更多与前面提到的类似的 filter 来检查。

我们可以通过多种方式来定制它！

## 指令选项

你可以为每个指令、每个范围或全局指定 `CommandGroup` 实例的一些选项。
这些选项允许你进一步自定义 bot 处理指令的方式，从而为你提供更大的灵活性。

### `ignoreCase`

默认情况下，指令以区分大小写的方式匹配用户输入。
当设置此标志时，像 `/dandy` 这样的指令将匹配诸如 `/DANDY` 或 `/dandY` 之类的变体，无论大小写。

### `targetedCommands`

当用户调用指令时，他们可以选择艾特你的 bot，例如：`/command@bot_username`。
你可以使用 `targetedCommands` 配置选项来决定如何处理这些指令。
有了这个选项，你可以在三种不同的行为之间进行选择：

- `ignored`: 忽略艾特你的 bot 用户名的指令
- `optional`: 处理艾特和未艾特 bot 用户名的指令
- `required`: 仅处理艾特了 bot 用户名的指令

### `prefix`

目前，Telegram 只能识别以 `/` 开头的指令，因此，也可以被 [grammY 核心库的指令处理程序](../guide/commands) 识别。
在某些情况下，你可能想要更改它并为你的 bot 使用自定义前缀。
这是通过 `prefix` 选项实现的，该选项将告诉指令插件在尝试识别指令时查找该前缀。

如果你需要从 update 中检索 `botCommand` 实体，并需要将它们与你已注册的自定义前缀进行结合，有一个专门为此定制的方法，称为 `ctx.getCommandEntities(yourCommands)`，它返回与 `ctx.entities('bot_command')` 相同的接口。

::: danger

带有自定义前缀的指令无法显示在指令菜单中。

:::

### `matchOnlyAtStart`

在 [处理指令](../guide/commands) 时，grammY 核心库仅识别以消息的第一个字符开始的指令。
然而，指令插件允许你在消息文本中间监听指令，或者最后，这并不重要！
你所要做的就是将 `matchOnlyAtStart` 选项设置为 `false`，剩下的由插件完成。

## 正则表达式指令

此功能适合那些真正想要疯狂一下的人。
它允许你基于正则表达式而不是静态字符串创建指令处理程序。
一个基本示例如下所示：

```ts
myCommands
  .command(
    /delete_([a-zA-Z]+)/,
    "删除这个",
    (ctx) => ctx.reply(`Deleting ${ctx.msg?.text?.split("_")[1]}`),
  );
```

该指令处理程序将在 `/delete_me` 上触发，与在 `/delete_you` 中相同，并且它会在第一种情况下回复 `Deleting me`，在第二次种情况下回复 `Deleting you`，但不会在 `/delete_` 上触发，也不会在 `/delete_123xyz` 上触发，就好像它不存在一样。

## 插件概述

- 名字: `commands`
- [源码](https://github.com/grammyjs/commands)
- [参考](/ref/commands/)
