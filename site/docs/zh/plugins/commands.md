---
prev: false
next: false
---

# 指令 (`commands`)

指令处理增强插件

此插件提供了一些与指令处理相关的功能，这些功能不包含在 [核心库的指令处理中](../guide/commands)。
以下是该插件所提供功能的快速概览：

- 通过将中间件与指令定义封装在一起，提高代码可读性
- 通过 `setMyCommands` 实现用户指令菜单的同步
- 改进的指令分组和组织结构
- 能够限制指令的访问范围，例如：仅对群组管理员或特定频道可用
- 支持指令的多语言翻译
- `Did you mean ...?` 功能，用户输入错误指令时可以找到最接近的已有指令
- 支持指令匹配不区分大小写
- 为艾特你的 bot 的指令设置自定义行为，
  例如：`/start@your_bot`
- 自定义指令前缀，例如：`+`、`?` 或任何非 `/` 的符号
- 支持指令出现在消息开头以外的位置
- 支持正则表达式指令！

所有这些功能都可以通过定义一个或多个中心化的、定义了你的 bot 的指令的指令结构来实现。

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
const { CommandGroup, commands, commandNotFound } = require(
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

使用 `CommandGroup` 类的实例定义指令后，你可以调用 `setCommands` 方法，该方法会将所有定义的指令注册到你的 bot。

```ts
const myCommands = new CommandGroup();

myCommands.command("hello", "Say hello", (ctx) => ctx.reply("Hi there!"));
myCommands.command("start", "Start the bot", (ctx) => ctx.reply("Starting..."));

bot.use(myCommands);

await myCommands.setCommands(bot);
```

这将使你注册的每个指令都显示在与你的 bot 进行私人聊天的菜单上，或者每当用户在你的 bot 所属的聊天中输入 `/` 时。

### 上下文捷径

如果你希望某些指令仅向某些用户显示怎么办？例如，假设你有一个 `login` 和一个 `logout` 指令。
`login` 指令应该只对未登录的用户显示，反之亦然。
这是使用指令插件执行此操作的方法：

::: code-group

```ts [TypeScript]
// 使用 Flavor 创建自定义上下文
type MyContext = Context & CommandsFlavor;

// 使用新的上下文来实例化你的 bot
const bot = new Bot<MyContext>("token");

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

```js [JavaScript]
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
如 [Telegram Bot API 文档](https://core.telegram.org/bots/api#botcommand) 中所述，指令名称只能采用以下形式：

> 1-32 个字符。
> 只能包含小写英文字母、数字和下划线。

因此，使用除 lower_c4s3_commands 之外的任何内容调用 `setCommands` 或 `setMyCommands` 都会引发异常。
不遵循此规则的指令仍然可以注册、使用和处理，但永远不会显示在用户菜单上。
:::

**请注意**， `setCommands` 和 `setMyCommands` 仅影响用户指令菜单中显示的指令，而不影响对它们的实际访问。
你将在 [作用域指令](#作用域指令) 部分了解如何实现受限指令访问。

### 分组指令

由于我们可以将指令拆分并分组到不同的实例中，因此它允许更惯用的指令文件组织。

假设我们想要仅限开发人员使用的指令。
我们可以通过以下代码结构来实现：

```ascii
src/
├─ commands/
│  ├─ admin.ts
│  ├─ users/
│  │  ├─ group.ts
│  │  ├─ say-hi.ts
│  │  ├─ say-bye.ts
│  │  ├─ ...
├─ bot.ts
├─ types.ts
tsconfig.json
```

以下代码组举例说明了我们如何实现仅限开发人员的指令组，并相应地更新 Telegram 客户端指令菜单。
请注意到 `admin.ts` 和 `group.ts` 文件选项卡中使用的不同模式。

::: code-group

```ts [types.ts]
export type MyContext = Context & CommandsFlavor<MyContext>;
```

```ts [bot.ts]
import { devCommands } from "./commands/admin.ts";
import { userCommands } from "./commands/users/group.ts";
import type { MyContext } from "./types.ts";

export const bot = new Bot<MyContext>("MyBotToken");

bot.use(commands());

bot.use(userCommands);
bot.use(devCommands);
```

```ts [admin.ts]
import { userCommands } from './users/group.ts'
import type { MyContext } from '../types.ts'

export const devCommands = new CommandGroup<MyContext>()

devCommands.command('devlogin', 'Greetings', async (ctx, next) => {
   if (ctx.from?.id === ctx.env.DEVELOPER_ID) {
      await ctx.reply('Hi to me')
      await ctx.setMyCommands(userCommands, devCommands)
   } else {
     await next()
   }
})

devCommands.command('usercount', 'Greetings', async (ctx, next) => {
   if (ctx.from?.id === ctx.env.DEVELOPER_ID) {
      await ctx.reply(
        `Active users: ${/** 你的业务逻辑 */}`
    )
   } else {
     await next()
   }
})

devCommands.command('devlogout', 'Greetings', async (ctx, next) => {
    if (ctx.from?.id === ctx.env.DEVELOPER_ID) {
       await ctx.reply('Bye to me')
       await ctx.setMyCommands(userCommands)
   } else {
     await next()
   }
 })
```

```ts [group.ts]
import sayHi from "./say-hi.ts";
import sayBye from "./say-bye.ts";
import etc from "./another-command.ts";
import type { MyContext } from "../../types.ts";

export const userCommands = new CommandGroup<MyContext>()
  .add([sayHi, sayBye]);
```

```ts [say-hi.ts]
import type { MyContext } from "../../types.ts";

export default new Command<MyContext>("sayhi", "Greetings", async (ctx) => {
  await ctx.reply("Hello little User!");
});
```

:::

你是否注意到可以通过 `.add` 方法将单个初始化指令注册到 `CommandGroup` 实例中，或者也可以直接通过 `.command(...)` 方法注册？
这允许仅一个文件的结构，如 `admin.ts` 文件中，或者更分布式的文件结构，如 `group.ts` 文件中的结构。

::: tip 始终使用指令组

使用 `Command` 构造函数创建和导出指令时，必须通过 `.add` 方法将它们注册到 `CommandGroup` 实例上。
它们本身是没有用的，所以一定要在某个时刻这样做。

:::

插件还强制你为给定的 `CommandGroup` 及其各自的 `Commands` 拥有相同的上下文类型，这样你一眼就可以看到和避免这种愚蠢的错误！

将这些知识与以下部分相结合将使你的指令游戏更上一层楼。

## 作用域指令

你是否知道你可以根据聊天类型、语言甚至聊天组中的用户状态允许在不同的聊天中显示不同的指令？
这就是 Telegram 所说的 [**指令范围**](https://core.telegram.org/bots/features#command-scopes)。

现在，指令范围是一个很酷的功能，但手动使用它可能会变得非常混乱，因为很难跟踪所有范围以及它们提供的指令。
另外，通过单独使用指令范围，你必须在每个指令内进行手动过滤，以确保它们仅在正确的范围内运行。
同步这两件事可能是一场噩梦，这就是这个插件存在的原因。
看看它是如何做到的。

`command` 方法返回的 `Command` 类暴露了一个名为 `addToScope` 的方法。
此方法接受 [BotCommandScope](/ref/types/botcommandscope) 以及一个或多个处理程序，并将这些处理程序注册为在该特定范围内运行。

你甚至不需要担心调用 `filter`，`addToScope` 方法将保证只有在上下文正确的情况下才会调用你的处理程序。

下面是一个作用域指令的示例：

```ts
const myCommands = new CommandGroup();

myCommands
  .command("start", "Initializes bot configuration")
  .addToScope(
    { type: "all_private_chats" },
    (ctx) => ctx.reply(`Hello, ${ctx.chat.first_name}!`),
  )
  .addToScope(
    { type: "all_group_chats" },
    (ctx) => ctx.reply(`Hello, members of ${ctx.chat.title}!`),
  );
```

现在可以从私人聊天和群聊中调用 `start` 指令，并且根据调用位置它会给出不同的响应。
现在，如果你调用 `myCommands.setCommands` 了，`start` 指令将注册到私人聊天和群聊中。

以下是仅群管理员可以访问的指令示例。

```js
adminCommands
  .command("secret", "Admin only")
  .addToScope(
    { type: "all_chat_administrators" },
    (ctx) => ctx.reply("Free cake!"),
  );
```

这是只能在群组中访问的指令的示例

```js
myCommands
  .command("fun", "Laugh")
  .addToScope(
    { type: "all_group_chats" },
    (ctx) => ctx.reply("Haha"),
  );
```

请注意，当你调用 `command` 方法时，它会打开一个新指令。
如果你给它一个处理程序，该处理程序将应用于该指令的 `default` 范围。
在该指令上调用 `addToScope` 将添加一个新的处理程序，该处理程序将被过滤到该范围。
看一下这个例子。

```ts
myCommands
  .command(
    "default",
    "Default command",
    // 当不在群聊中或用户不是管理员时将调用此方法
    (ctx) => ctx.reply("Hello from default scope"),
  )
  .addToScope(
    { type: "all_group_chats" },
    // 这只会对群聊中的非管理员用户调用
    (ctx) => ctx.reply("Hello, group chat!"),
  )
  .addToScope(
    { type: "all_chat_administrators" },
    // 当在该群组内时，群管理员可以调用此指令
    (ctx) => ctx.reply("Hello, admin!"),
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

想加多少就加多少！当你调用 `myCommands.setCommands` 时，该插件将负责为你注册它们。

为了方便起见，grammY 导出一个类似于枚举类的 `LanguageCodes` 对象，你可以将其用于更惯用的方法：

::: code-group

```ts [TypeScript]
import { LanguageCodes } from "grammy/types";

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
const { LanguageCodes } = require("grammy/types");

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
import { LanguageCodes } from "https://deno.land/x/grammy/types.ts";

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

## 查找最近的指令

尽管 Telegram 能够自动完成注册的指令，但有时用户会手动输入指令，并且在某些情况下会出现错误。
指令插件可以帮助你处理这个问题，它允许你建议一个可能是用户最初想要的指令。
它与自定义前缀兼容，因此你不必担心这一点，并且它的用法非常简单：

::: code-group

```ts [TypeScript]
// 使用 Flavor 创建自定义上下文
type MyContext = Context & CommandsFlavor;

// 使用新的上下文来实例化你的 bot
const bot = new Bot<MyContext>("token");
const myCommands = new CommandGroup<MyContext>();

// ... 注册指令

bot
  // 检查是否有指令
  .filter(commandNotFound(myCommands))
  // 如果有，则意味着我们的任何指令都没有处理它。
  .use(async (ctx) => {
    // 我们找到了潜在的匹配对象
    if (ctx.commandSuggestion) {
      await ctx.reply(
        `Hmm... I don't know that command. Did you mean ${ctx.commandSuggestion}?`,
      );
    }

    // 似乎没有什么与用户输入的内容相近
    await ctx.reply("Oops... I don't know that command :/");
  });
