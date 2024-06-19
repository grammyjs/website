---
prev: false
next: false
---

<!-- markdownlint-disable no-duplicate-heading -->

# Alojamiento: VPS

Un servidor virtual privado, más conocido como VPS, es una máquina virtual que se ejecuta en la nube en la que usted, el desarrollador, tiene el control total sobre el sistema.

## Alquiler de Servidores

> Para poder seguir esta guía, primero necesitas alquilar un VPS.
> Esta sección explicará cómo hacerlo.
> Si ya tienes un VPS en el que trabajar, pasa a la [siguiente sección](#iniciando-el-bot).

En esta guía, utilizaremos los servicios de [Hostinger](https://hostinger.com).

> Eres libre de elegir el proveedor que prefieras.
> Todos los proveedores ofrecen los mismos servicios, por lo que no tendrás ningún problema con la parte técnica de este artículo.
> Puedes tomar esta parte como una visión general de cómo funciona la operación de alquiler de servidores.
> Si eres principiante, ¡puedes utilizar esta guía para alquilar tu primer servidor!

::: tip Análogo de un servidor
Si no puedes o no quieres alquilar un servidor pero aún así quieres jugar a ejecutar un bot en un VPS, puedes seguir este tutorial en una máquina virtual en su lugar.
Para ello, utiliza una aplicación como [VirtualBox](https://virtualbox.org).
Crea una máquina virtual con la distribución de Linux deseada para simular un servidor Linux.
:::

Vaya a la [página de alojamiento VPS](https://hostinger.com/vps-hosting).
Utilizaremos el plan "KVM 1".
Los recursos de "KVM 1" son suficientes para bots con mucha audiencia, y más aún para nuestro bot de prueba.

Haz clic en el botón "Añadir a la cesta".
Será redirigido automáticamente a la página de pago, donde también se registrará inmediatamente en Hostinger.

::: warning ¡Cambie el plazo de alquiler!
El plazo de alquiler típico es de 1-2 años (una estratagema de marketing), y cuesta mucho dinero.
Probablemente no lo necesite, así que puede empezar alquilando un servidor por un mes, que es mucho más barato.

En cualquier caso, Hostinger ofrece una garantía de devolución del dinero de 30 días.
:::

Después de realizar el pago, podrá configurar su servidor:

1. **Ubicación.**
   Le recomendamos que [elija la ubicación](../guide/api#elegir-la-ubicacion-de-un-centro-de-datos) más cercana a Amsterdam.
   El servidor principal del Bot API se encuentra en Ámsterdam.
   Si utiliza su [propio servidor Bot API](../guide/api#ejecutar-un-servidor-local-de-bot-api), elija en su lugar la ubicación más cercana.
2. **Tipo de servidor.**
   Elige la opción "SO limpio".
3. **Sistema operativo.**
   Nosotros utilizaremos Ubuntu 22.04.
   Si eliges otro sistema, algunos pasos pueden ser diferentes, así que ten cuidado.
4. **Nombre del servidor.**
   Elige el nombre que quieras.
5. **Contraseña.**
   Haz una contraseña fuerte y guárdala en un lugar seguro.
6. **Clave SSH.**
   Omite este paso.
   Configuraremos las claves SSH [más tarde](#claves-ssh).

Una vez creado el servidor, puedes conectarte a él usando SSH:

> SSH (_Secure Shell_) es un protocolo de red que puede utilizarse para controlar remotamente un ordenador.

```sh
ssh root@<dirección-ip>
```

Sustituya `<dirección-ip>` por la dirección IP de su servidor, que encontrará en la página de gestión del servidor.

::: tip Configuración de SSH
Puede resultar difícil y tedioso recordar qué dirección IP y qué nombre necesita para conectarse a un servidor.
Para eliminar estos pasos rutinarios y mejorar su experiencia con el servidor, puede configurar SSH creando un archivo `~/.ssh/config` (<https://linuxhandbook.com/ssh-config-file>) en su ordenador que almacene todos los datos que necesita para conectarse al servidor bajo ciertos identificadores arbitrarios.
Esto está fuera del alcance de este artículo, así que tendrás que configurarlo tú mismo.
:::

::: tip Usuario separado para cada aplicación
En esta guía, todas las acciones con el servidor se realizarán como usuario root.
Esto se hace a propósito para simplificar esta guía.
Sin embargo, en realidad, el usuario root sólo debería ser responsable de los servicios generales (servidor web, base de datos, etc.), y las aplicaciones deberían ser ejecutadas por usuarios individuales no root.
Este enfoque garantiza la seguridad de los datos confidenciales y evita la piratería de todo el sistema.
Al mismo tiempo, impone algunos inconvenientes.
Describir todos estos puntos aumenta innecesariamente la complejidad del artículo, lo que intentamos evitar.
:::

## Iniciando el Bot

Ahora tenemos un servidor a nuestra disposición donde podemos ejecutar el bot para mantenerlo funcionando las 24 horas del día.

Para simplificar el principio del artículo, nos saltamos el paso de entregar el código al servidor automáticamente cada vez después de empujar tu código, pero está descrito [más abajo](#ci-cd).

Por ahora, puedes copiar archivos locales a un servidor remoto usando el siguiente comando.
Ten en cuenta que `-r` copia recursivamente, por lo que sólo necesitas especificar el directorio raíz de tu proyecto:

```sh
scp -r <ruta-a-proyecto-local> root@<dirección-ip>:<ruta-a-directorio-remoto>
```

Sustituye `<ruta-a-proyecto-local>` por la ruta al directorio del proyecto en tu disco local, `<dirección-ip>` por la dirección IP de tu servidor, y `<ruta-a-directorio-remoto>` por la ruta al directorio donde el código fuente del bot debe ser almacenado en el servidor.

Como se mencionó anteriormente, ahora debe ser capaz de abrir un terminal remoto en su VPS iniciando una sesión SSH.

```sh
ssh root@<dirección-ip>
```

Observe cómo cambia el símbolo del sistema.
Esto indica que ahora está conectado a la máquina remota.
Cada comando que escriba se ejecutará en su VPS.
Intente ejecutar `ls` para confirmar que ha copiado correctamente sus archivos fuente.

El resto de esta página asumirá que usted es capaz de conectarse a su VPS.
Todos los comandos siguientes deben ejecutarse en una sesión SSH.

::: tip ¡No olvides instalar el runtime!
Para ejecutar el bot, necesitas instalar Node.js o Deno en el servidor, dependiendo del tiempo de ejecución en el que se ejecutará el bot.
Esto está fuera del alcance de este artículo, así que tendrás que hacerlo tú mismo.
Probablemente ya lo hiciste [al empezar](../guide/getting-started), así que deberías estar familiarizado con los pasos. :wink:
:::

A continuación hay dos maneras de mantener tu bot funcionando sin problemas: usando [systemd](#systemd) o [PM2](#pm2).

### systemd

systemd is a powerful service manager which is pre-installed on many Linux distributions, mainly Debian-based ones such as Ubuntu.

#### Obtener el comando de inicio

1. Obtén la ruta absoluta a tu runtime:

   ::: code-group

   ```sh [Deno]
   which deno
   ```

   ```sh [Node.js]
   which node
   ```

   :::

2. Deberías tener la ruta absoluta al directorio de tu bot.

3. Tu comando de inicio debería ser como el siguiente:

   ```sh
   <ruta_de_ejecución> <opciones> <ruta_archivo_entrada>

   # Ruta al directorio del bot: /home/user/bot1/

   # Ejemplo Deno:
   # /home/user/.deno/bin/deno --allow-all run mod.ts

   # Ejemplo Node.js:
   # /home/user/.nvm/versions/node/v16.9.1/bin/node index.js
   ```

#### Creación del servicio

1. Vaya al directorio de servicios:

   ```sh
   cd /etc/systemd/system
   ```

2. Abre el nuevo archivo de servicio con un editor:

   ```sh
   nano <nombre-de-la-aplicacion>.service
   ```

   > Sustituye `<nombre-de-la-aplicacion>` por cualquier identificador.
   > `<nombre-de-la-aplicacion>.service` será el nombre de tu servicio.

3. Añade el siguiente contenido:

   ```text
   [Unit]
   After=network.target

   [Service]
   WorkingDirectory=<ruta-directorio-bot>
   ExecStart=<comando-de-inicio>
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   ```

   Sustituye `<ruta-directorio-bot>` por la ruta absoluta al directorio de tu bot y `<comando-de-inicio>` por el comando que recibiste [arriba](#obtener-el-comando-de-inicio).

   He aquí una breve explicación de la configuración del servicio:

   - `After=network.target` --- indica que la aplicación debe lanzarse después de cargar el módulo de Internet.
   - `WorkingDirectory=<ruta-directorio-bot>` --- establece el directorio de trabajo actual del proceso.
     Esto le permite utilizar activos relativos, como el archivo `.env`, que contiene todas las variables de entorno necesarias.
   - `ExecStart=<comando-de-inicio>` --- establece el comando de inicio.
   - `Restart=on-failure` --- indica que la aplicación debe reiniciarse después de un fallo.
   - `WantedBy=multi-user.target` --- define el estado del sistema en el que debe iniciarse el servicio.
   - `multi-user.target` --- es un valor típico para servidores.

   > Para más información sobre los archivos de unidad, lea [esto](https://access.redhat.com/documentation/te-in/red_hat_enterprise_linux/9/html/using_systemd_unit_files_to_customize_and_optimize_your_system/assembly_working-with-systemd-unit-files_working-with-systemd).

4. Recarga systemd cada vez que edites el servicio:

   ```sh
   systemctl daemon-reload
   ```

#### Gestión del servicio

```sh
# Sustituye `<nombre-del-servicio>` por el nombre del archivo del servicio que has creado.

# Para iniciar el servicio
systemctl start <nombre-del-servicio>

# Para ver los registros del servicio
journalctl -u <nombre-del-servicio>

# Para reiniciar el servicio
systemctl restart <nombre-del-servicio>

# Para detener el servicio
systemctl stop <nombre-del-servicio>

# Para habilitar el servicio para que se inicie cuando arranque el servidor
systemctl enable <nombre-del-servicio>

# Para deshabilitar el inicio del servicio cuando arranque el servidor
systemctl disable <nombre-del-servicio>
```

Al iniciar el servicio, tu bot debería ponerse en marcha.

### PM2

[PM2](https://pm2.keymetrics.io) es un gestor de procesos daemon para Node.js que te ayudará a gestionar y mantener tu aplicación online 24/7.

PM2 está diseñado específicamente para gestionar aplicaciones escritas en Node.js.
Sin embargo, también se puede utilizar para gestionar aplicaciones escritas en otros lenguajes o tiempos de ejecución.

#### Instalación

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

#### Creación de una aplicación

PM2 ofrece dos formas de crear una aplicación:

1. Utilizar la interfaz de línea de comandos.
2. Utilizar el [archivo de configuración](https://pm2.keymetrics.io/docs/usage/application-declaration).

El primer método es conveniente para conocer PM2.
Sin embargo, durante el despliegue, debe utilizar el segundo método, que es lo que hicimos en nuestro caso.

Crea un archivo `ecosystem.config.js` en el servidor, en el directorio donde se almacena la compilación del bot, con el siguiente contenido:

```js
module.exports = {
  apps: [{
    nombre: "<nombre-de-la-aplicación>",
    script: "<comando-de-inicio>",
  }],
};
```

Sustituye `<nombre-de-la-aplicación>` por cualquier identificador y `<comando-de-inicio>` por el comando para iniciar el bot.

#### Gestión de la aplicación

A continuación se muestran los comandos que puede utilizar para controlar la aplicación.

```sh
# Si el archivo `ecosystem.config.js` está en el directorio actual,
# puedes no especificar nada para iniciar la aplicación.
# Si la aplicación ya se está ejecutando, este comando la reiniciará.
pm2 start

# Todos los siguientes comandos requieren que especifiques el nombre de la aplicación
# o el archivo `ecosystem.config.js`.
# Para aplicar la acción a todas las aplicaciones, especifique `all`.

# Para reiniciar la aplicación
pm2 restart <nombre-de-la-aplicación>

# Para recargar la aplicación
pm2 reload <nombre-de-la-aplicación>

# Para detener la aplicación
pm2 stop <nombre-de-la-aplicación>

# Para eliminar una aplicación
pm2 delete <nombre-de-la-aplicación>
```

#### Guardar el funcionamiento de la aplicación

Si el servidor se reinicia, su bot no reanudará el trabajo.
Para que el bot reanude su trabajo, debe preparar PM2 para ello.

En el servidor en el terminal, ejecute el siguiente comando:

```sh
pm2 startup
```

Se le proporcionará un comando que debe ejecutar para hacer que PM2 se inicie automáticamente después de que el servidor se reinicie.

A continuación, ejecute un comando más:

```sh
pm2 save
```

Este comando guardará la lista de aplicaciones actuales para que puedan iniciarse después de reiniciar el servidor.

Si has creado una nueva aplicación y quieres guardarla también, simplemente ejecuta `pm2 save` de nuevo.

## Ejecutar el Bot en Webhooks

Para ejecutar un bot en webhooks, necesitarás usar un framework web y **NO** llamar a `bot.start()`.

Aquí hay un ejemplo de código para ejecutar el bot en webhooks que debe ser añadido al archivo principal del bot:

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

### Alquiler de dominios

Para conectar un bot que funciona con webhooks al mundo exterior, necesitas comprar un dominio.
Vamos a explicar esto con Hostinger de nuevo, pero hay muchos otros servicios, también, y todos funcionan de manera similar.

Vaya a la [página de búsqueda de nombres de dominio](https://www.hostinger.com/domain-name-search).
En el campo de entrada de texto, introduzca un nombre de dominio de la forma `<nombre>.<zona>`.
Por ejemplo, `ejemplo.com`.

Si el dominio deseado está libre, pulse el botón Añadir situado junto a él.
Será redirigido automáticamente a la página de pago, donde también se registrará inmediatamente en Hostinger si aún no está registrado.
Pague el dominio.

#### Apuntar un dominio al VPS

Antes de que su dominio pueda funcionar con su VPS, necesita apuntar el dominio a su servidor.
Para ello, en el [Panel de Control Hostinger](https://hpanel.hostinger.com), haga clic en el botón "Administrar" situado junto a su dominio.
A continuación, vaya a la página de gestión de registros DNS haciendo clic en el botón "DNS / Name Servers" del menú de la izquierda.

> En primer lugar, averigüe la dirección IP de su VPS.

En la lista de registros DNS, busque el registro de tipo `A` con el nombre `@`.
Edite este registro cambiando la dirección IP en el campo "Points to" a la dirección IP de su VPS, y establezca el TTL a 3600.

A continuación, busque y elimine el registro de tipo `CNAME` con el nombre `www`.
En su lugar, cree un nuevo registro de tipo `A` con el nombre `www`, apuntando a la dirección IP de su VPS, y establezca el TTL a 3600.

> Si tiene problemas, utilice el otro método descrito en la [base de conocimientos](https://support.hostinger.com/en/articles/1583227-how-to-point-a-domain-to-your-vps).

### Configurar un Servidor Web

Para que el sitio web funcione y el bot comience a recibir actualizaciones de Telegram, necesitas configurar un servidor web.
Usaremos [Caddy](https://caddyserver.com).

Caddy es un potente servidor web de código abierto con HTTPS automático.

::: tip Servidor Web
Usamos Caddy porque, a diferencia de los servidores web convencionales como Nginx o Apache, configura automáticamente los certificados SSL.
Esto facilita mucho el artículo.
Sin embargo, usted es libre de elegir cualquier servidor web que desee.
:::

#### Instalación

Los siguientes cinco comandos descargarán e iniciarán automáticamente Caddy como un servicio systemd llamado `caddy`.

```sh
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install caddy
```

> Consulte la [Guía de instalación de Caddy](https://caddyserver.com/docs/install) para conocer otras opciones de instalación.

Compruebe el estado de Caddy:

```sh
systemctl status caddy
```

::: details Solución de problemas
Algunos proveedores de alojamiento proporcionan VPS con un servidor web preinstalado, por ejemplo, [Apache](https://httpd.apache.org).
No se pueden ejecutar varios servidores web en la misma máquina al mismo tiempo.
Para que Caddy funcione, es necesario detener y apagar otro servidor web:

```sh
systemctl stop <nombre-del-servicio>
systemctl disable <nombre-del-servicio>
```

Sustituya `<nombre-del-servicio>` por el nombre del servicio del servidor web que está interfiriendo con Caddy.

:::

Ahora, si abres la dirección IP de tu servidor en un navegador, verás una página típica con instrucciones sobre cómo configurar Caddy.

#### Configuración

Para que Caddy pueda procesar las peticiones que llegan a nuestro dominio, necesitamos cambiar la configuración de Caddy.

Ejecuta el siguiente comando para abrir el archivo de configuración de Caddy:

```sh
nano /etc/caddy/Caddyfile
```

Verá la siguiente configuración por defecto:

```text
# El Caddyfile es una forma sencilla de configurar tu servidor web Caddy.
#
# A menos que el archivo comience con un bloque de opciones globales, la primera
# línea sin comentar es siempre la dirección de su sitio.
#
# Para usar tu propio nombre de dominio (con HTTPS automático), primero asegúrate # de que el A/A de tu dominio es correcto.
# asegúrese de que los registros DNS A/AAAA de su dominio apuntan correctamente a
# la IP pública de esta máquina, luego reemplace ":80" por su nombre de dominio.
# nombre de dominio.

:80 {
  # Establece esta ruta al directorio de tu sitio.
  root * /usr/share/caddy

  # Habilitar el servidor de archivos estático.
  file_server

  # Otra tarea común es configurar un proxy inverso:
  # reverse_proxy localhost:8080

  # O servir un sitio PHP a través de php-fpm:
  # php_fastcgi localhost:9000
}

# Consulte la documentación de Caddy para más información:
# https://caddyserver.com/docs/caddyfile
```

Para que el bot funcione, haz que la configuración tenga este aspecto:

```text
<dominio> {
  reverse_proxy /<token> localhost:<puerto>
}
```

Sustituye `<dominio>` por tu dominio, `<token>` por tu token de bot, y `<puerto>` por el puerto en el que quieres ejecutar tu bot.

Recarga Caddy cada vez que cambies el archivo de configuración del sitio usando el siguiente comando:

```sh
systemctl reload caddy
```

Ahora todas las peticiones a la dirección `https://<dominio>/<token>` serán redirigidas a la dirección `http://localhost:<puerto>/<token>`, donde se está ejecutando el webhook del bot.

#### Conectando un Webhook a Telegram

Todo lo que tienes que hacer es decirle a Telegram dónde enviar las actualizaciones.
Para ello, abre tu navegador y visita la página en el siguiente enlace:

```text
https://api.telegram.org/bot<token>/setWebhook?url=https://<dominio>/<token>
```

Sustituye `<token>` por tu bot token y `<dominio>` por tu dominio.

## CI/CD

[CI/CD](https://about.gitlab.com/topics/ci-cd) es una parte importante del proceso moderno de desarrollo de software.
Esta guía cubre casi todo el [CI/CD pipeline](https://about.gitlab.com/topics/ci-cd/cicd-pipeline).

Nos centraremos en escribir scripts para GitHub y GitLab.
Puedes adaptar fácilmente los ejemplos de abajo al servicio CI/CD de tu elección, como Jenkins, Buddy, etc., si es necesario.

### Claves SSH

Para enviar archivos al servidor, necesita configurar la autenticación sin contraseña, que se implementa utilizando claves SSH.

Los siguientes comandos deben ejecutarse en su ordenador personal.

Cambie al directorio con las claves SSH:

```sh
cd ~/.ssh
```

Generar un nuevo par de claves:

::: code-group

```sh [GitHub]
ssh-keygen -t rsa -m PEM
```

```sh [GitLab]
ssh-keygen -t ed25519
```

:::

Este comando generará una clave pública y privada del tipo y formato que desees para GitHub y GitLab.
También puedes especificar un nombre de clave personalizado si lo deseas.

A continuación, envía la clave **pública** al servidor:

```sh
ssh-copy-id -i <nombre-de-la-clave>.pub root@<dirección-ip>
```

Sustituye `<nombre-de-la-clave>` por el nombre de la clave generada y `<dirección-ip>` por la dirección IP de tu servidor.

Ten en cuenta que la clave **pública** puede estar en muchos servidores, y que la clave **privada** sólo debes tenerla tú y GitHub o GitLab.

Ahora puedes conectarte al servidor sin tener que introducir una contraseña.

### Ejemplo de flujos de trabajo

#### Node.js (GitHub)

Utilice

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
          TARGET: "<directorio-objetivo>"
          SCRIPT_AFTER: |
            cd <directorio-objetivo>
            npm i --omit=dev
            <comando-de-inicio>
```

donde `<directorio-objetivo>` se sustituye por el nombre del directorio donde se almacena la construcción del bot en el servidor, y `<comando-de-inicio>` por el comando para iniciar tu bot, que puede ser por ejemplo una llamada a `pm2` o `systemctl`.

Este script realiza secuencialmente dos tareas: `build` y `deploy`.
Después de ejecutar `build`, el artefacto de esta tarea, es decir, el directorio `dist` que contiene la construcción del bot, se pasa a la tarea `deploy`.

Los archivos se envían al servidor utilizando la utilidad `rsync`, implementada por `easingthemes/ssh-deploy`.
Después de que los archivos se entregan al servidor, se ejecuta el comando descrito en la variable de entorno `SCRIPT_AFTER`.
En nuestro caso, después de que los archivos son entregados, vamos al directorio del bot, donde instalamos todas las dependencias excepto `devDependencies`, y reiniciamos el bot.

Ten en cuenta que necesitas añadir tres [variables de entorno secretas](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

1. `SSH_PRIVATE_KEY` --- aquí es donde la clave privada SSH que creaste en el [paso anterior](#claves-ssh) debe ser almacenada.
2. `REMOTE_HOST` --- la dirección IP de su servidor debe ser almacenada aquí.
3. `REMOTE_USER` --- el nombre del usuario en cuyo nombre se lanza el bot debe ser almacenado aquí.

#### Node.js (GitLab)

Utilice

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
    - rsync --delete -az dist package.json package-lock.json $REMOTE_USER@$REMOTE_HOST:<directorio-objetivo>
    - ssh $REMOTE_USER@$REMOTE_HOST "cd <directorio-objetivo> && npm i --omit=dev && <comando-de-inicio>"
```

donde `<directorio-objetivo>` se sustituye por el nombre del directorio donde se almacena la construcción del bot en el servidor, y `<comando-de-inicio>` por el comando para iniciar tu bot, que puede ser por ejemplo una llamada a `pm2` o `systemctl`.

Este script realiza secuencialmente dos tareas: `build` y `deploy`.
Después de ejecutar `build`, el artefacto de esta tarea, es decir, el directorio `dist` que contiene la construcción del bot, se pasa a la tarea `deploy`.

Los archivos se entregan al servidor utilizando la utilidad `rsync`, que debemos instalar antes de ejecutar el script principal.
Después de que los archivos son entregados, nos conectamos al servidor usando SSH para ejecutar un comando para instalar todas las dependencias excepto `devDependencies` y reiniciar la aplicación.

Ten en cuenta que necesitas añadir tres [variables de entorno](https://docs.gitlab.com/ee/ci/variables):

1. `SSH_PRIVATE_KEY` --- aquí es donde la clave privada SSH que creaste en el [paso anterior](#claves-ssh) debe ser almacenada.
2. `REMOTE_HOST` --- la dirección IP de su servidor debe ser almacenada aquí.
3. `REMOTE_USER` --- el nombre del usuario en cuyo nombre se lanza el bot debe ser almacenado aquí.

#### Deno (GitHub)

Utilice

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
          TARGET: "<directorio-objetivo>"
          SCRIPT_AFTER: |
            cd <directorio-objetivo>
            <comando-de-inicio>
```

donde `<directorio-objetivo>` se sustituye por el nombre del directorio donde se almacena la construcción del bot en el servidor, y `<comando-de-inicio>` por el comando para iniciar tu bot, que puede ser por ejemplo una llamada a `pm2` o `systemctl`.

Este script envía los archivos al servidor usando la utilidad `rsync`, implementada por `easingthemes/ssh-deploy`.
Después de que los archivos son enviados al servidor, se ejecuta el comando descrito en la variable de entorno `SCRIPT_AFTER`.
En nuestro caso, después de que los archivos son entregados, vamos al directorio del bot y reiniciamos el bot.

Ten en cuenta que necesitas añadir tres [variables de entorno secretas](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

1. `SSH_PRIVATE_KEY` --- aquí es donde la clave privada SSH que creaste en el [paso anterior](#claves-ssh) debe ser almacenada.
2. `REMOTE_HOST` --- la dirección IP de su servidor debe ser almacenada aquí.
3. `REMOTE_USER` --- el nombre del usuario en cuyo nombre se lanza el bot debe ser almacenado aquí.

#### Deno (GitLab)

Utilice

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
    - rsync --delete -az src deno.jsonc deno.lock $REMOTE_USER@$REMOTE_HOST:<directorio-objetivo>
    - ssh $REMOTE_USER@$REMOTE_HOST "cd <directorio-objetivo> && npm i --omit=dev && <comando-de-inicio>"
```

donde `<directorio-objetivo>` se sustituye por el nombre del directorio donde se almacena la compilación del bot en el servidor, y `<comando-de-inicio>` por el comando para iniciar tu bot, que puede ser por ejemplo una llamada a `pm2` o `systemctl`.

Este script envía archivos al servidor usando `rsync`, que tiene que ser instalado previamente.
Una vez copiados los archivos, nos conectamos al servidor usando SSH para reiniciar el bot.

Ten en cuenta que necesitas añadir tres [variables de entorno](https://docs.gitlab.com/ee/ci/variables):

1. `SSH_PRIVATE_KEY` --- es donde se debe almacenar la clave privada SSH que creaste en el [paso anterior](#claves-ssh).
2. `REMOTE_HOST` --- la dirección IP de su servidor debe ser almacenada aquí.
3. `REMOTE_USER` --- el nombre del usuario en cuyo nombre se lanza el bot.

Ahora deberías ver cómo cada push de código a la rama `main` se desplegará automáticamente en tu VPS.
Desarrollo irá brrrrr :rocket:
