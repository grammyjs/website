# Hosting: Fly

This guide tells you about the ways you can host your grammY bots on [Fly](https://fly.io), either using Deno or Node.js.

## Preparing Your Code

You can run your bot either on [webhooks or long polling](../guide/deployment-types.md).

### Webhooks

> Remember that you should not call `bot.start()` in your code when using webhooks.

1. Make sure that you have a file which exports your `Bot` object, so that you can import it later to run it.
2. Create a file named `app.ts` or `app.js`, or actually any name you like (but you should be remembering and using this as the main file to deploy), with the following content:

<CodeGroup>
<CodeGroupItem title="Deno" active>

```ts{11}
import { serve } from "https://deno.land/std/http/server.ts";
import { webhookCallback } from "https://deno.land/x/grammy/mod.ts";
// You might modify this to the correct way to import your `Bot` object.
import { bot } from "./bot.ts";

const port = 8000;
const handleUpdate = webhookCallback(bot, "std/http");

serve(async (req) => {
  const url = new URL(req.url);
  if (req.method === "POST" && url.pathname.slice(1) === bot.token) {
    try {
      return await handleUpdate(req);
    } catch (err) {
      console.error(err);
    }
  }
  return new Response();
}, { port });
```

</CodeGroupItem>
<CodeGroupItem title="Node.js" active>

```ts{10}
import express from "express";
import { webhookCallback } from "grammy";
// You might modify this to the correct way to import your `Bot` object.
import { bot } from "./bot";

const port = 8000;
const app = express();

app.use(express.json());
app.use(`/${bot.token}`, webhookCallback(bot, "express"));
app.use((_req, res) => res.status(200).send());

app.listen(port, () => console.log(`listening on port ${port}`));
```

</CodeGroupItem>
</CodeGroup>

We advise you to have your handler on some secret path rather than the root (`/`).
As shown in the highlighted line above, we are using the bot token (`/<bot token>`) as the secret path.

### Long Polling

Create a file named `app.ts` or `app.js`, or actually any name you like (but you should be remembering and using this as the main file to deploy), with the following content:

<CodeGroup>
<CodeGroupItem title="Deno" active>

```ts{4}
import { Bot } from "https://deno.land/x/grammy/mod.ts";

// Here, we take the bot token from "BOT_TOKEN" environment variable.
const bot = new Bot(Deno.env.get("BOT_TOKEN") ?? ""); 

bot.command(
  "start",
  (ctx) => ctx.reply("I'm running on Fly using long polling!"),
);

Deno.addSignalListener("SIGINT", () => bot.stop());
Deno.addSignalListener("SIGTERM", () => bot.stop());

bot.start();
```

</CodeGroupItem>
<CodeGroupItem title="Node.js">

```ts{4}
import { Bot } from "grammy";

// Here, we take the bot token from "BOT_TOKEN" environment variable.
const bot = new Bot(process.env.BOT_TOKEN ?? "");

bot.command(
  "start",
  (ctx) => ctx.reply("I'm running on Fly using long polling!"),
);

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

bot.start();
```

</CodeGroupItem>
</CodeGroup>

As you can see in the highlighted line above, we take some sensitive values (your bot token) from environment variables.
Fly allow us to store that secret by running this command:

```sh:no-line-numbers
flyctl secrets set BOT_TOKEN="AAAA:12345"
```

You can specify other secrets in the same way.
For more information about this _secrets_, see <https://fly.io/docs/reference/secrets/>.

## Deploying

### Method 1: With `flyctl`

This is the easiest method to go with.

1. Instal [flyctl](https://fly.io/docs/hands-on/install-flyctl) lalu [login](https://fly.io/docs/hands-on/sign-in/).
2. Run `flyctl launch` to generate a `Dockerfile` and `fly.toml` file for deployment.
   But **DO NOT** deploy.

<CodeGroup>
<CodeGroupItem title="Deno" Active>

```sh
flyctl launch
```

```log:no-line-numbers{10}
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

</CodeGroupItem>
<CodeGroupItem title="Node.js">

```sh
flyctl launch
```

```log:no-line-numbers{12}
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

</CodeGroupItem>
</CodeGroup>

3. **Deno**: Change the Deno version and remove `CMD` if exist within the `Dockerfile` file.
   For example, in this case, we update `DENO_VERSION` to `1.25.2`.

   **Node.js**: To change the Node.js version, you need to insert a `"node"` property inside an `"engines"` property inside `package.json`.
   For instance, we update the Node.js version to `16.14.0` in the example below.

<CodeGroup>
<CodeGroupItem title="Deno" Active>

```dockerfile{2,26}
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
# CMD is removed
```

</CodeGroupItem>
<CodeGroupItem title="Node.js" Active>

```json{19}
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

</CodeGroupItem>
</CodeGroup>

4. Edit `app` inside the `fly.toml` file.
   The path `./app.ts` (or `./app.js` for Node.js) in the example below refers to the main file directory.
   You might modify them to match with your project directory.
   If you are using webhooks, make sure the port is same with your [config](#webhooks) (`8000`).

<CodeGroup>
<CodeGroupItem title="Deno (Webhooks)" Active>

```toml{7,11,12}
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

</CodeGroupItem>
<CodeGroupItem title="Deno (Long polling)" Active>

```toml{7}
# fly.toml
app = "grammy"
kill_signal = "SIGINT"
kill_timeout = 5

[processes]
  app = "run --allow-net ./app.ts"

# Simply omitting the whole [[services]] section 
# since we are not listening to HTTP
```

</CodeGroupItem>
<CodeGroupItem title="Node.js (Webhooks)" Active>

```toml{7,11,18,19}
# fly.toml
app = "grammy"
kill_signal = "SIGINT"
kill_timeout = 5

[processes]
  app = "node ./build/app.js"

# Adjust the NODE_ENV environment to suppress the warning
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

</CodeGroupItem>
<CodeGroupItem title="Node.js (Long polling)" Active>

```toml{7,11,22,23}
# fly.toml
app = "grammy"
kill_signal = "SIGINT"
kill_timeout = 5

[processes]
  app = "node ./build/app.js"

# Adjust the NODE_ENV environment to suppress the warning
[build.args]
  NODE_ENV = "production"

[build]
  builder = "heroku/buildpacks:20"

# Simply omitting the whole [[services]] section 
# since we are not listening to HTTP
```

</CodeGroupItem>
</CodeGroup>

5. Run `flyctl deploy` to deploy your code.

### Method 2: With GitHub Actions

The main advantage of following method is that Fly will watch for changes in your repository which includes your bot code, and it will deploy new versions automatically.
Visit <https://fly.io/docs/app-guides/continuous-deployment-with-github-actions> for the detailed instructions.

1. Install [flyctl](https://fly.io/docs/hands-on/install-flyctl) and [sign in](https://fly.io/docs/hands-on/sign-in/).
2. Get a Fly API token by running `flyctl auth token`.
3. Create a repository on GitHub, it can be either private or public.
4. Go to Settings, choose Secrets and create a secret called `FLY_API_TOKEN` with the value of the token from step 2.
5. Create `.github/workflows/main.yml` with these contents:

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

6. Follow steps 2 until 4 from [Method 1](#method-1-with-flyctl) above.
   Remember to skip the last step (step 5) since we are not deploying the code directly.
7. Commit your changes and push them up to GitHub.
8. This is where the magic happens---the push will have triggered a deploy and from now on, whenever you push a change, the app will automatically be redeployed.

### Setting the Webhook URL

If you are using webhooks, after getting your app running, you should configure your bot's webhook settings to point to your app.
To do that, send a request to

```md:no-line-numbers
https://api.telegram.org/bot<token>/setWebhook?url=<url>
```

replacing `<token>` with your bot's token, and `<url>` with the full URL of your app along with the path to the webhook handler.

### Dockerfile Optimization

When our `Dockerfile` is run, it copies everything from the directory over to the Docker image.
For Node.js applications, some directories like `node_modules` are going to be rebuilt anyway so there's no need to copy them.
Create a `.dockerignore` file and add `node_modules` to it to do this.
You can also use the `.dockerignore` to skip unused project assets and any other files which aren't needed at runtime.

## Reference

- <https://fly.io/docs/languages-and-frameworks/deno/>
- <https://fly.io/docs/languages-and-frameworks/node/>
