---
next: false
---

# Cómo se compara grammY con otros frameworks de bots

Aunque grammY utiliza algunos conceptos conocidos de otros frameworks de bots (y frameworks web), fue escrito desde cero para una óptima legibilidad y rendimiento.

> Por favor, asuma que esta comparación está sesgada, aunque estamos tratando de proporcionarle una descripción objetiva de las ventajas y desventajas de usar grammY sobre el uso de otras bibliotecas.
> Estamos tratando de mantener las cosas en este artículo actualizadas.
> Si notas que algo está desactualizado, por favor edita esta página usando el enlace al final.

## Comparación con otros Frameworks de JavaScript

::: tip Elige primero tu lenguaje de programación
Dado que estás leyendo la documentación de un framework dentro del ecosistema JavaScript, es probable que estés buscando algo que funcione en Node.js o Deno.
Sin embargo, si ese no es tu caso, [desplázate hacia abajo](#comparacion-con-frameworks-en-otros-lenguajes-de-programacion) para ver una comparación de qué lenguajes de programación son adecuados para el desarrollo de bots.
Naturalmente, también encontrarás una breve comparación con frameworks de otros lenguajes (principalmente Python).
:::

Hay dos proyectos principales en los que grammY se inspira, a saber, [Telegraf](https://github.com/telegraf/telegraf) y [NTBA](https://github.com/yagop/node-telegram-bot-api).
Nos centraremos en ellos por ahora, pero nosotros (¿o tú?) podemos añadir otras comparaciones en el futuro.

### Telegraf

grammY tiene sus raíces en Telegraf, así que aquí hay un breve resumen de cómo estos marcos se relacionan históricamente.

When grammY was created, Telegraf was an amazing library, and grammY would not be where it is without it.
Sin embargo, Telegraf solía estar escrito en JavaScript (en la v3).
Las raras anotaciones de tipo eran añadidas manualmente y mal mantenidas, por lo que estaban incompletas, incorrectas y anticuadas.
Las anotaciones de tipo fuertes son un aspecto crucial de cualquier biblioteca seria por el soporte de herramientas que permiten, y porque le permite iterar significativamente más rápido en su base de código.
Mucha gente prefiere tener seguridad de tipos cuando se desarrolla un bot complejo, y para algunos es un punto de inflexión no ofrecerla.

Telegraf v4 intentó arreglar esto migrando todo el código base a TypeScript.
Desgraciadamente, muchos de los tipos resultantes eran tan complejos que resultaban demasiado difíciles de entender (pero correctos).
Además, la migración reveló innumerables rarezas ([ejemplo](https://github.com/telegraf/telegraf/issues/1076)) en la base de código que hizo que fuera doloroso incluso encontrar tipos correctos para el código existente.

Como resultado, aunque la versión 4.0 intentó _mejorar_ la corrección y el soporte de herramientas, terminó haciendo a Telegraf sustancialmente _más difícil de usar_ que su predecesor no tipado.
Es comprensible que muchos usuarios de Telegraf 3 no quisieran actualizarse.
También se hizo más difícil para los nuevos usuarios empezar.

**grammY da un paso atrás y replantea un marco de trabajo de bots de tipo seguro con la accesibilidad en primer lugar.**
Esto permitió saltarse muchas de las frustrantes discusiones sobre cómo lidiar con extrañas tipografías internas.
Permitió al proyecto tener un código limpio, consistente y compilable que proporciona a los usuarios excelentes tipos (=soporte de editores).
La seguridad tipográfica a su vez permite características más avanzadas que cambian fundamentalmente la forma en que pensamos sobre el desarrollo de bots, como los [transformadores de la API](../advanced/transformers).

Aunque Telegraf 3 todavía es utilizado por muchos bots activos, la librería está ampliamente desactualizada.
Además, el ecosistema de plugins de Telegraf ha pasado a Telegraf 4 (al menos los que no fueron migrados a grammY).

Esta comparación sólo compara grammY con Telegraf 4.

He aquí una lista de razones por las que debería utilizar grammY en lugar de Telegraf.

- grammY siempre soporta la última versión de la API Bot.
  Telegraf a menudo se queda atrás por unas pocas versiones.
- grammY tiene una [documentación](../).
  Telegraf no lo hace---fue reemplazado por una referencia de API generada que carece de explicaciones, y las pocas guías que existen son incompletas y difíciles de encontrar.
- grammY adopta TypeScript, los tipos _simplemente funcionan_ y seguirán tu código.
  En Telegraf, a menudo necesitarás escribir tu código de cierta manera, de lo contrario no compila (aunque en realidad funcionara bien).
- grammY integra sugerencias de la [referencia oficial de la API del Bot](https://core.telegram.org/bots/api) en línea que te ayudan mientras estás codificando.
  Telegraf no te da ninguna explicación sobre tu código.
- Muchas más cosas, como mejor rendimiento, un gran ecosistema de plugins, documentación traducida para miles de millones de personas, mejor integración con bases de datos y frameworks web, mejor compatibilidad en tiempo de ejecución, una [extensión de VS Code](https://marketplace.visualstudio.com/items?itemName=grammyjs.grammyjs), y muchas otras cosas que irás descubriendo sobre la marcha.

He aquí una lista de razones por las que debería utilizar Telegraf en lugar de grammY.

- Ya tienes un bot grande escrito en Telegraf y realmente ya no trabajas en él.
  En ese caso, migrar a grammY puede llevarte más tiempo del que ahorrarás a largo plazo, no importa lo suave que sea la migración.
- Conoces Telegraf como la palma de tu mano y no te importa cambiar tu conjunto de habilidades.
  grammY introduce un número de conceptos novedosos que pueden ser desconocidos si sólo has usado Telegraf, y usar grammY significa que estarás expuesto a cosas nuevas.
- Hay algunos detalles en los que Telegraf y grammY usan una sintaxis diferente para conseguir lo mismo, y resulta que prefieres un estilo sobre el otro.
  Por ejemplo, Telegraf usa `bot.on(message("text"))` y grammY usa `bot.on("message:text")` para escuchar los mensajes de texto.

### NTBA

El paquete `node-telegram-bot-api` es el segundo gran proyecto que impactó en el desarrollo de grammY.
Su principal ventaja sobre otros frameworks es que es muy simple.
Su arquitectura se puede describir en una sola frase, mientras que grammY necesita una [guía](../guide/) en su sitio web de documentación para hacer lo mismo.
Creemos que todas estas explicaciones en el sitio web de grammY ayudan a la gente a empezar fácilmente, pero es tentador tener una biblioteca que no necesita ninguna explicación en primer lugar.

Lo malo es que esto sólo es bueno a corto plazo.
La idea de poner todo en un archivo gigantesco, y usar un primitivo `EventEmitter` para procesar flujos de objetos complejos (aka. peticiones web) ha traído mucho dolor al mundo de los bots de Telegram, y ciertamente impidió que un número de buenas ideas fueran implementadas.

Los bots siempre empiezan siendo pequeños, pero un marco de trabajo responsable debe proporcionarles un camino claro para crecer, y para escalar.
Desgraciadamente, la NTBA falla horriblemente en eso.
Cualquier base de código con más de 50 líneas que utilice NTBA acaba siendo un terrible lío de referencias cruzadas tipo espagueti.
Usted no quiere eso.

### Otros Frameworks

Actualmente no hay otras librerías TypeScript que merezca la pena usar para construir bots.
Todo excepto grammY, Telegraf, y NTBA está en gran parte sin mantenimiento y por lo tanto terriblemente desactualizado.

¿Acabas de crear una nueva biblioteca impresionante y aún no la conocemos?
No dudes en editar esta página y añadir una comparación---o dinos lo que piensas en el [chat de grupo](https://t.me/grammyjs)!

## Comparación con Frameworks en otros lenguajes de programación

Hay razones para favorecer un lenguaje de programación diferente a TypeScript.
Lo más importante es que te guste trabajar con tus herramientas y lenguajes.
Si está decidido a seguir con otro idioma, puede dejar de leer aquí.

Dado que todavía estás leyendo, es posible que quieras saber por qué grammY está escrito en TypeScript, y por qué tal vez deberías considerar elegir este lenguaje para tu bot, también.

Esta sección resumirá cómo TypeScript tiene algunas ventajas sobre otros lenguajes cuando se trata de desarrollar bots para Telegram.
Esta comparación se limitará a Python, Go y Rust.
Siéntete libre de añadir más secciones si quieres contrastar TypeScript con otro lenguaje.

Algunos de los siguientes puntos se basan parcialmente en opiniones personales.
La gente tiene diferentes gustos, así que toma esta sección con un grano de sal.

### Frameworks escritos en Python

Se puede hacer un caso claro al comparar TypeScript con Python.
Elige TypeScript y disfrutarás:

1. **Mejores herramientas de edición.**
   Las anotaciones de tipo de grammY son excepcionales.
   Aunque Python introdujo tipos en su versión 3.5, no se utilizan tan comúnmente en el ecosistema como es el caso de JavaScript/TypeScript.
   Por lo tanto, no se pueden comparar con lo que se obtiene fuera de la caja con grammY y las bibliotecas que lo acompañan.
   Con los tipos viene el autocompletado en cada paso del desarrollo, así como útiles tooltips con explicaciones y enlaces.

2. **Más fácil de escalar la base de código.**
   El sistema de tipos tiene una segunda ventaja---te permite escalar la base de código de tu bot.
   Esto es mucho más difícil de hacer para proyectos escritos en un lenguaje con peor seguridad de tipos.

3. **Más fácil de escalar la carga.**
   Si tu bot empieza a ser realmente popular, es significativamente más fácil escalar bots escritos en JS que en Python.

4. **Mayor capacidad de respuesta de tu bot.**
   Ahora mismo, V8 y sus competidores hacen de JavaScript el lenguaje de scripting más rápido del mundo.
   Si quieres que tu bot sea lo más rápido posible sin dejar de disfrutar de un lenguaje dinámico, entonces grammY es tu mejor opción.

Como siempre, los lenguajes de programación destacan en determinadas tareas y deben evitarse para otras.
Esto no es una excepción.

Por ejemplo, con el estado actual de los ecosistemas, cualquier cosa relacionada con el aprendizaje automático no debería hacerse en JavaScript.
Sin embargo, cuando se trata de servidores web, TypeScript tiende a ser una opción mucho mejor.

### Frameworks escritos en Go

Si dominas tanto TypeScript como Go, entonces una métrica razonable para decidirte por un lenguaje para tu bot es el equilibrio entre velocidad de desarrollo y velocidad de ejecución.

Elige grammY si no estás completamente seguro de lo que estás construyendo.
TypeScript te permite iterar sobre tu base de código a velocidades increíbles.
Es ideal para la creación rápida de prototipos, probar cosas nuevas, conocer bots y hacer las cosas rápidamente.
Como regla general, procesar ~100.000.000 de actualizaciones al día puede hacerse fácilmente con TypeScript, pero ir más allá de eso requerirá trabajo extra, como usar un plugin más de grammY.

Elige una librería escrita en Go si ya sabes bastante bien lo que vas a construir (no esperas necesitar mucha ayuda), y ya sabes que tu bot procesará un gran número de actualizaciones.
Como lenguaje compilado de forma nativa, Go supera a TypeScript en velocidad bruta de CPU en varios órdenes de magnitud.
Esto es mucho menos relevante cuando escribes un bot porque la mayor parte del tiempo se pasa esperando a la red, pero con el tiempo, empezará a importar lo rápido que tu bot pueda analizar JSON.
Go puede ser una mejor opción en estos casos.

### Frameworks escritos en Rust

Un punto similar se puede hacer [como con Go](#frameworks-escritos-en-go), pero es aún más fuerte con Rust.
En cierto modo, te llevará aún más tiempo escribir Rust, pero tu bot también será aún más rápido.

Además, ten en cuenta que usar Rust es divertido pero raramente necesario para los bots.
Si quieres usar Rust, hazlo, pero considera decir que te encanta Rust y no que sea la herramienta adecuada para el trabajo.

## Cómo estar en desacuerdo con esta comparación

Si crees que algo está mal en esta página, ¡no desesperes!
¡Por favor, háznoslo saber en el [chat de grupo](https://t.me/grammyjs)!
Nos encantaría que nos informaras sobre tu perspectiva.
Naturalmente, también puedes editar esta página en GitHub, o presentar una incidencia allí para señalar errores o sugerir otras cosas.
Esta página siempre tendrá espacio para ser más objetiva, y más justa.
