---
next: ./guide.html
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

## Tipos de Plugins en grammY

Todo lo que brilla es oro, ¿verdad?
Bueno, ¡un tipo diferente de oro!
grammY puede aprovechar dos tipos de plugins: _plugins middleware_ y _plugins transformadores_.
En términos simples, los plugins en grammY devuelven una función middleware o una función transformadora.
Hablemos de las diferencias.

### Tipo I: Plugins Middleware

[Middleware](/guide/middleware.md) es una función que maneja los datos entrantes en varias formas.
Los plugins de middleware son plugins que se introducen en un bot como -bueno, lo has adivinado- middleware.
Esto significa que se instalan a través de `bot.use`.

### Tipo II: Plugins transformadores

Una [función transformadora](/advanced/transformers.md) es lo contrario del middleware.
Es una función que maneja los datos de salida.
Los plugins transformadores son plugins que se introducen en un bot como una función transformadora (¡lo has adivinado!).
Esto significa que los instalas a través de `bot.api.config.use`.

## Crear tus propios plugins

Si quieres desarrollar un plugin y compartirlo con otros usuarios (incluso publicarlo en la web oficial de grammY), hay una [guía útil](./guide.md) que puedes consultar.

## Ideas para más plugins

Estamos recogiendo ideas para nuevos plugins [en GitHub en este tema](https://github.com/grammyjs/grammY/issues/110).
