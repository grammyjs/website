# Comparación de proveedores de alojamiento

Hay muchos proveedores de alojamiento diferentes que te permiten ejecutar tu bot.
A veces puede ser difícil hacer un seguimiento de lo que cuestan y de su rendimiento.
Por ello, la comunidad de grammY está recopilando sus experiencias en esta página.

## ¿Qué es un proveedor de alojamiento?

Para mantener un bot online las 24 horas del día, es necesario que un ordenador funcione las 24 horas del día.
Como [se mencionó en la introducción](../guide/introduction.html#como-mantener-un-bot-en-funcionamiento), lo más probable es que no quieras hacer eso con tu ordenador portátil o doméstico.
En su lugar, puedes pedir a una empresa que ejecute el bot en la nube.

En otras palabras, simplemente lo ejecutas en el ordenador de otra persona.

## Tablas de Comparación

> ¡Por favor, haz clic en el botón de edición en la parte inferior de la página para añadir más proveedores o para editar los existentes!

Tenemos dos tablas de comparación, una para alojamiento [sin servidor](#serverless) y otra para [VPS](#vps).

### Serverless

Serverless significa que usted no controla una sola máquina en la que se ejecuta su bot.
En su lugar, estos proveedores de alojamiento te permitirán subir tu código, y luego iniciar y detener diferentes máquinas según sea necesario para asegurarse de que tu bot siempre funciona.

Esto tiene el inconveniente de que tu bot no tiene acceso a un almacenamiento persistente por defecto, como un sistema de archivos local.
En su lugar, a menudo tendrá que tener una base de datos por separado y conectarse a ella si necesita almacenar datos de forma permanente.
Por lo tanto, le recomendamos que utilice un tipo de alojamiento diferente para los bots más complejos, por ejemplo, un [VPS](./vps.md).

Lo principal que hay que saber sobre ellos es que en las infraestructuras sin servidor se requiere el uso de webhooks.

| Nombre                 | Precio mínimo | Precios                           | Límites                                                                                                               | Node.js | Deno                        | Web | Notas                                           |
| ---------------------- | ------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------- | --------------------------- | --- | ----------------------------------------------- |
| Deta                   | Gratis        | Todavía no tiene planes de pago   | Sin límites específicos                                                                                               | ✅       | ❓                           | ❓   |                                                 |
| Deno Deploy            | Gratis        | Todavía no tiene planes de pago   | [100K req/día, 1000 req/minuto, Límite de tiempo de la CPU de 50 ms](https://deno.com/deploy/docs/pricing-and-limits) | ❌       | ✅                           | ❌   |                                                 |
| DigitalOcean Functions | Free          | $1.85/100K GB-s                   | [90K GB-s/mo](https://docs.digitalocean.com/products/functions/details/pricing/)                                      | ✅       | ❌                           | ❓   |                                                 |
| Cloudflare Workers     | Gratis        | $5/10M req                        | [100K req/día, Límite de tiempo de la CPU de 10 ms](https://workers.cloudflare.com/)                                  | ❌       | [✅](https://denoflare.dev/) | ✅   |                                                 |
| Heroku                 | Gratis        | Es complicado                     | [550-1000 h/mes](https://www.heroku.com/pricing)                                                                      | ✅       | ❓                           | ❓   |                                                 |
| Vercel                 | Gratis        | $20/mo suscripción                | [Invocaciones ilimitadas, 100 GB-h, Tiempo límite de 10s](https://vercel.com/pricing)                                 | ❓       | ❓                           | ❓   | ¿No está pensado para los que no son de la web? |
| Scaleway Functions     | Gratis        | €0.15/1M req, €1.2/100K GB-s      | [1M de req, 400K GB-s/mo](https://www.scaleway.com/en/pricing/#serverless-functions)                                  |         | ❓                           | ❓   |                                                 |
| Scaleway Containers    | Gratis        | €0.10/100K GB-s, €1.0/100K vCPU-s | [400K GB-s, 200K vCPU-s/mo](https://www.scaleway.com/en/pricing/#serverless-containers)                               | ❓       | ❓                           | ❓   |                                                 |
| Vercel Edge Functions  | Gratis        | $20/mo suscripción por 500K       | [100K req/día](https://vercel.com/pricing)                                                                            | ❓       | ❓                           | ❓   |                                                 |
| serverless.com         | Gratis        |                                   |                                                                                                                       | ❓       | ❓                           | ❓   |                                                 |
| DigitalOcean Apps      | $5            |                                   |                                                                                                                       | ❓       | ❓                           | ❓   | No se ha probado                                |
| Fastly Compute@Edge    |               |                                   |                                                                                                                       |         |                             |     |                                                 |

### VPS

Un servidor virtual privado es una máquina virtual sobre la que usted tiene el control total.
Normalmente puede acceder a ella a través de [SSH](https://en.wikipedia.org/wiki/Secure_Shell).
Puedes instalar cualquier software allí, y eres responsable de las actualizaciones del sistema y demás.

En un VPS, puedes ejecutar bots usando tanto polling como webhooks.

Consulta [el tutorial](./vps.md) sobre cómo alojar bots de grammY en un VPS.

| Nombre        | Precio mínimo | Ping a Bot API                            | Opción más barata                  |
| ------------- | ------------- | ----------------------------------------- | ---------------------------------- |
| Contabo       |               | 15 ms :de: Nuremberg                      |                                    |
| DigitalOcean  | $5            | 1-15 ms :netherlands: AMS, 19 ms :de: FRA | 1 vCPU, 1 GB RAM, 25 GB SSD, 1 TB  |
| Hetzner Cloud | €4.15         | ~42 ms :de:                               | 1 vCPU, 2 GB RAM, 20 GB SSD, 20 TB |
| IONOS VPS     | €1 o $2       | 15 ms :de: Baden-Baden                    | 1 vCPU, 0.5 GB RAM, 8 GB SSD       |
| Scaleway      | €~7           |                                           | 2 cores, 2 GB RAM, 20 GB SSD       |

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
