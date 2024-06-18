---
prev: false
next: false
---

<!-- markdownlint-disable no-duplicate-heading -->

# 托管: VPS

虚拟专用服务器（通常称为 VPS）是在云端运行的虚拟机，你（开发人员）可以完全控制其系统。

## 服务器租赁

> 要遵循本指南，你首先需要租用一台 VPS。
> 本节将介绍如何做到这一点。
> 如果你已经有了一台可用的 VPS，请跳至 [下一节](#启动-bot)。

在本指南中，我们将使用 [Hostinger](https://hostinger.com) 的服务。

> 你可以自由选择服务提供商。
> 所有提供商都提供相同的服务，因此你在本文的技术部分不会遇到任何问题。
> 你可以将这一部分视为服务器租用操作的概述。
> 如果你是初学者，可以使用本指南租用你的第一台服务器！

::: tip 模拟一台服务器
如果你不能或不想租用服务器，但又想在 VPS 上运行一个 bot，那么你可以在虚拟机上学习本教程。
为此，请使用 [VirtualBox](https://virtualbox.org) 等应用程序
使用所需的 Linux 发行版创建虚拟机，以模拟 Linux 服务器。
:::

进入 [VPS 托管页面](https://hostinger.com/vps-hosting)。
我们将使用 “KVM 1” 方案。
“KVM 1” 的资源对于拥有大量受众的 bot 来说已经足够了，对于我们的测试 bot 来说更是如此。

点击 “Add to cart” 按钮。
你将被自动跳转到结账页面，在那里你也可以立即注册 Hostinger。

::: warning 更改租期！
一般的租期为 1-2 年（一种营销手段），而且费用不菲。
你可能并不需要它，所以你可以先租用一个月的服务器，这样会便宜很多。

无论如何，Hostinger 提供 30 天退款保证。
:::

付款后，你就可以设置服务器了：

1. **位置。**
   我们建议你 [选择离阿姆斯特丹最近的地点](../guide/api#选择数据中心位置)。
   Bot API 主服务器位于阿姆斯特丹。
   如果你使用 [你自己的 Bot API 服务器](../guide/api#运行一个本地-bot-api-服务器)，则请选择离它最近的位置。
2. **服务器类型。**
   选择 “Clean OS” 选项。
3. **操作系统。**
   我们将使用 Ubuntu 22.04。
   如果你选择了不同的系统，某些步骤可能会有所不同，所以请务必小心。
4. **服务器名称。**
   随便取个名字吧。
5. **root 密码。**
   设置一个强大的密码，并将其保存在安全的地方！
6. **SSH 密钥。**
   跳过这一步。
   我们将在 [稍后](#ssh-密钥) 设置 SSH 密钥。

创建服务器后，你可以使用 SSH 连接到服务器：

> SSH (_Secure Shell_) 是一种可用于远程控制计算机的网络协议。

```sh
ssh root@<ip-address>
```

将 `<ip-address>` 替换为你的服务器的 IP 地址，你可以在服务器管理页面找到该地址。

::: tip 配置 SSH
要记住连接服务器所需的 IP 地址和名称可能既困难又乏味。
为了省去这些例行步骤并改善你的服务器体验，你可以在计算机上创建一个 `~/.ssh/config` (<https://linuxhandbook.com/ssh-config-file>) 文件来配置 SSH，该文件以某些任意标识符存储连接服务器所需的所有数据。
这超出了本文的讨论范围，因此你需要自行配置。
:::

::: tip 为每个应用程序设置单独的用户
在本指南中，所有与服务器有关的操作都将以 root 用户身份执行。
这样做的目的是为了简化本指南。
然而，在现实中，root 用户应只负责一般服务（网络服务器、数据库等），应用程序应由单独的非 root 用户运行。
这种方法可确保机密数据的安全，防止整个系统被黑客攻击。
同时，这也带来了一些不便。
不必要地描述所有这些要点会增加文章的复杂性，我们尽量避免这样做。
:::

## 启动 Bot

现在，我们有了一台由我们自己支配的服务器，可以全天候运行 bot。

为了简化文章的开头部分，我们跳过了每次推送代码后自动将代码传送到服务器的步骤，但 [下文](#ci-cd) 将对此进行描述。

现在，你可以使用以下命令将本地文件复制到远程服务器。
请注意，`-r` 会递归复制，因此只需指定项目的根目录即可。

```sh
scp -r <path-to-local-project-root> root@<ip-address>:<path-to-remote-directory>
```

将 `<path-to-local-project-root>` 替换为本地磁盘上项目目录的路径，将 `<ip-address>` 替换为你的服务器的 IP 地址，将 `<path-to-remote-directory>` 替换为服务器上存放 bot 源代码的目录路径。

如上所述，你现在应该可以通过启动 SSH 会话在 VPS 上打开远程终端了。

```sh
ssh root@<ip-address>
```

注意命令提示符的变化。
这表明你已连接到远程计算机。
你输入的每一条命令都将在你的 VPS 上运行。
尝试运行 `ls` 确认你是否已成功复制了你的源文件。

本页面的剩余部分将假定你能够连接到你的 VPS。
以下所有命令都需要在 SSH 会话中运行。

:::tip 不要忘记安装运行时！
要运行 bot，你需要在服务器上安装 Node.js 或 Deno，具体取决于 bot 运行的运行时。
这超出了本文的讨论范围，因此你需要自行解决。
你可能在 [开始](../guide/getting-started) 时已经做过这个操作，所以你应该已经熟悉了这些步骤。:wink:
:::

以下两种方法可以保证 bot 顺利运行：使用 [systemd](#systemd) 或 [PM2](#pm2)。

### systemd

systemd 是一个功能强大的服务管理器，已预装在许多 Linux 发行版上，主要是 Ubuntu 等基于 Debian 的发行版。

#### 获取启动命令

1. 获取运行时的绝对路径：

   ::: code-group

   ```sh [Deno]
   which deno
   ```

   ```sh [Node.js]
   which node
   ```

   :::

2. 你还应该有你的 bot 的目录的绝对路径。

3. 你的启动命令应该看起来像下面这样：

   ```sh
   <runtime_path> <options> <entry_file_relative_path>

   # bot 目录的路径：/home/user/bot1/

   # Deno 示例:
   # /home/user/.deno/bin/deno --allow-all run mod.ts

   # Node.js 示例:
   # /home/user/.nvm/versions/node/v16.9.1/bin/node index.js
   ```

#### 创建服务

1. 进入服务目录：

   ```sh
   cd /etc/systemd/system
   ```

2. 用编辑器打开新的服务文件：

   ```sh
   nano <app-name>.service
   ```

   > 将 `<app-name>` 替换为任何标识符。
   > `<app-name>.service` 将是你的服务的名称。

3. 添加以下内容：

   ```text
   [Unit]
   After=network.target

   [Service]
   WorkingDirectory=<bot-directory-path>
   ExecStart=<start-command>
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   ```

   将 `<bot-directory-path>` 替换为你的 bot 目录的绝对路径，将 `<start-command>` 替换为 [上文](#获取启动命令) 获取到的命令。

   以下是服务配置的简要说明：

   - `After=network.target` --- 表示应用程序应在网络模块加载后启动。
   - `WorkingDirectory=<bot-directory-path>` --- 设置进程的工作目录。
     这允许你使用相关资产，例如包含了所有必要的环境变量的 `.env` 文件。
   - `ExecStart=<start-command>` --- 设置启动命令。
   - `Restart=on-failure` --- 表示应用程序应在崩溃后重新启动。
   - `WantedBy=multi-user.target` --- 定义了服务启动时的系统状态。
     `multi-user.target` --- 是服务器的典型值。

   > 有关单元文件的更多信息，请阅读 [这里](https://access.redhat.com/documentation/te-in/red_hat_enterprise_linux/9/html/using_systemd_unit_files_to_customize_and_optimize_your_system/assembly_working-with-systemd-unit-files_working-with-systemd)。

4. 每次编辑服务时，都要重新加载 systemd：

   ```sh
   systemctl daemon-reload
   ```

#### 管理服务

```sh
# 将 `<service-name>` 替换为你创建的服务的文件名。

# 启动服务
systemctl start <service-name>

# 查看服务日志
journalctl -u <service-name>

# 重启服务
systemctl restart <service-name>

# 停止服务
systemctl stop <service-name>

# 使该服务能够在服务器启动时自动启动
systemctl enable <service-name>

# 使该服务能够在服务器启动时不自动启动
systemctl disable <service-name>
```

启动服务就会启动你的 bot！

### PM2

[PM2](https://pm2.keymetrics.io) 是一款适用于 Node.js 的守护进程管理器，可帮助你管理并保持应用程序全天候在线。

PM2 是专为管理用 Node.js 编写的应用程序而设计的。
不过，它也可用于管理用其他语言编写的或其他运行时的应用程序。

#### 安装

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

#### 创建应用程序

PM2 提供两种创建应用程序的方法：

1. 使用命令行界面。
2. 使用 [配置文件](https://pm2.keymetrics.io/docs/usage/application-declaration).

如果熟悉 PM2，则第一种方法更方便。
不过，在部署过程中，你应该使用第二种方法，就是我们在本例中所做的那样。

在服务器上存储 bot 构建的目录中创建一个 `ecosystem.config.js` 文件，其中包含以下内容：

```js
module.exports = {
  apps: [{
    name: "<app-name>",
    script: "<start-command>",
  }],
};
```

将 `<app-name>` 替换为任意标识符，将 `<start-command>` 替换为启动 bot 的命令。

#### 管理应用程序

以下是可用于控制应用程序的命令。

```sh
# 如果 `ecosystem.config.js` 文件在当前目录，
# 你可以不指定任何内容来启动应用程序。
# 如果应用程序已在运行，该命令将重新启动它。
pm2 start

# 以下所有命令都需要你指定应用程序的名称
# 或 `ecosystem.config.js` 文件。
# 要将操作应用于所有应用程序，请指定 `all`。

# 启动应用
pm2 restart <app-name>

# 重启应用
pm2 reload <app-name>

# 停止应用
pm2 stop <app-name>

# 删除应用
pm2 delete <app-name>
```

#### 保存应用程序操作

如果服务器重启，你的 bot 将无法恢复工作。
为了让 bot 恢复工作，你需要为此准备好 PM2。

在服务器终端中运行以下命令：

```sh
pm2 startup
```

你会获得一条必须执行命令，你必须执行该命令才能使 PM2 在服务器重启后自动启动。

然后再运行一个命令：

```sh
pm2 save
```

该命令将保存当前应用程序的列表，以便在服务器重启后启动它们。

如果你创建了一个新程序并希望将其保存，只需再次运行 `pm2 save`。

## 基于 Webhook 运行 Bot

要在 webhook 上运行 bot，你需要使用 Web 框架，并且**不要**调用 `bot.start()`。

下面是基于 webhook 运行 bot 的示例代码，应将其添加到 bot 的主文件中：

::: code-group

```ts [Node.js]
import { webhookCallback } from "grammy";
import { fastify } from "fastify";

const server = fastify();

server.post(`/${bot.token}`, webhookCallback(bot, "fastify"));

server.listen();
```

```ts [Deno]
import { webhookCallback } from "https://deno.land/x/grammy/mod.ts";

const handleUpdate = webhookCallback(bot, "std/http");

Deno.serve(async (req) => {
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

### 域名租赁

要将基于 webhook 运行的 bot 与外部世界连接起来，你需要购买一个域名。
我们将再次用 Hostinger 解释这一点，但还有许多其他服务，而且它们的工作原理都类似。

跳转到 [域名搜索页面](https://www.hostinger.com/domain-name-search)。
在文本输入框中输入 `<name>.<zone>` 形式的域名。
例如，`example.com`。

如果所需域名是免费的，请单击旁边的添加按钮。
你将被自动转到结账页面，如果你尚未注册，你还可以立即在此注册 Hostinger。
支付域名费用。

#### 将域名指向 VPS

在你的域名与 VPS 协同工作之前，你需要将域名指向你的服务器。
为此，在 [Hostinger 控制面板](https://hpanel.hostinger.com) 中，点击域名旁边的 “Manage” 按钮。
然后，点击左侧菜单中的 “DNS / Name Servers” 按钮，进入 DNS 记录管理页面。

> 首先，找出你的 VPS 的 IP 地址。

在 DNS 记录列表中，找到名称为 `@` 的 `A` 类型的记录。
编辑此记录，将 “Points to” 字段中的 IP 地址更改为你的 VPS 的 IP 地址，并将 TTL 设置为 3600。

然后，找到并删除名称为 `www` 的 `CNAME` 类型的记录。
取而代之的是，创建一个名称为 `www` 的 `A` 类型的新记录，指向你的 VPS 的 IP 地址，并将 TTL 设置为 3600。

> 如果你遇到了问题，请使用 [知识库](https://support.hostinger.com/en/articles/1583227-how-to-point-a-domain-to-your-vps) 中介绍的其他方法。

### 搭建 Web 服务器

为了让网站正常运行，让 bot 开始接收来自 Telegram 的 update，你需要搭建一个 Web 服务器。
我们将使用 [Caddy](https://caddyserver.com)。

Caddy 是一款功能强大的开源 Web 服务器，具有自动 HTTPS 功能。

::: tip Web 服务器
我们之所以使用 Caddy，是因为与 Nginx 或 Apache 等主流 Web 服务器不同，它能自动配置 SSL 证书。
这让文章的变得更加容易。
不过，你可以自由选择任何 Web 服务器。
:::

#### 安装

以下五条命令将下载 Caddy，并以一个名为 `caddy` 的 systemd 服务自动启动。

```sh
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install caddy
```

> 有关其他安装选项，请参阅 [Caddy 安装指南](https://caddyserver.com/docs/install)。

检查 Caddy 的状态：

```sh
systemctl status caddy
```

::: details 故障诊断
有些托管服务提供商在提供 VPS 时会预装 Web 服务器，例如，[Apache](https://httpd.apache.org)。
同一台机器上不能同时运行多个 Web 服务器。
为了使 Caddy 正常工作，你需要停止并关闭另一个 Web 服务器：

```sh
systemctl stop <service-name>
systemctl disable <service-name>
```

将 `service-name` 替换为干扰 Caddy 的 Web 服务器的服务名称。

:::

现在，如果你在浏览器中打开你的服务器的 IP 地址，就会看到一个典型的页面，上面有关于如何设置 Caddy 的说明。

#### 配置

为了让 Caddy 处理进入我们域的请求，我们需要更改 Caddy 配置。

运行以下命令打开 Caddy 配置文件：

```sh
nano /etc/caddy/Caddyfile
```

你会看到默认配置如下：

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

为了让 bot 正常工作，配置应如下所示：

```text
<domain> {
  reverse_proxy /<token> localhost:<port>
}
```

将 `<domain>` 替换为你的域名，将 `<token>` 替换为你的 bot token，将 `<port>` 替换为你想让你的 bot 运行的端口。

每次你更改网站配置文件后，使用以下命令重新加载 Caddy：

```sh
systemctl reload caddy
```

现在，对地址 `https://<domain>/<token>` 的所有请求都将重定向到地址 `http://localhost:<port>/<token>`，bot 的 webhook 正在该地址运行。

#### 将 Webhook 连接到 Telegram

你所要做的就是告诉 Telegram 将 update 发送到哪里。
为此，请打开你的浏览器，访问以下链接的页面：

```text
https://api.telegram.org/bot<token>/setWebhook?url=https://<domain>/<token>
```

将 `<token>` 替换为你的 bot token，将 `<domain>` 替换为你的域名。

## CI/CD

[CI/CD](https://about.gitlab.com/topics/ci-cd) 是现代软件开发流程的重要组成部分。
本指南几乎涵盖了 [CI/CD pipeline](https://about.gitlab.com/topics/ci-cd/cicd-pipeline) 的所有内容。

我们将重点为 GitHub 和 GitLab 编写脚本。
如有需要，你可以根据自己选择的 CI/CD 服务（如 Jenkins、Buddy 等）轻松地修改下面的示例。

### SSH 密钥

为了向服务器发送文件，你需要使用 SSH 密钥设置无密码身份验证。

你需要在你的个人电脑上运行以下命令。

切换到包含 SSH 密钥的目录：

```sh
cd ~/.ssh
```

生成新的密钥对：

::: code-group

```sh [GitHub]
ssh-keygen -t rsa -m PEM
```

```sh [GitLab]
ssh-keygen -t ed25519
```

:::

该命令将为 GitHub 和 GitLab 生成所需类型和格式的公钥和私钥。
你也可以根据需要指定自定义密钥名称。

然后，将**公**钥发送到服务器：

```sh
ssh-copy-id -i <key-name>.pub root@<ip-address>
```

将 `<key-name>` 替换为生成的密钥的名称，将 `<ip-address>` 替换为你的服务器的 IP 地址。

请注意，**公**钥可以位于许多服务器上，而**私**钥只能由你和 GitHub 或 GitLab 拥有。

现在你无需输入密码即可连接到服务器。

### Workflow 示例

#### Node.js (GitHub)

使用

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
          node-version: "latest"
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

其中，将 `<target-directory>` 替换为服务器上存储 bot 构建的目录名称，将 `<start-command>` 替换为启动 bot 的命令，例如可以调用 `pm2` 或 `systemctl`。

该脚本依次执行两项任务：`build` 和 `deploy`。
在执行了 `build` 之后，该任务的产物（即包含 bot 构建的 `dist` 目录）会传递给 `deploy` 任务。

文件通过 `rsync` 工具被传输到服务器，该工具由 `easingthemes/ssh-deploy` 实现。
文件传输到服务器后，将执行 `SCRIPT_AFTER` 环境变量中描述的命令。
在我们的例子中，文件传输完成后，我们进入 bot 的目录，在那里安装除 `devDependencies` 以外的所有依赖项，然后重启 bot。

请注意，你需要添加三个 [秘密环境变量](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)：

1. `SSH_PRIVATE_KEY`---这是你在 [上一步](#ssh-密钥) 中创建的 SSH 私钥的存放位置。
2. `REMOTE_HOST`---服务器的 IP 地址应存储在这里。
3. `REMOTE_USER`---启动 bot 的用户的用户名应存储这里。

#### Node.js (GitLab)

使用

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

其中，将 `<target-directory>` 替换为服务器上存储 bot 构建的目录名称，将 `<start-command>` 替换为启动 bot 的命令，例如可以调用 `pm2` 或 `systemctl`。

该脚本依次执行两项任务：`build` 和 `deploy`。
在执行了 `build` 之后，该任务的产物（即包含 bot 构建的 `dist` 目录）会传递给 `deploy` 任务。

文件通过 `rsync` 工具被传输到服务器，我们必须在执行主脚本之前安装该工具。
文件传输到服务器后，我们使用 SSH 连接到服务器，运行命令安装除 `devDependencies` 以外的所有依赖项，并重启应用程序。

请注意，你需要添加三个 [环境变量](https://docs.gitlab.com/ee/ci/variables)：

1. `SSH_PRIVATE_KEY`---这是你在 [上一步](#ssh-密钥) 中创建的 SSH 私钥的存放位置。
2. `REMOTE_HOST`---服务器的 IP 地址应存储在这里。
3. `REMOTE_USER`---启动 bot 的用户的用户名应存储这里。

#### Deno (GitHub)

使用

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

其中，将 `<target-directory>` 替换为服务器上存储 bot 构建的目录名称，将 `<start-command>` 替换为启动 bot 的命令，例如可以调用 `pm2` 或 `systemctl`。

文件通过 `rsync` 工具被传输到服务器，该工具由 `easingthemes/ssh-deploy` 实现。
文件传输到服务器后，将执行 `SCRIPT_AFTER` 环境变量中描述的命令。
在我们的例子中，文件传输完成后，我们进入 bot 的目录并重启 bot。

请注意，你需要添加三个 [秘密环境变量](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)：

1. `SSH_PRIVATE_KEY`---这是你在 [上一步](#ssh-密钥) 中创建的 SSH 私钥的存放位置。
2. `REMOTE_HOST`---服务器的 IP 地址应存储在这里。
3. `REMOTE_USER`---启动 bot 的用户的用户名应存储这里。

#### Deno (GitLab)

使用

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

其中，将 `<target-directory>` 替换为服务器上存储 bot 构建的目录名称，将 `<start-command>` 替换为启动 bot 的命令，例如可以调用 `pm2` 或 `systemctl`。

该脚本使用 `rsync` 向服务器发送文件，而 `rsync` 需要事先安装。
文件复制完成后，我们使用 SSH 连接服务器并重启 bot。

请注意，你需要添加三个 [环境变量](https://docs.gitlab.com/ee/ci/variables):

1. `SSH_PRIVATE_KEY`---这是你在 [上一步](#ssh-密钥) 中创建的 SSH 私钥的存放位置。
2. `REMOTE_HOST`---服务器的 IP 地址应存储在这里。
3. `REMOTE_USER`---启动 bot 的用户的用户名应存储这里。

现在，你应该能看到每次推送到 `main` 分支的代码都会自动部署到你的 VPS 上。
开发快到飞起！ :rocket:
