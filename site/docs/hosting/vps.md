---
prev: false
next: false
---

# Hosting: VPS

A virtual private server, mostly known as VPS, is a virtual machine running in the cloud with its users having the full control of its system.

In this guide, you'll learn about various methods of running your bot in a VPS, keeping it online 24/7, making it run automatically when your VPS boots and restart on crashes.

## systemd

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
nano bot1.service
```

3. Add the following content:

```txt
[Service]
ExecStart=<start_command>
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

> Replace `<start_command>` with the command you got above.
>
> Also note that if Deno is installed for a different user other than root, you may need to specify it in the service section like `User=<the_user>`.
> For more information on the unit files, visit [here](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/configuring_basic_system_settings/assembly_working-with-systemd-unit-files_configuring-basic-system-settings).

3. Reload systemd whenever you edit the service:

```sh
systemctl daemon-reload
```

### Managing the Service

#### Start

```sh
systemctl start <service_name>
```

> Replace `<service_name>` with the file name of the service.
> Example: `systemctl start bot1`

#### Run on Boot

```sh
systemctl enable <service_name>
```

#### Check Logs

```sh
systemctl status <service_name>
```

#### Restart

```sh
systemctl restart <service_name>
```

#### Stop

```sh
systemctl stop <service_name>
```

#### Don't Run on Boot

```sh
systemctl disable <service_name>
```

## PM2 (Node.js only)

PM2 is a daemon process manager for Node.js that will help you manage and keep your app online 24/7.

### Installing

```sh
npm install pm2@latest -g

# If using Yarn
yarn global add pm2
```

### Managing Apps

#### Start

```sh
pm2 start --name <app_name> <entry_point>
```

> The `<app_name>` can be any identifier to your app, for example: `bot1`.
> The `<entry_point>` should be the path to your index file (which runs your bot).

#### Restart

By restarting, you stop the app, and start it again.

```sh
pm2 restart <app_name>
```

#### Reload

By reloading, you replace the current process of your app with a new one, resulting in a 0-second downtime.
This is recommended for stateless applications.

```sh
pm2 reload <app_name>
```

#### Stop

```sh
# A single app
pm2 stop <app_name>

# All apps
pm2 stop all
```

#### Delete

By deleting, you stop your app and remove its logs and metrics.

```sh
pm2 del <app_name>
```

### Advanced Information

For more, please refer to <https://pm2.keymetrics.io/docs/usage/quick-start>.
