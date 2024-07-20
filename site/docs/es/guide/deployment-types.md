---
next: false
---

# Long Polling vs. Webhooks

Hay dos formas en las que tu bot puede recibir mensajes de los servidores de Telegram.
Se denominan _long polling_ y _webhooks_.
grammY soporta ambas formas, mientras que el long polling es el predeterminado.

Esta sección describe primero lo que es el long polling y los webhooks, y a su vez describe algunas de las ventajas y desventajas de usar uno u otro método de despliegue.
También cubrirá cómo usarlos con grammY.

## Introducción

Puedes pensar en toda la discusión de webhooks vs. long polling como una cuestión de qué _tipo de despliegue_ usar.
En otras palabras, hay dos formas fundamentalmente diferentes de alojar tu bot (ejecutarlo en algún servidor), y difieren en la forma en que los mensajes llegan a tu bot, y pueden ser procesados por grammY.

Esta elección es muy importante cuando tienes que decidir dónde alojar tu bot.
Por ejemplo, algunos proveedores de infraestructura sólo admiten uno de los dos tipos de despliegue.

Tu bot puede atraerlos (long polling), o los servidores de Telegram pueden empujarlos a tu bot (webhooks).

> Si ya sabes cómo funcionan estas cosas, desplázate hacia abajo para ver cómo usar [long polling](#como-utilizar-el-long-polling) o [webhooks](#como-usar-webhooks) con grammY.

## ¿Cómo funciona el Long Polling?

Imagínese que está comprando una bola de helado en su heladería de confianza.
Te acercas al empleado y le pides tu tipo de helado favorito.
Desgraciadamente, te avisa de que se han agotado las existencias.

Al día siguiente, vuelves a tener antojo de ese delicioso helado, así que vuelves al mismo sitio y pides el mismo helado.
Buenas noticias.
Han repuesto durante la noche para que puedas disfrutar hoy de tu helado de caramelo salado.
Qué rico.

**Polling** significa que grammY envía proactivamente una solicitud a Telegram, pidiendo nuevas actualizaciones (piensa: mensajes).
Si no hay mensajes, Telegram devolverá una lista vacía, indicando que no se han enviado nuevos mensajes a su bot desde la última vez que preguntó.

Cuando grammY envía una petición a Telegram y se han enviado nuevos mensajes a tu bot mientras tanto, Telegram los devolverá como un array de hasta 100 objetos de actualización.

```asciiart:no-line-numbers
______________                                   _____________
|            |                                   |           |
|            |   <---   ¿hay mensajes?    ---    |           |
|            |    ---        no           --->   |           |
|            |                                   |           |
|            |   <---   ¿hay mensajes?    ---    |           |
|  Telegram  |    ---        no           --->   |    Bot    |
|            |                                   |           |
|            |   <---   ¿hay mensajes?    ---    |           |
|            |    ---   sí, aquí tienes   --->   |           |
|            |                                   |           |
|____________|                                   |___________|
```

Es inmediatamente obvio que esto tiene algunos inconvenientes.
Tu bot sólo recibe nuevos mensajes cada vez que pregunta, es decir, cada pocos segundos más o menos.
Para que tu bot responda más rápido, podrías enviar más peticiones y no esperar tanto tiempo entre ellas.
Por ejemplo, ¡podríamos pedir nuevos mensajes cada milisegundo! Lo que podría salir mal...

En vez de decidir hacer spam a los servidores de Telegram, usaremos el _long polling_ en vez del regular (short) polling.

**Long polling** significa que grammY envía proactivamente una solicitud a Telegram, pidiendo nuevas actualizaciones.
Si no hay mensajes, Telegram mantendrá la conexión abierta hasta que lleguen nuevos mensajes, y entonces responderá a la petición con esos nuevos mensajes.

_¡Hora de volver a tomar un helado!
El empleado ya te saluda con tu nombre de pila.
Al preguntarle por un helado de su tipo favorito, el empleado le sonríe y se queda helado.
De hecho, no obtiene ninguna respuesta.
Así que decides esperar, devolviendo la sonrisa con firmeza.
Y esperas.
Y esperas._

_Unas horas antes del siguiente amanecer, llega un camión de una empresa local de reparto de alimentos y trae un par de cajas grandes al almacén del salón.
En ellas se lee **helado** en el exterior.
El empleado por fin se pone en marcha de nuevo.
"¡Claro que tenemos caramelo salado!
Dos cucharadas con virutas, lo de siempre"._

_Como si no hubiera pasado nada, disfrutas de tu helado mientras sales de la heladería más irreal del mundo._

```asciiart:no-line-numbers
______________                                   _____________
|            |                                   |           |
|            |   <---   ¿hay mensajes?    ---    |           |
|            |   .                               |           |
|            |   .                               |           |
|            |   .     *ambos esperando*         |           |
|  Telegram  |   .                               |    Bot    |
|            |   .                               |           |
|            |   .                               |           |
|            |    ---  sí, aquí tienes    --->   |           |
|            |                                   |           |
|____________|                                   |___________|
```

> Tenga en cuenta que, en realidad, ninguna conexión se mantendría abierta durante horas.
> Las solicitudes de long polling ienen un tiempo de espera por defecto de 30 segundos (para evitar una serie de [problemas técnicos](https://datatracker.ietf.org/doc/html/rfc6202#section-5.5)).
> Si no se devuelven nuevos mensajes después de este período de tiempo, la solicitud se cancelará y se volverá a enviar---pero el concepto general sigue siendo el mismo.

Usando un long polling, no necesitas enviar spam a los servidores de Telegram, ¡y aún así recibes nuevos mensajes inmediatamente!
Muy ingenioso.
Esto es lo que hace grammY por defecto cuando ejecutas `bot.start()`.

## ¿Cómo funcionan los Webhooks?

Después de esta aterradora experiencia (¡una noche entera sin helado!), prefieres no volver a preguntar a nadie por el helado.
¿No sería genial si el helado pudiera venir a ti?_

Configurar un **webhook** significa que proporcionarás a Telegram una URL que sea accesible desde el internet público.
Cada vez que se envíe un nuevo mensaje a tu bot, Telegram (y no tú) tomará la iniciativa y enviará una petición con el objeto de actualización a tu servidor.
Bonito, ¿no?

Decides ir a la heladería por última vez.
Le dices a tu amigo del mostrador dónde vives.
Él promete ir personalmente a tu apartamento cada vez que haya un nuevo helado (porque se derretiría en el correo).
Un tipo genial._

```asciiart:no-line-numbers
______________                                   _____________
|            |                                   |           |
|            |                                   |           |
|            |                                   |           |
|            |        *ambos esperando*          |           |
|            |                                   |           |
|  Telegram  |                                   |    Bot    |
|            |                                   |           |
|            |                                   |           |
|            |    --- hola, nuevo mensaje --->   |           |
|            |   <---    gracias amigo    ---    |           |
|____________|                                   |___________|
```

## Comparación

**La principal ventaja de long polling sobre los webhooks es que es más sencillo.**
No necesitas un dominio o una URL pública.
No es necesario que te pongas a jugar con la configuración de certificados SSL en caso de que estés ejecutando tu bot en un VPS.
Usa `bot.start()` y todo funcionará, sin necesidad de más configuración.
Bajo carga, tienes el control total de cuántos mensajes puedes procesar.

Los lugares donde el long polling funciona bien incluyen:

- Durante el desarrollo en su máquina local.
- En la mayoría de los servidores.
- En instancias "backend" alojadas, es decir, máquinas que ejecutan activamente su bot 24/7.

**La principal ventaja de los webhooks sobre el long polling es que son más baratos.**
YTe ahorras un montón de peticiones superfluas.
No necesitas mantener una conexión de red abierta en todo momento.
Puedes utilizar servicios que reduzcan automáticamente tu infraestructura a cero cuando no haya peticiones.
Si quieres, puedes incluso [hacer una llamada a la API al responder a la petición de Telegram](#webhook-reply), aunque esto tiene una serie de inconvenientes.

Consulta la opción de configuración [aquí](/ref/core/apiclientoptions#canusewebhookreply).

Los lugares donde los webhooks funcionan bien incluyen:

- En servidores con certificados SSL.
- En instancias "frontales" alojadas que escalan según su carga.
- En plataformas sin servidor, como funciones en la nube o redes de borde programables.

## Aún no tengo idea de qué usar

Entonces opte por el long polling.
Si no tienes una buena razón para usar webhooks, entonces ten en cuenta que no hay mayores inconvenientes en el long polling, y---según nuestra experiencia---pasarás mucho menos tiempo arreglando cosas.
Los webhooks pueden ser un poco desagradables de vez en cuando (ver [abajo](#terminar-las-solicitudes-de-webhooks-a-tiempo)).

Elijas lo que elijas, si alguna vez te encuentras con problemas serios, no debería ser demasiado difícil cambiar al otro tipo de despliegue después del hecho.
Con grammY, sólo tienes que tocar unas pocas líneas de código.
La configuración de su [middleware](./middleware) es la misma.

## Cómo utilizar el Long Polling

LLame a

```ts
bot.start();
```

para ejecutar su bot con una forma muy simple de long polling.
Procesa todas las actualizaciones secuencialmente.
Esto hace que tu bot sea muy fácil de depurar, y todo el comportamiento muy predecible, porque no hay concurrencia involucrada.

Si quieres que tus mensajes sean manejados concurrentemente por grammY, o te preocupa el rendimiento, revisa la sección sobre [grammY runner](../plugins/runner).

## Cómo usar Webhooks

Si quieres ejecutar grammY con webhooks, puedes integrar tu bot en un servidor web.
Por lo tanto, esperamos que seas capaz de poner en marcha un servidor web simple con un framework de tu elección.

Cada bot de grammY puede convertirse en un middleware para un número de frameworks web, incluyendo `express`, `koa`/`oak`, y más.
Puedes importar la función `webhookCallback` ([API reference](/ref/core/webhookcallback)) para crear un middleware para el framework correspondiente.

::: code-group

```ts [TypeScript]
import express from "express";

const app = express(); // o lo que sea que estés usando
app.use(express.json()); // analiza el cuerpo de la petición JSON

// "express" también se utiliza por defecto si no se da ningún argumento.
app.use(webhookCallback(bot, "express"));
```

```js [JavaScript]
const express = require("express");

const app = express(); // o lo que sea que estés usando
app.use(express.json()); // analiza el cuerpo de la petición JSON

// "express" también se utiliza por defecto si no se da ningún argumento.
app.use(webhookCallback(bot, "express"));
```

```ts [Deno]
import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application(); // o lo que sea que estés usando

// Asegúrese de especificar el framework que utiliza.
app.use(webhookCallback(bot, "oak"));
```

:::

> Ten en cuenta que no debes llamar a `bot.start()` cuando uses webhooks.

Asegúrate de leer [Marvin's Marvellous Guide to All Things Webhook](https://core.telegram.org/bots/webhooks) escrita por el equipo de Telegram si consideras ejecutar tu bot con webhooks en un VPS.

### Web Framework Adapters

Con el fin de soportar muchos frameworks web diferentes, grammY adopta el concepto de **adaptadores**.
Cada adaptador es responsable de retransmitir la entrada y salida desde el framework web a grammY y viceversa.
El segundo parámetro pasado a `webhookCallback` ([API reference](/ref/core/webhookcallback)) define el adaptador del framework usado para comunicarse con el framework web.

Debido a cómo funciona este enfoque, normalmente necesitamos un adaptador para cada framework pero, dado que algunos frameworks comparten una interfaz similar, hay adaptadores que se sabe que funcionan con múltiples frameworks.
A continuación se muestra una tabla con los adaptadores disponibles actualmente, los frameworks o APIs con los que se sabe que funcionan y los tiempos de ejecución en los que están disponibles.

| Adapter            | Framework/API/Runtime                                                          |
| ------------------ | ------------------------------------------------------------------------------ |
| `aws-lambda`       | AWS Lambda Functions                                                           |
| `aws-lambda-async` | AWS Lambda Functions with `async`/`await`                                      |
| `azure`            | Azure Functions                                                                |
| `bun`              | `Bun.serve`                                                                    |
| `cloudflare`       | Cloudflare Workers                                                             |
| `cloudflare-mod`   | Cloudflare Module Workers                                                      |
| `express`          | Express, Google Cloud Functions                                                |
| `fastify`          | Fastify                                                                        |
| `hono`             | Hono                                                                           |
| `http`, `https`    | Node.js `http`/`https` modules, Vercel                                         |
| `koa`              | Koa                                                                            |
| `next-js`          | Next.js                                                                        |
| `nhttp`            | NHttp                                                                          |
| `oak`              | Oak                                                                            |
| `serveHttp`        | `Deno.serveHttp`                                                               |
| `std/http`         | `Deno.serve`, `std/http`, `Deno.upgradeHttp`, `Fresh`, `Ultra`, `Rutt`, `Sift` |
| `sveltekit`        | SvelteKit                                                                      |
| `worktop`          | Worktop                                                                        |

### Webhook Reply

Cuando se recibe una solicitud de webhook, tu bot puede llamar hasta un método en la respuesta.
Como ventaja, esto evita que tu bot tenga que hacer hasta una petición HTTP por actualización.
Sin embargo, hay una serie de inconvenientes al utilizar esto:

1. No podrás manejar los posibles errores de la respectiva llamada a la API.
   Esto incluye los errores de limitación de velocidad, por lo que en realidad no tendrás la garantía de que tu petición tenga algún efecto.
2. Más importante aún, tampoco tendrás acceso al objeto de respuesta.
   Por ejemplo, llamar a `sendMessage` no te dará acceso al mensaje que envíes.
3. Además, no es posible cancelar la petición.
   La señal `AbortSignal` no será tenida en cuenta.
4. ¡Ten en cuenta también que los tipos en grammY no reflejan las consecuencias de una devolución de llamada de webhooks realizada!
   Por ejemplo, indican que siempre se recibe un objeto de respuesta, por lo que es tu propia responsabilidad asegurarte de que no estás metiendo la pata al utilizar esta pequeña optimización de rendimiento.

Si quieres usar las respuestas de los webhooks, puedes especificar la opción `canUseWebhookReply` en la opción `client` de tu `BotConfig` ([Referencia API](/ref/core/botconfig)).
Pasar una función que determine si se utiliza o no la respuesta del webhook para la solicitud dada, identificada por el método.

```ts
const bot = new Bot("", {
  client: {
    // Aceptamos el inconveniente de las respuestas del webhook para escribir el estado.
    canUseWebhookReply: (method) => method === "sendChatAction",
  },
});
```

Así es como funcionan las respuestas de los webhooks bajo el capó.

```asciiart:no-line-numbers
______________                                   _____________
|            |                                   |           |
|            |                                   |           |
|            |                                   |           |
|            |         *ambos esperando*         |           |
|            |                                   |           |
|  Telegram  |                                   |    Bot    |
|            |                                   |           |
|            |                                   |           |
|            |   ---  hola, nuevo mensaje  --->  |           |
|            |  <--- vale, y sendChatAction ---  |           |
|____________|                                   |___________|
```

### Terminar las solicitudes de Webhooks a tiempo

> Puedes ignorar el resto de esta página si todo tu middleware se completa rápidamente, es decir, en pocos segundos.
> Esta sección es principalmente para la gente que quiere hacer transferencias de archivos en respuesta a los mensajes, u otras operaciones que necesitan más tiempo.

Cuando Telegram envía una actualización de un chat a tu bot, esperará a que termines la solicitud antes de entregar la siguiente actualización que pertenece a ese chat.
En otras palabras, Telegram entregará las actualizaciones del mismo chat en secuencia, y las actualizaciones de diferentes chats se envían de forma concurrente.
(La fuente de esta información es [aquí](https://github.com/tdlib/telegram-bot-api/issues/75#issuecomment-755436496).)

Telegram intenta asegurarse de que tu bot reciba todas las actualizaciones.
Esto significa que si la entrega de una actualización falla para un chat, las actualizaciones posteriores se pondrán en cola hasta que la primera actualización tenga éxito.

#### Por qué no terminar una solicitud de webhook es peligroso

Telegram tiene un tiempo de espera para cada actualización que envía a tu endpoint de webhook.
Si no terminas una solicitud de webhook lo suficientemente rápido, Telegram volverá a enviar la actualización, asumiendo que no fue entregada.
Como resultado, tu bot puede procesar inesperadamente la misma actualización varias veces.
Esto significa que realizará todo el manejo de la actualización, incluyendo el envío de cualquier mensaje de respuesta, múltiples veces.

```asciiart:no-line-numbers
______________                                   _____________
|            |                                   |           |
|            | ---   hola, nuevo mensaje  --->   |           |
|            |                              .    |           |
|            |        *bot procesando*      .    |           |
|            |                              .    |           |
|  Telegram  | --- ¡He dicho nuevo mensaje! ---> |    Bot    |
|            |                              ..   |           |
|            |    *bot procesando ambos*    ..   |           |
|            |                              ..   |           |
|            | ---      HOOOOLAAAAA      --->    |           |
|            |                              ...  |           |
|            |   *bot procesando todos *    ...  |           |
|____________|                              ...  |___________|
```

Por eso grammY tiene su propio tiempo de espera, más corto, dentro de `webhookCallback` (por defecto: 10 segundos).
Si tu middleware termina antes de eso, la función `webhookCallback` responderá al webhook automáticamente.
En ese caso, todo está bien.
Sin embargo, si tu middleware no termina antes del tiempo de espera de grammY, `webhookCallback` lanzará un error.
Esto significa que puedes manejar el error en tu framework web.
Si no tienes ese manejo de errores, Telegram enviará la misma actualización de nuevo---pero al menos tendrás registros de errores ahora, para decirte que algo está mal.

Una vez que Telegram envía una actualización a tu bot por segunda vez, es poco probable que su manejo sea más rápido que la primera vez.
Como resultado, es probable que se agote el tiempo de espera de nuevo, y que Telegram envíe la actualización de nuevo.
Así, tu bot no sólo verá la actualización dos veces, sino unas cuantas docenas de veces, hasta que Telegram deje de reintentar.
Puedes observar que tu bot comienza a enviar spam a los usuarios mientras intenta manejar todas esas actualizaciones (que de hecho son las mismas cada vez).

#### Por qué terminar una petición de webhook antes de tiempo también es peligroso

Puedes configurar `webhookCallback` para que no lance un error después del tiempo de espera, sino que termine la petición de webhook antes de tiempo, aunque tu middleware siga funcionando.
Puedes hacer esto pasando `"return"` como tercer argumento a `webhookCallback`, en lugar del valor por defecto `"throw"`.
Sin embargo, aunque este comportamiento tiene algunos casos de uso válidos, esta solución suele causar más problemas de los que resuelve.

Recuerda que una vez que respondas a una solicitud de webhook, Telegram enviará la siguiente actualización para ese chat.
Sin embargo, como la antigua actualización todavía se está procesando, dos actualizaciones que antes se procesaban secuencialmente, de repente se procesan en paralelo.
Esto puede llevar a condiciones de carrera.
Por ejemplo, el plugin de sesión se romperá inevitablemente debido a los peligros de [WAR](https://en.wikipedia.org/wiki/Hazard_(computer_architecture)#Write_after_read_(WAR)).
**Esto provoca la pérdida de datos.**
Otros plugins e incluso su propio middleware pueden romperse también.
El alcance de esto es desconocido y depende de tu bot.

#### Cómo resolver este problema

Esta respuesta es más fácil de decir que de hacer.
**Es tu trabajo asegurarte de que tu middleware termine lo suficientemente rápido.**
No utilices middleware de larga duración.
Sí, sabemos que tal vez _quieras_ tener tareas de larga duración.
Sin embargo.
No lo hagas.
No en tu middleware.

En su lugar, utiliza una cola (hay un montón de sistemas de cola por ahí, desde los más simples hasta los más sofisticados).
En lugar de intentar realizar todo el trabajo en la pequeña ventana de tiempo de espera del webhook, simplemente añade la tarea a la cola para que se gestione por separado, y deja que tu middleware la complete.
La cola puede utilizar todo el tiempo que quiera.
Cuando haya terminado, puede enviar un mensaje de vuelta al chat.
Esto es sencillo de hacer si se utiliza una simple cola en memoria.
Puede ser un poco más desafiante si estás usando un sistema de colas externo tolerante a fallos, que persiste el estado de todas las tareas, y puede reintentar las cosas incluso si tu servidor muere repentinamente.

```asciiart:no-line-numbers
______________                                   _____________
|            |                                   |           |
|            |   ---  hola, nuevo mensaje --->   |           |
|            |  <---    gracias amigo     ---.   |           |
|            |                               .   |           |
|            |                               .   |           |
|  Telegram  |   *cola del bot funcionando*  .   |    Bot    |
|            |                               .   |           |
|            |                               .   |           |
|            | <--- mensaje con el resultado --- |           |
|            |   ---       muy bien       --->   |           |
|____________|                                   |___________|
```

#### Por qué `"return"` es generalmente peor que `"throw"`

Puede que te preguntes por qué la acción por defecto de `webhookCallback` es lanzar un error, en lugar de terminar la petición con éxito.
Esta elección de diseño se hizo por las siguientes razones.

Las condiciones de carrera son muy difíciles de reproducir y pueden ocurrir muy raramente o de forma esporádica.
La solución a esto es _asegurarse de no encontrarse con timeouts_ en primer lugar.
Pero, si lo hace, realmente quiere saber que esto está ocurriendo, para poder investigar y solucionar el problema.
Por esa razón, usted quiere que el error ocurra en sus registros.
Configurar el manejador de tiempo de espera como `"return"`, suprimiendo así el tiempo de espera y pretendiendo que no ha pasado nada, es exactamente lo contrario de un comportamiento útil.

Si haces esto, en cierto sentido estás usando la cola de actualización en la entrega de webhooks de Telegram como tu cola de tareas.
Esto es una mala idea por todas las razones descritas anteriormente.
Sólo porque grammY _pueda_ suprimir errores que pueden hacerte perder tus datos, no significa que _deberías_ decírselo.
Este ajuste de configuración no debe ser utilizado en los casos en que su middleware simplemente toma demasiado tiempo para completar.
Tómese el tiempo necesario para solucionar correctamente este problema, y su futuro yo (y los usuarios) se lo agradecerán.