```

```js [JavaScript]
// 使用新的上下文来实例化你的 bot
const bot = new Bot("token");
const myCommands = new CommandGroup();

// ... 注册指令

bot
  // 检查是否有指令
  .filter(commandNotFound(myCommands))
  // 如果有，则意味着我们的任何指令都没有处理它。
  .use(async (ctx) => {
    // 我们找到了潜在的匹配对象
    if (ctx.commandSuggestion) {
      await ctx.reply(
        `Hmm... I don't know that command. Did you mean ${ctx.commandSuggestion}?`,
      );
    }

    // 似乎没有什么与用户输入的内容相近
    await ctx.reply("Oops... I don't know that command :/");
  });
```

:::

在幕后，`commandNotFound` 将使用 `getNearestCommand` 上下文方法，该方法默认会优先考虑与用户语言相对应的指令。
如果你想关闭此行为，可以将 `ignoreLocalization` 标志设置为 true。
可以跨多个 CommandGroup 实例进行搜索，并且 `ctx.commandSuggestion` 将是所有实例中最相似的指令，如果有的话。
它还允许设置 `ignoreCase` 标志，该标志将在查找类似指令时忽略大小写，以及 `similarityThreshold` 标志，该标志控制指令名称必须与用户输入的相似程度才能推荐。

`commandNotFound` 函数只会被包含与你注册的命令类似的类命令文本的 update 所触发。
例如，如果你只注册了 [带有自定义前缀的指令](#前缀)，如 `?`，它将触发任何看起来像你的指令的处理程序，例如：`?sayhi`，而不是 `/definitely_a_command`。
反之亦然，如果你只有带有默认前缀的指令，它只会在看起来像 `/regular` `/commands` 的 update 上触发。

推荐的命令仅来自你传递给函数的 `CommandGroup` 实例。
因此，你可以把检查推迟到多个单独的 filter 中。

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

// 注册每个特定于语言的命令组

// 假设用户是法国人并输入 /Papi
bot
  // 此 filter 将触发任何命令，例如 `/regular` 或 `?custom`
  .filter(commandNotFound([myCommands, otherCommands], {
    ignoreLocalization: true,
    ignoreCase: true,
  }))
  .use(async (ctx) => {
    ctx.commandSuggestion === "?papa"; // 计算结果为真
  });
```

