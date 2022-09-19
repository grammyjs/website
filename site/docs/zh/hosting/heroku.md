# 托管：Heroku

![Deno badge](/badges/deno.svg) ![Node.js badge](/badges/nodejs.svg)

> 我们假设你有关于如何使用 grammY 创建 bot 的基本知识。
> 如果你还没有准备好，不要犹豫，请查看我们十分友好的 [指南](../guide) ！ :rocket:

本教程将指导你如何通过 [webhooks](../guide/deployment-types.md#webhooks-是如何工作的) 或者 [长轮询](../guide/deployment-types.md#长轮询是如何工作的) 将 Telegram bot 部署到 [Heroku](https://heroku.com/)。
我们还假设你已经有了一个 Heroku 账户。

## 前提条件

首先，安装一些依赖：

```bash
# 创建项目目录。
mkdir grammy-bot
cd grammy-bot
npm init --y

# 安装主要依赖。
npm install grammy express

# 安装开发依赖。
npm install -D typescript @types/express @types/node

# 创建 TypeScript 配置文件。
npx tsc --init
```

我们将 TypeScript 文件放在 `src` 文件夹中，编译文件放在 `dist` 文件夹中。
在项目的根目录下创建文件夹。
然后，在 `src` 文件夹中创建一个名为 `bot.ts` 的新文件。
现在，我们的文件夹目录结构应该是这样的：

```asciiart:no-line-numbers
.
├── node_modules/
├── dist/
├── src/
│   └── bot.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

然后，将 `tsconfig.json` 修改为如下配置：

```json{4}
{
  "compilerOptions": {
    "target": "ESNEXT",
    "module": "esnext", // 把 commonjs 改成 esnext
    "lib": ["ES2021"],
    "outDir": "./dist/",
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

因为在上面的配置中，我们将 `module` 选项从 `commonjs` 设置为了 `esnext`，所以我们需要在 `package.json` 中添加 `"type": "module"`。
`package.json` 文件如下所示：

```json{6}
{
  "name": "grammy-bot",
  "version": "0.0.1",
  "description": "",
  "main": "dist/app.js",
  "type": "module", // 添加 "type": "module"
  "scripts": {
    "dev-build": "tsc"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "grammy": "^1.2.0",
    "express": "^4.17.1"
  },
  "devDependencies": {
    "typescript": "^4.3.5",
    "@types/express": "^4.17.13",
    "@types/node": "^16.3.1"
  },
  "keywords": []
}
```

上面我们提到了，我们有两个选择来接收 Telegram 的数据，webhooks 和长轮询。
你可以在 [这里](../guide/deployment-types.md) 了解更多关于两者之间的优缺点，再决定使用哪一个。

## Webhooks

> 如果你决定使用长轮询，你可以跳过本节，跳转到 [关于长轮询的章节](#长轮询)。:rocket:

简而言之，与长轮询不同的是，webhook 不会通过持续运行来获取 Telegram 传入的消息。
这会减少服务器负载，并为我们节省大量的 [dyno 时间](https://devcenter.heroku.com/articles/free-dyno-hours)，尤其是当你在使用免费计划时。:grin:

Okay，让我们继续！
还记得我们之前创建的 `bot.ts` 吗？
我们不会把所有的代码都扔在里面，而是把 bot 的部分留给你自己。
所以我们将使用 `app.ts` 来作为我们的主要入口。
这意味着每次 Telegram （或者其他人）访问我们的网站时，`express` 会决定你的服务器的哪个部分将负责处理请求。
当你在同一个域名下部署网站和机器人时，这会很有用。
此外，通过将代码分割到不同的文件，可以让我们的代码看起来更整洁。:sparkles:

### Express 和它的中间件

在 `src` 文件夹中创建 `app.ts`，并添加如下代码：

```ts
import express from "express";
import { webhookCallback } from "grammy";
import { bot } from "./bot";

const domain = String(process.env.DOMAIN);
const secretPath = String(process.env.BOT_TOKEN);
const app = express();

app.use(express.json());
app.use(`/${secretPath}`, webhookCallback(bot, "express"));

app.listen(Number(process.env.PORT), async () => {
  // 请确保它是 `https` 而不是 `http`！
  await bot.api.setWebhook(`https://${domain}/${secretPath}`);
});
```

让我们看一下上面的代码：

- `process.env`：请记住，千万不要在我们的代码中存储凭证！
  关于如何在 Heroku 中 [创建环境变量](https://www.freecodecamp.org/news/using-environment-variables-the-right-way/)，请前往 [这个指南](https://devcenter.heroku.com/articles/config-vars)。
- `secretPath`：它可以是我们的 `BOT_TOKEN` 或者任何随机字符串。最好的做法是按照 [Telegram 的解释](https://core.telegram.org/bots/api#setwebhook) 来隐藏我们的 bot 的路径。

::: tip ⚡ 优化（可选）
第 14 行的 `bot.api.setWebhook` 将会在每次 Heroku 再次启动你的服务器时运行。
对于低流量的 bot，每次请求都会触发。
然而，我们并不需要在每次有请求时都运行这段代码。
因此，我们完全可以删除这一部分，只需要手动执行一次 `GET`。
在部署我们的 bot 之后，在你的浏览器上打开这个链接：

```asciiart:no-line-numbers
https://api.telegram.org/bot<bot_token>/setWebhook?url=<webhook_url>
```

请注意，有些浏览器要求你在传递 `webhook_url` 前手动 [编码](https://en.wikipedia.org/wiki/Percent-encoding#Reserved_characters)。
举个例子，如果我的有 bot 令牌 `abcd:1234` 和网址 `https://grammybot.herokuapp.com/secret_path`，那么我们的链接应该像这样：

```asciiart:no-line-numbers
https://api.telegram.org/botabcd:1234/setWebhook?url=https%3A%2F%2Fgrammybot.herokuapp.com%2Fsecret_path
```

:::

::: tip ⚡ 优化（可选）
使用 [Webhook Reply](../guide/deployment-types.md#webhook-reply) 以提高效率。
:::

### 创建 `bot.ts`

下一步，前往 `bot.ts`：

```ts
import { Bot } from "grammy";

if (process.env.BOT_TOKEN == null) throw Error("BOT_TOKEN is missing.");
export const bot = new Bot(`${process.env.BOT_TOKEN}`);

bot.command("start", (ctx) => ctx.reply("Hello there!"));
bot.on("message", (ctx) => ctx.reply("Got another message!"));
```

很好！
我们现在完成了主要部分的代码。
但在我们进行部署之前，我们可以对我们的 bot 进行一点优化。
和刚才一样，这是可选的。

::: tip ⚡ 优化（可选）
每次你的服务器启动时，grammY 会向 Telegram 请求 [bot 的信息](https://core.telegram.org/bots/api#getme)，以便在 `ctx.me` 下的 [上下文对象](../guide/context.md) 提供 bot 的信息。
我们可以设置 [bot 的信息](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/BotConfig#botInfo) 以防止过多的 `getMe` 调用。

1. 在你最喜欢的浏览器中打开这个链接 `https://api.telegram.org/bot<bot_token>/getMe`，推荐使用 [Firefox](https://www.mozilla.org/en-US/firefox/)，因为它能格式化显示 `json` 数据。
2. 根据 `getMe` 的结果来修改我们上面第 4 行的代码：

```ts
export const bot = new Bot(`${process.env.BOT_TOKEN}`, {
  botInfo: {
    id: 111111111,
    is_bot: true,
    first_name: "xxxxxxxxx",
    username: "xxxxxxbot",
    can_join_groups: true,
    can_read_all_group_messages: false,
    supports_inline_queries: false,
  },
});
```

:::
酷！现在是时候准备我们的部署环境了！
可以直接跳到 [部署部分](#部署) ！:muscle:

## 长轮询

::: warning 在使用长轮询时，你的脚本会持续运行。
除非你知道如何处理这种行为，否则确保你有足够的 [dyno 时间](https://devcenter.heroku.com/articles/free-dyno-hours)。
:::

> 考虑使用 webhooks 吗？
> 跳转到 [webhooks 章节](#webhooks)。:rocket:

在你的服务器上使用长轮询并不总是一个坏主意。
有些时候它适用于不需要快速响应和处理大量数据的数据收集 bot。
你可以通过长轮询的方式来每个小时运行一次来获取消息。
这是你没办法用 webhook 控制的。
如果你的 bot 收到大量的消息，你会看到大量的 webhook 请求，但是如果你使用的是长轮询，你可以限制更新速度再处理它们。

### 创建 `bot.ts`

让我们打开我们之前创建的 `bot.ts` 文件。
添加如下几行代码：

```ts
import { Bot } from "grammy";

if (process.env.BOT_TOKEN == null) throw new Error("BOT_TOKEN is missing.");
const bot = new Bot(process.env.BOT_TOKEN);

bot.command(
  "start",
  (ctx) => ctx.reply("I'm running on Heroku using long polling!"),
);

bot.start();
```

就是这样！
我们已经准备好去部署它了。
看起来是不是非常简单？:smiley:
如果你觉得这太简单了，可以查看我们的 [部署清单](../advanced/deployment.md#长轮询)！:rocket:

## 部署

等一下...我们的 _Rocket Bot_ 还没有准备好发射。
请先完成下面这些步骤！

### 编译文件

在你的终端中运行这段命令，将 TypeScript 文件编译为 JavaScript 文件：

```bash
npx tsc
```

如果运行成功且没有任何报错，我们的编译文件应该在 `dist` 文件夹中，扩展名为 `.js`。

### 设置 `Procfile`

目前 `Heroku` 有好几种 [dynos 类型](https://devcenter.heroku.com/articles/free-dyno-hours)。
其中两个是：

- **Web dynos**:
  <br> _Web dynos_ 是接收来自路由器的 HTTP 流量的 "web" 进程。
  这种类型的 dyno 在执行代码时有 30 秒的超时限制。
  另外，如果在 30 分钟内没有需要处理的请求，它就会休眠。
  这种类型的 dyno 非常适合 _webhooks_。

- **Worker dynos**:
  <br> _Worker dynos_ 通常用于后台工作。
  它没有超时限制，而且如果它不处理任何请求，它也不会休眠。
  它适合 _长轮询_。

在项目根目录下创建没有扩展名的 `Procfile` 文件。
也就是说，`Procfile.txt` 和 `procfile` 是无效的。
然后以下面这个格式写入单行代码：

```
<dynos type>: <command for executing our main entry file>
```

对于我们的情况来说，应该是这样：

<CodeGroup>
<CodeGroupItem title="Webhook" active>

```
web: node dist/app.js
```

</CodeGroupItem>
<CodeGroupItem title="长轮询">

```
worker: node dist/bot.js
```

</CodeGroupItem>
</CodeGroup>

### 设置 Git

我们将使用 [Git 和 Heroku Cli](https://devcenter.heroku.com/articles/git) 来部署我们的 bot。
这里是安装的链接：

- [Git 安装说明](https://git-scm.com/download/)
- [Heroku CLI 安装说明](https://devcenter.heroku.com/articles/heroku-cli#download-and-install)

假设你已经在你的机器里安装了它们，并且你在项目的根目录下打开了一个终端。
现在在终端中运行这段代码来初始化本地 git 仓库：

```bash
git init
```

接下来，我们需要避免不必要的文件上传到我们的生产服务器（在这篇教程里生产服务器指的是 `Heroku`）。
在项目的根目录下创建一个名为 `.gitignore` 的文件。
然后添加下列内容：

```
node_modules/
src/
tsconfig.json
```

最终，我们的文件夹结构看起来应该是这样的：

<CodeGroup>
<CodeGroupItem title="Webhook" active>

```asciiart:no-line-numbers
.
├── .git/
├── node_modules/
├── dist/
│   ├── bot.js
│   └── app.js
├── src/
│   ├── bot.ts
│   └── app.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── Procfile
└── .gitignore
```

</CodeGroupItem>
  <CodeGroupItem title="长轮询">

```asciiart:no-line-numbers
.
├── .git/
├── node_modules/
├── dist/
│   └── bot.js
├── src/
│   └── bot.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── Procfile
└── .gitignore
```

</CodeGroupItem>
</CodeGroup>

将文件提交到我们的 git 仓库：

```bash
git add .
git commit -m "My first commit"
```

### 设置 Heroku Remote

如果你已经创建了 [Heroku 应用](https://dashboard.heroku.com/apps/)，在下面的 `<myApp>` 中传入你的 `已存在应用` 的名称，然后运行代码。
否则，请运行 `新应用`

<CodeGroup>
  <CodeGroupItem title="新应用" active>

```bash
heroku create
git remote -v
```

</CodeGroupItem>
  <CodeGroupItem title="已存在应用" active>

```bash
heroku git:remote -a <myApp>
```

</CodeGroupItem>
</CodeGroup>

### 部署代码

最后，按下 _红色按钮_，升空！:rocket:

```bash
git push heroku main
```

如果失败了，可能我们的 git 分支是 `master` 而不是 `main`。
请按下这个 _蓝色按钮_：

```bash
git push heroku master
```
