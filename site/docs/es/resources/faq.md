# FAQ

<!-- markdownlint-disable link-fragments -->

Aquí hay una colección de preguntas frecuentes sobre [errores comunes](#¿por-qué-recibo-este-error) y [cosas de Deno](#preguntas-sobre-deno).

<!-- markdownlint-enable link-fragments -->

Si este FAQ no responde a tu pregunta, también deberías echar un vistazo al [Bot FAQ](https://core.telegram.org/bots/faq) escrito por el equipo de Telegram.

## ¿Dónde puedo encontrar documentación sobre un método?

En la referencia de la API.

Probablemente quieras entender mejor [esto](../guide).

## ¡A un Método le Falta un Parámetro!

No, no es así.

1. Asegúrate de que tienes instalada la última versión de grammY.
2. Comprueba [aquí](https://core.telegram.org/bots/api) si el parámetro es opcional.
   Si lo es, entonces grammY lo recogerá en el objeto de opciones llamado `other`.
   Pasa `{ parameter_name: value }` en ese lugar y funcionará.
   Como siempre, TypeScript autocompletará los nombres de los parámetros por ti.
3. Comprueba la firma del método para las [acciones disponibles](../guide/context.md#acciones-disponibles) en `ctx` [aquí](https://deno.land/x/grammy/mod.ts?s=Context#Methods), o para los métodos API (`ctx.api`, `bot.api`) [aquí](https://deno.land/x/grammy/mod.ts?s=Api#Methods).

## ¿Por qué recibo este error?

### 400 Bad Request: Cannot parse entities

Estás enviando un mensaje con formato, es decir, estás configurando `parse_mode` al enviar un mensaje.
Sin embargo, tu formato está roto, por lo que Telegram no sabe cómo analizarlo.
Deberías releer la [sección sobre formato](https://core.telegram.org/bots/api#formatting-options) en los documentos de Telegram.
El desplazamiento de bytes que se menciona en el mensaje de error te dirá dónde está exactamente el error en tu cadena.

::: consejo Pasar entidades en lugar de formato
Puedes pre-preparar las entidades para Telegram si quieres, y especificar `entidades` cuando envíes tu mensaje.
El texto de tu mensaje podría entonces ser una cadena regular.
De esta manera, no tienes que preocuparte de escapar caracteres extraños.
Esto puede parecer que necesita más código, pero de hecho es la solución mucho más fiable y a prueba de tontos para este problema.
Y lo que es más importante, esto se simplifica enormemente con nuestro [plugin parse-mode](../plugins/parse-mode.md).
:::

### 401 Unauthorized

Tu token de bot está mal.
Tal vez pienses que está bien.
No lo es.
Habla con [@BotFather](https://t.me/BotFather) para ver cuál es tu token.

### 403 Forbidden: bot was blocked by the user

Probablemente has intentado enviar un mensaje a un usuario y te has encontrado con este problema.

Cuando un usuario bloquea tu bot, no puedes enviarle mensajes ni interactuar con él de ninguna otra manera (excepto si tu bot fue invitado a un chat de grupo donde el usuario es miembro).
Telegram hace esto para proteger a sus usuarios.
No puedes hacer nada al respecto.

Puedes:

- Manejar el error y, por ejemplo, eliminar los datos del usuario de tu base de datos.
- Ignorar el error.
- Escuchar las actualizaciones de `my_chat_member` a través de `bot.on("my_chat_member")` para ser notificado cuando el usuario bloquee tu bot.
  Sugerencia: Compara los campos `status` del antiguo y del nuevo miembro del chat.

### 404 Not found

Si esto ocurre al iniciar tu bot, entonces tu token de bot está equivocado.
Habla con [@BotFather](https://t.me/BotFather) para ver cuál es tu token.

Si tu bot funciona bien la mayor parte del tiempo, pero de repente te sale un 404, entonces estás haciendo algo muy raro.
Puede venir a preguntarnos en el [chat de grupo](https://t.me/grammyjs) (o en el [chat de grupo de habla rusa](https://t.me/grammyjs_ru)).

### 409 Conflict: terminated by other getUpdates request

Accidentalmente estás ejecutando tu bot dos veces en un sondeo largo.
Sólo puedes ejecutar una instancia de tu bot.

Si crees que sólo ejecutas tu bot una vez, puedes revocar el token del bot.
Eso detendrá todas las demás instancias.
Habla con [@BotFather](https://t.me/BotFather) para hacer esto.

### 429: Too Many Requests: retry after X

¡Enhorabuena!
Te has encontrado con un error que está entre los más difíciles de arreglar.

Hay dos escenarios posibles:

**Uno**: Tu bot no tiene muchos usuarios.
En ese caso, sólo estás haciendo spam a los servidores de Telegram enviando demasiadas solicitudes.
Solución: ¡no hagas eso!
Deberías pensar seriamente en cómo reducir sustancialmente el número de llamadas a la API.

**Dos**: Tu bot se está haciendo muy popular y tiene muchos usuarios (cientos de miles).
Ya te has asegurado de utilizar el mínimo número de llamadas a la API para las operaciones más comunes de tu bot, y _aún_ te encuentras con estos errores (llamados flood wait).

Hay algunas cosas que puedes hacer:

1. Leer [este artículo en los docs](../advanced/flood.md) para obtener una comprensión básica de la situación.
2. Utilice el [plugin `transformer-throttler`](../plugins/transformer-throttler.md).
3. Utiliza el [plugin `auto-retry`](../plugins/auto-retry.md).
4. Ven a pedirnos ayuda en el [chat de grupo](https://t.me/grammyjs).
   Allí tenemos gente con experiencia.
5. Es posible pedirle a Telegram que aumente los límites, pero es muy poco probable que esto ocurra si no hiciste los pasos 1-3 primero.

### Cannot find type definition file for 'node-fetch'

Esto es el resultado de algunas declaraciones de tipo que faltan.

La forma recomendada de arreglar esto es establecer `skipLibCheck` a `true` en sus opciones de compilación de TypeScript.

Si está seguro de que necesita mantener esta opción a `false`, puede instalar las definiciones de tipos que faltan ejecutando `npm i -D @types/node-fetch@2`.

## Preguntas sobre Deno

### ¿Por qué apoyan a Deno?

Algunas razones importantes por las que nos gusta más Deno que Node.js:

- Es más sencillo y rápido para empezar.
- Las herramientas son sustancialmente mejores.
- Ejecuta TypeScript de forma nativa.
- No es necesario mantener `package.json` o `node_modules`.
- Tiene una biblioteca estándar revisada.

> Deno fue fundado por Ryan Dahl-la misma persona que inventó Node.js.
> Él resumió sus 10 arrepentimientos sobre Node.js en [este video](https://youtu.be/M3BM9TB-8yA).

grammY en sí mismo es Deno-first, y está respaldado para soportar Node.js igualmente bien.
