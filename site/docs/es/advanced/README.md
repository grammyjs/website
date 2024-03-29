---
prev: false
---

# Visión general: Temas avanzados

Cuando tu bot se vuelve más popular, puedes encontrarte con problemas más complejos que simplemente hacer que tu bot funcione.

Esta sección de los documentos comenzará con una inmersión profunda en el sistema de middleware de [grammY] (./middleware), que te permitirá escribir un manejo de mensajes más sofisticado de lo que normalmente es necesario.

Los siguientes cuatro capítulos se preocupan por el escalamiento.
Lee [Parte I](./structuring) si tu código se vuelve muy complejo.
Lee [Parte II](./scaling) si tienes que procesar muchos mensajes.
Lee [Parte III](./reliability) si te preocupa la fiabilidad de tu bot.
Lee [Parte IV](./flood) si estás alcanzando los límites de velocidad, es decir, recibiendo errores 429.

Si necesitas interceptar y transformar las peticiones de la API sobre la marcha, grammY te ofrece hacerlo instalando [funciones transformadoras](./transformers).

grammY también tiene [soporte para proxy](./proxy).

Por último, pero no menos importante, hemos compilado una [lista de algunas cosas que debes tener en cuenta](./deployment) al desplegar tu bot.
No hay nada nuevo allí, es sólo un montón de cosas sobre las posibles trampas, todo en un lugar central para que usted pueda ir a través.
Tal vez te permita dormir mejor por la noche.
