---
prev: false
next: false
---

# Comandos (`commands`)

Manejo de comandos con esteroides.

Este complemento ofrece funciones avanzadas de gestión de comandos que van más allá de la [gestión de comandos de la biblioteca principal](../guide/commands).
He aquí un rápido resumen de lo que obtienes con este plugin:

- Mejor legibilidad del código encapsulando el middleware con definiciones de comandos.
- Sincronización del menú de comandos de usuario mediante `setMyCommands`.
- Mejora de la agrupación y organización de comandos.
- Alcance de comandos, por ejemplo, limitando el acceso a administradores de grupo o canales específicos.
- Soporte para traducciones de comandos.
- Función `¿Quería decir...?` para sugerir el comando más cercano cuando un usuario comete un error tipográfico.
- Coincidencia de comandos sin distinción entre mayúsculas y minúsculas.
- Configuración de comportamientos personalizados para comandos que mencionan explícitamente el nombre de usuario de tu bot, como `/start@your_bot`.
- Prefijos de comandos personalizados, por ejemplo `+`, `?`, o cualquier símbolo en lugar de `/`.
- Comandos que no se encuentran al principio del mensaje.
- Comandos RegExp.

Todas estas funciones se basan en estructuras de comandos centrales que tú defines para tu bot.

## Uso básico

Antes de entrar en materia, echa un vistazo a cómo puedes registrar y manejar un comando con el plugin:

```ts
const myCommands = new CommandGroup();

myCommands.command("hello", "Di hola", (ctx) => ctx.reply(`¡Hola, mundo!`));

bot.use(myCommands);
```

Esto registra un nuevo comando `/hello` a tu bot, que será manejado por el middleware dado.

Ahora, vamos a entrar en algunas de las herramientas adicionales que este plugin tiene para ofrecer.

## Importación

En primer lugar, así es como puedes importar todos los tipos y clases necesarios proporcionados por el plugin.

::: code-group

```ts [TypeScript]
import {
  CommandGroup,
  commandNotFound,
  commands,
  type CommandsFlavor,
} from "@grammyjs/commands";
```

```js [JavaScript]
const { CommandGroup, commandNotFound, commands } = require(
  "@grammyjs/commands",
);
```

```ts [Deno]
import {
  CommandGroup,
  commandNotFound,
  commands,
  type CommandsFlavor,
} from "https://deno.land/x/grammy_commands/mod.ts";
```

:::

Ahora que las importaciones están asentadas, veamos cómo podemos hacer que nuestros comandos sean visibles para nuestros usuarios.

## Configuración del menú de comandos de usuario

Una vez que hayas definido tus comandos utilizando la clase `CommandGroup`, puedes llamar al método `setCommands` para añadir todos los comandos definidos al menú de comandos de usuario.

```ts
const myCommands = new CommandGroup();

myCommands.command("hello", "Di hola", (ctx) => ctx.reply(`¡Hola!`));

bot.use(myCommands);

// Update the user command menu
await myCommands.setCommands(bot); // [!code highlight]
```

Esto garantiza que cada comando registrado aparezca en el menú de un chat privado con tu bot o cuando los usuarios escriban `/` en un chat en el que tu bot sea miembro.

### Acceso directo contextual

¿Qué pasa si quieres que algunos comandos sólo se muestren a determinados usuarios?
Por ejemplo, imagina que tienes un comando `login` y otro `logout`.
El comando `login` sólo debería aparecer para los usuarios que han cerrado sesión, y viceversa.
He aquí cómo hacerlo con el plugin de comandos:

::: code-group

