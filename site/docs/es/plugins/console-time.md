---
prev: false
---

# Registro en la consola mientras se depura

Si estás familiarizado con JavaScript / TypeScript probablemente hayas utilizado [`console.log`](https://developer.mozilla.org/en-US/docs/Web/API/Console/log) o [`console.time`](https://developer.mozilla.org/en-US/docs/Web/API/Console/time) para comprobar lo que está sucediendo mientras depuras algo.
Mientras trabajas en tu bot o middleware puede que quieras comprobar algo similar: ¿Qué ha pasado y cuánto tiempo ha tardado?

Este plugin está interesado en peticiones individuales para depurar problemas individuales.
Estando en un entorno de producción, probablemente quieras algo opuesto para tener una visión general.
Por ejemplo: al depurar por qué falla `/start` comprobarás la actualización individual de Telegram.
En un contexto de producción estás más interesado en todos los mensajes `/start` que están ocurriendo.
Esta librería está pensada para ayudar con las actualizaciones individuales.

## Depurar tu implementación

```ts
import { generateUpdateMiddleware } from "telegraf-middleware-console-time";

if (process.env.NODE_ENV !== "production") {
  bot.use(generateUpdateMiddleware());
}

// Tu implementación
bot.command("start" /* , ... */);
```

que dará salida a cosas como esta:

```text
2020-03-31T14:32:36.974Z 490af message text Edgar 6 /start: 926.247ms
2020-03-31T14:32:57.750Z 490ag message text Edgar 6 /start: 914.764ms
2020-03-31T14:33:01.188Z 490ah message text Edgar 5 /stop: 302.666ms
2020-03-31T14:46:11.385Z 490ai message text Edgar 6 /start: 892.452ms
```

El `490af` es el `update_id`.

El número que precede a los comandos es la longitud total del contenido.
Esto es útil cuando se considera la longitud máxima para cosas como los datos de devolución de llamada.

El contenido en sí se acorta para evitar el spam de los registros.

## Depurar tu middleware

Cuando creas tu propio middleware o asumes los tiempos lentos de otro middleware puedes usar estos middlewares para crear un perfil de tiempos.

```ts
import {
  generateAfterMiddleware,
  generateBeforeMiddleware,
} from "telegraf-middleware-console-time";

const bot = new Bot("");

// Utiliza BeforeMiddleware antes de cargar el middleware probado.
bot.use(generateBeforeMiddleware("foo"));

// Middleware a probar
bot.use(/* ... */);

// Usar AfterMiddleware después de cargar el middleware que se está probando (con la misma etiqueta).
bot.use(generateAfterMiddleware("foo"));

// Otros middleware/implementaciones (tomarán la cantidad de tiempo "interna" cuando se usen).
bot.use(/* ... */);
bot.on("message" /* ... */);
```

El resultado será algo así:

```text
490ai foo before: 304.185ms
490ai foo inner: 83.122ms
490ai foo after: 501.028ms
490ai foo total: 891.849ms
```

Esto indica que el middleware comprobado por sí solo tardó 800ms y no tiene el rendimiento que quizás se necesita.

## Resumen del plugin

- Fuente: <https://github.com/EdJoPaTo/telegraf-middleware-console-time>
