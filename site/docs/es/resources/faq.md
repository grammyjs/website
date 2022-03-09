# FAQ

Aquí hay una colección de preguntas frecuentes [sobre el propio grammY](#questions-about-grammy), [errores comunes](#why-am-i-getting-this-error)), y [cosas de Deno](#questions-about-deno).

Si este FAQ no responde a tu pregunta, también deberías echar un vistazo al Bot FAQ escrito por el equipo de Telegram.

## Preguntas sobre grammY

### ¿Qué es grammY?

grammY es una pieza de software que puedes usar cuando quieras programar tu propio bot de chat para [el mensajero de Telegram](https://telegram.org).
Cuando haces bots, te darás cuenta de que algunas partes de este proceso son tediosas y siempre iguales.
grammY hace el trabajo pesado por ti y hace que sea súper sencillo crear un bot.

### ¿Cuándo se creó grammY?

La primera publicación del código de grammY fue a finales de marzo de 2021.
Llegó a la primera versión estable unas semanas después.

### ¿Cómo se desarrolla grammY?

grammY es un software completamente libre y de código abierto, desarrollado por un equipo de voluntarios.
Su código está disponible en GitHub.

¡Eres bienvenido a [unirte a nosotros](https://t.me/grammyjs)!
(¡Si hablas ruso, también puedes unirte a nosotros [aquí](https://t.me/grammyjs_ru)!)

### ¿Qué lenguaje de programación utiliza grammY?

grammY está escrito desde el principio en TypeScript, un superconjunto de JavaScript.
Por lo tanto, se ejecuta en Node.js.

Sin embargo, grammY también puede ejecutarse en Deno, que se posiciona como el sucesor de Node.js.
(Técnicamente, puedes incluso ejecutar grammY en los navegadores modernos, aunque esto rara vez será útil).

### ¿Cómo se compara grammY con sus competidores?

Si vienes de un lenguaje de programación o marco de trabajo diferente, puedes revisar nuestra [comparación detallada entre marcos de trabajo](./comparison.md).

## ¿Por qué recibo este error?

### 400 Bad Request: No se pueden analizar las entidades

Estás enviando un mensaje con formato, es decir, estás configurando `parse_mode` al enviar un mensaje.
Sin embargo, tu formato está roto, por lo que Telegram no sabe cómo analizarlo.
Deberías releer [la sección sobre formato](https://core.telegram.org/bots/api#formatting-options) en los documentos de Telegram.
El desplazamiento de bytes que se menciona en el mensaje de error te dirá dónde está exactamente el error en tu cadena.

::: tip Pasar entidades en lugar de formato
Puedes pre-preparar las entidades para Telegram si quieres, y especificar `entidades` cuando envíes tu mensaje.
El texto de tu mensaje podría entonces ser una cadena regular.
De esta manera, no tienes que preocuparte de escapar caracteres extraños.
Esto puede parecer que necesita más código, pero de hecho es la solución mucho más fiable y a prueba de tontos para este problema.
:::

### 401 No autorizado

Tu bot token está mal.
Tal vez pienses que es correcto.
No lo es.
Habla con [@BotFather](https://t.me/BotFather) para ver cuál es tu token.

### 403 Prohibido: el bot fue bloqueado por el usuario

Probablemente has intentado enviar un mensaje a un usuario y te has encontrado con este problema.

Cuando un usuario bloquea tu bot, no puedes enviarle mensajes ni interactuar con él de ninguna otra manera (excepto si tu bot fue invitado a un chat de grupo donde el usuario es miembro).
Telegram hace esto para proteger a sus usuarios.
No puedes hacer nada al respecto.

Puedes:

- Manejar el error y, por ejemplo, eliminar los datos del usuario de tu base de datos.
- Ignorar el error.
- Escuchar las actualizaciones de `my_chat_member` a través de `bot.on("my_chat_member")` para ser notificado cuando el usuario bloquee tu bot.
  Sugerencia: Compara los campos `status` del antiguo y del nuevo miembro del chat.

### 404 No encontrado

Si esto ocurre al iniciar tu bot, entonces tu token de bot está equivocado.
Habla con [@BotFather](https://t.me/BotFather) para ver cuál es tu token.

Si tu bot funciona bien la mayor parte del tiempo, pero de repente te sale un 404, entonces estás haciendo algo muy raro.
Puedes venir a preguntarnos en el chat del grupo.

### 409 Conflicto: terminado por otra solicitud de getUpdates

Accidentalmente estás ejecutando tu bot dos veces en un sondeo largo.
Sólo puedes ejecutar una instancia de tu bot.

Si crees que sólo ejecutas tu bot una vez, puedes revocar el token del bot.
Eso detendrá todas las demás instancias.
Habla con [@BotFather](https://t.me/BotFather) para hacer esto.

### 429: Demasiadas solicitudes: reintentar después de X

Enhorabuena.
Te has encontrado con un error que está entre los más difíciles de arreglar.

Hay dos escenarios posibles.

Uno: Tu bot no tiene muchos usuarios.
En ese caso, sólo estás haciendo spam a los servidores de Telegram enviando demasiadas solicitudes.
Solución: no hagas eso.
Deberías pensar seriamente en cómo reducir sustancialmente el número de llamadas a la API.

Dos: Tu bot se está haciendo muy popular y tiene muchos usuarios (cientos de miles).
Ya te has asegurado de utilizar el mínimo número de llamadas a la API para las operaciones más comunes de tu bot, y _aún_ te encuentras con estos errores (llamados flood wait).

Hay algunas cosas que puedes hacer

1. Leer [este artículo en los docs](/advanced/flood.md) para obtener una comprensión básica de la situación.
2. Utilice [el plugin `transformer-throttler`](/plugins/transformer-throttler.md).
3. Utiliza [el plugin `auto-retry`](/plugins/auto-retry.md).
4. Ven a pedirnos ayuda en el chat del grupo. Tenemos gente experimentada allí.
5. Es posible pedirle a Telegram que aumente los límites, pero es muy poco probable que esto ocurra si no hiciste los pasos 1-3 primero.

## Preguntas sobre Deno

### ¿Por qué apoyan a Deno?

Algunas razones importantes por las que nos gusta más Deno que Node.js:

- Es más sencillo y rápido de empezar.
- Las herramientas son sustancialmente mejores.
- Ejecuta TypeScript de forma nativa.
- No es necesario mantener `package.json` o `node_modules`.
- Tiene una biblioteca estándar revisada.

> Deno fue fundado por Ryan Dahl-la misma persona que inventó Node.js.
> Él resumió sus 10 arrepentimientos sobre Node.js en [este video](https://youtu.be/M3BM9TB-8yA).

grammY en sí mismo es Deno-first, y está respaldado para soportar Node.js igualmente bien.

### ¿Dónde puedo alojar una aplicación Deno?

Dado que Deno es nuevo y su ecosistema es más pequeño, el número de lugares donde se puede alojar una aplicación Deno es menor que el de Node.js.

Estos son algunos de los lugares donde puede alojar su aplicación Deno:

1. [Trabajadores de Cloudflare](https://workers.dev)
2. [Deno Deploy](https://deno.com/deploy)
3. [Heroku](https://dev.to/ms314006/deploy-your-deno-apps-to-heroku-375h)
4. [Vercel](https://github.com/vercel-community/deno)