```ts [TypeScript]
// Utilice el flavor para crear un contexto personalizado
type MyContext = CommandsFlavor<Context>;

// Utiliza el nuevo contexto para instanciar tu bot
const bot = new Bot<MyContext>(""); // <-- pon tu bot token entre los "" (https://t.me/BotFather)

// Registrar el acceso directo de contexto
bot.use(commands());

const loggedOutCommands = new CommandGroup<MyContext>();
const loggedInCommands = new CommandGroup<MyContext>();

loggedOutCommands.command(
  "login",
  "Inicie su sesión con el bot",
  async (ctx) => {
    await ctx.setMyCommands(loggedInCommands);
    await ctx.reply("¡Bienvenidos! ¡Sesión iniciada!");
  },
);

loggedInCommands.command(
  "logout",
  "Termina tu sesión con el bot",
  async (ctx) => {
    await ctx.setMyCommands(loggedOutCommands);
    await ctx.reply("Hasta luego :)");
  },
);

bot.use(loggedInCommands);
bot.use(loggedOutCommands);

// Por defecto, los usuarios no están logueados,
// para que puedas establecer los comandos de cierre de sesión para todos
await loggedOutCommands.setCommands(bot);
```

```js [JavaScript]
const bot = new Bot(""); // <-- pon tu bot token entre los "" (https://t.me/BotFather)

// Registrar el acceso directo de contexto
bot.use(commands());

const loggedOutCommands = new CommandGroup();
const loggedInCommands = new CommandGroup();

loggedOutCommands.command(
  "login",
  "Inicie su sesión con el bot",
  async (ctx) => {
    await ctx.setMyCommands(loggedInCommands);
    await ctx.reply("¡Bienvenidos! ¡Sesión iniciada!");
  },
);

loggedInCommands.command(
  "logout",
  "Termina tu sesión con el bot",
  async (ctx) => {
    await ctx.setMyCommands(loggedOutCommands);
    await ctx.reply("Hasta luego :)");
  },
);

bot.use(loggedInCommands);
bot.use(loggedOutCommands);

// Por defecto, los usuarios no están logueados,
// para que puedas establecer los comandos de cierre de sesión para todos
await loggedOutCommands.setCommands(bot);
```

:::

De esta forma, cuando un usuario llame a `/login`, su lista de comandos cambiará para contener sólo el comando `logout`.
Genial, ¿verdad?