如果 `ignoreLocalization` 是假的，我们会得到 “`ctx.commandSuggestion` 等于 `/pain`”。
我们可以添加更多像上面这样的 filter，使用不同的参数或 `CommandGroups` 来检查。
可能性非常多！

## 命令选项

你可以为每个命令、每个范围或全局指定 `CommandGroup` 实例的一些选项。
这些选项允许你进一步自定义 bot 处理命令的方式，从而为你提供更大的灵活性。

### 忽略大小写

默认情况下，命令将以区分大小写的方式匹配用户输入。
例如，在名为 `/dandy` 的命令中设置此标志将与 `/DANDY`、`/dandY` 或任何其他仅大小写不同的变体匹配。

### targetedCommands

当用户调用命令时，他们可以选择艾特你的 bot，例如：`/command@bot_username`。
你可以使用“ `targetedCommands` 配置选项来决定如何处理这些命令。
有了它，你可以在三种不同的行为之间进行选择：

- `ignored`: 忽略艾特你的 bot 的用户的命令
- `optional`: 处理艾特和未艾特 bot 的用户的命令
- `required`: 仅处理艾特了 bot 的用户的命令

### 前缀

目前，Telegram 只能识别以 `/` 开头的命令，因此也可以被 [grammY 核心库的命令处理程序](../guide/commands) 识别。
在某些情况下，你可能想要更改它并为你的 bot 使用自定义前缀。
这是通过 `prefix` 选项实现的，该选项将告诉命令插件在尝试识别命令时查找该前缀。

