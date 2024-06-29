# Escalando IV: Límites

Telegram limita el número de mensajes que tu bot puede enviar cada segundo.
Esto significa que cualquier solicitud de API que realices podría dar error con el código de estado 429 (Demasiadas solicitudes) y un encabezado `retry_after` como se especifica [aquí](https://core.telegram.org/bots/api#responseparameters).
Esto puede ocurrir en cualquier momento.

Sólo hay una forma correcta de manejar estas situaciones:

1. Esperar el número de segundos especificado.
2. Reintentar la petición.

Afortunadamente, existe un [plugin](../plugins/auto-retry) para ello.

Ese plugin es [muy simple](https://github.com/grammyjs/auto-retry/blob/main/src/mod.ts).
Literalmente sólo duerme y reintenta.
Sin embargo, usarlo tiene una implicación mayor: **cualquier petición puede ser lenta**.
Esto significa que cuando ejecutas tu bot con webhooks, [técnicamente tienes que usar una cola](../guide/deployment-types#terminar-las-solicitudes-de-webhooks-a-tiempo) hagas lo que hagas, o bien tienes que configurar el plugin auto-retry de forma que nunca tarde mucho tiempo---pero entonces tu bot puede saltarse algunas peticiones.

## Cuáles son los límites exactos

No están especificados.

Acéptalo.

Tenemos algunas buenas ideas sobre cuántas peticiones puedes realizar, pero los números exactos son desconocidos.
(Si alguien te dice los límites reales, no está bien informado).
Los límites no son simplemente umbrales duros que puedes averiguar experimentando con la API de bots.
Se trata más bien de restricciones flexibles que cambian en función de las cargas útiles exactas de las solicitudes de tu bot, el número de usuarios y otros factores, no todos ellos conocidos.

He aquí algunos conceptos erróneos y falsas suposiciones sobre los límites de velocidad.

- Mi bot es demasiado nuevo para recibir errores de control de flujo.
- Mi bot no recibe suficiente tráfico para recibir errores de control de flujo.
- Esta característica de mi bot no se utiliza lo suficiente como para recibir errores de control de flujo.
- Mi bot deja suficiente tiempo entre las llamadas a la API para no recibir errores de control de flujo.
- Este método en particular no puede recibir errores de control de flujo.
- El método `getMe` no puede recibir errores de control de flujo.
- El método `getUpdates` no puede recibir errores de control de flujo.

Todo esto es incorrecto.

Vayamos a las cosas que _sí_ sabemos.

## Suposiciones seguras sobre los límites de velocidad

Del [Bot FAQ](https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this), sabemos algunos límites que no pueden ser excedidos, nunca.

1. _"Cuando envíes mensajes dentro de un chat en particular, evita enviar más de un mensaje por segundo. Podemos permitir breves ráfagas que superen este límite, pero con el tiempo empezarás a recibir errores 429."_

   Esto debería estar bastante claro. El plugin de auto-reintento se encarga de esto por ti.

2. _"Si envías notificaciones masivas a varios usuarios, la API no permitirá más de 30 mensajes por segundo. Considera la posibilidad de distribuir las notificaciones en intervalos de 8-12 horas para obtener mejores resultados."_

   **Esto sólo se aplica a las notificaciones masivas, es decir, si envías mensajes de forma proactiva a muchos usuarios.
   Si sólo respondes a los mensajes de los usuarios, no hay problema en enviar 1.000 o más mensajes por segundo.

   Cuando el Bot FAQ dice que debes _"considerar la posibilidad de distribuir las notificaciones a lo largo de grandes intervalos"_, no significa que debas añadir retrasos artificiales.
   Lo importante es que el envío de notificaciones masivas es un proceso que lleva muchas horas.
   No puedes esperar enviar mensajes a todos los usuarios al mismo tiempo.

3. _"Ten en cuenta también que tu bot no podrá enviar más de 20 mensajes por minuto al mismo grupo."_

   De nuevo, bastante claro.
   Completamente ajeno a las notificaciones masivas o a cuántos mensajes se envían en el grupo.
   Y una vez más, el plugin de auto-reintento se encargará de esto por ti.

Hay algunos otros límites conocidos que se revelaron fuera de la documentación oficial de la API de bots.
Por ejemplo, [se sabe](https://t.me/tdlibchat/146123) que los bots sólo pueden hacer hasta 20 ediciones de mensajes en un minuto por chat de grupo.
Sin embargo, se trata de una excepción, y también hay que suponer que estos límites pueden modificarse en el futuro.
Por lo tanto, esta información no afecta a cómo programar tu bot.

Por ejemplo, estrangular tu bot basándote en estas cifras sigue siendo una mala idea:

## Regulación

Algunos piensan que es malo toparse con límites de velocidad.
Prefieren conocer los límites exactos para poder acelerar su bot.

Esto es incorrecto.
Los límites de tarifa son una herramienta útil para controlar las inundaciones y, si actúas en consecuencia, no tendrán ningún impacto negativo en tu bot.
Es decir, superar los límites de velocidad no conlleva prohibiciones.
Ignorarlos, sí.

Es más, [según Telegram](https://t.me/tdlibchat/47285), es "inútil y perjudicial" conocer los límites exactos.

Es _inútil_ porque incluso si conocieras los límites, tendrías que manejar los errores de control de flujo.
Por ejemplo, el servidor Bot API devuelve 429 mientras se apaga para reiniciarse durante el mantenimiento.

Es _perjudicial_ porque si retrasaras artificialmente algunas peticiones para evitar llegar a los límites, el rendimiento de tu bot estaría lejos de ser óptimo.
Esta es la razón por la que siempre debes hacer tus peticiones lo más rápido posible pero respetando todos los errores de control de flujo (usando el plugin de auto-reintento).

Pero si es malo acelerar las peticiones, ¿cómo se puede hacer la difusión?

## Cómo difundir mensajes

La difusión de mensajes puede realizarse siguiendo un planteamiento muy sencillo.

1. Enviar un mensaje a un usuario.
2. Si recibe 429, espere y vuelva a intentarlo.
3. Repita la operación.

No añada retardos artificiales.
(Hacen que la emisión sea más lenta).

No ignore los errores 429.
(Esto podría dar lugar a una prohibición).

No envíes muchos mensajes en paralelo.
(Puedes enviar muy pocos mensajes en paralelo (quizás 3 o así) pero esto puede ser difícil de implementar).

El paso 2 de la lista anterior es realizado automáticamente por el plugin de auto-reintento, por lo que el código se verá así:

```ts
bot.api.config.use(autoRetry());

for (const [chatId, text] of broadcast) {
  await bot.api.sendMessage(chatId, text);
}
```

La parte interesante aquí es lo que `broadcast` será.
Necesitas tener todos tus chats almacenados en alguna base de datos, y necesitas ser capaz de recuperarlos lentamente.

Actualmente, tendrás que implementar esta lógica tú mismo.
En el futuro, queremos crear un plugin de difusión.
Estaremos encantados de recibir tus contribuciones.
Únete a nosotros [aquí](https://t.me/grammyjs).