::: danger Restricciones en los Nombres de Comandos
Como se indica en la [Telegram Bot API documentation](https://core.telegram.org/bots/api#botcommand), los nombres de los comandos deben constar de:

1. Entre 1 y 32 caracteres.
2. Sólo letras minúsculas inglesas (a-z), dígitos (0-9) y guiones bajos (_).

Por lo tanto, llamar a `setCommands` o `setMyCommands` con nombres de comandos inválidos lanzará una excepción.
Los comandos que no sigan estas reglas podrán registrarse y manejarse, pero no aparecerán en el menú de comandos del usuario.
:::

**Ten en cuenta** que `setCommands` y `setMyCommands` sólo afectan a los comandos mostrados en el menú de comandos del usuario, y no al acceso real a los mismos.
Aprenderás cómo implementar el acceso restringido a comandos en la sección [Comandos restringidos](#comandos-de-ambito).

### Agrupando comandos

Dado que podemos dividir y agrupar nuestros comandos en diferentes instancias, permite una organización de archivos de comandos mucho más idiomática.

Digamos que queremos tener comandos sólo para desarrolladores.
Podemos lograrlo con la siguiente estructura de código:

```ascii
.
├── bot.ts
├── types.ts
└── commands/
    ├── admin.ts
    └── users/
        ├── group.ts
        ├── say-hello.ts
        └── say-bye.ts
```

El siguiente grupo de código ejemplifica cómo podríamos implementar un grupo de comandos sólo para desarrolladores, y actualizar el menú de comandos del cliente de Telegram en consecuencia.
Asegúrate de fijarte en los diferentes patrones utilizados en los archivos `admin.ts` y `group.ts`.

::: code-group

```ts [bot.ts]
import { devCommands } from "./commands/admin.ts";
import { userCommands } from "./commands/users/group.ts";
import type { MyContext } from "./types.ts";

export const bot = new Bot<MyContext>(""); // <-- pon tu bot token entre los "" (https://t.me/BotFather)

bot.use(commands());

bot.use(userCommands);
bot.filter((ctx) => ctx.from?.id == /** Pon aquí tu ID **/)
      .use(devCommands);
```

```ts [types.ts]
import type { Context } from "grammy";

export type MyContext = CommandsFlavor<Context>;
```

```ts [admin.ts]
import { userCommands } from './users/group.ts';
import type { MyContext } from '../types.ts';

export const devCommands = new CommandGroup<MyContext>();

devCommands.command("devlogin", "Poner el menú de comandos en modo desarrollo", async (ctx, next) => {
  await ctx.reply("¡Hola, compañero desarrollador! ¿Tomamos café hoy también?");
  await ctx.setMyCommands(userCommands, devCommands);
});

devCommands.command("usercount", "Mostrar recuento de usuarios", async (ctx, next) => {
  await ctx.reply(`Total de usuarios: ${/** Su lógica de negocio */}`);
});

devCommands.command("devlogout", "Restablecer el menú de comandos en modo usuario", async (ctx, next) => {
  await ctx.reply("¡Hasta el próximo compromiso!");
  await ctx.setMyCommands(userCommands);
});
```

```ts [group.ts]
import sayHello from "./say-hello.ts";
import sayBye from "./say-bye.ts";
import type { MyContext } from "../../types.ts";

export const userCommands = new CommandGroup<MyContext>()
  .add([sayHello, sayBye]);
```

```ts [say-hello.ts]
import type { MyContext } from "../../types.ts";

export default new Command<MyContext>("hello", "Di hola", async (ctx) => {
  await ctx.reply("¡Hola, pequeño usuario!");
});
```

```ts [say-bye.ts]
import type { MyContext } from "../../types.ts";

export default new Command<MyContext>("bye", "Di adiós", async (ctx) => {
  await ctx.reply("Adiós :)");
});
```

:::

¿Sabías que, como se muestra en el ejemplo anterior, puedes crear comandos utilizando el método `.command(...)` directamente o registrando `Commands` inicializados en una instancia `CommandGroup` con el método `.add`?
Este enfoque te permite mantener todo en un solo archivo, como en `admin.ts`, u organizar tus comandos en varios archivos, como en `group.ts`.

::: tip Utiliza siempre grupos de comandos

Al crear y exportar comandos utilizando el constructor `Command`, es obligatorio registrarlos en una instancia `CommandGroup` mediante el método `.add`.
Por sí solos son inútiles, así que asegúrate de hacerlo en algún momento.

:::

El plugin también se asegura de que un `CommandGroup` y sus `Commands` compartan el mismo tipo de `Context`, ¡para que puedas evitar ese tipo de errores tontos a primera vista!
Combinando este conocimiento con la siguiente sección conseguirás llevar tu juego de comandos al siguiente nivel.

## Comandos de ámbito

¿Sabías que puedes mostrar diferentes comandos en varios chats basándote en el tipo de chat, idioma, e incluso el estado del usuario dentro de un grupo de chat?
Eso es a lo que Telegram se refiere como [**Ámbitos de Comandos**](https://core.telegram.org/bots/features#command-scopes).

Ahora bien, los ámbitos de comandos son una característica interesante, pero usarlos a mano puede ser realmente complicado, ya que es difícil hacer un seguimiento de todos los ámbitos y los comandos que presentan.
Además, al utilizar ámbitos de comandos por sí solos, tienes que hacer un filtrado manual dentro de cada comando para asegurarte de que se ejecutan sólo para los ámbitos correctos.
Sincronizar esas dos cosas puede ser una pesadilla, por eso existe este plugin.
Veamos cómo se hace.

La clase `Command` devuelta por el método `command` expone un método llamado `addToScope`.
Este método toma un [`BotCommandScope`](/ref/types/botcommandscope) junto con uno o más handlers, y registra esos handlers para ser ejecutados en ese scope específico.

Ni siquiera tienes que preocuparte de llamar a `filter`, el método `addToScope` garantizará que tu handler sólo sea llamado si el contexto es el correcto.

Este es un ejemplo de un comando con ámbito:

```ts
const myCommands = new CommandGroup();

myCommands
  .command("hello", "Di hola")
  .addToScope(
    { type: "all_group_chats" },
    (ctx) => ctx.reply(`Hola, miembros de ${ctx.chat.title}!`),
  )
  .addToScope(
    { type: "all_private_chats" },
    (ctx) => ctx.reply(`Hola, ${ctx.chat.first_name}!`),
  );
```

El comando `hello` ahora puede ser llamado tanto desde chats privados como de grupo, y dará una respuesta diferente dependiendo desde donde se llame.
Ahora, si llamas a `myCommands.setCommands`, el menú del comando `hello` se mostrará tanto en los chats privados como en los de grupo.

Aquí tienes un ejemplo de un comando al que sólo pueden acceder los administradores de grupo.

```js
adminCommands
  .command("secret", "Sólo para administradores")
  .addToScope(
    { type: "all_chat_administrators" },
    (ctx) => ctx.reply("¡Pastel gratis!"),
  );
```

Y aquí hay un ejemplo de un comando que sólo es accesible en grupos.

```js
groupCommands
  .command("fun", "Risa")
  .addToScope(
    { type: "all_group_chats" },
    (ctx) => ctx.reply("Jaja"),
  );
```

Observa que el método `command` también puede recibir el manejador.
Si le das un manejador, ese manejador se aplicará al ámbito `default` de ese comando.
Llamando a `addToScope` en ese comando se añadirá un nuevo manejador, que será filtrado para ese ámbito.
Echa un vistazo a este ejemplo.

```ts
myCommands
  .command(
    "default",
    "Default command",
    // Se llamará cuando no se esté en un chat de grupo
    (ctx) => ctx.reply("Hello from default scope"),
  )
  .addToScope(
    { type: "all_chat_administrators" },
    // Esto será llamado para los administradores de grupo, cuando estén dentro de ese grupo
    (ctx) => ctx.reply("Hello, admin!"),
  )
  .addToScope(
    { type: "all_group_chats" },
    // Esto sólo se llamará para los usuarios no administradores de un grupo
    (ctx) => ctx.reply("Hello, group chat!"),
  );
```

## Traducciones de comandos

Otra potente función es la posibilidad de establecer diferentes nombres y sus respectivas descripciones para el mismo comando en función del idioma del usuario.
El plugin de comandos lo hace fácil proporcionando el método `localize`.
Compruébalo:

```js
myCommands
  // Debe establecer un nombre y una descripción por defecto
  .command("hello", "Di hola")
  // Y luego puede establecer los localizados
  .localize("pt", "ola", "Dizer olá");
```

¡Añade tantos como quieras!
El plugin se encargará de registrarlos por ti cuando llames a `myCommands.setCommands`.

Por conveniencia, grammY exporta un objeto tipo `LanguageCodes`, que puedes usar para crear una aproximación más idiomática.

::: code-group

```ts [TypeScript]
import { LanguageCodes } from "@grammyjs/commands";

myCommands.command(
  "chef",
  "Entrega de filetes",
  (ctx) => ctx.reply("¡Filete al plato!"),
)
  .localize(
    LanguageCodes.Spanish,
    "cocinero",
    "Filete a domicilio",
  );
```

```js [JavaScript]
const { LanguageCodes } = require("@grammyjs/commands");

myCommands.command(
  "chef",
  "Entrega de filetes",
  (ctx) => ctx.reply("¡Filete al plato!"),
)
  .localize(
    LanguageCodes.Spanish,
    "cocinero",
    "Filete a domicilio",
  );
```

```ts [Deno]
import { LanguageCodes } from "https://deno.land/x/grammy_commands/mod.ts";

myCommands.command(
  "chef",
  "Entrega de filetes",
  (ctx) => ctx.reply("¡Filete al plato!"),
)
  .localize(
    LanguageCodes.Spanish,
    "cocinero",
    "Filete a domicilioo",
  );
```

:::

### Localización de comandos con el plugin de internacionalización

Si desea que los nombres y descripciones de los comandos localizados se incluyan en los archivos `.ftl`, puede utilizar el siguiente método:

```ts
function addLocalizations(command: Command) {
  i18n.locales.forEach((locale) => {
    command.localize(
      locale,
      i18n.t(locale, `${command.name}.command`),
      i18n.t(locale, `${command.name}.description`),
    );
  });
  return command;
}

myCommands.commands.forEach(addLocalizations);
```

## Encontrar el comando más cercano

Telegram autocompleta los comandos registrados mientras se escribe.
Sin embargo, a veces los usuarios siguen escribiendo estos comandos completamente a mano y pueden cometer errores.

Para ayudar con esto, el plugin de comandos sugiere un comando que el usuario podría haber intentado utilizar.

Esta funcionalidad funciona con prefijos personalizados, por lo que no tienes que preocuparte por la compatibilidad.
Además, es fácil de usar.

::: code-group

```ts [TypeScript]
// Utilice el flavor para crear un contexto personalizado
type MyContext = Context & CommandsFlavor;

// Utiliza el nuevo contexto para instanciar tu bot
const bot = new Bot<MyContext>(""); // <-- pon tu bot token entre los "" (https://t.me/BotFather)
const myCommands = new CommandGroup<MyContext>();

// ... Registre los comandos

bot
  // Comprobar si existe un comando
  .filter(commandNotFound(myCommands))
  // Si es así, significa que no fue manejado por ninguno de nuestros comandos
  .use(async (ctx) => {
    // Encontramos una coincidencia potencial
    if (ctx.commandSuggestion) {
      return ctx.reply(
        `Hmm... No conozco ese comando. ¿Te refieres a ${ctx.commandSuggestion}?`,
      );
    }

    // Nada parece acercarse a lo que el usuario escribió
    await ctx.reply("Uy... No conozco ese comando :/");
  });
```

```js [JavaScript]
const bot = new Bot(""); // <-- pon tu bot token entre los "" (https://t.me/BotFather)
const myCommands = new CommandGroup();

// ... Registre los comandos

bot
  // Comprobar si existe un comando
  .filter(commandNotFound(myCommands))
  // Si es así, significa que no fue manejado por ninguno de nuestros comandos
  .use(async (ctx) => {
    // Encontramos una coincidencia potencial
    if (ctx.commandSuggestion) {
      return ctx.reply(
        `Hmm... No conozco ese comando. ¿Te refieres a ${ctx.commandSuggestion}?`,
      );
    }

    // Nada parece acercarse a lo que el usuario escribió
    await ctx.reply("Uy... No conozco ese comando :/");
  });
```

:::

El predicado `commandNotFound` toma algunas opciones para personalizar su comportamiento:

- `ignoreLocalization`: No priorizar comandos que coincidan con el idioma del usuario.
- `ignoreCase`: Permite al complemento ignorar las mayúsculas y minúsculas cuando busca comandos similares.
- `similarityThreshold`: Determina la similitud entre el nombre de un comando y la entrada del usuario para que se sugiera.

Además, puedes buscar en varias instancias de `CommandGroup` proporcionando una matriz de `CommandGroup` en lugar de una sola instancia.

La función `commandNotFound` sólo se activará para actualizaciones que contengan texto similar a comandos registrados.
Por ejemplo, si sólo tienes registrados [comandos con un prefijo personalizado](#prefijo) como `?`, se activará el controlador para cualquier cosa que se parezca a tus comandos, por ejemplo `?sayhi` pero no `/definitivamente_un_comando`.

Lo mismo ocurre a la inversa, si sólo tienes comandos con el prefijo por defecto, sólo se activará en las actualizaciones que se parezcan a `/regular` y `/commands`.

Los comandos recomendados sólo vendrán de las instancias `CommandGroup` que pases a la función.
Esto significa que puedes separar las comprobaciones en múltiples filtros independientes.

Ahora, apliquemos esto al siguiente ejemplo.

```ts
const myCommands = new CommandGroup();
myCommands.command("dad", "calls dad", () => {}, { prefix: "?" })
  .localize("es", "papa", "llama a papa")
  .localize("fr", "pere", "appelle papa");

const otherCommands = new CommandGroup();
otherCommands.command("bread", "eat a toast", () => {})
  .localize("es", "pan", "come un pan")
  .localize("fr", "pain", "manger du pain");

bot.use(myCommands);
bot.use(otherCommands);

// Supongamos que el usuario es francés y ha escrito '/Papi'
bot
  // Este filtro se activará para cualquier texto similar a un comando, como '/regular' o '?custom'.
  .filter(commandNotFound([myCommands, otherCommands], {
    ignoreLocalization: true,
    ignoreCase: true,
  }))
  .use(async (ctx) => {
    ctx.commandSuggestion === "?papa"; // Evalúa a verdadero
  });
```

Si `ignoreLocalization` estuviera en false, entonces `ctx.commandSuggestion` sería igual a `/pain`.

También podríamos añadir más filtros similares al mencionado anteriormente utilizando diferentes parámetros o `CommandGroup`s para comprobar.

Hay muchas posibilidades de personalización.

## Opciones de comandos

Hay algunas opciones que se pueden especificar por comando, por ámbito, o globalmente para una instancia `CommandGroup`.
Estas opciones te permiten personalizar aún más cómo tu bot maneja los comandos, dándote más flexibilidad.

### `ignoreCase`

Por defecto, los comandos coinciden con las entradas del usuario distinguiendo entre mayúsculas y minúsculas.
Cuando esta opción está activada, un comando como `/dandy` coincidirá con variaciones como `/DANDY` o `/dandY`, independientemente de mayúsculas y minúsculas.

### `targetedCommands`

Cuando los usuarios invocan un comando, pueden etiquetar opcionalmente su bot, de la siguiente manera: `/comando@nombre_usuario_bot`.
Puedes decidir qué hacer con estos comandos utilizando la opción de configuración `targetedCommands`.
Con esta opción, puede elegir entre tres comportamientos diferentes:

- `ignored`: Ignora los comandos que mencionan el nombre de usuario de tu bot.
- `optional`: Maneja tanto los comandos que mencionan el nombre de usuario del bot como los que no.
- `required`: Sólo gestiona los comandos que mencionan el nombre de usuario del bot.

### `prefix`

Actualmente, sólo los comandos que empiezan por `/` son reconocidos por Telegram y, en consecuencia, por el [manejo de comandos realizado por la librería central grammY](../guide/commands).
En algunas ocasiones, puede que quieras cambiar eso y usar un prefijo personalizado para tu bot.
Esto es posible gracias a la opción `prefix`, que le dirá al plugin de comandos que busque ese prefijo cuando intente identificar un comando.

Si alguna vez necesitas recuperar entidades `botCommand` de una actualización y necesitas que se hidraten con el prefijo personalizado que has registrado, existe un método específicamente adaptado para ello, llamado `ctx.getCommandEntities(yourCommands)`, que devuelve la misma interfaz que `ctx.entities('bot_command')`.

::: danger

Los comandos con prefijos personalizados no pueden mostrarse en el Menú Comandos.

:::

### `matchOnlyAtStart`

Cuando [maneja comandos](../guía/comandos), la biblioteca central de grammY reconoce comandos sólo si empiezan en el primer carácter de un mensaje.
El plugin de comandos, sin embargo, te permite escuchar comandos en medio del texto del mensaje, o al final, ¡no importa!
Simplemente establece la opción `matchOnlyAtStart` en `false`, y el complemento se encargará del resto.

## Comandos RegExp

Esta función es para aquellos que quieren ir salvaje.
Permite crear manejadores de comandos basados en expresiones regulares en lugar de cadenas estáticas.
Un ejemplo básico sería el siguiente:

```ts
myCommands
  .command(
    /delete_([a-zA-Z]+)/,
    (ctx) => ctx.reply(`Deleting ${ctx.msg?.text?.split("_")[1]}`),
  );
```

Este gestor de órdenes se activará tanto en `/delete_me` como en `/delete_you`, y responderá `Delete me` en el primer caso y `Delete you` en el segundo, pero no se activará en `/delete_` ni en `/delete_123xyz`, pasando como si no estuviera.

## Plugin Summary

- Name: `commands`
- [Source](https://github.com/grammyjs/commands)
- [Reference](/ref/commands/)
