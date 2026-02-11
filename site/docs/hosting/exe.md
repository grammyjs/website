---
prev: false
next: false
---

# Hosting: exe.dev

[exe.dev](https://exe.dev) is a hosting platform that provides virtual machines with persistent disks, accessible over HTTPS.
It comes with [Shelley](https://exe.dev/docs/shelley/intro), a built-in AI coding agent that can set up and deploy your bot from a single prompt.

## Quick Start

1. Create a VM at [exe.dev](https://exe.dev).
2. Open Shelley at `https://<vm-name>.exe.xyz:9999/`.
3. Paste the prompt below and let Shelley do the rest.

## Shelley Prompt

You can use the following prompt for Shelley to set up a grammY bot on your VM automatically.
Adjust it to match your project (e.g. change the repo URL, runtime, or deployment type).

### Long Polling

````text
Clone my Telegram bot from <repo-url> into ~/bot.
Install Node.js via fnm, then run npm install in ~/bot.
Create a .env file at ~/bot/.env with BOT_TOKEN="<your-token>".
Create a systemd service at /etc/systemd/system/bot.service that:
  - sets WorkingDirectory to /home/exedev/bot
  - loads EnvironmentFile from /home/exedev/bot/.env
  - runs "node bot.js"
  - restarts on failure
Enable and start the service.
Verify the bot is running with systemctl status bot.
````

Replace `<repo-url>` with your repository URL and `<your-token>` with your bot token from [@BotFather](https://t.me/BotFather).

### Webhooks

exe.dev automatically proxies HTTPS traffic to your VM at `https://<vm-name>.exe.xyz/`.

````text
Clone my Telegram bot from <repo-url> into ~/bot.
Install Node.js via fnm, then run npm install in ~/bot.
Create a .env file at ~/bot/.env with BOT_TOKEN="<your-token>".
The bot uses webhooks with express on port 8000.
Create a systemd service at /etc/systemd/system/bot.service that:
  - sets WorkingDirectory to /home/exedev/bot
  - loads EnvironmentFile from /home/exedev/bot/.env
  - runs "node bot.js"
  - restarts on failure
Enable and start the service.
Run: ssh exe.dev share port <vm-name> 8000
Run: ssh exe.dev share set-public <vm-name>
Set the Telegram webhook by opening:
  https://api.telegram.org/bot<your-token>/setWebhook?url=https://<vm-name>.exe.xyz/<your-token>
Verify the bot is running with systemctl status bot.
````

Replace `<repo-url>`, `<your-token>`, and `<vm-name>` with your values.

::: tip Deno
If your bot uses Deno, adjust the prompt accordingly: ask Shelley to install Deno instead of Node.js, and change the start command (e.g. `deno run --allow-net --allow-env mod.ts`).
:::

## What Shelley Does

When you give Shelley the prompt above, it will:

1. Clone your bot's code onto the VM.
2. Install the runtime and dependencies.
3. Configure environment variables.
4. Create and start a systemd service to keep the bot running.
5. For webhooks: configure the exe.dev proxy and register the webhook URL with Telegram.

No manual SSH, no configuration files to write—just one prompt.

## Custom Domains

You can point your own domain to your exe.dev VM.
TLS certificates are issued automatically.

For a subdomain like `bot.example.com`, create a CNAME record:

```text
bot.example.com  CNAME  <vm-name>.exe.xyz
```

For more details, see the [exe.dev documentation](https://exe.dev/docs/all).
