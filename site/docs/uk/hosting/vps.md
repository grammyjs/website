# Хостинг: VPS

Віртуальний приватний сервер, відомий переважно як VPS, є віртуальною машиною, яка працює в хмарі, а користувачі мають повний контроль над її системою.

У цьому керівництві ви дізнаєтесь про різні методи запуску вашого бота на VPS, тримаючи його онлайн 24/7, зробивши його автоматичним запуском при запуску вашого VPS і перезавантаженням у разі збоїв.

## systemd

systemd - це потужний менеджер служб, який передвстановлений в багатьох дистрибутивах Linux, переважно на основі Debian.

### Отримання команди запуску

1. Отримайте повний шлях до вашого середовища виконання:

```sh
# Якщо ви використовуєте Deno
which deno

# Якщо ви використовуєте Node.js
which node
```

2. Ви також повинні мати повний шлях до вашого файлу входу.

3. Ваша команда запуску повинна виглядати наступним чином:

```sh
<full_runtime_path> <options> <full_entry_file_path>

# Deno приклад:
# /home/user/.deno/bin/deno --allow-all /home/user/bot1/mod.ts

# Node.js приклад:
# /home/user/.nvm/versions/node/v16.9.1/bin/node /home/user/bot1/index.js
```

### Створення служби

1. Перейдіть до директорії служб:

```sh
cd /etc/systemd/system
```

2. Відкрийте ваш новий файл служби з редактором:

```sh
nano bot1.service
```

3. Додайте наступний вміст:

```text
[Service]
ExecStart=<start_command>
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

> Замініть `<start_command>` на команду, яку ви отримали вище.
>
> Також зверніть увагу, що якщо Deno встановлено для іншого користувача, а не root, вам може знадобитися вказати це в розділі служби, наприклад, `User=<the_user>`.
> Для отримання додаткової інформації про файлові одиниці відвідайте [цей сайт](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/configuring_basic_system_settings/assembly_working-with-systemd-unit-files_configuring-basic-system-settings).

3. Перезавантажуйте systemd кожного разу, коли ви редагуєте службу:

```sh
systemctl daemon-reload
```

### Управління службою

#### запуск

```sh
systemctl start <service_name>
```

> Замініть `<service_name>` на файл з вашим сервісом.
> Приклад: `systemctl start bot1`

#### Запуск при завантаженні

```sh
systemctl enable <service_name>
```

#### Перевірка логів

```sh
systemctl status <service_name>
```

#### Перезавантаження

```sh
systemctl restart <service_name>
```

#### Запунити

```sh
systemctl stop <service_name>
```

#### Не запуска при завантаженні

```sh
systemctl disable <service_name>
```

## PM2 (Тільки Node.js)

PM2 - це менеджер процесів-демонів для Node.js, який допоможе вам керувати та тримати ваш додаток в режимі онлайн 24/7.

### Встановлення

```sh
npm install pm2@latest -g

# Якщо ви використовуєте Yarn
yarn global add pm2
```

### Управління додатками

#### Старт

```sh
pm2 start --name <app_name> <entry_point>
```

> `<app_name>` може бути будь-яким ідентифікатором для вашого додатку, наприклад: `bot1`.
> `<entry_point>` повинен бути шляхом до вашого файлу index (який запускає вашого бота).

#### Перезавантаження (restart)

Перезапуск додатку передбачає його зупинку та знову запуск.

```sh
pm2 restart <app_name>
```

#### перезавантаження (reload)

Перезавантаження додатку передбачає заміну поточного процесу вашого додатку на новий, що призводить до відсутності перерви у роботі.
Це рекомендується для безстійких додатків.

```sh
pm2 reload <app_name>
```

#### Зупинка

```sh
# Для одного додатка
pm2 stop <app_name>

# Для всіх додатків
pm2 stop all
```

#### Видалення

При видаленні ви запиняєте ваш додаток та видаляєте всі логи та метрики.

```sh
pm2 del <app_name>
```

### Розширена інформація

Для більшої інформації, будь ласка, відвідайте це посилання <https://pm2.keymetrics.io/docs>.
