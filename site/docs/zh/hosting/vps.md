# 托管: VPS <Badge text="Deno" /><Badge text="Node.js" type="warning"/>

虚拟私人服务器，大多数时候被称为 VPS，是在云中运行的虚拟机，用户拥有其系统的完整控制权。

在这个指南中，你将学习如何在 VPS 中运行你的机器人，保持它 24/7 在线，使其在 VPS 启动和崩溃时自动重启。

## systemd

systemd 是一个强大的服务管理器，它预安装在大多数 Linux 发行版上，主要是基于 Debian 的发行版。

### 获取启动命令

1. 获取你的运行时的完整路径：

```bash
# 如果使用 Deno
which deno

# 如果使用 Node.js
which node
```

2. 你也应该有你的入口文件的完整路径。

3. 你的启动命令应该像下面这样：

```bash
<完整的运行时路径> <选项> <完整的入口文件路径>

# Deno 样例:
# /home/user/.deno/bin/deno --allow-all /home/user/bot1/mod.ts

# Node.js 样例:
# /home/user/.nvm/versions/node/v16.9.1/bin/node /home/user/bot1/index.js
```

### 创建服务

1. 进入服务目录

```bash
cd /etc/systemd/system
```

2. 用编辑器打开你的新服务文件：

```bash
nano bot1.service
```

3. 添加以下内容：

```text
[Service]
ExecStart=<start_command>
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

> 用上面得到的命令替换 `<start_command>`。

3. 每当你编辑服务时，都要重新加载 systemd：

```bash
systemctl daemon-reload
```

### 管理服务

#### 启动

```bash
systemctl start <service_name>
```

> 用服务的文件名替换 `<service_name>`。
> 样例：`systemctl start bot1`

#### 开机时启动

```bash
systemctl enable <service_name>
```

#### 检查日志

```bash
systemctl status <service_name>
```

#### 重启

```bash
systemctl restart <service_name>
```

#### 停止

```bash
systemctl stop <service_name>
```

#### 不要在开机时运行

```bash
systemctl disable <service_name>
```

## PM2（仅限 Node.js）

PM2是一个用于 Node.js 的守护进程管理器，它将帮助你管理并保持你的应用程序 24/7 在线。

### 安装

```bash
npm install pm2@latest -g

# 使用 Yarn
yarn global add pm2
```

### 管理应用

#### 启动

```bash
pm2 start --name <app_name> <entry_point>
```

> `<app_name>` 可以是你的应用程序的任何标识符，例如：`bot1`。
> `<entry_point>` 是你的索引文件的路径（即运行你的 bot 的文件）。

#### 重启

通过重启，你停止了应用程序，然后再次启动它。

```bash
pm2 restart <app_name>
```

#### 重载

通过重载，用一个新的进程替换你的应用程序的当前进程，导致 0 秒的停机时间。这建议用于无状态应用程序。

```bash
pm2 reload <app_name>
```

#### 停止

```bash
# 一个应用程序
pm2 stop <app_name>

# 所有应用程序
pm2 stop all
```

#### 删除

通过删除，将会停止你的应用程序，并且删除它的日志和指标。

```bash
pm2 del <app_name>
```

### 高级用法

更多信息，请参考 <https://pm2.keymetrics.io/docs>。
