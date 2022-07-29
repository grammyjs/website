---
prev: ./middleware.md
next: ./inline-queries.md
---

# Manejo de errores

Cada uno de los errores causados por tu middleware será capturado por grammY.
Deberías instalar un manejador de errores personalizado para manejar los errores.

Lo más importante, esta sección te enseñará [cómo atrapar errores](#catching-errors) que pueden ser lanzados.

Después, veremos los tres tipos de errores que tu bot puede encontrar.

| Nombre                                   | Propósito                                                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| [`BotError`](#the-boterror-object)       | Objeto de error que envuelve cualquier error lanzado en su middleware (por ejemplo, los dos errores siguientes)           |
| [`GrammyError`](#the-grammyerror-object) | Lanzado si el servidor de la API del Bot devuelve `ok: false`, indicando que su solicitud de la API no era válida y falló |
| [`HttpError`](#the-httperror-object)     | Se lanza si no se puede acceder al servidor de la API del Bot                                                             |

Un mecanismo más avanzado de manejo de errores se puede encontrar [aquí abajo](#error-boundaries).

## Atrapando Errores

La forma de capturar los errores dependerá de su configuración.

### Long Polling

Si ejecutas tu bot a través de `bot.start()`, o si estás usando [grammY runner](../plugins/runner.md), entonces deberías **instalar un manejador de errores a través de `bot.catch`**.

grammY tiene instalado un controlador de errores por defecto que detiene el bot si fue iniciado por `bot.start()`.
Entonces vuelve a lanzar el error.
Depende de la plataforma lo que sucederá después.
Por eso **deberías instalar un manejador de errores a través de `bot.catch`**.

Ejemplo:

```ts
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error mientras manejas el update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error en la request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("No se pudo contactar con Telegram:", e);
  } else {
    console.error("Error desconocido:", e);
  }
});
```

### Webhooks

Si ejecutas tu bot a través de webhooks, grammY pasará el error al framework web que utilices, por ejemplo `express`.
Debe manejar los errores de acuerdo con las convenciones de ese framework.

## El Objeto `BotError`

El objeto `BotError` agrupa un error lanzado con el correspondiente [objeto contexto](./context.md) que causó el error.
Esto funciona de la siguiente manera.

Cualquiera que sea el error que se produzca mientras se procesa una actualización, grammY capturará el error lanzado por usted.
A menudo es útil acceder al objeto de contexto que causó el error.

grammY no toca el error lanzado de ninguna manera, sino que lo envuelve en una instancia de `BotError`.
Dado que ese objeto se llama `err`, puedes acceder al error original a través de `err.error`.
Puedes acceder al objeto de contexto respectivo a través de `err.ctx`.

Consulta la clase `BotError` en la [Referencia de la API de grammY](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/BotError).

## El Objeto `GrammyError`

Si un método de la API como `sendMessage` falla, grammY lanzará un `GrammyError`.
Ten en cuenta que también las instancias de `GrammyError` se envolverán en objetos `BotError` si se lanzan en el middleware.

Un `GrammyError` lanzado indica que la correspondiente solicitud de la API ha fallado.
El error proporciona acceso al código de error devuelto por el backend de Telegram, así como a la descripción.

Consulta la clase `GrammyError` en la [Referencia de la API de grammY](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/GrammyError).

## El Objeto `HttpError`

Un `HttpError` es lanzado si una petición de red falla.
Esto significa que grammY no pudo contactar con el servidor de la API del Bot.
El objeto de error contiene información sobre la razón por la que la petición falló, que está disponible bajo la propiedad `error`.

Raramente verás este tipo de error, a menos que tu infraestructura de red sea inestable, o que el servidor del Bot API de tu bot esté temporalmente fuera de línea.

> Ten en cuenta que si se puede contactar con el servidor de la API del bot, pero devuelve `ok: false` para una llamada a un método determinado, se lanza un [`GrammyError`](../guide/errors.md#the-grammyerror-object) en su lugar.

Consulta la clase `HttpError` en la [Referencia de la API de grammY](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/HttpError).

## Error Boundaries

> Este es un tema avanzado que es principalmente útil para los bots más grandes.
> Si eres relativamente nuevo en grammY, simplemente salta el resto de esta sección.

Si divides tu base de código en diferentes partes, los _error boundaries_ te permiten instalar diferentes manejadores de error para diferentes partes de tu middleware.
Logran esto al permitirte cercar los errores en una parte de tu middleware.
En otras palabras, si un error es lanzado en una parte especialmente protegida del middleware, no será capaz de escapar de esa parte del sistema de middleware.
En su lugar, se invoca un manejador de errores dedicado, y la parte rodeada del middleware pretende completar con éxito.
Esta es una característica del sistema de middleware de grammY, por lo que los límites de error no se preocupan de si estás ejecutando tu bot con webhooks o con un sondeo largo.

Opcionalmente, puedes elegir dejar que la ejecución del middleware se reanude normalmente después de que el error haya sido manejado, continuando justo fuera del límite de error.
En ese caso, el middleware vallado no sólo actúa como si se hubiera completado con éxito, sino que también pasa el flujo de control al siguiente middleware que se instaló después del límite del error.
Así, parece que el middleware dentro del límite de error ha llamado a `next`.

```ts
const bot = new Bot("");

bot.use(/* A */);
bot.use(/* B */);

const composer = new Composer();
composer.use(/* X */);
composer.use(/* Y */);
composer.use(/* Z */);
bot.errorBoundary(boundaryHandler /* , Q */).use(composer);

bot.use(/* C */);
bot.use(/* D */);

bot.catch(errorHandler);

function boundaryHandler(err: BotError, next: NextFunction) {
  console.error("Error en Q, X, Y, or Z!", err);
  /*
   * Puedes llamar a `next` si quieres ejecutar
   * el middleware en C en caso de error:
   */
  // await next()
}

function errorHandler(err: BotError) {
  console.error("Error en A, B, C, or D!", err);
}
```

En el ejemplo anterior, el `boundaryHandler` será invocado para

1. todos los middlewares que se pasan a `bot.errorBoundary` después de `boundaryHandler` (es decir, `Q`), y
2. todos los middlewares que se instalan en las instancias de compositor instaladas posteriormente (es decir, `X`, `Y` y `Z`).

> En cuanto al punto 2, es posible que desee saltar a la [explicación avanzada](../advanced/middleware.md) de middleware para aprender cómo funciona el encadenamiento en grammY.

También se puede aplicar un límite de error a un compositor sin llamar a `bot.errorBoundary`:

```ts
const composer = new Composer();

const protected = composer.errorBoundary(boundaryHandler);
protected.use(/* B */);

bot.use(composer);
bot.use(/* C */);

bot.catch(errorHandler);

function boundaryHandler(err: BotError, next: NextFunction) {
  console.error("Error in B!", err);
}

function errorHandler(err: BotError) {
  console.error("Error in C!", err);
}
```

El `boundaryHandler` del ejemplo anterior será invocado para los middlewares vinculados a `protected`.

Si quieres activamente que el error cruce un límite (es decir, pasarlo fuera), puedes volver a lanzar el error dentro de tu manejador de errores.
El error será entonces pasado a la siguiente frontera circundante.

En cierto sentido, puedes considerar el manejador de errores instalado a través de `bot.catch` como el límite de error más externo.
