---
prev: ./flood.md
next: ./proxy.md
---

# Transformadores de la API del Bot

El middleware es una función que maneja un objeto de contexto, es decir, datos entrantes.

grammY también le proporciona la inversa.
Una _función transformadora_ es una función que maneja datos de salida, es decir

- un nombre de método de la API del Bot al que llamar.
- un objeto de carga útil que coincide con el método.

En lugar de tener `next` como último argumento para invocar el middleware de salida, se recibe `prev` como primer argumento para utilizar las funciones transformadoras de salida.
Mirando la firma de tipo de `Transformer` ([grammY API Reference](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/Transformer)), podemos ver cómo refleja esto.
Observa que `Payload<M, R>` se refiere al objeto payload que tiene que coincidir con el método dado, y que `ApiResponse<ApiCallResult<M, R>>` es el tipo de retorno del método invocado.

La última función transformadora invocada es un caller incorporado que hace cosas como la serialización JSON de ciertos campos, y eventualmente llama a `fetch`.

No hay un equivalente a una clase `Composer` para las funciones transformadoras porque probablemente sea excesivo, pero si lo necesitas, puedes escribir el tuyo propio. ¡PR bienvenido! :wink:

## Instalar una función transformadora

Las funciones transformadoras pueden ser instaladas en `bot.api`.
Aquí hay un ejemplo para una función transformadora que no hace nada:

```ts
// Función transformadora de paso
bot.api.config.use((prev, method, payload) => prev(method, payload));

// Comparación con el middleware de paso
bot.use((ctx, next) => next());
```

Aquí hay un ejemplo de una función transformadora que evita que se produzcan todas las llamadas a la API:

```ts
// Devuelve incorrectamente undefined en lugar de los respectivos tipos de objetos.
bot.api.config.use((prev, method, payload) => undefined as any);
```

También puedes instalar funciones transformadoras en el objeto API del objeto de contexto.
La función transformadora sólo se utilizará temporalmente para las solicitudes de la API que se realicen en ese objeto de contexto específico.
Las llamadas a `bot.api` no se ven afectadas.
Las llamadas a través de objetos de contexto de middleware que se ejecutan simultáneamente tampoco se ven afectadas.
Tan pronto como el middleware respectivo se completa, la función transformadora se descarta.

```ts
bot.on("message", (ctx) => {
  // Se instala en todos los objetos de contexto que procesan mensajes.
  ctx.api.config.use((prev, method, payload) => prev(method, payload));
});
```

Las funciones de transformación instaladas en `bot.api` serán preinstaladas en cada objeto `ctx.api`.
Así, las llamadas a `ctx.api` serán transformadas tanto por los transformadores de `ctx.api` como por los transformadores instalados en `bot.api`.

## Casos de uso de las funciones de transformación

Las funciones transformadoras son tan flexibles como el middleware, y tienen tantas aplicaciones diferentes.

Por ejemplo, el plugin [grammY menu](/plugins/menu.md) instala una función transformadora para convertir las instancias de menú salientes en la carga útil correcta.
También puedes utilizarlos para:

- implementar [flood control](/plugins/transformer-throttler.md)
- simular solicitudes de la API durante las pruebas
- añadir [auto-retry](/plugins/auto-retry.md)

Ten en cuenta, sin embargo, que reintentar una llamada a la API puede tener efectos secundarios extraños: si llamas a `sendDocument` y pasas una instancia de stream legible a `InputFile`, entonces el stream será leído la primera vez que se intente la petición.
Si invocas `prev` de nuevo, el flujo puede estar ya consumido (parcialmente), lo que lleva a archivos rotos.
Por lo tanto, es una forma más fiable de pasar las rutas de los archivos a `InputFile`, para que grammY pueda recrear el flujo cuando sea necesario.

## API Flavoring

grammY cuenta con [context flavors](/guide/context.md#context-flavors) que pueden ser usados para ajustar el tipo de contexto.
Esto incluye los métodos de la API, tanto los que están directamente en el objeto de contexto como `ctx.reply`, y todos los métodos en `ctx.api` y `ctx.api.raw`.
Sin embargo, no puedes ajustar los tipos de `bot.api` y `bot.api.raw` a través de los context flavors.

Por eso grammY admite los _API flavors_.
Estos resuelven este problema:

```ts
import { Api, Bot, Context } from "grammy";
import { SomeApiFlavor, someContextFlavor, somePlugin } from "some-plugin";

// Context flavoring
type MyContext = Context & SomeContextFlavor;
// API flavoring
type MyApi = Api & SomeApiFlavor;

// Usa ambos flavors.
const bot = new Bot<MyContext, MyApi>("my-token");

// Usa un plugin.
bot.api.config.use(somePlugin());

// Ahora llama a `bot.api` con los tipos ajustados del API flavor.
bot.api.somePluginMethod();

// También, usa el tipo de contexto ajustado del context flavor.
bot.on("message", (ctx) => ctx.api.somePluginMethod());
```

API flavors  funcionan exactamente igual que los tipos de context flavors.
Existen API flavors aditivos y transformativos, y se pueden combinar múltiples API flavors de la misma manera que se haría con context flavors.
Si no estás seguro de cómo funciona esto, vuelve a [la sección sobre context flavors](/guide/context.md#context-flavors) en la guía.
