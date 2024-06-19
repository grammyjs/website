---
prev: false
next: false
---

# 托管: Fly

本指南介绍了使用 Deno 或 Node.js 在 [Fly](https://fly.io) 上托管 grammY bot 的方法。

## 准备你的代码

你可以使用 [webhooks 或长轮询](../guide/deployment-types) 来运行你的 bot。

### Webhooks

> 请记住，使用 webhook 时不应在代码中调用 `bot.start()`。

1. 确保你有一个导出 `Bot` 对象的文件，以便你稍后可以导入它来运行。
2. 创建一个名为 `app.ts` 或 `app.js` 的文件，或者你喜欢的任何名字（但你应该记住并将其用作要部署的主文件），其中包含以下内容：

::: code-group

```ts{11} [Deno]
import { webhookCallback } from "https://deno.land/x/grammy/mod.ts";
// 你可以将其修改为导入 `Bot` 对象的正确方式
import { bot } from "./bot.ts";

const port = 8000;
const handleUpdate = webhookCallback(bot, "std/http");

Deno.serve({ port }, async (req) => {
  const url = new URL(req.url);
  if (req.method === "POST" && url.pathname.slice(1) === bot.token) {
    try {
      return await handleUpdate(req);
    } catch (err) {
      console.error(err);
    }
  }
  return new Response();
});
```

```ts{10} [Node.js]
import express from "express";
import { webhookCallback } from "grammy";
// 你可以将其修改为导入 `Bot` 对象的正确方式
import { bot } from "./bot";

const port = 8000;
const app = express();

app.use(express.json());
app.use(`/${bot.token}`, webhookCallback(bot, "express"));
app.use((_req, res) => res.status(200).send());

app.listen(port, () => console.log(`listening on port ${port}`));
```

:::

我们建议你将处理程序放在某个秘密路径上，而不是根目录 (`/`)。
如上面突出显示的行所示，我们使用bot token (`/<bot token>`) 作为秘密路径。

### 长轮询

创建一个名为 `app.ts` 或 `app.js` 的文件，或者你喜欢的任何名字（但你应该记住并将其用作要部署的主文件），其中包含以下内容：

::: code-group

```ts{4} [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN is unset");

const bot = new Bot(token); 

bot.command(
  "start",
  (ctx) => ctx.reply("I'm running on Fly using long polling!"),
);

Deno.addSignalListener("SIGINT", () => bot.stop());
Deno.addSignalListener("SIGTERM", () => bot.stop());

bot.start();
```

```ts{4} [Node.js]
import { Bot } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is unset");

const bot = new Bot(token);

bot.command(
  "start",
  (ctx) => ctx.reply("I'm running on Fly using long polling!"),
);

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

bot.start();
```

:::

正如你在上面突出显示的行中看到的那样，我们从环境变量中获取了一些敏感值（你的bot token）。
Fly 允许我们通过运行以下命令来存储该密钥：

```sh
flyctl secrets set BOT_TOKEN="AAAA:12345"
```

你可以以相同的方式指定其他机密。
有关此 _密钥_ 的更多信息，请参阅 <https://fly.io/docs/reference/secrets/>。

## 部署

### 方法 1: 通过 `flyctl`

这是最简单的方法。

1. 安装 [flyctl](https://fly.io/docs/hands-on/install-flyctl) 并 [登录](https://fly.io/docs/hands-on/sign-up-sign-in/).
2. 运行 `flyctl launch` 来为部署生成一个 `Dockerfile` 和 `fly.toml` 文件。
   但是**不要**部署。

   ::: code-group

   ```sh [Deno]
   flyctl launch
   ```

   ```log{10} [Log]
   Creating app in /my/telegram/bot
   Scanning source code
   Detected a Deno app
   ? App Name (leave blank to use an auto-generated name): grammy
   Automatically selected personal organization: CatDestroyer
   ? Select region: ams (Amsterdam, Netherlands)
   Created app grammy in organization personal
   Wrote config file fly.toml
   ? Would you like to set up a Postgresql database now? No
   ? Would you like to deploy now? No
   Your app is ready. Deploy with `flyctl deploy`
   ```

   :::

   ::: code-group

   ```sh [Node.js]
   flyctl launch
   ```

   ```log{12} [Log]
   Creating app in /my/telegram/bot
   Scanning source code
   Detected a NodeJS app
   Using the following build configuration:
    Builder: heroku/buildpacks:20
   ? App Name (leave blank to use an auto-generated name): grammy
   Automatically selected personal organization: CatDestroyer
   ? Select region: ams (Amsterdam, Netherlands)
   Created app grammy in organization personal
   Wrote config file fly.toml
   ? Would you like to set up a Postgresql database now? No
   ? Would you like to deploy now? No
   Your app is ready. Deploy with `flyctl deploy`
   ```

   :::

3. **Deno**：修改 Deno 版本并删除 `CMD`（如果 `Dockerfile` 文件中存在）。
   例如，在这种情况下，我们将 `DENO_VERSION` 更新为 `1.25.2`。

   **Node.js**：要修改 Node.js 版本，你需要在 `package.json` 中的 `"engines"` 属性中插入一个 `"node"` 属性。
   例如，我们在下面的示例中将 Node.js 版本更新为 `16.14.0`。

   ::: code-group

   ```dockerfile{2,26} [Deno]
   # Dockerfile
   ARG DENO_VERSION=1.25.2
   ARG BIN_IMAGE=denoland/deno:bin-${DENO_VERSION}
   FROM ${BIN_IMAGE} AS bin

   FROM frolvlad/alpine-glibc:alpine-3.13

   RUN apk --no-cache add ca-certificates

   RUN addgroup --gid 1000 deno \
   && adduser --uid 1000 --disabled-password deno --ingroup deno \
   && mkdir /deno-dir/ \
   && chown deno:deno /deno-dir/

   ENV DENO_DIR /deno-dir/
   ENV DENO_INSTALL_ROOT /usr/local

   ARG DENO_VERSION
   ENV DENO_VERSION=${DENO_VERSION}
   COPY --from=bin /deno /bin/deno

   WORKDIR /deno-dir
   COPY . .

   ENTRYPOINT ["/bin/deno"]
   # CMD 被删掉了
   ```

   ```json [Node.js]{19}
   // package.json
   {
     "name": "grammy",
     "version": "1.0.0",
     "description": "grammy",
     "main": "app.js",
     "author": "itsmeMario",
     "license": "MIT",
     "dependencies": {
       "express": "^4.18.1",
       "grammy": "^1.11.0"
     },
     "devDependencies": {
       "@types/express": "^4.17.14",
       "@types/node": "^18.7.18",
       "typescript": "^4.8.3"
     },
     "engines": {
       "node": "16.14.0"
     }
   }
   ```

   :::

4. 编辑 `fly.toml` 文件中的 `app`。
   下面示例中的路径 `./app.ts`（或 Node.js 的 `./app.js`）指的是主文件目录。
   你可以修改它们以匹配你的项目目录。
   如果你使用的是 webhook，请确保端口与你的 [配置](#webhooks) (`8000`) 中的端口相同。

   ::: code-group

   ```toml [Deno (Webhooks)]{7,11,12}
   # fly.toml
   app = "grammy"
   kill_signal = "SIGINT"
   kill_timeout = 5

   [processes]
   app = "run --allow-net ./app.ts"

   [[services]]
   http_checks = []
   internal_port = 8000
   processes = ["app"]
   protocol = "tcp"
   script_checks = []
   [services.concurrency]
     hard_limit = 25
     soft_limit = 20
     type = "connections"

   [[services.ports]]
     force_https = true
     handlers = ["http"]
     port = 80

   [[services.ports]]
     handlers = ["tls", "http"]
     port = 443

   [[services.tcp_checks]]
     grace_period = "1s"
     interval = "15s"
     restart_limit = 0
     timeout = "2s"
   ```

   ```toml [Deno (Long Polling)]{7}
   # fly.toml
   app = "grammy"
   kill_signal = "SIGINT"
   kill_timeout = 5

   [processes]
   app = "run --allow-net ./app.ts"

   # 直接忽略整个 [[services]] 部分
   # 因为我们不监听 HTTP
   ```

   ```toml [Node.js (Webhooks)]{7,11,18,19}
   # fly.toml
   app = "grammy"
   kill_signal = "SIGINT"
   kill_timeout = 5

   [processes]
   app = "node ./build/app.js"

   # 调整 NODE_ENV 环境变量以抑制警告
   [build.args]
   NODE_ENV = "production"

   [build]
   builder = "heroku/buildpacks:20"

   [[services]]
   http_checks = []
   internal_port = 8000
   processes = ["app"]
   protocol = "tcp"
   script_checks = []
   [services.concurrency]
     hard_limit = 25
     soft_limit = 20
     type = "connections"

   [[services.ports]]
     force_https = true
     handlers = ["http"]
     port = 80

   [[services.ports]]
     handlers = ["tls", "http"]
     port = 443

   [[services.tcp_checks]]
     grace_period = "1s"
     interval = "15s"
     restart_limit = 0
     timeout = "2s"
   ```

   ```toml [Node.js (Long polling)]{7,11,22,23}
   # fly.toml
   app = "grammy"
   kill_signal = "SIGINT"
   kill_timeout = 5

   [processes]
   app = "node ./build/app.js"

   # 调整 NODE_ENV 环境变量以抑制警告
   [build.args]
   NODE_ENV = "production"

   [build]
   builder = "heroku/buildpacks:20"

   # 直接忽略整个 [[services]] 部分
   # 因为我们不监听 HTTP
   ```

   :::

5. 运行 `flyctl deploy` 来部署你的代码。

### 方法 2: 通过 GitHub Actions

以下方法的主要优点是 Fly 将监视包含你的 bot 代码的仓库中的更改，并且它将自动部署新版本。
访问 <https://fly.io/docs/app-guides/continuous-deployment-with-github-actions> 获取更多详细说明。

1. 安装 [flyctl](https://fly.io/docs/hands-on/install-flyctl) 并 [登录](https://fly.io/docs/hands-on/sign-up-sign-in/).
2. 通过运行 `flyctl auth token` 获取 Fly API token .
3. 在 GitHub 上创建一个仓库，它可以是私有的也可以是公共的。
4. 跳转到设置，选择 Secrets 并使用第 2 步中的 token 创建一个名为 `FLY_API_TOKEN` 的密钥。
5. 使用以下内容创建 `.github/workflows/main.yml`：

   ```yml
   name: Fly Deploy
   on: [push]
   env:
   FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
   jobs:
   deploy:
     name: Deploy app
     runs-on: ubuntu-latest
     steps:
     - uses: actions/checkout@v2
     - uses: superfly/flyctl-actions/setup-flyctl@master
     - run: flyctl deploy --remote-only
   ```

6. 按照上述 [方法 1](#方法-1-通过-flyctl) 中的步骤 2 至 4 进行操作。
   请记住跳过最后一步（第 5 步），因为我们没有直接部署代码。
7. 提交你的更改并将它们推送到 GitHub。
8. 见证奇迹的时刻————推送将触发部署，从现在开始，无论何时推送更改，应用程序都会自动重新部署。

### 设置 Webhook URL

如果你使用的是 webhook，在你的应用运行后，你应该配置 bot 的 webhook 设置以指向你的应用。
为此，请发送请求至

```text
https://api.telegram.org/bot<token>/setWebhook?url=<url>
```

将 `<token>` 替换为你的 bot token，将 `<url>` 替换为你的应用程序的完整 URL 以及 webhook 处理程序的路径。

### Dockerfile 优化

当我们的 `Dockerfile` 运行时，它会将目录中的所有内容复制到 Docker 映像中。
对于 Node.js 应用程序，无论如何都会重建一些目录，例如 `node_modules`，因此无需复制它们。
创建一个 `.dockerignore` 文件并向其中添加 `node_modules` 以执行此操作。
你还可以使用 `.dockerignore` 来不复制运行时不需要的任何其他文件。

## 参考

- <https://fly.io/docs/js/frameworks/deno/>
- <https://fly.io/docs/js/>
