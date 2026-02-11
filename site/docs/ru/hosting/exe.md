---
prev: false
next: false
---

# Hosting: exe.dev

[exe.dev](https://exe.dev) is a hosting platform that provides virtual machines with persistent disks, accessible over HTTPS.
It is designed for developers who want to run bots, web servers, or other applications without complex cloud configuration.

This tutorial will guide you through hosting your grammY bot on exe.dev.

## Prerequisites

1. Create an account at [exe.dev](https://exe.dev).
2. Make sure you have an SSH key set up for your account.

## Creating a VM

Create a new virtual machine using the exe.dev SSH API:

```sh
ssh exe.dev new my-bot
```

Connect to your VM:

```sh
ssh my-bot.exe.xyz
```

## Installing the Runtime

Install the runtime for your bot on the VM.

::: code-group

```sh [Node.js]
curl -fsSL https://fnm.vercel.app/install | bash
source ~/.bashrc
fnm install --lts
```

```sh [Deno]
curl -fsSL https://deno.land/install.sh | sh
```

:::

## Setting Up the Bot

Copy your bot project files to the VM.
From your local machine, run:

```sh
scp -r <path-to-project> my-bot.exe.xyz:~/bot
```

Replace `<path-to-project>` with the path to your project directory.

Then connect to the VM and install the dependencies:

::: code-group

```sh [Node.js]
ssh my-bot.exe.xyz
cd ~/bot
npm install
```

```sh [Deno]
ssh my-bot.exe.xyz
cd ~/bot
# Dependencies are fetched automatically on first run.
```

:::

## Setting the Bot Token

Store your bot token as an environment variable on the VM:

```sh
echo 'export BOT_TOKEN="your-token-here"' >> ~/.bashrc
source ~/.bashrc
```

Replace `your-token-here` with your actual bot token.

## Running the Bot

You can run your bot using either [long polling or webhooks](../guide/deployment-types).

### Long Polling

::: code-group

```sh [Node.js]
cd ~/bot
node bot.js
```

```sh [Deno]
cd ~/bot
deno run --allow-net --allow-env mod.ts
```

:::

To keep the bot running in the background, you can use [systemd](#running-with-systemd) or a process manager.

### Webhooks

exe.dev automatically proxies HTTPS traffic to your VM.
Your VM is accessible at `https://my-bot.exe.xyz/`.

Make sure your webhook server is listening on the correct port.
By default, exe.dev proxies to port 80 or the smallest exposed port >= 1024.
You can change the proxied port:

```sh
ssh exe.dev share port my-bot 8000
```

To make your webhook endpoint publicly accessible:

```sh
ssh exe.dev share set-public my-bot
```

Then set the webhook URL with Telegram:

```text
https://api.telegram.org/bot<token>/setWebhook?url=https://my-bot.exe.xyz/<token>
```

Replace `<token>` with your bot token.

Here is a sample webhook bot setup:

::: code-group

```ts [Node.js]
import express from "express";
import { webhookCallback } from "grammy";
import { bot } from "./bot.js";

const port = 8000;
const app = express();

app.use(express.json());
app.use(`/${bot.token}`, webhookCallback(bot, "express"));
app.use((_req, res) => res.status(200).send());

app.listen(port, () => console.log(`listening on port ${port}`));
```

```ts [Deno]
import { webhookCallback } from "https://deno.land/x/grammy/mod.ts";
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

:::

## Running with systemd

To keep the bot running and automatically restart it on failure, create a systemd service on the VM:

```sh
sudo nano /etc/systemd/system/bot.service
```

Add the following content:

::: code-group

```text [Node.js]
[Unit]
After=network.target

[Service]
WorkingDirectory=/home/exedev/bot
ExecStart=/home/exedev/.local/share/fnm/aliases/lts-latest/bin/node bot.js
EnvironmentFile=/home/exedev/bot/.env
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```text [Deno]
[Unit]
After=network.target

[Service]
WorkingDirectory=/home/exedev/bot
ExecStart=/home/exedev/.deno/bin/deno run --allow-net --allow-env mod.ts
EnvironmentFile=/home/exedev/bot/.env
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

:::

Create a `.env` file for the bot token:

```sh
echo 'BOT_TOKEN=your-token-here' > ~/bot/.env
```

Then enable and start the service:

```sh
sudo systemctl daemon-reload
sudo systemctl enable bot
sudo systemctl start bot
```

## Custom Domains

You can point your own domain to your exe.dev VM.
TLS certificates are issued automatically.

For a subdomain like `bot.example.com`, create a CNAME record:

```text
bot.example.com  CNAME  my-bot.exe.xyz
```

For more details, see the [exe.dev documentation](https://exe.dev/docs/all).
