---
prev: false
next: false
---

# Comparación de proveedores de alojamiento

Hay muchos proveedores de alojamiento diferentes que te permiten ejecutar tu bot.
A veces puede ser difícil hacer un seguimiento de lo que cuestan y de su rendimiento.
Por ello, la comunidad de grammY está recopilando sus experiencias en esta página.

## ¿Qué es un proveedor de alojamiento?

Para mantener un bot online las 24 horas del día, es necesario que un ordenador funcione las 24 horas del día.
Como [se mencionó en la introducción](../guide/introduction#como-mantener-un-bot-en-funcionamiento), lo más probable es que no quieras hacer eso con tu ordenador portátil o doméstico.
En su lugar, puedes pedir a una empresa que ejecute el bot en la nube.

En otras palabras, simplemente lo ejecutas en el ordenador de otra persona.

## Tablas de Comparación

> ¡Por favor, haz clic en el botón de edición en la parte inferior de la página para añadir más proveedores o para editar los existentes!

Tenemos dos tablas comparativas: una para [alojamiento serverless y PaaS](#serverless-y-paas) y otra para [VPS](#vps).

### Serverless y PaaS

Serverless significa que usted no controla una sola máquina en la que se ejecuta su bot.
En su lugar, estos proveedores de alojamiento te permitirán subir tu código, y luego iniciar y detener diferentes máquinas según sea necesario para asegurarse de que tu bot siempre funciona.

Lo principal que hay que saber sobre ellos es que en las infraestructuras sin servidor se requiere el uso de [webhooks](../guide/deployment-types).
La mayoría de los proveedores de abajo tendrán problemas cuando intentes ejecutar tu bot con polling (`bot.start()` o [grammY runner](../plugins/runner)) en ellos.

Por otro lado, PaaS (Plataforma como servicio) proporciona una solución similar pero más controlable.
Puedes elegir cuántas instancias de máquina servirán a tu bot, y cuándo se ejecutarán.
El uso de [polling](../guide/deployment-types) también es posible con PaaS si el proveedor que elijas te permite mantener exactamente una única instancia en ejecución en todo momento.

Serverless y PaaS tienen el inconveniente de que no te proporcionan un almacenamiento persistente por defecto, como un sistema de archivos local.
En su lugar, a menudo tendrás que tener una base de datos por separado y conectarte a ella si necesitas almacenar datos de forma permanente.

| Nombre                 | Precio mínimo | Precios                                                                                                       | Límites                                                                                                                | Node.js                                                                                  | Deno                                           | Web                                               | Notas                                                                                                                                                                        |
| ---------------------- | ------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deta                   | Gratis        | Todavía no tiene planes de pago                                                                               | Sin límites específicos                                                                                                | ✅                                                                                       | ✅                                             | ✅                                                | Deno es soportado con una [aplicación personalizada](https://deta.space/docs/en/build/quick-starts/custom) ([example](https://github.com/deta/starters/tree/main/deno-app)). |
| Deno Deploy            | Gratis        | $20/mes suscripción por 5M de solicitudes y 100 GB; $2/1M solicitudes, $0.5/GB de red                         | [1M solicitudes/mes, 100 GB/mes, Límite de tiempo de CPU de 10 ms](https://deno.com/deploy/pricing)                    | ❌                                                                                       | ✅                                             | ❌                                                |                                                                                                                                                                              |
| Fly                    | Gratis        | $1.94/mes suscripción por shared-cpu-1x y 256 MB RAM, $0.02/GB de red                                         | [3 shared-cpu-1x 256mb VMs, 160GB/mes, 3GB de almacenamiento](https://fly.io/docs/about/pricing/)                      | ✅                                                                                       | ✅                                             | ❓                                                |                                                                                                                                                                              |
| DigitalOcean Functions | Gratis        | $1.85/100K GB-s                                                                                               | [90K GB-s/mes](https://docs.digitalocean.com/products/functions/details/pricing/)                                      | ✅                                                                                       | ❌                                             | ❓                                                |                                                                                                                                                                              |
| Cloudflare Workers     | Gratis        | $5/10M solicitudes                                                                                            | [100K solicitudes/día, Límite de tiempo de CPU de 10 ms](https://workers.cloudflare.com/)                              | ❌                                                                                       | [✅](https://denoflare.dev/)                   | ✅                                                |                                                                                                                                                                              |
| Vercel                 | Gratis        | $20/mes suscripción                                                                                           | [Invocaciones ilimitadas, 100 GB-h, Límite de tiempo de 10 s](https://vercel.com/pricing)                              | [✅](https://vercel.com/docs/functions/runtimes/node-js)                                 | [✅](https://github.com/vercel-community/deno) | [✅](https://vercel.com/docs/frameworks)          |                                                                                                                                                                              |
| Scaleway Functions     | Gratis        | €0.15/1M solicitudes, €1.2/100K GB-s                                                                          | [1M de solicitudes, 400K GB-s/mes](https://www.scaleway.com/en/pricing/?tags=serverless-functions-serverlessfunctions) | ❓                                                                                       | ❓                                             | ❓                                                |                                                                                                                                                                              |
| Scaleway Containers    | Gratis        | €0.10/100K GB-s, €1.0/100K vCPU-s                                                                             | [400K GB-s, 200K vCPU-s/mes](https://www.scaleway.com/en/pricing/?tags=serverless-containers-serverlesscontainers)     | ❓                                                                                       | ❓                                             | ❓                                                |                                                                                                                                                                              |
| Vercel Edge Functions  | Gratis        | $20/mes suscripción por 500K                                                                                  | [100K solicitudes/día](https://vercel.com/pricing)                                                                     | [✅](https://vercel.com/docs/functions/runtimes/edge-runtime#compatible-node.js-modules) | ❓                                             | [✅](https://vercel.com/templates/edge-functions) |                                                                                                                                                                              |
| serverless.com         | Gratis        |                                                                                                               |                                                                                                                        | ❓                                                                                       | ❓                                             | ❓                                                |                                                                                                                                                                              |
| Heroku                 | $5            | $5 por 1,000 [horas de dyno](https://devcenter.heroku.com/articles/usage-and-billing#dyno-usage-and-costs)/mo | [512MB RAM, se duerme tras 30 minutos de inactividad](https://www.heroku.com/pricing)                                  | ✅                                                                                       | ✅                                             | ❓                                                | Deno es compatible con un [paquete de terceros](https://github.com/chibat/heroku-buildpack-deno).                                                                            |
| DigitalOcean Apps      | $5            |                                                                                                               |                                                                                                                        | ❓                                                                                       | ❓                                             | ❓                                                | No se ha probado                                                                                                                                                             |
| Fastly Compute@Edge    |               |                                                                                                               |                                                                                                                        | ❓                                                                                       | ❓                                             | ❓                                                |                                                                                                                                                                              |
| Zeabur                 | $5            | $5/mes suscripción                                                                                            | 2GB RAM, Invocaciones ilimitadas                                                                                       | ✅                                                                                       | ✅                                             | ✅                                                |                                                                                                                                                                              |

### VPS

Un servidor virtual privado es una máquina virtual sobre la que usted tiene el control total.
Normalmente puede acceder a ella a través de [SSH](https://en.wikipedia.org/wiki/Secure_Shell).
Puedes instalar cualquier software allí, y eres responsable de las actualizaciones del sistema y demás.

En un VPS, puedes ejecutar bots usando tanto long polling como webhooks.

Consulta el [tutorial](./vps) sobre cómo alojar bots de grammY en un VPS.

| Nombre        | Precio mínimo | Ping a Bot API                            | Opción más barata                  |
| ------------- | ------------- | ----------------------------------------- | ---------------------------------- |
| Hostinger     | $14           |                                           | 1 vCPU, 4 GB RAM, 50 GB SSD, 1 TB  |
| Contabo       |               | 15 ms :de: Nuremberg                      |                                    |
| DigitalOcean  | $5            | 1-15 ms :netherlands: AMS, 19 ms :de: FRA | 1 vCPU, 1 GB RAM, 25 GB SSD, 1 TB  |
| Hetzner Cloud | €4.15         | ~42 ms :de:                               | 1 vCPU, 2 GB RAM, 20 GB SSD, 20 TB |
| IONOS VPS     | €1 o $2       | 15 ms :de: Baden-Baden                    | 1 vCPU, 0.5 GB RAM, 8 GB SSD       |
| Scaleway      | €~7           |                                           | 2 cores, 2 GB RAM, 20 GB SSD       |
| MVPS          | €4            | 6-9 ms :de: Germany                       | 1 core, 2 GB RAM, 25 GB SSD, 2 TB  |

## Explicaciones sobre las unidades

### Unidades Base

| Unidad | En palabras | Explicación                                                        |
| ------ | ----------- | ------------------------------------------------------------------ |
| K      | mil         | 1,000 de algo.                                                     |
| M      | millón      | 1,000,000 de algo.                                                 |
| €      | Euro        | La moneda EUR.                                                     |
| $      | US-Dollar   | La moneda USD.                                                     |
| req    | petición    | El número de peticiones HTTP.                                      |
| vCPU   | CPU virtual | Potencia de cálculo de una CPU virtual, una parte de una CPU real. |
| ms     | milisegundo | 0.001 segundos.                                                    |
| s      | segundo     | Un segundo (unidad de tiempo del SI).                              |
| min    | minuto      | Un minuto, 60 segundos.                                            |
| h      | horas       | Una hora, 60 minutos.                                              |
| day    | día         | Un día, 24 horas.                                                  |
| mo     | mes         | Un mes, aproximadamente 30 días.                                   |
| GB     | gigabytes   | 1,000,000,000 bytes de almacenamiento.                             |

### Ejemplo de combinaciones de unidades

| Unidad      | Cantidad                            | En palabras                         | Explicación                                                        |
| ----------- | ----------------------------------- | ----------------------------------- | ------------------------------------------------------------------ |
| $/mo        | coste                               | Dolares por mes                     | Coste mensual.                                                     |
| €/M req     | coste                               | Euros por millón de peticiones      | Coste por gestionar un millón de peticiones.                       |
| req/min     | rendimiento                         | peticiones por minuto               | Número de peticiones atendidas en un minuto.                       |
| GB/s        | rendimiento                         | gigabytes por segundo               | Número de gigabytes transferidos en un segundo.                    |
| GB-s        | uso de memoria                      | gigabyte segundos                   | Un gigabyte utilizado por segundo.                                 |
| GB-h        | uso de memoria                      | gigabyte horas                      | Un gigabyte utilizado por hora.                                    |
| h/mo        | fracción de tiempo                  | hours por mes                       | Número de horas en un mes.                                         |
| K vCPU-s/mo | fracción de tiempo de procesamiento | mil segundos de CPU virtual por mes | Segundos mensuales de tiempo de procesamiento con una CPU virtual. |
