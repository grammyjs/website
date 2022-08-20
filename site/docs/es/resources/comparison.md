# Cómo se compara grammY con otros frameworks de bots

Aunque grammY utiliza algunos conceptos conocidos de otros frameworks de bots (y frameworks web), fue escrito desde cero para una óptima legibilidad y rendimiento.
En otras palabras, no utiliza ningún código de proyectos de la competencia, pero aún así resultará familiar a los usuarios de algunos frameworks.

> Por favor, asuma que esta comparación está sesgada, aunque estamos tratando de proporcionarle una descripción objetiva de las ventajas y desventajas de usar grammY sobre el uso de otras bibliotecas.
> Estamos tratando de mantener las cosas en este artículo actualizadas.
> Si notas que algo está desactualizado, por favor edita esta página usando el enlace al final.

## Comparación con otros Frameworks de JavaScript

::: tip Elige primero tu lenguaje de programación
Dado que estás leyendo la documentación de un framework dentro del ecosistema JavaScript, es probable que estés buscando algo que funcione en Node.js (o Deno).
Sin embargo, si ese no es tu caso, [desplázate hacia abajo](#comparación-con-frameworks-en-otros-lenguajes-de-programación) para ver una comparación de qué lenguajes de programación son adecuados para el desarrollo de bots.
Naturalmente, también encontrarás una breve comparación con frameworks de otros lenguajes (principalmente Python).
:::

Hay dos proyectos principales en los que grammY se inspira, a saber, [Telegraf](https://github.com/telegraf/telegraf) y [NTBA](https://github.com/yagop/node-telegram-bot-api).
Nos centraremos en ellos por ahora, pero nosotros (¿o tú?) podemos añadir otras comparaciones en el futuro.

### Telegraf

grammY tiene sus raíces en Telegraf, así que aquí hay un breve resumen de cómo estos marcos se relacionan históricamente.

#### Algo de historia

Telegraf es una biblioteca increíble, y grammY no estaría donde está sin ella.
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
La seguridad tipográfica a su vez permite características más avanzadas que cambian fundamentalmente la forma en que pensamos sobre el desarrollo de bots, como los [transformadores de la API](../advanced/transformers.md).

Hoy en día, Telegraf 3 es obsoleto.
Hay algunos forks no oficiales por ahí que tratan de mantener la base de código heredada al día con la evolución de la API de bots, pero su compatibilidad es desconocida.
Además, el ecosistema de plugins de Telegraf ha pasado a Telegraf 4.
La mayoría de los desarrolladores de plugins no mantienen versiones para forks de terceros de versiones antiguas de Telegraf.
Basándonos en el hecho de que Telegraf se encuentra en algún lugar entre la versión 3 y la 4, tiene sentido comparar grammY con ambas versiones individualmente.

#### Comparación con la v3

Dada su historia compartida, grammY y Telegraf tienen mucho en común.
Ambos tienen un [sistema de middleware](../guide/middleware.md) en su núcleo.
También comparten gran parte de su sintaxis básica:

```ts
// Funciona tanto con grammY como con Telegraf.
bot.on("message", (ctx) => ctx.reply("¡Hola!"));
```

Cualquier código escrito en Telegraf funcionará en grammY con cambios mínimos.
(Tenga en cuenta que lo contrario no es cierto, ya que muchas características de grammY no están disponibles para los usuarios de Telegraf).

La principal ventaja de grammY sobre Telegraf 3.x es **un mejor soporte de herramientas**.
Telegraf 3 está escrito en JavaScript.
Los tipos enviados son incorrectos e incompletos, y los tipos consumidos de la API de Bot están desactualizados por varios años.
Como resultado, no hay un soporte fiable para el autocompletado o la corrección ortográfica del código del bot.
La experiencia demuestra que a menudo tienes que ejecutar tu bot para averiguar si tu código funciona.

En cambio, grammY está escrito en TypeScript puro.
Esto permite que tu editor de código (por ejemplo, VSCode) analice tu código mientras estás escribiendo, y te ayude.
Además, puede mostrar la API completa de Telegram Bot inline -la documentación del sitio web estará disponible al alcance de tu mano cuando pases el ratón sobre cualquier nombre o elemento de tu código.

Otra ventaja notable es que por fin puedes **escribir tus propios bots en TypeScript**.
Esto era difícil de hacer porque las anotaciones de tipo erróneas de Telegraf estaban impidiendo que el código perfectamente correcto se compilara, animando así efectivamente a los usuarios a no comprobar su código en primer lugar.
Sin embargo, el código de tipo seguro es una gran ventaja para cualquier base de código no trivial.

grammY y Telegraf tienen bases de código distintas.
Al ser liberado del legado, grammY también podría hacer contribuciones sustanciales al sistema de middleware subyacente, permitiendo emocionantes casos de uso como [consultas de filtro](../guide/filter-queries.md), [límites de error](../guide/errors.md#error-boundaries), [transformadores de API](../advanced/transformers.md), y muchos más.
Esto también permite el desarrollo de valiosos plugins que son imposibles de trabajar bajo Telegraf.

La principal ventaja de Telegraf sobre grammY es que sigue siendo **conocido por mucha más gente**.
La comunidad de Telegraf puede estar dividida entre las versiones, pero en este punto inicial la mayoría de estos grupos son todavía más grandes que el grupo unido de usuarios de grammY.
Esto también significa que puedes encontrar más historias en internet sobre usuarios de Telegraf, y encontrarás más tutoriales no oficiales de otros codificadores, que pueden ayudarte si la documentación oficial de una librería tiene deficiencias.

#### Comparación con v4

La principal ventaja de grammY sobre Telegraf 4.x es que **es simplemente mucho más fácil**.
Por ejemplo

- grammY tiene una [documentación](../).
  Telegraf no la tiene (fue reemplazada por una referencia de la API generada que carece de explicaciones).
- Los tipos en grammY _sólo funcionan_ y seguirán tu código.
  En Telegraf, a menudo necesitarás escribir tu código de cierta manera, de lo contrario no compila (aunque en realidad funcione bien).
- grammY integra sugerencias de la [referencia oficial de la API del Bot](https://core.telegram.org/bots/api) en línea que te ayudan mientras estás codificando.
  Telegraf no te da ninguna explicación sobre tu código.

#### Resumen

##### Ventajas de grammY

- Más fácil de usar que Telegraf 3 y 4
- Soporte adecuado para TypeScript
- Tiene tanto una documentación como una referencia de la API generada
- Significativamente más rápido en los sondeos largos (con el corredor de grammY)
- Comunidad y ecosistema unidos
- Más plugins
- Mejores integraciones con bases de datos y frameworks web
- Se desarrolla más activamente
- Mensajes de error útiles
- Es mucho más difícil encontrarse con condiciones de carrera peligrosas
- Diseñado para evitar que se cometan errores de programación
- Se ejecuta en Node.js, pero también en Deno y en el navegador

##### Ventajas de Telegraf

- Más antiguo, por lo tanto más maduro
- Muchos más ejemplos de bots, tanto en el repositorio como en la naturaleza

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

¿Crees que tu framework favorito es mejor que grammY en algún aspecto?
No dudes en editar esta página y añadir una comparación, o dinos lo que piensas en el [chat de grupo](https://t.me/grammyjs).

## Comparación con Frameworks en otros lenguajes de programación

Hay razones para favorecer un lenguaje de programación diferente a TypeScript.
Lo más importante es que te guste trabajar con tus herramientas y lenguajes.
Si estás decidido a seguir con otra cosa, entonces puedes dejar de leer aquí.

Dado que todavía estás leyendo, es posible que quieras saber por qué grammY está escrito en TypeScript, y por qué tal vez deberías considerar elegir este lenguaje para tu bot, también.

Esta sección resumirá cómo TypeScript tiene algunas ventajas sobre otros lenguajes cuando se trata de desarrollar bots para Telegram.
El otro lenguaje principal que se utiliza para desarrollar bots de chat para Telegram es Python, así que nos limitaremos a él por ahora.
Algunos de los siguientes puntos son más bien opiniones personales que hechos objetivos.
La gente tiene diferentes gustos, así que toma esta sección con un grano de sal.

1. **Mejores herramientas de edición.**
   Las anotaciones de tipo de grammY son excepcionales.
   Aunque Python introdujo tipos en su versión 3.5, no se utilizan tan comúnmente en el ecosistema como es el caso de JavaScript/TypeScript.
   Por lo tanto, no se pueden comparar con lo que se obtiene fuera de la caja con grammY y las bibliotecas que lo acompañan.
   Con los tipos viene el autocompletado en cada paso del desarrollo, así como útiles tooltips con explicaciones y enlaces.
2. **2. Más fácil de escalar la base de código.
   El sistema de tipos tiene una segunda ventaja: te permite escalar la base de código de tu bot.
   Esto es mucho más difícil de hacer para proyectos escritos en un lenguaje con peor seguridad de tipos.
3. **3. Más fácil de escalar la carga.
   Si tu bot empieza a ser realmente popular, es significativamente más fácil escalar bots escritos en JS que en Python.
4. **Mayor capacidad de respuesta de tu bot.**
   El motor V8 hace que JavaScript sea el lenguaje de scripting más rápido del universo observable.
   Si quieres que tu bot sea lo más rápido posible sin dejar de disfrutar de un lenguaje dinámico, entonces grammY es tu mejor opción.
5. Soporte de **`async`/`await`.**
   Este es un patrón de programación muy popular para domar la concurrencia.
   Los últimos años muestran una fuerte tendencia hacia la programación asíncrona.
   El mayor framework de bots para Python, PTB, [anunció su migración](https://t.me/pythontelegrambotchannel/94) a la programación asíncrona en enero de 2021, que se espera que tal vez lleve "2 años".
   grammY ya está ahí.
   (Otros frameworks de Python menos conocidos pueden ser más rápidos en la transición.
   Ignora este punto si estás usando un framework de Python que tiene soporte para `async`/`await`).

## Cómo estar en desacuerdo con esta comparación

Si crees que algo está mal en esta página, ¡no desesperes!
¡Por favor, háznoslo saber en el [chat de grupo](https://t.me/grammyjs)!
Nos encantaría que nos informaras sobre tu perspectiva.
Naturalmente, también puedes editar esta página en GitHub, o presentar una incidencia allí para señalar errores o sugerir otras cosas.
Esta página siempre tendrá espacio para ser más objetiva, y más justa.
