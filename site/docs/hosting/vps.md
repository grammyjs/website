# VPS

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
