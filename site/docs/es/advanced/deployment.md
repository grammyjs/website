# Lista de verificaciones en despliegues

Lista de cosas a tener en cuanta cuando vayas a alojar un bot grande.

> Puede que estes interesado en nuestras guías para alojar un bot.
> Mira **Alojamiento / Tutoriales** en el principio de la página para ver algunas de las plataformas que ya tienen guías dedicadas.

## Errores

1. [Instala un manejador de errores con `bot.catch` (long polling) o en tu web framework (webhooks).](../guide/errors)
2. Usa `await` en todas las promesas e instala **linting**, con reglas que obliguen a esto, así nunca te olvidas.

## Envío de mensajes

1. Envía ficheros por ruta o `Buffer` en vez de `Stream`,o al menos estate seguro de que [conoces las trampas](./transformers#casos-de-uso-de-las-funciones-de-transformacion).
2. Usa `bot.on("callback_query:data")` como un manejador alternativo para [reaccionar a todas las consultas de devolución de llamada](../plugins/keyboard#respondiendo-a-las-pulsaciones-del-teclado-en-linea).
3. Utilice el plugin [`auto-retry`](../plugins/auto-retry) para manejar automáticamente los errores de espera.

## Escalando servidores

Esto depende del tipo de despliegue.

### Long Polling

1. [Usa grammY runner.](../plugins/runner)
2. [Usa `sequentialize` con el mismo id de sesión que tu middleware de sesión.](./scaling#la-concurrencia-es-dificil)
3. Revise las opciones de configuración de `run` ([referencia de la API](/ref/runner/run)) y asegúrese de que se ajustan a sus necesidades, o incluso considere la posibilidad de componer su propio corredor a partir de [sources](/ref/runner/updatesource) y [sinks](/ref/runner/updatesink).
   Lo principal a tener en cuenta es la carga máxima que quiere aplicar a su servidor, es decir, cuántas actualizaciones pueden procesarse al mismo tiempo.
4. Considere implementar un [apagado gradual](../advanced/reliability#apagado-correcto) para parar tu bot cuando tu quieres terminar con él (e.j. cambiar a una nueva versión).

### Webhooks

1. Asegúrese de no realizar ninguna operación de larga duración en su middleware, como las transferencias de archivos de gran tamaño. [Esto lleva a errores de tiempo de espera](../guide/deployment-types#terminar-las-solicitudes-de-webhooks-a-tiempo) para los webhooks, y el procesamiento de actualizaciones duplicadas, ya que Telegram reenviará las actualizaciones no reconocidas. Considere la posibilidad de utilizar un sistema de cola de tareas en su lugar.
2. Familiarícese con la configuración de `webhookCallback` ([referencia de la API](/ref/core/webhookcallback)).
3. Si cambiaste la opción `getSessionKey` por la de tu sesión, [usa `sequentialize` con la misma función de resolución de claves de sesión que su middleware de sesión](./scaling#la-concurrencia-es-dificil).
4. Si se ejecuta en una plataforma sin servidor o de autoescalado, [establezca la información del bot](/ref/core/botconfig) para prevenir excesivas llamadas `getMe`.
5. Considere utilizar [webhook replies](../guide/deployment-types#webhook-reply).

## Sesiones

1. Considere usar `lazySessions` explicadas [aquí](../plugins/session#lazy-sessions).
2. Use la opción `storage` para configurar su adaptador de almacenamiento, de lo contrario todos los datos se perderán cuando el proceso del bot se detenga.

## Tests

Escribe tests para tu bot. Esto se puede hacer con grammY así

1. Simular las peticiones salientes de la API utilizando [funciones de transformación](./transformers).
2. Define y envía ejemplos de actualización a tu bot via `bot.handleUpdate` ([referencia API](/ref/core/bot#handleupdate)). Considere inspirarse en [estos ejemplos](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates) proporcionados por el equipo de Telegram.

::: tip Contribuye al framework de testing.
Aunque grammY proporciona lo necesario para empezar a escribir tests, sería muy útil tener un framework para los bots.
Este es un territorio novedoso, tales frameworks no existen en gran medida.
¡Esperamos tus contribuciones!.
:::
