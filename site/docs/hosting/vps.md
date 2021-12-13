# Hosting: VPS

A virtual private server, mostly known as VPS, is a virtual machine running in the cloud with its users having the full control of its system.

In this guide, you'll learn about various methods of running your bot in a VPS, keeping it online 24/7, making it run automatically when your VPS boots and restart on crashes.

## systemd

systemd is a powerful service manager which is pre-installed on many Linux distributions, mainly Debian-based ones.

### Getting the start commmand

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

### Creating the service

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
WantedBy=multi-user.targets
```

> Replace `<start_command>` with the command you got above.

3. Reload systemd whenever you edit the service:

```bash
systemctl daemon-reload
```

### Managing the service

#### Start

```bash
systemctl start <service_name>
```

> Replace `<service_name>` with the file name of the service.
> Example: `systemctl start bot1`

#### Run on boot

```bash
systemctl enable <service_name>
```

#### Check logs

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

#### Don't run on boot

```bash
systemctl disable <service_name>
```

## PM2 PROCESS MANAGER (NODE only)

PM2 is a daemon process manager that will help you manage and keep your application online 24/7

### Starting an app

1. Install PM2 via NPM or Yarn globally

```bash
npm install pm2@latest -g
# or
yarn global add pm2
```

2. Your start command should look like the following:

```bash
# Start a simple process with the name of your file
pm2 start index.js
```

### Managing the pm2 process

#### Restarting an app:
Restart stops all processes of this app first and then starts it again.

```bash
pm2 restart <app_name>
```

#### Reloading an app:
Reload first starts a new process before stopping the other processes resulting in 0-second-downtime. Recommended for stateless applications.

```bash
pm2 reload <app_name>
```

#### Stopping an app:

```bash
# Stopping an app with its name
pm2 stop <app_name>
# Stopping every app launched by pm2
pm2 stop all
```

#### Deleting an app:
Also stops the app and deletes its logs and metrics

```bash
pm2 del <app_name>
```

### Advanced Information

- Management of Processes: <https://pm2.keymetrics.io/docs/usage/process-management/>
- Logs: <https://pm2.keymetrics.io/docs/usage/log-management/>
- Startup Script: <https://pm2.keymetrics.io/docs/usage/startup/>
- Graceful start and stop: <https://pm2.keymetrics.io/docs/usage/signals-clean-restart/>
