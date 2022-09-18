# Alojamiento: VPS <Badge text="Deno" /><Badge text="Node.js" type="warning"/>

Un servidor virtual privado, mayormente conocido como VPS, es una máquina virtual que se ejecuta en la nube y cuyos usuarios tienen el control total de su sistema.

En esta guía, aprenderás varios métodos para ejecutar tu bot en un VPS, manteniéndolo en línea 24/7, haciendo que se ejecute automáticamente cuando tu VPS se inicie y se reinicie en caso de caída.

## systemd

systemd es un potente gestor de servicios que viene preinstalado en muchas distribuciones de Linux, principalmente las basadas en Debian.

### Obteniendo el comando de inicio

1. Obtenga la ruta completa de su tiempo de ejecución:

```bash
# Si se utiliza Deno
which deno

# Si se utiliza Node.js
which node
```

2. También debes tener la ruta completa de tu archivo de entrada.

3. Tu comando de inicio debería ser como el siguiente

```bash
<ruta_de_entrada_completa> <opciones> <ruta_de_archivo_de_entrada_completa>

# Ejemplo de Deno:
# /home/user/.deno/bin/deno --allow-all /home/user/bot1/mod.ts

# Ejemplo de Node.js:
# /home/user/.nvm/versions/node/v16.9.1/bin/node /home/user/bot1/index.js
```

### Creación del servicio

1. Ve al directorio de servicios:

```bash
cd /etc/systemd/system
```

2. Abre tu nuevo archivo de servicio con un editor:

```bash
nano bot1.service
```

3. Añade el siguiente contenido:

```text
[Service]
ExecStart=<comando_de_inicio>
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

> Sustituye `<comando_de_inicio>` por el comando que tienes arriba.

3. Recarga systemd cada vez que edites el servicio:

```bash
systemctl daemon-reload
```

### Manejando el servicio

#### Iniciar

```bash
systemctl start <nombre_del_servicio>
```

> Sustituye `<service_name>` por el nombre del archivo del servicio.
> Ejemplo: `systemctl start bot1`.

#### Ejecutar en el arranque

```bash
systemctl enable <nombre_del_servicio>
```

#### Comprobar los registros

```bash
systemctl status <nombre_del_servicio>
```

#### Reiniciar

```bash
systemctl restart <nombre_del_servicio>
```

#### Detener

```bash
systemctl stop <nombre_del_servicio>
```

#### No ejecutar en el arranque

```bash
systemctl disable <nombre_del_servicio>
```

## PM2 (sólo Node.js)

PM2 es un gestor de procesos daemon para Node.js que te ayudará a gestionar y mantener tu aplicación online 24/7.

### Instalando

```bash
npm install pm2@latest -g

# Si usas Yarn
yarn global add pm2
```

### Gestión de aplicaciones

#### Inicio

```bash
pm2 start --name <nombre_de_la_aplicación> <punto_de_entrada>
```

> El `<nombre_de_la_aplicación>` puede ser cualquier identificador de tu aplicación, por ejemplo: `bot1`.
> El `<punto_de_entrada>` debe ser la ruta de tu archivo de índice (que ejecuta tu bot).

#### Reinicio

Al reiniciar, detienes la aplicación y la vuelves a iniciar.

```bash
pm2 restart <nombre_de_la_aplicación>
```

#### Recargar

Al recargar, reemplazas el proceso actual de tu aplicación con uno nuevo, lo que resulta en un tiempo de inactividad de 0 segundos.
Esto se recomienda para aplicaciones sin estado.

```bash
pm2 reload <nombre_de_la_aplicación>
```

#### Stop

```bash
# Una sola aplicación
pm2 stop <nombre_de_la_aplicación>

# Todas las aplicaciones
pm2 stop all
```

#### Eliminar

Al borrar, detienes tu aplicación y eliminas sus registros y métricas.

```bash
pm2 del <nombre_de_la_aplicación>
```

### Información avanzada

Para más información, consulte <https://pm2.keymetrics.io/docs>.
