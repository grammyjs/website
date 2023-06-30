---
prev: false
next: false
---

# Conjunto de middlewares útiles

Seguí reescribiendo los mismos middlewares una y otra vez para todos mis bots así que decidí extraerlos todos a un paquete separado.

## Instalación

`yarn add grammy-middlewares`

## Uso

Todos los accesos al middleware son factories, aunque no todos tienen que serlo.
He decidido hacer la API homogénea.

Algunas de las factories consumen parámetros opcionales o requeridos.

```ts
import {
  ignoreOld,
  onlyAdmin,
  onlyPublic,
  onlySuperAdmin,
  sequentialize,
} from "grammy-middlewares";

// ...

bot.use(
  ignoreOld(),
  onlyAdmin((ctx) => ctx.reply("Sólo los administradores pueden hacer esto")),
  onlyPublic((ctx) => ctx.reply("Sólo puedes usar los chats públicos")),
  onlySuperAdmin(env.SUPER_ADMIN_ID),
  sequentialize(),
);
```

## Middlewares

### `ignoreOld`

Ignora las actualizaciones antiguas, útil cuando el bot ha estado inactivo durante un tiempo.
Puedes especificar opcionalmente el tiempo de espera en segundos que por defecto es de `5 * 60`.

### `onlyAdmin`

Comprueba si el usuario es un administrador.
Puedes especificar opcionalmente `errorHandler` que es llamado con el contexto si el usuario no es un administrador.

### `onlyPublic`

Comprueba si es un chat de grupo o un canal.
Puedes especificar opcionalmente `errorHandler` que se llama con el contexto si no es un chat de grupo o un canal.

### `onlySuperAdmin`

Comprueba si el usuario es un superadministrador.
Tienes que proporcionar el id de superadministrador.

### `sequentialize`

El middleware básico [sequentialize](../advanced/scaling#la-concurrencia-es-dificil) que toma el id del chat como identificador secuencial.

## Resumen del plugin

- Nombre: `grammy-middlewares`
- Fuente: <https://github.com/backmeupplz/grammy-middlewares>
- Referencia: <https://github.com/backmeupplz/grammy-middlewares>
