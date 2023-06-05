# Hosting: VPS

A virtual private server, mostly known as VPS, is a virtual machine running in the cloud with its users having the full control of its system.

## Preparing Your Code

To get started, you can use the bot shown in the [example of using a session](../plugins/session.md#example-usage).

In the following, we will assume that the bot runs on Node.js.
Why only Node.js and not Deno or is it better for both runtimes?
The answer is simple: the Deno pipeline would be very simple.
A Node.js pipeline is complicated by the additional task of building and setting up communication between the two tasks.
So a CI/CD pipeline for Node.js would be a better example.

## Server Rental

We chose [Hostinger](https://hostinger.com/) as our host.
There are several reasons for this:

1. It is multilingual, so you will find it convenient and easy to use.
2. It has a very rich documentation that thoroughly covers all the problem areas that a beginner may encounter.
3. It offers powerful servers at fairly low prices.

:::tip Analog of a server
If you cannot or do not want to rent a server, you can replace it with a virtual machine.
To do this, use an application such as [VirtualBox](https://virtualbox.org/).
Create a virtual machine with the desired Linux distribution and use it as a real server.
:::

Go to the [VPS tariff catalog](https://hostinger.com/vps-hosting/).
We will use the "VPS 1" plan.
Below you can see a comparison table that describes the offered server resources and limits.
The resources of VPS 1 are enough for bots with a small audience, and even more so for our test bot.

Go back to the "VPS 1" card and click the "Add" button.
You will be automatically redirected to the checkout page, where you will also immediately register with Hostinger.

:::warning Change the rental term!
The typical lease term is 2 years (a marketing ploy), and it costs a lot of money.
You probably don't need it, so you can start by renting a server for a month, which is much cheaper.

In any case, Hostinger provides a 30-day money-back guarantee.
:::

After payment you will be able to set up your server:

1. **Location.**
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

After the server is created, you can connect to it using SSH:

> SSH (_Secure Shell_) is a network protocol for remote control of a computer (server) and file transfer.

```sh:no-line-numbers
ssh root@<ip-address>
```

replacing `<ip-address>` with the IP address of your server, which you can find on the server management page.

## Starting the Bot

We now have a server at our disposal where we can run the bot to keep it running around the clock.

> To simplify the beginning of the article, we skipped the step of delivering the code to the server, but it is described [below](#ci-cd).

:::tip Don't forget to install the runtime!
To run the bot, you need to install Node.js or Deno on the server, depending on the runtime in which the bot will run.
This is beyond the scope of this article, so you will need to do it yourself. :wink:
:::

Below are two ways you can keep your bot running smoothly.

### systemd

systemd is a powerful service manager which is pre-installed on many Linux distributions, mainly Debian-based ones.

### Getting the Start Command

1. Get the full path of your runtime:

```sh
# If using Deno
which deno

# If using Node.js
which node
```

2. You should have the full path of your entry file, too.

3. Your start command should look like the following:

```sh
<full_runtime_path> <options> <full_entry_file_path>

# Deno example:
# /home/user/.deno/bin/deno --allow-all /home/user/bot1/mod.ts

# Node.js example:
# /home/user/.nvm/versions/node/v16.9.1/bin/node /home/user/bot1/index.js
```

### Creating the Service

1. Go to the services directory:

```sh
cd /etc/systemd/system
```

2. Open your new service file with an editor:

```sh
nano <app-name>.service
```

replacing `<app-name>` with any identifier.

> `<app-name>.service` will be the name of your service.

3. Add the following content:

```text
[Unit]
After=network.target

[Service]
Environment=BOT_TOKEN=<token>
Type=simple
User=<username>
ExecStart=<start-command>
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

replacing `<token>` with your bot's token, `<launch-command>` with the command you received [above](#getting-the-start-command), and `<username>` with the name of the user on whose behalf the app is being started.

> For more information on the unit files, read [this](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/configuring_basic_system_settings/assembly_working-with-systemd-unit-files_configuring-basic-system-settings).

4. Reload systemd whenever you edit the service:

```sh:no-line-numbers
systemctl daemon-reload
```

### Managing the Service

```sh:no-line-numbers
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

[PM2](https://pm2.keymetrics.io/) is a daemon process manager for Node.js that will help you manage and keep your app online 24/7.

> PM2 is designed specifically to run applications written in Node.js.
> However, it can also be used to run applications written in other languages or for other frameworks.

### Installing

```sh
npm install pm2@latest -g

# If using Yarn
yarn global add pm2
```

#### Creating an Application

PM2 offers two ways to create an application:

1. Use the command line interface.
2. Use the [configuration file](https://pm2.keymetrics.io/docs/usage/application-declaration/).

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

```sh:no-line-numbers
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

```sh:no-line-numbers
pm2 startup
```

You will be provided with a command that you must execute to make PM2 automatically start after the server reboots.

Then run one more command:

```sh:no-line-numbers
pm2 save
```

This command will save the list of current applications so that they can be launched after a server reboot.

If you have created a new application and want to save it as well, simply run `pm2 save` again.

## Running the Bot on Webhooks

To run a bot on webhooks, you will need to use a web framework and not call `bot.start()`.

Here's a sample code to start the bot using `fastify`, which you should add to the bot's main file:

```ts
import { webhookCallback } from "grammy";
import { fastify } from "fastify";

const server = fastify();

server.post(`/${bot.token}`, webhookCallback(bot, "fastify"));

server.listen();
```

### Domain Rental

To connect a bot running on webhooks to the outside world, you need to purchase a domain.

Go to the [domain name search page](https://www.hostinger.com/domain-name-search).
In the text input field, enter a domain name of the form `<name>.<zone>`.
For example, `example.com`.

If the desired domain is free, click the Add button next to it.
You will be automatically redirected to the checkout page, where you will also immediately register with Hostinger if you are not already registered.
Pay for the domain.

#### Domain Pointing to VPS

Before your domain can work with your VPS, you need to point the domain to your server.
To do this, in the [Hostinger Control Panel](https://hpanel.hostinger.com/), click the "Manage" button next to your domain.
Next, go to the DNS record management page by clicking on the "DNS / Name Servers" button in the menu on the left.

> First, find out the IP address of your VPS.

In the list of DNS records, find the record of type `A` with the name `@`.
Edit this record by changing the IP address in the "Points to" field to the IP address of your VPS, and set the TTL to 3600.

Next, find and delete the record of type `CNAME` with the name `www`.
Instead, create a new record of type `A` with the name `www`, pointing to the IP address of your VPS, and set the TTL to 3600.

> In the event of a difficulty, use the other method described in [knowledge base](https://support.hostinger.com/en/articles/1583227-how-to-point-domain-to-your-vps).

### Setting up a Web Server

For the website to work and the bot to start receiving updates from Telegram, you need to set up a web server.
We will use [Caddy](https://caddyserver.com/).

Caddy is a powerful open source web server with automatic HTTPS.
It is written in Go, so it is very fast. :zap:

#### Installation

The following 5 commands will download and automatically start Caddy as a systemd service called `caddy`.

```sh:no-line-numbers
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install caddy
```

Check the status of Caddy:

```sh:no-line-numbers
systemctl status caddy
```

:::details Troubleshooting
Some hosting providers provide VPS with a pre-installed web server, for example, [Apache](https://httpd.apache.org/).
Multiple web servers cannot run on the same machine at the same time.
For Caddy to work, you need to stop and shut down another web server:

```sh:no-line-numbers
systemctl stop apache2
systemctl disable apache2
```

:::

Now, if you open your server's IP address in a browser, you will see a typical page with instructions on how to set up Caddy.

#### Configuring

In order for Caddy to process requests coming to our domain, we need to change the Caddy configuration.

Run the following command to open the Caddy configuration file:

```sh:no-line-numbers
nano /etc/caddy/Caddyfile
```

You will see the following default configuration:

```text:no-line-numbers
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

```text:no-line-numbers
<domain> {
  root * /usr/share/caddy
  file_server
  reverse_proxy /<token> localhost:8000
}
```

replacing `<domain>` with your domain and `<token>` with your bot token.

Reload Caddy every time as a site configuration file using the following command:

```sh:no-line-numbers
systemctl reload caddy
```

Now all requests to the address `https://<domain>/<token>` will be redirected to the address `http://localhost:8000/<token>`, where the bot's webhook is running.

#### Connecting a Webhook to Telegram

All you have to do is tell Telegram where to send the updates.
To do this, open your browser and visit the page at the following link:

```text:no-line-numbers
https://api.telegram.org/bot<token>/setWebhook?url=https://<domain>/<token>
```

replacing `<token>` with your bot token and `<domain>` with your domain.

## CI/CD

[CI/CD](https://about.gitlab.com/topics/ci-cd/) is an important part of the modern software development process.
This guide covers almost all of the [CI/CD pipeline](https://about.gitlab.com/topics/ci-cd/cicd-pipeline/).

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

```sh:no-line-numbers
cd ~/.ssh
```

Generate a new key pair:

<CodeGroup>
  <CodeGroupItem title="GitHub" active>

```sh:no-line-numbers
ssh-keygen -t rsa -m PEM
```

</CodeGroupItem>
  <CodeGroupItem title="GitLab">

```sh:no-line-numbers
ssh-keygen -t ed25519
```

</CodeGroupItem>
</CodeGroup>

This command will generate a public and private key of the type and format you want for GitHub and GitLab.
You can also specify a custom key name if you wish.
Note that you should skip the fingerprint generation step (just press `Enter`).

Next, send the **public** key to the server:

```sh:no-line-numbers
ssh-copy-id -i <key-name>.pub root@<ip-address>
```

replacing `<key-name>` with the name of the generated key and `<ip-address>` with the IP address of your server.

Note that the **public** key can be located on many servers, and the **private** key should be only with you and GitHub or GitLab.

You can now connect to the server without having to enter a password.

### Example Script

<CodeGroup>
  <CodeGroupItem title="GitHub" active>

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
      - uses: actions/setup-node@v3
        with:
          node-version: 'latest'
      - run: npm ci
      - name: Build
        run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/*.js
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/download-artifact@v3
        with:
          name: dist
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

Note that you need to add three [secret environment variables](https://docs.github.com/en/actions/security-guides/encrypted-secrets/):

1. `SSH_PRIVATE_KEY` - this is where the private SSH key you created in the [previous step](#ssh-keys) should be stored.
2. `REMOTE_HOST` - the IP address of your server should be stored here
3. `REMOTE_USER` - the name of the user on whose behalf the bot is launched should be stored here.

</CodeGroupItem>
  <CodeGroupItem title="GitLab">

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
    - rsync --delete -az dist package.json package-lock.json $REMOTE_USER@$REMOTE_HOST:<цільовий-каталог>
    - ssh $REMOTE_USER@$REMOTE_HOST "cd <цільовий-каталог> && npm i --omit=dev && <команда-запуску>"
```

where `<target-directory>` is replaced with the name of the directory where the bot build is stored on the server, and `<start-command>` with the command to start your bot, which can be a call to `pm2` or `systemctl`, for example.

This script sequentially performs two tasks: `build` and `deploy`.
After `build` is executed, the artifact of this task, namely the `dist` directory containing the bot build, is passed to the `deploy` task.

The files are delivered to the server using the `rsync` utility, which we must install before executing the main script.
After the files are delivered, we connect to the server using SSH to run a command to install all dependencies except `devDependencies` and restart the application.

Note that you need to add three [environment variables](https://docs.gitlab.com/ee/ci/variables/):

1. `SSH_PRIVATE_KEY` - this is where the private SSH key you created in the [previous step](#ssh-keys) should be stored.
2. `REMOTE_HOST` - the IP address of your server should be stored here
3. `REMOTE_USER` - the name of the user on whose behalf the bot is launched should be stored here.

</CodeGroupItem>
</CodeGroup>