如果你需要从 update 中检索 `botCommand` 实体，并需要将它们与你已注册的自定义前缀进行结合，有一个专门为此定制的方法，称为 `ctx.getCommandEntities(yourCommands)`，它返回与 `ctx.entities('bot_command')` 相同的接口。

:::tip

带有自定义前缀的命令无法显示在命令菜单中。

:::

### matchOnlyAtStart

在 [处理命令](../guide/commands) 时，grammY 核心库将仅识别以消息的第一个字符开始的命令。
然而，命令插件允许你在消息文本中间监听命令，或者最后，这并不重要！
你所要做的就是将 `matchOnlyAtStart` 选项设置为 `false`，剩下的将由插件完成。

## 正则表达式命令

此功能适合那些真正想要疯狂的人，它允许你基于正则表达式而不是静态字符串创建命令处理程序，一个基本示例如下所示：

```ts
myCommands
  .command(
    /delete_([a-zA-Z]+)/,
    (ctx) => ctx.reply(`Deleting ${ctx.msg?.text?.split("_")[1]}`),
  );
```

该命令处理程序将在 `/delete_me` 上触发，与在 `/delete_you` 中相同，并且它会在第一种情况下回复 “Deleting me”，在后面的情况下回复 “Deleting you”，但不会在 `/delete_` 上触发，也不会在 `/delete_123xyz` 上触发，就好像它不存在一样。

## 插件概述

- 名字: `commands`
- [源码](https://github.com/grammyjs/commands)
- [参考](/ref/commands/)
