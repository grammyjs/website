---
next: ./guide.md
---

# ¿Qué es un plugin?

Queremos que grammY sea conciso y mínimo, pero extensible.
¿Por qué?
Porque no todo el mundo utiliza todo.
Los plugins están diseñados como funcionalidades extra añadidas a dichas piezas de software.

## Plugins en grammY

Algunos plugins están directamente **integrados** en la biblioteca central de grammY porque asumimos que muchos bots los necesitan.
Esto hace que sea más fácil para los nuevos usuarios utilizarlos, sin tener que instalar un nuevo paquete primero.

La mayoría de los plugins se publican junto al paquete principal de grammY, los llamamos **complementos oficiales**.
Se instalan desde `@grammyjs/*` en npm, y se publican bajo la organización [@grammyjs](https://github.com/grammyjs) en GitHub.
Coordinamos sus lanzamientos con los lanzamientos de grammY, y nos aseguramos de que todo funcione bien en conjunto.
Cada sección de la documentación de un plugin oficial tiene el nombre del paquete en su título.
Como ejemplo, el plugin [grammY runner](./runner.md) (`runner`) necesita ser instalado vía `npm install @grammyjs/runner`.
(Si estás usando Deno y no Node.js, debes importar el plugin desde <https://deno.land/x/> en su lugar, es decir, desde el archivo `mod.ts` del módulo `grammy_runner`).

También hay algunos plugins de **terceros**.
Cualquiera puede publicarlos.
No garantizamos que estén actualizados, bien documentados o que funcionen con otros plugins.
Si quieres, tu propio plugin de terceros también puede aparecer en el sitio web para que más gente pueda conocerlo.

## Visión general

Hemos compilado una visión general para usted con breves descripciones para cada plugin.
Instalar plugins es divertido y fácil, y queremos que sepas lo que tenemos para ti.

> Haga clic en el nombre de cualquier paquete para obtener más información sobre el respectivo plugin.

| Plugin                             | Paquete                                               | Descripción                                                                 |
| ---------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| Sesiones                           | _incluido_                                            | Almacena los datos de los usuarios en su base de datos                      |
| Teclados en línea y personalizados | _incluido_                                            | Simplifica la construcción de teclados en línea y personalizados            |
| Auto-reintento                     | [`auto-retry`](./auto-retry.md)                       | Gestiona automáticamente la limitación de la velocidad                      |
| Conversaciones                     | [`conversations`](./conversations.md)                 | Construir potentes interfaces y diálogos conversacionales                   |
| Emojis                             | [`emoji`](./emoji.md)                                 | Simplificar el uso de emoji en el código                                    |
| Archivos                           | [`files`](./files.md)                                 | Fácil manejo de archivos                                                    |
| Hidratar                           | [`hydrate`](./hydrate.md)                             | Llamar a los métodos de los objetos devueltos por las llamadas a la API     |
| Internacionalización               | [`i18n`](./i18n.md) or [`fluent`](./fluent.md)        | Deja que tu bot hable varios idiomas                                        |
| Menús interactivos                 | [`menu`](./menu.md)                                   | Diseñe menús de botones dinámicos con navegación flexible                   |
| Parsear                            | [`parse-mode`](./parse-mode.md)                       | Simplificar el formato de los mensajes                                      |
| Limitador de velocidad             | [`ratelimiter`](./ratelimiter.md)                     | Restringe automáticamente a los usuarios que envían spam a tu bot           |
| Enrutador                          | [`router`](./router.md)                               | Dirija los mensajes a diferentes partes de su código                        |
| Concurrencia                       | [`runner`](./runner.md)                               | Long polling csimultáneo a escala                                           |
| Preguntas sin estado               | [`stateless-question`](./stateless-question.md)       | Crear diálogos sin almacenamiento de datos                                  |
| Control de flujo                   | [`transformer-throttler`](./transformer-throttler.md) | Poner en cola automáticamente las llamadas a la API para evitar las esperas |

También tenemos algunos plugins de terceros.
Puedes encontrarlos en el menú de navegación en _Complementos_ > _De Terceros_.
Asegúrese de comprobarlos también.

## Tipos de Plugins en grammY

Todo lo que brilla es oro, ¿verdad?
Bueno, ¡un tipo diferente de oro!
grammY puede aprovechar dos tipos de plugins: _plugins middleware_ y _plugins transformadores_.
En términos simples, los plugins en grammY devuelven una función middleware o una función transformadora.
Hablemos de las diferencias.

### Tipo I: Plugins Middleware

[Middleware](../guide/middleware.md) es una función que maneja los datos entrantes en varias formas.
Los plugins de middleware son plugins que se introducen en un bot como -bueno, lo has adivinado- middleware.
Esto significa que se instalan a través de `bot.use`.

### Tipo II: Plugins transformadores

Una [función transformadora](../advanced/transformers.md) es lo contrario del middleware.
Es una función que maneja los datos de salida.
Los plugins transformadores son plugins que se introducen en un bot como una función transformadora (¡lo has adivinado!).
Esto significa que los instalas a través de `bot.api.config.use`.

## Crear tus propios plugins

Si quieres desarrollar un plugin y compartirlo con otros usuarios (incluso publicarlo en la web oficial de grammY), hay una [guía útil](./guide.md) que puedes consultar.

## Ideas para más plugins

Estamos recogiendo ideas para nuevos plugins [en GitHub en este tema](https://github.com/grammyjs/grammY/issues/110).
