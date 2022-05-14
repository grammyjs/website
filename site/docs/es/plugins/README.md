---
next: ./guide.md
---

# Plugins en grammY

grammY soporta la instalación de plugins, la mayoría de ellos a través de la adición de nuevos [middleware](/guide/middleware.md) o [transformer functions](/advanced/transformers.md).

## Categorías de plugins

Algunos plugins están directamente **integrados** en la biblioteca central de grammY porque asumimos que muchos bots los necesitan.
Esto hace que sea más fácil para los nuevos usuarios utilizarlos, sin tener que instalar un nuevo paquete primero.

La mayoría de los plugins se publican junto al paquete principal de grammY, los llamamos **complementos oficiales**.
Se instalan desde `@grammyjs/*` en npm, y se publican bajo la organización [@grammyjs](https://github.com/grammyjs) en GitHub.
Coordinamos sus lanzamientos con los lanzamientos de grammY, y nos aseguramos de que todo funcione bien en conjunto.
Cada sección de la documentación de un plugin oficial tiene el nombre del paquete en su título.
Como ejemplo, el plugin [grammY runner](./runner.md) (`runner`) necesita ser instalado vía `npm install @grammyjs/runner`.
(Si estás usando Deno y no Node.js, debes importar el plugin desde <https://deno.land/x/> en su lugar, es decir, desde el archivo `mod.ts` del módulo `grammy_runner`).

> Si quieres publicar tu propio paquete como un plugin oficialmente soportado, simplemente envíanos un ping en el [chat de la comunidad](https://t.me/grammyjs) y haznos saber lo que estás planeando, entonces podemos concederte acceso de publicación a GitHub y npm.
> Serás responsable de mantener tu código (pero quizás otros quieran unirse).

Puedes decidir publicar tu paquete de forma independiente como un **tercero**.
En ese caso, aún podemos ofrecerle un lugar destacado en este sitio web:

## Enviar su propio plugin a los Docs

Si eres el autor de una librería que puede ayudar a otros usuarios de grammY, puedes enviar un PR en GitHub que añada una página para ella en la web oficial de grammY (esta).
Esto permitirá a otros usuarios encontrarla, y te da una forma sencilla de tener una buena documentación.

Aquí hay algunas cosas que esperamos de tu plugin si quieres que aparezca aquí.

1. Tiene un archivo README en GitHub (y npm) con instrucciones de cómo usarlo.
2. Su PR añade una página que incluye contenido significativo sobre

   - qué problema resuelve tu plugin, y
   - cómo utilizarlo.

   En el caso más sencillo, puedes copiar el texto de tu archivo README.

3. Es un software de código abierto que se publica bajo una licencia permisiva, preferiblemente MIT (como grammY), o ISC.

Sería genial que tu plugin también funcionara con Deno, y moveremos esos plugins al principio de la lista.
Sin embargo, la compatibilidad con Deno no es un requisito estricto.

## Ideas para más plugins

Estamos recogiendo ideas para nuevos plugins [en GitHub en este tema](https://github.com/grammyjs/grammY/issues/110).
