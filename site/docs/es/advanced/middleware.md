---
prev: ./
next: ./structuring.md
---

# Middleware Redux

En está guía, [introdujimos el middleware](/guide/middleware.md) como un stack de funciones.
Aunque no está mal que se pueda utilizar el middleware de esta forma lineal (también en grammY), llamarlo sólo stack es una simplificación.

## Middleware en grammY

Normalmente, se ve el siguiente patrón.

```ts
const bot = new Bot("<token>");

bot.use(/* ... */);
bot.use(/* ... */);

bot.on(/* ... */);
bot.on(/* ... */);
bot.on(/* ... */);

bot.start();
```

Se parece bastante a un stack, excepto que, detrás de las escenas, es realmente un árbol.
El corazón de esta funcionalidad es la clase `Composer` ([referencia](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/Composer)) que construye este árbol.

En primer lugar, cada instancia de `Bot` es una instancia de `Composer`.
Es sólo una subclase, así que `class Bot extends Composer`.

Además, debes saber que cada método de `Composer` llama internamente a `use`.
Por ejemplo, `filter` sólo llama a `use` con algún middleware de bifurcación, mientras que `on` sólo llama a `filter` de nuevo con alguna función de predicado que compara las actualizaciones con la [consulta de filtro dada](/guide/filter-queries.md).
Por lo tanto, podemos limitarnos a mirar `use` por ahora, y el resto sigue.

Ahora tenemos que sumergirnos un poco en los detalles de lo que hace `Composer` con sus llamadas `use`, y en qué se diferencia de otros sistemas de middleware que existen.
La diferencia puede parecer sutil, pero espera hasta la siguiente subsección para descubrir por qué tiene consecuencias notables.

## Augmenting `Composer`

Puede instalar más middlewares en una instancia de `Composer` incluso después de instalar el propio `Composer` en algún lugar.

```ts
const bot = new Bot("<token>"); // subclase de `Composer`

const composer = new Composer();
bot.use(composer);

// Esto va a ejecutar:
composer.use(/* A */);
composer.use(/* B */);
composer.use(/* C */);
```

Se ejecutarán los programas `A`, `B` y `C`.
Todo esto dice que una vez que has instalado una instancia de `Composer`, puedes seguir llamando a `use` sobre ella y este middleware se seguirá ejecutando.
(Esto no es nada espectacular, pero ya es una diferencia principal con los frameworks populares de la competencia que simplemente ignoran las operaciones posteriores).

Puede que te preguntes dónde está la estructura de árbol.
Echemos un vistazo a este snippet:

```ts
const composer = new Composer();

composer.use(/* A */);
composer.use(/* B */).use(/* C */);
composer.use(/* D */).use(/* E */).use(/* F */).use(/* G */);
composer.use(/* H */).use(/* I */);
composer.use(/* J */).use(/* K */).use(/* L */);
```

¿Puedes verlo?

Como puedes adivinar, todo el middleware se ejecutará en orden de `A` a `L`.

Otras bibliotecas aplanarían internamente este código para que fuera equivalente a `composer.use(/* A */).use(/* B */).use(/* C */).use(/* D */)...` y así sucesivamente.
Por el contrario, grammY conserva el árbol especificado: un nodo raíz (`compositor`) tiene cinco hijos (`A`, `B`, `D`, `H`, `J`), mientras que el hijo `B` tiene otro hijo, `C`, etc.
Este árbol será atravesado por cada actualización en orden de profundidad, por lo tanto, pasando a través de "A" a "L" en orden lineal, al igual que lo que usted sabe de otros sistemas.

Esto es posible gracias a la creación de una nueva instancia de `Composer` cada vez que se llama a `use`, que a su vez se extenderá (como se ha explicado anteriormente).

## Concatenación de llamadas `use`

Si sólo utilizáramos `use`, esto no sería demasiado útil.
La cosa se pone más interesante cuando, por ejemplo, entra en juego `filter`.

Mira esto:

```ts
const composer = new Composer();

composer.filter(/* 1 */, /* A */).use(/* B */)

composer.filter(/* 2 */).use(/* C */, /* D */)
```

En la línea 3, registramos "A" detrás de una función de predicado "1".
La función `A` sólo se evaluará para las actualizaciones que pasen la condición `1`.
Sin embargo, `filter` devuelve una instancia de `Composer` que aumentamos con la llamada `use` de la línea 3, por lo que `B` sigue siendo vigilada por `1`, aunque se instale en una llamada `use` completamente diferente.

La línea 5 es equivalente a la línea 3 en el sentido de que tanto `C` como `D` sólo se ejecutarán si `2` se mantiene.

¿Recuerdas cómo las llamadas a `bot.on()` podían encadenarse para concatenar consultas de filtro con AND?

Imagina esto:

```ts
const composer = new Composer();

composer.filter(/* 1 */).filter(/* 2 */).use(/* A */);
```

`2` sólo se comprobará si `1` se mantiene, y `A` sólo se ejecutará si `2` (y por tanto `1`) se mantiene.

Revisa la sección sobre [combinar consultas de filtro](/guide/filter-queries.md#combining-multiple-queries) con tus nuevos conocimientos y siente tu nuevo poder.

Un caso especial es `fork`, ya que inicia dos cálculos que son concurrentes, es decir, intercalados en el bucle de eventos.
En lugar de devolver la instancia de `Composer` creada por la llamada subyacente `use`, devuelve un `Composer` que refleja el cálculo bifurcado.
Esto permite patrones concisos como `bot.fork().on(':text').use(/* A */)`.
A" se ejecutará ahora en la rama de computación paralela.
