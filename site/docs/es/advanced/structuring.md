# Escalando I: Gran base de código

Tan pronto como tu bot crezca en complejidad, te vas a enfrentar al reto de cómo estructurar la base de código de tu aplicación.
Naturalmente, puedes dividirlo en archivos.

## Solución posible

> grammY es todavía bastante joven y no proporciona ninguna integración oficial con contenedores DI todavía.
> Suscríbete a [@grammyjs_news](https://t.me/grammyjs_news) para ser notificado tan pronto como demos soporte a esto.

Eres libre de estructurar tu código como quieras, y no hay una solución única para todos.
Dicho esto, una estrategia directa y probada para estructurar tu código es la siguiente:

1. Agrupa las cosas que semánticamente pertenecen juntas en el mismo archivo (o, dependiendo del tamaño del código, directorio).
   Cada una de estas partes expone el middleware que manejará los mensajes designados.
2. Crea una instancia del bot de forma centralizada que aglutine todo el middleware instalándolo en el bot.
3. (Opcional.) Pre-filtrar las actualizaciones de forma centralizada, y enviar las actualizaciones sólo de la forma correcta.
   También puedes consultar `bot.route` ([Referencia de la API](/ref/core/Composer#route)) o alternativamente el [router plugin](../plugins/router) para ello.

Un ejemplo ejecutable que implementa la estrategia anterior puede encontrarse en el [Repositorio de ejemplos de bots](https://github.com/grammyjs/examples/tree/main/scaling).

## Estructura de ejemplo

Para un bot muy simple que gestiona una lista de TODO, podrías imaginar esta estructura.

```asciiart:no-line-numbers
src/
├── bot.ts
└── todo/
    ├── item.ts
    └── list.ts
```

`item.ts` sólo define algunas cosas sobre los elementos TODO, y estas partes de código se utilizan en `list.ts`.

En `list.ts`, entonces harías algo así:

```ts
export const lists = new Composer();

// Registra aquí algunos handlers que manejen tu middleware de la forma habitual.
lists.on("message", async (ctx) => {/* ... */});
```

> Ten en cuenta que si usas TypeScript, necesitas pasar tu [tipo de contexto personalizado](../guide/context#personalizacion-del-objeto-de-contexto) al crear el compositor.
> Por ejemplo, necesitarás usar `new Composer<MyContext>()`.

Opcionalmente, puedes usar un [error boundary](../guide/errors#error-boundaries) para manejar todos los errores que ocurran dentro de tu módulo.

Ahora, en `bot.ts`, puedes instalar este módulo así:

```ts
import { lists } from "./todo/list";

const bot = new Bot("");

bot.use(lists);
// ... quizás más módulos como `todo` aquí

bot.start();
```

Opcionalmente, puedes utilizar el [plugin enrutador](../plugins/router) o [`bot.route`](/ref/core/Composer#route) para agrupar los diferentes módulos, si eres capaz de determinar qué middleware es responsable por adelantado.

Sin embargo, recuerda que la forma exacta de cómo estructurar tu bot es muy difícil de decir genéricamente.
Como siempre en el software, hazlo de la manera que tenga más sentido :wink:

## Definiciones de tipos para middleware extraído

La estructura anterior utilizando compositores funciona bien.
Sin embargo, a veces puedes encontrarte en la situación de querer extraer un manejador dentro de una función, en lugar de crear un nuevo compositor y añadirle la lógica.
Esto requiere que añadas las definiciones de tipo middleware correctas a tus handlers porque ya no pueden ser inferidas a través del compositor.

grammY exporta definiciones de tipo para todos los **tipos limitados de middleware**, como el middleware que puedes pasar a los manejadores de comandos.
Además, exporta las definiciones de tipo para los **objetos de contexto restringido** que se están utilizando en ese middleware.
Ambos tipos se parametrizan con tu [objeto de contexto personalizado](../guide/context#personalizacion-del-objeto-de-contexto).
Así, un manejador de comandos tendría el tipo `CommandMiddleware<MyContext>` y su objeto de contexto `CommandContext<MyContext>`.
Se pueden utilizar de la siguiente manera.

::: code-group

```ts [Node.js]
import {
  type CallbackQueryMiddleware,
  type CommandContext,
  type NextFunction,
} from "grammy";

function commandMiddleware(ctx: CommandContext<MyContext>, next: NextFunction) {
  // gestión de comandos
}
const callbackQueryMiddleware: CallbackQueryMiddleware<MyContext> = (ctx) => {
  // gestión de consultas callback
};

bot.command(["start", "help"], commandMiddleware);
bot.callbackQuery("query-data", callbackQueryMiddleware);
```

```ts [Deno]
import {
  type CallbackQueryMiddleware,
  type CommandContext,
  type NextFunction,
} from "https://deno.land/x/grammy/mod.ts";

function commandMiddleware(ctx: CommandContext<MyContext>, next: NextFunction) {
  // gestión de comandos
}
const callbackQueryMiddleware: CallbackQueryMiddleware<MyContext> = (ctx) => {
  // gestión de consultas callback
};

bot.command(["start", "help"], commandMiddleware);
bot.callbackQuery("query-data", callbackQueryMiddleware);
```

:::

Echa un vistazo a la [referencia API de alias de tipo](https://deno.land/x/grammy/mod.ts#Type_Aliases) para ver un resumen de todos los alias de tipo que exporta grammY.
