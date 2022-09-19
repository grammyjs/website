# Hosting: VPS <Badge text="Deno" /><Badge text="Node.js" type="warning"/>

A virtual private server, mostly known as VPS, is a virtual machine running in the cloud with its users having the full control of its system.

In this guide, you'll learn about various methods of running your bot in a VPS, keeping it online 24/7, making it run automatically when your VPS boots and restart on crashes.

## systemd

systemd is a powerful service manager which is pre-installed on many Linux distributions, mainly Debian-based ones.

### Getting the Start Command

1. Get the full path of your runtime:

```bash
# If using Deno
which deno

# If using Node.js
which node
```

2. You should have the full path of your entry file, too.

3. Your start command should look like the following:

```bash
<full_runtime_path> <options> <full_entry_file_path>

# Deno example:
# /home/user/.deno/bin/deno --allow-all /home/user/bot1/mod.ts

# Node.js example:
# /home/user/.nvm/versions/node/v16.9.1/bin/node /home/user/bot1/index.js
```

### Creating the Service

1. Go to the services directory:

```bash
cd /etc/systemd/system
```

2. Open your new service file with an editor:

```bash
nano bot1.service
```

3. Add the following content:

```text
[Service]
ExecStart=<start_command>
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

> Replace `<start_command>` with the command you got above.

3. Reload systemd whenever you edit the service:

```bash
systemctl daemon-reload
```

### Managing the Service

#### Start

```bash
systemctl start <service_name>
```

> Replace `<service_name>` with the file name of the service.
> Example: `systemctl start bot1`

#### Run on Boot

```bash
systemctl enable <service_name>
```

#### Check Logs

```bash
systemctl status <service_name>
```

#### Restart

```bash
systemctl restart <service_name>
```

#### Stop

```bash
systemctl stop <service_name>
```

#### Don't Run on Boot

```bash
systemctl disable <service_name>
```

## PM2 (Node.js only)

PM2 is a daemon process manager for Node.js that will help you manage and keep your app online 24/7.

### Installing

```bash
npm install pm2@latest -g

# If using Yarn
yarn global add pm2
```

### Managing Apps

#### Start

```bash
pm2 start --name <app_name> <entry_point>
```

> The `<app_name>` can be any identifier to your app, for example: `bot1`.
> The `<entry_point>` should be the path to your index file (which runs your bot).

#### Restart

By restarting, you stop the app, and start it again.

```bash
pm2 restart <app_name>
```

#### Reload

By reloading, you replace the current process of your app with a new one, resulting in a 0-second downtime.
This is recommended for stateless applications.

```bash
pm2 reload <app_name>
```

#### Stop

```bash
# A single app
pm2 stop <app_name>

# All apps
pm2 stop all
```

#### Delete

By deleting, you stop your app and remove its logs and metrics.

```bash
pm2 del <app_name>
```

### Advanced Information

For more, please refer to <https://pm2.keymetrics.io/docs>.
