---
prev: ./middleware.md
next: ./scaling.md
---

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
   También puedes consultar `bot.route` ([Referencia de la API](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/Composer#route)) o alternativamente el [router plugin](/plugins/router.md) para ello.

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
lists.on('message', ctx => { ... });
```

Opcionalmente, puedes usar un [error boundary](/guide/errors.md#error-boundaries) para manejar todos los errores que ocurran dentro de tu módulo.

Ahora, en `bot.ts`, puedes instalar este módulo así:

```ts
import { lists } from "./todo/list";

const bot = new Bot("<token>");

bot.use(lists);
// .. quizás más módulos como `todo` aquí

bot.start();
```

Opcionalmente, puedes utilizar el [router plugin](/plugins/router.md) o agrupar los diferentes módulos, si eres capaz de determinar qué middleware es responsable por adelantado.

Sin embargo, recuerda que la forma exacta de cómo estructurar tu bot es muy difícil de decir genéricamente.
Como siempre en el software, hazlo de la manera que tenga más sentido :wink:
