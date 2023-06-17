---
prev:
  link: ./reliability
next:
  link: ./transformers
---

# Escalando IV: Límites

Telegram restringe cuántos mensajes puede enviar su bot por segundo, que se puede consultar en [Bot FAQ](https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this).
Siempre debes asegurarte de mantenerte por debajo de estos límites, de lo contrario tu bot será limitado.
Si ignoras estos errores, tu bot puede acabar siendo baneado.

## La solución sencilla

:::warning No es una solución real
Esta sección resuelve tu problema a corto plazo, pero si estás construyendo un bot que realmente debe escalar bien, lee la [siguiente subsección](#la-solucion-real-recomendada) en su lugar.
:::

Hay una solución muy simple para golpear los límites de velocidad: si una solicitud de la API falla debido a un límite de velocidad, simplemente espera el tiempo que Telegram te dice que esperes, y repite la solicitud.

Si quieres hacer esto, puedes utilizar el [plugion super sencillo `auto-retry`](../plugins/auto-retry).
Es una [función transformadora de la API](../advanced/transformers) que hace exactamente eso.

Sin embargo, si el tráfico de tu bot aumenta rápidamente, por ejemplo, cuando se añade a un grupo grande, puede encontrarse con muchos errores de limitación de velocidad antes de que el pico de tráfico se asiente.
Esto podría llevar a un baneo.
Además, como las peticiones pueden intentarse varias veces, tu servidor consumirá más RAM y ancho de banda de lo necesario.
En lugar de solucionar el problema a posteriori, es mucho mejor poner en cola todas las peticiones de la API y enviarlas sólo a la velocidad permitida:

## La solución real (recomendada)

grammY le proporciona el [plugin throttler](../plugins/transformer-throttler) que hace que tu bot respete automáticamente todos los límites de velocidad poniendo en cola las peticiones salientes de tu bot en una cola de mensajes.
Este plugin es igual de sencillo de configurar, pero hace un trabajo mucho mejor en el control de peticiones.
No hay realmente ninguna buena razón para usar [auto-retry](../plugins/auto-retry) sobre el [plugin throttler](../plugins/transformer-throttler).
En algunos casos puede tener sentido usar ambos.
