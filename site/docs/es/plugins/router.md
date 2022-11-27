# Router (`router`)

La clase `Router` ([Referencia API](https://deno.land/x/grammy_router/router.ts)) proporciona una forma de estructurar tu bot enrutando objetos de contexto a diferentes partes de tu código.
Es una versión más sofisticada de `bot.route` en `Composer` ([grammY API Reference](https://deno.land/x/grammy/mod.ts?s=Composer#method_route_0)).

## Ejemplo

Aquí hay un ejemplo de uso de un enrutador que habla por sí mismo.

```ts
const router = new Router((ctx) => {
  // Determine la ruta a elegir aquí.
  return "key";
});

router.route("key", (ctx) => {/* ... */});
router.route("other-key", (ctx) => {/* ... */});
router.otherwise((ctx) => {/* ... */}); // se llama si no hay ninguna ruta que coincida

bot.use(router);
```

## Integración con Middleware

Naturalmente, el plugin del enrutador se integra perfectamente con las [jerarquías de middleware de grammY](../advanced/middleware.md).
Por ejemplo, puedes filtrar más las actualizaciones después de enrutarlas.

```ts
router.route("key").on("message:text", (ctx) => {/* ... */});
const other = router.otherwise();
other.on(":text", (ctx) => {/* ... */});
other.use((ctx) => {/* ... */});
```

También puedes revisar [esta sección](../guide/filter-queries.md#combinacion-de-consultas-con-otros-metodos) sobre la combinación de manejadores de middleware.

## Combinación de enrutadores con sesiones

Los enrutadores funcionan bien junto con las [sesiones](./session.md).
A modo de ejemplo, la combinación de ambos conceptos permite recrear formularios en la interfaz del chat.

> Tenga en cuenta que una solución mucho mejor es utilizar el [plugin de conversaciones](./conversations.md).
> El resto de esta página está obsoleta desde que se creó ese plugin.
> Mantendremos esta página como referencia para aquellos que usaban el enrutador para los formularios.

Digamos que quieres construir un bot que le diga a los usuarios cuántos días faltan para su cumpleaños.
Para calcular el número de días, el bot tiene que saber el mes (por ejemplo, junio) y el día del mes (por ejemplo, el 15) del cumpleaños.

Por lo tanto, el bot tiene que hacer dos preguntas

1. ¿En qué mes nació el usuario?
2. ¿Qué día del mes ha nacido el usuario?

Sólo si se conocen ambos valores, el bot puede decir al usuario cuántos días le quedan.

Así es como se podría implementar un bot de este tipo:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context, Keyboard, session, SessionFlavor } from "grammy";
import { Router } from "@grammyjs/router";

interface SessionData {
  step: "idle" | "day" | "month"; // en qué paso del formulario estamos
  dayOfMonth?: number; // día de cumpleaños
  month?: number; // mes de cumpleaños
}
type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>("");

// Usar sesiones
bot.use(session({ initial: (): SessionData => ({ step: "idle" }) }));

// Definir algunos comandos.
bot.command("start", async (ctx) => {
  await ctx.reply(`¡Bienvenido!
¡Puedo decirte en cuántos días es tu cumpleaños!
Envía /birthday para empezar`);
});

bot.command("birthday", async (ctx) => {
  const day = ctx.session.dayOfMonth;
  const month = ctx.session.month;
  if (day !== undefined && month !== undefined) {
    // ¡Información ya proporcionada!
    await ctx.reply(`¡Tu cumpleaños es en ${getDays(month, day)} días!`);
  } else {
    // Falta información, introduzca el formulario basado en el router
    ctx.session.step = "day";
    await ctx.reply(
"¡Por favor, envíame el día del mes \
 de tu cumpleaños como un número!",
    );
  }
});

// Utilizar el router.
const router = new Router<MyContext>((ctx) => ctx.session.step);

// Definir el paso que maneja el día.
const day = router.route("day");
day.on("message:text", async (ctx) => {
  const day = parseInt(ctx.msg.text, 10);
  if (isNaN(day) || day < 1 || 31 < day) {
    await ctx.reply("¡Ese no es un día válido, inténtelo de nuevo!");
    return;
  }
  ctx.session.dayOfMonth = day;
  // Formulario de avance al paso del mes
  ctx.session.step = "month";
  await ctx.reply("¡Lo tengo! Ahora, ¡envíame el mes!", {
    reply_markup: {
      one_time_keyboard: true,
      keyboard: new Keyboard()
        .text("Jan").text("Feb").text("Mar").row()
        .text("Apr").text("May").text("Jun").row()
        .text("Jul").text("Aug").text("Sep").row()
        .text("Oct").text("Nov").text("Dec").build(),
    },
  });
});
day.use((ctx) =>
  ctx.reply("¡Por favor, envíenme el día en forma de mensaje de texto!")
);

// Definir el paso que maneja el mes.
const month = router.route("month");
month.on("message:text", async (ctx) => {
  // No debería ocurrir, a menos que los datos de la sesión estén corruptos.
  const day = ctx.session.dayOfMonth;
  if (day === undefined) {
    await ctx.reply("¡Necesito tu día del mes!");
    ctx.session.step = "day";
    return;
  }

  const month = months.indexOf(ctx.msg.text);
  if (month === -1) {
    await ctx.reply(
"¡Ese no es un mes válido, \
por favor, utilice uno de los botones",
    );
    return;
  }

  ctx.session.month = month;
  const diff = getDays(month, day);
  await ctx.reply(
    `Su cumpleaños es en ${months[month]} ${day}.
¡Eso es en ${diff} días!`,
    { reply_markup: { remove_keyboard: true } },
  );
  ctx.session.step = "idle";
});
month.use((ctx) => ctx.reply("¡Por favor, pulse uno de los botones.!"));

// Definir el paso que maneja todos los demás casos.
router.otherwise(async (ctx) => { // idle
  await ctx.reply(
    "Envía /cumpleaños para saber cuánto tiempo tienes que esperar",
  );
});

bot.use(router); // registrar el router
bot.start();

// Utilidades de conversión de fechas
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
function getDays(month: number, day: number) {
  const bday = new Date();
  const now = Date.now();
  bday.setMonth(month);
  bday.setDate(day);
  if (bday.getTime() < now) bday.setFullYear(bday.getFullYear() + 1);
  const diff = (bday.getTime() - now) / (1000 * 60 * 60 * 24);
  return diff;
}
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const { Bot, Context, Keyboard, session, SessionFlavor } = require("grammy");
const { Router } = require("@grammyjs/router");

const bot = new Bot("");

// Usar sesiones.
bot.use(session({ initial: () => ({ step: "idle" }) }));

// Definir algunos comandos.
bot.command("start", async (ctx) => {
  await ctx.reply(`¡Bienvenido!
¡Puedo decirte en cuántos días es tu cumpleaños!
Envía /birthday para empezar`);
});

bot.command("birthday", async (ctx) => {
  const day = ctx.session.dayOfMonth;
  const month = ctx.session.month;
  if (day !== undefined && month !== undefined) {
    // ¡Información ya proporcionada!
    await ctx.reply(`¡Tu cumpleaños es en ${getDays(month, day)} días!`);
  } else {
    // Falta información, introduzca el formulario basado en el router.
    ctx.session.step = "day";
    await ctx.reply(
"¡Por favor, envíame el día del mes \
 de tu cumpleaños como un número!",
    );
  }
});

// Utilizar el router.
const router = new Router((ctx) => ctx.session.step);

/// Definir el paso que maneja el día.
const day = router.route("day");
day.on("message:text", async (ctx) => {
  const day = parseInt(ctx.msg.text, 10);
  if (isNaN(day) || day < 1 || 31 < day) {
    await ctx.reply("¡Ese no es un día válido, inténtelo de nuevo!");
    return;
  }
  ctx.session.dayOfMonth = day;
  // Formulario de avance al paso del mes
  ctx.session.step = "month";
  await ctx.reply("¡Lo tengo! Ahora, ¡envíame el mes!", {
    reply_markup: {
      one_time_keyboard: true,
      keyboard: new Keyboard()
        .text("Jan").text("Feb").text("Mar").row()
        .text("Apr").text("May").text("Jun").row()
        .text("Jul").text("Aug").text("Sep").row()
        .text("Oct").text("Nov").text("Dec").build(),
    },
  });
});
day.use((ctx) =>
  ctx.reply("¡Por favor, envíenme el día en forma de mensaje de texto!")
);

// Definir el paso que maneja el mes.
const month = router.route("month");
month.on("message:text", async (ctx) => {
  // No debería ocurrir, a menos que los datos de la sesión estén corruptos.
  const day = ctx.session.dayOfMonth;
  if (day === undefined) {
    await ctx.reply("¡Necesito tu día del mes!");
    ctx.session.step = "day";
    return;
  }

  const month = months.indexOf(ctx.msg.text);
  if (month === -1) {
    await ctx.reply(
"¡Ese no es un mes válido, \
por favor, utilice uno de los botones",
    );
    return;
  }

  ctx.session.month = month;
  const diff = getDays(month, day);
  await ctx.reply(
    `Su cumpleaños es en ${months[month]} ${day}.
¡Eso es en ${diff} días!`,
    { reply_markup: { remove_keyboard: true } },
  );
  ctx.session.step = "idle";
});
month.use((ctx) => ctx.reply("¡Por favor, pulse uno de los botones.!"));

// Definir el paso que maneja todos los demás casos.
router.otherwise(async (ctx) => { // idle
  await ctx.reply(
    "Envía /cumpleaños para saber cuánto tiempo tienes que esperar",
  );
});

bot.use(router); // registrar el router
bot.start();

// Utilidades de conversión de fechas
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
function getDays(month, day) {
  const bday = new Date();
  const now = Date.now();
  bday.setMonth(month);
  bday.setDate(day);
  if (bday.getTime() < now) bday.setFullYear(bday.getFullYear() + 1);
  const diff = (bday.getTime() - now) / (1000 * 60 * 60 * 24);
  return diff;
}
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import {
  Bot,
  Context,
  Keyboard,
  session,
  SessionFlavor,
} from "https://deno.land/x/grammy/mod.ts";
import { Router } from "https://deno.land/x/grammy_router/router.ts";

interface SessionData {
  step: "idle" | "day" | "month"; // en qué paso del formulario estamos
  dayOfMonth?: number; // día de cumpleaños
  month?: number; // mes de cumpleaños
}
type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>("");

// Usar sesiones.
bot.use(session({ initial: (): SessionData => ({ step: "idle" }) }));

// Definir algunos comandos.
bot.command("start", async (ctx) => {
  await ctx.reply(`¡Bienvenido!
¡Puedo decirte en cuántos días es tu cumpleaños!
Envía /birthday para empezar`);
});

bot.command("birthday", async (ctx) => {
  const day = ctx.session.dayOfMonth;
  const month = ctx.session.month;
  if (day !== undefined && month !== undefined) {
    // ¡Información ya proporcionada!
    await ctx.reply(`¡Tu cumpleaños es en ${getDays(month, day)} días!`);
  } else {
    // Falta información, introduzca el formulario basado en el router
    ctx.session.step = "day";
    await ctx.reply(
"¡Por favor, envíame el día del mes \
 de tu cumpleaños como un número!",
    );
  }
});

// Utilizar el router.
const router = new Router<MyContext>((ctx) => ctx.session.step);

// Definir el paso que maneja el día.
const day = router.route("day");
day.on("message:text", async (ctx) => {
  const day = parseInt(ctx.msg.text, 10);
  if (isNaN(day) || day < 1 || 31 < day) {
    await ctx.reply("¡Ese no es un día válido, inténtelo de nuevo!");
    return;
  }
  ctx.session.dayOfMonth = day;
  // Formulario de avance al paso del mes
  ctx.session.step = "month";
  await ctx.reply("¡Lo tengo! Ahora, ¡envíame el mes!", {
    reply_markup: {
      one_time_keyboard: true,
      keyboard: new Keyboard()
        .text("Jan").text("Feb").text("Mar").row()
        .text("Apr").text("May").text("Jun").row()
        .text("Jul").text("Aug").text("Sep").row()
        .text("Oct").text("Nov").text("Dec").build(),
    },
  });
});
day.use((ctx) =>
  ctx.reply("¡Por favor, envíenme el día en forma de mensaje de texto!")
);

// Definir el paso que maneja el mes.
const month = router.route("month");
month.on("message:text", async (ctx) => {
  // No debería ocurrir, a menos que los datos de la sesión estén corruptos.
  const day = ctx.session.dayOfMonth;
  if (day === undefined) {
    await ctx.reply("¡Necesito tu día del mes!");
    ctx.session.step = "day";
    return;
  }

  const month = months.indexOf(ctx.msg.text);
  if (month === -1) {
    await ctx.reply(
"¡Ese no es un mes válido, \
por favor, utilice uno de los botones",
    );
    return;
  }

  ctx.session.month = month;
  const diff = getDays(month, day);
  await ctx.reply(
    `Su cumpleaños es en ${months[month]} ${day}.
¡Eso es en ${diff} días!`,
    { reply_markup: { remove_keyboard: true } },
  );
  ctx.session.step = "idle";
});
month.use((ctx) => ctx.reply("¡Por favor, pulse uno de los botones.!"));

// Definir el paso que maneja todos los demás casos.
router.otherwise(async (ctx) => { // idle
  await ctx.reply(
    "Envía /cumpleaños para saber cuánto tiempo tienes que esperar",
  );
});

bot.use(router); // registrar el router
bot.start();

// Utilidades de conversión de fechas
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
function getDays(month: number, day: number) {
  const bday = new Date();
  const now = Date.now();
  bday.setMonth(month);
  bday.setDate(day);
  if (bday.getTime() < now) bday.setFullYear(bday.getFullYear() + 1);
  const diff = (bday.getTime() - now) / (1000 * 60 * 60 * 24);
  return diff;
}
```

</CodeGroupItem>
</CodeGroup>

Observe cómo la sesión tiene una propiedad `step` que almacena el paso del formulario, es decir, qué valor se está rellenando actualmente.
El router se utiliza para saltar entre diferentes middleware que completan los campos `month` y `dayOfMonth` de la sesión.
Si ambos valores son conocidos, el bot calcula los días restantes y los envía de vuelta al usuario.

## Resumen del plugin

- Nombre: `router`
- Fuente: <https://github.com/grammyjs/router>
- Referencia: <https://deno.land/x/grammy_router/router.ts>
