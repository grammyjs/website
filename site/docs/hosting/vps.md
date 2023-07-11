# Hosting: VPS

A virtual private server, mostly known as VPS, is a virtual machine running in the cloud with its users having the full control of its system.

## Server Rental

> You need to rent a VPS in order to follow this guide.
> This first section will explain how to do that.
> If you already have a VPS to work on, skip [down](#starting-the-bot).

We choose [Hostinger](https://hostinger.com) as our host.
There are several reasons for this:

1. It is multilingual, so you will find it convenient and easy to use.
2. It has a very rich documentation that thoroughly covers all the problem areas that a beginner may encounter.
3. It offers powerful servers at fairly low prices.

> You are free to choose the provider of your choice.
> All providers provide the same services, so you won't have any problems with the technical part of this article.
> You can take this part as an overview of how the server rental operation works.
> If you are a beginner, you can use this guide to rent your first ever server!

::: tip Analog of a server
If you cannot or do not want to rent a server but you still want to play around with running a bot on a VPS, you can follow this tutorial on a virtual machine instead.
To do this, use an application such as [VirtualBox](https://virtualbox.org).
Create a virtual machine with the desired Linux distribution and use it as a real server.
:::

Go to the [VPS tariff catalog](https://hostinger.com/vps-hosting).
We will use the "VPS 1" plan.
Below, you can see a comparison table that describes the offered server resources and limits.
The resources of VPS 1 are enough for bots with a small audience, and even more so for our test bot.

Go back to the "VPS 1" card and click the "Add" button.
You will be automatically redirected to the checkout page, where you will also immediately register with Hostinger.

::: warning Change the rental term!
The typical lease term is 2 years (a marketing ploy), and it costs a lot of money.
You probably don't need it, so you can start by renting a server for a month, which is much cheaper.

In any case, Hostinger provides a 30-day money-back guarantee.
:::

After payment, you will be able to set up your server:

1. **Location.**
   We recommend that you choose the location closest to Amsterdam.
   It is in Amsterdam that the Telegram server is located, which is responsible for ensuring the operation of bots.
   If you use your own Bot API server, choose the location closest to it.
2. **Server type.**
   Choose the option "Clean OS".
3. **Operating system.**
   We will use Ubuntu 22.04.
   If you choose a different system, some steps may be different, so be careful.
4. **Server name.**
5. **Root password.**
   Make a strong password and keep it in a safe place!
6. **SSH key**.
   Skip this step.
   We will set up SSH keys [later](#ssh-keys).

After the server is created, you can connect to it using SSH:

> SSH (_Secure Shell_) is a network protocol for remote control of a computer (server) and file transfer.

```sh
ssh root@<ip-address>
```

> Replace `<ip-address>` with the IP address of your server, which you can find on the server management page.

::: tip Configuring SSH
It can be difficult and tedious to remember which IP address and whose name you need to connect to a server.
To eliminate these routine steps and improve your server experience, you can configure SSH by creating a `~/.ssh/config` (<https://linuxhandbook.com/ssh-config-file>) file on your computer that stores all the data you need to connect to the server under certain arbitrary identifiers.
This is beyond the scope of this article, so you will need to configure it yourself.
:::

::: tip Separate User for Each Application
In this guide, all actions with the server will be performed as the root user.
This is done on purpose to simplify the material.
However, in reality, the root user should only be responsible for general services (web server, database, etc.), and applications should be run by individual non-root users.
This approach ensures the security of confidential data and prevents hacking of the entire system.
At the same time, it imposes some inconveniences.
Describing all these points unnecessarily increases the complexity of the article, which we try to avoid.
:::

## Starting the Bot

We now have a server at our disposal where we can run the bot to keep it running around the clock.

> To simplify the beginning of the article, we skipped the step of delivering the code to the server automatically each time after pushing your code, but it is described [below](#ci-cd).
>
> For now, you can copy local files to a remote server using the following command:
>
> ```sh
> scp <path-to-local-files> root@<ip-address>:<path-to-remote-directory>
> ```
>
> Replace `<path-to-local-files>` with the path to local files, `<ip-address>` with the IP address of your server, and `<path-to-remote-directory>` with the path to the directory where the bot's source code should be stored on the server.

:::tip Don't forget to install the runtime!
To run the bot, you need to install Node.js or Deno on the server, depending on the runtime in which the bot will run.
This is beyond the scope of this article, so you will need to do it yourself.
You probably already did this when [getting started](../guide/getting-started.md), so you should be familiar with the steps. :wink:
:::

Below are two ways you can keep your bot running smoothly: using [systemd](#systemd) or [PM2](#pm2).

### systemd

systemd is a powerful service manager which is pre-installed on many Linux distributions, mainly Debian-based ones.

#### Getting the Start Command

1. Get the full path of your runtime:

::: code-group

```sh [Deno]
which deno
```

```sh [Node.js]
which node
```

:::

2. You should have the full path of your entry file, too.

3. Your start command should look like the following:

```sh
<full_runtime_path> <options> <full_entry_file_path>

# Deno example:
# /home/user/.deno/bin/deno --allow-all /home/user/bot1/mod.ts

# Node.js example:
# /home/user/.nvm/versions/node/v16.9.1/bin/node /home/user/bot1/index.js
```

#### Creating the Service

1. Go to the services directory:

```sh
cd /etc/systemd/system
```

2. Open your new service file with an editor:

```sh
nano <app-name>.service
```

> Replace `<app-name>` with any identifier.

> `<app-name>.service` will be the name of your service.

3. Add the following content:

```text
[Unit]
After=network.target
                                  
[Service]
Environment=BOT_TOKEN=<token>
ExecStart=<start-command>
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

> Replace `<token>` with your bot's token, `<launch-command>` with the command you received [above](#getting-the-start-command), and `<username>` with the name of the user on whose behalf the app is being started.

A small explanation of the service configuration:

- `After=network.target` --- indicates that the application should be launched after the Internet module is loaded.
- `Environment=BOT_TOKEN=<token>` --- sets the environment variable.
  Add new `Environment` if you need multiple environment variables.
- `ExecStart=<start-command>` --- sets the startup command.
- `Restart=on-failure` --- indicates that the application should restart after a crash.
- `WantedBy=multi-user.target` --- defines the system state in which the service should be launched.
  `multi-user.target` --- is a typical value for servers that defines the state of the system when everything works except the graphical interface, which simply does not exist.

> For more information on the unit files, read [this](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/configuring_basic_system_settings/assembly_working-with-systemd-unit-files_configuring-basic-system-settings).

4. Reload systemd whenever you edit the service:

```sh
systemctl daemon-reload
```

#### Managing the Service

```sh
# Replace `<service-name>` with the file name of the service you created.

# To start the service
systemctl start <service-name>

# To view the service logs
systemctl status <service-name>

# To restart the service
systemctl restart <service-name>

# To stop the service
systemctl stop <service-name>

# To enable the service to start when the server boots
systemctl enable <service-name>

# To disable service startup when the server boots
systemctl disable <service-name>
```

### PM2

[PM2](https://pm2.keymetrics.io) is a daemon process manager for Node.js that will help you manage and keep your app online 24/7.

> PM2 is designed specifically to run applications written in Node.js.
> However, it can also be used to run applications written in other languages or for other frameworks.

#### Installing

::: code-group

```sh [NPM]
npm install -g pm2
```

```sh [Yarn]
yarn global add pm2
```

```sh [pnpm]
pnpm add -g pm2
```

:::

#### Creating an Application

PM2 offers two ways to create an application:

1. Use the command line interface.
2. Use the [configuration file](https://pm2.keymetrics.io/docs/usage/application-declaration).

The first method is convenient when getting to know PM2.
However, during deployment, you should use the second method, which is what we did in our case.

On our server, in the directory where the bot assembly is stored, there is a file `ecosystem.config.js` with the following contents:

```js
module.exports = {
  apps: [{
    name: "<app-name>",
    script: "<start-command>",
  }],
};
```

where `<app-name>` can be any identifier, and `<start command>` must be the actual command to start the bot, for example, `node bot.js` or `npm run start`, etc.

#### Managing the Application

Below are the commands you can use to control the application.

```sh
# If the `ecosystem.config.js` file is in the current directory,
# you can specify nothing to start the application.
# If the application is already running, this command will restart it.
pm2 start

# All of the following commands require you to specify the name of the application
# or the `ecosystem.config.js` file.
# To apply the action to all applications, specify `all`.

# To restart the app
pm2 restart <<app-name>>

# To reload the app
pm2 reload <<app-name>>

# To stop the app
pm2 stop <<app-name>>

# To delete an app
pm2 delete <<app-name>>
```

#### Saving the Application Operation

If the server reboots, your bot will not resume working.
For the bot to resume work, you need to prepare PM2 for this.

On the server in the terminal, run the following command:

```sh
pm2 startup
```

You will be provided with a command that you must execute to make PM2 automatically start after the server reboots.

Then run one more command:

```sh
pm2 save
```

This command will save the list of current applications so that they can be launched after a server reboot.

If you have created a new application and want to save it as well, simply run `pm2 save` again.

## Running the Bot on Webhooks

To run a bot on webhooks, you will need to use a web framework and **NOT** call `bot.start()`.

Here is a sample code to run the bot on webhooks that should be added to the main bot file:

::: code-group

```ts [Node.js]
import { webhookCallback } from "grammy";
import { fastify } from "fastify";

const server = fastify();

server.post(`/${bot.token}`, webhookCallback(bot, "fastify"));

server.listen();
```

```ts [Deno]
import { serve } from "https://deno.land/std/http/server.ts";
import { webhookCallback } from "https://deno.land/x/grammy/mod.ts";

const handleUpdate = webhookCallback(bot, "std/http");

serve(async (req) => {
  if (req.method === "POST") {
    const url = new URL(req.url);
    if (url.pathname.slice(1) === bot.token) {
      try {
        return await handleUpdate(req);
      } catch (err) {
        console.error(err);
      }
    }
  }
  return new Response();
});
```

:::

### Domain Rental

To connect a bot running on webhooks to the outside world, you need to purchase a domain.
We are going to explain this with Hostinger again, but there are many other services, too, and they all work similarly.

Go to the [domain name search page](https://www.hostinger.com/domain-name-search).
In the text input field, enter a domain name of the form `<name>.<zone>`.
For example, `example.com`.

If the desired domain is free, click the Add button next to it.
You will be automatically redirected to the checkout page, where you will also immediately register with Hostinger if you are not already registered.
Pay for the domain.

#### Domain Pointing to VPS

Before your domain can work with your VPS, you need to point the domain to your server.
To do this, in the [Hostinger Control Panel](https://hpanel.hostinger.com), click the "Manage" button next to your domain.
Next, go to the DNS record management page by clicking on the "DNS / Name Servers" button in the menu on the left.

> First, find out the IP address of your VPS.

In the list of DNS records, find the record of type `A` with the name `@`.
Edit this record by changing the IP address in the "Points to" field to the IP address of your VPS, and set the TTL to 3600.

Next, find and delete the record of type `CNAME` with the name `www`.
Instead, create a new record of type `A` with the name `www`, pointing to the IP address of your VPS, and set the TTL to 3600.

> If you run into problems, use the other method described in [knowledge base](https://support.hostinger.com/en/articles/1583227-how-to-point-domain-to-your-vps).

### Setting up a Web Server

For the website to work and the bot to start receiving updates from Telegram, you need to set up a web server.
We will use [Caddy](https://caddyserver.com).

Caddy is a powerful open source web server with automatic HTTPS.

::: tip Web Server
We use Caddy because, unlike mainstream web servers like Nginx or Apache, it automatically configures SSL certificates.
This makes the article much easier.
However, you are free to choose any web server you want.
:::

#### Installation

The following 5 commands will download and automatically start Caddy as a systemd service called `caddy`.

```sh
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install caddy
```

Check the status of Caddy:

```sh
systemctl status caddy
```

::: details Troubleshooting
Some hosting providers provide VPS with a pre-installed web server, for example, [Apache](https://httpd.apache.org).
Multiple web servers cannot run on the same machine at the same time.
For Caddy to work, you need to stop and shut down another web server:

```sh
systemctl stop apache2
systemctl disable apache2
```

:::

Now, if you open your server's IP address in a browser, you will see a typical page with instructions on how to set up Caddy.

#### Configuring

In order for Caddy to process requests coming to our domain, we need to change the Caddy configuration.

Run the following command to open the Caddy configuration file:

```sh
nano /etc/caddy/Caddyfile
```

You will see the following default configuration:

```text
# The Caddyfile is an easy way to configure your Caddy web server.
#
# Unless the file starts with a global options block, the first
# uncommented line is always the address of your site.
#
# To use your own domain name (with automatic HTTPS), first make
# sure your domain's A/AAAA DNS records are properly pointed to
# this machine's public IP, then replace ":80" below with your
# domain name.

:80 {
  # Set this path to your site's directory.
  root * /usr/share/caddy

  # Enable the static file server.
  file_server

  # Another common task is to set up a reverse proxy:
  # reverse_proxy localhost:8080

  # Or serve a PHP site through php-fpm:
  # php_fastcgi localhost:9000
}

# Refer to the Caddy docs for more information:
# https://caddyserver.com/docs/caddyfile
```

For the bot to work, make the configuration look like this:

```text
<domain> {
  root * /usr/share/caddy
  file_server
  reverse_proxy /<token> localhost:8000
}
```

> Replace `<domain>` with your domain and `<token>` with your bot token.

Reload Caddy every time as a site configuration file using the following command:

```sh
systemctl reload caddy
```

Now all requests to the address `https://<domain>/<token>` will be redirected to the address `http://localhost:8000/<token>`, where the bot's webhook is running.

#### Connecting a Webhook to Telegram

All you have to do is tell Telegram where to send the updates.
To do this, open your browser and visit the page at the following link:

```text
https://api.telegram.org/bot<token>/setWebhook?url=https://<domain>/<token>
```

> Replace `<token>` with your bot token and `<domain>` with your domain.

## CI/CD

[CI/CD](https://about.gitlab.com/topics/ci-cd) is an important part of the modern software development process.
This guide covers almost all of the [CI/CD pipeline](https://about.gitlab.com/topics/ci-cd/cicd-pipeline).

We will focus on writing scripts for GitHub and GitLab.
You can easily adapt the examples below to your CI/CD service of choice, such as Jenkins, Buddy, etc., if needed.

:::tip Self-hosted runner
GitHub and GitLab offer a certain amount of resources for free to complete your tasks.
However, when setting up your pipeline, you may quickly use them all up, which will require you to pay money for additional resources or the tasks will not run.
To prevent this from happening, we recommend installing a self-hosted runner on your computer so that tasks run on your computer.
This way, you'll get rid of the limits and be able to run pipelines of any complexity and capacity (almost).
:::

### SSH Keys

To deliver files to the server, you need to set up passwordless authentication, which is implemented using SSH keys.

The following commands should be run on your personal computer.

Change to the directory with the SSH keys:

```sh
cd ~/.ssh
```

Generate a new key pair:

::: code-group

```sh [GitHub]
ssh-keygen -t rsa -m PEM
```

```sh [GitLab]
ssh-keygen -t ed25519
```

:::

This command will generate a public and private key of the type and format you want for GitHub and GitLab.
You can also specify a custom key name if you wish.
Note that you should skip the fingerprint generation step (just press `Enter`).

Next, send the **public** key to the server:

```sh
ssh-copy-id -i <key-name>.pub root@<ip-address>
```

> Replace `<key-name>` with the name of the generated key and `<ip-address>` with the IP address of your server.

Note that the **public** key can be located on many servers, and the **private** key should be only with you and GitHub or GitLab.

You can now connect to the server without having to enter a password.

### Example Scripts

#### Node.js (GitHub)

```yml
name: Main

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v3
        with:
          node-version: 'latest'
      - run: npm ci
      - name: Build
        run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: source
          path: |
            dist/*.js
            package.json
            package-lock.json
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v3
        with:
          name: source
          path: dist/
      - name: Deploy
        uses: easingthemes/ssh-deploy@v4
        env:
          SOURCE: "dist package.json package-lock.json"
          ARGS: "--delete -az"
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: "<target-directory>"
          SCRIPT_AFTER: |
            cd <target-directory>
            npm i --omit=dev
            <start-command>
```

where `<target-directory>` is replaced with the name of the directory where the bot build is stored on the server, and `<start-command>` with the command to start your bot, which can be a call to `pm2` or `systemctl`, for example.

This script sequentially performs two tasks: `build` and `deploy`.
After `build` is executed, the artifact of this task, namely the `dist` directory containing the bot build, is passed to the `deploy` task.

Files are delivered to the server using the `rsync` utility, which is implemented by `easingthemes/ssh-deploy`.
After the files are delivered to the server, the command described in the `SCRIPT_AFTER` environment variable is executed.
In our case, after the files are delivered, we go to the bot directory, where we install all the dependencies except `devDependencies`, and restart the bot.

Note that you need to add three [secret environment variables](https://docs.github.com/en/actions/security-guides/encrypted-secrets):

1. `SSH_PRIVATE_KEY` - this is where the private SSH key you created in the [previous step](#ssh-keys) should be stored.
2. `REMOTE_HOST` - the IP address of your server should be stored here
3. `REMOTE_USER` - the name of the user on whose behalf the bot is launched should be stored here.

#### Node.js (GitLab)

```yml
image: node:latest

stages:
  - build
  - deploy

Build:
  stage: build
  before_script: npm ci
  script: npm run build
  artifacts:
    paths:
      - dist/

Deploy:
  stage: deploy
  before_script:
    - "command -v ssh-agent >/dev/null || ( apt-get update -y && apt-get install openssh-client -y )"
    - "command -v rsync >/dev/null || ( apt-get update -y && apt-get install rsync -y )"
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - ssh-keyscan "$REMOTE_HOST" >> ~/.ssh/known_hosts
    - chmod 644 ~/.ssh/known_hosts
  script:
    - rsync --delete -az dist package.json package-lock.json $REMOTE_USER@$REMOTE_HOST:<target-directory>
    - ssh $REMOTE_USER@$REMOTE_HOST "cd <target-directory> && npm i --omit=dev && <start-command>"
```

where `<target-directory>` is replaced with the name of the directory where the bot build is stored on the server, and `<start-command>` with the command to start your bot, which can be a call to `pm2` or `systemctl`, for example.

This script sequentially performs two tasks: `build` and `deploy`.
After `build` is executed, the artifact of this task, namely the `dist` directory containing the bot build, is passed to the `deploy` task.

The files are delivered to the server using the `rsync` utility, which we must install before executing the main script.
After the files are delivered, we connect to the server using SSH to run a command to install all dependencies except `devDependencies` and restart the application.

Note that you need to add three [environment variables](https://docs.gitlab.com/ee/ci/variables):

1. `SSH_PRIVATE_KEY` - this is where the private SSH key you created in the [previous step](#ssh-keys) should be stored.
2. `REMOTE_HOST` - the IP address of your server should be stored here
3. `REMOTE_USER` - the name of the user on whose behalf the bot is launched should be stored here.

#### Deno (GitHub)

```yml
name: Main

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - name: Deploy
        uses: easingthemes/ssh-deploy@v4
        env:
          SOURCE: "src deno.jsonc deno.lock"
          ARGS: "--delete -az"
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: "<target-directory>"
          SCRIPT_AFTER: |
            cd <target-directory>
            <start-command>
```

where `<target-directory>` is replaced with the name of the directory where the bot build is stored on the server, and `<start-command>` with the command to start your bot, which can be a call to `pm2` or `systemctl`, for example.

This script sends files to the server using the `rsync` utility, which is implemented by `easingthemes/ssh-deploy`.
After the files are delivered to the server, the command described in the `SCRIPT_AFTER` environment variable is executed.
In our case, after the files are delivered, we go to the bot's directory and restart the bot.

Note that you need to add three [secret environment variables](https://docs.github.com/en/actions/security-guides/encrypted-secrets):

1. `SSH_PRIVATE_KEY` - this is where the private SSH key you created in the [previous step](#ssh-keys) should be stored.
2. `REMOTE_HOST` - the IP address of your server should be stored here
3. `REMOTE_USER` - the name of the user on whose behalf the bot is launched should be stored here.

#### Deno (GitLab)

```yml
image: denoland/deno:latest

stages:
  - deploy

Deploy:
  stage: deploy
  before_script:
    - "command -v ssh-agent >/dev/null || ( apt-get update -y && apt-get install openssh-client -y )"
    - "command -v rsync >/dev/null || ( apt-get update -y && apt-get install rsync -y )"
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - ssh-keyscan "$REMOTE_HOST" >> ~/.ssh/known_hosts
    - chmod 644 ~/.ssh/known_hosts
  script:
    - rsync --delete -az src deno.jsonc deno.lock $REMOTE_USER@$REMOTE_HOST:<target-directory>
    - ssh $REMOTE_USER@$REMOTE_HOST "cd <target-directory> && npm i --omit=dev && <start-command>"
```

where `<target-directory>` is replaced with the name of the directory where the bot build is stored on the server, and `<start-command>` with the command to start your bot, which can be a call to `pm2` or `systemctl`, for example.

This script sends files to the server using the `rsync` utility, which is implemented by `easingthemes/ssh-deploy`.
After the files are delivered to the server, the command described in the `SCRIPT_AFTER` environment variable is executed.
In our case, after the files are delivered, we go to the bot's directory and restart the bot.

Note that you need to add three [environment variables](https://docs.gitlab.com/ee/ci/variables):

1. `SSH_PRIVATE_KEY` - this is where the private SSH key you created in the [previous step](#ssh-keys) should be stored.
2. `REMOTE_HOST` - the IP address of your server should be stored here
3. `REMOTE_USER` - the name of the user on whose behalf the bot is launched should be stored here.

You should now see how every code push to the `main` branch will automatically be deployed to your VPS.
Development go brrrrr :rocket:
